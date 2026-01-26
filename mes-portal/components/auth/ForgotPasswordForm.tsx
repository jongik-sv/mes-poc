'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Alert, Typography, theme } from 'antd'
import { MailOutlined, CheckCircleOutlined } from '@ant-design/icons'

const { Title, Text, Link } = Typography

interface ForgotPasswordFormValues {
  email: string
}

export function ForgotPasswordForm() {
  const { token } = theme.useToken()
  const router = useRouter()
  const [form] = Form.useForm<ForgotPasswordFormValues>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error?.message || '요청 처리에 실패했습니다.')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div data-testid="forgot-password-success" className="text-center py-8">
        <CheckCircleOutlined style={{ fontSize: 48, color: token.colorSuccess }} />
        <Title level={4} style={{ marginTop: 16 }}>
          이메일을 확인해주세요
        </Title>
        <Text type="secondary">
          등록된 이메일이라면 비밀번호 재설정 링크가 발송됩니다.
          <br />
          이메일이 도착하지 않으면 스팸함을 확인해주세요.
        </Text>
        <div className="mt-4">
          <Button type="primary" onClick={() => router.push('/login')}>
            로그인으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="forgot-password-form" className="w-full max-w-md mx-auto">
      <Title level={4} style={{ marginBottom: 8 }}>
        비밀번호 찾기
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
      </Text>

      {error && (
        <Alert
          data-testid="error-message"
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isLoading}
        requiredMark={false}
      >
        <Form.Item
          label="이메일"
          name="email"
          rules={[
            { required: true, message: '이메일을 입력해주세요.' },
            { type: 'email', message: '올바른 이메일 형식이 아닙니다.' },
          ]}
        >
          <Input
            data-testid="email-input"
            prefix={<MailOutlined style={{ color: token.colorTextQuaternary }} />}
            placeholder="이메일을 입력하세요"
            size="large"
          />
        </Form.Item>

        <Form.Item className="mb-4 mt-6">
          <Button
            data-testid="forgot-password-button"
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isLoading}
          >
            재설정 링크 받기
          </Button>
        </Form.Item>

        <div className="text-center">
          <Link onClick={() => router.push('/login')}>
            로그인으로 돌아가기
          </Link>
        </div>
      </Form>
    </div>
  )
}

export default ForgotPasswordForm
