# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-23

> **목적**: 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-20 |
| Task명 | [샘플] 데이터 테이블 종합 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| PRD 참조 | PRD 4.1.1 테이블 기능 샘플 |
| 작성일 | 2026-01-23 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | DataTableShowcase 컴포넌트, 기능별 훅, 유틸리티 함수 | 80% 이상 |
| E2E 테스트 | 12개 기능 요구사항 전체 시나리오, 성능 테스트 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 반응형, 접근성, 드래그앤드롭 인터랙션 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터 | mock-data/data-table.json |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

### 1.3 주요 테스트 파일

| 유형 | 경로 |
|------|------|
| 단위 테스트 | `screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx` |
| E2E 테스트 | `tests/e2e/data-table-showcase.spec.ts` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | DataTableShowcase | 단일 컬럼 정렬 | 오름차순/내림차순 토글 | FR-001 |
| UT-002 | DataTableShowcase | 다중 컬럼 정렬 | Shift+클릭으로 다중 정렬 | FR-001 |
| UT-003 | useTableFilter | 텍스트 필터링 | 포함하는 항목만 반환 | FR-002 |
| UT-004 | useTableFilter | 숫자 범위 필터링 | min/max 범위 내 항목 반환 | FR-002 |
| UT-005 | useTableFilter | 날짜 필터링 | 기간 내 항목만 반환 | FR-002 |
| UT-006 | useTableFilter | 드롭다운 필터링 | 선택값 일치 항목 반환 | FR-002 |
| UT-007 | DataTableShowcase | 페이지네이션 | 페이지 크기별 데이터 표시 | FR-003 |
| UT-008 | DataTableShowcase | 단일 행 선택 | 클릭 시 단일 행 선택 | FR-004 |
| UT-009 | DataTableShowcase | 다중 행 선택 | 체크박스 다중 선택 | FR-004 |
| UT-010 | DataTableShowcase | 전체 선택 | 헤더 체크박스로 전체 선택 | FR-004 |
| UT-011 | useColumnResize | 컬럼 리사이즈 | 드래그로 너비 변경 | FR-005 |
| UT-012 | useColumnOrder | 컬럼 순서 변경 | 드래그로 순서 변경 | FR-005 |
| UT-013 | DataTableShowcase | 고정 컬럼 | 좌측 컬럼 고정 | FR-006 |
| UT-014 | DataTableShowcase | 고정 헤더 | 스크롤 시 헤더 고정 | FR-006 |
| UT-015 | DataTableShowcase | 확장 행 | 행 확장/축소 토글 | FR-007 |
| UT-016 | useInlineEdit | 인라인 편집 시작 | 더블클릭 시 편집 모드 | FR-008 |
| UT-017 | useInlineEdit | 인라인 편집 저장 | Enter/Blur 시 저장 | FR-008 |
| UT-018 | useInlineEdit | 인라인 편집 취소 | Escape 시 취소 | FR-008 |
| UT-019 | useRowDragSort | 행 드래그 정렬 | 드래그로 순서 변경 | FR-009 |
| UT-020 | DataTableShowcase | 그룹 헤더 렌더링 | 2단 헤더 표시 | FR-011 |
| UT-021 | DataTableShowcase | 셀 병합 (rowSpan) | 같은 값 행 병합 | FR-012 |
| UT-022 | DataTableShowcase | 셀 병합 (colSpan) | 컬럼 병합 표시 | FR-012 |
| UT-023 | useFeatureToggle | 기능 토글 | 개별 기능 활성화/비활성화 | BR-001 |
| UT-024 | DataTableShowcase | 정렬+필터 조합 | 조합 동작 정확성 | BR-002 |
| UT-025 | useColumnSettings | 컬럼 설정 저장 | localStorage 저장/로드 | BR-004 |

### 2.2 테스트 케이스 상세

#### UT-001: DataTableShowcase 단일 컬럼 정렬

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx` |
| **테스트 블록** | `describe('정렬 기능') → it('should sort by single column')` |
| **Mock 의존성** | mock-data/data-table.json |
| **입력 데이터** | 컬럼 헤더 클릭 |
| **검증 포인트** | 클릭한 컬럼 기준 오름차순 정렬, 재클릭 시 내림차순 |
| **커버리지 대상** | 정렬 로직, 정렬 상태 관리 |
| **관련 요구사항** | FR-001 |

#### UT-002: DataTableShowcase 다중 컬럼 정렬

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx` |
| **테스트 블록** | `describe('정렬 기능') → it('should support multi-column sort with Shift+click')` |
| **Mock 의존성** | mock-data/data-table.json |
| **입력 데이터** | Shift + 컬럼 헤더 클릭 |
| **검증 포인트** | 다중 정렬 기준 적용, 정렬 순서 표시 |
| **커버리지 대상** | 다중 정렬 로직 |
| **관련 요구사항** | FR-001 |

#### UT-003: useTableFilter 텍스트 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/useTableFilter.test.ts` |
| **테스트 블록** | `describe('useTableFilter') → it('should filter by text input')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ column: 'name', value: '제품A' }` |
| **검증 포인트** | 'name' 컬럼에 '제품A' 포함하는 행만 반환 |
| **커버리지 대상** | 텍스트 필터 로직 |
| **관련 요구사항** | FR-002 |

#### UT-004: useTableFilter 숫자 범위 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/useTableFilter.test.ts` |
| **테스트 블록** | `describe('useTableFilter') → it('should filter by number range')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ column: 'quantity', min: 100, max: 500 }` |
| **검증 포인트** | quantity가 100~500 범위인 행만 반환 |
| **커버리지 대상** | 숫자 범위 필터 로직 |
| **관련 요구사항** | FR-002 |

#### UT-005: useTableFilter 날짜 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/useTableFilter.test.ts` |
| **테스트 블록** | `describe('useTableFilter') → it('should filter by date range')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ column: 'createdAt', dateRange: ['2026-01-01', '2026-01-15'] }` |
| **검증 포인트** | 기간 내 날짜의 행만 반환 |
| **커버리지 대상** | 날짜 필터 로직 |
| **관련 요구사항** | FR-002 |

#### UT-006: useTableFilter 드롭다운 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/useTableFilter.test.ts` |
| **테스트 블록** | `describe('useTableFilter') → it('should filter by dropdown selection')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ column: 'status', value: 'active' }` |
| **검증 포인트** | status가 'active'인 행만 반환 |
| **커버리지 대상** | 드롭다운 필터 로직 |
| **관련 요구사항** | FR-002 |

#### UT-007: DataTableShowcase 페이지네이션

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx` |
| **테스트 블록** | `describe('페이지네이션') → it('should paginate data correctly')` |
| **Mock 의존성** | 100건 테스트 데이터 |
| **입력 데이터** | 페이지 사이즈 10, 현재 페이지 2 |
| **검증 포인트** | 11~20번째 데이터 표시, 전체 건수 표시 |
| **커버리지 대상** | 페이지네이션 로직 |
| **관련 요구사항** | FR-003 |

#### UT-008: DataTableShowcase 단일 행 선택

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx` |
| **테스트 블록** | `describe('행 선택') → it('should select single row on click')` |
| **Mock 의존성** | - |
| **입력 데이터** | 행 클릭 |
| **검증 포인트** | 클릭한 행만 선택 상태, 이전 선택 해제 |
| **커버리지 대상** | 단일 선택 로직 |
| **관련 요구사항** | FR-004 |

#### UT-009: DataTableShowcase 다중 행 선택

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx` |
| **테스트 블록** | `describe('행 선택') → it('should select multiple rows with checkbox')` |
| **Mock 의존성** | - |
| **입력 데이터** | 체크박스 다중 클릭 |
| **검증 포인트** | 여러 행 동시 선택, 선택 건수 업데이트 |
| **커버리지 대상** | 다중 선택 로직 |
| **관련 요구사항** | FR-004 |

#### UT-010: DataTableShowcase 전체 선택

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx` |
| **테스트 블록** | `describe('행 선택') → it('should select all rows with header checkbox')` |
| **Mock 의존성** | - |
| **입력 데이터** | 헤더 체크박스 클릭 |
| **검증 포인트** | 현재 페이지 전체 행 선택, 재클릭 시 전체 해제 |
| **커버리지 대상** | 전체 선택 로직 |
| **관련 요구사항** | FR-004 |

#### UT-011: useColumnResize 컬럼 리사이즈

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/useColumnResize.test.ts` |
| **테스트 블록** | `describe('useColumnResize') → it('should resize column on drag')` |
| **Mock 의존성** | - |
| **입력 데이터** | 컬럼 경계 드래그 이벤트 |
| **검증 포인트** | 드래그 거리만큼 컬럼 너비 변경 |
| **커버리지 대상** | 리사이즈 핸들러 |
| **관련 요구사항** | FR-005 |

#### UT-012: useColumnOrder 컬럼 순서 변경

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/useColumnOrder.test.ts` |
| **테스트 블록** | `describe('useColumnOrder') → it('should reorder columns on drag')` |
| **Mock 의존성** | - |
| **입력 데이터** | 컬럼 헤더 드래그 이벤트 |
| **검증 포인트** | 드롭 위치로 컬럼 순서 변경 |
| **커버리지 대상** | 순서 변경 로직 |
| **관련 요구사항** | FR-005 |

#### UT-013: DataTableShowcase 고정 컬럼

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx` |
| **테스트 블록** | `describe('고정 컬럼/헤더') → it('should fix columns to left')` |
| **Mock 의존성** | - |
| **입력 데이터** | `fixed: 'left'` 설정된 컬럼 |
| **검증 포인트** | 수평 스크롤 시 고정 컬럼 위치 유지 |
| **커버리지 대상** | 고정 컬럼 렌더링 |
| **관련 요구사항** | FR-006 |

#### UT-014: DataTableShowcase 고정 헤더

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx` |
| **테스트 블록** | `describe('고정 컬럼/헤더') → it('should fix header on scroll')` |
| **Mock 의존성** | - |
| **입력 데이터** | `sticky: true` 설정 |
| **검증 포인트** | 수직 스크롤 시 헤더 위치 유지 |
| **커버리지 대상** | 고정 헤더 렌더링 |
| **관련 요구사항** | FR-006 |

#### UT-015: DataTableShowcase 확장 행

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx` |
| **테스트 블록** | `describe('확장 행') → it('should expand/collapse row')` |
| **Mock 의존성** | - |
| **입력 데이터** | 확장 아이콘 클릭 |
| **검증 포인트** | 확장 시 상세 내용 표시, 축소 시 숨김 |
| **커버리지 대상** | expandable 로직 |
| **관련 요구사항** | FR-007 |

#### UT-016: useInlineEdit 인라인 편집 시작

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/useInlineEdit.test.ts` |
| **테스트 블록** | `describe('useInlineEdit') → it('should enter edit mode on double-click')` |
| **Mock 의존성** | - |
| **입력 데이터** | 셀 더블클릭 이벤트 |
| **검증 포인트** | 해당 셀이 input으로 변환, 기존 값 표시 |
| **커버리지 대상** | 편집 모드 진입 |
| **관련 요구사항** | FR-008 |

#### UT-017: useInlineEdit 인라인 편집 저장

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/useInlineEdit.test.ts` |
| **테스트 블록** | `describe('useInlineEdit') → it('should save on Enter or blur')` |
| **Mock 의존성** | - |
| **입력 데이터** | Enter 키 또는 blur 이벤트 |
| **검증 포인트** | 변경된 값 저장, 편집 모드 종료 |
| **커버리지 대상** | 저장 로직 |
| **관련 요구사항** | FR-008 |

#### UT-018: useInlineEdit 인라인 편집 취소

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/useInlineEdit.test.ts` |
| **테스트 블록** | `describe('useInlineEdit') → it('should cancel on Escape')` |
| **Mock 의존성** | - |
| **입력 데이터** | Escape 키 이벤트 |
| **검증 포인트** | 원래 값 유지, 편집 모드 종료 |
| **커버리지 대상** | 취소 로직 |
| **관련 요구사항** | FR-008 |

#### UT-019: useRowDragSort 행 드래그 정렬

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/useRowDragSort.test.ts` |
| **테스트 블록** | `describe('useRowDragSort') → it('should reorder rows on drag')` |
| **Mock 의존성** | - |
| **입력 데이터** | 행 드래그 이벤트 |
| **검증 포인트** | 드롭 위치로 행 순서 변경 |
| **커버리지 대상** | 행 정렬 로직 |
| **관련 요구사항** | FR-009 |

#### UT-020: DataTableShowcase 그룹 헤더 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx` |
| **테스트 블록** | `describe('그룹 헤더') → it('should render 2-level column headers')` |
| **Mock 의존성** | - |
| **입력 데이터** | children 속성을 가진 컬럼 정의 |
| **검증 포인트** | 상위 그룹 헤더와 하위 컬럼 헤더 렌더링 |
| **커버리지 대상** | 그룹 헤더 렌더링 |
| **관련 요구사항** | FR-011 |

#### UT-021: DataTableShowcase 셀 병합 (rowSpan)

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx` |
| **테스트 블록** | `describe('셀 병합') → it('should merge cells with same value (rowSpan)')` |
| **Mock 의존성** | 같은 값을 가진 연속 행 데이터 |
| **입력 데이터** | rowSpan 설정된 컬럼 |
| **검증 포인트** | 같은 값의 연속 행이 하나의 셀로 병합 |
| **커버리지 대상** | rowSpan 계산 및 렌더링 |
| **관련 요구사항** | FR-012 |

#### UT-022: DataTableShowcase 셀 병합 (colSpan)

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx` |
| **테스트 블록** | `describe('셀 병합') → it('should merge cells horizontally (colSpan)')` |
| **Mock 의존성** | - |
| **입력 데이터** | colSpan 설정된 셀 |
| **검증 포인트** | 지정된 컬럼 수만큼 병합 표시 |
| **커버리지 대상** | colSpan 렌더링 |
| **관련 요구사항** | FR-012 |

#### UT-023: useFeatureToggle 기능 토글

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/useFeatureToggle.test.ts` |
| **테스트 블록** | `describe('useFeatureToggle') → it('should toggle features on/off')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ sorting: true, filtering: false }` |
| **검증 포인트** | 활성화된 기능만 동작, 비활성화 시 숨김 |
| **커버리지 대상** | 기능 토글 상태 관리 |
| **관련 요구사항** | BR-001 |

#### UT-024: DataTableShowcase 정렬+필터 조합

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/DataTableShowcase.test.tsx` |
| **테스트 블록** | `describe('조합 동작') → it('should apply filter then sort correctly')` |
| **Mock 의존성** | mock-data/data-table.json |
| **입력 데이터** | 필터 + 정렬 조합 |
| **검증 포인트** | 필터링된 결과에 정렬 적용 |
| **커버리지 대상** | 필터-정렬 파이프라인 |
| **관련 요구사항** | BR-002 |

#### UT-025: useColumnSettings 컬럼 설정 저장

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/DataTableShowcase/__tests__/useColumnSettings.test.ts` |
| **테스트 블록** | `describe('useColumnSettings') → it('should save/load from localStorage')` |
| **Mock 의존성** | localStorage mock |
| **입력 데이터** | 컬럼 너비/순서 변경 |
| **검증 포인트** | localStorage에 저장, 리로드 시 복원 |
| **커버리지 대상** | 설정 영속화 로직 |
| **관련 요구사항** | BR-004 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 단일/다중 컬럼 정렬 | 페이지 로드 | 1. 컬럼 헤더 클릭 2. Shift+클릭 | 정렬 동작 | FR-001 |
| E2E-002 | 텍스트 필터링 | 페이지 로드 | 1. 필터 아이콘 클릭 2. 텍스트 입력 | 필터링된 결과 | FR-002 |
| E2E-003 | 숫자/날짜 필터링 | 페이지 로드 | 1. 숫자/날짜 필터 설정 | 범위 내 결과 | FR-002 |
| E2E-004 | 페이지네이션 | 데이터 로드 | 1. 페이지 이동 2. 페이지 크기 변경 | 페이징 동작 | FR-003 |
| E2E-005 | 행 선택 (단일/다중/전체) | 데이터 로드 | 1. 행 클릭 2. 체크박스 클릭 | 선택 동작 | FR-004 |
| E2E-006 | 컬럼 리사이즈/순서 변경 | 데이터 로드 | 1. 경계 드래그 2. 헤더 드래그 | 너비/순서 변경 | FR-005 |
| E2E-007 | 고정 컬럼/헤더 | 데이터 로드 | 1. 스크롤 동작 | sticky 동작 | FR-006 |
| E2E-008 | 확장 행 | 데이터 로드 | 1. 확장 아이콘 클릭 | 상세 표시 | FR-007 |
| E2E-009 | 인라인 편집 | 데이터 로드 | 1. 더블클릭 2. 값 수정 3. Enter | 편집 저장 | FR-008 |
| E2E-010 | 행 드래그 정렬 | 데이터 로드 | 1. 행 드래그 이동 | 순서 변경 | FR-009 |
| E2E-011 | 가상 스크롤 성능 | 1만건 데이터 | 1. 스크롤 동작 | 부드러운 스크롤 | FR-010, BR-003 |
| E2E-012 | 그룹 헤더 | 페이지 로드 | 1. 그룹 헤더 표시 확인 | 2단 헤더 | FR-011 |
| E2E-013 | 셀 병합 | 페이지 로드 | 1. 병합된 셀 확인 | rowSpan/colSpan | FR-012 |
| E2E-014 | 기능 토글 | 페이지 로드 | 1. 기능 활성화/비활성화 | 토글 동작 | BR-001 |
| E2E-015 | 정렬+필터 조합 | 페이지 로드 | 1. 필터 적용 2. 정렬 적용 | 조합 동작 | BR-002 |
| E2E-016 | 설정 영속화 | 설정 변경 | 1. 컬럼 설정 변경 2. 리로드 | 설정 유지 | BR-004 |

### 3.2 테스트 케이스 상세

#### E2E-001: 단일/다중 컬럼 정렬

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('사용자가 컬럼 헤더 클릭으로 정렬할 수 있다')` |
| **사전조건** | 로그인, 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="data-table-showcase-page"]` |
| - 테이블 | `[data-testid="data-table"]` |
| - 컬럼 헤더 | `[data-testid="column-header-{columnKey}"]` |
| - 정렬 아이콘 | `[data-testid="sort-icon-{columnKey}"]` |
| **실행 단계** | |
| 1 | `await page.goto('/sample/data-table-showcase')` |
| 2 | `await page.click('[data-testid="column-header-name"]')` |
| 3 | 정렬 결과 확인 |
| 4 | `await page.keyboard.down('Shift')` |
| 5 | `await page.click('[data-testid="column-header-quantity"]')` |
| 6 | `await page.keyboard.up('Shift')` |
| **검증 포인트** | |
| 1 | `expect(page.locator('[data-testid="sort-icon-name"]')).toHaveAttribute('data-order', 'asc')` |
| 2 | 다중 정렬 시 정렬 순서 표시 |
| **스크린샷** | `e2e-001-sorting.png` |
| **관련 요구사항** | FR-001 |

#### E2E-002: 텍스트 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('사용자가 텍스트로 필터링할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 필터 아이콘 | `[data-testid="filter-icon-name"]` |
| - 필터 입력 | `[data-testid="filter-input-name"]` |
| - 필터 적용 버튼 | `[data-testid="filter-apply-btn"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="filter-icon-name"]')` |
| 2 | `await page.fill('[data-testid="filter-input-name"]', '제품A')` |
| 3 | `await page.click('[data-testid="filter-apply-btn"]')` |
| **검증 포인트** | |
| 1 | 테이블에 '제품A' 포함하는 행만 표시 |
| 2 | 필터 적용 표시 (아이콘 색상 변경) |
| **스크린샷** | `e2e-002-text-filter.png` |
| **관련 요구사항** | FR-002 |

#### E2E-003: 숫자/날짜 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('사용자가 숫자 범위/날짜로 필터링할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 숫자 필터 min | `[data-testid="filter-min-quantity"]` |
| - 숫자 필터 max | `[data-testid="filter-max-quantity"]` |
| - 날짜 필터 | `[data-testid="filter-date-createdAt"]` |
| **실행 단계** | |
| 1 | `await page.fill('[data-testid="filter-min-quantity"]', '100')` |
| 2 | `await page.fill('[data-testid="filter-max-quantity"]', '500')` |
| 3 | `await page.click('[data-testid="filter-apply-btn"]')` |
| **검증 포인트** | 수량 100~500 범위의 행만 표시 |
| **스크린샷** | `e2e-003-range-filter.png` |
| **관련 요구사항** | FR-002 |

#### E2E-004: 페이지네이션

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('사용자가 페이지를 이동하고 크기를 변경할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 페이지 버튼 | `[data-testid="page-{number}"]` |
| - 페이지 크기 선택 | `[data-testid="page-size-select"]` |
| - 전체 건수 | `[data-testid="total-count"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="page-2"]')` |
| 2 | 2페이지 데이터 확인 |
| 3 | `await page.click('[data-testid="page-size-select"]')` |
| 4 | 50건 옵션 선택 |
| **검증 포인트** | |
| 1 | 2페이지 이동 시 11~20번째 데이터 표시 |
| 2 | 페이지 크기 50으로 변경 시 1~50 표시 |
| 3 | 전체 건수 표시 정확 |
| **스크린샷** | `e2e-004-pagination.png` |
| **관련 요구사항** | FR-003 |

#### E2E-005: 행 선택 (단일/다중/전체)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('사용자가 행을 단일/다중/전체 선택할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 행 체크박스 | `[data-testid="row-checkbox-{id}"]` |
| - 헤더 체크박스 | `[data-testid="header-checkbox"]` |
| - 선택 건수 | `[data-testid="selected-count"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="row-checkbox-1"]')` |
| 2 | `await page.click('[data-testid="row-checkbox-2"]')` |
| 3 | 선택 건수 확인 |
| 4 | `await page.click('[data-testid="header-checkbox"]')` |
| 5 | 전체 선택 확인 |
| **검증 포인트** | |
| 1 | 개별 선택 시 선택 건수 업데이트 |
| 2 | 전체 선택 시 모든 행 선택 |
| **스크린샷** | `e2e-005-row-selection.png` |
| **관련 요구사항** | FR-004 |

#### E2E-006: 컬럼 리사이즈/순서 변경

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('사용자가 컬럼 너비와 순서를 변경할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 리사이즈 핸들 | `[data-testid="resize-handle-{columnKey}"]` |
| - 컬럼 헤더 | `[data-testid="column-header-{columnKey}"]` |
| **실행 단계** | |
| 1 | 리사이즈 핸들을 50px 드래그 |
| 2 | 컬럼 너비 변경 확인 |
| 3 | 컬럼 헤더를 다른 위치로 드래그 |
| 4 | 컬럼 순서 변경 확인 |
| **검증 포인트** | |
| 1 | 컬럼 너비가 50px 증가 |
| 2 | 컬럼 순서가 드롭 위치로 변경 |
| **스크린샷** | `e2e-006-column-resize-reorder.png` |
| **관련 요구사항** | FR-005 |

#### E2E-007: 고정 컬럼/헤더

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('고정 컬럼과 헤더가 스크롤 시 유지된다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 테이블 컨테이너 | `[data-testid="table-container"]` |
| - 고정 컬럼 | `[data-testid="fixed-column"]` |
| **실행 단계** | |
| 1 | 테이블 컨테이너를 수평 스크롤 |
| 2 | 고정 컬럼 위치 확인 |
| 3 | 테이블 컨테이너를 수직 스크롤 |
| 4 | 헤더 위치 확인 |
| **검증 포인트** | |
| 1 | 고정 컬럼이 좌측에 고정 |
| 2 | 헤더가 상단에 고정 |
| **스크린샷** | `e2e-007-sticky.png` |
| **관련 요구사항** | FR-006 |

#### E2E-008: 확장 행

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('사용자가 행을 확장하여 상세 정보를 볼 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 확장 아이콘 | `[data-testid="expand-icon-{id}"]` |
| - 확장 콘텐츠 | `[data-testid="expanded-content-{id}"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="expand-icon-1"]')` |
| 2 | 확장 콘텐츠 확인 |
| 3 | `await page.click('[data-testid="expand-icon-1"]')` |
| 4 | 축소 확인 |
| **검증 포인트** | |
| 1 | `expect(page.locator('[data-testid="expanded-content-1"]')).toBeVisible()` |
| 2 | 재클릭 시 숨김 |
| **스크린샷** | `e2e-008-expandable.png` |
| **관련 요구사항** | FR-007 |

#### E2E-009: 인라인 편집

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('사용자가 셀을 더블클릭하여 편집할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 편집 가능 셀 | `[data-testid="cell-name-{id}"]` |
| - 편집 입력 | `[data-testid="edit-input-name-{id}"]` |
| **실행 단계** | |
| 1 | `await page.dblclick('[data-testid="cell-name-1"]')` |
| 2 | `await page.fill('[data-testid="edit-input-name-1"]', '수정된 제품명')` |
| 3 | `await page.keyboard.press('Enter')` |
| **검증 포인트** | |
| 1 | 더블클릭 시 input 표시 |
| 2 | Enter 시 저장 및 값 업데이트 |
| **스크린샷** | `e2e-009-inline-edit.png` |
| **관련 요구사항** | FR-008 |

#### E2E-010: 행 드래그 정렬

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('사용자가 행을 드래그하여 순서를 변경할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 드래그 핸들 | `[data-testid="drag-handle-{id}"]` |
| - 테이블 행 | `[data-testid="table-row-{id}"]` |
| **실행 단계** | |
| 1 | 첫 번째 행의 드래그 핸들 드래그 |
| 2 | 세 번째 행 위치로 드롭 |
| **검증 포인트** | 첫 번째 행이 세 번째 위치로 이동 |
| **스크린샷** | `e2e-010-row-drag.png` |
| **관련 요구사항** | FR-009 |

#### E2E-011: 가상 스크롤 성능

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('1만건 데이터에서 부드러운 스크롤이 동작한다')` |
| **사전조건** | 1만건 데이터 로드 |
| **data-testid 셀렉터** | |
| - 테이블 컨테이너 | `[data-testid="table-container"]` |
| - 가상 스크롤 영역 | `[data-testid="virtual-scroll-area"]` |
| **실행 단계** | |
| 1 | 1만건 데이터 모드 활성화 |
| 2 | 스크롤 시작 시간 기록 |
| 3 | 빠르게 스크롤 (5000px) |
| 4 | 스크롤 완료 시간 측정 |
| **검증 포인트** | |
| 1 | 프레임 드롭 없이 스크롤 (60fps 유지) |
| 2 | 렌더링된 행 수가 뷰포트 크기에 비례 |
| 3 | 스크롤 응답 시간 100ms 이내 |
| **스크린샷** | `e2e-011-virtual-scroll.png` |
| **관련 요구사항** | FR-010, BR-003 |

#### E2E-012: 그룹 헤더

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('2단 그룹 헤더가 표시된다')` |
| **사전조건** | 그룹 헤더 모드 활성화 |
| **data-testid 셀렉터** | |
| - 그룹 헤더 | `[data-testid="group-header-{groupKey}"]` |
| - 하위 헤더 | `[data-testid="column-header-{columnKey}"]` |
| **실행 단계** | |
| 1 | 그룹 헤더 토글 활성화 |
| 2 | 2단 헤더 구조 확인 |
| **검증 포인트** | |
| 1 | 상위 그룹 헤더 표시 |
| 2 | 하위 컬럼 헤더 그룹 아래 표시 |
| **스크린샷** | `e2e-012-group-header.png` |
| **관련 요구사항** | FR-011 |

#### E2E-013: 셀 병합

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('셀 병합(rowSpan/colSpan)이 올바르게 표시된다')` |
| **사전조건** | 셀 병합 모드 활성화 |
| **data-testid 셀렉터** | |
| - 병합 셀 | `[data-testid="merged-cell-{id}"]` |
| **실행 단계** | |
| 1 | 셀 병합 토글 활성화 |
| 2 | rowSpan 병합 확인 |
| 3 | colSpan 병합 확인 |
| **검증 포인트** | |
| 1 | 같은 카테고리 값 행이 병합됨 (rowSpan) |
| 2 | 지정된 컬럼이 병합됨 (colSpan) |
| **스크린샷** | `e2e-013-cell-merge.png` |
| **관련 요구사항** | FR-012 |

#### E2E-014: 기능 토글

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('기능 토글로 개별 기능을 활성화/비활성화할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 기능 토글 패널 | `[data-testid="feature-toggle-panel"]` |
| - 정렬 토글 | `[data-testid="toggle-sorting"]` |
| - 필터 토글 | `[data-testid="toggle-filtering"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="toggle-sorting"]')` |
| 2 | 정렬 기능 비활성화 확인 |
| 3 | `await page.click('[data-testid="toggle-filtering"]')` |
| 4 | 필터 기능 비활성화 확인 |
| **검증 포인트** | |
| 1 | 정렬 토글 OFF 시 정렬 아이콘 숨김 |
| 2 | 필터 토글 OFF 시 필터 아이콘 숨김 |
| **스크린샷** | `e2e-014-feature-toggle.png` |
| **관련 요구사항** | BR-001 |

#### E2E-015: 정렬+필터 조합

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('필터와 정렬을 함께 적용할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | 기존 필터/정렬 셀렉터 활용 |
| **실행 단계** | |
| 1 | 텍스트 필터 적용 |
| 2 | 컬럼 정렬 적용 |
| 3 | 결과 확인 |
| **검증 포인트** | |
| 1 | 필터링된 결과에 정렬 적용 |
| 2 | 필터 + 정렬 조합 결과 정확 |
| **스크린샷** | `e2e-015-filter-sort-combo.png` |
| **관련 요구사항** | BR-002 |

#### E2E-016: 설정 영속화

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table-showcase.spec.ts` |
| **테스트명** | `test('컬럼 설정이 localStorage에 저장되고 복원된다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | 기존 컬럼 관련 셀렉터 활용 |
| **실행 단계** | |
| 1 | 컬럼 너비 변경 |
| 2 | 컬럼 순서 변경 |
| 3 | 페이지 리로드 |
| 4 | 설정 복원 확인 |
| **검증 포인트** | |
| 1 | 리로드 후 변경된 너비 유지 |
| 2 | 리로드 후 변경된 순서 유지 |
| **스크린샷** | `e2e-016-settings-persist.png` |
| **관련 요구사항** | BR-004 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 컬럼 정렬 UI | 페이지 로드 | 1. 헤더 클릭 2. 정렬 확인 | 정렬 아이콘 표시 | High | FR-001 |
| TC-002 | 필터 UI | 페이지 로드 | 1. 필터 아이콘 클릭 | 필터 팝오버 표시 | High | FR-002 |
| TC-003 | 페이지네이션 UI | 페이지 로드 | 1. 페이지 컨트롤 확인 | 페이지 버튼, 크기 선택 | High | FR-003 |
| TC-004 | 행 선택 UI | 페이지 로드 | 1. 체크박스 표시 확인 | 선택 UI 표시 | High | FR-004 |
| TC-005 | 컬럼 리사이즈 UI | 페이지 로드 | 1. 경계에 호버 | 리사이즈 커서 표시 | Medium | FR-005 |
| TC-006 | 컬럼 드래그 UI | 페이지 로드 | 1. 헤더 드래그 | 드래그 인디케이터 | Medium | FR-005 |
| TC-007 | 고정 컬럼 UI | 스크롤 상태 | 1. 고정 컬럼 확인 | 그림자 표시 | Medium | FR-006 |
| TC-008 | 확장 행 UI | 페이지 로드 | 1. 확장 아이콘 확인 | 아이콘 회전 애니메이션 | Medium | FR-007 |
| TC-009 | 인라인 편집 UI | 편집 모드 | 1. 입력 필드 확인 | 포커스 표시 | High | FR-008 |
| TC-010 | 행 드래그 UI | 드래그 중 | 1. 드래그 상태 확인 | 드래그 프리뷰 | Medium | FR-009 |
| TC-011 | 가상 스크롤 UI | 스크롤 중 | 1. 스크롤바 확인 | 부드러운 스크롤 | High | FR-010 |
| TC-012 | 그룹 헤더 UI | 페이지 로드 | 1. 헤더 구조 확인 | 2단 헤더 정렬 | Medium | FR-011 |
| TC-013 | 셀 병합 UI | 페이지 로드 | 1. 병합 셀 확인 | 테두리 연결 | Medium | FR-012 |
| TC-014 | 기능 토글 UI | 페이지 로드 | 1. 토글 패널 확인 | 스위치 상태 표시 | Medium | BR-001 |
| TC-015 | 반응형 레이아웃 | - | 1. 화면 크기 조절 | 적응형 레이아웃 | Medium | - |
| TC-016 | 다크 모드 | 테마 변경 | 1. 테마 전환 | 컬러 적응 | Low | - |
| TC-017 | 키보드 접근성 | - | 1. Tab/Enter/Arrow | 모든 기능 접근 | Medium | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 컬럼 정렬 UI

**테스트 목적**: 정렬 기능의 UI가 직관적으로 동작하는지 확인

**테스트 단계**:
1. 데이터 테이블 종합 페이지 접근
2. 컬럼 헤더에 마우스 호버
3. 클릭하여 정렬
4. 재클릭하여 역순 정렬
5. 정렬 해제

**예상 결과**:
- 호버 시 클릭 가능 표시 (커서 변경)
- 클릭 시 정렬 아이콘 표시 (오름차순/내림차순)
- 다중 정렬 시 순서 표시

**검증 기준**:
- [ ] 정렬 아이콘이 명확히 보임
- [ ] 정렬 순서가 시각적으로 구분됨
- [ ] 정렬 해제 시 아이콘 숨김

#### TC-002: 필터 UI

**테스트 목적**: 다양한 필터 유형의 UI가 올바르게 표시되는지 확인

**테스트 단계**:
1. 필터 아이콘 클릭
2. 텍스트 필터 입력란 확인
3. 숫자 필터 범위 입력란 확인
4. 날짜 필터 DatePicker 확인
5. 드롭다운 필터 Select 확인

**예상 결과**:
- 각 필터 유형에 맞는 입력 컴포넌트
- 적용/초기화 버튼
- 필터 적용 시 아이콘 색상 변경

**검증 기준**:
- [ ] 필터 팝오버 위치 적절
- [ ] 입력 유형별 적합한 컴포넌트
- [ ] 필터 상태 시각적 표시

#### TC-009: 인라인 편집 UI

**테스트 목적**: 인라인 편집 모드의 UI가 직관적인지 확인

**테스트 단계**:
1. 편집 가능 셀 더블클릭
2. 입력 필드 표시 확인
3. 값 수정
4. Enter로 저장
5. 다른 셀에서 Escape로 취소

**예상 결과**:
- 더블클릭 시 셀이 입력 필드로 전환
- 포커스 표시 명확
- Enter 시 저장 피드백
- Escape 시 원복

**검증 기준**:
- [ ] 편집 모드 전환 애니메이션 자연스러움
- [ ] 입력 필드 크기가 셀에 맞음
- [ ] 저장/취소 피드백 명확

#### TC-011: 가상 스크롤 UI

**테스트 목적**: 대용량 데이터에서 스크롤이 부드럽게 동작하는지 확인

**테스트 단계**:
1. 1만건 데이터 모드 활성화
2. 빠르게 스크롤
3. 스크롤바 드래그
4. 키보드 Page Up/Down

**예상 결과**:
- 프레임 드롭 없이 부드러운 스크롤
- 스크롤 위치에 맞는 데이터 렌더링
- 스크롤바 크기가 전체 데이터 비율 반영

**검증 기준**:
- [ ] 스크롤 시 끊김 없음
- [ ] 빈 공간 없이 데이터 표시
- [ ] 스크롤 위치 표시 정확

#### TC-015: 반응형 레이아웃

**테스트 목적**: 다양한 화면 크기에서 테이블이 적절히 표시되는지 확인

**테스트 단계**:
1. 데스크톱 (1920px) 확인
2. 태블릿 (768px) 확인
3. 모바일 (375px) 확인

**예상 결과**:
- 데스크톱: 전체 컬럼 표시
- 태블릿: 수평 스크롤, 고정 컬럼 유지
- 모바일: 핵심 컬럼 우선, 터치 친화적

**검증 기준**:
- [ ] 모든 화면 크기에서 기능 접근 가능
- [ ] 스크롤 영역 명확
- [ ] 터치 제스처 동작 (모바일)

#### TC-017: 키보드 접근성

**테스트 목적**: 키보드만으로 모든 기능에 접근 가능한지 확인

**테스트 단계**:
1. Tab으로 테이블 진입
2. Arrow 키로 셀 이동
3. Enter로 정렬/선택
4. Space로 체크박스 토글
5. F2로 인라인 편집

**예상 결과**:
- 포커스 표시 명확
- 모든 인터랙션 키보드로 가능
- 포커스 트랩 적절

**검증 기준**:
- [ ] Tab 순서 논리적
- [ ] 포커스 링 표시됨
- [ ] 스크린 리더 호환

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-DATA-01 | 기본 테이블 데이터 | `{ id: 1, name: '제품A', category: '전자', quantity: 100, price: 10000, status: 'active', createdAt: '2026-01-20' }` |
| MOCK-DATA-02 | 정렬 테스트 데이터 | `{ id: 2, name: '제품B', category: '전자', quantity: 200, price: 20000, status: 'inactive', createdAt: '2026-01-19' }` |
| MOCK-DATA-03 | 필터 테스트 데이터 | `{ id: 3, name: '제품C', category: '가구', quantity: 50, price: 50000, status: 'active', createdAt: '2026-01-18' }` |
| MOCK-DATA-LARGE | 성능 테스트 데이터 | 10000건 배열 (id: 1~10000) |
| MOCK-EXPAND | 확장 행 데이터 | `{ ...MOCK-DATA-01, details: { description: '상세 설명', specs: [...] } }` |
| MOCK-MERGE | 셀 병합 데이터 | category가 같은 연속 행 5건 |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-TABLE | 기본 E2E 환경 | mock-data/data-table.json | 100건 |
| SEED-E2E-LARGE | 성능 테스트 | 동적 생성 | 10000건 |
| SEED-E2E-MERGE | 셀 병합 테스트 | mock-data/data-table-merge.json | 50건 |

### 5.3 mock-data/data-table.json 구조

```json
{
  "data": [
    {
      "id": 1,
      "name": "제품A-001",
      "category": "전자",
      "categoryCode": "ELEC",
      "quantity": 100,
      "price": 10000,
      "status": "active",
      "statusLabel": "활성",
      "createdAt": "2026-01-20T10:00:00",
      "updatedAt": "2026-01-21T15:30:00",
      "details": {
        "description": "고품질 전자 부품",
        "manufacturer": "ABC전자",
        "warranty": "1년"
      }
    }
  ],
  "total": 100,
  "columns": [
    {
      "key": "name",
      "title": "제품명",
      "dataType": "text",
      "filterable": true,
      "sortable": true,
      "editable": true,
      "width": 200
    },
    {
      "key": "category",
      "title": "카테고리",
      "dataType": "dropdown",
      "options": ["전자", "가구", "의류", "식품"],
      "filterable": true,
      "sortable": true,
      "mergeable": true
    },
    {
      "key": "quantity",
      "title": "수량",
      "dataType": "number",
      "filterable": true,
      "sortable": true,
      "editable": true
    },
    {
      "key": "price",
      "title": "가격",
      "dataType": "number",
      "filterable": true,
      "sortable": true,
      "format": "currency"
    },
    {
      "key": "status",
      "title": "상태",
      "dataType": "dropdown",
      "options": ["active", "inactive", "pending"],
      "filterable": true
    },
    {
      "key": "createdAt",
      "title": "생성일",
      "dataType": "date",
      "filterable": true,
      "sortable": true,
      "format": "YYYY-MM-DD"
    }
  ],
  "groupHeaders": [
    {
      "title": "제품 정보",
      "children": ["name", "category"]
    },
    {
      "title": "수량/가격",
      "children": ["quantity", "price"]
    },
    {
      "title": "상태 정보",
      "children": ["status", "createdAt"]
    }
  ]
}
```

### 5.4 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지 컨테이너

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `data-table-showcase-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `feature-toggle-panel` | 기능 토글 패널 | 기능 토글 영역 |
| `data-table` | 테이블 컴포넌트 | 테이블 영역 |
| `table-container` | 테이블 스크롤 컨테이너 | 스크롤 영역 |

### 6.2 테이블 헤더

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `column-header-{columnKey}` | 컬럼 헤더 | 정렬/필터 대상 |
| `group-header-{groupKey}` | 그룹 헤더 | 2단 헤더 그룹 |
| `sort-icon-{columnKey}` | 정렬 아이콘 | 정렬 상태 확인 |
| `filter-icon-{columnKey}` | 필터 아이콘 | 필터 팝오버 열기 |
| `resize-handle-{columnKey}` | 리사이즈 핸들 | 컬럼 너비 조절 |
| `header-checkbox` | 헤더 체크박스 | 전체 선택 |

### 6.3 필터 팝오버

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `filter-popover-{columnKey}` | 필터 팝오버 | 필터 UI 컨테이너 |
| `filter-input-{columnKey}` | 텍스트 필터 입력 | 텍스트 필터링 |
| `filter-min-{columnKey}` | 숫자 최소값 입력 | 범위 필터링 |
| `filter-max-{columnKey}` | 숫자 최대값 입력 | 범위 필터링 |
| `filter-date-{columnKey}` | 날짜 필터 | 날짜 필터링 |
| `filter-select-{columnKey}` | 드롭다운 필터 | 선택 필터링 |
| `filter-apply-btn` | 필터 적용 버튼 | 필터 적용 |
| `filter-reset-btn` | 필터 초기화 버튼 | 필터 초기화 |

### 6.4 테이블 바디

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `table-row-{id}` | 테이블 행 | 행 식별 |
| `row-checkbox-{id}` | 행 체크박스 | 행 선택 |
| `cell-{columnKey}-{id}` | 테이블 셀 | 셀 식별 |
| `edit-input-{columnKey}-{id}` | 인라인 편집 입력 | 편집 모드 |
| `expand-icon-{id}` | 확장 아이콘 | 확장 토글 |
| `expanded-content-{id}` | 확장 콘텐츠 | 확장된 상세 |
| `drag-handle-{id}` | 드래그 핸들 | 행 드래그 |
| `fixed-column` | 고정 컬럼 | 고정 컬럼 확인 |
| `merged-cell-{id}` | 병합된 셀 | 셀 병합 확인 |
| `virtual-scroll-area` | 가상 스크롤 영역 | 가상 스크롤 |

### 6.5 페이지네이션

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `pagination` | 페이지네이션 컨테이너 | 페이징 영역 |
| `page-{number}` | 페이지 버튼 | 페이지 이동 |
| `page-prev` | 이전 페이지 | 이전 페이지 |
| `page-next` | 다음 페이지 | 다음 페이지 |
| `page-size-select` | 페이지 크기 선택 | 크기 변경 |
| `total-count` | 전체 건수 | 건수 확인 |
| `selected-count` | 선택 건수 | 선택 건수 |

### 6.6 기능 토글

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `toggle-sorting` | 정렬 토글 | 정렬 활성화 |
| `toggle-filtering` | 필터 토글 | 필터 활성화 |
| `toggle-pagination` | 페이징 토글 | 페이징 활성화 |
| `toggle-selection` | 선택 토글 | 선택 활성화 |
| `toggle-resize` | 리사이즈 토글 | 리사이즈 활성화 |
| `toggle-reorder` | 순서변경 토글 | 순서변경 활성화 |
| `toggle-sticky` | 고정 토글 | 고정 활성화 |
| `toggle-expandable` | 확장 토글 | 확장 활성화 |
| `toggle-inline-edit` | 인라인편집 토글 | 편집 활성화 |
| `toggle-row-drag` | 행드래그 토글 | 드래그 활성화 |
| `toggle-virtual-scroll` | 가상스크롤 토글 | 가상스크롤 활성화 |
| `toggle-group-header` | 그룹헤더 토글 | 그룹헤더 활성화 |
| `toggle-cell-merge` | 셀병합 토글 | 셀병합 활성화 |

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
| 기능 요구사항 (FR-001 ~ FR-012) | 100% 커버 |
| 비즈니스 규칙 (BR-001 ~ BR-004) | 100% 커버 |
| 주요 사용자 시나리오 | 100% |
| 에러 케이스 | 80% 커버 |

### 7.3 요구사항 커버리지 매핑

| 요구사항 | 단위 테스트 | E2E 테스트 | 매뉴얼 테스트 |
|----------|------------|------------|--------------|
| FR-001 (컬럼 정렬) | UT-001, UT-002 | E2E-001 | TC-001 |
| FR-002 (컬럼 필터링) | UT-003~006 | E2E-002, E2E-003 | TC-002 |
| FR-003 (페이징) | UT-007 | E2E-004 | TC-003 |
| FR-004 (행 선택) | UT-008~010 | E2E-005 | TC-004 |
| FR-005 (컬럼 리사이즈/순서) | UT-011, UT-012 | E2E-006 | TC-005, TC-006 |
| FR-006 (고정 컬럼/헤더) | UT-013, UT-014 | E2E-007 | TC-007 |
| FR-007 (확장 행) | UT-015 | E2E-008 | TC-008 |
| FR-008 (인라인 편집) | UT-016~018 | E2E-009 | TC-009 |
| FR-009 (행 드래그 정렬) | UT-019 | E2E-010 | TC-010 |
| FR-010 (가상 스크롤) | - | E2E-011 | TC-011 |
| FR-011 (그룹 헤더) | UT-020 | E2E-012 | TC-012 |
| FR-012 (셀 병합) | UT-021, UT-022 | E2E-013 | TC-013 |
| BR-001 (기능 토글) | UT-023 | E2E-014 | TC-014 |
| BR-002 (정렬/필터 조합) | UT-024 | E2E-015 | - |
| BR-003 (1만건 성능) | - | E2E-011 | TC-011 |
| BR-004 (설정 저장) | UT-025 | E2E-016 | - |

---

## 관련 문서

- 설계 문서: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md`

---

<!--
TSK-06-20 테스트 명세서
Version: 1.0
Created: 2026-01-23
-->
