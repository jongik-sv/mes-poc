/**
 * 사용자 역할 그룹 할당 이력 API 테스트
 *
 * GET /api/users/:id/role-groups/history - 사용자의 역할 그룹 할당 이력
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
  },
}))

import { GET } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as Mock
const mockUserFindUnique = prisma.user.findUnique as Mock
const mockUserRoleGroupHistoryFindMany = prisma.userRoleGroupHistory.findMany as Mock

function createRequest(url: string) {
  return new Request(url) as unknown as import('next/server').NextRequest
}

const adminUser = {
  userId: 'admin1',
  userRoleGroups: [
    { roleGroup: { roleGroupRoles: [{ role: { roleCd: 'SYSTEM_ADMIN' } }] } },
  ],
}

describe('GET /api/users/:id/role-groups/history', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('인증되지 않은 요청은 401을 반환한다', async () => {
    mockAuth.mockResolvedValue(null)

    const response = await GET(
      createRequest('http://localhost/api/users/user1/role-groups/history'),
      { params: Promise.resolve({ id: 'user1' }) }
    )

    expect(response.status).toBe(401)
  })

  it('날짜 범위로 이력을 조회한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockUserRoleGroupHistoryFindMany.mockResolvedValue([
      {
        historyId: 1,
        userId: 'user1',
        roleGroupId: 1,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-01-15'),
        changeType: 'ASSIGN',
        changedBy: 'admin1',
      },
      {
        historyId: 2,
        userId: 'user1',
        roleGroupId: 2,
        validFrom: new Date('2026-01-10'),
        validTo: null,
        changeType: 'ASSIGN',
        changedBy: 'admin1',
      },
    ])

    const response = await GET(
      createRequest('http://localhost/api/users/user1/role-groups/history?from=2026-01-01&to=2026-01-31'),
      { params: Promise.resolve({ id: 'user1' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(2)
    expect(body.data[0].changeType).toBe('ASSIGN')
  })

  it('날짜 필터 없이 전체 이력을 조회한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockUserRoleGroupHistoryFindMany.mockResolvedValue([])

    const response = await GET(
      createRequest('http://localhost/api/users/user1/role-groups/history'),
      { params: Promise.resolve({ id: 'user1' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })
})
