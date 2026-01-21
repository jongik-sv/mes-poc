// components/common/__tests__/GlobalSearch.test.tsx
// TSK-01-05: 전역 검색 모달 단위 테스트

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GlobalSearch, filterMenus, type SearchableMenuItem } from '../GlobalSearch'
import { ConfigProvider } from 'antd'

// 테스트용 메뉴 데이터
const mockMenus: SearchableMenuItem[] = [
  {
    id: '1',
    code: 'DASHBOARD',
    name: '대시보드',
    path: '/dashboard',
    icon: 'DashboardOutlined',
    sortOrder: 1,
    children: [],
  },
  {
    id: '2',
    code: 'PRODUCTION',
    name: '생산',
    icon: 'BuildOutlined',
    sortOrder: 2,
    children: [
      {
        id: '2-1',
        code: 'WORK_ORDER',
        name: '작업 지시',
        path: '/production/work-order',
        icon: 'FileTextOutlined',
        sortOrder: 1,
        children: [],
      },
      {
        id: '2-2',
        code: 'PRODUCTION_STATUS',
        name: '생산 현황',
        path: '/production/status',
        icon: 'LineChartOutlined',
        sortOrder: 2,
        children: [],
      },
    ],
  },
  {
    id: '3',
    code: 'SETTINGS',
    name: '설정',
    icon: 'SettingOutlined',
    sortOrder: 3,
    children: [
      {
        id: '3-1',
        code: 'USER',
        name: '사용자',
        icon: 'UserOutlined',
        sortOrder: 1,
        children: [
          {
            id: '3-1-1',
            code: 'USER_LIST',
            name: '사용자 관리',
            path: '/settings/user/list',
            icon: 'TeamOutlined',
            sortOrder: 1,
            children: [],
          },
        ],
      },
    ],
  },
]

// ConfigProvider 래퍼
const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <ConfigProvider>
      {ui}
    </ConfigProvider>
  )
}

describe('GlobalSearch', () => {
  // UT-001: 모달 렌더링
  describe('UT-001: 모달 렌더링', () => {
    it('isOpen이 true일 때 모달이 표시된다', () => {
      renderWithProvider(
        <GlobalSearch
          isOpen={true}
          onClose={vi.fn()}
          menus={mockMenus}
          onSelect={vi.fn()}
        />
      )

      expect(screen.getByTestId('global-search-modal')).toBeInTheDocument()
    })

    it('isOpen이 false일 때 모달이 표시되지 않는다', () => {
      renderWithProvider(
        <GlobalSearch
          isOpen={false}
          onClose={vi.fn()}
          menus={mockMenus}
          onSelect={vi.fn()}
        />
      )

      expect(screen.queryByTestId('global-search-modal')).not.toBeInTheDocument()
    })
  })

  // UT-003: 검색어 입력
  describe('UT-003: 검색어 입력', () => {
    it('검색어 입력 시 실시간 필터링된다', async () => {
      const user = userEvent.setup()
      renderWithProvider(
        <GlobalSearch
          isOpen={true}
          onClose={vi.fn()}
          menus={mockMenus}
          onSelect={vi.fn()}
        />
      )

      const input = screen.getByTestId('global-search-input')
      await user.type(input, '대시')

      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument()
      })
    })

    it('일치하지 않는 메뉴는 결과에서 제외된다', async () => {
      const user = userEvent.setup()
      renderWithProvider(
        <GlobalSearch
          isOpen={true}
          onClose={vi.fn()}
          menus={mockMenus}
          onSelect={vi.fn()}
        />
      )

      const input = screen.getByTestId('global-search-input')
      await user.type(input, '대시')

      await waitFor(() => {
        expect(screen.queryByText('작업 지시')).not.toBeInTheDocument()
      })
    })
  })

  // UT-004: 결과 리스트 표시
  describe('UT-004: 결과 리스트 표시', () => {
    it('검색 결과에 아이콘, 이름, 경로가 표시된다', async () => {
      const user = userEvent.setup()
      renderWithProvider(
        <GlobalSearch
          isOpen={true}
          onClose={vi.fn()}
          menus={mockMenus}
          onSelect={vi.fn()}
        />
      )

      const input = screen.getByTestId('global-search-input')
      await user.type(input, '작업 지시')

      await waitFor(() => {
        // 결과 아이템 확인
        const resultItem = screen.getByTestId('search-result-item-2-1')
        expect(resultItem).toBeInTheDocument()
        // 메뉴명 확인 (하이라이트된 텍스트)
        expect(resultItem).toHaveTextContent('작업 지시')
        // breadcrumb 확인
        expect(resultItem).toHaveTextContent('생산')
      })
    })

    it('검색 결과가 없으면 안내 메시지를 표시한다', async () => {
      const user = userEvent.setup()
      renderWithProvider(
        <GlobalSearch
          isOpen={true}
          onClose={vi.fn()}
          menus={mockMenus}
          onSelect={vi.fn()}
        />
      )

      const input = screen.getByTestId('global-search-input')
      await user.type(input, '존재하지않는메뉴')

      await waitFor(() => {
        expect(screen.getByTestId('search-no-results')).toBeInTheDocument()
      })
    })
  })

  // UT-005: 화살표 키 네비게이션
  describe('UT-005: 화살표 키 네비게이션', () => {
    it('ArrowDown 키로 다음 항목을 선택한다', async () => {
      const user = userEvent.setup()
      renderWithProvider(
        <GlobalSearch
          isOpen={true}
          onClose={vi.fn()}
          menus={mockMenus}
          onSelect={vi.fn()}
        />
      )

      const input = screen.getByTestId('global-search-input')
      await user.type(input, '생산')

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument()
      })

      // 화살표 아래 키 입력
      await user.keyboard('{ArrowDown}')

      await waitFor(() => {
        const selectedItem = screen.getByTestId('search-result-item-2-2')
        expect(selectedItem).toHaveClass('selected')
      })
    })

    it('ArrowUp 키로 이전 항목을 선택한다', async () => {
      const user = userEvent.setup()
      // 여러 결과가 나오는 테스트용 메뉴 데이터
      const multiResultMenus: SearchableMenuItem[] = [
        {
          id: '1',
          code: 'TEST1',
          name: '테스트 메뉴 1',
          path: '/test1',
          sortOrder: 1,
          children: [],
        },
        {
          id: '2',
          code: 'TEST2',
          name: '테스트 메뉴 2',
          path: '/test2',
          sortOrder: 2,
          children: [],
        },
        {
          id: '3',
          code: 'TEST3',
          name: '테스트 메뉴 3',
          path: '/test3',
          sortOrder: 3,
          children: [],
        },
      ]

      renderWithProvider(
        <GlobalSearch
          isOpen={true}
          onClose={vi.fn()}
          menus={multiResultMenus}
          onSelect={vi.fn()}
        />
      )

      const input = screen.getByTestId('global-search-input')
      await user.type(input, '테스트')

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument()
      })

      // 아래로 두 번 이동 후 위로 한 번 이동
      // "테스트" 검색 결과: 테스트 메뉴 1(인덱스0), 테스트 메뉴 2(1), 테스트 메뉴 3(2)
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowUp}')

      // 인덱스 1이 선택됨 (테스트 메뉴 2)
      await waitFor(() => {
        const selectedItem = screen.getByTestId('search-result-item-2')
        expect(selectedItem).toHaveClass('selected')
      })
    })
  })

  // UT-006: Enter로 선택
  describe('UT-006: Enter로 선택', () => {
    it('Enter 키로 선택된 항목을 열고 onSelect가 호출된다', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()

      renderWithProvider(
        <GlobalSearch
          isOpen={true}
          onClose={vi.fn()}
          menus={mockMenus}
          onSelect={onSelect}
        />
      )

      const input = screen.getByTestId('global-search-input')
      await user.type(input, '대시')

      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument()
      })

      await user.keyboard('{Enter}')

      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          name: '대시보드',
          path: '/dashboard',
        })
      )
    })

    it('클릭으로 항목을 선택할 수 있다', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()

      renderWithProvider(
        <GlobalSearch
          isOpen={true}
          onClose={vi.fn()}
          menus={mockMenus}
          onSelect={onSelect}
        />
      )

      const input = screen.getByTestId('global-search-input')
      await user.type(input, '대시')

      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument()
      })

      const resultItem = screen.getByTestId('search-result-item-1')
      await user.click(resultItem)

      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          name: '대시보드',
        })
      )
    })
  })

  // UT-007: Escape로 닫기
  describe('UT-007: Escape로 닫기', () => {
    it('Escape 키를 누르면 onClose가 호출된다', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      renderWithProvider(
        <GlobalSearch
          isOpen={true}
          onClose={onClose}
          menus={mockMenus}
          onSelect={vi.fn()}
        />
      )

      const input = screen.getByTestId('global-search-input')
      await user.click(input)
      await user.keyboard('{Escape}')

      expect(onClose).toHaveBeenCalled()
    })
  })

  // UT-009: 폴더 메뉴 선택 불가
  describe('UT-009: 폴더 메뉴 선택 불가', () => {
    it('path가 없는 폴더 메뉴는 선택해도 onSelect가 호출되지 않는다', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()

      // 폴더 메뉴만 포함한 검색 결과
      const menusWithFolder: SearchableMenuItem[] = [
        {
          id: '2',
          code: 'PRODUCTION',
          name: '생산',
          icon: 'BuildOutlined',
          sortOrder: 2,
          children: [],
        },
      ]

      renderWithProvider(
        <GlobalSearch
          isOpen={true}
          onClose={vi.fn()}
          menus={menusWithFolder}
          onSelect={onSelect}
        />
      )

      const input = screen.getByTestId('global-search-input')
      await user.type(input, '생산')

      await waitFor(() => {
        const resultItem = screen.getByTestId('search-result-item-2')
        expect(resultItem).toBeInTheDocument()
      })

      // 폴더 메뉴 클릭
      const folderItem = screen.getByTestId('search-result-item-2')
      await user.click(folderItem)

      expect(onSelect).not.toHaveBeenCalled()
    })
  })
})

// filterMenus 함수 테스트 (UT-008)
describe('filterMenus', () => {
  describe('UT-008: 검색 로직 (대소문자, 부분 일치)', () => {
    it('대소문자 구분 없이 검색한다', () => {
      const englishMenus: SearchableMenuItem[] = [
        {
          id: '1',
          code: 'DASHBOARD',
          name: 'Dashboard',
          path: '/dashboard',
          sortOrder: 1,
          children: [],
        },
      ]

      const results = filterMenus(englishMenus, 'dash')
      expect(results.length).toBe(1)
      expect(results[0].menu.name).toBe('Dashboard')
    })

    it('부분 일치로 검색한다', () => {
      const results = filterMenus(mockMenus, '대시')
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.some(r => r.menu.name.includes('대시'))).toBe(true)
    })

    it('검색어와 일치하는 메뉴만 반환한다', () => {
      const results = filterMenus(mockMenus, '작업')
      expect(results.length).toBe(1)
      expect(results[0].menu.name).toBe('작업 지시')
    })

    it('중첩된 메뉴도 검색한다', () => {
      const results = filterMenus(mockMenus, '사용자 관리')
      expect(results.length).toBe(1)
      expect(results[0].menu.path).toBe('/settings/user/list')
    })

    it('빈 검색어는 빈 배열을 반환한다', () => {
      const results = filterMenus(mockMenus, '')
      expect(results).toEqual([])
    })

    it('breadcrumb 경로를 올바르게 생성한다', () => {
      const results = filterMenus(mockMenus, '사용자 관리')
      expect(results[0].breadcrumb).toBe('설정 > 사용자 > 사용자 관리')
    })
  })
})
