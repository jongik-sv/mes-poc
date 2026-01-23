/**
 * 대시보드 KPI 미리보기 섹션 컴포넌트
 * @description 대시보드의 주요 KPI를 간략하게 표시
 */
'use client'

import { Card, Typography, theme } from 'antd'
import { DashboardOutlined, RightOutlined } from '@ant-design/icons'
import { KPICard } from '@/components/dashboard/KPICard'
import type { KPIData } from '@/components/dashboard/types'
import { getGlassCardStyle, useIsDarkMode } from '@/lib/theme/utils'

const { Text } = Typography

interface KPIItem {
  title: string
  data: KPIData
  valueType?: 'positive' | 'negative'
}

interface QuickKPISectionProps {
  kpiItems?: KPIItem[]
  onNavigateToDashboard?: () => void
}

// 기본 KPI 데이터
const defaultKPIItems: KPIItem[] = [
  {
    title: '가동률',
    data: { value: 92.5, unit: '%', change: 2.3, changeType: 'increase' },
    valueType: 'positive',
  },
  {
    title: '생산량',
    data: { value: 15680, unit: '개', change: 5.2, changeType: 'increase' },
    valueType: 'positive',
  },
  {
    title: '불량률',
    data: { value: 1.2, unit: '%', change: -0.3, changeType: 'decrease' },
    valueType: 'negative',
  },
  {
    title: '설비고장',
    data: { value: 3, unit: '건', change: 1, changeType: 'increase' },
    valueType: 'negative',
  },
]

export function QuickKPISection({
  kpiItems = defaultKPIItems,
  onNavigateToDashboard
}: QuickKPISectionProps) {
  const { token } = theme.useToken()
  const isDark = useIsDarkMode()

  // 공통 카드 스타일 - Glassmorphism (라이트/다크 테마 호환)
  const cardStyle = getGlassCardStyle(token, isDark)

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <DashboardOutlined style={{ color: token.colorPrimary }} />
          <span>대시보드 KPI</span>
        </div>
      }
      extra={
        onNavigateToDashboard && (
          <button
            onClick={onNavigateToDashboard}
            className="text-xs px-2 py-1 rounded transition-colors cursor-pointer"
            style={{
              color: token.colorPrimary,
              backgroundColor: 'transparent',
              border: 'none',
            }}
          >
            대시보드로 이동 <RightOutlined />
          </button>
        )
      }
      styles={{
        body: { padding: 16 },
      }}
      style={cardStyle}
    >
      <div className="grid grid-cols-2 gap-3">
        {kpiItems.map((item, index) => (
          <KPICard
            key={index}
            title={item.title}
            data={item.data}
            valueType={item.valueType}
          />
        ))}
      </div>
    </Card>
  )
}
