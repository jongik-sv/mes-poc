# 테스트 명세서 (026-test-specification.md)

**Task ID:** TSK-03-03
**Task명:** usePermission Hook 및 화면 요소 제어
**Last Updated:** 2026-01-26

---

## 1. 테스트 범위

### 1.1 In-Scope

- usePermission Hook
- useUserPermissions Hook
- PermissionGuard 컴포넌트

### 1.2 Out-of-Scope

- 감사 로그 (TSK-04-01)
- 관리 화면 (TSK-05-01, TSK-05-02)

---

## 2. 단위 테스트 명세

### 2.1 usePermission Hook 테스트

| 테스트 ID | 테스트명 | 입력 | 예상 결과 |
|----------|---------|------|----------|
| UT-PERM-HOOK-001 | 빈 권한 배열 | [] | 모든 can() false |
| UT-PERM-HOOK-002 | 단일 권한 | ['user:read'] | can('read', 'User') true |
| UT-PERM-HOOK-003 | 여러 권한 | ['user:read', 'role:read'] | 각각 true |
| UT-PERM-HOOK-004 | manage 액션 | ['user:manage'] | CRUD 모두 true |
| UT-PERM-HOOK-005 | all:manage | ['all:manage'] | 모든 리소스/액션 true |
| UT-PERM-HOOK-006 | cannot 메서드 | ['user:read'] | cannot('create') true |
| UT-PERM-HOOK-007 | 메모이제이션 | 같은 권한 | 같은 함수 참조 |

### 2.2 useUserPermissions Hook 테스트

| 테스트 ID | 테스트명 | 입력 | 예상 결과 |
|----------|---------|------|----------|
| UT-USER-PERM-001 | 로딩 중 | status: loading | isLoading true, [] |
| UT-USER-PERM-002 | 미인증 | status: unauthenticated | isAuthenticated false |
| UT-USER-PERM-003 | 인증됨 | status: authenticated | permissions 반환 |
| UT-USER-PERM-004 | permissions 없음 | session.user 만 있음 | [] |
| UT-USER-PERM-005 | isLoading loading | status: loading | true |
| UT-USER-PERM-006 | isLoading authenticated | status: authenticated | false |
| UT-USER-PERM-007 | isAuthenticated authenticated | status: authenticated | true |
| UT-USER-PERM-008 | isAuthenticated unauthenticated | status: unauthenticated | false |

### 2.3 PermissionGuard 컴포넌트 테스트

| 테스트 ID | 테스트명 | 입력 | 예상 결과 |
|----------|---------|------|----------|
| UT-GUARD-COMP-001 | 권한 있음 | can('read', 'User') | children 렌더링 |
| UT-GUARD-COMP-002 | 권한 없음 | cannot('delete', 'User') | children 숨김 |
| UT-GUARD-COMP-003 | 권한 없음 + fallback | cannot + fallback | fallback 렌더링 |
| UT-GUARD-COMP-004 | fallback 없음 | 권한 없음 | null 렌더링 |
| UT-GUARD-COMP-005 | all:manage | ['all:manage'] | children 렌더링 |
| UT-GUARD-COMP-006 | 로딩 중 | isLoading true | fallback 렌더링 |
| UT-GUARD-COMP-007 | showWhileLoading | isLoading + showWhileLoading | children 렌더링 |
| UT-GUARD-COMP-008 | 미인증 | isAuthenticated false | fallback 렌더링 |

---

## 3. 테스트 환경

- **테스트 프레임워크**: Vitest 4.0.17
- **테스트 환경**: jsdom
- **목킹**: vi.mock for next-auth/react, useUserPermissions

---

## 4. 테스트 실행

```bash
# Hook 테스트 실행
pnpm test:run lib/hooks/__tests__/usePermission.test.ts
pnpm test:run lib/hooks/__tests__/useUserPermissions.test.ts

# 컴포넌트 테스트 실행
pnpm test:run components/auth/__tests__/PermissionGuard.test.tsx
```

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|-----|------|--------|----------|
| 1.0 | 2026-01-26 | Claude | 최초 작성 |
