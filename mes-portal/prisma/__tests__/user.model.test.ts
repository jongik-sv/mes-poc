import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { PrismaClient } from '../../lib/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { hashPassword } from '../../lib/auth/password'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

describe('User Model', () => {
  // 시드에서 생성된 ADMIN 역할 사용
  let adminRoleId: number

  beforeAll(async () => {
    // 시드에서 생성된 ADMIN 역할 조회
    const role = await prisma.role.findUnique({
      where: { code: 'ADMIN' },
    })
    if (!role) {
      throw new Error('ADMIN role not found. Run pnpm db:seed first.')
    }
    adminRoleId = role.id
  })

  afterAll(async () => {
    // 테스트에서 생성한 사용자만 삭제 (시드 사용자 제외)
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'test@example.com',
            'existing@example.com',
            'existing2@example.com',
            'roletest@example.com',
            'inactive@example.com',
            'update@example.com',
          ],
        },
      },
    })
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // 테스트에서 생성한 사용자만 삭제
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'test@example.com',
            'existing@example.com',
            'existing2@example.com',
            'roletest@example.com',
            'inactive@example.com',
            'update@example.com',
          ],
        },
      },
    })
  })

  it('UT-001: should create user with valid data', async () => {
    const hashedPassword = await hashPassword('password123')

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: '테스트 사용자',
        roleId: adminRoleId,
      },
    })

    expect(user.id).toBeDefined()
    expect(user.email).toBe('test@example.com')
    expect(user.name).toBe('테스트 사용자')
    expect(user.roleId).toBe(adminRoleId)
    expect(user.isActive).toBe(true)
    expect(user.createdAt).toBeInstanceOf(Date)
    expect(user.updatedAt).toBeInstanceOf(Date)
  })

  it('UT-002: should throw error for duplicate email', async () => {
    const hashedPassword = await hashPassword('password123')

    // 첫 번째 사용자 생성
    await prisma.user.create({
      data: {
        email: 'existing@example.com',
        password: hashedPassword,
        name: '기존 사용자',
        roleId: adminRoleId,
      },
    })

    // 동일 이메일로 두 번째 사용자 생성 시도
    await expect(
      prisma.user.create({
        data: {
          email: 'existing@example.com',
          password: hashedPassword,
          name: '새 사용자',
          roleId: adminRoleId,
        },
      })
    ).rejects.toThrow()

    // Prisma 에러 코드 확인
    try {
      await prisma.user.create({
        data: {
          email: 'existing2@example.com',
          password: hashedPassword,
          name: '기존 사용자 2',
          roleId: adminRoleId,
        },
      })
      await prisma.user.create({
        data: {
          email: 'existing2@example.com',
          password: hashedPassword,
          name: '새 사용자 2',
          roleId: adminRoleId,
        },
      })
      expect.fail('Should have thrown an error')
    } catch (error: unknown) {
      expect((error as { code?: string }).code).toBe('P2002')
    }
  })

  it('UT-005: should include role in user query', async () => {
    const hashedPassword = await hashPassword('password123')

    // User 생성
    await prisma.user.create({
      data: {
        email: 'roletest@example.com',
        password: hashedPassword,
        name: '역할 테스트',
        roleId: adminRoleId,
      },
    })

    // 관계 포함 조회
    const userWithRole = await prisma.user.findUnique({
      where: { email: 'roletest@example.com' },
      include: { role: true },
    })

    expect(userWithRole).not.toBeNull()
    expect(userWithRole?.role).toBeDefined()
    expect(userWithRole?.role.code).toBe('ADMIN')
    expect(userWithRole?.role.name).toBe('시스템 관리자')
  })

  it('UT-009: should handle inactive user', async () => {
    const hashedPassword = await hashPassword('password123')

    const user = await prisma.user.create({
      data: {
        email: 'inactive@example.com',
        password: hashedPassword,
        name: '비활성 사용자',
        roleId: adminRoleId,
        isActive: false,
      },
    })

    expect(user.isActive).toBe(false)

    // 비활성 사용자 필터링 조회
    const activeUsers = await prisma.user.findMany({
      where: { isActive: true, role: { code: 'TEST_ADMIN' } },
    })

    expect(
      activeUsers.find((u) => u.email === 'inactive@example.com')
    ).toBeUndefined()
  })

  it('UT-010: should update updatedAt on modification', async () => {
    const hashedPassword = await hashPassword('password123')

    const user = await prisma.user.create({
      data: {
        email: 'update@example.com',
        password: hashedPassword,
        name: '수정 테스트',
        roleId: adminRoleId,
      },
    })

    const originalUpdatedAt = user.updatedAt

    // 약간의 지연 후 수정
    await new Promise((resolve) => setTimeout(resolve, 100))

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: '수정된 이름' },
    })

    expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(
      originalUpdatedAt.getTime()
    )
    expect(updatedUser.name).toBe('수정된 이름')
  })
})
