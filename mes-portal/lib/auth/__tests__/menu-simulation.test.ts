/**
 * TSK-03-01 메뉴 시뮬레이션 로직 단위 테스트
 */

import { describe, it, expect } from 'vitest'
import { buildMenuTreeForSimulation, collectMenuIdsFromRoleGroups } from '../menu-simulation'
import type { MenuItem } from '../menu-filter'

describe('menu-simulation', () => {
  describe('buildMenuTreeForSimulation', () => {
    it('플랫 메뉴 배열을 트리 구조로 변환한다 (FR-301)', () => {
      const menus: MenuItem[] = [
        { menuId: 1, menuCd: 'MENU_PROD', name: '생산관리', path: null, category: '생산관리', sortOrder: '10', icon: 'BuildOutlined', isActive: true, children: [] },
        { menuId: 2, menuCd: 'MENU_PROD_ORDER', name: '작업지시', path: '/production/order', category: '생산관리/작업지시', sortOrder: '11', icon: 'FileTextOutlined', isActive: true, children: [] },
        { menuId: 3, menuCd: 'MENU_PROD_STATUS', name: '생산현황', path: '/production/status', category: '생산관리/생산현황', sortOrder: '12', icon: 'LineChartOutlined', isActive: true, children: [] },
      ]
      const allowedIds = new Set([1, 2, 3])

      const result = buildMenuTreeForSimulation(menus, allowedIds)

      expect(result.menus).toHaveLength(1)
      expect(result.menus[0].title).toBe('생산관리')
      expect(result.menus[0].children).toHaveLength(2)
      expect(result.menus[0].children![0].title).toBe('작업지시')
      expect(result.menus[0].children![1].title).toBe('생산현황')
    })

    it('icon과 path 정보를 트리 노드에 포함한다 (FR-304)', () => {
      const menus: MenuItem[] = [
        { menuId: 1, menuCd: 'MENU_DASH', name: '대시보드', path: '/dashboard', category: '대시보드', sortOrder: '01', icon: 'DashboardOutlined', isActive: true, children: [] },
      ]
      const allowedIds = new Set([1])

      const result = buildMenuTreeForSimulation(menus, allowedIds)

      expect(result.menus[0].icon).toBe('DashboardOutlined')
      expect(result.menus[0].path).toBe('/dashboard')
    })

    it('summary에 totalMenus와 totalCategories를 포함한다 (FR-303)', () => {
      const menus: MenuItem[] = [
        { menuId: 1, menuCd: 'M1', name: '생산관리', path: null, category: '생산관리', sortOrder: '10', icon: null, isActive: true, children: [] },
        { menuId: 2, menuCd: 'M2', name: '작업지시', path: '/p/order', category: '생산관리/작업지시', sortOrder: '11', icon: null, isActive: true, children: [] },
        { menuId: 3, menuCd: 'M3', name: '품질관리', path: null, category: '품질관리', sortOrder: '20', icon: null, isActive: true, children: [] },
        { menuId: 4, menuCd: 'M4', name: '검사관리', path: '/q/inspect', category: '품질관리/검사관리', sortOrder: '21', icon: null, isActive: true, children: [] },
      ]
      const allowedIds = new Set([1, 2, 3, 4])

      const result = buildMenuTreeForSimulation(menus, allowedIds)

      // 리프 메뉴(path가 있는 것): 작업지시, 검사관리 = 2개
      // 카테고리(루트): 생산관리, 품질관리 = 2개
      expect(result.summary.totalMenus).toBe(2)
      expect(result.summary.totalCategories).toBe(2)
    })

    it('중복 메뉴를 제거한다 (BR-301)', () => {
      const menus: MenuItem[] = [
        { menuId: 1, menuCd: 'M1', name: '대시보드', path: '/dashboard', category: '대시보드', sortOrder: '01', icon: null, isActive: true, children: [] },
      ]
      // 같은 menuId가 여러 번 들어오더라도 중복 제거
      const allowedIds = new Set([1, 1, 1])

      const result = buildMenuTreeForSimulation(menus, allowedIds)

      expect(result.menus).toHaveLength(1)
    })

    it('빈 허용 ID로 빈 결과를 반환한다', () => {
      const menus: MenuItem[] = [
        { menuId: 1, menuCd: 'M1', name: '대시보드', path: '/dashboard', category: '대시보드', sortOrder: '01', icon: null, isActive: true, children: [] },
      ]

      const result = buildMenuTreeForSimulation(menus, new Set())

      expect(result.menus).toHaveLength(0)
      expect(result.summary.totalMenus).toBe(0)
      expect(result.summary.totalCategories).toBe(0)
    })

    it('부모 카테고리 메뉴를 자동 포함한다 (BR-302)', () => {
      const menus: MenuItem[] = [
        { menuId: 1, menuCd: 'M1', name: '생산관리', path: null, category: '생산관리', sortOrder: '10', icon: null, isActive: true, children: [] },
        { menuId: 2, menuCd: 'M2', name: '작업지시', path: '/p/order', category: '생산관리/작업지시', sortOrder: '11', icon: null, isActive: true, children: [] },
      ]
      // 자식만 허용해도 부모가 자동 포함
      const allowedIds = new Set([2])

      const result = buildMenuTreeForSimulation(menus, allowedIds)

      expect(result.menus).toHaveLength(1)
      expect(result.menus[0].title).toBe('생산관리')
      expect(result.menus[0].children).toHaveLength(1)
    })
  })

  describe('collectMenuIdsFromRoleGroups', () => {
    it('역할그룹 데이터에서 메뉴 ID를 수집한다', () => {
      const roleGroupsData = [
        {
          roleGroupRoles: [
            {
              role: {
                rolePermissions: [
                  { permission: { menuId: 1, config: '{"actions":["READ"]}' } },
                  { permission: { menuId: 2, config: '{"actions":["READ","UPDATE"]}' } },
                ],
              },
            },
          ],
        },
        {
          roleGroupRoles: [
            {
              role: {
                rolePermissions: [
                  { permission: { menuId: 2, config: '{"actions":["READ"]}' } },
                  { permission: { menuId: 3, config: '{"actions":["READ"]}' } },
                ],
              },
            },
          ],
        },
      ]

      const result = collectMenuIdsFromRoleGroups(roleGroupsData)

      expect(result).toEqual(new Set([1, 2, 3]))
    })

    it('menuId가 null인 권한은 무시한다', () => {
      const roleGroupsData = [
        {
          roleGroupRoles: [
            {
              role: {
                rolePermissions: [
                  { permission: { menuId: null, config: '{"actions":["READ"]}' } },
                  { permission: { menuId: 1, config: '{"actions":["READ"]}' } },
                ],
              },
            },
          ],
        },
      ]

      const result = collectMenuIdsFromRoleGroups(roleGroupsData)

      expect(result).toEqual(new Set([1]))
    })

    it('빈 역할그룹 배열은 빈 Set을 반환한다', () => {
      const result = collectMenuIdsFromRoleGroups([])
      expect(result).toEqual(new Set())
    })
  })
})
