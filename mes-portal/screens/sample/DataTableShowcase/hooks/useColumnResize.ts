// screens/sample/DataTableShowcase/hooks/useColumnResize.ts
// 컬럼 리사이즈 훅

import { useState, useCallback, useRef } from 'react'

interface ColumnWidth {
  [key: string]: number
}

/**
 * 컬럼 리사이즈 훅
 * FR-005: 드래그로 컬럼 너비 조절
 */
export function useColumnResize(initialWidths: ColumnWidth = {}) {
  const [columnWidths, setColumnWidths] = useState<ColumnWidth>(initialWidths)

  // 드래그 중 성능 최적화를 위한 ref (throttle 대신 사용)
  const pendingWidthsRef = useRef<ColumnWidth>({})
  const rafIdRef = useRef<number | null>(null)

  /**
   * 컬럼 너비 변경 (throttled)
   */
  const resizeColumn = useCallback((columnKey: string, width: number) => {
    // 최소 너비 50px 보장
    const newWidth = Math.max(50, width)

    // pending에 저장
    pendingWidthsRef.current[columnKey] = newWidth

    // requestAnimationFrame으로 배치 처리
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        const updates = { ...pendingWidthsRef.current }
        pendingWidthsRef.current = {}
        rafIdRef.current = null

        setColumnWidths((prev) => ({
          ...prev,
          ...updates,
        }))
      })
    }
  }, [])

  /**
   * 리사이즈 핸들러 (드래그 이벤트용)
   */
  const handleResize = useCallback(
    (columnKey: string) =>
      (_e: React.SyntheticEvent, { size }: { size: { width: number } }) => {
        resizeColumn(columnKey, size.width)
      },
    [resizeColumn]
  )

  /**
   * 컬럼 너비 가져오기
   */
  const getColumnWidth = useCallback(
    (columnKey: string, defaultWidth: number = 100) => {
      return columnWidths[columnKey] ?? defaultWidth
    },
    [columnWidths]
  )

  /**
   * 모든 컬럼 너비 초기화
   */
  const resetWidths = useCallback(() => {
    setColumnWidths(initialWidths)
  }, [initialWidths])

  return {
    columnWidths,
    resizeColumn,
    handleResize,
    getColumnWidth,
    resetWidths,
  }
}
