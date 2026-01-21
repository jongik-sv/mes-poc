/**
 * 메뉴 API 엔드포인트 (TSK-03-01, TSK-03-03)
 *
 * GET /api/menus - 권한별 계층형 메뉴 목록 조회
 * POST /api/menus - 메뉴 생성 (Phase 2)
 *
 * 비즈니스 규칙:
 * - BR-01: 인증된 사용자만 메뉴 조회 가능
 * - BR-02: 자식 메뉴 권한 있으면 부모 메뉴 자동 표시
 * - BR-03: ADMIN(Role ID=1)은 모든 메뉴 접근
 * - BR-04: isActive=false인 메뉴는 제외
 * - BR-05: sortOrder 오름차순 정렬
 */

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { menuService, MenuServiceError } from '@/lib/services/menu.service'
import type { ApiResponse, MenuItem, CreateMenuDto } from '@/lib/types/menu'
import { MenuErrorCode } from '@/lib/types/menu'

/**
 * GET /api/menus
 * 권한별 계층형 메뉴 목록 조회
 *
 * @returns {ApiResponse<MenuItem[]>} 계층형 메뉴 트리
 */
export async function GET(): Promise<NextResponse<ApiResponse<MenuItem[]>>> {
  try {
    // 1. Auth.js 세션 검증 (BR-01)
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

    // 2. 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: { role: true },
    })

    // 3. 사용자 활성 상태 검증
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

    // 4. 역할 기반 메뉴 조회 (BR-02, BR-03, BR-04, BR-05)
    const menus = await menuService.findByRole(user.roleId)

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
 * 메뉴 생성 (Phase 2 관리자 기능)
 *
 * @param request - 요청 객체 (CreateMenuDto body)
 * @returns {ApiResponse<MenuItem>} 생성된 메뉴
 */
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<MenuItem | null>>> {
  try {
    // Auth.js 세션 검증
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

    // 관리자 권한 확인 (ADMIN만 메뉴 생성 가능)
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: { role: true },
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

    // ADMIN 역할만 메뉴 생성 가능 (roleId: 1)
    if (user.roleId !== 1) {
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
          id: menu.id,
          code: menu.code,
          name: menu.name,
          path: menu.path,
          icon: menu.icon,
          sortOrder: menu.sortOrder,
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
