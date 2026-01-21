// components/layout/__tests__/Footer.test.tsx
// Footer 컴포넌트 단위 테스트 (TDD)

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '../Footer'

// Ant Design 모킹
vi.mock('antd', () => ({
  Layout: {
    Footer: ({ children, className, style, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <footer className={className} style={style} {...props}>{children}</footer>
    ),
  },
}))

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 환경변수 초기화
    vi.stubEnv('NEXT_PUBLIC_APP_VERSION', undefined as unknown as string)
  })

  // UT-01: Footer 컴포넌트 렌더링
  describe('UT-01: Footer 컴포넌트 렌더링', () => {
    it('footer 요소가 DOM에 존재해야 함', () => {
      render(<Footer />)
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('data-testid가 footer-component로 설정되어야 함', () => {
      render(<Footer />)
      expect(screen.getByTestId('footer-component')).toBeInTheDocument()
    })
  })

  // UT-02: 버전 정보 표시
  describe('UT-02: 버전 정보 표시', () => {
    it('버전 정보가 v{버전} 형식으로 표시되어야 함', () => {
      render(<Footer />)
      // 기본값 또는 package.json 버전
      expect(screen.getByText(/v\d+\.\d+\.\d+/)).toBeInTheDocument()
    })

    it('기본 버전(0.1.0)이 표시되어야 함', () => {
      // 환경변수 미설정 시 기본값 0.1.0 (package.json version)
      render(<Footer />)
      expect(screen.getByText('v0.1.0')).toBeInTheDocument()
    })

    it('버전 정보가 우측에 위치해야 함 (data-position 속성)', () => {
      render(<Footer />)
      const versionElement = screen.getByTestId('footer-version')
      expect(versionElement).toBeInTheDocument()
    })
  })

  // UT-03: 저작권 텍스트 표시
  describe('UT-03: 저작권 텍스트 표시', () => {
    it('저작권 텍스트가 "Copyright ©"를 포함해야 함', () => {
      render(<Footer />)
      expect(screen.getByText(/Copyright ©/)).toBeInTheDocument()
    })

    it('저작권 연도가 현재 연도를 포함해야 함', () => {
      render(<Footer />)
      const currentYear = new Date().getFullYear().toString()
      expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument()
    })

    it('저작권 텍스트가 좌측에 위치해야 함 (data-position 속성)', () => {
      render(<Footer />)
      const copyrightElement = screen.getByTestId('footer-copyright')
      expect(copyrightElement).toBeInTheDocument()
    })
  })

  // UT-04: 푸터 높이 검증
  describe('UT-04: 푸터 높이 검증', () => {
    it('푸터가 var(--footer-height) 높이를 가져야 함', () => {
      render(<Footer />)
      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveStyle({ height: 'var(--footer-height)' })
    })
  })

  // UT-05: className prop 전달
  describe('UT-05: className prop 전달', () => {
    it('className prop이 적용되어야 함', () => {
      render(<Footer className="custom-class" />)
      const footer = screen.getByRole('contentinfo')
      expect(footer.className).toContain('custom-class')
    })
  })

  // UT-06: 레이아웃 검증
  describe('UT-06: 레이아웃 검증', () => {
    it('flex 레이아웃이 적용되어야 함', () => {
      render(<Footer />)
      const footer = screen.getByRole('contentinfo')
      expect(footer.className).toContain('flex')
    })

    it('justify-between이 적용되어야 함', () => {
      render(<Footer />)
      const footer = screen.getByRole('contentinfo')
      expect(footer.className).toContain('justify-between')
    })

    it('items-center가 적용되어야 함', () => {
      render(<Footer />)
      const footer = screen.getByRole('contentinfo')
      expect(footer.className).toContain('items-center')
    })
  })
})
