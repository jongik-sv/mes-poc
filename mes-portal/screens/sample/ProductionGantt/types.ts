// screens/sample/ProductionGantt/types.ts
// 생산 계획 간트 차트 타입 정의 (TSK-06-14)

/**
 * 작업 상태
 */
export type PlanStatus = 'planned' | 'in_progress' | 'completed' | 'delayed'

/**
 * 작업 우선순위
 */
export type PlanPriority = 'high' | 'medium' | 'low'

/**
 * 타임라인 스케일
 */
export type TimelineScale = 'day' | 'week' | 'month'

/**
 * 생산 계획 데이터
 */
export interface ProductionPlan {
  id: string
  name: string
  productCode: string
  productName: string
  quantity: number
  unit: string
  startDate: string
  endDate: string
  progress: number
  status: PlanStatus
  line: string
  priority: PlanPriority
  color?: string
}

/**
 * 생산 계획 데이터 전체 구조
 */
export interface ProductionPlanData {
  plans: ProductionPlan[]
  meta: {
    totalCount: number
    dateRange: {
      start: string
      end: string
    }
  }
}

/**
 * 바 위치 계산 결과
 */
export interface BarPosition {
  left: number
  width: number
}

/**
 * 상태별 색상 매핑
 */
export const STATUS_COLORS: Record<PlanStatus, string> = {
  planned: '#8c8c8c',
  in_progress: '#1677ff',
  completed: '#52c41a',
  delayed: '#ff4d4f',
}

/**
 * 상태별 레이블
 */
export const STATUS_LABELS: Record<PlanStatus, string> = {
  planned: '계획됨',
  in_progress: '진행중',
  completed: '완료',
  delayed: '지연',
}

/**
 * 스케일별 레이블
 */
export const SCALE_LABELS: Record<TimelineScale, string> = {
  day: '일간',
  week: '주간',
  month: '월간',
}

/**
 * ProductionGantt 컴포넌트 Props
 */
export interface ProductionGanttProps {
  /** 초기 스케일 (기본: week) */
  defaultScale?: TimelineScale
}
