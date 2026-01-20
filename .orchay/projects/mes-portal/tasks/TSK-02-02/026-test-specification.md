# TSK-02-02 테스트 명세서

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-02 |
| Task명 | 탭 바 컴포넌트 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | TabBar, TabItem 컴포넌트, 스크롤/오버플로우 로직 | 80% 이상 |
| E2E 테스트 | 탭 전환, 탭 닫기, 오버플로우 스크롤 시나리오 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 반응형, 접근성 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터베이스 | N/A (프론트엔드 컴포넌트) |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |
| 반응형 테스트 뷰포트 | Desktop (1280x720), Tablet (768x1024), Mobile (375x667) |

### 1.3 MDI Context Mock 방법

```typescript
// tests/utils/mdi-test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { MDIProvider } from '@/lib/mdi/context';
import { Tab } from '@/lib/mdi/types';

interface MDITestProviderProps {
  initialTabs?: Tab[];
  initialActiveTab?: string | null;
  children: React.ReactNode;
}

export function MDITestProvider({
  initialTabs = [],
  initialActiveTab = null,
  children,
}: MDITestProviderProps) {
  return (
    <MDIProvider initialTabs={initialTabs} initialActiveTab={initialActiveTab}>
      {children}
    </MDIProvider>
  );
}

export function renderWithMDI(
  ui: React.ReactElement,
  {
    initialTabs = [],
    initialActiveTab = null,
    ...options
  }: Omit<RenderOptions, 'wrapper'> & {
    initialTabs?: Tab[];
    initialActiveTab?: string | null;
  } = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <MDITestProvider initialTabs={initialTabs} initialActiveTab={initialActiveTab}>
        {children}
      </MDITestProvider>
    ),
    ...options,
  });
}
```

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | TabBar | 탭 목록 렌더링 | 모든 탭 아이템 표시 | UC-01 |
| UT-002 | TabBar | 활성 탭 강조 표시 | 활성 탭에 강조 스타일 적용 | UC-01 |
| UT-003 | TabItem | 탭 아이콘 + 제목 표시 | 아이콘과 제목 렌더링 | UC-01 |
| UT-004 | TabItem | 닫기 버튼 표시 | closable 탭에 닫기 버튼 표시 | UC-03 |
| UT-005 | TabItem | 닫기 불가 탭 | closable: false 시 닫기 버튼 숨김 | UC-03 |
| UT-006 | TabBar | 탭 클릭 시 전환 | setActiveTab 호출 | UC-02 |
| UT-007 | TabBar | 닫기 버튼 클릭 | closeTab 호출, 이벤트 전파 중지 | UC-03 |
| UT-008 | TabBar | 좌측 스크롤 버튼 표시 | scrollLeft > 0 시 표시 | UC-04 |
| UT-009 | TabBar | 우측 스크롤 버튼 표시 | 오버플로우 시 표시 | UC-04 |
| UT-010 | TabBar | 스크롤 버튼 클릭 | 탭 목록 스크롤 | UC-04 |
| UT-011 | TabBar | 드롭다운 메뉴 표시 | 탭 5개 초과 시 드롭다운 표시 | UC-04 |
| UT-012 | TabBar | 드롭다운 메뉴 항목 클릭 | 해당 탭 활성화 | UC-04 |
| UT-BR-01 | TabBar | 마지막 탭 닫기 방지 | 탭 1개일 때 닫기 비활성화 | BR-01 |
| UT-BR-02 | TabBar | 활성 탭 닫기 시 인접 탭 활성화 | 우측 우선, 없으면 좌측 | BR-02 |
| UT-BR-03 | TabBar | 중복 탭 열기 방지 | 기존 탭으로 전환 | BR-03 |
| UT-BR-04 | TabBar | 최대 탭 개수 제한 | 제한 초과 시 경고 | BR-04 |
| UT-A11Y-01 | TabItem | 키보드 접근성 | role="tab", aria-selected | 6.3 |
| UT-A11Y-02 | TabBar | 스크린 리더 지원 | aria-label 적용 | 6.3 |

### 2.2 테스트 케이스 상세

#### UT-001: 탭 목록 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar') -> it('renders all tab items')` |
| **Mock 의존성** | MDI Context (tabs, activeTabId) |
| **입력 데이터** | `tabs: [{id: 'tab1', title: '대시보드'}, {id: 'tab2', title: '작업지시'}]` |
| **검증 포인트** | 모든 탭 아이템이 렌더링됨 |
| **커버리지 대상** | TabBar 렌더링 로직 |
| **관련 요구사항** | UC-01 |

**테스트 코드 가이드:**
```typescript
import { render, screen } from '@testing-library/react';
import { TabBar } from '../TabBar';
import { renderWithMDI } from '@/tests/utils/mdi-test-utils';

describe('TabBar', () => {
  const mockTabs = [
    { id: 'tab1', title: '대시보드', path: '/dashboard', closable: true },
    { id: 'tab2', title: '작업지시', path: '/work-order', closable: true },
    { id: 'tab3', title: '생산현황', path: '/production', closable: true },
  ];

  it('모든 탭 아이템을 렌더링한다', () => {
    renderWithMDI(<TabBar />, {
      initialTabs: mockTabs,
      initialActiveTab: 'tab1',
    });

    expect(screen.getByTestId('tab-item-tab1')).toBeInTheDocument();
    expect(screen.getByTestId('tab-item-tab2')).toBeInTheDocument();
    expect(screen.getByTestId('tab-item-tab3')).toBeInTheDocument();
    expect(screen.getByText('대시보드')).toBeInTheDocument();
    expect(screen.getByText('작업지시')).toBeInTheDocument();
    expect(screen.getByText('생산현황')).toBeInTheDocument();
  });
});
```

#### UT-002: 활성 탭 강조 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar') -> it('highlights active tab')` |
| **Mock 의존성** | MDI Context |
| **입력 데이터** | `tabs: [...], activeTabId: 'tab2'` |
| **검증 포인트** | 활성 탭에 강조 스타일 적용, aria-selected="true" |
| **커버리지 대상** | 활성 탭 스타일 로직 |
| **관련 요구사항** | UC-01 |

**테스트 코드 가이드:**
```typescript
it('활성 탭에 강조 스타일을 적용한다', () => {
  renderWithMDI(<TabBar />, {
    initialTabs: mockTabs,
    initialActiveTab: 'tab2',
  });

  const activeTab = screen.getByTestId('tab-item-tab2');
  const inactiveTab = screen.getByTestId('tab-item-tab1');

  // aria-selected 확인
  expect(activeTab).toHaveAttribute('aria-selected', 'true');
  expect(inactiveTab).toHaveAttribute('aria-selected', 'false');

  // 활성 탭 스타일 클래스 확인
  expect(activeTab).toHaveClass('bg-white');
  expect(inactiveTab).not.toHaveClass('bg-white');
});
```

#### UT-003: 탭 아이콘 + 제목 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabItem.test.tsx` |
| **테스트 블록** | `describe('TabItem') -> it('renders icon and title')` |
| **Mock 의존성** | - |
| **입력 데이터** | `tab: { id: 'tab1', title: '대시보드', icon: <DashboardIcon /> }` |
| **검증 포인트** | 아이콘과 제목 모두 렌더링 |
| **관련 요구사항** | UC-01 |

**테스트 코드 가이드:**
```typescript
import { render, screen } from '@testing-library/react';
import { TabItem } from '../TabItem';
import { DashboardOutlined } from '@ant-design/icons';

describe('TabItem', () => {
  it('아이콘과 제목을 렌더링한다', () => {
    const tab = {
      id: 'tab1',
      title: '대시보드',
      path: '/dashboard',
      icon: <DashboardOutlined data-testid="tab-icon" />,
      closable: true,
    };

    render(
      <TabItem
        tab={tab}
        isActive={false}
        onClick={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('tab-icon')).toBeInTheDocument();
    expect(screen.getByText('대시보드')).toBeInTheDocument();
  });
});
```

#### UT-004: 닫기 버튼 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabItem.test.tsx` |
| **테스트 블록** | `describe('TabItem') -> it('shows close button for closable tab')` |
| **입력 데이터** | `tab: { closable: true }` |
| **검증 포인트** | 닫기 버튼 존재 |
| **관련 요구사항** | UC-03 |

**테스트 코드 가이드:**
```typescript
it('closable 탭에 닫기 버튼을 표시한다', () => {
  const tab = { id: 'tab1', title: '대시보드', path: '/dashboard', closable: true };

  render(
    <TabItem
      tab={tab}
      isActive={false}
      onClick={vi.fn()}
      onClose={vi.fn()}
    />
  );

  expect(screen.getByTestId('tab-close-btn-tab1')).toBeInTheDocument();
  expect(screen.getByLabelText('대시보드 탭 닫기')).toBeInTheDocument();
});
```

#### UT-005: 닫기 불가 탭

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabItem.test.tsx` |
| **테스트 블록** | `describe('TabItem') -> it('hides close button when closable is false')` |
| **입력 데이터** | `tab: { closable: false }` |
| **검증 포인트** | 닫기 버튼 숨김 |
| **관련 요구사항** | UC-03 |

**테스트 코드 가이드:**
```typescript
it('closable이 false이면 닫기 버튼을 숨긴다', () => {
  const tab = { id: 'home', title: '홈', path: '/', closable: false };

  render(
    <TabItem
      tab={tab}
      isActive={false}
      onClick={vi.fn()}
      onClose={vi.fn()}
    />
  );

  expect(screen.queryByTestId('tab-close-btn-home')).not.toBeInTheDocument();
});
```

#### UT-006: 탭 클릭 시 전환

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar') -> it('calls setActiveTab on tab click')` |
| **Mock 의존성** | MDI Context (setActiveTab spy) |
| **입력 데이터** | 비활성 탭 클릭 |
| **검증 포인트** | setActiveTab이 탭 ID와 함께 호출됨 |
| **관련 요구사항** | UC-02 |

**테스트 코드 가이드:**
```typescript
it('탭 클릭 시 setActiveTab을 호출한다', async () => {
  const setActiveTabSpy = vi.fn();

  // MDI Context를 spy와 함께 mock
  vi.mock('@/lib/mdi/context', () => ({
    useMDI: () => ({
      tabs: mockTabs,
      activeTabId: 'tab1',
      setActiveTab: setActiveTabSpy,
      closeTab: vi.fn(),
    }),
  }));

  const { user } = renderWithUser(<TabBar />);

  await user.click(screen.getByTestId('tab-item-tab2'));

  expect(setActiveTabSpy).toHaveBeenCalledWith('tab2');
});
```

#### UT-007: 닫기 버튼 클릭

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar') -> it('calls closeTab on close button click')` |
| **Mock 의존성** | MDI Context (closeTab spy) |
| **입력 데이터** | 닫기 버튼 클릭 |
| **검증 포인트** | closeTab 호출, setActiveTab 미호출 (이벤트 전파 중지) |
| **관련 요구사항** | UC-03 |

**테스트 코드 가이드:**
```typescript
it('닫기 버튼 클릭 시 closeTab을 호출하고 탭 전환은 발생하지 않는다', async () => {
  const closeTabSpy = vi.fn();
  const setActiveTabSpy = vi.fn();

  vi.mock('@/lib/mdi/context', () => ({
    useMDI: () => ({
      tabs: mockTabs,
      activeTabId: 'tab1',
      setActiveTab: setActiveTabSpy,
      closeTab: closeTabSpy,
    }),
  }));

  const { user } = renderWithUser(<TabBar />);

  await user.click(screen.getByTestId('tab-close-btn-tab2'));

  expect(closeTabSpy).toHaveBeenCalledWith('tab2');
  expect(setActiveTabSpy).not.toHaveBeenCalled(); // 이벤트 전파 중지 확인
});
```

#### UT-008: 좌측 스크롤 버튼 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar') -> it('shows left scroll button when scrolled')` |
| **Mock 의존성** | ResizeObserver mock |
| **입력 데이터** | 컨테이너 scrollLeft > 0 |
| **검증 포인트** | 좌측 스크롤 버튼 표시 |
| **관련 요구사항** | UC-04 |

**테스트 코드 가이드:**
```typescript
it('스크롤 위치가 0보다 크면 좌측 스크롤 버튼을 표시한다', () => {
  const manyTabs = Array.from({ length: 10 }, (_, i) => ({
    id: `tab-${i}`,
    title: `탭 ${i}`,
    path: `/screen-${i}`,
    closable: true,
  }));

  renderWithMDI(<TabBar />, {
    initialTabs: manyTabs,
    initialActiveTab: 'tab-0',
  });

  // 초기에는 좌측 스크롤 버튼 숨김
  expect(screen.queryByTestId('tab-scroll-left')).not.toBeInTheDocument();

  // 스크롤 이벤트 시뮬레이션
  const container = screen.getByTestId('tab-bar-container');
  Object.defineProperty(container, 'scrollLeft', { value: 100 });
  fireEvent.scroll(container);

  // 좌측 스크롤 버튼 표시
  expect(screen.getByTestId('tab-scroll-left')).toBeInTheDocument();
});
```

#### UT-009: 우측 스크롤 버튼 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar') -> it('shows right scroll button on overflow')` |
| **Mock 의존성** | ResizeObserver mock |
| **입력 데이터** | scrollWidth > clientWidth |
| **검증 포인트** | 우측 스크롤 버튼 표시 |
| **관련 요구사항** | UC-04 |

**테스트 코드 가이드:**
```typescript
it('탭 오버플로우 시 우측 스크롤 버튼을 표시한다', () => {
  const manyTabs = Array.from({ length: 10 }, (_, i) => ({
    id: `tab-${i}`,
    title: `탭 ${i}`,
    path: `/screen-${i}`,
    closable: true,
  }));

  renderWithMDI(<TabBar />, {
    initialTabs: manyTabs,
    initialActiveTab: 'tab-0',
  });

  // 오버플로우 상태 시뮬레이션
  const container = screen.getByTestId('tab-bar-container');
  Object.defineProperty(container, 'scrollWidth', { value: 1500 });
  Object.defineProperty(container, 'clientWidth', { value: 800 });
  fireEvent.scroll(container);

  expect(screen.getByTestId('tab-scroll-right')).toBeInTheDocument();
});
```

#### UT-010: 스크롤 버튼 클릭

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar') -> it('scrolls tabs on scroll button click')` |
| **Mock 의존성** | scrollBy mock |
| **입력 데이터** | 스크롤 버튼 클릭 |
| **검증 포인트** | container.scrollBy 호출 |
| **관련 요구사항** | UC-04 |

**테스트 코드 가이드:**
```typescript
it('스크롤 버튼 클릭 시 탭 목록을 스크롤한다', async () => {
  const manyTabs = Array.from({ length: 10 }, (_, i) => ({
    id: `tab-${i}`,
    title: `탭 ${i}`,
    path: `/screen-${i}`,
    closable: true,
  }));

  renderWithMDI(<TabBar />, {
    initialTabs: manyTabs,
    initialActiveTab: 'tab-0',
  });

  const container = screen.getByTestId('tab-bar-container');
  const scrollBySpy = vi.spyOn(container, 'scrollBy');

  // 오버플로우 상태 설정
  Object.defineProperty(container, 'scrollWidth', { value: 1500 });
  Object.defineProperty(container, 'clientWidth', { value: 800 });
  fireEvent.scroll(container);

  const { user } = renderWithUser(<></>);
  await user.click(screen.getByTestId('tab-scroll-right'));

  expect(scrollBySpy).toHaveBeenCalledWith({
    left: 200,
    behavior: 'smooth',
  });
});
```

#### UT-011: 드롭다운 메뉴 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar') -> it('shows dropdown menu when tabs > 5')` |
| **입력 데이터** | 6개 이상 탭 |
| **검증 포인트** | 드롭다운 버튼 표시 |
| **관련 요구사항** | UC-04 |

**테스트 코드 가이드:**
```typescript
it('탭이 5개 초과하면 드롭다운 메뉴 버튼을 표시한다', () => {
  const sixTabs = Array.from({ length: 6 }, (_, i) => ({
    id: `tab-${i}`,
    title: `탭 ${i}`,
    path: `/screen-${i}`,
    closable: true,
  }));

  renderWithMDI(<TabBar />, {
    initialTabs: sixTabs,
    initialActiveTab: 'tab-0',
  });

  expect(screen.getByTestId('tab-dropdown-btn')).toBeInTheDocument();
});

it('탭이 5개 이하면 드롭다운 메뉴 버튼을 숨긴다', () => {
  const fiveTabs = Array.from({ length: 5 }, (_, i) => ({
    id: `tab-${i}`,
    title: `탭 ${i}`,
    path: `/screen-${i}`,
    closable: true,
  }));

  renderWithMDI(<TabBar />, {
    initialTabs: fiveTabs,
    initialActiveTab: 'tab-0',
  });

  expect(screen.queryByTestId('tab-dropdown-btn')).not.toBeInTheDocument();
});
```

#### UT-012: 드롭다운 메뉴 항목 클릭

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar') -> it('activates tab from dropdown menu')` |
| **입력 데이터** | 드롭다운 메뉴 항목 클릭 |
| **검증 포인트** | setActiveTab 호출 |
| **관련 요구사항** | UC-04 |

**테스트 코드 가이드:**
```typescript
it('드롭다운 메뉴 항목 클릭 시 해당 탭을 활성화한다', async () => {
  const setActiveTabSpy = vi.fn();
  const sixTabs = Array.from({ length: 6 }, (_, i) => ({
    id: `tab-${i}`,
    title: `탭 ${i}`,
    path: `/screen-${i}`,
    closable: true,
  }));

  vi.mock('@/lib/mdi/context', () => ({
    useMDI: () => ({
      tabs: sixTabs,
      activeTabId: 'tab-0',
      setActiveTab: setActiveTabSpy,
      closeTab: vi.fn(),
    }),
  }));

  const { user } = renderWithUser(<TabBar />);

  // 드롭다운 열기
  await user.click(screen.getByTestId('tab-dropdown-btn'));

  // 메뉴 항목 클릭
  await user.click(screen.getByText('탭 5'));

  expect(setActiveTabSpy).toHaveBeenCalledWith('tab-5');
});
```

#### UT-BR-01: 마지막 탭 닫기 방지

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar Business Rules') -> it('prevents closing last tab')` |
| **입력 데이터** | 탭 1개만 존재 |
| **검증 포인트** | 닫기 버튼 비활성화 또는 숨김 |
| **관련 요구사항** | BR-01 |

**테스트 코드 가이드:**
```typescript
describe('TabBar Business Rules', () => {
  it('마지막 탭은 닫기 버튼을 숨긴다', () => {
    const singleTab = [{ id: 'tab1', title: '대시보드', path: '/dashboard', closable: true }];

    renderWithMDI(<TabBar />, {
      initialTabs: singleTab,
      initialActiveTab: 'tab1',
    });

    // 마지막 탭이므로 닫기 버튼 숨김
    expect(screen.queryByTestId('tab-close-btn-tab1')).not.toBeInTheDocument();
  });
});
```

#### UT-BR-02: 활성 탭 닫기 시 인접 탭 활성화

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar Business Rules') -> it('activates adjacent tab on active tab close')` |
| **입력 데이터** | 활성 탭 닫기 |
| **검증 포인트** | 우측 탭 우선, 없으면 좌측 탭 활성화 |
| **관련 요구사항** | BR-02 |

**테스트 코드 가이드:**
```typescript
it('활성 탭 닫기 시 우측 탭을 활성화한다', async () => {
  const { result } = renderHook(() => useMDI(), {
    wrapper: ({ children }) => (
      <MDIProvider initialTabs={mockTabs} initialActiveTab="tab2">
        {children}
      </MDIProvider>
    ),
  });

  // [tab1, tab2(활성), tab3] 에서 tab2 닫기
  act(() => result.current.closeTab('tab2'));

  // tab3(우측)이 활성화됨
  expect(result.current.activeTabId).toBe('tab3');
});

it('마지막 탭 닫기 시 좌측 탭을 활성화한다', async () => {
  const { result } = renderHook(() => useMDI(), {
    wrapper: ({ children }) => (
      <MDIProvider initialTabs={mockTabs} initialActiveTab="tab3">
        {children}
      </MDIProvider>
    ),
  });

  // [tab1, tab2, tab3(활성)] 에서 tab3 닫기
  act(() => result.current.closeTab('tab3'));

  // tab2(좌측)이 활성화됨
  expect(result.current.activeTabId).toBe('tab2');
});
```

#### UT-BR-03: 중복 탭 열기 방지

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar Business Rules') -> it('prevents duplicate tab opening')` |
| **입력 데이터** | 이미 열린 화면 경로로 탭 열기 시도 |
| **검증 포인트** | 새 탭 생성 안 함, 기존 탭 활성화 |
| **관련 요구사항** | BR-03 |

**테스트 코드 가이드:**
```typescript
it('이미 열린 화면은 새 탭을 생성하지 않고 기존 탭으로 전환한다', () => {
  const { result } = renderHook(() => useMDI(), {
    wrapper: ({ children }) => (
      <MDIProvider initialTabs={mockTabs} initialActiveTab="tab1">
        {children}
      </MDIProvider>
    ),
  });

  const beforeCount = result.current.tabs.length;

  // 이미 열린 경로로 탭 열기 시도
  act(() => result.current.openTab({ title: '작업지시', path: '/work-order' }));

  // 탭 개수 변경 없음
  expect(result.current.tabs.length).toBe(beforeCount);
  // 해당 탭으로 전환
  expect(result.current.activeTabId).toBe('tab2');
});
```

#### UT-BR-04: 최대 탭 개수 제한

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar Business Rules') -> it('limits maximum tab count')` |
| **입력 데이터** | 10개 탭 열린 상태에서 11번째 열기 시도 |
| **검증 포인트** | 탭 추가 안 됨, 경고 메시지 표시 |
| **관련 요구사항** | BR-04 |

**테스트 코드 가이드:**
```typescript
it('최대 10개 탭까지만 열 수 있다', () => {
  const tenTabs = Array.from({ length: 10 }, (_, i) => ({
    id: `tab-${i}`,
    title: `탭 ${i}`,
    path: `/screen-${i}`,
    closable: true,
  }));

  const { result } = renderHook(() => useMDI(), {
    wrapper: ({ children }) => (
      <MDIProvider initialTabs={tenTabs} initialActiveTab="tab-0">
        {children}
      </MDIProvider>
    ),
  });

  const beforeCount = result.current.tabs.length;

  // 11번째 탭 열기 시도
  act(() => result.current.openTab({ title: '새 화면', path: '/new-screen' }));

  // 탭 개수 변경 없음
  expect(result.current.tabs.length).toBe(beforeCount);
  // 알림 메시지 검증 (message.warning mock 필요)
});
```

#### UT-A11Y-01: 키보드 접근성

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabItem.test.tsx` |
| **테스트 블록** | `describe('TabItem Accessibility') -> it('has proper ARIA attributes')` |
| **검증 포인트** | role="tab", aria-selected, tabIndex |
| **관련 요구사항** | 6.3 |

**테스트 코드 가이드:**
```typescript
describe('TabItem Accessibility', () => {
  it('적절한 ARIA 속성을 가진다', () => {
    const tab = { id: 'tab1', title: '대시보드', path: '/dashboard', closable: true };

    render(
      <TabItem
        tab={tab}
        isActive={true}
        onClick={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const tabElement = screen.getByTestId('tab-item-tab1');

    expect(tabElement).toHaveAttribute('role', 'tab');
    expect(tabElement).toHaveAttribute('aria-selected', 'true');
    expect(tabElement).toHaveAttribute('tabIndex', '0');
  });
});
```

#### UT-A11Y-02: 스크린 리더 지원

| 항목 | 내용 |
|------|------|
| **파일** | `components/mdi/__tests__/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar Accessibility') -> it('has proper aria-labels')` |
| **검증 포인트** | 스크롤 버튼, 드롭다운 버튼에 aria-label |
| **관련 요구사항** | 6.3 |

**테스트 코드 가이드:**
```typescript
describe('TabBar Accessibility', () => {
  it('스크롤 버튼에 적절한 aria-label이 있다', () => {
    const manyTabs = Array.from({ length: 10 }, (_, i) => ({
      id: `tab-${i}`,
      title: `탭 ${i}`,
      path: `/screen-${i}`,
      closable: true,
    }));

    renderWithMDI(<TabBar />, {
      initialTabs: manyTabs,
      initialActiveTab: 'tab-5',
    });

    // 오버플로우 상태 시뮬레이션
    const container = screen.getByTestId('tab-bar-container');
    Object.defineProperty(container, 'scrollLeft', { value: 100 });
    Object.defineProperty(container, 'scrollWidth', { value: 1500 });
    Object.defineProperty(container, 'clientWidth', { value: 800 });
    fireEvent.scroll(container);

    expect(screen.getByLabelText('이전 탭')).toBeInTheDocument();
    expect(screen.getByLabelText('다음 탭')).toBeInTheDocument();
    expect(screen.getByLabelText('모든 탭 보기')).toBeInTheDocument();
  });
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-01 | 메뉴 클릭으로 탭 열기 | 로그인 | 1. 메뉴 클릭 | 탭 추가, 화면 표시 | UC-01 |
| E2E-02 | 탭 클릭으로 화면 전환 | 2개 이상 탭 열림 | 1. 비활성 탭 클릭 | 탭 활성화, 화면 전환 | UC-02 |
| E2E-03 | 탭 닫기 | 2개 이상 탭 열림 | 1. 닫기 버튼 클릭 | 탭 제거 | UC-03 |
| E2E-04 | 활성 탭 닫기 후 전환 | 3개 탭 열림 | 1. 활성 탭 닫기 | 인접 탭 활성화 | BR-02 |
| E2E-05 | 탭 오버플로우 스크롤 | 많은 탭 열림 | 1. 스크롤 버튼 클릭 | 탭 목록 스크롤 | UC-04 |
| E2E-06 | 드롭다운으로 탭 선택 | 6개 이상 탭 열림 | 1. 드롭다운 클릭 2. 항목 선택 | 해당 탭 활성화 | UC-04 |
| E2E-07 | 중복 탭 열기 방지 | 1개 탭 열림 | 1. 같은 메뉴 다시 클릭 | 기존 탭으로 전환 | BR-03 |
| E2E-08 | 최대 탭 제한 | 10개 탭 열림 | 1. 11번째 메뉴 클릭 | 알림 표시, 탭 추가 안 됨 | BR-04 |
| E2E-09 | 반응형 탭 바 | 로그인 | 1. 뷰포트 크기 변경 | 레이아웃 적응 | 5.4 |
| E2E-10 | 키보드 탭 전환 | 로그인, 탭 존재 | 1. Ctrl+Tab 입력 | 다음 탭 전환 | 6.3 |

### 3.2 테스트 케이스 상세

#### E2E-01: 메뉴 클릭으로 탭 열기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/tab-bar.spec.ts` |
| **테스트명** | `test('메뉴 클릭 시 탭이 추가된다')` |
| **사전조건** | 로그인 상태 |
| **data-testid 셀렉터** | |
| - 메뉴 항목 | `[data-testid="menu-item-{id}"]` |
| - 탭 바 | `[data-testid="tab-bar"]` |
| - 탭 아이템 | `[data-testid="tab-item-{id}"]` |
| **실행 단계** | |
| 1 | 사이드바 메뉴에서 "작업지시" 클릭: `await page.click('[data-testid="menu-item-work-order"]')` |
| 2 | 탭 바에 탭 추가 확인: `await expect(page.locator('[data-testid="tab-item-work-order"]')).toBeVisible()` |
| 3 | 해당 화면 컨텐츠 표시 확인 |
| **검증 포인트** | 탭 추가, 활성화, 화면 표시 |
| **스크린샷** | `e2e-01-tab-opened.png` |
| **관련 요구사항** | UC-01 |

```typescript
import { test, expect } from '@playwright/test';

test.describe('TabBar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 로그인 처리 (필요 시)
  });

  test('메뉴 클릭 시 탭이 추가된다', async ({ page }) => {
    // 메뉴 클릭
    await page.click('[data-testid="menu-item-work-order"]');

    // 탭 추가 확인
    await expect(page.locator('[data-testid="tab-item-work-order"]')).toBeVisible();

    // 탭이 활성 상태인지 확인
    await expect(page.locator('[data-testid="tab-item-work-order"]')).toHaveAttribute('aria-selected', 'true');

    // 화면 컨텐츠 표시 확인
    await expect(page.locator('[data-testid="mdi-content"]')).toContainText('작업지시');

    await page.screenshot({ path: 'e2e-01-tab-opened.png' });
  });
});
```

#### E2E-02: 탭 클릭으로 화면 전환

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/tab-bar.spec.ts` |
| **테스트명** | `test('탭 클릭 시 화면이 전환된다')` |
| **사전조건** | 2개 이상 탭 열림 |
| **data-testid 셀렉터** | |
| - 탭 아이템 | `[data-testid="tab-item-{id}"]` |
| - 컨텐츠 영역 | `[data-testid="mdi-content"]` |
| **실행 단계** | |
| 1 | 대시보드 메뉴 클릭하여 탭 열기 |
| 2 | 작업지시 메뉴 클릭하여 탭 열기 |
| 3 | 대시보드 탭 클릭: `await page.click('[data-testid="tab-item-dashboard"]')` |
| 4 | 대시보드 화면 표시 확인 |
| **검증 포인트** | 탭 활성 상태 변경, 화면 전환 |
| **스크린샷** | `e2e-02-tab-switch.png` |
| **관련 요구사항** | UC-02 |

```typescript
test('탭 클릭 시 화면이 전환된다', async ({ page }) => {
  // 2개 탭 열기
  await page.click('[data-testid="menu-item-dashboard"]');
  await page.click('[data-testid="menu-item-work-order"]');

  // 작업지시 탭이 활성 상태
  await expect(page.locator('[data-testid="tab-item-work-order"]')).toHaveAttribute('aria-selected', 'true');

  // 대시보드 탭 클릭
  await page.click('[data-testid="tab-item-dashboard"]');

  // 대시보드 탭이 활성 상태로 변경
  await expect(page.locator('[data-testid="tab-item-dashboard"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-testid="tab-item-work-order"]')).toHaveAttribute('aria-selected', 'false');

  // 대시보드 화면 표시 확인
  await expect(page.locator('[data-testid="mdi-content"]')).toContainText('대시보드');

  await page.screenshot({ path: 'e2e-02-tab-switch.png' });
});
```

#### E2E-03: 탭 닫기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/tab-bar.spec.ts` |
| **테스트명** | `test('닫기 버튼 클릭 시 탭이 제거된다')` |
| **사전조건** | 2개 이상 탭 열림 |
| **data-testid 셀렉터** | |
| - 탭 닫기 버튼 | `[data-testid="tab-close-btn-{id}"]` |
| **실행 단계** | |
| 1 | 2개 탭 열기 |
| 2 | 두 번째 탭의 닫기 버튼 클릭: `await page.click('[data-testid="tab-close-btn-work-order"]')` |
| 3 | 탭 제거 확인 |
| **검증 포인트** | 탭 목록에서 제거 |
| **스크린샷** | `e2e-03-tab-closed.png` |
| **관련 요구사항** | UC-03 |

```typescript
test('닫기 버튼 클릭 시 탭이 제거된다', async ({ page }) => {
  // 2개 탭 열기
  await page.click('[data-testid="menu-item-dashboard"]');
  await page.click('[data-testid="menu-item-work-order"]');

  // 탭 2개 존재 확인
  await expect(page.locator('[data-testid^="tab-item-"]')).toHaveCount(2);

  // 작업지시 탭 닫기
  await page.click('[data-testid="tab-close-btn-work-order"]');

  // 탭 1개로 감소 확인
  await expect(page.locator('[data-testid^="tab-item-"]')).toHaveCount(1);
  await expect(page.locator('[data-testid="tab-item-work-order"]')).not.toBeVisible();

  await page.screenshot({ path: 'e2e-03-tab-closed.png' });
});
```

#### E2E-04: 활성 탭 닫기 후 전환

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/tab-bar.spec.ts` |
| **테스트명** | `test('활성 탭 닫기 시 인접 탭이 활성화된다')` |
| **사전조건** | 3개 탭 열림, 가운데 탭 활성 |
| **data-testid 셀렉터** | |
| - 탭 닫기 버튼 | `[data-testid="tab-close-btn-{id}"]` |
| **실행 단계** | |
| 1 | 3개 탭 열기 (대시보드, 작업지시, 생산현황) |
| 2 | 작업지시 탭 활성화 |
| 3 | 작업지시 탭 닫기 |
| 4 | 생산현황(우측) 탭이 활성화 확인 |
| **검증 포인트** | 우측 탭 우선 활성화 |
| **관련 요구사항** | BR-02 |

```typescript
test('활성 탭 닫기 시 우측 인접 탭이 활성화된다', async ({ page }) => {
  // 3개 탭 열기
  await page.click('[data-testid="menu-item-dashboard"]');
  await page.click('[data-testid="menu-item-work-order"]');
  await page.click('[data-testid="menu-item-production"]');

  // 작업지시 탭 클릭하여 활성화
  await page.click('[data-testid="tab-item-work-order"]');

  // 작업지시 탭 닫기
  await page.click('[data-testid="tab-close-btn-work-order"]');

  // 생산현황(우측) 탭이 활성화됨
  await expect(page.locator('[data-testid="tab-item-production"]')).toHaveAttribute('aria-selected', 'true');
});

test('마지막 탭 닫기 시 좌측 인접 탭이 활성화된다', async ({ page }) => {
  // 2개 탭 열기
  await page.click('[data-testid="menu-item-dashboard"]');
  await page.click('[data-testid="menu-item-work-order"]');

  // 작업지시(마지막) 탭이 활성 상태
  await expect(page.locator('[data-testid="tab-item-work-order"]')).toHaveAttribute('aria-selected', 'true');

  // 작업지시 탭 닫기
  await page.click('[data-testid="tab-close-btn-work-order"]');

  // 대시보드(좌측) 탭이 활성화됨
  await expect(page.locator('[data-testid="tab-item-dashboard"]')).toHaveAttribute('aria-selected', 'true');
});
```

#### E2E-05: 탭 오버플로우 스크롤

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/tab-bar.spec.ts` |
| **테스트명** | `test('탭 오버플로우 시 스크롤 버튼으로 이동한다')` |
| **사전조건** | 많은 탭이 열려 오버플로우 발생 |
| **data-testid 셀렉터** | |
| - 스크롤 좌측 버튼 | `[data-testid="tab-scroll-left"]` |
| - 스크롤 우측 버튼 | `[data-testid="tab-scroll-right"]` |
| **실행 단계** | |
| 1 | 8개 이상 탭 열기 |
| 2 | 우측 스크롤 버튼 클릭 |
| 3 | 숨겨진 탭 표시 확인 |
| 4 | 좌측 스크롤 버튼 클릭 |
| 5 | 이전 탭들 표시 확인 |
| **검증 포인트** | 스크롤 동작, 버튼 표시/숨김 |
| **스크린샷** | `e2e-05-scroll-right.png`, `e2e-05-scroll-left.png` |
| **관련 요구사항** | UC-04 |

```typescript
test('탭 오버플로우 시 스크롤 버튼으로 이동한다', async ({ page }) => {
  // 많은 탭 열기 (8개)
  const menuItems = ['dashboard', 'work-order', 'production', 'equipment', 'quality', 'inventory', 'shipment', 'settings'];
  for (const item of menuItems) {
    await page.click(`[data-testid="menu-item-${item}"]`);
  }

  // 우측 스크롤 버튼 표시 확인
  await expect(page.locator('[data-testid="tab-scroll-right"]')).toBeVisible();

  // 우측 스크롤 클릭
  await page.click('[data-testid="tab-scroll-right"]');
  await page.screenshot({ path: 'e2e-05-scroll-right.png' });

  // 좌측 스크롤 버튼 표시 확인
  await expect(page.locator('[data-testid="tab-scroll-left"]')).toBeVisible();

  // 좌측 스크롤 클릭
  await page.click('[data-testid="tab-scroll-left"]');
  await page.screenshot({ path: 'e2e-05-scroll-left.png' });
});
```

#### E2E-06: 드롭다운으로 탭 선택

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/tab-bar.spec.ts` |
| **테스트명** | `test('드롭다운 메뉴에서 탭을 선택할 수 있다')` |
| **사전조건** | 6개 이상 탭 열림 |
| **data-testid 셀렉터** | |
| - 드롭다운 버튼 | `[data-testid="tab-dropdown-btn"]` |
| **실행 단계** | |
| 1 | 6개 탭 열기 |
| 2 | 드롭다운 버튼 클릭 |
| 3 | 드롭다운 메뉴 항목 클릭 |
| 4 | 해당 탭 활성화 확인 |
| **검증 포인트** | 드롭다운 열림, 탭 활성화 |
| **관련 요구사항** | UC-04 |

```typescript
test('드롭다운 메뉴에서 탭을 선택할 수 있다', async ({ page }) => {
  // 6개 탭 열기
  const menuItems = ['dashboard', 'work-order', 'production', 'equipment', 'quality', 'inventory'];
  for (const item of menuItems) {
    await page.click(`[data-testid="menu-item-${item}"]`);
  }

  // 드롭다운 버튼 표시 확인
  await expect(page.locator('[data-testid="tab-dropdown-btn"]')).toBeVisible();

  // 드롭다운 열기
  await page.click('[data-testid="tab-dropdown-btn"]');

  // 드롭다운 메뉴 표시 확인
  await expect(page.locator('.ant-dropdown')).toBeVisible();

  // 대시보드 항목 클릭
  await page.click('.ant-dropdown >> text=대시보드');

  // 대시보드 탭 활성화 확인
  await expect(page.locator('[data-testid="tab-item-dashboard"]')).toHaveAttribute('aria-selected', 'true');
});
```

#### E2E-07: 중복 탭 열기 방지

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/tab-bar.spec.ts` |
| **테스트명** | `test('같은 메뉴 클릭 시 새 탭을 열지 않고 기존 탭으로 전환한다')` |
| **사전조건** | 1개 탭 열림 |
| **data-testid 셀렉터** | |
| - 메뉴 항목 | `[data-testid="menu-item-{id}"]` |
| **실행 단계** | |
| 1 | 대시보드 탭 열기 |
| 2 | 작업지시 탭 열기 |
| 3 | 대시보드 메뉴 다시 클릭 |
| 4 | 탭 개수 변경 없음 확인 |
| 5 | 대시보드 탭 활성화 확인 |
| **검증 포인트** | 탭 개수 유지, 기존 탭 활성화 |
| **관련 요구사항** | BR-03 |

```typescript
test('같은 메뉴 클릭 시 새 탭을 열지 않고 기존 탭으로 전환한다', async ({ page }) => {
  // 2개 탭 열기
  await page.click('[data-testid="menu-item-dashboard"]');
  await page.click('[data-testid="menu-item-work-order"]');

  // 탭 2개 확인
  await expect(page.locator('[data-testid^="tab-item-"]')).toHaveCount(2);

  // 대시보드 메뉴 다시 클릭
  await page.click('[data-testid="menu-item-dashboard"]');

  // 탭 개수 변경 없음
  await expect(page.locator('[data-testid^="tab-item-"]')).toHaveCount(2);

  // 대시보드 탭 활성화 확인
  await expect(page.locator('[data-testid="tab-item-dashboard"]')).toHaveAttribute('aria-selected', 'true');
});
```

#### E2E-08: 최대 탭 제한

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/tab-bar.spec.ts` |
| **테스트명** | `test('11번째 탭 열기 시 알림을 표시하고 열지 않는다')` |
| **사전조건** | 10개 탭 열림 |
| **data-testid 셀렉터** | |
| - 알림 메시지 | `.ant-message` |
| **실행 단계** | |
| 1 | 10개 탭 열기 |
| 2 | 11번째 메뉴 클릭 |
| 3 | 알림 메시지 표시 확인 |
| 4 | 탭 개수 10개 유지 확인 |
| **검증 포인트** | 알림 표시, 탭 개수 제한 |
| **스크린샷** | `e2e-08-max-tab-alert.png` |
| **관련 요구사항** | BR-04 |

```typescript
test('11번째 탭 열기 시 알림을 표시하고 열지 않는다', async ({ page }) => {
  // 10개 탭 열기
  const menuItems = ['dashboard', 'work-order', 'production', 'equipment', 'quality', 'inventory', 'shipment', 'settings', 'users', 'reports'];
  for (const item of menuItems) {
    await page.click(`[data-testid="menu-item-${item}"]`);
  }

  // 탭 10개 확인
  await expect(page.locator('[data-testid^="tab-item-"]')).toHaveCount(10);

  // 11번째 메뉴 클릭
  await page.click('[data-testid="menu-item-logs"]');

  // 알림 메시지 확인
  await expect(page.locator('.ant-message')).toContainText('최대 10개');
  await page.screenshot({ path: 'e2e-08-max-tab-alert.png' });

  // 탭 개수 10개 유지
  await expect(page.locator('[data-testid^="tab-item-"]')).toHaveCount(10);
});
```

#### E2E-09: 반응형 탭 바

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/tab-bar.spec.ts` |
| **테스트명** | `test('뷰포트 크기에 따라 탭 바가 적응한다')` |
| **사전조건** | 탭 열림 |
| **data-testid 셀렉터** | |
| - 탭 바 | `[data-testid="tab-bar"]` |
| **실행 단계** | |
| 1 | 데스크톱 뷰포트 (1280px) 확인 |
| 2 | 태블릿 뷰포트 (768px) 확인 |
| 3 | 모바일 뷰포트 (375px) 확인 |
| **검증 포인트** | 각 뷰포트에서 적절한 레이아웃 |
| **스크린샷** | `e2e-09-desktop.png`, `e2e-09-tablet.png`, `e2e-09-mobile.png` |
| **관련 요구사항** | 5.4 |

```typescript
test('뷰포트 크기에 따라 탭 바가 적응한다', async ({ page }) => {
  // 탭 열기
  await page.click('[data-testid="menu-item-dashboard"]');
  await page.click('[data-testid="menu-item-work-order"]');

  // 데스크톱 뷰포트
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator('[data-testid="tab-bar"]')).toBeVisible();
  await page.screenshot({ path: 'e2e-09-desktop.png' });

  // 태블릿 뷰포트
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.locator('[data-testid="tab-bar"]')).toBeVisible();
  await page.screenshot({ path: 'e2e-09-tablet.png' });

  // 모바일 뷰포트
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('[data-testid="tab-bar"]')).toBeVisible();
  // 모바일에서는 드롭다운 형태일 수 있음
  await page.screenshot({ path: 'e2e-09-mobile.png' });
});
```

#### E2E-10: 키보드 탭 전환

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/tab-bar.spec.ts` |
| **테스트명** | `test('Ctrl+Tab으로 다음 탭으로 전환한다')` |
| **사전조건** | 2개 이상 탭 열림 |
| **data-testid 셀렉터** | |
| - 탭 아이템 | `[data-testid="tab-item-{id}"]` |
| **실행 단계** | |
| 1 | 2개 탭 열기 |
| 2 | Ctrl+Tab 입력 |
| 3 | 다음 탭 활성화 확인 |
| **검증 포인트** | 키보드로 탭 전환 |
| **관련 요구사항** | 6.3 |

```typescript
test('Ctrl+Tab으로 다음 탭으로 전환한다', async ({ page }) => {
  // 2개 탭 열기
  await page.click('[data-testid="menu-item-dashboard"]');
  await page.click('[data-testid="menu-item-work-order"]');

  // 대시보드 탭 클릭하여 활성화
  await page.click('[data-testid="tab-item-dashboard"]');
  await expect(page.locator('[data-testid="tab-item-dashboard"]')).toHaveAttribute('aria-selected', 'true');

  // Ctrl+Tab 입력
  await page.keyboard.press('Control+Tab');

  // 작업지시 탭으로 전환 확인
  await expect(page.locator('[data-testid="tab-item-work-order"]')).toHaveAttribute('aria-selected', 'true');
});

test('Ctrl+Shift+Tab으로 이전 탭으로 전환한다', async ({ page }) => {
  // 2개 탭 열기
  await page.click('[data-testid="menu-item-dashboard"]');
  await page.click('[data-testid="menu-item-work-order"]');

  // 작업지시 탭이 활성 상태
  await expect(page.locator('[data-testid="tab-item-work-order"]')).toHaveAttribute('aria-selected', 'true');

  // Ctrl+Shift+Tab 입력
  await page.keyboard.press('Control+Shift+Tab');

  // 대시보드 탭으로 전환 확인
  await expect(page.locator('[data-testid="tab-item-dashboard"]')).toHaveAttribute('aria-selected', 'true');
});
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-UI-001 | 탭 렌더링 | 로그인 | 메뉴 클릭하여 탭 열기 | 탭 아이콘, 제목, 닫기 버튼 표시 | High | UC-01 |
| TC-UI-002 | 활성 탭 스타일 | 2개 이상 탭 | 활성 탭 확인 | 배경색, 하단 border 강조 | High | UC-01 |
| TC-UI-003 | 탭 호버 효과 | 탭 존재 | 비활성 탭에 마우스 호버 | 배경색 변화 | Medium | - |
| TC-UI-004 | 탭 클릭 전환 | 2개 이상 탭 | 비활성 탭 클릭 | 탭 전환, 컨텐츠 변경 | High | UC-02 |
| TC-UI-005 | 닫기 버튼 동작 | 2개 이상 탭 | 닫기 버튼 클릭 | 탭 제거, 애니메이션 | High | UC-03 |
| TC-UI-006 | 스크롤 버튼 | 많은 탭 열림 | 스크롤 버튼 클릭 | 부드러운 스크롤 | Medium | UC-04 |
| TC-UI-007 | 드롭다운 메뉴 | 6개 이상 탭 | 드롭다운 클릭 | 전체 탭 목록 표시 | Medium | UC-04 |
| TC-UI-008 | 반응형 레이아웃 | 탭 존재 | 브라우저 크기 조절 | 레이아웃 적응 | Medium | 5.4 |
| TC-UI-009 | 키보드 접근성 | 탭 존재 | Tab 키로 탐색 | 포커스 이동 가시적 | Medium | 6.3 |
| TC-UI-010 | 다크 모드 | 다크 모드 활성 | 탭 바 확인 | 적절한 색상 적용 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-UI-001: 탭 렌더링

**테스트 목적**: 탭 아이템이 올바르게 렌더링되는지 확인

**테스트 단계**:
1. 포털에 로그인
2. 사이드바 메뉴에서 화면 클릭
3. 탭 바에 탭이 추가되는지 확인

**예상 결과**:
- 탭에 아이콘 표시 (설정된 경우)
- 화면명(제목) 표시
- 닫기 버튼 (X) 표시 (closable인 경우)

**검증 기준**:
- [ ] 아이콘이 올바르게 렌더링됨
- [ ] 제목이 truncate되어 표시 (긴 경우)
- [ ] 닫기 버튼이 우측에 표시됨

#### TC-UI-002: 활성 탭 스타일

**테스트 목적**: 활성 탭이 시각적으로 구분되는지 확인

**테스트 단계**:
1. 2개 이상 탭 열기
2. 활성 탭과 비활성 탭 비교

**예상 결과**:
- 활성 탭: 밝은 배경색, 하단 파란색 border
- 비활성 탭: 투명 배경

**검증 기준**:
- [ ] 활성 탭 배경색이 흰색/밝은 색
- [ ] 활성 탭 하단에 2px 파란색 border
- [ ] 비활성 탭과 명확히 구분됨

#### TC-UI-003: 탭 호버 효과

**테스트 목적**: 탭 호버 시 피드백이 표시되는지 확인

**테스트 단계**:
1. 비활성 탭 위에 마우스 올리기
2. 배경색 변화 확인
3. 마우스 벗어나면 원래 상태로 복귀

**예상 결과**:
- 호버 시 배경색이 약간 밝아짐
- 커서가 포인터로 변경

**검증 기준**:
- [ ] 호버 시 시각적 피드백
- [ ] 포인터 커서

#### TC-UI-005: 닫기 버튼 동작

**테스트 목적**: 탭 닫기가 올바르게 동작하는지 확인

**테스트 단계**:
1. 2개 이상 탭 열기
2. 닫기 버튼 클릭
3. 탭 제거 확인

**예상 결과**:
- 클릭한 탭이 목록에서 제거
- 부드러운 애니메이션 (선택적)
- 탭 클릭 이벤트와 구분됨 (탭 전환 안 됨)

**검증 기준**:
- [ ] 탭 제거됨
- [ ] 다른 탭으로 전환되지 않음 (닫기만 수행)
- [ ] 닫기 버튼 호버 시 강조 효과

#### TC-UI-008: 반응형 레이아웃

**테스트 목적**: 화면 크기에 따라 탭 바가 적절히 표시되는지 확인

**테스트 단계**:
1. 데스크톱 크기 (1024px+)에서 확인
2. 태블릿 크기 (768-1023px)로 축소
3. 모바일 크기 (767px-)로 축소

**예상 결과**:
- 데스크톱: 탭 전체 표시 또는 스크롤
- 태블릿: 탭 축소 표시 (아이콘 위주)
- 모바일: 드롭다운 셀렉트 형태

**검증 기준**:
- [ ] 데스크톱: 탭 제목 전체 표시
- [ ] 태블릿: 탭 너비 축소
- [ ] 모바일: 드롭다운으로 전환 또는 스크롤

#### TC-UI-009: 키보드 접근성

**테스트 목적**: 키보드만으로 탭 조작이 가능한지 확인

**테스트 단계**:
1. Tab 키로 탭 바에 포커스 이동
2. 좌우 화살표로 탭 간 이동
3. Enter/Space로 탭 활성화
4. Ctrl+W로 탭 닫기

**예상 결과**:
- 포커스 표시 가시적
- 화살표 키로 탭 포커스 이동
- Enter 키로 활성화

**검증 기준**:
- [ ] 포커스 아웃라인 표시
- [ ] 키보드 탐색 가능
- [ ] 키보드 단축키 동작

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-TAB-01 | 대시보드 탭 | `{ id: 'dashboard', title: '대시보드', path: '/dashboard', icon: <DashboardOutlined />, closable: true }` |
| MOCK-TAB-02 | 작업지시 탭 | `{ id: 'work-order', title: '작업지시', path: '/work-order', icon: <FileOutlined />, closable: true }` |
| MOCK-TAB-03 | 생산현황 탭 | `{ id: 'production', title: '생산현황', path: '/production', icon: <BarChartOutlined />, closable: true }` |
| MOCK-TAB-HOME | 홈 탭 (닫기 불가) | `{ id: 'home', title: '홈', path: '/', icon: <HomeOutlined />, closable: false }` |
| MOCK-TABS-EMPTY | 빈 탭 목록 | `[]` |
| MOCK-TABS-SINGLE | 단일 탭 | `[MOCK-TAB-01]` |
| MOCK-TABS-MULTI | 다중 탭 | `[MOCK-TAB-01, MOCK-TAB-02, MOCK-TAB-03]` |
| MOCK-TABS-OVERFLOW | 오버플로우용 탭 | `Array(10).fill(MOCK-TAB-01).map((t, i) => ({...t, id: 'tab-'+i}))` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-BASE | 기본 E2E 환경 | 자동 시드 | 테스트 사용자, 샘플 메뉴 |
| SEED-E2E-TABS | 다중 탭 환경 | 자동 시드 | 3개 화면 탭 열린 상태 |
| SEED-E2E-OVERFLOW | 오버플로우 환경 | 자동 시드 | 8개 탭 열린 상태 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 기능 테스트 |
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 기능 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의
> 네이밍 규칙: `tab-{component}-{variant/id}`

### 6.1 TabBar 컴포넌트 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `tab-bar` | TabBar 컨테이너 | 전체 탭 바 영역 확인 |
| `tab-bar-container` | 탭 스크롤 컨테이너 | 스크롤 동작 테스트 |
| `tab-scroll-left` | 좌측 스크롤 버튼 | 좌측 스크롤 동작 |
| `tab-scroll-right` | 우측 스크롤 버튼 | 우측 스크롤 동작 |
| `tab-dropdown-btn` | 드롭다운 버튼 | 전체 탭 목록 표시 |

### 6.2 TabItem 컴포넌트 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `tab-item-{id}` | 개별 탭 아이템 | 탭 클릭, 상태 확인 |
| `tab-icon-{id}` | 탭 아이콘 | 아이콘 렌더링 확인 |
| `tab-title-{id}` | 탭 제목 | 제목 표시 확인 |
| `tab-close-btn-{id}` | 탭 닫기 버튼 | 탭 닫기 동작 |

### 6.3 연관 컴포넌트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `mdi-content` | MDI 컨텐츠 영역 | 화면 컨텐츠 확인 |
| `menu-item-{id}` | 사이드바 메뉴 항목 | 탭 열기 트리거 |

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
| TabBar.tsx | UT-001, UT-002, UT-006~012, UT-BR-01~04, UT-A11Y-02 | E2E-01~10 |
| TabItem.tsx | UT-003~005, UT-A11Y-01 | E2E-02, E2E-03 |

---

## 관련 문서

- 설계 문서: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |
