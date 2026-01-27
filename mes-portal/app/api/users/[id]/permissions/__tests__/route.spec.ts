/**
 * 사용자 최종 권한 계산 API 테스트
 * GET /api/users/:id/permissions - 병합된 권한 조회
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    user: { findUnique: vi.fn() },
    userRoleGroup: { findMany: vi.fn() },
    role: { findUnique: vi.fn() },
  },
}))

import { GET } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockPrisma = prisma as unknown as {
  user: { findUnique: ReturnType<typeof vi.fn> }
  userRoleGroup: { findMany: ReturnType<typeof vi.fn> }
  role: { findUnique: ReturnType<typeof vi.fn> }
}

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'))
}

const paramsFor = (id: string) => ({ params: Promise.resolve({ id }) })

describe('사용자 최종 권한 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/users/:id/permissions', () => {
    it('인증되지 않은 요청은 401 반환', async () => {
      mockAuth.mockResolvedValue(null)
      const res = await GET(createRequest('http://localhost/api/users/user1/permissions'), paramsFor('user1'))
      expect(res.status).toBe(401)
    })

    it('존재하지 않는 사용자는 404 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique.mockResolvedValue(null)
      const res = await GET(createRequest('http://localhost/api/users/nouser/permissions'), paramsFor('nouser'))
      expect(res.status).toBe(404)
    })

    it('권한이 없는 사용자는 빈 배열 반환', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique.mockResolvedValue({ userId: 'user1' })
      mockPrisma.userRoleGroup.findMany.mockResolvedValue([])

      const res = await GET(createRequest('http://localhost/api/users/user1/permissions'), paramsFor('user1'))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.permissions).toEqual([])
    })

    it('역할 계층을 통한 권한 병합 성공', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique.mockResolvedValue({ userId: 'user1' })

      // userRoleGroups -> roleGroupRoles -> roles -> rolePermissions -> permissions
      mockPrisma.userRoleGroup.findMany.mockResolvedValue([
        {
          roleGroup: {
            roleGroupRoles: [
              {
                role: {
                  roleId: 1,
                  roleCd: 'PROD_MANAGER',
                  parentRoleId: 2,
                  isActive: true,
                  rolePermissions: [
                    {
                      permission: {
                        permissionId: 10,
                        permissionCd: 'PERM_VIEW_PROD',
                        menuId: 100,
                        config: JSON.stringify({
                          actions: ['read', 'write'],
                          fieldConstraints: { field1: 'visible' },
                        }),
                        isActive: true,
                        menu: { menuId: 100, menuCd: 'MENU_PROD', name: '생산 관리' },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ])

      // Parent role lookup (for hierarchy traversal)
      mockPrisma.role.findUnique.mockResolvedValueOnce({
        roleId: 2,
        roleCd: 'BASE_OPERATOR',
        parentRoleId: null,
        isActive: true,
        rolePermissions: [
          {
            permission: {
              permissionId: 11,
              permissionCd: 'PERM_READ_PROD',
              menuId: 100,
              config: JSON.stringify({
                actions: ['read'],
                fieldConstraints: { field2: 'readonly' },
              }),
              isActive: true,
              menu: { menuId: 100, menuCd: 'MENU_PROD', name: '생산 관리' },
            },
          },
        ],
      })

      const res = await GET(createRequest('http://localhost/api/users/user1/permissions'), paramsFor('user1'))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.permissions).toHaveLength(1) // grouped by menuId=100
      expect(data.data.permissions[0].menuId).toBe(100)
      // merged actions: read + write (union)
      expect(data.data.permissions[0].actions).toContain('read')
      expect(data.data.permissions[0].actions).toContain('write')
    })

    it('여러 메뉴에 대한 권한 그룹핑', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
      mockPrisma.user.findUnique.mockResolvedValue({ userId: 'user1' })

      mockPrisma.userRoleGroup.findMany.mockResolvedValue([
        {
          roleGroup: {
            roleGroupRoles: [
              {
                role: {
                  roleId: 1,
                  parentRoleId: null,
                  isActive: true,
                  rolePermissions: [
                    {
                      permission: {
                        permissionId: 10,
                        menuId: 100,
                        config: JSON.stringify({ actions: ['read'] }),
                        isActive: true,
                        menu: { menuId: 100, menuCd: 'MENU_PROD', name: '생산' },
                      },
                    },
                    {
                      permission: {
                        permissionId: 11,
                        menuId: 200,
                        config: JSON.stringify({ actions: ['read', 'write'] }),
                        isActive: true,
                        menu: { menuId: 200, menuCd: 'MENU_QA', name: '품질' },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ])

      const res = await GET(createRequest('http://localhost/api/users/user1/permissions'), paramsFor('user1'))
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.data.permissions).toHaveLength(2)
    })
  })
})
