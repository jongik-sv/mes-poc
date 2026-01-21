# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 - **Last Updated:** 2026-01-21

> **목적**: 카테고리-제품 마스터-디테일 샘플 화면의 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`, `011-ui-design.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-08 |
| Task명 | [샘플] 카테고리-제품 마스터-디테일 |
| Category | development |
| Domain | frontend |
| 설계 참조 | `010-design.md`, `011-ui-design.md` |
| PRD 참조 | PRD 4.1.1 화면 템플릿 - 마스터-디테일 샘플 |
| 작성일 | 2026-01-21 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | CategoryProductPage 컴포넌트, 카테고리 트리/리스트, 제품 목록 테이블, 상태 관리 | 80% 이상 |
| E2E 테스트 | 카테고리 선택 연동, 패널 리사이즈, 검색/필터링, 빈 상태 처리 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 반응형 레이아웃, 접근성, 키보드 탐색 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| UI 컴포넌트 라이브러리 | Ant Design 6.x (Splitter, Tree, Table) |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |
| Mock 데이터 | `mock-data/categories-products.json` |

### 1.3 테스트 우선순위

| 우선순위 | 영역 | 근거 |
|---------|------|------|
| P1 (Critical) | 카테고리 선택 -> 제품 목록 연동 | 핵심 마스터-디테일 기능 |
| P2 (High) | 패널 리사이즈, 최소 너비 제한 | 사용성 |
| P3 (Medium) | 검색/필터링, 로딩 상태 | 부가 기능 |
| P4 (Low) | 접근성, 키보드 탐색, 반응형 | 품질 향상 |

### 1.4 테스트 대상 컴포넌트

```typescript
// app/(portal)/sample/category-product/page.tsx

interface Category {
  id: string
  name: string
  parentId?: string
  children?: Category[]
}

interface Product {
  id: string
  name: string
  categoryId: string
  price: number
  status: 'active' | 'inactive'
  createdAt: string
}

interface CategoryProductPageProps {
  // 레이아웃
  defaultSplit?: [number, number]  // [마스터%, 디테일%]
  minMasterWidth?: number
  minDetailWidth?: number
}
```

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 우선순위 |
|-----------|------|----------|----------|----------|
| UT-001 | CategoryProductPage | 컴포넌트 초기 렌더링 | 마스터/디테일 영역 표시, 카테고리 트리 로드 | P1 |
| UT-002 | CategoryTree | 카테고리 선택 시 콜백 호출 | onSelect 콜백 호출, 선택된 카테고리 ID 전달 | P1 |
| UT-003 | ProductTable | 제품 목록 데이터 렌더링 | 테이블에 제품 데이터 표시, 컬럼 정상 렌더링 | P1 |
| UT-004 | ProductTable | 검색 필터링 동작 | 입력된 검색어로 제품 목록 필터링 | P3 |
| UT-005 | CategoryProductPage | 빈 카테고리 처리 | 제품이 없는 카테고리 선택 시 Empty 상태 표시 | P2 |
| UT-006 | CategoryProductPage | 카테고리 미선택 상태 | "카테고리를 선택하세요" 안내 메시지 표시 | P2 |
| UT-007 | CategoryTree | 트리 노드 펼침/접힘 | 하위 카테고리 표시/숨김 토글 | P3 |
| UT-008 | ProductTable | 테이블 정렬 동작 | 컬럼 헤더 클릭 시 정렬 적용 | P3 |
| UT-009 | ProductTable | 테이블 페이지네이션 | 페이지 전환 동작 | P3 |
| UT-010 | CategoryProductPage | 로딩 상태 표시 | 데이터 로딩 중 스켈레톤/스피너 표시 | P2 |

### 2.2 테스트 케이스 상세

#### UT-001: 컴포넌트 초기 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/sample/category-product/__tests__/page.spec.tsx` |
| **테스트 블록** | `describe('CategoryProductPage') -> describe('렌더링') -> it('마스터와 디테일 영역이 렌더링되어야 한다')` |
| **Mock 의존성** | `mock-data/categories-products.json` |
| **입력 데이터** | 기본 Props |
| **검증 포인트** | 1. 페이지 컨테이너 존재<br>2. 카테고리 트리 영역 존재<br>3. 제품 목록 영역 존재<br>4. 분할 바 존재 |
| **커버리지 대상** | 컴포넌트 기본 렌더링 로직 |

```typescript
it('마스터와 디테일 영역이 렌더링되어야 한다', async () => {
  render(<CategoryProductPage />)

  // 페이지 컨테이너 확인
  expect(screen.getByTestId('category-product-page')).toBeInTheDocument()

  // 카테고리 트리 영역 확인
  expect(screen.getByTestId('category-tree')).toBeInTheDocument()

  // 제품 목록 영역 확인
  expect(screen.getByTestId('product-list')).toBeInTheDocument()

  // 분할 바 확인
  expect(screen.getByTestId('split-handle')).toBeInTheDocument()
})
```

#### UT-002: 카테고리 선택 시 콜백 호출

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/sample/category-product/__tests__/page.spec.tsx` |
| **테스트 블록** | `describe('CategoryProductPage') -> describe('카테고리 선택') -> it('카테고리 선택 시 onSelect 콜백이 호출되어야 한다')` |
| **Mock 의존성** | `vi.fn()` for onSelect |
| **입력 데이터** | 카테고리 데이터 목록 |
| **검증 포인트** | 1. 카테고리 클릭 시 콜백 호출<br>2. 선택된 카테고리 ID 전달 |
| **커버리지 대상** | 카테고리 선택 핸들러 |

```typescript
it('카테고리 선택 시 해당 카테고리의 제품 목록이 표시되어야 한다', async () => {
  render(<CategoryProductPage />)

  // 카테고리 트리에서 항목 클릭
  const categoryItem = screen.getByTestId('category-item-electronics')
  await userEvent.click(categoryItem)

  // 선택된 카테고리 하이라이트 확인
  await waitFor(() => {
    expect(categoryItem).toHaveClass(/selected/)
  })

  // 해당 카테고리의 제품 목록 표시 확인
  await waitFor(() => {
    expect(screen.getByTestId('product-table')).toBeInTheDocument()
  })
})
```

#### UT-003: 제품 목록 데이터 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/sample/category-product/__tests__/page.spec.tsx` |
| **테스트 블록** | `describe('ProductTable') -> describe('렌더링') -> it('제품 데이터가 테이블에 렌더링되어야 한다')` |
| **Mock 의존성** | Mock 제품 데이터 |
| **입력 데이터** | `{ products: mockProducts }` |
| **검증 포인트** | 1. 테이블 헤더 표시<br>2. 제품 행 렌더링<br>3. 각 컬럼 데이터 표시 |
| **커버리지 대상** | ProductTable 렌더링 로직 |

```typescript
it('제품 데이터가 테이블에 렌더링되어야 한다', async () => {
  const mockProducts = [
    { id: 'p1', name: '노트북', categoryId: 'electronics', price: 1500000, status: 'active', createdAt: '2026-01-20' },
    { id: 'p2', name: '키보드', categoryId: 'electronics', price: 150000, status: 'active', createdAt: '2026-01-19' },
  ]

  render(<CategoryProductPage initialProducts={mockProducts} selectedCategoryId="electronics" />)

  // 테이블 헤더 확인
  expect(screen.getByText('제품명')).toBeInTheDocument()
  expect(screen.getByText('가격')).toBeInTheDocument()
  expect(screen.getByText('상태')).toBeInTheDocument()

  // 제품 데이터 확인
  expect(screen.getByText('노트북')).toBeInTheDocument()
  expect(screen.getByText('키보드')).toBeInTheDocument()
})
```

#### UT-004: 검색 필터링 동작

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/sample/category-product/__tests__/page.spec.tsx` |
| **테스트 블록** | `describe('ProductTable') -> describe('검색') -> it('검색어 입력 시 제품 목록이 필터링되어야 한다')` |
| **Mock 의존성** | Mock 제품 데이터 |
| **입력 데이터** | 검색어: "노트북" |
| **검증 포인트** | 1. 검색 입력 후 필터링된 결과 표시<br>2. 일치하지 않는 항목 숨김 |
| **커버리지 대상** | 검색 필터링 로직 |

```typescript
it('검색어 입력 시 제품 목록이 필터링되어야 한다', async () => {
  const mockProducts = [
    { id: 'p1', name: '노트북', categoryId: 'electronics', price: 1500000, status: 'active', createdAt: '2026-01-20' },
    { id: 'p2', name: '키보드', categoryId: 'electronics', price: 150000, status: 'active', createdAt: '2026-01-19' },
    { id: 'p3', name: '마우스', categoryId: 'electronics', price: 50000, status: 'active', createdAt: '2026-01-18' },
  ]

  render(<CategoryProductPage initialProducts={mockProducts} selectedCategoryId="electronics" />)

  // 검색 입력
  const searchInput = screen.getByTestId('search-input')
  await userEvent.type(searchInput, '노트북')

  // 디바운스 대기
  await waitFor(() => {
    expect(screen.getByText('노트북')).toBeInTheDocument()
    expect(screen.queryByText('키보드')).not.toBeInTheDocument()
    expect(screen.queryByText('마우스')).not.toBeInTheDocument()
  }, { timeout: 500 })
})
```

#### UT-005: 빈 카테고리 처리

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/sample/category-product/__tests__/page.spec.tsx` |
| **테스트 블록** | `describe('CategoryProductPage') -> describe('빈 상태') -> it('제품이 없는 카테고리 선택 시 Empty 상태가 표시되어야 한다')` |
| **Mock 의존성** | 빈 제품 목록 |
| **입력 데이터** | `{ products: [], selectedCategoryId: 'empty-category' }` |
| **검증 포인트** | Empty 컴포넌트 표시, 안내 메시지 |
| **커버리지 대상** | 빈 상태 처리 로직 |

```typescript
it('제품이 없는 카테고리 선택 시 Empty 상태가 표시되어야 한다', async () => {
  render(<CategoryProductPage initialProducts={[]} selectedCategoryId="empty-category" />)

  // Empty 상태 표시 확인
  expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  expect(screen.getByText(/제품이 없습니다|등록된 제품이 없습니다/)).toBeInTheDocument()
})
```

#### UT-006: 카테고리 미선택 상태

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/sample/category-product/__tests__/page.spec.tsx` |
| **테스트 블록** | `describe('CategoryProductPage') -> describe('초기 상태') -> it('카테고리 미선택 시 안내 메시지가 표시되어야 한다')` |
| **입력 데이터** | `{ selectedCategoryId: undefined }` |
| **검증 포인트** | 플레이스홀더 메시지 표시 |
| **커버리지 대상** | 미선택 상태 렌더링 |

```typescript
it('카테고리 미선택 시 안내 메시지가 표시되어야 한다', () => {
  render(<CategoryProductPage />)

  // 안내 메시지 확인
  expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  expect(screen.getByText(/카테고리를 선택하세요|좌측에서 카테고리를 선택/)).toBeInTheDocument()
})
```

#### UT-007: 트리 노드 펼침/접힘

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/sample/category-product/__tests__/page.spec.tsx` |
| **테스트 블록** | `describe('CategoryTree') -> describe('트리 탐색') -> it('트리 노드 펼침/접힘이 동작해야 한다')` |
| **입력 데이터** | 계층 구조 카테고리 데이터 |
| **검증 포인트** | 1. 펼침 아이콘 클릭 시 하위 노드 표시<br>2. 접힘 시 하위 노드 숨김 |
| **커버리지 대상** | Tree 컴포넌트 expand/collapse |

```typescript
it('트리 노드 펼침/접힘이 동작해야 한다', async () => {
  render(<CategoryProductPage />)

  // 상위 카테고리 노드 찾기
  const parentNode = screen.getByTestId('category-item-electronics')

  // 펼침 아이콘 클릭 (하위 노드 표시)
  const expandIcon = within(parentNode).getByRole('button', { name: /expand|펼치기/ })
  await userEvent.click(expandIcon)

  // 하위 카테고리 표시 확인
  await waitFor(() => {
    expect(screen.getByTestId('category-item-laptops')).toBeVisible()
  })

  // 접힘 아이콘 클릭 (하위 노드 숨김)
  await userEvent.click(expandIcon)

  // 하위 카테고리 숨김 확인
  await waitFor(() => {
    expect(screen.queryByTestId('category-item-laptops')).not.toBeVisible()
  })
})
```

#### UT-008: 테이블 정렬 동작

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/sample/category-product/__tests__/page.spec.tsx` |
| **테스트 블록** | `describe('ProductTable') -> describe('정렬') -> it('컬럼 헤더 클릭 시 정렬이 적용되어야 한다')` |
| **입력 데이터** | Mock 제품 데이터 |
| **검증 포인트** | 정렬 순서 변경 |
| **커버리지 대상** | Table 정렬 로직 |

```typescript
it('컬럼 헤더 클릭 시 정렬이 적용되어야 한다', async () => {
  const mockProducts = [
    { id: 'p1', name: '노트북', price: 1500000 },
    { id: 'p2', name: '마우스', price: 50000 },
    { id: 'p3', name: '키보드', price: 150000 },
  ]

  render(<CategoryProductPage initialProducts={mockProducts} selectedCategoryId="electronics" />)

  // 가격 컬럼 헤더 클릭 (오름차순)
  const priceHeader = screen.getByText('가격')
  await userEvent.click(priceHeader)

  // 정렬 확인 (첫 번째 행이 최저가)
  await waitFor(() => {
    const rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('마우스')).toBeInTheDocument()
  })

  // 다시 클릭 (내림차순)
  await userEvent.click(priceHeader)

  // 정렬 확인 (첫 번째 행이 최고가)
  await waitFor(() => {
    const rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('노트북')).toBeInTheDocument()
  })
})
```

#### UT-010: 로딩 상태 표시

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/sample/category-product/__tests__/page.spec.tsx` |
| **테스트 블록** | `describe('CategoryProductPage') -> describe('로딩 상태') -> it('데이터 로딩 중 스켈레톤이 표시되어야 한다')` |
| **입력 데이터** | `{ loading: true }` |
| **검증 포인트** | 로딩 인디케이터 표시 |
| **커버리지 대상** | 로딩 상태 렌더링 |

```typescript
it('데이터 로딩 중 스켈레톤이 표시되어야 한다', () => {
  render(<CategoryProductPage loading={true} selectedCategoryId="electronics" />)

  // 로딩 상태 확인
  expect(screen.getByTestId('product-loading')).toBeInTheDocument()
})
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 우선순위 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 카테고리 선택 -> 제품 목록 표시 | 페이지 로드 완료 | 1. 카테고리 클릭 | 해당 카테고리의 제품 목록 표시 | P1 |
| E2E-002 | 패널 리사이즈 동작 | 페이지 로드 완료 | 1. 분할 바 드래그 | 패널 크기 변경 | P2 |
| E2E-003 | 검색/필터링 동작 | 카테고리 선택됨 | 1. 검색어 입력 | 필터링된 제품 목록 표시 | P3 |
| E2E-004 | 빈 상태 표시 | 페이지 로드 완료 | 1. 제품 없는 카테고리 선택 | Empty 상태 표시 | P2 |
| E2E-005 | 다른 카테고리 전환 | 카테고리 선택됨 | 1. 다른 카테고리 클릭 | 새 제품 목록 로딩 | P1 |
| E2E-006 | 최소 너비 제한 | 페이지 로드 완료 | 1. 분할 바를 끝까지 드래그 | 최소 너비 유지 | P2 |

### 3.2 테스트 케이스 상세

#### E2E-001: 카테고리 선택 -> 제품 목록 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/category-product.spec.ts` |
| **테스트명** | `test('카테고리 선택 시 해당 카테고리의 제품 목록이 표시된다')` |
| **사전조건** | 카테고리-제품 샘플 페이지 로드 |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="category-product-page"]` |
| - 카테고리 트리 | `[data-testid="category-tree"]` |
| - 카테고리 항목 | `[data-testid="category-item-{id}"]` |
| - 제품 테이블 | `[data-testid="product-table"]` |
| **검증 포인트** | 1. 카테고리 선택 하이라이트<br>2. 제품 테이블 데이터 로딩<br>3. 제품 목록 표시 |
| **스크린샷** | `e2e-001-category-select.png` |

```typescript
test('카테고리 선택 시 해당 카테고리의 제품 목록이 표시된다', async ({ page }) => {
  // Given: 카테고리-제품 샘플 페이지 접속
  await page.goto('/sample/category-product')
  await page.waitForSelector('[data-testid="category-product-page"]')

  // 초기 상태: 제품 목록 플레이스홀더 표시
  await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()

  // When: 카테고리 항목 클릭
  const categoryItem = page.locator('[data-testid="category-item-electronics"]')
  await categoryItem.click()

  // Then: 로딩 표시 확인
  await expect(page.locator('[data-testid="product-loading"]')).toBeVisible()

  // 제품 목록 로딩 완료 대기
  await expect(page.locator('[data-testid="product-table"]')).toBeVisible()

  // 선택된 카테고리 하이라이트 확인
  await expect(categoryItem).toHaveClass(/selected/)

  await page.screenshot({ path: 'e2e-001-category-select.png' })
})
```

#### E2E-002: 패널 리사이즈 동작

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/category-product.spec.ts` |
| **테스트명** | `test('분할 바 드래그로 패널 크기를 조절할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 분할 핸들 | `[data-testid="split-handle"]` |
| - 카테고리 패널 | `[data-testid="category-tree"]` 부모 |
| **검증 포인트** | 패널 너비 변경 확인 |
| **스크린샷** | `e2e-002-resize-before.png`, `e2e-002-resize-after.png` |

```typescript
test('분할 바 드래그로 패널 크기를 조절할 수 있다', async ({ page }) => {
  await page.goto('/sample/category-product')

  const categoryPanel = page.locator('[data-testid="category-tree"]').locator('..')
  const splitHandle = page.locator('[data-testid="split-handle"]')

  // 초기 너비 기록
  const initialWidth = await categoryPanel.evaluate(el => el.offsetWidth)
  await page.screenshot({ path: 'e2e-002-resize-before.png' })

  // 분할 바 드래그 (우측으로 100px)
  const handleBox = await splitHandle.boundingBox()
  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(handleBox!.x + 100, handleBox!.y + handleBox!.height / 2)
  await page.mouse.up()

  // 변경된 너비 확인
  const newWidth = await categoryPanel.evaluate(el => el.offsetWidth)
  expect(newWidth).toBeGreaterThan(initialWidth)

  await page.screenshot({ path: 'e2e-002-resize-after.png' })
})
```

#### E2E-003: 검색/필터링 동작

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/category-product.spec.ts` |
| **테스트명** | `test('검색어 입력 시 제품 목록이 필터링된다')` |
| **사전조건** | 카테고리 선택됨, 제품 목록 표시 중 |
| **data-testid 셀렉터** | |
| - 검색 입력 | `[data-testid="search-input"]` |
| - 제품 행 | `[data-testid="product-row"]` |
| **검증 포인트** | 필터링된 결과만 표시 |
| **스크린샷** | `e2e-003-search-result.png` |

```typescript
test('검색어 입력 시 제품 목록이 필터링된다', async ({ page }) => {
  await page.goto('/sample/category-product')

  // 카테고리 선택
  await page.click('[data-testid="category-item-electronics"]')
  await page.waitForSelector('[data-testid="product-table"]')

  // 초기 제품 수 확인
  const initialCount = await page.locator('[data-testid="product-row"]').count()
  expect(initialCount).toBeGreaterThan(0)

  // 검색어 입력
  const searchInput = page.locator('[data-testid="search-input"]')
  await searchInput.fill('노트북')

  // 디바운스 대기
  await page.waitForTimeout(300)

  // 필터링된 결과 확인
  const filteredRows = page.locator('[data-testid="product-row"]')
  const filteredCount = await filteredRows.count()

  // 모든 표시된 항목이 검색어 포함 확인
  for (let i = 0; i < filteredCount; i++) {
    const text = await filteredRows.nth(i).textContent()
    expect(text?.toLowerCase()).toContain('노트북')
  }

  await page.screenshot({ path: 'e2e-003-search-result.png' })
})
```

#### E2E-004: 빈 상태 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/category-product.spec.ts` |
| **테스트명** | `test('제품이 없는 카테고리 선택 시 빈 상태가 표시된다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 빈 상태 | `[data-testid="empty-state"]` |
| **검증 포인트** | Empty 컴포넌트 표시 |
| **스크린샷** | `e2e-004-empty-state.png` |

```typescript
test('제품이 없는 카테고리 선택 시 빈 상태가 표시된다', async ({ page }) => {
  await page.goto('/sample/category-product')

  // 빈 카테고리 선택
  await page.click('[data-testid="category-item-empty-category"]')

  // 빈 상태 표시 확인
  await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
  await expect(page.getByText(/제품이 없습니다|등록된 제품이 없습니다/)).toBeVisible()

  await page.screenshot({ path: 'e2e-004-empty-state.png' })
})
```

#### E2E-005: 다른 카테고리 전환

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/category-product.spec.ts` |
| **테스트명** | `test('다른 카테고리 선택 시 제품 목록이 갱신된다')` |
| **사전조건** | 첫 번째 카테고리 선택 상태 |
| **검증 포인트** | 1. 새 제품 목록 로딩<br>2. 이전 선택 해제 |
| **스크린샷** | `e2e-005-category-switch.png` |

```typescript
test('다른 카테고리 선택 시 제품 목록이 갱신된다', async ({ page }) => {
  await page.goto('/sample/category-product')

  // 첫 번째 카테고리 선택
  const firstCategory = page.locator('[data-testid="category-item-electronics"]')
  await firstCategory.click()
  await page.waitForSelector('[data-testid="product-table"]')
  const firstProducts = await page.locator('[data-testid="product-table"]').textContent()

  // 두 번째 카테고리 선택
  const secondCategory = page.locator('[data-testid="category-item-furniture"]')
  await secondCategory.click()

  // 로딩 상태 확인
  await expect(page.locator('[data-testid="product-loading"]')).toBeVisible()

  // 새 제품 목록 로딩 완료
  await expect(page.locator('[data-testid="product-table"]')).toBeVisible()
  const secondProducts = await page.locator('[data-testid="product-table"]').textContent()

  // 컨텐츠 변경 확인
  expect(secondProducts).not.toBe(firstProducts)

  // 선택 상태 확인
  await expect(firstCategory).not.toHaveClass(/selected/)
  await expect(secondCategory).toHaveClass(/selected/)

  await page.screenshot({ path: 'e2e-005-category-switch.png' })
})
```

#### E2E-006: 최소 너비 제한

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/category-product.spec.ts` |
| **테스트명** | `test('패널 최소 너비가 유지된다')` |
| **사전조건** | 페이지 로드 완료 |
| **검증 포인트** | 마스터/디테일 최소 너비 이상 유지 |

```typescript
test('패널 최소 너비가 유지된다', async ({ page }) => {
  await page.goto('/sample/category-product')

  const categoryPanel = page.locator('[data-testid="category-tree"]').locator('..')
  const productPanel = page.locator('[data-testid="product-list"]')
  const splitHandle = page.locator('[data-testid="split-handle"]')

  const MIN_CATEGORY_WIDTH = 200
  const MIN_PRODUCT_WIDTH = 300

  const handleBox = await splitHandle.boundingBox()

  // 극단적으로 좌측 드래그 (카테고리 최소화 시도)
  await page.mouse.move(handleBox!.x, handleBox!.y + handleBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(0, handleBox!.y + handleBox!.height / 2)
  await page.mouse.up()

  const categoryWidth = await categoryPanel.evaluate(el => el.offsetWidth)
  expect(categoryWidth).toBeGreaterThanOrEqual(MIN_CATEGORY_WIDTH)

  // 극단적으로 우측 드래그 (제품 목록 최소화 시도)
  const newHandleBox = await splitHandle.boundingBox()
  await page.mouse.move(newHandleBox!.x, newHandleBox!.y + newHandleBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(2000, newHandleBox!.y + newHandleBox!.height / 2)
  await page.mouse.up()

  const productWidth = await productPanel.evaluate(el => el.offsetWidth)
  expect(productWidth).toBeGreaterThanOrEqual(MIN_PRODUCT_WIDTH)
})
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 |
|-------|-----------|---------|-----------|----------|---------|
| TC-001 | 화면 렌더링 확인 | - | 1. 페이지 접속 | 마스터/디테일 분할 레이아웃 표시 | High |
| TC-002 | 카테고리 트리 네비게이션 | 페이지 로드 | 1. 트리 노드 펼침/접힘<br>2. 카테고리 선택 | 트리 탐색 정상, 선택 하이라이트 | High |
| TC-003 | 제품 테이블 기능 | 카테고리 선택 | 1. 컬럼 정렬<br>2. 페이지네이션 | 정렬/페이지 전환 동작 | Medium |
| TC-004 | 반응형 동작 | - | 1. 브라우저 크기 조절 | 레이아웃 적응 | Medium |
| TC-005 | 키보드 탐색 | - | 1. Tab으로 탐색<br>2. 화살표로 트리 탐색 | 모든 요소 접근 가능 | Medium |
| TC-006 | 스크린리더 호환성 | - | 1. 스크린리더 사용 | 영역 설명 안내 | Low |
| TC-007 | 다크 모드 | 다크 테마 | 1. 다크 모드 전환 | 색상 적절히 적용 | Low |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 화면 렌더링 확인

**테스트 목적**: 카테고리-제품 마스터-디테일 화면의 초기 레이아웃이 올바르게 표시되는지 확인

**테스트 단계**:
1. 샘플 페이지 `/sample/category-product` 접속
2. 화면 레이아웃 확인

**예상 결과**:
- 좌측에 카테고리 트리 영역 표시
- 우측에 제품 목록 영역 표시
- 중간에 분할 바 표시
- 카테고리 미선택 상태에서 안내 메시지 표시

**검증 기준**:
- [ ] 카테고리 영역이 기본 분할 비율(30%)로 표시됨
- [ ] 제품 목록 영역이 나머지 공간 차지
- [ ] 분할 바가 시각적으로 구분됨
- [ ] "카테고리를 선택하세요" 안내 메시지 표시

---

#### TC-002: 카테고리 트리 네비게이션

**테스트 목적**: 카테고리 트리를 통해 계층 구조를 탐색하고 선택할 수 있는지 확인

**테스트 단계**:
1. 상위 카테고리 노드의 펼침 아이콘 클릭
2. 하위 카테고리 표시 확인
3. 카테고리 항목 클릭하여 선택
4. 선택된 카테고리 하이라이트 확인
5. 제품 목록 영역 갱신 확인

**예상 결과**:
- 트리 노드 펼침/접힘 동작
- 선택된 카테고리 배경색 변경
- 제품 목록 영역에 해당 카테고리 제품 표시

**검증 기준**:
- [ ] 트리 노드 펼침 시 하위 항목 표시
- [ ] 트리 노드 접힘 시 하위 항목 숨김
- [ ] 카테고리 선택 시 하이라이트 적용
- [ ] 다른 카테고리 선택 시 이전 선택 해제

---

#### TC-003: 제품 테이블 기능

**테스트 목적**: 제품 테이블의 정렬, 페이지네이션 기능이 정상 동작하는지 확인

**테스트 단계**:
1. 카테고리 선택하여 제품 목록 표시
2. 컬럼 헤더 클릭하여 정렬
3. 다시 클릭하여 역순 정렬
4. 페이지 번호 클릭하여 페이지 전환

**예상 결과**:
- 클릭한 컬럼 기준으로 정렬
- 정렬 방향 아이콘 표시
- 페이지 전환 시 데이터 갱신

**검증 기준**:
- [ ] 제품명 컬럼 정렬 동작
- [ ] 가격 컬럼 정렬 동작
- [ ] 상태 컬럼 정렬 동작
- [ ] 페이지네이션 컨트롤 표시
- [ ] 페이지 전환 동작

---

#### TC-004: 반응형 동작

**테스트 목적**: 다양한 화면 크기에서 레이아웃이 적절히 적응하는지 확인

**테스트 단계**:
1. 데스크톱 크기 (1920x1080)에서 레이아웃 확인
2. 태블릿 크기 (768x1024)로 조절
3. 모바일 크기 (375x667)로 조절

**예상 결과**:
- 데스크톱: 좌우 분할 유지
- 태블릿: 좌우 분할 또는 축소된 카테고리
- 모바일: 수직 스택 또는 탭 전환

**검증 기준**:
- [ ] 데스크톱에서 정상 동작
- [ ] 태블릿에서 최소 너비 유지
- [ ] 모바일에서 사용 가능한 레이아웃 제공
- [ ] 리사이즈 시 부드러운 전환

---

## 5. 테스트 데이터 (Fixture)

### 5.1 Mock 데이터 구조

```typescript
// mock-data/categories-products.json

{
  "categories": [
    {
      "id": "electronics",
      "name": "전자제품",
      "children": [
        { "id": "laptops", "name": "노트북", "parentId": "electronics" },
        { "id": "phones", "name": "휴대폰", "parentId": "electronics" },
        { "id": "accessories", "name": "액세서리", "parentId": "electronics" }
      ]
    },
    {
      "id": "furniture",
      "name": "가구",
      "children": [
        { "id": "chairs", "name": "의자", "parentId": "furniture" },
        { "id": "desks", "name": "책상", "parentId": "furniture" }
      ]
    },
    {
      "id": "empty-category",
      "name": "빈 카테고리"
    }
  ],
  "products": [
    {
      "id": "p1",
      "name": "맥북 프로 16인치",
      "categoryId": "laptops",
      "price": 3500000,
      "status": "active",
      "createdAt": "2026-01-15"
    },
    {
      "id": "p2",
      "name": "삼성 갤럭시 북",
      "categoryId": "laptops",
      "price": 1800000,
      "status": "active",
      "createdAt": "2026-01-10"
    },
    {
      "id": "p3",
      "name": "아이폰 15 프로",
      "categoryId": "phones",
      "price": 1550000,
      "status": "active",
      "createdAt": "2026-01-12"
    },
    {
      "id": "p4",
      "name": "USB-C 허브",
      "categoryId": "accessories",
      "price": 89000,
      "status": "active",
      "createdAt": "2026-01-18"
    },
    {
      "id": "p5",
      "name": "에르고 의자",
      "categoryId": "chairs",
      "price": 450000,
      "status": "active",
      "createdAt": "2026-01-08"
    },
    {
      "id": "p6",
      "name": "스탠딩 데스크",
      "categoryId": "desks",
      "price": 680000,
      "status": "inactive",
      "createdAt": "2026-01-05"
    }
  ]
}
```

### 5.2 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-CATEGORIES | 카테고리 트리 | 위 JSON의 categories 배열 |
| MOCK-PRODUCTS-ELECTRONICS | 전자제품 제품 목록 | categoryId가 'electronics' 하위인 제품들 |
| MOCK-PRODUCTS-EMPTY | 빈 제품 목록 | `[]` |
| MOCK-CATEGORY-SELECTED | 선택된 카테고리 | `{ id: 'laptops', name: '노트북' }` |

### 5.3 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-BASIC | 기본 E2E 환경 | 자동 시드 | 카테고리 6개, 제품 20개 |
| SEED-EMPTY | 빈 상태 테스트 | 자동 시드 | 빈 카테고리 1개 |
| SEED-LARGE | 성능 테스트 | 자동 시드 | 카테고리 50개, 제품 500개 |

### 5.4 테스트용 TypeScript Fixture

```typescript
// fixtures/category-product.fixtures.ts

import type { Category, Product } from '@/types/category-product'

export const mockCategories: Category[] = [
  {
    id: 'electronics',
    name: '전자제품',
    children: [
      { id: 'laptops', name: '노트북', parentId: 'electronics' },
      { id: 'phones', name: '휴대폰', parentId: 'electronics' },
    ],
  },
  {
    id: 'furniture',
    name: '가구',
    children: [
      { id: 'chairs', name: '의자', parentId: 'furniture' },
    ],
  },
  {
    id: 'empty-category',
    name: '빈 카테고리',
  },
]

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: '맥북 프로 16인치',
    categoryId: 'laptops',
    price: 3500000,
    status: 'active',
    createdAt: '2026-01-15',
  },
  {
    id: 'p2',
    name: '삼성 갤럭시 북',
    categoryId: 'laptops',
    price: 1800000,
    status: 'active',
    createdAt: '2026-01-10',
  },
  {
    id: 'p3',
    name: '아이폰 15 프로',
    categoryId: 'phones',
    price: 1550000,
    status: 'active',
    createdAt: '2026-01-12',
  },
]

export const getProductsByCategory = (categoryId: string): Product[] => {
  return mockProducts.filter(p => p.categoryId === categoryId)
}

export const getChildCategories = (parentId: string): string[] => {
  const parent = mockCategories.find(c => c.id === parentId)
  if (!parent?.children) return [parentId]
  return [parentId, ...parent.children.map(c => c.id)]
}
```

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지 레벨 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `category-product-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `split-handle` | 분할 바 핸들 | 리사이즈 테스트 |

### 6.2 카테고리 영역 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `category-tree` | 카테고리 트리 컨테이너 | 트리 영역 식별 |
| `category-item-{id}` | 개별 카테고리 항목 | 특정 카테고리 선택 |
| `category-search-input` | 카테고리 검색 입력 | 카테고리 필터링 (옵션) |

### 6.3 제품 목록 영역 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `product-list` | 제품 목록 컨테이너 | 제품 영역 식별 |
| `product-table` | 제품 테이블 | 테이블 로드 확인 |
| `product-row` | 제품 테이블 행 | 행 개수 확인 |
| `product-row-{id}` | 특정 제품 행 | 특정 제품 선택 |
| `search-input` | 제품 검색 입력 | 검색 필터링 |
| `product-loading` | 로딩 인디케이터 | 로딩 상태 확인 |
| `empty-state` | 빈 상태 표시 | 빈 상태 확인 |

### 6.4 셀렉터 사용 예시

```typescript
// 컴포넌트 구현 시 적용 예시
<div data-testid="category-product-page" className={styles.container}>
  <Splitter>
    <Splitter.Panel min={200}>
      <div data-testid="category-tree">
        <Tree
          treeData={categories}
          onSelect={(keys) => handleCategorySelect(keys[0])}
          titleRender={(node) => (
            <span data-testid={`category-item-${node.id}`}>{node.name}</span>
          )}
        />
      </div>
    </Splitter.Panel>

    <Splitter.Panel min={300}>
      <div data-testid="product-list">
        <Input.Search
          data-testid="search-input"
          placeholder="제품 검색..."
          onSearch={handleSearch}
        />

        {loading ? (
          <Skeleton data-testid="product-loading" active />
        ) : products.length === 0 ? (
          <Empty
            data-testid="empty-state"
            description={selectedCategory ? '제품이 없습니다' : '카테고리를 선택하세요'}
          />
        ) : (
          <Table
            data-testid="product-table"
            dataSource={products}
            rowKey="id"
            onRow={(record) => ({
              'data-testid': `product-row-${record.id}`,
            })}
          />
        )}
      </div>
    </Splitter.Panel>
  </Splitter>
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
| 카테고리-제품 연동 | 100% 커버 |
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
| 카테고리-제품 연동 | 비동기 상태 관리 | 로딩/에러 상태 집중 테스트 |
| 패널 리사이즈 | 브라우저별 동작 차이 | 크로스 브라우저 E2E 테스트 |
| 트리 탐색 | 깊은 계층 구조 처리 | 다단계 트리 데이터 테스트 |
| 대용량 제품 목록 | 성능 저하 | 가상화 및 페이지네이션 테스트 |

### 8.2 경계값 테스트

| 테스트 항목 | 경계값 | 테스트 케이스 |
|------------|--------|--------------|
| 카테고리 계층 깊이 | 1, 5, 10 레벨 | 깊은 트리 구조 탐색 |
| 제품 목록 개수 | 0, 1, 100, 1000 | 페이지네이션 동작 |
| 검색 키워드 | 빈 문자열, 특수문자, 긴 문자열 | 검색 입력 처리 |
| 패널 분할 비율 | 최소 너비, 최대 너비 | 리사이즈 제한 |

### 8.3 접근성 테스트 포인트

| 항목 | 검증 내용 |
|------|----------|
| 카테고리 트리 | role="tree", aria-selected, aria-expanded |
| 제품 테이블 | role="table", aria-sort, aria-label |
| 검색 입력 | aria-label="제품 검색" |
| 빈 상태 | aria-live="polite" |
| 분할 바 | role="separator", aria-valuenow |

---

## 9. 요구사항 추적 매트릭스

| 요구사항 | 설명 | 단위 테스트 | E2E 테스트 | 매뉴얼 테스트 |
|----------|------|------------|-----------|--------------|
| WBS-01 | 좌측 카테고리 목록 (트리/리스트) | UT-001, UT-007 | E2E-001 | TC-002 |
| WBS-02 | 우측 제품 목록 표시 | UT-003, UT-008, UT-009 | E2E-001 | TC-003 |
| WBS-03 | 카테고리 선택 시 제품 목록 표시 | UT-002 | E2E-001, E2E-005 | TC-002 |
| WBS-04 | 분할 패널 리사이즈 | - | E2E-002, E2E-006 | TC-001 |
| WBS-05 | Mock 데이터 사용 | 모든 테스트 | 모든 E2E | - |
| 빈 상태 처리 | 카테고리 미선택/빈 카테고리 | UT-005, UT-006 | E2E-004 | TC-001 |
| 검색 필터링 | 제품 검색 기능 | UT-004 | E2E-003 | TC-003 |
| 반응형 레이아웃 | 다양한 화면 크기 대응 | - | - | TC-004 |
| 접근성 | 키보드 탐색, 스크린리더 | - | - | TC-005, TC-006 |

---

## 관련 문서

- 설계 문서: `010-design.md`
- UI 설계: `011-ui-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- 템플릿 설계: `TSK-06-04/010-design.md` (MasterDetailTemplate)
- PRD: `.orchay/projects/mes-portal/prd.md` (4.1.1 화면 템플릿)

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | Claude | 최초 작성 |

---

<!--
TSK-06-08 [샘플] 카테고리-제품 마스터-디테일
Version: 1.0
Created: 2026-01-21

테스트 범위:
- 단위 테스트: 10개 케이스 (UT-001 ~ UT-010)
- E2E 테스트: 6개 시나리오 (E2E-001 ~ E2E-006)
- 매뉴얼 테스트: 7개 케이스 (TC-001 ~ TC-007)
- data-testid: 13개 정의
-->
