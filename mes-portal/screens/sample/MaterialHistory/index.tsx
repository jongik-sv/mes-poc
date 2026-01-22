// screens/sample/MaterialHistory/index.tsx
// 자재 입출고 내역 샘플 화면 (TSK-06-17)

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Tag, message, Empty, Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { ListTemplate } from '@/components/templates/ListTemplate'
import type { SearchFieldDefinition } from '@/components/templates/ListTemplate'
import type { DataTableColumn } from '@/components/common/DataTable'
import dayjs from 'dayjs'
import { useMaterialHistory, filterMaterialHistory } from './useMaterialHistory'
import type { MaterialHistory, MaterialHistorySearchParams, TransactionType } from './types'
import { TRANSACTION_TYPE_COLORS, TRANSACTION_TYPE_LABELS } from './types'

/**
 * 검색 필드 정의
 * FR-001: 검색 조건 (자재명, 입출고유형, 기간)
 * FR-002: RangePicker로 기간 선택
 */
const searchFields: SearchFieldDefinition[] = [
  {
    name: 'materialName',
    label: '자재명',
    type: 'text',
    placeholder: '자재명 검색...',
    span: 6,
  },
  {
    name: 'transactionType',
    label: '입출고유형',
    type: 'select',
    placeholder: '전체',
    span: 6,
    options: [
      { label: '전체', value: '' },
      { label: '입고', value: 'in' },
      { label: '출고', value: 'out' },
    ],
  },
  {
    name: 'dateRange',
    label: '기간',
    type: 'dateRange',
    placeholder: '기간 선택',
    span: 8,
  },
]

/**
 * 입출고유형 태그 컴포넌트
 */
function TransactionTypeTag({ type }: { type: TransactionType }) {
  return (
    <Tag color={TRANSACTION_TYPE_COLORS[type]}>
      {TRANSACTION_TYPE_LABELS[type]}
    </Tag>
  )
}

/**
 * 날짜 포맷팅 함수
 */
function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '-'
  return dayjs(dateString).format('YYYY-MM-DD')
}

/**
 * 자재 입출고 내역 샘플 화면
 *
 * ListTemplate 컴포넌트의 확장 기능을 검증하는 참조 구현
 *
 * 주요 기능:
 * - 검색 조건: 자재명, 입출고유형, 기간(RangePicker)
 * - 테이블: 정렬/페이징, 컬럼 리사이즈
 * - 다중 행 선택 및 일괄 삭제/내보내기
 */
export function MaterialHistoryScreen() {
  // 데이터 및 상태 관리
  const {
    items,
    loading,
    searchParams,
    setSearchParams,
    deleteItems,
  } = useMaterialHistory()

  // 선택된 행
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  // 필터링된 데이터
  const filteredItems = useMemo(() => {
    return filterMaterialHistory(items, searchParams)
  }, [items, searchParams])

  /**
   * 테이블 컬럼 정의
   * FR-003: 테이블 정렬/페이징/필터링
   * FR-006: 컬럼 리사이즈 (DataTable 지원)
   */
  const columns: DataTableColumn<MaterialHistory>[] = useMemo(() => [
    {
      title: '자재명',
      dataIndex: 'materialName',
      key: 'materialName',
      sorter: (a: MaterialHistory, b: MaterialHistory) => a.materialName.localeCompare(b.materialName, 'ko'),
      width: 120,
    },
    {
      title: '자재코드',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 100,
    },
    {
      title: '입출고유형',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 100,
      render: (type: TransactionType) => <TransactionTypeTag type={type} />,
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a: MaterialHistory, b: MaterialHistory) => a.quantity - b.quantity,
      width: 80,
      align: 'right' as const,
    },
    {
      title: '단위',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
    },
    {
      title: '입출고일자',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      sorter: (a: MaterialHistory, b: MaterialHistory) =>
        new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime(),
      width: 120,
      defaultSortOrder: 'descend' as const,
      render: (date: string) => formatDate(date),
    },
    {
      title: '창고',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 80,
    },
    {
      title: '담당자',
      dataIndex: 'handler',
      key: 'handler',
      width: 80,
    },
    {
      title: '비고',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
    },
  ], [])

  /**
   * 검색 핸들러
   */
  const handleSearch = useCallback((params: Record<string, unknown>) => {
    // dateRange 변환: dayjs 객체 → string 배열
    const processedParams: MaterialHistorySearchParams = {
      materialName: params.materialName as string | undefined,
      transactionType: params.transactionType as TransactionType | '' | undefined,
    }

    if (params.dateRange && Array.isArray(params.dateRange)) {
      const [start, end] = params.dateRange
      if (start && end) {
        processedParams.dateRange = [
          dayjs(start).format('YYYY-MM-DD'),
          dayjs(end).format('YYYY-MM-DD'),
        ]
      }
    }

    setSearchParams(processedParams)
    // 검색 시 선택 초기화
    setSelectedRowKeys([])
  }, [setSearchParams])

  /**
   * 삭제 핸들러 (BR-03: 확인 다이얼로그는 ListTemplate에서 처리)
   */
  const handleDelete = useCallback(async (rows: MaterialHistory[]) => {
    const ids = rows.map((r) => r.id)
    await deleteItems(ids)
    message.success('삭제되었습니다')
    setSelectedRowKeys([])
  }, [deleteItems])

  /**
   * 내보내기 핸들러 (UC-04)
   */
  const handleExport = useCallback(() => {
    // CSV 내보내기 구현
    const headers = ['자재명', '자재코드', '입출고유형', '수량', '단위', '입출고일자', '창고', '담당자', '비고']
    const rows = filteredItems.map(item => [
      item.materialName,
      item.materialCode,
      TRANSACTION_TYPE_LABELS[item.transactionType],
      item.quantity,
      item.unit,
      item.transactionDate,
      item.warehouse,
      item.handler,
      item.remark || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `material-history-${dayjs().format('YYYYMMDD')}.csv`
    link.click()

    message.success('내보내기 완료')
  }, [filteredItems])

  /**
   * 행 선택 변경 핸들러
   */
  const handleRowSelectionChange = useCallback((keys: React.Key[]) => {
    setSelectedRowKeys(keys)
  }, [])

  /**
   * Empty State 렌더링
   */
  const emptyRender = useMemo(() => {
    const hasSearchParams = searchParams.materialName || searchParams.transactionType || searchParams.dateRange
    if (filteredItems.length === 0 && hasSearchParams) {
      return (
        <Empty
          description="검색 결과가 없습니다"
          style={{ padding: '40px 0' }}
        >
          <Button
            type="primary"
            data-testid="empty-reset-btn"
            onClick={() => {
              setSearchParams({})
              setSelectedRowKeys([])
            }}
          >
            조건 초기화
          </Button>
        </Empty>
      )
    }
    return undefined
  }, [filteredItems.length, searchParams, setSearchParams])

  /**
   * 내보내기 버튼 (toolbarExtra)
   */
  const toolbarExtra = (
    <Button
      icon={<DownloadOutlined />}
      onClick={handleExport}
      disabled={loading || filteredItems.length === 0}
      data-testid="export-btn"
    >
      내보내기
    </Button>
  )

  return (
    <div data-testid="material-history-page" className="p-4">
      <ListTemplate<MaterialHistory>
        // 검색 조건
        searchFields={searchFields}
        onSearch={handleSearch}
        autoSearchOnReset={true}
        autoSearchOnMount={false}

        // 테이블
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        loading={loading}

        // 페이지네이션
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}건`,
        }}
        total={filteredItems.length}

        // 행 선택 (FR-004)
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: handleRowSelectionChange,
        }}

        // 액션 (FR-005)
        onDelete={handleDelete}
        deleteConfirmMessage={(count) => `${count}건의 항목을 삭제하시겠습니까?`}

        // 추가 액션 버튼 (내보내기)
        toolbarExtra={toolbarExtra}
      />

      {/* Empty State 오버레이 */}
      {emptyRender && filteredItems.length === 0 && (
        <div style={{ marginTop: -200 }}>
          {emptyRender}
        </div>
      )}
    </div>
  )
}

export default MaterialHistoryScreen
