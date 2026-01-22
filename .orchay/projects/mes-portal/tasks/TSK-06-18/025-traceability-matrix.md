# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-22

> **목적**: PRD → 설계 → 테스트 양방향 추적
>
> **참조**: 이 문서는 `010-design.md`와 `026-test-specification.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-18 |
| Task명 | [샘플] 공정 관리 |
| 설계 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-22 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

> PRD → 설계 → 테스트케이스 매핑

| 요구사항 ID | PRD 섹션 | 설계 섹션 | 단위 테스트 | E2E 테스트 | 매뉴얼 TC | 상태 |
|-------------|----------|----------|-------------|------------|-----------|------|
| FR-001 | 4.1.1 CRUD 샘플 | 5.2 (목록 화면) | UT-001 | E2E-001 | TC-001 | 설계완료 |
| FR-002 | 4.1.1 CRUD 샘플 | 5.2 (상세 화면) | UT-002 | E2E-002 | TC-002 | 설계완료 |
| FR-003 | 4.1.1 CRUD 샘플 | 5.2 (등록 폼) | UT-003 | E2E-003 | TC-003 | 설계완료 |
| FR-004 | 4.1.1 CRUD 샘플 | 5.2 (수정 폼) | UT-004 | E2E-004 | TC-004 | 설계완료 |
| FR-005 | 4.1.1 CRUD 샘플 | 5.2 (삭제) | UT-005 | E2E-005 | TC-005 | 설계완료 |
| FR-006 | 4.1.1 로딩/에러 상태 | 6.2 | UT-006 | E2E-006 | TC-006 | 설계완료 |

### 1.1 요구사항별 상세 매핑

#### FR-001: 공정 목록 조회

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 공정 목록 조회 (Table) |
| 설계 | 010-design.md | 3.2 UC-01 | 공정 목록 조회 유즈케이스 |
| 설계 | 010-design.md | 5.2 | 공정 목록 화면 와이어프레임 |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-001: 목록 데이터 로딩 |
| E2E 테스트 | 026-test-specification.md | 3.2 | E2E-001: 목록 조회 시나리오 |

#### FR-002: 공정 상세 조회

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 공정 상세 보기 (Descriptions + Tabs) |
| 설계 | 010-design.md | 3.2 UC-02 | 공정 상세 조회 유즈케이스 |
| 설계 | 010-design.md | 5.2 | 공정 상세 화면 와이어프레임 |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-002: 상세 데이터 로딩 |
| E2E 테스트 | 026-test-specification.md | 3.2 | E2E-002: 상세 조회 시나리오 |

#### FR-003: 공정 등록

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 공정 등록/수정 폼 (신규 모드) |
| 설계 | 010-design.md | 3.2 UC-03 | 공정 등록 유즈케이스 |
| 설계 | 010-design.md | 5.2 | 공정 등록 폼 와이어프레임 |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-003: 등록 폼 유효성 검사 |
| E2E 테스트 | 026-test-specification.md | 3.2 | E2E-003: 등록 시나리오 |

#### FR-004: 공정 수정

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 공정 등록/수정 폼 (수정 모드) |
| 설계 | 010-design.md | 3.2 UC-04 | 공정 수정 유즈케이스 |
| 설계 | 010-design.md | 5.2 | 공정 수정 폼 와이어프레임 |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-004: 수정 폼 변경 감지 |
| E2E 테스트 | 026-test-specification.md | 3.2 | E2E-004: 수정 시나리오 |

#### FR-005: 공정 삭제

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 공정 삭제 (확인 후 삭제) |
| 설계 | 010-design.md | 3.2 UC-05 | 공정 삭제 유즈케이스 |
| 설계 | 010-design.md | 8.1 BR-01 | 삭제 확인 다이얼로그 규칙 |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-005: 삭제 핸들러 |
| E2E 테스트 | 026-test-specification.md | 3.2 | E2E-005: 삭제 시나리오 |

#### FR-006: 상태별 UI 처리

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | 상태별 Empty/Loading/Error 처리 |
| 설계 | 010-design.md | 6.2 | 상태별 화면 변화 |
| 설계 | 010-design.md | 9.1 | 에러 처리 상황 |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-006: 상태 렌더링 |
| E2E 테스트 | 026-test-specification.md | 3.2 | E2E-006: 에러 상태 시나리오 |

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD 출처 | 설계 섹션 | 구현 위치(개념) | 단위 테스트 | E2E 테스트 | 검증 방법 | 상태 |
|---------|----------|----------|-----------------|-------------|------------|-----------|------|
| BR-01 | 4.1.1 삭제 확인 | 8.1 | DetailTemplate 삭제 핸들러 | UT-007 | E2E-005 | 삭제 클릭 시 다이얼로그 표시 확인 | 설계완료 |
| BR-02 | 4.1.1 폼 검증 | 8.1 | FormTemplate 제출 핸들러 | UT-003 | E2E-003 | 저장 클릭 시 유효성 검사 확인 | 설계완료 |
| BR-03 | 4.1.1 변경 경고 | 8.1 | FormTemplate enableDirtyCheck | UT-008 | E2E-007 | 변경 후 이탈 시 경고 확인 | 설계완료 |
| BR-04 | 4.1.1 중복 방지 | 8.1 | 등록/수정 시 코드 중복 검사 | UT-009 | E2E-008 | 중복 코드 입력 시 에러 확인 | 설계완료 |
| BR-05 | 4.1.1 상태 표시 | 8.1 | 목록 행 스타일링 | UT-010 | TC-001 | 비활성 공정 회색 표시 확인 | 설계완료 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-01: 삭제 시 확인 다이얼로그 필수

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 삭제 확인 ("정말 삭제하시겠습니까?") |
| **설계 표현** | 010-design.md 섹션 8.1 - 삭제 버튼 클릭 시 Modal.confirm 표시 |
| **구현 위치** | DetailTemplate onDelete 핸들러 |
| **검증 방법** | 삭제 버튼 클릭 시 확인 다이얼로그 표시, 취소 시 복귀 확인 |
| **관련 테스트** | UT-007, E2E-005 |

#### BR-02: 저장 전 유효성 검사 필수

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 유효성 검사 - 필수 필드 표시, 실시간 유효성 검사 |
| **설계 표현** | 010-design.md 섹션 7.3 - 데이터 유효성 규칙 |
| **구현 위치** | FormTemplate + Ant Design Form rules |
| **검증 방법** | 필수 필드 누락 시 에러 표시, 형식 오류 시 메시지 표시 |
| **관련 테스트** | UT-003, E2E-003 |

#### BR-03: 수정 모드에서 변경 감지 후 이탈 경고

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 저장되지 않은 변경사항 경고 ("저장하지 않은 내용이 있습니다") |
| **설계 표현** | 010-design.md 섹션 8.2 - 변경 후 취소 시 확인 다이얼로그 |
| **구현 위치** | FormTemplate enableDirtyCheck, enableLeaveConfirm |
| **검증 방법** | 폼 변경 후 취소/이탈 시 경고 다이얼로그 표시 |
| **관련 테스트** | UT-008, E2E-007 |

#### BR-04: 공정코드 중복 불가

| 구분 | 내용 |
|------|------|
| **PRD 원문** | (암시적) 공정코드는 고유해야 함 |
| **설계 표현** | 010-design.md 섹션 9.1 - 중복 코드 에러 처리 |
| **구현 위치** | 저장 핸들러에서 중복 검사 |
| **검증 방법** | 기존 공정코드 입력 시 "이미 사용 중인 공정코드입니다" 메시지 |
| **관련 테스트** | UT-009, E2E-008 |

#### BR-05: 비활성 공정은 목록에서 회색 표시

| 구분 | 내용 |
|------|------|
| **PRD 원문** | (암시적) 상태별 시각적 구분 |
| **설계 표현** | 010-design.md 섹션 8.1 BR-05 |
| **구현 위치** | 목록 테이블 행 스타일 조건부 적용 |
| **검증 방법** | status='inactive'인 행의 스타일 확인 |
| **관련 테스트** | UT-010, TC-001 |

---

## 3. 테스트 역추적 매트릭스

> 테스트 결과 → 요구사항 역추적용 (build/verify 단계 결과서 생성 시 활용)

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-001 | 단위 | FR-001 | - | 미실행 |
| UT-002 | 단위 | FR-002 | - | 미실행 |
| UT-003 | 단위 | FR-003 | BR-02 | 미실행 |
| UT-004 | 단위 | FR-004 | - | 미실행 |
| UT-005 | 단위 | FR-005 | - | 미실행 |
| UT-006 | 단위 | FR-006 | - | 미실행 |
| UT-007 | 단위 | - | BR-01 | 미실행 |
| UT-008 | 단위 | - | BR-03 | 미실행 |
| UT-009 | 단위 | - | BR-04 | 미실행 |
| UT-010 | 단위 | - | BR-05 | 미실행 |
| E2E-001 | E2E | FR-001 | - | 미실행 |
| E2E-002 | E2E | FR-002 | - | 미실행 |
| E2E-003 | E2E | FR-003 | BR-02 | 미실행 |
| E2E-004 | E2E | FR-004 | - | 미실행 |
| E2E-005 | E2E | FR-005 | BR-01 | 미실행 |
| E2E-006 | E2E | FR-006 | - | 미실행 |
| E2E-007 | E2E | - | BR-03 | 미실행 |
| E2E-008 | E2E | - | BR-04 | 미실행 |
| TC-001 | 매뉴얼 | FR-001 | BR-05 | 미실행 |
| TC-002 | 매뉴얼 | FR-002 | - | 미실행 |
| TC-003 | 매뉴얼 | FR-003 | - | 미실행 |
| TC-004 | 매뉴얼 | FR-004 | - | 미실행 |
| TC-005 | 매뉴얼 | FR-005 | - | 미실행 |
| TC-006 | 매뉴얼 | FR-006 | - | 미실행 |

---

## 4. 데이터 모델 추적

> 설계 엔티티 → Mock 데이터 구조 매핑

| 설계 엔티티 | Mock 데이터 파일 | 타입 정의 | 용도 |
|------------|-----------------|----------|------|
| Process | mock-data/processes.json | ProcessData | 공정 기본 정보 |
| Equipment (연결) | mock-data/processes.json (내장) | EquipmentData | 설비 탭 표시 |
| History | mock-data/processes.json (내장) | HistoryData | 이력 탭 표시 |

### 4.1 타입 정의 매핑

```typescript
// screens/sample/ProcessManagement/types.ts

interface ProcessData {
  id: string
  code: string           // 공정코드 (UK)
  name: string           // 공정명
  status: ProcessStatus  // 상태
  order: number          // 순서
  description?: string   // 설명
  equipmentCount: number // 연결 설비 수
  createdAt: string      // 생성일
  updatedAt: string      // 수정일
  equipment?: EquipmentData[]
  history?: HistoryData[]
}

type ProcessStatus = 'active' | 'inactive'

interface EquipmentData {
  id: string
  code: string
  name: string
  status: EquipmentStatus
}

type EquipmentStatus = 'running' | 'stopped' | 'error' | 'maintenance'

interface HistoryData {
  id: string
  action: 'create' | 'update' | 'delete'
  timestamp: string
  user: string
  changes?: string
}
```

---

## 5. 인터페이스 추적

> 설계 인터페이스 → 데이터 흐름 매핑 (Mock 데이터 사용)

| 설계 기능 | 데이터 소스 | 메서드 | 요구사항 |
|----------|------------|--------|----------|
| 공정 목록 조회 | processes.json import | getProcessList() | FR-001 |
| 공정 상세 조회 | processes.json filter | getProcessById() | FR-002 |
| 공정 등록 | 로컬 상태 추가 | createProcess() | FR-003 |
| 공정 수정 | 로컬 상태 수정 | updateProcess() | FR-004 |
| 공정 삭제 | 로컬 상태 삭제 | deleteProcess() | FR-005 |

---

## 6. 화면 추적

> 설계 화면 → 컴포넌트 매핑

| 설계 화면 | 컴포넌트 파일 | 템플릿 | 요구사항 |
|----------|--------------|--------|----------|
| 공정 목록 | ProcessManagement/ProcessList.tsx | ListTemplate | FR-001 |
| 공정 상세 | ProcessManagement/ProcessDetail.tsx | DetailTemplate | FR-002 |
| 공정 등록 | ProcessManagement/ProcessForm.tsx | FormTemplate | FR-003 |
| 공정 수정 | ProcessManagement/ProcessForm.tsx | FormTemplate | FR-004 |
| 설비 연결 탭 | ProcessManagement/EquipmentTab.tsx | Table | FR-002 |
| 이력 탭 | ProcessManagement/HistoryTab.tsx | Timeline | FR-002 |

---

## 7. 추적성 검증 요약

### 7.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 6 | 6 | 0 | 100% |
| 비즈니스 규칙 (BR) | 5 | 5 | 0 | 100% |
| 단위 테스트 (UT) | 10 | 10 | 0 | 100% |
| E2E 테스트 | 8 | 8 | 0 | 100% |
| 매뉴얼 테스트 (TC) | 6 | 6 | 0 | 100% |

### 7.2 미매핑 항목 (있는 경우)

| 구분 | ID | 설명 | 미매핑 사유 |
|------|-----|------|-----------|
| - | - | - | - |

---

## 관련 문서

- 설계: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- 화면 설계: `011-ui-design.md`
- PRD: `.orchay/projects/mes-portal/prd.md`

---

<!--
author: Claude
Template Version History:
- v1.0.0 (2026-01-22): TSK-06-18 공정 관리 샘플용 작성
-->
