// screens/sample/DataTableShowcase/hooks/useTableFilter.ts
// 테이블 필터링 훅

import { useState, useCallback, useMemo } from 'react'
import type { Product, FilterCondition } from '../types'
import dayjs from '@/lib/dayjs'

/**
 * 테이블 필터링 훅
 * FR-002: 컬럼별 필터링 (텍스트, 숫자 범위, 날짜, 드롭다운)
 */
export function useTableFilter(data: Product[]) {
  const [filters, setFilters] = useState<FilterCondition[]>([])

  /**
   * 필터 추가/업데이트
   */
  const setFilter = useCallback((filter: FilterCondition) => {
    setFilters((prev) => {
      const existingIndex = prev.findIndex((f) => f.column === filter.column)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = filter
        return updated
      }
      return [...prev, filter]
    })
  }, [])

  /**
   * 필터 제거
   */
  const removeFilter = useCallback((column: string) => {
    setFilters((prev) => prev.filter((f) => f.column !== column))
  }, [])

  /**
   * 모든 필터 초기화
   */
  const clearFilters = useCallback(() => {
    setFilters([])
  }, [])

  /**
   * 필터링된 데이터
   */
  const filteredData = useMemo(() => {
    if (filters.length === 0) return data

    return data.filter((item) => {
      return filters.every((filter) => {
        const value = item[filter.column as keyof Product]

        switch (filter.type) {
          case 'text':
            if (!filter.value) return true
            return String(value).toLowerCase().includes(filter.value.toLowerCase())

          case 'number':
            const numValue = Number(value)
            if (filter.min !== undefined && numValue < filter.min) return false
            if (filter.max !== undefined && numValue > filter.max) return false
            return true

          case 'date':
            if (!filter.dateRange) return true
            const [start, end] = filter.dateRange
            const dateValue = dayjs(value as string)
            return dateValue.isAfter(dayjs(start).subtract(1, 'day')) &&
                   dateValue.isBefore(dayjs(end).add(1, 'day'))

          case 'dropdown':
            if (!filter.value) return true
            return value === filter.value

          default:
            return true
        }
      })
    })
  }, [data, filters])

  /**
   * 특정 컬럼의 필터 조건 가져오기
   */
  const getFilter = useCallback((column: string) => {
    return filters.find((f) => f.column === column)
  }, [filters])

  /**
   * 활성화된 필터 컬럼 목록
   */
  const activeFilterColumns = useMemo(() => {
    return filters.map((f) => f.column)
  }, [filters])

  return {
    filters,
    filteredData,
    setFilter,
    removeFilter,
    clearFilters,
    getFilter,
    activeFilterColumns,
  }
}

/**
 * 데이터 필터링 유틸리티 함수 (테스트용)
 */
export function filterByText(data: Product[], column: keyof Product, value: string): Product[] {
  if (!value) return data
  return data.filter((item) =>
    String(item[column]).toLowerCase().includes(value.toLowerCase())
  )
}

export function filterByNumberRange(
  data: Product[],
  column: keyof Product,
  min?: number,
  max?: number
): Product[] {
  return data.filter((item) => {
    const value = Number(item[column])
    if (min !== undefined && value < min) return false
    if (max !== undefined && value > max) return false
    return true
  })
}

export function filterByDateRange(
  data: Product[],
  column: keyof Product,
  dateRange: [string, string]
): Product[] {
  const [start, end] = dateRange
  return data.filter((item) => {
    const value = dayjs(item[column] as string)
    return value.isAfter(dayjs(start).subtract(1, 'day')) &&
           value.isBefore(dayjs(end).add(1, 'day'))
  })
}

export function filterByDropdown(
  data: Product[],
  column: keyof Product,
  value: string
): Product[] {
  if (!value) return data
  return data.filter((item) => item[column] === value)
}
