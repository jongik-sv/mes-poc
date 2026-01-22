// components/dashboard/ChartSection.tsx
// 차트 영역 컴포넌트 (010-design.md 섹션 5.2 기준)

'use client'

import React from 'react'
import { Row, Col, Empty } from 'antd'
import { WidgetCard } from './WidgetCard'
import type { ProductionTrendItem, LinePerformanceItem } from './types'

interface ChartSectionProps {
  productionTrend: ProductionTrendItem[]
  linePerformance: LinePerformanceItem[]
  loading?: boolean
}

/**
 * ChartSection - 차트 영역
 *
 * 2개의 차트 위젯을 반응형 그리드로 배치
 * - Desktop (lg+): 2열 (span=12)
 * - Tablet, Mobile (md-): 1열 (span=24)
 *
 * 실제 차트 구현은 TSK-07-03에서 진행
 * 현재는 플레이스홀더로 데이터 구조만 표시
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
}: ChartSectionProps) {
  return (
    <section data-testid="chart-section" aria-label="생산 분석 차트">
      <Row gutter={[16, 16]}>
        {/* 시간별 생산량 추이 (라인 차트) */}
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <WidgetCard
            title="시간별 생산량"
            loading={loading}
            minHeight={300}
            data-testid="chart-production-trend"
          >
            {productionTrend.length > 0 ? (
              <div className="h-64 flex items-center justify-center">
                {/* 실제 차트 구현은 TSK-07-03에서 @ant-design/charts 사용 */}
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">시간별 생산량 추이</div>
                  <div className="text-sm text-gray-500">
                    데이터 {productionTrend.length}개 포인트
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
                    {productionTrend.slice(0, 8).map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="text-gray-400">{item.time}</div>
                        <div className="font-medium">{item.value.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Empty description="데이터가 없습니다" />
            )}
          </WidgetCard>
        </Col>

        {/* 라인별 생산 실적 (바 차트) */}
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <WidgetCard
            title="라인별 생산 실적"
            loading={loading}
            minHeight={300}
            data-testid="chart-line-performance"
          >
            {linePerformance.length > 0 ? (
              <div className="h-64 flex items-center justify-center">
                {/* 실제 차트 구현은 TSK-07-03에서 @ant-design/charts 사용 */}
                <div className="w-full px-4">
                  <div className="text-lg font-medium mb-4 text-center">라인별 실적 비교</div>
                  {linePerformance.map((item, index) => (
                    <div key={index} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.line}</span>
                        <span>
                          {item.actual.toLocaleString()} / {item.target.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded"
                          style={{
                            width: `${Math.min((item.actual / item.target) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Empty description="데이터가 없습니다" />
            )}
          </WidgetCard>
        </Col>
      </Row>
    </section>
  )
}

export default ChartSection
