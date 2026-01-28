# TSK-03-01 - 사용자 메뉴 시뮬레이션 API 기술 설계 문서

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-28

> **설계 규칙**
> * Backend API 카테고리 전용
> * 데이터 조회 체인 및 트리 빌드 로직 설계
> * 성능 및 중복 제거 전략 포함

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-01 |
| Task명 | 사용자 메뉴 시뮬레이션 API 구현 |
| Category | development / backend |
| 상태 | [dd] 상세설계 |
| 작성일 | 2026-01-28 |
| 작성자 | Claude |

### 상위 문서 참조

| 문서 유형 | 경로 | 참조 섹션 |
|----------|------|----------|
| PRD | `.orchay/projects/rbac-enhancement/prd.md` | 4.3 API |
| WBS | `.orchay/projects/rbac-enhancement/wbs.yaml` | WP-03 / TSK-03-01 |

---

## 1. 개요

### 1.1 배경

사용자 역할그룹 할당 화면(TSK-02-01)의 우측 메뉴 시뮬레이션 패널에서 사용자의 접근 가능 메뉴를 트리 구조로 표시해야 합니다. 역할그룹 체크박스 변경 시 저장 전에 메뉴 트리를 실시간으로 미리보기하는 기능이 필요하며, 이를 위한 백엔드 API가 존재하지 않습니다.

- 사용자의 실제 할당 기반 메뉴 조회 API 부재
- roleGroupIds 파라미터 기반 시뮬레이션 조회 API 부재
- 역할그룹 → 역할 → 권한 → 메뉴 체인 조회 로직 필요
- category path 기반 트리 구조 빌드 필요

### 1.2 목적

- `GET /api/users/:id/menus` 엔드포인트를 생성하여 사용자 메뉴 트리 조회 제공
- `roleGroupIds` 쿼리 파라미터로 저장 전 시뮬레이션 메뉴 트리 미리보기 지원
- category path 기반 트리 구조 빌드 및 중복 메뉴 제거

### 1.3 범위

**포함 범위:**
- `app/api/users/[id]/menus/route.ts` API 라우트 핸들러 생성
- 역할그룹 → 역할 → 권한 → 메뉴 체인 Prisma 조회
- category path 기반 트리 구조 빌드 함수
- 중복 메뉴 제거 로직
- `roleGroupIds` 쿼리 파라미터 시뮬레이션 지원
- MenuTreeResponse 응답 타입 정의
- 단위 테스트

**제외 범위:**
- 프론트엔드 메뉴 시뮬레이션 컴포넌트 (TSK-02-01 범위)
- 기존 menu-filter.ts 수정
- 인증/인가 미들웨어 변경

### 1.4 참조 문서

| 문서 | 경로 | 관련 섹션 |
|------|------|----------|
| PRD | `.orchay/projects/rbac-enhancement/prd.md` | 4.3 API |
| TSK-02-01 설계 | `tasks/TSK-02-01/010-design.md` | 6. 메뉴 시뮬레이션 컴포넌트, 7. 실시간 갱신 로직 |
| 기존 menu-filter | `mes-portal/lib/auth/menu-filter.ts` | buildMenuTree 패턴 참조 |

---

## 2. 현재 상태 (As-Is)

### 2.1 현재 아키텍처

```
mes-portal/
├── app/api/users/[id]/
│   └── role-groups/route.ts    # 역할그룹 조회/할당 API (존재)
├── lib/auth/
│   └── menu-filter.ts          # buildMenuTree 함수 (존재, 세션 기반)
└── (메뉴 시뮬레이션 API 없음)
```

### 2.2 현재 구성 요소

| 구성 요소 | 상태 | 역할 |
|----------|------|------|
| `/api/users/:id/role-groups` | 존재 | 사용자 역할그룹 CRUD |
| `menu-filter.ts` | 존재 | 세션 기반 메뉴 필터링 (buildMenuTree) |
| `/api/users/:id/menus` | **없음** | 사용자 메뉴 트리 조회 |

### 2.3 문제점 분석

| 문제점 | 영향 | 심각도 |
|--------|------|--------|
| 메뉴 시뮬레이션 API 부재 | 사용자 권한 할당 화면에서 메뉴 미리보기 불가 | High |
| roleGroupIds 기반 시뮬레이션 불가 | 저장 전 메뉴 변경 미리보기 불가 | High |
| 기존 buildMenuTree는 세션 기반 | 다른 사용자의 메뉴 트리를 조회할 수 없음 | Medium |

---

## 3. 목표 상태 (To-Be)

### 3.1 목표 아키텍처

```
mes-portal/
├── app/api/users/[id]/
│   ├── role-groups/route.ts       # 기존
│   └── menus/route.ts             # 신규 - 메뉴 시뮬레이션 API
├── lib/auth/
│   ├── menu-filter.ts             # 기존 (수정 없음)
│   └── menu-simulation.ts         # 신규 - 시뮬레이션 서비스 로직
└── lib/types/
    └── menu-tree.ts               # 신규 - MenuTreeNode, MenuTreeResponse 타입
```

### 3.2 목표 구성 요소

| 구성 요소 | 상태 | 역할 | 변경 사항 |
|----------|------|------|----------|
| `app/api/users/[id]/menus/route.ts` | **신규** | API 라우트 핸들러 | GET 엔드포인트 |
| `lib/auth/menu-simulation.ts` | **신규** | 시뮬레이션 비즈니스 로직 | 메뉴 체인 조회, 트리 빌드 |
| `lib/types/menu-tree.ts` | **신규** | 응답 타입 정의 | MenuTreeNode, MenuTreeResponse |

### 3.3 기대 효과

| 개선 항목 | 현재 | 목표 |
|----------|------|------|
| 사용자 메뉴 조회 | 세션 기반만 가능 | userId 기반 타 사용자 조회 가능 |
| 시뮬레이션 | 불가 | roleGroupIds 파라미터로 저장 전 미리보기 |
| 메뉴 요약 | 없음 | totalMenus, totalCategories 제공 |

---

## 4. 구현 계획

### 4.1 API 엔드포인트 설계

#### `GET /api/users/:id/menus`

**요청:**

| 파라미터 | 위치 | 타입 | 필수 | 설명 |
|---------|------|------|------|------|
| `id` | path | string | Y | 사용자 ID |
| `roleGroupIds` | query | string (comma-separated) | N | 시뮬레이션용 역할그룹 ID 목록 |

**동작:**
1. `roleGroupIds` 파라미터가 있으면: 해당 역할그룹 기반으로 메뉴 트리 빌드 (시뮬레이션)
2. `roleGroupIds` 파라미터가 없으면: 사용자의 실제 할당된 역할그룹 기반으로 메뉴 트리 빌드

**응답 (200 OK):**

```typescript
interface MenuTreeResponse {
  menus: MenuTreeNode[];
  summary: {
    totalMenus: number;
    totalCategories: number;
  };
}

interface MenuTreeNode {
  key: string;       // menu.id 또는 category key
  title: string;     // menu.name 또는 category 이름
  icon?: string;     // menu.icon 필드
  path?: string;     // menu.path (leaf node만)
  children?: MenuTreeNode[];
}
```

**에러 응답:**

| 상태 코드 | 조건 | 응답 |
|-----------|------|------|
| 404 | userId에 해당하는 사용자 없음 | `{ error: "사용자를 찾을 수 없습니다" }` |
| 400 | roleGroupIds 형식 오류 | `{ error: "잘못된 roleGroupIds 형식입니다" }` |

### 4.2 데이터 조회 체인

```
roleGroupIds (파라미터 또는 사용자 실제 할당)
  → RoleGroupRole (역할그룹 → 역할 매핑)
    → RolePermission (역할 → 권한 매핑)
      → Permission (권한 정보, menuId 포함)
        → Menu (메뉴 정보: id, name, path, icon, category, sortOrder)
```

**Prisma 쿼리 설계:**

```typescript
// 1단계: roleGroupIds 결정
const roleGroupIds = queryRoleGroupIds
  ?? (await prisma.userRoleGroup.findMany({
      where: { userId },
      select: { roleGroupId: true }
    })).map(urg => urg.roleGroupId);

// 2단계: 역할그룹 → 역할 → 권한 → 메뉴 체인 조회
const menus = await prisma.menu.findMany({
  where: {
    permissions: {
      some: {
        rolePermissions: {
          some: {
            role: {
              roleGroupRoles: {
                some: {
                  roleGroupId: { in: roleGroupIds }
                }
              }
            }
          }
        }
      }
    },
    isActive: true,
  },
  orderBy: [
    { category: 'asc' },
    { sortOrder: 'asc' },
  ],
  distinct: ['id'],  // 중복 메뉴 제거
});
```

### 4.3 트리 빌드 로직

```typescript
function buildCategoryTree(menus: Menu[]): MenuTreeNode[] {
  // 1. category path 기준 그룹핑
  const categoryMap = new Map<string, Menu[]>();
  for (const menu of menus) {
    const category = menu.category || '기타';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(menu);
  }

  // 2. 카테고리별 트리 노드 생성
  const tree: MenuTreeNode[] = [];
  for (const [category, categoryMenus] of categoryMap) {
    const categoryNode: MenuTreeNode = {
      key: `cat-${category}`,
      title: category,
      children: categoryMenus.map(menu => ({
        key: String(menu.id),
        title: menu.name,
        icon: menu.icon || undefined,
        path: menu.path || undefined,
      })),
    };
    tree.push(categoryNode);
  }

  return tree;
}
```

### 4.4 Summary 계산

```typescript
function calculateSummary(menus: Menu[]): { totalMenus: number; totalCategories: number } {
  const categories = new Set(menus.map(m => m.category || '기타'));
  return {
    totalMenus: menus.length,
    totalCategories: categories.size,
  };
}
```

### 4.5 구현 단계

| 단계 | 작업 | 파일 |
|------|------|------|
| 1 | MenuTreeNode, MenuTreeResponse 타입 정의 | `lib/types/menu-tree.ts` |
| 2 | 메뉴 시뮬레이션 서비스 로직 구현 | `lib/auth/menu-simulation.ts` |
| 3 | API 라우트 핸들러 구현 | `app/api/users/[id]/menus/route.ts` |
| 4 | 단위 테스트 작성 | `lib/auth/__tests__/menu-simulation.spec.ts` |
| 5 | API 라우트 통합 테스트 작성 | `app/api/users/[id]/menus/__tests__/route.spec.ts` |

### 4.6 디렉토리/파일 구조

```
mes-portal/
├── app/api/users/[id]/menus/
│   ├── route.ts                              # API 라우트 핸들러
│   └── __tests__/route.spec.ts               # 라우트 통합 테스트
├── lib/auth/
│   ├── menu-simulation.ts                    # 시뮬레이션 비즈니스 로직
│   └── __tests__/menu-simulation.spec.ts     # 서비스 단위 테스트
└── lib/types/
    └── menu-tree.ts                          # 타입 정의
```

### 4.7 변경 파일 목록

| 파일 | 변경 유형 | 변경 내용 |
|------|----------|----------|
| `lib/types/menu-tree.ts` | 신규 | MenuTreeNode, MenuTreeResponse 인터페이스 |
| `lib/auth/menu-simulation.ts` | 신규 | getMenuTreeForUser(), buildCategoryTree(), calculateSummary() |
| `app/api/users/[id]/menus/route.ts` | 신규 | GET 핸들러 (파라미터 파싱, 서비스 호출, 응답 반환) |

---

## 5. 리스크 분석

### 5.1 위험 요소

| 리스크 ID | 위험 요소 | 발생 가능성 | 영향도 | 심각도 |
|-----------|----------|------------|--------|--------|
| RSK-01 | 체인 조회 쿼리 성능 저하 | Medium | Medium | 중간 |
| RSK-02 | 중복 메뉴 미제거 | Low | Medium | 낮음 |
| RSK-03 | category 값 불일치 | Low | Low | 낮음 |
| RSK-04 | 잘못된 roleGroupIds 파라미터 | Medium | Low | 낮음 |

### 5.2 대응 방안

| 리스크 ID | 대응 전략 | 구체적 방안 |
|-----------|----------|------------|
| RSK-01 | 완화 | Prisma distinct 사용, 필요 시 include 대신 raw query |
| RSK-02 | 회피 | Prisma distinct + Set 기반 중복 제거 이중 방어 |
| RSK-03 | 수용 | category 값이 null인 경우 '기타' 그룹으로 처리 |
| RSK-04 | 완화 | 파라미터 검증 후 400 응답 반환 |

### 5.3 의존성

| 의존 대상 | 유형 | 설명 | 상태 |
|----------|------|------|------|
| Prisma 모델 (UserRoleGroup, RoleGroupRole, RolePermission, Permission, Menu) | 데이터 | 조인 대상 모델 | 완료 |
| 기존 menu-filter.ts | 참조 | buildMenuTree 패턴 참조 | 완료 |

### 5.4 제약 사항

| 제약 | 설명 | 대응 방안 |
|------|------|----------|
| 메뉴 시뮬레이션 debounce 300ms | 프론트엔드에서 300ms debounce 적용 | API 응답 시간 300ms 미만 목표 |
| SQLite 동시성 | MVP 단계 제약 | 읽기 전용 API이므로 영향 적음 |

---

## 6. 검증 계획

### 6.1 테스트 방법

| 테스트 유형 | 테스트 항목 | 방법 | 기대 결과 |
|------------|-----------|------|----------|
| 단위 테스트 | buildCategoryTree | Mock 메뉴 데이터 → 트리 변환 | 올바른 트리 구조 |
| 단위 테스트 | calculateSummary | Mock 메뉴 데이터 → 요약 계산 | 정확한 totalMenus, totalCategories |
| 단위 테스트 | 중복 메뉴 제거 | 중복 포함 데이터 입력 | 중복 없는 결과 |
| 통합 테스트 | GET /api/users/:id/menus | HTTP 요청 | 200 + MenuTreeResponse |
| 통합 테스트 | roleGroupIds 시뮬레이션 | 쿼리 파라미터 포함 요청 | 해당 역할그룹 기반 메뉴 트리 |
| 통합 테스트 | 사용자 없음 | 존재하지 않는 userId | 404 응답 |

### 6.2 수용 기준 (Acceptance Criteria)

| 항목 | 검증 방법 | 기대 결과 | 필수 여부 |
|------|----------|----------|----------|
| 사용자 ID 기반 메뉴 트리 조회 | API 호출 | 실제 할당 기반 트리 반환 | 필수 |
| roleGroupIds 시뮬레이션 | 쿼리 파라미터 포함 API 호출 | 시뮬레이션 트리 반환 | 필수 |
| summary 포함 | 응답 확인 | totalMenus, totalCategories 정확 | 필수 |
| icon, path 포함 | 트리 노드 확인 | 각 leaf 노드에 icon, path 존재 | 필수 |
| 중복 메뉴 제거 | 중복 발생 시나리오 | 중복 없는 메뉴 트리 | 필수 |
| category 트리 구조 | 응답 구조 확인 | 카테고리별 그룹핑된 트리 | 필수 |

### 6.3 체크리스트

**구현 완료 확인:**
- [ ] MenuTreeNode, MenuTreeResponse 타입 정의
- [ ] getMenuTreeForUser() 함수 구현
- [ ] buildCategoryTree() 함수 구현
- [ ] calculateSummary() 함수 구현
- [ ] GET /api/users/:id/menus 라우트 핸들러 구현
- [ ] roleGroupIds 쿼리 파라미터 파싱 및 검증
- [ ] 중복 메뉴 제거 로직
- [ ] 에러 처리 (404, 400)
- [ ] 단위 테스트 통과
- [ ] 통합 테스트 통과

---

## 7. 후속 작업

### 7.1 이 Task 완료 후 영향받는 Task

| Task ID | 영향 | 필요 사항 |
|---------|------|----------|
| TSK-02-01 (사용자 역할그룹 할당 화면) | 메뉴 시뮬레이션 패널 | API 엔드포인트 사용 |

### 7.2 다음 단계

- `/wf:build` 명령어로 구현 진행

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-28 | Claude | 최초 작성 |
