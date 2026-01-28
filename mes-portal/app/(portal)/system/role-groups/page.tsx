'use client'

/**
 * 역할그룹 정의 화면 (TSK-01-01)
 *
 * 3-column master-detail 레이아웃:
 * 좌측(35%): 역할그룹 목록 - CRUD + 검색/필터
 * 중앙(33%): 역할 관리 - 할당/해제 + CRUD
 * 우측(32%): 권한 관리 - 할당/해제 + CRUD
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  App,
  Button,
  Space,
  Tag,
  Card,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Typography,
  Checkbox,
  Empty,
  Switch,
} from 'antd'
import type { TableProps } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'

// ─── 타입 정의 ───

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

interface Role {
  id: number
  roleCd: string
  name: string
  description: string | null
  isActive: boolean
  systemId: number
}

interface Permission {
  id: number
  permissionCd: string
  name: string
  description: string | null
  isActive: boolean
  menuId: number | null
  config: string
}

interface PaginatedResponse {
  items: RoleGroup[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ─── 상수 ───

const PAGE_SIZE = 10

// ─── 유틸 ───

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && 'items' in data) {
    return (data as { items: T[] }).items
  }
  return []
}

export default function RoleGroupsPage() {
  const { message } = App.useApp()

  // ─── 역할그룹 (좌측) ───
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([])
  const [systems, setSystems] = useState<SystemItem[]>([])
  const [rgLoading, setRgLoading] = useState(false)
  const [rgTotal, setRgTotal] = useState(0)
  const [rgPage, setRgPage] = useState(1)
  const [rgSearch, setRgSearch] = useState('')
  const [rgSystemFilter, setRgSystemFilter] = useState<number | undefined>()
  const [rgStatusFilter, setRgStatusFilter] = useState<string | undefined>()
  const [selectedRoleGroup, setSelectedRoleGroup] = useState<RoleGroup | null>(null)

  // 역할그룹 폼 모달
  const [rgFormOpen, setRgFormOpen] = useState(false)
  const [editingRg, setEditingRg] = useState<RoleGroup | null>(null)
  const [rgForm] = Form.useForm()

  // ─── 역할 관리 (중앙) ───
  const [assignedRoles, setAssignedRoles] = useState<Role[]>([])
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<number>>(new Set())
  const [rolesLoading, setRolesLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleSearch, setRoleSearch] = useState('')
  const [roleStatusFilter, setRoleStatusFilter] = useState<string | undefined>()

  // 역할 폼 모달
  const [roleFormOpen, setRoleFormOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleForm] = Form.useForm()

  // ─── 권한 관리 (우측) ───
  const [assignedPerms, setAssignedPerms] = useState<Permission[]>([])
  const [allPerms, setAllPerms] = useState<Permission[]>([])
  const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(new Set())
  const [permsLoading, setPermsLoading] = useState(false)
  const [permSearch, setPermSearch] = useState('')
  const [permTypeFilter, setPermTypeFilter] = useState<string | undefined>()

  // 권한 폼 모달
  const [permFormOpen, setPermFormOpen] = useState(false)
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null)
  const [permForm] = Form.useForm()

  // ─── 데이터 조회 ───

  const fetchSystems = useCallback(async () => {
    try {
      const res = await fetch('/api/systems')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) setSystems(data.data)
    } catch { /* ignore */ }
  }, [])

  const fetchRoleGroups = useCallback(async (page = 1) => {
    setRgLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
      if (rgSearch) params.set('search', rgSearch)
      if (rgSystemFilter) params.set('systemId', String(rgSystemFilter))
      if (rgStatusFilter) params.set('isActive', rgStatusFilter)

      const res = await fetch(`/api/role-groups?${params}`)
      const data = await res.json()
      if (data.success) {
        const payload: PaginatedResponse = data.data
        setRoleGroups(payload.items)
        setRgTotal(payload.total)
        setRgPage(payload.page)
      } else {
        message.error('역할그룹 목록을 불러올 수 없습니다')
      }
    } catch {
      message.error('역할그룹 목록을 불러올 수 없습니다')
    } finally {
      setRgLoading(false)
    }
  }, [rgSearch, rgSystemFilter, rgStatusFilter])

  const fetchAssignedRoles = useCallback(async (roleGroupId: number) => {
    setRolesLoading(true)
    try {
      const res = await fetch(`/api/role-groups/${roleGroupId}/roles`)
      const data = await res.json()
      if (data.success) {
        const items = extractArray<Role>(data.data)
        setAssignedRoles(items)
        setSelectedRoleIds(new Set(items.map((r) => r.id)))
      }
    } catch {
      setAssignedRoles([])
    } finally {
      setRolesLoading(false)
    }
  }, [])

  const fetchAllRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/roles')
      const data = await res.json()
      if (data.success) setAllRoles(extractArray<Role>(data.data))
    } catch { /* ignore */ }
  }, [])

  const fetchAssignedPerms = useCallback(async (roleId: number) => {
    setPermsLoading(true)
    try {
      const res = await fetch(`/api/roles/${roleId}/permissions`)
      const data = await res.json()
      if (data.success) {
        const items = extractArray<Permission>(data.data)
        setAssignedPerms(items)
        setSelectedPermIds(new Set(items.map((p) => p.id)))
      }
    } catch {
      setAssignedPerms([])
    } finally {
      setPermsLoading(false)
    }
  }, [])

  const fetchAllPerms = useCallback(async () => {
    try {
      const res = await fetch('/api/permissions')
      const data = await res.json()
      if (data.success) setAllPerms(extractArray<Permission>(data.data))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchRoleGroups()
    fetchSystems()
  }, [fetchRoleGroups, fetchSystems])

  // ─── 역할그룹 선택 → 역할 패널 갱신 ───

  const handleRoleGroupSelect = useCallback((rg: RoleGroup) => {
    setSelectedRoleGroup(rg)
    setSelectedRole(null)
    setAssignedPerms([])
    setAllPerms([])
    setSelectedPermIds(new Set())
    fetchAssignedRoles(rg.id)
    fetchAllRoles()
  }, [fetchAssignedRoles, fetchAllRoles])

  // ─── 역할 선택 → 권한 패널 갱신 ───

  const handleRoleSelect = useCallback((role: Role) => {
    setSelectedRole(role)
    fetchAssignedPerms(role.id)
    fetchAllPerms()
  }, [fetchAssignedPerms, fetchAllPerms])

  // ─── 역할그룹 CRUD ───

  const openRgForm = (group?: RoleGroup) => {
    setEditingRg(group || null)
    if (group) {
      rgForm.setFieldsValue({
        roleGroupCd: group.roleGroupCd,
        name: group.name,
        systemId: group.systemId,
        description: group.description,
      })
    } else {
      rgForm.resetFields()
    }
    setRgFormOpen(true)
  }

  const handleRgSubmit = async (values: Record<string, unknown>) => {
    try {
      const url = editingRg ? `/api/role-groups/${editingRg.id}` : '/api/role-groups'
      const method = editingRg ? 'PUT' : 'POST'
      const body = editingRg
        ? { name: values.name, description: values.description, isActive: editingRg.isActive }
        : values

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        message.success(editingRg ? '역할그룹이 수정되었습니다' : '역할그룹이 등록되었습니다')
        setRgFormOpen(false)
        fetchRoleGroups(rgPage)
      } else {
        message.error(data.error || '저장 중 오류가 발생했습니다')
      }
    } catch {
      message.error('저장 중 오류가 발생했습니다')
    }
  }

  const handleRgDelete = async (group: RoleGroup) => {
    try {
      const res = await fetch(`/api/role-groups/${group.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        message.success('역할그룹이 삭제되었습니다')
        if (selectedRoleGroup?.id === group.id) {
          setSelectedRoleGroup(null)
          setSelectedRole(null)
        }
        fetchRoleGroups(rgPage)
      } else {
        message.error(data.error || '삭제 중 오류가 발생했습니다')
      }
    } catch {
      message.error('삭제 중 오류가 발생했습니다')
    }
  }

  // ─── 역할 할당 저장 ───

  const handleSaveRoles = async () => {
    if (!selectedRoleGroup) return
    try {
      const res = await fetch(`/api/role-groups/${selectedRoleGroup.id}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleIds: Array.from(selectedRoleIds) }),
      })
      const data = await res.json()
      if (data.success) {
        message.success('역할이 할당되었습니다')
        fetchAssignedRoles(selectedRoleGroup.id)
        fetchRoleGroups(rgPage)
      } else {
        message.error(data.error || '역할 할당 중 오류가 발생했습니다')
      }
    } catch {
      message.error('역할 할당 중 오류가 발생했습니다')
    }
  }

  // ─── 역할 CRUD ───

  const openRoleForm = (role?: Role) => {
    setEditingRole(role || null)
    if (role) {
      roleForm.setFieldsValue({
        roleCd: role.roleCd,
        name: role.name,
        description: role.description,
        isActive: role.isActive,
      })
    } else {
      roleForm.resetFields()
      roleForm.setFieldsValue({ isActive: true })
    }
    setRoleFormOpen(true)
  }

  const handleRoleSubmit = async (values: Record<string, unknown>) => {
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles'
      const method = editingRole ? 'PUT' : 'POST'
      const body = editingRole
        ? { name: values.name, description: values.description, isActive: values.isActive }
        : { ...values, systemId: selectedRoleGroup?.systemId }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        message.success(editingRole ? '역할이 수정되었습니다' : '역할이 등록되었습니다')
        setRoleFormOpen(false)
        fetchAllRoles()
        if (selectedRoleGroup) fetchAssignedRoles(selectedRoleGroup.id)
      } else {
        message.error(data.error || '저장 중 오류가 발생했습니다')
      }
    } catch {
      message.error('저장 중 오류가 발생했습니다')
    }
  }

  const handleRoleDelete = async (role: Role) => {
    try {
      const res = await fetch(`/api/roles/${role.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        message.success('역할이 삭제되었습니다')
        if (selectedRole?.id === role.id) setSelectedRole(null)
        fetchAllRoles()
        if (selectedRoleGroup) fetchAssignedRoles(selectedRoleGroup.id)
      } else {
        message.error(data.error || '삭제 중 오류가 발생했습니다')
      }
    } catch {
      message.error('삭제 중 오류가 발생했습니다')
    }
  }

  // ─── 권한 할당 저장 ───

  const handleSavePerms = async () => {
    if (!selectedRole) return
    try {
      const res = await fetch(`/api/roles/${selectedRole.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds: Array.from(selectedPermIds) }),
      })
      const data = await res.json()
      if (data.success) {
        message.success('권한이 할당되었습니다')
        fetchAssignedPerms(selectedRole.id)
      } else {
        message.error(data.error || '권한 할당 중 오류가 발생했습니다')
      }
    } catch {
      message.error('권한 할당 중 오류가 발생했습니다')
    }
  }

  // ─── 권한 CRUD ───

  const openPermForm = (perm?: Permission) => {
    setEditingPerm(perm || null)
    if (perm) {
      permForm.setFieldsValue({
        permissionCd: perm.permissionCd,
        name: perm.name,
        description: perm.description,
        isActive: perm.isActive,
      })
    } else {
      permForm.resetFields()
      permForm.setFieldsValue({ isActive: true })
    }
    setPermFormOpen(true)
  }

  const handlePermSubmit = async (values: Record<string, unknown>) => {
    try {
      const url = editingPerm ? `/api/permissions/${editingPerm.id}` : '/api/permissions'
      const method = editingPerm ? 'PUT' : 'POST'
      const body = editingPerm
        ? { name: values.name, description: values.description, isActive: values.isActive }
        : { ...values, systemId: selectedRoleGroup?.systemId }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        message.success(editingPerm ? '권한이 수정되었습니다' : '권한이 등록되었습니다')
        setPermFormOpen(false)
        fetchAllPerms()
        if (selectedRole) fetchAssignedPerms(selectedRole.id)
      } else {
        message.error(data.error || '저장 중 오류가 발생했습니다')
      }
    } catch {
      message.error('저장 중 오류가 발생했습니다')
    }
  }

  const handlePermDelete = async (perm: Permission) => {
    try {
      const res = await fetch(`/api/permissions/${perm.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        message.success('권한이 삭제되었습니다')
        fetchAllPerms()
        if (selectedRole) fetchAssignedPerms(selectedRole.id)
      } else {
        message.error(data.error || '삭제 중 오류가 발생했습니다')
      }
    } catch {
      message.error('삭제 중 오류가 발생했습니다')
    }
  }

  // ─── 검색 핸들러 ───

  const handleRgSearch = () => {
    setRgPage(1)
    fetchRoleGroups(1)
  }

  // ─── 필터링 ───

  const filteredAllRoles = allRoles
    .filter((r) => {
      const matchSearch = !roleSearch || r.name.includes(roleSearch) || r.roleCd.includes(roleSearch)
      const matchStatus = !roleStatusFilter || (roleStatusFilter === 'active' ? r.isActive : !r.isActive)
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      const aChecked = selectedRoleIds.has(a.id) ? 0 : 1
      const bChecked = selectedRoleIds.has(b.id) ? 0 : 1
      return aChecked - bChecked
    })

  const filteredAllPerms = allPerms
    .filter((p) => {
      const matchSearch = !permSearch || p.name.includes(permSearch) || p.permissionCd.includes(permSearch)
      const matchType = !permTypeFilter || true
      return matchSearch && matchType
    })
    .sort((a, b) => {
      const aChecked = selectedPermIds.has(a.id) ? 0 : 1
      const bChecked = selectedPermIds.has(b.id) ? 0 : 1
      return aChecked - bChecked
    })

  // ─── 테이블 컬럼 ───

  const rgColumns: TableProps<RoleGroup>['columns'] = [
    { title: '코드', dataIndex: 'roleGroupCd', key: 'roleGroupCd', width: 100, render: (code: string) => <Tag>{code}</Tag> },
    { title: '이름', dataIndex: 'name', key: 'name', width: 120 },
    { title: '시스템', dataIndex: 'systemName', key: 'systemName', width: 100 },
    { title: '상태', key: 'isActive', width: 80, render: (_, r) => r.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag> },
    {
      title: '액션', key: 'action', width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openRgForm(record) }} />
          <Popconfirm title="역할그룹 삭제" description="이 역할그룹을 삭제하시겠습니까?" onConfirm={() => handleRgDelete(record)} okText="삭제" cancelText="취소">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const allRoleColumns: TableProps<Role>['columns'] = [
    {
      title: '', key: 'select', width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedRoleIds.has(record.id)}
          onChange={(e) => {
            setSelectedRoleIds((prev) => {
              const next = new Set(prev)
              if (e.target.checked) next.add(record.id)
              else next.delete(record.id)
              return next
            })
          }}
        />
      ),
    },
    { title: '이름', dataIndex: 'name', key: 'name', width: 120 },
    { title: '코드', dataIndex: 'roleCd', key: 'roleCd', width: 100, render: (code: string) => <Tag>{code}</Tag> },
    { title: '상태', key: 'isActive', width: 80, render: (_, r) => r.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag> },
    {
      title: '액션', key: 'action', width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openRoleForm(record) }} />
          <Popconfirm title="역할 삭제" description="이 역할을 삭제하시겠습니까?" onConfirm={() => handleRoleDelete(record)} okText="삭제" cancelText="취소">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const allPermColumns: TableProps<Permission>['columns'] = [
    {
      title: '', key: 'select', width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedPermIds.has(record.id)}
          onChange={(e) => {
            setSelectedPermIds((prev) => {
              const next = new Set(prev)
              if (e.target.checked) next.add(record.id)
              else next.delete(record.id)
              return next
            })
          }}
        />
      ),
    },
    { title: '이름', dataIndex: 'name', key: 'name', width: 120 },
    { title: '코드', dataIndex: 'permissionCd', key: 'permissionCd', width: 100, render: (code: string) => <Tag>{code}</Tag> },
    { title: '상태', key: 'isActive', width: 80, render: (_, r) => r.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag> },
    {
      title: '액션', key: 'action', width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openPermForm(record)} />
          <Popconfirm title="권한 삭제" description="이 권한을 삭제하시겠습니까?" onConfirm={() => handlePermDelete(record)} okText="삭제" cancelText="취소">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // ─── 렌더링 ───

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="mb-4">
        <Typography.Title level={4}>역할그룹 정의</Typography.Title>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* ─── 좌측: 역할그룹 목록 (35%) ─── */}
        <Card
          title="역할그룹 목록"
          className="flex-none overflow-hidden flex flex-col card-fill-body"
          style={{ width: '35%' }}
          extra={
            <Space size="small">
              <Button size="small" icon={<ReloadOutlined />} onClick={() => fetchRoleGroups(rgPage)} />
              <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => openRgForm()}>등록</Button>
            </Space>
          }
        >
          <div className="mb-3 flex gap-2 flex-wrap">
            <Input
              placeholder="이름 또는 코드 검색"
              value={rgSearch}
              onChange={(e) => setRgSearch(e.target.value)}
              onPressEnter={handleRgSearch}
              prefix={<SearchOutlined />}
              size="small"
              className="flex-1 min-w-0"
              allowClear
            />
            <Select
              placeholder="시스템"
              value={rgSystemFilter}
              onChange={setRgSystemFilter}
              allowClear
              size="small"
              className="w-24"
              options={(systems ?? []).map((s) => ({ value: s.id, label: s.name }))}
            />
            <Select
              placeholder="상태"
              value={rgStatusFilter}
              onChange={setRgStatusFilter}
              allowClear
              size="small"
              className="w-20"
              options={[
                { value: 'true', label: '활성' },
                { value: 'false', label: '비활성' },
              ]}
            />
          </div>
          <div className="flex-1 overflow-hidden table-fill-height">
            <Table
              columns={rgColumns}
              dataSource={roleGroups}
              rowKey="id"
              loading={rgLoading}
              size="small"
              pagination={{
                current: rgPage,
                pageSize: PAGE_SIZE,
                total: rgTotal,
                onChange: (page) => fetchRoleGroups(page),
                size: 'small',
                showSizeChanger: false,
              }}
              onRow={(record) => ({
                onClick: () => handleRoleGroupSelect(record),
                className: selectedRoleGroup?.id === record.id ? 'ant-table-row-selected cursor-pointer' : 'cursor-pointer',
              })}
            />
          </div>
        </Card>

        {/* ─── 중앙: 역할 관리 (33%) ─── */}
        <Card
          title={selectedRoleGroup ? `역할 관리 — ${selectedRoleGroup.name}` : '역할 관리'}
          className="flex-none overflow-hidden flex flex-col card-fill-body"
          style={{ width: '33%' }}
          extra={
            selectedRoleGroup ? (
              <Space size="small">
                <Button size="small" icon={<ReloadOutlined />} onClick={() => { fetchAssignedRoles(selectedRoleGroup.id); fetchAllRoles() }} />
                <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => openRoleForm()}>등록</Button>
              </Space>
            ) : null
          }
        >
          {selectedRoleGroup ? (
            <div className="h-full flex flex-col gap-2 overflow-hidden">
              <div className="flex gap-2">
                <Input
                  placeholder="역할 검색"
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  prefix={<SearchOutlined />}
                  size="small"
                  className="flex-1"
                  allowClear
                />
                <Select
                  placeholder="상태"
                  value={roleStatusFilter}
                  onChange={setRoleStatusFilter}
                  allowClear
                  size="small"
                  className="w-20"
                  options={[
                    { value: 'active', label: '활성' },
                    { value: 'inactive', label: '비활성' },
                  ]}
                />
              </div>
              <div className="flex-1 overflow-hidden table-fill-height">
                <Table
                  columns={allRoleColumns}
                  dataSource={filteredAllRoles}
                  rowKey="id"
                  loading={rolesLoading}
                  size="small"
                  pagination={false}
                  onRow={(record) => ({
                    onClick: () => handleRoleSelect(record),
                    className: selectedRole?.id === record.id ? 'ant-table-row-selected cursor-pointer' : 'cursor-pointer',
                  })}
                />
              </div>
              <div className="flex justify-end">
                <Button type="primary" size="small" onClick={handleSaveRoles}>할당 저장</Button>
              </div>
            </div>
          ) : (
            <Empty description="역할그룹을 선택해주세요" />
          )}
        </Card>

        {/* ─── 우측: 권한 관리 (32%) ─── */}
        <Card
          title={selectedRole ? `권한 관리 — ${selectedRole.name}` : '권한 관리'}
          className="flex-1 overflow-hidden flex flex-col card-fill-body"
          extra={
            selectedRole ? (
              <Space size="small">
                <Button size="small" icon={<ReloadOutlined />} onClick={() => { fetchAssignedPerms(selectedRole.id); fetchAllPerms() }} />
                <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => openPermForm()}>등록</Button>
              </Space>
            ) : null
          }
        >
          {selectedRole ? (
            <div className="h-full flex flex-col gap-2 overflow-hidden">
              <div className="flex gap-2">
                <Input
                  placeholder="권한 검색"
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  prefix={<SearchOutlined />}
                  size="small"
                  className="flex-1"
                  allowClear
                />
                <Select
                  placeholder="유형"
                  value={permTypeFilter}
                  onChange={setPermTypeFilter}
                  allowClear
                  size="small"
                  className="w-20"
                  options={[
                    { value: 'menu', label: '메뉴' },
                    { value: 'api', label: 'API' },
                    { value: 'data', label: '데이터' },
                  ]}
                />
              </div>
              <div className="flex-1 overflow-hidden table-fill-height">
                <Table
                  columns={allPermColumns}
                  dataSource={filteredAllPerms}
                  rowKey="id"
                  loading={permsLoading}
                  size="small"
                  pagination={false}
                />
              </div>
              <div className="flex justify-end">
                <Button type="primary" size="small" onClick={handleSavePerms}>할당 저장</Button>
              </div>
            </div>
          ) : (
            <Empty description={selectedRoleGroup ? '역할을 선택해주세요' : '역할그룹을 먼저 선택해주세요'} />
          )}
        </Card>
      </div>

      {/* ─── 역할그룹 등록/수정 모달 ─── */}
      <Modal
        title={editingRg ? '역할그룹 수정' : '역할그룹 등록'}
        open={rgFormOpen}
        onCancel={() => setRgFormOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={rgForm} layout="vertical" onFinish={handleRgSubmit}>
          <Form.Item name="roleGroupCd" label="역할그룹 코드" rules={[{ required: true, message: '역할그룹 코드를 입력하세요' }, { pattern: /^[A-Z_]+$/, message: '영문 대문자와 언더스코어만 사용 가능합니다' }]}>
            <Input disabled={!!editingRg} placeholder="RG_CODE" />
          </Form.Item>
          <Form.Item name="name" label="역할그룹명" rules={[{ required: true, message: '역할그룹명을 입력하세요' }]}>
            <Input placeholder="역할그룹 이름" />
          </Form.Item>
          <Form.Item name="systemId" label="소속 시스템" rules={[{ required: true, message: '소속 시스템을 선택하세요' }]}>
            <Select placeholder="소속 시스템을 선택하세요" disabled={!!editingRg} options={systems.map((s) => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="역할그룹 설명" />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setRgFormOpen(false)}>취소</Button>
            <Button type="primary" htmlType="submit">저장</Button>
          </div>
        </Form>
      </Modal>

      {/* ─── 역할 등록/수정 모달 ─── */}
      <Modal
        title={editingRole ? '역할 수정' : '역할 등록'}
        open={roleFormOpen}
        onCancel={() => setRoleFormOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={roleForm} layout="vertical" onFinish={handleRoleSubmit}>
          <Form.Item name="roleCd" label="역할 코드" rules={[{ required: true, message: '역할 코드를 입력하세요' }, { pattern: /^[A-Z_]+$/, message: '영문 대문자와 언더스코어만 사용 가능합니다' }]}>
            <Input disabled={!!editingRole} placeholder="ROLE_CODE" />
          </Form.Item>
          <Form.Item name="name" label="역할명" rules={[{ required: true, message: '역할명을 입력하세요' }]}>
            <Input placeholder="역할 이름" />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="역할 설명" />
          </Form.Item>
          <Form.Item name="isActive" label="활성상태" valuePropName="checked">
            <Switch />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setRoleFormOpen(false)}>취소</Button>
            <Button type="primary" htmlType="submit">저장</Button>
          </div>
        </Form>
      </Modal>

      {/* ─── 권한 등록/수정 모달 ─── */}
      <Modal
        title={editingPerm ? '권한 수정' : '권한 등록'}
        open={permFormOpen}
        onCancel={() => setPermFormOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={permForm} layout="vertical" onFinish={handlePermSubmit}>
          <Form.Item name="permissionCd" label="권한 코드" rules={[{ required: true, message: '권한 코드를 입력하세요' }, { pattern: /^[A-Z_]+$/, message: '영문 대문자와 언더스코어만 사용 가능합니다' }]}>
            <Input disabled={!!editingPerm} placeholder="PERM_CODE" />
          </Form.Item>
          <Form.Item name="name" label="권한명" rules={[{ required: true, message: '권한명을 입력하세요' }]}>
            <Input placeholder="권한 이름" />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="권한 설명" />
          </Form.Item>
          <Form.Item name="isActive" label="활성상태" valuePropName="checked">
            <Switch />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setPermFormOpen(false)}>취소</Button>
            <Button type="primary" htmlType="submit">저장</Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
