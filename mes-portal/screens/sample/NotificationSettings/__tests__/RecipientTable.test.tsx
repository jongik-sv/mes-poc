// RecipientTable.test.tsx
// TSK-06-19: 수신자 테이블 컴포넌트 단위 테스트

import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RecipientTable from '../RecipientTable'
import type { NotificationRecipient } from '../types'

const mockRecipients: NotificationRecipient[] = [
  { id: 'r1', name: '홍길동', email: 'hong@company.com' },
  { id: 'r2', name: '김철수', email: 'kim@company.com' },
  { id: 'r3', name: '이영희', email: 'lee@company.com' },
]

describe('RecipientTable', () => {
  const defaultProps = {
    recipients: mockRecipients,
    onAdd: vi.fn(),
    onDelete: vi.fn(),
    onChange: vi.fn(),
    emailErrors: {},
  }

  // UT-003: 수신자 추가
  it('should call onAdd when add button clicked', async () => {
    const user = userEvent.setup()
    const mockOnAdd = vi.fn()

    render(<RecipientTable {...defaultProps} onAdd={mockOnAdd} />)

    // 수신자 추가 버튼 클릭
    const addBtn = screen.getByTestId('add-recipient-btn')
    await user.click(addBtn)

    // onAdd 콜백 호출 확인
    expect(mockOnAdd).toHaveBeenCalled()
  })

  // UT-004: 수신자 삭제
  it('should call onDelete when delete button clicked', async () => {
    const user = userEvent.setup()
    const mockOnDelete = vi.fn()

    render(<RecipientTable {...defaultProps} onDelete={mockOnDelete} />)

    // 삭제 버튼들 가져오기
    const deleteButtons = screen.getAllByTestId('delete-recipient-btn')
    await user.click(deleteButtons[0])

    // onDelete 콜백 호출 확인
    expect(mockOnDelete).toHaveBeenCalledWith('r1')
  })

  it('should render all recipients', () => {
    render(<RecipientTable {...defaultProps} />)

    // 수신자 테이블 확인
    expect(screen.getByTestId('recipient-table')).toBeInTheDocument()

    // 3명 수신자 이름 표시 확인
    expect(screen.getByDisplayValue('홍길동')).toBeInTheDocument()
    expect(screen.getByDisplayValue('김철수')).toBeInTheDocument()
    expect(screen.getByDisplayValue('이영희')).toBeInTheDocument()
  })

  it('should call onChange when name input changed', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    render(<RecipientTable {...defaultProps} onChange={mockOnChange} />)

    // 이름 입력 필드 가져오기
    const nameInput = screen.getByDisplayValue('홍길동')
    await user.clear(nameInput)
    await user.type(nameInput, '박신입')

    // onChange 콜백 호출 확인
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should call onChange when email input changed', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    render(<RecipientTable {...defaultProps} onChange={mockOnChange} />)

    // 이메일 입력 필드 가져오기
    const emailInput = screen.getByDisplayValue('hong@company.com')
    await user.clear(emailInput)
    await user.type(emailInput, 'park@company.com')

    // onChange 콜백 호출 확인
    expect(mockOnChange).toHaveBeenCalled()
  })

  // UT-008: 이메일 중복 에러
  it('should show error for duplicate email', () => {
    const emailErrors = { r2: '이미 등록된 이메일입니다' }

    render(<RecipientTable {...defaultProps} emailErrors={emailErrors} />)

    // 에러 메시지 표시 확인
    expect(screen.getByTestId('email-error')).toHaveTextContent(
      '이미 등록된 이메일입니다'
    )
  })

  it('should display empty state when no recipients', () => {
    render(<RecipientTable {...defaultProps} recipients={[]} />)

    // 빈 상태 메시지 확인
    expect(screen.getByText('등록된 수신자가 없습니다')).toBeInTheDocument()
  })

  it('should have accessible delete buttons', () => {
    render(<RecipientTable {...defaultProps} />)

    const deleteButtons = screen.getAllByTestId('delete-recipient-btn')
    expect(deleteButtons[0]).toHaveAttribute('aria-label', '홍길동 수신자 삭제')
  })

  it('should focus new row when added', async () => {
    const recipientsWithNew: NotificationRecipient[] = [
      ...mockRecipients,
      { id: 'r4', name: '', email: '', isNew: true },
    ]

    render(<RecipientTable {...defaultProps} recipients={recipientsWithNew} />)

    // 새 행의 이름 입력 필드 확인
    expect(screen.getByTestId('recipient-name-input')).toBeInTheDocument()
    expect(screen.getByTestId('recipient-email-input')).toBeInTheDocument()
  })
})
