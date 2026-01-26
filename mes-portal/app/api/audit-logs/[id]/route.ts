/**
 * TSK-04-01: 감사 로그 상세 조회 API
 *
 * GET /api/audit-logs/:id
 * - 단일 감사 로그 상세 정보 조회
 * - 사용자 정보 포함
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 ID입니다' },
        { status: 400 }
      )
    }

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!log) {
      return NextResponse.json(
        { success: false, error: '감사 로그를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 응답 데이터 변환
    const data = {
      id: log.id,
      userId: log.userId,
      user: log.user,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      details: log.details ? JSON.parse(log.details) : null,
      ip: log.ip,
      userAgent: log.userAgent,
      status: log.status,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt.toISOString(),
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('[AuditLogs] GET detail error:', error)
    return NextResponse.json(
      { success: false, error: '감사 로그 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
