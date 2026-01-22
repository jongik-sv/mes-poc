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
| Task ID | TSK-06-14 |
| Task명 | [샘플] 생산 계획 간트 차트 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-22 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | 간트 차트 유틸리티, 데이터 변환 로직 | 80% 이상 |
| E2E 테스트 | 주요 사용자 시나리오 (조회, 스케일 변경, 툴팁) | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 반응형, 접근성 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터 | mock-data/production-plan.json |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | ProductionGantt | 간트 차트 렌더링 | 컴포넌트 렌더링 성공 | FR-001 |
| UT-002 | calculateBarPosition | 날짜 범위로 바 위치 계산 | 올바른 left, width 반환 | FR-002, BR-001 |
| UT-003 | ScaleSelector | 스케일 변경 | 콜백 함수 호출 | FR-003 |
| UT-004 | TaskBar | 진행률 표시 | 올바른 채움 비율 | FR-004, BR-002 |
| UT-005 | formatTooltipData | 툴팁 데이터 포맷 | 올바른 형식 반환 | FR-005 |
| UT-006 | getStatusColor | 상태별 색상 매핑 | 올바른 색상 코드 | BR-003 |

### 2.2 테스트 케이스 상세

#### UT-001: ProductionGantt 간트 차트 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/ProductionGantt.test.tsx` |
| **테스트 블록** | `describe('ProductionGantt') → it('should render gantt chart with data')` |
| **Mock 의존성** | mock-data/production-plan.json |
| **입력 데이터** | Mock 데이터 (5개 작업) |
| **검증 포인트** | 컴포넌트 렌더링, 작업 바 5개 존재 |
| **커버리지 대상** | ProductionGantt 컴포넌트 렌더링 분기 |
| **관련 요구사항** | FR-001 |

```typescript
// 테스트 코드 예시
describe('ProductionGantt', () => {
  it('should render gantt chart with data', async () => {
    render(<ProductionGantt />);

    expect(screen.getByTestId('production-gantt-page')).toBeInTheDocument();
    expect(screen.getAllByTestId('task-bar')).toHaveLength(5);
  });
});
```

#### UT-002: calculateBarPosition 날짜 범위 계산

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/ProductionGantt.test.tsx` |
| **테스트 블록** | `describe('calculateBarPosition') → it('should calculate correct position')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ startDate: '2026-01-20', endDate: '2026-01-24', viewStart: '2026-01-19', scale: 'day' }` |
| **검증 포인트** | left, width 값이 기대값과 일치 |
| **커버리지 대상** | calculateBarPosition 함수 |
| **관련 요구사항** | FR-002, BR-001 |

```typescript
describe('calculateBarPosition', () => {
  it('should calculate correct position for day scale', () => {
    const result = calculateBarPosition({
      startDate: '2026-01-20',
      endDate: '2026-01-24',
      viewStart: '2026-01-19',
      scale: 'day',
      cellWidth: 40,
    });

    expect(result.left).toBe(40); // 1일 후 시작
    expect(result.width).toBe(200); // 5일 길이
  });
});
```

#### UT-003: ScaleSelector 스케일 변경

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/ProductionGantt.test.tsx` |
| **테스트 블록** | `describe('ScaleSelector') → it('should call onChange when scale selected')` |
| **Mock 의존성** | - |
| **입력 데이터** | 클릭 이벤트 |
| **검증 포인트** | onChange 콜백이 선택된 스케일 값과 함께 호출됨 |
| **커버리지 대상** | ScaleSelector 컴포넌트 |
| **관련 요구사항** | FR-003 |

```typescript
describe('ScaleSelector', () => {
  it('should call onChange when scale selected', async () => {
    const onChange = vi.fn();
    render(<ScaleSelector value="week" onChange={onChange} />);

    await userEvent.click(screen.getByText('월간'));

    expect(onChange).toHaveBeenCalledWith('month');
  });
});
```

#### UT-004: TaskBar 진행률 표시

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/ProductionGantt.test.tsx` |
| **테스트 블록** | `describe('TaskBar') → it('should display correct progress')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ progress: 70 }` |
| **검증 포인트** | 진행률 바가 70% 너비로 표시됨 |
| **커버리지 대상** | TaskBar 컴포넌트 진행률 렌더링 |
| **관련 요구사항** | FR-004, BR-002 |

```typescript
describe('TaskBar', () => {
  it('should display correct progress', () => {
    render(<TaskBar task={{ ...mockTask, progress: 70 }} />);

    const progressBar = screen.getByTestId('progress-fill');
    expect(progressBar).toHaveStyle({ width: '70%' });
  });
});
```

#### UT-005: formatTooltipData 툴팁 데이터 포맷

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/ProductionGantt.test.tsx` |
| **테스트 블록** | `describe('formatTooltipData') → it('should format tooltip data correctly')` |
| **Mock 의존성** | - |
| **입력 데이터** | ProductionPlan 객체 |
| **검증 포인트** | 올바른 형식의 툴팁 문자열 반환 |
| **커버리지 대상** | formatTooltipData 유틸리티 함수 |
| **관련 요구사항** | FR-005 |

#### UT-006: getStatusColor 상태별 색상 매핑

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/ProductionGantt.test.tsx` |
| **테스트 블록** | `describe('getStatusColor') → it('should return correct color for each status')` |
| **Mock 의존성** | - |
| **입력 데이터** | 각 상태값 ('planned', 'in_progress', 'completed', 'delayed') |
| **검증 포인트** | 올바른 색상 코드 반환 |
| **커버리지 대상** | getStatusColor 함수 |
| **관련 요구사항** | BR-003 |

```typescript
describe('getStatusColor', () => {
  it.each([
    ['planned', '#8c8c8c'],
    ['in_progress', '#1677ff'],
    ['completed', '#52c41a'],
    ['delayed', '#ff4d4f'],
  ])('should return %s for status %s', (status, expectedColor) => {
    expect(getStatusColor(status)).toBe(expectedColor);
  });
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 간트 차트 화면 로드 | 로그인 상태 | 1. 메뉴 클릭 | 차트 표시됨 | FR-001, BR-004 |
| E2E-002 | 작업 바 표시 확인 | 화면 로드됨 | 1. 작업 바 확인 | 5개 작업 바 표시 | FR-002, BR-001 |
| E2E-003 | 스케일 변경 | 화면 로드됨 | 1. 월간 클릭 | 스케일 변경됨 | FR-003 |
| E2E-004 | 진행률 확인 | 화면 로드됨 | 1. 작업 바 확인 | 진행률 표시됨 | FR-004, BR-002 |
| E2E-005 | 툴팁 표시 | 화면 로드됨 | 1. 작업 바 호버 | 툴팁 표시됨 | FR-005 |
| E2E-006 | 상태별 색상 | 화면 로드됨 | 1. 색상 확인 | 상태별 색상 적용 | BR-003 |

### 3.2 테스트 케이스 상세

#### E2E-001: 간트 차트 화면 로드

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/production-gantt.spec.ts` |
| **테스트명** | `test('사용자가 생산 계획 간트 차트를 조회할 수 있다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="production-gantt-page"]` |
| - 간트 차트 영역 | `[data-testid="gantt-chart"]` |
| - 스케일 선택기 | `[data-testid="scale-selector"]` |
| **실행 단계** | |
| 1 | 사이드바에서 "생산 계획 간트 차트" 메뉴 클릭 |
| 2 | 화면 로드 대기 |
| **검증 포인트** | `expect(page.locator('[data-testid="gantt-chart"]')).toBeVisible()` |
| **스크린샷** | `e2e-001-gantt-loaded.png` |
| **관련 요구사항** | FR-001, BR-004 |

#### E2E-002: 작업 바 표시 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/production-gantt.spec.ts` |
| **테스트명** | `test('작업 바가 시작일~종료일 범위로 표시된다')` |
| **사전조건** | 간트 차트 화면 로드됨 |
| **data-testid 셀렉터** | |
| - 작업 바 | `[data-testid="task-bar"]` |
| - 작업명 | `[data-testid="task-name"]` |
| **검증 포인트** | `expect(page.locator('[data-testid="task-bar"]')).toHaveCount(5)` |
| **스크린샷** | `e2e-002-task-bars.png` |
| **관련 요구사항** | FR-002, BR-001 |

#### E2E-003: 스케일 변경

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/production-gantt.spec.ts` |
| **테스트명** | `test('스케일을 일간/주간/월간으로 변경할 수 있다')` |
| **사전조건** | 간트 차트 화면 로드됨 (기본: 주간) |
| **data-testid 셀렉터** | |
| - 일간 버튼 | `[data-testid="scale-day"]` |
| - 주간 버튼 | `[data-testid="scale-week"]` |
| - 월간 버튼 | `[data-testid="scale-month"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="scale-month"]')` |
| 2 | 타임라인 변경 확인 |
| **검증 포인트** | `expect(page.locator('[data-testid="scale-month"]')).toHaveClass(/active/)` |
| **스크린샷** | `e2e-003-scale-month.png` |
| **관련 요구사항** | FR-003 |

#### E2E-004: 진행률 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/production-gantt.spec.ts` |
| **테스트명** | `test('작업 바에 진행률이 시각적으로 표시된다')` |
| **사전조건** | 간트 차트 화면 로드됨 |
| **data-testid 셀렉터** | |
| - 진행률 채움 | `[data-testid="progress-fill"]` |
| **검증 포인트** | 진행률 바 존재 및 너비 확인 |
| **스크린샷** | `e2e-004-progress.png` |
| **관련 요구사항** | FR-004, BR-002 |

#### E2E-005: 툴팁 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/production-gantt.spec.ts` |
| **테스트명** | `test('작업 바 호버 시 상세 정보 툴팁이 표시된다')` |
| **사전조건** | 간트 차트 화면 로드됨 |
| **data-testid 셀렉터** | |
| - 툴팁 | `[data-testid="task-tooltip"]` |
| **실행 단계** | |
| 1 | `await page.hover('[data-testid="task-bar"]:first-child')` |
| 2 | 툴팁 표시 대기 |
| **검증 포인트** | `expect(page.locator('[data-testid="task-tooltip"]')).toBeVisible()` |
| **스크린샷** | `e2e-005-tooltip.png` |
| **관련 요구사항** | FR-005 |

#### E2E-006: 상태별 색상

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/production-gantt.spec.ts` |
| **테스트명** | `test('작업 상태에 따라 바 색상이 다르게 표시된다')` |
| **사전조건** | 간트 차트 화면 로드됨 (다양한 상태의 작업 존재) |
| **검증 포인트** | 각 상태별 색상 확인 |
| **스크린샷** | `e2e-006-status-colors.png` |
| **관련 요구사항** | BR-003 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 간트 차트 표시 | 로그인 | 1. 메뉴 클릭 | 차트 표시됨 | High | FR-001 |
| TC-002 | 작업 바 날짜 범위 | 차트 표시 | 1. 바 위치 확인 | 날짜에 맞게 표시 | High | FR-002 |
| TC-003 | 스케일 변경 | 차트 표시 | 1. 각 스케일 클릭 | 타임라인 변경 | High | FR-003 |
| TC-004 | 진행률 표시 | 차트 표시 | 1. 바 채움 확인 | 진행률 반영 | Medium | FR-004 |
| TC-005 | 툴팁 표시 | 차트 표시 | 1. 바 호버 | 상세 정보 표시 | Medium | FR-005 |
| TC-006 | 반응형 확인 | - | 1. 브라우저 크기 조절 | 레이아웃 적응 | Medium | - |
| TC-007 | 로딩 상태 | - | 1. 화면 진입 | 스켈레톤 표시 | Low | - |
| TC-008 | 빈 데이터 | 데이터 없음 | 1. 화면 진입 | Empty 표시 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 간트 차트 표시

**테스트 목적**: 사용자가 생산 계획 간트 차트 화면에 접근하여 차트를 볼 수 있는지 확인

**테스트 단계**:
1. 로그인 완료
2. 사이드바에서 "샘플 > 생산 계획 간트 차트" 메뉴 클릭
3. 간트 차트 화면이 표시되는지 확인

**예상 결과**:
- 타임라인 헤더가 표시됨 (날짜)
- 작업 목록이 표시됨 (좌측)
- 작업 바가 표시됨 (타임라인 영역)

**검증 기준**:
- [ ] 간트 차트 영역이 정상적으로 로드됨
- [ ] 스케일 선택기가 표시됨 (일간/주간/월간)
- [ ] 기본 스케일이 "주간"으로 설정됨

#### TC-003: 스케일 변경

**테스트 목적**: 사용자가 일/주/월 단위로 타임라인 스케일을 변경할 수 있는지 확인

**테스트 단계**:
1. 간트 차트 화면 접속 (기본: 주간)
2. "일간" 버튼 클릭
3. 타임라인이 일 단위로 변경되는지 확인
4. "월간" 버튼 클릭
5. 타임라인이 월 단위로 변경되는지 확인

**예상 결과**:
- 각 스케일 버튼 클릭 시 타임라인 헤더가 변경됨
- 작업 바의 위치/길이가 스케일에 맞게 조정됨

**검증 기준**:
- [ ] 일간: 일별 컬럼 표시
- [ ] 주간: 주별 또는 일별 컬럼 (7일 범위)
- [ ] 월간: 주별 또는 월별 컬럼 (한 달 범위)

#### TC-006: 반응형 확인

**테스트 목적**: 다양한 화면 크기에서 간트 차트가 적절히 표시되는지 확인

**테스트 단계**:
1. 데스크톱 크기 (1920x1080)에서 화면 확인
2. 태블릿 크기 (1024x768)에서 화면 확인
3. 모바일 크기 (375x667)에서 화면 확인

**예상 결과**:
- 각 화면 크기에서 레이아웃이 적응됨
- 모바일에서는 좌우 스크롤로 타임라인 탐색 가능

**검증 기준**:
- [ ] 데스크톱: 전체 타임라인 표시
- [ ] 태블릿: 축소된 타임라인, 스크롤 가능
- [ ] 모바일: 최소 타임라인, 좌우 스크롤

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-TASK-01 | 정상 작업 (진행중) | `{ id: 'PP-001', name: '제품A 생산', progress: 70, status: 'in_progress' }` |
| MOCK-TASK-02 | 완료 작업 | `{ id: 'PP-002', name: '제품B 생산', progress: 100, status: 'completed' }` |
| MOCK-TASK-03 | 지연 작업 | `{ id: 'PP-003', name: '제품C 생산', progress: 30, status: 'delayed' }` |
| MOCK-TASK-04 | 계획된 작업 | `{ id: 'PP-004', name: '제품D 생산', progress: 0, status: 'planned' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-GANTT-BASE | 기본 E2E 환경 | mock-data/production-plan.json | 작업 5개 (다양한 상태) |
| SEED-GANTT-EMPTY | 빈 환경 (작업 없음) | mock-data/production-plan-empty.json | 빈 배열 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 기능 테스트 |
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 기능 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지별 셀렉터

#### 생산 계획 간트 차트 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `production-gantt-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `gantt-chart` | 간트 차트 영역 | 차트 표시 확인 |
| `scale-selector` | 스케일 선택기 컨테이너 | 스케일 컨트롤 |
| `scale-day` | 일간 버튼 | 스케일 변경 |
| `scale-week` | 주간 버튼 | 스케일 변경 |
| `scale-month` | 월간 버튼 | 스케일 변경 |
| `date-navigator` | 기간 네비게이션 | 기간 이동 |
| `date-prev` | 이전 버튼 | 이전 기간 |
| `date-next` | 다음 버튼 | 다음 기간 |
| `date-label` | 현재 기간 라벨 | 기간 표시 |
| `task-list` | 작업 목록 영역 | 작업명 표시 |
| `task-row` | 작업 행 | 행 단위 |
| `task-name` | 작업명 | 작업명 텍스트 |
| `timeline-header` | 타임라인 헤더 | 날짜 헤더 |
| `timeline-body` | 타임라인 본문 | 바 영역 |
| `task-bar` | 작업 바 | 작업 바 요소 |
| `task-bar-{id}` | 특정 작업 바 | 개별 작업 바 |
| `progress-fill` | 진행률 채움 | 진행률 표시 |
| `task-tooltip` | 작업 툴팁 | 호버 시 툴팁 |
| `legend` | 범례 영역 | 색상 범례 |
| `summary` | 요약 영역 | 통계 요약 |
| `empty-state` | 빈 상태 | 데이터 없음 |
| `loading-skeleton` | 로딩 스켈레톤 | 로딩 중 |
| `error-result` | 에러 상태 | 에러 발생 시 |

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
Task: TSK-06-14
Version: 1.0
Created: 2026-01-22
-->
