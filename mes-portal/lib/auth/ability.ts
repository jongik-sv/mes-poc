/**
 * CASL Ability 정의 (TSK-03-02)
 *
 * RBAC 기반 권한 체크를 위한 CASL Ability 구현
 */

import { AbilityBuilder, PureAbility, AbilityClass } from '@casl/ability'

// 가능한 액션 타입
export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'

// 가능한 리소스 타입
export type Subjects =
  | 'User'
  | 'Role'
  | 'Permission'
  | 'Menu'
  | 'AuditLog'
  | 'all'

// App Ability 타입
export type AppAbility = PureAbility<[Actions, Subjects]>
export const AppAbility = PureAbility as AbilityClass<AppAbility>

/**
 * 권한 코드 배열로 CASL Ability 생성
 *
 * @param permissions - 권한 코드 배열 (예: ['user:read', 'role:create'])
 * @returns CASL Ability 인스턴스
 *
 * @example
 * const ability = defineAbilityFor(['user:read', 'user:create'])
 * ability.can('read', 'User') // true
 * ability.can('delete', 'User') // false
 */
export function defineAbilityFor(permissions: string[]): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(AppAbility)

  permissions.forEach((permission) => {
    // 권한 코드 파싱 (예: 'user:read' -> resource='user', action='read')
    const parts = permission.split(':')
    if (parts.length !== 2) {
      // 잘못된 형식은 무시
      return
    }

    const [resource, action] = parts

    // 리소스 이름 정규화 (첫 글자 대문자)
    const normalizedResource =
      resource === 'all'
        ? 'all'
        : (resource.charAt(0).toUpperCase() +
            resource.slice(1).toLowerCase()) as Subjects

    // 액션 정규화
    const normalizedAction = action.toLowerCase() as Actions

    // manage 액션은 모든 작업 허용
    if (normalizedAction === 'manage') {
      can('create', normalizedResource)
      can('read', normalizedResource)
      can('update', normalizedResource)
      can('delete', normalizedResource)
      can('manage', normalizedResource)
    } else {
      can(normalizedAction, normalizedResource)
    }
  })

  return build()
}

/**
 * 특정 권한이 있는지 확인
 *
 * @param permissions - 사용자의 권한 코드 배열
 * @param action - 확인할 액션
 * @param subject - 확인할 리소스
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
 * 권한 코드에서 액션과 리소스 추출
 *
 * @param permissionCode - 권한 코드 (예: 'user:read')
 * @returns { action, resource } 또는 null
 */
export function parsePermissionCode(
  permissionCode: string
): { action: Actions; resource: Subjects } | null {
  const parts = permissionCode.split(':')
  if (parts.length !== 2) {
    return null
  }

  const [resource, action] = parts
  const normalizedResource =
    resource === 'all'
      ? 'all'
      : (resource.charAt(0).toUpperCase() +
          resource.slice(1).toLowerCase()) as Subjects

  return {
    action: action.toLowerCase() as Actions,
    resource: normalizedResource,
  }
}
