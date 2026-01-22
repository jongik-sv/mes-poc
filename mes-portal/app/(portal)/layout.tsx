// app/(portal)/layout.tsx
// 포털 라우트 그룹 레이아웃 - PortalLayout 적용
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { message } from 'antd'
import { PortalLayout, Header, Footer, Sidebar } from '@/components/layout'
import type { MenuItem } from '@/components/layout'
import { findMenuByPath, findParentKeys } from '@/components/layout/Sidebar'
import type { Notification, SearchableMenuItem } from '@/components/common'
import { GlobalSearch, HotkeyHelp } from '@/components/common'
import { MDIProvider, useMDI, type Tab } from '@/lib/mdi'
import { TabBar, MDIContent } from '@/components/mdi'
import { useFavorites, useGlobalHotkeys } from '@/lib/hooks'
import type { FavoriteMenuItem } from '@/lib/types/favorites'
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
  const { openTab, closeTab, tabs, activeTabId, setActiveTab } = useMDI()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [openKeys, setOpenKeys] = useState<string[]>([])

  // 메뉴 데이터
  const menus = menuData.menus as MenuItem[]

  // useFavorites에 필요한 MenuItem 형식으로 변환
  type ConvertedMenu = { id: number; code: string; name: string; path: string | null; icon: string | null; sortOrder: number; children?: ConvertedMenu[] }
  const allMenusForFavorites = useMemo(() => {
    const convertMenu = (menu: MenuItem): ConvertedMenu => ({
      id: parseInt(menu.id, 10),
      code: menu.code,
      name: menu.name,
      path: menu.path ?? null,
      icon: menu.icon ?? null,
      sortOrder: menu.sortOrder,
      children: menu.children?.map(convertMenu),
    })
    return menus.map(convertMenu)
  }, [menus])

  // 즐겨찾기 훅 (TSK-03-04)
  const {
    favoriteMenus,
    isFavorite,
    toggleFavorite,
    canAddFavorite,
    isLoading: isFavoriteLoading,
  } = useFavorites({
    userId: 1, // MVP: 하드코딩된 사용자 ID
    allMenus: allMenusForFavorites,
  })

  // 즐겨찾기 옵션 (Sidebar용)
  const favoriteOptions = useMemo(() => ({
    isFavorite,
    toggleFavorite,
    canAddFavorite,
  }), [isFavorite, toggleFavorite, canAddFavorite])

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

  // 초기 로드 시 대시보드 탭 자동 열기
  useEffect(() => {
    if (tabs.length === 0) {
      // 대시보드 메뉴 찾기
      const dashboardMenu = findMenuByPath(menus, '/dashboard')
      if (dashboardMenu) {
        const tab: Tab = {
          id: dashboardMenu.id,
          title: dashboardMenu.name,
          path: dashboardMenu.path!,
          icon: dashboardMenu.icon,
          closable: false, // 대시보드는 닫기 불가
        }
        openTab(tab)
        setSelectedKeys([dashboardMenu.id])
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      // 자식이 있는 부모 메뉴 클릭 시 (사이드바 접혀있을 때 자동 펼침)
      if (menu.children && menu.children.length > 0) {
        if (collapsed) {
          setCollapsed(false)
          // 해당 메뉴 확장
          setOpenKeys((prev) => {
            if (prev.includes(menu.id)) return prev
            return [...prev, menu.id]
          })
        }
        return
      }

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
    [openTab, collapsed]
  )

  // 서브메뉴 열기/닫기 핸들러
  const handleOpenChange = useCallback((keys: string[]) => {
    setOpenKeys(keys)
  }, [])

  // 사이드바 상태 동기화 핸들러 (PortalLayout에서 호출)
  const handleCollapsedChange = useCallback((value: boolean) => {
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

  // 즐겨찾기 메뉴 클릭 핸들러 (TSK-03-04)
  const handleFavoriteMenuClick = useCallback(
    (menu: FavoriteMenuItem) => {
      const menuId = String(menu.id)
      setSelectedKeys([menuId])

      // 탭으로 열기
      const tab: Tab = {
        id: menuId,
        title: menu.name,
        path: menu.path,
        icon: menu.icon ?? undefined,
        closable: true,
      }
      openTab(tab)
    },
    [openTab]
  )

  // 전역 단축키 훅 (TSK-05-06)
  useGlobalHotkeys({
    onSearch: useCallback(() => setIsSearchOpen(true), []),
    onHelp: useCallback(() => setIsHelpOpen(true), []),
    onCloseTab: useCallback(() => {
      if (activeTabId && activeTabId !== 'dashboard') {
        closeTab(activeTabId)
      }
    }, [activeTabId, closeTab]),
    onNextTab: useCallback(() => {
      if (tabs.length > 1 && activeTabId) {
        const currentIndex = tabs.findIndex((t) => t.id === activeTabId)
        const nextIndex = (currentIndex + 1) % tabs.length
        setActiveTab(tabs[nextIndex].id)
      }
    }, [tabs, activeTabId, setActiveTab]),
    onPrevTab: useCallback(() => {
      if (tabs.length > 1 && activeTabId) {
        const currentIndex = tabs.findIndex((t) => t.id === activeTabId)
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
        setActiveTab(tabs[prevIndex].id)
      }
    }, [tabs, activeTabId, setActiveTab]),
  })

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
      onCollapsedChange={handleCollapsedChange}
      header={
        <Header
          user={mockUser}
          breadcrumbItems={breadcrumbItems}
          notifications={notifications}
          onSearchOpen={() => setIsSearchOpen(true)}
          onNotificationNavigate={handleNotificationNavigate}
          onLogout={() => {}}
          favoriteMenus={favoriteMenus}
          onFavoriteMenuClick={handleFavoriteMenuClick}
          isFavoriteLoading={isFavoriteLoading}
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
          onCollapsedChange={setCollapsed}
          favoriteOptions={favoriteOptions}
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

      {/* 키보드 단축키 도움말 모달 (TSK-05-06) */}
      <HotkeyHelp open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </PortalLayout>
  )
}
