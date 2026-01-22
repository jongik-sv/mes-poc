// components/dashboard/charts/ChartWrapper.tsx
// 차트 공통 래퍼 컴포넌트 (010-design.md 섹션 9, 11.2 기준)

'use client'

import React from 'react'
import { Skeleton, Empty, Result, Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

export interface ChartWrapperProps {
  /** 로딩 상태 */
  loading?: boolean
  /** 에러 상태 */
  error?: Error | null
  /** 재시도 콜백 */
  onRetry?: () => void
  /** 데이터 존재 여부 */
  hasData: boolean
  /** 차트 높이 */
  height?: number
  /** 테스트 ID */
  'data-testid'?: string
  /** 차트 이름 (wrapper 테스트 ID용) */
  name?: string
  /** 차트 컨텐츠 */
  children: React.ReactNode
}

/**
 * ChartWrapper - 차트 공통 래퍼
 *
 * 로딩, 에러, 빈 데이터 상태를 처리하는 공통 래퍼
 * - 로딩: Skeleton 표시
 * - 에러: Result + 재시도 버튼
 * - 빈 데이터: Empty 컴포넌트
 * - 정상: children 렌더링
 *
 * @example
 * ```tsx
 * <ChartWrapper
 *   loading={isLoading}
 *   error={error}
 *   hasData={data.length > 0}
 *   name="line"
 * >
 *   <Line data={data} />
 * </ChartWrapper>
 * ```
 */
export function ChartWrapper({
  loading = false,
  error = null,
  onRetry,
  hasData,
  height = 256,
  'data-testid': testId,
  name,
  children,
}: ChartWrapperProps) {
  const wrapperTestId = name ? `chart-wrapper-${name}` : testId

  // 로딩 상태
  if (loading) {
    return (
      <div
        data-testid="chart-loading"
        style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Skeleton.Node active style={{ width: '100%', height: height - 32 }}>
          <div style={{ width: '100%', height: '100%' }} />
        </Skeleton.Node>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div
        data-testid="chart-error"
        style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Result
          status="error"
          title="차트를 표시할 수 없습니다"
          subTitle={error.message || '일시적인 오류가 발생했습니다.'}
          extra={
            onRetry && (
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={onRetry}
                data-testid="chart-retry-btn"
              >
                재시도
              </Button>
            )
          }
        />
      </div>
    )
  }

  // 빈 데이터 상태
  if (!hasData) {
    return (
      <div
        data-testid="chart-empty"
        style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Empty description="표시할 데이터가 없습니다" />
      </div>
    )
  }

  // 정상 상태 - 차트 렌더링
  return (
    <div data-testid={wrapperTestId} style={{ height }}>
      {children}
    </div>
  )
}

export default ChartWrapper
