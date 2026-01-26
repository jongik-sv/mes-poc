/**
 * 메뉴 필터링 단위 테스트 (TSK-03-02)
 *
 * 테스트 대상:
 * - filterMenuTree: 권한 기반 메뉴 필터링
 * - includeParentMenus: 부모 메뉴 자동 포함 (BR-03-05)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    menu: {
      findMany: vi.fn(),
    },
  },
}))

import {
  filterMenuTree,
  includeParentMenus,
  getAuthorizedMenus,
  type MenuItem,
} from '../menu-filter'
import prisma from '@/lib/prisma'

const mockPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>
  }
  menu: {
    findMany: ReturnType<typeof vi.fn>
  }
}

// 테스트용 메뉴 데이터
const mockMenus: MenuItem[] = [
  {
    id: 1,
    code: 'SYSTEM',
    name: '시스템 관리',
    path: null,
    parentId: null,
    sortOrder: 1,
    icon: 'SettingOutlined',
    isActive: true,
    children: [],
  },
  {
    id: 2,
    code: 'SYSTEM_USER',
    name: '사용자 관리',
    path: '/system/users',
    parentId: 1,
    sortOrder: 1,
    icon: null,
    isActive: true,
    children: [],
  },
  {
    id: 3,
    code: 'SYSTEM_ROLE',
    name: '역할 관리',
    path: '/system/roles',
    parentId: 1,
    sortOrder: 2,
    icon: null,
    isActive: true,
    children: [],
  },
  {
    id: 4,
    code: 'PRODUCTION',
    name: '생산 관리',
    path: null,
    parentId: null,
    sortOrder: 2,
    icon: 'DeploymentUnitOutlined',
    isActive: true,
    children: [],
  },
  {
    id: 5,
    code: 'PRODUCTION_ORDER',
    name: '작업 지시',
    path: '/production/orders',
    parentId: 4,
    sortOrder: 1,
    icon: null,
    isActive: true,
    children: [],
  },
]

describe('메뉴 필터링', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('filterMenuTree', () => {
    it('UT-MENU-001: 빈 allowedIds로 빈 배열 반환', () => {
      const result = filterMenuTree(mockMenus, new Set())
      expect(result).toEqual([])
    })

    it('UT-MENU-002: 허용된 메뉴만 필터링', () => {
      const allowedIds = new Set([2, 3])
      const result = filterMenuTree(mockMenus, allowedIds)

      expect(result.length).toBe(2)
      expect(result.map((m) => m.id)).toEqual([2, 3])
    })

    it('UT-MENU-003: 자식 메뉴가 허용되면 부모 메뉴도 포함', () => {
      const allowedIds = new Set([2]) // 사용자 관리만 허용
      const allowedWithParents = includeParentMenus(allowedIds, mockMenus)

      // 부모 메뉴(SYSTEM)도 포함되어야 함
      expect(allowedWithParents.has(1)).toBe(true)
      expect(allowedWithParents.has(2)).toBe(true)
    })

    it('UT-MENU-004: 트리 구조 유지하며 필터링', () => {
      // 사용자 관리(2)와 역할 관리(3)만 허용
      const allowedIds = new Set([1, 2, 3])
      const result = filterMenuTree(mockMenus, allowedIds)

      // 시스템 관리 폴더가 있어야 함
      const systemMenu = result.find((m) => m.id === 1)
      expect(systemMenu).toBeDefined()
    })
  })

  describe('includeParentMenus (BR-03-05)', () => {
    it('UT-MENU-005: 자식 메뉴 권한 시 부모 자동 포함', () => {
      const allowedIds = new Set([5]) // 작업 지시만 허용
      const result = includeParentMenus(allowedIds, mockMenus)

      // 부모 메뉴(생산 관리)도 포함
      expect(result.has(4)).toBe(true)
      expect(result.has(5)).toBe(true)
    })

    it('UT-MENU-006: 여러 자식 메뉴의 부모 자동 포함', () => {
      const allowedIds = new Set([2, 5]) // 사용자 관리, 작업 지시
      const result = includeParentMenus(allowedIds, mockMenus)

      // 각각의 부모 메뉴도 포함
      expect(result.has(1)).toBe(true) // 시스템 관리
      expect(result.has(4)).toBe(true) // 생산 관리
    })

    it('UT-MENU-007: 부모 메뉴만 허용 시 자식은 미포함', () => {
      const allowedIds = new Set([1]) // 시스템 관리만 허용
      const result = includeParentMenus(allowedIds, mockMenus)

      // 자식 메뉴는 포함되지 않음
      expect(result.has(1)).toBe(true)
      expect(result.has(2)).toBe(false)
      expect(result.has(3)).toBe(false)
    })
  })

  describe('getAuthorizedMenus', () => {
    it('UT-MENU-008: 사용자 역할 기반 메뉴 필터링', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        userRoles: [
          {
            role: {
              roleMenus: [
                { menuId: 2 }, // 사용자 관리
                { menuId: 3 }, // 역할 관리
              ],
            },
          },
        ],
      })
      mockPrisma.menu.findMany.mockResolvedValue(mockMenus)

      const result = await getAuthorizedMenus(1)

      // 사용자 관리, 역할 관리 + 부모(시스템 관리)
      expect(result.length).toBeGreaterThan(0)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
        })
      )
    })

    it('UT-MENU-009: 사용자가 없으면 빈 배열 반환', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await getAuthorizedMenus(999)

      expect(result).toEqual([])
    })

    it('UT-MENU-010: 역할이 없는 사용자는 빈 배열 반환', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        userRoles: [],
      })
      mockPrisma.menu.findMany.mockResolvedValue(mockMenus)

      const result = await getAuthorizedMenus(1)

      expect(result).toEqual([])
    })
  })
})
