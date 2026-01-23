/**
 * 주요 지표 카드 컴포넌트
 * @description 카테고리별 주요 지표를 테이블 형태로 표시
 */
'use client'

import { Card, Table, Typography, theme } from 'antd'
import { BarChartOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getGlassCardStyle, useIsDarkMode } from '@/lib/theme/utils'

const { Text } = Typography

interface MetricItem {
  code: string
  name: string
  value: number
}

interface MetricCategory {
  name: string
  items: MetricItem[]
}

interface KeyMetricsCardProps {
  categories: MetricCategory[]
  lastUpdated?: string
}

interface FlattenedMetric {
  key: string
  category: string
  code: string
  name: string
  value: number
  rowSpan?: number
}

export function KeyMetricsCard({ categories, lastUpdated }: KeyMetricsCardProps) {
  const { token } = theme.useToken()
  const isDark = useIsDarkMode()

  // 공통 카드 스타일 - Glassmorphism (라이트/다크 테마 호환)
  const cardStyle = getGlassCardStyle(token, isDark)

  // 데이터를 테이블용 플랫 구조로 변환
  const flattenedData: FlattenedMetric[] = []
  categories.forEach((category) => {
    category.items.forEach((item, index) => {
      flattenedData.push({
        key: `${category.name}-${item.code}`,
        category: category.name,
        code: item.code,
        name: item.name,
        value: item.value,
        rowSpan: index === 0 ? category.items.length : 0,
      })
    })
  })

  const columns: ColumnsType<FlattenedMetric> = [
    {
      title: '분류',
      dataIndex: 'category',
      key: 'category',
      width: 80,
      onCell: (record) => ({
        rowSpan: record.rowSpan,
      }),
      render: (text) => (
        <Text strong style={{ color: token.colorPrimary }}>
          {text}
        </Text>
      ),
    },
    {
      title: '코드',
      dataIndex: 'code',
      key: 'code',
      width: 80,
      render: (text) => (
        <Text type="secondary" className="font-mono text-xs">
          {text}
        </Text>
      ),
    },
    {
      title: '항목',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '수량',
      dataIndex: 'value',
      key: 'value',
      width: 100,
      align: 'right',
      render: (value: number) => (
        <Text strong>{value.toLocaleString('ko-KR')}</Text>
      ),
    },
  ]

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <BarChartOutlined style={{ color: token.colorPrimary }} />
          <span>주요 지표</span>
        </div>
      }
      extra={
        lastUpdated && (
          <Text type="secondary" className="text-xs">
            {new Date(lastUpdated).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            기준
          </Text>
        )
      }
      styles={{
        body: { padding: 0 },
      }}
      style={cardStyle}
    >
      <Table
        dataSource={flattenedData}
        columns={columns}
        pagination={false}
        size="small"
        bordered={false}
        showHeader={true}
        style={{ borderRadius: 0 }}
      />
    </Card>
  )
}
