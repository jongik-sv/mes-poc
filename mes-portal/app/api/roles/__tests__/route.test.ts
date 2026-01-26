/**
 * 역할 API 단위 테스트 (TSK-03-01)
 *
 * 테스트 대상:
 * - GET /api/roles - 역할 목록 조회
 * - POST /api/roles - 역할 생성
 * - GET /api/roles/:id - 역할 상세 조회
 * - PUT /api/roles/:id - 역할 수정
 * - DELETE /api/roles/:id - 역할 삭제
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
  role: {
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
const mockRoles = [
  {
    id: 1,
    code: 'SYSTEM_ADMIN',
    name: '시스템 관리자',
    description: '모든 권한 보유',
    parentId: null,
    level: 0,
    isSystem: true,
    isActive: true,
    _count: { rolePermissions: 15, userRoles: 1 },
  },
  {
    id: 2,
    code: 'PRODUCTION_MANAGER',
    name: '생산 관리자',
    description: '생산 관련 권한',
    parentId: null,
    level: 0,
    isSystem: false,
    isActive: true,
    _count: { rolePermissions: 5, userRoles: 2 },
  },
]

const mockRoleDetail = {
  id: 1,
  code: 'SYSTEM_ADMIN',
  name: '시스템 관리자',
  description: '모든 권한 보유',
  parentId: null,
  level: 0,
  isSystem: true,
  isActive: true,
  rolePermissions: [
    {
      permission: {
        id: 1,
        code: 'user:read',
        name: '사용자 조회',
        type: 'API',
      },
    },
  ],
  userRoles: [
    {
      user: {
        id: 1,
        email: 'admin@example.com',
        name: '관리자',
      },
    },
  ],
}

const mockAdminUser = {
  id: 1,
  userRoles: [
    { role: { code: 'SYSTEM_ADMIN' } },
  ],
}

const mockNonAdminUser = {
  id: 2,
  userRoles: [
    { role: { code: 'OPERATOR' } },
  ],
}

describe('역할 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/roles', () => {
    it('UT-ROLE-001: 인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/roles')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('UT-ROLE-002: 역할 목록 조회 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.role.count.mockResolvedValue(2)
      mockPrisma.role.findMany.mockResolvedValue(mockRoles)

      const request = createMockRequest('http://localhost/api/roles')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.items).toHaveLength(2)
      expect(data.data.total).toBe(2)
      expect(data.data.page).toBe(1)
      expect(data.data.pageSize).toBe(10)
    })

    it('UT-ROLE-003: 페이지네이션 파라미터 적용', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.role.count.mockResolvedValue(20)
      mockPrisma.role.findMany.mockResolvedValue(mockRoles)

      const request = createMockRequest(
        'http://localhost/api/roles?page=2&pageSize=5'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(data.data.page).toBe(2)
      expect(data.data.pageSize).toBe(5)
      expect(mockPrisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      )
    })

    it('UT-ROLE-004: 검색어 필터링', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.role.count.mockResolvedValue(1)
      mockPrisma.role.findMany.mockResolvedValue([mockRoles[0]])

      const request = createMockRequest(
        'http://localhost/api/roles?search=ADMIN'
      )
      const response = await GET(request)

      expect(mockPrisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { code: { contains: 'ADMIN' } },
              { name: { contains: 'ADMIN' } },
            ],
          }),
        })
      )
    })

    it('UT-ROLE-005: 활성화 상태 필터링', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.role.count.mockResolvedValue(1)
      mockPrisma.role.findMany.mockResolvedValue([mockRoles[0]])

      const request = createMockRequest(
        'http://localhost/api/roles?isActive=true'
      )
      const response = await GET(request)

      expect(mockPrisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      )
    })
  })

  describe('POST /api/roles', () => {
    it('UT-ROLE-006: 인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/roles', {
        method: 'POST',
        body: { code: 'NEW_ROLE', name: '새 역할' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('UT-ROLE-007: 관리자가 아닌 사용자는 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const request = createMockRequest('http://localhost/api/roles', {
        method: 'POST',
        body: { code: 'NEW_ROLE', name: '새 역할' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('FORBIDDEN')
    })

    it('UT-ROLE-008: 필수 필드 누락 시 400 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)

      const request = createMockRequest('http://localhost/api/roles', {
        method: 'POST',
        body: { name: '새 역할' }, // code 누락
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('UT-ROLE-009: 중복 코드로 생성 시 409 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.role.findUnique.mockResolvedValue(mockRoles[0])

      const request = createMockRequest('http://localhost/api/roles', {
        method: 'POST',
        body: { code: 'SYSTEM_ADMIN', name: '중복 역할' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error.code).toBe('DUPLICATE_CODE')
    })

    it('UT-ROLE-010: 역할 생성 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.role.findUnique.mockResolvedValue(null)
      mockPrisma.role.create.mockResolvedValue({
        id: 3,
        code: 'NEW_ROLE',
        name: '새 역할',
        description: '설명',
        parentId: null,
        level: 0,
        isSystem: false,
        isActive: true,
        _count: { rolePermissions: 0, userRoles: 0 },
      })
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = createMockRequest('http://localhost/api/roles', {
        method: 'POST',
        body: { code: 'NEW_ROLE', name: '새 역할', description: '설명' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.code).toBe('NEW_ROLE')
      expect(mockPrisma.auditLog.create).toHaveBeenCalled()
    })

    it('UT-ROLE-011: 부모 역할이 있을 때 레벨 자동 계산', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.role.findUnique
        .mockResolvedValueOnce(null) // 중복 체크
        .mockResolvedValueOnce({ id: 1, level: 0 }) // 부모 역할 조회
      mockPrisma.role.create.mockResolvedValue({
        id: 4,
        code: 'CHILD_ROLE',
        name: '하위 역할',
        description: null,
        parentId: 1,
        level: 1,
        isSystem: false,
        isActive: true,
        _count: { rolePermissions: 0, userRoles: 0 },
      })
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = createMockRequest('http://localhost/api/roles', {
        method: 'POST',
        body: { code: 'CHILD_ROLE', name: '하위 역할', parentId: 1 },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(data.data.level).toBe(1)
      expect(data.data.parentId).toBe(1)
    })
  })

  describe('GET /api/roles/:id', () => {
    it('UT-ROLE-012: 인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/roles/1')
      const response = await GET_DETAIL(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('UT-ROLE-013: 존재하지 않는 역할 조회 시 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.role.findUnique.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/roles/999')
      const response = await GET_DETAIL(request, {
        params: Promise.resolve({ id: '999' }),
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('ROLE_NOT_FOUND')
    })

    it('UT-ROLE-014: 역할 상세 조회 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.role.findUnique.mockResolvedValue(mockRoleDetail)

      const request = createMockRequest('http://localhost/api/roles/1')
      const response = await GET_DETAIL(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.code).toBe('SYSTEM_ADMIN')
      expect(data.data.permissions).toHaveLength(1)
      expect(data.data.users).toHaveLength(1)
    })
  })

  describe('PUT /api/roles/:id', () => {
    it('UT-ROLE-015: 관리자가 아닌 사용자는 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const request = createMockRequest('http://localhost/api/roles/1', {
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

    it('UT-ROLE-016: 존재하지 않는 역할 수정 시 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.role.findUnique.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/roles/999', {
        method: 'PUT',
        body: { name: '수정된 이름' },
      })
      const response = await PUT(request, {
        params: Promise.resolve({ id: '999' }),
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('ROLE_NOT_FOUND')
    })

    it('UT-ROLE-017: 역할 수정 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.role.findUnique.mockResolvedValue(mockRoles[1])
      mockPrisma.role.update.mockResolvedValue({
        ...mockRoleDetail,
        name: '수정된 이름',
      })
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = createMockRequest('http://localhost/api/roles/2', {
        method: 'PUT',
        body: { name: '수정된 이름' },
      })
      const response = await PUT(request, {
        params: Promise.resolve({ id: '2' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.auditLog.create).toHaveBeenCalled()
    })

    it('UT-ROLE-018: parentId 변경 시 레벨 재계산', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.role.findUnique
        .mockResolvedValueOnce({ ...mockRoles[1], level: 0 }) // 기존 역할
        .mockResolvedValueOnce({ id: 1, level: 0 }) // 새 부모 역할
      mockPrisma.role.update.mockResolvedValue({
        ...mockRoleDetail,
        parentId: 1,
        level: 1,
      })
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = createMockRequest('http://localhost/api/roles/2', {
        method: 'PUT',
        body: { parentId: 1 },
      })
      const response = await PUT(request, {
        params: Promise.resolve({ id: '2' }),
      })
      const data = await response.json()

      expect(mockPrisma.role.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            level: 1,
          }),
        })
      )
    })
  })

  describe('DELETE /api/roles/:id', () => {
    it('UT-ROLE-019: 관리자가 아닌 사용자는 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const request = createMockRequest('http://localhost/api/roles/2', {
        method: 'DELETE',
      })
      const response = await DELETE(request, {
        params: Promise.resolve({ id: '2' }),
      })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('FORBIDDEN')
    })

    it('UT-ROLE-020: 존재하지 않는 역할 삭제 시 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.role.findUnique.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/roles/999', {
        method: 'DELETE',
      })
      const response = await DELETE(request, {
        params: Promise.resolve({ id: '999' }),
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('ROLE_NOT_FOUND')
    })

    it('UT-ROLE-021: 시스템 역할(BR-03-01) 삭제 시 400 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.role.findUnique.mockResolvedValue(mockRoles[0]) // isSystem: true

      const request = createMockRequest('http://localhost/api/roles/1', {
        method: 'DELETE',
      })
      const response = await DELETE(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('SYSTEM_ROLE_DELETE')
    })

    it('UT-ROLE-022: 일반 역할 삭제 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.role.findUnique.mockResolvedValue(mockRoles[1]) // isSystem: false
      mockPrisma.role.delete.mockResolvedValue({})
      mockPrisma.auditLog.create.mockResolvedValue({})

      const request = createMockRequest('http://localhost/api/roles/2', {
        method: 'DELETE',
      })
      const response = await DELETE(request, {
        params: Promise.resolve({ id: '2' }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.role.delete).toHaveBeenCalledWith({ where: { id: 2 } })
      expect(mockPrisma.auditLog.create).toHaveBeenCalled()
    })
  })
})
