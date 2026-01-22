// components/dashboard/types.ts
// 대시보드 관련 타입 정의 (010-design.md 섹션 7.3 기준)

/**
 * KPI 데이터 타입
 */
export interface KPIData {
  value: number
  unit: string
  change: number
  changeType: 'increase' | 'decrease' | 'unchanged'
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
  invertTrend?: boolean // 불량률처럼 감소가 긍정인 경우
  'data-testid'?: string
}
