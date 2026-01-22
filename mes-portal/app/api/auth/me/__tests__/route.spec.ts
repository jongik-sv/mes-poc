// Mock auth 함수 - 호이스팅을 위해 vi.fn() 직접 사용
const mockAuth = vi.fn()

vi.mock('@/auth', () => ({
  auth: () => mockAuth(),
}))

import { GET } from '../route'

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user info when authenticated', async () => {
    // Arrange
    mockAuth.mockResolvedValue({
      user: {
        id: '1',
        email: 'admin@test.com',
        name: '관리자',
        role: { id: 1, code: 'ADMIN', name: '시스템 관리자' },
      },
    })

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual({
      id: '1',
      email: 'admin@test.com',
      name: '관리자',
      role: { id: 1, code: 'ADMIN', name: '시스템 관리자' },
    })
  })

  it('should return 401 when not authenticated', async () => {
    // Arrange
    mockAuth.mockResolvedValue(null)

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 401 when session has no user', async () => {
    // Arrange
    mockAuth.mockResolvedValue({ user: null })

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })
})
