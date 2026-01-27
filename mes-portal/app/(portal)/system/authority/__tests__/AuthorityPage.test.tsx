import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AuthorityPage from '../page'

const mockUsers = [
  { id: 1, name: '홍길동', email: 'hong@test.com', isActive: true },
  { id: 2, name: '김철수', email: 'kim@test.com', isActive: false },
]

const mockOwnedRoleGroups = [
  { id: 1, code: 'RG_ADMIN', name: '관리자 그룹', isActive: true },
]

const mockAllRoleGroups = [
  { id: 1, code: 'RG_ADMIN', name: '관리자 그룹', isActive: true },
  { id: 2, code: 'RG_USER', name: '사용자 그룹', isActive: true },
  { id: 3, code: 'RG_VIEWER', name: '뷰어 그룹', isActive: false },
]

const mockOwnedRoles = [
  { id: 1, code: 'ADMIN', name: '관리자', isActive: true },
]

const mockAllRoles = [
  { id: 1, code: 'ADMIN', name: '관리자', isActive: true },
  { id: 2, code: 'USER', name: '일반 사용자', isActive: true },
]

const mockOwnedPermissions = [
  { id: 1, code: 'USER_READ', name: '사용자 조회', type: 'MENU', resource: 'users', action: 'read' },
]

const mockAllPermissions = [
  { id: 1, code: 'USER_READ', name: '사용자 조회', type: 'MENU', resource: 'users', action: 'read' },
  { id: 2, code: 'USER_WRITE', name: '사용자 수정', type: 'MENU', resource: 'users', action: 'write' },
]

beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation((url, options) => {
    const urlStr = typeof url === 'string' ? url : url.toString()
    const method = (options as RequestInit | undefined)?.method || 'GET'

    // GET /api/users
    if (urlStr.includes('/api/users') && !urlStr.includes('/role-groups') && method === 'GET') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: mockUsers }) } as Response)
    }
    // GET /api/users/:id/role-groups
    if (urlStr.match(/\/api\/users\/\d+\/role-groups$/) && method === 'GET') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: mockOwnedRoleGroups }) } as Response)
    }
    // GET /api/role-groups (all)
    if (urlStr === '/api/role-groups' && method === 'GET') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: mockAllRoleGroups }) } as Response)
    }
    // GET /api/role-groups/:id/roles
    if (urlStr.match(/\/api\/role-groups\/\d+\/roles$/) && method === 'GET') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: mockOwnedRoles }) } as Response)
    }
    // GET /api/roles (all)
    if (urlStr === '/api/roles' && method === 'GET') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: mockAllRoles }) } as Response)
    }
    // GET /api/roles/:id/permissions
    if (urlStr.match(/\/api\/roles\/\d+\/permissions$/) && method === 'GET') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: mockOwnedPermissions }) } as Response)
    }
    // GET /api/permissions (all)
    if (urlStr === '/api/permissions' && method === 'GET') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: mockAllPermissions }) } as Response)
    }
    // PUT (save) endpoints
    if (method === 'PUT') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) } as Response)
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) } as Response)
  })
})

describe('AuthorityPage', () => {
  it('AT-001: 페이지 타이틀 "권한 통합 관리" 렌더링', async () => {
    render(<AuthorityPage />)
    await waitFor(() => {
      expect(screen.getByText('권한 통합 관리')).toBeInTheDocument()
    })
  })

  it('AT-002: 사용자 목록 렌더링', async () => {
    render(<AuthorityPage />)
    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
      expect(screen.getByText('김철수')).toBeInTheDocument()
    })
  })

  it('AT-003: 사용자 선택 시 역할그룹 로드', async () => {
    const user = userEvent.setup()
    render(<AuthorityPage />)

    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })

    await user.click(screen.getByText('홍길동'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/1/role-groups')
      )
      // "관리자 그룹" appears in both owned and all tables
      expect(screen.getAllByText('관리자 그룹').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('AT-004: 역할그룹 선택 시 역할 로드', async () => {
    const user = userEvent.setup()
    render(<AuthorityPage />)

    // Select user first
    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })
    await user.click(screen.getByText('홍길동'))

    await waitFor(() => {
      expect(screen.getAllByText('관리자 그룹').length).toBeGreaterThanOrEqual(1)
    })

    // Click on the first "관리자 그룹" (owned table)
    await user.click(screen.getAllByText('관리자 그룹')[0])

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/role-groups/1/roles')
      )
    })
  })

  it('AT-005: 역할 선택 시 권한 로드', async () => {
    const user = userEvent.setup()
    render(<AuthorityPage />)

    // Select user
    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })
    await user.click(screen.getByText('홍길동'))

    await waitFor(() => {
      expect(screen.getAllByText('관리자 그룹').length).toBeGreaterThanOrEqual(1)
    })

    // Select role group
    await user.click(screen.getAllByText('관리자 그룹')[0])

    await waitFor(() => {
      // "관리자" appears in both owned and all roles tables
      expect(screen.getAllByText('관리자').length).toBeGreaterThanOrEqual(1)
    })

    // Click on owned role row (first "관리자")
    await user.click(screen.getAllByText('관리자')[0])

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/roles/1/permissions')
      )
    })
  })

  it('AT-006: 변경 확인 모달 표시', async () => {
    const user = userEvent.setup()
    render(<AuthorityPage />)

    // Select user to enable role group panel
    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })
    await user.click(screen.getByText('홍길동'))

    await waitFor(() => {
      expect(screen.getAllByText('관리자 그룹').length).toBeGreaterThanOrEqual(1)
    })

    // Find the checkbox for "사용자 그룹" in the all-rolegroups panel to make a change
    const allRoleGroupsCheckboxes = await screen.findAllByRole('checkbox')
    // Click a checkbox to add an unowned role group
    const unownedCheckbox = allRoleGroupsCheckboxes.find((cb) => {
      const row = cb.closest('tr')
      return row?.textContent?.includes('사용자 그룹')
    })
    if (unownedCheckbox) {
      await user.click(unownedCheckbox)
    }

    // Click save button for role groups
    const saveButtons = screen.getAllByText('저장')
    await user.click(saveButtons[0])

    await waitFor(() => {
      expect(screen.getByText('변경 확인')).toBeInTheDocument()
    })
  })
})
