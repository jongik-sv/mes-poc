// screens/sample/DataTableShowcase/__tests__/useColumnResize.test.ts
// UT-011: 컬럼 리사이즈 테스트

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useColumnResize } from '../hooks/useColumnResize'

describe('useColumnResize', () => {
  // requestAnimationFrame을 동기적으로 실행하도록 mock
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with default widths', () => {
    const initialWidths = { name: 200, quantity: 100 }
    const { result } = renderHook(() => useColumnResize(initialWidths))

    expect(result.current.columnWidths).toEqual(initialWidths)
    expect(result.current.getColumnWidth('name', 150)).toBe(200)
    expect(result.current.getColumnWidth('quantity', 80)).toBe(100)
  })

  it('should return default width for undefined column', () => {
    const { result } = renderHook(() => useColumnResize({}))

    expect(result.current.getColumnWidth('undefined_column', 120)).toBe(120)
  })

  it('should resize column on drag', async () => {
    const { result } = renderHook(() => useColumnResize({ name: 200 }))

    act(() => {
      result.current.resizeColumn('name', 250)
    })

    await waitFor(() => {
      expect(result.current.getColumnWidth('name', 200)).toBe(250)
    })
  })

  it('should enforce minimum width of 50px', async () => {
    const { result } = renderHook(() => useColumnResize({ name: 200 }))

    act(() => {
      result.current.resizeColumn('name', 30)
    })

    await waitFor(() => {
      expect(result.current.getColumnWidth('name', 200)).toBe(50)
    })
  })

  it('should handle resize event handler', async () => {
    const { result } = renderHook(() => useColumnResize({ name: 200 }))

    const handler = result.current.handleResize('name')
    const mockEvent = {} as React.SyntheticEvent

    act(() => {
      handler(mockEvent, { size: { width: 300 } })
    })

    await waitFor(() => {
      expect(result.current.getColumnWidth('name', 200)).toBe(300)
    })
  })

  it('should reset widths to initial values', async () => {
    const initialWidths = { name: 200, quantity: 100 }
    const { result } = renderHook(() => useColumnResize(initialWidths))

    act(() => {
      result.current.resizeColumn('name', 400)
      result.current.resizeColumn('quantity', 200)
    })

    await waitFor(() => {
      expect(result.current.getColumnWidth('name', 200)).toBe(400)
    })

    act(() => {
      result.current.resetWidths()
    })

    expect(result.current.columnWidths).toEqual(initialWidths)
  })
})
