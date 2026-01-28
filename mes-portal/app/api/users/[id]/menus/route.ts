/**
 * 사용자 메뉴 시뮬레이션 API
 * GET /api/users/:id/menus - 사용자의 역할그룹 기반 접근 가능 메뉴 트리 조회
 *
 * Query Parameters:
 * - roleGroupIds: 콤마 구분 역할그룹 ID 목록 (시뮬레이션용, 미지정 시 실제 할당 기준)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import {
  buildMenuTreeForSimulation,
  collectMenuIdsFromRoleGroups,
} from '@/lib/auth/menu-simulation'
import type { MenuItem } from '@/lib/auth/menu-filter'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
}

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error: { code, message } },
    { status }
  )
}

const ROLE_GROUP_INCLUDE = {
  roleGroupRoles: {
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: {
                select: {
                  menuId: true,
                  config: true,
                },
              },
            },
          },
        },
      },
    },
  },
} as const

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', '인증이 필요합니다', 401)
    }

    const { id: userId } = await params

    const user = await prisma.user.findUnique({ where: { userId } })
    if (!user) {
      return errorResponse('USER_NOT_FOUND', '사용자를 찾을 수 없습니다', 404)
    }

    // roleGroupIds 쿼리 파라미터 확인 (시뮬레이션용)
    const searchParams = request.nextUrl.searchParams
    const roleGroupIdsParam = searchParams.get('roleGroupIds')

    let roleGroupsData

    if (roleGroupIdsParam) {
      // 시뮬레이션: 지정된 역할그룹 ID 기반
      const roleGroupIds = roleGroupIdsParam
        .split(',')
        .map(Number)
        .filter((id) => !isNaN(id))

      roleGroupsData = await prisma.roleGroup.findMany({
        where: { roleGroupId: { in: roleGroupIds } },
        include: ROLE_GROUP_INCLUDE,
      })
    } else {
      // 실제 할당 기반
      const userRoleGroups = await prisma.userRoleGroup.findMany({
        where: { userId },
        include: {
          roleGroup: {
            include: ROLE_GROUP_INCLUDE,
          },
        },
      })
      roleGroupsData = userRoleGroups.map((urg) => urg.roleGroup)
    }

    // 메뉴 ID 수집
    const allowedMenuIds = collectMenuIdsFromRoleGroups(roleGroupsData)

    // 전체 활성 메뉴 조회
    const allMenus = await prisma.menu.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    })

    const menuItems: MenuItem[] = allMenus.map((menu) => ({
      menuId: menu.menuId,
      menuCd: menu.menuCd,
      name: menu.name,
      path: menu.path,
      category: menu.category,
      sortOrder: menu.sortOrder,
      icon: menu.icon,
      isActive: menu.isActive,
      children: [],
    }))

    // 트리 빌드
    const result = buildMenuTreeForSimulation(menuItems, allowedMenuIds)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch {
    return errorResponse('DB_ERROR', '데이터베이스 오류가 발생했습니다', 500)
  }
}
