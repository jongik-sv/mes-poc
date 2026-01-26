/**
 * 사용자-역할 할당 API 단위 테스트 (TSK-03-01)
 *
 * 테스트 대상:
 * - PUT /api/users/:id/roles - 사용자-역할 할당 설정
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    userRole: {
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
  user: {
    findUnique: ReturnType<typeof vi.fn>
  }
  userRole: {
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

const mockTargetUser = {
  id: 10,
  email: 'user@example.com',
  name: '테스트 사용자',
}

const mockUserRoles = [
  {
    role: {
      id: 2,
      code: 'PRODUCTION_MANAGER',
      name: '생산 관리자',
    },
  },
  {
    role: {
      id: 5,
      code: 'QUALITY_MANAGER',
      name: '품질 관리자',
    },
  },
]

describe('사용자-역할 할당 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PUT /api/users/:id/roles', () => {
    it('UT-UR-001: 인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest(
        'http://localhost/api/users/10/roles',
        {
          method: 'PUT',
          body: { roleIds: [2, 5] },
        }
      )
      const response = await PUT(request, {
        params: Promise.resolve({ id: '10' }),
      })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('UT-UR-002: 관리자가 아닌 사용자는 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const request = createMockRequest(
        'http://localhost/api/users/10/roles',
        {
          method: 'PUT',
          body: { roleIds: [2, 5] },
        }
      )
      const response = await PUT(request, {
        params: Promise.resolve({ id: '10' }),
      })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('FORBIDDEN')
    })

    it('UT-UR-003: 존재하지 않는 사용자에 대해 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockAdminUser) // 관리자 확인
        .mockResolvedValueOnce(null) // 대상 사용자 조회

      const request = createMockRequest(
        'http://localhost/api/users/999/roles',
        {
          method: 'PUT',
          body: { roleIds: [2, 5] },
        }
      )
      const response = await PUT(request, {
        params: Promise.resolve({ id: '999' }),
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('USER_NOT_FOUND')
    })

    it('UT-UR-004: roleIds가 누락되면 400 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockAdminUser)
        .mockResolvedValueOnce(mockTargetUser)

      const request = createMockRequest(
        'http://localhost/api/users/10/roles',
        {
          method: 'PUT',
          body: {},
        }
      )
      const response = await PUT(request, {
        params: Promise.resolve({ id: '10' }),
      })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('UT-UR-005: 사용자-역할 할당 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockAdminUser)
        .mockResolvedValueOnce(mockTargetUser)
      mockPrisma.userRole.deleteMany.mockResolvedValue({ count: 1 })
      mockPrisma.userRole.createMany.mockResolvedValue({ count: 2 })
      mockPrisma.userRole.findMany.mockResolvedValue(mockUserRoles)
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = createMockRequest(
        'http://localhost/api/users/10/roles',
        {
          method: 'PUT',
          body: { roleIds: [2, 5] },
        }
      )
      const response = await PUT(request, {
        params: Promise.resolve({ id: '10' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.userId).toBe(10)
      expect(data.data.roles).toHaveLength(2)
      expect(mockPrisma.userRole.deleteMany).toHaveBeenCalledWith({
        where: { userId: 10 },
      })
      expect(mockPrisma.userRole.createMany).toHaveBeenCalled()
      expect(mockPrisma.auditLog.create).toHaveBeenCalled()
    })

    it('UT-UR-006: 빈 배열로 모든 역할 해제', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockAdminUser)
        .mockResolvedValueOnce(mockTargetUser)
      mockPrisma.userRole.deleteMany.mockResolvedValue({ count: 2 })
      mockPrisma.userRole.createMany.mockResolvedValue({ count: 0 })
      mockPrisma.userRole.findMany.mockResolvedValue([])
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = createMockRequest(
        'http://localhost/api/users/10/roles',
        {
          method: 'PUT',
          body: { roleIds: [] },
        }
      )
      const response = await PUT(request, {
        params: Promise.resolve({ id: '10' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.roles).toHaveLength(0)
    })
  })
})
