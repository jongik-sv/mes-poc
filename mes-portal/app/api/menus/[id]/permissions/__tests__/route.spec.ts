/**
 * 메뉴별 권한 조회 API 테스트
 *
 * GET /api/menus/:menuId/permissions - 특정 메뉴의 권한 목록
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
    menu: { findUnique: vi.fn() },
    permission: { findMany: vi.fn() },
  },
}))

import { GET } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as Mock
const mockUserFindUnique = prisma.user.findUnique as Mock
const mockMenuFindUnique = prisma.menu.findUnique as Mock
const mockPermissionFindMany = prisma.permission.findMany as Mock

function createRequest(url: string) {
  return new Request(url) as unknown as import('next/server').NextRequest
}

const adminUser = {
  userId: 'admin1',
  userRoleGroups: [
    { roleGroup: { roleGroupRoles: [{ role: { roleCd: 'SYSTEM_ADMIN' } }] } },
  ],
}

describe('GET /api/menus/:menuId/permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('인증되지 않은 요청은 401을 반환한다', async () => {
    mockAuth.mockResolvedValue(null)

    const response = await GET(
      createRequest('http://localhost/api/menus/1/permissions'),
      { params: Promise.resolve({ id: '1' }) }
    )

    expect(response.status).toBe(401)
  })

  it('존재하지 않는 메뉴는 404를 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockMenuFindUnique.mockResolvedValue(null)

    const response = await GET(
      createRequest('http://localhost/api/menus/999/permissions'),
      { params: Promise.resolve({ id: '999' }) }
    )

    expect(response.status).toBe(404)
  })

  it('메뉴의 권한 목록을 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockMenuFindUnique.mockResolvedValue({ id: 1, name: '생산관리' })
    mockPermissionFindMany.mockResolvedValue([
      { permissionId: 1, permissionCd: 'PROD_VIEW', name: '생산 조회', config: '{"actions":["read"]}', isActive: true },
      { permissionId: 2, permissionCd: 'PROD_EDIT', name: '생산 수정', config: '{"actions":["read","write"]}', isActive: true },
    ])

    const response = await GET(
      createRequest('http://localhost/api/menus/1/permissions'),
      { params: Promise.resolve({ id: '1' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.menuId).toBe(1)
    expect(body.data.permissions).toHaveLength(2)
    expect(body.data.permissions[0].code).toBe('PROD_VIEW')
  })
})
