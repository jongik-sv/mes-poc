// screens/sample/DataTableShowcase/hooks/useFeatureToggle.ts
// 기능 토글 관리 훅

import { useState, useCallback } from 'react'
import type { FeatureToggles } from '../types'
import { DEFAULT_FEATURE_TOGGLES } from '../types'

/**
 * 기능 토글 관리 훅
 * BR-001: 12개 기능 각각 ON/OFF 토글 가능
 */
export function useFeatureToggle(initialState?: Partial<FeatureToggles>) {
  const [features, setFeatures] = useState<FeatureToggles>({
    ...DEFAULT_FEATURE_TOGGLES,
    ...initialState,
  })

  /**
   * 개별 기능 토글
   */
  const toggleFeature = useCallback((key: keyof FeatureToggles) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }, [])

  /**
   * 기능 상태 직접 설정
   */
  const setFeature = useCallback((key: keyof FeatureToggles, value: boolean) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  /**
   * 모든 기능 활성화
   */
  const enableAll = useCallback(() => {
    setFeatures({
      sorting: true,
      filtering: true,
      pagination: true,
      selection: true,
      resize: true,
      reorder: true,
      sticky: true,
      expandable: true,
      inlineEdit: true,
      rowDrag: true,
      virtualScroll: true,
      groupHeader: true,
      cellMerge: true,
    })
  }, [])

  /**
   * 모든 기능 비활성화
   */
  const disableAll = useCallback(() => {
    setFeatures({
      sorting: false,
      filtering: false,
      pagination: false,
      selection: false,
      resize: false,
      reorder: false,
      sticky: false,
      expandable: false,
      inlineEdit: false,
      rowDrag: false,
      virtualScroll: false,
      groupHeader: false,
      cellMerge: false,
    })
  }, [])

  /**
   * 기본값으로 초기화
   */
  const resetToDefault = useCallback(() => {
    setFeatures(DEFAULT_FEATURE_TOGGLES)
  }, [])

  return {
    features,
    toggleFeature,
    setFeature,
    enableAll,
    disableAll,
    resetToDefault,
  }
}
