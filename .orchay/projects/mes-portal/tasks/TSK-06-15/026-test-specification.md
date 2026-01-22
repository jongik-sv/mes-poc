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
| Task ID | TSK-06-15 |
| Task명 | [샘플] 재고 현황 조회 |
| 상세설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-22 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | ItemSelect, InventoryDescriptions, TransactionTable, StockTrendChart, 상태 계산 | 80% 이상 |
| E2E 테스트 | 품목 선택 → 상세 조회 → 탭 전환 → 필터링 전체 흐름 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 반응형, 접근성 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터 | mock-data/inventory.json |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | ItemSelect | 품목 검색 필터링 | 입력에 맞는 품목 필터링 | FR-001 |
| UT-002 | InventoryDescriptions | 상세 정보 렌더링 | 모든 필드 정상 표시 | FR-002 |
| UT-003 | TransactionTable | 이력 목록 정렬 | 최신순 정렬 확인 | FR-003, BR-002 |
| UT-004 | StockTrendChart | 차트 데이터 변환 | 30일 데이터 표시 | FR-004, BR-004 |
| UT-005 | InventoryDetail | 로딩/빈 상태 표시 | 상태별 올바른 UI | FR-005 |
| UT-006 | TransactionTable | 기간 필터링 | 선택 기간 이력만 표시 | FR-006, BR-003 |
| UT-007 | getStockStatus | 재고 상태 계산 | 상태값 정확성 | BR-001 |

### 2.2 테스트 케이스 상세

#### UT-001: ItemSelect 품목 검색 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/InventoryDetail/__tests__/ItemSelect.spec.tsx` |
| **테스트 블록** | `describe('ItemSelect') → it('should filter items by search input')` |
| **Mock 의존성** | inventory.json items 데이터 |
| **입력 데이터** | 검색어: "알루미늄" |
| **검증 포인트** | 드롭다운에 "알루미늄" 포함 품목만 표시 |
| **커버리지 대상** | ItemSelect 컴포넌트 검색 필터 로직 |
| **관련 요구사항** | FR-001 |

#### UT-002: InventoryDescriptions 상세 정보 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/InventoryDetail/__tests__/InventoryDescriptions.spec.tsx` |
| **테스트 블록** | `describe('InventoryDescriptions') → it('should render all inventory details')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ code: 'RAW-A-001', name: '알루미늄 판재 6mm', currentStock: 1500, safetyStock: 500, ... }` |
| **검증 포인트** | 품목코드, 품목명, 현재재고, 안전재고 등 모든 항목 렌더링 |
| **커버리지 대상** | InventoryDescriptions 컴포넌트 렌더링 |
| **관련 요구사항** | FR-002 |

#### UT-003: TransactionTable 이력 목록 정렬

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/InventoryDetail/__tests__/TransactionTable.spec.tsx` |
| **테스트 블록** | `describe('TransactionTable') → it('should sort transactions by date descending')` |
| **Mock 의존성** | - |
| **입력 데이터** | 정렬되지 않은 거래 내역 배열 |
| **검증 포인트** | 첫 번째 행의 날짜가 가장 최신 |
| **커버리지 대상** | TransactionTable 정렬 로직 |
| **관련 요구사항** | FR-003, BR-002 |

#### UT-004: StockTrendChart 차트 데이터 변환

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/InventoryDetail/__tests__/StockTrendChart.spec.tsx` |
| **테스트 블록** | `describe('StockTrendChart') → it('should display 30 days of trend data')` |
| **Mock 의존성** | - |
| **입력 데이터** | 30일치 재고 추이 데이터 |
| **검증 포인트** | 차트에 30개 데이터 포인트, 안전재고선 표시 |
| **커버리지 대상** | StockTrendChart 데이터 변환 및 렌더링 |
| **관련 요구사항** | FR-004, BR-004 |

#### UT-005: InventoryDetail 로딩/빈 상태 표시

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/InventoryDetail/__tests__/InventoryDetail.spec.tsx` |
| **테스트 블록** | `describe('InventoryDetail') → it('should show empty state when no item selected')` |
| **Mock 의존성** | - |
| **입력 데이터** | selectedItem: null |
| **검증 포인트** | Empty 컴포넌트 렌더링, "품목을 선택해주세요" 메시지 |
| **커버리지 대상** | InventoryDetail 상태별 조건 렌더링 |
| **관련 요구사항** | FR-005 |

#### UT-006: TransactionTable 기간 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/InventoryDetail/__tests__/TransactionTable.spec.tsx` |
| **테스트 블록** | `describe('TransactionTable') → it('should filter transactions by date range')` |
| **Mock 의존성** | - |
| **입력 데이터** | dateRange: ['2026-01-15', '2026-01-20'] |
| **검증 포인트** | 해당 기간 내 거래만 테이블에 표시 |
| **커버리지 대상** | TransactionTable 필터링 로직 |
| **관련 요구사항** | FR-006, BR-003 |

#### UT-007: getStockStatus 재고 상태 계산

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/InventoryDetail/__tests__/utils.spec.ts` |
| **테스트 블록** | `describe('getStockStatus') → it('should return correct status based on stock levels')` |
| **Mock 의존성** | - |
| **입력 데이터** | 여러 재고/안전재고 조합 |
| **검증 포인트** | |
| - | currentStock >= safetyStock * 1.5 → 'normal' |
| - | safetyStock <= currentStock < safetyStock * 1.5 → 'warning' |
| - | currentStock < safetyStock → 'danger' |
| **커버리지 대상** | getStockStatus 유틸 함수 |
| **관련 요구사항** | BR-001 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 품목 검색 및 선택 | 로그인 상태 | 1. 화면 접속 2. 검색 입력 3. 품목 선택 | 상세 정보 로딩 | FR-001 |
| E2E-002 | 상세 정보 표시 | 품목 선택됨 | 1. 상세 정보 확인 | Descriptions 표시 | FR-002, BR-001 |
| E2E-003 | 입출고 이력 조회 | 품목 선택됨 | 1. 이력 탭 확인 | 테이블 표시 | FR-003, BR-002 |
| E2E-004 | 재고 추이 차트 | 품목 선택됨 | 1. 추이 탭 클릭 | 차트 표시 | FR-004, BR-004 |
| E2E-005 | 빈 상태 표시 | 화면 진입 | 1. 품목 미선택 상태 확인 | Empty 표시 | FR-005 |
| E2E-006 | 기간 필터링 | 이력 탭 표시 | 1. 기간 선택 2. 검색 | 필터링된 이력 | FR-006, BR-003 |

### 3.2 테스트 케이스 상세

#### E2E-001: 품목 검색 및 선택

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/inventory-detail.spec.ts` |
| **테스트명** | `test('사용자가 품목을 검색하여 선택할 수 있다')` |
| **사전조건** | 로그인 완료, 재고 현황 화면 접근 가능 |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="inventory-detail-page"]` |
| - 품목 선택 | `[data-testid="item-select"]` |
| - 드롭다운 옵션 | `[data-testid="item-option"]` |
| **실행 단계** | |
| 1 | `await page.goto('/sample/inventory-detail')` |
| 2 | `await page.fill('[data-testid="item-select"] input', '알루미늄')` |
| 3 | `await page.click('[data-testid="item-option"]:first-child')` |
| **검증 포인트** | `expect(page.locator('[data-testid="inventory-descriptions"]')).toBeVisible()` |
| **스크린샷** | `e2e-001-item-select.png` |
| **관련 요구사항** | FR-001 |

#### E2E-002: 상세 정보 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/inventory-detail.spec.ts` |
| **테스트명** | `test('품목 선택 후 상세 정보가 표시된다')` |
| **사전조건** | 품목 선택 완료 |
| **data-testid 셀렉터** | |
| - Descriptions | `[data-testid="inventory-descriptions"]` |
| - 품목코드 | `[data-testid="item-code"]` |
| - 현재재고 | `[data-testid="current-stock"]` |
| - 재고상태 | `[data-testid="stock-status"]` |
| **검증 포인트** | |
| 1 | `expect(page.locator('[data-testid="item-code"]')).toContainText('RAW-A-001')` |
| 2 | `expect(page.locator('[data-testid="stock-status"]')).toHaveClass(/success|warning|error/)` |
| **스크린샷** | `e2e-002-descriptions.png` |
| **관련 요구사항** | FR-002, BR-001 |

#### E2E-003: 입출고 이력 조회

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/inventory-detail.spec.ts` |
| **테스트명** | `test('입출고 이력 탭에서 거래 내역을 확인할 수 있다')` |
| **사전조건** | 품목 선택 완료 |
| **data-testid 셀렉터** | |
| - 이력 탭 | `[data-testid="tab-transactions"]` |
| - 이력 테이블 | `[data-testid="transaction-table"]` |
| - 테이블 행 | `[data-testid="transaction-row"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="tab-transactions"]')` |
| **검증 포인트** | |
| 1 | `expect(page.locator('[data-testid="transaction-table"]')).toBeVisible()` |
| 2 | `expect(page.locator('[data-testid="transaction-row"]').first()).toContainText(/입고|출고/)` |
| **스크린샷** | `e2e-003-transactions.png` |
| **관련 요구사항** | FR-003, BR-002 |

#### E2E-004: 재고 추이 차트

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/inventory-detail.spec.ts` |
| **테스트명** | `test('재고 추이 탭에서 차트를 확인할 수 있다')` |
| **사전조건** | 품목 선택 완료 |
| **data-testid 셀렉터** | |
| - 추이 탭 | `[data-testid="tab-trend"]` |
| - 차트 컨테이너 | `[data-testid="trend-chart"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="tab-trend"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="trend-chart"] canvas')).toBeVisible()` |
| **스크린샷** | `e2e-004-trend-chart.png` |
| **관련 요구사항** | FR-004, BR-004 |

#### E2E-005: 빈 상태 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/inventory-detail.spec.ts` |
| **테스트명** | `test('품목 미선택 시 빈 상태가 표시된다')` |
| **사전조건** | 로그인 완료 |
| **data-testid 셀렉터** | |
| - 빈 상태 | `[data-testid="empty-state"]` |
| **실행 단계** | |
| 1 | `await page.goto('/sample/inventory-detail')` |
| **검증 포인트** | |
| 1 | `expect(page.locator('[data-testid="empty-state"]')).toBeVisible()` |
| 2 | `expect(page.locator('[data-testid="empty-state"]')).toContainText('품목을 선택해주세요')` |
| **스크린샷** | `e2e-005-empty-state.png` |
| **관련 요구사항** | FR-005 |

#### E2E-006: 기간 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/inventory-detail.spec.ts` |
| **테스트명** | `test('기간 선택 시 입출고 이력이 필터링된다')` |
| **사전조건** | 품목 선택됨, 이력 탭 표시 |
| **data-testid 셀렉터** | |
| - 기간 선택 | `[data-testid="date-range-picker"]` |
| - 검색 버튼 | `[data-testid="search-btn"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="date-range-picker"]')` |
| 2 | 시작일, 종료일 선택 |
| 3 | `await page.click('[data-testid="search-btn"]')` |
| **검증 포인트** | 테이블 행이 선택 기간 내 데이터만 표시 |
| **스크린샷** | `e2e-006-date-filter.png` |
| **관련 요구사항** | FR-006, BR-003 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 품목 검색 | 화면 진입 | 1. 검색어 입력 2. 결과 확인 | 실시간 필터링 | High | FR-001 |
| TC-002 | 상세 정보 표시 | 품목 선택 | 1. Descriptions 확인 | 모든 항목 표시 | High | FR-002 |
| TC-003 | 입출고 이력 | 품목 선택 | 1. 테이블 확인 2. 정렬 확인 | 최신순 정렬 | High | FR-003 |
| TC-004 | 재고 추이 차트 | 품목 선택 | 1. 탭 전환 2. 차트 확인 | 라인 차트 표시 | Medium | FR-004 |
| TC-005 | 로딩/빈 상태 | 화면 진입 | 1. 초기 상태 확인 | Empty 컴포넌트 | Medium | FR-005 |
| TC-006 | 기간 필터 | 이력 탭 | 1. 기간 선택 2. 결과 확인 | 필터링 동작 | Medium | FR-006 |
| TC-007 | 반응형 확인 | - | 1. 화면 크기 변경 | 레이아웃 적응 | Medium | - |
| TC-008 | 키보드 네비게이션 | - | 1. Tab/Enter로 탐색 | 접근 가능 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 품목 검색

**테스트 목적**: 사용자가 AutoComplete에서 품목을 검색하고 선택할 수 있는지 확인

**테스트 단계**:
1. 재고 현황 화면 진입
2. 품목 선택 AutoComplete에 "알루미늄" 입력
3. 드롭다운에 검색 결과 확인
4. 원하는 품목 클릭하여 선택

**예상 결과**:
- 입력과 동시에 드롭다운이 열림
- 입력어를 포함하는 품목만 필터링됨
- 선택 후 AutoComplete에 선택된 품목 표시

**검증 기준**:
- [ ] 실시간 필터링 동작
- [ ] 검색 결과 없을 때 "검색 결과 없음" 표시
- [ ] 선택 후 상세 정보 로딩 시작

#### TC-002: 상세 정보 표시

**테스트 목적**: 선택한 품목의 재고 상세 정보가 올바르게 표시되는지 확인

**테스트 단계**:
1. 품목 선택 완료
2. Descriptions 영역에서 각 항목 확인

**예상 결과**:
- 품목코드, 품목명, 카테고리, 규격 표시
- 현재 재고, 안전 재고 수치 표시
- 재고 상태 Tag (색상 구분)
- 최종 입/출고일 표시

**검증 기준**:
- [ ] 모든 항목 정상 렌더링
- [ ] 재고 상태 색상이 규칙에 맞음 (정상:녹색, 주의:주황, 부족:빨강)
- [ ] 날짜 형식 YYYY-MM-DD

#### TC-007: 반응형 확인

**테스트 목적**: 다양한 화면 크기에서 레이아웃이 올바르게 조정되는지 확인

**테스트 단계**:
1. 데스크톱 크기 (1920x1080)에서 확인
2. 태블릿 크기 (768x1024)에서 확인
3. 모바일 크기 (375x667)에서 확인

**예상 결과**:
- 데스크톱: Descriptions 3열, 테이블 전체 컬럼
- 태블릿: Descriptions 2열, 테이블 스크롤
- 모바일: Descriptions 1열, 테이블 수평 스크롤

**검증 기준**:
- [ ] 레이아웃 깨짐 없음
- [ ] 텍스트 잘림 없음
- [ ] 터치 친화적 버튼 크기 (모바일)

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-ITEM-01 | 정상 재고 품목 | `{ id: 'item-001', code: 'RAW-A-001', name: '알루미늄 판재 6mm', currentStock: 1500, safetyStock: 500, status: 'normal' }` |
| MOCK-ITEM-02 | 주의 상태 품목 | `{ id: 'item-002', code: 'RAW-B-002', name: '스테인리스 파이프', currentStock: 150, safetyStock: 200, status: 'warning' }` |
| MOCK-ITEM-03 | 부족 상태 품목 | `{ id: 'item-003', code: 'RAW-C-003', name: '구리 판재', currentStock: 50, safetyStock: 300, status: 'danger' }` |
| MOCK-TX-01 | 입고 거래 | `{ id: 'tx-001', itemId: 'item-001', type: 'in', quantity: 500, date: '2026-01-20T10:00:00', handler: '이자재' }` |
| MOCK-TX-02 | 출고 거래 | `{ id: 'tx-002', itemId: 'item-001', type: 'out', quantity: 200, date: '2026-01-21T14:30:00', handler: '김생산' }` |
| MOCK-TREND-01 | 재고 추이 | `[{ itemId: 'item-001', date: '2026-01-14', stock: 1200 }, ...]` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-INVENTORY | 기본 E2E 환경 | mock-data/inventory.json | 품목 10개, 거래 50건, 추이 300건 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지별 셀렉터

#### 재고 현황 조회 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `inventory-detail-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `item-select` | AutoComplete | 품목 검색 |
| `item-option` | AutoComplete 옵션 | 품목 선택 |
| `inventory-descriptions` | Descriptions 컨테이너 | 상세 정보 표시 확인 |
| `item-code` | 품목코드 셀 | 품목코드 확인 |
| `item-name` | 품목명 셀 | 품목명 확인 |
| `current-stock` | 현재재고 셀 | 현재재고 확인 |
| `safety-stock` | 안전재고 셀 | 안전재고 확인 |
| `stock-status` | 재고상태 Tag | 상태 색상 확인 |
| `empty-state` | Empty 컴포넌트 | 빈 상태 표시 확인 |
| `loading-skeleton` | Skeleton | 로딩 상태 확인 |

#### 탭 영역

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `tab-transactions` | 입출고 이력 탭 | 탭 전환 |
| `tab-trend` | 재고 추이 탭 | 탭 전환 |
| `transaction-table` | 이력 테이블 | 테이블 표시 확인 |
| `transaction-row` | 테이블 행 | 행 데이터 확인 |
| `date-range-picker` | RangePicker | 기간 선택 |
| `search-btn` | 검색 버튼 | 필터 적용 |
| `trend-chart` | 차트 컨테이너 | 차트 표시 확인 |

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
TSK-06-15 테스트 명세서
Version: 1.0
Created: 2026-01-22
-->
