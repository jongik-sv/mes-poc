# 구현 문서 (030-implementation.md)

**Task ID:** TSK-03-03
**Task명:** usePermission Hook 및 화면 요소 제어
**Last Updated:** 2026-01-26

---

## 1. 구현 개요

TSK-03-03에서는 React 컴포넌트에서 권한을 체크할 수 있는 Hook과 조건부 렌더링 컴포넌트를 구현했습니다.

### 1.1 구현된 모듈

| 모듈 | 파일 | 설명 |
|-----|------|------|
| usePermission Hook | lib/hooks/usePermission.ts | can/cannot 메서드 제공 |
| useUserPermissions Hook | lib/hooks/useUserPermissions.ts | 세션에서 권한 로드 |
| PermissionGuard | components/auth/PermissionGuard.tsx | 조건부 렌더링 |

---

## 2. 핵심 구현 사항

### 2.1 usePermission Hook

```typescript
export function usePermission(permissions: string[]): UsePermissionResult {
  const ability = useMemo(
    () => defineAbilityFor(permissions),
    [JSON.stringify(permissions)]
  )

  const can = useCallback(
    (action: Actions, subject: Subjects) => ability.can(action, subject),
    [ability]
  )

  const cannot = useCallback(
    (action: Actions, subject: Subjects) => ability.cannot(action, subject),
    [ability]
  )

  return { can, cannot, ability }
}
```

### 2.2 useUserPermissions Hook

```typescript
export function useUserPermissions(): UseUserPermissionsResult {
  const { data: session, status } = useSession()

  const permissions = (session?.user as { permissions?: string[] } | undefined)
    ?.permissions || []

  return {
    permissions,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  }
}
```

### 2.3 PermissionGuard 컴포넌트

```typescript
export function PermissionGuard({
  action,
  subject,
  children,
  fallback = null,
  showWhileLoading = false,
}: PermissionGuardProps) {
  const { permissions, isLoading, isAuthenticated } = useUserPermissions()
  const { can } = usePermission(permissions)

  if (isLoading) {
    return showWhileLoading ? <>{children}</> : <>{fallback}</>
  }

  if (!isAuthenticated || !can(action, subject)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
```

---

## 3. 사용 예시

### 3.1 버튼 조건부 렌더링

```tsx
<PermissionGuard action="create" subject="User">
  <Button onClick={handleCreateUser}>사용자 추가</Button>
</PermissionGuard>
```

### 3.2 fallback 사용

```tsx
<PermissionGuard
  action="delete"
  subject="Role"
  fallback={<Button disabled>권한 없음</Button>}
>
  <Button danger onClick={handleDelete}>삭제</Button>
</PermissionGuard>
```

### 3.3 Hook 직접 사용

```tsx
const { can } = usePermission(permissions)

return (
  <Button
    onClick={handleDelete}
    disabled={!can('delete', 'User')}
  >
    삭제
  </Button>
)
```

---

## 4. 파일 구조

```
lib/hooks/
├── usePermission.ts          # 권한 체크 Hook
├── useUserPermissions.ts     # 사용자 권한 로드 Hook
└── __tests__/
    ├── usePermission.test.ts      # 7개 테스트
    └── useUserPermissions.test.ts # 8개 테스트

components/auth/
├── PermissionGuard.tsx       # 조건부 렌더링 컴포넌트
└── __tests__/
    └── PermissionGuard.test.tsx   # 8개 테스트
```

---

## 5. 테스트 결과

```
 ✓ lib/hooks/__tests__/usePermission.test.ts (7 tests)
 ✓ lib/hooks/__tests__/useUserPermissions.test.ts (8 tests)
 ✓ components/auth/__tests__/PermissionGuard.test.tsx (8 tests)

Test Files: 3 passed
Tests: 23 passed
```

---

## 6. 빌드 결과

```
✓ Compiled successfully
```

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|-----|------|--------|----------|
| 1.0 | 2026-01-26 | Claude | 최초 작성 |
