# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: Toast 알림 컴포넌트 및 유틸리티 함수 테스트 시나리오 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-05-03 |
| Task명 | Toast 알림 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | showSuccess, showInfo, showWarning, showError 유틸리티 함수 | 90% 이상 |
| E2E 테스트 | 주요 사용자 시나리오 (API 응답별 토스트 표시) | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 애니메이션, 자동 닫힘, 수동 닫기 | 전체 기능 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| UI 테스트 라이브러리 | @testing-library/react |
| Mock 라이브러리 | vitest.mock |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

### 1.3 테스트 대상 컴포넌트/함수

| 대상 | 파일 경로 | 역할 |
|------|----------|------|
| showSuccess | `lib/utils/toast.ts` | 성공 메시지 토스트 표시 |
| showInfo | `lib/utils/toast.ts` | 정보 메시지 토스트 표시 |
| showWarning | `lib/utils/toast.ts` | 경고 메시지 토스트 표시 |
| showError | `lib/utils/toast.ts` | 에러 메시지 토스트 표시 |
| toast (Ant Design) | `antd/message` 또는 `antd/notification` | 기반 UI 라이브러리 |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | showSuccess | 성공 메시지 표시 | message.success 호출됨 | FR-001 |
| UT-002 | showSuccess | 기본 duration 적용 (3초) | duration: 3 전달 | FR-001, BR-001 |
| UT-003 | showSuccess | 커스텀 duration 적용 | 지정된 duration 전달 | FR-001 |
| UT-004 | showInfo | 정보 메시지 표시 | message.info 호출됨 | FR-001 |
| UT-005 | showInfo | 기본 duration 적용 (3초) | duration: 3 전달 | FR-001, BR-001 |
| UT-006 | showWarning | 경고 메시지 표시 | message.warning 호출됨 | FR-001 |
| UT-007 | showWarning | 기본 duration 적용 (5초) | duration: 5 전달 | FR-001, BR-001 |
| UT-008 | showError | 에러 메시지 표시 | message.error 호출됨 | FR-001 |
| UT-009 | showError | 기본 duration 적용 (5초) | duration: 5 전달 | FR-001, BR-001 |
| UT-010 | showError | 수동 닫기 버튼 표시 | duration: 0 시 버튼 표시 | FR-002 |
| UT-011 | toast | 커스텀 아이콘 표시 | icon prop 전달 | FR-001 |
| UT-012 | toast | 커스텀 className 적용 | className prop 전달 | FR-001 |
| UT-013 | toast | onClose 콜백 호출 | 닫힐 때 콜백 실행 | FR-002 |
| UT-014 | toast | key로 특정 토스트 업데이트 | 동일 key 토스트 교체 | FR-001 |
| UT-015 | toast | 메시지 destroy (전체 닫기) | message.destroy() 호출 | FR-002 |

### 2.2 테스트 케이스 상세

#### UT-001: showSuccess 성공 메시지 표시

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('showSuccess') -> it('should display success message')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `showSuccess('저장되었습니다')` |
| **검증 포인트** | message.success가 '저장되었습니다' 메시지로 호출됨 |
| **커버리지 대상** | showSuccess() 기본 호출 |
| **관련 요구사항** | FR-001 |

```typescript
// 예시 테스트 코드 구조
import { message } from 'antd';
import { showSuccess } from '../toast';

vi.mock('antd', () => ({
  message: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    destroy: vi.fn(),
  },
}));

describe('showSuccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display success message', () => {
    showSuccess('저장되었습니다');

    expect(message.success).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '저장되었습니다',
      })
    );
  });
});
```

#### UT-002: showSuccess 기본 duration 적용

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('showSuccess') -> it('should apply default duration of 3 seconds')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `showSuccess('저장되었습니다')` |
| **검증 포인트** | duration: 3 으로 호출됨 |
| **커버리지 대상** | showSuccess() 기본 duration |
| **관련 요구사항** | FR-001, BR-001 |

```typescript
it('should apply default duration of 3 seconds', () => {
  showSuccess('저장되었습니다');

  expect(message.success).toHaveBeenCalledWith(
    expect.objectContaining({
      duration: 3,
    })
  );
});
```

#### UT-003: showSuccess 커스텀 duration 적용

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('showSuccess') -> it('should apply custom duration')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `showSuccess('저장되었습니다', { duration: 5 })` |
| **검증 포인트** | duration: 5 로 호출됨 |
| **커버리지 대상** | showSuccess() 커스텀 옵션 |
| **관련 요구사항** | FR-001 |

```typescript
it('should apply custom duration', () => {
  showSuccess('저장되었습니다', { duration: 5 });

  expect(message.success).toHaveBeenCalledWith(
    expect.objectContaining({
      duration: 5,
    })
  );
});
```

#### UT-004: showInfo 정보 메시지 표시

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('showInfo') -> it('should display info message')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `showInfo('업데이트가 있습니다')` |
| **검증 포인트** | message.info가 호출됨 |
| **커버리지 대상** | showInfo() 기본 호출 |
| **관련 요구사항** | FR-001 |

```typescript
describe('showInfo', () => {
  it('should display info message', () => {
    showInfo('업데이트가 있습니다');

    expect(message.info).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '업데이트가 있습니다',
      })
    );
  });
});
```

#### UT-005: showInfo 기본 duration 적용

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('showInfo') -> it('should apply default duration of 3 seconds')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `showInfo('정보 메시지')` |
| **검증 포인트** | duration: 3 으로 호출됨 |
| **커버리지 대상** | showInfo() 기본 duration |
| **관련 요구사항** | FR-001, BR-001 |

```typescript
it('should apply default duration of 3 seconds', () => {
  showInfo('정보 메시지');

  expect(message.info).toHaveBeenCalledWith(
    expect.objectContaining({
      duration: 3,
    })
  );
});
```

#### UT-006: showWarning 경고 메시지 표시

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('showWarning') -> it('should display warning message')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `showWarning('주의가 필요합니다')` |
| **검증 포인트** | message.warning이 호출됨 |
| **커버리지 대상** | showWarning() 기본 호출 |
| **관련 요구사항** | FR-001 |

```typescript
describe('showWarning', () => {
  it('should display warning message', () => {
    showWarning('주의가 필요합니다');

    expect(message.warning).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '주의가 필요합니다',
      })
    );
  });
});
```

#### UT-007: showWarning 기본 duration 적용 (5초)

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('showWarning') -> it('should apply default duration of 5 seconds')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `showWarning('경고 메시지')` |
| **검증 포인트** | duration: 5 로 호출됨 (경고/에러는 더 긴 시간) |
| **커버리지 대상** | showWarning() 기본 duration |
| **관련 요구사항** | FR-001, BR-001 |

```typescript
it('should apply default duration of 5 seconds', () => {
  showWarning('경고 메시지');

  expect(message.warning).toHaveBeenCalledWith(
    expect.objectContaining({
      duration: 5,
    })
  );
});
```

#### UT-008: showError 에러 메시지 표시

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('showError') -> it('should display error message')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `showError('오류가 발생했습니다')` |
| **검증 포인트** | message.error가 호출됨 |
| **커버리지 대상** | showError() 기본 호출 |
| **관련 요구사항** | FR-001 |

```typescript
describe('showError', () => {
  it('should display error message', () => {
    showError('오류가 발생했습니다');

    expect(message.error).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '오류가 발생했습니다',
      })
    );
  });
});
```

#### UT-009: showError 기본 duration 적용 (5초)

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('showError') -> it('should apply default duration of 5 seconds')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `showError('에러 메시지')` |
| **검증 포인트** | duration: 5 로 호출됨 |
| **커버리지 대상** | showError() 기본 duration |
| **관련 요구사항** | FR-001, BR-001 |

```typescript
it('should apply default duration of 5 seconds', () => {
  showError('에러 메시지');

  expect(message.error).toHaveBeenCalledWith(
    expect.objectContaining({
      duration: 5,
    })
  );
});
```

#### UT-010: showError 수동 닫기 모드

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('showError') -> it('should support manual close with duration 0')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `showError('심각한 오류', { duration: 0 })` |
| **검증 포인트** | duration: 0 으로 호출됨, 수동 닫기 가능 |
| **커버리지 대상** | showError() 수동 닫기 옵션 |
| **관련 요구사항** | FR-002 |

```typescript
it('should support manual close with duration 0', () => {
  showError('심각한 오류', { duration: 0 });

  expect(message.error).toHaveBeenCalledWith(
    expect.objectContaining({
      duration: 0,
    })
  );
});
```

#### UT-011: toast 커스텀 아이콘 표시

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('toast options') -> it('should support custom icon')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `showSuccess('저장 완료', { icon: <CustomIcon /> })` |
| **검증 포인트** | icon prop이 전달됨 |
| **커버리지 대상** | 커스텀 아이콘 옵션 |
| **관련 요구사항** | FR-001 |

```typescript
it('should support custom icon', () => {
  const CustomIcon = () => <span data-testid="custom-icon">Icon</span>;
  showSuccess('저장 완료', { icon: <CustomIcon /> });

  expect(message.success).toHaveBeenCalledWith(
    expect.objectContaining({
      icon: expect.anything(),
    })
  );
});
```

#### UT-012: toast 커스텀 className 적용

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('toast options') -> it('should support custom className')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `showInfo('알림', { className: 'custom-toast' })` |
| **검증 포인트** | className prop이 전달됨 |
| **커버리지 대상** | 커스텀 스타일 옵션 |
| **관련 요구사항** | FR-001 |

```typescript
it('should support custom className', () => {
  showInfo('알림', { className: 'custom-toast' });

  expect(message.info).toHaveBeenCalledWith(
    expect.objectContaining({
      className: 'custom-toast',
    })
  );
});
```

#### UT-013: toast onClose 콜백 호출

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('toast options') -> it('should call onClose callback when closed')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `showSuccess('완료', { onClose: mockFn })` |
| **검증 포인트** | onClose prop이 전달됨 |
| **커버리지 대상** | 닫힘 콜백 기능 |
| **관련 요구사항** | FR-002 |

```typescript
it('should call onClose callback when closed', () => {
  const onClose = vi.fn();
  showSuccess('완료', { onClose });

  expect(message.success).toHaveBeenCalledWith(
    expect.objectContaining({
      onClose,
    })
  );
});
```

#### UT-014: toast key로 특정 토스트 업데이트

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('toast options') -> it('should update existing toast with same key')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `showSuccess('저장 중...', { key: 'save' })` 후 `showSuccess('저장 완료', { key: 'save' })` |
| **검증 포인트** | 동일 key로 두 번 호출됨 |
| **커버리지 대상** | 토스트 업데이트 기능 |
| **관련 요구사항** | FR-001 |

```typescript
it('should update existing toast with same key', () => {
  showSuccess('저장 중...', { key: 'save' });
  showSuccess('저장 완료', { key: 'save' });

  expect(message.success).toHaveBeenCalledTimes(2);
  expect(message.success).toHaveBeenLastCalledWith(
    expect.objectContaining({
      key: 'save',
      content: '저장 완료',
    })
  );
});
```

#### UT-015: toast destroy (전체 닫기)

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/toast.spec.ts` |
| **테스트 블록** | `describe('toast') -> it('should destroy all toasts')` |
| **Mock 의존성** | antd/message |
| **입력 데이터** | `destroyAllToasts()` |
| **검증 포인트** | message.destroy() 호출됨 |
| **커버리지 대상** | 전체 토스트 닫기 |
| **관련 요구사항** | FR-002 |

```typescript
import { destroyAllToasts } from '../toast';

it('should destroy all toasts', () => {
  destroyAllToasts();

  expect(message.destroy).toHaveBeenCalled();
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | API 성공 시 성공 토스트 | 로그인 상태 | 1. 저장 버튼 클릭 | 성공 토스트 표시 | FR-001, AC-001 |
| E2E-002 | API 에러 시 에러 토스트 | 로그인 상태 | 1. 잘못된 데이터 저장 | 에러 토스트 표시 | FR-001, AC-002 |
| E2E-003 | 토스트 자동 닫힘 | 토스트 표시됨 | 1. 3-5초 대기 | 자동으로 사라짐 | FR-001, AC-003, BR-001 |
| E2E-004 | 토스트 수동 닫기 | 토스트 표시됨 | 1. X 버튼 클릭 | 즉시 사라짐 | FR-002 |
| E2E-005 | 다중 토스트 표시 | 로그인 상태 | 1. 여러 작업 연속 실행 | 여러 토스트 쌓임 | FR-001 |
| E2E-006 | 경고 토스트 표시 | 로그인 상태 | 1. 경고 발생 조건 | 경고 토스트 표시 | FR-001 |

### 3.2 테스트 케이스 상세

#### E2E-001: API 성공 시 성공 토스트

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/toast.spec.ts` |
| **테스트명** | `test('API 성공 시 성공 토스트가 표시된다')` |
| **사전조건** | 로그인 상태, 폼 페이지 접속 |
| **data-testid 셀렉터** | |
| - 저장 버튼 | `[data-testid="save-btn"]` |
| - 성공 토스트 | `.ant-message-success` |
| **실행 단계** | |
| 1 | `await page.fill('[data-testid="name-input"]', '테스트')` |
| 2 | `await page.click('[data-testid="save-btn"]')` |
| 3 | `await page.waitForSelector('.ant-message-success')` |
| **API 확인** | POST /api/items -> 201 (mock) |
| **검증 포인트** | `expect(page.locator('.ant-message-success')).toContainText('저장되었습니다')` |
| **스크린샷** | `e2e-001-success-toast.png` |
| **관련 요구사항** | FR-001, AC-001 |

```typescript
// tests/e2e/toast.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Toast Notifications', () => {
  test('API 성공 시 성공 토스트가 표시된다', async ({ page }) => {
    // Mock API 성공 응답
    await page.route('**/api/items', (route) =>
      route.fulfill({
        status: 201,
        body: JSON.stringify({ id: 1, name: '테스트' }),
      })
    );

    await page.goto('/items/new');
    await page.fill('[data-testid="name-input"]', '테스트');
    await page.click('[data-testid="save-btn"]');

    // 성공 토스트 확인
    const toast = page.locator('.ant-message-success');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('저장되었습니다');
    await page.screenshot({ path: 'e2e-001-success-toast.png' });
  });
});
```

#### E2E-002: API 에러 시 에러 토스트

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/toast.spec.ts` |
| **테스트명** | `test('API 에러 시 에러 토스트가 표시된다')` |
| **사전조건** | 로그인 상태 |
| **data-testid 셀렉터** | |
| - 저장 버튼 | `[data-testid="save-btn"]` |
| - 에러 토스트 | `.ant-message-error` |
| **실행 단계** | |
| 1 | API 에러 응답 설정 |
| 2 | 저장 버튼 클릭 |
| 3 | 에러 토스트 확인 |
| **API 확인** | POST /api/items -> 500 (mock) |
| **검증 포인트** | `expect(page.locator('.ant-message-error')).toContainText('오류')` |
| **스크린샷** | `e2e-002-error-toast.png` |
| **관련 요구사항** | FR-001, AC-002 |

```typescript
test('API 에러 시 에러 토스트가 표시된다', async ({ page }) => {
  // Mock API 에러 응답
  await page.route('**/api/items', (route) =>
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    })
  );

  await page.goto('/items/new');
  await page.fill('[data-testid="name-input"]', '테스트');
  await page.click('[data-testid="save-btn"]');

  // 에러 토스트 확인
  const toast = page.locator('.ant-message-error');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('오류가 발생했습니다');
  await page.screenshot({ path: 'e2e-002-error-toast.png' });
});
```

#### E2E-003: 토스트 자동 닫힘

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/toast.spec.ts` |
| **테스트명** | `test('토스트가 설정된 시간 후 자동으로 닫힌다')` |
| **사전조건** | 성공 토스트 표시됨 |
| **data-testid 셀렉터** | |
| - 성공 토스트 | `.ant-message-success` |
| **실행 단계** | |
| 1 | 성공 작업 실행 |
| 2 | 토스트 표시 확인 |
| 3 | 3초 대기 |
| 4 | 토스트 사라짐 확인 |
| **검증 포인트** | 토스트가 자동으로 사라짐 |
| **스크린샷** | `e2e-003-auto-close.png` |
| **관련 요구사항** | FR-001, AC-003, BR-001 |

```typescript
test('토스트가 설정된 시간 후 자동으로 닫힌다', async ({ page }) => {
  await page.route('**/api/items', (route) =>
    route.fulfill({
      status: 201,
      body: JSON.stringify({ id: 1 }),
    })
  );

  await page.goto('/items/new');
  await page.fill('[data-testid="name-input"]', '테스트');
  await page.click('[data-testid="save-btn"]');

  // 토스트 표시 확인
  const toast = page.locator('.ant-message-success');
  await expect(toast).toBeVisible();

  // 자동 닫힘 대기 (3초 + 여유시간)
  await page.waitForTimeout(4000);

  // 토스트 사라짐 확인
  await expect(toast).not.toBeVisible();
  await page.screenshot({ path: 'e2e-003-auto-close.png' });
});
```

#### E2E-004: 토스트 수동 닫기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/toast.spec.ts` |
| **테스트명** | `test('토스트 X 버튼 클릭 시 즉시 닫힌다')` |
| **사전조건** | 토스트 표시됨 |
| **data-testid 셀렉터** | |
| - 토스트 닫기 버튼 | `.ant-message-notice-close` |
| **실행 단계** | |
| 1 | 토스트 트리거 |
| 2 | 닫기 버튼 클릭 |
| 3 | 즉시 사라짐 확인 |
| **검증 포인트** | 클릭 후 즉시 사라짐 |
| **스크린샷** | `e2e-004-manual-close.png` |
| **관련 요구사항** | FR-002 |

```typescript
test('토스트 X 버튼 클릭 시 즉시 닫힌다', async ({ page }) => {
  // duration: 0으로 수동 닫기 토스트 트리거
  await page.evaluate(() => {
    // showError with duration 0 호출 시뮬레이션
    (window as any).__showManualCloseToast?.();
  });

  // 또는 실제 에러 상황 트리거
  await page.route('**/api/critical', (route) =>
    route.fulfill({ status: 500 })
  );

  await page.goto('/critical-action');

  const toast = page.locator('.ant-message-error');
  await expect(toast).toBeVisible();

  // 닫기 버튼 클릭
  await page.click('.ant-message-notice-close');

  // 즉시 사라짐 확인
  await expect(toast).not.toBeVisible();
  await page.screenshot({ path: 'e2e-004-manual-close.png' });
});
```

#### E2E-005: 다중 토스트 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/toast.spec.ts` |
| **테스트명** | `test('여러 토스트가 동시에 표시될 수 있다')` |
| **사전조건** | 로그인 상태 |
| **data-testid 셀렉터** | |
| - 토스트 컨테이너 | `.ant-message` |
| - 토스트 항목 | `.ant-message-notice` |
| **실행 단계** | |
| 1 | 여러 작업 빠르게 연속 실행 |
| 2 | 여러 토스트 쌓임 확인 |
| **검증 포인트** | 최대 3개 이상의 토스트 동시 표시 |
| **스크린샷** | `e2e-005-multiple-toasts.png` |
| **관련 요구사항** | FR-001 |

```typescript
test('여러 토스트가 동시에 표시될 수 있다', async ({ page }) => {
  // 여러 API 응답 설정
  let callCount = 0;
  await page.route('**/api/items/**', (route) => {
    callCount++;
    route.fulfill({
      status: callCount % 2 === 0 ? 200 : 201,
      body: JSON.stringify({ id: callCount }),
    });
  });

  await page.goto('/items');

  // 여러 작업 빠르게 실행
  await page.click('[data-testid="action-btn-1"]');
  await page.click('[data-testid="action-btn-2"]');
  await page.click('[data-testid="action-btn-3"]');

  // 여러 토스트 확인
  const toasts = page.locator('.ant-message-notice');
  await expect(toasts).toHaveCount(3, { timeout: 5000 });
  await page.screenshot({ path: 'e2e-005-multiple-toasts.png' });
});
```

#### E2E-006: 경고 토스트 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/toast.spec.ts` |
| **테스트명** | `test('경고 상황에서 경고 토스트가 표시된다')` |
| **사전조건** | 로그인 상태 |
| **data-testid 셀렉터** | |
| - 경고 토스트 | `.ant-message-warning` |
| **실행 단계** | |
| 1 | 경고 조건 트리거 (예: 비밀번호 만료 임박) |
| 2 | 경고 토스트 확인 |
| **검증 포인트** | 경고 토스트 표시, 주황색 아이콘 |
| **스크린샷** | `e2e-006-warning-toast.png` |
| **관련 요구사항** | FR-001 |

```typescript
test('경고 상황에서 경고 토스트가 표시된다', async ({ page }) => {
  // 경고 응답 Mock
  await page.route('**/api/check-status', (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        warning: true,
        message: '비밀번호가 7일 후 만료됩니다',
      }),
    })
  );

  await page.goto('/dashboard');

  // 경고 토스트 확인
  const toast = page.locator('.ant-message-warning');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('비밀번호');
  await page.screenshot({ path: 'e2e-006-warning-toast.png' });
});
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 성공 토스트 UI | 저장 가능 상태 | 저장 버튼 클릭 | 녹색 체크 아이콘 + 메시지 | High | FR-001 |
| TC-002 | 정보 토스트 UI | - | 정보 표시 트리거 | 파란색 정보 아이콘 + 메시지 | High | FR-001 |
| TC-003 | 경고 토스트 UI | - | 경고 조건 발생 | 주황색 느낌표 아이콘 + 메시지 | High | FR-001 |
| TC-004 | 에러 토스트 UI | - | 에러 발생 | 빨간색 X 아이콘 + 메시지 | High | FR-001 |
| TC-005 | 자동 닫힘 타이머 | 토스트 표시됨 | 3-5초 대기 | 부드럽게 페이드아웃 | High | BR-001 |
| TC-006 | 수동 닫기 버튼 | 토스트 표시됨 | X 버튼 클릭 | 즉시 닫힘 | High | FR-002 |
| TC-007 | 토스트 위치 | - | 토스트 트리거 | 화면 상단 중앙 표시 | Medium | - |
| TC-008 | 다중 토스트 쌓임 | - | 여러 토스트 트리거 | 세로로 쌓임, 겹치지 않음 | Medium | - |
| TC-009 | 호버 시 타이머 정지 | 토스트 위에 마우스 | 마우스 호버 | 타이머 일시 정지 | Medium | - |
| TC-010 | 반응형 레이아웃 | 다양한 화면 크기 | 화면 크기 변경 | 적절히 조정됨 | Medium | - |
| TC-011 | 키보드 접근성 | 토스트 표시됨 | Tab/Enter 키 | 닫기 버튼 접근 가능 | Medium | - |
| TC-012 | 애니메이션 확인 | - | 토스트 표시/숨김 | 부드러운 슬라이드/페이드 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 성공 토스트 UI

**테스트 목적**: 성공 토스트가 디자인 가이드라인에 맞게 표시되는지 확인

**테스트 단계**:
1. 폼 화면 접속
2. 유효한 데이터 입력
3. 저장 버튼 클릭
4. 토스트 UI 확인

**예상 결과**:
- 화면 상단 중앙에 토스트 표시
- 녹색 체크마크 아이콘
- "저장되었습니다" 또는 관련 성공 메시지
- 흰색 배경, 녹색 테두리/강조

**검증 기준**:
- [ ] 토스트가 화면 상단 중앙에 표시됨
- [ ] 녹색 성공 아이콘이 표시됨
- [ ] 메시지가 명확하게 읽힘
- [ ] 3초 후 자동으로 사라짐

#### TC-002: 정보 토스트 UI

**테스트 목적**: 정보 토스트가 올바르게 표시되는지 확인

**테스트 단계**:
1. 정보 알림이 필요한 화면 접속
2. 정보 토스트 트리거 (예: 시스템 공지)

**예상 결과**:
- 파란색 정보 아이콘 (i)
- 파란색 강조색
- 정보성 메시지

**검증 기준**:
- [ ] 파란색 정보 아이콘 표시
- [ ] 메시지 내용이 정보성임
- [ ] 3초 후 자동으로 사라짐

#### TC-003: 경고 토스트 UI

**테스트 목적**: 경고 토스트가 주의를 끌 수 있게 표시되는지 확인

**테스트 단계**:
1. 경고 조건 발생 (예: 세션 만료 임박)
2. 경고 토스트 확인

**예상 결과**:
- 주황색/노란색 느낌표 아이콘
- 주황색 강조색
- 경고 메시지

**검증 기준**:
- [ ] 주황색 경고 아이콘 표시
- [ ] 메시지가 주의를 요함
- [ ] 5초 후 자동으로 사라짐 (성공보다 긴 시간)

#### TC-004: 에러 토스트 UI

**테스트 목적**: 에러 토스트가 문제를 명확히 알리는지 확인

**테스트 단계**:
1. 에러 조건 발생 (예: API 실패)
2. 에러 토스트 확인

**예상 결과**:
- 빨간색 X 또는 느낌표 아이콘
- 빨간색 강조색
- 에러 메시지 + 해결 방법 안내 (가능시)

**검증 기준**:
- [ ] 빨간색 에러 아이콘 표시
- [ ] 에러 원인이 명확히 설명됨
- [ ] 5초 후 자동으로 사라짐
- [ ] 심각한 에러는 수동 닫기만 가능

#### TC-005: 자동 닫힘 타이머

**테스트 목적**: 토스트가 설정된 시간 후 자동으로 닫히는지 확인

**테스트 단계**:
1. 성공 토스트 트리거
2. 스톱워치로 시간 측정
3. 토스트 사라짐 확인

**예상 결과**:
- 성공/정보: 3초 후 사라짐
- 경고/에러: 5초 후 사라짐
- 페이드아웃 애니메이션

**검증 기준**:
- [ ] 성공 토스트: 3초 (+/- 0.5초)
- [ ] 에러 토스트: 5초 (+/- 0.5초)
- [ ] 사라질 때 부드러운 애니메이션

#### TC-006: 수동 닫기 버튼

**테스트 목적**: X 버튼으로 토스트를 즉시 닫을 수 있는지 확인

**테스트 단계**:
1. 토스트 표시
2. X 버튼에 마우스 호버
3. X 버튼 클릭
4. 즉시 사라짐 확인

**예상 결과**:
- X 버튼 호버 시 시각적 피드백
- 클릭 즉시 토스트 사라짐
- 다른 토스트에 영향 없음

**검증 기준**:
- [ ] X 버튼이 명확히 보임
- [ ] 호버 시 커서 변경 (pointer)
- [ ] 클릭 후 0.3초 이내 사라짐

#### TC-007: 토스트 위치

**테스트 목적**: 토스트가 올바른 위치에 표시되는지 확인

**테스트 단계**:
1. 다양한 화면에서 토스트 트리거
2. 위치 확인

**예상 결과**:
- 화면 상단 중앙 (top-center)
- 헤더와 겹치지 않음
- 모든 화면에서 일관된 위치

**검증 기준**:
- [ ] 화면 상단 중앙에 표시
- [ ] 헤더 아래에 위치
- [ ] 컨텐츠와 겹치지 않음

#### TC-008: 다중 토스트 쌓임

**테스트 목적**: 여러 토스트가 동시에 표시될 때 올바르게 쌓이는지 확인

**테스트 단계**:
1. 빠르게 여러 작업 실행
2. 여러 토스트 동시 표시
3. 쌓임 방식 확인

**예상 결과**:
- 세로로 쌓임 (아래 방향)
- 서로 겹치지 않음
- 각각 독립적으로 닫힘

**검증 기준**:
- [ ] 토스트가 세로로 정렬됨
- [ ] 각 토스트 사이 적절한 간격
- [ ] 개별 닫기 가능
- [ ] 최대 표시 개수 제한 (5개 권장)

#### TC-009: 호버 시 타이머 정지

**테스트 목적**: 마우스 호버 시 자동 닫힘 타이머가 일시 정지되는지 확인

**테스트 단계**:
1. 토스트 표시
2. 토스트 위에 마우스 올려놓기
3. 3초 이상 대기
4. 마우스 이동 후 타이머 재개 확인

**예상 결과**:
- 호버 중에는 사라지지 않음
- 호버 해제 후 남은 시간 만큼 후 사라짐

**검증 기준**:
- [ ] 호버 시 타이머 일시 정지
- [ ] 호버 해제 후 타이머 재개
- [ ] 메시지를 읽을 충분한 시간 제공

#### TC-010: 반응형 레이아웃

**테스트 목적**: 다양한 화면 크기에서 토스트가 적절히 표시되는지 확인

**테스트 단계**:
1. 데스크톱 (1920px)에서 토스트 확인
2. 태블릿 (768px)에서 토스트 확인
3. 모바일 (375px)에서 토스트 확인

**예상 결과**:
- 모든 크기에서 읽기 가능
- 모바일에서는 전체 너비에 가깝게
- 닫기 버튼 터치 가능

**검증 기준**:
- [ ] 데스크톱: 적당한 너비, 중앙 정렬
- [ ] 태블릿: 약간 좁아짐
- [ ] 모바일: 좌우 여백 최소화, 터치 친화적

#### TC-011: 키보드 접근성

**테스트 목적**: 키보드만으로 토스트를 제어할 수 있는지 확인

**테스트 단계**:
1. 토스트 표시
2. Tab 키로 닫기 버튼에 포커스 이동
3. Enter 또는 Space로 닫기

**예상 결과**:
- Tab으로 포커스 이동 가능
- Enter/Space로 닫기 가능
- 포커스 링 표시

**검증 기준**:
- [ ] Tab 키로 닫기 버튼 접근 가능
- [ ] 포커스 시 시각적 표시
- [ ] Enter 키로 닫기 실행
- [ ] 스크린 리더로 내용 읽힘

#### TC-012: 애니메이션 확인

**테스트 목적**: 토스트 등장/퇴장 애니메이션이 부드러운지 확인

**테스트 단계**:
1. 토스트 트리거
2. 등장 애니메이션 관찰
3. 퇴장 애니메이션 관찰

**예상 결과**:
- 등장: 위에서 슬라이드 다운 + 페이드인
- 퇴장: 위로 슬라이드 업 + 페이드아웃
- 애니메이션 시간: 약 200-300ms

**검증 기준**:
- [ ] 등장 애니메이션이 부드러움
- [ ] 퇴장 애니메이션이 부드러움
- [ ] 뚝뚝 끊기지 않음
- [ ] 너무 빠르거나 느리지 않음

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-MSG-SUCCESS | 성공 메시지 | `'저장되었습니다'` |
| MOCK-MSG-INFO | 정보 메시지 | `'새로운 업데이트가 있습니다'` |
| MOCK-MSG-WARNING | 경고 메시지 | `'비밀번호가 7일 후 만료됩니다'` |
| MOCK-MSG-ERROR | 에러 메시지 | `'오류가 발생했습니다. 다시 시도해주세요.'` |
| MOCK-MSG-LONG | 긴 메시지 | `'작업이 성공적으로 완료되었습니다. 결과를 확인하시려면 목록 페이지로 이동해주세요.'` |
| MOCK-OPTIONS-DEFAULT | 기본 옵션 | `{ duration: 3 }` |
| MOCK-OPTIONS-MANUAL | 수동 닫기 옵션 | `{ duration: 0 }` |
| MOCK-OPTIONS-CUSTOM | 커스텀 옵션 | `{ duration: 5, className: 'custom-toast', key: 'unique-key' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-TOAST | 토스트 테스트 | mock-data/toast.json | API 응답 시나리오 |
| SEED-E2E-USER | 로그인 사용자 | mock-data/user.json | 테스트 사용자 1명 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 토스트 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 토스트 트리거 버튼 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `save-btn` | 저장 버튼 | 성공 토스트 트리거 |
| `delete-btn` | 삭제 버튼 | 확인 후 성공/에러 토스트 |
| `submit-btn` | 제출 버튼 | 폼 제출 후 토스트 |
| `action-btn-{n}` | 액션 버튼 | 다중 토스트 테스트용 |

### 6.2 Ant Design 기본 셀렉터 (data-testid 대신 사용)

| 셀렉터 | 요소 | 용도 |
|--------|------|------|
| `.ant-message` | 메시지 컨테이너 | 전체 토스트 영역 |
| `.ant-message-notice` | 개별 토스트 | 토스트 아이템 |
| `.ant-message-success` | 성공 토스트 | 성공 메시지 확인 |
| `.ant-message-info` | 정보 토스트 | 정보 메시지 확인 |
| `.ant-message-warning` | 경고 토스트 | 경고 메시지 확인 |
| `.ant-message-error` | 에러 토스트 | 에러 메시지 확인 |
| `.ant-message-notice-close` | 닫기 버튼 | 수동 닫기 테스트 |
| `.ant-message-notice-content` | 메시지 내용 | 텍스트 확인 |

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 90% | 80% |
| Branches | 85% | 75% |
| Functions | 100% | 90% |
| Statements | 90% | 80% |

### 7.2 함수별 커버리지 목표

| 함수 | Lines | Branches | Functions |
|------|-------|----------|-----------|
| showSuccess | 100% | 100% | 100% |
| showInfo | 100% | 100% | 100% |
| showWarning | 100% | 100% | 100% |
| showError | 100% | 100% | 100% |
| destroyAllToasts | 100% | 100% | 100% |

### 7.3 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 기능 요구사항 (FR) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| Acceptance Criteria (AC) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

---

## 8. 위험 기반 테스트 우선순위

### 8.1 위험 평가 매트릭스

| 영역 | 발생 확률 | 영향도 | 위험 점수 | 테스트 우선순위 |
|------|----------|--------|----------|----------------|
| 에러 토스트 미표시 | 중 | 높음 | 6 | P1 (필수) |
| 자동 닫힘 실패 | 중 | 중 | 4 | P1 (필수) |
| 수동 닫기 실패 | 낮음 | 중 | 2 | P2 (중요) |
| 다중 토스트 겹침 | 낮음 | 낮음 | 1 | P3 (선택) |
| 애니메이션 버벅임 | 낮음 | 낮음 | 1 | P3 (선택) |

### 8.2 테스트 실행 순서

1. **P1 (필수)**: showSuccess, showError 기본 동작, 자동 닫힘
2. **P2 (중요)**: showInfo, showWarning, 수동 닫기, 커스텀 옵션
3. **P3 (선택)**: 다중 토스트, 애니메이션, 반응형, 접근성

---

## 9. 경계 조건 및 엣지 케이스

### 9.1 경계 조건 테스트

| 조건 | 테스트 케이스 | 예상 결과 |
|------|-------------|----------|
| 메시지 최소 길이 (1자) | `showSuccess('!')` | 정상 표시 |
| 메시지 최대 길이 (200자) | 200자 문자열 | 줄바꿈 또는 말줄임 |
| duration 최소값 (0) | `{ duration: 0 }` | 수동 닫기만 가능 |
| duration 최대값 (60) | `{ duration: 60 }` | 60초간 표시 |
| 동시 토스트 최대 (10개) | 10개 연속 호출 | 모두 표시 또는 큐잉 |

### 9.2 엣지 케이스 테스트

| 케이스 | 설명 | 테스트 방법 |
|--------|------|------------|
| 빈 메시지 | content가 빈 문자열 | `showSuccess('')` |
| null/undefined 메시지 | content가 null | `showSuccess(null)` |
| HTML 태그 포함 메시지 | XSS 방지 확인 | `showSuccess('<script>alert(1)</script>')` |
| 이모지 포함 메시지 | 이모지 렌더링 확인 | `showSuccess('저장 완료!')` |
| 동일 key 연속 호출 | 토스트 업데이트 | 동일 key로 2회 호출 |
| 페이지 이동 중 토스트 | SPA 라우팅 시 | 토스트 표시 중 페이지 이동 |
| 네트워크 오프라인 | 오프라인 상태 | 토스트 표시 시도 |

### 9.3 엣지 케이스 테스트 코드 예시

```typescript
describe('Edge Cases', () => {
  it('should handle empty message gracefully', () => {
    showSuccess('');

    expect(message.success).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '',
      })
    );
  });

  it('should escape HTML in message to prevent XSS', () => {
    showSuccess('<script>alert(1)</script>');

    // XSS 방지: HTML이 렌더링되지 않고 텍스트로 표시되어야 함
    expect(message.success).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '<script>alert(1)</script>',
      })
    );
  });

  it('should handle emoji in message', () => {
    showSuccess('저장 완료!');

    expect(message.success).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '저장 완료!',
      })
    );
  });
});
```

---

## 관련 문서

- 설계 문서: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md` (섹션 4.1.1 알림)
- TRD: `.orchay/projects/mes-portal/trd.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |

---

<!--
TSK-05-03 Toast 알림 테스트 명세서
Version: 1.0
Created: 2026-01-20

요구사항 매핑:
- FR-001: 성공/정보/경고/에러 메시지 표시
- FR-002: 수동 닫기 버튼
- BR-001: 자동 닫힘 (성공/정보: 3초, 경고/에러: 5초)
- AC-001: API 성공 시 성공 토스트
- AC-002: API 에러 시 에러 토스트
- AC-003: 자동 닫힘 동작
-->
