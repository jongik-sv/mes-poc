/**
 * TSK-04-01: 감사 로그 생성 함수 테스트
 *
 * 테스트 케이스:
 * - UT-01: createAuditLog 정상 생성
 * - UT-02: createAuditLog userId null 처리
 * - UT-03: createAuditLog details JSON 직렬화
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted를 사용하여 호이스팅 문제 해결
const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn().mockResolvedValue({ id: 1 }),
}))

// prisma 모킹
vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: mockCreate,
    },
  },
}))

import { createAuditLog, type AuditAction } from '../audit-logger'

describe('createAuditLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockResolvedValue({ id: 1 })
  })

  describe('UT-01: createAuditLog 정상 생성', () => {
    it('모든 필드가 정상적으로 저장된다', async () => {
      const params = {
        userId: 1,
        action: 'LOGIN' as AuditAction,
        resource: 'session',
        resourceId: 'session-123',
        details: { browser: 'Chrome', os: 'Windows' },
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        status: 'SUCCESS' as const,
      }

      await createAuditLog(params)

      expect(mockCreate).toHaveBeenCalledTimes(1)
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 1,
          action: 'LOGIN',
          resource: 'session',
          resourceId: 'session-123',
          details: JSON.stringify({ browser: 'Chrome', os: 'Windows' }),
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          status: 'SUCCESS',
        }),
      })
    })
  })

  describe('UT-02: createAuditLog userId null 처리', () => {
    it('인증 실패 등 userId가 없는 경우 null로 저장된다', async () => {
      const params = {
        userId: null,
        action: 'LOGIN_FAILED' as AuditAction,
        details: { email: 'unknown@test.com', reason: 'USER_NOT_FOUND' },
        ip: '192.168.1.1',
        status: 'FAILURE' as const,
        errorMessage: '사용자를 찾을 수 없습니다',
      }

      await createAuditLog(params)

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: null,
          action: 'LOGIN_FAILED',
          status: 'FAILURE',
          errorMessage: '사용자를 찾을 수 없습니다',
        }),
      })
    })

    it('userId가 undefined인 경우도 null로 처리된다', async () => {
      const params = {
        action: 'LOGIN_FAILED' as AuditAction,
        status: 'FAILURE' as const,
      }

      await createAuditLog(params)

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: null,
        }),
      })
    })
  })

  describe('UT-03: createAuditLog details JSON 직렬화', () => {
    it('details 객체가 JSON 문자열로 저장된다', async () => {
      const complexDetails = {
        changes: {
          name: { from: 'Old Name', to: 'New Name' },
          department: { from: 'A팀', to: 'B팀' },
        },
        modifiedFields: ['name', 'department'],
      }

      const params = {
        userId: 1,
        action: 'USER_UPDATED' as AuditAction,
        resource: 'user',
        resourceId: '2',
        details: complexDetails,
        status: 'SUCCESS' as const,
      }

      await createAuditLog(params)

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          details: JSON.stringify(complexDetails),
        }),
      })
    })

    it('details가 undefined인 경우 null로 저장된다', async () => {
      const params = {
        userId: 1,
        action: 'LOGOUT' as AuditAction,
        status: 'SUCCESS' as const,
      }

      await createAuditLog(params)

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          details: null,
        }),
      })
    })

    it('details가 빈 객체인 경우 JSON 문자열로 저장된다', async () => {
      const params = {
        userId: 1,
        action: 'LOGOUT' as AuditAction,
        details: {},
        status: 'SUCCESS' as const,
      }

      await createAuditLog(params)

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          details: '{}',
        }),
      })
    })
  })

  describe('에러 처리', () => {
    it('데이터베이스 오류 시 에러를 throw하지 않고 로깅한다', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockCreate.mockRejectedValueOnce(new Error('DB Error'))

      const params = {
        userId: 1,
        action: 'LOGIN' as AuditAction,
        status: 'SUCCESS' as const,
      }

      // 에러가 throw되지 않아야 함 (감사 로그 실패로 인한 시스템 중단 방지)
      await expect(createAuditLog(params)).resolves.not.toThrow()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})
