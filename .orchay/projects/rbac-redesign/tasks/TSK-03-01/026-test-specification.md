# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-27

> **목적**: 권한 병합 및 체크 로직의 단위 테스트, 통합 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-01 |
| Task명 | 권한 병합 및 체크 로직 구현 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-27 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | permission-merge.ts, ability.ts, usePermission.ts | 90% 이상 |
| 통합 테스트 | api-guard.ts + permission-merge.ts + ability.ts | 주요 시나리오 100% |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 | Vitest |
| React 테스트 | @testing-library/react |
| Mock | vi.mock (Vitest 내장) |
| 실행 명령 | `pnpm test:run` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | `mergePermissions` | 같은 menuId의 actions 합집합 | 합집합된 actions 배열 | FR-001, BR-001 |
| UT-002 | `mergePermissions` | 단일 Permission (병합 불필요) | 원본 그대로 반환 | FR-001 |
| UT-003 | `mergeFieldConstraints` | 같은 필드 값 합집합 | 값이 합쳐진 배열 | FR-002, BR-002 |
| UT-004 | `mergeFieldConstraints` | 한쪽 필드 없음 = 제약 해제 | 해당 필드 제거 | FR-002, BR-003 |
| UT-005 | `mergeFieldConstraints` | 다른 필드 각각 유지 | 양쪽 필드 모두 존재 | FR-002 |
| UT-006 | `collectRoleHierarchyPermissions` | 2단계 계층 탐색 | 부모+자식 Permission 모두 수집 | FR-003, BR-004 |
| UT-007 | `collectRoleHierarchyPermissions` | 순환 참조 방지 | 무한루프 없이 완료 | FR-003, BR-004 |
| UT-008 | `defineAbilityFromConfig` | 병합된 config로 Ability 생성 | can/cannot 정상 동작 | FR-004 |
| UT-009 | `defineAbilityFromConfig` | SYSTEM_ADMIN 와일드카드 | 모든 action/subject 허용 | FR-004 |
| UT-010 | `requirePermission` (수정) | 병합된 권한으로 허용 | ok: true | FR-005 |
| UT-011 | `requirePermission` (수정) | 병합 후에도 권한 없음 | ok: false, 403 | FR-005 |
| UT-012 | `usePermission` | menuId로 권한 정보 반환 | actions, fieldConstraints, can() | FR-006 |
| UT-013 | `usePermission` | 권한 없는 menuId | 빈 actions, can() 항상 false | FR-006 |

### 2.2 테스트 케이스 상세

#### UT-001: actions 합집합 병합

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/permission-merge.spec.ts` |
| **테스트 블록** | `describe('mergePermissions') -> it('같은 menuId의 actions를 합집합으로 병합한다')` |
| **Mock 의존성** | 없음 (순수 함수) |
| **입력 데이터** | 아래 참조 |
| **검증 포인트** | 병합된 actions가 ["CREATE", "READ", "UPDATE", "DELETE"] |
| **커버리지 대상** | `mergePermissions()` actions 병합 분기 |
| **관련 요구사항** | FR-001, BR-001 |

```typescript
// 입력
const permissions = [
  { menuId: 20, config: { actions: ["READ"] } },
  { menuId: 20, config: { actions: ["CREATE", "READ", "UPDATE", "DELETE"] } },
]
// 예상 출력: menuId=20 -> actions: ["CREATE", "READ", "UPDATE", "DELETE"]
```

#### UT-002: 단일 Permission (병합 불필요)

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/permission-merge.spec.ts` |
| **테스트 블록** | `describe('mergePermissions') -> it('단일 Permission은 그대로 반환한다')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | `[{ menuId: 10, config: { actions: ["READ"], fieldConstraints: { PROC_CD: "2CGL" } } }]` |
| **검증 포인트** | 입력과 동일한 결과 |
| **관련 요구사항** | FR-001 |

#### UT-003: fieldConstraints 같은 필드 값 합집합

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/permission-merge.spec.ts` |
| **테스트 블록** | `describe('mergeFieldConstraints') -> it('같은 필드의 값을 합집합으로 병합한다')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | 아래 참조 |
| **검증 포인트** | PROC_CD: ["2CGL", "3CGL", "4CGL"] (중복 제거) |
| **관련 요구사항** | FR-002, BR-002 |

```typescript
// 입력
const configs = [
  { actions: ["READ"], fieldConstraints: { PROC_CD: "2CGL" } },
  { actions: ["READ"], fieldConstraints: { PROC_CD: ["3CGL", "4CGL"] } },
]
// 예상: fieldConstraints.PROC_CD = ["2CGL", "3CGL", "4CGL"]
```

#### UT-004: fieldConstraints 한쪽 없음 = 제약 해제

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/permission-merge.spec.ts` |
| **테스트 블록** | `describe('mergeFieldConstraints') -> it('한쪽에 필드가 없으면 해당 필드 제약을 해제한다')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | 아래 참조 |
| **검증 포인트** | fieldConstraints에 PROC_CD 키 없음 (제약 해제) |
| **관련 요구사항** | FR-002, BR-003 |

```typescript
// 입력
const configs = [
  { actions: ["READ"], fieldConstraints: { PROC_CD: "2CGL" } },
  { actions: ["READ", "UPDATE"] }, // fieldConstraints 자체 없음
]
// 예상: fieldConstraints = {} 또는 undefined (PROC_CD 제약 해제)
```

#### UT-005: fieldConstraints 다른 필드 각각 유지

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/permission-merge.spec.ts` |
| **테스트 블록** | `describe('mergeFieldConstraints') -> it('다른 필드는 각각 유지한다')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | 아래 참조 |
| **검증 포인트** | 두 필드 모두 존재하되, 한쪽만 가진 필드는 BR-003 적용 |
| **관련 요구사항** | FR-002 |

```typescript
// 입력: 양쪽 모두 fieldConstraints 있으나 다른 필드
const configs = [
  { actions: ["READ"], fieldConstraints: { PROC_CD: "2CGL", LINE_CD: "L1" } },
  { actions: ["READ"], fieldConstraints: { PROC_CD: ["3CGL"], EQUIP_CD: "E1" } },
]
// 예상:
// PROC_CD: ["2CGL", "3CGL"] (BR-002: 같은 필드 합집합)
// LINE_CD: 제약 해제 (BR-003: B에 LINE_CD 없음)
// EQUIP_CD: 제약 해제 (BR-003: A에 EQUIP_CD 없음)
```

#### UT-006: Role 계층 2단계 탐색

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/permission-merge.spec.ts` |
| **테스트 블록** | `describe('collectRoleHierarchyPermissions') -> it('상위 Role이 하위 Role의 Permission을 포함한다')` |
| **Mock 의존성** | Role 계층 데이터 (인메모리) |
| **입력 데이터** | 아래 참조 |
| **검증 포인트** | 부모 Role에 할당된 Permission + 자식 Role의 Permission 모두 반환 |
| **관련 요구사항** | FR-003, BR-004 |

```typescript
// Role 구조:
// 공장장 (roleId=1, children: [과장(roleId=2)])
// 과장 (roleId=2, children: [반장(roleId=3)])
//
// RolePermission:
// roleId=1 -> permissionId=10
// roleId=2 -> permissionId=20
// roleId=3 -> permissionId=30
//
// 공장장 Role 입력 시 -> permissionId: [10, 20, 30] 모두 수집
```

#### UT-007: Role 순환 참조 방지

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/permission-merge.spec.ts` |
| **테스트 블록** | `describe('collectRoleHierarchyPermissions') -> it('순환 참조가 있어도 무한루프 없이 완료한다')` |
| **Mock 의존성** | 순환 참조 Role 데이터 |
| **입력 데이터** | roleId=1의 child가 roleId=2이고, roleId=2의 child에 roleId=1 포함 |
| **검증 포인트** | 함수가 정상 종료되고 중복 없는 Permission 반환 |
| **관련 요구사항** | FR-003, BR-004 |

#### UT-008: config 기반 CASL Ability 생성

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/ability.spec.ts` |
| **테스트 블록** | `describe('defineAbilityFromConfig') -> it('병합된 config로 Ability를 생성한다')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | `MergedPermissionMap: { 20: { actions: ["READ", "UPDATE"], fieldConstraints: { PROC_CD: ["2CGL"] } } }` |
| **검증 포인트** | `ability.can('read', '20') === true`, `ability.can('delete', '20') === false` |
| **관련 요구사항** | FR-004 |

#### UT-009: SYSTEM_ADMIN 와일드카드

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/ability.spec.ts` |
| **테스트 블록** | `describe('defineAbilityFromConfig') -> it('SYSTEM_ADMIN은 모든 권한을 가진다')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | isSystemAdmin: true |
| **검증 포인트** | `ability.can('manage', 'all') === true` |
| **관련 요구사항** | FR-004 |

#### UT-010: api-guard 병합 권한 허용

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/api-guard.spec.ts` |
| **테스트 블록** | `describe('requirePermission') -> it('병합된 권한으로 요청을 허용한다')` |
| **Mock 의존성** | prisma.user.findUnique (Permission 2개 반환), auth() (세션 반환) |
| **입력 데이터** | userId="41000132", action="update", subject="20" |
| **검증 포인트** | `result.ok === true` (Permission A: READ, Permission B: READ+UPDATE 병합) |
| **관련 요구사항** | FR-005 |

#### UT-011: api-guard 병합 후 권한 없음

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/api-guard.spec.ts` |
| **테스트 블록** | `describe('requirePermission') -> it('병합 후에도 권한이 없으면 403을 반환한다')` |
| **Mock 의존성** | prisma.user.findUnique (READ만 포함), auth() |
| **입력 데이터** | userId="41000132", action="delete", subject="20" |
| **검증 포인트** | `result.ok === false`, response.status === 403 |
| **관련 요구사항** | FR-005 |

#### UT-012: usePermission Hook 정상 반환

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/usePermission.spec.ts` |
| **테스트 블록** | `describe('usePermission') -> it('menuId에 대한 권한 정보를 반환한다')` |
| **Mock 의존성** | 세션 데이터 Mock (권한 정보 포함) |
| **입력 데이터** | menuId=20 |
| **검증 포인트** | `actions`에 "READ" 포함, `can('read')` === true, `fieldConstraints` 존재 |
| **관련 요구사항** | FR-006 |

#### UT-013: usePermission Hook 권한 없음

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/usePermission.spec.ts` |
| **테스트 블록** | `describe('usePermission') -> it('권한 없는 menuId에 대해 빈 결과를 반환한다')` |
| **Mock 의존성** | 세션 데이터 Mock (해당 menuId 권한 없음) |
| **입력 데이터** | menuId=999 |
| **검증 포인트** | `actions` 빈 배열, `can('read')` === false |
| **관련 요구사항** | FR-006 |

---

## 3. 통합 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| IT-001 | 복수 Permission 병합 후 Ability 체크 | Mock DB 데이터 | 1. Permission 수집 2. 병합 3. Ability 생성 4. can() 확인 | 병합된 actions로 can/cannot 정확 | FR-001, FR-002, FR-004 |
| IT-002 | Role 계층 + Permission 병합 | Mock 계층 Role 데이터 | 1. 계층 탐색 2. 전체 Permission 수집 3. 병합 | 하위 Role Permission 포함된 병합 결과 | FR-003 |
| IT-003 | api-guard 전체 흐름 | Mock 세션 + DB | 1. requirePermission 호출 2. 내부 병합 로직 실행 | ok: true/false 정확 | FR-005 |

### 3.2 테스트 케이스 상세

#### IT-001: 복수 Permission 병합 후 Ability 체크

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/permission-merge.integration.spec.ts` |
| **테스트명** | `test('복수 Permission이 병합되어 CASL Ability가 올바르게 생성된다')` |
| **사전조건** | menuId=20에 대한 Permission 2개 (다른 actions, 다른 fieldConstraints) |
| **검증 포인트** | |
| - actions 합집합 | `ability.can('read', '20')` === true, `ability.can('update', '20')` === true |
| - fieldConstraints 병합 | 병합된 PROC_CD가 ["2CGL", "3CGL"] |
| - 3가지 BR 규칙 모두 | BR-001 (actions), BR-002 (같은 필드 합집합), BR-003 (한쪽 없음 해제) |
| **관련 요구사항** | FR-001, FR-002, FR-004, BR-001, BR-002, BR-003 |

#### IT-002: Role 계층 탐색 후 Permission 병합

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/permission-merge.integration.spec.ts` |
| **테스트명** | `test('Role 계층 탐색 후 하위 Permission이 병합된다')` |
| **사전조건** | 3단계 Role 계층 (공장장→과장→반장), 각 Role에 다른 Permission |
| **검증 포인트** | 공장장 Role로 수집 시 3개 Role의 Permission이 모두 포함되어 병합됨 |
| **관련 요구사항** | FR-003, BR-004 |

#### IT-003: api-guard 전체 흐름 통합

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/api-guard.integration.spec.ts` |
| **테스트명** | `test('api-guard가 병합된 권한으로 올바르게 허용/거부한다')` |
| **사전조건** | Mock prisma (사용자 + 복수 역할/권한), Mock auth (세션) |
| **검증 포인트** | |
| - 허용 케이스 | 병합 결과에 포함된 action → ok: true |
| - 거부 케이스 | 병합 결과에 미포함 action → ok: false, 403 |
| **관련 요구사항** | FR-005 |

---

## 4. 성능 테스트

### 4.1 병합 성능 테스트

| 테스트 ID | 시나리오 | 목표 | 측정 방법 |
|-----------|----------|------|----------|
| PERF-001 | 100개 Permission 병합 | 200ms 이내 | `performance.now()` 전후 측정 |

```typescript
// PERF-001 구현 가이드
it('100개 Permission 병합이 200ms 이내에 완료된다', () => {
  const permissions = generatePermissions(100) // 100개 Permission 생성
  const start = performance.now()
  mergePermissions(permissions)
  const elapsed = performance.now() - start
  expect(elapsed).toBeLessThan(200)
})
```

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-PERM-READ-2CGL | 2CGL READ 권한 | `{ menuId: 20, config: { actions: ["READ"], fieldConstraints: { PROC_CD: "2CGL" } } }` |
| MOCK-PERM-RU-3CGL | 3CGL READ+UPDATE 권한 | `{ menuId: 20, config: { actions: ["READ", "UPDATE"], fieldConstraints: { PROC_CD: ["3CGL"] } } }` |
| MOCK-PERM-ADMIN | 관리자 권한 (제약 없음) | `{ menuId: 20, config: { actions: ["CREATE", "READ", "UPDATE", "DELETE", "EXPORT"] } }` |
| MOCK-PERM-DIFF-MENU | 다른 menuId 권한 | `{ menuId: 30, config: { actions: ["READ"] } }` |
| MOCK-ROLE-PARENT | 상위 Role | `{ roleId: 1, parentRoleId: null, children: [MOCK-ROLE-CHILD], rolePermissions: [...] }` |
| MOCK-ROLE-CHILD | 하위 Role | `{ roleId: 2, parentRoleId: 1, children: [], rolePermissions: [...] }` |

### 5.2 통합 테스트용 Mock 사용자

| 데이터 ID | 용도 | 구성 |
|-----------|------|------|
| MOCK-USER-MULTI-ROLE | 복수 역할 사용자 | RoleGroup 2개, 각각 다른 Role, 같은 menuId에 다른 Permission |
| MOCK-USER-HIERARCHY | 상위 역할 사용자 | 공장장 Role 보유 (하위 과장, 반장 Permission 자동 포함) |
| MOCK-USER-NO-PERM | 권한 없는 사용자 | RoleGroup 없음 |
| MOCK-USER-ADMIN | 시스템 관리자 | SYSTEM_ADMIN Role 보유 |

---

## 6. 테스트 커버리지 목표

### 6.1 단위 테스트 커버리지

| 대상 파일 | Lines 목표 | Branches 목표 | Functions 목표 |
|----------|-----------|--------------|---------------|
| `permission-merge.ts` | 95% | 90% | 100% |
| `ability.ts` | 90% | 85% | 100% |
| `api-guard.ts` | 85% | 80% | 90% |
| `hooks/usePermission.ts` | 90% | 85% | 100% |

### 6.2 통합 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 병합 시나리오 | 100% |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |
| 성능 요구사항 | 200ms 이내 검증 |

---

## 관련 문서

- 설계 문서: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/rbac-redesign/prd.md`
- TRD: `.orchay/projects/rbac-redesign/trd.md`
