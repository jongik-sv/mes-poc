// screens/sample/InventoryDetail/__tests__/utils.spec.ts
// 유틸리티 함수 단위 테스트 (TSK-06-15)

import { describe, it, expect } from 'vitest'
import dayjs from 'dayjs'
import {
  getStockStatus,
  sortTransactionsByDate,
  filterTransactionsByDateRange,
  getDefaultDateRange,
  formatNumber,
  formatDate,
  formatDateTime,
} from '../utils'
import type { InventoryTransaction } from '../types'

describe('getStockStatus', () => {
  // UT-007: 재고 상태 계산
  // BR-001: 재고 상태 결정 규칙

  it('현재 재고가 안전 재고의 1.5배 이상이면 normal 반환', () => {
    // currentStock >= safetyStock * 1.5
    expect(getStockStatus(1500, 500)).toBe('normal') // 1500 >= 750
    expect(getStockStatus(750, 500)).toBe('normal') // 750 >= 750 (경계값)
    expect(getStockStatus(1000, 500)).toBe('normal') // 1000 >= 750
  })

  it('현재 재고가 안전 재고 이상이고 1.5배 미만이면 warning 반환', () => {
    // safetyStock <= currentStock < safetyStock * 1.5
    expect(getStockStatus(500, 500)).toBe('warning') // 500 >= 500 && 500 < 750
    expect(getStockStatus(600, 500)).toBe('warning') // 600 >= 500 && 600 < 750
    expect(getStockStatus(749, 500)).toBe('warning') // 749 >= 500 && 749 < 750
  })

  it('현재 재고가 안전 재고 미만이면 danger 반환', () => {
    // currentStock < safetyStock
    expect(getStockStatus(499, 500)).toBe('danger')
    expect(getStockStatus(100, 500)).toBe('danger')
    expect(getStockStatus(0, 500)).toBe('danger')
  })

  it('안전 재고가 0인 경우에도 정상 동작', () => {
    expect(getStockStatus(100, 0)).toBe('normal') // 100 >= 0
    expect(getStockStatus(0, 0)).toBe('normal') // 0 >= 0
  })
})

describe('sortTransactionsByDate', () => {
  // UT-003: 이력 목록 정렬
  // BR-002: 입출고 이력 최신순 정렬

  const transactions: InventoryTransaction[] = [
    {
      id: 'tx-1',
      itemId: 'item-1',
      type: 'in',
      quantity: 100,
      date: '2026-01-15T10:00:00',
      handler: '홍길동',
    },
    {
      id: 'tx-2',
      itemId: 'item-1',
      type: 'out',
      quantity: 50,
      date: '2026-01-20T14:00:00',
      handler: '김철수',
    },
    {
      id: 'tx-3',
      itemId: 'item-1',
      type: 'in',
      quantity: 200,
      date: '2026-01-10T09:00:00',
      handler: '이영희',
    },
  ]

  it('거래 내역을 날짜 기준 내림차순으로 정렬해야 함', () => {
    const sorted = sortTransactionsByDate(transactions)
    expect(sorted[0].id).toBe('tx-2') // 2026-01-20
    expect(sorted[1].id).toBe('tx-1') // 2026-01-15
    expect(sorted[2].id).toBe('tx-3') // 2026-01-10
  })

  it('원본 배열을 변경하지 않아야 함', () => {
    const original = [...transactions]
    sortTransactionsByDate(transactions)
    expect(transactions).toEqual(original)
  })

  it('빈 배열을 처리할 수 있어야 함', () => {
    expect(sortTransactionsByDate([])).toEqual([])
  })
})

describe('filterTransactionsByDateRange', () => {
  // UT-006: 기간 필터링
  // BR-003: 기본 조회 기간 30일

  const transactions: InventoryTransaction[] = [
    {
      id: 'tx-1',
      itemId: 'item-1',
      type: 'in',
      quantity: 100,
      date: '2026-01-10T10:00:00',
      handler: '홍길동',
    },
    {
      id: 'tx-2',
      itemId: 'item-1',
      type: 'out',
      quantity: 50,
      date: '2026-01-15T14:00:00',
      handler: '김철수',
    },
    {
      id: 'tx-3',
      itemId: 'item-1',
      type: 'in',
      quantity: 200,
      date: '2026-01-20T09:00:00',
      handler: '이영희',
    },
  ]

  it('시작일과 종료일 사이의 거래만 필터링해야 함', () => {
    const startDate = dayjs('2026-01-12')
    const endDate = dayjs('2026-01-18')
    const filtered = filterTransactionsByDateRange(
      transactions,
      startDate,
      endDate
    )
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('tx-2')
  })

  it('경계값 포함 - 시작일/종료일 날짜의 거래도 포함해야 함', () => {
    const startDate = dayjs('2026-01-10')
    const endDate = dayjs('2026-01-15')
    const filtered = filterTransactionsByDateRange(
      transactions,
      startDate,
      endDate
    )
    expect(filtered).toHaveLength(2)
  })

  it('startDate가 null이면 전체 반환', () => {
    const filtered = filterTransactionsByDateRange(
      transactions,
      null,
      dayjs('2026-01-15')
    )
    expect(filtered).toEqual(transactions)
  })

  it('endDate가 null이면 전체 반환', () => {
    const filtered = filterTransactionsByDateRange(
      transactions,
      dayjs('2026-01-10'),
      null
    )
    expect(filtered).toEqual(transactions)
  })

  it('빈 배열을 처리할 수 있어야 함', () => {
    const filtered = filterTransactionsByDateRange(
      [],
      dayjs('2026-01-01'),
      dayjs('2026-01-31')
    )
    expect(filtered).toEqual([])
  })
})

describe('getDefaultDateRange', () => {
  // BR-003: 기본 조회 기간 30일

  it('30일 범위의 날짜 배열을 반환해야 함', () => {
    const [start, end] = getDefaultDateRange()
    const diff = end.diff(start, 'day')
    expect(diff).toBe(30)
  })

  it('종료일은 오늘이어야 함', () => {
    const [, end] = getDefaultDateRange()
    expect(end.format('YYYY-MM-DD')).toBe(dayjs().format('YYYY-MM-DD'))
  })
})

describe('formatNumber', () => {
  it('천단위 콤마를 추가해야 함', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })

  it('0을 처리할 수 있어야 함', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('음수를 처리할 수 있어야 함', () => {
    expect(formatNumber(-1000)).toBe('-1,000')
  })
})

describe('formatDate', () => {
  it('ISO 날짜를 YYYY-MM-DD 형식으로 변환해야 함', () => {
    expect(formatDate('2026-01-22')).toBe('2026-01-22')
    expect(formatDate('2026-01-22T14:30:00')).toBe('2026-01-22')
  })

  it('null이면 "-"를 반환해야 함', () => {
    expect(formatDate(null)).toBe('-')
  })
})

describe('formatDateTime', () => {
  it('ISO 날짜를 YYYY-MM-DD HH:mm 형식으로 변환해야 함', () => {
    expect(formatDateTime('2026-01-22T14:30:00')).toBe('2026-01-22 14:30')
  })
})
