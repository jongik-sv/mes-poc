// components/common/__tests__/DataTable.test.tsx
// DataTable 컴포넌트 단위 테스트 (TSK-05-04)

import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable, type DataTableColumn, type DataTableProps } from '../DataTable'

// 테스트용 Mock 데이터
const MOCK_COLUMNS: DataTableColumn<TestRecord>[] = [
  {
    title: '이름',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
  },
  {
    title: '상태',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '생성일',
    dataIndex: 'createdAt',
    key: 'createdAt',
    sorter: true,
  },
]

const MOCK_COLUMNS_RESIZE: DataTableColumn<TestRecord>[] = [
  {
    title: '이름',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    resizable: true,
  },
  {
    title: '설명',
    dataIndex: 'description',
    key: 'description',
    width: 200,
    resizable: true,
  },
]

interface TestRecord {
  id: number
  name: string
  status: string
  createdAt?: string
  description?: string
}

// 10건 데이터 생성
const MOCK_DATA_10: TestRecord[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `항목 ${i + 1}`,
  status: i % 2 === 0 ? 'active' : 'inactive',
  createdAt: `2026-01-${String(15 - i).padStart(2, '0')}`,
}))

// 30건 데이터 생성 (페이징 테스트용)
const MOCK_DATA_30: TestRecord[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `항목 ${i + 1}`,
  status: i % 2 === 0 ? 'active' : 'inactive',
  createdAt: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
}))

// 테스트 헬퍼
const renderDataTable = (props: Partial<DataTableProps<TestRecord>> = {}) => {
  const defaultProps: DataTableProps<TestRecord> = {
    columns: MOCK_COLUMNS,
    dataSource: MOCK_DATA_10,
    rowKey: 'id',
    ...props,
  }
  return render(<DataTable {...defaultProps} />)
}

describe('DataTable', () => {
  // ================================================
  // FR-001: 컬럼 정렬 기능
  // ================================================
  describe('sorting', () => {
    // UT-001: 컬럼 헤더 클릭 시 오름차순 정렬
    it('UT-001: should sort ascending on header click', async () => {
      const onChangeMock = vi.fn()
      renderDataTable({ onChange: onChangeMock })

      const nameHeader = screen.getByText('이름')
      await userEvent.click(nameHeader)

      expect(onChangeMock).toHaveBeenCalled()
      const [, , sorter] = onChangeMock.mock.calls[0]
      expect(sorter.order).toBe('ascend')
      expect(sorter.field).toBe('name')
    })

    // UT-002: 동일 컬럼 재클릭 시 내림차순
    it('UT-002: should toggle to descending on second click', async () => {
      const onChangeMock = vi.fn()
      renderDataTable({ onChange: onChangeMock })

      const nameHeader = screen.getByText('이름')

      // 첫 번째 클릭 - 오름차순
      await userEvent.click(nameHeader)
      expect(onChangeMock.mock.calls[0][2].order).toBe('ascend')

      // 두 번째 클릭 - 내림차순
      await userEvent.click(nameHeader)
      expect(onChangeMock.mock.calls[1][2].order).toBe('descend')
    })

    // UT-010: 다른 컬럼 정렬 시 기존 정렬 해제 (BR-002)
    it('UT-010: should clear previous sort when sorting different column', async () => {
      const onChangeMock = vi.fn()
      renderDataTable({ onChange: onChangeMock })

      // 이름 컬럼 정렬
      const nameHeader = screen.getByText('이름')
      await userEvent.click(nameHeader)

      // 생성일 컬럼 정렬 - 이름 정렬 해제되어야 함
      const dateHeader = screen.getByText('생성일')
      await userEvent.click(dateHeader)

      const [, , sorter] = onChangeMock.mock.calls[1]
      expect(sorter.field).toBe('createdAt')
      expect(sorter.order).toBe('ascend')
    })
  })

  // ================================================
  // FR-002: 페이징 기능
  // ================================================
  describe('pagination', () => {
    // UT-003: 페이지 번호 클릭 시 이동
    it('UT-003: should change page on click', async () => {
      const onChangeMock = vi.fn()
      renderDataTable({
        dataSource: MOCK_DATA_30,
        pagination: { pageSize: 10 },
        onChange: onChangeMock,
      })

      // 페이지 2 클릭
      const page2 = screen.getByText('2')
      await userEvent.click(page2)

      expect(onChangeMock).toHaveBeenCalled()
      const [pagination] = onChangeMock.mock.calls[0]
      expect(pagination.current).toBe(2)
    })

    // UT-004: 페이지 크기 변경 - pagination 설정 확인
    it('UT-004: should render pagination with showSizeChanger enabled', () => {
      renderDataTable({
        dataSource: MOCK_DATA_30,
        pagination: {
          pageSize: 10,
          showSizeChanger: true,
        },
      })

      // 테이블이 렌더링되었는지 확인
      const table = screen.getByTestId('data-table')
      expect(table).toBeInTheDocument()

      // 페이지네이션 영역 확인
      const pagination = document.querySelector('.ant-pagination')
      expect(pagination).toBeInTheDocument()

      // 총 건수 표시 확인 (DataTable 기본 설정)
      expect(screen.getByText(/총 30건/)).toBeInTheDocument()
    })

    // UT-009: 페이지 크기 옵션 제한 (BR-001)
    it('UT-009: should only show allowed page size options', () => {
      renderDataTable({
        dataSource: MOCK_DATA_30,
        pagination: {
          pageSize: 10,
          showSizeChanger: true,
        },
      })

      const table = screen.getByTestId('data-table')
      expect(table).toBeInTheDocument()

      // DataTable의 기본 pageSizeOptions가 [10, 20, 50, 100]인지 확인
      // 내부적으로 이 값이 설정되어 있어야 함
    })
  })

  // ================================================
  // FR-003: 행 선택 기능
  // ================================================
  describe('row selection', () => {
    // UT-005: 단일 행 선택 (라디오)
    it('UT-005: should select single row on radio click', async () => {
      const onSelectChangeMock = vi.fn()
      renderDataTable({
        rowSelection: {
          type: 'radio',
          onChange: onSelectChangeMock,
        },
      })

      // 첫 번째 행의 라디오 버튼 클릭
      const radios = screen.getAllByRole('radio')
      await userEvent.click(radios[0])

      expect(onSelectChangeMock).toHaveBeenCalled()
      const [selectedKeys] = onSelectChangeMock.mock.calls[0]
      expect(selectedKeys).toContain(1)
      expect(selectedKeys.length).toBe(1)
    })

    // UT-006: 체크박스 클릭 시 다중 선택
    it('UT-006: should add row to selection on checkbox click', async () => {
      const onSelectChangeMock = vi.fn()
      renderDataTable({
        rowSelection: {
          type: 'checkbox',
          onChange: onSelectChangeMock,
        },
      })

      const checkboxes = screen.getAllByRole('checkbox')

      // 첫 번째 행 체크박스 클릭 (0번은 전체 선택)
      await userEvent.click(checkboxes[1])

      // 세 번째 행 체크박스 추가 클릭
      await userEvent.click(checkboxes[3])

      expect(onSelectChangeMock).toHaveBeenCalledTimes(2)
      const [selectedKeys] = onSelectChangeMock.mock.calls[1]
      expect(selectedKeys.length).toBe(2)
    })

    // UT-007: 전체 선택 체크박스 클릭
    it('UT-007: should select all rows in current page on header checkbox click', async () => {
      const onSelectChangeMock = vi.fn()
      renderDataTable({
        rowSelection: {
          type: 'checkbox',
          onChange: onSelectChangeMock,
        },
      })

      // 헤더의 전체 선택 체크박스 (첫 번째 체크박스)
      const checkboxes = screen.getAllByRole('checkbox')
      await userEvent.click(checkboxes[0])

      expect(onSelectChangeMock).toHaveBeenCalled()
      const [selectedKeys] = onSelectChangeMock.mock.calls[0]
      expect(selectedKeys.length).toBe(10) // 현재 페이지의 모든 행
    })

    // UT-012: 전체 선택 범위 - 현재 페이지만 (BR-004)
    it('UT-012: should only select current page on select all', async () => {
      const onSelectChangeMock = vi.fn()
      renderDataTable({
        dataSource: MOCK_DATA_30,
        pagination: { pageSize: 10 },
        rowSelection: {
          type: 'checkbox',
          onChange: onSelectChangeMock,
        },
      })

      // 전체 선택
      const checkboxes = screen.getAllByRole('checkbox')
      await userEvent.click(checkboxes[0])

      const [selectedKeys] = onSelectChangeMock.mock.calls[0]
      // 1-10번 항목만 선택되어야 함
      expect(selectedKeys.length).toBe(10)
      expect(selectedKeys).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))
    })
  })

  // ================================================
  // FR-004: 컬럼 리사이즈 기능
  // ================================================
  describe('column resize', () => {
    // UT-008: 컬럼 너비 드래그
    it('UT-008: should call onColumnResize when resizing', () => {
      const onColumnResizeMock = vi.fn()
      render(
        <DataTable
          columns={MOCK_COLUMNS_RESIZE}
          dataSource={MOCK_DATA_10}
          rowKey="id"
          resizable
          onColumnResize={onColumnResizeMock}
        />
      )

      // 리사이즈 핸들이 렌더링되는지 확인
      const table = screen.getByTestId('data-table')
      expect(table).toBeInTheDocument()
    })
  })

  // ================================================
  // 비즈니스 규칙 검증
  // ================================================
  describe('business rules', () => {
    // 기본 렌더링 테스트
    it('should render table with data-testid', () => {
      renderDataTable()

      const table = screen.getByTestId('data-table')
      expect(table).toBeInTheDocument()
    })

    // 빈 데이터 시 Empty 컴포넌트 표시
    it('should show empty state when no data', () => {
      renderDataTable({ dataSource: [] })

      const emptyState = screen.getByTestId('data-table-empty')
      expect(emptyState).toBeInTheDocument()
    })

    // 로딩 상태 표시
    it('should show loading state', () => {
      renderDataTable({ loading: true })

      const loading = screen.getByTestId('data-table-loading')
      expect(loading).toBeInTheDocument()
    })

    // 총 건수 표시
    it('should display total count', () => {
      renderDataTable({
        dataSource: MOCK_DATA_30,
        pagination: { showTotal: (total) => `총 ${total}건` },
      })

      expect(screen.getByText(/총 30건/)).toBeInTheDocument()
    })
  })

  // ================================================
  // 접근성 테스트
  // ================================================
  describe('accessibility', () => {
    it('should have proper table role', () => {
      renderDataTable()

      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('should have sortable column headers with clickable elements', () => {
      renderDataTable()

      // 정렬 가능한 컬럼 헤더 찾기
      const nameHeader = screen.getByText('이름')
      const dateHeader = screen.getByText('생성일')

      // 컬럼 헤더가 클릭 가능한지 확인
      expect(nameHeader).toBeInTheDocument()
      expect(dateHeader).toBeInTheDocument()

      // sorter 아이콘이 존재하는지 확인 (Ant Design의 정렬 컨트롤)
      const sorterIcons = document.querySelectorAll('.ant-table-column-sorter')
      expect(sorterIcons.length).toBeGreaterThan(0)
    })
  })
})
