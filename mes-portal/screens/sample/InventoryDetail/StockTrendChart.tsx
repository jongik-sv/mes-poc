// screens/sample/InventoryDetail/StockTrendChart.tsx
// 재고 추이 차트 컴포넌트 (TSK-06-15)

'use client'

import React, { useMemo } from 'react'
import { Empty, Space, Typography } from 'antd'
import { Line } from '@ant-design/charts'
import dayjs from 'dayjs'
import type { StockTrendChartProps, InventoryTrend } from './types'
import { formatNumber } from './utils'

const { Text } = Typography

/**
 * 재고 추이 차트 컴포넌트
 *
 * FR-004: 재고 추이 차트 (Line Chart)
 *
 * BR-004: 재고 추이 30일 데이터 표시
 * - 일별 재고 수준 라인 차트
 * - 안전 재고 수준 점선 표시
 */
export function StockTrendChart({
  trends,
  itemId,
  safetyStock,
}: StockTrendChartProps) {
  // 해당 품목의 추이 데이터만 필터링 (최근 30일)
  const chartData = useMemo(() => {
    const itemTrends = trends
      .filter((t) => t.itemId === itemId)
      .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix())

    // 날짜 포맷 변환
    return itemTrends.map((t) => ({
      date: dayjs(t.date).format('MM/DD'),
      stock: t.stock,
      type: '일별 재고',
    }))
  }, [trends, itemId])

  // 안전 재고 데이터 (차트에 점선으로 표시)
  const safetyStockLine = useMemo(() => {
    if (chartData.length === 0) return []
    return chartData.map((d) => ({
      date: d.date,
      stock: safetyStock,
      type: '안전 재고',
    }))
  }, [chartData, safetyStock])

  // 차트 데이터 통합
  const combinedData = useMemo(() => {
    return [...chartData, ...safetyStockLine]
  }, [chartData, safetyStockLine])

  // 데이터가 없는 경우
  if (chartData.length === 0) {
    return (
      <div
        data-testid="trend-chart-empty"
        className="flex flex-1 items-center justify-center py-12"
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space orientation="vertical" size={4}>
              <Text type="secondary">재고 추이 데이터가 없습니다</Text>
              <Text type="secondary" className="text-xs">
                해당 품목의 재고 추이 기록이 없습니다
              </Text>
            </Space>
          }
        />
      </div>
    )
  }

  // 차트 설정
  const config = {
    data: combinedData,
    xField: 'date',
    yField: 'stock',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    point: {
      shapeField: 'square',
      sizeField: 4,
    },
    style: {
      lineWidth: 2,
    },
    colorField: 'type',
    scale: {
      color: {
        range: ['#1890ff', '#ff4d4f'],
      },
    },
    lineStyle: (data: { type: string }) => {
      if (data.type === '안전 재고') {
        return {
          lineDash: [4, 4],
          opacity: 0.8,
        }
      }
      return {}
    },
    legend: {
      position: 'bottom' as const,
    },
    tooltip: {
      title: (d: { date: string }) => d.date,
      items: [
        {
          field: 'stock',
          name: '수량',
          valueFormatter: (value: number) => `${formatNumber(value)} EA`,
        },
      ],
    },
    yAxis: {
      title: {
        text: '수량',
        style: { fontSize: 12 },
      },
      label: {
        formatter: (v: string) => formatNumber(Number(v)),
      },
    },
    xAxis: {
      title: {
        text: '날짜',
        style: { fontSize: 12 },
      },
    },
  }

  return (
    <div data-testid="trend-chart" className="h-80">
      <Line {...config} />
    </div>
  )
}

export default StockTrendChart
