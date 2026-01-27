/**
 * TSK-05-01: 사용자 계정 잠금/해제 API
 *
 * POST /api/users/:id/lock - 계정 잠금
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({ where: { userId: id } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (user.isLocked) {
      return NextResponse.json(
        { success: false, error: '이미 잠긴 계정입니다' },
        { status: 400 }
      )
    }

    // 계정 잠금 (무기한)
    await prisma.user.update({
      where: { userId: id },
      data: {
        isLocked: true,
        lockUntil: null, // 관리자에 의한 잠금은 자동 해제 없음
      },
    })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: id,
        action: 'ACCOUNT_LOCKED',
        resource: 'user',
        resourceId: id,
        details: JSON.stringify({ reason: 'ADMIN_LOCK' }),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json({
      success: true,
      message: '계정이 잠겼습니다',
    })
  } catch (error) {
    console.error('[Users] Lock error:', error)
    return NextResponse.json(
      { success: false, error: '계정 잠금 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
