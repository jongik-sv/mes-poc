// lib/hooks/useTableColumns.ts
// 테이블 컬럼 리사이즈 관리 훅 (TSK-05-04)

'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ResizeCallbackData } from 'react-resizable'

// 기본 최소/최대 너비 상수
const DEFAULT_MIN_WIDTH = 50
const DEFAULT_MAX_WIDTH = Infinity
const DEFAULT_WIDTH = 100

export interface ColumnConfig {
  dataIndex?: string
  key?: string
  width?: number
  resizable?: boolean
  [key: string]: unknown
}

export interface UseTableColumnsOptions {
  /** 기본 컬럼 너비 (width가 없는 컬럼에 적용) */
  defaultWidth?: number
  /** 최소 컬럼 너비 */
  minWidth?: number
  /** 최대 컬럼 너비 */
  maxWidth?: number
  /** 리사이즈 콜백 */
  onResize?: (index: number, width: number) => void
}

export interface UseTableColumnsReturn<T extends ColumnConfig> {
  /** 너비가 적용된 컬럼 배열 */
  columns: T[]
  /** 리사이즈 핸들러 생성 함수 */
  handleResize: (index: number) => (e: React.SyntheticEvent, data: ResizeCallbackData) => void
  /** 컬럼 너비 상태 */
  columnWidths: number[]
  /** 컬럼 너비 초기화 */
  resetWidths: () => void
}

/**
 * 테이블 컬럼 리사이즈 관리 훅
 *
 * @param initialColumns 초기 컬럼 설정 배열
 * @param options 옵션 (minWidth, maxWidth, onResize 등)
 * @returns 너비가 적용된 컬럼과 리사이즈 핸들러
 *
 * @example
 * ```tsx
 * const { columns, handleResize } = useTableColumns(initialColumns, {
 *   minWidth: 50,
 *   maxWidth: 500,
 *   onResize: (index, width) => console.log(`Column ${index} resized to ${width}px`)
 * })
 * ```
 */
export function useTableColumns<T extends ColumnConfig>(
  initialColumns: T[],
  options: UseTableColumnsOptions = {}
): UseTableColumnsReturn<T> {
  const {
    defaultWidth = DEFAULT_WIDTH,
    minWidth = DEFAULT_MIN_WIDTH,
    maxWidth = DEFAULT_MAX_WIDTH,
    onResize,
  } = options

  // 초기 너비 계산
  const getInitialWidths = useCallback(
    (cols: T[]): number[] => {
      return cols.map((col) => col.width ?? defaultWidth)
    },
    [defaultWidth]
  )

  // 컬럼 너비 상태
  const [columnWidths, setColumnWidths] = useState<number[]>(() =>
    getInitialWidths(initialColumns)
  )

  // 컬럼 변경 시 너비 상태 업데이트
  useEffect(() => {
    setColumnWidths(getInitialWidths(initialColumns))
  }, [initialColumns, getInitialWidths])

  /**
   * 리사이즈 핸들러 생성 함수
   * 각 컬럼 인덱스에 대해 리사이즈 이벤트 핸들러를 반환
   */
  const handleResize = useCallback(
    (index: number) => {
      return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
        // 해당 컬럼이 리사이즈 가능한지 확인
        const column = initialColumns[index]
        if (column && column.resizable === false) {
          return
        }

        // 리사이즈 불가능한 컬럼 (명시적으로 resizable: true가 아닌 경우) 체크
        if (column && column.resizable !== true && column.width !== undefined) {
          // width가 있지만 resizable이 명시되지 않은 경우는 리사이즈 불가
          if (column.resizable === undefined) {
            return
          }
        }

        // 최소/최대 너비 적용
        const newWidth = Math.max(minWidth, Math.min(maxWidth, size.width))

        setColumnWidths((prevWidths) => {
          const newWidths = [...prevWidths]
          newWidths[index] = newWidth
          return newWidths
        })

        // 콜백 호출
        if (onResize) {
          onResize(index, newWidth)
        }
      }
    },
    [initialColumns, minWidth, maxWidth, onResize]
  )

  // 너비가 적용된 컬럼 배열 생성
  const columns = initialColumns.map((col, index) => ({
    ...col,
    width: columnWidths[index] ?? col.width ?? defaultWidth,
  }))

  // 너비 초기화 함수
  const resetWidths = useCallback(() => {
    setColumnWidths(getInitialWidths(initialColumns))
  }, [initialColumns, getInitialWidths])

  return {
    columns,
    handleResize,
    columnWidths,
    resetWidths,
  }
}

export default useTableColumns
