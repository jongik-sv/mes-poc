'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Form, Input, Button, Alert, Typography, theme, Progress } from 'antd'
import { LockOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface PasswordResetFormValues {
  newPassword: string
  confirmPassword: string
}

interface PasswordStrength {
  score: number
  color: string
  text: string
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0
  if (password.length >= 8) score += 20
  if (password.length >= 12) score += 10
  if (/[A-Z]/.test(password)) score += 20
  if (/[a-z]/.test(password)) score += 20
  if (/[0-9]/.test(password)) score += 15
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15

  if (score < 40) return { score, color: '#ff4d4f', text: '약함' }
  if (score < 70) return { score, color: '#faad14', text: '보통' }
  return { score, color: '#52c41a', text: '강함' }
}

export function PasswordResetForm() {
  const { token } = theme.useToken()
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetToken = searchParams.get('token')

  const [form] = Form.useForm<PasswordResetFormValues>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const passwordStrength = getPasswordStrength(newPassword)

  const passwordRules = [
    { met: newPassword.length >= 8, text: '8자 이상' },
    { met: /[A-Z]/.test(newPassword), text: '대문자 포함' },
    { met: /[a-z]/.test(newPassword), text: '소문자 포함' },
    { met: /[0-9]/.test(newPassword), text: '숫자 포함' },
    { met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword), text: '특수문자 포함' },
  ]

  const handleSubmit = async (values: PasswordResetFormValues) => {
    if (!resetToken) {
      setError('유효하지 않은 요청입니다.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          ...values,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error?.message || '비밀번호 재설정에 실패했습니다.')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!resetToken) {
    return (
      <div data-testid="invalid-token" className="text-center py-8">
        <CloseCircleOutlined style={{ fontSize: 48, color: token.colorError }} />
        <Title level={4} style={{ marginTop: 16 }}>
          유효하지 않은 링크입니다
        </Title>
        <Text type="secondary">
          비밀번호 재설정 링크가 올바르지 않습니다.
        </Text>
        <div className="mt-4">
          <Button type="primary" onClick={() => router.push('/forgot-password')}>
            비밀번호 찾기
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div data-testid="password-reset-success" className="text-center py-8">
        <CheckCircleOutlined style={{ fontSize: 48, color: token.colorSuccess }} />
        <Title level={4} style={{ marginTop: 16 }}>
          비밀번호가 재설정되었습니다
        </Title>
        <Text type="secondary">
          새 비밀번호로 로그인해주세요.
        </Text>
        <div className="mt-4">
          <Button type="primary" onClick={() => router.push('/login')}>
            로그인하기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="password-reset-form" className="w-full max-w-md mx-auto">
      <Title level={4} style={{ marginBottom: 24 }}>
        비밀번호 재설정
      </Title>

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
          label="새 비밀번호"
          name="newPassword"
          rules={[
            { required: true, message: '새 비밀번호를 입력해주세요.' },
            { min: 8, message: '비밀번호는 최소 8자 이상이어야 합니다.' },
          ]}
        >
          <Input.Password
            data-testid="new-password-input"
            prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />}
            placeholder="새 비밀번호"
            size="large"
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Form.Item>

        {/* 비밀번호 강도 표시 */}
        {newPassword && (
          <div className="mb-4" data-testid="password-strength-indicator">
            <div className="flex items-center gap-2 mb-2">
              <Progress
                percent={passwordStrength.score}
                showInfo={false}
                strokeColor={passwordStrength.color}
                size="small"
              />
              <Text style={{ color: passwordStrength.color, fontSize: 12 }}>
                {passwordStrength.text}
              </Text>
            </div>
            <div className="flex flex-wrap gap-2">
              {passwordRules.map((rule) => (
                <Text
                  key={rule.text}
                  style={{
                    fontSize: 12,
                    color: rule.met ? token.colorSuccess : token.colorTextQuaternary,
                  }}
                >
                  {rule.met ? <CheckCircleOutlined /> : <CloseCircleOutlined />} {rule.text}
                </Text>
              ))}
            </div>
          </div>
        )}

        <Form.Item
          label="새 비밀번호 확인"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '새 비밀번호를 다시 입력해주세요.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'))
              },
            }),
          ]}
        >
          <Input.Password
            data-testid="confirm-password-input"
            prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />}
            placeholder="새 비밀번호 확인"
            size="large"
          />
        </Form.Item>

        <Form.Item className="mb-0 mt-6">
          <Button
            data-testid="password-reset-button"
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isLoading}
          >
            비밀번호 재설정
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default PasswordResetForm
