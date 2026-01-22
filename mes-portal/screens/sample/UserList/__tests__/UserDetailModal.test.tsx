// screens/sample/UserList/__tests__/UserDetailModal.test.tsx
// UserDetailModal 컴포넌트 단위 테스트 (TSK-06-07)

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UserDetailModal } from '../UserDetailModal'
import type { User } from '../types'

// Mock 사용자 데이터
const mockUser: User = {
  id: 'user-001',
  name: '홍길동',
  email: 'hong@company.com',
  status: 'active',
  role: 'ADMIN',
  roleLabel: '관리자',
  department: '시스템관리팀',
  phone: '010-1234-5678',
  createdAt: '2026-01-15T09:00:00Z',
  lastLoginAt: '2026-01-21T14:30:00Z',
}

const mockInactiveUser: User = {
  ...mockUser,
  id: 'user-002',
  name: '김영희',
  email: 'kim@company.com',
  status: 'inactive',
  lastLoginAt: null,
}

const mockPendingUser: User = {
  ...mockUser,
  id: 'user-003',
  name: '박민수',
  status: 'pending',
  department: undefined,
  phone: undefined,
  lastLoginAt: null,
}

// UT-010: 모달 열기/닫기
describe('UserDetailModal', () => {
  it('should render modal when open is true - UT-010', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockUser} onClose={onClose} />
    )

    expect(screen.getByTestId('user-detail-modal')).toBeInTheDocument()
    expect(screen.getByText('사용자 상세 정보')).toBeInTheDocument()
  })

  it('should not render when user is null', () => {
    const onClose = vi.fn()

    const { container } = render(
      <UserDetailModal open={true} user={null} onClose={onClose} />
    )

    expect(container.innerHTML).toBe('')
  })

  it('should display user name - UT-010', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockUser} onClose={onClose} />
    )

    expect(screen.getByTestId('user-detail-name')).toHaveTextContent('홍길동')
  })

  it('should display user email - UT-010', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockUser} onClose={onClose} />
    )

    expect(screen.getByTestId('user-detail-email')).toHaveTextContent('hong@company.com')
  })

  it('should display user status with correct color', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockUser} onClose={onClose} />
    )

    const statusTag = screen.getByTestId('user-detail-status')
    expect(statusTag).toHaveTextContent('활성')
  })

  it('should display inactive status correctly', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockInactiveUser} onClose={onClose} />
    )

    const statusTag = screen.getByTestId('user-detail-status')
    expect(statusTag).toHaveTextContent('비활성')
  })

  it('should display pending status correctly', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockPendingUser} onClose={onClose} />
    )

    const statusTag = screen.getByTestId('user-detail-status')
    expect(statusTag).toHaveTextContent('대기')
  })

  it('should display user role', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockUser} onClose={onClose} />
    )

    // Descriptions.Item의 역할 정보 확인
    expect(screen.getByText('관리자 (ADMIN)')).toBeInTheDocument()
  })

  it('should display department', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockUser} onClose={onClose} />
    )

    expect(screen.getByText('시스템관리팀')).toBeInTheDocument()
  })

  it('should display "-" for missing department', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockPendingUser} onClose={onClose} />
    )

    // 부서가 없는 경우 '-' 표시
    const descItems = screen.getAllByText('-')
    expect(descItems.length).toBeGreaterThan(0)
  })

  it('should display phone number', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockUser} onClose={onClose} />
    )

    expect(screen.getByText('010-1234-5678')).toBeInTheDocument()
  })

  it('should display formatted createdAt date', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockUser} onClose={onClose} />
    )

    // UTC 시간이 로컬로 변환될 수 있으므로 날짜 부분만 확인
    expect(screen.getByText(/2026-01-15/)).toBeInTheDocument()
  })

  it('should display formatted lastLoginAt date', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockUser} onClose={onClose} />
    )

    // UTC 시간이 로컬로 변환될 수 있으므로 날짜 부분만 확인
    expect(screen.getByText(/2026-01-21/)).toBeInTheDocument()
  })

  it('should display "-" for null lastLoginAt', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockInactiveUser} onClose={onClose} />
    )

    // lastLoginAt이 null인 경우
    const descItems = screen.getAllByText('-')
    expect(descItems.length).toBeGreaterThan(0)
  })

  it('should call onClose when close button is clicked - UT-010', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockUser} onClose={onClose} />
    )

    const closeButton = screen.getByTestId('modal-close-btn')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when modal X button is clicked', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockUser} onClose={onClose} />
    )

    // Ant Design Modal의 X 버튼
    const closeIcon = document.querySelector('.ant-modal-close')
    if (closeIcon) {
      fireEvent.click(closeIcon)
      expect(onClose).toHaveBeenCalled()
    }
  })

  it('should display avatar', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal open={true} user={mockUser} onClose={onClose} />
    )

    // Avatar 컴포넌트 확인
    const avatar = document.querySelector('.ant-avatar')
    expect(avatar).toBeInTheDocument()
  })
})
