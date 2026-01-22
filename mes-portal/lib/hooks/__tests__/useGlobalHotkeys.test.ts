// lib/hooks/__tests__/useGlobalHotkeys.test.ts
// TSK-05-06: useGlobalHotkeys 훅 단위 테스트
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEffect } from 'react'
import { useGlobalHotkeys, type HotkeyConfig, HOTKEY_CATEGORIES } from '../useGlobalHotkeys'

// 전역 핸들러 저장용 배열
let activeHandlers: Array<(e: KeyboardEvent) => void> = []

// Mock react-hotkeys-hook - useEffect 사용하여 cleanup 보장
vi.mock('react-hotkeys-hook', () => ({
  useHotkeys: (keys: string, callback: (e: KeyboardEvent) => void, options?: Record<string, unknown>) => {
    // useEffect를 사용하여 cleanup이 제대로 작동하도록 함
    useEffect(() => {
      // 옵션의 enabled 체크
      if (options?.enabled === false) {
        return
      }

      // 테스트에서 직접 키 이벤트를 시뮬레이션
      const handler = (e: KeyboardEvent) => {
        const keyParts = keys.toLowerCase().split('+')
        const key = keyParts[keyParts.length - 1]
        const needsCtrl = keyParts.includes('ctrl') || keyParts.includes('mod')
        const needsMeta = keyParts.includes('meta') || keyParts.includes('mod')
        const needsShift = keyParts.includes('shift')

        const eventKey = e.key.toLowerCase()
        const ctrlMatch = !needsCtrl || e.ctrlKey || e.metaKey
        const metaMatch = !needsMeta || e.metaKey || e.ctrlKey
        const shiftMatch = !needsShift || e.shiftKey

        // 입력 필드 체크
        const target = e.target as HTMLElement
        const isInputElement =
          target?.tagName === 'INPUT' ||
          target?.tagName === 'TEXTAREA' ||
          target?.isContentEditable

        if (isInputElement && options?.enableOnFormTags === false) {
          return
        }

        if (eventKey === key && ctrlMatch && metaMatch && shiftMatch) {
          if (options?.preventDefault) {
            e.preventDefault()
          }
          // 콜백에 mock 이벤트 객체 전달
          callback(e)
        }
      }

      document.addEventListener('keydown', handler)
      activeHandlers.push(handler)

      // Cleanup
      return () => {
        document.removeEventListener('keydown', handler)
        activeHandlers = activeHandlers.filter((h) => h !== handler)
      }
    }, [keys, callback, options?.enabled, options?.enableOnFormTags, options?.preventDefault])
  },
}))

describe('useGlobalHotkeys', () => {
  let openSearchMock: ReturnType<typeof vi.fn>
  let openHelpMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    openSearchMock = vi.fn()
    openHelpMock = vi.fn()
    document.body.innerHTML = ''
    // 활성 핸들러 정리
    activeHandlers.forEach((h) => document.removeEventListener('keydown', h))
    activeHandlers = []
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('UT-0506-001: Ctrl+K 키 조합 감지', () => {
    it('Ctrl+K 입력 시 전역 검색 콜백이 호출된다', () => {
      renderHook(() =>
        useGlobalHotkeys({
          onSearch: openSearchMock,
          onHelp: openHelpMock,
        })
      )

      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(openSearchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('UT-0506-002: Cmd+K (Mac) 키 조합 감지', () => {
    it('Cmd+K (metaKey) 입력 시 전역 검색 콜백이 호출된다', () => {
      renderHook(() =>
        useGlobalHotkeys({
          onSearch: openSearchMock,
          onHelp: openHelpMock,
        })
      )

      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(openSearchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('UT-0506-003: 입력 필드 포커스 시 단축키 무시', () => {
    it('input 요소에 포커스 시 Ctrl+K가 동작하지 않는다', () => {
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      renderHook(() =>
        useGlobalHotkeys({
          onSearch: openSearchMock,
          onHelp: openHelpMock,
        })
      )

      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: input })
      document.dispatchEvent(event)

      expect(openSearchMock).not.toHaveBeenCalled()
    })

    it('textarea 요소에 포커스 시 ? 키가 동작하지 않는다', () => {
      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.focus()

      renderHook(() =>
        useGlobalHotkeys({
          onSearch: openSearchMock,
          onHelp: openHelpMock,
        })
      )

      const event = new KeyboardEvent('keydown', {
        key: '?',
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: textarea })
      document.dispatchEvent(event)

      expect(openHelpMock).not.toHaveBeenCalled()
    })
  })

  describe('UT-0506-004: 등록/해제 lifecycle', () => {
    it('컴포넌트 언마운트 시 이벤트 리스너가 해제된다', () => {
      const { unmount } = renderHook(() =>
        useGlobalHotkeys({
          onSearch: openSearchMock,
          onHelp: openHelpMock,
        })
      )

      unmount()

      // 언마운트 후 키 이벤트가 동작하지 않아야 함
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(openSearchMock).not.toHaveBeenCalled()
    })
  })

  describe('UT-0506-011: ? 키로 도움말 열기', () => {
    it('? 키 입력 시 도움말 콜백이 호출된다', () => {
      renderHook(() =>
        useGlobalHotkeys({
          onSearch: openSearchMock,
          onHelp: openHelpMock,
        })
      )

      const event = new KeyboardEvent('keydown', {
        key: '?',
        shiftKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(openHelpMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('UT-0506-005: Ctrl+W 탭 닫기', () => {
    it('Ctrl+W 입력 시 탭 닫기 콜백이 호출된다', () => {
      const closeTabMock = vi.fn()

      renderHook(() =>
        useGlobalHotkeys({
          onSearch: openSearchMock,
          onHelp: openHelpMock,
          onCloseTab: closeTabMock,
        })
      )

      const event = new KeyboardEvent('keydown', {
        key: 'w',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(closeTabMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('UT-0506-007: Ctrl+S 저장', () => {
    it('Ctrl+S 입력 시 저장 콜백이 호출된다', () => {
      const saveMock = vi.fn()

      renderHook(() =>
        useGlobalHotkeys({
          onSearch: openSearchMock,
          onHelp: openHelpMock,
          onSave: saveMock,
        })
      )

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(saveMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('UT-0506-009: Ctrl+Tab 다음 탭', () => {
    it('Ctrl+Tab 입력 시 다음 탭 콜백이 호출된다', () => {
      const nextTabMock = vi.fn()

      renderHook(() =>
        useGlobalHotkeys({
          onSearch: openSearchMock,
          onHelp: openHelpMock,
          onNextTab: nextTabMock,
        })
      )

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(nextTabMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('UT-0506-010: Ctrl+Shift+Tab 이전 탭', () => {
    it('Ctrl+Shift+Tab 입력 시 이전 탭 콜백이 호출된다', () => {
      const prevTabMock = vi.fn()

      renderHook(() =>
        useGlobalHotkeys({
          onSearch: openSearchMock,
          onHelp: openHelpMock,
          onPrevTab: prevTabMock,
        })
      )

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(prevTabMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('HOTKEY_CATEGORIES 데이터', () => {
    it('단축키 카테고리 데이터가 올바르게 정의되어 있다', () => {
      expect(HOTKEY_CATEGORIES).toBeDefined()
      expect(Array.isArray(HOTKEY_CATEGORIES)).toBe(true)
      expect(HOTKEY_CATEGORIES.length).toBeGreaterThan(0)

      // 각 카테고리에 필수 필드가 있는지 확인
      HOTKEY_CATEGORIES.forEach((category) => {
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('title')
        expect(category).toHaveProperty('items')
        expect(Array.isArray(category.items)).toBe(true)

        // 각 아이템에 필수 필드가 있는지 확인
        category.items.forEach((item) => {
          expect(item).toHaveProperty('label')
          expect(item).toHaveProperty('keys')
          expect(Array.isArray(item.keys)).toBe(true)
        })
      })
    })

    it('전역 검색 단축키가 포함되어 있다', () => {
      const globalCategory = HOTKEY_CATEGORIES.find((c) => c.id === 'global')
      expect(globalCategory).toBeDefined()

      const searchItem = globalCategory?.items.find((i) => i.keys.includes('K'))
      expect(searchItem).toBeDefined()
    })
  })

  describe('getModifierKey 유틸리티', () => {
    it('플랫폼에 따른 modifier 키를 반환한다', async () => {
      const { getModifierKey } = await import('../useGlobalHotkeys')

      // navigator.platform mock
      const originalPlatform = navigator.platform

      // Mac
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      })
      expect(getModifierKey()).toBe('⌘')

      // Windows
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        configurable: true,
      })
      expect(getModifierKey()).toBe('Ctrl')

      // 복원
      Object.defineProperty(navigator, 'platform', {
        value: originalPlatform,
        configurable: true,
      })
    })
  })
})
