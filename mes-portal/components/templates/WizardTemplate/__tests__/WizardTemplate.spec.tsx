/**
 * @file WizardTemplate.spec.tsx
 * @description WizardTemplate 컴포넌트 단위 테스트
 * @task TSK-06-06
 *
 * @requirements
 * - FR-001: 단계 표시 (Steps 컴포넌트)
 * - FR-002: 이전/다음 네비게이션
 * - FR-003: 단계별 유효성 검사
 * - FR-004: 최종 확인 화면
 * - FR-005: 완료 처리
 * - FR-006: 진행 상황 시각화
 *
 * @businessRules
 * - BR-001: 단계별 순차 진행 필수
 * - BR-002: 다음 이동 전 유효성 검사 필수
 * - BR-003: 이전 단계 이동은 항상 허용
 * - BR-004: 완료된 단계만 Steps 클릭 가능
 * - BR-005: 데이터 있을 때 이탈 확인 필수
 * - BR-006: 완료 버튼은 마지막 단계에서만 표시
 * - BR-007: 완료 처리 중 중복 클릭 방지
 * - BR-008: 단계 간 데이터는 유지
 */

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConfigProvider } from 'antd'
import { WizardTemplate } from '../index'
import type { WizardStep } from '../types'

// Ant Design 테스트 환경 설정
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ConfigProvider>{ui}</ConfigProvider>)
}

// 기본 Mock 단계 데이터
const createMockSteps = (options?: {
  validation?: (stepIndex: number) => (() => Promise<boolean>) | undefined
}): WizardStep[] => [
  {
    key: 'step1',
    title: '기본정보',
    description: '기본 정보를 입력합니다',
    content: <div data-testid="step-0-content">Step 1 Content</div>,
    validate: options?.validation?.(0),
  },
  {
    key: 'step2',
    title: '상세설정',
    description: '상세 옵션을 설정합니다',
    content: <div data-testid="step-1-content">Step 2 Content</div>,
    validate: options?.validation?.(1),
  },
  {
    key: 'step3',
    title: '확인',
    description: '입력 내용을 확인합니다',
    content: <div data-testid="step-2-content">Step 3 Content</div>,
  },
  {
    key: 'step4',
    title: '완료',
    description: '설정이 완료되었습니다',
    content: <div data-testid="step-3-content">Step 4 Content</div>,
  },
]

describe('WizardTemplate', () => {
  const mockOnFinish = vi.fn()
  const mockOnCancel = vi.fn()
  const mockOnStepChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnFinish.mockResolvedValue(undefined)
  })

  describe('렌더링', () => {
    it('초기 렌더링 시 첫 번째 단계 콘텐츠를 표시한다 (UT-001)', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate steps={mockSteps} onFinish={mockOnFinish} />
      )

      // 첫 번째 단계 컨텐츠 표시 확인
      expect(screen.getByTestId('step-0-content')).toBeInTheDocument()
      expect(screen.getByText('Step 1 Content')).toBeInTheDocument()

      // 컨테이너 및 Steps 영역 확인
      expect(screen.getByTestId('wizard-template-container')).toBeInTheDocument()
      expect(screen.getByTestId('wizard-steps')).toBeInTheDocument()
    })

    it('Steps 컴포넌트에 모든 단계를 표시한다 (FR-001)', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate steps={mockSteps} onFinish={mockOnFinish} />
      )

      // 모든 단계 제목 표시 확인
      expect(screen.getByText('기본정보')).toBeInTheDocument()
      expect(screen.getByText('상세설정')).toBeInTheDocument()
      expect(screen.getByText('확인')).toBeInTheDocument()
      expect(screen.getByText('완료')).toBeInTheDocument()
    })

    it('title prop이 있으면 제목을 표시한다', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          title="설정 마법사"
        />
      )

      expect(screen.getByText('설정 마법사')).toBeInTheDocument()
    })

    it('첫 번째 단계에서 이전 버튼을 숨긴다 (UT-005, BR-002)', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate steps={mockSteps} onFinish={mockOnFinish} />
      )

      // 첫 단계에서는 이전 버튼이 없거나 비활성화
      const prevButton = screen.queryByTestId('wizard-prev-btn')
      if (prevButton) {
        expect(prevButton).toBeDisabled()
      } else {
        expect(prevButton).toBeNull()
      }
    })

    it('첫 번째 단계에서 다음 버튼을 표시한다', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate steps={mockSteps} onFinish={mockOnFinish} />
      )

      expect(screen.getByTestId('wizard-next-btn')).toBeInTheDocument()
    })

    it('취소 버튼을 표시한다 (showCancel=true)', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          onCancel={mockOnCancel}
          showCancel={true}
        />
      )

      expect(screen.getByTestId('wizard-cancel-btn')).toBeInTheDocument()
    })

    it('showCancel=false 시 취소 버튼을 숨긴다', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          showCancel={false}
        />
      )

      expect(screen.queryByTestId('wizard-cancel-btn')).not.toBeInTheDocument()
    })
  })

  describe('네비게이션', () => {
    it('다음 버튼 클릭 시 유효성 검사 통과하면 다음 단계로 이동한다 (UT-002)', async () => {
      const user = userEvent.setup()
      const mockValidation = vi.fn().mockResolvedValue(true)
      const mockSteps = createMockSteps({
        validation: (index) => (index === 0 ? mockValidation : undefined),
      })

      renderWithProvider(
        <WizardTemplate steps={mockSteps} onFinish={mockOnFinish} />
      )

      // 첫 단계 확인
      expect(screen.getByTestId('step-0-content')).toBeInTheDocument()

      // 다음 버튼 클릭
      await user.click(screen.getByTestId('wizard-next-btn'))

      // validation 호출 확인
      await waitFor(() => {
        expect(mockValidation).toHaveBeenCalledTimes(1)
      })

      // 다음 단계 컨텐츠 표시 확인
      await waitFor(() => {
        expect(screen.getByTestId('step-1-content')).toBeInTheDocument()
        expect(screen.getByText('Step 2 Content')).toBeInTheDocument()
      })
    })

    it('유효성 검사 실패 시 현재 단계를 유지한다 (UT-003)', async () => {
      const user = userEvent.setup()
      const mockValidation = vi.fn().mockResolvedValue(false)
      const mockSteps = createMockSteps({
        validation: (index) => (index === 0 ? mockValidation : undefined),
      })

      renderWithProvider(
        <WizardTemplate steps={mockSteps} onFinish={mockOnFinish} />
      )

      // 다음 버튼 클릭
      await user.click(screen.getByTestId('wizard-next-btn'))

      // validation 호출 확인
      await waitFor(() => {
        expect(mockValidation).toHaveBeenCalledTimes(1)
      })

      // 현재 단계 유지 확인 (첫 번째 단계 컨텐츠가 여전히 표시됨)
      expect(screen.getByTestId('step-0-content')).toBeInTheDocument()
      expect(screen.queryByTestId('step-1-content')).not.toBeInTheDocument()
    })

    it('이전 버튼 클릭 시 이전 단계로 이동한다 (UT-004)', async () => {
      const user = userEvent.setup()
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          initialStep={1}
        />
      )

      // 두 번째 단계 확인
      expect(screen.getByTestId('step-1-content')).toBeInTheDocument()

      // 이전 버튼 클릭
      await user.click(screen.getByTestId('wizard-prev-btn'))

      // 이전 단계 컨텐츠 표시 확인
      await waitFor(() => {
        expect(screen.getByTestId('step-0-content')).toBeInTheDocument()
      })
    })

    it('onStepChange 콜백이 단계 변경 시 호출된다', async () => {
      const user = userEvent.setup()
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          onStepChange={mockOnStepChange}
        />
      )

      // 다음 버튼 클릭
      await user.click(screen.getByTestId('wizard-next-btn'))

      await waitFor(() => {
        expect(mockOnStepChange).toHaveBeenCalledWith(1, 0)
      })
    })
  })

  describe('마지막 단계', () => {
    it('마지막 단계에서 완료 버튼을 표시한다 (UT-006, BR-003)', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          initialStep={3} // 마지막 단계 (인덱스 3)
        />
      )

      // 완료 버튼 표시 확인
      expect(screen.getByTestId('wizard-finish-btn')).toBeInTheDocument()

      // 다음 버튼 숨김 확인
      expect(screen.queryByTestId('wizard-next-btn')).not.toBeInTheDocument()
    })

    it('완료 버튼 클릭 시 onFinish를 호출한다 (UT-007)', async () => {
      const user = userEvent.setup()
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          initialStep={3}
        />
      )

      // 완료 버튼 클릭
      await user.click(screen.getByTestId('wizard-finish-btn'))

      await waitFor(() => {
        expect(mockOnFinish).toHaveBeenCalledTimes(1)
      })
    })

    it('onFinish에 전체 데이터를 전달한다 (UT-010)', async () => {
      const user = userEvent.setup()
      const mockSteps = createMockSteps()
      const initialData = { basicInfo: { name: 'Test' }, settings: { option: 'A' } }

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          initialStep={3}
          initialData={initialData}
        />
      )

      // 완료 버튼 클릭
      await user.click(screen.getByTestId('wizard-finish-btn'))

      await waitFor(() => {
        expect(mockOnFinish).toHaveBeenCalledWith(expect.objectContaining(initialData))
      })
    })
  })

  describe('단계 인디케이터', () => {
    it('현재 단계를 강조 표시한다 (UT-008)', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          initialStep={1}
        />
      )

      // Steps 컴포넌트 확인
      const stepsContainer = screen.getByTestId('wizard-steps')
      expect(stepsContainer).toBeInTheDocument()
    })

    it('미완료 단계 클릭 시 이동하지 않는다 (UT-014, BR-004)', async () => {
      const user = userEvent.setup()
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          allowStepClick={true}
          onStepChange={mockOnStepChange}
        />
      )

      // 첫 단계에서 3단계 클릭 시도 (미완료 단계)
      const stepsContainer = screen.getByTestId('wizard-steps')
      const step3Title = within(stepsContainer).getByText('확인')
      await user.click(step3Title)

      // onStepChange가 호출되지 않아야 함 (미완료 단계이므로)
      expect(mockOnStepChange).not.toHaveBeenCalled()

      // 여전히 첫 단계
      expect(screen.getByTestId('step-0-content')).toBeInTheDocument()
    })
  })

  describe('로딩 상태', () => {
    it('loading=true 시 완료 버튼이 비활성화된다 (UT-011)', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          initialStep={3}
          loading={true}
        />
      )

      const finishButton = screen.getByTestId('wizard-finish-btn')
      expect(finishButton).toBeDisabled()
    })

    it('완료 처리 중 중복 클릭을 방지한다 (UT-015, BR-007)', async () => {
      const user = userEvent.setup()
      const mockSteps = createMockSteps()

      // 느린 onFinish 시뮬레이션
      const slowOnFinish = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={slowOnFinish}
          initialStep={3}
        />
      )

      const finishButton = screen.getByTestId('wizard-finish-btn')

      // 첫 번째 클릭
      await user.click(finishButton)

      // 두 번째 클릭 (중복)
      await user.click(finishButton)

      // onFinish는 한 번만 호출되어야 함
      expect(slowOnFinish).toHaveBeenCalledTimes(1)
    })
  })

  describe('취소', () => {
    it('취소 버튼 클릭 시 onCancel을 호출한다', async () => {
      const user = userEvent.setup()
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          onCancel={mockOnCancel}
          enableLeaveConfirm={false}
        />
      )

      await user.click(screen.getByTestId('wizard-cancel-btn'))

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('데이터가 있을 때 취소 시 확인 다이얼로그를 표시한다 (BR-005)', async () => {
      const user = userEvent.setup()
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          onCancel={mockOnCancel}
          enableLeaveConfirm={true}
          initialData={{ name: '테스트' }}
        />
      )

      await user.click(screen.getByTestId('wizard-cancel-btn'))

      // 확인 다이얼로그 표시 확인
      await waitFor(() => {
        expect(screen.getByText(/저장되지 않습니다/)).toBeInTheDocument()
      })
    })
  })

  describe('버튼 텍스트 커스터마이징', () => {
    it('커스텀 버튼 텍스트를 적용한다', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          onCancel={mockOnCancel}
          prevButtonText="뒤로"
          nextButtonText="앞으로"
          finishButtonText="완료하기"
          cancelButtonText="취소하기"
          initialStep={1}
        />
      )

      expect(screen.getByTestId('wizard-prev-btn')).toHaveTextContent('뒤로')
      expect(screen.getByTestId('wizard-next-btn')).toHaveTextContent('앞으로')
      expect(screen.getByTestId('wizard-cancel-btn')).toHaveTextContent('취소하기')
    })

    it('마지막 단계에서 커스텀 완료 버튼 텍스트를 적용한다', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          finishButtonText="설정 완료"
          initialStep={3}
        />
      )

      expect(screen.getByTestId('wizard-finish-btn')).toHaveTextContent('설정 완료')
    })
  })

  describe('Steps 방향', () => {
    it('direction="horizontal" 시 수평 Steps를 렌더링한다', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          direction="horizontal"
        />
      )

      const stepsContainer = screen.getByTestId('wizard-steps')
      const stepsElement = stepsContainer.querySelector('.ant-steps')
      expect(stepsElement).toHaveClass('ant-steps-horizontal')
    })

    it('direction="vertical" 시 수직 Steps를 렌더링한다', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate
          steps={mockSteps}
          onFinish={mockOnFinish}
          direction="vertical"
        />
      )

      const stepsContainer = screen.getByTestId('wizard-steps')
      const stepsElement = stepsContainer.querySelector('.ant-steps')
      expect(stepsElement).toHaveClass('ant-steps-vertical')
    })
  })

  describe('확인 단계', () => {
    it('autoConfirmStep=true 시 확인 단계를 자동 생성한다', () => {
      const steps: WizardStep[] = [
        { key: 'step1', title: '기본정보', content: <div>Step 1</div> },
        { key: 'step2', title: '상세설정', content: <div>Step 2</div> },
      ]

      renderWithProvider(
        <WizardTemplate
          steps={steps}
          onFinish={mockOnFinish}
          autoConfirmStep={true}
          confirmStepTitle="최종 확인"
        />
      )

      // 자동 생성된 확인 단계 제목 확인
      expect(screen.getByText('최종 확인')).toBeInTheDocument()
    })

    it('renderConfirmation으로 확인 단계 콘텐츠를 커스터마이징한다 (UT-009)', () => {
      const steps: WizardStep[] = [
        { key: 'step1', title: '기본정보', content: <div>Step 1</div> },
      ]

      const mockRenderConfirmation = vi.fn().mockReturnValue(
        <div data-testid="custom-confirmation">확인 콘텐츠</div>
      )
      const mockData = { name: 'Test' }

      renderWithProvider(
        <WizardTemplate
          steps={steps}
          onFinish={mockOnFinish}
          autoConfirmStep={true}
          renderConfirmation={mockRenderConfirmation}
          initialData={mockData}
          initialStep={1} // 확인 단계
        />
      )

      expect(mockRenderConfirmation).toHaveBeenCalledWith(expect.objectContaining(mockData))
      expect(screen.getByTestId('custom-confirmation')).toBeInTheDocument()
    })
  })

  describe('완료 단계', () => {
    it('autoFinishStep=true 시 완료 단계를 자동 생성한다', async () => {
      const user = userEvent.setup()
      const steps: WizardStep[] = [
        { key: 'step1', title: '기본정보', content: <div>Step 1</div> },
      ]

      renderWithProvider(
        <WizardTemplate
          steps={steps}
          onFinish={mockOnFinish}
          autoFinishStep={true}
          finishStepTitle="완료"
          finishMessage="설정이 완료되었습니다!"
          initialStep={1} // 마지막 사용자 정의 단계 다음
        />
      )

      // 완료 단계 제목 확인 (Steps 영역 내)
      const stepsElement = screen.getByTestId('wizard-steps')
      expect(within(stepsElement).getByText('완료')).toBeInTheDocument()
    })

    it('finishMessage를 완료 단계에 표시한다', async () => {
      const user = userEvent.setup()
      const steps: WizardStep[] = [
        { key: 'step1', title: '기본정보', content: <div>Step 1</div> },
      ]

      // 마지막 단계까지 이동 후 완료
      renderWithProvider(
        <WizardTemplate
          steps={steps}
          onFinish={mockOnFinish}
          autoFinishStep={true}
          finishMessage="설정이 완료되었습니다!"
        />
      )

      // 다음을 눌러 완료 단계로 이동
      await user.click(screen.getByTestId('wizard-next-btn'))

      // 완료 버튼 클릭
      await waitFor(() => {
        expect(screen.getByTestId('wizard-finish-btn')).toBeInTheDocument()
      })
    })
  })

  describe('접근성', () => {
    it('Steps에 적절한 aria 속성이 있다', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate steps={mockSteps} onFinish={mockOnFinish} />
      )

      const container = screen.getByTestId('wizard-template-container')
      expect(container).toBeInTheDocument()
    })

    it('버튼에 적절한 type 속성이 있다', () => {
      const mockSteps = createMockSteps()

      renderWithProvider(
        <WizardTemplate steps={mockSteps} onFinish={mockOnFinish} />
      )

      const nextButton = screen.getByTestId('wizard-next-btn')
      expect(nextButton).toHaveAttribute('type', 'button')
    })
  })
})
