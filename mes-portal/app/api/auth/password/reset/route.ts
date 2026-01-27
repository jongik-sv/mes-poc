import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  validatePasswordPolicy,
  hashPassword,
} from '@/lib/auth/password'

interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json()
    const { token, newPassword, confirmPassword } = body

    // 필수 필드 검증
    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '모든 필드를 입력해주세요.',
          },
        },
        { status: 400 }
      )
    }

    // 새 비밀번호 확인 일치 검증
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PASSWORD_MISMATCH',
            message: '새 비밀번호가 일치하지 않습니다.',
          },
        },
        { status: 400 }
      )
    }

    // 토큰 검증
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: '유효하지 않은 토큰입니다.',
          },
        },
        { status: 400 }
      )
    }

    // 토큰 사용 여부 확인
    if (resetToken.usedAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_USED',
            message: '이미 사용된 토큰입니다.',
          },
        },
        { status: 400 }
      )
    }

    // 토큰 만료 확인
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: '토큰이 만료되었습니다. 다시 비밀번호 찾기를 진행해주세요.',
          },
        },
        { status: 400 }
      )
    }

    // 사용자 계정 상태 확인
    if (!resetToken.user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: '비활성화된 계정입니다.',
          },
        },
        { status: 403 }
      )
    }

    // 비밀번호 정책 검증
    const policyResult = validatePasswordPolicy(newPassword)
    if (!policyResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PASSWORD_POLICY_VIOLATION',
            message: policyResult.errors.join(' '),
            details: policyResult.errors,
          },
        },
        { status: 400 }
      )
    }

    // 새 비밀번호 해시
    const newPasswordHash = await hashPassword(newPassword)

    // 트랜잭션으로 비밀번호 변경 및 토큰 무효화
    await prisma.$transaction([
      // 비밀번호 업데이트
      prisma.user.update({
        where: { userId: resetToken.userId },
        data: {
          password: newPasswordHash,
          passwordChangedAt: new Date(),
          mustChangePassword: false,
          isLocked: false, // 잠금 해제
          lockUntil: null,
          failedLoginAttempts: 0,
        },
      }),
      // 이력 저장
      prisma.passwordHistory.create({
        data: {
          userId: resetToken.userId,
          passwordHash: resetToken.user.password, // 이전 비밀번호 저장
        },
      }),
      // 토큰 무효화
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      // 감사 로그
      prisma.auditLog.create({
        data: {
          userId: resetToken.userId,
          action: 'PASSWORD_RESET',
          status: 'SUCCESS',
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: '비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해주세요.',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    )
  }
}
