// components/common/__tests__/PageLoading.test.tsx
// PageLoading 컴포넌트 단위 테스트 (TSK-05-01)

import { render, screen, act, waitFor } from '@testing-library/react'
import { PageLoading } from '../PageLoading'

// Ant Design 모킹
vi.mock('antd', () => ({
  Spin: ({ spinning, tip, size, children, ...props }: any) => (
    spinning !== false ? (
      <div
        role="status"
        data-testid="spin-component"
        data-size={size}
        {...props}
      >
        {tip && <span data-testid="spin-tip">{tip}</span>}
        {children}
      </div>
    ) : children
  ),
}))

describe('PageLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  // UT-001: PageLoading 로딩 표시
  describe('UT-001: PageLoading 로딩 표시', () => {
    it('renders Spin component when loading', async () => {
      render(<PageLoading />)

      // 기본 delay(200ms)를 건너뛰기 위해 타이머 진행
      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      expect(screen.getByTestId('page-loading')).toBeInTheDocument()
      expect(screen.getByTestId('spin-component')).toBeInTheDocument()
    })
  })

  // UT-002: PageLoading 로딩 완료
  describe('UT-002: PageLoading 로딩 완료', () => {
    it('does not render when loading is false', () => {
      render(<PageLoading loading={false} />)

      expect(screen.queryByTestId('page-loading')).not.toBeInTheDocument()
    })
  })

  // UT-003: PageLoading 커스텀 메시지
  describe('UT-003: PageLoading 커스텀 메시지', () => {
    it('displays custom tip message', async () => {
      render(<PageLoading tip="데이터 처리 중..." />)

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      expect(screen.getByTestId('spin-tip')).toHaveTextContent('데이터 처리 중...')
    })

    it('displays default tip message when not provided', async () => {
      render(<PageLoading />)

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      expect(screen.getByTestId('spin-tip')).toHaveTextContent('로딩 중입니다...')
    })
  })

  // UT-004: PageLoading 전체 화면 모드
  describe('UT-004: PageLoading 전체 화면 모드', () => {
    it('applies fullScreen styles when fullScreen is true', async () => {
      render(<PageLoading fullScreen />)

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      const container = screen.getByTestId('page-loading')
      expect(container).toHaveClass('fullscreen')
    })

    it('does not apply fullScreen styles when fullScreen is false', async () => {
      render(<PageLoading fullScreen={false} />)

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      const container = screen.getByTestId('page-loading')
      expect(container).not.toHaveClass('fullscreen')
    })
  })

  // UT-005: PageLoading 사이즈 옵션
  describe('UT-005: PageLoading 사이즈 옵션', () => {
    it.each(['small', 'default', 'large'] as const)(
      'renders with size %s',
      async (size) => {
        render(<PageLoading size={size} />)

        await act(async () => {
          vi.advanceTimersByTime(200)
        })

        const spinner = screen.getByTestId('spin-component')
        expect(spinner).toHaveAttribute('data-size', size)
      }
    )
  })

  // UT-016: BR-001 깜빡임 방지 (200ms 이하 스피너 미표시)
  describe('UT-016: BR-001 깜빡임 방지', () => {
    it('does not show spinner before delay (200ms)', async () => {
      render(<PageLoading delay={200} />)

      // 100ms 시점에서는 스피너 미표시
      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(screen.queryByTestId('page-loading')).not.toBeInTheDocument()

      // 200ms 이후 스피너 표시
      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(screen.getByTestId('page-loading')).toBeInTheDocument()
    })

    it('uses custom delay value', async () => {
      render(<PageLoading delay={500} />)

      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      expect(screen.queryByTestId('page-loading')).not.toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(screen.getByTestId('page-loading')).toBeInTheDocument()
    })
  })

  // 접근성 테스트
  describe('접근성', () => {
    it('has role="status" for screen readers', async () => {
      render(<PageLoading />)

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      const container = screen.getByTestId('page-loading')
      expect(container).toHaveAttribute('role', 'status')
    })

    it('has aria-live="polite" for loading announcements', async () => {
      render(<PageLoading />)

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      const container = screen.getByTestId('page-loading')
      expect(container).toHaveAttribute('aria-live', 'polite')
    })

    it('has aria-busy="true" when loading', async () => {
      render(<PageLoading />)

      await act(async () => {
        vi.advanceTimersByTime(200)
      })

      const container = screen.getByTestId('page-loading')
      expect(container).toHaveAttribute('aria-busy', 'true')
    })
  })
})
