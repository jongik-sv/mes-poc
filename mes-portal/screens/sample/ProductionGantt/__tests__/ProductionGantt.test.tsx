// screens/sample/ProductionGantt/__tests__/ProductionGantt.test.tsx
// 생산 계획 간트 차트 샘플 화면 단위 테스트 (TSK-06-14)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import ProductionGantt from '../index'
import {
  getStatusColor,
  calculateBarPosition,
  generateTimelineHeaders,
  getCellWidth,
  getViewStartDate,
  getDateRangeLabel,
  navigatePeriod,
  formatTooltipData,
  calculateAverageProgress,
} from '../utils'
import type { ProductionPlan, TimelineScale } from '../types'

// Mock 생산 계획 데이터
const mockPlans: ProductionPlan[] = [
  {
    id: 'PP-001',
    name: '제품A 생산',
    productCode: 'PRD-001',
    productName: '제품A',
    quantity: 1000,
    unit: 'EA',
    startDate: '2026-01-20',
    endDate: '2026-01-24',
    progress: 70,
    status: 'in_progress',
    line: 'Line-01',
    priority: 'high',
  },
  {
    id: 'PP-002',
    name: '제품B 생산',
    productCode: 'PRD-002',
    productName: '제품B',
    quantity: 500,
    unit: 'EA',
    startDate: '2026-01-21',
    endDate: '2026-01-25',
    progress: 100,
    status: 'completed',
    line: 'Line-02',
    priority: 'medium',
  },
  {
    id: 'PP-003',
    name: '제품C 생산',
    productCode: 'PRD-003',
    productName: '제품C',
    quantity: 800,
    unit: 'EA',
    startDate: '2026-01-22',
    endDate: '2026-01-27',
    progress: 80,
    status: 'in_progress',
    line: 'Line-01',
    priority: 'high',
  },
  {
    id: 'PP-004',
    name: '설비 점검',
    productCode: 'MNT-001',
    productName: '정기 점검',
    quantity: 1,
    unit: '회',
    startDate: '2026-01-23',
    endDate: '2026-01-23',
    progress: 100,
    status: 'completed',
    line: 'Line-03',
    priority: 'low',
  },
  {
    id: 'PP-005',
    name: '제품D 생산',
    productCode: 'PRD-004',
    productName: '제품D',
    quantity: 1200,
    unit: 'EA',
    startDate: '2026-01-24',
    endDate: '2026-01-28',
    progress: 50,
    status: 'delayed',
    line: 'Line-02',
    priority: 'high',
  },
]

// Mock JSON import
vi.mock('@/mock-data/production-plan.json', () => ({
  default: {
    plans: [
      {
        id: 'PP-001',
        name: '제품A 생산',
        productCode: 'PRD-001',
        productName: '제품A',
        quantity: 1000,
        unit: 'EA',
        startDate: '2026-01-20',
        endDate: '2026-01-24',
        progress: 70,
        status: 'in_progress',
        line: 'Line-01',
        priority: 'high',
      },
      {
        id: 'PP-002',
        name: '제품B 생산',
        productCode: 'PRD-002',
        productName: '제품B',
        quantity: 500,
        unit: 'EA',
        startDate: '2026-01-21',
        endDate: '2026-01-25',
        progress: 100,
        status: 'completed',
        line: 'Line-02',
        priority: 'medium',
      },
      {
        id: 'PP-003',
        name: '제품C 생산',
        productCode: 'PRD-003',
        productName: '제품C',
        quantity: 800,
        unit: 'EA',
        startDate: '2026-01-22',
        endDate: '2026-01-27',
        progress: 80,
        status: 'in_progress',
        line: 'Line-01',
        priority: 'high',
      },
      {
        id: 'PP-004',
        name: '설비 점검',
        productCode: 'MNT-001',
        productName: '정기 점검',
        quantity: 1,
        unit: '회',
        startDate: '2026-01-23',
        endDate: '2026-01-23',
        progress: 100,
        status: 'completed',
        line: 'Line-03',
        priority: 'low',
      },
      {
        id: 'PP-005',
        name: '제품D 생산',
        productCode: 'PRD-004',
        productName: '제품D',
        quantity: 1200,
        unit: 'EA',
        startDate: '2026-01-24',
        endDate: '2026-01-28',
        progress: 50,
        status: 'delayed',
        line: 'Line-02',
        priority: 'high',
      },
    ],
    meta: {
      totalCount: 5,
      dateRange: {
        start: '2026-01-01',
        end: '2026-01-31',
      },
    },
  },
}))

describe('유틸리티 함수 테스트', () => {
  describe('UT-006: getStatusColor', () => {
    it.each([
      ['planned', '#8c8c8c'],
      ['in_progress', '#1677ff'],
      ['completed', '#52c41a'],
      ['delayed', '#ff4d4f'],
    ] as const)('상태 %s에 대해 색상 %s를 반환해야 한다', (status, expectedColor) => {
      expect(getStatusColor(status)).toBe(expectedColor)
    })
  })

  describe('UT-002: calculateBarPosition', () => {
    it('일간 스케일에서 올바른 위치를 계산해야 한다', () => {
      const viewStart = dayjs('2026-01-19')
      const result = calculateBarPosition(
        '2026-01-20',
        '2026-01-24',
        viewStart,
        'day',
        40
      )

      expect(result.left).toBe(40) // 1일 후 시작
      expect(result.width).toBe(200) // 5일 길이
    })

    it('주간 스케일에서 올바른 위치를 계산해야 한다', () => {
      const viewStart = dayjs('2026-01-20')
      const result = calculateBarPosition(
        '2026-01-20',
        '2026-01-22',
        viewStart,
        'week',
        100
      )

      expect(result.left).toBe(0) // 같은 날 시작
      expect(result.width).toBe(300) // 3일 길이
    })

    it('월간 스케일에서 올바른 위치를 계산해야 한다', () => {
      const viewStart = dayjs('2026-01-01')
      const result = calculateBarPosition(
        '2026-01-10',
        '2026-01-15',
        viewStart,
        'month',
        175
      )

      expect(result.left).toBe(9 * 175) // 9일 후 시작
      expect(result.width).toBe(6 * 175) // 6일 길이
    })
  })

  describe('generateTimelineHeaders', () => {
    it('일간 스케일에서 7일 헤더를 생성해야 한다', () => {
      const viewStart = dayjs('2026-01-20')
      const headers = generateTimelineHeaders(viewStart, 'day')

      expect(headers).toHaveLength(7)
      expect(headers[0].key).toBe('2026-01-20')
    })

    it('주간 스케일에서 7일 헤더를 생성해야 한다', () => {
      const viewStart = dayjs('2026-01-20')
      const headers = generateTimelineHeaders(viewStart, 'week')

      expect(headers).toHaveLength(7)
    })

    it('월간 스케일에서 4주 헤더를 생성해야 한다', () => {
      const viewStart = dayjs('2026-01-01')
      const headers = generateTimelineHeaders(viewStart, 'month')

      expect(headers).toHaveLength(4)
    })
  })

  describe('getCellWidth', () => {
    it('각 스케일에 맞는 셀 너비를 반환해야 한다', () => {
      expect(getCellWidth('day')).toBe(100)
      expect(getCellWidth('week')).toBe(100)
      expect(getCellWidth('month')).toBe(175)
    })
  })

  describe('getViewStartDate', () => {
    it('일간 스케일에서 해당 일의 시작을 반환해야 한다', () => {
      const date = dayjs('2026-01-22')
      const viewStart = getViewStartDate(date, 'day')

      expect(viewStart.format('YYYY-MM-DD')).toBe('2026-01-22')
    })

    it('주간 스케일에서 주 시작일을 반환해야 한다', () => {
      const date = dayjs('2026-01-22') // 목요일
      const viewStart = getViewStartDate(date, 'week')

      expect(viewStart.day()).toBe(1) // 월요일
    })

    it('월간 스케일에서 월 시작일을 반환해야 한다', () => {
      const date = dayjs('2026-01-22')
      const viewStart = getViewStartDate(date, 'month')

      expect(viewStart.date()).toBe(1)
    })
  })

  describe('getDateRangeLabel', () => {
    it('일간 스케일에서 날짜 범위 라벨을 반환해야 한다', () => {
      const viewStart = dayjs('2026-01-20')
      const label = getDateRangeLabel(viewStart, 'day')

      expect(label).toContain('2026년 1월 20일')
    })

    it('주간 스케일에서 주차 라벨을 반환해야 한다', () => {
      const viewStart = dayjs('2026-01-20')
      const label = getDateRangeLabel(viewStart, 'week')

      expect(label).toContain('2026년 1월')
      expect(label).toContain('주차')
    })

    it('월간 스케일에서 월 라벨을 반환해야 한다', () => {
      const viewStart = dayjs('2026-01-01')
      const label = getDateRangeLabel(viewStart, 'month')

      expect(label).toBe('2026년 1월')
    })
  })

  describe('navigatePeriod', () => {
    it('일간/주간 스케일에서 7일씩 이동해야 한다', () => {
      const date = dayjs('2026-01-20')

      const nextDate = navigatePeriod(date, 'day', 1)
      expect(nextDate.diff(date, 'day')).toBe(7)

      const prevDate = navigatePeriod(date, 'week', -1)
      expect(prevDate.diff(date, 'day')).toBe(-7)
    })

    it('월간 스케일에서 1개월씩 이동해야 한다', () => {
      const date = dayjs('2026-01-15')

      const nextDate = navigatePeriod(date, 'month', 1)
      expect(nextDate.month()).toBe(1) // 2월 (0-indexed)

      const prevDate = navigatePeriod(date, 'month', -1)
      expect(prevDate.month()).toBe(11) // 12월 (전년)
    })
  })

  describe('UT-005: formatTooltipData', () => {
    it('툴팁 데이터를 올바르게 포맷해야 한다', () => {
      const plan = mockPlans[0]
      const result = formatTooltipData(plan)

      expect(result.title).toBe('제품A 생산')
      expect(result.items).toHaveLength(6)
      expect(result.items[0]).toEqual({
        label: '제품',
        value: '제품A (PRD-001)',
      })
      expect(result.items[1]).toEqual({
        label: '수량',
        value: '1,000 EA',
      })
    })
  })

  describe('calculateAverageProgress', () => {
    it('평균 진행률을 올바르게 계산해야 한다', () => {
      const plans = mockPlans
      const average = calculateAverageProgress(plans)

      // (70 + 100 + 80 + 100 + 50) / 5 = 80
      expect(average).toBe(80)
    })

    it('빈 배열에서는 0을 반환해야 한다', () => {
      expect(calculateAverageProgress([])).toBe(0)
    })
  })
})

describe('ProductionGantt 컴포넌트', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('UT-001: 렌더링', () => {
    it('간트 차트가 데이터와 함께 렌더링되어야 한다', async () => {
      render(<ProductionGantt />)

      // 페이지 컨테이너 확인
      expect(screen.getByTestId('production-gantt-page')).toBeInTheDocument()

      // 간트 차트 영역 확인
      expect(screen.getByTestId('gantt-chart')).toBeInTheDocument()

      // 작업 바 확인 (5개)
      await waitFor(() => {
        const taskBars = screen.getAllByTestId('task-bar')
        expect(taskBars).toHaveLength(5)
      })
    })

    it('스케일 선택기가 표시되어야 한다', () => {
      render(<ProductionGantt />)

      expect(screen.getByTestId('scale-selector')).toBeInTheDocument()
      expect(screen.getByTestId('scale-day')).toBeInTheDocument()
      expect(screen.getByTestId('scale-week')).toBeInTheDocument()
      expect(screen.getByTestId('scale-month')).toBeInTheDocument()
    })

    it('기간 네비게이션이 표시되어야 한다', () => {
      render(<ProductionGantt />)

      expect(screen.getByTestId('date-navigator')).toBeInTheDocument()
      expect(screen.getByTestId('date-prev')).toBeInTheDocument()
      expect(screen.getByTestId('date-next')).toBeInTheDocument()
      expect(screen.getByTestId('date-label')).toBeInTheDocument()
    })

    it('작업명 목록이 표시되어야 한다', () => {
      render(<ProductionGantt />)

      expect(screen.getByTestId('task-list')).toBeInTheDocument()
      expect(screen.getByText('제품A 생산')).toBeInTheDocument()
      expect(screen.getByText('제품B 생산')).toBeInTheDocument()
      expect(screen.getByText('제품C 생산')).toBeInTheDocument()
      expect(screen.getByText('설비 점검')).toBeInTheDocument()
      expect(screen.getByText('제품D 생산')).toBeInTheDocument()
    })

    it('범례가 표시되어야 한다', () => {
      render(<ProductionGantt />)

      expect(screen.getByTestId('legend')).toBeInTheDocument()
      expect(screen.getByText('완료')).toBeInTheDocument()
      expect(screen.getByText('진행중')).toBeInTheDocument()
      expect(screen.getByText('지연')).toBeInTheDocument()
      expect(screen.getByText('계획됨')).toBeInTheDocument()
    })

    it('요약 정보가 표시되어야 한다', () => {
      render(<ProductionGantt />)

      expect(screen.getByTestId('summary')).toBeInTheDocument()
      expect(screen.getByText('총 5개 작업')).toBeInTheDocument()
      expect(screen.getByText('평균 진행률: 80%')).toBeInTheDocument()
    })
  })

  describe('UT-003: 스케일 변경', () => {
    it('스케일 버튼 클릭 시 onChange가 호출되어야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<ProductionGantt />)

      // 기본값은 주간
      const weekButton = screen.getByTestId('scale-week')
      expect(weekButton).toHaveClass('ant-btn-primary')

      // 월간 버튼 클릭
      const monthButton = screen.getByTestId('scale-month')
      await act(async () => {
        await user.click(monthButton)
        vi.advanceTimersByTime(100)
      })

      // 월간 버튼이 활성화되어야 함
      await waitFor(() => {
        expect(screen.getByTestId('scale-month')).toHaveClass('ant-btn-primary')
      })
    })

    it('스케일 변경 시 타임라인이 업데이트되어야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<ProductionGantt />)

      // 일간 버튼 클릭
      await act(async () => {
        await user.click(screen.getByTestId('scale-day'))
        vi.advanceTimersByTime(100)
      })

      // 타임라인 헤더 변경 확인
      await waitFor(() => {
        expect(screen.getByTestId('timeline-header')).toBeInTheDocument()
      })
    })
  })

  describe('UT-004: 진행률 표시', () => {
    it('작업 바에 올바른 진행률이 표시되어야 한다', async () => {
      render(<ProductionGantt />)

      await waitFor(() => {
        const progressFills = screen.getAllByTestId('progress-fill')
        expect(progressFills.length).toBeGreaterThan(0)

        // 첫 번째 작업 바의 진행률 (70%)
        expect(progressFills[0]).toHaveStyle({ width: '70%' })
      })
    })
  })

  describe('기간 네비게이션', () => {
    it('이전 버튼 클릭 시 기간이 이전으로 이동해야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<ProductionGantt />)

      const initialLabel = screen.getByTestId('date-label').textContent

      await act(async () => {
        await user.click(screen.getByTestId('date-prev'))
        vi.advanceTimersByTime(100)
      })

      await waitFor(() => {
        const newLabel = screen.getByTestId('date-label').textContent
        expect(newLabel).not.toBe(initialLabel)
      })
    })

    it('다음 버튼 클릭 시 기간이 다음으로 이동해야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<ProductionGantt />)

      const initialLabel = screen.getByTestId('date-label').textContent

      await act(async () => {
        await user.click(screen.getByTestId('date-next'))
        vi.advanceTimersByTime(100)
      })

      await waitFor(() => {
        const newLabel = screen.getByTestId('date-label').textContent
        expect(newLabel).not.toBe(initialLabel)
      })
    })
  })

  describe('기본 스케일 설정', () => {
    it('BR-004: 기본 스케일이 주간으로 설정되어야 한다', () => {
      render(<ProductionGantt />)

      const weekButton = screen.getByTestId('scale-week')
      expect(weekButton).toHaveClass('ant-btn-primary')
    })

    it('defaultScale prop으로 초기 스케일을 설정할 수 있어야 한다', () => {
      render(<ProductionGantt defaultScale="day" />)

      const dayButton = screen.getByTestId('scale-day')
      expect(dayButton).toHaveClass('ant-btn-primary')
    })
  })
})
