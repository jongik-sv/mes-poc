import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import {
  validatePasswordPolicy,
  isPasswordReused,
  hashPassword,
  DEFAULT_PASSWORD_POLICY,
} from '@/lib/auth/password'

interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다.',
          },
        },
        { status: 401 }
      )
    }

    const body: PasswordChangeRequest = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // 필수 필드 검증
    if (!currentPassword || !newPassword || !confirmPassword) {
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

    const userId = session.user.id

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { userId },
      include: {
        passwordHistory: {
          orderBy: { createdAt: 'desc' },
          take: DEFAULT_PASSWORD_POLICY.historyCount,
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '사용자를 찾을 수 없습니다.',
          },
        },
        { status: 404 }
      )
    }

    // 현재 비밀번호 확인
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CURRENT_PASSWORD',
            message: '현재 비밀번호가 올바르지 않습니다.',
          },
        },
        { status: 401 }
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

    // 이전 비밀번호 재사용 확인
    const passwordHashes = [user.password, ...user.passwordHistory.map((h) => h.passwordHash)]
    const isReused = await isPasswordReused(newPassword, passwordHashes)
    if (isReused) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PASSWORD_REUSED',
            message: '이전에 사용한 비밀번호는 재사용할 수 없습니다.',
          },
        },
        { status: 400 }
      )
    }

    // 새 비밀번호 해시
    const newPasswordHash = await hashPassword(newPassword)

    // 트랜잭션으로 비밀번호 변경 및 이력 저장
    await prisma.$transaction([
      // 비밀번호 업데이트
      prisma.user.update({
        where: { userId },
        data: {
          password: newPasswordHash,
          passwordChangedAt: new Date(),
          mustChangePassword: false,
        },
      }),
      // 이력 저장
      prisma.passwordHistory.create({
        data: {
          userId,
          passwordHash: user.password, // 이전 비밀번호 저장
        },
      }),
      // 감사 로그
      prisma.auditLog.create({
        data: {
          userId,
          action: 'PASSWORD_CHANGED',
          status: 'SUCCESS',
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: '비밀번호가 변경되었습니다.',
    })
  } catch (error) {
    console.error('Password change error:', error)
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
