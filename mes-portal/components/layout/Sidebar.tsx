// components/layout/Sidebar.tsx
// MES Portal 사이드바 메뉴 컴포넌트 - Enterprise Design
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

export interface FavoriteOptions {
  isFavorite: (menuId: number) => boolean
  toggleFavorite: (menuId: number) => void
  canAddFavorite: () => boolean
}

export interface SidebarProps {
  menus: MenuItem[]
  collapsed: boolean
  selectedKeys?: string[]
  openKeys?: string[]
  onMenuClick?: (menu: MenuItem) => void
  onOpenChange?: (openKeys: string[]) => void
  favoriteOptions?: FavoriteOptions
}

const getIcon = (iconName?: string): ReactNode => {
  if (!iconName) return <AppstoreOutlined />
  return iconMap[iconName] || <AppstoreOutlined />
}

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

      if (!hasChildren || level >= maxLevel) {
        const labelWithFavorite =
          favoriteOptions && isLeaf && !collapsed ? (
            <div className="flex items-center justify-between w-full group">
              <span className="truncate">{menu.name}</span>
              <FavoriteButton
                isFavorite={favoriteOptions.isFavorite(menuIdNum)}
                onToggle={() => favoriteOptions.toggleFavorite(menuIdNum)}
                disabled={
                  !favoriteOptions.isFavorite(menuIdNum) &&
                  !favoriteOptions.canAddFavorite()
                }
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 flex-shrink-0"
                showTooltip={true}
              />
            </div>
          ) : (
            <span className="truncate">{menu.name}</span>
          )

        const menuItem: NonNullable<MenuProps['items']>[number] = {
          key: menu.id,
          icon: level === 1 ? icon : null,
          label: labelWithFavorite,
          'data-testid': `menu-${menu.code.toLowerCase()}`,
        }
        return menuItem
      }

      const subMenuItem: NonNullable<MenuProps['items']>[number] = {
        key: menu.id,
        icon: level === 1 ? icon : null,
        label: <span className="truncate">{menu.name}</span>,
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
  const menuItems = useMemo(
    () => convertToMenuItems(menus, collapsed, favoriteOptions),
    [menus, collapsed, favoriteOptions]
  )

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const menu = findMenuById(menus, key)
    if (menu && onMenuClick) {
      onMenuClick(menu)
    }
  }

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
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          items={menuItems}
          selectedKeys={selectedKeys}
          openKeys={collapsed ? [] : openKeys}
          onClick={handleMenuClick}
          onOpenChange={handleOpenChange}
          className="border-none"
          data-testid="sidebar-menu"
          style={{
            background: 'transparent',
          }}
        />
      </div>

      {/* 사이드바 하단 정보 */}
      {!collapsed && (
        <div
          className="px-4 py-3 border-t"
          style={{
            borderColor: 'var(--color-gray-200)',
          }}
        >
          <div
            className="text-xs"
            style={{ color: 'var(--color-gray-400)' }}
          >
            MES Portal v0.1.0
          </div>
        </div>
      )}
    </div>
  )
}
