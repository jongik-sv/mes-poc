/**
 * 메뉴셋 메뉴 할당 API 엔드포인트 테스트
 *
 * GET /api/menu-sets/:id/menus - 할당된 메뉴 목록
 * POST /api/menu-sets/:id/menus - 메뉴 할당 (전체 교체)
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
      findUnique: vi.fn(),
    },
    menuSetMenu: {
      findMany: vi.fn(),
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
const mockMenuSetFindUnique = prisma.menuSet.findUnique as Mock
const mockMenuSetMenuFindMany = prisma.menuSetMenu.findMany as Mock
const mockTransaction = prisma.$transaction as Mock

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

const mockParams = Promise.resolve({ id: '1' })

describe('GET /api/menu-sets/:id/menus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('미인증 요청은 401을 반환한다', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new Request('http://localhost/api/menu-sets/1/menus')
    const response = await GET(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('존재하지 않는 메뉴셋은 404를 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockMenuSetFindUnique.mockResolvedValue(null)

    const request = new Request('http://localhost/api/menu-sets/999/menus')
    const response = await GET(request, { params: Promise.resolve({ id: '999' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('할당된 메뉴 목록을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockMenuSetFindUnique.mockResolvedValue({ menuSetId: 1 })
    mockMenuSetMenuFindMany.mockResolvedValue([
      {
        menuSetId: 1,
        menuId: 10,
        createdAt: new Date(),
        menu: { menuId: 10, menuCd: 'M010', name: '생산관리', category: '생산', path: '/production', isActive: true },
      },
      {
        menuSetId: 1,
        menuId: 20,
        createdAt: new Date(),
        menu: { menuId: 20, menuCd: 'M020', name: '품질관리', category: '품질', path: '/quality', isActive: true },
      },
    ])

    const request = new Request('http://localhost/api/menu-sets/1/menus')
    const response = await GET(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(2)
    expect(data.data[0].menuId).toBe(10)
  })
})

describe('POST /api/menu-sets/:id/menus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('관리자가 아니면 403을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-001' } })
    mockUserFindUnique.mockResolvedValue({
      userId: 'user-001',
      isActive: true,
      userRoleGroups: [
        { roleGroup: { roleGroupRoles: [{ role: { roleCd: 'VIEWER' } }] } },
      ],
    })

    const request = new Request('http://localhost/api/menu-sets/1/menus', {
      method: 'POST',
      body: JSON.stringify({ menuIds: [10, 20] }),
    })
    const response = await POST(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe('FORBIDDEN')
  })

  it('존재하지 않는 메뉴셋은 404를 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockMenuSetFindUnique.mockResolvedValue(null)

    const request = new Request('http://localhost/api/menu-sets/999/menus', {
      method: 'POST',
      body: JSON.stringify({ menuIds: [10] }),
    })
    const response = await POST(request, { params: Promise.resolve({ id: '999' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('메뉴를 전체 교체(replace all) 방식으로 할당한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockMenuSetFindUnique.mockResolvedValue({
      menuSetId: 1,
      menuSetMenus: [{ menuId: 5 }, { menuId: 10 }], // 기존 할당
    })

    const newAssignments = [
      { menuSetId: 1, menuId: 10, createdAt: new Date() },
      { menuSetId: 1, menuId: 20, createdAt: new Date() },
      { menuSetId: 1, menuId: 30, createdAt: new Date() },
    ]

    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        menuSetMenu: {
          deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
          createMany: vi.fn().mockResolvedValue({ count: 3 }),
          findMany: vi.fn().mockResolvedValue(newAssignments),
        },
        menuSetMenuHistory: {
          updateMany: vi.fn().mockResolvedValue({}),
          createMany: vi.fn().mockResolvedValue({}),
        },
      }
      return fn(tx)
    })

    const request = new Request('http://localhost/api/menu-sets/1/menus', {
      method: 'POST',
      body: JSON.stringify({ menuIds: [10, 20, 30] }),
    })
    const response = await POST(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockTransaction).toHaveBeenCalled()
  })

  it('menuIds가 없으면 400을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockUserFindUnique.mockResolvedValue(adminUser)

    const request = new Request('http://localhost/api/menu-sets/1/menus', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const response = await POST(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })
})
