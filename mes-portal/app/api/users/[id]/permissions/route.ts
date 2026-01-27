/**
 * 사용자 최종 권한 계산 API
 * GET /api/users/:id/permissions - 병합된 권한 조회
 *
 * 계산 흐름:
 * UserRoleGroup -> RoleGroup -> RoleGroupRole -> Role (+ parent hierarchy)
 * -> RolePermission -> Permission
 * 결과를 menuId 기준으로 그룹핑, actions union, fieldConstraints 병합
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface PermissionConfig {
  actions: string[]
  fieldConstraints?: Record<string, string | string[]>
}

interface MergedPermission {
  menuId: number | null
  menuCd?: string
  menuName?: string
  actions: string[]
  fieldConstraints: Record<string, string | string[]>
  permissionIds: number[]
}

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  )
}

interface RoleWithPermissions {
  roleId: number
  parentRoleId: number | null
  isActive: boolean
  rolePermissions: Array<{
    permission: {
      permissionId: number
      permissionCd?: string
      menuId: number | null
      config: string
      isActive: boolean
      menu?: { menuId: number; menuCd: string; name: string } | null
    }
  }>
}

async function collectRolesWithParents(
  roles: RoleWithPermissions[]
): Promise<RoleWithPermissions[]> {
  const collected = new Map<number, RoleWithPermissions>()
  const queue = [...roles]

  while (queue.length > 0) {
    const role = queue.shift()!
    if (collected.has(role.roleId) || !role.isActive) continue
    collected.set(role.roleId, role)

    if (role.parentRoleId) {
      const parent = await prisma.role.findUnique({
        where: { roleId: role.parentRoleId },
        include: {
          rolePermissions: {
            include: {
              permission: {
                include: { menu: true },
              },
            },
          },
        },
      })
      if (parent) {
        queue.push(parent as unknown as RoleWithPermissions)
      }
    }
  }

  return Array.from(collected.values())
}

function mergePermissions(roles: RoleWithPermissions[]): MergedPermission[] {
  const byMenu = new Map<number | null, MergedPermission>()

  for (const role of roles) {
    for (const rp of role.rolePermissions) {
      const perm = rp.permission
      if (!perm.isActive) continue

      let config: PermissionConfig
      try {
        config = JSON.parse(perm.config) as PermissionConfig
      } catch {
        continue
      }

      const key = perm.menuId
      const existing = byMenu.get(key)

      if (existing) {
        // Union actions
        for (const action of config.actions) {
          if (!existing.actions.includes(action)) {
            existing.actions.push(action)
          }
        }
        // Merge fieldConstraints
        if (config.fieldConstraints) {
          for (const [field, value] of Object.entries(config.fieldConstraints)) {
            existing.fieldConstraints[field] = value
          }
        }
        if (!existing.permissionIds.includes(perm.permissionId)) {
          existing.permissionIds.push(perm.permissionId)
        }
      } else {
        byMenu.set(key, {
          menuId: perm.menuId,
          menuCd: perm.menu?.menuCd,
          menuName: perm.menu?.name,
          actions: [...config.actions],
          fieldConstraints: config.fieldConstraints ? { ...config.fieldConstraints } : {},
          permissionIds: [perm.permissionId],
        })
      }
    }
  }

  return Array.from(byMenu.values())
}

export async function GET(
  _request: NextRequest,
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

    // 1. 사용자의 역할그룹 -> 역할 -> 권한 전체 조회
    const userRoleGroups = await prisma.userRoleGroup.findMany({
      where: { userId },
      include: {
        roleGroup: {
          include: {
            roleGroupRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: {
                          include: { menu: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    // 2. 모든 직접 역할 수집
    const directRoles: RoleWithPermissions[] = []
    for (const urg of userRoleGroups) {
      for (const rgr of urg.roleGroup.roleGroupRoles) {
        directRoles.push(rgr.role as unknown as RoleWithPermissions)
      }
    }

    // 3. 부모 역할 계층 순회
    const allRoles = await collectRolesWithParents(directRoles)

    // 4. 권한 병합 (menuId 기준 그룹핑, actions union)
    const permissions = mergePermissions(allRoles)

    return NextResponse.json({
      success: true,
      data: {
        userId,
        permissions,
      },
    })
  } catch {
    return errorResponse('DB_ERROR', '데이터베이스 오류가 발생했습니다', 500)
  }
}
