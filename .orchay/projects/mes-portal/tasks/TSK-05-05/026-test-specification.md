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
| Task ID | TSK-05-05 |
| Task명 | 날짜 선택기 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | DatePicker, RangePicker 컴포넌트, dayjs 로케일 설정 | 80% 이상 |
| E2E 테스트 | 단일/범위 날짜 선택, 한국어 표시 사용자 시나리오 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 | 전체 기능 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 컴포넌트 테스트 | Vitest + @testing-library/react |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

### 1.3 테스트 대상 컴포넌트

| 컴포넌트 | 파일 경로 | 설명 |
|---------|----------|------|
| DatePickerField | `components/common/DatePickerField.tsx` | 단일 날짜 선택기 래퍼 |
| RangePickerField | `components/common/RangePickerField.tsx` | 날짜 범위 선택기 래퍼 |
| dayjs 로케일 설정 | `lib/dayjs.ts` | dayjs 한국어 로케일 초기화 |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | DatePickerField | 날짜 선택 시 값 반환 | onChange에 dayjs 객체 전달 | FR-001 |
| UT-002 | DatePickerField | 기본 포맷 YYYY-MM-DD 적용 | 입력 필드에 YYYY-MM-DD 형식 표시 | FR-001 |
| UT-003 | DatePickerField | 커스텀 포맷 적용 | 지정된 포맷으로 날짜 표시 | FR-001 |
| UT-004 | DatePickerField | placeholder 표시 | 빈 상태에서 placeholder 텍스트 표시 | FR-001 |
| UT-005 | DatePickerField | disabled 상태 | 선택 불가, 스타일 변경 | FR-001 |
| UT-006 | RangePickerField | 시작/종료 날짜 선택 | onChange에 [startDate, endDate] 배열 전달 | FR-002 |
| UT-007 | RangePickerField | 시작일이 종료일보다 이후면 무효 | 종료일 자동 조정 또는 에러 | FR-002 |
| UT-008 | RangePickerField | 기본 포맷 YYYY-MM-DD 적용 | 시작일 ~ 종료일 형식 표시 | FR-002 |
| UT-009 | dayjs 로케일 | 한국어 로케일 설정 | dayjs().locale() === 'ko' | FR-003 |
| UT-010 | DatePickerField | 한글 요일 표시 | 달력에 일/월/화/수/목/금/토 표시 | FR-003 |
| UT-011 | DatePickerField | 한글 월 표시 | 달력 헤더에 1월~12월 표시 | FR-003 |
| UT-012 | DatePickerField | 유효하지 않은 날짜 입력 | 에러 상태 표시, 값 무효화 | BR-001 |
| UT-013 | DatePickerField | disabledDate prop 동작 | 비활성 날짜 선택 불가 | BR-002 |
| UT-014 | RangePickerField | 최대 범위 제한 | 설정된 maxRange 초과 시 선택 불가 | BR-003 |
| UT-015 | DatePickerField | allowClear prop 동작 | X 버튼으로 값 초기화 | BR-004 |

### 2.2 테스트 케이스 상세

#### UT-001: 날짜 선택 시 값 반환

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DatePickerField.spec.tsx` |
| **테스트 블록** | `describe('DatePickerField') → describe('date selection') → it('should call onChange with dayjs object on date select')` |
| **Mock 의존성** | - |
| **입력 데이터** | 달력에서 2026-01-15 클릭 |
| **검증 포인트** | onChange 호출, 전달된 값이 dayjs 객체이며 format('YYYY-MM-DD') === '2026-01-15' |
| **커버리지 대상** | DatePickerField onChange 핸들러 |
| **관련 요구사항** | FR-001 |

#### UT-002: 기본 포맷 YYYY-MM-DD 적용

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DatePickerField.spec.tsx` |
| **테스트 블록** | `describe('DatePickerField') → describe('format') → it('should display date in YYYY-MM-DD format by default')` |
| **Mock 의존성** | - |
| **입력 데이터** | value: dayjs('2026-01-20') |
| **검증 포인트** | 입력 필드 텍스트가 '2026-01-20' |
| **커버리지 대상** | DatePickerField 기본 format prop |
| **관련 요구사항** | FR-001 |

#### UT-003: 커스텀 포맷 적용

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DatePickerField.spec.tsx` |
| **테스트 블록** | `describe('DatePickerField') → describe('format') → it('should display date in custom format')` |
| **Mock 의존성** | - |
| **입력 데이터** | value: dayjs('2026-01-20'), format: 'YYYY년 MM월 DD일' |
| **검증 포인트** | 입력 필드 텍스트가 '2026년 01월 20일' |
| **커버리지 대상** | DatePickerField format prop |
| **관련 요구사항** | FR-001 |

#### UT-004: placeholder 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DatePickerField.spec.tsx` |
| **테스트 블록** | `describe('DatePickerField') → describe('placeholder') → it('should show placeholder when empty')` |
| **Mock 의존성** | - |
| **입력 데이터** | placeholder: '날짜를 선택하세요' |
| **검증 포인트** | 입력 필드의 placeholder 속성이 '날짜를 선택하세요' |
| **커버리지 대상** | DatePickerField placeholder prop |
| **관련 요구사항** | FR-001 |

#### UT-005: disabled 상태

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DatePickerField.spec.tsx` |
| **테스트 블록** | `describe('DatePickerField') → describe('disabled') → it('should be non-interactive when disabled')` |
| **Mock 의존성** | - |
| **입력 데이터** | disabled: true |
| **검증 포인트** | 클릭 시 달력 팝업 미표시, aria-disabled 속성 true |
| **커버리지 대상** | DatePickerField disabled prop |
| **관련 요구사항** | FR-001 |

#### UT-006: 시작/종료 날짜 선택

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/RangePickerField.spec.tsx` |
| **테스트 블록** | `describe('RangePickerField') → describe('range selection') → it('should call onChange with start and end dates')` |
| **Mock 의존성** | - |
| **입력 데이터** | 시작일 2026-01-10, 종료일 2026-01-20 선택 |
| **검증 포인트** | onChange 호출, [dayjs('2026-01-10'), dayjs('2026-01-20')] 전달 |
| **커버리지 대상** | RangePickerField onChange 핸들러 |
| **관련 요구사항** | FR-002 |

#### UT-007: 시작일이 종료일보다 이후면 무효

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/RangePickerField.spec.tsx` |
| **테스트 블록** | `describe('RangePickerField') → describe('validation') → it('should adjust end date when start date is after')` |
| **Mock 의존성** | - |
| **입력 데이터** | 시작일 2026-01-20 선택 후 종료일 2026-01-10 선택 시도 |
| **검증 포인트** | Ant Design RangePicker 기본 동작으로 종료일 자동 조정 |
| **커버리지 대상** | RangePickerField 유효성 검사 |
| **관련 요구사항** | FR-002 |

#### UT-008: 범위 선택 기본 포맷 적용

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/RangePickerField.spec.tsx` |
| **테스트 블록** | `describe('RangePickerField') → describe('format') → it('should display range in YYYY-MM-DD format')` |
| **Mock 의존성** | - |
| **입력 데이터** | value: [dayjs('2026-01-10'), dayjs('2026-01-20')] |
| **검증 포인트** | 표시 텍스트가 '2026-01-10 ~ 2026-01-20' 형식 |
| **커버리지 대상** | RangePickerField format prop |
| **관련 요구사항** | FR-002 |

#### UT-009: 한국어 로케일 설정 확인

| 항목 | 내용 |
|------|------|
| **파일** | `lib/__tests__/dayjs.spec.ts` |
| **테스트 블록** | `describe('dayjs locale') → it('should be set to Korean')` |
| **Mock 의존성** | - |
| **입력 데이터** | dayjs 인스턴스 생성 |
| **검증 포인트** | dayjs().locale() === 'ko' |
| **커버리지 대상** | dayjs 로케일 초기화 |
| **관련 요구사항** | FR-003 |

#### UT-010: 한글 요일 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DatePickerField.spec.tsx` |
| **테스트 블록** | `describe('DatePickerField') → describe('Korean locale') → it('should display weekdays in Korean')` |
| **Mock 의존성** | - |
| **입력 데이터** | 달력 팝업 열기 |
| **검증 포인트** | 달력 헤더에 '일', '월', '화', '수', '목', '금', '토' 텍스트 존재 |
| **커버리지 대상** | DatePickerField 로케일 적용 |
| **관련 요구사항** | FR-003 |

#### UT-011: 한글 월 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DatePickerField.spec.tsx` |
| **테스트 블록** | `describe('DatePickerField') → describe('Korean locale') → it('should display months in Korean')` |
| **Mock 의존성** | - |
| **입력 데이터** | 달력 팝업 열기, 월 선택 모드 전환 |
| **검증 포인트** | 월 선택 패널에 '1월' ~ '12월' 텍스트 존재 |
| **커버리지 대상** | DatePickerField 로케일 적용 |
| **관련 요구사항** | FR-003 |

#### UT-012: 유효하지 않은 날짜 입력

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DatePickerField.spec.tsx` |
| **테스트 블록** | `describe('DatePickerField') → describe('validation') → it('should show error for invalid date input')` |
| **Mock 의존성** | - |
| **입력 데이터** | 키보드로 '2026-13-45' 직접 입력 |
| **검증 포인트** | 입력 필드에 에러 스타일 적용 또는 입력 무시 |
| **커버리지 대상** | DatePickerField 유효성 검사 |
| **관련 요구사항** | BR-001 |

#### UT-013: disabledDate prop 동작

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DatePickerField.spec.tsx` |
| **테스트 블록** | `describe('DatePickerField') → describe('disabledDate') → it('should not allow selecting disabled dates')` |
| **Mock 의존성** | - |
| **입력 데이터** | disabledDate: (date) => date.isBefore(dayjs(), 'day') (과거 날짜 비활성) |
| **검증 포인트** | 과거 날짜 클릭 시 선택 안 됨, 비활성 스타일 적용 |
| **커버리지 대상** | DatePickerField disabledDate prop |
| **관련 요구사항** | BR-002 |

#### UT-014: 최대 범위 제한

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/RangePickerField.spec.tsx` |
| **테스트 블록** | `describe('RangePickerField') → describe('maxRange') → it('should limit selection to maxRange days')` |
| **Mock 의존성** | - |
| **입력 데이터** | maxRange: 30, 시작일 2026-01-01 선택 후 2026-02-15 선택 시도 |
| **검증 포인트** | 30일 초과 날짜 비활성화 또는 선택 불가 |
| **커버리지 대상** | RangePickerField 범위 제한 |
| **관련 요구사항** | BR-003 |

#### UT-015: allowClear prop 동작

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/DatePickerField.spec.tsx` |
| **테스트 블록** | `describe('DatePickerField') → describe('allowClear') → it('should clear value when X button clicked')` |
| **Mock 의존성** | - |
| **입력 데이터** | value: dayjs('2026-01-20'), allowClear: true |
| **검증 포인트** | X 버튼 클릭 후 onChange(null) 호출 |
| **커버리지 대상** | DatePickerField allowClear prop |
| **관련 요구사항** | BR-004 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 단일 날짜 선택 | 날짜 선택기 포함 페이지 | 1. 입력 클릭 2. 날짜 선택 3. 확인 | 선택 날짜 표시 | FR-001 |
| E2E-002 | 날짜 범위 선택 | RangePicker 포함 페이지 | 1. 입력 클릭 2. 시작일 선택 3. 종료일 선택 | 범위 표시 | FR-002 |
| E2E-003 | 한국어 요일 확인 | 날짜 선택기 | 1. 달력 팝업 열기 | 한글 요일 표시 | FR-003 |
| E2E-004 | 한국어 월 확인 | 날짜 선택기 | 1. 달력 팝업 열기 2. 월 선택 모드 | 한글 월 표시 | FR-003 |
| E2E-005 | 키보드 날짜 입력 | 날짜 선택기 | 1. 키보드로 날짜 직접 입력 | 유효 날짜 반영 | FR-001 |
| E2E-006 | 비활성 날짜 선택 시도 | disabledDate 설정됨 | 1. 비활성 날짜 클릭 | 선택 안 됨 | BR-002 |
| E2E-007 | 값 초기화 | 날짜 선택됨 | 1. X 버튼 클릭 | 값 비워짐 | BR-004 |

### 3.2 테스트 케이스 상세

#### E2E-001: 단일 날짜 선택

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/date-picker.spec.ts` |
| **테스트명** | `test('사용자가 단일 날짜를 선택할 수 있다')` |
| **사전조건** | 로그인, 날짜 선택기 포함 샘플 페이지 접속 |
| **data-testid 셀렉터** | |
| - 날짜 선택기 | `[data-testid="date-picker"]` |
| - 달력 팝업 | `.ant-picker-dropdown` |
| - 날짜 셀 | `.ant-picker-cell` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="date-picker"]')` |
| 2 | 달력 팝업 표시 확인 |
| 3 | `await page.click('.ant-picker-cell[title="2026-01-15"]')` |
| 4 | 입력 필드에 '2026-01-15' 표시 확인 |
| **검증 포인트** | `expect(page.locator('[data-testid="date-picker"] input')).toHaveValue('2026-01-15')` |
| **스크린샷** | `e2e-001-calendar-open.png`, `e2e-001-date-selected.png` |
| **관련 요구사항** | FR-001 |

#### E2E-002: 날짜 범위 선택

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/date-picker.spec.ts` |
| **테스트명** | `test('사용자가 날짜 범위를 선택할 수 있다')` |
| **사전조건** | RangePicker 포함 샘플 페이지 접속 |
| **data-testid 셀렉터** | |
| - 범위 선택기 | `[data-testid="range-picker"]` |
| - 시작일 입력 | `.ant-picker-input:first-child input` |
| - 종료일 입력 | `.ant-picker-input:last-child input` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="range-picker"]')` |
| 2 | `await page.click('.ant-picker-cell[title="2026-01-10"]')` |
| 3 | `await page.click('.ant-picker-cell[title="2026-01-20"]')` |
| 4 | 시작일/종료일 입력 필드 값 확인 |
| **검증 포인트** | 시작일 '2026-01-10', 종료일 '2026-01-20' |
| **스크린샷** | `e2e-002-range-start.png`, `e2e-002-range-end.png` |
| **관련 요구사항** | FR-002 |

#### E2E-003: 한국어 요일 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/date-picker.spec.ts` |
| **테스트명** | `test('달력에 한국어 요일이 표시된다')` |
| **사전조건** | dayjs 한국어 로케일 설정 |
| **data-testid 셀렉터** | |
| - 요일 헤더 | `.ant-picker-content th` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="date-picker"]')` |
| 2 | 요일 헤더 텍스트 확인 |
| **검증 포인트** | `expect(page.locator('.ant-picker-content th')).toContainText(['일', '월', '화', '수', '목', '금', '토'])` |
| **스크린샷** | `e2e-003-korean-weekdays.png` |
| **관련 요구사항** | FR-003 |

#### E2E-004: 한국어 월 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/date-picker.spec.ts` |
| **테스트명** | `test('월 선택 시 한국어 월이 표시된다')` |
| **사전조건** | dayjs 한국어 로케일 설정 |
| **data-testid 셀렉터** | |
| - 월 버튼 | `.ant-picker-month-btn` |
| - 월 패널 | `.ant-picker-month-panel` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="date-picker"]')` |
| 2 | `await page.click('.ant-picker-month-btn')` |
| 3 | 월 패널에서 한국어 월 확인 |
| **검증 포인트** | 월 패널에 '1월', '2월', ..., '12월' 텍스트 존재 |
| **스크린샷** | `e2e-004-korean-months.png` |
| **관련 요구사항** | FR-003 |

#### E2E-005: 키보드 날짜 입력

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/date-picker.spec.ts` |
| **테스트명** | `test('사용자가 키보드로 날짜를 입력할 수 있다')` |
| **사전조건** | 날짜 선택기 포함 페이지 |
| **data-testid 셀렉터** | |
| - 날짜 입력 | `[data-testid="date-picker"] input` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="date-picker"] input')` |
| 2 | `await page.fill('[data-testid="date-picker"] input', '2026-01-25')` |
| 3 | `await page.press('[data-testid="date-picker"] input', 'Enter')` |
| 4 | 입력 값 확인 |
| **검증 포인트** | `expect(page.locator('[data-testid="date-picker"] input')).toHaveValue('2026-01-25')` |
| **스크린샷** | `e2e-005-keyboard-input.png` |
| **관련 요구사항** | FR-001 |

#### E2E-006: 비활성 날짜 선택 시도

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/date-picker.spec.ts` |
| **테스트명** | `test('비활성 날짜는 선택할 수 없다')` |
| **사전조건** | disabledDate로 과거 날짜 비활성화 |
| **data-testid 셀렉터** | |
| - 비활성 날짜 셀 | `.ant-picker-cell-disabled` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="date-picker-with-disabled"]')` |
| 2 | 과거 날짜가 비활성 스타일인지 확인 |
| 3 | `await page.click('.ant-picker-cell-disabled')` |
| 4 | 날짜가 선택되지 않았는지 확인 |
| **검증 포인트** | 클릭 후에도 입력 필드 값 변경 없음, 달력 팝업 유지 |
| **스크린샷** | `e2e-006-disabled-dates.png` |
| **관련 요구사항** | BR-002 |

#### E2E-007: 값 초기화

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/date-picker.spec.ts` |
| **테스트명** | `test('사용자가 선택된 날짜를 초기화할 수 있다')` |
| **사전조건** | 날짜가 이미 선택된 상태 |
| **data-testid 셀렉터** | |
| - 초기화 버튼 | `.ant-picker-clear` |
| **실행 단계** | |
| 1 | 날짜 선택기에 마우스 호버 |
| 2 | `await page.click('.ant-picker-clear')` |
| 3 | 입력 필드가 비어있는지 확인 |
| **검증 포인트** | `expect(page.locator('[data-testid="date-picker"] input')).toHaveValue('')` |
| **스크린샷** | `e2e-007-before-clear.png`, `e2e-007-after-clear.png` |
| **관련 요구사항** | BR-004 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 달력 팝업 UI | 페이지 로드 | 1. 입력 필드 클릭 | 달력 팝업 표시 | High | FR-001 |
| TC-002 | 날짜 선택 | 달력 열림 | 1. 날짜 클릭 | 선택 및 팝업 닫힘 | High | FR-001 |
| TC-003 | 범위 선택 UI | RangePicker 존재 | 1. 시작/종료 선택 | 범위 하이라이트 | High | FR-002 |
| TC-004 | 한글 표시 | 달력 열림 | 1. 요일/월 확인 | 한글로 표시 | High | FR-003 |
| TC-005 | 월/년 네비게이션 | 달력 열림 | 1. 화살표 클릭 | 월/년 이동 | Medium | - |
| TC-006 | 오늘 버튼 | 달력 열림 | 1. 오늘 버튼 클릭 | 오늘 날짜 선택 | Medium | - |
| TC-007 | 반응형 확인 | - | 1. 브라우저 크기 조절 | 레이아웃 적응 | Medium | - |
| TC-008 | 접근성 확인 | - | 1. 키보드만으로 탐색 | 모든 기능 접근 가능 | Medium | - |
| TC-009 | 다크 모드 | 다크 테마 | 1. 달력 팝업 열기 | 다크 테마 적용 | Low | - |
| TC-010 | 포커스 상태 | - | 1. 입력 필드 포커스 | 포커스 링 표시 | Medium | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 달력 팝업 UI

**테스트 목적**: 날짜 선택기 클릭 시 달력 팝업이 정상적으로 표시되는지 확인

**테스트 단계**:
1. 날짜 선택기가 포함된 페이지 접속
2. 날짜 입력 필드 클릭
3. 달력 팝업 표시 확인
4. 팝업 외부 클릭
5. 팝업 닫힘 확인

**예상 결과**:
- 입력 필드 클릭 시 달력 팝업이 입력 필드 아래에 표시됨
- 현재 월의 달력이 표시됨
- 오늘 날짜가 하이라이트됨
- 팝업 외부 클릭 시 팝업 닫힘

**검증 기준**:
- [ ] 달력 팝업 표시 위치 적절
- [ ] 현재 월/년 표시 정확
- [ ] 오늘 날짜 표시 강조
- [ ] 팝업 닫힘 동작 정상

#### TC-002: 날짜 선택

**테스트 목적**: 달력에서 날짜 선택 시 정상 동작 확인

**테스트 단계**:
1. 달력 팝업 열기
2. 원하는 날짜 클릭
3. 입력 필드에 선택 날짜 표시 확인
4. 달력 팝업 닫힘 확인

**예상 결과**:
- 클릭한 날짜가 입력 필드에 YYYY-MM-DD 형식으로 표시
- 달력 팝업이 자동으로 닫힘
- 선택된 날짜에 선택 스타일 적용

**검증 기준**:
- [ ] 날짜 선택 시 즉시 반영
- [ ] 포맷 정확 (YYYY-MM-DD)
- [ ] 팝업 자동 닫힘
- [ ] 선택 날짜 시각적 피드백

#### TC-003: 범위 선택 UI

**테스트 목적**: RangePicker에서 날짜 범위 선택 UI 확인

**테스트 단계**:
1. RangePicker 입력 필드 클릭
2. 시작일 선택
3. 종료일 선택
4. 범위 하이라이트 확인
5. 입력 필드에 범위 표시 확인

**예상 결과**:
- 시작일 선택 후 종료일 선택 대기 상태
- 마우스 호버 시 선택 예정 범위 미리보기
- 선택 완료 시 범위 내 날짜들 하이라이트
- 시작일 ~ 종료일 형식으로 표시

**검증 기준**:
- [ ] 시작일 선택 후 종료일 선택 모드 전환
- [ ] 호버 시 범위 미리보기
- [ ] 선택 범위 하이라이트
- [ ] 범위 표시 형식 정확

#### TC-004: 한글 표시

**테스트 목적**: 달력의 요일 및 월이 한국어로 표시되는지 확인

**테스트 단계**:
1. 달력 팝업 열기
2. 요일 헤더 확인 (일/월/화/수/목/금/토)
3. 월 선택 모드로 전환
4. 월 이름 확인 (1월~12월)

**예상 결과**:
- 요일이 '일', '월', '화', '수', '목', '금', '토'로 표시
- 월이 '1월', '2월', ..., '12월'로 표시

**검증 기준**:
- [ ] 요일 한글 표시 정확
- [ ] 월 한글 표시 정확
- [ ] 요일 순서 정확 (일요일 시작)

#### TC-005: 월/년 네비게이션

**테스트 목적**: 달력에서 월/년 이동이 정상 동작하는지 확인

**테스트 단계**:
1. 달력 팝업 열기
2. 이전 월 화살표(<) 클릭
3. 이전 월로 이동 확인
4. 다음 월 화살표(>) 클릭
5. 다음 월로 이동 확인
6. 년도 버튼 클릭
7. 년도 선택 패널에서 다른 년도 선택

**예상 결과**:
- 화살표 클릭 시 월 이동
- 년도 버튼 클릭 시 년도 선택 패널 표시
- 년도 선택 시 해당 년도로 이동

**검증 기준**:
- [ ] 월 이동 정상
- [ ] 년도 선택 패널 표시
- [ ] 년도 이동 정상

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-DATE-TODAY | 오늘 날짜 | `dayjs('2026-01-20')` |
| MOCK-DATE-PAST | 과거 날짜 | `dayjs('2025-12-15')` |
| MOCK-DATE-FUTURE | 미래 날짜 | `dayjs('2026-02-28')` |
| MOCK-RANGE-WEEK | 1주 범위 | `[dayjs('2026-01-13'), dayjs('2026-01-20')]` |
| MOCK-RANGE-MONTH | 1달 범위 | `[dayjs('2026-01-01'), dayjs('2026-01-31')]` |
| MOCK-DISABLED-PAST | 과거 비활성 함수 | `(date) => date.isBefore(dayjs(), 'day')` |
| MOCK-DISABLED-WEEKEND | 주말 비활성 함수 | `(date) => [0, 6].includes(date.day())` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-DATEPICKER-BASE | 기본 날짜 선택기 테스트 | 샘플 페이지 로드 | DatePicker, RangePicker 포함 폼 |
| SEED-E2E-DATEPICKER-DISABLED | 비활성 날짜 테스트 | 샘플 페이지 로드 | disabledDate 설정된 DatePicker |
| SEED-E2E-DATEPICKER-PRESET | 사전 선택 테스트 | 샘플 페이지 로드 | 초기값 설정된 DatePicker |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 기능 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지별 셀렉터

#### DatePickerField 컴포넌트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `date-picker` | DatePicker 컨테이너 | 기본 날짜 선택기 식별 |
| `date-picker-{name}` | 특정 DatePicker | 폼 내 특정 날짜 선택기 |
| `date-picker-input` | 입력 필드 | 날짜 입력/표시 |
| `date-picker-clear` | 초기화 버튼 | 값 초기화 |
| `date-picker-suffix` | 캘린더 아이콘 | 팝업 열기 |

#### RangePickerField 컴포넌트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `range-picker` | RangePicker 컨테이너 | 범위 선택기 식별 |
| `range-picker-{name}` | 특정 RangePicker | 폼 내 특정 범위 선택기 |
| `range-picker-start` | 시작일 입력 | 시작 날짜 입력/표시 |
| `range-picker-end` | 종료일 입력 | 종료 날짜 입력/표시 |
| `range-picker-separator` | 구분자 (~) | 시작일/종료일 구분 |
| `range-picker-clear` | 초기화 버튼 | 값 초기화 |

#### 달력 팝업 (Ant Design 기본 셀렉터 활용)

| CSS Selector | 요소 | 용도 |
|--------------|------|------|
| `.ant-picker-dropdown` | 달력 팝업 컨테이너 | 팝업 표시 확인 |
| `.ant-picker-header` | 달력 헤더 | 월/년 표시 영역 |
| `.ant-picker-prev-icon` | 이전 월 버튼 | 월 네비게이션 |
| `.ant-picker-next-icon` | 다음 월 버튼 | 월 네비게이션 |
| `.ant-picker-month-btn` | 월 버튼 | 월 선택 모드 전환 |
| `.ant-picker-year-btn` | 년 버튼 | 년 선택 모드 전환 |
| `.ant-picker-content th` | 요일 헤더 | 한글 요일 확인 |
| `.ant-picker-cell` | 날짜 셀 | 날짜 선택 |
| `.ant-picker-cell-selected` | 선택된 날짜 | 선택 상태 확인 |
| `.ant-picker-cell-today` | 오늘 날짜 | 오늘 표시 확인 |
| `.ant-picker-cell-disabled` | 비활성 날짜 | 비활성 상태 확인 |
| `.ant-picker-cell-in-range` | 범위 내 날짜 | 범위 하이라이트 확인 |
| `.ant-picker-today-btn` | 오늘 버튼 | 오늘 날짜 선택 |
| `.ant-picker-clear` | 초기화 버튼 | 값 초기화 |

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |
| Statements | 80% | 70% |

### 7.2 컴포넌트별 커버리지

| 컴포넌트 | 목표 커버리지 | 주요 테스트 항목 |
|---------|--------------|-----------------|
| DatePickerField | 85% | 날짜 선택, 포맷, 로케일, disabled |
| RangePickerField | 85% | 범위 선택, 유효성, 포맷 |
| dayjs 로케일 설정 | 100% | 로케일 초기화 확인 |

### 7.3 E2E 테스트 커버리지

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
TSK-05-05 테스트 명세서
Version: 1.0
Created: 2026-01-20
-->
