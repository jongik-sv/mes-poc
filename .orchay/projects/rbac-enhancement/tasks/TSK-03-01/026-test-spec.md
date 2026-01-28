# 테스트 명세서 (026-test-spec.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-28

> **목적**: 사용자 메뉴 시뮬레이션 API의 단위 테스트, 통합 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-tech-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-01 |
| Task명 | 사용자 메뉴 시뮬레이션 API 구현 |
| 설계 문서 참조 | `010-tech-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-28 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | menu-simulation.ts (buildCategoryTree, calculateSummary, getMenuTreeForUser) | 90% 이상 |
| 통합 테스트 | GET /api/users/:id/menus 라우트 전체 흐름 | 주요 시나리오 100% |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 | Vitest |
| Mock | vi.mock (Vitest 내장) |
| 실행 명령 | `pnpm test:run` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-301 | `getMenuTreeForUser` | 사용자 ID로 실제 할당 기반 메뉴 트리 조회 | MenuTreeResponse 반환 | FR-301 |
| UT-302 | `getMenuTreeForUser` | 존재하지 않는 사용자 ID | null 또는 에러 | FR-301 |
| UT-303 | `getMenuTreeForUser` | roleGroupIds 파라미터로 시뮬레이션 조회 | 해당 역할그룹 기반 메뉴 트리 | FR-302 |
| UT-304 | `getMenuTreeForUser` | 빈 roleGroupIds 배열 | 빈 메뉴 트리 | FR-302 |
| UT-305 | `calculateSummary` | 여러 카테고리의 메뉴 목록 | 정확한 totalMenus, totalCategories | FR-303 |
| UT-306 | `calculateSummary` | 빈 메뉴 목록 | totalMenus: 0, totalCategories: 0 | FR-303 |
| UT-307 | `buildCategoryTree` | icon, path 필드 포함 메뉴 | 트리 노드에 icon, path 매핑 | FR-304 |
| UT-308 | `getMenuTreeForUser` | 여러 권한이 같은 메뉴 참조 | 중복 없이 1개만 반환 | BR-301 |
| UT-309 | `buildCategoryTree` | 동일 category 메뉴 3개 | 같은 부모 노드 하위에 3개 children | BR-302 |
| UT-310 | `buildCategoryTree` | sortOrder 순서 확인 | category 내 sortOrder 오름차순 정렬 | BR-302 |

### 2.2 테스트 케이스 상세

#### UT-301: 사용자 ID 기반 메뉴 트리 조회

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/menu-simulation.spec.ts` |
| **테스트 블록** | `describe('getMenuTreeForUser') -> it('사용자 실제 할당 기반 메뉴 트리를 반환한다')` |
| **Mock 의존성** | prisma.userRoleGroup.findMany, prisma.menu.findMany |
| **입력 데이터** | userId = "user-1" (역할그룹 2개 할당, 메뉴 3개 접근 가능) |
| **검증 포인트** | menus 배열 길이 > 0, summary.totalMenus === 3 |
| **관련 요구사항** | FR-301 |

```typescript
// Mock 데이터
const mockUserRoleGroups = [
  { roleGroupId: "rg-1" },
  { roleGroupId: "rg-2" },
];
const mockMenus = [
  { id: 1, name: "작업지시", path: "/production/work-order", icon: "ScheduleOutlined", category: "생산관리", sortOrder: 1, isActive: true },
  { id: 2, name: "생산현황", path: "/production/status", icon: "BarChartOutlined", category: "생산관리", sortOrder: 2, isActive: true },
  { id: 3, name: "검사관리", path: "/quality/inspection", icon: "SafetyOutlined", category: "품질관리", sortOrder: 1, isActive: true },
];
// 예상: menus에 2개 카테고리 노드, summary: { totalMenus: 3, totalCategories: 2 }
```

#### UT-302: 존재하지 않는 사용자 ID

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/menu-simulation.spec.ts` |
| **테스트 블록** | `describe('getMenuTreeForUser') -> it('존재하지 않는 사용자는 null을 반환한다')` |
| **Mock 의존성** | prisma.user.findUnique → null |
| **입력 데이터** | userId = "non-existent" |
| **검증 포인트** | 반환값이 null |
| **관련 요구사항** | FR-301 |

#### UT-303: roleGroupIds 파라미터 시뮬레이션

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/menu-simulation.spec.ts` |
| **테스트 블록** | `describe('getMenuTreeForUser') -> it('roleGroupIds 파라미터로 시뮬레이션 메뉴를 반환한다')` |
| **Mock 의존성** | prisma.menu.findMany |
| **입력 데이터** | userId = "user-1", roleGroupIds = ["rg-3"] |
| **검증 포인트** | 실제 할당이 아닌 rg-3 기반 메뉴 트리 반환, prisma.userRoleGroup.findMany 호출 안됨 |
| **관련 요구사항** | FR-302 |

```typescript
// roleGroupIds가 제공되면 userRoleGroup 조회를 건너뛰고
// 직접 해당 roleGroupIds 기반으로 메뉴를 조회해야 함
```

#### UT-304: 빈 roleGroupIds 배열

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/menu-simulation.spec.ts` |
| **테스트 블록** | `describe('getMenuTreeForUser') -> it('빈 roleGroupIds는 빈 메뉴 트리를 반환한다')` |
| **Mock 의존성** | 없음 (빈 배열이므로 DB 조회 불필요) |
| **입력 데이터** | userId = "user-1", roleGroupIds = [] |
| **검증 포인트** | menus: [], summary: { totalMenus: 0, totalCategories: 0 } |
| **관련 요구사항** | FR-302 |

#### UT-305: summary 계산 (복수 카테고리)

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/menu-simulation.spec.ts` |
| **테스트 블록** | `describe('calculateSummary') -> it('메뉴 수와 카테고리 수를 정확히 계산한다')` |
| **Mock 의존성** | 없음 (순수 함수) |
| **입력 데이터** | 아래 참조 |
| **검증 포인트** | totalMenus === 5, totalCategories === 3 |
| **관련 요구사항** | FR-303 |

```typescript
const menus = [
  { category: "생산관리" }, // 2개
  { category: "생산관리" },
  { category: "품질관리" }, // 2개
  { category: "품질관리" },
  { category: "설비관리" }, // 1개
];
// 예상: { totalMenus: 5, totalCategories: 3 }
```

#### UT-306: summary 계산 (빈 목록)

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/menu-simulation.spec.ts` |
| **테스트 블록** | `describe('calculateSummary') -> it('빈 메뉴 목록은 0을 반환한다')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | `[]` |
| **검증 포인트** | `{ totalMenus: 0, totalCategories: 0 }` |
| **관련 요구사항** | FR-303 |

#### UT-307: 트리 노드 icon, path 매핑

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/menu-simulation.spec.ts` |
| **테스트 블록** | `describe('buildCategoryTree') -> it('트리 노드에 icon과 path를 포함한다')` |
| **Mock 의존성** | 없음 (순수 함수) |
| **입력 데이터** | 아래 참조 |
| **검증 포인트** | leaf 노드에 icon: "ScheduleOutlined", path: "/production/work-order" 존재 |
| **관련 요구사항** | FR-304 |

```typescript
const menus = [
  { id: 1, name: "작업지시", path: "/production/work-order", icon: "ScheduleOutlined", category: "생산관리", sortOrder: 1 },
];
const tree = buildCategoryTree(menus);
// tree[0].children[0].icon === "ScheduleOutlined"
// tree[0].children[0].path === "/production/work-order"
```

#### UT-308: 중복 메뉴 제거

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/menu-simulation.spec.ts` |
| **테스트 블록** | `describe('getMenuTreeForUser') -> it('여러 권한이 같은 메뉴를 참조해도 중복 없이 반환한다')` |
| **Mock 의존성** | prisma.menu.findMany (distinct 적용) |
| **입력 데이터** | 2개 권한이 같은 menuId=1 참조 |
| **검증 포인트** | 결과 메뉴에 id=1이 1개만 존재, summary.totalMenus에 중복 미포함 |
| **관련 요구사항** | BR-301 |

#### UT-309: category 기반 그룹핑

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/menu-simulation.spec.ts` |
| **테스트 블록** | `describe('buildCategoryTree') -> it('동일 category 메뉴를 같은 부모 노드 하위로 그룹핑한다')` |
| **Mock 의존성** | 없음 (순수 함수) |
| **입력 데이터** | category="생산관리" 메뉴 3개 |
| **검증 포인트** | tree 길이 1, tree[0].title === "생산관리", tree[0].children 길이 3 |
| **관련 요구사항** | BR-302 |

```typescript
const menus = [
  { id: 1, name: "작업지시", category: "생산관리", sortOrder: 1 },
  { id: 2, name: "생산현황", category: "생산관리", sortOrder: 2 },
  { id: 3, name: "실적등록", category: "생산관리", sortOrder: 3 },
];
const tree = buildCategoryTree(menus);
// tree.length === 1
// tree[0].title === "생산관리"
// tree[0].children.length === 3
```

#### UT-310: sortOrder 정렬

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/menu-simulation.spec.ts` |
| **테스트 블록** | `describe('buildCategoryTree') -> it('카테고리 내 메뉴를 sortOrder 순으로 정렬한다')` |
| **Mock 의존성** | 없음 (순수 함수) |
| **입력 데이터** | sortOrder 역순 입력 |
| **검증 포인트** | children 배열이 sortOrder 오름차순 |
| **관련 요구사항** | BR-302 |

```typescript
const menus = [
  { id: 3, name: "실적등록", category: "생산관리", sortOrder: 3 },
  { id: 1, name: "작업지시", category: "생산관리", sortOrder: 1 },
  { id: 2, name: "생산현황", category: "생산관리", sortOrder: 2 },
];
// Prisma orderBy로 정렬된 상태로 입력됨을 전제
// buildCategoryTree는 입력 순서를 유지하므로, 정렬은 Prisma 쿼리 책임
```

---

## 3. 통합 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| IT-301 | 사용자 ID 기반 메뉴 트리 조회 전체 흐름 | Mock DB 데이터 | GET /api/users/:id/menus 호출 | 200 + MenuTreeResponse (menus, summary) | FR-301, FR-303, FR-304, BR-301, BR-302 |
| IT-302 | roleGroupIds 시뮬레이션 조회 | Mock DB 데이터 | GET /api/users/:id/menus?roleGroupIds=rg-1,rg-2 | 200 + 시뮬레이션 기반 MenuTreeResponse | FR-302 |
| IT-303 | 존재하지 않는 사용자 에러 처리 | 사용자 없음 | GET /api/users/non-existent/menus | 404 + 에러 메시지 | FR-301 |

### 3.2 테스트 케이스 상세

#### IT-301: 사용자 ID 기반 메뉴 트리 조회

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/users/[id]/menus/__tests__/route.spec.ts` |
| **테스트명** | `test('사용자 실제 할당 기반 메뉴 트리를 200으로 반환한다')` |
| **사전조건** | Mock: user-1에 역할그룹 2개, 메뉴 3개 (2개 카테고리) |
| **검증 포인트** | |
| - 상태 코드 | 200 |
| - menus 구조 | 카테고리 노드 + leaf 노드 트리 |
| - summary | totalMenus === 3, totalCategories === 2 |
| - icon/path | leaf 노드에 icon, path 존재 |
| - 중복 제거 | 동일 메뉴가 1번만 등장 |
| **관련 요구사항** | FR-301, FR-303, FR-304, BR-301, BR-302 |

#### IT-302: roleGroupIds 시뮬레이션 조회

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/users/[id]/menus/__tests__/route.spec.ts` |
| **테스트명** | `test('roleGroupIds 파라미터로 시뮬레이션 메뉴 트리를 반환한다')` |
| **사전조건** | Mock: rg-3 역할그룹에 메뉴 2개 |
| **검증 포인트** | |
| - 상태 코드 | 200 |
| - menus | rg-3 기반 메뉴만 포함 (사용자 실제 할당 무관) |
| - summary | 시뮬레이션 기반 정확한 수치 |
| **관련 요구사항** | FR-302 |

#### IT-303: 존재하지 않는 사용자

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/users/[id]/menus/__tests__/route.spec.ts` |
| **테스트명** | `test('존재하지 않는 사용자 ID에 대해 404를 반환한다')` |
| **사전조건** | Mock: user 없음 |
| **검증 포인트** | 상태 코드 404, 에러 메시지 포함 |
| **관련 요구사항** | FR-301 |

---

## 4. 성능 테스트

### 4.1 API 응답 시간 테스트

| 테스트 ID | 시나리오 | 목표 | 측정 방법 |
|-----------|----------|------|----------|
| PERF-301 | 50개 메뉴, 10개 카테고리 트리 빌드 | 100ms 이내 | `performance.now()` 전후 측정 |

```typescript
// PERF-301 구현 가이드
it('50개 메뉴 트리 빌드가 100ms 이내에 완료된다', () => {
  const menus = generateMenus(50, 10); // 50개 메뉴, 10개 카테고리
  const start = performance.now();
  buildCategoryTree(menus);
  const elapsed = performance.now() - start;
  expect(elapsed).toBeLessThan(100);
});
```

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-MENU-PROD-1 | 생산관리 메뉴 1 | `{ id: 1, name: "작업지시", path: "/production/work-order", icon: "ScheduleOutlined", category: "생산관리", sortOrder: 1, isActive: true }` |
| MOCK-MENU-PROD-2 | 생산관리 메뉴 2 | `{ id: 2, name: "생산현황", path: "/production/status", icon: "BarChartOutlined", category: "생산관리", sortOrder: 2, isActive: true }` |
| MOCK-MENU-PROD-3 | 생산관리 메뉴 3 | `{ id: 3, name: "실적등록", path: "/production/result", icon: "FormOutlined", category: "생산관리", sortOrder: 3, isActive: true }` |
| MOCK-MENU-QUAL-1 | 품질관리 메뉴 1 | `{ id: 4, name: "검사관리", path: "/quality/inspection", icon: "SafetyOutlined", category: "품질관리", sortOrder: 1, isActive: true }` |
| MOCK-MENU-QUAL-2 | 품질관리 메뉴 2 | `{ id: 5, name: "불량관리", path: "/quality/defect", icon: "WarningOutlined", category: "품질관리", sortOrder: 2, isActive: true }` |
| MOCK-MENU-NO-ICON | 아이콘 없는 메뉴 | `{ id: 6, name: "기타메뉴", path: "/etc", icon: null, category: null, sortOrder: 1, isActive: true }` |

### 5.2 통합 테스트용 Mock 사용자

| 데이터 ID | 용도 | 구성 |
|-----------|------|------|
| MOCK-USER-MULTI-RG | 복수 역할그룹 사용자 | RoleGroup 2개 → Role 3개 → Permission 5개 → Menu 3개 (중복 1개 포함) |
| MOCK-USER-NO-RG | 역할그룹 없는 사용자 | UserRoleGroup 없음 |
| MOCK-USER-NOT-EXIST | 존재하지 않는 사용자 | DB에 없는 userId |

---

## 6. 테스트 커버리지 목표

### 6.1 단위 테스트 커버리지

| 대상 파일 | Lines 목표 | Branches 목표 | Functions 목표 |
|----------|-----------|--------------|---------------|
| `menu-simulation.ts` | 95% | 90% | 100% |
| `menu-tree.ts` (타입) | - | - | - |

### 6.2 통합 테스트 커버리지

| 구분 | 목표 |
|------|------|
| API 정상 흐름 | 100% |
| 시뮬레이션 모드 | 100% |
| 에러 케이스 | 100% (404, 400) |
| 비즈니스 규칙 (BR) | 100% 커버 |

---

## 관련 문서

- 설계 문서: `010-tech-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/rbac-enhancement/prd.md`
