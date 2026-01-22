// components/dashboard/Dashboard.tsx
// 대시보드 메인 레이아웃 컴포넌트 (010-design.md 섹션 11.2 기준)

'use client'

import React from 'react'
import { Typography, Result, Button, Space } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { KPICardSection } from './KPICardSection'
import { ChartSection } from './ChartSection'
import { RecentActivitySection } from './RecentActivitySection'
import type { DashboardData } from './types'

const { Title } = Typography

interface DashboardProps {
  data: DashboardData
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
}

/**
 * Dashboard - 대시보드 메인 컴포넌트
 *
 * 대시보드 화면의 기본 레이아웃 구조 구현
 * - KPI 카드 영역 (상단 4개 카드)
 * - 차트 영역 (중앙 2개 차트)
 * - 최근 활동 영역 (하단 리스트)
 *
 * BR-05: 위젯별 독립 로딩/에러 처리
 *
 * @example
 * ```tsx
 * <Dashboard data={dashboardData} loading={isLoading} />
 * ```
 */
export function Dashboard({
  data,
  loading = false,
  error = null,
  onRetry,
}: DashboardProps) {
  // 전체 에러 상태
  if (error && !data) {
    return (
      <div data-testid="dashboard-page" className="p-6">
        <Result
          status="error"
          title="대시보드를 불러오지 못했습니다"
          subTitle={error.message}
          extra={
            onRetry && (
              <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
                재시도
              </Button>
            )
          }
        />
      </div>
    )
  }

  return (
    <div data-testid="dashboard-page" className="space-y-6">
      {/* 페이지 타이틀 */}
      <header>
        <Title level={4} data-testid="dashboard-title" className="mb-0">
          대시보드
        </Title>
      </header>

      {/* KPI 카드 영역 (FR-001, FR-002) */}
      <KPICardSection data={data.kpi} loading={loading} />

      {/* 차트 영역 (FR-003) */}
      <ChartSection
        productionTrend={data.productionTrend}
        linePerformance={data.linePerformance}
        loading={loading}
      />

      {/* 최근 활동 영역 (FR-004) */}
      <RecentActivitySection
        activities={data.recentActivities}
        loading={loading}
      />
    </div>
  )
}

export default Dashboard
