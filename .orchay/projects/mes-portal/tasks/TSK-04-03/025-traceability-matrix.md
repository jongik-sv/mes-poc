# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

> **목적**: PRD/TRD -> 설계 -> 테스트 양방향 추적
>
> **참조**: 이 문서는 `010-design.md`와 `026-test-specification.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-04-03 |
| Task명 | Auth.js 인증 설정 |
| 상세설계 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR -> 설계 -> 테스트)

> PRD/TRD -> 설계 -> 테스트케이스 매핑

| 요구사항 ID | PRD/TRD 섹션 | 설계 섹션 | 구현 위치 | 단위 테스트 | E2E 테스트 | 매뉴얼 TC | 상태 |
|-------------|--------------|----------|----------|-------------|------------|-----------|------|
| FR-001 | TRD 1.1, 2.3 | 5.3.1 | lib/auth.ts | UT-001 | E2E-001 | TC-001 | 설계완료 |
| FR-002 | TRD 1.1 | 5.3.1 | lib/auth.ts (authorize) | UT-002 | E2E-001 | TC-001 | 설계완료 |
| FR-003 | TRD 1.1 | 5.3.1 | lib/auth.ts (session) | UT-003 | E2E-002 | TC-002 | 설계완료 |
| FR-004 | TRD 1.1 | 5.3.1 | lib/auth.ts (callbacks) | UT-004 | E2E-002 | TC-002 | 설계완료 |
| FR-005 | PRD 4.1.4 | 3.2 UC-01 | lib/auth.ts | UT-005 | E2E-001 | TC-001 | 설계완료 |
| FR-006 | PRD 4.1.4 | 9.1 | lib/auth.ts | UT-006 | E2E-003 | TC-003 | 설계완료 |
| FR-007 | PRD 5.2 | 7.2 | lib/auth.ts (callbacks) | UT-007 | E2E-002 | TC-002 | 설계완료 |
| FR-008 | PRD 5.2 | 5.3.1 | lib/auth.ts | UT-008 | E2E-004 | TC-004 | 설계완료 |

### 1.1 요구사항별 상세 매핑

#### FR-001: Auth.js (NextAuth v5) 설치 및 설정

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| TRD | trd.md | 1.1 인증 | Auth.js (NextAuth v5) 5.x - Next.js 통합, JWT/세션 지원 |
| TRD | trd.md | 2.3 MVP API Routes 범위 | /api/auth/[...nextauth]/route.ts 핸들러 |
| 설계서 | 010-design.md | 5.3.1 | NextAuth config 설정 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-001: Auth.js 설정 로드 테스트 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001: 로그인 흐름 테스트 |

#### FR-002: Credentials Provider 구현

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| TRD | trd.md | 1.1 인증 | Credentials Provider - 이메일/비밀번호 인증 |
| 설계서 | 010-design.md | 5.3.1 | authorize() 함수 구현 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-002: authorize 함수 테스트 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001: 로그인 흐름 테스트 |

#### FR-003: JWT 세션 전략 구현

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| TRD | trd.md | 1.1 인증 | JWT/세션 지원 |
| 설계서 | 010-design.md | 5.3.1 | session.strategy: 'jwt', maxAge: 30일 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-003: JWT 토큰 생성 테스트 |
| E2E 테스트 | 026-test-specification.md | 3.2 | E2E-002: 세션 유지 테스트 |

#### FR-004: 세션에 사용자 역할 포함

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| TRD | trd.md | 1.1 인증 | RBAC 구현 용이 |
| 설계서 | 010-design.md | 5.3.1 | callbacks.jwt, callbacks.session 확장 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-004: 세션 콜백 테스트 |
| E2E 테스트 | 026-test-specification.md | 3.2 | E2E-002: 세션에서 역할 확인 |

#### FR-005: 이메일/비밀번호 로그인 성공

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.4 | 로그인/로그아웃 |
| 설계서 | 010-design.md | 3.2 UC-01 | 로그인 유즈케이스 기본 흐름 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-005: 정상 로그인 테스트 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001: 로그인 성공 시나리오 |

#### FR-006: 로그인 실패 시 에러 메시지

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.4 | 사용자 관리 |
| 설계서 | 010-design.md | 9.1 | 예상 에러 상황 정의 |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-006: 인증 실패 테스트 |
| E2E 테스트 | 026-test-specification.md | 3.3 | E2E-003: 로그인 실패 시나리오 |

#### FR-007: 세션에서 userId, email, role 접근 가능

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 5.2 | JWT 기반 인증 |
| 설계서 | 010-design.md | 7.2 | 세션 데이터 구조 정의 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-007: 세션 데이터 접근 테스트 |
| E2E 테스트 | 026-test-specification.md | 3.2 | E2E-002: /api/auth/me 응답 검증 |

#### FR-008: JWT 토큰 발급 및 검증

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 5.2 | JWT 기반 인증 |
| 설계서 | 010-design.md | 5.3.1 | session.strategy: 'jwt' |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-008: JWT 토큰 검증 테스트 |
| E2E 테스트 | 026-test-specification.md | 3.4 | E2E-004: 토큰 만료 시나리오 |

---

## 2. 비즈니스 규칙 추적 (BR -> 구현 -> 검증)

| 규칙 ID | PRD/TRD 출처 | 설계 섹션 | 구현 위치 | 단위 테스트 | E2E 테스트 | 검증 방법 | 상태 |
|---------|--------------|----------|----------|-------------|------------|-----------|------|
| BR-001 | TRD 2.3 | 8.1 | lib/auth.ts (authorize) | UT-009 | E2E-005 | bcrypt.compare 호출 확인 | 설계완료 |
| BR-002 | TRD 2.3 | 8.1 | lib/auth.ts (authorize) | UT-010 | E2E-006 | isActive=false 시 null 반환 확인 | 설계완료 |
| BR-003 | TRD 1.1 | 5.3.1 | lib/auth.ts (session) | UT-011 | E2E-004 | maxAge 설정 확인 | 설계완료 |
| BR-004 | TRD 3.2 | 9.1 | lib/auth.ts (authorize) | UT-012 | E2E-003 | 통일된 에러 메시지 확인 | 설계완료 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-001: 비밀번호 검증 (bcrypt 해시 비교)

| 구분 | 내용 |
|------|------|
| **TRD 원문** | 비밀번호: bcrypt 해시 (TRD 2.3 MVP Prisma 스키마) |
| **설계 표현** | bcrypt.compare(credentials.password, user.password) |
| **구현 위치** | lib/auth.ts - authorize() 함수 내 비밀번호 검증 로직 |
| **검증 방법** | 해시된 비밀번호와 입력값 비교, 올바른 비밀번호만 인증 성공 |
| **관련 테스트** | UT-009, E2E-005 |

#### BR-002: 비활성 사용자 로그인 차단 (isActive 체크)

| 구분 | 내용 |
|------|------|
| **TRD 원문** | isActive Boolean @default(true) (TRD 2.3 User 모델) |
| **설계 표현** | if (!user.isActive) return null |
| **구현 위치** | lib/auth.ts - authorize() 함수 내 활성 상태 확인 |
| **검증 방법** | isActive=false인 사용자 로그인 시도 -> null 반환 |
| **관련 테스트** | UT-010, E2E-006 |

#### BR-003: JWT 세션 유효 기간 관리

| 구분 | 내용 |
|------|------|
| **TRD 원문** | JWT 기반 인증 (TRD 1.1 인증) |
| **설계 표현** | session.maxAge: 30 * 24 * 60 * 60 (30일) |
| **구현 위치** | lib/auth.ts - session 설정 |
| **검증 방법** | 토큰 발급 시 만료 시간 30일 설정 확인 |
| **관련 테스트** | UT-011, E2E-004 |

#### BR-004: 인증 실패 시 일관된 에러 응답

| 구분 | 내용 |
|------|------|
| **TRD 원문** | 보안 요구사항 - XSS, CSRF 방지 (TRD 3.2) |
| **설계 표현** | "이메일 또는 비밀번호가 올바르지 않습니다" 통일 메시지 |
| **구현 위치** | lib/auth.ts - authorize() 함수, 모든 실패 케이스 null 반환 |
| **검증 방법** | 사용자 미존재, 비밀번호 오류 모두 동일한 메시지 표시 |
| **관련 테스트** | UT-012, E2E-003 |

---

## 3. 테스트 역추적 매트릭스

> 테스트 결과 -> 요구사항 역추적용

| 테스트 ID | 테스트 유형 | 테스트 설명 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|------------|-------------------|----------------------|------|
| UT-001 | 단위 | Auth.js 설정 로드 | FR-001 | - | 미실행 |
| UT-002 | 단위 | authorize 함수 정상 동작 | FR-002 | - | 미실행 |
| UT-003 | 단위 | JWT 토큰 생성 | FR-003 | - | 미실행 |
| UT-004 | 단위 | 세션 콜백 역할 포함 | FR-004 | - | 미실행 |
| UT-005 | 단위 | 정상 로그인 | FR-005 | - | 미실행 |
| UT-006 | 단위 | 인증 실패 처리 | FR-006 | - | 미실행 |
| UT-007 | 단위 | 세션 데이터 접근 | FR-007 | - | 미실행 |
| UT-008 | 단위 | JWT 토큰 검증 | FR-008 | - | 미실행 |
| UT-009 | 단위 | bcrypt 비밀번호 검증 | - | BR-001 | 미실행 |
| UT-010 | 단위 | 비활성 사용자 차단 | - | BR-002 | 미실행 |
| UT-011 | 단위 | 세션 만료 시간 설정 | - | BR-003 | 미실행 |
| UT-012 | 단위 | 통일된 에러 메시지 | - | BR-004 | 미실행 |
| E2E-001 | E2E | 로그인 성공 흐름 | FR-001, FR-002, FR-005 | - | 미실행 |
| E2E-002 | E2E | 세션 유지 및 역할 확인 | FR-003, FR-004, FR-007 | - | 미실행 |
| E2E-003 | E2E | 로그인 실패 시나리오 | FR-006 | BR-004 | 미실행 |
| E2E-004 | E2E | 토큰 만료 시나리오 | FR-008 | BR-003 | 미실행 |
| E2E-005 | E2E | 비밀번호 검증 흐름 | - | BR-001 | 미실행 |
| E2E-006 | E2E | 비활성 사용자 로그인 차단 | - | BR-002 | 미실행 |
| TC-001 | 매뉴얼 | 정상 로그인 시나리오 | FR-001, FR-002, FR-005 | - | 미실행 |
| TC-002 | 매뉴얼 | 세션 확인 시나리오 | FR-003, FR-004, FR-007 | - | 미실행 |
| TC-003 | 매뉴얼 | 로그인 실패 시나리오 | FR-006 | BR-004 | 미실행 |
| TC-004 | 매뉴얼 | 세션 만료 시나리오 | FR-008 | BR-003 | 미실행 |

---

## 4. 데이터 모델 추적

> 데이터 모델 -> JWT Session 매핑

| 데이터 모델 | 모델 필드 | JWT Token 필드 | Session 필드 | 용도 |
|------------|----------|----------------|--------------|------|
| User | id | token.id | session.user.id | 사용자 식별 |
| User | email | token.email | session.user.email | 로그인 식별자 |
| User | name | token.name | session.user.name | 표시명 |
| User | password | - | - | 인증 검증용 (세션 미포함) |
| User | isActive | - | - | 로그인 허용 여부 (세션 미포함) |
| User | roleId | - | - | 역할 조회용 (세션에는 role 객체로 포함) |
| Role | id | token.role.id | session.user.role.id | 역할 식별 |
| Role | code | token.role.code | session.user.role.code | 권한 체크용 (ADMIN, MANAGER, OPERATOR) |
| Role | name | token.role.name | session.user.role.name | 역할 표시명 |

### 4.1 데이터 흐름

```
User (DB) + Role (DB)
    |
    v
authorize() 함수에서 조회
    |
    v
JWT Token (id, email, name, role)
    |
    v
Session (user.id, user.email, user.name, user.role)
    |
    v
클라이언트/서버 컴포넌트에서 사용
```

### 4.2 Prisma 쿼리와 세션 매핑

| Prisma 조회 | 세션 매핑 |
|-------------|----------|
| `prisma.user.findUnique({ where: { email }, include: { role: true } })` | authorize() 반환값 |
| `user.id` -> `String(user.id)` | `session.user.id` |
| `user.email` | `session.user.email` |
| `user.name` | `session.user.name` |
| `user.role.id` | `session.user.role.id` |
| `user.role.code` | `session.user.role.code` |
| `user.role.name` | `session.user.role.name` |

---

## 5. 인터페이스 추적

> API 엔드포인트 매핑

| 설계 인터페이스 | API 경로 | Method | 요청 형식 | 응답 형식 | 요구사항 |
|----------------|----------|--------|----------|----------|----------|
| Auth.js 핸들러 | /api/auth/[...nextauth] | GET, POST | Auth.js 내부 | Auth.js 내부 | FR-001, FR-002 |
| 로그인 | /api/auth/callback/credentials | POST | `{ email, password }` | JWT Cookie 설정 | FR-005 |
| 로그아웃 | /api/auth/signout | POST | - | Cookie 삭제 | PRD 4.1.4 |
| 세션 조회 | /api/auth/session | GET | - | Session 객체 | FR-003, FR-007 |
| 현재 사용자 | /api/auth/me | GET | - | User 정보 | FR-007 |

### 5.1 API 응답 형식

#### GET /api/auth/me - 성공

```json
{
  "success": true,
  "data": {
    "id": "1",
    "email": "admin@example.com",
    "name": "관리자",
    "role": {
      "id": 1,
      "code": "ADMIN",
      "name": "시스템 관리자"
    }
  }
}
```

#### GET /api/auth/me - 실패 (미인증)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 5.2 미들웨어 경로 매핑

| 경로 패턴 | 인증 요구 | 동작 |
|----------|----------|------|
| /portal/* | 필수 | 미인증 시 /login 리다이렉트 |
| /login | 불필요 | 인증됨 시 /portal 리다이렉트 |
| /api/auth/* | 통과 | Auth.js 내부 처리 |
| /api/* | 선택적 | 개별 API에서 처리 |

---

## 6. 화면 추적

> 백엔드 Task이므로 화면 직접 구현 없음

| 관련 화면 | 담당 Task | 연관 API | 비고 |
|----------|----------|----------|------|
| 로그인 페이지 | TSK-04-04 | /api/auth/callback/credentials | signIn() 함수 사용 |
| 포털 헤더 (사용자 정보) | TSK-01-02 | /api/auth/me | 세션에서 사용자 정보 표시 |
| 사이드바 메뉴 | TSK-03-02 | /api/menus | 세션의 role.code로 메뉴 필터링 |

---

## 7. 추적성 검증 요약

### 7.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 8 | 8 | 0 | 100% |
| 비즈니스 규칙 (BR) | 4 | 4 | 0 | 100% |
| 단위 테스트 (UT) | 12 | 12 | 0 | 100% |
| E2E 테스트 | 6 | 6 | 0 | 100% |
| 매뉴얼 테스트 (TC) | 4 | 4 | 0 | 100% |

### 7.2 미매핑 항목

| 구분 | ID | 설명 | 미매핑 사유 |
|------|-----|------|-----------|
| - | - | - | 미매핑 항목 없음 |

### 7.3 추적성 검증 결과

| 검증 항목 | 결과 | 비고 |
|----------|------|------|
| PRD 요구사항 -> 설계 | Pass | 4.1.4, 5.2 섹션 완전 커버 |
| TRD 요구사항 -> 설계 | Pass | 1.1 인증, 2.3 MVP API Routes 완전 커버 |
| 설계 -> 테스트 | Pass | 모든 설계 항목에 테스트 매핑 |
| 테스트 -> 요구사항 역추적 | Pass | 모든 테스트가 요구사항 또는 비즈니스 규칙 검증 |

---

## 관련 문서

- 설계서: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- PRD: `.orchay/projects/mes-portal/prd.md`
- TRD: `.orchay/projects/mes-portal/trd.md`
- TSK-04-02 설계서: `tasks/TSK-04-02/010-design.md`

---

<!--
author: Claude
Template Version History:
- v1.0.0 (2026-01-20): TSK-04-03 Auth.js 인증 설정 추적성 매트릭스 작성
  - 기능 요구사항 8개 (FR-001 ~ FR-008) 추적
  - 비즈니스 규칙 4개 (BR-001 ~ BR-004) 추적
  - 데이터 모델 추적 (User, Role -> JWT Session)
  - 인터페이스 추적 (Auth.js API 엔드포인트)
-->
