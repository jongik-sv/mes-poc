/**
 * Prisma Mock for Unit Tests (Vitest compatible)
 *
 * vitest가 자동으로 이 파일을 찾아서 '@/lib/prisma'를 mock합니다.
 * vitest의 vi.fn()을 사용하여 PrismaClient 메서드를 mock합니다.
 */

import { vi, beforeEach } from 'vitest'

function createRecursiveProxy(): Record<string, unknown> {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === 'then') return undefined
        if (prop === '$transaction') {
          return vi.fn().mockImplementation(async (fn: (tx: unknown) => unknown) => {
            return fn(createRecursiveProxy())
          })
        }
        if (prop === '$connect' || prop === '$disconnect') {
          return vi.fn()
        }
        return createModelProxy()
      },
    }
  )
}

function createModelProxy(): Record<string, unknown> {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === 'then') return undefined
        return vi.fn().mockResolvedValue(null)
      },
    }
  )
}

const prismaMock = createRecursiveProxy()

beforeEach(() => {
  // Reset is handled by vi.clearAllMocks() in setup
})

export const prisma = prismaMock
export default prismaMock
