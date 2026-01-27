/**
 * 권한 API 엔드포인트 (TSK-03-01)
 *
 * GET /api/permissions - 권한 목록 조회
 * POST /api/permissions - 권한 생성
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

interface PermissionListItem {
  id: number
  code: string
  name: string
  config: string
  description: string | null
  isActive: boolean
  systemId: string
  menuId: number | null
  roleCount: number
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * GET /api/permissions
 * 권한 목록 조회 (페이징, 검색, 필터)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PaginatedResponse<PermissionListItem>>>> {
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
        { permissionCd: { contains: search } },
        { name: { contains: search } },
      ]
    }
    if (isActiveParam !== null && isActiveParam !== '') {
      where.isActive = isActiveParam === 'true'
    }

    // 전체 개수 조회
    const total = await prisma.permission.count({ where })

    // 권한 목록 조회
    const permissions = await prisma.permission.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ permissionCd: 'asc' }],
      include: {
        _count: {
          select: {
            rolePermissions: true,
          },
        },
      },
    })

    const items: PermissionListItem[] = permissions.map((perm) => ({
      id: perm.permissionId,
      code: perm.permissionCd,
      name: perm.name,
      config: perm.config,
      description: perm.description,
      isActive: perm.isActive,
      systemId: perm.systemId,
      menuId: perm.menuId,
      roleCount: perm._count.rolePermissions,
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
    console.error('GET /api/permissions error:', error)
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

interface CreatePermissionDto {
  permissionCd: string
  name: string
  config: string
  systemId: string
  menuId?: number
  description?: string
  isActive?: boolean
}

/**
 * POST /api/permissions
 * 권한 생성
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PermissionListItem>>> {
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

    const body: CreatePermissionDto = await request.json()

    // 필수 필드 검증
    if (!body.permissionCd || !body.name || !body.config || !body.systemId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'permissionCd, name, config, systemId는 필수입니다',
          },
        },
        { status: 400 }
      )
    }

    // 중복 코드 검사
    const existing = await prisma.permission.findUnique({
      where: { permissionCd: body.permissionCd },
    })
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_CODE',
            message: '이미 존재하는 권한 코드입니다',
          },
        },
        { status: 409 }
      )
    }

    // 권한 생성
    const permission = await prisma.permission.create({
      data: {
        permissionCd: body.permissionCd,
        name: body.name,
        config: body.config,
        systemId: body.systemId,
        menuId: body.menuId ?? null,
        description: body.description || null,
        isActive: body.isActive !== false,
      },
      include: {
        _count: {
          select: {
            rolePermissions: true,
          },
        },
      },
    })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PERMISSION_CREATE',
        resource: 'Permission',
        resourceId: String(permission.permissionId),
        details: JSON.stringify({ code: permission.permissionCd, name: permission.name }),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: permission.permissionId,
          code: permission.permissionCd,
          name: permission.name,
          config: permission.config,
          description: permission.description,
          isActive: permission.isActive,
          systemId: permission.systemId,
          menuId: permission.menuId,
          roleCount: permission._count.rolePermissions,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/permissions error:', error)
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
