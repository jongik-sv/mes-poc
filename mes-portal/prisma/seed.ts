/**
 * Prisma 시드 데이터
 *
 * - TSK-03-01: 초기 메뉴 데이터 생성
 * - TSK-04-02: 역할 및 사용자 데이터 생성
 * - TSK-03-02: 역할-메뉴 매핑 데이터 생성
 */

import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../lib/generated/prisma/client'
import { hashPassword } from '../lib/auth/password'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

// ============================================
// 역할 데이터 (TSK-04-02)
// ============================================
const roles = [
  { code: 'ADMIN', name: '시스템 관리자' },
  { code: 'MANAGER', name: '생산 관리자' },
  { code: 'OPERATOR', name: '현장 작업자' },
] as const

// ============================================
// 테스트 사용자 데이터 (TSK-04-02)
// ============================================
const testUsers = [
  { email: 'admin@example.com', name: '관리자', roleCode: 'ADMIN' },
  { email: 'manager@example.com', name: '생산관리자', roleCode: 'MANAGER' },
  { email: 'operator@example.com', name: '작업자', roleCode: 'OPERATOR' },
] as const

// ============================================
// 역할 및 사용자 시드 함수 (TSK-04-02)
// ============================================
async function seedRolesAndUsers() {
  console.log('🔐 Seeding roles and users...')

  // 1. 역할 생성 (upsert로 멱등성 보장)
  const createdRoles = await Promise.all(
    roles.map((role) =>
      prisma.role.upsert({
        where: { code: role.code },
        update: {},
        create: {
          code: role.code,
          name: role.name,
        },
      })
    )
  )

  console.log(`✅ Created ${createdRoles.length} roles:`, createdRoles.map((r) => r.code).join(', '))

  // 역할 코드 → ID 매핑
  const roleMap = new Map(createdRoles.map((r) => [r.code, r.id]))

  // 2. 테스트 사용자 생성
  const defaultPassword = await hashPassword('password123')

  const createdUsers = await Promise.all(
    testUsers.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          email: user.email,
          password: defaultPassword,
          name: user.name,
          roleId: roleMap.get(user.roleCode)!,
        },
      })
    )
  )

  console.log(`✅ Created ${createdUsers.length} users:`, createdUsers.map((u) => u.email).join(', '))
}

// 테스트에서 사용할 수 있도록 export
export { seedRolesAndUsers }

const menus = [
  // 1단계: 대시보드
  {
    id: 1,
    code: 'DASHBOARD',
    name: '대시보드',
    path: null,
    icon: 'DashboardOutlined',
    parentId: null,
    sortOrder: 1,
    isActive: true,
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
  },

  // 1단계: 생산 관리
  {
    id: 10,
    code: 'PRODUCTION',
    name: '생산 관리',
    path: null,
    icon: 'ToolOutlined',
    parentId: null,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 11,
    code: 'WORK_ORDER',
    name: '작업 지시',
    path: '/portal/production/work-order',
    icon: 'FileTextOutlined',
    parentId: 10,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 12,
    code: 'PRODUCTION_RESULT',
    name: '실적 관리',
    path: null,
    icon: 'FolderOutlined',
    parentId: 10,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 13,
    code: 'PRODUCTION_ENTRY',
    name: '생산 실적 입력',
    path: '/portal/production/result/entry',
    icon: 'EditOutlined',
    parentId: 12,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 14,
    code: 'PRODUCTION_HISTORY',
    name: '생산 이력 조회',
    path: '/portal/production/result/history',
    icon: 'HistoryOutlined',
    parentId: 12,
    sortOrder: 2,
    isActive: true,
  },

  // 1단계: 샘플 화면
  {
    id: 20,
    code: 'SAMPLE',
    name: '샘플 화면',
    path: null,
    icon: 'AppstoreOutlined',
    parentId: null,
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 21,
    code: 'SAMPLE_USER_LIST',
    name: '사용자 목록',
    path: '/portal/sample/user-list',
    icon: 'UnorderedListOutlined',
    parentId: 20,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 22,
    code: 'SAMPLE_MASTER_DETAIL',
    name: '마스터-디테일',
    path: '/portal/sample/master-detail',
    icon: 'SplitCellsOutlined',
    parentId: 20,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 23,
    code: 'SAMPLE_WIZARD',
    name: '설정 마법사',
    path: '/portal/sample/wizard',
    icon: 'FundProjectionScreenOutlined',
    parentId: 20,
    sortOrder: 3,
    isActive: true,
  },

  // 1단계: 시스템 관리
  {
    id: 90,
    code: 'SYSTEM',
    name: '시스템 관리',
    path: null,
    icon: 'SettingOutlined',
    parentId: null,
    sortOrder: 9,
    isActive: true,
  },
  {
    id: 91,
    code: 'USER_MGMT',
    name: '사용자 관리',
    path: '/portal/system/users',
    icon: 'UserOutlined',
    parentId: 90,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 92,
    code: 'ROLE_MGMT',
    name: '역할 관리',
    path: '/portal/system/roles',
    icon: 'TeamOutlined',
    parentId: 90,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 93,
    code: 'MENU_MGMT',
    name: '메뉴 관리',
    path: '/portal/system/menus',
    icon: 'MenuOutlined',
    parentId: 90,
    sortOrder: 3,
    isActive: true,
  },

  // 테스트용 비활성 메뉴
  {
    id: 99,
    code: 'INACTIVE_MENU',
    name: '비활성 메뉴',
    path: '/portal/inactive',
    icon: 'CloseOutlined',
    parentId: null,
    sortOrder: 99,
    isActive: false,
  },
]

async function seedMenus() {
  console.log('📋 Seeding menus...')

  // 기존 메뉴 데이터 삭제 (순서 중요: 자식 먼저)
  await prisma.menu.deleteMany({})

  // 메뉴 데이터 생성
  for (const menu of menus) {
    await prisma.menu.create({
      data: menu,
    })
  }

  console.log(`✅ Created ${menus.length} menus`)
}

// ============================================
// 역할-메뉴 매핑 데이터 (TSK-03-02)
// ============================================

/**
 * 역할별 메뉴 매핑 설정
 * - ADMIN: 모든 메뉴 접근
 * - MANAGER: 대시보드, 생산 관리, 샘플 화면 (시스템 관리 제외)
 * - OPERATOR: 대시보드, 작업 지시, 생산 실적 (BR-02에 의해 부모 자동 표시)
 */
const roleMenuMappings: { roleCode: string; menuCodes: string[] }[] = [
  // ADMIN - 모든 메뉴 (menuCodes: ['*']는 모든 메뉴 의미)
  { roleCode: 'ADMIN', menuCodes: ['*'] },

  // MANAGER - 생산/품질/설비 관리 (시스템 관리 제외)
  {
    roleCode: 'MANAGER',
    menuCodes: [
      'DASHBOARD',
      'DASHBOARD_MAIN',
      'PRODUCTION',
      'WORK_ORDER',
      'PRODUCTION_RESULT',
      'PRODUCTION_ENTRY',
      'PRODUCTION_HISTORY',
      'SAMPLE',
      'SAMPLE_USER_LIST',
      'SAMPLE_MASTER_DETAIL',
      'SAMPLE_WIZARD',
    ],
  },

  // OPERATOR - 작업 관련만 (BR-02 규칙에 의해 부모 메뉴 자동 표시)
  {
    roleCode: 'OPERATOR',
    menuCodes: [
      'DASHBOARD',
      'DASHBOARD_MAIN',
      'WORK_ORDER',
      'PRODUCTION_ENTRY',
      // 부모 메뉴 PRODUCTION, PRODUCTION_RESULT는
      // BR-02 규칙에 의해 클라이언트에서 자동 표시됨
      // 그러나 시드에서는 명시적으로 매핑하여 DB 조회 일관성 유지
      'PRODUCTION',
      'PRODUCTION_RESULT',
    ],
  },
]

async function seedRoleMenus() {
  console.log('🔗 Seeding role-menu mappings...')

  // 기존 매핑 삭제
  await prisma.roleMenu.deleteMany({})

  // 모든 역할 조회
  const allRoles = await prisma.role.findMany()
  const roleMap = new Map(allRoles.map((r) => [r.code, r.id]))

  // 모든 메뉴 조회
  const allMenus = await prisma.menu.findMany()
  const menuMap = new Map(allMenus.map((m) => [m.code, m.id]))

  let totalCreated = 0

  for (const mapping of roleMenuMappings) {
    const roleId = roleMap.get(mapping.roleCode)
    if (!roleId) {
      console.warn(`⚠️ Role not found: ${mapping.roleCode}`)
      continue
    }

    // '*' 와일드카드: 모든 활성 메뉴 매핑
    const menuCodesToMap =
      mapping.menuCodes[0] === '*'
        ? allMenus.filter((m) => m.isActive).map((m) => m.code)
        : mapping.menuCodes

    const roleMenuData = menuCodesToMap
      .map((code) => {
        const menuId = menuMap.get(code)
        if (!menuId) {
          console.warn(`⚠️ Menu not found: ${code}`)
          return null
        }
        return { roleId, menuId }
      })
      .filter((item): item is { roleId: number; menuId: number } => item !== null)

    // upsert를 위해 개별 생성 (createMany는 onConflict 미지원)
    for (const data of roleMenuData) {
      await prisma.roleMenu.upsert({
        where: {
          roleId_menuId: { roleId: data.roleId, menuId: data.menuId },
        },
        update: {},
        create: data,
      })
      totalCreated++
    }

    console.log(`  ✅ ${mapping.roleCode}: ${roleMenuData.length}개 메뉴 매핑`)
  }

  console.log(`✅ Total role-menu mappings created: ${totalCreated}`)
}

// 테스트에서 사용할 수 있도록 export
export { seedRoleMenus }

async function main() {
  console.log('🌱 Seeding database...')

  // 역할 및 사용자 시드 (TSK-04-02)
  await seedRolesAndUsers()

  // 메뉴 시드 (TSK-03-01)
  await seedMenus()

  // 역할-메뉴 매핑 시드 (TSK-03-02)
  await seedRoleMenus()

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
