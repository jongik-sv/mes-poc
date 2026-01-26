/**
 * 권한 API 단위 테스트 (TSK-03-01)
 *
 * 테스트 대상:
 * - GET /api/permissions - 권한 목록 조회
 * - POST /api/permissions - 권한 생성
 * - GET /api/permissions/:id - 권한 상세 조회
 * - PUT /api/permissions/:id - 권한 수정
 * - DELETE /api/permissions/:id - 권한 삭제
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    permission: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

import { GET, POST } from '../route'
import { GET as GET_DETAIL, PUT, DELETE } from '../[id]/route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockPrisma = prisma as unknown as {
  permission: {
    count: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
  user: {
    findUnique: ReturnType<typeof vi.fn>
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

// 테스트용 목 데이터
const mockPermissions = [
  {
    id: 1,
    code: 'user:read',
    name: '사용자 조회',
    type: 'API',
    resource: 'User',
    action: 'READ',
    description: '사용자 정보 조회 권한',
    isActive: true,
    _count: { rolePermissions: 3 },
  },
  {
    id: 2,
    code: 'user:create',
    name: '사용자 생성',
    type: 'API',
    resource: 'User',
    action: 'CREATE',
    description: '사용자 생성 권한',
    isActive: true,
    _count: { rolePermissions: 2 },
  },
]

const mockPermissionDetail = {
  id: 1,
  code: 'user:read',
  name: '사용자 조회',
  type: 'API',
  resource: 'User',
  action: 'READ',
  description: '사용자 정보 조회 권한',
  isActive: true,
  rolePermissions: [
    {
      role: {
        id: 1,
        code: 'SYSTEM_ADMIN',
        name: '시스템 관리자',
      },
    },
  ],
}

const mockAdminUser = {
  id: 1,
  userRoles: [{ role: { code: 'SYSTEM_ADMIN' } }],
}

const mockNonAdminUser = {
  id: 2,
  userRoles: [{ role: { code: 'OPERATOR' } }],
}

describe('권한 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/permissions', () => {
    it('UT-PERM-001: 인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/permissions')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('UT-PERM-002: 권한 목록 조회 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.permission.count.mockResolvedValue(2)
      mockPrisma.permission.findMany.mockResolvedValue(mockPermissions)

      const request = createMockRequest('http://localhost/api/permissions')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.items).toHaveLength(2)
      expect(data.data.total).toBe(2)
    })

    it('UT-PERM-003: 타입별 필터링', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.permission.count.mockResolvedValue(1)
      mockPrisma.permission.findMany.mockResolvedValue([mockPermissions[0]])

      const request = createMockRequest(
        'http://localhost/api/permissions?type=API'
      )
      const response = await GET(request)

      expect(mockPrisma.permission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'API',
          }),
        })
      )
    })

    it('UT-PERM-004: 검색어 필터링', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.permission.count.mockResolvedValue(1)
      mockPrisma.permission.findMany.mockResolvedValue([mockPermissions[0]])

      const request = createMockRequest(
        'http://localhost/api/permissions?search=user'
      )
      const response = await GET(request)

      expect(mockPrisma.permission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { code: { contains: 'user' } },
              { name: { contains: 'user' } },
            ],
          }),
        })
      )
    })
  })

  describe('POST /api/permissions', () => {
    it('UT-PERM-005: 인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/permissions', {
        method: 'POST',
        body: {
          code: 'new:permission',
          name: '새 권한',
          type: 'API',
          resource: 'Test',
          action: 'READ',
        },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('UT-PERM-006: 관리자가 아닌 사용자는 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const request = createMockRequest('http://localhost/api/permissions', {
        method: 'POST',
        body: {
          code: 'new:permission',
          name: '새 권한',
          type: 'API',
          resource: 'Test',
          action: 'READ',
        },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('FORBIDDEN')
    })

    it('UT-PERM-007: 필수 필드 누락 시 400 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)

      const request = createMockRequest('http://localhost/api/permissions', {
        method: 'POST',
        body: { name: '새 권한' }, // code, type, resource, action 누락
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('UT-PERM-008: 중복 코드로 생성 시 409 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.permission.findUnique.mockResolvedValue(mockPermissions[0])

      const request = createMockRequest('http://localhost/api/permissions', {
        method: 'POST',
        body: {
          code: 'user:read',
          name: '중복 권한',
          type: 'API',
          resource: 'User',
          action: 'READ',
        },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error.code).toBe('DUPLICATE_CODE')
    })

    it('UT-PERM-009: 권한 생성 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.permission.findUnique.mockResolvedValue(null)
      mockPrisma.permission.create.mockResolvedValue({
        id: 3,
        code: 'new:permission',
        name: '새 권한',
        type: 'API',
        resource: 'Test',
        action: 'READ',
        description: '설명',
        isActive: true,
        _count: { rolePermissions: 0 },
      })
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = createMockRequest('http://localhost/api/permissions', {
        method: 'POST',
        body: {
          code: 'new:permission',
          name: '새 권한',
          type: 'API',
          resource: 'Test',
          action: 'READ',
          description: '설명',
        },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.code).toBe('new:permission')
      expect(mockPrisma.auditLog.create).toHaveBeenCalled()
    })
  })

  describe('GET /api/permissions/:id', () => {
    it('UT-PERM-010: 인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/permissions/1')
      const response = await GET_DETAIL(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('UT-PERM-011: 존재하지 않는 권한 조회 시 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.permission.findUnique.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/permissions/999')
      const response = await GET_DETAIL(request, {
        params: Promise.resolve({ id: '999' }),
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('PERMISSION_NOT_FOUND')
    })

    it('UT-PERM-012: 권한 상세 조회 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.permission.findUnique.mockResolvedValue(mockPermissionDetail)

      const request = createMockRequest('http://localhost/api/permissions/1')
      const response = await GET_DETAIL(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.code).toBe('user:read')
      expect(data.data.roles).toHaveLength(1)
    })
  })

  describe('PUT /api/permissions/:id', () => {
    it('UT-PERM-013: 관리자가 아닌 사용자는 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const request = createMockRequest('http://localhost/api/permissions/1', {
        method: 'PUT',
        body: { name: '수정된 이름' },
      })
      const response = await PUT(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('FORBIDDEN')
    })

    it('UT-PERM-014: 존재하지 않는 권한 수정 시 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.permission.findUnique.mockResolvedValue(null)

      const request = createMockRequest(
        'http://localhost/api/permissions/999',
        {
          method: 'PUT',
          body: { name: '수정된 이름' },
        }
      )
      const response = await PUT(request, {
        params: Promise.resolve({ id: '999' }),
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('PERMISSION_NOT_FOUND')
    })

    it('UT-PERM-015: 권한 수정 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.permission.findUnique.mockResolvedValue(mockPermissions[0])
      mockPrisma.permission.update.mockResolvedValue({
        ...mockPermissionDetail,
        name: '수정된 이름',
      })
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = createMockRequest('http://localhost/api/permissions/1', {
        method: 'PUT',
        body: { name: '수정된 이름' },
      })
      const response = await PUT(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.auditLog.create).toHaveBeenCalled()
    })
  })

  describe('DELETE /api/permissions/:id', () => {
    it('UT-PERM-016: 관리자가 아닌 사용자는 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const request = createMockRequest('http://localhost/api/permissions/1', {
        method: 'DELETE',
      })
      const response = await DELETE(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('FORBIDDEN')
    })

    it('UT-PERM-017: 존재하지 않는 권한 삭제 시 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.permission.findUnique.mockResolvedValue(null)

      const request = createMockRequest(
        'http://localhost/api/permissions/999',
        {
          method: 'DELETE',
        }
      )
      const response = await DELETE(request, {
        params: Promise.resolve({ id: '999' }),
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('PERMISSION_NOT_FOUND')
    })

    it('UT-PERM-018: 권한 삭제 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.permission.findUnique.mockResolvedValue(mockPermissions[0])
      mockPrisma.permission.delete.mockResolvedValue({})
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = createMockRequest('http://localhost/api/permissions/1', {
        method: 'DELETE',
      })
      const response = await DELETE(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.permission.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      })
      expect(mockPrisma.auditLog.create).toHaveBeenCalled()
    })
  })
})
