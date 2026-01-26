# 테스트 명세서 (026-test-specification.md)

**Task ID:** TSK-02-01
**Task명:** 로그인/로그아웃 API 및 화면
**Last Updated:** 2026-01-26

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-01 |
| Task명 | 로그인/로그아웃 API 및 화면 |
| 상세설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-26 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | API Route, 인증 로직 | 80% 이상 |
| E2E 테스트 | 로그인 플로우 | 100% 시나리오 커버 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터베이스 | SQLite (테스트용) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-02-01 | /api/auth/login | 정상 로그인 | accessToken, refreshToken 반환 | FR-02-01 |
| UT-02-02 | /api/auth/logout | 정상 로그아웃 | success: true | FR-02-02 |
| UT-02-03 | /api/auth/refresh | 토큰 갱신 | 새 토큰 반환, 기존 토큰 폐기 | FR-02-03, BR-02-02 |
| UT-02-04 | /api/auth/me | 사용자 정보 조회 | user, roles, permissions | FR-02-04 |
| UT-02-05 | /api/auth/login | 5회 실패 시 계정 잠금 | ACCOUNT_LOCKED 에러 | BR-02-01 |
| UT-02-06 | /api/auth/login | 감사 로그 생성 | AuditLog 기록 확인 | BR-02-03 |

### 2.2 테스트 케이스 상세

#### UT-02-01: 정상 로그인

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/auth/login/__tests__/route.test.ts` |
| **테스트 블록** | `describe('POST /api/auth/login') → it('should return tokens for valid credentials')` |
| **입력 데이터** | `{ email: 'admin@example.com', password: 'password123' }` |
| **검증 포인트** | accessToken, refreshToken 존재, user 정보 포함 |
| **관련 요구사항** | FR-02-01 |

#### UT-02-05: 계정 잠금

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/auth/login/__tests__/route.test.ts` |
| **테스트 블록** | `describe('POST /api/auth/login') → it('should lock account after 5 failed attempts')` |
| **입력 데이터** | 잘못된 비밀번호 6회 시도 |
| **검증 포인트** | 6번째 시도에서 ACCOUNT_LOCKED 에러, isLocked=true |
| **관련 요구사항** | BR-02-01 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-02-01 | 로그인 성공 | 테스트 사용자 존재 | 1. 로그인 페이지 접속 2. 이메일/비밀번호 입력 3. 로그인 버튼 클릭 | 대시보드 이동 | FR-02-01 |
| E2E-02-02 | 로그인 실패 | - | 잘못된 비밀번호 입력 | 에러 메시지 표시 | FR-02-05 |

### 3.2 테스트 케이스 상세

#### E2E-02-01: 로그인 성공

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/auth.spec.ts` |
| **테스트명** | `test('사용자가 이메일과 비밀번호로 로그인할 수 있다')` |
| **data-testid 셀렉터** | |
| - 이메일 입력 | `[data-testid="email-input"]` |
| - 비밀번호 입력 | `[data-testid="password-input"]` |
| - 로그인 버튼 | `[data-testid="login-button"]` |
| **실행 단계** | |
| 1 | `await page.goto('/login')` |
| 2 | `await page.fill('[data-testid="email-input"]', 'admin@example.com')` |
| 3 | `await page.fill('[data-testid="password-input"]', 'password123')` |
| 4 | `await page.click('[data-testid="login-button"]')` |
| **검증 포인트** | `expect(page).toHaveURL('/dashboard')` |
| **관련 요구사항** | FR-02-01 |

---

## 4. 테스트 데이터 (Fixture)

### 4.1 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-ADMIN | admin@example.com | password123 | SYSTEM_ADMIN | 관리자 로그인 테스트 |
| TEST-USER | operator@example.com | password123 | OPERATOR | 일반 사용자 테스트 |

---

## 5. data-testid 목록

### 5.1 로그인 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `login-form` | 폼 컨테이너 | 폼 존재 확인 |
| `email-input` | 이메일 입력 | 이메일 입력 |
| `password-input` | 비밀번호 입력 | 비밀번호 입력 |
| `remember-checkbox` | 자동 로그인 체크박스 | 자동 로그인 설정 |
| `login-button` | 로그인 버튼 | 로그인 실행 |
| `error-message` | 에러 메시지 | 에러 표시 확인 |
| `forgot-password-link` | 비밀번호 찾기 링크 | 비밀번호 찾기 이동 |

---

## 6. 테스트 커버리지 목표

### 6.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |

### 6.2 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 기능 요구사항 (FR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

---

## 관련 문서

- 상세설계: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/auth-system/prd.md`
