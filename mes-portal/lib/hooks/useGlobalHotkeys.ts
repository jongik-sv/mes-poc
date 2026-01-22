// lib/hooks/useGlobalHotkeys.ts
// TSK-05-06: 전역 키보드 단축키 훅
'use client'

import { useHotkeys } from 'react-hotkeys-hook'
import { useCallback } from 'react'

/**
 * 단축키 아이템 정의
 */
export interface HotkeyItem {
  /** 단축키 설명 */
  label: string
  /** 키 배열 (예: ['Ctrl', 'K']) */
  keys: string[]
  /** 추가 설명 (선택) */
  description?: string
}

/**
 * 단축키 카테고리 정의
 */
export interface HotkeyCategory {
  /** 카테고리 ID */
  id: string
  /** 카테고리 제목 */
  title: string
  /** 단축키 목록 */
  items: HotkeyItem[]
}

/**
 * useGlobalHotkeys 훅 옵션
 */
export interface UseGlobalHotkeysOptions {
  /** 전역 검색 열기 콜백 */
  onSearch?: () => void
  /** 단축키 도움말 열기 콜백 */
  onHelp?: () => void
  /** 저장 콜백 */
  onSave?: () => void
  /** 탭 닫기 콜백 */
  onCloseTab?: () => void
  /** 다음 탭 전환 콜백 */
  onNextTab?: () => void
  /** 이전 탭 전환 콜백 */
  onPrevTab?: () => void
  /** 새로고침 콜백 */
  onRefresh?: () => void
  /** 비활성화 여부 */
  disabled?: boolean
}

/**
 * 단축키 설정 인터페이스
 */
export interface HotkeyConfig {
  /** 키 조합 (react-hotkeys-hook 형식) */
  key: string
  /** 실행할 콜백 */
  callback: () => void
  /** 설명 */
  description: string
  /** 입력 필드에서도 활성화 여부 */
  enableOnInput?: boolean
  /** 브라우저 기본 동작 차단 여부 */
  preventDefault?: boolean
}

/**
 * 플랫폼에 따른 modifier 키 반환
 */
export function getModifierKey(): string {
  if (typeof navigator === 'undefined') return 'Ctrl'
  const isMac = navigator.platform.toUpperCase().includes('MAC')
  return isMac ? '⌘' : 'Ctrl'
}

/**
 * Mac 여부 확인
 */
export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.platform.toUpperCase().includes('MAC')
}

/**
 * 기본 단축키 카테고리 데이터
 */
export const HOTKEY_CATEGORIES: HotkeyCategory[] = [
  {
    id: 'global',
    title: '전역 단축키',
    items: [
      { label: '전역 검색 열기', keys: ['Ctrl', 'K'] },
      { label: '저장하기', keys: ['Ctrl', 'S'] },
      { label: '현재 탭 닫기', keys: ['Ctrl', 'W'] },
      { label: '단축키 도움말', keys: ['?'] },
    ],
  },
  {
    id: 'navigation',
    title: '탐색 단축키',
    items: [
      { label: '다음 탭으로 이동', keys: ['Ctrl', 'Tab'] },
      { label: '이전 탭으로 이동', keys: ['Ctrl', 'Shift', 'Tab'] },
    ],
  },
  {
    id: 'edit',
    title: '새로고침',
    items: [
      { label: '새로고침', keys: ['F5'] },
      { label: '새로고침', keys: ['Ctrl', 'R'] },
    ],
  },
]

/**
 * 전역 키보드 단축키 훅
 *
 * @example
 * ```tsx
 * useGlobalHotkeys({
 *   onSearch: () => setSearchOpen(true),
 *   onHelp: () => setHelpOpen(true),
 *   onSave: () => handleSave(),
 * })
 * ```
 */
export function useGlobalHotkeys(options: UseGlobalHotkeysOptions): void {
  const {
    onSearch,
    onHelp,
    onSave,
    onCloseTab,
    onNextTab,
    onPrevTab,
    onRefresh,
    disabled = false,
  } = options

  // Ctrl/Cmd + K: 전역 검색
  useHotkeys(
    'mod+k',
    useCallback(
      (e) => {
        e.preventDefault()
        onSearch?.()
      },
      [onSearch]
    ),
    {
      enabled: !disabled && !!onSearch,
      enableOnFormTags: false,
      preventDefault: true,
    }
  )

  // ?: 단축키 도움말
  useHotkeys(
    'shift+?',
    useCallback(() => {
      onHelp?.()
    }, [onHelp]),
    {
      enabled: !disabled && !!onHelp,
      enableOnFormTags: false,
    }
  )

  // Ctrl/Cmd + S: 저장
  useHotkeys(
    'mod+s',
    useCallback(
      (e) => {
        e.preventDefault()
        onSave?.()
      },
      [onSave]
    ),
    {
      enabled: !disabled && !!onSave,
      enableOnFormTags: true, // 저장은 입력 중에도 동작
      preventDefault: true,
    }
  )

  // Ctrl/Cmd + W: 탭 닫기
  useHotkeys(
    'mod+w',
    useCallback(
      (e) => {
        e.preventDefault()
        onCloseTab?.()
      },
      [onCloseTab]
    ),
    {
      enabled: !disabled && !!onCloseTab,
      enableOnFormTags: false,
      preventDefault: true,
    }
  )

  // Ctrl + Tab: 다음 탭
  useHotkeys(
    'ctrl+tab',
    useCallback(
      (e) => {
        e.preventDefault()
        onNextTab?.()
      },
      [onNextTab]
    ),
    {
      enabled: !disabled && !!onNextTab,
      enableOnFormTags: false,
      preventDefault: true,
    }
  )

  // Ctrl + Shift + Tab: 이전 탭
  useHotkeys(
    'ctrl+shift+tab',
    useCallback(
      (e) => {
        e.preventDefault()
        onPrevTab?.()
      },
      [onPrevTab]
    ),
    {
      enabled: !disabled && !!onPrevTab,
      enableOnFormTags: false,
      preventDefault: true,
    }
  )

  // F5 또는 Ctrl/Cmd + R: 새로고침
  useHotkeys(
    'f5, mod+r',
    useCallback(
      (e) => {
        e.preventDefault()
        onRefresh?.()
      },
      [onRefresh]
    ),
    {
      enabled: !disabled && !!onRefresh,
      enableOnFormTags: false,
      preventDefault: true,
    }
  )
}
