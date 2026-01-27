/**
 * usePermission 훅 테스트 (TSK-03-01)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermission } from '../usePermission'
import type { MergedPermission } from '@/lib/auth/permission-merge'

// useSession mock
const mockSession = {
  data: null as { user?: { mergedPermissions?: MergedPermission[] } } | null,
  status: 'authenticated' as string,
}

vi.mock('next-auth/react', () => ({
  useSession: () => mockSession,
}))

describe('usePermission', () => {
  beforeEach(() => {
    mockSession.data = {
      user: {
        mergedPermissions: [
          {
            menuId: 1,
            menuName: '생산실적',
            permissionCd: ['P1'],
            actions: ['read', 'create'],
            fieldConstraints: { line: ['2CGL', '3CGL'] },
          },
          {
            menuId: 2,
            menuName: '품질관리',
            permissionCd: ['P2'],
            actions: ['read'],
            fieldConstraints: null,
          },
        ],
      },
    }
    mockSession.status = 'authenticated'
  })

  it('HP-001: can() - 권한 있는 액션 true', () => {
    const { result } = renderHook(() => usePermission())
    expect(result.current.can('read', 1)).toBe(true)
    expect(result.current.can('create', 1)).toBe(true)
  })

  it('HP-002: can() - 권한 없는 액션 false', () => {
    const { result } = renderHook(() => usePermission())
    expect(result.current.can('delete', 1)).toBe(false)
    expect(result.current.can('create', 2)).toBe(false)
  })

  it('HP-003: getFieldConstraints() - 제약 반환', () => {
    const { result } = renderHook(() => usePermission())
    expect(result.current.getFieldConstraints(1)).toEqual({
      line: ['2CGL', '3CGL'],
    })
  })

  it('HP-004: getFieldConstraints() - null 제약 반환', () => {
    const { result } = renderHook(() => usePermission())
    expect(result.current.getFieldConstraints(2)).toBeNull()
  })

  it('HP-005: 세션 없으면 모두 거부', () => {
    mockSession.data = null
    const { result } = renderHook(() => usePermission())
    expect(result.current.can('read', 1)).toBe(false)
    expect(result.current.permissions).toEqual([])
  })

  it('HP-006: permissions 배열 반환', () => {
    const { result } = renderHook(() => usePermission())
    expect(result.current.permissions).toHaveLength(2)
  })
})
