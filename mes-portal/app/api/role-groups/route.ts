/**
 * 역할그룹 API 엔드포인트
 *
 * GET /api/role-groups - 역할그룹 목록 조회
 * POST /api/role-groups - 역할그룹 생성
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

interface RoleGroupListItem {
  id: number
  systemId: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  roleCount: number
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
 * GET /api/role-groups
 * 역할그룹 목록 조회 (페이징, 검색, 필터)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PaginatedResponse<RoleGroupListItem>>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const systemId = searchParams.get('systemId') || ''
    const isActiveParam = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { roleGroupCd: { contains: search } },
        { name: { contains: search } },
      ]
    }
    if (systemId) {
      where.systemId = systemId
    }
    if (isActiveParam !== null && isActiveParam !== '') {
      where.isActive = isActiveParam === 'true'
    }

    const total = await prisma.roleGroup.count({ where })

    const roleGroups = await prisma.roleGroup.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ roleGroupId: 'asc' }],
      include: {
        _count: {
          select: {
            roleGroupRoles: true,
            userRoleGroups: true,
          },
        },
      },
    })

    const items: RoleGroupListItem[] = roleGroups.map((rg: {
      roleGroupId: number
      systemId: string
      roleGroupCd: string
      name: string
      description: string | null
      isActive: boolean
      _count: { roleGroupRoles: number; userRoleGroups: number }
    }) => ({
      id: rg.roleGroupId,
      systemId: rg.systemId,
      code: rg.roleGroupCd,
      name: rg.name,
      description: rg.description,
      isActive: rg.isActive,
      roleCount: rg._count.roleGroupRoles,
      userCount: rg._count.userRoleGroups,
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
    console.error('GET /api/role-groups error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}

interface CreateRoleGroupDto {
  roleGroupCd: string
  name: string
  systemId: string
  description?: string
  isActive?: boolean
}

/**
 * POST /api/role-groups
 * 역할그룹 생성
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<RoleGroupListItem>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        },
        { status: 401 }
      )
    }

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

    const isAdmin = user?.userRoleGroups.some((urg: { roleGroup: { roleGroupRoles: Array<{ role: { roleCd: string } }> } }) =>
      urg.roleGroup.roleGroupRoles.some((rgr: { role: { roleCd: string } }) => rgr.role.roleCd === 'SYSTEM_ADMIN')
    )
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다' },
        },
        { status: 403 }
      )
    }

    const body: CreateRoleGroupDto = await request.json()

    if (!body.roleGroupCd || !body.name || !body.systemId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'roleGroupCd, name, systemId는 필수입니다' },
        },
        { status: 400 }
      )
    }

    const existing = await prisma.roleGroup.findUnique({
      where: { roleGroupCd: body.roleGroupCd },
    })
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'DUPLICATE_CODE', message: '이미 존재하는 역할그룹 코드입니다' },
        },
        { status: 409 }
      )
    }

    const roleGroup = await prisma.$transaction(async (tx: {
      roleGroup: { create: typeof prisma.roleGroup.create }
      roleGroupHistory: { create: typeof prisma.roleGroupHistory.create }
    }) => {
      const created = await tx.roleGroup.create({
        data: {
          roleGroupCd: body.roleGroupCd,
          name: body.name,
          systemId: body.systemId,
          description: body.description || null,
          isActive: body.isActive !== false,
        },
        include: {
          _count: {
            select: {
              roleGroupRoles: true,
              userRoleGroups: true,
            },
          },
        },
      })

      await tx.roleGroupHistory.create({
        data: {
          roleGroupId: created.roleGroupId,
          systemId: created.systemId,
          roleGroupCd: created.roleGroupCd,
          name: created.name,
          description: created.description,
          isActive: created.isActive,
          changeType: 'CREATE',
          changedBy: session.user!.id,
        },
      })

      return created
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: roleGroup.roleGroupId,
          systemId: roleGroup.systemId,
          code: roleGroup.roleGroupCd,
          name: roleGroup.name,
          description: roleGroup.description,
          isActive: roleGroup.isActive,
          roleCount: roleGroup._count.roleGroupRoles,
          userCount: roleGroup._count.userRoleGroups,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/role-groups error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}
