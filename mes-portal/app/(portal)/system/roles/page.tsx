'use client'

/**
 * TSK-05-02: 역할 관리 화면
 * TSK-03-02: 권한 할당 탭 추가
 *
 * 기능:
 * - 역할 목록 조회
 * - 역할 등록/수정/삭제
 * - 역할-권한 매핑
 * - 역할 상세 Drawer (기본 정보 + 권한 할당 탭)
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
  Checkbox,
  Popconfirm,
  message,
  Drawer,
  Tabs,
  Tree,
  Descriptions,
  Spin,
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

interface MenuItem {
  id: number
  name: string
  code: string
  parentId: number | null
  category: string
  children?: MenuItem[]
}

interface MenuPermission {
  id: number
  code: string
  name: string
  type: string
  resource: string
  action: string
  menuId: number
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)

  // 모달 상태
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [permissionModalOpen, setPermissionModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

  // Drawer 상태
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerRole, setDrawerRole] = useState<Role | null>(null)
  const [drawerTab, setDrawerTab] = useState('info')
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null)
  const [menuPermissions, setMenuPermissions] = useState<MenuPermission[]>([])
  const [rolePermissionIds, setRolePermissionIds] = useState<number[]>([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [permLoading, setPermLoading] = useState(false)
  const [savingPermissions, setSavingPermissions] = useState(false)

  const [form] = Form.useForm()

  // 역할 목록 조회
  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/roles')
      const data = await response.json()
      if (data.success) {
        setRoles(data.data)
      } else {
        message.error(data.error || '역할 목록을 불러올 수 없습니다')
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
      const response = await fetch('/api/permissions')
      const data = await response.json()
      if (data.success) {
        setPermissions(data.data)
      }
    } catch {
      // 무시
    }
  }, [])

  // 메뉴 목록 조회
  const fetchMenus = useCallback(async () => {
    setMenuLoading(true)
    try {
      const response = await fetch('/api/menus')
      const data = await response.json()
      if (data.success) {
        setMenus(data.data)
      }
    } catch {
      // 무시
    } finally {
      setMenuLoading(false)
    }
  }, [])

  // 역할의 권한 목록 조회
  const fetchRolePermissions = useCallback(async (roleId: number) => {
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`)
      const data = await response.json()
      if (data.success) {
        setRolePermissionIds(data.data.map((p: Permission) => p.id))
      }
    } catch {
      setRolePermissionIds([])
    }
  }, [])

  // 메뉴별 권한 조회
  const fetchMenuPermissions = useCallback(async (menuId: number) => {
    setPermLoading(true)
    try {
      const response = await fetch(`/api/permissions?menuId=${menuId}`)
      const data = await response.json()
      if (data.success) {
        setMenuPermissions(data.data)
      }
    } catch {
      setMenuPermissions([])
    } finally {
      setPermLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [fetchRoles, fetchPermissions])

  // Drawer 열기 (행 클릭)
  const openDrawer = (role: Role) => {
    setDrawerRole(role)
    setDrawerTab('info')
    setDrawerOpen(true)
    fetchMenus()
    fetchRolePermissions(role.id)
  }

  // 메뉴 트리 선택
  const handleMenuSelect = (menuId: number) => {
    setSelectedMenuId(menuId)
    fetchMenuPermissions(menuId)
  }

  // 권한 할당 저장
  const handleSavePermissions = async () => {
    if (!drawerRole) return
    setSavingPermissions(true)
    try {
      const response = await fetch(`/api/roles/${drawerRole.id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds: rolePermissionIds }),
      })
      const data = await response.json()
      if (data.success) {
        message.success('권한이 저장되었습니다')
      } else {
        message.error(data.error || '권한 저장 중 오류가 발생했습니다')
      }
    } catch {
      message.error('권한 저장 중 오류가 발생했습니다')
    } finally {
      setSavingPermissions(false)
    }
  }

  // 권한 체크박스 변경
  const handlePermissionCheck = (permId: number, checked: boolean) => {
    setRolePermissionIds((prev) =>
      checked ? [...prev, permId] : prev.filter((id) => id !== permId)
    )
  }

  // 메뉴 트리 데이터 변환
  const buildMenuTreeData = (items: MenuItem[]): TreeDataNode[] => {
    return items.map((item) => ({
      title: item.name,
      key: item.id,
      children: item.children ? buildMenuTreeData(item.children) : [],
    }))
  }

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
            onClick={(e) => { e.stopPropagation(); openPermissionModal(record) }}
          >
            권한
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={(e) => { e.stopPropagation(); openFormModal(record) }}
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
              onClick={(e) => e.stopPropagation()}
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
          onRow={(record) => ({
            onClick: () => openDrawer(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* 역할 상세 Drawer */}
      <Drawer
        title={`역할 상세 - ${drawerRole?.name || ''}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={720}
      >
        <Tabs activeKey={drawerTab} onChange={setDrawerTab} items={[
          {
            key: 'info',
            label: '기본 정보',
            children: drawerRole ? (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="역할 코드">{drawerRole.code}</Descriptions.Item>
                <Descriptions.Item label="역할명">{drawerRole.name}</Descriptions.Item>
                <Descriptions.Item label="설명">{drawerRole.description || '-'}</Descriptions.Item>
                <Descriptions.Item label="상위 역할">{getParentName(drawerRole.parentId)}</Descriptions.Item>
                <Descriptions.Item label="시스템 역할">{drawerRole.isSystem ? '예' : '아니오'}</Descriptions.Item>
                <Descriptions.Item label="상태">
                  {drawerRole.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag>}
                </Descriptions.Item>
              </Descriptions>
            ) : null,
          },
          {
            key: 'permissions',
            label: '권한 할당',
            children: (
              <div className="flex gap-4">
                {/* 왼쪽: 메뉴 트리 */}
                <div className="w-1/3 border-r pr-4">
                  <h3 className="font-semibold mb-2">메뉴 목록</h3>
                  {menuLoading ? (
                    <Spin />
                  ) : (
                    <Tree
                      treeData={buildMenuTreeData(menus)}
                      defaultExpandAll
                      onSelect={(keys) => {
                        if (keys.length > 0) {
                          handleMenuSelect(Number(keys[0]))
                        }
                      }}
                      selectedKeys={selectedMenuId ? [selectedMenuId] : []}
                    />
                  )}
                </div>
                {/* 오른쪽: 권한 체크박스 */}
                <div className="w-2/3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">권한 목록</h3>
                    <Button
                      type="primary"
                      size="small"
                      onClick={handleSavePermissions}
                      loading={savingPermissions}
                    >
                      저장
                    </Button>
                  </div>
                  {permLoading ? (
                    <Spin />
                  ) : selectedMenuId ? (
                    menuPermissions.length > 0 ? (
                      <Space direction="vertical">
                        {menuPermissions.map((perm) => (
                          <Checkbox
                            key={perm.id}
                            checked={rolePermissionIds.includes(perm.id)}
                            onChange={(e) => handlePermissionCheck(perm.id, e.target.checked)}
                          >
                            {perm.name} ({perm.code})
                          </Checkbox>
                        ))}
                      </Space>
                    ) : (
                      <div className="text-gray-400">이 메뉴에 등록된 권한이 없습니다</div>
                    )
                  ) : (
                    <div className="text-gray-400">메뉴를 선택하세요</div>
                  )}
                </div>
              </div>
            ),
          },
        ]} />
      </Drawer>

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
