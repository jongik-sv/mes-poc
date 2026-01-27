/**
 * 메뉴셋 상세 API 엔드포인트
 *
 * GET /api/menu-sets/:id - 메뉴셋 상세 조회
 * PUT /api/menu-sets/:id - 메뉴셋 수정 (관리자)
 * DELETE /api/menu-sets/:id - 메뉴셋 삭제 (관리자)
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

interface MenuSetDetail {
  menuSetId: number
  systemId: string
  menuSetCd: string
  name: string
  description: string | null
  isDefault: boolean
  isActive: boolean
  menuCount: number
  userCount: number
  menus: Array<{
    menuId: number
    menuCd: string
    name: string
    category: string
    isActive: boolean
  }>
}

/**
 * GET /api/menu-sets/:id
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<MenuSetDetail>>> {
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

    const menuSet = await prisma.menuSet.findUnique({
      where: { menuSetId },
      include: {
        menuSetMenus: {
          include: { menu: true },
        },
        _count: {
          select: {
            menuSetMenus: true,
            userSystemMenuSets: true,
          },
        },
      },
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

    return NextResponse.json({
      success: true,
      data: {
        menuSetId: menuSet.menuSetId,
        systemId: menuSet.systemId,
        menuSetCd: menuSet.menuSetCd,
        name: menuSet.name,
        description: menuSet.description,
        isDefault: menuSet.isDefault,
        isActive: menuSet.isActive,
        menuCount: menuSet._count.menuSetMenus,
        userCount: menuSet._count.userSystemMenuSets,
        menus: menuSet.menuSetMenus.map((msm) => ({
          menuId: msm.menu.menuId,
          menuCd: msm.menu.menuCd,
          name: msm.menu.name,
          category: msm.menu.category,
          isActive: msm.menu.isActive,
        })),
      },
    })
  } catch (error) {
    console.error('GET /api/menu-sets/:id error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}

interface UpdateMenuSetDto {
  name?: string
  description?: string
  isDefault?: boolean
  isActive?: boolean
}

/**
 * PUT /api/menu-sets/:id
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<MenuSetDetail>>> {
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

    const { id } = await params
    const menuSetId = parseInt(id)
    const body: UpdateMenuSetDto = await request.json()

    const existing = await prisma.menuSet.findUnique({ where: { menuSetId } })
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '메뉴셋을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    // 트랜잭션: 이전 히스토리 종료 + 새 히스토리 + 업데이트
    const updated = await prisma.$transaction(async (tx) => {
      // 이전 히스토리 종료
      await tx.menuSetHistory.updateMany({
        where: { menuSetId, validTo: null },
        data: { validTo: new Date() },
      })

      const menuSet = await tx.menuSet.update({
        where: { menuSetId },
        data: {
          name: body.name ?? existing.name,
          description: body.description ?? existing.description,
          isDefault: body.isDefault ?? existing.isDefault,
          isActive: body.isActive ?? existing.isActive,
        },
      })

      // 새 히스토리
      await tx.menuSetHistory.create({
        data: {
          menuSetId: menuSet.menuSetId,
          systemId: menuSet.systemId,
          menuSetCd: menuSet.menuSetCd,
          name: menuSet.name,
          description: menuSet.description,
          isDefault: menuSet.isDefault,
          isActive: menuSet.isActive,
          changeType: 'UPDATE',
          changedBy: session.user!.id,
        },
      })

      return menuSet
    })

    return NextResponse.json({
      success: true,
      data: {
        menuSetId: updated.menuSetId,
        systemId: updated.systemId,
        menuSetCd: updated.menuSetCd,
        name: updated.name,
        description: updated.description,
        isDefault: updated.isDefault,
        isActive: updated.isActive,
        menuCount: 0,
        userCount: 0,
        menus: [],
      },
    })
  } catch (error) {
    console.error('PUT /api/menu-sets/:id error:', error)
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
 * DELETE /api/menu-sets/:id
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
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

    const { id } = await params
    const menuSetId = parseInt(id)

    const existing = await prisma.menuSet.findUnique({
      where: { menuSetId },
      include: { menuSetMenus: true },
    })
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '메뉴셋을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    await prisma.$transaction(async (tx) => {
      // MenuSet 히스토리 종료 + DELETE 기록
      await tx.menuSetHistory.updateMany({
        where: { menuSetId, validTo: null },
        data: { validTo: new Date() },
      })
      await tx.menuSetHistory.create({
        data: {
          menuSetId: existing.menuSetId,
          systemId: existing.systemId,
          menuSetCd: existing.menuSetCd,
          name: existing.name,
          description: existing.description,
          isDefault: existing.isDefault,
          isActive: existing.isActive,
          changeType: 'DELETE',
          changedBy: session.user!.id,
        },
      })

      // MenuSetMenu 히스토리 REVOKE
      if (existing.menuSetMenus.length > 0) {
        await tx.menuSetMenuHistory.updateMany({
          where: { menuSetId, validTo: null },
          data: { validTo: new Date() },
        })
        await tx.menuSetMenuHistory.createMany({
          data: existing.menuSetMenus.map((msm) => ({
            menuSetId,
            menuId: msm.menuId,
            changeType: 'REVOKE',
            changedBy: session.user!.id,
          })),
        })
      }

      // cascade delete 처리됨 (menuSetMenus)
      await tx.menuSet.delete({ where: { menuSetId } })
    })

    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    console.error('DELETE /api/menu-sets/:id error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}
