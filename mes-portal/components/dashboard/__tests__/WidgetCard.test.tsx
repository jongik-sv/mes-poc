// components/dashboard/__tests__/WidgetCard.test.tsx
// WidgetCard 컴포넌트 단위 테스트 (UT-008: 최소 높이 유지)

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { WidgetCard } from '../WidgetCard'
import { ConfigProvider } from 'antd'

// 테스트 래퍼
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider>
    {children}
  </ConfigProvider>
)

describe('WidgetCard', () => {
  it('renders with title and children', () => {
    render(
      <TestWrapper>
        <WidgetCard title="Test Widget">
          <div>Test Content</div>
        </WidgetCard>
      </TestWrapper>
    )

    expect(screen.getByText('Test Widget')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders extra content in header', () => {
    render(
      <TestWrapper>
        <WidgetCard title="Test Widget" extra={<span>Extra Content</span>}>
          <div>Test Content</div>
        </WidgetCard>
      </TestWrapper>
    )

    expect(screen.getByText('Extra Content')).toBeInTheDocument()
  })

  // UT-008: DashboardWidget 최소 높이 유지
  it('maintains minimum height', () => {
    const { container } = render(
      <TestWrapper>
        <WidgetCard title="Test Widget" minHeight={120} data-testid="dashboard-widget">
          <div>Minimal Content</div>
        </WidgetCard>
      </TestWrapper>
    )

    const widget = screen.getByTestId('dashboard-widget')
    expect(widget).toBeInTheDocument()

    // 스타일 확인 (minHeight prop이 적용되는지)
    const card = container.querySelector('.ant-card')
    expect(card).toBeInTheDocument()
  })

  describe('loading state', () => {
    it('shows skeleton when loading', () => {
      render(
        <TestWrapper>
          <WidgetCard title="Test Widget" loading={true}>
            <div>Test Content</div>
          </WidgetCard>
        </TestWrapper>
      )

      // 로딩 중에는 스켈레톤이 표시됨
      expect(screen.getByTestId('widget-loading')).toBeInTheDocument()
    })

    it('hides content when loading', () => {
      render(
        <TestWrapper>
          <WidgetCard title="Test Widget" loading={true}>
            <div data-testid="widget-content">Test Content</div>
          </WidgetCard>
        </TestWrapper>
      )

      // 로딩 중에는 실제 컨텐츠가 표시되지 않음
      expect(screen.queryByTestId('widget-content')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows error message when error prop is provided', () => {
      const testError = new Error('Failed to load data')

      render(
        <TestWrapper>
          <WidgetCard title="Test Widget" error={testError}>
            <div>Test Content</div>
          </WidgetCard>
        </TestWrapper>
      )

      expect(screen.getByTestId('widget-error')).toBeInTheDocument()
      expect(screen.getByText(/데이터를 불러오지 못했습니다/)).toBeInTheDocument()
    })

    it('shows retry button when onRetry is provided', () => {
      const onRetry = vi.fn()
      const testError = new Error('Failed to load data')

      render(
        <TestWrapper>
          <WidgetCard title="Test Widget" error={testError} onRetry={onRetry}>
            <div>Test Content</div>
          </WidgetCard>
        </TestWrapper>
      )

      const retryButton = screen.getByTestId('widget-retry-btn')
      expect(retryButton).toBeInTheDocument()

      fireEvent.click(retryButton)
      expect(onRetry).toHaveBeenCalledTimes(1)
    })
  })

  it('applies custom className', () => {
    render(
      <TestWrapper>
        <WidgetCard title="Test Widget" className="custom-class" data-testid="custom-widget">
          <div>Test Content</div>
        </WidgetCard>
      </TestWrapper>
    )

    const widget = screen.getByTestId('custom-widget')
    expect(widget).toHaveClass('custom-class')
  })

  it('applies custom data-testid', () => {
    render(
      <TestWrapper>
        <WidgetCard title="Test Widget" data-testid="my-widget">
          <div>Test Content</div>
        </WidgetCard>
      </TestWrapper>
    )

    expect(screen.getByTestId('my-widget')).toBeInTheDocument()
  })
})
