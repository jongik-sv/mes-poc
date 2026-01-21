'use client'

import { Card, Typography } from 'antd'
import { LoginForm } from '@/components/auth/LoginForm'

const { Text } = Typography

/**
 * 로그인 페이지 클라이언트 컴포넌트
 * Server Component에서 분리하여 Ant Design 컴포넌트 사용 가능
 */
export function LoginPageClient() {
  return (
    <div
      data-testid="login-page"
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'var(--ant-color-bg-layout)' }}
    >
      {/* 로그인 카드 */}
      <Card
        data-testid="login-card"
        className="w-full max-w-[400px]"
        styles={{
          body: { padding: 32 },
        }}
      >
        <LoginForm />
      </Card>

      {/* 푸터 */}
      <footer
        data-testid="login-footer"
        className="mt-8 text-center"
      >
        <Text type="secondary">© 2026 MES Portal v1.0.0</Text>
      </footer>
    </div>
  )
}
