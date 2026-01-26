import NextAuth from 'next-auth'
import { authConfigEdge } from './auth.config.edge'

// Edge Runtime 전용 설정 사용 (Node.js API 미포함)
export default NextAuth(authConfigEdge).auth

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/production/:path*',
    '/quality/:path*',
    '/equipment/:path*',
    '/settings/:path*',
    '/system/:path*',
    '/sample/:path*',
    '/login',
    '/api/:path*',
  ],
}
