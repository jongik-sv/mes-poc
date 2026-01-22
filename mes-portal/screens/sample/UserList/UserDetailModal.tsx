// screens/sample/UserList/UserDetailModal.tsx
// 사용자 상세 정보 모달 컴포넌트 (TSK-06-07)

'use client'

import React from 'react'
import { Modal, Descriptions, Avatar, Tag, Space, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { UserDetailModalProps, UserStatus } from './types'
import { STATUS_COLORS, STATUS_LABELS } from './types'

const { Text } = Typography

/**
 * 사용자 상세 정보 모달
 *
 * UC-10: 행 클릭 시 사용자 상세 정보를 모달로 표시
 */
export function UserDetailModal({ open, user, onClose }: UserDetailModalProps) {
  if (!user) return null

  /**
   * 날짜 포맷팅
   */
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    return dayjs(dateString).format('YYYY-MM-DD HH:mm')
  }

  /**
   * 상태 태그 렌더링
   */
  const renderStatusTag = (status: UserStatus) => (
    <Tag color={STATUS_COLORS[status]} data-testid="user-detail-status">
      {STATUS_LABELS[status]}
    </Tag>
  )

  return (
    <Modal
      open={open}
      title="사용자 상세 정보"
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      data-testid="user-detail-modal"
    >
      {/* 사용자 프로필 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: 12 }} />
        <div>
          <Text strong style={{ fontSize: 18 }} data-testid="user-detail-name">
            {user.name}
          </Text>
        </div>
        <div>
          <Text type="secondary" data-testid="user-detail-email">
            {user.email}
          </Text>
        </div>
      </div>

      {/* 사용자 상세 정보 */}
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="상태">
          {renderStatusTag(user.status)}
        </Descriptions.Item>
        <Descriptions.Item label="역할" data-testid="user-detail-role">
          {user.roleLabel} ({user.role})
        </Descriptions.Item>
        <Descriptions.Item label="부서">
          {user.department || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="연락처">
          {user.phone || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="생성일">
          {formatDate(user.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="최근 로그인">
          {formatDate(user.lastLoginAt)}
        </Descriptions.Item>
      </Descriptions>

      {/* 닫기 버튼 */}
      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Space>
          <button
            onClick={onClose}
            data-testid="modal-close-btn"
            style={{
              padding: '4px 15px',
              borderRadius: 6,
              border: '1px solid #d9d9d9',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            닫기
          </button>
        </Space>
      </div>
    </Modal>
  )
}

export default UserDetailModal
