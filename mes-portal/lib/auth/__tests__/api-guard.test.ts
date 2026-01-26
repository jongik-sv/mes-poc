/**
 * API 권한 가드 단위 테스트 (TSK-03-02)
 *
 * 테스트 대상:
 * - requireAuth: 인증 확인
 * - requireAdmin: 관리자 권한 확인
 * - requirePermission: 특정 권한 확인
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

import {
  requireAuth,
  requireAdmin,
  requirePermission,
  requireAuthAndAdmin,
  requireAuthAndPermission,
} from '../api-guard'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>
  }
}

const mockAdminUser = {
  id: 1,
  userRoles: [
    {
      role: {
        code: 'SYSTEM_ADMIN',
        rolePermissions: [],
      },
    },
  ],
}

const mockNonAdminUser = {
  id: 2,
  userRoles: [
    {
      role: {
        code: 'OPERATOR',
        rolePermissions: [
          { permission: { code: 'user:read' } },
        ],
      },
    },
  ],
}

describe('API Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requireAuth', () => {
    it('UT-GUARD-001: 인증되지 않은 경우 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await requireAuth()

      expect(result.ok).toBe(false)
      if (!result.ok) {
        const data = await result.response.json()
        expect(result.response.status).toBe(401)
        expect(data.error.code).toBe('UNAUTHORIZED')
      }
    })

    it('UT-GUARD-002: 인증된 경우 세션 정보 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1', email: 'test@example.com' } })

      const result = await requireAuth()

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.session.user.id).toBe('1')
        expect(result.data.userId).toBe(1)
      }
    })
  })

  describe('requireAdmin', () => {
    it('UT-GUARD-003: 관리자가 아닌 경우 403 반환', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const result = await requireAdmin(2)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        const data = await result.response.json()
        expect(result.response.status).toBe(403)
        expect(data.error.code).toBe('FORBIDDEN')
      }
    })

    it('UT-GUARD-004: 관리자인 경우 통과', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)

      const result = await requireAdmin(1)

      expect(result.ok).toBe(true)
    })
  })

  describe('requirePermission', () => {
    it('UT-GUARD-005: 사용자가 없으면 404 반환', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await requirePermission(999, 'read', 'User')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        const data = await result.response.json()
        expect(result.response.status).toBe(404)
        expect(data.error.code).toBe('USER_NOT_FOUND')
      }
    })

    it('UT-GUARD-006: 권한이 없으면 403 반환', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const result = await requirePermission(2, 'create', 'User')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        const data = await result.response.json()
        expect(result.response.status).toBe(403)
        expect(data.error.code).toBe('FORBIDDEN')
      }
    })

    it('UT-GUARD-007: 권한이 있으면 통과', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const result = await requirePermission(2, 'read', 'User')

      expect(result.ok).toBe(true)
    })

    it('UT-GUARD-008: SYSTEM_ADMIN은 모든 권한 보유', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)

      const result = await requirePermission(1, 'delete', 'Role')

      expect(result.ok).toBe(true)
    })
  })

  describe('requireAuthAndAdmin', () => {
    it('UT-GUARD-009: 인증되지 않으면 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await requireAuthAndAdmin()

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.response.status).toBe(401)
      }
    })

    it('UT-GUARD-010: 관리자가 아니면 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const result = await requireAuthAndAdmin()

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.response.status).toBe(403)
      }
    })

    it('UT-GUARD-011: 관리자이면 통과', async () => {
      mockAuth.mockResolvedValue({ user: { id: '1' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockAdminUser)

      const result = await requireAuthAndAdmin()

      expect(result.ok).toBe(true)
    })
  })

  describe('requireAuthAndPermission', () => {
    it('UT-GUARD-012: 인증되지 않으면 401 반환', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await requireAuthAndPermission('read', 'User')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.response.status).toBe(401)
      }
    })

    it('UT-GUARD-013: 권한이 없으면 403 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const result = await requireAuthAndPermission('create', 'Role')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.response.status).toBe(403)
      }
    })

    it('UT-GUARD-014: 권한이 있으면 통과', async () => {
      mockAuth.mockResolvedValue({ user: { id: '2' } })
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdminUser)

      const result = await requireAuthAndPermission('read', 'User')

      expect(result.ok).toBe(true)
    })
  })
})
