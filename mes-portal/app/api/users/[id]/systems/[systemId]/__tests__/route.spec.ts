/**
 * 사용자 시스템별 메뉴셋 API 테스트
 * PUT /api/users/:id/systems/:systemId - 메뉴셋 변경
 * DELETE /api/users/:id/systems/:systemId - 시스템 접근 해제
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    user: { findUnique: vi.fn() },
    userSystemMenuSet: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    userSystemMenuSetHistory: { create: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}))

import { PUT, DELETE } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockPrisma = prisma as unknown as {
  user: { findUnique: ReturnType<typeof vi.fn> }
  userSystemMenuSet: {
    findUnique: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
  userSystemMenuSetHistory: { create: ReturnType<typeof vi.fn> }
  auditLog: { create: ReturnType<typeof vi.fn> }
  $transaction: ReturnType<typeof vi.fn>
}

function createRequest(url: string, options?: { method?: string; body?: object }): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'), {
    method: options?.method || 'GET',
    body: options?.body ? JSON.stringify(options.body) : undefined,
    headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
  })
}

const mockAdminUser = {
  userId: 'admin1',
  userRoleGroups: [
    { roleGroup: { roleGroupRoles: [{ role: { roleCd: 'SYSTEM_ADMIN' } }] } },
  ],
}

const paramsFor = (id: string, systemId: string) => ({
  params: Promise.resolve({ id, systemId }),
})

describe('사용자 시스템별 메뉴셋 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PUT /api/users/:id/systems/:systemId', () => {
    it('인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)
      const res = await PUT(
        createRequest('http://localhost/api/users/user1/systems/mes-factory1', {
          method: 'PUT',
          body: { menuSetId: 2 },
        }),
        paramsFor('user1', 'mes-factory1')
      )
      expect(res.status).toBe(401)
    })

    it('관리자가 아니면 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } })
      mockPrisma.user.findUnique.mockResolvedValue({
        userId: 'user1',
        userRoleGroups: [
          { roleGroup: { roleGroupRoles: [{ role: { roleCd: 'OPERATOR' } }] } },
        ],
      })
      const res = await PUT(
        createRequest('http://localhost/api/users/user1/systems/mes-factory1', {
          method: 'PUT',
          body: { menuSetId: 2 },
        }),
        paramsFor('user1', 'mes-factory1')
      )
      expect(res.status).toBe(403)
    })

    it('매핑이 존재하지 않으면 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)

      mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          userSystemMenuSet: {
            findUnique: vi.fn().mockResolvedValue(null),
          },
        }
        return fn(tx)
      })

      const res = await PUT(
        createRequest('http://localhost/api/users/user1/systems/mes-factory1', {
          method: 'PUT',
          body: { menuSetId: 2 },
        }),
        paramsFor('user1', 'mes-factory1')
      )
      expect(res.status).toBe(404)
    })

    it('menuSetId 누락 시 400 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)

      const res = await PUT(
        createRequest('http://localhost/api/users/user1/systems/mes-factory1', {
          method: 'PUT',
          body: {},
        }),
        paramsFor('user1', 'mes-factory1')
      )
      expect(res.status).toBe(400)
    })

    it('메뉴셋 변경 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)

      mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          userSystemMenuSet: {
            findUnique: vi.fn().mockResolvedValue({
              userId: 'user1',
              systemId: 'mes-factory1',
              menuSetId: 1,
            }),
            update: vi.fn().mockResolvedValue({
              userId: 'user1',
              systemId: 'mes-factory1',
              menuSetId: 2,
            }),
          },
          userSystemMenuSetHistory: {
            create: vi.fn().mockResolvedValue({}),
          },
          auditLog: {
            create: vi.fn().mockResolvedValue({}),
          },
        }
        return fn(tx)
      })

      const res = await PUT(
        createRequest('http://localhost/api/users/user1/systems/mes-factory1', {
          method: 'PUT',
          body: { menuSetId: 2 },
        }),
        paramsFor('user1', 'mes-factory1')
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.menuSetId).toBe(2)
    })
  })

  describe('DELETE /api/users/:id/systems/:systemId', () => {
    it('인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)
      const res = await DELETE(
        createRequest('http://localhost/api/users/user1/systems/mes-factory1', { method: 'DELETE' }),
        paramsFor('user1', 'mes-factory1')
      )
      expect(res.status).toBe(401)
    })

    it('매핑이 없으면 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)

      mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          userSystemMenuSet: {
            findUnique: vi.fn().mockResolvedValue(null),
          },
        }
        return fn(tx)
      })

      const res = await DELETE(
        createRequest('http://localhost/api/users/user1/systems/mes-factory1', { method: 'DELETE' }),
        paramsFor('user1', 'mes-factory1')
      )
      expect(res.status).toBe(404)
    })

    it('시스템 접근 해제 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)

      mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          userSystemMenuSet: {
            findUnique: vi.fn().mockResolvedValue({
              userId: 'user1',
              systemId: 'mes-factory1',
              menuSetId: 1,
            }),
            delete: vi.fn().mockResolvedValue({}),
          },
          userSystemMenuSetHistory: {
            create: vi.fn().mockResolvedValue({}),
          },
          auditLog: {
            create: vi.fn().mockResolvedValue({}),
          },
        }
        return fn(tx)
      })

      const res = await DELETE(
        createRequest('http://localhost/api/users/user1/systems/mes-factory1', { method: 'DELETE' }),
        paramsFor('user1', 'mes-factory1')
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})
