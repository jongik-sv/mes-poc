/**
 * 역할그룹 역할 할당 API 단위 테스트
 *
 * GET /api/role-groups/:id/roles - 할당된 역할 목록 조회
 * POST /api/role-groups/:id/roles - 역할 할당 (전체 교체, diff 기반 히스토리)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    roleGroup: {
      findUnique: vi.fn(),
    },
    roleGroupRole: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    role: {
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    roleGroupRoleHistory: {
      updateMany: vi.fn(),
      createMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { GET, POST } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockPrisma = prisma as unknown as {
  roleGroup: {
    findUnique: ReturnType<typeof vi.fn>
  }
  roleGroupRole: {
    findMany: ReturnType<typeof vi.fn>
    deleteMany: ReturnType<typeof vi.fn>
    createMany: ReturnType<typeof vi.fn>
  }
  role: {
    findMany: ReturnType<typeof vi.fn>
  }
  user: {
    findUnique: ReturnType<typeof vi.fn>
  }
  roleGroupRoleHistory: {
    updateMany: ReturnType<typeof vi.fn>
    createMany: ReturnType<typeof vi.fn>
  }
  $transaction: ReturnType<typeof vi.fn>
}

function createMockRequest(
  url: string,
  options?: { method?: string; body?: object }
): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'), {
    method: options?.method || 'GET',
    body: options?.body ? JSON.stringify(options.body) : undefined,
    headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
  })
}

const mockAdminUser = {
  userId: '1',
  userRoleGroups: [
    {
      roleGroup: {
        roleGroupRoles: [{ role: { roleCd: 'SYSTEM_ADMIN' } }],
      },
    },
  ],
}

const mockNonAdminUser = {
  userId: '2',
  userRoleGroups: [
    {
      roleGroup: {
        roleGroupRoles: [{ role: { roleCd: 'OPERATOR' } }],
      },
    },
  ],
}

const mockAssignedRoles = [
  {
    roleGroupId: 1,
    roleId: 1,
    createdAt: new Date(),
    role: { roleId: 1, roleCd: 'SYSTEM_ADMIN', name: '시스템 관리자', isActive: true },
  },
  {
    roleGroupId: 1,
    roleId: 2,
    createdAt: new Date(),
    role: { roleId: 2, roleCd: 'USER_ADMIN', name: '사용자 관리자', isActive: true },
  },
]

describe('역할그룹 역할 할당 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/role-groups/:id/roles', () => {
    it('인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/role-groups/1/roles')
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(401)
    })

    it('존재하지 않는 역할그룹은 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.roleGroup.findUnique.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/role-groups/999/roles')
      const response = await GET(request, { params: Promise.resolve({ id: '999' }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('ROLE_GROUP_NOT_FOUND')
    })

    it('할당된 역할 목록 조회 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.roleGroup.findUnique.mockResolvedValue({ roleGroupId: 1 })
      mockPrisma.roleGroupRole.findMany.mockResolvedValue(mockAssignedRoles)

      const request = createMockRequest('http://localhost/api/role-groups/1/roles')
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].id).toBe(1)
      expect(data.data[0].code).toBe('SYSTEM_ADMIN')
    })
  })

  describe('POST /api/role-groups/:id/roles', () => {
    it('인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/role-groups/1/roles', {
        method: 'POST',
        body: { roleIds: [1, 2] },
      })
      const response = await POST(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(401)
    })

    it('관리자가 아닌 사용자는 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const request = createMockRequest('http://localhost/api/role-groups/1/roles', {
        method: 'POST',
        body: { roleIds: [1, 2] },
      })
      const response = await POST(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(403)
    })

    it('roleIds가 배열이 아닌 경우 400 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)

      const request = createMockRequest('http://localhost/api/role-groups/1/roles', {
        method: 'POST',
        body: { roleIds: 'invalid' },
      })
      const response = await POST(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('존재하지 않는 역할그룹은 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.roleGroup.findUnique.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/role-groups/999/roles', {
        method: 'POST',
        body: { roleIds: [1, 2] },
      })
      const response = await POST(request, { params: Promise.resolve({ id: '999' }) })

      expect(response.status).toBe(404)
    })

    it('역할 할당 성공 (diff 기반 히스토리)', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.roleGroup.findUnique.mockResolvedValue({ roleGroupId: 1 })

      const newAssignedRoles = [
        {
          roleGroupId: 1,
          roleId: 2,
          createdAt: new Date(),
          role: { roleId: 2, roleCd: 'USER_ADMIN', name: '사용자 관리자', isActive: true },
        },
        {
          roleGroupId: 1,
          roleId: 3,
          createdAt: new Date(),
          role: { roleId: 3, roleCd: 'PRODUCTION_MANAGER', name: '생산 관리자', isActive: true },
        },
      ]

      mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          roleGroupRole: {
            findMany: vi.fn().mockResolvedValue(mockAssignedRoles), // 기존: [1, 2]
            deleteMany: vi.fn().mockResolvedValue({}),
            createMany: vi.fn().mockResolvedValue({}),
          },
          roleGroupRoleHistory: {
            updateMany: vi.fn().mockResolvedValue({}),
            createMany: vi.fn().mockResolvedValue({}),
          },
          role: {
            findMany: vi.fn().mockResolvedValue([
              { roleId: 2 },
              { roleId: 3 },
            ]),
          },
        }
        // After transaction, query new state
        mockPrisma.roleGroupRole.findMany.mockResolvedValue(newAssignedRoles)
        return fn(tx)
      })

      const request = createMockRequest('http://localhost/api/role-groups/1/roles', {
        method: 'POST',
        body: { roleIds: [2, 3] }, // 새로: [2, 3], revoke: [1], assign: [3]
      })
      const response = await POST(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('빈 roleIds로 모든 역할 제거', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.roleGroup.findUnique.mockResolvedValue({ roleGroupId: 1 })

      mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          roleGroupRole: {
            findMany: vi.fn().mockResolvedValue(mockAssignedRoles),
            deleteMany: vi.fn().mockResolvedValue({}),
            createMany: vi.fn().mockResolvedValue({}),
          },
          roleGroupRoleHistory: {
            updateMany: vi.fn().mockResolvedValue({}),
            createMany: vi.fn().mockResolvedValue({}),
          },
          role: {
            findMany: vi.fn().mockResolvedValue([]),
          },
        }
        mockPrisma.roleGroupRole.findMany.mockResolvedValue([])
        return fn(tx)
      })

      const request = createMockRequest('http://localhost/api/role-groups/1/roles', {
        method: 'POST',
        body: { roleIds: [] },
      })
      const response = await POST(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(0)
    })
  })
})
