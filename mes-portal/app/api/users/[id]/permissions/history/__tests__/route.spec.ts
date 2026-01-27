/**
 * 사용자 권한 시점 이력 API 테스트
 *
 * GET /api/users/:id/permissions/history?asOf= - 특정 시점의 사용자 권한 조회
 */

import type { Mock } from 'vitest'

vi.mock('@/auth', () => ({
  __esModule: true,
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: vi.fn() },
    userRoleGroupHistory: { findMany: vi.fn() },
    roleGroupRoleHistory: { findMany: vi.fn() },
    rolePermissionHistory: { findMany: vi.fn() },
    permissionHistory: { findMany: vi.fn() },
  },
}))

import { GET } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as Mock
const mockUserFindUnique = prisma.user.findUnique as Mock
const mockUserRoleGroupHistory = prisma.userRoleGroupHistory.findMany as Mock
const mockRoleGroupRoleHistory = prisma.roleGroupRoleHistory.findMany as Mock
const mockRolePermissionHistory = prisma.rolePermissionHistory.findMany as Mock
const mockPermissionHistory = prisma.permissionHistory.findMany as Mock

function createRequest(url: string) {
  return new Request(url) as unknown as import('next/server').NextRequest
}

const adminUser = {
  userId: 'admin1',
  userRoleGroups: [
    { roleGroup: { roleGroupRoles: [{ role: { roleCd: 'SYSTEM_ADMIN' } }] } },
  ],
}

describe('GET /api/users/:id/permissions/history', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('인증되지 않은 요청은 401을 반환한다', async () => {
    mockAuth.mockResolvedValue(null)

    const response = await GET(
      createRequest('http://localhost/api/users/user1/permissions/history?asOf=2026-01-15T00:00:00Z'),
      { params: Promise.resolve({ id: 'user1' }) }
    )

    expect(response.status).toBe(401)
  })

  it('asOf 파라미터가 없으면 400을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)

    const response = await GET(
      createRequest('http://localhost/api/users/user1/permissions/history'),
      { params: Promise.resolve({ id: 'user1' }) }
    )

    expect(response.status).toBe(400)
  })

  it('특정 시점의 사용자 권한을 SCD Type 2 패턴으로 조회한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)

    mockUserRoleGroupHistory.mockResolvedValue([
      { roleGroupId: 1 },
      { roleGroupId: 2 },
    ])
    mockRoleGroupRoleHistory.mockResolvedValue([
      { roleGroupId: 1, roleId: 10 },
      { roleGroupId: 2, roleId: 20 },
    ])
    mockRolePermissionHistory.mockResolvedValue([
      { roleId: 10, permissionId: 100 },
      { roleId: 20, permissionId: 200 },
    ])
    mockPermissionHistory.mockResolvedValue([
      {
        historyId: 1,
        permissionId: 100,
        permissionCd: 'PROD_VIEW',
        name: '생산 조회',
        config: '{"actions":["read"]}',
        isActive: true,
        validFrom: new Date('2026-01-01'),
        validTo: null,
      },
      {
        historyId: 2,
        permissionId: 200,
        permissionCd: 'QA_VIEW',
        name: '품질 조회',
        config: '{"actions":["read"]}',
        isActive: true,
        validFrom: new Date('2026-01-01'),
        validTo: null,
      },
    ])

    const response = await GET(
      createRequest('http://localhost/api/users/user1/permissions/history?asOf=2026-01-15T00:00:00Z'),
      { params: Promise.resolve({ id: 'user1' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.asOf).toBe('2026-01-15T00:00:00.000Z')
    expect(body.data.permissions).toHaveLength(2)

    // SCD Type 2 패턴 확인: validFrom <= asOf && (validTo is null || validTo > asOf)
    const callArgs = mockUserRoleGroupHistory.mock.calls[0][0]
    expect(callArgs.where).toHaveProperty('userId', 'user1')
    expect(callArgs.where).toHaveProperty('validFrom')
    expect(callArgs.where.validFrom.lte).toBeInstanceOf(Date)
    expect(callArgs.where.OR).toEqual([
      { validTo: null },
      { validTo: { gt: expect.any(Date) } },
    ])
  })
})
