/**
 * TSK-04-01: 감사 로그 CSV 내보내기 API
 *
 * GET /api/audit-logs/export
 * - 감사 로그를 CSV 형식으로 내보내기
 * - 필터 파라미터 지원 (목록 조회와 동일)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/generated/prisma/client'

interface ExportQuery {
  userId?: string
  action?: string[]
  resource?: string
  status?: 'SUCCESS' | 'FAILURE'
  startDate?: Date
  endDate?: Date
  ip?: string
}

function parseExportParams(request: NextRequest): ExportQuery | { error: string } {
  const searchParams = request.nextUrl.searchParams
  const query: ExportQuery = {}

  // userId 필터
  const userIdStr = searchParams.get('userId')
  if (userIdStr) {
    query.userId = userIdStr
  }

  // action 필터
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

function buildWhereClause(query: ExportQuery): Prisma.AuditLogWhereInput {
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

function escapeCSVField(field: string | null | undefined): string {
  if (field === null || field === undefined) {
    return ''
  }
  // 쌍따옴표, 쉼표, 개행이 포함된 경우 이스케이프
  if (field.includes('"') || field.includes(',') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

function formatDate(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19)
}

export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 파싱
    const queryResult = parseExportParams(request)
    if ('error' in queryResult) {
      return NextResponse.json(
        { success: false, error: queryResult.error },
        { status: 400 }
      )
    }

    const where = buildWhereClause(queryResult)

    // 데이터 조회 (최대 10,000건 제한)
    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    })

    // CSV 헤더
    const headers = [
      'ID',
      '사용자ID',
      '사용자명',
      '이메일',
      '액션',
      '리소스',
      '리소스ID',
      '상태',
      'IP',
      '생성일시',
    ]

    // CSV 행 생성
    const rows = logs.map((log) => [
      String(log.id),
      log.userId ? String(log.userId) : '',
      escapeCSVField(log.user?.name),
      escapeCSVField(log.user?.email),
      escapeCSVField(log.action),
      escapeCSVField(log.resource),
      escapeCSVField(log.resourceId),
      escapeCSVField(log.status),
      escapeCSVField(log.ip),
      formatDate(log.createdAt),
    ])

    // CSV 문자열 생성 (BOM 추가로 한글 인코딩 지원)
    const BOM = '\uFEFF'
    const csvContent =
      BOM + headers.join(',') + '\n' + rows.map((row) => row.join(',')).join('\n')

    // 파일명 생성
    const today = new Date().toISOString().split('T')[0]
    const filename = `audit-logs-${today}.csv`

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('[AuditLogs] Export error:', error)
    return NextResponse.json(
      { success: false, error: '감사 로그 내보내기 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
