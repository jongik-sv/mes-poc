import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import { PrismaClient } from '../../lib/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { hashPassword } from '../../lib/auth/password'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

describe('Role Model', () => {
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { role: { code: { startsWith: 'TEST_' } } },
    })
    await prisma.role.deleteMany({
      where: { code: { startsWith: 'TEST_' } },
    })
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: { role: { code: { startsWith: 'TEST_' } } },
    })
    await prisma.role.deleteMany({
      where: { code: { startsWith: 'TEST_' } },
    })
  })

  it('UT-003: should create role with valid data', async () => {
    const role = await prisma.role.create({
      data: {
        code: 'TEST_OPERATOR',
        name: '테스트 작업자',
      },
    })

    expect(role.id).toBeDefined()
    expect(role.code).toBe('TEST_OPERATOR')
    expect(role.name).toBe('테스트 작업자')
    expect(role.createdAt).toBeInstanceOf(Date)
  })

  it('UT-004: should throw error for duplicate code', async () => {
    // 첫 번째 역할 생성
    await prisma.role.create({
      data: { code: 'TEST_ADMIN', name: '테스트 관리자' },
    })

    // 동일 코드로 두 번째 역할 생성 시도
    try {
      await prisma.role.create({
        data: { code: 'TEST_ADMIN', name: '다른 관리자' },
      })
      expect.fail('Should have thrown an error')
    } catch (error: unknown) {
      expect((error as { code?: string }).code).toBe('P2002')
    }
  })

  it('UT-011: should include users in role query', async () => {
    const hashedPassword = await hashPassword('password123')

    // Role 생성
    const role = await prisma.role.create({
      data: { code: 'TEST_WORKER', name: '테스트 작업자' },
    })

    // 해당 Role의 User 2명 생성
    await prisma.user.create({
      data: {
        email: 'testop1@example.com',
        password: hashedPassword,
        name: '작업자1',
        roleId: role.id,
      },
    })
    await prisma.user.create({
      data: {
        email: 'testop2@example.com',
        password: hashedPassword,
        name: '작업자2',
        roleId: role.id,
      },
    })

    // 관계 포함 조회
    const roleWithUsers = await prisma.role.findUnique({
      where: { code: 'TEST_WORKER' },
      include: { users: true },
    })

    expect(roleWithUsers).not.toBeNull()
    expect(roleWithUsers?.users).toHaveLength(2)
    expect(roleWithUsers?.users.map((u) => u.email)).toContain(
      'testop1@example.com'
    )
    expect(roleWithUsers?.users.map((u) => u.email)).toContain(
      'testop2@example.com'
    )
  })
})
