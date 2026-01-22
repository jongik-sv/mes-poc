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
| Task ID | TSK-06-18 |
| Task명 | [샘플] 공정 관리 |
| 설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-22 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | 컴포넌트 렌더링, 상태 관리, 핸들러 | 80% 이상 |
| E2E 테스트 | CRUD 전체 시나리오, 상태 전환 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + @testing-library/react |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터베이스 | Mock JSON (mock-data/processes.json) |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | ProcessList | 목록 렌더링 | 공정 목록 표시 | FR-001 |
| UT-002 | ProcessDetail | 상세 렌더링 | 공정 상세 정보 표시 | FR-002 |
| UT-003 | ProcessForm | 등록 유효성 검사 | 필수 필드 에러 표시 | FR-003, BR-02 |
| UT-004 | ProcessForm | 수정 시 기존값 로드 | 폼에 기존 데이터 표시 | FR-004 |
| UT-005 | deleteProcess | 삭제 함수 호출 | 목록에서 제거됨 | FR-005 |
| UT-006 | ProcessList | 로딩/에러 상태 | 상태별 UI 표시 | FR-006 |
| UT-007 | ProcessDetail | 삭제 확인 다이얼로그 | Modal.confirm 호출 | BR-01 |
| UT-008 | ProcessForm | 변경 감지 | isDirty 상태 true | BR-03 |
| UT-009 | ProcessForm | 중복 코드 검사 | 에러 메시지 표시 | BR-04 |
| UT-010 | ProcessList | 비활성 행 스타일 | 회색 스타일 적용 | BR-05 |

### 2.2 테스트 케이스 상세

#### UT-001: ProcessList 목록 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/ProcessManagement/__tests__/ProcessList.test.tsx` |
| **테스트 블록** | `describe('ProcessList') → it('renders process list')` |
| **Mock 의존성** | processes.json 데이터 |
| **입력 데이터** | Mock 공정 목록 5건 |
| **검증 포인트** | 테이블 행 5개 렌더링 확인 |
| **커버리지 대상** | ProcessList 컴포넌트 기본 렌더링 |
| **관련 요구사항** | FR-001 |

```typescript
// 테스트 코드 예시
it('renders process list', () => {
  render(<ProcessList />)
  expect(screen.getByTestId('process-list')).toBeInTheDocument()
  expect(screen.getAllByTestId('process-item')).toHaveLength(5)
})
```

#### UT-002: ProcessDetail 상세 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/ProcessManagement/__tests__/ProcessDetail.test.tsx` |
| **테스트 블록** | `describe('ProcessDetail') → it('renders process detail')` |
| **Mock 의존성** | 단일 공정 데이터 |
| **입력 데이터** | `{ id: '1', code: 'PRC001', name: '조립', ... }` |
| **검증 포인트** | Descriptions 컴포넌트에 데이터 표시 확인 |
| **커버리지 대상** | ProcessDetail 컴포넌트 |
| **관련 요구사항** | FR-002 |

```typescript
it('renders process detail', () => {
  render(<ProcessDetail process={mockProcess} onBack={jest.fn()} />)
  expect(screen.getByText('PRC001')).toBeInTheDocument()
  expect(screen.getByText('조립')).toBeInTheDocument()
})
```

#### UT-003: ProcessForm 등록 유효성 검사

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/ProcessManagement/__tests__/ProcessForm.test.tsx` |
| **테스트 블록** | `describe('ProcessForm') → it('shows validation errors')` |
| **Mock 의존성** | - |
| **입력 데이터** | 빈 폼 제출 |
| **검증 포인트** | 필수 필드 에러 메시지 표시 |
| **커버리지 대상** | 폼 유효성 검사 로직 |
| **관련 요구사항** | FR-003, BR-02 |

```typescript
it('shows validation errors for required fields', async () => {
  const { user } = render(<ProcessForm mode="create" onSubmit={jest.fn()} />)
  await user.click(screen.getByTestId('form-submit-btn'))
  expect(await screen.findByText(/공정코드.*입력/)).toBeInTheDocument()
  expect(await screen.findByText(/공정명.*입력/)).toBeInTheDocument()
})
```

#### UT-004: ProcessForm 수정 시 기존값 로드

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/ProcessManagement/__tests__/ProcessForm.test.tsx` |
| **테스트 블록** | `describe('ProcessForm') → it('loads initial values in edit mode')` |
| **Mock 의존성** | 기존 공정 데이터 |
| **입력 데이터** | `{ code: 'PRC001', name: '조립', status: 'active' }` |
| **검증 포인트** | 폼 필드에 기존 값 표시 |
| **커버리지 대상** | initialValues 처리 |
| **관련 요구사항** | FR-004 |

```typescript
it('loads initial values in edit mode', () => {
  render(<ProcessForm mode="edit" initialValues={mockProcess} onSubmit={jest.fn()} />)
  expect(screen.getByDisplayValue('PRC001')).toBeInTheDocument()
  expect(screen.getByDisplayValue('조립')).toBeInTheDocument()
})
```

#### UT-005: deleteProcess 삭제 함수 호출

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/ProcessManagement/__tests__/useProcessData.test.ts` |
| **테스트 블록** | `describe('useProcessData') → it('removes process on delete')` |
| **Mock 의존성** | - |
| **입력 데이터** | 삭제할 공정 ID |
| **검증 포인트** | 목록에서 해당 공정 제거 확인 |
| **커버리지 대상** | deleteProcess 함수 |
| **관련 요구사항** | FR-005 |

```typescript
it('removes process on delete', () => {
  const { result } = renderHook(() => useProcessData())
  act(() => result.current.deleteProcess('1'))
  expect(result.current.processes.find(p => p.id === '1')).toBeUndefined()
})
```

#### UT-006: ProcessList 로딩/에러 상태

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/ProcessManagement/__tests__/ProcessList.test.tsx` |
| **테스트 블록** | `describe('ProcessList') → it('renders loading/error states')` |
| **Mock 의존성** | 상태 제어 props |
| **입력 데이터** | `loading: true` 또는 `error: 'Error message'` |
| **검증 포인트** | 로딩 스피너 또는 에러 메시지 표시 |
| **커버리지 대상** | 상태별 조건부 렌더링 |
| **관련 요구사항** | FR-006 |

```typescript
it('renders loading state', () => {
  render(<ProcessList loading={true} />)
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
})

it('renders error state', () => {
  render(<ProcessList error="데이터를 불러올 수 없습니다" />)
  expect(screen.getByText('데이터를 불러올 수 없습니다')).toBeInTheDocument()
})
```

#### UT-007: ProcessDetail 삭제 확인 다이얼로그

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/ProcessManagement/__tests__/ProcessDetail.test.tsx` |
| **테스트 블록** | `describe('ProcessDetail') → it('shows delete confirmation')` |
| **Mock 의존성** | Modal.confirm mock |
| **입력 데이터** | 삭제 버튼 클릭 |
| **검증 포인트** | Modal.confirm 호출 확인 |
| **커버리지 대상** | 삭제 버튼 핸들러 |
| **관련 요구사항** | BR-01 |

```typescript
it('shows delete confirmation dialog', async () => {
  const confirmSpy = vi.spyOn(Modal, 'confirm')
  const { user } = render(<ProcessDetail process={mockProcess} onDelete={jest.fn()} />)
  await user.click(screen.getByTestId('delete-btn'))
  expect(confirmSpy).toHaveBeenCalled()
})
```

#### UT-008: ProcessForm 변경 감지

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/ProcessManagement/__tests__/ProcessForm.test.tsx` |
| **테스트 블록** | `describe('ProcessForm') → it('detects form changes')` |
| **Mock 의존성** | - |
| **입력 데이터** | 필드 값 변경 |
| **검증 포인트** | data-dirty 속성 'true' |
| **커버리지 대상** | enableDirtyCheck 기능 |
| **관련 요구사항** | BR-03 |

```typescript
it('detects form changes', async () => {
  const { user } = render(
    <ProcessForm mode="edit" initialValues={mockProcess} enableDirtyCheck onSubmit={jest.fn()} />
  )
  await user.clear(screen.getByLabelText('공정명'))
  await user.type(screen.getByLabelText('공정명'), '수정된 공정')
  expect(screen.getByTestId('form-template')).toHaveAttribute('data-dirty', 'true')
})
```

#### UT-009: ProcessForm 중복 코드 검사

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/ProcessManagement/__tests__/ProcessForm.test.tsx` |
| **테스트 블록** | `describe('ProcessForm') → it('shows duplicate code error')` |
| **Mock 의존성** | 기존 공정 목록 |
| **입력 데이터** | 이미 존재하는 공정코드 |
| **검증 포인트** | "이미 사용 중인 공정코드입니다" 메시지 |
| **커버리지 대상** | 중복 검사 로직 |
| **관련 요구사항** | BR-04 |

```typescript
it('shows duplicate code error', async () => {
  const { user } = render(
    <ProcessForm mode="create" existingCodes={['PRC001']} onSubmit={jest.fn()} />
  )
  await user.type(screen.getByLabelText('공정코드'), 'PRC001')
  await user.click(screen.getByTestId('form-submit-btn'))
  expect(await screen.findByText(/이미 사용 중/)).toBeInTheDocument()
})
```

#### UT-010: ProcessList 비활성 행 스타일

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/ProcessManagement/__tests__/ProcessList.test.tsx` |
| **테스트 블록** | `describe('ProcessList') → it('applies inactive row style')` |
| **Mock 의존성** | 비활성 공정 포함 목록 |
| **입력 데이터** | `status: 'inactive'` 공정 |
| **검증 포인트** | 해당 행에 'inactive' 클래스 적용 |
| **커버리지 대상** | 행 스타일 조건부 적용 |
| **관련 요구사항** | BR-05 |

```typescript
it('applies inactive row style', () => {
  render(<ProcessList processes={[{ ...mockProcess, status: 'inactive' }]} />)
  const row = screen.getByTestId('process-item-1')
  expect(row).toHaveClass('inactive')
})
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 목록 조회 | 로그인 | 1. 페이지 접속 | 목록 표시됨 | FR-001 |
| E2E-002 | 상세 조회 | 목록 표시 | 1. 행 클릭 | 상세 화면 표시 | FR-002 |
| E2E-003 | 공정 등록 | 로그인 | 1. 신규 2. 입력 3. 저장 | 목록에 추가됨 | FR-003 |
| E2E-004 | 공정 수정 | 상세 화면 | 1. 수정 2. 변경 3. 저장 | 정보 업데이트 | FR-004 |
| E2E-005 | 공정 삭제 | 상세 화면 | 1. 삭제 2. 확인 | 목록에서 제거 | FR-005, BR-01 |
| E2E-006 | 에러 상태 | 네트워크 오류 | 1. 페이지 접속 | 에러 표시 | FR-006 |
| E2E-007 | 변경 이탈 경고 | 수정 중 | 1. 변경 2. 취소 | 경고 다이얼로그 | BR-03 |
| E2E-008 | 중복 코드 오류 | 등록 중 | 1. 중복 코드 입력 | 에러 메시지 | BR-04 |

### 3.2 테스트 케이스 상세

#### E2E-001: 목록 조회

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/process-management.spec.ts` |
| **테스트명** | `test('사용자가 공정 목록을 조회할 수 있다')` |
| **사전조건** | 로그인 완료 |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="process-management-page"]` |
| - 목록 테이블 | `[data-testid="process-list"]` |
| - 목록 아이템 | `[data-testid="process-item"]` |
| **검증 포인트** | `expect(page.locator('[data-testid="process-list"]')).toBeVisible()` |
| **스크린샷** | `e2e-001-list.png` |
| **관련 요구사항** | FR-001 |

```typescript
test('사용자가 공정 목록을 조회할 수 있다', async ({ page }) => {
  await page.goto('/sample/process-management')
  await expect(page.locator('[data-testid="process-list"]')).toBeVisible()
  const items = page.locator('[data-testid="process-item"]')
  await expect(items).toHaveCount(5)
  await page.screenshot({ path: 'e2e-001-list.png' })
})
```

#### E2E-002: 상세 조회

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/process-management.spec.ts` |
| **테스트명** | `test('사용자가 공정 상세를 조회할 수 있다')` |
| **사전조건** | 목록 화면 |
| **data-testid 셀렉터** | |
| - 상세 컨테이너 | `[data-testid="process-detail"]` |
| - 상세 정보 | `[data-testid="process-descriptions"]` |
| - 탭 | `[data-testid="process-tabs"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="process-item"]:first-child')` |
| **검증 포인트** | `expect(page.locator('[data-testid="process-detail"]')).toBeVisible()` |
| **스크린샷** | `e2e-002-detail.png` |
| **관련 요구사항** | FR-002 |

```typescript
test('사용자가 공정 상세를 조회할 수 있다', async ({ page }) => {
  await page.goto('/sample/process-management')
  await page.click('[data-testid="process-item"]:first-child')
  await expect(page.locator('[data-testid="process-detail"]')).toBeVisible()
  await expect(page.locator('[data-testid="process-descriptions"]')).toBeVisible()
  await page.screenshot({ path: 'e2e-002-detail.png' })
})
```

#### E2E-003: 공정 등록

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/process-management.spec.ts` |
| **테스트명** | `test('사용자가 새 공정을 등록할 수 있다')` |
| **사전조건** | 목록 화면 |
| **data-testid 셀렉터** | |
| - 신규 버튼 | `[data-testid="add-btn"]` |
| - 코드 입력 | `[data-testid="process-code-input"]` |
| - 이름 입력 | `[data-testid="process-name-input"]` |
| - 상태 선택 | `[data-testid="process-status-radio"]` |
| - 저장 버튼 | `[data-testid="form-submit-btn"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="add-btn"]')` |
| 2 | `await page.fill('[data-testid="process-code-input"]', 'NEW001')` |
| 3 | `await page.fill('[data-testid="process-name-input"]', '신규 공정')` |
| 4 | `await page.click('[data-testid="process-status-radio-active"]')` |
| 5 | `await page.click('[data-testid="form-submit-btn"]')` |
| **검증 포인트** | `expect(page.locator('text=신규 공정')).toBeVisible()` |
| **스크린샷** | `e2e-003-create-before.png`, `e2e-003-create-after.png` |
| **관련 요구사항** | FR-003 |

```typescript
test('사용자가 새 공정을 등록할 수 있다', async ({ page }) => {
  await page.goto('/sample/process-management')
  await page.screenshot({ path: 'e2e-003-create-before.png' })

  await page.click('[data-testid="add-btn"]')
  await page.fill('[data-testid="process-code-input"]', 'NEW001')
  await page.fill('[data-testid="process-name-input"]', '신규 공정')
  await page.click('[data-testid="process-status-radio-active"]')
  await page.click('[data-testid="form-submit-btn"]')

  await expect(page.locator('text=저장되었습니다')).toBeVisible()
  await expect(page.locator('text=신규 공정')).toBeVisible()
  await page.screenshot({ path: 'e2e-003-create-after.png' })
})
```

#### E2E-004: 공정 수정

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/process-management.spec.ts` |
| **테스트명** | `test('사용자가 공정을 수정할 수 있다')` |
| **사전조건** | 상세 화면 |
| **data-testid 셀렉터** | |
| - 수정 버튼 | `[data-testid="edit-btn"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="process-item"]:first-child')` |
| 2 | `await page.click('[data-testid="edit-btn"]')` |
| 3 | `await page.fill('[data-testid="process-name-input"]', '수정된 공정')` |
| 4 | `await page.click('[data-testid="form-submit-btn"]')` |
| **검증 포인트** | `expect(page.locator('text=수정된 공정')).toBeVisible()` |
| **스크린샷** | `e2e-004-edit.png` |
| **관련 요구사항** | FR-004 |

```typescript
test('사용자가 공정을 수정할 수 있다', async ({ page }) => {
  await page.goto('/sample/process-management')
  await page.click('[data-testid="process-item"]:first-child')
  await page.click('[data-testid="edit-btn"]')
  await page.fill('[data-testid="process-name-input"]', '수정된 공정')
  await page.click('[data-testid="form-submit-btn"]')

  await expect(page.locator('text=저장되었습니다')).toBeVisible()
  await expect(page.locator('text=수정된 공정')).toBeVisible()
  await page.screenshot({ path: 'e2e-004-edit.png' })
})
```

#### E2E-005: 공정 삭제

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/process-management.spec.ts` |
| **테스트명** | `test('사용자가 공정을 삭제할 수 있다')` |
| **사전조건** | 상세 화면 |
| **data-testid 셀렉터** | |
| - 삭제 버튼 | `[data-testid="delete-btn"]` |
| - 확인 버튼 | `.ant-modal-confirm-btns .ant-btn-primary` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="process-item"]:first-child')` |
| 2 | `await page.click('[data-testid="delete-btn"]')` |
| 3 | `await page.click('.ant-modal-confirm-btns .ant-btn-primary')` |
| **검증 포인트** | 목록에서 해당 공정 제거 확인 |
| **스크린샷** | `e2e-005-delete.png` |
| **관련 요구사항** | FR-005, BR-01 |

```typescript
test('사용자가 공정을 삭제할 수 있다', async ({ page }) => {
  await page.goto('/sample/process-management')
  const firstProcess = await page.locator('[data-testid="process-item"]:first-child').textContent()

  await page.click('[data-testid="process-item"]:first-child')
  await page.click('[data-testid="delete-btn"]')

  // 확인 다이얼로그
  await expect(page.locator('.ant-modal-confirm')).toBeVisible()
  await page.click('.ant-modal-confirm-btns .ant-btn-primary')

  await expect(page.locator('text=삭제되었습니다')).toBeVisible()
  await expect(page.locator(`text=${firstProcess}`)).not.toBeVisible()
  await page.screenshot({ path: 'e2e-005-delete.png' })
})
```

#### E2E-006: 에러 상태

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/process-management.spec.ts` |
| **테스트명** | `test('에러 발생 시 에러 상태가 표시된다')` |
| **사전조건** | 네트워크 오류 시뮬레이션 |
| **data-testid 셀렉터** | |
| - 에러 컨테이너 | `[data-testid="error-state"]` |
| - 재시도 버튼 | `[data-testid="retry-btn"]` |
| **검증 포인트** | `expect(page.locator('[data-testid="error-state"]')).toBeVisible()` |
| **스크린샷** | `e2e-006-error.png` |
| **관련 요구사항** | FR-006 |

```typescript
test('에러 발생 시 에러 상태가 표시된다', async ({ page }) => {
  // 네트워크 오류 시뮬레이션 (mock 파일 제거 또는 에러 상태 설정)
  await page.route('**/processes.json', route => route.abort())
  await page.goto('/sample/process-management')

  await expect(page.locator('[data-testid="error-state"]')).toBeVisible()
  await expect(page.locator('[data-testid="retry-btn"]')).toBeVisible()
  await page.screenshot({ path: 'e2e-006-error.png' })
})
```

#### E2E-007: 변경 이탈 경고

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/process-management.spec.ts` |
| **테스트명** | `test('변경 후 취소 시 경고 다이얼로그가 표시된다')` |
| **사전조건** | 수정 모드, 값 변경 |
| **data-testid 셀렉터** | |
| - 취소 버튼 | `[data-testid="form-cancel-btn"]` |
| **검증 포인트** | 경고 다이얼로그 표시 확인 |
| **스크린샷** | `e2e-007-leave-warning.png` |
| **관련 요구사항** | BR-03 |

```typescript
test('변경 후 취소 시 경고 다이얼로그가 표시된다', async ({ page }) => {
  await page.goto('/sample/process-management')
  await page.click('[data-testid="process-item"]:first-child')
  await page.click('[data-testid="edit-btn"]')
  await page.fill('[data-testid="process-name-input"]', '변경된 값')
  await page.click('[data-testid="form-cancel-btn"]')

  await expect(page.locator('.ant-modal-confirm')).toBeVisible()
  await expect(page.locator('text=저장하지 않은')).toBeVisible()
  await page.screenshot({ path: 'e2e-007-leave-warning.png' })
})
```

#### E2E-008: 중복 코드 오류

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/process-management.spec.ts` |
| **테스트명** | `test('중복 코드 입력 시 에러가 표시된다')` |
| **사전조건** | 등록 모드 |
| **data-testid 셀렉터** | |
| - 에러 메시지 | `.ant-form-item-explain-error` |
| **검증 포인트** | 중복 에러 메시지 표시 확인 |
| **스크린샷** | `e2e-008-duplicate.png` |
| **관련 요구사항** | BR-04 |

```typescript
test('중복 코드 입력 시 에러가 표시된다', async ({ page }) => {
  await page.goto('/sample/process-management')
  await page.click('[data-testid="add-btn"]')
  await page.fill('[data-testid="process-code-input"]', 'PRC001') // 기존 코드
  await page.fill('[data-testid="process-name-input"]', '테스트')
  await page.click('[data-testid="form-submit-btn"]')

  await expect(page.locator('text=이미 사용 중')).toBeVisible()
  await page.screenshot({ path: 'e2e-008-duplicate.png' })
})
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 목록 화면 렌더링 | 로그인 | 1. 페이지 접속 | 검색/테이블/버튼 표시 | High | FR-001, BR-05 |
| TC-002 | 상세 화면 탭 전환 | 상세 화면 | 1. 각 탭 클릭 | 탭 내용 표시 | Medium | FR-002 |
| TC-003 | 등록 폼 유효성 | 등록 모드 | 1. 빈 폼 저장 | 에러 표시 | High | FR-003 |
| TC-004 | 수정 폼 기존값 | 수정 모드 | 1. 수정 클릭 | 기존값 로드 | Medium | FR-004 |
| TC-005 | 삭제 확인 다이얼로그 | 상세 화면 | 1. 삭제 클릭 | 확인 다이얼로그 | High | FR-005 |
| TC-006 | 반응형 레이아웃 | - | 1. 화면 크기 조절 | 레이아웃 적응 | Medium | - |
| TC-007 | 키보드 접근성 | - | 1. Tab 키 탐색 | 모든 요소 접근 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 목록 화면 렌더링

**테스트 목적**: 공정 관리 목록 화면이 정상적으로 렌더링되는지 확인

**테스트 단계**:
1. 로그인 완료
2. 사이드바에서 샘플 > 공정 관리 클릭
3. 목록 화면 표시 확인

**예상 결과**:
- 검색 조건 영역 표시 (공정코드, 공정명, 상태)
- 툴바 영역 표시 (신규, 삭제 버튼)
- 테이블 표시 (컬럼: 공정코드, 공정명, 상태, 설비수, 생성일)
- 비활성 공정은 회색으로 표시 (BR-05)

**검증 기준**:
- [ ] 검색 조건 3개 필드 표시
- [ ] 신규/삭제 버튼 표시
- [ ] 테이블 5개 컬럼 표시
- [ ] 페이지네이션 표시
- [ ] 비활성 공정 회색 스타일

#### TC-002: 상세 화면 탭 전환

**테스트 목적**: 공정 상세 화면의 탭 전환이 정상 동작하는지 확인

**테스트 단계**:
1. 목록에서 공정 행 클릭
2. 상세 화면 표시 확인
3. 각 탭 (기본정보, 설비연결, 이력) 클릭

**예상 결과**:
- 기본정보 탭: Descriptions 컴포넌트로 정보 표시
- 설비연결 탭: 연결된 설비 테이블 표시
- 이력 탭: Timeline 형태로 변경 이력 표시

**검증 기준**:
- [ ] 탭 전환 시 해당 내용 표시
- [ ] 탭 전환 시 깜빡임 없음
- [ ] 데이터 없는 탭에 Empty State 표시

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-PROCESS-01 | 활성 공정 | `{ id: '1', code: 'PRC001', name: '조립', status: 'active', order: 1 }` |
| MOCK-PROCESS-02 | 비활성 공정 | `{ id: '2', code: 'PRC002', name: '도장', status: 'inactive', order: 2 }` |
| MOCK-PROCESS-03 | 설비 연결 공정 | `{ id: '3', ..., equipment: [...], equipmentCount: 3 }` |
| MOCK-EQUIPMENT-01 | 연결 설비 | `{ id: 'EQ001', code: 'EQ001', name: '조립기1', status: 'running' }` |
| MOCK-HISTORY-01 | 변경 이력 | `{ id: 'H001', action: 'update', timestamp: '...', user: '홍길동' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-BASE | 기본 E2E 환경 | mock-data/processes.json | 공정 5개 (활성 3, 비활성 2) |
| SEED-E2E-EMPTY | 빈 환경 | 빈 배열 | 공정 0개 |
| SEED-E2E-DUPLICATE | 중복 테스트용 | 특정 코드 포함 | PRC001 코드 존재 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 전체 기능 테스트 |
| TEST-USER | user@test.com | test1234 | USER | 읽기 전용 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지별 셀렉터

#### 공정 관리 메인 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `process-management-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `search-condition-card` | 검색 조건 카드 | 검색 영역 확인 |
| `process-code-search` | 공정코드 검색 입력 | 검색 기능 |
| `process-name-search` | 공정명 검색 입력 | 검색 기능 |
| `process-status-select` | 상태 선택 | 필터링 기능 |
| `search-btn` | 검색 버튼 | 검색 실행 |
| `reset-btn` | 초기화 버튼 | 검색 초기화 |
| `add-btn` | 신규 버튼 | 등록 폼 열기 |
| `delete-btn` | 삭제 버튼 | 선택 항목 삭제 |

#### 공정 목록 테이블

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `process-list` | 테이블 컨테이너 | 목록 표시 확인 |
| `process-item` | 테이블 행 | 행 개수 확인 |
| `process-item-{id}` | 특정 행 | 특정 행 선택 |
| `loading-spinner` | 로딩 스피너 | 로딩 상태 |
| `empty-state` | 빈 상태 | Empty 표시 |
| `error-state` | 에러 상태 | Error 표시 |
| `retry-btn` | 재시도 버튼 | 재로딩 |

#### 공정 상세 화면

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `process-detail` | 상세 컨테이너 | 상세 화면 확인 |
| `process-descriptions` | 기본 정보 | Descriptions 확인 |
| `process-tabs` | 탭 컨테이너 | 탭 확인 |
| `tab-basic` | 기본정보 탭 | 탭 선택 |
| `tab-equipment` | 설비연결 탭 | 탭 선택 |
| `tab-history` | 이력 탭 | 탭 선택 |
| `edit-btn` | 수정 버튼 | 수정 모드 전환 |
| `delete-btn` | 삭제 버튼 | 삭제 실행 |
| `back-btn` | 목록으로 버튼 | 목록 복귀 |

#### 공정 등록/수정 폼

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `process-form` | 폼 컨테이너 | 폼 확인 |
| `process-code-input` | 공정코드 입력 | 코드 입력 |
| `process-name-input` | 공정명 입력 | 이름 입력 |
| `process-status-radio` | 상태 라디오 그룹 | 상태 선택 |
| `process-status-radio-active` | 활성 라디오 | 활성 선택 |
| `process-status-radio-inactive` | 비활성 라디오 | 비활성 선택 |
| `process-order-input` | 순서 입력 | 순서 입력 |
| `process-description-input` | 설명 입력 | 설명 입력 |
| `form-submit-btn` | 저장 버튼 | 저장 실행 |
| `form-cancel-btn` | 취소 버튼 | 취소/복귀 |

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
| 주요 사용자 시나리오 (CRUD) | 100% |
| 기능 요구사항 (FR) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

---

## 관련 문서

- 설계: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- 화면 설계: `011-ui-design.md`

---

<!--
author: Claude
Template Version History:
- v1.0.0 (2026-01-22): TSK-06-18 공정 관리 샘플용 작성
-->
