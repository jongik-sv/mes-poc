/**
 * Prisma 시드 데이터 (TSK-03-01)
 *
 * 초기 메뉴 데이터 생성
 */

import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../lib/generated/prisma/client'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

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

async function main() {
  console.log('🌱 Seeding database...')

  // 기존 메뉴 데이터 삭제 (순서 중요: 자식 먼저)
  await prisma.menu.deleteMany({})

  // 메뉴 데이터 생성
  for (const menu of menus) {
    await prisma.menu.create({
      data: menu,
    })
  }

  console.log(`✅ Created ${menus.length} menus`)
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
