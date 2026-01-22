// screens/sample/InventoryDetail/ItemSelect.tsx
// 품목 선택 AutoComplete 컴포넌트 (TSK-06-15)

'use client'

import React, { useMemo } from 'react'
import { AutoComplete, Card, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ItemSelectProps, InventoryItem } from './types'

const { Title } = Typography

/**
 * 품목 선택 AutoComplete 컴포넌트
 *
 * FR-001: 품목 선택 기능
 * - 품목코드 또는 품목명으로 검색 가능
 * - 실시간 필터링
 * - 최대 10개 항목 드롭다운 표시
 */
export function ItemSelect({
  items,
  selectedItemId,
  onSelect,
}: ItemSelectProps) {
  // 선택된 품목
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null
    return items.find((item) => item.id === selectedItemId) ?? null
  }, [items, selectedItemId])

  // AutoComplete 옵션 생성
  const options = useMemo(() => {
    return items.map((item) => ({
      value: item.id,
      label: `${item.code} - ${item.name}`,
      item,
    }))
  }, [items])

  // 선택 핸들러
  const handleSelect = (value: string) => {
    onSelect(value)
  }

  // 검색 필터
  const handleSearch = (searchText: string) => {
    // AutoComplete 내부 필터링을 위한 옵션 반환
    const filtered = options.filter(
      (option) =>
        option.item.code.toLowerCase().includes(searchText.toLowerCase()) ||
        option.item.name.toLowerCase().includes(searchText.toLowerCase())
    )
    return filtered
  }

  // 입력값 표시 (선택된 품목 또는 빈 값)
  const displayValue = selectedItem
    ? `${selectedItem.code} - ${selectedItem.name}`
    : undefined

  return (
    <Card
      data-testid="item-select-card"
      className="mb-4"
      styles={{ body: { padding: '16px' } }}
    >
      <Title level={5} className="mb-3 mt-0">
        품목 선택
      </Title>
      <AutoComplete
        data-testid="item-select"
        className="w-full"
        placeholder="품목코드 또는 품목명을 입력하세요"
        options={options}
        value={displayValue}
        onSelect={handleSelect}
        onSearch={handleSearch}
        filterOption={(inputValue, option) => {
          if (!option) return false
          const item = option.item as InventoryItem
          return (
            item.code.toLowerCase().includes(inputValue.toLowerCase()) ||
            item.name.toLowerCase().includes(inputValue.toLowerCase())
          )
        }}
        notFoundContent="검색 결과가 없습니다"
        allowClear
        onClear={() => onSelect(null)}
        suffixIcon={<SearchOutlined />}
        popupMatchSelectWidth
      >
        {options.map((option) => (
          <AutoComplete.Option
            key={option.value}
            value={option.value}
            data-testid="item-option"
            item={option.item}
          >
            <div className="flex items-center justify-between">
              <span>{option.label}</span>
              <span className="text-xs text-gray-400">
                {option.item.category}
              </span>
            </div>
          </AutoComplete.Option>
        ))}
      </AutoComplete>
    </Card>
  )
}

export default ItemSelect
