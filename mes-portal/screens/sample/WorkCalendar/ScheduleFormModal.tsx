// screens/sample/WorkCalendar/ScheduleFormModal.tsx
// 일정 추가/수정 폼 모달 컴포넌트 (TSK-06-11)

'use client'

import React, { useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Checkbox,
  Space,
  Button,
} from 'antd'
import type { FormInstance } from 'antd/es/form'
import dayjs, { Dayjs } from 'dayjs'
import type { ScheduleFormModalProps, ScheduleFormData } from './types'

const { TextArea } = Input
const { RangePicker } = DatePicker

/**
 * 일정 추가/수정 폼 모달
 *
 * 일정 정보를 입력받아 저장합니다.
 */
export function ScheduleFormModal({
  open,
  mode,
  schedule,
  scheduleTypes,
  onClose,
  onSave,
  initialDate,
}: ScheduleFormModalProps) {
  const [form] = Form.useForm<ScheduleFormData>()

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && schedule) {
        // 수정 모드: 기존 데이터로 초기화
        const start = dayjs(schedule.start)
        const end = dayjs(schedule.end)
        form.setFieldsValue({
          title: schedule.title,
          type: schedule.type,
          dateRange: [start, end],
          startTime: start,
          endTime: end,
          description: schedule.description || '',
          assignee: schedule.assignee || '',
          allDay: schedule.allDay,
        })
      } else {
        // 추가 모드: 초기값으로 설정
        const defaultDate = initialDate || dayjs()
        form.setFieldsValue({
          title: '',
          type: 'WORK',
          dateRange: [defaultDate, defaultDate],
          startTime: dayjs().hour(9).minute(0),
          endTime: dayjs().hour(18).minute(0),
          description: '',
          assignee: '',
          allDay: false,
        })
      }
    }
  }, [open, mode, schedule, initialDate, form])

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      onSave(values)
      form.resetFields()
    } catch {
      // 유효성 검사 실패 - 폼에서 자동으로 에러 표시
    }
  }

  // 취소 핸들러
  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  // 종일 체크박스 변경 시
  const allDayValue = Form.useWatch('allDay', form)

  return (
    <Modal
      open={open}
      title={mode === 'add' ? '일정 추가' : '일정 수정'}
      onCancel={handleCancel}
      footer={
        <Space>
          <Button onClick={handleCancel} data-testid="cancel-schedule-btn">
            취소
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            data-testid="save-schedule-btn"
          >
            저장
          </Button>
        </Space>
      }
      width={520}
      centered
      destroyOnClose
      data-testid="schedule-form-modal"
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        autoComplete="off"
      >
        <Form.Item
          name="title"
          label="제목"
          rules={[
            { required: true, message: '제목을 입력해주세요' },
            { min: 2, message: '제목은 2자 이상 입력해주세요' },
            { max: 100, message: '제목은 100자 이내로 입력해주세요' },
          ]}
        >
          <Input
            placeholder="일정 제목을 입력하세요"
            data-testid="schedule-title-input"
          />
        </Form.Item>

        <Form.Item
          name="type"
          label="일정 유형"
          rules={[{ required: true, message: '일정 유형을 선택해주세요' }]}
        >
          <Select
            placeholder="유형 선택"
            data-testid="schedule-type-select"
            options={scheduleTypes.map((type) => ({
              value: type.code,
              label: (
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded"
                    style={{ backgroundColor: type.color }}
                  />
                  {type.name}
                </span>
              ),
            }))}
          />
        </Form.Item>

        <Form.Item
          name="allDay"
          valuePropName="checked"
        >
          <Checkbox data-testid="schedule-allday-checkbox">종일 일정</Checkbox>
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="날짜"
          rules={[{ required: true, message: '날짜를 선택해주세요' }]}
        >
          <RangePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            data-testid="schedule-date-range"
          />
        </Form.Item>

        {!allDayValue && (
          <Space className="w-full" size="middle">
            <Form.Item
              name="startTime"
              label="시작 시간"
              rules={[{ required: true, message: '시작 시간을 선택해주세요' }]}
              className="flex-1"
            >
              <TimePicker
                format="HH:mm"
                minuteStep={30}
                style={{ width: '100%' }}
                data-testid="schedule-start-time"
              />
            </Form.Item>

            <Form.Item
              name="endTime"
              label="종료 시간"
              rules={[
                { required: true, message: '종료 시간을 선택해주세요' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue('startTime')
                    const dateRange = getFieldValue('dateRange')
                    if (!value || !startTime || !dateRange) return Promise.resolve()

                    const [startDate, endDate] = dateRange
                    // 같은 날짜인 경우만 시간 비교
                    if (startDate && endDate && startDate.isSame(endDate, 'day')) {
                      if (value.isBefore(startTime) || value.isSame(startTime)) {
                        return Promise.reject(new Error('종료 시간은 시작 시간 이후여야 합니다'))
                      }
                    }
                    return Promise.resolve()
                  },
                }),
              ]}
              className="flex-1"
            >
              <TimePicker
                format="HH:mm"
                minuteStep={30}
                style={{ width: '100%' }}
                data-testid="schedule-end-time"
              />
            </Form.Item>
          </Space>
        )}

        <Form.Item
          name="assignee"
          label="담당자"
        >
          <Input
            placeholder="담당자를 입력하세요"
            data-testid="schedule-assignee-input"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="설명"
          rules={[
            { max: 500, message: '설명은 500자 이내로 입력해주세요' },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="설명을 입력하세요"
            data-testid="schedule-description-input"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ScheduleFormModal
