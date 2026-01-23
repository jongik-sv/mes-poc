# 구현 보고서 (030-implementation.md)

**Task ID:** TSK-06-16
**Task명:** [샘플] 작업 지시 등록
**구현일:** 2026-01-23
**상태:** [im] → [vf] (검증 완료)

---

## 1. 구현 요약

| 항목 | 내용 |
|------|------|
| 구현 범위 | Frontend Only |
| 주요 컴포넌트 | WorkOrderForm |
| 템플릿 활용 | FormTemplate, SelectPopupTemplate |
| 테스트 결과 | 단위 8/8 PASS, E2E 7/7 PASS |

---

## 2. 구현 파일 목록

### 2.1 신규 생성 파일

| 파일 경로 | 설명 | 줄 수 |
|----------|------|------|
| `mock-data/products.json` | 제품 및 생산 라인 Mock 데이터 | ~60 |
| `screens/sample/WorkOrderForm/types.ts` | 타입 정의 | ~35 |
| `screens/sample/WorkOrderForm/index.tsx` | 메인 컴포넌트 | ~250 |
| `app/(portal)/sample/work-order-form/page.tsx` | 페이지 라우트 | ~10 |
| `screens/sample/WorkOrderForm/__tests__/WorkOrderForm.spec.tsx` | 단위 테스트 | ~150 |
| `tests/e2e/work-order-form.spec.ts` | E2E 테스트 | ~190 |

### 2.2 수정 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `lib/mdi/screenRegistry.ts` | `/sample/work-order-form` 경로 등록 |
| `mock-data/menus.json` | 작업 지시 등록 메뉴 항목 추가 |

---

## 3. 요구사항 구현 매핑

### 3.1 기능 요구사항 (FR)

| 요구사항 | 구현 위치 | 구현 방법 | 상태 |
|----------|----------|----------|------|
| FR-001 폼 렌더링 | `WorkOrderForm/index.tsx` | FormTemplate 활용 | DONE |
| FR-002 제품 선택 | `WorkOrderForm/index.tsx` L90-150 | SelectPopupTemplate 통합 | DONE |
| FR-003 저장 확인 | `WorkOrderForm/index.tsx` handleSubmit | Modal.confirm 사용 | DONE |
| FR-004 저장 성공 | `WorkOrderForm/index.tsx` handleSubmit | showSuccess Toast | DONE |
| FR-005 유효성 검사 | `WorkOrderForm/index.tsx` Form rules | Ant Design Form 검증 | DONE |

### 3.2 비즈니스 규칙 (BR)

| 규칙 | 구현 위치 | 구현 방법 | 상태 |
|------|----------|----------|------|
| BR-01 저장 전 확인 | handleSubmit | Modal.confirm 다이얼로그 | DONE |
| BR-02 필수 필드 | Form rules | `required: true` 규칙 | DONE |
| BR-03 날짜 검증 | endDate validator | 커스텀 validator 함수 | DONE |
| BR-04 수량 범위 | quantity rules | `min: 1, max: 99999` | DONE |
| BR-05 취소 확인 | FormTemplate | `enableDirtyCheck` prop | DONE |

---

## 4. 주요 구현 패턴

### 4.1 FormTemplate 활용

```tsx
<FormTemplate
  title="작업 지시 등록"
  form={form}
  onSubmit={handleSubmit}
  onCancel={onCancel}
  enableDirtyCheck={true}
  submitText="저장"
  cancelText="취소"
>
  {/* 폼 필드들 */}
</FormTemplate>
```

**특징:**
- 일관된 폼 레이아웃 및 스타일
- 내장 dirty check 기능 (BR-05)
- 저장/취소 버튼 자동 생성

### 4.2 SelectPopupTemplate 활용

```tsx
<SelectPopupTemplate<Product>
  open={showProductPopup}
  title="제품 선택"
  columns={productColumns}
  dataSource={filteredProducts}
  rowKey="code"
  selectedRowKeys={selectedProduct ? [selectedProduct.code] : []}
  onSelect={(keys, rows) => handleProductSelect(rows[0])}
  onConfirm={handleProductConfirm}
  onCancel={() => setShowProductPopup(false)}
  searchPlaceholder="제품명 또는 코드로 검색"
  onSearch={handleProductSearch}
/>
```

**특징:**
- 재사용 가능한 검색+선택 팝업
- 테이블 기반 데이터 표시
- 검색/필터링 기능 내장

### 4.3 폼 유효성 검사

```tsx
// 날짜 범위 커스텀 검증 (BR-03)
const validateEndDate = (_: unknown, value: dayjs.Dayjs | null) => {
  const startDate = form.getFieldValue('startDate')
  if (value && startDate && value.isBefore(startDate, 'day')) {
    return Promise.reject('종료일은 시작일 이후여야 합니다')
  }
  return Promise.resolve()
}
```

---

## 5. data-testid 목록

### 5.1 페이지 레벨

| data-testid | 요소 |
|-------------|------|
| `work-order-form-page` | 페이지 컨테이너 |
| `form-template` | FormTemplate 컨테이너 |

### 5.2 폼 필드

| data-testid | 요소 |
|-------------|------|
| `product-code-input` | 제품 코드 입력 (읽기 전용) |
| `product-name-input` | 제품명 입력 (읽기 전용) |
| `product-select-btn` | 제품 선택 버튼 |
| `quantity-input` | 수량 입력 |
| `line-select` | 생산 라인 선택 |
| `start-date` | 시작일 |
| `end-date` | 종료일 |
| `remarks-input` | 비고 |

### 5.3 액션 버튼 (FormTemplate 제공)

| data-testid | 요소 |
|-------------|------|
| `form-submit-btn` | 저장 버튼 |
| `form-cancel-btn` | 취소 버튼 |

---

## 6. 테스트 결과 요약

### 6.1 단위 테스트

| 항목 | 결과 |
|------|------|
| 전체 | 8/8 PASS |
| 실행 시간 | 10.34초 |
| 파일 | `WorkOrderForm/__tests__/WorkOrderForm.spec.tsx` |

### 6.2 E2E 테스트

| 항목 | 결과 |
|------|------|
| 전체 | 7/7 PASS |
| 실행 시간 | 38.3초 |
| 파일 | `tests/e2e/work-order-form.spec.ts` |

---

## 7. 알려진 이슈 및 제한사항

| 이슈 | 설명 | 영향 | 대응 |
|------|------|------|------|
| Mock 데이터 | 실제 API 미연동 | 개발/테스트 환경 | 향후 API 연동 시 교체 |
| Toast 테스트 | 단위 테스트에서 Toast 검증 어려움 | 테스트 커버리지 | E2E로 보완 |

---

## 8. 향후 개선 사항

1. **API 연동**: 실제 백엔드 API 연동 시 데이터 fetching 로직 추가
2. **에러 처리**: 네트워크 오류 등 예외 상황 처리 강화
3. **로딩 상태**: 저장 중 로딩 인디케이터 추가

---

## 관련 문서

- 설계: `010-design.md`
- UI 설계: `011-ui-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- 테스트 명세: `026-test-specification.md`
- TDD 결과: `070-tdd-test-results.md`
- E2E 결과: `070-e2e-test-results.md`

---

<!--
author: Claude
Version History:
- v1.0 (2026-01-23): TSK-06-16 구현 보고서 작성
-->
