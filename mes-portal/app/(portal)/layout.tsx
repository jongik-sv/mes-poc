// app/(portal)/layout.tsx
// 포털 라우트 그룹 레이아웃 - PortalLayout 적용
'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PortalLayout, Header, Footer, Sidebar } from '@/components/layout'
import type { MenuItem } from '@/components/layout'
import { findMenuByPath, findParentKeys } from '@/components/layout/Sidebar'
import type { Notification } from '@/components/common'
import menuData from '@/mock-data/menus.json'
import notificationData from '@/mock-data/notifications.json'

export default function PortalGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
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

  // 메뉴 클릭 핸들러
  const handleMenuClick = useCallback(
    (menu: MenuItem) => {
      if (menu.path) {
        setSelectedKeys([menu.id])
        router.push(menu.path)
      }
    },
    [router]
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
      footer={<Footer />}
    >
      {children}
      {/* 검색 모달 (TSK-01-05에서 구현 예정) */}
      {isSearchOpen && (
        <div
          data-testid="search-modal"
          className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="검색어를 입력하세요..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoFocus
            />
            <p className="text-sm text-gray-500 mt-2">ESC 키로 닫기</p>
          </div>
        </div>
      )}
    </PortalLayout>
  )
}
