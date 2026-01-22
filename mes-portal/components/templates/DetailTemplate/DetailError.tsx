// components/templates/DetailTemplate/DetailError.tsx
// 상세 화면 에러 상태 컴포넌트 (TSK-06-02)

'use client'

import React from 'react'
import { Result, Button, Space } from 'antd'
import type { DetailErrorProps, DetailErrorState } from './types'

/**
 * 에러 상태별 기본 메시지 설정
 */
const ERROR_CONFIG: Record<string, { title: string; subTitle: string }> = {
  '403': {
    title: '접근 권한이 없습니다',
    subTitle: '이 항목을 조회할 권한이 없습니다. 관리자에게 문의해주세요.',
  },
  '404': {
    title: '항목을 찾을 수 없습니다',
    subTitle: '요청하신 항목이 존재하지 않거나 삭제되었습니다.',
  },
  '500': {
    title: '데이터를 불러올 수 없습니다',
    subTitle: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
  error: {
    title: '연결 상태를 확인해주세요',
    subTitle: '네트워크 연결에 문제가 있습니다.',
  },
}

/**
 * DetailError 컴포넌트
 *
 * 에러 상태를 Result 컴포넌트로 표시합니다.
 * - 403: 권한 없음
 * - 404: 항목 없음
 * - 500: 서버 오류
 * - error: 네트워크 오류
 */
export function DetailError({ error, onBack, onRetry }: DetailErrorProps) {
  const status = error.status || 'error'
  const config = ERROR_CONFIG[String(status)] || ERROR_CONFIG.error

  const title = error.title || config.title
  const subTitle = error.message || config.subTitle

  // 재시도 가능 여부 (500 또는 네트워크 오류)
  const canRetry = status === 500 || status === 'error'

  return (
    <div data-testid="detail-error">
      <Result
        status={status}
        title={title}
        subTitle={subTitle}
        extra={
          <Space>
            {onBack && (
              <Button type="primary" onClick={onBack}>
                목록으로 이동
              </Button>
            )}
            {canRetry && onRetry && (
              <Button onClick={onRetry}>다시 시도</Button>
            )}
          </Space>
        }
      />
    </div>
  )
}

export default DetailError
