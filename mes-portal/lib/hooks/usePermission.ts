/**
 * usePermission Hook (TSK-03-03)
 *
 * 권한 코드 배열로 CASL Ability를 생성하고 can/cannot 메서드 제공
 */

import { useMemo, useCallback } from 'react'
import {
  defineAbilityFor,
  type Actions,
  type Subjects,
  type AppAbility,
} from '@/lib/auth/ability'

interface UsePermissionResult {
  can: (action: Actions, subject: Subjects) => boolean
  cannot: (action: Actions, subject: Subjects) => boolean
  ability: AppAbility
}

/**
 * 권한 체크 Hook
 *
 * @param permissions - 권한 코드 배열 (예: ['user:read', 'user:create'])
 * @returns can, cannot 메서드
 *
 * @example
 * const { can, cannot } = usePermission(['user:read', 'user:create'])
 * can('read', 'User') // true
 * cannot('delete', 'User') // true
 */
export function usePermission(permissions: string[]): UsePermissionResult {
  // 권한 배열이 변경될 때만 ability 재생성
  const ability = useMemo(
    () => defineAbilityFor(permissions),
    // permissions 배열의 내용을 기준으로 메모이제이션
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(permissions)]
  )

  // can/cannot 함수 메모이제이션
  const can = useCallback(
    (action: Actions, subject: Subjects) => ability.can(action, subject),
    [ability]
  )

  const cannot = useCallback(
    (action: Actions, subject: Subjects) => ability.cannot(action, subject),
    [ability]
  )

  return { can, cannot, ability }
}
