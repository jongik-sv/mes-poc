import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UsersPage from '../page'

const mockUsers = [
  { id: 1, email: 'admin@test.com', name: '홍길동', phone: null, department: '시스템', isActive: true, isLocked: false, roles: [{ id: 1, code: 'ADMIN', name: '관리자' }], lastLoginAt: null, createdAt: '2024-01-01' },
  { id: 2, email: 'user@test.com', name: '김철수', phone: null, department: '개발', isActive: true, isLocked: false, roles: [{ id: 2, code: 'USER', name: '사용자' }], lastLoginAt: null, createdAt: '2024-01-01' },
]

const mockRoles = [
  { id: 1, code: 'ADMIN', name: '관리자' },
  { id: 2, code: 'USER', name: '사용자' },
]

const mockRoleGroups = [
  { id: 1, roleGroupCd: 'RG001', name: '관리자 그룹', system: 'MES', roles: [{ id: 1, code: 'ADMIN', name: '관리자' }] },
]

const mockUserSystems = [
  { systemId: 'MES', name: 'MES 시스템', menuSet: '기본 메뉴셋' },
]

const mockUserPermissions = [
  { menuName: '사용자 관리', actions: ['read', 'write'], fieldConstraints: [] },
]

beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation((url, options) => {
    const urlStr = typeof url === 'string' ? url : url.toString()
    if (urlStr.startsWith('/api/users') && !urlStr.includes('/role-groups') && !urlStr.includes('/systems') && !urlStr.includes('/permissions') && !urlStr.includes('/lock') && !urlStr.includes('/unlock') && !urlStr.includes('/password') && !urlStr.includes('/roles')) {
      if (urlStr === '/api/users' || urlStr.startsWith('/api/users?')) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockUsers, pagination: { page: 1, pageSize: 20, total: 2, totalPages: 1 } }) } as Response)
      }
    }
    if (urlStr === '/api/roles') {
      return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockRoles }) } as Response)
    }
    if (urlStr.match(/\/api\/users\/\d+\/role-groups$/)) {
      return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockRoleGroups }) } as Response)
    }
    if (urlStr.match(/\/api\/users\/\d+\/systems$/)) {
      return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockUserSystems }) } as Response)
    }
    if (urlStr.match(/\/api\/users\/\d+\/permissions$/)) {
      return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockUserPermissions }) } as Response)
    }
    return Promise.resolve({ json: () => Promise.resolve({ success: true, data: [] }) } as Response)
  })
})

describe('UsersPage', () => {
  it('기존 사용자 목록이 정상적으로 렌더링된다', async () => {
    render(<UsersPage />)
    await waitFor(() => {
      expect(screen.getByText('사용자 관리')).toBeInTheDocument()
      expect(screen.getByText('admin@test.com')).toBeInTheDocument()
    })
  })

  it('사용자 등록 버튼이 표시된다', async () => {
    render(<UsersPage />)
    await waitFor(() => {
      expect(screen.getByText('사용자 등록')).toBeInTheDocument()
    })
  })

  it('사용자 행 클릭 시 상세 Drawer가 열리고 탭들이 표시된다', async () => {
    const user = userEvent.setup()
    render(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })

    // Click the user name to open detail drawer
    await user.click(screen.getByText('홍길동'))

    await waitFor(() => {
      expect(screen.getByText('역할그룹')).toBeInTheDocument()
      expect(screen.getByText('시스템 접근')).toBeInTheDocument()
      expect(screen.getByText('최종 권한')).toBeInTheDocument()
    })
  })

  it('역할그룹 탭에서 역할 그룹 목록이 표시된다', async () => {
    const user = userEvent.setup()
    render(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })

    await user.click(screen.getByText('홍길동'))

    await waitFor(() => {
      expect(screen.getByText('관리자 그룹')).toBeInTheDocument()
    })
  })

  it('시스템 접근 탭이 표시된다', async () => {
    const user = userEvent.setup()
    render(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })

    await user.click(screen.getByText('홍길동'))

    await waitFor(() => {
      expect(screen.getByText('시스템 접근')).toBeInTheDocument()
    })

    await user.click(screen.getByText('시스템 접근'))

    await waitFor(() => {
      expect(screen.getByText('MES 시스템')).toBeInTheDocument()
    })
  })

  it('최종 권한 탭이 표시된다', async () => {
    const user = userEvent.setup()
    render(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })

    await user.click(screen.getByText('홍길동'))

    await waitFor(() => {
      expect(screen.getByText('최종 권한')).toBeInTheDocument()
    })

    await user.click(screen.getByText('최종 권한'))

    await waitFor(() => {
      expect(screen.getByText('read')).toBeInTheDocument()
      expect(screen.getByText('write')).toBeInTheDocument()
    })
  })
})
