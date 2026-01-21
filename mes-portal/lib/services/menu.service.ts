/**
 * MenuService - 메뉴 데이터 서비스 (TSK-03-01, TSK-03-02)
 *
 * 비즈니스 규칙:
 * - BR-001: 메뉴 코드 유일성
 * - BR-002: 계층 깊이 제한 (최대 3단계)
 * - BR-003: 비활성 메뉴 필터링
 * - BR-004: sortOrder 정렬
 * - BR-005: 순환 참조 금지
 * - BR-006: 자식 메뉴 삭제 보호
 *
 * TSK-03-02 비즈니스 규칙:
 * - BR-01: 역할 기반 메뉴 필터링
 * - BR-02: 자식 → 부모 자동 표시
 * - BR-03: ADMIN 역할 전체 메뉴 접근
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
  MAX_DEPTH: 3,
}

/**
 * 시스템 관리자 역할 ID (TSK-03-02 BR-03)
 * - 시드 데이터에서 ADMIN은 항상 ID=1로 생성
 */
const SYSTEM_ADMIN_ROLE_ID = 1

/**
 * MenuService 클래스
 */
export class MenuService {
  /**
   * 계층형 메뉴 목록 조회 (GET /api/menus)
   * - 활성화된 메뉴만 반환
   * - sortOrder 오름차순 정렬
   * - 계층형 트리 구조로 변환
   */
  async findAll(): Promise<MenuItem[]> {
    const menus = await prisma.menu.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return this.buildMenuTree(menus)
  }

  /**
   * 역할별 메뉴 조회 (TSK-03-02)
   * - BR-01: 역할에 매핑된 메뉴만 반환
   * - BR-02: 자식 권한 시 부모 메뉴 자동 포함
   * - BR-03: ADMIN 역할은 모든 메뉴 반환
   */
  async findByRole(roleId: number): Promise<MenuItem[]> {
    // BR-03: ADMIN 역할은 모든 메뉴 반환
    if (roleId === SYSTEM_ADMIN_ROLE_ID) {
      return this.findAll()
    }

    // BR-01: 역할에 매핑된 메뉴 ID 조회
    const roleMenus = await prisma.roleMenu.findMany({
      where: { roleId },
      select: { menuId: true },
    })
    const allowedMenuIds = roleMenus.map((rm) => rm.menuId)

    if (allowedMenuIds.length === 0) {
      return []
    }

    // 모든 활성 메뉴 조회 (부모 추론을 위해)
    const allMenus = await prisma.menu.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    // BR-02: 자식 권한 시 부모 메뉴 자동 포함
    const expandedMenuIds = this.expandParentMenuIds(allMenus, allowedMenuIds)

    // 허용된 메뉴만 필터링
    const filteredMenus = allMenus.filter((menu) => expandedMenuIds.has(menu.id))

    return this.buildMenuTree(filteredMenus)
  }

  /**
   * BR-02: 자식 메뉴 권한이 있으면 부모 메뉴도 포함
   */
  private expandParentMenuIds(allMenus: Menu[], allowedMenuIds: number[]): Set<number> {
    const expandedSet = new Set(allowedMenuIds)
    const menuById = new Map(allMenus.map((m) => [m.id, m]))

    for (const menuId of allowedMenuIds) {
      let currentMenu = menuById.get(menuId)
      while (currentMenu?.parentId) {
        expandedSet.add(currentMenu.parentId)
        currentMenu = menuById.get(currentMenu.parentId)
      }
    }

    return expandedSet
  }

  /**
   * 메뉴 생성
   * - 코드 중복 검증 (BR-001)
   * - 계층 깊이 검증 (BR-002)
   * - 입력 검증
   */
  async create(dto: CreateMenuDto): Promise<Menu> {
    this.validateCreateInput(dto)

    // 중복 코드 검증 (BR-001)
    const existingMenu = await prisma.menu.findUnique({
      where: { code: dto.code },
    })
    if (existingMenu) {
      throw new MenuServiceError(
        MenuErrorCode.DUPLICATE_MENU_CODE,
        '이미 존재하는 메뉴 코드입니다',
        409
      )
    }

    // 계층 깊이 검증 (BR-002)
    if (dto.parentId) {
      await this.validateMenuDepth(dto.parentId)
    }

    return prisma.menu.create({
      data: {
        code: dto.code,
        name: dto.name,
        path: dto.path ?? null,
        icon: dto.icon ?? null,
        parentId: dto.parentId ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    })
  }

  /**
   * 메뉴 수정
   * - 순환 참조 검증 (BR-005)
   * - 코드 중복 검증 (BR-001)
   */
  async update(id: number, dto: UpdateMenuDto): Promise<Menu> {
    this.validateUpdateInput(dto)

    const menu = await prisma.menu.findUnique({ where: { id } })
    if (!menu) {
      throw new MenuServiceError(
        MenuErrorCode.MENU_NOT_FOUND,
        '메뉴를 찾을 수 없습니다',
        404
      )
    }

    // 코드 중복 검증 (다른 메뉴와 중복 시)
    if (dto.code && dto.code !== menu.code) {
      const existingMenu = await prisma.menu.findUnique({
        where: { code: dto.code },
      })
      if (existingMenu) {
        throw new MenuServiceError(
          MenuErrorCode.DUPLICATE_MENU_CODE,
          '이미 존재하는 메뉴 코드입니다',
          409
        )
      }
    }

    // 순환 참조 검증 (BR-005)
    if (dto.parentId !== undefined) {
      await this.validateNoCircularReference(id, dto.parentId)
      if (dto.parentId !== null) {
        await this.validateMenuDepth(dto.parentId)
      }
    }

    return prisma.menu.update({
      where: { id },
      data: dto,
    })
  }

  /**
   * 메뉴 삭제
   * - 자식 메뉴 존재 검증 (BR-006)
   */
  async delete(id: number): Promise<Menu> {
    const menu = await prisma.menu.findUnique({ where: { id } })
    if (!menu) {
      throw new MenuServiceError(
        MenuErrorCode.MENU_NOT_FOUND,
        '메뉴를 찾을 수 없습니다',
        404
      )
    }

    // 자식 메뉴 존재 검증 (BR-006)
    await this.validateNoChildren(id)

    return prisma.menu.delete({ where: { id } })
  }

  /**
   * 단일 메뉴 조회
   */
  async findById(id: number): Promise<Menu | null> {
    return prisma.menu.findUnique({ where: { id } })
  }

  /**
   * flat 메뉴 데이터를 계층형 트리로 변환
   */
  private buildMenuTree(menus: Menu[]): MenuItem[] {
    const menuMap = new Map<number, MenuItem>()
    const rootMenus: MenuItem[] = []

    // 모든 메뉴를 MenuItem으로 변환하고 Map에 저장
    for (const menu of menus) {
      menuMap.set(menu.id, {
        id: menu.id,
        code: menu.code,
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        sortOrder: menu.sortOrder,
        children: [],
      })
    }

    // 부모-자식 관계 설정
    for (const menu of menus) {
      const menuItem = menuMap.get(menu.id)!
      if (menu.parentId === null) {
        rootMenus.push(menuItem)
      } else {
        const parent = menuMap.get(menu.parentId)
        if (parent) {
          parent.children.push(menuItem)
        }
      }
    }

    // 각 레벨에서 sortOrder로 정렬
    this.sortMenuTree(rootMenus)

    return rootMenus
  }

  /**
   * 메뉴 트리의 각 레벨을 sortOrder로 정렬
   */
  private sortMenuTree(menus: MenuItem[]): void {
    menus.sort((a, b) => a.sortOrder - b.sortOrder)
    for (const menu of menus) {
      if (menu.children.length > 0) {
        this.sortMenuTree(menu.children)
      }
    }
  }

  /**
   * 계층 깊이 검증 (BR-002)
   * 최대 3단계까지 허용
   */
  private async validateMenuDepth(parentId: number): Promise<void> {
    let depth = 1
    let currentId: number | null = parentId

    while (currentId !== null) {
      depth++
      if (depth > ValidationRules.MAX_DEPTH) {
        throw new MenuServiceError(
          MenuErrorCode.MAX_DEPTH_EXCEEDED,
          '메뉴 계층은 최대 3단계까지 허용됩니다',
          400
        )
      }
      const parentMenu: { parentId: number | null } | null = await prisma.menu.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      })
      currentId = parentMenu?.parentId ?? null
    }
  }

  /**
   * 순환 참조 검증 (BR-005)
   */
  private async validateNoCircularReference(
    menuId: number,
    newParentId: number | null
  ): Promise<void> {
    if (newParentId === null) return

    if (menuId === newParentId) {
      throw new MenuServiceError(
        MenuErrorCode.CIRCULAR_REFERENCE,
        '자기 자신을 부모로 지정할 수 없습니다',
        400
      )
    }

    let currentId: number | null = newParentId
    while (currentId !== null) {
      if (currentId === menuId) {
        throw new MenuServiceError(
          MenuErrorCode.CIRCULAR_REFERENCE,
          '순환 참조: 자식 메뉴를 부모로 지정할 수 없습니다',
          400
        )
      }
      const currentMenu: { parentId: number | null } | null = await prisma.menu.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      })
      currentId = currentMenu?.parentId ?? null
    }
  }

  /**
   * 자식 메뉴 존재 검증 (BR-006)
   */
  private async validateNoChildren(menuId: number): Promise<void> {
    const childCount = await prisma.menu.count({
      where: { parentId: menuId },
    })
    if (childCount > 0) {
      throw new MenuServiceError(
        MenuErrorCode.HAS_CHILDREN,
        '하위 메뉴가 있어 삭제할 수 없습니다',
        400
      )
    }
  }

  /**
   * 생성 입력 검증
   */
  private validateCreateInput(dto: CreateMenuDto): void {
    // code 검증
    if (!dto.code || !ValidationRules.CODE_PATTERN.test(dto.code)) {
      throw new MenuServiceError(
        MenuErrorCode.VALIDATION_ERROR,
        '유효하지 않은 메뉴 코드 형식입니다. 대문자 영문, 숫자, 언더스코어만 허용됩니다.',
        400
      )
    }
    if (dto.code.length > ValidationRules.CODE_MAX_LENGTH) {
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

    // sortOrder 검증 (선택적)
    if (dto.sortOrder !== undefined && dto.sortOrder < 0) {
      throw new MenuServiceError(
        MenuErrorCode.VALIDATION_ERROR,
        '정렬 순서는 0 이상이어야 합니다',
        400
      )
    }
  }

  /**
   * 수정 입력 검증
   */
  private validateUpdateInput(dto: UpdateMenuDto): void {
    if (dto.code !== undefined) {
      if (!ValidationRules.CODE_PATTERN.test(dto.code)) {
        throw new MenuServiceError(
          MenuErrorCode.VALIDATION_ERROR,
          '유효하지 않은 메뉴 코드 형식입니다',
          400
        )
      }
      if (dto.code.length > ValidationRules.CODE_MAX_LENGTH) {
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

    if (dto.sortOrder !== undefined && dto.sortOrder < 0) {
      throw new MenuServiceError(
        MenuErrorCode.VALIDATION_ERROR,
        '정렬 순서는 0 이상이어야 합니다',
        400
      )
    }
  }
}

// 싱글톤 인스턴스 export
export const menuService = new MenuService()
