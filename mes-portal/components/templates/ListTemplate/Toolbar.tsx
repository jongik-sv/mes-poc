// components/templates/ListTemplate/Toolbar.tsx
// 툴바 컴포넌트 (TSK-06-01)

'use client'

import React from 'react'
import { Button, Space, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ToolbarProps } from './types'

const { Text } = Typography

/**
 * Toolbar 컴포넌트
 *
 * 신규/삭제 버튼과 선택 건수/총 건수를 표시합니다.
 */
export function Toolbar({
  onAdd,
  addButtonText = '신규',
  onDelete,
  deleteButtonText = '삭제',
  selectedCount,
  total,
  deleteDisabled,
  addDisabled,
  extra,
  loading,
}: ToolbarProps) {
  return (
    <div
      data-testid="grid-toolbar"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      {/* 좌측: 액션 버튼 */}
      <Space>
        {onAdd && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
            disabled={addDisabled || loading}
            data-testid="add-btn"
          >
            {addButtonText}
          </Button>
        )}
        {onDelete && (
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={onDelete}
            disabled={deleteDisabled || selectedCount === 0 || loading}
            data-testid="delete-btn"
          >
            {deleteButtonText}
          </Button>
        )}
        {extra}
      </Space>

      {/* 우측: 선택 건수 / 총 건수 */}
      <Space>
        {selectedCount > 0 && (
          <Text data-testid="selected-count">
            {selectedCount}건 선택됨
          </Text>
        )}
        <Text data-testid="total-count">
          총 {total}건
        </Text>
      </Space>
    </div>
  )
}

export default Toolbar
