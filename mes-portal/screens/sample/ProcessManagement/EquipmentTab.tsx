/**
 * @file EquipmentTab.tsx
 * @description 설비 연결 탭 컴포넌트
 * @task TSK-06-18
 */

'use client'

import React, { useMemo } from 'react'
import { Table, Tag, Empty } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { EquipmentData, EquipmentStatus } from './types'
import { EQUIPMENT_STATUS_LABELS, EQUIPMENT_STATUS_COLORS } from './types'

interface EquipmentTabProps {
  equipment?: EquipmentData[]
  loading?: boolean
}

/**
 * 설비 상태 태그 컴포넌트
 */
function EquipmentStatusTag({ status }: { status: EquipmentStatus }) {
  return (
    <Tag color={EQUIPMENT_STATUS_COLORS[status]}>
      {EQUIPMENT_STATUS_LABELS[status]}
    </Tag>
  )
}

/**
 * 설비 연결 탭 컴포넌트
 */
export function EquipmentTab({ equipment = [], loading = false }: EquipmentTabProps) {
  /**
   * 테이블 컬럼 정의
   */
  const columns: ColumnsType<EquipmentData> = useMemo(
    () => [
      {
        title: '설비코드',
        dataIndex: 'code',
        key: 'code',
        width: 150,
      },
      {
        title: '설비명',
        dataIndex: 'name',
        key: 'name',
        width: 200,
      },
      {
        title: '상태',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: EquipmentStatus) => (
          <EquipmentStatusTag status={status} />
        ),
      },
    ],
    []
  )

  // 데이터 없음 표시
  if (!loading && equipment.length === 0) {
    return (
      <Empty
        description="연결된 설비가 없습니다"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )
  }

  return (
    <Table<EquipmentData>
      data-testid="equipment-table"
      columns={columns}
      dataSource={equipment}
      rowKey="id"
      loading={loading}
      pagination={false}
      size="small"
    />
  )
}

export default EquipmentTab
