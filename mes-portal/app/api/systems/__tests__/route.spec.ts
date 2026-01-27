/**
 * 시스템 API 엔드포인트 테스트
 *
 * 테스트 시나리오:
 * - GET: 목록 조회 (페이징, 검색, 필터)
 * - POST: 시스템 생성 (관리자 전용, 유효성 검증, 중복 검사)
 */

import type { Mock } from 'vitest'

vi.mock('@/auth', () => ({
  __esModule: true,
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    system: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    systemHistory: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { GET, POST } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as Mock
const mockSystemFindMany = prisma.system.findMany as Mock
const mockSystemCount = prisma.system.count as Mock
const mockSystemFindUnique = prisma.system.findUnique as Mock
const mockUserFindUnique = prisma.user.findUnique as Mock
const mockTransaction = prisma.$transaction as Mock

function createRequest(url: string, options?: RequestInit) {
  return new Request(url, options) as unknown as import('next/server').NextRequest
}

const adminUser = {
  userId: 'admin1',
  userRoleGroups: [
    {
      roleGroup: {
        roleGroupRoles: [{ role: { roleCd: 'SYSTEM_ADMIN' } }],
      },
    },
  ],
}

const nonAdminUser = {
  userId: 'user1',
  userRoleGroups: [
    {
      roleGroup: {
        roleGroupRoles: [{ role: { roleCd: 'USER' } }],
      },
    },
  ],
}

describe('GET /api/systems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('페이징된 시스템 목록을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockSystemCount.mockResolvedValue(2)
    mockSystemFindMany.mockResolvedValue([
      {
        systemId: 'sys1',
        name: '시스템1',
        domain: 'sys1.example.com',
        description: '설명1',
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        _count: { menuSets: 1, roles: 2, menus: 3 },
      },
    ])

    const req = createRequest('http://localhost/api/systems?page=1&pageSize=10')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.page).toBe(1)
    expect(data.data.pageSize).toBe(10)
    expect(data.data.total).toBe(2)
    expect(data.data.totalPages).toBe(1)
    expect(data.data.items).toHaveLength(1)
  })

  it('isActive 필터를 적용한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockSystemCount.mockResolvedValue(0)
    mockSystemFindMany.mockResolvedValue([])

    const req = createRequest('http://localhost/api/systems?isActive=true')
    await GET(req)

    expect(mockSystemCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      })
    )
  })

  it('search로 name/domain을 검색한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockSystemCount.mockResolvedValue(0)
    mockSystemFindMany.mockResolvedValue([])

    const req = createRequest('http://localhost/api/systems?search=test')
    await GET(req)

    expect(mockSystemCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'test' } },
            { domain: { contains: 'test' } },
          ],
        }),
      })
    )
  })

  it('미인증 요청은 401을 반환한다', async () => {
    mockAuth.mockResolvedValue(null)

    const req = createRequest('http://localhost/api/systems')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })
})

describe('POST /api/systems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('관리자가 시스템을 생성한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockSystemFindUnique.mockResolvedValue(null) // no duplicate

    const createdSystem = {
      systemId: 'new-sys',
      name: '새 시스템',
      domain: 'new.example.com',
      description: '설명',
      isActive: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }
    mockTransaction.mockResolvedValue(createdSystem)

    const req = createRequest('http://localhost/api/systems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemId: 'new-sys',
        name: '새 시스템',
        domain: 'new.example.com',
        description: '설명',
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.systemId).toBe('new-sys')
  })

  it('필수 필드가 없으면 400을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)

    const req = createRequest('http://localhost/api/systems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '시스템' }), // missing systemId, domain
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('중복 systemId를 거부한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockSystemFindUnique.mockResolvedValueOnce({ systemId: 'dup-sys' }) // duplicate by systemId

    const req = createRequest('http://localhost/api/systems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemId: 'dup-sys',
        name: '중복',
        domain: 'unique.com',
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(409)
    expect(data.error.code).toBe('DUPLICATE')
  })

  it('중복 domain을 거부한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockSystemFindUnique
      .mockResolvedValueOnce(null) // no dup by systemId
      .mockResolvedValueOnce({ domain: 'dup.com' }) // dup by domain

    const req = createRequest('http://localhost/api/systems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemId: 'new-sys',
        name: '시스템',
        domain: 'dup.com',
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(409)
    expect(data.error.code).toBe('DUPLICATE')
  })

  it('미인증 요청은 401을 반환한다', async () => {
    mockAuth.mockResolvedValue(null)

    const req = createRequest('http://localhost/api/systems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemId: 'x', name: 'x', domain: 'x' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('관리자가 아니면 403을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user1' } })
    mockUserFindUnique.mockResolvedValue(nonAdminUser)

    const req = createRequest('http://localhost/api/systems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemId: 'x', name: 'x', domain: 'x' }),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(403)
    expect(data.error.code).toBe('FORBIDDEN')
  })
})
