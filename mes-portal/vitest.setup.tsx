// setImmediate 폴리필 - 반드시 최상단에 위치 (React scheduler 로드 전)
import { setImmediate, clearImmediate } from 'timers'
globalThis.setImmediate = setImmediate
globalThis.clearImmediate = clearImmediate

import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, afterAll, vi } from 'vitest'

// 각 테스트 후 cleanup
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.useRealTimers()
})

// 모든 테스트 완료 후 강제 정리
afterAll(() => {
  vi.restoreAllMocks()
  vi.clearAllTimers()
})

// Prisma Mock
vi.mock('@/lib/prisma')

// matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
})

// ResizeObserver mock
globalThis.ResizeObserver = class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
