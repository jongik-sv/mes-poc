/**
 * 권한 병합 로직 (TSK-03-01)
 *
 * User -> RoleGroup -> Role (hierarchy) -> Permission 체인에서
 * 동일 menuId 권한을 병합하는 로직
 */

import type { PermissionConfig } from './ability'

// ============================================
// Types
// ============================================

/** DB에서 가져온 원시 권한 데이터 (config 파싱 후) */
export interface RawPermission {
  menuId: number | null
  menuName: string | null
  permissionCd: string
  actions: string[]
  fieldConstraints: Record<string, string | string[]> | null
}

/** 병합된 권한 */
export interface MergedPermission {
  menuId: number | null
  menuName: string | null
  permissionCd: string[]
  actions: string[] // lowercase
  fieldConstraints: Record<string, string[] | null> | null
}

/** 역할 계층 탐색용 타입 */
export interface RolePermissionData {
  permissionId: number
  permissionCd: string
  menuId: number | null
  menuName: string | null
  config: string // JSON string
}

export interface RoleWithPermissions {
  roleId: number
  roleCd: string
  parentRole: RoleWithPermissions | null
  permissions: RolePermissionData[]
}

// ============================================
// Field Constraints 병합
// ============================================

/**
 * 두 fieldConstraints를 병합한다.
 *
 * 규칙:
 * - 한쪽이 null이면 결과는 null (제약 없음)
 * - 같은 필드: 값 합집합
 * - 한쪽에만 있는 필드: null (제약 해제)
 */
export function mergeFieldConstraints(
  a: Record<string, string | string[]> | null,
  b: Record<string, string | string[]> | null
): Record<string, string[] | null> | null {
  if (a === null || b === null) {
    return null
  }

  const result: Record<string, string[] | null> = {}
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])

  for (const key of allKeys) {
    const inA = key in a
    const inB = key in b

    if (inA && inB) {
      // 양쪽 모두 있으면 합집합
      const valA = normalizeToArray(a[key])
      const valB = normalizeToArray(b[key])
      result[key] = [...new Set([...valA, ...valB])]
    } else {
      // 한쪽에만 있으면 제약 해제
      result[key] = null
    }
  }

  return result
}

function normalizeToArray(val: string | string[]): string[] {
  return Array.isArray(val) ? val : [val]
}

// ============================================
// 권한 병합
// ============================================

/**
 * RawPermission 배열을 menuId 기준으로 그룹화하여 병합한다.
 */
export function mergePermissions(raw: RawPermission[]): MergedPermission[] {
  // menuId 또는 permissionCd 기준 그룹화
  const groups = new Map<string, RawPermission[]>()

  for (const perm of raw) {
    const key = perm.menuId !== null ? `menu:${perm.menuId}` : `cd:${perm.permissionCd}`
    const existing = groups.get(key) || []
    existing.push(perm)
    groups.set(key, existing)
  }

  const results: MergedPermission[] = []

  for (const perms of groups.values()) {
    const first = perms[0]
    const permissionCds = [...new Set(perms.map((p) => p.permissionCd))]

    // actions 합집합 (lowercase)
    const actionsSet = new Set<string>()
    for (const p of perms) {
      for (const action of p.actions) {
        actionsSet.add(action.toLowerCase())
      }
    }

    // fieldConstraints 순차 병합
    let mergedConstraints: Record<string, string[] | null> | null =
      perms[0].fieldConstraints !== null
        ? normalizeConstraints(perms[0].fieldConstraints)
        : null

    // 첫번째가 null이면 이미 null (제약 없음)
    // 첫번째가 있으면 나머지와 병합
    if (perms.length > 1) {
      if (mergedConstraints === null) {
        // 이미 null - 유지
      } else {
        for (let i = 1; i < perms.length; i++) {
          mergedConstraints = mergeFieldConstraints(
            denormalizeConstraints(mergedConstraints),
            perms[i].fieldConstraints
          )
          if (mergedConstraints === null) break
        }
      }
    }

    results.push({
      menuId: first.menuId,
      menuName: first.menuName,
      permissionCd: permissionCds,
      actions: [...actionsSet],
      fieldConstraints: mergedConstraints,
    })
  }

  return results
}

function normalizeConstraints(
  fc: Record<string, string | string[]>
): Record<string, string[] | null> {
  const result: Record<string, string[] | null> = {}
  for (const [key, val] of Object.entries(fc)) {
    result[key] = normalizeToArray(val)
  }
  return result
}

/** mergedConstraints를 mergeFieldConstraints에 넘기기 위해 역변환 */
function denormalizeConstraints(
  fc: Record<string, string[] | null>
): Record<string, string | string[]> | null {
  const result: Record<string, string | string[]> = {}
  for (const [key, val] of Object.entries(fc)) {
    if (val === null) {
      // 이미 해제된 필드 - 빈 배열이 아닌 전체 허용이므로 포함하지 않음
      // 하지만 이 경우 한쪽에 key가 없으므로 mergeFieldConstraints가 null로 만듦
      // denormalize에서는 null 필드를 제외하면 됨
      continue
    }
    result[key] = val
  }
  return Object.keys(result).length > 0 ? result : null
}

// ============================================
// 역할 계층 탐색
// ============================================

/**
 * 역할의 계층을 따라 모든 권한을 수집한다.
 * (자신 + 부모 + 부모의 부모 ... 재귀)
 */
export function collectRolePermissions(role: RoleWithPermissions): RawPermission[] {
  const results: RawPermission[] = []

  // 현재 역할의 권한 수집
  for (const perm of role.permissions) {
    try {
      const config: PermissionConfig = JSON.parse(perm.config)
      results.push({
        menuId: perm.menuId,
        menuName: perm.menuName,
        permissionCd: perm.permissionCd,
        actions: config.actions,
        fieldConstraints: config.fieldConstraints ?? null,
      })
    } catch {
      // config 파싱 실패 시 건너뜀
    }
  }

  // 부모 역할 재귀 탐색
  if (role.parentRole) {
    results.push(...collectRolePermissions(role.parentRole))
  }

  return results
}

// ============================================
// getUserMergedPermissions (DB 연동)
// ============================================

/**
 * 사용자의 병합된 권한 목록을 조회한다.
 *
 * User -> UserRoleGroup -> RoleGroup -> RoleGroupRole -> Role (+ parent chain) -> Permission
 */
export async function getUserMergedPermissions(
  userId: string,
  _systemId?: string
): Promise<{ isSystemAdmin: boolean; permissions: MergedPermission[] }> {
  // 동적 import로 prisma 클라이언트 로드 (테스트 mock 호환)
  const prisma = (await import('@/lib/prisma')).default

  const user = await prisma.user.findUnique({
    where: { userId },
    include: {
      userRoleGroups: {
        include: {
          roleGroup: {
            include: {
              roleGroupRoles: {
                include: {
                  role: {
                    include: {
                      parent: {
                        include: {
                          rolePermissions: {
                            include: {
                              permission: {
                                include: { menu: true },
                              },
                            },
                          },
                          parent: {
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
      },
    },
  })

  if (!user) {
    return { isSystemAdmin: false, permissions: [] }
  }

  let isSystemAdmin = false
  const allRawPermissions: RawPermission[] = []

  for (const urg of user.userRoleGroups) {
    for (const rgr of urg.roleGroup.roleGroupRoles) {
      const role = rgr.role

      if (role.roleCd === 'SYSTEM_ADMIN') {
        isSystemAdmin = true
      }

      // Role -> RoleWithPermissions 변환
      const roleData = dbRoleToRoleWithPermissions(role)
      allRawPermissions.push(...collectRolePermissions(roleData))
    }
  }

  return {
    isSystemAdmin,
    permissions: mergePermissions(allRawPermissions),
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function dbRoleToRoleWithPermissions(dbRole: any): RoleWithPermissions {
  return {
    roleId: dbRole.roleId,
    roleCd: dbRole.roleCd,
    parentRole: dbRole.parent ? dbRoleToRoleWithPermissions(dbRole.parent) : null,
    permissions: (dbRole.rolePermissions || []).map((rp: any) => ({
      permissionId: rp.permission.permissionId,
      permissionCd: rp.permission.permissionCd,
      menuId: rp.permission.menuId,
      menuName: rp.permission.menu?.name ?? null,
      config: rp.permission.config,
    })),
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
