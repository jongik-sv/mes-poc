/**
 * 메뉴셋 API 엔드포인트 테스트
 *
 * GET /api/menu-sets - 메뉴셋 목록 조회 (페이징, 필터)
 * POST /api/menu-sets - 메뉴셋 생성 (관리자)
 */

import type { Mock } from 'vitest'

vi.mock('@/auth', () => ({
  __esModule: true,
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    menuSet: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    menuSetHistory: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { GET, POST } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as Mock
const mockUserFindUnique = prisma.user.findUnique as Mock
const mockMenuSetFindMany = prisma.menuSet.findMany as Mock
const mockMenuSetCount = prisma.menuSet.count as Mock
const mockMenuSetFindUnique = prisma.menuSet.findUnique as Mock
const mockTransaction = prisma.$transaction as Mock

// 관리자 사용자 mock 데이터
const adminUser = {
  userId: 'admin-001',
  isActive: true,
  userRoleGroups: [
    {
      roleGroup: {
        roleGroupRoles: [{ role: { roleCd: 'SYSTEM_ADMIN' } }],
      },
    },
  ],
}

const normalUser = {
  userId: 'user-001',
  isActive: true,
  userRoleGroups: [
    {
      roleGroup: {
        roleGroupRoles: [{ role: { roleCd: 'VIEWER' } }],
      },
    },
  ],
}

function makeRequest(url: string): Request {
  return new Request(url)
}

describe('GET /api/menu-sets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('미인증 요청은 401을 반환한다', async () => {
    mockAuth.mockResolvedValue(null)

    const request = makeRequest('http://localhost/api/menu-sets')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('페이징된 메뉴셋 목록을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })

    const mockMenuSets = [
      {
        menuSetId: 1,
        systemId: 'sys-01',
        menuSetCd: 'MS001',
        name: '기본 메뉴셋',
        description: '설명',
        isDefault: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { menuSetMenus: 5, userSystemMenuSets: 2 },
      },
    ]

    mockMenuSetCount.mockResolvedValue(1)
    mockMenuSetFindMany.mockResolvedValue(mockMenuSets)

    const request = makeRequest('http://localhost/api/menu-sets?page=1&pageSize=10')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.items).toHaveLength(1)
    expect(data.data.total).toBe(1)
    expect(data.data.page).toBe(1)
    expect(data.data.totalPages).toBe(1)
  })

  it('systemId로 필터링한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockMenuSetCount.mockResolvedValue(0)
    mockMenuSetFindMany.mockResolvedValue([])

    const request = makeRequest('http://localhost/api/menu-sets?systemId=sys-01')
    await GET(request)

    expect(mockMenuSetCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ systemId: 'sys-01' }),
      })
    )
  })

  it('isActive로 필터링한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockMenuSetCount.mockResolvedValue(0)
    mockMenuSetFindMany.mockResolvedValue([])

    const request = makeRequest('http://localhost/api/menu-sets?isActive=true')
    await GET(request)

    expect(mockMenuSetCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      })
    )
  })

  it('search로 이름/코드를 검색한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockMenuSetCount.mockResolvedValue(0)
    mockMenuSetFindMany.mockResolvedValue([])

    const request = makeRequest('http://localhost/api/menu-sets?search=기본')
    await GET(request)

    expect(mockMenuSetCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { menuSetCd: { contains: '기본' } },
            { name: { contains: '기본' } },
          ],
        }),
      })
    )
  })
})

describe('POST /api/menu-sets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('미인증 요청은 401을 반환한다', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new Request('http://localhost/api/menu-sets', {
      method: 'POST',
      body: JSON.stringify({ systemId: 'sys-01', menuSetCd: 'MS001', name: '테스트' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('관리자가 아니면 403을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-001' } })
    mockUserFindUnique.mockResolvedValue(normalUser)

    const request = new Request('http://localhost/api/menu-sets', {
      method: 'POST',
      body: JSON.stringify({ systemId: 'sys-01', menuSetCd: 'MS001', name: '테스트' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe('FORBIDDEN')
  })

  it('필수 필드 누락 시 400을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockUserFindUnique.mockResolvedValue(adminUser)

    const request = new Request('http://localhost/api/menu-sets', {
      method: 'POST',
      body: JSON.stringify({ systemId: 'sys-01' }), // menuSetCd, name 누락
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('중복 menuSetCd는 409를 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockMenuSetFindUnique.mockResolvedValue({ menuSetId: 1, menuSetCd: 'MS001' })

    const request = new Request('http://localhost/api/menu-sets', {
      method: 'POST',
      body: JSON.stringify({ systemId: 'sys-01', menuSetCd: 'MS001', name: '테스트' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error.code).toBe('DUPLICATE_CODE')
  })

  it('관리자가 메뉴셋을 생성한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockMenuSetFindUnique.mockResolvedValue(null) // 중복 없음

    const createdMenuSet = {
      menuSetId: 1,
      systemId: 'sys-01',
      menuSetCd: 'MS001',
      name: '기본 메뉴셋',
      description: '설명',
      isDefault: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        menuSet: { create: vi.fn().mockResolvedValue(createdMenuSet) },
        menuSetHistory: { create: vi.fn().mockResolvedValue({}) },
      }
      return fn(tx)
    })

    const request = new Request('http://localhost/api/menu-sets', {
      method: 'POST',
      body: JSON.stringify({
        systemId: 'sys-01',
        menuSetCd: 'MS001',
        name: '기본 메뉴셋',
        description: '설명',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.menuSetCd).toBe('MS001')
    expect(mockTransaction).toHaveBeenCalled()
  })
})
