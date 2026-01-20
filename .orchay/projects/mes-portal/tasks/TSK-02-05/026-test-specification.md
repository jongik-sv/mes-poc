# TSK-02-05 테스트 명세서

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-05 |
| Task명 | MDI 컨텐츠 영역 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | MDIContent, TabPane, ScreenLoader, screenRegistry | 80% 이상 |
| E2E 테스트 | 탭 전환, 상태 유지, 동적 로딩 시나리오 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 반응형, 성능 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터베이스 | N/A (프론트엔드 컴포넌트) |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| TC-01-01 | MDIContent | 활성 탭 화면 표시 | 활성 탭 컴포넌트만 visible | UC-01 |
| TC-01-02 | MDIContent | 탭 없을 때 빈 상태 | Empty 컴포넌트 표시 | BR-03 |
| TC-02-01 | TabPane | 비활성 탭 display:none | DOM 유지, 스타일만 변경 | UC-02, BR-01 |
| TC-02-02 | TabPane | 비활성→활성 전환 | display:block으로 변경 | UC-02 |
| TC-03-01 | ScreenLoader | 동적 import 실행 | Suspense fallback 후 화면 렌더링 | UC-03, BR-02 |
| TC-03-02 | ScreenLoader | 잘못된 경로 | ScreenNotFound 표시 | BR-04 |
| TC-ERR-01 | ScreenLoader | import 실패 | ErrorBoundary 폴백 표시 | 에러처리 |
| TC-BR-01 | TabPane | unmount 검증 | 비활성 시 컴포넌트 unmount 안 됨 | BR-01 |
| TC-BR-02 | ScreenLoader | 코드 스플리팅 | 청크 파일 분리 확인 | BR-02 |

### 2.2 테스트 케이스 상세

#### TC-01-01: MDIContent 활성 탭 화면 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/MDIContent.test.tsx` |
| **테스트 블록** | `describe('MDIContent') → it('renders active tab content only visible')` |
| **Mock 의존성** | MDI Context (tabs, activeTabId) |
| **입력 데이터** | `tabs: [{id: 'tab1', path: '/dashboard'}, {id: 'tab2', path: '/list'}], activeTabId: 'tab1'` |
| **검증 포인트** | - tab1 컨텐츠는 `display: block` 또는 visible<br>- tab2 컨텐츠는 `display: none` 또는 hidden |
| **커버리지 대상** | `MDIContent` 렌더링 로직 |
| **관련 요구사항** | UC-01, PRD 4.1.1 컨텐츠 영역 |

**테스트 코드 가이드:**
```typescript
it('활성 탭 컨텐츠만 표시된다', () => {
  // Arrange
  const tabs = [
    { id: 'tab1', title: '대시보드', path: '/dashboard', closable: true },
    { id: 'tab2', title: '목록', path: '/list', closable: true }
  ];

  // Act
  render(
    <MDIProvider initialTabs={tabs} initialActiveTab="tab1">
      <MDIContent />
    </MDIProvider>
  );

  // Assert
  expect(screen.getByTestId('tab-pane-tab1')).toBeVisible();
  expect(screen.getByTestId('tab-pane-tab2')).not.toBeVisible();
});
```

#### TC-01-02: MDIContent 빈 상태 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/MDIContent.test.tsx` |
| **테스트 블록** | `describe('MDIContent') → it('renders empty state when no tabs')` |
| **Mock 의존성** | MDI Context (빈 tabs) |
| **입력 데이터** | `tabs: [], activeTabId: null` |
| **검증 포인트** | Empty 컴포넌트 또는 빈 상태 메시지 표시 |
| **커버리지 대상** | 빈 상태 처리 분기 |
| **관련 요구사항** | BR-03 |

**테스트 코드 가이드:**
```typescript
it('탭이 없으면 빈 상태를 표시한다', () => {
  render(
    <MDIProvider initialTabs={[]} initialActiveTab={null}>
      <MDIContent />
    </MDIProvider>
  );

  expect(screen.getByTestId('mdi-empty-state')).toBeInTheDocument();
  expect(screen.getByText('열린 화면이 없습니다')).toBeInTheDocument();
});
```

#### TC-02-01: TabPane 비활성 탭 숨김

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabPane.test.tsx` |
| **테스트 블록** | `describe('TabPane') → it('hides inactive tab with display:none')` |
| **Mock 의존성** | - |
| **입력 데이터** | `isActive: false` |
| **검증 포인트** | - DOM에 존재함<br>- `display: none` 스타일 적용 |
| **커버리지 대상** | TabPane 스타일 적용 로직 |
| **관련 요구사항** | UC-02, BR-01 |

**테스트 코드 가이드:**
```typescript
it('비활성 탭은 display:none으로 숨겨진다', () => {
  const { container } = render(
    <TabPane tabId="test" isActive={false}>
      <div>테스트 컨텐츠</div>
    </TabPane>
  );

  const pane = container.firstChild as HTMLElement;
  expect(pane).toHaveStyle({ display: 'none' });
  expect(screen.getByText('테스트 컨텐츠')).toBeInTheDocument(); // DOM에는 존재
});
```

#### TC-BR-01: 비활성 탭 unmount 방지

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/MDIContent.test.tsx` |
| **테스트 블록** | `describe('MDIContent') → it('does not unmount inactive tabs')` |
| **Mock 의존성** | MDI Context, 상태 변경 mock |
| **입력 데이터** | 폼 컴포넌트가 있는 탭 2개 |
| **검증 포인트** | - 탭 전환 시 비활성 탭의 폼 상태 유지<br>- useEffect cleanup이 호출되지 않음 |
| **커버리지 대상** | 상태 유지 로직 |
| **관련 요구사항** | BR-01 |

**테스트 코드 가이드:**
```typescript
it('비활성 탭은 unmount되지 않아 상태가 유지된다', async () => {
  const unmountSpy = vi.fn();

  const StatefulComponent = () => {
    const [value, setValue] = useState('');
    useEffect(() => () => unmountSpy(), []);
    return <input value={value} onChange={e => setValue(e.target.value)} data-testid="form-input" />;
  };

  render(
    <MDIProvider>
      <MDIContent>
        {/* tab1에 StatefulComponent 렌더링 */}
      </MDIContent>
    </MDIProvider>
  );

  // tab1 입력
  await userEvent.type(screen.getByTestId('form-input'), 'test value');

  // tab2로 전환
  act(() => switchTab('tab2'));

  // unmount가 호출되지 않음
  expect(unmountSpy).not.toHaveBeenCalled();

  // tab1로 돌아오면 값 유지
  act(() => switchTab('tab1'));
  expect(screen.getByTestId('form-input')).toHaveValue('test value');
});
```

#### TC-03-01: ScreenLoader 동적 로딩

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/ScreenLoader.test.tsx` |
| **테스트 블록** | `describe('ScreenLoader') → it('loads screen component dynamically')` |
| **Mock 의존성** | screenRegistry mock |
| **입력 데이터** | `path: '/dashboard'` |
| **검증 포인트** | - 로딩 중 Suspense fallback 표시<br>- 로딩 완료 후 화면 컴포넌트 표시 |
| **커버리지 대상** | React.lazy 동적 import |
| **관련 요구사항** | UC-03, BR-02 |

**테스트 코드 가이드:**
```typescript
it('화면 컴포넌트를 동적으로 로딩한다', async () => {
  vi.mock('@/lib/mdi/screenRegistry', () => ({
    screenRegistry: {
      '/dashboard': () => Promise.resolve({
        default: () => <div data-testid="dashboard">대시보드</div>
      })
    }
  }));

  render(<ScreenLoader path="/dashboard" />);

  // 로딩 중
  expect(screen.getByTestId('screen-loading')).toBeInTheDocument();

  // 로딩 완료
  await waitFor(() => {
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });
});
```

#### TC-03-02: ScreenLoader 경로 없음 처리

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/ScreenLoader.test.tsx` |
| **테스트 블록** | `describe('ScreenLoader') → it('shows not found for invalid path')` |
| **Mock 의존성** | screenRegistry mock (경로 없음) |
| **입력 데이터** | `path: '/invalid-path'` |
| **검증 포인트** | ScreenNotFound 컴포넌트 표시 |
| **커버리지 대상** | 경로 매핑 실패 분기 |
| **관련 요구사항** | BR-04 |

**테스트 코드 가이드:**
```typescript
it('잘못된 경로는 404 화면을 표시한다', () => {
  render(<ScreenLoader path="/invalid-path" />);

  expect(screen.getByTestId('screen-not-found')).toBeInTheDocument();
  expect(screen.getByText('화면을 찾을 수 없습니다')).toBeInTheDocument();
});
```

#### TC-ERR-01: ScreenLoader 로딩 실패

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/ScreenLoader.test.tsx` |
| **테스트 블록** | `describe('ScreenLoader') → it('shows error fallback on load failure')` |
| **Mock 의존성** | screenRegistry mock (에러 발생) |
| **입력 데이터** | `path: '/error-screen'` |
| **검증 포인트** | ErrorBoundary 폴백 UI 표시 |
| **커버리지 대상** | 에러 바운더리 처리 |
| **관련 요구사항** | 에러 처리 |

**테스트 코드 가이드:**
```typescript
it('로딩 실패 시 에러 폴백을 표시한다', async () => {
  vi.mock('@/lib/mdi/screenRegistry', () => ({
    screenRegistry: {
      '/error-screen': () => Promise.reject(new Error('로딩 실패'))
    }
  }));

  render(
    <ErrorBoundary fallback={<div data-testid="error-fallback">에러</div>}>
      <ScreenLoader path="/error-screen" />
    </ErrorBoundary>
  );

  await waitFor(() => {
    expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
  });
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-01 | 다중 탭 전환 시 필터 상태 유지 | 로그인, 2개 화면 열림 | 1. 필터 설정 2. 탭 전환 3. 돌아오기 | 필터 유지 | UC-02, 시나리오 4.1 |
| E2E-02 | 폼 입력 중 탭 전환 | 로그인, 폼 화면 열림 | 1. 입력 2. 탭 전환 3. 돌아오기 | 입력 값 유지 | UC-02, 시나리오 4.2 |
| E2E-03 | 화면 동적 로딩 | 로그인 | 1. 새 화면 열기 | 로딩 후 표시 | UC-03, 시나리오 4.3 |
| E2E-04 | 탭 없을 때 빈 상태 | 로그인, 탭 없음 | 1. 페이지 접속 | 빈 상태 표시 | BR-03 |
| E2E-05 | 존재하지 않는 화면 | 로그인 | 1. 잘못된 경로 탭 열기 | 404 화면 | BR-04 |

### 3.2 테스트 케이스 상세

#### E2E-01: 다중 탭 전환 시 필터 상태 유지

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-content.spec.ts` |
| **테스트명** | `test('탭 전환 후에도 필터 상태가 유지된다')` |
| **사전조건** | 로그인, 목록 화면과 대시보드 탭 열림 |
| **data-testid 셀렉터** | |
| - 탭 바 | `[data-testid="mdi-tab-bar"]` |
| - 탭 아이템 | `[data-testid="tab-{id}"]` |
| - 컨텐츠 영역 | `[data-testid="mdi-content"]` |
| - 필터 드롭다운 | `[data-testid="filter-dropdown"]` |
| **실행 단계** | |
| 1 | 목록 화면 탭에서 필터 드롭다운 선택: `await page.selectOption('[data-testid="filter-dropdown"]', 'active')` |
| 2 | 대시보드 탭 클릭: `await page.click('[data-testid="tab-dashboard"]')` |
| 3 | 대시보드 컨텐츠 확인: `await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible()` |
| 4 | 목록 화면 탭 클릭: `await page.click('[data-testid="tab-list"]')` |
| **검증 포인트** | 필터 드롭다운 값이 'active'로 유지됨 |
| **스크린샷** | `e2e-01-filter-before.png`, `e2e-01-filter-after.png` |
| **관련 요구사항** | UC-02, 시나리오 4.1 |

#### E2E-02: 폼 입력 중 탭 전환

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-content.spec.ts` |
| **테스트명** | `test('폼 입력 값이 탭 전환 후에도 유지된다')` |
| **사전조건** | 로그인, 입력 폼 화면 탭 열림 |
| **data-testid 셀렉터** | |
| - 폼 입력 필드 | `[data-testid="form-name-input"]` |
| - 폼 설명 필드 | `[data-testid="form-description-input"]` |
| **실행 단계** | |
| 1 | 폼 필드 입력: `await page.fill('[data-testid="form-name-input"]', '테스트 이름')` |
| 2 | 다른 탭으로 전환: `await page.click('[data-testid="tab-other"]')` |
| 3 | 원래 탭으로 복귀: `await page.click('[data-testid="tab-form"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="form-name-input"]')).toHaveValue('테스트 이름')` |
| **스크린샷** | `e2e-02-form-preserved.png` |
| **관련 요구사항** | UC-02, 시나리오 4.2 |

#### E2E-03: 화면 동적 로딩

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-content.spec.ts` |
| **테스트명** | `test('처음 여는 화면은 로딩 후 표시된다')` |
| **사전조건** | 로그인 |
| **data-testid 셀렉터** | |
| - 메뉴 아이템 | `[data-testid="menu-item-{id}"]` |
| - 로딩 스피너 | `[data-testid="screen-loading"]` |
| - 화면 컨텐츠 | `[data-testid="screen-content"]` |
| **실행 단계** | |
| 1 | 새 메뉴 클릭: `await page.click('[data-testid="menu-item-new-screen"]')` |
| 2 | 로딩 스피너 확인: `await expect(page.locator('[data-testid="screen-loading"]')).toBeVisible()` |
| 3 | 화면 로딩 완료 대기: `await page.waitForSelector('[data-testid="screen-content"]')` |
| **검증 포인트** | 화면 컨텐츠가 표시됨 |
| **스크린샷** | `e2e-03-loading.png`, `e2e-03-loaded.png` |
| **관련 요구사항** | UC-03, 시나리오 4.3 |

#### E2E-04: 탭 없을 때 빈 상태

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-content.spec.ts` |
| **테스트명** | `test('탭이 없으면 빈 상태가 표시된다')` |
| **사전조건** | 로그인, 모든 탭 닫힘 |
| **data-testid 셀렉터** | |
| - 빈 상태 컨테이너 | `[data-testid="mdi-empty-state"]` |
| - 안내 텍스트 | `[data-testid="empty-state-message"]` |
| **실행 단계** | |
| 1 | 모든 탭 닫기: 각 탭의 닫기 버튼 클릭 |
| 2 | 빈 상태 확인 |
| **검증 포인트** | `expect(page.locator('[data-testid="mdi-empty-state"]')).toBeVisible()` |
| **스크린샷** | `e2e-04-empty-state.png` |
| **관련 요구사항** | BR-03 |

#### E2E-05: 존재하지 않는 화면

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-content.spec.ts` |
| **테스트명** | `test('존재하지 않는 화면은 404를 표시한다')` |
| **사전조건** | 로그인 |
| **data-testid 셀렉터** | |
| - 404 컨테이너 | `[data-testid="screen-not-found"]` |
| - 홈 이동 버튼 | `[data-testid="go-home-btn"]` |
| **실행 단계** | |
| 1 | 잘못된 경로로 탭 열기 시도 (프로그래매틱) |
| 2 | 404 화면 확인 |
| **검증 포인트** | `expect(page.locator('[data-testid="screen-not-found"]')).toBeVisible()` |
| **스크린샷** | `e2e-05-not-found.png` |
| **관련 요구사항** | BR-04 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-UI-001 | 탭 전환 | 2개 이상 탭 열림 | 탭 클릭 | 화면 전환됨 | High | UC-01 |
| TC-UI-002 | 상태 유지 | 폼 입력 상태 | 탭 전환 후 복귀 | 입력 값 유지 | High | UC-02 |
| TC-UI-003 | 로딩 표시 | - | 새 화면 열기 | 로딩 스피너 표시 | Medium | UC-03 |
| TC-UI-004 | 빈 상태 | 탭 없음 | 페이지 접속 | 안내 메시지 표시 | Medium | BR-03 |
| TC-UI-005 | 반응형 | - | 브라우저 크기 조절 | 레이아웃 적응 | Medium | 5.4 |
| TC-UI-006 | 키보드 탐색 | - | Tab 키로 이동 | 포커스 이동 | Low | 6.3 |
| TC-UI-007 | 스크롤 영역 | 긴 컨텐츠 | 스크롤 | 컨텐츠 내에서만 스크롤 | Medium | PRD 4.1.1 |

### 4.2 매뉴얼 테스트 상세

#### TC-UI-001: 탭 전환

**테스트 목적**: 사용자가 탭을 클릭하여 화면을 전환할 수 있는지 확인

**테스트 단계**:
1. 2개 이상의 화면 탭을 연다
2. 비활성 탭을 클릭한다
3. 화면이 전환되는지 확인한다

**예상 결과**:
- 클릭한 탭이 활성화됨
- 해당 탭의 화면 컨텐츠가 표시됨
- 이전 탭의 화면은 숨겨짐

**검증 기준**:
- [ ] 탭 활성화 시각적 표시 변경
- [ ] 컨텐츠 영역 내용 변경
- [ ] 전환 애니메이션 (있다면) 부드러움

#### TC-UI-002: 상태 유지

**테스트 목적**: 탭 전환 시 이전 화면의 상태가 유지되는지 확인

**테스트 단계**:
1. 입력 폼이 있는 화면을 연다
2. 폼에 값을 입력한다
3. 다른 탭으로 전환한다
4. 원래 탭으로 돌아온다

**예상 결과**:
- 입력한 값이 그대로 유지됨
- 스크롤 위치 유지 (선택적)
- 선택 상태 유지

**검증 기준**:
- [ ] 텍스트 입력 값 유지
- [ ] 드롭다운 선택 값 유지
- [ ] 체크박스 상태 유지
- [ ] 테이블 필터/정렬 상태 유지

#### TC-UI-005: 반응형 동작

**테스트 목적**: 다양한 화면 크기에서 MDI 컨텐츠 영역이 적절히 표시되는지 확인

**테스트 단계**:
1. 데스크톱 크기 (1920px)에서 확인
2. 태블릿 크기 (768px)로 조절
3. 모바일 크기 (375px)로 조절

**예상 결과**:
- 각 크기에서 컨텐츠가 적절히 표시됨
- 스크롤바가 필요한 경우 표시됨
- 터치 인터페이스에서 사용 가능

**검증 기준**:
- [ ] 데스크톱: 전체 영역 사용
- [ ] 태블릿: 사이드바 접힘 시 확장
- [ ] 모바일: 전체 너비 사용

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-TAB-01 | 대시보드 탭 | `{ id: 'tab-dashboard', title: '대시보드', path: '/dashboard', icon: 'dashboard', closable: true }` |
| MOCK-TAB-02 | 목록 탭 | `{ id: 'tab-list', title: '목록', path: '/list', icon: 'list', closable: true }` |
| MOCK-TAB-03 | 폼 탭 | `{ id: 'tab-form', title: '등록', path: '/form', icon: 'edit', closable: true }` |
| MOCK-TABS-EMPTY | 빈 탭 목록 | `[]` |
| MOCK-TABS-MULTI | 다중 탭 | `[MOCK-TAB-01, MOCK-TAB-02, MOCK-TAB-03]` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-BASE | 기본 E2E 환경 | 자동 시드 | 테스트 사용자, 샘플 메뉴 |
| SEED-E2E-TABS | 다중 탭 환경 | 자동 시드 | 3개 화면 탭 열린 상태 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 기능 테스트 |
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 기능 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 MDI 컨텐츠 영역

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `mdi-content` | MDIContent 컨테이너 | 전체 컨텐츠 영역 확인 |
| `mdi-empty-state` | 빈 상태 컨테이너 | 탭 없을 때 표시 |
| `empty-state-message` | 빈 상태 안내 텍스트 | 메시지 확인 |
| `tab-pane-{id}` | 개별 탭 패널 | 특정 탭 컨텐츠 확인 |
| `screen-loading` | 로딩 스피너 | 로딩 상태 확인 |
| `screen-content` | 화면 컨텐츠 | 화면 로딩 완료 확인 |
| `screen-not-found` | 404 화면 | 경로 없음 확인 |
| `screen-error` | 에러 화면 | 로딩 실패 확인 |
| `go-home-btn` | 홈으로 이동 버튼 | 에러 복구 액션 |
| `refresh-btn` | 새로고침 버튼 | 화면 리로드 액션 |

### 6.2 연관 컴포넌트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `mdi-tab-bar` | 탭 바 | 탭 목록 영역 |
| `tab-{id}` | 개별 탭 | 탭 클릭 대상 |
| `tab-close-{id}` | 탭 닫기 버튼 | 탭 닫기 액션 |

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
| 유즈케이스 (UC) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 사용자 시나리오 | 100% 커버 |
| 에러 케이스 | 80% 커버 |

### 7.3 컴포넌트별 커버리지

| 컴포넌트 | 단위 테스트 | E2E 테스트 |
|---------|-----------|-----------|
| MDIContent.tsx | TC-01-01, TC-01-02, TC-BR-01 | E2E-01, E2E-02, E2E-04 |
| TabPane.tsx | TC-02-01, TC-02-02 | E2E-02 |
| ScreenLoader.tsx | TC-03-01, TC-03-02, TC-ERR-01 | E2E-03, E2E-05 |
| ScreenNotFound.tsx | TC-03-02 | E2E-05 |
| screenRegistry.ts | TC-BR-02 | - |

---

## 관련 문서

- 설계 문서: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |
