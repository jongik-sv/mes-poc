// components/templates/DetailTemplate/DetailTabs.tsx
// 상세 화면 탭 영역 컴포넌트 (TSK-06-02)

'use client'

import React from 'react'
import { Card, Tabs, Badge, Skeleton } from 'antd'
import type { DetailTabsProps, DetailTabItem } from './types'

/**
 * 탭 아이템을 Ant Design Tabs 아이템 형식으로 변환
 */
function mapTabsToItems(tabs: DetailTabItem[]) {
  return tabs.map((tab) => ({
    key: tab.key,
    label: (
      <span data-testid={`detail-tab-${tab.key}`}>
        {tab.icon && <span className="mr-2">{tab.icon}</span>}
        {tab.label}
        {typeof tab.badge === 'number' && tab.badge > 0 && (
          <Badge
            count={tab.badge}
            size="small"
            style={{ marginLeft: 8 }}
          />
        )}
      </span>
    ),
    children: tab.children,
    disabled: tab.disabled,
  }))
}

/**
 * DetailTabs 컴포넌트
 *
 * 관련 정보를 탭으로 그룹화하여 표시합니다.
 * 탭 전환 시 컨텐츠 상태가 유지됩니다 (destroyOnHidden=false 기본).
 */
export function DetailTabs({
  tabs,
  activeKey,
  defaultActiveKey,
  onChange,
  destroyInactiveTabPane = false,
  lazyLoad = false,
  loading,
}: DetailTabsProps) {
  if (loading) {
    return (
      <Card className="mb-6" data-testid="detail-tabs-card">
        <div className="flex gap-4 mb-4">
          <Skeleton.Button active size="small" />
          <Skeleton.Button active size="small" />
          <Skeleton.Button active size="small" />
        </div>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    )
  }

  if (!tabs || tabs.length === 0) {
    return null
  }

  const items = mapTabsToItems(tabs)

  return (
    <Card className="mb-6" data-testid="detail-tabs-card">
      <Tabs
        data-testid="detail-tabs"
        items={items}
        activeKey={activeKey}
        defaultActiveKey={defaultActiveKey || tabs[0]?.key}
        onChange={onChange}
        destroyOnHidden={destroyInactiveTabPane}
      />
    </Card>
  )
}

export default DetailTabs
