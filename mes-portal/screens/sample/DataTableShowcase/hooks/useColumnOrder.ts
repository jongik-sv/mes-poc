// screens/sample/DataTableShowcase/hooks/useColumnOrder.ts
// 컬럼 순서 변경 훅

import { useState, useCallback } from 'react'

/**
 * 컬럼 순서 변경 훅
 * FR-005: 드래그로 컬럼 순서 변경
 */
export function useColumnOrder(initialOrder: string[]) {
  const [columnOrder, setColumnOrder] = useState<string[]>(initialOrder)

  /**
   * 컬럼 순서 변경
   */
  const reorderColumns = useCallback((newOrder: string[]) => {
    setColumnOrder(newOrder)
  }, [])

  /**
   * 드래그 앤 드롭으로 컬럼 이동
   */
  const moveColumn = useCallback((dragIndex: number, hoverIndex: number) => {
    setColumnOrder((prev) => {
      const newOrder = [...prev]
      const [removed] = newOrder.splice(dragIndex, 1)
      newOrder.splice(hoverIndex, 0, removed)
      return newOrder
    })
  }, [])

  /**
   * 순서 초기화
   */
  const resetOrder = useCallback(() => {
    setColumnOrder(initialOrder)
  }, [initialOrder])

  /**
   * 특정 컬럼의 현재 인덱스
   */
  const getColumnIndex = useCallback(
    (columnKey: string) => {
      return columnOrder.indexOf(columnKey)
    },
    [columnOrder]
  )

  return {
    columnOrder,
    reorderColumns,
    moveColumn,
    resetOrder,
    getColumnIndex,
  }
}
