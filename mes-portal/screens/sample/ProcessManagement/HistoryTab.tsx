/**
 * @file HistoryTab.tsx
 * @description 변경 이력 탭 컴포넌트
 * @task TSK-06-18
 */

'use client'

import React from 'react'
import { Timeline, Tag, Empty, Typography } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import dayjs from '@/lib/dayjs'
import type { HistoryData, HistoryAction } from './types'
import { HISTORY_ACTION_LABELS, HISTORY_ACTION_COLORS } from './types'

const { Text } = Typography

interface HistoryTabProps {
  history?: HistoryData[]
  loading?: boolean
}

/**
 * 액션 아이콘 매핑
 */
const ACTION_ICONS: Record<HistoryAction, React.ReactNode> = {
  create: <PlusOutlined />,
  update: <EditOutlined />,
  delete: <DeleteOutlined />,
}

/**
 * 변경 이력 탭 컴포넌트
 */
export function HistoryTab({ history = [], loading = false }: HistoryTabProps) {
  // 데이터 없음 표시
  if (!loading && history.length === 0) {
    return (
      <Empty
        description="변경 이력이 없습니다"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )
  }

  // 최신순 정렬
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <Timeline
      data-testid="history-timeline"
      items={sortedHistory.map((item) => ({
        key: item.id,
        dot: ACTION_ICONS[item.action],
        color: HISTORY_ACTION_COLORS[item.action],
        children: (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Tag color={HISTORY_ACTION_COLORS[item.action]}>
                {HISTORY_ACTION_LABELS[item.action]}
              </Tag>
              <Text type="secondary">
                {dayjs(item.timestamp).format('YYYY-MM-DD HH:mm')}
              </Text>
            </div>
            <Text>{item.changes || '-'}</Text>
            <Text type="secondary" className="text-xs">
              작업자: {item.user}
            </Text>
          </div>
        ),
      }))}
    />
  )
}

export default HistoryTab
