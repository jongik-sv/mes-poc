# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

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
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-26 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

| 요구사항 ID | PRD 섹션 | 상세설계 섹션 | 단위 테스트 | E2E 테스트 | 상태 |
|-------------|----------|--------------|-------------|------------|------|
| FR-02-01 | 4.1.1 | 3.2 | UT-02-01 | E2E-02-01 | 완료 |
| FR-02-02 | 4.1.2 | 3.3 | UT-02-02 | - | 완료 |
| FR-02-03 | 4.1.1 | 3.4 | UT-02-03 | - | 완료 |
| FR-02-04 | 4.1.1 | 3.5 | UT-02-04 | - | 완료 |
| FR-02-05 | 4.1.1 | 5 | - | E2E-02-02 | 완료 |

### 1.1 요구사항별 상세 매핑

#### FR-02-01: POST /api/auth/login (로그인 API)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | Access + Refresh Token 발급 |
| 상세설계 | 010-design.md | 3.2 | POST /api/auth/login |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-02-01 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-02-01 |

#### FR-02-02: POST /api/auth/logout (로그아웃 API)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.2 | 토큰 무효화 |
| 상세설계 | 010-design.md | 3.3 | POST /api/auth/logout |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-02-02 |

#### FR-02-03: POST /api/auth/refresh (토큰 갱신 API)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 토큰 갱신, Token Rotation |
| 상세설계 | 010-design.md | 3.4 | POST /api/auth/refresh |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-02-03 |

#### FR-02-04: GET /api/auth/me (사용자 정보 조회 API)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 현재 사용자 정보 |
| 상세설계 | 010-design.md | 3.5 | GET /api/auth/me |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-02-04 |

#### FR-02-05: LoginForm (로그인 화면)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 로그인 화면 UI |
| 상세설계 | 010-design.md | 5 | UI 설계, data-testid |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-02-02 |

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD 출처 | 상세설계 섹션 | 구현 위치 | 단위 테스트 | 검증 방법 | 상태 |
|---------|----------|--------------|-----------|-------------|-----------|------|
| BR-02-01 | 4.1.5 | 4.1 | /api/auth/login | UT-02-05 | 5회 실패 시 계정 잠금 | 완료 |
| BR-02-02 | 4.1.1 | 4.2 | /api/auth/refresh | UT-02-03 | Token Rotation 적용 | 완료 |
| BR-02-03 | 4.3.1 | 4.1 | /api/auth/login | UT-02-06 | 감사 로그 생성 | 완료 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-02-01: 계정 잠금 (5회 실패 시)

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 로그인 5회 실패 시 계정 30분 잠금 |
| **구현 위치** | app/api/auth/login/route.ts |
| **검증 방법** | 실패 횟수 증가 및 잠금 상태 확인 |
| **관련 테스트** | UT-02-05 |

#### BR-02-02: Token Rotation

| 구분 | 내용 |
|------|------|
| **PRD 원문** | Refresh Token 사용 시 새 토큰으로 교체 |
| **구현 위치** | app/api/auth/refresh/route.ts |
| **검증 방법** | 기존 토큰 폐기, 새 토큰 발급 확인 |
| **관련 테스트** | UT-02-03 |

#### BR-02-03: 감사 로그 기록

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 로그인/로그아웃 시 감사 로그 생성 |
| **구현 위치** | app/api/auth/login/route.ts, app/api/auth/logout/route.ts |
| **검증 방법** | AuditLog 테이블에 기록 확인 |
| **관련 테스트** | UT-02-06 |

---

## 3. 테스트 역추적 매트릭스

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-02-01 | 단위 | FR-02-01 | - | PASS |
| UT-02-02 | 단위 | FR-02-02 | - | PASS |
| UT-02-03 | 단위 | FR-02-03 | BR-02-02 | PASS |
| UT-02-04 | 단위 | FR-02-04 | - | PASS |
| UT-02-05 | 단위 | - | BR-02-01 | PASS |
| UT-02-06 | 단위 | - | BR-02-03 | PASS |
| E2E-02-01 | E2E | FR-02-01 | - | PASS |
| E2E-02-02 | E2E | FR-02-05 | - | PASS |

---

## 4. 인터페이스 추적

| 상세설계 API | Method | Endpoint | 구현 파일 | 요구사항 |
|-------------|--------|----------|----------|----------|
| 로그인 | POST | /api/auth/login | app/api/auth/login/route.ts | FR-02-01 |
| 로그아웃 | POST | /api/auth/logout | app/api/auth/logout/route.ts | FR-02-02 |
| 토큰 갱신 | POST | /api/auth/refresh | app/api/auth/refresh/route.ts | FR-02-03 |
| 사용자 정보 | GET | /api/auth/me | app/api/auth/me/route.ts | FR-02-04 |

---

## 5. 화면 추적

| 상세설계 화면 | 컴포넌트 | 파일 | 요구사항 |
|--------------|----------|------|----------|
| 로그인 페이지 | LoginPage | app/(auth)/login/page.tsx | FR-02-05 |
| 로그인 폼 | LoginForm | components/auth/LoginForm.tsx | FR-02-05 |

---

## 6. 추적성 검증 요약

### 6.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 5 | 5 | 0 | 100% |
| 비즈니스 규칙 (BR) | 3 | 3 | 0 | 100% |
| 단위 테스트 (UT) | 6 | 6 | 0 | 100% |
| E2E 테스트 | 2 | 2 | 0 | 100% |

### 6.2 미매핑 항목

없음

---

## 관련 문서

- 상세설계: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- PRD: `.orchay/projects/auth-system/prd.md`
- TRD: `.orchay/projects/auth-system/trd.md`
