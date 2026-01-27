/**
 * 시스템 상세 API 엔드포인트
 *
 * GET /api/systems/:id - 시스템 상세 조회
 * PUT /api/systems/:id - 시스템 수정
 * DELETE /api/systems/:id - 시스템 소프트 삭제
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

interface SystemDetail {
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

type RouteContext = { params: Promise<{ id: string }> }

async function checkAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { userId },
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

  return user?.userRoleGroups.some((urg: { roleGroup: { roleGroupRoles: Array<{ role: { roleCd: string } }> } }) =>
    urg.roleGroup.roleGroupRoles.some((rgr: { role: { roleCd: string } }) => rgr.role.roleCd === 'SYSTEM_ADMIN')
  ) ?? false
}

/**
 * GET /api/systems/:id
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<SystemDetail>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      )
    }

    const { id } = await params

    const system = await prisma.system.findUnique({
      where: { systemId: id },
      include: {
        _count: {
          select: { menuSets: true, roles: true, menus: true },
        },
      },
    })

    if (!system) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '시스템을 찾을 수 없습니다' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        systemId: system.systemId,
        name: system.name,
        domain: system.domain,
        description: system.description,
        isActive: system.isActive,
        createdAt: system.createdAt,
        updatedAt: system.updatedAt,
        menuSetsCount: system._count.menuSets,
        rolesCount: system._count.roles,
        menusCount: system._count.menus,
      },
    })
  } catch (error) {
    console.error('GET /api/systems/:id error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' } },
      { status: 500 }
    )
  }
}

interface UpdateSystemDto {
  name?: string
  domain?: string
  description?: string
  isActive?: boolean
}

/**
 * PUT /api/systems/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<SystemDetail>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      )
    }

    if (!(await checkAdmin(session.user.id))) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다' } },
        { status: 403 }
      )
    }

    const { id } = await params
    const body: UpdateSystemDto = await request.json()

    const existing = await prisma.system.findUnique({ where: { systemId: id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '시스템을 찾을 수 없습니다' } },
        { status: 404 }
      )
    }

    // domain 중복 검사 (변경 시)
    if (body.domain && body.domain !== existing.domain) {
      const dupDomain = await prisma.system.findUnique({ where: { domain: body.domain } })
      if (dupDomain && dupDomain.systemId !== id) {
        return NextResponse.json(
          { success: false, error: { code: 'DUPLICATE', message: '이미 존재하는 도메인입니다' } },
          { status: 409 }
        )
      }
    }

    const system = await prisma.$transaction(async (tx) => {
      const updated = await tx.system.update({
        where: { systemId: id },
        data: {
          name: body.name ?? existing.name,
          domain: body.domain ?? existing.domain,
          description: body.description ?? existing.description,
          isActive: body.isActive ?? existing.isActive,
        },
        include: {
          _count: { select: { menuSets: true, roles: true, menus: true } },
        },
      })

      await tx.systemHistory.create({
        data: {
          systemId: updated.systemId,
          name: updated.name,
          domain: updated.domain,
          description: updated.description,
          isActive: updated.isActive,
          changeType: 'UPDATE',
          changedBy: session.user!.id,
        },
      })

      await tx.auditLog.create({
        data: {
          userId: session.user!.id,
          action: 'SYSTEM_UPDATE',
          resource: 'System',
          resourceId: updated.systemId,
          details: JSON.stringify(body),
          status: 'SUCCESS',
        },
      })

      return updated
    })

    return NextResponse.json({
      success: true,
      data: {
        systemId: system.systemId,
        name: system.name,
        domain: system.domain,
        description: system.description,
        isActive: system.isActive,
        createdAt: system.createdAt,
        updatedAt: system.updatedAt,
        menuSetsCount: system._count.menuSets,
        rolesCount: system._count.roles,
        menusCount: system._count.menus,
      },
    })
  } catch (error) {
    console.error('PUT /api/systems/:id error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' } },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/systems/:id
 * 소프트 삭제 (isActive=false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      )
    }

    if (!(await checkAdmin(session.user.id))) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다' } },
        { status: 403 }
      )
    }

    const { id } = await params

    const existing = await prisma.system.findUnique({ where: { systemId: id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '시스템을 찾을 수 없습니다' } },
        { status: 404 }
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.system.update({
        where: { systemId: id },
        data: { isActive: false },
      })

      await tx.systemHistory.create({
        data: {
          systemId: existing.systemId,
          name: existing.name,
          domain: existing.domain,
          description: existing.description,
          isActive: false,
          changeType: 'DELETE',
          changedBy: session.user!.id,
        },
      })

      await tx.auditLog.create({
        data: {
          userId: session.user!.id,
          action: 'SYSTEM_DELETE',
          resource: 'System',
          resourceId: existing.systemId,
          details: JSON.stringify({ name: existing.name }),
          status: 'SUCCESS',
        },
      })
    })

    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    console.error('DELETE /api/systems/:id error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' } },
      { status: 500 }
    )
  }
}
