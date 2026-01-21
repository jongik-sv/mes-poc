# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 -- **Last Updated:** 2026-01-21

> **목적**: MasterDetailTemplate 컴포넌트의 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-04 |
| Task명 | 마스터-디테일 화면 템플릿 |
| 설계 참조 | `010-design.md` |
| 작성일 | 2026-01-21 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | MasterDetailTemplate 컴포넌트, Props 처리, 콜백 함수 | 80% 이상 |
| E2E 테스트 | 마스터 선택 연동, 패널 리사이즈, 검색 기능 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | 반응형, 접근성, 키보드 탐색 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |
| 분할 패널 라이브러리 | Ant Design Splitter 또는 react-split-pane |

### 1.3 테스트 우선순위

| 우선순위 | 영역 | 근거 |
|---------|------|------|
| P1 (Critical) | 마스터 선택 연동, 디테일 렌더링 | 핵심 기능 |
| P2 (High) | 패널 리사이즈, 최소 너비 제한 | 사용성 |
| P3 (Medium) | 검색 기능, 로딩 상태 | 부가 기능 |
| P4 (Low) | 접근성, 키보드 탐색 | 품질 향상 |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 우선순위 |
|-----------|------|----------|----------|----------|
| UT-001 | MasterDetailTemplate | 기본 렌더링 | 마스터/디테일 영역 표시 | P1 |
| UT-002 | MasterDetailTemplate | masterContent 렌더링 | 전달된 컨텐츠 표시 | P1 |
| UT-003 | MasterDetailTemplate | detailContent 렌더링 | 전달된 컨텐츠 표시 | P1 |
| UT-004 | MasterDetailTemplate | masterTitle 표시 | 타이틀 텍스트 렌더링 | P3 |
| UT-005 | MasterDetailTemplate | detailTitle 표시 | 타이틀 텍스트 렌더링 | P3 |
| UT-006 | MasterDetailTemplate | onMasterSelect 콜백 | 콜백 함수 호출 확인 | P1 |
| UT-007 | MasterDetailTemplate | selectedMaster 상태 | 선택 항목 하이라이트 | P1 |
| UT-008 | MasterDetailTemplate | detailLoading=true | 로딩 스켈레톤 표시 | P2 |
| UT-009 | MasterDetailTemplate | defaultSplit 적용 | 초기 분할 비율 설정 | P2 |
| UT-010 | MasterDetailTemplate | minMasterWidth 적용 | 최소 너비 제한 동작 | P2 |
| UT-011 | MasterDetailTemplate | minDetailWidth 적용 | 최소 너비 제한 동작 | P2 |
| UT-012 | MasterDetailTemplate | masterSearchable=true | 검색 입력 필드 표시 | P3 |
| UT-013 | MasterDetailTemplate | onMasterSearch 콜백 | 검색 콜백 호출 확인 | P3 |
| UT-014 | MasterDetailTemplate | 마스터 미선택 상태 | 안내 메시지 표시 | P2 |
| UT-015 | MasterDetailTemplate | 제네릭 타입 동작 | M, D 타입 정상 처리 | P1 |

### 2.2 테스트 케이스 상세

#### UT-001: 기본 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/MasterDetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('MasterDetailTemplate') -> describe('렌더링') -> it('마스터와 디테일 영역이 렌더링되어야 한다')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ masterContent: <div>Master</div>, detailContent: <div>Detail</div> }` |
| **검증 포인트** | 마스터 영역, 디테일 영역, 분할 바 존재 확인 |
| **커버리지 대상** | 컴포넌트 기본 렌더링 로직 |

```typescript
it('마스터와 디테일 영역이 렌더링되어야 한다', () => {
  render(
    <MasterDetailTemplate
      masterContent={<div data-testid="master">Master List</div>}
      detailContent={<div data-testid="detail">Detail View</div>}
    />
  )

  expect(screen.getByTestId('master-detail-template')).toBeInTheDocument()
  expect(screen.getByTestId('master-panel')).toBeInTheDocument()
  expect(screen.getByTestId('detail-panel')).toBeInTheDocument()
  expect(screen.getByTestId('split-handle')).toBeInTheDocument()
})
```

#### UT-002: masterContent 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/MasterDetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('MasterDetailTemplate') -> describe('렌더링') -> it('masterContent가 마스터 영역에 렌더링되어야 한다')` |
| **입력 데이터** | `{ masterContent: <ul><li>Item 1</li><li>Item 2</li></ul>, detailContent: <div /> }` |
| **검증 포인트** | masterContent 내용이 마스터 패널 내에 존재 |

```typescript
it('masterContent가 마스터 영역에 렌더링되어야 한다', () => {
  render(
    <MasterDetailTemplate
      masterContent={
        <ul data-testid="master-list">
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      }
      detailContent={<div />}
    />
  )

  const masterPanel = screen.getByTestId('master-panel')
  expect(within(masterPanel).getByTestId('master-list')).toBeInTheDocument()
  expect(within(masterPanel).getByText('Item 1')).toBeInTheDocument()
  expect(within(masterPanel).getByText('Item 2')).toBeInTheDocument()
})
```

#### UT-006: onMasterSelect 콜백

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/MasterDetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('MasterDetailTemplate') -> describe('콜백') -> it('마스터 항목 선택 시 onMasterSelect가 호출되어야 한다')` |
| **Mock 의존성** | `vi.fn()` |
| **입력 데이터** | `{ onMasterSelect: mockFn, masterContent: <TestList />, detailContent: <div /> }` |
| **검증 포인트** | 콜백 함수 호출, 선택된 항목 데이터 전달 |

```typescript
it('마스터 항목 선택 시 onMasterSelect가 호출되어야 한다', async () => {
  const mockOnSelect = vi.fn()
  const testItem = { id: '1', name: 'Category 1' }

  render(
    <MasterDetailTemplate
      masterContent={
        <div
          data-testid="master-item"
          onClick={() => mockOnSelect(testItem)}
        >
          {testItem.name}
        </div>
      }
      detailContent={<div />}
      onMasterSelect={mockOnSelect}
    />
  )

  await userEvent.click(screen.getByTestId('master-item'))

  expect(mockOnSelect).toHaveBeenCalledTimes(1)
  expect(mockOnSelect).toHaveBeenCalledWith(testItem)
})
```

#### UT-008: detailLoading 상태

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/MasterDetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('MasterDetailTemplate') -> describe('로딩 상태') -> it('detailLoading이 true일 때 스켈레톤이 표시되어야 한다')` |
| **입력 데이터** | `{ detailLoading: true, masterContent: <div />, detailContent: <div /> }` |
| **검증 포인트** | 로딩 스켈레톤 또는 스피너 표시 |

```typescript
it('detailLoading이 true일 때 스켈레톤이 표시되어야 한다', () => {
  render(
    <MasterDetailTemplate
      masterContent={<div>Master</div>}
      detailContent={<div data-testid="detail-content">Detail</div>}
      detailLoading={true}
    />
  )

  expect(screen.getByTestId('detail-loading')).toBeInTheDocument()
  expect(screen.queryByTestId('detail-content')).not.toBeInTheDocument()
})
```

#### UT-012: masterSearchable 검색 필드

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/MasterDetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('MasterDetailTemplate') -> describe('검색 기능') -> it('masterSearchable이 true일 때 검색 입력이 표시되어야 한다')` |
| **입력 데이터** | `{ masterSearchable: true, masterContent: <div />, detailContent: <div /> }` |
| **검증 포인트** | 검색 입력 필드 존재 |

```typescript
it('masterSearchable이 true일 때 검색 입력이 표시되어야 한다', () => {
  render(
    <MasterDetailTemplate
      masterContent={<div>Master</div>}
      detailContent={<div>Detail</div>}
      masterSearchable={true}
    />
  )

  expect(screen.getByTestId('master-search-input')).toBeInTheDocument()
  expect(screen.getByPlaceholderText('검색...')).toBeInTheDocument()
})
```

#### UT-013: onMasterSearch 콜백

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/MasterDetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('MasterDetailTemplate') -> describe('검색 기능') -> it('검색어 입력 시 onMasterSearch가 호출되어야 한다')` |
| **Mock 의존성** | `vi.fn()` |
| **입력 데이터** | `{ masterSearchable: true, onMasterSearch: mockFn }` |
| **검증 포인트** | 디바운스된 콜백 호출, 검색어 전달 |

```typescript
it('검색어 입력 시 onMasterSearch가 호출되어야 한다', async () => {
  const mockSearch = vi.fn()

  render(
    <MasterDetailTemplate
      masterContent={<div>Master</div>}
      detailContent={<div>Detail</div>}
      masterSearchable={true}
      onMasterSearch={mockSearch}
    />
  )

  const searchInput = screen.getByTestId('master-search-input')
  await userEvent.type(searchInput, '검색어')

  // 디바운스 대기
  await waitFor(() => {
    expect(mockSearch).toHaveBeenCalledWith('검색어')
  }, { timeout: 500 })
})
```

#### UT-014: 마스터 미선택 안내

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/MasterDetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('MasterDetailTemplate') -> describe('상태') -> it('마스터 미선택 시 안내 메시지가 표시되어야 한다')` |
| **입력 데이터** | `{ selectedMaster: undefined, masterContent: <div />, detailContent: <div /> }` |
| **검증 포인트** | "항목을 선택하세요" 안내 메시지 표시 |

```typescript
it('마스터 미선택 시 안내 메시지가 표시되어야 한다', () => {
  render(
    <MasterDetailTemplate
      masterContent={<div>Master</div>}
      detailContent={<div data-testid="detail-content">Detail</div>}
      selectedMaster={undefined}
    />
  )

  expect(screen.getByTestId('detail-placeholder')).toBeInTheDocument()
  expect(screen.getByText('항목을 선택하세요')).toBeInTheDocument()
  expect(screen.queryByTestId('detail-content')).not.toBeInTheDocument()
})
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 우선순위 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 마스터 선택시 디테일 로딩 | 페이지 로드 완료 | 1. 마스터 항목 클릭 | 디테일 영역 갱신 | P1 |
| E2E-002 | 패널 리사이즈 | 페이지 로드 완료 | 1. 분할 바 드래그 | 패널 크기 변경 | P2 |
| E2E-003 | 최소 너비 제한 | 페이지 로드 완료 | 1. 분할 바를 끝까지 드래그 | 최소 너비 유지 | P2 |
| E2E-004 | 마스터 검색 필터링 | 마스터 목록 존재 | 1. 검색어 입력 | 필터링된 결과 표시 | P3 |
| E2E-005 | 디테일 로딩 상태 | 마스터 선택 | 1. API 응답 지연 | 로딩 인디케이터 표시 | P2 |
| E2E-006 | 마스터 전환 | 디테일 표시 중 | 1. 다른 마스터 클릭 | 새 디테일 로딩 | P1 |

### 3.2 테스트 케이스 상세

#### E2E-001: 마스터 선택시 디테일 로딩

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/master-detail-template.spec.ts` |
| **테스트명** | `test('마스터 항목 선택 시 해당 디테일이 로딩된다')` |
| **사전조건** | 마스터-디테일 데모 페이지 로드 |
| **data-testid 셀렉터** | |
| - 템플릿 컨테이너 | `[data-testid="master-detail-template"]` |
| - 마스터 항목 | `[data-testid="master-item"]` |
| - 디테일 영역 | `[data-testid="detail-panel"]` |
| - 디테일 컨텐츠 | `[data-testid="detail-content"]` |
| **실행 단계** | |
| 1 | `await page.goto('/demo/master-detail')` |
| 2 | `await page.click('[data-testid="master-item"]:first-child')` |
| 3 | `await page.waitForSelector('[data-testid="detail-content"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="detail-content"]')).toBeVisible()` |
| **스크린샷** | `e2e-001-master-select.png` |

```typescript
test('마스터 항목 선택 시 해당 디테일이 로딩된다', async ({ page }) => {
  await page.goto('/demo/master-detail')

  // 초기 상태: 디테일 플레이스홀더 표시
  await expect(page.locator('[data-testid="detail-placeholder"]')).toBeVisible()

  // 마스터 항목 클릭
  const firstMasterItem = page.locator('[data-testid="master-item"]').first()
  const itemText = await firstMasterItem.textContent()
  await firstMasterItem.click()

  // 로딩 표시 확인
  await expect(page.locator('[data-testid="detail-loading"]')).toBeVisible()

  // 디테일 로딩 완료 대기
  await expect(page.locator('[data-testid="detail-content"]')).toBeVisible()

  // 선택된 마스터 하이라이트 확인
  await expect(firstMasterItem).toHaveClass(/selected/)

  await page.screenshot({ path: 'e2e-001-master-select.png' })
})
```

#### E2E-002: 패널 리사이즈

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/master-detail-template.spec.ts` |
| **테스트명** | `test('분할 바 드래그로 패널 크기를 조절할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 분할 핸들 | `[data-testid="split-handle"]` |
| - 마스터 패널 | `[data-testid="master-panel"]` |
| **실행 단계** | |
| 1 | `await page.goto('/demo/master-detail')` |
| 2 | 분할 핸들 드래그 |
| **검증 포인트** | 마스터 패널 너비 변경 확인 |
| **스크린샷** | `e2e-002-resize-before.png`, `e2e-002-resize-after.png` |

```typescript
test('분할 바 드래그로 패널 크기를 조절할 수 있다', async ({ page }) => {
  await page.goto('/demo/master-detail')

  const masterPanel = page.locator('[data-testid="master-panel"]')
  const splitHandle = page.locator('[data-testid="split-handle"]')

  // 초기 너비 기록
  const initialWidth = await masterPanel.evaluate(el => el.offsetWidth)
  await page.screenshot({ path: 'e2e-002-resize-before.png' })

  // 분할 바 드래그 (우측으로 100px)
  const handleBox = await splitHandle.boundingBox()
  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(handleBox!.x + 100, handleBox!.y + handleBox!.height / 2)
  await page.mouse.up()

  // 변경된 너비 확인
  const newWidth = await masterPanel.evaluate(el => el.offsetWidth)
  expect(newWidth).toBeGreaterThan(initialWidth)

  await page.screenshot({ path: 'e2e-002-resize-after.png' })
})
```

#### E2E-003: 최소 너비 제한

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/master-detail-template.spec.ts` |
| **테스트명** | `test('패널 최소 너비가 유지된다')` |
| **사전조건** | 페이지 로드 완료 |
| **실행 단계** | |
| 1 | `await page.goto('/demo/master-detail')` |
| 2 | 분할 바를 극단적으로 좌측/우측 드래그 |
| **검증 포인트** | 마스터/디테일 최소 너비 이상 유지 |

```typescript
test('패널 최소 너비가 유지된다', async ({ page }) => {
  await page.goto('/demo/master-detail')

  const masterPanel = page.locator('[data-testid="master-panel"]')
  const detailPanel = page.locator('[data-testid="detail-panel"]')
  const splitHandle = page.locator('[data-testid="split-handle"]')

  const MIN_MASTER_WIDTH = 200
  const MIN_DETAIL_WIDTH = 300

  const handleBox = await splitHandle.boundingBox()

  // 극단적으로 좌측 드래그 (마스터 최소화 시도)
  await page.mouse.move(handleBox!.x, handleBox!.y + handleBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(0, handleBox!.y + handleBox!.height / 2)
  await page.mouse.up()

  const masterWidth = await masterPanel.evaluate(el => el.offsetWidth)
  expect(masterWidth).toBeGreaterThanOrEqual(MIN_MASTER_WIDTH)

  // 극단적으로 우측 드래그 (디테일 최소화 시도)
  const newHandleBox = await splitHandle.boundingBox()
  await page.mouse.move(newHandleBox!.x, newHandleBox!.y + newHandleBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(2000, newHandleBox!.y + newHandleBox!.height / 2)
  await page.mouse.up()

  const detailWidth = await detailPanel.evaluate(el => el.offsetWidth)
  expect(detailWidth).toBeGreaterThanOrEqual(MIN_DETAIL_WIDTH)
})
```

#### E2E-004: 마스터 검색 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/master-detail-template.spec.ts` |
| **테스트명** | `test('검색어 입력 시 마스터 목록이 필터링된다')` |
| **사전조건** | masterSearchable=true |
| **data-testid 셀렉터** | |
| - 검색 입력 | `[data-testid="master-search-input"]` |
| - 마스터 항목 | `[data-testid="master-item"]` |
| **검증 포인트** | 필터링된 항목만 표시 |

```typescript
test('검색어 입력 시 마스터 목록이 필터링된다', async ({ page }) => {
  await page.goto('/demo/master-detail?searchable=true')

  const searchInput = page.locator('[data-testid="master-search-input"]')
  const masterItems = page.locator('[data-testid="master-item"]')

  // 초기 항목 수 확인
  const initialCount = await masterItems.count()
  expect(initialCount).toBeGreaterThan(0)

  // 검색어 입력
  await searchInput.fill('카테고리')

  // 디바운스 대기
  await page.waitForTimeout(300)

  // 필터링된 결과 확인
  const filteredItems = page.locator('[data-testid="master-item"]')
  const filteredCount = await filteredItems.count()

  // 모든 표시된 항목이 검색어 포함 확인
  for (let i = 0; i < filteredCount; i++) {
    const text = await filteredItems.nth(i).textContent()
    expect(text?.toLowerCase()).toContain('카테고리')
  }
})
```

#### E2E-006: 마스터 전환

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/master-detail-template.spec.ts` |
| **테스트명** | `test('다른 마스터 선택 시 디테일이 갱신된다')` |
| **사전조건** | 첫 번째 마스터 선택 상태 |
| **실행 단계** | |
| 1 | 두 번째 마스터 항목 클릭 |
| **검증 포인트** | 새 디테일 컨텐츠 로딩, 이전 선택 해제 |

```typescript
test('다른 마스터 선택 시 디테일이 갱신된다', async ({ page }) => {
  await page.goto('/demo/master-detail')

  const masterItems = page.locator('[data-testid="master-item"]')

  // 첫 번째 항목 선택
  await masterItems.first().click()
  await page.waitForSelector('[data-testid="detail-content"]')
  const firstDetailText = await page.locator('[data-testid="detail-content"]').textContent()

  // 두 번째 항목 선택
  await masterItems.nth(1).click()

  // 로딩 상태 확인
  await expect(page.locator('[data-testid="detail-loading"]')).toBeVisible()

  // 새 디테일 로딩 완료
  await expect(page.locator('[data-testid="detail-content"]')).toBeVisible()
  const secondDetailText = await page.locator('[data-testid="detail-content"]').textContent()

  // 컨텐츠 변경 확인
  expect(secondDetailText).not.toBe(firstDetailText)

  // 선택 상태 확인
  await expect(masterItems.first()).not.toHaveClass(/selected/)
  await expect(masterItems.nth(1)).toHaveClass(/selected/)
})
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 |
|-------|-----------|---------|-----------|----------|---------|
| TC-001 | 초기 레이아웃 표시 | - | 1. 페이지 접속 | 마스터/디테일 분할 표시 | High |
| TC-002 | 반응형 레이아웃 | - | 1. 브라우저 크기 조절 | 레이아웃 적응 | Medium |
| TC-003 | 키보드 탐색 | - | 1. Tab으로 탐색 | 모든 요소 접근 가능 | Medium |
| TC-004 | 스크린리더 호환성 | - | 1. 스크린리더 사용 | 영역 설명 안내 | Medium |
| TC-005 | 분할 바 시각적 피드백 | - | 1. 분할 바 호버 | 커서 변경, 하이라이트 | Low |
| TC-006 | 로딩 상태 표시 | 마스터 선택 | 1. 느린 네트워크 | 로딩 인디케이터 표시 | Medium |
| TC-007 | 빈 디테일 상태 | 마스터 미선택 | 1. 페이지 접속 | 안내 메시지 표시 | Medium |
| TC-008 | 마스터 스크롤 | 목록 많음 | 1. 마스터 영역 스크롤 | 부드러운 스크롤, 선택 유지 | Low |
| TC-009 | 분할 비율 유지 | 리사이즈 후 | 1. 페이지 새로고침 | 비율 유지 (옵션) | Low |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 초기 레이아웃 표시

**테스트 목적**: 마스터-디테일 템플릿의 초기 레이아웃이 올바르게 표시되는지 확인

**테스트 단계**:
1. 마스터-디테일 데모 페이지에 접속
2. 화면 레이아웃 확인

**예상 결과**:
- 좌측에 마스터 영역 표시
- 우측에 디테일 영역 표시
- 중간에 분할 바 표시
- 마스터 미선택 상태에서 안내 메시지 표시

**검증 기준**:
- [ ] 마스터 영역이 기본 분할 비율(30-40%)로 표시됨
- [ ] 디테일 영역이 나머지 공간 차지
- [ ] 분할 바가 시각적으로 구분됨
- [ ] "항목을 선택하세요" 안내 메시지 표시

---

#### TC-002: 반응형 레이아웃

**테스트 목적**: 다양한 화면 크기에서 레이아웃이 적절히 적응하는지 확인

**테스트 단계**:
1. 데스크톱 크기 (1920x1080)에서 레이아웃 확인
2. 태블릿 크기 (768x1024)로 조절
3. 모바일 크기 (375x667)로 조절

**예상 결과**:
- 데스크톱: 좌우 분할 유지
- 태블릿: 좌우 분할 또는 축소된 마스터
- 모바일: 수직 스택 또는 탭 전환

**검증 기준**:
- [ ] 데스크톱에서 정상 동작
- [ ] 태블릿에서 최소 너비 유지
- [ ] 모바일에서 사용 가능한 레이아웃 제공
- [ ] 리사이즈 시 부드러운 전환

---

#### TC-003: 키보드 탐색

**테스트 목적**: 키보드만으로 모든 기능에 접근 가능한지 확인

**테스트 단계**:
1. Tab 키로 마스터 영역 포커스 이동
2. 화살표 키로 마스터 항목 탐색
3. Enter 키로 마스터 항목 선택
4. Tab 키로 디테일 영역 이동

**예상 결과**:
- 모든 인터랙티브 요소에 Tab으로 접근 가능
- 포커스 표시가 명확함
- 선택/실행이 키보드로 가능

**검증 기준**:
- [ ] Tab 순서가 논리적임 (마스터 -> 분할 바 -> 디테일)
- [ ] 포커스 링이 표시됨
- [ ] Enter/Space로 선택 가능
- [ ] Escape로 포커스 해제 (해당 시)

---

#### TC-004: 스크린리더 호환성

**테스트 목적**: 스크린리더 사용자가 구조를 이해할 수 있는지 확인

**테스트 단계**:
1. VoiceOver/NVDA 활성화
2. 마스터 영역 탐색
3. 디테일 영역 탐색
4. 분할 바 설명 확인

**예상 결과**:
- 각 영역의 역할이 안내됨
- 마스터 항목 선택 상태 안내
- 디테일 컨텐츠 변경 안내

**검증 기준**:
- [ ] 마스터 영역에 적절한 ARIA 레이블
- [ ] 디테일 영역에 적절한 ARIA 레이블
- [ ] 로딩 상태 안내 (aria-busy)
- [ ] 선택 상태 안내 (aria-selected)

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-MASTER-LIST | 마스터 목록 | `[{ id: 'm1', name: '카테고리 1' }, { id: 'm2', name: '카테고리 2' }, { id: 'm3', name: '카테고리 3' }]` |
| MOCK-MASTER-SELECTED | 선택된 마스터 | `{ id: 'm1', name: '카테고리 1' }` |
| MOCK-DETAIL-LIST | 디테일 목록 | `[{ id: 'd1', name: '제품 1', masterId: 'm1' }, { id: 'd2', name: '제품 2', masterId: 'm1' }]` |
| MOCK-EMPTY-MASTER | 빈 마스터 목록 | `[]` |
| MOCK-LARGE-MASTER | 대용량 마스터 (성능) | 100개 항목 배열 |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-BASIC | 기본 E2E 환경 | 자동 시드 | 마스터 5개, 각 디테일 3개 |
| SEED-EMPTY-DETAIL | 빈 디테일 테스트 | 자동 시드 | 마스터 3개, 디테일 없음 |
| SEED-LARGE | 성능 테스트 | 자동 시드 | 마스터 50개, 각 디테일 20개 |

### 5.3 테스트용 컴포넌트 Props

```typescript
// 기본 테스트 Props
const defaultTestProps: MasterDetailTemplateProps<MasterItem, DetailItem> = {
  masterContent: <MockMasterList />,
  detailContent: <MockDetailView />,
  masterTitle: '마스터 목록',
  detailTitle: '상세 정보',
  defaultSplit: 35,
  minMasterWidth: 200,
  minDetailWidth: 300,
}

// 검색 기능 활성화 Props
const searchableTestProps = {
  ...defaultTestProps,
  masterSearchable: true,
  onMasterSearch: vi.fn(),
}

// 로딩 상태 테스트 Props
const loadingTestProps = {
  ...defaultTestProps,
  detailLoading: true,
}
```

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 MasterDetailTemplate 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `master-detail-template` | 최상위 컨테이너 | 컴포넌트 로드 확인 |
| `master-panel` | 마스터 영역 컨테이너 | 마스터 영역 식별 |
| `master-header` | 마스터 헤더 | 타이틀 영역 |
| `master-title` | 마스터 타이틀 | 타이틀 텍스트 |
| `master-search-input` | 검색 입력 필드 | 검색 기능 테스트 |
| `master-content` | 마스터 컨텐츠 영역 | 마스터 목록 래퍼 |
| `master-item` | 마스터 개별 항목 | 항목 선택 테스트 |
| `master-item-{id}` | 특정 마스터 항목 | 특정 항목 선택 |
| `split-handle` | 분할 바 핸들 | 리사이즈 테스트 |
| `detail-panel` | 디테일 영역 컨테이너 | 디테일 영역 식별 |
| `detail-header` | 디테일 헤더 | 타이틀 영역 |
| `detail-title` | 디테일 타이틀 | 타이틀 텍스트 |
| `detail-content` | 디테일 컨텐츠 영역 | 디테일 내용 래퍼 |
| `detail-loading` | 로딩 인디케이터 | 로딩 상태 확인 |
| `detail-placeholder` | 미선택 안내 | 초기 상태 확인 |
| `detail-error` | 에러 메시지 | 에러 상태 확인 |

### 6.2 셀렉터 사용 예시

```typescript
// 컴포넌트 구현 시 적용 예시
<div data-testid="master-detail-template" className={styles.container}>
  <div data-testid="master-panel" className={styles.masterPanel}>
    <div data-testid="master-header">
      <h3 data-testid="master-title">{masterTitle}</h3>
      {masterSearchable && (
        <input data-testid="master-search-input" ... />
      )}
    </div>
    <div data-testid="master-content">
      {masterContent}
    </div>
  </div>

  <div data-testid="split-handle" className={styles.splitHandle} />

  <div data-testid="detail-panel" className={styles.detailPanel}>
    {detailLoading ? (
      <div data-testid="detail-loading">...</div>
    ) : selectedMaster ? (
      <div data-testid="detail-content">{detailContent}</div>
    ) : (
      <div data-testid="detail-placeholder">항목을 선택하세요</div>
    )}
  </div>
</div>
```

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 85% | 75% |
| Branches | 80% | 70% |
| Functions | 90% | 80% |
| Statements | 85% | 75% |

### 7.2 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 마스터-디테일 연동 | 100% 커버 |
| 패널 리사이즈 기능 | 100% 커버 |
| 에러 케이스 | 80% 커버 |

### 7.3 품질 게이트

| 항목 | 조건 | 실패 시 액션 |
|------|------|-------------|
| 단위 테스트 통과율 | 100% | 빌드 실패 |
| 커버리지 최소 기준 | Lines 75% 이상 | 경고 |
| E2E 테스트 통과율 | 100% | 배포 차단 |
| 성능 (리사이즈 FPS) | 30fps 이상 | 최적화 필요 |

---

## 8. 위험 영역 및 집중 테스트 대상

### 8.1 고위험 영역

| 영역 | 위험 요소 | 테스트 전략 |
|------|----------|------------|
| 패널 리사이즈 | 브라우저별 동작 차이 | 크로스 브라우저 E2E 테스트 |
| 마스터-디테일 연동 | 비동기 상태 관리 | 로딩/에러 상태 집중 테스트 |
| 최소 너비 제한 | 엣지 케이스 | 경계값 테스트 |
| 제네릭 타입 | 타입 안전성 | TypeScript 컴파일 체크 |

### 8.2 경계값 테스트

| 테스트 항목 | 경계값 | 테스트 케이스 |
|------------|--------|--------------|
| defaultSplit | 0, 50, 100 | 극단적 분할 비율 |
| minMasterWidth | 0, 50, 화면 너비 | 최소 너비 제한 |
| masterContent | null, 빈 리스트, 1000+ 항목 | 컨텐츠 양 |
| 검색 키워드 | 빈 문자열, 특수문자, 긴 문자열 | 입력 유효성 |

---

## 관련 문서

- 설계 문서: `010-design.md`
- PRD: `.orchay/projects/mes-portal/prd.md` 섹션 4.1.1

---

<!--
author: Claude
Version History:
- v1.0.0 (2026-01-21): 최초 작성
  - 단위 테스트 15개 케이스 정의
  - E2E 테스트 6개 시나리오 정의
  - 매뉴얼 테스트 9개 케이스 정의
  - data-testid 목록 정의
  - 테스트 데이터 Fixture 정의
-->
