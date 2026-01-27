/**
 * 역할그룹 상세 API 단위 테스트
 *
 * GET /api/role-groups/:id - 역할그룹 상세 조회
 * PUT /api/role-groups/:id - 역할그룹 수정
 * DELETE /api/role-groups/:id - 역할그룹 삭제
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
      update: vi.fn(),
      delete: vi.fn(),
    },
    roleGroupRole: {
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    roleGroupHistory: {
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    roleGroupRoleHistory: {
      updateMany: vi.fn(),
      createMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { GET, PUT, DELETE } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockPrisma = prisma as unknown as {
  roleGroup: {
    findUnique: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
  roleGroupRole: {
    findMany: ReturnType<typeof vi.fn>
  }
  user: {
    findUnique: ReturnType<typeof vi.fn>
  }
  roleGroupHistory: {
    create: ReturnType<typeof vi.fn>
    updateMany: ReturnType<typeof vi.fn>
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

const mockRoleGroupDetail = {
  roleGroupId: 1,
  systemId: 'mes-factory1',
  roleGroupCd: 'RG_ADMIN',
  name: '관리자 그룹',
  description: '관리자 역할 그룹',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  roleGroupRoles: [
    {
      roleId: 1,
      role: { roleId: 1, roleCd: 'SYSTEM_ADMIN', name: '시스템 관리자' },
    },
    {
      roleId: 2,
      role: { roleId: 2, roleCd: 'USER_ADMIN', name: '사용자 관리자' },
    },
  ],
  userRoleGroups: [
    {
      user: { userId: '1', email: 'admin@example.com', name: '관리자' },
    },
  ],
}

describe('역할그룹 상세 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/role-groups/:id', () => {
    it('인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/role-groups/1')
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('존재하지 않는 역할그룹 조회 시 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.roleGroup.findUnique.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/role-groups/999')
      const response = await GET(request, { params: Promise.resolve({ id: '999' }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('ROLE_GROUP_NOT_FOUND')
    })

    it('역할그룹 상세 조회 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.roleGroup.findUnique.mockResolvedValue(mockRoleGroupDetail)

      const request = createMockRequest('http://localhost/api/role-groups/1')
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.code).toBe('RG_ADMIN')
      expect(data.data.roles).toHaveLength(2)
      expect(data.data.users).toHaveLength(1)
    })
  })

  describe('PUT /api/role-groups/:id', () => {
    it('인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/role-groups/1', {
        method: 'PUT',
        body: { name: '수정된 이름' },
      })
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(401)
    })

    it('관리자가 아닌 사용자는 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const request = createMockRequest('http://localhost/api/role-groups/1', {
        method: 'PUT',
        body: { name: '수정된 이름' },
      })
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('FORBIDDEN')
    })

    it('존재하지 않는 역할그룹 수정 시 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.roleGroup.findUnique.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/role-groups/999', {
        method: 'PUT',
        body: { name: '수정된 이름' },
      })
      const response = await PUT(request, { params: Promise.resolve({ id: '999' }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('ROLE_GROUP_NOT_FOUND')
    })

    it('역할그룹 수정 성공 (트랜잭션 + 히스토리)', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.roleGroup.findUnique.mockResolvedValue(mockRoleGroupDetail)

      const updatedRoleGroup = {
        ...mockRoleGroupDetail,
        name: '수정된 이름',
        roleGroupRoles: mockRoleGroupDetail.roleGroupRoles,
        userRoleGroups: mockRoleGroupDetail.userRoleGroups,
      }
      mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          roleGroupHistory: {
            updateMany: vi.fn().mockResolvedValue({}),
            create: vi.fn().mockResolvedValue({}),
          },
          roleGroup: {
            update: vi.fn().mockResolvedValue(updatedRoleGroup),
          },
        }
        return fn(tx)
      })

      const request = createMockRequest('http://localhost/api/role-groups/1', {
        method: 'PUT',
        body: { name: '수정된 이름' },
      })
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('수정된 이름')
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })
  })

  describe('DELETE /api/role-groups/:id', () => {
    it('인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/role-groups/1', { method: 'DELETE' })
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(401)
    })

    it('관리자가 아닌 사용자는 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const request = createMockRequest('http://localhost/api/role-groups/1', { method: 'DELETE' })
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(403)
    })

    it('존재하지 않는 역할그룹 삭제 시 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.roleGroup.findUnique.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/role-groups/999', { method: 'DELETE' })
      const response = await DELETE(request, { params: Promise.resolve({ id: '999' }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('ROLE_GROUP_NOT_FOUND')
    })

    it('역할그룹 삭제 성공 (트랜잭션 + 히스토리)', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.roleGroup.findUnique.mockResolvedValue({
        ...mockRoleGroupDetail,
        roleGroupRoles: mockRoleGroupDetail.roleGroupRoles,
      })

      mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          roleGroupHistory: {
            updateMany: vi.fn().mockResolvedValue({}),
            create: vi.fn().mockResolvedValue({}),
          },
          roleGroupRoleHistory: {
            updateMany: vi.fn().mockResolvedValue({}),
            createMany: vi.fn().mockResolvedValue({}),
          },
          roleGroup: {
            delete: vi.fn().mockResolvedValue({}),
          },
        }
        return fn(tx)
      })

      const request = createMockRequest('http://localhost/api/role-groups/1', { method: 'DELETE' })
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })
  })
})
