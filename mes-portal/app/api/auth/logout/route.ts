import { NextResponse } from 'next/server'
import { auth, signOut } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
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

    const userId = session.user.id

    // 감사 로그 기록 (LOGOUT)
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        status: 'SUCCESS',
      },
    })

    // 세션 무효화
    await signOut({ redirect: false })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Logout error:', error)
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
