# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0

> **목적**: 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-12 |
| Task명 | [샘플] 품질 검사 입력 폼 |
| 설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-22 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | 컴포넌트 렌더링, 이벤트 핸들러, 유틸리티 함수 | 80% 이상 |
| E2E 테스트 | 주요 사용자 시나리오 (검사 유형별 입력, 제출) | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + @testing-library/react |
| 테스트 프레임워크 (E2E) | Playwright |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

### 1.3 테스트 대상 컴포넌트

| 컴포넌트 | 파일 경로 | 테스트 파일 |
|----------|----------|------------|
| QualityInspection | `screens/sample/QualityInspection/QualityInspection.tsx` | `__tests__/QualityInspection.test.tsx` |
| DimensionInspection | `screens/sample/QualityInspection/DimensionInspection.tsx` | `__tests__/DimensionInspection.test.tsx` |
| AppearanceInspection | `screens/sample/QualityInspection/AppearanceInspection.tsx` | `__tests__/AppearanceInspection.test.tsx` |
| FunctionInspection | `screens/sample/QualityInspection/FunctionInspection.tsx` | `__tests__/FunctionInspection.test.tsx` |
| InspectionPreview | `screens/sample/QualityInspection/InspectionPreview.tsx` | `__tests__/InspectionPreview.test.tsx` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | QualityInspection | 검사 유형 변경 시 폼 필드 변경 | 해당 유형 필드만 표시 | FR-001, BR-01 |
| UT-002 | DimensionInspection | 측정값 입력 시 자동 판정 | 합격/불합격 태그 표시 | FR-002, BR-03 |
| UT-003 | Form.List | 항목 추가 | 새 항목 추가됨 | FR-003 |
| UT-004 | Form.List | 항목 삭제 | 해당 항목 삭제됨 | FR-003 |
| UT-005 | AppearanceInspection | 불합격 선택 시 조건부 필드 | 불량 상세 필드 표시 | FR-004, BR-02 |
| UT-006 | Upload | 이미지 업로드 유효성 | JPG/PNG만 허용, 5MB 제한 | FR-005, BR-06 |
| UT-007 | InspectionPreview | 미리보기 데이터 표시 | 폼 데이터 요약 표시 | FR-006 |
| UT-008 | QualityInspection | 저장 버튼 클릭 | 유효성 검사 후 저장 호출 | FR-007 |
| UT-009 | QualityInspection | 초기화 버튼 클릭 | 폼 리셋 | FR-008 |
| UT-010 | QualityInspection | 검사 유형별 조건부 렌더링 | 치수/외관/기능 필드 분기 | BR-01 |
| UT-011 | Form validation | 불합격 시 필수 필드 검증 | 불량유형/불량사유 필수 에러 | BR-02 |
| UT-012 | DimensionInspection | 허용오차 기준 판정 계산 | 범위 내=합격, 범위 밖=불합격 | BR-03 |
| UT-013 | Form.List | 마지막 항목 삭제 불가 | 삭제 버튼 비활성화 | BR-04 |
| UT-014 | Form.List | 최대 10개 제한 | 10개 초과 시 추가 버튼 비활성화 | BR-05 |
| UT-015 | Upload | 이미지 5개/5MB 제한 | 초과 시 에러 메시지 | BR-06 |

### 2.2 테스트 케이스 상세

#### UT-001: 검사 유형 변경 시 폼 필드 변경

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/QualityInspection.test.tsx` |
| **테스트 블록** | `describe('QualityInspection') → describe('검사 유형 선택') → it('치수 검사 선택 시 치수 필드 표시')` |
| **Mock 의존성** | - |
| **입력 데이터** | Segmented 'dimension' 선택 |
| **검증 포인트** | `data-testid="dimension-items-list"` visible, `data-testid="appearance-items-list"` not exist |
| **커버리지 대상** | 조건부 렌더링 로직 |
| **관련 요구사항** | FR-001, BR-01 |

```typescript
it('치수 검사 선택 시 치수 필드만 표시된다', async () => {
  render(<QualityInspection />);

  // 치수 검사가 기본 선택됨
  expect(screen.getByTestId('dimension-items-list')).toBeInTheDocument();
  expect(screen.queryByTestId('appearance-items-list')).not.toBeInTheDocument();

  // 외관 검사로 변경
  await userEvent.click(screen.getByText('외관 검사'));

  expect(screen.queryByTestId('dimension-items-list')).not.toBeInTheDocument();
  expect(screen.getByTestId('appearance-items-list')).toBeInTheDocument();
});
```

#### UT-002: 측정값 입력 시 자동 판정

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/DimensionInspection.test.tsx` |
| **테스트 블록** | `describe('DimensionInspection') → describe('자동 판정') → it('허용오차 내 측정값은 합격')` |
| **Mock 의존성** | Form context |
| **입력 데이터** | 기준값: 100, 허용오차: ±0.5, 측정값: 100.3 |
| **검증 포인트** | `data-testid="result-tag-0"` 합격 태그 표시 |
| **커버리지 대상** | 자동 판정 계산 로직 |
| **관련 요구사항** | FR-002, BR-03 |

```typescript
it('측정값이 허용오차 범위 내이면 합격으로 판정된다', async () => {
  render(<DimensionInspection form={mockForm} />);

  await userEvent.type(screen.getByTestId('standard-value-0'), '100');
  await userEvent.type(screen.getByTestId('tolerance-0'), '±0.5');
  await userEvent.type(screen.getByTestId('measured-value-0'), '100.3');

  await waitFor(() => {
    expect(screen.getByTestId('result-tag-0')).toHaveTextContent('합격');
    expect(screen.getByTestId('result-tag-0')).toHaveClass('ant-tag-success');
  });
});
```

#### UT-003: 항목 추가

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/DimensionInspection.test.tsx` |
| **테스트 블록** | `describe('DimensionInspection') → describe('Form.List') → it('항목 추가 버튼 클릭 시 새 항목 추가')` |
| **Mock 의존성** | Form context |
| **입력 데이터** | 항목 추가 버튼 클릭 |
| **검증 포인트** | 항목 개수 증가 |
| **커버리지 대상** | Form.List add() |
| **관련 요구사항** | FR-003 |

```typescript
it('항목 추가 버튼 클릭 시 새 항목이 추가된다', async () => {
  render(<DimensionInspection form={mockForm} />);

  const initialItems = screen.getAllByTestId(/^dimension-item-/);
  expect(initialItems).toHaveLength(1);

  await userEvent.click(screen.getByTestId('add-item-btn'));

  const updatedItems = screen.getAllByTestId(/^dimension-item-/);
  expect(updatedItems).toHaveLength(2);
});
```

#### UT-005: 불합격 선택 시 조건부 필드

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/AppearanceInspection.test.tsx` |
| **테스트 블록** | `describe('AppearanceInspection') → describe('조건부 필드') → it('불합격 선택 시 불량 상세 필드 표시')` |
| **Mock 의존성** | Form context |
| **입력 데이터** | 검사결과 '불합격' 라디오 선택 |
| **검증 포인트** | `data-testid="defect-fields-0"` visible |
| **커버리지 대상** | 조건부 렌더링 로직 |
| **관련 요구사항** | FR-004, BR-02 |

```typescript
it('불합격 선택 시 불량 상세 필드가 표시된다', async () => {
  render(<AppearanceInspection form={mockForm} />);

  // 초기 상태: 불량 필드 없음
  expect(screen.queryByTestId('defect-fields-0')).not.toBeInTheDocument();

  // 불합격 선택
  await userEvent.click(screen.getByTestId('result-fail-0'));

  // 불량 상세 필드 표시
  await waitFor(() => {
    expect(screen.getByTestId('defect-fields-0')).toBeInTheDocument();
    expect(screen.getByTestId('defect-type-0')).toBeInTheDocument();
    expect(screen.getByTestId('defect-reason-0')).toBeInTheDocument();
  });
});
```

#### UT-012: 허용오차 기준 판정 계산

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/DimensionInspection.test.tsx` |
| **테스트 블록** | `describe('DimensionInspection') → describe('자동 판정') → it('허용오차 범위 밖 측정값은 불합격')` |
| **Mock 의존성** | Form context |
| **입력 데이터** | 기준값: 100, 허용오차: ±0.5, 측정값: 100.8 |
| **검증 포인트** | 불합격 태그 표시 |
| **커버리지 대상** | 판정 계산 로직 |
| **관련 요구사항** | BR-03 |

```typescript
it('측정값이 허용오차 범위 밖이면 불합격으로 판정된다', async () => {
  render(<DimensionInspection form={mockForm} />);

  await userEvent.type(screen.getByTestId('standard-value-0'), '100');
  await userEvent.type(screen.getByTestId('tolerance-0'), '±0.5');
  await userEvent.type(screen.getByTestId('measured-value-0'), '100.8');

  await waitFor(() => {
    expect(screen.getByTestId('result-tag-0')).toHaveTextContent('불합격');
    expect(screen.getByTestId('result-tag-0')).toHaveClass('ant-tag-error');
  });
});
```

#### UT-013: 마지막 항목 삭제 불가

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/DimensionInspection.test.tsx` |
| **테스트 블록** | `describe('DimensionInspection') → describe('Form.List') → it('마지막 항목의 삭제 버튼은 비활성화')` |
| **Mock 의존성** | Form context |
| **입력 데이터** | 항목 1개만 존재 |
| **검증 포인트** | 삭제 버튼 disabled |
| **커버리지 대상** | 최소 항목 수 검증 |
| **관련 요구사항** | BR-04 |

```typescript
it('마지막 항목의 삭제 버튼은 비활성화된다', async () => {
  render(<DimensionInspection form={mockForm} />);

  const items = screen.getAllByTestId(/^dimension-item-/);
  expect(items).toHaveLength(1);

  const deleteBtn = screen.getByTestId('remove-item-btn-0');
  expect(deleteBtn).toBeDisabled();
});
```

#### UT-014: 최대 10개 제한

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/DimensionInspection.test.tsx` |
| **테스트 블록** | `describe('DimensionInspection') → describe('Form.List') → it('10개 항목 시 추가 버튼 비활성화')` |
| **Mock 의존성** | Form context (10개 항목 초기화) |
| **입력 데이터** | 10개 항목 상태 |
| **검증 포인트** | 추가 버튼 disabled |
| **커버리지 대상** | 최대 항목 수 검증 |
| **관련 요구사항** | BR-05 |

```typescript
it('10개 항목일 때 추가 버튼이 비활성화된다', async () => {
  // 10개 항목으로 초기화
  mockForm.setFieldsValue({
    dimensionItems: Array(10).fill({
      position: 'A',
      standardValue: 100,
      tolerance: '±0.5',
      measuredValue: 100
    })
  });

  render(<DimensionInspection form={mockForm} />);

  const addBtn = screen.getByTestId('add-item-btn');
  expect(addBtn).toBeDisabled();
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 검사 유형 변경 | 페이지 로드 | 유형 선택 변경 | 해당 필드 표시 | FR-001, BR-01 |
| E2E-002 | 치수 검사 입력 | 치수 검사 선택 | 측정값 입력 | 자동 판정 표시 | FR-002, BR-03 |
| E2E-003 | 항목 추가/삭제 | 페이지 로드 | 추가/삭제 클릭 | 항목 수 변경 | FR-003, BR-04, BR-05 |
| E2E-004 | 조건부 필드 | 외관 검사 선택 | 불합격 선택 | 불량 필드 표시 | FR-004, BR-02 |
| E2E-005 | 이미지 업로드 | 페이지 로드 | 이미지 드래그 | 미리보기 표시 | FR-005, BR-06 |
| E2E-006 | 미리보기 | 폼 입력 완료 | 미리보기 클릭 | 모달에 데이터 요약 | FR-006 |
| E2E-007 | 저장 | 폼 입력 완료 | 저장 클릭 | 성공 토스트 | FR-007, BR-04 |
| E2E-008 | 초기화 | 폼 입력 상태 | 초기화 클릭 | 폼 리셋 | FR-008 |

### 3.2 테스트 케이스 상세

#### E2E-001: 검사 유형 변경

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/quality-inspection.spec.ts` |
| **테스트명** | `test('검사 유형 변경 시 해당 필드가 표시된다')` |
| **사전조건** | 로그인 상태 |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="quality-inspection-page"]` |
| - 검사 유형 선택 | `[data-testid="inspection-type-selector"]` |
| - 치수 검사 필드 | `[data-testid="dimension-items-list"]` |
| - 외관 검사 필드 | `[data-testid="appearance-items-list"]` |
| **실행 단계** | |
| 1 | 페이지 접속 |
| 2 | 치수 검사 필드 표시 확인 |
| 3 | 외관 검사 선택 |
| 4 | 외관 검사 필드 표시 확인 |
| **검증 포인트** | 검사 유형에 따른 필드 전환 |
| **스크린샷** | `e2e-001-dimension.png`, `e2e-001-appearance.png` |
| **관련 요구사항** | FR-001, BR-01 |

```typescript
test('검사 유형 변경 시 해당 필드가 표시된다', async ({ page }) => {
  await page.goto('/sample/quality-inspection');

  // 치수 검사 (기본)
  await expect(page.getByTestId('dimension-items-list')).toBeVisible();
  await expect(page.getByTestId('appearance-items-list')).not.toBeVisible();
  await page.screenshot({ path: 'e2e-001-dimension.png' });

  // 외관 검사 선택
  await page.getByTestId('inspection-type-selector').getByText('외관 검사').click();

  await expect(page.getByTestId('dimension-items-list')).not.toBeVisible();
  await expect(page.getByTestId('appearance-items-list')).toBeVisible();
  await page.screenshot({ path: 'e2e-001-appearance.png' });
});
```

#### E2E-002: 치수 검사 입력 및 자동 판정

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/quality-inspection.spec.ts` |
| **테스트명** | `test('치수 검사 입력 시 자동 판정이 표시된다')` |
| **사전조건** | 로그인 상태, 치수 검사 선택 |
| **data-testid 셀렉터** | |
| - 측정위치 입력 | `[data-testid="position-0"]` |
| - 기준값 입력 | `[data-testid="standard-value-0"]` |
| - 허용오차 입력 | `[data-testid="tolerance-0"]` |
| - 측정값 입력 | `[data-testid="measured-value-0"]` |
| - 판정 태그 | `[data-testid="result-tag-0"]` |
| **실행 단계** | |
| 1 | 측정위치 입력: "A" |
| 2 | 기준값 입력: 100 |
| 3 | 허용오차 입력: ±0.5 |
| 4 | 측정값 입력: 100.3 |
| 5 | 판정 확인: 합격 |
| **검증 포인트** | 자동 판정 결과 표시 |
| **스크린샷** | `e2e-002-pass.png`, `e2e-002-fail.png` |
| **관련 요구사항** | FR-002, BR-03 |

```typescript
test('치수 검사 입력 시 자동 판정이 표시된다', async ({ page }) => {
  await page.goto('/sample/quality-inspection');

  // 합격 케이스
  await page.getByTestId('position-0').fill('A');
  await page.getByTestId('standard-value-0').fill('100');
  await page.getByTestId('tolerance-0').fill('±0.5');
  await page.getByTestId('measured-value-0').fill('100.3');

  await expect(page.getByTestId('result-tag-0')).toHaveText('합격');
  await page.screenshot({ path: 'e2e-002-pass.png' });

  // 불합격 케이스
  await page.getByTestId('measured-value-0').clear();
  await page.getByTestId('measured-value-0').fill('100.8');

  await expect(page.getByTestId('result-tag-0')).toHaveText('불합격');
  await page.screenshot({ path: 'e2e-002-fail.png' });
});
```

#### E2E-003: 항목 추가/삭제

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/quality-inspection.spec.ts` |
| **테스트명** | `test('검사 항목을 추가하고 삭제할 수 있다')` |
| **사전조건** | 페이지 로드 |
| **data-testid 셀렉터** | |
| - 항목 추가 버튼 | `[data-testid="add-item-btn"]` |
| - 항목 삭제 버튼 | `[data-testid="remove-item-btn-{index}"]` |
| **실행 단계** | |
| 1 | 항목 1개 확인 |
| 2 | 항목 추가 클릭 (2개) |
| 3 | 첫 번째 항목 삭제 클릭 |
| 4 | 항목 1개 확인 |
| 5 | 마지막 항목 삭제 버튼 비활성화 확인 |
| **검증 포인트** | 항목 추가/삭제 동작, 최소 1개 유지 |
| **스크린샷** | `e2e-003-add.png`, `e2e-003-delete.png` |
| **관련 요구사항** | FR-003, BR-04, BR-05 |

```typescript
test('검사 항목을 추가하고 삭제할 수 있다', async ({ page }) => {
  await page.goto('/sample/quality-inspection');

  // 초기 1개
  await expect(page.getByTestId('dimension-item-0')).toBeVisible();

  // 항목 추가
  await page.getByTestId('add-item-btn').click();
  await expect(page.getByTestId('dimension-item-1')).toBeVisible();
  await page.screenshot({ path: 'e2e-003-add.png' });

  // 항목 삭제
  await page.getByTestId('remove-item-btn-0').click();
  await expect(page.getByTestId('dimension-item-1')).not.toBeVisible();

  // 마지막 항목 삭제 불가
  await expect(page.getByTestId('remove-item-btn-0')).toBeDisabled();
  await page.screenshot({ path: 'e2e-003-delete.png' });
});
```

#### E2E-004: 조건부 필드

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/quality-inspection.spec.ts` |
| **테스트명** | `test('불합격 선택 시 불량 상세 필드가 표시된다')` |
| **사전조건** | 외관 검사 선택 |
| **data-testid 셀렉터** | |
| - 불합격 라디오 | `[data-testid="result-fail-0"]` |
| - 불량 상세 필드 | `[data-testid="defect-fields-0"]` |
| - 불량유형 선택 | `[data-testid="defect-type-0"]` |
| - 불량사유 입력 | `[data-testid="defect-reason-0"]` |
| **실행 단계** | |
| 1 | 외관 검사 선택 |
| 2 | 불합격 라디오 선택 |
| 3 | 불량 필드 표시 확인 |
| 4 | 합격 라디오 선택 |
| 5 | 불량 필드 숨김 확인 |
| **검증 포인트** | 조건부 필드 표시/숨김 |
| **스크린샷** | `e2e-004-fail.png`, `e2e-004-pass.png` |
| **관련 요구사항** | FR-004, BR-02 |

```typescript
test('불합격 선택 시 불량 상세 필드가 표시된다', async ({ page }) => {
  await page.goto('/sample/quality-inspection');

  // 외관 검사 선택
  await page.getByTestId('inspection-type-selector').getByText('외관 검사').click();

  // 초기 상태: 불량 필드 없음
  await expect(page.getByTestId('defect-fields-0')).not.toBeVisible();

  // 불합격 선택
  await page.getByTestId('result-fail-0').click();
  await expect(page.getByTestId('defect-fields-0')).toBeVisible();
  await page.screenshot({ path: 'e2e-004-fail.png' });

  // 합격으로 변경
  await page.getByTestId('result-pass-0').click();
  await expect(page.getByTestId('defect-fields-0')).not.toBeVisible();
  await page.screenshot({ path: 'e2e-004-pass.png' });
});
```

#### E2E-007: 저장

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/quality-inspection.spec.ts` |
| **테스트명** | `test('유효한 데이터 저장 시 성공 메시지가 표시된다')` |
| **사전조건** | 필수 필드 입력 완료 |
| **data-testid 셀렉터** | |
| - 제품코드 | `[data-testid="product-code-input"]` |
| - 로트번호 | `[data-testid="lot-number-input"]` |
| - 저장 버튼 | `[data-testid="submit-btn"]` |
| **실행 단계** | |
| 1 | 제품코드, 로트번호, 검사일시 입력 |
| 2 | 측정 항목 입력 |
| 3 | 저장 버튼 클릭 |
| 4 | 성공 토스트 확인 |
| **검증 포인트** | 저장 성공 후 메시지 표시 |
| **스크린샷** | `e2e-007-success.png` |
| **관련 요구사항** | FR-007, BR-04 |

```typescript
test('유효한 데이터 저장 시 성공 메시지가 표시된다', async ({ page }) => {
  await page.goto('/sample/quality-inspection');

  // 기본 정보 입력
  await page.getByTestId('product-code-input').fill('PROD-001');
  await page.getByTestId('lot-number-input').fill('LOT-20260122-001');

  // 측정 항목 입력
  await page.getByTestId('position-0').fill('A');
  await page.getByTestId('standard-value-0').fill('100');
  await page.getByTestId('tolerance-0').fill('±0.5');
  await page.getByTestId('measured-value-0').fill('100.3');

  // 저장
  await page.getByTestId('submit-btn').click();

  // 성공 메시지 확인
  await expect(page.getByText('저장되었습니다')).toBeVisible();
  await page.screenshot({ path: 'e2e-007-success.png' });
});
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 검사 유형 전환 | 페이지 로드 | Segmented 클릭 | 해당 필드 표시 | High | FR-001 |
| TC-002 | 자동 판정 표시 | 치수 검사 | 측정값 입력 | 합격/불합격 태그 | High | FR-002, BR-03 |
| TC-003 | 반복 항목 관리 | 페이지 로드 | 추가/삭제 | 항목 수 변경 | High | FR-003 |
| TC-004 | 조건부 필드 | 외관 검사 | 불합격 선택 | 불량 필드 표시 | High | FR-004, BR-02 |
| TC-005 | 이미지 업로드 | 페이지 로드 | 드래그 앤 드롭 | 미리보기 표시 | Medium | FR-005, BR-06 |
| TC-006 | 미리보기 모달 | 폼 입력 완료 | 미리보기 클릭 | 데이터 요약 표시 | Medium | FR-006 |
| TC-007 | 저장 성공 | 폼 입력 완료 | 저장 클릭 | 성공 토스트 | High | FR-007 |
| TC-008 | 폼 초기화 | 폼 입력 상태 | 초기화 클릭 | 폼 리셋 | Medium | FR-008 |
| TC-009 | 반응형 (모바일) | - | 화면 크기 조절 | 1열 레이아웃 | Medium | - |
| TC-010 | 접근성 (키보드) | - | Tab 키 탐색 | 모든 요소 접근 가능 | Low | - |
| TC-011 | 유효성 검사 에러 | 빈 폼 | 저장 클릭 | 필드 에러 표시 | High | - |

### 4.2 매뉴얼 테스트 상세

#### TC-002: 자동 판정 표시

**테스트 목적**: 치수 검사에서 측정값 입력 시 허용오차 기준으로 자동 판정이 표시되는지 확인

**테스트 단계**:
1. 품질 검사 입력 페이지 접속
2. 치수 검사 선택 (기본)
3. 기준값 "100", 허용오차 "±0.5" 입력
4. 측정값 "100.3" 입력
5. 판정 태그 확인: 녹색 "합격"
6. 측정값 "100.8" 로 변경
7. 판정 태그 확인: 빨간색 "불합격"

**예상 결과**:
- 측정값이 기준값 ± 허용오차 범위 내: 합격 (녹색)
- 측정값이 범위 밖: 불합격 (빨간색)

**검증 기준**:
- [ ] 합격 판정 시 녹색 태그 표시
- [ ] 불합격 판정 시 빨간색 태그 표시
- [ ] 측정값 변경 시 즉시 판정 갱신

#### TC-003: 반복 항목 관리

**테스트 목적**: Form.List를 통한 검사 항목 추가/삭제가 정상 동작하는지 확인

**테스트 단계**:
1. 품질 검사 입력 페이지 접속
2. 초기 항목 1개 확인
3. [항목 추가] 버튼 클릭 → 2개 확인
4. 3번 더 클릭 → 5개 확인
5. 두 번째 항목 [삭제] 클릭 → 4개 확인
6. 마지막 1개까지 삭제 시도
7. 마지막 항목의 삭제 버튼 비활성화 확인
8. 10개까지 추가 후 [항목 추가] 버튼 비활성화 확인

**예상 결과**:
- 최소 1개 항목 필수 (삭제 버튼 비활성화)
- 최대 10개 항목 제한 (추가 버튼 비활성화)

**검증 기준**:
- [ ] 항목 추가 시 새 행 표시
- [ ] 항목 삭제 시 해당 행 제거
- [ ] 최소 1개 유지
- [ ] 최대 10개 제한

#### TC-009: 반응형 (모바일)

**테스트 목적**: 모바일 환경에서 레이아웃이 적절히 변환되는지 확인

**테스트 단계**:
1. 브라우저 개발자 도구 열기
2. 모바일 뷰포트 설정 (375px)
3. 기본 정보 섹션 1열 배치 확인
4. 측정 항목 수직 나열 확인
5. 버튼 영역 가로 스크롤 없이 표시 확인

**예상 결과**:
- 모든 필드 1열 수직 배치
- 터치 친화적 버튼 크기
- 가로 스크롤 없음

**검증 기준**:
- [ ] 1열 레이아웃으로 변환
- [ ] 버튼 터치 가능 크기 (최소 44px)
- [ ] 수평 스크롤 없음

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-FORM-EMPTY | 빈 폼 상태 | `{ inspectionType: 'dimension', productCode: '', lotNumber: '', dimensionItems: [] }` |
| MOCK-FORM-DIMENSION | 치수 검사 데이터 | `{ inspectionType: 'dimension', dimensionItems: [{ position: 'A', standardValue: 100, tolerance: '±0.5', measuredValue: 100.3 }] }` |
| MOCK-FORM-APPEARANCE-FAIL | 외관 검사 불합격 | `{ inspectionType: 'appearance', appearanceItems: [{ area: '외부 표면', result: 'fail', defectType: 'surface' }] }` |
| MOCK-DEFECT-TYPES | 불량유형 목록 | `[{ value: 'surface', label: '표면불량' }, ...]` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 포함 데이터 |
|---------|------|------------|
| SEED-E2E-BASE | 기본 E2E 환경 | 로그인 사용자, Mock 데이터 로드 |
| SEED-E2E-EMPTY | 빈 폼 테스트 | 로그인 사용자, 빈 폼 상태 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 기능 테스트 |

---

## 6. data-testid 목록

### 6.1 페이지별 셀렉터

#### 품질 검사 입력 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `quality-inspection-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `inspection-type-selector` | Segmented | 검사 유형 선택 |
| `product-code-input` | 제품코드 입력 | 기본 정보 입력 |
| `lot-number-input` | 로트번호 입력 | 기본 정보 입력 |
| `inspection-date-picker` | 검사일시 선택 | 날짜 선택 |

#### 치수 검사 섹션

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `dimension-items-list` | Form.List 컨테이너 | 치수 항목 목록 |
| `dimension-item-{index}` | 개별 항목 카드 | 항목 식별 |
| `position-{index}` | 측정위치 입력 | 필드 입력 |
| `standard-value-{index}` | 기준값 입력 | 필드 입력 |
| `tolerance-{index}` | 허용오차 입력 | 필드 입력 |
| `measured-value-{index}` | 측정값 입력 | 필드 입력 |
| `result-tag-{index}` | 판정 태그 | 자동 판정 확인 |
| `add-item-btn` | 항목 추가 버튼 | Form.List 추가 |
| `remove-item-btn-{index}` | 항목 삭제 버튼 | Form.List 삭제 |

#### 외관 검사 섹션

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `appearance-items-list` | Form.List 컨테이너 | 외관 항목 목록 |
| `appearance-item-{index}` | 개별 항목 카드 | 항목 식별 |
| `area-{index}` | 검사부위 선택 | 필드 입력 |
| `check-item-{index}` | 검사항목 선택 | 필드 입력 |
| `result-pass-{index}` | 합격 라디오 | 검사 결과 |
| `result-fail-{index}` | 불합격 라디오 | 검사 결과 |
| `defect-fields-{index}` | 불량 상세 영역 | 조건부 필드 |
| `defect-type-{index}` | 불량유형 선택 | 조건부 필드 |
| `defect-reason-{index}` | 불량사유 입력 | 조건부 필드 |
| `action-{index}` | 조치사항 입력 | 조건부 필드 |

#### 공통 요소

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `image-upload` | Upload.Dragger | 이미지 업로드 |
| `remarks-input` | 비고 TextArea | 비고 입력 |
| `preview-btn` | 미리보기 버튼 | 미리보기 |
| `cancel-btn` | 취소 버튼 | 취소 |
| `reset-btn` | 초기화 버튼 | 폼 리셋 |
| `submit-btn` | 저장 버튼 | 저장 |
| `preview-modal` | 미리보기 모달 | 미리보기 |

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
| 기능 요구사항 (FR) | 100% 커버 (8/8) |
| 비즈니스 규칙 (BR) | 100% 커버 (6/6) |
| 에러 케이스 | 80% 커버 |

---

## 관련 문서

- 설계서: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md` (섹션 4.1.1)

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-22 | Claude | 최초 작성 |
