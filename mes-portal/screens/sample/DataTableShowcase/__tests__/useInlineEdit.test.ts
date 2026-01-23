// screens/sample/DataTableShowcase/__tests__/useInlineEdit.test.ts
// UT-016 ~ UT-018: 인라인 편집 테스트

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInlineEdit } from '../hooks/useInlineEdit'
import type { Product } from '../types'

const mockData: Product[] = [
  {
    id: 1,
    name: '전자부품 A-001',
    category: '전자',
    categoryCode: 'ELEC',
    quantity: 100,
    price: 10000,
    status: 'active',
    statusLabel: '활성',
    createdAt: '2026-01-20T10:00:00',
    updatedAt: '2026-01-21T15:30:00',
    details: { description: '', manufacturer: '', warranty: '', processes: [] },
  },
]

describe('useInlineEdit', () => {
  it('should enter edit mode on double-click', () => {
    const onDataChange = vi.fn()
    const { result } = renderHook(() => useInlineEdit(mockData, onDataChange))

    act(() => {
      result.current.startEdit(1, 'name', '전자부품 A-001')
    })

    expect(result.current.editingCell).toEqual({
      rowId: 1,
      columnKey: 'name',
      value: '전자부품 A-001',
    })
    expect(result.current.isEditing(1, 'name')).toBe(true)
    expect(result.current.isEditing(1, 'quantity')).toBe(false)
  })

  it('should update edit value', () => {
    const onDataChange = vi.fn()
    const { result } = renderHook(() => useInlineEdit(mockData, onDataChange))

    act(() => {
      result.current.startEdit(1, 'name', '전자부품 A-001')
    })

    act(() => {
      result.current.updateEditValue('수정된 제품명')
    })

    expect(result.current.editingCell?.value).toBe('수정된 제품명')
  })

  it('should save on Enter or blur', () => {
    const onDataChange = vi.fn()
    const { result } = renderHook(() => useInlineEdit(mockData, onDataChange))

    act(() => {
      result.current.startEdit(1, 'name', '전자부품 A-001')
    })

    act(() => {
      result.current.updateEditValue('수정된 제품명')
    })

    act(() => {
      result.current.saveEdit()
    })

    expect(onDataChange).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 1,
        name: '수정된 제품명',
      }),
    ])
    expect(result.current.editingCell).toBeNull()
  })

  it('should cancel on Escape', () => {
    const onDataChange = vi.fn()
    const { result } = renderHook(() => useInlineEdit(mockData, onDataChange))

    act(() => {
      result.current.startEdit(1, 'name', '전자부품 A-001')
    })

    act(() => {
      result.current.updateEditValue('수정된 제품명')
    })

    act(() => {
      result.current.cancelEdit()
    })

    expect(onDataChange).not.toHaveBeenCalled()
    expect(result.current.editingCell).toBeNull()
  })

  it('should preserve original value on cancel', () => {
    const onDataChange = vi.fn()
    const { result } = renderHook(() => useInlineEdit(mockData, onDataChange))

    act(() => {
      result.current.startEdit(1, 'name', '전자부품 A-001')
    })

    expect(result.current.originalValue).toBe('전자부품 A-001')

    act(() => {
      result.current.updateEditValue('수정된 제품명')
    })

    // 취소 후에도 원래 값은 유지
    expect(result.current.originalValue).toBe('전자부품 A-001')
  })

  it('should handle keyboard events', () => {
    const onDataChange = vi.fn()
    const { result } = renderHook(() => useInlineEdit(mockData, onDataChange))

    act(() => {
      result.current.startEdit(1, 'name', '전자부품 A-001')
    })

    // Enter 키 이벤트
    const enterEvent = {
      key: 'Enter',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent

    act(() => {
      result.current.handleKeyDown(enterEvent)
    })

    expect(enterEvent.preventDefault).toHaveBeenCalled()
    expect(result.current.editingCell).toBeNull()
  })

  it('should handle Escape key', () => {
    const onDataChange = vi.fn()
    const { result } = renderHook(() => useInlineEdit(mockData, onDataChange))

    act(() => {
      result.current.startEdit(1, 'name', '전자부품 A-001')
    })

    act(() => {
      result.current.updateEditValue('수정된 값')
    })

    const escapeEvent = {
      key: 'Escape',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent

    act(() => {
      result.current.handleKeyDown(escapeEvent)
    })

    expect(escapeEvent.preventDefault).toHaveBeenCalled()
    expect(result.current.editingCell).toBeNull()
    expect(onDataChange).not.toHaveBeenCalled()
  })
})
