# TSK-02-01 테스트 명세서 - 사용자 역할그룹 할당 화면

## 1. 테스트 환경

- **프레임워크**: Vitest + @testing-library/react
- **모킹**: `vi.fn()`, `fetch` mock
- **대상 파일**: `app/(portal)/system/authority/page.tsx` 및 하위 컴포넌트

## 2. 단위 테스트

### 2.1 사용자 목록 패널 (UserListPanel)

| TC ID | 테스트 케이스 | 관련 요구사항 | 검증 내용 |
|-------|-------------|-------------|----------|
| TC-201-01 | 사용자 목록 렌더링 | FR-201 | 이름, 이메일, 상태(Tag) 컬럼이 정상 표시되는지 확인 |
| TC-202-01 | 이름으로 검색 | FR-202 | 검색어 입력 시 이름에 매칭되는 사용자만 필터링 |
| TC-202-02 | 이메일로 검색 | FR-202 | 검색어 입력 시 이메일에 매칭되는 사용자만 필터링 |
| TC-203-01 | 상태 필터 변경 | FR-203 | '활성' 선택 시 활성 사용자만, '비활성' 시 비활성만, '전체' 시 모두 표시 |

### 2.2 역할그룹 패널 (RoleGroupPanel)

| TC ID | 테스트 케이스 | 관련 요구사항 | 검증 내용 |
|-------|-------------|-------------|----------|
| TC-205-01 | 보유 역할그룹 read-only 표시 | FR-205 | 사용자 선택 시 보유 역할그룹 테이블에 이름, 코드, 상태 표시 |
| TC-206-01 | 전체 역할그룹 체크박스 표시 | FR-206 | 전체 역할그룹에 체크박스 표시, 보유 역할그룹은 체크 상태 |
| TC-207-01 | 저장 성공 | FR-207 | 저장 버튼 클릭 → PUT API 호출 → success 메시지 |
| TC-207-02 | 저장 실패 | FR-207 | PUT API 실패 시 error 메시지 표시 |

### 2.3 메뉴 시뮬레이션 패널 (MenuSimulationPanel)

| TC ID | 테스트 케이스 | 관련 요구사항 | 검증 내용 |
|-------|-------------|-------------|----------|
| TC-208-01 | Tree 컴포넌트 렌더링 | FR-208 | 메뉴 데이터가 Tree로 정상 렌더링 |
| TC-209-01 | 아이콘 매핑 적용 | FR-209 | 각 노드에 iconMap 기반 아이콘이 표시됨 |
| TC-210-01 | defaultExpandAll 적용 | FR-210 | 모든 트리 노드가 펼쳐진 상태로 렌더링 |
| TC-211-01 | 요약 정보 표시 | FR-211 | "접근 가능 메뉴: N개 메뉴 / M개 카테고리" 형식 표시 |

### 2.4 상호작용 테스트

| TC ID | 테스트 케이스 | 관련 요구사항 | 검증 내용 |
|-------|-------------|-------------|----------|
| TC-204-01 | 사용자 행 클릭 시 패널 갱신 | FR-204 | 행 클릭 → role-groups API + menus API 호출 → 중앙/우측 갱신 |
| TC-212-01 | 체크박스 변경 시 메뉴 갱신 | FR-212 | 체크박스 토글 → 300ms debounce 후 menus API 호출 |
| TC-212-02 | 연속 체크박스 변경 시 debounce | FR-212 | 100ms 간격으로 3번 변경 → API 1회만 호출 |
| TC-213-01 | 3-column 레이아웃 렌더링 | FR-213 | 3개 패널이 30%/35%/35% 비율로 렌더링 |

## 3. 비즈니스 규칙 테스트

| TC ID | 테스트 케이스 | 관련 요구사항 | 검증 내용 |
|-------|-------------|-------------|----------|
| TC-BR-201-01 | 사용자 미선택 시 안내 메시지 | BR-201 | 초기 상태에서 중앙/우측 패널에 Empty + "사용자를 선택해주세요" 표시 |
| TC-BR-202-01 | 미저장 변경 경고 - 전환 | BR-202 | dirty 상태에서 다른 사용자 클릭 → Modal 표시 → "전환" 클릭 → 사용자 전환 |
| TC-BR-202-02 | 미저장 변경 경고 - 취소 | BR-202 | dirty 상태에서 다른 사용자 클릭 → Modal 표시 → "취소" 클릭 → 현재 유지 |
| TC-BR-203-01 | 메뉴 트리 read-only | BR-203 | Tree 노드 클릭 시 네비게이션 발생하지 않음 |

## 4. API 모킹 전략

```typescript
// 테스트 setup
const mockUsers = [
  { id: '1', name: '홍길동', email: 'hong@example.com', isActive: true },
  { id: '2', name: '이몽룡', email: 'lee@example.com', isActive: false },
];

const mockRoleGroups = [
  { id: 'rg1', name: '생산관리자', roleGroupCd: 'PROD_MGR', isActive: true },
  { id: 'rg2', name: '품질관리자', roleGroupCd: 'QC_MGR', isActive: true },
];

const mockMenuTree = {
  menus: [
    {
      key: 'cat-1',
      title: '생산관리',
      icon: 'production',
      children: [
        { key: 'menu-1', title: '작업지시', icon: 'schedule' },
        { key: 'menu-2', title: '생산현황', icon: 'dashboard' },
      ],
    },
  ],
  summary: { totalMenus: 2, totalCategories: 1 },
};

beforeEach(() => {
  vi.spyOn(global, 'fetch').mockImplementation((url: string) => {
    if (url.includes('/api/users') && !url.includes('/role-groups') && !url.includes('/menus')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUsers) });
    }
    if (url.includes('/role-groups')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRoleGroups) });
    }
    if (url.includes('/menus')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMenuTree) });
    }
    return Promise.reject(new Error('Unknown URL'));
  });
});
```

## 5. 테스트 커버리지 목표

| 영역 | 목표 |
|------|------|
| Statement | >= 80% |
| Branch | >= 75% |
| Function | >= 80% |

## 6. 테스트 파일 위치

```
mes-portal/
  components/system/authority/__tests__/
    UserListPanel.test.tsx
    RoleGroupPanel.test.tsx
    MenuSimulationPanel.test.tsx
    AuthorityPage.test.tsx        # 통합 테스트
```
