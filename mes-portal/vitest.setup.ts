import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, afterAll, vi } from 'vitest'

// 각 테스트 후 자동 cleanup
afterEach(() => {
  cleanup()
})

// 전체 테스트 완료 후 Prisma 연결 종료
afterAll(async () => {
  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.$disconnect()
  } catch {
    // prisma가 로드되지 않은 경우 무시
  }
})

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
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// ResizeObserver mock (class 형태로 정의)
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = ResizeObserverMock
