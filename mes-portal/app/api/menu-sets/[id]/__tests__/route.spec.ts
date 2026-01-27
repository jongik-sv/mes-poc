/**
 * 메뉴셋 상세 API 엔드포인트 테스트
 *
 * GET /api/menu-sets/:id - 메뉴셋 상세 조회
 * PUT /api/menu-sets/:id - 메뉴셋 수정 (관리자)
 * DELETE /api/menu-sets/:id - 메뉴셋 삭제 (관리자)
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
      update: vi.fn(),
      delete: vi.fn(),
    },
    menuSetHistory: {
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { GET, PUT, DELETE } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as Mock
const mockUserFindUnique = prisma.user.findUnique as Mock
const mockMenuSetFindUnique = prisma.menuSet.findUnique as Mock
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

const mockParams = Promise.resolve({ id: '1' })

describe('GET /api/menu-sets/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('미인증 요청은 401을 반환한다', async () => {
    mockAuth.mockResolvedValue(null)

    const request = new Request('http://localhost/api/menu-sets/1')
    const response = await GET(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('존재하지 않는 메뉴셋은 404를 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockMenuSetFindUnique.mockResolvedValue(null)

    const request = new Request('http://localhost/api/menu-sets/999')
    const response = await GET(request, { params: Promise.resolve({ id: '999' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('메뉴셋 상세를 메뉴 목록과 함께 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockMenuSetFindUnique.mockResolvedValue({
      menuSetId: 1,
      systemId: 'sys-01',
      menuSetCd: 'MS001',
      name: '기본 메뉴셋',
      description: '설명',
      isDefault: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      menuSetMenus: [
        {
          menuId: 10,
          menu: { menuId: 10, menuCd: 'M010', name: '생산관리', category: '생산', isActive: true },
        },
      ],
      _count: { menuSetMenus: 1, userSystemMenuSets: 3 },
    })

    const request = new Request('http://localhost/api/menu-sets/1')
    const response = await GET(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.menuSetId).toBe(1)
    expect(data.data.menus).toHaveLength(1)
    expect(data.data.menuCount).toBe(1)
  })
})

describe('PUT /api/menu-sets/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('관리자가 아니면 403을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-001' } })
    mockUserFindUnique.mockResolvedValue(normalUser)

    const request = new Request('http://localhost/api/menu-sets/1', {
      method: 'PUT',
      body: JSON.stringify({ name: '변경' }),
    })
    const response = await PUT(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe('FORBIDDEN')
  })

  it('존재하지 않는 메뉴셋은 404를 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockMenuSetFindUnique.mockResolvedValue(null)

    const request = new Request('http://localhost/api/menu-sets/999', {
      method: 'PUT',
      body: JSON.stringify({ name: '변경' }),
    })
    const response = await PUT(request, { params: Promise.resolve({ id: '999' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('관리자가 메뉴셋을 수정한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockMenuSetFindUnique.mockResolvedValue({
      menuSetId: 1,
      systemId: 'sys-01',
      menuSetCd: 'MS001',
      name: '기존 이름',
      description: null,
      isDefault: false,
      isActive: true,
    })

    const updatedMenuSet = {
      menuSetId: 1,
      systemId: 'sys-01',
      menuSetCd: 'MS001',
      name: '변경된 이름',
      description: '새 설명',
      isDefault: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        menuSetHistory: { updateMany: vi.fn().mockResolvedValue({}), create: vi.fn().mockResolvedValue({}) },
        menuSet: { update: vi.fn().mockResolvedValue(updatedMenuSet) },
      }
      return fn(tx)
    })

    const request = new Request('http://localhost/api/menu-sets/1', {
      method: 'PUT',
      body: JSON.stringify({ name: '변경된 이름', description: '새 설명' }),
    })
    const response = await PUT(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.name).toBe('변경된 이름')
    expect(mockTransaction).toHaveBeenCalled()
  })
})

describe('DELETE /api/menu-sets/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('관리자가 아니면 403을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-001' } })
    mockUserFindUnique.mockResolvedValue(normalUser)

    const request = new Request('http://localhost/api/menu-sets/1', { method: 'DELETE' })
    const response = await DELETE(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe('FORBIDDEN')
  })

  it('존재하지 않는 메뉴셋은 404를 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockMenuSetFindUnique.mockResolvedValue(null)

    const request = new Request('http://localhost/api/menu-sets/999', { method: 'DELETE' })
    const response = await DELETE(request, { params: Promise.resolve({ id: '999' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('관리자가 메뉴셋을 삭제한다 (히스토리 포함)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin-001' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockMenuSetFindUnique.mockResolvedValue({
      menuSetId: 1,
      systemId: 'sys-01',
      menuSetCd: 'MS001',
      name: '삭제할 메뉴셋',
      description: null,
      isDefault: false,
      isActive: true,
      menuSetMenus: [{ menuId: 10 }, { menuId: 20 }],
    })

    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        menuSetHistory: { updateMany: vi.fn().mockResolvedValue({}), create: vi.fn().mockResolvedValue({}) },
        menuSetMenuHistory: { updateMany: vi.fn().mockResolvedValue({}), createMany: vi.fn().mockResolvedValue({}) },
        menuSet: { delete: vi.fn().mockResolvedValue({}) },
      }
      return fn(tx)
    })

    const request = new Request('http://localhost/api/menu-sets/1', { method: 'DELETE' })
    const response = await DELETE(request, { params: mockParams })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockTransaction).toHaveBeenCalled()
  })
})
