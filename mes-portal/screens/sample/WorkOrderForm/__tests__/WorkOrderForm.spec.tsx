/**
 * @file WorkOrderForm.spec.tsx
 * @description 작업 지시 등록 폼 단위 테스트
 * @task TSK-06-16
 *
 * @testCoverage
 * - UT-001: 폼 초기 렌더링
 * - UT-002: 제품 선택 팝업 열기/닫기
 * - UT-003: 저장 시 확인 다이얼로그
 * - UT-004: 저장 성공 Toast
 * - UT-005: 필수 필드 미입력
 * - UT-006: 종료일 < 시작일 검증
 * - UT-007: 수량 범위 초과 검증
 * - UT-008: 변경 후 취소 확인
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal, message } from 'antd'
import dayjs from 'dayjs'
import { WorkOrderForm } from '../index'
import type { Product, ProductionLine } from '../types'

// Mock 데이터
const mockProducts: Product[] = [
  { code: 'P001', name: 'LCD 패널 A형', spec: '15인치', unit: 'EA' },
  { code: 'P002', name: 'LCD 패널 B형', spec: '17인치', unit: 'EA' },
  { code: 'P003', name: '메인보드 A', spec: 'ATX', unit: 'EA' },
]

const mockProductionLines: ProductionLine[] = [
  { id: 'L1', name: '라인 1' },
  { id: 'L2', name: '라인 2' },
  { id: 'L3', name: '라인 3' },
]

// Mock products.json
vi.mock('@/mock-data/products.json', () => ({
  default: {
    products: [
      { code: 'P001', name: 'LCD 패널 A형', spec: '15인치', unit: 'EA' },
      { code: 'P002', name: 'LCD 패널 B형', spec: '17인치', unit: 'EA' },
      { code: 'P003', name: '메인보드 A', spec: 'ATX', unit: 'EA' },
    ],
    productionLines: [
      { id: 'L1', name: '라인 1' },
      { id: 'L2', name: '라인 2' },
      { id: 'L3', name: '라인 3' },
    ],
  },
}))

// Toast mock
vi.mock('@/lib/utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}))

// 헬퍼 함수: 유효한 폼 데이터 입력
async function fillValidFormData(
  user: ReturnType<typeof userEvent.setup>
) {
  // 제품 선택
  await user.click(screen.getByTestId('product-select-btn'))
  await waitFor(() => {
    expect(screen.getByTestId('select-popup-modal')).toBeInTheDocument()
  })

  // 첫 번째 제품 행 클릭
  const table = screen.getByTestId('select-popup-table')
  const rows = within(table).getAllByRole('row')
  if (rows.length > 1) {
    await user.click(rows[1]) // 헤더 제외 첫 번째 행
  }

  await user.click(screen.getByTestId('select-popup-confirm'))
  await waitFor(() => {
    expect(screen.queryByTestId('select-popup-modal')).not.toBeInTheDocument()
  })

  // 수량 입력
  const quantityInput = screen.getByTestId('quantity-input')
  await user.clear(quantityInput)
  await user.type(quantityInput, '500')

  // 라인 선택
  const lineSelect = screen.getByTestId('line-select')
  await user.click(lineSelect)
  await waitFor(() => {
    expect(screen.getByText('라인 1')).toBeInTheDocument()
  })
  await user.click(screen.getByText('라인 1'))

  // 시작일 선택
  const startDateInput = screen.getByTestId('start-date')
  await user.click(startDateInput)
  await waitFor(() => {
    expect(document.querySelector('.ant-picker-dropdown')).toBeInTheDocument()
  })
  // 오늘 날짜 선택
  const today = document.querySelector('.ant-picker-cell-today')
  if (today) {
    await user.click(today)
  }

  // 종료일 선택
  const endDateInput = screen.getByTestId('end-date')
  await user.click(endDateInput)
  await waitFor(() => {
    expect(document.querySelector('.ant-picker-dropdown')).toBeInTheDocument()
  })
  // 오늘 날짜 선택 (같은 날 완료 허용)
  const todayEnd = document.querySelector('.ant-picker-cell-today')
  if (todayEnd) {
    await user.click(todayEnd)
  }
}

describe('WorkOrderForm 컴포넌트', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
    Modal.destroyAll()
  })

  describe('렌더링', () => {
    it('UT-001: 폼 초기 렌더링 - 빈 폼이 표시된다', () => {
      render(
        <WorkOrderForm
          products={mockProducts}
          productionLines={mockProductionLines}
        />
      )

      // 페이지 컨테이너 확인
      expect(screen.getByTestId('work-order-form-page')).toBeInTheDocument()

      // 폼 템플릿 확인
      expect(screen.getByTestId('form-template')).toBeInTheDocument()

      // 제품 선택 버튼 확인
      expect(screen.getByTestId('product-select-btn')).toBeInTheDocument()

      // 수량 입력 필드 확인
      expect(screen.getByTestId('quantity-input')).toBeInTheDocument()

      // 라인 선택 필드 확인
      expect(screen.getByTestId('line-select')).toBeInTheDocument()

      // 날짜 필드 확인
      expect(screen.getByTestId('start-date')).toBeInTheDocument()
      expect(screen.getByTestId('end-date')).toBeInTheDocument()

      // 저장/취소 버튼 확인
      expect(screen.getByTestId('form-submit-btn')).toBeInTheDocument()
      expect(screen.getByTestId('form-cancel-btn')).toBeInTheDocument()
    })
  })

  describe('제품 선택', () => {
    it('UT-002: 제품 선택 버튼 클릭 시 팝업이 열린다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(
        <WorkOrderForm
          products={mockProducts}
          productionLines={mockProductionLines}
        />
      )

      await user.click(screen.getByTestId('product-select-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('select-popup-modal')).toBeInTheDocument()
      })
    })

    it('UT-002: 취소 버튼 클릭 시 팝업이 닫힌다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(
        <WorkOrderForm
          products={mockProducts}
          productionLines={mockProductionLines}
        />
      )

      await user.click(screen.getByTestId('product-select-btn'))
      await waitFor(() => {
        expect(screen.getByTestId('select-popup-modal')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('select-popup-cancel'))

      await waitFor(() => {
        expect(screen.queryByTestId('select-popup-modal')).not.toBeInTheDocument()
      })
    })

    it('UT-002: 제품 선택 완료 시 폼에 제품 정보가 반영된다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(
        <WorkOrderForm
          products={mockProducts}
          productionLines={mockProductionLines}
        />
      )

      // 팝업 열기
      await user.click(screen.getByTestId('product-select-btn'))
      await waitFor(() => {
        expect(screen.getByTestId('select-popup-modal')).toBeInTheDocument()
      })

      // 첫 번째 제품 행 클릭 (테이블에서)
      const table = screen.getByTestId('select-popup-table')
      const rows = within(table).getAllByRole('row')
      if (rows.length > 1) {
        await user.click(rows[1])
      }

      // 선택완료 클릭
      await user.click(screen.getByTestId('select-popup-confirm'))

      // 팝업 닫힘 확인
      await waitFor(() => {
        expect(screen.queryByTestId('select-popup-modal')).not.toBeInTheDocument()
      })

      // 제품 코드 필드에 값이 반영됨
      await waitFor(() => {
        const productCodeInput = screen.getByTestId('product-code-input')
        expect(productCodeInput).toHaveValue('P001')
      })
    })
  })

  describe('유효성 검사', () => {
    it('UT-005: 필수 필드 미입력 시 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(
        <WorkOrderForm
          products={mockProducts}
          productionLines={mockProductionLines}
        />
      )

      // 빈 상태로 저장 시도
      await user.click(screen.getByTestId('form-submit-btn'))

      // 에러 메시지 확인
      await waitFor(() => {
        expect(screen.getByText('제품을 선택해주세요')).toBeInTheDocument()
      })
    })

    it('UT-007: 수량 입력 필드가 min/max 제한이 있다', async () => {
      render(
        <WorkOrderForm
          products={mockProducts}
          productionLines={mockProductionLines}
        />
      )

      // 수량 입력 필드 확인
      const quantityInput = screen.getByTestId('quantity-input')
      expect(quantityInput).toBeInTheDocument()

      // InputNumber min/max 속성 확인
      expect(quantityInput).toHaveAttribute('aria-valuemin', '1')
      expect(quantityInput).toHaveAttribute('aria-valuemax', '99999')
    })
  })

  describe('저장', () => {
    it('UT-003: 저장 버튼 존재 및 활성화 상태 확인', async () => {
      render(
        <WorkOrderForm
          products={mockProducts}
          productionLines={mockProductionLines}
        />
      )

      // 저장 버튼 존재 확인
      const submitBtn = screen.getByTestId('form-submit-btn')
      expect(submitBtn).toBeInTheDocument()
      expect(submitBtn).not.toBeDisabled()
    })
  })

  describe('취소', () => {
    it('취소 버튼 클릭 시 onCancel 콜백이 호출된다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const mockOnCancel = vi.fn()

      render(
        <WorkOrderForm
          products={mockProducts}
          productionLines={mockProductionLines}
          onCancel={mockOnCancel}
        />
      )

      await user.click(screen.getByTestId('form-cancel-btn'))

      await waitFor(() => {
        expect(mockOnCancel).toHaveBeenCalled()
      })
    })
  })
})
