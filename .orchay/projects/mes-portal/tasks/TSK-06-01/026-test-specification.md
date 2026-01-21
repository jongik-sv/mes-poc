# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 - **Last Updated:** 2026-01-21

> **목적**: 목록(조회) 화면 템플릿의 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-01 |
| Task명 | 목록(조회) 화면 템플릿 |
| 상세설계 참조 | `010-design.md` |
| PRD 참조 | `prd.md` 4.1.1 화면 템플릿 - 목록(조회) 화면 |
| 작성일 | 2026-01-21 |
| 작성자 | Claude (Quality Engineer) |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | ListTemplate 컴포넌트, 검색/초기화 핸들러, 액션 버튼 핸들러 | 80% 이상 |
| E2E 테스트 | 목록 화면 접근, 검색 필터링, 초기화, 신규/삭제 액션 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 반응형 레이아웃, 접근성 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| 컴포넌트 라이브러리 | Ant Design |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |
| 반응형 테스트 뷰포트 | Desktop(1280px), Tablet(768px), Mobile(375px) |

### 1.3 테스트 우선순위

| 우선순위 | 설명 | 대상 테스트 |
|---------|------|------------|
| P0 (Critical) | 핵심 기능, 반드시 통과해야 함 | UT-001, UT-003, E2E-001, E2E-002 |
| P1 (High) | 중요 기능, 릴리즈 전 해결 필요 | UT-002, UT-004, UT-005, E2E-003, E2E-004, E2E-005 |
| P2 (Medium) | 일반 기능, 다음 릴리즈에서 해결 가능 | TC-001, TC-002, TC-003 |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 우선순위 |
|-----------|------|----------|----------|----------|
| UT-001 | ListTemplate 컴포넌트 | 정상 렌더링 | 검색 영역, 그리드 영역, 버튼 영역 표시 | P0 |
| UT-002 | 검색 조건 변경 핸들러 | 조건 입력 시 상태 변경 | 검색 조건 객체 업데이트 | P1 |
| UT-003 | 검색 실행 함수 | 검색 버튼 클릭 | onSearch 콜백 호출, 검색 조건 전달 | P0 |
| UT-004 | 검색 조건 초기화 함수 | 초기화 버튼 클릭 | onReset 콜백 호출, 조건 기본값 복원 | P1 |
| UT-005 | 액션 버튼 클릭 핸들러 | 신규/삭제 버튼 클릭 | 해당 콜백 함수 호출 | P1 |

### 2.2 테스트 케이스 상세

#### UT-001: ListTemplate 컴포넌트 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/ListTemplate.spec.tsx` |
| **테스트 블록** | `describe('ListTemplate') -> describe('렌더링') -> it('모든 영역이 정상적으로 렌더링된다')` |
| **Mock 의존성** | - |
| **입력 데이터** | 기본 props (columns, dataSource, rowKey) |
| **검증 포인트** | |
| - | 검색 조건 Card 영역 렌더링 확인 |
| - | 그리드(DataTable) 영역 렌더링 확인 |
| - | 검색/초기화 버튼 렌더링 확인 |
| - | 신규/삭제 액션 버튼 렌더링 확인 (props 전달 시) |
| **커버리지 대상** | ListTemplate 컴포넌트 메인 렌더링 분기 |

```typescript
// 테스트 코드 예시
describe('ListTemplate', () => {
  describe('렌더링', () => {
    it('모든 영역이 정상적으로 렌더링된다', () => {
      const columns = [
        { title: '이름', dataIndex: 'name', key: 'name' },
        { title: '상태', dataIndex: 'status', key: 'status' },
      ];
      const dataSource = [
        { id: '1', name: '테스트1', status: 'ACTIVE' },
      ];

      render(
        <ListTemplate
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          searchForm={<div data-testid="search-form">검색 폼</div>}
          onSearch={vi.fn()}
          onReset={vi.fn()}
          onAdd={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByTestId('list-template-container')).toBeInTheDocument();
      expect(screen.getByTestId('search-condition-card')).toBeInTheDocument();
      expect(screen.getByTestId('data-grid')).toBeInTheDocument();
      expect(screen.getByTestId('search-btn')).toBeInTheDocument();
      expect(screen.getByTestId('reset-btn')).toBeInTheDocument();
      expect(screen.getByTestId('add-btn')).toBeInTheDocument();
      expect(screen.getByTestId('delete-btn')).toBeInTheDocument();
    });

    it('searchForm이 없으면 검색 영역이 숨겨진다', () => {
      render(
        <ListTemplate
          columns={[]}
          dataSource={[]}
          rowKey="id"
        />
      );

      expect(screen.queryByTestId('search-condition-card')).not.toBeInTheDocument();
    });

    it('onAdd가 없으면 신규 버튼이 숨겨진다', () => {
      render(
        <ListTemplate
          columns={[]}
          dataSource={[]}
          rowKey="id"
        />
      );

      expect(screen.queryByTestId('add-btn')).not.toBeInTheDocument();
    });

    it('onDelete가 없으면 삭제 버튼이 숨겨진다', () => {
      render(
        <ListTemplate
          columns={[]}
          dataSource={[]}
          rowKey="id"
        />
      );

      expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument();
    });
  });
});
```

#### UT-002: 검색 조건 변경 핸들러

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/ListTemplate.spec.tsx` |
| **테스트 블록** | `describe('ListTemplate') -> describe('검색 조건') -> it('검색 조건 변경 시 상태가 업데이트된다')` |
| **Mock 의존성** | - |
| **입력 데이터** | searchForm 내 입력 필드 |
| **검증 포인트** | |
| - | 입력 필드 값 변경 시 내부 상태 반영 확인 |
| - | 여러 조건 동시 변경 시 모든 값 유지 확인 |
| **커버리지 대상** | 검색 조건 상태 관리 로직 |

```typescript
describe('검색 조건', () => {
  it('검색 조건 변경 시 상태가 업데이트된다', async () => {
    const SearchForm = ({ onChange }: { onChange: (values: any) => void }) => (
      <div>
        <input
          data-testid="name-input"
          onChange={(e) => onChange({ name: e.target.value })}
        />
        <select
          data-testid="status-select"
          onChange={(e) => onChange({ status: e.target.value })}
        >
          <option value="">전체</option>
          <option value="ACTIVE">활성</option>
          <option value="INACTIVE">비활성</option>
        </select>
      </div>
    );

    const onSearch = vi.fn();

    render(
      <ListTemplate
        columns={[]}
        dataSource={[]}
        rowKey="id"
        searchForm={<SearchForm onChange={() => {}} />}
        onSearch={onSearch}
      />
    );

    await userEvent.type(screen.getByTestId('name-input'), '테스트');
    await userEvent.selectOptions(screen.getByTestId('status-select'), 'ACTIVE');
    await userEvent.click(screen.getByTestId('search-btn'));

    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '테스트',
        status: 'ACTIVE',
      })
    );
  });
});
```

#### UT-003: 검색 실행 함수

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/ListTemplate.spec.tsx` |
| **테스트 블록** | `describe('ListTemplate') -> describe('검색 실행') -> it('검색 버튼 클릭 시 onSearch가 호출된다')` |
| **Mock 의존성** | `onSearch` 콜백 함수 (vi.fn()) |
| **입력 데이터** | 검색 조건 객체 |
| **검증 포인트** | |
| - | onSearch 콜백 호출 확인 |
| - | 전달된 검색 조건 객체 검증 |
| - | 로딩 상태 표시 확인 |
| **커버리지 대상** | `handleSearch()` 함수 |

```typescript
describe('검색 실행', () => {
  it('검색 버튼 클릭 시 onSearch가 호출된다', async () => {
    const onSearch = vi.fn();
    const searchValues = { name: '테스트', status: 'ACTIVE' };

    render(
      <ListTemplate
        columns={[]}
        dataSource={[]}
        rowKey="id"
        searchForm={<div />}
        onSearch={onSearch}
        initialSearchValues={searchValues}
      />
    );

    await userEvent.click(screen.getByTestId('search-btn'));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith(searchValues);
  });

  it('검색 중 로딩 상태가 표시된다', async () => {
    const onSearch = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(
      <ListTemplate
        columns={[]}
        dataSource={[]}
        rowKey="id"
        searchForm={<div />}
        onSearch={onSearch}
        loading={true}
      />
    );

    expect(screen.getByTestId('search-btn')).toBeDisabled();
    expect(screen.getByTestId('data-grid')).toHaveAttribute('aria-busy', 'true');
  });

  it('Enter 키 입력 시 검색이 실행된다', async () => {
    const onSearch = vi.fn();

    render(
      <ListTemplate
        columns={[]}
        dataSource={[]}
        rowKey="id"
        searchForm={<input data-testid="search-input" />}
        onSearch={onSearch}
      />
    );

    await userEvent.type(screen.getByTestId('search-input'), '{enter}');

    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});
```

#### UT-004: 검색 조건 초기화 함수

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/ListTemplate.spec.tsx` |
| **테스트 블록** | `describe('ListTemplate') -> describe('초기화') -> it('초기화 버튼 클릭 시 조건이 기본값으로 복원된다')` |
| **Mock 의존성** | `onReset` 콜백 함수 (vi.fn()) |
| **입력 데이터** | 변경된 검색 조건 상태 |
| **검증 포인트** | |
| - | onReset 콜백 호출 확인 |
| - | 검색 조건 입력 필드 값 초기화 확인 |
| - | 초기화 후 자동 검색 실행 여부 (설정에 따라) |
| **커버리지 대상** | `handleReset()` 함수 |

```typescript
describe('초기화', () => {
  it('초기화 버튼 클릭 시 onReset이 호출된다', async () => {
    const onReset = vi.fn();

    render(
      <ListTemplate
        columns={[]}
        dataSource={[]}
        rowKey="id"
        searchForm={<div />}
        onReset={onReset}
      />
    );

    await userEvent.click(screen.getByTestId('reset-btn'));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('초기화 시 검색 조건이 기본값으로 복원된다', async () => {
    const defaultValues = { name: '', status: '' };
    const onSearch = vi.fn();
    const onReset = vi.fn();

    render(
      <ListTemplate
        columns={[]}
        dataSource={[]}
        rowKey="id"
        searchForm={<div />}
        onSearch={onSearch}
        onReset={onReset}
        initialSearchValues={{ name: '테스트', status: 'ACTIVE' }}
        defaultSearchValues={defaultValues}
      />
    );

    await userEvent.click(screen.getByTestId('reset-btn'));
    await userEvent.click(screen.getByTestId('search-btn'));

    expect(onSearch).toHaveBeenCalledWith(defaultValues);
  });
});
```

#### UT-005: 액션 버튼 클릭 핸들러

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/ListTemplate.spec.tsx` |
| **테스트 블록** | `describe('ListTemplate') -> describe('액션 버튼') -> it('신규 버튼 클릭 시 onAdd가 호출된다')` |
| **Mock 의존성** | `onAdd`, `onDelete` 콜백 함수 (vi.fn()) |
| **입력 데이터** | 선택된 행 데이터 (삭제 시) |
| **검증 포인트** | |
| - | onAdd 콜백 호출 확인 |
| - | onDelete 콜백 호출 시 선택된 행 전달 확인 |
| - | 선택된 행 없을 때 삭제 버튼 비활성화 확인 |
| **커버리지 대상** | `handleAdd()`, `handleDelete()` 함수 |

```typescript
describe('액션 버튼', () => {
  it('신규 버튼 클릭 시 onAdd가 호출된다', async () => {
    const onAdd = vi.fn();

    render(
      <ListTemplate
        columns={[]}
        dataSource={[]}
        rowKey="id"
        onAdd={onAdd}
      />
    );

    await userEvent.click(screen.getByTestId('add-btn'));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('삭제 버튼 클릭 시 onDelete가 선택된 행과 함께 호출된다', async () => {
    const onDelete = vi.fn();
    const dataSource = [
      { id: '1', name: '테스트1' },
      { id: '2', name: '테스트2' },
    ];

    render(
      <ListTemplate
        columns={[{ title: '이름', dataIndex: 'name', key: 'name' }]}
        dataSource={dataSource}
        rowKey="id"
        onDelete={onDelete}
        rowSelection={{ type: 'checkbox' }}
      />
    );

    // 첫 번째 행 선택
    await userEvent.click(screen.getAllByRole('checkbox')[1]); // 0번은 전체 선택
    await userEvent.click(screen.getByTestId('delete-btn'));

    expect(onDelete).toHaveBeenCalledWith([dataSource[0]]);
  });

  it('선택된 행이 없으면 삭제 버튼이 비활성화된다', () => {
    const onDelete = vi.fn();

    render(
      <ListTemplate
        columns={[]}
        dataSource={[{ id: '1', name: '테스트' }]}
        rowKey="id"
        onDelete={onDelete}
        rowSelection={{ type: 'checkbox' }}
      />
    );

    expect(screen.getByTestId('delete-btn')).toBeDisabled();
  });

  it('삭제 시 확인 다이얼로그가 표시된다', async () => {
    const onDelete = vi.fn();
    const dataSource = [{ id: '1', name: '테스트1' }];

    render(
      <ListTemplate
        columns={[{ title: '이름', dataIndex: 'name', key: 'name' }]}
        dataSource={dataSource}
        rowKey="id"
        onDelete={onDelete}
        rowSelection={{ type: 'checkbox' }}
        confirmDelete={true}
      />
    );

    await userEvent.click(screen.getAllByRole('checkbox')[1]);
    await userEvent.click(screen.getByTestId('delete-btn'));

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    expect(screen.getByText(/삭제하시겠습니까/)).toBeInTheDocument();
  });
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 우선순위 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 목록 화면 접근 및 조회 | 로그인 상태 | 1. 메뉴에서 목록 화면 클릭 | 목록 데이터 표시 | P0 |
| E2E-002 | 검색 조건 입력 후 필터링 | 목록 화면 진입 | 1. 조건 입력 2. 검색 클릭 | 필터링된 결과 표시 | P0 |
| E2E-003 | 검색 조건 초기화 | 검색 조건 입력됨 | 1. 초기화 클릭 | 조건 초기화, 전체 조회 | P1 |
| E2E-004 | 신규 버튼 클릭 | 목록 화면 진입 | 1. 신규 버튼 클릭 | 등록 화면/모달 열림 | P1 |
| E2E-005 | 행 선택 후 삭제 | 목록 데이터 존재 | 1. 행 선택 2. 삭제 클릭 3. 확인 | 선택 행 삭제됨 | P1 |

### 3.2 테스트 케이스 상세

#### E2E-001: 목록 화면 접근 및 조회

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/list-template.spec.ts` |
| **테스트명** | `test('사용자가 목록 화면에 접근하여 데이터를 조회할 수 있다')` |
| **사전조건** | 로그인 완료 (fixture 사용), 샘플 데이터 존재 |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="list-template-container"]` |
| - 검색 조건 영역 | `[data-testid="search-condition-card"]` |
| - 그리드 영역 | `[data-testid="data-grid"]` |
| - 그리드 행 | `[data-testid="grid-row"]` |
| **실행 단계** | |
| 1 | 사이드바 메뉴에서 '사용자 목록' 클릭 |
| 2 | 페이지 로딩 완료 대기 |
| 3 | 데이터 그리드 표시 확인 |
| **검증 포인트** | |
| - | `expect(page.locator('[data-testid="list-template-container"]')).toBeVisible()` |
| - | `expect(page.locator('[data-testid="data-grid"]')).toBeVisible()` |
| - | `expect(page.locator('[data-testid="grid-row"]')).toHaveCount.greaterThan(0)` |
| **스크린샷** | `e2e-001-list-loaded.png` |

```typescript
// E2E 테스트 코드 예시
import { test, expect } from '@playwright/test';

test.describe('목록(조회) 화면 템플릿', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 fixture
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'user@test.com');
    await page.fill('[data-testid="password-input"]', 'test1234');
    await page.click('[data-testid="login-btn"]');
    await page.waitForURL('/');
  });

  test('E2E-001: 사용자가 목록 화면에 접근하여 데이터를 조회할 수 있다', async ({ page }) => {
    // 사이드바 메뉴 클릭
    await page.click('[data-testid="menu-user-list"]');

    // 페이지 로딩 대기
    await page.waitForSelector('[data-testid="list-template-container"]');

    // 검증
    await expect(page.locator('[data-testid="list-template-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-condition-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="data-grid"]')).toBeVisible();

    // 데이터 존재 확인
    const rowCount = await page.locator('[data-testid="grid-row"]').count();
    expect(rowCount).toBeGreaterThan(0);

    // 스크린샷 캡처
    await page.screenshot({ path: 'tests/screenshots/e2e-001-list-loaded.png' });
  });
});
```

#### E2E-002: 검색 조건 입력 후 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/list-template.spec.ts` |
| **테스트명** | `test('사용자가 검색 조건을 입력하여 데이터를 필터링할 수 있다')` |
| **사전조건** | 목록 화면 진입, 다양한 데이터 존재 |
| **data-testid 셀렉터** | |
| - 이름 검색 입력 | `[data-testid="search-name-input"]` |
| - 상태 선택 | `[data-testid="search-status-select"]` |
| - 검색 버튼 | `[data-testid="search-btn"]` |
| - 총 건수 표시 | `[data-testid="total-count"]` |
| **실행 단계** | |
| 1 | `await page.fill('[data-testid="search-name-input"]', '테스트')` |
| 2 | `await page.selectOption('[data-testid="search-status-select"]', 'ACTIVE')` |
| 3 | `await page.click('[data-testid="search-btn"]')` |
| 4 | `await page.waitForResponse('**/api/users*')` |
| **API 확인** | `GET /api/users?name=테스트&status=ACTIVE` -> 200 |
| **검증 포인트** | |
| - | 필터링된 결과만 표시 확인 |
| - | 총 건수 업데이트 확인 |
| - | 검색 조건 값 유지 확인 |
| **스크린샷** | `e2e-002-filtered-result.png` |

```typescript
test('E2E-002: 사용자가 검색 조건을 입력하여 데이터를 필터링할 수 있다', async ({ page }) => {
  await page.goto('/users');
  await page.waitForSelector('[data-testid="list-template-container"]');

  // 초기 건수 확인
  const initialCount = await page.locator('[data-testid="total-count"]').textContent();

  // 검색 조건 입력
  await page.fill('[data-testid="search-name-input"]', '테스트');
  await page.selectOption('[data-testid="search-status-select"]', 'ACTIVE');

  // 검색 실행 및 API 응답 대기
  const [response] = await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/users') && response.status() === 200
    ),
    page.click('[data-testid="search-btn"]'),
  ]);

  // 필터링된 결과 검증
  const filteredCount = await page.locator('[data-testid="total-count"]').textContent();
  expect(Number(filteredCount)).toBeLessThanOrEqual(Number(initialCount));

  // 결과 행에 검색 조건이 반영되었는지 확인
  const rows = page.locator('[data-testid="grid-row"]');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const name = await rows.nth(i).locator('[data-testid="cell-name"]').textContent();
    expect(name).toContain('테스트');
  }

  await page.screenshot({ path: 'tests/screenshots/e2e-002-filtered-result.png' });
});
```

#### E2E-003: 검색 조건 초기화

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/list-template.spec.ts` |
| **테스트명** | `test('사용자가 초기화 버튼으로 검색 조건을 리셋할 수 있다')` |
| **사전조건** | 검색 조건이 입력된 상태 |
| **data-testid 셀렉터** | |
| - 초기화 버튼 | `[data-testid="reset-btn"]` |
| **실행 단계** | |
| 1 | 검색 조건 입력 (E2E-002 참조) |
| 2 | `await page.click('[data-testid="reset-btn"]')` |
| 3 | API 응답 대기 |
| **API 확인** | `GET /api/users` -> 200 (조건 없이 전체 조회) |
| **검증 포인트** | |
| - | 검색 입력 필드 값 초기화 확인 |
| - | 전체 데이터 재조회 확인 |
| **스크린샷** | `e2e-003-after-reset.png` |

```typescript
test('E2E-003: 사용자가 초기화 버튼으로 검색 조건을 리셋할 수 있다', async ({ page }) => {
  await page.goto('/users');
  await page.waitForSelector('[data-testid="list-template-container"]');

  // 검색 조건 입력
  await page.fill('[data-testid="search-name-input"]', '테스트');
  await page.click('[data-testid="search-btn"]');
  await page.waitForResponse('**/api/users*');

  // 필터링된 건수 확인
  const filteredCount = await page.locator('[data-testid="total-count"]').textContent();

  // 초기화 클릭
  const [response] = await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/users') && !response.url().includes('name=')
    ),
    page.click('[data-testid="reset-btn"]'),
  ]);

  // 검색 조건 초기화 확인
  await expect(page.locator('[data-testid="search-name-input"]')).toHaveValue('');
  await expect(page.locator('[data-testid="search-status-select"]')).toHaveValue('');

  // 전체 데이터 재조회 확인
  const resetCount = await page.locator('[data-testid="total-count"]').textContent();
  expect(Number(resetCount)).toBeGreaterThanOrEqual(Number(filteredCount));

  await page.screenshot({ path: 'tests/screenshots/e2e-003-after-reset.png' });
});
```

#### E2E-004: 신규 버튼 클릭

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/list-template.spec.ts` |
| **테스트명** | `test('사용자가 신규 버튼을 클릭하여 등록 화면으로 이동할 수 있다')` |
| **사전조건** | 목록 화면 진입 |
| **data-testid 셀렉터** | |
| - 신규 버튼 | `[data-testid="add-btn"]` |
| - 등록 모달/화면 | `[data-testid="create-form"]` 또는 URL 변경 |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="add-btn"]')` |
| 2 | 화면 전환 또는 모달 표시 대기 |
| **검증 포인트** | |
| - | 등록 화면/모달 표시 확인 |
| - | 입력 필드 초기 상태 확인 |
| **스크린샷** | `e2e-004-create-form.png` |

```typescript
test('E2E-004: 사용자가 신규 버튼을 클릭하여 등록 화면으로 이동할 수 있다', async ({ page }) => {
  await page.goto('/users');
  await page.waitForSelector('[data-testid="list-template-container"]');

  // 신규 버튼 클릭
  await page.click('[data-testid="add-btn"]');

  // 등록 모달 또는 페이지 확인 (구현 방식에 따라)
  // 방법 1: 모달 방식
  await expect(page.locator('[data-testid="create-form"]')).toBeVisible();

  // 방법 2: 페이지 이동 방식
  // await expect(page).toHaveURL('/users/new');

  // 입력 필드 초기 상태 확인
  await expect(page.locator('[data-testid="form-name-input"]')).toHaveValue('');
  await expect(page.locator('[data-testid="form-email-input"]')).toHaveValue('');

  await page.screenshot({ path: 'tests/screenshots/e2e-004-create-form.png' });
});
```

#### E2E-005: 행 선택 후 삭제

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/list-template.spec.ts` |
| **테스트명** | `test('사용자가 행을 선택하고 삭제할 수 있다')` |
| **사전조건** | 목록 데이터 존재, 삭제 권한 있음 |
| **data-testid 셀렉터** | |
| - 행 체크박스 | `[data-testid="row-checkbox-{id}"]` |
| - 삭제 버튼 | `[data-testid="delete-btn"]` |
| - 확인 다이얼로그 | `[data-testid="confirm-dialog"]` |
| - 확인 버튼 | `[data-testid="confirm-ok-btn"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="row-checkbox-1"]')` |
| 2 | `await page.click('[data-testid="delete-btn"]')` |
| 3 | `await page.click('[data-testid="confirm-ok-btn"]')` |
| 4 | API 응답 대기 |
| **API 확인** | `DELETE /api/users/1` -> 200 |
| **검증 포인트** | |
| - | 확인 다이얼로그 표시 |
| - | 삭제 성공 후 목록에서 제거 |
| - | 성공 토스트 메시지 표시 |
| **스크린샷** | `e2e-005-delete-confirm.png`, `e2e-005-after-delete.png` |

```typescript
test('E2E-005: 사용자가 행을 선택하고 삭제할 수 있다', async ({ page }) => {
  await page.goto('/users');
  await page.waitForSelector('[data-testid="list-template-container"]');

  // 초기 건수 확인
  const initialCount = await page.locator('[data-testid="grid-row"]').count();

  // 첫 번째 행의 ID 저장
  const firstRowId = await page.locator('[data-testid="grid-row"]').first()
    .getAttribute('data-row-id');

  // 행 선택
  await page.click(`[data-testid="row-checkbox-${firstRowId}"]`);

  // 삭제 버튼 활성화 확인
  await expect(page.locator('[data-testid="delete-btn"]')).toBeEnabled();

  // 삭제 버튼 클릭
  await page.click('[data-testid="delete-btn"]');

  // 확인 다이얼로그 표시 확인
  await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
  await expect(page.locator('[data-testid="confirm-dialog"]')).toContainText('삭제하시겠습니까');

  await page.screenshot({ path: 'tests/screenshots/e2e-005-delete-confirm.png' });

  // 확인 버튼 클릭 및 API 응답 대기
  const [response] = await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes(`/api/users/${firstRowId}`) &&
      response.request().method() === 'DELETE' &&
      response.status() === 200
    ),
    page.click('[data-testid="confirm-ok-btn"]'),
  ]);

  // 삭제 후 목록에서 제거 확인
  await page.waitForSelector('[data-testid="list-template-container"]');
  const afterCount = await page.locator('[data-testid="grid-row"]').count();
  expect(afterCount).toBe(initialCount - 1);

  // 성공 토스트 확인
  await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();

  await page.screenshot({ path: 'tests/screenshots/e2e-005-after-delete.png' });
});
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 |
|-------|-----------|---------|-----------|----------|---------|
| TC-001 | 검색 조건 영역 UI 검증 | 로그인 | 목록 화면 접근 | 검색 조건 영역 정상 표시 | P2 |
| TC-002 | 검색/초기화 동작 검증 | 목록 화면 | 검색/초기화 실행 | 기대 동작 수행 | P2 |
| TC-003 | 반응형 레이아웃 검증 | - | 브라우저 크기 변경 | 레이아웃 적절히 변환 | P2 |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 검색 조건 영역 UI 검증

**테스트 목적**: 목록(조회) 화면 템플릿의 검색 조건 영역이 설계대로 구현되었는지 확인

**테스트 단계**:
1. 로그인 완료
2. 사이드바 메뉴에서 '사용자 목록' 클릭
3. 검색 조건 영역 확인

**검증 기준**:
- [ ] 검색 조건 영역이 Card 컴포넌트로 구현됨
- [ ] 검색 조건 필드가 가로로 배치됨 (데스크톱 기준)
- [ ] 검색 조건 필드에 라벨이 표시됨
- [ ] 필수 필드에 별표(*) 표시 (해당 시)
- [ ] 검색 버튼이 우측 하단에 위치
- [ ] 초기화 버튼이 검색 버튼 좌측에 위치
- [ ] 버튼에 적절한 아이콘 표시 (검색: 돋보기, 초기화: 새로고침)
- [ ] 검색 조건 Card 하단과 그리드 영역 사이 적절한 간격

**예상 결과**:
- 검색 조건 영역이 와이어프레임과 일치
- 시각적 일관성 유지

---

#### TC-002: 검색/초기화 동작 검증

**테스트 목적**: 검색 및 초기화 기능이 정상 동작하는지 확인

**테스트 단계**:
1. 검색 조건 입력
2. 검색 버튼 클릭
3. 결과 확인
4. 초기화 버튼 클릭
5. 상태 확인

**검증 기준**:
- [ ] 검색 버튼 클릭 시 로딩 인디케이터 표시
- [ ] 검색 완료 후 결과가 그리드에 반영
- [ ] 검색 조건에 맞는 데이터만 표시
- [ ] 총 건수가 업데이트됨
- [ ] 초기화 클릭 시 모든 검색 조건 필드가 기본값으로 복원
- [ ] 초기화 후 전체 데이터가 다시 조회됨
- [ ] 폼 내 Enter 키 입력 시 검색 실행
- [ ] 빈 검색 결과 시 Empty State 표시

**예상 결과**:
- 검색/초기화 동작이 설계 문서와 일치
- 사용자 피드백이 명확함

---

#### TC-003: 반응형 레이아웃 검증

**테스트 목적**: 다양한 화면 크기에서 레이아웃이 적절히 변환되는지 확인

**테스트 단계**:
1. 데스크톱 해상도 (1280px 이상)에서 확인
2. 태블릿 해상도 (768px~1023px)에서 확인
3. 모바일 해상도 (375px~767px)에서 확인

**검증 기준 - 데스크톱 (1280px+)**:
- [ ] 검색 조건 필드가 한 행에 여러 개 배치
- [ ] 그리드 컬럼이 모두 표시
- [ ] 사이드바와 컨텐츠 영역 동시 표시

**검증 기준 - 태블릿 (768px~1023px)**:
- [ ] 검색 조건 필드가 2열 배치
- [ ] 그리드 가로 스크롤 없이 주요 컬럼 표시
- [ ] 사이드바 축소 또는 오버레이

**검증 기준 - 모바일 (375px~767px)**:
- [ ] 검색 조건 필드가 1열 세로 배치
- [ ] 그리드 가로 스크롤 지원
- [ ] 고정 컬럼 (체크박스, 이름 등) 유지
- [ ] 터치 친화적 버튼 크기 (최소 44px)

**예상 결과**:
- 모든 해상도에서 기능이 정상 동작
- 콘텐츠가 잘리거나 겹치지 않음
- 터치/클릭 영역이 적절함

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-USER-01 | 일반 사용자 | `{ id: 'user-1', name: '홍길동', email: 'hong@test.com', status: 'ACTIVE' }` |
| MOCK-USER-02 | 비활성 사용자 | `{ id: 'user-2', name: '김철수', email: 'kim@test.com', status: 'INACTIVE' }` |
| MOCK-USER-03 | 대기 사용자 | `{ id: 'user-3', name: '이영희', email: 'lee@test.com', status: 'PENDING' }` |
| MOCK-COLUMNS | 테이블 컬럼 정의 | `[{ title: '이름', dataIndex: 'name', key: 'name' }, { title: '이메일', dataIndex: 'email', key: 'email' }, { title: '상태', dataIndex: 'status', key: 'status' }]` |
| MOCK-EMPTY-DATA | 빈 데이터 | `[]` |
| MOCK-LARGE-DATA | 대용량 데이터 (100건) | 자동 생성 |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-BASE | 기본 E2E 환경 | 자동 시드 | 사용자 10명 (ACTIVE 5, INACTIVE 3, PENDING 2) |
| SEED-E2E-EMPTY | 빈 환경 (목록 없음) | 자동 시드 | 사용자 0명 |
| SEED-E2E-SEARCH | 검색 테스트용 | 자동 시드 | '테스트' 포함 사용자 3명, 미포함 7명 |
| SEED-E2E-PAGINATION | 페이지네이션 테스트용 | 자동 시드 | 사용자 55명 (페이지당 10건) |

```typescript
// 시드 데이터 예시 (tests/fixtures/users.json)
{
  "SEED-E2E-BASE": [
    { "id": "1", "name": "홍길동", "email": "hong@test.com", "status": "ACTIVE" },
    { "id": "2", "name": "김철수", "email": "kim@test.com", "status": "ACTIVE" },
    { "id": "3", "name": "이영희", "email": "lee@test.com", "status": "INACTIVE" },
    { "id": "4", "name": "박민수", "email": "park@test.com", "status": "PENDING" },
    { "id": "5", "name": "테스트사용자", "email": "test@test.com", "status": "ACTIVE" }
  ],
  "SEED-E2E-SEARCH": [
    { "id": "1", "name": "테스트1", "email": "test1@test.com", "status": "ACTIVE" },
    { "id": "2", "name": "테스트2", "email": "test2@test.com", "status": "ACTIVE" },
    { "id": "3", "name": "테스트3", "email": "test3@test.com", "status": "INACTIVE" },
    { "id": "4", "name": "홍길동", "email": "hong@test.com", "status": "ACTIVE" },
    { "id": "5", "name": "김철수", "email": "kim@test.com", "status": "ACTIVE" }
  ]
}
```

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 기능 테스트 |
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 기능 테스트 (삭제 권한) |
| TEST-READONLY | readonly@test.com | test1234 | READONLY | 읽기 전용 테스트 (삭제 불가) |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 ListTemplate 공통 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `list-template-container` | 템플릿 최상위 컨테이너 | 페이지 로드 확인 |
| `search-condition-card` | 검색 조건 Card 영역 | 검색 영역 표시 확인 |
| `data-grid` | 데이터 그리드 영역 | 그리드 표시 확인 |
| `grid-toolbar` | 그리드 상단 툴바 | 액션 버튼 영역 |
| `total-count` | 총 건수 표시 | 데이터 건수 확인 |

### 6.2 검색 영역 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `search-form` | 검색 폼 컨테이너 | 폼 영역 |
| `search-name-input` | 이름 검색 입력 | 이름 검색 조건 입력 |
| `search-email-input` | 이메일 검색 입력 | 이메일 검색 조건 입력 |
| `search-status-select` | 상태 선택 드롭다운 | 상태 필터 선택 |
| `search-date-range` | 날짜 범위 선택 | 기간 검색 조건 |
| `search-btn` | 검색 버튼 | 검색 실행 |
| `reset-btn` | 초기화 버튼 | 조건 초기화 |

### 6.3 그리드 영역 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `grid-header` | 그리드 헤더 행 | 컬럼 정렬 |
| `grid-row` | 그리드 데이터 행 | 행 데이터 접근 |
| `grid-row-{id}` | 특정 ID의 행 | 특정 행 선택 |
| `row-checkbox-{id}` | 행 체크박스 | 행 선택 |
| `select-all-checkbox` | 전체 선택 체크박스 | 전체 행 선택 |
| `cell-{columnKey}` | 특정 컬럼 셀 | 셀 데이터 확인 |
| `sort-{columnKey}` | 컬럼 정렬 버튼 | 정렬 기능 |

### 6.4 액션 버튼 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `add-btn` | 신규 버튼 | 등록 화면 열기 |
| `delete-btn` | 삭제 버튼 | 선택 행 삭제 |
| `export-btn` | 내보내기 버튼 | 데이터 내보내기 |
| `refresh-btn` | 새로고침 버튼 | 데이터 새로고침 |

### 6.5 다이얼로그 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `confirm-dialog` | 확인 다이얼로그 | 삭제 확인 등 |
| `confirm-ok-btn` | 확인 버튼 | 다이얼로그 확인 |
| `confirm-cancel-btn` | 취소 버튼 | 다이얼로그 취소 |

### 6.6 상태 표시 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `loading-skeleton` | 로딩 스켈레톤 | 초기 로딩 상태 |
| `loading-spinner` | 로딩 스피너 | 검색 중 상태 |
| `empty-state` | 빈 상태 표시 | 데이터 없음 |
| `error-state` | 에러 상태 표시 | 조회 실패 |
| `toast-success` | 성공 토스트 | 작업 성공 알림 |
| `toast-error` | 에러 토스트 | 작업 실패 알림 |

### 6.7 페이지네이션 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `pagination` | 페이지네이션 컨테이너 | 페이지 네비게이션 |
| `page-prev` | 이전 페이지 버튼 | 이전 페이지 이동 |
| `page-next` | 다음 페이지 버튼 | 다음 페이지 이동 |
| `page-{number}` | 특정 페이지 버튼 | 해당 페이지 이동 |
| `page-size-select` | 페이지 크기 선택 | 페이지당 건수 변경 |

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
| 검색 기능 (UC-01) | 100% 커버 |
| 정렬 기능 (UC-02) | 100% 커버 |
| 페이지 이동 (UC-03) | 100% 커버 |
| 신규 등록 진입 (UC-04) | 100% 커버 |
| 선택 삭제 (UC-05) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

### 7.3 브라우저 호환성 테스트

| 브라우저 | 버전 | 테스트 범위 |
|---------|------|------------|
| Chrome | 최신 2개 버전 | E2E 전체 |
| Firefox | 최신 2개 버전 | E2E 주요 시나리오 |
| Safari | 최신 2개 버전 | E2E 주요 시나리오 |
| Edge | 최신 2개 버전 | E2E 주요 시나리오 |

---

## 8. 테스트 실행 가이드

### 8.1 단위 테스트 실행

```bash
# 전체 단위 테스트 실행
npm run test

# ListTemplate 관련 테스트만 실행
npm run test -- --grep "ListTemplate"

# 커버리지 포함 실행
npm run test:coverage

# 워치 모드
npm run test:watch
```

### 8.2 E2E 테스트 실행

```bash
# 전체 E2E 테스트 실행
npm run test:e2e

# 특정 테스트 파일 실행
npx playwright test tests/e2e/list-template.spec.ts

# 헤드리스 모드 비활성화 (디버깅용)
npx playwright test --headed

# 특정 브라우저에서 실행
npx playwright test --project=chromium

# 테스트 리포트 생성
npx playwright show-report
```

### 8.3 시드 데이터 설정

```bash
# E2E 테스트 전 시드 데이터 초기화
npm run seed:test

# 특정 시드 데이터 로드
npm run seed:test -- --fixture=SEED-E2E-SEARCH
```

---

## 관련 문서

- 상세설계: `010-design.md`
- PRD: `.orchay/projects/mes-portal/prd.md`
- TRD: `.orchay/projects/mes-portal/trd.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | Claude (Quality Engineer) | 최초 작성 |

---

<!--
author: Claude (Quality Engineer)
Template Version History:
- v1.0.0 (2026-01-21): 신규 생성
  - 단위 테스트 시나리오 5건 (UT-001 ~ UT-005)
  - E2E 테스트 시나리오 5건 (E2E-001 ~ E2E-005)
  - 매뉴얼 테스트 케이스 3건 (TC-001 ~ TC-003)
  - 테스트 데이터(Fixture) 정의
  - data-testid 목록 포함
-->
