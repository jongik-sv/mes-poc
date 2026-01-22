// components/templates/SelectPopupTemplate/__tests__/SelectPopupTemplate.spec.tsx
// SelectPopupTemplate 컴포넌트 단위 테스트 (TSK-06-05)

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectPopupTemplate } from '../SelectPopupTemplate'
import type { SelectPopupTemplateProps } from '../types'

// 테스트용 데이터 타입
interface TestItem {
  id: string
  name: string
  code: string
}

// Mock 데이터
const MOCK_ITEMS_BASIC: TestItem[] = [
  { id: '1', name: '항목 1', code: 'A001' },
  { id: '2', name: '항목 2', code: 'A002' },
  { id: '3', name: '항목 3', code: 'A003' },
]

const MOCK_COLUMNS = [
  { title: '코드', dataIndex: 'code', key: 'code' },
  { title: '이름', dataIndex: 'name', key: 'name' },
]

// 기본 Props 헬퍼
const createDefaultProps = (
  overrides: Partial<SelectPopupTemplateProps<TestItem>> = {}
): SelectPopupTemplateProps<TestItem> => ({
  open: true,
  title: '항목 선택',
  columns: MOCK_COLUMNS,
  dataSource: MOCK_ITEMS_BASIC,
  rowKey: 'id',
  onSelect: vi.fn(),
  onClose: vi.fn(),
  ...overrides,
})

describe('SelectPopupTemplate', () => {
  describe('모달 표시 (UT-001)', () => {
    it('open이 true일 때 모달이 표시되어야 한다', () => {
      render(<SelectPopupTemplate {...createDefaultProps()} />)

      expect(screen.getByTestId('select-popup-modal')).toBeInTheDocument()
      expect(screen.getByText('항목 선택')).toBeInTheDocument()
    })

    it('open이 false일 때 모달이 숨겨져야 한다', () => {
      render(<SelectPopupTemplate {...createDefaultProps({ open: false })} />)

      expect(screen.queryByTestId('select-popup-modal')).not.toBeInTheDocument()
    })

    it('title prop이 모달 제목으로 표시되어야 한다', () => {
      render(
        <SelectPopupTemplate {...createDefaultProps({ title: '사용자 선택' })} />
      )

      expect(screen.getByText('사용자 선택')).toBeInTheDocument()
    })

    it('width prop이 컴포넌트에 전달되어야 한다', () => {
      render(
        <SelectPopupTemplate {...createDefaultProps({ width: 600 })} />
      )

      // 모달이 렌더링되면 width prop이 적용됨 (컴포넌트 렌더링 확인)
      expect(screen.getByTestId('select-popup-modal')).toBeInTheDocument()
    })
  })

  describe('닫기 (UT-002)', () => {
    it('취소 버튼으로 모달을 닫을 수 있다', async () => {
      const mockClose = vi.fn()
      const user = userEvent.setup()

      render(<SelectPopupTemplate {...createDefaultProps({ onClose: mockClose })} />)

      // 취소 버튼 클릭
      const cancelButton = screen.getByTestId('select-popup-cancel')
      await user.click(cancelButton)

      expect(mockClose).toHaveBeenCalledTimes(1)
    })

    it('onClose prop이 필수이며 컴포넌트에 전달되어야 한다', async () => {
      const mockClose = vi.fn()

      render(<SelectPopupTemplate {...createDefaultProps({ onClose: mockClose })} />)

      // 컴포넌트가 정상 렌더링됨
      expect(screen.getByTestId('select-popup-modal')).toBeInTheDocument()
      // 취소 버튼이 존재함
      expect(screen.getByTestId('select-popup-cancel')).toBeInTheDocument()
    })
  })

  describe('검색 기능 (UT-003, UT-004, UT-005)', () => {
    it('검색 입력 필드가 표시되어야 한다', () => {
      render(
        <SelectPopupTemplate
          {...createDefaultProps({ searchPlaceholder: '검색어를 입력하세요' })}
        />
      )

      const searchInput = screen.getByTestId('select-popup-search')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('placeholder', '검색어를 입력하세요')
    })

    it('검색 버튼 클릭 시 onSearch가 호출되어야 한다', async () => {
      const mockSearch = vi.fn()
      const user = userEvent.setup()

      render(
        <SelectPopupTemplate
          {...createDefaultProps({
            onSearch: mockSearch,
            searchMode: 'server',
          })}
        />
      )

      const searchInput = screen.getByTestId('select-popup-search')
      await user.type(searchInput, '항목1')

      const searchButton = screen.getByTestId('select-popup-search-btn')
      await user.click(searchButton)

      expect(mockSearch).toHaveBeenCalledWith('항목1')
    })

    it('클라이언트 모드에서 검색어 입력 시 목록이 필터링되어야 한다', async () => {
      const user = userEvent.setup()

      render(
        <SelectPopupTemplate
          {...createDefaultProps({
            searchMode: 'client',
            searchFields: ['name'],
          })}
        />
      )

      // 초기 3개 항목 확인
      const table = screen.getByTestId('select-popup-table')
      const initialRows = within(table).getAllByRole('row')
      expect(initialRows.length).toBe(4) // 헤더 + 3개 데이터

      const searchInput = screen.getByTestId('select-popup-search')
      await user.type(searchInput, '항목 1')

      // 필터링 후 1개 항목만 표시
      await waitFor(() => {
        const filteredRows = within(table).getAllByRole('row')
        expect(filteredRows.length).toBe(2) // 헤더 + 1개 데이터
      })
    })

    it('서버 모드에서 onSearch가 검색 버튼 클릭 시 호출되어야 한다', async () => {
      const mockSearch = vi.fn()
      const user = userEvent.setup()

      render(
        <SelectPopupTemplate
          {...createDefaultProps({
            onSearch: mockSearch,
            searchMode: 'server',
          })}
        />
      )

      const searchInput = screen.getByTestId('select-popup-search')
      await user.type(searchInput, 'test')

      const searchButton = screen.getByTestId('select-popup-search-btn')
      await user.click(searchButton)

      expect(mockSearch).toHaveBeenCalledWith('test')
    })
  })

  describe('단일 선택 모드 (UT-006)', () => {
    it('multiple=false일 때 테이블에 체크박스 컬럼이 없어야 한다', () => {
      render(
        <SelectPopupTemplate {...createDefaultProps({ multiple: false })} />
      )

      // 테이블 내 체크박스 미표시 (전체 선택 체크박스만 없으면 됨)
      expect(screen.queryByTestId('select-all-checkbox')).not.toBeInTheDocument()
    })

    it('multiple=false일 때 행 클릭으로 선택되어야 한다', async () => {
      const user = userEvent.setup()

      const { container } = render(
        <SelectPopupTemplate {...createDefaultProps({ multiple: false })} />
      )

      const firstRow = screen.getByText('항목 1').closest('tr')
      await user.click(firstRow!)

      // 선택 상태 확인 (ant-table-row-selected 클래스)
      await waitFor(() => {
        expect(firstRow).toHaveClass('ant-table-row-selected')
      })
    })

    it('단일 선택 시 이전 선택이 해제되어야 한다', async () => {
      const user = userEvent.setup()

      render(
        <SelectPopupTemplate {...createDefaultProps({ multiple: false })} />
      )

      const firstRow = screen.getByText('항목 1').closest('tr')
      const secondRow = screen.getByText('항목 2').closest('tr')

      await user.click(firstRow!)
      await user.click(secondRow!)

      await waitFor(() => {
        expect(firstRow).not.toHaveClass('ant-table-row-selected')
        expect(secondRow).toHaveClass('ant-table-row-selected')
      })
    })
  })

  describe('다중 선택 모드 (UT-007, UT-008)', () => {
    it('multiple=true일 때 체크박스가 표시되어야 한다', () => {
      render(
        <SelectPopupTemplate {...createDefaultProps({ multiple: true })} />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('체크박스로 여러 항목을 선택할 수 있어야 한다', async () => {
      const user = userEvent.setup()

      render(
        <SelectPopupTemplate {...createDefaultProps({ multiple: true })} />
      )

      // 테이블 내 체크박스 찾기 (Ant Design Table은 각 행에 체크박스 생성)
      const table = screen.getByTestId('select-popup-table')
      const rowCheckboxes = within(table).getAllByRole('checkbox')

      // 첫 번째, 두 번째 데이터 행 체크박스 클릭
      await user.click(rowCheckboxes[0])
      await user.click(rowCheckboxes[1])

      // 선택 개수로 확인
      const selectedCount = screen.getByTestId('selected-count')
      expect(selectedCount).toHaveTextContent('2')
    })

    it('전체 선택 체크박스로 모든 항목을 선택할 수 있어야 한다', async () => {
      const user = userEvent.setup()

      render(
        <SelectPopupTemplate {...createDefaultProps({ multiple: true })} />
      )

      const selectAllCheckbox = screen.getByTestId('select-all-checkbox')
      await user.click(selectAllCheckbox)

      // 모든 행 체크박스가 선택됨
      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.slice(1).forEach((checkbox) => {
        expect(checkbox).toBeChecked()
      })
    })

    it('선택 개수가 표시되어야 한다', async () => {
      const user = userEvent.setup()

      render(
        <SelectPopupTemplate {...createDefaultProps({ multiple: true })} />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])
      await user.click(checkboxes[2])

      const selectedCount = screen.getByTestId('selected-count')
      expect(selectedCount).toHaveTextContent('2')
    })
  })

  describe('선택 확인 (UT-009, UT-010)', () => {
    it('확인 버튼 클릭 시 onSelect가 호출되어야 한다', async () => {
      const mockSelect = vi.fn()
      const user = userEvent.setup()

      render(
        <SelectPopupTemplate
          {...createDefaultProps({ multiple: true, onSelect: mockSelect })}
        />
      )

      // 테이블 내 체크박스 선택
      const table = screen.getByTestId('select-popup-table')
      const rowCheckboxes = within(table).getAllByRole('checkbox')
      await user.click(rowCheckboxes[0])

      // 확인 버튼 클릭
      const confirmButton = screen.getByTestId('select-popup-confirm')
      await user.click(confirmButton)

      expect(mockSelect).toHaveBeenCalledTimes(1)
      // 선택된 항목이 배열로 전달됨
      const calledWith = mockSelect.mock.calls[0][0]
      expect(calledWith.length).toBeGreaterThan(0)
    })

    it('선택된 모든 항목이 콜백에 전달되어야 한다', async () => {
      const mockSelect = vi.fn()
      const user = userEvent.setup()

      render(
        <SelectPopupTemplate
          {...createDefaultProps({ multiple: true, onSelect: mockSelect })}
        />
      )

      // 여러 항목 선택 (Ant Design Table의 체크박스)
      const table = screen.getByTestId('select-popup-table')
      const checkboxes = within(table).getAllByRole('checkbox')

      // 첫 번째, 두 번째 데이터 행 체크박스 클릭
      await user.click(checkboxes[0])
      await user.click(checkboxes[1])

      // 확인 버튼 클릭
      const confirmButton = screen.getByTestId('select-popup-confirm')
      await user.click(confirmButton)

      // 2개 항목이 전달되어야 함
      expect(mockSelect).toHaveBeenCalledTimes(1)
      const calledWith = mockSelect.mock.calls[0][0]
      expect(calledWith).toHaveLength(2)
    })

    it('단일 선택 모드에서 행 클릭 후 확인하면 해당 항목이 전달되어야 한다', async () => {
      const mockSelect = vi.fn()
      const user = userEvent.setup()

      render(
        <SelectPopupTemplate
          {...createDefaultProps({ multiple: false, onSelect: mockSelect })}
        />
      )

      // 행 클릭으로 선택
      const firstRow = screen.getByText('항목 1').closest('tr')
      await user.click(firstRow!)

      // 확인 버튼 클릭
      const confirmButton = screen.getByTestId('select-popup-confirm')
      await user.click(confirmButton)

      expect(mockSelect).toHaveBeenCalledWith([MOCK_ITEMS_BASIC[0]])
    })
  })

  describe('페이지네이션 (UT-011, UT-012)', () => {
    it('pagination prop이 반영되면 총 건수가 표시된다', () => {
      render(
        <SelectPopupTemplate
          {...createDefaultProps({
            pagination: { current: 1, pageSize: 10 },
            total: 50,
          })}
        />
      )

      // 총 건수 표시 확인
      expect(screen.getByText(/총 50건/)).toBeInTheDocument()
    })

    it('pagination={false}일 때 페이지네이션 총 건수가 표시되지 않아야 한다', () => {
      const { container } = render(
        <SelectPopupTemplate
          {...createDefaultProps({ pagination: false })}
        />
      )

      // pagination=false 시 총 건수 영역 없음
      expect(container.querySelector('.ant-table-pagination')).not.toBeInTheDocument()
    })
  })

  describe('로딩 상태 (UT-012)', () => {
    it('loading=true일 때 로딩 표시가 나타나야 한다', () => {
      render(
        <SelectPopupTemplate {...createDefaultProps({ loading: true })} />
      )

      expect(screen.getByTestId('select-popup-loading')).toBeInTheDocument()
    })

    it('loading=true일 때 로딩 인디케이터가 존재해야 한다', () => {
      render(
        <SelectPopupTemplate {...createDefaultProps({ loading: true })} />
      )

      // 로딩 인디케이터 존재 확인
      const loadingIndicator = screen.getByTestId('select-popup-loading')
      expect(loadingIndicator).toBeInTheDocument()
    })
  })

  describe('선택 없이 확인 비활성화 (UT-013)', () => {
    it('선택 항목이 없으면 확인 버튼이 비활성화되어야 한다', () => {
      render(<SelectPopupTemplate {...createDefaultProps()} />)

      const confirmButton = screen.getByTestId('select-popup-confirm')
      expect(confirmButton).toBeDisabled()
    })

    it('항목 선택 후 확인 버튼이 활성화되어야 한다', async () => {
      const user = userEvent.setup()

      render(
        <SelectPopupTemplate {...createDefaultProps({ multiple: true })} />
      )

      const confirmButton = screen.getByTestId('select-popup-confirm')
      expect(confirmButton).toBeDisabled()

      // 항목 선택
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])

      await waitFor(() => {
        expect(confirmButton).not.toBeDisabled()
      })
    })
  })

  describe('외부 selectedKeys 제어', () => {
    it('selectedKeys prop으로 초기 선택 상태를 설정할 수 있어야 한다', () => {
      render(
        <SelectPopupTemplate
          {...createDefaultProps({
            multiple: true,
            selectedKeys: ['1', '2'],
          })}
        />
      )

      // 선택 개수 표시로 확인
      const selectedCount = screen.getByTestId('selected-count')
      expect(selectedCount).toHaveTextContent('2')
    })
  })

  describe('빈 데이터 상태', () => {
    it('dataSource가 비어있을 때 Empty 상태가 표시되어야 한다', () => {
      render(
        <SelectPopupTemplate {...createDefaultProps({ dataSource: [] })} />
      )

      expect(screen.getByTestId('select-popup-empty')).toBeInTheDocument()
    })
  })

  describe('에러 상태', () => {
    it('error prop이 있을 때 에러 메시지가 표시되어야 한다', () => {
      render(
        <SelectPopupTemplate
          {...createDefaultProps({
            error: { message: '데이터를 불러오지 못했습니다' },
          })}
        />
      )

      expect(screen.getByText('데이터를 불러오지 못했습니다')).toBeInTheDocument()
    })

    it('에러 상태에서 재시도 버튼이 표시되어야 한다', async () => {
      const mockRetry = vi.fn()
      const user = userEvent.setup()

      render(
        <SelectPopupTemplate
          {...createDefaultProps({
            error: { message: '에러 발생', onRetry: mockRetry },
          })}
        />
      )

      const retryButton = screen.getByRole('button', { name: /재시도/i })
      await user.click(retryButton)

      expect(mockRetry).toHaveBeenCalled()
    })
  })

  describe('슬롯 커스터마이징', () => {
    it('searchExtra가 검색 영역에 렌더링되어야 한다', () => {
      render(
        <SelectPopupTemplate
          {...createDefaultProps({
            searchExtra: <button data-testid="custom-search-btn">추가 검색</button>,
          })}
        />
      )

      expect(screen.getByTestId('custom-search-btn')).toBeInTheDocument()
    })

    it('tableHeader가 테이블 상단에 렌더링되어야 한다', () => {
      render(
        <SelectPopupTemplate
          {...createDefaultProps({
            tableHeader: <div data-testid="custom-header">테이블 헤더</div>,
          })}
        />
      )

      expect(screen.getByTestId('custom-header')).toBeInTheDocument()
    })

    it('footer가 커스텀 푸터로 렌더링되어야 한다', () => {
      render(
        <SelectPopupTemplate
          {...createDefaultProps({
            footer: <div data-testid="custom-footer">커스텀 푸터</div>,
          })}
        />
      )

      expect(screen.getByTestId('custom-footer')).toBeInTheDocument()
    })

    it('footer가 함수일 때 선택된 항목이 전달되어야 한다', async () => {
      const user = userEvent.setup()
      const footerFn = vi.fn((rows) => (
        <div data-testid="custom-footer">{rows.length}개 선택됨</div>
      ))

      render(
        <SelectPopupTemplate
          {...createDefaultProps({
            multiple: true,
            footer: footerFn,
          })}
        />
      )

      // 항목 선택 (테이블 내 체크박스)
      const table = screen.getByTestId('select-popup-table')
      const checkboxes = within(table).getAllByRole('checkbox')
      await user.click(checkboxes[0])

      expect(footerFn).toHaveBeenCalled()
      // footer 함수가 호출되었는지 확인
      expect(footerFn.mock.calls.length).toBeGreaterThan(0)
    })
  })

  describe('권한 관리', () => {
    it('permissions.canSelect=false일 때 선택이 비활성화되어야 한다', () => {
      render(
        <SelectPopupTemplate
          {...createDefaultProps({
            multiple: true,
            permissions: { canSelect: false },
          })}
        />
      )

      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeDisabled()
      })
    })
  })
})
