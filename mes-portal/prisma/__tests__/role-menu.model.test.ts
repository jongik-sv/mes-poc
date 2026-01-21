/**
 * RoleMenu Model 단위 테스트 (TSK-03-02)
 *
 * 테스트 명세서(026-test-specification.md) 기반
 * - UT-006: 중복 매핑 생성 방지
 * - UT-007: Cascade 삭제
 *
 * 실제 dev.db를 사용하여 통합 테스트 수행
 * (시드 데이터가 이미 존재한다고 가정)
 */

import { PrismaClient } from '../../lib/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

describe('RoleMenu Model (TSK-03-02)', () => {
  beforeAll(async () => {
    // 시드가 이미 실행되어 있다고 가정 (pnpm db:seed)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('시드 데이터 검증', () => {
    it('RoleMenu 테이블이 생성되어 있어야 한다', async () => {
      const roleMenus = await prisma.roleMenu.findMany()
      expect(roleMenus).toBeDefined()
      expect(Array.isArray(roleMenus)).toBe(true)
    })

    it('ADMIN 역할에 모든 활성 메뉴가 매핑되어 있어야 한다', async () => {
      // ADMIN 역할 조회
      const adminRole = await prisma.role.findUnique({
        where: { code: 'ADMIN' },
      })
      expect(adminRole).not.toBeNull()

      // ADMIN의 메뉴 매핑 조회
      const adminMenuMappings = await prisma.roleMenu.findMany({
        where: { roleId: adminRole!.id },
        include: { menu: true },
      })

      // 활성 메뉴 수 조회
      const activeMenuCount = await prisma.menu.count({
        where: { isActive: true },
      })

      // ADMIN은 모든 활성 메뉴에 매핑되어야 함
      expect(adminMenuMappings.length).toBe(activeMenuCount)
    })

    it('MANAGER 역할에 적절한 메뉴가 매핑되어 있어야 한다', async () => {
      const managerRole = await prisma.role.findUnique({
        where: { code: 'MANAGER' },
      })
      expect(managerRole).not.toBeNull()

      const managerMenuMappings = await prisma.roleMenu.findMany({
        where: { roleId: managerRole!.id },
        include: { menu: true },
      })

      const menuCodes = managerMenuMappings.map((rm) => rm.menu.code)

      // MANAGER는 대시보드, 생산 관리 관련 메뉴에 접근 가능
      expect(menuCodes).toContain('DASHBOARD')
      expect(menuCodes).toContain('PRODUCTION')
      expect(menuCodes).toContain('WORK_ORDER')

      // MANAGER는 시스템 관리에 접근 불가
      expect(menuCodes).not.toContain('SYSTEM')
      expect(menuCodes).not.toContain('USER_MGMT')
    })

    it('OPERATOR 역할에 적절한 메뉴가 매핑되어 있어야 한다', async () => {
      const operatorRole = await prisma.role.findUnique({
        where: { code: 'OPERATOR' },
      })
      expect(operatorRole).not.toBeNull()

      const operatorMenuMappings = await prisma.roleMenu.findMany({
        where: { roleId: operatorRole!.id },
        include: { menu: true },
      })

      const menuCodes = operatorMenuMappings.map((rm) => rm.menu.code)

      // OPERATOR는 대시보드, 작업 지시, 생산 실적 입력에 접근 가능
      expect(menuCodes).toContain('DASHBOARD')
      expect(menuCodes).toContain('WORK_ORDER')
      expect(menuCodes).toContain('PRODUCTION_ENTRY')

      // OPERATOR는 시스템 관리, 샘플 화면에 접근 불가
      expect(menuCodes).not.toContain('SYSTEM')
      expect(menuCodes).not.toContain('SAMPLE')
    })
  })

  describe('UT-006: 중복 매핑 생성 방지 (BR-04)', () => {
    it('동일한 역할-메뉴 조합은 중복 생성 불가', async () => {
      // 기존 매핑 조회
      const existingMapping = await prisma.roleMenu.findFirst()
      expect(existingMapping).not.toBeNull()

      // 동일한 조합으로 다시 생성 시도
      await expect(
        prisma.roleMenu.create({
          data: {
            roleId: existingMapping!.roleId,
            menuId: existingMapping!.menuId,
          },
        })
      ).rejects.toThrow()
    })
  })

  describe('관계 조회', () => {
    it('Role을 통해 연결된 메뉴를 조회할 수 있다', async () => {
      const roleWithMenus = await prisma.role.findUnique({
        where: { code: 'ADMIN' },
        include: {
          roleMenus: {
            include: { menu: true },
            take: 5, // 테스트 속도를 위해 일부만 조회
          },
        },
      })

      expect(roleWithMenus).not.toBeNull()
      expect(roleWithMenus!.roleMenus.length).toBeGreaterThan(0)
      expect(roleWithMenus!.roleMenus[0].menu).toBeDefined()
      expect(roleWithMenus!.roleMenus[0].menu.code).toBeDefined()
    })

    it('Menu를 통해 연결된 역할을 조회할 수 있다', async () => {
      // DASHBOARD 메뉴는 모든 역할에 매핑되어 있음
      const menuWithRoles = await prisma.menu.findUnique({
        where: { code: 'DASHBOARD' },
        include: {
          roleMenus: {
            include: { role: true },
          },
        },
      })

      expect(menuWithRoles).not.toBeNull()
      expect(menuWithRoles!.roleMenus.length).toBeGreaterThan(0)
      expect(menuWithRoles!.roleMenus[0].role).toBeDefined()
      expect(menuWithRoles!.roleMenus[0].role.code).toBeDefined()

      // 모든 기본 역할에 DASHBOARD가 매핑되어 있어야 함
      const roleCodes = menuWithRoles!.roleMenus.map((rm) => rm.role.code)
      expect(roleCodes).toContain('ADMIN')
      expect(roleCodes).toContain('MANAGER')
      expect(roleCodes).toContain('OPERATOR')
    })
  })

  describe('Unique 제약조건', () => {
    it('(roleId, menuId) 조합에 unique 제약조건이 적용됨', async () => {
      // 각 역할-메뉴 조합이 고유해야 함
      const allMappings = await prisma.roleMenu.findMany()

      const combinationSet = new Set<string>()
      for (const mapping of allMappings) {
        const key = `${mapping.roleId}-${mapping.menuId}`
        expect(combinationSet.has(key)).toBe(false) // 중복 없어야 함
        combinationSet.add(key)
      }
    })
  })
})
