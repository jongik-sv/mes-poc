# TSK-02-02 - RoleGroup / Role / Permission CRUD + 할당 API 설계 문서

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-02 |
| Task명 | RoleGroup / Role / Permission CRUD + 할당 API |
| 문서 버전 | 1.0 |
| 작성일 | 2026-01-27 |
| 상태 | 설계완료 |
| 카테고리 | Backend API Design |

---

## 1. 개요

### 1.1 배경 및 목적

**배경:**
- RBAC 재설계의 핵심 기능인 RoleGroup / Role / Permission 관리 API 필요
- 기존 auth-system의 UserRole 테이블 제거, RoleGroup 기반 구조 변경
- Permission config(actions + fieldConstraints) 통합 관리 필요

**목적:**
- RoleGroup, Role, Permission의 CRUD API 제공
- Role에 Permission 할당/해제 API
- User에 RoleGroup 할당/해제 API
- 사용자의 merged 권한 조회 API
- 권한 변경 이력 추적 API

### 1.2 범위

**포함:**
- RoleGroup API (GET/POST/PUT/DELETE)
- Role API (GET/POST/PUT/DELETE) + 계층(parent) 관리
- Permission API (GET/POST/PUT/DELETE) - 기존 확장
- RoleGroup ↔ Role 할당 API
- Role ↔ Permission 할당 API
- User ↔ RoleGroup 할당 API (§5.5)
- User ↔ System 할당 API (§5.5)
- User 병합 권한 조회 API (§5.5)
- 이력 조회 API (§5.6): asOf 파라미터 지원

**제외:**
- 화면(UI) 구현
- 메뉴(Menu) API (별도 task)
- MenuSet API (별도 task)

### 1.3 참조 문서

| 문서 | 경로 | 관련 섹션 |
|------|------|----------|
| PRD | `.orchay/projects/rbac-redesign/prd.md` | §4.3, §4.4, §4.5, §4.7 |
| TRD | `.orchay/projects/rbac-redesign/trd.md` | §2, §3 (데이터 모델) |
| 추적성 매트릭스 | `tasks/TSK-02-02/025-traceability-matrix.md` | - |
| 테스트 명세 | `tasks/TSK-02-02/026-test-specification.md` | - |

---

## 2. API 엔드포인트 목록

### 2.1 RoleGroup API (§5.4)

| Method | Endpoint | 설명 | 인증 | 상태 |
|--------|----------|------|------|------|
| GET | `/api/systems/:systemId/role-groups` | 시스템 내 역할그룹 목록 조회 | ✓ | [ ] |
| POST | `/api/systems/:systemId/role-groups` | 역할그룹 생성 | ✓ | [ ] |
| GET | `/api/systems/:systemId/role-groups/:roleGroupId` | 역할그룹 상세 조회 | ✓ | [ ] |
| PUT | `/api/systems/:systemId/role-groups/:roleGroupId` | 역할그룹 수정 | ✓ | [ ] |
| DELETE | `/api/systems/:systemId/role-groups/:roleGroupId` | 역할그룹 삭제 | ✓ | [ ] |
| GET | `/api/systems/:systemId/role-groups/:roleGroupId/roles` | 역할그룹에 할당된 역할 목록 | ✓ | [ ] |
| POST | `/api/systems/:systemId/role-groups/:roleGroupId/roles` | 역할그룹에 역할 할당/해제 | ✓ | [ ] |

### 2.2 Role API (§5.1 확장)

| Method | Endpoint | 설명 | 인증 | 상태 |
|--------|----------|------|------|------|
| GET | `/api/systems/:systemId/roles` | 시스템 내 역할 목록 조회 | ✓ | [ ] |
| POST | `/api/systems/:systemId/roles` | 역할 생성 | ✓ | [ ] |
| GET | `/api/systems/:systemId/roles/:roleId` | 역할 상세 조회 | ✓ | [ ] |
| PUT | `/api/systems/:systemId/roles/:roleId` | 역할 수정 (parentRoleId 포함) | ✓ | [ ] |
| DELETE | `/api/systems/:systemId/roles/:roleId` | 역할 삭제 | ✓ | [ ] |
| GET | `/api/systems/:systemId/roles/:roleId/permissions` | 역할에 할당된 권한 목록 | ✓ | [ ] |
| POST | `/api/systems/:systemId/roles/:roleId/permissions` | 역할에 권한 할당/해제 | ✓ | [ ] |

### 2.3 Permission API (§5.1, §5.6)

| Method | Endpoint | 설명 | 인증 | 상태 |
|--------|----------|------|------|------|
| GET | `/api/systems/:systemId/permissions` | 시스템 내 권한 목록 조회 | ✓ | [ ] |
| GET | `/api/systems/:systemId/menus/:menuId/permissions` | 특정 메뉴의 권한 목록 | ✓ | [ ] |
| POST | `/api/systems/:systemId/permissions` | 권한 생성 | ✓ | [ ] |
| GET | `/api/systems/:systemId/permissions/:permissionId` | 권한 상세 조회 | ✓ | [ ] |
| PUT | `/api/systems/:systemId/permissions/:permissionId` | 권한 수정 | ✓ | [ ] |
| DELETE | `/api/systems/:systemId/permissions/:permissionId` | 권한 삭제 | ✓ | [ ] |

### 2.4 User Extension API (§5.5)

| Method | Endpoint | 설명 | 인증 | 상태 |
|--------|----------|------|------|------|
| GET | `/api/users/:userId/role-groups` | 사용자의 역할그룹 목록 | ✓ | [ ] |
| POST | `/api/users/:userId/role-groups` | 사용자에 역할그룹 할당 | ✓ | [ ] |
| DELETE | `/api/users/:userId/role-groups/:roleGroupId` | 사용자로부터 역할그룹 제거 | ✓ | [ ] |
| GET | `/api/users/:userId/systems` | 사용자가 접근 가능한 시스템 목록 | ✓ | [ ] |
| POST | `/api/users/:userId/systems` | 사용자에 시스템 접근 권한 할당 | ✓ | [ ] |
| PUT | `/api/users/:userId/systems/:systemId` | 사용자의 시스템 메뉴세트 설정 | ✓ | [ ] |
| DELETE | `/api/users/:userId/systems/:systemId` | 사용자로부터 시스템 접근 제거 | ✓ | [ ] |
| GET | `/api/users/:userId/permissions` | 사용자의 병합 권한 조회 (모든 시스템) | ✓ | [ ] |

### 2.5 History API (§5.6)

| Method | Endpoint | 설명 | 쿼리 파라미터 | 인증 | 상태 |
|--------|----------|------|--------------|------|------|
| GET | `/api/users/:userId/permissions/history` | 사용자 권한 변경 이력 | `?asOf=2026-01-27T10:00:00Z` | ✓ | [ ] |
| GET | `/api/permissions/:permissionId/history` | 권한 변경 이력 | `?from=&to=` (필터) | ✓ | [ ] |
| GET | `/api/users/:userId/role-groups/history` | 사용자 역할그룹 할당 이력 | `?from=&to=` | ✓ | [ ] |

---

## 3. 상세 API 명세

### 3.1 RoleGroup API

#### 3.1.1 GET /api/systems/:systemId/role-groups

**설명**: 특정 시스템 내 모든 역할그룹 목록 조회

**요청**:
```http
GET /api/systems/mes-factory1/role-groups HTTP/1.1
Authorization: Bearer {token}
```

**쿼리 파라미터**:
```typescript
interface ListRoleGroupsQuery {
  page?: number;        // 기본값: 1
  limit?: number;       // 기본값: 20, 최대: 100
  isActive?: boolean;   // 활성화 상태 필터
  search?: string;      // 이름/코드 검색
  sortBy?: string;      // "name" | "createdAt" 기본값: "name"
  sortOrder?: string;   // "asc" | "desc" 기본값: "asc"
}
```

**응답 (200 OK)**:
```typescript
interface ListRoleGroupsResponse {
  data: {
    roleGroupId: number;
    systemId: string;
    roleGroupCd: string;
    name: string;
    description?: string;
    isActive: boolean;
    roleCount: number;          // 할당된 역할 수
    userCount: number;          // 이 역할그룹이 할당된 사용자 수
    createdAt: ISO8601;
    updatedAt: ISO8601;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**에러**:
- 400 Bad Request: 잘못된 쿼리 파라미터
- 403 Forbidden: 시스템 접근 권한 없음
- 404 Not Found: 시스템 없음

---

#### 3.1.2 POST /api/systems/:systemId/role-groups

**설명**: 새 역할그룹 생성

**요청**:
```typescript
interface CreateRoleGroupRequest {
  roleGroupCd: string;     // 고유, 30자 이하, 영문/숫자/_만
  name: string;            // 필수, 100자 이하
  description?: string;    // 선택, 500자 이하
  roleIds?: number[];      // 초기 역할 할당 (선택)
}
```

**응답 (201 Created)**:
```typescript
interface CreateRoleGroupResponse {
  data: {
    roleGroupId: number;
    systemId: string;
    roleGroupCd: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: ISO8601;
    updatedAt: ISO8601;
  };
}
```

**비즈니스 규칙**:
- roleGroupCd 중복 불가 (같은 systemId 내)
- roleIds 제공 시 모두 같은 systemId 소속 확인 필수

**에러**:
- 400 Bad Request: 유효성 검사 실패
- 409 Conflict: roleGroupCd 중복

---

#### 3.1.3 GET /api/systems/:systemId/role-groups/:roleGroupId

**설명**: 역할그룹 상세 조회 (할당된 역할 포함)

**응답 (200 OK)**:
```typescript
interface GetRoleGroupResponse {
  data: {
    roleGroupId: number;
    systemId: string;
    roleGroupCd: string;
    name: string;
    description?: string;
    isActive: boolean;
    roles: {
      roleId: number;
      roleCd: string;
      name: string;
    }[];
    users: {
      userId: string;
      name: string;
      assignedAt: ISO8601;
    }[];
    createdAt: ISO8601;
    updatedAt: ISO8601;
  };
}
```

---

#### 3.1.4 PUT /api/systems/:systemId/role-groups/:roleGroupId

**설명**: 역할그룹 정보 수정

**요청**:
```typescript
interface UpdateRoleGroupRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}
```

**응답 (200 OK)**: CreateRoleGroupResponse와 동일

---

#### 3.1.5 DELETE /api/systems/:systemId/role-groups/:roleGroupId

**설명**: 역할그룹 삭제

**응답 (204 No Content)**: 본문 없음

**비즈니스 규칙**:
- 사용자가 할당된 역할그룹 삭제 불가 (선택: 강제 삭제 시 사용자 할당 자동 제거)

---

#### 3.1.6 GET /api/systems/:systemId/role-groups/:roleGroupId/roles

**설명**: 역할그룹에 할당된 역할 목록

**응답**:
```typescript
interface RoleGroupRolesResponse {
  data: {
    roleId: number;
    roleCd: string;
    name: string;
    description?: string;
    level: number;
    parentRoleId?: number;
    permissionCount: number;
  }[];
}
```

---

#### 3.1.7 POST /api/systems/:systemId/role-groups/:roleGroupId/roles

**설명**: 역할그룹에 역할 할당/해제

**요청**:
```typescript
interface AssignRoleGroupRolesRequest {
  action: "assign" | "revoke";
  roleIds: number[];
}
```

**응답 (200 OK)**:
```typescript
interface AssignRoleGroupRolesResponse {
  data: {
    assigned: number[];       // 성공적으로 할당된 roleId
    revoked: number[];        // 성공적으로 해제된 roleId
    errors?: {
      roleId: number;
      reason: string;
    }[];
  };
}
```

**비즈니스 규칙**:
- 같은 systemId의 역할만 할당 가능
- 이미 할당된 역할 재할당 시 무시 (에러 아님)
- 미할당 역할 해제 시도 시 무시 (에러 아님)

---

### 3.2 Role API

#### 3.2.1 GET /api/systems/:systemId/roles

**설명**: 시스템 내 모든 역할 목록 (계층 구조)

**쿼리 파라미터**:
```typescript
interface ListRolesQuery {
  page?: number;
  limit?: number;
  isActive?: boolean;
  parentRoleId?: number;    // 특정 상위 역할의 하위 역할만
  search?: string;
  sortBy?: string;          // "name" | "level"
  sortOrder?: string;       // "asc" | "desc"
  includeHierarchy?: boolean; // 트리 구조로 반환 (기본: flat list)
}
```

**응답 (200 OK)**:
```typescript
interface ListRolesResponse {
  data: {
    roleId: number;
    systemId: string;
    roleCd: string;
    name: string;
    description?: string;
    level: number;
    parentRoleId?: number;
    isSystem: boolean;
    isActive: boolean;
    permissionCount: number;
    childCount?: number;      // 하위 역할 수
    createdAt: ISO8601;
    updatedAt: ISO8601;
  }[];
  pagination: { /* ... */ };
}
```

**includeHierarchy=true 시**:
```typescript
interface RoleHierarchyResponse {
  data: {
    /* ListRolesResponse.data[0] + */
    children?: RoleHierarchyResponse['data'][];
  }[];
}
```

---

#### 3.2.2 POST /api/systems/:systemId/roles

**설명**: 새 역할 생성

**요청**:
```typescript
interface CreateRoleRequest {
  roleCd: string;           // 고유, 30자 이하
  name: string;             // 필수, 100자 이하
  description?: string;
  parentRoleId?: number;    // 상위 역할 (같은 systemId)
  isSystem?: boolean;       // 기본값: false
}
```

**응답 (201 Created)**:
```typescript
interface CreateRoleResponse {
  data: {
    roleId: number;
    systemId: string;
    roleCd: string;
    name: string;
    description?: string;
    level: number;           // 계산: parentRole.level + 1
    parentRoleId?: number;
    isSystem: boolean;
    isActive: boolean;
    createdAt: ISO8601;
    updatedAt: ISO8601;
  };
}
```

**비즈니스 규칙**:
- roleCd 중복 불가 (같은 systemId 내)
- parentRoleId 제공 시 같은 systemId 확인
- level 자동 계산: 계층 깊이 제한 가능 (권장: 5단계)

---

#### 3.2.3 GET /api/systems/:systemId/roles/:roleId

**설명**: 역할 상세 조회

**응답**:
```typescript
interface GetRoleResponse {
  data: {
    roleId: number;
    systemId: string;
    roleCd: string;
    name: string;
    description?: string;
    level: number;
    parentRoleId?: number;
    parentRole?: {
      roleId: number;
      name: string;
    };
    isSystem: boolean;
    isActive: boolean;
    permissions: {
      permissionId: number;
      permissionCd: string;
      name: string;
      menuId?: number;
    }[];
    children: {
      roleId: number;
      name: string;
    }[];
    roleGroups: {
      roleGroupId: number;
      name: string;
    }[];
    createdAt: ISO8601;
    updatedAt: ISO8601;
  };
}
```

---

#### 3.2.4 PUT /api/systems/:systemId/roles/:roleId

**설명**: 역할 수정 (parentRoleId 변경 포함)

**요청**:
```typescript
interface UpdateRoleRequest {
  name?: string;
  description?: string;
  parentRoleId?: number | null;  // null로 최상위 역할로 변경 가능
  isActive?: boolean;
}
```

**비즈니스 규칙**:
- 순환 참조 방지 (자기 자신 또는 자식이 parentRoleId로 설정 불가)
- parentRoleId 변경 시 level 재계산, 하위 역할 level도 업데이트

---

#### 3.2.5 DELETE /api/systems/:systemId/roles/:roleId

**설명**: 역할 삭제

**비즈니스 규칙**:
- isSystem=true인 역할 삭제 불가
- 권한(permission)이 할당된 역할 삭제 불가
- 하위 역할(children)이 있는 역할:
  - 강제 삭제 시 자식 역할들의 parentRoleId를 null로 설정

---

#### 3.2.6 GET /api/systems/:systemId/roles/:roleId/permissions

**설명**: 역할에 할당된 권한 목록 (새로운 엔드포인트)

**응답**:
```typescript
interface RolePermissionsResponse {
  data: {
    permissionId: number;
    permissionCd: string;
    name: string;
    menuId?: number;
    menuName?: string;
    config: {
      actions: string[];     // ["CREATE", "READ", ...]
      fieldConstraints?: Record<string, string[] | null>;
    };
    createdAt: ISO8601;
  }[];
}
```

---

#### 3.2.7 POST /api/systems/:systemId/roles/:roleId/permissions

**설명**: 역할에 권한 할당/해제

**요청**:
```typescript
interface AssignRolePermissionsRequest {
  action: "assign" | "revoke";
  permissionIds: number[];
}
```

**응답**:
```typescript
interface AssignRolePermissionsResponse {
  data: {
    assigned: number[];
    revoked: number[];
    errors?: { permissionId: number; reason: string }[];
  };
}
```

---

### 3.3 Permission API

#### 3.3.1 GET /api/systems/:systemId/permissions

**설명**: 시스템 내 모든 권한 목록

**쿼리 파라미터**:
```typescript
interface ListPermissionsQuery {
  page?: number;
  limit?: number;
  menuId?: number;          // 특정 메뉴 필터
  isActive?: boolean;
  search?: string;
  roleId?: number;          // 특정 역할이 보유한 권한만
}
```

**응답**:
```typescript
interface ListPermissionsResponse {
  data: {
    permissionId: number;
    systemId: string;
    permissionCd: string;
    name: string;
    menuId?: number;
    menuName?: string;
    config: {
      actions: string[];
      fieldConstraints?: Record<string, string[] | null>;
    };
    isActive: boolean;
    roleCount: number;       // 이 권한이 할당된 역할 수
    createdAt: ISO8601;
    updatedAt: ISO8601;
  }[];
  pagination: { /* ... */ };
}
```

---

#### 3.3.2 GET /api/systems/:systemId/menus/:menuId/permissions

**설명**: 특정 메뉴의 모든 권한 목록 (기존 확장)

**응답**: ListPermissionsResponse와 유사

---

#### 3.3.3 POST /api/systems/:systemId/permissions

**설명**: 새 권한 생성

**요청**:
```typescript
interface CreatePermissionRequest {
  permissionCd: string;     // 고유, 50자 이하
  name: string;             // 필수, 100자 이하
  menuId?: number;          // 선택, 같은 systemId의 메뉴
  config: {
    actions: string[];      // ["CREATE", "READ", "UPDATE", "DELETE", "EXPORT", "IMPORT"]
    fieldConstraints?: Record<
      string,                // 필드명
      string[] | null        // 허용 값 배열 또는 null (제약 해제)
    >;
  };
  description?: string;
}
```

**예시**:
```json
{
  "permissionCd": "PROD_VIEW",
  "name": "생산 실적 조회",
  "menuId": 101,
  "config": {
    "actions": ["READ", "EXPORT"],
    "fieldConstraints": {
      "PROC_CD": ["2CGL", "3CGL"],
      "LINE_CD": null
    }
  }
}
```

**응답 (201 Created)**:
```typescript
interface CreatePermissionResponse {
  data: {
    permissionId: number;
    systemId: string;
    permissionCd: string;
    name: string;
    menuId?: number;
    config: { /* request.config */ };
    isActive: boolean;
    createdAt: ISO8601;
    updatedAt: ISO8601;
  };
}
```

**비즈니스 규칙**:
- permissionCd 중복 불가 (같은 systemId 내)
- menuId 제공 시 같은 systemId의 메뉴 확인
- actions 배열: 정의된 액션만 허용

---

#### 3.3.4 GET /api/systems/:systemId/permissions/:permissionId

**설명**: 권한 상세 조회

**응답**: CreatePermissionResponse.data와 유사

---

#### 3.3.5 PUT /api/systems/:systemId/permissions/:permissionId

**설명**: 권한 수정

**요청**:
```typescript
interface UpdatePermissionRequest {
  name?: string;
  menuId?: number | null;
  config?: {
    actions?: string[];
    fieldConstraints?: Record<string, string[] | null>;
  };
  isActive?: boolean;
}
```

---

#### 3.3.6 DELETE /api/systems/:systemId/permissions/:permissionId

**설명**: 권한 삭제

**비즈니스 규칙**:
- 역할이 보유한 권한 삭제 불가 (먼저 역할에서 제거)

---

### 3.4 User Extension API (§5.5)

#### 3.4.1 GET /api/users/:userId/role-groups

**설명**: 사용자가 할당받은 역할그룹 목록 (시스템별)

**쿼리 파라미터**:
```typescript
interface UserRoleGroupsQuery {
  systemId?: string;  // 특정 시스템만 조회
}
```

**응답**:
```typescript
interface UserRoleGroupsResponse {
  data: {
    roleGroupId: number;
    systemId: string;
    systemName: string;
    roleGroupCd: string;
    name: string;
    assignedAt: ISO8601;
    roles: {
      roleId: number;
      name: string;
      permissionCount: number;
    }[];
  }[];
}
```

---

#### 3.4.2 POST /api/users/:userId/role-groups

**설명**: 사용자에 역할그룹 할당

**요청**:
```typescript
interface AssignUserRoleGroupRequest {
  roleGroupId: number;
  systemId: string;
}
```

**응답 (201 Created)**:
```typescript
interface AssignUserRoleGroupResponse {
  data: {
    userId: string;
    roleGroupId: number;
    systemId: string;
    assignedAt: ISO8601;
  };
}
```

**비즈니스 규칙**:
- 같은 사용자/역할그룹 중복 할당 불가

---

#### 3.4.3 DELETE /api/users/:userId/role-groups/:roleGroupId

**설명**: 사용자로부터 역할그룹 제거

**응답 (204 No Content)**

---

#### 3.4.4 GET /api/users/:userId/systems

**설명**: 사용자가 접근 가능한 시스템 목록 (UserSystemMenuSet 기반)

**응답**:
```typescript
interface UserSystemsResponse {
  data: {
    systemId: string;
    systemName: string;
    domain: string;
    menuSetId: number;
    menuSetName: string;
    roleGroupIds: number[];
    accessSince: ISO8601;
  }[];
}
```

---

#### 3.4.5 POST /api/users/:userId/systems

**설명**: 사용자에 시스템 접근 권한 할당 (기본 MenuSet 자동 지정)

**요청**:
```typescript
interface AssignUserSystemRequest {
  systemId: string;
  menuSetId?: number;  // 생략 시 해당 시스템의 기본(isDefault=true) MenuSet
}
```

**응답 (201 Created)**:
```typescript
interface AssignUserSystemResponse {
  data: {
    userId: string;
    systemId: string;
    menuSetId: number;
  };
}
```

---

#### 3.4.6 PUT /api/users/:userId/systems/:systemId

**설명**: 사용자의 시스템 메뉴세트 변경

**요청**:
```typescript
interface UpdateUserSystemMenuSetRequest {
  menuSetId: number;
}
```

**응답 (200 OK)**:
```typescript
interface UpdateUserSystemMenuSetResponse {
  data: {
    userId: string;
    systemId: string;
    menuSetId: number;
    updatedAt: ISO8601;
  };
}
```

---

#### 3.4.7 DELETE /api/users/:userId/systems/:systemId

**설명**: 사용자로부터 시스템 접근 제거

**응답 (204 No Content)**

**비즈니스 규칙**:
- 사용자가 한 시스템의 마지막 접근 권한 제거 시:
  - 해당 시스템의 역할그룹도 자동 제거 (선택)
  - 또는 경고 반환 후 사용자 확인

---

#### 3.4.8 GET /api/users/:userId/permissions

**설명**: 사용자의 병합 권한 조회 (모든 시스템, 모든 역할그룹)

**쿼리 파라미터**:
```typescript
interface UserPermissionsQuery {
  systemId?: string;  // 특정 시스템만
  menuId?: number;    // 특정 메뉴만
}
```

**응답**:
```typescript
interface UserPermissionsResponse {
  data: {
    systemId: string;
    systemName: string;
    menus: {
      menuId: number;
      menuName: string;
      permissions: {
        permissionId: number;
        permissionCd: string;
        name: string;
        config: {
          actions: string[];  // 병합된 액션 (합집합)
          fieldConstraints: Record<string, string[] | null>;  // 병합된 제약
        };
      }[];
    }[];
  }[];
}
```

**병합 규칙** (§4.5 참조):
- 같은 menuId의 여러 Permission:
  - actions: 합집합 (Union)
  - fieldConstraints: 각 필드별로 값 합집합
  - 한쪽에만 있는 fieldConstraints: 제약 해제 (전체 허용)

---

### 3.5 History API (§5.6)

#### 3.5.1 GET /api/users/:userId/permissions/history

**설명**: 사용자의 권한 변경 이력 조회 (특정 시점 기준)

**쿼리 파라미터**:
```typescript
interface UserPermissionsHistoryQuery {
  asOf?: ISO8601;        // 기준 시점 (기본: 현재)
  systemId?: string;     // 특정 시스템만
  limit?: number;        // 기본: 50
}
```

**동작**:
- asOf 파라미터를 사용하여 특정 시점의 사용자 권한 상태 재현
- WHERE validFrom <= asOf AND (validTo IS NULL OR validTo > asOf)

**응답**:
```typescript
interface UserPermissionsHistoryResponse {
  data: {
    asOf: ISO8601;
    systemId: string;
    menus: {
      menuId: number;
      permissions: {
        permissionId: number;
        name: string;
        config: { /* ... */ };
      }[];
    }[];
  };
}
```

---

#### 3.5.2 GET /api/permissions/:permissionId/history

**설명**: 권한의 변경 이력 조회 (시간 범위 필터)

**쿼리 파라미터**:
```typescript
interface PermissionHistoryQuery {
  from?: ISO8601;
  to?: ISO8601;
  changeType?: "CREATE" | "UPDATE" | "DELETE";
  limit?: number;
}
```

**응답**:
```typescript
interface PermissionHistoryResponse {
  data: {
    historyId: number;
    permissionId: number;
    name: string;
    config: { /* ... */ };
    changeType: string;
    changedBy?: number;     // 변경한 사용자 (관리자)
    validFrom: ISO8601;
    validTo?: ISO8601;      // null = 현재 유효
  }[];
}
```

---

#### 3.5.3 GET /api/users/:userId/role-groups/history

**설명**: 사용자의 역할그룹 할당 이력 조회

**쿼리 파라미터**:
```typescript
interface UserRoleGroupHistoryQuery {
  from?: ISO8601;
  to?: ISO8601;
  changeType?: "ASSIGN" | "REVOKE";
  limit?: number;
}
```

**응답**:
```typescript
interface UserRoleGroupHistoryResponse {
  data: {
    historyId: number;
    userId: string;
    roleGroupId: number;
    roleGroupName: string;
    systemId: string;
    changeType: string;     // ASSIGN or REVOKE
    changedBy?: number;
    validFrom: ISO8601;
    validTo?: ISO8601;
  }[];
}
```

---

## 4. 공통 응답 형식

### 4.1 성공 응답

```typescript
interface SuccessResponse<T> {
  data: T;
  meta?: {
    timestamp: ISO8601;
    version: string;
  };
}
```

### 4.2 오류 응답

```typescript
interface ErrorResponse {
  error: {
    code: string;           // 에러 코드 (예: INVALID_INPUT, NOT_FOUND)
    message: string;        // 사용자 메시지
    details?: Record<string, string[]>;  // 필드 유효성 에러
    timestamp: ISO8601;
  };
}
```

**표준 HTTP 상태 코드**:
- 200 OK: 성공
- 201 Created: 리소스 생성 성공
- 204 No Content: 삭제 성공
- 400 Bad Request: 유효성 검사 실패
- 403 Forbidden: 권한 없음
- 404 Not Found: 리소스 없음
- 409 Conflict: 중복 또는 충돌
- 500 Internal Server Error: 서버 오류

---

## 5. 요청/응답 검증 규칙

### 5.1 입력 유효성 검사

| 필드 | 규칙 | 에러 메시지 |
|------|------|-----------|
| roleGroupCd | 필수, 30자 이하, 영문/숫자/_ | "역할그룹 코드는 필수이며 30자 이하여야 합니다" |
| roleCd | 필수, 30자 이하, 영문/숫자/_ | "역할 코드는 필수이며 30자 이하여야 합니다" |
| permissionCd | 필수, 50자 이하, 영문/숫자/_ | "권한 코드는 필수이며 50자 이하여야 합니다" |
| name | 필수, 100자 이하 | "이름은 필수이며 100자 이하여야 합니다" |
| config.actions | 필수, 배열, 정의된 액션만 | "유효하지 않은 액션입니다" |
| parentRoleId | 순환 참조 불가 | "순환 참조가 감지되었습니다" |

### 5.2 권한 검사

- **시스템 접근**: 사용자가 systemId 접근 권한 필요
- **역할 관리**: 시스템 관리자(admin) 역할 필요
- **권한 관리**: 시스템 관리자 역할 필요
- **자기 권한 조회**: 누구나 가능
- **타인 권한 조회**: 관리자만 가능

---

## 6. 비즈니스 규칙

### 6.1 RoleGroup 관련

| ID | 규칙 | 위반 시 처리 |
|----|------|-----------|
| RG-01 | 한 역할그룹에 같은 역할 중복 할당 불가 | 무시 (재할당 시) |
| RG-02 | 미할당 역할 해제 시도 | 무시 (에러 아님) |
| RG-03 | 사용자가 할당된 역할그룹 삭제 | 400 Bad Request 또는 자동 제거 |

### 6.2 Role 관련

| ID | 규칙 | 위반 시 처리 |
|----|------|-----------|
| R-01 | 역할 코드(roleCd) 중복 불가 | 409 Conflict |
| R-02 | 상위-하위 역할 순환 참조 방지 | 400 Bad Request |
| R-03 | 시스템 역할(isSystem=true) 삭제 불가 | 403 Forbidden |
| R-04 | 권한 할당된 역할 삭제 불가 | 400 Bad Request |

### 6.3 Permission 관련

| ID | 규칙 | 위반 시 처리 |
|----|------|-----------|
| P-01 | 권한 코드(permissionCd) 중복 불가 | 409 Conflict |
| P-02 | menuId 제공 시 같은 systemId 확인 | 400 Bad Request |
| P-03 | 역할이 보유한 권한 삭제 불가 | 400 Bad Request |
| P-04 | actions 배열 정의된 액션만 허용 | 400 Bad Request |

### 6.4 User 할당 관련

| ID | 규칙 | 위반 시 처리 |
|----|------|-----------|
| U-01 | 사용자-역할그룹 중복 할당 불가 | 409 Conflict |
| U-02 | 사용자-시스템 중복 할당 불가 | 409 Conflict |
| U-03 | MenuSet은 systemId 같아야 함 | 400 Bad Request |
| U-04 | 미할당 역할그룹 제거 | 무시 또는 204 반환 |

---

## 7. 에러 코드 정의

```typescript
enum ApiErrorCode {
  // 입력 유효성
  INVALID_INPUT = "INVALID_INPUT",
  DUPLICATE_CODE = "DUPLICATE_CODE",
  CIRCULAR_REFERENCE = "CIRCULAR_REFERENCE",

  // 인증/권한
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",

  // 리소스
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",

  // 비즈니스 규칙
  INVALID_OPERATION = "INVALID_OPERATION",
  SYSTEM_ROLE_CANNOT_DELETE = "SYSTEM_ROLE_CANNOT_DELETE",
  ACTIVE_RELATIONSHIPS_EXIST = "ACTIVE_RELATIONSHIPS_EXIST",

  // 시스템
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
}
```

---

## 8. 트랜잭션 및 일관성

### 8.1 원자성 (Atomicity)

- **할당/해제 작업**: 다수의 roleId 동시 처리 시
  - 일부 실패 가능: `partial success` 패턴 사용
  - 응답에 성공/실패 목록 분리 반환

```typescript
interface BulkAssignResponse {
  data: {
    assigned: number[];     // 성공
    revoked: number[];
    errors: {               // 실패
      id: number;
      reason: string;
    }[];
  };
}
```

### 8.2 일관성 (Consistency)

- **순환 참조 검사**: parentRoleId 설정 시 즉시 검증
- **Foreign Key 무결성**: 데이터베이스 레벨에서 강제

### 8.3 이력 기록

- **모든 변경**: SystemHistory, UserHistory, etc. 자동 기록
- **이력 테이블 구조**: validFrom, validTo (SCD Type 2)

---

## 9. 페이지네이션

**기본값**:
- page: 1
- limit: 20
- 최대 limit: 100

**응답 형식**:
```typescript
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

**커서 기반 페이지네이션 (선택 사항)**:
```typescript
interface CursorPaginationQuery {
  cursor?: string;  // Base64 인코딩 (id:timestamp)
  limit?: number;
}
```

---

## 10. 문서 작성 체크리스트

### 10.1 설계 완료 확인

- [x] API 엔드포인트 목록 정의
- [x] 요청/응답 스키마 정의
- [x] 비즈니스 규칙 정의
- [x] 에러 처리 정의
- [x] 검증 규칙 정의
- [x] 권한 검사 규칙 정의

### 10.2 연관 문서 작성

- [ ] 추적성 매트릭스 작성 (→ `025-traceability-matrix.md`)
- [ ] 테스트 명세서 작성 (→ `026-test-specification.md`)

---

## 11. 구현 범위

### 11.1 영향받는 영역

| 영역 | 변경 내용 | 영향도 |
|------|----------|--------|
| app/api/systems/[systemId]/role-groups/route.ts | RoleGroup CRUD API | 높음 |
| app/api/systems/[systemId]/roles/route.ts | Role CRUD API | 높음 |
| app/api/systems/[systemId]/permissions/route.ts | Permission CRUD API | 높음 |
| app/api/users/[userId]/role-groups/route.ts | User-RoleGroup 매핑 API | 중간 |
| app/api/users/[userId]/systems/route.ts | User-System 매핑 API | 중간 |
| lib/auth/permissions.ts | 권한 병합 로직 | 높음 |
| lib/db/prisma.ts | 이력 기록 미들웨어 | 중간 |

### 11.2 의존성

| 의존 항목 | 이유 | 상태 |
|----------|------|------|
| Prisma Schema (System, RoleGroup, Role, Permission) | ORM 모델 | ✓ 완료 |
| Menu API (TSK-01-02) | Permission.menuId FK | [ ] Todo |
| Auth.js (기존) | API 인증 | ✓ 완료 |

---

## 12. 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-27 | Claude | 최초 작성 |

---

## 부록 A. API 요청 예시

### 예시 1: RoleGroup 생성

```bash
curl -X POST http://localhost:3000/api/systems/mes-factory1/role-groups \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "roleGroupCd": "PRODUCTION_ADMIN",
    "name": "생산 관리자 그룹",
    "description": "공장1 생산 관리 업무 담당자",
    "roleIds": [1, 2, 3]
  }'
```

### 예시 2: Permission 생성 (fieldConstraints 포함)

```bash
curl -X POST http://localhost:3000/api/systems/mes-factory1/permissions \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionCd": "PROC_VIEW",
    "name": "공정 실적 조회",
    "menuId": 101,
    "config": {
      "actions": ["READ", "EXPORT"],
      "fieldConstraints": {
        "PROC_CD": ["2CGL", "3CGL"],
        "LINE_CD": null
      }
    }
  }'
```

### 예시 3: User 권한 병합 조회

```bash
curl -X GET "http://localhost:3000/api/users/41000132/permissions?systemId=mes-factory1" \
  -H "Authorization: Bearer {token}"
```

응답 예시: fieldConstraints 병합
```json
{
  "data": [
    {
      "systemId": "mes-factory1",
      "menus": [
        {
          "menuId": 101,
          "menuName": "생산 관리",
          "permissions": [
            {
              "permissionId": 1,
              "config": {
                "actions": ["READ", "CREATE", "UPDATE", "EXPORT"],
                "fieldConstraints": {
                  "PROC_CD": ["2CGL", "3CGL"],
                  "LINE_CD": null
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 부록 B. 마이그레이션 가이드 (auth-system → RBAC 재설계)

### 기존 UserRole → 새로운 UserRoleGroup

1. 기존 User-Role 매핑 읽기
2. 각 Role을 기본 RoleGroup 생성 (예: "DEFAULT_[ROLE_CD]")
3. User-RoleGroup 매핑 생성
4. UserRole 테이블 삭제

### 기존 RoleMenu → 새로운 Permission.menuId

1. 기존 RoleMenu 읽기
2. 각 Role-Menu 조합에 대해 Permission 생성
3. Permission의 menuId FK 설정
4. RoleMenu 테이블 삭제

---
