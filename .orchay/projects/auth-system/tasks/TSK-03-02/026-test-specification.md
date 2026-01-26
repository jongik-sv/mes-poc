# 테스트 명세서 (026-test-specification.md)

**Task ID:** TSK-03-02
**Task명:** 메뉴/API 접근 제어 미들웨어
**Last Updated:** 2026-01-26

---

## 1. 테스트 범위

### 1.1 In-Scope

- CASL Ability 정의 및 권한 체크
- 메뉴 필터링 유틸리티
- API 권한 가드 함수

### 1.2 Out-of-Scope

- usePermission Hook (TSK-03-03)
- PermissionGuard 컴포넌트 (TSK-03-03)
- E2E 테스트

---

## 2. 단위 테스트 명세

### 2.1 CASL Ability 테스트

| 테스트 ID | 테스트명 | 입력 | 예상 결과 |
|----------|---------|------|----------|
| UT-ABILITY-001 | 빈 권한 배열로 Ability 생성 | [] | can() 모두 false |
| UT-ABILITY-002 | 단일 권한으로 Ability 생성 | ['user:read'] | can('read', 'User') true |
| UT-ABILITY-003 | 여러 권한으로 Ability 생성 | ['user:read', 'role:read'] | 각각 true |
| UT-ABILITY-004 | manage 액션은 모든 작업 허용 | ['user:manage'] | CRUD 모두 true |
| UT-ABILITY-005 | all 리소스는 모든 리소스 허용 | ['all:read'] | 모든 리소스 read true |
| UT-ABILITY-006 | cannot 메서드 동작 | ['user:read'] | cannot('create', 'User') true |
| UT-ABILITY-007 | 소문자 리소스 파싱 | ['user:read'] | can('read', 'User') true |
| UT-ABILITY-008 | 잘못된 형식 무시 | ['invalid'] | 무시됨 |
| UT-ABILITY-009 | SYSTEM_ADMIN 모든 권한 | ['all:manage'] | 모든 CRUD true |

### 2.2 메뉴 필터링 테스트

| 테스트 ID | 테스트명 | 입력 | 예상 결과 |
|----------|---------|------|----------|
| UT-MENU-001 | 빈 allowedIds로 빈 배열 반환 | Set() | [] |
| UT-MENU-002 | 허용된 메뉴만 필터링 | Set([2, 3]) | [2, 3] |
| UT-MENU-003 | 자식 메뉴 허용 시 부모 포함 | Set([2]) | [1, 2] (BR-03-05) |
| UT-MENU-004 | 트리 구조 유지 | Set([1, 2, 3]) | 트리 구조 |
| UT-MENU-005 | 부모 자동 포함 (BR-03-05) | Set([5]) | [4, 5] |
| UT-MENU-006 | 여러 자식의 부모 포함 | Set([2, 5]) | [1, 2, 4, 5] |
| UT-MENU-007 | 부모만 허용 시 자식 미포함 | Set([1]) | [1] |
| UT-MENU-008 | 사용자 역할 기반 필터링 | userId: 1 | 역할 기반 메뉴 |
| UT-MENU-009 | 사용자 없으면 빈 배열 | userId: 999 | [] |
| UT-MENU-010 | 역할 없는 사용자 | userRoles: [] | [] |

### 2.3 API Guard 테스트

| 테스트 ID | 테스트명 | 입력 | 예상 결과 |
|----------|---------|------|----------|
| UT-GUARD-001 | 인증되지 않은 경우 401 | session: null | 401 |
| UT-GUARD-002 | 인증된 경우 세션 반환 | session: valid | AuthResult |
| UT-GUARD-003 | 비관리자 403 | role: OPERATOR | 403 |
| UT-GUARD-004 | 관리자 통과 | role: SYSTEM_ADMIN | ok |
| UT-GUARD-005 | 사용자 없으면 404 | userId: 999 | 404 |
| UT-GUARD-006 | 권한 없으면 403 | no permission | 403 |
| UT-GUARD-007 | 권한 있으면 통과 | has permission | ok |
| UT-GUARD-008 | SYSTEM_ADMIN 모든 권한 | role: SYSTEM_ADMIN | ok |
| UT-GUARD-009 | requireAuthAndAdmin 401 | session: null | 401 |
| UT-GUARD-010 | requireAuthAndAdmin 403 | role: OPERATOR | 403 |
| UT-GUARD-011 | requireAuthAndAdmin 통과 | role: SYSTEM_ADMIN | ok |
| UT-GUARD-012 | requireAuthAndPermission 401 | session: null | 401 |
| UT-GUARD-013 | requireAuthAndPermission 403 | no permission | 403 |
| UT-GUARD-014 | requireAuthAndPermission 통과 | has permission | ok |

---

## 3. 테스트 환경

- **테스트 프레임워크**: Vitest 4.0.17
- **테스트 환경**: jsdom
- **목킹**: vi.mock for @/auth, @/lib/prisma

---

## 4. 테스트 실행

```bash
# TSK-03-02 관련 테스트 실행
pnpm test:run lib/auth/__tests__/ability.test.ts
pnpm test:run lib/auth/__tests__/menu-filter.test.ts
pnpm test:run lib/auth/__tests__/api-guard.test.ts

# 전체 실행
pnpm test:run lib/auth/__tests__/ability.test.ts lib/auth/__tests__/menu-filter.test.ts lib/auth/__tests__/api-guard.test.ts
```

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|-----|------|--------|----------|
| 1.0 | 2026-01-26 | Claude | 최초 작성 |
