/**
 * 사용자 권한 시점 이력 API 엔드포인트
 *
 * GET /api/users/:id/permissions/history?asOf= - 특정 시점의 사용자 권한 조회
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

function scdWhere(asOf: Date) {
  return {
    validFrom: { lte: asOf },
    OR: [{ validTo: null }, { validTo: { gt: asOf } }],
  }
}

/**
 * GET /api/users/:id/permissions/history?asOf=2026-01-15T00:00:00Z
 * SCD Type 2 패턴으로 특정 시점의 사용자 권한을 조회
 * UserRoleGroupHistory -> RoleGroupRoleHistory -> RolePermissionHistory -> PermissionHistory
 */
export async function GET(
  request: NextRequest,
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

    const { id: userId } = await params
    const { searchParams } = new URL(request.url)
    const asOfParam = searchParams.get('asOf')

    if (!asOfParam) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'asOf 파라미터는 필수입니다' } },
        { status: 400 }
      )
    }

    const asOf = new Date(asOfParam)
    const scd = scdWhere(asOf)

    // 1. 해당 시점에 사용자에게 할당된 역할 그룹
    const userRoleGroups = await prisma.userRoleGroupHistory.findMany({
      where: { userId, ...scd },
    })
    const roleGroupIds = userRoleGroups.map((urg) => urg.roleGroupId)

    if (roleGroupIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { userId, asOf, permissions: [] },
      })
    }

    // 2. 역할 그룹에 할당된 역할
    const roleGroupRoles = await prisma.roleGroupRoleHistory.findMany({
      where: { roleGroupId: { in: roleGroupIds }, ...scd },
    })
    const roleIds = [...new Set(roleGroupRoles.map((rgr) => rgr.roleId))]

    if (roleIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { userId, asOf, permissions: [] },
      })
    }

    // 3. 역할에 할당된 권한
    const rolePermissions = await prisma.rolePermissionHistory.findMany({
      where: { roleId: { in: roleIds }, ...scd },
    })
    const permissionIds = [...new Set(rolePermissions.map((rp) => rp.permissionId))]

    if (permissionIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { userId, asOf, permissions: [] },
      })
    }

    // 4. 권한 상세 정보
    const permissions = await prisma.permissionHistory.findMany({
      where: { permissionId: { in: permissionIds }, ...scd },
    })

    return NextResponse.json({
      success: true,
      data: { userId, asOf, permissions },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' } },
      { status: 500 }
    )
  }
}
