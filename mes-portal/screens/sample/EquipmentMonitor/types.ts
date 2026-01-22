// screens/sample/EquipmentMonitor/types.ts
// 설비 모니터링 카드뷰 타입 정의 (TSK-06-10)

/**
 * 설비 상태 열거형
 */
export type EquipmentStatus = 'RUNNING' | 'STOPPED' | 'FAULT' | 'MAINTENANCE'

/**
 * 라인 정보
 */
export interface Line {
  id: string
  name: string
}

/**
 * 설비 실시간 지표
 */
export interface EquipmentMetrics {
  efficiency: number        // 가동률 (%)
  todayProduction: number   // 금일 생산량 (개)
  targetProduction: number  // 목표 생산량 (개)
  defectCount: number       // 불량 건수 (건)
}

/**
 * 점검 정보
 */
export interface MaintenanceInfo {
  lastMaintenanceAt: string    // 마지막 점검일
  nextMaintenanceAt: string    // 다음 점검 예정일
  maintenanceManager: string   // 점검 담당자
}

/**
 * 상태 변경 이력
 */
export interface StatusHistory {
  timestamp: string
  previousStatus: EquipmentStatus
  newStatus: EquipmentStatus
  reason: string
}

/**
 * 설비 데이터
 */
export interface Equipment {
  id: string
  code: string
  name: string
  type: string
  typeLabel: string
  lineId: string
  lineName: string
  location: string
  status: EquipmentStatus
  statusLabel: string
  statusChangedAt: string
  manufacturer: string
  installedAt: string
  metrics: EquipmentMetrics
  maintenance: MaintenanceInfo
  operator?: string
  errorCode?: string
  errorMessage?: string
  maintenanceNote?: string
  history: StatusHistory[]
}

/**
 * 설비 목록 응답 타입
 */
export interface EquipmentListResponse {
  lines: Line[]
  equipment: Equipment[]
  total: number
}

/**
 * EquipmentCard Props
 */
export interface EquipmentCardProps {
  equipment: Equipment
  onClick?: (equipment: Equipment) => void
  loading?: boolean
}

/**
 * EquipmentDetailDrawer Props
 */
export interface EquipmentDetailDrawerProps {
  equipment: Equipment | null
  open: boolean
  onClose: () => void
}

/**
 * 필터 상태
 */
export interface EquipmentFilterState {
  status: EquipmentStatus | 'all'
  lineId: string
}

/**
 * EquipmentFilter Props
 */
export interface EquipmentFilterProps {
  filter: EquipmentFilterState
  lines: Line[]
  onFilterChange: (filter: EquipmentFilterState) => void
  onReset: () => void
}

/**
 * 상태 요약 Props
 */
export interface StatusSummaryProps {
  counts: Record<EquipmentStatus, number>
}

/**
 * 상태별 색상 매핑
 */
export const STATUS_COLORS: Record<EquipmentStatus, string> = {
  RUNNING: 'green',
  STOPPED: 'default',
  FAULT: 'red',
  MAINTENANCE: 'gold',
}

/**
 * 상태별 라벨 매핑
 */
export const STATUS_LABELS: Record<EquipmentStatus, string> = {
  RUNNING: '가동',
  STOPPED: '정지',
  FAULT: '고장',
  MAINTENANCE: '점검',
}

/**
 * 상태별 배경색 매핑
 */
export const STATUS_BG_COLORS: Record<EquipmentStatus, { light: string; dark: string }> = {
  RUNNING: { light: '#F6FFED', dark: '#162312' },
  STOPPED: { light: '#FAFAFA', dark: '#262626' },
  FAULT: { light: '#FFF2F0', dark: '#2A1215' },
  MAINTENANCE: { light: '#FFFBE6', dark: '#2B2111' },
}

/**
 * 상태별 테두리색 매핑
 */
export const STATUS_BORDER_COLORS: Record<EquipmentStatus, string> = {
  RUNNING: '#52C41A',
  STOPPED: '#D9D9D9',
  FAULT: '#FF4D4F',
  MAINTENANCE: '#FAAD14',
}
