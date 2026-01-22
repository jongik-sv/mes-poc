'use client'

// components/templates/SelectPopupTemplate/SelectPopupTemplate.tsx
// 선택형 팝업 템플릿 컴포넌트 (TSK-06-05)

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Modal, Input, Table, Button, Space, Empty, Spin, Alert } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { Key } from 'react'
import type { TableRowSelection } from 'antd/es/table/interface'
import type { SelectPopupTemplateProps } from './types'

/**
 * 선택형 팝업 템플릿 컴포넌트
 *
 * 항목을 검색하고 선택하여 부모 화면에 전달하는 표준 팝업 템플릿
 *
 * @example
 * ```tsx
 * <SelectPopupTemplate
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="사용자 선택"
 *   columns={columns}
 *   dataSource={users}
 *   rowKey="id"
 *   multiple={true}
 *   onSelect={(selectedUsers) => handleSelect(selectedUsers)}
 * />
 * ```
 */
export function SelectPopupTemplate<T extends Record<string, unknown>>({
  // 모달 설정
  open,
  onClose,
  title,
  width = 800,

  // 데이터 설정
  columns,
  dataSource,
  loading = false,
  rowKey,

  // 선택 설정
  multiple = false,
  selectedKeys: externalSelectedKeys,
  onSelect,
  selectOnRowClick = false,

  // 검색 설정
  searchPlaceholder = '검색어를 입력하세요',
  onSearch,
  searchMode = 'client',
  searchDebounceMs = 300,
  searchFields,

  // 페이지네이션
  pagination,
  onPaginationChange,
  total,

  // 권한 관리
  permissions = { canSelect: true },

  // 에러 상태
  error,

  // 슬롯
  searchExtra,
  tableHeader,
  footer,
}: SelectPopupTemplateProps<T>) {
  // 내부 선택 상태 관리
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<Key[]>([])
  const [selectedRows, setSelectedRows] = useState<T[]>([])

  // 검색어 상태
  const [searchKeyword, setSearchKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')

  // 외부 selectedKeys와 동기화
  useEffect(() => {
    if (externalSelectedKeys !== undefined) {
      setInternalSelectedKeys(externalSelectedKeys)
      // 선택된 행 데이터 동기화
      const rows = dataSource.filter((item) => {
        const key = typeof rowKey === 'function' ? rowKey(item) : item[rowKey]
        return externalSelectedKeys.includes(key as Key)
      })
      setSelectedRows(rows)
    }
  }, [externalSelectedKeys, dataSource, rowKey])

  // 모달 열릴 때 상태 초기화
  useEffect(() => {
    if (open) {
      if (externalSelectedKeys === undefined) {
        setInternalSelectedKeys([])
        setSelectedRows([])
      }
      setSearchKeyword('')
      setDebouncedKeyword('')
    }
  }, [open, externalSelectedKeys])

  // 서버 모드 디바운스 처리
  useEffect(() => {
    if (searchMode === 'server' && onSearch) {
      const timer = setTimeout(() => {
        setDebouncedKeyword(searchKeyword)
        onSearch(searchKeyword)
      }, searchDebounceMs)

      return () => clearTimeout(timer)
    }
  }, [searchKeyword, searchMode, searchDebounceMs, onSearch])

  // 클라이언트 필터링
  const filteredDataSource = useMemo(() => {
    if (searchMode === 'client' && searchKeyword && searchFields?.length) {
      const keyword = searchKeyword.toLowerCase()
      return dataSource.filter((item) =>
        searchFields.some((field) => {
          const value = item[field]
          return value != null && String(value).toLowerCase().includes(keyword)
        })
      )
    }
    return dataSource
  }, [dataSource, searchKeyword, searchMode, searchFields])

  // rowKey 값 추출 헬퍼
  const getRowKey = useCallback(
    (record: T): Key => {
      if (typeof rowKey === 'function') {
        return rowKey(record)
      }
      return record[rowKey] as Key
    },
    [rowKey]
  )

  // 선택 변경 핸들러
  const handleSelectionChange = useCallback(
    (keys: Key[], rows: T[]) => {
      setInternalSelectedKeys(keys)
      setSelectedRows(rows)
    },
    []
  )

  // 행 클릭 핸들러 (단일 선택 모드)
  const handleRowClick = useCallback(
    (record: T) => {
      if (!permissions.canSelect) return

      const key = getRowKey(record)

      if (!multiple) {
        // 단일 선택: 현재 선택된 것과 같으면 해제, 다르면 교체
        if (internalSelectedKeys.includes(key)) {
          setInternalSelectedKeys([])
          setSelectedRows([])
        } else {
          setInternalSelectedKeys([key])
          setSelectedRows([record])

          // selectOnRowClick이면 즉시 선택 완료
          if (selectOnRowClick) {
            onSelect([record])
          }
        }
      }
    },
    [multiple, internalSelectedKeys, getRowKey, selectOnRowClick, onSelect, permissions.canSelect]
  )

  // 검색 버튼 클릭 핸들러
  const handleSearchClick = useCallback(() => {
    if (searchMode === 'server' && onSearch) {
      onSearch(searchKeyword)
    }
  }, [searchMode, onSearch, searchKeyword])

  // 검색어 입력 핸들러
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.slice(0, 100) // SEC-001: 최대 100자 제한
      setSearchKeyword(value)

      // 클라이언트 모드에서는 즉시 필터링 (디바운스 없음)
      if (searchMode === 'client') {
        setDebouncedKeyword(value)
      }
    },
    [searchMode]
  )

  // 확인 버튼 클릭 핸들러
  const handleConfirm = useCallback(() => {
    onSelect(selectedRows)
  }, [onSelect, selectedRows])

  // 페이지 변경 핸들러
  const handleTableChange = useCallback(
    (paginationConfig: any) => {
      if (onPaginationChange) {
        onPaginationChange(paginationConfig.current, paginationConfig.pageSize)
      }
    },
    [onPaginationChange]
  )

  // 행 선택 설정
  const rowSelection: TableRowSelection<T> | undefined = multiple
    ? {
        type: 'checkbox',
        selectedRowKeys: internalSelectedKeys,
        onChange: handleSelectionChange,
        getCheckboxProps: () => ({
          disabled: !permissions.canSelect,
        }),
      }
    : undefined

  // 페이지네이션 설정
  const tableProps = useMemo(() => {
    if (pagination === false) {
      return { pagination: false as const }
    }

    return {
      pagination: {
        ...pagination,
        total: total ?? filteredDataSource.length,
        showSizeChanger: true,
        showTotal: (total: number) => `총 ${total}건`,
      },
    }
  }, [pagination, total, filteredDataSource.length])

  // 푸터 렌더링
  const renderFooter = () => {
    if (footer) {
      return typeof footer === 'function' ? footer(selectedRows) : footer
    }

    return (
      <Space>
        <Button data-testid="select-popup-cancel" onClick={onClose}>
          취소
        </Button>
        <Button
          data-testid="select-popup-confirm"
          type="primary"
          onClick={handleConfirm}
          disabled={internalSelectedKeys.length === 0}
        >
          선택완료
        </Button>
      </Space>
    )
  }

  // 에러 상태 렌더링
  const renderError = () => (
    <Alert
      type="error"
      message={error?.message}
      action={
        error?.onRetry && (
          <Button size="small" icon={<ReloadOutlined />} onClick={error.onRetry}>
            재시도
          </Button>
        )
      }
    />
  )

  // 테이블 빈 상태 렌더링
  const renderEmpty = () => (
    <Empty
      data-testid="select-popup-empty"
      description="검색 결과가 없습니다"
    />
  )

  if (!open) {
    return null
  }

  return (
    <Modal
      data-testid="select-popup-modal"
      open={open}
      title={title}
      width={width}
      onCancel={onClose}
      footer={renderFooter()}
      destroyOnClose
      maskClosable
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 검색 영역 */}
        <Space.Compact style={{ width: '100%' }}>
          <Input
            data-testid="select-popup-search"
            placeholder={searchPlaceholder}
            value={searchKeyword}
            onChange={handleSearchChange}
            onPressEnter={handleSearchClick}
            prefix={<SearchOutlined />}
            allowClear
            style={{ flex: 1 }}
          />
          <Button
            data-testid="select-popup-search-btn"
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearchClick}
          >
            검색
          </Button>
          {searchExtra}
        </Space.Compact>

        {/* 테이블 상단 커스텀 영역 */}
        {tableHeader}

        {/* 선택 현황 */}
        {multiple && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                data-testid="select-all-checkbox"
                checked={
                  filteredDataSource.length > 0 &&
                  internalSelectedKeys.length === filteredDataSource.length
                }
                disabled={!permissions.canSelect}
                onChange={(e) => {
                  if (e.target.checked) {
                    const allKeys = filteredDataSource.map(getRowKey)
                    handleSelectionChange(allKeys, filteredDataSource)
                  } else {
                    handleSelectionChange([], [])
                  }
                }}
              />
              전체 선택
            </label>
            <span data-testid="selected-count">
              선택: {internalSelectedKeys.length}건 / {filteredDataSource.length}건
            </span>
          </div>
        )}

        {/* 에러 상태 */}
        {error && renderError()}

        {/* 로딩 또는 테이블 */}
        {loading && (
          <div data-testid="select-popup-loading" style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip="로딩 중..." />
          </div>
        )}

        <Table<T>
          data-testid="select-popup-table"
          columns={columns}
          dataSource={filteredDataSource}
          rowKey={rowKey as string}
          loading={loading}
          rowSelection={rowSelection}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: !multiple && permissions.canSelect ? 'pointer' : 'default' },
            className: !multiple && internalSelectedKeys.includes(getRowKey(record))
              ? 'ant-table-row-selected'
              : '',
          })}
          onChange={handleTableChange}
          locale={{ emptyText: renderEmpty() }}
          size="small"
          scroll={{ y: 300 }}
          {...tableProps}
        />
      </Space>
    </Modal>
  )
}
