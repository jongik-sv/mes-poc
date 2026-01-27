/**
 * 메뉴 API 엔드포인트
 *
 * GET /api/menus - 사용자별 계층형 메뉴 목록 조회
 * POST /api/menus - 메뉴 생성 (관리자)
 *
 * RBAC 리디자인: UserSystemMenuSet + MenuSet 기반 메뉴 접근
 */

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { menuService, MenuServiceError } from '@/lib/services/menu.service'
import type { ApiResponse, MenuItem, CreateMenuDto } from '@/lib/types/menu'
import { MenuErrorCode } from '@/lib/types/menu'

/**
 * GET /api/menus
 * 사용자별 계층형 메뉴 목록 조회
 */
export async function GET(request: Request): Promise<NextResponse<ApiResponse<MenuItem[]>>> {
  try {
    // 1. Auth.js 세션 검증
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: MenuErrorCode.UNAUTHORIZED,
            message: '인증이 필요합니다',
          },
        },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const systemId = searchParams.get('systemId')

    // 2. 사용자 활성 상태 검증
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { userId: true, isActive: true },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: MenuErrorCode.USER_INACTIVE,
            message: '비활성화된 사용자입니다',
          },
        },
        { status: 403 }
      )
    }

    // 3. systemId가 있으면 사용자별 메뉴, 없으면 전체 메뉴
    let menus: MenuItem[]
    if (systemId) {
      menus = await menuService.findByUser(userId, systemId)
    } else {
      menus = await menuService.findAll()
    }

    return NextResponse.json({
      success: true,
      data: menus,
    })
  } catch (error) {
    console.error('GET /api/menus error:', error)

    if (error instanceof MenuServiceError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: MenuErrorCode.DB_ERROR,
          message: '데이터베이스 오류가 발생했습니다',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/menus
 * 메뉴 생성 (관리자)
 */
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<MenuItem | null>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: MenuErrorCode.UNAUTHORIZED,
            message: '인증이 필요합니다',
          },
        },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 사용자 활성 상태 + 관리자 권한 확인
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

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: MenuErrorCode.USER_INACTIVE,
            message: '비활성화된 사용자입니다',
          },
        },
        { status: 403 }
      )
    }

    // SYSTEM_ADMIN 역할 확인
    const isAdmin = user.userRoleGroups.some((urg) =>
      urg.roleGroup.roleGroupRoles.some((rgr) => rgr.role.roleCd === 'SYSTEM_ADMIN')
    )
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: MenuErrorCode.UNAUTHORIZED,
            message: '관리자 권한이 필요합니다',
          },
        },
        { status: 403 }
      )
    }

    const body: CreateMenuDto = await request.json()
    const menu = await menuService.create(body)

    return NextResponse.json(
      {
        success: true,
        data: {
          menuId: menu.menuId,
          menuCd: menu.menuCd,
          name: menu.name,
          path: menu.path,
          icon: menu.icon,
          sortOrder: menu.sortOrder,
          category: menu.category,
          systemId: menu.systemId,
          children: [],
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/menus error:', error)

    if (error instanceof MenuServiceError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: MenuErrorCode.DB_ERROR,
          message: '데이터베이스 오류가 발생했습니다',
        },
      },
      { status: 500 }
    )
  }
}
