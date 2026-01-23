// screens/sample/DataTableShowcase/ExpandedRowContent.tsx
// 확장 행 콘텐츠 컴포넌트

'use client'

import React from 'react'
import { Descriptions, Table, Tag } from 'antd'
import type { Product, ProcessInfo } from './types'

interface ExpandedRowContentProps {
  record: Product
}

const processStatusColors: Record<ProcessInfo['status'], string> = {
  completed: 'green',
  in_progress: 'blue',
  pending: 'orange',
  failed: 'red',
}

const processStatusLabels: Record<ProcessInfo['status'], string> = {
  completed: '완료',
  in_progress: '진행중',
  pending: '대기',
  failed: '실패',
}

/**
 * 확장 행 콘텐츠 컴포넌트
 * FR-007: 행 확장 시 상세 정보 표시
 */
export function ExpandedRowContent({ record }: ExpandedRowContentProps) {
  const { details } = record

  const processColumns = [
    {
      title: '공정명',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProcessInfo['status']) => (
        <Tag color={processStatusColors[status]}>
          {processStatusLabels[status]}
        </Tag>
      ),
    },
    {
      title: '소요시간',
      dataIndex: 'duration',
      key: 'duration',
    },
  ]

  return (
    <div
      data-testid={`expanded-content-${record.id}`}
      className="p-4 bg-gray-50 dark:bg-gray-800"
    >
      <Descriptions
        title="제품 상세 정보"
        size="small"
        column={{ xs: 1, sm: 2, md: 3 }}
        bordered
      >
        <Descriptions.Item label="설명">
          {details.description}
        </Descriptions.Item>
        <Descriptions.Item label="제조사">
          {details.manufacturer}
        </Descriptions.Item>
        <Descriptions.Item label="보증기간">
          {details.warranty}
        </Descriptions.Item>
      </Descriptions>

      {details.processes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">공정 정보</h4>
          <Table
            size="small"
            dataSource={details.processes}
            columns={processColumns}
            pagination={false}
            rowKey="name"
            bordered
          />
        </div>
      )}
    </div>
  )
}
