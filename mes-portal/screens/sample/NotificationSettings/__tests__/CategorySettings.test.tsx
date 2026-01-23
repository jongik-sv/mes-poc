// CategorySettings.test.tsx
// TSK-06-19: 카테고리 설정 컴포넌트 단위 테스트

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CategorySettings from '../CategorySettings'
import type { NotificationCategory } from '../types'

const mockCategories: NotificationCategory[] = [
  {
    id: 'production',
    name: '생산 알림',
    description: '생산 시작/완료, 목표 달성, 지연 경고',
    enabled: true,
  },
  {
    id: 'quality',
    name: '품질 알림',
    description: '품질 이상, 검사 완료, 불량률 초과',
    enabled: false,
  },
]

describe('CategorySettings', () => {
  // UT-002: Switch 토글 상태 변경
  it('should toggle switch and call onChange', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    render(
      <CategorySettings categories={mockCategories} onChange={mockOnChange} />
    )

    // 생산 알림 Switch 클릭
    const productionSwitch = screen.getByTestId('category-switch-production')
    await user.click(productionSwitch)

    // onChange 콜백 호출 확인
    expect(mockOnChange).toHaveBeenCalledWith('production', false)
  })

  it('should render all categories', () => {
    const mockOnChange = vi.fn()

    render(
      <CategorySettings categories={mockCategories} onChange={mockOnChange} />
    )

    // 카테고리 섹션 확인
    expect(screen.getByTestId('category-settings')).toBeInTheDocument()

    // 모든 카테고리 이름 표시 확인
    expect(screen.getByTestId('category-name-production')).toHaveTextContent('생산 알림')
    expect(screen.getByTestId('category-name-quality')).toHaveTextContent('품질 알림')
  })

  it('should show correct initial switch states', () => {
    const mockOnChange = vi.fn()

    render(
      <CategorySettings categories={mockCategories} onChange={mockOnChange} />
    )

    // 생산 알림: enabled=true → 체크됨
    expect(screen.getByTestId('category-switch-production')).toBeChecked()

    // 품질 알림: enabled=false → 체크 안됨
    expect(screen.getByTestId('category-switch-quality')).not.toBeChecked()
  })

  it('should display category descriptions', () => {
    const mockOnChange = vi.fn()

    render(
      <CategorySettings categories={mockCategories} onChange={mockOnChange} />
    )

    expect(screen.getByText('생산 시작/완료, 목표 달성, 지연 경고')).toBeInTheDocument()
    expect(screen.getByText('품질 이상, 검사 완료, 불량률 초과')).toBeInTheDocument()
  })

  it('should have accessible switch labels', () => {
    const mockOnChange = vi.fn()

    render(
      <CategorySettings categories={mockCategories} onChange={mockOnChange} />
    )

    const productionSwitch = screen.getByTestId('category-switch-production')
    expect(productionSwitch).toHaveAttribute('aria-label', '생산 알림 알림 활성화')
  })
})
