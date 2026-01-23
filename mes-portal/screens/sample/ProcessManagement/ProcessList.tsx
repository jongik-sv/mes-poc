/**
 * @file ProcessList.tsx
 * @description 공정 목록 화면 컴포넌트
 * @task TSK-06-18
 *
 * @requirements
 * - FR-001: 공정 목록 조회 (Table)
 * - BR-05: 비활성 공정 회색 표시
 */

'use client'

import React, { useMemo, useCallback } from 'react'
import { Tag, Result, Button } from 'antd'
import { ListTemplate } from '@/components/templates/ListTemplate'
import type { SearchFieldDefinition } from '@/components/templates/ListTemplate'
import type { DataTableColumn } from '@/components/common/DataTable'
import dayjs from '@/lib/dayjs'
import type { ProcessData, ProcessStatus, ProcessSearchParams } from './types'
import { STATUS_LABELS, STATUS_COLORS } from './types'

interface ProcessListProps {
  processes: ProcessData[]
  loading?: boolean
  error?: string | null
  onSearch: (params: ProcessSearchParams) => void
  onAdd: () => void
  onDelete: (rows: ProcessData[]) => Promise<void>
  onRowClick: (record: ProcessData) => void
  onRetry?: () => void
}

/**
 * 검색 필드 정의
 */
const searchFields: SearchFieldDefinition[] = [
  {
    name: 'code',
    label: '공정코드',
    type: 'text',
    placeholder: '공정코드 검색...',
    span: 8,
  },
  {
    name: 'name',
    label: '공정명',
    type: 'text',
    placeholder: '공정명 검색...',
    span: 8,
  },
  {
    name: 'status',
    label: '상태',
    type: 'select',
    placeholder: '전체',
    span: 8,
    options: [
      { label: '전체', value: '' },
      { label: '활성', value: 'active' },
      { label: '비활성', value: 'inactive' },
    ],
  },
]

/**
 * 상태 태그 컴포넌트
 */
function StatusTag({ status }: { status: ProcessStatus }) {
  return (
    <Tag color={STATUS_COLORS[status]} data-testid={`status-tag-${status}`}>
      {STATUS_LABELS[status]}
    </Tag>
  )
}

/**
 * 공정 목록 화면 컴포넌트
 */
export function ProcessList({
  processes,
  loading = false,
  error,
  onSearch,
  onAdd,
  onDelete,
  onRowClick,
  onRetry,
}: ProcessListProps) {
  /**
   * 테이블 컬럼 정의
   */
  const columns: DataTableColumn<ProcessData>[] = useMemo(
    () => [
      {
        title: '공정코드',
        dataIndex: 'code',
        key: 'code',
        sorter: (a: ProcessData, b: ProcessData) => a.code.localeCompare(b.code),
        width: 120,
      },
      {
        title: '공정명',
        dataIndex: 'name',
        key: 'name',
        sorter: (a: ProcessData, b: ProcessData) =>
          a.name.localeCompare(b.name, 'ko'),
        width: 150,
      },
      {
        title: '상태',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: ProcessStatus) => <StatusTag status={status} />,
      },
      {
        title: '설비수',
        dataIndex: 'equipmentCount',
        key: 'equipmentCount',
        sorter: (a: ProcessData, b: ProcessData) =>
          a.equipmentCount - b.equipmentCount,
        width: 100,
        align: 'center' as const,
      },
      {
        title: '생성일',
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: (a: ProcessData, b: ProcessData) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        width: 120,
        render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      },
    ],
    []
  )

  /**
   * 검색 핸들러
   */
  const handleSearch = useCallback(
    (params: Record<string, unknown>) => {
      onSearch(params as ProcessSearchParams)
    },
    [onSearch]
  )

  /**
   * 삭제 핸들러
   */
  const handleDelete = useCallback(
    async (rows: ProcessData[]) => {
      await onDelete(rows)
    },
    [onDelete]
  )

  /**
   * 행 스타일 (BR-05: 비활성 공정 회색 표시)
   */
  const rowClassName = useCallback((record: ProcessData) => {
    return record.status === 'inactive' ? 'inactive' : ''
  }, [])

  // 에러 상태 표시 (FR-006)
  if (error) {
    return (
      <div data-testid="error-state" className="p-4">
        <Result
          status="error"
          title="데이터를 불러올 수 없습니다"
          subTitle={error}
          extra={
            onRetry && (
              <Button
                type="primary"
                onClick={onRetry}
                data-testid="retry-btn"
              >
                재시도
              </Button>
            )
          }
        />
      </div>
    )
  }

  return (
    <div data-testid="process-list" className="process-list">
      <ListTemplate<ProcessData>
        // 검색 조건
        searchFields={searchFields}
        onSearch={handleSearch}
        autoSearchOnReset={true}
        autoSearchOnMount={false}
        // 테이블
        columns={columns}
        dataSource={processes}
        rowKey="id"
        loading={loading}
        // 페이지네이션
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}건`,
        }}
        total={processes.length}
        // 액션
        onAdd={onAdd}
        addButtonText="신규"
        onDelete={handleDelete}
        deleteConfirmMessage={(count) =>
          `${count}건의 공정을 삭제하시겠습니까?`
        }
        // 행 클릭
        onRowClick={onRowClick}
      />

      {/* 비활성 공정 스타일 */}
      <style jsx global>{`
        .process-list .ant-table-row.inactive {
          color: var(--ant-color-text-disabled);
          background-color: var(--ant-color-fill-tertiary);
        }
        .process-list .ant-table-row.inactive:hover > td {
          background-color: var(--ant-color-fill-secondary) !important;
        }
      `}</style>
    </div>
  )
}

export default ProcessList
