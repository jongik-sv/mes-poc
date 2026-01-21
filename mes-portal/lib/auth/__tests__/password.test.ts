import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '../password'

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
})
