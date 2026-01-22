import type { NextAuthConfig } from 'next-auth'

/**
 * Edge Runtime 전용 Auth 설정
 * - middleware에서 사용
 * - Node.js API (prisma, bcrypt) 사용 불가
 * - 세션 검증 및 라우트 보호만 수행
 */
export const authConfigEdge: NextAuthConfig = {
  providers: [],
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

      // 포털 경로: 로그인 필수
      if (isOnPortal) {
        if (isLoggedIn) return true
        return false // Redirect to /login
      }

      // 이미 로그인한 사용자가 /login 접근 시 대시보드로 리다이렉트
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      return true
    },
  },
}
