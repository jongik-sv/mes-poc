// components/dashboard/KPICard.tsx
// KPI 카드 컴포넌트 (010-design.md 섹션 5.2 기준)

'use client'

import React from 'react'
import { Card, Statistic, Typography } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons'
import type { KPICardProps } from './types'

const { Text } = Typography

/**
 * KPICard - KPI 지표 카드
 *
 * KPI 수치와 증감률을 표시하는 카드 컴포넌트
 * - 값과 단위 표시
 * - 증감률 (녹색/빨간색)
 * - invertTrend: 불량률처럼 감소가 긍정인 경우
 *
 * @example
 * ```tsx
 * <KPICard
 *   title="가동률"
 *   data={{ value: 92.5, unit: '%', change: 2.3, changeType: 'increase' }}
 * />
 * ```
 */
export function KPICard({
  title,
  data,
  invertTrend = false,
  'data-testid': testId,
}: KPICardProps) {
  const { value, unit, change, changeType } = data

  // 포맷팅된 값 (천 단위 구분자)
  const formattedValue = value >= 1000 ? value.toLocaleString() : value

  // 증감 아이콘
  const getTrendIcon = () => {
    if (changeType === 'increase') return <ArrowUpOutlined />
    if (changeType === 'decrease') return <ArrowDownOutlined />
    return <MinusOutlined />
  }

  // 증감 색상 결정 (BR-02: 증감률 색상 규칙)
  // invertTrend가 true면 감소가 긍정(녹색), 증가가 부정(빨간색)
  const getTrendColor = () => {
    if (changeType === 'unchanged') return 'inherit'

    const isPositiveChange = changeType === 'increase'
    // invertTrend가 true면 색상 반전
    const isGood = invertTrend ? !isPositiveChange : isPositiveChange

    return isGood ? '#52c41a' : '#ff4d4f'
  }

  // 증감 텍스트
  const getTrendText = () => {
    if (changeType === 'unchanged' || change === 0) return '0'
    const prefix = change > 0 ? '+' : ''
    return `${prefix}${change}`
  }

  return (
    <Card
      hoverable
      data-testid={testId}
      styles={{
        body: { padding: '16px 20px' },
      }}
    >
      <div className="flex flex-col gap-2">
        <Text type="secondary" className="text-sm">
          {title}
        </Text>
        <div className="flex items-baseline gap-1">
          <Statistic
            value={formattedValue}
            suffix={unit}
            styles={{ content: { fontSize: 28, fontWeight: 600, lineHeight: 1.2 } }}
          />
        </div>
        <div
          className="flex items-center gap-1 text-sm"
          style={{ color: getTrendColor() }}
        >
          {getTrendIcon()}
          <span>{getTrendText()}</span>
        </div>
      </div>
    </Card>
  )
}

export default KPICard
