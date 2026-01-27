/**
 * 역할그룹 API 단위 테스트
 *
 * GET /api/role-groups - 역할그룹 목록 조회
 * POST /api/role-groups - 역할그룹 생성
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    roleGroup: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    roleGroupHistory: {
      create: vi.fn(),
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
    count: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
  }
  user: {
    findUnique: ReturnType<typeof vi.fn>
  }
  roleGroupHistory: {
    create: ReturnType<typeof vi.fn>
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

const mockRoleGroups = [
  {
    roleGroupId: 1,
    systemId: 'mes-factory1',
    roleGroupCd: 'RG_ADMIN',
    name: '관리자 그룹',
    description: '관리자 역할 그룹',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    _count: { roleGroupRoles: 3, userRoleGroups: 2 },
  },
  {
    roleGroupId: 2,
    systemId: 'mes-factory1',
    roleGroupCd: 'RG_OPERATOR',
    name: '운영자 그룹',
    description: null,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    _count: { roleGroupRoles: 1, userRoleGroups: 5 },
  },
]

describe('역할그룹 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/role-groups', () => {
    it('인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/role-groups')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('역할그룹 목록 조회 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.roleGroup.count.mockResolvedValue(2)
      mockPrisma.roleGroup.findMany.mockResolvedValue(mockRoleGroups)

      const request = createMockRequest('http://localhost/api/role-groups')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.items).toHaveLength(2)
      expect(data.data.total).toBe(2)
      expect(data.data.page).toBe(1)
      expect(data.data.pageSize).toBe(10)
      expect(data.data.totalPages).toBe(1)
    })

    it('페이지네이션 파라미터 적용', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.roleGroup.count.mockResolvedValue(20)
      mockPrisma.roleGroup.findMany.mockResolvedValue(mockRoleGroups)

      const request = createMockRequest('http://localhost/api/role-groups?page=2&pageSize=5')
      const response = await GET(request)
      const data = await response.json()

      expect(data.data.page).toBe(2)
      expect(data.data.pageSize).toBe(5)
      expect(mockPrisma.roleGroup.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 })
      )
    })

    it('systemId 필터링', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.roleGroup.count.mockResolvedValue(1)
      mockPrisma.roleGroup.findMany.mockResolvedValue([mockRoleGroups[0]])

      const request = createMockRequest('http://localhost/api/role-groups?systemId=mes-factory1')
      await GET(request)

      expect(mockPrisma.roleGroup.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ systemId: 'mes-factory1' }),
        })
      )
    })

    it('isActive 필터링', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.roleGroup.count.mockResolvedValue(1)
      mockPrisma.roleGroup.findMany.mockResolvedValue([mockRoleGroups[0]])

      const request = createMockRequest('http://localhost/api/role-groups?isActive=true')
      await GET(request)

      expect(mockPrisma.roleGroup.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        })
      )
    })

    it('검색어 필터링 (name/roleGroupCd)', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.roleGroup.count.mockResolvedValue(1)
      mockPrisma.roleGroup.findMany.mockResolvedValue([mockRoleGroups[0]])

      const request = createMockRequest('http://localhost/api/role-groups?search=ADMIN')
      await GET(request)

      expect(mockPrisma.roleGroup.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { roleGroupCd: { contains: 'ADMIN' } },
              { name: { contains: 'ADMIN' } },
            ],
          }),
        })
      )
    })

    it('DB 오류 시 500 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.roleGroup.count.mockRejectedValue(new Error('DB error'))

      const request = createMockRequest('http://localhost/api/role-groups')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('DB_ERROR')
    })
  })

  describe('POST /api/role-groups', () => {
    it('인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const request = createMockRequest('http://localhost/api/role-groups', {
        method: 'POST',
        body: { roleGroupCd: 'RG_NEW', name: '새 그룹', systemId: 'mes-factory1' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('관리자가 아닌 사용자는 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const request = createMockRequest('http://localhost/api/role-groups', {
        method: 'POST',
        body: { roleGroupCd: 'RG_NEW', name: '새 그룹', systemId: 'mes-factory1' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('FORBIDDEN')
    })

    it('필수 필드 누락 시 400 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)

      const request = createMockRequest('http://localhost/api/role-groups', {
        method: 'POST',
        body: { name: '새 그룹' }, // roleGroupCd, systemId 누락
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('중복 코드로 생성 시 409 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.roleGroup.findUnique.mockResolvedValue(mockRoleGroups[0])

      const request = createMockRequest('http://localhost/api/role-groups', {
        method: 'POST',
        body: { roleGroupCd: 'RG_ADMIN', name: '중복 그룹', systemId: 'mes-factory1' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error.code).toBe('DUPLICATE_CODE')
    })

    it('역할그룹 생성 성공 (트랜잭션 + 히스토리)', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.roleGroup.findUnique.mockResolvedValue(null)

      const createdRoleGroup = {
        roleGroupId: 3,
        systemId: 'mes-factory1',
        roleGroupCd: 'RG_NEW',
        name: '새 그룹',
        description: '설명',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { roleGroupRoles: 0, userRoleGroups: 0 },
      }
      mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          roleGroup: { create: vi.fn().mockResolvedValue(createdRoleGroup) },
          roleGroupHistory: { create: vi.fn().mockResolvedValue({}) },
        }
        return fn(tx)
      })

      const request = createMockRequest('http://localhost/api/role-groups', {
        method: 'POST',
        body: { roleGroupCd: 'RG_NEW', name: '새 그룹', description: '설명', systemId: 'mes-factory1' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.code).toBe('RG_NEW')
      expect(data.data.name).toBe('새 그룹')
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('DB 오류 시 500 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)
      mockPrisma.roleGroup.findUnique.mockResolvedValue(null)
      mockPrisma.$transaction.mockRejectedValue(new Error('DB error'))

      const request = createMockRequest('http://localhost/api/role-groups', {
        method: 'POST',
        body: { roleGroupCd: 'RG_NEW', name: '새 그룹', systemId: 'mes-factory1' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('DB_ERROR')
    })
  })
})
