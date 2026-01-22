import { render, screen } from '@testing-library/react'
import { LoginPageClient } from '../LoginPageClient'

// Mock 함수 선언
const mockPush = vi.fn()
const mockAuth = vi.fn()

// next-auth mock
vi.mock('next-auth', () => ({
  default: vi.fn(),
}))

// next-auth/react mock
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}))

// next/navigation mock
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}))

// auth mock (세션 확인용)
vi.mock('@/auth', () => ({
  auth: () => mockAuth(),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockReset()
  })

  describe('렌더링', () => {
    it('renders login page with all elements', async () => {
      // 세션 없음 상태
      mockAuth.mockResolvedValue(null)

      render(<LoginPageClient />)

      expect(screen.getByTestId('login-page')).toBeInTheDocument()
      expect(screen.getByTestId('login-card')).toBeInTheDocument()
      expect(screen.getByTestId('login-footer')).toBeInTheDocument()
    })

    it('renders MES Portal logo/title', async () => {
      mockAuth.mockResolvedValue(null)

      render(<LoginPageClient />)

      expect(screen.getByText('MES Portal')).toBeInTheDocument()
    })

    it('renders footer with copyright info', async () => {
      mockAuth.mockResolvedValue(null)

      render(<LoginPageClient />)

      expect(screen.getByTestId('login-footer')).toHaveTextContent('2026')
      expect(screen.getByTestId('login-footer')).toHaveTextContent('MES Portal')
    })
  })

  describe('레이아웃', () => {
    it('centers login card on page', async () => {
      mockAuth.mockResolvedValue(null)

      render(<LoginPageClient />)

      const page = screen.getByTestId('login-page')
      expect(page).toHaveClass('min-h-screen')
      expect(page).toHaveClass('flex')
      expect(page).toHaveClass('items-center')
      expect(page).toHaveClass('justify-center')
    })
  })
})
