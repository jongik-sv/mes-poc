/**
 * PermissionGuard 컴포넌트 단위 테스트 (TSK-03-03)
 *
 * 테스트 대상:
 * - PermissionGuard: 권한 기반 조건부 렌더링
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PermissionGuard } from '../PermissionGuard'

// Mock useUserPermissions
vi.mock('@/lib/hooks/useUserPermissions', () => ({
  useUserPermissions: vi.fn(),
}))

import { useUserPermissions } from '@/lib/hooks/useUserPermissions'

const mockUseUserPermissions = useUserPermissions as ReturnType<typeof vi.fn>

describe('PermissionGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('렌더링', () => {
    it('UT-GUARD-COMP-001: 권한이 있으면 children 렌더링', () => {
      mockUseUserPermissions.mockReturnValue({
        permissions: ['user:read'],
        isLoading: false,
        isAuthenticated: true,
      })

      render(
        <PermissionGuard action="read" subject="User">
          <button>접근 허용됨</button>
        </PermissionGuard>
      )

      expect(screen.getByText('접근 허용됨')).toBeInTheDocument()
    })

    it('UT-GUARD-COMP-002: 권한이 없으면 children 숨김', () => {
      mockUseUserPermissions.mockReturnValue({
        permissions: ['user:read'],
        isLoading: false,
        isAuthenticated: true,
      })

      render(
        <PermissionGuard action="delete" subject="User">
          <button>삭제 버튼</button>
        </PermissionGuard>
      )

      expect(screen.queryByText('삭제 버튼')).not.toBeInTheDocument()
    })

    it('UT-GUARD-COMP-003: 권한이 없으면 fallback 렌더링', () => {
      mockUseUserPermissions.mockReturnValue({
        permissions: ['user:read'],
        isLoading: false,
        isAuthenticated: true,
      })

      render(
        <PermissionGuard
          action="delete"
          subject="User"
          fallback={<span>권한이 없습니다</span>}
        >
          <button>삭제 버튼</button>
        </PermissionGuard>
      )

      expect(screen.queryByText('삭제 버튼')).not.toBeInTheDocument()
      expect(screen.getByText('권한이 없습니다')).toBeInTheDocument()
    })

    it('UT-GUARD-COMP-004: fallback 없으면 null 렌더링', () => {
      mockUseUserPermissions.mockReturnValue({
        permissions: [],
        isLoading: false,
        isAuthenticated: true,
      })

      const { container } = render(
        <PermissionGuard action="read" subject="User">
          <button>버튼</button>
        </PermissionGuard>
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('SYSTEM_ADMIN 권한', () => {
    it('UT-GUARD-COMP-005: all:manage 권한은 모든 접근 허용', () => {
      mockUseUserPermissions.mockReturnValue({
        permissions: ['all:manage'],
        isLoading: false,
        isAuthenticated: true,
      })

      render(
        <PermissionGuard action="delete" subject="Role">
          <button>역할 삭제</button>
        </PermissionGuard>
      )

      expect(screen.getByText('역할 삭제')).toBeInTheDocument()
    })
  })

  describe('로딩 상태', () => {
    it('UT-GUARD-COMP-006: 로딩 중일 때 fallback 렌더링', () => {
      mockUseUserPermissions.mockReturnValue({
        permissions: [],
        isLoading: true,
        isAuthenticated: false,
      })

      render(
        <PermissionGuard
          action="read"
          subject="User"
          fallback={<span>로딩 중...</span>}
        >
          <button>버튼</button>
        </PermissionGuard>
      )

      expect(screen.queryByText('버튼')).not.toBeInTheDocument()
      expect(screen.getByText('로딩 중...')).toBeInTheDocument()
    })

    it('UT-GUARD-COMP-007: 로딩 중 showWhileLoading으로 children 표시', () => {
      mockUseUserPermissions.mockReturnValue({
        permissions: [],
        isLoading: true,
        isAuthenticated: false,
      })

      render(
        <PermissionGuard
          action="read"
          subject="User"
          showWhileLoading
        >
          <button>버튼</button>
        </PermissionGuard>
      )

      expect(screen.getByText('버튼')).toBeInTheDocument()
    })
  })

  describe('미인증 상태', () => {
    it('UT-GUARD-COMP-008: 미인증 시 fallback 렌더링', () => {
      mockUseUserPermissions.mockReturnValue({
        permissions: [],
        isLoading: false,
        isAuthenticated: false,
      })

      render(
        <PermissionGuard
          action="read"
          subject="User"
          fallback={<span>로그인 필요</span>}
        >
          <button>버튼</button>
        </PermissionGuard>
      )

      expect(screen.queryByText('버튼')).not.toBeInTheDocument()
      expect(screen.getByText('로그인 필요')).toBeInTheDocument()
    })
  })
})
