import {
  hashPassword,
  verifyPassword,
  validatePasswordPolicy,
  isPasswordReused,
  isPasswordExpired,
  getDaysUntilPasswordExpiry,
  DEFAULT_PASSWORD_POLICY,
} from '../password'

describe('Password Utility', () => {
  describe('hashPassword', () => {
    it('UT-006: should generate bcrypt hash', async () => {
      const plainPassword = 'password123'
      const hashed = await hashPassword(plainPassword)

      // bcrypt 해시 형식 검증 ($2b$ 또는 $2a$ 접두사)
      expect(hashed).toMatch(/^\$2[aby]\$\d{2}\$/)

      // 원본과 다름
      expect(hashed).not.toBe(plainPassword)

      // 해시 길이 확인 (bcrypt는 60자)
      expect(hashed.length).toBe(60)
    })

    it('should generate different hashes for same password', async () => {
      const plainPassword = 'password123'
      const hash1 = await hashPassword(plainPassword)
      const hash2 = await hashPassword(plainPassword)

      // 동일 비밀번호도 다른 해시 생성 (salt가 다르므로)
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('UT-007: should verify correct password', async () => {
      const plainPassword = 'password123'
      const hashed = await hashPassword(plainPassword)

      const isValid = await verifyPassword(plainPassword, hashed)

      expect(isValid).toBe(true)
    })

    it('UT-008: should reject incorrect password', async () => {
      const plainPassword = 'password123'
      const wrongPassword = 'wrongpassword'
      const hashed = await hashPassword(plainPassword)

      const isValid = await verifyPassword(wrongPassword, hashed)

      expect(isValid).toBe(false)
    })

    it('should handle empty password', async () => {
      const plainPassword = 'password123'
      const hashed = await hashPassword(plainPassword)

      const isValid = await verifyPassword('', hashed)

      expect(isValid).toBe(false)
    })
  })

  describe('validatePasswordPolicy', () => {
    it('UT-009: 모든 규칙을 만족하는 비밀번호는 유효함', () => {
      const result = validatePasswordPolicy('ValidPass123!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('UT-010: 최소 길이 미충족 시 에러 반환', () => {
      const result = validatePasswordPolicy('Va1!', {
        ...DEFAULT_PASSWORD_POLICY,
        minLength: 8,
      })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('비밀번호는 최소 8자 이상이어야 합니다.')
    })

    it('UT-011: 대문자 누락 시 에러 반환', () => {
      const result = validatePasswordPolicy('validpass123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('대문자를 포함해야 합니다.')
    })

    it('UT-012: 소문자 누락 시 에러 반환', () => {
      const result = validatePasswordPolicy('VALIDPASS123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('소문자를 포함해야 합니다.')
    })

    it('UT-013: 숫자 누락 시 에러 반환', () => {
      const result = validatePasswordPolicy('ValidPassword!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('숫자를 포함해야 합니다.')
    })

    it('UT-014: 특수문자 누락 시 에러 반환', () => {
      const result = validatePasswordPolicy('ValidPass123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('특수문자를 포함해야 합니다.')
    })

    it('UT-015: 여러 규칙 미충족 시 모든 에러 반환', () => {
      const result = validatePasswordPolicy('short')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })

    it('UT-016: 정책 비활성화 시 해당 규칙 무시', () => {
      const result = validatePasswordPolicy('simple', {
        minLength: 4,
        requireUppercase: false,
        requireLowercase: true,
        requireNumber: false,
        requireSpecial: false,
      })
      expect(result.isValid).toBe(true)
    })
  })

  describe('isPasswordReused', () => {
    it('UT-017: 이전에 사용한 비밀번호는 재사용 불가', async () => {
      const oldPasswordHash = await hashPassword('OldPassword123!')
      const result = await isPasswordReused('OldPassword123!', [oldPasswordHash])
      expect(result).toBe(true)
    })

    it('UT-018: 새로운 비밀번호는 사용 가능', async () => {
      const oldPasswordHash = await hashPassword('OldPassword123!')
      const result = await isPasswordReused('NewPassword456!', [oldPasswordHash])
      expect(result).toBe(false)
    })

    it('UT-019: 빈 이력에서는 항상 사용 가능', async () => {
      const result = await isPasswordReused('AnyPassword123!', [])
      expect(result).toBe(false)
    })

    it('UT-020: 여러 이력 중 하나라도 일치하면 재사용 불가', async () => {
      const history = await Promise.all([
        hashPassword('Password1!'),
        hashPassword('Password2!'),
        hashPassword('Password3!'),
      ])
      const result = await isPasswordReused('Password2!', history)
      expect(result).toBe(true)
    })
  })

  describe('isPasswordExpired', () => {
    it('UT-021: 만료 기간이 지나면 true 반환', () => {
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 100) // 100일 전
      const result = isPasswordExpired(oldDate, 90)
      expect(result).toBe(true)
    })

    it('UT-022: 만료 기간 내이면 false 반환', () => {
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 30) // 30일 전
      const result = isPasswordExpired(recentDate, 90)
      expect(result).toBe(false)
    })
  })

  describe('getDaysUntilPasswordExpiry', () => {
    it('UT-023: 남은 일수 정확히 계산', () => {
      const date = new Date()
      date.setDate(date.getDate() - 80) // 80일 전
      const result = getDaysUntilPasswordExpiry(date, 90)
      expect(result).toBe(10) // 90 - 80 = 10
    })

    it('UT-024: 이미 만료된 경우 음수 반환', () => {
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 100) // 100일 전
      const result = getDaysUntilPasswordExpiry(oldDate, 90)
      expect(result).toBeLessThan(0)
    })

    it('UT-025: 오늘 변경한 경우 전체 기간 반환', () => {
      const today = new Date()
      const result = getDaysUntilPasswordExpiry(today, 90)
      expect(result).toBeGreaterThanOrEqual(89)
      expect(result).toBeLessThanOrEqual(90)
    })
  })
})
