/**
 * Prisma 시드 데이터
 *
 * - TSK-03-01: 초기 메뉴 데이터 생성
 * - TSK-04-02: 역할 및 사용자 데이터 생성
 * - TSK-03-02: 역할-메뉴 매핑 데이터 생성
 * - Auth System: RBAC 기반 역할/권한/보안설정 데이터
 */

import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../lib/generated/prisma/client'
import { hashPassword } from '../lib/auth/password'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

const DEFAULT_SYSTEM_ID = 'mes-default'

// ============================================
// RBAC 역할 데이터 (Auth System)
// ============================================
const roles = [
  { roleCd: 'SYSTEM_ADMIN', name: '시스템 관리자', description: '전체 시스템 관리 권한', level: 0, isSystem: true, parentCode: null },
  { roleCd: 'SECURITY_ADMIN', name: '보안 관리자', description: '보안 정책 및 감사 로그 관리', level: 1, isSystem: true, parentCode: 'SYSTEM_ADMIN' },
  { roleCd: 'OPERATION_ADMIN', name: '운영 관리자', description: '운영 관련 관리 권한', level: 1, isSystem: true, parentCode: 'SYSTEM_ADMIN' },
  { roleCd: 'PRODUCTION_MANAGER', name: '생산 관리자', description: '생산 현장 관리 권한', level: 2, isSystem: false, parentCode: 'OPERATION_ADMIN' },
  { roleCd: 'QUALITY_MANAGER', name: '품질 관리자', description: '품질 관리 권한', level: 2, isSystem: false, parentCode: 'OPERATION_ADMIN' },
  { roleCd: 'EQUIPMENT_MANAGER', name: '설비 관리자', description: '설비 관리 권한', level: 2, isSystem: false, parentCode: 'OPERATION_ADMIN' },
  { roleCd: 'USER', name: '일반 사용자', description: '기본 사용자 권한', level: 3, isSystem: true, parentCode: null },
] as const

// ============================================
// 권한 데이터 (Auth System)
// ============================================
const permissions = [
  // 사용자 관리 권한
  { permissionCd: 'user:read', name: '사용자 조회', config: '{"actions":["READ"],"resource":"/api/users"}' },
  { permissionCd: 'user:create', name: '사용자 생성', config: '{"actions":["CREATE"],"resource":"/api/users"}' },
  { permissionCd: 'user:update', name: '사용자 수정', config: '{"actions":["UPDATE"],"resource":"/api/users"}' },
  { permissionCd: 'user:delete', name: '사용자 삭제', config: '{"actions":["DELETE"],"resource":"/api/users"}' },
  { permissionCd: 'user:lock', name: '계정 잠금', config: '{"actions":["LOCK"],"resource":"/api/users"}' },
  { permissionCd: 'user:unlock', name: '계정 잠금 해제', config: '{"actions":["UNLOCK"],"resource":"/api/users"}' },
  { permissionCd: 'user:password-reset', name: '비밀번호 초기화', config: '{"actions":["PASSWORD_RESET"],"resource":"/api/users"}' },
  { permissionCd: 'user:assign-role', name: '역할 할당', config: '{"actions":["ASSIGN_ROLE"],"resource":"/api/users"}' },

  // 역할 관리 권한
  { permissionCd: 'role:read', name: '역할 조회', config: '{"actions":["READ"],"resource":"/api/roles"}' },
  { permissionCd: 'role:create', name: '역할 생성', config: '{"actions":["CREATE"],"resource":"/api/roles"}' },
  { permissionCd: 'role:update', name: '역할 수정', config: '{"actions":["UPDATE"],"resource":"/api/roles"}' },
  { permissionCd: 'role:delete', name: '역할 삭제', config: '{"actions":["DELETE"],"resource":"/api/roles"}' },
  { permissionCd: 'role:assign-permission', name: '권한 할당', config: '{"actions":["ASSIGN_PERMISSION"],"resource":"/api/roles"}' },
  { permissionCd: 'role:assign-menu', name: '메뉴 할당', config: '{"actions":["ASSIGN_MENU"],"resource":"/api/roles"}' },

  // 권한 관리 권한
  { permissionCd: 'permission:read', name: '권한 조회', config: '{"actions":["READ"],"resource":"/api/permissions"}' },
  { permissionCd: 'permission:create', name: '권한 생성', config: '{"actions":["CREATE"],"resource":"/api/permissions"}' },
  { permissionCd: 'permission:update', name: '권한 수정', config: '{"actions":["UPDATE"],"resource":"/api/permissions"}' },
  { permissionCd: 'permission:delete', name: '권한 삭제', config: '{"actions":["DELETE"],"resource":"/api/permissions"}' },

  // 감사 로그 권한
  { permissionCd: 'audit-log:read', name: '감사 로그 조회', config: '{"actions":["READ"],"resource":"/api/audit-logs"}' },
  { permissionCd: 'audit-log:export', name: '감사 로그 내보내기', config: '{"actions":["EXPORT"],"resource":"/api/audit-logs/export"}' },

  // 보안 설정 권한
  { permissionCd: 'security:read', name: '보안 설정 조회', config: '{"actions":["READ"],"resource":"/api/security-settings"}' },
  { permissionCd: 'security:update', name: '보안 설정 수정', config: '{"actions":["UPDATE"],"resource":"/api/security-settings"}' },

  // 메뉴 관리 권한
  { permissionCd: 'menu:read', name: '메뉴 조회', config: '{"actions":["READ"],"resource":"/api/menus"}' },
  { permissionCd: 'menu:create', name: '메뉴 생성', config: '{"actions":["CREATE"],"resource":"/api/menus"}' },
  { permissionCd: 'menu:update', name: '메뉴 수정', config: '{"actions":["UPDATE"],"resource":"/api/menus"}' },
  { permissionCd: 'menu:delete', name: '메뉴 삭제', config: '{"actions":["DELETE"],"resource":"/api/menus"}' },
] as const

// ============================================
// 역할-권한 매핑 데이터 (Auth System)
// ============================================
const rolePermissions: { roleCode: string; permissionCodes: string[] }[] = [
  { roleCode: 'SYSTEM_ADMIN', permissionCodes: ['*'] },
  {
    roleCode: 'SECURITY_ADMIN',
    permissionCodes: [
      'audit-log:read',
      'audit-log:export',
      'security:read',
      'security:update',
      'user:read',
    ],
  },
  {
    roleCode: 'OPERATION_ADMIN',
    permissionCodes: [
      'user:read',
      'user:create',
      'user:update',
      'user:lock',
      'user:unlock',
      'user:password-reset',
      'user:assign-role',
      'role:read',
      'menu:read',
    ],
  },
  {
    roleCode: 'PRODUCTION_MANAGER',
    permissionCodes: ['user:read', 'role:read', 'menu:read'],
  },
  {
    roleCode: 'QUALITY_MANAGER',
    permissionCodes: ['user:read', 'role:read', 'menu:read'],
  },
  {
    roleCode: 'EQUIPMENT_MANAGER',
    permissionCodes: ['user:read', 'role:read', 'menu:read'],
  },
  {
    roleCode: 'USER',
    permissionCodes: ['menu:read'],
  },
]

// ============================================
// 보안 설정 데이터 (Auth System)
// ============================================
const securitySettings = [
  { key: 'PASSWORD_MIN_LENGTH', value: '8', type: 'NUMBER', description: '비밀번호 최소 길이' },
  { key: 'PASSWORD_REQUIRE_UPPERCASE', value: 'true', type: 'BOOLEAN', description: '대문자 필수' },
  { key: 'PASSWORD_REQUIRE_LOWERCASE', value: 'true', type: 'BOOLEAN', description: '소문자 필수' },
  { key: 'PASSWORD_REQUIRE_NUMBER', value: 'true', type: 'BOOLEAN', description: '숫자 필수' },
  { key: 'PASSWORD_REQUIRE_SPECIAL', value: 'true', type: 'BOOLEAN', description: '특수문자 필수' },
  { key: 'PASSWORD_EXPIRY_DAYS', value: '90', type: 'NUMBER', description: '비밀번호 만료 기간(일)' },
  { key: 'PASSWORD_HISTORY_COUNT', value: '5', type: 'NUMBER', description: '비밀번호 재사용 금지 횟수' },
  { key: 'MAX_LOGIN_ATTEMPTS', value: '5', type: 'NUMBER', description: '최대 로그인 실패 횟수' },
  { key: 'LOCKOUT_DURATION_MINUTES', value: '30', type: 'NUMBER', description: '계정 잠금 시간(분)' },
  { key: 'SESSION_TIMEOUT_MINUTES', value: '30', type: 'NUMBER', description: '세션 타임아웃(분)' },
  { key: 'MAX_CONCURRENT_SESSIONS', value: '3', type: 'NUMBER', description: '최대 동시 세션 수' },
  { key: 'SESSION_WARNING_MINUTES', value: '5', type: 'NUMBER', description: '세션 만료 경고 시간(분)' },
  { key: 'ACCESS_TOKEN_EXPIRY_MINUTES', value: '15', type: 'NUMBER', description: 'Access Token 만료 시간(분)' },
  { key: 'REFRESH_TOKEN_EXPIRY_DAYS', value: '7', type: 'NUMBER', description: 'Refresh Token 만료 시간(일)' },
  { key: 'AUDIT_LOG_RETENTION_DAYS', value: '365', type: 'NUMBER', description: '감사 로그 보존 기간(일)' },
] as const

// ============================================
// 테스트 사용자 데이터 (Auth System)
// ============================================
const testUsers = [
  { userId: 'admin001', email: 'admin@mes.local', name: '시스템 관리자', roleCode: 'SYSTEM_ADMIN', password: 'Admin123!' },
  { userId: 'security001', email: 'security@mes.local', name: '보안 관리자', roleCode: 'SECURITY_ADMIN', password: 'Security123!' },
  { userId: 'operation001', email: 'operation@mes.local', name: '운영 관리자', roleCode: 'OPERATION_ADMIN', password: 'Operation123!' },
  { userId: 'production001', email: 'production@mes.local', name: '생산 관리자', roleCode: 'PRODUCTION_MANAGER', password: 'Production123!' },
  { userId: 'user001', email: 'user@mes.local', name: '일반 사용자', roleCode: 'USER', password: 'User123!' },
] as const

// ============================================
// 기본 시스템 시드
// ============================================
async function seedSystem() {
  console.log('Seeding default system...')
  await prisma.system.upsert({
    where: { systemId: DEFAULT_SYSTEM_ID },
    update: {},
    create: {
      systemId: DEFAULT_SYSTEM_ID,
      name: '기본 시스템',
      domain: 'localhost',
      description: 'MES POC 기본 시스템',
    },
  })
  console.log('  Created default system')
}

// ============================================
// 역할 및 사용자 시드 함수 (Auth System)
// ============================================
async function seedRolesAndUsers() {
  console.log('Seeding roles, permissions, and users...')

  // 1. 권한 생성
  console.log('  Creating permissions...')
  const createdPermissions = await Promise.all(
    permissions.map((perm) =>
      prisma.permission.upsert({
        where: { permissionCd: perm.permissionCd },
        update: { name: perm.name, config: perm.config },
        create: {
          systemId: DEFAULT_SYSTEM_ID,
          permissionCd: perm.permissionCd,
          name: perm.name,
          config: perm.config,
        },
      })
    )
  )
  console.log(`  Created ${createdPermissions.length} permissions`)

  // 권한 코드 -> ID 매핑
  const permMap = new Map(createdPermissions.map((p) => [p.permissionCd, p.permissionId]))

  // 2. 역할 생성 (부모 역할 없는 것 먼저)
  console.log('  Creating roles...')
  const roleMap = new Map<string, number>()

  // 부모 없는 역할 먼저 생성
  for (const role of roles.filter((r) => r.parentCode === null)) {
    const created = await prisma.role.upsert({
      where: { roleCd: role.roleCd },
      update: { name: role.name, description: role.description, level: role.level, isSystem: role.isSystem },
      create: {
        systemId: DEFAULT_SYSTEM_ID,
        roleCd: role.roleCd,
        name: role.name,
        description: role.description,
        level: role.level,
        isSystem: role.isSystem,
      },
    })
    roleMap.set(role.roleCd, created.roleId)
  }

  // 부모 있는 역할 생성
  for (const role of roles.filter((r) => r.parentCode !== null)) {
    const parentRoleId = roleMap.get(role.parentCode!)
    const created = await prisma.role.upsert({
      where: { roleCd: role.roleCd },
      update: { name: role.name, description: role.description, level: role.level, isSystem: role.isSystem, parentRoleId },
      create: {
        systemId: DEFAULT_SYSTEM_ID,
        roleCd: role.roleCd,
        name: role.name,
        description: role.description,
        level: role.level,
        isSystem: role.isSystem,
        parentRoleId,
      },
    })
    roleMap.set(role.roleCd, created.roleId)
  }
  console.log(`  Created ${roleMap.size} roles`)

  // 3. 역할-권한 매핑
  console.log('  Creating role-permission mappings...')
  for (const mapping of rolePermissions) {
    const roleId = roleMap.get(mapping.roleCode)
    if (!roleId) continue

    const permCodes = mapping.permissionCodes[0] === '*'
      ? permissions.map((p) => p.permissionCd)
      : mapping.permissionCodes

    for (const code of permCodes) {
      const permId = permMap.get(code)
      if (!permId) continue

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId: permId } },
        update: {},
        create: { roleId, permissionId: permId },
      })
    }
  }
  console.log('  Created role-permission mappings')

  // 4. RoleGroup 생성 (각 역할에 대응하는 RoleGroup + RoleGroupRole 매핑)
  console.log('  Creating role groups...')
  const roleGroupMap = new Map<string, number>()
  for (const role of roles) {
    const roleGroupCd = `RG_${role.roleCd}`
    const roleId = roleMap.get(role.roleCd)
    if (!roleId) continue

    const roleGroup = await prisma.roleGroup.upsert({
      where: { roleGroupCd },
      update: {},
      create: {
        systemId: DEFAULT_SYSTEM_ID,
        roleGroupCd,
        name: `${role.name} 그룹`,
        description: `${role.name} 역할 그룹`,
      },
    })
    roleGroupMap.set(role.roleCd, roleGroup.roleGroupId)

    // RoleGroupRole 매핑
    await prisma.roleGroupRole.upsert({
      where: { roleGroupId_roleId: { roleGroupId: roleGroup.roleGroupId, roleId } },
      update: {},
      create: { roleGroupId: roleGroup.roleGroupId, roleId },
    })
  }
  console.log(`  Created ${roleGroupMap.size} role groups`)

  // 5. 테스트 사용자 생성
  console.log('  Creating test users...')
  for (const user of testUsers) {
    const hashedPassword = await hashPassword(user.password)
    const roleGroupId = roleGroupMap.get(user.roleCode)
    if (!roleGroupId) continue

    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        userId: user.userId,
        email: user.email,
        password: hashedPassword,
        name: user.name,
        mustChangePassword: false,
      },
    })

    // UserRoleGroup 매핑
    await prisma.userRoleGroup.upsert({
      where: { userId_roleGroupId: { userId: createdUser.userId, roleGroupId } },
      update: {},
      create: { userId: createdUser.userId, roleGroupId },
    })
  }
  console.log(`  Created ${testUsers.length} test users`)

  // 6. 보안 설정 생성
  console.log('  Creating security settings...')
  for (const setting of securitySettings) {
    await prisma.securitySetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, type: setting.type, description: setting.description },
      create: setting,
    })
  }
  console.log(`  Created ${securitySettings.length} security settings`)
}

// 테스트에서 사용할 수 있도록 export
export { seedRolesAndUsers }

const menus = [
  // 1단계: 대시보드
  {
    menuCd: 'DASHBOARD',
    name: '대시보드',
    category: '대시보드',
    path: null,
    icon: 'DashboardOutlined',
    sortOrder: '100',
    isActive: true,
  },
  {
    menuCd: 'DASHBOARD_MAIN',
    name: '메인 대시보드',
    category: '대시보드',
    path: '/dashboard',
    icon: 'BarChartOutlined',
    sortOrder: '110',
    isActive: true,
  },

  // 1단계: 생산 관리
  {
    menuCd: 'PRODUCTION',
    name: '생산 관리',
    category: '생산관리',
    path: null,
    icon: 'ToolOutlined',
    sortOrder: '200',
    isActive: true,
  },
  {
    menuCd: 'WORK_ORDER',
    name: '작업 지시',
    category: '생산관리',
    path: '/production/work-order',
    icon: 'FileTextOutlined',
    sortOrder: '210',
    isActive: true,
  },
  {
    menuCd: 'PRODUCTION_RESULT',
    name: '실적 관리',
    category: '생산관리/실적관리',
    path: null,
    icon: 'FolderOutlined',
    sortOrder: '220',
    isActive: true,
  },
  {
    menuCd: 'PRODUCTION_ENTRY',
    name: '생산 실적 입력',
    category: '생산관리/실적관리',
    path: '/production/result/entry',
    icon: 'EditOutlined',
    sortOrder: '221',
    isActive: true,
  },
  {
    menuCd: 'PRODUCTION_HISTORY',
    name: '생산 이력 조회',
    category: '생산관리/실적관리',
    path: '/production/result/history',
    icon: 'HistoryOutlined',
    sortOrder: '222',
    isActive: true,
  },

  // 1단계: 샘플 화면
  {
    menuCd: 'SAMPLE',
    name: '샘플 화면',
    category: '샘플',
    path: null,
    icon: 'AppstoreOutlined',
    sortOrder: '300',
    isActive: true,
  },
  {
    menuCd: 'SAMPLE_USER_LIST',
    name: '사용자 목록',
    category: '샘플',
    path: '/sample/user-list',
    icon: 'UnorderedListOutlined',
    sortOrder: '310',
    isActive: true,
  },
  {
    menuCd: 'SAMPLE_MASTER_DETAIL',
    name: '마스터-디테일',
    category: '샘플',
    path: '/sample/master-detail',
    icon: 'SplitCellsOutlined',
    sortOrder: '320',
    isActive: true,
  },
  {
    menuCd: 'SAMPLE_WIZARD',
    name: '설정 마법사',
    category: '샘플',
    path: '/sample/wizard',
    icon: 'FundProjectionScreenOutlined',
    sortOrder: '330',
    isActive: true,
  },

  // 1단계: 시스템 관리
  {
    menuCd: 'SYSTEM',
    name: '시스템 관리',
    category: '시스템관리',
    path: null,
    icon: 'SettingOutlined',
    sortOrder: '900',
    isActive: true,
  },
  {
    menuCd: 'USER_MGMT',
    name: '사용자 관리',
    category: '시스템관리',
    path: '/system/users',
    icon: 'UserOutlined',
    sortOrder: '910',
    isActive: true,
  },
  {
    menuCd: 'ROLE_MGMT',
    name: '역할 관리',
    category: '시스템관리',
    path: '/system/roles',
    icon: 'TeamOutlined',
    sortOrder: '920',
    isActive: true,
  },
  {
    menuCd: 'MENU_MGMT',
    name: '메뉴 관리',
    category: '시스템관리',
    path: '/system/menus',
    icon: 'MenuOutlined',
    sortOrder: '930',
    isActive: true,
  },
  {
    menuCd: 'AUDIT_LOG',
    name: '감사 로그',
    category: '시스템관리',
    path: '/system/audit-logs',
    icon: 'FileSearchOutlined',
    sortOrder: '940',
    isActive: true,
  },

  // 테스트용 비활성 메뉴
  {
    menuCd: 'INACTIVE_MENU',
    name: '비활성 메뉴',
    category: '기타',
    path: '/inactive',
    icon: 'CloseOutlined',
    sortOrder: '999',
    isActive: false,
  },
]

async function seedMenus() {
  console.log('Seeding menus...')

  // 기존 메뉴 데이터 삭제 (순서 중요: 자식 먼저)
  await prisma.menu.deleteMany({})

  // 메뉴 데이터 생성
  for (const menu of menus) {
    await prisma.menu.create({
      data: {
        systemId: DEFAULT_SYSTEM_ID,
        ...menu,
      },
    })
  }

  console.log(`Created ${menus.length} menus`)
}

// ============================================
// 역할-메뉴 매핑 데이터 (Auth System)
// MenuSet 기반으로 변경
// ============================================

const roleMenuMappings: { roleCode: string; menuCodes: string[] }[] = [
  { roleCode: 'SYSTEM_ADMIN', menuCodes: ['*'] },
  {
    roleCode: 'SECURITY_ADMIN',
    menuCodes: [
      'DASHBOARD',
      'DASHBOARD_MAIN',
      'SYSTEM',
      'USER_MGMT',
      'ROLE_MGMT',
      'MENU_MGMT',
      'AUDIT_LOG',
    ],
  },
  {
    roleCode: 'OPERATION_ADMIN',
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
      'SYSTEM',
      'USER_MGMT',
      'ROLE_MGMT',
      'MENU_MGMT',
      'AUDIT_LOG',
    ],
  },
  {
    roleCode: 'PRODUCTION_MANAGER',
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
  {
    roleCode: 'USER',
    menuCodes: [
      'DASHBOARD',
      'DASHBOARD_MAIN',
      'SAMPLE',
      'SAMPLE_USER_LIST',
      'SAMPLE_MASTER_DETAIL',
      'SAMPLE_WIZARD',
    ],
  },
]

async function seedRoleMenus() {
  console.log('Seeding role-menu mappings via MenuSets...')

  // 기존 매핑 삭제
  await prisma.menuSetMenu.deleteMany({})
  await prisma.menuSet.deleteMany({})

  // 모든 메뉴 조회
  const allMenus = await prisma.menu.findMany()
  const menuMap = new Map(allMenus.map((m) => [m.menuCd, m.menuId]))

  let totalCreated = 0

  for (const mapping of roleMenuMappings) {
    // 역할별 MenuSet 생성
    const menuSetCd = `MS_${mapping.roleCode}`
    const menuSet = await prisma.menuSet.create({
      data: {
        systemId: DEFAULT_SYSTEM_ID,
        menuSetCd,
        name: `${mapping.roleCode} 메뉴셋`,
        description: `${mapping.roleCode} 역할용 메뉴셋`,
        isDefault: mapping.roleCode === 'USER',
      },
    })

    // 메뉴 코드 해석
    const menuCodesToMap =
      mapping.menuCodes[0] === '*'
        ? allMenus.filter((m) => m.isActive).map((m) => m.menuCd)
        : mapping.menuCodes

    for (const code of menuCodesToMap) {
      const menuId = menuMap.get(code)
      if (!menuId) {
        console.warn(`  Menu not found: ${code}`)
        continue
      }
      await prisma.menuSetMenu.create({
        data: { menuSetId: menuSet.menuSetId, menuId },
      })
      totalCreated++
    }

    console.log(`  ${mapping.roleCode}: ${menuCodesToMap.length} menus mapped`)
  }

  console.log(`Total menu-set-menu mappings created: ${totalCreated}`)
}

// 테스트에서 사용할 수 있도록 export
export { seedRoleMenus }

async function main() {
  console.log('Seeding database...')

  // 기본 시스템 시드
  await seedSystem()

  // 역할 및 사용자 시드 (TSK-04-02)
  await seedRolesAndUsers()

  // 메뉴 시드 (TSK-03-01)
  await seedMenus()

  // 역할-메뉴 매핑 시드 (TSK-03-02)
  await seedRoleMenus()

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
