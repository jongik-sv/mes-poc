# TSK-03-01 구현 문서 - 사용자 메뉴 시뮬레이션 API

## 1. 구현 개요

| 항목 | 내용 |
|-----|------|
| Task | TSK-03-01 |
| Task명 | 사용자 메뉴 시뮬레이션 API 구현 |
| 구현 파일 | `lib/auth/menu-simulation.ts`, `app/api/users/[id]/menus/route.ts` |
| 테스트 파일 | `lib/auth/__tests__/menu-simulation.test.ts` |
| 상태 | 완료 |

## 2. 구현 파일 목록

| 파일 경로 | 변경 유형 | 설명 |
|----------|----------|------|
| `mes-portal/lib/auth/menu-simulation.ts` | 신규 | 메뉴 시뮬레이션 비즈니스 로직 (collectMenuIdsFromRoleGroups, buildMenuTreeForSimulation) |
| `mes-portal/app/api/users/[id]/menus/route.ts` | 신규 | GET /api/users/:id/menus API 라우트 핸들러 |
| `mes-portal/lib/auth/__tests__/menu-simulation.test.ts` | 신규 | 단위 테스트 (9개 테스트 케이스) |

## 3. 주요 구현 내용

### 3.1 메뉴 시뮬레이션 서비스 (`menu-simulation.ts`)

#### `collectMenuIdsFromRoleGroups(roleGroupIds: string[])`
- 역할그룹 ID 배열을 받아 역할그룹 → 역할 → 권한 → 메뉴 체인을 조회
- Prisma nested include를 활용한 조인 쿼리
- Set 기반 중복 메뉴 ID 제거
- 빈 roleGroupIds 입력 시 빈 배열 반환

#### `buildMenuTreeForSimulation(menuIds: number[])`
- 메뉴 ID 배열로 활성 메뉴 조회 (isActive: true)
- category 기반 트리 구조 빌드
- category 오름차순, sortOrder 오름차순 정렬
- MenuTreeNode 형태의 트리 반환 (key, title, icon, path, children)
- summary 계산 (totalMenus, totalCategories)

### 3.2 API 라우트 핸들러 (`route.ts`)

#### `GET /api/users/:id/menus`
- path parameter: `id` (사용자 ID)
- optional query parameter: `roleGroupIds` (쉼표 구분 역할그룹 ID 목록)
- `roleGroupIds` 존재 시: 해당 역할그룹 기반 시뮬레이션 메뉴 트리 반환
- `roleGroupIds` 미존재 시: 사용자의 실제 할당된 역할그룹 기반 메뉴 트리 반환
- 사용자 미존재 시 404 응답
- roleGroupIds 형식 오류 시 400 응답

### 3.3 데이터 조회 체인

```
roleGroupIds (파라미터 또는 사용자 실제 할당)
  → RoleGroupRole (역할그룹 → 역할)
    → RolePermission (역할 → 권한)
      → Permission (권한, menuId 포함)
        → Menu (id, name, path, icon, category, sortOrder)
```

## 4. API/컴포넌트 인터페이스

### 4.1 요청

```
GET /api/users/:id/menus
GET /api/users/:id/menus?roleGroupIds=rg-1,rg-2,rg-3
```

### 4.2 응답 (200 OK)

```typescript
interface MenuTreeResponse {
  menus: MenuTreeNode[];
  summary: {
    totalMenus: number;
    totalCategories: number;
  };
}

interface MenuTreeNode {
  key: string;       // menu.id 또는 category key (cat-xxx)
  title: string;     // menu.name 또는 category 이름
  icon?: string;     // menu.icon 필드
  path?: string;     // menu.path (leaf node만)
  children?: MenuTreeNode[];
}
```

### 4.3 에러 응답

| 상태 코드 | 조건 | 응답 |
|-----------|------|------|
| 404 | 사용자 미존재 | `{ error: "사용자를 찾을 수 없습니다" }` |
| 400 | roleGroupIds 형식 오류 | `{ error: "잘못된 roleGroupIds 형식입니다" }` |

### 4.4 내부 함수 인터페이스

```typescript
// 역할그룹 ID 배열에서 접근 가능한 메뉴 ID 수집
function collectMenuIdsFromRoleGroups(roleGroupIds: string[]): Promise<number[]>

// 메뉴 ID 배열로 시뮬레이션 트리 빌드
function buildMenuTreeForSimulation(menuIds: number[]): Promise<MenuTreeResponse>
```

## 5. 변경 이력

| 날짜 | 내용 |
|-----|------|
| 2026-01-28 | 최초 구현 |
