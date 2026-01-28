# TSK-02-01 사용자 역할그룹 할당 화면 상세 설계서

## 1. 화면 개요

| 항목 | 내용 |
|-----|------|
| 화면명 | 사용자 권한 할당 |
| 경로 | `/system/authority` |
| 파일 | `app/(portal)/system/authority/page.tsx` |
| 레이아웃 | 3-column (30% / 35% / 35%) |
| 기반 | 기존 authority 페이지 재구성 |

## 2. 레이아웃

```
┌──────────────────────────────────────────────────────────────────────┐
│ 사용자 권한 할당                                                      │
├──────────────────┬──────────────────────────┬────────────────────────┤
│ 사용자 목록 (30%) │ 역할그룹 할당 (35%)       │ 메뉴 시뮬레이션 (35%)  │
│                  │                          │                        │
│ [이름/이메일 검색]│ ── 보유 역할그룹 ──       │ ┌──────────────────┐  │
│ [상태▼]          │ ┌────────────────────┐   │ │ 📁 생산관리       │  │
│                  │ │ Table (read-only)  │   │ │  ├ 작업지시       │  │
│ ┌──────────────┐ │ └────────────────────┘   │ │  ├ 생산현황       │  │
│ │ Table        │ │                          │ │  └ 실적등록       │  │
│ │ (사용자)     │ │ ── 전체 역할그룹 ──       │ │ 📁 품질관리       │  │
│ └──────────────┘ │ ┌────────────────────┐   │ │  ├ 검사관리       │  │
│                  │ │ Table (☑)          │   │ │  └ 불량관리       │  │
│ 행 클릭 →        │ └────────────────────┘   │ └──────────────────┘  │
│ 역할그룹/메뉴    │          [저장]           │                        │
│ 패널 갱신        │                          │ 접근 가능 메뉴:        │
│                  │ ☑ 변경 시 →              │ 12개 메뉴 / 4개 카테고리│
│                  │ 메뉴 시뮬레이션 실시간 갱신│                        │
└──────────────────┴──────────────────────────┴────────────────────────┘
```

## 3. 상태 관리

```typescript
// 사용자 선택
const [selectedUser, setSelectedUser] = useState<User | null>(null);
const [userSearch, setUserSearch] = useState('');
const [userStatusFilter, setUserStatusFilter] = useState<string | undefined>();

// 역할그룹 할당
const [assignedRoleGroups, setAssignedRoleGroups] = useState<RoleGroup[]>([]);
const [allRoleGroups, setAllRoleGroups] = useState<RoleGroup[]>([]);
const [selectedRgIds, setSelectedRgIds] = useState<Set<string>>(new Set());

// 메뉴 시뮬레이션
const [menuTree, setMenuTree] = useState<MenuTreeNode[]>([]);
const [menuSummary, setMenuSummary] = useState({ totalMenus: 0, totalCategories: 0 });
```

## 4. 데이터 흐름

```
사용자 행 클릭
  → setSelectedUser(user)
  → GET /api/users/:id/role-groups → setAssignedRoleGroups
  → GET /api/role-groups → setAllRoleGroups
  → assignedRoleGroups의 ID로 selectedRgIds 초기화
  → GET /api/users/:id/menus → setMenuTree, setMenuSummary

역할그룹 체크박스 변경
  → setSelectedRgIds(newIds)
  → debounce 300ms
  → GET /api/users/:id/menus?roleGroupIds=id1,id2,... → 메뉴 트리 갱신

할당 저장
  → PUT /api/users/:id/role-groups (selectedRgIds 배열)
  → 성공 시 assignedRoleGroups 재조회
  → message.success('저장되었습니다')
```

## 5. 테이블 컬럼 정의

### 5.1 사용자 테이블
| 컬럼 | dataIndex | width | 설명 |
|------|-----------|-------|------|
| 이름 | `name` | 100 | |
| 이메일 | `email` | 150 | |
| 상태 | `isActive` | 80 | Tag |

### 5.2 역할그룹 테이블 (보유)
| 컬럼 | dataIndex | width | 설명 |
|------|-----------|-------|------|
| 이름 | `name` | 120 | |
| 코드 | `roleGroupCd` | 100 | |
| 상태 | `isActive` | 80 | Tag |

### 5.3 역할그룹 테이블 (전체, 체크박스)
| 컬럼 | dataIndex | width | 설명 |
|------|-----------|-------|------|
| 선택 | - | 50 | Checkbox |
| 이름 | `name` | 120 | |
| 코드 | `roleGroupCd` | 100 | |
| 상태 | `isActive` | 80 | Tag |

## 6. 메뉴 시뮬레이션 컴포넌트

```typescript
// Tree 데이터 변환
const treeData: DataNode[] = menuTree.map(node => ({
  key: node.key,
  title: node.title,
  icon: node.icon ? iconMap[node.icon] : <FolderOutlined />,
  children: node.children?.map(child => ({
    key: child.key,
    title: child.title,
    icon: child.icon ? iconMap[child.icon] : <FileTextOutlined />,
    children: child.children?.map(/* ... */),
  })),
}));

// 렌더링
<Card title="메뉴 시뮬레이션" className="h-full flex flex-col">
  <div className="flex-1 overflow-auto">
    <Tree
      treeData={treeData}
      defaultExpandAll
      showIcon
      selectable={false}  // read-only
    />
  </div>
  <Divider />
  <Typography.Text type="secondary">
    접근 가능 메뉴: {menuSummary.totalMenus}개 메뉴 / {menuSummary.totalCategories}개 카테고리
  </Typography.Text>
</Card>
```

### 아이콘 매핑

`components/layout/Sidebar.tsx`의 `iconMap` 객체를 별도 유틸리티로 추출하여 재사용:

```typescript
// lib/utils/iconMap.ts (추출 대상)
// 현재 Sidebar.tsx에 정의된 iconMap을 import하여 사용
// 또는 동일한 매핑을 메뉴 시뮬레이션 컴포넌트 내에 인라인 정의
```

## 7. 실시간 갱신 로직

```typescript
// debounce를 사용한 메뉴 시뮬레이션 갱신
const fetchMenuSimulation = useMemo(
  () => debounce(async (userId: string, rgIds: string[]) => {
    const params = new URLSearchParams();
    if (rgIds.length > 0) {
      params.set('roleGroupIds', rgIds.join(','));
    }
    const res = await fetch(`/api/users/${userId}/menus?${params}`);
    const data = await res.json();
    setMenuTree(data.menus);
    setMenuSummary(data.summary);
  }, 300),
  []
);

// 체크박스 변경 시 호출
useEffect(() => {
  if (selectedUser) {
    fetchMenuSimulation(selectedUser.id, Array.from(selectedRgIds));
  }
}, [selectedRgIds, selectedUser]);
```

## 8. 에러 처리

- 사용자 미선택 시: 중앙/우측 패널에 "사용자를 선택해주세요" Empty 컴포넌트 표시
- API 실패: `message.error()` 알림
- 할당 변경 후 다른 사용자 선택 시: 미저장 변경사항 경고 (Modal.confirm)
