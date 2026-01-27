# 사용자 매뉴얼 (080-manual.md)

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-01-01 |
| Task명 | Prisma 스키마 확장 및 마이그레이션 |
| 대상 기능 | 데이터베이스 스키마 (개발자용) |
| 작성일 | 2026-01-27 |
| 버전 | 1.0.0 |

---

# 사용자 매뉴얼: Prisma 스키마 확장

**버전:** 1.0.0 — **최종 수정일:** 2026-01-27

---

## 1. 개요

멀티 테넌트 + RoleGroup 기반 RBAC 지원을 위해 Prisma 스키마를 전면 재작성. 개발자가 새 스키마 구조를 이해하고 활용하기 위한 가이드.

### 1.1 스키마 구조

```
System (String PK)
├── MenuSet → MenuSetMenu → Menu (category path)
├── RoleGroup → RoleGroupRole → Role (hierarchy)
├── Role → RolePermission → Permission (config JSON + menuId)
└── User
    ├── UserRoleGroup → RoleGroup
    └── UserSystemMenuSet → MenuSet
```

### 1.2 주요 변경 요약

| 항목 | 이전 | 현재 |
|------|------|------|
| System PK | Int (autoincrement) | String (`"mes-factory1"`) |
| User PK | Int (autoincrement) | String (사번 `"41000132"`) |
| Menu 계층 | parentId self-ref | `category: "조업관리/생산실적"` |
| Permission 정의 | type/resource/action | `config: '{"actions":["read","create"]}'` |
| 역할 할당 | UserRole (직접) | UserRoleGroup → RoleGroup → Role |
| 메뉴 접근 | RoleMenu | Permission.menuId + MenuSet |

---

## 2. 시나리오별 사용 가이드

### 시나리오 1: 새 시스템 추가하기

**목표**: 새 공장 시스템을 DB에 등록

**Step 1.** `prisma/seed.ts`에서 시스템 생성 코드 추가

```typescript
await prisma.system.create({
  data: {
    systemId: 'mes-factory2',
    name: '공장2 MES',
    domain: 'factory2.mes.com',
  },
})
```

**Step 2.** `pnpm prisma db seed` 실행

### 시나리오 2: 새 역할그룹 + 역할 할당하기

**목표**: 사용자에게 역할그룹을 통해 역할을 할당

**Step 1.** RoleGroup 생성
```typescript
const rg = await prisma.roleGroup.create({
  data: { systemId: 'mes-factory1', roleGroupCd: 'QC_GROUP', name: '품질팀 그룹' },
})
```

**Step 2.** Role을 RoleGroup에 할당
```typescript
await prisma.roleGroupRole.create({
  data: { roleGroupId: rg.roleGroupId, roleId: targetRoleId },
})
```

**Step 3.** User에 RoleGroup 할당
```typescript
await prisma.userRoleGroup.create({
  data: { userId: '41000132', roleGroupId: rg.roleGroupId },
})
```

### 시나리오 3: Permission config JSON 작성하기

**목표**: 필드 수준 접근 제어를 포함한 권한 정의

```typescript
await prisma.permission.create({
  data: {
    systemId: 'mes-factory1',
    menuId: 1,
    permissionCd: 'prod-status-2cgl',
    name: '생산현황 2CGL 전용',
    config: JSON.stringify({
      actions: ['read'],
      fieldConstraints: { PROC_CD: '2CGL' },
    }),
  },
})
```

> **Tip**: `fieldConstraints`가 없으면 해당 메뉴의 모든 데이터에 접근 가능

---

## 3. 권한 체크 체인

```
User
  → UserRoleGroup → RoleGroup
    → RoleGroupRole → Role (parentRoleId 계층 탐색)
      → RolePermission → Permission
        → Menu (via menuId)

User
  → UserSystemMenuSet → MenuSet
    → MenuSetMenu → Menu (메뉴 구성)
```

최종 접근: MenuSet 메뉴 ∩ Permission 연결 메뉴

---

## 4. FAQ / 트러블슈팅

### Q1. `@/lib/generated/prisma` import 에러
- `pnpm prisma generate`를 먼저 실행하세요

### Q2. DB 초기화 방법
- `pnpm prisma db push --force-reset && pnpm prisma db seed`

### Q3. 새 모델 추가 후 반영
- `prisma/schema.prisma` 수정 → `pnpm prisma db push` → `pnpm prisma generate`

---

## 5. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2026-01-27 | 초기 작성 |
