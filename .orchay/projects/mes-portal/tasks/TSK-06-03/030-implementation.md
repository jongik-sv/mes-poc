# 구현 보고서 (030-implementation.md)

**Task ID:** TSK-06-03
**Task명:** 입력/수정 폼 템플릿
**구현일:** 2026-01-22
**구현 방법:** TDD (Test-Driven Development)

---

## 1. 구현 개요

### 1.1 목적

MES Portal에서 데이터 입력 및 수정 폼 화면의 표준 템플릿을 제공합니다. Ant Design Form을 기반으로 다양한 레이아웃, 유효성 검사, 변경 감지, 저장/취소 기능을 내장하여 개발 생산성을 향상시킵니다.

### 1.2 구현 범위

| 항목 | 포함 여부 |
|------|----------|
| FormTemplate 컴포넌트 | ✅ |
| 폼 레이아웃 (수직/수평/인라인) | ✅ |
| 유효성 검사 통합 | ✅ |
| 저장/취소/초기화 버튼 | ✅ |
| 변경 감지 (dirty check) | ✅ |
| 이탈 경고 (beforeunload) | ✅ |
| 외부 form 인스턴스 지원 | ✅ |
| E2E 테스트 | ⏳ (샘플 화면 구현 후) |

---

## 2. 파일 구조

```
mes-portal/
├── components/
│   └── templates/
│       ├── FormTemplate/
│       │   ├── __tests__/
│       │   │   └── FormTemplate.spec.tsx    # 단위 테스트 (26개)
│       │   ├── index.tsx                    # 메인 컴포넌트
│       │   └── types.ts                     # 타입 정의
│       └── index.ts                         # FormTemplate export 추가
└── test-results/
    └── 20260122-134840/
        └── tdd/
            └── coverage/
```

---

## 3. 구현 상세

### 3.1 FormTemplate 컴포넌트

**경로:** `components/templates/FormTemplate/index.tsx`

**주요 기능:**

1. **레이아웃 지원**
   - `layout='vertical'`: 라벨이 필드 위에 위치 (기본값)
   - `layout='horizontal'`: 라벨이 필드 좌측에 위치
   - `layout='inline'`: 필드들이 한 줄에 배치

2. **유효성 검사**
   - Ant Design Form rules 기반
   - 저장 시 전체 유효성 검사 (BR-01)
   - 첫 번째 에러 필드로 스크롤 (BR-05)

3. **저장/취소 버튼**
   - 저장 중 로딩 상태 및 버튼 비활성화 (BR-04)
   - 커스텀 버튼 텍스트 지원
   - 버튼 표시/숨김 제어

4. **변경 감지 (useFormDirty 훅)**
   - 초기값과 현재값 비교
   - 변경된 필드 추적
   - data-dirty 속성으로 상태 표시

5. **이탈 경고**
   - 변경 시 취소 버튼 클릭 → 확인 다이얼로그 (BR-02)
   - `beforeunload` 이벤트로 브라우저 이탈 경고

### 3.2 타입 정의

**경로:** `components/templates/FormTemplate/types.ts`

```typescript
interface FormTemplateProps<T extends Record<string, unknown>> {
  // 폼 설정
  form?: FormInstance<T>           // 외부 form 인스턴스
  initialValues?: Partial<T>       // 초기값
  layout?: 'horizontal' | 'vertical' | 'inline'

  // 폼 필드
  children: ReactNode              // Form.Item 포함 필드

  // 액션
  onSubmit: (values: T) => Promise<void> | void
  onCancel?: () => void
  onReset?: () => void

  // 상태
  loading?: boolean                // 저장 중 로딩
  submitText?: string              // 저장 버튼 텍스트 (기본: '저장')
  cancelText?: string              // 취소 버튼 텍스트 (기본: '취소')
  showSubmit?: boolean             // 저장 버튼 표시 (기본: true)
  showCancel?: boolean             // 취소 버튼 표시 (기본: true)
  showReset?: boolean              // 초기화 버튼 표시 (기본: false)

  // 변경 감지
  enableDirtyCheck?: boolean       // 변경 감지 활성화
  enableLeaveConfirm?: boolean     // 이탈 경고 활성화
  showDirtyIndicator?: boolean     // 변경 표시 활성화

  // 헤더
  title?: string                   // 폼 제목
  mode?: 'create' | 'edit'         // 모드
  extra?: ReactNode                // 추가 헤더 요소

  // 기타
  showFormError?: boolean          // 폼 레벨 에러 표시
  scrollToError?: boolean          // 에러 시 스크롤 (기본: true)
  className?: string
  style?: CSSProperties
  name?: string
}
```

---

## 4. 요구사항 매핑

### 4.1 기능 요구사항 (FR)

| ID | 요구사항 | 구현 위치 | 상태 |
|----|---------|----------|------|
| FR-001 | 폼 레이아웃 (수직/수평/인라인) | `FormTemplate` - `layout` prop | ✅ |
| FR-002 | 유효성 검사 | Ant Design Form rules 연동 | ✅ |
| FR-003 | 저장/취소 버튼 | `FormTemplate` - Button 컴포넌트 | ✅ |
| FR-004 | 수정된 필드 표시 | `useFormDirty` 훅 | ✅ |
| FR-005 | 폼 초기화/리셋 | `handleReset` 함수 | ✅ |

### 4.2 비즈니스 규칙 (BR)

| ID | 규칙 | 구현 위치 | 상태 |
|----|------|----------|------|
| BR-01 | 저장 전 유효성 검사 필수 | `Form` - `onFinish` | ✅ |
| BR-02 | 변경 시 이탈 확인 | `handleCancel`, `beforeunload` | ✅ |
| BR-03 | 필수 필드 표시 | Ant Design Form.Item `required` | ✅ |
| BR-04 | 저장 중 중복 클릭 방지 | `loading` prop, Button `disabled` | ✅ |
| BR-05 | 첫 에러 필드로 포커스 | `scrollToFirstError`, `handleSubmitFailed` | ✅ |
| BR-06 | 수정된 필드 시각적 표시 | `data-dirty` 속성 | ✅ |

---

## 5. 사용 예시

### 5.1 기본 사용

```tsx
import { FormTemplate } from '@/components/templates';
import { Form, Input } from 'antd';

function UserCreatePage() {
  const handleSubmit = async (values) => {
    await api.createUser(values);
    message.success('저장되었습니다');
    router.back();
  };

  return (
    <FormTemplate
      title="사용자"
      mode="create"
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      enableDirtyCheck
    >
      <Form.Item
        name="name"
        label="이름"
        rules={[{ required: true, message: '이름을 입력해주세요' }]}
      >
        <Input data-testid="form-field-name" />
      </Form.Item>
      <Form.Item
        name="email"
        label="이메일"
        rules={[
          { required: true, message: '이메일을 입력해주세요' },
          { type: 'email', message: '올바른 이메일 형식이 아닙니다' }
        ]}
      >
        <Input data-testid="form-field-email" />
      </Form.Item>
    </FormTemplate>
  );
}
```

### 5.2 외부 form 인스턴스 사용

```tsx
function UserEditPage() {
  const [form] = Form.useForm();

  // 외부에서 form 값 제어
  const handleLoadData = async () => {
    const data = await api.getUser(id);
    form.setFieldsValue(data);
  };

  return (
    <FormTemplate
      form={form}
      title="사용자"
      mode="edit"
      initialValues={userData}
      onSubmit={handleSubmit}
    >
      {/* ... */}
    </FormTemplate>
  );
}
```

### 5.3 수평 레이아웃

```tsx
<FormTemplate
  layout="horizontal"
  labelCol={{ span: 6 }}
  wrapperCol={{ span: 18 }}
  onSubmit={handleSubmit}
>
  {/* ... */}
</FormTemplate>
```

---

## 6. data-testid 목록

| data-testid | 설명 |
|-------------|------|
| `form-template` | 폼 컨테이너 |
| `form-template-title` | 폼 제목 |
| `form-submit-btn` | 저장 버튼 |
| `form-cancel-btn` | 취소 버튼 |
| `form-reset-btn` | 초기화 버튼 |
| `form-error-alert` | 폼 레벨 에러 Alert |
| `form-field-{name}` | 폼 필드 (사용처에서 설정) |

---

## 7. 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| antd | 6.x | Form, Card, Button, Alert, Space |
| react | 19.x | 컴포넌트 기반 |
| @/lib/utils/confirm | - | 취소 확인 다이얼로그 (TSK-05-02) |

---

## 8. 테스트 결과 요약

| 항목 | 값 |
|------|-----|
| 단위 테스트 | 26/26 Pass (100%) |
| 커버리지 (Lines) | 82.35% |
| 커버리지 (Branches) | 84.28% |
| 요구사항 커버리지 | 100% |

상세 내용은 `070-tdd-test-results.md` 참조

---

## 9. 제한사항 및 향후 과제

### 9.1 현재 제한사항

- E2E 테스트: 샘플 화면(TSK-06-07) 구현 후 추가 예정
- 자동 저장 (Draft): Phase 2에서 구현 예정
- 파일 업로드: 별도 컴포넌트로 구현 필요

### 9.2 향후 과제

1. **E2E 테스트 추가** - 샘플 화면 연동 테스트
2. **변경 표시 UI** - 필드별 시각적 변경 표시 개선
3. **자동 저장** - 일정 시간마다 임시 저장

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-22 | Claude | 최초 작성 |
