/**
 * 시스템 API 엔드포인트
 *
 * GET /api/systems - 시스템 목록 조회
 * POST /api/systems - 시스템 생성
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

interface SystemListItem {
  systemId: string
  name: string
  domain: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  menuSetsCount: number
  rolesCount: number
  menusCount: number
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * GET /api/systems
 * 시스템 목록 조회 (페이징, 검색, 필터)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PaginatedResponse<SystemListItem>>>> {
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
    const isActiveParam = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { domain: { contains: search } },
      ]
    }
    if (isActiveParam !== null && isActiveParam !== '') {
      where.isActive = isActiveParam === 'true'
    }

    const total = await prisma.system.count({ where })

    const systems = await prisma.system.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            menuSets: true,
            roles: true,
            menus: true,
          },
        },
      },
    })

    const items: SystemListItem[] = systems.map((s: Record<string, unknown> & { _count: { menuSets: number; roles: number; menus: number } }) => ({
      systemId: s.systemId as string,
      name: s.name as string,
      domain: s.domain as string,
      description: s.description as string | null,
      isActive: s.isActive as boolean,
      createdAt: s.createdAt as Date,
      updatedAt: s.updatedAt as Date,
      menuSetsCount: s._count.menuSets,
      rolesCount: s._count.roles,
      menusCount: s._count.menus,
    }))

    return NextResponse.json({
      success: true,
      data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    })
  } catch (error) {
    console.error('GET /api/systems error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}

interface CreateSystemDto {
  systemId: string
  name: string
  domain: string
  description?: string
}

/**
 * POST /api/systems
 * 시스템 생성 (관리자 전용)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<SystemListItem>>> {
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

    const body: CreateSystemDto = await request.json()

    if (!body.systemId || !body.name || !body.domain) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'systemId, name, domain은 필수입니다' },
        },
        { status: 400 }
      )
    }

    // 중복 systemId 검사
    const existingById = await prisma.system.findUnique({
      where: { systemId: body.systemId },
    })
    if (existingById) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'DUPLICATE', message: '이미 존재하는 시스템 ID입니다' },
        },
        { status: 409 }
      )
    }

    // 중복 domain 검사
    const existingByDomain = await prisma.system.findUnique({
      where: { domain: body.domain },
    })
    if (existingByDomain) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'DUPLICATE', message: '이미 존재하는 도메인입니다' },
        },
        { status: 409 }
      )
    }

    // 트랜잭션으로 시스템 생성 + 이력 + 감사 로그
    const system = await prisma.$transaction(async (tx) => {
      const created = await tx.system.create({
        data: {
          systemId: body.systemId,
          name: body.name,
          domain: body.domain,
          description: body.description || null,
        },
      })

      await tx.systemHistory.create({
        data: {
          systemId: created.systemId,
          name: created.name,
          domain: created.domain,
          description: created.description,
          isActive: true,
          changeType: 'CREATE',
          changedBy: session.user!.id,
        },
      })

      await tx.auditLog.create({
        data: {
          userId: session.user!.id,
          action: 'SYSTEM_CREATE',
          resource: 'System',
          resourceId: created.systemId,
          details: JSON.stringify({ name: created.name, domain: created.domain }),
          status: 'SUCCESS',
        },
      })

      return created
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          systemId: system.systemId,
          name: system.name,
          domain: system.domain,
          description: system.description,
          isActive: system.isActive,
          createdAt: system.createdAt,
          updatedAt: system.updatedAt,
          menuSetsCount: 0,
          rolesCount: 0,
          menusCount: 0,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/systems error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}
