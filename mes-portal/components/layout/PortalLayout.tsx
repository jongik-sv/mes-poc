// components/layout/PortalLayout.tsx
// MES Portal 기본 레이아웃 컴포넌트
'use client'

import { Layout } from 'antd'
import { useState, useEffect, ReactNode } from 'react'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'

const { Header, Sider, Content, Footer } = Layout

const SIDEBAR_STORAGE_KEY = 'mes-portal-sidebar-collapsed'

// 브레이크포인트 정의
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
}

export function PortalLayout({
  children,
  header,
  sidebar,
  tabBar,
  footer,
}: PortalLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop')
  const [mounted, setMounted] = useState(false)

  // 브레이크포인트 계산
  const getBreakpoint = (width: number): Breakpoint => {
    if (width <= BREAKPOINTS.mobile) return 'mobile'
    if (width <= BREAKPOINTS.tablet) return 'tablet'
    return 'desktop'
  }

  // 마운트 시 localStorage에서 상태 복원 및 브레이크포인트 초기화
  useEffect(() => {
    setMounted(true)

    // localStorage에서 사이드바 상태 복원
    const savedCollapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (savedCollapsed !== null) {
      setCollapsed(JSON.parse(savedCollapsed))
    }

    // 초기 브레이크포인트 설정
    const currentBreakpoint = getBreakpoint(window.innerWidth)
    setBreakpoint(currentBreakpoint)

    // 모바일에서는 기본 접힘
    if (currentBreakpoint === 'mobile') {
      setCollapsed(true)
    }
  }, [])

  // 윈도우 리사이즈 핸들러
  useEffect(() => {
    const handleResize = () => {
      const newBreakpoint = getBreakpoint(window.innerWidth)
      setBreakpoint(newBreakpoint)

      // 브레이크포인트 변경 시 자동 조절
      if (newBreakpoint === 'mobile' || newBreakpoint === 'tablet') {
        setCollapsed(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 사이드바 상태 변경 시 localStorage에 저장
  const handleCollapse = (value: boolean) => {
    setCollapsed(value)
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(value))
  }

  // 토글 버튼 클릭 핸들러
  const toggleSidebar = () => {
    handleCollapse(!collapsed)
  }

  // SSR 호환을 위해 마운트 전에는 기본 상태로 렌더링
  const sidebarWidth = mounted
    ? collapsed
      ? 'var(--sidebar-collapsed-width)'
      : 'var(--sidebar-width)'
    : 'var(--sidebar-width)'

  return (
    <Layout className="min-h-screen" data-testid="portal-layout">
      {/* 헤더 영역 */}
      <Header
        className="fixed top-0 left-0 right-0 z-50 flex items-center px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
        style={{ height: 'var(--header-height)', lineHeight: 'var(--header-height)' }}
        data-testid="portal-header"
      >
        {/* 사이드바 토글 버튼 */}
        <button
          onClick={toggleSidebar}
          className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          aria-expanded={!collapsed}
          data-testid="sidebar-toggle"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
        {header}
      </Header>

      <Layout style={{ marginTop: 'var(--header-height)' }}>
        {/* 사이드바 영역 */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={handleCollapse}
          trigger={null}
          width={240}
          collapsedWidth={60}
          className="fixed left-0 bottom-0 z-40 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700"
          style={{
            top: 'var(--header-height)',
            height: 'calc(100vh - var(--header-height))',
            overflow: 'auto',
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
            transition: 'margin-left 0.2s ease',
          }}
        >
          {/* 탭 바 영역 (선택적) */}
          {tabBar && (
            <div
              className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
              style={{ height: 'var(--tab-bar-height)' }}
              data-testid="portal-tabbar"
            >
              {tabBar}
            </div>
          )}

          {/* 컨텐츠 영역 */}
          <Content
            className="overflow-auto p-4 bg-gray-50 dark:bg-gray-950"
            style={{
              minHeight: tabBar
                ? 'calc(100vh - var(--header-height) - var(--tab-bar-height) - var(--footer-height))'
                : 'calc(100vh - var(--header-height) - var(--footer-height))',
            }}
            data-testid="portal-content"
          >
            {children}
          </Content>

          {/* 푸터 영역 */}
          <Footer
            className="text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
            style={{ height: 'var(--footer-height)', padding: '4px 16px', lineHeight: '22px' }}
            data-testid="portal-footer"
          >
            {footer || 'MES Portal © 2026'}
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  )
}
