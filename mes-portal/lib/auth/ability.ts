/**
 * CASL Ability 정의 (RBAC 재설계)
 *
 * Permission.config JSON 기반 권한 체크를 위한 CASL Ability 구현
 * Subject는 menuId 또는 permissionCd 기반
 */

import { AbilityBuilder, PureAbility, AbilityClass } from '@casl/ability'
import type { MergedPermission } from './permission-merge'

// 가능한 액션 타입
export type Actions =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'manage'

// Subject는 menuId(숫자) 또는 permissionCd(문자열) 또는 'all'
export type Subjects = string

// App Ability 타입
export type AppAbility = PureAbility<[Actions, Subjects]>
export const AppAbility = PureAbility as AbilityClass<AppAbility>

/**
 * Permission config JSON 구조
 */
export interface PermissionConfig {
  actions: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'IMPORT')[]
  fieldConstraints?: { [fieldName: string]: string | string[] }
}

/**
 * 권한 코드 배열로 CASL Ability 생성
 *
 * @param permissions - 권한 코드 배열 (예: ['1:read', 'PERM_USER:create', '*'])
 * @returns CASL Ability 인스턴스
 *
 * @example
 * const ability = defineAbilityFor(['1:read', '1:create'])
 * ability.can('read', '1') // true  (menuId=1에 대한 read)
 * ability.can('delete', '1') // false
 */
export function defineAbilityFor(permissions: string[]): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(AppAbility)

  permissions.forEach((permission) => {
    // 와일드카드 - 모든 권한
    if (permission === '*') {
      can('manage', 'all')
      return
    }

    const parts = permission.split(':')
    if (parts.length !== 2) {
      return
    }

    const [subject, action] = parts
    const normalizedAction = action.toLowerCase() as Actions

    if (normalizedAction === 'manage') {
      can('manage', subject)
    } else {
      can(normalizedAction, subject)
    }
  })

  return build()
}

/**
 * 특정 권한이 있는지 확인
 *
 * @param permissions - 사용자의 권한 코드 배열
 * @param action - 확인할 액션
 * @param subject - 확인할 리소스 (menuId 문자열 또는 permissionCd)
 * @returns 권한 여부
 */
export function hasPermission(
  permissions: string[] | undefined,
  action: Actions,
  subject: Subjects
): boolean {
  if (!permissions || permissions.length === 0) {
    return false
  }

  const ability = defineAbilityFor(permissions)
  return ability.can(action, subject)
}

/**
 * MergedPermission 배열로 CASL Ability 생성
 *
 * @param permissions - 병합된 권한 배열
 * @returns CASL Ability 인스턴스
 */
export function defineAbilityFromMergedPermissions(
  permissions: MergedPermission[]
): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(AppAbility)

  permissions.forEach((perm) => {
    perm.actions.forEach((action) => {
      if (action === 'manage') {
        can('manage', 'all')
        return
      }

      const normalizedAction = action.toLowerCase() as Actions

      if (perm.menuId !== null && perm.menuId !== undefined) {
        if (perm.menuId === 0 && perm.menuName === 'all') {
          can(normalizedAction, 'all')
        } else {
          can(normalizedAction, String(perm.menuId))
        }
      } else {
        // menuId 없으면 permissionCd 첫번째를 subject로 사용
        if (perm.permissionCd.length > 0) {
          perm.permissionCd.forEach((cd) => {
            can(normalizedAction, cd)
          })
        }
      }
    })
  })

  return build()
}

/**
 * 권한 코드에서 액션과 subject 추출
 *
 * @param permissionCode - 권한 코드 (예: '1:read', 'PERM_USER:create')
 * @returns { action, subject } 또는 null
 */
export function parsePermissionCode(
  permissionCode: string
): { action: Actions; subject: Subjects } | null {
  if (permissionCode === '*') {
    return { action: 'manage', subject: 'all' }
  }

  const parts = permissionCode.split(':')
  if (parts.length !== 2) {
    return null
  }

  const [subject, action] = parts

  return {
    action: action.toLowerCase() as Actions,
    subject,
  }
}
