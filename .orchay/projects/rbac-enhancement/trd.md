# RBAC 권한 관리 화면 분리 - TRD (Technical Requirements Document)

## 프로젝트 개요

| 항목 | 내용 |
|-----|------|
| 프로젝트명 | RBAC Enhancement - 권한 관리 화면 분리 |
| 상위 프로젝트 | MES Portal |
| 복잡도 등급 | Standard (Tier 2) |
| 영향 범위 | `/system/authority`, `/system/role-groups` 2개 화면 + 1개 API |

---

## 1. 기술 스택

상위 프로젝트(MES Portal) TRD 기술 스택을 그대로 따름:
- Next.js 16.x (App Router), React 19.x, TypeScript 5.x
- Ant Design 6.x, TailwindCSS 4.x, @ant-design/icons
- Prisma 7.x, SQLite (MVP)
- Vitest, @testing-library/react

---

## 2. 컴포넌트 구조

### 2.1 화면 1: 역할그룹 정의 (`/system/role-groups`)

```
app/(portal)/system/role-groups/page.tsx        # 페이지 (3-column 레이아웃)
  ├─ RoleGroupListPanel                          # 좌측: 역할그룹 목록
  │   ├─ RoleGroupSearchBar                      # 검색/필터
  │   ├─ RoleGroupTable                          # 테이블
  │   └─ RoleGroupFormModal                      # 등록/수정 모달
  ├─ RoleManagementPanel                         # 중앙: 역할 관리
  │   ├─ AssignedRolesTable                      # 할당된 역할
  │   ├─ AllRolesTable                           # 전체 역할 (체크박스)
  │   └─ RoleFormModal                           # 등록/수정 모달
  └─ PermissionManagementPanel                   # 우측: 권한 관리
      ├─ AssignedPermissionsTable                # 할당된 권한
      ├─ AllPermissionsTable                     # 전체 권한 (체크박스)
      └─ PermissionFormModal                     # 등록/수정 모달
```

### 2.2 화면 2: 사용자 역할그룹 할당 (`/system/authority`)

```
app/(portal)/system/authority/page.tsx           # 페이지 (3-column 레이아웃)
  ├─ UserListPanel                               # 좌측: 사용자 목록
  │   ├─ UserSearchBar                           # 검색/필터
  │   └─ UserTable                               # 테이블
  ├─ RoleGroupAssignmentPanel                    # 중앙: 역할그룹 할당
  │   ├─ AssignedRoleGroupsTable                 # 보유 역할그룹
  │   ├─ AllRoleGroupsTable                      # 전체 역할그룹 (체크박스)
  │   └─ SaveButton                              # 저장
  └─ MenuSimulationPanel                         # 우측: 메뉴 시뮬레이션
      ├─ MenuTree (Ant Design Tree)              # 메뉴 트리
      └─ MenuSummary                             # 요약 (메뉴 수/카테고리 수)
```

### 2.3 컴포넌트 배치 전략

모든 컴포넌트는 각 페이지 파일 내에 인라인으로 정의. 재사용 가능한 패턴이 확인되면 추후 `components/` 하위로 추출.

---

## 3. API 명세

### 3.1 기존 API (변경 없음)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/users` | 사용자 목록 |
| GET | `/api/users/:id/role-groups` | 사용자 역할그룹 조회 |
| PUT | `/api/users/:id/role-groups` | 사용자 역할그룹 할당 |
| GET | `/api/role-groups` | 역할그룹 목록 |
| POST | `/api/role-groups` | 역할그룹 생성 |
| PUT | `/api/role-groups/:id` | 역할그룹 수정 |
| DELETE | `/api/role-groups/:id` | 역할그룹 삭제 |
| GET | `/api/role-groups/:id/roles` | 역할그룹 역할 조회 |
| POST | `/api/role-groups/:id/roles` | 역할그룹 역할 할당 |
| GET | `/api/roles` | 역할 목록 |
| GET | `/api/roles/:id/permissions` | 역할 권한 조회 |
| PUT | `/api/roles/:id/permissions` | 역할 권한 할당 |
| GET | `/api/permissions` | 권한 목록 |

### 3.2 신규 API

#### `GET /api/users/:id/menus`

사용자의 역할그룹 기반 접근 가능 메뉴 트리 조회.

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `roleGroupIds` | `string` | N | 콤마 구분 역할그룹 ID 목록 (시뮬레이션용). 미지정 시 사용자 실제 할당 기준 |

**Response:**
```typescript
interface MenuTreeResponse {
  menus: MenuTreeNode[];
  summary: {
    totalMenus: number;
    totalCategories: number;
  };
}

interface MenuTreeNode {
  key: string;        // menu ID
  title: string;      // 메뉴 이름
  icon?: string;      // 아이콘 키 (iconMap 매핑용)
  path?: string;      // 라우트 경로
  children?: MenuTreeNode[];
}
```

**구현:**
1. 역할그룹 ID 목록 → RoleGroupRole → Role → RolePermission → Permission (menuId not null) → Menu
2. Menu의 category path 기반으로 트리 구조 빌드 (`MenuService.buildCategoryTree` 활용)
3. 중복 메뉴 제거 (여러 역할/권한이 같은 메뉴를 참조할 수 있음)

---

## 4. 레이아웃 패턴

### 4.1 전체 화면 레이아웃

```tsx
// 페이지 루트
<div className="h-full flex flex-col p-6 overflow-hidden">
  {/* 헤더 영역 */}
  <div className="mb-4">
    <Typography.Title level={4}>화면 제목</Typography.Title>
  </div>
  {/* 메인 콘텐츠 - 3-column */}
  <div className="flex-1 flex gap-4 overflow-hidden">
    <Card className="flex-none" style={{ width: '35%' }}>...</Card>
    <Card className="flex-none" style={{ width: '33%' }}>...</Card>
    <Card className="flex-1">...</Card>
  </div>
</div>
```

### 4.2 각 컬럼 내부 패턴

```tsx
<Card title="컬럼 제목" className="h-full flex flex-col">
  {/* 검색/필터 */}
  <div className="mb-3 flex gap-2">...</div>
  {/* 할당된 항목 */}
  <Typography.Text strong>할당된 항목</Typography.Text>
  <Table size="small" scroll={{ y: 200 }} ... />
  <Divider />
  {/* 전체 항목 */}
  <Typography.Text strong>전체 항목</Typography.Text>
  <Table size="small" scroll={{ y: 200 }} ... />
  <Button type="primary">할당 저장</Button>
</Card>
```

---

## 5. 데이터 모델 참조

기존 Prisma 스키마의 RBAC 모델을 그대로 활용:

```
User ↔ UserRoleGroup ↔ RoleGroup
RoleGroup ↔ RoleGroupRole ↔ Role
Role ↔ RolePermission ↔ Permission
Permission → Menu (optional FK)
```

신규 테이블 추가 없음.

---

## 6. 스타일링 규칙

MES Portal TRD 섹션 1.5 준수:

1. **적용 우선순위**: Ant Design Token → CSS Variables → TailwindCSS → Ant Design props
2. **금지**: 개별 CSS 파일, 인라인 style, 하드코딩 색상/크기, !important
3. **레이아웃**: TailwindCSS flex/gap/overflow 유틸리티 사용
4. **컴포넌트**: Ant Design Card, Table, Modal, Tree, Input, Select, Button, Popconfirm, Typography, Divider

---

## 7. 테스트 전략

### 7.1 단위 테스트 (Vitest + @testing-library/react)
- 각 패널 컴포넌트 렌더링 테스트
- 선택 이벤트에 따른 패널 갱신 테스트
- 메뉴 시뮬레이션 트리 빌드 로직 테스트

### 7.2 통합 테스트
- API 응답 mock 기반 화면 시나리오 테스트
- 역할그룹 선택 → 역할 로딩 → 역할 선택 → 권한 로딩 흐름
- 사용자 선택 → 역할그룹 할당 → 메뉴 시뮬레이션 갱신 흐름

### 7.3 검증
- `pnpm build` — 빌드 에러 없음
- `pnpm test:run` — 기존 + 신규 테스트 통과
