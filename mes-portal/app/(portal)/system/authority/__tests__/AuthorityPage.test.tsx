import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { App } from 'antd'
import AuthorityPage from '../page'

function renderWithApp(ui: React.ReactElement) {
  return render(<App>{ui}</App>)
}

const mockUsers = [
  { userId: 'user1', name: '홍길동', email: 'hong@test.com', isActive: true },
  { userId: 'user2', name: '김철수', email: 'kim@test.com', isActive: false },
]

const mockAssignedRoleGroups = [
  { roleGroupId: 1, roleGroupCd: 'RG_ADMIN', name: '관리자 그룹', description: null, systemId: 1, isActive: true },
]

const mockAllRoleGroups = [
  { roleGroupId: 1, roleGroupCd: 'RG_ADMIN', name: '관리자 그룹', description: null, systemId: 1, isActive: true },
  { roleGroupId: 2, roleGroupCd: 'RG_USER', name: '사용자 그룹', description: null, systemId: 1, isActive: true },
]

const mockMenuSimulation = {
  menus: [
    {
      key: '1',
      title: '생산관리',
      icon: 'BuildOutlined',
      children: [
        { key: '2', title: '작업지시', icon: 'FileTextOutlined', path: '/production/order' },
      ],
    },
  ],
  summary: { totalMenus: 1, totalCategories: 1 },
}

beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation((url, options) => {
    const urlStr = typeof url === 'string' ? url : url.toString()
    const method = (options as RequestInit | undefined)?.method || 'GET'

    if (urlStr === '/api/users' && method === 'GET') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: mockUsers }) } as Response)
    }
    if (urlStr.match(/\/api\/users\/[^/]+\/role-groups$/) && method === 'GET') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: mockAssignedRoleGroups }) } as Response)
    }
    if (urlStr === '/api/role-groups' && method === 'GET') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: mockAllRoleGroups }) } as Response)
    }
    if (urlStr.match(/\/api\/users\/[^/]+\/menus/) && method === 'GET') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: mockMenuSimulation }) } as Response)
    }
    if (method === 'PUT') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) } as Response)
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) } as Response)
  })
})

describe('AuthorityPage (3-column)', () => {
  it('AT-001: 페이지 타이틀 렌더링', async () => {
    renderWithApp(<AuthorityPage />)
    await waitFor(() => {
      expect(screen.getByText('사용자 권한 할당')).toBeInTheDocument()
    })
  })

  it('AT-002: 사용자 목록 렌더링', async () => {
    renderWithApp(<AuthorityPage />)
    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
      expect(screen.getByText('김철수')).toBeInTheDocument()
    })
  })

  it('AT-003: 사용자 선택 시 역할그룹 및 메뉴 시뮬레이션 로드', async () => {
    const user = userEvent.setup()
    renderWithApp(<AuthorityPage />)

    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })

    await user.click(screen.getByText('홍길동'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/user1/role-groups')
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/user1/menus')
      )
    })
  })

  it('AT-004: 사용자 미선택 시 Empty 표시', async () => {
    renderWithApp(<AuthorityPage />)
    await waitFor(() => {
      const empties = screen.getAllByText('사용자를 선택해주세요')
      expect(empties.length).toBe(2) // 중앙 + 우측 패널
    })
  })

  it('AT-005: 메뉴 시뮬레이션 트리 렌더링', async () => {
    const user = userEvent.setup()
    renderWithApp(<AuthorityPage />)

    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })

    await user.click(screen.getByText('홍길동'))

    await waitFor(() => {
      expect(screen.getByText('생산관리')).toBeInTheDocument()
      expect(screen.getByText('작업지시')).toBeInTheDocument()
    })
  })

  it('AT-006: 메뉴 시뮬레이션 요약 정보 표시', async () => {
    const user = userEvent.setup()
    renderWithApp(<AuthorityPage />)

    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })

    await user.click(screen.getByText('홍길동'))

    await waitFor(() => {
      expect(screen.getByText(/1개 메뉴/)).toBeInTheDocument()
      expect(screen.getByText(/1개 카테고리/)).toBeInTheDocument()
    })
  })

  it('AT-007: 할당 저장 버튼 동작', async () => {
    const user = userEvent.setup()
    renderWithApp(<AuthorityPage />)

    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })

    await user.click(screen.getByText('홍길동'))

    await waitFor(() => {
      expect(screen.getByText('할당 저장')).toBeInTheDocument()
    })

    await user.click(screen.getByText('할당 저장'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/user1/role-groups'),
        expect.objectContaining({ method: 'PUT' })
      )
    })
  })

  it('AT-008: 미저장 변경 시 다른 사용자 선택 경고', async () => {
    const user = userEvent.setup()
    renderWithApp(<AuthorityPage />)

    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })

    // 첫 번째 사용자 선택
    await user.click(screen.getByText('홍길동'))

    await waitFor(() => {
      expect(screen.getAllByText('관리자 그룹').length).toBeGreaterThanOrEqual(1)
    })

    // 체크박스 변경 (사용자 그룹 추가)
    const checkboxes = await screen.findAllByRole('checkbox')
    const userGroupCheckbox = checkboxes.find((cb) => {
      const row = cb.closest('tr')
      return row?.textContent?.includes('사용자 그룹')
    })
    if (userGroupCheckbox) {
      await user.click(userGroupCheckbox)
    }

    // 다른 사용자 선택 시도
    await user.click(screen.getByText('김철수'))

    await waitFor(() => {
      expect(screen.getByText('미저장 변경사항')).toBeInTheDocument()
    })
  })
})
