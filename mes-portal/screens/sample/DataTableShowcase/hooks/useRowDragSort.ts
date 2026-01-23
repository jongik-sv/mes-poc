// screens/sample/DataTableShowcase/hooks/useRowDragSort.ts
// 행 드래그 정렬 훅

import { useCallback } from 'react'
import type { Product } from '../types'

/**
 * 행 드래그 정렬 훅
 * FR-009: 드래그로 행 순서 변경
 */
export function useRowDragSort(
  data: Product[],
  onDataChange: (updatedData: Product[]) => void
) {
  /**
   * 행 이동 처리
   */
  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragRow = data[dragIndex]
      const newData = [...data]
      newData.splice(dragIndex, 1)
      newData.splice(hoverIndex, 0, dragRow)
      onDataChange(newData)
    },
    [data, onDataChange]
  )

  /**
   * 드래그 앤 드롭 완료 핸들러 (@dnd-kit용)
   */
  const handleDragEnd = useCallback(
    (activeId: number, overId: number) => {
      if (activeId === overId) return

      const oldIndex = data.findIndex((item) => item.id === activeId)
      const newIndex = data.findIndex((item) => item.id === overId)

      if (oldIndex !== -1 && newIndex !== -1) {
        moveRow(oldIndex, newIndex)
      }
    },
    [data, moveRow]
  )

  return {
    moveRow,
    handleDragEnd,
  }
}
