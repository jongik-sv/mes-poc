import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { App } from 'antd'
import RoleGroupsPage from '../page'

function renderWithApp(ui: React.ReactElement) {
  return render(<App>{ui}</App>)
}

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
    { id: 1, roleCd: 'ROLE_ADMIN', name: '관리자', isActive: true, systemId: 1 },
    { id: 2, roleCd: 'ROLE_USER', name: '사용자', isActive: true, systemId: 1 },
    { id: 3, roleCd: 'ROLE_VIEWER', name: '조회자', isActive: true, systemId: 1 },
  ],
}

const mockGroupRoles = {
  success: true,
  data: [
    { id: 1, roleCd: 'ROLE_ADMIN', name: '관리자', isActive: true, systemId: 1 },
  ],
}

const mockPermissions = {
  success: true,
  data: [
    { id: 1, permissionCd: 'PERM_READ', name: '읽기', isActive: true, menuId: null, config: '{}' },
  ],
}

const mockRolePermissions = {
  success: true,
  data: [
    { id: 1, permissionCd: 'PERM_READ', name: '읽기', isActive: true, menuId: null, config: '{}' },
  ],
}

function setupFetchMock() {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    if (url.match(/\/api\/roles\/\d+\/permissions/)) {
      return Response.json(mockRolePermissions)
    }
    if (url.match(/\/api\/role-groups\/\d+\/roles/)) {
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
    if (url.includes('/api/permissions')) {
      return Response.json(mockPermissions)
    }
    return Response.json({ success: false })
  })
}

describe('RoleGroupsPage', () => {
  beforeEach(() => {
    setupFetchMock()
  })

  it('페이지 제목 "역할그룹 정의"를 렌더링한다', async () => {
    renderWithApp(<RoleGroupsPage />)
    expect(screen.getByText('역할그룹 정의')).toBeInTheDocument()
  })

  it('3-column 레이아웃이 렌더링된다', async () => {
    renderWithApp(<RoleGroupsPage />)
    expect(screen.getByText('역할그룹 목록')).toBeInTheDocument()
    expect(screen.getByText('역할 관리')).toBeInTheDocument()
    expect(screen.getByText('권한 관리')).toBeInTheDocument()
  })

  it('테이블에 역할그룹 목록을 표시한다', async () => {
    renderWithApp(<RoleGroupsPage />)
    await waitFor(() => {
      expect(screen.getByText('관리자 그룹')).toBeInTheDocument()
      expect(screen.getByText('RG_ADMIN')).toBeInTheDocument()
      expect(screen.getByText('사용자 그룹')).toBeInTheDocument()
      expect(screen.getByText('RG_USER')).toBeInTheDocument()
    })
  })

  it('역할그룹 미선택 시 중앙 패널에 안내 메시지를 표시한다', async () => {
    renderWithApp(<RoleGroupsPage />)
    expect(screen.getByText('역할그룹을 선택해주세요')).toBeInTheDocument()
  })

  it('역할 미선택 시 우측 패널에 안내 메시지를 표시한다', async () => {
    renderWithApp(<RoleGroupsPage />)
    expect(screen.getByText('역할그룹을 먼저 선택해주세요')).toBeInTheDocument()
  })

  it('역할그룹 행 클릭 시 중앙 역할 패널이 갱신된다', async () => {
    const user = userEvent.setup()
    renderWithApp(<RoleGroupsPage />)

    await waitFor(() => {
      expect(screen.getByText('관리자 그룹')).toBeInTheDocument()
    })

    await user.click(screen.getByText('관리자 그룹'))

    await waitFor(() => {
      expect(screen.getByText('역할 관리 — 관리자 그룹')).toBeInTheDocument()
    })
  })

  it('등록 버튼 클릭 시 역할그룹 등록 모달이 열린다', async () => {
    const user = userEvent.setup()
    renderWithApp(<RoleGroupsPage />)

    const createBtns = screen.getAllByRole('button', { name: /등록/ })
    await user.click(createBtns[0])

    await waitFor(() => {
      expect(screen.getByText('역할그룹 등록')).toBeInTheDocument()
    })
  })

  it('시스템 필터와 상태 필터가 렌더링된다', async () => {
    renderWithApp(<RoleGroupsPage />)
    expect(screen.getByPlaceholderText('이름 또는 코드 검색')).toBeInTheDocument()
  })
})
