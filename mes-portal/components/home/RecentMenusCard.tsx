/**
 * 최근 사용 메뉴 카드 컴포넌트
 * @description 사용자가 최근에 방문한 메뉴 목록을 표시
 */
'use client'

import { Card, Empty, Skeleton, Typography, theme } from 'antd'
import { HistoryOutlined, RightOutlined, DeleteOutlined } from '@ant-design/icons'
import { useRecentMenus } from '@/lib/hooks'
import type { RecentMenuItem } from '@/lib/hooks'
import dayjs from '@/lib/dayjs'
import { getGlassCardStyle, useIsDarkMode } from '@/lib/theme/utils'

const { Text } = Typography

interface RecentMenusCardProps {
  onMenuClick?: (menu: RecentMenuItem) => void
}

export function RecentMenusCard({ onMenuClick }: RecentMenusCardProps) {
  const { token } = theme.useToken()
  const isDark = useIsDarkMode()
  const { recentMenus, clearRecentMenus, isLoading } = useRecentMenus()

  // 공통 카드 스타일 - Glassmorphism (라이트/다크 테마 호환)
  const cardStyle = getGlassCardStyle(token, isDark)

  if (isLoading) {
    return (
      <Card
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined />
            <span>최근 사용 메뉴</span>
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
          <HistoryOutlined style={{ color: token.colorPrimary }} />
          <span>최근 사용 메뉴</span>
        </div>
      }
      extra={
        recentMenus.length > 0 && (
          <button
            onClick={clearRecentMenus}
            className="text-xs px-2 py-1 rounded transition-colors cursor-pointer"
            style={{
              color: token.colorTextSecondary,
              backgroundColor: 'transparent',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = token.colorError
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = token.colorTextSecondary
            }}
          >
            <DeleteOutlined className="mr-1" />
            전체 삭제
          </button>
        )
      }
      styles={{
        body: { padding: 0 },
      }}
      style={cardStyle}
    >
      {recentMenus.length === 0 ? (
        <div className="py-8">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="최근 사용한 메뉴가 없습니다"
          />
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: token.colorBorderSecondary }}>
          {recentMenus.map((menu) => (
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
                  {menu.menuCd} · {dayjs(menu.visitedAt).fromNow()}
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
