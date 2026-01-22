// components/dashboard/ChartSection.tsx
// 차트 영역 컴포넌트 (010-design.md 섹션 5.2 기준)

'use client'

import React from 'react'
import { Row, Col } from 'antd'
import { WidgetCard } from './WidgetCard'
import { LineChart, BarChart } from './charts'
import type { ProductionTrendItem, LinePerformanceItem } from './types'

interface ChartSectionProps {
  productionTrend: ProductionTrendItem[]
  linePerformance: LinePerformanceItem[]
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
}

/**
 * ChartSection - 차트 영역
 *
 * 2개의 차트 위젯을 반응형 그리드로 배치
 * - Desktop (lg+): 2열 (span=12)
 * - Tablet, Mobile (md-): 1열 (span=24)
 *
 * @example
 * ```tsx
 * <ChartSection
 *   productionTrend={trendData}
 *   linePerformance={performanceData}
 * />
 * ```
 */
export function ChartSection({
  productionTrend,
  linePerformance,
  loading = false,
  error = null,
  onRetry,
}: ChartSectionProps) {
  return (
    <section data-testid="chart-section" aria-label="생산 분석 차트">
      <Row gutter={[16, 16]}>
        {/* 시간별 생산량 추이 (라인 차트) */}
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <WidgetCard
            title="시간별 생산량"
            loading={loading}
            error={error}
            onRetry={onRetry}
            minHeight={300}
            data-testid="chart-production-trend"
          >
            <LineChart
              data={productionTrend}
              loading={loading}
              error={error}
              onRetry={onRetry}
              height={256}
            />
          </WidgetCard>
        </Col>

        {/* 라인별 생산 실적 (바 차트) */}
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <WidgetCard
            title="라인별 생산 실적"
            loading={loading}
            error={error}
            onRetry={onRetry}
            minHeight={300}
            data-testid="chart-line-performance"
          >
            <BarChart
              data={linePerformance}
              loading={loading}
              error={error}
              onRetry={onRetry}
              height={256}
              showPerformanceColor={true}
            />
          </WidgetCard>
        </Col>
      </Row>
    </section>
  )
}

export default ChartSection
