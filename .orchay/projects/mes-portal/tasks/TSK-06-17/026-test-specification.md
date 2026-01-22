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
| Task ID | TSK-06-17 |
| Task명 | [샘플] 자재 입출고 내역 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-22 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | 필터링 함수, 커스텀 훅 | 80% 이상 |
| E2E 테스트 | 주요 사용자 시나리오 6개 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 반응형 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터 | mock-data/material-history.json |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | filterMaterialHistory | 자재명 필터 | 포함하는 항목만 반환 | FR-001 |
| UT-002 | filterMaterialHistory | 입출고유형 필터 | 해당 유형만 반환 | FR-001 |
| UT-003 | filterMaterialHistory | 기간 필터 | 기간 내 항목만 반환 | FR-002 |
| UT-004 | filterMaterialHistory | 복합 필터 | 모든 조건 만족 항목 | FR-001, FR-002 |
| UT-005 | useMaterialHistory | 초기 로드 | 일자 내림차순 정렬 | BR-05 |
| UT-006 | useMaterialHistory | 삭제 처리 | 삭제된 항목 제외 | FR-005 |

### 2.2 테스트 케이스 상세

#### UT-001: filterMaterialHistory 자재명 필터

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/MaterialHistory/__tests__/useMaterialHistory.spec.ts` |
| **테스트 블록** | `describe('filterMaterialHistory') → it('should filter by material name')` |
| **입력 데이터** | `{ materialName: '원자재' }` |
| **검증 포인트** | 자재명에 '원자재' 포함하는 항목만 반환 |
| **커버리지 대상** | filterMaterialHistory 함수 materialName 분기 |
| **관련 요구사항** | FR-001, BR-02 |

#### UT-002: filterMaterialHistory 입출고유형 필터

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/MaterialHistory/__tests__/useMaterialHistory.spec.ts` |
| **테스트 블록** | `describe('filterMaterialHistory') → it('should filter by transaction type')` |
| **입력 데이터** | `{ transactionType: 'in' }` |
| **검증 포인트** | 입고(in) 항목만 반환 |
| **커버리지 대상** | filterMaterialHistory 함수 transactionType 분기 |
| **관련 요구사항** | FR-001 |

#### UT-003: filterMaterialHistory 기간 필터

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/MaterialHistory/__tests__/useMaterialHistory.spec.ts` |
| **테스트 블록** | `describe('filterMaterialHistory') → it('should filter by date range')` |
| **입력 데이터** | `{ dateRange: ['2026-01-01', '2026-01-15'] }` |
| **검증 포인트** | 기간 내 항목만 반환 |
| **커버리지 대상** | filterMaterialHistory 함수 dateRange 분기 |
| **관련 요구사항** | FR-002, BR-01 |

#### UT-004: filterMaterialHistory 복합 필터

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/MaterialHistory/__tests__/useMaterialHistory.spec.ts` |
| **테스트 블록** | `describe('filterMaterialHistory') → it('should apply multiple filters')` |
| **입력 데이터** | `{ materialName: '원자재', transactionType: 'in', dateRange: ['2026-01-01', '2026-01-31'] }` |
| **검증 포인트** | 모든 조건 만족하는 항목만 반환 |
| **커버리지 대상** | filterMaterialHistory 함수 전체 |
| **관련 요구사항** | FR-001, FR-002 |

#### UT-005: useMaterialHistory 초기 로드

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/MaterialHistory/__tests__/useMaterialHistory.spec.ts` |
| **테스트 블록** | `describe('useMaterialHistory') → it('should load data sorted by date desc')` |
| **검증 포인트** | 반환된 배열이 transactionDate 내림차순 정렬 |
| **커버리지 대상** | useMaterialHistory 훅 초기 로드 |
| **관련 요구사항** | BR-05 |

#### UT-006: useMaterialHistory 삭제 처리

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/MaterialHistory/__tests__/useMaterialHistory.spec.ts` |
| **테스트 블록** | `describe('useMaterialHistory') → it('should delete selected items')` |
| **입력 데이터** | 삭제 대상 ID 배열 |
| **검증 포인트** | 삭제 후 목록에서 해당 ID 제외 |
| **커버리지 대상** | deleteItems 함수 |
| **관련 요구사항** | FR-005 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 자재명 검색 | 페이지 로드 | 1. 자재명 입력 2. 조회 클릭 | 필터링된 목록 | FR-001 |
| E2E-002 | 기간 선택 조회 | 페이지 로드 | 1. 기간 선택 2. 조회 클릭 | 기간 내 데이터만 표시 | FR-002 |
| E2E-003 | 컬럼 정렬 | 데이터 로드 | 컬럼 헤더 클릭 | 정렬 토글 | FR-003 |
| E2E-004 | 행 선택 | 데이터 로드 | 체크박스 클릭 | 선택 건수 업데이트 | FR-004 |
| E2E-005 | 일괄 삭제 | 행 선택됨 | 1. 삭제 클릭 2. 확인 | 삭제 완료 | FR-005 |
| E2E-006 | 컬럼 리사이즈 | 데이터 로드 | 컬럼 경계 드래그 | 컬럼 너비 변경 | FR-006 |

### 3.2 테스트 케이스 상세

#### E2E-001: 자재명 검색

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/material-history.spec.ts` |
| **테스트명** | `test('사용자가 자재명으로 검색할 수 있다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="material-history-page"]` |
| - 자재명 입력 | `[data-testid="search-field-materialName"]` |
| - 조회 버튼 | `[data-testid="search-btn"]` |
| - 테이블 | `[data-testid="data-table"]` |
| **실행 단계** | |
| 1 | `await page.fill('[data-testid="search-field-materialName"]', '원자재')` |
| 2 | `await page.click('[data-testid="search-btn"]')` |
| **검증 포인트** | 테이블 행에 '원자재' 포함하는 데이터만 표시 |
| **스크린샷** | `e2e-001-search-result.png` |
| **관련 요구사항** | FR-001, BR-02 |

#### E2E-002: 기간 선택 조회

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/material-history.spec.ts` |
| **테스트명** | `test('사용자가 기간으로 필터링할 수 있다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 기간 선택 | `[data-testid="search-field-dateRange"]` |
| - 조회 버튼 | `[data-testid="search-btn"]` |
| **실행 단계** | |
| 1 | RangePicker에서 시작일/종료일 선택 |
| 2 | `await page.click('[data-testid="search-btn"]')` |
| **검증 포인트** | 선택 기간 내 데이터만 표시 |
| **스크린샷** | `e2e-002-date-range.png` |
| **관련 요구사항** | FR-002, BR-01 |

#### E2E-003: 컬럼 정렬

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/material-history.spec.ts` |
| **테스트명** | `test('사용자가 컬럼 헤더 클릭으로 정렬할 수 있다')` |
| **사전조건** | 데이터 로드 완료 |
| **data-testid 셀렉터** | |
| - 수량 컬럼 헤더 | `.ant-table-column-title:has-text("수량")` |
| **실행 단계** | |
| 1 | `await page.click('.ant-table-column-title:has-text("수량")')` |
| **검증 포인트** | 정렬 아이콘 변경, 데이터 정렬 |
| **스크린샷** | `e2e-003-sort.png` |
| **관련 요구사항** | FR-003 |

#### E2E-004: 행 선택

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/material-history.spec.ts` |
| **테스트명** | `test('사용자가 체크박스로 행을 선택할 수 있다')` |
| **사전조건** | 데이터 로드 완료 |
| **data-testid 셀렉터** | |
| - 행 체크박스 | `.ant-table-row .ant-checkbox-input` |
| - 선택 건수 | `[data-testid="selected-count"]` |
| **실행 단계** | |
| 1 | `await page.click('.ant-table-row:first-child .ant-checkbox-input')` |
| 2 | `await page.click('.ant-table-row:nth-child(2) .ant-checkbox-input')` |
| **검증 포인트** | 선택 건수 "2건" 표시 |
| **스크린샷** | `e2e-004-selection.png` |
| **관련 요구사항** | FR-004 |

#### E2E-005: 일괄 삭제

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/material-history.spec.ts` |
| **테스트명** | `test('사용자가 선택한 항목을 일괄 삭제할 수 있다')` |
| **사전조건** | 2건 이상 선택됨 |
| **data-testid 셀렉터** | |
| - 삭제 버튼 | `[data-testid="delete-btn"]` |
| - 확인 다이얼로그 | `[data-testid="confirm-dialog"]` |
| - 확인 버튼 | `[data-testid="confirm-ok-btn"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="delete-btn"]')` |
| 2 | `await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()` |
| 3 | `await page.click('[data-testid="confirm-ok-btn"]')` |
| **검증 포인트** | 성공 Toast 표시, 삭제된 행 목록에서 제거 |
| **스크린샷** | `e2e-005-delete-confirm.png`, `e2e-005-delete-result.png` |
| **관련 요구사항** | FR-005, BR-03 |

#### E2E-006: 컬럼 리사이즈

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/material-history.spec.ts` |
| **테스트명** | `test('사용자가 컬럼 너비를 조절할 수 있다')` |
| **사전조건** | 데이터 로드 완료 |
| **data-testid 셀렉터** | |
| - 리사이즈 핸들 | `[data-testid="resize-handle"]` |
| **실행 단계** | |
| 1 | 리사이즈 핸들 드래그 |
| **검증 포인트** | 컬럼 너비 변경됨 |
| **스크린샷** | `e2e-006-resize.png` |
| **관련 요구사항** | FR-006 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 검색 조건 입력 | 페이지 로드 | 각 필드 입력 | 입력값 유지 | High | FR-001 |
| TC-002 | RangePicker 동작 | 페이지 로드 | 기간 선택 | 날짜 표시 | High | FR-002 |
| TC-003 | 테이블 정렬 | 데이터 로드 | 헤더 클릭 | 정렬 토글 | Medium | FR-003 |
| TC-004 | 행 다중 선택 | 데이터 로드 | 체크박스 클릭 | 선택 표시 | Medium | FR-004 |
| TC-005 | 삭제 확인 다이얼로그 | 행 선택 | 삭제 클릭 | 다이얼로그 표시 | High | FR-005, BR-03 |
| TC-006 | 컬럼 리사이즈 | 데이터 로드 | 경계 드래그 | 너비 변경 | Low | FR-006 |
| TC-007 | Empty State | 검색 결과 없음 | 조회 | Empty 컴포넌트 | Medium | - |
| TC-008 | 반응형 레이아웃 | - | 브라우저 크기 조절 | 레이아웃 적응 | Low | - |
| TC-009 | 페이지네이션 | 다량 데이터 | 페이지 이동 | 데이터 변경 | Medium | FR-003 |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 검색 조건 입력

**테스트 목적**: 검색 조건 필드가 정상적으로 동작하는지 확인

**테스트 단계**:
1. 자재 입출고 내역 페이지 접근
2. 자재명 입력란에 "원자재" 입력
3. 입출고유형에서 "입고" 선택
4. 조회 버튼 클릭

**예상 결과**:
- 입력값이 유지됨
- 조건에 맞는 데이터만 표시

**검증 기준**:
- [ ] 자재명 입력 가능
- [ ] 입출고유형 선택 가능
- [ ] 초기화 시 모든 조건 리셋

#### TC-002: RangePicker 동작

**테스트 목적**: 기간 선택기가 정상 동작하는지 확인

**테스트 단계**:
1. 기간 필드 클릭
2. 시작일 선택
3. 종료일 선택
4. 조회 버튼 클릭

**예상 결과**:
- 선택한 기간이 필드에 표시
- 해당 기간 데이터만 조회

**검증 기준**:
- [ ] 날짜 선택 가능
- [ ] 시작일이 종료일보다 이후인 경우 경고
- [ ] 선택 후 조회 정상 동작

#### TC-005: 삭제 확인 다이얼로그

**테스트 목적**: 삭제 전 확인 다이얼로그가 표시되는지 확인

**테스트 단계**:
1. 체크박스로 2건 선택
2. 삭제 버튼 클릭
3. 확인 다이얼로그 확인
4. 취소 버튼 클릭 → 다이얼로그 닫힘 확인
5. 다시 삭제 클릭 → 확인 클릭

**예상 결과**:
- 다이얼로그에 "2건의 항목을 삭제하시겠습니까?" 표시
- 취소 시 상태 유지
- 확인 시 삭제 완료

**검증 기준**:
- [ ] 삭제 건수 정확히 표시
- [ ] 취소 정상 동작
- [ ] 확인 후 삭제 및 Toast 표시

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-MATERIAL-01 | 입고 데이터 | `{ id: 'mat-1', materialName: '원자재A', transactionType: 'in', quantity: 100, transactionDate: '2026-01-20' }` |
| MOCK-MATERIAL-02 | 출고 데이터 | `{ id: 'mat-2', materialName: '원자재B', transactionType: 'out', quantity: 50, transactionDate: '2026-01-19' }` |
| MOCK-MATERIAL-03 | 기간 외 데이터 | `{ id: 'mat-3', materialName: '부자재C', transactionType: 'in', quantity: 200, transactionDate: '2025-12-15' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-MATERIAL-BASE | 기본 E2E 환경 | mock-data/material-history.json | 입출고 내역 30건 |
| SEED-MATERIAL-EMPTY | 빈 환경 | 빈 배열 | 데이터 없음 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 기능 테스트 |
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 기능 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지별 셀렉터

#### 자재 입출고 내역 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `material-history-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `search-condition-card` | 검색 조건 카드 | 검색 영역 확인 |
| `search-field-materialName` | 자재명 입력 | 자재명 검색 |
| `search-field-transactionType` | 입출고유형 Select | 유형 필터 |
| `search-field-dateRange` | 기간 RangePicker | 기간 필터 |
| `search-btn` | 조회 버튼 | 검색 실행 |
| `reset-btn` | 초기화 버튼 | 조건 초기화 |
| `delete-btn` | 삭제 버튼 | 일괄 삭제 |
| `export-btn` | 내보내기 버튼 | 데이터 내보내기 |
| `selected-count` | 선택 건수 | 선택 건수 확인 |
| `total-count` | 총 건수 | 전체 건수 확인 |
| `data-table` | 테이블 | 데이터 표시 |
| `confirm-dialog` | 삭제 확인 다이얼로그 | 다이얼로그 표시 확인 |
| `confirm-ok-btn` | 확인 버튼 | 삭제 확인 |
| `confirm-cancel-btn` | 취소 버튼 | 삭제 취소 |

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
TSK-06-17 테스트 명세서
Version: 1.0
Created: 2026-01-22
-->
