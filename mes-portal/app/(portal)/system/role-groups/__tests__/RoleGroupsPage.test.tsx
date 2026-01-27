import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RoleGroupsPage from '../page'

const mockRoleGroups = {
  success: true,
  data: {
    items: [
      {
        id: 1,
        roleGroupCd: 'RG_ADMIN',
        name: '관리자 그룹',
        description: '관리자 역할 그룹',
        systemId: 1,
        systemName: 'MES',
        roleCount: 3,
        userCount: 5,
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 2,
        roleGroupCd: 'RG_USER',
        name: '사용자 그룹',
        description: '일반 사용자 역할 그룹',
        systemId: 2,
        systemName: 'WMS',
        roleCount: 2,
        userCount: 10,
        isActive: false,
        createdAt: '2025-01-02T00:00:00Z',
      },
    ],
    total: 2,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
}

const mockSystems = {
  success: true,
  data: [
    { id: 1, name: 'MES' },
    { id: 2, name: 'WMS' },
  ],
}

const mockRoles = {
  success: true,
  data: [
    { id: 1, code: 'ROLE_ADMIN', name: '관리자' },
    { id: 2, code: 'ROLE_USER', name: '사용자' },
    { id: 3, code: 'ROLE_VIEWER', name: '조회자' },
  ],
}

const mockGroupRoles = {
  success: true,
  data: [
    { id: 1, code: 'ROLE_ADMIN', name: '관리자' },
  ],
}

function setupFetchMock() {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    if (url.includes('/api/role-groups') && url.includes('/roles')) {
      return Response.json(mockGroupRoles)
    }
    if (url.includes('/api/role-groups')) {
      return Response.json(mockRoleGroups)
    }
    if (url.includes('/api/systems')) {
      return Response.json(mockSystems)
    }
    if (url.includes('/api/roles')) {
      return Response.json(mockRoles)
    }
    return Response.json({ success: false })
  })
}

describe('RoleGroupsPage', () => {
  beforeEach(() => {
    setupFetchMock()
  })

  it('페이지 제목 "역할그룹 관리"를 렌더링한다', async () => {
    render(<RoleGroupsPage />)
    expect(screen.getByText('역할그룹 관리')).toBeInTheDocument()
  })

  it('테이블에 역할그룹 목록을 표시한다', async () => {
    render(<RoleGroupsPage />)
    await waitFor(() => {
      expect(screen.getByText('관리자 그룹')).toBeInTheDocument()
      expect(screen.getByText('RG_ADMIN')).toBeInTheDocument()
      expect(screen.getByText('사용자 그룹')).toBeInTheDocument()
      expect(screen.getByText('RG_USER')).toBeInTheDocument()
    })
  })

  it('등록 버튼 클릭 시 생성 모달이 열린다', async () => {
    const user = userEvent.setup()
    render(<RoleGroupsPage />)

    const createBtn = screen.getByRole('button', { name: /역할그룹 등록/ })
    await user.click(createBtn)

    await waitFor(() => {
      expect(screen.getByText('역할그룹 등록', { selector: '.ant-modal-title' })).toBeInTheDocument()
    })
  })

  it('생성 모달에 시스템 셀렉트 드롭다운이 존재한다', async () => {
    const user = userEvent.setup()
    render(<RoleGroupsPage />)

    const createBtn = screen.getByRole('button', { name: /역할그룹 등록/ })
    await user.click(createBtn)

    await waitFor(() => {
      expect(screen.getByText('역할그룹 등록', { selector: '.ant-modal-title' })).toBeInTheDocument()
    })

    // Verify system select placeholder is rendered
    expect(screen.getByText('소속 시스템을 선택하세요')).toBeInTheDocument()

    // Verify systems API was called
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/systems'))
  })

  it('역할 관리 버튼 클릭 시 역할 할당 모달이 열린다', async () => {
    const user = userEvent.setup()
    render(<RoleGroupsPage />)

    await waitFor(() => {
      expect(screen.getByText('관리자 그룹')).toBeInTheDocument()
    })

    const roleBtns = screen.getAllByRole('button', { name: /역할/ })
    // Find the "역할" button in the action column (not the header "역할그룹 등록")
    const roleManageBtn = roleBtns.find(btn => btn.textContent === '역할')
    expect(roleManageBtn).toBeTruthy()
    await user.click(roleManageBtn!)

    await waitFor(() => {
      expect(screen.getByText(/역할 관리/)).toBeInTheDocument()
    })
  })
})
