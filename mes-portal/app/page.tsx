'use client'

import { Button, Input, Space, Typography, Card, Switch } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const { Title, Text } = Typography

export default function Home() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

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
          <Space direction="vertical" className="w-full">
            <Space>
              <Button type="primary">Primary Button</Button>
              <Button>Default Button</Button>
              <Button type="dashed">Dashed Button</Button>
              <Button danger>Danger Button</Button>
            </Space>
            <Input placeholder="Input 컴포넌트 테스트" className="max-w-md" />
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
