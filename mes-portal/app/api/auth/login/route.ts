import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { isPasswordExpired, getDaysUntilPasswordExpiry, DEFAULT_PASSWORD_POLICY } from '@/lib/auth/password'

interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password, rememberMe } = body

    // 필수 필드 검증
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '이메일과 비밀번호는 필수입니다.',
          },
        },
        { status: 400 }
      )
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: '이메일 또는 비밀번호가 올바르지 않습니다.',
          },
        },
        { status: 401 }
      )
    }

    // 계정 비활성화 체크
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: '비활성화된 계정입니다. 관리자에게 문의하세요.',
          },
        },
        { status: 403 }
      )
    }

    // 계정 잠금 체크
    if (user.isLocked) {
      if (user.lockUntil && new Date() < user.lockUntil) {
        const remainingMinutes = Math.ceil(
          (user.lockUntil.getTime() - Date.now()) / (60 * 1000)
        )
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ACCOUNT_LOCKED',
              message: `계정이 잠겼습니다. ${remainingMinutes}분 후에 다시 시도해주세요.`,
            },
          },
          { status: 403 }
        )
      }
      // 잠금 해제 시간이 지났으면 잠금 해제
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isLocked: false,
          lockUntil: null,
          failedLoginAttempts: 0,
        },
      })
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      // 실패 횟수 증가
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: { increment: 1 },
        },
      })

      // 5회 실패 시 계정 잠금 (30분)
      if (updatedUser.failedLoginAttempts >= 5) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isLocked: true,
            lockUntil: new Date(Date.now() + 30 * 60 * 1000),
          },
        })

        // 감사 로그 (ACCOUNT_LOCKED)
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'ACCOUNT_LOCKED',
            status: 'SUCCESS',
            details: JSON.stringify({ reason: 'MAX_LOGIN_ATTEMPTS' }),
          },
        })

        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ACCOUNT_LOCKED',
              message: '로그인 실패가 5회를 초과하여 계정이 잠겼습니다. 30분 후에 다시 시도해주세요.',
            },
          },
          { status: 403 }
        )
      }

      // 감사 로그 (LOGIN_FAILED)
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          status: 'FAILURE',
          details: JSON.stringify({ reason: 'INVALID_PASSWORD' }),
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: '이메일 또는 비밀번호가 올바르지 않습니다.',
          },
        },
        { status: 401 }
      )
    }

    // 로그인 성공: Auth.js signIn 호출
    try {
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'AUTH_ERROR',
              message: '인증 처리 중 오류가 발생했습니다.',
            },
          },
          { status: 500 }
        )
      }
      throw error
    }

    // 역할 및 권한 추출
    const roles = user.userRoles.map((ur) => ({
      id: ur.role.id,
      code: ur.role.code,
      name: ur.role.name,
    }))

    const permissions = [
      ...new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.code)
        )
      ),
    ]

    // 비밀번호 만료 체크
    const expiryDaysSetting = await prisma.securitySetting.findUnique({
      where: { key: 'PASSWORD_EXPIRY_DAYS' },
    })
    const expiryDays = expiryDaysSetting
      ? parseInt(expiryDaysSetting.value)
      : DEFAULT_PASSWORD_POLICY.expiryDays

    const passwordExpired = isPasswordExpired(user.passwordChangedAt, expiryDays)
    const daysUntilExpiry = getDaysUntilPasswordExpiry(user.passwordChangedAt, expiryDays)

    // 비밀번호 만료 알림 (7일 이하 남았을 때)
    const passwordExpiryWarning = daysUntilExpiry > 0 && daysUntilExpiry <= 7
      ? `비밀번호가 ${daysUntilExpiry}일 후 만료됩니다.`
      : null

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles,
          permissions,
        },
        mustChangePassword: user.mustChangePassword || passwordExpired,
        passwordExpired,
        passwordExpiryWarning,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
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
