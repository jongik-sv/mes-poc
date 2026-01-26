import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validatePasswordPolicy, DEFAULT_PASSWORD_POLICY } from '@/lib/auth/password'
import { validatePasswordRequestSchema } from '@/lib/auth/password-schema'

/**
 * POST /api/auth/validate-password
 * 비밀번호 복잡도 검증
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 요청 검증
    const parseResult = validatePasswordRequestSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '비밀번호는 필수입니다.',
          },
        },
        { status: 400 }
      )
    }

    const { password } = parseResult.data

    // SecuritySetting에서 정책 조회
    const settings = await prisma.securitySetting.findMany({
      where: {
        key: {
          in: [
            'PASSWORD_MIN_LENGTH',
            'PASSWORD_REQUIRE_UPPERCASE',
            'PASSWORD_REQUIRE_LOWERCASE',
            'PASSWORD_REQUIRE_NUMBER',
            'PASSWORD_REQUIRE_SPECIAL',
          ],
        },
      },
    })

    // 설정값을 맵으로 변환
    const settingsMap = new Map(settings.map((s) => [s.key, s.value]))

    // 정책 객체 구성
    const policy = {
      minLength: parseInt(
        settingsMap.get('PASSWORD_MIN_LENGTH') || String(DEFAULT_PASSWORD_POLICY.minLength)
      ),
      requireUppercase:
        (settingsMap.get('PASSWORD_REQUIRE_UPPERCASE') || String(DEFAULT_PASSWORD_POLICY.requireUppercase)) === 'true',
      requireLowercase:
        (settingsMap.get('PASSWORD_REQUIRE_LOWERCASE') || String(DEFAULT_PASSWORD_POLICY.requireLowercase)) === 'true',
      requireNumber:
        (settingsMap.get('PASSWORD_REQUIRE_NUMBER') || String(DEFAULT_PASSWORD_POLICY.requireNumber)) === 'true',
      requireSpecial:
        (settingsMap.get('PASSWORD_REQUIRE_SPECIAL') || String(DEFAULT_PASSWORD_POLICY.requireSpecial)) === 'true',
    }

    // 비밀번호 정책 검증
    const result = validatePasswordPolicy(password, policy)

    return NextResponse.json({
      success: true,
      data: {
        valid: result.isValid,
        errors: result.errors,
      },
    })
  } catch (error) {
    console.error('Password validation error:', error)
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
