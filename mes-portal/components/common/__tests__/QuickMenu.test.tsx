/**
 * QuickMenu 컴포넌트 단위 테스트
 * @see TSK-03-04 설계문서 026-test-specification.md
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QuickMenu } from '../QuickMenu'
import type { FavoriteMenuItem } from '@/lib/types/favorites'

// 테스트용 즐겨찾기 메뉴 데이터
const mockFavoriteMenus: FavoriteMenuItem[] = [
  {
    id: 101,
    code: 'DASHBOARD',
    name: '대시보드',
    path: '/portal/dashboard',
    icon: 'DashboardOutlined',
  },
  {
    id: 201,
    code: 'WORK_ORDER',
    name: '작업지시조회',
    path: '/portal/production/work-order',
    icon: 'FileTextOutlined',
  },
  {
    id: 301,
    code: 'QUALITY_CHECK',
    name: '품질검사',
    path: '/portal/quality/check',
    icon: 'CheckCircleOutlined',
  },
]

describe('QuickMenu', () => {
  describe('렌더링', () => {
    it('빠른 메뉴 버튼을 렌더링한다', () => {
      render(<QuickMenu favoriteMenus={[]} onMenuClick={() => {}} />)

      const button = screen.getByTestId('quick-menu-btn')
      expect(button).toBeInTheDocument()
    })

    it('빈 상태에서 버튼에 빈 텍스트가 표시된다', () => {
      render(<QuickMenu favoriteMenus={[]} onMenuClick={() => {}} />)

      const button = screen.getByTestId('quick-menu-btn')
      expect(button).toBeInTheDocument()
    })
  })

  describe('드롭다운', () => {
    it('버튼 클릭 시 드롭다운이 열린다', async () => {
      render(
        <QuickMenu favoriteMenus={mockFavoriteMenus} onMenuClick={() => {}} />
      )

      fireEvent.click(screen.getByTestId('quick-menu-btn'))

      // Ant Design Dropdown은 portal로 렌더링되므로 document.body에서 찾아야 함
      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument()
      })
    })

    it('즐겨찾기 메뉴 목록이 표시된다', async () => {
      render(
        <QuickMenu favoriteMenus={mockFavoriteMenus} onMenuClick={() => {}} />
      )

      fireEvent.click(screen.getByTestId('quick-menu-btn'))

      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument()
        expect(screen.getByText('작업지시조회')).toBeInTheDocument()
        expect(screen.getByText('품질검사')).toBeInTheDocument()
      })
    })

    it('메뉴 클릭 시 onMenuClick 콜백이 호출된다', async () => {
      const mockOnMenuClick = vi.fn()
      render(
        <QuickMenu
          favoriteMenus={mockFavoriteMenus}
          onMenuClick={mockOnMenuClick}
        />
      )

      fireEvent.click(screen.getByTestId('quick-menu-btn'))

      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('대시보드'))

      expect(mockOnMenuClick).toHaveBeenCalledWith(mockFavoriteMenus[0])
    })
  })

  describe('빈 상태', () => {
    it('즐겨찾기가 없을 때 빈 상태 메시지가 표시된다', async () => {
      render(<QuickMenu favoriteMenus={[]} onMenuClick={() => {}} />)

      fireEvent.click(screen.getByTestId('quick-menu-btn'))

      await waitFor(() => {
        expect(
          screen.getByText('즐겨찾기한 메뉴가 없습니다')
        ).toBeInTheDocument()
      })
    })

    it('빈 상태에서 힌트 메시지가 표시된다', async () => {
      render(<QuickMenu favoriteMenus={[]} onMenuClick={() => {}} />)

      fireEvent.click(screen.getByTestId('quick-menu-btn'))

      await waitFor(() => {
        expect(
          screen.getByText(/사이드바 메뉴에서 별을 클릭하여 추가/)
        ).toBeInTheDocument()
      })
    })
  })

  describe('로딩 상태', () => {
    it('isLoading이 true일 때 로딩 스피너가 표시된다', () => {
      render(
        <QuickMenu
          favoriteMenus={[]}
          onMenuClick={() => {}}
          isLoading={true}
        />
      )

      const button = screen.getByTestId('quick-menu-btn')
      // Ant Design Button의 loading 상태 확인
      expect(button).toHaveClass('ant-btn-loading')
    })
  })
})
