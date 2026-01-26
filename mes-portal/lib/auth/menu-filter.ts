/**
 * 메뉴 필터링 유틸리티 (TSK-03-02)
 *
 * 권한 기반 메뉴 필터링 및 부모 메뉴 자동 포함 (BR-03-05)
 */

import prisma from '@/lib/prisma'

/**
 * 메뉴 아이템 인터페이스
 */
export interface MenuItem {
  id: number
  code: string
  name: string
  path: string | null
  parentId: number | null
  sortOrder: number
  icon: string | null
  isActive: boolean
  children: MenuItem[]
}

/**
 * 허용된 메뉴 ID 집합으로 메뉴 트리 필터링
 *
 * @param menus - 전체 메뉴 배열 (flat)
 * @param allowedIds - 허용된 메뉴 ID 집합
 * @returns 필터링된 메뉴 배열
 */
export function filterMenuTree(
  menus: MenuItem[],
  allowedIds: Set<number>
): MenuItem[] {
  if (allowedIds.size === 0) {
    return []
  }

  return menus.filter((menu) => allowedIds.has(menu.id))
}

/**
 * 자식 메뉴가 허용되면 부모 메뉴도 포함 (BR-03-05)
 *
 * @param allowedIds - 기존 허용된 메뉴 ID 집합
 * @param menus - 전체 메뉴 배열
 * @returns 부모 메뉴가 추가된 허용 ID 집합
 */
export function includeParentMenus(
  allowedIds: Set<number>,
  menus: MenuItem[]
): Set<number> {
  const result = new Set(allowedIds)

  // 메뉴 ID -> 메뉴 맵 생성
  const menuMap = new Map<number, MenuItem>()
  menus.forEach((menu) => menuMap.set(menu.id, menu))

  // 각 허용된 메뉴의 부모 체인 추가
  allowedIds.forEach((menuId) => {
    let currentMenu = menuMap.get(menuId)
    while (currentMenu?.parentId) {
      result.add(currentMenu.parentId)
      currentMenu = menuMap.get(currentMenu.parentId)
    }
  })

  return result
}

/**
 * 사용자 ID로 허용된 메뉴 목록 조회
 *
 * @param userId - 사용자 ID
 * @returns 허용된 메뉴 배열 (부모 메뉴 자동 포함)
 */
export async function getAuthorizedMenus(userId: number): Promise<MenuItem[]> {
  // 1. 사용자의 역할과 메뉴 권한 조회
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              roleMenus: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    return []
  }

  // 2. 허용된 메뉴 ID 수집
  const allowedMenuIds = new Set<number>()
  user.userRoles.forEach((ur) => {
    ur.role.roleMenus.forEach((rm) => {
      allowedMenuIds.add(rm.menuId)
    })
  })

  if (allowedMenuIds.size === 0) {
    return []
  }

  // 3. 전체 메뉴 조회
  const allMenus = await prisma.menu.findMany({
    where: { isActive: true },
    orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
  })

  // MenuItem 형식으로 변환
  const menuItems: MenuItem[] = allMenus.map((menu) => ({
    id: menu.id,
    code: menu.code,
    name: menu.name,
    path: menu.path,
    parentId: menu.parentId,
    sortOrder: menu.sortOrder,
    icon: menu.icon,
    isActive: menu.isActive,
    children: [],
  }))

  // 4. 부모 메뉴 자동 포함 (BR-03-05)
  const allowedWithParents = includeParentMenus(allowedMenuIds, menuItems)

  // 5. 필터링된 메뉴 반환
  return filterMenuTree(menuItems, allowedWithParents)
}

/**
 * 플랫 메뉴 배열을 트리 구조로 변환
 *
 * @param menus - 플랫 메뉴 배열
 * @returns 트리 구조 메뉴 배열
 */
export function buildMenuTree(menus: MenuItem[]): MenuItem[] {
  const menuMap = new Map<number, MenuItem>()
  const roots: MenuItem[] = []

  // 1. 모든 메뉴를 맵에 저장
  menus.forEach((menu) => {
    menuMap.set(menu.id, { ...menu, children: [] })
  })

  // 2. 부모-자식 관계 설정
  menus.forEach((menu) => {
    const menuItem = menuMap.get(menu.id)!
    if (menu.parentId && menuMap.has(menu.parentId)) {
      const parent = menuMap.get(menu.parentId)!
      parent.children.push(menuItem)
    } else {
      roots.push(menuItem)
    }
  })

  return roots
}
