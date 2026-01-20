# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: 로그인 페이지 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-04-04 |
| Task명 | 로그인 페이지 |
| 설계 문서 참조 | `010-design.md` |
| 작성일 | 2026-01-20 |
| 작성자 | AI (Quality Engineer) |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | LoginForm 컴포넌트, 유효성 검사, 에러 처리 | 85% 이상 |
| E2E 테스트 | 로그인 플로우 전체 (성공/실패/리다이렉트) | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형, 보안 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터베이스 | SQLite (테스트용) |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |
| 반응형 테스트 뷰포트 | Desktop (1280x720), Tablet (768x1024), Mobile (375x667) |

### 1.3 테스트 우선순위

| 우선순위 | 테스트 영역 | 근거 |
|---------|-----------|------|
| P0 (Critical) | 로그인 성공 플로우, 인증 실패 처리 | 핵심 기능, 보안 관련 |
| P1 (High) | 유효성 검사, 에러 메시지 표시 | 사용자 경험 직결 |
| P2 (Medium) | 반응형 UI, 접근성 | 품질 향상 |
| P3 (Low) | 엣지 케이스, 성능 | 안정성 보완 |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 | 우선순위 |
|-----------|------|----------|----------|----------|---------|
| UT-001 | LoginForm | 폼 렌더링 | 이메일/비밀번호 필드, 로그인 버튼 표시 | AC-001 | P0 |
| UT-002 | LoginForm | 이메일 필드 입력 | 입력값 반영 | AC-001 | P1 |
| UT-003 | LoginForm | 비밀번호 필드 입력 | 마스킹 표시 | AC-001 | P1 |
| UT-004 | LoginForm | 빈 이메일 제출 | "이메일을 입력해주세요" 에러 | AC-002 | P0 |
| UT-005 | LoginForm | 빈 비밀번호 제출 | "비밀번호를 입력해주세요" 에러 | AC-002 | P0 |
| UT-006 | LoginForm | 잘못된 이메일 형식 | "올바른 이메일 형식이 아닙니다" 에러 | AC-002 | P1 |
| UT-007 | LoginForm | 로그인 버튼 로딩 상태 | 버튼 비활성화, 스피너 표시 | - | P1 |
| UT-008 | LoginForm | signIn 함수 호출 | 올바른 credentials 전달 | AC-004 | P0 |
| UT-009 | LoginForm | 인증 실패 에러 표시 | Alert 컴포넌트에 에러 메시지 | AC-003 | P0 |
| UT-010 | LoginForm | 계정 비활성 에러 표시 | "비활성화된 계정" 메시지 | AC-003 | P1 |
| UT-011 | LoginForm | Enter 키 폼 제출 | signIn 함수 호출 | - | P2 |
| UT-012 | LoginForm | 비밀번호 표시/숨김 토글 | 평문/마스킹 전환 | BR-02 | P2 |
| UT-013 | LoginPage | 세션 존재 시 리다이렉트 | /portal로 자동 이동 | BR-04 | P0 |

### 2.2 테스트 케이스 상세

#### UT-001: 폼 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/auth/__tests__/LoginForm.test.tsx` |
| **테스트 블록** | `describe('LoginForm') -> it('renders login form with all elements')` |
| **Mock 의존성** | Auth.js signIn |
| **입력 데이터** | 기본 props |
| **검증 포인트** | 이메일 필드, 비밀번호 필드, 로그인 버튼 존재 확인 |
| **관련 요구사항** | AC-001 |

```typescript
import { render, screen } from '@testing-library/react';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  it('renders login form with all elements', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
  });
});
```

#### UT-004: 빈 이메일 제출

| 항목 | 내용 |
|------|------|
| **파일** | `components/auth/__tests__/LoginForm.test.tsx` |
| **테스트 블록** | `describe('LoginForm') -> describe('validation') -> it('shows error for empty email')` |
| **Mock 의존성** | Auth.js signIn |
| **입력 데이터** | 이메일: 빈 문자열, 비밀번호: "password123" |
| **검증 포인트** | "이메일을 입력해주세요" 에러 메시지 표시 |
| **관련 요구사항** | AC-002 |

```typescript
it('shows error for empty email', async () => {
  const { user } = renderWithUser(<LoginForm />);

  await user.type(screen.getByLabelText(/비밀번호/i), 'password123');
  await user.click(screen.getByRole('button', { name: /로그인/i }));

  expect(await screen.findByText(/이메일을 입력해주세요/i)).toBeInTheDocument();
});
```

#### UT-005: 빈 비밀번호 제출

| 항목 | 내용 |
|------|------|
| **파일** | `components/auth/__tests__/LoginForm.test.tsx` |
| **테스트 블록** | `describe('LoginForm') -> describe('validation') -> it('shows error for empty password')` |
| **Mock 의존성** | Auth.js signIn |
| **입력 데이터** | 이메일: "test@example.com", 비밀번호: 빈 문자열 |
| **검증 포인트** | "비밀번호를 입력해주세요" 에러 메시지 표시 |
| **관련 요구사항** | AC-002 |

```typescript
it('shows error for empty password', async () => {
  const { user } = renderWithUser(<LoginForm />);

  await user.type(screen.getByLabelText(/이메일/i), 'test@example.com');
  await user.click(screen.getByRole('button', { name: /로그인/i }));

  expect(await screen.findByText(/비밀번호를 입력해주세요/i)).toBeInTheDocument();
});
```

#### UT-006: 잘못된 이메일 형식

| 항목 | 내용 |
|------|------|
| **파일** | `components/auth/__tests__/LoginForm.test.tsx` |
| **테스트 블록** | `describe('LoginForm') -> describe('validation') -> it('shows error for invalid email format')` |
| **Mock 의존성** | Auth.js signIn |
| **입력 데이터** | 이메일: "invalid-email", 비밀번호: "password123" |
| **검증 포인트** | "올바른 이메일 형식이 아닙니다" 에러 메시지 표시 |
| **관련 요구사항** | AC-002 |

```typescript
it('shows error for invalid email format', async () => {
  const { user } = renderWithUser(<LoginForm />);

  await user.type(screen.getByLabelText(/이메일/i), 'invalid-email');
  await user.type(screen.getByLabelText(/비밀번호/i), 'password123');
  await user.click(screen.getByRole('button', { name: /로그인/i }));

  expect(await screen.findByText(/올바른 이메일 형식이 아닙니다/i)).toBeInTheDocument();
});
```

#### UT-007: 로그인 버튼 로딩 상태

| 항목 | 내용 |
|------|------|
| **파일** | `components/auth/__tests__/LoginForm.test.tsx` |
| **테스트 블록** | `describe('LoginForm') -> it('shows loading state on submit')` |
| **Mock 의존성** | Auth.js signIn (지연 응답) |
| **입력 데이터** | 유효한 이메일/비밀번호 |
| **검증 포인트** | 버튼 비활성화, 로딩 스피너 표시 |
| **관련 요구사항** | - |

```typescript
it('shows loading state on submit', async () => {
  const signIn = vi.fn(() => new Promise(() => {})); // 대기 상태 유지
  vi.mock('next-auth/react', () => ({ signIn }));

  const { user } = renderWithUser(<LoginForm />);

  await user.type(screen.getByLabelText(/이메일/i), 'test@example.com');
  await user.type(screen.getByLabelText(/비밀번호/i), 'password123');
  await user.click(screen.getByRole('button', { name: /로그인/i }));

  const button = screen.getByRole('button', { name: /로그인/i });
  expect(button).toBeDisabled();
  expect(screen.getByTestId('login-loading-spinner')).toBeInTheDocument();
});
```

#### UT-008: signIn 함수 호출

| 항목 | 내용 |
|------|------|
| **파일** | `components/auth/__tests__/LoginForm.test.tsx` |
| **테스트 블록** | `describe('LoginForm') -> it('calls signIn with correct credentials')` |
| **Mock 의존성** | Auth.js signIn |
| **입력 데이터** | 이메일: "admin@example.com", 비밀번호: "password123" |
| **검증 포인트** | signIn 함수가 올바른 인자로 호출됨 |
| **관련 요구사항** | AC-004 |

```typescript
it('calls signIn with correct credentials', async () => {
  const signIn = vi.fn(() => Promise.resolve({ ok: true }));
  vi.mock('next-auth/react', () => ({ signIn }));

  const { user } = renderWithUser(<LoginForm />);

  await user.type(screen.getByLabelText(/이메일/i), 'admin@example.com');
  await user.type(screen.getByLabelText(/비밀번호/i), 'password123');
  await user.click(screen.getByRole('button', { name: /로그인/i }));

  expect(signIn).toHaveBeenCalledWith('credentials', {
    email: 'admin@example.com',
    password: 'password123',
    redirect: false,
  });
});
```

#### UT-009: 인증 실패 에러 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/auth/__tests__/LoginForm.test.tsx` |
| **테스트 블록** | `describe('LoginForm') -> describe('error handling') -> it('shows error alert on authentication failure')` |
| **Mock 의존성** | Auth.js signIn (실패 응답) |
| **입력 데이터** | 유효한 형식의 잘못된 자격 증명 |
| **검증 포인트** | Alert 컴포넌트에 에러 메시지 표시 |
| **관련 요구사항** | AC-003 |

```typescript
it('shows error alert on authentication failure', async () => {
  const signIn = vi.fn(() => Promise.resolve({
    ok: false,
    error: 'CredentialsSignin'
  }));
  vi.mock('next-auth/react', () => ({ signIn }));

  const { user } = renderWithUser(<LoginForm />);

  await user.type(screen.getByLabelText(/이메일/i), 'wrong@example.com');
  await user.type(screen.getByLabelText(/비밀번호/i), 'wrongpassword');
  await user.click(screen.getByRole('button', { name: /로그인/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    /이메일 또는 비밀번호가 올바르지 않습니다/i
  );
});
```

#### UT-010: 계정 비활성 에러 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/auth/__tests__/LoginForm.test.tsx` |
| **테스트 블록** | `describe('LoginForm') -> describe('error handling') -> it('shows inactive account error')` |
| **Mock 의존성** | Auth.js signIn (비활성 계정 에러) |
| **입력 데이터** | 비활성 계정 자격 증명 |
| **검증 포인트** | "비활성화된 계정" 메시지 표시 |
| **관련 요구사항** | AC-003 |

```typescript
it('shows inactive account error', async () => {
  const signIn = vi.fn(() => Promise.resolve({
    ok: false,
    error: 'AccountInactive'
  }));
  vi.mock('next-auth/react', () => ({ signIn }));

  const { user } = renderWithUser(<LoginForm />);

  await user.type(screen.getByLabelText(/이메일/i), 'inactive@example.com');
  await user.type(screen.getByLabelText(/비밀번호/i), 'password123');
  await user.click(screen.getByRole('button', { name: /로그인/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    /비활성화된 계정입니다/i
  );
});
```

#### UT-011: Enter 키 폼 제출

| 항목 | 내용 |
|------|------|
| **파일** | `components/auth/__tests__/LoginForm.test.tsx` |
| **테스트 블록** | `describe('LoginForm') -> it('submits form on Enter key')` |
| **Mock 의존성** | Auth.js signIn |
| **입력 데이터** | 유효한 이메일/비밀번호, Enter 키 |
| **검증 포인트** | signIn 함수 호출됨 |
| **관련 요구사항** | - |

```typescript
it('submits form on Enter key', async () => {
  const signIn = vi.fn(() => Promise.resolve({ ok: true }));
  vi.mock('next-auth/react', () => ({ signIn }));

  const { user } = renderWithUser(<LoginForm />);

  await user.type(screen.getByLabelText(/이메일/i), 'admin@example.com');
  await user.type(screen.getByLabelText(/비밀번호/i), 'password123{Enter}');

  expect(signIn).toHaveBeenCalled();
});
```

#### UT-012: 비밀번호 표시/숨김 토글

| 항목 | 내용 |
|------|------|
| **파일** | `components/auth/__tests__/LoginForm.test.tsx` |
| **테스트 블록** | `describe('LoginForm') -> it('toggles password visibility')` |
| **Mock 의존성** | - |
| **입력 데이터** | 비밀번호 입력 후 토글 버튼 클릭 |
| **검증 포인트** | input type 변경 (password <-> text) |
| **관련 요구사항** | BR-02 |

```typescript
it('toggles password visibility', async () => {
  const { user } = renderWithUser(<LoginForm />);

  const passwordInput = screen.getByLabelText(/비밀번호/i);
  expect(passwordInput).toHaveAttribute('type', 'password');

  const toggleButton = screen.getByTestId('password-visibility-toggle');
  await user.click(toggleButton);

  expect(passwordInput).toHaveAttribute('type', 'text');

  await user.click(toggleButton);
  expect(passwordInput).toHaveAttribute('type', 'password');
});
```

#### UT-013: 세션 존재 시 리다이렉트

| 항목 | 내용 |
|------|------|
| **파일** | `app/(auth)/login/__tests__/page.test.tsx` |
| **테스트 블록** | `describe('LoginPage') -> it('redirects to portal when session exists')` |
| **Mock 의존성** | Auth.js getServerSession, next/navigation redirect |
| **입력 데이터** | 유효한 세션 존재 |
| **검증 포인트** | redirect('/portal') 호출됨 |
| **관련 요구사항** | BR-04 |

```typescript
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('LoginPage', () => {
  it('redirects to portal when session exists', async () => {
    (getServerSession as vi.Mock).mockResolvedValue({
      user: { email: 'admin@example.com' },
    });

    await LoginPage();

    expect(redirect).toHaveBeenCalledWith('/portal');
  });
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 | 우선순위 |
|-----------|----------|----------|----------|----------|----------|---------|
| E2E-001 | 로그인 폼 렌더링 | - | 1. /login 접속 | 로그인 폼 표시 | AC-001 | P0 |
| E2E-002 | 정상 로그인 | 유효한 계정 | 1. 이메일 입력 2. 비밀번호 입력 3. 로그인 클릭 | /portal 리다이렉트 | AC-004 | P0 |
| E2E-003 | 빈 필드 제출 | - | 1. 로그인 버튼 클릭 | 필드별 에러 표시 | AC-002 | P0 |
| E2E-004 | 잘못된 이메일 형식 | - | 1. 잘못된 이메일 입력 2. 로그인 시도 | 이메일 형식 에러 | AC-002 | P1 |
| E2E-005 | 인증 실패 | 잘못된 자격 증명 | 1. 잘못된 정보 입력 2. 로그인 시도 | 에러 메시지 표시 | AC-003 | P0 |
| E2E-006 | 비활성 계정 로그인 | 비활성 계정 | 1. 비활성 계정 로그인 시도 | 비활성 에러 표시 | AC-003 | P1 |
| E2E-007 | 세션 있는 상태 접근 | 로그인 상태 | 1. /login 접속 | /portal 자동 이동 | BR-04 | P0 |
| E2E-008 | 네트워크 오류 처리 | 네트워크 차단 | 1. 로그인 시도 | 네트워크 에러 표시 | - | P2 |
| E2E-009 | 반응형 레이아웃 | 모바일 뷰포트 | 1. /login 접속 | 모바일 최적화 UI | - | P2 |

### 3.2 테스트 케이스 상세

#### E2E-001: 로그인 폼 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/login.spec.ts` |
| **테스트명** | `test('로그인 페이지가 올바르게 렌더링된다')` |
| **사전조건** | - |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="login-page"]` |
| - 로그인 카드 | `[data-testid="login-card"]` |
| - 이메일 입력 | `[data-testid="email-input"]` |
| - 비밀번호 입력 | `[data-testid="password-input"]` |
| - 로그인 버튼 | `[data-testid="login-button"]` |
| **검증 포인트** | 모든 폼 요소가 표시됨 |
| **스크린샷** | `e2e-001-login-page.png` |
| **관련 요구사항** | AC-001 |

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('로그인 페이지가 올바르게 렌더링된다', async ({ page }) => {
    await page.goto('/login');

    // 페이지 요소 확인
    await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

    // 로고 확인
    await expect(page.locator('text=MES Portal')).toBeVisible();

    await page.screenshot({ path: 'e2e-001-login-page.png' });
  });
});
```

#### E2E-002: 정상 로그인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/login.spec.ts` |
| **테스트명** | `test('유효한 자격 증명으로 로그인 성공')` |
| **사전조건** | 테스트 계정 존재 (admin@test.com / test1234) |
| **data-testid 셀렉터** | |
| - 이메일 입력 | `[data-testid="email-input"]` |
| - 비밀번호 입력 | `[data-testid="password-input"]` |
| - 로그인 버튼 | `[data-testid="login-button"]` |
| **실행 단계** | |
| 1 | `await page.goto('/login')` |
| 2 | `await page.fill('[data-testid="email-input"]', 'admin@test.com')` |
| 3 | `await page.fill('[data-testid="password-input"]', 'test1234')` |
| 4 | `await page.click('[data-testid="login-button"]')` |
| **API 확인** | POST /api/auth/callback/credentials -> 200 |
| **검증 포인트** | URL이 /portal로 변경됨 |
| **스크린샷** | `e2e-002-before.png`, `e2e-002-after.png` |
| **관련 요구사항** | AC-004 |

```typescript
test('유효한 자격 증명으로 로그인 성공', async ({ page }) => {
  await page.goto('/login');
  await page.screenshot({ path: 'e2e-002-before.png' });

  // 자격 증명 입력
  await page.fill('[data-testid="email-input"]', 'admin@test.com');
  await page.fill('[data-testid="password-input"]', 'test1234');

  // 로그인 버튼 클릭
  await page.click('[data-testid="login-button"]');

  // 리다이렉트 확인
  await expect(page).toHaveURL('/portal', { timeout: 10000 });
  await page.screenshot({ path: 'e2e-002-after.png' });
});
```

#### E2E-003: 빈 필드 제출

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/login.spec.ts` |
| **테스트명** | `test('빈 필드로 제출 시 유효성 에러 표시')` |
| **사전조건** | - |
| **data-testid 셀렉터** | |
| - 로그인 버튼 | `[data-testid="login-button"]` |
| - 이메일 에러 | `[data-testid="email-error"]` |
| - 비밀번호 에러 | `[data-testid="password-error"]` |
| **검증 포인트** | 각 필드 하단에 에러 메시지 표시 |
| **스크린샷** | `e2e-003-validation-error.png` |
| **관련 요구사항** | AC-002 |

```typescript
test('빈 필드로 제출 시 유효성 에러 표시', async ({ page }) => {
  await page.goto('/login');

  // 아무것도 입력하지 않고 로그인 시도
  await page.click('[data-testid="login-button"]');

  // 유효성 에러 메시지 확인
  await expect(page.locator('[data-testid="email-error"]')).toContainText('이메일을 입력해주세요');
  await expect(page.locator('[data-testid="password-error"]')).toContainText('비밀번호를 입력해주세요');

  await page.screenshot({ path: 'e2e-003-validation-error.png' });
});
```

#### E2E-004: 잘못된 이메일 형식

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/login.spec.ts` |
| **테스트명** | `test('잘못된 이메일 형식 입력 시 에러 표시')` |
| **사전조건** | - |
| **입력 데이터** | 이메일: "invalid-email", 비밀번호: "password123" |
| **검증 포인트** | 이메일 형식 에러 메시지 표시 |
| **스크린샷** | `e2e-004-email-format-error.png` |
| **관련 요구사항** | AC-002 |

```typescript
test('잘못된 이메일 형식 입력 시 에러 표시', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="email-input"]', 'invalid-email');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');

  await expect(page.locator('[data-testid="email-error"]')).toContainText('올바른 이메일 형식이 아닙니다');

  await page.screenshot({ path: 'e2e-004-email-format-error.png' });
});
```

#### E2E-005: 인증 실패

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/login.spec.ts` |
| **테스트명** | `test('잘못된 자격 증명으로 로그인 실패')` |
| **사전조건** | - |
| **data-testid 셀렉터** | |
| - 에러 Alert | `[data-testid="login-error-alert"]` |
| **입력 데이터** | 이메일: "wrong@example.com", 비밀번호: "wrongpassword" |
| **검증 포인트** | 에러 Alert 표시, "이메일 또는 비밀번호가 올바르지 않습니다" 메시지 |
| **스크린샷** | `e2e-005-auth-failure.png` |
| **관련 요구사항** | AC-003 |

```typescript
test('잘못된 자격 증명으로 로그인 실패', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="email-input"]', 'wrong@example.com');
  await page.fill('[data-testid="password-input"]', 'wrongpassword');
  await page.click('[data-testid="login-button"]');

  // 에러 Alert 확인
  await expect(page.locator('[data-testid="login-error-alert"]')).toBeVisible();
  await expect(page.locator('[data-testid="login-error-alert"]')).toContainText(
    '이메일 또는 비밀번호가 올바르지 않습니다'
  );

  // 여전히 로그인 페이지에 있음
  await expect(page).toHaveURL('/login');

  await page.screenshot({ path: 'e2e-005-auth-failure.png' });
});
```

#### E2E-006: 비활성 계정 로그인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/login.spec.ts` |
| **테스트명** | `test('비활성 계정으로 로그인 시 에러 표시')` |
| **사전조건** | 비활성 계정 존재 (inactive@test.com / test1234, isActive=false) |
| **입력 데이터** | 이메일: "inactive@test.com", 비밀번호: "test1234" |
| **검증 포인트** | "비활성화된 계정입니다. 관리자에게 문의하세요" 메시지 |
| **스크린샷** | `e2e-006-inactive-account.png` |
| **관련 요구사항** | AC-003 |

```typescript
test('비활성 계정으로 로그인 시 에러 표시', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[data-testid="email-input"]', 'inactive@test.com');
  await page.fill('[data-testid="password-input"]', 'test1234');
  await page.click('[data-testid="login-button"]');

  await expect(page.locator('[data-testid="login-error-alert"]')).toContainText(
    '비활성화된 계정입니다. 관리자에게 문의하세요'
  );

  await page.screenshot({ path: 'e2e-006-inactive-account.png' });
});
```

#### E2E-007: 세션 있는 상태 접근

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/login.spec.ts` |
| **테스트명** | `test('로그인 상태에서 /login 접근 시 포털로 리다이렉트')` |
| **사전조건** | 로그인 완료 상태 (인증 fixture 사용) |
| **검증 포인트** | /portal로 자동 리다이렉트 |
| **관련 요구사항** | BR-04 |

```typescript
test.describe('Authenticated user', () => {
  test.use({ storageState: 'tests/.auth/user.json' });

  test('로그인 상태에서 /login 접근 시 포털로 리다이렉트', async ({ page }) => {
    await page.goto('/login');

    // 자동으로 /portal로 리다이렉트됨
    await expect(page).toHaveURL('/portal', { timeout: 5000 });
  });
});
```

#### E2E-008: 네트워크 오류 처리

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/login.spec.ts` |
| **테스트명** | `test('네트워크 오류 시 에러 메시지 표시')` |
| **사전조건** | 네트워크 차단 (route intercept) |
| **검증 포인트** | "네트워크 오류가 발생했습니다" 메시지 |
| **스크린샷** | `e2e-008-network-error.png` |
| **관련 요구사항** | - |

```typescript
test('네트워크 오류 시 에러 메시지 표시', async ({ page }) => {
  await page.goto('/login');

  // API 요청 차단
  await page.route('**/api/auth/**', (route) => route.abort());

  await page.fill('[data-testid="email-input"]', 'admin@test.com');
  await page.fill('[data-testid="password-input"]', 'test1234');
  await page.click('[data-testid="login-button"]');

  await expect(page.locator('[data-testid="login-error-alert"]')).toContainText(
    '네트워크 오류가 발생했습니다'
  );

  await page.screenshot({ path: 'e2e-008-network-error.png' });
});
```

#### E2E-009: 반응형 레이아웃

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/login.spec.ts` |
| **테스트명** | `test('모바일 뷰포트에서 로그인 폼이 올바르게 표시된다')` |
| **사전조건** | 모바일 뷰포트 (375x667) |
| **검증 포인트** | 로그인 카드가 전체 너비, 요소 접근 가능 |
| **스크린샷** | `e2e-009-mobile.png` |
| **관련 요구사항** | - |

```typescript
test('모바일 뷰포트에서 로그인 폼이 올바르게 표시된다', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/login');

  // 로그인 카드가 표시됨
  await expect(page.locator('[data-testid="login-card"]')).toBeVisible();

  // 모든 요소가 접근 가능
  await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
  await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
  await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

  await page.screenshot({ path: 'e2e-009-mobile.png' });
});
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 로그인 폼 레이아웃 | - | /login 접속 | 중앙 정렬된 로그인 카드 | High | AC-001 |
| TC-002 | 이메일 입력 UX | - | 이메일 필드 포커스 | 테두리 하이라이트, 플레이스홀더 표시 | High | AC-001 |
| TC-003 | 비밀번호 마스킹 | - | 비밀번호 입력 | 마스킹 문자 표시 | High | BR-02 |
| TC-004 | 비밀번호 표시 토글 | 비밀번호 입력 | 눈 아이콘 클릭 | 평문 표시/마스킹 전환 | Medium | BR-02 |
| TC-005 | 로그인 버튼 호버 | - | 버튼 호버 | 배경색 변경 | Low | - |
| TC-006 | 로딩 상태 표시 | - | 로그인 진행 중 | 스피너, 버튼 비활성화 | High | - |
| TC-007 | 필드 에러 표시 | - | 유효성 검사 실패 | 빨간색 테두리, 에러 텍스트 | High | AC-002 |
| TC-008 | Alert 에러 표시 | - | 인증 실패 | 폼 상단 빨간색 Alert | High | AC-003 |
| TC-009 | 반응형 - 데스크톱 | 1280px+ | 로그인 페이지 접속 | 최대 400px 카드 | Medium | - |
| TC-010 | 반응형 - 태블릿 | 768-1023px | 로그인 페이지 접속 | 동일 레이아웃 | Medium | - |
| TC-011 | 반응형 - 모바일 | 767px- | 로그인 페이지 접속 | 전체 너비 카드 | Medium | - |
| TC-012 | 키보드 탐색 | - | Tab 키로 이동 | 이메일 -> 비밀번호 -> 버튼 | Medium | - |
| TC-013 | 스크린 리더 | 스크린 리더 활성화 | 폼 탐색 | 라벨 안내 | Medium | - |
| TC-014 | 다크 모드 (선택적) | 다크 모드 설정 | 로그인 페이지 접속 | 다크 테마 적용 | Low | - |
| TC-015 | 푸터 정보 | - | 페이지 하단 확인 | 저작권, 버전 정보 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 로그인 폼 레이아웃

**테스트 목적**: 로그인 카드가 화면 중앙에 올바르게 배치되는지 확인

**테스트 단계**:
1. 브라우저에서 /login 접속
2. 로그인 카드 위치 확인
3. 카드 내 요소 배치 확인

**검증 기준**:
- [ ] 로그인 카드가 화면 중앙에 표시됨
- [ ] 로고가 카드 상단에 표시됨
- [ ] 이메일 필드가 비밀번호 필드 위에 위치
- [ ] 로그인 버튼이 필드 아래에 위치
- [ ] 푸터 정보가 카드 하단에 표시됨

#### TC-003: 비밀번호 마스킹

**테스트 목적**: 비밀번호 입력 시 마스킹이 올바르게 동작하는지 확인

**테스트 단계**:
1. 비밀번호 필드에 포커스
2. "test1234" 입력
3. 화면 표시 확인

**검증 기준**:
- [ ] 입력 문자가 즉시 마스킹됨 (예: ●●●●●●●●)
- [ ] 입력 길이만큼 마스킹 문자 표시
- [ ] 눈 아이콘 표시됨

#### TC-006: 로딩 상태 표시

**테스트 목적**: 로그인 진행 중 사용자에게 적절한 피드백이 제공되는지 확인

**테스트 단계**:
1. 유효한 이메일/비밀번호 입력
2. 로그인 버튼 클릭
3. 로딩 상태 확인 (네트워크 스로틀링으로 확인 용이)

**검증 기준**:
- [ ] 로그인 버튼에 로딩 스피너 표시
- [ ] 버튼 텍스트 "로그인 중..." 또는 비활성화
- [ ] 입력 필드 수정 불가 또는 경고
- [ ] 중복 제출 방지

#### TC-007: 필드 에러 표시

**테스트 목적**: 유효성 검사 실패 시 에러가 명확하게 표시되는지 확인

**테스트 단계**:
1. 이메일 필드 비워두기
2. 로그인 버튼 클릭
3. 에러 표시 확인

**검증 기준**:
- [ ] 에러 필드 테두리가 빨간색으로 변경
- [ ] 필드 하단에 에러 메시지 텍스트 표시
- [ ] 에러 메시지 색상이 빨간색
- [ ] 에러 아이콘 표시 (선택적)

#### TC-012: 키보드 탐색

**테스트 목적**: 키보드만으로 로그인 플로우를 완료할 수 있는지 확인

**테스트 단계**:
1. /login 페이지 접속
2. Tab 키로 요소 이동
3. Enter 키로 폼 제출

**검증 기준**:
- [ ] Tab: 이메일 -> 비밀번호 -> 로그인 버튼 순서 이동
- [ ] Shift+Tab: 역순 이동
- [ ] 포커스 상태가 시각적으로 구분됨
- [ ] Enter: 비밀번호 필드에서 폼 제출
- [ ] Enter: 로그인 버튼에서 폼 제출

#### TC-013: 스크린 리더 접근성

**테스트 목적**: 스크린 리더 사용자가 로그인 폼을 이용할 수 있는지 확인

**테스트 단계**:
1. 스크린 리더 활성화 (NVDA, VoiceOver 등)
2. /login 페이지 접속
3. 폼 요소 탐색

**검증 기준**:
- [ ] 이메일 필드: "이메일 입력" 또는 유사한 라벨 안내
- [ ] 비밀번호 필드: "비밀번호 입력" 라벨 안내
- [ ] 로그인 버튼: "로그인 버튼" 안내
- [ ] 에러 발생 시: 에러 메시지 안내
- [ ] 로딩 중: 상태 안내

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-VALID-EMAIL | 유효한 이메일 | `'admin@test.com'` |
| MOCK-VALID-PASSWORD | 유효한 비밀번호 | `'test1234'` |
| MOCK-INVALID-EMAIL | 잘못된 이메일 형식 | `'invalid-email'` |
| MOCK-WRONG-CREDENTIALS | 잘못된 자격 증명 | `{ email: 'wrong@test.com', password: 'wrong' }` |
| MOCK-INACTIVE-USER | 비활성 사용자 | `{ email: 'inactive@test.com', password: 'test1234', isActive: false }` |
| MOCK-SESSION | 유효한 세션 | `{ user: { email: 'admin@test.com', name: '관리자', role: 'admin' } }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-LOGIN-BASE | 로그인 테스트 기본 | 자동 시드 | 활성 사용자 2명, 비활성 사용자 1명 |
| SEED-E2E-AUTH-STATE | 인증 상태 fixture | Playwright auth setup | 로그인된 세션 상태 저장 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 상태 | 용도 |
|---------|--------|----------|------|------|------|
| TEST-ADMIN | admin@test.com | test1234 | admin | active | 관리자 로그인 테스트 |
| TEST-USER | user@test.com | test1234 | user | active | 일반 사용자 로그인 테스트 |
| TEST-OPERATOR | operator@test.com | test1234 | operator | active | 작업자 로그인 테스트 |
| TEST-INACTIVE | inactive@test.com | test1234 | user | inactive | 비활성 계정 테스트 |
| TEST-WRONG | - | - | - | - | 존재하지 않는 계정 테스트 |

### 5.4 테스트 데이터베이스 시드 스크립트

```typescript
// tests/fixtures/seed-login-data.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedLoginTestData() {
  const hashedPassword = await bcrypt.hash('test1234', 10);

  // 테스트 계정 생성
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@test.com',
        password: hashedPassword,
        name: '테스트 관리자',
        roleId: 1, // admin role
        isActive: true,
      },
      {
        email: 'user@test.com',
        password: hashedPassword,
        name: '테스트 사용자',
        roleId: 2, // user role
        isActive: true,
      },
      {
        email: 'operator@test.com',
        password: hashedPassword,
        name: '테스트 작업자',
        roleId: 3, // operator role
        isActive: true,
      },
      {
        email: 'inactive@test.com',
        password: hashedPassword,
        name: '비활성 사용자',
        roleId: 2,
        isActive: false,
      },
    ],
    skipDuplicates: true,
  });
}

export async function cleanupLoginTestData() {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'admin@test.com',
          'user@test.com',
          'operator@test.com',
          'inactive@test.com',
        ],
      },
    },
  });
}
```

---

## 6. data-testid 목록

### 6.1 로그인 페이지 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `login-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `login-card` | 로그인 카드 | 카드 표시 확인 |
| `login-logo` | 로고 | 브랜딩 영역 |
| `login-form` | 폼 요소 | 폼 제출 테스트 |
| `email-input` | 이메일 입력 필드 | 이메일 입력 |
| `email-error` | 이메일 에러 메시지 | 유효성 에러 표시 |
| `password-input` | 비밀번호 입력 필드 | 비밀번호 입력 |
| `password-error` | 비밀번호 에러 메시지 | 유효성 에러 표시 |
| `password-visibility-toggle` | 비밀번호 표시/숨김 버튼 | 마스킹 토글 |
| `login-button` | 로그인 버튼 | 폼 제출 |
| `login-loading-spinner` | 로딩 스피너 | 로딩 상태 표시 |
| `login-error-alert` | 에러 Alert | 인증 실패 메시지 |
| `login-footer` | 푸터 영역 | 저작권/버전 정보 |

### 6.2 셀렉터 네이밍 규칙

```
[페이지/컴포넌트]-[요소]-[상태/타입]

예시:
- login-page (페이지 컨테이너)
- login-button (버튼)
- email-input (입력 필드)
- email-error (에러 메시지)
- password-visibility-toggle (토글 버튼)
```

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 | 근거 |
|------|------|------|------|
| Lines | 85% | 75% | 로그인은 핵심 기능 |
| Branches | 80% | 70% | 분기 처리 중요 (에러 케이스) |
| Functions | 90% | 80% | 모든 함수 테스트 필요 |
| Statements | 85% | 75% | 인증 로직 완전 검증 |

### 7.2 E2E 테스트 커버리지

| 구분 | 목표 | 현재 시나리오 수 |
|------|------|----------------|
| 주요 사용자 시나리오 | 100% | 9개 (E2E-001 ~ E2E-009) |
| 수용 기준 (AC) | 100% 커버 | 4개 (AC-001 ~ AC-004) |
| 비즈니스 규칙 (BR) | 100% 커버 | 4개 (BR-01 ~ BR-04) |
| 에러 케이스 | 80% 커버 | 4개 (인증실패, 비활성, 네트워크, 형식오류) |

### 7.3 테스트 매트릭스

| 요구사항 | 단위 테스트 | E2E 테스트 | 매뉴얼 테스트 |
|---------|-----------|-----------|-------------|
| AC-001 (폼 렌더링) | UT-001, UT-002, UT-003 | E2E-001 | TC-001, TC-002 |
| AC-002 (유효성 검사) | UT-004, UT-005, UT-006 | E2E-003, E2E-004 | TC-007 |
| AC-003 (에러 메시지) | UT-009, UT-010 | E2E-005, E2E-006 | TC-008 |
| AC-004 (리다이렉트) | UT-008, UT-013 | E2E-002, E2E-007 | - |
| BR-01 (필수 입력) | UT-004, UT-005 | E2E-003 | TC-007 |
| BR-02 (마스킹) | UT-012 | - | TC-003, TC-004 |
| BR-03 (원인 미공개) | UT-009 | E2E-005 | TC-008 |
| BR-04 (자동 리다이렉트) | UT-013 | E2E-007 | - |

---

## 8. 엣지 케이스 및 네거티브 테스트

### 8.1 엣지 케이스

| ID | 시나리오 | 입력 | 예상 동작 | 테스트 유형 |
|----|---------|------|----------|-----------|
| EDGE-001 | 이메일 최대 길이 | 255자 이메일 | 정상 처리 또는 길이 에러 | 단위 |
| EDGE-002 | 비밀번호 특수문자 | `!@#$%^&*()` 포함 | 정상 처리 | E2E |
| EDGE-003 | 유니코드 이메일 | `test@한글.com` | 형식 에러 | 단위 |
| EDGE-004 | 공백만 입력 | `"   "` | 필수 입력 에러 | 단위 |
| EDGE-005 | XSS 시도 | `<script>alert(1)</script>` | 이스케이프 처리 | E2E |
| EDGE-006 | SQL 인젝션 시도 | `' OR 1=1 --` | 정상 에러 처리 | E2E |
| EDGE-007 | 연속 로그인 시도 | 5회 이상 실패 | 레이트 리밋 (선택적) | E2E |
| EDGE-008 | 브라우저 뒤로가기 | 로그인 후 뒤로가기 | 세션 유지 또는 리다이렉트 | 매뉴얼 |

### 8.2 보안 테스트

| ID | 테스트 항목 | 검증 포인트 | 테스트 유형 |
|----|-----------|-----------|-----------|
| SEC-001 | 비밀번호 평문 전송 금지 | HTTPS 확인, 네트워크 탭 검사 | 매뉴얼 |
| SEC-002 | 비밀번호 로깅 금지 | 서버 로그에 비밀번호 없음 | 매뉴얼 |
| SEC-003 | CSRF 토큰 | 요청에 CSRF 토큰 포함 | E2E |
| SEC-004 | 세션 고정 공격 방지 | 로그인 후 세션 ID 변경 | 매뉴얼 |
| SEC-005 | 에러 메시지 정보 누출 | 구체적 원인 미공개 | E2E |

---

## 9. 테스트 자동화 설정

### 9.1 Vitest 설정

```typescript
// vitest.config.ts (로그인 관련 설정)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['components/auth/**', 'app/(auth)/**'],
      thresholds: {
        lines: 75,
        branches: 70,
        functions: 80,
        statements: 75,
      },
    },
  },
});
```

### 9.2 Playwright 설정

```typescript
// playwright.config.ts (로그인 관련 설정)
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['**/login.spec.ts'],
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 9.3 인증 상태 설정 (Playwright)

```typescript
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'tests/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'admin@test.com');
  await page.fill('[data-testid="password-input"]', 'test1234');
  await page.click('[data-testid="login-button"]');

  await expect(page).toHaveURL('/portal');

  // 인증 상태 저장
  await page.context().storageState({ path: authFile });
});
```

---

## 10. CI/CD 통합

### 10.1 테스트 실행 스크립트

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:login": "playwright test tests/e2e/login.spec.ts",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

### 10.2 GitHub Actions 워크플로우 (예시)

```yaml
# .github/workflows/test-login.yml
name: Login Tests

on:
  pull_request:
    paths:
      - 'app/(auth)/**'
      - 'components/auth/**'

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage -- --reporter=json
      - name: Check coverage
        run: |
          coverage=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$coverage < 75" | bc -l) )); then
            echo "Coverage $coverage% is below 75%"
            exit 1
          fi

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e:login
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 관련 문서

- 설계: `010-design.md`
- PRD: `.orchay/projects/mes-portal/prd.md`
- TRD: `.orchay/projects/mes-portal/trd.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | AI (Quality Engineer) | 최초 작성 |
