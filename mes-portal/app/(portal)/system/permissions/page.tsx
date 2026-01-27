'use client'

/**
 * 권한 정의 관리 페이지
 *
 * 좌측: 메뉴 트리 (category 기반 폴더 구조)
 * 우측: 선택된 메뉴의 권한 목록 + CRUD
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Tree,
  Table,
  Modal,
  Form,
  Input,
  Checkbox,
  Switch,
  Tag,
  Button,
  Card,
  Space,
  message,
  Popconfirm,
  Spin,
  Empty,
} from 'antd'
import type { TableProps, TreeDataNode } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'

interface Menu {
  id: number
  name: string
  category: string
  sortOrder: number
}

interface PermissionConfig {
  actions: string[]
  fieldConstraints: Record<string, string | string[]>
}

interface PermissionItem {
  id: number
  permissionCd: string
  name: string
  description: string | null
  isActive: boolean
  config: string
  menuId: number
}

interface PermissionDetail extends PermissionItem {
  roles: { id: number; name: string; code: string }[]
}

interface FieldConstraintRow {
  key: string
  fieldName: string
  values: string
}

const ALL_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT']

function buildMenuTree(menus: Menu[]): TreeDataNode[] {
  const root: Record<string, TreeDataNode & { children: TreeDataNode[] }> = {}

  for (const menu of menus) {
    const parts = menu.category.split('/')
    let currentLevel = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const key = parts.slice(0, i + 1).join('/')
      const isLeaf = i === parts.length - 1

      if (!currentLevel[key]) {
        currentLevel[key] = {
          title: part,
          key: isLeaf ? `menu-${menu.id}` : `folder-${key}`,
          children: [],
          isLeaf,
        }
        // Attach to parent
        if (i === 0) {
          // top level - will be collected at the end
        } else {
          const parentKey = parts.slice(0, i).join('/')
          if (currentLevel[parentKey]) {
            currentLevel[parentKey].children.push(currentLevel[key])
          }
        }
      }

      if (i === 0 && !root[`__top_${key}`]) {
        root[`__top_${key}`] = currentLevel[key]
      }
    }
  }

  // Collect top-level nodes
  const topKeys = Object.keys(root).filter((k) => k.startsWith('__top_'))
  return topKeys.map((k) => root[k])
}

// Simpler approach: build tree properly
function buildTree(menus: Menu[]): TreeDataNode[] {
  interface TreeNode {
    title: string
    key: string
    children: TreeNode[]
    isLeaf?: boolean
    menuId?: number
  }

  const nodeMap = new Map<string, TreeNode>()

  for (const menu of menus) {
    const parts = menu.category.split('/')

    for (let i = 0; i < parts.length; i++) {
      const path = parts.slice(0, i + 1).join('/')
      const isLeaf = i === parts.length - 1

      if (!nodeMap.has(path)) {
        nodeMap.set(path, {
          title: parts[i],
          key: isLeaf ? `menu-${menu.id}` : `folder-${path}`,
          children: [],
          isLeaf,
          menuId: isLeaf ? menu.id : undefined,
        })
      }

      if (i > 0) {
        const parentPath = parts.slice(0, i).join('/')
        const parent = nodeMap.get(parentPath)
        const child = nodeMap.get(path)
        if (parent && child && !parent.children.includes(child)) {
          parent.children.push(child)
        }
      }
    }
  }

  // Return top-level nodes (those without a parent in the map)
  const topPaths = new Set<string>()
  for (const menu of menus) {
    topPaths.add(menu.category.split('/')[0])
  }

  return Array.from(topPaths).map((p) => nodeMap.get(p)!).filter(Boolean)
}

function parseConfig(configStr: string): PermissionConfig {
  try {
    return JSON.parse(configStr)
  } catch {
    return { actions: [], fieldConstraints: {} }
  }
}

let constraintCounter = 0

export default function PermissionsPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [menusLoading, setMenusLoading] = useState(false)
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null)
  const [selectedMenuName, setSelectedMenuName] = useState<string>('')
  const [permissions, setPermissions] = useState<PermissionItem[]>([])
  const [permLoading, setPermLoading] = useState(false)

  // 모달
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPerm, setEditingPerm] = useState<PermissionDetail | null>(null)
  const [form] = Form.useForm()
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const [fieldConstraints, setFieldConstraints] = useState<FieldConstraintRow[]>([])
  const [saving, setSaving] = useState(false)

  // 메뉴 목록 조회
  const fetchMenus = useCallback(async () => {
    setMenusLoading(true)
    try {
      const res = await fetch('/api/menus')
      const data = await res.json()
      if (data.success) {
        setMenus(data.data)
      }
    } catch {
      message.error('메뉴 목록을 불러올 수 없습니다')
    } finally {
      setMenusLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  // 선택된 메뉴의 권한 조회
  const fetchPermissions = useCallback(async (menuId: number) => {
    setPermLoading(true)
    try {
      const res = await fetch(`/api/menus/${menuId}/permissions`)
      const data = await res.json()
      if (data.success) {
        setPermissions(data.data)
      }
    } catch {
      message.error('권한 목록을 불러올 수 없습니다')
    } finally {
      setPermLoading(false)
    }
  }, [])

  // 트리 선택 핸들러
  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length === 0) return
    const key = String(selectedKeys[0])
    if (key.startsWith('menu-')) {
      const menuId = Number(key.replace('menu-', ''))
      setSelectedMenuId(menuId)
      const menu = menus.find((m) => m.id === menuId)
      setSelectedMenuName(menu?.name || '')
      fetchPermissions(menuId)
    }
  }

  // 권한 등록/수정 모달 열기
  const openModal = async (perm?: PermissionItem) => {
    if (perm) {
      // 상세 조회
      try {
        const res = await fetch(`/api/permissions/${perm.id}`)
        const data = await res.json()
        if (data.success) {
          const detail = data.data as PermissionDetail
          setEditingPerm(detail)
          const config = parseConfig(detail.config)
          form.setFieldsValue({
            permissionCd: detail.permissionCd,
            name: detail.name,
            description: detail.description,
            isActive: detail.isActive,
          })
          setSelectedActions(config.actions)
          setFieldConstraints(
            Object.entries(config.fieldConstraints).map(([fieldName, values]) => ({
              key: `fc-${constraintCounter++}`,
              fieldName,
              values: Array.isArray(values) ? values.join(', ') : String(values),
            }))
          )
        }
      } catch {
        message.error('권한 상세를 불러올 수 없습니다')
        return
      }
    } else {
      setEditingPerm(null)
      form.resetFields()
      form.setFieldsValue({ isActive: true })
      setSelectedActions([])
      setFieldConstraints([])
    }
    setModalOpen(true)
  }

  // 저장
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const fc: Record<string, string | string[]> = {}
      for (const row of fieldConstraints) {
        if (row.fieldName.trim()) {
          const vals = row.values.split(',').map((v) => v.trim()).filter(Boolean)
          fc[row.fieldName.trim()] = vals.length === 1 ? vals[0] : vals
        }
      }

      const config = JSON.stringify({
        actions: selectedActions,
        fieldConstraints: fc,
      })

      const body = {
        systemId: 1,
        menuId: selectedMenuId,
        permissionCd: values.permissionCd,
        name: values.name,
        description: values.description || '',
        isActive: values.isActive ?? true,
        config,
      }

      const url = editingPerm
        ? `/api/permissions/${editingPerm.id}`
        : '/api/permissions'
      const method = editingPerm ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.success) {
        message.success(editingPerm ? '권한이 수정되었습니다' : '권한이 등록되었습니다')
        setModalOpen(false)
        if (selectedMenuId) fetchPermissions(selectedMenuId)
      } else {
        message.error(data.error || '저장에 실패했습니다')
      }
    } catch {
      // validation error
    } finally {
      setSaving(false)
    }
  }

  // 삭제
  const handleDelete = async (perm: PermissionItem) => {
    try {
      const res = await fetch(`/api/permissions/${perm.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        message.success('권한이 삭제되었습니다')
        if (selectedMenuId) fetchPermissions(selectedMenuId)
      } else {
        message.error(data.error || '삭제에 실패했습니다')
      }
    } catch {
      message.error('삭제에 실패했습니다')
    }
  }

  // 필드 제약조건 추가
  const addFieldConstraint = () => {
    setFieldConstraints((prev) => [
      ...prev,
      { key: `fc-${constraintCounter++}`, fieldName: '', values: '' },
    ])
  }

  // 필드 제약조건 삭제
  const removeFieldConstraint = (key: string) => {
    setFieldConstraints((prev) => prev.filter((r) => r.key !== key))
  }

  // 필드 제약조건 업데이트
  const updateFieldConstraint = (key: string, field: 'fieldName' | 'values', value: string) => {
    setFieldConstraints((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r))
    )
  }

  const treeData = buildTree(menus)

  const columns: TableProps<PermissionItem>['columns'] = [
    {
      title: '권한코드',
      dataIndex: 'permissionCd',
      key: 'permissionCd',
      render: (code: string) => <Tag>{code}</Tag>,
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: PermissionItem) => {
        const config = parseConfig(record.config)
        return (
          <Space size={[0, 4]} wrap>
            {config.actions.map((a) => (
              <Tag key={a} color="blue">{a}</Tag>
            ))}
          </Space>
        )
      },
    },
    {
      title: '활성상태',
      key: 'isActive',
      render: (_: unknown, record: PermissionItem) =>
        record.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag>,
    },
    {
      title: '액션',
      key: 'action',
      width: 150,
      render: (_: unknown, record: PermissionItem) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            수정
          </Button>
          <Popconfirm
            title="권한 삭제"
            description="이 권한을 삭제하시겠습니까?"
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
      <h1 className="text-xl font-semibold mb-4">권한 정의 관리</h1>
      <div className="flex gap-4" style={{ minHeight: 600 }}>
        {/* 좌측 메뉴 트리 */}
        <Card
          title="메뉴 트리"
          style={{ width: 300, flexShrink: 0 }}
          styles={{ body: { padding: 12, overflow: 'auto', maxHeight: 540 } }}
        >
          {menusLoading ? (
            <div className="flex justify-center py-8"><Spin /></div>
          ) : (
            <Tree
              treeData={treeData}
              defaultExpandAll
              onSelect={handleTreeSelect}
              blockNode
            />
          )}
        </Card>

        {/* 우측 권한 목록 */}
        <Card className="flex-1" styles={{ body: { padding: 16 } }}>
          {selectedMenuId ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-medium">
                  {selectedMenuName} 권한 목록
                </h2>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchPermissions(selectedMenuId)}
                  >
                    새로고침
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openModal()}
                  >
                    권한 등록
                  </Button>
                </Space>
              </div>
              <Table
                columns={columns}
                dataSource={permissions}
                rowKey="id"
                loading={permLoading}
                pagination={false}
                size="middle"
              />
            </>
          ) : (
            <Empty description="좌측 메뉴 트리에서 메뉴를 선택하세요" />
          )}
        </Card>
      </div>

      {/* 권한 등록/수정 모달 */}
      <Modal
        title={editingPerm ? '권한 수정' : '권한 등록'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="저장"
        cancelText="취소"
        confirmLoading={saving}
        width={640}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="permissionCd"
            label="권한 코드"
            rules={[{ required: true, message: '권한 코드를 입력하세요' }]}
          >
            <Input placeholder="PERM_CODE" disabled={!!editingPerm} />
          </Form.Item>

          <Form.Item
            name="name"
            label="권한명"
            rules={[{ required: true, message: '권한명을 입력하세요' }]}
          >
            <Input placeholder="권한 이름" />
          </Form.Item>

          <Form.Item name="description" label="설명">
            <Input.TextArea rows={2} placeholder="권한 설명" />
          </Form.Item>

          <Form.Item name="isActive" label="활성 상태" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>

        {/* Actions */}
        <div className="mb-4">
          <div className="font-medium mb-2">Actions</div>
          <Checkbox.Group
            value={selectedActions}
            onChange={(vals) => setSelectedActions(vals as string[])}
            options={ALL_ACTIONS.map((a) => ({ label: a, value: a }))}
          />
        </div>

        {/* 필드 제약조건 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">필드 제약조건</span>
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={addFieldConstraint}
            >
              필드 추가
            </Button>
          </div>
          {fieldConstraints.map((row) => (
            <div key={row.key} className="flex gap-2 mb-2 items-center">
              <Input
                placeholder="필드명"
                value={row.fieldName}
                onChange={(e) => updateFieldConstraint(row.key, 'fieldName', e.target.value)}
                style={{ width: 160 }}
              />
              <Input
                placeholder="값 (쉼표 구분)"
                value={row.values}
                onChange={(e) => updateFieldConstraint(row.key, 'values', e.target.value)}
                className="flex-1"
              />
              <Button
                type="text"
                danger
                icon={<MinusCircleOutlined />}
                onClick={() => removeFieldConstraint(row.key)}
                aria-label="delete-constraint"
              />
            </div>
          ))}
        </div>

        {/* 할당된 역할 */}
        {editingPerm && editingPerm.roles && editingPerm.roles.length > 0 && (
          <div className="mt-4">
            <div className="font-medium mb-2">할당된 역할</div>
            <Space wrap>
              {editingPerm.roles.map((role) => (
                <Tag key={role.id} color="purple">{role.name}</Tag>
              ))}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  )
}
