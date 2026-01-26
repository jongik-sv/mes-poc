/**
 * TSK-05-01: 사용자 비밀번호 초기화 API
 *
 * POST /api/users/:id/password/reset - 비밀번호 초기화 (관리자)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 ID입니다' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 기본 비밀번호로 초기화
    const defaultPassword = 'Password123!'
    const hashedPassword = await hashPassword(defaultPassword)

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
        passwordChangedAt: new Date(),
      },
    })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: id,
        action: 'PASSWORD_RESET',
        resource: 'user',
        resourceId: String(id),
        details: JSON.stringify({ reason: 'ADMIN_RESET' }),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json({
      success: true,
      message: '비밀번호가 초기화되었습니다',
    })
  } catch (error) {
    console.error('[Users] Password reset error:', error)
    return NextResponse.json(
      { success: false, error: '비밀번호 초기화 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
