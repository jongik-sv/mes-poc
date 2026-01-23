// screens/sample/DataTableShowcase/__tests__/useRowDragSort.test.ts
// UT-019: 행 드래그 정렬 테스트

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRowDragSort } from '../hooks/useRowDragSort'
import type { Product } from '../types'

const mockData: Product[] = [
  {
    id: 1,
    name: '전자부품 A-001',
    category: '전자',
    categoryCode: 'ELEC',
    quantity: 100,
    price: 10000,
    status: 'active',
    statusLabel: '활성',
    createdAt: '2026-01-20T10:00:00',
    updatedAt: '2026-01-21T15:30:00',
    details: { description: '', manufacturer: '', warranty: '', processes: [] },
  },
  {
    id: 2,
    name: '목재 가구 B-001',
    category: '가구',
    categoryCode: 'FURN',
    quantity: 50,
    price: 250000,
    status: 'inactive',
    statusLabel: '비활성',
    createdAt: '2026-01-15T11:00:00',
    updatedAt: '2026-01-16T10:00:00',
    details: { description: '', manufacturer: '', warranty: '', processes: [] },
  },
  {
    id: 3,
    name: '의류 C-001',
    category: '의류',
    categoryCode: 'CLTH',
    quantity: 500,
    price: 35000,
    status: 'active',
    statusLabel: '활성',
    createdAt: '2026-01-10T08:00:00',
    updatedAt: '2026-01-11T16:00:00',
    details: { description: '', manufacturer: '', warranty: '', processes: [] },
  },
]

describe('useRowDragSort', () => {
  it('should reorder rows on drag', () => {
    const onDataChange = vi.fn()
    const { result } = renderHook(() => useRowDragSort(mockData, onDataChange))

    // 첫 번째 행(index 0)을 세 번째 위치(index 2)로 이동
    act(() => {
      result.current.moveRow(0, 2)
    })

    expect(onDataChange).toHaveBeenCalledWith([
      mockData[1], // 가구
      mockData[2], // 의류
      mockData[0], // 전자 (이동됨)
    ])
  })

  it('should handle drag end event', () => {
    const onDataChange = vi.fn()
    const { result } = renderHook(() => useRowDragSort(mockData, onDataChange))

    // id: 1을 id: 3 위치로 이동
    act(() => {
      result.current.handleDragEnd(1, 3)
    })

    expect(onDataChange).toHaveBeenCalledWith([
      mockData[1], // 가구
      mockData[2], // 의류
      mockData[0], // 전자 (이동됨)
    ])
  })

  it('should not change order when dragging to same position', () => {
    const onDataChange = vi.fn()
    const { result } = renderHook(() => useRowDragSort(mockData, onDataChange))

    act(() => {
      result.current.handleDragEnd(1, 1)
    })

    expect(onDataChange).not.toHaveBeenCalled()
  })

  it('should handle invalid ids gracefully', () => {
    const onDataChange = vi.fn()
    const { result } = renderHook(() => useRowDragSort(mockData, onDataChange))

    act(() => {
      result.current.handleDragEnd(999, 1)
    })

    expect(onDataChange).not.toHaveBeenCalled()
  })

  it('should move row from end to beginning', () => {
    const onDataChange = vi.fn()
    const { result } = renderHook(() => useRowDragSort(mockData, onDataChange))

    // 마지막 행(index 2)을 첫 번째 위치(index 0)로 이동
    act(() => {
      result.current.moveRow(2, 0)
    })

    expect(onDataChange).toHaveBeenCalledWith([
      mockData[2], // 의류 (이동됨)
      mockData[0], // 전자
      mockData[1], // 가구
    ])
  })
})
