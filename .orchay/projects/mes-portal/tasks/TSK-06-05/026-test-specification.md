# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-21

> **목적**: SelectPopupTemplate 컴포넌트의 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-05 |
| Task명 | 팝업(모달) 화면 템플릿 |
| 설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-21 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | SelectPopupTemplate 컴포넌트, Props 처리, 콜백 함수 | 80% 이상 |
| E2E 테스트 | 팝업 열기/닫기, 검색, 선택, 값 전달 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | 반응형, 접근성, 키보드 탐색 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |
| 모달 라이브러리 | Ant Design Modal |

### 1.3 테스트 우선순위

| 우선순위 | 영역 | 근거 |
|---------|------|------|
| P1 (Critical) | 모달 열기/닫기, 항목 선택, 값 전달 | 핵심 기능 |
| P2 (High) | 검색 필터링, 다중 선택 | 주요 사용자 시나리오 |
| P3 (Medium) | 페이지네이션, 로딩 상태 | 부가 기능 |
| P4 (Low) | 접근성, 키보드 탐색 | 품질 향상 |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 우선순위 |
|-----------|------|----------|----------|----------|
| UT-001 | SelectPopupTemplate | open=true 시 모달 표시 | 모달 visible | P1 |
| UT-002 | SelectPopupTemplate | onClose 콜백 호출 | X 버튼 클릭 시 콜백 호출 | P1 |
| UT-003 | SelectPopupTemplate | 검색 입력 필드 표시 | searchPlaceholder 표시 | P2 |
| UT-004 | SelectPopupTemplate | onSearch 콜백 호출 | 검색 버튼 클릭 시 콜백 | P2 |
| UT-005 | SelectPopupTemplate | 검색 디바운스 | 입력 후 디바운스 대기 | P3 |
| UT-006 | SelectPopupTemplate | 단일 선택 모드 (multiple=false) | 행 클릭 시 선택 | P1 |
| UT-007 | SelectPopupTemplate | 다중 선택 모드 (multiple=true) | 체크박스 표시 | P1 |
| UT-008 | SelectPopupTemplate | 전체 선택 | 전체 선택 체크박스 동작 | P2 |
| UT-009 | SelectPopupTemplate | onSelect 콜백 호출 | 확인 버튼 클릭 시 콜백 | P1 |
| UT-010 | SelectPopupTemplate | 선택된 데이터 전달 | 콜백에 선택 배열 전달 | P1 |
| UT-011 | SelectPopupTemplate | 페이지네이션 표시 | pagination prop 반영 | P3 |
| UT-012 | SelectPopupTemplate | loading 상태 | loading=true 시 스피너 | P3 |
| UT-013 | SelectPopupTemplate | 선택 없이 확인 비활성화 | 버튼 disabled 상태 | P2 |

### 2.2 테스트 케이스 상세

#### UT-001: open=true 시 모달 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/SelectPopupTemplate.spec.tsx` |
| **테스트 블록** | `describe('SelectPopupTemplate') -> describe('모달 표시') -> it('open이 true일 때 모달이 표시되어야 한다')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ open: true, columns: [], dataSource: [], onSelect: vi.fn(), onClose: vi.fn() }` |
| **검증 포인트** | 모달 컨테이너, 헤더, 컨텐츠 영역 존재 확인 |

```typescript
it('open이 true일 때 모달이 표시되어야 한다', () => {
  render(
    <SelectPopupTemplate
      open={true}
      title="항목 선택"
      columns={[{ title: '이름', dataIndex: 'name' }]}
      dataSource={[{ id: '1', name: 'Item 1' }]}
      rowKey="id"
      onSelect={vi.fn()}
      onClose={vi.fn()}
    />
  )

  expect(screen.getByTestId('select-popup-modal')).toBeInTheDocument()
  expect(screen.getByText('항목 선택')).toBeInTheDocument()
})
```

#### UT-002: onClose 콜백 호출

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/SelectPopupTemplate.spec.tsx` |
| **테스트 블록** | `describe('SelectPopupTemplate') -> describe('닫기') -> it('X 버튼 클릭 시 onClose가 호출되어야 한다')` |
| **Mock 의존성** | `vi.fn()` |
| **입력 데이터** | `{ open: true, onClose: mockFn }` |
| **검증 포인트** | onClose 콜백 호출 확인 |

```typescript
it('X 버튼 클릭 시 onClose가 호출되어야 한다', async () => {
  const mockClose = vi.fn()

  render(
    <SelectPopupTemplate
      open={true}
      title="항목 선택"
      columns={[]}
      dataSource={[]}
      rowKey="id"
      onSelect={vi.fn()}
      onClose={mockClose}
    />
  )

  const closeButton = screen.getByLabelText('Close')
  await userEvent.click(closeButton)

  expect(mockClose).toHaveBeenCalledTimes(1)
})
```

#### UT-006: 단일 선택 모드 (multiple=false)

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/SelectPopupTemplate.spec.tsx` |
| **테스트 블록** | `describe('SelectPopupTemplate') -> describe('선택') -> it('multiple=false일 때 행 클릭으로 선택되어야 한다')` |
| **입력 데이터** | `{ multiple: false }` |
| **검증 포인트** | 행 클릭 시 선택 상태 변경, 체크박스 미표시 |

```typescript
it('multiple=false일 때 행 클릭으로 선택되어야 한다', async () => {
  const testData = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ]

  render(
    <SelectPopupTemplate
      open={true}
      title="항목 선택"
      columns={[{ title: '이름', dataIndex: 'name', key: 'name' }]}
      dataSource={testData}
      rowKey="id"
      multiple={false}
      onSelect={vi.fn()}
      onClose={vi.fn()}
    />
  )

  // 체크박스가 없어야 함
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()

  // 행 클릭
  const row = screen.getByText('Item 1').closest('tr')
  await userEvent.click(row!)

  // 선택 상태 확인
  expect(row).toHaveClass(/selected/)
})
```

#### UT-007: 다중 선택 모드 (multiple=true)

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/SelectPopupTemplate.spec.tsx` |
| **테스트 블록** | `describe('SelectPopupTemplate') -> describe('선택') -> it('multiple=true일 때 체크박스가 표시되어야 한다')` |
| **입력 데이터** | `{ multiple: true }` |
| **검증 포인트** | 체크박스 컬럼 표시, 다중 선택 가능 |

```typescript
it('multiple=true일 때 체크박스가 표시되어야 한다', async () => {
  const testData = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ]

  render(
    <SelectPopupTemplate
      open={true}
      title="항목 선택"
      columns={[{ title: '이름', dataIndex: 'name', key: 'name' }]}
      dataSource={testData}
      rowKey="id"
      multiple={true}
      onSelect={vi.fn()}
      onClose={vi.fn()}
    />
  )

  // 체크박스가 있어야 함
  const checkboxes = screen.getAllByRole('checkbox')
  expect(checkboxes.length).toBeGreaterThan(0)

  // 다중 선택 테스트
  await userEvent.click(checkboxes[1]) // 첫 번째 항목
  await userEvent.click(checkboxes[2]) // 두 번째 항목

  expect(checkboxes[1]).toBeChecked()
  expect(checkboxes[2]).toBeChecked()
})
```

#### UT-009: onSelect 콜백 호출

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/SelectPopupTemplate.spec.tsx` |
| **테스트 블록** | `describe('SelectPopupTemplate') -> describe('확인') -> it('확인 버튼 클릭 시 onSelect가 호출되어야 한다')` |
| **Mock 의존성** | `vi.fn()` |
| **검증 포인트** | 선택된 항목과 함께 콜백 호출 |

```typescript
it('확인 버튼 클릭 시 onSelect가 호출되어야 한다', async () => {
  const mockSelect = vi.fn()
  const testData = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ]

  render(
    <SelectPopupTemplate
      open={true}
      title="항목 선택"
      columns={[{ title: '이름', dataIndex: 'name', key: 'name' }]}
      dataSource={testData}
      rowKey="id"
      multiple={true}
      onSelect={mockSelect}
      onClose={vi.fn()}
    />
  )

  // 항목 선택
  const checkboxes = screen.getAllByRole('checkbox')
  await userEvent.click(checkboxes[1])

  // 확인 버튼 클릭
  const confirmButton = screen.getByTestId('select-popup-confirm')
  await userEvent.click(confirmButton)

  expect(mockSelect).toHaveBeenCalledTimes(1)
  expect(mockSelect).toHaveBeenCalledWith([testData[0]])
})
```

#### UT-012: loading 상태

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/SelectPopupTemplate.spec.tsx` |
| **테스트 블록** | `describe('SelectPopupTemplate') -> describe('로딩') -> it('loading=true일 때 로딩 표시가 나타나야 한다')` |
| **입력 데이터** | `{ loading: true }` |
| **검증 포인트** | 테이블 로딩 오버레이 표시 |

```typescript
it('loading=true일 때 로딩 표시가 나타나야 한다', () => {
  render(
    <SelectPopupTemplate
      open={true}
      title="항목 선택"
      columns={[{ title: '이름', dataIndex: 'name', key: 'name' }]}
      dataSource={[]}
      rowKey="id"
      loading={true}
      onSelect={vi.fn()}
      onClose={vi.fn()}
    />
  )

  expect(screen.getByTestId('select-popup-loading')).toBeInTheDocument()
})
```

#### UT-013: 선택 없이 확인 비활성화

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/SelectPopupTemplate.spec.tsx` |
| **테스트 블록** | `describe('SelectPopupTemplate') -> describe('확인') -> it('선택 항목이 없으면 확인 버튼이 비활성화되어야 한다')` |
| **검증 포인트** | 확인 버튼 disabled 상태 |

```typescript
it('선택 항목이 없으면 확인 버튼이 비활성화되어야 한다', () => {
  render(
    <SelectPopupTemplate
      open={true}
      title="항목 선택"
      columns={[{ title: '이름', dataIndex: 'name', key: 'name' }]}
      dataSource={[{ id: '1', name: 'Item 1' }]}
      rowKey="id"
      onSelect={vi.fn()}
      onClose={vi.fn()}
    />
  )

  const confirmButton = screen.getByTestId('select-popup-confirm')
  expect(confirmButton).toBeDisabled()
})
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 우선순위 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 팝업 열기/닫기 | 데모 페이지 로드 | 1. 열기 버튼 클릭 2. X 버튼 클릭 | 모달 열림/닫힘 | P1 |
| E2E-002 | 검색 필터링 | 팝업 열림 | 1. 검색어 입력 | 필터링된 목록 | P2 |
| E2E-003 | 단일 항목 선택 | 팝업 열림 | 1. 행 클릭 2. 확인 클릭 | 값 전달 완료 | P1 |
| E2E-004 | 다중 항목 선택 | 팝업 열림 (multiple) | 1. 체크박스 선택 2. 확인 | 다중 값 전달 | P1 |
| E2E-005 | 선택 후 부모 화면 반영 | 팝업 사용 폼 | 1. 항목 선택 2. 확인 | 폼에 값 표시 | P1 |
| E2E-006 | 선택 없이 확인 시도 | 팝업 열림 | 1. 바로 확인 클릭 | 경고 또는 버튼 비활성화 | P2 |

### 3.2 테스트 케이스 상세

#### E2E-001: 팝업 열기/닫기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/select-popup-template.spec.ts` |
| **테스트명** | `test('팝업이 열리고 닫힐 수 있다')` |
| **사전조건** | 선택 팝업 데모 페이지 로드 |
| **data-testid 셀렉터** | |
| - 열기 버튼 | `[data-testid="open-popup-btn"]` |
| - 모달 | `[data-testid="select-popup-modal"]` |
| - 닫기 버튼 | `.ant-modal-close` |
| **실행 단계** | |
| 1 | `await page.goto('/demo/select-popup')` |
| 2 | `await page.click('[data-testid="open-popup-btn"]')` |
| 3 | `await page.waitForSelector('[data-testid="select-popup-modal"]')` |
| 4 | `await page.click('.ant-modal-close')` |
| **검증 포인트** | 모달 표시 후 사라짐 확인 |
| **스크린샷** | `e2e-001-popup-open.png`, `e2e-001-popup-closed.png` |

```typescript
test('팝업이 열리고 닫힐 수 있다', async ({ page }) => {
  await page.goto('/demo/select-popup')

  // 팝업 열기
  await page.click('[data-testid="open-popup-btn"]')
  await expect(page.locator('[data-testid="select-popup-modal"]')).toBeVisible()
  await page.screenshot({ path: 'e2e-001-popup-open.png' })

  // 팝업 닫기
  await page.click('.ant-modal-close')
  await expect(page.locator('[data-testid="select-popup-modal"]')).not.toBeVisible()
  await page.screenshot({ path: 'e2e-001-popup-closed.png' })
})
```

#### E2E-002: 검색 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/select-popup-template.spec.ts` |
| **테스트명** | `test('검색어 입력 시 목록이 필터링된다')` |
| **사전조건** | 팝업 열림 |
| **data-testid 셀렉터** | |
| - 검색 입력 | `[data-testid="select-popup-search"]` |
| - 테이블 행 | `.ant-table-row` |
| **검증 포인트** | 필터링된 결과만 표시 |

```typescript
test('검색어 입력 시 목록이 필터링된다', async ({ page }) => {
  await page.goto('/demo/select-popup')
  await page.click('[data-testid="open-popup-btn"]')
  await page.waitForSelector('[data-testid="select-popup-modal"]')

  // 초기 항목 수 확인
  const initialRows = await page.locator('.ant-table-row').count()
  expect(initialRows).toBeGreaterThan(1)

  // 검색어 입력
  await page.fill('[data-testid="select-popup-search"]', '항목1')

  // 디바운스 대기
  await page.waitForTimeout(300)

  // 필터링된 결과 확인
  const filteredRows = await page.locator('.ant-table-row').count()
  expect(filteredRows).toBeLessThan(initialRows)

  // 모든 결과가 검색어 포함 확인
  const rowTexts = await page.locator('.ant-table-row').allTextContents()
  for (const text of rowTexts) {
    expect(text.toLowerCase()).toContain('항목1')
  }
})
```

#### E2E-003: 단일 항목 선택

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/select-popup-template.spec.ts` |
| **테스트명** | `test('단일 선택 모드에서 항목을 선택하고 확인할 수 있다')` |
| **사전조건** | 단일 선택 모드 팝업 |
| **data-testid 셀렉터** | |
| - 확인 버튼 | `[data-testid="select-popup-confirm"]` |
| - 취소 버튼 | `[data-testid="select-popup-cancel"]` |
| **검증 포인트** | 선택 후 값 전달 |

```typescript
test('단일 선택 모드에서 항목을 선택하고 확인할 수 있다', async ({ page }) => {
  await page.goto('/demo/select-popup?multiple=false')
  await page.click('[data-testid="open-popup-btn"]')
  await page.waitForSelector('[data-testid="select-popup-modal"]')

  // 확인 버튼 초기 비활성화 확인
  await expect(page.locator('[data-testid="select-popup-confirm"]')).toBeDisabled()

  // 첫 번째 행 클릭
  const firstRow = page.locator('.ant-table-row').first()
  await firstRow.click()

  // 선택 상태 확인
  await expect(firstRow).toHaveClass(/ant-table-row-selected/)

  // 확인 버튼 활성화 확인
  await expect(page.locator('[data-testid="select-popup-confirm"]')).toBeEnabled()

  // 확인 버튼 클릭
  await page.click('[data-testid="select-popup-confirm"]')

  // 모달 닫힘 확인
  await expect(page.locator('[data-testid="select-popup-modal"]')).not.toBeVisible()

  // 선택 결과 확인 (데모 페이지에 표시)
  await expect(page.locator('[data-testid="selected-value"]')).toBeVisible()
})
```

#### E2E-004: 다중 항목 선택

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/select-popup-template.spec.ts` |
| **테스트명** | `test('다중 선택 모드에서 여러 항목을 선택할 수 있다')` |
| **사전조건** | 다중 선택 모드 팝업 (multiple=true) |
| **검증 포인트** | 체크박스로 다중 선택, 선택 개수 표시 |

```typescript
test('다중 선택 모드에서 여러 항목을 선택할 수 있다', async ({ page }) => {
  await page.goto('/demo/select-popup?multiple=true')
  await page.click('[data-testid="open-popup-btn"]')
  await page.waitForSelector('[data-testid="select-popup-modal"]')

  // 체크박스 존재 확인
  const checkboxes = page.locator('.ant-checkbox-input')
  const count = await checkboxes.count()
  expect(count).toBeGreaterThan(2)

  // 첫 번째, 두 번째 항목 체크
  await checkboxes.nth(1).click() // 0번은 전체 선택
  await checkboxes.nth(2).click()

  // 선택 개수 표시 확인
  await expect(page.locator('[data-testid="selected-count"]')).toContainText('2')

  // 확인 버튼 클릭
  await page.click('[data-testid="select-popup-confirm"]')

  // 다중 선택 결과 확인
  await expect(page.locator('[data-testid="selected-value"]')).toContainText('2개')
})
```

#### E2E-005: 선택 후 부모 화면 반영

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/select-popup-template.spec.ts` |
| **테스트명** | `test('선택한 값이 부모 폼에 반영된다')` |
| **사전조건** | 폼 페이지에 팝업 연동 |
| **검증 포인트** | 폼 필드에 선택 값 표시 |

```typescript
test('선택한 값이 부모 폼에 반영된다', async ({ page }) => {
  await page.goto('/demo/select-popup-form')

  // 선택 버튼 클릭
  await page.click('[data-testid="select-user-btn"]')
  await page.waitForSelector('[data-testid="select-popup-modal"]')

  // 첫 번째 항목 선택
  await page.locator('.ant-table-row').first().click()
  const selectedName = await page.locator('.ant-table-row').first().locator('td').nth(1).textContent()

  // 확인
  await page.click('[data-testid="select-popup-confirm"]')

  // 폼 필드에 값 반영 확인
  await expect(page.locator('[data-testid="user-input"]')).toHaveValue(selectedName!)
})
```

#### E2E-006: 선택 없이 확인 시도

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/select-popup-template.spec.ts` |
| **테스트명** | `test('선택 없이 확인 시 버튼이 비활성화되어 있다')` |
| **검증 포인트** | 확인 버튼 비활성화 또는 경고 표시 |

```typescript
test('선택 없이 확인 시 버튼이 비활성화되어 있다', async ({ page }) => {
  await page.goto('/demo/select-popup')
  await page.click('[data-testid="open-popup-btn"]')
  await page.waitForSelector('[data-testid="select-popup-modal"]')

  // 확인 버튼 비활성화 확인
  const confirmButton = page.locator('[data-testid="select-popup-confirm"]')
  await expect(confirmButton).toBeDisabled()

  // 버튼 클릭 시도 (아무 일도 일어나지 않아야 함)
  await confirmButton.click({ force: true })

  // 모달이 여전히 열려 있어야 함
  await expect(page.locator('[data-testid="select-popup-modal"]')).toBeVisible()
})
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 |
|-------|-----------|---------|-----------|----------|---------|
| TC-001 | 모달 기본 표시 | - | 1. 팝업 열기 | 모달 UI 확인 | High |
| TC-002 | 검색 기능 | 팝업 열림 | 1. 검색어 입력 | 필터링 동작 | Medium |
| TC-003 | 선택 기능 | 팝업 열림 | 1. 항목 선택 | 선택 표시 | High |
| TC-004 | 값 전달 | 항목 선택 | 1. 확인 클릭 | 부모에 전달 | High |
| TC-005 | 페이지네이션 | 데이터 많음 | 1. 페이지 이동 | 정상 동작 | Medium |
| TC-006 | 반응형 | - | 1. 화면 크기 조절 | 레이아웃 적응 | Medium |
| TC-007 | 키보드 탐색 | 팝업 열림 | 1. Tab 이동 | 포커스 이동 | Medium |
| TC-008 | 빈 상태 | 검색 결과 없음 | 1. 없는 검색어 입력 | Empty 표시 | Low |
| TC-009 | ESC로 닫기 | 팝업 열림 | 1. ESC 키 입력 | 팝업 닫힘 | Medium |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 모달 기본 표시

**테스트 목적**: 선택형 팝업 모달의 기본 UI가 올바르게 표시되는지 확인

**테스트 단계**:
1. 선택 팝업 데모 페이지에 접속
2. 팝업 열기 버튼 클릭
3. 모달 UI 요소 확인

**예상 결과**:
- 모달 제목 표시
- X 닫기 버튼 존재
- 검색 입력 필드 표시
- 데이터 테이블 표시
- 취소/확인 버튼 표시

**검증 기준**:
- [ ] 모달 중앙 정렬
- [ ] 배경 딤 처리
- [ ] 제목 텍스트 표시
- [ ] 검색 영역 표시
- [ ] 테이블 컬럼 헤더 표시
- [ ] 하단 버튼 영역 표시

---

#### TC-003: 선택 기능

**테스트 목적**: 단일/다중 선택 기능이 올바르게 동작하는지 확인

**테스트 단계**:
1. 팝업 열기
2. (단일 모드) 행 클릭하여 선택
3. (다중 모드) 체크박스로 여러 항목 선택
4. 전체 선택 체크박스 동작 확인

**예상 결과**:
- 단일 모드: 클릭한 행 하이라이트, 다른 선택 해제
- 다중 모드: 체크한 모든 항목 선택 유지
- 선택 개수 표시 갱신

**검증 기준**:
- [ ] 단일 선택 시 이전 선택 해제
- [ ] 다중 선택 시 선택 누적
- [ ] 전체 선택 시 모든 항목 체크
- [ ] 선택 개수 실시간 갱신

---

#### TC-007: 키보드 탐색

**테스트 목적**: 키보드만으로 모든 기능에 접근 가능한지 확인

**테스트 단계**:
1. 팝업 열기
2. Tab 키로 검색 입력 → 테이블 → 버튼 이동
3. Enter 키로 선택/실행
4. ESC 키로 닫기

**예상 결과**:
- 모든 인터랙티브 요소에 Tab으로 접근 가능
- 포커스 표시가 명확함
- Enter로 선택/실행 가능

**검증 기준**:
- [ ] Tab 순서: 검색 → 테이블 → 취소 → 확인
- [ ] 테이블 내 화살표 키 탐색
- [ ] Enter/Space로 항목 선택
- [ ] ESC로 팝업 닫기

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-ITEMS-BASIC | 기본 항목 목록 | `[{ id: '1', name: '항목 1', code: 'A001' }, { id: '2', name: '항목 2', code: 'A002' }, { id: '3', name: '항목 3', code: 'A003' }]` |
| MOCK-ITEMS-EMPTY | 빈 목록 | `[]` |
| MOCK-ITEMS-LARGE | 대용량 목록 | 50개 항목 배열 |
| MOCK-COLUMNS | 테이블 컬럼 | `[{ title: '코드', dataIndex: 'code' }, { title: '이름', dataIndex: 'name' }]` |
| MOCK-PAGINATION | 페이지네이션 설정 | `{ current: 1, pageSize: 10, total: 50 }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-BASIC | 기본 E2E 환경 | 자동 시드 | 항목 20개 |
| SEED-EMPTY | 빈 환경 테스트 | 자동 시드 | 항목 0개 |
| SEED-LARGE | 페이지네이션 테스트 | 자동 시드 | 항목 100개 |

### 5.3 테스트용 컴포넌트 Props

```typescript
// 기본 테스트 Props
const defaultTestProps: SelectPopupTemplateProps<TestItem> = {
  open: true,
  title: '항목 선택',
  columns: [
    { title: '코드', dataIndex: 'code', key: 'code' },
    { title: '이름', dataIndex: 'name', key: 'name' },
  ],
  dataSource: MOCK_ITEMS_BASIC,
  rowKey: 'id',
  onSelect: vi.fn(),
  onClose: vi.fn(),
}

// 다중 선택 모드 Props
const multipleSelectProps = {
  ...defaultTestProps,
  multiple: true,
}

// 검색 기능 활성화 Props
const searchableProps = {
  ...defaultTestProps,
  searchPlaceholder: '검색어를 입력하세요',
  onSearch: vi.fn(),
}

// 로딩 상태 테스트 Props
const loadingProps = {
  ...defaultTestProps,
  loading: true,
}
```

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 SelectPopupTemplate 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `select-popup-modal` | 모달 컨테이너 | 모달 표시 확인 |
| `select-popup-title` | 모달 제목 | 제목 텍스트 확인 |
| `select-popup-search` | 검색 입력 필드 | 검색 기능 테스트 |
| `select-popup-search-btn` | 검색 버튼 | 검색 실행 |
| `select-popup-table` | 테이블 컨테이너 | 목록 표시 확인 |
| `select-popup-row-{id}` | 특정 테이블 행 | 특정 항목 선택 |
| `select-popup-loading` | 로딩 인디케이터 | 로딩 상태 확인 |
| `select-popup-empty` | 빈 상태 표시 | Empty 상태 확인 |
| `selected-count` | 선택 개수 표시 | 선택 현황 확인 |
| `select-all-checkbox` | 전체 선택 체크박스 | 전체 선택 테스트 |
| `select-popup-cancel` | 취소 버튼 | 취소 액션 |
| `select-popup-confirm` | 확인 버튼 | 확인 액션 |

### 6.2 셀렉터 사용 예시

```typescript
// 컴포넌트 구현 시 적용 예시
<Modal
  data-testid="select-popup-modal"
  open={open}
  title={<span data-testid="select-popup-title">{title}</span>}
  onCancel={onClose}
  footer={
    <>
      <Button data-testid="select-popup-cancel" onClick={onClose}>
        취소
      </Button>
      <Button
        data-testid="select-popup-confirm"
        type="primary"
        onClick={handleConfirm}
        disabled={selectedKeys.length === 0}
      >
        선택완료
      </Button>
    </>
  }
>
  <Space direction="vertical" style={{ width: '100%' }}>
    <Input.Search
      data-testid="select-popup-search"
      placeholder={searchPlaceholder}
      onSearch={handleSearch}
    />
    <div data-testid="selected-count">선택: {selectedKeys.length}건</div>
    {loading ? (
      <div data-testid="select-popup-loading"><Spin /></div>
    ) : (
      <Table
        data-testid="select-popup-table"
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        rowSelection={rowSelection}
        pagination={pagination}
        locale={{ emptyText: <Empty data-testid="select-popup-empty" /> }}
      />
    )}
  </Space>
</Modal>
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
| 팝업 열기/닫기 | 100% 커버 |
| 선택 기능 (단일/다중) | 100% 커버 |
| 검색 필터링 | 100% 커버 |
| 에러 케이스 | 80% 커버 |

### 7.3 품질 게이트

| 항목 | 조건 | 실패 시 액션 |
|------|------|-------------|
| 단위 테스트 통과율 | 100% | 빌드 실패 |
| 커버리지 최소 기준 | Lines 75% 이상 | 경고 |
| E2E 테스트 통과율 | 100% | 배포 차단 |

---

## 8. 위험 영역 및 집중 테스트 대상

### 8.1 고위험 영역

| 영역 | 위험 요소 | 테스트 전략 |
|------|----------|------------|
| 선택 상태 관리 | 내부/외부 상태 동기화 | 선택/해제 시나리오 집중 테스트 |
| 값 전달 | 콜백 데이터 정합성 | 다양한 선택 조합 테스트 |
| 모달 닫힘 | 선택 중간 상태 처리 | 취소/X/배경 클릭 모두 테스트 |
| 검색 디바운스 | 빠른 입력 시 동작 | 타이밍 관련 테스트 |

### 8.2 경계값 테스트

| 테스트 항목 | 경계값 | 테스트 케이스 |
|------------|--------|--------------|
| dataSource | 빈 배열, 1개, 1000+ 개 | 데이터 양 극단치 |
| selectedKeys | 빈 배열, 전체 선택 | 선택 개수 |
| 검색 키워드 | 빈 문자열, 특수문자, 긴 문자열 | 입력 유효성 |
| pagination | pageSize 1, 100 | 페이지 크기 |

---

## 관련 문서

- 설계 문서: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md` 섹션 4.1.1

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | Claude | 최초 작성 |

<!--
author: Claude
Version History:
- v1.0.0 (2026-01-21): 최초 작성
  - 단위 테스트 13개 케이스 정의
  - E2E 테스트 6개 시나리오 정의
  - 매뉴얼 테스트 9개 케이스 정의
  - data-testid 목록 정의
  - 테스트 데이터 Fixture 정의
-->
