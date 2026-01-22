// components/dashboard/charts/__tests__/utils.test.ts
// 차트 유틸리티 함수 단위 테스트 (026-test-specification.md 기준)

import { describe, it, expect } from 'vitest'
import {
  transformLinePerformance,
  groupSmallItems,
  formatNumber,
  calculateAchievementRate,
  limitDataPoints,
  MAX_DATA_POINTS,
} from '../utils'

describe('transformLinePerformance (UT-004)', () => {
  it('transforms to chart data format', () => {
    const input = [{ line: '1라인', actual: 3200, target: 3500 }]
    const result = transformLinePerformance(input)

    expect(result).toEqual([
      { line: '1라인', type: 'actual', value: 3200 },
      { line: '1라인', type: 'target', value: 3500 },
    ])
  })

  it('transforms multiple lines', () => {
    const input = [
      { line: '1라인', actual: 3200, target: 3500 },
      { line: '2라인', actual: 2800, target: 3000 },
    ]
    const result = transformLinePerformance(input)

    expect(result).toHaveLength(4)
    expect(result[0]).toEqual({ line: '1라인', type: 'actual', value: 3200 })
    expect(result[1]).toEqual({ line: '1라인', type: 'target', value: 3500 })
    expect(result[2]).toEqual({ line: '2라인', type: 'actual', value: 2800 })
    expect(result[3]).toEqual({ line: '2라인', type: 'target', value: 3000 })
  })

  it('returns empty array for empty input', () => {
    const result = transformLinePerformance([])
    expect(result).toEqual([])
  })
})

describe('groupSmallItems (UT-011)', () => {
  const mockData = [
    { product: 'A', value: 100, percentage: 30 },
    { product: 'B', value: 80, percentage: 24 },
    { product: 'C', value: 60, percentage: 18 },
    { product: 'D', value: 40, percentage: 12 },
    { product: 'E', value: 30, percentage: 9 },
    { product: 'F', value: 23, percentage: 7 },
  ]

  it('groups items exceeding limit into "기타"', () => {
    const result = groupSmallItems(mockData, 5)

    expect(result).toHaveLength(5)
    expect(result[4].product).toBe('기타')
    expect(result[4].value).toBe(53) // 30 + 23
  })

  it('returns original if within limit', () => {
    const shortData = mockData.slice(0, 4)
    const result = groupSmallItems(shortData, 5)

    expect(result).toHaveLength(4)
    expect(result).toEqual(shortData)
  })

  it('returns original if exactly at limit', () => {
    const exactData = mockData.slice(0, 5)
    const result = groupSmallItems(exactData, 5)

    expect(result).toHaveLength(5)
    expect(result).toEqual(exactData)
  })

  it('sorts by value descending before grouping', () => {
    const unsortedData = [
      { product: 'C', value: 30, percentage: 10 },
      { product: 'A', value: 100, percentage: 50 },
      { product: 'B', value: 50, percentage: 25 },
      { product: 'D', value: 10, percentage: 5 },
      { product: 'E', value: 10, percentage: 5 },
      { product: 'F', value: 10, percentage: 5 },
    ]
    const result = groupSmallItems(unsortedData, 4)

    expect(result[0].product).toBe('A')
    expect(result[1].product).toBe('B')
    expect(result[2].product).toBe('C')
    expect(result[3].product).toBe('기타')
  })

  it('calculates percentage correctly for "기타"', () => {
    const data = [
      { product: 'A', value: 50, percentage: 50 },
      { product: 'B', value: 30, percentage: 30 },
      { product: 'C', value: 10, percentage: 10 },
      { product: 'D', value: 10, percentage: 10 },
    ]
    const result = groupSmallItems(data, 3)

    // A=50, B=30 유지, C+D=20 기타
    // 20/100 * 100 = 20%
    expect(result[2].product).toBe('기타')
    expect(result[2].percentage).toBe(20)
  })
})

describe('formatNumber (UT-012)', () => {
  it('adds thousand separators', () => {
    expect(formatNumber(1234)).toBe('1,234')
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('handles zero and small numbers', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(123)).toBe('123')
  })

  it('handles negative numbers', () => {
    expect(formatNumber(-1234)).toBe('-1,234')
  })

  it('handles decimal numbers', () => {
    const result = formatNumber(1234.56)
    // toLocaleString may vary, just check it contains comma
    expect(result).toContain('1,234')
  })
})

describe('calculateAchievementRate', () => {
  it('calculates rate correctly', () => {
    expect(calculateAchievementRate(3200, 3500)).toBe('91.4')
    expect(calculateAchievementRate(2800, 3000)).toBe('93.3')
    expect(calculateAchievementRate(3000, 3000)).toBe('100.0')
  })

  it('handles exceeding target', () => {
    expect(calculateAchievementRate(3500, 3000)).toBe('116.7')
  })

  it('handles zero target', () => {
    expect(calculateAchievementRate(100, 0)).toBe('0.0')
  })

  it('handles zero actual', () => {
    expect(calculateAchievementRate(0, 3000)).toBe('0.0')
  })
})

describe('limitDataPoints', () => {
  it('returns original if within limit', () => {
    const data = [1, 2, 3, 4, 5]
    const result = limitDataPoints(data, 10)
    expect(result).toEqual(data)
  })

  it('limits to maxPoints (keeps latest)', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = limitDataPoints(data, 5)
    expect(result).toEqual([6, 7, 8, 9, 10])
  })

  it('handles exactly at limit', () => {
    const data = [1, 2, 3, 4, 5]
    const result = limitDataPoints(data, 5)
    expect(result).toEqual(data)
  })

  it('works with object arrays', () => {
    const data = [
      { time: '08:00', value: 100 },
      { time: '09:00', value: 200 },
      { time: '10:00', value: 300 },
    ]
    const result = limitDataPoints(data, 2)
    expect(result).toEqual([
      { time: '09:00', value: 200 },
      { time: '10:00', value: 300 },
    ])
  })
})

describe('MAX_DATA_POINTS constants', () => {
  it('has correct default values', () => {
    expect(MAX_DATA_POINTS.LINE_CHART).toBe(100)
    expect(MAX_DATA_POINTS.BAR_CHART).toBe(20)
    expect(MAX_DATA_POINTS.PIE_CHART).toBe(10)
  })
})
