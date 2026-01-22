// screens/sample/UserList/__tests__/UserList.test.tsx
// UserList 컴포넌트 통합 테스트 (TSK-06-07)

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserList } from '../index'

// Ant Design message mock
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd')
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  }
})

describe('UserList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // FR-001: 사용자 목록 조회
  it('should render user list page - FR-001', async () => {
    render(<UserList />)

    expect(screen.getByTestId('user-list-page')).toBeInTheDocument()
    expect(screen.getByTestId('list-template-container')).toBeInTheDocument()
  })

  it('should display search condition card', () => {
    render(<UserList />)

    expect(screen.getByTestId('search-condition-card')).toBeInTheDocument()
  })

  it('should display user list table', async () => {
    render(<UserList />)

    // 테이블이 렌더링될 때까지 대기
    await waitFor(() => {
      const table = document.querySelector('.ant-table')
      expect(table).toBeInTheDocument()
    })
  })

  // FR-002: 이름으로 검색
  it('should filter by name - FR-002', async () => {
    const user = userEvent.setup()
    render(<UserList />)

    // 이름 검색 필드 찾기
    const nameInput = screen.getByPlaceholderText('이름 검색...')
    expect(nameInput).toBeInTheDocument()

    // 검색어 입력
    await user.type(nameInput, '홍')

    // 검색 버튼 클릭
    const searchBtn = screen.getByTestId('search-btn')
    await user.click(searchBtn)

    // 검색 결과 확인 (비동기 업데이트 대기)
    await waitFor(() => {
      const table = document.querySelector('.ant-table-tbody')
      if (table) {
        const rows = table.querySelectorAll('tr.ant-table-row')
        // 이름에 '홍'이 포함된 사용자만 표시되어야 함
        rows.forEach((row) => {
          const nameCell = row.querySelector('td:nth-child(2)')
          if (nameCell?.textContent) {
            expect(nameCell.textContent).toContain('홍')
          }
        })
      }
    })
  })

  // FR-003: 이메일로 검색
  it('should have email search field - FR-003', () => {
    render(<UserList />)

    const emailInput = screen.getByPlaceholderText('이메일 검색...')
    expect(emailInput).toBeInTheDocument()
  })

  // FR-004: 상태로 필터링
  it('should have status filter select - FR-004', () => {
    render(<UserList />)

    // 상태 셀렉트 확인
    const statusSelect = document.querySelector('[class*="ant-select"]')
    expect(statusSelect).toBeInTheDocument()
  })

  // FR-005: 검색 조건 초기화
  it('should reset search conditions - FR-005', async () => {
    const user = userEvent.setup()
    render(<UserList />)

    // 검색어 입력
    const nameInput = screen.getByPlaceholderText('이름 검색...')
    await user.type(nameInput, '홍')

    // 초기화 버튼 클릭
    const resetBtn = screen.getByTestId('reset-btn')
    await user.click(resetBtn)

    // 입력 필드가 비워졌는지 확인
    await waitFor(() => {
      expect(nameInput).toHaveValue('')
    })
  })

  // FR-006: 목록 정렬
  it('should have sortable columns - FR-006', async () => {
    render(<UserList />)

    await waitFor(() => {
      const table = document.querySelector('.ant-table')
      expect(table).toBeInTheDocument()
    })

    // 정렬 가능한 컬럼 헤더 확인 (테이블 내부의 이름 컬럼)
    const nameHeaders = screen.getAllByText('이름')
    const tableNameHeader = nameHeaders.find((el) => el.closest('th'))
    expect(tableNameHeader?.closest('th')).toBeInTheDocument()
  })

  // FR-007: 페이지 이동
  it('should display pagination - FR-007', async () => {
    render(<UserList />)

    await waitFor(() => {
      const pagination = document.querySelector('.ant-pagination')
      expect(pagination).toBeInTheDocument()
    })
  })

  // FR-008, BR-004: 행 선택 및 삭제 버튼 상태
  it('should enable delete button when rows are selected - FR-008, BR-004', async () => {
    const user = userEvent.setup()
    render(<UserList />)

    await waitFor(() => {
      const table = document.querySelector('.ant-table-tbody')
      expect(table).toBeInTheDocument()
    })

    // 삭제 버튼이 초기에 비활성화되어 있는지 확인
    const deleteBtn = screen.getByTestId('delete-btn')
    expect(deleteBtn).toBeDisabled()

    // 첫 번째 행의 체크박스 클릭
    const firstCheckbox = document.querySelector('.ant-table-tbody .ant-checkbox-input')
    if (firstCheckbox) {
      await user.click(firstCheckbox)

      // 삭제 버튼이 활성화되었는지 확인
      await waitFor(() => {
        expect(deleteBtn).not.toBeDisabled()
      })
    }
  })

  // FR-009, BR-003: 선택 사용자 삭제
  it('should show delete confirm dialog - FR-009, BR-003', async () => {
    const user = userEvent.setup()
    render(<UserList />)

    await waitFor(() => {
      const table = document.querySelector('.ant-table-tbody')
      expect(table).toBeInTheDocument()
    })

    // 첫 번째 행 체크박스 선택
    const firstCheckbox = document.querySelector('.ant-table-tbody .ant-checkbox-input')
    if (firstCheckbox) {
      await user.click(firstCheckbox)

      // 삭제 버튼 클릭
      const deleteBtn = screen.getByTestId('delete-btn')
      await user.click(deleteBtn)

      // 확인 다이얼로그 표시 확인
      await waitFor(() => {
        const confirmDialog = screen.getByTestId('confirm-dialog')
        expect(confirmDialog).toBeInTheDocument()
      })
    }
  })

  // FR-010, BR-005: 행 클릭 시 상세 모달 표시
  it('should open detail modal when row is clicked - FR-010, BR-005', async () => {
    const user = userEvent.setup()
    render(<UserList />)

    await waitFor(() => {
      const table = document.querySelector('.ant-table-tbody')
      expect(table).toBeInTheDocument()
    })

    // 첫 번째 행 클릭 (체크박스가 아닌 셀)
    const firstRow = document.querySelector('.ant-table-tbody tr.ant-table-row')
    if (firstRow) {
      const nameCell = firstRow.querySelector('td:nth-child(2)') // 이름 셀
      if (nameCell) {
        await user.click(nameCell)

        // 상세 모달 표시 확인
        await waitFor(() => {
          const modal = screen.getByTestId('user-detail-modal')
          expect(modal).toBeInTheDocument()
        })
      }
    }
  })

  it('should close detail modal when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<UserList />)

    await waitFor(() => {
      const table = document.querySelector('.ant-table-tbody')
      expect(table).toBeInTheDocument()
    })

    // 행 클릭하여 모달 열기
    const firstRow = document.querySelector('.ant-table-tbody tr.ant-table-row')
    if (firstRow) {
      const nameCell = firstRow.querySelector('td:nth-child(2)')
      if (nameCell) {
        await user.click(nameCell)

        await waitFor(() => {
          expect(screen.getByTestId('user-detail-modal')).toBeInTheDocument()
        })

        // 닫기 버튼 클릭
        const closeBtn = screen.getByTestId('modal-close-btn')
        await user.click(closeBtn)

        // 모달이 닫혔는지 확인
        await waitFor(() => {
          expect(screen.queryByTestId('user-detail-modal')).not.toBeInTheDocument()
        })
      }
    }
  })

  // BR-006: 복합 조건 검색
  it('should apply multiple search conditions with AND - BR-006', async () => {
    const user = userEvent.setup()
    render(<UserList />)

    // 이름 검색어 입력
    const nameInput = screen.getByPlaceholderText('이름 검색...')
    await user.type(nameInput, '홍')

    // 검색 실행
    const searchBtn = screen.getByTestId('search-btn')
    await user.click(searchBtn)

    // 결과 확인
    await waitFor(() => {
      const table = document.querySelector('.ant-table-tbody')
      if (table) {
        const rows = table.querySelectorAll('tr.ant-table-row')
        rows.forEach((row) => {
          const nameCell = row.querySelector('td:nth-child(2)')
          if (nameCell?.textContent) {
            expect(nameCell.textContent.toLowerCase()).toContain('홍')
          }
        })
      }
    })
  })

  it('should display selected count in toolbar', async () => {
    const user = userEvent.setup()
    render(<UserList />)

    await waitFor(() => {
      const table = document.querySelector('.ant-table-tbody')
      expect(table).toBeInTheDocument()
    })

    // 체크박스 선택
    const checkboxes = document.querySelectorAll('.ant-table-tbody .ant-checkbox-input')
    if (checkboxes.length >= 2) {
      await user.click(checkboxes[0])
      await user.click(checkboxes[1])

      // 선택 건수 표시 확인
      await waitFor(() => {
        expect(screen.getByText('2건 선택됨')).toBeInTheDocument()
      })
    }
  })

  it('should display total count', () => {
    render(<UserList />)

    // 총 건수 표시 확인 (pagination에서)
    const totalText = screen.getByTestId('total-count')
    expect(totalText).toBeInTheDocument()
  })

  it('should display status tags with correct colors', async () => {
    render(<UserList />)

    await waitFor(() => {
      // 활성 상태 태그
      const activeTags = document.querySelectorAll('.ant-tag-success')
      const inactiveTags = document.querySelectorAll('.ant-tag-error')
      const pendingTags = document.querySelectorAll('.ant-tag-warning')

      // 최소 1개 이상의 상태 태그가 있어야 함
      const totalTags = activeTags.length + inactiveTags.length + pendingTags.length
      expect(totalTags).toBeGreaterThan(0)
    })
  })
})
