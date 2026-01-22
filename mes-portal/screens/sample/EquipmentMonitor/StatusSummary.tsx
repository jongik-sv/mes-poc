// screens/sample/EquipmentMonitor/StatusSummary.tsx
// 상태 요약 컴포넌트 (TSK-06-10)

'use client'

import React from 'react'
import { Card, Statistic, Row, Col } from 'antd'
import type { StatusSummaryProps, EquipmentStatus } from './types'
import { STATUS_LABELS, STATUS_BORDER_COLORS } from './types'

/**
 * 상태 요약 컴포넌트
 *
 * 전체 설비 수와 상태별 개수를 표시합니다.
 */
export function StatusSummary({ counts }: StatusSummaryProps) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

  const statusItems: { key: EquipmentStatus; label: string; color: string }[] = [
    { key: 'RUNNING', label: STATUS_LABELS.RUNNING, color: STATUS_BORDER_COLORS.RUNNING },
    { key: 'STOPPED', label: STATUS_LABELS.STOPPED, color: STATUS_BORDER_COLORS.STOPPED },
    { key: 'FAULT', label: STATUS_LABELS.FAULT, color: STATUS_BORDER_COLORS.FAULT },
    { key: 'MAINTENANCE', label: STATUS_LABELS.MAINTENANCE, color: STATUS_BORDER_COLORS.MAINTENANCE },
  ]

  return (
    <Card size="small" style={{ marginBottom: '16px' }}>
      <Row gutter={[16, 8]} align="middle">
        <Col>
          <Statistic
            data-testid="summary-total"
            title="전체"
            value={total}
            suffix="대"
            styles={{ content: { fontSize: '20px', fontWeight: 'bold' } }}
          />
        </Col>
        {statusItems.map(({ key, label, color }) => (
          <Col key={key}>
            <Statistic
              data-testid={`summary-${key.toLowerCase()}`}
              title={label}
              value={counts[key]}
              suffix="대"
              styles={{ content: { fontSize: '18px', color } }}
            />
          </Col>
        ))}
      </Row>
    </Card>
  )
}

export default StatusSummary
