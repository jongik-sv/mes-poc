// components/common/__tests__/ErrorPage.test.tsx
// ErrorPage 컴포넌트 단위 테스트 (TSK-05-01)

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorPage } from '../ErrorPage'

// next/navigation 모킹
const mockPush = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

// Ant Design 모킹
jest.mock('antd', () => ({
  Result: ({ status, title, subTitle, extra, icon, ...props }: any) => (
    <div data-testid="result" data-status={status} {...props}>
      {icon && <div data-testid="result-icon">{icon}</div>}
      <div>{title}</div>
      <div>{subTitle}</div>
      {extra && <div data-testid="result-extra">{extra}</div>}
    </div>
  ),
  Button: ({ children, onClick, type, danger, loading, ...props }: any) => (
    <button
      onClick={onClick}
      data-type={type}
      data-danger={String(danger)}
      data-loading={String(loading)}
      {...props}
    >
      {children}
    </button>
  ),
  Space: ({ children, ...props }: any) => (
    <div data-testid="space" {...props}>{children}</div>
  ),
}))

// Ant Design Icons 모킹
jest.mock('@ant-design/icons', () => ({
  WifiOutlined: () => <span data-testid="wifi-icon">wifi</span>,
  ClockCircleOutlined: () => <span data-testid="clock-icon">clock</span>,
  LockOutlined: () => <span data-testid="lock-icon">lock</span>,
  SearchOutlined: () => <span data-testid="search-icon">search</span>,
  HomeOutlined: () => <span data-testid="home-icon">home</span>,
  LoginOutlined: () => <span data-testid="login-icon">login</span>,
  ArrowLeftOutlined: () => <span data-testid="arrow-left-icon">arrow-left</span>,
  ReloadOutlined: () => <span data-testid="reload-icon">reload</span>,
  MessageOutlined: () => <span data-testid="message-icon">message</span>,
}))

// userEvent 헬퍼
const renderWithUser = (ui: React.ReactElement) => {
  return {
    user: userEvent.setup(),
    ...render(ui),
  }
}

describe('ErrorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // UT-018: ErrorPage 404 렌더링
  describe('UT-018: 404 렌더링', () => {
    it('renders 404 page', () => {
      render(<ErrorPage status={404} />)

      expect(screen.getByTestId('error-page')).toBeInTheDocument()
      expect(screen.getByTestId('error-page-title')).toHaveTextContent('404')
      expect(screen.getByTestId('error-page-message')).toHaveTextContent('페이지를 찾을 수 없습니다')
    })

    it('shows home button on 404 page', () => {
      render(<ErrorPage status={404} />)

      expect(screen.getByTestId('error-page-home-btn')).toBeInTheDocument()
    })
  })

  // UT-019: ErrorPage 500 렌더링
  describe('UT-019: 500 렌더링', () => {
    it('renders 500 page', () => {
      render(<ErrorPage status={500} />)

      expect(screen.getByTestId('error-page-title')).toHaveTextContent('500')
      expect(screen.getByTestId('error-page-message')).toHaveTextContent('서버 오류가 발생했습니다')
    })

    it('shows retry and home buttons on 500 page', () => {
      render(<ErrorPage status={500} onRetry={jest.fn()} />)

      expect(screen.getByTestId('error-page-retry-btn')).toBeInTheDocument()
      expect(screen.getByTestId('error-page-home-btn')).toBeInTheDocument()
    })
  })

  // UT-020: ErrorPage 403 렌더링
  describe('UT-020: 403 렌더링', () => {
    it('renders 403 page', () => {
      render(<ErrorPage status={403} />)

      expect(screen.getByTestId('error-page-title')).toHaveTextContent('403')
      expect(screen.getByTestId('error-page-message')).toHaveTextContent('접근 권한이 없습니다')
    })

    it('shows login and contact buttons on 403 page', () => {
      render(<ErrorPage status={403} />)

      expect(screen.getByTestId('error-page-login-btn')).toBeInTheDocument()
      expect(screen.getByTestId('error-page-contact-btn')).toBeInTheDocument()
    })
  })

  // UT-021: ErrorPage 네트워크 에러
  describe('UT-021: 네트워크 에러', () => {
    it('renders network error page', () => {
      render(<ErrorPage status="network" onRetry={jest.fn()} />)

      expect(screen.getByTestId('error-page-message')).toHaveTextContent('네트워크 연결을 확인해주세요')
      expect(screen.getByTestId('error-page-retry-btn')).toBeInTheDocument()
    })

    it('shows wifi icon for network error', () => {
      render(<ErrorPage status="network" />)

      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument()
    })
  })

  // 세션 만료
  describe('세션 만료', () => {
    it('renders session expired page', () => {
      render(<ErrorPage status="session-expired" />)

      expect(screen.getByTestId('error-page-message')).toHaveTextContent(/세션.*만료/)
      expect(screen.getByTestId('error-page-login-btn')).toBeInTheDocument()
    })

    it('shows clock icon for session expired', () => {
      render(<ErrorPage status="session-expired" />)

      expect(screen.getByTestId('clock-icon')).toBeInTheDocument()
    })
  })

  // UT-022: ErrorPage 재시도 버튼
  describe('UT-022: 재시도 버튼', () => {
    it('calls onRetry when retry button clicked', async () => {
      const onRetry = jest.fn()
      const { user } = renderWithUser(<ErrorPage status={500} onRetry={onRetry} />)

      await user.click(screen.getByTestId('error-page-retry-btn'))

      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('shows loading state on retry button', () => {
      render(<ErrorPage status={500} onRetry={jest.fn()} retrying />)

      const retryBtn = screen.getByTestId('error-page-retry-btn')
      expect(retryBtn).toHaveAttribute('data-loading', 'true')
    })
  })

  // UT-023: ErrorPage 홈으로 버튼
  describe('UT-023: 홈으로 버튼', () => {
    it('navigates to home when home button clicked', async () => {
      const { user } = renderWithUser(<ErrorPage status={404} />)

      await user.click(screen.getByTestId('error-page-home-btn'))

      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('calls onGoHome if provided instead of default navigation', async () => {
      const onGoHome = jest.fn()
      const { user } = renderWithUser(<ErrorPage status={404} onGoHome={onGoHome} />)

      await user.click(screen.getByTestId('error-page-home-btn'))

      expect(onGoHome).toHaveBeenCalledTimes(1)
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  // 로그인 버튼
  describe('로그인 버튼', () => {
    it('navigates to login when login button clicked on 403 page', async () => {
      const { user } = renderWithUser(<ErrorPage status={403} />)

      await user.click(screen.getByTestId('error-page-login-btn'))

      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('calls onLogin if provided', async () => {
      const onLogin = jest.fn()
      const { user } = renderWithUser(<ErrorPage status={403} onLogin={onLogin} />)

      await user.click(screen.getByTestId('error-page-login-btn'))

      expect(onLogin).toHaveBeenCalledTimes(1)
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  // 이전 버튼
  describe('이전 버튼', () => {
    it('shows back button on 403 page', () => {
      render(<ErrorPage status={403} />)

      expect(screen.getByTestId('error-page-back-btn')).toBeInTheDocument()
    })

    it('navigates back when back button clicked', async () => {
      const { user } = renderWithUser(<ErrorPage status={403} />)

      await user.click(screen.getByTestId('error-page-back-btn'))

      expect(mockBack).toHaveBeenCalled()
    })
  })

  // 커스텀 메시지
  describe('커스텀 메시지', () => {
    it('renders custom title', () => {
      render(<ErrorPage status={500} title="커스텀 제목" />)

      expect(screen.getByTestId('error-page-title')).toHaveTextContent('커스텀 제목')
    })

    it('renders custom subtitle', () => {
      render(<ErrorPage status={500} subTitle="커스텀 설명" />)

      expect(screen.getByTestId('error-page-message')).toHaveTextContent('커스텀 설명')
    })
  })

  // 접근성
  describe('접근성', () => {
    it('has role="alert" for error page', () => {
      render(<ErrorPage status={404} />)

      const container = screen.getByTestId('error-page')
      expect(container).toHaveAttribute('role', 'alert')
    })

    it('has aria-live="assertive" for error announcements', () => {
      render(<ErrorPage status={500} />)

      const container = screen.getByTestId('error-page')
      expect(container).toHaveAttribute('aria-live', 'assertive')
    })
  })
})
