// screens/sample/ProductionGantt/index.tsx
// 생산 계획 간트 차트 샘플 화면 (TSK-06-14)

'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Card, Button, Empty, Tooltip, Spin, Typography } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import isoWeek from 'dayjs/plugin/isoWeek'
import mockData from '@/mock-data/production-plan.json'
import type {
  ProductionPlan,
  ProductionPlanData,
  TimelineScale,
  ProductionGanttProps,
} from './types'
import { STATUS_COLORS, STATUS_LABELS, SCALE_LABELS } from './types'
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
} from './utils'

dayjs.extend(isoWeek)
dayjs.locale('ko')

const { Text } = Typography

// 상수
const TASK_NAME_WIDTH = 130
const ROW_HEIGHT = 50
const BAR_HEIGHT = 30

/**
 * 생산 계획 간트 차트 샘플 화면
 *
 * 생산 계획을 타임라인 형태로 시각화하는 간트 차트 화면입니다.
 * - 스케일 선택 (일간/주간/월간)
 * - 기간 네비게이션
 * - 작업 바 진행률 표시
 * - 호버 시 상세 정보 툴팁
 *
 * @example
 * ```tsx
 * <ProductionGantt />
 * ```
 */
export function ProductionGantt({ defaultScale = 'week' }: ProductionGanttProps) {
  // 데이터
  const data = mockData as ProductionPlanData
  const plans = data.plans as ProductionPlan[]

  // 상태
  const [scale, setScale] = useState<TimelineScale>(defaultScale)
  const [currentDate, setCurrentDate] = useState(dayjs('2026-01-20'))
  const [loading, setLoading] = useState(false)

  // 뷰 시작일
  const viewStart = useMemo(() => getViewStartDate(currentDate, scale), [currentDate, scale])

  // 타임라인 헤더
  const headers = useMemo(() => generateTimelineHeaders(viewStart, scale), [viewStart, scale])

  // 셀 너비
  const cellWidth = useMemo(() => getCellWidth(scale), [scale])

  // 기간 라벨
  const dateRangeLabel = useMemo(() => getDateRangeLabel(viewStart, scale), [viewStart, scale])

  // 타임라인 너비
  const timelineWidth = useMemo(() => headers.length * cellWidth, [headers.length, cellWidth])

  // 평균 진행률
  const averageProgress = useMemo(() => calculateAverageProgress(plans), [plans])

  // 스케일 변경 핸들러
  const handleScaleChange = useCallback((newScale: TimelineScale) => {
    setScale(newScale)
  }, [])

  // 기간 이동 핸들러
  const handleNavigate = useCallback(
    (direction: 1 | -1) => {
      setCurrentDate((prev) => navigatePeriod(prev, scale, direction))
    },
    [scale]
  )

  // 작업 바 렌더링
  const renderTaskBar = useCallback(
    (plan: ProductionPlan) => {
      const position = calculateBarPosition(
        plan.startDate,
        plan.endDate,
        viewStart,
        scale,
        cellWidth
      )

      // 바가 완전히 뷰 범위를 벗어나면 표시하지 않음 (여유 있게 체크)
      const isCompletelyOutOfView =
        position.left + position.width < -cellWidth ||
        position.left > timelineWidth + cellWidth
      if (isCompletelyOutOfView) {
        return null
      }

      const color = getStatusColor(plan.status)
      const tooltipData = formatTooltipData(plan)

      return (
        <Tooltip
          key={plan.id}
          title={
            <div data-testid="task-tooltip" className="p-1">
              <div className="mb-2 font-semibold">{tooltipData.title}</div>
              <div className="space-y-1">
                {tooltipData.items.map((item) => (
                  <div key={item.label} className="flex justify-between gap-4">
                    <span className="opacity-65">{item.label}:</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          }
          placement="top"
        >
          <div
            data-testid="task-bar"
            data-task-id={plan.id}
            className="absolute cursor-pointer transition-opacity hover:opacity-80"
            style={{
              left: Math.max(position.left, 0),
              width: position.width,
              top: (ROW_HEIGHT - BAR_HEIGHT) / 2,
              height: BAR_HEIGHT,
            }}
          >
            {/* 배경 바 (미완료 부분) */}
            <div
              className="absolute inset-0 rounded"
              style={{
                backgroundColor: color,
                opacity: 0.3,
              }}
            />
            {/* 진행률 바 */}
            <div
              data-testid="progress-fill"
              className="absolute left-0 top-0 h-full rounded"
              style={{
                width: `${plan.progress}%`,
                backgroundColor: color,
              }}
            />
            {/* 진행률 텍스트 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-white drop-shadow">
                {plan.progress}%
              </span>
            </div>
          </div>
        </Tooltip>
      )
    },
    [viewStart, scale, cellWidth, timelineWidth]
  )

  // 빈 데이터 처리
  if (plans.length === 0) {
    return (
      <div data-testid="production-gantt-page" className="h-full p-4">
        <Card>
          <div data-testid="empty-state" className="flex h-96 items-center justify-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">등록된 생산 계획이 없습니다.</Text>
              }
            />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div data-testid="production-gantt-page" className="h-full p-4">
      <Card
        title="생산 계획 간트 차트"
        extra={
          <div className="flex items-center gap-4">
            {/* 스케일 선택 */}
            <div data-testid="scale-selector" className="flex gap-1">
              {(['day', 'week', 'month'] as TimelineScale[]).map((s) => (
                <Button
                  key={s}
                  data-testid={`scale-${s}`}
                  type={scale === s ? 'primary' : 'default'}
                  size="small"
                  onClick={() => handleScaleChange(s)}
                >
                  {SCALE_LABELS[s]}
                </Button>
              ))}
            </div>
            {/* 기간 네비게이션 */}
            <div data-testid="date-navigator" className="flex items-center gap-2">
              <Button
                data-testid="date-prev"
                icon={<LeftOutlined />}
                size="small"
                onClick={() => handleNavigate(-1)}
              />
              <span data-testid="date-label" className="min-w-32 text-center font-medium">
                {dateRangeLabel}
              </span>
              <Button
                data-testid="date-next"
                icon={<RightOutlined />}
                size="small"
                onClick={() => handleNavigate(1)}
              />
            </div>
          </div>
        }
      >
        <Spin spinning={loading}>
          <div data-testid="gantt-chart" className="overflow-auto">
            {/* 간트 차트 테이블 */}
            <div className="flex" style={{ minWidth: TASK_NAME_WIDTH + timelineWidth }}>
              {/* 작업명 열 */}
              <div
                data-testid="task-list"
                className="flex-shrink-0 border-r border-gray-200"
                style={{ width: TASK_NAME_WIDTH }}
              >
                {/* 헤더 */}
                <div
                  className="flex items-center justify-center border-b border-gray-200 bg-gray-50 text-sm text-gray-500"
                  style={{ height: ROW_HEIGHT }}
                >
                  작업명
                </div>
                {/* 작업 목록 */}
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    data-testid="task-row"
                    className="flex items-center justify-center border-b border-gray-100 px-2 text-sm"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <span data-testid="task-name" className="truncate">
                      {plan.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* 타임라인 영역 */}
              <div className="flex-1 overflow-x-auto">
                {/* 타임라인 헤더 */}
                <div
                  data-testid="timeline-header"
                  className="flex border-b border-gray-200 bg-gray-50"
                  style={{ height: ROW_HEIGHT }}
                >
                  {headers.map((header) => (
                    <div
                      key={header.key}
                      className="flex flex-shrink-0 items-center justify-center border-r border-gray-100 text-sm text-gray-500"
                      style={{ width: cellWidth }}
                    >
                      {header.label}
                    </div>
                  ))}
                </div>
                {/* 타임라인 본문 */}
                <div data-testid="timeline-body">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="relative border-b border-gray-100"
                      style={{ height: ROW_HEIGHT }}
                    >
                      {/* 그리드 라인 */}
                      <div className="absolute inset-0 flex">
                        {headers.map((header) => (
                          <div
                            key={header.key}
                            className="flex-shrink-0 border-r border-gray-100"
                            style={{ width: cellWidth }}
                          />
                        ))}
                      </div>
                      {/* 작업 바 */}
                      {renderTaskBar(plan)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 범례 및 요약 */}
            <div
              data-testid="legend"
              className="mt-4 flex items-center gap-6 border-t border-gray-200 bg-gray-50 px-4 py-3"
            >
              {/* 범례 */}
              <div className="flex gap-4">
                {(Object.keys(STATUS_COLORS) as Array<keyof typeof STATUS_COLORS>).map(
                  (status) => (
                    <div key={status} className="flex items-center gap-1">
                      <div
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: STATUS_COLORS[status] }}
                      />
                      <span className="text-sm text-gray-500">{STATUS_LABELS[status]}</span>
                    </div>
                  )
                )}
              </div>
              {/* 구분선 */}
              <div className="h-5 w-px bg-gray-300" />
              {/* 요약 */}
              <div data-testid="summary" className="flex gap-4 text-sm">
                <span>총 {plans.length}개 작업</span>
                <div className="h-5 w-px bg-gray-300" />
                <span>평균 진행률: {averageProgress}%</span>
              </div>
            </div>
          </div>
        </Spin>
      </Card>
    </div>
  )
}

export default ProductionGantt
