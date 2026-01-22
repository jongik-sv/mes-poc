# TSK-07-03: 차트 위젯 - 구현 보고서

## 1. 구현 개요

| 항목 | 내용 |
|------|------|
| Task ID | TSK-07-03 |
| Task 명 | 차트 위젯 |
| 도메인 | frontend |
| 구현일 | 2026-01-22 |
| 구현 방식 | TDD (Test-Driven Development) |

## 2. 구현 범위

### 2.1 신규 파일

| 파일 경로 | 설명 |
|----------|------|
| `lib/theme/chart-theme.ts` | 차트 테마 설정 및 성능 색상 유틸리티 |
| `components/dashboard/charts/utils.ts` | 차트 데이터 변환 유틸리티 함수 |
| `components/dashboard/charts/ChartWrapper.tsx` | 공통 차트 래퍼 컴포넌트 |
| `components/dashboard/charts/LineChart.tsx` | 시간별 생산량 라인 차트 |
| `components/dashboard/charts/BarChart.tsx` | 라인별 실적 그룹 바 차트 |
| `components/dashboard/charts/PieChart.tsx` | 제품별 비율 파이 차트 |
| `components/dashboard/charts/index.ts` | 차트 모듈 내보내기 |
| `components/dashboard/charts/__tests__/*.ts` | 단위 테스트 파일 (5개) |

### 2.2 수정 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `components/dashboard/types.ts` | ProductRatioItem 타입 추가 |
| `mock-data/dashboard.json` | productRatio 데이터 추가 |
| `components/dashboard/ChartSection.tsx` | 실제 차트 컴포넌트 통합 |

### 2.3 의존성 추가

```json
{
  "@ant-design/charts": "^2.2.7"
}
```

## 3. 구현 상세

### 3.1 차트 테마 설정 (chart-theme.ts)

Ant Design 테마 토큰과 통합된 차트 테마 설정:

```typescript
// 라이트/다크 테마 토큰 기반 차트 색상
export function getChartColors(isDark: boolean = false): string[] {
  const tokens = isDark ? darkThemeTokens : themeTokens
  return [
    tokens.colorPrimary,
    tokens.colorSuccess,
    tokens.colorWarning,
    tokens.colorError,
    tokens.colorInfo,
  ]
}

// BR-002: 성능 색상 코딩
export function getPerformanceColor(actual: number, target: number, isDark: boolean = false): string {
  const rate = actual / target
  if (rate >= 0.9) return tokens.colorPrimary  // 정상 (90% 이상)
  if (rate >= 0.7) return tokens.colorWarning  // 경고 (70-90%)
  return tokens.colorError                     // 위험 (70% 미만)
}
```

### 3.2 유틸리티 함수 (utils.ts)

| 함수 | 설명 | 비즈니스 규칙 |
|------|------|--------------|
| `transformLinePerformance` | 라인 실적 데이터를 차트 형식으로 변환 | - |
| `groupSmallItems` | 소수 항목을 "기타"로 그룹화 | BR-003 |
| `formatNumber` | 숫자를 K/M 단위로 포맷 | BR-004 |
| `limitDataPoints` | 데이터 포인트 수 제한 | - |

### 3.3 ChartWrapper 컴포넌트

공통 상태 처리를 담당하는 래퍼 컴포넌트:

```typescript
interface ChartWrapperProps {
  name: string
  height?: number
  loading?: boolean
  error?: Error | null
  isEmpty?: boolean
  onRetry?: () => void
  children: React.ReactNode
}
```

**상태 처리 우선순위**: 로딩 > 에러 > 빈 데이터 > 정상

### 3.4 LineChart 컴포넌트

시간별 생산량 추이를 표시하는 라인 차트:

```typescript
interface LineChartProps {
  data: ProductionTrendItem[]
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
  height?: number
}
```

**특징**:
- @ant-design/charts의 Line 컴포넌트 사용
- X축: time (시간), Y축: value (생산량)
- 테마 토큰 기반 색상 적용

### 3.5 BarChart 컴포넌트

라인별 생산 실적을 비교하는 그룹 바 차트:

```typescript
interface BarChartProps {
  data: LinePerformanceItem[]
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
  height?: number
  showPerformanceColor?: boolean
}
```

**특징**:
- @ant-design/charts의 Column 컴포넌트 사용
- 그룹화: 실적(actual) vs 목표(target)
- BR-002: showPerformanceColor=true 시 성능 기반 색상 적용

### 3.6 PieChart 컴포넌트

제품별 생산 비율을 표시하는 파이 차트:

```typescript
interface PieChartProps {
  data: ProductRatioItem[]
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
  height?: number
}
```

**특징**:
- @ant-design/charts의 Pie 컴포넌트 사용
- BR-003: 5개 초과 항목은 "기타"로 자동 그룹화
- 도넛 스타일 (innerRadius: 0.6)

## 4. 비즈니스 규칙 구현

| 규칙 ID | 설명 | 구현 위치 |
|---------|------|----------|
| BR-002 | 목표 대비 실적 성능 색상 코딩 | `chart-theme.ts`, `BarChart.tsx` |
| BR-003 | 파이 차트 5개 항목 제한 + 기타 그룹화 | `utils.ts`, `PieChart.tsx` |
| BR-004 | 숫자 포맷팅 (K, M 단위) | `utils.ts` |

## 5. 테스트 결과

| 항목 | 결과 |
|------|------|
| 총 테스트 | 68개 |
| 통과 | 68개 (100%) |
| 실패 | 0개 |
| 실행 시간 | 3.31s |

상세 결과는 [070-tdd-test-results.md](./070-tdd-test-results.md) 참조.

## 6. 파일 구조

```
mes-portal/
├── lib/
│   └── theme/
│       └── chart-theme.ts          # 차트 테마 설정
├── components/
│   └── dashboard/
│       ├── types.ts                # ProductRatioItem 추가
│       ├── ChartSection.tsx        # 차트 섹션 (수정)
│       └── charts/
│           ├── index.ts            # 모듈 내보내기
│           ├── utils.ts            # 유틸리티 함수
│           ├── ChartWrapper.tsx    # 공통 래퍼
│           ├── LineChart.tsx       # 라인 차트
│           ├── BarChart.tsx        # 바 차트
│           ├── PieChart.tsx        # 파이 차트
│           └── __tests__/
│               ├── utils.test.ts
│               ├── ChartWrapper.test.tsx
│               ├── LineChart.test.tsx
│               ├── BarChart.test.tsx
│               └── PieChart.test.tsx
└── mock-data/
    └── dashboard.json              # productRatio 데이터 추가
```

## 7. 사용 예시

### 7.1 ChartSection에서 사용

```tsx
import { LineChart, BarChart } from './charts'

<ChartSection
  productionTrend={dashboardData.productionTrend}
  linePerformance={dashboardData.linePerformance}
  loading={loading}
  error={error}
/>
```

### 7.2 개별 차트 사용

```tsx
// 라인 차트
<LineChart data={trendData} height={300} />

// 바 차트 (성능 색상 포함)
<BarChart data={performanceData} showPerformanceColor={true} />

// 파이 차트
<PieChart data={ratioData} height={300} />
```

## 8. 알려진 제한 사항

1. **차트 렌더링**: @ant-design/charts는 클라이언트 사이드에서만 렌더링됨 ('use client' 필수)
2. **테마 전환**: next-themes의 resolvedTheme 변경 시 차트 리렌더링 발생
3. **반응형**: 높이는 고정, 너비는 부모 컨테이너 100%

## 9. 향후 개선 사항

1. 차트 애니메이션 옵션 추가
2. 툴팁 커스터마이징
3. 차트 데이터 내보내기 기능
4. 실시간 데이터 업데이트 지원
