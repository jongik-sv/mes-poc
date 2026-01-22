'use client'

import { Card, Typography } from 'antd'
import { LoginForm } from '@/components/auth/LoginForm'

const { Text } = Typography

export function LoginPageClient() {
  return (
    <div
      data-testid="login-page"
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* 배경 패턴 */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, var(--color-primary-light) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, var(--color-info-light) 0%, transparent 50%)
          `,
          opacity: 0.5,
        }}
        aria-hidden="true"
      />

      {/* 로그인 카드 */}
      <Card
        data-testid="login-card"
        className="w-full max-w-[420px] relative z-10"
        styles={{
          body: { padding: 40 },
        }}
        style={{
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-gray-200)',
        }}
      >
        <LoginForm />
      </Card>

      {/* 푸터 */}
      <footer
        data-testid="login-footer"
        className="mt-8 text-center relative z-10"
      >
        <Text style={{ color: 'var(--color-gray-400)', fontSize: 12 }}>
          © 2026 MES Portal v1.0.0
        </Text>
      </footer>
    </div>
  )
}
