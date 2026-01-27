/**
 * MenuService - 메뉴 데이터 서비스
 *
 * RBAC 리디자인: category path 기반 트리 구조
 * - parentId 기반 트리 제거, category 문자열(예: "조업관리/생산실적")로 트리 구축
 * - sortOrder는 String 타입 (varchar 정렬, 중간 삽입 용이)
 * - systemId 필수
 * - RoleMenu 제거 -> MenuSet 기반 메뉴 접근
 *
 * 비즈니스 규칙:
 * - BR-001: 메뉴 코드(menuCd) 유일성
 * - BR-003: 비활성 메뉴 필터링
 * - BR-004: sortOrder 정렬
 */

import prisma from '@/lib/prisma'
import type { Menu } from '@/lib/generated/prisma/client'
import type {
  MenuItem,
  CreateMenuDto,
  UpdateMenuDto,
  MenuErrorCodeType,
} from '@/lib/types/menu'
import {
  ALLOWED_ICONS,
  MenuErrorCode,
} from '@/lib/types/menu'

/**
 * 커스텀 에러 클래스
 */
export class MenuServiceError extends Error {
  constructor(
    public code: MenuErrorCodeType,
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'MenuServiceError'
  }
}

/**
 * 입력 검증 규칙
 */
const ValidationRules = {
  CODE_PATTERN: /^[A-Z][A-Z0-9_]*$/,
  CODE_MAX_LENGTH: 50,
  NAME_MAX_LENGTH: 50,
  NAME_FORBIDDEN_CHARS: /[<>&]/,
  PATH_PATTERN: /^\/portal\/[a-z0-9\-\/]+$/,
  PATH_FORBIDDEN: /^(javascript:|\/\/|\.\.)/,
  CATEGORY_MAX_LENGTH: 200,
}

/**
 * MenuService 클래스
 */
export class MenuService {
  /**
   * 계층형 메뉴 목록 조회 (GET /api/menus)
   * - 활성화된 메뉴만 반환
   * - sortOrder 오름차순 정렬
   * - category path 기반 트리 구조로 변환
   */
  async findAll(systemId?: string): Promise<MenuItem[]> {
    const where: { isActive: boolean; systemId?: string } = { isActive: true }
    if (systemId) {
      where.systemId = systemId
    }

    const menus = await prisma.menu.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    return this.buildCategoryTree(menus)
  }

  /**
   * MenuSet 기반 메뉴 조회
   * - 사용자에게 할당된 MenuSet의 메뉴만 반환
   */
  async findByMenuSet(menuSetId: number): Promise<MenuItem[]> {
    const menuSetMenus = await prisma.menuSetMenu.findMany({
      where: { menuSetId },
      include: { menu: true },
    })

    const activeMenus = menuSetMenus
      .map((msm) => msm.menu)
      .filter((menu) => menu.isActive)

    return this.buildCategoryTree(activeMenus)
  }

  /**
   * 사용자별 메뉴 조회
   * - UserSystemMenuSet을 통해 사용자에게 할당된 메뉴 반환
   */
  async findByUser(userId: string, systemId: string): Promise<MenuItem[]> {
    const userMenuSet = await prisma.userSystemMenuSet.findUnique({
      where: {
        userId_systemId: { userId, systemId },
      },
      include: {
        menuSet: {
          include: {
            menuSetMenus: {
              include: { menu: true },
            },
          },
        },
      },
    })

    if (!userMenuSet) {
      return []
    }

    const activeMenus = userMenuSet.menuSet.menuSetMenus
      .map((msm) => msm.menu)
      .filter((menu) => menu.isActive)

    return this.buildCategoryTree(activeMenus)
  }

  /**
   * 메뉴 생성
   * - 코드 중복 검증 (BR-001)
   * - 입력 검증
   */
  async create(dto: CreateMenuDto): Promise<Menu> {
    this.validateCreateInput(dto)

    // 중복 코드 검증 (BR-001)
    const existingMenu = await prisma.menu.findUnique({
      where: { menuCd: dto.menuCd },
    })
    if (existingMenu) {
      throw new MenuServiceError(
        MenuErrorCode.DUPLICATE_MENU_CODE,
        '이미 존재하는 메뉴 코드입니다',
        409
      )
    }

    return prisma.menu.create({
      data: {
        menuCd: dto.menuCd,
        name: dto.name,
        systemId: dto.systemId,
        category: dto.category,
        path: dto.path ?? null,
        icon: dto.icon ?? null,
        sortOrder: dto.sortOrder ?? '100',
        isActive: dto.isActive ?? true,
      },
    })
  }

  /**
   * 메뉴 수정
   * - 코드 중복 검증 (BR-001)
   */
  async update(menuId: number, dto: UpdateMenuDto): Promise<Menu> {
    this.validateUpdateInput(dto)

    const menu = await prisma.menu.findUnique({ where: { menuId } })
    if (!menu) {
      throw new MenuServiceError(
        MenuErrorCode.MENU_NOT_FOUND,
        '메뉴를 찾을 수 없습니다',
        404
      )
    }

    // 코드 중복 검증 (다른 메뉴와 중복 시)
    if (dto.menuCd && dto.menuCd !== menu.menuCd) {
      const existingMenu = await prisma.menu.findUnique({
        where: { menuCd: dto.menuCd },
      })
      if (existingMenu) {
        throw new MenuServiceError(
          MenuErrorCode.DUPLICATE_MENU_CODE,
          '이미 존재하는 메뉴 코드입니다',
          409
        )
      }
    }

    return prisma.menu.update({
      where: { menuId },
      data: dto,
    })
  }

  /**
   * 메뉴 삭제
   */
  async delete(menuId: number): Promise<Menu> {
    const menu = await prisma.menu.findUnique({ where: { menuId } })
    if (!menu) {
      throw new MenuServiceError(
        MenuErrorCode.MENU_NOT_FOUND,
        '메뉴를 찾을 수 없습니다',
        404
      )
    }

    return prisma.menu.delete({ where: { menuId } })
  }

  /**
   * 단일 메뉴 조회
   */
  async findById(menuId: number): Promise<Menu | null> {
    return prisma.menu.findUnique({ where: { menuId } })
  }

  /**
   * category path 기반으로 계층형 트리 구축
   *
   * category 예시:
   * - "대시보드" -> 루트 메뉴
   * - "조업관리" -> 루트 카테고리
   * - "조업관리/생산실적" -> 조업관리 하위 메뉴
   * - "조업관리/생산실적/일일보고" -> 2단계 하위
   *
   * 카테고리 경로의 중간 노드에 해당하는 메뉴가 없으면
   * 가상 노드(menuId: -1)를 생성하여 트리를 완성
   */
  private buildCategoryTree(menus: Menu[]): MenuItem[] {
    const rootItems: MenuItem[] = []
    // category path -> MenuItem 매핑 (가상 노드 포함)
    const nodeMap = new Map<string, MenuItem>()

    // sortOrder 기준 정렬
    const sortedMenus = [...menus].sort((a, b) =>
      a.sortOrder.localeCompare(b.sortOrder)
    )

    for (const menu of sortedMenus) {
      const parts = menu.category.split('/')
      let currentPath = ''

      // 중간 카테고리 경로에 대한 가상 노드 보장
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i]
        if (!nodeMap.has(currentPath)) {
          const virtualNode: MenuItem = {
            menuId: -1,
            menuCd: `_VIRTUAL_${currentPath}`,
            name: parts[i],
            path: null,
            icon: null,
            sortOrder: '000',
            category: currentPath,
            systemId: menu.systemId,
            children: [],
          }
          nodeMap.set(currentPath, virtualNode)

          // 부모에 연결
          const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'))
          if (parentPath && nodeMap.has(parentPath)) {
            nodeMap.get(parentPath)!.children.push(virtualNode)
          } else if (!parentPath) {
            rootItems.push(virtualNode)
          }
        }
      }

      // 실제 메뉴 노드 생성
      const fullPath = menu.category
      const menuItem: MenuItem = {
        menuId: menu.menuId,
        menuCd: menu.menuCd,
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        sortOrder: menu.sortOrder,
        category: menu.category,
        systemId: menu.systemId,
        children: [],
      }

      // 이미 가상 노드가 있으면 실제 메뉴 정보로 교체 (children 유지)
      if (nodeMap.has(fullPath)) {
        const existing = nodeMap.get(fullPath)!
        menuItem.children = existing.children
        // 부모의 children에서 가상 노드를 실제 노드로 교체
        const parentPath = fullPath.substring(0, fullPath.lastIndexOf('/'))
        if (parentPath && nodeMap.has(parentPath)) {
          const parent = nodeMap.get(parentPath)!
          const idx = parent.children.indexOf(existing)
          if (idx >= 0) {
            parent.children[idx] = menuItem
          }
        } else if (!parentPath) {
          const idx = rootItems.indexOf(existing)
          if (idx >= 0) {
            rootItems[idx] = menuItem
          }
        }
      } else {
        // 부모에 연결
        const parentPath = fullPath.substring(0, fullPath.lastIndexOf('/'))
        if (parentPath && nodeMap.has(parentPath)) {
          nodeMap.get(parentPath)!.children.push(menuItem)
        } else if (!fullPath.includes('/')) {
          rootItems.push(menuItem)
        }
      }

      nodeMap.set(fullPath, menuItem)
    }

    // 각 레벨에서 sortOrder로 정렬
    this.sortMenuTree(rootItems)

    return rootItems
  }

  /**
   * 메뉴 트리의 각 레벨을 sortOrder로 정렬
   */
  private sortMenuTree(menus: MenuItem[]): void {
    menus.sort((a, b) => a.sortOrder.localeCompare(b.sortOrder))
    for (const menu of menus) {
      if (menu.children.length > 0) {
        this.sortMenuTree(menu.children)
      }
    }
  }

  /**
   * 생성 입력 검증
   */
  private validateCreateInput(dto: CreateMenuDto): void {
    // menuCd 검증
    if (!dto.menuCd || !ValidationRules.CODE_PATTERN.test(dto.menuCd)) {
      throw new MenuServiceError(
        MenuErrorCode.VALIDATION_ERROR,
        '유효하지 않은 메뉴 코드 형식입니다. 대문자 영문, 숫자, 언더스코어만 허용됩니다.',
        400
      )
    }
    if (dto.menuCd.length > ValidationRules.CODE_MAX_LENGTH) {
      throw new MenuServiceError(
        MenuErrorCode.VALIDATION_ERROR,
        `메뉴 코드는 ${ValidationRules.CODE_MAX_LENGTH}자 이하입니다`,
        400
      )
    }

    // name 검증
    if (!dto.name || dto.name.length === 0) {
      throw new MenuServiceError(
        MenuErrorCode.VALIDATION_ERROR,
        '메뉴 이름은 필수입니다',
        400
      )
    }
    if (dto.name.length > ValidationRules.NAME_MAX_LENGTH) {
      throw new MenuServiceError(
        MenuErrorCode.VALIDATION_ERROR,
        `메뉴 이름은 ${ValidationRules.NAME_MAX_LENGTH}자 이하입니다`,
        400
      )
    }
    if (ValidationRules.NAME_FORBIDDEN_CHARS.test(dto.name)) {
      throw new MenuServiceError(
        MenuErrorCode.VALIDATION_ERROR,
        '유효하지 않은 문자가 포함되어 있습니다',
        400
      )
    }

    // category 검증
    if (!dto.category || dto.category.length === 0) {
      throw new MenuServiceError(
        MenuErrorCode.VALIDATION_ERROR,
        '카테고리는 필수입니다',
        400
      )
    }
    if (dto.category.length > ValidationRules.CATEGORY_MAX_LENGTH) {
      throw new MenuServiceError(
        MenuErrorCode.VALIDATION_ERROR,
        `카테고리는 ${ValidationRules.CATEGORY_MAX_LENGTH}자 이하입니다`,
        400
      )
    }

    // systemId 검증
    if (!dto.systemId || dto.systemId.length === 0) {
      throw new MenuServiceError(
        MenuErrorCode.VALIDATION_ERROR,
        'systemId는 필수입니다',
        400
      )
    }

    // path 검증 (선택적)
    if (dto.path) {
      if (ValidationRules.PATH_FORBIDDEN.test(dto.path)) {
        throw new MenuServiceError(
          MenuErrorCode.VALIDATION_ERROR,
          '유효하지 않은 경로입니다',
          400
        )
      }
      if (!ValidationRules.PATH_PATTERN.test(dto.path)) {
        throw new MenuServiceError(
          MenuErrorCode.VALIDATION_ERROR,
          '경로는 /portal/로 시작해야 합니다',
          400
        )
      }
    }

    // icon 검증 (선택적)
    if (dto.icon && !ALLOWED_ICONS.includes(dto.icon as typeof ALLOWED_ICONS[number])) {
      throw new MenuServiceError(
        MenuErrorCode.VALIDATION_ERROR,
        '유효하지 않은 아이콘입니다',
        400
      )
    }
  }

  /**
   * 수정 입력 검증
   */
  private validateUpdateInput(dto: UpdateMenuDto): void {
    if (dto.menuCd !== undefined) {
      if (!ValidationRules.CODE_PATTERN.test(dto.menuCd)) {
        throw new MenuServiceError(
          MenuErrorCode.VALIDATION_ERROR,
          '유효하지 않은 메뉴 코드 형식입니다',
          400
        )
      }
      if (dto.menuCd.length > ValidationRules.CODE_MAX_LENGTH) {
        throw new MenuServiceError(
          MenuErrorCode.VALIDATION_ERROR,
          `메뉴 코드는 ${ValidationRules.CODE_MAX_LENGTH}자 이하입니다`,
          400
        )
      }
    }

    if (dto.name !== undefined) {
      if (dto.name.length === 0) {
        throw new MenuServiceError(
          MenuErrorCode.VALIDATION_ERROR,
          '메뉴 이름은 필수입니다',
          400
        )
      }
      if (dto.name.length > ValidationRules.NAME_MAX_LENGTH) {
        throw new MenuServiceError(
          MenuErrorCode.VALIDATION_ERROR,
          `메뉴 이름은 ${ValidationRules.NAME_MAX_LENGTH}자 이하입니다`,
          400
        )
      }
      if (ValidationRules.NAME_FORBIDDEN_CHARS.test(dto.name)) {
        throw new MenuServiceError(
          MenuErrorCode.VALIDATION_ERROR,
          '유효하지 않은 문자가 포함되어 있습니다',
          400
        )
      }
    }

    if (dto.category !== undefined) {
      if (dto.category.length === 0) {
        throw new MenuServiceError(
          MenuErrorCode.VALIDATION_ERROR,
          '카테고리는 필수입니다',
          400
        )
      }
      if (dto.category.length > ValidationRules.CATEGORY_MAX_LENGTH) {
        throw new MenuServiceError(
          MenuErrorCode.VALIDATION_ERROR,
          `카테고리는 ${ValidationRules.CATEGORY_MAX_LENGTH}자 이하입니다`,
          400
        )
      }
    }

    if (dto.path !== undefined && dto.path !== null) {
      if (ValidationRules.PATH_FORBIDDEN.test(dto.path)) {
        throw new MenuServiceError(
          MenuErrorCode.VALIDATION_ERROR,
          '유효하지 않은 경로입니다',
          400
        )
      }
      if (!ValidationRules.PATH_PATTERN.test(dto.path)) {
        throw new MenuServiceError(
          MenuErrorCode.VALIDATION_ERROR,
          '경로는 /portal/로 시작해야 합니다',
          400
        )
      }
    }

    if (dto.icon !== undefined && dto.icon !== null) {
      if (!ALLOWED_ICONS.includes(dto.icon as typeof ALLOWED_ICONS[number])) {
        throw new MenuServiceError(
          MenuErrorCode.VALIDATION_ERROR,
          '유효하지 않은 아이콘입니다',
          400
        )
      }
    }
  }
}

// 싱글톤 인스턴스 export
export const menuService = new MenuService()
