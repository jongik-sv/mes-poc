// screens/sample/DataTableShowcase/__tests__/useColumnSettings.test.ts
// UT-025: 컬럼 설정 저장 테스트

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useColumnSettings } from '../hooks/useColumnSettings'

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useColumnSettings', () => {
  const columnKeys = ['name', 'category', 'quantity', 'price']

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('should initialize with default settings', () => {
    const { result } = renderHook(() => useColumnSettings(columnKeys))

    expect(result.current.settings).toHaveLength(4)
    expect(result.current.settings[0]).toEqual({
      key: 'name',
      width: 100,
      order: 0,
      visible: true,
    })
  })

  it('should save/load from localStorage', () => {
    const savedSettings = [
      { key: 'name', width: 200, order: 0, visible: true },
      { key: 'category', width: 150, order: 1, visible: true },
      { key: 'quantity', width: 100, order: 2, visible: false },
      { key: 'price', width: 120, order: 3, visible: true },
    ]

    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedSettings))

    const { result } = renderHook(() => useColumnSettings(columnKeys))

    // 저장된 설정이 로드되어야 함
    expect(result.current.settings[0].width).toBe(200)
    expect(result.current.settings[2].visible).toBe(false)
  })

  it('should update column width', () => {
    const { result } = renderHook(() => useColumnSettings(columnKeys))

    act(() => {
      result.current.updateWidth('name', 250)
    })

    const nameSetting = result.current.getColumnSetting('name')
    expect(nameSetting?.width).toBe(250)
  })

  it('should update column order', () => {
    const { result } = renderHook(() => useColumnSettings(columnKeys))

    act(() => {
      result.current.updateOrder('name', 3)
    })

    const nameSetting = result.current.getColumnSetting('name')
    expect(nameSetting?.order).toBe(3)
  })

  it('should toggle column visibility', () => {
    const { result } = renderHook(() => useColumnSettings(columnKeys))

    expect(result.current.getColumnSetting('name')?.visible).toBe(true)

    act(() => {
      result.current.toggleVisibility('name')
    })

    expect(result.current.getColumnSetting('name')?.visible).toBe(false)

    act(() => {
      result.current.toggleVisibility('name')
    })

    expect(result.current.getColumnSetting('name')?.visible).toBe(true)
  })

  it('should reorder columns', () => {
    const { result } = renderHook(() => useColumnSettings(columnKeys))

    const newOrder = ['price', 'quantity', 'category', 'name']

    act(() => {
      result.current.reorderColumns(newOrder)
    })

    expect(result.current.getColumnSetting('price')?.order).toBe(0)
    expect(result.current.getColumnSetting('name')?.order).toBe(3)
  })

  it('should save settings to localStorage', () => {
    const { result } = renderHook(() => useColumnSettings(columnKeys))

    act(() => {
      result.current.updateWidth('name', 300)
    })

    act(() => {
      result.current.saveSettings()
    })

    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('should reset settings', () => {
    const { result } = renderHook(() => useColumnSettings(columnKeys))

    act(() => {
      result.current.updateWidth('name', 500)
      result.current.toggleVisibility('category')
    })

    expect(result.current.getColumnSetting('name')?.width).toBe(500)
    expect(result.current.getColumnSetting('category')?.visible).toBe(false)

    act(() => {
      result.current.resetSettings()
    })

    expect(result.current.getColumnSetting('name')?.width).toBe(100)
    expect(result.current.getColumnSetting('category')?.visible).toBe(true)
    expect(localStorageMock.removeItem).toHaveBeenCalled()
  })

  it('should return sorted settings', () => {
    const { result } = renderHook(() => useColumnSettings(columnKeys))

    act(() => {
      result.current.updateOrder('name', 3)
      result.current.updateOrder('price', 0)
    })

    const sorted = result.current.sortedSettings
    expect(sorted[0].key).toBe('price')
    expect(sorted[3].key).toBe('name')
  })
})
