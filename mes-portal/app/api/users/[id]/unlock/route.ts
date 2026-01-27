/**
 * TSK-05-01: 사용자 계정 잠금 해제 API
 *
 * POST /api/users/:id/unlock - 계정 잠금 해제
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

    if (!user.isLocked) {
      return NextResponse.json(
        { success: false, error: '잠기지 않은 계정입니다' },
        { status: 400 }
      )
    }

    // 계정 잠금 해제
    await prisma.user.update({
      where: { userId: id },
      data: {
        isLocked: false,
        lockUntil: null,
        failedLoginAttempts: 0,
      },
    })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: id,
        action: 'ACCOUNT_UNLOCKED',
        resource: 'user',
        resourceId: id,
        details: JSON.stringify({ reason: 'ADMIN_UNLOCK' }),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json({
      success: true,
      message: '계정 잠금이 해제되었습니다',
    })
  } catch (error) {
    console.error('[Users] Unlock error:', error)
    return NextResponse.json(
      { success: false, error: '계정 잠금 해제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
