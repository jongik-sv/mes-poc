// components/dashboard/charts/BarChart.tsx
// 라인별 생산 실적 바 차트 컴포넌트 (010-design.md 섹션 5.2 화면 2 기준)

'use client'

import React, { useMemo } from 'react'
import { Column } from '@ant-design/charts'
import { useTheme } from 'next-themes'
import { ChartWrapper } from './ChartWrapper'
import {
  transformLinePerformance,
  formatNumber,
  calculateAchievementRate,
  limitDataPoints,
  MAX_DATA_POINTS,
} from './utils'
import { getBarChartColors, getPerformanceColor, getChartTheme } from '@/lib/theme/chart-theme'
import type { LinePerformanceItem } from '../types'

export interface BarChartProps {
  /** 라인별 실적 데이터 */
  data: LinePerformanceItem[]
  /** 로딩 상태 */
  loading?: boolean
  /** 에러 상태 */
  error?: Error | null
  /** 재시도 콜백 */
  onRetry?: () => void
  /** 차트 높이 */
  height?: number
  /** 목표 미달 색상 표시 여부 (BR-002) */
  showPerformanceColor?: boolean
}

/**
 * BarChart - 라인별 생산 실적 그룹 바 차트
 *
 * X축: 라인명
 * Y축: 수량 (EA)
 * 시리즈: 실적 / 목표
 *
 * 특징:
 * - 그룹 바 차트 (실적과 목표 나란히)
 * - 목표 미달 시 색상 변경 (BR-002)
 * - 호버 시 달성률 포함 툴팁
 * - 테마 연동 (라이트/다크)
 *
 * @example
 * ```tsx
 * <BarChart
 *   data={linePerformance}
 *   loading={isLoading}
 *   showPerformanceColor={true}
 * />
 * ```
 */
export function BarChart({
  data,
  loading = false,
  error = null,
  onRetry,
  height = 256,
  showPerformanceColor = true,
}: BarChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [primaryColor, targetColor] = getBarChartColors(isDark)
  const chartTheme = getChartTheme(isDark)

  // 데이터 변환 및 제한
  const limitedData = limitDataPoints(data, MAX_DATA_POINTS.BAR_CHART)
  const chartData = useMemo(
    () => transformLinePerformance(limitedData),
    [limitedData]
  )

  // 원본 데이터 맵 (툴팁용)
  const dataMap = useMemo(() => {
    const map = new Map<string, LinePerformanceItem>()
    limitedData.forEach((item) => map.set(item.line, item))
    return map
  }, [limitedData])

  // 실적 바 색상 결정 함수 (BR-002)
  const getActualColor = (line: string): string => {
    if (!showPerformanceColor) return primaryColor

    const item = dataMap.get(line)
    if (!item) return primaryColor

    return getPerformanceColor(item.actual, item.target, isDark)
  }

  // Column 차트 설정
  const config = {
    data: chartData,
    xField: 'line',
    yField: 'value',
    colorField: 'type',
    group: true,
    autoFit: true,
    theme: isDark ? 'classicDark' : 'classic',
    // 차트 배경색 (다크 테마 대응)
    viewStyle: {
      fill: isDark ? '#1E293B' : 'transparent',
    },
    animation: {
      appear: {
        animation: 'grow-in-y',
        duration: 800,
      },
    },
    // 바 스타일
    style: {
      radiusTopLeft: 4,
      radiusTopRight: 4,
      fill: (datum: { type: string; line: string }) => {
        if (datum.type === 'target') return targetColor
        return getActualColor(datum.line)
      },
    },
    // 축 설정
    axis: {
      x: {
        title: false,
        label: {
          style: {
            fill: chartTheme.styleSheet.axisLabelFillColor,
          },
        },
        line: {
          style: {
            stroke: chartTheme.styleSheet.axisLineBorderColor,
          },
        },
      },
      y: {
        title: false,
        labelFormatter: (v: number) => formatNumber(v),
        label: {
          style: {
            fill: chartTheme.styleSheet.axisLabelFillColor,
          },
        },
        line: {
          style: {
            stroke: chartTheme.styleSheet.axisLineBorderColor,
          },
        },
        grid: {
          line: {
            style: {
              stroke: chartTheme.styleSheet.axisGridBorderColor,
            },
          },
        },
      },
    },
    // 범례 설정
    legend: {
      color: {
        itemLabelText: (item: { value: string }) =>
          item.value === 'actual' ? '실적' : '목표',
        itemLabelFill: chartTheme.styleSheet.legendItemNameFillColor,
      },
    },
    // 툴팁 설정 (FR-004)
    tooltip: {
      title: (d: { line: string }) => d.line,
      items: [
        {
          field: 'value',
          name: (d: { type: string }) => (d.type === 'actual' ? '실적' : '목표'),
          valueFormatter: (v: number) => `${formatNumber(v)} EA`,
        },
      ],
      render: (
        _event: unknown,
        { title, items }: { title: string; items: Array<{ name: string; value: string }> }
      ) => {
        const item = dataMap.get(title)
        const rate = item ? calculateAchievementRate(item.actual, item.target) : '0.0'

        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${title}</div>
            ${items.map((i) => `<div>${i.name}: ${i.value}</div>`).join('')}
            <div style="margin-top: 4px; color: ${chartTheme.styleSheet.axisLabelFillColor};">달성률: ${rate}%</div>
          </div>
        `
      },
    },
  }

  return (
    <div data-testid="chart-bar-performance">
      <ChartWrapper
        loading={loading}
        error={error}
        onRetry={onRetry}
        hasData={limitedData.length > 0}
        height={height}
        name="bar"
      >
        <Column {...config} />
      </ChartWrapper>
    </div>
  )
}

export default BarChart
