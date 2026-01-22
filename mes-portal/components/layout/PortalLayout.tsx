// components/layout/PortalLayout.tsx
// MES Portal 기본 레이아웃 컴포넌트 - Enterprise Design
'use client'

import { Layout, Tooltip } from 'antd'
import { useState, useEffect, ReactNode } from 'react'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'

const { Header, Sider, Content, Footer } = Layout

const SIDEBAR_STORAGE_KEY = 'mes-portal-sidebar-collapsed'

const BREAKPOINTS = {
  mobile: 767,
  tablet: 1023,
  desktop: 1024,
} as const

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

interface PortalLayoutProps {
  children: ReactNode
  header?: ReactNode
  sidebar?: ReactNode
  tabBar?: ReactNode
  footer?: ReactNode
  /** 사이드바 접힘 상태 변경 콜백 */
  onCollapsedChange?: (collapsed: boolean) => void
}

export function PortalLayout({
  children,
  header,
  sidebar,
  tabBar,
  footer,
  onCollapsedChange,
}: PortalLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop')
  const [mounted, setMounted] = useState(false)

  const getBreakpoint = (width: number): Breakpoint => {
    if (width <= BREAKPOINTS.mobile) return 'mobile'
    if (width <= BREAKPOINTS.tablet) return 'tablet'
    return 'desktop'
  }

  useEffect(() => {
    setMounted(true)

    const savedCollapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    let initialCollapsed = false
    if (savedCollapsed !== null) {
      initialCollapsed = JSON.parse(savedCollapsed)
      setCollapsed(initialCollapsed)
    }

    const currentBreakpoint = getBreakpoint(window.innerWidth)
    setBreakpoint(currentBreakpoint)

    if (currentBreakpoint === 'mobile') {
      initialCollapsed = true
      setCollapsed(true)
    }

    // 부모에게 초기 collapsed 상태 알림
    onCollapsedChange?.(initialCollapsed)
  }, [onCollapsedChange])

  useEffect(() => {
    const handleResize = () => {
      const newBreakpoint = getBreakpoint(window.innerWidth)
      setBreakpoint(newBreakpoint)

      if (newBreakpoint === 'mobile' || newBreakpoint === 'tablet') {
        setCollapsed(true)
        onCollapsedChange?.(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [onCollapsedChange])

  const handleCollapse = (value: boolean) => {
    setCollapsed(value)
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(value))
    onCollapsedChange?.(value)
  }

  const toggleSidebar = () => {
    handleCollapse(!collapsed)
  }

  // collapsed 상태에 따라 즉시 sidebarWidth 계산 (Sider의 width/collapsedWidth와 일치)
  const sidebarWidth = collapsed ? 72 : 256

  return (
    <Layout className="min-h-screen" data-testid="portal-layout">
      {/* 헤더 영역 */}
      <Header
        className="fixed top-0 left-0 right-0 z-50 flex items-center px-4"
        style={{
          height: 'var(--header-height)',
          lineHeight: 'var(--header-height)',
          backgroundColor: 'var(--color-gray-50)',
          borderBottom: '1px solid var(--color-gray-200)',
          boxShadow: 'var(--shadow-sm)',
        }}
        data-testid="portal-header"
      >
        {/* 사이드바 토글 버튼 */}
        <Tooltip title={collapsed ? '메뉴 펼치기' : '메뉴 접기'}>
          <button
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-md transition-colors duration-200 cursor-pointer"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-gray-600)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'
              e.currentTarget.style.color = 'var(--color-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--color-gray-600)'
            }}
            aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
            aria-expanded={!collapsed}
            data-testid="sidebar-toggle"
          >
            {collapsed ? (
              <MenuUnfoldOutlined style={{ fontSize: 18 }} />
            ) : (
              <MenuFoldOutlined style={{ fontSize: 18 }} />
            )}
          </button>
        </Tooltip>
        {header}
      </Header>

      <Layout style={{ marginTop: 'var(--header-height)' }}>
        {/* 사이드바 영역 */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={handleCollapse}
          trigger={null}
          width={256}
          collapsedWidth={72}
          className="left-0 bottom-0 z-40"
          style={{
            position: 'fixed',
            top: 'var(--header-height)',
            height: 'calc(100vh - var(--header-height))',
            overflow: 'auto',
            backgroundColor: 'var(--color-gray-50)',
            borderRight: '1px solid var(--color-gray-200)',
          }}
          role="navigation"
          aria-expanded={!collapsed}
          data-testid="portal-sidebar"
        >
          {sidebar}
        </Sider>

        {/* 메인 컨텐츠 영역 */}
        <Layout
          style={{
            marginLeft: sidebarWidth,
            transition: 'margin-left 0.2s ease-out',
          }}
        >
          {/* 탭 바 영역 (선택적) */}
          {tabBar && (
            <div
              className="sticky top-0 z-30"
              style={{
                height: 'var(--tab-bar-height)',
                backgroundColor: 'var(--color-gray-50)',
                borderBottom: '1px solid var(--color-gray-200)',
              }}
              data-testid="portal-tabbar"
            >
              {tabBar}
            </div>
          )}

          {/* 컨텐츠 영역 */}
          <Content
            className="overflow-auto p-5"
            style={{
              minHeight: tabBar
                ? 'calc(100vh - var(--header-height) - var(--tab-bar-height) - var(--footer-height))'
                : 'calc(100vh - var(--header-height) - var(--footer-height))',
              backgroundColor: 'var(--background)',
            }}
            data-testid="portal-content"
          >
            {children}
          </Content>

          {/* 푸터 영역 */}
          <Footer
            className="text-center"
            style={{
              height: 'var(--footer-height)',
              padding: '8px 24px',
              lineHeight: '20px',
              backgroundColor: 'var(--color-gray-50)',
              borderTop: '1px solid var(--color-gray-200)',
              color: 'var(--color-gray-500)',
            }}
            data-testid="portal-footer"
          >
            {footer || 'MES Portal © 2026'}
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  )
}
