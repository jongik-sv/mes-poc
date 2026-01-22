// screens/sample/MaterialHistory/__tests__/useMaterialHistory.spec.ts
// 자재 입출고 내역 훅 단위 테스트 (TSK-06-17)

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  filterMaterialHistory,
  sortMaterialHistory,
  useMaterialHistory,
} from '../useMaterialHistory'
import type { MaterialHistory } from '../types'

// 테스트용 Mock 데이터
const mockData: MaterialHistory[] = [
  {
    id: 'mat-1',
    materialName: '원자재A',
    materialCode: 'RAW-001',
    transactionType: 'in',
    quantity: 100,
    unit: 'EA',
    transactionDate: '2026-01-20',
    warehouse: '창고1',
    handler: '김자재',
    remark: '정기 입고',
    createdAt: '2026-01-20T09:00:00Z',
  },
  {
    id: 'mat-2',
    materialName: '원자재B',
    materialCode: 'RAW-002',
    transactionType: 'out',
    quantity: 50,
    unit: 'EA',
    transactionDate: '2026-01-19',
    warehouse: '창고1',
    handler: '이생산',
    remark: '생산 출고',
    createdAt: '2026-01-19T10:30:00Z',
  },
  {
    id: 'mat-3',
    materialName: '부자재C',
    materialCode: 'SUB-001',
    transactionType: 'in',
    quantity: 200,
    unit: 'KG',
    transactionDate: '2025-12-15',
    warehouse: '창고2',
    handler: '김자재',
    remark: '긴급 입고',
    createdAt: '2025-12-15T14:00:00Z',
  },
]

describe('filterMaterialHistory', () => {
  // UT-001: 자재명 필터
  it('should filter by material name (부분 일치 - BR-02)', () => {
    const result = filterMaterialHistory(mockData, { materialName: '원자재' })
    expect(result).toHaveLength(2)
    expect(result.every(item => item.materialName.includes('원자재'))).toBe(true)
  })

  it('should be case insensitive when filtering by material name', () => {
    const result = filterMaterialHistory(mockData, { materialName: '원자재a' })
    expect(result).toHaveLength(1)
    expect(result[0].materialName).toBe('원자재A')
  })

  // UT-002: 입출고유형 필터
  it('should filter by transaction type', () => {
    const inResult = filterMaterialHistory(mockData, { transactionType: 'in' })
    expect(inResult).toHaveLength(2)
    expect(inResult.every(item => item.transactionType === 'in')).toBe(true)

    const outResult = filterMaterialHistory(mockData, { transactionType: 'out' })
    expect(outResult).toHaveLength(1)
    expect(outResult[0].transactionType).toBe('out')
  })

  // UT-003: 기간 필터
  it('should filter by date range', () => {
    const result = filterMaterialHistory(mockData, {
      dateRange: ['2026-01-01', '2026-01-31'],
    })
    expect(result).toHaveLength(2)
    expect(result.every(item => {
      const date = item.transactionDate
      return date >= '2026-01-01' && date <= '2026-01-31'
    })).toBe(true)
  })

  // BR-01: 기간 미선택 시 전체 데이터 반환
  it('should return all data when dateRange is null (BR-01)', () => {
    const result = filterMaterialHistory(mockData, { dateRange: null })
    expect(result).toHaveLength(3)
  })

  it('should return all data when dateRange is empty', () => {
    const result = filterMaterialHistory(mockData, {})
    expect(result).toHaveLength(3)
  })

  // UT-004: 복합 필터
  it('should apply multiple filters', () => {
    const result = filterMaterialHistory(mockData, {
      materialName: '원자재',
      transactionType: 'in',
      dateRange: ['2026-01-01', '2026-01-31'],
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('mat-1')
  })
})

describe('sortMaterialHistory', () => {
  // UT-005: 초기 정렬 - 일자 내림차순 (BR-05)
  it('should sort by transactionDate descending by default (BR-05)', () => {
    const result = sortMaterialHistory(mockData)
    expect(result[0].transactionDate).toBe('2026-01-20')
    expect(result[1].transactionDate).toBe('2026-01-19')
    expect(result[2].transactionDate).toBe('2025-12-15')
  })

  it('should sort by transactionDate ascending', () => {
    const result = sortMaterialHistory(mockData, 'transactionDate', 'ascend')
    expect(result[0].transactionDate).toBe('2025-12-15')
    expect(result[2].transactionDate).toBe('2026-01-20')
  })

  it('should sort by quantity descending', () => {
    const result = sortMaterialHistory(mockData, 'quantity', 'descend')
    expect(result[0].quantity).toBe(200)
    expect(result[1].quantity).toBe(100)
    expect(result[2].quantity).toBe(50)
  })

  it('should sort by materialName ascending', () => {
    const result = sortMaterialHistory(mockData, 'materialName', 'ascend')
    expect(result[0].materialName).toBe('부자재C')
    expect(result[1].materialName).toBe('원자재A')
    expect(result[2].materialName).toBe('원자재B')
  })
})

describe('useMaterialHistory', () => {
  // UT-005: 초기 로드 시 일자 내림차순 정렬
  it('should load data sorted by date descending (BR-05)', () => {
    const { result } = renderHook(() => useMaterialHistory())

    expect(result.current.items.length).toBeGreaterThan(0)
    // 데이터가 내림차순 정렬되어 있는지 확인
    const dates = result.current.items.map(item => item.transactionDate)
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i] >= dates[i + 1]).toBe(true)
    }
  })

  it('should update search params', () => {
    const { result } = renderHook(() => useMaterialHistory())

    act(() => {
      result.current.setSearchParams({ materialName: '원자재' })
    })

    expect(result.current.searchParams).toEqual({ materialName: '원자재' })
  })

  // UT-006: 삭제 처리
  it('should delete selected items', async () => {
    const { result } = renderHook(() => useMaterialHistory())
    const initialLength = result.current.items.length
    const idToDelete = result.current.items[0].id

    await act(async () => {
      await result.current.deleteItems([idToDelete])
    })

    expect(result.current.items.length).toBe(initialLength - 1)
    expect(result.current.items.find(item => item.id === idToDelete)).toBeUndefined()
  })

  it('should refetch data', async () => {
    const { result } = renderHook(() => useMaterialHistory())
    const originalLength = result.current.items.length

    // 삭제 후 refetch
    await act(async () => {
      await result.current.deleteItems([result.current.items[0].id])
    })

    expect(result.current.items.length).toBe(originalLength - 1)

    act(() => {
      result.current.refetch()
    })

    // refetch 후 원래 데이터 복원
    expect(result.current.items.length).toBe(originalLength)
  })
})
