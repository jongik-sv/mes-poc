# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: PRD → 설계 → 테스트 양방향 추적
>
> **참조**: 이 문서는 `010-design.md`와 `026-test-specification.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-01 |
| Task명 | MDI 상태 관리 |
| 설계 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

> PRD → 설계 → 테스트케이스 매핑

| 요구사항 ID | PRD 섹션 | 설계 섹션 | 단위 테스트 | E2E 테스트 | 매뉴얼 TC | 상태 |
|-------------|----------|-----------|-------------|------------|-----------|------|
| FR-MDI-01 | 4.1.1 MDI (탭 기반 다중 화면) | 5.2 탭 데이터 구조 | UT-001, UT-002 | E2E-001 | TC-001 | 설계완료 |
| FR-MDI-02 | 4.1.1 MDI (여러 화면 동시 열기) | 6.2 탭 열기 동작 | UT-003, UT-004 | E2E-002 | TC-002 | 설계완료 |
| FR-MDI-03 | 4.1.1 MDI (탭 닫기 - 개별) | 6.3 탭 닫기 동작 | UT-005, UT-006, UT-007, UT-011 | E2E-003 | TC-003 | 설계완료 |
| FR-MDI-03-A | 4.1.1 MDI (탭 닫기 - 전체) | 6.4 전체/다른 탭 닫기 | UT-012 | E2E-006 | - | 설계완료 |
| FR-MDI-03-B | 4.1.1 MDI (탭 닫기 - 다른 탭) | 6.4 전체/다른 탭 닫기 | UT-013 | E2E-007 | - | 설계완료 |
| FR-MDI-04 | 4.1.1 MDI (화면 상태 유지) | 3.2 UC-04 | UT-008 | E2E-004 | TC-004 | 설계완료 |
| FR-MDI-05 | 4.1.1 MDI (최대 탭 개수 제한) | 8.1 BR-02 | UT-009 | E2E-005 | - | 설계완료 |

### 1.1 요구사항별 상세 매핑

#### FR-MDI-01: 탭 기반 다중 화면 관리

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 MDI | 탭 기반 다중 화면 관리 |
| 설계 | 010-design.md | 5.2 | Tab 인터페이스, MDIState 정의 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-001, UT-002 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001 |

#### FR-MDI-02: 여러 화면 동시 열기 및 전환

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 MDI | 여러 화면 동시 열기 및 전환 |
| 설계 | 010-design.md | 6.2 | openTab 함수 동작 정의 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-003, UT-004 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-002 |

#### FR-MDI-03: 탭 닫기 (개별)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 MDI | 탭 닫기 (개별/전체/다른 탭 닫기) |
| 설계 | 010-design.md | 6.3 | closeTab 함수 동작 정의 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-005, UT-006, UT-007, UT-011 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-003 |

#### FR-MDI-03-A: 탭 닫기 (전체)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 MDI | 탭 닫기 (개별/전체/다른 탭 닫기) |
| 설계 | 010-design.md | 6.4 | closeAllTabs 함수 동작 정의 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-012 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-006 |

#### FR-MDI-03-B: 탭 닫기 (다른 탭)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 MDI | 탭 닫기 (개별/전체/다른 탭 닫기) |
| 설계 | 010-design.md | 6.4 | closeOtherTabs 함수 동작 정의 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-013 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-007 |

#### FR-MDI-04: 화면 상태 유지

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 MDI | 화면 상태 유지 (탭 전환 시 데이터 보존) |
| 설계 | 010-design.md | 3.2 | UC-04: 탭 상태 유지 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-008 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-004 |

#### FR-MDI-05: 최대 탭 개수 제한 설정

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 MDI | 최대 탭 개수 제한 설정 |
| 설계 | 010-design.md | 8.1 | BR-02: 최대 탭 개수 제한 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-009 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-005 |

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD 출처 | 설계 섹션 | 구현 위치(개념) | 단위 테스트 | E2E 테스트 | 검증 방법 | 상태 |
|---------|----------|-----------|-----------------|-------------|------------|-----------|------|
| BR-MDI-01 | 4.1.1 | 8.1 | MDIContext.openTab | UT-004 | E2E-002 | 동일 ID 탭 열기 시도 시 기존 탭 활성화 확인 | 설계완료 |
| BR-MDI-02 | 4.1.1 | 8.1 | MDIContext.openTab | UT-009 | E2E-005 | 최대 탭 초과 시 경고 표시 확인 | 설계완료 |
| BR-MDI-03 | 4.1.1 | 8.1 | MDIContext.closeTab | UT-010 | - | closable=false 탭 닫기 시도 무시 확인 | 설계완료 |
| BR-MDI-04 | 4.1.1 | 8.1 | MDIContent | UT-008 | E2E-004 | 탭 전환 시 컴포넌트 unmount 안됨 확인 | 설계완료 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-MDI-01: 동일 ID 탭 중복 열기 불가

| 구분 | 내용 |
|------|------|
| **PRD 원문** | (암시적) 동일 화면을 여러 탭으로 열 수 없음 |
| **설계 표현** | openTab 호출 시 동일 ID 탭 존재하면 새 탭 추가 대신 기존 탭 활성화 |
| **구현 위치** | MDIContext.openTab 함수 |
| **검증 방법** | 동일 path로 openTab 2회 호출 후 탭 개수 1개 확인 |
| **관련 테스트** | UT-004, E2E-002 |

#### BR-MDI-02: 최대 탭 개수 제한

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 최대 탭 개수 제한 설정 |
| **설계 표현** | 탭 개수가 maxTabs(기본 10)에 도달하면 새 탭 열기 거부, 토스트 경고 |
| **구현 위치** | MDIContext.openTab 함수 |
| **검증 방법** | maxTabs 개 탭 열린 상태에서 추가 탭 열기 시도 시 경고 확인 |
| **관련 테스트** | UT-009, E2E-005 |

#### BR-MDI-03: closable=false 탭 닫기 불가

| 구분 | 내용 |
|------|------|
| **PRD 원문** | (암시적) 닫을 수 없는 탭 존재 |
| **설계 표현** | closable=false인 탭은 closeTab 호출해도 닫히지 않음 |
| **구현 위치** | MDIContext.closeTab 함수 |
| **검증 방법** | closable=false 탭에 closeTab 호출 후 탭 여전히 존재 확인 |
| **관련 테스트** | UT-010 |

#### BR-MDI-04: 탭 전환 시 상태 유지

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 화면 상태 유지 (탭 전환 시 데이터 보존) |
| **설계 표현** | 비활성 탭 컴포넌트를 unmount하지 않고 display:none으로 숨김 |
| **구현 위치** | MDIContent 컴포넌트 (TSK-02-05) |
| **검증 방법** | 폼 입력 → 탭 전환 → 복귀 시 입력값 유지 확인 |
| **관련 테스트** | UT-008, E2E-004 |

---

## 3. 테스트 역추적 매트릭스

> 테스트 결과 → 요구사항 역추적용 (build/verify 단계 결과서 생성 시 활용)

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-001 | 단위 | FR-MDI-01 | - | 미실행 |
| UT-002 | 단위 | FR-MDI-01 | - | 미실행 |
| UT-003 | 단위 | FR-MDI-02 | - | 미실행 |
| UT-004 | 단위 | FR-MDI-02 | BR-MDI-01 | 미실행 |
| UT-005 | 단위 | FR-MDI-03 | - | 미실행 |
| UT-006 | 단위 | FR-MDI-03 | - | 미실행 |
| UT-007 | 단위 | FR-MDI-03 | - | 미실행 |
| UT-008 | 단위 | FR-MDI-04 | BR-MDI-04 | 미실행 |
| UT-009 | 단위 | FR-MDI-05 | BR-MDI-02 | 미실행 |
| UT-010 | 단위 | - | BR-MDI-03 | 미실행 |
| UT-011 | 단위 | FR-MDI-03 | - | 미실행 |
| UT-012 | 단위 | FR-MDI-03-A | - | 미실행 |
| UT-013 | 단위 | FR-MDI-03-B | - | 미실행 |
| E2E-001 | E2E | FR-MDI-01 | - | 미실행 |
| E2E-002 | E2E | FR-MDI-02 | BR-MDI-01 | 미실행 |
| E2E-003 | E2E | FR-MDI-03 | - | 미실행 |
| E2E-004 | E2E | FR-MDI-04 | BR-MDI-04 | 미실행 |
| E2E-005 | E2E | FR-MDI-05 | BR-MDI-02 | 미실행 |
| E2E-006 | E2E | FR-MDI-03-A | - | 미실행 |
| E2E-007 | E2E | FR-MDI-03-B | - | 미실행 |
| TC-001 | 매뉴얼 | FR-MDI-01 | - | 미실행 |
| TC-002 | 매뉴얼 | FR-MDI-02 | - | 미실행 |
| TC-003 | 매뉴얼 | FR-MDI-03 | - | 미실행 |
| TC-004 | 매뉴얼 | FR-MDI-04 | - | 미실행 |

---

## 4. 데이터 모델 추적

> 설계 타입 → 구현 타입 매핑

| 설계 타입 | 구현 파일 | 용도 |
|----------|----------|------|
| Tab | lib/mdi/types.ts | 탭 정보 인터페이스 |
| MDIState | lib/mdi/types.ts | MDI 전체 상태 인터페이스 |
| MDIContextType | lib/mdi/context.tsx | Context 타입 (상태 + 액션) |

---

## 5. 인터페이스 추적

> 설계 API → 구현 함수 매핑

| 설계 API | 구현 위치 | 파라미터 | 반환값 | 요구사항 |
|----------|----------|---------|--------|----------|
| openTab | lib/mdi/context.tsx | tab: Tab | void | FR-MDI-01, FR-MDI-02, FR-MDI-05 |
| closeTab | lib/mdi/context.tsx | tabId: string | void | FR-MDI-03 |
| closeAllTabs | lib/mdi/context.tsx | - | void | FR-MDI-03-A |
| closeOtherTabs | lib/mdi/context.tsx | tabId: string | void | FR-MDI-03-B |
| setActiveTab | lib/mdi/context.tsx | tabId: string | void | FR-MDI-02, FR-MDI-04 |
| getTab | lib/mdi/context.tsx | tabId: string | Tab \| undefined | - |
| getTabs | lib/mdi/context.tsx | - | Tab[] | FR-MDI-01 |

---

## 6. 화면 추적

> 이 Task는 UI 컴포넌트가 아닌 상태 관리 로직을 담당하므로 화면 추적 항목 없음.
> 화면 관련 추적은 TSK-02-02 (탭 바), TSK-02-05 (MDI 컨텐츠 영역)에서 정의.

---

## 7. 추적성 검증 요약

### 7.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 7 | 7 | 0 | 100% |
| 비즈니스 규칙 (BR) | 4 | 4 | 0 | 100% |
| 단위 테스트 (UT) | 13 | 13 | 0 | 100% |
| E2E 테스트 | 7 | 7 | 0 | 100% |
| 매뉴얼 테스트 (TC) | 4 | 4 | 0 | 100% |

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
Task: TSK-02-01 MDI 상태 관리
Created: 2026-01-20
Author: Claude
-->
