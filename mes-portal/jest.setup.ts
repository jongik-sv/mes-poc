import { TextEncoder, TextDecoder } from 'util'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// TextEncoder/TextDecoder 폴리필 (Prisma 클라이언트에서 필요)
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

// React 19 act() 환경 설정
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// React 19 AggregateError 처리를 위한 설정
// Ant Design 컴포넌트의 비동기 작업으로 인한 에러 억제
const originalConsoleError = console.error
console.error = (...args) => {
  // React DOM 경고 억제 (collapsedWidth 등)
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('React does not recognize') ||
      args[0].includes('Warning: An update to') ||
      args[0].includes('act(...)'))
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}

// 각 테스트 후 자동 cleanup
afterEach(() => {
  cleanup()
})

// 전체 테스트 완료 후 Prisma 연결 종료
afterAll(async () => {
  try {
    // 동적 import로 prisma 연결이 있을 때만 종료
    const { prisma } = await import('./lib/prisma')
    await prisma.$disconnect()
  } catch {
    // prisma가 로드되지 않은 경우 무시
  }
})

// matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// ResizeObserver mock (class 형태로 정의)
class ResizeObserverMock {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}
global.ResizeObserver = ResizeObserverMock

// MessageChannel 폴리필 (Ant Design @rc-component/form에서 필요)
if (typeof global.MessageChannel === 'undefined') {
  class MessageChannelMock {
    port1: { onmessage: ((event: { data: unknown }) => void) | null }
    port2: { postMessage: (data: unknown) => void }

    constructor() {
      this.port1 = { onmessage: null }
      this.port2 = {
        postMessage: (data: unknown) => {
          setTimeout(() => {
            if (this.port1.onmessage) {
              this.port1.onmessage({ data })
            }
          }, 0)
        },
      }
    }
  }
  global.MessageChannel = MessageChannelMock as unknown as typeof MessageChannel
}

// Web API 폴리필 (Next.js API Route 테스트용)
// 기본 Mock 클래스 생성
if (typeof global.Request === 'undefined') {
  class MockRequest {
    url: string
    method: string
    headers: Map<string, string>
    body: string | null

    constructor(
      input: string | MockRequest,
      init?: { method?: string; headers?: Record<string, string>; body?: string }
    ) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init?.method || 'GET'
      this.headers = new Map(Object.entries(init?.headers || {}))
      this.body = init?.body || null
    }

    async json() {
      return JSON.parse(this.body || '{}')
    }
  }
  global.Request = MockRequest as unknown as typeof Request
}

if (typeof global.Response === 'undefined') {
  class MockResponse {
    body: string
    status: number
    headers: Map<string, string>
    ok: boolean

    constructor(body?: string | object | null, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body === null || body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body)
      this.status = init?.status || 200
      this.ok = this.status >= 200 && this.status < 300
      this.headers = new Map(Object.entries(init?.headers || {}))
    }

    async json() {
      return JSON.parse(this.body)
    }

    async text() {
      return this.body
    }

    static json(data: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      const response = new MockResponse(JSON.stringify(data), init)
      response.headers.set('content-type', 'application/json')
      return response
    }
  }
  global.Response = MockResponse as unknown as typeof Response
}

if (typeof global.Headers === 'undefined') {
  global.Headers = Map as unknown as typeof Headers
}
