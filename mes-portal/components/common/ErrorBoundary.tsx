// components/common/ErrorBoundary.tsx
// MES Portal 에러 바운더리 컴포넌트 (TSK-05-01)
'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Button, Result } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

export interface ErrorBoundaryProps {
  /** 자식 컴포넌트 */
  children: ReactNode
  /** 커스텀 fallback 컴포넌트 */
  fallback?: ReactNode
  /** fallback 렌더 함수 (error와 resetError 제공) */
  fallbackRender?: (props: { error: Error; resetError: () => void }) => ReactNode
  /** 에러 발생 시 콜백 (민감 정보 필터링 적용) */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** 최대 재시도 횟수 (기본: 3) */
  maxRetries?: number
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  retryCount: number
}

/**
 * 에러 바운더리 컴포넌트
 * - 런타임 에러 캐치 및 fallback UI 렌더링
 * - BR-002: 재시도 3회 실패 시 관리자 문의 안내
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 민감 정보 필터링 (비밀번호, 토큰 등)
    const sanitizedError = this.sanitizeError(error)

    if (this.props.onError) {
      this.props.onError(sanitizedError, errorInfo)
    }

    // 개발 환경에서만 콘솔 출력 (프로덕션에서는 로깅 서비스 연동)
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', sanitizedError, errorInfo)
    }
  }

  /**
   * 에러 메시지에서 민감 정보 제거
   */
  private sanitizeError(error: Error): Error {
    const sensitivePatterns = [
      /password\s*[=:]\s*\S+/gi,
      /token\s*[=:]\s*\S+/gi,
      /secret\s*[=:]\s*\S+/gi,
      /api[_-]?key\s*[=:]\s*\S+/gi,
      /authorization\s*[=:]\s*\S+/gi,
    ]

    let sanitizedMessage = error.message
    for (const pattern of sensitivePatterns) {
      sanitizedMessage = sanitizedMessage.replace(pattern, '[REDACTED]')
    }

    const sanitizedError = new Error(sanitizedMessage)
    sanitizedError.name = error.name
    sanitizedError.stack = error.stack

    return sanitizedError
  }

  /**
   * 에러 상태 초기화 및 재시도
   */
  resetError = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1,
    }))
  }

  render() {
    const { hasError, error, retryCount } = this.state
    const { children, fallback, fallbackRender, maxRetries = 3 } = this.props

    // 에러가 없으면 정상 렌더링
    if (!hasError || !error) {
      return children
    }

    // 커스텀 fallback 컴포넌트
    if (fallback) {
      return fallback
    }

    // fallbackRender 함수
    if (fallbackRender) {
      return fallbackRender({ error, resetError: this.resetError })
    }

    // BR-002: 최대 재시도 횟수 초과 시 관리자 문의 안내
    const hasExceededRetries = retryCount >= maxRetries

    // 기본 fallback UI
    return (
      <div
        data-testid="error-boundary"
        className="flex items-center justify-center p-8"
      >
        <Result
          status="error"
          title="오류가 발생했습니다"
          subTitle={
            <div>
              <p data-testid="error-boundary-message" className="mb-2">
                {error.message || '예기치 않은 오류가 발생했습니다.'}
              </p>
              {hasExceededRetries && (
                <p data-testid="error-boundary-max-retries" className="text-orange-500">
                  문제가 지속되면 관리자에게 문의해주세요.
                </p>
              )}
            </div>
          }
          extra={
            !hasExceededRetries && (
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={this.resetError}
                data-testid="error-boundary-retry-btn"
              >
                다시 시도
              </Button>
            )
          }
        />
      </div>
    )
  }
}
