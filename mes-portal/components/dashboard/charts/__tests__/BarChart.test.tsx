// components/dashboard/charts/__tests__/BarChart.test.tsx
// BarChart 컴포넌트 단위 테스트 (026-test-specification.md UT-003, UT-004, UT-010 기준)

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// @ant-design/charts 모킹
vi.mock('@ant-design/charts', () => ({
  Column: vi.fn(({ data }) => (
    <div data-testid="mocked-bar-chart" data-count={data.length}>
      Mocked Bar Chart
    </div>
  )),
}))

// next-themes 모킹
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}))

import { BarChart } from '../BarChart'

describe('BarChart', () => {
  const mockData = [
    { line: '1라인', actual: 3200, target: 3500 },
    { line: '2라인', actual: 2800, target: 3000 },
    { line: '3라인', actual: 3100, target: 3200 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('정상 렌더링 (UT-003)', () => {
    it('renders grouped bar chart with valid data', () => {
      render(<BarChart data={mockData} />)

      expect(screen.getByTestId('chart-bar-performance')).toBeInTheDocument()
      expect(screen.getByTestId('mocked-bar-chart')).toBeInTheDocument()
    })

    it('transforms data to 2x count (actual + target per line)', () => {
      render(<BarChart data={mockData} />)

      const chart = screen.getByTestId('mocked-bar-chart')
      // 3 lines * 2 (actual + target) = 6 data points
      expect(chart).toHaveAttribute('data-count', '6')
    })

    it('renders chart wrapper with bar name', () => {
      render(<BarChart data={mockData} />)

      expect(screen.getByTestId('chart-wrapper-bar')).toBeInTheDocument()
    })
  })

  describe('빈 데이터', () => {
    it('shows empty state with no data', () => {
      render(<BarChart data={[]} />)

      expect(screen.getByTestId('chart-bar-performance')).toBeInTheDocument()
      expect(screen.getByTestId('chart-empty')).toBeInTheDocument()
    })
  })

  describe('로딩 상태', () => {
    it('shows loading skeleton when loading', () => {
      render(<BarChart data={[]} loading={true} />)

      expect(screen.getByTestId('chart-bar-performance')).toBeInTheDocument()
      expect(screen.getByTestId('chart-loading')).toBeInTheDocument()
    })
  })

  describe('에러 상태', () => {
    it('shows error when error is provided', () => {
      const error = new Error('Failed to load data')

      render(<BarChart data={[]} error={error} />)

      expect(screen.getByTestId('chart-bar-performance')).toBeInTheDocument()
      expect(screen.getByTestId('chart-error')).toBeInTheDocument()
    })
  })

  describe('height prop', () => {
    it('passes custom height to wrapper', () => {
      render(<BarChart data={mockData} height={400} />)

      const wrapper = screen.getByTestId('chart-wrapper-bar')
      expect(wrapper).toHaveStyle({ height: '400px' })
    })
  })

  describe('showPerformanceColor prop', () => {
    it('accepts showPerformanceColor=true', () => {
      render(<BarChart data={mockData} showPerformanceColor={true} />)
      expect(screen.getByTestId('mocked-bar-chart')).toBeInTheDocument()
    })

    it('accepts showPerformanceColor=false', () => {
      render(<BarChart data={mockData} showPerformanceColor={false} />)
      expect(screen.getByTestId('mocked-bar-chart')).toBeInTheDocument()
    })
  })

  describe('목표 미달 데이터 (UT-010)', () => {
    const underperformingData = [
      { line: '1라인', actual: 2100, target: 3500 }, // 60% - 위험
      { line: '2라인', actual: 2700, target: 3000 }, // 90% - 정상
      { line: '3라인', actual: 2560, target: 3200 }, // 80% - 경고
    ]

    it('renders with underperforming data', () => {
      render(<BarChart data={underperformingData} showPerformanceColor={true} />)

      expect(screen.getByTestId('mocked-bar-chart')).toBeInTheDocument()
      // 3 lines * 2 = 6
      const chart = screen.getByTestId('mocked-bar-chart')
      expect(chart).toHaveAttribute('data-count', '6')
    })
  })

  describe('단일 라인 데이터', () => {
    it('renders with single line data', () => {
      const singleData = [{ line: '1라인', actual: 3200, target: 3500 }]

      render(<BarChart data={singleData} />)

      const chart = screen.getByTestId('mocked-bar-chart')
      expect(chart).toHaveAttribute('data-count', '2') // 1 * 2
    })
  })

  describe('목표 초과 데이터', () => {
    it('handles data where actual exceeds target', () => {
      const exceedingData = [
        { line: '1라인', actual: 3800, target: 3500 }, // 108%
      ]

      render(<BarChart data={exceedingData} />)

      const chart = screen.getByTestId('mocked-bar-chart')
      expect(chart).toHaveAttribute('data-count', '2')
    })
  })
})
