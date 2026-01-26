import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Card, Typography } from 'antd'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

const { Text } = Typography

export const metadata: Metadata = {
  title: '비밀번호 찾기 | MES Portal',
  description: 'MES Portal 비밀번호 찾기 페이지',
}

export default async function ForgotPasswordPage() {
  const session = await auth()
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div
      data-testid="forgot-password-page"
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <Card
        className="w-full max-w-[420px]"
        styles={{ body: { padding: 40 } }}
        style={{
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-gray-200)',
        }}
      >
        <ForgotPasswordForm />
      </Card>

      <footer className="mt-8 text-center">
        <Text style={{ color: 'var(--color-gray-400)', fontSize: 12 }}>
          © 2026 MES Portal v1.0.0
        </Text>
      </footer>
    </div>
  )
}
