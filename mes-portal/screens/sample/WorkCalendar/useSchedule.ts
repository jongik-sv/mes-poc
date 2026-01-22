// screens/sample/WorkCalendar/useSchedule.ts
// 일정 관리 커스텀 훅 (TSK-06-11)

import { useState, useCallback, useMemo } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import mockData from '@/mock-data/schedule.json'
import type { Schedule, ScheduleType, ScheduleMockData, ScheduleFormData } from './types'

/**
 * 일정 관리 커스텀 훅
 *
 * Mock 데이터 기반의 일정 CRUD 기능을 제공합니다.
 */
export function useSchedule() {
  const data = mockData as ScheduleMockData

  // 일정 목록 상태
  const [schedules, setSchedules] = useState<Schedule[]>(data.schedules)

  // 일정 유형 목록
  const scheduleTypes: ScheduleType[] = data.scheduleTypes

  /**
   * 특정 날짜의 일정 조회
   */
  const getSchedulesByDate = useCallback(
    (date: Dayjs): Schedule[] => {
      return schedules.filter((schedule) => {
        const start = dayjs(schedule.start)
        const end = dayjs(schedule.end)
        const targetDate = date.startOf('day')

        // 종일 일정 또는 해당 날짜에 걸쳐 있는 일정
        if (schedule.allDay) {
          return (
            targetDate.isSame(start, 'day') ||
            targetDate.isSame(end, 'day') ||
            (targetDate.isAfter(start, 'day') && targetDate.isBefore(end, 'day'))
          )
        }

        // 시간 지정 일정
        return (
          targetDate.isSame(start, 'day') ||
          targetDate.isSame(end, 'day') ||
          (targetDate.isAfter(start, 'day') && targetDate.isBefore(end, 'day'))
        )
      })
    },
    [schedules]
  )

  /**
   * 특정 주의 일정 조회
   */
  const getSchedulesByWeek = useCallback(
    (startOfWeek: Dayjs): Schedule[] => {
      const endOfWeek = startOfWeek.add(6, 'day').endOf('day')

      return schedules.filter((schedule) => {
        const scheduleStart = dayjs(schedule.start)
        const scheduleEnd = dayjs(schedule.end)

        // 주 범위와 일정 범위가 겹치는 경우
        return (
          (scheduleStart.isBefore(endOfWeek) || scheduleStart.isSame(endOfWeek)) &&
          (scheduleEnd.isAfter(startOfWeek) || scheduleEnd.isSame(startOfWeek))
        )
      })
    },
    [schedules]
  )

  /**
   * 특정 월의 일정 조회
   */
  const getSchedulesByMonth = useCallback(
    (date: Dayjs): Schedule[] => {
      const startOfMonth = date.startOf('month')
      const endOfMonth = date.endOf('month')

      return schedules.filter((schedule) => {
        const scheduleStart = dayjs(schedule.start)
        const scheduleEnd = dayjs(schedule.end)

        // 월 범위와 일정 범위가 겹치는 경우
        return (
          (scheduleStart.isBefore(endOfMonth) || scheduleStart.isSame(endOfMonth, 'day')) &&
          (scheduleEnd.isAfter(startOfMonth) || scheduleEnd.isSame(startOfMonth, 'day'))
        )
      })
    },
    [schedules]
  )

  /**
   * 일정 추가
   */
  const addSchedule = useCallback((formData: ScheduleFormData): Schedule => {
    if (!formData.dateRange) {
      throw new Error('날짜 범위가 필요합니다.')
    }

    const [startDate, endDate] = formData.dateRange

    let start: string
    let end: string

    if (formData.allDay) {
      start = startDate.startOf('day').toISOString()
      end = endDate.endOf('day').toISOString()
    } else {
      start = startDate
        .hour(formData.startTime?.hour() ?? 9)
        .minute(formData.startTime?.minute() ?? 0)
        .second(0)
        .toISOString()
      end = endDate
        .hour(formData.endTime?.hour() ?? 18)
        .minute(formData.endTime?.minute() ?? 0)
        .second(0)
        .toISOString()
    }

    const newSchedule: Schedule = {
      id: `SCH-${String(Date.now()).slice(-6)}`,
      title: formData.title,
      type: formData.type,
      start,
      end,
      description: formData.description,
      assignee: formData.assignee,
      allDay: formData.allDay,
    }

    setSchedules((prev) => [...prev, newSchedule])
    return newSchedule
  }, [])

  /**
   * 일정 수정
   */
  const updateSchedule = useCallback(
    (id: string, formData: ScheduleFormData): Schedule | null => {
      if (!formData.dateRange) {
        throw new Error('날짜 범위가 필요합니다.')
      }

      const [startDate, endDate] = formData.dateRange

      let start: string
      let end: string

      if (formData.allDay) {
        start = startDate.startOf('day').toISOString()
        end = endDate.endOf('day').toISOString()
      } else {
        start = startDate
          .hour(formData.startTime?.hour() ?? 9)
          .minute(formData.startTime?.minute() ?? 0)
          .second(0)
          .toISOString()
        end = endDate
          .hour(formData.endTime?.hour() ?? 18)
          .minute(formData.endTime?.minute() ?? 0)
          .second(0)
          .toISOString()
      }

      let updatedSchedule: Schedule | null = null

      setSchedules((prev) =>
        prev.map((schedule) => {
          if (schedule.id === id) {
            updatedSchedule = {
              ...schedule,
              title: formData.title,
              type: formData.type,
              start,
              end,
              description: formData.description,
              assignee: formData.assignee,
              allDay: formData.allDay,
            }
            return updatedSchedule
          }
          return schedule
        })
      )

      return updatedSchedule
    },
    []
  )

  /**
   * 일정 삭제
   */
  const deleteSchedule = useCallback((id: string): boolean => {
    let deleted = false
    setSchedules((prev) => {
      const filtered = prev.filter((schedule) => schedule.id !== id)
      deleted = filtered.length < prev.length
      return filtered
    })
    return deleted
  }, [])

  /**
   * 일정 조회 (ID로)
   */
  const getScheduleById = useCallback(
    (id: string): Schedule | undefined => {
      return schedules.find((schedule) => schedule.id === id)
    },
    [schedules]
  )

  /**
   * 일정 유형 정보 조회
   */
  const getScheduleType = useCallback(
    (code: string): ScheduleType | undefined => {
      return scheduleTypes.find((type) => type.code === code)
    },
    [scheduleTypes]
  )

  return {
    schedules,
    scheduleTypes,
    getSchedulesByDate,
    getSchedulesByWeek,
    getSchedulesByMonth,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getScheduleById,
    getScheduleType,
  }
}

export default useSchedule
