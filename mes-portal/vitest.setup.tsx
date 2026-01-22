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

// Ant Design theme.useToken mock
const mockToken = {
  colorPrimary: '#2563EB',
  colorPrimaryHover: '#1D4ED8',
  colorPrimaryBg: '#DBEAFE',
  colorSuccess: '#16A34A',
  colorWarning: '#D97706',
  colorError: '#DC2626',
  colorErrorBg: '#FEE2E2',
  colorInfo: '#0284C7',
  colorText: '#0F172A',
  colorTextSecondary: '#475569',
  colorTextTertiary: '#64748B',
  colorTextQuaternary: '#94A3B8',
  colorBgContainer: '#FFFFFF',
  colorBgElevated: '#FFFFFF',
  colorBgLayout: '#F8FAFC',
  colorBorder: '#E2E8F0',
  colorBorderSecondary: '#F1F5F9',
  colorFill: '#F1F5F9',
  colorFillSecondary: '#F8FAFC',
  borderRadius: 6,
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
}

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual as object,
    theme: {
      ...(actual as { theme: object }).theme,
      useToken: () => ({ token: mockToken }),
    },
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
