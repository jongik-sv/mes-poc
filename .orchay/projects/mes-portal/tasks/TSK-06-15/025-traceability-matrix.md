# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-22

> **목적**: PRD → 기본설계 → 상세설계 → 테스트 4단계 양방향 추적
>
> **참조**: 이 문서는 `010-design.md`와 `026-test-specification.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-15 |
| Task명 | [샘플] 재고 현황 조회 |
| 상세설계 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-22 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

> PRD → 기본설계 → 상세설계 → 테스트케이스 매핑

| 요구사항 ID | PRD 섹션 | 설계 섹션 | 단위 테스트 | E2E 테스트 | 매뉴얼 TC | 상태 |
|-------------|----------|----------|-------------|------------|-----------|------|
| FR-001 | 4.1.1 상세 화면 샘플 - 품목 선택 | 5.2 화면1, 7.2 | UT-001 | E2E-001 | TC-001 | 설계완료 |
| FR-002 | 4.1.1 상세 화면 샘플 - 상세 정보 표시 | 5.2 화면2, 7.2 | UT-002 | E2E-002 | TC-002 | 설계완료 |
| FR-003 | 4.1.1 상세 화면 샘플 - 입출고 이력 탭 | 5.2 화면2, 7.2 | UT-003 | E2E-003 | TC-003 | 설계완료 |
| FR-004 | 4.1.1 상세 화면 샘플 - 재고 추이 차트 | 5.2 화면3, 7.2 | UT-004 | E2E-004 | TC-004 | 설계완료 |
| FR-005 | 4.1.1 상세 화면 샘플 - 로딩/빈 상태 처리 | 5.2 화면4, 6.2 | UT-005 | E2E-005 | TC-005 | 설계완료 |
| FR-006 | 4.1.1 상세 화면 샘플 - 기간 필터링 | 5.2 화면2, UC-05 | UT-006 | E2E-006 | TC-006 | 설계완료 |

### 1.1 요구사항별 상세 매핑

#### FR-001: 품목 선택 (AutoComplete)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 품목 선택 드롭다운 (AutoComplete) |
| 설계 | 010-design.md | 5.2 화면1 | AutoComplete 컴포넌트, 품목 검색/선택 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-001 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001 |

#### FR-002: 재고 상세 정보 표시 (Descriptions)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 재고 상세 정보 표시 (Descriptions) |
| 설계 | 010-design.md | 5.2 화면2 | Descriptions 컴포넌트, 상세 정보 항목 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-002 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-002 |

#### FR-003: 입출고 이력 탭 (Table + RangePicker)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 입출고 이력 탭 (Table + RangePicker) |
| 설계 | 010-design.md | 5.2 화면2 | Table, RangePicker, 페이징 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-003 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-003 |

#### FR-004: 재고 추이 차트 (Line Chart)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 재고 추이 차트 (Line Chart) |
| 설계 | 010-design.md | 5.2 화면3 | @ant-design/charts Line, 안전재고선 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-004 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-004 |

#### FR-005: 로딩 스켈레톤 및 빈 상태 처리

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 로딩 스켈레톤 및 빈 상태 처리 |
| 설계 | 010-design.md | 5.2 화면4, 6.2 | Skeleton, Empty 컴포넌트 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-005 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-005 |

#### FR-006: 날짜 범위 선택 시 이력 필터링

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 날짜 범위 선택 시 이력 필터링 |
| 설계 | 010-design.md | UC-05 | RangePicker, 필터링 로직 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-006 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-006 |

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD 출처 | 설계 섹션 | 구현 위치(개념) | 단위 테스트 | E2E 테스트 | 검증 방법 | 상태 |
|---------|----------|----------|-----------------|-------------|------------|-----------|------|
| BR-001 | 4.1.1 상세 화면 | 8.2 | 상태 계산 로직 | UT-007 | E2E-002 | 재고 상태 색상 확인 | 설계완료 |
| BR-002 | 4.1.1 상세 화면 | 8.2 | Table 컴포넌트 | UT-003 | E2E-003 | 정렬 순서 확인 | 설계완료 |
| BR-003 | 4.1.1 상세 화면 | 8.2 | 필터 초기값 | UT-006 | E2E-006 | 기본 기간 확인 | 설계완료 |
| BR-004 | 4.1.1 상세 화면 | 8.2 | Chart 데이터 | UT-004 | E2E-004 | 차트 기간 확인 | 설계완료 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-001: 재고 상태 결정 규칙

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 상태별 색상 구분 (녹색/회색/빨강/노랑) |
| **설계 표현** | normal: 녹색(충분), warning: 주황색(주의), danger: 빨간색(부족) |
| **구현 위치** | InventoryDescriptions 컴포넌트, 상태 계산 함수 |
| **검증 방법** | 현재재고 vs 안전재고 비율에 따른 Tag 색상 확인 |
| **관련 테스트** | UT-007, E2E-002 |

#### BR-002: 입출고 이력 최신순 정렬

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 이력 조회 시 시간순 정렬 |
| **설계 표현** | 일시 기준 내림차순(최신순) 정렬 |
| **구현 위치** | TransactionTable 컴포넌트 |
| **검증 방법** | 첫 번째 행이 가장 최근 이력인지 확인 |
| **관련 테스트** | UT-003, E2E-003 |

#### BR-003: 기본 조회 기간 30일

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 기간 필터 미지정 시 기본값 적용 |
| **설계 표현** | 오늘로부터 30일 전까지 기본 표시 |
| **구현 위치** | TransactionTable RangePicker 초기값 |
| **검증 방법** | 초기 로드 시 RangePicker 값 확인 |
| **관련 테스트** | UT-006, E2E-006 |

#### BR-004: 재고 추이 30일 데이터

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 재고 추이 시각화 |
| **설계 표현** | 최근 30일간 일별 재고 데이터 차트 표시 |
| **구현 위치** | StockTrendChart 컴포넌트 |
| **검증 방법** | 차트 X축 범위가 30일인지 확인 |
| **관련 테스트** | UT-004, E2E-004 |

---

## 3. 테스트 역추적 매트릭스

> 테스트 결과 → 요구사항 역추적용 (build/verify 단계 결과서 생성 시 활용)

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-001 | 단위 | FR-001 | - | 미실행 |
| UT-002 | 단위 | FR-002 | - | 미실행 |
| UT-003 | 단위 | FR-003 | BR-002 | 미실행 |
| UT-004 | 단위 | FR-004 | BR-004 | 미실행 |
| UT-005 | 단위 | FR-005 | - | 미실행 |
| UT-006 | 단위 | FR-006 | BR-003 | 미실행 |
| UT-007 | 단위 | - | BR-001 | 미실행 |
| E2E-001 | E2E | FR-001 | - | 미실행 |
| E2E-002 | E2E | FR-002 | BR-001 | 미실행 |
| E2E-003 | E2E | FR-003 | BR-002 | 미실행 |
| E2E-004 | E2E | FR-004 | BR-004 | 미실행 |
| E2E-005 | E2E | FR-005 | - | 미실행 |
| E2E-006 | E2E | FR-006 | BR-003 | 미실행 |
| TC-001 | 매뉴얼 | FR-001 | - | 미실행 |
| TC-002 | 매뉴얼 | FR-002 | BR-001 | 미실행 |
| TC-003 | 매뉴얼 | FR-003 | BR-002 | 미실행 |
| TC-004 | 매뉴얼 | FR-004 | BR-004 | 미실행 |
| TC-005 | 매뉴얼 | FR-005 | - | 미실행 |
| TC-006 | 매뉴얼 | FR-006 | BR-003 | 미실행 |

---

## 4. 데이터 모델 추적

> 설계 데이터 모델 → mock 데이터 구조 매핑

| 설계 엔티티 | mock-data 구조 | 사용 컴포넌트 | 용도 |
|------------|----------------|---------------|------|
| InventoryItem | inventory.json → items[] | ItemSelect, InventoryDescriptions | 품목 목록, 상세 정보 |
| InventoryTransaction | inventory.json → transactions[] | TransactionTable | 입출고 이력 |
| InventoryTrend | inventory.json → trends[] | StockTrendChart | 재고 추이 차트 |

---

## 5. 인터페이스 추적

> 화면 컴포넌트 → 데이터 소스 매핑

| 컴포넌트 | 데이터 소스 | 사용 방식 | 요구사항 |
|----------|------------|----------|----------|
| ItemSelect | inventory.json → items | import JSON | FR-001 |
| InventoryDescriptions | inventory.json → items[selected] | 선택된 품목 데이터 | FR-002 |
| TransactionTable | inventory.json → transactions | 필터링 후 표시 | FR-003, FR-006 |
| StockTrendChart | inventory.json → trends | 차트 데이터 변환 | FR-004 |

---

## 6. 화면 추적

> 설계 화면 → 컴포넌트 매핑

| 설계 화면 | 경로 | 컴포넌트 | 요구사항 |
|----------|------|----------|----------|
| 초기 상태 (품목 미선택) | screens/sample/InventoryDetail/index.tsx | ItemSelect, Empty | FR-001, FR-005 |
| 상세 정보 표시 | screens/sample/InventoryDetail/index.tsx | InventoryDescriptions, Tabs | FR-002 |
| 입출고 이력 탭 | screens/sample/InventoryDetail/TransactionTable.tsx | Table, RangePicker | FR-003, FR-006 |
| 재고 추이 탭 | screens/sample/InventoryDetail/StockTrendChart.tsx | Line Chart | FR-004 |
| 로딩 상태 | screens/sample/InventoryDetail/index.tsx | Skeleton | FR-005 |

---

## 7. 추적성 검증 요약

### 7.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 6 | 6 | 0 | 100% |
| 비즈니스 규칙 (BR) | 4 | 4 | 0 | 100% |
| 단위 테스트 (UT) | 7 | 7 | 0 | 100% |
| E2E 테스트 | 6 | 6 | 0 | 100% |
| 매뉴얼 테스트 (TC) | 6 | 6 | 0 | 100% |

### 7.2 미매핑 항목 (있는 경우)

| 구분 | ID | 설명 | 미매핑 사유 |
|------|-----|------|-----------|
| - | - | - | - |

---

## 관련 문서

- 설계: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- PRD: `.orchay/projects/mes-portal/prd.md`
- TRD: `.orchay/projects/mes-portal/trd.md`

---

<!--
TSK-06-15 요구사항 추적성 매트릭스
Version: 1.0
Created: 2026-01-22
-->
