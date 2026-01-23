// screens/sample/DataTableShowcase/__tests__/useTableFilter.test.ts
// UT-003 ~ UT-006: 필터링 테스트

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTableFilter, filterByText, filterByNumberRange, filterByDateRange, filterByDropdown } from '../hooks/useTableFilter'
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

describe('useTableFilter', () => {
  it('should filter by text input', () => {
    const { result } = renderHook(() => useTableFilter(mockData))

    act(() => {
      result.current.setFilter({ column: 'name', type: 'text', value: '전자' })
    })

    expect(result.current.filteredData).toHaveLength(1)
    expect(result.current.filteredData[0].name).toContain('전자')
  })

  it('should filter by number range', () => {
    const { result } = renderHook(() => useTableFilter(mockData))

    act(() => {
      result.current.setFilter({ column: 'quantity', type: 'number', min: 100, max: 500 })
    })

    expect(result.current.filteredData).toHaveLength(2)
    expect(result.current.filteredData.every((item) => item.quantity >= 100 && item.quantity <= 500)).toBe(true)
  })

  it('should filter by date range', () => {
    const { result } = renderHook(() => useTableFilter(mockData))

    act(() => {
      result.current.setFilter({
        column: 'createdAt',
        type: 'date',
        dateRange: ['2026-01-01', '2026-01-15'],
      })
    })

    expect(result.current.filteredData).toHaveLength(2)
  })

  it('should filter by dropdown selection', () => {
    const { result } = renderHook(() => useTableFilter(mockData))

    act(() => {
      result.current.setFilter({ column: 'status', type: 'dropdown', value: 'active' })
    })

    expect(result.current.filteredData).toHaveLength(2)
    expect(result.current.filteredData.every((item) => item.status === 'active')).toBe(true)
  })

  it('should combine multiple filters', () => {
    const { result } = renderHook(() => useTableFilter(mockData))

    act(() => {
      result.current.setFilter({ column: 'status', type: 'dropdown', value: 'active' })
      result.current.setFilter({ column: 'quantity', type: 'number', min: 100 })
    })

    expect(result.current.filteredData).toHaveLength(2)
  })

  it('should remove filter', () => {
    const { result } = renderHook(() => useTableFilter(mockData))

    act(() => {
      result.current.setFilter({ column: 'status', type: 'dropdown', value: 'active' })
    })
    expect(result.current.filteredData).toHaveLength(2)

    act(() => {
      result.current.removeFilter('status')
    })
    expect(result.current.filteredData).toHaveLength(3)
  })

  it('should clear all filters', () => {
    const { result } = renderHook(() => useTableFilter(mockData))

    act(() => {
      result.current.setFilter({ column: 'status', type: 'dropdown', value: 'active' })
      result.current.setFilter({ column: 'category', type: 'dropdown', value: '전자' })
    })
    expect(result.current.filteredData).toHaveLength(1)

    act(() => {
      result.current.clearFilters()
    })
    expect(result.current.filteredData).toHaveLength(3)
  })

  it('should track active filter columns', () => {
    const { result } = renderHook(() => useTableFilter(mockData))

    act(() => {
      result.current.setFilter({ column: 'name', type: 'text', value: 'A' })
      result.current.setFilter({ column: 'status', type: 'dropdown', value: 'active' })
    })

    expect(result.current.activeFilterColumns).toContain('name')
    expect(result.current.activeFilterColumns).toContain('status')
    expect(result.current.activeFilterColumns).toHaveLength(2)
  })
})

describe('filterByText', () => {
  it('should filter by text input', () => {
    const result = filterByText(mockData, 'name', '제품A')
    // '제품A'가 포함된 항목은 없음 (정확한 매칭)
    expect(result).toHaveLength(0)
  })

  it('should return all items when value is empty', () => {
    const result = filterByText(mockData, 'name', '')
    expect(result).toHaveLength(3)
  })

  it('should be case insensitive', () => {
    const result = filterByText(mockData, 'name', '전자부품')
    expect(result).toHaveLength(1)
  })
})

describe('filterByNumberRange', () => {
  it('should filter by number range', () => {
    const result = filterByNumberRange(mockData, 'quantity', 100, 500)
    expect(result).toHaveLength(2)
  })

  it('should filter with only min', () => {
    const result = filterByNumberRange(mockData, 'quantity', 100)
    expect(result).toHaveLength(2)
  })

  it('should filter with only max', () => {
    const result = filterByNumberRange(mockData, 'quantity', undefined, 100)
    expect(result).toHaveLength(2)
  })
})

describe('filterByDateRange', () => {
  it('should filter by date range', () => {
    const result = filterByDateRange(mockData, 'createdAt', ['2026-01-01', '2026-01-15'])
    expect(result).toHaveLength(2)
  })
})

describe('filterByDropdown', () => {
  it('should filter by dropdown selection', () => {
    const result = filterByDropdown(mockData, 'status', 'active')
    expect(result).toHaveLength(2)
  })

  it('should return all items when value is empty', () => {
    const result = filterByDropdown(mockData, 'status', '')
    expect(result).toHaveLength(3)
  })
})
