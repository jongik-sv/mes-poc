import { PrismaClient } from '../../lib/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { verifyPassword } from '../../lib/auth/password'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

describe('Seed Script', () => {
  beforeAll(async () => {
    // 시드가 이미 실행되어 있다고 가정 (pnpm db:seed)
    // 실제 환경에서는 시드 함수를 직접 호출할 수 있음
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Role Seed', () => {
    it('IT-001: should create default roles', async () => {
      const roles = await prisma.role.findMany({
        orderBy: { id: 'asc' },
      })

      const roleCodes = roles.map((r) => r.code)
      expect(roleCodes).toContain('ADMIN')
      expect(roleCodes).toContain('MANAGER')
      expect(roleCodes).toContain('OPERATOR')

      // 역할 이름 확인
      const adminRole = roles.find((r) => r.code === 'ADMIN')
      expect(adminRole?.name).toBe('시스템 관리자')

      const managerRole = roles.find((r) => r.code === 'MANAGER')
      expect(managerRole?.name).toBe('생산 관리자')

      const operatorRole = roles.find((r) => r.code === 'OPERATOR')
      expect(operatorRole?.name).toBe('현장 작업자')
    })
  })

  describe('User Seed', () => {
    it('IT-002: should create admin user', async () => {
      const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@example.com' },
        include: { role: true },
      })

      expect(adminUser).not.toBeNull()
      expect(adminUser?.name).toBe('관리자')
      expect(adminUser?.role.code).toBe('ADMIN')
      expect(adminUser?.isActive).toBe(true)
    })

    it('IT-003: should store hashed passwords', async () => {
      const users = await prisma.user.findMany({
        where: {
          email: {
            in: [
              'admin@example.com',
              'manager@example.com',
              'operator@example.com',
            ],
          },
        },
      })

      for (const user of users) {
        // bcrypt 해시 형식 검증 ($2b$ 또는 $2a$ 접두사)
        expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$/)

        // 평문 비밀번호가 아님
        expect(user.password).not.toBe('password123')

        // 해시 길이 60자
        expect(user.password.length).toBe(60)

        // 실제 비밀번호 검증
        const isValid = await verifyPassword('password123', user.password)
        expect(isValid).toBe(true)
      }
    })

    it('IT-005: should map test users to roles', async () => {
      // 관리자 - ADMIN 역할
      const admin = await prisma.user.findUnique({
        where: { email: 'admin@example.com' },
        include: { role: true },
      })
      expect(admin?.role.code).toBe('ADMIN')

      // 생산관리자 - MANAGER 역할
      const manager = await prisma.user.findUnique({
        where: { email: 'manager@example.com' },
        include: { role: true },
      })
      expect(manager?.role.code).toBe('MANAGER')

      // 작업자 - OPERATOR 역할
      const operator = await prisma.user.findUnique({
        where: { email: 'operator@example.com' },
        include: { role: true },
      })
      expect(operator?.role.code).toBe('OPERATOR')
    })
  })

  describe('Seed Idempotency', () => {
    it('IT-004: should handle duplicate seed execution', async () => {
      // 역할 중복 없음 확인
      const roles = await prisma.role.findMany({
        where: {
          code: { in: ['ADMIN', 'MANAGER', 'OPERATOR'] },
        },
      })

      // 각 역할 코드가 정확히 1개씩만 존재해야 함
      const adminCount = roles.filter((r) => r.code === 'ADMIN').length
      const managerCount = roles.filter((r) => r.code === 'MANAGER').length
      const operatorCount = roles.filter((r) => r.code === 'OPERATOR').length

      expect(adminCount).toBe(1)
      expect(managerCount).toBe(1)
      expect(operatorCount).toBe(1)

      // 사용자 중복 없음 확인
      const users = await prisma.user.findMany({
        where: {
          email: {
            in: [
              'admin@example.com',
              'manager@example.com',
              'operator@example.com',
            ],
          },
        },
      })

      const adminUserCount = users.filter(
        (u) => u.email === 'admin@example.com'
      ).length
      const managerUserCount = users.filter(
        (u) => u.email === 'manager@example.com'
      ).length
      const operatorUserCount = users.filter(
        (u) => u.email === 'operator@example.com'
      ).length

      expect(adminUserCount).toBe(1)
      expect(managerUserCount).toBe(1)
      expect(operatorUserCount).toBe(1)
    })
  })
})
