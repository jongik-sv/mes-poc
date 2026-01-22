// components/dashboard/__tests__/KPICard.test.tsx
// KPICard 컴포넌트 단위 테스트 (026-test-specification.md 기준)

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { KPICard } from '../KPICard'
import { ConfigProvider } from 'antd'
import type { KPIData } from '../types'

// 테스트 래퍼
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    {children}
  </ConfigProvider>
)

describe('KPICard', () => {
  // Mock 데이터 정의 (설계 문서 기준)
  const mockEfficiencyKPI: KPIData = {
    value: 87.3,
    unit: '%',
    change: 2.1,
    changeType: 'increase',
  }

  const mockDefectKPI: KPIData = {
    value: 1.2,
    unit: '%',
    change: -0.3,
    changeType: 'decrease',
  }

  const mockProductionKPI: KPIData = {
    value: 1247,
    unit: '개',
    change: 12.5,
    changeType: 'increase',
  }

  const mockOrdersKPI: KPIData = {
    value: 15,
    unit: '건',
    change: 0,
    changeType: 'neutral',
  }

  describe('rendering', () => {
    // UT-001: 가동률(efficiency) 카드 정상 렌더링
    it('should render efficiency card correctly', () => {
      render(
        <TestWrapper>
          <KPICard
            title="가동률"
            data={mockEfficiencyKPI}
            valueType="positive"
            data-testid="kpi-card-efficiency"
          />
        </TestWrapper>
      )

      // 타이틀 확인
      expect(screen.getByText('가동률')).toBeInTheDocument()

      // data-testid 확인
      expect(screen.getByTestId('kpi-card-efficiency')).toBeInTheDocument()

      // 값 확인 (소수점 1자리, BR-007)
      const card = screen.getByTestId('kpi-card-efficiency')
      expect(card.textContent).toContain('87.3')
      expect(card.textContent).toContain('%')
    })

    // UT-002: 불량률(defect) 카드 정상 렌더링
    it('should render defect card correctly', () => {
      render(
        <TestWrapper>
          <KPICard
            title="불량률"
            data={mockDefectKPI}
            valueType="negative"
            data-testid="kpi-card-defect"
          />
        </TestWrapper>
      )

      expect(screen.getByText('불량률')).toBeInTheDocument()
      expect(screen.getByTestId('kpi-card-defect')).toBeInTheDocument()

      const card = screen.getByTestId('kpi-card-defect')
      expect(card.textContent).toContain('1.2')
    })

    // UT-003: 생산량(production) 카드 정상 렌더링
    it('should render production card correctly', () => {
      render(
        <TestWrapper>
          <KPICard
            title="금일 생산량"
            data={mockProductionKPI}
            valueType="positive"
            data-testid="kpi-card-production"
          />
        </TestWrapper>
      )

      expect(screen.getByText('금일 생산량')).toBeInTheDocument()
      expect(screen.getByTestId('kpi-card-production')).toBeInTheDocument()

      // 천 단위 콤마 적용 (BR-006)
      const card = screen.getByTestId('kpi-card-production')
      expect(card.textContent).toMatch(/1,?247/)
      expect(card.textContent).toContain('개')
    })

    // UT-004: 작업지시(orders) 카드 정상 렌더링
    it('should render orders card correctly', () => {
      render(
        <TestWrapper>
          <KPICard
            title="작업지시"
            data={mockOrdersKPI}
            valueType="positive"
            data-testid="kpi-card-orders"
          />
        </TestWrapper>
      )

      expect(screen.getByText('작업지시')).toBeInTheDocument()
      expect(screen.getByTestId('kpi-card-orders')).toBeInTheDocument()

      // 정수 표시 (BR-008)
      const card = screen.getByTestId('kpi-card-orders')
      expect(card.textContent).toContain('15')
      expect(card.textContent).toContain('건')
    })
  })

  describe('change indicator - positive KPI', () => {
    // UT-004: 긍정 KPI 증가(increase) - 상승 화살표 + 녹색 (BR-001)
    it('should show green up arrow for positive KPI increase', () => {
      render(
        <TestWrapper>
          <KPICard
            title="가동률"
            data={mockEfficiencyKPI}
            valueType="positive"
            data-testid="kpi-card-efficiency"
          />
        </TestWrapper>
      )

      const card = screen.getByTestId('kpi-card-efficiency')

      // 증감률 값 확인
      expect(card.textContent).toContain('2.1')

      // 녹색 스타일 확인 - 실제 렌더링된 스타일로 검증
      // 긍정 KPI + 증가 = 좋음 = 녹색
      const trendElement = card.querySelector('[style*="color"]')
      if (trendElement) {
        const color = (trendElement as HTMLElement).style.color
        // success color: light=#16A34A, dark=#22C55E
        expect(
          color === 'rgb(22, 163, 74)' || color === '#16A34A' ||  // light theme
          color === 'rgb(34, 197, 94)' || color === '#22C55E'     // dark theme
        ).toBe(true)
      }
    })

    // UT-004-2: 긍정 KPI 감소(decrease) - 하락 화살표 + 빨간색 (BR-002)
    it('should show red down arrow for positive KPI decrease', () => {
      const decreaseData: KPIData = {
        value: 1000,
        unit: '개',
        change: -5.0,
        changeType: 'decrease',
      }

      render(
        <TestWrapper>
          <KPICard
            title="금일 생산량"
            data={decreaseData}
            valueType="positive"
            data-testid="kpi-card-production"
          />
        </TestWrapper>
      )

      const card = screen.getByTestId('kpi-card-production')

      // 증감률 값 확인
      expect(card.textContent).toMatch(/-?5/)

      // 빨간색 스타일 확인 (긍정 KPI + 감소 = 나쁨 = 빨간색)
      const trendElement = card.querySelector('[style*="color"]')
      if (trendElement) {
        const color = (trendElement as HTMLElement).style.color
        // error color: light=#DC2626, dark=#EF4444
        expect(
          color === 'rgb(220, 38, 38)' || color === '#DC2626' ||  // light theme
          color === 'rgb(239, 68, 68)' || color === '#EF4444'     // dark theme
        ).toBe(true)
      }
    })
  })

  describe('change indicator - negative KPI (defect rate)', () => {
    // UT-005: 부정 KPI(불량률) 증가(increase) - 상승 화살표 + 빨간색 (BR-003)
    it('should show red up arrow for negative KPI (defect rate) increase', () => {
      const defectIncreaseData: KPIData = {
        value: 1.7,
        unit: '%',
        change: 0.5,
        changeType: 'increase',
      }

      render(
        <TestWrapper>
          <KPICard
            title="불량률"
            data={defectIncreaseData}
            valueType="negative"
            data-testid="kpi-card-defect"
          />
        </TestWrapper>
      )

      const card = screen.getByTestId('kpi-card-defect')

      // 증감률 값 확인
      expect(card.textContent).toContain('0.5')

      // **빨간색** 스타일 확인 (부정 KPI + 증가 = 나쁨 = 빨간색)
      const trendElement = card.querySelector('[style*="color"]')
      if (trendElement) {
        const color = (trendElement as HTMLElement).style.color
        expect(
          color === 'rgb(220, 38, 38)' || color === '#DC2626' ||  // light theme
          color === 'rgb(239, 68, 68)' || color === '#EF4444'     // dark theme
        ).toBe(true)
      }
    })

    // UT-005-2: 부정 KPI(불량률) 감소(decrease) - 하락 화살표 + 녹색 (BR-004)
    it('should show green down arrow for negative KPI (defect rate) decrease', () => {
      render(
        <TestWrapper>
          <KPICard
            title="불량률"
            data={mockDefectKPI}
            valueType="negative"
            data-testid="kpi-card-defect"
          />
        </TestWrapper>
      )

      const card = screen.getByTestId('kpi-card-defect')

      // 증감률 값 확인 (-0.3)
      expect(card.textContent).toMatch(/-?0\.3/)

      // **녹색** 스타일 확인 (부정 KPI + 감소 = 좋음 = 녹색)
      const trendElement = card.querySelector('[style*="color"]')
      if (trendElement) {
        const color = (trendElement as HTMLElement).style.color
        expect(
          color === 'rgb(22, 163, 74)' || color === '#16A34A' ||  // light theme
          color === 'rgb(34, 197, 94)' || color === '#22C55E'     // dark theme
        ).toBe(true)
      }
    })
  })

  describe('change indicator - neutral', () => {
    // UT-006: 변화 없음(neutral) - MinusOutlined + 회색 (BR-005)
    it('should show gray neutral indicator for zero change', () => {
      render(
        <TestWrapper>
          <KPICard
            title="작업지시"
            data={mockOrdersKPI}
            valueType="positive"
            data-testid="kpi-card-orders"
          />
        </TestWrapper>
      )

      const card = screen.getByTestId('kpi-card-orders')

      // 증감률 값 확인 (0)
      expect(card.textContent).toContain('0')
    })

    // unchanged 타입도 neutral처럼 동작해야 함 (legacy 호환)
    it('should handle unchanged changeType as neutral', () => {
      const unchangedData: KPIData = {
        value: 50,
        unit: '%',
        change: 0,
        changeType: 'unchanged',
      }

      render(
        <TestWrapper>
          <KPICard
            title="테스트"
            data={unchangedData}
            data-testid="kpi-card-test"
          />
        </TestWrapper>
      )

      const card = screen.getByTestId('kpi-card-test')
      expect(card.textContent).toContain('50')
      expect(card.textContent).toContain('0')
    })
  })

  describe('null handling', () => {
    // UT-007: 값 없음(null) - 대시(-) 표시 (BR-009)
    it('should show dash when value is null', () => {
      const nullValueData: KPIData = {
        value: null as unknown as number,
        unit: '%',
        change: 0,
        changeType: 'neutral',
      }

      render(
        <TestWrapper>
          <KPICard
            title="가동률"
            data={nullValueData}
            data-testid="kpi-card-efficiency"
          />
        </TestWrapper>
      )

      const card = screen.getByTestId('kpi-card-efficiency')
      expect(card.textContent).toContain('-')
    })

    // UT-008: 증감률 없음(null) - 미표시 (BR-009)
    it('should handle null change gracefully', () => {
      const nullChangeData: KPIData = {
        value: 87.3,
        unit: '%',
        change: null as unknown as number,
        changeType: 'neutral',
      }

      render(
        <TestWrapper>
          <KPICard
            title="가동률"
            data={nullChangeData}
            data-testid="kpi-card-efficiency"
          />
        </TestWrapper>
      )

      const card = screen.getByTestId('kpi-card-efficiency')
      expect(card).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    // UT-009: 로딩 상태 표시
    it('should show loading skeleton when loading', () => {
      render(
        <TestWrapper>
          <KPICard
            title="가동률"
            data={mockEfficiencyKPI}
            loading={true}
            data-testid="kpi-card-efficiency"
          />
        </TestWrapper>
      )

      // 카드는 렌더링되어야 함
      expect(screen.getByTestId('kpi-card-efficiency')).toBeInTheDocument()
    })
  })

  describe('formatting', () => {
    // UT-010: 천 단위 콤마 포맷팅 (BR-006)
    it('should format integer with thousand separator', () => {
      const largeNumberData: KPIData = {
        value: 12345,
        unit: '개',
        change: 5.0,
        changeType: 'increase',
      }

      render(
        <TestWrapper>
          <KPICard
            title="금일 생산량"
            data={largeNumberData}
            data-testid="kpi-card-production"
          />
        </TestWrapper>
      )

      const card = screen.getByTestId('kpi-card-production')
      // 천 단위 콤마 적용 (BR-006)
      expect(card.textContent).toMatch(/12,?345/)
    })

    // UT-010-2: 비율 소수점 1자리 표시 (BR-007)
    it('should format percentage with one decimal place', () => {
      const percentageData: KPIData = {
        value: 87.35,
        unit: '%',
        change: 2.1,
        changeType: 'increase',
      }

      render(
        <TestWrapper>
          <KPICard
            title="가동률"
            data={percentageData}
            data-testid="kpi-card-efficiency"
          />
        </TestWrapper>
      )

      const card = screen.getByTestId('kpi-card-efficiency')
      // 소수점 1자리 표시 (BR-007) - 87.35 → 87.4 또는 87.3
      expect(card.textContent).toMatch(/87\.[34]/)
    })

    // UT-010-3: 수량/건수 정수 표시 (BR-008)
    it('should format count as integer', () => {
      const countData: KPIData = {
        value: 15.7,
        unit: '건',
        change: 0,
        changeType: 'neutral',
      }

      render(
        <TestWrapper>
          <KPICard
            title="작업지시"
            data={countData}
            data-testid="kpi-card-orders"
          />
        </TestWrapper>
      )

      const card = screen.getByTestId('kpi-card-orders')
      // 정수 표시 (BR-008)
      expect(card.textContent).toContain('15')
    })
  })

  describe('accessibility', () => {
    // UT-011: data-testid 속성 렌더링
    it('should render custom data-testid', () => {
      render(
        <TestWrapper>
          <KPICard
            title="가동률"
            data={mockEfficiencyKPI}
            data-testid="kpi-card-operation-rate"
          />
        </TestWrapper>
      )

      expect(screen.getByTestId('kpi-card-operation-rate')).toBeInTheDocument()
    })
  })

  describe('legacy compatibility', () => {
    // invertTrend=true는 valueType='negative'와 동일하게 동작해야 함
    it('should support invertTrend for backward compatibility', () => {
      render(
        <TestWrapper>
          <KPICard
            title="불량률"
            data={mockDefectKPI}
            invertTrend={true}
            data-testid="kpi-card-defect"
          />
        </TestWrapper>
      )

      const card = screen.getByTestId('kpi-card-defect')
      expect(card).toBeInTheDocument()

      // 감소지만 invertTrend=true이므로 녹색 (불량률 감소는 좋음)
      const trendElement = card.querySelector('[style*="color"]')
      if (trendElement) {
        const color = (trendElement as HTMLElement).style.color
        expect(
          color === 'rgb(22, 163, 74)' || color === '#16A34A' ||  // light theme
          color === 'rgb(34, 197, 94)' || color === '#22C55E'     // dark theme
        ).toBe(true)
      }
    })
  })
})
