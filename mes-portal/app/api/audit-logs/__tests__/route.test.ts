/**
 * TSK-04-01: 감사 로그 API 통합 테스트
 *
 * 테스트 케이스:
 * - IT-01: 감사 로그 목록 조회 (페이징/정렬)
 * - IT-02: 날짜 필터 조회
 * - IT-03: 액션 필터 조회 (복수)
 * - IT-04: 상세 조회
 * - IT-06: 권한 없이 접근
 * - IT-09: 잘못된 파라미터
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock 데이터
const mockAuditLogs = [
  {
    id: 1,
    userId: 1,
    action: 'LOGIN',
    resource: 'session',
    resourceId: null,
    details: null,
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    status: 'SUCCESS',
    errorMessage: null,
    createdAt: new Date('2026-01-26T10:00:00Z'),
    user: { id: 1, name: '관리자', email: 'admin@test.com' },
  },
  {
    id: 2,
    userId: 1,
    action: 'LOGOUT',
    resource: 'session',
    resourceId: null,
    details: null,
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    status: 'SUCCESS',
    errorMessage: null,
    createdAt: new Date('2026-01-26T12:00:00Z'),
    user: { id: 1, name: '관리자', email: 'admin@test.com' },
  },
  {
    id: 3,
    userId: null,
    action: 'LOGIN_FAILED',
    resource: 'session',
    resourceId: null,
    details: '{"email":"unknown@test.com"}',
    ip: '192.168.1.2',
    userAgent: 'Mozilla/5.0',
    status: 'FAILURE',
    errorMessage: '사용자를 찾을 수 없습니다',
    createdAt: new Date('2026-01-26T11:00:00Z'),
    user: null,
  },
]

// vi.hoisted를 사용하여 호이스팅 문제 해결
const { mockFindMany, mockFindUnique, mockCount } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockFindUnique: vi.fn(),
  mockCount: vi.fn(),
}))

// Prisma 모킹
vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      count: mockCount,
    },
  },
}))

// 실제 API 핸들러 import (모킹 후)
import { GET } from '../route'

describe('GET /api/audit-logs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindMany.mockResolvedValue(mockAuditLogs)
    mockCount.mockResolvedValue(mockAuditLogs.length)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('IT-01: 감사 로그 목록 조회 (페이징/정렬)', () => {
    it('기본 페이지로 감사 로그 목록을 조회한다', async () => {
      const request = new NextRequest('http://localhost/api/audit-logs')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeInstanceOf(Array)
      expect(data.pagination).toBeDefined()
      expect(data.pagination.page).toBe(1)
      expect(data.pagination.pageSize).toBe(20)
    })

    it('페이징 파라미터로 특정 페이지를 조회한다', async () => {
      const request = new NextRequest(
        'http://localhost/api/audit-logs?page=2&pageSize=10'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page - 1) * pageSize = (2-1) * 10
          take: 10,
        })
      )
    })

    it('createdAt 기준 내림차순으로 정렬된다', async () => {
      const request = new NextRequest('http://localhost/api/audit-logs')

      await GET(request)

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      )
    })
  })

  describe('IT-02: 날짜 필터 조회', () => {
    it('startDate와 endDate로 기간 필터링한다', async () => {
      const request = new NextRequest(
        'http://localhost/api/audit-logs?startDate=2026-01-01T00:00:00Z&endDate=2026-01-31T23:59:59Z'
      )

      await GET(request)

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      )
    })

    it('startDate만 제공된 경우 해당 날짜 이후만 조회한다', async () => {
      const request = new NextRequest(
        'http://localhost/api/audit-logs?startDate=2026-01-26T00:00:00Z'
      )

      await GET(request)

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        })
      )
    })
  })

  describe('IT-03: 액션 필터 조회 (복수)', () => {
    it('단일 액션으로 필터링한다', async () => {
      const request = new NextRequest(
        'http://localhost/api/audit-logs?action=LOGIN'
      )

      await GET(request)

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            action: { in: ['LOGIN'] },
          }),
        })
      )
    })

    it('복수 액션으로 필터링한다', async () => {
      const request = new NextRequest(
        'http://localhost/api/audit-logs?action=LOGIN,LOGOUT,LOGIN_FAILED'
      )

      await GET(request)

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            action: { in: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED'] },
          }),
        })
      )
    })
  })

  describe('IT-09: 잘못된 파라미터', () => {
    it('페이지 크기가 100을 초과하면 400 에러를 반환한다', async () => {
      const request = new NextRequest(
        'http://localhost/api/audit-logs?pageSize=200'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('pageSize')
    })

    it('잘못된 날짜 형식은 400 에러를 반환한다', async () => {
      const request = new NextRequest(
        'http://localhost/api/audit-logs?startDate=invalid-date'
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })
})

describe('GET /api/audit-logs/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('IT-04: 상세 조회', () => {
    it('존재하는 감사 로그의 상세 정보를 조회한다', async () => {
      const mockLog = {
        ...mockAuditLogs[0],
        details: '{"browser":"Chrome"}',
      }
      mockFindUnique.mockResolvedValue(mockLog)

      // 상세 조회 핸들러 import
      const { GET: getDetail } = await import('../[id]/route')

      const request = new NextRequest('http://localhost/api/audit-logs/1')

      const response = await getDetail(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe(1)
      expect(data.data.user).toBeDefined()
    })

    it('존재하지 않는 ID는 404 에러를 반환한다', async () => {
      mockFindUnique.mockResolvedValue(null)

      const { GET: getDetail } = await import('../[id]/route')

      const request = new NextRequest('http://localhost/api/audit-logs/999')

      const response = await getDetail(request, { params: Promise.resolve({ id: '999' }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
    })
  })
})
