'use client'

/**
 * TSK-05-01: 사용자 관리 화면
 *
 * 기능:
 * - 사용자 목록 조회 (검색, 필터, 페이징)
 * - 사용자 등록/수정/삭제
 * - 역할 할당
 * - 계정 잠금/해제
 * - 비밀번호 초기화
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Badge,
  Input,
  Select,
  Card,
  Modal,
  Form,
  Checkbox,
  Radio,
  Dropdown,
  message,
} from 'antd'
import type { TableProps, MenuProps } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  TeamOutlined,
  MoreOutlined,
  ReloadOutlined,
} from '@ant-design/icons'

interface Role {
  id: number
  code: string
  name: string
}

interface User {
  id: number
  email: string
  name: string
  phone: string | null
  department: string | null
  isActive: boolean
  isLocked: boolean
  roles: Role[]
  lastLoginAt: string | null
  createdAt: string
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

type StatusFilter = 'all' | 'active' | 'inactive' | 'locked'

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  // 필터 상태
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [roleFilter, setRoleFilter] = useState<number | undefined>()

  // 모달 상태
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [form] = Form.useForm()
  const [roleForm] = Form.useForm()

  // 사용자 목록 조회
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(pagination.page))
      params.set('pageSize', String(pagination.pageSize))
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (roleFilter) params.set('roleId', String(roleFilter))

      const response = await fetch(`/api/users?${params}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
        setPagination(data.pagination)
      } else {
        message.error(data.error || '사용자 목록을 불러올 수 없습니다')
      }
    } catch {
      message.error('사용자 목록을 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, search, statusFilter, roleFilter])

  // 역할 목록 조회
  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch('/api/roles')
      const data = await response.json()
      if (data.success && data.data?.items) {
        setRoles(data.data.items)
      }
    } catch {
      // 역할 목록 실패는 무시
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [fetchUsers, fetchRoles])

  // 검색 핸들러
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchUsers()
  }

  // 초기화 핸들러
  const handleReset = () => {
    setSearch('')
    setStatusFilter('all')
    setRoleFilter(undefined)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // 사용자 등록/수정 모달 열기
  const openFormModal = (user?: User) => {
    setEditingUser(user || null)
    if (user) {
      form.setFieldsValue({
        email: user.email,
        name: user.name,
        phone: user.phone,
        department: user.department,
        roleIds: user.roles.map((r) => r.id),
        isActive: user.isActive,
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ isActive: true })
    }
    setFormModalOpen(true)
  }

  // 사용자 등록/수정 저장
  const handleFormSubmit = async (values: Record<string, unknown>) => {
    try {
      const url = editingUser
        ? `/api/users/${editingUser.id}`
        : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        message.success(editingUser ? '사용자가 수정되었습니다' : '사용자가 등록되었습니다')
        setFormModalOpen(false)
        fetchUsers()
      } else {
        message.error(data.error || '저장 중 오류가 발생했습니다')
      }
    } catch {
      message.error('저장 중 오류가 발생했습니다')
    }
  }

  // 사용자 삭제
  const handleDelete = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      const data = await response.json()

      if (data.success) {
        message.success('사용자가 비활성화되었습니다')
        fetchUsers()
      } else {
        message.error(data.error || '삭제 중 오류가 발생했습니다')
      }
    } catch {
      message.error('삭제 중 오류가 발생했습니다')
    }
  }

  // 계정 잠금
  const handleLock = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}/lock`, { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        message.success('계정이 잠겼습니다')
        fetchUsers()
      } else {
        message.error(data.error || '계정 잠금 중 오류가 발생했습니다')
      }
    } catch {
      message.error('계정 잠금 중 오류가 발생했습니다')
    }
  }

  // 계정 잠금 해제
  const handleUnlock = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}/unlock`, { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        message.success('계정 잠금이 해제되었습니다')
        fetchUsers()
      } else {
        message.error(data.error || '계정 잠금 해제 중 오류가 발생했습니다')
      }
    } catch {
      message.error('계정 잠금 해제 중 오류가 발생했습니다')
    }
  }

  // 비밀번호 초기화
  const handlePasswordReset = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}/password/reset`, { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        message.success('비밀번호가 초기화되었습니다')
      } else {
        message.error(data.error || '비밀번호 초기화 중 오류가 발생했습니다')
      }
    } catch {
      message.error('비밀번호 초기화 중 오류가 발생했습니다')
    }
  }

  // 역할 할당 모달 열기
  const openRoleModal = (user: User) => {
    setSelectedUser(user)
    roleForm.setFieldsValue({
      roleIds: user.roles.map((r) => r.id),
    })
    setRoleModalOpen(true)
  }

  // 역할 할당 저장
  const handleRoleSubmit = async (values: { roleIds: number[] }) => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/users/${selectedUser.id}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        message.success('역할이 할당되었습니다')
        setRoleModalOpen(false)
        fetchUsers()
      } else {
        message.error(data.error || '역할 할당 중 오류가 발생했습니다')
      }
    } catch {
      message.error('역할 할당 중 오류가 발생했습니다')
    }
  }

  // 상태 Badge 렌더링
  const renderStatus = (user: User) => {
    if (user.isLocked) {
      return <Badge status="error" text="잠금" />
    }
    if (!user.isActive) {
      return <Badge status="default" text="비활성" />
    }
    return <Badge status="success" text="활성" />
  }

  // 액션 메뉴
  const getActionMenuItems = (user: User): MenuProps['items'] => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '수정',
      onClick: () => openFormModal(user),
    },
    {
      key: 'role',
      icon: <TeamOutlined />,
      label: '역할 할당',
      onClick: () => openRoleModal(user),
    },
    { type: 'divider' },
    user.isLocked
      ? {
          key: 'unlock',
          icon: <UnlockOutlined />,
          label: '잠금 해제',
          onClick: () => handleUnlock(user),
        }
      : {
          key: 'lock',
          icon: <LockOutlined />,
          label: '계정 잠금',
          onClick: () => handleLock(user),
        },
    {
      key: 'password',
      icon: <KeyOutlined />,
      label: '비밀번호 초기화',
      onClick: () => handlePasswordReset(user),
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '삭제',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: '사용자 삭제',
          content: `${user.name}(${user.email}) 사용자를 비활성화하시겠습니까?`,
          okText: '삭제',
          okType: 'danger',
          cancelText: '취소',
          onOk: () => handleDelete(user),
        })
      },
    },
  ]

  // 테이블 컬럼 정의
  const columns: TableProps<User>['columns'] = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: '부서',
      dataIndex: 'department',
      key: 'department',
      responsive: ['lg'],
    },
    {
      title: '역할',
      key: 'roles',
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          {record.roles.map((role) => (
            <Tag key={role.id} color="blue">
              {role.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '상태',
      key: 'status',
      render: (_, record) => renderStatus(record),
      sorter: true,
    },
    {
      title: '액션',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">사용자 관리</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openFormModal()}>
            사용자 등록
          </Button>
        </div>

        {/* 검색 영역 */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Input
            placeholder="이름 또는 이메일 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="상태"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '전체' },
              { value: 'active', label: '활성' },
              { value: 'inactive', label: '비활성' },
              { value: 'locked', label: '잠금' },
            ]}
          />
          <Select
            placeholder="역할"
            value={roleFilter}
            onChange={setRoleFilter}
            allowClear
            style={{ width: 150 }}
            options={roles.map((role) => ({ value: role.id, label: role.name }))}
          />
          <Button icon={<SearchOutlined />} onClick={handleSearch}>
            검색
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            초기화
          </Button>
        </div>

        {/* 테이블 */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}명`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({ ...prev, page, pageSize }))
            },
          }}
        />
      </Card>

      {/* 등록/수정 모달 */}
      <Modal
        title={editingUser ? '사용자 수정' : '사용자 등록'}
        open={formModalOpen}
        onCancel={() => setFormModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="email"
            label="이메일"
            rules={[
              { required: true, message: '이메일을 입력하세요' },
              { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
            ]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            name="name"
            label="이름"
            rules={[{ required: true, message: '이름을 입력하세요' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="연락처">
            <Input />
          </Form.Item>

          <Form.Item name="department" label="부서">
            <Input />
          </Form.Item>

          <Form.Item
            name="roleIds"
            label="역할"
            rules={[{ required: true, message: '역할을 선택하세요' }]}
          >
            <Checkbox.Group>
              <Space direction="vertical">
                {roles.map((role) => (
                  <Checkbox key={role.id} value={role.id}>
                    {role.name} ({role.code})
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="isActive" label="상태" initialValue={true}>
            <Radio.Group>
              <Radio value={true}>활성</Radio>
              <Radio value={false}>비활성</Radio>
            </Radio.Group>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setFormModalOpen(false)}>취소</Button>
            <Button type="primary" htmlType="submit">
              저장
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 역할 할당 모달 */}
      <Modal
        title={`역할 할당 - ${selectedUser?.name}`}
        open={roleModalOpen}
        onCancel={() => setRoleModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={roleForm} layout="vertical" onFinish={handleRoleSubmit}>
          <div className="mb-4 text-gray-500">
            {selectedUser?.email}
          </div>

          <Form.Item name="roleIds" label="역할 선택">
            <Checkbox.Group>
              <Space direction="vertical">
                {roles.map((role) => (
                  <Checkbox key={role.id} value={role.id}>
                    {role.name} ({role.code})
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setRoleModalOpen(false)}>취소</Button>
            <Button type="primary" htmlType="submit">
              저장
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
