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

> 설계 문서 010-design.md 섹션 7.3 기준

```typescript
// types/dashboard.ts
type KPIChangeType = 'increase' | 'decrease' | 'neutral';
type KPIValueType = 'positive' | 'negative';

interface KPICardData {
  id: string;              // 고유 ID (production, efficiency, defect, orders)
  title: string;           // 제목 (금일 생산량, 가동률 등)
  value: number;           // 현재 값
  unit: string;            // 단위 (개, %, 건)
  change: number;          // 변화율 (양수: 증가, 음수: 감소)
  changeType: KPIChangeType; // 변화 유형
  icon: string;            // 아이콘 이름
}

// components/dashboard/KPICard/index.tsx
interface KPICardProps {
  data: KPICardData;
  loading?: boolean;
  valueType?: KPIValueType; // 기본값: 'positive'
  onClick?: () => void;
  className?: string;
}
```

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

> 설계 문서 010-design.md 비즈니스 규칙(BR) 기준으로 재구성

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | KPICard | 가동률(efficiency) 카드 정상 렌더링 | 타이틀, 값(87.3%), 단위 표시 | FR-001 |
| UT-002 | KPICard | 불량률(defect) 카드 정상 렌더링 | 타이틀, 값(1.2%), 단위 표시 | FR-002 |
| UT-003 | KPICard | 생산량(production) 카드 정상 렌더링 | 타이틀, 값(1,247개), 단위 표시 | FR-003 |
| UT-004 | KPICard | 작업지시(orders) 카드 정상 렌더링 | 타이틀, 값(15건), 단위 표시 | FR-006 |
| UT-004 | KPICard | **긍정 KPI** 증가(increase) - 상승 화살표 + **녹색** | ArrowUpOutlined, colorSuccess | FR-004, BR-001 |
| UT-004-2 | KPICard | **긍정 KPI** 감소(decrease) - 하락 화살표 + **빨간색** | ArrowDownOutlined, colorError | FR-004, BR-002 |
| UT-005 | KPICard | **부정 KPI(불량률)** 증가(increase) - 상승 화살표 + **빨간색** | ArrowUpOutlined, colorError | FR-004, BR-003 |
| UT-005-2 | KPICard | **부정 KPI(불량률)** 감소(decrease) - 하락 화살표 + **녹색** | ArrowDownOutlined, colorSuccess | FR-004, BR-004 |
| UT-006 | KPICard | 변화 없음(neutral) - MinusOutlined + **회색** | MinusOutlined, colorTextSecondary | FR-004, BR-005 |
| UT-007 | KPICard | 값 없음(null) - 대시(-) 표시 | "-" 문자열 표시 | BR-009 |
| UT-008 | KPICard | 증감률 없음(null) - 미표시 | 증감률 영역 미렌더링 | BR-009 |
| UT-009 | KPICard | 로딩 상태 표시 | Skeleton 또는 Spin 표시 | NFR-001 |
| UT-010 | KPICard | 천 단위 콤마 포맷팅 | 1247 → "1,247" | BR-006 |
| UT-010-2 | KPICard | 비율 소수점 1자리 표시 | 87.35 → "87.4%" | BR-007 |
| UT-010-3 | KPICard | 수량/건수 정수 표시 | 15.7 → "15건" | BR-008 |
| UT-011 | KPICard | data-testid 속성 렌더링 | 모든 testid 속성 존재 (`kpi-card-{id}`) | NFR-002 |

### 2.2 테스트 케이스 상세

#### UT-001: 가동률(efficiency) 카드 정상 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('rendering') -> it('should render efficiency card correctly')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'efficiency', title: '가동률', value: 87.3, unit: '%', change: 2.1, changeType: 'increase', icon: 'activity' }, valueType: 'positive' }` |
| **검증 포인트** | 1. 타이틀 '가동률' 표시<br>2. 값 '87.3' 표시 (소수점 1자리)<br>3. 단위 '%' 표시<br>4. data-testid `kpi-card-efficiency` 존재 |
| **커버리지 대상** | render() 정상 분기, BR-007 |
| **관련 요구사항** | FR-001: 가동률 카드 표시 |

```typescript
it('should render efficiency card correctly', () => {
  const data: KPICardData = {
    id: 'efficiency',
    title: '가동률',
    value: 87.3,
    unit: '%',
    change: 2.1,
    changeType: 'increase',
    icon: 'activity'
  }

  render(<KPICard data={data} valueType="positive" />)

  // 타이틀 확인
  expect(screen.getByText('가동률')).toBeInTheDocument()

  // 값 확인 (소수점 1자리)
  expect(screen.getByTestId('kpi-value-efficiency')).toHaveTextContent('87.3')

  // 단위 확인
  expect(screen.getByText('%')).toBeInTheDocument()

  // data-testid 확인 (설계 문서 기준: kpi-card-{id})
  expect(screen.getByTestId('kpi-card-efficiency')).toBeInTheDocument()
})
```

#### UT-002: 불량률(defect) 카드 정상 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('rendering') -> it('should render defect card correctly')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'defect', title: '불량률', value: 1.2, unit: '%', change: -0.3, changeType: 'decrease', icon: 'alert-triangle' }, valueType: 'negative' }` |
| **검증 포인트** | 1. 타이틀 '불량률' 표시<br>2. 값 '1.2' 표시<br>3. 단위 '%' 표시<br>4. data-testid `kpi-card-defect` 존재 |
| **커버리지 대상** | render() 정상 분기, BR-007, 부정 KPI |
| **관련 요구사항** | FR-002: 불량률 카드 표시 |

```typescript
it('should render defect card correctly', () => {
  const data: KPICardData = {
    id: 'defect',
    title: '불량률',
    value: 1.2,
    unit: '%',
    change: -0.3,
    changeType: 'decrease',
    icon: 'alert-triangle'
  }

  render(<KPICard data={data} valueType="negative" />)

  expect(screen.getByText('불량률')).toBeInTheDocument()
  expect(screen.getByTestId('kpi-value-defect')).toHaveTextContent('1.2')
  expect(screen.getByTestId('kpi-card-defect')).toBeInTheDocument()
})
```

#### UT-003: 생산량(production) 카드 정상 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('rendering') -> it('should render production card correctly')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'production', title: '금일 생산량', value: 1247, unit: '개', change: 12.5, changeType: 'increase', icon: 'package' }, valueType: 'positive' }` |
| **검증 포인트** | 1. 타이틀 '금일 생산량' 표시<br>2. 값 '1,247' 표시 (천 단위 콤마, BR-006)<br>3. 단위 '개' 표시<br>4. data-testid `kpi-card-production` 존재 |
| **커버리지 대상** | render() 정상 분기, BR-006, BR-008 |
| **관련 요구사항** | FR-003: 생산량 카드 표시 |

```typescript
it('should render production card correctly', () => {
  const data: KPICardData = {
    id: 'production',
    title: '금일 생산량',
    value: 1247,
    unit: '개',
    change: 12.5,
    changeType: 'increase',
    icon: 'package'
  }

  render(<KPICard data={data} valueType="positive" />)

  expect(screen.getByText('금일 생산량')).toBeInTheDocument()
  // 천 단위 콤마 적용 (BR-006)
  expect(screen.getByTestId('kpi-value-production')).toHaveTextContent('1,247')
  expect(screen.getByText('개')).toBeInTheDocument()
  expect(screen.getByTestId('kpi-card-production')).toBeInTheDocument()
})
```

#### UT-004: 작업지시(orders) 카드 정상 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('rendering') -> it('should render orders card correctly')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'orders', title: '작업지시', value: 15, unit: '건', change: 0, changeType: 'neutral', icon: 'clipboard' }, valueType: 'positive' }` |
| **검증 포인트** | 1. 타이틀 '작업지시' 표시<br>2. 값 '15' 표시 (정수, BR-008)<br>3. 단위 '건' 표시<br>4. data-testid `kpi-card-orders` 존재 |
| **커버리지 대상** | render() 정상 분기, BR-008 |
| **관련 요구사항** | FR-006: 작업지시 카드 표시 |

```typescript
it('should render orders card correctly', () => {
  const data: KPICardData = {
    id: 'orders',
    title: '작업지시',
    value: 15,
    unit: '건',
    change: 0,
    changeType: 'neutral',
    icon: 'clipboard'
  }

  render(<KPICard data={data} valueType="positive" />)

  expect(screen.getByText('작업지시')).toBeInTheDocument()
  // 정수 표시 (BR-008)
  expect(screen.getByTestId('kpi-value-orders')).toHaveTextContent('15')
  expect(screen.getByText('건')).toBeInTheDocument()
  expect(screen.getByTestId('kpi-card-orders')).toBeInTheDocument()
})
```

#### UT-004: 긍정 KPI 증가(increase) - 상승 화살표 + 녹색

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('change indicator') -> it('should show green up arrow for positive KPI increase')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'efficiency', ..., change: 2.1, changeType: 'increase' }, valueType: 'positive' }` |
| **검증 포인트** | 1. 상승 화살표(ArrowUpOutlined) 표시<br>2. **녹색**(colorSuccess) 색상 적용<br>3. '+2.1%' 텍스트 |
| **커버리지 대상** | valueType='positive' + changeType='increase' → 녹색 (BR-001) |
| **관련 요구사항** | FR-004, BR-001 |

```typescript
it('should show green up arrow for positive KPI increase', () => {
  const data: KPICardData = {
    id: 'efficiency',
    title: '가동률',
    value: 87.3,
    unit: '%',
    change: 2.1,
    changeType: 'increase',
    icon: 'activity'
  }

  render(<KPICard data={data} valueType="positive" />)

  const changeElement = screen.getByTestId('kpi-change-efficiency')
  expect(changeElement).toBeInTheDocument()

  // 상승 아이콘 확인 (ArrowUpOutlined)
  const icon = screen.getByTestId('kpi-change-icon-efficiency')
  expect(icon).toBeInTheDocument()

  // 녹색 스타일 확인 (긍정 KPI + 증가 = 좋음 = 녹색)
  expect(changeElement).toHaveStyle({ color: 'rgb(82, 196, 26)' }) // colorSuccess

  // 증감률 값 확인
  expect(changeElement).toHaveTextContent('2.1')
})
```

#### UT-004-2: 긍정 KPI 감소(decrease) - 하락 화살표 + 빨간색

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('change indicator') -> it('should show red down arrow for positive KPI decrease')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'production', ..., change: -5.0, changeType: 'decrease' }, valueType: 'positive' }` |
| **검증 포인트** | 1. 하락 화살표(ArrowDownOutlined) 표시<br>2. **빨간색**(colorError) 색상 적용<br>3. '-5.0%' 텍스트 |
| **커버리지 대상** | valueType='positive' + changeType='decrease' → 빨간색 (BR-002) |
| **관련 요구사항** | FR-004, BR-002 |

```typescript
it('should show red down arrow for positive KPI decrease', () => {
  const data: KPICardData = {
    id: 'production',
    title: '금일 생산량',
    value: 1000,
    unit: '개',
    change: -5.0,
    changeType: 'decrease',
    icon: 'package'
  }

  render(<KPICard data={data} valueType="positive" />)

  const changeElement = screen.getByTestId('kpi-change-production')

  // 빨간색 스타일 확인 (긍정 KPI + 감소 = 나쁨 = 빨간색)
  expect(changeElement).toHaveStyle({ color: 'rgb(255, 77, 79)' }) // colorError

  // 증감률 값 확인
  expect(changeElement).toHaveTextContent('-5.0')
})
```

#### UT-005: 부정 KPI(불량률) 증가(increase) - 상승 화살표 + 빨간색

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('change indicator') -> it('should show red up arrow for negative KPI increase')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'defect', ..., change: 0.5, changeType: 'increase' }, valueType: 'negative' }` |
| **검증 포인트** | 1. 상승 화살표(ArrowUpOutlined) 표시<br>2. **빨간색**(colorError) 색상 적용 ← **핵심: 불량률 증가는 나쁨**<br>3. '+0.5%' 텍스트 |
| **커버리지 대상** | valueType='negative' + changeType='increase' → 빨간색 (BR-003) |
| **관련 요구사항** | FR-004, BR-003 |

```typescript
it('should show red up arrow for negative KPI (defect rate) increase', () => {
  const data: KPICardData = {
    id: 'defect',
    title: '불량률',
    value: 1.7,
    unit: '%',
    change: 0.5,
    changeType: 'increase',
    icon: 'alert-triangle'
  }

  // 불량률은 valueType='negative' (부정 KPI)
  render(<KPICard data={data} valueType="negative" />)

  const changeElement = screen.getByTestId('kpi-change-defect')
  expect(changeElement).toBeInTheDocument()

  // 상승 아이콘 확인
  const icon = screen.getByTestId('kpi-change-icon-defect')
  expect(icon).toBeInTheDocument()

  // **빨간색** 스타일 확인 (부정 KPI + 증가 = 나쁨 = 빨간색)
  expect(changeElement).toHaveStyle({ color: 'rgb(255, 77, 79)' }) // colorError

  // 증감률 값 확인
  expect(changeElement).toHaveTextContent('0.5')
})
```

#### UT-005-2: 부정 KPI(불량률) 감소(decrease) - 하락 화살표 + 녹색

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('change indicator') -> it('should show green down arrow for negative KPI decrease')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'defect', ..., change: -0.3, changeType: 'decrease' }, valueType: 'negative' }` |
| **검증 포인트** | 1. 하락 화살표(ArrowDownOutlined) 표시<br>2. **녹색**(colorSuccess) 색상 적용 ← **핵심: 불량률 감소는 좋음**<br>3. '-0.3%' 텍스트 |
| **커버리지 대상** | valueType='negative' + changeType='decrease' → 녹색 (BR-004) |
| **관련 요구사항** | FR-004, BR-004 |

```typescript
it('should show green down arrow for negative KPI (defect rate) decrease', () => {
  const data: KPICardData = {
    id: 'defect',
    title: '불량률',
    value: 1.2,
    unit: '%',
    change: -0.3,
    changeType: 'decrease',
    icon: 'alert-triangle'
  }

  // 불량률은 valueType='negative' (부정 KPI)
  render(<KPICard data={data} valueType="negative" />)

  const changeElement = screen.getByTestId('kpi-change-defect')

  // **녹색** 스타일 확인 (부정 KPI + 감소 = 좋음 = 녹색)
  expect(changeElement).toHaveStyle({ color: 'rgb(82, 196, 26)' }) // colorSuccess

  // 증감률 값 확인
  expect(changeElement).toHaveTextContent('-0.3')
})
```

#### UT-006: 변화 없음(neutral) - MinusOutlined + 회색

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('change indicator') -> it('should show gray neutral indicator for zero change')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'orders', ..., change: 0, changeType: 'neutral' }, valueType: 'positive' }` |
| **검증 포인트** | 1. 중립 아이콘(MinusOutlined) 표시<br>2. 회색(colorTextSecondary) 색상 적용<br>3. '0%' 텍스트 |
| **커버리지 대상** | changeType='neutral' → 회색 (BR-005) |
| **관련 요구사항** | FR-004, BR-005 |

```typescript
it('should show gray neutral indicator for zero change', () => {
  const data: KPICardData = {
    id: 'orders',
    title: '작업지시',
    value: 15,
    unit: '건',
    change: 0,
    changeType: 'neutral',
    icon: 'clipboard'
  }

  render(<KPICard data={data} valueType="positive" />)

  const changeElement = screen.getByTestId('kpi-change-orders')
  expect(changeElement).toBeInTheDocument()

  // 회색 스타일 확인 (neutral = 회색)
  // colorTextSecondary 또는 해당 Ant Design 토큰 색상
  expect(changeElement).toHaveClass('text-gray-500')

  // 증감률 값 확인
  expect(changeElement).toHaveTextContent('0')
})
```

#### UT-007: 값 없음(null) - 대시(-) 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('null handling') -> it('should show dash when value is null')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'efficiency', title: '가동률', value: null, ... } }` |
| **검증 포인트** | 1. 값 영역에 '-' 표시<br>2. 에러 발생하지 않음 |
| **커버리지 대상** | value === null 분기 (BR-009) |
| **관련 요구사항** | BR-009 |

```typescript
it('should show dash when value is null', () => {
  const data: KPICardData = {
    id: 'efficiency',
    title: '가동률',
    value: null as unknown as number, // null 테스트
    unit: '%',
    change: 0,
    changeType: 'neutral',
    icon: 'activity'
  }

  render(<KPICard data={data} />)

  const valueElement = screen.getByTestId('kpi-value-efficiency')
  expect(valueElement).toHaveTextContent('-')
})
```

#### UT-008: 증감률 없음(null) - 미표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('null handling') -> it('should not render change indicator when change is null')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'efficiency', ..., change: null } }` |
| **검증 포인트** | 1. 증감률 영역이 렌더링되지 않음 |
| **커버리지 대상** | change === null 분기 (BR-009) |
| **관련 요구사항** | BR-009 |

```typescript
it('should not render change indicator when change is null', () => {
  const data: KPICardData = {
    id: 'efficiency',
    title: '가동률',
    value: 87.3,
    unit: '%',
    change: null as unknown as number, // null 테스트
    changeType: 'neutral',
    icon: 'activity'
  }

  render(<KPICard data={data} />)

  expect(screen.queryByTestId('kpi-change-efficiency')).not.toBeInTheDocument()
})
```

#### UT-009: 로딩 상태 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('loading state') -> it('should show loading skeleton when loading')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: mockData, loading: true }` |
| **검증 포인트** | 1. Skeleton 또는 Spin 컴포넌트 표시<br>2. 값이 표시되지 않음 |
| **커버리지 대상** | loading === true 분기 |
| **관련 요구사항** | NFR-001 |

```typescript
it('should show loading skeleton when loading', () => {
  const data: KPICardData = {
    id: 'efficiency',
    title: '가동률',
    value: 87.3,
    unit: '%',
    change: 2.1,
    changeType: 'increase',
    icon: 'activity'
  }

  render(<KPICard data={data} loading={true} />)

  // 카드는 렌더링되어야 함
  expect(screen.getByTestId('kpi-card-efficiency')).toBeInTheDocument()

  // Skeleton 또는 Spin이 표시되는지 확인
  expect(screen.getByTestId('kpi-loading-skeleton')).toBeInTheDocument()
})
```

#### UT-010: 천 단위 콤마 포맷팅 (BR-006)

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('formatting') -> it('should format integer with thousand separator')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'production', value: 12345, unit: '개' } }` |
| **검증 포인트** | 12345 → "12,345" 포맷팅 |
| **커버리지 대상** | formatKPIValue() - 정수 분기 (BR-006) |
| **관련 요구사항** | BR-006 |

```typescript
it('should format integer with thousand separator', () => {
  const data: KPICardData = {
    id: 'production',
    title: '금일 생산량',
    value: 12345,
    unit: '개',
    change: 5.0,
    changeType: 'increase',
    icon: 'package'
  }

  render(<KPICard data={data} />)

  // 천 단위 콤마 적용 (BR-006)
  expect(screen.getByTestId('kpi-value-production')).toHaveTextContent('12,345')
})
```

#### UT-010-2: 비율 소수점 1자리 표시 (BR-007)

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('formatting') -> it('should format percentage with one decimal place')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'efficiency', value: 87.35, unit: '%' } }` |
| **검증 포인트** | 87.35 → "87.4" 포맷팅 (반올림) |
| **커버리지 대상** | formatKPIValue() - 비율 분기 (BR-007) |
| **관련 요구사항** | BR-007 |

```typescript
it('should format percentage with one decimal place', () => {
  const data: KPICardData = {
    id: 'efficiency',
    title: '가동률',
    value: 87.35,
    unit: '%',
    change: 2.1,
    changeType: 'increase',
    icon: 'activity'
  }

  render(<KPICard data={data} />)

  // 소수점 1자리 표시 (BR-007)
  expect(screen.getByTestId('kpi-value-efficiency')).toHaveTextContent('87.4')
})
```

#### UT-010-3: 수량/건수 정수 표시 (BR-008)

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('formatting') -> it('should format count as integer')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'orders', value: 15.7, unit: '건' } }` |
| **검증 포인트** | 15.7 → "15" 포맷팅 (소수점 버림) |
| **커버리지 대상** | formatKPIValue() - 건수 분기 (BR-008) |
| **관련 요구사항** | BR-008 |

```typescript
it('should format count as integer', () => {
  const data: KPICardData = {
    id: 'orders',
    title: '작업지시',
    value: 15.7,
    unit: '건',
    change: 0,
    changeType: 'neutral',
    icon: 'clipboard'
  }

  render(<KPICard data={data} />)

  // 정수 표시 (BR-008)
  expect(screen.getByTestId('kpi-value-orders')).toHaveTextContent('15')
})
```

#### UT-011: data-testid 속성 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/dashboard/__tests__/KPICard.test.tsx` |
| **테스트 블록** | `describe('KPICard') -> describe('accessibility') -> it('should render all required data-testid attributes')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ data: { id: 'efficiency', ... } }` |
| **검증 포인트** | 모든 필수 data-testid 속성 존재 확인 (설계 문서 기준 `kpi-card-{id}` 형식) |
| **커버리지 대상** | data-testid 속성 렌더링 |
| **관련 요구사항** | NFR-002 |

```typescript
it('should render all required data-testid attributes', () => {
  const data: KPICardData = {
    id: 'efficiency',
    title: '가동률',
    value: 87.3,
    unit: '%',
    change: 2.1,
    changeType: 'increase',
    icon: 'activity'
  }

  render(<KPICard data={data} valueType="positive" />)

  // 설계 문서 기준 data-testid 형식: kpi-{element}-{id}
  expect(screen.getByTestId('kpi-card-efficiency')).toBeInTheDocument()
  expect(screen.getByTestId('kpi-value-efficiency')).toBeInTheDocument()
  expect(screen.getByTestId('kpi-change-efficiency')).toBeInTheDocument()
  expect(screen.getByTestId('kpi-change-icon-efficiency')).toBeInTheDocument()
})
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

> 설계 문서 010-design.md 기준으로 4개 KPI 카드 테스트

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 대시보드 KPI 카드 **4종** 표시 확인 | 로그인, 대시보드 접속 | 1. 대시보드 페이지 이동 | 가동률, 불량률, 생산량, **작업지시** 카드 표시 | FR-001, FR-002, FR-003, **FR-006** |
| E2E-002 | KPI 값 정확성 및 포맷팅 확인 | 대시보드 접속, mock 데이터 로드 | 1. 각 KPI 카드 값 확인 | mock 데이터와 일치, 천 단위 콤마/소수점 포맷팅 | FR-005, **BR-006, BR-007, BR-008** |
| E2E-003 | 증감률 색상/아이콘 확인 (**긍정/부정 KPI**) | 대시보드 접속 | 1. 긍정 KPI 증가 확인<br>2. **부정 KPI(불량률) 감소 확인** | **불량률 감소 시 녹색** 표시 | FR-004, BR-001~BR-005 |
| E2E-004 | 반응형 레이아웃 확인 | 대시보드 접속 | 1. 데스크톱 크기 확인<br>2. 태블릿 크기 확인<br>3. 모바일 크기 확인 | 각 breakpoint에서 적절한 레이아웃 (4열/2열/1열) | NFR-003 |

### 3.2 테스트 케이스 상세

#### E2E-001: 대시보드 KPI 카드 4종 표시 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-kpi.spec.ts` |
| **테스트명** | `test('대시보드에 4종 KPI 카드가 표시된다')` |
| **사전조건** | 로그인 (fixture 사용), 대시보드 접근 |
| **data-testid 셀렉터** | (설계 문서 기준 `kpi-card-{id}` 형식) |
| - 가동률 카드 | `[data-testid="kpi-card-efficiency"]` |
| - 불량률 카드 | `[data-testid="kpi-card-defect"]` |
| - 생산량 카드 | `[data-testid="kpi-card-production"]` |
| - 작업지시 카드 | `[data-testid="kpi-card-orders"]` |
| **검증 포인트** | **4개** KPI 카드 모두 표시 |
| **스크린샷** | `e2e-001-kpi-cards.png` |
| **관련 요구사항** | FR-001, FR-002, FR-003, **FR-006** |

```typescript
test('대시보드에 4종 KPI 카드가 표시된다', async ({ page }) => {
  // Given: 로그인 및 대시보드 페이지 접속
  await page.goto('/sample/dashboard')
  await page.waitForSelector('[data-testid="dashboard-layout"]')

  // Then: 4종 KPI 카드 확인 (설계 문서 기준 id)
  await expect(page.locator('[data-testid="kpi-card-efficiency"]')).toBeVisible()
  await expect(page.locator('[data-testid="kpi-card-defect"]')).toBeVisible()
  await expect(page.locator('[data-testid="kpi-card-production"]')).toBeVisible()
  await expect(page.locator('[data-testid="kpi-card-orders"]')).toBeVisible()

  // 스크린샷
  await page.screenshot({ path: 'e2e-001-kpi-cards.png' })
})
```

#### E2E-002: KPI 값 정확성 및 포맷팅 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-kpi.spec.ts` |
| **테스트명** | `test('KPI 카드에 mock 데이터 값이 포맷팅되어 표시된다')` |
| **사전조건** | 대시보드 접속, mock-data/dashboard.json 로드 |
| **data-testid 셀렉터** | (설계 문서 기준 `kpi-value-{id}` 형식) |
| - 가동률 값 | `[data-testid="kpi-value-efficiency"]` |
| - 불량률 값 | `[data-testid="kpi-value-defect"]` |
| - 생산량 값 | `[data-testid="kpi-value-production"]` |
| - 작업지시 값 | `[data-testid="kpi-value-orders"]` |
| **검증 포인트** | 1. 값이 mock 데이터와 일치<br>2. 천 단위 콤마 적용 (BR-006)<br>3. 소수점 1자리 적용 (BR-007)<br>4. 정수 표시 (BR-008) |
| **스크린샷** | `e2e-002-kpi-values.png` |
| **관련 요구사항** | FR-005, BR-006, BR-007, BR-008 |

```typescript
test('KPI 카드에 mock 데이터 값이 포맷팅되어 표시된다', async ({ page }) => {
  // Given: 대시보드 페이지 접속
  await page.goto('/sample/dashboard')
  await page.waitForSelector('[data-testid="dashboard-layout"]')

  // Mock 데이터 기대값 (설계 문서 dashboard.json 기준)
  const expectedKPIs = {
    efficiency: { value: '87.3', unit: '%' },     // 소수점 1자리 (BR-007)
    defect: { value: '1.2', unit: '%' },          // 소수점 1자리 (BR-007)
    production: { value: '1,247', unit: '개' },   // 천 단위 콤마 (BR-006)
    orders: { value: '15', unit: '건' }           // 정수 (BR-008)
  }

  // Then: 각 KPI 값 확인 (설계 문서 기준 data-testid)
  await expect(page.locator('[data-testid="kpi-value-efficiency"]')).toContainText(expectedKPIs.efficiency.value)
  await expect(page.locator('[data-testid="kpi-value-defect"]')).toContainText(expectedKPIs.defect.value)
  await expect(page.locator('[data-testid="kpi-value-production"]')).toContainText(expectedKPIs.production.value)
  await expect(page.locator('[data-testid="kpi-value-orders"]')).toContainText(expectedKPIs.orders.value)

  await page.screenshot({ path: 'e2e-002-kpi-values.png' })
})
```

#### E2E-003: 증감률 색상/아이콘 확인 (긍정/부정 KPI)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-kpi.spec.ts` |
| **테스트명** | `test('긍정/부정 KPI에 따라 적절한 색상과 아이콘이 표시된다')` |
| **사전조건** | 대시보드 접속 |
| **data-testid 셀렉터** | (설계 문서 기준 `kpi-change-{id}` 형식) |
| - 가동률 증감률 | `[data-testid="kpi-change-efficiency"]` |
| - 불량률 증감률 | `[data-testid="kpi-change-defect"]` |
| **핵심 검증** | **불량률(부정 KPI) 감소 시 녹색** 표시 (BR-004) |
| **스크린샷** | `e2e-003-change-rates.png` |
| **관련 요구사항** | FR-004, BR-001~BR-005 |

```typescript
test('긍정/부정 KPI에 따라 적절한 색상과 아이콘이 표시된다', async ({ page }) => {
  // Given: 대시보드 페이지 접속
  await page.goto('/sample/dashboard')
  await page.waitForSelector('[data-testid="dashboard-layout"]')

  // 가동률 카드 (긍정 KPI + 증가 → 녹색, BR-001)
  const efficiencyChange = page.locator('[data-testid="kpi-change-efficiency"]')
  await expect(efficiencyChange).toBeVisible()
  // 녹색 스타일 확인 (colorSuccess)
  await expect(efficiencyChange).toHaveCSS('color', 'rgb(82, 196, 26)')

  // 아이콘 확인
  const efficiencyIcon = page.locator('[data-testid="kpi-change-icon-efficiency"]')
  await expect(efficiencyIcon).toBeVisible()

  // **불량률 카드 (부정 KPI + 감소 → 녹색, BR-004) - 핵심 테스트**
  const defectChange = page.locator('[data-testid="kpi-change-defect"]')
  await expect(defectChange).toBeVisible()
  // **녹색 스타일 확인** (부정 KPI + 감소 = 좋음 = 녹색)
  await expect(defectChange).toHaveCSS('color', 'rgb(82, 196, 26)')

  // 작업지시 카드 (neutral → 회색, BR-005)
  const ordersChange = page.locator('[data-testid="kpi-change-orders"]')
  await expect(ordersChange).toBeVisible()

  await page.screenshot({ path: 'e2e-003-change-rates.png' })
})
```

#### E2E-004: 반응형 레이아웃 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/dashboard-kpi.spec.ts` |
| **테스트명** | `test('화면 크기에 따라 KPI 카드 레이아웃이 조정된다')` |
| **사전조건** | 대시보드 접속 |
| **검증 포인트** | 데스크톱(1280px): 4열, 태블릿(768px): 2열, 모바일(375px): 1열 |
| **스크린샷** | `e2e-004-responsive-desktop.png`, `e2e-004-responsive-tablet.png`, `e2e-004-responsive-mobile.png` |
| **관련 요구사항** | NFR-003 |

```typescript
test('화면 크기에 따라 KPI 카드 레이아웃이 조정된다', async ({ page }) => {
  // Desktop (1280px) - 4열 레이아웃
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/sample/dashboard')
  await page.waitForSelector('[data-testid="dashboard-layout"]')
  await page.screenshot({ path: 'e2e-004-responsive-desktop.png' })

  // 4개 KPI 카드가 모두 표시되는지 확인
  const kpiCards = page.locator('[data-testid^="kpi-card-"]')
  await expect(kpiCards).toHaveCount(4)

  // Tablet (768px) - 2열 레이아웃
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.screenshot({ path: 'e2e-004-responsive-tablet.png' })

  // Mobile (375px) - 1열 레이아웃
  await page.setViewportSize({ width: 375, height: 667 })
  await page.screenshot({ path: 'e2e-004-responsive-mobile.png' })

  // 모바일에서도 모든 카드가 표시되는지 확인
  await expect(kpiCards).toHaveCount(4)
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

> 설계 문서 010-design.md 섹션 7.2 기준 KPICardData 인터페이스 적용

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-KPI-EFFICIENCY | 가동률 KPI | `{ id: 'efficiency', title: '가동률', value: 87.3, unit: '%', change: 2.1, changeType: 'increase' }` |
| MOCK-KPI-DEFECT | 불량률 KPI (부정) | `{ id: 'defect', title: '불량률', value: 1.2, unit: '%', change: -0.3, changeType: 'decrease' }` |
| MOCK-KPI-PRODUCTION | 생산량 KPI | `{ id: 'production', title: '금일 생산량', value: 1247, unit: '개', change: 12.5, changeType: 'increase' }` |
| MOCK-KPI-ORDERS | 작업지시 KPI | `{ id: 'orders', title: '작업지시', value: 15, unit: '건', change: 0, changeType: 'neutral' }` |
| MOCK-KPI-NULL-VALUE | 값 없음 케이스 | `{ id: 'efficiency', ..., value: null }` |
| MOCK-KPI-DEFECT-INCREASE | 불량률 증가 (나쁨 → 빨간색) | `{ id: 'defect', ..., change: 0.5, changeType: 'increase' }` |

### 5.2 E2E 테스트용 Mock 데이터 (dashboard.json)

> 설계 문서 기준 kpiCards 배열 구조

```json
{
  "kpiCards": [
    {
      "id": "production",
      "title": "금일 생산량",
      "value": 1247,
      "unit": "개",
      "change": 12.5,
      "changeType": "increase",
      "icon": "package"
    },
    {
      "id": "efficiency",
      "title": "가동률",
      "value": 87.3,
      "unit": "%",
      "change": 2.1,
      "changeType": "increase",
      "icon": "activity"
    },
    {
      "id": "defect",
      "title": "불량률",
      "value": 1.2,
      "unit": "%",
      "change": -0.3,
      "changeType": "decrease",
      "icon": "alert-triangle"
    },
    {
      "id": "orders",
      "title": "작업지시",
      "value": 15,
      "unit": "건",
      "change": 0,
      "changeType": "neutral",
      "icon": "clipboard"
    }
  ]
}
```

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 대시보드 조회 테스트 |
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 대시보드 테스트 |

### 5.4 Mock 데이터 코드

> 설계 문서 기준 KPICardData, KPICardProps 인터페이스 적용

```typescript
// fixtures/kpi-card.fixtures.ts

import { KPICardData, KPICardProps } from '@/types/dashboard'

// 설계 문서 기준 Mock 데이터
export const mockEfficiencyKPI: KPICardData = {
  id: 'efficiency',
  title: '가동률',
  value: 87.3,
  unit: '%',
  change: 2.1,
  changeType: 'increase',
  icon: 'activity'
}

export const mockDefectKPI: KPICardData = {
  id: 'defect',
  title: '불량률',
  value: 1.2,
  unit: '%',
  change: -0.3,
  changeType: 'decrease',
  icon: 'alert-triangle'
}

export const mockProductionKPI: KPICardData = {
  id: 'production',
  title: '금일 생산량',
  value: 1247,
  unit: '개',
  change: 12.5,
  changeType: 'increase',
  icon: 'package'
}

export const mockOrdersKPI: KPICardData = {
  id: 'orders',
  title: '작업지시',
  value: 15,
  unit: '건',
  change: 0,
  changeType: 'neutral',
  icon: 'clipboard'
}

// 부정 KPI 증가 케이스 (BR-003 테스트용)
export const mockDefectIncreaseKPI: KPICardData = {
  id: 'defect',
  title: '불량률',
  value: 1.7,
  unit: '%',
  change: 0.5,
  changeType: 'increase',
  icon: 'alert-triangle'
}

// 값 없음 케이스
export const mockNullValueKPI: KPICardData = {
  id: 'efficiency',
  title: '가동률',
  value: null as unknown as number,
  unit: '%',
  change: 0,
  changeType: 'neutral',
  icon: 'activity'
}

// 로딩 상태 Props
export const mockLoadingProps: KPICardProps = {
  data: mockEfficiencyKPI,
  loading: true
}

// 전체 대시보드 KPI 데이터
export const mockDashboardKPIs: KPICardData[] = [
  mockProductionKPI,
  mockEfficiencyKPI,
  mockDefectKPI,
  mockOrdersKPI
]
```

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의
> **설계 문서 010-design.md 섹션 11.8 기준**: `kpi-{element}-{id}` 형식

### 6.1 KPICard 컴포넌트 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `kpi-card-{id}` | KPI 카드 컨테이너 | 특정 KPI 카드 식별 (예: `kpi-card-efficiency`) |
| `kpi-value-{id}` | KPI 값 표시 영역 | 숫자 값 확인 (예: `kpi-value-production`) |
| `kpi-change-{id}` | 증감률 표시 영역 | 증감률 값 및 스타일 확인 |
| `kpi-change-icon-{id}` | 증감률 아이콘 | 화살표 아이콘 확인 |
| `kpi-card-group` | KPI 카드 그룹 컨테이너 | 그룹 렌더링 확인 |
| `kpi-loading-skeleton` | 로딩 스켈레톤 | 로딩 상태 확인 |
| `kpi-error-result` | 에러 상태 | 에러 표시 확인 |

### 6.2 KPI ID별 data-testid (설계 문서 기준)

| data-testid | 설명 |
|-------------|------|
| `kpi-card-efficiency` | 가동률 카드 |
| `kpi-card-defect` | 불량률 카드 |
| `kpi-card-production` | 생산량 카드 |
| `kpi-card-orders` | **작업지시 카드** |

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

> 설계 문서 010-design.md 기준 긍정/부정 KPI 유형 비즈니스 규칙 반영

| 요구사항 ID | 요구사항 설명 | 단위 테스트 | E2E 테스트 | 매뉴얼 테스트 |
|-------------|--------------|------------|-----------|--------------|
| FR-001 | 가동률 카드 표시 | UT-001 | E2E-001, E2E-002 | TC-001 |
| FR-002 | 불량률 카드 표시 | UT-002 | E2E-001, E2E-002 | TC-001 |
| FR-003 | 생산량 카드 표시 | UT-003 | E2E-001, E2E-002 | TC-001 |
| FR-004 | 증감률 표시 (화살표 + 색상) | UT-004~UT-006 | E2E-003 | TC-002 |
| FR-005 | mock-data/dashboard.json 데이터 로드 | - | E2E-002 | - |
| **FR-006** | **작업지시 카드 표시** | **UT-006** | **E2E-001, E2E-002** | **TC-001** |
| BR-001 | 긍정 KPI + increase → 녹색 | UT-004 | E2E-003 | TC-002 |
| BR-002 | 긍정 KPI + decrease → 빨간색 | UT-004-2 | E2E-003 | TC-002 |
| BR-003 | **부정 KPI(불량률) + increase → 빨간색** | UT-005 | E2E-003 | TC-002 |
| BR-004 | **부정 KPI(불량률) + decrease → 녹색** | UT-005-2 | E2E-003 | TC-002 |
| BR-005 | changeType='neutral' → 회색 | UT-006 | - | TC-002 |
| BR-006 | 천 단위 콤마 포맷팅 | UT-010 | E2E-002 | - |
| BR-007 | 비율 소수점 1자리 표시 | UT-010-2 | E2E-002 | - |
| BR-008 | 수량/건수 정수 표시 | UT-010-3 | E2E-002 | - |
| BR-009 | 값 없음 시 '-' 표시 | UT-007, UT-008 | - | - |
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
| 1.1 | 2026-01-21 | Claude | 설계 리뷰 반영: 긍정/부정 KPI 색상 로직, 작업지시 카드, data-testid, BR-006~009 추가 |

---

<!--
Task: TSK-07-02 KPI 카드 위젯
Domain: frontend
Category: development
Created: 2026-01-21
-->
