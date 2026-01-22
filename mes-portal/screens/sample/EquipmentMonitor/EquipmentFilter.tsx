// screens/sample/EquipmentMonitor/EquipmentFilter.tsx
// 설비 필터 컴포넌트 (TSK-06-10)

'use client'

import React from 'react'
import { Select, Button, Space, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import type { EquipmentFilterProps, EquipmentStatus } from './types'
import { STATUS_LABELS } from './types'

const { Text } = Typography

/**
 * 설비 필터 컴포넌트
 *
 * 상태별, 라인별 필터링을 제공합니다.
 * - 상태 필터: 전체/가동/정지/고장/점검
 * - 라인 필터: 전체/A라인/B라인/...
 * - 초기화 버튼
 */
export function EquipmentFilter({
  filter,
  lines,
  onFilterChange,
  onReset,
}: EquipmentFilterProps) {
  const statusOptions = [
    { value: 'all', label: '전체 상태' },
    ...Object.entries(STATUS_LABELS).map(([value, label]) => ({
      value: value as EquipmentStatus,
      label,
    })),
  ]

  const lineOptions = [
    { value: 'all', label: '전체 라인' },
    ...lines.map((line) => ({
      value: line.id,
      label: line.name,
    })),
  ]

  const handleStatusChange = (value: EquipmentStatus | 'all') => {
    onFilterChange({ ...filter, status: value })
  }

  const handleLineChange = (value: string) => {
    onFilterChange({ ...filter, lineId: value })
  }

  const isFiltered = filter.status !== 'all' || filter.lineId !== 'all'

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <Space wrap>
        <div className="flex items-center gap-2">
          <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
            상태:
          </Text>
          <Select
            data-testid="status-filter"
            value={filter.status}
            onChange={handleStatusChange}
            options={statusOptions}
            style={{ width: 140 }}
            popupMatchSelectWidth={false}
          />
        </div>
        <div className="flex items-center gap-2">
          <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
            라인:
          </Text>
          <Select
            data-testid="line-filter"
            value={filter.lineId}
            onChange={handleLineChange}
            options={lineOptions}
            style={{ width: 140 }}
            popupMatchSelectWidth={false}
          />
        </div>
      </Space>
      {isFiltered && (
        <Button
          data-testid="filter-reset"
          type="text"
          icon={<ReloadOutlined />}
          onClick={onReset}
        >
          필터 초기화
        </Button>
      )}
    </div>
  )
}

export default EquipmentFilter
