# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-23

> **목적**: PRD → 기본설계 → 상세설계 → 테스트 4단계 양방향 추적
>
> **참조**: 이 문서는 `010-design.md`와 `026-test-specification.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-20 |
| Task명 | [샘플] 데이터 테이블 종합 |
| 설계 문서 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-23 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

> PRD → 기본설계 → 상세설계 → 테스트케이스 매핑

| 요구사항 ID | PRD 섹션 | 설계 섹션 | 단위 테스트 | E2E 테스트 | 매뉴얼 TC | 상태 |
|-------------|----------|----------|-------------|------------|-----------|------|
| FR-001 | 4.1.1 테이블 기능 | 5.1 정렬 기능 | UT-001 | E2E-001 | TC-001 | 설계예정 |
| FR-002 | 4.1.1 테이블 기능 | 5.2 필터 기능 | UT-002 | E2E-002 | TC-002 | 설계예정 |
| FR-003 | 4.1.1 테이블 기능 | 5.3 페이징 | UT-003 | E2E-003 | TC-003 | 설계예정 |
| FR-004 | 4.1.1 테이블 기능 | 5.4 행 선택 | UT-004 | E2E-004 | TC-004 | 설계예정 |
| FR-005 | 4.1.1 테이블 기능 | 5.5 컬럼 리사이즈/순서 | UT-005 | E2E-005 | TC-005 | 설계예정 |
| FR-006 | 4.1.1 테이블 기능 | 5.6 고정 컬럼/헤더 | UT-006 | E2E-006 | TC-006 | 설계예정 |
| FR-007 | 4.1.1 테이블 기능 | 5.7 확장 행 | UT-007 | E2E-007 | TC-007 | 설계예정 |
| FR-008 | 4.1.1 테이블 기능 | 5.8 인라인 편집 | UT-008 | E2E-008 | TC-008 | 설계예정 |
| FR-009 | 4.1.1 테이블 기능 | 5.9 행 드래그 앤 드롭 | UT-009 | E2E-009 | TC-009 | 설계예정 |
| FR-010 | 4.1.1 테이블 기능 | 5.10 가상 스크롤 | UT-010 | E2E-010 | TC-010 | 설계예정 |
| FR-011 | 4.1.1 테이블 기능 | 5.11 그룹 헤더 | UT-011 | E2E-011 | TC-011 | 설계예정 |
| FR-012 | 4.1.1 테이블 기능 | 5.12 셀 병합 | UT-012 | E2E-012 | TC-012 | 설계예정 |

### 1.1 요구사항별 상세 매핑

#### FR-001: 컬럼 정렬 (단일/다중 정렬)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 컬럼 정렬 (오름차순/내림차순) |
| 설계 | 010-design.md | 5.1 | 정렬 기능 - 단일 정렬, 다중 정렬 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-001 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001 |
| 매뉴얼 테스트 | 026-test-specification.md | 4.1 | TC-001 |

#### FR-002: 컬럼 필터링 (텍스트, 숫자, 날짜, 드롭다운)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 컬럼별 필터링 |
| 설계 | 010-design.md | 5.2 | 필터 기능 - 텍스트, 숫자 범위, 날짜 범위, 드롭다운 |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-002 |
| E2E 테스트 | 026-test-specification.md | 3.2 | E2E-002 |
| 매뉴얼 테스트 | 026-test-specification.md | 4.2 | TC-002 |

#### FR-003: 페이징 (페이지 크기 선택, 전체 건수)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 페이징 (페이지 크기 선택) |
| 설계 | 010-design.md | 5.3 | 페이징 - 페이지 네비게이션, 크기 선택, 전체 건수 표시 |
| 단위 테스트 | 026-test-specification.md | 2.3 | UT-003 |
| E2E 테스트 | 026-test-specification.md | 3.3 | E2E-003 |
| 매뉴얼 테스트 | 026-test-specification.md | 4.3 | TC-003 |

#### FR-004: 행 선택 (단일/다중 + 전체 선택)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 행 선택 (단일/다중) |
| 설계 | 010-design.md | 5.4 | 행 선택 - 단일, 다중, 전체 선택 체크박스 |
| 단위 테스트 | 026-test-specification.md | 2.4 | UT-004 |
| E2E 테스트 | 026-test-specification.md | 3.4 | E2E-004 |
| 매뉴얼 테스트 | 026-test-specification.md | 4.4 | TC-004 |

#### FR-005: 컬럼 리사이즈 및 순서 변경

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 컬럼 리사이즈 |
| 설계 | 010-design.md | 5.5 | 컬럼 리사이즈 (react-resizable), 컬럼 드래그 순서 변경 |
| 단위 테스트 | 026-test-specification.md | 2.5 | UT-005 |
| E2E 테스트 | 026-test-specification.md | 3.5 | E2E-005 |
| 매뉴얼 테스트 | 026-test-specification.md | 4.5 | TC-005 |

#### FR-006: 고정 컬럼/헤더 (sticky)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 컬럼 고정 (좌측/우측) |
| 설계 | 010-design.md | 5.6 | 고정 컬럼 (좌측/우측), 고정 헤더 (sticky) |
| 단위 테스트 | 026-test-specification.md | 2.6 | UT-006 |
| E2E 테스트 | 026-test-specification.md | 3.6 | E2E-006 |
| 매뉴얼 테스트 | 026-test-specification.md | 4.6 | TC-006 |

#### FR-007: 확장 행 (expandable row)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 테이블 확장 기능 |
| 설계 | 010-design.md | 5.7 | 확장 행 - 확장 아이콘, 확장 영역 컨텐츠 |
| 단위 테스트 | 026-test-specification.md | 2.7 | UT-007 |
| E2E 테스트 | 026-test-specification.md | 3.7 | E2E-007 |
| 매뉴얼 테스트 | 026-test-specification.md | 4.7 | TC-007 |

#### FR-008: 인라인 편집 (editable cell)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 셀 인라인 편집 |
| 설계 | 010-design.md | 5.8 | 인라인 편집 - 더블클릭 편집, 저장/취소 |
| 단위 테스트 | 026-test-specification.md | 2.8 | UT-008 |
| E2E 테스트 | 026-test-specification.md | 3.8 | E2E-008 |
| 매뉴얼 테스트 | 026-test-specification.md | 4.8 | TC-008 |

#### FR-009: 행 드래그 앤 드롭 정렬

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 행 드래그 앤 드롭 (순서 변경) |
| 설계 | 010-design.md | 5.9 | 행 드래그 앤 드롭 - @dnd-kit 사용 |
| 단위 테스트 | 026-test-specification.md | 2.9 | UT-009 |
| E2E 테스트 | 026-test-specification.md | 3.9 | E2E-009 |
| 매뉴얼 테스트 | 026-test-specification.md | 4.9 | TC-009 |

#### FR-010: 가상 스크롤 (대용량 데이터 1만건+)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 가상 스크롤 (대용량 데이터) |
| 설계 | 010-design.md | 5.10 | 가상 스크롤 - rc-virtual-list, 1만건+ 성능 |
| 단위 테스트 | 026-test-specification.md | 2.10 | UT-010 |
| E2E 테스트 | 026-test-specification.md | 3.10 | E2E-010 |
| 매뉴얼 테스트 | 026-test-specification.md | 4.10 | TC-010 |

#### FR-011: 그룹 헤더 (2단 컬럼 헤더, 헤더 셀 병합)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 테이블 그룹 헤더 |
| 설계 | 010-design.md | 5.11 | 그룹 헤더 - columns.children, 2단 헤더 |
| 단위 테스트 | 026-test-specification.md | 2.11 | UT-011 |
| E2E 테스트 | 026-test-specification.md | 3.11 | E2E-011 |
| 매뉴얼 테스트 | 026-test-specification.md | 4.11 | TC-011 |

#### FR-012: 셀 병합 (rowSpan, colSpan)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 셀 병합 |
| 설계 | 010-design.md | 5.12 | 셀 병합 - onCell rowSpan/colSpan, 자동 병합 옵션 |
| 단위 테스트 | 026-test-specification.md | 2.12 | UT-012 |
| E2E 테스트 | 026-test-specification.md | 3.12 | E2E-012 |
| 매뉴얼 테스트 | 026-test-specification.md | 4.12 | TC-012 |

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD 출처 | 설계 섹션 | 구현 위치(개념) | E2E 테스트 | 검증 방법 | 상태 |
|---------|----------|----------|-----------------|------------|-----------|------|
| BR-001 | 4.1.1 | 8.1 | FeatureTogglePanel | E2E-013 | 기능별 토글 Switch 동작 확인 | 설계예정 |
| BR-002 | 4.1.1 | 8.1 | useTableFeatures | E2E-001, E2E-002 | 정렬+필터 조합 시 정상 동작 확인 | 설계예정 |
| BR-003 | 4.1.1 | 8.1 | VirtualTable | E2E-010 | 1만건 데이터 스크롤 시 렉 없음 확인 | 설계예정 |
| BR-004 | 4.1.1 | 8.1 | useColumnSettings | - | 컬럼 설정 localStorage 저장/복원 확인 | 설계예정 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-001: 기능별 토글로 활성화/비활성화 가능

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 각 기능별 토글로 활성화/비활성화 |
| **설계 표현** | FeatureTogglePanel - Switch 컴포넌트로 기능 On/Off |
| **구현 위치** | DataTableShowcase 컴포넌트 featureFlags 상태 |
| **검증 방법** | Switch 토글 시 해당 기능 활성화/비활성화 확인 |
| **관련 테스트** | E2E-013, TC-013 |

#### BR-002: 정렬/필터 조합이 정상 동작해야 함

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 정렬/필터 조합 동작 |
| **설계 표현** | useTableFeatures Hook - 정렬, 필터 상태 조합 처리 |
| **구현 위치** | useTableFeatures Hook 내 filterAndSort 함수 |
| **검증 방법** | 필터 적용 후 정렬 시 필터 결과 내에서 정렬 확인 |
| **관련 테스트** | E2E-001, E2E-002, TC-001, TC-002 |

#### BR-003: 1만건 데이터에서 부드러운 스크롤 (렉 없음)

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 1만건 데이터에서 부드러운 스크롤 |
| **설계 표현** | VirtualTable - rc-virtual-list 기반 가상 스크롤 |
| **구현 위치** | DataTable virtual 모드, large-dataset.json |
| **검증 방법** | 1만건 데이터 로드 후 스크롤 시 60fps 유지 확인 |
| **관련 테스트** | E2E-010, TC-010 |

#### BR-004: 컬럼 설정은 localStorage에 저장

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 컬럼 설정 localStorage 저장 |
| **설계 표현** | useColumnSettings Hook - localStorage 연동 |
| **구현 위치** | useColumnSettings Hook saveSettings/loadSettings |
| **검증 방법** | 컬럼 리사이즈/순서 변경 후 새로고침 시 설정 유지 확인 |
| **관련 테스트** | TC-014 |

---

## 3. 테스트 역추적 매트릭스

> 테스트 결과 → 요구사항 역추적용

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-001 | 단위 | FR-001 | BR-002 | 미실행 |
| UT-002 | 단위 | FR-002 | BR-002 | 미실행 |
| UT-003 | 단위 | FR-003 | - | 미실행 |
| UT-004 | 단위 | FR-004 | - | 미실행 |
| UT-005 | 단위 | FR-005 | BR-004 | 미실행 |
| UT-006 | 단위 | FR-006 | - | 미실행 |
| UT-007 | 단위 | FR-007 | - | 미실행 |
| UT-008 | 단위 | FR-008 | - | 미실행 |
| UT-009 | 단위 | FR-009 | - | 미실행 |
| UT-010 | 단위 | FR-010 | BR-003 | 미실행 |
| UT-011 | 단위 | FR-011 | - | 미실행 |
| UT-012 | 단위 | FR-012 | - | 미실행 |
| E2E-001 | E2E | FR-001 | BR-002 | 미실행 |
| E2E-002 | E2E | FR-002 | BR-002 | 미실행 |
| E2E-003 | E2E | FR-003 | - | 미실행 |
| E2E-004 | E2E | FR-004 | - | 미실행 |
| E2E-005 | E2E | FR-005 | BR-004 | 미실행 |
| E2E-006 | E2E | FR-006 | - | 미실행 |
| E2E-007 | E2E | FR-007 | - | 미실행 |
| E2E-008 | E2E | FR-008 | - | 미실행 |
| E2E-009 | E2E | FR-009 | - | 미실행 |
| E2E-010 | E2E | FR-010 | BR-003 | 미실행 |
| E2E-011 | E2E | FR-011 | - | 미실행 |
| E2E-012 | E2E | FR-012 | - | 미실행 |
| E2E-013 | E2E | - | BR-001 | 미실행 |
| TC-001 | 매뉴얼 | FR-001 | BR-002 | 미실행 |
| TC-002 | 매뉴얼 | FR-002 | BR-002 | 미실행 |
| TC-003 | 매뉴얼 | FR-003 | - | 미실행 |
| TC-004 | 매뉴얼 | FR-004 | - | 미실행 |
| TC-005 | 매뉴얼 | FR-005 | BR-004 | 미실행 |
| TC-006 | 매뉴얼 | FR-006 | - | 미실행 |
| TC-007 | 매뉴얼 | FR-007 | - | 미실행 |
| TC-008 | 매뉴얼 | FR-008 | - | 미실행 |
| TC-009 | 매뉴얼 | FR-009 | - | 미실행 |
| TC-010 | 매뉴얼 | FR-010 | BR-003 | 미실행 |
| TC-011 | 매뉴얼 | FR-011 | - | 미실행 |
| TC-012 | 매뉴얼 | FR-012 | - | 미실행 |
| TC-013 | 매뉴얼 | - | BR-001 | 미실행 |
| TC-014 | 매뉴얼 | FR-005 | BR-004 | 미실행 |

---

## 4. 데이터 모델 추적

> 설계 엔티티 → Mock 데이터 → 컴포넌트 매핑

| 설계 엔티티 | Mock 데이터 파일 | 컴포넌트 Props | Response 타입 |
|------------|-----------------|---------------|---------------|
| TableDataRecord | large-dataset.json | DataTableShowcaseProps | TableDataRecord[] |
| ColumnSetting | localStorage | ColumnSettingProps | ColumnSetting[] |
| FeatureFlag | - (State) | FeatureTogglePanelProps | FeatureFlags |

### 4.1 데이터 모델 상세

#### TableDataRecord (테이블 데이터 레코드)

| 필드 | 타입 | 설명 | 관련 요구사항 |
|------|------|------|--------------|
| id | string | 고유 식별자 | FR-004, FR-009 |
| productCode | string | 제품 코드 | FR-001, FR-002, FR-011 |
| productName | string | 제품명 | FR-001, FR-002 |
| category | string | 카테고리 | FR-002, FR-011 |
| quantity | number | 수량 | FR-001, FR-002, FR-008 |
| unitPrice | number | 단가 | FR-001, FR-002, FR-008 |
| totalPrice | number | 합계 | FR-012 |
| status | string | 상태 | FR-002 |
| createdAt | string | 생성일 | FR-001, FR-002 |
| updatedAt | string | 수정일 | FR-001 |
| details | object | 상세 정보 | FR-007 |

#### ColumnSetting (컬럼 설정)

| 필드 | 타입 | 설명 | 관련 요구사항 |
|------|------|------|--------------|
| key | string | 컬럼 키 | FR-005 |
| width | number | 컬럼 너비 | FR-005 |
| order | number | 컬럼 순서 | FR-005 |
| fixed | 'left' \| 'right' \| false | 고정 여부 | FR-006 |
| visible | boolean | 표시 여부 | FR-005 |

#### FeatureFlags (기능 플래그)

| 필드 | 타입 | 설명 | 관련 요구사항 |
|------|------|------|--------------|
| sorting | boolean | 정렬 기능 | FR-001 |
| filtering | boolean | 필터 기능 | FR-002 |
| pagination | boolean | 페이징 기능 | FR-003 |
| rowSelection | boolean | 행 선택 기능 | FR-004 |
| columnResize | boolean | 컬럼 리사이즈 | FR-005 |
| columnReorder | boolean | 컬럼 순서 변경 | FR-005 |
| fixedColumns | boolean | 고정 컬럼 | FR-006 |
| expandableRows | boolean | 확장 행 | FR-007 |
| inlineEdit | boolean | 인라인 편집 | FR-008 |
| rowDragDrop | boolean | 행 드래그 앤 드롭 | FR-009 |
| virtualScroll | boolean | 가상 스크롤 | FR-010 |
| groupHeader | boolean | 그룹 헤더 | FR-011 |
| cellMerge | boolean | 셀 병합 | FR-012 |

---

## 5. 인터페이스 추적

> 설계 인터페이스 요구사항 → 컴포넌트/함수 매핑

| 설계 인터페이스 | 구현 대상 | 타입 | 요구사항 |
|----------------|----------|------|----------|
| 정렬 핸들러 | handleSort | (sorter: SorterResult) => void | FR-001 |
| 다중 정렬 핸들러 | handleMultiSort | (sorters: SorterResult[]) => void | FR-001 |
| 필터 핸들러 | handleFilter | (filters: FilterValue) => void | FR-002 |
| 페이지 변경 | handlePageChange | (page: number, pageSize: number) => void | FR-003 |
| 행 선택 | handleRowSelect | (selectedRowKeys: Key[], selectedRows: T[]) => void | FR-004 |
| 컬럼 리사이즈 | handleColumnResize | (column: ColumnType, width: number) => void | FR-005 |
| 컬럼 순서 변경 | handleColumnReorder | (columns: ColumnType[]) => void | FR-005 |
| 행 확장 | handleRowExpand | (expanded: boolean, record: T) => void | FR-007 |
| 셀 편집 | handleCellEdit | (record: T, dataIndex: string, value: any) => void | FR-008 |
| 행 드래그 | handleRowDrag | (sourceIndex: number, destinationIndex: number) => void | FR-009 |

---

## 6. 화면 추적

> 설계 화면 요구사항 → 컴포넌트 매핑

| 설계 화면 | 컴포넌트 | 경로 | 요구사항 |
|----------|----------|------|----------|
| 데이터 테이블 종합 | DataTableShowcase | screens/sample/DataTableShowcase.tsx | FR-001~FR-012 |
| 기능 토글 패널 | FeatureTogglePanel | screens/sample/DataTableShowcase/FeatureTogglePanel.tsx | BR-001 |
| 고급 데이터 테이블 | AdvancedDataTable | components/common/AdvancedDataTable.tsx | FR-001~FR-012 |
| 편집 가능 셀 | EditableCell | components/common/EditableCell.tsx | FR-008 |
| 드래그 가능 행 | DraggableRow | components/common/DraggableRow.tsx | FR-009 |
| 리사이즈 가능 헤더 | ResizableHeader | components/common/ResizableHeader.tsx | FR-005 |
| 가상 테이블 | VirtualTable | components/common/VirtualTable.tsx | FR-010 |

### 6.1 컴포넌트 의존성 매핑

```
DataTableShowcase
├── FeatureTogglePanel (BR-001)
├── AdvancedDataTable
│   ├── ResizableHeader (FR-005)
│   ├── DraggableRow (FR-009)
│   ├── EditableCell (FR-008)
│   └── VirtualTable (FR-010)
└── Hooks
    ├── useTableFeatures (FR-001~FR-012, BR-002)
    └── useColumnSettings (FR-005, BR-004)
```

---

## 7. 추적성 검증 요약

### 7.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 12 | 12 | 0 | 100% |
| 비즈니스 규칙 (BR) | 4 | 4 | 0 | 100% |
| 단위 테스트 (UT) | 12 | 12 | 0 | 100% |
| E2E 테스트 | 13 | 13 | 0 | 100% |
| 매뉴얼 테스트 (TC) | 14 | 14 | 0 | 100% |

### 7.2 요구사항-테스트 커버리지 매트릭스

| 요구사항 | UT | E2E | TC | 총 테스트 |
|---------|-----|-----|-----|----------|
| FR-001 | 1 | 1 | 1 | 3 |
| FR-002 | 1 | 1 | 1 | 3 |
| FR-003 | 1 | 1 | 1 | 3 |
| FR-004 | 1 | 1 | 1 | 3 |
| FR-005 | 1 | 1 | 2 | 4 |
| FR-006 | 1 | 1 | 1 | 3 |
| FR-007 | 1 | 1 | 1 | 3 |
| FR-008 | 1 | 1 | 1 | 3 |
| FR-009 | 1 | 1 | 1 | 3 |
| FR-010 | 1 | 1 | 1 | 3 |
| FR-011 | 1 | 1 | 1 | 3 |
| FR-012 | 1 | 1 | 1 | 3 |
| BR-001 | - | 1 | 1 | 2 |
| BR-002 | 2 | 2 | 2 | 6 |
| BR-003 | 1 | 1 | 1 | 3 |
| BR-004 | 1 | 1 | 2 | 4 |

### 7.3 미매핑 항목

| 구분 | ID | 설명 | 미매핑 사유 |
|------|-----|------|-----------|
| - | - | - | 모든 항목 매핑 완료 |

### 7.4 리스크 영역

| 요구사항 | 리스크 수준 | 설명 | 대응 방안 |
|---------|------------|------|----------|
| FR-010 | 높음 | 가상 스크롤 성능 (1만건+) | 성능 테스트 TC-010 필수 실행 |
| FR-008 | 중간 | 인라인 편집 UX | E2E-008 상세 시나리오 검증 |
| FR-009 | 중간 | 드래그 앤 드롭 호환성 | 크로스 브라우저 테스트 포함 |
| BR-002 | 중간 | 정렬/필터 조합 복잡도 | 조합 테스트 케이스 추가 |

---

## 관련 문서

- 설계 문서: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- PRD: `.orchay/projects/mes-portal/prd.md`
- 데이터 테이블 공통 컴포넌트: `components/common/DataTable.tsx`
- Mock 데이터: `mock-data/large-dataset.json`

---

<!--
TSK-06-20 요구사항 추적성 매트릭스
Version: 1.0
Created: 2026-01-23
-->
