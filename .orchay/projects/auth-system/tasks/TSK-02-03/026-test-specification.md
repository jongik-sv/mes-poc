# 테스트 명세서 (026-test-specification.md)

**Task ID:** TSK-02-03
**Task명:** 비밀번호 변경/찾기/재설정
**Last Updated:** 2026-01-26

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-03 |
| Task명 | 비밀번호 변경/찾기/재설정 |
| 상세설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-26 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | API Route, 비즈니스 로직 | 80% 이상 |
| E2E 테스트 | 비밀번호 플로우 | 100% 시나리오 커버 |

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
| UT-02-30 | /api/auth/password/change | 정상 변경 | success: true | FR-02-11 |
| UT-02-31 | /api/auth/password/forgot | 재설정 링크 발송 | success: true | FR-02-12 |
| UT-02-32 | /api/auth/password/reset | 토큰으로 재설정 | success: true | FR-02-13 |
| UT-02-33 | /api/auth/password/change | 현재 비밀번호 불일치 | 401 에러 | BR-02-07 |
| UT-02-34 | /api/auth/password/reset | 만료된 토큰 | 400 에러 | BR-02-08 |
| UT-02-35 | /api/auth/password/change | 이력 저장 | PasswordHistory 생성 | BR-02-09 |

### 2.2 테스트 케이스 상세

#### UT-02-30: 비밀번호 정상 변경

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/auth/password/change/__tests__/route.test.ts` |
| **테스트 블록** | `describe('POST /api/auth/password/change') → it('should change password with valid data')` |
| **입력 데이터** | `{ currentPassword: 'OldPass123!', newPassword: 'NewPass123!', confirmPassword: 'NewPass123!' }` |
| **검증 포인트** | success: true, 비밀번호 변경 확인 |
| **관련 요구사항** | FR-02-11 |

#### UT-02-33: 현재 비밀번호 불일치

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/auth/password/change/__tests__/route.test.ts` |
| **테스트 블록** | `describe('POST /api/auth/password/change') → it('should reject wrong current password')` |
| **입력 데이터** | `{ currentPassword: 'WrongPass', newPassword: 'NewPass123!' }` |
| **검증 포인트** | 401 에러, INVALID_PASSWORD |
| **관련 요구사항** | BR-02-07 |

#### UT-02-34: 만료된 토큰

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/auth/password/reset/__tests__/route.test.ts` |
| **테스트 블록** | `describe('POST /api/auth/password/reset') → it('should reject expired token')` |
| **입력 데이터** | `{ token: 'expired-token', newPassword: 'NewPass123!' }` |
| **검증 포인트** | 400 에러, TOKEN_EXPIRED |
| **관련 요구사항** | BR-02-08 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-02-03 | 비밀번호 변경 성공 | 로그인 상태 | 1. 비밀번호 변경 페이지 2. 현재/새 비밀번호 입력 3. 저장 | 성공 메시지 | FR-02-14 |
| E2E-02-04 | 비밀번호 찾기 | 로그아웃 상태 | 1. 비밀번호 찾기 페이지 2. 이메일 입력 3. 전송 | 안내 메시지 | FR-02-15 |
| E2E-02-05 | 비밀번호 재설정 | 유효한 토큰 | 1. 재설정 링크 접속 2. 새 비밀번호 입력 3. 저장 | 성공 후 로그인 페이지 | FR-02-16 |

### 3.2 테스트 케이스 상세

#### E2E-02-04: 비밀번호 찾기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/password.spec.ts` |
| **테스트명** | `test('사용자가 비밀번호 찾기를 요청할 수 있다')` |
| **data-testid 셀렉터** | |
| - 이메일 입력 | `[data-testid="email-input"]` |
| - 전송 버튼 | `[data-testid="forgot-password-button"]` |
| - 성공 메시지 | `[data-testid="forgot-password-success"]` |
| **실행 단계** | |
| 1 | `await page.goto('/forgot-password')` |
| 2 | `await page.fill('[data-testid="email-input"]', 'user@test.com')` |
| 3 | `await page.click('[data-testid="forgot-password-button"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="forgot-password-success"]')).toBeVisible()` |
| **관련 요구사항** | FR-02-15 |

---

## 4. 테스트 데이터 (Fixture)

### 4.1 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 용도 |
|---------|--------|----------|------|
| TEST-USER | user@test.com | Password123! | 비밀번호 변경 테스트 |

### 4.2 테스트 토큰

| 토큰 ID | 용도 | 유효 기간 |
|---------|------|----------|
| VALID-TOKEN | 정상 재설정 | 1시간 |
| EXPIRED-TOKEN | 만료 테스트 | 만료됨 |
| USED-TOKEN | 사용됨 테스트 | 이미 사용됨 |

---

## 5. data-testid 목록

### 5.1 비밀번호 변경 폼

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `current-password-input` | 현재 비밀번호 입력 | 현재 비밀번호 |
| `new-password-input` | 새 비밀번호 입력 | 새 비밀번호 |
| `confirm-password-input` | 비밀번호 확인 입력 | 확인 |
| `change-password-button` | 변경 버튼 | 저장 |
| `password-strength-indicator` | 비밀번호 강도 | 강도 표시 |

### 5.2 비밀번호 찾기 폼

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `forgot-password-form` | 폼 컨테이너 | 폼 |
| `email-input` | 이메일 입력 | 이메일 |
| `forgot-password-button` | 전송 버튼 | 링크 발송 |
| `forgot-password-success` | 성공 메시지 | 성공 안내 |
| `error-message` | 에러 메시지 | 에러 표시 |

### 5.3 비밀번호 재설정 폼

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `password-reset-form` | 폼 컨테이너 | 폼 |
| `new-password-input` | 새 비밀번호 입력 | 새 비밀번호 |
| `confirm-password-input` | 비밀번호 확인 | 확인 |
| `password-reset-button` | 재설정 버튼 | 저장 |
| `password-reset-success` | 성공 메시지 | 성공 안내 |
| `invalid-token` | 토큰 오류 | 유효하지 않은 토큰 |

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
| 에러 케이스 | 80% 커버 |

---

## 관련 문서

- 상세설계: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/auth-system/prd.md`
