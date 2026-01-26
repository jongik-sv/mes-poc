import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_PASSWORD_POLICY } from '@/lib/auth/password'

/**
 * GET /api/auth/password-policy
 * 비밀번호 정책 조회
 */
export async function GET() {
  try {
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
            'PASSWORD_EXPIRY_DAYS',
            'PASSWORD_HISTORY_COUNT',
          ],
        },
      },
    })

    // 설정값을 맵으로 변환
    const settingsMap = new Map(settings.map((s) => [s.key, s.value]))

    // 정책 객체 구성 (설정이 없으면 기본값 사용)
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
      expiryDays: parseInt(
        settingsMap.get('PASSWORD_EXPIRY_DAYS') || String(DEFAULT_PASSWORD_POLICY.expiryDays)
      ),
      historyCount: parseInt(
        settingsMap.get('PASSWORD_HISTORY_COUNT') || String(DEFAULT_PASSWORD_POLICY.historyCount)
      ),
    }

    return NextResponse.json({
      success: true,
      data: policy,
    })
  } catch (error) {
    console.error('Password policy error:', error)
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
