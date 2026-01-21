import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { LoginPageClient } from './LoginPageClient'

export const metadata: Metadata = {
  title: '로그인 | MES Portal',
  description: 'MES Portal 로그인 페이지',
}

/**
 * 로그인 페이지 (Server Component)
 * 세션 확인 후 이미 로그인된 경우 /portal로 리다이렉트
 */
export default async function LoginPage() {
  // 세션 확인
  const session = await auth()
  if (session) {
    redirect('/portal/dashboard')
  }

  return <LoginPageClient />
}
