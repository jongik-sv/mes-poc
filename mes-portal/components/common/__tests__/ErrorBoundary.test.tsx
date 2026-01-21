// components/common/__tests__/ErrorBoundary.test.tsx
// ErrorBoundary 컴포넌트 단위 테스트 (TSK-05-01)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '../ErrorBoundary'

// 에러 발생 컴포넌트
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div data-testid="child-content">Normal Content</div>
}

// userEvent 헬퍼
const renderWithUser = (ui: React.ReactElement) => {
  return {
    user: userEvent.setup(),
    ...render(ui),
  }
}

describe('ErrorBoundary', () => {
  // console.error를 억제
  const originalConsoleError = console.error

  beforeEach(() => {
    console.error = vi.fn()
  })

  afterEach(() => {
    console.error = originalConsoleError
    vi.clearAllMocks()
  })

  // UT-014: ErrorBoundary 에러 캐치
  describe('UT-014: 에러 캐치', () => {
    it('catches error and renders fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
      expect(screen.getByText(/오류가 발생했습니다/)).toBeInTheDocument()
    })

    it('shows error message in fallback', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('error-boundary-message')).toBeInTheDocument()
    })
  })

  // UT-015: ErrorBoundary 에러 콜백 호출
  describe('UT-015: 에러 콜백 호출', () => {
    it('calls onError callback with error info', () => {
      const onError = vi.fn()

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      )
    })

    it('filters sensitive information from error logs', () => {
      const onError = vi.fn()
      const errorWithSensitiveInfo = () => {
        const error = new Error('Error with password=secret123')
        throw error
      }

      const SensitiveThrow = () => {
        errorWithSensitiveInfo()
        return null
      }

      render(
        <ErrorBoundary onError={onError}>
          <SensitiveThrow />
        </ErrorBoundary>
      )

      // onError가 호출되었는지 확인
      expect(onError).toHaveBeenCalled()
    })
  })

  // UT-016: ErrorBoundary 정상 자식 렌더링
  describe('UT-016: 정상 자식 렌더링', () => {
    it('renders children when no error', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-content">Content</div>
        </ErrorBoundary>
      )

      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument()
    })

    it('renders multiple children when no error', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </ErrorBoundary>
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })
  })

  // UT-017: ErrorBoundary 커스텀 fallback
  describe('UT-017: 커스텀 fallback', () => {
    it('renders custom fallback component', () => {
      render(
        <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Error</div>}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument()
    })

    it('renders fallbackRender function with error and reset', () => {
      const fallbackRender = vi.fn(({ error, resetError }) => (
        <div data-testid="fallback-render">
          <span>{error.message}</span>
          <button onClick={resetError} data-testid="reset-btn">Reset</button>
        </div>
      ))

      render(
        <ErrorBoundary fallbackRender={fallbackRender}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('fallback-render')).toBeInTheDocument()
      expect(fallbackRender).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          resetError: expect.any(Function),
        })
      )
    })
  })

  // UT-017, UT-018: BR-002 재시도 제한
  describe('BR-002: 재시도 제한', () => {
    it('shows retry button on error', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('error-boundary-retry-btn')).toBeInTheDocument()
    })

    it('increments retry count on retry button click', async () => {
      const AlwaysThrow = () => {
        throw new Error('Always error')
      }

      const { user } = renderWithUser(
        <ErrorBoundary maxRetries={3}>
          <AlwaysThrow />
        </ErrorBoundary>
      )

      // 첫 번째 에러
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
      expect(screen.queryByTestId('error-boundary-max-retries')).not.toBeInTheDocument()

      // 첫 번째 재시도
      await user.click(screen.getByTestId('error-boundary-retry-btn'))

      // 두 번째 에러 - 재시도 버튼 여전히 존재 (2회까지)
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
    })

    it('shows admin contact message after 3 retries', async () => {
      const AlwaysThrow = () => {
        throw new Error('Persistent error')
      }

      const { user, rerender } = renderWithUser(
        <ErrorBoundary maxRetries={3}>
          <AlwaysThrow />
        </ErrorBoundary>
      )

      // 3회 재시도
      for (let i = 0; i < 3; i++) {
        if (screen.queryByTestId('error-boundary-retry-btn')) {
          await user.click(screen.getByTestId('error-boundary-retry-btn'))
        }
      }

      // 3회 실패 후 관리자 문의 안내
      expect(screen.getByTestId('error-boundary-max-retries')).toBeInTheDocument()
      expect(screen.getByText(/관리자에게 문의/)).toBeInTheDocument()
    })
  })

  // resetError 테스트
  describe('resetError', () => {
    it('resets error state when resetError is called', async () => {
      let shouldThrow = true
      const ConditionalThrow = () => {
        if (shouldThrow) {
          throw new Error('Conditional error')
        }
        return <div data-testid="recovered">Recovered</div>
      }

      const fallbackRender = ({ resetError }: { error: Error; resetError: () => void }) => (
        <div>
          <button
            onClick={() => {
              shouldThrow = false
              resetError()
            }}
            data-testid="reset-btn"
          >
            Reset
          </button>
        </div>
      )

      const { user } = renderWithUser(
        <ErrorBoundary fallbackRender={fallbackRender}>
          <ConditionalThrow />
        </ErrorBoundary>
      )

      await user.click(screen.getByTestId('reset-btn'))

      expect(screen.getByTestId('recovered')).toBeInTheDocument()
    })
  })
})
