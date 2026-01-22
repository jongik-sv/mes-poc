// screens/sample/WorkCalendar/ScheduleDetailModal.tsx
// 일정 상세 정보 모달 컴포넌트 (TSK-06-11)

'use client'

import React, { useMemo } from 'react'
import { Modal, Descriptions, Tag, Space, Button, Typography } from 'antd'
import { EditOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { ScheduleDetailModalProps } from './types'

const { Text } = Typography

/**
 * 일정 상세 정보 모달
 *
 * 선택한 일정의 상세 정보를 표시하고 수정/삭제 버튼을 제공합니다.
 */
export function ScheduleDetailModal({
  open,
  schedule,
  scheduleTypes,
  onClose,
  onEdit,
  onDelete,
}: ScheduleDetailModalProps) {
  // 일정 유형 정보
  const typeInfo = useMemo(() => {
    if (!schedule) return null
    return scheduleTypes.find((t) => t.code === schedule.type)
  }, [schedule, scheduleTypes])

  // 날짜 포맷팅
  const formatDateTime = (dateString: string, allDay: boolean) => {
    const date = dayjs(dateString)
    if (allDay) {
      return date.format('YYYY-MM-DD')
    }
    return date.format('YYYY-MM-DD HH:mm')
  }

  if (!schedule) return null

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          {typeInfo && (
            <Tag
              color={typeInfo.color}
              data-testid="schedule-detail-type-tag"
            >
              {typeInfo.name}
            </Tag>
          )}
          <Text strong data-testid="schedule-detail-title">
            {schedule.title}
          </Text>
        </div>
      }
      onCancel={onClose}
      footer={
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(schedule)}
            data-testid="edit-schedule-btn"
          >
            수정
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(schedule)}
            data-testid="delete-schedule-btn"
          >
            삭제
          </Button>
          <Button
            icon={<CloseOutlined />}
            onClick={onClose}
            data-testid="close-modal-btn"
          >
            닫기
          </Button>
        </Space>
      }
      width={520}
      centered
      data-testid="schedule-detail-modal"
    >
      <Descriptions
        column={1}
        bordered
        size="small"
        className="mt-4"
      >
        <Descriptions.Item label="유형">
          {typeInfo && (
            <Tag color={typeInfo.color} data-testid="schedule-detail-type">
              {typeInfo.name}
            </Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="기간">
          <div data-testid="schedule-detail-period">
            <div>{formatDateTime(schedule.start, schedule.allDay)}</div>
            <div className="text-gray-400">~</div>
            <div>{formatDateTime(schedule.end, schedule.allDay)}</div>
            {schedule.allDay && (
              <Tag color="blue" className="ml-2">종일</Tag>
            )}
          </div>
        </Descriptions.Item>
        {schedule.assignee && (
          <Descriptions.Item label="담당자">
            <Text data-testid="schedule-detail-assignee">
              {schedule.assignee}
            </Text>
          </Descriptions.Item>
        )}
        {schedule.description && (
          <Descriptions.Item label="설명">
            <Text
              data-testid="schedule-detail-description"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {schedule.description}
            </Text>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  )
}

export default ScheduleDetailModal
