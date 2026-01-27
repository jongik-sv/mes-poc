import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RolesPage from '../page'

const mockRoles = [
  { id: 1, code: 'ADMIN', name: '관리자', description: '시스템 관리자', parentId: null, level: 0, isSystem: true, isActive: true, createdAt: '2024-01-01' },
  { id: 2, code: 'USER', name: '사용자', description: '일반 사용자', parentId: null, level: 0, isSystem: false, isActive: true, createdAt: '2024-01-01' },
]

const mockPermissions = [
  { id: 1, code: 'USER_READ', name: '사용자 조회', type: 'MENU', resource: 'users', action: 'read', description: null },
  { id: 2, code: 'USER_WRITE', name: '사용자 수정', type: 'MENU', resource: 'users', action: 'write', description: null },
]

const mockMenus = [
  { id: 1, name: '시스템 관리', code: 'SYSTEM', parentId: null, category: 'SYSTEM', children: [
    { id: 2, name: '사용자 관리', code: 'USERS', parentId: 1, category: 'SYSTEM', children: [] },
  ]},
]

const mockRolePermissions = [
  { id: 1, code: 'USER_READ', name: '사용자 조회', type: 'MENU', resource: 'users', action: 'read', description: null },
]

const mockMenuPermissions = [
  { id: 1, code: 'USER_READ', name: '사용자 조회', type: 'MENU', resource: 'users', action: 'read', menuId: 2 },
  { id: 2, code: 'USER_WRITE', name: '사용자 수정', type: 'MENU', resource: 'users', action: 'write', menuId: 2 },
]

beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation((url) => {
    const urlStr = typeof url === 'string' ? url : url.toString()
    if (urlStr === '/api/roles') {
      return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockRoles }) } as Response)
    }
    if (urlStr === '/api/permissions') {
      return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockPermissions }) } as Response)
    }
    if (urlStr === '/api/menus') {
      return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockMenus }) } as Response)
    }
    if (urlStr.match(/\/api\/roles\/\d+\/permissions$/)) {
      return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockRolePermissions }) } as Response)
    }
    if (urlStr.match(/\/api\/permissions\?menuId=/)) {
      return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockMenuPermissions }) } as Response)
    }
    return Promise.resolve({ json: () => Promise.resolve({ success: true, data: [] }) } as Response)
  })
})

describe('RolesPage', () => {
  it('기존 역할 목록이 정상적으로 렌더링된다', async () => {
    render(<RolesPage />)
    await waitFor(() => {
      expect(screen.getByText('역할 관리')).toBeInTheDocument()
      expect(screen.getByText('관리자')).toBeInTheDocument()
      expect(screen.getByText('사용자')).toBeInTheDocument()
    })
  })

  it('역할 등록 버튼이 표시된다', async () => {
    render(<RolesPage />)
    await waitFor(() => {
      expect(screen.getByText('역할 등록')).toBeInTheDocument()
    })
  })

  it('역할 행 클릭 시 상세 Drawer가 열리고 권한 할당 탭이 표시된다', async () => {
    const user = userEvent.setup()
    render(<RolesPage />)

    await waitFor(() => {
      expect(screen.getByText('관리자')).toBeInTheDocument()
    })

    // Click the row to open detail drawer
    await user.click(screen.getByText('관리자'))

    await waitFor(() => {
      expect(screen.getByText('기본 정보')).toBeInTheDocument()
      expect(screen.getByText('권한 할당')).toBeInTheDocument()
    })
  })

  it('권한 할당 탭에서 메뉴 트리가 표시된다', async () => {
    const user = userEvent.setup()
    render(<RolesPage />)

    await waitFor(() => {
      expect(screen.getByText('관리자')).toBeInTheDocument()
    })

    await user.click(screen.getByText('관리자'))

    await waitFor(() => {
      expect(screen.getByText('권한 할당')).toBeInTheDocument()
    })

    // Click permission assignment tab
    await user.click(screen.getByText('권한 할당'))

    await waitFor(() => {
      expect(screen.getByText('시스템 관리')).toBeInTheDocument()
    })
  })
})
