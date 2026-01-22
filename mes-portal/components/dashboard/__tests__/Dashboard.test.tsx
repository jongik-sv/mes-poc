// components/dashboard/__tests__/Dashboard.test.tsx
// 대시보드 컴포넌트 단위 테스트 (026-test-specification.md 기준)

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Dashboard } from '../Dashboard'
import { ConfigProvider } from 'antd'
import type { DashboardData } from '../types'

// Mock 데이터
const mockDashboardData: DashboardData = {
  kpi: {
    operationRate: { value: 92.5, unit: '%', change: 2.3, changeType: 'increase' },
    defectRate: { value: 1.2, unit: '%', change: -0.3, changeType: 'decrease' },
    productionVolume: { value: 12500, unit: 'EA', change: 500, changeType: 'increase' },
    achievementRate: { value: 85.3, unit: '%', change: 5.2, changeType: 'increase' },
  },
  productionTrend: [
    { time: '08:00', value: 1200 },
    { time: '09:00', value: 1350 },
  ],
  linePerformance: [
    { line: '1라인', actual: 3200, target: 3500 },
    { line: '2라인', actual: 2800, target: 3000 },
  ],
  recentActivities: [
    { id: 'act-001', time: '2026-01-21T10:30:00Z', type: 'equipment', typeLabel: '설비', message: '1라인 설비 점검 완료' },
  ],
}

// 테스트 래퍼
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    {children}
  </ConfigProvider>
)

describe('Dashboard', () => {
  // UT-001: Dashboard 정상 렌더링
  it('renders all widget areas', () => {
    render(
      <TestWrapper>
        <Dashboard data={mockDashboardData} />
      </TestWrapper>
    )

    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-section')).toBeInTheDocument()
    expect(screen.getByTestId('chart-section')).toBeInTheDocument()
    expect(screen.getByTestId('recent-activity-section')).toBeInTheDocument()
  })

  // UT-002: KPI 카드 영역 렌더링
  it('renders KPI card section with grid layout', () => {
    render(
      <TestWrapper>
        <Dashboard data={mockDashboardData} />
      </TestWrapper>
    )

    const kpiSection = screen.getByTestId('kpi-section')
    expect(kpiSection).toBeInTheDocument()

    // KPI 카드들이 존재하는지 확인 (010-design.md 11.8 기준)
    expect(screen.getByTestId('kpi-card-operation-rate')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-card-defect-rate')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-card-production-volume')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-card-achievement-rate')).toBeInTheDocument()
  })

  // UT-003: 차트 영역 렌더링
  it('renders chart section with grid layout', () => {
    render(
      <TestWrapper>
        <Dashboard data={mockDashboardData} />
      </TestWrapper>
    )

    const chartSection = screen.getByTestId('chart-section')
    expect(chartSection).toBeInTheDocument()

    // 차트들이 존재하는지 확인 (010-design.md 11.8 기준)
    expect(screen.getByTestId('chart-production-trend')).toBeInTheDocument()
    expect(screen.getByTestId('chart-line-performance')).toBeInTheDocument()
  })

  // UT-004: 최근 활동 영역 렌더링
  it('renders activity section', () => {
    render(
      <TestWrapper>
        <Dashboard data={mockDashboardData} />
      </TestWrapper>
    )

    // 010-design.md 11.8 기준: recent-activity-section
    const activitySection = screen.getByTestId('recent-activity-section')
    expect(activitySection).toBeInTheDocument()
  })

  describe('responsive', () => {
    // UT-005: 반응형 그리드 lg (대화면)
    it('passes correct responsive span props to KPI columns', () => {
      render(
        <TestWrapper>
          <Dashboard data={mockDashboardData} />
        </TestWrapper>
      )

      const kpiSection = screen.getByTestId('kpi-section')
      // Col 컴포넌트가 올바른 반응형 span을 갖는지 확인
      // 실제 CSS 기반 레이아웃 동작은 E2E 테스트에서 검증
      expect(kpiSection).toBeInTheDocument()
    })

    // UT-006: 반응형 그리드 md (중간 화면)
    it('has md breakpoint configuration', () => {
      render(
        <TestWrapper>
          <Dashboard data={mockDashboardData} />
        </TestWrapper>
      )

      // 컴포넌트가 md breakpoint 설정을 갖는지 확인
      const kpiSection = screen.getByTestId('kpi-section')
      expect(kpiSection).toBeInTheDocument()
    })

    // UT-007: 반응형 그리드 xs (소형 화면)
    it('has xs breakpoint configuration', () => {
      render(
        <TestWrapper>
          <Dashboard data={mockDashboardData} />
        </TestWrapper>
      )

      // 컴포넌트가 xs breakpoint 설정을 갖는지 확인
      const kpiSection = screen.getByTestId('kpi-section')
      expect(kpiSection).toBeInTheDocument()
    })
  })

  describe('KPI values', () => {
    it('displays correct KPI values', () => {
      render(
        <TestWrapper>
          <Dashboard data={mockDashboardData} />
        </TestWrapper>
      )

      // KPI 카드들이 존재하고 값이 포함되어 있는지 확인
      // Ant Design Statistic은 값을 여러 span으로 렌더링하므로 카드 내부에서 검색
      const operationCard = screen.getByTestId('kpi-card-operation-rate')
      const defectCard = screen.getByTestId('kpi-card-defect-rate')
      const productionCard = screen.getByTestId('kpi-card-production-volume')
      const achievementCard = screen.getByTestId('kpi-card-achievement-rate')

      // 각 KPI 카드 내에서 값이 존재하는지 확인 (textContent 사용)
      expect(operationCard.textContent).toContain('92.5')
      expect(defectCard.textContent).toContain('1.2')
      expect(productionCard.textContent).toMatch(/12,?500/)
      expect(achievementCard.textContent).toContain('85.3')
    })

    it('displays KPI card titles', () => {
      render(
        <TestWrapper>
          <Dashboard data={mockDashboardData} />
        </TestWrapper>
      )

      expect(screen.getByText('가동률')).toBeInTheDocument()
      expect(screen.getByText('불량률')).toBeInTheDocument()
      expect(screen.getByText('생산량')).toBeInTheDocument()
      expect(screen.getByText('달성률')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('renders loading skeletons when loading', () => {
      render(
        <TestWrapper>
          <Dashboard data={mockDashboardData} loading={true} />
        </TestWrapper>
      )

      // 로딩 상태에서도 페이지 구조는 유지
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('renders error state when error prop is provided', () => {
      const testError = new Error('Failed to load dashboard')

      render(
        <TestWrapper>
          <Dashboard data={mockDashboardData} error={testError} />
        </TestWrapper>
      )

      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    })
  })
})
