# TSK-03-03 - usePermission Hook 및 화면 요소 제어 설계 문서

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-03 |
| 문서 버전 | 1.0 |
| 작성일 | 2026-01-26 |
| 상태 | 작성중 |
| 카테고리 | development |

---

## 1. 개요

### 1.1 배경 및 문제 정의

**현재 상황:**
- CASL Ability, API Guard 구현 완료 (TSK-03-02)
- 프론트엔드에서 권한 체크 미적용

**해결하려는 문제:**
- React 컴포넌트에서 권한 체크 필요
- 버튼/영역 조건부 렌더링 필요

### 1.2 목적 및 기대 효과

**목적:**
- usePermission Hook 구현
- PermissionGuard 컴포넌트 구현
- 버튼 활성화/비활성화, 영역 표시/숨김

**기대 효과:**
- 프론트엔드에서 간편한 권한 체크
- 권한 없는 UI 요소 자동 숨김/비활성화

### 1.3 범위

**포함:**
- usePermission Hook (can, cannot 메서드)
- PermissionGuard 컴포넌트 (조건부 렌더링)
- useUserPermissions Hook (사용자 권한 로드)

**제외:**
- 감사 로그 (TSK-04-01)
- 관리 화면 (TSK-05-01, TSK-05-02)

### 1.4 참조 문서

| 문서 | 경로 | 관련 섹션 |
|------|------|----------|
| PRD | `.orchay/projects/auth-system/prd.md` | 4.2.6 |
| TRD | `.orchay/projects/auth-system/trd.md` | 3.3 |

---

## 2. 기술 설계

### 2.1 usePermission Hook

```typescript
// hooks/usePermission.ts
import { useMemo } from 'react'
import { defineAbilityFor, type Actions, type Subjects } from '@/lib/auth/ability'

export function usePermission(permissions: string[]) {
  const ability = useMemo(
    () => defineAbilityFor(permissions),
    [permissions]
  )

  return {
    can: (action: Actions, subject: Subjects) => ability.can(action, subject),
    cannot: (action: Actions, subject: Subjects) => ability.cannot(action, subject),
  }
}
```

### 2.2 useUserPermissions Hook

```typescript
// hooks/useUserPermissions.ts
import { useSession } from 'next-auth/react'

export function useUserPermissions() {
  const { data: session, status } = useSession()

  const permissions = session?.user?.permissions || []
  const isLoading = status === 'loading'

  return {
    permissions,
    isLoading,
    isAuthenticated: status === 'authenticated',
  }
}
```

### 2.3 PermissionGuard 컴포넌트

```typescript
// components/auth/PermissionGuard.tsx
interface PermissionGuardProps {
  action: Actions
  subject: Subjects
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({
  action,
  subject,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { permissions } = useUserPermissions()
  const { can } = usePermission(permissions)

  if (!can(action, subject)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
```

### 2.4 사용 예시

```tsx
// 버튼 조건부 렌더링
<PermissionGuard action="create" subject="User">
  <Button onClick={handleCreateUser}>사용자 추가</Button>
</PermissionGuard>

// Hook 직접 사용
const { can } = usePermission(permissions)
<Button disabled={!can('delete', 'User')}>삭제</Button>
```

---

## 3. 파일 구조

```
hooks/
├── usePermission.ts          # 권한 체크 Hook
├── useUserPermissions.ts     # 사용자 권한 로드 Hook
└── __tests__/
    ├── usePermission.test.ts
    └── useUserPermissions.test.ts

components/auth/
├── PermissionGuard.tsx       # 권한 기반 조건부 렌더링
└── __tests__/
    └── PermissionGuard.test.tsx
```

---

## 4. 구현 체크리스트

### Frontend

- [ ] usePermission Hook 구현
- [ ] useUserPermissions Hook 구현
- [ ] PermissionGuard 컴포넌트 구현

### 테스트

- [ ] usePermission Hook 단위 테스트
- [ ] useUserPermissions Hook 단위 테스트
- [ ] PermissionGuard 컴포넌트 테스트

---

## 5. 연관 문서

| 문서 | 경로 | 용도 |
|------|------|------|
| 요구사항 추적 매트릭스 | `025-traceability-matrix.md` | PRD → 설계 → 테스트 양방향 추적 |
| 테스트 명세서 | `026-test-specification.md` | 단위/E2E/매뉴얼 테스트 상세 정의 |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-26 | Claude | 최초 작성 |
