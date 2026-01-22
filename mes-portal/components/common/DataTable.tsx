// components/common/DataTable.tsx
// 공통 테이블 컴포넌트 (TSK-05-04)
// 정렬, 페이징, 행 선택, 컬럼 리사이즈 기능을 제공하는 래퍼 컴포넌트

'use client'

import React, { useMemo, useCallback } from 'react'
import { Table, Empty, Spin } from 'antd'
import type { TableProps, TableColumnType } from 'antd'
import type { SorterResult, TablePaginationConfig, TableRowSelection } from 'antd/es/table/interface'
import { Resizable, type ResizeCallbackData } from 'react-resizable'
import 'react-resizable/css/styles.css'

// 기본 상수
const DEFAULT_PAGE_SIZE = 10
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
const MIN_COLUMN_WIDTH = 50

/**
 * DataTable 컬럼 타입 확장
 * Ant Design TableColumnType에 resizable 속성 추가
 */
export interface DataTableColumn<T> extends TableColumnType<T> {
  /** 컬럼 리사이즈 가능 여부 */
  resizable?: boolean
}

/**
 * DataTable Props
 */
export interface DataTableProps<T extends object> extends Omit<TableProps<T>, 'columns'> {
  /** 컬럼 정의 */
  columns: DataTableColumn<T>[]
  /** 데이터 소스 */
  dataSource?: T[]
  /** 행 고유 키 */
  rowKey: string | ((record: T) => string)
  /** 리사이즈 가능 여부 */
  resizable?: boolean
  /** 컬럼 리사이즈 콜백 */
  onColumnResize?: (dataIndex: string, width: number) => void
  /** 커스텀 페이지 크기 옵션 */
  pageSizeOptions?: number[]
}

/**
 * 리사이즈 가능한 헤더 셀 컴포넌트
 */
interface ResizableTitleProps {
  onResize: (e: React.SyntheticEvent, data: ResizeCallbackData) => void
  width: number
  [key: string]: unknown
}

const ResizableTitle: React.FC<ResizableTitleProps> = ({
  onResize,
  width,
  ...restProps
}) => {
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
      minConstraints={[MIN_COLUMN_WIDTH, 0]}
    >
      <th {...restProps} />
    </Resizable>
  )
}

/**
 * DataTable 컴포넌트
 *
 * Ant Design Table을 래핑하여 공통 기능을 제공합니다:
 * - 컬럼 정렬 (오름차순/내림차순)
 * - 페이징 (페이지 크기 선택: 10, 20, 50, 100)
 * - 행 선택 (단일/다중)
 * - 컬럼 리사이즈 (드래그로 너비 조절)
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { title: '이름', dataIndex: 'name', sorter: true },
 *     { title: '상태', dataIndex: 'status' }
 *   ]}
 *   dataSource={data}
 *   rowKey="id"
 *   rowSelection={{
 *     type: 'checkbox',
 *     onChange: (keys, rows) => console.log(keys, rows)
 *   }}
 * />
 * ```
 */
export function DataTable<T extends object>({
  columns: initialColumns,
  dataSource,
  rowKey,
  resizable = false,
  onColumnResize,
  pagination,
  loading,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  locale,
  rowSelection,
  ...restProps
}: DataTableProps<T>) {
  // 컬럼 너비 상태 관리
  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {}
    initialColumns.forEach((col) => {
      const key = (col.dataIndex as string) || (col.key as string)
      if (key && col.width && typeof col.width === 'number') {
        widths[key] = col.width
      }
    })
    return widths
  })

  /**
   * 컬럼 리사이즈 핸들러 생성
   */
  const handleResize = useCallback(
    (dataIndex: string) => {
      return (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
        const newWidth = Math.max(MIN_COLUMN_WIDTH, size.width)
        setColumnWidths((prev) => ({
          ...prev,
          [dataIndex]: newWidth,
        }))
        if (onColumnResize) {
          onColumnResize(dataIndex, newWidth)
        }
      }
    },
    [onColumnResize]
  )

  /**
   * 리사이즈 가능한 컬럼 생성
   */
  const mergedColumns = useMemo(() => {
    return initialColumns.map((col) => {
      const key = (col.dataIndex as string) || (col.key as string)
      const width = key ? columnWidths[key] || col.width : col.width

      if (!resizable || !col.resizable) {
        return {
          ...col,
          width,
        }
      }

      return {
        ...col,
        width,
        onHeaderCell: () => ({
          width,
          onResize: handleResize(key),
          'data-testid': `column-header-${key}`,
        }),
      }
    })
  }, [initialColumns, columnWidths, resizable, handleResize])

  /**
   * 테이블 컴포넌트 설정
   */
  const components = useMemo(() => {
    if (!resizable) return undefined

    return {
      header: {
        cell: ResizableTitle,
      },
    }
  }, [resizable])

  /**
   * 페이지네이션 설정
   */
  const paginationConfig: TablePaginationConfig | false = useMemo(() => {
    if (pagination === false) return false

    return {
      defaultPageSize: DEFAULT_PAGE_SIZE,
      pageSizeOptions,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total: number, range: [number, number]) =>
        `총 ${total}건 중 ${range[0]}-${range[1]}`,
      ...pagination,
    }
  }, [pagination, pageSizeOptions])

  /**
   * 로케일 설정
   */
  const mergedLocale = useMemo(
    () => ({
      emptyText: <Empty description="표시할 데이터가 없습니다" />,
      ...locale,
    }),
    [locale]
  )

  /**
   * 로딩 상태
   */
  const isLoading = loading === true || (typeof loading === 'object' && loading.spinning)

  /**
   * 빈 데이터 처리
   */
  const isEmpty = !dataSource || dataSource.length === 0

  return (
    <div
      data-testid="data-table"
      className="data-table-wrapper"
    >
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div data-testid="data-table-loading" className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
          <Spin size="large" />
        </div>
      )}

      {/* 빈 데이터 상태 */}
      {isEmpty && !isLoading && (
        <div data-testid="data-table-empty">
          <Table
            columns={mergedColumns as TableColumnType<T>[]}
            dataSource={[]}
            rowKey={rowKey}
            pagination={false}
            locale={mergedLocale}
            {...restProps}
          />
        </div>
      )}

      {/* 데이터가 있는 경우 */}
      {!isEmpty && (
        <Table
          columns={mergedColumns as TableColumnType<T>[]}
          dataSource={dataSource}
          rowKey={rowKey}
          components={components}
          pagination={paginationConfig}
          loading={loading}
          locale={mergedLocale}
          rowSelection={rowSelection}
          {...restProps}
        />
      )}

      {/* 리사이즈 스타일 */}
      <style jsx global>{`
        .data-table-wrapper {
          position: relative;
        }

        .data-table-wrapper .react-resizable {
          position: relative;
          background-clip: padding-box;
        }

        .data-table-wrapper .react-resizable-handle {
          position: absolute;
          right: -5px;
          bottom: 0;
          z-index: 1;
          width: 10px;
          height: 100%;
          cursor: col-resize;
        }

        .data-table-wrapper .react-resizable-handle:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}

export default DataTable
