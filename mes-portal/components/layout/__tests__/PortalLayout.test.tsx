// components/layout/__tests__/PortalLayout.test.tsx
// PortalLayout 컴포넌트 단위 테스트

import { vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PortalLayout } from '../PortalLayout'

// Mock token 값
const mockToken = {
  colorPrimary: '#2563EB',
  colorBgContainer: '#FFFFFF',
  colorBgLayout: '#F8FAFC',
  colorBorder: '#E2E8F0',
  colorTextSecondary: '#475569',
  colorTextTertiary: '#64748B',
  colorFillSecondary: '#F8FAFC',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
}

// Ant Design 모킹
vi.mock('antd', () => ({
  Layout: Object.assign(
    ({ children, className, style, ...props }: any) => (
      <div className={className} style={style} {...props}>{children}</div>
    ),
    {
      Header: ({ children, className, style, ...props }: any) => (
        <header className={className} style={style} {...props}>{children}</header>
      ),
      Sider: ({ children, className, style, collapsed, ...props }: any) => (
        <aside className={className} style={style} data-collapsed={collapsed} {...props}>{children}</aside>
      ),
      Content: ({ children, className, style, ...props }: any) => (
        <main className={className} style={style} {...props}>{children}</main>
      ),
      Footer: ({ children, className, style, ...props }: any) => (
        <footer className={className} style={style} {...props}>{children}</footer>
      ),
    }
  ),
  Tooltip: ({ children }: any) => children,
  theme: {
    useToken: () => ({ token: mockToken }),
  },
}))

vi.mock('@ant-design/icons', () => ({
  MenuFoldOutlined: () => <span data-testid="menu-fold-icon">Fold</span>,
  MenuUnfoldOutlined: () => <span data-testid="menu-unfold-icon">Unfold</span>,
}))

describe('PortalLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.getItem = vi.fn().mockReturnValue(null)
    localStorage.setItem = vi.fn()

    // innerWidth 기본값 설정 (데스크톱)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280,
    })
  })

  // UT-001: 기본 렌더링 테스트
  describe('UT-001: 기본 렌더링', () => {
    it('포털 레이아웃이 정상 렌더링되어야 함', () => {
      render(
        <PortalLayout>
          <div>Content</div>
        </PortalLayout>
      )

      expect(screen.getByTestId('portal-layout')).toBeInTheDocument()
      expect(screen.getByTestId('portal-header')).toBeInTheDocument()
      expect(screen.getByTestId('portal-sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('portal-content')).toBeInTheDocument()
      expect(screen.getByTestId('portal-footer')).toBeInTheDocument()
    })

    it('children이 Content 영역에 렌더링되어야 함', () => {
      render(
        <PortalLayout>
          <div data-testid="child-content">Child Content</div>
        </PortalLayout>
      )

      const content = screen.getByTestId('portal-content')
      expect(content).toContainElement(screen.getByTestId('child-content'))
    })
  })

  // UT-002: 사이드바 토글 테스트
  describe('UT-002: 사이드바 토글', () => {
    it('토글 버튼 클릭 시 사이드바 상태가 변경되어야 함', () => {
      render(
        <PortalLayout>
          <div>Content</div>
        </PortalLayout>
      )

      const toggleButton = screen.getByTestId('sidebar-toggle')

      // 초기 상태는 펼침 (아이콘: Fold)
      expect(screen.getByTestId('menu-fold-icon')).toBeInTheDocument()

      // 클릭 후 접힘 (아이콘: Unfold)
      fireEvent.click(toggleButton)
      expect(screen.getByTestId('menu-unfold-icon')).toBeInTheDocument()
    })

    it('토글 상태가 localStorage에 저장되어야 함', () => {
      render(
        <PortalLayout>
          <div>Content</div>
        </PortalLayout>
      )

      const toggleButton = screen.getByTestId('sidebar-toggle')
      fireEvent.click(toggleButton)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mes-portal-sidebar-collapsed',
        'true'
      )
    })
  })

  // UT-003: Props 렌더링 테스트
  describe('UT-003: Props 렌더링', () => {
    it('header prop이 헤더 영역에 렌더링되어야 함', () => {
      render(
        <PortalLayout header={<span data-testid="custom-header">Custom Header</span>}>
          <div>Content</div>
        </PortalLayout>
      )

      expect(screen.getByTestId('custom-header')).toBeInTheDocument()
    })

    it('sidebar prop이 사이드바 영역에 렌더링되어야 함', () => {
      render(
        <PortalLayout sidebar={<nav data-testid="custom-sidebar">Menu</nav>}>
          <div>Content</div>
        </PortalLayout>
      )

      expect(screen.getByTestId('custom-sidebar')).toBeInTheDocument()
    })

    it('footer prop이 푸터 영역에 렌더링되어야 함', () => {
      render(
        <PortalLayout footer={<span data-testid="custom-footer">Custom Footer</span>}>
          <div>Content</div>
        </PortalLayout>
      )

      expect(screen.getByTestId('custom-footer')).toBeInTheDocument()
    })

    it('tabBar prop이 탭바 영역에 렌더링되어야 함', () => {
      render(
        <PortalLayout tabBar={<div data-testid="custom-tabbar">Tabs</div>}>
          <div>Content</div>
        </PortalLayout>
      )

      expect(screen.getByTestId('custom-tabbar')).toBeInTheDocument()
      expect(screen.getByTestId('portal-tabbar')).toBeInTheDocument()
    })
  })

  // UT-004: 접근성 테스트
  describe('UT-004: 접근성', () => {
    it('토글 버튼에 aria-label이 있어야 함', () => {
      render(
        <PortalLayout>
          <div>Content</div>
        </PortalLayout>
      )

      const toggleButton = screen.getByTestId('sidebar-toggle')
      expect(toggleButton).toHaveAttribute('aria-label', '사이드바 접기')
    })

    it('사이드바에 role="navigation"이 있어야 함', () => {
      render(
        <PortalLayout>
          <div>Content</div>
        </PortalLayout>
      )

      const sidebar = screen.getByTestId('portal-sidebar')
      expect(sidebar).toHaveAttribute('role', 'navigation')
    })
  })

  // UT-005: 기본 푸터 테스트
  describe('UT-005: 기본 푸터', () => {
    it('footer prop이 없으면 기본 푸터가 표시되어야 함', () => {
      render(
        <PortalLayout>
          <div>Content</div>
        </PortalLayout>
      )

      expect(screen.getByText('MES Portal © 2026')).toBeInTheDocument()
    })
  })

  // IT-01: Footer 컴포넌트 통합 테스트 (TSK-01-04)
  describe('IT-01: Footer 컴포넌트 통합', () => {
    it('Footer 컴포넌트가 PortalLayout 내에서 정상 표시되어야 함', () => {
      const MockFooter = () => (
        <div data-testid="mock-footer">
          <span data-testid="footer-copyright">Copyright © 2026</span>
          <span data-testid="footer-version">v0.1.0</span>
        </div>
      )

      render(
        <PortalLayout footer={<MockFooter />}>
          <div>Content</div>
        </PortalLayout>
      )

      expect(screen.getByTestId('portal-footer')).toBeInTheDocument()
      expect(screen.getByTestId('mock-footer')).toBeInTheDocument()
      expect(screen.getByTestId('footer-copyright')).toBeInTheDocument()
      expect(screen.getByTestId('footer-version')).toBeInTheDocument()
    })

    it('Footer 컴포넌트가 저작권 정보를 표시해야 함', () => {
      const MockFooter = () => (
        <div>
          <span>Copyright © 2026 Company. All rights reserved.</span>
        </div>
      )

      render(
        <PortalLayout footer={<MockFooter />}>
          <div>Content</div>
        </PortalLayout>
      )

      expect(screen.getByText(/Copyright ©/)).toBeInTheDocument()
    })

    it('Footer 컴포넌트가 버전 정보를 표시해야 함', () => {
      const MockFooter = () => (
        <div>
          <span>v0.1.0</span>
        </div>
      )

      render(
        <PortalLayout footer={<MockFooter />}>
          <div>Content</div>
        </PortalLayout>
      )

      expect(screen.getByText(/v\d+\.\d+\.\d+/)).toBeInTheDocument()
    })
  })
})
