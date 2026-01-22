// components/templates/DetailTemplate/DetailHeader.tsx
// 상세 화면 헤더 컴포넌트 (TSK-06-02)

'use client'

import React from 'react'
import { Button, Space, Typography, Skeleton } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { DetailHeaderProps } from './types'

const { Title, Text } = Typography

/**
 * DetailHeader 컴포넌트
 *
 * 상세 화면의 헤더 영역을 렌더링합니다.
 * - 제목 및 부제목
 * - 수정/삭제 액션 버튼
 */
export function DetailHeader({
  title,
  subtitle,
  titleIcon,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
  extra,
  loading,
}: DetailHeaderProps) {
  if (loading) {
    return (
      <div
        className="flex justify-between items-center mb-6"
        data-testid="detail-header"
      >
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
    )
  }

  return (
    <div
      className="flex justify-between items-center mb-6"
      data-testid="detail-header"
    >
      <div className="flex items-center gap-3">
        {titleIcon && (
          <span className="text-2xl text-primary">{titleIcon}</span>
        )}
        <div>
          <Title
            level={4}
            style={{ marginBottom: subtitle ? 0 : undefined }}
          >
            {title}
          </Title>
          {subtitle && (
            <Text type="secondary">{subtitle}</Text>
          )}
        </div>
      </div>

      <Space>
        {extra}
        {showEdit && onEdit && (
          <Button
            data-testid="detail-edit-btn"
            icon={<EditOutlined />}
            onClick={onEdit}
          >
            수정
          </Button>
        )}
        {showDelete && onDelete && (
          <Button
            data-testid="detail-delete-btn"
            danger
            icon={<DeleteOutlined />}
            onClick={onDelete}
          >
            삭제
          </Button>
        )}
      </Space>
    </div>
  )
}

export default DetailHeader
