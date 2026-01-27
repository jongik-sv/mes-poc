/**
 * 역할-권한 매핑 API 엔드포인트 (TSK-03-01)
 *
 * GET /api/roles/:id/permissions - 역할의 권한 목록 조회 (메뉴별 그룹)
 * PUT /api/roles/:id/permissions - 역할-권한 매핑 설정
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

interface PermissionItem {
  id: number
  code: string
  name: string
}

interface PermissionGroup {
  menuId: number | null
  menuName: string | null
  menuCd: string | null
  permissions: PermissionItem[]
}

interface RolePermissionsGroupedResponse {
  roleId: number
  groups: PermissionGroup[]
}

interface RolePermissionsResponse {
  roleId: number
  permissions: PermissionItem[]
}

interface UpdateRolePermissionsDto {
  permissionIds: number[]
}

type RouteContext = { params: Promise<{ id: string }> }

async function checkAdminAuth(): Promise<
  | { authorized: true; userId: string }
  | { authorized: false; response: NextResponse }
> {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      ),
    }
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
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다' } },
        { status: 403 }
      ),
    }
  }

  return { authorized: true, userId: session.user.id }
}

/**
 * GET /api/roles/:id/permissions
 * 역할의 권한 목록을 메뉴별로 그룹하여 반환
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.authorized) return authResult.response

    const { id } = await params
    const roleId = parseInt(id)

    const role = await prisma.role.findUnique({ where: { roleId } })
    if (!role) {
      return NextResponse.json(
        { success: false, error: { code: 'ROLE_NOT_FOUND', message: '역할을 찾을 수 없습니다' } },
        { status: 404 }
      )
    }

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: {
          include: { menu: true },
        },
      },
    })

    const groupMap = new Map<number | null, PermissionGroup>()
    for (const rp of rolePermissions) {
      const menuId = rp.permission.menuId ?? null
      if (!groupMap.has(menuId)) {
        groupMap.set(menuId, {
          menuId,
          menuName: rp.permission.menu?.name ?? null,
          menuCd: rp.permission.menu?.menuCd ?? null,
          permissions: [],
        })
      }
      groupMap.get(menuId)!.permissions.push({
        id: rp.permission.permissionId,
        code: rp.permission.permissionCd,
        name: rp.permission.name,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        roleId,
        groups: Array.from(groupMap.values()),
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' } },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/roles/:id/permissions
 * 역할-권한 매핑 설정 (기존 매핑 삭제 후 새로 생성)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.authorized) return authResult.response

    const { id } = await params
    const roleId = parseInt(id)

    const role = await prisma.role.findUnique({ where: { roleId } })
    if (!role) {
      return NextResponse.json(
        { success: false, error: { code: 'ROLE_NOT_FOUND', message: '역할을 찾을 수 없습니다' } },
        { status: 404 }
      )
    }

    const body: UpdateRolePermissionsDto = await request.json()

    if (!body.permissionIds || !Array.isArray(body.permissionIds)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'permissionIds는 필수입니다' } },
        { status: 400 }
      )
    }

    await prisma.rolePermission.deleteMany({ where: { roleId } })

    if (body.permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: body.permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      })
    }

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    })

    await prisma.auditLog.create({
      data: {
        userId: authResult.userId,
        action: 'ROLE_PERMISSION_UPDATE',
        resource: 'Role',
        resourceId: String(roleId),
        details: JSON.stringify({ permissionIds: body.permissionIds }),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        roleId,
        permissions: rolePermissions.map((rp) => ({
          id: rp.permission.permissionId,
          code: rp.permission.permissionCd,
          name: rp.permission.name,
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
