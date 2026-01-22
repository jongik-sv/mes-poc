// components/templates/DetailTemplate/DetailDescriptions.tsx
// 상세 화면 기본 정보 영역 컴포넌트 (TSK-06-02)

'use client'

import React from 'react'
import { Card, Descriptions, Skeleton } from 'antd'
import type { DetailDescriptionsProps } from './types'

/**
 * DetailDescriptions 컴포넌트
 *
 * 기본 정보를 Descriptions 컴포넌트로 표시합니다.
 * 반응형 레이아웃을 지원하며, 로딩 상태에서 스켈레톤을 표시합니다.
 */
export function DetailDescriptions({
  descriptionsProps,
  title = '기본 정보',
  loading,
}: DetailDescriptionsProps) {
  if (loading) {
    return (
      <Card
        title={title}
        className="mb-6"
        data-testid="detail-descriptions-card"
      >
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    )
  }

  // 기본 column 설정 (반응형)
  const defaultColumn = { xs: 1, sm: 2, lg: 3 }

  return (
    <Card
      title={title}
      className="mb-6"
      data-testid="detail-descriptions-card"
    >
      <Descriptions
        bordered
        size="middle"
        column={defaultColumn}
        {...descriptionsProps}
        data-testid="detail-descriptions"
      />
    </Card>
  )
}

export default DetailDescriptions
