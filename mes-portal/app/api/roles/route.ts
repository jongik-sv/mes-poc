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
  parentId: number | null
  level: number
  isSystem: boolean
  isActive: boolean
  permissionCount: number
  userCount: number
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
        { code: { contains: search } },
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
      orderBy: [{ level: 'asc' }, { id: 'asc' }],
      include: {
        _count: {
          select: {
            rolePermissions: true,
            userRoles: true,
          },
        },
      },
    })

    const items: RoleListItem[] = roles.map((role) => ({
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      parentId: role.parentId,
      level: role.level,
      isSystem: role.isSystem,
      isActive: role.isActive,
      permissionCount: role._count.rolePermissions,
      userCount: role._count.userRoles,
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
  code: string
  name: string
  description?: string
  parentId?: number
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
      where: { id: parseInt(session.user.id) },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    })

    const isAdmin = user?.userRoles.some(
      (ur) => ur.role.code === 'SYSTEM_ADMIN'
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
    if (!body.code || !body.name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'code와 name은 필수입니다',
          },
        },
        { status: 400 }
      )
    }

    // 중복 코드 검사
    const existing = await prisma.role.findUnique({
      where: { code: body.code },
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
    if (body.parentId) {
      const parent = await prisma.role.findUnique({
        where: { id: body.parentId },
      })
      if (parent) {
        level = parent.level + 1
      }
    }

    // 역할 생성
    const role = await prisma.role.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description || null,
        parentId: body.parentId || null,
        level,
        isSystem: false,
        isActive: body.isActive !== false,
      },
      include: {
        _count: {
          select: {
            rolePermissions: true,
            userRoles: true,
          },
        },
      },
    })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id),
        action: 'ROLE_CREATE',
        resource: 'Role',
        resourceId: String(role.id),
        details: JSON.stringify({ code: role.code, name: role.name }),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: role.id,
          code: role.code,
          name: role.name,
          description: role.description,
          parentId: role.parentId,
          level: role.level,
          isSystem: role.isSystem,
          isActive: role.isActive,
          permissionCount: role._count.rolePermissions,
          userCount: role._count.userRoles,
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
