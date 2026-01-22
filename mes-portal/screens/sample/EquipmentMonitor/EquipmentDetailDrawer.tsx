// screens/sample/EquipmentMonitor/EquipmentDetailDrawer.tsx
// 설비 상세 정보 Drawer 컴포넌트 (TSK-06-10)

'use client'

import React from 'react'
import {
  Drawer,
  Descriptions,
  Tag,
  Progress,
  Timeline,
  Button,
  Typography,
  Divider,
} from 'antd'
import type { EquipmentDetailDrawerProps, StatusHistory } from './types'
import { STATUS_COLORS, STATUS_BG_COLORS } from './types'
import {
  getStatusText,
  formatDate,
  formatDateTime,
  formatNumber,
  calculateAchievementRate,
} from './utils'

const { Text, Title } = Typography

/**
 * 설비 상세 정보 Drawer
 *
 * 선택한 설비의 상세 정보를 Drawer로 표시합니다.
 * - 기본 정보: 설비코드, 설비명, 유형, 라인, 위치
 * - 운영 정보: 현재 상태, 가동률, 생산량
 * - 상태 이력: 최근 5건
 * - 점검 일정: 마지막 점검일, 다음 점검 예정일
 */
export function EquipmentDetailDrawer({
  equipment,
  open,
  onClose,
}: EquipmentDetailDrawerProps) {
  if (!equipment) return null

  const {
    code,
    name,
    typeLabel,
    lineName,
    location,
    status,
    manufacturer,
    installedAt,
    metrics,
    maintenance,
    operator,
    history,
  } = equipment

  const statusColor = STATUS_COLORS[status]
  const bgColor = STATUS_BG_COLORS[status]
  const achievementRate = calculateAchievementRate(
    metrics.todayProduction,
    metrics.targetProduction
  )

  // 상태 이력 타임라인 아이템 생성
  const timelineItems = history.slice(0, 5).map((item: StatusHistory) => ({
    color: STATUS_COLORS[item.newStatus] === 'default' ? 'gray' : STATUS_COLORS[item.newStatus],
    content: (
      <div>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {formatDateTime(item.timestamp)}
        </Text>
        <div style={{ marginTop: '2px' }}>
          <Text style={{ fontSize: '13px' }}>{item.reason}</Text>
        </div>
      </div>
    ),
  }))

  return (
    <Drawer
      data-testid="equipment-drawer"
      title={
        <div className="flex items-center gap-2">
          <span>{code}</span>
          <Text type="secondary" style={{ fontWeight: 'normal' }}>
            상세 정보
          </Text>
        </div>
      }
      placement="right"
      size="default"
      onClose={onClose}
      open={open}
      closeIcon={
        <span data-testid="equipment-drawer-close">
          &times;
        </span>
      }
      footer={
        <Button
          type="primary"
          block
          onClick={onClose}
          data-testid="equipment-drawer-close-btn"
        >
          닫기
        </Button>
      }
    >
      {/* 상태 배지 섹션 */}
      <div
        style={{
          backgroundColor: bgColor.light,
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
          marginBottom: '24px',
        }}
      >
        <Tag
          data-testid="equipment-drawer-status"
          color={statusColor}
          style={{ fontSize: '14px', padding: '4px 12px' }}
        >
          {getStatusText(status)}
        </Tag>
      </div>

      {/* 기본 정보 */}
      <Title level={5} style={{ marginBottom: '12px' }}>
        기본 정보
      </Title>
      <Descriptions
        column={1}
        bordered
        size="small"
        style={{ marginBottom: '24px' }}
      >
        <Descriptions.Item label="설비 코드">
          <Text data-testid="equipment-drawer-code">{code}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="설비명">
          <Text data-testid="equipment-drawer-name">{name}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="설비 유형">{typeLabel}</Descriptions.Item>
        <Descriptions.Item label="생산 라인">
          <Text data-testid="equipment-drawer-line">{lineName}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="위치">{location}</Descriptions.Item>
        <Descriptions.Item label="제조사">{manufacturer}</Descriptions.Item>
        <Descriptions.Item label="설치일">{formatDate(installedAt)}</Descriptions.Item>
      </Descriptions>

      {/* 운영 정보 */}
      <Title level={5} style={{ marginBottom: '12px' }}>
        운영 정보
      </Title>
      <Descriptions
        column={1}
        bordered
        size="small"
        style={{ marginBottom: '24px' }}
      >
        <Descriptions.Item label="현재 상태">
          <Tag color={statusColor}>{getStatusText(status)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="가동률">
          {status === 'RUNNING' ? (
            <div className="flex items-center gap-2">
              <Progress
                percent={metrics.efficiency}
                size="small"
                style={{ width: '100px' }}
              />
            </div>
          ) : (
            <Text type="secondary">--</Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="금일 생산">
          {formatNumber(metrics.todayProduction)} EA
        </Descriptions.Item>
        <Descriptions.Item label="목표 생산">
          {formatNumber(metrics.targetProduction)} EA
        </Descriptions.Item>
        <Descriptions.Item label="달성률">
          <Text
            style={{
              color: achievementRate >= 90 ? '#52C41A' : achievementRate >= 70 ? '#FAAD14' : '#FF4D4F',
            }}
          >
            {achievementRate}%
          </Text>
        </Descriptions.Item>
        {operator && (
          <Descriptions.Item label="담당자">
            <Text data-testid="equipment-drawer-operator">{operator}</Text>
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* 상태 이력 */}
      <Title level={5} style={{ marginBottom: '12px' }}>
        상태 이력 (최근 5건)
      </Title>
      {timelineItems.length > 0 ? (
        <Timeline items={timelineItems} />
      ) : (
        <Text type="secondary">이력이 없습니다.</Text>
      )}

      <Divider />

      {/* 점검 일정 */}
      <Title level={5} style={{ marginBottom: '12px' }}>
        점검 일정
      </Title>
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="마지막 점검">
          {formatDate(maintenance.lastMaintenanceAt)}
        </Descriptions.Item>
        <Descriptions.Item label="다음 점검 예정">
          {formatDate(maintenance.nextMaintenanceAt)}
        </Descriptions.Item>
        <Descriptions.Item label="점검 담당">
          {maintenance.maintenanceManager}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  )
}

export default EquipmentDetailDrawer
