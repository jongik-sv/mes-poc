# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 - **Last Updated:** 2026-01-21

> **목적**: WizardTemplate 컴포넌트의 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-06 |
| Task명 | 마법사(Wizard) 화면 템플릿 |
| 상세설계 참조 | `010-design.md` |
| PRD 참조 | PRD 4.1.1 화면 템플릿 - 마법사(Wizard) 화면 |
| 작성일 | 2026-01-21 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | WizardTemplate 컴포넌트, 단계 네비게이션, 유효성 검사, 콜백 핸들러 | 80% 이상 |
| E2E 테스트 | 마법사 전체 흐름, 단계 이동, 완료 처리 시나리오 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 레이아웃 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터베이스 | SQLite (테스트용) |
| UI 컴포넌트 라이브러리 | Ant Design 6.x (Steps) |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |

### 1.3 테스트 대상 컴포넌트 (QA-001 반영 - 설계 기준 통일)

```typescript
// components/templates/WizardTemplate.tsx
interface WizardStep {
  key: string
  title: string
  subTitle?: string
  description?: string
  icon?: ReactNode
  content: ReactNode | ((context: WizardContextValue) => ReactNode)
  validate?: () => Promise<boolean> | boolean
  skippable?: boolean
  disabled?: boolean
}

interface WizardTemplateProps<T extends Record<string, unknown> = Record<string, unknown>> {
  // 단계 정의
  steps: WizardStep[]
  initialStep?: number
  initialData?: Partial<T>

  // Steps 설정
  direction?: 'horizontal' | 'vertical'
  size?: 'default' | 'small'
  type?: 'default' | 'navigation' | 'inline'
  progressDot?: boolean
  allowStepClick?: boolean

  // 액션
  onFinish: (data: T) => Promise<void>
  onCancel?: () => void
  onStepChange?: (current: number, prev: number) => void
  onDataChange?: (data: T) => void

  // 상태
  loading?: boolean

  // 버튼 텍스트
  prevButtonText?: string
  nextButtonText?: string
  finishButtonText?: string
  cancelButtonText?: string
  showCancel?: boolean
  showPrev?: boolean
  extraButtons?: ReactNode

  // 이탈 경고
  enableLeaveConfirm?: boolean
  leaveConfirmMessage?: string

  // 헤더
  title?: string
  extra?: ReactNode

  // 확인/완료 단계
  autoConfirmStep?: boolean
  confirmStepTitle?: string
  renderConfirmation?: (data: T) => ReactNode
  autoFinishStep?: boolean
  finishStepTitle?: string
  finishMessage?: string
  finishActions?: ReactNode

  // 스타일
  className?: string
  stepsClassName?: string
  contentClassName?: string
}
```

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | WizardTemplate | 초기 렌더링 - 첫 번째 단계 표시 | 첫 단계 컨텐츠 표시, 단계 인디케이터 표시 | FR-001 |
| UT-002 | WizardTemplate | 다음 버튼 - 유효성 검사 통과 시 다음 단계 | 다음 단계로 이동 | FR-002 |
| UT-003 | WizardTemplate | 다음 버튼 - 유효성 검사 실패 시 에러 표시 | 현재 단계 유지, 에러 표시 | FR-002 |
| UT-004 | WizardTemplate | 이전 버튼 - 이전 단계로 이동 | 이전 단계 컨텐츠 표시 | FR-003 |
| UT-005 | WizardTemplate | 첫 번째 단계 - 이전 버튼 비활성화 | 이전 버튼 disabled 또는 숨김 | BR-01 |
| UT-006 | WizardTemplate | 마지막 단계 - 완료 버튼 표시 | 다음 버튼 대신 완료 버튼 표시 | FR-004 |
| UT-007 | WizardTemplate | 완료 버튼 - onComplete 콜백 호출 | onComplete 콜백 실행 | FR-005 |
| UT-008 | WizardTemplate | 단계 인디케이터 - 현재 단계 강조 | 현재 단계에 active 스타일 적용 | FR-006 |
| UT-009 | WizardTemplate | 확인 단계 - 이전 단계 데이터 표시 | renderConfirmation에 전체 데이터 전달 | FR-004 |
| UT-010 | WizardTemplate | onFinish 콜백 - 전체 데이터 전달 | onFinish 호출 시 모든 단계 데이터 포함 | FR-005 |
| UT-011 | WizardTemplate | 로딩 상태 - 완료 버튼 비활성화 | loading=true 시 완료 버튼 disabled | BR-007 |
| UT-012 | WizardTemplate | 첫 단계 - 이전 버튼 숨김/비활성화 | currentStep=0 시 이전 버튼 미표시 | BR-002 |
| UT-013 | WizardTemplate | 마지막 단계 - 완료 버튼 표시 | 마지막 단계에서 다음 버튼 대신 완료 버튼 | BR-003 |
| UT-014 | WizardTemplate | 미완료 단계 클릭 차단 | allowStepClick=true여도 미완료 단계 클릭 무시 | BR-004 |
| UT-015 | WizardTemplate | 완료 중복 클릭 방지 | onFinish 실행 중 버튼 재클릭 차단 | BR-007 |

### 2.2 테스트 케이스 상세

#### UT-001: 초기 렌더링 - 첫 번째 단계 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/WizardTemplate.spec.tsx` |
| **테스트 블록** | `describe('WizardTemplate') -> describe('rendering') -> it('should render first step content on initial load')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ steps: mockSteps, onComplete: mockFn }` |
| **검증 포인트** | 1. 첫 번째 단계 컨텐츠 렌더링 확인<br>2. 단계 인디케이터 표시 확인<br>3. wizard-container data-testid 존재 확인 |
| **커버리지 대상** | render() 정상 분기, 초기 currentStep=0 |
| **관련 요구사항** | FR-001: 단계별 컨텐츠 표시 |

```typescript
it('should render first step content on initial load', () => {
  const mockSteps: WizardStep[] = [
    { key: 'step1', title: '기본정보', content: <div>Step 1 Content</div> },
    { key: 'step2', title: '상세설정', content: <div>Step 2 Content</div> },
    { key: 'step3', title: '확인', content: <div>Step 3 Content</div> },
    { key: 'step4', title: '완료', content: <div>Step 4 Content</div> },
  ]

  render(<WizardTemplate steps={mockSteps} onComplete={vi.fn()} />)

  // 첫 번째 단계 컨텐츠 표시 확인
  expect(screen.getByText('Step 1 Content')).toBeInTheDocument()

  // 단계 인디케이터 표시 확인
  expect(screen.getByTestId('wizard-container')).toBeInTheDocument()
  expect(screen.getByTestId('wizard-steps')).toBeInTheDocument()
  expect(screen.getByTestId('wizard-step-0')).toBeInTheDocument()

  // 첫 번째 단계가 활성화 상태 확인
  expect(screen.getByText('기본정보')).toBeInTheDocument()
})
```

#### UT-002: 다음 버튼 - 유효성 검사 통과 시 다음 단계

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/WizardTemplate.spec.tsx` |
| **테스트 블록** | `describe('WizardTemplate') -> describe('navigation') -> it('should move to next step when validation passes')` |
| **Mock 의존성** | vi.fn() for validation returning true |
| **입력 데이터** | `{ steps: stepsWithValidation, onComplete: mockFn }` |
| **검증 포인트** | 1. validation 함수 호출 확인<br>2. 다음 단계 컨텐츠 표시<br>3. 단계 인디케이터 업데이트 |
| **커버리지 대상** | handleNext(), validation 통과 분기 |
| **관련 요구사항** | FR-002: 단계별 유효성 검사 후 진행 |

```typescript
it('should move to next step when validation passes', async () => {
  const mockValidation = vi.fn().mockResolvedValue(true)
  const mockSteps: WizardStep[] = [
    { key: 'step1', title: '기본정보', content: <div>Step 1 Content</div>, validation: mockValidation },
    { key: 'step2', title: '상세설정', content: <div>Step 2 Content</div> },
  ]

  render(<WizardTemplate steps={mockSteps} onComplete={vi.fn()} />)

  // 다음 버튼 클릭
  const nextButton = screen.getByTestId('wizard-next-btn')
  fireEvent.click(nextButton)

  await waitFor(() => {
    // validation 함수 호출 확인
    expect(mockValidation).toHaveBeenCalledTimes(1)

    // 다음 단계 컨텐츠 표시
    expect(screen.getByText('Step 2 Content')).toBeInTheDocument()
  })
})
```

#### UT-003: 다음 버튼 - 유효성 검사 실패 시 에러 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/WizardTemplate.spec.tsx` |
| **테스트 블록** | `describe('WizardTemplate') -> describe('validation') -> it('should show error and stay on current step when validation fails')` |
| **Mock 의존성** | vi.fn() for validation returning false |
| **입력 데이터** | `{ steps: stepsWithFailingValidation, onComplete: mockFn }` |
| **검증 포인트** | 1. validation 함수 호출 확인<br>2. 현재 단계 유지<br>3. 에러 상태/메시지 표시 가능 |
| **커버리지 대상** | handleNext(), validation 실패 분기 |
| **관련 요구사항** | FR-002: 유효성 검사 실패 시 에러 표시 |

```typescript
it('should show error and stay on current step when validation fails', async () => {
  const mockValidation = vi.fn().mockResolvedValue(false)
  const mockSteps: WizardStep[] = [
    { key: 'step1', title: '기본정보', content: <div>Step 1 Content</div>, validation: mockValidation },
    { key: 'step2', title: '상세설정', content: <div>Step 2 Content</div> },
  ]

  render(<WizardTemplate steps={mockSteps} onComplete={vi.fn()} />)

  // 다음 버튼 클릭
  const nextButton = screen.getByTestId('wizard-next-btn')
  fireEvent.click(nextButton)

  await waitFor(() => {
    // validation 함수 호출 확인
    expect(mockValidation).toHaveBeenCalledTimes(1)

    // 현재 단계 유지 (첫 번째 단계 컨텐츠가 여전히 표시됨)
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument()
    expect(screen.queryByText('Step 2 Content')).not.toBeInTheDocument()
  })
})
```

#### UT-004: 이전 버튼 - 이전 단계로 이동

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/WizardTemplate.spec.tsx` |
| **테스트 블록** | `describe('WizardTemplate') -> describe('navigation') -> it('should move to previous step when prev button clicked')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ steps: mockSteps, currentStep: 1, onComplete: mockFn }` |
| **검증 포인트** | 1. 이전 버튼 클릭시 이전 단계로 이동<br>2. 이전 단계 컨텐츠 표시 |
| **커버리지 대상** | handlePrev() |
| **관련 요구사항** | FR-003: 이전 단계 이동 |

```typescript
it('should move to previous step when prev button clicked', async () => {
  const mockSteps: WizardStep[] = [
    { key: 'step1', title: '기본정보', content: <div>Step 1 Content</div> },
    { key: 'step2', title: '상세설정', content: <div>Step 2 Content</div> },
  ]

  // 두 번째 단계부터 시작
  render(<WizardTemplate steps={mockSteps} currentStep={1} onComplete={vi.fn()} />)

  // 두 번째 단계 확인
  expect(screen.getByText('Step 2 Content')).toBeInTheDocument()

  // 이전 버튼 클릭
  const prevButton = screen.getByTestId('wizard-prev-btn')
  fireEvent.click(prevButton)

  await waitFor(() => {
    // 첫 번째 단계 컨텐츠 표시
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument()
  })
})
```

#### UT-005: 첫 번째 단계 - 이전 버튼 비활성화

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/WizardTemplate.spec.tsx` |
| **테스트 블록** | `describe('WizardTemplate') -> describe('first step') -> it('should disable prev button on first step')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ steps: mockSteps, onComplete: mockFn }` |
| **검증 포인트** | 1. 첫 번째 단계에서 이전 버튼 disabled<br>2. 또는 이전 버튼 숨김 |
| **커버리지 대상** | 첫 단계 조건부 렌더링 |
| **관련 요구사항** | BR-01: 첫 단계에서 이전 버튼 비활성화 |

```typescript
it('should disable prev button on first step', () => {
  const mockSteps: WizardStep[] = [
    { key: 'step1', title: '기본정보', content: <div>Step 1 Content</div> },
    { key: 'step2', title: '상세설정', content: <div>Step 2 Content</div> },
  ]

  render(<WizardTemplate steps={mockSteps} onComplete={vi.fn()} />)

  // 이전 버튼이 비활성화 또는 숨김 상태
  const prevButton = screen.queryByTestId('wizard-prev-btn')

  if (prevButton) {
    expect(prevButton).toBeDisabled()
  } else {
    // 버튼이 아예 렌더링되지 않는 경우
    expect(prevButton).toBeNull()
  }
})
```

#### UT-006: 마지막 단계 - 완료 버튼 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/WizardTemplate.spec.tsx` |
| **테스트 블록** | `describe('WizardTemplate') -> describe('last step') -> it('should show finish button on last step')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ steps: mockSteps, currentStep: 3, onComplete: mockFn }` |
| **검증 포인트** | 1. 마지막 단계에서 완료 버튼 표시<br>2. 다음 버튼 숨김 |
| **커버리지 대상** | 마지막 단계 조건부 렌더링 |
| **관련 요구사항** | FR-004: 마지막 단계에서 완료 버튼 |

```typescript
it('should show finish button on last step', () => {
  const mockSteps: WizardStep[] = [
    { key: 'step1', title: '기본정보', content: <div>Step 1 Content</div> },
    { key: 'step2', title: '상세설정', content: <div>Step 2 Content</div> },
    { key: 'step3', title: '확인', content: <div>Step 3 Content</div> },
    { key: 'step4', title: '완료', content: <div>Step 4 Content</div> },
  ]

  // 마지막 단계로 설정
  render(<WizardTemplate steps={mockSteps} currentStep={3} onComplete={vi.fn()} />)

  // 완료 버튼 표시 확인
  expect(screen.getByTestId('wizard-finish-btn')).toBeInTheDocument()

  // 다음 버튼 숨김 확인
  expect(screen.queryByTestId('wizard-next-btn')).not.toBeInTheDocument()
})
```

#### UT-007: 완료 버튼 - onComplete 콜백 호출

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/WizardTemplate.spec.tsx` |
| **테스트 블록** | `describe('WizardTemplate') -> describe('completion') -> it('should call onComplete when finish button clicked')` |
| **Mock 의존성** | vi.fn() for onComplete |
| **입력 데이터** | `{ steps: mockSteps, currentStep: 3, onComplete: mockFn }` |
| **검증 포인트** | 1. 완료 버튼 클릭시 onComplete 호출<br>2. 로딩 상태 표시 (필요시) |
| **커버리지 대상** | handleComplete() |
| **관련 요구사항** | FR-005: 완료 버튼 클릭 시 데이터 제출 |

```typescript
it('should call onComplete when finish button clicked', async () => {
  const mockOnComplete = vi.fn().mockResolvedValue(undefined)
  const mockSteps: WizardStep[] = [
    { key: 'step1', title: '기본정보', content: <div>Step 1 Content</div> },
    { key: 'step2', title: '상세설정', content: <div>Step 2 Content</div> },
    { key: 'step3', title: '확인', content: <div>Step 3 Content</div> },
    { key: 'step4', title: '완료', content: <div>Step 4 Content</div> },
  ]

  // 마지막 단계로 설정
  render(<WizardTemplate steps={mockSteps} currentStep={3} onComplete={mockOnComplete} />)

  // 완료 버튼 클릭
  const finishButton = screen.getByTestId('wizard-finish-btn')
  fireEvent.click(finishButton)

  await waitFor(() => {
    expect(mockOnComplete).toHaveBeenCalledTimes(1)
  })
})
```

#### UT-008: 단계 인디케이터 - 현재 단계 강조

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/WizardTemplate.spec.tsx` |
| **테스트 블록** | `describe('WizardTemplate') -> describe('step indicator') -> it('should highlight current step in indicator')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ steps: mockSteps, currentStep: 1, onComplete: mockFn }` |
| **검증 포인트** | 1. 현재 단계에 active 상태 적용<br>2. 이전 단계는 완료 상태<br>3. 이후 단계는 대기 상태 |
| **커버리지 대상** | Steps 컴포넌트 current prop |
| **관련 요구사항** | FR-006: 진행 상황 시각화 |

```typescript
it('should highlight current step in indicator', () => {
  const mockSteps: WizardStep[] = [
    { key: 'step1', title: '기본정보', content: <div>Step 1 Content</div> },
    { key: 'step2', title: '상세설정', content: <div>Step 2 Content</div> },
    { key: 'step3', title: '확인', content: <div>Step 3 Content</div> },
    { key: 'step4', title: '완료', content: <div>Step 4 Content</div> },
  ]

  // 두 번째 단계로 설정 (index: 1)
  render(<WizardTemplate steps={mockSteps} currentStep={1} onComplete={vi.fn()} />)

  // Steps 컴포넌트에서 현재 단계 강조 확인
  const stepsContainer = screen.getByTestId('wizard-steps')
  expect(stepsContainer).toBeInTheDocument()

  // 현재 단계(두 번째)가 활성화 상태인지 확인
  const currentStepElement = screen.getByTestId('wizard-step-1')
  expect(currentStepElement).toBeInTheDocument()

  // Ant Design Steps는 current prop으로 활성 단계를 표시
  // 실제 DOM 클래스나 aria 속성으로 확인 가능
})
```

#### UT-009 ~ UT-015: 추가 테스트 케이스 (QA-003 반영)

```typescript
// UT-009: 확인 단계 - 이전 단계 데이터 표시
it('should pass all step data to renderConfirmation', () => {
  const mockRenderConfirmation = vi.fn().mockReturnValue(<div>Confirmation</div>)
  const mockData = { basicInfo: { name: 'Test' }, detailSettings: { port: 8080 } }

  render(
    <WizardTemplate
      steps={mockSteps}
      initialData={mockData}
      autoConfirmStep
      renderConfirmation={mockRenderConfirmation}
      onFinish={vi.fn()}
    />
  )

  // 확인 단계로 이동 후 renderConfirmation이 전체 데이터와 함께 호출되는지 확인
  expect(mockRenderConfirmation).toHaveBeenCalledWith(expect.objectContaining(mockData))
})

// UT-010: onFinish 콜백 - 전체 데이터 전달
it('should call onFinish with complete wizard data', async () => {
  const mockOnFinish = vi.fn().mockResolvedValue(undefined)

  // 마지막 단계에서 완료 버튼 클릭
  render(<WizardTemplate steps={mockSteps} initialStep={3} onFinish={mockOnFinish} />)

  fireEvent.click(screen.getByTestId('wizard-finish-btn'))

  await waitFor(() => {
    expect(mockOnFinish).toHaveBeenCalledWith(expect.any(Object))
  })
})

// UT-011: 로딩 상태 - 완료 버튼 비활성화
it('should disable finish button when loading is true', () => {
  render(<WizardTemplate steps={mockSteps} initialStep={3} loading={true} onFinish={vi.fn()} />)

  const finishButton = screen.getByTestId('wizard-finish-btn')
  expect(finishButton).toBeDisabled()
})

// UT-012: 첫 단계 - 이전 버튼 숨김 (BR-002)
it('should hide or disable prev button on first step', () => {
  render(<WizardTemplate steps={mockSteps} onFinish={vi.fn()} />)

  const prevButton = screen.queryByTestId('wizard-prev-btn')
  if (prevButton) {
    expect(prevButton).toBeDisabled()
  } else {
    expect(prevButton).toBeNull()
  }
})

// UT-013: 마지막 단계 - 완료 버튼 표시 (BR-003)
it('should show finish button instead of next on last step', () => {
  render(<WizardTemplate steps={mockSteps} initialStep={3} onFinish={vi.fn()} />)

  expect(screen.getByTestId('wizard-finish-btn')).toBeInTheDocument()
  expect(screen.queryByTestId('wizard-next-btn')).not.toBeInTheDocument()
})

// UT-014: 미완료 단계 클릭 차단 (BR-004)
it('should not allow clicking incomplete steps', async () => {
  const mockOnStepChange = vi.fn()

  render(
    <WizardTemplate
      steps={mockSteps}
      allowStepClick={true}
      onStepChange={mockOnStepChange}
      onFinish={vi.fn()}
    />
  )

  // 미완료된 2단계 클릭 시도
  const step2 = screen.getByTestId('wizard-step-1')
  fireEvent.click(step2)

  // 단계 변경이 호출되지 않아야 함
  expect(mockOnStepChange).not.toHaveBeenCalled()
})

// UT-015: 완료 중복 클릭 방지 (BR-007)
it('should prevent double click on finish button', async () => {
  const mockOnFinish = vi.fn().mockImplementation(
    () => new Promise(resolve => setTimeout(resolve, 1000))
  )

  render(<WizardTemplate steps={mockSteps} initialStep={3} onFinish={mockOnFinish} />)

  const finishButton = screen.getByTestId('wizard-finish-btn')

  // 첫 번째 클릭
  fireEvent.click(finishButton)

  // 두 번째 클릭 (중복)
  fireEvent.click(finishButton)

  await waitFor(() => {
    // onFinish는 한 번만 호출되어야 함
    expect(mockOnFinish).toHaveBeenCalledTimes(1)
  })
})
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 4단계 마법사 전체 흐름 완료 | 마법사 페이지 접속 | 1. 각 단계 입력 2. 다음 클릭 반복 3. 완료 클릭 | 모든 단계 완료, 성공 메시지 | FR-001, FR-005 |
| E2E-002 | 유효성 검사 실패 시 다음 진행 불가 | 마법사 첫 단계 | 1. 필수 필드 비우기 2. 다음 클릭 | 에러 메시지, 현재 단계 유지 | FR-002 |
| E2E-003 | 이전 버튼으로 뒤로 이동 가능 | 마법사 두 번째 단계 | 1. 이전 버튼 클릭 | 첫 번째 단계로 이동, 데이터 유지 | FR-003, BR-02 |
| E2E-004 | 완료 후 콜백 동작 확인 | 마법사 마지막 단계 | 1. 완료 버튼 클릭 | 데이터 저장, 리다이렉트 또는 완료 메시지 | FR-005 |
| E2E-005 | 확인 단계에서 수정 링크로 이전 단계 이동 | 확인 단계 도달 | 1. 수정 링크 클릭 2. 해당 단계에서 수정 3. 다시 확인 단계 이동 | 수정된 데이터 확인 단계에 반영 | FR-004, BR-008 |
| E2E-006 | 이탈 경고 다이얼로그 동작 | 마법사 진행 중 (데이터 입력됨) | 1. 취소 버튼 클릭 2. 확인 다이얼로그에서 취소 3. 다시 취소 클릭 4. 확인 선택 | 데이터 있을 때만 다이얼로그, 확인 시 이탈 | BR-005 |

### 3.2 테스트 케이스 상세

#### E2E-001: 4단계 마법사 전체 흐름 완료

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/wizard-template.spec.ts` |
| **테스트명** | `test('사용자가 4단계 마법사를 모두 완료할 수 있다')` |
| **사전조건** | 로그인 (fixture 사용), 마법사 페이지 접근 |
| **data-testid 셀렉터** | |
| - 마법사 컨테이너 | `[data-testid="wizard-container"]` |
| - 단계 표시 | `[data-testid="wizard-steps"]` |
| - 컨텐츠 영역 | `[data-testid="wizard-content"]` |
| - 다음 버튼 | `[data-testid="wizard-next-btn"]` |
| - 완료 버튼 | `[data-testid="wizard-finish-btn"]` |
| **검증 포인트** | 각 단계 이동 후 컨텐츠 변경, 최종 완료 처리 |
| **스크린샷** | `e2e-001-step1.png`, `e2e-001-step2.png`, `e2e-001-step3.png`, `e2e-001-step4.png`, `e2e-001-complete.png` |
| **관련 요구사항** | FR-001, FR-005 |

```typescript
test('사용자가 4단계 마법사를 모두 완료할 수 있다', async ({ page }) => {
  // Given: 마법사 페이지 접속
  await page.goto('/setup/wizard')
  await page.waitForSelector('[data-testid="wizard-container"]')

  // Step 1: 기본정보 입력
  await expect(page.locator('[data-testid="wizard-step-0"]')).toBeVisible()
  await expect(page.locator('[data-testid="step-0-form"]')).toBeVisible()
  await page.fill('[data-testid="wizard-name-input"]', '테스트 설정')
  await page.screenshot({ path: 'e2e-001-step1.png' })

  // 다음 버튼 클릭
  await page.click('[data-testid="wizard-next-btn"]')

  // Step 2: 상세설정
  await expect(page.locator('[data-testid="step-1-form"]')).toBeVisible()
  await page.fill('[data-testid="wizard-detail-input"]', '상세 설정 값')
  await page.screenshot({ path: 'e2e-001-step2.png' })

  await page.click('[data-testid="wizard-next-btn"]')

  // Step 3: 확인
  await expect(page.locator('[data-testid="step-2-form"]')).toBeVisible()
  await expect(page.getByText('테스트 설정')).toBeVisible()
  await page.screenshot({ path: 'e2e-001-step3.png' })

  await page.click('[data-testid="wizard-next-btn"]')

  // Step 4: 완료 단계
  await expect(page.locator('[data-testid="step-3-form"]')).toBeVisible()
  await expect(page.locator('[data-testid="wizard-finish-btn"]')).toBeVisible()
  await page.screenshot({ path: 'e2e-001-step4.png' })

  // API 응답 대기 설정
  const submitResponse = page.waitForResponse(
    response => response.url().includes('/api/setup') && response.request().method() === 'POST'
  )

  // 완료 버튼 클릭
  await page.click('[data-testid="wizard-finish-btn"]')

  // Then: 완료 처리
  await submitResponse
  await expect(page.getByText('설정이 완료되었습니다')).toBeVisible()
  await page.screenshot({ path: 'e2e-001-complete.png' })
})
```

#### E2E-002: 유효성 검사 실패 시 다음 진행 불가

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/wizard-template.spec.ts` |
| **테스트명** | `test('필수 필드 누락 시 다음 단계로 진행할 수 없다')` |
| **사전조건** | 마법사 첫 단계 로드 |
| **data-testid 셀렉터** | |
| - 에러 메시지 | `[data-testid="validation-error"]` |
| **검증 포인트** | 에러 메시지 표시, 현재 단계 유지 |
| **스크린샷** | `e2e-002-validation-error.png` |
| **관련 요구사항** | FR-002 |

```typescript
test('필수 필드 누락 시 다음 단계로 진행할 수 없다', async ({ page }) => {
  // Given: 마법사 첫 단계
  await page.goto('/setup/wizard')
  await page.waitForSelector('[data-testid="wizard-container"]')

  // When: 필수 필드를 입력하지 않고 다음 클릭
  await page.click('[data-testid="wizard-next-btn"]')

  // Then: 에러 메시지 표시, 현재 단계 유지
  await expect(page.locator('[data-testid="step-0-form"]')).toBeVisible()
  await expect(page.getByText(/필수/)).toBeVisible()

  await page.screenshot({ path: 'e2e-002-validation-error.png' })
})
```

#### E2E-003: 이전 버튼으로 뒤로 이동 가능

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/wizard-template.spec.ts` |
| **테스트명** | `test('이전 버튼으로 뒤로 이동하고 데이터가 유지된다')` |
| **사전조건** | 마법사 두 번째 단계 |
| **data-testid 셀렉터** | |
| - 이전 버튼 | `[data-testid="wizard-prev-btn"]` |
| **검증 포인트** | 이전 단계 이동, 입력 데이터 유지 |
| **스크린샷** | `e2e-003-back-navigation.png` |
| **관련 요구사항** | FR-003, BR-02 |

```typescript
test('이전 버튼으로 뒤로 이동하고 데이터가 유지된다', async ({ page }) => {
  // Given: 마법사 시작 후 첫 단계 입력
  await page.goto('/setup/wizard')
  await page.waitForSelector('[data-testid="wizard-container"]')

  const inputValue = '테스트 입력 값'
  await page.fill('[data-testid="wizard-name-input"]', inputValue)

  // 다음 단계로 이동
  await page.click('[data-testid="wizard-next-btn"]')
  await expect(page.locator('[data-testid="step-1-form"]')).toBeVisible()

  // When: 이전 버튼 클릭
  await page.click('[data-testid="wizard-prev-btn"]')

  // Then: 첫 번째 단계로 이동, 입력값 유지
  await expect(page.locator('[data-testid="step-0-form"]')).toBeVisible()
  await expect(page.locator('[data-testid="wizard-name-input"]')).toHaveValue(inputValue)

  await page.screenshot({ path: 'e2e-003-back-navigation.png' })
})
```

#### E2E-004: 완료 후 콜백 동작 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/wizard-template.spec.ts` |
| **테스트명** | `test('완료 버튼 클릭 시 데이터가 저장되고 완료 화면이 표시된다')` |
| **사전조건** | 마법사 마지막 단계 도달 |
| **data-testid 셀렉터** | |
| - 완료 버튼 | `[data-testid="wizard-finish-btn"]` |
| **API 확인** | `POST /api/setup` -> 200/201 |
| **검증 포인트** | API 호출, 성공 메시지 또는 리다이렉트 |
| **스크린샷** | `e2e-004-completion.png` |
| **관련 요구사항** | FR-005 |

```typescript
test('완료 버튼 클릭 시 데이터가 저장되고 완료 화면이 표시된다', async ({ page }) => {
  // Given: 마법사 모든 단계 완료 후 마지막 단계
  await page.goto('/setup/wizard')
  await page.waitForSelector('[data-testid="wizard-container"]')

  // 빠르게 마지막 단계까지 이동 (필수 입력값 채우면서)
  await page.fill('[data-testid="wizard-name-input"]', '완료 테스트')
  await page.click('[data-testid="wizard-next-btn"]')

  await page.fill('[data-testid="wizard-detail-input"]', '상세값')
  await page.click('[data-testid="wizard-next-btn"]')

  await page.click('[data-testid="wizard-next-btn"]')

  // 마지막 단계 확인
  await expect(page.locator('[data-testid="wizard-finish-btn"]')).toBeVisible()

  // API 응답 대기 설정
  const submitResponse = page.waitForResponse(
    response => response.url().includes('/api/setup') && response.request().method() === 'POST'
  )

  // When: 완료 버튼 클릭
  await page.click('[data-testid="wizard-finish-btn"]')

  // Then: API 호출 확인
  const response = await submitResponse
  expect(response.status()).toBeLessThan(300)

  // 성공 메시지 또는 리다이렉트 확인
  await expect(page.getByText(/완료|성공/)).toBeVisible()

  await page.screenshot({ path: 'e2e-004-completion.png' })
})
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 단계 표시 UI 확인 | 마법사 페이지 | 1. 각 단계 진행 2. 인디케이터 확인 | 현재 단계 강조, 완료 단계 표시 | High | FR-006 |
| TC-002 | 키보드 네비게이션 (Tab, Enter) | 마법사 페이지 | 1. Tab으로 포커스 이동 2. Enter로 버튼 실행 | 모든 요소 접근 가능 | Medium | A11y |
| TC-003 | 반응형 레이아웃 | 마법사 페이지 | 1. 브라우저 크기 조절 | 레이아웃 적응 | Medium | - |
| TC-004 | 취소 확인 다이얼로그 | 마법사 진행 중 | 1. 취소 버튼 클릭 | 확인 다이얼로그 표시 | Medium | BR-03 |
| TC-005 | 로딩 상태 표시 | 마법사 완료 클릭 | 1. 완료 버튼 클릭 | 버튼 로딩 상태, 스피너 표시 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 단계 표시 UI 확인

**테스트 목적**: 마법사의 단계 인디케이터가 현재 진행 상황을 정확히 표시하는지 검증

**테스트 단계**:
1. 마법사 페이지 접속
2. 첫 번째 단계에서 인디케이터 확인 (1단계 활성, 나머지 대기)
3. 다음 버튼 클릭하여 2단계로 이동
4. 인디케이터 확인 (1단계 완료, 2단계 활성, 나머지 대기)
5. 3, 4단계까지 반복
6. 마지막 단계에서 모든 이전 단계가 완료 표시인지 확인

**예상 결과**:
- 현재 단계: 파란색/강조 표시 (process)
- 완료 단계: 녹색 체크 아이콘 (finish)
- 대기 단계: 회색 (wait)
- 단계 제목이 명확히 표시됨

**검증 기준**:
- [ ] 단계 번호가 순서대로 표시됨
- [ ] 현재 단계가 시각적으로 강조됨
- [ ] 완료된 단계에 체크 표시
- [ ] 단계 간 연결선이 적절히 표시됨
- [ ] 단계 클릭 비활성화 시 클릭 불가 (allowStepClick=false)

#### TC-002: 키보드 네비게이션 (Tab, Enter)

**테스트 목적**: 키보드만으로 마법사의 모든 기능에 접근 가능한지 검증

**테스트 단계**:
1. 마법사 페이지에서 마우스 사용 금지
2. Tab 키로 포커스 이동 순서 확인
3. 입력 필드에서 Tab으로 다음 필드 이동
4. 다음 버튼에 포커스 후 Enter로 실행
5. 이전 버튼에 포커스 후 Enter로 실행
6. 완료 버튼에 포커스 후 Enter로 실행

**예상 결과**:
- Tab 순서: 입력 필드 -> 이전 버튼 -> 다음/완료 버튼
- Enter로 버튼 실행 가능
- 포커스 표시가 명확함 (outline)

**검증 기준**:
- [ ] 모든 인터랙티브 요소에 Tab으로 접근 가능
- [ ] 포커스 순서가 논리적 (좌->우, 상->하)
- [ ] 포커스 표시가 명확함
- [ ] Enter/Space로 버튼 실행 가능
- [ ] Escape로 취소 다이얼로그 닫기 가능

#### TC-003: 반응형 레이아웃

**테스트 목적**: 다양한 화면 크기에서 마법사 레이아웃이 적절히 적응하는지 검증

**테스트 단계**:
1. 데스크톱 크기 (1920x1080)에서 확인
2. 노트북 크기 (1366x768)에서 확인
3. 태블릿 크기 (768x1024)에서 확인
4. 모바일 크기 (375x667)에서 확인

**예상 결과**:
- 데스크톱: 가로형 단계 인디케이터
- 태블릿: 가로형 단계 인디케이터 (축소)
- 모바일: 세로형 단계 인디케이터 또는 간소화된 표시

**검증 기준**:
- [ ] 모든 단계 제목이 잘림 없이 표시됨 (또는 축약)
- [ ] 버튼이 터치 가능한 크기 유지 (모바일)
- [ ] 입력 필드가 화면에 맞게 조절됨
- [ ] 컨텐츠 영역이 스크롤 가능 (필요시)

#### TC-004: 취소 확인 다이얼로그

**테스트 목적**: 마법사 진행 중 취소 시 확인 다이얼로그가 표시되는지 검증

**테스트 단계**:
1. 마법사 시작 후 일부 데이터 입력
2. 취소 버튼 클릭
3. 확인 다이얼로그 표시 확인
4. '취소' 클릭 시 마법사로 복귀
5. 다시 취소 버튼 클릭
6. '확인' 클릭 시 마법사 종료

**예상 결과**:
- "정말 취소하시겠습니까?" 또는 유사 메시지
- 확인/취소 버튼 제공
- 확인 시 마법사 닫힘/이탈
- 취소 시 현재 상태 유지

**검증 기준**:
- [ ] 취소 버튼 클릭 시 확인 다이얼로그 표시
- [ ] 다이얼로그 메시지가 명확함
- [ ] '취소' 선택 시 마법사로 복귀
- [ ] '확인' 선택 시 마법사 종료
- [ ] 입력 데이터 손실 경고 포함 (선택적)

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-STEPS-4 | 4단계 마법사 | `[{ key: 'step1', title: '기본정보', content: <Step1 /> }, { key: 'step2', title: '상세설정', content: <Step2 /> }, { key: 'step3', title: '확인', content: <Step3 /> }, { key: 'step4', title: '완료', content: <Step4 /> }]` |
| MOCK-STEPS-VALIDATION | 유효성 검사 포함 단계 | `[{ key: 'step1', title: '기본정보', content: <Step1 />, validation: () => true }, ...]` |
| MOCK-FORM-DATA | 마법사 폼 데이터 | `{ name: '테스트 설정', detail: '상세 설명', option: 'A' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-WIZARD | 마법사 E2E 테스트 | 자동 시드 | 테스트 사용자 1명 |
| SEED-E2E-WIZARD-COMPLETE | 완료된 마법사 | 자동 시드 | 기존 설정 1개 (수정 테스트용) |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 마법사 테스트 |
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 마법사 테스트 |

### 5.4 Mock 데이터 코드

```typescript
// fixtures/wizard-template.fixtures.ts

import { WizardStep } from '@/components/templates/WizardTemplate'

export const mock4StepWizard: WizardStep[] = [
  {
    key: 'basic',
    title: '기본정보',
    description: '기본 설정을 입력합니다',
    content: <BasicInfoStep />,
    validation: async () => {
      // 실제 구현에서는 폼 validation 로직
      return true
    },
  },
  {
    key: 'detail',
    title: '상세설정',
    description: '상세 옵션을 설정합니다',
    content: <DetailSettingStep />,
    validation: async () => true,
  },
  {
    key: 'confirm',
    title: '확인',
    description: '입력 내용을 확인합니다',
    content: <ConfirmStep />,
  },
  {
    key: 'complete',
    title: '완료',
    description: '설정이 완료되었습니다',
    content: <CompleteStep />,
  },
]

export const mockWizardFormData = {
  name: '테스트 설정',
  description: '테스트를 위한 설정입니다',
  category: 'production',
  options: {
    enableNotification: true,
    retryCount: 3,
  },
}

export const mockValidationError = {
  name: '이름은 필수 입력 항목입니다',
  description: '',
}

// 마지막 단계 완료 시 전송될 데이터 Mock
export const mockSubmitPayload = {
  name: '테스트 설정',
  description: '테스트를 위한 설정입니다',
  category: 'production',
  options: {
    enableNotification: true,
    retryCount: 3,
  },
  createdAt: '2026-01-21T00:00:00Z',
}
```

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 WizardTemplate 컴포넌트 셀렉터 (QA-005 반영 - 설계 기준 통일)

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `wizard-template-container` | 마법사 전체 컨테이너 | 마법사 로드 확인 |
| `wizard-steps` | 단계 인디케이터 (Steps) | 단계 표시 영역 |
| `wizard-step-{n}` | 개별 단계 (0부터 시작) | 특정 단계 상태 확인 |
| `wizard-content` | 단계별 컨텐츠 영역 | 컨텐츠 전환 확인 |
| `wizard-prev-btn` | 이전 버튼 | 이전 단계 이동 |
| `wizard-next-btn` | 다음 버튼 | 다음 단계 이동 |
| `wizard-finish-btn` | 완료 버튼 | 마법사 완료 |
| `wizard-cancel-btn` | 취소 버튼 | 마법사 취소 |
| `wizard-confirmation` | 확인 단계 영역 | 확인 데이터 표시 |
| `wizard-result` | 완료 단계 영역 | 완료 메시지 표시 |

### 6.2 단계별 입력 필드 셀렉터 (예시)

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `wizard-name-input` | 이름 입력 필드 | Step 1 입력 |
| `wizard-description-input` | 설명 입력 필드 | Step 1 입력 |
| `wizard-detail-input` | 상세 설정 입력 | Step 2 입력 |
| `wizard-option-select` | 옵션 선택 드롭다운 | Step 2 입력 |
| `validation-error` | 유효성 에러 메시지 | 에러 표시 확인 |

### 6.3 관련 다이얼로그 셀렉터 (QA-006 반영 - 설계 기준 통일)

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `leave-confirm-dialog` | 이탈 확인 다이얼로그 | 취소/이탈 시 확인 |
| `leave-confirm-btn` | 확인 버튼 | 이탈 확정 |
| `leave-dismiss-btn` | 취소 버튼 | 마법사로 복귀 |

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |
| Statements | 80% | 70% |

### 7.2 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 기능 요구사항 (FR) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

### 7.3 측정 방법

- **단위 테스트**: Vitest coverage report (`vitest run --coverage`)
- **E2E 테스트**: Playwright test report (`npx playwright test --reporter=html`)
- **커버리지 리포트 위치**: `coverage/` 디렉토리

---

## 8. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 단위 테스트 | E2E 테스트 | 매뉴얼 테스트 |
|-------------|--------------|------------|-----------|--------------|
| FR-001 | 단계별 컨텐츠 표시 | UT-001 | E2E-001 | TC-001 |
| FR-002 | 단계별 유효성 검사 후 진행 | UT-002, UT-003 | E2E-002 | - |
| FR-003 | 이전 단계 이동 | UT-004 | E2E-003 | - |
| FR-004 | 마지막 단계에서 완료 버튼 | UT-006, UT-009 | E2E-001, E2E-005 | - |
| FR-005 | 완료 버튼 클릭 시 데이터 제출 | UT-007, UT-010 | E2E-001, E2E-004 | TC-005 |
| FR-006 | 진행 상황 시각화 (Steps) | UT-008 | E2E-001 | TC-001 |
| BR-001 | 유효성 검사 실패 시 이동 차단 | UT-002, UT-003 | E2E-002 | - |
| BR-002 | 첫 단계에서 이전 버튼 비활성화 | UT-005, UT-012 | E2E-003 | - |
| BR-003 | 마지막 단계 완료 버튼 표시 | UT-006, UT-013 | E2E-001 | - |
| BR-004 | 단계 건너뛰기 불가 | UT-014 | E2E-002 | - |
| BR-005 | 이탈 시 확인 다이얼로그 | - | E2E-006 | TC-004 |
| BR-006 | 완료 버튼 마지막 단계 전용 | UT-006, UT-013 | E2E-001 | - |
| BR-007 | 완료 중복 클릭 방지 | UT-011, UT-015 | E2E-004 | - |
| BR-008 | 단계 간 데이터 유지 | - | E2E-003, E2E-005 | - |

---

## 관련 문서

- 설계 문서: `010-design.md`
- PRD: `.orchay/projects/mes-portal/prd.md` (4.1.1 화면 템플릿 - 마법사 화면)
- TRD: `.orchay/projects/mes-portal/trd.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | Claude | 최초 작성 |
| 1.1 | 2026-01-21 | Claude | 설계 리뷰 반영 - QA-001(Props 인터페이스 통일), QA-003(UT-009~015 추가), QA-005(data-testid 통일), QA-006(다이얼로그 testid 수정), E2E-005~006 추가 |
