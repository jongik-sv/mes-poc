# 테스트 명세서 (026-test-specification.md)

**Task ID:** TSK-02-02
**Task명:** 비밀번호 정책 및 계정 잠금
**Last Updated:** 2026-01-26

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-02 |
| Task명 | 비밀번호 정책 및 계정 잠금 |
| 상세설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-26 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | zod 스키마, 비밀번호 검증 함수 | 80% 이상 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 | Vitest |
| 실행 명령어 | `pnpm test` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-02-20 | /api/auth/password-policy | 정책 조회 | 정책 객체 반환 | FR-02-06 |
| UT-02-21 | /api/auth/validate-password | 유효한 비밀번호 | valid: true | FR-02-07 |
| UT-02-22 | passwordSchema | 최소 길이 미달 | 에러 메시지 | BR-02-04 |
| UT-02-23 | passwordSchema | 대문자 미포함 | 에러 메시지 | BR-02-04 |
| UT-02-24 | passwordSchema | 소문자 미포함 | 에러 메시지 | BR-02-04 |
| UT-02-25 | passwordSchema | 숫자 미포함 | 에러 메시지 | BR-02-04 |
| UT-02-26 | passwordSchema | 특수문자 미포함 | 에러 메시지 | BR-02-04 |
| UT-02-27 | passwordSchema | 모든 규칙 충족 | 검증 통과 | BR-02-04 |
| UT-02-28 | 비밀번호 만료 | 90일 만료 체크 | 만료 여부 반환 | BR-02-05 |
| UT-02-29 | 비밀번호 이력 | 재사용 금지 | 중복 검출 | BR-02-06 |

### 2.2 테스트 케이스 상세

#### UT-02-22: 최소 길이 미달

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/password.test.ts` |
| **테스트 블록** | `describe('validatePasswordPolicy') → it('should reject password shorter than 8 chars')` |
| **입력 데이터** | `'Ab1!abc'` (7자) |
| **검증 포인트** | 에러 메시지에 '8자 이상' 포함 |
| **관련 요구사항** | BR-02-04 |

#### UT-02-27: 모든 규칙 충족

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/password.test.ts` |
| **테스트 블록** | `describe('validatePasswordPolicy') → it('should pass for valid password')` |
| **입력 데이터** | `'Password123!'` |
| **검증 포인트** | valid: true, errors: [] |
| **관련 요구사항** | BR-02-04 |

---

## 3. 테스트 데이터 (Fixture)

### 3.1 단위 테스트용 데이터

| 데이터 ID | 용도 | 값 | 예상 결과 |
|-----------|------|-----|----------|
| PW-VALID | 유효한 비밀번호 | `'Password123!'` | 통과 |
| PW-SHORT | 짧은 비밀번호 | `'Ab1!abc'` | 실패 (8자 미만) |
| PW-NO-UPPER | 대문자 없음 | `'password123!'` | 실패 |
| PW-NO-LOWER | 소문자 없음 | `'PASSWORD123!'` | 실패 |
| PW-NO-NUMBER | 숫자 없음 | `'Password!'` | 실패 |
| PW-NO-SPECIAL | 특수문자 없음 | `'Password123'` | 실패 |

---

## 4. 테스트 커버리지 목표

### 4.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |

---

## 관련 문서

- 상세설계: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/auth-system/prd.md`
