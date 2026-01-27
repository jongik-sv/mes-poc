// components/layout/Sidebar.tsx
// MES Portal 사이드바 메뉴 컴포넌트 - Enterprise Design
'use client'

import { useMemo, useCallback } from 'react'
import { Menu, theme } from 'antd'
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
  BarChartOutlined,
  FolderOutlined,
  HistoryOutlined,
  UnorderedListOutlined,
  SplitCellsOutlined,
  FundProjectionScreenOutlined,
  CloseOutlined,
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
  AppstoreOutlined: <AppstoreOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  FolderOutlined: <FolderOutlined />,
  HistoryOutlined: <HistoryOutlined />,
  UnorderedListOutlined: <UnorderedListOutlined />,
  SplitCellsOutlined: <SplitCellsOutlined />,
  FundProjectionScreenOutlined: <FundProjectionScreenOutlined />,
  CloseOutlined: <CloseOutlined />,
}

export interface MenuItem {
  menuId: string
  menuCd: string
  name: string
  path?: string
  icon?: string
  children?: MenuItem[]
  sortOrder: string
  isActive: boolean
}

export interface FavoriteOptions {
  isFavorite: (menuId: string) => boolean
  toggleFavorite: (menuId: string) => void
  canAddFavorite: () => boolean
}

export interface SidebarProps {
  menus: MenuItem[]
  collapsed: boolean
  selectedKeys?: string[]
  openKeys?: string[]
  onMenuClick?: (menu: MenuItem) => void
  onOpenChange?: (openKeys: string[]) => void
  onCollapsedChange?: (collapsed: boolean) => void
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
  onParentIconClick?: (menuId: string) => void,
  level: number = 1,
  maxLevel: number = 3
): MenuProps['items'] => {
  if (level > maxLevel) return []

  return menus
    .filter((menu) => menu.isActive)
    .sort((a, b) => a.sortOrder.localeCompare(b.sortOrder))
    .map((menu) => {
      const hasChildren = menu.children && menu.children.length > 0
      const baseIcon = getIcon(menu.icon)
      const isLeaf = menu.path !== undefined && menu.path !== null

      // 1레벨 메뉴에만 아이콘 표시
      const icon = level === 1 ? baseIcon : null

      if (!hasChildren || level >= maxLevel) {
        const isFavorited = favoriteOptions?.isFavorite(menu.menuId) ?? false
        const labelWithFavorite =
          favoriteOptions && isLeaf && !collapsed ? (
            <div className="flex items-center justify-between w-full group">
              <span className="truncate">{menu.name}</span>
              {isFavorited ? (
                <FavoriteButton
                  isFavorite={true}
                  onToggle={() => favoriteOptions.toggleFavorite(menu.menuId)}
                  disabled={false}
                  className="ml-2 flex-shrink-0"
                  showTooltip={true}
                />
              ) : (
                <FavoriteButton
                  isFavorite={false}
                  onToggle={() => favoriteOptions.toggleFavorite(menu.menuId)}
                  disabled={!favoriteOptions.canAddFavorite()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 flex-shrink-0"
                  showTooltip={true}
                />
              )}
            </div>
          ) : (
            <span className="truncate">{menu.name}</span>
          )

        const menuItem: NonNullable<MenuProps['items']>[number] = {
          key: menu.menuId,
          icon,
          label: labelWithFavorite,
          'data-testid': `menu-${menu.menuCd.toLowerCase()}`,
        }
        return menuItem
      }

      const subMenuItem: NonNullable<MenuProps['items']>[number] = {
        key: menu.menuId,
        icon,
        label: <span className="truncate">{menu.name}</span>,
        children: convertToMenuItems(
          menu.children || [],
          collapsed,
          favoriteOptions,
          onParentIconClick,
          level + 1,
          maxLevel
        ),
        'data-testid': `menu-${menu.menuCd.toLowerCase()}`,
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
    if (menu.menuId === id) return menu
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
    if (menu.menuId === targetId) return parents
    if (menu.children) {
      const found = findParentKeys(menu.children, targetId, [
        ...parents,
        menu.menuId,
      ])
      if (found.length > 0 || menu.children.some((child) => child.menuId === targetId)) {
        return found.length > 0 ? found : [...parents, menu.menuId]
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
  onCollapsedChange,
  favoriteOptions,
}: SidebarProps) {
  const { token } = theme.useToken()

  // 부모 메뉴 아이콘 클릭 시 사이드바 펼침 + 메뉴 확장
  const handleParentIconClick = useCallback((menuId: string) => {
    if (onCollapsedChange) {
      onCollapsedChange(false)
    }
    if (onOpenChange) {
      onOpenChange([...openKeys, menuId])
    }
  }, [onCollapsedChange, onOpenChange, openKeys])

  const menuItems = useMemo(
    () => convertToMenuItems(menus, collapsed, favoriteOptions, handleParentIconClick),
    [menus, collapsed, favoriteOptions, handleParentIconClick]
  )

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const menu = findMenuById(menus, key)
    if (!menu) return

    // 핵심: collapsed 상태에서 부모 메뉴(자식 있는 메뉴) 클릭 시 사이드바 펼침
    if (collapsed && menu.children && menu.children.length > 0) {
      if (onCollapsedChange) {
        onCollapsedChange(false)  // 사이드바 펼침
      }
      if (onOpenChange) {
        onOpenChange([...openKeys, menu.menuId])  // 메뉴 확장
      }
      return  // 부모 메뉴는 path가 없으므로 조기 반환
    }

    // 기존 로직: 리프 메뉴 클릭 시 처리
    if (onMenuClick) {
      onMenuClick(menu)
    }
  }

  const handleOpenChange = (keys: string[]) => {
    // 접힌 상태에서 서브메뉴가 열리려고 하면 사이드바 펼침
    if (collapsed && keys.length > 0 && onCollapsedChange) {
      onCollapsedChange(false)
    }
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
          openKeys={openKeys}
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
            borderColor: token.colorBorder,
          }}
        >
          <div
            className="text-xs"
            style={{ color: token.colorTextQuaternary }}
          >
            MES Portal v0.1.0
          </div>
        </div>
      )}
    </div>
  )
}
