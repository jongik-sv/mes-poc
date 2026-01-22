// app/(portal)/dashboard/page.tsx
// 포털 대시보드 페이지 (TSK-07-01)

'use client'

import { useState, useEffect } from 'react'
import { Dashboard } from '@/components/dashboard'
import type { DashboardData } from '@/components/dashboard/types'
import dashboardMockData from '@/mock-data/dashboard.json'

/**
 * 대시보드 페이지
 *
 * Mock 데이터를 사용하여 대시보드 레이아웃 표시
 * 실제 API 연동은 Phase 2에서 구현
 */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)

  // Mock 데이터 로드 시뮬레이션
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // 실제 API 호출 시뮬레이션 (500ms 딜레이)
        await new Promise((resolve) => setTimeout(resolve, 500))
        setData(dashboardMockData as DashboardData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('데이터 로드 실패'))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // 재시도 핸들러
  const handleRetry = () => {
    setError(null)
    setLoading(true)
    // 데이터 다시 로드
    setTimeout(() => {
      setData(dashboardMockData as DashboardData)
      setLoading(false)
    }, 500)
  }

  // 데이터가 없는 경우 로딩 또는 에러 상태
  if (!data && !loading) {
    return (
      <Dashboard
        data={{
          kpi: {
            operationRate: { value: 0, unit: '%', change: 0, changeType: 'unchanged' },
            defectRate: { value: 0, unit: '%', change: 0, changeType: 'unchanged' },
            productionVolume: { value: 0, unit: 'EA', change: 0, changeType: 'unchanged' },
            achievementRate: { value: 0, unit: '%', change: 0, changeType: 'unchanged' },
          },
          productionTrend: [],
          linePerformance: [],
          recentActivities: [],
        }}
        error={error}
        onRetry={handleRetry}
      />
    )
  }

  return (
    <Dashboard
      data={data || {
        kpi: {
          operationRate: { value: 0, unit: '%', change: 0, changeType: 'unchanged' },
          defectRate: { value: 0, unit: '%', change: 0, changeType: 'unchanged' },
          productionVolume: { value: 0, unit: 'EA', change: 0, changeType: 'unchanged' },
          achievementRate: { value: 0, unit: '%', change: 0, changeType: 'unchanged' },
        },
        productionTrend: [],
        linePerformance: [],
        recentActivities: [],
      }}
      loading={loading}
      error={error}
      onRetry={handleRetry}
    />
  )
}
