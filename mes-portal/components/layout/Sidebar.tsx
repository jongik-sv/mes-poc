// components/layout/Sidebar.tsx
// MES Portal 사이드바 메뉴 컴포넌트
'use client'

import { useMemo } from 'react'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  SettingOutlined,
  UserOutlined,
  ControlOutlined,
  FileTextOutlined,
  LineChartOutlined,
  EditOutlined,
  SearchOutlined,
  WarningOutlined,
  DesktopOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  MenuOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { FavoriteButton } from '@/components/common/FavoriteButton'

// 아이콘 매핑
const iconMap: Record<string, ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  BuildOutlined: <BuildOutlined />,
  CheckCircleOutlined: <CheckCircleOutlined />,
  ToolOutlined: <ToolOutlined />,
  SettingOutlined: <SettingOutlined />,
  UserOutlined: <UserOutlined />,
  ControlOutlined: <ControlOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  EditOutlined: <EditOutlined />,
  SearchOutlined: <SearchOutlined />,
  WarningOutlined: <WarningOutlined />,
  DesktopOutlined: <DesktopOutlined />,
  TeamOutlined: <TeamOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  MenuOutlined: <MenuOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
}

// 메뉴 아이템 인터페이스
export interface MenuItem {
  id: string
  code: string
  name: string
  path?: string
  icon?: string
  children?: MenuItem[]
  sortOrder: number
  isActive: boolean
}

// 즐겨찾기 기능 props
export interface FavoriteOptions {
  /** 즐겨찾기 여부 확인 함수 */
  isFavorite: (menuId: number) => boolean
  /** 즐겨찾기 토글 함수 */
  toggleFavorite: (menuId: number) => void
  /** 즐겨찾기 추가 가능 여부 */
  canAddFavorite: () => boolean
}

// Sidebar Props 인터페이스
export interface SidebarProps {
  menus: MenuItem[]
  collapsed: boolean
  selectedKeys?: string[]
  openKeys?: string[]
  onMenuClick?: (menu: MenuItem) => void
  onOpenChange?: (openKeys: string[]) => void
  /** 즐겨찾기 기능 (선택) */
  favoriteOptions?: FavoriteOptions
}

// 아이콘 가져오기 헬퍼 함수
const getIcon = (iconName?: string): ReactNode => {
  if (!iconName) return <AppstoreOutlined />
  return iconMap[iconName] || <AppstoreOutlined />
}

// 메뉴 데이터를 Ant Design Menu 아이템으로 변환 (최대 3단계)
const convertToMenuItems = (
  menus: MenuItem[],
  collapsed: boolean,
  favoriteOptions?: FavoriteOptions,
  level: number = 1,
  maxLevel: number = 3
): MenuProps['items'] => {
  if (level > maxLevel) return []

  return menus
    .filter((menu) => menu.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((menu) => {
      const hasChildren = menu.children && menu.children.length > 0
      const icon = getIcon(menu.icon)
      const isLeaf = menu.path !== undefined && menu.path !== null
      const menuIdNum = parseInt(menu.id, 10)

      // leaf 메뉴 또는 최대 레벨 도달
      if (!hasChildren || level >= maxLevel) {
        // 즐겨찾기 버튼을 포함한 레이블
        const labelWithFavorite =
          favoriteOptions && isLeaf && !collapsed ? (
            <div className="flex items-center justify-between w-full group">
              <span>{menu.name}</span>
              <FavoriteButton
                isFavorite={favoriteOptions.isFavorite(menuIdNum)}
                onToggle={() => favoriteOptions.toggleFavorite(menuIdNum)}
                disabled={
                  !favoriteOptions.isFavorite(menuIdNum) &&
                  !favoriteOptions.canAddFavorite()
                }
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                showTooltip={true}
              />
            </div>
          ) : (
            menu.name
          )

        const menuItem: NonNullable<MenuProps['items']>[number] = {
          key: menu.id,
          icon: level === 1 ? icon : null,
          label: labelWithFavorite,
          'data-testid': `menu-${menu.code.toLowerCase()}`,
        }
        return menuItem
      }

      // 서브메뉴가 있는 경우
      const subMenuItem: NonNullable<MenuProps['items']>[number] = {
        key: menu.id,
        icon: level === 1 ? icon : null,
        label: menu.name,
        children: convertToMenuItems(
          menu.children || [],
          collapsed,
          favoriteOptions,
          level + 1,
          maxLevel
        ),
        'data-testid': `menu-${menu.code.toLowerCase()}`,
      }
      return subMenuItem
    })
}

// 경로로 메뉴 찾기
export const findMenuByPath = (
  menus: MenuItem[],
  path: string
): MenuItem | null => {
  for (const menu of menus) {
    if (menu.path === path) return menu
    if (menu.children) {
      const found = findMenuByPath(menu.children, path)
      if (found) return found
    }
  }
  return null
}

// ID로 메뉴 찾기
export const findMenuById = (
  menus: MenuItem[],
  id: string
): MenuItem | null => {
  for (const menu of menus) {
    if (menu.id === id) return menu
    if (menu.children) {
      const found = findMenuById(menu.children, id)
      if (found) return found
    }
  }
  return null
}

// 메뉴의 상위 키 경로 찾기
export const findParentKeys = (
  menus: MenuItem[],
  targetId: string,
  parents: string[] = []
): string[] => {
  for (const menu of menus) {
    if (menu.id === targetId) return parents
    if (menu.children) {
      const found = findParentKeys(menu.children, targetId, [
        ...parents,
        menu.id,
      ])
      if (found.length > 0 || menu.children.some((child) => child.id === targetId)) {
        return found.length > 0 ? found : [...parents, menu.id]
      }
    }
  }
  return []
}

export function Sidebar({
  menus,
  collapsed,
  selectedKeys = [],
  openKeys = [],
  onMenuClick,
  onOpenChange,
  favoriteOptions,
}: SidebarProps) {
  // Ant Design Menu 아이템으로 변환
  const menuItems = useMemo(
    () => convertToMenuItems(menus, collapsed, favoriteOptions),
    [menus, collapsed, favoriteOptions]
  )

  // 메뉴 클릭 핸들러
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const menu = findMenuById(menus, key)
    if (menu && onMenuClick) {
      onMenuClick(menu)
    }
  }

  // 서브메뉴 열기/닫기 핸들러
  const handleOpenChange = (keys: string[]) => {
    if (onOpenChange) {
      onOpenChange(keys)
    }
  }

  return (
    <div
      className="flex flex-col h-full"
      data-testid="sidebar"
      role="navigation"
      aria-label="메인 메뉴"
    >
      {/* 메뉴 영역 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <Menu
          mode="inline"
          theme="light"
          inlineCollapsed={collapsed}
          items={menuItems}
          selectedKeys={selectedKeys}
          openKeys={collapsed ? [] : openKeys}
          onClick={handleMenuClick}
          onOpenChange={handleOpenChange}
          className="border-none"
          data-testid="sidebar-menu"
        />
      </div>
    </div>
  )
}
