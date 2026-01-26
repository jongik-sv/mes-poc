import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

interface ForgotPasswordRequest {
  email: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordRequest = await request.json()
    const { email } = body

    // 필수 필드 검증
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '이메일을 입력해주세요.',
          },
        },
        { status: 400 }
      )
    }

    // 사용자 조회 (보안상 존재 여부 노출 안함)
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (user && user.isActive) {
      // 기존 토큰 무효화 (usedAt 설정)
      await prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      })

      // 새 토큰 생성 (1시간 유효)
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1시간

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      })

      // 이메일 발송 (실제 구현 시 이메일 서비스 연동 필요)
      // 개발 환경에서는 콘솔에 출력
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`
      console.log('===========================================')
      console.log('비밀번호 재설정 이메일 (개발용 콘솔 출력)')
      console.log(`수신자: ${email}`)
      console.log(`재설정 링크: ${resetUrl}`)
      console.log(`만료: ${expiresAt.toLocaleString()}`)
      console.log('===========================================')

      // 감사 로그
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET_REQUESTED',
          status: 'SUCCESS',
        },
      })
    }

    // 보안상 항상 동일한 응답 반환 (이메일 존재 여부 노출 방지)
    return NextResponse.json({
      success: true,
      message: '이메일이 등록되어 있다면 비밀번호 재설정 링크가 발송됩니다.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
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
