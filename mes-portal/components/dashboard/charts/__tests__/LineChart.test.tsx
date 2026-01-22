// components/dashboard/charts/__tests__/LineChart.test.tsx
// LineChart 컴포넌트 단위 테스트 (026-test-specification.md UT-001, UT-002 기준)

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// @ant-design/charts 모킹
vi.mock('@ant-design/charts', () => ({
  Line: vi.fn(({ data }) => (
    <div data-testid="mocked-line-chart" data-count={data.length}>
      Mocked Line Chart
    </div>
  )),
}))

// next-themes 모킹
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}))

import { LineChart } from '../LineChart'

describe('LineChart', () => {
  const mockData = [
    { time: '08:00', value: 1200 },
    { time: '09:00', value: 1350 },
    { time: '10:00', value: 1280 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('정상 렌더링 (UT-001)', () => {
    it('renders with valid data', () => {
      render(<LineChart data={mockData} />)

      expect(screen.getByTestId('chart-line-production')).toBeInTheDocument()
      expect(screen.getByTestId('mocked-line-chart')).toBeInTheDocument()
    })

    it('passes correct data count to chart', () => {
      render(<LineChart data={mockData} />)

      const chart = screen.getByTestId('mocked-line-chart')
      expect(chart).toHaveAttribute('data-count', '3')
    })

    it('renders chart wrapper with line name', () => {
      render(<LineChart data={mockData} />)

      expect(screen.getByTestId('chart-wrapper-line')).toBeInTheDocument()
    })
  })

  describe('빈 데이터 (UT-002)', () => {
    it('shows empty state with no data', () => {
      render(<LineChart data={[]} />)

      expect(screen.getByTestId('chart-line-production')).toBeInTheDocument()
      expect(screen.getByTestId('chart-empty')).toBeInTheDocument()
      expect(screen.getByText('표시할 데이터가 없습니다')).toBeInTheDocument()
    })
  })

  describe('로딩 상태', () => {
    it('shows loading skeleton when loading', () => {
      render(<LineChart data={[]} loading={true} />)

      expect(screen.getByTestId('chart-line-production')).toBeInTheDocument()
      expect(screen.getByTestId('chart-loading')).toBeInTheDocument()
    })
  })

  describe('에러 상태', () => {
    it('shows error when error is provided', () => {
      const error = new Error('Failed to load data')

      render(<LineChart data={[]} error={error} />)

      expect(screen.getByTestId('chart-line-production')).toBeInTheDocument()
      expect(screen.getByTestId('chart-error')).toBeInTheDocument()
      expect(screen.getByText('차트를 표시할 수 없습니다')).toBeInTheDocument()
    })

    it('shows retry button with onRetry callback', () => {
      const error = new Error('Error')
      const onRetry = vi.fn()

      render(<LineChart data={[]} error={error} onRetry={onRetry} />)

      expect(screen.getByTestId('chart-retry-btn')).toBeInTheDocument()
    })
  })

  describe('height prop', () => {
    it('passes custom height to wrapper', () => {
      render(<LineChart data={mockData} height={400} />)

      const wrapper = screen.getByTestId('chart-wrapper-line')
      expect(wrapper).toHaveStyle({ height: '400px' })
    })

    it('uses default height of 256', () => {
      render(<LineChart data={mockData} />)

      const wrapper = screen.getByTestId('chart-wrapper-line')
      expect(wrapper).toHaveStyle({ height: '256px' })
    })
  })

  describe('단일 데이터 포인트', () => {
    it('renders with single data point', () => {
      const singleData = [{ time: '08:00', value: 1200 }]

      render(<LineChart data={singleData} />)

      const chart = screen.getByTestId('mocked-line-chart')
      expect(chart).toHaveAttribute('data-count', '1')
    })
  })
})
