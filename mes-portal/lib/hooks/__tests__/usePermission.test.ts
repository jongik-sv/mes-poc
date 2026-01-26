/**
 * usePermission Hook 단위 테스트 (TSK-03-03)
 *
 * 테스트 대상:
 * - usePermission: 권한 코드로 can/cannot 메서드 제공
 */

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermission } from '../usePermission'

describe('usePermission Hook', () => {
  describe('can', () => {
    it('UT-PERM-HOOK-001: 빈 권한 배열로 모든 can() false', () => {
      const { result } = renderHook(() => usePermission([]))

      expect(result.current.can('read', 'User')).toBe(false)
      expect(result.current.can('create', 'Role')).toBe(false)
    })

    it('UT-PERM-HOOK-002: 단일 권한으로 해당 액션만 허용', () => {
      const { result } = renderHook(() => usePermission(['user:read']))

      expect(result.current.can('read', 'User')).toBe(true)
      expect(result.current.can('create', 'User')).toBe(false)
    })

    it('UT-PERM-HOOK-003: 여러 권한으로 각각 허용', () => {
      const { result } = renderHook(() =>
        usePermission(['user:read', 'user:create', 'role:read'])
      )

      expect(result.current.can('read', 'User')).toBe(true)
      expect(result.current.can('create', 'User')).toBe(true)
      expect(result.current.can('read', 'Role')).toBe(true)
      expect(result.current.can('create', 'Role')).toBe(false)
    })

    it('UT-PERM-HOOK-004: manage 액션은 모든 작업 허용', () => {
      const { result } = renderHook(() => usePermission(['user:manage']))

      expect(result.current.can('read', 'User')).toBe(true)
      expect(result.current.can('create', 'User')).toBe(true)
      expect(result.current.can('update', 'User')).toBe(true)
      expect(result.current.can('delete', 'User')).toBe(true)
    })

    it('UT-PERM-HOOK-005: all:manage는 모든 리소스 모든 작업 허용', () => {
      const { result } = renderHook(() => usePermission(['all:manage']))

      expect(result.current.can('read', 'User')).toBe(true)
      expect(result.current.can('delete', 'Role')).toBe(true)
      expect(result.current.can('create', 'Permission')).toBe(true)
    })
  })

  describe('cannot', () => {
    it('UT-PERM-HOOK-006: cannot은 can의 반대', () => {
      const { result } = renderHook(() => usePermission(['user:read']))

      expect(result.current.cannot('read', 'User')).toBe(false)
      expect(result.current.cannot('create', 'User')).toBe(true)
    })
  })

  describe('memoization', () => {
    it('UT-PERM-HOOK-007: 같은 권한 배열로 같은 결과 반환', () => {
      const permissions = ['user:read']
      const { result, rerender } = renderHook(() =>
        usePermission(permissions)
      )

      const firstCan = result.current.can
      rerender()
      const secondCan = result.current.can

      // 메모이제이션으로 같은 함수 참조 유지
      expect(firstCan).toBe(secondCan)
    })
  })
})
