'use client'

/**
 * 역할그룹 관리 화면
 *
 * 기능:
 * - 역할그룹 목록 조회 (검색, 시스템 필터)
 * - 역할그룹 등록/수정/삭제
 * - 역할그룹-역할 매핑
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Card,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Transfer,
} from 'antd'
import type { TableProps } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'

interface RoleGroup {
  id: number
  roleGroupCd: string
  name: string
  description: string | null
  systemId: number
  systemName: string
  roleCount: number
  userCount: number
  isActive: boolean
  createdAt: string
}

interface SystemItem {
  id: number
  name: string
}

interface RoleItem {
  id: number
  code: string
  name: string
}

interface PaginatedResponse {
  items: RoleGroup[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const PAGE_SIZE = 10

export default function RoleGroupsPage() {
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([])
  const [systems, setSystems] = useState<SystemItem[]>([])
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // 검색/필터
  const [searchText, setSearchText] = useState('')
  const [filterSystemId, setFilterSystemId] = useState<number | undefined>()

  // 폼 모달
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<RoleGroup | null>(null)
  const [form] = Form.useForm()

  // 역할 관리 모달
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<RoleGroup | null>(null)
  const [assignedRoleIds, setAssignedRoleIds] = useState<string[]>([])

  // 시스템 목록 조회
  const fetchSystems = useCallback(async () => {
    try {
      const response = await fetch('/api/systems')
      const data = await response.json()
      if (data.success) {
        setSystems(data.data)
      }
    } catch {
      // 무시
    }
  }, [])

  // 역할 목록 조회
  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch('/api/roles')
      const data = await response.json()
      if (data.success) {
        setRoles(Array.isArray(data.data) ? data.data : data.data.items || [])
      }
    } catch {
      // 무시
    }
  }, [])

  // 역할그룹 목록 조회
  const fetchRoleGroups = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      })
      if (searchText) params.set('search', searchText)
      if (filterSystemId) params.set('systemId', String(filterSystemId))

      const response = await fetch(`/api/role-groups?${params}`)
      const data = await response.json()
      if (data.success) {
        const payload: PaginatedResponse = data.data
        setRoleGroups(payload.items)
        setTotal(payload.total)
        setCurrentPage(payload.page)
      } else {
        message.error(data.error || '역할그룹 목록을 불러올 수 없습니다')
      }
    } catch {
      message.error('역할그룹 목록을 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [searchText, filterSystemId])

  useEffect(() => {
    fetchRoleGroups()
    fetchSystems()
    fetchRoles()
  }, [fetchRoleGroups, fetchSystems, fetchRoles])

  // 등록/수정 모달
  const openFormModal = (group?: RoleGroup) => {
    setEditingGroup(group || null)
    if (group) {
      form.setFieldsValue({
        roleGroupCd: group.roleGroupCd,
        name: group.name,
        systemId: group.systemId,
        description: group.description,
      })
    } else {
      form.resetFields()
    }
    setFormModalOpen(true)
  }

  const handleFormSubmit = async (values: Record<string, unknown>) => {
    try {
      const url = editingGroup
        ? `/api/role-groups/${editingGroup.id}`
        : '/api/role-groups'
      const method = editingGroup ? 'PUT' : 'POST'

      const body = editingGroup
        ? { name: values.name, description: values.description, isActive: editingGroup.isActive }
        : values

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()

      if (data.success) {
        message.success(editingGroup ? '역할그룹이 수정되었습니다' : '역할그룹이 등록되었습니다')
        setFormModalOpen(false)
        fetchRoleGroups(currentPage)
      } else {
        message.error(data.error || '저장 중 오류가 발생했습니다')
      }
    } catch {
      message.error('저장 중 오류가 발생했습니다')
    }
  }

  // 삭제
  const handleDelete = async (group: RoleGroup) => {
    try {
      const response = await fetch(`/api/role-groups/${group.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        message.success('역할그룹이 삭제되었습니다')
        fetchRoleGroups(currentPage)
      } else {
        message.error(data.error || '삭제 중 오류가 발생했습니다')
      }
    } catch {
      message.error('삭제 중 오류가 발생했습니다')
    }
  }

  // 역할 관리 모달
  const openRoleModal = async (group: RoleGroup) => {
    setSelectedGroup(group)
    try {
      const response = await fetch(`/api/role-groups/${group.id}/roles`)
      const data = await response.json()
      if (data.success) {
        const assigned: RoleItem[] = Array.isArray(data.data) ? data.data : data.data.items || []
        setAssignedRoleIds(assigned.map((r) => String(r.id)))
      }
    } catch {
      setAssignedRoleIds([])
    }
    setRoleModalOpen(true)
  }

  const handleRoleSubmit = async () => {
    if (!selectedGroup) return
    try {
      const response = await fetch(`/api/role-groups/${selectedGroup.id}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleIds: assignedRoleIds.map(Number) }),
      })
      const data = await response.json()
      if (data.success) {
        message.success('역할이 할당되었습니다')
        setRoleModalOpen(false)
        fetchRoleGroups(currentPage)
      } else {
        message.error(data.error || '역할 할당 중 오류가 발생했습니다')
      }
    } catch {
      message.error('역할 할당 중 오류가 발생했습니다')
    }
  }

  // 검색
  const handleSearch = () => {
    setCurrentPage(1)
    fetchRoleGroups(1)
  }

  // 테이블 컬럼
  const columns: TableProps<RoleGroup>['columns'] = [
    {
      title: '역할그룹코드',
      dataIndex: 'roleGroupCd',
      key: 'roleGroupCd',
      render: (code: string) => <Tag>{code}</Tag>,
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '소속시스템',
      dataIndex: 'systemName',
      key: 'systemName',
    },
    {
      title: '포함역할수',
      dataIndex: 'roleCount',
      key: 'roleCount',
      align: 'center',
    },
    {
      title: '할당사용자수',
      dataIndex: 'userCount',
      key: 'userCount',
      align: 'center',
    },
    {
      title: '활성상태',
      key: 'isActive',
      render: (_, record) =>
        record.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag>,
    },
    {
      title: '액션',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<SettingOutlined />}
            onClick={() => openRoleModal(record)}
          >
            역할
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openFormModal(record)}
          >
            수정
          </Button>
          <Popconfirm
            title="역할그룹 삭제"
            description="이 역할그룹을 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record)}
            okText="삭제"
            cancelText="취소"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">역할그룹 관리</h1>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchRoleGroups(currentPage)}>
              새로고침
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openFormModal()}>
              역할그룹 등록
            </Button>
          </Space>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="이름 또는 코드 검색"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            className="max-w-xs"
            allowClear
          />
          <Select
            placeholder="시스템 필터"
            value={filterSystemId}
            onChange={(value) => setFilterSystemId(value)}
            allowClear
            className="w-40"
            options={systems.map((s) => ({ value: s.id, label: s.name }))}
          />
          <Button type="primary" onClick={handleSearch}>
            검색
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={roleGroups}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: PAGE_SIZE,
            total,
            onChange: (page) => fetchRoleGroups(page),
          }}
        />
      </Card>

      {/* 역할그룹 등록/수정 모달 */}
      <Modal
        title={editingGroup ? '역할그룹 수정' : '역할그룹 등록'}
        open={formModalOpen}
        onCancel={() => setFormModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="roleGroupCd"
            label="역할그룹 코드"
            rules={[
              { required: true, message: '역할그룹 코드를 입력하세요' },
              { pattern: /^[A-Z_]+$/, message: '영문 대문자와 언더스코어만 사용 가능합니다' },
            ]}
          >
            <Input disabled={!!editingGroup} placeholder="RG_CODE" />
          </Form.Item>

          <Form.Item
            name="name"
            label="역할그룹명"
            rules={[{ required: true, message: '역할그룹명을 입력하세요' }]}
          >
            <Input placeholder="역할그룹 이름" />
          </Form.Item>

          <Form.Item
            name="systemId"
            label="소속 시스템"
            rules={[{ required: true, message: '소속 시스템을 선택하세요' }]}
          >
            <Select
              placeholder="소속 시스템을 선택하세요"
              disabled={!!editingGroup}
              options={systems.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>

          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="역할그룹 설명" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setFormModalOpen(false)}>취소</Button>
            <Button type="primary" htmlType="submit">
              저장
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 역할 관리 모달 */}
      <Modal
        title={`역할 관리 - ${selectedGroup?.name || ''}`}
        open={roleModalOpen}
        onCancel={() => setRoleModalOpen(false)}
        onOk={handleRoleSubmit}
        okText="저장"
        cancelText="취소"
        width={700}
      >
        <div className="mb-4 text-gray-500">
          역할그룹에 할당할 역할을 선택하세요
        </div>
        <Transfer
          dataSource={roles.map((r) => ({
            key: String(r.id),
            title: `${r.name} (${r.code})`,
          }))}
          titles={['사용 가능한 역할', '할당된 역할']}
          targetKeys={assignedRoleIds}
          onChange={(nextTargetKeys) => setAssignedRoleIds(nextTargetKeys as string[])}
          render={(item) => item.title || ''}
          styles={{ section: { width: 280, height: 350 } }}
        />
      </Modal>
    </div>
  )
}
