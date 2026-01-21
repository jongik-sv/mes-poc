// app/error.tsx
// Next.js 에러 페이지 (TSK-05-01)
'use client'

import { useEffect } from 'react'
import { ErrorPage } from '@/components/common/ErrorPage'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 외부 로깅 서비스 연동)
    console.error('Unhandled error:', error)
  }, [error])

  return <ErrorPage status={500} onRetry={reset} />
}
