# TSK-02-01 추적성 매트릭스 - 사용자 역할그룹 할당 화면

## 1. 요구사항 → 설계 → 컴포넌트 추적

| 요구사항 ID | 요구사항 설명 | 설계 섹션 | 구현 컴포넌트 | 테스트 케이스 |
|------------|-------------|----------|-------------|-------------|
| FR-201 | 사용자 목록 표시 (이름, 이메일, 상태) | 010-design §5.1 | `UserListPanel` → Table | TC-201-01 |
| FR-202 | 사용자 검색 (이름/이메일) | 010-design §3 | `UserListPanel` → Input.Search | TC-202-01, TC-202-02 |
| FR-203 | 상태 필터 (활성/비활성/전체) | 010-design §3 | `UserListPanel` → Select | TC-203-01 |
| FR-204 | 사용자 행 클릭 시 역할그룹 + 메뉴 갱신 | 010-design §4 | `AuthorityPageContent` onRow.onClick | TC-204-01 |
| FR-205 | 보유 역할그룹 테이블 (read-only) | 010-design §5.2 | `RoleGroupPanel` → Table | TC-205-01 |
| FR-206 | 전체 역할그룹 테이블 (체크박스) | 010-design §5.3 | `RoleGroupPanel` → Table (rowSelection) | TC-206-01 |
| FR-207 | 역할그룹 할당 저장 | 010-design §4 | `RoleGroupPanel` → Button | TC-207-01, TC-207-02 |
| FR-208 | Ant Design Tree로 메뉴 표시 | 010-design §6, 011-ui §3 | `MenuSimulationPanel` → Tree | TC-208-01 |
| FR-209 | 사이드바 아이콘 매핑 사용 | 010-design §6, 011-ui §3.2 | `lib/utils/iconMap.ts` | TC-209-01 |
| FR-210 | 카테고리 기반 폴더 구조 (defaultExpandAll) | 011-ui §3.3 | `MenuSimulationPanel` → Tree props | TC-210-01 |
| FR-211 | 접근 가능 메뉴 수/카테고리 수 요약 | 011-ui §3.5 | `MenuSimulationPanel` → Typography | TC-211-01 |
| FR-212 | 체크박스 변경 시 메뉴 실시간 갱신 (debounce 300ms) | 010-design §7 | `AuthorityPageContent` useEffect + debounce | TC-212-01, TC-212-02 |
| FR-213 | 전체 화면 레이아웃 | 010-design §2, 011-ui §1.1 | `AuthorityPageContent` flex layout | TC-213-01 |
| BR-201 | 미선택 시 중앙/우측 패널 안내 메시지 | 010-design §8, 011-ui §1.2 | `RoleGroupPanel`, `MenuSimulationPanel` Empty | TC-BR-201-01 |
| BR-202 | 미저장 변경사항 경고 (사용자 전환 시) | 010-design §8, 011-ui §1.3 | `AuthorityPageContent` Modal.confirm | TC-BR-202-01, TC-BR-202-02 |
| BR-203 | 메뉴 시뮬레이션 read-only | 011-ui §3.3 | Tree `selectable={false}` | TC-BR-203-01 |

## 2. API → 요구사항 추적

| API 엔드포인트 | 메서드 | 관련 요구사항 | 사용처 |
|---------------|--------|-------------|--------|
| `/api/users` | GET | FR-201, FR-202, FR-203 | 사용자 목록 조회 |
| `/api/users/:id/role-groups` | GET | FR-204, FR-205 | 보유 역할그룹 조회 |
| `/api/users/:id/role-groups` | PUT | FR-207 | 역할그룹 할당 저장 |
| `/api/users/:id/menus` | GET | FR-204, FR-208, FR-211, FR-212 | 메뉴 시뮬레이션 조회 |
| `/api/role-groups` | GET | FR-206 | 전체 역할그룹 목록 |

## 3. 의존성 추적

| 의존 대상 | Task ID | 의존 내용 |
|----------|---------|----------|
| 역할그룹 CRUD | TSK-01-01 | `/api/role-groups` API, RoleGroup 타입 |
| 메뉴-역할그룹 매핑 | TSK-03-01 | `/api/users/:id/menus` API, MenuTreeNode 타입 |
| Sidebar iconMap | 기존 코드 | `components/layout/Sidebar.tsx` 아이콘 매핑 공유 |

## 4. PRD 참조

- PRD 4.2: 사용자 권한 할당 화면 요구사항
