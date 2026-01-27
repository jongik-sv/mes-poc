# TSK-02-02 - 테스트 명세서

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-27

> **목적**: RoleGroup / Role / Permission CRUD API + 할당 API의 단위 테스트, E2E 테스트, 통합 테스트 명세
>
> **참조**: 이 문서는 `010-design.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-02 |
| Task명 | RoleGroup / Role / Permission CRUD + 할당 API |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-27 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 | 도구 |
|------------|------|-------------|------|
| 단위 테스트 | API 엔드포인트, 비즈니스 로직, 유효성 검사 | 85% 이상 | Vitest + Supertest |
| 통합 테스트 | 데이터베이스, 권한 병합 로직 | 80% 이상 | Vitest + @testing-library |
| E2E 테스트 | 전체 워크플로우 (API → 응답) | 100% 시나리오 | Playwright 또는 API 호출 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 DB | SQLite (in-memory) or Postgres test container |
| API 테스트 | Node.js + Supertest (HTTP 테스트) |
| 인증 | Mock JWT 토큰 또는 테스트 계정 |
| 포트 | localhost:3000 (테스트 서버) |
| 타임아웃 | 30초 (기본) |

### 1.3 테스트 우선순위

| 우선순위 | 테스트 영역 | 근거 |
|---------|-----------|------|
| P0 (Critical) | RoleGroup CRUD, Role CRUD, Permission CRUD | 핵심 기능 |
| P0 (Critical) | 권한 병합 로직 | 비즈니스 로직 핵심 |
| P1 (High) | User 할당 API | 사용자 경험 직결 |
| P1 (High) | 유효성 검사, 비즈니스 규칙 | 데이터 무결성 |
| P2 (Medium) | 이력 조회 API | 감사 기능 |
| P3 (Low) | 페이지네이션, 필터링 | 성능/UX |

---

## 2. 단위 테스트 시나리오

### 2.1 RoleGroup CRUD 테스트

#### UT-001: RoleGroup 목록 조회 (기본)

**대상**: `GET /api/systems/:systemId/role-groups`

**테스트 케이스**:
```typescript
describe('RoleGroup CRUD', () => {
  describe('GET /role-groups', () => {
    it('should return paginated list of role groups', async () => {
      const systemId = 'mes-factory1';

      // 사전 데이터 생성
      await seedRoleGroups(systemId, [
        { roleGroupCd: 'ADMIN_GROUP', name: '관리자 그룹' },
        { roleGroupCd: 'USER_GROUP', name: '사용자 그룹' },
      ]);

      const response = await request(app)
        .get(`/api/systems/${systemId}/role-groups`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should filter by isActive', async () => {
      const systemId = 'mes-factory1';

      await seedRoleGroups(systemId, [
        { roleGroupCd: 'ACTIVE', name: 'Active', isActive: true },
        { roleGroupCd: 'INACTIVE', name: 'Inactive', isActive: false },
      ]);

      const response = await request(app)
        .get(`/api/systems/${systemId}/role-groups?isActive=true`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].roleGroupCd).toBe('ACTIVE');
    });

    it('should support search by name', async () => {
      const response = await request(app)
        .get(`/api/systems/mes-factory1/role-groups?search=admin`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.every(rg =>
        rg.name.toLowerCase().includes('admin') ||
        rg.roleGroupCd.toLowerCase().includes('admin')
      )).toBe(true);
    });
  });
});
```

**검증 포인트**:
- [x] 상태 코드 200
- [x] pagination 메타데이터 포함
- [x] isActive 필터 동작
- [x] search 필터 동작
- [x] 정렬(sortBy, sortOrder) 동작

---

#### UT-003: RoleGroup 생성 (유효한 데이터)

**대상**: `POST /api/systems/:systemId/role-groups`

```typescript
it('should create role group with valid data', async () => {
  const payload = {
    roleGroupCd: 'NEW_GROUP',
    name: '새 역할그룹',
    description: '설명',
    roleIds: [1, 2],  // 기존 역할 할당
  };

  const response = await request(app)
    .post('/api/systems/mes-factory1/role-groups')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(payload)
    .expect(201);

  expect(response.body.data).toMatchObject({
    roleGroupCd: 'NEW_GROUP',
    name: '새 역할그룹',
    description: '설명',
    isActive: true,
  });
  expect(response.body.data.roleGroupId).toBeDefined();
});
```

**검증 포인트**:
- [x] 상태 코드 201
- [x] 응답에 생성된 역할그룹 포함
- [x] roleIds 전달 시 역할 할당
- [x] 기본값 설정 (isActive=true)

#### UT-003a: RoleGroup 생성 (중복 코드)

```typescript
it('should return 409 for duplicate roleGroupCd', async () => {
  const payload = {
    roleGroupCd: 'ADMIN_GROUP',  // 이미 존재
    name: '관리자 그룹',
  };

  const response = await request(app)
    .post('/api/systems/mes-factory1/role-groups')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(payload)
    .expect(409);

  expect(response.body.error.code).toBe('DUPLICATE_CODE');
});
```

---

#### UT-004: RoleGroup 수정

**대상**: `PUT /api/systems/:systemId/role-groups/:roleGroupId`

```typescript
it('should update role group', async () => {
  const roleGroupId = await createRoleGroup('mes-factory1', {
    roleGroupCd: 'TEST',
    name: '원래 이름',
  });

  const response = await request(app)
    .put(`/api/systems/mes-factory1/role-groups/${roleGroupId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: '변경된 이름',
      isActive: false,
    })
    .expect(200);

  expect(response.body.data.name).toBe('변경된 이름');
  expect(response.body.data.isActive).toBe(false);
});
```

---

#### UT-005: RoleGroup 삭제

```typescript
it('should delete role group', async () => {
  const roleGroupId = await createRoleGroup('mes-factory1', { /* ... */ });

  await request(app)
    .delete(`/api/systems/mes-factory1/role-groups/${roleGroupId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(204);

  // 삭제 확인
  const response = await request(app)
    .get(`/api/systems/mes-factory1/role-groups/${roleGroupId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  expect(response.status).toBe(404);
});
```

#### UT-005a: RoleGroup 삭제 (사용자 할당)

```typescript
it('should not delete role group with active users', async () => {
  const roleGroupId = await createRoleGroup('mes-factory1', { /* ... */ });

  // 사용자 할당
  await assignUserRoleGroup('user123', roleGroupId);

  const response = await request(app)
    .delete(`/api/systems/mes-factory1/role-groups/${roleGroupId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(400);

  expect(response.body.error.code).toBe('ACTIVE_RELATIONSHIPS_EXIST');
});
```

---

#### UT-006~008: RoleGroup ↔ Role 할당 테스트

```typescript
it('should get roles in role group', async () => {
  const roleGroupId = await createRoleGroup('mes-factory1', { /* ... */ });
  const roleId = await createRole('mes-factory1', { /* ... */ });

  // 역할 할당
  await assignRolesToRoleGroup(roleGroupId, [roleId]);

  const response = await request(app)
    .get(`/api/systems/mes-factory1/role-groups/${roleGroupId}/roles`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);

  expect(response.body.data).toHaveLength(1);
  expect(response.body.data[0].roleId).toBe(roleId);
});

it('should assign roles to role group', async () => {
  const roleGroupId = await createRoleGroup('mes-factory1', { /* ... */ });
  const roleIds = [1, 2, 3];

  const response = await request(app)
    .post(`/api/systems/mes-factory1/role-groups/${roleGroupId}/roles`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      action: 'assign',
      roleIds,
    })
    .expect(200);

  expect(response.body.data.assigned).toEqual(roleIds);
  expect(response.body.data.revoked).toEqual([]);
});

it('should revoke roles from role group', async () => {
  const roleGroupId = await createRoleGroup('mes-factory1', { /* ... */ });
  const roleId = 1;

  await assignRolesToRoleGroup(roleGroupId, [roleId]);

  const response = await request(app)
    .post(`/api/systems/mes-factory1/role-groups/${roleGroupId}/roles`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      action: 'revoke',
      roleIds: [roleId],
    })
    .expect(200);

  expect(response.body.data.revoked).toContain(roleId);
});
```

#### UT-008a: 역할 할당 (다른 시스템)

```typescript
it('should not assign roles from different system', async () => {
  const roleGroupId = await createRoleGroup('mes-factory1', { /* ... */ });
  const otherSystemRoleId = await createRole('mes-factory2', { /* ... */ });

  const response = await request(app)
    .post(`/api/systems/mes-factory1/role-groups/${roleGroupId}/roles`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      action: 'assign',
      roleIds: [otherSystemRoleId],
    })
    .expect(400);

  expect(response.body.error.code).toBe('INVALID_OPERATION');
});
```

---

### 2.2 Role CRUD 테스트

#### UT-009~013: Role 목록 및 생성

```typescript
describe('Role CRUD', () => {
  describe('GET /roles', () => {
    it('should return flat list of roles', async () => {
      await seedRoles('mes-factory1', [
        { roleCd: 'ADMIN', name: '관리자', level: 0 },
        { roleCd: 'USER', name: '사용자', level: 0 },
      ]);

      const response = await request(app)
        .get('/api/systems/mes-factory1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].level).toBeDefined();
    });

    it('should return hierarchical structure with includeHierarchy=true', async () => {
      const adminRoleId = await createRole('mes-factory1', {
        roleCd: 'ADMIN',
        name: '관리자',
      });

      await createRole('mes-factory1', {
        roleCd: 'ADMIN_SUB',
        name: '관리자 보조',
        parentRoleId: adminRoleId,
      });

      const response = await request(app)
        .get('/api/systems/mes-factory1/roles?includeHierarchy=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const adminRole = response.body.data.find(r => r.roleCd === 'ADMIN');
      expect(adminRole.children).toBeDefined();
      expect(adminRole.children.length).toBeGreaterThan(0);
    });
  });

  describe('POST /roles', () => {
    it('should create role without parent', async () => {
      const response = await request(app)
        .post('/api/systems/mes-factory1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roleCd: 'NEW_ROLE',
          name: '새 역할',
          description: '설명',
        })
        .expect(201);

      expect(response.body.data).toMatchObject({
        roleCd: 'NEW_ROLE',
        level: 0,
        parentRoleId: null,
      });
    });

    it('should create role with parent (level auto-calculate)', async () => {
      const parentRoleId = await createRole('mes-factory1', {
        roleCd: 'PARENT',
        name: '상위 역할',
      });

      const response = await request(app)
        .post('/api/systems/mes-factory1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roleCd: 'CHILD',
          name: '하위 역할',
          parentRoleId,
        })
        .expect(201);

      expect(response.body.data.level).toBe(1);
      expect(response.body.data.parentRoleId).toBe(parentRoleId);
    });
  });
});
```

#### UT-014: Role 수정 (순환 참조 방지)

```typescript
it('should update role without circular reference', async () => {
  const roleId = await createRole('mes-factory1', {
    roleCd: 'ROLE1',
    name: '역할 1',
  });

  const childRoleId = await createRole('mes-factory1', {
    roleCd: 'ROLE2',
    name: '역할 2',
    parentRoleId: roleId,
  });

  // 순환 참조 시도: child를 parent로 설정
  const response = await request(app)
    .put(`/api/systems/mes-factory1/roles/${roleId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      parentRoleId: childRoleId,
    })
    .expect(400);

  expect(response.body.error.code).toBe('CIRCULAR_REFERENCE');
});
```

#### UT-015: Role parentRoleId 변경 시 level 재계산

```typescript
it('should recalculate level when parentRoleId changes', async () => {
  const parent1 = await createRole('mes-factory1', { /* ... */ });
  const parent2 = await createRole('mes-factory1', {
    roleCd: 'PARENT2',
    parentRoleId: parent1,  // level = 1
  });

  const child = await createRole('mes-factory1', {
    roleCd: 'CHILD',
    parentRoleId: parent1,  // level = 1
  });

  const response = await request(app)
    .put(`/api/systems/mes-factory1/roles/${child}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      parentRoleId: parent2,  // level 변경: 1 → 2
    })
    .expect(200);

  expect(response.body.data.level).toBe(2);
});
```

#### UT-016a: 시스템 역할 삭제 불가

```typescript
it('should not delete system role', async () => {
  const systemRoleId = await createRole('mes-factory1', {
    roleCd: 'SYSTEM_ROLE',
    isSystem: true,
  });

  const response = await request(app)
    .delete(`/api/systems/mes-factory1/roles/${systemRoleId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(403);

  expect(response.body.error.code).toBe('SYSTEM_ROLE_CANNOT_DELETE');
});
```

---

### 2.3 Permission CRUD 테스트

#### UT-018~022: Permission 테스트

```typescript
describe('Permission CRUD', () => {
  describe('POST /permissions', () => {
    it('should create permission with actions and fieldConstraints', async () => {
      const payload = {
        permissionCd: 'PROD_VIEW',
        name: '생산 실적 조회',
        menuId: 101,
        config: {
          actions: ['READ', 'EXPORT'],
          fieldConstraints: {
            PROC_CD: ['2CGL', '3CGL'],
            LINE_CD: null,  // 제약 없음
          },
        },
      };

      const response = await request(app)
        .post('/api/systems/mes-factory1/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(201);

      expect(response.body.data.config).toEqual(payload.config);
    });

    it('should reject invalid actions', async () => {
      const payload = {
        permissionCd: 'INVALID',
        name: 'Test',
        config: {
          actions: ['INVALID_ACTION'],  // 정의되지 않은 액션
        },
      };

      const response = await request(app)
        .post('/api/systems/mes-factory1/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(400);

      expect(response.body.error.details.actions).toBeDefined();
    });
  });

  describe('PUT /permissions', () => {
    it('should update permission config', async () => {
      const permissionId = await createPermission('mes-factory1', { /* ... */ });

      const response = await request(app)
        .put(`/api/systems/mes-factory1/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          config: {
            actions: ['READ', 'UPDATE'],
            fieldConstraints: { PROC_CD: ['4CGL'] },
          },
        })
        .expect(200);

      expect(response.body.data.config.actions).toContain('UPDATE');
    });
  });

  describe('DELETE /permissions', () => {
    it('should not delete permission with active roles', async () => {
      const permissionId = await createPermission('mes-factory1', { /* ... */ });
      const roleId = await createRole('mes-factory1', { /* ... */ });

      await assignPermissionToRole(roleId, permissionId);

      const response = await request(app)
        .delete(`/api/systems/mes-factory1/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.error.code).toBe('ACTIVE_RELATIONSHIPS_EXIST');
    });
  });
});
```

---

### 2.4 User 할당 테스트

#### UT-024~031: User 역할그룹, 시스템 할당

```typescript
describe('User Assignments', () => {
  describe('POST /users/:userId/role-groups', () => {
    it('should assign role group to user', async () => {
      const userId = 'user123';
      const roleGroupId = await createRoleGroup('mes-factory1', { /* ... */ });

      const response = await request(app)
        .post(`/api/users/${userId}/role-groups`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          roleGroupId,
          systemId: 'mes-factory1',
        })
        .expect(201);

      expect(response.body.data).toMatchObject({
        userId,
        roleGroupId,
        systemId: 'mes-factory1',
      });
    });

    it('should not allow duplicate assignment', async () => {
      const userId = 'user123';
      const roleGroupId = await createRoleGroup('mes-factory1', { /* ... */ });

      // 첫 번째 할당
      await assignUserRoleGroup(userId, roleGroupId);

      // 두 번째 할당 시도
      const response = await request(app)
        .post(`/api/users/${userId}/role-groups`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          roleGroupId,
          systemId: 'mes-factory1',
        })
        .expect(409);

      expect(response.body.error.code).toBe('ALREADY_EXISTS');
    });
  });

  describe('POST /users/:userId/systems', () => {
    it('should assign system to user with default menu set', async () => {
      const userId = 'user123';
      const systemId = 'mes-factory1';

      const response = await request(app)
        .post(`/api/users/${userId}/systems`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          systemId,
          // menuSetId 생략 → 기본 MenuSet 자동 지정
        })
        .expect(201);

      expect(response.body.data).toMatchObject({
        userId,
        systemId,
        menuSetId: expect.any(Number),
      });
    });
  });

  describe('PUT /users/:userId/systems/:systemId', () => {
    it('should update menu set for user system', async () => {
      const userId = 'user123';
      const systemId = 'mes-factory1';
      const newMenuSetId = 2;

      await assignUserSystem(userId, systemId);

      const response = await request(app)
        .put(`/api/users/${userId}/systems/${systemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          menuSetId: newMenuSetId,
        })
        .expect(200);

      expect(response.body.data.menuSetId).toBe(newMenuSetId);
    });
  });
});
```

---

### 2.5 권한 병합 테스트

#### UT-032~035: 사용자 권한 병합 (핵심 비즈니스 로직)

```typescript
describe('User Permissions Merge', () => {
  it('should merge permissions from multiple role groups', async () => {
    const userId = 'user123';
    const systemId = 'mes-factory1';
    const menuId = 101;

    // Role Group 1: Permission with actions [READ, EXPORT]
    const rg1 = await createRoleGroup(systemId, { /* ... */ });
    const role1 = await createRole(systemId, { /* ... */ });
    const perm1 = await createPermission(systemId, {
      menuId,
      config: {
        actions: ['READ', 'EXPORT'],
        fieldConstraints: { PROC_CD: ['2CGL', '3CGL'] },
      },
    });
    await assignRoleToGroup(rg1, role1);
    await assignPermissionToRole(role1, perm1);

    // Role Group 2: Permission with actions [UPDATE, DELETE]
    const rg2 = await createRoleGroup(systemId, { /* ... */ });
    const role2 = await createRole(systemId, { /* ... */ });
    const perm2 = await createPermission(systemId, {
      menuId,
      config: {
        actions: ['UPDATE', 'DELETE'],
        fieldConstraints: { PROC_CD: ['3CGL', '4CGL'] },
      },
    });
    await assignRoleToGroup(rg2, role2);
    await assignPermissionToRole(role2, perm2);

    // 사용자에 두 Role Group 할당
    await assignUserRoleGroup(userId, rg1);
    await assignUserRoleGroup(userId, rg2);

    const response = await request(app)
      .get(`/api/users/${userId}/permissions?systemId=${systemId}&menuId=${menuId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    const mergedPermission = response.body.data[0].permissions[0];

    // actions: Union [READ, EXPORT, UPDATE, DELETE]
    expect(mergedPermission.config.actions).toEqual(
      expect.arrayContaining(['READ', 'EXPORT', 'UPDATE', 'DELETE'])
    );

    // fieldConstraints: Union of values
    // PROC_CD: [2CGL, 3CGL] ∪ [3CGL, 4CGL] = [2CGL, 3CGL, 4CGL]
    expect(mergedPermission.config.fieldConstraints.PROC_CD).toEqual(
      expect.arrayContaining(['2CGL', '3CGL', '4CGL'])
    );
  });

  it('should handle null fieldConstraints (no restriction)', async () => {
    const userId = 'user123';

    // Permission 1: PROC_CD = [2CGL]
    // Permission 2: PROC_CD = null (모든 값 허용)
    // 결과: PROC_CD = null (한쪽이 null이면 제약 해제)

    const rg1 = await createRoleGroup('mes-factory1', { /* ... */ });
    const role1 = await createRole('mes-factory1', { /* ... */ });
    const perm1 = await createPermission('mes-factory1', {
      config: {
        actions: ['READ'],
        fieldConstraints: { PROC_CD: ['2CGL'] },
      },
    });
    await assignUserRoleGroup(userId, rg1);
    await assignRoleToGroup(rg1, role1);
    await assignPermissionToRole(role1, perm1);

    // 두 번째 권한: PROC_CD = null
    const perm2 = await createPermission('mes-factory1', {
      config: {
        actions: ['READ'],
        fieldConstraints: { PROC_CD: null },
      },
    });
    const role2 = await createRole('mes-factory1', { /* ... */ });
    const rg2 = await createRoleGroup('mes-factory1', { /* ... */ });
    await assignUserRoleGroup(userId, rg2);
    await assignRoleToGroup(rg2, role2);
    await assignPermissionToRole(role2, perm2);

    const response = await request(app)
      .get(`/api/users/${userId}/permissions`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    const mergedPermission = response.body.data[0].permissions[0];

    // PROC_CD = null (제약 해제)
    expect(mergedPermission.config.fieldConstraints.PROC_CD).toBeNull();
  });
});
```

---

### 2.6 이력 조회 테스트

#### UT-036~038: History API

```typescript
describe('History API', () => {
  it('should retrieve permissions at specific point in time', async () => {
    const userId = 'user123';
    const roleGroupId = await createRoleGroup('mes-factory1', { /* ... */ });

    // t=1: 권한 할당
    const perm1 = await createPermission('mes-factory1', {
      permissionCd: 'PERM1',
      config: { actions: ['READ'] },
    });
    const role1 = await createRole('mes-factory1', { /* ... */ });
    await assignRoleToGroup(roleGroupId, role1);
    await assignPermissionToRole(role1, perm1);

    const timestamp1 = new Date().toISOString();

    // t=2: 사용자에 역할그룹 할당
    await assignUserRoleGroup(userId, roleGroupId);

    const response = await request(app)
      .get(`/api/users/${userId}/permissions/history?asOf=${timestamp1}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    // timestamp1에서는 아직 사용자에 역할그룹이 할당되지 않음
    expect(response.body.data.permissions).toHaveLength(0);
  });

  it('should retrieve permission change history with time range', async () => {
    const permissionId = await createPermission('mes-factory1', {
      permissionCd: 'TEST_PERM',
      config: { actions: ['READ'] },
    });

    const dateFrom = new Date('2026-01-01').toISOString();
    const dateTo = new Date('2026-01-31').toISOString();

    const response = await request(app)
      .get(`/api/systems/mes-factory1/permissions/${permissionId}/history?from=${dateFrom}&to=${dateTo}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.every(h =>
      h.changeType === 'CREATE' || h.changeType === 'UPDATE'
    )).toBe(true);
  });
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 E2E 테스트 케이스 목록

| 테스트 ID | 시나리오 | 선행 조건 | 검증 포인트 | 우선순위 |
|-----------|---------|---------|-----------|---------|
| E2E-001 | RoleGroup 목록 조회 | - | 리스트 페이지네이션 | P0 |
| E2E-002 | RoleGroup 생성 | - | 생성 성공, 목록 갱신 | P0 |
| E2E-003 | RoleGroup 수정 | RoleGroup 존재 | 수정 성공 | P1 |
| E2E-004 | RoleGroup 삭제 | RoleGroup 존재 | 삭제 성공, 확인 모달 | P1 |
| E2E-005 | RoleGroup에 역할 할당 | RoleGroup, Role 존재 | 할당 성공 | P0 |
| E2E-006 | RoleGroup에서 역할 해제 | 역할 할당 상태 | 해제 성공 | P1 |
| E2E-007 | Role 목록 조회 (계층 구조) | Role 존재 | 트리 구조 렌더링 | P1 |
| ... | ... | ... | ... | ... |

### 3.2 핵심 E2E 시나리오 상세

#### E2E-001: RoleGroup 목록 조회

```typescript
test.describe('RoleGroup Management - E2E', () => {
  test('should list role groups', async ({ request }) => {
    const response = await request.get(
      '/api/systems/mes-factory1/role-groups',
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      }
    );

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.data).toBeInstanceOf(Array);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.page).toBe(1);
  });
});
```

#### E2E-002: RoleGroup 생성 및 목록 갱신

```typescript
test('should create role group and verify in list', async ({ request }) => {
  // 생성 요청
  const createResponse = await request.post(
    '/api/systems/mes-factory1/role-groups',
    {
      data: {
        roleGroupCd: 'E2E_TEST_GROUP',
        name: 'E2E 테스트 그룹',
        description: 'E2E 테스트용',
      },
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    }
  );

  expect(createResponse.status()).toBe(201);
  const created = await createResponse.json();
  expect(created.data.roleGroupId).toBeDefined();

  // 목록에서 확인
  const listResponse = await request.get(
    '/api/systems/mes-factory1/role-groups',
    {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    }
  );

  const list = await listResponse.json();
  const found = list.data.find(rg => rg.roleGroupCd === 'E2E_TEST_GROUP');
  expect(found).toBeDefined();
  expect(found.name).toBe('E2E 테스트 그룹');
});
```

---

## 4. 통합 테스트 (Integration Test)

### 4.1 권한 병합 로직 통합 테스트

```typescript
describe('Integration: User Permissions Merge Flow', () => {
  it('should calculate merged permissions end-to-end', async () => {
    // 1. 시스템 생성 (또는 기존 사용)
    const systemId = 'mes-factory1';

    // 2. 메뉴 및 권한 생성
    const menuId = await createMenu(systemId, { menuCd: 'PROD' });

    const perm1 = await createPermission(systemId, {
      menuId,
      permissionCd: 'PROD_READ',
      config: {
        actions: ['READ'],
        fieldConstraints: { PROC_CD: ['2CGL'] },
      },
    });

    const perm2 = await createPermission(systemId, {
      menuId,
      permissionCd: 'PROD_EDIT',
      config: {
        actions: ['READ', 'UPDATE'],
        fieldConstraints: { PROC_CD: ['3CGL'] },
      },
    });

    // 3. 역할 생성 및 권한 할당
    const role1 = await createRole(systemId, { roleCd: 'VIEWER' });
    const role2 = await createRole(systemId, { roleCd: 'EDITOR' });

    await assignPermissionToRole(role1, perm1);
    await assignPermissionToRole(role2, perm2);

    // 4. 역할그룹 생성 및 역할 할당
    const rg1 = await createRoleGroup(systemId, { roleGroupCd: 'VIEW_GROUP' });
    const rg2 = await createRoleGroup(systemId, { roleGroupCd: 'EDIT_GROUP' });

    await assignRoleToGroup(rg1, role1);
    await assignRoleToGroup(rg2, role2);

    // 5. 사용자 생성 및 역할그룹 할당
    const userId = await createUser({
      email: 'test@example.com',
      name: 'Test User',
    });

    await assignUserRoleGroup(userId, rg1);
    await assignUserRoleGroup(userId, rg2);

    // 6. 병합 권한 조회
    const mergedPerms = await getUserMergedPermissions(userId, systemId);

    // 7. 검증
    expect(mergedPerms).toHaveLength(1);
    expect(mergedPerms[0].menuId).toBe(menuId);
    expect(mergedPerms[0].config.actions).toEqual(
      expect.arrayContaining(['READ', 'UPDATE'])
    );
    expect(mergedPerms[0].config.fieldConstraints.PROC_CD).toEqual(
      expect.arrayContaining(['2CGL', '3CGL'])
    );
  });
});
```

---

## 5. 테스트 데이터 및 Fixture

### 5.1 테스트 계정

| 계정 ID | 이메일 | 역할 | 목적 |
|--------|--------|------|------|
| admin123 | admin@test.com | system admin | 관리자 기능 테스트 |
| user456 | user@test.com | user | 사용자 기능 테스트 |
| readonly789 | readonly@test.com | readonly | 읽기 권한만 |

### 5.2 Seed 데이터

```typescript
// tests/fixtures/seed-rbac-data.ts
export async function seedRBACTestData(systemId: string) {
  // System (이미 존재한다고 가정)

  // Roles
  const adminRole = await prisma.role.create({
    data: {
      systemId,
      roleCd: 'ADMIN',
      name: '관리자',
      level: 0,
      isSystem: true,
    },
  });

  const viewerRole = await prisma.role.create({
    data: {
      systemId,
      roleCd: 'VIEWER',
      name: '조회자',
      level: 0,
    },
  });

  // RoleGroup
  const adminGroup = await prisma.roleGroup.create({
    data: {
      systemId,
      roleGroupCd: 'ADMIN_GROUP',
      name: '관리자 그룹',
    },
  });

  await prisma.roleGroupRole.create({
    data: {
      roleGroupId: adminGroup.roleGroupId,
      roleId: adminRole.roleId,
    },
  });

  // Menu (Menu API 결과 가정)
  const menu = { menuId: 101, menuName: '생산 관리' };

  // Permissions
  const readPerm = await prisma.permission.create({
    data: {
      systemId,
      permissionCd: 'PROD_READ',
      name: '생산 조회',
      menuId: menu.menuId,
      config: JSON.stringify({
        actions: ['READ'],
        fieldConstraints: { PROC_CD: ['2CGL'] },
      }),
    },
  });

  await prisma.rolePermission.create({
    data: {
      roleId: viewerRole.roleId,
      permissionId: readPerm.permissionId,
    },
  });

  return {
    systemId,
    adminRole,
    viewerRole,
    adminGroup,
    readPerm,
  };
}

export async function cleanupRBACTestData(systemId: string) {
  // 역순으로 삭제
  await prisma.rolePermission.deleteMany({
    where: { role: { systemId } },
  });
  await prisma.roleGroupRole.deleteMany({
    where: { roleGroup: { systemId } },
  });
  await prisma.permission.deleteMany({ where: { systemId } });
  await prisma.roleGroup.deleteMany({ where: { systemId } });
  await prisma.role.deleteMany({ where: { systemId } });
}
```

---

## 6. 에러 케이스 및 엣지 케이스

### 6.1 에러 케이스 테스트

| 에러 케이스 | HTTP 상태 | 에러 코드 | 테스트 ID |
|-----------|---------|---------|---------|
| 중복 코드 | 409 | DUPLICATE_CODE | UT-003a |
| 순환 참조 | 400 | CIRCULAR_REFERENCE | UT-014b |
| 시스템 역할 삭제 | 403 | SYSTEM_ROLE_CANNOT_DELETE | UT-016a |
| 활성 관계 존재 | 400 | ACTIVE_RELATIONSHIPS_EXIST | UT-005a |
| 무효한 액션 | 400 | INVALID_INPUT | UT-020c |

### 6.2 엣지 케이스

| 시나리오 | 검증 포인트 |
|--------|----------|
| 빈 역할그룹 | roleCount = 0 |
| 깊은 계층 (5단계 이상) | level 제한 또는 경고 |
| 매우 긴 fieldConstraints | JSON 크기 제한 검증 |
| 대량 권한 병합 (100+) | 성능, 메모리 사용 |

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 | 현황 |
|------|------|------|------|
| Lines | 85% | 75% | - |
| Branches | 80% | 70% | - |
| Functions | 90% | 80% | - |
| Statements | 85% | 75% | - |

### 7.2 테스트 매트릭스 (FR → UT)

| 기능 | 단위 테스트 | E2E 테스트 | 통합 테스트 |
|------|-----------|-----------|-----------|
| RoleGroup CRUD | UT-001~008 | E2E-001~006 | INT-001 |
| Role CRUD | UT-009~017 | E2E-007~014 | INT-002 |
| Permission CRUD | UT-018~023 | E2E-015~019 | INT-003 |
| User 할당 | UT-024~031 | E2E-020~027 | INT-004 |
| 권한 병합 | UT-032~035 | E2E-028~031 | INT-005 |
| 이력 조회 | UT-036~038 | E2E-032~034 | - |

---

## 8. 성능 테스트 (Non-Functional)

### 8.1 응답 시간 목표

| 엔드포인트 | 목표 응답 시간 | 조건 |
|----------|--------------|------|
| GET /role-groups | < 100ms | 1000개 항목, 페이지네이션 |
| POST /role-groups | < 200ms | 역할 할당 포함 |
| GET /users/:id/permissions | < 300ms | 권한 병합 포함 |
| GET /history?asOf= | < 500ms | 시간 범위 필터 |

### 8.2 부하 테스트

```typescript
describe('Performance Tests', () => {
  it('should handle 1000 role groups list request < 100ms', async () => {
    // 1000개 역할그룹 생성
    for (let i = 0; i < 1000; i++) {
      await createRoleGroup('mes-factory1', {
        roleGroupCd: `RG_${i}`,
        name: `Role Group ${i}`,
      });
    }

    const start = Date.now();
    const response = await request(app)
      .get('/api/systems/mes-factory1/role-groups?limit=20')
      .set('Authorization', `Bearer ${adminToken}`);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
    expect(response.status).toBe(200);
  });
});
```

---

## 9. 테스트 실행 및 CI/CD

### 9.1 테스트 스크립트

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run --include='**/*.unit.test.ts'",
    "test:integration": "vitest run --include='**/*.integration.test.ts'",
    "test:e2e": "playwright test",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

### 9.2 GitHub Actions 예시

```yaml
name: RBAC API Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit -- --coverage

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
```

---

## 10. 체크리스트

- [ ] 단위 테스트 모두 작성 및 실행
- [ ] 통합 테스트 작성 및 실행
- [ ] E2E 테스트 작성 및 실행
- [ ] 커버리지 목표 달성 (85% 이상)
- [ ] 성능 테스트 통과
- [ ] CI/CD 파이프라인 설정
- [ ] 테스트 문서 최종 검증

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-27 | Claude | 최초 작성 |

---
