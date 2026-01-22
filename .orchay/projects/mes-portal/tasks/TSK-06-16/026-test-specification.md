# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-22

> **목적**: 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-16 |
| Task명 | [샘플] 작업 지시 등록 |
| 설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-22 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | WorkOrderForm 컴포넌트, 유효성 검사 로직 | 80% 이상 |
| E2E 테스트 | 작업 지시 등록 전체 플로우 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + @testing-library/react |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터 | mock-data/products.json |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | WorkOrderForm | 폼 초기 렌더링 | 빈 폼 표시 | FR-001 |
| UT-002 | WorkOrderForm | 제품 선택 팝업 열기/닫기 | 팝업 제어 동작 | FR-002 |
| UT-003 | WorkOrderForm | 저장 시 확인 다이얼로그 | 다이얼로그 표시 | FR-003, BR-01 |
| UT-004 | WorkOrderForm | 저장 성공 Toast | 성공 메시지 표시 | FR-004 |
| UT-005 | 유효성 검사 | 필수 필드 미입력 | 에러 메시지 표시 | FR-005, BR-02 |
| UT-006 | 유효성 검사 | 종료일 < 시작일 | 에러 메시지 표시 | FR-005, BR-03 |
| UT-007 | 유효성 검사 | 수량 범위 초과 | 에러 메시지 표시 | FR-005, BR-04 |
| UT-008 | WorkOrderForm | 변경 후 취소 | 확인 다이얼로그 표시 | BR-05 |

### 2.2 테스트 케이스 상세

#### UT-001: 폼 초기 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/WorkOrderForm.spec.tsx` |
| **테스트 블록** | `describe('WorkOrderForm') → it('should render empty form on initial load')` |
| **Mock 의존성** | - |
| **입력 데이터** | - |
| **검증 포인트** | 모든 필드가 비어있음, 저장 버튼 존재 |
| **커버리지 대상** | 초기 렌더링 로직 |
| **관련 요구사항** | FR-001 |

```tsx
it('should render empty form on initial load', () => {
  render(<WorkOrderForm />)

  expect(screen.getByTestId('work-order-form')).toBeInTheDocument()
  expect(screen.getByTestId('product-select-btn')).toBeInTheDocument()
  expect(screen.getByTestId('quantity-input')).toHaveValue(null)
  expect(screen.getByTestId('line-select')).toBeInTheDocument()
  expect(screen.getByTestId('start-date')).toBeInTheDocument()
  expect(screen.getByTestId('end-date')).toBeInTheDocument()
  expect(screen.getByTestId('form-submit-btn')).toBeInTheDocument()
})
```

#### UT-002: 제품 선택 팝업 열기/닫기

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/WorkOrderForm.spec.tsx` |
| **테스트 블록** | `describe('WorkOrderForm') → describe('Product Selection') → it('should open/close product popup')` |
| **Mock 의존성** | products.json |
| **입력 데이터** | - |
| **검증 포인트** | 팝업 열림/닫힘 상태 |
| **커버리지 대상** | 팝업 제어 로직 |
| **관련 요구사항** | FR-002 |

```tsx
it('should open product popup when clicking select button', async () => {
  render(<WorkOrderForm />)

  await userEvent.click(screen.getByTestId('product-select-btn'))

  expect(screen.getByTestId('select-popup-modal')).toBeInTheDocument()
})

it('should close product popup when clicking cancel', async () => {
  render(<WorkOrderForm />)

  await userEvent.click(screen.getByTestId('product-select-btn'))
  await userEvent.click(screen.getByTestId('select-popup-cancel'))

  expect(screen.queryByTestId('select-popup-modal')).not.toBeInTheDocument()
})
```

#### UT-003: 저장 시 확인 다이얼로그

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/WorkOrderForm.spec.tsx` |
| **테스트 블록** | `describe('WorkOrderForm') → describe('Save') → it('should show confirm dialog before save')` |
| **Mock 의존성** | Modal.confirm mock |
| **입력 데이터** | 유효한 폼 데이터 |
| **검증 포인트** | 확인 다이얼로그 표시 |
| **커버리지 대상** | 저장 전 확인 로직 |
| **관련 요구사항** | FR-003, BR-01 |

```tsx
it('should show confirm dialog when clicking save with valid data', async () => {
  const mockConfirm = vi.spyOn(Modal, 'confirm')
  render(<WorkOrderForm />)

  // 유효한 데이터 입력
  await fillValidFormData()

  await userEvent.click(screen.getByTestId('form-submit-btn'))

  expect(mockConfirm).toHaveBeenCalled()
})
```

#### UT-004: 저장 성공 Toast

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/WorkOrderForm.spec.tsx` |
| **테스트 블록** | `describe('WorkOrderForm') → describe('Save') → it('should show success toast after save')` |
| **Mock 의존성** | message.success mock |
| **입력 데이터** | 유효한 폼 데이터 |
| **검증 포인트** | 성공 Toast 표시 |
| **커버리지 대상** | 저장 성공 피드백 |
| **관련 요구사항** | FR-004 |

```tsx
it('should show success toast after successful save', async () => {
  const mockSuccess = vi.spyOn(message, 'success')
  render(<WorkOrderForm />)

  await fillValidFormData()
  await userEvent.click(screen.getByTestId('form-submit-btn'))
  // 다이얼로그 확인
  await userEvent.click(screen.getByText('확인'))

  await waitFor(() => {
    expect(mockSuccess).toHaveBeenCalledWith(expect.objectContaining({
      content: '저장되었습니다.'
    }))
  })
})
```

#### UT-005: 필수 필드 미입력

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/WorkOrderForm.spec.tsx` |
| **테스트 블록** | `describe('WorkOrderForm') → describe('Validation') → it('should show error for missing required fields')` |
| **Mock 의존성** | - |
| **입력 데이터** | 빈 폼 |
| **검증 포인트** | 필수 필드 에러 메시지 |
| **커버리지 대상** | 필수값 검증 |
| **관련 요구사항** | FR-005, BR-02 |

```tsx
it('should show error when required fields are empty', async () => {
  render(<WorkOrderForm />)

  await userEvent.click(screen.getByTestId('form-submit-btn'))

  await waitFor(() => {
    expect(screen.getByText('제품을 선택해주세요')).toBeInTheDocument()
    expect(screen.getByText('수량을 입력해주세요')).toBeInTheDocument()
    expect(screen.getByText('생산 라인을 선택해주세요')).toBeInTheDocument()
  })
})
```

#### UT-006: 종료일 < 시작일 검증

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/WorkOrderForm.spec.tsx` |
| **테스트 블록** | `describe('WorkOrderForm') → describe('Validation') → it('should show error when endDate is before startDate')` |
| **Mock 의존성** | - |
| **입력 데이터** | startDate: 2026-01-22, endDate: 2026-01-21 |
| **검증 포인트** | 날짜 범위 에러 메시지 |
| **커버리지 대상** | 날짜 범위 검증 |
| **관련 요구사항** | FR-005, BR-03 |

```tsx
it('should show error when endDate is before startDate', async () => {
  render(<WorkOrderForm />)

  // 시작일 설정
  await selectDate('start-date', '2026-01-22')
  // 종료일을 시작일 이전으로 설정
  await selectDate('end-date', '2026-01-21')

  await userEvent.click(screen.getByTestId('form-submit-btn'))

  await waitFor(() => {
    expect(screen.getByText('종료일은 시작일 이후여야 합니다')).toBeInTheDocument()
  })
})
```

#### UT-007: 수량 범위 초과 검증

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/WorkOrderForm.spec.tsx` |
| **테스트 블록** | `describe('WorkOrderForm') → describe('Validation') → it('should show error for invalid quantity')` |
| **Mock 의존성** | - |
| **입력 데이터** | quantity: 0 또는 100000 |
| **검증 포인트** | 수량 범위 에러 메시지 |
| **커버리지 대상** | 숫자 범위 검증 |
| **관련 요구사항** | FR-005, BR-04 |

```tsx
it('should show error for quantity out of range', async () => {
  render(<WorkOrderForm />)

  const quantityInput = screen.getByTestId('quantity-input')
  await userEvent.clear(quantityInput)
  await userEvent.type(quantityInput, '0')

  await userEvent.click(screen.getByTestId('form-submit-btn'))

  await waitFor(() => {
    expect(screen.getByText('수량은 1 이상 99,999 이하로 입력해주세요')).toBeInTheDocument()
  })
})
```

#### UT-008: 변경 후 취소 확인

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/WorkOrderForm.spec.tsx` |
| **테스트 블록** | `describe('WorkOrderForm') → describe('Dirty Check') → it('should show confirm dialog when canceling with changes')` |
| **Mock 의존성** | Modal.confirm mock |
| **입력 데이터** | 일부 필드 변경 |
| **검증 포인트** | 확인 다이얼로그 표시 |
| **커버리지 대상** | dirty check 로직 |
| **관련 요구사항** | BR-05 |

```tsx
it('should show confirm dialog when canceling with unsaved changes', async () => {
  const mockConfirm = vi.spyOn(Modal, 'confirm')
  render(<WorkOrderForm />)

  // 값 변경
  const quantityInput = screen.getByTestId('quantity-input')
  await userEvent.type(quantityInput, '100')

  await userEvent.click(screen.getByTestId('form-cancel-btn'))

  expect(mockConfirm).toHaveBeenCalled()
})
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 작업 지시 등록 폼 표시 | 로그인 상태 | 1. 페이지 접속 | 폼 표시됨 | FR-001 |
| E2E-002 | 제품 선택 플로우 | 폼 표시됨 | 1. 선택 버튼 2. 검색 3. 선택 | 제품 정보 표시 | FR-002 |
| E2E-003 | 저장 확인 다이얼로그 | 유효한 데이터 입력 | 저장 클릭 | 다이얼로그 표시 | FR-003, BR-01 |
| E2E-004 | 저장 성공 Toast | 확인 클릭 | 다이얼로그 확인 | Toast 표시 | FR-004 |
| E2E-005 | 필수 필드 유효성 | 폼 표시됨 | 빈 폼 저장 시도 | 에러 메시지 | FR-005, BR-02 |
| E2E-006 | 날짜 유효성 | 폼 표시됨 | 잘못된 날짜 입력 | 에러 메시지 | FR-005, BR-03 |
| E2E-007 | 수량 유효성 | 폼 표시됨 | 범위 초과 수량 | 에러 메시지 | FR-005, BR-04 |
| E2E-008 | 취소 시 변경사항 확인 | 값 변경됨 | 취소 클릭 | 다이얼로그 표시 | BR-05 |

### 3.2 테스트 케이스 상세

#### E2E-001: 작업 지시 등록 폼 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/work-order-form.spec.ts` |
| **테스트명** | `test('작업 지시 등록 폼이 정상적으로 표시된다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="work-order-form-page"]` |
| - 폼 | `[data-testid="work-order-form"]` |
| - 제품 선택 버튼 | `[data-testid="product-select-btn"]` |
| **검증 포인트** | `expect(page.locator('[data-testid="work-order-form"]')).toBeVisible()` |
| **스크린샷** | `e2e-001-form-display.png` |
| **관련 요구사항** | FR-001 |

```typescript
test('작업 지시 등록 폼이 정상적으로 표시된다', async ({ page }) => {
  await page.goto('/sample/work-order-form')

  await expect(page.locator('[data-testid="work-order-form"]')).toBeVisible()
  await expect(page.locator('[data-testid="product-select-btn"]')).toBeVisible()
  await expect(page.locator('[data-testid="quantity-input"]')).toBeVisible()
  await expect(page.locator('[data-testid="line-select"]')).toBeVisible()
  await expect(page.locator('[data-testid="start-date"]')).toBeVisible()
  await expect(page.locator('[data-testid="end-date"]')).toBeVisible()
  await expect(page.locator('[data-testid="form-submit-btn"]')).toBeVisible()
})
```

#### E2E-002: 제품 선택 플로우

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/work-order-form.spec.ts` |
| **테스트명** | `test('제품 선택 팝업에서 제품을 선택할 수 있다')` |
| **사전조건** | 폼 표시됨 |
| **data-testid 셀렉터** | |
| - 팝업 모달 | `[data-testid="select-popup-modal"]` |
| - 검색 입력 | `[data-testid="select-popup-search"]` |
| - 테이블 | `[data-testid="select-popup-table"]` |
| - 선택완료 버튼 | `[data-testid="select-popup-confirm"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="product-select-btn"]')` |
| 2 | `await page.fill('[data-testid="select-popup-search"]', 'LCD')` |
| 3 | `await page.click('[data-testid="select-popup-search-btn"]')` |
| 4 | `await page.click('.ant-table-row:first-child')` |
| 5 | `await page.click('[data-testid="select-popup-confirm"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="selected-product"]')).toContainText('LCD')` |
| **스크린샷** | `e2e-002-product-select.png` |
| **관련 요구사항** | FR-002 |

```typescript
test('제품 선택 팝업에서 제품을 선택할 수 있다', async ({ page }) => {
  await page.goto('/sample/work-order-form')

  // 팝업 열기
  await page.click('[data-testid="product-select-btn"]')
  await expect(page.locator('[data-testid="select-popup-modal"]')).toBeVisible()

  // 검색 및 선택
  await page.fill('[data-testid="select-popup-search"]', 'LCD')
  await page.click('[data-testid="select-popup-search-btn"]')
  await page.click('.ant-table-row:first-child')
  await page.click('[data-testid="select-popup-confirm"]')

  // 팝업 닫힘 및 선택 반영 확인
  await expect(page.locator('[data-testid="select-popup-modal"]')).not.toBeVisible()
  await expect(page.locator('[data-testid="selected-product"]')).toContainText('LCD')
})
```

#### E2E-003: 저장 확인 다이얼로그

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/work-order-form.spec.ts` |
| **테스트명** | `test('저장 시 확인 다이얼로그가 표시된다')` |
| **사전조건** | 유효한 데이터 입력 완료 |
| **검증 포인트** | `expect(page.locator('.ant-modal-confirm')).toBeVisible()` |
| **스크린샷** | `e2e-003-confirm-dialog.png` |
| **관련 요구사항** | FR-003, BR-01 |

```typescript
test('저장 시 확인 다이얼로그가 표시된다', async ({ page }) => {
  await page.goto('/sample/work-order-form')
  await fillValidFormData(page)

  await page.click('[data-testid="form-submit-btn"]')

  await expect(page.locator('.ant-modal-confirm')).toBeVisible()
  await expect(page.locator('.ant-modal-confirm-body')).toContainText('등록하시겠습니까')
})
```

#### E2E-004: 저장 성공 Toast

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/work-order-form.spec.ts` |
| **테스트명** | `test('저장 성공 시 Toast가 표시된다')` |
| **사전조건** | 확인 다이얼로그 표시됨 |
| **검증 포인트** | `expect(page.locator('.ant-message-success')).toBeVisible()` |
| **스크린샷** | `e2e-004-success-toast.png` |
| **관련 요구사항** | FR-004 |

```typescript
test('저장 성공 시 Toast가 표시된다', async ({ page }) => {
  await page.goto('/sample/work-order-form')
  await fillValidFormData(page)

  await page.click('[data-testid="form-submit-btn"]')
  await page.click('.ant-modal-confirm-btns .ant-btn-primary')

  await expect(page.locator('.ant-message-success')).toBeVisible()
  await expect(page.locator('.ant-message-success')).toContainText('저장되었습니다')
})
```

#### E2E-005: 필수 필드 유효성

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/work-order-form.spec.ts` |
| **테스트명** | `test('필수 필드 미입력 시 에러 메시지가 표시된다')` |
| **사전조건** | 빈 폼 |
| **검증 포인트** | `expect(page.locator('.ant-form-item-explain-error')).toBeVisible()` |
| **스크린샷** | `e2e-005-validation-error.png` |
| **관련 요구사항** | FR-005, BR-02 |

```typescript
test('필수 필드 미입력 시 에러 메시지가 표시된다', async ({ page }) => {
  await page.goto('/sample/work-order-form')

  await page.click('[data-testid="form-submit-btn"]')

  await expect(page.locator('.ant-form-item-explain-error')).toHaveCount(4) // 제품, 수량, 라인, 시작일
  await expect(page.getByText('제품을 선택해주세요')).toBeVisible()
})
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 폼 표시 확인 | 로그인 | 1. 페이지 접속 | 모든 필드 표시 | High | FR-001 |
| TC-002 | 제품 선택 팝업 | 폼 표시됨 | 1. 선택 버튼 클릭 2. 검색 3. 선택 | 제품 정보 반영 | High | FR-002 |
| TC-003 | 저장 플로우 | 데이터 입력 | 1. 저장 클릭 2. 확인 | Toast 표시 | High | FR-003, FR-004 |
| TC-004 | 반응형 확인 | - | 1. 브라우저 크기 조절 | 레이아웃 적응 | Medium | - |
| TC-005 | 유효성 검사 | - | 1. 잘못된 값 입력 2. 저장 | 에러 표시 | High | FR-005 |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 폼 표시 확인

**테스트 목적**: 작업 지시 등록 폼의 모든 필드가 정상적으로 표시되는지 확인

**테스트 단계**:
1. 로그인 완료
2. 사이드바에서 샘플 > 작업 지시 등록 메뉴 클릭
3. 폼 화면이 표시되는지 확인

**예상 결과**:
- 제품 선택 필드 (읽기 전용 + 선택 버튼)
- 수량 입력 필드 (InputNumber)
- 생산 라인 선택 필드 (Select)
- 시작일/종료일 필드 (DatePicker)
- 비고 필드 (TextArea)
- 취소/저장 버튼

**검증 기준**:
- [ ] 모든 필드가 표시됨
- [ ] 필수 필드에 * 표시됨
- [ ] 저장 버튼이 활성화됨

#### TC-002: 제품 선택 팝업

**테스트 목적**: 제품 선택 팝업이 정상적으로 동작하는지 확인

**테스트 단계**:
1. "제품 선택" 버튼 클릭
2. 팝업이 열리는지 확인
3. 검색어 입력 후 검색
4. 제품 행 클릭하여 선택
5. "선택완료" 버튼 클릭

**예상 결과**:
- 팝업이 정상적으로 열림
- 검색 결과가 필터링됨
- 선택한 제품이 강조됨
- 팝업이 닫히고 제품 정보가 폼에 표시됨

**검증 기준**:
- [ ] 팝업 열림/닫힘 동작
- [ ] 검색 기능 동작
- [ ] 선택 반영 확인

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-PRODUCT-01 | 정상 제품 | `{ code: 'P001', name: 'LCD 패널 A형', spec: '15인치', unit: 'EA' }` |
| MOCK-PRODUCT-02 | 정상 제품 | `{ code: 'P002', name: 'LCD 패널 B형', spec: '17인치', unit: 'EA' }` |
| MOCK-LINES | 생산 라인 목록 | `[{ id: 'L1', name: '라인 1' }, { id: 'L2', name: '라인 2' }, ...]` |
| MOCK-VALID-FORM | 유효한 폼 데이터 | `{ productCode: 'P001', quantity: 500, lineId: 'L1', startDate: '2026-01-22', endDate: '2026-01-23' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-BASE | 기본 E2E 환경 | JSON import | 제품 10개, 라인 5개 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 기능 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지별 셀렉터

#### 작업 지시 등록 폼 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `work-order-form-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `work-order-form` | 폼 컨테이너 | 폼 표시 확인 |
| `product-select-btn` | 제품 선택 버튼 | 팝업 열기 |
| `selected-product` | 선택된 제품 표시 | 제품 선택 확인 |
| `quantity-input` | 수량 입력 | 수량 입력 |
| `line-select` | 라인 선택 | 라인 선택 |
| `start-date` | 시작일 | 시작일 선택 |
| `end-date` | 종료일 | 종료일 선택 |
| `remarks-input` | 비고 | 비고 입력 |
| `form-submit-btn` | 저장 버튼 | 저장 액션 (FormTemplate 제공) |
| `form-cancel-btn` | 취소 버튼 | 취소 액션 (FormTemplate 제공) |

#### 제품 선택 팝업 (SelectPopupTemplate 재사용)

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `select-popup-modal` | 모달 컨테이너 | 팝업 표시 확인 |
| `select-popup-search` | 검색 입력 | 검색어 입력 |
| `select-popup-search-btn` | 검색 버튼 | 검색 실행 |
| `select-popup-table` | 테이블 | 검색 결과 표시 |
| `select-popup-confirm` | 선택완료 버튼 | 선택 확정 |
| `select-popup-cancel` | 취소 버튼 | 팝업 닫기 |

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
author: Claude
Version History:
- v1.0 (2026-01-22): TSK-06-16 작업 지시 등록 테스트 명세서 작성
-->
