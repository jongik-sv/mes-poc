'use client';

/**
 * Dashboard Screen (MDI용)
 * @description components/dashboard의 Dashboard를 래핑하여 MDI 탭에서 표시
 */

import { useState, useEffect } from 'react'
import { Dashboard } from '@/components/dashboard'
import type { DashboardData } from '@/components/dashboard/types'
import dashboardMockData from '@/mock-data/dashboard.json'

export default function DashboardScreen() {
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
    setTimeout(() => {
      setData(dashboardMockData as DashboardData)
      setLoading(false)
    }, 500)
  }

  // 기본 데이터 (데이터가 없을 때)
  const defaultData: DashboardData = {
    kpi: {
      operationRate: { value: 0, unit: '%', change: 0, changeType: 'unchanged' },
      defectRate: { value: 0, unit: '%', change: 0, changeType: 'unchanged' },
      productionVolume: { value: 0, unit: 'EA', change: 0, changeType: 'unchanged' },
      achievementRate: { value: 0, unit: '%', change: 0, changeType: 'unchanged' },
    },
    productionTrend: [],
    linePerformance: [],
    recentActivities: [],
  }

  return (
    <div data-testid="screen-dashboard" className="p-4">
      <Dashboard
        data={data || defaultData}
        loading={loading}
        error={error}
        onRetry={handleRetry}
      />
    </div>
  )
}
