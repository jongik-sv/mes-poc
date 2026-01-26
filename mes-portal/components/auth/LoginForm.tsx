'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Form, Input, Button, Alert, Typography, Checkbox, theme } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { AUTH_MESSAGES } from '@/lib/constants/messages'

const { Title, Text, Link } = Typography

interface LoginFormValues {
  email: string
  password: string
  rememberMe?: boolean
}

export function LoginForm() {
  const { token } = theme.useToken()
  const router = useRouter()
  const [form] = Form.useForm<LoginFormValues>()
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

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
        router.push('/dashboard')
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
        <div className="flex justify-center mb-4">
          <svg
            width="48"
            height="48"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="6" fill="var(--color-primary)" />
            <path
              d="M8 10h4v12H8V10zm6 4h4v8h-4v-8zm6-2h4v10h-4V12z"
              fill="white"
            />
          </svg>
        </div>
        <Title
          level={2}
          style={{
            color: token.colorText,
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          MES Portal
        </Title>
        <Text style={{ color: token.colorTextTertiary }}>
          Manufacturing Execution System
        </Text>
      </div>

      {/* 에러 Alert */}
      {authError && (
        <Alert
          data-testid="error-message"
          message={authError}
          type="error"
          showIcon
          closable
          onClose={() => setAuthError(null)}
          className="mb-6"
          role="alert"
          aria-live="assertive"
          style={{
            borderRadius: token.borderRadius,
          }}
        />
      )}

      {/* 로그인 폼 */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        disabled={isLoading}
        requiredMark={false}
      >
        {/* 이메일 필드 */}
        <Form.Item
          label={
            <span style={{ color: token.colorTextSecondary, fontWeight: 500 }}>
              이메일
            </span>
          }
          name="email"
          rules={[
            { required: true, message: AUTH_MESSAGES.REQUIRED_EMAIL },
            { type: 'email', message: AUTH_MESSAGES.INVALID_EMAIL_FORMAT },
          ]}
        >
          <Input
            data-testid="email-input"
            prefix={<MailOutlined style={{ color: token.colorTextQuaternary }} />}
            placeholder="이메일을 입력하세요"
            size="large"
            aria-label="이메일"
            aria-required="true"
            style={{
              borderRadius: token.borderRadius,
            }}
          />
        </Form.Item>

        {/* 비밀번호 필드 */}
        <Form.Item
          label={
            <span style={{ color: token.colorTextSecondary, fontWeight: 500 }}>
              비밀번호
            </span>
          }
          name="password"
          rules={[
            { required: true, message: AUTH_MESSAGES.REQUIRED_PASSWORD },
          ]}
        >
          <Input.Password
            data-testid="password-input"
            prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />}
            placeholder="비밀번호를 입력하세요"
            size="large"
            aria-label="비밀번호"
            aria-required="true"
            style={{
              borderRadius: token.borderRadius,
            }}
          />
        </Form.Item>

        {/* 자동 로그인 및 비밀번호 찾기 */}
        <Form.Item className="mb-0">
          <div className="flex justify-between items-center">
            <Form.Item name="rememberMe" valuePropName="checked" noStyle>
              <Checkbox data-testid="remember-checkbox">
                <Text style={{ color: token.colorTextSecondary, fontSize: 13 }}>
                  자동 로그인
                </Text>
              </Checkbox>
            </Form.Item>
            <Link
              href="/forgot-password"
              style={{ fontSize: 13 }}
            >
              비밀번호 찾기
            </Link>
          </div>
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
            style={{
              height: 44,
              borderRadius: token.borderRadius,
              fontWeight: 500,
              fontSize: 15,
            }}
          >
            로그인
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default LoginForm
