// components/common/__tests__/ComponentSkeleton.test.tsx
// ComponentSkeleton 컴포넌트 단위 테스트 (TSK-05-01)

import { render, screen } from '@testing-library/react'
import { ComponentSkeleton } from '../ComponentSkeleton'

// Ant Design 모킹
vi.mock('antd', () => ({
  Skeleton: {
    Input: ({ active, style, size, ...props }: any) => (
      <div
        data-testid="skeleton-input"
        data-active={String(active)}
        data-size={size}
        style={style}
        {...props}
      />
    ),
    Avatar: ({ active, size, shape, ...props }: any) => (
      <div
        data-testid="skeleton-avatar"
        data-active={String(active)}
        data-size={size}
        data-shape={shape}
        {...props}
      />
    ),
    Button: ({ active, size, shape, ...props }: any) => (
      <div
        data-testid="skeleton-button"
        data-active={String(active)}
        data-size={size}
        data-shape={shape}
        {...props}
      />
    ),
  },
}))

describe('ComponentSkeleton', () => {
  // UT-006: ComponentSkeleton 스켈레톤 렌더링
  describe('UT-006: 스켈레톤 렌더링', () => {
    it('renders Skeleton component', () => {
      render(<ComponentSkeleton />)

      expect(screen.getByTestId('component-skeleton')).toBeInTheDocument()
    })

    it('renders with active animation by default', () => {
      render(<ComponentSkeleton />)

      const skeletonInputs = screen.getAllByTestId('skeleton-input')
      expect(skeletonInputs.length).toBeGreaterThan(0)
      expect(skeletonInputs[0]).toHaveAttribute('data-active', 'true')
    })
  })

  // UT-007: 테이블 스켈레톤
  describe('UT-007: 테이블 스켈레톤', () => {
    it('renders table skeleton variant', () => {
      render(<ComponentSkeleton variant="table" rows={5} />)

      const skeletonRows = screen.getAllByTestId('skeleton-row')
      expect(skeletonRows).toHaveLength(5)
    })

    it('renders correct number of columns in table variant', () => {
      render(<ComponentSkeleton variant="table" rows={3} columns={4} />)

      const skeletonRows = screen.getAllByTestId('skeleton-row')
      expect(skeletonRows).toHaveLength(3)
    })

    it('renders table header skeleton', () => {
      render(<ComponentSkeleton variant="table" rows={3} showHeader />)

      expect(screen.getByTestId('skeleton-header')).toBeInTheDocument()
    })
  })

  // UT-008: 카드 스켈레톤
  describe('UT-008: 카드 스켈레톤', () => {
    it('renders card skeleton variant', () => {
      render(<ComponentSkeleton variant="card" />)

      const container = screen.getByTestId('component-skeleton')
      expect(container).toHaveClass('card')
    })

    it('renders card with avatar when hasAvatar is true', () => {
      render(<ComponentSkeleton variant="card" hasAvatar />)

      expect(screen.getByTestId('skeleton-avatar')).toBeInTheDocument()
    })

    it('renders multiple cards when count is provided', () => {
      render(<ComponentSkeleton variant="card" count={3} />)

      const cards = screen.getAllByTestId('skeleton-card')
      expect(cards).toHaveLength(3)
    })
  })

  // 폼 스켈레톤
  describe('폼 스켈레톤', () => {
    it('renders form skeleton variant', () => {
      render(<ComponentSkeleton variant="form" />)

      const container = screen.getByTestId('component-skeleton')
      expect(container).toHaveClass('form')
    })

    it('renders correct number of form fields', () => {
      render(<ComponentSkeleton variant="form" fields={4} />)

      const formFields = screen.getAllByTestId('skeleton-field')
      expect(formFields).toHaveLength(4)
    })
  })

  // 리스트 스켈레톤
  describe('리스트 스켈레톤', () => {
    it('renders list skeleton variant', () => {
      render(<ComponentSkeleton variant="list" rows={5} />)

      const listItems = screen.getAllByTestId('skeleton-list-item')
      expect(listItems).toHaveLength(5)
    })
  })

  // 접근성 테스트
  describe('접근성', () => {
    it('has aria-hidden="true" since skeleton is decorative', () => {
      render(<ComponentSkeleton />)

      const container = screen.getByTestId('component-skeleton')
      expect(container).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
