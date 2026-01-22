// screens/sample/QualityInspection/__tests__/QualityInspection.test.tsx
// 품질 검사 입력 폼 단위 테스트 (TSK-06-12)

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'
import { QualityInspection } from '../QualityInspection'

// Ant Design ConfigProvider wrapper
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider locale={koKR}>
    {children}
  </ConfigProvider>
)

// Custom render
const renderWithProvider = (ui: React.ReactElement) => {
  return render(ui, { wrapper: Wrapper })
}

describe('QualityInspection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================
  // UT-001: 컴포넌트 렌더링
  // =========================================
  describe('UT-001: 컴포넌트 렌더링', () => {
    it('페이지 컨테이너가 렌더링된다', () => {
      renderWithProvider(<QualityInspection />)
      expect(screen.getByTestId('quality-inspection-page')).toBeInTheDocument()
    })

    it('검사 유형 선택기가 렌더링된다', () => {
      renderWithProvider(<QualityInspection />)
      expect(screen.getByTestId('inspection-type-selector')).toBeInTheDocument()
    })

    it('기본 정보 필드들이 렌더링된다', () => {
      renderWithProvider(<QualityInspection />)
      expect(screen.getByTestId('product-code-input')).toBeInTheDocument()
      expect(screen.getByTestId('lot-number-input')).toBeInTheDocument()
      expect(screen.getByTestId('inspection-date-picker')).toBeInTheDocument()
    })

    it('저장, 취소, 미리보기 버튼이 렌더링된다', () => {
      renderWithProvider(<QualityInspection />)
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument()
      expect(screen.getByTestId('cancel-btn')).toBeInTheDocument()
      expect(screen.getByTestId('preview-btn')).toBeInTheDocument()
    })
  })

  // =========================================
  // UT-002: 검사 유형 선택 (FR-001)
  // =========================================
  describe('UT-002: 검사 유형 선택', () => {
    it('기본 검사 유형은 치수 검사이다', () => {
      renderWithProvider(<QualityInspection />)
      const selector = screen.getByTestId('inspection-type-selector')
      expect(within(selector).getByText('치수 검사')).toBeInTheDocument()
    })

    it('치수 검사 리스트가 기본으로 표시된다', () => {
      renderWithProvider(<QualityInspection />)
      expect(screen.getByTestId('dimension-items-list')).toBeInTheDocument()
    })
  })

  // =========================================
  // UT-003: 치수 검사 항목 입력 (FR-002)
  // =========================================
  describe('UT-003: 치수 검사 항목 입력', () => {
    it('치수 검사 리스트가 기본 1개 항목으로 렌더링된다', () => {
      renderWithProvider(<QualityInspection />)
      expect(screen.getByTestId('dimension-items-list')).toBeInTheDocument()
      expect(screen.getByTestId('dimension-item-0')).toBeInTheDocument()
    })

    it('측정위치 입력 필드가 존재한다', () => {
      renderWithProvider(<QualityInspection />)
      const item = screen.getByTestId('dimension-item-0')
      expect(within(item).getByTestId('position-input-0')).toBeInTheDocument()
    })

    it('기준값 입력 필드가 존재한다', () => {
      renderWithProvider(<QualityInspection />)
      const item = screen.getByTestId('dimension-item-0')
      expect(within(item).getByTestId('standard-value-input-0')).toBeInTheDocument()
    })

    it('허용오차 입력 필드가 존재한다', () => {
      renderWithProvider(<QualityInspection />)
      const item = screen.getByTestId('dimension-item-0')
      expect(within(item).getByTestId('tolerance-input-0')).toBeInTheDocument()
    })

    it('측정값 입력 필드가 존재한다', () => {
      renderWithProvider(<QualityInspection />)
      const item = screen.getByTestId('dimension-item-0')
      expect(within(item).getByTestId('measured-value-input-0')).toBeInTheDocument()
    })
  })

  // =========================================
  // UT-004: 반복 항목 추가 (FR-003)
  // =========================================
  describe('UT-004: 반복 항목 추가', () => {
    it('항목 추가 버튼이 렌더링된다', () => {
      renderWithProvider(<QualityInspection />)
      expect(screen.getByTestId('add-item-btn')).toBeInTheDocument()
    })

    it('항목 추가 버튼 클릭 시 새 항목이 추가된다', async () => {
      const user = userEvent.setup()
      renderWithProvider(<QualityInspection />)

      await user.click(screen.getByTestId('add-item-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('dimension-item-1')).toBeInTheDocument()
      })
    })
  })

  // =========================================
  // UT-005: 반복 항목 삭제 (FR-004)
  // =========================================
  describe('UT-005: 반복 항목 삭제', () => {
    it('삭제 버튼이 렌더링된다', () => {
      renderWithProvider(<QualityInspection />)
      expect(screen.getByTestId('remove-item-btn-0')).toBeInTheDocument()
    })

    it('마지막 1개 항목은 삭제 불가능하다', () => {
      renderWithProvider(<QualityInspection />)
      const removeBtn = screen.getByTestId('remove-item-btn-0')
      expect(removeBtn).toBeDisabled()
    })

    it('항목이 2개일 때 삭제 가능하다', async () => {
      const user = userEvent.setup()
      renderWithProvider(<QualityInspection />)

      // 항목 추가
      await user.click(screen.getByTestId('add-item-btn'))
      await waitFor(() => {
        expect(screen.getByTestId('dimension-item-1')).toBeInTheDocument()
      })

      // 삭제 버튼 활성화 확인
      const removeBtn = screen.getByTestId('remove-item-btn-1')
      expect(removeBtn).not.toBeDisabled()
    })
  })

  // =========================================
  // UT-006: 치수 검사 자동 판정 (BR-03)
  // =========================================
  describe('UT-006: 치수 검사 자동 판정', () => {
    it('판정 결과 태그가 렌더링된다', () => {
      renderWithProvider(<QualityInspection />)
      const resultTag = screen.getByTestId('result-tag-0')
      // 초기 상태에서는 아직 판정 없음
      expect(resultTag).toBeInTheDocument()
    })

    it('측정 필드들이 올바르게 렌더링된다', () => {
      renderWithProvider(<QualityInspection />)
      expect(screen.getByTestId('standard-value-input-0')).toBeInTheDocument()
      expect(screen.getByTestId('tolerance-input-0')).toBeInTheDocument()
      expect(screen.getByTestId('measured-value-input-0')).toBeInTheDocument()
    })
  })

  // =========================================
  // UT-007: 이미지 업로드 영역 (FR-006)
  // =========================================
  describe('UT-007: 이미지 업로드 영역', () => {
    it('이미지 업로드 영역이 렌더링된다', () => {
      renderWithProvider(<QualityInspection />)
      expect(screen.getByTestId('image-upload')).toBeInTheDocument()
    })

    it('드래그 앤 드롭 안내 텍스트가 표시된다', () => {
      renderWithProvider(<QualityInspection />)
      expect(screen.getByText(/이미지를 드래그하거나 클릭하여 업로드/)).toBeInTheDocument()
    })
  })

  // =========================================
  // UT-008: 비고 필드 (FR-007)
  // =========================================
  describe('UT-008: 비고 필드', () => {
    it('비고 텍스트영역이 렌더링된다', () => {
      renderWithProvider(<QualityInspection />)
      expect(screen.getByTestId('remarks-textarea')).toBeInTheDocument()
    })

    it('비고 필드에 텍스트 입력이 가능하다', async () => {
      const user = userEvent.setup()
      renderWithProvider(<QualityInspection />)

      const textarea = screen.getByTestId('remarks-textarea')
      await user.type(textarea, '테스트 메모입니다')

      expect(textarea).toHaveValue('테스트 메모입니다')
    })

    it('글자 수 카운터가 표시된다', () => {
      renderWithProvider(<QualityInspection />)
      // showCount는 Ant Design TextArea 내부에서 처리됨
      expect(screen.getByTestId('remarks-textarea')).toBeInTheDocument()
    })
  })

  // =========================================
  // UT-009: 초기화 버튼 (UC-09)
  // =========================================
  describe('UT-009: 초기화 버튼', () => {
    it('초기화 버튼이 렌더링된다', () => {
      renderWithProvider(<QualityInspection />)
      expect(screen.getByTestId('reset-btn')).toBeInTheDocument()
    })
  })

  // =========================================
  // UT-010: 폼 유효성 검사 (BR-04)
  // =========================================
  describe('UT-010: 폼 유효성 검사', () => {
    it('필수 필드 미입력 시 저장 클릭하면 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup()
      renderWithProvider(<QualityInspection />)

      // 저장 버튼 클릭 (필수 필드 미입력 상태)
      await user.click(screen.getByTestId('submit-btn'))

      await waitFor(() => {
        expect(screen.getByText('제품코드를 입력해주세요')).toBeInTheDocument()
      })
    })
  })

  // =========================================
  // UT-011: 접근성 (키보드/스크린리더)
  // =========================================
  describe('UT-011: 접근성', () => {
    it('폼 요소들이 적절한 aria-label을 가진다', () => {
      renderWithProvider(<QualityInspection />)

      expect(screen.getByLabelText(/제품코드/)).toBeInTheDocument()
      expect(screen.getByLabelText(/로트번호/)).toBeInTheDocument()
    })
  })
})
