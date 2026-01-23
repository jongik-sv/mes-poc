/**
 * @file types.ts
 * @description ProcessManagement 화면 타입 정의
 * @task TSK-06-18
 */

/**
 * 공정 상태 타입
 */
export type ProcessStatus = 'active' | 'inactive'

/**
 * 설비 상태 타입
 */
export type EquipmentStatus = 'running' | 'stopped' | 'error' | 'maintenance'

/**
 * 변경 이력 액션 타입
 */
export type HistoryAction = 'create' | 'update' | 'delete'

/**
 * 설비 데이터 인터페이스
 */
export interface EquipmentData {
  id: string
  code: string
  name: string
  status: EquipmentStatus
}

/**
 * 변경 이력 데이터 인터페이스
 */
export interface HistoryData {
  id: string
  action: HistoryAction
  timestamp: string
  user: string
  changes?: string
}

/**
 * 공정 데이터 인터페이스
 */
export interface ProcessData {
  id: string
  code: string
  name: string
  status: ProcessStatus
  order: number
  description?: string
  equipmentCount: number
  createdAt: string
  updatedAt: string
  equipment?: EquipmentData[]
  history?: HistoryData[]
  [key: string]: unknown
}

/**
 * 공정 폼 값 인터페이스
 */
export interface ProcessFormValues {
  code: string
  name: string
  status: ProcessStatus
  order?: number
  description?: string
  [key: string]: unknown
}

/**
 * 검색 파라미터 인터페이스
 */
export interface ProcessSearchParams {
  code?: string
  name?: string
  status?: ProcessStatus | ''
  [key: string]: unknown
}

/**
 * 화면 모드 타입
 */
export type ViewMode = 'list' | 'detail' | 'form'

/**
 * 폼 모드 타입
 */
export type FormMode = 'create' | 'edit'

/**
 * 상태 라벨
 */
export const STATUS_LABELS: Record<ProcessStatus, string> = {
  active: '활성',
  inactive: '비활성',
}

/**
 * 상태 색상
 */
export const STATUS_COLORS: Record<ProcessStatus, string> = {
  active: 'green',
  inactive: 'default',
}

/**
 * 설비 상태 라벨
 */
export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  running: '가동중',
  stopped: '정지',
  error: '고장',
  maintenance: '점검',
}

/**
 * 설비 상태 색상
 */
export const EQUIPMENT_STATUS_COLORS: Record<EquipmentStatus, string> = {
  running: 'green',
  stopped: 'default',
  error: 'red',
  maintenance: 'orange',
}

/**
 * 이력 액션 라벨
 */
export const HISTORY_ACTION_LABELS: Record<HistoryAction, string> = {
  create: '생성',
  update: '수정',
  delete: '삭제',
}

/**
 * 이력 액션 색상
 */
export const HISTORY_ACTION_COLORS: Record<HistoryAction, string> = {
  create: 'green',
  update: 'blue',
  delete: 'red',
}
