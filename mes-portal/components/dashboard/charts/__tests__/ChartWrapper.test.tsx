// components/dashboard/charts/__tests__/ChartWrapper.test.tsx
// ChartWrapper 컴포넌트 단위 테스트 (026-test-specification.md UT-013 기준)

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChartWrapper } from '../ChartWrapper'

describe('ChartWrapper', () => {
  describe('로딩 상태 (UT-013)', () => {
    it('renders loading skeleton when loading is true', () => {
      render(
        <ChartWrapper loading={true} hasData={false}>
          <div>Chart Content</div>
        </ChartWrapper>
      )

      expect(screen.getByTestId('chart-loading')).toBeInTheDocument()
      expect(screen.queryByText('Chart Content')).not.toBeInTheDocument()
    })
  })

  describe('에러 상태', () => {
    it('renders error result when error is provided', () => {
      const error = new Error('Network error')

      render(
        <ChartWrapper error={error} hasData={false}>
          <div>Chart Content</div>
        </ChartWrapper>
      )

      expect(screen.getByTestId('chart-error')).toBeInTheDocument()
      expect(screen.getByText('차트를 표시할 수 없습니다')).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    it('renders retry button when onRetry is provided', () => {
      const onRetry = vi.fn()
      const error = new Error('Error')

      render(
        <ChartWrapper error={error} hasData={false} onRetry={onRetry}>
          <div>Chart Content</div>
        </ChartWrapper>
      )

      const retryBtn = screen.getByTestId('chart-retry-btn')
      expect(retryBtn).toBeInTheDocument()

      fireEvent.click(retryBtn)
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('does not render retry button when onRetry is not provided', () => {
      const error = new Error('Error')

      render(
        <ChartWrapper error={error} hasData={false}>
          <div>Chart Content</div>
        </ChartWrapper>
      )

      expect(screen.queryByTestId('chart-retry-btn')).not.toBeInTheDocument()
    })
  })

  describe('빈 데이터 상태 (BR-005)', () => {
    it('renders Empty component when hasData is false', () => {
      render(
        <ChartWrapper hasData={false}>
          <div>Chart Content</div>
        </ChartWrapper>
      )

      expect(screen.getByTestId('chart-empty')).toBeInTheDocument()
      expect(screen.getByText('표시할 데이터가 없습니다')).toBeInTheDocument()
    })
  })

  describe('정상 상태', () => {
    it('renders children when hasData is true', () => {
      render(
        <ChartWrapper hasData={true}>
          <div>Chart Content</div>
        </ChartWrapper>
      )

      expect(screen.getByText('Chart Content')).toBeInTheDocument()
      expect(screen.queryByTestId('chart-loading')).not.toBeInTheDocument()
      expect(screen.queryByTestId('chart-error')).not.toBeInTheDocument()
      expect(screen.queryByTestId('chart-empty')).not.toBeInTheDocument()
    })

    it('renders with name-based testid', () => {
      render(
        <ChartWrapper hasData={true} name="line">
          <div>Chart Content</div>
        </ChartWrapper>
      )

      expect(screen.getByTestId('chart-wrapper-line')).toBeInTheDocument()
    })

    it('renders with custom testid', () => {
      render(
        <ChartWrapper hasData={true} data-testid="custom-chart">
          <div>Chart Content</div>
        </ChartWrapper>
      )

      expect(screen.getByTestId('custom-chart')).toBeInTheDocument()
    })
  })

  describe('상태 우선순위', () => {
    it('loading takes priority over error', () => {
      const error = new Error('Error')

      render(
        <ChartWrapper loading={true} error={error} hasData={false}>
          <div>Chart Content</div>
        </ChartWrapper>
      )

      expect(screen.getByTestId('chart-loading')).toBeInTheDocument()
      expect(screen.queryByTestId('chart-error')).not.toBeInTheDocument()
    })

    it('error takes priority over empty', () => {
      const error = new Error('Error')

      render(
        <ChartWrapper error={error} hasData={false}>
          <div>Chart Content</div>
        </ChartWrapper>
      )

      expect(screen.getByTestId('chart-error')).toBeInTheDocument()
      expect(screen.queryByTestId('chart-empty')).not.toBeInTheDocument()
    })
  })

  describe('height prop', () => {
    it('applies custom height', () => {
      render(
        <ChartWrapper hasData={true} height={400} name="test">
          <div>Chart Content</div>
        </ChartWrapper>
      )

      const wrapper = screen.getByTestId('chart-wrapper-test')
      expect(wrapper).toHaveStyle({ height: '400px' })
    })

    it('uses default height of 256', () => {
      render(
        <ChartWrapper hasData={true} name="test">
          <div>Chart Content</div>
        </ChartWrapper>
      )

      const wrapper = screen.getByTestId('chart-wrapper-test')
      expect(wrapper).toHaveStyle({ height: '256px' })
    })
  })
})
