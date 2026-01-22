// components/common/__tests__/KeyBadge.test.tsx
// TSK-05-06: KeyBadge 컴포넌트 단위 테스트
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KeyBadge } from '../KeyBadge'

// isMacPlatform mock
vi.mock('@/lib/hooks/useGlobalHotkeys', () => ({
  isMacPlatform: vi.fn(() => false),
}))

describe('KeyBadge', () => {
  describe('UT-0506-008: 키 조합 표시', () => {
    it('단일 키를 표시한다', () => {
      render(<KeyBadge keys={['K']} />)

      expect(screen.getByText('K')).toBeInTheDocument()
    })

    it('여러 키를 + 구분자로 표시한다', () => {
      render(<KeyBadge keys={['Ctrl', 'K']} />)

      expect(screen.getByText('Ctrl')).toBeInTheDocument()
      expect(screen.getByText('K')).toBeInTheDocument()
      expect(screen.getByText('+')).toBeInTheDocument()
    })

    it('커스텀 구분자를 사용할 수 있다', () => {
      render(<KeyBadge keys={['Ctrl', 'K']} separator="+" />)

      expect(screen.getByText('+')).toBeInTheDocument()
    })

    it('세 개 이상의 키 조합을 표시한다', () => {
      render(<KeyBadge keys={['Ctrl', 'Shift', 'Tab']} />)

      expect(screen.getByText('Ctrl')).toBeInTheDocument()
      expect(screen.getByText('Shift')).toBeInTheDocument()
      expect(screen.getByText('Tab')).toBeInTheDocument()
    })
  })

  describe('플랫폼별 modifier 키 표시', () => {
    it('Windows에서 Ctrl을 Ctrl로 표시한다', () => {
      render(<KeyBadge keys={['Ctrl', 'K']} platform="windows" />)

      expect(screen.getByText('Ctrl')).toBeInTheDocument()
    })

    it('Mac에서 Ctrl을 Command 기호로 표시한다', () => {
      render(<KeyBadge keys={['Ctrl', 'K']} platform="mac" />)

      expect(screen.getByText('⌘')).toBeInTheDocument()
    })

    it('Mac에서 Alt를 Option 기호로 표시한다', () => {
      render(<KeyBadge keys={['Alt', 'K']} platform="mac" />)

      expect(screen.getByText('⌥')).toBeInTheDocument()
    })

    it('Mac에서 Shift를 화살표 기호로 표시한다', () => {
      render(<KeyBadge keys={['Shift', 'Tab']} platform="mac" />)

      expect(screen.getByText('⇧')).toBeInTheDocument()
    })
  })

  describe('크기 옵션', () => {
    it('small 크기가 적용된다', () => {
      const { container } = render(<KeyBadge keys={['K']} size="small" />)

      const kbd = container.querySelector('kbd')
      expect(kbd?.className).toContain('min-w-[20px]')
    })

    it('default 크기가 기본값이다', () => {
      const { container } = render(<KeyBadge keys={['K']} />)

      const kbd = container.querySelector('kbd')
      expect(kbd?.className).toContain('min-w-[24px]')
    })

    it('large 크기가 적용된다', () => {
      const { container } = render(<KeyBadge keys={['K']} size="large" />)

      const kbd = container.querySelector('kbd')
      expect(kbd?.className).toContain('min-w-[28px]')
    })
  })

  describe('접근성', () => {
    it('aria-label에 키 설명이 포함된다', () => {
      const { container } = render(<KeyBadge keys={['Ctrl', 'K']} />)

      const wrapper = container.querySelector('.key-badge')
      expect(wrapper).toHaveAttribute('aria-label', 'Ctrl + K 키를 함께 누르세요')
    })

    it('role="img" 속성이 있다', () => {
      const { container } = render(<KeyBadge keys={['K']} />)

      const wrapper = container.querySelector('.key-badge')
      expect(wrapper).toHaveAttribute('role', 'img')
    })
  })
})
