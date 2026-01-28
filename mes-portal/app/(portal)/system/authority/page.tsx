'use client'

/**
 * 사용자 권한 할당 화면 (TSK-02-01)
 *
 * 3-column layout:
 * 좌측(30%): 사용자 목록 (검색/상태필터, 행 클릭 → 중앙/우측 갱신)
 * 중앙(35%): 역할그룹 할당 (보유 read-only + 전체 체크박스 + 저장)
 * 우측(35%): 메뉴 시뮬레이션 (Tree, read-only, debounce 갱신)
 */

import { useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react'
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
  Divider,
  Typography,
  Empty,
  Tree,
  Spin,
  App,
} from 'antd'
import type { TableProps, TreeDataNode } from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  FolderOutlined,
  FileTextOutlined,
  DashboardOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  SettingOutlined,
  UserOutlined,
  ControlOutlined,
  LineChartOutlined,
  EditOutlined,
  WarningOutlined,
  DesktopOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  MenuOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  HistoryOutlined,
  UnorderedListOutlined,
  SplitCellsOutlined,
  FundProjectionScreenOutlined,
  CloseOutlined,
} from '@ant-design/icons'

// ── 아이콘 매핑 (Sidebar.tsx와 동일) ──

const iconMap: Record<string, ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  BuildOutlined: <BuildOutlined />,
  CheckCircleOutlined: <CheckCircleOutlined />,
  ToolOutlined: <ToolOutlined />,
  SettingOutlined: <SettingOutlined />,
  UserOutlined: <UserOutlined />,
  ControlOutlined: <ControlOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  EditOutlined: <EditOutlined />,
  SearchOutlined: <SearchOutlined />,
  WarningOutlined: <WarningOutlined />,
  DesktopOutlined: <DesktopOutlined />,
  TeamOutlined: <TeamOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  MenuOutlined: <MenuOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  FolderOutlined: <FolderOutlined />,
  HistoryOutlined: <HistoryOutlined />,
  UnorderedListOutlined: <UnorderedListOutlined />,
  SplitCellsOutlined: <SplitCellsOutlined />,
  FundProjectionScreenOutlined: <FundProjectionScreenOutlined />,
  CloseOutlined: <CloseOutlined />,
}

// ── 타입 정의 ──

interface User {
  userId: string
  name: string
  email: string
  isActive: boolean
}

interface RoleGroup {
  id?: number
  roleGroupId: number
  roleGroupCd: string
  name: string
  description: string | null
  systemId: number | null
  isActive: boolean
}

interface MenuTreeNode {
  key: string
  title: string
  icon?: string
  path?: string
  children?: MenuTreeNode[]
}

interface MenuSimulationResponse {
  menus: MenuTreeNode[]
  summary: { totalMenus: number; totalCategories: number }
}

// ── 유틸리티 ──

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object' && 'items' in data) {
    return (data as { items: T[] }).items
  }
  return []
}

function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

// ── 메뉴 트리 변환 ──

function toTreeData(nodes: MenuTreeNode[]): TreeDataNode[] {
  if (!nodes) return []
  return nodes.map((node) => ({
    key: node.key,
    title: node.title,
    icon: node.icon ? (iconMap[node.icon] ?? <FolderOutlined />) : <FolderOutlined />,
    children: node.children ? toTreeData(node.children) : undefined,
  }))
}

const DEBOUNCE_MS = 300

// ── 메인 컴포넌트 ──

export default function AuthorityPage() {
  const { message } = App.useApp()

  // 사용자
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userSearch, setUserSearch] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all')

  // 역할그룹 할당
  const [assignedRoleGroups, setAssignedRoleGroups] = useState<RoleGroup[]>([])
  const [allRoleGroups, setAllRoleGroups] = useState<RoleGroup[]>([])
  const [selectedRgIds, setSelectedRgIds] = useState<Set<number>>(new Set())
  const [originalRgIds, setOriginalRgIds] = useState<Set<number>>(new Set())
  const [rgLoading, setRgLoading] = useState(false)
  const [rgSaving, setRgSaving] = useState(false)

  // 메뉴 시뮬레이션
  const [menuTree, setMenuTree] = useState<MenuTreeNode[]>([])
  const [menuSummary, setMenuSummary] = useState({ totalMenus: 0, totalCategories: 0 })
  const [menuLoading, setMenuLoading] = useState(false)

  // 미저장 변경 경고
  const pendingUserRef = useRef<User | null>(null)
  const [unsavedWarningOpen, setUnsavedWarningOpen] = useState(false)

  // ── 사용자 조회 ──

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const res = await fetch('/api/users')
      const json = await res.json()
      if (json.success) {
        setUsers(extractArray<User>(json.data))
      }
    } catch {
      message.error('사용자 목록을 불러올 수 없습니다')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ── 역할그룹 조회 ──

  const fetchAssignedRoleGroups = useCallback(async (userId: string) => {
    setRgLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}/role-groups`)
      const json = await res.json()
      if (json.success) {
        const items = extractArray<RoleGroup>(json.data)
        setAssignedRoleGroups(items)
        const ids = new Set(items.map((rg) => rg.roleGroupId))
        setSelectedRgIds(ids)
        setOriginalRgIds(ids)
      }
    } catch {
      setAssignedRoleGroups([])
    } finally {
      setRgLoading(false)
    }
  }, [])

  const fetchAllRoleGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/role-groups')
      const json = await res.json()
      if (json.success) {
        const items = extractArray<RoleGroup>(json.data)
        setAllRoleGroups(items.map((rg) => ({ ...rg, roleGroupId: rg.roleGroupId ?? rg.id ?? 0 })))
      }
    } catch {
      setAllRoleGroups([])
    }
  }, [])

  // ── 메뉴 시뮬레이션 ──

  const fetchMenuSimulation = useCallback(async (userId: string, rgIds: number[]) => {
    setMenuLoading(true)
    try {
      const params = rgIds.length > 0 ? `?roleGroupIds=${rgIds.join(',')}` : ''
      const res = await fetch(`/api/users/${userId}/menus${params}`)
      const json = await res.json()
      if (json.success) {
        const data = json.data as MenuSimulationResponse
        setMenuTree(data.menus)
        setMenuSummary(data.summary)
      }
    } catch {
      setMenuTree([])
      setMenuSummary({ totalMenus: 0, totalCategories: 0 })
    } finally {
      setMenuLoading(false)
    }
  }, [])

  const debouncedFetchMenu = useMemo(
    () =>
      debounce((userId: string, rgIds: number[]) => {
        fetchMenuSimulation(userId, rgIds)
      }, DEBOUNCE_MS),
    [fetchMenuSimulation]
  )

  // ── 역할그룹 체크 변경 시 메뉴 시뮬레이션 갱신 ──

  const handleRgCheckChange = useCallback(
    (roleGroupId: number, checked: boolean) => {
      setSelectedRgIds((prev) => {
        const next = new Set(prev)
        if (checked) {
          next.add(roleGroupId)
        } else {
          next.delete(roleGroupId)
        }
        if (selectedUser) {
          debouncedFetchMenu(selectedUser.userId, Array.from(next))
        }
        return next
      })
    },
    [selectedUser, debouncedFetchMenu]
  )

  // ── 사용자 선택 ──

  const hasUnsavedChanges = useCallback(() => {
    if (originalRgIds.size !== selectedRgIds.size) return true
    for (const id of selectedRgIds) {
      if (!originalRgIds.has(id)) return true
    }
    return false
  }, [originalRgIds, selectedRgIds])

  const applyUserSelection = useCallback(
    (user: User) => {
      setSelectedUser(user)
      setMenuTree([])
      setMenuSummary({ totalMenus: 0, totalCategories: 0 })
      fetchAssignedRoleGroups(user.userId)
      fetchAllRoleGroups()
      fetchMenuSimulation(user.userId, [])
    },
    [fetchAssignedRoleGroups, fetchAllRoleGroups, fetchMenuSimulation]
  )

  const handleUserSelect = useCallback(
    (user: User) => {
      if (selectedUser && hasUnsavedChanges()) {
        pendingUserRef.current = user
        setUnsavedWarningOpen(true)
        return
      }
      applyUserSelection(user)
    },
    [selectedUser, hasUnsavedChanges, applyUserSelection]
  )

  const handleDiscardAndSwitch = useCallback(() => {
    setUnsavedWarningOpen(false)
    if (pendingUserRef.current) {
      applyUserSelection(pendingUserRef.current)
      pendingUserRef.current = null
    }
  }, [applyUserSelection])

  // ── 할당 저장 ──

  const handleSaveRoleGroups = useCallback(async () => {
    if (!selectedUser) return
    setRgSaving(true)
    try {
      const res = await fetch(`/api/users/${selectedUser.userId}/role-groups`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleGroupIds: Array.from(selectedRgIds) }),
      })
      const json = await res.json()
      if (json.success) {
        message.success('저장되었습니다')
        fetchAssignedRoleGroups(selectedUser.userId)
      } else {
        message.error('저장 중 오류가 발생했습니다')
      }
    } catch {
      message.error('저장 중 오류가 발생했습니다')
    } finally {
      setRgSaving(false)
    }
  }, [selectedUser, selectedRgIds, fetchAssignedRoleGroups])

  // ── 필터링 ──

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !userSearch || u.name.includes(userSearch) || u.email.includes(userSearch)
      const matchStatus =
        userStatusFilter === 'all' ||
        (userStatusFilter === 'active' ? u.isActive : !u.isActive)
      return matchSearch && matchStatus
    })
  }, [users, userSearch, userStatusFilter])

  // ── 테이블 컬럼 ──

  const userColumns: TableProps<User>['columns'] = [
    { title: '이름', dataIndex: 'name', key: 'name', width: 100 },
    { title: '이메일', dataIndex: 'email', key: 'email', width: 150 },
    {
      title: '상태',
      key: 'status',
      width: 80,
      render: (_, record) =>
        record.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag>,
    },
  ]

  const assignedRgColumns: TableProps<RoleGroup>['columns'] = [
    { title: '이름', dataIndex: 'name', key: 'name', width: 120 },
    {
      title: '코드',
      dataIndex: 'roleGroupCd',
      key: 'roleGroupCd',
      width: 100,
      render: (code: string) => <Tag>{code}</Tag>,
    },
    {
      title: '상태',
      key: 'status',
      width: 80,
      render: (_, record) =>
        record.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag>,
    },
  ]

  const allRgColumns: TableProps<RoleGroup>['columns'] = [
    {
      title: '',
      key: 'select',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedRgIds.has(record.roleGroupId)}
          onChange={(e) => handleRgCheckChange(record.roleGroupId, e.target.checked)}
        />
      ),
    },
    { title: '이름', dataIndex: 'name', key: 'name', width: 120 },
    {
      title: '코드',
      dataIndex: 'roleGroupCd',
      key: 'roleGroupCd',
      width: 100,
      render: (code: string) => <Tag>{code}</Tag>,
    },
    {
      title: '상태',
      key: 'status',
      width: 80,
      render: (_, record) =>
        record.isActive ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag>,
    },
  ]

  // ── Tree 데이터 ──

  const treeData = useMemo(() => toTreeData(menuTree), [menuTree])

  // ── 렌더링 ──

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="mb-4">
        <Typography.Title level={4}>사용자 권한 할당</Typography.Title>
      </div>
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* 좌측: 사용자 목록 */}
        <Card
          title="사용자 목록"
          size="small"
          className="flex-none h-full overflow-hidden flex flex-col"
          style={{ width: '30%' }}
          extra={
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={fetchUsers}
              size="small"
            />
          }
        >
          <Space orientation="vertical" className="w-full mb-3">
            <Input
              placeholder="이름 또는 이메일 검색"
              prefix={<SearchOutlined />}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              allowClear
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
            rowKey="userId"
            loading={usersLoading}
            pagination={false}
            size="small"
            scroll={{ y: 500 }}
            onRow={(record) => ({
              onClick: () => handleUserSelect(record),
              className:
                selectedUser?.userId === record.userId ? 'ant-table-row-selected' : '',
              style: { cursor: 'pointer' },
            })}
          />
        </Card>

        {/* 중앙: 역할그룹 할당 */}
        <Card
          title="역할그룹 할당"
          size="small"
          className="flex-none h-full overflow-hidden flex flex-col"
          style={{ width: '35%' }}
        >
          {selectedUser ? (
            <>
              <Typography.Text strong className="mb-2 block">
                보유 역할그룹
              </Typography.Text>
              <Table
                columns={assignedRgColumns}
                dataSource={assignedRoleGroups}
                rowKey="roleGroupId"
                loading={rgLoading}
                pagination={false}
                size="small"
                scroll={{ y: 200 }}
              />
              <Divider className="my-3" />
              <Typography.Text strong className="mb-2 block">
                전체 역할그룹
              </Typography.Text>
              <Table
                columns={allRgColumns}
                dataSource={allRoleGroups}
                rowKey="roleGroupId"
                pagination={false}
                size="small"
                scroll={{ y: 200 }}
              />
              <div className="flex justify-end mt-3">
                <Button
                  type="primary"
                  onClick={handleSaveRoleGroups}
                  loading={rgSaving}
                >
                  할당 저장
                </Button>
              </div>
            </>
          ) : (
            <Empty description="사용자를 선택해주세요" />
          )}
        </Card>

        {/* 우측: 메뉴 시뮬레이션 */}
        <Card
          title="메뉴 시뮬레이션"
          size="small"
          className="flex-1 h-full overflow-hidden flex flex-col"
        >
          {selectedUser ? (
            <Spin spinning={menuLoading}>
              <div className="flex-1 overflow-auto" style={{ maxHeight: 500 }}>
                {treeData.length > 0 ? (
                  <Tree
                    treeData={treeData}
                    defaultExpandAll
                    showIcon
                    selectable={false}
                  />
                ) : (
                  <Empty description="접근 가능한 메뉴가 없습니다" />
                )}
              </div>
              <Divider className="my-3" />
              <Typography.Text type="secondary">
                접근 가능 메뉴: {menuSummary.totalMenus}개 메뉴 /{' '}
                {menuSummary.totalCategories}개 카테고리
              </Typography.Text>
            </Spin>
          ) : (
            <Empty description="사용자를 선택해주세요" />
          )}
        </Card>
      </div>

      {/* 미저장 변경 경고 모달 */}
      <Modal
        title="미저장 변경사항"
        open={unsavedWarningOpen}
        onOk={handleDiscardAndSwitch}
        onCancel={() => {
          setUnsavedWarningOpen(false)
          pendingUserRef.current = null
        }}
        okText="변경사항 무시"
        cancelText="취소"
        okButtonProps={{ danger: true }}
      >
        <Typography.Text>
          저장하지 않은 역할그룹 변경사항이 있습니다. 다른 사용자를 선택하면 변경사항이
          사라집니다.
        </Typography.Text>
      </Modal>
    </div>
  )
}
