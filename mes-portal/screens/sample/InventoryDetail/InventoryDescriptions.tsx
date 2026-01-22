// screens/sample/InventoryDetail/InventoryDescriptions.tsx
// 재고 상세 정보 Descriptions 컴포넌트 (TSK-06-15)

'use client'

import React from 'react'
import { Descriptions, Tag } from 'antd'
import type { InventoryDescriptionsProps } from './types'
import { STOCK_STATUS_COLORS, STOCK_STATUS_LABELS } from './types'
import { formatNumber, formatDate } from './utils'

/**
 * 재고 상세 정보 Descriptions 컴포넌트
 *
 * FR-002: 재고 상세 정보 표시
 * - 품목코드, 품목명, 카테고리, 규격
 * - 현재 재고, 안전 재고, 재고 상태
 * - 최종 입고일, 최종 출고일
 * - 창고 위치, 비고
 *
 * BR-001: 재고 상태 색상 표시
 */
export function InventoryDescriptions({ item }: InventoryDescriptionsProps) {
  return (
    <Descriptions
      data-testid="inventory-descriptions"
      bordered
      column={{ xs: 1, sm: 2, md: 3 }}
      size="small"
      title="재고 상세 정보"
    >
      <Descriptions.Item label="품목코드">
        <span data-testid="item-code">{item.code}</span>
      </Descriptions.Item>
      <Descriptions.Item label="품목명">
        <span data-testid="item-name">{item.name}</span>
      </Descriptions.Item>
      <Descriptions.Item label="카테고리">
        <span data-testid="item-category">{item.category}</span>
      </Descriptions.Item>
      <Descriptions.Item label="규격">
        <span data-testid="item-specification">{item.specification}</span>
      </Descriptions.Item>
      <Descriptions.Item label="단위">
        <span data-testid="item-unit">{item.unit}</span>
      </Descriptions.Item>
      <Descriptions.Item label="창고 위치">
        <span data-testid="item-warehouse">{item.warehouse}</span>
      </Descriptions.Item>
      <Descriptions.Item label="현재 재고">
        <span data-testid="current-stock" className="font-semibold">
          {formatNumber(item.currentStock)} {item.unit}
        </span>
      </Descriptions.Item>
      <Descriptions.Item label="안전 재고">
        <span data-testid="safety-stock">
          {formatNumber(item.safetyStock)} {item.unit}
        </span>
      </Descriptions.Item>
      <Descriptions.Item label="재고 상태">
        <Tag
          data-testid="stock-status"
          color={STOCK_STATUS_COLORS[item.status]}
        >
          {STOCK_STATUS_LABELS[item.status]}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="최종 입고일">
        <span data-testid="last-in-date">{formatDate(item.lastInDate)}</span>
      </Descriptions.Item>
      <Descriptions.Item label="최종 출고일">
        <span data-testid="last-out-date">{formatDate(item.lastOutDate)}</span>
      </Descriptions.Item>
      <Descriptions.Item label="비고">
        <span data-testid="item-remarks">{item.remarks || '-'}</span>
      </Descriptions.Item>
    </Descriptions>
  )
}

export default InventoryDescriptions
