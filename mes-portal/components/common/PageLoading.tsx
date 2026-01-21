// components/common/PageLoading.tsx
// MES Portal 전체 페이지 로딩 컴포넌트 (TSK-05-01)
'use client'

import { useState, useEffect } from 'react'
import { Spin } from 'antd'

export interface PageLoadingProps {
  /** 로딩 표시 여부 (기본: true) */
  loading?: boolean
  /** 로딩 메시지 (기본: "로딩 중입니다...") */
  tip?: string
  /** Spin 컴포넌트 크기 (기본: "large") */
  size?: 'small' | 'default' | 'large'
  /** 전체 화면 오버레이 (기본: true) */
  fullScreen?: boolean
  /** 깜빡임 방지 지연 시간 (기본: 200ms) */
  delay?: number
}

export function PageLoading({
  loading = true,
  tip = '로딩 중입니다...',
  size = 'large',
  fullScreen = true,
  delay = 200,
}: PageLoadingProps) {
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    if (!loading) {
      setShowSpinner(false)
      return
    }

    // BR-001: 깜빡임 방지 - delay 시간 후에만 스피너 표시
    const timer = setTimeout(() => {
      setShowSpinner(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [loading, delay])

  // 로딩이 아니거나 delay 중이면 렌더링 안 함
  if (!loading || !showSpinner) {
    return null
  }

  return (
    <div
      data-testid="page-loading"
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`
        flex flex-col items-center justify-center
        ${fullScreen ? 'fullscreen fixed inset-0 z-[1000] bg-white/90 dark:bg-gray-900/90' : 'w-full min-h-[200px]'}
      `}
    >
      <Spin size={size} tip={tip} />
    </div>
  )
}
