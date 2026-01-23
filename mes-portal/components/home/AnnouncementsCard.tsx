/**
 * 공지사항/업데이트 카드 컴포넌트
 * @description 시스템 공지사항 및 최근 업데이트 내용 표시
 */
'use client'

import { Card, Tag, Typography, theme } from 'antd'
import { NotificationOutlined, RightOutlined } from '@ant-design/icons'
import dayjs from '@/lib/dayjs'
import { getGlassCardStyle, useIsDarkMode } from '@/lib/theme/utils'

const { Text } = Typography

export interface Announcement {
  id: string
  type: 'notice' | 'update'
  title: string
  date: string
  summary: string
}

interface AnnouncementsCardProps {
  announcements: Announcement[]
  onViewMore?: () => void
  onItemClick?: (item: Announcement) => void
}

const typeConfig = {
  notice: { color: 'blue', label: '공지' },
  update: { color: 'green', label: '업데이트' },
}

export function AnnouncementsCard({ announcements, onViewMore, onItemClick }: AnnouncementsCardProps) {
  const { token } = theme.useToken()
  const isDark = useIsDarkMode()

  // 공통 카드 스타일 - Glassmorphism (라이트/다크 테마 호환)
  const cardStyle = getGlassCardStyle(token, isDark)

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <NotificationOutlined style={{ color: token.colorPrimary }} />
          <span>공지사항 / 업데이트</span>
        </div>
      }
      extra={
        onViewMore && (
          <button
            onClick={onViewMore}
            className="text-xs px-2 py-1 rounded transition-colors cursor-pointer"
            style={{
              color: token.colorPrimary,
              backgroundColor: 'transparent',
              border: 'none',
            }}
          >
            더보기 <RightOutlined />
          </button>
        )
      }
      styles={{
        body: { padding: 0 },
      }}
      style={cardStyle}
    >
      <div className="divide-y" style={{ borderColor: token.colorBorderSecondary }}>
        {announcements.slice(0, 5).map((item) => {
          const config = typeConfig[item.type]
          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="w-full px-4 py-3 flex flex-col gap-1 transition-colors cursor-pointer"
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
              <div className="flex items-center gap-2">
                <Tag color={config.color} className="m-0">
                  {config.label}
                </Tag>
                <Text strong className="flex-1 truncate">
                  {item.title}
                </Text>
                <Text type="secondary" className="text-xs flex-shrink-0">
                  {dayjs(item.date).format('MM-DD')}
                </Text>
              </div>
              <Text type="secondary" className="text-xs truncate pl-11">
                {item.summary}
              </Text>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
