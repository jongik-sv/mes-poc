// components/dashboard/KPICard.tsx
// KPI 카드 컴포넌트 (TSK-07-02 설계 문서 기준)

'use client'

import React from 'react'
import { Card, Statistic, Skeleton, Typography } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons'
import { useTheme } from 'next-themes'
import { themeTokens, darkThemeTokens } from '@/lib/theme/tokens'
import type { KPICardProps, KPIChangeType, KPIValueType } from './types'

const { Text } = Typography

/**
 * KPI 값 포맷팅 (BR-006, BR-007, BR-008)
 * @param value - 숫자 값
 * @param unit - 단위 (%, 개, 건 등)
 * @returns 포맷팅된 문자열
 */
function formatKPIValue(value: number | null | undefined, unit: string): string {
  // BR-009: 값이 없으면 대시 표시
  if (value === null || value === undefined) {
    return '-'
  }

  // BR-007: 비율은 소수점 1자리까지 표시
  if (unit === '%') {
    return value.toFixed(1)
  }

  // BR-008: 수량/건수는 정수로 표시
  if (unit === '개' || unit === '건' || unit === 'EA') {
    const intValue = Math.floor(value)
    // BR-006: 천 단위 콤마 적용
    return intValue.toLocaleString('ko-KR')
  }

  // 기본: 천 단위 콤마 적용 (BR-006)
  if (value >= 1000 && Number.isInteger(value)) {
    return value.toLocaleString('ko-KR')
  }

  return String(value)
}

/**
 * 증감률 색상 결정 (BR-001 ~ BR-005)
 * @param changeType - 변화 유형 (increase, decrease, neutral, unchanged)
 * @param valueType - KPI 유형 (positive, negative)
 * @param invertTrend - 역전 플래그 (legacy 지원)
 * @param isDark - 다크 모드 여부
 * @returns 색상 코드 (테마 토큰 기반)
 */
function getChangeColor(
  changeType: KPIChangeType,
  valueType: KPIValueType = 'positive',
  invertTrend: boolean = false,
  isDark: boolean = false
): string {
  const tokens = isDark ? darkThemeTokens : themeTokens

  // BR-005: neutral 또는 unchanged는 기본 색상
  if (changeType === 'neutral' || changeType === 'unchanged') {
    return 'inherit'
  }

  const isPositiveChange = changeType === 'increase'

  // invertTrend가 true면 valueType을 반전 (legacy 호환)
  const effectiveValueType = invertTrend
    ? (valueType === 'positive' ? 'negative' : 'positive')
    : valueType

  const isPositiveKPI = effectiveValueType === 'positive'

  // BR-001, BR-002, BR-003, BR-004
  // 긍정 KPI + 증가 = 좋음 = 녹색
  // 긍정 KPI + 감소 = 나쁨 = 빨간색
  // 부정 KPI + 증가 = 나쁨 = 빨간색
  // 부정 KPI + 감소 = 좋음 = 녹색
  if (isPositiveChange === isPositiveKPI) {
    return tokens.colorSuccess
  } else {
    return tokens.colorError
  }
}

/**
 * 증감 아이콘 결정
 * @param changeType - 변화 유형
 * @returns React 아이콘 컴포넌트
 */
function getTrendIcon(changeType: KPIChangeType): React.ReactNode {
  if (changeType === 'increase') return <ArrowUpOutlined />
  if (changeType === 'decrease') return <ArrowDownOutlined />
  return <MinusOutlined />
}

/**
 * 증감률 텍스트 결정
 * @param change - 변화 값
 * @param changeType - 변화 유형
 * @returns 포맷팅된 증감률 문자열
 */
function getTrendText(change: number | null | undefined, changeType: KPIChangeType): string {
  // BR-009: change가 없으면 빈 문자열
  if (change === null || change === undefined) {
    return ''
  }

  if (changeType === 'neutral' || changeType === 'unchanged' || change === 0) {
    return '0'
  }

  const prefix = change > 0 ? '+' : ''
  return `${prefix}${change}`
}

/**
 * KPICard - KPI 지표 카드
 *
 * KPI 수치와 증감률을 표시하는 카드 컴포넌트
 * - 값과 단위 표시 (BR-006, BR-007, BR-008)
 * - 증감률 (BR-001 ~ BR-005)
 * - valueType: 'positive' | 'negative' (설계 문서 기준)
 * - invertTrend: legacy 호환용 (deprecated)
 *
 * @example
 * ```tsx
 * // 긍정 KPI (생산량, 가동률)
 * <KPICard
 *   title="가동률"
 *   data={{ value: 92.5, unit: '%', change: 2.3, changeType: 'increase' }}
 *   valueType="positive"
 * />
 *
 * // 부정 KPI (불량률)
 * <KPICard
 *   title="불량률"
 *   data={{ value: 1.2, unit: '%', change: -0.3, changeType: 'decrease' }}
 *   valueType="negative"
 * />
 * ```
 */
export function KPICard({
  title,
  data,
  invertTrend = false,
  valueType = 'positive',
  loading = false,
  'data-testid': testId,
}: KPICardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { value, unit, change, changeType } = data

  // 포맷팅된 값 (BR-006, BR-007, BR-008)
  const formattedValue = formatKPIValue(value, unit)

  // 증감률 색상 (BR-001 ~ BR-005) - 테마 토큰 사용
  const trendColor = getChangeColor(changeType, valueType, invertTrend, isDark)

  // 증감 아이콘
  const trendIcon = getTrendIcon(changeType)

  // 증감 텍스트
  const trendText = getTrendText(change, changeType)

  // 로딩 상태
  if (loading) {
    return (
      <Card
        hoverable
        data-testid={testId}
        styles={{
          body: { padding: '16px 20px' },
        }}
      >
        <div className="flex flex-col gap-2">
          <Skeleton.Input active size="small" style={{ width: 80 }} />
          <Skeleton.Input active size="large" style={{ width: 120 }} />
          <Skeleton.Input active size="small" style={{ width: 60 }} />
        </div>
      </Card>
    )
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
            suffix={value !== null && value !== undefined ? unit : undefined}
            styles={{ content: { fontSize: 28, fontWeight: 600, lineHeight: 1.2 } }}
          />
        </div>
        {trendText !== '' && (
          <div
            className="flex items-center gap-1 text-sm"
            style={{ color: trendColor }}
          >
            {trendIcon}
            <span>{trendText}</span>
          </div>
        )}
      </div>
    </Card>
  )
}

export default KPICard
