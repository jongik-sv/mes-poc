// screens/sample/MaterialHistory/useMaterialHistory.ts
// 자재 입출고 내역 데이터 관리 훅 (TSK-06-17)

'use client'

import { useState, useCallback, useMemo } from 'react'
import materialHistoryData from '@/mock-data/material-history.json'
import type { MaterialHistory, MaterialHistorySearchParams } from './types'

/**
 * 자재 입출고 내역 필터링 함수
 *
 * @param items - 원본 데이터 배열
 * @param params - 검색 파라미터
 * @returns 필터링된 데이터 배열
 */
export function filterMaterialHistory(
  items: MaterialHistory[],
  params: MaterialHistorySearchParams
): MaterialHistory[] {
  return items.filter((item) => {
    // 자재명 필터 (부분 일치 - BR-02)
    if (params.materialName && !item.materialName.toLowerCase().includes(params.materialName.toLowerCase())) {
      return false
    }

    // 입출고유형 필터 (완전 일치)
    if (params.transactionType && item.transactionType !== params.transactionType) {
      return false
    }

    // 기간 필터 (BR-01: 미선택 시 전체)
    if (params.dateRange && params.dateRange[0] && params.dateRange[1]) {
      const itemDate = item.transactionDate
      const [startDate, endDate] = params.dateRange
      if (itemDate < startDate || itemDate > endDate) {
        return false
      }
    }

    return true
  })
}

/**
 * 자재 입출고 내역 정렬 함수 (BR-05: 기본 정렬 - 일자 내림차순)
 */
export function sortMaterialHistory(
  items: MaterialHistory[],
  field: keyof MaterialHistory = 'transactionDate',
  order: 'ascend' | 'descend' = 'descend'
): MaterialHistory[] {
  return [...items].sort((a, b) => {
    const aValue = a[field]
    const bValue = b[field]

    if (aValue === null || aValue === undefined) return order === 'ascend' ? 1 : -1
    if (bValue === null || bValue === undefined) return order === 'ascend' ? -1 : 1

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue, 'ko')
      return order === 'ascend' ? comparison : -comparison
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'ascend' ? aValue - bValue : bValue - aValue
    }

    return 0
  })
}

/**
 * useMaterialHistory 훅 반환 타입
 */
export interface UseMaterialHistoryReturn {
  // 데이터 상태
  items: MaterialHistory[]
  loading: boolean
  error: Error | null

  // 검색/필터 관련
  searchParams: MaterialHistorySearchParams
  setSearchParams: (params: MaterialHistorySearchParams) => void

  // CRUD 작업
  deleteItems: (ids: string[]) => Promise<void>
  refetch: () => void
}

/**
 * 자재 입출고 내역 데이터 관리 훅
 *
 * 책임:
 * - mock 데이터 로드
 * - 필터링/정렬 로직
 * - 삭제 작업
 */
export function useMaterialHistory(): UseMaterialHistoryReturn {
  // 원본 데이터 (mock에서 로드 후 삭제 반영)
  // BR-05: 초기 정렬 - 일자 내림차순
  const [items, setItems] = useState<MaterialHistory[]>(() =>
    sortMaterialHistory(materialHistoryData.materialHistory as MaterialHistory[])
  )
  const [loading, setLoading] = useState(false)
  const [error] = useState<Error | null>(null)

  // 검색 파라미터
  const [searchParams, setSearchParams] = useState<MaterialHistorySearchParams>({})

  /**
   * 항목 삭제 (BR-03: 확인 다이얼로그는 컴포넌트에서 처리)
   */
  const deleteItems = useCallback(async (ids: string[]) => {
    setLoading(true)
    try {
      // mock: 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 300))
      setItems((prev) => prev.filter((item) => !ids.includes(item.id)))
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 데이터 다시 로드
   */
  const refetch = useCallback(() => {
    setItems(sortMaterialHistory(materialHistoryData.materialHistory as MaterialHistory[]))
  }, [])

  return {
    items,
    loading,
    error,
    searchParams,
    setSearchParams,
    deleteItems,
    refetch,
  }
}

export default useMaterialHistory
