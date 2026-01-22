// components/dashboard/KPICardSection.tsx
// KPI 카드 영역 컴포넌트 (010-design.md 섹션 5.2 기준)

'use client'

import React from 'react'
import { Row, Col } from 'antd'
import { KPICard } from './KPICard'
import type { DashboardKPI } from './types'

interface KPICardSectionProps {
  data: DashboardKPI
  loading?: boolean
}

/**
 * KPICardSection - KPI 카드 영역
 *
 * 4개의 KPI 카드를 반응형 그리드로 배치
 * - Desktop (xl, lg): 4열 (span=6)
 * - Tablet (md, sm): 2열 (span=12)
 * - Mobile (xs): 2열 (span=12)
 *
 * @example
 * ```tsx
 * <KPICardSection data={kpiData} />
 * ```
 */
export function KPICardSection({ data, loading = false }: KPICardSectionProps) {
  const kpiItems = [
    {
      key: 'operation-rate',
      title: '가동률',
      data: data.operationRate,
      testId: 'kpi-card-operation-rate',
      invertTrend: false,
    },
    {
      key: 'defect-rate',
      title: '불량률',
      data: data.defectRate,
      testId: 'kpi-card-defect-rate',
      invertTrend: true, // BR-02: 불량률은 감소가 긍정
    },
    {
      key: 'production-volume',
      title: '생산량',
      data: data.productionVolume,
      testId: 'kpi-card-production-volume',
      invertTrend: false,
    },
    {
      key: 'achievement-rate',
      title: '달성률',
      data: data.achievementRate,
      testId: 'kpi-card-achievement-rate',
      invertTrend: false,
    },
  ]

  return (
    <section data-testid="kpi-section" aria-label="핵심 성과 지표">
      <Row gutter={[16, 16]}>
        {kpiItems.map((item) => (
          <Col
            key={item.key}
            xs={12}
            sm={12}
            md={12}
            lg={6}
            xl={6}
          >
            <KPICard
              title={item.title}
              data={item.data}
              invertTrend={item.invertTrend}
              data-testid={item.testId}
            />
          </Col>
        ))}
      </Row>
    </section>
  )
}

export default KPICardSection
