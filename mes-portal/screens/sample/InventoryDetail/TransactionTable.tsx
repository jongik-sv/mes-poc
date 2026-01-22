// screens/sample/InventoryDetail/TransactionTable.tsx
// 입출고 이력 테이블 컴포넌트 (TSK-06-15)

'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Table, DatePicker, Button, Tag, Empty, Space, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type {
  TransactionTableProps,
  InventoryTransaction,
  TransactionType,
} from './types'
import { TRANSACTION_TYPE_COLORS, TRANSACTION_TYPE_LABELS } from './types'
import {
  sortTransactionsByDate,
  filterTransactionsByDateRange,
  getDefaultDateRange,
  formatNumber,
  formatDateTime,
} from './utils'

const { RangePicker } = DatePicker
const { Text } = Typography

/**
 * 입출고 이력 테이블 컴포넌트
 *
 * FR-003: 입출고 이력 탭 (Table + RangePicker)
 * FR-006: 날짜 범위 선택 시 이력 필터링
 *
 * BR-002: 최신순 정렬
 * BR-003: 기본 조회 기간 30일
 */
export function TransactionTable({
  transactions,
  itemId,
}: TransactionTableProps) {
  // 기본 날짜 범위 (최근 30일)
  const defaultRange = useMemo(() => getDefaultDateRange(), [])
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >(defaultRange)

  // 해당 품목의 거래 내역만 필터링
  const itemTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.itemId === itemId)
  }, [transactions, itemId])

  // 날짜 필터링 및 정렬된 거래 내역
  const filteredTransactions = useMemo(() => {
    const filtered = filterTransactionsByDateRange(
      itemTransactions,
      dateRange[0],
      dateRange[1]
    )
    return sortTransactionsByDate(filtered)
  }, [itemTransactions, dateRange])

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = useCallback(
    (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
      if (dates) {
        setDateRange(dates)
      } else {
        setDateRange(defaultRange)
      }
    },
    [defaultRange]
  )

  // 검색 버튼 클릭 핸들러 (명시적 재조회)
  const handleSearch = useCallback(() => {
    // 현재 dateRange가 이미 적용되어 있으므로 추가 동작 불필요
    // UI 피드백을 위해 존재
  }, [])

  // 테이블 컬럼 정의
  const columns: ColumnsType<InventoryTransaction> = useMemo(
    () => [
      {
        title: 'No',
        key: 'index',
        width: 60,
        align: 'center',
        render: (_: unknown, __: InventoryTransaction, index: number) =>
          index + 1,
      },
      {
        title: '일시',
        dataIndex: 'date',
        key: 'date',
        width: 150,
        sorter: (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
        defaultSortOrder: 'descend',
        render: (date: string) => formatDateTime(date),
      },
      {
        title: '유형',
        dataIndex: 'type',
        key: 'type',
        width: 80,
        align: 'center',
        filters: [
          { text: '입고', value: 'in' },
          { text: '출고', value: 'out' },
        ],
        onFilter: (value, record) => record.type === value,
        render: (type: TransactionType) => (
          <Tag color={TRANSACTION_TYPE_COLORS[type]}>
            {TRANSACTION_TYPE_LABELS[type]}
          </Tag>
        ),
      },
      {
        title: '수량',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 100,
        align: 'right',
        sorter: (a, b) => a.quantity - b.quantity,
        render: (quantity: number, record: InventoryTransaction) => {
          const prefix = record.type === 'in' ? '+' : '-'
          const color = record.type === 'in' ? 'text-blue-600' : 'text-orange-600'
          return (
            <span className={color}>
              {prefix}
              {formatNumber(quantity)}
            </span>
          )
        },
      },
      {
        title: '담당자',
        dataIndex: 'handler',
        key: 'handler',
        width: 100,
      },
      {
        title: '참조문서',
        dataIndex: 'reference',
        key: 'reference',
        width: 130,
        render: (reference: string | undefined) => reference || '-',
      },
      {
        title: '비고',
        dataIndex: 'remarks',
        key: 'remarks',
        render: (remarks: string | undefined) => remarks || '-',
      },
    ],
    []
  )

  return (
    <div data-testid="transaction-table-container" className="flex flex-col h-full">
      {/* 기간 선택 영역 */}
      <div className="mb-4 flex items-center gap-3">
        <Text strong>기간 선택:</Text>
        <RangePicker
          data-testid="date-range-picker"
          value={dateRange}
          onChange={handleDateRangeChange}
          format="YYYY-MM-DD"
          allowClear
        />
        <Button
          data-testid="search-btn"
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
        >
          검색
        </Button>
      </div>

      {/* 테이블 */}
      {filteredTransactions.length > 0 ? (
        <Table
          data-testid="transaction-table"
          dataSource={filteredTransactions}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
            pageSizeOptions: ['10', '20', '50'],
          }}
          onRow={() =>
            ({
              'data-testid': `transaction-row`,
            }) as React.HTMLAttributes<HTMLTableRowElement>
          }
        />
      ) : (
        <div
          data-testid="transaction-empty"
          className="flex flex-1 items-center justify-center py-12"
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={4}>
                <Text type="secondary">입출고 이력이 없습니다</Text>
                <Text type="secondary" className="text-xs">
                  선택한 기간에 입출고 내역이 없습니다
                </Text>
              </Space>
            }
          />
        </div>
      )}
    </div>
  )
}

export default TransactionTable
