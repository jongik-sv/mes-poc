/**
 * 메뉴셋 메뉴 할당 API 엔드포인트
 *
 * GET /api/menu-sets/:id/menus - 할당된 메뉴 목록
 * POST /api/menu-sets/:id/menus - 메뉴 할당 (전체 교체)
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

interface AssignedMenu {
  menuId: number
  menuCd: string
  name: string
  category: string
  path: string | null
  isActive: boolean
}

/**
 * GET /api/menu-sets/:id/menus
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<AssignedMenu[]>>> {
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

    const { id } = await params
    const menuSetId = parseInt(id)

    const menuSet = await prisma.menuSet.findUnique({ where: { menuSetId } })
    if (!menuSet) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '메뉴셋을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    const menuSetMenus = await prisma.menuSetMenu.findMany({
      where: { menuSetId },
      include: { menu: true },
      orderBy: { menu: { sortOrder: 'asc' } },
    })

    const data: AssignedMenu[] = menuSetMenus.map((msm) => ({
      menuId: msm.menu.menuId,
      menuCd: msm.menu.menuCd,
      name: msm.menu.name,
      category: msm.menu.category,
      path: msm.menu.path,
      isActive: msm.menu.isActive,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/menu-sets/:id/menus error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/menu-sets/:id/menus
 * 메뉴 할당 (전체 교체: 기존 삭제 + 새로 생성)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ assigned: number }>>> {
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

    const body = await request.json()
    const { menuIds } = body

    if (!Array.isArray(menuIds)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'menuIds 배열은 필수입니다',
          },
        },
        { status: 400 }
      )
    }

    const { id } = await params
    const menuSetId = parseInt(id)

    const menuSet = await prisma.menuSet.findUnique({
      where: { menuSetId },
      include: { menuSetMenus: true },
    })
    if (!menuSet) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '메뉴셋을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    const existingMenuIds = menuSet.menuSetMenus.map((msm) => msm.menuId)
    const revokedIds = existingMenuIds.filter((mid) => !menuIds.includes(mid))
    const assignedIds = (menuIds as number[]).filter((mid) => !existingMenuIds.includes(mid))

    await prisma.$transaction(async (tx) => {
      // 기존 히스토리 종료 (REVOKE 대상)
      if (revokedIds.length > 0) {
        await tx.menuSetMenuHistory.updateMany({
          where: { menuSetId, menuId: { in: revokedIds }, validTo: null },
          data: { validTo: new Date() },
        })
        await tx.menuSetMenuHistory.createMany({
          data: revokedIds.map((menuId) => ({
            menuSetId,
            menuId,
            changeType: 'REVOKE',
            changedBy: session.user!.id,
          })),
        })
      }

      // 새 할당 히스토리
      if (assignedIds.length > 0) {
        await tx.menuSetMenuHistory.createMany({
          data: assignedIds.map((menuId) => ({
            menuSetId,
            menuId,
            changeType: 'ASSIGN',
            changedBy: session.user!.id,
          })),
        })
      }

      // 전체 교체
      await tx.menuSetMenu.deleteMany({ where: { menuSetId } })
      if (menuIds.length > 0) {
        await tx.menuSetMenu.createMany({
          data: (menuIds as number[]).map((menuId) => ({
            menuSetId,
            menuId,
          })),
        })
      }
    })

    return NextResponse.json({
      success: true,
      data: { assigned: menuIds.length },
    })
  } catch (error) {
    console.error('POST /api/menu-sets/:id/menus error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}
