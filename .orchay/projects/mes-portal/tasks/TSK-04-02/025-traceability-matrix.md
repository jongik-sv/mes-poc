# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: PRD → 기본설계 → 상세설계 → 테스트 4단계 양방향 추적
>
> **참조**: 이 문서는 `010-design.md`와 `026-test-specification.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-04-02 |
| Task명 | 사용자 및 역할 모델 |
| 설계 문서 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

> PRD → 기본설계 → 상세설계 → 테스트케이스 매핑

| 요구사항 ID | PRD 섹션 | 설계 문서 섹션 | 단위 테스트 | E2E 테스트 | 매뉴얼 TC | 상태 |
|-------------|----------|---------------|-------------|------------|-----------|------|
| FR-001 | 4.1.4 사용자 관리 - 로그인/로그아웃 | 010-design.md 섹션 7.3 (User 모델) | UT-001 | E2E-001 | TC-001 | 설계완료 |
| FR-002 | 4.1.4 사용자 관리 - 권한별 메뉴 접근 제어 | 010-design.md 섹션 7.3 (Role 모델) | UT-002 | E2E-002 | TC-002 | 설계완료 |
| FR-003 | TRD 2.3 - User-Role 관계 설정 | 010-design.md 섹션 7.2 (데이터 관계) | UT-003 | E2E-001 | TC-001 | 설계완료 |
| FR-004 | TRD 2.3 - 초기 역할 시드 데이터 | 010-design.md 섹션 7.5 (시드 데이터) | UT-004 | E2E-003 | TC-003 | 설계완료 |
| FR-005 | TRD 2.3 - 초기 사용자 시드 데이터 | 010-design.md 섹션 7.5 (시드 데이터) | UT-005 | E2E-003 | TC-003 | 설계완료 |

### 1.1 요구사항별 상세 매핑

#### FR-001: User 모델 정의

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.4 | 사용자 관리 - 로그인/로그아웃 |
| TRD | trd.md | 2.3 | users 테이블 (id, email, password, role) |
| 설계 | 010-design.md | 7.3 | User 모델 (id, email, password, name, roleId, isActive, createdAt, updatedAt) |
| 설계 | 010-design.md | 7.4 | Prisma 스키마 - User 모델 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-001 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001 |

#### FR-002: Role 모델 정의

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.4 | 권한별 메뉴 접근 제어 |
| TRD | trd.md | 2.3 | roles 테이블 |
| 설계 | 010-design.md | 7.3 | Role 모델 (id, code, name, createdAt) |
| 설계 | 010-design.md | 7.4 | Prisma 스키마 - Role 모델 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-002 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-002 |

#### FR-003: User-Role 관계 설정 (N:1)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| TRD | trd.md | 2.3 | MVP Prisma 스키마 - User.roleId FK |
| 설계 | 010-design.md | 7.2 | Role ||--o{ User : "has many" |
| 설계 | 010-design.md | 7.4 | role Role @relation(fields: [roleId], references: [id]) |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-003 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001 |

#### FR-004: 초기 역할 시드 데이터

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| TRD | trd.md | 2.3 | ADMIN, MANAGER, OPERATOR 역할 |
| 설계 | 010-design.md | 7.5 | 역할 데이터 (시스템 관리자, 생산 관리자, 현장 작업자) |
| 설계 | 010-design.md | 3.1 UC-03 | 초기 데이터 로드 유즈케이스 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-004 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-003 |

#### FR-005: 초기 사용자 시드 데이터

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| TRD | trd.md | 2.3 | 테스트 사용자 계정 |
| 설계 | 010-design.md | 7.5 | 테스트 사용자 데이터 (admin, manager, operator) |
| 설계 | 010-design.md | 4.1 시나리오 1 | 관리자 로그인 시나리오 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-005 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-003 |

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD 출처 | 설계 문서 섹션 | 구현 위치(개념) | 단위 테스트 | E2E 테스트 | 검증 방법 | 상태 |
|---------|----------|--------------|-----------------|-------------|------------|-----------|------|
| BR-001 | TRD 2.3 | 010-design.md 7.3 | User 모델 email 필드 | UT-006 | - | 중복 이메일 생성 시 에러 발생 확인 | 설계완료 |
| BR-002 | TRD 2.3 | 010-design.md 7.3 | Role 모델 code 필드 | UT-007 | - | 중복 코드 생성 시 에러 발생 확인 | 설계완료 |
| BR-003 | TRD 2.3 | 010-design.md 8.1 BR-01 | 시드 스크립트 | UT-008 | E2E-001 | bcrypt 해시 검증 | 설계완료 |
| BR-004 | TRD 2.3 | 010-design.md 8.1 BR-03 | User.isActive 필드 | UT-009 | E2E-004 | 비활성 사용자 로그인 거부 확인 | 설계완료 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-001: 이메일 중복 불가 (unique)

| 구분 | 내용 |
|------|------|
| **TRD 원문** | email String @unique |
| **설계 표현** | User.email 필드에 Unique 제약조건 적용 |
| **구현 위치** | Prisma 스키마 - email String @unique |
| **검증 방법** | 동일 이메일로 사용자 생성 시 P2002 에러 발생 확인 |
| **관련 테스트** | UT-006 |

#### BR-002: 역할 코드 중복 불가 (unique)

| 구분 | 내용 |
|------|------|
| **TRD 원문** | code String @unique // ADMIN, MANAGER, OPERATOR |
| **설계 표현** | Role.code 필드에 Unique 제약조건 적용 |
| **구현 위치** | Prisma 스키마 - code String @unique |
| **검증 방법** | 동일 코드로 역할 생성 시 P2002 에러 발생 확인 |
| **관련 테스트** | UT-007 |

#### BR-003: 비밀번호 bcrypt 해시 저장

| 구분 | 내용 |
|------|------|
| **TRD 원문** | password String // bcrypt 해시 |
| **설계 표현** | 비밀번호는 반드시 bcrypt 알고리즘으로 해시하여 저장 |
| **구현 위치** | prisma/seed.ts - bcrypt.hash(plainPassword, 10) |
| **검증 방법** | DB 저장된 비밀번호가 bcrypt 형식($2b$)인지 확인 |
| **관련 테스트** | UT-008, E2E-001 |

#### BR-004: 사용자 삭제 시 soft delete (isActive=false)

| 구분 | 내용 |
|------|------|
| **설계 표현** | 비활성 사용자는 로그인 불가 |
| **구현 위치** | 인증 로직에서 isActive 검사 |
| **검증 방법** | isActive=false인 사용자로 로그인 시 ACCOUNT_DISABLED 에러 |
| **관련 테스트** | UT-009, E2E-004 |

---

## 3. 테스트 역추적 매트릭스

> 테스트 결과 → 요구사항 역추적용 (build/verify 단계 결과서 생성 시 활용)

| 테스트 ID | 테스트 유형 | 테스트 명 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|----------|-------------------|----------------------|------|
| UT-001 | 단위 | User 모델 생성 테스트 | FR-001 | - | 미실행 |
| UT-002 | 단위 | Role 모델 생성 테스트 | FR-002 | - | 미실행 |
| UT-003 | 단위 | User-Role 관계 테스트 | FR-003 | - | 미실행 |
| UT-004 | 단위 | 역할 시드 데이터 테스트 | FR-004 | - | 미실행 |
| UT-005 | 단위 | 사용자 시드 데이터 테스트 | FR-005 | - | 미실행 |
| UT-006 | 단위 | 이메일 유니크 제약 테스트 | - | BR-001 | 미실행 |
| UT-007 | 단위 | 역할 코드 유니크 제약 테스트 | - | BR-002 | 미실행 |
| UT-008 | 단위 | bcrypt 해시 저장 테스트 | - | BR-003 | 미실행 |
| UT-009 | 단위 | 비활성 사용자 검증 테스트 | - | BR-004 | 미실행 |
| E2E-001 | E2E | 관리자 로그인 플로우 | FR-001, FR-003 | BR-003 | 미실행 |
| E2E-002 | E2E | 역할별 메뉴 표시 확인 | FR-002 | - | 미실행 |
| E2E-003 | E2E | 시드 데이터 검증 | FR-004, FR-005 | - | 미실행 |
| E2E-004 | E2E | 비활성 계정 로그인 거부 | - | BR-004 | 미실행 |
| TC-001 | 매뉴얼 | 관리자 계정 로그인 확인 | FR-001, FR-003 | BR-003 | 미실행 |
| TC-002 | 매뉴얼 | 역할별 메뉴 접근 확인 | FR-002 | - | 미실행 |
| TC-003 | 매뉴얼 | 시드 데이터 DB 확인 | FR-004, FR-005 | - | 미실행 |

---

## 4. 데이터 모델 추적

> 설계 엔티티 → Prisma 모델 → 필드 상세 매핑

| 설계 엔티티 | Prisma 모델 | 테이블명 | 관련 요구사항 |
|------------|-------------|----------|--------------|
| User | User | users | FR-001, FR-003, FR-005 |
| Role | Role | roles | FR-002, FR-004 |

### 4.1 User 모델 필드 추적

| 필드명 | 타입 | 제약조건 | 설계 문서 섹션 | 관련 요구사항/규칙 |
|--------|------|----------|---------------|-------------------|
| id | Int | PK, Auto Increment | 010-design.md 7.3 | FR-001 |
| email | String | Unique, Not Null | 010-design.md 7.3 | FR-001, BR-001 |
| password | String | Not Null | 010-design.md 7.3 | FR-001, BR-003 |
| name | String | Not Null | 010-design.md 7.3 | FR-001 |
| roleId | Int | FK -> Role.id | 010-design.md 7.3 | FR-001, FR-003 |
| isActive | Boolean | Default: true | 010-design.md 7.3 | FR-001, BR-004 |
| createdAt | DateTime | Default: now() | 010-design.md 7.3 | FR-001 |
| updatedAt | DateTime | Auto Update | 010-design.md 7.3 | FR-001 |

### 4.2 Role 모델 필드 추적

| 필드명 | 타입 | 제약조건 | 설계 문서 섹션 | 관련 요구사항/규칙 |
|--------|------|----------|---------------|-------------------|
| id | Int | PK, Auto Increment | 010-design.md 7.3 | FR-002 |
| code | String | Unique, Not Null | 010-design.md 7.3 | FR-002, BR-002 |
| name | String | Not Null | 010-design.md 7.3 | FR-002 |
| createdAt | DateTime | Default: now() | 010-design.md 7.3 | FR-002 |

### 4.3 시드 데이터 추적

#### 역할 시드 데이터 (FR-004)

| id | code | name | 설계 문서 섹션 |
|----|------|------|---------------|
| 1 | ADMIN | 시스템 관리자 | 010-design.md 7.5 |
| 2 | MANAGER | 생산 관리자 | 010-design.md 7.5 |
| 3 | OPERATOR | 현장 작업자 | 010-design.md 7.5 |

#### 사용자 시드 데이터 (FR-005)

| id | email | name | roleId | 설계 문서 섹션 |
|----|-------|------|--------|---------------|
| 1 | admin@example.com | 관리자 | 1 (ADMIN) | 010-design.md 7.5 |
| 2 | manager@example.com | 생산관리자 | 2 (MANAGER) | 010-design.md 7.5 |
| 3 | operator@example.com | 작업자 | 3 (OPERATOR) | 010-design.md 7.5 |

> **참고**: 비밀번호는 모두 'password123'이며, DB 저장 시 bcrypt로 해시됨

---

## 5. 인터페이스 추적

> 해당 없음 - 이 Task는 데이터 모델만 정의하며 API는 포함하지 않습니다.

| 구분 | 설명 |
|------|------|
| 범위 | 백엔드 데이터 모델 (User, Role) 정의 |
| 제외 | API 엔드포인트 (TSK-04-03 Auth.js 설정에서 구현) |

### 5.1 관련 API (타 Task에서 구현)

| API | 관련 Task | 데이터 모델 활용 |
|-----|----------|-----------------|
| POST /api/auth/signin | TSK-04-03 | User 인증, Role 조회 |
| GET /api/auth/session | TSK-04-03 | User, Role 정보 반환 |
| GET /api/menus | TSK-03-03 | Role 기반 메뉴 필터링 |

---

## 6. 화면 추적

> 해당 없음 - 이 Task는 백엔드 데이터 모델만 정의합니다.

| 구분 | 설명 |
|------|------|
| 범위 | 백엔드 데이터 모델 (User, Role) 정의 |
| 제외 | UI 화면 (TSK-04-04 로그인 페이지에서 구현) |

### 6.1 데이터 모델 활용 화면 (타 Task에서 구현)

| 화면 | 관련 Task | 데이터 모델 활용 |
|------|----------|-----------------|
| 로그인 페이지 | TSK-04-04 | User 인증 |
| 사이드바 메뉴 | TSK-01-03 | Role 기반 메뉴 필터링 |
| 헤더 사용자 프로필 | TSK-01-02 | User 정보 표시 |

---

## 7. 추적성 검증 요약

### 7.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 5 | 5 | 0 | 100% |
| 비즈니스 규칙 (BR) | 4 | 4 | 0 | 100% |
| 단위 테스트 (UT) | 9 | 9 | 0 | 100% |
| E2E 테스트 | 4 | 4 | 0 | 100% |
| 매뉴얼 테스트 (TC) | 3 | 3 | 0 | 100% |
| 데이터 모델 필드 | 12 | 12 | 0 | 100% |

### 7.2 수용 기준 매핑

| 수용 기준 | 관련 요구사항 | 검증 테스트 | 상태 |
|----------|--------------|------------|------|
| prisma migrate 성공 | FR-001, FR-002, FR-003 | UT-001, UT-002, UT-003 | 설계완료 |
| 초기 사용자/역할 데이터 생성 | FR-004, FR-005 | UT-004, UT-005, E2E-003, TC-003 | 설계완료 |
| 비밀번호 bcrypt 해시 저장 | FR-001 | UT-008, E2E-001 | 설계완료 |

### 7.3 미매핑 항목

| 구분 | ID | 설명 | 미매핑 사유 |
|------|-----|------|-----------|
| - | - | - | 모든 항목 매핑 완료 |

---

## 관련 문서

- 설계 문서: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- PRD: `.orchay/projects/mes-portal/prd.md`
- TRD: `.orchay/projects/mes-portal/trd.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |
