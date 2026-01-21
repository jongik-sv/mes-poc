# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 - **Last Updated:** 2026-01-21

> **목적**: KPICard 컴포넌트의 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-07-02 |
| Task명 | KPI 카드 위젯 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| PRD 참조 | PRD 4.1.2 주요 KPI 지표, PRD 4.1.1 KPI 카드 위젯 |
| 작성일 | 2026-01-21 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | KPICard 컴포넌트 렌더링, 증감률 로직, 값 표시 | 80% 이상 |
| E2E 테스트 | 대시보드 페이지 KPI 카드 표시, 데이터 정확성 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 레이아웃 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 컴포넌트 테스트 라이브러리 | @testing-library/react |
| UI 컴포넌트 라이브러리 | Ant Design 6.x (Card, Statistic) |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |

### 1.3 테스트 대상 컴포넌트

```typescript
// components/dashboard/KPICard.tsx
interface KPICardProps {
  type: 'operationRate' | 'defectRate' | 'productionVolume'
  title: string
  value: number | null
  unit?: string
  changeRate: number | null
  precision?: number
  loading?: boolean
  className?: string
}
```

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | KPICard | 가동률 카드 정상 렌더링 | 타이틀, 값, 단위 표시 | FR-001 |
| UT-002 | KPICard | 불량률 카드 정상 렌더링 | 타이틀, 값, 단위 표시 | FR-002 |
| UT-003 | KPICard | 생산량 카드 정상 렌더링 | 타이틀, 값, 단위 표시 | FR-003 |
| UT-004 | KPICard | 증감률 양수 - 상승 화살표 + 녹색 | ArrowUpOutlined 아이콘, 녹색 스타일 | FR-004, BR-001 |
| UT-005 | KPICard | 증감률 음수 - 하락 화살표 + 빨간색 | ArrowDownOutlined 아이콘, 빨간색 스타일 | FR-004, BR-002 |
| UT-006 | KPICard | 증감률 0 - 변화 없음 + 회색 | MinusOutlined 아이콘, 회색 스타일 | FR-004, BR-003 |
| UT-007 | KPICard | 값 없음(null) - 대시(-) 표시 | "-" 문자열 표시 | BR-004 |
| UT-008 | KPICard | 증감률 없음(null) - 미표시 | 증감률 영역 미렌더링 | BR-004 |
| UT-009 | KPICard | 로딩 상태 표시 | Skeleton 또는 Spin 표시 | NFR-001 |
| UT-010 | KPICard | 소수점 자릿수(precision) 적용 | 지정된 자릿수로 값 포맷팅 | FR-001 |
| UT-011 | KPICard | data-testid 속성 렌더링 | 모든 testid 속성 존재 | NFR-002 |

### 2.2 테스트 케이스 상세

#### UT-001: 가동률 카드 정상 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('rendering') -> it('should render operation rate card correctly')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ type: 'operationRate', title: '가동률', value: 95.5, unit: '%', changeRate: 2.3 }` |
| **검증 포인트** | 1. 타이틀 '가동률' 표시<br>2. 값 '95.5' 표시<br>3. 단위 '%' 표시<br>4. data-testid 존재 |
| **커버리지 대상** | render() 정상 분기 |
| **관련 요구사항** | FR-001: 가동률 카드 표시 |

```typescript
it('should render operation rate card correctly', () => {
  render(
    <KPICard
      type="operationRate"
      title="가동률"
      value={95.5}
      unit="%"
      changeRate={2.3}
    />
  )

  // 타이틀 확인
  expect(screen.getByText('가동률')).toBeInTheDocument()

  // 값 확인
  expect(screen.getByTestId('kpi-value')).toHaveTextContent('95.5')

  // 단위 확인
  expect(screen.getByText('%')).toBeInTheDocument()

  // data-testid 확인
  expect(screen.getByTestId('kpi-card-operationRate')).toBeInTheDocument()
})
```

#### UT-002: 불량률 카드 정상 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('rendering') -> it('should render defect rate card correctly')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ type: 'defectRate', title: '불량률', value: 0.8, unit: '%', changeRate: -0.2 }` |
| **검증 포인트** | 1. 타이틀 '불량률' 표시<br>2. 값 '0.8' 표시<br>3. 단위 '%' 표시 |
| **커버리지 대상** | render() 정상 분기 |
| **관련 요구사항** | FR-002: 불량률 카드 표시 |

```typescript
it('should render defect rate card correctly', () => {
  render(
    <KPICard
      type="defectRate"
      title="불량률"
      value={0.8}
      unit="%"
      changeRate={-0.2}
    />
  )

  expect(screen.getByText('불량률')).toBeInTheDocument()
  expect(screen.getByTestId('kpi-value')).toHaveTextContent('0.8')
  expect(screen.getByTestId('kpi-card-defectRate')).toBeInTheDocument()
})
```

#### UT-003: 생산량 카드 정상 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('rendering') -> it('should render production volume card correctly')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ type: 'productionVolume', title: '생산량', value: 12500, unit: '대', changeRate: 5.0 }` |
| **검증 포인트** | 1. 타이틀 '생산량' 표시<br>2. 값 '12,500' 표시 (천 단위 구분자)<br>3. 단위 '대' 표시 |
| **커버리지 대상** | render() 정상 분기, 숫자 포맷팅 |
| **관련 요구사항** | FR-003: 생산량 카드 표시 |

```typescript
it('should render production volume card correctly', () => {
  render(
    <KPICard
      type="productionVolume"
      title="생산량"
      value={12500}
      unit="대"
      changeRate={5.0}
    />
  )

  expect(screen.getByText('생산량')).toBeInTheDocument()
  expect(screen.getByTestId('kpi-value')).toHaveTextContent('12,500')
  expect(screen.getByText('대')).toBeInTheDocument()
  expect(screen.getByTestId('kpi-card-productionVolume')).toBeInTheDocument()
})
```

#### UT-004: 증감률 양수 - 상승 화살표 + 녹색

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('change rate') -> it('should show up arrow with green color for positive change')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ type: 'operationRate', title: '가동률', value: 95.5, changeRate: 2.3 }` |
| **검증 포인트** | 1. 상승 화살표 아이콘 표시<br>2. 녹색 색상 적용<br>3. '+2.3%' 또는 '2.3%' 텍스트 |
| **커버리지 대상** | changeRate > 0 분기 |
| **관련 요구사항** | FR-004, BR-001 |

```typescript
it('should show up arrow with green color for positive change', () => {
  render(
    <KPICard
      type="operationRate"
      title="가동률"
      value={95.5}
      changeRate={2.3}
    />
  )

  const changeRateElement = screen.getByTestId('kpi-change-rate')
  expect(changeRateElement).toBeInTheDocument()

  // 상승 아이콘 확인 (ArrowUpOutlined)
  const icon = screen.getByTestId('kpi-change-icon')
  expect(icon).toBeInTheDocument()

  // 녹색 스타일 확인 (클래스명 또는 스타일)
  expect(changeRateElement).toHaveClass('text-green-500')
  // 또는 expect(changeRateElement).toHaveStyle({ color: 'rgb(82, 196, 26)' })

  // 증감률 값 확인
  expect(changeRateElement).toHaveTextContent('2.3')
})
```

#### UT-005: 증감률 음수 - 하락 화살표 + 빨간색

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('change rate') -> it('should show down arrow with red color for negative change')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ type: 'defectRate', title: '불량률', value: 0.8, changeRate: -0.5 }` |
| **검증 포인트** | 1. 하락 화살표 아이콘 표시<br>2. 빨간색 색상 적용<br>3. '-0.5%' 텍스트 |
| **커버리지 대상** | changeRate < 0 분기 |
| **관련 요구사항** | FR-004, BR-002 |

```typescript
it('should show down arrow with red color for negative change', () => {
  render(
    <KPICard
      type="defectRate"
      title="불량률"
      value={0.8}
      changeRate={-0.5}
    />
  )

  const changeRateElement = screen.getByTestId('kpi-change-rate')
  expect(changeRateElement).toBeInTheDocument()

  // 하락 아이콘 확인 (ArrowDownOutlined)
  const icon = screen.getByTestId('kpi-change-icon')
  expect(icon).toBeInTheDocument()

  // 빨간색 스타일 확인
  expect(changeRateElement).toHaveClass('text-red-500')

  // 증감률 값 확인
  expect(changeRateElement).toHaveTextContent('-0.5')
})
```

#### UT-006: 증감률 0 - 변화 없음 + 회색

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('change rate') -> it('should show neutral indicator with gray color for zero change')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ type: 'operationRate', title: '가동률', value: 90.0, changeRate: 0 }` |
| **검증 포인트** | 1. 중립 아이콘(MinusOutlined) 또는 텍스트 표시<br>2. 회색 색상 적용<br>3. '0%' 또는 '-' 텍스트 |
| **커버리지 대상** | changeRate === 0 분기 |
| **관련 요구사항** | FR-004, BR-003 |

```typescript
it('should show neutral indicator with gray color for zero change', () => {
  render(
    <KPICard
      type="operationRate"
      title="가동률"
      value={90.0}
      changeRate={0}
    />
  )

  const changeRateElement = screen.getByTestId('kpi-change-rate')
  expect(changeRateElement).toBeInTheDocument()

  // 중립 아이콘 또는 회색 스타일 확인
  expect(changeRateElement).toHaveClass('text-gray-500')

  // 증감률 값 확인 (0 또는 변화 없음 표시)
  expect(changeRateElement).toHaveTextContent('0')
})
```

#### UT-007: 값 없음(null) - 대시(-) 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('null handling') -> it('should show dash when value is null')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ type: 'operationRate', title: '가동률', value: null, changeRate: null }` |
| **검증 포인트** | 1. 값 영역에 '-' 표시<br>2. 에러 발생하지 않음 |
| **커버리지 대상** | value === null 분기 |
| **관련 요구사항** | BR-004 |

```typescript
it('should show dash when value is null', () => {
  render(
    <KPICard
      type="operationRate"
      title="가동률"
      value={null}
      changeRate={null}
    />
  )

  const valueElement = screen.getByTestId('kpi-value')
  expect(valueElement).toHaveTextContent('-')
})
```

#### UT-008: 증감률 없음(null) - 미표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('null handling') -> it('should not render change rate when null')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ type: 'operationRate', title: '가동률', value: 95.5, changeRate: null }` |
| **검증 포인트** | 1. 증감률 영역이 렌더링되지 않음 |
| **커버리지 대상** | changeRate === null 분기 |
| **관련 요구사항** | BR-004 |

```typescript
it('should not render change rate when null', () => {
  render(
    <KPICard
      type="operationRate"
      title="가동률"
      value={95.5}
      changeRate={null}
    />
  )

  expect(screen.queryByTestId('kpi-change-rate')).not.toBeInTheDocument()
  expect(screen.queryByTestId('kpi-change-icon')).not.toBeInTheDocument()
})
```

#### UT-009: 로딩 상태 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('loading state') -> it('should show loading skeleton when loading')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ type: 'operationRate', title: '가동률', value: null, changeRate: null, loading: true }` |
| **검증 포인트** | 1. Skeleton 또는 Spin 컴포넌트 표시<br>2. 값이 표시되지 않음 |
| **커버리지 대상** | loading === true 분기 |
| **관련 요구사항** | NFR-001 |

```typescript
it('should show loading skeleton when loading', () => {
  render(
    <KPICard
      type="operationRate"
      title="가동률"
      value={null}
      changeRate={null}
      loading={true}
    />
  )

  // Skeleton 또는 Spin이 표시되는지 확인
  expect(screen.getByTestId('kpi-card-operationRate')).toBeInTheDocument()

  // 로딩 중에는 실제 값이 표시되지 않음
  // Ant Design Statistic은 loading prop 지원
})
```

#### UT-010: 소수점 자릿수(precision) 적용

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('formatting') -> it('should format value with specified precision')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ type: 'operationRate', title: '가동률', value: 95.567, precision: 1 }` |
| **검증 포인트** | 1. 값이 '95.6'으로 표시됨 (소수점 1자리) |
| **커버리지 대상** | precision prop 처리 로직 |
| **관련 요구사항** | FR-001 |

```typescript
it('should format value with specified precision', () => {
  render(
    <KPICard
      type="operationRate"
      title="가동률"
      value={95.567}
      unit="%"
      changeRate={0}
      precision={1}
    />
  )

  expect(screen.getByTestId('kpi-value')).toHaveTextContent('95.6')
})
```

#### UT-011: data-testid 속성 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('accessibility') -> it('should render all required data-testid attributes')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ type: 'operationRate', title: '가동률', value: 95.5, changeRate: 2.3 }` |
| **검증 포인트** | 모든 필수 data-testid 속성 존재 확인 |
| **커버리지 대상** | data-testid 속성 렌더링 |
| **관련 요구사항** | NFR-002 |

```typescript
it('should render all required data-testid attributes', () => {
  render(
    <KPICard
      type="operationRate"
      title="가동률"
      value={95.5}
      changeRate={2.3}
    />
  )

  expect(screen.getByTestId('kpi-card-operationRate')).toBeInTheDocument()
  expect(screen.getByTestId('kpi-value')).toBeInTheDocument()
  expect(screen.getByTestId('kpi-change-rate')).toBeInTheDocument()
  expect(screen.getByTestId('kpi-change-icon')).toBeInTheDocument()
})
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 대시보드 KPI 카드 3종 표시 확인 | 로그인, 대시보드 접속 | 1. 대시보드 페이지 이동 | 가동률, 불량률, 생산량 카드 표시 | FR-001, FR-002, FR-003 |
| E2E-002 | KPI 값 정확성 확인 | 대시보드 접속, mock 데이터 로드 | 1. 각 KPI 카드 값 확인 | mock 데이터와 일치하는 값 표시 | FR-005 |
| E2E-003 | 증감률 색상/아이콘 확인 | 대시보드 접속 | 1. 양수 증감률 카드 확인<br>2. 음수 증감률 카드 확인 | 적절한 색상과 아이콘 표시 | FR-004, BR-001, BR-002 |
| E2E-004 | 반응형 레이아웃 확인 | 대시보드 접속 | 1. 데스크톱 크기 확인<br>2. 태블릿 크기 확인<br>3. 모바일 크기 확인 | 각 breakpoint에서 적절한 레이아웃 | NFR-003 |

### 3.2 테스트 케이스 상세

#### E2E-001: 대시보드 KPI 카드 3종 표시 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-kpi.spec.ts` |
| **테스트명** | `test('대시보드에 3종 KPI 카드가 표시된다')` |
| **사전조건** | 로그인 (fixture 사용), 대시보드 접근 |
| **data-testid 셀렉터** | |
| - 가동률 카드 | `[data-testid="kpi-card-operationRate"]` |
| - 불량률 카드 | `[data-testid="kpi-card-defectRate"]` |
| - 생산량 카드 | `[data-testid="kpi-card-productionVolume"]` |
| **검증 포인트** | 3개 KPI 카드 모두 표시 |
| **스크린샷** | `e2e-001-kpi-cards.png` |
| **관련 요구사항** | FR-001, FR-002, FR-003 |

```typescript
test('대시보드에 3종 KPI 카드가 표시된다', async ({ page }) => {
  // Given: 로그인 및 대시보드 페이지 접속
  await page.goto('/sample/dashboard')
  await page.waitForSelector('[data-testid="dashboard-layout"]')

  // Then: 3종 KPI 카드 확인
  await expect(page.locator('[data-testid="kpi-card-operationRate"]')).toBeVisible()
  await expect(page.locator('[data-testid="kpi-card-defectRate"]')).toBeVisible()
  await expect(page.locator('[data-testid="kpi-card-productionVolume"]')).toBeVisible()

  // 스크린샷
  await page.screenshot({ path: 'e2e-001-kpi-cards.png' })
})
```

#### E2E-002: KPI 값 정확성 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-kpi.spec.ts` |
| **테스트명** | `test('KPI 카드에 mock 데이터 값이 정확히 표시된다')` |
| **사전조건** | 대시보드 접속, mock-data/dashboard.json 로드 |
| **data-testid 셀렉터** | |
| - KPI 값 | `[data-testid="kpi-value"]` |
| **API/데이터 확인** | mock-data/dashboard.json의 kpi 섹션 데이터 |
| **검증 포인트** | 각 KPI 카드의 값이 mock 데이터와 일치 |
| **스크린샷** | `e2e-002-kpi-values.png` |
| **관련 요구사항** | FR-005 |

```typescript
test('KPI 카드에 mock 데이터 값이 정확히 표시된다', async ({ page }) => {
  // Given: 대시보드 페이지 접속
  await page.goto('/sample/dashboard')
  await page.waitForSelector('[data-testid="dashboard-layout"]')

  // Mock 데이터 기대값 (dashboard.json 기준)
  const expectedKPIs = {
    operationRate: { value: '95.5', unit: '%' },
    defectRate: { value: '0.8', unit: '%' },
    productionVolume: { value: '12,500', unit: '대' }
  }

  // Then: 각 KPI 값 확인
  const operationRateCard = page.locator('[data-testid="kpi-card-operationRate"]')
  await expect(operationRateCard.locator('[data-testid="kpi-value"]')).toContainText(expectedKPIs.operationRate.value)

  const defectRateCard = page.locator('[data-testid="kpi-card-defectRate"]')
  await expect(defectRateCard.locator('[data-testid="kpi-value"]')).toContainText(expectedKPIs.defectRate.value)

  const productionVolumeCard = page.locator('[data-testid="kpi-card-productionVolume"]')
  await expect(productionVolumeCard.locator('[data-testid="kpi-value"]')).toContainText(expectedKPIs.productionVolume.value)

  await page.screenshot({ path: 'e2e-002-kpi-values.png' })
})
```

#### E2E-003: 증감률 색상/아이콘 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-kpi.spec.ts` |
| **테스트명** | `test('증감률에 따라 적절한 색상과 아이콘이 표시된다')` |
| **사전조건** | 대시보드 접속 |
| **data-testid 셀렉터** | |
| - 증감률 영역 | `[data-testid="kpi-change-rate"]` |
| - 증감률 아이콘 | `[data-testid="kpi-change-icon"]` |
| **검증 포인트** | 양수 증감률 - 녹색/상승 아이콘, 음수 증감률 - 빨간색/하락 아이콘 |
| **스크린샷** | `e2e-003-change-rates.png` |
| **관련 요구사항** | FR-004, BR-001, BR-002 |

```typescript
test('증감률에 따라 적절한 색상과 아이콘이 표시된다', async ({ page }) => {
  // Given: 대시보드 페이지 접속
  await page.goto('/sample/dashboard')
  await page.waitForSelector('[data-testid="dashboard-layout"]')

  // 가동률 카드 (양수 증감률 예상)
  const operationRateChange = page.locator('[data-testid="kpi-card-operationRate"] [data-testid="kpi-change-rate"]')
  await expect(operationRateChange).toBeVisible()

  // 색상 확인 (CSS class 또는 computed style)
  // 양수면 녹색 계열
  const operationRateClass = await operationRateChange.getAttribute('class')
  // expect(operationRateClass).toContain('green') 또는 toContain('success')

  // 아이콘 확인
  const operationRateIcon = page.locator('[data-testid="kpi-card-operationRate"] [data-testid="kpi-change-icon"]')
  await expect(operationRateIcon).toBeVisible()

  await page.screenshot({ path: 'e2e-003-change-rates.png' })
})
```

#### E2E-004: 반응형 레이아웃 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-kpi.spec.ts` |
| **테스트명** | `test('화면 크기에 따라 KPI 카드 레이아웃이 조정된다')` |
| **사전조건** | 대시보드 접속 |
| **검증 포인트** | 데스크톱(1280px): 3~4열, 태블릿(768px): 2열, 모바일(375px): 1열 |
| **스크린샷** | `e2e-004-responsive-desktop.png`, `e2e-004-responsive-tablet.png`, `e2e-004-responsive-mobile.png` |
| **관련 요구사항** | NFR-003 |

```typescript
test('화면 크기에 따라 KPI 카드 레이아웃이 조정된다', async ({ page }) => {
  // Desktop (1280px)
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/sample/dashboard')
  await page.waitForSelector('[data-testid="dashboard-layout"]')
  await page.screenshot({ path: 'e2e-004-responsive-desktop.png' })

  // KPI 카드가 한 줄에 여러 개 표시되는지 확인
  const kpiCards = page.locator('[data-testid^="kpi-card-"]')
  await expect(kpiCards).toHaveCount(3)

  // Tablet (768px)
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.screenshot({ path: 'e2e-004-responsive-tablet.png' })

  // Mobile (375px)
  await page.setViewportSize({ width: 375, height: 667 })
  await page.screenshot({ path: 'e2e-004-responsive-mobile.png' })

  // 모바일에서도 모든 카드가 표시되는지 확인
  await expect(kpiCards).toHaveCount(3)
})
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | KPI 카드 UI 레이아웃 | 대시보드 접속 | 1. 카드 디자인 확인 | Ant Design Card 스타일 적용, 정렬 일관성 | High | FR-001, FR-002, FR-003 |
| TC-002 | 증감률 색상 가독성 | 대시보드 접속 | 1. 각 증감률 색상 확인 | 녹색/빨간색/회색 명확히 구분 | High | FR-004 |
| TC-003 | 폰트 크기 및 계층 | 대시보드 접속 | 1. 타이틀, 값, 증감률 폰트 확인 | 시각적 계층 명확 (값 > 타이틀 > 증감률) | Medium | - |
| TC-004 | 반응형 카드 배치 | 대시보드 접속 | 1. 브라우저 크기 조절 | 카드 크기 및 배치 적절히 조정 | Medium | NFR-003 |
| TC-005 | 접근성 (키보드) | 대시보드 접속 | 1. Tab 키로 카드 간 이동 | 포커스 표시, 카드 정보 접근 가능 | Medium | A11y |
| TC-006 | 접근성 (스크린리더) | 대시보드 접속 | 1. 스크린리더로 카드 읽기 | 타이틀, 값, 증감률 순차 읽힘 | Low | A11y |

### 4.2 매뉴얼 테스트 상세

#### TC-001: KPI 카드 UI 레이아웃

**테스트 목적**: KPI 카드의 시각적 디자인과 레이아웃이 일관되게 적용되었는지 확인

**테스트 단계**:
1. 대시보드 페이지 접속
2. 가동률, 불량률, 생산량 카드 순차 확인
3. 각 카드의 크기, 간격, 정렬 확인
4. 카드 내 요소(타이틀, 값, 증감률) 배치 확인

**예상 결과**:
- 3개 카드가 동일한 높이와 스타일로 표시됨
- 카드 간 간격이 일정함 (16px 또는 24px)
- 타이틀은 상단, 값은 중앙, 증감률은 하단 배치
- Ant Design Card/Statistic 컴포넌트 스타일 적용

**검증 기준**:
- [ ] 카드 테두리와 그림자 일관성
- [ ] 카드 내 패딩 균일 (16px)
- [ ] 타이틀 폰트 크기 14px, 색상 회색
- [ ] 값 폰트 크기 24px 이상, 색상 검정
- [ ] 증감률 폰트 크기 12px

#### TC-002: 증감률 색상 가독성

**테스트 목적**: 증감률의 양수/음수/0 상태가 색상으로 명확히 구분되는지 확인

**테스트 단계**:
1. 양수 증감률이 있는 카드 확인 (예: 가동률 +2.3%)
2. 음수 증감률이 있는 카드 확인 (예: 불량률 -0.5%)
3. 0 증감률 또는 변화 없음 상태 확인

**예상 결과**:
- 양수: 녹색 (#52c41a 또는 유사) + 상승 화살표
- 음수: 빨간색 (#ff4d4f 또는 유사) + 하락 화살표
- 0: 회색 + 중립 표시 (- 또는 = 아이콘)

**검증 기준**:
- [ ] 양수 증감률 녹색 계열 색상
- [ ] 음수 증감률 빨간색 계열 색상
- [ ] 색상 대비 충분히 명확 (WCAG AA 기준)
- [ ] 화살표 아이콘과 숫자 정렬

#### TC-003: 폰트 크기 및 계층

**테스트 목적**: 텍스트 요소 간 시각적 계층이 명확한지 확인

**테스트 단계**:
1. 카드 타이틀(예: '가동률') 폰트 확인
2. 값(예: '95.5%') 폰트 확인
3. 증감률(예: '+2.3%') 폰트 확인
4. 시각적 중요도 순서 확인

**예상 결과**:
- 값이 가장 크고 눈에 띔 (24px+, bold)
- 타이틀은 값보다 작음 (14px)
- 증감률은 보조 정보로 가장 작음 (12px)

**검증 기준**:
- [ ] 값 폰트가 타이틀보다 큼
- [ ] 숫자에 적절한 font-weight 적용
- [ ] 단위가 값과 구분되지만 인접 배치

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-KPI-OPERATION-RATE | 가동률 KPI | `{ type: 'operationRate', title: '가동률', value: 95.5, unit: '%', changeRate: 2.3 }` |
| MOCK-KPI-DEFECT-RATE | 불량률 KPI | `{ type: 'defectRate', title: '불량률', value: 0.8, unit: '%', changeRate: -0.2 }` |
| MOCK-KPI-PRODUCTION-VOLUME | 생산량 KPI | `{ type: 'productionVolume', title: '생산량', value: 12500, unit: '대', changeRate: 5.0 }` |
| MOCK-KPI-NULL-VALUE | 값 없음 케이스 | `{ type: 'operationRate', title: '가동률', value: null, changeRate: null }` |
| MOCK-KPI-ZERO-CHANGE | 변화 없음 케이스 | `{ type: 'operationRate', title: '가동률', value: 90.0, changeRate: 0 }` |

### 5.2 E2E 테스트용 Mock 데이터 (dashboard.json)

```json
{
  "kpi": {
    "operationRate": {
      "title": "가동률",
      "value": 95.5,
      "unit": "%",
      "changeRate": 2.3,
      "trend": "up"
    },
    "defectRate": {
      "title": "불량률",
      "value": 0.8,
      "unit": "%",
      "changeRate": -0.2,
      "trend": "down"
    },
    "productionVolume": {
      "title": "생산량",
      "value": 12500,
      "unit": "대",
      "changeRate": 5.0,
      "trend": "up"
    }
  }
}
```

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 대시보드 조회 테스트 |
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 대시보드 테스트 |

### 5.4 Mock 데이터 코드

```typescript
// fixtures/kpi-card.fixtures.ts

import { KPICardProps } from '@/components/dashboard/KPICard'

export const mockOperationRateKPI: KPICardProps = {
  type: 'operationRate',
  title: '가동률',
  value: 95.5,
  unit: '%',
  changeRate: 2.3,
  precision: 1,
}

export const mockDefectRateKPI: KPICardProps = {
  type: 'defectRate',
  title: '불량률',
  value: 0.8,
  unit: '%',
  changeRate: -0.2,
  precision: 1,
}

export const mockProductionVolumeKPI: KPICardProps = {
  type: 'productionVolume',
  title: '생산량',
  value: 12500,
  unit: '대',
  changeRate: 5.0,
  precision: 0,
}

export const mockNullValueKPI: KPICardProps = {
  type: 'operationRate',
  title: '가동률',
  value: null,
  changeRate: null,
}

export const mockZeroChangeKPI: KPICardProps = {
  type: 'operationRate',
  title: '가동률',
  value: 90.0,
  unit: '%',
  changeRate: 0,
}

export const mockLoadingKPI: KPICardProps = {
  type: 'operationRate',
  title: '가동률',
  value: null,
  changeRate: null,
  loading: true,
}

// 전체 대시보드 KPI 데이터
export const mockDashboardKPIs = {
  operationRate: mockOperationRateKPI,
  defectRate: mockDefectRateKPI,
  productionVolume: mockProductionVolumeKPI,
}
```

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 KPICard 컴포넌트 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `kpi-card-{type}` | KPI 카드 컨테이너 | 특정 타입의 KPI 카드 식별 |
| `kpi-value` | KPI 값 표시 영역 | 숫자 값 확인 |
| `kpi-change-rate` | 증감률 표시 영역 | 증감률 값 및 스타일 확인 |
| `kpi-change-icon` | 증감률 아이콘 | 화살표 아이콘 확인 |

### 6.2 타입별 data-testid

| data-testid | 설명 |
|-------------|------|
| `kpi-card-operationRate` | 가동률 카드 |
| `kpi-card-defectRate` | 불량률 카드 |
| `kpi-card-productionVolume` | 생산량 카드 |

### 6.3 대시보드 레이아웃 관련 셀렉터 (참조)

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `dashboard-layout` | 대시보드 전체 레이아웃 | 페이지 로드 확인 |
| `kpi-card-area` | KPI 카드 영역 | KPI 섹션 확인 |

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

### 7.3 측정 방법

- **단위 테스트**: Vitest coverage report (`vitest run --coverage`)
- **E2E 테스트**: Playwright test report (`npx playwright test --reporter=html`)
- **커버리지 리포트 위치**: `coverage/` 디렉토리

---

## 8. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 단위 테스트 | E2E 테스트 | 매뉴얼 테스트 |
|-------------|--------------|------------|-----------|--------------|
| FR-001 | 가동률 카드 표시 | UT-001, UT-010 | E2E-001, E2E-002 | TC-001 |
| FR-002 | 불량률 카드 표시 | UT-002 | E2E-001, E2E-002 | TC-001 |
| FR-003 | 생산량 카드 표시 | UT-003 | E2E-001, E2E-002 | TC-001 |
| FR-004 | 증감률 표시 (화살표 + 색상) | UT-004, UT-005, UT-006 | E2E-003 | TC-002 |
| FR-005 | mock-data/dashboard.json 데이터 로드 | - | E2E-002 | - |
| BR-001 | 증감률 양수 -> 상승 화살표 + 녹색 | UT-004 | E2E-003 | TC-002 |
| BR-002 | 증감률 음수 -> 하락 화살표 + 빨간색 | UT-005 | E2E-003 | TC-002 |
| BR-003 | 증감률 0 -> 변화 없음 + 회색 | UT-006 | - | TC-002 |
| BR-004 | KPI 값 없음 -> "-" 표시 | UT-007, UT-008 | - | - |
| NFR-001 | 로딩 상태 표시 | UT-009 | - | - |
| NFR-002 | data-testid 속성 | UT-011 | E2E-001 ~ E2E-004 | - |
| NFR-003 | 반응형 레이아웃 | - | E2E-004 | TC-004 |

---

## 관련 문서

- 설계 문서: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md` (섹션 4.1.1, 4.1.2)
- TRD: `.orchay/projects/mes-portal/trd.md` (섹션 7: KPI 카드 - Ant Design Statistic)

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | Claude | 최초 작성 |

---

<!--
Task: TSK-07-02 KPI 카드 위젯
Domain: frontend
Category: development
Created: 2026-01-21
-->
