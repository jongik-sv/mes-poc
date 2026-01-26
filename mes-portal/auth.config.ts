import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

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

/**
 * Auth.js 설정 - Edge Runtime 호환
 * middleware에서 사용 시 authorize는 호출되지 않음
 * authorize는 credentials 제출 시에만 Node.js 런타임에서 실행
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // This function only runs on the server, not in Edge Runtime
        // When the middleware runs, it doesn't call authorize
        // authorize is only called when credentials are submitted
        const bcrypt = await import('bcrypt')
        const { prisma } = await import('./lib/prisma')

        const email = credentials?.email as string
        const password = credentials?.password as string

        if (!email || !password) {
          return null
        }

        // 사용자 조회 (UserRole 기반)
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
          return null
        }

        // 계정 비활성화 체크
        if (!user.isActive) {
          return null
        }

        // 계정 잠금 체크
        if (user.isLocked) {
          // 잠금 해제 시간 체크
          if (user.lockUntil && new Date() < user.lockUntil) {
            return null
          }
          // 잠금 해제
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isLocked: false,
              lockUntil: null,
              failedLoginAttempts: 0,
            },
          })
        }

        const isValidPassword = await bcrypt.default.compare(password, user.password)

        if (!isValidPassword) {
          // 로그인 실패 횟수 증가
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
          }

          // 감사 로그 기록 (LOGIN_FAILED)
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'LOGIN_FAILED',
              status: 'FAILURE',
              details: JSON.stringify({ reason: 'INVALID_PASSWORD' }),
            },
          })

          return null
        }

        // 로그인 성공: 실패 횟수 초기화, 마지막 로그인 시간 갱신
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lastLoginAt: new Date(),
          },
        })

        // 감사 로그 기록 (LOGIN)
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            status: 'SUCCESS',
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

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          roles,
          permissions,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnHome = nextUrl.pathname === '/'
      const isOnPortal = nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/production') ||
        nextUrl.pathname.startsWith('/quality') ||
        nextUrl.pathname.startsWith('/equipment') ||
        nextUrl.pathname.startsWith('/settings') ||
        nextUrl.pathname.startsWith('/sample')
      const isOnLogin = nextUrl.pathname === '/login'
      const isOnAuthApi = nextUrl.pathname.startsWith('/api/auth')

      // API 인증 경로는 통과
      if (isOnAuthApi) {
        return true
      }

      // 홈 경로: 로그인 필수
      if (isOnHome) {
        if (isLoggedIn) return true
        return false // Redirect to /login
      }

      // 포털 경로: 로그인 필수
      if (isOnPortal) {
        if (isLoggedIn) return true
        return false // Redirect to /login
      }

      // 이미 로그인한 사용자가 /login 접근 시 홈으로 리다이렉트
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl))
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser
        token.id = authUser.id
        token.roles = authUser.roles
        token.permissions = authUser.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.roles = token.roles as UserRole[]
        session.user.permissions = token.permissions as string[]
      }
      return session
    },
  },
}
