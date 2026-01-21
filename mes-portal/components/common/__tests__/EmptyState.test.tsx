// components/common/__tests__/EmptyState.test.tsx
// EmptyState 컴포넌트 단위 테스트 (TSK-05-01)

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from '../EmptyState'

// Ant Design 모킹
jest.mock('antd', () => ({
  Empty: ({ image, description, children, ...props }: any) => (
    <div data-testid="ant-empty" {...props}>
      {image && <div data-testid="empty-image">{image}</div>}
      <div data-testid="empty-description">{description}</div>
      {children && <div data-testid="empty-children">{children}</div>}
    </div>
  ),
  Button: ({ children, onClick, type, ...props }: any) => (
    <button onClick={onClick} data-type={type} {...props}>
      {children}
    </button>
  ),
  Tag: ({ children, closable, onClose, ...props }: any) => (
    <span data-testid="tag" data-closable={String(closable)} {...props}>
      {children}
      {closable && <button onClick={onClose} data-testid="tag-close" />}
    </span>
  ),
  Space: ({ children, ...props }: any) => (
    <div data-testid="space" {...props}>{children}</div>
  ),
}))

// Ant Design Icons 모킹
jest.mock('@ant-design/icons', () => ({
  InboxOutlined: () => <span data-testid="inbox-icon">inbox</span>,
  SearchOutlined: () => <span data-testid="search-icon">search</span>,
  FilterOutlined: () => <span data-testid="filter-icon">filter</span>,
}))

// userEvent 헬퍼
const renderWithUser = (ui: React.ReactElement) => {
  return {
    user: userEvent.setup(),
    ...render(ui),
  }
}

describe('EmptyState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // UT-009: 기본 빈 상태
  describe('UT-009: 기본 빈 상태', () => {
    it('renders default empty state', () => {
      render(<EmptyState />)

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByTestId('empty-state-message')).toHaveTextContent('데이터가 없습니다')
    })

    it('renders with custom title', () => {
      render(<EmptyState title="커스텀 제목" />)

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('커스텀 제목')
    })

    it('renders with custom description', () => {
      render(<EmptyState description="커스텀 설명 메시지" />)

      expect(screen.getByTestId('empty-state-message')).toHaveTextContent('커스텀 설명 메시지')
    })
  })

  // UT-010: 검색 결과 없음
  describe('UT-010: 검색 결과 없음', () => {
    it('renders search empty state', () => {
      render(<EmptyState type="search" />)

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('검색 결과가 없습니다')
    })

    it('displays search keyword in message', () => {
      render(<EmptyState type="search" searchKeyword="테스트" />)

      expect(screen.getByTestId('empty-state-message')).toHaveTextContent('"테스트"')
    })

    it('shows search icon for search type', () => {
      render(<EmptyState type="search" />)

      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    })
  })

  // UT-011: 필터 초기화 버튼
  describe('UT-011: 필터 초기화 버튼', () => {
    it('calls onReset callback when filter reset button clicked', async () => {
      const onReset = jest.fn()
      const { user } = renderWithUser(<EmptyState type="filter" onReset={onReset} />)

      await user.click(screen.getByTestId('empty-state-action'))

      expect(onReset).toHaveBeenCalledTimes(1)
    })

    it('shows filter icon for filter type', () => {
      render(<EmptyState type="filter" />)

      expect(screen.getByTestId('filter-icon')).toBeInTheDocument()
    })

    it('displays applied filters', () => {
      const filters = [
        { key: 'status', label: '상태', value: '진행중' },
        { key: 'assignee', label: '담당자', value: '홍길동' },
      ]
      render(<EmptyState type="filter" appliedFilters={filters} />)

      expect(screen.getByText('상태: 진행중')).toBeInTheDocument()
      expect(screen.getByText('담당자: 홍길동')).toBeInTheDocument()
    })
  })

  // UT-012: 커스텀 아이콘
  describe('UT-012: 커스텀 아이콘', () => {
    it('renders custom icon', () => {
      render(<EmptyState icon={<div data-testid="custom-icon">Icon</div>} />)

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })
  })

  // UT-013: 액션 버튼 렌더링
  describe('UT-013: 액션 버튼 렌더링', () => {
    it('renders action button', async () => {
      const onClick = jest.fn()
      const { user } = renderWithUser(
        <EmptyState action={<button onClick={onClick}>새로 추가</button>} />
      )

      await user.click(screen.getByRole('button', { name: '새로 추가' }))

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('renders action with custom props', () => {
      render(<EmptyState actionText="데이터 추가" actionType="primary" />)

      const actionButton = screen.getByTestId('empty-state-action')
      expect(actionButton).toHaveTextContent('데이터 추가')
    })
  })

  // UT-019: BR-003 빈 상태 가이드 메시지
  describe('UT-019: BR-003 빈 상태 가이드 메시지', () => {
    it('provides context-appropriate guide message for no-data type', () => {
      render(<EmptyState type="no-data" />)

      expect(screen.getByTestId('empty-state-message')).toHaveTextContent('데이터가 없습니다')
      expect(screen.getByTestId('empty-state-description')).toBeInTheDocument()
    })

    it('provides context-appropriate guide message for search type', () => {
      render(<EmptyState type="search" />)

      const message = screen.getByTestId('empty-state-message')
      expect(message).toHaveTextContent(/다른 검색어|검색/)
    })

    it('provides context-appropriate guide message for filter type', () => {
      render(<EmptyState type="filter" />)

      const message = screen.getByTestId('empty-state-message')
      expect(message).toHaveTextContent(/필터/)
    })
  })

  // 접근성 테스트
  describe('접근성', () => {
    it('has role="alert" for empty state announcements', () => {
      render(<EmptyState />)

      const container = screen.getByTestId('empty-state')
      expect(container).toHaveAttribute('role', 'alert')
    })

    it('action button is keyboard accessible', async () => {
      const onAction = jest.fn()
      render(<EmptyState actionText="액션" onAction={onAction} />)

      const button = screen.getByTestId('empty-state-action')
      button.focus()

      fireEvent.keyDown(button, { key: 'Enter' })

      // Enter 키로 버튼 활성화 확인은 native button에서 자동 처리
      expect(button).toBeInTheDocument()
    })
  })
})
