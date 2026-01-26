# 테스트 명세서 (026-test-specification.md)

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
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-26 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | JWT 유틸리티, 비밀번호 유틸리티 | 80% 이상 |
| 통합 테스트 | Prisma 스키마, 시드 데이터 | 100% 검증 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 | Vitest |
| 데이터베이스 | SQLite (테스트용) |
| 실행 명령어 | `pnpm test` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-01-01 | Prisma Schema | 스키마 유효성 | prisma db push 성공 | FR-01-01 |
| UT-01-02 | Prisma Relations | 관계 무결성 | 관계 조회 성공 | FR-01-02 |
| UT-01-03 | JWT generateAccessToken | Access Token 생성 | 유효한 JWT 반환 | FR-01-03 |
| UT-01-04 | hashPassword | 비밀번호 해싱 | bcrypt 해시 반환 | FR-01-04 |
| UT-01-05 | verifyPassword | 비밀번호 검증 | true/false 반환 | FR-01-04 |
| UT-01-06 | Seed Script | 시드 데이터 | 기본 역할/권한 생성 | FR-01-05 |

### 2.2 테스트 케이스 상세

#### UT-01-03: JWT generateAccessToken

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/jwt.test.ts` |
| **테스트 블록** | `describe('JWT Utils') → it('should generate valid access token')` |
| **입력 데이터** | `{ sub: '1', email: 'test@test.com', roles: ['USER'] }` |
| **검증 포인트** | 토큰이 3파트 구조, 디코딩 시 payload 포함 |
| **관련 요구사항** | FR-01-03, BR-AUTH-002, BR-AUTH-003 |

#### UT-01-04: hashPassword

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/password.test.ts` |
| **테스트 블록** | `describe('Password Utils') → it('should hash password with bcrypt')` |
| **입력 데이터** | `'Password123!'` |
| **검증 포인트** | 결과가 `$2`로 시작, 원본과 다름 |
| **관련 요구사항** | FR-01-04, BR-AUTH-001 |

#### UT-01-05: verifyPassword

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/password.test.ts` |
| **테스트 블록** | `describe('Password Utils') → it('should verify correct password')` |
| **입력 데이터** | 비밀번호 + 해시 |
| **검증 포인트** | 올바른 비밀번호 시 true, 틀린 비밀번호 시 false |
| **관련 요구사항** | FR-01-04 |

---

## 3. 통합 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|
| IT-01-01 | 역할 시드 데이터 검증 | DB 초기화 | 기본 역할 존재 | FR-01-05 |
| IT-01-02 | 사용자 시드 데이터 검증 | 시드 실행 | 테스트 사용자 존재 | FR-01-05 |
| IT-01-03 | 비밀번호 해시 검증 | 시드 실행 | bcrypt 해시 저장 | BR-AUTH-001 |
| IT-01-04 | User-Role 관계 조회 | 시드 실행 | 관계 조회 성공 | FR-01-02 |
| IT-01-05 | 역할별 사용자 조회 | 시드 실행 | 역할별 사용자 목록 | FR-01-02 |

### 3.2 통합 테스트 실행 스크립트

```bash
pnpm tsx scripts/verify-seed.ts
```

---

## 4. 테스트 데이터 (Fixture)

### 4.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-USER-01 | JWT 페이로드 | `{ sub: '1', email: 'test@test.com', name: 'Test', roles: ['USER'] }` |
| MOCK-PASSWORD | 비밀번호 테스트 | `'Password123!'` |

### 4.2 시드 테스트 데이터

| 시드 ID | 용도 | 포함 데이터 |
|---------|------|------------|
| SEED-ROLES | 기본 역할 | SYSTEM_ADMIN, PRODUCTION_MANAGER, OPERATOR |
| SEED-USERS | 테스트 사용자 | admin@example.com, manager@example.com, operator@example.com |

---

## 5. 테스트 커버리지 목표

### 5.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |

### 5.2 테스트 파일 목록

| 파일 | 테스트 대상 |
|------|------------|
| `lib/auth/__tests__/password.test.ts` | 비밀번호 유틸리티 |
| `scripts/verify-seed.ts` | 시드 데이터 검증 |

---

## 관련 문서

- 상세설계: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/auth-system/prd.md`
