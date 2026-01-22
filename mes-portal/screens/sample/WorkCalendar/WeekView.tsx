// screens/sample/WorkCalendar/WeekView.tsx
// 주간 뷰 컴포넌트 (TSK-06-11)

'use client'

import React, { useMemo, useCallback } from 'react'
import { Tooltip } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import type { Schedule, ScheduleType } from './types'

interface WeekViewProps {
  currentDate: Dayjs
  schedules: Schedule[]
  scheduleTypes: ScheduleType[]
  onScheduleClick: (schedule: Schedule) => void
  onDateDoubleClick: (date: Dayjs) => void
}

// 상수
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 08:00 ~ 19:00
const HOUR_HEIGHT = 48 // 각 시간대의 높이

/**
 * 주간 뷰 컴포넌트
 *
 * 일주일의 일정을 시간대별로 표시합니다.
 */
export function WeekView({
  currentDate,
  schedules,
  scheduleTypes,
  onScheduleClick,
  onDateDoubleClick,
}: WeekViewProps) {
  // 해당 주의 일자 배열 생성
  const weekDays = useMemo(() => {
    const startOfWeek = currentDate.startOf('week')
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'))
  }, [currentDate])

  // 해당 주의 일정 필터링
  const weekSchedules = useMemo(() => {
    const startOfWeek = currentDate.startOf('week')
    const endOfWeek = currentDate.endOf('week')

    return schedules.filter((schedule) => {
      const start = dayjs(schedule.start)
      const end = dayjs(schedule.end)

      return (
        (start.isBefore(endOfWeek) || start.isSame(endOfWeek)) &&
        (end.isAfter(startOfWeek) || end.isSame(startOfWeek))
      )
    })
  }, [currentDate, schedules])

  // 일정 유형 정보 조회
  const getTypeInfo = useCallback(
    (typeCode: string): ScheduleType | undefined => {
      return scheduleTypes.find((t) => t.code === typeCode)
    },
    [scheduleTypes]
  )

  // 특정 날짜의 일정 필터링 및 위치 계산
  const getSchedulesForDay = useCallback(
    (date: Dayjs) => {
      return weekSchedules.filter((schedule) => {
        const start = dayjs(schedule.start)
        const end = dayjs(schedule.end)
        const dayStart = date.startOf('day')
        const dayEnd = date.endOf('day')

        return (
          (start.isBefore(dayEnd) || start.isSame(dayEnd)) &&
          (end.isAfter(dayStart) || end.isSame(dayStart))
        )
      })
    },
    [weekSchedules]
  )

  // 일정 블록 위치 및 크기 계산
  const calculateBlockStyle = useCallback(
    (schedule: Schedule, date: Dayjs) => {
      const dayStart = date.startOf('day').hour(8) // 08:00 시작
      const dayEnd = date.startOf('day').hour(20) // 20:00 종료

      let scheduleStart = dayjs(schedule.start)
      let scheduleEnd = dayjs(schedule.end)

      // 종일 일정
      if (schedule.allDay) {
        return {
          top: 0,
          height: HOURS.length * HOUR_HEIGHT - 4,
        }
      }

      // 시작/종료 시간을 해당 날짜 범위 내로 조정
      if (scheduleStart.isBefore(dayStart)) {
        scheduleStart = dayStart
      }
      if (scheduleEnd.isAfter(dayEnd)) {
        scheduleEnd = dayEnd
      }

      const startMinutes = scheduleStart.hour() * 60 + scheduleStart.minute() - 8 * 60
      const endMinutes = scheduleEnd.hour() * 60 + scheduleEnd.minute() - 8 * 60
      const duration = endMinutes - startMinutes

      const top = (startMinutes / 60) * HOUR_HEIGHT
      const height = Math.max((duration / 60) * HOUR_HEIGHT - 2, 24)

      return { top, height }
    },
    []
  )

  // 시간 셀 렌더링
  const renderTimeColumn = () => (
    <div className="sticky left-0 z-10 w-16 flex-shrink-0 border-r border-gray-200 bg-gray-50">
      {/* 헤더 공간 */}
      <div className="h-14 border-b border-gray-200" />
      {/* 시간 라벨 */}
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="relative border-b border-gray-100 text-right pr-2 text-xs text-gray-500"
          style={{ height: HOUR_HEIGHT }}
        >
          <span className="absolute -top-2 right-2">
            {String(hour).padStart(2, '0')}:00
          </span>
        </div>
      ))}
    </div>
  )

  // 요일 컬럼 렌더링
  const renderDayColumn = (date: Dayjs, index: number) => {
    const isToday = date.isSame(dayjs(), 'day')
    const isWeekend = index === 0 || index === 6
    const daySchedules = getSchedulesForDay(date)

    return (
      <div
        key={date.format('YYYY-MM-DD')}
        className="relative flex-1 min-w-[120px] border-r border-gray-100"
      >
        {/* 요일 헤더 */}
        <div
          className={`
            sticky top-0 z-10 flex flex-col items-center justify-center border-b border-gray-200 py-1
            ${isToday ? 'bg-blue-50' : 'bg-gray-50'}
          `}
          style={{ height: 56 }}
        >
          <div
            className={`text-xs ${isWeekend ? 'text-red-500' : 'text-gray-500'}`}
          >
            {WEEKDAY_LABELS[index]}
          </div>
          <div
            className={`
              flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold
              ${isToday ? 'bg-blue-500 text-white' : isWeekend ? 'text-red-500' : 'text-gray-700'}
            `}
          >
            {date.date()}
          </div>
        </div>

        {/* 시간대 그리드 */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer"
              style={{ height: HOUR_HEIGHT }}
              onDoubleClick={() => onDateDoubleClick(date.hour(hour))}
            />
          ))}

          {/* 일정 블록 */}
          {daySchedules.map((schedule) => {
            const typeInfo = getTypeInfo(schedule.type)
            const style = calculateBlockStyle(schedule, date)

            return (
              <Tooltip
                key={schedule.id}
                title={
                  <div className="p-1">
                    <div className="font-semibold">{schedule.title}</div>
                    {!schedule.allDay && (
                      <div className="text-xs">
                        {dayjs(schedule.start).format('HH:mm')} -{' '}
                        {dayjs(schedule.end).format('HH:mm')}
                      </div>
                    )}
                    {schedule.assignee && (
                      <div className="text-xs mt-1">담당: {schedule.assignee}</div>
                    )}
                  </div>
                }
                placement="right"
              >
                <div
                  className="absolute left-1 right-1 cursor-pointer overflow-hidden rounded px-1 py-0.5 text-xs text-white transition-opacity hover:opacity-80"
                  style={{
                    top: style.top,
                    height: style.height,
                    backgroundColor: typeInfo?.color || '#999',
                    opacity: 0.9,
                  }}
                  onClick={() => onScheduleClick(schedule)}
                  data-testid={`schedule-event-${schedule.id}`}
                >
                  <div className="font-medium truncate">{schedule.title}</div>
                  {style.height > 36 && !schedule.allDay && (
                    <div className="opacity-80">
                      {dayjs(schedule.start).format('HH:mm')}
                    </div>
                  )}
                </div>
              </Tooltip>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      data-testid="calendar-week-view"
      className="flex overflow-auto border-l border-t border-gray-100"
      style={{ maxHeight: 'calc(100vh - 300px)' }}
    >
      {/* 시간 컬럼 */}
      {renderTimeColumn()}

      {/* 요일 컬럼들 */}
      {weekDays.map((day, index) => renderDayColumn(day, index))}
    </div>
  )
}

export default WeekView
