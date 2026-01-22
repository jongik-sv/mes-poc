// components/dashboard/WidgetCard.tsx
// 대시보드 위젯 컨테이너 공통 컴포넌트 (010-design.md 섹션 5.2 기준)

'use client'

import React from 'react'
import { Card, Skeleton, Result, Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import type { WidgetCardProps } from './types'

/**
 * WidgetCard - 대시보드 위젯 컨테이너
 *
 * 대시보드 위젯의 일관된 컨테이너를 제공합니다.
 * - 헤더 (제목, 추가 요소)
 * - 본문 (children)
 * - 로딩/에러 상태 처리
 *
 * @example
 * ```tsx
 * <WidgetCard title="가동률" loading={isLoading} error={error}>
 *   <KPIContent data={operationRate} />
 * </WidgetCard>
 * ```
 */
export function WidgetCard({
  title,
  extra,
  loading = false,
  error = null,
  onRetry,
  children,
  minHeight = 120,
  className,
  'data-testid': testId,
}: WidgetCardProps) {
  // 에러 상태 렌더링
  if (error) {
    return (
      <Card
        title={title}
        extra={extra}
        className={className}
        data-testid={testId}
        styles={{
          body: { minHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' },
        }}
      >
        <div data-testid="widget-error" className="text-center">
          <Result
            status="error"
            title="데이터를 불러오지 못했습니다"
            subTitle={error.message}
            extra={
              onRetry && (
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={onRetry}
                  data-testid="widget-retry-btn"
                >
                  재시도
                </Button>
              )
            }
          />
        </div>
      </Card>
    )
  }

  // 로딩 상태 렌더링
  if (loading) {
    return (
      <Card
        title={title}
        extra={extra}
        className={className}
        data-testid={testId}
        styles={{
          body: { minHeight },
        }}
      >
        <div data-testid="widget-loading">
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
      </Card>
    )
  }

  // 정상 상태 렌더링
  return (
    <Card
      title={title}
      extra={extra}
      className={className}
      data-testid={testId}
      styles={{
        body: { minHeight },
      }}
    >
      {children}
    </Card>
  )
}

export default WidgetCard
