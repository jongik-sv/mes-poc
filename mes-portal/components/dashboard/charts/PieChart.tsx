// components/dashboard/charts/PieChart.tsx
// 제품별 비율 파이 차트 컴포넌트 (010-design.md 섹션 5.2 화면 3 기준)

'use client'

import React, { useMemo } from 'react'
import { Pie } from '@ant-design/charts'
import { useTheme } from 'next-themes'
import { ChartWrapper } from './ChartWrapper'
import { groupSmallItems, formatNumber } from './utils'
import { getPieChartColors } from '@/lib/theme/chart-theme'
import type { ProductRatioItem } from '../types'

export interface PieChartProps {
  /** 제품별 비율 데이터 */
  data: ProductRatioItem[]
  /** 로딩 상태 */
  loading?: boolean
  /** 에러 상태 */
  error?: Error | null
  /** 재시도 콜백 */
  onRetry?: () => void
  /** 차트 높이 */
  height?: number
  /** 항목 그룹화 제한 (BR-003, 기본값: 5) */
  groupLimit?: number
  /** 도넛 차트 여부 */
  donut?: boolean
}

/**
 * PieChart - 제품별 비율 파이/도넛 차트
 *
 * 각도: 수량 (value)
 * 색상: 제품명
 *
 * 특징:
 * - 5개 초과 항목은 "기타"로 그룹화 (BR-003)
 * - 내부 라벨로 비율 표시
 * - 호버 시 상세 툴팁
 * - 도넛 형태 지원
 * - 테마 연동 (라이트/다크)
 *
 * @example
 * ```tsx
 * <PieChart
 *   data={productRatio}
 *   loading={isLoading}
 *   donut={true}
 * />
 * ```
 */
export function PieChart({
  data,
  loading = false,
  error = null,
  onRetry,
  height = 256,
  groupLimit = 5,
  donut = true,
}: PieChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const colors = getPieChartColors(isDark)

  // 항목 그룹화 (BR-003)
  const groupedData = useMemo(
    () => groupSmallItems(data, groupLimit),
    [data, groupLimit]
  )

  // Pie 차트 설정
  const config = {
    data: groupedData,
    angleField: 'value',
    colorField: 'product',
    radius: 0.8,
    innerRadius: donut ? 0.5 : 0,
    autoFit: true,
    color: colors,
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 800,
      },
    },
    // 라벨 설정
    label: {
      text: (d: ProductRatioItem) => `${d.percentage}%`,
      position: 'outside',
      style: {
        fontSize: 12,
      },
    },
    // 범례 설정
    legend: {
      color: {
        position: 'bottom' as const,
        layout: {
          justifyContent: 'center',
        },
      },
    },
    // 툴팁 설정 (FR-004)
    tooltip: {
      title: (d: ProductRatioItem) => d.product,
      items: [
        {
          field: 'value',
          name: '수량',
          valueFormatter: (v: number) => `${formatNumber(v)} EA`,
        },
        {
          field: 'percentage',
          name: '비율',
          valueFormatter: (v: number) => `${v}%`,
        },
      ],
    },
    // 인터랙션
    interaction: {
      elementHighlight: true,
    },
  }

  return (
    <div data-testid="chart-pie-ratio">
      <ChartWrapper
        loading={loading}
        error={error}
        onRetry={onRetry}
        hasData={groupedData.length > 0}
        height={height}
        name="pie"
      >
        <Pie {...config} />
      </ChartWrapper>
    </div>
  )
}

export default PieChart
