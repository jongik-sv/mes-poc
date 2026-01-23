// screens/sample/DataTableShowcase/hooks/useInlineEdit.ts
// 인라인 편집 훅

import { useState, useCallback } from 'react'
import type { Product, EditingCell } from '../types'

/**
 * 인라인 편집 훅
 * FR-008: 셀 더블클릭으로 편집 모드 진입, Enter/Blur로 저장, Escape로 취소
 */
export function useInlineEdit(
  data: Product[],
  onDataChange: (updatedData: Product[]) => void
) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [originalValue, setOriginalValue] = useState<string | number | null>(null)

  /**
   * 편집 모드 시작
   */
  const startEdit = useCallback((rowId: number, columnKey: string, value: string | number) => {
    setEditingCell({ rowId, columnKey, value })
    setOriginalValue(value)
  }, [])

  /**
   * 편집 중인 값 변경
   */
  const updateEditValue = useCallback((value: string | number) => {
    if (editingCell) {
      setEditingCell({ ...editingCell, value })
    }
  }, [editingCell])

  /**
   * 편집 저장
   */
  const saveEdit = useCallback(() => {
    if (!editingCell) return

    const { rowId, columnKey, value } = editingCell
    const updatedData = data.map((item) => {
      if (item.id === rowId) {
        return { ...item, [columnKey]: value }
      }
      return item
    })

    onDataChange(updatedData)
    setEditingCell(null)
    setOriginalValue(null)
  }, [editingCell, data, onDataChange])

  /**
   * 편집 취소
   */
  const cancelEdit = useCallback(() => {
    setEditingCell(null)
    setOriginalValue(null)
  }, [])

  /**
   * 특정 셀이 편집 중인지 확인
   */
  const isEditing = useCallback((rowId: number, columnKey: string) => {
    return editingCell?.rowId === rowId && editingCell?.columnKey === columnKey
  }, [editingCell])

  /**
   * 키보드 이벤트 핸들러
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!editingCell) return

    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }, [editingCell, saveEdit, cancelEdit])

  return {
    editingCell,
    originalValue,
    startEdit,
    updateEditValue,
    saveEdit,
    cancelEdit,
    isEditing,
    handleKeyDown,
  }
}
