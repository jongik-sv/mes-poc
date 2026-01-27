/**
 * 즐겨찾기 카드 컴포넌트
 * @description 사용자의 즐겨찾기 메뉴 목록을 표시
 */
'use client'

import { Card, Empty, Skeleton, Typography, theme } from 'antd'
import { StarFilled, RightOutlined } from '@ant-design/icons'
import type { FavoriteMenuItem } from '@/lib/types/favorites'
import { getGlassCardStyle, useIsDarkMode } from '@/lib/theme/utils'

const { Text } = Typography

interface FavoritesCardProps {
  favoriteMenus: FavoriteMenuItem[]
  isLoading?: boolean
  onMenuClick?: (menu: FavoriteMenuItem) => void
}

export function FavoritesCard({ favoriteMenus, isLoading, onMenuClick }: FavoritesCardProps) {
  const { token } = theme.useToken()
  const isDark = useIsDarkMode()

  // 공통 카드 스타일 - Glassmorphism (라이트/다크 테마 호환)
  const cardStyle = getGlassCardStyle(token, isDark)

  if (isLoading) {
    return (
      <Card
        title={
          <div className="flex items-center gap-2">
            <StarFilled style={{ color: '#fadb14' }} />
            <span>즐겨찾기</span>
          </div>
        }
        styles={{
          body: { padding: 16 },
        }}
        style={cardStyle}
      >
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton.Input key={i} active block size="small" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <StarFilled style={{ color: '#fadb14' }} />
          <span>즐겨찾기</span>
          <Text type="secondary" className="text-xs ml-1">
            ({favoriteMenus.length}/10)
          </Text>
        </div>
      }
      styles={{
        body: { padding: 0 },
      }}
      style={cardStyle}
    >
      {favoriteMenus.length === 0 ? (
        <div className="py-8">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="space-y-1">
                <div>즐겨찾기에 등록된 메뉴가 없습니다</div>
                <Text type="secondary" className="text-xs">
                  메뉴 옆 별 아이콘을 클릭하여 추가하세요
                </Text>
              </div>
            }
          />
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: token.colorBorderSecondary }}>
          {favoriteMenus.map((menu) => (
            <button
              key={menu.menuId}
              onClick={() => onMenuClick?.(menu)}
              className="w-full px-4 py-3 flex items-center justify-between transition-colors cursor-pointer"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = token.colorFillSecondary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <div className="flex flex-col gap-0.5">
                <Text strong>{menu.name}</Text>
                <Text type="secondary" className="text-xs">
                  {menu.menuCd}
                </Text>
              </div>
              <RightOutlined style={{ color: token.colorTextQuaternary }} />
            </button>
          ))}
        </div>
      )}
    </Card>
  )
}
