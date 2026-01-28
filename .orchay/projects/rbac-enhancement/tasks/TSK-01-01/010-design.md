# TSK-01-01 역할그룹 정의 화면 상세 설계서

## 1. 화면 개요

| 항목 | 내용 |
|-----|------|
| 화면명 | 역할그룹 정의 |
| 경로 | `/system/role-groups` |
| 파일 | `app/(portal)/system/role-groups/page.tsx` |
| 레이아웃 | 3-column master-detail (35% / 33% / 32%) |
| 기반 | 기존 role-groups 페이지 확장 |

## 2. 레이아웃

```
┌──────────────────────────────────────────────────────────────────────┐
│ 역할그룹 정의                                                        │
├────────────────────┬──────────────────────┬──────────────────────────┤
│ 역할그룹 목록 (35%) │ 역할 관리 (33%)       │ 권한 관리 (32%)          │
│                    │ « 선택된 역할그룹명 »  │ « 선택된 역할명 »        │
│ [검색] [시스템▼]   │ [검색] [상태▼]        │ [검색] [유형▼]           │
│ [상태▼] [등록]     │ [등록] [새로고침]     │ [등록] [새로고침]        │
│                    │                      │                          │
│ ┌──────────────┐   │ ── 할당된 역할 ──     │ ── 할당된 권한 ──        │
│ │ Table        │   │ ┌──────────────┐     │ ┌────────────────┐      │
│ │ (역할그룹)   │   │ │ Table        │     │ │ Table          │      │
│ └──────────────┘   │ └──────────────┘     │ └────────────────┘      │
│                    │ ── 전체 역할 ──       │ ── 전체 권한 ──          │
│ < 페이지네이션 >   │ ┌──────────────┐     │ ┌────────────────┐      │
│                    │ │ Table (☑)    │     │ │ Table (☑)      │      │
│ 행 클릭 →          │ └──────────────┘     │ └────────────────┘      │
│ 역할 패널 갱신     │ [할당 저장]           │ [할당 저장]              │
│                    │ 할당된 역할 클릭 →    │                          │
│                    │ 권한 패널 갱신        │                          │
└────────────────────┴──────────────────────┴──────────────────────────┘
```

## 3. 상태 관리

```typescript
// 선택 상태
const [selectedRoleGroup, setSelectedRoleGroup] = useState<RoleGroup | null>(null);
const [selectedRole, setSelectedRole] = useState<Role | null>(null);

// 역할그룹 목록
const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
const [rgSearch, setRgSearch] = useState('');
const [rgSystemFilter, setRgSystemFilter] = useState<string | undefined>();
const [rgStatusFilter, setRgStatusFilter] = useState<string | undefined>();
const [rgPage, setRgPage] = useState(1);

// 역할 관리 (중앙)
const [assignedRoles, setAssignedRoles] = useState<Role[]>([]);
const [allRoles, setAllRoles] = useState<Role[]>([]);
const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
const [roleSearch, setRoleSearch] = useState('');
const [roleStatusFilter, setRoleStatusFilter] = useState<string | undefined>();

// 권한 관리 (우측)
const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>([]);
const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
const [selectedPermIds, setSelectedPermIds] = useState<Set<string>>(new Set());
const [permSearch, setPermSearch] = useState('');
const [permTypeFilter, setPermTypeFilter] = useState<string | undefined>();
```

## 4. 데이터 흐름

```
역할그룹 행 클릭
  → setSelectedRoleGroup(rg)
  → setSelectedRole(null)  // 권한 패널 초기화
  → GET /api/role-groups/:id/roles → setAssignedRoles
  → GET /api/roles → setAllRoles
  → assignedRoles의 ID로 selectedRoleIds 초기화

할당된 역할 행 클릭
  → setSelectedRole(role)
  → GET /api/roles/:id/permissions → setAssignedPermissions
  → GET /api/permissions → setAllPermissions
  → assignedPermissions의 ID로 selectedPermIds 초기화

역할 할당 저장
  → POST /api/role-groups/:id/roles (selectedRoleIds 배열)
  → 성공 시 assignedRoles 재조회

권한 할당 저장
  → PUT /api/roles/:id/permissions (selectedPermIds 배열)
  → 성공 시 assignedPermissions 재조회
```

## 5. 테이블 컬럼 정의

### 5.1 역할그룹 테이블
| 컬럼 | dataIndex | width | 설명 |
|------|-----------|-------|------|
| 코드 | `roleGroupCd` | 100 | 역할그룹 코드 |
| 이름 | `name` | 120 | 역할그룹 이름 |
| 시스템 | `system.name` | 100 | 소속 시스템 |
| 상태 | `isActive` | 80 | Tag 컴포넌트 |
| 액션 | - | 80 | 수정/삭제 버튼 |

### 5.2 역할 테이블 (할당된)
| 컬럼 | dataIndex | width | 설명 |
|------|-----------|-------|------|
| 이름 | `name` | 120 | 역할 이름 |
| 코드 | `roleCd` | 100 | 역할 코드 |
| 상태 | `isActive` | 80 | Tag |
| 액션 | - | 80 | 수정/삭제 |

### 5.3 권한 테이블 (할당된)
| 컬럼 | dataIndex | width | 설명 |
|------|-----------|-------|------|
| 이름 | `name` | 120 | 권한 이름 |
| 코드 | `permissionCd` | 100 | 권한 코드 |
| 유형 | `type` | 80 | 메뉴/API/데이터 |
| 액션 | - | 80 | 수정/삭제 |

## 6. 모달 정의

### 6.1 역할그룹 등록/수정 모달
- 기존 구현 유지 (이름, 코드, 시스템, 설명, 활성상태)

### 6.2 역할 등록/수정 모달
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| 역할명 | Input | Y | |
| 역할코드 | Input | Y | 등록 시만 입력 |
| 설명 | Input.TextArea | N | |
| 활성상태 | Switch | Y | 기본값: true |

### 6.3 권한 등록/수정 모달
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| 권한명 | Input | Y | |
| 권한코드 | Input | Y | 등록 시만 입력 |
| 유형 | Select | Y | 메뉴/API/데이터 |
| 설명 | Input.TextArea | N | |
| 활성상태 | Switch | Y | 기본값: true |

## 7. 에러 처리

- API 호출 실패: `message.error()` 알림
- 할당 저장 실패: 에러 메시지 표시, 기존 상태 유지
- 삭제 시: Popconfirm으로 확인 후 진행
