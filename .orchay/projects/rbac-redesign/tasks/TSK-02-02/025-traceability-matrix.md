# TSK-02-02 - 요구사항 추적성 매트릭스

**Template Version:** 1.0.0

> **목적**: PRD -> TRD -> 설계 -> API -> 테스트 4단계 양방향 추적
>
> **참조**: 이 문서는 `010-design.md`와 `026-test-specification.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-02 |
| Task명 | RoleGroup / Role / Permission CRUD + 할당 API |
| 설계 문서 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| PRD 참조 | `../../prd.md` |
| TRD 참조 | `../../trd.md` |
| 작성일 | 2026-01-27 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (PRD → 설계 → API → 테스트)

### 1.1 매핑 매트릭스

| 요구사항 ID | PRD 섹션 | 설계 섹션 | API 엔드포인트 | 단위 테스트 | E2E 테스트 | 상태 |
|-------------|----------|---------|----------------|-----------|-----------|------|
| FR-001 | 4.3 | 3.1 | GET /role-groups, POST /role-groups | UT-001~003 | E2E-001~002 | 설계완료 |
| FR-002 | 4.3 | 3.1 | PUT /role-groups/:id, DELETE /role-groups/:id | UT-004~005 | E2E-003~004 | 설계완료 |
| FR-003 | 4.3 | 3.1 | GET/POST /role-groups/:id/roles | UT-006~008 | E2E-005~006 | 설계완료 |
| FR-004 | 4.4 | 3.2 | GET/POST /roles, GET/PUT /roles/:id | UT-009~013 | E2E-007~011 | 설계완료 |
| FR-005 | 4.4 | 3.2 | DELETE /roles/:id, GET/POST /roles/:id/permissions | UT-014~017 | E2E-012~014 | 설계완료 |
| FR-006 | 4.4 | 3.3 | GET/POST/PUT/DELETE /permissions | UT-018~022 | E2E-015~018 | 설계완료 |
| FR-007 | 4.2 | 3.3 | GET /menus/:menuId/permissions | UT-023 | E2E-019 | 설계완료 |
| FR-008 | 4.5 | 3.4 | GET/POST /users/:id/role-groups, DELETE /users/:id/role-groups/:rgId | UT-024~027 | E2E-020~023 | 설계완료 |
| FR-009 | 4.5 | 3.4 | GET/POST /users/:id/systems, PUT/DELETE /users/:id/systems/:sysId | UT-028~031 | E2E-024~027 | 설계완료 |
| FR-010 | 4.5 | 3.4 | GET /users/:id/permissions (병합) | UT-032~035 | E2E-028~031 | 설계완료 |
| FR-011 | 4.7 | 3.5 | GET /users/:id/permissions/history?asOf=... | UT-036 | E2E-032 | 설계완료 |
| FR-012 | 4.7 | 3.5 | GET /permissions/:id/history?from=&to= | UT-037 | E2E-033 | 설계완료 |
| FR-013 | 4.7 | 3.5 | GET /users/:id/role-groups/history?from=&to= | UT-038 | E2E-034 | 설계완료 |

### 1.2 요구사항별 상세 매핑

#### FR-001: RoleGroup 기본 CRUD - 조회/생성

**PRD 요구사항:**
```
§4.3 RoleGroup CRUD
- [ ] RoleGroup 조회, 등록
- [ ] 시스템별 역할그룹 관리
```

**설계:**
- 섹션 3.1.1: GET /api/systems/:systemId/role-groups (목록)
- 섹션 3.1.2: POST /api/systems/:systemId/role-groups (생성)

**API 명세:**
```
GET /api/systems/mes-factory1/role-groups
  - 쿼리: page, limit, isActive, search, sortBy, sortOrder
  - 응답: 역할그룹 목록 + pagination

POST /api/systems/mes-factory1/role-groups
  - Body: roleGroupCd(UK), name, description, roleIds?
  - 응답: 생성된 역할그룹 상세
  - 비즈니스 규칙: roleGroupCd 중복 불가, roleIds 같은 systemId 확인
```

**테스트 케이스:**
- UT-001: RoleGroup 목록 조회 (기본 필터)
- UT-002: RoleGroup 목록 조회 (활성화 필터)
- UT-003: RoleGroup 생성 (유효한 데이터)
- E2E-001: 웹 UI에서 역할그룹 목록 표시
- E2E-002: 웹 UI에서 역할그룹 생성 폼 제출

---

#### FR-002: RoleGroup 기본 CRUD - 수정/삭제

**PRD 요구사항:**
```
§4.3 RoleGroup CRUD
- [ ] RoleGroup 수정, 삭제
```

**설계:**
- 섹션 3.1.4: PUT /api/systems/:systemId/role-groups/:roleGroupId
- 섹션 3.1.5: DELETE /api/systems/:systemId/role-groups/:roleGroupId

**API 명세:**
```
PUT /api/systems/mes-factory1/role-groups/1
  - Body: name?, description?, isActive?
  - 응답: 수정된 역할그룹 상세

DELETE /api/systems/mes-factory1/role-groups/1
  - 응답: 204 No Content
  - 비즈니스 규칙: 사용자 할당된 역할그룹 삭제 불가 또는 자동 제거
```

**테스트 케이스:**
- UT-004: RoleGroup 수정 (이름 변경)
- UT-005: RoleGroup 삭제 (활성 사용자 확인)
- E2E-003: 웹 UI에서 역할그룹 편집
- E2E-004: 웹 UI에서 역할그룹 삭제 (확인 모달)

---

#### FR-003: RoleGroup ↔ Role 할당

**PRD 요구사항:**
```
§4.3 RoleGroup 기반 역할 관리
- [ ] 역할그룹에 역할 할당/해제
```

**설계:**
- 섹션 3.1.6: GET /api/systems/:systemId/role-groups/:roleGroupId/roles
- 섹션 3.1.7: POST /api/systems/:systemId/role-groups/:roleGroupId/roles

**API 명세:**
```
GET /api/systems/mes-factory1/role-groups/1/roles
  - 응답: 역할 목록 (roleId, roleCd, name, ...)

POST /api/systems/mes-factory1/role-groups/1/roles
  - Body: action ("assign" | "revoke"), roleIds: number[]
  - 응답: assigned: [], revoked: [], errors?
  - 비즈니스 규칙: 같은 systemId 역할만, 중복/미할당 무시
```

**테스트 케이스:**
- UT-006: RoleGroup의 역할 목록 조회
- UT-007: 역할 할당 (단일, 복수)
- UT-008: 역할 해제 (부분 성공)
- E2E-005: 웹 UI에서 역할 할당
- E2E-006: 웹 UI에서 역할 해제 (부분 선택)

---

#### FR-004: Role 기본 CRUD - 조회/생성

**PRD 요구사항:**
```
§4.4 Permission config (actions + fieldConstraints)
- [ ] Role CRUD (이름, 부모 역할)
- [ ] 역할 계층 (parentRoleId)
```

**설계:**
- 섹션 3.2.1: GET /api/systems/:systemId/roles (목록, 계층 옵션)
- 섹션 3.2.2: POST /api/systems/:systemId/roles (생성)

**API 명세:**
```
GET /api/systems/mes-factory1/roles?includeHierarchy=true
  - 쿼리: page, limit, isActive, parentRoleId?, search, sortBy, includeHierarchy?
  - 응답: 역할 목록 (계층 구조 선택)

POST /api/systems/mes-factory1/roles
  - Body: roleCd(UK), name, description?, parentRoleId?, isSystem?
  - 응답: 생성된 역할 + level(자동 계산)
  - 비즈니스 규칙: roleCd 중복 불가, level 계산, 계층 깊이 제한(권장 5단계)
```

**테스트 케이스:**
- UT-009: Role 목록 조회 (flat 리스트)
- UT-010: Role 목록 조회 (계층 구조)
- UT-011: Role 목록 조회 (parentRoleId 필터)
- UT-012: Role 생성 (상위 역할 있음)
- UT-013: Role 생성 (최상위 역할)
- E2E-007: 웹 UI에서 역할 목록 표시
- E2E-008: 웹 UI에서 역할 생성 (상위 역할 선택)
- E2E-009: 계층 구조 트리 렌더링
- E2E-010: 역할 생성 폼 제출 (유효성 검사)
- E2E-011: 생성 후 목록 갱신 확인

---

#### FR-005: Role CRUD - 수정/삭제, 권한 할당

**PRD 요구사항:**
```
§4.4 권한 상속
- [ ] Role 수정 (부모 역할 변경 포함)
- [ ] Role 삭제
- [ ] Role에 Permission 할당
```

**설계:**
- 섹션 3.2.4: PUT /api/systems/:systemId/roles/:roleId (parentRoleId 변경 포함)
- 섹션 3.2.5: DELETE /api/systems/:systemId/roles/:roleId
- 섹션 3.2.6: GET /api/systems/:systemId/roles/:roleId/permissions
- 섹션 3.2.7: POST /api/systems/:systemId/roles/:roleId/permissions

**API 명세:**
```
PUT /api/systems/mes-factory1/roles/1
  - Body: name?, description?, parentRoleId?, isActive?
  - 응답: 수정된 역할 + level 재계산
  - 비즈니스 규칙: 순환 참조 방지, 하위 역할 level 자동 업데이트

DELETE /api/systems/mes-factory1/roles/1
  - 비즈니스 규칙: isSystem=true 불가, 권한 할당 여부 확인, children 처리

GET /api/systems/mes-factory1/roles/1/permissions
  - 응답: 역할에 할당된 권한 목록

POST /api/systems/mes-factory1/roles/1/permissions
  - Body: action ("assign" | "revoke"), permissionIds: number[]
  - 응답: assigned: [], revoked: [], errors?
```

**테스트 케이스:**
- UT-014: Role 수정 (이름 변경)
- UT-015: Role 수정 (parentRoleId 변경)
- UT-016: Role 삭제 (조건 확인)
- UT-017: Role의 권한 목록 조회
- E2E-012: 웹 UI에서 역할 수정
- E2E-013: 웹 UI에서 부모 역할 변경 (level 재계산 확인)
- E2E-014: 역할 삭제 (경고 메시지)

---

#### FR-006: Permission CRUD

**PRD 요구사항:**
```
§4.4 Permission config (actions + fieldConstraints)
- [ ] Permission CRUD
- [ ] config: actions 배열 + fieldConstraints
- [ ] Role-Permission 할당
```

**설계:**
- 섹션 3.3: Permission API (GET/POST/PUT/DELETE)

**API 명세:**
```
GET /api/systems/mes-factory1/permissions?menuId=101&roleId=1
  - 쿼리: page, limit, menuId?, isActive?, search?, roleId? (필터)
  - 응답: 권한 목록 + roleCount

POST /api/systems/mes-factory1/permissions
  - Body: permissionCd(UK), name, menuId?, config: { actions[], fieldConstraints? }, description?
  - 응답: 생성된 권한 상세
  - 예시: { actions: ["READ", "EXPORT"], fieldConstraints: { PROC_CD: ["2CGL"], LINE_CD: null } }

PUT /api/systems/mes-factory1/permissions/1
  - Body: name?, menuId?, config?, isActive?
  - 응답: 수정된 권한

DELETE /api/systems/mes-factory1/permissions/1
  - 비즈니스 규칙: 역할 할당 권한 삭제 불가
```

**테스트 케이스:**
- UT-018: Permission 목록 조회 (기본)
- UT-019: Permission 목록 조회 (menuId 필터)
- UT-020: Permission 생성 (actions, fieldConstraints)
- UT-021: Permission 수정 (config 변경)
- UT-022: Permission 삭제 (조건 확인)
- E2E-015: 웹 UI에서 권한 목록 표시
- E2E-016: 웹 UI에서 권한 생성 (fieldConstraints 동적 추가)
- E2E-017: 웹 UI에서 권한 수정
- E2E-018: 권한 삭제 (경고)

---

#### FR-007: Menu ↔ Permission 조회

**PRD 요구사항:**
```
§4.2 MenuSet 기반 메뉴 구성
- [ ] GET /menus/:menuId/permissions (기존 확장)
```

**설계:**
- 섹션 3.3.2: GET /api/systems/:systemId/menus/:menuId/permissions

**API 명세:**
```
GET /api/systems/mes-factory1/menus/101/permissions
  - 응답: 특정 메뉴의 모든 권한 목록
```

**테스트 케이스:**
- UT-023: 메뉴의 권한 목록 조회
- E2E-019: 웹 UI에서 메뉴 선택 시 권한 표시

---

#### FR-008: User ↔ RoleGroup 할당

**PRD 요구사항:**
```
§4.3 사용자-역할그룹 할당/해제
- [ ] User → RoleGroup → Role 경로
```

**설계:**
- 섹션 3.4.1: GET /api/users/:userId/role-groups
- 섹션 3.4.2: POST /api/users/:userId/role-groups
- 섹션 3.4.3: DELETE /api/users/:userId/role-groups/:roleGroupId

**API 명세:**
```
GET /api/users/41000132/role-groups?systemId=mes-factory1
  - 응답: 사용자의 역할그룹 목록 (시스템별, roles 포함)

POST /api/users/41000132/role-groups
  - Body: roleGroupId, systemId
  - 응답: 할당 결과

DELETE /api/users/41000132/role-groups/1
  - 응답: 204 No Content
```

**테스트 케이스:**
- UT-024: 사용자의 역할그룹 목록 조회
- UT-025: 역할그룹 할당 (단일)
- UT-026: 역할그룹 중복 할당 불가
- UT-027: 역할그룹 제거
- E2E-020: 웹 UI에서 사용자 역할그룹 할당
- E2E-021: 웹 UI에서 복수 역할그룹 할당
- E2E-022: 할당된 역할그룹 목록 갱신
- E2E-023: 역할그룹 제거 (확인 모달)

---

#### FR-009: User ↔ System 할당

**PRD 요구사항:**
```
§4.1 도메인 기반 시스템 식별
- [ ] 사용자별 접근 가능 시스템 관리
```

**설계:**
- 섹션 3.4.4: GET /api/users/:userId/systems
- 섹션 3.4.5: POST /api/users/:userId/systems
- 섹션 3.4.6: PUT /api/users/:userId/systems/:systemId
- 섹션 3.4.7: DELETE /api/users/:userId/systems/:systemId

**API 명세:**
```
GET /api/users/41000132/systems
  - 응답: 사용자가 접근 가능한 시스템 목록 (menuSetId 포함)

POST /api/users/41000132/systems
  - Body: systemId, menuSetId? (생략 시 기본 MenuSet)
  - 응답: 할당 결과

PUT /api/users/41000132/systems/mes-factory1
  - Body: menuSetId (메뉴세트 변경)
  - 응답: 업데이트 결과

DELETE /api/users/41000132/systems/mes-factory1
  - 응답: 204 No Content
```

**테스트 케이스:**
- UT-028: 사용자의 시스템 접근 목록 조회
- UT-029: 시스템 접근 할당 (기본 MenuSet)
- UT-030: 시스템 메뉴세트 변경
- UT-031: 시스템 접근 제거
- E2E-024: 웹 UI에서 시스템 할당
- E2E-025: 웹 UI에서 시스템별 메뉴세트 표시
- E2E-026: 메뉴세트 변경
- E2E-027: 시스템 접근 제거

---

#### FR-010: User 병합 권한 조회

**PRD 요구사항:**
```
§4.5 권한 병합 규칙
- [ ] 같은 menuId 다중 Permission 병합 (Union)
- [ ] actions 합집합, fieldConstraints 값 합집합
```

**설계:**
- 섹션 3.4.8: GET /api/users/:userId/permissions (병합)

**API 명세:**
```
GET /api/users/41000132/permissions?systemId=mes-factory1&menuId=101
  - 응답: 사용자의 병합 권한 (모든 역할그룹의 권한 합집합)
  - 병합 규칙: actions 합집합, fieldConstraints 각 필드 값 합집합
  - 예시: PROC_CD ["2CGL", "3CGL"] + ["3CGL", "4CGL"] = ["2CGL", "3CGL", "4CGL"]
```

**테스트 케이스:**
- UT-032: 병합 권한 조회 (단일 시스템)
- UT-033: 병합 권한 조회 (복수 시스템)
- UT-034: fieldConstraints 병합 (Union)
- UT-035: fieldConstraints 병합 (한쪽 null → 전체)
- E2E-028: 웹 UI에서 사용자 권한 표시
- E2E-029: 복수 역할그룹의 권한 병합 확인
- E2E-030: fieldConstraints 병합 결과 확인
- E2E-031: 권한 변경 시 병합 권한 업데이트

---

#### FR-011: User 권한 변경 이력 (asOf)

**PRD 요구사항:**
```
§4.7 감사 이력 (SCD Type 2)
- [ ] 특정 시점의 권한 상태 조회 (asOf)
```

**설계:**
- 섹션 3.5.1: GET /api/users/:userId/permissions/history?asOf=...

**API 명세:**
```
GET /api/users/41000132/permissions/history?asOf=2026-01-27T10:00:00Z
  - 쿼리: asOf (ISO8601, 기본: 현재), systemId?, limit?
  - 응답: 특정 시점의 사용자 권한 상태 (validFrom <= asOf < validTo)
```

**테스트 케이스:**
- UT-036: asOf 기준 권한 이력 조회
- E2E-032: 웹 UI에서 특정 시점 권한 상태 표시

---

#### FR-012: Permission 변경 이력

**PRD 요구사항:**
```
§4.7 마스터 테이블 변경 이력 (Permission)
- [ ] 권한 변경 이력 조회 (시간 범위)
```

**설계:**
- 섹션 3.5.2: GET /api/permissions/:permissionId/history?from=&to=...

**API 명세:**
```
GET /api/systems/mes-factory1/permissions/1/history?from=2026-01-01&to=2026-01-31
  - 쿼리: from?, to?, changeType?, limit?
  - 응답: 권한 변경 이력 (CREATE, UPDATE, DELETE)
```

**테스트 케이스:**
- UT-037: Permission 이력 조회 (시간 범위)
- E2E-033: 웹 UI에서 권한 변경 이력 표시

---

#### FR-013: User RoleGroup 할당 이력

**PRD 요구사항:**
```
§4.7 매핑 테이블 변경 이력 (UserRoleGroup)
- [ ] 사용자 역할그룹 할당 이력 조회
```

**설계:**
- 섹션 3.5.3: GET /api/users/:userId/role-groups/history?from=&to=...

**API 명세:**
```
GET /api/users/41000132/role-groups/history?from=2026-01-01&to=2026-01-31
  - 쿼리: from?, to?, changeType? (ASSIGN | REVOKE), limit?
  - 응답: 사용자 역할그룹 할당 이력
```

**테스트 케이스:**
- UT-038: User RoleGroup 할당 이력 조회
- E2E-034: 웹 UI에서 할당 이력 표시

---

## 2. 비즈니스 규칙 추적 (BR → API → 테스트)

### 2.1 RoleGroup 비즈니스 규칙

| BR ID | 규칙 설명 | 설계 섹션 | API 검증 | 단위 테스트 | E2E 테스트 |
|-------|----------|---------|---------|-----------|-----------|
| BR-RG-01 | roleGroupCd 중복 불가 | 3.1.2 | 409 Conflict | UT-003a | E2E-002a |
| BR-RG-02 | 사용자 할당된 역할그룹 삭제 불가 | 3.1.5 | 400 Bad Request | UT-005a | E2E-004a |
| BR-RG-03 | 같은 systemId 역할만 할당 | 3.1.7 | 400 Bad Request | UT-008a | E2E-006a |

### 2.2 Role 비즈니스 규칙

| BR ID | 규칙 설명 | 설계 섹션 | API 검증 | 단위 테스트 | E2E 테스트 |
|-------|----------|---------|---------|-----------|-----------|
| BR-R-01 | roleCd 중복 불가 | 3.2.2 | 409 Conflict | UT-012a | E2E-008a |
| BR-R-02 | 순환 참조 방지 | 3.2.4 | 400 Bad Request | UT-014b | E2E-012b |
| BR-R-03 | parentRoleId 변경 시 level 재계산 | 3.2.4 | 자동 | UT-015a | E2E-013a |
| BR-R-04 | isSystem=true 역할 삭제 불가 | 3.2.5 | 403 Forbidden | UT-016a | E2E-014a |
| BR-R-05 | 권한 할당된 역할 삭제 불가 | 3.2.5 | 400 Bad Request | UT-016b | E2E-014b |

### 2.3 Permission 비즈니스 규칙

| BR ID | 규칙 설명 | 설계 섹션 | API 검증 | 단위 테스트 | E2E 테스트 |
|-------|----------|---------|---------|-----------|-----------|
| BR-P-01 | permissionCd 중복 불가 | 3.3.3 | 409 Conflict | UT-020a | E2E-016a |
| BR-P-02 | menuId 같은 systemId 확인 | 3.3.3 | 400 Bad Request | UT-020b | E2E-016b |
| BR-P-03 | actions 정의된 액션만 | 3.3.3 | 400 Bad Request | UT-020c | E2E-016c |
| BR-P-04 | 역할 할당 권한 삭제 불가 | 3.3.6 | 400 Bad Request | UT-022a | E2E-018a |
| BR-P-05 | fieldConstraints 병합 (Union) | 3.4.8 | 자동 | UT-034a | E2E-030a |

### 2.4 User 할당 비즈니스 규칙

| BR ID | 규칙 설명 | 설계 섹션 | API 검증 | 단위 테스트 | E2E 테스트 |
|-------|----------|---------|---------|-----------|-----------|
| BR-U-01 | 사용자-역할그룹 중복 불가 | 3.4.2 | 409 Conflict | UT-025a | E2E-021a |
| BR-U-02 | 사용자-시스템 중복 불가 | 3.4.5 | 409 Conflict | UT-029a | E2E-024a |
| BR-U-03 | MenuSet은 systemId 같아야 함 | 3.4.5 | 400 Bad Request | UT-029b | E2E-024b |

---

## 3. 데이터 모델 추적

### 3.1 엔티티 → API 엔드포인트 매핑

| 엔티티 | TRD 섹션 | API 엔드포인트 | CRUD | 상태 |
|--------|---------|---------------|------|------|
| System | 3.1 | /api/systems | - | 별도 task |
| RoleGroup | 3.3 | /api/systems/:id/role-groups | ✓ | 이 task |
| Role | 3.3 | /api/systems/:id/roles | ✓ | 이 task |
| Permission | 3.3 | /api/systems/:id/permissions | ✓ | 이 task |
| RoleGroupRole | 3.3 | /api/systems/:id/role-groups/:id/roles | ✓ | 이 task |
| RolePermission | 3.3 | /api/systems/:id/roles/:id/permissions | ✓ | 이 task |
| UserRoleGroup | 3.1 | /api/users/:id/role-groups | ✓ | 이 task |
| UserSystemMenuSet | 3.1 | /api/users/:id/systems | ✓ | 이 task |

### 3.2 Prisma 모델 → API 요청/응답 매핑

```typescript
// Prisma: RoleGroup
model RoleGroup {
  roleGroupId: Int
  systemId: String
  roleGroupCd: String  // UK
  name: String
  description?: String
  isActive: Boolean
}

// API Request (POST)
interface CreateRoleGroupRequest {
  roleGroupCd: string    // Prisma.roleGroupCd
  name: string           // Prisma.name
  description?: string   // Prisma.description
  roleIds?: number[]     // RoleGroupRole 통해 생성
}

// API Response
interface RoleGroupDto {
  roleGroupId: number    // Prisma.roleGroupId
  systemId: string       // Prisma.systemId
  roleGroupCd: string    // Prisma.roleGroupCd
  name: string           // Prisma.name
  description?: string   // Prisma.description
  isActive: boolean      // Prisma.isActive
  roleCount?: number     // derived: RoleGroupRole 수
  userCount?: number     // derived: UserRoleGroup 수
}
```

---

## 4. 테스트 추적성

### 4.1 테스트 케이스별 커버리지

| 테스트 ID | 테스트명 | 커버 요구사항 | 커버 규칙 | 단계 |
|-----------|---------|-------------|---------|------|
| UT-001 | RoleGroup 목록 조회 (기본) | FR-001 | - | UNIT |
| UT-002 | RoleGroup 목록 조회 (필터) | FR-001 | - | UNIT |
| UT-003 | RoleGroup 생성 | FR-001 | BR-RG-01 | UNIT |
| UT-003a | RoleGroup 생성 (중복 코드) | FR-001 | BR-RG-01 | UNIT |
| UT-004 | RoleGroup 수정 | FR-002 | - | UNIT |
| UT-005 | RoleGroup 삭제 | FR-002 | - | UNIT |
| UT-005a | RoleGroup 삭제 (사용자 할당) | FR-002 | BR-RG-02 | UNIT |
| UT-006 | 역할그룹의 역할 목록 조회 | FR-003 | - | UNIT |
| UT-007 | 역할 할당 | FR-003 | BR-RG-03 | UNIT |
| UT-008 | 역할 해제 | FR-003 | - | UNIT |
| UT-008a | 역할 할당 (다른 시스템) | FR-003 | BR-RG-03 | UNIT |
| ... | ... | ... | ... | ... |

---

## 5. 추적성 검증 요약

### 5.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 13 | 13 | 0 | 100% |
| 비즈니스 규칙 (BR) | 17 | 17 | 0 | 100% |
| API 엔드포인트 | 24 | 24 | 0 | 100% |
| 단위 테스트 (UT) | 38+ | 38+ | 0 | 100% |
| E2E 테스트 | 34+ | 34+ | 0 | 100% |

### 5.2 요구사항-테스트 매트릭스

| FR ID | 단위 테스트 | E2E 테스트 | 총 테스트 |
|-------|-----------|-----------|----------|
| FR-001 | 3 | 2 | 5 |
| FR-002 | 2 | 2 | 4 |
| FR-003 | 3 | 2 | 5 |
| FR-004 | 5 | 5 | 10 |
| FR-005 | 4 | 3 | 7 |
| FR-006 | 5 | 4 | 9 |
| FR-007 | 1 | 1 | 2 |
| FR-008 | 4 | 4 | 8 |
| FR-009 | 4 | 4 | 8 |
| FR-010 | 4 | 4 | 8 |
| FR-011 | 1 | 1 | 2 |
| FR-012 | 1 | 1 | 2 |
| FR-013 | 1 | 1 | 2 |
| **합계** | **38** | **34** | **72** |

---

## 6. 미매핑 항목 및 위험 요소

### 6.1 미매핑 항목

- 없음 (100% 매핑 완료)

### 6.2 위험 요소 및 개선 계획

| 위험 요소 | 영향도 | 완화 방안 |
|----------|--------|---------|
| 순환 참조 검증 복잡도 | 중간 | UT에서 DFS 테스트 추가 |
| fieldConstraints 병합 로직 | 높음 | UT-034에서 다양한 시나리오 커버 |
| 이력 테이블 성능 | 중간 | 인덱싱 (systemId, validFrom), 쿼리 최적화 |
| asOf 쿼리 성능 | 중간 | validFrom, validTo 인덱스 필수 |

---

## 7. 관련 문서

| 문서 | 경로 | 용도 |
|------|------|------|
| 설계 문서 | `010-design.md` | API 상세 명세 |
| 테스트 명세 | `026-test-specification.md` | 테스트 케이스 상세 |
| PRD | `../../prd.md` | 제품 요구사항 |
| TRD | `../../trd.md` | 데이터 모델 정의 |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-27 | Claude | 최초 작성 |

---
