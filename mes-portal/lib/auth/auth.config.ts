import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import type { JWT } from 'next-auth/jwt'

interface UserRole {
  id: number
  code: string
  name: string
}

interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}

interface Credentials {
  email?: string
  password?: string
}

/**
 * Credentials 인증 로직
 * @param credentials 이메일/비밀번호
 * @returns 인증된 사용자 정보 또는 null
 */
export async function authorizeCredentials(
  credentials: Credentials
): Promise<AuthUser | null> {
  // 입력값 검증
  if (!credentials?.email || !credentials?.password) {
    return null
  }

  // 사용자 조회
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    include: { role: true },
  })

  // 사용자 미존재
  if (!user) {
    return null
  }

  // 비활성 계정
  if (!user.isActive) {
    return null
  }

  // 비밀번호 검증
  const isValidPassword = await bcrypt.compare(
    credentials.password,
    user.password
  )

  if (!isValidPassword) {
    return null
  }

  // 인증 성공
  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: {
      id: user.role.id,
      code: user.role.code,
      name: user.role.name,
    },
  }
}

/**
 * JWT 콜백 - 토큰에 사용자 정보 추가
 */
export async function jwtCallback({
  token,
  user,
}: {
  token: JWT
  user?: AuthUser
}): Promise<JWT> {
  if (user) {
    token.id = user.id
    token.role = user.role
  }
  return token
}

/**
 * 세션 콜백 - 세션에 사용자 정보 추가
 */
export async function sessionCallback({
  session,
  token,
}: {
  session: { user: AuthUser; expires: string }
  token: JWT
}): Promise<{ user: AuthUser; expires: string }> {
  if (token) {
    session.user.id = token.id as string
    session.user.role = token.role as UserRole
  }
  return session
}
