// screens/sample/WorkCalendar/types.ts
// 작업 일정 캘린더 타입 정의 (TSK-06-11)

import type { Dayjs } from 'dayjs'

/**
 * 일정 유형 코드
 */
export type ScheduleTypeCode = 'WORK' | 'MAINTENANCE' | 'URGENT' | 'MEETING' | 'TRAINING'

/**
 * 캘린더 뷰 모드
 */
export type ViewMode = 'month' | 'week' | 'day'

/**
 * 일정 유형 정보
 */
export interface ScheduleType {
  code: ScheduleTypeCode
  name: string
  color: string
}

/**
 * 일정 데이터
 */
export interface Schedule {
  id: string
  title: string
  type: ScheduleTypeCode
  start: string
  end: string
  description?: string
  assignee?: string
  allDay: boolean
}

/**
 * 일정 폼 데이터
 */
export interface ScheduleFormData {
  title: string
  type: ScheduleTypeCode
  dateRange: [Dayjs, Dayjs] | null
  startTime: Dayjs | null
  endTime: Dayjs | null
  description?: string
  assignee?: string
  allDay: boolean
}

/**
 * 일정 Mock 데이터 구조
 */
export interface ScheduleMockData {
  scheduleTypes: ScheduleType[]
  schedules: Schedule[]
}

/**
 * WorkCalendar 컴포넌트 Props
 */
export interface WorkCalendarProps {
  defaultViewMode?: ViewMode
  defaultDate?: Dayjs
}

/**
 * ScheduleDetailModal Props
 */
export interface ScheduleDetailModalProps {
  open: boolean
  schedule: Schedule | null
  scheduleTypes: ScheduleType[]
  onClose: () => void
  onEdit: (schedule: Schedule) => void
  onDelete: (schedule: Schedule) => void
}

/**
 * ScheduleFormModal Props
 */
export interface ScheduleFormModalProps {
  open: boolean
  mode: 'add' | 'edit'
  schedule: Schedule | null
  scheduleTypes: ScheduleType[]
  onClose: () => void
  onSave: (data: ScheduleFormData) => void
  initialDate?: Dayjs
}

/**
 * 일정 유형별 색상 매핑
 */
export const SCHEDULE_TYPE_COLORS: Record<ScheduleTypeCode, string> = {
  WORK: '#52C41A',
  MAINTENANCE: '#FA8C16',
  URGENT: '#FF4D4F',
  MEETING: '#1677FF',
  TRAINING: '#722ED1',
}

/**
 * 일정 유형별 라벨 매핑
 */
export const SCHEDULE_TYPE_LABELS: Record<ScheduleTypeCode, string> = {
  WORK: '작업일정',
  MAINTENANCE: '정기점검',
  URGENT: '긴급작업',
  MEETING: '회의',
  TRAINING: '교육',
}

/**
 * 뷰 모드별 라벨 매핑
 */
export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  month: '월간',
  week: '주간',
  day: '일간',
}
