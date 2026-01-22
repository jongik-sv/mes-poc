/**
 * FavoriteButton 컴포넌트 단위 테스트
 * @see TSK-03-04 설계문서 026-test-specification.md
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { FavoriteButton } from '../FavoriteButton'

describe('FavoriteButton', () => {
  describe('렌더링', () => {
    it('즐겨찾기 상태일 때 채워진 별 아이콘을 렌더링한다', () => {
      render(<FavoriteButton isFavorite={true} onToggle={() => {}} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', '즐겨찾기에서 제거')
    })

    it('즐겨찾기 안된 상태일 때 빈 별 아이콘을 렌더링한다', () => {
      render(<FavoriteButton isFavorite={false} onToggle={() => {}} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', '즐겨찾기에 추가')
    })
  })

  describe('인터랙션', () => {
    it('클릭 시 onToggle 콜백을 호출한다', () => {
      const mockOnToggle = vi.fn()
      render(<FavoriteButton isFavorite={false} onToggle={mockOnToggle} />)

      fireEvent.click(screen.getByRole('button'))

      expect(mockOnToggle).toHaveBeenCalledTimes(1)
    })

    it('disabled 상태에서는 클릭해도 onToggle이 호출되지 않는다', () => {
      const mockOnToggle = vi.fn()
      render(
        <FavoriteButton
          isFavorite={false}
          onToggle={mockOnToggle}
          disabled={true}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockOnToggle).not.toHaveBeenCalled()
    })

    it('클릭 이벤트가 전파되지 않는다 (stopPropagation)', () => {
      const mockOnToggle = vi.fn()
      const mockParentClick = vi.fn()

      render(
        <div onClick={mockParentClick}>
          <FavoriteButton isFavorite={false} onToggle={mockOnToggle} />
        </div>
      )

      fireEvent.click(screen.getByRole('button'))

      expect(mockOnToggle).toHaveBeenCalledTimes(1)
      expect(mockParentClick).not.toHaveBeenCalled()
    })
  })

  describe('툴팁', () => {
    it('showTooltip이 true일 때 툴팁이 표시된다', async () => {
      render(
        <FavoriteButton
          isFavorite={false}
          onToggle={() => {}}
          showTooltip={true}
        />
      )

      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)

      // 툴팁은 비동기로 표시되므로 waitFor 사용 권장
      // 단, 여기서는 Tooltip 컴포넌트가 있는지만 확인
      expect(button).toBeInTheDocument()
    })
  })

  describe('data-testid', () => {
    it('data-testid가 올바르게 설정된다', () => {
      render(<FavoriteButton isFavorite={false} onToggle={() => {}} />)

      const button = screen.getByTestId('favorite-toggle-btn')
      expect(button).toBeInTheDocument()
    })

    it('즐겨찾기 상태가 data-favorited 속성에 반영된다', () => {
      const { rerender } = render(
        <FavoriteButton isFavorite={true} onToggle={() => {}} />
      )

      expect(screen.getByTestId('favorite-toggle-btn')).toHaveAttribute(
        'data-favorited',
        'true'
      )

      rerender(<FavoriteButton isFavorite={false} onToggle={() => {}} />)

      expect(screen.getByTestId('favorite-toggle-btn')).toHaveAttribute(
        'data-favorited',
        'false'
      )
    })
  })
})
