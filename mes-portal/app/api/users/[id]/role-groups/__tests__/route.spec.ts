/**
 * 사용자 역할그룹 API 테스트
 * GET /api/users/:id/role-groups - 사용자 역할그룹 목록
 * POST /api/users/:id/role-groups - 역할그룹 할당 (전체 교체)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    user: { findUnique: vi.fn() },
    userRoleGroup: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    roleGroup: { findMany: vi.fn() },
    userRoleGroupHistory: { create: vi.fn(), createMany: vi.fn() },
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
  userRoleGroup: {
    findMany: ReturnType<typeof vi.fn>
    deleteMany: ReturnType<typeof vi.fn>
    createMany: ReturnType<typeof vi.fn>
  }
  roleGroup: { findMany: ReturnType<typeof vi.fn> }
  userRoleGroupHistory: { create: ReturnType<typeof vi.fn>; createMany: ReturnType<typeof vi.fn> }
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
    {
      roleGroup: {
        roleGroupRoles: [{ role: { roleCd: 'SYSTEM_ADMIN' } }],
      },
    },
  ],
}

const mockNonAdminUser = {
  userId: 'user1',
  userRoleGroups: [
    {
      roleGroup: {
        roleGroupRoles: [{ role: { roleCd: 'OPERATOR' } }],
      },
    },
  ],
}

const mockRoleGroupsList = [
  {
    roleGroupId: 1,
    roleGroup: {
      roleGroupId: 1,
      roleGroupCd: 'RG_PROD',
      name: '생산 그룹',
      description: '생산 관련',
      isActive: true,
    },
    assignedAt: new Date(),
    assignedBy: 'admin1',
  },
]

const paramsFor = (id: string) => ({ params: Promise.resolve({ id }) })

describe('사용자 역할그룹 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/users/:id/role-groups', () => {
    it('인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)
      const req = createRequest('http://localhost/api/users/user1/role-groups')
      const res = await GET(req, paramsFor('user1'))
      expect(res.status).toBe(401)
    })

    it('존재하지 않는 사용자는 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique.mockResolvedValue(null)
      const req = createRequest('http://localhost/api/users/nouser/role-groups')
      const res = await GET(req, paramsFor('nouser'))
      expect(res.status).toBe(404)
    })

    it('사용자 역할그룹 목록 조회 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique.mockResolvedValue({ userId: 'user1' })
      mockPrisma.userRoleGroup.findMany.mockResolvedValue(mockRoleGroupsList)

      const req = createRequest('http://localhost/api/users/user1/role-groups')
      const res = await GET(req, paramsFor('user1'))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.roleGroups).toHaveLength(1)
      expect(data.data.roleGroups[0].roleGroupCd).toBe('RG_PROD')
    })
  })

  describe('POST /api/users/:id/role-groups', () => {
    it('인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)
      const req = createRequest('http://localhost/api/users/user1/role-groups', {
        method: 'POST',
        body: { roleGroupIds: [1] },
      })
      const res = await POST(req, paramsFor('user1'))
      expect(res.status).toBe(401)
    })

    it('관리자가 아니면 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const req = createRequest('http://localhost/api/users/user2/role-groups', {
        method: 'POST',
        body: { roleGroupIds: [1] },
      })
      const res = await POST(req, paramsFor('user2'))
      expect(res.status).toBe(403)
    })

    it('존재하지 않는 사용자는 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockAdminUser)
        .mockResolvedValueOnce(null)

      const req = createRequest('http://localhost/api/users/nouser/role-groups', {
        method: 'POST',
        body: { roleGroupIds: [1] },
      })
      const res = await POST(req, paramsFor('nouser'))
      expect(res.status).toBe(404)
    })

    it('roleGroupIds 누락 시 400 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockAdminUser)
        .mockResolvedValueOnce({ userId: 'user1' })

      const req = createRequest('http://localhost/api/users/user1/role-groups', {
        method: 'POST',
        body: {},
      })
      const res = await POST(req, paramsFor('user1'))
      expect(res.status).toBe(400)
    })

    it('역할그룹 할당 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockAdminUser)
        .mockResolvedValueOnce({ userId: 'user1' })

      const newRoleGroups = [
        {
          roleGroup: {
            roleGroupId: 1,
            roleGroupCd: 'RG_PROD',
            name: '생산 그룹',
          },
        },
        {
          roleGroup: {
            roleGroupId: 2,
            roleGroupCd: 'RG_QA',
            name: '품질 그룹',
          },
        },
      ]

      mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          userRoleGroup: {
            findMany: vi.fn()
              .mockResolvedValueOnce([{ roleGroupId: 3 }]) // existing
              .mockResolvedValueOnce(newRoleGroups), // after update
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
            createMany: vi.fn().mockResolvedValue({ count: 2 }),
          },
          userRoleGroupHistory: {
            createMany: vi.fn().mockResolvedValue({ count: 2 }),
          },
          auditLog: {
            create: vi.fn().mockResolvedValue({}),
          },
        }
        return fn(tx)
      })

      const req = createRequest('http://localhost/api/users/user1/role-groups', {
        method: 'POST',
        body: { roleGroupIds: [1, 2] },
      })
      const res = await POST(req, paramsFor('user1'))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.roleGroups).toHaveLength(2)
    })

    it('빈 배열로 모든 역할그룹 해제', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockAdminUser)
        .mockResolvedValueOnce({ userId: 'user1' })

      mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          userRoleGroup: {
            findMany: vi.fn()
              .mockResolvedValueOnce([{ roleGroupId: 1 }])
              .mockResolvedValueOnce([]),
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
            createMany: vi.fn().mockResolvedValue({ count: 0 }),
          },
          userRoleGroupHistory: {
            createMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          auditLog: {
            create: vi.fn().mockResolvedValue({}),
          },
        }
        return fn(tx)
      })

      const req = createRequest('http://localhost/api/users/user1/role-groups', {
        method: 'POST',
        body: { roleGroupIds: [] },
      })
      const res = await POST(req, paramsFor('user1'))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.data.roleGroups).toHaveLength(0)
    })
  })
})
