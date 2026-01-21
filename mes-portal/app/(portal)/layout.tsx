// app/(portal)/layout.tsx
// 포털 라우트 그룹 레이아웃 - PortalLayout 적용
'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { message } from 'antd'
import { PortalLayout, Header, Footer, Sidebar } from '@/components/layout'
import type { MenuItem } from '@/components/layout'
import { findMenuByPath, findParentKeys } from '@/components/layout/Sidebar'
import type { Notification, SearchableMenuItem } from '@/components/common'
import { GlobalSearch } from '@/components/common'
import { MDIProvider, useMDI, type Tab } from '@/lib/mdi'
import { TabBar, MDIContent } from '@/components/mdi'
import menuData from '@/mock-data/menus.json'
import notificationData from '@/mock-data/notifications.json'

export default function PortalGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MDIProvider
      maxTabs={10}
      onMaxTabsReached={() => {
        message.warning('최대 10개의 탭만 열 수 있습니다.')
      }}
    >
      <PortalLayoutContent>{children}</PortalLayoutContent>
    </MDIProvider>
  )
}

/**
 * 포털 레이아웃 내부 컴포넌트 (MDI Context 사용)
 */
function PortalLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { openTab, tabs } = useMDI()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [openKeys, setOpenKeys] = useState<string[]>([])

  // 메뉴 데이터
  const menus = menuData.menus as MenuItem[]

  // 알림 데이터
  const notifications = notificationData.notifications as Notification[]

  // 임시 사용자 데이터 (MVP)
  const mockUser = {
    name: '홍길동',
    email: 'admin@mes.com',
  }

  // 임시 브레드크럼 데이터
  const breadcrumbItems = [
    { title: 'Home', path: '/' },
    { title: 'Dashboard' },
  ]

  // 현재 경로에 해당하는 메뉴 선택 및 부모 메뉴 펼침
  useEffect(() => {
    const currentMenu = findMenuByPath(menus, pathname)
    if (currentMenu) {
      setSelectedKeys([currentMenu.id])
      const parents = findParentKeys(menus, currentMenu.id)
      if (parents.length > 0) {
        setOpenKeys((prev) => {
          const newKeys = [...new Set([...prev, ...parents])]
          return newKeys
        })
      }
    }
  }, [pathname, menus])

  // 메뉴 클릭 핸들러 - MDI 탭으로 열기
  const handleMenuClick = useCallback(
    (menu: MenuItem) => {
      if (menu.path) {
        setSelectedKeys([menu.id])

        // 탭으로 열기 (URL 변경 없이 MDI 탭 내에서 화면 로드)
        const tab: Tab = {
          id: menu.id,
          title: menu.name,
          path: menu.path,
          icon: menu.icon,
          closable: menu.id !== 'dashboard', // 대시보드는 닫기 불가
        }
        openTab(tab)
      }
    },
    [openTab]
  )

  // 서브메뉴 열기/닫기 핸들러
  const handleOpenChange = useCallback((keys: string[]) => {
    setOpenKeys(keys)
  }, [])

  // 사이드바 토글 핸들러
  const handleSidebarToggle = useCallback((value: boolean) => {
    setCollapsed(value)
  }, [])

  // 알림 클릭으로 화면 이동 핸들러
  const handleNotificationNavigate = useCallback(
    (link: string, title: string) => {
      router.push(link)
    },
    [router]
  )

  // 검색 결과 선택 핸들러 (TSK-01-05)
  const handleSearchSelect = useCallback(
    (menu: SearchableMenuItem) => {
      if (menu.path) {
        setSelectedKeys([menu.id])

        // 탭으로 열기
        const tab: Tab = {
          id: menu.id,
          title: menu.name,
          path: menu.path,
          icon: menu.icon,
          closable: menu.id !== '1', // 대시보드(ID: 1)는 닫기 불가
        }
        openTab(tab)
        setIsSearchOpen(false)
      }
    },
    [openTab]
  )

  // menus를 SearchableMenuItem 타입으로 변환
  const searchableMenus: SearchableMenuItem[] = menus.map((menu) => ({
    ...menu,
    children: menu.children?.map((child) => ({
      ...child,
      children: child.children?.map((grandChild) => ({
        ...grandChild,
        children: [],
      })) || [],
    })) || [],
  }))

  return (
    <PortalLayout
      header={
        <Header
          user={mockUser}
          breadcrumbItems={breadcrumbItems}
          notifications={notifications}
          onSearchOpen={() => setIsSearchOpen(true)}
          onNotificationNavigate={handleNotificationNavigate}
          onLogout={() => {}}
        />
      }
      sidebar={
        <Sidebar
          menus={menus}
          collapsed={collapsed}
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onMenuClick={handleMenuClick}
          onOpenChange={handleOpenChange}
        />
      }
      tabBar={tabs.length > 0 ? <TabBar /> : undefined}
      footer={<Footer />}
    >
      {/* MDI 컨텐츠 영역: 탭이 있으면 MDIContent, 없으면 children */}
      {tabs.length > 0 ? <MDIContent /> : children}

      {/* 전역 검색 모달 (TSK-01-05) */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        menus={searchableMenus}
        onSelect={handleSearchSelect}
      />
    </PortalLayout>
  )
}
