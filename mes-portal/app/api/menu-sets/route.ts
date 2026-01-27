/**
 * 메뉴셋 API 엔드포인트
 *
 * GET /api/menu-sets - 메뉴셋 목록 조회 (페이징, 필터)
 * POST /api/menu-sets - 메뉴셋 생성 (관리자)
 */

import { NextResponse } from 'next/server'
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

interface MenuSetListItem {
  menuSetId: number
  systemId: string
  menuSetCd: string
  name: string
  description: string | null
  isDefault: boolean
  isActive: boolean
  menuCount: number
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
 * GET /api/menu-sets
 * 메뉴셋 목록 조회 (페이징, 검색, 필터)
 */
export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<PaginatedResponse<MenuSetListItem>>>> {
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
    const systemId = searchParams.get('systemId')
    const isActiveParam = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { menuSetCd: { contains: search } },
        { name: { contains: search } },
      ]
    }
    if (systemId) {
      where.systemId = systemId
    }
    if (isActiveParam !== null && isActiveParam !== '') {
      where.isActive = isActiveParam === 'true'
    }

    const total = await prisma.menuSet.count({ where })

    const menuSets = await prisma.menuSet.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ menuSetId: 'asc' }],
      include: {
        _count: {
          select: {
            menuSetMenus: true,
            userSystemMenuSets: true,
          },
        },
      },
    })

    const items: MenuSetListItem[] = menuSets.map((ms) => ({
      menuSetId: ms.menuSetId,
      systemId: ms.systemId,
      menuSetCd: ms.menuSetCd,
      name: ms.name,
      description: ms.description,
      isDefault: ms.isDefault,
      isActive: ms.isActive,
      menuCount: ms._count.menuSetMenus,
      userCount: ms._count.userSystemMenuSets,
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
    console.error('GET /api/menu-sets error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}

interface CreateMenuSetDto {
  systemId: string
  menuSetCd: string
  name: string
  description?: string
  isDefault?: boolean
  isActive?: boolean
}

/**
 * POST /api/menu-sets
 * 메뉴셋 생성 (관리자)
 */
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<MenuSetListItem>>> {
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
          error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다' },
        },
        { status: 403 }
      )
    }

    const body: CreateMenuSetDto = await request.json()

    // 필수 필드 검증
    if (!body.systemId || !body.menuSetCd || !body.name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'systemId, menuSetCd, name은 필수입니다',
          },
        },
        { status: 400 }
      )
    }

    // 중복 코드 검사
    const existing = await prisma.menuSet.findUnique({
      where: { menuSetCd: body.menuSetCd },
    })
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_CODE',
            message: '이미 존재하는 메뉴셋 코드입니다',
          },
        },
        { status: 409 }
      )
    }

    // 트랜잭션: 생성 + 히스토리
    const menuSet = await prisma.$transaction(async (tx) => {
      const created = await tx.menuSet.create({
        data: {
          systemId: body.systemId,
          menuSetCd: body.menuSetCd,
          name: body.name,
          description: body.description || null,
          isDefault: body.isDefault ?? false,
          isActive: body.isActive !== false,
        },
      })

      await tx.menuSetHistory.create({
        data: {
          menuSetId: created.menuSetId,
          systemId: created.systemId,
          menuSetCd: created.menuSetCd,
          name: created.name,
          description: created.description,
          isDefault: created.isDefault,
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
          menuSetId: menuSet.menuSetId,
          systemId: menuSet.systemId,
          menuSetCd: menuSet.menuSetCd,
          name: menuSet.name,
          description: menuSet.description,
          isDefault: menuSet.isDefault,
          isActive: menuSet.isActive,
          menuCount: 0,
          userCount: 0,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/menu-sets error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}
