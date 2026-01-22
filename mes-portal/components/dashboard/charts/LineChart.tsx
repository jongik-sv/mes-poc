// components/dashboard/charts/LineChart.tsx
// 시간별 생산량 라인 차트 컴포넌트 (010-design.md 섹션 5.2 화면 1 기준)

'use client'

import React from 'react'
import { Line } from '@ant-design/charts'
import { useTheme } from 'next-themes'
import { ChartWrapper } from './ChartWrapper'
import { formatNumber, limitDataPoints, MAX_DATA_POINTS } from './utils'
import { getChartTheme } from '@/lib/theme/chart-theme'
import type { ProductionTrendItem } from '../types'

export interface LineChartProps {
  /** 생산량 추이 데이터 */
  data: ProductionTrendItem[]
  /** 로딩 상태 */
  loading?: boolean
  /** 에러 상태 */
  error?: Error | null
  /** 재시도 콜백 */
  onRetry?: () => void
  /** 차트 높이 */
  height?: number
}

/**
 * LineChart - 시간별 생산량 추이 라인 차트
 *
 * X축: 시간 (HH:mm)
 * Y축: 생산량 (EA)
 *
 * 특징:
 * - 부드러운 곡선 (smooth: true)
 * - 데이터 포인트 표시
 * - 호버 시 툴팁 표시
 * - 테마 연동 (라이트/다크)
 *
 * @example
 * ```tsx
 * <LineChart
 *   data={productionTrend}
 *   loading={isLoading}
 * />
 * ```
 */
export function LineChart({
  data,
  loading = false,
  error = null,
  onRetry,
  height = 256,
}: LineChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const chartTheme = getChartTheme(isDark)

  // 데이터 크기 제한
  const limitedData = limitDataPoints(data, MAX_DATA_POINTS.LINE_CHART)

  // Line 차트 설정
  const config = {
    data: limitedData,
    xField: 'time',
    yField: 'value',
    smooth: true,
    autoFit: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    // 데이터 포인트 표시
    point: {
      shapeField: 'circle',
      sizeField: 4,
    },
    // 선 스타일
    style: {
      stroke: chartTheme.colors10[0],
      lineWidth: 2,
    },
    // 축 설정
    axis: {
      x: {
        title: false,
        labelFormatter: (v: string) => v,
      },
      y: {
        title: false,
        labelFormatter: (v: number) => formatNumber(v),
      },
    },
    // 툴팁 설정 (FR-004)
    tooltip: {
      title: (d: ProductionTrendItem) => d.time,
      items: [
        {
          field: 'value',
          name: '생산량',
          valueFormatter: (v: number) => `${formatNumber(v)} EA`,
        },
      ],
    },
    // 범례
    legend: false,
  }

  return (
    <div data-testid="chart-line-production">
      <ChartWrapper
        loading={loading}
        error={error}
        onRetry={onRetry}
        hasData={limitedData.length > 0}
        height={height}
        name="line"
      >
        <Line {...config} />
      </ChartWrapper>
    </div>
  )
}

export default LineChart
