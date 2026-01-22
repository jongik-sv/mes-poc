import type { Mock } from 'vitest'

// Mock 설정 - vi.fn()을 팩토리 내부에서 직접 사용
vi.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
  compare: vi.fn(),
  hash: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

// Mock된 모듈 import
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { authorizeCredentials, jwtCallback, sessionCallback } from '../auth.config'

// Mock 함수 참조 (import 이후에 가져옴)
const mockBcryptCompare = bcrypt.compare as Mock
const mockBcryptHash = bcrypt.hash as Mock
const mockUserFindUnique = prisma.user.findUnique as Mock

// Mock 데이터
const mockAdminRole = {
  id: 1,
  code: 'ADMIN',
  name: '시스템 관리자',
  createdAt: new Date(),
}

const mockUserRole = {
  id: 2,
  code: 'USER',
  name: '일반 사용자',
  createdAt: new Date(),
}

const mockAdminUser = {
  id: 1,
  email: 'admin@test.com',
  password: '$2b$10$hashedpassword',
  name: '관리자',
  roleId: 1,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  role: mockAdminRole,
}

const mockInactiveUser = {
  id: 3,
  email: 'inactive@test.com',
  password: '$2b$10$hashedpassword',
  name: '비활성 사용자',
  roleId: 2,
  isActive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  role: mockUserRole,
}

describe('authorizeCredentials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // UT-001: 정상 로그인
  it('should return user object with valid credentials', async () => {
    // Arrange
    ;mockUserFindUnique.mockResolvedValue(mockAdminUser)
    ;mockBcryptCompare.mockResolvedValue(true)

    const credentials = { email: 'admin@test.com', password: 'test1234' }

    // Act
    const result = await authorizeCredentials(credentials)

    // Assert
    expect(result).toEqual({
      id: '1',
      email: 'admin@test.com',
      name: '관리자',
      role: { id: 1, code: 'ADMIN', name: '시스템 관리자' },
    })
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@test.com' },
      include: { role: true },
    })
    expect(bcrypt.compare).toHaveBeenCalledWith('test1234', mockAdminUser.password)
  })

  // UT-002: 존재하지 않는 이메일
  it('should return null for non-existent email', async () => {
    // Arrange
    ;mockUserFindUnique.mockResolvedValue(null)

    const credentials = { email: 'notexist@test.com', password: 'test1234' }

    // Act
    const result = await authorizeCredentials(credentials)

    // Assert
    expect(result).toBeNull()
    expect(bcrypt.compare).not.toHaveBeenCalled()
  })

  // UT-003: 잘못된 비밀번호
  it('should return null for invalid password', async () => {
    // Arrange
    ;mockUserFindUnique.mockResolvedValue(mockAdminUser)
    ;mockBcryptCompare.mockResolvedValue(false)

    const credentials = { email: 'admin@test.com', password: 'wrongpassword' }

    // Act
    const result = await authorizeCredentials(credentials)

    // Assert
    expect(result).toBeNull()
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockAdminUser.password)
  })

  // UT-004: 비활성화된 계정
  it('should return null for inactive user', async () => {
    // Arrange
    ;mockUserFindUnique.mockResolvedValue(mockInactiveUser)

    const credentials = { email: 'inactive@test.com', password: 'test1234' }

    // Act
    const result = await authorizeCredentials(credentials)

    // Assert
    expect(result).toBeNull()
    expect(bcrypt.compare).not.toHaveBeenCalled()
  })

  // UT-005: 이메일 미입력
  it('should return null when email is missing', async () => {
    // Arrange
    const credentials = { email: '', password: 'test1234' }

    // Act
    const result = await authorizeCredentials(credentials)

    // Assert
    expect(result).toBeNull()
    expect(prisma.user.findUnique).not.toHaveBeenCalled()
  })

  // UT-006: 비밀번호 미입력
  it('should return null when password is missing', async () => {
    // Arrange
    const credentials = { email: 'admin@test.com', password: '' }

    // Act
    const result = await authorizeCredentials(credentials)

    // Assert
    expect(result).toBeNull()
    expect(prisma.user.findUnique).not.toHaveBeenCalled()
  })

  // UT-005/006 추가: undefined 케이스
  it('should return null when credentials are undefined', async () => {
    // Arrange & Act
    const result1 = await authorizeCredentials({ email: undefined as unknown as string, password: 'test1234' })
    const result2 = await authorizeCredentials({ email: 'admin@test.com', password: undefined as unknown as string })

    // Assert
    expect(result1).toBeNull()
    expect(result2).toBeNull()
    expect(prisma.user.findUnique).not.toHaveBeenCalled()
  })
})

describe('JWT Callback', () => {
  // UT-007: 로그인 시 토큰에 사용자 정보 포함
  it('should add user info to token on login', async () => {
    // Arrange
    const token = {}
    const user = {
      id: '1',
      email: 'admin@test.com',
      name: '관리자',
      role: { id: 1, code: 'ADMIN', name: '시스템 관리자' },
    }

    // Act
    const result = await jwtCallback({ token, user })

    // Assert
    expect(result.id).toBe('1')
    expect(result.role).toEqual({ id: 1, code: 'ADMIN', name: '시스템 관리자' })
  })

  it('should preserve existing token without user', async () => {
    // Arrange
    const token = {
      id: '1',
      role: { id: 1, code: 'ADMIN', name: '시스템 관리자' },
    }

    // Act
    const result = await jwtCallback({ token, user: undefined })

    // Assert
    expect(result.id).toBe('1')
    expect(result.role).toEqual({ id: 1, code: 'ADMIN', name: '시스템 관리자' })
  })
})

describe('Session Callback', () => {
  // UT-008: 세션에 사용자 정보 포함
  it('should add user info to session from token', async () => {
    // Arrange
    const session = {
      user: { id: '', email: '', name: '', role: { id: 0, code: '', name: '' } },
      expires: new Date().toISOString(),
    }
    const token = {
      id: '1',
      role: { id: 1, code: 'ADMIN', name: '시스템 관리자' },
    }

    // Act
    const result = await sessionCallback({ session, token })

    // Assert
    expect(result.user.id).toBe('1')
    expect(result.user.role).toEqual({ id: 1, code: 'ADMIN', name: '시스템 관리자' })
  })
})
