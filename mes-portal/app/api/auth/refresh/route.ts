import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

interface RefreshRequest {
  refreshToken: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RefreshRequest = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token이 필요합니다.',
          },
        },
        { status: 400 }
      )
    }

    // RefreshToken 조회
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
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
        },
      },
    })

    // 토큰이 없거나 폐기됨
    if (!tokenRecord || tokenRecord.revokedAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: '유효하지 않은 refresh token입니다.',
          },
        },
        { status: 401 }
      )
    }

    // 토큰 만료 체크
    if (new Date() > tokenRecord.expiresAt) {
      // 만료된 토큰 폐기
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      })

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Refresh token이 만료되었습니다.',
          },
        },
        { status: 401 }
      )
    }

    const user = tokenRecord.user

    // 계정 상태 체크
    if (!user.isActive || user.isLocked) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: '계정이 비활성화되었거나 잠겨있습니다.',
          },
        },
        { status: 403 }
      )
    }

    // 기존 토큰 폐기 (Token Rotation)
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    })

    // 새 Refresh Token 생성
    const newRefreshToken = randomBytes(64).toString('hex')
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        family: tokenRecord.family, // 같은 family 유지
        expiresAt: refreshTokenExpiry,
      },
    })

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

    return NextResponse.json({
      success: true,
      data: {
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles,
          permissions,
        },
      },
    })
  } catch (error) {
    console.error('Token refresh error:', error)
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
