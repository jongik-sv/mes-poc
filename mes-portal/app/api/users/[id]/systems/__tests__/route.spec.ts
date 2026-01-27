/**
 * 사용자 시스템-메뉴셋 API 테스트
 * GET /api/users/:id/systems - 시스템-메뉴셋 매핑 목록
 * POST /api/users/:id/systems - 시스템 접근 설정
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
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    menuSet: { findUnique: vi.fn() },
    userSystemMenuSetHistory: { create: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}))

import { GET, POST } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockPrisma = prisma as unknown as {
  user: { findUnique: ReturnType<typeof vi.fn> }
  userSystemMenuSet: {
    findMany: ReturnType<typeof vi.fn>
    upsert: ReturnType<typeof vi.fn>
  }
  menuSet: { findUnique: ReturnType<typeof vi.fn> }
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

const mockNonAdminUser = {
  userId: 'user1',
  userRoleGroups: [
    { roleGroup: { roleGroupRoles: [{ role: { roleCd: 'OPERATOR' } }] } },
  ],
}

const paramsFor = (id: string) => ({ params: Promise.resolve({ id }) })

describe('사용자 시스템-메뉴셋 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/users/:id/systems', () => {
    it('인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)
      const res = await GET(createRequest('http://localhost/api/users/user1/systems'), paramsFor('user1'))
      expect(res.status).toBe(401)
    })

    it('존재하지 않는 사용자는 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique.mockResolvedValue(null)
      const res = await GET(createRequest('http://localhost/api/users/nouser/systems'), paramsFor('nouser'))
      expect(res.status).toBe(404)
    })

    it('시스템-메뉴셋 목록 조회 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique.mockResolvedValue({ userId: 'user1' })
      mockPrisma.userSystemMenuSet.findMany.mockResolvedValue([
        {
          systemId: 'mes-factory1',
          menuSetId: 1,
          menuSet: {
            menuSetId: 1,
            menuSetCd: 'MS_DEFAULT',
            name: '기본 메뉴셋',
            system: { systemId: 'mes-factory1', name: 'MES Factory 1' },
          },
          createdAt: new Date(),
        },
      ])

      const res = await GET(createRequest('http://localhost/api/users/user1/systems'), paramsFor('user1'))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.systems).toHaveLength(1)
      expect(data.data.systems[0].systemId).toBe('mes-factory1')
    })
  })

  describe('POST /api/users/:id/systems', () => {
    it('인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)
      const res = await POST(
        createRequest('http://localhost/api/users/user1/systems', {
          method: 'POST',
          body: { systemId: 'mes-factory1', menuSetId: 1 },
        }),
        paramsFor('user1')
      )
      expect(res.status).toBe(401)
    })

    it('관리자가 아니면 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)
      const res = await POST(
        createRequest('http://localhost/api/users/user2/systems', {
          method: 'POST',
          body: { systemId: 'mes-factory1', menuSetId: 1 },
        }),
        paramsFor('user2')
      )
      expect(res.status).toBe(403)
    })

    it('필수 필드 누락 시 400 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockAdminUser)
        .mockResolvedValueOnce({ userId: 'user1' })

      const res = await POST(
        createRequest('http://localhost/api/users/user1/systems', {
          method: 'POST',
          body: { systemId: 'mes-factory1' },
        }),
        paramsFor('user1')
      )
      expect(res.status).toBe(400)
    })

    it('시스템 접근 설정 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockAdminUser)
        .mockResolvedValueOnce({ userId: 'user1' })

      mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          userSystemMenuSet: {
            findUnique: vi.fn().mockResolvedValue(null),
            upsert: vi.fn().mockResolvedValue({
              userId: 'user1',
              systemId: 'mes-factory1',
              menuSetId: 1,
              createdAt: new Date(),
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

      const res = await POST(
        createRequest('http://localhost/api/users/user1/systems', {
          method: 'POST',
          body: { systemId: 'mes-factory1', menuSetId: 1 },
        }),
        paramsFor('user1')
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.systemId).toBe('mes-factory1')
    })
  })
})
