/**
 * 권한 변경 이력 API 테스트
 *
 * GET /api/permissions/:id/history - 권한 변경 이력 조회
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
    permissionHistory: { findMany: vi.fn() },
  },
}))

import { GET } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as Mock
const mockUserFindUnique = prisma.user.findUnique as Mock
const mockPermissionHistoryFindMany = prisma.permissionHistory.findMany as Mock

function createRequest(url: string) {
  return new Request(url) as unknown as import('next/server').NextRequest
}

const adminUser = {
  userId: 'admin1',
  userRoleGroups: [
    { roleGroup: { roleGroupRoles: [{ role: { roleCd: 'SYSTEM_ADMIN' } }] } },
  ],
}

describe('GET /api/permissions/:id/history', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('인증되지 않은 요청은 401을 반환한다', async () => {
    mockAuth.mockResolvedValue(null)

    const response = await GET(
      createRequest('http://localhost/api/permissions/1/history'),
      { params: Promise.resolve({ id: '1' }) }
    )

    expect(response.status).toBe(401)
  })

  it('관리자가 아니면 403을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user1' } })
    mockUserFindUnique.mockResolvedValue({
      userId: 'user1',
      userRoleGroups: [
        { roleGroup: { roleGroupRoles: [{ role: { roleCd: 'USER' } }] } },
      ],
    })

    const response = await GET(
      createRequest('http://localhost/api/permissions/1/history'),
      { params: Promise.resolve({ id: '1' }) }
    )

    expect(response.status).toBe(403)
  })

  it('날짜 범위 필터로 이력을 조회한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockPermissionHistoryFindMany.mockResolvedValue([
      {
        historyId: 1,
        permissionId: 1,
        permissionCd: 'PROD_VIEW',
        name: '생산 조회',
        config: '{"actions":["read"]}',
        isActive: true,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-01-10'),
        changeType: 'CREATE',
        changedBy: 'admin1',
      },
    ])

    const response = await GET(
      createRequest('http://localhost/api/permissions/1/history?from=2026-01-01&to=2026-01-31'),
      { params: Promise.resolve({ id: '1' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(1)
    expect(body.data[0].permissionCd).toBe('PROD_VIEW')
  })

  it('날짜 필터 없이 전체 이력을 조회한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockPermissionHistoryFindMany.mockResolvedValue([])

    const response = await GET(
      createRequest('http://localhost/api/permissions/1/history'),
      { params: Promise.resolve({ id: '1' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockPermissionHistoryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ permissionId: 1 }),
      })
    )
  })
})
