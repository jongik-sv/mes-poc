# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 - **Last Updated:** 2026-01-20

> **목적**: Auth.js 인증 설정에 대한 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-04-03 |
| Task명 | Auth.js 인증 설정 |
| 상세설계 참조 | `010-design.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | authorize 함수, JWT 콜백, 세션 콜백, 비밀번호 검증 | 80% 이상 |
| E2E 테스트 | 로그인/로그아웃 시나리오, 세션 확인, 보호된 라우트 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | 로그인 폼 UI, 세션 만료, 다중 탭 동작 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터베이스 | SQLite (테스트용) |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

### 1.3 테스트 대상 파일

| 파일 | 설명 | 테스트 유형 |
|------|------|------------|
| `lib/auth.ts` | Auth.js 설정 (authorize, callbacks) | 단위 테스트 |
| `app/api/auth/[...nextauth]/route.ts` | Auth.js API 핸들러 | E2E 테스트 |
| `app/api/auth/me/route.ts` | 현재 사용자 정보 API | 단위/E2E 테스트 |
| `middleware.ts` | 인증 미들웨어 | E2E 테스트 |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | authorize | 정상 로그인 (유효한 이메일/비밀번호) | 사용자 객체 반환 (id, email, name, role) | UC-01 |
| UT-002 | authorize | 존재하지 않는 이메일 | null 반환 | UC-01, BR-03 |
| UT-003 | authorize | 잘못된 비밀번호 | null 반환 | UC-01, BR-03 |
| UT-004 | authorize | 비활성화된 계정 (isActive=false) | null 반환 | BR-01 |
| UT-005 | authorize | 이메일 미입력 | null 반환 | UC-01 |
| UT-006 | authorize | 비밀번호 미입력 | null 반환 | UC-01 |
| UT-007 | jwt callback | 로그인 시 토큰에 사용자 정보 포함 | token.id, token.role 설정됨 | BR-05 |
| UT-008 | session callback | 세션에 사용자 정보 포함 | session.user.id, session.user.role 포함 | BR-05 |

### 2.2 테스트 케이스 상세

#### UT-001: authorize 정상 로그인

| 항목 | 내용 |
|------|------|
| **파일** | `lib/__tests__/auth.spec.ts` |
| **테스트 블록** | `describe('authorize') -> it('should return user object with valid credentials')` |
| **Mock 의존성** | `prisma.user.findUnique` - 유효한 사용자 반환 |
| **입력 데이터** | `{ email: 'admin@test.com', password: 'test1234' }` |
| **검증 포인트** | 반환 객체에 id, email, name, role 포함 확인 |
| **커버리지 대상** | `authorize()` 정상 분기 |
| **관련 요구사항** | UC-01 |

```typescript
it('should return user object with valid credentials', async () => {
  // Arrange
  const credentials = { email: 'admin@test.com', password: 'test1234' };
  mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser);

  // Act
  const result = await authorize(credentials);

  // Assert
  expect(result).toEqual({
    id: '1',
    email: 'admin@test.com',
    name: '관리자',
    role: { id: 1, code: 'ADMIN', name: '시스템 관리자' }
  });
});
```

#### UT-002: authorize 존재하지 않는 이메일

| 항목 | 내용 |
|------|------|
| **파일** | `lib/__tests__/auth.spec.ts` |
| **테스트 블록** | `describe('authorize') -> it('should return null for non-existent email')` |
| **Mock 의존성** | `prisma.user.findUnique` - null 반환 |
| **입력 데이터** | `{ email: 'notexist@test.com', password: 'test1234' }` |
| **검증 포인트** | null 반환, 상세 에러 메시지 없음 |
| **커버리지 대상** | `authorize()` 사용자 미존재 분기 |
| **관련 요구사항** | UC-01, BR-03 |

```typescript
it('should return null for non-existent email', async () => {
  // Arrange
  const credentials = { email: 'notexist@test.com', password: 'test1234' };
  mockPrisma.user.findUnique.mockResolvedValue(null);

  // Act
  const result = await authorize(credentials);

  // Assert
  expect(result).toBeNull();
});
```

#### UT-003: authorize 잘못된 비밀번호

| 항목 | 내용 |
|------|------|
| **파일** | `lib/__tests__/auth.spec.ts` |
| **테스트 블록** | `describe('authorize') -> it('should return null for invalid password')` |
| **Mock 의존성** | `prisma.user.findUnique` - 사용자 반환, `bcrypt.compare` - false 반환 |
| **입력 데이터** | `{ email: 'admin@test.com', password: 'wrongpassword' }` |
| **검증 포인트** | null 반환, bcrypt.compare 호출 확인 |
| **커버리지 대상** | `authorize()` 비밀번호 검증 실패 분기 |
| **관련 요구사항** | UC-01, BR-03 |

```typescript
it('should return null for invalid password', async () => {
  // Arrange
  const credentials = { email: 'admin@test.com', password: 'wrongpassword' };
  mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser);
  mockBcrypt.compare.mockResolvedValue(false);

  // Act
  const result = await authorize(credentials);

  // Assert
  expect(result).toBeNull();
  expect(mockBcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockAdminUser.password);
});
```

#### UT-004: authorize 비활성화된 계정

| 항목 | 내용 |
|------|------|
| **파일** | `lib/__tests__/auth.spec.ts` |
| **테스트 블록** | `describe('authorize') -> it('should return null for inactive user')` |
| **Mock 의존성** | `prisma.user.findUnique` - isActive=false 사용자 반환 |
| **입력 데이터** | `{ email: 'inactive@test.com', password: 'test1234' }` |
| **검증 포인트** | null 반환, 비밀번호 검증 스킵 |
| **커버리지 대상** | `authorize()` 비활성 계정 분기 |
| **관련 요구사항** | BR-01 |

```typescript
it('should return null for inactive user', async () => {
  // Arrange
  const credentials = { email: 'inactive@test.com', password: 'test1234' };
  const inactiveUser = { ...mockAdminUser, isActive: false };
  mockPrisma.user.findUnique.mockResolvedValue(inactiveUser);

  // Act
  const result = await authorize(credentials);

  // Assert
  expect(result).toBeNull();
  expect(mockBcrypt.compare).not.toHaveBeenCalled();
});
```

#### UT-005: authorize 이메일 미입력

| 항목 | 내용 |
|------|------|
| **파일** | `lib/__tests__/auth.spec.ts` |
| **테스트 블록** | `describe('authorize') -> it('should return null when email is missing')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | `{ email: '', password: 'test1234' }` 또는 `{ password: 'test1234' }` |
| **검증 포인트** | null 반환, DB 조회 호출 없음 |
| **커버리지 대상** | `authorize()` 입력값 검증 분기 |
| **관련 요구사항** | UC-01 |

```typescript
it('should return null when email is missing', async () => {
  // Arrange
  const credentials = { email: '', password: 'test1234' };

  // Act
  const result = await authorize(credentials);

  // Assert
  expect(result).toBeNull();
  expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
});
```

#### UT-006: authorize 비밀번호 미입력

| 항목 | 내용 |
|------|------|
| **파일** | `lib/__tests__/auth.spec.ts` |
| **테스트 블록** | `describe('authorize') -> it('should return null when password is missing')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | `{ email: 'admin@test.com', password: '' }` 또는 `{ email: 'admin@test.com' }` |
| **검증 포인트** | null 반환, DB 조회 호출 없음 |
| **커버리지 대상** | `authorize()` 입력값 검증 분기 |
| **관련 요구사항** | UC-01 |

```typescript
it('should return null when password is missing', async () => {
  // Arrange
  const credentials = { email: 'admin@test.com', password: '' };

  // Act
  const result = await authorize(credentials);

  // Assert
  expect(result).toBeNull();
  expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
});
```

#### UT-007: jwt callback 토큰에 사용자 정보 포함

| 항목 | 내용 |
|------|------|
| **파일** | `lib/__tests__/auth.spec.ts` |
| **테스트 블록** | `describe('callbacks.jwt') -> it('should add user info to token on login')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | `{ token: {}, user: mockAuthUser }` |
| **검증 포인트** | token.id, token.role 설정됨 |
| **커버리지 대상** | `callbacks.jwt()` 로그인 분기 |
| **관련 요구사항** | BR-05 |

```typescript
it('should add user info to token on login', async () => {
  // Arrange
  const token = {};
  const user = {
    id: '1',
    email: 'admin@test.com',
    name: '관리자',
    role: { id: 1, code: 'ADMIN', name: '시스템 관리자' }
  };

  // Act
  const result = await jwtCallback({ token, user });

  // Assert
  expect(result.id).toBe('1');
  expect(result.role).toEqual({ id: 1, code: 'ADMIN', name: '시스템 관리자' });
});
```

#### UT-008: session callback 세션에 사용자 정보 포함

| 항목 | 내용 |
|------|------|
| **파일** | `lib/__tests__/auth.spec.ts` |
| **테스트 블록** | `describe('callbacks.session') -> it('should add user info to session from token')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | `{ session: { user: {} }, token: mockToken }` |
| **검증 포인트** | session.user.id, session.user.role 설정됨 |
| **커버리지 대상** | `callbacks.session()` |
| **관련 요구사항** | BR-05 |

```typescript
it('should add user info to session from token', async () => {
  // Arrange
  const session = { user: {}, expires: '' };
  const token = {
    id: '1',
    role: { id: 1, code: 'ADMIN', name: '시스템 관리자' }
  };

  // Act
  const result = await sessionCallback({ session, token });

  // Assert
  expect(result.user.id).toBe('1');
  expect(result.user.role).toEqual({ id: 1, code: 'ADMIN', name: '시스템 관리자' });
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 로그인 성공 | 활성 사용자 존재 | 1. /login 접속 2. 이메일/비밀번호 입력 3. 로그인 버튼 클릭 | /portal로 리다이렉트 | UC-01 |
| E2E-002 | 로그인 실패 (잘못된 이메일) | - | 1. 존재하지 않는 이메일 입력 2. 로그인 | 에러 메시지 표시 | UC-01, BR-03 |
| E2E-003 | 로그인 실패 (잘못된 비밀번호) | 활성 사용자 존재 | 1. 올바른 이메일, 잘못된 비밀번호 입력 2. 로그인 | 에러 메시지 표시 | UC-01, BR-03 |
| E2E-004 | 세션 확인 (API 호출) | 로그인 완료 | 1. GET /api/auth/me 호출 | 사용자 정보 반환 | UC-03 |
| E2E-005 | 로그아웃 | 로그인 상태 | 1. 로그아웃 버튼 클릭 | /login으로 리다이렉트 | UC-02 |
| E2E-006 | 미인증 접근 차단 | 로그아웃 상태 | 1. /portal 직접 접근 | /login으로 리다이렉트 | UC-04, BR-04 |

### 3.2 테스트 케이스 상세

#### E2E-001: 로그인 성공

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/auth.spec.ts` |
| **테스트명** | `test('사용자가 올바른 자격 증명으로 로그인할 수 있다')` |
| **사전조건** | admin@test.com / test1234 사용자 존재 (시드 데이터) |
| **data-testid 셀렉터** | |
| - 로그인 페이지 | `[data-testid="login-page"]` |
| - 이메일 입력 | `[data-testid="email-input"]` |
| - 비밀번호 입력 | `[data-testid="password-input"]` |
| - 로그인 버튼 | `[data-testid="login-button"]` |
| **실행 단계** | |
| 1 | `await page.goto('/login')` |
| 2 | `await page.fill('[data-testid="email-input"]', 'admin@test.com')` |
| 3 | `await page.fill('[data-testid="password-input"]', 'test1234')` |
| 4 | `await page.click('[data-testid="login-button"]')` |
| 5 | `await page.waitForURL('/portal')` |
| **API 확인** | `POST /api/auth/callback/credentials` -> 302 |
| **검증 포인트** | `expect(page.url()).toContain('/portal')` |
| **스크린샷** | `e2e-001-login-success.png` |
| **관련 요구사항** | UC-01 |

```typescript
test('사용자가 올바른 자격 증명으로 로그인할 수 있다', async ({ page }) => {
  // Arrange
  await page.goto('/login');

  // Act
  await page.fill('[data-testid="email-input"]', 'admin@test.com');
  await page.fill('[data-testid="password-input"]', 'test1234');
  await page.click('[data-testid="login-button"]');

  // Assert
  await page.waitForURL('**/portal**');
  expect(page.url()).toContain('/portal');

  // Screenshot
  await page.screenshot({ path: 'e2e-001-login-success.png' });
});
```

#### E2E-002: 로그인 실패 (잘못된 이메일)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/auth.spec.ts` |
| **테스트명** | `test('존재하지 않는 이메일로 로그인 시 에러 메시지가 표시된다')` |
| **사전조건** | - |
| **data-testid 셀렉터** | |
| - 에러 메시지 | `[data-testid="login-error"]` |
| **실행 단계** | |
| 1 | `await page.goto('/login')` |
| 2 | `await page.fill('[data-testid="email-input"]', 'notexist@test.com')` |
| 3 | `await page.fill('[data-testid="password-input"]', 'test1234')` |
| 4 | `await page.click('[data-testid="login-button"]')` |
| **API 확인** | `POST /api/auth/callback/credentials` -> 에러 리다이렉트 |
| **검증 포인트** | `expect(page.locator('[data-testid="login-error"]')).toBeVisible()` |
| **스크린샷** | `e2e-002-login-invalid-email.png` |
| **관련 요구사항** | UC-01, BR-03 |

```typescript
test('존재하지 않는 이메일로 로그인 시 에러 메시지가 표시된다', async ({ page }) => {
  // Arrange
  await page.goto('/login');

  // Act
  await page.fill('[data-testid="email-input"]', 'notexist@test.com');
  await page.fill('[data-testid="password-input"]', 'test1234');
  await page.click('[data-testid="login-button"]');

  // Assert
  await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
  await expect(page.locator('[data-testid="login-error"]')).toContainText(
    '이메일 또는 비밀번호가 올바르지 않습니다'
  );

  // Screenshot
  await page.screenshot({ path: 'e2e-002-login-invalid-email.png' });
});
```

#### E2E-003: 로그인 실패 (잘못된 비밀번호)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/auth.spec.ts` |
| **테스트명** | `test('잘못된 비밀번호로 로그인 시 에러 메시지가 표시된다')` |
| **사전조건** | admin@test.com 사용자 존재 |
| **data-testid 셀렉터** | |
| - 에러 메시지 | `[data-testid="login-error"]` |
| **실행 단계** | |
| 1 | `await page.goto('/login')` |
| 2 | `await page.fill('[data-testid="email-input"]', 'admin@test.com')` |
| 3 | `await page.fill('[data-testid="password-input"]', 'wrongpassword')` |
| 4 | `await page.click('[data-testid="login-button"]')` |
| **API 확인** | `POST /api/auth/callback/credentials` -> 에러 리다이렉트 |
| **검증 포인트** | 에러 메시지 동일 (보안상 구분 안 함) |
| **스크린샷** | `e2e-003-login-invalid-password.png` |
| **관련 요구사항** | UC-01, BR-03 |

```typescript
test('잘못된 비밀번호로 로그인 시 에러 메시지가 표시된다', async ({ page }) => {
  // Arrange
  await page.goto('/login');

  // Act
  await page.fill('[data-testid="email-input"]', 'admin@test.com');
  await page.fill('[data-testid="password-input"]', 'wrongpassword');
  await page.click('[data-testid="login-button"]');

  // Assert
  await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
  await expect(page.locator('[data-testid="login-error"]')).toContainText(
    '이메일 또는 비밀번호가 올바르지 않습니다'
  );

  // Screenshot
  await page.screenshot({ path: 'e2e-003-login-invalid-password.png' });
});
```

#### E2E-004: 세션 확인 (API 호출)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/auth.spec.ts` |
| **테스트명** | `test('로그인 후 /api/auth/me에서 사용자 정보를 조회할 수 있다')` |
| **사전조건** | 로그인 완료 (fixture 사용) |
| **data-testid 셀렉터** | - (API 테스트) |
| **실행 단계** | |
| 1 | 로그인 fixture 적용 |
| 2 | `const response = await page.request.get('/api/auth/me')` |
| **API 확인** | `GET /api/auth/me` -> 200 |
| **검증 포인트** | 응답에 id, email, name, role 포함 |
| **관련 요구사항** | UC-03 |

```typescript
test('로그인 후 /api/auth/me에서 사용자 정보를 조회할 수 있다', async ({ authenticatedPage }) => {
  // Arrange - authenticatedPage fixture로 로그인 상태
  const page = authenticatedPage;

  // Act
  const response = await page.request.get('/api/auth/me');
  const data = await response.json();

  // Assert
  expect(response.status()).toBe(200);
  expect(data.success).toBe(true);
  expect(data.data).toHaveProperty('id');
  expect(data.data).toHaveProperty('email');
  expect(data.data).toHaveProperty('name');
  expect(data.data).toHaveProperty('role');
  expect(data.data.role).toHaveProperty('code');
});
```

#### E2E-005: 로그아웃

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/auth.spec.ts` |
| **테스트명** | `test('사용자가 로그아웃하면 로그인 페이지로 이동한다')` |
| **사전조건** | 로그인 상태 |
| **data-testid 셀렉터** | |
| - 로그아웃 버튼 | `[data-testid="logout-button"]` |
| **실행 단계** | |
| 1 | 로그인 fixture 적용 |
| 2 | `await page.click('[data-testid="logout-button"]')` |
| 3 | `await page.waitForURL('/login')` |
| **검증 포인트** | URL이 /login으로 변경됨 |
| **스크린샷** | `e2e-005-logout.png` |
| **관련 요구사항** | UC-02 |

```typescript
test('사용자가 로그아웃하면 로그인 페이지로 이동한다', async ({ authenticatedPage }) => {
  // Arrange
  const page = authenticatedPage;
  await page.goto('/portal');

  // Act
  await page.click('[data-testid="logout-button"]');

  // Assert
  await page.waitForURL('**/login**');
  expect(page.url()).toContain('/login');

  // Screenshot
  await page.screenshot({ path: 'e2e-005-logout.png' });
});
```

#### E2E-006: 미인증 접근 차단

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/auth.spec.ts` |
| **테스트명** | `test('미인증 사용자가 /portal 접근 시 /login으로 리다이렉트된다')` |
| **사전조건** | 로그아웃 상태 (세션 없음) |
| **data-testid 셀렉터** | - |
| **실행 단계** | |
| 1 | `await page.goto('/portal')` |
| 2 | 리다이렉트 대기 |
| **검증 포인트** | URL이 /login으로 리다이렉트됨 |
| **스크린샷** | `e2e-006-unauthorized-redirect.png` |
| **관련 요구사항** | UC-04, BR-04 |

```typescript
test('미인증 사용자가 /portal 접근 시 /login으로 리다이렉트된다', async ({ page }) => {
  // Arrange - 로그아웃 상태 (기본)

  // Act
  await page.goto('/portal');

  // Assert
  await page.waitForURL('**/login**');
  expect(page.url()).toContain('/login');

  // Screenshot
  await page.screenshot({ path: 'e2e-006-unauthorized-redirect.png' });
});
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 로그인 폼 UI 검증 | - | 1. /login 접속 | 폼 요소가 올바르게 표시됨 | High | UC-01 |
| TC-002 | 로딩 상태 표시 | - | 1. 로그인 버튼 클릭 | 로딩 인디케이터 표시 | Medium | - |
| TC-003 | 세션 만료 후 재로그인 | 로그인 상태 | 1. 세션 만료 대기 2. 페이지 새로고침 | 로그인 페이지로 이동 | High | BR-02 |
| TC-004 | 다중 탭 로그인 동작 | - | 1. 탭1 로그인 2. 탭2에서 확인 | 탭2도 로그인 상태 | Medium | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 로그인 폼 UI 검증

**테스트 목적**: 로그인 페이지의 UI 요소가 올바르게 렌더링되는지 확인

**테스트 단계**:
1. 브라우저에서 /login 페이지 접속
2. 페이지 요소 확인

**예상 결과**:
- 이메일 입력 필드 표시 (placeholder: "이메일")
- 비밀번호 입력 필드 표시 (placeholder: "비밀번호", type: password)
- 로그인 버튼 표시 ("로그인" 텍스트)
- 비밀번호 필드 마스킹 처리

**검증 기준**:
- [ ] 이메일 입력 필드가 존재하고 입력 가능함
- [ ] 비밀번호 입력 필드가 존재하고 마스킹됨
- [ ] 로그인 버튼이 존재하고 클릭 가능함
- [ ] 반응형 레이아웃 적용됨 (모바일 뷰 확인)

#### TC-002: 로딩 상태 표시

**테스트 목적**: 로그인 처리 중 로딩 상태가 사용자에게 표시되는지 확인

**테스트 단계**:
1. /login 페이지 접속
2. 이메일/비밀번호 입력
3. 로그인 버튼 클릭
4. 로딩 상태 관찰

**예상 결과**:
- 버튼에 로딩 스피너 표시
- 버튼 비활성화 (중복 클릭 방지)
- "로그인 중..." 텍스트 표시 (선택적)

**검증 기준**:
- [ ] 로그인 버튼 클릭 시 로딩 스피너 표시
- [ ] 로딩 중 버튼 비활성화
- [ ] 로딩 중 폼 입력 필드 비활성화

#### TC-003: 세션 만료 후 재로그인

**테스트 목적**: 세션이 만료된 후 사용자가 적절하게 재로그인할 수 있는지 확인

**테스트 단계**:
1. 로그인 완료 (세션 생성)
2. JWT 만료 시간 대기 (테스트 환경에서 단축 가능)
3. /portal 페이지 새로고침
4. 동작 확인

**예상 결과**:
- /login 페이지로 리다이렉트
- "세션이 만료되었습니다" 메시지 표시 (선택적)
- 재로그인 후 정상 접근

**검증 기준**:
- [ ] 세션 만료 시 보호된 페이지 접근 불가
- [ ] 로그인 페이지로 적절히 리다이렉트
- [ ] 재로그인 후 정상 동작

#### TC-004: 다중 탭 로그인 동작

**테스트 목적**: 여러 브라우저 탭에서 로그인 상태가 공유되는지 확인

**테스트 단계**:
1. 탭1: /login 페이지에서 로그인
2. 탭2: 새 탭 열기
3. 탭2: /portal 페이지 접속
4. 탭2 동작 확인

**예상 결과**:
- 탭2도 로그인 상태로 인식
- /portal 페이지 정상 접근

**검증 기준**:
- [ ] 탭1 로그인 후 탭2도 세션 공유
- [ ] 탭1 로그아웃 후 탭2 새로고침 시 로그아웃 상태

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-USER-ADMIN | 관리자 사용자 | `{ id: 1, email: 'admin@test.com', name: '관리자', password: '<hashed>', isActive: true, roleId: 1, role: { id: 1, code: 'ADMIN', name: '시스템 관리자' } }` |
| MOCK-USER-NORMAL | 일반 사용자 | `{ id: 2, email: 'user@test.com', name: '사용자', password: '<hashed>', isActive: true, roleId: 2, role: { id: 2, code: 'USER', name: '일반 사용자' } }` |
| MOCK-USER-INACTIVE | 비활성 사용자 | `{ id: 3, email: 'inactive@test.com', name: '비활성', password: '<hashed>', isActive: false, roleId: 2, role: { id: 2, code: 'USER', name: '일반 사용자' } }` |
| MOCK-TOKEN | JWT 토큰 | `{ id: '1', email: 'admin@test.com', name: '관리자', role: { id: 1, code: 'ADMIN', name: '시스템 관리자' }, iat: <timestamp>, exp: <timestamp> }` |
| MOCK-SESSION | 세션 객체 | `{ user: { id: '1', email: 'admin@test.com', name: '관리자', role: { id: 1, code: 'ADMIN', name: '시스템 관리자' } }, expires: '<ISO-date>' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-AUTH | 인증 테스트 기본 환경 | 자동 시드 (`prisma/seed.ts`) | 관리자 1명, 일반 사용자 1명, 비활성 사용자 1명 |
| SEED-E2E-ROLES | 역할 데이터 | 자동 시드 | ADMIN, MANAGER, OPERATOR, USER 역할 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 | 상태 |
|---------|--------|----------|------|------|------|
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 기능 테스트 | 활성 |
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 기능 테스트 | 활성 |
| TEST-INACTIVE | inactive@test.com | test1234 | USER | 비활성 계정 로그인 차단 테스트 | 비활성 |

### 5.4 테스트 데이터 생성 스크립트

```typescript
// prisma/seed-test.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedTestData() {
  // 역할 생성
  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: { code: 'ADMIN', name: '시스템 관리자' },
  });

  const userRole = await prisma.role.upsert({
    where: { code: 'USER' },
    update: {},
    create: { code: 'USER', name: '일반 사용자' },
  });

  // 비밀번호 해시
  const hashedPassword = await bcrypt.hash('test1234', 10);

  // 테스트 사용자 생성
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: '관리자',
      password: hashedPassword,
      isActive: true,
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      name: '사용자',
      password: hashedPassword,
      isActive: true,
      roleId: userRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'inactive@test.com' },
    update: {},
    create: {
      email: 'inactive@test.com',
      name: '비활성 사용자',
      password: hashedPassword,
      isActive: false,
      roleId: userRole.id,
    },
  });
}

seedTestData();
```

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 로그인 페이지 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `login-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `login-form` | 로그인 폼 | 폼 존재 확인 |
| `email-input` | 이메일 입력 필드 | 이메일 입력 |
| `password-input` | 비밀번호 입력 필드 | 비밀번호 입력 |
| `login-button` | 로그인 버튼 | 로그인 액션 |
| `login-error` | 에러 메시지 | 에러 표시 확인 |
| `login-loading` | 로딩 인디케이터 | 로딩 상태 확인 |

### 6.2 포털 헤더 셀렉터 (로그아웃 관련)

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `user-menu` | 사용자 메뉴 | 사용자 정보 표시 |
| `user-name` | 사용자 이름 | 로그인된 사용자 이름 |
| `user-role` | 사용자 역할 | 로그인된 사용자 역할 |
| `logout-button` | 로그아웃 버튼 | 로그아웃 액션 |

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |
| Statements | 80% | 70% |

### 7.2 커버리지 대상 파일

| 파일 | 목표 Lines | 목표 Branches |
|------|-----------|--------------|
| `lib/auth.ts` | 90% | 85% |
| `app/api/auth/me/route.ts` | 100% | 100% |

### 7.3 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 유즈케이스 (UC-01 ~ UC-04) | 100% 커버 |
| 비즈니스 규칙 (BR-01 ~ BR-05) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

### 7.4 테스트 실행 명령

```bash
# 단위 테스트 실행
pnpm test:unit

# 단위 테스트 커버리지
pnpm test:unit --coverage

# E2E 테스트 실행
pnpm test:e2e

# E2E 테스트 (특정 파일)
pnpm test:e2e tests/e2e/auth.spec.ts

# 전체 테스트
pnpm test
```

---

## 관련 문서

- 상세설계: `010-design.md`
- 요구사항 추적 매트릭스: `025-traceability-matrix.md` (작성 예정)

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |
