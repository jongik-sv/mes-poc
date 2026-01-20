# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

**Template Version:** 1.0.0 - **Last Updated:** 2026-01-20

> **목적**: PRD -> 설계 -> 테스트 양방향 추적
>
> **참조**: 이 문서는 `010-design.md`와 `026-test-specification.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-05-05 |
| Task명 | 날짜 선택기 |
| 설계 문서 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR -> 설계 -> 테스트)

> PRD -> 설계 -> 테스트케이스 매핑

| 요구사항 ID | PRD 섹션 | 설계 섹션 | 구현 컴포넌트 | 단위 테스트 | E2E 테스트 | 매뉴얼 TC | 상태 |
|-------------|----------|----------|--------------|-------------|------------|-----------|------|
| FR-001 | 4.1.1 날짜 선택기 | 3.2 UC-01, 5.2 | DatePickerWrapper.tsx | UT-001, UT-002, UT-003 | E2E-001 | TC-001 | 설계완료 |
| FR-002 | 4.1.1 날짜 선택기 | 3.2 UC-02, UC-03, 5.2 | DateRangePickerWrapper.tsx | UT-004, UT-005, UT-006 | E2E-002 | TC-002 | 설계완료 |
| FR-003 | 4.1.1 날짜 선택기 | 3.2 UC-04, 8.1 | dayjs 로케일 설정 | UT-007, UT-008, UT-009 | E2E-003 | TC-003 | 설계완료 |

### 1.1 요구사항별 상세 매핑

#### FR-001: 단일 날짜 선택 기능

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 확장 컴포넌트 | 날짜 선택기 (단일, 범위) |
| WBS | wbs.yaml | TSK-05-05 | 단일 날짜 선택 |
| 설계 | 010-design.md | 3.2 UC-01 | 달력 팝업에서 단일 날짜 선택 |
| 설계 | 010-design.md | 5.2 | 단일 날짜 선택기 와이어프레임 |
| 설계 | 010-design.md | 7.2 | DatePickerWrapperProps 인터페이스 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-001, UT-002, UT-003 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001 |

#### FR-002: 날짜 범위 선택 기능

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 확장 컴포넌트 | 날짜 선택기 (단일, 범위) |
| WBS | wbs.yaml | TSK-05-05 | 날짜 범위 선택 |
| 설계 | 010-design.md | 3.2 UC-02, UC-03 | 시작/종료 날짜 범위 선택 |
| 설계 | 010-design.md | 5.2 | 날짜 범위 선택기 와이어프레임 |
| 설계 | 010-design.md | 7.2 | DateRangePickerWrapperProps 인터페이스 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-004, UT-005, UT-006 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-002 |

#### FR-003: 한국어 로케일 적용

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 확장 컴포넌트 | (암묵적) 한국어 지원 |
| WBS | wbs.yaml | TSK-05-05 | 한국어 로케일 |
| 설계 | 010-design.md | 3.2 UC-04 | 한글 요일/월 표시 |
| 설계 | 010-design.md | 8.1 | dayjs 로케일 설정 (ko) |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-007, UT-008, UT-009 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-003 |

---

## 2. 비즈니스 규칙 추적 (BR -> 구현 -> 검증)

| 규칙 ID | PRD 출처 | 설계 섹션 | 구현 위치(개념) | 단위 테스트 | E2E 테스트 | 검증 방법 | 상태 |
|---------|----------|----------|-----------------|-------------|------------|-----------|------|
| BR-001 | WBS integrationCheck | 8.1 | DatePickerWrapper | UT-010 | E2E-001 | 날짜 형식 YYYY-MM-DD 출력 확인 | 설계완료 |
| BR-002 | 일반 UX | 8.1 | DateRangePickerWrapper | UT-011, UT-012 | E2E-002 | 시작일 > 종료일 선택 불가 확인 | 설계완료 |
| BR-003 | WBS integrationCheck | 8.1 | lib/dayjs-config.ts | UT-013 | E2E-003 | dayjs locale ko 설정 확인 | 설계완료 |
| BR-004 | 일반 UX | 8.1 | DatePickerWrapper | UT-014 | E2E-001 | 유효하지 않은 날짜 입력 방지 확인 | 설계완료 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-001: 날짜 형식 규칙 (YYYY-MM-DD)

| 구분 | 내용 |
|------|------|
| **WBS 원문** | DatePicker 기본 포맷: YYYY-MM-DD |
| **설계 표현** | format prop 기본값: 'YYYY-MM-DD' |
| **구현 위치** | DatePickerWrapper, DateRangePickerWrapper 컴포넌트 |
| **검증 방법** | 날짜 선택 후 표시 형식이 YYYY-MM-DD인지 확인 |
| **관련 테스트** | UT-010, E2E-001 |

#### BR-002: 유효 날짜 범위 규칙

| 구분 | 내용 |
|------|------|
| **설계 근거** | 논리적 날짜 범위 유효성 보장 |
| **설계 표현** | RangePicker에서 시작일이 종료일보다 늦을 수 없음 |
| **구현 위치** | DateRangePickerWrapper - disabledDate 로직 |
| **검증 방법** | 종료일 선택 시 시작일 이전 날짜 비활성화 확인 |
| **관련 테스트** | UT-011, UT-012, E2E-002 |

#### BR-003: dayjs 한국어 로케일 설정

| 구분 | 내용 |
|------|------|
| **WBS 원문** | dayjs locale 설정 (ko) |
| **설계 표현** | dayjs.locale('ko') 전역 설정 |
| **구현 위치** | lib/dayjs-config.ts |
| **검증 방법** | 달력 팝업에서 요일(일~토), 월(1월~12월) 한글 표시 확인 |
| **관련 테스트** | UT-013, E2E-003 |

#### BR-004: 유효하지 않은 날짜 입력 방지

| 구분 | 내용 |
|------|------|
| **설계 근거** | 사용자 입력 오류 방지 |
| **설계 표현** | 직접 입력 시 유효하지 않은 날짜 형식 거부 |
| **구현 위치** | DatePickerWrapper - 입력 검증 로직 |
| **검증 방법** | 잘못된 형식(예: 2026-13-45) 입력 시 이전 값 유지 확인 |
| **관련 테스트** | UT-014, E2E-001 |

---

## 3. 테스트 역추적 매트릭스

> 테스트 결과 -> 요구사항 역추적용 (build/verify 단계 결과서 생성 시 활용)

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-001 | 단위 | FR-001 | - | 미실행 |
| UT-002 | 단위 | FR-001 | - | 미실행 |
| UT-003 | 단위 | FR-001 | - | 미실행 |
| UT-004 | 단위 | FR-002 | - | 미실행 |
| UT-005 | 단위 | FR-002 | - | 미실행 |
| UT-006 | 단위 | FR-002 | - | 미실행 |
| UT-007 | 단위 | FR-003 | - | 미실행 |
| UT-008 | 단위 | FR-003 | - | 미실행 |
| UT-009 | 단위 | FR-003 | - | 미실행 |
| UT-010 | 단위 | - | BR-001 | 미실행 |
| UT-011 | 단위 | - | BR-002 | 미실행 |
| UT-012 | 단위 | - | BR-002 | 미실행 |
| UT-013 | 단위 | - | BR-003 | 미실행 |
| UT-014 | 단위 | - | BR-004 | 미실행 |
| E2E-001 | E2E | FR-001 | BR-001, BR-004 | 미실행 |
| E2E-002 | E2E | FR-002 | BR-002 | 미실행 |
| E2E-003 | E2E | FR-003 | BR-003 | 미실행 |
| TC-001 | 매뉴얼 | FR-001 | BR-001, BR-004 | 미실행 |
| TC-002 | 매뉴얼 | FR-002 | BR-002 | 미실행 |
| TC-003 | 매뉴얼 | FR-003 | BR-003 | 미실행 |

---

## 4. 데이터 모델 추적

> 본 Task는 프론트엔드 UI 컴포넌트로, 백엔드 데이터 모델과의 직접적인 연관이 없습니다.

| 기본설계 엔티티 | 상세설계 Prisma 모델 | API Request DTO | API Response DTO |
|----------------|---------------------|-----------------|------------------|
| - | - | - | - |

---

## 5. 인터페이스 추적

> 프론트엔드 컴포넌트 Props 인터페이스 매핑

| 설계 인터페이스 | 구현 컴포넌트 | Props 타입 | 요구사항 |
|----------------|-------------|------------|----------|
| DatePickerWrapperProps | DatePickerWrapper.tsx | value, onChange, format, placeholder, disabled, allowClear | FR-001 |
| DateRangePickerWrapperProps | DateRangePickerWrapper.tsx | value, onChange, format, placeholder, disabled, allowClear, presets | FR-002 |
| DayjsLocaleConfig | lib/dayjs-config.ts | locale | FR-003 |

### 5.1 Props 상세 명세

#### DatePickerWrapperProps

| Prop | Type | Required | Default | 설명 | 요구사항 |
|------|------|----------|---------|------|----------|
| value | Dayjs \| null | N | null | 선택된 날짜 값 | FR-001 |
| onChange | (date: Dayjs \| null, dateString: string) => void | N | - | 날짜 변경 콜백 | FR-001 |
| format | string | N | 'YYYY-MM-DD' | 날짜 표시 형식 | BR-001 |
| placeholder | string | N | '날짜 선택' | 미선택 시 표시 텍스트 | FR-001 |
| disabled | boolean | N | false | 비활성화 여부 | FR-001 |
| allowClear | boolean | N | true | 선택 해제 버튼 표시 | FR-001 |

#### DateRangePickerWrapperProps

| Prop | Type | Required | Default | 설명 | 요구사항 |
|------|------|----------|---------|------|----------|
| value | [Dayjs, Dayjs] \| null | N | null | 선택된 날짜 범위 | FR-002 |
| onChange | (dates: [Dayjs, Dayjs] \| null, dateStrings: [string, string]) => void | N | - | 날짜 범위 변경 콜백 | FR-002 |
| format | string | N | 'YYYY-MM-DD' | 날짜 표시 형식 | BR-001 |
| placeholder | [string, string] | N | ['시작일', '종료일'] | 미선택 시 표시 텍스트 | FR-002 |
| disabled | boolean | N | false | 비활성화 여부 | FR-002 |
| presets | { label: string, value: [Dayjs, Dayjs] }[] | N | - | 빠른 선택 프리셋 | FR-002 |

---

## 6. 화면 추적

> 설계 화면 요구사항 -> 구현 컴포넌트 매핑

| 설계 화면 | 설계 문서 섹션 | 구현 컴포넌트 | 요구사항 |
|----------|--------------|--------------|----------|
| 단일 날짜 선택기 | 5.2 화면 1 | DatePickerWrapper.tsx | FR-001, BR-001, BR-004 |
| 날짜 범위 선택기 | 5.2 화면 2 | DateRangePickerWrapper.tsx | FR-002, BR-002 |
| 달력 팝업 | 5.2 공통 | Ant Design DatePicker 내장 | FR-001, FR-002, FR-003 |
| 한국어 달력 | 5.2 공통 | dayjs locale ko | FR-003, BR-003 |

### 6.1 화면 구성요소 상세

| 화면 | 구성요소 | Ant Design 컴포넌트 | 설명 |
|------|---------|-------------------|------|
| 단일 날짜 선택기 | 입력 필드 | DatePicker | 날짜 직접 입력 가능 |
| 단일 날짜 선택기 | 달력 아이콘 | CalendarOutlined | 클릭 시 달력 팝업 |
| 단일 날짜 선택기 | 초기화 버튼 | allowClear | X 아이콘으로 선택 해제 |
| 날짜 범위 선택기 | 시작일 필드 | RangePicker | 시작 날짜 선택 |
| 날짜 범위 선택기 | 종료일 필드 | RangePicker | 종료 날짜 선택 |
| 날짜 범위 선택기 | 구분자 | ~ | 시작일과 종료일 사이 표시 |
| 달력 팝업 | 년/월 네비게이션 | DatePicker Panel | 이전/다음 월 이동 |
| 달력 팝업 | 요일 헤더 | DatePicker Panel | 일~토 (한국어) |
| 달력 팝업 | 날짜 셀 | DatePicker Panel | 클릭하여 날짜 선택 |

---

## 7. 추적성 검증 요약

### 7.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 3 | 3 | 0 | 100% |
| 비즈니스 규칙 (BR) | 4 | 4 | 0 | 100% |
| 단위 테스트 (UT) | 14 | 14 | 0 | 100% |
| E2E 테스트 | 3 | 3 | 0 | 100% |
| 매뉴얼 테스트 (TC) | 3 | 3 | 0 | 100% |

### 7.2 미매핑 항목 (있는 경우)

| 구분 | ID | 설명 | 미매핑 사유 |
|------|-----|------|-----------|
| - | - | - | 없음 |

### 7.3 요구사항-테스트 커버리지 매트릭스

| 요구사항 | UT 커버리지 | E2E 커버리지 | 매뉴얼 TC 커버리지 |
|----------|------------|-------------|-------------------|
| FR-001 | UT-001, UT-002, UT-003 | E2E-001 | TC-001 |
| FR-002 | UT-004, UT-005, UT-006 | E2E-002 | TC-002 |
| FR-003 | UT-007, UT-008, UT-009 | E2E-003 | TC-003 |
| BR-001 | UT-010 | E2E-001 | TC-001 |
| BR-002 | UT-011, UT-012 | E2E-002 | TC-002 |
| BR-003 | UT-013 | E2E-003 | TC-003 |
| BR-004 | UT-014 | E2E-001 | TC-001 |

### 7.4 WBS 요구사항 충족 확인

| WBS 항목 | 유형 | 매핑된 요구사항 | 충족 여부 |
|----------|------|----------------|----------|
| 단일 날짜 선택 | requirements.items | FR-001 | O |
| 날짜 범위 선택 | requirements.items | FR-002 | O |
| 한국어 로케일 | requirements.items | FR-003 | O |
| 달력 팝업 표시 | acceptance | FR-001, FR-002 | O |
| 날짜 선택 및 값 반환 | acceptance | FR-001, FR-002 | O |
| 한글 요일/월 표시 | acceptance | FR-003 | O |
| Ant Design DatePicker, RangePicker | uiSpec | FR-001, FR-002 | O |
| dayjs 한국어 로케일 | uiSpec | FR-003 | O |
| dayjs locale 설정 (ko) | integrationCheck | BR-003 | O |
| DatePicker 기본 포맷: YYYY-MM-DD | integrationCheck | BR-001 | O |

---

## 관련 문서

- 설계: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- PRD: `.orchay/projects/mes-portal/prd.md`
- WBS: `.orchay/projects/mes-portal/wbs.yaml`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |

---

<!--
TSK-05-05 요구사항 추적성 매트릭스
Version: 1.0
Created: 2026-01-20
-->
