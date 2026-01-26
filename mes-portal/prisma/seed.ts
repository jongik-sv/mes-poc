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

// ============================================
// RBAC 역할 데이터 (Auth System)
// ============================================
const roles = [
  { code: 'SYSTEM_ADMIN', name: '시스템 관리자', description: '전체 시스템 관리 권한', level: 0, isSystem: true, parentCode: null },
  { code: 'SECURITY_ADMIN', name: '보안 관리자', description: '보안 정책 및 감사 로그 관리', level: 1, isSystem: true, parentCode: 'SYSTEM_ADMIN' },
  { code: 'OPERATION_ADMIN', name: '운영 관리자', description: '운영 관련 관리 권한', level: 1, isSystem: true, parentCode: 'SYSTEM_ADMIN' },
  { code: 'PRODUCTION_MANAGER', name: '생산 관리자', description: '생산 현장 관리 권한', level: 2, isSystem: false, parentCode: 'OPERATION_ADMIN' },
  { code: 'QUALITY_MANAGER', name: '품질 관리자', description: '품질 관리 권한', level: 2, isSystem: false, parentCode: 'OPERATION_ADMIN' },
  { code: 'EQUIPMENT_MANAGER', name: '설비 관리자', description: '설비 관리 권한', level: 2, isSystem: false, parentCode: 'OPERATION_ADMIN' },
  { code: 'USER', name: '일반 사용자', description: '기본 사용자 권한', level: 3, isSystem: true, parentCode: null },
] as const

// ============================================
// 권한 데이터 (Auth System)
// ============================================
const permissions = [
  // 사용자 관리 권한
  { code: 'user:read', name: '사용자 조회', type: 'API', resource: '/api/users', action: 'READ' },
  { code: 'user:create', name: '사용자 생성', type: 'API', resource: '/api/users', action: 'CREATE' },
  { code: 'user:update', name: '사용자 수정', type: 'API', resource: '/api/users', action: 'UPDATE' },
  { code: 'user:delete', name: '사용자 삭제', type: 'API', resource: '/api/users', action: 'DELETE' },
  { code: 'user:lock', name: '계정 잠금', type: 'API', resource: '/api/users', action: 'LOCK' },
  { code: 'user:unlock', name: '계정 잠금 해제', type: 'API', resource: '/api/users', action: 'UNLOCK' },
  { code: 'user:password-reset', name: '비밀번호 초기화', type: 'API', resource: '/api/users', action: 'PASSWORD_RESET' },
  { code: 'user:assign-role', name: '역할 할당', type: 'API', resource: '/api/users', action: 'ASSIGN_ROLE' },

  // 역할 관리 권한
  { code: 'role:read', name: '역할 조회', type: 'API', resource: '/api/roles', action: 'READ' },
  { code: 'role:create', name: '역할 생성', type: 'API', resource: '/api/roles', action: 'CREATE' },
  { code: 'role:update', name: '역할 수정', type: 'API', resource: '/api/roles', action: 'UPDATE' },
  { code: 'role:delete', name: '역할 삭제', type: 'API', resource: '/api/roles', action: 'DELETE' },
  { code: 'role:assign-permission', name: '권한 할당', type: 'API', resource: '/api/roles', action: 'ASSIGN_PERMISSION' },
  { code: 'role:assign-menu', name: '메뉴 할당', type: 'API', resource: '/api/roles', action: 'ASSIGN_MENU' },

  // 권한 관리 권한
  { code: 'permission:read', name: '권한 조회', type: 'API', resource: '/api/permissions', action: 'READ' },
  { code: 'permission:create', name: '권한 생성', type: 'API', resource: '/api/permissions', action: 'CREATE' },
  { code: 'permission:update', name: '권한 수정', type: 'API', resource: '/api/permissions', action: 'UPDATE' },
  { code: 'permission:delete', name: '권한 삭제', type: 'API', resource: '/api/permissions', action: 'DELETE' },

  // 감사 로그 권한
  { code: 'audit-log:read', name: '감사 로그 조회', type: 'API', resource: '/api/audit-logs', action: 'READ' },
  { code: 'audit-log:export', name: '감사 로그 내보내기', type: 'API', resource: '/api/audit-logs/export', action: 'EXPORT' },

  // 보안 설정 권한
  { code: 'security:read', name: '보안 설정 조회', type: 'API', resource: '/api/security-settings', action: 'READ' },
  { code: 'security:update', name: '보안 설정 수정', type: 'API', resource: '/api/security-settings', action: 'UPDATE' },

  // 메뉴 관리 권한
  { code: 'menu:read', name: '메뉴 조회', type: 'API', resource: '/api/menus', action: 'READ' },
  { code: 'menu:create', name: '메뉴 생성', type: 'API', resource: '/api/menus', action: 'CREATE' },
  { code: 'menu:update', name: '메뉴 수정', type: 'API', resource: '/api/menus', action: 'UPDATE' },
  { code: 'menu:delete', name: '메뉴 삭제', type: 'API', resource: '/api/menus', action: 'DELETE' },
] as const

// ============================================
// 역할-권한 매핑 데이터 (Auth System)
// ============================================
const rolePermissions: { roleCode: string; permissionCodes: string[] }[] = [
  // SYSTEM_ADMIN: 모든 권한
  { roleCode: 'SYSTEM_ADMIN', permissionCodes: ['*'] },

  // SECURITY_ADMIN: 감사 로그, 보안 설정
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

  // OPERATION_ADMIN: 사용자/역할 관리 (보안 설정 제외)
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

  // PRODUCTION_MANAGER, QUALITY_MANAGER, EQUIPMENT_MANAGER: 기본 조회
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

  // USER: 최소 권한
  {
    roleCode: 'USER',
    permissionCodes: ['menu:read'],
  },
]

// ============================================
// 보안 설정 데이터 (Auth System)
// ============================================
const securitySettings = [
  // 비밀번호 정책
  { key: 'PASSWORD_MIN_LENGTH', value: '8', type: 'NUMBER', description: '비밀번호 최소 길이' },
  { key: 'PASSWORD_REQUIRE_UPPERCASE', value: 'true', type: 'BOOLEAN', description: '대문자 필수' },
  { key: 'PASSWORD_REQUIRE_LOWERCASE', value: 'true', type: 'BOOLEAN', description: '소문자 필수' },
  { key: 'PASSWORD_REQUIRE_NUMBER', value: 'true', type: 'BOOLEAN', description: '숫자 필수' },
  { key: 'PASSWORD_REQUIRE_SPECIAL', value: 'true', type: 'BOOLEAN', description: '특수문자 필수' },
  { key: 'PASSWORD_EXPIRY_DAYS', value: '90', type: 'NUMBER', description: '비밀번호 만료 기간(일)' },
  { key: 'PASSWORD_HISTORY_COUNT', value: '5', type: 'NUMBER', description: '비밀번호 재사용 금지 횟수' },

  // 계정 잠금 정책
  { key: 'MAX_LOGIN_ATTEMPTS', value: '5', type: 'NUMBER', description: '최대 로그인 실패 횟수' },
  { key: 'LOCKOUT_DURATION_MINUTES', value: '30', type: 'NUMBER', description: '계정 잠금 시간(분)' },

  // 세션 정책
  { key: 'SESSION_TIMEOUT_MINUTES', value: '30', type: 'NUMBER', description: '세션 타임아웃(분)' },
  { key: 'MAX_CONCURRENT_SESSIONS', value: '3', type: 'NUMBER', description: '최대 동시 세션 수' },
  { key: 'SESSION_WARNING_MINUTES', value: '5', type: 'NUMBER', description: '세션 만료 경고 시간(분)' },

  // 토큰 정책
  { key: 'ACCESS_TOKEN_EXPIRY_MINUTES', value: '15', type: 'NUMBER', description: 'Access Token 만료 시간(분)' },
  { key: 'REFRESH_TOKEN_EXPIRY_DAYS', value: '7', type: 'NUMBER', description: 'Refresh Token 만료 시간(일)' },

  // 감사 로그 정책
  { key: 'AUDIT_LOG_RETENTION_DAYS', value: '365', type: 'NUMBER', description: '감사 로그 보존 기간(일)' },
] as const

// ============================================
// 테스트 사용자 데이터 (Auth System)
// ============================================
const testUsers = [
  { email: 'admin@mes.local', name: '시스템 관리자', roleCode: 'SYSTEM_ADMIN', password: 'Admin123!' },
  { email: 'security@mes.local', name: '보안 관리자', roleCode: 'SECURITY_ADMIN', password: 'Security123!' },
  { email: 'operation@mes.local', name: '운영 관리자', roleCode: 'OPERATION_ADMIN', password: 'Operation123!' },
  { email: 'production@mes.local', name: '생산 관리자', roleCode: 'PRODUCTION_MANAGER', password: 'Production123!' },
  { email: 'user@mes.local', name: '일반 사용자', roleCode: 'USER', password: 'User123!' },
] as const

// ============================================
// 역할 및 사용자 시드 함수 (Auth System)
// ============================================
async function seedRolesAndUsers() {
  console.log('🔐 Seeding roles, permissions, and users...')

  // 1. 권한 생성
  console.log('  Creating permissions...')
  const createdPermissions = await Promise.all(
    permissions.map((perm) =>
      prisma.permission.upsert({
        where: { code: perm.code },
        update: { name: perm.name, type: perm.type, resource: perm.resource, action: perm.action },
        create: {
          code: perm.code,
          name: perm.name,
          type: perm.type,
          resource: perm.resource,
          action: perm.action,
        },
      })
    )
  )
  console.log(`  ✅ Created ${createdPermissions.length} permissions`)

  // 권한 코드 → ID 매핑
  const permMap = new Map(createdPermissions.map((p) => [p.code, p.id]))

  // 2. 역할 생성 (부모 역할 없는 것 먼저)
  console.log('  Creating roles...')
  const roleMap = new Map<string, number>()

  // 부모 없는 역할 먼저 생성
  for (const role of roles.filter((r) => r.parentCode === null)) {
    const created = await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description, level: role.level, isSystem: role.isSystem },
      create: {
        code: role.code,
        name: role.name,
        description: role.description,
        level: role.level,
        isSystem: role.isSystem,
      },
    })
    roleMap.set(role.code, created.id)
  }

  // 부모 있는 역할 생성
  for (const role of roles.filter((r) => r.parentCode !== null)) {
    const parentId = roleMap.get(role.parentCode!)
    const created = await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description, level: role.level, isSystem: role.isSystem, parentId },
      create: {
        code: role.code,
        name: role.name,
        description: role.description,
        level: role.level,
        isSystem: role.isSystem,
        parentId,
      },
    })
    roleMap.set(role.code, created.id)
  }
  console.log(`  ✅ Created ${roleMap.size} roles`)

  // 3. 역할-권한 매핑
  console.log('  Creating role-permission mappings...')
  for (const mapping of rolePermissions) {
    const roleId = roleMap.get(mapping.roleCode)
    if (!roleId) continue

    const permCodes = mapping.permissionCodes[0] === '*'
      ? permissions.map((p) => p.code)
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
  console.log(`  ✅ Created role-permission mappings`)

  // 4. 테스트 사용자 생성
  console.log('  Creating test users...')
  for (const user of testUsers) {
    const hashedPassword = await hashPassword(user.password)
    const roleId = roleMap.get(user.roleCode)
    if (!roleId) continue

    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        password: hashedPassword,
        name: user.name,
        mustChangePassword: false, // 테스트 사용자는 변경 불필요
      },
    })

    // UserRole 매핑
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: createdUser.id, roleId } },
      update: {},
      create: { userId: createdUser.id, roleId },
    })
  }
  console.log(`  ✅ Created ${testUsers.length} test users`)

  // 5. 보안 설정 생성
  console.log('  Creating security settings...')
  for (const setting of securitySettings) {
    await prisma.securitySetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, type: setting.type, description: setting.description },
      create: setting,
    })
  }
  console.log(`  ✅ Created ${securitySettings.length} security settings`)
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
    path: '/dashboard',
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
    path: '/production/work-order',
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
    path: '/production/result/entry',
    icon: 'EditOutlined',
    parentId: 12,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 14,
    code: 'PRODUCTION_HISTORY',
    name: '생산 이력 조회',
    path: '/production/result/history',
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
    path: '/sample/user-list',
    icon: 'UnorderedListOutlined',
    parentId: 20,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 22,
    code: 'SAMPLE_MASTER_DETAIL',
    name: '마스터-디테일',
    path: '/sample/master-detail',
    icon: 'SplitCellsOutlined',
    parentId: 20,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 23,
    code: 'SAMPLE_WIZARD',
    name: '설정 마법사',
    path: '/sample/wizard',
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
    path: '/system/users',
    icon: 'UserOutlined',
    parentId: 90,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 92,
    code: 'ROLE_MGMT',
    name: '역할 관리',
    path: '/system/roles',
    icon: 'TeamOutlined',
    parentId: 90,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 93,
    code: 'MENU_MGMT',
    name: '메뉴 관리',
    path: '/system/menus',
    icon: 'MenuOutlined',
    parentId: 90,
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 94,
    code: 'AUDIT_LOG',
    name: '감사 로그',
    path: '/system/audit-logs',
    icon: 'FileSearchOutlined',
    parentId: 90,
    sortOrder: 4,
    isActive: true,
  },

  // 테스트용 비활성 메뉴
  {
    id: 99,
    code: 'INACTIVE_MENU',
    name: '비활성 메뉴',
    path: '/inactive',
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
// 역할-메뉴 매핑 데이터 (Auth System)
// ============================================

/**
 * 역할별 메뉴 매핑 설정
 * - SYSTEM_ADMIN: 모든 메뉴 접근
 * - OPERATION_ADMIN: 대시보드, 생산 관리, 샘플 화면, 시스템 관리
 * - PRODUCTION_MANAGER: 대시보드, 생산 관리, 샘플 화면
 * - USER: 대시보드, 샘플 화면
 */
const roleMenuMappings: { roleCode: string; menuCodes: string[] }[] = [
  // SYSTEM_ADMIN - 모든 메뉴
  { roleCode: 'SYSTEM_ADMIN', menuCodes: ['*'] },

  // SECURITY_ADMIN - 시스템 관리 + 감사 로그
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

  // OPERATION_ADMIN - 대시보드, 생산, 샘플, 시스템 관리
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

  // PRODUCTION_MANAGER - 대시보드, 생산 관리, 샘플
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

  // USER - 대시보드, 샘플 화면
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
