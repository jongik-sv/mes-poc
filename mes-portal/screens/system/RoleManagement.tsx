'use client'

/**
 * TSK-05-02: 역할 관리 화면
 *
 * 기능:
 * - 역할 목록 조회
 * - 역할 등록/수정/삭제
 * - 역할-권한 매핑
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
  Tree,
} from 'antd'
import type { TableProps, TreeDataNode } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  ReloadOutlined,
} from '@ant-design/icons'

interface Role {
  id: number
  code: string
  name: string
  description: string | null
  parentId: number | null
  level: number
  isSystem: boolean
  isActive: boolean
  createdAt: string
}

interface Permission {
  id: number
  code: string
  name: string
  type: string
  resource: string
  action: string
  description: string | null
}

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)

  // 모달 상태
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [permissionModalOpen, setPermissionModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

  const [form] = Form.useForm()

  // 역할 목록 조회
  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/roles')
      const data = await response.json()
      if (data.success && data.data?.items) {
        setRoles(data.data.items)
      } else {
        message.error(data.error?.message || '역할 목록을 불러올 수 없습니다')
      }
    } catch {
      message.error('역할 목록을 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [])

  // 권한 목록 조회
  const fetchPermissions = useCallback(async () => {
    try {
      const response = await fetch('/api/permissions?pageSize=100')
      const data = await response.json()
      if (data.success && data.data?.items) {
        setPermissions(data.data.items)
      }
    } catch {
      // 무시
    }
  }, [])

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [fetchRoles, fetchPermissions])

  // 역할 등록/수정 모달 열기
  const openFormModal = (role?: Role) => {
    setEditingRole(role || null)
    if (role) {
      form.setFieldsValue({
        code: role.code,
        name: role.name,
        description: role.description,
        parentId: role.parentId,
        isActive: role.isActive,
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ isActive: true })
    }
    setFormModalOpen(true)
  }

  // 역할 등록/수정 저장
  const handleFormSubmit = async (values: Record<string, unknown>) => {
    try {
      const url = editingRole
        ? `/api/roles/${editingRole.id}`
        : '/api/roles'
      const method = editingRole ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        message.success(editingRole ? '역할이 수정되었습니다' : '역할이 등록되었습니다')
        setFormModalOpen(false)
        fetchRoles()
      } else {
        message.error(data.error || '저장 중 오류가 발생했습니다')
      }
    } catch {
      message.error('저장 중 오류가 발생했습니다')
    }
  }

  // 역할 삭제
  const handleDelete = async (role: Role) => {
    if (role.isSystem) {
      message.warning('시스템 역할은 삭제할 수 없습니다')
      return
    }

    try {
      const response = await fetch(`/api/roles/${role.id}`, { method: 'DELETE' })
      const data = await response.json()

      if (data.success) {
        message.success('역할이 삭제되었습니다')
        fetchRoles()
      } else {
        message.error(data.error || '삭제 중 오류가 발생했습니다')
      }
    } catch {
      message.error('삭제 중 오류가 발생했습니다')
    }
  }

  // 권한 설정 모달 열기
  const openPermissionModal = async (role: Role) => {
    setSelectedRole(role)
    try {
      const response = await fetch(`/api/roles/${role.id}/permissions`)
      const data = await response.json()
      if (data.success) {
        setSelectedPermissions(data.data.map((p: Permission) => p.id))
      }
    } catch {
      setSelectedPermissions([])
    }
    setPermissionModalOpen(true)
  }

  // 권한 설정 저장
  const handlePermissionSubmit = async () => {
    if (!selectedRole) return

    try {
      const response = await fetch(`/api/roles/${selectedRole.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds: selectedPermissions }),
      })

      const data = await response.json()

      if (data.success) {
        message.success('권한이 설정되었습니다')
        setPermissionModalOpen(false)
      } else {
        message.error(data.error || '권한 설정 중 오류가 발생했습니다')
      }
    } catch {
      message.error('권한 설정 중 오류가 발생했습니다')
    }
  }

  // 권한 트리 데이터 생성
  const getPermissionTreeData = (): TreeDataNode[] => {
    const typeMap = new Map<string, Permission[]>()
    permissions.forEach((p) => {
      const list = typeMap.get(p.type) || []
      list.push(p)
      typeMap.set(p.type, list)
    })

    return Array.from(typeMap.entries()).map(([type, perms]) => ({
      title: type,
      key: `type-${type}`,
      children: perms.map((p) => ({
        title: `${p.name} (${p.code})`,
        key: p.id,
      })),
    }))
  }

  // 상위 역할 이름 찾기
  const getParentName = (parentId: number | null) => {
    if (!parentId) return '-'
    const parent = roles.find((r) => r.id === parentId)
    return parent?.name || '-'
  }

  // 테이블 컬럼
  const columns: TableProps<Role>['columns'] = [
    {
      title: '역할명',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '역할 코드',
      dataIndex: 'code',
      key: 'code',
      render: (code) => <Tag>{code}</Tag>,
    },
    {
      title: '상위 역할',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId) => getParentName(parentId),
    },
    {
      title: '상태',
      key: 'status',
      render: (_, record) => (
        record.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag>
      ),
    },
    {
      title: '액션',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<SettingOutlined />}
            onClick={() => openPermissionModal(record)}
          >
            권한
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openFormModal(record)}
          >
            수정
          </Button>
          <Popconfirm
            title="역할 삭제"
            description="이 역할을 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record)}
            okText="삭제"
            cancelText="취소"
            disabled={record.isSystem}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={record.isSystem}
            >
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
          <h1 className="text-xl font-semibold">역할 관리</h1>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchRoles}>
              새로고침
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openFormModal()}>
              역할 등록
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 역할 등록/수정 모달 */}
      <Modal
        title={editingRole ? '역할 수정' : '역할 등록'}
        open={formModalOpen}
        onCancel={() => setFormModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="code"
            label="역할 코드"
            rules={[
              { required: true, message: '역할 코드를 입력하세요' },
              { pattern: /^[A-Z_]+$/, message: '영문 대문자와 언더스코어만 사용 가능합니다' },
            ]}
          >
            <Input disabled={!!editingRole} placeholder="ROLE_CODE" />
          </Form.Item>

          <Form.Item
            name="name"
            label="역할명"
            rules={[{ required: true, message: '역할명을 입력하세요' }]}
          >
            <Input placeholder="역할 이름" />
          </Form.Item>

          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="역할 설명" />
          </Form.Item>

          <Form.Item name="parentId" label="상위 역할">
            <Select
              allowClear
              placeholder="상위 역할 선택"
              options={roles
                .filter((r) => !editingRole || r.id !== editingRole.id)
                .map((r) => ({ value: r.id, label: r.name }))}
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setFormModalOpen(false)}>취소</Button>
            <Button type="primary" htmlType="submit">
              저장
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 권한 설정 모달 */}
      <Modal
        title={`권한 설정 - ${selectedRole?.name}`}
        open={permissionModalOpen}
        onCancel={() => setPermissionModalOpen(false)}
        onOk={handlePermissionSubmit}
        okText="저장"
        cancelText="취소"
        width={600}
      >
        <div className="mb-4 text-gray-500">
          역할에 할당할 권한을 선택하세요
        </div>
        <Tree
          checkable
          defaultExpandAll
          treeData={getPermissionTreeData()}
          checkedKeys={selectedPermissions}
          onCheck={(checked) => {
            const keys = Array.isArray(checked) ? checked : checked.checked
            setSelectedPermissions(keys.filter((k): k is number => typeof k === 'number'))
          }}
        />
      </Modal>
    </div>
  )
}
