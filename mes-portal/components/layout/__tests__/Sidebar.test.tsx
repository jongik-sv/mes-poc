// components/layout/__tests__/Sidebar.test.tsx
// Sidebar 컴포넌트 단위 테스트

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Sidebar, MenuItem, findMenuById, findMenuByPath, findParentKeys } from '../Sidebar'

// Mock 메뉴 데이터
const mockMenusSingle: MenuItem[] = [
  {
    id: '1',
    code: 'DASHBOARD',
    name: '대시보드',
    path: '/dashboard',
    icon: 'DashboardOutlined',
    sortOrder: 1,
    isActive: true,
  },
]

const mockMenus3Level: MenuItem[] = [
  {
    id: '1',
    code: 'DASHBOARD',
    name: '대시보드',
    path: '/dashboard',
    icon: 'DashboardOutlined',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: '2',
    code: 'PRODUCTION',
    name: '생산',
    icon: 'BuildOutlined',
    sortOrder: 2,
    isActive: true,
    children: [
      {
        id: '2-1',
        code: 'WORK_ORDER',
        name: '작업 지시',
        path: '/production/work-order',
        icon: 'FileTextOutlined',
        sortOrder: 1,
        isActive: true,
      },
      {
        id: '2-2',
        code: 'PRODUCTION_STATUS',
        name: '생산 현황',
        path: '/production/status',
        icon: 'LineChartOutlined',
        sortOrder: 2,
        isActive: true,
      },
    ],
  },
  {
    id: '3',
    code: 'SETTINGS',
    name: '설정',
    icon: 'SettingOutlined',
    sortOrder: 3,
    isActive: true,
    children: [
      {
        id: '3-1',
        code: 'USER',
        name: '사용자',
        icon: 'UserOutlined',
        sortOrder: 1,
        isActive: true,
        children: [
          {
            id: '3-1-1',
            code: 'USER_LIST',
            name: '사용자 관리',
            path: '/settings/user/list',
            sortOrder: 1,
            isActive: true,
          },
          {
            id: '3-1-2',
            code: 'ROLE',
            name: '역할 관리',
            path: '/settings/user/role',
            sortOrder: 2,
            isActive: true,
          },
        ],
      },
      {
        id: '3-2',
        code: 'SYSTEM',
        name: '시스템',
        icon: 'ControlOutlined',
        sortOrder: 2,
        isActive: true,
        children: [
          {
            id: '3-2-1',
            code: 'MENU_MANAGE',
            name: '메뉴 관리',
            path: '/settings/system/menu',
            sortOrder: 1,
            isActive: true,
          },
        ],
      },
    ],
  },
]

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // UT-001: 초기 렌더링 (펼침 상태)
  it('renders with expanded state by default', () => {
    render(
      <Sidebar
        menus={mockMenusSingle}
        collapsed={false}
        selectedKeys={[]}
        openKeys={[]}
      />
    )

    // 사이드바 컨테이너 확인
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toBeInTheDocument()

    // 메뉴 컴포넌트 확인
    const menu = screen.getByTestId('sidebar-menu')
    expect(menu).toBeInTheDocument()

    // 메뉴 아이템 확인
    expect(screen.getByText('대시보드')).toBeInTheDocument()
  })

  // UT-002: 토글 상태 변경
  it('renders correctly in collapsed state', () => {
    render(
      <Sidebar
        menus={mockMenusSingle}
        collapsed={true}
        selectedKeys={[]}
        openKeys={[]}
      />
    )

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toBeInTheDocument()

    // collapsed 상태에서는 Menu에 inlineCollapsed가 true로 설정됨
    const menu = screen.getByTestId('sidebar-menu')
    expect(menu).toBeInTheDocument()
  })

  // UT-003: 3단계 메뉴 렌더링
  it('renders up to 3 levels of menu', async () => {
    render(
      <Sidebar
        menus={mockMenus3Level}
        collapsed={false}
        selectedKeys={[]}
        openKeys={['3', '3-1']}
      />
    )

    // 1단계 메뉴 확인
    expect(screen.getByText('대시보드')).toBeInTheDocument()
    expect(screen.getByText('설정')).toBeInTheDocument()

    // 2단계 메뉴 확인 (설정 > 사용자)
    expect(screen.getByText('사용자')).toBeInTheDocument()

    // 3단계 메뉴 확인 (설정 > 사용자 > 사용자 관리)
    expect(screen.getByText('사용자 관리')).toBeInTheDocument()
    expect(screen.getByText('역할 관리')).toBeInTheDocument()
  })

  // UT-004: 메뉴 아이템 구조 확인 (아이콘 + 텍스트)
  it('renders menu item with icon and label', () => {
    render(
      <Sidebar
        menus={mockMenusSingle}
        collapsed={false}
        selectedKeys={[]}
        openKeys={[]}
      />
    )

    // 메뉴 텍스트 확인
    expect(screen.getByText('대시보드')).toBeInTheDocument()

    // 아이콘은 Ant Design에서 자동으로 렌더링되므로 존재 확인
    const menuItem = screen.getByText('대시보드').closest('li')
    expect(menuItem).toBeInTheDocument()
  })

  // UT-005: 선택 메뉴 강조
  it('highlights selected menu item', () => {
    render(
      <Sidebar
        menus={mockMenusSingle}
        collapsed={false}
        selectedKeys={['1']}
        openKeys={[]}
      />
    )

    // 선택된 메뉴 확인 (Ant Design Menu는 ant-menu-item-selected 클래스 추가)
    const menuItem = screen.getByText('대시보드').closest('li')
    expect(menuItem).toHaveClass('ant-menu-item-selected')
  })

  // UT-006: 메뉴 클릭 핸들러 호출
  it('calls onMenuClick when leaf menu clicked', async () => {
    const onMenuClick = vi.fn()

    render(
      <Sidebar
        menus={mockMenusSingle}
        collapsed={false}
        selectedKeys={[]}
        openKeys={[]}
        onMenuClick={onMenuClick}
      />
    )

    // 메뉴 클릭
    fireEvent.click(screen.getByText('대시보드'))

    // onMenuClick 호출 확인
    await waitFor(() => {
      expect(onMenuClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          code: 'DASHBOARD',
          path: '/dashboard',
        })
      )
    })
  })

  // UT-007: 서브메뉴 펼침/접힘 핸들러
  it('calls onOpenChange when submenu expanded/collapsed', async () => {
    const onOpenChange = vi.fn()

    render(
      <Sidebar
        menus={mockMenus3Level}
        collapsed={false}
        selectedKeys={[]}
        openKeys={[]}
        onOpenChange={onOpenChange}
      />
    )

    // 서브메뉴 클릭
    fireEvent.click(screen.getByText('생산'))

    // onOpenChange 호출 확인
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalled()
    })
  })

  // UT-008: 접근성 속성 확인
  it('has proper accessibility attributes', () => {
    render(
      <Sidebar
        menus={mockMenusSingle}
        collapsed={false}
        selectedKeys={[]}
        openKeys={[]}
      />
    )

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toHaveAttribute('role', 'navigation')
    expect(sidebar).toHaveAttribute('aria-label', '메인 메뉴')
  })

  // 비활성 메뉴 필터링 테스트
  it('filters out inactive menu items', () => {
    const menusWithInactive: MenuItem[] = [
      { ...mockMenusSingle[0] },
      {
        id: '2',
        code: 'INACTIVE',
        name: '비활성 메뉴',
        path: '/inactive',
        icon: 'WarningOutlined',
        sortOrder: 2,
        isActive: false,
      },
    ]

    render(
      <Sidebar
        menus={menusWithInactive}
        collapsed={false}
        selectedKeys={[]}
        openKeys={[]}
      />
    )

    expect(screen.getByText('대시보드')).toBeInTheDocument()
    expect(screen.queryByText('비활성 메뉴')).not.toBeInTheDocument()
  })
})

// 유틸리티 함수 테스트
describe('Sidebar Utility Functions', () => {
  describe('findMenuById', () => {
    it('finds menu by id in flat list', () => {
      const menu = findMenuById(mockMenusSingle, '1')
      expect(menu).not.toBeNull()
      expect(menu?.code).toBe('DASHBOARD')
    })

    it('finds menu by id in nested list', () => {
      const menu = findMenuById(mockMenus3Level, '3-1-1')
      expect(menu).not.toBeNull()
      expect(menu?.code).toBe('USER_LIST')
    })

    it('returns null for non-existent id', () => {
      const menu = findMenuById(mockMenus3Level, 'non-existent')
      expect(menu).toBeNull()
    })
  })

  describe('findMenuByPath', () => {
    it('finds menu by path', () => {
      const menu = findMenuByPath(mockMenus3Level, '/dashboard')
      expect(menu).not.toBeNull()
      expect(menu?.code).toBe('DASHBOARD')
    })

    it('finds nested menu by path', () => {
      const menu = findMenuByPath(mockMenus3Level, '/settings/user/list')
      expect(menu).not.toBeNull()
      expect(menu?.code).toBe('USER_LIST')
    })

    it('returns null for non-existent path', () => {
      const menu = findMenuByPath(mockMenus3Level, '/non-existent')
      expect(menu).toBeNull()
    })
  })

  describe('findParentKeys', () => {
    it('returns empty array for root level menu', () => {
      const parents = findParentKeys(mockMenus3Level, '1')
      expect(parents).toEqual([])
    })

    it('returns parent keys for nested menu', () => {
      const parents = findParentKeys(mockMenus3Level, '3-1-1')
      expect(parents).toContain('3')
      expect(parents).toContain('3-1')
    })

    it('returns correct parent chain for 2nd level', () => {
      const parents = findParentKeys(mockMenus3Level, '2-1')
      expect(parents).toContain('2')
      expect(parents).not.toContain('3')
    })
  })
})
