// screens/sample/DataTableShowcase/__tests__/useFeatureToggle.test.ts
// UT-023: 기능 토글 테스트

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFeatureToggle } from '../hooks/useFeatureToggle'
import { DEFAULT_FEATURE_TOGGLES } from '../types'

describe('useFeatureToggle', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFeatureToggle())

    expect(result.current.features).toEqual(DEFAULT_FEATURE_TOGGLES)
  })

  it('should initialize with custom initial state', () => {
    const { result } = renderHook(() =>
      useFeatureToggle({ sorting: false, filtering: false })
    )

    expect(result.current.features.sorting).toBe(false)
    expect(result.current.features.filtering).toBe(false)
    expect(result.current.features.pagination).toBe(true) // 기본값 유지
  })

  it('should toggle features on/off', () => {
    const { result } = renderHook(() => useFeatureToggle())

    // 초기값 확인
    expect(result.current.features.sorting).toBe(true)

    // 토글 OFF
    act(() => {
      result.current.toggleFeature('sorting')
    })
    expect(result.current.features.sorting).toBe(false)

    // 토글 ON
    act(() => {
      result.current.toggleFeature('sorting')
    })
    expect(result.current.features.sorting).toBe(true)
  })

  it('should set feature directly', () => {
    const { result } = renderHook(() => useFeatureToggle())

    act(() => {
      result.current.setFeature('virtualScroll', true)
    })
    expect(result.current.features.virtualScroll).toBe(true)

    act(() => {
      result.current.setFeature('virtualScroll', false)
    })
    expect(result.current.features.virtualScroll).toBe(false)
  })

  it('should enable all features', () => {
    const { result } = renderHook(() => useFeatureToggle())

    act(() => {
      result.current.enableAll()
    })

    Object.values(result.current.features).forEach((value) => {
      expect(value).toBe(true)
    })
  })

  it('should disable all features', () => {
    const { result } = renderHook(() => useFeatureToggle())

    act(() => {
      result.current.disableAll()
    })

    Object.values(result.current.features).forEach((value) => {
      expect(value).toBe(false)
    })
  })

  it('should reset to default values', () => {
    const { result } = renderHook(() => useFeatureToggle())

    // 모든 기능 비활성화
    act(() => {
      result.current.disableAll()
    })

    // 기본값으로 초기화
    act(() => {
      result.current.resetToDefault()
    })

    expect(result.current.features).toEqual(DEFAULT_FEATURE_TOGGLES)
  })
})
