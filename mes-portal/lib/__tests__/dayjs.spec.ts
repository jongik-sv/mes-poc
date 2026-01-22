import { describe, it, expect } from 'vitest'
import dayjs from '@/lib/dayjs'

describe('dayjs locale', () => {
  it('should be set to Korean', () => {
    expect(dayjs().locale()).toBe('ko')
  })

  it('should display weekdays in Korean', () => {
    const weekdays = dayjs.weekdays()
    expect(weekdays).toEqual([
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ])
  })

  it('should display short weekdays in Korean', () => {
    const weekdaysShort = dayjs.weekdaysShort()
    expect(weekdaysShort).toEqual(['일', '월', '화', '수', '목', '금', '토'])
  })

  it('should display months in Korean', () => {
    const months = dayjs.months()
    expect(months).toEqual([
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ])
  })

  it('should format date in YYYY-MM-DD', () => {
    const date = dayjs('2026-01-20')
    expect(date.format('YYYY-MM-DD')).toBe('2026-01-20')
  })

  it('should parse custom format correctly', () => {
    const date = dayjs('20-01-2026', 'DD-MM-YYYY')
    expect(date.format('YYYY-MM-DD')).toBe('2026-01-20')
  })

  it('should support isSameOrBefore plugin', () => {
    const date1 = dayjs('2026-01-15')
    const date2 = dayjs('2026-01-20')
    expect(date1.isSameOrBefore(date2)).toBe(true)
    expect(date2.isSameOrBefore(date2)).toBe(true)
    expect(date2.isSameOrBefore(date1)).toBe(false)
  })

  it('should support isSameOrAfter plugin', () => {
    const date1 = dayjs('2026-01-15')
    const date2 = dayjs('2026-01-20')
    expect(date2.isSameOrAfter(date1)).toBe(true)
    expect(date2.isSameOrAfter(date2)).toBe(true)
    expect(date1.isSameOrAfter(date2)).toBe(false)
  })
})
