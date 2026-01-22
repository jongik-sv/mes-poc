// components/dashboard/types.ts
// 대시보드 관련 타입 정의 (010-design.md 섹션 7.3 기준)

/**
 * KPI 변화 유형
 * - increase: 값 증가
 * - decrease: 값 감소
 * - neutral: 변동 없음
 * - unchanged: 변동 없음 (legacy 호환)
 */
export type KPIChangeType = 'increase' | 'decrease' | 'neutral' | 'unchanged'

/**
 * KPI 유형 (긍정/부정 판단용)
 * - positive: 값 증가가 좋은 KPI (생산량, 가동률, 작업지시)
 * - negative: 값 감소가 좋은 KPI (불량률)
 */
export type KPIValueType = 'positive' | 'negative'

/**
 * KPI 데이터 타입
 */
export interface KPIData {
  value: number
  unit: string
  change: number
  changeType: KPIChangeType
}

/**
 * 대시보드 KPI 전체 데이터
 */
export interface DashboardKPI {
  operationRate: KPIData    // 가동률
  defectRate: KPIData       // 불량률
  productionVolume: KPIData // 생산량
  achievementRate: KPIData  // 달성률
}

/**
 * 생산량 추이 데이터
 */
export interface ProductionTrendItem {
  time: string
  value: number
}

/**
 * 라인별 실적 데이터
 */
export interface LinePerformanceItem {
  line: string
  actual: number
  target: number
}

/**
 * 제품별 비율 데이터
 */
export interface ProductRatioItem {
  product: string
  value: number
  percentage: number
}

/**
 * 최근 활동 데이터
 */
export interface ActivityItem {
  id: string
  time: string
  type: 'equipment' | 'quality' | 'production' | 'system'
  typeLabel: string
  message: string
}

/**
 * 대시보드 전체 데이터
 */
export interface DashboardData {
  kpi: DashboardKPI
  productionTrend: ProductionTrendItem[]
  linePerformance: LinePerformanceItem[]
  productRatio?: ProductRatioItem[]
  recentActivities: ActivityItem[]
}

/**
 * WidgetCard Props
 */
export interface WidgetCardProps {
  title: string
  extra?: React.ReactNode
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
  children: React.ReactNode
  minHeight?: number
  className?: string
  'data-testid'?: string
}

/**
 * KPI Card Props
 */
export interface KPICardProps {
  title: string
  data: KPIData
  /**
   * @deprecated invertTrend 대신 valueType 사용 권장
   * 불량률처럼 감소가 긍정인 경우 invertTrend=true 또는 valueType='negative'
   */
  invertTrend?: boolean
  /**
   * KPI 유형 (기본값: 'positive')
   * - positive: 증가가 좋음 (녹색), 감소가 나쁨 (빨간색)
   * - negative: 감소가 좋음 (녹색), 증가가 나쁨 (빨간색)
   */
  valueType?: KPIValueType
  loading?: boolean
  'data-testid'?: string
}
