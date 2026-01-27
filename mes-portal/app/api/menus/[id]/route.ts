/**
 * 개별 메뉴 API 엔드포인트
 *
 * GET /api/menus/:id - 단일 메뉴 조회
 * PUT /api/menus/:id - 메뉴 수정
 * DELETE /api/menus/:id - 메뉴 삭제
 */

import { NextResponse } from 'next/server'
import { menuService, MenuServiceError } from '@/lib/services/menu.service'
import type { ApiResponse, MenuItem, UpdateMenuDto } from '@/lib/types/menu'
import { MenuErrorCode } from '@/lib/types/menu'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/menus/:id
 */
export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<MenuItem | null>>> {
  try {
    const { id } = await params
    const menuId = parseInt(id, 10)

    if (isNaN(menuId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: MenuErrorCode.VALIDATION_ERROR,
            message: '유효하지 않은 메뉴 ID입니다',
          },
        },
        { status: 400 }
      )
    }

    const menu = await menuService.findById(menuId)

    if (!menu) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: MenuErrorCode.MENU_NOT_FOUND,
            message: '메뉴를 찾을 수 없습니다',
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('GET /api/menus/:id error:', error)

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
 * PUT /api/menus/:id
 */
export async function PUT(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<MenuItem | null>>> {
  try {
    const { id } = await params
    const menuId = parseInt(id, 10)

    if (isNaN(menuId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: MenuErrorCode.VALIDATION_ERROR,
            message: '유효하지 않은 메뉴 ID입니다',
          },
        },
        { status: 400 }
      )
    }

    const body: UpdateMenuDto = await request.json()
    const menu = await menuService.update(menuId, body)

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('PUT /api/menus/:id error:', error)

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
 * DELETE /api/menus/:id
 */
export async function DELETE(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = await params
    const menuId = parseInt(id, 10)

    if (isNaN(menuId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: MenuErrorCode.VALIDATION_ERROR,
            message: '유효하지 않은 메뉴 ID입니다',
          },
        },
        { status: 400 }
      )
    }

    await menuService.delete(menuId)

    return NextResponse.json({
      success: true,
      data: null,
    })
  } catch (error) {
    console.error('DELETE /api/menus/:id error:', error)

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
