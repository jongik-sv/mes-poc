# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-01-03 |
| Task명 | 사이드바 메뉴 컴포넌트 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | Sidebar 컴포넌트, 상태 관리 | 80% 이상 |
| E2E 테스트 | 사이드바 인터랙션 시나리오 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | Sidebar | 초기 렌더링 (펼침 상태) | 너비 240px로 렌더링 | FR-001 |
| UT-002 | Sidebar | 토글 버튼 클릭 | collapsed 상태 토글 | FR-002 |
| UT-003 | Sidebar | 3단계 메뉴 렌더링 | 모든 단계 정상 렌더링 | FR-003, BR-004 |
| UT-004 | Sidebar | 메뉴 아이템 구조 | 아이콘+텍스트+화살표 표시 | FR-004 |
| UT-005 | Sidebar | 선택 메뉴 강조 | selectedKeys에 따라 강조 | FR-006, BR-003 |
| UT-006 | Sidebar | 토글 버튼 위치 | 하단에 토글 버튼 존재 | FR-008 |
| UT-007 | Sidebar | 메뉴 클릭 시 openTab 호출 | leaf 메뉴 클릭 → openTab | BR-001 |
| UT-008 | Sidebar | 이미 열린 메뉴 클릭 | setActiveTab 호출 | BR-002 |

### 2.2 테스트 케이스 상세

#### UT-001: 초기 렌더링 (펼침 상태)

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Sidebar.test.tsx` |
| **테스트 블록** | `describe('Sidebar') → it('renders with expanded width by default')` |
| **Mock 의존성** | MDI Context Mock |
| **입력 데이터** | 기본 props (defaultCollapsed: false) |
| **검증 포인트** | Sider 컴포넌트 width가 240px 또는 collapsed=false 확인 |
| **커버리지 대상** | 초기 렌더링 분기 |
| **관련 요구사항** | FR-001 |

#### UT-002: 토글 버튼 클릭

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Sidebar.test.tsx` |
| **테스트 블록** | `describe('Sidebar') → it('toggles collapsed state on button click')` |
| **Mock 의존성** | - |
| **입력 데이터** | 기본 props |
| **실행** | 토글 버튼 클릭 이벤트 발생 |
| **검증 포인트** | collapsed 상태가 true로 변경, onCollapse 콜백 호출 확인 |
| **커버리지 대상** | handleCollapse 함수 |
| **관련 요구사항** | FR-002 |

#### UT-003: 3단계 메뉴 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Sidebar.test.tsx` |
| **테스트 블록** | `describe('Sidebar') → it('renders up to 3 levels of menu')` |
| **Mock 의존성** | - |
| **입력 데이터** | 3단계 계층 메뉴 데이터 |
| **검증 포인트** | 1단계, 2단계, 3단계 메뉴 아이템 모두 존재 확인 |
| **커버리지 대상** | 메뉴 렌더링 재귀 로직 |
| **관련 요구사항** | FR-003, BR-004 |

```typescript
// 테스트 데이터
const mockMenus = [
  {
    id: '1',
    code: 'SETTINGS',
    name: '설정',
    icon: 'SettingOutlined',
    children: [
      {
        id: '1-1',
        code: 'USER',
        name: '사용자',
        icon: 'UserOutlined',
        children: [
          { id: '1-1-1', code: 'USER_LIST', name: '사용자 관리', path: '/settings/user/list' },
          { id: '1-1-2', code: 'ROLE', name: '역할 관리', path: '/settings/user/role' }
        ]
      }
    ]
  }
];
```

#### UT-004: 메뉴 아이템 구조

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Sidebar.test.tsx` |
| **테스트 블록** | `describe('Sidebar') → it('renders menu item with icon, label, and arrow')` |
| **Mock 의존성** | - |
| **입력 데이터** | 하위 메뉴 있는 메뉴 데이터 |
| **검증 포인트** | 아이콘 컴포넌트, 메뉴명 텍스트, 화살표 아이콘 존재 확인 |
| **커버리지 대상** | 메뉴 아이템 렌더링 |
| **관련 요구사항** | FR-004 |

#### UT-005: 선택 메뉴 강조

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Sidebar.test.tsx` |
| **테스트 블록** | `describe('Sidebar') → it('highlights selected menu item')` |
| **Mock 의존성** | MDI Context (activeTab 설정) |
| **입력 데이터** | menus + selectedKeys=['menu-1'] |
| **검증 포인트** | 해당 메뉴 아이템에 selected 클래스/스타일 적용 확인 |
| **커버리지 대상** | selectedKeys 처리 로직 |
| **관련 요구사항** | FR-006, BR-003 |

#### UT-006: 토글 버튼 위치

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Sidebar.test.tsx` |
| **테스트 블록** | `describe('Sidebar') → it('has toggle button at bottom')` |
| **검증 포인트** | 토글 버튼이 사이드바 하단에 위치 (data-testid로 확인) |
| **관련 요구사항** | FR-008 |

#### UT-007: 메뉴 클릭 시 openTab 호출

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Sidebar.test.tsx` |
| **테스트 블록** | `describe('Sidebar') → it('calls openTab when leaf menu clicked')` |
| **Mock 의존성** | MDI Context (openTab mock) |
| **입력 데이터** | path가 있는 leaf 메뉴 |
| **실행** | 해당 메뉴 클릭 |
| **검증 포인트** | openTab이 올바른 인자로 호출됨 |
| **관련 요구사항** | BR-001 |

```typescript
expect(mockOpenTab).toHaveBeenCalledWith({
  id: 'production-status',
  title: '생산 현황',
  path: '/production/status',
  icon: 'LineChartOutlined'
});
```

#### UT-008: 이미 열린 메뉴 클릭

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Sidebar.test.tsx` |
| **테스트 블록** | `describe('Sidebar') → it('activates existing tab when menu already open')` |
| **Mock 의존성** | MDI Context (tabs에 해당 탭 존재) |
| **입력 데이터** | 이미 열린 화면의 메뉴 |
| **실행** | 해당 메뉴 클릭 |
| **검증 포인트** | setActiveTab 호출, openTab은 호출 안 됨 |
| **관련 요구사항** | BR-002 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 사이드바 토글 | 로그인 상태 | 토글 버튼 클릭 | 240px ↔ 60px 전환 | FR-001, FR-002, FR-008 |
| E2E-002 | 3단계 메뉴 탐색 | 로그인 상태 | 메뉴 펼침 후 3단계 클릭 | 화면 탭 열림 | FR-003, FR-004, BR-004 |
| E2E-003 | 메뉴 선택 강조 | 탭 열린 상태 | 탭 전환 | 해당 메뉴 강조 | FR-005, FR-006, BR-003 |
| E2E-004 | 접힘 상태 툴팁 | 사이드바 접힘 | 아이콘 호버 | 툴팁 표시 | FR-007 |
| E2E-005 | MDI 탭 연동 | 로그인 상태 | 메뉴 클릭 | 탭 열림/활성화 | BR-001, BR-002 |

### 3.2 테스트 케이스 상세

#### E2E-001: 사이드바 토글

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sidebar.spec.ts` |
| **테스트명** | `test('사이드바 토글 버튼으로 접기/펼치기 전환')` |
| **사전조건** | 로그인 완료 |
| **data-testid 셀렉터** | |
| - 사이드바 | `[data-testid="sidebar"]` |
| - 토글 버튼 | `[data-testid="sidebar-toggle-btn"]` |
| **실행 단계** | |
| 1 | 페이지 로드 후 사이드바 너비 확인 (240px) |
| 2 | `await page.click('[data-testid="sidebar-toggle-btn"]')` |
| 3 | 사이드바 너비 확인 (60px) |
| 4 | 다시 토글 버튼 클릭 |
| 5 | 사이드바 너비 확인 (240px) |
| **검증 포인트** | `expect(sidebar).toHaveCSS('width', '240px')` → `'60px'` → `'240px'` |
| **스크린샷** | `e2e-001-sidebar-expanded.png`, `e2e-001-sidebar-collapsed.png` |
| **관련 요구사항** | FR-001, FR-002, FR-008 |

#### E2E-002: 3단계 메뉴 탐색

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sidebar.spec.ts` |
| **테스트명** | `test('3단계 계층 메뉴를 탐색하고 화면 열기')` |
| **사전조건** | 로그인 완료, 3단계 메뉴 데이터 존재 |
| **data-testid 셀렉터** | |
| - 1단계 메뉴 | `[data-testid="menu-settings"]` |
| - 2단계 메뉴 | `[data-testid="menu-user"]` |
| - 3단계 메뉴 | `[data-testid="menu-user-list"]` |
| - 탭 바 | `[data-testid="mdi-tab-bar"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="menu-settings"]')` - 1단계 펼침 |
| 2 | `await page.click('[data-testid="menu-user"]')` - 2단계 펼침 |
| 3 | `await page.click('[data-testid="menu-user-list"]')` - 3단계 클릭 |
| **검증 포인트** | 탭 바에 "사용자 관리" 탭 추가됨 |
| **스크린샷** | `e2e-002-menu-level1.png`, `e2e-002-menu-level2.png`, `e2e-002-menu-level3.png` |
| **관련 요구사항** | FR-003, FR-004, BR-004 |

#### E2E-003: 메뉴 선택 강조

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sidebar.spec.ts` |
| **테스트명** | `test('활성 탭에 해당하는 메뉴가 강조 표시됨')` |
| **사전조건** | 2개 이상 탭 열린 상태 |
| **data-testid 셀렉터** | |
| - 탭 아이템 | `[data-testid="tab-{id}"]` |
| - 메뉴 아이템 | `[data-testid="menu-{code}"]` |
| **실행 단계** | |
| 1 | 첫 번째 메뉴 클릭 → 탭 열림 |
| 2 | 두 번째 메뉴 클릭 → 탭 열림 |
| 3 | 첫 번째 탭 클릭 |
| 4 | 첫 번째 메뉴 강조 확인 |
| **검증 포인트** | 활성 탭 전환 시 해당 메뉴에 `ant-menu-item-selected` 클래스 |
| **스크린샷** | `e2e-003-menu-highlight.png` |
| **관련 요구사항** | FR-005, FR-006, BR-003 |

#### E2E-004: 접힘 상태 툴팁

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sidebar.spec.ts` |
| **테스트명** | `test('접힘 상태에서 메뉴 호버 시 툴팁 표시')` |
| **사전조건** | 사이드바 접힘 상태 |
| **data-testid 셀렉터** | |
| - 메뉴 아이콘 | `[data-testid="menu-dashboard"]` |
| - 툴팁 | `.ant-tooltip` |
| **실행 단계** | |
| 1 | 사이드바 토글 → 접힘 상태 |
| 2 | `await page.hover('[data-testid="menu-dashboard"]')` |
| 3 | 툴팁 표시 확인 |
| **검증 포인트** | `expect(page.locator('.ant-tooltip')).toContainText('대시보드')` |
| **스크린샷** | `e2e-004-collapsed-tooltip.png` |
| **관련 요구사항** | FR-007 |

#### E2E-005: MDI 탭 연동

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sidebar.spec.ts` |
| **테스트명** | `test('메뉴 클릭 시 MDI 탭 열림/활성화')` |
| **사전조건** | 로그인 완료 |
| **data-testid 셀렉터** | |
| - 메뉴 | `[data-testid="menu-dashboard"]` |
| - 탭 | `[data-testid="tab-dashboard"]` |
| **실행 단계** | |
| 1 | 대시보드 메뉴 클릭 → 탭 열림 |
| 2 | 다른 메뉴 클릭 → 새 탭 열림 |
| 3 | 대시보드 메뉴 다시 클릭 → 기존 탭 활성화 (새 탭 안 열림) |
| **검증 포인트** | 탭 개수 변화 없음, 대시보드 탭 활성화 |
| **스크린샷** | `e2e-005-tab-reactivate.png` |
| **관련 요구사항** | BR-001, BR-002 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 사이드바 너비 확인 | 로그인 | 펼침/접힘 상태 측정 | 240px / 60px | High | FR-001 |
| TC-002 | 토글 버튼 동작 | 로그인 | 토글 버튼 클릭 | 부드러운 애니메이션 | High | FR-002, FR-008 |
| TC-003 | 계층 메뉴 탐색 | 로그인 | 1→2→3단계 메뉴 열기 | 각 단계 정상 펼침 | High | FR-003 |
| TC-004 | 메뉴 아이템 구성 | 로그인 | 메뉴 아이템 확인 | 아이콘+텍스트+화살표 | Medium | FR-004 |
| TC-005 | 호버/선택 강조 | 로그인 | 메뉴 호버 및 선택 | 시각적 강조 표시 | Medium | FR-005, FR-006 |
| TC-006 | 접힘 상태 툴팁 | 접힘 상태 | 아이콘 호버 | 메뉴명 툴팁 | Medium | FR-007 |
| TC-007 | 반응형 동작 | - | 브라우저 크기 조절 | 태블릿에서 기본 접힘 | Low | - |
| TC-008 | 키보드 네비게이션 | 로그인 | 화살표 키로 메뉴 탐색 | 포커스 이동 | Low | 접근성 |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 사이드바 너비 확인

**테스트 목적**: 사이드바 펼침/접힘 상태의 너비가 정확한지 확인

**테스트 단계**:
1. 로그인 완료 후 포털 진입
2. 개발자 도구 열기 (F12)
3. 사이드바 요소 선택 → Computed 스타일에서 width 확인 (240px)
4. 토글 버튼 클릭
5. 다시 width 확인 (60px)

**예상 결과**:
- 펼침 상태: width: 240px
- 접힘 상태: width: 60px

**검증 기준**:
- [ ] 펼침 상태 너비 240px 확인
- [ ] 접힘 상태 너비 60px 확인
- [ ] CSS Variables 사용 여부 확인 (var(--sidebar-width))

#### TC-002: 토글 버튼 동작

**테스트 목적**: 토글 버튼의 위치와 애니메이션 동작 확인

**테스트 단계**:
1. 사이드바 하단에 토글 버튼 존재 확인
2. 토글 버튼 클릭
3. 애니메이션 동작 확인 (부드러운 너비 변화)
4. 아이콘 변경 확인 (◀ ↔ ▶)

**예상 결과**:
- 토글 버튼이 사이드바 하단에 위치
- 클릭 시 200ms ease-in-out 애니메이션
- 상태에 따라 아이콘 방향 변경

**검증 기준**:
- [ ] 토글 버튼 하단 고정 위치
- [ ] 부드러운 애니메이션 (끊김 없음)
- [ ] 아이콘 방향 정확히 변경

#### TC-005: 호버/선택 강조

**테스트 목적**: 메뉴 아이템의 호버 및 선택 상태 시각적 표현 확인

**테스트 단계**:
1. 메뉴 아이템에 마우스 올림 → 배경색 하이라이트 확인
2. 메뉴 클릭 → 선택 상태 강조 확인
3. 다른 메뉴 클릭 → 이전 메뉴 강조 해제, 새 메뉴 강조
4. 탭 전환 → 해당 메뉴 강조 확인

**예상 결과**:
- 호버: 배경색 하이라이트 (token 색상)
- 선택: Primary 색상 배경 또는 좌측 border

**검증 기준**:
- [ ] 호버 시 100ms 내 배경색 변화
- [ ] 선택 메뉴 명확한 시각적 구분
- [ ] 탭 전환 시 메뉴 강조 자동 변경

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-MENU-SINGLE | 단일 메뉴 | `{ id: '1', code: 'DASHBOARD', name: '대시보드', path: '/dashboard', icon: 'DashboardOutlined' }` |
| MOCK-MENU-3LEVEL | 3단계 메뉴 | 위 UT-003 참조 |
| MOCK-MDI-CONTEXT | MDI Context Mock | `{ tabs: [], activeTab: null, openTab: jest.fn(), setActiveTab: jest.fn() }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-MENU-BASE | 기본 메뉴 구조 | mock-data/menus.json | 1단계 4개, 2단계 10개, 3단계 5개 |
| SEED-USER-LOGIN | 로그인 사용자 | 시드 스크립트 | admin@test.com |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 전체 메뉴 접근 테스트 |
| TEST-USER | user@test.com | test1234 | USER | 제한 메뉴 접근 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 Sidebar 컴포넌트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `sidebar` | Layout.Sider 컨테이너 | 사이드바 전체 |
| `sidebar-toggle-btn` | 토글 버튼 | 접기/펼치기 버튼 |
| `sidebar-menu` | Menu 컴포넌트 | 메뉴 전체 |
| `menu-{code}` | Menu.Item 또는 Menu.SubMenu | 각 메뉴 아이템 (예: menu-dashboard) |

### 6.2 예시

```tsx
// Sidebar.tsx
<Layout.Sider data-testid="sidebar" collapsed={collapsed}>
  <Menu data-testid="sidebar-menu">
    {menus.map(menu => (
      <Menu.Item key={menu.id} data-testid={`menu-${menu.code.toLowerCase()}`}>
        {menu.name}
      </Menu.Item>
    ))}
  </Menu>
  <Button data-testid="sidebar-toggle-btn" onClick={handleToggle}>
    {collapsed ? '▶' : '◀'}
  </Button>
</Layout.Sider>
```

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |
| Statements | 80% | 70% |

### 7.2 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 기능 요구사항 (FR) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

---

## 관련 문서

- 설계: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md`

---

<!--
TSK-01-03 사이드바 메뉴 컴포넌트
Version: 1.0
Created: 2026-01-20
-->
