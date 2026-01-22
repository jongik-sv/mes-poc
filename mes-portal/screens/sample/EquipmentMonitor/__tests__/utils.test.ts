// screens/sample/EquipmentMonitor/__tests__/utils.test.ts
// 유틸리티 함수 단위 테스트 (TSK-06-10)

import { describe, it, expect } from 'vitest'
import {
  getStatusColor,
  getStatusText,
  filterEquipment,
  countByStatus,
  calculateAchievementRate,
  formatDate,
  formatDateTime,
  formatTime,
  formatNumber,
  simulateStatusChange,
} from '../utils'
import type { Equipment, EquipmentStatus } from '../types'

// 테스트용 설비 데이터 생성 헬퍼
function createMockEquipment(overrides: Partial<Equipment> = {}): Equipment {
  return {
    id: 'eq-001',
    code: 'CNC-001',
    name: 'CNC 선반 1호기',
    type: 'CNC',
    typeLabel: 'CNC 가공기',
    lineId: 'LINE-A',
    lineName: 'A 라인',
    location: 'A동 1층',
    status: 'RUNNING',
    statusLabel: '가동',
    statusChangedAt: '2026-01-22T08:30:00Z',
    manufacturer: 'DMG MORI',
    installedAt: '2024-06-15',
    metrics: {
      efficiency: 85,
      todayProduction: 1250,
      targetProduction: 1500,
      defectCount: 3,
    },
    maintenance: {
      lastMaintenanceAt: '2026-01-15',
      nextMaintenanceAt: '2026-02-15',
      maintenanceManager: '김정비',
    },
    operator: '홍길동',
    history: [],
    ...overrides,
  }
}

describe('getStatusColor', () => {
  it.each([
    ['RUNNING', 'green'],
    ['STOPPED', 'default'],
    ['FAULT', 'red'],
    ['MAINTENANCE', 'gold'],
  ])('상태 %s에 대해 색상 %s를 반환해야 함', (status, expected) => {
    expect(getStatusColor(status as EquipmentStatus)).toBe(expected)
  })
})

describe('getStatusText', () => {
  it.each([
    ['RUNNING', '가동'],
    ['STOPPED', '정지'],
    ['FAULT', '고장'],
    ['MAINTENANCE', '점검'],
  ])('상태 %s에 대해 라벨 %s를 반환해야 함', (status, expected) => {
    expect(getStatusText(status as EquipmentStatus)).toBe(expected)
  })
})

describe('filterEquipment', () => {
  const mockEquipment: Equipment[] = [
    createMockEquipment({ id: 'eq-001', status: 'RUNNING', lineId: 'LINE-A' }),
    createMockEquipment({ id: 'eq-002', status: 'STOPPED', lineId: 'LINE-A' }),
    createMockEquipment({ id: 'eq-003', status: 'FAULT', lineId: 'LINE-B' }),
    createMockEquipment({ id: 'eq-004', status: 'MAINTENANCE', lineId: 'LINE-B' }),
  ]

  it('전체 상태 필터에서는 모든 설비를 반환해야 함', () => {
    const result = filterEquipment(mockEquipment, { status: 'all', lineId: 'all' })
    expect(result).toHaveLength(4)
  })

  it('상태 필터가 적용되어야 함', () => {
    const result = filterEquipment(mockEquipment, { status: 'RUNNING', lineId: 'all' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('eq-001')
  })

  it('라인 필터가 적용되어야 함', () => {
    const result = filterEquipment(mockEquipment, { status: 'all', lineId: 'LINE-B' })
    expect(result).toHaveLength(2)
  })

  it('상태와 라인 복합 필터가 적용되어야 함', () => {
    const result = filterEquipment(mockEquipment, { status: 'FAULT', lineId: 'LINE-B' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('eq-003')
  })

  it('빈 필터에서는 모든 설비를 반환해야 함', () => {
    const result = filterEquipment(mockEquipment, {})
    expect(result).toHaveLength(4)
  })
})

describe('countByStatus', () => {
  const mockEquipment: Equipment[] = [
    createMockEquipment({ id: 'eq-001', status: 'RUNNING' }),
    createMockEquipment({ id: 'eq-002', status: 'RUNNING' }),
    createMockEquipment({ id: 'eq-003', status: 'STOPPED' }),
    createMockEquipment({ id: 'eq-004', status: 'FAULT' }),
  ]

  it('상태별 개수를 정확히 계산해야 함', () => {
    const result = countByStatus(mockEquipment)
    expect(result.RUNNING).toBe(2)
    expect(result.STOPPED).toBe(1)
    expect(result.FAULT).toBe(1)
    expect(result.MAINTENANCE).toBe(0)
  })

  it('빈 배열에서는 모든 상태가 0이어야 함', () => {
    const result = countByStatus([])
    expect(result.RUNNING).toBe(0)
    expect(result.STOPPED).toBe(0)
    expect(result.FAULT).toBe(0)
    expect(result.MAINTENANCE).toBe(0)
  })
})

describe('calculateAchievementRate', () => {
  it('달성률을 정확히 계산해야 함', () => {
    expect(calculateAchievementRate(750, 1000)).toBe(75)
    expect(calculateAchievementRate(1000, 1000)).toBe(100)
    expect(calculateAchievementRate(1200, 1000)).toBe(120)
  })

  it('목표가 0인 경우 0을 반환해야 함', () => {
    expect(calculateAchievementRate(100, 0)).toBe(0)
  })

  it('소수점 첫째자리까지 반올림해야 함', () => {
    expect(calculateAchievementRate(333, 1000)).toBe(33.3)
  })
})

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷해야 함', () => {
    expect(formatDate('2026-01-22T08:30:00Z')).toBe('2026-01-22')
  })

  it('null/undefined에 대해 "-"를 반환해야 함', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate(undefined)).toBe('-')
  })
})

describe('formatDateTime', () => {
  it('날짜/시간을 MM-DD HH:mm 형식으로 포맷해야 함', () => {
    // UTC 기준 08:30 → 로컬 시간으로 변환됨 (테스트 환경에 따라 다름)
    const result = formatDateTime('2026-01-22T08:30:00Z')
    expect(result).toMatch(/^\d{2}-\d{2} \d{2}:\d{2}$/)
  })

  it('null/undefined에 대해 "-"를 반환해야 함', () => {
    expect(formatDateTime(null)).toBe('-')
    expect(formatDateTime(undefined)).toBe('-')
  })
})

describe('formatTime', () => {
  it('시간을 HH:mm:ss 형식으로 포맷해야 함', () => {
    const result = formatTime('2026-01-22T08:30:45Z')
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/)
  })

  it('null/undefined에 대해 "-"를 반환해야 함', () => {
    expect(formatTime(null)).toBe('-')
    expect(formatTime(undefined)).toBe('-')
  })
})

describe('formatNumber', () => {
  it('숫자에 천단위 구분자를 추가해야 함', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(100)).toBe('100')
  })

  it('null/undefined에 대해 "-"를 반환해야 함', () => {
    expect(formatNumber(null)).toBe('-')
    expect(formatNumber(undefined)).toBe('-')
  })
})

describe('simulateStatusChange', () => {
  it('changeRate가 0이면 상태가 변경되지 않아야 함', () => {
    const equipment = [createMockEquipment({ status: 'RUNNING' })]
    const result = simulateStatusChange(equipment, 0)
    expect(result[0].status).toBe('RUNNING')
  })

  it('changeRate가 1이면 모든 설비의 상태가 변경될 수 있어야 함', () => {
    const equipment = [
      createMockEquipment({ id: 'eq-001', status: 'STOPPED' }),
      createMockEquipment({ id: 'eq-002', status: 'STOPPED' }),
      createMockEquipment({ id: 'eq-003', status: 'STOPPED' }),
    ]
    // 변경률 100%로 여러 번 실행하면 최소 하나는 변경됨
    let hasChanged = false
    for (let i = 0; i < 10; i++) {
      const result = simulateStatusChange(equipment, 1)
      if (result.some(eq => eq.status !== 'STOPPED')) {
        hasChanged = true
        break
      }
    }
    expect(hasChanged).toBe(true)
  })

  it('상태 변경 시 이력이 추가되어야 함', () => {
    const equipment = [createMockEquipment({ status: 'STOPPED', history: [] })]
    let result = equipment
    // 변경될 때까지 반복
    for (let i = 0; i < 100; i++) {
      result = simulateStatusChange(result, 1)
      if (result[0].status !== 'STOPPED') {
        break
      }
    }
    if (result[0].status !== 'STOPPED') {
      expect(result[0].history.length).toBeGreaterThan(0)
    }
  })
})
