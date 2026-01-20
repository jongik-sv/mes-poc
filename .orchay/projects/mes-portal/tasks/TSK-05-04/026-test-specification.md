# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-05-04 |
| Task명 | 테이블 공통 기능 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | DataTable 컴포넌트, useTableColumns 훅 | 80% 이상 |
| E2E 테스트 | 정렬, 페이징, 선택, 리사이즈 사용자 시나리오 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 | 전체 기능 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 컴포넌트 테스트 | Vitest + @testing-library/react |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | DataTable | 컬럼 헤더 클릭 시 오름차순 정렬 | sortOrder가 'ascend'로 변경 | FR-001 |
| UT-002 | DataTable | 동일 컬럼 재클릭 시 내림차순 | sortOrder가 'descend'로 변경 | FR-001 |
| UT-003 | DataTable | 페이지 번호 클릭 시 이동 | current 값 변경, onChange 호출 | FR-002 |
| UT-004 | DataTable | 페이지 크기 변경 | pageSize 변경, 첫 페이지로 이동 | FR-002 |
| UT-005 | DataTable | 단일 행 클릭 시 선택 | selectedRowKeys에 해당 key 포함 | FR-003 |
| UT-006 | DataTable | 체크박스 클릭 시 다중 선택 | selectedRowKeys에 추가 | FR-003 |
| UT-007 | DataTable | 전체 선택 체크박스 클릭 | 현재 페이지 전체 선택 | FR-003 |
| UT-008 | useTableColumns | 컬럼 너비 드래그 | 해당 컬럼 width 값 변경 | FR-004 |
| UT-009 | DataTable | 페이지 크기 옵션 | 10, 20, 50, 100 옵션만 표시 | BR-001 |
| UT-010 | DataTable | 다른 컬럼 정렬 시 기존 해제 | 이전 컬럼 sortOrder null | BR-002 |
| UT-011 | useTableColumns | 최소 너비 제한 | 50px 이하로 줄어들지 않음 | BR-003 |
| UT-012 | DataTable | 전체 선택 범위 | 페이지 이동 시 이전 선택 유지 여부 | BR-004 |

### 2.2 테스트 케이스 상세

#### UT-001: 컬럼 헤더 클릭 시 오름차순 정렬

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DataTable.spec.tsx` |
| **테스트 블록** | `describe('DataTable') → describe('sorting') → it('should sort ascending on header click')` |
| **Mock 의존성** | - |
| **입력 데이터** | columns with sorter: true, dataSource: [{id: 1, name: 'B'}, {id: 2, name: 'A'}] |
| **검증 포인트** | 헤더 클릭 후 onChange 호출, sorter.order === 'ascend' |
| **커버리지 대상** | DataTable 정렬 로직 |
| **관련 요구사항** | FR-001 |

#### UT-002: 동일 컬럼 재클릭 시 내림차순

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DataTable.spec.tsx` |
| **테스트 블록** | `describe('DataTable') → describe('sorting') → it('should toggle to descending on second click')` |
| **Mock 의존성** | - |
| **입력 데이터** | 이미 오름차순 정렬된 상태 |
| **검증 포인트** | 재클릭 후 sorter.order === 'descend' |
| **커버리지 대상** | DataTable 정렬 토글 로직 |
| **관련 요구사항** | FR-001 |

#### UT-003: 페이지 번호 클릭 시 이동

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DataTable.spec.tsx` |
| **테스트 블록** | `describe('DataTable') → describe('pagination') → it('should change page on click')` |
| **Mock 의존성** | - |
| **입력 데이터** | dataSource: 30개 항목, pageSize: 10 |
| **검증 포인트** | 페이지 2 클릭 후 pagination.current === 2 |
| **커버리지 대상** | DataTable 페이지네이션 |
| **관련 요구사항** | FR-002 |

#### UT-004: 페이지 크기 변경

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DataTable.spec.tsx` |
| **테스트 블록** | `describe('DataTable') → describe('pagination') → it('should change page size and reset to first page')` |
| **Mock 의존성** | - |
| **입력 데이터** | 현재 페이지 3, pageSize: 10 |
| **검증 포인트** | pageSize 20 선택 후 current === 1, pageSize === 20 |
| **커버리지 대상** | DataTable 페이지 크기 변경 로직 |
| **관련 요구사항** | FR-002 |

#### UT-005: 단일 행 클릭 시 선택

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DataTable.spec.tsx` |
| **테스트 블록** | `describe('DataTable') → describe('row selection') → it('should select single row on click')` |
| **Mock 의존성** | - |
| **입력 데이터** | rowSelection: { type: 'radio' } |
| **검증 포인트** | 행 클릭 후 selectedRowKeys에 해당 key만 포함 |
| **커버리지 대상** | DataTable 단일 선택 |
| **관련 요구사항** | FR-003 |

#### UT-006: 체크박스 클릭 시 다중 선택

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DataTable.spec.tsx` |
| **테스트 블록** | `describe('DataTable') → describe('row selection') → it('should add row to selection on checkbox click')` |
| **Mock 의존성** | - |
| **입력 데이터** | rowSelection: { type: 'checkbox' }, 이미 1개 선택됨 |
| **검증 포인트** | 추가 체크박스 클릭 후 selectedRowKeys.length === 2 |
| **커버리지 대상** | DataTable 다중 선택 |
| **관련 요구사항** | FR-003 |

#### UT-007: 전체 선택 체크박스 클릭

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DataTable.spec.tsx` |
| **테스트 블록** | `describe('DataTable') → describe('row selection') → it('should select all rows in current page on header checkbox click')` |
| **Mock 의존성** | - |
| **입력 데이터** | rowSelection: { type: 'checkbox' }, 현재 페이지 10건 |
| **검증 포인트** | 헤더 체크박스 클릭 후 selectedRowKeys.length === 10 |
| **커버리지 대상** | DataTable 전체 선택 |
| **관련 요구사항** | FR-003 |

#### UT-008: 컬럼 너비 드래그

| 항목 | 내용 |
|------|------|
| **파일** | `lib/hooks/__tests__/useTableColumns.spec.ts` |
| **테스트 블록** | `describe('useTableColumns') → it('should update column width on resize')` |
| **Mock 의존성** | - |
| **입력 데이터** | 초기 columns: [{dataIndex: 'name', width: 100}] |
| **검증 포인트** | handleResize 호출 후 width === 150 |
| **커버리지 대상** | useTableColumns 리사이즈 로직 |
| **관련 요구사항** | FR-004 |

#### UT-009: 페이지 크기 옵션 검증

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DataTable.spec.tsx` |
| **테스트 블록** | `describe('DataTable') → describe('business rules') → it('should only show allowed page size options')` |
| **Mock 의존성** | - |
| **입력 데이터** | 기본 props |
| **검증 포인트** | pageSizeOptions === [10, 20, 50, 100] |
| **커버리지 대상** | DataTable props 기본값 |
| **관련 요구사항** | BR-001 |

#### UT-010: 다른 컬럼 정렬 시 기존 해제

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DataTable.spec.tsx` |
| **테스트 블록** | `describe('DataTable') → describe('business rules') → it('should clear previous sort when sorting different column')` |
| **Mock 의존성** | - |
| **입력 데이터** | 컬럼 A 정렬된 상태 |
| **검증 포인트** | 컬럼 B 클릭 후 A의 sortOrder === null |
| **커버리지 대상** | DataTable 단일 정렬 규칙 |
| **관련 요구사항** | BR-002 |

#### UT-011: 최소 너비 제한

| 항목 | 내용 |
|------|------|
| **파일** | `lib/hooks/__tests__/useTableColumns.spec.ts` |
| **테스트 블록** | `describe('useTableColumns') → it('should not allow width below minimum')` |
| **Mock 의존성** | - |
| **입력 데이터** | 현재 width: 100, 드래그로 30 시도 |
| **검증 포인트** | width === 50 (최소값) |
| **커버리지 대상** | useTableColumns 최소 너비 제한 |
| **관련 요구사항** | BR-003 |

#### UT-012: 전체 선택 범위 (현재 페이지)

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DataTable.spec.tsx` |
| **테스트 블록** | `describe('DataTable') → describe('business rules') → it('should only select current page on select all')` |
| **Mock 의존성** | - |
| **입력 데이터** | 총 30건, 페이지 1에서 전체 선택 |
| **검증 포인트** | selectedRowKeys에 1-10번 항목만 포함 |
| **커버리지 대상** | DataTable 전체 선택 범위 |
| **관련 요구사항** | BR-004 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 컬럼 정렬 | 목록 페이지 로드 | 1. 컬럼 헤더 클릭 2. 재클릭 3. 재클릭 | 오름차순→내림차순→해제 | FR-001 |
| E2E-002 | 페이징 및 크기 변경 | 30건 이상 데이터 | 1. 페이지 2 클릭 2. 크기 20 선택 | 페이지 이동, 크기 변경 | FR-002 |
| E2E-003 | 행 선택 (다중) | 목록 페이지 로드 | 1. 행1 체크 2. 행3 체크 3. 전체 선택 | 다중 선택, 전체 선택 | FR-003 |
| E2E-004 | 컬럼 리사이즈 | 목록 페이지 로드 | 1. 컬럼 경계 드래그 | 컬럼 너비 변경 | FR-004 |

### 3.2 테스트 케이스 상세

#### E2E-001: 컬럼 정렬

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table.spec.ts` |
| **테스트명** | `test('사용자가 컬럼을 정렬할 수 있다')` |
| **사전조건** | 로그인, 샘플 목록 페이지 접속 |
| **data-testid 셀렉터** | |
| - 테이블 | `[data-testid="data-table"]` |
| - 컬럼 헤더 (이름) | `th:has-text("이름")` 또는 `[data-testid="column-header-name"]` |
| - 정렬 아이콘 | `.ant-table-column-sorter` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="column-header-name"]')` |
| 2 | 오름차순 아이콘 활성화 확인 |
| 3 | `await page.click('[data-testid="column-header-name"]')` |
| 4 | 내림차순 아이콘 활성화 확인 |
| 5 | `await page.click('[data-testid="column-header-name"]')` |
| 6 | 정렬 아이콘 비활성화 확인 |
| **검증 포인트** | `expect(page.locator('.ant-table-column-sorter-up.active')).toBeVisible()` |
| **스크린샷** | `e2e-001-sort-asc.png`, `e2e-001-sort-desc.png` |
| **관련 요구사항** | FR-001 |

#### E2E-002: 페이징 및 크기 변경

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table.spec.ts` |
| **테스트명** | `test('사용자가 페이지를 이동하고 크기를 변경할 수 있다')` |
| **사전조건** | 30건 이상 데이터가 있는 목록 페이지 |
| **data-testid 셀렉터** | |
| - 페이지네이션 | `[data-testid="pagination"]` |
| - 페이지 번호 | `.ant-pagination-item` |
| - 페이지 크기 셀렉터 | `.ant-pagination-options-size-changer` |
| **실행 단계** | |
| 1 | `await page.click('.ant-pagination-item-2')` |
| 2 | 페이지 2 활성화 확인 |
| 3 | `await page.click('.ant-pagination-options-size-changer')` |
| 4 | `await page.click('.ant-select-item:has-text("20 / 페이지")')` |
| 5 | 20건 표시 확인 |
| **검증 포인트** | `expect(page.locator('.ant-pagination-item-active')).toHaveText('1')` (크기 변경 후 첫 페이지) |
| **스크린샷** | `e2e-002-page-2.png`, `e2e-002-size-20.png` |
| **관련 요구사항** | FR-002 |

#### E2E-003: 행 선택 (다중)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table.spec.ts` |
| **테스트명** | `test('사용자가 여러 행을 선택할 수 있다')` |
| **사전조건** | 목록 페이지, 다중 선택 모드 |
| **data-testid 셀렉터** | |
| - 행 체크박스 | `.ant-table-row .ant-checkbox-input` |
| - 전체 선택 체크박스 | `.ant-table-thead .ant-checkbox-input` |
| - 선택된 행 | `.ant-table-row-selected` |
| **실행 단계** | |
| 1 | `await page.click('.ant-table-row:nth-child(1) .ant-checkbox-input')` |
| 2 | 1번 행 선택 확인 |
| 3 | `await page.click('.ant-table-row:nth-child(3) .ant-checkbox-input')` |
| 4 | 3번 행 추가 선택 확인 |
| 5 | `await page.click('.ant-table-thead .ant-checkbox-input')` |
| 6 | 전체 행 선택 확인 |
| **검증 포인트** | `expect(page.locator('.ant-table-row-selected')).toHaveCount(10)` (페이지당 10건 기준) |
| **스크린샷** | `e2e-003-multi-select.png`, `e2e-003-select-all.png` |
| **관련 요구사항** | FR-003 |

#### E2E-004: 컬럼 리사이즈

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/data-table.spec.ts` |
| **테스트명** | `test('사용자가 컬럼 너비를 조절할 수 있다')` |
| **사전조건** | 목록 페이지, 리사이즈 가능한 테이블 |
| **data-testid 셀렉터** | |
| - 리사이즈 핸들 | `.react-resizable-handle` |
| - 이름 컬럼 | `th:has-text("이름")` |
| **실행 단계** | |
| 1 | 이름 컬럼의 초기 너비 측정 |
| 2 | `await page.locator('.react-resizable-handle').first().dragTo(...)` |
| 3 | 드래그 후 너비 변경 확인 |
| **검증 포인트** | 컬럼 너비가 증가했는지 확인 |
| **스크린샷** | `e2e-004-resize-before.png`, `e2e-004-resize-after.png` |
| **관련 요구사항** | FR-004 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 컬럼 정렬 | 목록 페이지 | 1. 컬럼 헤더 클릭 | 정렬 토글 동작 | High | FR-001 |
| TC-002 | 페이징 | 30건+ 데이터 | 1. 페이지 이동 2. 크기 변경 | 정상 동작 | High | FR-002 |
| TC-003 | 행 선택 | 목록 페이지 | 1. 체크박스 클릭 2. 전체 선택 | 선택 강조 표시 | High | FR-003 |
| TC-004 | 컬럼 리사이즈 | 목록 페이지 | 1. 컬럼 경계 드래그 | 너비 변경 | Medium | FR-004 |
| TC-005 | 반응형 확인 | - | 1. 브라우저 크기 조절 | 레이아웃 적응 | Medium | - |
| TC-006 | 접근성 확인 | - | 1. 키보드만으로 탐색 | 모든 기능 접근 가능 | Medium | - |
| TC-007 | 로딩 상태 | - | 1. 느린 네트워크 | 로딩 표시 | Low | - |
| TC-008 | 빈 데이터 | 데이터 없음 | 1. 페이지 접속 | Empty 표시 | Medium | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 컬럼 정렬

**테스트 목적**: 컬럼 헤더 클릭 시 정렬이 정상 동작하는지 확인

**테스트 단계**:
1. 샘플 목록 페이지 접속
2. '이름' 컬럼 헤더 클릭
3. 데이터가 오름차순 정렬되는지 확인
4. 동일 헤더 재클릭
5. 데이터가 내림차순 정렬되는지 확인
6. 동일 헤더 3번째 클릭
7. 정렬이 해제되고 원래 순서로 돌아가는지 확인

**예상 결과**:
- 정렬 아이콘이 상태에 따라 변경됨 (↑ → ↓ → 없음)
- 데이터 순서가 정렬 기준에 따라 변경됨

**검증 기준**:
- [ ] 오름차순 정렬 시 정렬 아이콘 ↑ 표시
- [ ] 내림차순 정렬 시 정렬 아이콘 ↓ 표시
- [ ] 정렬 해제 시 아이콘 비활성화

#### TC-002: 페이징

**테스트 목적**: 페이지 이동 및 페이지 크기 변경이 정상 동작하는지 확인

**테스트 단계**:
1. 30건 이상 데이터가 있는 목록 페이지 접속
2. 페이지네이션에서 '2' 클릭
3. 페이지 2의 데이터가 표시되는지 확인
4. 페이지 크기 드롭다운에서 '20' 선택
5. 20건이 표시되고 첫 페이지로 이동하는지 확인

**예상 결과**:
- 페이지 번호 클릭 시 해당 페이지 데이터 표시
- 페이지 크기 변경 시 표시 건수 변경 및 첫 페이지 이동

**검증 기준**:
- [ ] 페이지 번호 클릭 후 해당 페이지 활성화
- [ ] 총 건수 표시 정확
- [ ] 페이지 크기 변경 후 첫 페이지로 이동

#### TC-003: 행 선택

**테스트 목적**: 단일/다중 행 선택이 정상 동작하는지 확인

**테스트 단계**:
1. 목록 페이지 접속
2. 첫 번째 행 체크박스 클릭
3. 행이 선택되고 배경색이 변경되는지 확인
4. 세 번째 행 체크박스 추가 클릭
5. 두 행이 모두 선택되어 있는지 확인
6. 헤더의 전체 선택 체크박스 클릭
7. 현재 페이지의 모든 행이 선택되는지 확인

**예상 결과**:
- 체크박스 클릭 시 해당 행 선택/해제
- 선택된 행은 배경색 강조
- 전체 선택 시 현재 페이지 전체 선택

**검증 기준**:
- [ ] 개별 체크박스 동작 정상
- [ ] 선택된 행 시각적 구분 가능
- [ ] 전체 선택/해제 동작 정상

#### TC-004: 컬럼 리사이즈

**테스트 목적**: 컬럼 너비 조절이 정상 동작하는지 확인

**테스트 단계**:
1. 목록 페이지 접속
2. '이름' 컬럼과 '상태' 컬럼 사이 경계에 마우스 올리기
3. 커서가 리사이즈 커서로 변경되는지 확인
4. 드래그하여 '이름' 컬럼 너비 늘리기
5. 드래그하여 최소 너비까지 줄이기
6. 더 이상 줄어들지 않는지 확인

**예상 결과**:
- 컬럼 경계에서 리사이즈 커서 표시
- 드래그에 따라 실시간으로 너비 변경
- 최소 너비(50px) 이하로는 줄어들지 않음

**검증 기준**:
- [ ] 리사이즈 커서 표시
- [ ] 실시간 너비 변경
- [ ] 최소 너비 제한 동작

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-COLUMNS-BASIC | 기본 컬럼 정의 | `[{title: '이름', dataIndex: 'name', sorter: true}, {title: '상태', dataIndex: 'status'}]` |
| MOCK-COLUMNS-RESIZE | 리사이즈 가능 컬럼 | `[{title: '이름', dataIndex: 'name', width: 150}, {title: '설명', dataIndex: 'desc', width: 200}]` |
| MOCK-DATA-10 | 10건 데이터 | `Array.from({length: 10}, (_, i) => ({id: i+1, name: \`항목 \${i+1}\`, status: 'active'}))` |
| MOCK-DATA-30 | 30건 데이터 (페이징 테스트) | `Array.from({length: 30}, (_, i) => ({id: i+1, name: \`항목 \${i+1}\`, status: i%2 ? 'active' : 'inactive'}))` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-TABLE-BASE | 기본 테이블 환경 | 자동 시드 | 샘플 사용자 50명 |
| SEED-E2E-TABLE-EMPTY | 빈 테이블 | 자동 시드 | 데이터 없음 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 기능 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지별 셀렉터

#### DataTable 컴포넌트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `data-table` | 테이블 컨테이너 | 테이블 로드 확인 |
| `data-table-loading` | 로딩 오버레이 | 로딩 상태 확인 |
| `data-table-empty` | Empty 컴포넌트 | 빈 상태 확인 |
| `column-header-{dataIndex}` | 컬럼 헤더 | 특정 컬럼 정렬 |
| `row-{id}` | 테이블 행 | 특정 행 선택 |
| `row-checkbox-{id}` | 행 체크박스 | 행 선택 |
| `select-all-checkbox` | 전체 선택 체크박스 | 전체 선택 |
| `pagination` | 페이지네이션 컨테이너 | 페이지 컨트롤 |
| `page-size-select` | 페이지 크기 셀렉터 | 크기 변경 |
| `total-count` | 총 건수 표시 | 건수 확인 |
| `resize-handle-{dataIndex}` | 리사이즈 핸들 | 컬럼 리사이즈 |

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

- 설계 문서: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md`

---

<!--
TSK-05-04 테스트 명세서
Version: 1.0
Created: 2026-01-20
-->
