// components/dashboard/charts/utils.ts
// 차트 유틸리티 함수 (010-design.md 섹션 7.4, 8.2 기준)

import type { LinePerformanceItem, ProductRatioItem } from '../types'

/**
 * 바 차트용 데이터 변환 타입
 */
export interface LinePerformanceChartItem {
  line: string
  type: 'actual' | 'target'
  value: number
}

/**
 * 라인별 실적 데이터를 그룹 바 차트용으로 변환 (BR-002)
 * @param data 원본 라인별 실적 데이터
 * @returns 차트용 변환 데이터 (실적/목표 분리)
 */
export function transformLinePerformance(
  data: LinePerformanceItem[]
): LinePerformanceChartItem[] {
  return data.flatMap((item) => [
    { line: item.line, type: 'actual' as const, value: item.actual },
    { line: item.line, type: 'target' as const, value: item.target },
  ])
}

/**
 * 파이 차트 항목 그룹화 (BR-003)
 * 항목이 limit 개수를 초과하면 상위 (limit-1)개 + "기타"로 그룹화
 *
 * @param data 원본 제품 비율 데이터
 * @param limit 최대 항목 수 (기본값: 5)
 * @returns 그룹화된 데이터
 */
export function groupSmallItems(
  data: ProductRatioItem[],
  limit: number = 5
): ProductRatioItem[] {
  if (data.length <= limit) return data

  // 값 기준 내림차순 정렬
  const sorted = [...data].sort((a, b) => b.value - a.value)

  // 상위 (limit-1)개
  const top = sorted.slice(0, limit - 1)

  // 나머지를 "기타"로 합산
  const others = sorted.slice(limit - 1)
  const othersValue = others.reduce((sum, item) => sum + item.value, 0)
  const totalValue = data.reduce((sum, item) => sum + item.value, 0)
  const othersPercentage = totalValue > 0
    ? Math.round((othersValue / totalValue) * 100)
    : 0

  return [
    ...top,
    {
      product: '기타',
      value: othersValue,
      percentage: othersPercentage,
    },
  ]
}

/**
 * 숫자에 천 단위 콤마 적용 (BR-004)
 * @param num 포맷팅할 숫자
 * @returns 콤마가 적용된 문자열
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR')
}

/**
 * 달성률 계산
 * @param actual 실적
 * @param target 목표
 * @returns 달성률 (소수점 1자리)
 */
export function calculateAchievementRate(
  actual: number,
  target: number
): string {
  if (target === 0) return '0.0'
  return ((actual / target) * 100).toFixed(1)
}

/**
 * 차트 데이터 최대 포인트 수 제한 (SEC-005)
 */
export const MAX_DATA_POINTS = {
  LINE_CHART: 100,
  BAR_CHART: 20,
  PIE_CHART: 10,
} as const

/**
 * 데이터 크기 제한 적용
 * @param data 원본 데이터
 * @param maxPoints 최대 포인트 수
 * @returns 제한된 데이터 (최신 데이터 유지)
 */
export function limitDataPoints<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data
  return data.slice(-maxPoints)
}
