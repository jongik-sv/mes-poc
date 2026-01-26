'use client'

/**
 * TSK-05-02: 감사 로그 조회 화면
 *
 * 기능:
 * - 감사 로그 목록 조회 (필터, 페이징)
 * - 로그 상세 조회
 * - CSV 내보내기
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Badge,
  Card,
  Modal,
  DatePicker,
  Select,
  Descriptions,
  message,
} from 'antd'
import type { TableProps } from 'antd'
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker

interface AuditLog {
  id: number
  userId: number | null
  userName: string | null
  userEmail: string | null
  action: string
  resource: string | null
  resourceId: string | null
  details: Record<string, unknown> | null
  ip: string | null
  userAgent: string | null
  status: string
  errorMessage: string | null
  createdAt: string
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

const ACTION_OPTIONS = [
  { value: 'LOGIN', label: '로그인' },
  { value: 'LOGOUT', label: '로그아웃' },
  { value: 'LOGIN_FAILED', label: '로그인 실패' },
  { value: 'PASSWORD_CHANGE', label: '비밀번호 변경' },
  { value: 'PASSWORD_RESET', label: '비밀번호 초기화' },
  { value: 'ACCOUNT_LOCKED', label: '계정 잠금' },
  { value: 'ACCOUNT_UNLOCKED', label: '계정 잠금 해제' },
  { value: 'USER_CREATED', label: '사용자 생성' },
  { value: 'USER_UPDATED', label: '사용자 수정' },
  { value: 'USER_DELETED', label: '사용자 삭제' },
  { value: 'ROLE_CREATED', label: '역할 생성' },
  { value: 'ROLE_UPDATED', label: '역할 수정' },
  { value: 'ROLE_DELETED', label: '역할 삭제' },
]

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  // 필터 상태
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null])
  const [actionFilter, setActionFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>()

  // 상세 모달 상태
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  // 감사 로그 조회
  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(pagination.page))
      params.set('pageSize', String(pagination.pageSize))

      if (dateRange[0]) {
        params.set('startDate', dateRange[0].toISOString())
      }
      if (dateRange[1]) {
        params.set('endDate', dateRange[1].toISOString())
      }
      if (actionFilter.length > 0) {
        params.set('action', actionFilter.join(','))
      }
      if (statusFilter) {
        params.set('status', statusFilter)
      }

      const response = await fetch(`/api/audit-logs?${params}`)
      const data = await response.json()

      if (data.success) {
        setLogs(data.data)
        setPagination(data.pagination)
      } else {
        message.error(data.error || '감사 로그를 불러올 수 없습니다')
      }
    } catch {
      message.error('감사 로그를 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, dateRange, actionFilter, statusFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // 검색
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchLogs()
  }

  // 초기화
  const handleReset = () => {
    setDateRange([null, null])
    setActionFilter([])
    setStatusFilter(undefined)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // CSV 내보내기
  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (dateRange[0]) {
        params.set('startDate', dateRange[0].toISOString())
      }
      if (dateRange[1]) {
        params.set('endDate', dateRange[1].toISOString())
      }
      if (actionFilter.length > 0) {
        params.set('action', actionFilter.join(','))
      }
      if (statusFilter) {
        params.set('status', statusFilter)
      }

      const response = await fetch(`/api/audit-logs/export?${params}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-logs-${dayjs().format('YYYY-MM-DD')}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        message.success('CSV 파일이 다운로드되었습니다')
      } else {
        message.error('내보내기 중 오류가 발생했습니다')
      }
    } catch {
      message.error('내보내기 중 오류가 발생했습니다')
    }
  }

  // 상세 보기
  const openDetailModal = (log: AuditLog) => {
    setSelectedLog(log)
    setDetailModalOpen(true)
  }

  // 액션 라벨 가져오기
  const getActionLabel = (action: string) => {
    const option = ACTION_OPTIONS.find((o) => o.value === action)
    return option?.label || action
  }

  // 상태 Badge 렌더링
  const renderStatus = (status: string) => {
    if (status === 'SUCCESS') {
      return <Badge status="success" text="성공" />
    }
    return <Badge status="error" text="실패" />
  }

  // 테이블 컬럼
  const columns: TableProps<AuditLog>['columns'] = [
    {
      title: '일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '사용자',
      key: 'user',
      width: 150,
      render: (_, record) => record.userName || record.userEmail || '-',
    },
    {
      title: '액션',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action) => <Tag color="blue">{getActionLabel(action)}</Tag>,
    },
    {
      title: '리소스',
      dataIndex: 'resource',
      key: 'resource',
      width: 100,
      render: (resource) => resource || '-',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => renderStatus(status),
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
      render: (ip) => ip || '-',
    },
    {
      title: '액션',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => openDetailModal(record)}
        >
          상세
        </Button>
      ),
    },
  ]

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">감사 로그</h1>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            CSV 내보내기
          </Button>
        </div>

        {/* 필터 영역 */}
        <div className="mb-4 flex flex-wrap gap-2">
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
            placeholder={['시작일', '종료일']}
          />
          <Select
            mode="multiple"
            placeholder="액션 선택"
            value={actionFilter}
            onChange={setActionFilter}
            style={{ minWidth: 200 }}
            options={ACTION_OPTIONS}
            maxTagCount={2}
          />
          <Select
            placeholder="상태"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{ width: 120 }}
            options={[
              { value: 'SUCCESS', label: '성공' },
              { value: 'FAILURE', label: '실패' },
            ]}
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
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({ ...prev, page, pageSize }))
            },
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 상세 모달 */}
      <Modal
        title="감사 로그 상세"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedLog && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="일시" span={2}>
              {dayjs(selectedLog.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="사용자">
              {selectedLog.userName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="이메일">
              {selectedLog.userEmail || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="액션">
              <Tag color="blue">{getActionLabel(selectedLog.action)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="상태">
              {renderStatus(selectedLog.status)}
            </Descriptions.Item>
            <Descriptions.Item label="리소스">
              {selectedLog.resource || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="리소스 ID">
              {selectedLog.resourceId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="IP">
              {selectedLog.ip || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="User Agent" span={2}>
              {selectedLog.userAgent || '-'}
            </Descriptions.Item>
            {selectedLog.errorMessage && (
              <Descriptions.Item label="오류 메시지" span={2}>
                <span className="text-red-500">{selectedLog.errorMessage}</span>
              </Descriptions.Item>
            )}
            {selectedLog.details && (
              <Descriptions.Item label="상세 정보" span={2}>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
