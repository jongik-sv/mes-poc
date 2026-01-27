/**
 * 역할-권한 매핑 API 테스트
 *
 * GET /api/roles/:id/permissions - 역할의 권한 목록 조회 (메뉴별 그룹)
 * PUT /api/roles/:id/permissions - 역할-권한 매핑 설정
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
    role: { findUnique: vi.fn() },
    rolePermission: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    auditLog: { create: vi.fn() },
  },
}))

import { GET, PUT } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as Mock
const mockUserFindUnique = prisma.user.findUnique as Mock
const mockRoleFindUnique = prisma.role.findUnique as Mock
const mockRolePermissionFindMany = prisma.rolePermission.findMany as Mock

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

const paramsPromise = Promise.resolve({ id: '1' })

describe('GET /api/roles/:id/permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('인증되지 않은 요청은 401을 반환한다', async () => {
    mockAuth.mockResolvedValue(null)

    const response = await GET(
      createRequest('http://localhost/api/roles/1/permissions'),
      { params: paramsPromise }
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  it('존재하지 않는 역할은 404를 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockRoleFindUnique.mockResolvedValue(null)

    const response = await GET(
      createRequest('http://localhost/api/roles/999/permissions'),
      { params: Promise.resolve({ id: '999' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error.code).toBe('ROLE_NOT_FOUND')
  })

  it('역할의 권한을 메뉴별로 그룹하여 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockRoleFindUnique.mockResolvedValue({ roleId: 1, roleCd: 'OPERATOR' })
    mockRolePermissionFindMany.mockResolvedValue([
      {
        permission: {
          permissionId: 1,
          permissionCd: 'PROD_VIEW',
          name: '생산 조회',
          menuId: 10,
          menu: { menuId: 10, name: '생산관리', menuCd: 'PROD' },
        },
      },
      {
        permission: {
          permissionId: 2,
          permissionCd: 'PROD_EDIT',
          name: '생산 수정',
          menuId: 10,
          menu: { menuId: 10, name: '생산관리', menuCd: 'PROD' },
        },
      },
      {
        permission: {
          permissionId: 3,
          permissionCd: 'GLOBAL_PERM',
          name: '글로벌 권한',
          menuId: null,
          menu: null,
        },
      },
    ])

    const response = await GET(
      createRequest('http://localhost/api/roles/1/permissions'),
      { params: paramsPromise }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.roleId).toBe(1)
    expect(body.data.groups).toHaveLength(2)

    const menuGroup = body.data.groups.find((g: { menuId: number | null }) => g.menuId === 10)
    expect(menuGroup.menuName).toBe('생산관리')
    expect(menuGroup.permissions).toHaveLength(2)

    const globalGroup = body.data.groups.find((g: { menuId: number | null }) => g.menuId === null)
    expect(globalGroup.permissions).toHaveLength(1)
  })
})
