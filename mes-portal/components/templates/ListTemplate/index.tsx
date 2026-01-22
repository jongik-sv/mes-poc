// components/templates/ListTemplate/index.tsx
// 목록(조회) 화면 템플릿 메인 컴포넌트 (TSK-06-01)

'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Card, Modal } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { DataTable } from '@/components/common/DataTable'
import { transformSearchParams, getDefaultValues } from '@/lib/utils/searchParams'
import { SearchForm } from './SearchForm'
import { Toolbar } from './Toolbar'
import type { ListTemplateProps, SearchFieldDefinition } from './types'

// 타입 및 하위 컴포넌트 re-export
export * from './types'
export { SearchForm } from './SearchForm'
export { Toolbar } from './Toolbar'

/**
 * ListTemplate 컴포넌트
 *
 * 목록(조회) 화면의 표준 템플릿을 제공합니다.
 * - 검색 조건 영역 (Card)
 * - 액션 버튼 영역 (신규/삭제)
 * - 데이터 그리드 (DataTable)
 *
 * @example
 * ```tsx
 * <ListTemplate
 *   columns={columns}
 *   dataSource={data}
 *   rowKey="id"
 *   searchFields={[
 *     { name: 'name', label: '이름', type: 'text' },
 *     { name: 'status', label: '상태', type: 'select', options: [...] }
 *   ]}
 *   onSearch={(params) => fetchData(params)}
 *   onAdd={() => router.push('/create')}
 *   onDelete={(rows) => deleteRows(rows)}
 * />
 * ```
 */
export function ListTemplate<T extends Record<string, unknown>>({
  // 권한
  permissions,

  // 검색 조건
  searchFields,
  initialValues,
  onSearch,
  onReset,
  autoSearchOnReset = true,
  autoSearchOnMount = true,

  // 검색 영역 커스터마이징
  searchCardTitle,
  searchExtra,
  hideSearchCard,

  // 테이블
  columns,
  dataSource,
  loading,
  rowKey,

  // 페이지네이션
  pagination,
  total,

  // 정렬
  sortMode = 'client',
  onSort,

  // 행 선택
  rowSelection: externalRowSelection,

  // 액션 버튼
  onAdd,
  addButtonText = '신규',
  onDelete,
  deleteButtonText = '삭제',
  deleteConfirmMessage,

  // 추가 액션 버튼
  toolbarExtra,

  // 행 클릭
  onRowClick,

  // 스타일
  className,
  style,
}: ListTemplateProps<T>) {
  // 검색 조건 상태
  const defaultValues = useMemo(() => {
    return searchFields ? getDefaultValues(searchFields) : {}
  }, [searchFields])

  const [searchValues, setSearchValues] = useState<Record<string, unknown>>(() => ({
    ...defaultValues,
    ...initialValues,
  }))

  // 선택된 행 상태
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [selectedRows, setSelectedRows] = useState<T[]>([])

  // 삭제 확인 다이얼로그 상태
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false)

  /**
   * 검색 실행
   */
  const handleSearch = useCallback(() => {
    if (onSearch && searchFields) {
      const params = transformSearchParams(searchValues, searchFields)
      onSearch(params)
    }
    // 검색 시 선택 초기화
    setSelectedRowKeys([])
    setSelectedRows([])
  }, [onSearch, searchFields, searchValues])

  /**
   * 초기화 실행
   */
  const handleReset = useCallback(() => {
    setSearchValues({ ...defaultValues })
    onReset?.()

    if (autoSearchOnReset && onSearch && searchFields) {
      const params = transformSearchParams(defaultValues, searchFields)
      onSearch(params)
    }
    // 초기화 시 선택 초기화
    setSelectedRowKeys([])
    setSelectedRows([])
  }, [defaultValues, onReset, autoSearchOnReset, onSearch, searchFields])

  /**
   * 마운트 시 자동 검색
   */
  useEffect(() => {
    if (autoSearchOnMount && onSearch && searchFields) {
      const params = transformSearchParams(searchValues, searchFields)
      onSearch(params)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 마운트 시에만 실행

  /**
   * 행 선택 변경
   */
  const handleRowSelectionChange = useCallback((keys: React.Key[], rows: T[]) => {
    setSelectedRowKeys(keys)
    setSelectedRows(rows)

    // 외부 rowSelection의 onChange 호출
    if (externalRowSelection?.onChange) {
      externalRowSelection.onChange(keys, rows, { type: 'all' })
    }
  }, [externalRowSelection])

  /**
   * 삭제 버튼 클릭
   */
  const handleDeleteClick = useCallback(() => {
    setDeleteConfirmVisible(true)
  }, [])

  /**
   * 삭제 확인
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (onDelete) {
      await onDelete(selectedRows)
    }
    setDeleteConfirmVisible(false)
    // 삭제 후 선택 초기화
    setSelectedRowKeys([])
    setSelectedRows([])
  }, [onDelete, selectedRows])

  /**
   * 삭제 취소
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmVisible(false)
  }, [])

  /**
   * 삭제 확인 메시지 생성
   */
  const getDeleteMessage = useCallback(() => {
    if (typeof deleteConfirmMessage === 'function') {
      return deleteConfirmMessage(selectedRows.length)
    }
    if (deleteConfirmMessage) {
      return deleteConfirmMessage
    }
    return `${selectedRows.length}건의 항목을 삭제하시겠습니까?`
  }, [deleteConfirmMessage, selectedRows.length])

  /**
   * 권한 체크
   */
  const canAdd = permissions?.canAdd !== false
  const canDelete = permissions?.canDelete !== false

  /**
   * 검색 영역 표시 여부
   */
  const showSearchCard = !hideSearchCard && searchFields && searchFields.length > 0

  /**
   * 행 선택 설정
   */
  const mergedRowSelection = useMemo(() => {
    if (!externalRowSelection && !onDelete) return undefined

    return {
      ...externalRowSelection,
      selectedRowKeys,
      onChange: handleRowSelectionChange,
    }
  }, [externalRowSelection, onDelete, selectedRowKeys, handleRowSelectionChange])

  /**
   * 행 클릭 핸들러
   */
  const handleRow = useCallback(
    (record: T) => ({
      onClick: (e: React.MouseEvent) => {
        // 체크박스 영역 클릭 제외
        const target = e.target as HTMLElement
        if (target.closest('.ant-checkbox-wrapper') || target.closest('input[type="checkbox"]')) {
          return
        }
        onRowClick?.(record)
      },
    }),
    [onRowClick]
  )

  /**
   * 실제 total 값
   */
  const actualTotal = total ?? dataSource.length

  return (
    <div
      data-testid="list-template-container"
      className={className}
      style={style}
    >
      {/* 검색 조건 영역 */}
      {showSearchCard && (
        <Card
          data-testid="search-condition-card"
          title={searchCardTitle}
          size="small"
          style={{ marginBottom: 16 }}
        >
          <SearchForm
            fields={searchFields!}
            values={searchValues}
            onChange={setSearchValues}
            onSearch={handleSearch}
            onReset={handleReset}
            loading={loading}
            extra={searchExtra}
          />
        </Card>
      )}

      {/* 검색 영역이 없어도 버튼은 필요한 경우 */}
      {!showSearchCard && (onSearch || onReset) && (
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          {onReset && (
            <button
              data-testid="reset-btn"
              onClick={handleReset}
              disabled={loading}
              style={{ marginRight: 8 }}
            >
              초기화
            </button>
          )}
          {onSearch && (
            <button
              data-testid="search-btn"
              onClick={handleSearch}
              disabled={loading}
            >
              검색
            </button>
          )}
        </div>
      )}

      {/* 툴바 영역 */}
      <Toolbar
        onAdd={canAdd ? onAdd : undefined}
        addButtonText={addButtonText}
        onDelete={canDelete && onDelete ? handleDeleteClick : undefined}
        deleteButtonText={deleteButtonText}
        selectedCount={selectedRowKeys.length}
        total={actualTotal}
        deleteDisabled={selectedRowKeys.length === 0}
        loading={loading}
        extra={toolbarExtra}
      />

      {/* 데이터 그리드 */}
      <DataTable
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey as string}
        loading={loading}
        pagination={pagination}
        rowSelection={mergedRowSelection}
        onRow={onRowClick ? handleRow : undefined}
      />

      {/* 삭제 확인 다이얼로그 */}
      {deleteConfirmVisible && (
        <div
          data-testid="confirm-dialog"
          role="dialog"
          aria-modal="true"
        >
          <Modal
            open={deleteConfirmVisible}
            title={
              <>
                <ExclamationCircleFilled className="mr-2 text-yellow-500" />
                삭제 확인
              </>
            }
            onOk={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            okText="삭제"
            cancelText="취소"
            okButtonProps={{
              danger: true,
              'data-testid': 'confirm-ok-btn',
            } as any}
            cancelButtonProps={{
              'data-testid': 'confirm-cancel-btn',
            } as any}
          >
            <p>{getDeleteMessage()}</p>
          </Modal>
        </div>
      )}
    </div>
  )
}

export default ListTemplate
