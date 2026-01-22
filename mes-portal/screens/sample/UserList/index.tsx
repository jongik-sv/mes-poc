// screens/sample/UserList/index.tsx
// 사용자 목록 샘플 화면 (TSK-06-07)

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Tag, message, Empty, Button } from 'antd'
import { ListTemplate } from '@/components/templates/ListTemplate'
import type { SearchFieldDefinition, DataTableColumn } from '@/components/templates/ListTemplate'
import dayjs from 'dayjs'
import { useUserList, filterUsers } from './useUserList'
import { UserDetailModal } from './UserDetailModal'
import type { User, UserSearchParams, UserStatus } from './types'
import { STATUS_COLORS, STATUS_LABELS } from './types'

/**
 * 검색 필드 정의
 */
const searchFields: SearchFieldDefinition[] = [
  {
    name: 'name',
    label: '이름',
    type: 'text',
    placeholder: '이름 검색...',
    span: 8,
  },
  {
    name: 'email',
    label: '이메일',
    type: 'text',
    placeholder: '이메일 검색...',
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
      { label: '대기', value: 'pending' },
    ],
  },
]

/**
 * 상태 태그 컴포넌트
 */
function StatusTag({ status }: { status: UserStatus }) {
  return (
    <Tag color={STATUS_COLORS[status]}>
      {STATUS_LABELS[status]}
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
 * 사용자 목록 샘플 화면
 *
 * ListTemplate 컴포넌트 사용법을 보여주는 참조 구현
 *
 * 주요 기능:
 * - 검색 조건: 이름, 이메일, 상태
 * - 그리드: 정렬, 페이징, 행 선택
 * - 삭제: 선택 항목 삭제 (확인 다이얼로그)
 * - 상세: 행 클릭 시 모달 표시
 */
export function UserList() {
  // 데이터 및 상태 관리
  const {
    users,
    loading,
    searchParams,
    setSearchParams,
    deleteUsers,
    refetch,
  } = useUserList()

  // 모달 상태
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // 선택된 행
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  // 필터링된 데이터
  const filteredUsers = useMemo(() => {
    return filterUsers(users, searchParams)
  }, [users, searchParams])

  /**
   * 테이블 컬럼 정의
   */
  const columns: DataTableColumn<User>[] = useMemo(() => [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: User, b: User) => a.name.localeCompare(b.name, 'ko'),
      width: 120,
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: User, b: User) => a.email.localeCompare(b.email),
      width: 200,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: UserStatus) => <StatusTag status={status} />,
    },
    {
      title: '역할',
      dataIndex: 'roleLabel',
      key: 'roleLabel',
      width: 100,
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: User, b: User) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      width: 120,
      render: (date: string) => formatDate(date),
    },
  ], [])

  /**
   * 검색 핸들러
   */
  const handleSearch = useCallback((params: Record<string, unknown>) => {
    setSearchParams(params as UserSearchParams)
    // 검색 시 선택 초기화
    setSelectedRowKeys([])
  }, [setSearchParams])

  /**
   * 삭제 핸들러 (BR-003: 확인 다이얼로그는 ListTemplate에서 처리)
   */
  const handleDelete = useCallback(async (rows: User[]) => {
    const ids = rows.map((r) => r.id)
    await deleteUsers(ids)
    message.success('삭제되었습니다')
    setSelectedRowKeys([])
  }, [deleteUsers])

  /**
   * 행 클릭 핸들러 (UC-10, BR-005)
   */
  const handleRowClick = useCallback((record: User) => {
    setSelectedUser(record)
    setDetailModalOpen(true)
  }, [])

  /**
   * 모달 닫기 핸들러
   */
  const handleModalClose = useCallback(() => {
    setDetailModalOpen(false)
    setSelectedUser(null)
  }, [])

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
    if (filteredUsers.length === 0 && (searchParams.name || searchParams.email || searchParams.status)) {
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
  }, [filteredUsers.length, searchParams, setSearchParams])

  return (
    <div data-testid="user-list-page" className="p-4">
      <ListTemplate<User>
        // 검색 조건
        searchFields={searchFields}
        onSearch={handleSearch}
        autoSearchOnReset={true}
        autoSearchOnMount={false}

        // 테이블
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}

        // 페이지네이션
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}건`,
        }}
        total={filteredUsers.length}

        // 행 선택
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: handleRowSelectionChange,
          getCheckboxProps: (record) => ({
            'data-testid': `row-checkbox-${record.id}`,
          }),
        }}

        // 액션
        onDelete={handleDelete}
        deleteConfirmMessage={(count) => `${count}명의 사용자를 삭제하시겠습니까?`}

        // 행 클릭
        onRowClick={handleRowClick}
      />

      {/* Empty State 오버레이 */}
      {emptyRender && filteredUsers.length === 0 && (
        <div style={{ marginTop: -200 }}>
          {emptyRender}
        </div>
      )}

      {/* 사용자 상세 모달 */}
      <UserDetailModal
        open={detailModalOpen}
        user={selectedUser}
        onClose={handleModalClose}
      />
    </div>
  )
}

export default UserList
