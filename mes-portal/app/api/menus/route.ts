/**
 * 메뉴 API 엔드포인트 (TSK-03-01)
 *
 * GET /api/menus - 계층형 메뉴 목록 조회
 * POST /api/menus - 메뉴 생성 (Phase 2)
 */

import { NextResponse } from 'next/server'
import { menuService, MenuServiceError } from '@/lib/services/menu.service'
import type { ApiResponse, MenuItem, CreateMenuDto } from '@/lib/types/menu'
import { MenuErrorCode } from '@/lib/types/menu'

/**
 * GET /api/menus
 * 계층형 메뉴 목록 조회
 *
 * @returns {ApiResponse<MenuItem[]>} 계층형 메뉴 트리
 */
export async function GET(): Promise<NextResponse<ApiResponse<MenuItem[]>>> {
  try {
    // TODO: Auth.js 세션 검증 (TSK-04-03에서 구현)
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: {
    //         code: MenuErrorCode.UNAUTHORIZED,
    //         message: '인증이 필요합니다',
    //       },
    //     },
    //     { status: 401 }
    //   )
    // }

    const menus = await menuService.findAll()

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
          code: MenuErrorCode.DB_CONNECTION_ERROR,
          message: '데이터베이스 연결에 실패했습니다',
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
    // TODO: Auth.js 세션 검증 및 관리자 권한 확인 (TSK-04-03에서 구현)
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: {
    //         code: MenuErrorCode.UNAUTHORIZED,
    //         message: '인증이 필요합니다',
    //       },
    //     },
    //     { status: 401 }
    //   )
    // }

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
          code: MenuErrorCode.DB_CONNECTION_ERROR,
          message: '데이터베이스 연결에 실패했습니다',
        },
      },
      { status: 500 }
    )
  }
}
