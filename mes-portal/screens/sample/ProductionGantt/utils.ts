// screens/sample/ProductionGantt/utils.ts
// 생산 계획 간트 차트 유틸리티 함수 (TSK-06-14)

import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import type { ProductionPlan, TimelineScale, BarPosition, PlanStatus } from './types'
import { STATUS_COLORS } from './types'

dayjs.extend(isoWeek)

/**
 * 상태별 색상 반환
 * @param status 작업 상태
 * @returns 색상 코드
 */
export function getStatusColor(status: PlanStatus): string {
  return STATUS_COLORS[status] || STATUS_COLORS.planned
}

/**
 * 바 위치 계산
 * @param startDate 작업 시작일
 * @param endDate 작업 종료일
 * @param viewStart 뷰 시작일
 * @param scale 타임라인 스케일
 * @param cellWidth 셀 너비
 * @returns 바 위치 (left, width)
 */
export function calculateBarPosition(
  startDate: string,
  endDate: string,
  viewStart: dayjs.Dayjs,
  scale: TimelineScale,
  cellWidth: number
): BarPosition {
  const start = dayjs(startDate)
  const end = dayjs(endDate)

  let startOffset: number
  let duration: number

  switch (scale) {
    case 'day':
      startOffset = start.diff(viewStart, 'day')
      duration = end.diff(start, 'day') + 1
      break
    case 'week':
      startOffset = start.diff(viewStart, 'day')
      duration = end.diff(start, 'day') + 1
      break
    case 'month':
      startOffset = start.diff(viewStart, 'day')
      duration = end.diff(start, 'day') + 1
      break
    default:
      startOffset = 0
      duration = 1
  }

  return {
    left: startOffset * cellWidth,
    width: Math.max(duration * cellWidth, cellWidth),
  }
}

/**
 * 스케일에 따른 타임라인 헤더 생성
 * @param viewStart 뷰 시작일
 * @param scale 타임라인 스케일
 * @returns 헤더 배열
 */
export function generateTimelineHeaders(
  viewStart: dayjs.Dayjs,
  scale: TimelineScale
): { key: string; label: string; date: dayjs.Dayjs }[] {
  const headers: { key: string; label: string; date: dayjs.Dayjs }[] = []

  switch (scale) {
    case 'day':
      // 7일 표시
      for (let i = 0; i < 7; i++) {
        const date = viewStart.add(i, 'day')
        headers.push({
          key: date.format('YYYY-MM-DD'),
          label: date.format('ddd (D)'),
          date,
        })
      }
      break
    case 'week':
      // 7일 표시 (주간 뷰)
      for (let i = 0; i < 7; i++) {
        const date = viewStart.add(i, 'day')
        headers.push({
          key: date.format('YYYY-MM-DD'),
          label: date.format('ddd (D)'),
          date,
        })
      }
      break
    case 'month':
      // 4주(28일) 표시
      for (let i = 0; i < 4; i++) {
        const weekStart = viewStart.add(i * 7, 'day')
        headers.push({
          key: weekStart.format('YYYY-WW'),
          label: `${weekStart.format('M/D')} ~ ${weekStart.add(6, 'day').format('M/D')}`,
          date: weekStart,
        })
      }
      break
  }

  return headers
}

/**
 * 스케일에 따른 셀 너비 반환
 * @param scale 타임라인 스케일
 * @returns 셀 너비 (px)
 */
export function getCellWidth(scale: TimelineScale): number {
  switch (scale) {
    case 'day':
      return 100
    case 'week':
      return 100
    case 'month':
      return 175
    default:
      return 100
  }
}

/**
 * 뷰 시작일 계산 (스케일에 따라)
 * @param currentDate 현재 기준 날짜
 * @param scale 타임라인 스케일
 * @returns 뷰 시작일
 */
export function getViewStartDate(currentDate: dayjs.Dayjs, scale: TimelineScale): dayjs.Dayjs {
  switch (scale) {
    case 'day':
      return currentDate.startOf('day')
    case 'week':
      return currentDate.startOf('isoWeek')
    case 'month':
      return currentDate.startOf('month')
    default:
      return currentDate.startOf('isoWeek')
  }
}

/**
 * 기간 라벨 생성
 * @param viewStart 뷰 시작일
 * @param scale 타임라인 스케일
 * @returns 기간 라벨 문자열
 */
export function getDateRangeLabel(viewStart: dayjs.Dayjs, scale: TimelineScale): string {
  switch (scale) {
    case 'day':
      return viewStart.format('YYYY년 M월 D일') + ' ~ ' + viewStart.add(6, 'day').format('M월 D일')
    case 'week':
      return `${viewStart.format('YYYY년 M월')} ${Math.ceil(viewStart.date() / 7)}주차`
    case 'month':
      return viewStart.format('YYYY년 M월')
    default:
      return viewStart.format('YYYY년 M월')
  }
}

/**
 * 다음/이전 기간으로 이동
 * @param currentDate 현재 날짜
 * @param scale 타임라인 스케일
 * @param direction 이동 방향 (1: 다음, -1: 이전)
 * @returns 새로운 날짜
 */
export function navigatePeriod(
  currentDate: dayjs.Dayjs,
  scale: TimelineScale,
  direction: 1 | -1
): dayjs.Dayjs {
  switch (scale) {
    case 'day':
      return currentDate.add(direction * 7, 'day')
    case 'week':
      return currentDate.add(direction * 7, 'day')
    case 'month':
      return currentDate.add(direction, 'month')
    default:
      return currentDate.add(direction * 7, 'day')
  }
}

/**
 * 툴팁 데이터 포맷
 * @param plan 생산 계획 데이터
 * @returns 포맷된 툴팁 데이터
 */
export function formatTooltipData(plan: ProductionPlan): {
  title: string
  items: { label: string; value: string }[]
} {
  return {
    title: plan.name,
    items: [
      { label: '제품', value: `${plan.productName} (${plan.productCode})` },
      { label: '수량', value: `${plan.quantity.toLocaleString()} ${plan.unit}` },
      { label: '시작', value: plan.startDate },
      { label: '종료', value: plan.endDate },
      { label: '라인', value: plan.line },
      { label: '진행률', value: `${plan.progress}%` },
    ],
  }
}

/**
 * 평균 진행률 계산
 * @param plans 생산 계획 배열
 * @returns 평균 진행률
 */
export function calculateAverageProgress(plans: ProductionPlan[]): number {
  if (plans.length === 0) return 0
  const total = plans.reduce((sum, plan) => sum + plan.progress, 0)
  return Math.round(total / plans.length)
}
