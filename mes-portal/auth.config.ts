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
  role: UserRole
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

        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true },
        })

        if (!user || !user.isActive) {
          return null
        }

        const isValidPassword = await bcrypt.default.compare(password, user.password)

        if (!isValidPassword) {
          return null
        }

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
      const isOnPortal = nextUrl.pathname.startsWith('/portal')
      const isOnLogin = nextUrl.pathname === '/login'
      const isOnAuthApi = nextUrl.pathname.startsWith('/api/auth')

      // API 인증 경로는 통과
      if (isOnAuthApi) {
        return true
      }

      // 포털 경로: 로그인 필수
      if (isOnPortal) {
        if (isLoggedIn) return true
        return false // Redirect to /login
      }

      // 이미 로그인한 사용자가 /login 접근 시 포털로 리다이렉트
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL('/portal', nextUrl))
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser
        token.id = authUser.id
        token.role = authUser.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
}
