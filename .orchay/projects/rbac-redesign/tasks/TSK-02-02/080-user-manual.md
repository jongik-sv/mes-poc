# 사용자 매뉴얼 (080-manual.md)

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-02 |
| Task명 | RoleGroup / Role / Permission CRUD + 할당 API |
| 대상 기능 | 역할그룹, 사용자 할당, 이력 API (개발자용) |
| 작성일 | 2026-01-27 |
| 버전 | 1.0.0 |

---

# 사용자 매뉴얼: RoleGroup / User Extension API

---

## 1. 개요

역할그룹 관리, 사용자 역할/시스템 할당, 최종 권한 조회, 변경 이력 API.

### 1.1 API 목록

| Endpoint | 설명 |
|----------|------|
| `/api/role-groups` | 역할그룹 CRUD |
| `/api/role-groups/:id/roles` | 역할그룹에 역할 할당 |
| `/api/users/:id/role-groups` | 사용자 역할그룹 관리 |
| `/api/users/:id/systems` | 사용자 시스템 접근 관리 |
| `/api/users/:id/permissions` | 최종 권한 조회 (계산됨) |
| `/api/users/:id/permissions/history?asOf=` | 특정 시점 권한 |
| `/api/users/:id/role-groups/history?from=&to=` | 역할그룹 할당 이력 |
| `/api/permissions/:id/history?from=&to=` | 권한 변경 이력 |

---

## 2. 시나리오별 사용 가이드

### 시나리오 1: 역할그룹 생성 및 역할 할당

**Step 1.** POST `/api/role-groups`
```json
{ "systemId": "mes-factory1", "roleGroupCd": "QC_GROUP", "name": "품질팀 그룹" }
```

**Step 2.** POST `/api/role-groups/1/roles`
```json
{ "roleIds": [3, 5, 7] }
```

> **주의**: 역할 할당은 전체 교체 방식입니다.

### 시나리오 2: 사용자에게 역할그룹 할당

**Step 1.** POST `/api/users/admin001/role-groups`
```json
{ "roleGroupIds": [1, 3] }
```

### 시나리오 3: 사용자 시스템 접근 설정

**Step 1.** POST `/api/users/admin001/systems`
```json
{ "systemId": "mes-factory1", "menuSetId": 1 }
```

**Step 2.** 메뉴셋 변경: PUT `/api/users/admin001/systems/mes-factory1`
```json
{ "menuSetId": 2 }
```

### 시나리오 4: 사용자 최종 권한 조회

GET `/api/users/admin001/permissions`

```json
{
  "success": true,
  "data": [
    {
      "menuId": 1,
      "menuName": "사용자 관리",
      "permissions": [
        { "permissionId": 1, "permissionCd": "user-mgmt-admin", "actions": ["create","read","update","delete"], "fieldConstraints": null }
      ]
    }
  ]
}
```

### 시나리오 5: 특정 시점의 권한 이력 조회

GET `/api/users/admin001/permissions/history?asOf=2026-01-15T00:00:00Z`

---

## 3. FAQ

### Q1. 역할그룹 삭제 시 사용자 할당은?
- 역할그룹 삭제 시 UserRoleGroup, RoleGroupRole 모두 cascade 삭제됩니다.

### Q2. 권한 병합 규칙은?
- 같은 menuId의 복수 Permission → actions 합집합, fieldConstraints가 한쪽 없으면 제약 해제

---

## 4. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2026-01-27 | 초기 작성 |
