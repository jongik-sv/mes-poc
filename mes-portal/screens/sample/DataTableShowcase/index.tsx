// screens/sample/DataTableShowcase/index.tsx
// 데이터 테이블 종합 샘플 화면 (TSK-06-20)

'use client'

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  Table,
  Tag,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Space,
  Popover,
  message,
  Checkbox,
} from 'antd'
import type { TableProps, TableColumnType, TablePaginationConfig } from 'antd'
import type { FilterDropdownProps, FilterValue, SorterResult } from 'antd/es/table/interface'
import {
  FilterOutlined,
  HolderOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { Resizable } from 'react-resizable'
import 'react-resizable/css/styles.css'
import dayjs from '@/lib/dayjs'

import { FeatureTogglePanel } from './FeatureTogglePanel'
import { ExpandedRowContent } from './ExpandedRowContent'
import {
  useFeatureToggle,
  useTableFilter,
  useInlineEdit,
  useColumnResize,
  useColumnSettings,
} from './hooks'
import type { Product, ProductStatus, Category, FeatureToggles } from './types'
import { STATUS_COLORS, STATUS_LABELS } from './types'

import mockData from '@/mock-data/data-table.json'

/**
 * 1만건 가상 데이터 생성
 */
function generateLargeDataset(count: number = 10000): Product[] {
  const categories: Category[] = ['전자', '가구', '의류', '식품']
  const statuses: ProductStatus[] = ['active', 'inactive', 'pending']
  const baseData = mockData.data as Product[]

  return Array.from({ length: count }, (_, index) => {
    const baseItem = baseData[index % baseData.length]
    const id = index + 1
    return {
      ...baseItem,
      id,
      name: `${baseItem.name.split('-')[0]}-${String(id).padStart(5, '0')}`,
      category: categories[index % 4],
      quantity: Math.floor(Math.random() * 2000) + 10,
      price: Math.floor(Math.random() * 500000) + 1000,
      status: statuses[index % 3],
      statusLabel: STATUS_LABELS[statuses[index % 3]],
      createdAt: dayjs()
        .subtract(Math.floor(Math.random() * 365), 'day')
        .toISOString(),
    }
  })
}

/**
 * 리사이즈 가능한 헤더 셀
 */
function ResizableTitle(
  props: React.HTMLAttributes<HTMLTableCellElement> & {
    onResize: (e: React.SyntheticEvent, data: { size: { width: number } }) => void
    width: number
  }
) {
  const { onResize, width, ...restProps } = props

  if (!width) {
    return <th {...restProps} />
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => e.stopPropagation()}
          data-testid={`resize-handle`}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  )
}

/**
 * 상태 태그 컴포넌트
 */
function StatusTag({ status }: { status: ProductStatus }) {
  return (
    <Tag color={STATUS_COLORS[status]} data-testid={`status-tag-${status}`}>
      {STATUS_LABELS[status]}
    </Tag>
  )
}

/**
 * 가격 포맷팅
 */
function formatPrice(price: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price)
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString: string) {
  return dayjs(dateString).format('YYYY-MM-DD')
}

/**
 * 셀 병합 계산 (rowSpan)
 */
function calculateRowSpan(data: Product[], index: number, key: keyof Product): number {
  if (index === 0) {
    let span = 1
    for (let i = index + 1; i < data.length; i++) {
      if (data[i][key] === data[index][key]) {
        span++
      } else {
        break
      }
    }
    return span
  }

  // 이전 행과 같은 값이면 병합됨 (렌더링 안함)
  if (data[index][key] === data[index - 1][key]) {
    return 0
  }

  // 현재 행부터 같은 값 개수 세기
  let span = 1
  for (let i = index + 1; i < data.length; i++) {
    if (data[i][key] === data[index][key]) {
      span++
    } else {
      break
    }
  }
  return span
}

/**
 * 데이터 테이블 종합 샘플 화면
 *
 * 12개 테이블 기능을 모두 보여주는 쇼케이스 화면
 *
 * 주요 기능:
 * - FR-001: 정렬 (단일/다중 컬럼)
 * - FR-002: 필터링 (텍스트, 숫자 범위, 날짜, 드롭다운)
 * - FR-003: 페이지네이션
 * - FR-004: 행 선택 (단일/다중/전체)
 * - FR-005: 컬럼 리사이즈/순서 변경
 * - FR-006: 고정 컬럼/헤더
 * - FR-007: 확장 행
 * - FR-008: 인라인 편집
 * - FR-009: 행 드래그 정렬
 * - FR-010: 가상 스크롤
 * - FR-011: 그룹 헤더
 * - FR-012: 셀 병합
 * - BR-001: 기능 토글
 */
export function DataTableShowcase() {
  // 기능 토글 상태
  const {
    features,
    toggleFeature,
    enableAll,
    disableAll,
    resetToDefault,
  } = useFeatureToggle()

  // 데이터 상태
  const [data, setData] = useState<Product[]>(() => mockData.data as Product[])
  const [largeData] = useState<Product[]>(() => generateLargeDataset(10000))

  // 현재 표시할 데이터
  const currentData = features.virtualScroll ? largeData : data

  // 필터링
  const { filteredData, setFilter, removeFilter, clearFilters, activeFilterColumns } =
    useTableFilter(currentData)

  // 인라인 편집
  const { editingCell, startEdit, updateEditValue, saveEdit, cancelEdit, isEditing, handleKeyDown } =
    useInlineEdit(data, setData)

  // 컬럼 리사이즈
  const { columnWidths, handleResize, getColumnWidth } = useColumnResize({
    name: 200,
    category: 100,
    quantity: 100,
    price: 120,
    status: 100,
    createdAt: 120,
  })

  // 컬럼 설정
  const { saveSettings } = useColumnSettings([
    'name',
    'category',
    'quantity',
    'price',
    'status',
    'createdAt',
  ])

  // 선택된 행
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  // 확장된 행
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([])

  // 정렬 상태
  const [sortedInfo, setSortedInfo] = useState<{
    columnKey?: string
    order?: 'ascend' | 'descend'
  }>({})

  // 테이블 컨테이너 ref (가상 스크롤용)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // 설정 저장 (컬럼 너비 변경 시)
  useEffect(() => {
    saveSettings()
  }, [columnWidths, saveSettings])

  /**
   * 테이블 변경 핸들러 (정렬, 필터, 페이지네이션)
   */
  const handleTableChange: TableProps<Product>['onChange'] = useCallback(
    (
      _pagination: TablePaginationConfig,
      _filters: Record<string, FilterValue | null>,
      sorter: SorterResult<Product> | SorterResult<Product>[]
    ) => {
      if (!Array.isArray(sorter)) {
        setSortedInfo({
          columnKey: sorter.columnKey as string,
          order: sorter.order as 'ascend' | 'descend' | undefined,
        })
      }
    },
    []
  )

  /**
   * 필터 드롭다운 렌더러
   */
  const getFilterDropdown = useCallback(
    (
      columnKey: string,
      type: 'text' | 'number' | 'date' | 'dropdown',
      options?: string[]
    ) => {
      return ({ close }: FilterDropdownProps) => {
        const handleApply = (value: string | [number?, number?] | [string, string]) => {
          if (type === 'text' || type === 'dropdown') {
            setFilter({ column: columnKey, type, value: value as string })
          } else if (type === 'number') {
            const [min, max] = value as [number?, number?]
            setFilter({ column: columnKey, type, min, max })
          } else if (type === 'date') {
            setFilter({ column: columnKey, type, dateRange: value as [string, string] })
          }
          close()
          message.success('필터가 적용되었습니다')
        }

        const handleReset = () => {
          removeFilter(columnKey)
          close()
        }

        if (type === 'text') {
          return (
            <div className="p-2" style={{ minWidth: 200 }}>
              <Input
                placeholder="검색어 입력..."
                data-testid={`filter-input-${columnKey}`}
                onPressEnter={(e) => handleApply((e.target as HTMLInputElement).value)}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button size="small" onClick={handleReset} data-testid="filter-reset-btn">
                  초기화
                </Button>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => {
                    const input = document.querySelector(
                      `[data-testid="filter-input-${columnKey}"]`
                    ) as HTMLInputElement
                    handleApply(input?.value || '')
                  }}
                  data-testid="filter-apply-btn"
                >
                  적용
                </Button>
              </div>
            </div>
          )
        }

        if (type === 'number') {
          return (
            <div className="p-2" style={{ minWidth: 200 }}>
              <Space direction="vertical" className="w-full">
                <InputNumber
                  placeholder="최소값"
                  className="w-full"
                  data-testid={`filter-min-${columnKey}`}
                />
                <InputNumber
                  placeholder="최대값"
                  className="w-full"
                  data-testid={`filter-max-${columnKey}`}
                />
              </Space>
              <div className="flex justify-end gap-2 mt-2">
                <Button size="small" onClick={handleReset} data-testid="filter-reset-btn">
                  초기화
                </Button>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => {
                    const minInput = document.querySelector(
                      `[data-testid="filter-min-${columnKey}"]`
                    ) as HTMLInputElement
                    const maxInput = document.querySelector(
                      `[data-testid="filter-max-${columnKey}"]`
                    ) as HTMLInputElement
                    handleApply([
                      minInput?.value ? Number(minInput.value) : undefined,
                      maxInput?.value ? Number(maxInput.value) : undefined,
                    ])
                  }}
                  data-testid="filter-apply-btn"
                >
                  적용
                </Button>
              </div>
            </div>
          )
        }

        if (type === 'date') {
          return (
            <div className="p-2" style={{ minWidth: 280 }}>
              <DatePicker.RangePicker
                className="w-full"
                data-testid={`filter-date-${columnKey}`}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    handleApply([
                      dates[0].format('YYYY-MM-DD'),
                      dates[1].format('YYYY-MM-DD'),
                    ])
                  }
                }}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button size="small" onClick={handleReset} data-testid="filter-reset-btn">
                  초기화
                </Button>
              </div>
            </div>
          )
        }

        if (type === 'dropdown' && options) {
          return (
            <div className="p-2" style={{ minWidth: 150 }}>
              <Select
                placeholder="선택..."
                className="w-full"
                data-testid={`filter-select-${columnKey}`}
                options={options.map((opt) => ({ label: opt, value: opt }))}
                onChange={(value) => handleApply(value)}
                allowClear
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button size="small" onClick={handleReset} data-testid="filter-reset-btn">
                  초기화
                </Button>
              </div>
            </div>
          )
        }

        return null
      }
    },
    [setFilter, removeFilter]
  )

  /**
   * 인라인 편집 셀 렌더러
   */
  const renderEditableCell = useCallback(
    (
      text: string | number,
      record: Product,
      columnKey: string,
      type: 'text' | 'number' | 'select' = 'text',
      options?: string[]
    ) => {
      if (!features.inlineEdit) {
        return text
      }

      if (isEditing(record.id, columnKey)) {
        if (type === 'select' && options) {
          return (
            <Select
              size="small"
              value={editingCell?.value as string}
              options={options.map((opt) => ({ label: opt, value: opt }))}
              onChange={(value) => {
                updateEditValue(value)
                saveEdit()
              }}
              onBlur={saveEdit}
              autoFocus
              style={{ width: '100%' }}
              data-testid={`edit-input-${columnKey}-${record.id}`}
            />
          )
        }

        if (type === 'number') {
          return (
            <InputNumber
              size="small"
              value={editingCell?.value as number}
              onChange={(value) => updateEditValue(value ?? 0)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{ width: '100%' }}
              data-testid={`edit-input-${columnKey}-${record.id}`}
            />
          )
        }

        return (
          <Input
            size="small"
            value={editingCell?.value as string}
            onChange={(e) => updateEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            data-testid={`edit-input-${columnKey}-${record.id}`}
          />
        )
      }

      return (
        <div
          onDoubleClick={() => startEdit(record.id, columnKey, text)}
          className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 px-1 -mx-1 rounded"
          data-testid={`cell-${columnKey}-${record.id}`}
        >
          {text}
        </div>
      )
    },
    [features.inlineEdit, isEditing, editingCell, updateEditValue, saveEdit, handleKeyDown, startEdit]
  )

  /**
   * 테이블 컬럼 정의
   */
  const columns: TableColumnType<Product>[] = useMemo(() => {
    const baseColumns: TableColumnType<Product>[] = [
      {
        title: '제품명',
        dataIndex: 'name',
        key: 'name',
        width: getColumnWidth('name', 200),
        fixed: features.sticky ? ('left' as const) : undefined,
        sorter: features.sorting
          ? (a: Product, b: Product) => a.name.localeCompare(b.name, 'ko')
          : undefined,
        sortOrder: sortedInfo.columnKey === 'name' ? sortedInfo.order : undefined,
        filterDropdown: features.filtering
          ? getFilterDropdown('name', 'text')
          : undefined,
        filterIcon: features.filtering
          ? () => (
              <FilterOutlined
                style={{ color: activeFilterColumns.includes('name') ? '#1890ff' : undefined }}
                data-testid="filter-icon-name"
              />
            )
          : undefined,
        onHeaderCell: () => ({
          width: getColumnWidth('name', 200),
          onResize: features.resize ? handleResize('name') : undefined,
          'data-testid': 'column-header-name',
        }),
        render: (text: string, record: Product) =>
          renderEditableCell(text, record, 'name', 'text'),
        onCell: (_record: Product, index?: number) => {
          if (features.cellMerge && index !== undefined) {
            // 카테고리로 그룹핑된 경우 같은 카테고리 첫 번째 행만 표시
            return {}
          }
          return {}
        },
      },
      {
        title: '카테고리',
        dataIndex: 'category',
        key: 'category',
        width: getColumnWidth('category', 100),
        sorter: features.sorting
          ? (a: Product, b: Product) => a.category.localeCompare(b.category, 'ko')
          : undefined,
        sortOrder: sortedInfo.columnKey === 'category' ? sortedInfo.order : undefined,
        filterDropdown: features.filtering
          ? getFilterDropdown('category', 'dropdown', ['전자', '가구', '의류', '식품'])
          : undefined,
        filterIcon: features.filtering
          ? () => (
              <FilterOutlined
                style={{ color: activeFilterColumns.includes('category') ? '#1890ff' : undefined }}
                data-testid="filter-icon-category"
              />
            )
          : undefined,
        onHeaderCell: () => ({
          width: getColumnWidth('category', 100),
          onResize: features.resize ? handleResize('category') : undefined,
          'data-testid': 'column-header-category',
        }),
        onCell: (_record: Product, index?: number) => {
          if (features.cellMerge && index !== undefined) {
            const rowSpan = calculateRowSpan(filteredData, index, 'category')
            return { rowSpan }
          }
          return {}
        },
      },
      {
        title: '수량',
        dataIndex: 'quantity',
        key: 'quantity',
        width: getColumnWidth('quantity', 100),
        align: 'right',
        sorter: features.sorting
          ? (a: Product, b: Product) => a.quantity - b.quantity
          : undefined,
        sortOrder: sortedInfo.columnKey === 'quantity' ? sortedInfo.order : undefined,
        filterDropdown: features.filtering
          ? getFilterDropdown('quantity', 'number')
          : undefined,
        filterIcon: features.filtering
          ? () => (
              <FilterOutlined
                style={{ color: activeFilterColumns.includes('quantity') ? '#1890ff' : undefined }}
                data-testid="filter-icon-quantity"
              />
            )
          : undefined,
        onHeaderCell: () => ({
          width: getColumnWidth('quantity', 100),
          onResize: features.resize ? handleResize('quantity') : undefined,
          'data-testid': 'column-header-quantity',
        }),
        render: (value: number, record: Product) =>
          renderEditableCell(value, record, 'quantity', 'number'),
      },
      {
        title: '가격',
        dataIndex: 'price',
        key: 'price',
        width: getColumnWidth('price', 120),
        align: 'right',
        sorter: features.sorting
          ? (a: Product, b: Product) => a.price - b.price
          : undefined,
        sortOrder: sortedInfo.columnKey === 'price' ? sortedInfo.order : undefined,
        filterDropdown: features.filtering
          ? getFilterDropdown('price', 'number')
          : undefined,
        filterIcon: features.filtering
          ? () => (
              <FilterOutlined
                style={{ color: activeFilterColumns.includes('price') ? '#1890ff' : undefined }}
                data-testid="filter-icon-price"
              />
            )
          : undefined,
        onHeaderCell: () => ({
          width: getColumnWidth('price', 120),
          onResize: features.resize ? handleResize('price') : undefined,
          'data-testid': 'column-header-price',
        }),
        render: (price: number) => formatPrice(price),
      },
      {
        title: '상태',
        dataIndex: 'status',
        key: 'status',
        width: getColumnWidth('status', 100),
        filterDropdown: features.filtering
          ? getFilterDropdown('status', 'dropdown', ['active', 'inactive', 'pending'])
          : undefined,
        filterIcon: features.filtering
          ? () => (
              <FilterOutlined
                style={{ color: activeFilterColumns.includes('status') ? '#1890ff' : undefined }}
                data-testid="filter-icon-status"
              />
            )
          : undefined,
        onHeaderCell: () => ({
          width: getColumnWidth('status', 100),
          onResize: features.resize ? handleResize('status') : undefined,
          'data-testid': 'column-header-status',
        }),
        render: (status: ProductStatus) => <StatusTag status={status} />,
      },
      {
        title: '생성일',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: getColumnWidth('createdAt', 120),
        sorter: features.sorting
          ? (a: Product, b: Product) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : undefined,
        sortOrder: sortedInfo.columnKey === 'createdAt' ? sortedInfo.order : undefined,
        filterDropdown: features.filtering
          ? getFilterDropdown('createdAt', 'date')
          : undefined,
        filterIcon: features.filtering
          ? () => (
              <FilterOutlined
                style={{ color: activeFilterColumns.includes('createdAt') ? '#1890ff' : undefined }}
                data-testid="filter-icon-createdAt"
              />
            )
          : undefined,
        onHeaderCell: () => ({
          width: getColumnWidth('createdAt', 120),
          onResize: features.resize ? handleResize('createdAt') : undefined,
          'data-testid': 'column-header-createdAt',
        }),
        render: (date: string) => formatDate(date),
      },
    ]

    // 행 드래그 핸들 컬럼 추가
    if (features.rowDrag) {
      baseColumns.unshift({
        title: '',
        key: 'drag',
        width: 40,
        render: (_, record) => (
          <HolderOutlined
            className="cursor-move text-gray-400 hover:text-gray-600"
            data-testid={`drag-handle-${record.id}`}
          />
        ),
      })
    }

    return baseColumns
  }, [
    features,
    getColumnWidth,
    sortedInfo,
    getFilterDropdown,
    activeFilterColumns,
    handleResize,
    renderEditableCell,
    filteredData,
  ])

  /**
   * 그룹 헤더가 있는 컬럼
   */
  const groupedColumns = useMemo(() => {
    if (!features.groupHeader) {
      return columns
    }

    // 그룹 헤더 구조로 변환
    return [
      {
        title: '제품 정보',
        children: columns.filter((c) => c.key === 'name' || c.key === 'category'),
      },
      {
        title: '수량/가격',
        children: columns.filter((c) => c.key === 'quantity' || c.key === 'price'),
      },
      {
        title: '상태 정보',
        children: columns.filter((c) => c.key === 'status' || c.key === 'createdAt'),
      },
    ]
  }, [features.groupHeader, columns])

  /**
   * 행 선택 설정
   */
  const rowSelection: TableProps<Product>['rowSelection'] = features.selection
    ? {
        type: 'checkbox',
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
        columnWidth: 50,
      }
    : undefined

  /**
   * 확장 행 설정
   */
  const expandable: TableProps<Product>['expandable'] = features.expandable
    ? {
        expandedRowKeys,
        onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as React.Key[]),
        expandedRowRender: (record) => <ExpandedRowContent record={record} />,
        expandIcon: ({ expanded, onExpand, record }) => (
          <Button
            type="text"
            size="small"
            icon={expanded ? <DownOutlined /> : <RightOutlined />}
            onClick={(e) => onExpand(record, e)}
            data-testid={`expand-icon-${record.id}`}
          />
        ),
      }
    : undefined

  /**
   * 페이지네이션 설정
   */
  const pagination: TableProps<Product>['pagination'] = features.pagination
    ? {
        pageSize: features.virtualScroll ? 50 : 10,
        showSizeChanger: true,
        showTotal: (total) => (
          <span data-testid="total-count">총 {total.toLocaleString()}건</span>
        ),
        pageSizeOptions: features.virtualScroll
          ? ['50', '100', '200', '500']
          : ['10', '20', '50', '100'],
      }
    : false

  /**
   * 테이블 컴포넌트 설정
   */
  const tableComponents: TableProps<Product>['components'] = features.resize
    ? {
        header: {
          cell: ResizableTitle,
        },
      }
    : undefined

  return (
    <div data-testid="data-table-showcase-page" className="p-4 space-y-4">
      {/* 기능 토글 패널 */}
      <FeatureTogglePanel
        features={features}
        onToggle={toggleFeature}
        onEnableAll={enableAll}
        onDisableAll={disableAll}
        onReset={resetToDefault}
      />

      {/* 선택된 항목 정보 */}
      {features.selection && selectedRowKeys.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded flex items-center justify-between">
          <span data-testid="selected-count">
            {selectedRowKeys.length}개 항목 선택됨
          </span>
          <Button size="small" onClick={() => setSelectedRowKeys([])}>
            선택 해제
          </Button>
        </div>
      )}

      {/* 데이터 테이블 */}
      <div
        ref={tableContainerRef}
        data-testid="table-container"
        className={features.virtualScroll ? 'virtual-scroll-container' : ''}
      >
        <Table<Product>
          data-testid="data-table"
          columns={features.groupHeader ? groupedColumns : columns}
          dataSource={filteredData}
          rowKey="id"
          loading={false}
          onChange={handleTableChange}
          rowSelection={rowSelection}
          expandable={expandable}
          pagination={pagination}
          components={tableComponents}
          scroll={{
            x: features.sticky ? 'max-content' : undefined,
            y: features.virtualScroll ? 600 : undefined,
          }}
          sticky={features.sticky}
          virtual={features.virtualScroll}
          bordered
          size="middle"
          rowClassName={(record) => `table-row-${record.id}`}
        />
      </div>

      {/* 필터 초기화 버튼 */}
      {activeFilterColumns.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={clearFilters} data-testid="clear-all-filters-btn">
            모든 필터 초기화
          </Button>
        </div>
      )}
    </div>
  )
}

export default DataTableShowcase
