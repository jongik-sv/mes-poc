// screens/sample/WorkCalendar/MonthView.tsx
// 월간 뷰 컴포넌트 (TSK-06-11)

'use client'

import React, { useMemo, useCallback } from 'react'
import { Badge, Tooltip } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import type { Schedule, ScheduleType } from './types'

interface MonthViewProps {
  currentDate: Dayjs
  schedules: Schedule[]
  scheduleTypes: ScheduleType[]
  onScheduleClick: (schedule: Schedule) => void
  onDateDoubleClick: (date: Dayjs) => void
}

// 상수
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const MAX_DISPLAY_SCHEDULES = 3

/**
 * 월간 뷰 컴포넌트
 *
 * 한 달의 일정을 그리드 형태로 표시합니다.
 */
export function MonthView({
  currentDate,
  schedules,
  scheduleTypes,
  onScheduleClick,
  onDateDoubleClick,
}: MonthViewProps) {
  // 해당 월의 일자 배열 생성
  const calendarDays = useMemo(() => {
    const startOfMonth = currentDate.startOf('month')
    const endOfMonth = currentDate.endOf('month')

    // 첫 번째 주의 시작일 (일요일)
    const startDay = startOfMonth.startOf('week')
    // 마지막 주의 종료일 (토요일)
    const endDay = endOfMonth.endOf('week')

    const days: Dayjs[] = []
    let day = startDay

    while (day.isBefore(endDay) || day.isSame(endDay, 'day')) {
      days.push(day)
      day = day.add(1, 'day')
    }

    return days
  }, [currentDate])

  // 특정 날짜의 일정 조회
  const getSchedulesForDate = useCallback(
    (date: Dayjs): Schedule[] => {
      return schedules.filter((schedule) => {
        const start = dayjs(schedule.start).startOf('day')
        const end = dayjs(schedule.end).startOf('day')
        const targetDate = date.startOf('day')

        return (
          targetDate.isSame(start, 'day') ||
          targetDate.isSame(end, 'day') ||
          (targetDate.isAfter(start) && targetDate.isBefore(end))
        )
      })
    },
    [schedules]
  )

  // 일정 유형 정보 조회
  const getTypeInfo = useCallback(
    (typeCode: string): ScheduleType | undefined => {
      return scheduleTypes.find((t) => t.code === typeCode)
    },
    [scheduleTypes]
  )

  // 날짜 셀 렌더링
  const renderDateCell = useCallback(
    (date: Dayjs) => {
      const daySchedules = getSchedulesForDate(date)
      const isCurrentMonth = date.month() === currentDate.month()
      const isToday = date.isSame(dayjs(), 'day')
      const isWeekend = date.day() === 0 || date.day() === 6

      return (
        <div
          key={date.format('YYYY-MM-DD')}
          className={`
            min-h-[100px] border-b border-r border-border-light p-1
            ${!isCurrentMonth ? 'bg-surface-elevated' : 'bg-surface'}
            hover:bg-primary/10 cursor-pointer transition-colors
          `}
          onDoubleClick={() => onDateDoubleClick(date)}
          data-testid={`calendar-cell-${date.format('YYYY-MM-DD')}`}
        >
          {/* 날짜 */}
          <div
            className={`
              mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm
              ${isToday ? 'bg-primary text-white font-semibold' : ''}
              ${!isCurrentMonth ? 'text-text-dim' : isWeekend ? 'text-red-500' : 'text-text'}
            `}
          >
            {date.date()}
          </div>

          {/* 일정 목록 */}
          <div className="space-y-0.5">
            {daySchedules.slice(0, MAX_DISPLAY_SCHEDULES).map((schedule) => {
              const typeInfo = getTypeInfo(schedule.type)
              return (
                <Tooltip
                  key={schedule.id}
                  title={
                    <div>
                      <div className="font-semibold">{schedule.title}</div>
                      {!schedule.allDay && (
                        <div className="text-xs">
                          {dayjs(schedule.start).format('HH:mm')} -{' '}
                          {dayjs(schedule.end).format('HH:mm')}
                        </div>
                      )}
                    </div>
                  }
                  placement="top"
                >
                  <div
                    className="cursor-pointer truncate rounded px-1 py-0.5 text-xs text-white transition-opacity hover:opacity-80"
                    style={{ backgroundColor: typeInfo?.color || '#999' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onScheduleClick(schedule)
                    }}
                    data-testid={`schedule-event-${schedule.id}`}
                  >
                    {schedule.title}
                  </div>
                </Tooltip>
              )
            })}
            {daySchedules.length > MAX_DISPLAY_SCHEDULES && (
              <div className="text-xs text-text-muted px-1">
                +{daySchedules.length - MAX_DISPLAY_SCHEDULES}개 더보기
              </div>
            )}
          </div>
        </div>
      )
    },
    [currentDate, getSchedulesForDate, getTypeInfo, onScheduleClick, onDateDoubleClick]
  )

  return (
    <div data-testid="calendar-month-view" className="border-l border-t border-border-light">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-border bg-surface-elevated">
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={label}
            className={`
              py-2 text-center text-sm font-medium
              ${index === 0 || index === 6 ? 'text-red-500' : 'text-text-muted'}
            `}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => renderDateCell(day))}
      </div>
    </div>
  )
}

export default MonthView
