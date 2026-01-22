// lib/hooks/__tests__/useTableColumns.test.ts
// useTableColumns 훅 단위 테스트 (TSK-05-04)

import { renderHook, act } from '@testing-library/react'
import { useTableColumns } from '../useTableColumns'

interface TestColumn {
  title: string
  dataIndex: string
  key: string
  width?: number
  resizable?: boolean
}

const MOCK_COLUMNS: TestColumn[] = [
  { title: '이름', dataIndex: 'name', key: 'name', width: 150, resizable: true },
  { title: '설명', dataIndex: 'description', key: 'description', width: 200, resizable: true },
  { title: '상태', dataIndex: 'status', key: 'status', width: 100 },
]

describe('useTableColumns', () => {
  // UT-008: 컬럼 너비 드래그
  describe('column resize', () => {
    it('UT-008: should update column width on resize', () => {
      const { result } = renderHook(() => useTableColumns(MOCK_COLUMNS))

      // 초기 너비 확인
      expect(result.current.columns[0].width).toBe(150)

      // 리사이즈 핸들러 호출
      act(() => {
        result.current.handleResize(0)(null as any, { size: { width: 200 } })
      })

      // 너비가 변경되었는지 확인
      expect(result.current.columns[0].width).toBe(200)
    })

    // UT-011: 최소 너비 제한 (BR-003)
    it('UT-011: should not allow width below minimum (50px)', () => {
      const { result } = renderHook(() => useTableColumns(MOCK_COLUMNS))

      // 최소 너비 이하로 줄이려 시도
      act(() => {
        result.current.handleResize(0)(null as any, { size: { width: 30 } })
      })

      // 최소 너비(50px)로 제한되어야 함
      expect(result.current.columns[0].width).toBe(50)
    })

    it('should maintain other column widths when resizing one column', () => {
      const { result } = renderHook(() => useTableColumns(MOCK_COLUMNS))

      // 첫 번째 컬럼만 리사이즈
      act(() => {
        result.current.handleResize(0)(null as any, { size: { width: 180 } })
      })

      // 다른 컬럼은 원래 너비 유지
      expect(result.current.columns[0].width).toBe(180)
      expect(result.current.columns[1].width).toBe(200)
      expect(result.current.columns[2].width).toBe(100)
    })

    it('should not resize non-resizable columns', () => {
      const { result } = renderHook(() => useTableColumns(MOCK_COLUMNS))

      // 세 번째 컬럼은 resizable: false (명시되지 않음)
      act(() => {
        result.current.handleResize(2)(null as any, { size: { width: 150 } })
      })

      // 리사이즈 불가능한 컬럼은 변경되지 않아야 함
      // 또는 handleResize가 호출되더라도 resizable 컬럼만 변경
      expect(result.current.columns[2].width).toBe(100)
    })
  })

  // 컬럼 초기화 테스트
  describe('initialization', () => {
    it('should initialize columns with correct widths', () => {
      const { result } = renderHook(() => useTableColumns(MOCK_COLUMNS))

      expect(result.current.columns).toHaveLength(3)
      expect(result.current.columns[0].width).toBe(150)
      expect(result.current.columns[1].width).toBe(200)
      expect(result.current.columns[2].width).toBe(100)
    })

    it('should set default width for columns without width', () => {
      const columnsWithoutWidth: TestColumn[] = [
        { title: '이름', dataIndex: 'name', key: 'name', resizable: true },
      ]

      const { result } = renderHook(() =>
        useTableColumns(columnsWithoutWidth, { defaultWidth: 120 })
      )

      expect(result.current.columns[0].width).toBe(120)
    })

    it('should update columns when input changes', () => {
      const { result, rerender } = renderHook(
        ({ columns }) => useTableColumns(columns),
        { initialProps: { columns: MOCK_COLUMNS } }
      )

      const newColumns: TestColumn[] = [
        { title: '새 컬럼', dataIndex: 'newCol', key: 'newCol', width: 180 },
      ]

      rerender({ columns: newColumns })

      expect(result.current.columns).toHaveLength(1)
      expect(result.current.columns[0].width).toBe(180)
    })
  })

  // 리사이즈 핸들러 생성 테스트
  describe('handleResize', () => {
    it('should return a function that handles resize events', () => {
      const { result } = renderHook(() => useTableColumns(MOCK_COLUMNS))

      const resizeHandler = result.current.handleResize(0)
      expect(typeof resizeHandler).toBe('function')
    })

    it('should handle multiple resize events correctly', () => {
      const { result } = renderHook(() => useTableColumns(MOCK_COLUMNS))

      // 첫 번째 리사이즈
      act(() => {
        result.current.handleResize(0)(null as any, { size: { width: 180 } })
      })

      // 두 번째 리사이즈
      act(() => {
        result.current.handleResize(1)(null as any, { size: { width: 250 } })
      })

      expect(result.current.columns[0].width).toBe(180)
      expect(result.current.columns[1].width).toBe(250)
    })
  })

  // 최소/최대 너비 옵션 테스트
  describe('min/max width options', () => {
    it('should respect minWidth option', () => {
      const { result } = renderHook(() =>
        useTableColumns(MOCK_COLUMNS, { minWidth: 80 })
      )

      act(() => {
        result.current.handleResize(0)(null as any, { size: { width: 60 } })
      })

      expect(result.current.columns[0].width).toBe(80)
    })

    it('should respect maxWidth option', () => {
      const { result } = renderHook(() =>
        useTableColumns(MOCK_COLUMNS, { maxWidth: 300 })
      )

      act(() => {
        result.current.handleResize(0)(null as any, { size: { width: 400 } })
      })

      expect(result.current.columns[0].width).toBe(300)
    })
  })

  // onResize 콜백 테스트
  describe('onResize callback', () => {
    it('should call onResize callback when column is resized', () => {
      const onResizeMock = vi.fn()
      const { result } = renderHook(() =>
        useTableColumns(MOCK_COLUMNS, { onResize: onResizeMock })
      )

      act(() => {
        result.current.handleResize(0)(null as any, { size: { width: 200 } })
      })

      expect(onResizeMock).toHaveBeenCalledWith(0, 200)
    })
  })
})
