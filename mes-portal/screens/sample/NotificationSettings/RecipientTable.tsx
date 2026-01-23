'use client'

// RecipientTable.tsx
// TSK-06-19: 알림 수신자 테이블 컴포넌트

import { useCallback, useMemo, useRef, useEffect } from 'react'
import { Card, Table, Button, Input, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { InputRef } from 'antd'
import type { NotificationRecipient } from './types'

const { Text } = Typography

interface RecipientTableProps {
  /** 수신자 목록 */
  recipients: NotificationRecipient[]
  /** 수신자 추가 핸들러 */
  onAdd: () => void
  /** 수신자 삭제 핸들러 */
  onDelete: (id: string) => void
  /** 수신자 정보 변경 핸들러 */
  onChange: (id: string, field: 'name' | 'email', value: string) => void
  /** 이메일 에러 맵 (id -> 에러메시지) */
  emailErrors: Record<string, string>
}

/**
 * 알림 수신자 테이블 컴포넌트
 * - 수신자 추가/삭제/편집 기능
 * - 이메일 유효성 검사
 */
export default function RecipientTable({
  recipients,
  onAdd,
  onDelete,
  onChange,
  emailErrors,
}: RecipientTableProps) {
  const newRowRef = useRef<InputRef>(null)
  const prevRecipientsLength = useRef(recipients.length)

  // 새 행 추가 시 포커스
  useEffect(() => {
    if (recipients.length > prevRecipientsLength.current) {
      const newRecipient = recipients.find((r) => r.isNew)
      if (newRecipient) {
        setTimeout(() => {
          newRowRef.current?.focus()
        }, 100)
      }
    }
    prevRecipientsLength.current = recipients.length
  }, [recipients])

  const handleNameChange = useCallback(
    (id: string, value: string) => {
      onChange(id, 'name', value)
    },
    [onChange]
  )

  const handleEmailChange = useCallback(
    (id: string, value: string) => {
      onChange(id, 'email', value)
    },
    [onChange]
  )

  const columns: ColumnsType<NotificationRecipient> = useMemo(
    () => [
      {
        title: '#',
        key: 'index',
        width: 50,
        render: (_, __, index) => index + 1,
      },
      {
        title: '이름',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: (_, record, index) => (
          <Input
            ref={record.isNew && index === recipients.length - 1 ? newRowRef : undefined}
            value={record.name}
            onChange={(e) => handleNameChange(record.id, e.target.value)}
            placeholder="이름 입력"
            data-testid={
              record.isNew && index === recipients.length - 1
                ? 'recipient-name-input'
                : `recipient-name-${record.id}`
            }
          />
        ),
      },
      {
        title: '이메일',
        dataIndex: 'email',
        key: 'email',
        render: (_, record) => (
          <div>
            <Input
              value={record.email}
              onChange={(e) => handleEmailChange(record.id, e.target.value)}
              placeholder="이메일 입력"
              status={emailErrors[record.id] ? 'error' : undefined}
              data-testid={
                record.isNew ? 'recipient-email-input' : `recipient-email-${record.id}`
              }
            />
            {emailErrors[record.id] && (
              <Text
                type="danger"
                className="text-xs mt-1 block"
                data-testid="email-error"
              >
                {emailErrors[record.id]}
              </Text>
            )}
          </div>
        ),
      },
      {
        title: '작업',
        key: 'action',
        width: 100,
        render: (_, record) => (
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
            data-testid="delete-recipient-btn"
            aria-label={`${record.name} 수신자 삭제`}
          >
            삭제
          </Button>
        ),
      },
    ],
    [recipients.length, handleNameChange, handleEmailChange, emailErrors, onDelete]
  )

  return (
    <Card
      title="알림 수신자 관리"
      data-testid="recipient-table"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
          data-testid="add-recipient-btn"
        >
          수신자 추가
        </Button>
      }
    >
      <Table<NotificationRecipient>
        columns={columns}
        dataSource={recipients}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: '등록된 수신자가 없습니다' }}
      />
    </Card>
  )
}
