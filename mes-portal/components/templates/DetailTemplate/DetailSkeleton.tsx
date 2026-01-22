// components/templates/DetailTemplate/DetailSkeleton.tsx
// 상세 화면 로딩 스켈레톤 컴포넌트 (TSK-06-02)

'use client'

import React from 'react'
import { Card, Skeleton, Space } from 'antd'
import type { DetailSkeletonProps } from './types'

/**
 * DetailSkeleton 컴포넌트
 *
 * 상세 화면 로딩 중 스켈레톤 UI를 표시합니다.
 * 레이아웃을 유지하면서 로딩 상태를 시각적으로 표현합니다.
 */
export function DetailSkeleton({
  descriptionRows = 6,
  showTabs = true,
  tabCount = 3,
}: DetailSkeletonProps) {
  return (
    <div data-testid="detail-loading">
      {/* 헤더 스켈레톤 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Skeleton.Avatar active size="large" />
          <div>
            <Skeleton.Input active size="small" style={{ width: 200 }} />
          </div>
        </div>
        <Space>
          <Skeleton.Button active size="default" />
          <Skeleton.Button active size="default" />
        </Space>
      </div>

      {/* 기본 정보 스켈레톤 */}
      <Card className="mb-6">
        <Skeleton.Input
          active
          size="small"
          style={{ width: 100, marginBottom: 16 }}
        />
        <Skeleton active paragraph={{ rows: descriptionRows }} />
      </Card>

      {/* 탭 영역 스켈레톤 */}
      {showTabs && (
        <Card className="mb-6">
          <div className="flex gap-4 mb-4">
            {Array.from({ length: tabCount }).map((_, index) => (
              <Skeleton.Button key={index} active size="small" />
            ))}
          </div>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      )}

      {/* 하단 버튼 스켈레톤 */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Skeleton.Button active size="default" />
      </div>
    </div>
  )
}

export default DetailSkeleton
