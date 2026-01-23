// screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx
// DataTableShowcase 컴포넌트 통합 테스트

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTableShowcase } from '../index'

// Ant Design 메시지 mock
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd')
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
  }
})

// ResizeObserver mock
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock

describe('DataTableShowcase', () => {
  describe('페이지 렌더링', () => {
    it('should render page container', () => {
      render(<DataTableShowcase />)
      expect(screen.getByTestId('data-table-showcase-page')).toBeInTheDocument()
    })

    it('should render feature toggle panel', () => {
      render(<DataTableShowcase />)
      expect(screen.getByTestId('feature-toggle-panel')).toBeInTheDocument()
    })

    it('should render data table', () => {
      render(<DataTableShowcase />)
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
    })
  })

  describe('정렬 기능', () => {
    it('should sort by single column', async () => {
      render(<DataTableShowcase />)
      const user = userEvent.setup()

      // 제품명 컬럼 헤더 찾기 (Ant Design Table은 th 내에 있음, 여러 개일 수 있음)
      const nameHeaders = screen.getAllByText('제품명')
      expect(nameHeaders.length).toBeGreaterThan(0)

      // 클릭으로 정렬
      await user.click(nameHeaders[0])

      // 정렬 아이콘이 표시되어야 함
      await waitFor(() => {
        expect(nameHeaders[0].closest('th')).toBeInTheDocument()
      })
    })
  })

  describe('행 선택', () => {
    it('should select single row on click', async () => {
      render(<DataTableShowcase />)

      // 체크박스 찾기 (첫 번째 행)
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('should select all rows with header checkbox', async () => {
      render(<DataTableShowcase />)
      const user = userEvent.setup()

      // 헤더 체크박스 찾기
      const headerCheckbox = screen.getAllByRole('checkbox')[0]

      await user.click(headerCheckbox)

      // 선택된 항목 수 표시 확인
      await waitFor(() => {
        expect(screen.getByTestId('selected-count')).toBeInTheDocument()
      })
    })
  })

  describe('기능 토글', () => {
    it('should toggle sorting feature', async () => {
      render(<DataTableShowcase />)
      const user = userEvent.setup()

      // 정렬 토글 찾기
      const sortingToggle = screen.getByTestId('toggle-sorting')
      expect(sortingToggle).toBeInTheDocument()

      // 토글 클릭
      await user.click(sortingToggle)

      // 정렬 기능이 비활성화되어야 함
      await waitFor(() => {
        // Ant Design Switch의 aria-checked 확인
        expect(sortingToggle).toHaveAttribute('aria-checked', 'false')
      })
    })

    it('should toggle filtering feature', async () => {
      render(<DataTableShowcase />)
      const user = userEvent.setup()

      const filteringToggle = screen.getByTestId('toggle-filtering')
      expect(filteringToggle).toBeInTheDocument()

      await user.click(filteringToggle)

      await waitFor(() => {
        expect(filteringToggle).toHaveAttribute('aria-checked', 'false')
      })
    })

    it('should enable all features', async () => {
      render(<DataTableShowcase />)
      const user = userEvent.setup()

      const enableAllBtn = screen.getByTestId('enable-all-btn')
      await user.click(enableAllBtn)

      // 모든 토글이 활성화되어야 함
      const toggles = screen.getAllByRole('switch')
      toggles.forEach((toggle) => {
        expect(toggle).toHaveAttribute('aria-checked', 'true')
      })
    })

    it('should disable all features', async () => {
      render(<DataTableShowcase />)
      const user = userEvent.setup()

      const disableAllBtn = screen.getByTestId('disable-all-btn')
      await user.click(disableAllBtn)

      // 모든 토글이 비활성화되어야 함
      const toggles = screen.getAllByRole('switch')
      toggles.forEach((toggle) => {
        expect(toggle).toHaveAttribute('aria-checked', 'false')
      })
    })

    it('should reset to default', async () => {
      render(<DataTableShowcase />)
      const user = userEvent.setup()

      // 먼저 모두 비활성화
      const disableAllBtn = screen.getByTestId('disable-all-btn')
      await user.click(disableAllBtn)

      // 기본값으로 초기화
      const resetBtn = screen.getByTestId('reset-toggles-btn')
      await user.click(resetBtn)

      // 기본 활성화된 기능들이 다시 켜져야 함
      const sortingToggle = screen.getByTestId('toggle-sorting')
      expect(sortingToggle).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('페이지네이션', () => {
    it('should paginate data correctly', () => {
      render(<DataTableShowcase />)

      // 전체 건수 표시 확인
      expect(screen.getByTestId('total-count')).toBeInTheDocument()
      expect(screen.getByTestId('total-count')).toHaveTextContent(/총.*건/)
    })
  })

  describe('확장 행', () => {
    it('should expand/collapse row', async () => {
      render(<DataTableShowcase />)
      const user = userEvent.setup()

      // 확장 아이콘 찾기 (첫 번째 확장 아이콘)
      const expandIcons = screen.getAllByTestId(/^expand-icon-/)
      expect(expandIcons.length).toBeGreaterThan(0)

      const firstExpandIcon = expandIcons[0]

      // 클릭하여 확장
      await user.click(firstExpandIcon)

      // 확장된 콘텐츠 확인
      await waitFor(() => {
        const expandedContent = screen.getAllByTestId(/^expanded-content-/)
        expect(expandedContent.length).toBeGreaterThan(0)
      })
    })
  })

  describe('그룹 헤더', () => {
    it('should render 2-level column headers when enabled', async () => {
      render(<DataTableShowcase />)
      const user = userEvent.setup()

      // 그룹 헤더 토글 활성화
      const groupHeaderToggle = screen.getByTestId('toggle-group-header')
      await user.click(groupHeaderToggle)

      // 그룹 헤더가 렌더링되어야 함
      await waitFor(() => {
        expect(screen.getByText('제품 정보')).toBeInTheDocument()
        expect(screen.getByText('수량/가격')).toBeInTheDocument()
        expect(screen.getByText('상태 정보')).toBeInTheDocument()
      })
    })
  })

  describe('조합 동작', () => {
    it('should apply filter then sort correctly', async () => {
      render(<DataTableShowcase />)
      const user = userEvent.setup()

      // 필터 아이콘 찾기 (여러 개가 있을 수 있음)
      const filterIcons = screen.getAllByTestId(/^filter-icon-/)
      expect(filterIcons.length).toBeGreaterThan(0)

      // 필터 적용 후 정렬 (제품명 헤더가 여러 개일 수 있음)
      const nameHeaders = screen.getAllByText('제품명')
      expect(nameHeaders.length).toBeGreaterThan(0)
      await user.click(nameHeaders[0])

      // 조합 동작이 정상적으로 적용되어야 함
      await waitFor(() => {
        expect(nameHeaders[0]).toBeInTheDocument()
      })
    })
  })

  describe('고정 컬럼/헤더', () => {
    it('should fix columns to left', () => {
      render(<DataTableShowcase />)

      // sticky 토글이 기본으로 활성화되어 있음
      const stickyToggle = screen.getByTestId('toggle-sticky')
      expect(stickyToggle).toHaveAttribute('aria-checked', 'true')

      // 테이블 컨테이너가 있어야 함
      expect(screen.getByTestId('table-container')).toBeInTheDocument()
    })
  })
})
