# TSK-01-01 추적성 매트릭스 - 역할그룹 정의 화면

## 1. 요구사항 → 설계 → 컴포넌트 → 테스트 매핑

| 요구사항 ID | 요구사항 설명 | 설계 섹션 | UI 컴포넌트 | 테스트 ID |
|------------|-------------|----------|------------|----------|
| FR-101 | 역할그룹 목록 표시 (코드, 이름, 시스템, 상태, 액션) | 010 §5.1, 011 §3.1 | 좌측 Table | TC-101 |
| FR-102 | 역할그룹 검색 (이름/코드), 시스템 필터, 상태 필터 | 010 §3, 011 §3.1 | Input.Search, Select x2 | TC-102 |
| FR-103 | 역할그룹 등록/수정/삭제 모달 | 010 §6.1, 011 §4.1, §4.4 | Modal+Form, Popconfirm | TC-103 |
| FR-104 | 역할그룹 행 클릭 → 중앙 역할 패널 갱신 | 010 §4, 011 §2.2 | Table onRow.onClick | TC-104 |
| FR-105 | 할당된 역할 테이블 + 전체 역할 테이블(체크박스) | 010 §5.2, 011 §3.2 | Table x2 (rowSelection) | TC-105 |
| FR-106 | 역할 등록/수정/삭제 | 010 §6.2, 011 §4.2, §4.4 | Modal+Form, Popconfirm | TC-106 |
| FR-107 | 역할 할당 저장 | 010 §4, 011 §3.2 | Button "할당 저장" | TC-107 |
| FR-108 | 할당된 역할 클릭 → 우측 권한 패널 갱신 | 010 §4, 011 §2.3 | Table onRow.onClick | TC-108 |
| FR-109 | 할당된 권한 테이블 + 전체 권한 테이블(체크박스) | 010 §5.3, 011 §3.3 | Table x2 (rowSelection) | TC-109 |
| FR-110 | 권한 등록/수정/삭제 | 010 §6.3, 011 §4.3, §4.4 | Modal+Form, Popconfirm | TC-110 |
| FR-111 | 권한 할당 저장 | 010 §4, 011 §3.3 | Button "할당 저장" | TC-111 |
| FR-112 | 전체 화면 레이아웃 (MDI 탭 영역 채움) | 011 §1.1 | h-full flex flex-col | TC-112 |
| BR-101 | 미선택 시 중앙/우측 패널 안내 메시지 | 011 §2.1 | Empty 컴포넌트 | TC-113 |

## 2. API → 요구사항 매핑

| API 엔드포인트 | Method | 관련 요구사항 |
|---------------|--------|-------------|
| `/api/role-groups` | GET | FR-101, FR-102 |
| `/api/role-groups` | POST | FR-103 |
| `/api/role-groups/:id` | PUT | FR-103 |
| `/api/role-groups/:id` | DELETE | FR-103 |
| `/api/role-groups/:id/roles` | GET | FR-104, FR-105 |
| `/api/role-groups/:id/roles` | POST | FR-107 |
| `/api/roles` | GET | FR-105 |
| `/api/roles` | POST | FR-106 |
| `/api/roles/:id` | PUT | FR-106 |
| `/api/roles/:id` | DELETE | FR-106 |
| `/api/roles/:id/permissions` | GET | FR-108, FR-109 |
| `/api/roles/:id/permissions` | PUT | FR-111 |
| `/api/permissions` | GET | FR-109 |
| `/api/permissions` | POST | FR-110 |
| `/api/permissions/:id` | PUT | FR-110 |
| `/api/permissions/:id` | DELETE | FR-110 |

## 3. 상태 → 요구사항 매핑

| 상태 변수 | 관련 요구사항 |
|----------|-------------|
| `selectedRoleGroup` | FR-104, BR-101 |
| `selectedRole` | FR-108, BR-101 |
| `roleGroups` | FR-101 |
| `rgSearch`, `rgSystemFilter`, `rgStatusFilter` | FR-102 |
| `assignedRoles` | FR-105 |
| `allRoles`, `selectedRoleIds` | FR-105, FR-107 |
| `assignedPermissions` | FR-109 |
| `allPermissions`, `selectedPermIds` | FR-109, FR-111 |
