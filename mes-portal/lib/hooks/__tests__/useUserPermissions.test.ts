/**
 * useUserPermissions Hook 단위 테스트 (TSK-03-03)
 *
 * 테스트 대상:
 * - useUserPermissions: 세션에서 사용자 권한 로드
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}))

import { useSession } from 'next-auth/react'
import { useUserPermissions } from '../useUserPermissions'

const mockUseSession = useSession as ReturnType<typeof vi.fn>

describe('useUserPermissions Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('permissions', () => {
    it('UT-USER-PERM-001: 로딩 중일 때 빈 배열 반환', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      })

      const { result } = renderHook(() => useUserPermissions())

      expect(result.current.permissions).toEqual([])
      expect(result.current.isLoading).toBe(true)
    })

    it('UT-USER-PERM-002: 인증되지 않았을 때 빈 배열 반환', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      })

      const { result } = renderHook(() => useUserPermissions())

      expect(result.current.permissions).toEqual([])
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('UT-USER-PERM-003: 인증된 사용자의 권한 반환', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            permissions: ['user:read', 'user:create'],
          },
        },
        status: 'authenticated',
      })

      const { result } = renderHook(() => useUserPermissions())

      expect(result.current.permissions).toEqual(['user:read', 'user:create'])
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    it('UT-USER-PERM-004: permissions가 없으면 빈 배열 반환', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            // permissions 없음
          },
        },
        status: 'authenticated',
      })

      const { result } = renderHook(() => useUserPermissions())

      expect(result.current.permissions).toEqual([])
    })
  })

  describe('isLoading', () => {
    it('UT-USER-PERM-005: status가 loading일 때 true', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      })

      const { result } = renderHook(() => useUserPermissions())

      expect(result.current.isLoading).toBe(true)
    })

    it('UT-USER-PERM-006: status가 authenticated일 때 false', () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: '1' } },
        status: 'authenticated',
      })

      const { result } = renderHook(() => useUserPermissions())

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('isAuthenticated', () => {
    it('UT-USER-PERM-007: authenticated일 때 true', () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: '1' } },
        status: 'authenticated',
      })

      const { result } = renderHook(() => useUserPermissions())

      expect(result.current.isAuthenticated).toBe(true)
    })

    it('UT-USER-PERM-008: unauthenticated일 때 false', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      })

      const { result } = renderHook(() => useUserPermissions())

      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})
