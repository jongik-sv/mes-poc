'use client'

/**
 * 권한 통합 관리 화면
 *
 * 4-column master-detail layout:
 * User → RoleGroups → Roles → Permissions
 * Each column: owned items (top, read-only) + all items (bottom, checkbox assign/unassign)
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  Button,
  Card,
  Modal,
  Input,
  Select,
  Tag,
  Space,
  Checkbox,
  message,
} from 'antd'
import type { TableProps } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

interface User {
  id: number
  name: string
  email: string
  isActive: boolean
}

interface RoleGroup {
  id: number
  code: string
  name: string
  isActive: boolean
}

interface Role {
  id: number
  code: string
  name: string
  isActive: boolean
}

interface Permission {
  id: number
  code: string
  name: string
  type: string
  resource: string
  action: string
}

export default function AuthorityPage() {
  // Users
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userSearch, setUserSearch] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all')

  // RoleGroups
  const [ownedRoleGroups, setOwnedRoleGroups] = useState<RoleGroup[]>([])
  const [allRoleGroups, setAllRoleGroups] = useState<RoleGroup[]>([])
  const [selectedRoleGroupIds, setSelectedRoleGroupIds] = useState<number[]>([])
  const [originalRoleGroupIds, setOriginalRoleGroupIds] = useState<number[]>([])
  const [selectedRoleGroup, setSelectedRoleGroup] = useState<RoleGroup | null>(null)
  const [rgLoading, setRgLoading] = useState(false)

  // Roles
  const [ownedRoles, setOwnedRoles] = useState<Role[]>([])
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const [originalRoleIds, setOriginalRoleIds] = useState<number[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [rolesLoading, setRolesLoading] = useState(false)

  // Permissions
  const [ownedPermissions, setOwnedPermissions] = useState<Permission[]>([])
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])
  const [originalPermissionIds, setOriginalPermissionIds] = useState<number[]>([])
  const [permLoading, setPermLoading] = useState(false)

  // Modal
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    type: 'roleGroup' | 'role' | 'permission'
    added: string[]
    removed: string[]
  }>({ open: false, type: 'roleGroup', added: [], removed: [] })

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch {
      message.error('사용자 목록을 불러올 수 없습니다')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  // Fetch owned role groups for user
  const fetchOwnedRoleGroups = useCallback(async (userId: number) => {
    setRgLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/role-groups`)
      const data = await response.json()
      if (data.success) {
        setOwnedRoleGroups(data.data)
        const ids = data.data.map((rg: RoleGroup) => rg.id)
        setSelectedRoleGroupIds(ids)
        setOriginalRoleGroupIds(ids)
      }
    } catch {
      setOwnedRoleGroups([])
    } finally {
      setRgLoading(false)
    }
  }, [])

  // Fetch all role groups
  const fetchAllRoleGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/role-groups')
      const data = await response.json()
      if (data.success) {
        setAllRoleGroups(data.data)
      }
    } catch {
      setAllRoleGroups([])
    }
  }, [])

  // Fetch owned roles for role group
  const fetchOwnedRoles = useCallback(async (roleGroupId: number) => {
    setRolesLoading(true)
    try {
      const response = await fetch(`/api/role-groups/${roleGroupId}/roles`)
      const data = await response.json()
      if (data.success) {
        setOwnedRoles(data.data)
        const ids = data.data.map((r: Role) => r.id)
        setSelectedRoleIds(ids)
        setOriginalRoleIds(ids)
      }
    } catch {
      setOwnedRoles([])
    } finally {
      setRolesLoading(false)
    }
  }, [])

  // Fetch all roles
  const fetchAllRoles = useCallback(async () => {
    try {
      const response = await fetch('/api/roles')
      const data = await response.json()
      if (data.success) {
        setAllRoles(data.data)
      }
    } catch {
      setAllRoles([])
    }
  }, [])

  // Fetch owned permissions for role
  const fetchOwnedPermissions = useCallback(async (roleId: number) => {
    setPermLoading(true)
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`)
      const data = await response.json()
      if (data.success) {
        setOwnedPermissions(data.data)
        const ids = data.data.map((p: Permission) => p.id)
        setSelectedPermissionIds(ids)
        setOriginalPermissionIds(ids)
      }
    } catch {
      setOwnedPermissions([])
    } finally {
      setPermLoading(false)
    }
  }, [])

  // Fetch all permissions
  const fetchAllPermissions = useCallback(async () => {
    try {
      const response = await fetch('/api/permissions')
      const data = await response.json()
      if (data.success) {
        setAllPermissions(data.data)
      }
    } catch {
      setAllPermissions([])
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // User selection → load role groups
  const handleUserSelect = useCallback((user: User) => {
    setSelectedUser(user)
    setSelectedRoleGroup(null)
    setSelectedRole(null)
    setOwnedRoles([])
    setOwnedPermissions([])
    setAllRoles([])
    setAllPermissions([])
    fetchOwnedRoleGroups(user.id)
    fetchAllRoleGroups()
  }, [fetchOwnedRoleGroups, fetchAllRoleGroups])

  // RoleGroup selection → load roles
  const handleRoleGroupSelect = useCallback((rg: RoleGroup) => {
    setSelectedRoleGroup(rg)
    setSelectedRole(null)
    setOwnedPermissions([])
    setAllPermissions([])
    fetchOwnedRoles(rg.id)
    fetchAllRoles()
  }, [fetchOwnedRoles, fetchAllRoles])

  // Role selection → load permissions
  const handleRoleSelect = useCallback((role: Role) => {
    setSelectedRole(role)
    fetchOwnedPermissions(role.id)
    fetchAllPermissions()
  }, [fetchOwnedPermissions, fetchAllPermissions])

  // Save handlers with confirmation modal
  const handleSaveRoleGroups = useCallback(() => {
    const added = selectedRoleGroupIds.filter((id) => !originalRoleGroupIds.includes(id))
    const removed = originalRoleGroupIds.filter((id) => !selectedRoleGroupIds.includes(id))
    const addedNames = allRoleGroups.filter((rg) => added.includes(rg.id)).map((rg) => rg.name)
    const removedNames = allRoleGroups.filter((rg) => removed.includes(rg.id)).map((rg) => rg.name)
    setConfirmModal({ open: true, type: 'roleGroup', added: addedNames, removed: removedNames })
  }, [selectedRoleGroupIds, originalRoleGroupIds, allRoleGroups])

  const handleSaveRoles = useCallback(() => {
    const added = selectedRoleIds.filter((id) => !originalRoleIds.includes(id))
    const removed = originalRoleIds.filter((id) => !selectedRoleIds.includes(id))
    const addedNames = allRoles.filter((r) => added.includes(r.id)).map((r) => r.name)
    const removedNames = allRoles.filter((r) => removed.includes(r.id)).map((r) => r.name)
    setConfirmModal({ open: true, type: 'role', added: addedNames, removed: removedNames })
  }, [selectedRoleIds, originalRoleIds, allRoles])

  const handleSavePermissions = useCallback(() => {
    const added = selectedPermissionIds.filter((id) => !originalPermissionIds.includes(id))
    const removed = originalPermissionIds.filter((id) => !selectedPermissionIds.includes(id))
    const addedNames = allPermissions.filter((p) => added.includes(p.id)).map((p) => p.name)
    const removedNames = allPermissions.filter((p) => removed.includes(p.id)).map((p) => p.name)
    setConfirmModal({ open: true, type: 'permission', added: addedNames, removed: removedNames })
  }, [selectedPermissionIds, originalPermissionIds, allPermissions])

  const handleConfirmSave = useCallback(async () => {
    const { type } = confirmModal
    try {
      let url = ''
      let body: Record<string, number[]> = {}
      if (type === 'roleGroup' && selectedUser) {
        url = `/api/users/${selectedUser.id}/role-groups`
        body = { roleGroupIds: selectedRoleGroupIds }
      } else if (type === 'role' && selectedRoleGroup) {
        url = `/api/role-groups/${selectedRoleGroup.id}/roles`
        body = { roleIds: selectedRoleIds }
      } else if (type === 'permission' && selectedRole) {
        url = `/api/roles/${selectedRole.id}/permissions`
        body = { permissionIds: selectedPermissionIds }
      }
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (data.success) {
        message.success('저장되었습니다')
        // Refresh owned data
        if (type === 'roleGroup' && selectedUser) {
          fetchOwnedRoleGroups(selectedUser.id)
        } else if (type === 'role' && selectedRoleGroup) {
          fetchOwnedRoles(selectedRoleGroup.id)
        } else if (type === 'permission' && selectedRole) {
          fetchOwnedPermissions(selectedRole.id)
        }
      } else {
        message.error('저장 중 오류가 발생했습니다')
      }
    } catch {
      message.error('저장 중 오류가 발생했습니다')
    }
    setConfirmModal((prev) => ({ ...prev, open: false }))
  }, [confirmModal, selectedUser, selectedRoleGroup, selectedRole, selectedRoleGroupIds, selectedRoleIds, selectedPermissionIds, fetchOwnedRoleGroups, fetchOwnedRoles, fetchOwnedPermissions])

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchSearch = !userSearch || u.name.includes(userSearch) || u.email.includes(userSearch)
    const matchStatus = userStatusFilter === 'all' || (userStatusFilter === 'active' ? u.isActive : !u.isActive)
    return matchSearch && matchStatus
  })

  // User columns
  const userColumns: TableProps<User>['columns'] = [
    { title: '이름', dataIndex: 'name', key: 'name' },
    { title: '이메일', dataIndex: 'email', key: 'email' },
    {
      title: '상태', key: 'status',
      render: (_, record) => record.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag>,
    },
  ]

  // Owned table columns (read-only)
  const ownedRoleGroupColumns: TableProps<RoleGroup>['columns'] = [
    { title: '이름', dataIndex: 'name', key: 'name' },
    { title: '코드', dataIndex: 'code', key: 'code', render: (code) => <Tag>{code}</Tag> },
    {
      title: '상태', key: 'status',
      render: (_, record) => record.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag>,
    },
  ]

  const ownedRoleColumns: TableProps<Role>['columns'] = [
    { title: '이름', dataIndex: 'name', key: 'name' },
    { title: '코드', dataIndex: 'code', key: 'code', render: (code) => <Tag>{code}</Tag> },
    {
      title: '상태', key: 'status',
      render: (_, record) => record.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag>,
    },
  ]

  const ownedPermissionColumns: TableProps<Permission>['columns'] = [
    { title: '이름', dataIndex: 'name', key: 'name' },
    { title: '코드', dataIndex: 'code', key: 'code', render: (code) => <Tag>{code}</Tag> },
    { title: '유형', dataIndex: 'type', key: 'type' },
  ]

  // All items table columns (with checkbox)
  const allRoleGroupColumns: TableProps<RoleGroup>['columns'] = [
    {
      title: '', key: 'select', width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedRoleGroupIds.includes(record.id)}
          onChange={(e) => {
            setSelectedRoleGroupIds((prev) =>
              e.target.checked ? [...prev, record.id] : prev.filter((id) => id !== record.id)
            )
          }}
        />
      ),
    },
    { title: '이름', dataIndex: 'name', key: 'name' },
    { title: '코드', dataIndex: 'code', key: 'code', render: (code) => <Tag>{code}</Tag> },
    {
      title: '상태', key: 'status',
      render: (_, record) => record.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag>,
    },
  ]

  const allRoleColumns: TableProps<Role>['columns'] = [
    {
      title: '', key: 'select', width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedRoleIds.includes(record.id)}
          onChange={(e) => {
            setSelectedRoleIds((prev) =>
              e.target.checked ? [...prev, record.id] : prev.filter((id) => id !== record.id)
            )
          }}
        />
      ),
    },
    { title: '이름', dataIndex: 'name', key: 'name' },
    { title: '코드', dataIndex: 'code', key: 'code', render: (code) => <Tag>{code}</Tag> },
    {
      title: '상태', key: 'status',
      render: (_, record) => record.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag>,
    },
  ]

  const allPermissionColumns: TableProps<Permission>['columns'] = [
    {
      title: '', key: 'select', width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedPermissionIds.includes(record.id)}
          onChange={(e) => {
            setSelectedPermissionIds((prev) =>
              e.target.checked ? [...prev, record.id] : prev.filter((id) => id !== record.id)
            )
          }}
        />
      ),
    },
    { title: '이름', dataIndex: 'name', key: 'name' },
    { title: '코드', dataIndex: 'code', key: 'code', render: (code) => <Tag>{code}</Tag> },
    { title: '유형', dataIndex: 'type', key: 'type' },
  ]

  const typeLabel = confirmModal.type === 'roleGroup' ? '역할그룹' : confirmModal.type === 'role' ? '역할' : '권한'

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">권한 통합 관리</h1>
      <div className="flex gap-4">
        {/* Column 1: Users */}
        <div className="flex-1 min-w-0">
          <Card title="사용자 목록" size="small">
            <Space className="mb-3 w-full" orientation="vertical">
              <Input
                placeholder="이름 또는 이메일 검색"
                prefix={<SearchOutlined />}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <Select
                className="w-full"
                value={userStatusFilter}
                onChange={setUserStatusFilter}
                options={[
                  { value: 'all', label: '전체' },
                  { value: 'active', label: '활성' },
                  { value: 'inactive', label: '비활성' },
                ]}
              />
            </Space>
            <Table
              columns={userColumns}
              dataSource={filteredUsers}
              rowKey="id"
              loading={usersLoading}
              pagination={false}
              size="small"
              scroll={{ y: 500 }}
              onRow={(record) => ({
                onClick: () => handleUserSelect(record),
                className: selectedUser?.id === record.id ? 'ant-table-row-selected' : '',
              })}
            />
          </Card>
        </div>

        {/* Column 2: RoleGroups */}
        <div className="flex-1 min-w-0">
          <Card title="역할그룹" size="small">
            <Card type="inner" title="보유 역할그룹" size="small" className="mb-3">
              <Table
                columns={ownedRoleGroupColumns}
                dataSource={ownedRoleGroups}
                rowKey="id"
                loading={rgLoading}
                pagination={false}
                size="small"
                scroll={{ y: 180 }}
                onRow={(record) => ({
                  onClick: () => handleRoleGroupSelect(record),
                  className: selectedRoleGroup?.id === record.id ? 'ant-table-row-selected' : '',
                })}
              />
            </Card>
            <Card type="inner" title="전체 역할그룹" size="small">
              <Table
                columns={allRoleGroupColumns}
                dataSource={allRoleGroups}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ y: 180 }}
              />
              <div className="flex justify-end mt-2">
                <Button type="primary" size="small" onClick={handleSaveRoleGroups} disabled={!selectedUser}>
                  저장
                </Button>
              </div>
            </Card>
          </Card>
        </div>

        {/* Column 3: Roles */}
        <div className="flex-1 min-w-0">
          <Card title="역할" size="small">
            <Card type="inner" title="보유 역할" size="small" className="mb-3">
              <Table
                columns={ownedRoleColumns}
                dataSource={ownedRoles}
                rowKey="id"
                loading={rolesLoading}
                pagination={false}
                size="small"
                scroll={{ y: 180 }}
                onRow={(record) => ({
                  onClick: () => handleRoleSelect(record),
                  className: selectedRole?.id === record.id ? 'ant-table-row-selected' : '',
                })}
              />
            </Card>
            <Card type="inner" title="전체 역할" size="small">
              <Table
                columns={allRoleColumns}
                dataSource={allRoles}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ y: 180 }}
              />
              <div className="flex justify-end mt-2">
                <Button type="primary" size="small" onClick={handleSaveRoles} disabled={!selectedRoleGroup}>
                  저장
                </Button>
              </div>
            </Card>
          </Card>
        </div>

        {/* Column 4: Permissions */}
        <div className="flex-1 min-w-0">
          <Card title="권한" size="small">
            <Card type="inner" title="보유 권한" size="small" className="mb-3">
              <Table
                columns={ownedPermissionColumns}
                dataSource={ownedPermissions}
                rowKey="id"
                loading={permLoading}
                pagination={false}
                size="small"
                scroll={{ y: 180 }}
              />
            </Card>
            <Card type="inner" title="전체 권한" size="small">
              <Table
                columns={allPermissionColumns}
                dataSource={allPermissions}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ y: 180 }}
              />
              <div className="flex justify-end mt-2">
                <Button type="primary" size="small" onClick={handleSavePermissions} disabled={!selectedRole}>
                  저장
                </Button>
              </div>
            </Card>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        title="변경 확인"
        open={confirmModal.open}
        onOk={handleConfirmSave}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
        okText="확인"
        cancelText="취소"
      >
        <div className="space-y-2">
          <p>{typeLabel} 변경 사항:</p>
          {confirmModal.added.length > 0 && (
            <div>
              <span className="font-semibold text-green-600">추가: </span>
              {confirmModal.added.map((name) => (
                <Tag key={name} color="green">{name}</Tag>
              ))}
            </div>
          )}
          {confirmModal.removed.length > 0 && (
            <div>
              <span className="font-semibold text-red-600">제거: </span>
              {confirmModal.removed.map((name) => (
                <Tag key={name} color="red">{name}</Tag>
              ))}
            </div>
          )}
          {confirmModal.added.length === 0 && confirmModal.removed.length === 0 && (
            <p>변경 사항이 없습니다.</p>
          )}
        </div>
      </Modal>
    </div>
  )
}
