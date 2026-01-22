// screens/sample/EquipmentMonitor/utils.ts
// 설비 모니터링 유틸리티 함수 (TSK-06-10)

import type { Equipment, EquipmentStatus, EquipmentFilterState } from './types'
import { STATUS_COLORS, STATUS_LABELS } from './types'

/**
 * 상태별 색상 반환
 * @param status 설비 상태
 * @returns Ant Design 색상 문자열
 */
export function getStatusColor(status: EquipmentStatus): string {
  return STATUS_COLORS[status] ?? 'default'
}

/**
 * 상태별 텍스트 반환
 * @param status 설비 상태
 * @returns 한글 상태 라벨
 */
export function getStatusText(status: EquipmentStatus): string {
  return STATUS_LABELS[status] ?? status
}

/**
 * 설비 필터링
 * @param equipment 설비 목록
 * @param filter 필터 상태
 * @returns 필터링된 설비 목록
 */
export function filterEquipment(
  equipment: Equipment[],
  filter: Partial<EquipmentFilterState>
): Equipment[] {
  return equipment.filter((eq) => {
    const statusMatch = !filter.status || filter.status === 'all' || eq.status === filter.status
    const lineMatch = !filter.lineId || filter.lineId === 'all' || eq.lineId === filter.lineId
    return statusMatch && lineMatch
  })
}

/**
 * 상태별 설비 개수 계산
 * @param equipment 설비 목록
 * @returns 상태별 개수 객체
 */
export function countByStatus(equipment: Equipment[]): Record<EquipmentStatus, number> {
  return equipment.reduce(
    (acc, eq) => {
      acc[eq.status] = (acc[eq.status] || 0) + 1
      return acc
    },
    {
      RUNNING: 0,
      STOPPED: 0,
      FAULT: 0,
      MAINTENANCE: 0,
    } as Record<EquipmentStatus, number>
  )
}

/**
 * 달성률 계산
 * @param actual 실제 값
 * @param target 목표 값
 * @returns 달성률 (%)
 */
export function calculateAchievementRate(actual: number, target: number): number {
  if (target === 0) return 0
  return Math.round((actual / target) * 1000) / 10
}

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 * @param dateString ISO 날짜 문자열
 * @returns 포맷팅된 날짜
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 날짜/시간 포맷팅 (MM-DD HH:mm)
 * @param dateString ISO 날짜 문자열
 * @returns 포맷팅된 날짜/시간
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

/**
 * 시간만 포맷팅 (HH:mm:ss)
 * @param dateString ISO 날짜 문자열
 * @returns 포맷팅된 시간
 */
export function formatTime(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

/**
 * 숫자 천단위 구분자 추가
 * @param num 숫자
 * @returns 포맷팅된 문자열
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-'
  return num.toLocaleString('ko-KR')
}

/**
 * 실시간 갱신 시뮬레이션 (상태 랜덤 변경)
 * @param equipment 설비 목록
 * @param changeRate 변경 확률 (0-1)
 * @returns 업데이트된 설비 목록
 */
export function simulateStatusChange(
  equipment: Equipment[],
  changeRate: number = 0.05
): Equipment[] {
  const statuses: EquipmentStatus[] = ['RUNNING', 'STOPPED', 'FAULT', 'MAINTENANCE']

  return equipment.map((eq) => {
    if (Math.random() > changeRate) return eq

    // 현재 상태에서 변경 가능한 상태로만 전이
    let newStatus: EquipmentStatus
    switch (eq.status) {
      case 'RUNNING':
        newStatus = Math.random() > 0.7 ? 'FAULT' : 'STOPPED'
        break
      case 'STOPPED':
        newStatus = Math.random() > 0.3 ? 'RUNNING' : 'MAINTENANCE'
        break
      case 'FAULT':
        newStatus = Math.random() > 0.5 ? 'STOPPED' : 'MAINTENANCE'
        break
      case 'MAINTENANCE':
        newStatus = 'STOPPED'
        break
      default:
        newStatus = statuses[Math.floor(Math.random() * statuses.length)]
    }

    if (newStatus === eq.status) return eq

    const now = new Date().toISOString()
    return {
      ...eq,
      status: newStatus,
      statusLabel: STATUS_LABELS[newStatus],
      statusChangedAt: now,
      metrics: {
        ...eq.metrics,
        efficiency: newStatus === 'RUNNING' ? Math.floor(70 + Math.random() * 25) : 0,
      },
      history: [
        {
          timestamp: now,
          previousStatus: eq.status,
          newStatus,
          reason: getStatusChangeReason(eq.status, newStatus),
        },
        ...eq.history.slice(0, 4),
      ],
    }
  })
}

/**
 * 상태 변경 사유 생성
 */
function getStatusChangeReason(from: EquipmentStatus, to: EquipmentStatus): string {
  const reasons: Record<string, string> = {
    'RUNNING-STOPPED': '작업 중지',
    'RUNNING-FAULT': '이상 감지',
    'STOPPED-RUNNING': '작업 재개',
    'STOPPED-MAINTENANCE': '점검 시작',
    'FAULT-STOPPED': '고장 조치 완료',
    'FAULT-MAINTENANCE': '수리 시작',
    'MAINTENANCE-STOPPED': '점검 완료',
  }
  return reasons[`${from}-${to}`] || '상태 변경'
}
