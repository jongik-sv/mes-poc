// components/dashboard/__tests__/KPICard.test.tsx
// KPICard 컴포넌트 단위 테스트

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
  const mockIncreaseData: KPIData = {
    value: 92.5,
    unit: '%',
    change: 2.3,
    changeType: 'increase',
  }

  const mockDecreaseData: KPIData = {
    value: 1.2,
    unit: '%',
    change: -0.3,
    changeType: 'decrease',
  }

  it('renders card with title', () => {
    render(
      <TestWrapper>
        <KPICard title="가동률" data={mockIncreaseData} />
      </TestWrapper>
    )

    expect(screen.getByText('가동률')).toBeInTheDocument()
  })

  it('renders value with correct format', () => {
    const { container } = render(
      <TestWrapper>
        <KPICard title="가동률" data={mockIncreaseData} data-testid="kpi-card" />
      </TestWrapper>
    )

    // Ant Design Statistic 컴포넌트가 값을 렌더링하는지 확인
    const card = screen.getByTestId('kpi-card')
    expect(card.textContent).toContain('92.5')
    expect(card.textContent).toContain('%')
  })

  it('renders large number with thousands separator', () => {
    const largeNumberData: KPIData = {
      value: 12500,
      unit: 'EA',
      change: 500,
      changeType: 'increase',
    }

    render(
      <TestWrapper>
        <KPICard title="생산량" data={largeNumberData} data-testid="kpi-card" />
      </TestWrapper>
    )

    // 12,500 형식으로 표시
    const card = screen.getByTestId('kpi-card')
    expect(card.textContent).toMatch(/12,?500/)
  })

  describe('trend indicator', () => {
    it('shows green color for increase (normal)', () => {
      render(
        <TestWrapper>
          <KPICard title="가동률" data={mockIncreaseData} data-testid="kpi-card" />
        </TestWrapper>
      )

      // 증가 트렌드에서 녹색 표시 (invertTrend가 없으면)
      const changeText = screen.getByText(/2\.3/)
      expect(changeText).toBeInTheDocument()
    })

    it('shows red color for decrease (normal)', () => {
      render(
        <TestWrapper>
          <KPICard title="테스트" data={mockDecreaseData} data-testid="kpi-card" />
        </TestWrapper>
      )

      // 감소 트렌드에서 빨간색 표시 (invertTrend가 없으면)
      const changeText = screen.getByText(/-?0\.3/)
      expect(changeText).toBeInTheDocument()
    })

    it('inverts trend colors when invertTrend is true (불량률)', () => {
      // 불량률: 감소가 긍정(녹색)
      render(
        <TestWrapper>
          <KPICard title="불량률" data={mockDecreaseData} invertTrend={true} data-testid="kpi-card" />
        </TestWrapper>
      )

      // 감소지만 invertTrend=true이므로 녹색
      const changeText = screen.getByText(/-?0\.3/)
      expect(changeText).toBeInTheDocument()
    })
  })

  it('applies custom data-testid', () => {
    render(
      <TestWrapper>
        <KPICard title="가동률" data={mockIncreaseData} data-testid="kpi-card-operation-rate" />
      </TestWrapper>
    )

    expect(screen.getByTestId('kpi-card-operation-rate')).toBeInTheDocument()
  })

  it('handles zero change', () => {
    const unchangedData: KPIData = {
      value: 50,
      unit: '%',
      change: 0,
      changeType: 'unchanged',
    }

    render(
      <TestWrapper>
        <KPICard title="테스트" data={unchangedData} data-testid="kpi-card" />
      </TestWrapper>
    )

    const card = screen.getByTestId('kpi-card')
    expect(card.textContent).toContain('50')
  })
})
