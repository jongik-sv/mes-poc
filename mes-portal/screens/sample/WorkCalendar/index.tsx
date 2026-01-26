// screens/sample/WorkCalendar/index.tsx
// 작업 일정 캘린더 메인 컴포넌트 (TSK-06-11)

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, Button, Segmented, Modal, message, Tag, Space } from 'antd'
import {
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import isoWeek from 'dayjs/plugin/isoWeek'

import { useSchedule } from './useSchedule'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { DayView } from './DayView'
import { ScheduleDetailModal } from './ScheduleDetailModal'
import { ScheduleFormModal } from './ScheduleFormModal'
import type {
  ViewMode,
  Schedule,
  ScheduleFormData,
  WorkCalendarProps,
} from './types'
import { VIEW_MODE_LABELS, SCHEDULE_TYPE_LABELS, SCHEDULE_TYPE_COLORS } from './types'

dayjs.extend(isoWeek)
dayjs.locale('ko')

/**
 * 작업 일정 캘린더 메인 컴포넌트
 *
 * 작업 일정을 월간/주간/일간 뷰로 표시하고 관리합니다.
 * - 뷰 모드 전환 (월간/주간/일간)
 * - 기간 네비게이션
 * - 일정 CRUD
 * - 일정 상세 보기
 */
export function WorkCalendar({
  defaultViewMode = 'month',
  defaultDate,
}: WorkCalendarProps) {
  // 상태
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode)
  const [currentDate, setCurrentDate] = useState<Dayjs>(
    defaultDate || dayjs('2026-01-08')
  )

  // 모달 상태
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [initialFormDate, setInitialFormDate] = useState<Dayjs | undefined>()

  // 일정 관리 훅
  const {
    schedules,
    scheduleTypes,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  } = useSchedule()

  // 현재 기간 라벨
  const currentPeriodLabel = useMemo(() => {
    switch (viewMode) {
      case 'month':
        return currentDate.format('YYYY년 M월')
      case 'week': {
        const startOfWeek = currentDate.startOf('week')
        const endOfWeek = currentDate.endOf('week')
        if (startOfWeek.month() === endOfWeek.month()) {
          return `${startOfWeek.format('YYYY년 M월')} ${startOfWeek.isoWeek()}주차`
        }
        return `${startOfWeek.format('M/D')} - ${endOfWeek.format('M/D')}`
      }
      case 'day':
        return currentDate.format('YYYY년 M월 D일 (ddd)')
      default:
        return ''
    }
  }, [viewMode, currentDate])

  // 기간 이동 핸들러
  const handleNavigate = useCallback(
    (direction: 1 | -1) => {
      setCurrentDate((prev) => {
        switch (viewMode) {
          case 'month':
            return prev.add(direction, 'month')
          case 'week':
            return prev.add(direction, 'week')
          case 'day':
            return prev.add(direction, 'day')
          default:
            return prev
        }
      })
    },
    [viewMode]
  )

  // 오늘로 이동
  const handleGoToToday = useCallback(() => {
    setCurrentDate(dayjs())
  }, [])

  // 일정 클릭 핸들러
  const handleScheduleClick = useCallback((schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setDetailModalOpen(true)
  }, [])

  // 날짜 더블클릭 핸들러 (추가 모달 열기)
  const handleDateDoubleClick = useCallback((date: Dayjs) => {
    setInitialFormDate(date)
    setSelectedSchedule(null)
    setFormMode('add')
    setFormModalOpen(true)
  }, [])

  // 일정 추가 버튼 클릭
  const handleAddClick = useCallback(() => {
    setInitialFormDate(currentDate)
    setSelectedSchedule(null)
    setFormMode('add')
    setFormModalOpen(true)
  }, [currentDate])

  // 상세 모달에서 수정 클릭
  const handleEditFromDetail = useCallback((schedule: Schedule) => {
    setDetailModalOpen(false)
    setSelectedSchedule(schedule)
    setFormMode('edit')
    setFormModalOpen(true)
  }, [])

  // 상세 모달에서 삭제 클릭
  const handleDeleteFromDetail = useCallback(
    (schedule: Schedule) => {
      Modal.confirm({
        title: '일정 삭제',
        content: `"${schedule.title}" 일정을 삭제하시겠습니까?`,
        okText: '삭제',
        okType: 'danger',
        cancelText: '취소',
        onOk: () => {
          deleteSchedule(schedule.id)
          setDetailModalOpen(false)
          setSelectedSchedule(null)
          message.success('일정이 삭제되었습니다')
        },
      })
    },
    [deleteSchedule]
  )

  // 폼 저장 핸들러
  const handleFormSave = useCallback(
    (formData: ScheduleFormData) => {
      try {
        if (formMode === 'add') {
          addSchedule(formData)
          message.success('일정이 추가되었습니다')
        } else if (formMode === 'edit' && selectedSchedule) {
          updateSchedule(selectedSchedule.id, formData)
          message.success('일정이 수정되었습니다')
        }
        setFormModalOpen(false)
        setSelectedSchedule(null)
      } catch (error) {
        message.error('저장 중 오류가 발생했습니다')
      }
    },
    [formMode, selectedSchedule, addSchedule, updateSchedule]
  )

  // 폼 모달 닫기
  const handleFormClose = useCallback(() => {
    setFormModalOpen(false)
    setSelectedSchedule(null)
  }, [])

  // 상세 모달 닫기
  const handleDetailClose = useCallback(() => {
    setDetailModalOpen(false)
    setSelectedSchedule(null)
  }, [])

  // 뷰 렌더링
  const renderView = () => {
    const commonProps = {
      currentDate,
      schedules,
      scheduleTypes,
      onScheduleClick: handleScheduleClick,
      onDateDoubleClick: handleDateDoubleClick,
    }

    switch (viewMode) {
      case 'month':
        return <MonthView {...commonProps} />
      case 'week':
        return <WeekView {...commonProps} />
      case 'day':
        return <DayView {...commonProps} />
      default:
        return null
    }
  }

  return (
    <div data-testid="work-calendar-page" className="h-full p-4">
      <Card
        title={
          <Space>
            <CalendarOutlined />
            <span>작업 일정 캘린더</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddClick}
            data-testid="add-schedule-btn"
          >
            일정 추가
          </Button>
        }
      >
        {/* 캘린더 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          {/* 네비게이션 */}
          <div className="flex items-center gap-2">
            <Button
              icon={<LeftOutlined />}
              onClick={() => handleNavigate(-1)}
              data-testid="calendar-nav-prev"
            />
            <Button onClick={handleGoToToday} data-testid="calendar-nav-today">
              오늘
            </Button>
            <Button
              icon={<RightOutlined />}
              onClick={() => handleNavigate(1)}
              data-testid="calendar-nav-next"
            />
            <span
              className="ml-4 text-lg font-medium"
              data-testid="calendar-current-period"
            >
              {currentPeriodLabel}
            </span>
          </div>

          {/* 뷰 모드 선택 */}
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            options={[
              { label: VIEW_MODE_LABELS.month, value: 'month' },
              { label: VIEW_MODE_LABELS.week, value: 'week' },
              { label: VIEW_MODE_LABELS.day, value: 'day' },
            ]}
            data-testid="calendar-view-toggle"
          />
        </div>

        {/* 캘린더 뷰 */}
        <div data-testid="calendar-container">{renderView()}</div>

        {/* 범례 */}
        <div
          data-testid="schedule-legend"
          className="mt-4 flex items-center gap-4 border-t border-border pt-4"
        >
          <span className="text-sm text-text-muted">일정 유형:</span>
          {Object.entries(SCHEDULE_TYPE_LABELS).map(([code, label]) => (
            <Tag
              key={code}
              color={SCHEDULE_TYPE_COLORS[code as keyof typeof SCHEDULE_TYPE_COLORS]}
            >
              {label}
            </Tag>
          ))}
        </div>
      </Card>

      {/* 일정 상세 모달 */}
      <ScheduleDetailModal
        open={detailModalOpen}
        schedule={selectedSchedule}
        scheduleTypes={scheduleTypes}
        onClose={handleDetailClose}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />

      {/* 일정 추가/수정 모달 */}
      <ScheduleFormModal
        open={formModalOpen}
        mode={formMode}
        schedule={selectedSchedule}
        scheduleTypes={scheduleTypes}
        onClose={handleFormClose}
        onSave={handleFormSave}
        initialDate={initialFormDate}
      />
    </div>
  )
}

export default WorkCalendar
