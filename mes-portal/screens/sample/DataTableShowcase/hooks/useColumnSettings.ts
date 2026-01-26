// screens/sample/DataTableShowcase/hooks/useColumnSettings.ts
// 컬럼 설정 영속화 훅

import { useState, useCallback, useEffect, useRef } from 'react'
import type { ColumnSettings } from '../types'

const STORAGE_KEY = 'data-table-showcase-column-settings'

/**
 * 컬럼 설정 영속화 훅
 * BR-004: localStorage에 컬럼 설정 저장/복원
 */
export function useColumnSettings(columnKeys: string[]) {
  // columnKeys 배열의 안정적인 비교를 위해 직렬화된 값 사용
  const columnKeysStr = JSON.stringify(columnKeys)
  const isInitialized = useRef(false)

  const [settings, setSettings] = useState<ColumnSettings[]>(() => {
    // 초기값: 기본 설정
    return columnKeys.map((key, index) => ({
      key,
      width: 100,
      order: index,
      visible: true,
    }))
  })

  /**
   * localStorage에서 설정 로드 (초기 1회만 실행)
   */
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as ColumnSettings[]
        const keys = JSON.parse(columnKeysStr) as string[]
        // 기존 컬럼과 병합 (새 컬럼이 추가된 경우 대비)
        const merged = keys.map((key, index) => {
          const existing = parsed.find((s) => s.key === key)
          return existing || { key, width: 100, order: index, visible: true }
        })
        setSettings(merged)
      }
    } catch {
      // localStorage 접근 실패 시 기본값 유지
    }
  }, [columnKeysStr])

  /**
   * localStorage에 설정 저장
   */
  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // localStorage 저장 실패 무시
    }
  }, [settings])

  /**
   * 컬럼 너비 업데이트
   */
  const updateWidth = useCallback((columnKey: string, width: number) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === columnKey ? { ...s, width } : s))
    )
  }, [])

  /**
   * 컬럼 순서 업데이트
   */
  const updateOrder = useCallback((columnKey: string, order: number) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === columnKey ? { ...s, order } : s))
    )
  }, [])

  /**
   * 컬럼 표시/숨김 토글
   */
  const toggleVisibility = useCallback((columnKey: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === columnKey ? { ...s, visible: !s.visible } : s))
    )
  }, [])

  /**
   * 컬럼 순서 일괄 업데이트
   */
  const reorderColumns = useCallback((orderedKeys: string[]) => {
    setSettings((prev) =>
      prev.map((s) => ({
        ...s,
        order: orderedKeys.indexOf(s.key),
      }))
    )
  }, [])

  /**
   * 설정 초기화
   */
  const resetSettings = useCallback(() => {
    const keys = JSON.parse(columnKeysStr) as string[]
    const defaultSettings = keys.map((key, index) => ({
      key,
      width: 100,
      order: index,
      visible: true,
    }))
    setSettings(defaultSettings)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 무시
    }
  }, [columnKeysStr])

  /**
   * 특정 컬럼 설정 가져오기
   */
  const getColumnSetting = useCallback(
    (columnKey: string) => {
      return settings.find((s) => s.key === columnKey)
    },
    [settings]
  )

  /**
   * 정렬된 컬럼 설정 가져오기
   */
  const sortedSettings = [...settings].sort((a, b) => a.order - b.order)

  return {
    settings,
    sortedSettings,
    saveSettings,
    updateWidth,
    updateOrder,
    toggleVisibility,
    reorderColumns,
    resetSettings,
    getColumnSetting,
  }
}
