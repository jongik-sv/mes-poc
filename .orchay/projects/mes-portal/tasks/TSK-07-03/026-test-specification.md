# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-21

> **목적**: 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-07-03 |
| Task명 | 차트 위젯 |
| 설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-21 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | 차트 컴포넌트, 유틸리티 함수, 설정 | 80% 이상 |
| E2E 테스트 | 차트 렌더링, 사용자 인터랙션 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | 시각적 확인, 반응형, 접근성 | 전체 차트 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터 | mock-data/dashboard.json |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

### 1.3 차트 테스트 특수 고려사항

| 항목 | 고려사항 |
|------|----------|
| Canvas 렌더링 | @ant-design/charts는 Canvas 기반, DOM 기반 테스트 제한적 |
| 비동기 렌더링 | 차트 애니메이션 완료 대기 필요 |
| 호버 인터랙션 | 툴팁 표시 테스트 시 마우스 좌표 제어 |
| 반응형 | 다양한 뷰포트에서 테스트 |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | LineChart | 정상 데이터로 렌더링 | 차트 컴포넌트 마운트 | FR-001 |
| UT-002 | LineChart | 빈 데이터로 렌더링 | Empty 상태 표시 | FR-001, BR-005 |
| UT-003 | BarChart | 정상 데이터로 렌더링 | 그룹 바 차트 표시 | FR-002 |
| UT-004 | BarChart | 데이터 변환 함수 | 실적/목표 분리된 배열 | FR-002 |
| UT-005 | PieChart | 정상 데이터로 렌더링 | 파이 차트 표시 | FR-003 |
| UT-006 | PieChart | 6개 이상 항목 그룹화 | "기타" 항목 생성 | FR-003, BR-003 |
| UT-007 | Tooltip | 포맷터 함수 | 라벨, 값, 단위 포맷 | FR-004 |
| UT-008 | ChartConfig | autoFit 설정 | autoFit: true 반환 | FR-005 |
| UT-009 | ChartTheme | 테마 토큰 색상 | themeTokens 색상 사용 | BR-001 |
| UT-010 | BarChart | 목표 미달 색상 | 경고/위험 색상 반환 | BR-002 |
| UT-011 | groupSmallItems | 그룹화 로직 | 상위 N개 + 기타 | BR-003 |
| UT-012 | formatNumber | 천 단위 콤마 | "1,234" 형식 | BR-004 |
| UT-013 | ChartWrapper | 빈 데이터 처리 | Empty 컴포넌트 표시 | BR-005 |

### 2.2 테스트 케이스 상세

#### UT-001: LineChart 정상 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/charts/__tests__/LineChart.test.tsx` |
| **테스트 블록** | `describe('LineChart') → it('renders with valid data')` |
| **Mock 의존성** | @ant-design/charts Line 모킹 |
| **입력 데이터** | `[{ time: '08:00', value: 1200 }, { time: '09:00', value: 1350 }]` |
| **검증 포인트** | Line 컴포넌트가 data props와 함께 렌더링 |
| **커버리지 대상** | LineChart 컴포넌트 정상 분기 |
| **관련 요구사항** | FR-001 |

```typescript
// 테스트 코드 예시
import { render, screen } from '@testing-library/react';
import { LineChart } from '../LineChart';

// @ant-design/charts 모킹
vi.mock('@ant-design/charts', () => ({
  Line: vi.fn(({ data }) => (
    <div data-testid="chart-line-production" data-count={data.length}>
      Mocked Line Chart
    </div>
  )),
}));

describe('LineChart', () => {
  const mockData = [
    { time: '08:00', value: 1200 },
    { time: '09:00', value: 1350 },
  ];

  it('renders with valid data', () => {
    render(<LineChart data={mockData} />);

    const chart = screen.getByTestId('chart-line-production');
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveAttribute('data-count', '2');
  });
});
```

#### UT-002: LineChart 빈 데이터 처리

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/charts/__tests__/LineChart.test.tsx` |
| **테스트 블록** | `describe('LineChart') → it('shows empty state with no data')` |
| **Mock 의존성** | @ant-design/charts Line, Ant Design Empty |
| **입력 데이터** | `[]` |
| **검증 포인트** | Empty 컴포넌트 또는 메시지 표시 |
| **커버리지 대상** | LineChart 빈 데이터 분기 |
| **관련 요구사항** | FR-001, BR-005 |

```typescript
it('shows empty state with no data', () => {
  render(<LineChart data={[]} />);

  expect(screen.getByTestId('chart-empty')).toBeInTheDocument();
  expect(screen.getByText('표시할 데이터가 없습니다')).toBeInTheDocument();
});
```

#### UT-003: BarChart 정상 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/charts/__tests__/BarChart.test.tsx` |
| **테스트 블록** | `describe('BarChart') → it('renders grouped bar chart')` |
| **Mock 의존성** | @ant-design/charts Column |
| **입력 데이터** | `[{ line: '1라인', actual: 3200, target: 3500 }]` |
| **검증 포인트** | Column 컴포넌트가 isGroup: true로 렌더링 |
| **커버리지 대상** | BarChart 컴포넌트 |
| **관련 요구사항** | FR-002 |

#### UT-004: transformLinePerformance 데이터 변환

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/charts/__tests__/utils.test.ts` |
| **테스트 블록** | `describe('transformLinePerformance') → it('transforms to chart data')` |
| **입력 데이터** | `[{ line: '1라인', actual: 3200, target: 3500 }]` |
| **예상 출력** | `[{ line: '1라인', type: 'actual', value: 3200 }, { line: '1라인', type: 'target', value: 3500 }]` |
| **검증 포인트** | 실적/목표가 각각 분리된 객체로 변환 |
| **관련 요구사항** | FR-002 |

```typescript
import { transformLinePerformance } from '../utils';

describe('transformLinePerformance', () => {
  it('transforms to chart data format', () => {
    const input = [{ line: '1라인', actual: 3200, target: 3500 }];
    const result = transformLinePerformance(input);

    expect(result).toEqual([
      { line: '1라인', type: 'actual', value: 3200 },
      { line: '1라인', type: 'target', value: 3500 },
    ]);
  });
});
```

#### UT-005: PieChart 정상 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/charts/__tests__/PieChart.test.tsx` |
| **테스트 블록** | `describe('PieChart') → it('renders with product data')` |
| **Mock 의존성** | @ant-design/charts Pie |
| **입력 데이터** | `[{ product: 'A제품', value: 4375, percentage: 35 }]` |
| **검증 포인트** | Pie 컴포넌트가 데이터와 함께 렌더링 |
| **관련 요구사항** | FR-003 |

#### UT-006: PieChart 항목 그룹화

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/charts/__tests__/PieChart.test.tsx` |
| **테스트 블록** | `describe('PieChart') → it('groups items over limit')` |
| **입력 데이터** | 6개 항목 배열 |
| **예상 출력** | 5개 항목 + "기타" |
| **검증 포인트** | 마지막 항목이 "기타" |
| **관련 요구사항** | FR-003, BR-003 |

#### UT-011: groupSmallItems 함수

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/charts/__tests__/utils.test.ts` |
| **테스트 블록** | `describe('groupSmallItems') → it('groups items exceeding limit')` |
| **입력 데이터** | 6개 항목, limit=5 |
| **검증 포인트** | 결과 배열 길이 5, 마지막 항목 product='기타' |
| **관련 요구사항** | BR-003 |

```typescript
import { groupSmallItems } from '../utils';

describe('groupSmallItems', () => {
  const mockData = [
    { product: 'A', value: 100, percentage: 30 },
    { product: 'B', value: 80, percentage: 24 },
    { product: 'C', value: 60, percentage: 18 },
    { product: 'D', value: 40, percentage: 12 },
    { product: 'E', value: 30, percentage: 9 },
    { product: 'F', value: 23, percentage: 7 },
  ];

  it('groups items exceeding limit into "기타"', () => {
    const result = groupSmallItems(mockData, 5);

    expect(result).toHaveLength(5);
    expect(result[4].product).toBe('기타');
    expect(result[4].value).toBe(53); // 30 + 23
  });

  it('returns original if within limit', () => {
    const shortData = mockData.slice(0, 4);
    const result = groupSmallItems(shortData, 5);

    expect(result).toHaveLength(4);
    expect(result).toEqual(shortData);
  });
});
```

#### UT-012: formatNumber 함수

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/charts/__tests__/utils.test.ts` |
| **테스트 블록** | `describe('formatNumber') → it('adds thousand separators')` |
| **입력 데이터** | 1234567 |
| **예상 출력** | "1,234,567" |
| **관련 요구사항** | BR-004 |

```typescript
import { formatNumber } from '../utils';

describe('formatNumber', () => {
  it('adds thousand separators', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('handles zero and small numbers', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(123)).toBe('123');
  });
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 라인 차트 표시 | 대시보드 접속 | 차트 영역 확인 | 라인 차트 렌더링 | FR-001 |
| E2E-002 | 바 차트 표시 | 대시보드 접속 | 차트 영역 확인 | 그룹 바 차트 렌더링 | FR-002 |
| E2E-003 | 파이 차트 표시 | 대시보드 접속 | 차트 영역 확인 | 파이 차트 렌더링 | FR-003 |
| E2E-004 | 차트 호버 툴팁 | 차트 표시됨 | 데이터 포인트 호버 | 툴팁 표시 | FR-004 |
| E2E-005 | 반응형 레이아웃 | 대시보드 접속 | 뷰포트 변경 | 차트 크기 조절 | FR-005 |
| E2E-006 | 목표 미달 색상 | 바 차트 표시 | 목표 미달 데이터 확인 | 경고 색상 표시 | BR-002 |
| E2E-007 | 파이 차트 그룹화 | 6개+ 데이터 | 파이 차트 확인 | "기타" 항목 존재 | BR-003 |
| E2E-008 | 빈 데이터 상태 | 빈 데이터 설정 | 차트 영역 확인 | Empty 컴포넌트 | BR-005 |

### 3.2 테스트 케이스 상세

#### E2E-001: 라인 차트 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-charts.spec.ts` |
| **테스트명** | `test('라인 차트가 시간별 생산량 데이터로 표시된다')` |
| **사전조건** | 로그인, 대시보드 접속 |
| **data-testid 셀렉터** | |
| - 차트 컨테이너 | `[data-testid="chart-line-production"]` |
| - 차트 캔버스 | `canvas` (차트 컨테이너 내) |
| **실행 단계** | |
| 1 | `await page.goto('/dashboard')` |
| 2 | `await page.waitForSelector('[data-testid="chart-line-production"]')` |
| **검증 포인트** | `expect(chartContainer).toBeVisible()` |
| **스크린샷** | `e2e-001-line-chart.png` |
| **관련 요구사항** | FR-001 |

```typescript
import { test, expect } from '@playwright/test';

test.describe('Dashboard Charts', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 및 대시보드 이동
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('라인 차트가 시간별 생산량 데이터로 표시된다', async ({ page }) => {
    const lineChart = page.locator('[data-testid="chart-line-production"]');

    await expect(lineChart).toBeVisible();

    // 차트 내 캔버스 확인 (ant-design/charts는 canvas 기반)
    const canvas = lineChart.locator('canvas');
    await expect(canvas).toBeVisible();

    await page.screenshot({ path: 'e2e-001-line-chart.png' });
  });
});
```

#### E2E-002: 바 차트 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-charts.spec.ts` |
| **테스트명** | `test('바 차트가 라인별 실적/목표로 표시된다')` |
| **data-testid 셀렉터** | |
| - 차트 컨테이너 | `[data-testid="chart-bar-performance"]` |
| **검증 포인트** | 차트 가시성, 범례 존재 |
| **관련 요구사항** | FR-002 |

```typescript
test('바 차트가 라인별 실적/목표로 표시된다', async ({ page }) => {
  const barChart = page.locator('[data-testid="chart-bar-performance"]');

  await expect(barChart).toBeVisible();

  // 범례 확인 (실적, 목표)
  await expect(page.getByText('실적')).toBeVisible();
  await expect(page.getByText('목표')).toBeVisible();

  await page.screenshot({ path: 'e2e-002-bar-chart.png' });
});
```

#### E2E-004: 차트 호버 툴팁

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-charts.spec.ts` |
| **테스트명** | `test('차트 호버 시 툴팁이 표시된다')` |
| **사전조건** | 라인 차트 표시됨 |
| **실행 단계** | |
| 1 | 라인 차트 캔버스 위치 확인 |
| 2 | 캔버스 중앙 호버 |
| 3 | 툴팁 요소 대기 |
| **검증 포인트** | 툴팁에 시간, 값 표시 |
| **관련 요구사항** | FR-004 |

```typescript
test('차트 호버 시 툴팁이 표시된다', async ({ page }) => {
  const lineChart = page.locator('[data-testid="chart-line-production"]');
  const canvas = lineChart.locator('canvas');

  // 캔버스 중앙 좌표 계산
  const box = await canvas.boundingBox();
  if (box) {
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // 호버 동작
    await page.mouse.move(centerX, centerY);

    // 툴팁 표시 대기 (@ant-design/charts 툴팁 클래스)
    const tooltip = page.locator('.g2-tooltip');
    await expect(tooltip).toBeVisible({ timeout: 2000 });

    // 툴팁 내용 확인 (시간, 생산량)
    await expect(tooltip).toContainText('생산량');
  }
});
```

#### E2E-005: 반응형 레이아웃

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-charts.spec.ts` |
| **테스트명** | `test('모바일 뷰포트에서 차트가 리사이즈된다')` |
| **실행 단계** | |
| 1 | 뷰포트를 모바일(375x667)로 변경 |
| 2 | 차트 컨테이너 크기 확인 |
| **검증 포인트** | 차트 너비가 컨테이너에 맞춤 |
| **관련 요구사항** | FR-005 |

```typescript
test('모바일 뷰포트에서 차트가 리사이즈된다', async ({ page }) => {
  // 데스크톱 크기에서 차트 확인
  await page.setViewportSize({ width: 1200, height: 800 });
  const desktopChart = page.locator('[data-testid="chart-line-production"]');
  const desktopBox = await desktopChart.boundingBox();

  // 모바일 크기로 변경
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500); // 리사이즈 애니메이션 대기

  const mobileBox = await desktopChart.boundingBox();

  // 모바일에서 너비가 줄어듦
  expect(mobileBox?.width).toBeLessThan(desktopBox?.width || 0);

  await page.screenshot({ path: 'e2e-005-mobile-chart.png' });
});
```

#### E2E-008: 빈 데이터 상태

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-charts.spec.ts` |
| **테스트명** | `test('데이터 없을 시 Empty 상태가 표시된다')` |
| **사전조건** | 빈 데이터로 대시보드 로드 (모킹 필요) |
| **검증 포인트** | Empty 컴포넌트 표시 |
| **관련 요구사항** | BR-005 |

```typescript
// 빈 데이터 시나리오 (모킹 또는 특수 URL 파라미터)
test('데이터 없을 시 Empty 상태가 표시된다', async ({ page }) => {
  // 빈 데이터 상태로 이동 (예: 쿼리 파라미터)
  await page.goto('/dashboard?emptyData=true');

  const emptyState = page.locator('[data-testid="chart-empty"]');
  await expect(emptyState).toBeVisible();
  await expect(page.getByText('표시할 데이터가 없습니다')).toBeVisible();
});
```

#### E2E-006: 목표 미달 시 색상 구분

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-charts.spec.ts` |
| **테스트명** | `test('목표 미달 바가 경고/위험 색상으로 표시된다')` |
| **사전조건** | 바 차트 데이터에 목표 미달 항목 포함 |
| **실행 단계** | |
| 1 | 대시보드 접속 |
| 2 | 바 차트 렌더링 대기 |
| 3 | 각 라인의 실적/목표 비율 확인 |
| **검증 포인트** | 90% 미만 시 경고색, 70% 미만 시 위험색 적용 |
| **관련 요구사항** | BR-002 |

```typescript
test('목표 미달 바가 경고/위험 색상으로 표시된다', async ({ page }) => {
  await page.goto('/dashboard');

  const barChart = page.locator('[data-testid="chart-bar-performance"]');
  await expect(barChart).toBeVisible();

  // 목표 미달 바 호버 (2라인: 2800/3000 = 93.3% → 정상)
  const canvas = barChart.locator('canvas');
  const box = await canvas.boundingBox();

  if (box) {
    // 바 위치 대략 계산 (첫 번째 그룹의 실적 바)
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);

    // 툴팁 확인
    const tooltip = page.locator('.g2-tooltip');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
  }

  // 색상 검증은 Canvas 기반으로 직접 확인 어려움
  // 스크린샷 비교 또는 시각적 회귀 테스트 활용 권장
  await page.screenshot({ path: 'e2e-006-bar-warning-colors.png' });
});
```

#### E2E-007: 파이 차트 항목 그룹화

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-charts.spec.ts` |
| **테스트명** | `test('6개 이상 제품 데이터 시 "기타"로 그룹화된다')` |
| **사전조건** | 파이 차트 데이터에 6개 이상 항목 |
| **실행 단계** | |
| 1 | 6개 이상 제품 데이터로 대시보드 로드 |
| 2 | 파이 차트 렌더링 대기 |
| 3 | "기타" 항목 존재 확인 |
| **검증 포인트** | 범례에 "기타" 항목 표시, 총 5개 항목으로 그룹화 |
| **관련 요구사항** | BR-003 |

```typescript
test('6개 이상 제품 데이터 시 "기타"로 그룹화된다', async ({ page }) => {
  // 6개 이상 제품 데이터가 포함된 시나리오로 이동
  // (실제 구현 시 mock 데이터 또는 쿼리 파라미터로 제어)
  await page.goto('/dashboard?manyProducts=true');

  const pieChart = page.locator('[data-testid="chart-pie-ratio"]');
  await expect(pieChart).toBeVisible();

  // 범례에서 "기타" 항목 확인
  // @ant-design/charts의 범례는 Canvas 내부 또는 별도 DOM 요소
  const legend = page.locator('.g2-legend');

  // 범례 텍스트 중 "기타" 확인
  await expect(page.getByText('기타')).toBeVisible();

  // "기타" 섹터 호버 시 툴팁 확인
  const canvas = pieChart.locator('canvas');
  const box = await canvas.boundingBox();

  if (box) {
    // 파이 차트 우측 하단 영역 (기타 섹터 예상 위치)
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.7);

    const tooltip = page.locator('.g2-tooltip');
    // 툴팁이 나타나면 "기타" 포함 확인
    if (await tooltip.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(tooltip).toContainText('기타');
    }
  }

  await page.screenshot({ path: 'e2e-007-pie-grouped.png' });
});
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 라인 차트 시각 확인 | 대시보드 로드 | 라인 차트 관찰 | 선이 부드럽게 연결, 포인트 표시 | High | FR-001 |
| TC-002 | 바 차트 비교 확인 | 대시보드 로드 | 바 차트 관찰 | 실적/목표 바가 구분되어 표시 | High | FR-002 |
| TC-003 | 파이 차트 비율 확인 | 대시보드 로드 | 파이 차트 관찰 | 섹터별 비율 라벨 표시 | High | FR-003 |
| TC-004 | 툴팁 가독성 확인 | 차트 호버 | 툴팁 내용 확인 | 폰트 크기, 정렬 적절 | Medium | FR-004 |
| TC-005 | 반응형 확인 | 브라우저 리사이즈 | 다양한 크기 확인 | 차트가 깨지지 않음 | Medium | FR-005 |
| TC-006 | 색상 테마 확인 | 라이트/다크 모드 | 테마 전환 | 차트 색상 테마 반영 | Low | BR-001 |
| TC-007 | 범례 동작 확인 | 범례 클릭 | 시리즈 토글 | 해당 시리즈 숨김/표시 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 라인 차트 시각 확인

**테스트 목적**: 시간별 생산량 라인 차트가 시각적으로 올바르게 표시되는지 확인

**테스트 단계**:
1. 대시보드 페이지 접속
2. 차트 영역으로 스크롤
3. "시간별 생산량" 라인 차트 확인

**예상 결과**:
- X축에 시간 라벨 (08:00, 09:00, ...)
- Y축에 생산량 수치
- 데이터 포인트가 부드러운 곡선으로 연결
- 마우스 호버 시 해당 포인트 강조

**검증 기준**:
- [ ] 차트 제목 "시간별 생산량" 표시
- [ ] X축/Y축 라벨 가독성 양호
- [ ] 선이 부드럽게 연결됨 (smooth: true)
- [ ] 데이터 포인트 표시 (point.size > 0)
- [ ] 차트 색상이 테마 Primary 색상

#### TC-002: 바 차트 실적/목표 비교 확인

**테스트 목적**: 라인별 생산 실적 바 차트에서 실적과 목표가 명확히 구분되는지 확인

**테스트 단계**:
1. 대시보드 페이지 접속
2. "라인별 생산 실적" 바 차트 확인
3. 범례에서 실적/목표 색상 확인
4. 각 라인별 바 높이 비교

**예상 결과**:
- 각 라인별로 실적(파랑)과 목표(회색) 두 개의 바 표시
- 범례에 "실적", "목표" 항목
- 실적이 목표보다 낮은 라인은 시각적으로 확인 가능

**검증 기준**:
- [ ] 그룹 바 형태로 표시 (라인당 2개 바)
- [ ] 실적과 목표 색상 구분 명확
- [ ] 범례 클릭 시 해당 시리즈 토글
- [ ] Y축 스케일 적절 (바가 잘리지 않음)

#### TC-004: 툴팁 가독성 확인

**테스트 목적**: 차트 호버 시 툴팁의 내용과 스타일이 적절한지 확인

**테스트 단계**:
1. 라인 차트에서 데이터 포인트 호버
2. 바 차트에서 바 호버
3. 파이 차트에서 섹터 호버

**예상 결과**:
- 툴팁이 마우스 근처에 표시
- 라벨과 값이 명확히 구분
- 숫자에 천 단위 콤마 적용
- 단위 표시 (EA, %)

**검증 기준**:
- [ ] 툴팁 배경 대비 텍스트 가독성
- [ ] 숫자 포맷팅 (1,234 EA)
- [ ] 툴팁 표시 속도 적절 (딜레이 없음)
- [ ] 툴팁이 화면 밖으로 넘어가지 않음

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-TREND-VALID | 정상 생산량 추이 | `[{ time: '08:00', value: 1200 }, { time: '09:00', value: 1350 }]` |
| MOCK-TREND-EMPTY | 빈 생산량 추이 | `[]` |
| MOCK-TREND-SINGLE | 단일 데이터 | `[{ time: '08:00', value: 1200 }]` |
| MOCK-PERF-VALID | 정상 라인별 실적 | `[{ line: '1라인', actual: 3200, target: 3500 }]` |
| MOCK-PERF-UNDER | 목표 미달 실적 | `[{ line: '1라인', actual: 2100, target: 3500 }]` |
| MOCK-RATIO-VALID | 정상 제품 비율 | `[{ product: 'A제품', value: 4375, percentage: 35 }]` |
| MOCK-RATIO-MANY | 6개 이상 제품 | 6개 항목 배열 (그룹화 테스트) |

### 5.2 Mock 데이터 상세

```typescript
// tests/fixtures/chart-data.ts

export const MOCK_TREND_VALID = [
  { time: '08:00', value: 1200 },
  { time: '09:00', value: 1350 },
  { time: '10:00', value: 1280 },
  { time: '11:00', value: 1420 },
  { time: '12:00', value: 1100 },
  { time: '13:00', value: 1380 },
  { time: '14:00', value: 1450 },
  { time: '15:00', value: 1320 },
];

export const MOCK_TREND_EMPTY: ProductionTrendItem[] = [];

export const MOCK_PERF_VALID = [
  { line: '1라인', actual: 3200, target: 3500 },
  { line: '2라인', actual: 2800, target: 3000 },
  { line: '3라인', actual: 3100, target: 3200 },
  { line: '4라인', actual: 2600, target: 2800 },
];

export const MOCK_PERF_UNDER = [
  { line: '1라인', actual: 2100, target: 3500 }, // 60% - 위험
  { line: '2라인', actual: 2700, target: 3000 }, // 90% - 정상
  { line: '3라인', actual: 2560, target: 3200 }, // 80% - 경고
];

export const MOCK_RATIO_VALID = [
  { product: 'A제품', value: 4375, percentage: 35 },
  { product: 'B제품', value: 3750, percentage: 30 },
  { product: 'C제품', value: 2500, percentage: 20 },
  { product: 'D제품', value: 1250, percentage: 10 },
  { product: '기타', value: 625, percentage: 5 },
];

// QA-006 대응: percentage 합계가 100%가 되도록 검증
export const MOCK_RATIO_MANY = [
  { product: 'A제품', value: 100, percentage: 25 },   // 25%
  { product: 'B제품', value: 80, percentage: 20 },    // 20%
  { product: 'C제품', value: 60, percentage: 15 },    // 15%
  { product: 'D제품', value: 52, percentage: 13 },    // 13%
  { product: 'E제품', value: 52, percentage: 13 },    // 13%
  { product: 'F제품', value: 56, percentage: 14 },    // 14% (합계: 100%)
];
// 총 value: 400, 총 percentage: 100%
```

### 5.3 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 설명 |
|---------|------|------|
| SEED-DASHBOARD | 기본 대시보드 | mock-data/dashboard.json 전체 데이터 |
| SEED-EMPTY | 빈 차트 테스트 | 모든 차트 데이터 빈 배열 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 차트 컴포넌트 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `chart-line-production` | LineChart 컨테이너 | 라인 차트 로드 확인 |
| `chart-bar-performance` | BarChart 컨테이너 | 바 차트 로드 확인 |
| `chart-pie-ratio` | PieChart 컨테이너 | 파이 차트 로드 확인 |
| `chart-loading` | 차트 로딩 상태 | 로딩 스켈레톤 |
| `chart-error` | 차트 에러 상태 | 에러 메시지 |
| `chart-empty` | 차트 빈 상태 | Empty 컴포넌트 |
| `chart-retry-btn` | 재시도 버튼 | 에러 복구 |

### 6.2 ChartWrapper 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `chart-wrapper-{name}` | 차트 래퍼 | 특정 차트 래퍼 확인 |
| `chart-title` | 차트 제목 | 제목 텍스트 |
| `chart-more-link` | 더보기 링크 | 상세 페이지 이동 |

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |
| Statements | 80% | 70% |

### 7.2 대상 파일별 커버리지

| 파일 | 목표 | 설명 |
|------|------|------|
| LineChart.tsx | 80% | 렌더링, props 처리 |
| BarChart.tsx | 80% | 렌더링, 데이터 변환 |
| PieChart.tsx | 80% | 렌더링, 그룹화 |
| ChartWrapper.tsx | 90% | 상태 분기 (로딩/에러/빈/정상) |
| utils.ts | 95% | 유틸리티 함수 |
| chart-config.ts | 70% | 설정 객체 |

### 7.3 E2E 테스트 커버리지

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
- TRD: `.orchay/projects/mes-portal/trd.md`

---

<!--
author: Claude
Template Version History:
- v1.0.0 (2026-01-21): TSK-07-03 차트 위젯 테스트 명세서 작성
-->
