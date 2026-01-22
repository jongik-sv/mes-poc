// components/templates/__tests__/ListTemplate.spec.tsx
// ListTemplate 컴포넌트 단위 테스트 (TSK-06-01)

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ListTemplate } from '../ListTemplate'
import type { SearchFieldDefinition } from '../ListTemplate/types'

// Mock DataTable
vi.mock('@/components/common/DataTable', () => ({
  DataTable: ({ dataSource, rowKey, columns, rowSelection, loading, pagination }: any) => (
    <div data-testid="data-grid" aria-busy={loading}>
      <table>
        <thead>
          <tr>
            {rowSelection && (
              <th>
                <input
                  type="checkbox"
                  data-testid="select-all-checkbox"
                  onChange={(e) => {
                    if (rowSelection.onChange) {
                      if (e.target.checked) {
                        rowSelection.onChange(
                          dataSource.map((r: any) => r[rowKey]),
                          dataSource
                        )
                      } else {
                        rowSelection.onChange([], [])
                      }
                    }
                  }}
                />
              </th>
            )}
            {columns.map((col: any) => (
              <th key={col.key || col.dataIndex} data-testid={`sort-${col.dataIndex}`}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((row: any, index: number) => (
            <tr key={row[rowKey]} data-testid="grid-row">
              {rowSelection && (
                <td>
                  <input
                    type="checkbox"
                    data-testid={`row-checkbox-${row[rowKey]}`}
                    onChange={(e) => {
                      if (rowSelection.onChange) {
                        const currentSelected = rowSelection.selectedRowKeys || []
                        if (e.target.checked) {
                          rowSelection.onChange([...currentSelected, row[rowKey]], [row])
                        } else {
                          rowSelection.onChange(
                            currentSelected.filter((k: string) => k !== row[rowKey]),
                            []
                          )
                        }
                      }
                    }}
                  />
                </td>
              )}
              {columns.map((col: any) => (
                <td key={col.key || col.dataIndex} data-testid={`cell-${col.dataIndex}`}>
                  {row[col.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  default: ({ dataSource, rowKey, columns, rowSelection, loading }: any) => (
    <div data-testid="data-grid" aria-busy={loading}>
      {dataSource?.length === 0 ? <div>표시할 데이터가 없습니다</div> : null}
    </div>
  ),
}))

// 테스트용 데이터
const mockColumns = [
  { title: '이름', dataIndex: 'name', key: 'name' },
  { title: '상태', dataIndex: 'status', key: 'status' },
]

const mockDataSource = [
  { id: '1', name: '홍길동', status: 'ACTIVE' },
  { id: '2', name: '김철수', status: 'INACTIVE' },
  { id: '3', name: '이영희', status: 'PENDING' },
]

const mockSearchFields: SearchFieldDefinition[] = [
  { name: 'name', label: '이름', type: 'text', placeholder: '이름 검색' },
  {
    name: 'status',
    label: '상태',
    type: 'select',
    options: [
      { label: '전체', value: '' },
      { label: '활성', value: 'ACTIVE' },
      { label: '비활성', value: 'INACTIVE' },
    ],
  },
]

describe('ListTemplate', () => {
  describe('렌더링 (UT-001)', () => {
    it('모든 영역이 정상적으로 렌더링된다', () => {
      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          searchFields={mockSearchFields}
          onSearch={vi.fn()}
          onReset={vi.fn()}
          onAdd={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      expect(screen.getByTestId('list-template-container')).toBeInTheDocument()
      expect(screen.getByTestId('search-condition-card')).toBeInTheDocument()
      expect(screen.getByTestId('data-grid')).toBeInTheDocument()
      expect(screen.getByTestId('search-btn')).toBeInTheDocument()
      expect(screen.getByTestId('reset-btn')).toBeInTheDocument()
      expect(screen.getByTestId('add-btn')).toBeInTheDocument()
      expect(screen.getByTestId('delete-btn')).toBeInTheDocument()
    })

    it('searchFields가 없으면 검색 영역이 숨겨진다', () => {
      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
        />
      )

      expect(screen.queryByTestId('search-condition-card')).not.toBeInTheDocument()
    })

    it('hideSearchCard가 true면 검색 영역이 숨겨진다', () => {
      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          searchFields={mockSearchFields}
          hideSearchCard
        />
      )

      expect(screen.queryByTestId('search-condition-card')).not.toBeInTheDocument()
    })

    it('onAdd가 없으면 신규 버튼이 숨겨진다', () => {
      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
        />
      )

      expect(screen.queryByTestId('add-btn')).not.toBeInTheDocument()
    })

    it('onDelete가 없으면 삭제 버튼이 숨겨진다', () => {
      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
        />
      )

      expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument()
    })

    it('permissions.canAdd가 false면 신규 버튼이 숨겨진다', () => {
      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          onAdd={vi.fn()}
          permissions={{ canAdd: false }}
        />
      )

      expect(screen.queryByTestId('add-btn')).not.toBeInTheDocument()
    })

    it('permissions.canDelete가 false면 삭제 버튼이 숨겨진다', () => {
      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          onDelete={vi.fn()}
          permissions={{ canDelete: false }}
        />
      )

      expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument()
    })
  })

  describe('검색 실행 (UT-003)', () => {
    it('검색 버튼 클릭 시 onSearch가 호출된다', async () => {
      const onSearch = vi.fn()
      const user = userEvent.setup()

      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          searchFields={mockSearchFields}
          onSearch={onSearch}
          autoSearchOnMount={false}
        />
      )

      await user.click(screen.getByTestId('search-btn'))

      expect(onSearch).toHaveBeenCalledTimes(1)
    })

    it('검색 중 로딩 상태가 표시된다', () => {
      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          searchFields={mockSearchFields}
          onSearch={vi.fn()}
          loading
        />
      )

      expect(screen.getByTestId('search-btn')).toBeDisabled()
      expect(screen.getByTestId('data-grid')).toHaveAttribute('aria-busy', 'true')
    })
  })

  describe('초기화 (UT-004)', () => {
    it('초기화 버튼 클릭 시 onReset이 호출된다', async () => {
      const onReset = vi.fn()
      const user = userEvent.setup()

      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          searchFields={mockSearchFields}
          onReset={onReset}
        />
      )

      await user.click(screen.getByTestId('reset-btn'))

      expect(onReset).toHaveBeenCalledTimes(1)
    })
  })

  describe('액션 버튼 (UT-005)', () => {
    it('신규 버튼 클릭 시 onAdd가 호출된다', async () => {
      const onAdd = vi.fn()
      const user = userEvent.setup()

      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          onAdd={onAdd}
        />
      )

      await user.click(screen.getByTestId('add-btn'))

      expect(onAdd).toHaveBeenCalledTimes(1)
    })

    it('선택된 행이 없으면 삭제 버튼이 비활성화된다', () => {
      const onDelete = vi.fn()

      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          onDelete={onDelete}
          rowSelection={{ type: 'checkbox' }}
        />
      )

      expect(screen.getByTestId('delete-btn')).toBeDisabled()
    })
  })

  describe('삭제 확인 다이얼로그 (UT-010)', () => {
    it('삭제 버튼 클릭 시 확인 다이얼로그가 표시된다', async () => {
      const onDelete = vi.fn()
      const user = userEvent.setup()

      const { container } = render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          onDelete={onDelete}
          rowSelection={{ type: 'checkbox' }}
        />
      )

      // 행 선택
      await user.click(screen.getByTestId('row-checkbox-1'))

      // 삭제 버튼이 활성화되는지 확인 (선택 후)
      await waitFor(() => {
        expect(screen.getByTestId('delete-btn')).not.toBeDisabled()
      })

      // 삭제 버튼 클릭
      await user.click(screen.getByTestId('delete-btn'))

      // 다이얼로그 확인
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
        expect(screen.getByText(/삭제하시겠습니까/)).toBeInTheDocument()
      })
    })

    it('확인 클릭 시 onDelete가 호출된다', async () => {
      const onDelete = vi.fn()
      const user = userEvent.setup()

      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          onDelete={onDelete}
          rowSelection={{ type: 'checkbox' }}
        />
      )

      // 행 선택
      await user.click(screen.getByTestId('row-checkbox-1'))

      // 삭제 버튼 클릭
      await waitFor(() => {
        expect(screen.getByTestId('delete-btn')).not.toBeDisabled()
      })
      await user.click(screen.getByTestId('delete-btn'))

      // 다이얼로그에서 확인 클릭
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })
      await user.click(screen.getByTestId('confirm-ok-btn'))

      expect(onDelete).toHaveBeenCalled()
    })

    it('취소 클릭 시 다이얼로그가 닫힌다', async () => {
      const onDelete = vi.fn()
      const user = userEvent.setup()

      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          onDelete={onDelete}
          rowSelection={{ type: 'checkbox' }}
        />
      )

      // 행 선택
      await user.click(screen.getByTestId('row-checkbox-1'))

      // 삭제 버튼 클릭
      await waitFor(() => {
        expect(screen.getByTestId('delete-btn')).not.toBeDisabled()
      })
      await user.click(screen.getByTestId('delete-btn'))

      // 다이얼로그에서 취소 클릭
      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      })
      await user.click(screen.getByTestId('confirm-cancel-btn'))

      // 다이얼로그 닫힘 및 onDelete 미호출 확인
      await waitFor(() => {
        expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()
      })
      expect(onDelete).not.toHaveBeenCalled()
    })
  })

  describe('행 선택 (UT-008)', () => {
    it('체크박스 클릭 시 선택 상태가 변경된다', async () => {
      const user = userEvent.setup()

      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          rowSelection={{ type: 'checkbox' }}
          onDelete={vi.fn()}
        />
      )

      // 첫 번째 행 선택
      await user.click(screen.getByTestId('row-checkbox-1'))

      // 선택 건수 표시 확인
      await waitFor(() => {
        expect(screen.getByTestId('selected-count')).toHaveTextContent('1건 선택됨')
      })

      // 두 번째 행도 선택
      await user.click(screen.getByTestId('row-checkbox-2'))

      await waitFor(() => {
        expect(screen.getByTestId('selected-count')).toHaveTextContent('2건 선택됨')
      })
    })

    it('전체 선택 체크박스 클릭 시 모든 행이 선택된다', async () => {
      const user = userEvent.setup()

      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          rowSelection={{ type: 'checkbox' }}
          onDelete={vi.fn()}
        />
      )

      await user.click(screen.getByTestId('select-all-checkbox'))

      await waitFor(() => {
        expect(screen.getByTestId('selected-count')).toHaveTextContent('3건 선택됨')
      })
    })
  })

  describe('총 건수 표시', () => {
    it('총 데이터 건수가 표시된다', () => {
      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          total={125}
        />
      )

      expect(screen.getByTestId('total-count')).toHaveTextContent('총 125건')
    })

    it('total이 없으면 dataSource 길이를 사용한다', () => {
      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
        />
      )

      expect(screen.getByTestId('total-count')).toHaveTextContent('총 3건')
    })
  })

  describe('빈 데이터 상태', () => {
    it('데이터가 없으면 Empty State가 표시된다', () => {
      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={[]}
          rowKey="id"
        />
      )

      expect(screen.getByTestId('data-grid')).toBeInTheDocument()
    })
  })

  describe('커스터마이징', () => {
    it('addButtonText로 버튼 텍스트를 변경할 수 있다', () => {
      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          onAdd={vi.fn()}
          addButtonText="등록"
        />
      )

      expect(screen.getByTestId('add-btn')).toHaveTextContent('등록')
    })

    it('deleteButtonText로 버튼 텍스트를 변경할 수 있다', () => {
      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          onDelete={vi.fn()}
          deleteButtonText="제거"
        />
      )

      expect(screen.getByTestId('delete-btn')).toHaveTextContent('제거')
    })

    it('toolbarExtra로 추가 버튼을 렌더링할 수 있다', () => {
      render(
        <ListTemplate
          columns={mockColumns}
          dataSource={mockDataSource}
          rowKey="id"
          toolbarExtra={<button data-testid="custom-btn">커스텀</button>}
        />
      )

      expect(screen.getByTestId('custom-btn')).toBeInTheDocument()
    })
  })
})
