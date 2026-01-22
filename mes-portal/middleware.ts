import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/production/:path*',
    '/quality/:path*',
    '/equipment/:path*',
    '/settings/:path*',
    '/sample/:path*',
    '/login',
    '/api/:path*',
  ],
}
