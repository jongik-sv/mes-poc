/**
 * 메뉴 필터링 유틸리티 (RBAC 재설계)
 *
 * category(path) 기반 트리 구축, Permission.menuId 기반 메뉴 접근 제어
 */

import prisma from '@/lib/prisma'

/**
 * 메뉴 아이템 인터페이스
 */
export interface MenuItem {
  menuId: number
  menuCd: string
  name: string
  path: string | null
  category: string
  sortOrder: string
  icon: string | null
  isActive: boolean
  children: MenuItem[]
}

/**
 * Permission config JSON 구조
 */
interface PermissionConfig {
  actions: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'IMPORT')[]
  fieldConstraints?: { [fieldName: string]: string | string[] }
}

/**
 * 허용된 메뉴 ID 집합으로 메뉴 필터링
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

  return menus.filter((menu) => allowedIds.has(menu.menuId))
}

/**
 * category 기반으로 부모 카테고리에 해당하는 메뉴도 포함
 *
 * 예: 허용된 메뉴의 category가 "조업관리/생산실적" 이면
 * category가 "조업관리"인 메뉴도 자동 포함
 *
 * @param allowedIds - 기존 허용된 메뉴 ID 집합
 * @param menus - 전체 메뉴 배열
 * @returns 부모 카테고리 메뉴가 추가된 허용 ID 집합
 */
export function includeParentMenus(
  allowedIds: Set<number>,
  menus: MenuItem[]
): Set<number> {
  const result = new Set(allowedIds)

  // category -> menuId 맵 생성
  const categoryToMenu = new Map<string, MenuItem>()
  menus.forEach((menu) => {
    categoryToMenu.set(menu.category, menu)
  })

  // 각 허용된 메뉴의 부모 카테고리 체인 추가
  allowedIds.forEach((menuId) => {
    const menu = menus.find((m) => m.menuId === menuId)
    if (!menu) return

    const parts = menu.category.split('/')
    // 부모 카테고리 순회 (예: "A/B/C" -> ["A", "A/B"])
    for (let i = 1; i < parts.length; i++) {
      const parentCategory = parts.slice(0, i).join('/')
      const parentMenu = categoryToMenu.get(parentCategory)
      if (parentMenu) {
        result.add(parentMenu.menuId)
      }
    }
  })

  return result
}

/**
 * 사용자 ID로 허용된 메뉴 목록 조회
 *
 * @param userId - 사용자 ID (사번)
 * @returns 허용된 메뉴 배열 (부모 메뉴 자동 포함)
 */
export async function getAuthorizedMenus(userId: string): Promise<MenuItem[]> {
  // 1. 사용자의 권한 조회 (Permission.menuId로 메뉴 접근 제어)
  const user = await prisma.user.findUnique({
    where: { userId },
    include: {
      userRoleGroups: {
        include: {
          roleGroup: {
            include: {
              roleGroupRoles: {
                include: {
                  role: {
                    include: {
                      rolePermissions: {
                        include: {
                          permission: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    return []
  }

  // 2. 허용된 메뉴 ID 수집 (Permission.menuId 기반)
  const allowedMenuIds = new Set<number>()
  let isSystemAdmin = false

  user.userRoleGroups.forEach((urg) => {
    urg.roleGroup.roleGroupRoles.forEach((rgr) => {
      if (rgr.role.roleCd === 'SYSTEM_ADMIN') {
        isSystemAdmin = true
      }
      rgr.role.rolePermissions.forEach((rp) => {
        if (rp.permission.menuId) {
          try {
            const config: PermissionConfig = JSON.parse(rp.permission.config)
            // READ 이상의 권한이 있는 경우에만 메뉴 접근 허용
            if (config.actions.length > 0) {
              allowedMenuIds.add(rp.permission.menuId)
            }
          } catch {
            // config 파싱 실패 시 menuId가 있으면 기본 허용
            allowedMenuIds.add(rp.permission.menuId)
          }
        }
      })
    })
  })

  // 3. 전체 메뉴 조회
  const allMenus = await prisma.menu.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  })

  // MenuItem 형식으로 변환
  const menuItems: MenuItem[] = allMenus.map((menu) => ({
    menuId: menu.menuId,
    menuCd: menu.menuCd,
    name: menu.name,
    path: menu.path,
    category: menu.category,
    sortOrder: menu.sortOrder,
    icon: menu.icon,
    isActive: menu.isActive,
    children: [],
  }))

  // SYSTEM_ADMIN은 모든 메뉴 접근 가능
  if (isSystemAdmin) {
    return menuItems
  }

  if (allowedMenuIds.size === 0) {
    return []
  }

  // 4. 부모 카테고리 메뉴 자동 포함
  const allowedWithParents = includeParentMenus(allowedMenuIds, menuItems)

  // 5. 필터링된 메뉴 반환
  return filterMenuTree(menuItems, allowedWithParents)
}

/**
 * 플랫 메뉴 배열을 category 기반 트리 구조로 변환
 *
 * category의 "/" 구분자로 부모-자식 관계를 결정
 * 예: "조업관리" -> "조업관리/생산실적" (부모-자식)
 *
 * @param menus - 플랫 메뉴 배열
 * @returns 트리 구조 메뉴 배열
 */
export function buildMenuTree(menus: MenuItem[]): MenuItem[] {
  const roots: MenuItem[] = []
  // category -> MenuItem 맵
  const categoryMap = new Map<string, MenuItem>()

  // sortOrder 기준 정렬
  const sorted = [...menus].sort((a, b) => a.sortOrder.localeCompare(b.sortOrder))

  sorted.forEach((menu) => {
    const item: MenuItem = { ...menu, children: [] }
    categoryMap.set(menu.category, item)

    // 부모 카테고리 찾기
    const lastSlash = menu.category.lastIndexOf('/')
    if (lastSlash > 0) {
      const parentCategory = menu.category.substring(0, lastSlash)
      const parent = categoryMap.get(parentCategory)
      if (parent) {
        parent.children.push(item)
        return
      }
    }

    roots.push(item)
  })

  return roots
}
