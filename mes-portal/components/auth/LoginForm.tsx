'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Form, Input, Button, Alert, Typography } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { AUTH_MESSAGES } from '@/lib/constants/messages'

const { Title, Text } = Typography

interface LoginFormValues {
  email: string
  password: string
}

/**
 * 로그인 폼 컴포넌트
 * Auth.js credentials provider를 사용하여 인증 처리
 */
export function LoginForm() {
  const router = useRouter()
  const [form] = Form.useForm<LoginFormValues>()
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  /**
   * 에러 코드에 따른 메시지 반환
   */
  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'CredentialsSignin':
        return AUTH_MESSAGES.AUTH_FAILED
      case 'AccountInactive':
        return AUTH_MESSAGES.ACCOUNT_INACTIVE
      case 'RateLimited':
        return AUTH_MESSAGES.RATE_LIMITED.replace('{n}', '5')
      case 'AccountLocked':
        return AUTH_MESSAGES.ACCOUNT_LOCKED
      default:
        return AUTH_MESSAGES.AUTH_FAILED
    }
  }

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    setAuthError(null)

    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.ok) {
        router.push('/portal/dashboard')
      } else if (result?.error) {
        setAuthError(getErrorMessage(result.error))
      }
    } catch {
      setAuthError(AUTH_MESSAGES.NETWORK_ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      data-testid="login-form"
      className="w-full"
      role="form"
      aria-label="로그인 폼"
    >
      {/* 로고/타이틀 */}
      <div className="text-center mb-8" data-testid="login-logo">
        <Title level={2} style={{ color: '#1677FF', marginBottom: 4 }}>
          MES Portal
        </Title>
        <Text type="secondary">Manufacturing Execution System</Text>
      </div>

      {/* 에러 Alert */}
      {authError && (
        <Alert
          data-testid="login-error-alert"
          title={authError}
          type="error"
          showIcon
          closable
          onClose={() => setAuthError(null)}
          className="mb-6"
          role="alert"
          aria-live="assertive"
        />
      )}

      {/* 로그인 폼 */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        disabled={isLoading}
      >
        {/* 이메일 필드 */}
        <Form.Item
          label="이메일"
          name="email"
          rules={[
            { required: true, message: AUTH_MESSAGES.REQUIRED_EMAIL },
            { type: 'email', message: AUTH_MESSAGES.INVALID_EMAIL_FORMAT },
          ]}
        >
          <Input
            data-testid="email-input"
            prefix={<MailOutlined />}
            placeholder="이메일을 입력하세요"
            size="large"
            aria-label="이메일"
            aria-required="true"
          />
        </Form.Item>

        {/* 비밀번호 필드 */}
        <Form.Item
          label="비밀번호"
          name="password"
          rules={[
            { required: true, message: AUTH_MESSAGES.REQUIRED_PASSWORD },
          ]}
        >
          <Input.Password
            data-testid="password-input"
            prefix={<LockOutlined />}
            placeholder="비밀번호를 입력하세요"
            size="large"
            aria-label="비밀번호"
            aria-required="true"
          />
        </Form.Item>

        {/* 로그인 버튼 */}
        <Form.Item className="mb-0 mt-6">
          <Button
            data-testid="login-button"
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isLoading}
            aria-label="로그인"
          >
            로그인
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default LoginForm
