/**
 * 메뉴 시뮬레이션 유틸리티
 *
 * 역할그룹 기반으로 접근 가능한 메뉴 트리를 생성합니다.
 * TSK-03-01: 사용자 메뉴 시뮬레이션 API
 */

import { includeParentMenus, filterMenuTree, buildMenuTree } from './menu-filter'
import type { MenuItem } from './menu-filter'

export interface MenuTreeNode {
  key: string
  title: string
  icon?: string
  path?: string
  children?: MenuTreeNode[]
}

export interface MenuTreeResponse {
  menus: MenuTreeNode[]
  summary: {
    totalMenus: number
    totalCategories: number
  }
}

interface RoleGroupPermissionData {
  roleGroupRoles: {
    role: {
      rolePermissions: {
        permission: {
          menuId: number | null
          config: string
        }
      }[]
    }
  }[]
}

/**
 * 역할그룹 데이터에서 허용된 메뉴 ID를 수집합니다.
 */
export function collectMenuIdsFromRoleGroups(
  roleGroups: RoleGroupPermissionData[]
): Set<number> {
  const menuIds = new Set<number>()

  roleGroups.forEach((rg) => {
    rg.roleGroupRoles.forEach((rgr) => {
      rgr.role.rolePermissions.forEach((rp) => {
        if (rp.permission.menuId) {
          menuIds.add(rp.permission.menuId)
        }
      })
    })
  })

  return menuIds
}

/**
 * MenuItem을 MenuTreeNode로 변환합니다.
 */
function toTreeNode(item: MenuItem): MenuTreeNode {
  const node: MenuTreeNode = {
    key: String(item.menuId),
    title: item.name,
  }
  if (item.icon) node.icon = item.icon
  if (item.path) node.path = item.path
  if (item.children.length > 0) {
    node.children = item.children.map(toTreeNode)
  }
  return node
}

/**
 * 메뉴 시뮬레이션용 트리를 빌드합니다.
 *
 * @param allMenus - 전체 활성 메뉴 배열 (flat)
 * @param allowedMenuIds - 허용된 메뉴 ID 집합
 * @returns 메뉴 트리와 요약 정보
 */
export function buildMenuTreeForSimulation(
  allMenus: MenuItem[],
  allowedMenuIds: Set<number>
): MenuTreeResponse {
  if (allowedMenuIds.size === 0) {
    return { menus: [], summary: { totalMenus: 0, totalCategories: 0 } }
  }

  // 부모 카테고리 메뉴 자동 포함
  const withParents = includeParentMenus(allowedMenuIds, allMenus)
  const filtered = filterMenuTree(allMenus, withParents)
  const tree = buildMenuTree(filtered)
  const treeNodes = tree.map(toTreeNode)

  // summary 계산: 리프 메뉴 수(path가 있는 메뉴)와 루트 카테고리 수
  const totalMenus = filtered.filter((m) => m.path !== null).length
  const totalCategories = tree.length

  return {
    menus: treeNodes,
    summary: { totalMenus, totalCategories },
  }
}
