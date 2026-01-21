/**
 * MenuService 단위 테스트 (TSK-03-01)
 *
 * 테스트 명세서(026-test-specification.md) 기반
 */

// Jest mock 설정 - jest.fn()을 팩토리 내부에서 직접 사용
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    menu: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    roleMenu: {
      findMany: jest.fn(),
    },
  },
}))

import { MenuService, MenuServiceError } from '../menu.service'
import { MenuErrorCode } from '@/lib/types/menu'
import type { Menu } from '@/lib/generated/prisma/client'
import prisma from '@/lib/prisma'

// Mock 함수 참조 (import 이후에 가져옴)
const mockPrisma = {
  menu: {
    findMany: prisma.menu.findMany as jest.Mock,
    findUnique: prisma.menu.findUnique as jest.Mock,
    create: prisma.menu.create as jest.Mock,
    update: prisma.menu.update as jest.Mock,
    delete: prisma.menu.delete as jest.Mock,
    count: prisma.menu.count as jest.Mock,
  },
  roleMenu: {
    findMany: prisma.roleMenu.findMany as jest.Mock,
  },
}

describe('MenuService', () => {
  let menuService: MenuService

  beforeEach(() => {
    menuService = new MenuService()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    // UT-001: 메뉴 목록 조회 기본
    it('should return menu list (UT-001)', async () => {
      const mockMenus: Menu[] = [
        {
          id: 1,
          code: 'DASHBOARD',
          name: '대시보드',
          path: null,
          icon: 'DashboardOutlined',
          parentId: null,
          sortOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.menu.findMany.mockResolvedValue(mockMenus)

      const result = await menuService.findAll()

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBe(1)
      expect(result[0].code).toBe('DASHBOARD')
      expect(mockPrisma.menu.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      })
    })

    // UT-002: 계층형 메뉴 조회
    it('should return hierarchical menu tree (UT-002)', async () => {
      const mockMenus: Menu[] = [
        {
          id: 1,
          code: 'DASHBOARD',
          name: '대시보드',
          path: null,
          icon: 'DashboardOutlined',
          parentId: null,
          sortOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          code: 'DASHBOARD_MAIN',
          name: '메인 대시보드',
          path: '/portal/dashboard',
          icon: 'BarChartOutlined',
          parentId: 1,
          sortOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.menu.findMany.mockResolvedValue(mockMenus)

      const result = await menuService.findAll()

      expect(result.length).toBe(1)
      expect(result[0].children).toBeDefined()
      expect(result[0].children.length).toBe(1)
      expect(result[0].children[0].code).toBe('DASHBOARD_MAIN')
    })

    // UT-003: 정렬 순서 적용
    it('should return menus ordered by sortOrder (UT-003)', async () => {
      const mockMenus: Menu[] = [
        {
          id: 10,
          code: 'PRODUCTION',
          name: '생산 관리',
          path: null,
          icon: 'ToolOutlined',
          parentId: null,
          sortOrder: 2,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 1,
          code: 'DASHBOARD',
          name: '대시보드',
          path: null,
          icon: 'DashboardOutlined',
          parentId: null,
          sortOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.menu.findMany.mockResolvedValue(mockMenus)

      const result = await menuService.findAll()

      expect(result[0].sortOrder).toBeLessThan(result[1].sortOrder)
    })

    // UT-005: 비활성 메뉴 필터링 (isActive=false 제외)
    it('should filter out inactive menus (UT-005)', async () => {
      mockPrisma.menu.findMany.mockResolvedValue([])

      await menuService.findAll()

      expect(mockPrisma.menu.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        })
      )
    })

    // UT-009: 비활성 메뉴 응답 제외 (DB에서 필터링)
    it('should only include active menus in response (UT-009)', async () => {
      const activeMenus: Menu[] = [
        {
          id: 1,
          code: 'ACTIVE',
          name: '활성 메뉴',
          path: '/portal/active',
          icon: 'CheckOutlined',
          parentId: null,
          sortOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.menu.findMany.mockResolvedValue(activeMenus)

      const result = await menuService.findAll()

      result.forEach((menu) => {
        expect(menu).not.toHaveProperty('isActive', false)
      })
    })
  })

  describe('create', () => {
    // UT-001: 정상 메뉴 생성
    it('should create menu with valid data (UT-001)', async () => {
      const createDto = {
        code: 'TEST_MENU',
        name: '테스트 메뉴',
        path: '/portal/test',
        icon: 'HomeOutlined',
        sortOrder: 1,
      }

      const mockCreatedMenu: Menu = {
        id: 100,
        ...createDto,
        parentId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.menu.findUnique.mockResolvedValue(null)
      mockPrisma.menu.create.mockResolvedValue(mockCreatedMenu)

      const result = await menuService.create(createDto)

      expect(result.id).toBe(100)
      expect(result.code).toBe('TEST_MENU')
      expect(result.name).toBe('테스트 메뉴')
      expect(result.createdAt).toBeDefined()
    })

    // UT-004: 아이콘 필드 저장
    it('should save icon field correctly (UT-004)', async () => {
      const createDto = {
        code: 'ICON_TEST',
        name: '아이콘 테스트',
        icon: 'HomeOutlined',
      }

      const mockCreatedMenu: Menu = {
        id: 101,
        code: 'ICON_TEST',
        name: '아이콘 테스트',
        path: null,
        icon: 'HomeOutlined',
        parentId: null,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.menu.findUnique.mockResolvedValue(null)
      mockPrisma.menu.create.mockResolvedValue(mockCreatedMenu)

      const result = await menuService.create(createDto)

      expect(result.icon).toBe('HomeOutlined')
    })

    // UT-006: 중복 코드 거부
    it('should throw ConflictException for duplicate code (UT-006)', async () => {
      const createDto = {
        code: 'EXISTING_CODE',
        name: '중복 테스트',
      }

      mockPrisma.menu.findUnique.mockResolvedValue({
        id: 1,
        code: 'EXISTING_CODE',
        name: '기존 메뉴',
        path: null,
        icon: null,
        parentId: null,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await expect(menuService.create(createDto)).rejects.toThrow(MenuServiceError)
      await expect(menuService.create(createDto)).rejects.toMatchObject({
        code: MenuErrorCode.DUPLICATE_MENU_CODE,
      })
    })

    // UT-007: 4단계 메뉴 거부
    it('should throw BadRequestException for depth > 3 (UT-007)', async () => {
      const createDto = {
        code: 'LEVEL4',
        name: '4단계 메뉴',
        parentId: 3, // 3단계 메뉴를 부모로 지정
      }

      mockPrisma.menu.findUnique
        .mockResolvedValueOnce(null) // 코드 중복 체크
        .mockResolvedValueOnce({ parentId: 2 }) // 부모(3단계)의 parentId
        .mockResolvedValueOnce({ parentId: 1 }) // 2단계의 parentId
        .mockResolvedValueOnce({ parentId: null }) // 1단계의 parentId

      try {
        await menuService.create(createDto)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(MenuServiceError)
        expect((error as MenuServiceError).code).toBe(MenuErrorCode.MAX_DEPTH_EXCEEDED)
      }
    })

    // UT-011: 입력 검증 실패 - 유효하지 않은 code
    describe('input validation (UT-011)', () => {
      it('should throw for invalid code format', async () => {
        const createDto = {
          code: 'invalid-code', // 소문자 + 하이픈 (허용 안 됨)
          name: '테스트',
        }

        await expect(menuService.create(createDto)).rejects.toThrow(MenuServiceError)
        await expect(menuService.create(createDto)).rejects.toMatchObject({
          code: MenuErrorCode.VALIDATION_ERROR,
        })
      })

      it('should throw for invalid path with javascript:', async () => {
        const createDto = {
          code: 'INVALID_PATH',
          name: '테스트',
          path: 'javascript:alert(1)',
        }

        await expect(menuService.create(createDto)).rejects.toThrow(MenuServiceError)
        await expect(menuService.create(createDto)).rejects.toMatchObject({
          code: MenuErrorCode.VALIDATION_ERROR,
        })
      })

      it('should throw for invalid icon', async () => {
        const createDto = {
          code: 'INVALID_ICON',
          name: '테스트',
          icon: 'InvalidIcon',
        }

        await expect(menuService.create(createDto)).rejects.toThrow(MenuServiceError)
        await expect(menuService.create(createDto)).rejects.toMatchObject({
          code: MenuErrorCode.VALIDATION_ERROR,
        })
      })

      it('should throw for empty name', async () => {
        const createDto = {
          code: 'EMPTY_NAME',
          name: '',
        }

        await expect(menuService.create(createDto)).rejects.toThrow(MenuServiceError)
        await expect(menuService.create(createDto)).rejects.toMatchObject({
          code: MenuErrorCode.VALIDATION_ERROR,
        })
      })

      it('should throw for negative sortOrder', async () => {
        const createDto = {
          code: 'NEGATIVE_SORT',
          name: '테스트',
          sortOrder: -1,
        }

        await expect(menuService.create(createDto)).rejects.toThrow(MenuServiceError)
        await expect(menuService.create(createDto)).rejects.toMatchObject({
          code: MenuErrorCode.VALIDATION_ERROR,
        })
      })

      it('should throw for code with forbidden characters in name', async () => {
        const createDto = {
          code: 'HTML_TEST',
          name: '<script>alert(1)</script>',
        }

        await expect(menuService.create(createDto)).rejects.toThrow(MenuServiceError)
        await expect(menuService.create(createDto)).rejects.toMatchObject({
          code: MenuErrorCode.VALIDATION_ERROR,
        })
      })
    })

    // UT-012: 경계값 테스트
    describe('boundary values (UT-012)', () => {
      beforeEach(() => {
        mockPrisma.menu.findUnique.mockReset()
        mockPrisma.menu.create.mockReset()
      })

      it('should accept sortOrder = 0', async () => {
        const createDto = {
          code: 'SORT_ZERO',
          name: '정렬 0',
          sortOrder: 0,
        }

        mockPrisma.menu.findUnique.mockResolvedValue(null)
        mockPrisma.menu.create.mockResolvedValue({
          id: 1,
          code: 'SORT_ZERO',
          name: '정렬 0',
          sortOrder: 0,
          path: null,
          icon: null,
          parentId: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const result = await menuService.create(createDto)
        expect(result.sortOrder).toBe(0)
      })

      it('should accept code with max length (50 chars)', async () => {
        const code50 = 'A'.repeat(50)
        const createDto = {
          code: code50,
          name: '최대 길이 코드',
        }

        mockPrisma.menu.findUnique.mockResolvedValue(null)
        mockPrisma.menu.create.mockResolvedValue({
          id: 1,
          code: code50,
          name: '최대 길이 코드',
          path: null,
          icon: null,
          parentId: null,
          sortOrder: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const result = await menuService.create(createDto)
        expect(result.code.length).toBe(50)
      })

      it('should reject code exceeding max length', async () => {
        const createDto = {
          code: 'A'.repeat(51),
          name: '초과 길이 코드',
        }

        await expect(menuService.create(createDto)).rejects.toThrow(MenuServiceError)
      })

      it('should accept exactly 3-level menu', async () => {
        const createDto = {
          code: 'LEVEL3',
          name: '3단계 메뉴',
          parentId: 2, // 2단계 메뉴를 부모로
        }

        mockPrisma.menu.findUnique
          .mockResolvedValueOnce(null) // 코드 중복 체크
          .mockResolvedValueOnce({ parentId: 1 }) // 부모(2단계)의 parentId
          .mockResolvedValueOnce({ parentId: null }) // 1단계의 parentId

        mockPrisma.menu.create.mockResolvedValue({
          id: 3,
          ...createDto,
          path: null,
          icon: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const result = await menuService.create(createDto)
        expect(result.id).toBe(3)
      })
    })
  })

  describe('update', () => {
    // UT-010: 순환 참조 거부
    it('should throw BadRequestException for circular reference (UT-010)', async () => {
      const updateDto = {
        parentId: 2, // 자식 메뉴를 부모로 지정
      }

      mockPrisma.menu.findUnique
        .mockResolvedValueOnce({
          id: 1,
          code: 'PARENT',
          name: '부모 메뉴',
          path: null,
          icon: null,
          parentId: null,
          sortOrder: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }) // 대상 메뉴
        .mockResolvedValueOnce({ parentId: 1 }) // 자식(2)의 부모는 1

      try {
        await menuService.update(1, updateDto)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(MenuServiceError)
        expect((error as MenuServiceError).code).toBe(MenuErrorCode.CIRCULAR_REFERENCE)
      }
    })

    it('should throw BadRequestException for self-reference', async () => {
      const updateDto = {
        parentId: 1, // 자기 자신을 부모로 지정
      }

      mockPrisma.menu.findUnique.mockResolvedValueOnce({
        id: 1,
        code: 'SELF_REF',
        name: '자기 참조',
        path: null,
        icon: null,
        parentId: null,
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      try {
        await menuService.update(1, updateDto)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(MenuServiceError)
        expect((error as MenuServiceError).code).toBe(MenuErrorCode.CIRCULAR_REFERENCE)
      }
    })

    it('should throw if menu not found', async () => {
      mockPrisma.menu.findUnique.mockResolvedValue(null)

      await expect(menuService.update(999, { name: '새 이름' })).rejects.toThrow(
        MenuServiceError
      )
      await expect(menuService.update(999, { name: '새 이름' })).rejects.toMatchObject({
        code: MenuErrorCode.MENU_NOT_FOUND,
      })
    })
  })

  describe('delete', () => {
    // UT-008: 자식 있는 메뉴 삭제 거부
    it('should throw BadRequestException when menu has children (UT-008)', async () => {
      mockPrisma.menu.findUnique.mockResolvedValue({
        id: 1,
        code: 'PARENT',
        name: '부모 메뉴',
        path: null,
        icon: null,
        parentId: null,
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockPrisma.menu.count.mockResolvedValue(2) // 자식 메뉴 2개 존재

      await expect(menuService.delete(1)).rejects.toThrow(MenuServiceError)
      await expect(menuService.delete(1)).rejects.toMatchObject({
        code: MenuErrorCode.HAS_CHILDREN,
      })
    })

    it('should delete menu without children', async () => {
      const menuToDelete: Menu = {
        id: 1,
        code: 'LEAF',
        name: '리프 메뉴',
        path: '/portal/leaf',
        icon: null,
        parentId: 10,
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.menu.findUnique.mockResolvedValue(menuToDelete)
      mockPrisma.menu.count.mockResolvedValue(0) // 자식 메뉴 없음
      mockPrisma.menu.delete.mockResolvedValue(menuToDelete)

      const result = await menuService.delete(1)

      expect(result.id).toBe(1)
      expect(mockPrisma.menu.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('should throw if menu not found', async () => {
      mockPrisma.menu.findUnique.mockResolvedValue(null)

      await expect(menuService.delete(999)).rejects.toThrow(MenuServiceError)
      await expect(menuService.delete(999)).rejects.toMatchObject({
        code: MenuErrorCode.MENU_NOT_FOUND,
      })
    })
  })

  describe('findById', () => {
    it('should return menu by id', async () => {
      const mockMenu: Menu = {
        id: 1,
        code: 'DASHBOARD',
        name: '대시보드',
        path: null,
        icon: 'DashboardOutlined',
        parentId: null,
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.menu.findUnique.mockResolvedValue(mockMenu)

      const result = await menuService.findById(1)

      expect(result).not.toBeNull()
      expect(result?.id).toBe(1)
      expect(result?.code).toBe('DASHBOARD')
    })

    it('should return null for non-existent menu', async () => {
      mockPrisma.menu.findUnique.mockResolvedValue(null)

      const result = await menuService.findById(999)

      expect(result).toBeNull()
    })
  })

  // TSK-03-02: 역할 기반 메뉴 조회 테스트
  describe('findByRole (TSK-03-02)', () => {
    // UT-001: OPERATOR 역할 메뉴 조회
    it('should return mapped menus for OPERATOR role (UT-001)', async () => {
      // Arrange
      const operatorRoleId = 3
      mockPrisma.roleMenu.findMany.mockResolvedValue([
        { menuId: 1 }, // DASHBOARD
        { menuId: 11 }, // WORK_ORDER
        { menuId: 13 }, // PRODUCTION_ENTRY
      ])
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 1, code: 'DASHBOARD', name: '대시보드', parentId: null, sortOrder: 1, isActive: true, path: null, icon: 'DashboardOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 10, code: 'PRODUCTION', name: '생산 관리', parentId: null, sortOrder: 2, isActive: true, path: null, icon: 'ToolOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 11, code: 'WORK_ORDER', name: '작업 지시', parentId: 10, sortOrder: 1, isActive: true, path: '/portal/production/work-order', icon: 'FileTextOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 12, code: 'PRODUCTION_RESULT', name: '실적 관리', parentId: 10, sortOrder: 2, isActive: true, path: null, icon: 'FolderOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 13, code: 'PRODUCTION_ENTRY', name: '생산 실적 입력', parentId: 12, sortOrder: 1, isActive: true, path: '/portal/production/result/entry', icon: 'EditOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 90, code: 'SYSTEM', name: '시스템 관리', parentId: null, sortOrder: 9, isActive: true, path: null, icon: 'SettingOutlined', createdAt: new Date(), updatedAt: new Date() },
      ])

      // Act
      const result = await menuService.findByRole(operatorRoleId)

      // Assert
      // 결과에 DASHBOARD, PRODUCTION(부모), WORK_ORDER, PRODUCTION_RESULT(부모), PRODUCTION_ENTRY가 있어야 함
      const allCodes = extractAllCodes(result)
      expect(allCodes).toContain('DASHBOARD')
      expect(allCodes).toContain('PRODUCTION') // 부모 자동 포함 (BR-02)
      expect(allCodes).toContain('WORK_ORDER')
      expect(allCodes).toContain('PRODUCTION_RESULT') // 부모 자동 포함 (BR-02)
      expect(allCodes).toContain('PRODUCTION_ENTRY')
      expect(allCodes).not.toContain('SYSTEM') // 시스템 관리 미포함
    })

    // UT-002: MANAGER 역할 메뉴 조회
    it('should return mapped menus for MANAGER role (UT-002)', async () => {
      // Arrange
      const managerRoleId = 2
      mockPrisma.roleMenu.findMany.mockResolvedValue([
        { menuId: 1 }, // DASHBOARD
        { menuId: 10 }, // PRODUCTION
        { menuId: 11 }, // WORK_ORDER
        { menuId: 12 }, // PRODUCTION_RESULT
        { menuId: 13 }, // PRODUCTION_ENTRY
        { menuId: 14 }, // PRODUCTION_HISTORY
      ])
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 1, code: 'DASHBOARD', name: '대시보드', parentId: null, sortOrder: 1, isActive: true, path: null, icon: 'DashboardOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 10, code: 'PRODUCTION', name: '생산 관리', parentId: null, sortOrder: 2, isActive: true, path: null, icon: 'ToolOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 11, code: 'WORK_ORDER', name: '작업 지시', parentId: 10, sortOrder: 1, isActive: true, path: '/portal/production/work-order', icon: 'FileTextOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 12, code: 'PRODUCTION_RESULT', name: '실적 관리', parentId: 10, sortOrder: 2, isActive: true, path: null, icon: 'FolderOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 13, code: 'PRODUCTION_ENTRY', name: '생산 실적 입력', parentId: 12, sortOrder: 1, isActive: true, path: '/portal/production/result/entry', icon: 'EditOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 14, code: 'PRODUCTION_HISTORY', name: '생산 이력 조회', parentId: 12, sortOrder: 2, isActive: true, path: '/portal/production/result/history', icon: 'HistoryOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 90, code: 'SYSTEM', name: '시스템 관리', parentId: null, sortOrder: 9, isActive: true, path: null, icon: 'SettingOutlined', createdAt: new Date(), updatedAt: new Date() },
      ])

      // Act
      const result = await menuService.findByRole(managerRoleId)

      // Assert
      const allCodes = extractAllCodes(result)
      expect(allCodes).toContain('DASHBOARD')
      expect(allCodes).toContain('PRODUCTION')
      expect(allCodes).toContain('WORK_ORDER')
      expect(allCodes).toContain('PRODUCTION_RESULT')
      expect(allCodes).toContain('PRODUCTION_ENTRY')
      expect(allCodes).toContain('PRODUCTION_HISTORY')
      expect(allCodes).not.toContain('SYSTEM') // 시스템 관리 미포함
    })

    // UT-003: 자식만 권한 시 부모 포함 (BR-02)
    it('should include parent menu when child has permission (UT-003)', async () => {
      // Arrange
      const roleId = 3
      mockPrisma.roleMenu.findMany.mockResolvedValue([
        { menuId: 11 }, // WORK_ORDER만 권한
      ])
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 10, code: 'PRODUCTION', name: '생산 관리', parentId: null, sortOrder: 2, isActive: true, path: null, icon: 'ToolOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 11, code: 'WORK_ORDER', name: '작업 지시', parentId: 10, sortOrder: 1, isActive: true, path: '/portal/production/work-order', icon: 'FileTextOutlined', createdAt: new Date(), updatedAt: new Date() },
      ])

      // Act
      const result = await menuService.findByRole(roleId)

      // Assert
      expect(result).toHaveLength(1) // 최상위 메뉴 1개 (PRODUCTION)
      expect(result[0].code).toBe('PRODUCTION')
      expect(result[0].children).toHaveLength(1) // 자식 1개 (WORK_ORDER)
      expect(result[0].children[0].code).toBe('WORK_ORDER')
    })

    // UT-004: 메뉴 정렬 순서
    it('should return menus sorted by sortOrder (UT-004)', async () => {
      // Arrange
      const roleId = 2
      mockPrisma.roleMenu.findMany.mockResolvedValue([
        { menuId: 1 },
        { menuId: 10 },
      ])
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 10, code: 'PRODUCTION', name: '생산 관리', parentId: null, sortOrder: 2, isActive: true, path: null, icon: 'ToolOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 1, code: 'DASHBOARD', name: '대시보드', parentId: null, sortOrder: 1, isActive: true, path: null, icon: 'DashboardOutlined', createdAt: new Date(), updatedAt: new Date() },
      ])

      // Act
      const result = await menuService.findByRole(roleId)

      // Assert
      expect(result[0].sortOrder).toBeLessThan(result[1].sortOrder)
      expect(result[0].code).toBe('DASHBOARD')
      expect(result[1].code).toBe('PRODUCTION')
    })

    // UT-005: ADMIN 역할 전체 메뉴 조회 (BR-03)
    it('should return all active menus for ADMIN role (UT-005)', async () => {
      // Arrange
      const adminRoleId = 1 // SYSTEM_ADMIN_ROLE_ID
      const allActiveMenus = [
        { id: 1, code: 'DASHBOARD', name: '대시보드', parentId: null, sortOrder: 1, isActive: true, path: null, icon: 'DashboardOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 10, code: 'PRODUCTION', name: '생산 관리', parentId: null, sortOrder: 2, isActive: true, path: null, icon: 'ToolOutlined', createdAt: new Date(), updatedAt: new Date() },
        { id: 90, code: 'SYSTEM', name: '시스템 관리', parentId: null, sortOrder: 9, isActive: true, path: null, icon: 'SettingOutlined', createdAt: new Date(), updatedAt: new Date() },
      ]
      mockPrisma.menu.findMany.mockResolvedValue(allActiveMenus)

      // Act
      const result = await menuService.findByRole(adminRoleId)

      // Assert
      const allCodes = extractAllCodes(result)
      expect(allCodes).toContain('DASHBOARD')
      expect(allCodes).toContain('PRODUCTION')
      expect(allCodes).toContain('SYSTEM') // ADMIN은 시스템 관리도 포함
      expect(mockPrisma.roleMenu.findMany).not.toHaveBeenCalled() // RoleMenu 조회 안 함
    })

    // 역할에 매핑된 메뉴가 없는 경우
    it('should return empty array when no menus are mapped to role', async () => {
      // Arrange
      const roleId = 99
      mockPrisma.roleMenu.findMany.mockResolvedValue([])

      // Act
      const result = await menuService.findByRole(roleId)

      // Assert
      expect(result).toEqual([])
    })
  })
})

/**
 * 메뉴 트리에서 모든 코드를 추출하는 헬퍼 함수
 */
function extractAllCodes(menus: { code: string; children: any[] }[]): string[] {
  const codes: string[] = []
  for (const menu of menus) {
    codes.push(menu.code)
    if (menu.children && menu.children.length > 0) {
      codes.push(...extractAllCodes(menu.children))
    }
  }
  return codes
}
