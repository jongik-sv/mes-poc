/**
 * 메뉴 API 엔드포인트 테스트 (TSK-03-03)
 *
 * 테스트 시나리오:
 * - UT-001: 인증된 사용자 메뉴 조회
 * - UT-002: 빈 메뉴 목록
 * - UT-003: ADMIN 역할 전체 메뉴
 * - UT-004: 부모 메뉴 자동 포함 (collectParentIds)
 * - UT-005: buildMenuTree 트리 변환
 * - UT-006: sortOrder 정렬
 * - UT-007: 미인증 요청 401
 * - UT-008: 비활성 메뉴 필터링
 * - UT-009: 비활성 사용자 403
 */

import { NextResponse } from 'next/server'
import type { Mock } from 'vitest'

// Mock 설정 - vi.fn()을 팩토리 내부에서 직접 사용
vi.mock('@/auth', () => ({
  __esModule: true,
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: vi.fn(),
    },
    menu: {
      findMany: vi.fn(),
    },
    roleMenu: {
      findMany: vi.fn(),
    },
  },
}))

import { GET } from '../route'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

// Mock 함수 참조 (import 이후에 가져옴)
const mockAuth = auth as Mock
const mockPrismaUser = { findUnique: prisma.user.findUnique as Mock }
const mockPrismaMenu = { findMany: prisma.menu.findMany as Mock }
const mockPrismaRoleMenu = { findMany: prisma.roleMenu.findMany as Mock }

describe('GET /api/menus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('UT-007: 인증 검사', () => {
    it('미인증 요청은 401 Unauthorized를 반환한다', async () => {
      // Arrange
      mockAuth.mockResolvedValue(null)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('UNAUTHORIZED')
      expect(data.error.message).toBe('인증이 필요합니다')
    })

    it('세션에 userId가 없으면 401을 반환한다', async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: {},
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as any)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })

  describe('UT-009: 사용자 활성 상태 검사', () => {
    it('비활성화된 사용자는 403을 반환한다', async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: { id: '1', email: 'test@test.com', role: { id: 2, code: 'MANAGER', name: '매니저' } },
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as any)

      mockPrismaUser.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
        name: '테스트',
        roleId: 2,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: { id: 2, code: 'MANAGER', name: '매니저', createdAt: new Date() },
      } as any)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('USER_INACTIVE')
    })

    it('사용자를 찾을 수 없으면 403을 반환한다', async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: { id: '999', email: 'notfound@test.com', role: { id: 2, code: 'MANAGER', name: '매니저' } },
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as any)

      mockPrismaUser.findUnique.mockResolvedValue(null)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
    })
  })

  describe('UT-001: 인증된 사용자 메뉴 조회', () => {
    it('인증된 사용자는 역할에 따른 메뉴를 반환한다', async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: { id: '1', email: 'user@test.com', role: { id: 2, code: 'MANAGER', name: '매니저' } },
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as any)

      mockPrismaUser.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@test.com',
        password: 'hashed',
        name: '테스트',
        roleId: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: { id: 2, code: 'MANAGER', name: '매니저', createdAt: new Date() },
      } as any)

      mockPrismaRoleMenu.findMany.mockResolvedValue([
        { id: 1, roleId: 2, menuId: 2 },
        { id: 2, roleId: 2, menuId: 3 },
      ])

      mockPrismaMenu.findMany.mockResolvedValue([
        { id: 1, code: 'PROD', name: '생산', path: null, icon: 'ToolOutlined', parentId: null, sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, code: 'PROD_PLAN', name: '생산계획', path: '/portal/production/plan', icon: 'FileTextOutlined', parentId: 1, sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 3, code: 'PROD_RESULT', name: '생산실적', path: '/portal/production/result', icon: 'HistoryOutlined', parentId: 1, sortOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ])

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data[0]).toHaveProperty('children')
      expect(data.data[0]).toHaveProperty('id')
      expect(data.data[0]).toHaveProperty('code')
      expect(data.data[0]).toHaveProperty('name')
    })
  })

  describe('UT-002: 빈 메뉴 목록', () => {
    it('권한이 없는 사용자는 빈 배열을 반환한다', async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: { id: '1', email: 'user@test.com', role: { id: 3, code: 'OPERATOR', name: '운영자' } },
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as any)

      mockPrismaUser.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@test.com',
        password: 'hashed',
        name: '테스트',
        roleId: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: { id: 3, code: 'OPERATOR', name: '운영자', createdAt: new Date() },
      } as any)

      mockPrismaRoleMenu.findMany.mockResolvedValue([])

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
    })
  })

  describe('UT-003: ADMIN 역할 전체 메뉴', () => {
    it('ADMIN 역할은 RoleMenu 필터링 없이 모든 메뉴를 반환한다', async () => {
      // Arrange
      const SYSTEM_ADMIN_ROLE_ID = 1
      mockAuth.mockResolvedValue({
        user: { id: '1', email: 'admin@test.com', role: { id: SYSTEM_ADMIN_ROLE_ID, code: 'ADMIN', name: '관리자' } },
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as any)

      mockPrismaUser.findUnique.mockResolvedValue({
        id: 1,
        email: 'admin@test.com',
        password: 'hashed',
        name: '관리자',
        roleId: SYSTEM_ADMIN_ROLE_ID,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: { id: SYSTEM_ADMIN_ROLE_ID, code: 'ADMIN', name: '관리자', createdAt: new Date() },
      } as any)

      mockPrismaMenu.findMany.mockResolvedValue([
        { id: 1, code: 'ADMIN', name: '관리', path: null, icon: 'SettingOutlined', parentId: null, sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, code: 'PROD', name: '생산', path: null, icon: 'ToolOutlined', parentId: null, sortOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ])

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.length).toBe(2)
      expect(mockPrismaRoleMenu.findMany).not.toHaveBeenCalled()
    })
  })

  describe('UT-004: 부모 메뉴 자동 포함 (BR-02)', () => {
    it('자식 메뉴 권한이 있으면 부모 메뉴도 포함된다', async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: { id: '1', email: 'user@test.com', role: { id: 3, code: 'OPERATOR', name: '운영자' } },
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as any)

      mockPrismaUser.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@test.com',
        password: 'hashed',
        name: '테스트',
        roleId: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: { id: 3, code: 'OPERATOR', name: '운영자', createdAt: new Date() },
      } as any)

      // 자식 메뉴만 권한 부여
      mockPrismaRoleMenu.findMany.mockResolvedValue([
        { id: 1, roleId: 3, menuId: 3 }, // 2단계 자식만 권한
      ])

      mockPrismaMenu.findMany.mockResolvedValue([
        { id: 1, code: 'PROD', name: '생산', path: null, icon: 'ToolOutlined', parentId: null, sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, code: 'PROD_MGMT', name: '생산관리', path: null, icon: 'FolderOutlined', parentId: 1, sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 3, code: 'PROD_ORDER', name: '작업지시', path: '/portal/production/order', icon: 'FileTextOutlined', parentId: 2, sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ])

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // 부모 폴더들이 자동 포함되어야 함
      expect(data.data.length).toBe(1) // 루트: PROD
      expect(data.data[0].code).toBe('PROD')
      expect(data.data[0].children.length).toBe(1) // PROD_MGMT
      expect(data.data[0].children[0].code).toBe('PROD_MGMT')
      expect(data.data[0].children[0].children.length).toBe(1) // PROD_ORDER
      expect(data.data[0].children[0].children[0].code).toBe('PROD_ORDER')
    })
  })

  describe('UT-005 & UT-006: 트리 변환 및 정렬', () => {
    it('메뉴가 계층형 트리 구조로 변환된다', async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: { id: '1', email: 'admin@test.com', role: { id: 1, code: 'ADMIN', name: '관리자' } },
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as any)

      mockPrismaUser.findUnique.mockResolvedValue({
        id: 1,
        email: 'admin@test.com',
        password: 'hashed',
        name: '관리자',
        roleId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: { id: 1, code: 'ADMIN', name: '관리자', createdAt: new Date() },
      } as any)

      mockPrismaMenu.findMany.mockResolvedValue([
        { id: 1, code: 'ROOT1', name: '루트1', path: null, icon: null, parentId: null, sortOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, code: 'ROOT2', name: '루트2', path: null, icon: null, parentId: null, sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 3, code: 'CHILD', name: '자식', path: '/portal/child', icon: null, parentId: 1, sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ])

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // sortOrder 순서로 정렬되어야 함
      expect(data.data[0].code).toBe('ROOT2') // sortOrder: 1
      expect(data.data[1].code).toBe('ROOT1') // sortOrder: 2
      // 부모-자식 관계
      expect(data.data[1].children[0].code).toBe('CHILD')
    })
  })

  describe('UT-008: 비활성 메뉴 필터링', () => {
    it('활성 메뉴만 조회한다 (isActive: true)', async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: { id: '1', email: 'admin@test.com', role: { id: 1, code: 'ADMIN', name: '관리자' } },
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as any)

      mockPrismaUser.findUnique.mockResolvedValue({
        id: 1,
        email: 'admin@test.com',
        password: 'hashed',
        name: '관리자',
        roleId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: { id: 1, code: 'ADMIN', name: '관리자', createdAt: new Date() },
      } as any)

      // menuService.findAll() 또는 findByRole()은 내부적으로 isActive: true 필터링
      mockPrismaMenu.findMany.mockResolvedValue([
        { id: 1, code: 'ACTIVE', name: '활성메뉴', path: null, icon: null, parentId: null, sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ])

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.data.length).toBe(1)
      expect(data.data[0].code).toBe('ACTIVE')
      // Prisma 호출 시 isActive: true 조건 확인
      expect(mockPrismaMenu.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        })
      )
    })
  })

  describe('에러 처리', () => {
    it('데이터베이스 오류 시 500을 반환한다', async () => {
      // Arrange
      mockAuth.mockResolvedValue({
        user: { id: '1', email: 'admin@test.com', role: { id: 1, code: 'ADMIN', name: '관리자' } },
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as any)

      mockPrismaUser.findUnique.mockRejectedValue(new Error('Database connection failed'))

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('DB_ERROR')
    })
  })
})
