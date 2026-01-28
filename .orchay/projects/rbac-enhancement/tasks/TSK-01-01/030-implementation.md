# TSK-01-01 구현 문서 - 역할그룹 정의 화면

## 1. 구현 개요

| 항목 | 내용 |
|-----|------|
| Task | TSK-01-01 |
| Task명 | 역할그룹 정의 화면 구현 |
| 구현 파일 | `app/(portal)/system/role-groups/page.tsx` |
| 테스트 파일 | `app/(portal)/system/role-groups/__tests__/RoleGroupsPage.test.tsx` |
| 상태 | 완료 |

## 2. 구현 파일 목록

| 파일 경로 | 변경 유형 | 설명 |
|----------|----------|------|
| `mes-portal/app/(portal)/system/role-groups/page.tsx` | 수정 | 3-column master-detail 레이아웃으로 재구성 |
| `mes-portal/app/(portal)/system/role-groups/__tests__/RoleGroupsPage.test.tsx` | 신규 | 화면 렌더링 및 상호작용 테스트 |

## 3. 주요 구현 내용

### 3.1 3-Column Master-Detail 레이아웃

| 영역 | 비율 | 역할 |
|------|------|------|
| 좌측 | 35% | 역할그룹 목록 (검색, 시스템/상태 필터, CRUD, 페이지네이션) |
| 중앙 | 33% | 역할 관리 (선택된 역할그룹의 할당된 역할 + 전체 역할 체크박스 + 할당 저장) |
| 우측 | 32% | 권한 관리 (선택된 역할의 할당된 권한 + 전체 권한 체크박스 + 할당 저장) |

### 3.2 좌측 패널 - 역할그룹 목록

- `Input.Search`: 이름/코드 검색
- `Select`: 시스템 필터, 상태 필터
- `Table`: 역할그룹 코드, 이름, 시스템, 상태(Tag), 액션(수정/삭제)
- `Pagination`: pageSize 15
- 행 클릭 시 `selectedRoleGroup` 설정 및 중앙 패널 갱신
- `Button`: 역할그룹 등록 (모달)

### 3.3 중앙 패널 - 역할 관리

- Card title: "역할 관리", subtitle: 선택된 역할그룹명
- 미선택 시 `Empty` 컴포넌트 표시: "역할그룹을 선택하면 역할 목록이 표시됩니다."
- 상단: 검색 + 상태 필터 + 등록 버튼 + 새로고침
- `Divider`: "할당된 역할" / "전체 역할"
- 할당된 역할 Table: 이름, 코드, 상태, 액션 (행 클릭 → 우측 패널 갱신)
- 전체 역할 Table: 체크박스 + 이름, 코드, 상태 (할당된 역할은 체크 상태)
- `Button`: [할당 저장] → POST /api/role-groups/:id/roles

### 3.4 우측 패널 - 권한 관리

- Card title: "권한 관리", subtitle: 선택된 역할명
- 미선택 시 `Empty` 컴포넌트 표시: "역할을 선택하면 권한 목록이 표시됩니다."
- 상단: 검색 + 유형 필터 + 등록 버튼 + 새로고침
- `Divider`: "할당된 권한" / "전체 권한"
- 할당된 권한 Table: 이름, 코드, 유형, 액션
- 전체 권한 Table: 체크박스 + 이름, 코드, 유형
- `Button`: [할당 저장] → PUT /api/roles/:id/permissions

### 3.5 모달

| 모달 | 필드 | 용도 |
|------|------|------|
| 역할그룹 등록/수정 | 코드, 이름, 시스템, 설명, 활성상태 | 역할그룹 CRUD |
| 역할 등록/수정 | 코드, 이름, 설명, 활성상태 | 역할 CRUD |
| 권한 등록/수정 | 코드, 이름, 유형(메뉴/API/데이터), 설명, 활성상태 | 권한 CRUD |
| 삭제 확인 | Popconfirm | "정말 삭제하시겠습니까?" |

### 3.6 데이터 흐름

```
역할그룹 행 클릭 → selectedRoleGroup 설정 → selectedRole 초기화(null)
  → GET /api/role-groups/:id/roles → assignedRoles
  → GET /api/roles → allRoles

할당된 역할 행 클릭 → selectedRole 설정
  → GET /api/roles/:id/permissions → assignedPermissions
  → GET /api/permissions → allPermissions

역할 할당 저장 → POST /api/role-groups/:id/roles (selectedRoleIds)
권한 할당 저장 → PUT /api/roles/:id/permissions (selectedPermIds)
```

## 4. API/컴포넌트 인터페이스

### 4.1 사용된 API

| API | Method | 용도 |
|-----|--------|------|
| `/api/role-groups` | GET | 역할그룹 목록 조회 |
| `/api/role-groups` | POST | 역할그룹 등록 |
| `/api/role-groups/:id` | PUT | 역할그룹 수정 |
| `/api/role-groups/:id` | DELETE | 역할그룹 삭제 |
| `/api/role-groups/:id/roles` | GET | 역할그룹에 할당된 역할 조회 |
| `/api/role-groups/:id/roles` | POST | 역할 할당 저장 |
| `/api/roles` | GET | 전체 역할 목록 조회 |
| `/api/roles` | POST | 역할 등록 |
| `/api/roles/:id` | PUT | 역할 수정 |
| `/api/roles/:id` | DELETE | 역할 삭제 |
| `/api/roles/:id/permissions` | GET | 역할에 할당된 권한 조회 |
| `/api/roles/:id/permissions` | PUT | 권한 할당 저장 |
| `/api/permissions` | GET | 전체 권한 목록 조회 |
| `/api/permissions` | POST | 권한 등록 |
| `/api/permissions/:id` | PUT | 권한 수정 |
| `/api/permissions/:id` | DELETE | 권한 삭제 |

### 4.2 상태 관리

```typescript
// 선택 상태
selectedRoleGroup: RoleGroup | null
selectedRole: Role | null

// 역할그룹 목록
roleGroups: RoleGroup[], rgSearch, rgSystemFilter, rgStatusFilter, rgPage

// 역할 관리
assignedRoles: Role[], allRoles: Role[], selectedRoleIds: Set<string>

// 권한 관리
assignedPermissions: Permission[], allPermissions: Permission[], selectedPermIds: Set<string>
```

## 5. 변경 이력

| 날짜 | 내용 |
|-----|------|
| 2026-01-28 | 최초 구현 |
