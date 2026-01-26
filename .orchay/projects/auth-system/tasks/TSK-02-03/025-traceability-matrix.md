# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

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
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-26 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

| 요구사항 ID | PRD 섹션 | 상세설계 섹션 | 단위 테스트 | E2E 테스트 | 상태 |
|-------------|----------|--------------|-------------|------------|------|
| FR-02-11 | 4.1.6 | 3.2 | UT-02-30 | - | 완료 |
| FR-02-12 | 4.1.6 | 3.3 | UT-02-31 | - | 완료 |
| FR-02-13 | 4.1.6 | 3.4 | UT-02-32 | - | 완료 |
| FR-02-14 | 4.1.6 | 5 | - | E2E-02-03 | 완료 |
| FR-02-15 | 4.1.6 | 5 | - | E2E-02-04 | 완료 |
| FR-02-16 | 4.1.6 | 5 | - | E2E-02-05 | 완료 |

### 1.1 요구사항별 상세 매핑

#### FR-02-11: POST /api/auth/password/change

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.6 | 비밀번호 변경 |
| 상세설계 | 010-design.md | 3.2 | POST /api/auth/password/change |
| 구현 파일 | - | - | app/api/auth/password/change/route.ts |

#### FR-02-12: POST /api/auth/password/forgot

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.6 | 비밀번호 찾기 (재설정 링크 발송) |
| 상세설계 | 010-design.md | 3.3 | POST /api/auth/password/forgot |
| 구현 파일 | - | - | app/api/auth/password/forgot/route.ts |

#### FR-02-13: POST /api/auth/password/reset

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.6 | 비밀번호 재설정 |
| 상세설계 | 010-design.md | 3.4 | POST /api/auth/password/reset |
| 구현 파일 | - | - | app/api/auth/password/reset/route.ts |

#### FR-02-14: PasswordChangeForm

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.6 | 비밀번호 변경 화면 |
| 상세설계 | 010-design.md | 5 | UI 설계 |
| 구현 파일 | - | - | components/auth/PasswordChangeForm.tsx |

#### FR-02-15: ForgotPasswordForm

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.6 | 비밀번호 찾기 화면 |
| 상세설계 | 010-design.md | 5 | UI 설계 |
| 구현 파일 | - | - | components/auth/ForgotPasswordForm.tsx |

#### FR-02-16: PasswordResetForm

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.6 | 비밀번호 재설정 화면 |
| 상세설계 | 010-design.md | 5 | UI 설계 |
| 구현 파일 | - | - | components/auth/PasswordResetForm.tsx |

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD 출처 | 상세설계 섹션 | 구현 위치 | 단위 테스트 | 검증 방법 | 상태 |
|---------|----------|--------------|-----------|-------------|-----------|------|
| BR-02-07 | 4.1.6 | 4 | /api/auth/password/change | UT-02-33 | 현재 비밀번호 확인 | 완료 |
| BR-02-08 | 4.1.6 | 4 | /api/auth/password/reset | UT-02-34 | 토큰 1시간 유효 | 완료 |
| BR-02-09 | 4.1.6 | 4 | /api/auth/password/change | UT-02-35 | 이력 저장 | 완료 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-02-07: 현재 비밀번호 확인

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 비밀번호 변경 시 현재 비밀번호 확인 필수 |
| **구현 위치** | app/api/auth/password/change/route.ts |
| **검증 방법** | bcrypt.compare로 현재 비밀번호 검증 |
| **관련 테스트** | UT-02-33 |

#### BR-02-08: 재설정 토큰 1시간 유효

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 비밀번호 재설정 링크 1시간 유효 |
| **구현 위치** | app/api/auth/password/forgot/route.ts, reset/route.ts |
| **검증 방법** | expiresAt 필드 비교 |
| **관련 테스트** | UT-02-34 |

#### BR-02-09: 비밀번호 이력 저장

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 비밀번호 변경 후 이력 저장 |
| **구현 위치** | app/api/auth/password/change/route.ts |
| **검증 방법** | PasswordHistory 테이블에 저장 확인 |
| **관련 테스트** | UT-02-35 |

---

## 3. 테스트 역추적 매트릭스

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-02-30 | 단위 | FR-02-11 | - | PASS |
| UT-02-31 | 단위 | FR-02-12 | - | PASS |
| UT-02-32 | 단위 | FR-02-13 | - | PASS |
| UT-02-33 | 단위 | - | BR-02-07 | PASS |
| UT-02-34 | 단위 | - | BR-02-08 | PASS |
| UT-02-35 | 단위 | - | BR-02-09 | PASS |
| E2E-02-03 | E2E | FR-02-14 | - | PASS |
| E2E-02-04 | E2E | FR-02-15 | - | PASS |
| E2E-02-05 | E2E | FR-02-16 | - | PASS |

---

## 4. 인터페이스 추적

| 상세설계 API | Method | Endpoint | 구현 파일 | 요구사항 |
|-------------|--------|----------|----------|----------|
| 비밀번호 변경 | POST | /api/auth/password/change | app/api/auth/password/change/route.ts | FR-02-11 |
| 비밀번호 찾기 | POST | /api/auth/password/forgot | app/api/auth/password/forgot/route.ts | FR-02-12 |
| 비밀번호 재설정 | POST | /api/auth/password/reset | app/api/auth/password/reset/route.ts | FR-02-13 |

---

## 5. 화면 추적

| 상세설계 화면 | 컴포넌트 | 파일 | 요구사항 |
|--------------|----------|------|----------|
| 비밀번호 변경 폼 | PasswordChangeForm | components/auth/PasswordChangeForm.tsx | FR-02-14 |
| 비밀번호 찾기 폼 | ForgotPasswordForm | components/auth/ForgotPasswordForm.tsx | FR-02-15 |
| 비밀번호 찾기 페이지 | ForgotPasswordPage | app/(auth)/forgot-password/page.tsx | FR-02-15 |
| 비밀번호 재설정 폼 | PasswordResetForm | components/auth/PasswordResetForm.tsx | FR-02-16 |
| 비밀번호 재설정 페이지 | ResetPasswordPage | app/(auth)/reset-password/page.tsx | FR-02-16 |

---

## 6. 추적성 검증 요약

### 6.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 6 | 6 | 0 | 100% |
| 비즈니스 규칙 (BR) | 3 | 3 | 0 | 100% |
| 단위 테스트 (UT) | 6 | 6 | 0 | 100% |
| E2E 테스트 | 3 | 3 | 0 | 100% |

### 6.2 미매핑 항목

없음

---

## 관련 문서

- 상세설계: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- PRD: `.orchay/projects/auth-system/prd.md`
- TRD: `.orchay/projects/auth-system/trd.md`
