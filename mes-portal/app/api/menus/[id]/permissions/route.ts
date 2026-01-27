/**
 * 메뉴별 권한 조회 API 엔드포인트
 *
 * GET /api/menus/:menuId/permissions - 특정 메뉴의 권한 목록
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

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/menus/:menuId/permissions
 * 특정 메뉴에 속한 권한 목록 조회
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { userId: session.user.id },
      include: {
        userRoleGroups: {
          include: {
            roleGroup: {
              include: { roleGroupRoles: { include: { role: true } } },
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
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다' } },
        { status: 403 }
      )
    }

    const { id: menuIdStr } = await params
    const menuId = parseInt(menuIdStr)

    const menu = await prisma.menu.findUnique({ where: { menuId } })
    if (!menu) {
      return NextResponse.json(
        { success: false, error: { code: 'MENU_NOT_FOUND', message: '메뉴를 찾을 수 없습니다' } },
        { status: 404 }
      )
    }

    const permissions = await prisma.permission.findMany({
      where: { menuId },
      orderBy: { permissionCd: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: {
        menuId,
        menuName: menu.name,
        permissions: permissions.map((p) => ({
          id: p.permissionId,
          code: p.permissionCd,
          name: p.name,
          config: p.config,
          isActive: p.isActive,
        })),
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' } },
      { status: 500 }
    )
  }
}
