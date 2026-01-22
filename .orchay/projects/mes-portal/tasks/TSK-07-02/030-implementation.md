# TSK-07-02: KPI 카드 위젯 - 구현 보고서

## 1. 구현 개요

| 항목 | 내용 |
|------|------|
| Task ID | TSK-07-02 |
| Task명 | KPI 카드 위젯 |
| 구현 방식 | TDD (Test-Driven Development) |
| 구현 일시 | 2026-01-22 |
| 상태 | ✅ 구현 완료 |

## 2. 구현 범위

### 2.1 구현된 컴포넌트

| 컴포넌트 | 파일 경로 | 설명 |
|----------|-----------|------|
| KPICard | `components/dashboard/KPICard.tsx` | KPI 지표 카드 (개선) |
| KPICardSection | `components/dashboard/KPICardSection.tsx` | KPI 카드 영역 (개선) |
| types | `components/dashboard/types.ts` | 타입 정의 (확장) |

### 2.2 테스트 파일

| 테스트 파일 | 테스트 수 | 커버리지 |
|-------------|-----------|----------|
| `__tests__/KPICard.test.tsx` | 18 | 91.66% |

## 3. 주요 구현 내용

### 3.1 타입 확장 (`types.ts`)

```typescript
// 새로 추가된 타입
export type KPIChangeType = 'increase' | 'decrease' | 'neutral' | 'unchanged'
export type KPIValueType = 'positive' | 'negative'

// KPICardProps 확장
export interface KPICardProps {
  title: string
  data: KPIData
  /** @deprecated valueType 사용 권장 */
  invertTrend?: boolean
  valueType?: KPIValueType  // NEW: 'positive' | 'negative'
  loading?: boolean         // NEW: 로딩 상태
  'data-testid'?: string
}
```

### 3.2 KPICard 컴포넌트 주요 함수

#### 3.2.1 값 포맷팅 (`formatKPIValue`)

```typescript
function formatKPIValue(value: number | null | undefined, unit: string): string {
  // BR-009: null/undefined → '-'
  if (value === null || value === undefined) return '-'

  // BR-007: 비율 → 소수점 1자리
  if (unit === '%') return value.toFixed(1)

  // BR-008: 수량/건수 → 정수 + BR-006: 천단위 콤마
  if (unit === '개' || unit === '건' || unit === 'EA') {
    return Math.floor(value).toLocaleString('ko-KR')
  }

  // BR-006: 1000 이상 정수 → 천단위 콤마
  if (value >= 1000 && Number.isInteger(value)) {
    return value.toLocaleString('ko-KR')
  }

  return String(value)
}
```

#### 3.2.2 색상 결정 (`getChangeColor`)

```typescript
function getChangeColor(
  changeType: KPIChangeType,
  valueType: KPIValueType = 'positive',
  invertTrend: boolean = false
): string {
  // BR-005: neutral/unchanged → 기본색
  if (changeType === 'neutral' || changeType === 'unchanged') return 'inherit'

  const isPositiveChange = changeType === 'increase'

  // invertTrend 레거시 호환
  const effectiveValueType = invertTrend
    ? (valueType === 'positive' ? 'negative' : 'positive')
    : valueType

  const isPositiveKPI = effectiveValueType === 'positive'

  // BR-001~004: 색상 결정 로직
  if (isPositiveChange === isPositiveKPI) {
    return '#52c41a' // success (녹색)
  } else {
    return '#ff4d4f' // error (빨간색)
  }
}
```

### 3.3 KPICardSection 개선

```typescript
const kpiItems: KPIItem[] = [
  { key: 'operation-rate', title: '가동률', valueType: 'positive', ... },
  { key: 'defect-rate', title: '불량률', valueType: 'negative', ... },  // 불량률은 negative
  { key: 'production-volume', title: '생산량', valueType: 'positive', ... },
  { key: 'achievement-rate', title: '달성률', valueType: 'positive', ... },
]
```

## 4. 비즈니스 룰 구현

| BR ID | 설명 | 구현 위치 | 상태 |
|-------|------|-----------|------|
| BR-001 | 긍정 KPI + 증가 = 녹색 | `getChangeColor()` | ✅ |
| BR-002 | 긍정 KPI + 감소 = 빨간색 | `getChangeColor()` | ✅ |
| BR-003 | 부정 KPI + 증가 = 빨간색 | `getChangeColor()` | ✅ |
| BR-004 | 부정 KPI + 감소 = 녹색 | `getChangeColor()` | ✅ |
| BR-005 | neutral/unchanged = 기본색 | `getChangeColor()` | ✅ |
| BR-006 | 천단위 콤마 포맷 | `formatKPIValue()` | ✅ |
| BR-007 | 비율 소수점 1자리 | `formatKPIValue()` | ✅ |
| BR-008 | 수량/건수 정수 표시 | `formatKPIValue()` | ✅ |
| BR-009 | null값 대시 표시 | `formatKPIValue()` | ✅ |

## 5. 설계 문서 준수 현황

### 5.1 010-design.md 요구사항

| 요구사항 | 상태 | 비고 |
|----------|------|------|
| KPICard Props 인터페이스 | ✅ | valueType, loading 추가 |
| KPICardSection 반응형 그리드 | ✅ | xs=12, lg=6 |
| 증감률 색상 로직 | ✅ | BR-001~005 구현 |
| 포맷팅 규칙 | ✅ | BR-006~009 구현 |
| 로딩 상태 (Skeleton) | ✅ | Ant Design Skeleton 사용 |

### 5.2 UI 설계 준수

| UI 요소 | 설계 | 구현 | 상태 |
|---------|------|------|------|
| 카드 패딩 | 16px 20px | `body: { padding: '16px 20px' }` | ✅ |
| 값 폰트 크기 | 28px | `fontSize: 28` | ✅ |
| 값 폰트 굵기 | 600 | `fontWeight: 600` | ✅ |
| 타이틀 스타일 | 보조 텍스트 | `Text type="secondary"` | ✅ |
| 호버 효과 | hoverable | `Card hoverable` | ✅ |

## 6. 레거시 호환성

### 6.1 invertTrend 속성 지원

기존 `invertTrend` 속성은 deprecated 처리하되, 하위 호환성을 위해 계속 동작합니다.

```typescript
// 기존 코드 (계속 동작)
<KPICard title="불량률" data={data} invertTrend={true} />

// 새로운 권장 방식
<KPICard title="불량률" data={data} valueType="negative" />
```

### 6.2 changeType 확장

기존 `increase`, `decrease`, `unchanged`에 `neutral` 추가:

```typescript
type KPIChangeType = 'increase' | 'decrease' | 'neutral' | 'unchanged'
```

## 7. 테스트 결과

| 구분 | 값 |
|------|-----|
| 총 테스트 수 | 18 |
| 통과 | 18 |
| 실패 | 0 |
| Line Coverage | 91.66% |
| Branch Coverage | 90.56% |
| Function Coverage | 100% |

## 8. 파일 변경 목록

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `components/dashboard/types.ts` | 수정 | KPIChangeType, KPIValueType 추가 |
| `components/dashboard/KPICard.tsx` | 수정 | 포맷팅 함수, 색상 로직 개선 |
| `components/dashboard/KPICardSection.tsx` | 수정 | valueType 적용 |
| `components/dashboard/__tests__/KPICard.test.tsx` | 수정 | 18개 테스트 케이스 |

## 9. 결론

TSK-07-02 KPI 카드 위젯 구현이 완료되었습니다.

- **TDD 방식 적용**: Red-Green 사이클로 테스트 우선 개발
- **설계 문서 준수**: 010-design.md 요구사항 100% 구현
- **비즈니스 룰 구현**: BR-001~009 전체 구현 및 테스트 검증
- **레거시 호환성**: invertTrend 속성 하위 호환 유지
- **품질 기준 달성**: 커버리지 목표 초과 달성

---
*작성일: 2026-01-22*
*작성자: Claude Code*
