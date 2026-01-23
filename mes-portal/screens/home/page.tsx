// screens/home/page.tsx
// 홈 화면 스크린 (ScreenLoader용)
'use client'

import { useCallback, useMemo } from 'react'
import { HomePage } from '@/components/home'
import { useMDI, type Tab } from '@/lib/mdi'
import { useFavorites, useRecentMenus } from '@/lib/hooks'
import type { FavoriteMenuItem } from '@/lib/types/favorites'
import type { RecentMenuItem } from '@/lib/hooks'
import menuData from '@/mock-data/menus.json'
import type { MenuItem } from '@/components/layout'

export default function HomeScreen() {
  const { openTab } = useMDI()
  const { addRecentMenu } = useRecentMenus()

  // 메뉴 데이터
  const menus = menuData.menus as MenuItem[]

  // useFavorites에 필요한 MenuItem 형식으로 변환
  type ConvertedMenu = {
    id: string
    code: string
    name: string
    path: string | null
    icon: string | null
    sortOrder: number
    children?: ConvertedMenu[]
  }
  const allMenusForFavorites = useMemo(() => {
    const convertMenu = (menu: MenuItem): ConvertedMenu => ({
      id: menu.id,
      code: menu.code,
      name: menu.name,
      path: menu.path ?? null,
      icon: menu.icon ?? null,
      sortOrder: menu.sortOrder,
      children: menu.children?.map(convertMenu),
    })
    return menus.map(convertMenu)
  }, [menus])

  // 즐겨찾기 훅
  const { favoriteMenus, isLoading: isFavoriteLoading } = useFavorites({
    userId: 1, // MVP: 하드코딩된 사용자 ID
    allMenus: allMenusForFavorites,
  })

  // 메뉴 클릭 핸들러 - MDI 탭으로 열기
  const handleMenuClick = useCallback(
    (menu: RecentMenuItem | FavoriteMenuItem) => {
      const path = menu.path
      if (!path) return

      // 탭으로 열기
      const tab: Tab = {
        id: menu.id,
        title: menu.name,
        path: path,
        icon: menu.icon ?? undefined,
        closable: true,
      }
      openTab(tab)

      // 최근 사용 메뉴에 추가
      addRecentMenu({
        id: menu.id,
        code: menu.code,
        name: menu.name,
        path: path,
        icon: menu.icon ?? undefined,
      })
    },
    [openTab, addRecentMenu]
  )

  // 대시보드로 이동
  const handleNavigateToDashboard = useCallback(() => {
    const dashboardMenu = menus.find((m) => m.path === '/dashboard')
    if (dashboardMenu) {
      const tab: Tab = {
        id: dashboardMenu.id,
        title: dashboardMenu.name,
        path: dashboardMenu.path!,
        icon: dashboardMenu.icon,
        closable: true,
      }
      openTab(tab)
    }
  }, [menus, openTab])

  return (
    <HomePage
      userName="홍길동"
      favoriteMenus={favoriteMenus}
      isFavoriteLoading={isFavoriteLoading}
      onMenuClick={handleMenuClick}
      onNavigateToDashboard={handleNavigateToDashboard}
    />
  )
}
