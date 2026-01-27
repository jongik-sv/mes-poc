# 단위 테스트 결과서

**Template Version:** 1.0.0 -- **Last Updated:** 2026-01-27

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-01 |
| Task명 | 권한 병합 및 체크 로직 구현 |
| 테스트 일시 | 2026-01-27 |
| 테스트 환경 | Node.js 24.x, Vitest 4.0.17 |
| 상세설계 문서 | `020-detail-design.md` |

---

## 1. 테스트 요약

### 1.1 전체 결과

| 항목 | 수치 | 상태 |
|------|------|------|
| 총 테스트 수 | 31 | - |
| 통과 | 31 | PASS |
| 실패 | 0 | - |
| 스킵 | 0 | - |
| **통과율** | 100% | PASS |

### 1.2 테스트 파일별 요약

| 테스트 파일 | 테스트 수 | 통과 | 실패 | 실행 시간 |
|------------|----------|------|------|----------|
| `permission-merge.test.ts` | 19 | 19 | 0 | ~800ms |
| `ability-merged.test.ts` | 6 | 6 | 0 | ~200ms |
| `usePermission.test.ts` | 6 | 6 | 0 | ~200ms |

### 1.3 테스트 판정

- [x] **PASS**: 모든 테스트 통과

---

## 2. 요구사항별 테스트 결과

### 2.1 비즈니스 규칙 검증 결과

| 규칙 ID | 규칙 설명 | 테스트 ID | 결과 | 검증 방법 |
|---------|----------|-----------|------|----------|
| BR-001 | actions 합집합 | UT-009~015 | PASS | 두 역할의 actions 병합 후 합집합 확인 |
| BR-002 | fieldConstraints 같은 필드 값 합집합 | UT-001~008 | PASS | 동일 필드의 값 배열 합집합 확인 |
| BR-003 | fieldConstraints 한쪽 없음 = 제약 해제 | UT-001~008 | PASS | null 반환 확인 |
| BR-004 | Role 계층 자동 상속 (재귀 탐색) | UT-016~019 | PASS | parentRoleId 체이닝 결과 확인 |

**검증 현황**: 4/4 비즈니스 규칙 검증 완료 (100%)

---

## 3. 테스트 케이스별 상세 결과

### 3.1 permission-merge.test.ts (19 tests)

#### mergeFieldConstraints (8 tests)

| 테스트 ID | 테스트명 | 결과 | 요구사항 |
|-----------|----------|------|----------|
| UT-001 | 양쪽 모두 같은 필드 존재 시 값 합집합 | PASS | BR-002 |
| UT-002 | 한쪽만 필드 존재 시 null 반환 (제약 해제) | PASS | BR-003 |
| UT-003 | 양쪽 모두 null이면 null 반환 | PASS | BR-003 |
| UT-004 | 한쪽 null이면 null 반환 | PASS | BR-003 |
| UT-005 | 빈 객체 병합 | PASS | BR-002 |
| UT-006 | 다중 필드 병합 | PASS | BR-002 |
| UT-007 | 중복 값 제거 | PASS | BR-002 |
| UT-008 | undefined 입력 처리 | PASS | BR-003 |

#### mergePermissions (7 tests)

| 테스트 ID | 테스트명 | 결과 | 요구사항 |
|-----------|----------|------|----------|
| UT-009 | 같은 menuId 권한 actions 합집합 | PASS | BR-001 |
| UT-010 | 다른 menuId는 별도 유지 | PASS | BR-001 |
| UT-011 | fieldConstraints 함께 병합 | PASS | BR-001, BR-002 |
| UT-012 | 빈 배열 입력 시 빈 배열 반환 | PASS | - |
| UT-013 | 단일 권한은 그대로 반환 | PASS | - |
| UT-014 | 3개 이상 역할 병합 | PASS | BR-001 |
| UT-015 | 중복 action 제거 | PASS | BR-001 |

#### collectRolePermissions (4 tests)

| 테스트 ID | 테스트명 | 결과 | 요구사항 |
|-----------|----------|------|----------|
| UT-016 | 단일 역할 권한 수집 | PASS | BR-004 |
| UT-017 | 부모-자식 2단계 계층 수집 | PASS | BR-004 |
| UT-018 | 3단계 이상 계층 수집 | PASS | BR-004 |
| UT-019 | 부모 역할 없는 경우 자기 권한만 반환 | PASS | BR-004 |

### 3.2 ability-merged.test.ts (6 tests)

| 테스트 ID | 테스트명 | 결과 | 요구사항 |
|-----------|----------|------|----------|
| UT-020 | 병합된 권한으로 Ability 생성 | PASS | - |
| UT-021 | 허용된 action can() 확인 | PASS | - |
| UT-022 | 미허용 action cannot() 확인 | PASS | - |
| UT-023 | fieldConstraints 조건 반영 | PASS | BR-002 |
| UT-024 | 빈 권한 시 모든 action 거부 | PASS | - |
| UT-025 | 다중 메뉴 권한 정상 동작 | PASS | - |

### 3.3 usePermission.test.ts (6 tests)

| 테스트 ID | 테스트명 | 결과 | 요구사항 |
|-----------|----------|------|----------|
| UT-026 | can() 허용된 권한 true 반환 | PASS | - |
| UT-027 | can() 미허용 권한 false 반환 | PASS | - |
| UT-028 | getFieldConstraints() 제약 조건 반환 | PASS | BR-002 |
| UT-029 | getFieldConstraints() 제약 없으면 null 반환 | PASS | BR-003 |
| UT-030 | permissions 목록 정상 반환 | PASS | - |
| UT-031 | 권한 미로드 시 기본값 동작 | PASS | - |

### 3.4 실패한 테스트

없음

---

## 4. 테스트 실행 로그

### 4.1 실행 명령어

```bash
pnpm test:run
```

### 4.2 실행 결과 요약

```
 permission-merge.test.ts (19 tests) ~800ms
   mergeFieldConstraints
     should merge same field values as union
     should return null when one side missing field (constraint release)
     should return null when both null
     should return null when one side null
     should merge empty objects
     should merge multiple fields
     should deduplicate values
     should handle undefined input
   mergePermissions
     should union actions for same menuId
     should keep different menuId separate
     should merge fieldConstraints together
     should return empty array for empty input
     should return single permission as-is
     should merge 3+ roles
     should deduplicate actions
   collectRolePermissions
     should collect single role permissions
     should collect 2-level parent-child hierarchy
     should collect 3+ level hierarchy
     should return own permissions when no parent

 ability-merged.test.ts (6 tests) ~200ms
   defineAbilityFromMergedPermissions
     should create Ability from merged permissions
     should allow permitted actions
     should deny unpermitted actions
     should reflect fieldConstraints conditions
     should deny all when empty permissions
     should handle multiple menu permissions

 usePermission.test.ts (6 tests) ~200ms
   usePermission
     should return true for permitted action
     should return false for unpermitted action
     should return field constraints
     should return null for no constraints
     should return permissions list
     should handle default state before load

Test Files  3 passed (3)
Tests       31 passed (31)
Duration    ~1.2s
```

---

## 5. 품질 게이트 결과

| 게이트 | 기준 | 실제 | 결과 |
|--------|------|------|------|
| 테스트 통과율 | 100% | 100% | PASS |
| 실패 테스트 | 0개 | 0개 | PASS |
| BR 검증 커버리지 | 100% | 100% (4/4) | PASS |

**최종 판정**: PASS

---

## 6. 다음 단계

### 테스트 통과 완료
- 통합테스트 진행 (E2E 권한 체크 흐름 검증)
- 코드 리뷰 진행

---

## 관련 문서

- 상세설계: `020-detail-design.md`
- 구현 문서: `030-implementation.md`
- 사용자 매뉴얼: `080-user-manual.md`
