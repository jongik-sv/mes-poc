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
| Task ID | TSK-02-04 |
| Task명 | 탭 컨텍스트 메뉴 |
| 설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | TabContextMenu 컴포넌트, MDI Context 확장 함수 | 90% 이상 |
| E2E 테스트 | 탭 컨텍스트 메뉴 인터랙션 시나리오 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | 컨텍스트 메뉴 UX, 접근성 확인 | 전체 기능 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| React 테스트 유틸리티 | @testing-library/react |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | TabContextMenu | 탭 우클릭 시 메뉴 표시 | 컨텍스트 메뉴가 마우스 위치에 표시 | FR-001 |
| UT-002 | TabContextMenu | "닫기" 클릭 시 탭 닫힘 | closeTab 호출됨 | FR-002 |
| UT-003 | MDI Context | closeOtherTabs 호출 | 지정 탭 제외 closable 탭 닫힘 | FR-003 |
| UT-004 | MDI Context | closeRightTabs 호출 | 지정 탭 오른쪽 closable 탭 닫힘 | FR-004 |
| UT-005 | MDI Context | refreshTab 호출 | 탭 리마운트 트리거 | FR-005, BR-003 |
| UT-006 | TabContextMenu | closable=false 탭 메뉴 | "닫기" 메뉴 비활성화 | BR-001 |
| UT-007 | MDI Context | 탭 닫힘 후 활성화 | 인접 탭 활성화 | BR-002 |

### 2.2 테스트 케이스 상세

#### UT-001: 탭 우클릭 시 컨텍스트 메뉴 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabContextMenu.spec.tsx` |
| **테스트 블록** | `describe('TabContextMenu') → it('탭 우클릭 시 메뉴가 표시된다')` |
| **Mock 의존성** | MDI Context |
| **입력 데이터** | 탭 요소에 contextmenu 이벤트 발생 |
| **검증 포인트** | 메뉴 요소가 DOM에 표시됨 |
| **커버리지 대상** | TabContextMenu 렌더링 |
| **관련 요구사항** | FR-001 |

```typescript
// 테스트 의사 코드
it('탭 우클릭 시 메뉴가 표시된다', async () => {
  render(
    <MDIProvider>
      <TabBar />
    </MDIProvider>
  );

  const tab = screen.getByTestId('mdi-tab-work-order');
  fireEvent.contextMenu(tab);

  expect(screen.getByRole('menu')).toBeVisible();
  expect(screen.getByText('닫기')).toBeInTheDocument();
  expect(screen.getByText('다른 탭 모두 닫기')).toBeInTheDocument();
  expect(screen.getByText('오른쪽 탭 모두 닫기')).toBeInTheDocument();
  expect(screen.getByText('새로고침')).toBeInTheDocument();
});
```

#### UT-002: "닫기" 클릭 시 탭 닫힘

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabContextMenu.spec.tsx` |
| **테스트 블록** | `describe('TabContextMenu') → it('닫기 클릭 시 탭이 닫힌다')` |
| **Mock 의존성** | MDI Context (closeTab spy) |
| **입력 데이터** | "닫기" 메뉴 클릭 |
| **검증 포인트** | closeTab이 올바른 tabId로 호출됨 |
| **커버리지 대상** | closeTab 연동 |
| **관련 요구사항** | FR-002 |

```typescript
// 테스트 의사 코드
it('닫기 클릭 시 탭이 닫힌다', async () => {
  const closeTabSpy = vi.fn();
  render(
    <MDIContext.Provider value={{ ...mockContext, closeTab: closeTabSpy }}>
      <TabBar />
    </MDIContext.Provider>
  );

  const tab = screen.getByTestId('mdi-tab-work-order');
  fireEvent.contextMenu(tab);
  fireEvent.click(screen.getByText('닫기'));

  expect(closeTabSpy).toHaveBeenCalledWith('work-order');
});
```

#### UT-003: closeOtherTabs 함수 테스트

| 항목 | 내용 |
|------|------|
| **파일** | `lib/mdi/__tests__/context.spec.tsx` |
| **테스트 블록** | `describe('closeOtherTabs') → it('지정 탭 제외 closable 탭이 닫힌다')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | tabs: [home(closable=false), tab1, tab2(활성), tab3], closeOtherTabs('tab2') |
| **검증 포인트** | tabs: [home, tab2], activeTabId: 'tab2' |
| **커버리지 대상** | closeOtherTabs 로직 |
| **관련 요구사항** | FR-003 |

```typescript
// 테스트 의사 코드
it('지정 탭 제외 closable 탭이 닫힌다', () => {
  const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

  act(() => {
    result.current.openTab({ id: 'home', title: '홈', path: '/', closable: false });
    result.current.openTab({ id: 'tab1', title: '탭1', path: '/page1', closable: true });
    result.current.openTab({ id: 'tab2', title: '탭2', path: '/page2', closable: true });
    result.current.openTab({ id: 'tab3', title: '탭3', path: '/page3', closable: true });
  });

  act(() => {
    result.current.closeOtherTabs('tab2');
  });

  expect(result.current.tabs.map(t => t.id)).toEqual(['home', 'tab2']);
  expect(result.current.activeTabId).toBe('tab2');
});
```

#### UT-004: closeRightTabs 함수 테스트

| 항목 | 내용 |
|------|------|
| **파일** | `lib/mdi/__tests__/context.spec.tsx` |
| **테스트 블록** | `describe('closeRightTabs') → it('지정 탭 오른쪽 closable 탭이 닫힌다')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | tabs: [tab1, tab2, tab3, tab4], closeRightTabs('tab2') |
| **검증 포인트** | tabs: [tab1, tab2], activeTabId 유지 |
| **커버리지 대상** | closeRightTabs 로직 |
| **관련 요구사항** | FR-004 |

```typescript
// 테스트 의사 코드
it('지정 탭 오른쪽 closable 탭이 닫힌다', () => {
  const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

  act(() => {
    result.current.openTab({ id: 'tab1', title: '탭1', path: '/page1', closable: true });
    result.current.openTab({ id: 'tab2', title: '탭2', path: '/page2', closable: true });
    result.current.openTab({ id: 'tab3', title: '탭3', path: '/page3', closable: true });
    result.current.openTab({ id: 'tab4', title: '탭4', path: '/page4', closable: true });
  });

  act(() => {
    result.current.closeRightTabs('tab2');
  });

  expect(result.current.tabs.map(t => t.id)).toEqual(['tab1', 'tab2']);
});
```

#### UT-005: refreshTab 함수 테스트

| 항목 | 내용 |
|------|------|
| **파일** | `lib/mdi/__tests__/context.spec.tsx` |
| **테스트 블록** | `describe('refreshTab') → it('탭 리마운트가 트리거된다')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | refreshTab('tab1') |
| **검증 포인트** | refreshKey 또는 리마운트 플래그 변경 |
| **커버리지 대상** | refreshTab 로직 |
| **관련 요구사항** | FR-005, BR-003 |

```typescript
// 테스트 의사 코드
it('탭 리마운트가 트리거된다', () => {
  const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

  act(() => {
    result.current.openTab({ id: 'tab1', title: '탭1', path: '/page1', closable: true });
  });

  const initialKey = result.current.getTab('tab1')?.refreshKey;

  act(() => {
    result.current.refreshTab('tab1');
  });

  const newKey = result.current.getTab('tab1')?.refreshKey;
  expect(newKey).not.toBe(initialKey);
});
```

#### UT-006: closable=false 탭 메뉴 비활성화

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabContextMenu.spec.tsx` |
| **테스트 블록** | `describe('TabContextMenu') → it('closable=false 탭의 닫기 메뉴가 비활성화된다')` |
| **Mock 의존성** | MDI Context |
| **입력 데이터** | closable=false 탭 우클릭 |
| **검증 포인트** | "닫기" 메뉴 disabled 속성 |
| **커버리지 대상** | 메뉴 상태 분기 |
| **관련 요구사항** | BR-001 |

```typescript
// 테스트 의사 코드
it('closable=false 탭의 닫기 메뉴가 비활성화된다', async () => {
  render(
    <MDIContext.Provider value={{
      ...mockContext,
      tabs: [{ id: 'home', title: '홈', path: '/', closable: false }],
      activeTabId: 'home'
    }}>
      <TabBar />
    </MDIContext.Provider>
  );

  const tab = screen.getByTestId('mdi-tab-home');
  fireEvent.contextMenu(tab);

  const closeMenuItem = screen.getByText('닫기').closest('[role="menuitem"]');
  expect(closeMenuItem).toHaveAttribute('aria-disabled', 'true');
});
```

#### UT-007: 탭 닫힘 후 인접 탭 활성화

| 항목 | 내용 |
|------|------|
| **파일** | `lib/mdi/__tests__/context.spec.tsx` |
| **테스트 블록** | `describe('closeOtherTabs') → it('활성 탭이 닫히면 지정 탭이 활성화된다')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | tabs: [tab1, tab2(활성), tab3], closeOtherTabs('tab3') |
| **검증 포인트** | activeTabId: 'tab3' |
| **커버리지 대상** | 활성 탭 변경 로직 |
| **관련 요구사항** | BR-002 |

```typescript
// 테스트 의사 코드
it('활성 탭이 닫히면 지정 탭이 활성화된다', () => {
  const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

  act(() => {
    result.current.openTab({ id: 'tab1', title: '탭1', path: '/page1', closable: true });
    result.current.openTab({ id: 'tab2', title: '탭2', path: '/page2', closable: true });
    result.current.openTab({ id: 'tab3', title: '탭3', path: '/page3', closable: true });
    result.current.setActiveTab('tab2');
  });

  expect(result.current.activeTabId).toBe('tab2');

  act(() => {
    result.current.closeOtherTabs('tab3');
  });

  expect(result.current.activeTabId).toBe('tab3');
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 탭 우클릭 메뉴 표시 | 탭 1개 이상 열림 | 탭 우클릭 | 컨텍스트 메뉴 표시 | FR-001 |
| E2E-002 | 컨텍스트 메뉴로 탭 닫기 | 탭 2개 이상 열림 | 우클릭 → "닫기" 클릭 | 해당 탭 닫힘 | FR-002 |
| E2E-003 | 다른 탭 모두 닫기 | 탭 3개 이상 열림 | 우클릭 → "다른 탭 모두 닫기" | 대상 탭만 남음 | FR-003 |
| E2E-004 | 오른쪽 탭 모두 닫기 | 탭 3개 이상 열림 | 우클릭 → "오른쪽 탭 모두 닫기" | 오른쪽 탭들 닫힘 | FR-004 |
| E2E-005 | 탭 새로고침 | 탭 열림, 폼에 입력 | 우클릭 → "새로고침" | 화면 초기 상태 복원 | FR-005 |
| E2E-006 | closable=false 탭 보호 | 홈 탭(closable=false) 존재 | "다른 탭 모두 닫기" | 홈 탭 유지됨 | BR-001 |
| E2E-007 | 탭 닫힘 후 활성화 | 탭 3개, 중간 탭 활성 | 중간 탭 닫기 | 인접 탭 활성화 | BR-002 |

### 3.2 테스트 케이스 상세

#### E2E-001: 탭 우클릭 시 컨텍스트 메뉴 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-context-menu.spec.ts` |
| **테스트명** | `test('탭 우클릭 시 컨텍스트 메뉴가 표시된다')` |
| **사전조건** | 로그인 완료, 탭 1개 이상 열림 |
| **data-testid 셀렉터** | |
| - 탭 아이템 | `[data-testid="mdi-tab-{tabId}"]` |
| - 컨텍스트 메뉴 | `[data-testid="tab-context-menu"]` |
| **실행 단계** | |
| 1 | 메뉴에서 화면 열기 |
| 2 | `await page.click('[data-testid="mdi-tab-work-order"]', { button: 'right' })` |
| **검증 포인트** | `expect(page.locator('[data-testid="tab-context-menu"]')).toBeVisible()` |
| **스크린샷** | `e2e-001-context-menu-show.png` |
| **관련 요구사항** | FR-001 |

#### E2E-002: 컨텍스트 메뉴로 탭 닫기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-context-menu.spec.ts` |
| **테스트명** | `test('컨텍스트 메뉴에서 닫기 클릭 시 탭이 닫힌다')` |
| **사전조건** | 탭 2개 이상 열림 |
| **data-testid 셀렉터** | |
| - 닫기 메뉴 | `[data-testid="context-menu-close"]` |
| **실행 단계** | |
| 1 | 탭 2개 열기 |
| 2 | 첫 번째 탭 우클릭 |
| 3 | `await page.click('[data-testid="context-menu-close"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="mdi-tab-{tabId}"]')).not.toBeVisible()` |
| **스크린샷** | `e2e-002-close-tab.png` |
| **관련 요구사항** | FR-002 |

#### E2E-003: 다른 탭 모두 닫기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-context-menu.spec.ts` |
| **테스트명** | `test('다른 탭 모두 닫기 클릭 시 대상 탭만 남는다')` |
| **사전조건** | 탭 3개 이상 열림 |
| **data-testid 셀렉터** | |
| - 다른 탭 모두 닫기 메뉴 | `[data-testid="context-menu-close-others"]` |
| **실행 단계** | |
| 1 | 탭 3개 열기 |
| 2 | 두 번째 탭 우클릭 |
| 3 | `await page.click('[data-testid="context-menu-close-others"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="mdi-tab-item"]')).toHaveCount(1)` |
| **스크린샷** | `e2e-003-close-others.png` |
| **관련 요구사항** | FR-003 |

#### E2E-004: 오른쪽 탭 모두 닫기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-context-menu.spec.ts` |
| **테스트명** | `test('오른쪽 탭 모두 닫기 클릭 시 오른쪽 탭들이 닫힌다')` |
| **사전조건** | 탭 3개 이상 열림 |
| **data-testid 셀렉터** | |
| - 오른쪽 탭 모두 닫기 메뉴 | `[data-testid="context-menu-close-right"]` |
| **실행 단계** | |
| 1 | 탭 4개 열기 |
| 2 | 두 번째 탭 우클릭 |
| 3 | `await page.click('[data-testid="context-menu-close-right"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="mdi-tab-item"]')).toHaveCount(2)` |
| **스크린샷** | `e2e-004-close-right.png` |
| **관련 요구사항** | FR-004 |

#### E2E-005: 탭 새로고침

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-context-menu.spec.ts` |
| **테스트명** | `test('새로고침 클릭 시 화면이 초기 상태로 복원된다')` |
| **사전조건** | 폼 화면 탭 열림, 폼에 입력값 존재 |
| **data-testid 셀렉터** | |
| - 새로고침 메뉴 | `[data-testid="context-menu-refresh"]` |
| - 입력 필드 | `[data-testid="form-input-name"]` |
| **실행 단계** | |
| 1 | 폼 화면 탭 열기 |
| 2 | `await page.fill('[data-testid="form-input-name"]', '테스트 데이터')` |
| 3 | 탭 우클릭 |
| 4 | `await page.click('[data-testid="context-menu-refresh"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="form-input-name"]')).toHaveValue('')` |
| **스크린샷** | `e2e-005-refresh.png` |
| **관련 요구사항** | FR-005, BR-003 |

#### E2E-006: closable=false 탭 보호

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-context-menu.spec.ts` |
| **테스트명** | `test('다른 탭 모두 닫기 시 closable=false 탭은 유지된다')` |
| **사전조건** | 홈 탭(closable=false) + 일반 탭 열림 |
| **data-testid 셀렉터** | |
| - 홈 탭 | `[data-testid="mdi-tab-home"]` |
| **실행 단계** | |
| 1 | 일반 탭 우클릭 |
| 2 | "다른 탭 모두 닫기" 클릭 |
| **검증 포인트** | `expect(page.locator('[data-testid="mdi-tab-home"]')).toBeVisible()` |
| **스크린샷** | `e2e-006-closable-false.png` |
| **관련 요구사항** | BR-001 |

#### E2E-007: 탭 닫힘 후 인접 탭 활성화

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-context-menu.spec.ts` |
| **테스트명** | `test('탭 닫힘 후 인접 탭이 활성화된다')` |
| **사전조건** | 탭 3개 열림, 중간 탭 활성 |
| **실행 단계** | |
| 1 | 탭 3개 열기 |
| 2 | 중간 탭 활성화 |
| 3 | 중간 탭 우클릭 → "닫기" |
| **검증 포인트** | 오른쪽 탭이 활성화됨 |
| **스크린샷** | `e2e-007-adjacent-activation.png` |
| **관련 요구사항** | BR-002 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 컨텍스트 메뉴 표시 | 탭 열림 | 탭 우클릭 | 메뉴 표시 | High | FR-001 |
| TC-002 | 닫기 기능 | 탭 2개 | 우클릭 → 닫기 | 탭 닫힘 | High | FR-002 |
| TC-003 | 다른 탭 모두 닫기 | 탭 3개 | 우클릭 → 다른 탭 모두 닫기 | 대상만 남음 | High | FR-003 |
| TC-004 | 오른쪽 탭 모두 닫기 | 탭 3개 | 우클릭 → 오른쪽 탭 모두 닫기 | 오른쪽 닫힘 | Medium | FR-004 |
| TC-005 | 새로고침 | 폼 입력 상태 | 우클릭 → 새로고침 | 초기 상태 | Medium | FR-005 |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 컨텍스트 메뉴 표시

**테스트 목적**: 탭 우클릭 시 컨텍스트 메뉴가 올바르게 표시되는지 확인

**테스트 단계**:
1. 로그인 완료
2. 사이드바에서 메뉴 클릭하여 탭 열기
3. 열린 탭을 마우스 오른쪽 버튼으로 클릭

**예상 결과**:
- 마우스 위치에 컨텍스트 메뉴 표시
- 메뉴 항목: 닫기, 다른 탭 모두 닫기, 오른쪽 탭 모두 닫기, 새로고침

**검증 기준**:
- [ ] 메뉴가 마우스 위치에 표시됨
- [ ] 모든 메뉴 항목이 표시됨
- [ ] 메뉴 외부 클릭 시 메뉴 닫힘

#### TC-002: 닫기 기능

**테스트 목적**: 컨텍스트 메뉴의 닫기 기능이 올바르게 동작하는지 확인

**테스트 단계**:
1. 탭 2개 열기
2. 첫 번째 탭 우클릭
3. "닫기" 클릭

**예상 결과**:
- 첫 번째 탭이 닫힘
- 두 번째 탭이 활성화됨

**검증 기준**:
- [ ] 클릭한 탭이 닫힘
- [ ] 인접 탭이 활성화됨

#### TC-003: 다른 탭 모두 닫기

**테스트 목적**: 현재 탭을 제외한 모든 탭이 닫히는지 확인

**테스트 단계**:
1. 탭 3개 열기
2. 두 번째 탭 우클릭
3. "다른 탭 모두 닫기" 클릭

**예상 결과**:
- 두 번째 탭만 남음
- 첫 번째, 세 번째 탭 닫힘

**검증 기준**:
- [ ] 우클릭한 탭만 남음
- [ ] closable=false 탭은 유지됨

#### TC-004: 오른쪽 탭 모두 닫기

**테스트 목적**: 현재 탭 오른쪽의 모든 탭이 닫히는지 확인

**테스트 단계**:
1. 탭 4개 열기
2. 두 번째 탭 우클릭
3. "오른쪽 탭 모두 닫기" 클릭

**예상 결과**:
- 첫 번째, 두 번째 탭만 남음
- 세 번째, 네 번째 탭 닫힘

**검증 기준**:
- [ ] 우클릭한 탭과 왼쪽 탭 유지
- [ ] 오른쪽 탭만 닫힘

#### TC-005: 새로고침

**테스트 목적**: 탭 새로고침이 화면을 초기 상태로 복원하는지 확인

**테스트 단계**:
1. 폼이 있는 화면 탭 열기
2. 폼에 데이터 입력
3. 탭 우클릭 → "새로고침" 클릭

**예상 결과**:
- 입력한 데이터가 초기화됨
- 화면이 초기 상태로 복원됨

**검증 기준**:
- [ ] 폼 입력값 초기화
- [ ] API 데이터 다시 로드

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-TAB-HOME | closable=false 탭 | `{ id: 'home', title: '홈', path: '/', closable: false }` |
| MOCK-TAB-01 | 일반 탭 1 | `{ id: 'tab1', title: '작업 지시', path: '/work-order', closable: true }` |
| MOCK-TAB-02 | 일반 탭 2 | `{ id: 'tab2', title: '실적 입력', path: '/production', closable: true }` |
| MOCK-TAB-03 | 일반 탭 3 | `{ id: 'tab3', title: '품질 검사', path: '/quality', closable: true }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-LOGIN | 로그인 상태 | fixture | 테스트 사용자 세션 |
| SEED-E2E-MENU | 메뉴 데이터 | 자동 시드 | 메뉴 4개 이상 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 컨텍스트 메뉴 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 컨텍스트 메뉴 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `tab-context-menu` | 컨텍스트 메뉴 컨테이너 | 메뉴 표시 확인 |
| `context-menu-close` | 닫기 메뉴 항목 | 닫기 액션 |
| `context-menu-close-others` | 다른 탭 모두 닫기 메뉴 | 다른 탭 닫기 액션 |
| `context-menu-close-right` | 오른쪽 탭 모두 닫기 메뉴 | 오른쪽 탭 닫기 액션 |
| `context-menu-refresh` | 새로고침 메뉴 항목 | 새로고침 액션 |

### 6.2 탭 바 셀렉터 (TSK-02-02에서 정의)

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `mdi-tab-bar` | 탭 바 컨테이너 | 탭 바 존재 확인 |
| `mdi-tab-{tabId}` | 개별 탭 | 특정 탭 선택/확인 |
| `mdi-tab-item` | 탭 아이템 (공통) | 탭 개수 확인 |

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 90% | 80% |
| Branches | 85% | 75% |
| Functions | 95% | 85% |
| Statements | 90% | 80% |

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

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |

---

<!--
Task: TSK-02-04 탭 컨텍스트 메뉴
Created: 2026-01-20
Author: Claude
-->
