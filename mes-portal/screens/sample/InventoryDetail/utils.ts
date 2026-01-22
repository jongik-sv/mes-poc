// screens/sample/InventoryDetail/utils.ts
// 재고 현황 조회 유틸리티 함수 (TSK-06-15)

import type { StockStatus, InventoryTransaction } from './types'
import dayjs from 'dayjs'

/**
 * 재고 상태를 계산합니다.
 * BR-001: 재고 상태 결정 규칙
 * - normal: 현재 재고 >= 안전 재고 * 1.5
 * - warning: 안전 재고 <= 현재 재고 < 안전 재고 * 1.5
 * - danger: 현재 재고 < 안전 재고
 */
export function getStockStatus(
  currentStock: number,
  safetyStock: number
): StockStatus {
  if (currentStock >= safetyStock * 1.5) {
    return 'normal'
  }
  if (currentStock >= safetyStock) {
    return 'warning'
  }
  return 'danger'
}

/**
 * 거래 내역을 날짜 기준 내림차순(최신순)으로 정렬합니다.
 * BR-002: 입출고 이력 최신순 정렬
 */
export function sortTransactionsByDate(
  transactions: InventoryTransaction[]
): InventoryTransaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

/**
 * 날짜 범위로 거래 내역을 필터링합니다.
 * BR-003: 기본 조회 기간 30일
 */
export function filterTransactionsByDateRange(
  transactions: InventoryTransaction[],
  startDate: dayjs.Dayjs | null,
  endDate: dayjs.Dayjs | null
): InventoryTransaction[] {
  if (!startDate || !endDate) {
    return transactions
  }

  return transactions.filter((tx) => {
    const txDate = dayjs(tx.date)
    return (
      txDate.isAfter(startDate.startOf('day').subtract(1, 'second')) &&
      txDate.isBefore(endDate.endOf('day').add(1, 'second'))
    )
  })
}

/**
 * 기본 날짜 범위를 계산합니다 (최근 30일).
 * BR-003: 기본 조회 기간 30일
 */
export function getDefaultDateRange(): [dayjs.Dayjs, dayjs.Dayjs] {
  const endDate = dayjs()
  const startDate = endDate.subtract(30, 'day')
  return [startDate, endDate]
}

/**
 * 숫자를 포맷팅합니다 (천단위 콤마).
 */
export function formatNumber(value: number): string {
  return value.toLocaleString()
}

/**
 * 날짜를 포맷팅합니다.
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return dayjs(dateString).format('YYYY-MM-DD')
}

/**
 * 날짜/시간을 포맷팅합니다.
 */
export function formatDateTime(dateString: string): string {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}
