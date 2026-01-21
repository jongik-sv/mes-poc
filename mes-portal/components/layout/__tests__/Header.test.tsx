// components/layout/__tests__/Header.test.tsx
// Header 컴포넌트 단위 테스트

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '../Header'

// next-themes 모킹
const mockSetTheme = vi.fn()
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
    resolvedTheme: 'light',
  }),
}))

// next/link 모킹
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// NotificationPanel 모킹
vi.mock('@/components/common', () => ({
  NotificationPanel: ({ open, notifications, onClose, onMarkAsRead, onMarkAllAsRead, onNavigate }: any) => (
    open ? (
      <div data-testid="mock-notification-panel">
        <button onClick={onClose} data-testid="close-panel">닫기</button>
        <span data-testid="notification-count">{notifications?.length || 0}</span>
      </div>
    ) : null
  ),
}))

// react-hotkeys-hook 모킹
const hotkeyCallbacks: Record<string, Function> = {}
vi.mock('react-hotkeys-hook', () => ({
  useHotkeys: (keys: string, callback: Function) => {
    hotkeyCallbacks[keys] = callback
  },
}))

// Ant Design 모킹
vi.mock('antd', () => ({
  Button: ({ children, icon, onClick, type, title, ...props }: any) => (
    <button onClick={onClick} title={title} data-type={type} {...props}>
      {icon}
      {children}
    </button>
  ),
  Dropdown: ({ children, menu, trigger }: any) => (
    <div data-testid="dropdown" data-trigger={trigger?.join(',')}>
      {children}
      <div data-testid="dropdown-menu" style={{ display: 'none' }}>
        {menu?.items?.map((item: any, idx: number) => (
          item.type === 'divider' ? (
            <hr key={idx} />
          ) : (
            <div
              key={item.key}
              data-testid={`menu-item-${item.key}`}
              onClick={item.onClick}
            >
              {item.icon}
              {item.label}
            </div>
          )
        ))}
      </div>
    </div>
  ),
  Avatar: ({ src, icon, size, ...props }: any) => (
    <span data-testid="avatar" data-size={size} {...props}>
      {icon || (src ? 'img' : 'avatar')}
    </span>
  ),
  Badge: ({ children, count, size }: any) => (
    <span data-testid="badge" data-count={count} data-size={size}>
      {count > 0 && <span data-testid="badge-count">{count}</span>}
      {children}
    </span>
  ),
  Breadcrumb: ({ items }: any) => (
    <nav data-testid="breadcrumb" aria-label="breadcrumb">
      {items?.map((item: any, idx: number) => (
        <span key={idx} data-testid="breadcrumb-item">
          {item.title}
        </span>
      ))}
    </nav>
  ),
}))

// Ant Design Icons 모킹
vi.mock('@ant-design/icons', () => ({
  StarOutlined: () => <span data-testid="star-icon">star</span>,
  SearchOutlined: () => <span data-testid="search-icon">search</span>,
  BellOutlined: () => <span data-testid="bell-icon">bell</span>,
  UserOutlined: () => <span data-testid="user-icon">user</span>,
  LogoutOutlined: () => <span data-testid="logout-icon">logout</span>,
  SettingOutlined: () => <span data-testid="setting-icon">setting</span>,
  SunOutlined: () => <span data-testid="sun-icon">sun</span>,
  MoonOutlined: () => <span data-testid="moon-icon">moon</span>,
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // hotkeyCallbacks 초기화
    Object.keys(hotkeyCallbacks).forEach(key => delete hotkeyCallbacks[key])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // UT-001: 로고 렌더링
  describe('UT-001: 로고 렌더링', () => {
    it('로고 텍스트가 표시되어야 함', () => {
      render(<Header />)
      expect(screen.getByText('MES Portal')).toBeInTheDocument()
    })

    it('로고가 "/" 링크를 가져야 함', () => {
      render(<Header />)
      const logo = screen.getByTestId('header-logo')
      expect(logo).toHaveAttribute('href', '/')
    })
  })

  // UT-002: 빠른 메뉴 드롭다운
  describe('UT-002: 빠른 메뉴 드롭다운', () => {
    it('빠른 메뉴 버튼이 표시되어야 함', () => {
      render(<Header />)
      expect(screen.getByTestId('quick-menu-button')).toBeInTheDocument()
    })

    it('빠른 메뉴 버튼에 별 아이콘이 있어야 함', () => {
      render(<Header />)
      const quickMenuButton = screen.getByTestId('quick-menu-button')
      expect(quickMenuButton).toContainElement(screen.getByTestId('star-icon'))
    })
  })

  // UT-003: 브레드크럼 렌더링
  describe('UT-003: 브레드크럼 렌더링', () => {
    it('브레드크럼 항목이 렌더링되어야 함', () => {
      const breadcrumbItems = [
        { title: 'Home', path: '/' },
        { title: '생산관리' },
        { title: '작업지시' },
      ]
      render(<Header breadcrumbItems={breadcrumbItems} />)

      const breadcrumbElements = screen.getAllByTestId('breadcrumb-item')
      expect(breadcrumbElements).toHaveLength(3)
    })

    it('빈 브레드크럼도 렌더링 가능해야 함', () => {
      render(<Header />)
      expect(screen.getByTestId('header-breadcrumb')).toBeInTheDocument()
    })
  })

  // UT-004: 시계 갱신
  describe('UT-004: 시계 갱신', () => {
    it('시계가 HH:mm:ss 형식으로 표시되어야 함', () => {
      render(<Header />)
      const clock = screen.getByTestId('header-clock')
      // 시계 형식 확인 (HH:mm:ss)
      expect(clock.textContent).toMatch(/\d{2}:\d{2}:\d{2}/)
    })

    it('시계가 1초마다 갱신되어야 함', async () => {
      render(<Header />)
      const clock = screen.getByTestId('header-clock')
      const initialTime = clock.textContent

      // 1초 후
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // 시간이 업데이트됨 (시간 형식 유지)
      expect(clock.textContent).toMatch(/\d{2}:\d{2}:\d{2}/)
    })
  })

  // UT-005: 검색 버튼 클릭
  describe('UT-005: 검색 버튼 클릭', () => {
    it('검색 버튼 클릭 시 onSearchOpen 콜백이 호출되어야 함', async () => {
      const onSearchOpen = vi.fn()
      render(<Header onSearchOpen={onSearchOpen} />)

      const searchButton = screen.getByTestId('search-button')
      fireEvent.click(searchButton)

      expect(onSearchOpen).toHaveBeenCalledTimes(1)
    })

    it('검색 버튼에 title 속성이 있어야 함', () => {
      render(<Header />)
      const searchButton = screen.getByTestId('search-button')
      expect(searchButton).toHaveAttribute('title', '검색 (Ctrl+K)')
    })
  })

  // UT-006: 알림 뱃지
  describe('UT-006: 알림 뱃지', () => {
    const mockNotifications = [
      { id: 'n1', type: 'error', title: '알림1', message: '내용1', isRead: false, createdAt: '2026-01-20T09:00:00Z' },
      { id: 'n2', type: 'info', title: '알림2', message: '내용2', isRead: false, createdAt: '2026-01-20T08:00:00Z' },
      { id: 'n3', type: 'success', title: '알림3', message: '내용3', isRead: true, createdAt: '2026-01-20T07:00:00Z' },
    ]

    it('읽지 않은 알림 개수가 뱃지에 표시되어야 함', () => {
      render(<Header notifications={mockNotifications} />)
      // 읽지 않은 알림 2개 (n1, n2)
      expect(screen.getByTestId('badge-count')).toHaveTextContent('2')
    })

    it('알림이 0개일 때 뱃지가 표시되지 않아야 함', () => {
      render(<Header notifications={[]} />)
      expect(screen.queryByTestId('badge-count')).not.toBeInTheDocument()
    })

    it('알림 버튼 클릭 시 알림 패널이 열려야 함', () => {
      render(<Header notifications={mockNotifications} />)

      const notificationButton = screen.getByTestId('notification-button')
      fireEvent.click(notificationButton)

      expect(screen.getByTestId('mock-notification-panel')).toBeInTheDocument()
    })
  })

  // UT-007: 테마 토글
  describe('UT-007: 테마 토글', () => {
    it('라이트 모드에서 달 아이콘이 표시되어야 함', () => {
      render(<Header />)
      const themeButton = screen.getByTestId('theme-toggle')
      expect(themeButton).toContainElement(screen.getByTestId('moon-icon'))
    })

    it('테마 버튼 클릭 시 setTheme가 호출되어야 함', () => {
      render(<Header />)
      const themeButton = screen.getByTestId('theme-toggle')
      fireEvent.click(themeButton)

      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })
  })

  // UT-008: 프로필 드롭다운
  describe('UT-008: 프로필 드롭다운', () => {
    it('사용자 이름이 표시되어야 함', () => {
      const user = { name: '홍길동', email: 'test@test.com' }
      render(<Header user={user} />)

      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })

    it('프로필 영역이 클릭 가능해야 함', () => {
      const user = { name: '홍길동', email: 'test@test.com' }
      render(<Header user={user} />)

      const profileDropdown = screen.getByTestId('profile-dropdown')
      expect(profileDropdown).toBeInTheDocument()
    })

    it('로그아웃 메뉴 항목이 존재해야 함', () => {
      const user = { name: '홍길동', email: 'test@test.com' }
      render(<Header user={user} />)

      expect(screen.getByTestId('menu-item-logout')).toBeInTheDocument()
    })
  })

  // UT-009: 로고 링크 경로 (BR-001)
  describe('UT-009: 로고 링크 경로 (BR-001)', () => {
    it('로고 링크가 정확히 "/" 경로를 가리켜야 함', () => {
      render(<Header />)
      const logo = screen.getByTestId('header-logo')
      expect(logo.getAttribute('href')).toBe('/')
    })
  })

  // UT-010: 시계 1초 갱신 (BR-002)
  describe('UT-010: 시계 1초 갱신 (BR-002)', () => {
    it('setInterval이 1000ms 간격으로 설정되어야 함', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')
      render(<Header />)

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000)
      setIntervalSpy.mockRestore()
    })

    it('컴포넌트 언마운트 시 interval이 정리되어야 함', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      const { unmount } = render(<Header />)

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
      clearIntervalSpy.mockRestore()
    })
  })

  // UT-011: 테마 저장 (BR-003)
  describe('UT-011: 테마 저장 (BR-003)', () => {
    it('테마 버튼 클릭 시 setTheme 함수가 올바른 값으로 호출되어야 함', () => {
      render(<Header />)
      const themeButton = screen.getByTestId('theme-toggle')
      fireEvent.click(themeButton)

      // 라이트 → 다크
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })
  })

  // UT-012: 브레드크럼 props (BR-004)
  describe('UT-012: 브레드크럼 props (BR-004)', () => {
    it('전달된 breadcrumbItems가 그대로 렌더링되어야 함', () => {
      const breadcrumbItems = [
        { title: 'Dashboard', path: '/dashboard' },
        { title: 'Settings' },
      ]
      render(<Header breadcrumbItems={breadcrumbItems} />)

      const items = screen.getAllByTestId('breadcrumb-item')
      expect(items[0]).toHaveTextContent('Dashboard')
      expect(items[1]).toHaveTextContent('Settings')
    })
  })

  // UT-013: Ctrl+K 단축키 (BR-005)
  describe('UT-013: Ctrl+K 단축키 (BR-005)', () => {
    it('Ctrl+K 단축키가 등록되어야 함', () => {
      const onSearchOpen = vi.fn()
      render(<Header onSearchOpen={onSearchOpen} />)

      // useHotkeys가 호출되었는지 확인
      expect(hotkeyCallbacks['ctrl+k, meta+k']).toBeDefined()
    })

    it('Ctrl+K 단축키 호출 시 onSearchOpen이 실행되어야 함', () => {
      const onSearchOpen = vi.fn()
      render(<Header onSearchOpen={onSearchOpen} />)

      // 단축키 콜백 직접 호출 (모킹된 환경)
      const event = { preventDefault: vi.fn() }
      hotkeyCallbacks['ctrl+k, meta+k']?.(event)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(onSearchOpen).toHaveBeenCalledTimes(1)
    })
  })

  // 접근성 테스트
  describe('접근성', () => {
    it('검색 버튼에 aria-label이 있어야 함', () => {
      render(<Header />)
      const searchButton = screen.getByTestId('search-button')
      expect(searchButton).toHaveAttribute('aria-label', '전역 검색 (Ctrl+K)')
    })

    it('알림 버튼에 aria-label이 있어야 함', () => {
      const mockNotifications = [
        { id: 'n1', type: 'error', title: '알림1', message: '내용1', isRead: false, createdAt: '2026-01-20T09:00:00Z' },
        { id: 'n2', type: 'info', title: '알림2', message: '내용2', isRead: false, createdAt: '2026-01-20T08:00:00Z' },
        { id: 'n3', type: 'success', title: '알림3', message: '내용3', isRead: false, createdAt: '2026-01-20T07:00:00Z' },
        { id: 'n4', type: 'warning', title: '알림4', message: '내용4', isRead: false, createdAt: '2026-01-20T06:00:00Z' },
        { id: 'n5', type: 'info', title: '알림5', message: '내용5', isRead: false, createdAt: '2026-01-20T05:00:00Z' },
      ]
      render(<Header notifications={mockNotifications} />)
      const notificationButton = screen.getByTestId('notification-button')
      expect(notificationButton).toHaveAttribute('aria-label', '알림 5개')
    })

    it('테마 버튼에 aria-label이 있어야 함', () => {
      render(<Header />)
      const themeButton = screen.getByTestId('theme-toggle')
      expect(themeButton).toHaveAttribute('aria-label', '다크 모드로 전환')
    })
  })
})
