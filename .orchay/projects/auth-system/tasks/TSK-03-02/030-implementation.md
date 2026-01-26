# 구현 문서 (030-implementation.md)

**Task ID:** TSK-03-02
**Task명:** 메뉴/API 접근 제어 미들웨어
**Last Updated:** 2026-01-26

---

## 1. 구현 개요

TSK-03-02에서는 CASL 기반 권한 체크 시스템과 API 권한 가드, 메뉴 필터링 유틸리티를 구현했습니다.

### 1.1 구현된 모듈

| 모듈 | 파일 | 설명 |
|-----|------|------|
| CASL Ability | lib/auth/ability.ts | 권한 코드로 Ability 생성 |
| 메뉴 필터링 | lib/auth/menu-filter.ts | 권한 기반 메뉴 필터링 |
| API Guard | lib/auth/api-guard.ts | 인증/권한 가드 함수 |

---

## 2. 핵심 구현 사항

### 2.1 CASL Ability 정의

```typescript
// lib/auth/ability.ts
export function defineAbilityFor(permissions: string[]): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(AppAbility)

  permissions.forEach((permission) => {
    const [resource, action] = permission.split(':')
    if (action === 'manage') {
      // manage는 모든 작업 허용
      can('create', normalizedResource)
      can('read', normalizedResource)
      can('update', normalizedResource)
      can('delete', normalizedResource)
    } else {
      can(action, normalizedResource)
    }
  })

  return build()
}
```

### 2.2 부모 메뉴 자동 포함 (BR-03-05)

```typescript
// lib/auth/menu-filter.ts
export function includeParentMenus(
  allowedIds: Set<number>,
  menus: MenuItem[]
): Set<number> {
  const result = new Set(allowedIds)
  const menuMap = new Map<number, MenuItem>()
  menus.forEach((menu) => menuMap.set(menu.id, menu))

  // 각 허용된 메뉴의 부모 체인 추가
  allowedIds.forEach((menuId) => {
    let currentMenu = menuMap.get(menuId)
    while (currentMenu?.parentId) {
      result.add(currentMenu.parentId)
      currentMenu = menuMap.get(currentMenu.parentId)
    }
  })

  return result
}
```

### 2.3 API Guard 함수

```typescript
// lib/auth/api-guard.ts
export async function requireAuthAndPermission(
  action: Actions,
  subject: Subjects
): Promise<Result> {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult

  const permResult = await requirePermission(
    authResult.data.userId, action, subject
  )
  if (!permResult.ok) return permResult

  return authResult
}
```

---

## 3. 파일 구조

```
lib/auth/
├── ability.ts              # CASL Ability 정의
├── menu-filter.ts          # 메뉴 필터링 유틸
├── api-guard.ts            # API 권한 가드
└── __tests__/
    ├── ability.test.ts     # CASL Ability 테스트 (9개)
    ├── menu-filter.test.ts # 메뉴 필터링 테스트 (10개)
    └── api-guard.test.ts   # API Guard 테스트 (14개)
```

---

## 4. 테스트 결과

```
 ✓ lib/auth/__tests__/ability.test.ts (9 tests)
 ✓ lib/auth/__tests__/menu-filter.test.ts (10 tests)
 ✓ lib/auth/__tests__/api-guard.test.ts (14 tests)

Test Files: 3 passed
Tests: 33 passed
```

---

## 5. 빌드 결과

```
✓ Compiled successfully
```

---

## 6. 의존성 추가

```json
{
  "dependencies": {
    "@casl/ability": "^6.8.0"
  }
}
```

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|-----|------|--------|----------|
| 1.0 | 2026-01-26 | Claude | 최초 작성 |
