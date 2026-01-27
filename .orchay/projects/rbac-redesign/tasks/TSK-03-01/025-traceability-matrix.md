# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-27

> **목적**: PRD → 기본설계 → 상세설계 → 테스트 4단계 양방향 추적
>
> **참조**: 이 문서는 `010-design.md`와 `026-test-specification.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-01 |
| Task명 | 권한 병합 및 체크 로직 구현 |
| 설계 문서 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-27 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

| 요구사항 ID | PRD 섹션 | 설계 섹션 | 구현 파일 | 단위 테스트 | 통합 테스트 | 상태 |
|-------------|----------|----------|----------|-------------|------------|------|
| FR-001 | 4.5 | 8.1 BR-01 | `permission-merge.ts` | UT-001, UT-002 | IT-001 | 설계완료 |
| FR-002 | 4.5 | 8.1 BR-02,03 | `permission-merge.ts` | UT-003, UT-004, UT-005 | IT-001 | 설계완료 |
| FR-003 | 4.3 | 8.1 BR-04 | `permission-merge.ts` | UT-006, UT-007 | IT-002 | 설계완료 |
| FR-004 | 4.6 | 3.2 UC-01 | `ability.ts` | UT-008, UT-009 | IT-001 | 설계완료 |
| FR-005 | 4.6 | 3.2 UC-03 | `api-guard.ts` | UT-010, UT-011 | IT-003 | 설계완료 |
| FR-006 | 4.6 | 3.2 UC-04 | `hooks/usePermission.ts` | UT-012, UT-013 | - | 설계완료 |

### 1.1 요구사항별 상세 매핑

#### FR-001: Permission actions 합집합 병합

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.5 | 같은 menuId에 대한 복수 Permission 보유 시 actions 합집합 |
| 설계 | 010-design.md | 8.1 BR-01 | actions 합집합 병합 규칙 |
| 구현 | `lib/auth/permission-merge.ts` | `mergePermissions()` | actions Set 합집합 |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-001, UT-002 |

#### FR-002: fieldConstraints 병합 (3가지 규칙)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.5 | fieldConstraints 같은 필드 값 합집합, 한쪽 없음 = 제약 해제, 다른 필드 각각 유지 |
| 설계 | 010-design.md | 8.1 BR-02, BR-03 | 3가지 fieldConstraints 병합 규칙 |
| 구현 | `lib/auth/permission-merge.ts` | `mergeFieldConstraints()` | 필드별 병합 로직 |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-003, UT-004, UT-005 |

#### FR-003: Role 계층 탐색

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.3 | 상위 역할의 하위 권한 자동 포함 |
| 설계 | 010-design.md | 8.1 BR-04 | parentRoleId 기반 재귀 탐색 |
| 구현 | `lib/auth/permission-merge.ts` | `collectRoleHierarchyPermissions()` | 재귀 순회 + 방문 Set |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-006, UT-007 |

#### FR-004: CASL Ability 생성 (config 기반)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.6 | config.actions → CASL Ability |
| TRD | trd.md | 6 | CASL Ability 생성 (권한 체크 흐름 10단계) |
| 구현 | `lib/auth/ability.ts` | `defineAbilityFromConfig()` | MergedPermissionMap → CASL Ability |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-008, UT-009 |

#### FR-005: 서버 미들웨어 권한 체크

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.6 | 서버 측 동일 제약 적용 (보안) |
| 설계 | 010-design.md | 3.2 UC-03 | API 요청에 대한 권한 검증 |
| 구현 | `lib/auth/api-guard.ts` | `requirePermission()` 수정 | 병합된 권한 기반 체크 |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-010, UT-011 |

#### FR-006: 클라이언트 usePermission Hook

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.6 | config.actions → 버튼 표시/숨김, fieldConstraints → 콤보박스 필터링 |
| 설계 | 010-design.md | 3.2 UC-04 | 클라이언트 권한 조회 Hook |
| 구현 | `lib/auth/hooks/usePermission.ts` | `usePermission(menuId)` | actions, fieldConstraints, can() 반환 |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-012, UT-013 |

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD 출처 | 설계 섹션 | 구현 위치 | 단위 테스트 | 통합 테스트 | 검증 방법 | 상태 |
|---------|----------|----------|----------|-------------|------------|-----------|------|
| BR-001 | 4.5 | 8.1 | `mergePermissions()` | UT-001, UT-002 | IT-001 | actions 합집합 확인 | 설계완료 |
| BR-002 | 4.5 | 8.1 | `mergeFieldConstraints()` | UT-003 | IT-001 | 같은 필드 값 합집합 확인 | 설계완료 |
| BR-003 | 4.5 | 8.1 | `mergeFieldConstraints()` | UT-004 | IT-001 | 한쪽 없음 시 제약 해제 확인 | 설계완료 |
| BR-004 | 4.3 | 8.1 | `collectRoleHierarchyPermissions()` | UT-006, UT-007 | IT-002 | 하위 Role Permission 자동 포함 확인 | 설계완료 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-001: actions 합집합 규칙

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 같은 menuId에 대한 복수 Permission 보유 시 actions 합집합 |
| **설계 표현** | 010-design.md BR-01: actions Set 합집합 |
| **구현 위치** | `lib/auth/permission-merge.ts` - `mergePermissions()` |
| **검증 방법** | A: ["READ"], B: ["READ", "UPDATE"] → 결과: ["READ", "UPDATE"] |
| **관련 테스트** | UT-001, UT-002, IT-001 |

#### BR-002: fieldConstraints 같은 필드 값 합집합

| 구분 | 내용 |
|------|------|
| **PRD 원문** | fieldConstraints 같은 필드: 값 합집합 |
| **설계 표현** | 010-design.md BR-02 |
| **구현 위치** | `lib/auth/permission-merge.ts` - `mergeFieldConstraints()` |
| **검증 방법** | A: PROC_CD=["2CGL"], B: PROC_CD=["3CGL"] → 결과: PROC_CD=["2CGL","3CGL"] |
| **관련 테스트** | UT-003, IT-001 |

#### BR-003: fieldConstraints 한쪽 없음 = 제약 해제

| 구분 | 내용 |
|------|------|
| **PRD 원문** | fieldConstraints 한쪽 없음: 제약 해제 (전체) |
| **설계 표현** | 010-design.md BR-03 |
| **구현 위치** | `lib/auth/permission-merge.ts` - `mergeFieldConstraints()` |
| **검증 방법** | A: PROC_CD=["2CGL"], B: (PROC_CD 미지정) → 결과: PROC_CD 제약 없음 |
| **관련 테스트** | UT-004, IT-001 |

#### BR-004: Role 계층 자동 상속

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 상위 역할의 하위 권한 자동 포함 |
| **설계 표현** | 010-design.md BR-04: parentRoleId 기반 재귀 탐색 |
| **구현 위치** | `lib/auth/permission-merge.ts` - `collectRoleHierarchyPermissions()` |
| **검증 방법** | 상위 Role 할당 시 하위 Role의 Permission도 수집됨 |
| **관련 테스트** | UT-006, UT-007, IT-002 |

---

## 3. 테스트 역추적 매트릭스

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-001 | 단위 | FR-001 | BR-001 | 미실행 |
| UT-002 | 단위 | FR-001 | BR-001 | 미실행 |
| UT-003 | 단위 | FR-002 | BR-002 | 미실행 |
| UT-004 | 단위 | FR-002 | BR-003 | 미실행 |
| UT-005 | 단위 | FR-002 | - | 미실행 |
| UT-006 | 단위 | FR-003 | BR-004 | 미실행 |
| UT-007 | 단위 | FR-003 | BR-004 | 미실행 |
| UT-008 | 단위 | FR-004 | - | 미실행 |
| UT-009 | 단위 | FR-004 | - | 미실행 |
| UT-010 | 단위 | FR-005 | - | 미실행 |
| UT-011 | 단위 | FR-005 | - | 미실행 |
| UT-012 | 단위 | FR-006 | - | 미실행 |
| UT-013 | 단위 | FR-006 | - | 미실행 |
| IT-001 | 통합 | FR-001, FR-002, FR-004 | BR-001, BR-002, BR-003 | 미실행 |
| IT-002 | 통합 | FR-003 | BR-004 | 미실행 |
| IT-003 | 통합 | FR-005 | - | 미실행 |

---

## 4. 데이터 모델 추적

| 설계 엔티티 | Prisma 모델 | 관련 필드 | 용도 |
|-------------|------------|----------|------|
| Permission | Permission | config (JSON), menuId | 병합 대상 데이터 |
| Role | Role | parentRoleId, children | 계층 탐색 |
| RolePermission | RolePermission | roleId, permissionId | 권한 수집 |
| UserRoleGroup | UserRoleGroup | userId, roleGroupId | 사용자 권한 시작점 |
| RoleGroupRole | RoleGroupRole | roleGroupId, roleId | Role 수집 |

---

## 5. 인터페이스 추적

| 설계 인터페이스 | 구현 함수/Hook | 파일 | 요구사항 |
|----------------|---------------|------|----------|
| Permission 병합 | `mergePermissions()` | `lib/auth/permission-merge.ts` | FR-001, FR-002 |
| Role 계층 수집 | `collectRoleHierarchyPermissions()` | `lib/auth/permission-merge.ts` | FR-003 |
| fieldConstraints 병합 | `mergeFieldConstraints()` | `lib/auth/permission-merge.ts` | FR-002 |
| config 기반 Ability | `defineAbilityFromConfig()` | `lib/auth/ability.ts` | FR-004 |
| 서버 권한 체크 | `requirePermission()` (수정) | `lib/auth/api-guard.ts` | FR-005 |
| 클라이언트 Hook | `usePermission()` | `lib/auth/hooks/usePermission.ts` | FR-006 |

---

## 6. 화면 추적

> 해당 없음 (백엔드 로직 + Hook 구현 Task)

---

## 7. 추적성 검증 요약

### 7.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 6 | 6 | 0 | 100% |
| 비즈니스 규칙 (BR) | 4 | 4 | 0 | 100% |
| 단위 테스트 (UT) | 13 | 13 | 0 | 100% |
| 통합 테스트 (IT) | 3 | 3 | 0 | 100% |

### 7.2 미매핑 항목 (있는 경우)

| 구분 | ID | 설명 | 미매핑 사유 |
|------|-----|------|-----------|
| - | - | - | - |

---

## 관련 문서

- 설계 문서: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- PRD: `.orchay/projects/rbac-redesign/prd.md`
- TRD: `.orchay/projects/rbac-redesign/trd.md`
