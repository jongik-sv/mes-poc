// components/templates/DetailTemplate/DetailFooter.tsx
// 상세 화면 하단 영역 컴포넌트 (TSK-06-02)

'use client'

import React from 'react'
import { Button, Space } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import type { DetailFooterProps } from './types'

/**
 * DetailFooter 컴포넌트
 *
 * 상세 화면 하단의 액션 영역을 렌더링합니다.
 * - 목록으로 돌아가기 버튼
 * - 추가 액션 버튼 (extra)
 */
export function DetailFooter({ onBack, extra }: DetailFooterProps) {
  if (!onBack && !extra) {
    return null
  }

  return (
    <div
      className="flex justify-end pt-4 border-t border-gray-200"
      data-testid="detail-footer"
    >
      <Space>
        {extra}
        {onBack && (
          <Button
            data-testid="detail-back-btn"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
          >
            목록으로
          </Button>
        )}
      </Space>
    </div>
  )
}

export default DetailFooter
