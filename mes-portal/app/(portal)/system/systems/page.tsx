'use client'

/**
 * 시스템 관리 화면
 *
 * 기능:
 * - 시스템(테넌트) 목록 조회 (페이지네이션, 검색, 필터)
 * - 시스템 등록/수정/삭제
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
} from 'antd'
import type { TableProps } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'

interface System {
  id: number
  systemId: string
  name: string
  domain: string
  description: string | null
  isActive: boolean
  createdAt: string
}

interface PaginatedResponse {
  items: System[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // 검색/필터
  const [searchText, setSearchText] = useState('')
  const [filterActive, setFilterActive] = useState<string | undefined>(undefined)

  // 모달 상태
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingSystem, setEditingSystem] = useState<System | null>(null)

  const [form] = Form.useForm()

  // 시스템 목록 조회
  const fetchSystems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (searchText) params.set('search', searchText)
      if (filterActive !== undefined) params.set('isActive', filterActive)

      const response = await fetch(`/api/systems?${params.toString()}`)
      const data = await response.json()
      if (data.success) {
        const result: PaginatedResponse = data.data
        setSystems(result.items)
        setTotal(result.total)
      } else {
        message.error(data.error || '시스템 목록을 불러올 수 없습니다')
      }
    } catch {
      message.error('시스템 목록을 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchText, filterActive])

  useEffect(() => {
    fetchSystems()
  }, [fetchSystems])

  // 등록/수정 모달 열기
  const openFormModal = (system?: System) => {
    setEditingSystem(system || null)
    if (system) {
      form.setFieldsValue({
        systemId: system.systemId,
        name: system.name,
        domain: system.domain,
        description: system.description,
        isActive: system.isActive,
      })
    } else {
      form.resetFields()
    }
    setFormModalOpen(true)
  }

  // 등록/수정 저장
  const handleFormSubmit = async (values: Record<string, unknown>) => {
    try {
      const url = editingSystem
        ? `/api/systems/${editingSystem.id}`
        : '/api/systems'
      const method = editingSystem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        message.success(
          editingSystem ? '시스템이 수정되었습니다' : '시스템이 등록되었습니다'
        )
        setFormModalOpen(false)
        fetchSystems()
      } else {
        message.error(data.error || '저장 중 오류가 발생했습니다')
      }
    } catch {
      message.error('저장 중 오류가 발생했습니다')
    }
  }

  // 삭제
  const handleDelete = async (system: System) => {
    try {
      const response = await fetch(`/api/systems/${system.id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        message.success('시스템이 삭제되었습니다')
        fetchSystems()
      } else {
        message.error(data.error || '삭제 중 오류가 발생했습니다')
      }
    } catch {
      message.error('삭제 중 오류가 발생했습니다')
    }
  }

  // 검색 실행
  const handleSearch = () => {
    setPage(1)
  }

  // 테이블 컬럼
  const columns: TableProps<System>['columns'] = [
    {
      title: '시스템 ID',
      dataIndex: 'systemId',
      key: 'systemId',
      render: (systemId: string) => <Tag>{systemId}</Tag>,
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '도메인',
      dataIndex: 'domain',
      key: 'domain',
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string | null) => desc || '-',
    },
    {
      title: '상태',
      key: 'isActive',
      render: (_, record) =>
        record.isActive ? (
          <Tag color="green">활성</Tag>
        ) : (
          <Tag>비활성</Tag>
        ),
    },
    {
      title: '액션',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openFormModal(record)}
          >
            수정
          </Button>
          <Popconfirm
            title="시스템 삭제"
            description="이 시스템을 삭제하시겠습니까?"
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
          <h1 className="text-xl font-semibold">시스템 관리</h1>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchSystems}>
              새로고침
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openFormModal()}
            >
              시스템 등록
            </Button>
          </Space>
        </div>

        <div className="flex gap-3 mb-4">
          <Input
            placeholder="이름 또는 시스템 ID로 검색"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            className="max-w-xs"
          />
          <Select
            placeholder="활성 상태"
            allowClear
            value={filterActive}
            onChange={(value) => {
              setFilterActive(value)
              setPage(1)
            }}
            options={[
              { value: 'true', label: '활성' },
              { value: 'false', label: '비활성' },
            ]}
            className="w-32"
          />
          <Button type="primary" onClick={handleSearch}>
            검색
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={systems}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `총 ${t}건`,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
          }}
        />
      </Card>

      {/* 시스템 등록/수정 모달 */}
      <Modal
        title={editingSystem ? '시스템 수정' : '시스템 등록'}
        open={formModalOpen}
        onCancel={() => setFormModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="systemId"
            label="시스템 ID"
            rules={[{ required: true, message: '시스템 ID를 입력하세요' }]}
          >
            <Input
              disabled={!!editingSystem}
              placeholder="SYS001"
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="이름"
            rules={[{ required: true, message: '이름을 입력하세요' }]}
          >
            <Input placeholder="시스템 이름" />
          </Form.Item>

          <Form.Item
            name="domain"
            label="도메인"
            rules={[{ required: true, message: '도메인을 입력하세요' }]}
          >
            <Input placeholder="example.com" />
          </Form.Item>

          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="시스템 설명" />
          </Form.Item>

          {editingSystem && (
            <Form.Item name="isActive" label="활성 상태">
              <Select
                options={[
                  { value: true, label: '활성' },
                  { value: false, label: '비활성' },
                ]}
              />
            </Form.Item>
          )}

          <div className="flex justify-end gap-2">
            <Button onClick={() => setFormModalOpen(false)}>취소</Button>
            <Button type="primary" htmlType="submit">
              저장
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
