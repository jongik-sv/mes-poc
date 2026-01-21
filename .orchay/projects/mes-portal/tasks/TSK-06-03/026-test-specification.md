# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 - **Last Updated:** 2026-01-21

> **목적**: 입력/수정 폼 템플릿(FormTemplate)의 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-03 |
| Task명 | 입력/수정 폼 템플릿 |
| 상세설계 참조 | `010-design.md` |
| PRD 참조 | PRD 4.1.1 입력/수정 폼 화면, 폼 검증 |
| 작성일 | 2026-01-21 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | FormTemplate 컴포넌트, useFormTemplate 훅, 유틸리티 함수 | 80% 이상 |
| E2E 테스트 | 폼 입력, 유효성 검사, 저장/취소 시나리오 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형, 변경 감지 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |

### 1.3 위험 기반 테스트 우선순위

| 우선순위 | 위험 영역 | 테스트 초점 |
|---------|---------|------------|
| Critical | 유효성 검사 실패 시 데이터 제출 | 필수 필드 검증, 저장 전 전체 유효성 검사 |
| High | 변경사항 손실 | 취소 시 확인 다이얼로그, 페이지 이탈 경고 |
| High | 저장 중 중복 제출 | 저장 버튼 로딩 상태, 중복 클릭 방지 |
| Medium | 레이아웃 깨짐 | 수직/수평/인라인 레이아웃 동작 |
| Medium | 수정 모드 데이터 로드 | initialValues 적용 확인 |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | FormTemplate | 기본 렌더링 | 폼, 저장/취소 버튼 표시 | FR-001 |
| UT-002 | FormTemplate | layout='vertical' 렌더링 | 수직 레이아웃 적용 | FR-002 |
| UT-003 | FormTemplate | layout='horizontal' 렌더링 | 수평 레이아웃 적용 | FR-002 |
| UT-004 | FormTemplate | layout='inline' 렌더링 | 인라인 레이아웃 적용 | FR-002 |
| UT-005 | FormTemplate | initialValues 적용 | 초기값이 폼에 채워짐 | FR-003 |
| UT-006 | FormTemplate | 필수 필드 유효성 실패 | 에러 메시지 표시 | BR-01 |
| UT-007 | FormTemplate | 유효한 데이터 제출 | onSubmit 콜백 호출 | FR-004 |
| UT-008 | FormTemplate | 저장 버튼 로딩 상태 | 버튼 비활성화, 스피너 표시 | BR-04 |
| UT-009 | FormTemplate | 취소 버튼 클릭 (변경 없음) | onCancel 즉시 호출 | FR-005 |
| UT-010 | FormTemplate | 취소 버튼 클릭 (변경 있음) | 확인 다이얼로그 표시 | BR-02 |
| UT-011 | FormTemplate | 제목 렌더링 | title prop 표시 | FR-006 |
| UT-012 | FormTemplate | 커스텀 버튼 텍스트 | submitText, cancelText 적용 | FR-007 |
| UT-013 | FormTemplate | 에러 필드 포커스 | 첫 번째 에러 필드로 스크롤 | BR-01 |
| UT-014 | FormTemplate | 변경 감지 활성화 | enableDirtyCheck=true 시 dirty 상태 추적 | FR-008 |
| UT-015 | FormTemplate | 변경 감지 비활성화 | enableDirtyCheck=false 시 취소 확인 없음 | FR-008 |

### 2.2 테스트 케이스 상세

#### UT-001: FormTemplate 기본 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/FormTemplate.spec.tsx` |
| **테스트 블록** | `describe('FormTemplate') -> describe('렌더링') -> it('기본 폼 요소를 렌더링한다')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<FormTemplate onSubmit={mockOnSubmit}><Form.Item name="test"><Input /></Form.Item></FormTemplate>` |
| **검증 포인트** | 폼 요소, 저장 버튼, 취소 버튼 존재 확인 |
| **커버리지 대상** | 기본 렌더링 로직 |
| **관련 요구사항** | FR-001 |

```typescript
// 예시 테스트 코드
it('기본 폼 요소를 렌더링한다', () => {
  render(
    <FormTemplate onSubmit={mockOnSubmit}>
      <Form.Item name="name" label="이름">
        <Input />
      </Form.Item>
    </FormTemplate>
  );

  expect(screen.getByRole('form')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /저장/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /취소/i })).toBeInTheDocument();
});
```

#### UT-006: 필수 필드 유효성 실패

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/FormTemplate.spec.tsx` |
| **테스트 블록** | `describe('FormTemplate') -> describe('유효성 검사') -> it('필수 필드 미입력 시 에러를 표시한다')` |
| **Mock 의존성** | - |
| **입력 데이터** | 필수 필드가 있는 폼, 빈 값으로 제출 시도 |
| **검증 포인트** | 에러 메시지 표시, onSubmit 미호출 |
| **커버리지 대상** | 유효성 검사 분기 |
| **관련 요구사항** | BR-01 |

```typescript
it('필수 필드 미입력 시 에러를 표시한다', async () => {
  const mockOnSubmit = vi.fn();

  render(
    <FormTemplate onSubmit={mockOnSubmit}>
      <Form.Item name="name" label="이름" rules={[{ required: true, message: '필수 항목입니다' }]}>
        <Input data-testid="name-input" />
      </Form.Item>
    </FormTemplate>
  );

  await userEvent.click(screen.getByRole('button', { name: /저장/i }));

  await waitFor(() => {
    expect(screen.getByText('필수 항목입니다')).toBeInTheDocument();
  });
  expect(mockOnSubmit).not.toHaveBeenCalled();
});
```

#### UT-007: 유효한 데이터 제출

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/FormTemplate.spec.tsx` |
| **테스트 블록** | `describe('FormTemplate') -> describe('제출') -> it('유효한 데이터 입력 시 onSubmit을 호출한다')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ name: '테스트 사용자', email: 'test@example.com' }` |
| **검증 포인트** | onSubmit 콜백이 입력값과 함께 호출됨 |
| **커버리지 대상** | 제출 성공 로직 |
| **관련 요구사항** | FR-004 |

```typescript
it('유효한 데이터 입력 시 onSubmit을 호출한다', async () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

  render(
    <FormTemplate onSubmit={mockOnSubmit}>
      <Form.Item name="name" label="이름" rules={[{ required: true }]}>
        <Input data-testid="name-input" />
      </Form.Item>
    </FormTemplate>
  );

  await userEvent.type(screen.getByTestId('name-input'), '테스트 사용자');
  await userEvent.click(screen.getByRole('button', { name: /저장/i }));

  await waitFor(() => {
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: '테스트 사용자' })
    );
  });
});
```

#### UT-008: 저장 버튼 로딩 상태

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/FormTemplate.spec.tsx` |
| **테스트 블록** | `describe('FormTemplate') -> describe('로딩 상태') -> it('저장 중 버튼이 비활성화되고 로딩이 표시된다')` |
| **Mock 의존성** | - |
| **입력 데이터** | `loading={true}` prop |
| **검증 포인트** | 저장 버튼 비활성화, 스피너 표시 |
| **커버리지 대상** | 로딩 상태 처리 |
| **관련 요구사항** | BR-04 |

```typescript
it('저장 중 버튼이 비활성화되고 로딩이 표시된다', () => {
  render(
    <FormTemplate onSubmit={mockOnSubmit} loading={true}>
      <Form.Item name="name"><Input /></Form.Item>
    </FormTemplate>
  );

  const submitButton = screen.getByRole('button', { name: /저장/i });
  expect(submitButton).toBeDisabled();
  expect(submitButton.querySelector('.ant-btn-loading-icon')).toBeInTheDocument();
});
```

#### UT-010: 취소 버튼 클릭 (변경 있음)

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/FormTemplate.spec.tsx` |
| **테스트 블록** | `describe('FormTemplate') -> describe('취소') -> it('변경사항 있을 때 취소 시 확인 다이얼로그를 표시한다')` |
| **Mock 의존성** | TSK-05-02 confirmDiscard 함수 mock |
| **입력 데이터** | 폼 필드 수정 후 취소 클릭 |
| **검증 포인트** | 확인 다이얼로그 표시, 확인 시 onCancel 호출 |
| **커버리지 대상** | 변경 감지 및 취소 확인 로직 |
| **관련 요구사항** | BR-02 |

```typescript
it('변경사항 있을 때 취소 시 확인 다이얼로그를 표시한다', async () => {
  const mockOnCancel = vi.fn();
  const mockConfirmDiscard = vi.fn();
  vi.mock('@/lib/utils/confirm', () => ({
    confirmDiscard: mockConfirmDiscard
  }));

  render(
    <FormTemplate onSubmit={mockOnSubmit} onCancel={mockOnCancel} enableDirtyCheck={true}>
      <Form.Item name="name"><Input data-testid="name-input" /></Form.Item>
    </FormTemplate>
  );

  // 필드 수정
  await userEvent.type(screen.getByTestId('name-input'), '변경된 값');

  // 취소 클릭
  await userEvent.click(screen.getByRole('button', { name: /취소/i }));

  expect(mockConfirmDiscard).toHaveBeenCalled();
});
```

#### UT-013: 에러 필드 포커스

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/FormTemplate.spec.tsx` |
| **테스트 블록** | `describe('FormTemplate') -> describe('유효성 검사') -> it('첫 번째 에러 필드로 스크롤한다')` |
| **Mock 의존성** | `scrollIntoView` mock |
| **입력 데이터** | 여러 필수 필드가 있는 폼, 모두 빈 값으로 제출 |
| **검증 포인트** | 첫 번째 에러 필드에 포커스/스크롤 |
| **커버리지 대상** | 에러 필드 포커스 로직 |
| **관련 요구사항** | BR-01 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 신규 등록 성공 | 폼 페이지 접근 | 필드 입력 -> 저장 | 저장 성공, 이동 | FR-001, FR-004 |
| E2E-002 | 필수 필드 누락 에러 | 폼 페이지 접근 | 필수 필드 비움 -> 저장 | 에러 메시지 표시 | BR-01 |
| E2E-003 | 수정 모드 데이터 로드 | 기존 데이터 존재 | 수정 페이지 접근 | 기존 값 채워짐 | FR-003 |
| E2E-004 | 변경 후 취소 경고 | 폼 수정 상태 | 필드 수정 -> 취소 | 확인 다이얼로그 | BR-02 |
| E2E-005 | 저장 중 중복 클릭 방지 | 폼 작성 완료 | 저장 버튼 연속 클릭 | 단일 요청 | BR-04 |
| E2E-006 | 다양한 필드 타입 유효성 | 폼 페이지 접근 | 다양한 유효성 규칙 테스트 | 각 규칙별 에러 | BR-01 |
| E2E-007 | 수직 레이아웃 확인 | layout='vertical' | 페이지 접근 | 라벨이 필드 위에 위치 | FR-002 |
| E2E-008 | 수평 레이아웃 확인 | layout='horizontal' | 페이지 접근 | 라벨이 필드 좌측에 위치 | FR-002 |
| E2E-009 | 변경된 필드 시각적 표시 | 수정 모드 | 필드 값 변경 | 변경 표시 스타일 적용 | FR-008 |
| E2E-010 | 페이지 이탈 경고 | 폼 수정 상태 | 브라우저 뒤로가기 | 브라우저 확인창 | BR-02 |

### 3.2 테스트 케이스 상세

#### E2E-001: 신규 등록 성공

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/form-template.spec.ts` |
| **테스트명** | `test('사용자가 폼을 작성하고 저장할 수 있다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 폼 컨테이너 | `[data-testid="form-template"]` |
| - 이름 입력 | `[data-testid="form-field-name"]` |
| - 이메일 입력 | `[data-testid="form-field-email"]` |
| - 저장 버튼 | `[data-testid="form-submit-btn"]` |
| - 취소 버튼 | `[data-testid="form-cancel-btn"]` |
| **실행 단계** | |
| 1 | `await page.goto('/sample/user/new')` |
| 2 | `await page.fill('[data-testid="form-field-name"]', '홍길동')` |
| 3 | `await page.fill('[data-testid="form-field-email"]', 'hong@example.com')` |
| 4 | `await page.click('[data-testid="form-submit-btn"]')` |
| **API 확인** | `POST /api/users` -> 201 |
| **검증 포인트** | `expect(page).toHaveURL('/sample/users')`, 성공 토스트 표시 |
| **스크린샷** | `e2e-001-form-before.png`, `e2e-001-form-after.png` |
| **관련 요구사항** | FR-001, FR-004 |

```typescript
test('사용자가 폼을 작성하고 저장할 수 있다', async ({ page }) => {
  await page.goto('/sample/user/new');

  // 폼 요소 확인
  await expect(page.locator('[data-testid="form-template"]')).toBeVisible();

  // 데이터 입력
  await page.fill('[data-testid="form-field-name"]', '홍길동');
  await page.fill('[data-testid="form-field-email"]', 'hong@example.com');

  // 저장 전 스크린샷
  await page.screenshot({ path: 'e2e-001-form-before.png' });

  // 저장
  const responsePromise = page.waitForResponse(resp =>
    resp.url().includes('/api/users') && resp.request().method() === 'POST'
  );
  await page.click('[data-testid="form-submit-btn"]');
  const response = await responsePromise;

  expect(response.status()).toBe(201);

  // 성공 후 이동 확인
  await expect(page).toHaveURL('/sample/users');

  // 저장 후 스크린샷
  await page.screenshot({ path: 'e2e-001-form-after.png' });
});
```

#### E2E-002: 필수 필드 누락 에러

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/form-template.spec.ts` |
| **테스트명** | `test('필수 필드 미입력 시 에러 메시지가 표시된다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 에러 메시지 | `[data-testid="form-field-name-error"]` |
| **실행 단계** | |
| 1 | `await page.goto('/sample/user/new')` |
| 2 | `await page.click('[data-testid="form-submit-btn"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="form-field-name-error"]')).toContainText('필수')` |
| **스크린샷** | `e2e-002-validation-error.png` |
| **관련 요구사항** | BR-01 |

```typescript
test('필수 필드 미입력 시 에러 메시지가 표시된다', async ({ page }) => {
  await page.goto('/sample/user/new');

  // 입력 없이 저장 시도
  await page.click('[data-testid="form-submit-btn"]');

  // 에러 메시지 확인
  await expect(page.locator('[data-testid="form-field-name-error"]')).toBeVisible();
  await expect(page.locator('[data-testid="form-field-name-error"]')).toContainText('필수');

  // 스크린샷
  await page.screenshot({ path: 'e2e-002-validation-error.png' });
});
```

#### E2E-004: 변경 후 취소 경고

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/form-template.spec.ts` |
| **테스트명** | `test('변경사항 있을 때 취소하면 확인 다이얼로그가 표시된다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 확인 다이얼로그 | `.ant-modal-confirm` |
| - 나가기 버튼 | `.ant-modal-confirm .ant-btn-primary` 또는 `[data-testid="confirm-ok-btn"]` |
| - 계속 수정 버튼 | `.ant-modal-confirm .ant-btn-default` 또는 `[data-testid="confirm-cancel-btn"]` |
| **실행 단계** | |
| 1 | `await page.goto('/sample/user/new')` |
| 2 | `await page.fill('[data-testid="form-field-name"]', '테스트')` |
| 3 | `await page.click('[data-testid="form-cancel-btn"]')` |
| **검증 포인트** | 확인 다이얼로그 표시, "저장하지 않은 내용" 메시지 |
| **스크린샷** | `e2e-004-discard-confirm.png` |
| **관련 요구사항** | BR-02 |

```typescript
test('변경사항 있을 때 취소하면 확인 다이얼로그가 표시된다', async ({ page }) => {
  await page.goto('/sample/user/new');

  // 필드 수정
  await page.fill('[data-testid="form-field-name"]', '테스트');

  // 취소 클릭
  await page.click('[data-testid="form-cancel-btn"]');

  // 확인 다이얼로그 표시 확인
  await expect(page.locator('.ant-modal-confirm')).toBeVisible();
  await expect(page.locator('.ant-modal-confirm-body')).toContainText('저장하지 않은');

  // 스크린샷
  await page.screenshot({ path: 'e2e-004-discard-confirm.png' });

  // "계속 수정" 클릭 시 폼에 머무름
  await page.click('.ant-modal-confirm .ant-btn-default');
  await expect(page.locator('[data-testid="form-template"]')).toBeVisible();
  await expect(page.locator('[data-testid="form-field-name"]')).toHaveValue('테스트');
});
```

#### E2E-005: 저장 중 중복 클릭 방지

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/form-template.spec.ts` |
| **테스트명** | `test('저장 중에는 버튼이 비활성화되어 중복 제출이 방지된다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **실행 단계** | |
| 1 | `await page.goto('/sample/user/new')` |
| 2 | 필수 필드 입력 |
| 3 | 저장 버튼 클릭 |
| 4 | 로딩 중 버튼 상태 확인 |
| **검증 포인트** | 저장 버튼 disabled 상태, API 단일 호출 |
| **관련 요구사항** | BR-04 |

```typescript
test('저장 중에는 버튼이 비활성화되어 중복 제출이 방지된다', async ({ page }) => {
  let requestCount = 0;

  await page.route('**/api/users', async (route) => {
    requestCount++;
    // 응답 지연
    await new Promise(resolve => setTimeout(resolve, 1000));
    await route.fulfill({ status: 201, body: JSON.stringify({ id: 1 }) });
  });

  await page.goto('/sample/user/new');

  // 필드 입력
  await page.fill('[data-testid="form-field-name"]', '홍길동');
  await page.fill('[data-testid="form-field-email"]', 'hong@example.com');

  // 저장 클릭
  await page.click('[data-testid="form-submit-btn"]');

  // 로딩 중 버튼 상태 확인
  await expect(page.locator('[data-testid="form-submit-btn"]')).toBeDisabled();

  // 중복 클릭 시도 (비활성화 상태이므로 클릭 불가)
  await page.click('[data-testid="form-submit-btn"]', { force: true });
  await page.click('[data-testid="form-submit-btn"]', { force: true });

  // 완료 대기
  await page.waitForResponse(resp => resp.url().includes('/api/users'));

  // API 호출 횟수 확인
  expect(requestCount).toBe(1);
});
```

#### E2E-006: 다양한 필드 타입 유효성

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/form-template.spec.ts` |
| **테스트명** | `test('다양한 유효성 규칙이 올바르게 동작한다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **테스트 데이터** | |
| - 이메일 형식 | `invalid-email` -> 에러 |
| - 최소 길이 | `ab` (최소 3자) -> 에러 |
| - 숫자 범위 | `150` (0-100) -> 에러 |
| - 패턴 | `abc` (숫자만) -> 에러 |
| **검증 포인트** | 각 규칙별 에러 메시지 표시 |
| **관련 요구사항** | BR-01 |

```typescript
test.describe('유효성 검사 규칙', () => {
  test('이메일 형식 검사', async ({ page }) => {
    await page.goto('/sample/user/new');
    await page.fill('[data-testid="form-field-email"]', 'invalid-email');
    await page.click('[data-testid="form-submit-btn"]');

    await expect(page.locator('[data-testid="form-field-email-error"]'))
      .toContainText('유효한 이메일');
  });

  test('최소 길이 검사', async ({ page }) => {
    await page.goto('/sample/user/new');
    await page.fill('[data-testid="form-field-name"]', 'ab');
    await page.click('[data-testid="form-submit-btn"]');

    await expect(page.locator('[data-testid="form-field-name-error"]'))
      .toContainText('3자 이상');
  });

  test('숫자 범위 검사', async ({ page }) => {
    await page.goto('/sample/user/new');
    await page.fill('[data-testid="form-field-age"]', '150');
    await page.click('[data-testid="form-submit-btn"]');

    await expect(page.locator('[data-testid="form-field-age-error"]'))
      .toContainText('0에서 100 사이');
  });
});
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 수직 레이아웃 UI | 폼 페이지 | layout='vertical' 설정 | 라벨이 필드 위에 위치 | Medium | FR-002 |
| TC-002 | 수평 레이아웃 UI | 폼 페이지 | layout='horizontal' 설정 | 라벨이 필드 좌측에 위치 | Medium | FR-002 |
| TC-003 | 인라인 레이아웃 UI | 폼 페이지 | layout='inline' 설정 | 필드들이 한 줄에 배치 | Medium | FR-002 |
| TC-004 | 필수 필드 표시 | 폼 페이지 | 필수 필드 확인 | 라벨에 * 표시 | High | BR-03 |
| TC-005 | 에러 메시지 스타일 | 폼 페이지 | 유효성 실패 | 빨간색 에러 텍스트 | High | BR-01 |
| TC-006 | 반응형 레이아웃 | 폼 페이지 | 브라우저 크기 조절 | 레이아웃 적응 | Medium | - |
| TC-007 | 키보드 네비게이션 | 폼 페이지 | Tab 키로 이동 | 모든 필드 접근 가능 | Medium | A11y |
| TC-008 | 저장 버튼 로딩 | 폼 작성 완료 | 저장 클릭 | 스피너 표시, 버튼 비활성화 | High | BR-04 |
| TC-009 | 변경된 필드 하이라이트 | 수정 모드 | 필드 값 변경 | 변경된 필드 시각적 표시 | Medium | FR-008 |
| TC-010 | 에러 필드 스크롤 | 긴 폼 | 하단 에러 발생 | 에러 필드로 자동 스크롤 | Medium | BR-01 |
| TC-011 | 다크 모드 | 다크 테마 | 폼 페이지 접근 | 다크 모드 스타일 적용 | Low | - |
| TC-012 | 포커스 표시 | 폼 페이지 | 필드 포커스 | outline 표시 | Medium | A11y |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 수직 레이아웃 UI

**테스트 목적**: layout='vertical' 설정 시 라벨이 입력 필드 위에 올바르게 위치하는지 확인

**테스트 단계**:
1. 수직 레이아웃 폼 페이지 접근
2. 라벨과 입력 필드 위치 확인
3. 여러 필드에 대해 동일 패턴 확인

**예상 결과**:
- 라벨이 입력 필드 바로 위에 위치함
- 라벨과 필드 사이 적절한 간격
- 모든 필드가 전체 너비 사용

**검증 기준**:
- [ ] 라벨이 필드 위에 위치함
- [ ] 필드가 전체 너비를 차지함
- [ ] 일관된 간격 적용

#### TC-004: 필수 필드 표시

**테스트 목적**: 필수 필드에 시각적 표시(*)가 올바르게 나타나는지 확인

**테스트 단계**:
1. 폼 페이지 접근
2. 필수 필드의 라벨 확인
3. 선택 필드와 비교

**예상 결과**:
- 필수 필드 라벨 옆에 빨간색 * 표시
- 선택 필드에는 * 없음
- 스크린 리더가 "필수" 정보 인식

**검증 기준**:
- [ ] 필수 필드에 * 표시됨
- [ ] * 색상이 빨간색
- [ ] ARIA required 속성 설정됨

#### TC-007: 키보드 네비게이션

**테스트 목적**: 키보드만으로 폼의 모든 기능을 사용할 수 있는지 확인

**테스트 단계**:
1. 폼 페이지 접근
2. Tab 키로 필드 간 이동
3. Enter 키로 제출
4. Escape 키로 모달 닫기 (해당 시)

**예상 결과**:
- Tab으로 모든 필드 순차 접근
- Shift+Tab으로 역순 이동
- 포커스 표시 명확

**검증 기준**:
- [ ] 모든 입력 필드 Tab 접근 가능
- [ ] 저장/취소 버튼 Tab 접근 가능
- [ ] 포커스 순서가 논리적

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-USER-NEW | 신규 사용자 입력 | `{ name: '홍길동', email: 'hong@example.com', phone: '010-1234-5678' }` |
| MOCK-USER-EDIT | 수정용 기존 사용자 | `{ id: 'user-1', name: '김철수', email: 'kim@example.com', phone: '010-9876-5432' }` |
| MOCK-INVALID-EMAIL | 잘못된 이메일 | `{ email: 'invalid-email' }` |
| MOCK-SHORT-NAME | 최소 길이 미달 | `{ name: 'ab' }` |
| MOCK-EMPTY-REQUIRED | 필수 필드 누락 | `{ name: '', email: '' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-USER | 사용자 수정 테스트 | 자동 시드 | 사용자 1명 (id: 'user-edit-1') |
| SEED-E2E-EMPTY | 신규 등록 테스트 | - | 기존 데이터 없음 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 폼 테스트 |
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 폼 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 FormTemplate 컴포넌트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `form-template` | 폼 컨테이너 | 폼 존재 확인 |
| `form-template-title` | 폼 제목 | 제목 표시 확인 |
| `form-submit-btn` | 저장 버튼 | 저장 동작 테스트 |
| `form-cancel-btn` | 취소 버튼 | 취소 동작 테스트 |
| `form-reset-btn` | 초기화 버튼 | 폼 리셋 동작 테스트 |
| `form-field-{name}` | 폼 필드 입력 | 필드 입력 테스트 |
| `form-field-{name}-error` | 필드 에러 메시지 | 유효성 에러 확인 |
| `form-loading` | 로딩 오버레이 | 로딩 상태 확인 |

### 6.2 확인 다이얼로그 (TSK-05-02 연동)

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `confirm-dialog` | 다이얼로그 컨테이너 | 다이얼로그 표시 확인 |
| `confirm-ok-btn` | 확인/나가기 버튼 | 확인 동작 테스트 |
| `confirm-cancel-btn` | 취소/계속 수정 버튼 | 취소 동작 테스트 |

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |
| Statements | 80% | 70% |

### 7.2 주요 커버리지 대상

| 파일 | 주요 함수/분기 | 우선순위 |
|------|---------------|---------|
| FormTemplate.tsx | render, handleSubmit, handleCancel | Critical |
| FormTemplate.tsx | layout 분기 (vertical/horizontal/inline) | High |
| FormTemplate.tsx | dirty check 로직 | High |
| FormTemplate.tsx | loading 상태 처리 | High |
| useFormTemplate.ts (선택적) | isDirty, reset, setFieldsValue | Medium |

### 7.3 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 기능 요구사항 (FR) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

---

## 8. 경계 조건 및 엣지 케이스

### 8.1 입력 경계 테스트

| 경계 조건 | 테스트 값 | 예상 동작 |
|----------|----------|----------|
| 빈 문자열 | `""` | 필수 필드 에러 |
| 공백만 | `"   "` | 필수 필드 에러 (trim 적용 시) |
| 최소 길이 -1 | 2자 (최소 3자) | 길이 에러 |
| 최소 길이 | 3자 | 통과 |
| 최대 길이 | 100자 | 통과 |
| 최대 길이 +1 | 101자 | 길이 에러 |
| 특수 문자 | `<script>` | XSS 방지/에스케이프 |
| 한글 입력 | `'홍길동'` | 정상 처리 |
| 이모지 | `:smile:` | 정상 처리 또는 에러 |

### 8.2 상태 전이 테스트

| 시작 상태 | 이벤트 | 종료 상태 | 검증 |
|----------|-------|----------|------|
| clean | 필드 입력 | dirty | isDirty=true |
| dirty | 초기값 복원 | clean | isDirty=false |
| idle | 저장 클릭 | loading | 버튼 비활성화 |
| loading | 저장 성공 | idle | 화면 이동 |
| loading | 저장 실패 | error | 에러 표시, 버튼 활성화 |

### 8.3 동시성/타이밍 테스트

| 시나리오 | 설명 | 예상 동작 |
|---------|------|----------|
| 빠른 더블 클릭 | 저장 버튼 연속 클릭 | 단일 요청만 발생 |
| 느린 네트워크 | 저장 중 취소 클릭 | 진행 중 요청 무시 또는 취소 |
| 동시 수정 | 여러 탭에서 동일 데이터 수정 | 충돌 처리 (서버 측) |

---

## 관련 문서

- 상세설계: `010-design.md`
- PRD: `.orchay/projects/mes-portal/prd.md` (4.1.1 입력/수정 폼 화면, 폼 검증)
- 확인 다이얼로그 설계: `../TSK-05-02/010-design.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | Claude | 최초 작성 |
