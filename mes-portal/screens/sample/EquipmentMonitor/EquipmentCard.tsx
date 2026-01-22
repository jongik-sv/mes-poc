// screens/sample/EquipmentMonitor/EquipmentCard.tsx
// 설비 카드 컴포넌트 (TSK-06-10)

'use client'

import React from 'react'
import { Card, Tag, Progress, Skeleton, Typography } from 'antd'
import { ExclamationCircleOutlined, ToolOutlined } from '@ant-design/icons'
import type { EquipmentCardProps } from './types'
import { STATUS_COLORS, STATUS_BORDER_COLORS, STATUS_BG_COLORS } from './types'
import { getStatusText, formatNumber } from './utils'

const { Text, Title } = Typography

/**
 * 설비 카드 컴포넌트
 *
 * 설비의 상태를 카드 형태로 표시합니다.
 * - 상태별 색상 구분 (가동: 녹색, 정지: 회색, 고장: 빨강, 점검: 노랑)
 * - 가동률 Progress 표시 (가동 상태일 때)
 * - 고장 시 에러 코드 표시
 * - 점검 시 점검 노트 표시
 */
export function EquipmentCard({ equipment, onClick, loading }: EquipmentCardProps) {
  const { id, code, name, lineName, status, metrics, errorCode, maintenanceNote } = equipment
  const statusColor = STATUS_COLORS[status]
  const borderColor = STATUS_BORDER_COLORS[status]
  const bgColor = STATUS_BG_COLORS[status]

  const handleClick = () => {
    onClick?.(equipment)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.(equipment)
    }
  }

  if (loading) {
    return (
      <Card
        data-testid={`equipment-card-${id}`}
        hoverable
        style={{
          borderTop: `3px solid ${borderColor}`,
          backgroundColor: bgColor.light,
        }}
      >
        <Skeleton active />
      </Card>
    )
  }

  return (
    <Card
      data-testid={`equipment-card-${id}`}
      hoverable
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${name}, 현재 상태: ${getStatusText(status)}`}
      style={{
        borderTop: `3px solid ${borderColor}`,
        backgroundColor: bgColor.light,
        cursor: 'pointer',
      }}
      styles={{
        body: { padding: '16px' },
      }}
    >
      {/* 헤더: 설비 코드 + 상태 뱃지 */}
      <div className="flex justify-between items-start mb-2">
        <Text
          data-testid={`equipment-code-${id}`}
          strong
          style={{ fontSize: '14px' }}
        >
          {code}
        </Text>
        <Tag
          data-testid={`equipment-status-badge-${id}`}
          color={statusColor}
          style={{ margin: 0 }}
        >
          {getStatusText(status)}
        </Tag>
      </div>

      {/* 설비명 */}
      <Title
        data-testid={`equipment-name-${id}`}
        level={5}
        style={{ margin: '0 0 12px 0', fontSize: '15px' }}
        ellipsis={{ rows: 1 }}
      >
        {name}
      </Title>

      {/* 구분선 */}
      <div className="border-t border-slate-200 my-3" />

      {/* 라인 정보 */}
      <Text
        data-testid={`equipment-line-${id}`}
        type="secondary"
        style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}
      >
        {lineName}
      </Text>

      {/* 상태별 정보 표시 */}
      {status === 'RUNNING' && (
        <div className="mt-2">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            가동률
          </Text>
          <div className="flex items-center gap-2 mt-1">
            <Progress
              percent={metrics.efficiency}
              size="small"
              showInfo={false}
              strokeColor="#2563EB"
              style={{ flex: 1 }}
            />
            <Text strong style={{ fontSize: '14px', minWidth: '40px' }}>
              {metrics.efficiency}%
            </Text>
          </div>
        </div>
      )}

      {status === 'STOPPED' && (
        <div className="mt-2">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            가동률
          </Text>
          <div className="flex items-center gap-2 mt-1">
            <Progress
              percent={0}
              size="small"
              showInfo={false}
              strokeColor="#D9D9D9"
              style={{ flex: 1 }}
            />
            <Text type="secondary" style={{ fontSize: '14px', minWidth: '40px' }}>
              --
            </Text>
          </div>
        </div>
      )}

      {status === 'FAULT' && (
        <div className="mt-2">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            상태
          </Text>
          <div className="flex items-center gap-2 mt-1">
            <ExclamationCircleOutlined style={{ color: '#FF4D4F' }} />
            <Text
              data-testid={`equipment-error-code-${id}`}
              style={{ color: '#FF4D4F', fontSize: '13px' }}
            >
              {errorCode || '에러 발생'}
            </Text>
          </div>
        </div>
      )}

      {status === 'MAINTENANCE' && (
        <div className="mt-2">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            상태
          </Text>
          <div className="flex items-center gap-2 mt-1">
            <ToolOutlined style={{ color: '#FAAD14' }} />
            <Text style={{ color: '#FAAD14', fontSize: '13px' }}>
              {maintenanceNote || '점검 중'}
            </Text>
          </div>
        </div>
      )}

      {/* 금일 생산량 (가동 상태일 때) */}
      {status === 'RUNNING' && metrics.todayProduction > 0 && (
        <div className="mt-2">
          <Text type="secondary" style={{ fontSize: '11px' }}>
            금일 생산: {formatNumber(metrics.todayProduction)}개
          </Text>
        </div>
      )}
    </Card>
  )
}

export default EquipmentCard
