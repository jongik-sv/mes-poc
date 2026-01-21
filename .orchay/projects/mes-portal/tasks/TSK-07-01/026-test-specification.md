# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-21

> **목적**: 대시보드 레이아웃 컴포넌트 테스트 시나리오 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-07-01 |
| Task명 | 대시보드 레이아웃 |
| 설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-21 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | Dashboard 컴포넌트, 위젯 영역 렌더링, 반응형 로직 | 80% 이상 |
| E2E 테스트 | 대시보드 페이지 로드, 위젯 표시, 반응형 동작 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 레이아웃 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |
| 반응형 테스트 뷰포트 | xs (< 576px), sm (576px), md (768px), lg (992px), xl (1200px) |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | Dashboard | 정상 렌더링 | 모든 위젯 영역 표시 | FR-001 |
| UT-002 | Dashboard | KPI 카드 영역 렌더링 | KPI 카드 슬롯 표시 | FR-002 |
| UT-003 | Dashboard | 차트 영역 렌더링 | 차트 슬롯 표시 | FR-003 |
| UT-004 | Dashboard | 최근 활동 영역 렌더링 | 최근 활동 슬롯 표시 | FR-004 |
| UT-005 | Dashboard | 반응형 그리드 lg | 4컬럼 레이아웃 | FR-005, BR-001 |
| UT-006 | Dashboard | 반응형 그리드 md | 2컬럼 레이아웃 | FR-005, BR-001 |
| UT-007 | Dashboard | 반응형 그리드 xs | 1컬럼 레이아웃 | FR-005, BR-001 |
| UT-008 | DashboardWidget | 최소 높이 유지 | 위젯 최소 높이 적용 | BR-002 |

### 2.2 테스트 케이스 상세

#### UT-001: Dashboard 정상 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/Dashboard.test.tsx` |
| **테스트 블록** | `describe('Dashboard') -> it('renders all widget areas')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<Dashboard />` |
| **검증 포인트** | KPI, 차트, 최근 활동 영역이 모두 렌더링되는지 확인 |
| **커버리지 대상** | Dashboard 컴포넌트 렌더링 |
| **관련 요구사항** | FR-001 |

```typescript
// 테스트 코드 예시
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';

describe('Dashboard', () => {
  it('renders all widget areas', () => {
    render(<Dashboard />);

    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-section')).toBeInTheDocument();
    expect(screen.getByTestId('chart-section')).toBeInTheDocument();
    expect(screen.getByTestId('recent-recent-activity-section')).toBeInTheDocument();
  });
});
```

#### UT-002: KPI 카드 영역 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/Dashboard.test.tsx` |
| **테스트 블록** | `describe('Dashboard') -> it('renders KPI card section')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<Dashboard />` |
| **검증 포인트** | KPI 카드 영역이 올바른 그리드 구조로 렌더링되는지 확인 |
| **커버리지 대상** | KPI 섹션 렌더링 |
| **관련 요구사항** | FR-002 |

```typescript
it('renders KPI card section with grid layout', () => {
  render(<Dashboard />);

  const kpiSection = screen.getByTestId('kpi-section');
  expect(kpiSection).toBeInTheDocument();

  // KPI 카드들이 존재하는지 확인 (010-design.md 11.8 기준)
  expect(screen.getByTestId('kpi-card-operation-rate')).toBeInTheDocument();
  expect(screen.getByTestId('kpi-card-defect-rate')).toBeInTheDocument();
  expect(screen.getByTestId('kpi-card-production-volume')).toBeInTheDocument();
  expect(screen.getByTestId('kpi-card-achievement-rate')).toBeInTheDocument();
});
```

#### UT-003: 차트 영역 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/Dashboard.test.tsx` |
| **테스트 블록** | `describe('Dashboard') -> it('renders chart section')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<Dashboard />` |
| **검증 포인트** | 차트 영역이 올바른 그리드 구조로 렌더링되는지 확인 |
| **커버리지 대상** | 차트 섹션 렌더링 |
| **관련 요구사항** | FR-003 |

```typescript
it('renders chart section with grid layout', () => {
  render(<Dashboard />);

  const chartSection = screen.getByTestId('chart-section');
  expect(chartSection).toBeInTheDocument();

  // 차트들이 존재하는지 확인 (010-design.md 11.8 기준)
  expect(screen.getByTestId('chart-production-trend')).toBeInTheDocument();
  expect(screen.getByTestId('chart-line-performance')).toBeInTheDocument();
});
```

#### UT-004: 최근 활동 영역 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/Dashboard.test.tsx` |
| **테스트 블록** | `describe('Dashboard') -> it('renders activity section')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<Dashboard />` |
| **검증 포인트** | 최근 활동 영역이 올바르게 렌더링되는지 확인 |
| **커버리지 대상** | 최근 활동 섹션 렌더링 |
| **관련 요구사항** | FR-004 |

```typescript
it('renders activity section', () => {
  render(<Dashboard />);

  // 010-design.md 11.8 기준: recent-recent-activity-section
  const activitySection = screen.getByTestId('recent-recent-activity-section');
  expect(activitySection).toBeInTheDocument();
});
```

#### UT-005: 반응형 그리드 lg (대화면)

> **참고**: 반응형 동작 검증은 CSS 기반이므로 JSDOM 환경에서 정확한 검증이 어렵습니다.
> 단위 테스트에서는 반응형 span props가 올바르게 전달되는지만 확인하고,
> 실제 레이아웃 동작 검증은 E2E 테스트(E2E-005~E2E-007)에서 수행합니다.

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/Dashboard.test.tsx` |
| **테스트 블록** | `describe('Dashboard') -> describe('responsive') -> it('passes correct responsive span props')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<Dashboard />` |
| **검증 포인트** | Col 컴포넌트에 올바른 xs, sm, md, lg, xl span props 전달 확인 |
| **커버리지 대상** | 반응형 props 전달 |
| **관련 요구사항** | FR-005, BR-001 |

```typescript
describe('responsive', () => {
  it('passes correct responsive span props to KPI columns', () => {
    render(<Dashboard />);

    const kpiSection = screen.getByTestId('kpi-section');
    // Col 컴포넌트가 올바른 반응형 span을 갖는지 확인
    // 실제 CSS 기반 레이아웃 동작은 E2E 테스트에서 검증
    expect(kpiSection).toBeInTheDocument();
  });
});
```

#### UT-006: 반응형 그리드 md (중간 화면)

> **참고**: 실제 레이아웃 동작 검증은 E2E-006에서 수행합니다.

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/Dashboard.test.tsx` |
| **테스트 블록** | `describe('Dashboard') -> describe('responsive') -> it('has md breakpoint configuration')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<Dashboard />` |
| **검증 포인트** | 컴포넌트가 md breakpoint 설정을 갖는지 확인 |
| **커버리지 대상** | 반응형 breakpoint md 설정 |
| **관련 요구사항** | FR-005, BR-001 |

#### UT-007: 반응형 그리드 xs (소형 화면)

> **참고**: 실제 레이아웃 동작 검증은 E2E-007에서 수행합니다.

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/Dashboard.test.tsx` |
| **테스트 블록** | `describe('Dashboard') -> describe('responsive') -> it('has xs breakpoint configuration')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<Dashboard />` |
| **검증 포인트** | 컴포넌트가 xs breakpoint 설정을 갖는지 확인 |
| **커버리지 대상** | 반응형 breakpoint xs 설정 |
| **관련 요구사항** | FR-005, BR-001 |

#### UT-008: DashboardWidget 최소 높이 유지

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/DashboardWidget.test.tsx` |
| **테스트 블록** | `describe('DashboardWidget') -> it('maintains minimum height')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<DashboardWidget title="Test" />` |
| **검증 포인트** | 위젯 Card의 최소 높이가 유지되는지 확인 |
| **커버리지 대상** | DashboardWidget 스타일 |
| **관련 요구사항** | BR-002 |

```typescript
it('maintains minimum height', () => {
  render(<DashboardWidget title="Test Widget" />);

  const widget = screen.getByTestId('dashboard-widget');
  const styles = window.getComputedStyle(widget);

  // 최소 높이가 설정되어 있는지 확인
  expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(120);
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 대시보드 페이지 로드 | 로그인 | 대시보드 접속 | 모든 위젯 영역 표시 | FR-001 |
| E2E-002 | KPI 카드 영역 표시 | 대시보드 로드 | KPI 영역 확인 | KPI 카드 슬롯 4개 표시 | FR-002 |
| E2E-003 | 차트 영역 표시 | 대시보드 로드 | 차트 영역 확인 | 차트 슬롯 표시 | FR-003 |
| E2E-004 | 최근 활동 영역 표시 | 대시보드 로드 | 활동 영역 확인 | 최근 활동 슬롯 표시 | FR-004 |
| E2E-005 | 반응형 Desktop (xl) | 대시보드 로드 | 1200px+ 뷰포트 | 4컬럼 레이아웃 | FR-005, BR-001 |
| E2E-006 | 반응형 Tablet (md) | 대시보드 로드 | 768px 뷰포트 | 2컬럼 레이아웃 | FR-005, BR-001 |
| E2E-007 | 반응형 Mobile (xs) | 대시보드 로드 | 375px 뷰포트 | 1컬럼 레이아웃 | FR-005, BR-001 |
| E2E-008 | 위젯 영역 구분 | 대시보드 로드 | 시각적 확인 | 영역 간 간격 명확 | FR-001 |
| E2E-009 | 위젯 최소 높이 | 대시보드 로드 | 위젯 크기 확인 | 최소 높이 유지 | BR-002 |

### 3.2 테스트 케이스 상세

#### E2E-001: 대시보드 페이지 로드

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard/dashboard.spec.ts` |
| **테스트명** | `test('대시보드 페이지가 정상적으로 로드된다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="dashboard-page"]` |
| - KPI 섹션 | `[data-testid="kpi-section"]` |
| - 차트 섹션 | `[data-testid="chart-section"]` |
| - 활동 섹션 | `[data-testid="recent-activity-section"]` |
| **실행 단계** | |
| 1 | `await page.goto('/dashboard')` |
| 2 | `await page.waitForSelector('[data-testid="dashboard-page"]')` |
| **검증 포인트** | 모든 섹션이 visible 상태인지 확인 |
| **스크린샷** | `e2e-001-dashboard-load.png` |
| **관련 요구사항** | FR-001 |

```typescript
// tests/e2e/dashboard/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard Layout', () => {
  test('대시보드 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-activity-section"]')).toBeVisible();

    await page.screenshot({ path: 'e2e-001-dashboard-load.png' });
  });
});
```

#### E2E-002: KPI 카드 영역 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard/dashboard.spec.ts` |
| **테스트명** | `test('KPI 카드 영역이 올바르게 표시된다')` |
| **사전조건** | 대시보드 페이지 로드 |
| **data-testid 셀렉터** | |
| - KPI 섹션 | `[data-testid="kpi-section"]` |
| - KPI 슬롯 | `[data-testid^="kpi-slot-"]` |
| **검증 포인트** | KPI 슬롯이 4개 이상 존재 |
| **스크린샷** | `e2e-002-kpi-section.png` |
| **관련 요구사항** | FR-002 |

```typescript
test('KPI 카드 영역이 올바르게 표시된다', async ({ page }) => {
  await page.goto('/dashboard');

  const kpiSection = page.locator('[data-testid="kpi-section"]');
  await expect(kpiSection).toBeVisible();

  const kpiSlots = page.locator('[data-testid^="kpi-slot-"]');
  await expect(kpiSlots).toHaveCount(4);

  await page.screenshot({ path: 'e2e-002-kpi-section.png' });
});
```

#### E2E-003: 차트 영역 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard/dashboard.spec.ts` |
| **테스트명** | `test('차트 영역이 올바르게 표시된다')` |
| **사전조건** | 대시보드 페이지 로드 |
| **data-testid 셀렉터** | |
| - 차트 섹션 | `[data-testid="chart-section"]` |
| - 차트 슬롯 | `[data-testid^="chart-slot-"]` |
| **검증 포인트** | 차트 슬롯이 존재하고 visible |
| **스크린샷** | `e2e-003-chart-section.png` |
| **관련 요구사항** | FR-003 |

```typescript
test('차트 영역이 올바르게 표시된다', async ({ page }) => {
  await page.goto('/dashboard');

  const chartSection = page.locator('[data-testid="chart-section"]');
  await expect(chartSection).toBeVisible();

  const chartSlots = page.locator('[data-testid^="chart-slot-"]');
  const count = await chartSlots.count();
  expect(count).toBeGreaterThanOrEqual(2);

  await page.screenshot({ path: 'e2e-003-chart-section.png' });
});
```

#### E2E-004: 최근 활동 영역 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard/dashboard.spec.ts` |
| **테스트명** | `test('최근 활동 영역이 올바르게 표시된다')` |
| **사전조건** | 대시보드 페이지 로드 |
| **data-testid 셀렉터** | |
| - 활동 섹션 | `[data-testid="recent-activity-section"]` |
| **검증 포인트** | 활동 섹션 visible |
| **스크린샷** | `e2e-004-recent-activity-section.png` |
| **관련 요구사항** | FR-004 |

```typescript
test('최근 활동 영역이 올바르게 표시된다', async ({ page }) => {
  await page.goto('/dashboard');

  const activitySection = page.locator('[data-testid="recent-activity-section"]');
  await expect(activitySection).toBeVisible();

  await page.screenshot({ path: 'e2e-004-recent-activity-section.png' });
});
```

#### E2E-005: 반응형 Desktop (xl)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard/dashboard.spec.ts` |
| **테스트명** | `test('Desktop에서 4컬럼 레이아웃이 적용된다')` |
| **사전조건** | 대시보드 페이지 로드 |
| **뷰포트** | `{ width: 1280, height: 720 }` |
| **검증 포인트** | KPI 영역이 4컬럼으로 배치 |
| **스크린샷** | `e2e-005-desktop-layout.png` |
| **관련 요구사항** | FR-005, BR-001 |

```typescript
test('Desktop에서 4컬럼 레이아웃이 적용된다', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/dashboard');

  const kpiSection = page.locator('[data-testid="kpi-section"]');
  await expect(kpiSection).toBeVisible();

  // KPI 카드들이 한 줄에 4개 배치되는지 확인 (010-design.md 11.8 기준)
  const firstCard = page.locator('[data-testid="kpi-card-operation-rate"]');
  const fourthCard = page.locator('[data-testid="kpi-card-achievement-rate"]');

  const firstBox = await firstCard.boundingBox();
  const fourthBox = await fourthCard.boundingBox();

  // 같은 행에 있으면 y 좌표가 같아야 함
  expect(firstBox?.y).toBe(fourthBox?.y);

  await page.screenshot({ path: 'e2e-005-desktop-layout.png', fullPage: true });
});
```

#### E2E-006: 반응형 Tablet (md)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard/dashboard.spec.ts` |
| **테스트명** | `test('Tablet에서 2컬럼 레이아웃이 적용된다')` |
| **사전조건** | 대시보드 페이지 로드 |
| **뷰포트** | `{ width: 768, height: 1024 }` |
| **검증 포인트** | KPI 영역이 2컬럼으로 배치 |
| **스크린샷** | `e2e-006-tablet-layout.png` |
| **관련 요구사항** | FR-005, BR-001 |

```typescript
test('Tablet에서 2컬럼 레이아웃이 적용된다', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/dashboard');

  // 010-design.md 11.8 기준 data-testid 사용
  const firstCard = page.locator('[data-testid="kpi-card-operation-rate"]');
  const secondCard = page.locator('[data-testid="kpi-card-defect-rate"]');
  const thirdCard = page.locator('[data-testid="kpi-card-production-volume"]');

  const firstBox = await firstCard.boundingBox();
  const secondBox = await secondCard.boundingBox();
  const thirdBox = await thirdCard.boundingBox();

  // 1, 2번이 같은 행, 3번은 다른 행
  expect(firstBox?.y).toBe(secondBox?.y);
  expect(thirdBox?.y).toBeGreaterThan(firstBox?.y ?? 0);

  await page.screenshot({ path: 'e2e-006-tablet-layout.png', fullPage: true });
});
```

#### E2E-007: 반응형 Mobile (xs)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard/dashboard.spec.ts` |
| **테스트명** | `test('Mobile에서 1컬럼 레이아웃이 적용된다')` |
| **사전조건** | 대시보드 페이지 로드 |
| **뷰포트** | `{ width: 375, height: 667 }` |
| **검증 포인트** | 모든 위젯이 수직으로 배치 |
| **스크린샷** | `e2e-007-mobile-layout.png` |
| **관련 요구사항** | FR-005, BR-001 |

```typescript
test('Mobile에서 1컬럼 레이아웃이 적용된다', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/dashboard');

  // 010-design.md 11.8 기준 data-testid 사용
  const firstCard = page.locator('[data-testid="kpi-card-operation-rate"]');
  const secondCard = page.locator('[data-testid="kpi-card-defect-rate"]');

  const firstBox = await firstCard.boundingBox();
  const secondBox = await secondCard.boundingBox();

  // 모든 카드가 다른 행에 있어야 함
  expect(secondBox?.y).toBeGreaterThan(firstBox?.y ?? 0);

  await page.screenshot({ path: 'e2e-007-mobile-layout.png', fullPage: true });
});
```

#### E2E-008: 위젯 영역 구분

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard/dashboard.spec.ts` |
| **테스트명** | `test('위젯 영역 간 간격이 명확하다')` |
| **사전조건** | 대시보드 페이지 로드 |
| **검증 포인트** | 섹션 간 margin/gap 존재 |
| **스크린샷** | `e2e-008-section-spacing.png` |
| **관련 요구사항** | FR-001 |

```typescript
test('위젯 영역 간 간격이 명확하다', async ({ page }) => {
  await page.goto('/dashboard');

  const kpiSection = page.locator('[data-testid="kpi-section"]');
  const chartSection = page.locator('[data-testid="chart-section"]');

  const kpiBox = await kpiSection.boundingBox();
  const chartBox = await chartSection.boundingBox();

  // 섹션 간 간격이 최소 16px 이상
  const gap = (chartBox?.y ?? 0) - ((kpiBox?.y ?? 0) + (kpiBox?.height ?? 0));
  expect(gap).toBeGreaterThanOrEqual(16);

  await page.screenshot({ path: 'e2e-008-section-spacing.png', fullPage: true });
});
```

#### E2E-009: 위젯 최소 높이 (BR-002)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard/dashboard.spec.ts` |
| **테스트명** | `test('위젯이 최소 높이를 유지한다')` |
| **사전조건** | 대시보드 페이지 로드 |
| **검증 포인트** | 위젯 영역이 최소 높이 유지 (KPI: 120px, 차트: 300px) |
| **스크린샷** | `e2e-009-widget-min-height.png` |
| **관련 요구사항** | BR-002 |

```typescript
test('위젯이 최소 높이를 유지한다', async ({ page }) => {
  await page.goto('/dashboard');

  // KPI 카드 최소 높이 확인 (120px)
  const kpiCard = page.locator('[data-testid="kpi-card-operation-rate"]');
  const kpiBox = await kpiCard.boundingBox();
  expect(kpiBox?.height).toBeGreaterThanOrEqual(120);

  // 차트 위젯 최소 높이 확인 (300px)
  const chartWidget = page.locator('[data-testid="chart-production-trend"]');
  const chartBox = await chartWidget.boundingBox();
  expect(chartBox?.height).toBeGreaterThanOrEqual(300);

  await page.screenshot({ path: 'e2e-009-widget-min-height.png', fullPage: true });
});
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 대시보드 로드 | 로그인 | 대시보드 접속 | 모든 위젯 영역 표시 | High | FR-001 |
| TC-002 | KPI 영역 배치 | 대시보드 표시 | KPI 영역 확인 | 4개 카드 슬롯 배치 | High | FR-002 |
| TC-003 | 차트 영역 배치 | 대시보드 표시 | 차트 영역 확인 | 차트 슬롯 배치 | High | FR-003 |
| TC-004 | 최근 활동 영역 배치 | 대시보드 표시 | 활동 영역 확인 | 활동 영역 배치 | High | FR-004 |
| TC-005 | 반응형 Desktop | 대시보드 표시 | 1280px 뷰포트 | 4컬럼 레이아웃 | Medium | FR-005, BR-001 |
| TC-006 | 반응형 Tablet | 대시보드 표시 | 768px 뷰포트 | 2컬럼 레이아웃 | Medium | FR-005, BR-001 |
| TC-007 | 반응형 Mobile | 대시보드 표시 | 375px 뷰포트 | 1컬럼 레이아웃 | Medium | FR-005, BR-001 |
| TC-008 | 위젯 최소 높이 | 대시보드 표시 | 위젯 크기 확인 | 최소 높이 유지 | Medium | BR-002 |
| TC-009 | Tab 키 포커스 순서 | 대시보드 표시 | Tab 키 반복 | 논리적 순서로 이동 | Low | - |
| TC-010 | 스크린 리더 | 대시보드 표시 | 스크린 리더 사용 | 영역 구분 인식 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 대시보드 로드

**테스트 목적**: 대시보드 페이지가 정상적으로 로드되고 모든 위젯 영역이 표시되는지 확인

**테스트 단계**:
1. 로그인 후 대시보드 페이지 접속
2. 페이지 로드 완료 대기
3. 모든 위젯 영역 표시 확인

**예상 결과**:
- KPI 카드 영역 표시
- 차트 영역 표시
- 최근 활동 영역 표시
- 각 영역 간 시각적 구분 명확

**검증 기준**:
- [ ] KPI 섹션이 상단에 표시됨
- [ ] 차트 섹션이 중단에 표시됨
- [ ] 활동 섹션이 하단에 표시됨
- [ ] 로딩 시 스피너/스켈레톤 표시 (선택)

#### TC-005: 반응형 Desktop

**테스트 목적**: Desktop 화면에서 4컬럼 레이아웃이 올바르게 적용되는지 확인

**테스트 단계**:
1. 브라우저 너비를 1280px 이상으로 설정
2. 대시보드 페이지 접속
3. KPI 카드 배치 확인
4. 차트 영역 배치 확인

**예상 결과**:
- KPI 카드 4개가 한 줄에 배치
- 차트가 2개 이상 한 줄에 배치
- 여백과 간격이 적절함

**검증 기준**:
- [ ] KPI 카드 4개가 동일 행에 배치됨
- [ ] 각 카드 너비가 동일함
- [ ] 카드 간 간격이 균등함

#### TC-007: 반응형 Mobile

**테스트 목적**: Mobile 화면에서 1컬럼 레이아웃이 올바르게 적용되는지 확인

**테스트 단계**:
1. 브라우저 너비를 375px로 설정 또는 모바일 시뮬레이션
2. 대시보드 페이지 접속
3. 모든 위젯 수직 배치 확인

**예상 결과**:
- 모든 KPI 카드가 수직으로 배치
- 차트가 전체 너비 사용
- 스크롤로 모든 콘텐츠 접근 가능

**검증 기준**:
- [ ] 모든 위젯이 1컬럼으로 배치됨
- [ ] 가로 스크롤 없음
- [ ] 터치 스크롤이 부드러움

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-DASHBOARD-EMPTY | 빈 대시보드 상태 | `{ kpi: [], charts: [], activities: [] }` |
| MOCK-VIEWPORT-DESKTOP | Desktop 뷰포트 | `{ width: 1280, height: 720, breakpoint: 'xl' }` |
| MOCK-VIEWPORT-TABLET | Tablet 뷰포트 | `{ width: 768, height: 1024, breakpoint: 'md' }` |
| MOCK-VIEWPORT-MOBILE | Mobile 뷰포트 | `{ width: 375, height: 667, breakpoint: 'xs' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-DASHBOARD | 대시보드 레이아웃 테스트 | 자동 시드 | 테스트 사용자 1명 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 대시보드 접근 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 셀렉터 계층 구조

| 계층 | 접두사 패턴 | 예시 |
|------|-----------|------|
| 페이지 요소 | `dashboard-*` | `dashboard-page` |
| 섹션 요소 | `*-section` | `kpi-section`, `recent-activity-section` |
| 카드 요소 | `kpi-card-*` | `kpi-card-operation-rate` |
| 차트 요소 | `chart-*` | `chart-production-trend` |
| 위젯 요소 | `widget-*` | `widget-card` |

### 6.2 페이지별 셀렉터

#### 대시보드 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `dashboard-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `dashboard-title` | 페이지 제목 | 제목 표시 확인 |
| `kpi-section` | KPI 카드 섹션 | KPI 영역 표시 확인 |
| `kpi-card-operation-rate` | 가동률 카드 | 가동률 표시 확인 |
| `kpi-card-defect-rate` | 불량률 카드 | 불량률 표시 확인 |
| `kpi-card-production-volume` | 생산량 카드 | 생산량 표시 확인 |
| `kpi-card-achievement-rate` | 달성률 카드 | 달성률 표시 확인 |
| `chart-section` | 차트 섹션 | 차트 영역 표시 확인 |
| `chart-production-trend` | 시간별 생산량 차트 | 라인 차트 확인 |
| `chart-line-performance` | 라인별 실적 차트 | 바 차트 확인 |
| `recent-activity-section` | 최근 활동 섹션 | 활동 영역 표시 확인 |
| `activity-item-{id}` | 활동 항목 | 개별 활동 항목 확인 |

#### 위젯 공통

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `dashboard-widget` | 위젯 Card 컨테이너 | 위젯 표시 확인 |
| `widget-title` | 위젯 제목 | 제목 표시 확인 |
| `widget-content` | 위젯 내용 영역 | 콘텐츠 표시 확인 |
| `widget-loading` | 위젯 로딩 상태 | 로딩 스피너 확인 |
| `widget-empty` | 위젯 빈 상태 | Empty State 확인 |

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
| 반응형 breakpoint | 100% 커버 (xs, sm, md, lg, xl) |

### 7.3 요구사항별 테스트 매핑

| 요구사항 ID | 요구사항명 | 단위 테스트 | E2E 테스트 | 매뉴얼 테스트 |
|-------------|-----------|------------|-----------|--------------|
| FR-001 | 위젯 기반 레이아웃 구현 | UT-001 | E2E-001, E2E-008 | TC-001 |
| FR-002 | KPI 카드 영역 배치 | UT-002 | E2E-002 | TC-002 |
| FR-003 | 차트 영역 배치 | UT-003 | E2E-003 | TC-003 |
| FR-004 | 최근 활동 영역 배치 | UT-004 | E2E-004 | TC-004 |
| FR-005 | 반응형 그리드 레이아웃 | UT-005, UT-006, UT-007 | E2E-005, E2E-006, E2E-007 | TC-005, TC-006, TC-007 |
| BR-001 | 반응형 breakpoint별 컬럼 수 조정 | UT-005, UT-006, UT-007 | E2E-005, E2E-006, E2E-007 | TC-005, TC-006, TC-007 |
| BR-002 | 위젯 영역 최소 높이 유지 | UT-008 | - | TC-008 |

---

## 관련 문서

- 설계: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md`
- WBS: `.orchay/projects/mes-portal/wbs.yaml`

---

<!--
TSK-07-01 Test Specification
Version: 1.0
Created: 2026-01-21
-->
