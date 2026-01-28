# TSK-02-01 구현 문서 - 사용자 역할그룹 할당 화면

## 1. 구현 개요

| 항목 | 내용 |
|-----|------|
| Task | TSK-02-01 |
| Task명 | 사용자 역할그룹 할당 화면 구현 |
| 구현 파일 | `app/(portal)/system/authority/page.tsx` |
| 테스트 파일 | `app/(portal)/system/authority/__tests__/AuthorityPage.test.tsx` |
| 상태 | 완료 |

## 2. 구현 파일 목록

| 파일 경로 | 변경 유형 | 설명 |
|----------|----------|------|
| `mes-portal/app/(portal)/system/authority/page.tsx` | 수정 | 3-column 레이아웃으로 재구성 (사용자 목록 / 역할그룹 할당 / 메뉴 시뮬레이션) |
| `mes-portal/app/(portal)/system/authority/__tests__/AuthorityPage.test.tsx` | 신규 | 화면 렌더링 및 상호작용 테스트 (8개) |

## 3. 주요 구현 내용

### 3.1 3-Column 레이아웃

| 영역 | 비율 | 역할 |
|------|------|------|
| 좌측 | 30% | 사용자 목록 (이름/이메일 검색, 상태 필터) |
| 중앙 | 35% | 역할그룹 할당 (보유 역할그룹 read-only + 전체 역할그룹 체크박스 + 저장) |
| 우측 | 35% | 메뉴 시뮬레이션 (Tree 컴포넌트, read-only, 요약 정보) |

### 3.2 좌측 패널 - 사용자 목록

- `Input.Search`: 이름/이메일 검색
- `Select`: 상태 필터 (전체/활성/비활성)
- `Table`: 이름, 이메일, 상태(Tag) 컬럼
- 행 클릭 시 `selectedUser` 설정 → 중앙/우측 패널 갱신

### 3.3 중앙 패널 - 역할그룹 할당

- **보유 역할그룹 Card**: 사용자에게 할당된 역할그룹 read-only Table (이름, 코드, 상태)
- **전체 역할그룹 Card**: 체크박스 포함 Table (선택, 이름, 코드, 상태)
  - 보유 역할그룹은 체크 상태로 초기화
  - 체크박스 변경 시 `selectedRgIds` 업데이트
- **[저장] 버튼**: PUT /api/users/:id/role-groups 호출
- 사용자 미선택 시 `Empty` 컴포넌트: "사용자를 선택해주세요"

### 3.4 우측 패널 - 메뉴 시뮬레이션

- `Tree` 컴포넌트: 접근 가능 메뉴를 트리 구조로 표시
  - `defaultExpandAll={true}`: 모든 노드 펼침
  - `showIcon={true}`: 아이콘 표시 (iconMap 매핑)
  - `selectable={false}`: 클릭 시 네비게이션 없음 (read-only)
- 요약 정보: "접근 가능 메뉴: N개 메뉴 / M개 카테고리"
- 사용자 미선택 시 `Empty` 컴포넌트

### 3.5 실시간 메뉴 시뮬레이션 (debounce 300ms)

```
체크박스 변경
  → selectedRgIds 업데이트
  → debounce 300ms
  → GET /api/users/:id/menus?roleGroupIds=id1,id2,...
  → menuTree, menuSummary 갱신
```

- `useMemo`로 debounce 함수 생성
- `useEffect`로 `selectedRgIds` 변경 감지 및 API 호출
- 연속 체크박스 변경 시 마지막 변경 후 300ms 경과 시 1회만 호출

### 3.6 미저장 변경사항 경고

- `isDirty` 상태: 체크박스 변경 여부 추적
- dirty 상태에서 다른 사용자 클릭 시 `Modal.confirm` 표시
  - [전환]: 변경사항 버리고 사용자 전환
  - [취소]: 현재 사용자 유지

### 3.7 데이터 흐름

```
사용자 행 클릭
  → setSelectedUser(user)
  → GET /api/users/:id/role-groups → assignedRoleGroups
  → GET /api/role-groups → allRoleGroups
  → assignedRoleGroups의 ID로 selectedRgIds 초기화
  → GET /api/users/:id/menus → menuTree, menuSummary

체크박스 변경 → debounce 300ms → GET /api/users/:id/menus?roleGroupIds=...

저장 → PUT /api/users/:id/role-groups → 성공 시 재조회 + message.success
```

## 4. API/컴포넌트 인터페이스

### 4.1 사용된 API

| API | Method | 용도 |
|-----|--------|------|
| `/api/users` | GET | 사용자 목록 조회 |
| `/api/users/:id/role-groups` | GET | 사용자 보유 역할그룹 조회 |
| `/api/users/:id/role-groups` | PUT | 역할그룹 할당 저장 |
| `/api/role-groups` | GET | 전체 역할그룹 목록 조회 |
| `/api/users/:id/menus` | GET | 메뉴 시뮬레이션 조회 (TSK-03-01) |
| `/api/users/:id/menus?roleGroupIds=...` | GET | 메뉴 시뮬레이션 (역할그룹 변경 시) |

### 4.2 상태 관리

```typescript
// 사용자 선택
selectedUser: User | null
userSearch: string
userStatusFilter: string | undefined

// 역할그룹 할당
assignedRoleGroups: RoleGroup[]
allRoleGroups: RoleGroup[]
selectedRgIds: Set<string>
isDirty: boolean

// 메뉴 시뮬레이션
menuTree: MenuTreeNode[]
menuSummary: { totalMenus: number; totalCategories: number }
```

### 4.3 의존성

| 의존 대상 | 유형 | 설명 |
|----------|------|------|
| TSK-03-01 (메뉴 시뮬레이션 API) | API | GET /api/users/:id/menus 엔드포인트 사용 |
| iconMap (Sidebar.tsx) | 유틸리티 | 메뉴 아이콘 매핑 재사용 |

## 5. 변경 이력

| 날짜 | 내용 |
|-----|------|
| 2026-01-28 | 최초 구현 |
