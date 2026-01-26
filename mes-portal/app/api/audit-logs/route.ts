/**
 * TSK-04-01: 감사 로그 목록 조회 API
 *
 * GET /api/audit-logs
 * - 필터링: userId, action, resource, status, startDate, endDate, ip
 * - 페이징: page, pageSize (최대 100)
 * - 정렬: createdAt DESC
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/generated/prisma'

interface AuditLogQuery {
  page: number
  pageSize: number
  userId?: number
  action?: string[]
  resource?: string
  status?: 'SUCCESS' | 'FAILURE'
  startDate?: Date
  endDate?: Date
  ip?: string
}

function parseQueryParams(request: NextRequest): AuditLogQuery | { error: string } {
  const searchParams = request.nextUrl.searchParams

  // 페이지 파라미터
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)

  // 페이지 크기 검증 (BR-04)
  if (pageSize > 100) {
    return { error: 'pageSize는 100을 초과할 수 없습니다' }
  }

  if (page < 1 || isNaN(page)) {
    return { error: 'page는 1 이상이어야 합니다' }
  }

  if (pageSize < 1 || isNaN(pageSize)) {
    return { error: 'pageSize는 1 이상이어야 합니다' }
  }

  const query: AuditLogQuery = { page, pageSize }

  // userId 필터
  const userIdStr = searchParams.get('userId')
  if (userIdStr) {
    const userId = parseInt(userIdStr, 10)
    if (isNaN(userId)) {
      return { error: '유효하지 않은 userId입니다' }
    }
    query.userId = userId
  }

  // action 필터 (쉼표 구분 복수 가능)
  const actionStr = searchParams.get('action')
  if (actionStr) {
    query.action = actionStr.split(',').map((a) => a.trim())
  }

  // resource 필터
  const resource = searchParams.get('resource')
  if (resource) {
    query.resource = resource
  }

  // status 필터
  const status = searchParams.get('status')
  if (status) {
    if (status !== 'SUCCESS' && status !== 'FAILURE') {
      return { error: 'status는 SUCCESS 또는 FAILURE여야 합니다' }
    }
    query.status = status
  }

  // 날짜 필터
  const startDateStr = searchParams.get('startDate')
  if (startDateStr) {
    const startDate = new Date(startDateStr)
    if (isNaN(startDate.getTime())) {
      return { error: '유효하지 않은 startDate 형식입니다' }
    }
    query.startDate = startDate
  }

  const endDateStr = searchParams.get('endDate')
  if (endDateStr) {
    const endDate = new Date(endDateStr)
    if (isNaN(endDate.getTime())) {
      return { error: '유효하지 않은 endDate 형식입니다' }
    }
    query.endDate = endDate
  }

  // ip 필터
  const ip = searchParams.get('ip')
  if (ip) {
    query.ip = ip
  }

  return query
}

function buildWhereClause(query: AuditLogQuery): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {}

  if (query.userId !== undefined) {
    where.userId = query.userId
  }

  if (query.action && query.action.length > 0) {
    where.action = { in: query.action }
  }

  if (query.resource) {
    where.resource = query.resource
  }

  if (query.status) {
    where.status = query.status
  }

  if (query.ip) {
    where.ip = query.ip
  }

  // 날짜 필터
  if (query.startDate || query.endDate) {
    where.createdAt = {}
    if (query.startDate) {
      where.createdAt.gte = query.startDate
    }
    if (query.endDate) {
      where.createdAt.lte = query.endDate
    }
  }

  return where
}

export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 파싱
    const queryResult = parseQueryParams(request)
    if ('error' in queryResult) {
      return NextResponse.json(
        { success: false, error: queryResult.error },
        { status: 400 }
      )
    }

    const query = queryResult
    const where = buildWhereClause(query)

    // 데이터 조회
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.auditLog.count({ where }),
    ])

    // 응답 데이터 변환
    const data = logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      userName: log.user?.name ?? null,
      userEmail: log.user?.email ?? null,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      details: log.details ? JSON.parse(log.details) : null,
      ip: log.ip,
      userAgent: log.userAgent,
      status: log.status,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    })
  } catch (error) {
    console.error('[AuditLogs] GET error:', error)
    return NextResponse.json(
      { success: false, error: '감사 로그 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
