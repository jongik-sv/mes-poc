/**
 * 역할 API 엔드포인트 (TSK-03-01)
 *
 * GET /api/roles - 역할 목록 조회
 * POST /api/roles - 역할 생성
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

interface RoleListItem {
  id: number
  code: string
  name: string
  description: string | null
  parentRoleId: number | null
  level: number
  isSystem: boolean
  isActive: boolean
  systemId: string
  permissionCount: number
  roleGroupCount: number
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * GET /api/roles
 * 역할 목록 조회 (페이징, 검색, 필터)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PaginatedResponse<RoleListItem>>>> {
  try {
    // 세션 검증
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        },
        { status: 401 }
      )
    }

    // 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const isActiveParam = searchParams.get('isActive')

    // where 조건 구성
    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { roleCd: { contains: search } },
        { name: { contains: search } },
      ]
    }
    if (isActiveParam !== null && isActiveParam !== '') {
      where.isActive = isActiveParam === 'true'
    }

    // 전체 개수 조회
    const total = await prisma.role.count({ where })

    // 역할 목록 조회
    const roles = await prisma.role.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ level: 'asc' }, { roleId: 'asc' }],
      include: {
        _count: {
          select: {
            rolePermissions: true,
            roleGroupRoles: true,
          },
        },
      },
    })

    const items: RoleListItem[] = roles.map((role) => ({
      id: role.roleId,
      code: role.roleCd,
      name: role.name,
      description: role.description,
      parentRoleId: role.parentRoleId,
      level: role.level,
      isSystem: role.isSystem,
      isActive: role.isActive,
      systemId: role.systemId,
      permissionCount: role._count.rolePermissions,
      roleGroupCount: role._count.roleGroupRoles,
    }))

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('GET /api/roles error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DB_ERROR',
          message: '데이터베이스 오류가 발생했습니다',
        },
      },
      { status: 500 }
    )
  }
}

interface CreateRoleDto {
  roleCd: string
  name: string
  systemId: string
  description?: string
  parentRoleId?: number
  isActive?: boolean
}

/**
 * POST /api/roles
 * 역할 생성
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<RoleListItem>>> {
  try {
    // 세션 검증
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        },
        { status: 401 }
      )
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { userId: session.user.id },
      include: {
        userRoleGroups: {
          include: {
            roleGroup: {
              include: {
                roleGroupRoles: {
                  include: { role: true },
                },
              },
            },
          },
        },
      },
    })

    const isAdmin = user?.userRoleGroups.some((urg) =>
      urg.roleGroup.roleGroupRoles.some((rgr) => rgr.role.roleCd === 'SYSTEM_ADMIN')
    )
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '관리자 권한이 필요합니다',
          },
        },
        { status: 403 }
      )
    }

    const body: CreateRoleDto = await request.json()

    // 필수 필드 검증
    if (!body.roleCd || !body.name || !body.systemId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'roleCd, name, systemId는 필수입니다',
          },
        },
        { status: 400 }
      )
    }

    // 중복 코드 검사
    const existing = await prisma.role.findUnique({
      where: { roleCd: body.roleCd },
    })
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_CODE',
            message: '이미 존재하는 역할 코드입니다',
          },
        },
        { status: 409 }
      )
    }

    // 부모 역할 레벨 조회 (있는 경우)
    let level = 0
    if (body.parentRoleId) {
      const parent = await prisma.role.findUnique({
        where: { roleId: body.parentRoleId },
      })
      if (parent) {
        level = parent.level + 1
      }
    }

    // 역할 생성
    const role = await prisma.role.create({
      data: {
        roleCd: body.roleCd,
        name: body.name,
        systemId: body.systemId,
        description: body.description || null,
        parentRoleId: body.parentRoleId || null,
        level,
        isSystem: false,
        isActive: body.isActive !== false,
      },
      include: {
        _count: {
          select: {
            rolePermissions: true,
            roleGroupRoles: true,
          },
        },
      },
    })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ROLE_CREATE',
        resource: 'Role',
        resourceId: String(role.roleId),
        details: JSON.stringify({ code: role.roleCd, name: role.name }),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: role.roleId,
          code: role.roleCd,
          name: role.name,
          description: role.description,
          parentRoleId: role.parentRoleId,
          level: role.level,
          isSystem: role.isSystem,
          isActive: role.isActive,
          systemId: role.systemId,
          permissionCount: role._count.rolePermissions,
          roleGroupCount: role._count.roleGroupRoles,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/roles error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DB_ERROR',
          message: '데이터베이스 오류가 발생했습니다',
        },
      },
      { status: 500 }
    )
  }
}
