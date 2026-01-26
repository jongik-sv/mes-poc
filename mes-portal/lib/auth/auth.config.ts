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
  roles: UserRole[]
  permissions: string[]
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

  // 사용자 조회 (UserRole 관계 포함)
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              roleMenus: {
                include: {
                  menu: true,
                },
              },
            },
          },
        },
      },
    },
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

  // 역할 목록 추출
  const roles: UserRole[] = user.userRoles.map((ur) => ({
    id: ur.role.id,
    code: ur.role.code,
    name: ur.role.name,
  }))

  // 권한 목록 추출 (역할별 메뉴 접근 권한)
  const permissionsSet = new Set<string>()
  user.userRoles.forEach((ur) => {
    // SYSTEM_ADMIN 역할은 모든 권한 부여
    if (ur.role.code === 'SYSTEM_ADMIN') {
      permissionsSet.add('*')
    }
    ur.role.roleMenus.forEach((rm) => {
      // 메뉴 코드 기반 권한 추가
      if (rm.menu.code) {
        permissionsSet.add(`menu:${rm.menu.code}`)
      }
    })
  })

  // 인증 성공
  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    roles,
    permissions: Array.from(permissionsSet),
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
    token.roles = user.roles
    token.permissions = user.permissions
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
    session.user.roles = token.roles as UserRole[]
    session.user.permissions = token.permissions as string[]
  }
  return session
}
