// components/layout/PortalLayout.tsx
// MES Portal 기본 레이아웃 컴포넌트 - Enterprise Design
'use client'

import { Layout, Tooltip, theme } from 'antd'
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
  /** 사이드바 접힘 상태 변경 콜백 (토글 버튼으로 변경 시) */
  onCollapsedChange?: (collapsed: boolean) => void
  /** 사이드바 시각적 접힘 상태 변경 콜백 (호버 포함) */
  onVisualCollapsedChange?: (isVisuallyCollapsed: boolean) => void
}

export function PortalLayout({
  children,
  header,
  sidebar,
  tabBar,
  footer,
  onCollapsedChange,
  onVisualCollapsedChange,
}: PortalLayoutProps) {
  const { token } = theme.useToken()
  const [collapsed, setCollapsed] = useState(false)
  const [hoverExpanded, setHoverExpanded] = useState(false)  // 호버로 임시 펼친 상태
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop')
  const [mounted, setMounted] = useState(false)

  // 실제 표시되는 사이드바 상태 (호버 시 펼침)
  const isVisuallyCollapsed = collapsed && !hoverExpanded

  // 메인 콘텐츠 marginLeft (호버 시에도 collapsed 기준 유지 - 오버레이 방식)
  const contentMarginLeft = collapsed ? 72 : 256

  // 시각적 접힘 상태가 변경될 때 콜백 호출
  useEffect(() => {
    onVisualCollapsedChange?.(isVisuallyCollapsed)
  }, [isVisuallyCollapsed, onVisualCollapsedChange])

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

  // 사이드바 호버 이벤트 핸들러 (데스크톱에서만 동작)
  const handleSiderMouseEnter = () => {
    if (collapsed && breakpoint === 'desktop') {
      setHoverExpanded(true)
    }
  }

  const handleSiderMouseLeave = () => {
    setHoverExpanded(false)
  }

  return (
    <Layout className="min-h-screen" data-testid="portal-layout">
      {/* 헤더 영역 */}
      <Header
        className="fixed top-0 left-0 right-0 z-50 flex items-center px-4"
        style={{
          height: 'var(--header-height)',
          lineHeight: 'var(--header-height)',
          backgroundColor: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorder}`,
          boxShadow: token.boxShadow,
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
              color: token.colorTextSecondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = token.colorFillSecondary
              e.currentTarget.style.color = token.colorPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = token.colorTextSecondary
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
          collapsed={isVisuallyCollapsed}
          onCollapse={handleCollapse}
          trigger={null}
          width={256}
          collapsedWidth={72}
          className="left-0 bottom-0"
          onMouseEnter={handleSiderMouseEnter}
          onMouseLeave={handleSiderMouseLeave}
          style={{
            position: 'fixed',
            top: 'var(--header-height)',
            height: 'calc(100vh - var(--header-height))',
            overflow: 'auto',
            backgroundColor: token.colorBgContainer,
            borderRight: `1px solid ${token.colorBorder}`,
            zIndex: hoverExpanded ? 50 : 40,
            boxShadow: hoverExpanded ? token.boxShadowSecondary : undefined,
            transition: 'width 0.15s ease-out, box-shadow 0.15s ease-out',
          }}
          role="navigation"
          aria-expanded={!isVisuallyCollapsed}
          data-testid="portal-sidebar"
        >
          {sidebar}
        </Sider>

        {/* 메인 컨텐츠 영역 */}
        <Layout
          className="flex flex-col"
          style={{
            marginLeft: contentMarginLeft,
            transition: 'margin-left 0.15s ease-out',
            height: 'calc(100vh - var(--header-height))',
            overflow: 'hidden',
          }}
        >
          {/* 탭 바 영역 (선택적) */}
          {tabBar && (
            <div
              className="flex-shrink-0"
              style={{
                height: 'var(--tab-bar-height)',
                backgroundColor: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorBorder}`,
              }}
              data-testid="portal-tabbar"
            >
              {tabBar}
            </div>
          )}

          {/* 컨텐츠 영역 */}
          <Content
            className="flex-1 overflow-auto p-5"
            style={{
              backgroundColor: token.colorBgLayout,
            }}
            data-testid="portal-content"
          >
            {children}
          </Content>

          {/* 푸터 영역 */}
          <div className="flex-shrink-0">
            {footer}
          </div>
        </Layout>
      </Layout>
    </Layout>
  )
}
