'use client'

// CategorySettings.tsx
// TSK-06-19: 알림 카테고리 설정 컴포넌트

import { Card, Switch, Typography, Flex, theme } from 'antd'
import type { NotificationCategory } from './types'

const { Text } = Typography

interface CategorySettingsProps {
  /** 카테고리 목록 */
  categories: NotificationCategory[]
  /** 카테고리 변경 핸들러 */
  onChange: (id: string, enabled: boolean) => void
}

/**
 * 알림 카테고리 설정 컴포넌트
 * - 카테고리별 Switch로 활성화/비활성화 토글
 */
export default function CategorySettings({
  categories,
  onChange,
}: CategorySettingsProps) {
  const { token } = theme.useToken()

  return (
    <Card
      title="알림 카테고리 설정"
      data-testid="category-settings"
      className="mb-6"
    >
      <Flex vertical gap={0}>
        {categories.map((category, index) => (
          <Flex
            key={category.id}
            justify="space-between"
            align="center"
            className="py-3"
            style={{
              borderBottom:
                index < categories.length - 1
                  ? `1px solid ${token.colorBorderSecondary}`
                  : undefined,
            }}
          >
            <Flex vertical gap={4}>
              <Text strong data-testid={`category-name-${category.id}`}>
                {category.name}
              </Text>
              <Text type="secondary" className="text-sm">
                {category.description}
              </Text>
            </Flex>
            <Switch
              checked={category.enabled}
              onChange={(checked) => onChange(category.id, checked)}
              data-testid={`category-switch-${category.id}`}
              aria-label={`${category.name} 알림 활성화`}
            />
          </Flex>
        ))}
      </Flex>
    </Card>
  )
}
