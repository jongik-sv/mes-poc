/**
 * 시스템 상세 API 엔드포인트 테스트
 *
 * 테스트 시나리오:
 * - GET: 상세 조회 (relation count 포함)
 * - PUT: 수정 (관리자 전용, domain 중복 검사)
 * - DELETE: 소프트 삭제 (isActive=false)
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
      findUnique: vi.fn(),
      update: vi.fn(),
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

import { GET, PUT, DELETE } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const mockAuth = auth as Mock
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

const mockParams = (id: string) => Promise.resolve({ id })

const sampleSystem = {
  systemId: 'sys1',
  name: '시스템1',
  domain: 'sys1.example.com',
  description: '설명',
  isActive: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  _count: { menuSets: 1, roles: 2, menus: 3 },
}

describe('GET /api/systems/:id', () => {
  beforeEach(() => vi.resetAllMocks())

  it('시스템 상세 정보를 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockSystemFindUnique.mockResolvedValue(sampleSystem)

    const req = createRequest('http://localhost/api/systems/sys1')
    const res = await GET(req, { params: mockParams('sys1') })
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.systemId).toBe('sys1')
    expect(data.data.menuSetsCount).toBe(1)
    expect(data.data.rolesCount).toBe(2)
    expect(data.data.menusCount).toBe(3)
  })

  it('존재하지 않는 시스템은 404를 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockSystemFindUnique.mockResolvedValue(null)

    const req = createRequest('http://localhost/api/systems/nope')
    const res = await GET(req, { params: mockParams('nope') })

    expect(res.status).toBe(404)
  })
})

describe('PUT /api/systems/:id', () => {
  beforeEach(() => vi.resetAllMocks())

  it('관리자가 시스템을 수정한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockSystemFindUnique
      .mockResolvedValueOnce(sampleSystem) // existing check
      .mockResolvedValueOnce(null) // domain dup check

    const updated = { ...sampleSystem, name: '수정됨' }
    mockTransaction.mockResolvedValue(updated)

    const req = createRequest('http://localhost/api/systems/sys1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '수정됨' }),
    })

    const res = await PUT(req, { params: mockParams('sys1') })
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('중복 domain을 거부한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockSystemFindUnique
      .mockResolvedValueOnce(sampleSystem) // existing
      .mockResolvedValueOnce({ systemId: 'other', domain: 'taken.com' }) // domain dup

    const req = createRequest('http://localhost/api/systems/sys1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: 'taken.com' }),
    })

    const res = await PUT(req, { params: mockParams('sys1') })
    const data = await res.json()

    expect(res.status).toBe(409)
    expect(data.error.code).toBe('DUPLICATE')
  })
})

describe('DELETE /api/systems/:id', () => {
  beforeEach(() => vi.resetAllMocks())

  it('관리자가 시스템을 소프트 삭제한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockSystemFindUnique.mockResolvedValue(sampleSystem)
    mockTransaction.mockResolvedValue({ ...sampleSystem, isActive: false })

    const req = createRequest('http://localhost/api/systems/sys1', { method: 'DELETE' })
    const res = await DELETE(req, { params: mockParams('sys1') })
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('존재하지 않는 시스템은 404를 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'admin1' } })
    mockUserFindUnique.mockResolvedValue(adminUser)
    mockSystemFindUnique.mockResolvedValue(null)

    const req = createRequest('http://localhost/api/systems/nope', { method: 'DELETE' })
    const res = await DELETE(req, { params: mockParams('nope') })

    expect(res.status).toBe(404)
  })
})
