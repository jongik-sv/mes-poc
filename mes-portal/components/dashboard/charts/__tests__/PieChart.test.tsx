// components/dashboard/charts/__tests__/PieChart.test.tsx
// PieChart 컴포넌트 단위 테스트 (026-test-specification.md UT-005, UT-006, UT-011 기준)

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// @ant-design/charts 모킹
vi.mock('@ant-design/charts', () => ({
  Pie: vi.fn(({ data }) => (
    <div
      data-testid="mocked-pie-chart"
      data-count={data.length}
      data-products={data.map((d: { product: string }) => d.product).join(',')}
    >
      Mocked Pie Chart
    </div>
  )),
}))

// next-themes 모킹
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}))

import { PieChart } from '../PieChart'

describe('PieChart', () => {
  const mockData = [
    { product: 'A제품', value: 4375, percentage: 35 },
    { product: 'B제품', value: 3750, percentage: 30 },
    { product: 'C제품', value: 2500, percentage: 20 },
    { product: 'D제품', value: 1250, percentage: 10 },
    { product: '기타', value: 625, percentage: 5 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('정상 렌더링 (UT-005)', () => {
    it('renders with product data', () => {
      render(<PieChart data={mockData} />)

      expect(screen.getByTestId('chart-pie-ratio')).toBeInTheDocument()
      expect(screen.getByTestId('mocked-pie-chart')).toBeInTheDocument()
    })

    it('passes correct data count to chart', () => {
      render(<PieChart data={mockData} />)

      const chart = screen.getByTestId('mocked-pie-chart')
      expect(chart).toHaveAttribute('data-count', '5')
    })

    it('renders chart wrapper with pie name', () => {
      render(<PieChart data={mockData} />)

      expect(screen.getByTestId('chart-wrapper-pie')).toBeInTheDocument()
    })
  })

  describe('빈 데이터', () => {
    it('shows empty state with no data', () => {
      render(<PieChart data={[]} />)

      expect(screen.getByTestId('chart-pie-ratio')).toBeInTheDocument()
      expect(screen.getByTestId('chart-empty')).toBeInTheDocument()
    })
  })

  describe('로딩 상태', () => {
    it('shows loading skeleton when loading', () => {
      render(<PieChart data={[]} loading={true} />)

      expect(screen.getByTestId('chart-pie-ratio')).toBeInTheDocument()
      expect(screen.getByTestId('chart-loading')).toBeInTheDocument()
    })
  })

  describe('에러 상태', () => {
    it('shows error when error is provided', () => {
      const error = new Error('Failed to load data')

      render(<PieChart data={[]} error={error} />)

      expect(screen.getByTestId('chart-pie-ratio')).toBeInTheDocument()
      expect(screen.getByTestId('chart-error')).toBeInTheDocument()
    })
  })

  describe('항목 그룹화 (UT-006, BR-003)', () => {
    const manyItemsData = [
      { product: 'A', value: 100, percentage: 25 },
      { product: 'B', value: 80, percentage: 20 },
      { product: 'C', value: 60, percentage: 15 },
      { product: 'D', value: 52, percentage: 13 },
      { product: 'E', value: 52, percentage: 13 },
      { product: 'F', value: 56, percentage: 14 },
    ]

    it('groups items over limit into "기타"', () => {
      render(<PieChart data={manyItemsData} groupLimit={5} />)

      const chart = screen.getByTestId('mocked-pie-chart')
      // 6개 → 5개로 그룹화
      expect(chart).toHaveAttribute('data-count', '5')

      // 마지막 항목이 "기타"인지 확인
      const products = chart.getAttribute('data-products')?.split(',')
      expect(products).toContain('기타')
    })

    it('does not group when within limit', () => {
      const fourItems = manyItemsData.slice(0, 4)

      render(<PieChart data={fourItems} groupLimit={5} />)

      const chart = screen.getByTestId('mocked-pie-chart')
      expect(chart).toHaveAttribute('data-count', '4')
    })

    it('respects custom groupLimit', () => {
      render(<PieChart data={manyItemsData} groupLimit={3} />)

      const chart = screen.getByTestId('mocked-pie-chart')
      // 6개 → 3개로 그룹화
      expect(chart).toHaveAttribute('data-count', '3')
    })
  })

  describe('height prop', () => {
    it('passes custom height to wrapper', () => {
      render(<PieChart data={mockData} height={400} />)

      const wrapper = screen.getByTestId('chart-wrapper-pie')
      expect(wrapper).toHaveStyle({ height: '400px' })
    })
  })

  describe('donut prop', () => {
    it('accepts donut prop (default true)', () => {
      render(<PieChart data={mockData} />)
      expect(screen.getByTestId('mocked-pie-chart')).toBeInTheDocument()
    })

    it('accepts donut=false for full pie', () => {
      render(<PieChart data={mockData} donut={false} />)
      expect(screen.getByTestId('mocked-pie-chart')).toBeInTheDocument()
    })
  })

  describe('단일 항목 데이터', () => {
    it('renders with single item', () => {
      const singleData = [{ product: 'A제품', value: 100, percentage: 100 }]

      render(<PieChart data={singleData} />)

      const chart = screen.getByTestId('mocked-pie-chart')
      expect(chart).toHaveAttribute('data-count', '1')
    })
  })
})
