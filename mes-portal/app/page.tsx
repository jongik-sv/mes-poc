'use client'

import { Button, Input, Space, Typography, Card, Switch } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import DatePickerField from '@/components/common/DatePickerField'
import RangePickerField from '@/components/common/RangePickerField'
import dayjs, { Dayjs } from '@/lib/dayjs'

const { Title, Text } = Typography

export default function Home() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const datePresets = [
    { label: '오늘', value: dayjs() },
    { label: '어제', value: dayjs().subtract(1, 'day') },
  ]

  const rangePresets = [
    { label: '최근 7일', value: [dayjs().subtract(6, 'day'), dayjs()] as [Dayjs, Dayjs] },
    { label: '이번 달', value: [dayjs().startOf('month'), dayjs()] as [Dayjs, Dayjs] },
  ]

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <Title level={2}>MES Portal - UI 테스트</Title>
          <Text type="secondary">
            Ant Design 6.x + TailwindCSS 4.x + next-themes 설정 검증
          </Text>
        </Card>

        {/* 테마 전환 */}
        <Card title="테마 전환" className="mb-6">
          <Space align="center">
            <SunOutlined />
            <Switch
              checked={mounted && resolvedTheme === 'dark'}
              onChange={toggleTheme}
              checkedChildren="다크"
              unCheckedChildren="라이트"
            />
            <MoonOutlined />
            {mounted && (
              <Text>현재 테마: {resolvedTheme}</Text>
            )}
          </Space>
        </Card>

        {/* Ant Design 컴포넌트 테스트 */}
        <Card title="Ant Design 컴포넌트" className="mb-6">
          <Space orientation="vertical" className="w-full">
            <Space>
              <Button type="primary">Primary Button</Button>
              <Button>Default Button</Button>
              <Button type="dashed">Dashed Button</Button>
              <Button danger>Danger Button</Button>
            </Space>
            <Input placeholder="Input 컴포넌트 테스트" className="max-w-md" />
          </Space>
        </Card>

        {/* 날짜 선택기 테스트 (TSK-05-05) */}
        <Card title="날짜 선택기 (DatePicker)" className="mb-6">
          <Space direction="vertical" className="w-full" size="middle">
            <div>
              <Text strong>단일 날짜 선택</Text>
              <div className="mt-2">
                <DatePickerField
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  placeholder="날짜를 선택하세요"
                  presets={datePresets}
                  data-testid="date-picker"
                />
              </div>
              {selectedDate && (
                <Text className="mt-2 block" type="success">
                  선택된 날짜: {selectedDate.format('YYYY-MM-DD')}
                </Text>
              )}
            </div>
            <div>
              <Text strong>날짜 범위 선택</Text>
              <div className="mt-2">
                <RangePickerField
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                  presets={rangePresets}
                  data-testid="range-picker"
                />
              </div>
              {dateRange && (
                <Text className="mt-2 block" type="success">
                  선택된 기간: {dateRange[0].format('YYYY-MM-DD')} ~ {dateRange[1].format('YYYY-MM-DD')}
                </Text>
              )}
            </div>
            <div>
              <Text strong>비활성 날짜 (과거 날짜 선택 불가)</Text>
              <div className="mt-2">
                <DatePickerField
                  disabledDate={(date) => date.isBefore(dayjs(), 'day')}
                  placeholder="미래 날짜만 선택 가능"
                  data-testid="date-picker-with-disabled"
                />
              </div>
            </div>
          </Space>
        </Card>

        {/* TailwindCSS 테스트 */}
        <Card title="TailwindCSS 유틸리티 클래스">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
              flex
            </div>
            <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
              gap-4
            </div>
            <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold">
              items
            </div>
            <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">
              center
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
