/**
 * 빠른 메뉴 드롭다운 컴포넌트 (TSK-03-04)
 * @description 헤더에서 즐겨찾기 메뉴에 빠르게 접근하기 위한 드롭다운
 */
'use client'

import { Dropdown, Button, Empty, Typography } from 'antd'
import { StarOutlined, InfoCircleOutlined } from '@ant-design/icons'
import type { FavoriteMenuItem } from '@/lib/types/favorites'
import { MenuIcon } from '@/components/layout/MenuIcon'
import type { MenuProps } from 'antd'

const { Text } = Typography

interface QuickMenuProps {
  /** 즐겨찾기 메뉴 목록 */
  favoriteMenus: FavoriteMenuItem[]
  /** 메뉴 클릭 콜백 */
  onMenuClick: (menu: FavoriteMenuItem) => void
  /** 로딩 상태 */
  isLoading?: boolean
}

/**
 * 빠른 메뉴 드롭다운
 */
export function QuickMenu({
  favoriteMenus,
  onMenuClick,
  isLoading = false,
}: QuickMenuProps) {
  // 빈 상태 컨텐츠
  const emptyContent = (
    <div
      className="p-4 text-center min-w-[200px] rounded-lg"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--color-gray-200)',
      }}
      data-testid="quick-menu-empty"
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span style={{ color: 'var(--color-text-secondary)' }}>
            즐겨찾기한 메뉴가 없습니다
          </span>
        }
      />
      <div className="mt-2 flex items-center justify-center gap-1">
        <InfoCircleOutlined style={{ color: 'var(--color-gray-400)' }} />
        <Text type="secondary" className="text-xs">
          사이드바 메뉴에서 별을 클릭하여 추가하세요
        </Text>
      </div>
    </div>
  )

  // 메뉴 아이템 목록
  const menuItems: MenuProps['items'] =
    favoriteMenus.length > 0
      ? [
          {
            key: 'header',
            label: (
              <div
                className="flex items-center gap-2 font-medium"
                data-testid="quick-menu-header"
              >
                <StarOutlined style={{ color: 'var(--ant-color-warning)' }} />
                즐겨찾기
              </div>
            ),
            type: 'group' as const,
          },
          ...favoriteMenus.map((menu) => ({
            key: menu.id.toString(),
            icon: <MenuIcon iconName={menu.icon ?? undefined} />,
            label: menu.name,
            onClick: () => onMenuClick(menu),
            'data-testid': 'favorite-menu-item',
          })),
          { type: 'divider' as const },
          {
            key: 'hint',
            label: (
              <div
                className="flex items-center gap-1 text-gray-400 text-xs"
                data-testid="quick-menu-hint"
              >
                <InfoCircleOutlined />
                사이드바에서 별을 클릭하여 추가
              </div>
            ),
            disabled: true,
          },
        ]
      : []

  // 드롭다운 렌더
  const dropdownRender = () =>
    favoriteMenus.length > 0 ? null : emptyContent

  return (
    <Dropdown
      menu={{ items: menuItems }}
      popupRender={
        favoriteMenus.length === 0 ? () => emptyContent : undefined
      }
      trigger={['click']}
      placement="bottomLeft"
    >
      <Button
        type="text"
        icon={<StarOutlined />}
        loading={isLoading}
        data-testid="quick-menu-btn"
        aria-label="빠른 메뉴 열기"
      />
    </Dropdown>
  )
}
