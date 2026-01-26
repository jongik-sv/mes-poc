# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

**Task ID:** TSK-01-01
**Task명:** Prisma 스키마 및 Auth.js 설정
**Last Updated:** 2026-01-26

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-01-01 |
| Task명 | Prisma 스키마 및 Auth.js 설정 |
| 상세설계 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-26 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

| 요구사항 ID | PRD 섹션 | 기본설계 섹션 | 상세설계 섹션 | 단위 테스트 | E2E 테스트 | 상태 |
|-------------|----------|--------------|--------------|-------------|------------|------|
| FR-01-01 | 4.1 | - | 6.1 | UT-01-01 | - | 완료 |
| FR-01-02 | 4.1 | - | 6.2 | UT-01-02 | - | 완료 |
| FR-01-03 | 4.1 | - | 7.1 | UT-01-03 | - | 완료 |
| FR-01-04 | 4.1 | - | 7.2 | UT-01-04, UT-01-05 | - | 완료 |
| FR-01-05 | 4.1 | - | 9 | UT-01-06 | - | 완료 |

### 1.1 요구사항별 상세 매핑

#### FR-01-01: Prisma 스키마 생성 (10개 모델)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1 | User, Role, Permission, Session 등 10개 모델 |
| 상세설계 | 020-detail-design.md | 6.1 | 엔티티 정의 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-01-01 |

#### FR-01-02: 모델 간 관계 정의

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1 | RBAC 관계 정의 |
| 상세설계 | 020-detail-design.md | 6.2 | 관계 다이어그램 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-01-02 |

#### FR-01-03: JWT 유틸리티 구현

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1 | JWT RS256 서명 |
| 상세설계 | 020-detail-design.md | 7.1 | JWT 유틸리티 API |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-01-03 |

#### FR-01-04: 비밀번호 유틸리티 구현

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1 | bcrypt 해싱 |
| 상세설계 | 020-detail-design.md | 7.2 | 비밀번호 유틸리티 API |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-01-04, UT-01-05 |

#### FR-01-05: 시드 데이터 생성

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1 | 기본 역할/권한 시드 |
| 상세설계 | 020-detail-design.md | 9 | 시드 데이터 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-01-06 |

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD 출처 | 상세설계 섹션 | 구현 위치 | 단위 테스트 | 검증 방법 | 상태 |
|---------|----------|--------------|-----------|-------------|-----------|------|
| BR-AUTH-001 | 4.1.4 | 10 | lib/auth/password.ts | UT-01-04 | bcrypt 해시 형식 확인 | 완료 |
| BR-AUTH-002 | 4.1.1 | 10 | lib/auth/jwt.ts | UT-01-03 | RS256 서명 확인 | 완료 |
| BR-AUTH-003 | 4.1.1 | 10 | lib/auth/jwt.ts | UT-01-03 | 15분 만료 확인 | 완료 |
| BR-AUTH-004 | 4.1.1 | 10 | lib/auth/jwt.ts | UT-01-03 | 7일 만료 확인 | 완료 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-AUTH-001: 비밀번호 bcrypt 해싱

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 비밀번호는 bcrypt 알고리즘으로 해싱 저장 |
| **구현 위치** | lib/auth/password.ts |
| **검증 방법** | 해시 결과가 $2b$ 로 시작하는지 확인 |
| **관련 테스트** | UT-01-04 |

#### BR-AUTH-002: JWT RS256 서명

| 구분 | 내용 |
|------|------|
| **PRD 원문** | JWT 토큰은 RS256 알고리즘으로 서명 |
| **구현 위치** | lib/auth/jwt.ts |
| **검증 방법** | jose 라이브러리로 서명 검증 |
| **관련 테스트** | UT-01-03 |

---

## 3. 테스트 역추적 매트릭스

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-01-01 | 단위 | FR-01-01 | - | PASS |
| UT-01-02 | 단위 | FR-01-02 | - | PASS |
| UT-01-03 | 단위 | FR-01-03 | BR-AUTH-002, BR-AUTH-003, BR-AUTH-004 | PASS |
| UT-01-04 | 단위 | FR-01-04 | BR-AUTH-001 | PASS |
| UT-01-05 | 단위 | FR-01-04 | BR-AUTH-001 | PASS |
| UT-01-06 | 단위 | FR-01-05 | - | PASS |

---

## 4. 데이터 모델 추적

| 상세설계 엔티티 | Prisma 모델 | 파일 |
|----------------|-------------|------|
| User | User | prisma/schema.prisma |
| Role | Role | prisma/schema.prisma |
| Permission | Permission | prisma/schema.prisma |
| Session | Session | prisma/schema.prisma |
| RefreshToken | RefreshToken | prisma/schema.prisma |
| AuditLog | AuditLog | prisma/schema.prisma |
| UserRole | UserRole | prisma/schema.prisma |
| RolePermission | RolePermission | prisma/schema.prisma |
| RoleMenu | RoleMenu | prisma/schema.prisma |
| Menu | Menu | prisma/schema.prisma |
| PasswordHistory | PasswordHistory | prisma/schema.prisma |
| SecuritySetting | SecuritySetting | prisma/schema.prisma |

---

## 5. 인터페이스 추적

| 상세설계 인터페이스 | 구현 함수 | 파일 | 요구사항 |
|--------------------|----------|------|----------|
| generateAccessToken | generateAccessToken | lib/auth/jwt.ts | FR-01-03 |
| generateRefreshToken | generateRefreshToken | lib/auth/jwt.ts | FR-01-03 |
| verifyToken | verifyToken | lib/auth/jwt.ts | FR-01-03 |
| hashPassword | hashPassword | lib/auth/password.ts | FR-01-04 |
| verifyPassword | verifyPassword | lib/auth/password.ts | FR-01-04 |

---

## 6. 추적성 검증 요약

### 6.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 5 | 5 | 0 | 100% |
| 비즈니스 규칙 (BR) | 4 | 4 | 0 | 100% |
| 단위 테스트 (UT) | 6 | 6 | 0 | 100% |

### 6.2 미매핑 항목

없음

---

## 관련 문서

- 상세설계: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- PRD: `.orchay/projects/auth-system/prd.md`
- TRD: `.orchay/projects/auth-system/trd.md`
