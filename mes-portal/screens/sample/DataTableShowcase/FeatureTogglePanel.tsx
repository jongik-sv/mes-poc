// screens/sample/DataTableShowcase/FeatureTogglePanel.tsx
// 기능 토글 패널 컴포넌트

'use client'

import React from 'react'
import { Card, Switch, Space, Button, Tooltip, Row, Col } from 'antd'
import { ReloadOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import type { FeatureToggles } from './types'
import { FEATURE_TOGGLE_LABELS } from './types'

interface FeatureTogglePanelProps {
  features: FeatureToggles
  onToggle: (key: keyof FeatureToggles) => void
  onEnableAll: () => void
  onDisableAll: () => void
  onReset: () => void
}

/**
 * 기능 토글 패널 컴포넌트
 * BR-001: 12개 기능 각각 ON/OFF 토글 가능
 */
export function FeatureTogglePanel({
  features,
  onToggle,
  onEnableAll,
  onDisableAll,
  onReset,
}: FeatureTogglePanelProps) {
  const featureKeys = Object.keys(features) as (keyof FeatureToggles)[]

  return (
    <Card
      size="small"
      title="기능 토글"
      data-testid="feature-toggle-panel"
      extra={
        <Space size="small">
          <Tooltip title="모두 활성화">
            <Button
              size="small"
              icon={<CheckOutlined />}
              onClick={onEnableAll}
              data-testid="enable-all-btn"
            />
          </Tooltip>
          <Tooltip title="모두 비활성화">
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={onDisableAll}
              data-testid="disable-all-btn"
            />
          </Tooltip>
          <Tooltip title="기본값으로 초기화">
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={onReset}
              data-testid="reset-toggles-btn"
            />
          </Tooltip>
        </Space>
      }
    >
      <Row gutter={[8, 8]}>
        {featureKeys.map((key) => (
          <Col key={key} xs={12} sm={8} md={6} lg={4}>
            <Space size="small">
              <Switch
                size="small"
                checked={features[key]}
                onChange={() => onToggle(key)}
                data-testid={`toggle-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
              />
              <span className="text-sm">{FEATURE_TOGGLE_LABELS[key]}</span>
            </Space>
          </Col>
        ))}
      </Row>
    </Card>
  )
}
