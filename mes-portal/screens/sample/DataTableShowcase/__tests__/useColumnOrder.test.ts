// screens/sample/DataTableShowcase/__tests__/useColumnOrder.test.ts
// UT-012: 컬럼 순서 변경 테스트

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useColumnOrder } from '../hooks/useColumnOrder'

describe('useColumnOrder', () => {
  it('should initialize with given order', () => {
    const initialOrder = ['name', 'category', 'quantity', 'price']
    const { result } = renderHook(() => useColumnOrder(initialOrder))

    expect(result.current.columnOrder).toEqual(initialOrder)
  })

  it('should reorder columns on drag', () => {
    const initialOrder = ['name', 'category', 'quantity', 'price']
    const { result } = renderHook(() => useColumnOrder(initialOrder))

    // name(0)을 quantity(2) 뒤로 이동
    act(() => {
      result.current.moveColumn(0, 2)
    })

    expect(result.current.columnOrder).toEqual(['category', 'quantity', 'name', 'price'])
  })

  it('should set new order directly', () => {
    const initialOrder = ['name', 'category', 'quantity', 'price']
    const { result } = renderHook(() => useColumnOrder(initialOrder))

    const newOrder = ['price', 'quantity', 'category', 'name']

    act(() => {
      result.current.reorderColumns(newOrder)
    })

    expect(result.current.columnOrder).toEqual(newOrder)
  })

  it('should reset order to initial values', () => {
    const initialOrder = ['name', 'category', 'quantity', 'price']
    const { result } = renderHook(() => useColumnOrder(initialOrder))

    act(() => {
      result.current.moveColumn(0, 3)
    })

    expect(result.current.columnOrder).not.toEqual(initialOrder)

    act(() => {
      result.current.resetOrder()
    })

    expect(result.current.columnOrder).toEqual(initialOrder)
  })

  it('should get column index correctly', () => {
    const initialOrder = ['name', 'category', 'quantity', 'price']
    const { result } = renderHook(() => useColumnOrder(initialOrder))

    expect(result.current.getColumnIndex('name')).toBe(0)
    expect(result.current.getColumnIndex('category')).toBe(1)
    expect(result.current.getColumnIndex('quantity')).toBe(2)
    expect(result.current.getColumnIndex('price')).toBe(3)
    expect(result.current.getColumnIndex('unknown')).toBe(-1)
  })
})
