/**
 * 역할-권한 매핑 API 단위 테스트 (TSK-03-01)
 *
 * 테스트 대상:
 * - PUT /api/roles/:id/permissions - 역할-권한 매핑 설정
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    role: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    rolePermission: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

import { PUT } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockPrisma = prisma as unknown as {
  role: {
    findUnique: ReturnType<typeof vi.fn>
  }
  user: {
    findUnique: ReturnType<typeof vi.fn>
  }
  rolePermission: {
    deleteMany: ReturnType<typeof vi.fn>
    createMany: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
  }
  auditLog: {
    create: ReturnType<typeof vi.fn>
  }
}

// 테스트 헬퍼
function createMockRequest(
  url: string,
  options?: { method?: string; body?: object }
): NextRequest {
  const request = new NextRequest(new URL(url, 'http://localhost'), {
    method: options?.method || 'GET',
    body: options?.body ? JSON.stringify(options.body) : undefined,
    headers: options?.body
      ? { 'Content-Type': 'application/json' }
      : undefined,
  })
  return request
}

const mockAdminUser = {
  id: 1,
  userRoles: [{ role: { code: 'SYSTEM_ADMIN' } }],
}

const mockNonAdminUser = {
  id: 2,
  userRoles: [{ role: { code: 'OPERATOR' } }],
}

const mockRole = {
  id: 1,
  code: 'PRODUCTION_MANAGER',
  name: '생산 관리자',
}

const mockPermissions = [
  {
    permission: {
      id: 1,
      code: 'user:read',
      name: '사용자 조회',
    },
  },
  {
    permission: {
      id: 2,
      code: 'user:create',
      name: '사용자 생성',
    },
  },
]

describe('역할-권한 매핑 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PUT /api/roles/:id/permissions', () => {
    it('UT-RP-001: 인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest(
        'http://localhost/api/roles/1/permissions',
        {
          method: 'PUT',
          body: { permissionIds: [1, 2] },
        }
      )
      const response = await PUT(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('UT-RP-002: 관리자가 아닌 사용자는 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const request = createMockRequest(
        'http://localhost/api/roles/1/permissions',
        {
          method: 'PUT',
          body: { permissionIds: [1, 2] },
        }
      )
      const response = await PUT(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('FORBIDDEN')
    })

    it('UT-RP-003: 존재하지 않는 역할에 대해 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.role.findUnique.mockResolvedValue(null)

      const request = createMockRequest(
        'http://localhost/api/roles/999/permissions',
        {
          method: 'PUT',
          body: { permissionIds: [1, 2] },
        }
      )
      const response = await PUT(request, {
        params: Promise.resolve({ id: '999' }),
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('ROLE_NOT_FOUND')
    })

    it('UT-RP-004: permissionIds가 누락되면 400 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.role.findUnique.mockResolvedValue(mockRole)

      const request = createMockRequest(
        'http://localhost/api/roles/1/permissions',
        {
          method: 'PUT',
          body: {},
        }
      )
      const response = await PUT(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('UT-RP-005: 역할-권한 매핑 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.role.findUnique.mockResolvedValue(mockRole)
      mockPrisma.rolePermission.deleteMany.mockResolvedValue({ count: 0 })
      mockPrisma.rolePermission.createMany.mockResolvedValue({ count: 2 })
      mockPrisma.rolePermission.findMany.mockResolvedValue(mockPermissions)
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = createMockRequest(
        'http://localhost/api/roles/1/permissions',
        {
          method: 'PUT',
          body: { permissionIds: [1, 2] },
        }
      )
      const response = await PUT(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.roleId).toBe(1)
      expect(data.data.permissions).toHaveLength(2)
      expect(mockPrisma.rolePermission.deleteMany).toHaveBeenCalledWith({
        where: { roleId: 1 },
      })
      expect(mockPrisma.rolePermission.createMany).toHaveBeenCalled()
      expect(mockPrisma.auditLog.create).toHaveBeenCalled()
    })

    it('UT-RP-006: 빈 배열로 모든 권한 해제', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.role.findUnique.mockResolvedValue(mockRole)
      mockPrisma.rolePermission.deleteMany.mockResolvedValue({ count: 3 })
      mockPrisma.rolePermission.createMany.mockResolvedValue({ count: 0 })
      mockPrisma.rolePermission.findMany.mockResolvedValue([])
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = createMockRequest(
        'http://localhost/api/roles/1/permissions',
        {
          method: 'PUT',
          body: { permissionIds: [] },
        }
      )
      const response = await PUT(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.permissions).toHaveLength(0)
    })
  })
})
