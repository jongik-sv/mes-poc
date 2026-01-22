// components/common/NotificationPanel.tsx
// MES Portal 알림 패널 컴포넌트 (TSK-01-06)
'use client'

import { useMemo } from 'react'
import { Button, List, Empty, Typography, Spin, Divider } from 'antd'
import {
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons'

const { Text } = Typography

export type NotificationType = 'info' | 'warning' | 'error' | 'success'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  link?: string
  linkTitle?: string
}

interface NotificationPanelProps {
  open: boolean
  notifications: Notification[]
  loading?: boolean
  onClose: () => void
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onNavigate?: (link: string, title: string) => void
}

// 알림 유형별 아이콘
const getNotificationIcon = (type: NotificationType) => {
  const iconMap = {
    error: <ExclamationCircleOutlined data-testid="exclamation-icon" className="text-red-500" />,
    warning: <WarningOutlined data-testid="warning-icon" className="text-orange-500" />,
    success: <CheckCircleOutlined data-testid="check-icon" className="text-green-500" />,
    info: <InfoCircleOutlined data-testid="info-icon" className="text-blue-500" />,
  }
  return iconMap[type] || iconMap.info
}

// 상대 시간 계산
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay < 7) return `${diffDay}일 전`

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}

export function NotificationPanel({
  open,
  notifications,
  loading = false,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate,
}: NotificationPanelProps) {
  // 최신순 정렬 (BR-001)
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [notifications])

  // 읽지 않은 알림 개수
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification: Notification) => {
    // 읽음 처리 (BR-003)
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }

    // 화면 이동
    if (notification.link && onNavigate) {
      onNavigate(notification.link, notification.linkTitle || notification.title)
      onClose()
    }
  }

  if (!open) {
    return null
  }

  return (
    <div
      data-testid="notification-panel"
      role="dialog"
      aria-label="알림 목록"
      className="absolute right-0 top-full mt-2 w-80 rounded-lg z-50"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--color-gray-200)',
      }}
    >
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--color-gray-200)' }}
      >
        <div className="flex items-center gap-2">
          <BellOutlined className="text-lg" />
          <span className="font-semibold" style={{ color: 'var(--color-text-base)' }}>알림</span>
          {unreadCount > 0 && (
            <span
              className="px-2 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={onClose}
          data-testid="notification-close-btn"
          aria-label="알림 패널 닫기"
        />
      </div>

      {/* 콘텐츠 */}
      <div className="max-h-96 overflow-y-auto">
        <Spin spinning={loading}>
          <List
            dataSource={sortedNotifications}
            locale={{
              emptyText: (
                <Empty
                  image={<BellOutlined className="text-4xl text-gray-300" />}
                  description="새로운 알림이 없습니다"
                />
              ),
            }}
            renderItem={(notification) => (
              <div
                key={notification.id}
                data-testid={`notification-item-${notification.id}`}
                data-unread={String(!notification.isRead)}
                onClick={() => handleNotificationClick(notification)}
                className="px-4 py-3 cursor-pointer transition-colors"
                style={{
                  backgroundColor: !notification.isRead ? 'var(--color-primary-light)' : 'transparent',
                  borderBottom: '1px solid var(--color-gray-200)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = !notification.isRead ? 'var(--color-primary-light)' : 'transparent'
                }}
              >
                <div className="flex gap-3">
                  {/* 아이콘 */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* 콘텐츠 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Text
                        strong
                        className="block text-sm"
                        style={{
                          color: !notification.isRead ? 'var(--color-text-base)' : 'var(--color-text-secondary)',
                        }}
                      >
                        {!notification.isRead && (
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                          />
                        )}
                        {notification.title}
                      </Text>
                    </div>

                    <Text
                      type="secondary"
                      className="block text-xs mt-1 line-clamp-2"
                    >
                      {notification.message}
                    </Text>

                    <Text
                      type="secondary"
                      data-testid={`notification-time-${notification.id}`}
                      className="block text-xs mt-1"
                    >
                      {getRelativeTime(notification.createdAt)}
                    </Text>
                  </div>
                </div>
              </div>
            )}
          />
        </Spin>
      </div>

      {/* 푸터 */}
      {notifications.length > 0 && (
        <div
          className="px-4 py-3"
          style={{ borderTop: '1px solid var(--color-gray-200)' }}
        >
          <Button
            type="text"
            block
            size="small"
            onClick={onMarkAllAsRead}
            data-testid="mark-all-read-btn"
            aria-label="모든 알림 읽음 처리"
            disabled={unreadCount === 0}
          >
            모두 읽음 처리
          </Button>
        </div>
      )}
    </div>
  )
}
