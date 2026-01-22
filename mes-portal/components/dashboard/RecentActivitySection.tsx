// components/dashboard/RecentActivitySection.tsx
// 최근 활동 영역 컴포넌트 (010-design.md 섹션 5.2 기준)

'use client'

import React from 'react'
import { Tag, Empty, Typography } from 'antd'
import {
  ToolOutlined,
  ExperimentOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { WidgetCard } from './WidgetCard'
import type { ActivityItem } from './types'

const { Text } = Typography

interface RecentActivitySectionProps {
  activities: ActivityItem[]
  loading?: boolean
  maxItems?: number
}

/**
 * 활동 유형별 아이콘 및 색상
 */
const activityTypeConfig: Record<
  ActivityItem['type'],
  { icon: React.ReactNode; color: string }
> = {
  equipment: { icon: <ToolOutlined />, color: 'blue' },
  quality: { icon: <ExperimentOutlined />, color: 'orange' },
  production: { icon: <AppstoreOutlined />, color: 'green' },
  system: { icon: <SettingOutlined />, color: 'default' },
}

/**
 * 시간을 상대 시간으로 포맷팅
 */
function formatRelativeTime(timeString: string): string {
  const time = new Date(timeString)
  const now = new Date()
  const diffMs = now.getTime() - time.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`

  return time.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

/**
 * RecentActivitySection - 최근 활동 영역
 *
 * 최근 시스템 활동/이벤트 목록을 표시
 * - BR-04: 최대 10개 표시
 * - 시간순 정렬
 *
 * @example
 * ```tsx
 * <RecentActivitySection activities={activityList} maxItems={10} />
 * ```
 */
export function RecentActivitySection({
  activities,
  loading = false,
  maxItems = 10,
}: RecentActivitySectionProps) {
  // BR-04: 최근 활동은 최대 maxItems개 표시
  const displayedActivities = activities.slice(0, maxItems)

  return (
    <section data-testid="recent-activity-section" aria-label="최근 활동">
      <WidgetCard
        title="최근 활동"
        loading={loading}
        minHeight={200}
        extra={
          <a href="#" className="text-sm">
            더보기 &gt;
          </a>
        }
      >
        {displayedActivities.length > 0 ? (
          <div className="space-y-2">
            {displayedActivities.map((item) => {
              const config = activityTypeConfig[item.type]
              return (
                <div
                  key={item.id}
                  data-testid={`activity-item-${item.id}`}
                  className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex-shrink-0 text-lg" style={{ color: config.color === 'default' ? undefined : config.color }}>
                    {config.icon}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      <Tag color={config.color} className="m-0">
                        {item.typeLabel}
                      </Tag>
                      <Text type="secondary" className="text-xs">
                        {formatRelativeTime(item.time)}
                      </Text>
                    </div>
                    <Text className="block truncate mt-1">{item.message}</Text>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <Empty description="최근 활동이 없습니다" />
        )}
      </WidgetCard>
    </section>
  )
}

export default RecentActivitySection
