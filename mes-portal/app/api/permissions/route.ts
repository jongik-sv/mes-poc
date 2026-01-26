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
  type: string
  resource: string
  action: string
  description: string | null
  isActive: boolean
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
    const type = searchParams.get('type')
    const isActiveParam = searchParams.get('isActive')

    // where 조건 구성
    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
      ]
    }
    if (type) {
      where.type = type
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
      orderBy: [{ type: 'asc' }, { code: 'asc' }],
      include: {
        _count: {
          select: {
            rolePermissions: true,
          },
        },
      },
    })

    const items: PermissionListItem[] = permissions.map((perm) => ({
      id: perm.id,
      code: perm.code,
      name: perm.name,
      type: perm.type,
      resource: perm.resource,
      action: perm.action,
      description: perm.description,
      isActive: perm.isActive,
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
  code: string
  name: string
  type: 'MENU' | 'SCREEN' | 'API' | 'DATA'
  resource: string
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
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

    const body: CreatePermissionDto = await request.json()

    // 필수 필드 검증
    if (!body.code || !body.name || !body.type || !body.resource || !body.action) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'code, name, type, resource, action은 필수입니다',
          },
        },
        { status: 400 }
      )
    }

    // 중복 코드 검사
    const existing = await prisma.permission.findUnique({
      where: { code: body.code },
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
        code: body.code,
        name: body.name,
        type: body.type,
        resource: body.resource,
        action: body.action,
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
        userId: parseInt(session.user.id),
        action: 'PERMISSION_CREATE',
        resource: 'Permission',
        resourceId: String(permission.id),
        details: JSON.stringify({ code: permission.code, name: permission.name }),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: permission.id,
          code: permission.code,
          name: permission.name,
          type: permission.type,
          resource: permission.resource,
          action: permission.action,
          description: permission.description,
          isActive: permission.isActive,
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
