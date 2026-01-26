import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'
import { AUTH_MESSAGES } from '@/lib/constants/messages'

// next-auth/react signIn mock
const mockSignIn = vi.fn()
vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}))

// next/navigation mock
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}))

// Helper function to render with user event (delay: null로 성능 개선)
function renderWithUser(ui: React.ReactElement) {
  return {
    user: userEvent.setup({ delay: null }),
    ...render(ui),
  }
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignIn.mockReset()
  })

  describe('렌더링', () => {
    it('renders login form with all elements (UT-001)', () => {
      render(<LoginForm />)

      expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /로그인/i })
      ).toBeInTheDocument()
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
    })

    it('displays email input field (UT-002)', async () => {
      const { user } = renderWithUser(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      await user.type(emailInput, 'test@example.com')

      expect(emailInput).toHaveValue('test@example.com')
    })

    it('displays password input with masking (UT-003)', async () => {
      const { user } = renderWithUser(<LoginForm />)

      const passwordInput = screen.getByTestId('password-input')
      await user.type(passwordInput, 'password123')

      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveValue('password123')
    })
  })

  describe('유효성 검사', () => {
    it('shows error for empty email (UT-004)', async () => {
      const { user } = renderWithUser(<LoginForm />)

      // 비밀번호만 입력하고 제출
      const passwordInput = screen.getByTestId('password-input')
      await user.type(passwordInput, 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      await waitFor(() => {
        expect(screen.getByText(AUTH_MESSAGES.REQUIRED_EMAIL)).toBeInTheDocument()
      })
    })

    it('shows error for empty password (UT-005)', async () => {
      const { user } = renderWithUser(<LoginForm />)

      // 이메일만 입력하고 제출
      const emailInput = screen.getByTestId('email-input')
      await user.type(emailInput, 'test@example.com')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      await waitFor(() => {
        expect(
          screen.getByText(AUTH_MESSAGES.REQUIRED_PASSWORD)
        ).toBeInTheDocument()
      })
    })

    it('shows error for invalid email format (UT-006)', async () => {
      const { user } = renderWithUser(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')

      await user.type(emailInput, 'invalid-email')
      await user.type(passwordInput, 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      await waitFor(() => {
        expect(
          screen.getByText(AUTH_MESSAGES.INVALID_EMAIL_FORMAT)
        ).toBeInTheDocument()
      })
    })
  })

  describe('로딩 상태', () => {
    it('shows loading state on submit (UT-007)', async () => {
      // 즉시 resolve되지 않는 Promise로 로딩 상태 테스트
      let resolveSignIn: (value: unknown) => void
      mockSignIn.mockImplementation(
        () => new Promise((resolve) => { resolveSignIn = resolve })
      )

      const { user } = renderWithUser(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')

      await user.type(emailInput, 'admin@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /로그인/i })
        expect(button).toBeDisabled()
      })

      // 정리: Promise resolve
      resolveSignIn!({ ok: true })
    })
  })

  describe('signIn 호출', () => {
    it('calls signIn with correct credentials (UT-008)', async () => {
      mockSignIn.mockResolvedValue({ ok: true, url: '/portal/dashboard' })

      const { user } = renderWithUser(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')

      await user.type(emailInput, 'admin@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'admin@example.com',
          password: 'password123',
          redirect: false,
        })
      })
    })
  })

  describe('에러 처리', () => {
    it('shows error alert on authentication failure (UT-009)', async () => {
      mockSignIn.mockResolvedValue({
        ok: false,
        error: 'CredentialsSignin',
      })

      const { user } = renderWithUser(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')

      await user.type(emailInput, 'wrong@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      await waitFor(() => {
        const alert = screen.getByTestId('error-message')
        expect(alert).toBeInTheDocument()
        expect(alert).toHaveTextContent(AUTH_MESSAGES.AUTH_FAILED)
      })
    })

    it('shows inactive account error (UT-010)', async () => {
      mockSignIn.mockResolvedValue({
        ok: false,
        error: 'AccountInactive',
      })

      const { user } = renderWithUser(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')

      await user.type(emailInput, 'inactive@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      await waitFor(() => {
        const alert = screen.getByTestId('error-message')
        expect(alert).toBeInTheDocument()
        expect(alert).toHaveTextContent(AUTH_MESSAGES.ACCOUNT_INACTIVE)
      })
    })
  })

  describe('키보드 인터랙션', () => {
    it('submits form on Enter key (UT-011)', async () => {
      mockSignIn.mockResolvedValue({ ok: true, url: '/portal/dashboard' })

      const { user } = renderWithUser(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')

      await user.type(emailInput, 'admin@example.com')
      await user.type(passwordInput, 'password123{Enter}')

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })
    })
  })

  describe('비밀번호 표시 토글', () => {
    it('toggles password visibility (UT-012)', async () => {
      const { user } = renderWithUser(<LoginForm />)

      const passwordInput = screen.getByTestId('password-input')
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Ant Design Input.Password는 suffix에 있는 아이콘 클릭
      const toggleButton = screen.getByRole('img', { name: /eye/i })
      await user.click(toggleButton)

      // 클릭 후에는 type이 text로 변경됨
      expect(passwordInput).toHaveAttribute('type', 'text')

      // Ant Design에서는 아이콘이 바뀌므로 다시 찾아야 함
      const toggleButtonAfter = screen.getByRole('img', { name: /eye/i })
      await user.click(toggleButtonAfter)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('리다이렉트', () => {
    it('redirects to dashboard on successful login', async () => {
      mockSignIn.mockResolvedValue({ ok: true })

      const { user } = renderWithUser(<LoginForm />)

      const emailInput = screen.getByTestId('email-input')
      const passwordInput = screen.getByTestId('password-input')

      await user.type(emailInput, 'admin@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  })
})
