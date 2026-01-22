// screens/sample/InventoryDetail/index.tsx
// 재고 현황 조회 메인 화면 컴포넌트 (TSK-06-15)

'use client'

import React, { useState, useMemo } from 'react'
import { Card, Tabs, Empty, Skeleton, Typography } from 'antd'
import {
  UnorderedListOutlined,
  LineChartOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { ItemSelect } from './ItemSelect'
import { InventoryDescriptions } from './InventoryDescriptions'
import { TransactionTable } from './TransactionTable'
import { StockTrendChart } from './StockTrendChart'
import mockData from '@/mock-data/inventory.json'
import type { InventoryData, InventoryItem } from './types'

const { Title, Text } = Typography

/**
 * 재고 현황 조회 메인 화면
 *
 * FR-001: 품목 선택 (AutoComplete)
 * FR-002: 재고 상세 정보 (Descriptions)
 * FR-003: 입출고 이력 탭 (Table + RangePicker)
 * FR-004: 재고 추이 차트 탭 (Line Chart)
 * FR-005: 로딩/빈 상태 처리
 *
 * 화면 흐름:
 * 1. 초기 상태: 품목 미선택 → Empty 표시
 * 2. 품목 선택 → 로딩 (Skeleton) → 상세 정보 표시
 * 3. 탭 전환: 입출고 이력 / 재고 추이
 */
export function InventoryDetail() {
  // mock 데이터
  const data = mockData as InventoryData

  // 상태
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('transactions')

  // 선택된 품목 정보
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null
    return data.items.find((item) => item.id === selectedItemId) ?? null
  }, [selectedItemId, data.items])

  // 품목 선택 핸들러
  const handleItemSelect = (itemId: string | null) => {
    if (itemId) {
      // 로딩 시뮬레이션
      setIsLoading(true)
      setTimeout(() => {
        setSelectedItemId(itemId)
        setIsLoading(false)
        setActiveTab('transactions') // 탭 초기화
      }, 500)
    } else {
      setSelectedItemId(null)
    }
  }

  // 탭 아이템
  const tabItems = useMemo(() => {
    if (!selectedItem) return []
    return [
      {
        key: 'transactions',
        label: (
          <span>
            <UnorderedListOutlined />
            입출고 이력
          </span>
        ),
        children: (
          <TransactionTable
            transactions={data.transactions}
            itemId={selectedItem.id}
          />
        ),
      },
      {
        key: 'trend',
        label: (
          <span>
            <LineChartOutlined />
            재고 추이
          </span>
        ),
        children: (
          <StockTrendChart
            trends={data.trends}
            itemId={selectedItem.id}
            safetyStock={selectedItem.safetyStock}
          />
        ),
      },
    ]
  }, [selectedItem, data.transactions, data.trends])

  // 로딩 상태 Skeleton
  const renderLoading = () => (
    <Card data-testid="loading-skeleton">
      <Skeleton active paragraph={{ rows: 6 }} />
      <div className="mt-6">
        <Skeleton.Button active style={{ width: 100 }} />
        <Skeleton.Button active style={{ width: 100, marginLeft: 16 }} />
      </div>
      <div className="mt-4">
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    </Card>
  )

  // 빈 상태 (품목 미선택)
  const renderEmpty = () => (
    <Card
      data-testid="empty-state"
      className="flex items-center justify-center"
      style={{ minHeight: 400 }}
    >
      <Empty
        image={
          <InboxOutlined style={{ fontSize: 64, color: 'var(--ant-color-text-quaternary)' }} />
        }
        imageStyle={{ height: 80 }}
        description={
          <div className="text-center">
            <Text type="secondary" className="block text-base">
              품목을 선택해주세요
            </Text>
            <Text type="secondary" className="block text-sm mt-1">
              조회할 품목을 검색하여 선택하면 상세 정보를 확인할 수 있습니다.
            </Text>
          </div>
        }
      />
    </Card>
  )

  // 상세 정보 표시
  const renderDetail = () => {
    if (!selectedItem) return null
    return (
      <div data-testid="detail-content" className="space-y-4">
        {/* 상세 정보 Descriptions */}
        <InventoryDescriptions item={selectedItem} />

        {/* 탭 영역 */}
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems.map((tab) => ({
              key: tab.key,
              label: tab.label,
              children: tab.children,
              'data-testid':
                tab.key === 'transactions' ? 'tab-transactions' : 'tab-trend',
            }))}
          />
        </Card>
      </div>
    )
  }

  return (
    <div data-testid="inventory-detail-page" className="p-4">
      {/* 헤더 */}
      <Title level={4} className="mb-4">
        재고 현황 조회
      </Title>

      {/* 품목 선택 */}
      <ItemSelect
        items={data.items as InventoryItem[]}
        selectedItemId={selectedItemId}
        onSelect={handleItemSelect}
      />

      {/* 컨텐츠 영역 */}
      {isLoading ? renderLoading() : selectedItem ? renderDetail() : renderEmpty()}
    </div>
  )
}

export default InventoryDetail
