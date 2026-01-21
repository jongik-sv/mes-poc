// components/common/ErrorPage.tsx
// MES Portal 에러 페이지 컴포넌트 (TSK-05-01)
'use client'

import { useRouter } from 'next/navigation'
import { Button, Result, Space } from 'antd'
import {
  WifiOutlined,
  ClockCircleOutlined,
  LockOutlined,
  SearchOutlined,
  HomeOutlined,
  LoginOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  MessageOutlined,
} from '@ant-design/icons'

export type ErrorStatus = 403 | 404 | 500 | 'network' | 'session-expired'

export interface ErrorPageProps {
  /** 에러 상태 코드 또는 타입 */
  status: ErrorStatus
  /** 커스텀 제목 */
  title?: string
  /** 커스텀 부제목/설명 */
  subTitle?: string
  /** 재시도 핸들러 */
  onRetry?: () => void
  /** 홈으로 이동 핸들러 (기본: router.push('/')) */
  onGoHome?: () => void
  /** 로그인 핸들러 (기본: router.push('/login')) */
  onLogin?: () => void
  /** 관리자 문의 버튼 표시 여부 */
  showContact?: boolean
  /** 재시도 중 상태 */
  retrying?: boolean
}

// 에러 타입별 설정
const errorConfig: Record<
  ErrorStatus,
  {
    status?: 'success' | 'error' | 'info' | 'warning' | '403' | '404' | '500'
    icon?: React.ReactNode
    title: string
    subTitle: string
    showRetry?: boolean
    showHome?: boolean
    showLogin?: boolean
    showBack?: boolean
    showContact?: boolean
  }
> = {
  404: {
    status: '404',
    title: '404',
    subTitle: '페이지를 찾을 수 없습니다. 요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.',
    showHome: true,
  },
  500: {
    status: '500',
    title: '500',
    subTitle: '서버 오류가 발생했습니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    showRetry: true,
    showHome: true,
  },
  403: {
    status: '403',
    icon: <LockOutlined className="text-6xl text-orange-500" />,
    title: '403',
    subTitle: '접근 권한이 없습니다. 이 페이지에 접근할 권한이 없습니다. 관리자에게 문의하거나 다시 로그인해 주세요.',
    showLogin: true,
    showBack: true,
    showContact: true,
  },
  network: {
    status: 'warning',
    icon: <WifiOutlined className="text-6xl text-gray-500" />,
    title: '연결 오류',
    subTitle: '네트워크 연결을 확인해주세요. 인터넷 연결을 확인 후 다시 시도해 주세요.',
    showRetry: true,
  },
  'session-expired': {
    status: 'info',
    icon: <ClockCircleOutlined className="text-6xl text-blue-500" />,
    title: '세션 만료',
    subTitle: '세션이 만료되었습니다. 보안을 위해 세션이 만료되었습니다. 계속 사용하시려면 다시 로그인해 주세요.',
    showLogin: true,
  },
}

export function ErrorPage({
  status,
  title,
  subTitle,
  onRetry,
  onGoHome,
  onLogin,
  showContact,
  retrying = false,
}: ErrorPageProps) {
  const router = useRouter()
  const config = errorConfig[status]

  // 표시할 제목과 설명
  const displayTitle = title || config.title
  const displaySubTitle = subTitle || config.subTitle

  // 홈으로 이동
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome()
    } else {
      router.push('/')
    }
  }

  // 로그인 페이지로 이동
  const handleLogin = () => {
    if (onLogin) {
      onLogin()
    } else {
      router.push('/login')
    }
  }

  // 이전 페이지로 이동
  const handleBack = () => {
    router.back()
  }

  // 관리자 문의
  const handleContact = () => {
    // 관리자 문의 페이지나 모달 열기 (추후 구현)
    console.log('Contact admin')
  }

  // 버튼 그룹 렌더링
  const renderActions = () => {
    const actions: React.ReactNode[] = []

    // 재시도 버튼
    if ((config.showRetry || onRetry) && onRetry) {
      actions.push(
        <Button
          key="retry"
          type="primary"
          icon={<ReloadOutlined />}
          onClick={onRetry}
          loading={retrying}
          data-testid="error-page-retry-btn"
        >
          다시 시도
        </Button>
      )
    }

    // 이전으로 버튼
    if (config.showBack) {
      actions.push(
        <Button
          key="back"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          data-testid="error-page-back-btn"
        >
          이전으로
        </Button>
      )
    }

    // 로그인 버튼
    if (config.showLogin) {
      actions.push(
        <Button
          key="login"
          type="primary"
          icon={<LoginOutlined />}
          onClick={handleLogin}
          data-testid="error-page-login-btn"
        >
          다시 로그인
        </Button>
      )
    }

    // 홈으로 버튼
    if (config.showHome) {
      actions.push(
        <Button
          key="home"
          icon={<HomeOutlined />}
          onClick={handleGoHome}
          data-testid="error-page-home-btn"
        >
          홈으로
        </Button>
      )
    }

    // 관리자 문의 버튼
    if (showContact ?? config.showContact) {
      actions.push(
        <Button
          key="contact"
          icon={<MessageOutlined />}
          onClick={handleContact}
          data-testid="error-page-contact-btn"
        >
          관리자 문의
        </Button>
      )
    }

    return actions.length > 0 ? <Space wrap>{actions}</Space> : null
  }

  return (
    <div
      data-testid="error-page"
      role="alert"
      aria-live="assertive"
      className="flex items-center justify-center min-h-[400px] p-8"
    >
      <Result
        status={config.status as any}
        icon={config.icon}
        title={<span data-testid="error-page-title">{displayTitle}</span>}
        subTitle={<span data-testid="error-page-message">{displaySubTitle}</span>}
        extra={renderActions()}
      />
    </div>
  )
}
