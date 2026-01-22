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
| Task ID | TSK-06-11 |
| Task명 | [샘플] 작업 일정 캘린더 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-22 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | WorkCalendar 컴포넌트, useSchedule 훅, 일정 CRUD 로직 | 80% 이상 |
| E2E 테스트 | 캘린더 전체 시나리오 (뷰 전환, 일정 CRUD, 네비게이션) | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| Mock 데이터 | `mock-data/schedule.json` |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | WorkCalendar | 컴포넌트 초기 렌더링 | 월간 뷰로 캘린더 표시 | FR-001 |
| UT-002 | WorkCalendar | 뷰 모드 전환 (월간/주간/일간) | 선택된 뷰 모드로 변경 | FR-002, BR-001 |
| UT-003 | useSchedule | 일정 데이터 렌더링 | 해당 날짜에 일정 표시 | FR-003 |
| UT-004 | WorkCalendar | 일정 클릭 이벤트 | 상세 모달 열림 | FR-004 |
| UT-005 | ScheduleForm | 일정 추가 폼 유효성 검사 | 필수 필드 에러 표시 | FR-005, BR-002 |
| UT-006 | useSchedule | 일정 수정 기능 | 수정된 데이터 반영 | FR-006 |
| UT-007 | useSchedule | 일정 삭제 기능 | 목록에서 제거 | FR-007, BR-003 |
| UT-008 | WorkCalendar | 날짜 네비게이션 (이전/다음/오늘) | 표시 날짜 변경 | FR-008 |
| UT-009 | ScheduleEvent | 일정 유형별 색상 표시 | 유형에 맞는 색상 적용 | FR-009 |
| UT-010 | WorkCalendar | 일정 드래그 이동 (선택) | 날짜 변경 반영 | FR-010 |

### 2.2 테스트 케이스 상세

#### UT-001: WorkCalendar 컴포넌트 초기 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/WorkCalendar/__tests__/WorkCalendar.test.tsx` |
| **테스트 블록** | `describe('WorkCalendar') → it('should render calendar in month view by default')` |
| **Mock 의존성** | mock-data/schedule.json |
| **입력 데이터** | - |
| **검증 포인트** | 캘린더 컨테이너 렌더링, 월간 뷰 버튼 활성 상태, 현재 월 표시 |
| **커버리지 대상** | WorkCalendar 초기화 로직 |
| **관련 요구사항** | FR-001 |

#### UT-002: 뷰 모드 전환 (월간/주간/일간)

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/WorkCalendar/__tests__/WorkCalendar.test.tsx` |
| **테스트 블록** | `describe('WorkCalendar') → describe('뷰 전환') → it('should switch to week view')` |
| **Mock 의존성** | - |
| **입력 데이터** | 주간 뷰 버튼 클릭 |
| **검증 포인트** | viewMode 상태가 'week'로 변경, 주간 캘린더 렌더링 |
| **커버리지 대상** | setViewMode 함수 |
| **관련 요구사항** | FR-002, BR-001 |

#### UT-003: 일정 데이터 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/WorkCalendar/__tests__/useSchedule.test.ts` |
| **테스트 블록** | `describe('useSchedule') → it('should load and render schedules')` |
| **Mock 의존성** | mock-data/schedule.json |
| **입력 데이터** | - |
| **검증 포인트** | schedules 배열에 데이터 존재, 캘린더에 일정 이벤트 표시 |
| **커버리지 대상** | useSchedule 훅 초기 로드 |
| **관련 요구사항** | FR-003 |

#### UT-004: 일정 클릭 이벤트

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/WorkCalendar/__tests__/WorkCalendar.test.tsx` |
| **테스트 블록** | `describe('WorkCalendar') → describe('일정 상호작용') → it('should open detail modal on click')` |
| **Mock 의존성** | 테스트용 일정 데이터 |
| **입력 데이터** | 일정 이벤트 클릭 |
| **검증 포인트** | 상세 모달 표시, 선택된 일정 정보 전달 |
| **커버리지 대상** | onEventClick 핸들러 |
| **관련 요구사항** | FR-004 |

#### UT-005: 일정 추가 폼 유효성 검사

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/WorkCalendar/__tests__/ScheduleForm.test.tsx` |
| **테스트 블록** | `describe('ScheduleForm') → describe('유효성 검사') → it('should show error for empty title')` |
| **Mock 의존성** | Form mock |
| **입력 데이터** | `{ title: '', type: 'production' }` |
| **검증 포인트** | "일정 제목을 입력해주세요" 에러 메시지 표시 |
| **커버리지 대상** | Form rules 유효성 검사 |
| **관련 요구사항** | FR-005, BR-002 |

#### UT-006: 일정 수정 기능

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/WorkCalendar/__tests__/useSchedule.test.ts` |
| **테스트 블록** | `describe('useSchedule') → describe('수정') → it('should update schedule')` |
| **Mock 의존성** | 기존 일정 데이터 |
| **입력 데이터** | `{ id: 'schedule-001', title: '수정된 일정' }` |
| **검증 포인트** | schedules 배열에서 해당 일정 업데이트 |
| **커버리지 대상** | updateSchedule 함수 |
| **관련 요구사항** | FR-006 |

#### UT-007: 일정 삭제 기능

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/WorkCalendar/__tests__/useSchedule.test.ts` |
| **테스트 블록** | `describe('useSchedule') → describe('삭제') → it('should delete schedule')` |
| **Mock 의존성** | 일정 데이터 10건 |
| **입력 데이터** | 삭제할 일정 ID |
| **검증 포인트** | schedules 배열에서 해당 일정 제거, 9건 남음 |
| **커버리지 대상** | deleteSchedule 함수 |
| **관련 요구사항** | FR-007, BR-003 |

#### UT-008: 날짜 네비게이션 (이전/다음/오늘)

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/WorkCalendar/__tests__/WorkCalendar.test.tsx` |
| **테스트 블록** | `describe('WorkCalendar') → describe('네비게이션') → it('should navigate to previous month')` |
| **Mock 의존성** | - |
| **입력 데이터** | 이전 버튼 클릭 |
| **검증 포인트** | currentDate가 이전 달로 변경, 캘린더 재렌더링 |
| **커버리지 대상** | goToPrev, goToNext, goToToday 함수 |
| **관련 요구사항** | FR-008 |

#### UT-009: 일정 유형별 색상 표시

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/WorkCalendar/__tests__/ScheduleEvent.test.tsx` |
| **테스트 블록** | `describe('ScheduleEvent') → it('should render with correct color by type')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ type: 'production', color: '#1890ff' }` |
| **검증 포인트** | 배경색이 타입에 맞게 적용됨 |
| **커버리지 대상** | getColorByType 함수 |
| **관련 요구사항** | FR-009 |

#### UT-010: 일정 드래그 이동 (선택)

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/WorkCalendar/__tests__/WorkCalendar.test.tsx` |
| **테스트 블록** | `describe('WorkCalendar') → describe('드래그') → it('should move schedule to new date')` |
| **Mock 의존성** | DnD context mock |
| **입력 데이터** | 드래그 시작/종료 이벤트 |
| **검증 포인트** | 일정의 startDate, endDate 업데이트 |
| **커버리지 대상** | onEventDrop 핸들러 |
| **관련 요구사항** | FR-010 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 캘린더 페이지 로드 및 월간 뷰 표시 | - | 페이지 접속 | 캘린더 표시, 일정 로드 | FR-001, FR-003 |
| E2E-002 | 뷰 모드 전환 (월간 → 주간 → 일간) | 페이지 로드 | 뷰 버튼 클릭 | 뷰 전환 동작 | FR-002 |
| E2E-003 | 일정 클릭 시 상세 모달 표시 | 일정 존재 | 일정 클릭 | 상세 모달 표시 | FR-004 |
| E2E-004 | 새 일정 추가 (폼 입력 및 저장) | 페이지 로드 | 추가 → 입력 → 저장 | 캘린더에 일정 추가 | FR-005 |
| E2E-005 | 일정 수정 | 기존 일정 | 수정 → 입력 → 저장 | 일정 정보 업데이트 | FR-006 |
| E2E-006 | 일정 삭제 | 기존 일정 | 삭제 → 확인 | 캘린더에서 제거 | FR-007 |
| E2E-007 | 날짜 네비게이션 동작 | 페이지 로드 | 이전/다음/오늘 클릭 | 날짜 변경 | FR-008 |
| E2E-008 | 유효성 검사 에러 표시 | 추가 모달 열림 | 빈 필드로 저장 | 에러 메시지 | FR-005, BR-002 |

### 3.2 테스트 케이스 상세

#### E2E-001: 캘린더 페이지 로드 및 월간 뷰 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/work-calendar.spec.ts` |
| **테스트명** | `test('캘린더 페이지가 월간 뷰로 로드된다')` |
| **사전조건** | - |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="work-calendar-page"]` |
| - 캘린더 영역 | `[data-testid="calendar-container"]` |
| - 월간 뷰 버튼 | `[data-testid="calendar-view-month"]` |
| - 현재 날짜 표시 | `[data-testid="calendar-current-date"]` |
| **실행 단계** | |
| 1 | `await page.goto('/sample/work-calendar')` |
| 2 | `await page.waitForSelector('[data-testid="calendar-container"]')` |
| **검증 포인트** | |
| 1 | `expect(page.locator('[data-testid="work-calendar-page"]')).toBeVisible()` |
| 2 | `expect(page.locator('[data-testid="calendar-view-month"]')).toHaveClass(/active/)` |
| 3 | `expect(page.locator('[data-testid="schedule-event-schedule-001"]')).toBeVisible()` |
| **스크린샷** | `e2e-001-calendar-load.png` |
| **관련 요구사항** | FR-001, FR-003 |

#### E2E-002: 뷰 모드 전환 (월간 → 주간 → 일간)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/work-calendar.spec.ts` |
| **테스트명** | `test('뷰 모드를 전환할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 뷰 전환 그룹 | `[data-testid="calendar-view-toggle"]` |
| - 주간 뷰 버튼 | `[data-testid="calendar-view-week"]` |
| - 일간 뷰 버튼 | `[data-testid="calendar-view-day"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="calendar-view-week"]')` |
| 2 | 주간 뷰 확인 |
| 3 | `await page.click('[data-testid="calendar-view-day"]')` |
| 4 | 일간 뷰 확인 |
| 5 | `await page.click('[data-testid="calendar-view-month"]')` |
| 6 | 월간 뷰 복귀 확인 |
| **검증 포인트** | |
| 1 | `expect(page.locator('[data-testid="calendar-view-week"]')).toHaveClass(/active/)` |
| 2 | `expect(page.locator('[data-testid="calendar-view-day"]')).toHaveClass(/active/)` |
| 3 | `expect(page.locator('[data-testid="calendar-view-month"]')).toHaveClass(/active/)` |
| **스크린샷** | `e2e-002-view-toggle.png` |
| **관련 요구사항** | FR-002 |

#### E2E-003: 일정 클릭 시 상세 모달 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/work-calendar.spec.ts` |
| **테스트명** | `test('일정 클릭 시 상세 모달이 표시된다')` |
| **사전조건** | 일정 데이터 존재 |
| **data-testid 셀렉터** | |
| - 일정 이벤트 | `[data-testid="schedule-event-schedule-001"]` |
| - 상세 모달 | `[data-testid="schedule-detail-modal"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="schedule-event-schedule-001"]')` |
| 2 | `await page.waitForSelector('[data-testid="schedule-detail-modal"]')` |
| **검증 포인트** | |
| 1 | `expect(page.locator('[data-testid="schedule-detail-modal"]')).toBeVisible()` |
| 2 | 일정 제목, 유형, 시간 정보 표시 확인 |
| **스크린샷** | `e2e-003-detail-modal.png` |
| **관련 요구사항** | FR-004 |

#### E2E-004: 새 일정 추가 (폼 입력 및 저장)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/work-calendar.spec.ts` |
| **테스트명** | `test('새 일정을 추가할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 일정 추가 버튼 | `[data-testid="add-schedule-btn"]` |
| - 폼 모달 | `[data-testid="schedule-form-modal"]` |
| - 제목 입력 | `[data-testid="schedule-title-input"]` |
| - 유형 선택 | `[data-testid="schedule-type-select"]` |
| - 시작 날짜 | `[data-testid="schedule-start-date"]` |
| - 종료 날짜 | `[data-testid="schedule-end-date"]` |
| - 설명 입력 | `[data-testid="schedule-description-input"]` |
| - 저장 버튼 | `[data-testid="save-schedule-btn"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="add-schedule-btn"]')` |
| 2 | `await page.fill('[data-testid="schedule-title-input"]', '신규 생산 일정')` |
| 3 | `await page.click('[data-testid="schedule-type-select"]')` |
| 4 | `await page.click('[data-testid="schedule-type-production"]')` |
| 5 | 시작/종료 날짜 선택 |
| 6 | `await page.fill('[data-testid="schedule-description-input"]', '테스트 일정')` |
| 7 | `await page.click('[data-testid="save-schedule-btn"]')` |
| **검증 포인트** | |
| 1 | 모달 닫힘 |
| 2 | 캘린더에 '신규 생산 일정' 이벤트 표시 |
| 3 | 성공 토스트 메시지 |
| **스크린샷** | `e2e-004-add-schedule.png` |
| **관련 요구사항** | FR-005 |

#### E2E-005: 일정 수정

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/work-calendar.spec.ts` |
| **테스트명** | `test('기존 일정을 수정할 수 있다')` |
| **사전조건** | 기존 일정 존재 |
| **data-testid 셀렉터** | |
| - 일정 이벤트 | `[data-testid="schedule-event-schedule-001"]` |
| - 수정 버튼 | `[data-testid="edit-schedule-btn"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="schedule-event-schedule-001"]')` |
| 2 | `await page.click('[data-testid="edit-schedule-btn"]')` |
| 3 | `await page.fill('[data-testid="schedule-title-input"]', '수정된 일정')` |
| 4 | `await page.click('[data-testid="save-schedule-btn"]')` |
| **검증 포인트** | |
| 1 | 모달 닫힘 |
| 2 | 캘린더에 '수정된 일정' 표시 |
| **스크린샷** | `e2e-005-edit-schedule.png` |
| **관련 요구사항** | FR-006 |

#### E2E-006: 일정 삭제

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/work-calendar.spec.ts` |
| **테스트명** | `test('일정을 삭제할 수 있다')` |
| **사전조건** | 기존 일정 존재 |
| **data-testid 셀렉터** | |
| - 삭제 버튼 | `[data-testid="delete-schedule-btn"]` |
| - 확인 다이얼로그 | `.ant-modal-confirm` |
| - 확인 버튼 | `[data-testid="confirm-ok-btn"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="schedule-event-schedule-001"]')` |
| 2 | `await page.click('[data-testid="delete-schedule-btn"]')` |
| 3 | `await page.click('[data-testid="confirm-ok-btn"]')` |
| **검증 포인트** | |
| 1 | 확인 다이얼로그 표시 |
| 2 | 삭제 후 캘린더에서 해당 일정 제거 |
| 3 | 삭제 완료 토스트 메시지 |
| **스크린샷** | `e2e-006-delete-schedule.png` |
| **관련 요구사항** | FR-007, BR-003 |

#### E2E-007: 날짜 네비게이션 동작

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/work-calendar.spec.ts` |
| **테스트명** | `test('날짜 네비게이션이 동작한다')` |
| **사전조건** | 페이지 로드 완료 (2026년 1월) |
| **data-testid 셀렉터** | |
| - 이전 버튼 | `[data-testid="calendar-nav-prev"]` |
| - 다음 버튼 | `[data-testid="calendar-nav-next"]` |
| - 오늘 버튼 | `[data-testid="calendar-nav-today"]` |
| - 현재 날짜 표시 | `[data-testid="calendar-current-date"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="calendar-nav-prev"]')` |
| 2 | 12월 표시 확인 |
| 3 | `await page.click('[data-testid="calendar-nav-next"]')` |
| 4 | 1월 표시 확인 |
| 5 | `await page.click('[data-testid="calendar-nav-next"]')` |
| 6 | 2월 표시 확인 |
| 7 | `await page.click('[data-testid="calendar-nav-today"]')` |
| 8 | 현재 달 표시 확인 |
| **검증 포인트** | |
| 1 | `expect(page.locator('[data-testid="calendar-current-date"]')).toContainText('2025년 12월')` |
| 2 | `expect(page.locator('[data-testid="calendar-current-date"]')).toContainText('2026년 1월')` |
| 3 | `expect(page.locator('[data-testid="calendar-current-date"]')).toContainText('2026년 2월')` |
| **스크린샷** | `e2e-007-navigation.png` |
| **관련 요구사항** | FR-008 |

#### E2E-008: 유효성 검사 에러 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/work-calendar.spec.ts` |
| **테스트명** | `test('필수 필드 누락 시 에러 메시지가 표시된다')` |
| **사전조건** | 일정 추가 모달 열림 |
| **data-testid 셀렉터** | |
| - 에러 메시지 | `[data-testid="error-message"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="add-schedule-btn"]')` |
| 2 | `await page.click('[data-testid="save-schedule-btn"]')` |
| **검증 포인트** | |
| 1 | `expect(page.locator('.ant-form-item-explain-error')).toContainText('일정 제목을 입력해주세요')` |
| 2 | 제목 입력 필드 빨간색 테두리 |
| **스크린샷** | `e2e-008-validation-error.png` |
| **관련 요구사항** | FR-005, BR-002 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 캘린더 초기 로드 | - | 1. 페이지 접속 | 월간 뷰 표시, 일정 로드 | High | FR-001 |
| TC-002 | 뷰 모드 전환 UI | 페이지 로드 | 1. 뷰 버튼 클릭 | 각 뷰 정상 렌더링 | High | FR-002 |
| TC-003 | 일정 색상 구분 확인 | 일정 존재 | 1. 캘린더 확인 | 유형별 색상 구분 | Medium | FR-009 |
| TC-004 | 모달 UI/UX 확인 | - | 1. 추가/상세 모달 열기 | 모달 디자인 적절 | Medium | FR-004, FR-005 |
| TC-005 | 반응형 동작 확인 | - | 1. 브라우저 크기 조절 | 레이아웃 적응 | Medium | - |
| TC-006 | 접근성 확인 | - | 1. 키보드 탐색 | 모든 기능 접근 가능 | Medium | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 캘린더 초기 로드

**테스트 목적**: 캘린더 페이지가 정상적으로 로드되고 월간 뷰로 표시되는지 확인

**테스트 단계**:
1. 브라우저에서 /sample/work-calendar 접속
2. 페이지 로드 완료 대기
3. 캘린더 렌더링 확인

**예상 결과**:
- 월간 캘린더 그리드 표시
- 현재 달의 날짜들 표시
- 기존 일정 데이터 로드 및 표시
- 뷰 전환 버튼 그룹 표시 (월간 활성)

**검증 기준**:
- [ ] 캘린더 컨테이너가 표시됨
- [ ] 현재 월/년도가 헤더에 표시됨
- [ ] 일정 이벤트가 해당 날짜에 표시됨
- [ ] 네비게이션 버튼이 동작함

#### TC-002: 뷰 모드 전환 UI

**테스트 목적**: 월간/주간/일간 뷰 전환이 정상 동작하는지 확인

**테스트 단계**:
1. 월간 뷰에서 시작
2. 주간 뷰 버튼 클릭
3. 주간 캘린더 레이아웃 확인
4. 일간 뷰 버튼 클릭
5. 일간 캘린더 레이아웃 확인
6. 월간 뷰로 복귀

**예상 결과**:
- 주간 뷰: 7일 컬럼 표시, 시간 축 표시
- 일간 뷰: 단일 날짜, 상세 시간 슬롯
- 월간 뷰: 달력 그리드

**검증 기준**:
- [ ] 각 뷰 전환 시 애니메이션/전환 부드러움
- [ ] 선택된 뷰 버튼 활성 상태 표시
- [ ] 일정 데이터가 각 뷰에 맞게 렌더링

#### TC-003: 일정 색상 구분 확인

**테스트 목적**: 일정 유형별 색상이 올바르게 적용되는지 확인

**테스트 단계**:
1. 캘린더에서 다양한 유형의 일정 확인
2. 각 일정의 배경색 확인
3. 범례(있는 경우)와 일치 확인

**예상 결과**:
- 생산(production): 파란색 (#1890ff)
- 정비(maintenance): 주황색 (#fa8c16)
- 회의(meeting): 초록색 (#52c41a)
- 교육(training): 보라색 (#722ed1)

**검증 기준**:
- [ ] 생산 일정이 파란색으로 표시됨
- [ ] 정비 일정이 주황색으로 표시됨
- [ ] 회의 일정이 초록색으로 표시됨
- [ ] 교육 일정이 보라색으로 표시됨

#### TC-004: 모달 UI/UX 확인

**테스트 목적**: 일정 상세/추가/수정 모달의 UI가 적절한지 확인

**테스트 단계**:
1. 일정 클릭하여 상세 모달 열기
2. 상세 정보 표시 확인
3. 수정/삭제 버튼 확인
4. 추가 버튼으로 새 모달 열기
5. 폼 필드 배치 확인

**예상 결과**:
- 상세 모달: 제목, 유형, 시간, 설명 표시
- 폼 모달: 입력 필드 적절한 레이아웃
- 버튼 위치 일관성

**검증 기준**:
- [ ] 모달 오버레이 배경 처리
- [ ] 닫기 버튼 (X) 위치 적절
- [ ] 폼 레이블과 입력 필드 정렬
- [ ] 버튼 그룹 하단 우측 정렬

#### TC-005: 반응형 동작 확인

**테스트 목적**: 다양한 화면 크기에서 레이아웃이 적절히 대응하는지 확인

**테스트 단계**:
1. 데스크톱 크기 (1920px)
2. 태블릿 크기 (768px)
3. 모바일 크기 (375px)

**예상 결과**:
- 데스크톱: 전체 캘린더 그리드
- 태블릿: 축소된 캘린더, 사이드바 접힘
- 모바일: 단순화된 뷰, 터치 친화적 버튼

**검증 기준**:
- [ ] 모든 요소가 화면 내에 표시됨
- [ ] 스크롤 없이 주요 기능 접근 가능
- [ ] 터치 타겟 크기 적절 (모바일)

#### TC-006: 접근성 확인

**테스트 목적**: 키보드만으로 모든 기능에 접근 가능한지 확인

**테스트 단계**:
1. Tab 키로 요소 포커스 이동
2. Enter/Space로 버튼 활성화
3. Escape로 모달 닫기
4. 화살표 키로 날짜 이동

**예상 결과**:
- 모든 인터랙티브 요소에 포커스 가능
- 포커스 표시 명확
- 모달 열림 시 포커스 트랩

**검증 기준**:
- [ ] Tab 순서 논리적
- [ ] 포커스 링 표시됨
- [ ] 키보드로 뷰 전환 가능
- [ ] 키보드로 일정 선택/열기 가능

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-SCHEDULE-PROD | 생산 일정 | `{ id: 'schedule-001', title: 'A라인 생산', type: 'production', startDate: '2026-01-22T09:00:00', endDate: '2026-01-22T18:00:00', color: '#1890ff' }` |
| MOCK-SCHEDULE-MAINT | 정비 일정 | `{ id: 'schedule-002', title: '설비 정기 점검', type: 'maintenance', startDate: '2026-01-23T14:00:00', endDate: '2026-01-23T16:00:00', color: '#fa8c16' }` |
| MOCK-SCHEDULE-MEET | 회의 일정 | `{ id: 'schedule-003', title: '주간 생산 회의', type: 'meeting', startDate: '2026-01-24T10:00:00', endDate: '2026-01-24T11:00:00', color: '#52c41a' }` |
| MOCK-SCHEDULE-TRAIN | 교육 일정 | `{ id: 'schedule-004', title: '신입 안전 교육', type: 'training', startDate: '2026-01-25T13:00:00', endDate: '2026-01-25T17:00:00', color: '#722ed1' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-CALENDAR | 기본 E2E 환경 | mock-data/schedule.json | 일정 10건+ |

### 5.3 mock-data/schedule.json

```json
{
  "schedules": [
    {
      "id": "schedule-001",
      "title": "A라인 생산",
      "type": "production",
      "typeLabel": "생산",
      "startDate": "2026-01-22T09:00:00",
      "endDate": "2026-01-22T18:00:00",
      "color": "#1890ff",
      "description": "A라인 정규 생산 일정",
      "location": "A동 1층",
      "assignee": "김생산"
    },
    {
      "id": "schedule-002",
      "title": "설비 정기 점검",
      "type": "maintenance",
      "typeLabel": "정비",
      "startDate": "2026-01-23T14:00:00",
      "endDate": "2026-01-23T16:00:00",
      "color": "#fa8c16",
      "description": "월간 설비 정기 점검",
      "location": "전 공장",
      "assignee": "박정비"
    }
  ],
  "total": 10
}
```

### 5.4 테스트 일정 유형

| 유형 코드 | 유형명 | 색상 | 테스트 데이터 수 |
|----------|-------|------|----------------|
| production | 생산 | #1890ff (파랑) | 4건+ |
| maintenance | 정비 | #fa8c16 (주황) | 2건+ |
| meeting | 회의 | #52c41a (초록) | 2건+ |
| training | 교육 | #722ed1 (보라) | 2건+ |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지별 셀렉터

#### 작업 일정 캘린더 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `work-calendar-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `calendar-view-toggle` | 뷰 모드 전환 버튼 그룹 | 뷰 전환 영역 |
| `calendar-view-month` | 월간 뷰 버튼 | 월간 뷰 선택 |
| `calendar-view-week` | 주간 뷰 버튼 | 주간 뷰 선택 |
| `calendar-view-day` | 일간 뷰 버튼 | 일간 뷰 선택 |
| `calendar-container` | 캘린더 영역 | 캘린더 표시 확인 |
| `calendar-nav-prev` | 이전 버튼 | 이전 기간 이동 |
| `calendar-nav-next` | 다음 버튼 | 다음 기간 이동 |
| `calendar-nav-today` | 오늘 버튼 | 오늘로 이동 |
| `calendar-current-date` | 현재 날짜 표시 | 현재 표시 기간 확인 |
| `add-schedule-btn` | 일정 추가 버튼 | 추가 모달 열기 |

#### 일정 이벤트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `schedule-event-{id}` | 일정 이벤트 | 개별 일정 클릭 |

#### 일정 상세 모달

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `schedule-detail-modal` | 상세 모달 컨테이너 | 모달 표시 확인 |
| `schedule-detail-title` | 일정 제목 | 제목 확인 |
| `schedule-detail-type` | 일정 유형 | 유형 확인 |
| `schedule-detail-time` | 일정 시간 | 시간 확인 |
| `schedule-detail-description` | 설명 | 설명 확인 |
| `edit-schedule-btn` | 수정 버튼 | 수정 모달 열기 |
| `delete-schedule-btn` | 삭제 버튼 | 삭제 확인 |

#### 일정 폼 모달

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `schedule-form-modal` | 폼 모달 컨테이너 | 모달 표시 확인 |
| `schedule-title-input` | 일정 제목 입력 | 제목 입력 |
| `schedule-type-select` | 일정 유형 선택 | 유형 선택 |
| `schedule-type-production` | 생산 옵션 | 생산 유형 선택 |
| `schedule-type-maintenance` | 정비 옵션 | 정비 유형 선택 |
| `schedule-type-meeting` | 회의 옵션 | 회의 유형 선택 |
| `schedule-type-training` | 교육 옵션 | 교육 유형 선택 |
| `schedule-start-date` | 시작 날짜/시간 | 시작 시간 입력 |
| `schedule-end-date` | 종료 날짜/시간 | 종료 시간 입력 |
| `schedule-description-input` | 설명 입력 | 설명 입력 |
| `schedule-color-picker` | 색상 선택 | 커스텀 색상 선택 |
| `save-schedule-btn` | 저장 버튼 | 저장 실행 |
| `cancel-schedule-btn` | 취소 버튼 | 모달 닫기 |

#### 공통

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `confirm-ok-btn` | 확인 버튼 | 다이얼로그 확인 |
| `confirm-cancel-btn` | 취소 버튼 | 다이얼로그 취소 |
| `error-message` | 에러 메시지 | 에러 표시 확인 |

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
TSK-06-11 Test Specification
Version: 1.0
Created: 2026-01-22
-->
