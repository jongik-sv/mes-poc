// screens/sample/WorkCalendar/DayView.tsx
// 일간 뷰 컴포넌트 (TSK-06-11)

'use client'

import React, { useMemo, useCallback } from 'react'
import { Tooltip } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import type { Schedule, ScheduleType } from './types'

interface DayViewProps {
  currentDate: Dayjs
  schedules: Schedule[]
  scheduleTypes: ScheduleType[]
  onScheduleClick: (schedule: Schedule) => void
  onDateDoubleClick: (date: Dayjs) => void
}

// 상수
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 08:00 ~ 19:00
const HOUR_HEIGHT = 60 // 각 시간대의 높이

/**
 * 일간 뷰 컴포넌트
 *
 * 하루의 일정을 시간대별로 상세하게 표시합니다.
 */
export function DayView({
  currentDate,
  schedules,
  scheduleTypes,
  onScheduleClick,
  onDateDoubleClick,
}: DayViewProps) {
  const isToday = currentDate.isSame(dayjs(), 'day')
  const currentHour = dayjs().hour()
  const currentMinute = dayjs().minute()

  // 해당 일의 일정 필터링
  const daySchedules = useMemo(() => {
    const dayStart = currentDate.startOf('day')
    const dayEnd = currentDate.endOf('day')

    return schedules.filter((schedule) => {
      const start = dayjs(schedule.start)
      const end = dayjs(schedule.end)

      return (
        (start.isBefore(dayEnd) || start.isSame(dayEnd)) &&
        (end.isAfter(dayStart) || end.isSame(dayStart))
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

  // 일정 블록 위치 및 크기 계산
  const calculateBlockStyle = useCallback(
    (schedule: Schedule) => {
      const dayStart = currentDate.startOf('day').hour(8) // 08:00 시작
      const dayEnd = currentDate.startOf('day').hour(20) // 20:00 종료

      let scheduleStart = dayjs(schedule.start)
      let scheduleEnd = dayjs(schedule.end)

      // 종일 일정
      if (schedule.allDay) {
        return {
          top: 0,
          height: HOURS.length * HOUR_HEIGHT - 4,
          isAllDay: true,
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
      const height = Math.max((duration / 60) * HOUR_HEIGHT - 2, 30)

      return { top, height, isAllDay: false }
    },
    [currentDate]
  )

  // 현재 시간선 위치 계산
  const currentTimePosition = useMemo(() => {
    if (!isToday || currentHour < 8 || currentHour > 19) return null
    const minutes = (currentHour - 8) * 60 + currentMinute
    return (minutes / 60) * HOUR_HEIGHT
  }, [isToday, currentHour, currentMinute])

  return (
    <div
      data-testid="calendar-day-view"
      className="flex overflow-auto border border-border-light"
      style={{ maxHeight: 'calc(100vh - 300px)' }}
    >
      {/* 시간 컬럼 */}
      <div className="sticky left-0 z-10 w-16 flex-shrink-0 border-r border-border bg-surface-elevated">
        {/* 헤더 공간 */}
        <div className="h-10 border-b border-border flex items-center justify-center text-xs text-text-muted">
          시간
        </div>
        {/* 시간 라벨 */}
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="relative border-b border-border-light text-right pr-2 text-sm text-text-muted"
            style={{ height: HOUR_HEIGHT }}
          >
            <span className="absolute -top-2 right-2">
              {String(hour).padStart(2, '0')}:00
            </span>
          </div>
        ))}
      </div>

      {/* 일정 영역 */}
      <div className="flex-1 relative">
        {/* 날짜 헤더 */}
        <div
          className={`
            sticky top-0 z-10 flex items-center justify-center gap-2 border-b border-border py-2
            ${isToday ? 'bg-primary/10' : 'bg-surface-elevated'}
          `}
          style={{ height: 40 }}
        >
          <span className="text-sm text-text-muted">
            {currentDate.format('YYYY년 M월 D일')}
          </span>
          <span
            className={`
              text-sm font-medium
              ${currentDate.day() === 0 || currentDate.day() === 6 ? 'text-red-500' : 'text-text-muted'}
            `}
          >
            ({['일', '월', '화', '수', '목', '금', '토'][currentDate.day()]})
          </span>
          {isToday && (
            <span className="rounded bg-primary px-2 py-0.5 text-xs text-white">
              오늘
            </span>
          )}
        </div>

        {/* 시간대 그리드 */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="relative border-b border-border-light hover:bg-primary/10 cursor-pointer"
              style={{ height: HOUR_HEIGHT }}
              onDoubleClick={() => onDateDoubleClick(currentDate.hour(hour))}
            >
              {/* 30분 구분선 */}
              <div
                className="absolute left-0 right-0 border-b border-border-light border-dashed"
                style={{ top: HOUR_HEIGHT / 2 }}
              />
            </div>
          ))}

          {/* 현재 시간선 */}
          {currentTimePosition !== null && (
            <div
              className="absolute left-0 right-0 z-20 flex items-center"
              style={{ top: currentTimePosition }}
            >
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="flex-1 border-t-2 border-red-500" />
              <span className="ml-2 rounded bg-red-500 px-1 text-xs text-white">
                {dayjs().format('HH:mm')}
              </span>
            </div>
          )}

          {/* 일정 블록 */}
          {daySchedules.map((schedule) => {
            const typeInfo = getTypeInfo(schedule.type)
            const style = calculateBlockStyle(schedule)

            return (
              <Tooltip
                key={schedule.id}
                title={
                  <div className="p-2">
                    <div className="font-semibold text-base">{schedule.title}</div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="opacity-65">유형:</span>
                        <span>{typeInfo?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="opacity-65">시간:</span>
                        <span>
                          {schedule.allDay
                            ? '종일'
                            : `${dayjs(schedule.start).format('HH:mm')} - ${dayjs(schedule.end).format('HH:mm')}`}
                        </span>
                      </div>
                      {schedule.assignee && (
                        <div className="flex items-center gap-2">
                          <span className="opacity-65">담당:</span>
                          <span>{schedule.assignee}</span>
                        </div>
                      )}
                      {schedule.description && (
                        <div className="mt-2 pt-2 border-t border-white/30">
                          <span className="opacity-65">설명:</span>
                          <div className="mt-1">{schedule.description}</div>
                        </div>
                      )}
                    </div>
                  </div>
                }
                placement="right"
              >
                <div
                  className="absolute left-2 right-2 cursor-pointer overflow-hidden rounded-lg px-3 py-2 text-white transition-opacity hover:opacity-90 shadow-md"
                  style={{
                    top: style.top,
                    height: style.height,
                    backgroundColor: typeInfo?.color || '#999',
                  }}
                  onClick={() => onScheduleClick(schedule)}
                  data-testid={`schedule-event-${schedule.id}`}
                >
                  {/* 왼쪽 색상 바 */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                    style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  />

                  <div className="pl-2">
                    <div className="font-semibold truncate">{schedule.title}</div>
                    {style.height > 50 && (
                      <>
                        {!schedule.allDay && (
                          <div className="text-sm opacity-90 mt-1">
                            {dayjs(schedule.start).format('HH:mm')} -{' '}
                            {dayjs(schedule.end).format('HH:mm')}
                          </div>
                        )}
                        {schedule.allDay && (
                          <div className="text-sm opacity-90 mt-1">종일</div>
                        )}
                      </>
                    )}
                    {style.height > 80 && schedule.assignee && (
                      <div className="text-sm opacity-80 mt-1">
                        담당: {schedule.assignee}
                      </div>
                    )}
                    {style.height > 120 && schedule.description && (
                      <div className="text-xs opacity-70 mt-2 line-clamp-2">
                        {schedule.description}
                      </div>
                    )}
                  </div>
                </div>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DayView
