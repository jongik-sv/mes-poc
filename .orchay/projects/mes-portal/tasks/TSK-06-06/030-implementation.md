# 구현 보고서 (030-implementation.md)

**Task ID**: TSK-06-06
**Task Name**: 마법사(Wizard) 화면 템플릿
**Implementation Date**: 2026-01-22
**Status**: 완료

---

## 1. 구현 요약

### 1.1 구현 범위

WizardTemplate 컴포넌트를 TDD 방식으로 구현했습니다. 이 템플릿은 다단계 입력 프로세스(마법사)를 위한 범용 UI 템플릿입니다.

| 항목 | 내용 |
|------|------|
| **컴포넌트 유형** | React Client Component |
| **위치** | `mes-portal/components/templates/WizardTemplate/` |
| **의존성** | Ant Design 6.x (Steps, Card, Modal, Result, Button, Space) |
| **테스트** | Vitest + @testing-library/react |

### 1.2 구현 파일 목록

| 파일 | 설명 | 라인 수 |
|------|------|--------|
| `types.ts` | TypeScript 타입 정의 | ~100 |
| `WizardTemplate.tsx` | 메인 컴포넌트 | ~390 |
| `WizardSteps.tsx` | 단계 인디케이터 래퍼 | ~95 |
| `WizardContent.tsx` | 콘텐츠 영역 컴포넌트 | ~45 |
| `WizardNavigation.tsx` | 네비게이션 버튼 컴포넌트 | ~125 |
| `WizardContext.tsx` | Context Provider (확장용) | ~240 |
| `index.tsx` | 모듈 export | ~72 |
| `__tests__/WizardTemplate.spec.tsx` | 단위 테스트 | ~660 |

---

## 2. 아키텍처 설계

### 2.1 컴포넌트 구조

```
WizardTemplate
├── WizardSteps (Ant Design Steps 래퍼)
├── WizardContent (단계별 콘텐츠 렌더링)
└── WizardNavigation (이전/다음/완료/취소 버튼)
```

### 2.2 상태 관리

```typescript
// 내부 상태
const [currentStep, setCurrentStep] = useState(initialStep)
const [data, setDataState] = useState<T>(initialData || {})
const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
const [isFinishing, setIsFinishing] = useState(false)
```

### 2.3 데이터 흐름

```
User Input → setData/setStepData → onDataChange callback
Next Click → validate() → completedSteps.add() → setCurrentStep++
Finish Click → isFinishing=true → onFinish(data) → isFinishing=false
```

---

## 3. 주요 기능 구현

### 3.1 단계 네비게이션 (FR-001, FR-002)

- Ant Design Steps 컴포넌트를 활용한 단계 표시
- Ant Design 6.x 호환성: `direction` → `orientation`, `description` → `content`

```typescript
// WizardSteps.tsx
<Steps
  current={currentStep}
  orientation={direction}
  items={items}
  onChange={handleStepChange}
/>
```

### 3.2 유효성 검사 (FR-003, BR-002)

각 단계에 `validate` 함수를 정의하여 다음 단계 이동 전 검증

```typescript
const handleNext = useCallback(async () => {
  const step = steps[currentStep]
  if (step.validate) {
    const isValid = await step.validate()
    if (!isValid) return  // 실패 시 현재 단계 유지
  }
  setCompletedSteps(prev => new Set([...prev, currentStep]))
  setCurrentStep(nextStep)
}, [currentStep, steps])
```

### 3.3 확인/완료 단계 자동 생성 (FR-004, FR-005)

```typescript
// autoConfirmStep, autoFinishStep props로 자동 단계 추가
if (autoConfirmStep) {
  result.push({
    key: '__confirm__',
    title: confirmStepTitle,
    content: (context) => renderConfirmation?.(context.data) || <div>확인 단계</div>
  })
}

if (autoFinishStep) {
  result.push({
    key: '__finish__',
    title: finishStepTitle,
    content: <Result status="success" title={finishMessage} extra={finishActions} />
  })
}
```

### 3.4 이탈 확인 (BR-005)

```typescript
// 취소 버튼 클릭 시
const handleCancelClick = useCallback(() => {
  const hasData = Object.keys(data).length > 0
  if (enableLeaveConfirm && hasData) {
    Modal.confirm({
      title: '취소 확인',
      content: leaveConfirmMessage,
      onOk: () => onCancel()
    })
  } else {
    onCancel()
  }
}, [data, enableLeaveConfirm, onCancel])

// 페이지 이탈 시
useEffect(() => {
  if (enableLeaveConfirm && hasData) {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}, [enableLeaveConfirm, data])
```

### 3.5 중복 클릭 방지 (BR-007)

```typescript
const handleFinish = useCallback(async () => {
  if (isFinishing) return  // 중복 클릭 방지
  setIsFinishing(true)
  try {
    await onFinish(data)
  } finally {
    setIsFinishing(false)
  }
}, [data, isFinishing, onFinish])
```

---

## 4. Props API

### 4.1 WizardTemplateProps

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `steps` | `WizardStep[]` | required | 단계 정의 배열 |
| `initialStep` | `number` | `0` | 초기 단계 인덱스 |
| `initialData` | `Partial<T>` | `{}` | 초기 데이터 |
| `onFinish` | `(data: T) => Promise<void>` | required | 완료 콜백 |
| `onCancel` | `() => void` | - | 취소 콜백 |
| `onStepChange` | `(current, prev) => void` | - | 단계 변경 콜백 |
| `onDataChange` | `(data: T) => void` | - | 데이터 변경 콜백 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Steps 방향 |
| `allowStepClick` | `boolean` | `true` | 단계 클릭 허용 |
| `loading` | `boolean` | `false` | 로딩 상태 |
| `enableLeaveConfirm` | `boolean` | `true` | 이탈 확인 활성화 |
| `autoConfirmStep` | `boolean` | `false` | 확인 단계 자동 생성 |
| `autoFinishStep` | `boolean` | `false` | 완료 단계 자동 생성 |

### 4.2 WizardStep

```typescript
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
```

---

## 5. data-testid 속성

| data-testid | 요소 |
|-------------|------|
| `wizard-template-container` | 전체 컨테이너 |
| `wizard-steps` | Steps 영역 |
| `wizard-content` | 콘텐츠 영역 |
| `wizard-navigation` | 네비게이션 영역 |
| `wizard-prev-btn` | 이전 버튼 |
| `wizard-next-btn` | 다음 버튼 |
| `wizard-finish-btn` | 완료 버튼 |
| `wizard-cancel-btn` | 취소 버튼 |
| `wizard-confirmation` | 확인 단계 영역 |
| `wizard-result` | 완료 단계 영역 |

---

## 6. 사용 예시

```tsx
import { WizardTemplate, WizardStep } from '@/components/templates'

const steps: WizardStep[] = [
  {
    key: 'basic',
    title: '기본정보',
    content: <BasicInfoForm />,
    validate: async () => form.validateFields().then(() => true).catch(() => false)
  },
  {
    key: 'detail',
    title: '상세설정',
    content: <DetailSettingForm />
  }
]

<WizardTemplate
  title="설정 마법사"
  steps={steps}
  onFinish={async (data) => {
    await api.saveSettings(data)
    router.push('/dashboard')
  }}
  onCancel={() => router.back()}
  autoConfirmStep
  renderConfirmation={(data) => <ConfirmationView data={data} />}
  autoFinishStep
  finishMessage="설정이 완료되었습니다!"
/>
```

---

## 7. 테스트 결과

| 항목 | 결과 |
|------|------|
| 단위 테스트 | 30/30 통과 |
| 핵심 컴포넌트 커버리지 | 85.56% |
| 요구사항 커버리지 | FR 100%, BR 100% |

자세한 테스트 결과는 `070-tdd-test-results.md` 참조

---

## 8. 개선 사항

### 8.1 구현 중 수정 사항

1. **React Hook 순서 문제**: `useMemo`(contextValue)가 `useCallback`(handlers) 정의 전에 선언되어 ReferenceError 발생 → 순서 조정
2. **Ant Design 6.x 호환성**: deprecated API 경고 수정
   - `direction` → `orientation`
   - `items.description` → `items.content`

### 8.2 향후 개선 가능 사항

1. **WizardContext Provider 활용**: 현재는 내부 상태 관리, 향후 복잡한 폼 연동 시 Provider 패턴 적용 가능
2. **애니메이션**: 단계 전환 시 framer-motion 등을 활용한 전환 효과 추가 가능
3. **키보드 단축키**: 접근성 향상을 위한 키보드 네비게이션 강화

---

## 9. 관련 문서

| 문서 | 경로 |
|------|------|
| 상세 설계서 | `010-design.md` |
| UI 설계서 | `011-ui-design.md` |
| 추적 매트릭스 | `025-traceability-matrix.md` |
| 테스트 명세서 | `026-test-specification.md` |
| 테스트 결과서 | `070-tdd-test-results.md` |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-22 | Claude | 최초 작성 |
