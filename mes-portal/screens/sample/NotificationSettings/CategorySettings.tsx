'use client'

// CategorySettings.tsx
// TSK-06-19: 알림 카테고리 설정 컴포넌트

import { Card, List, Switch, Typography } from 'antd'
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
  return (
    <Card
      title="알림 카테고리 설정"
      data-testid="category-settings"
      className="mb-6"
    >
      <List
        itemLayout="horizontal"
        dataSource={categories}
        split
        renderItem={(category) => (
          <List.Item
            key={category.id}
            actions={[
              <Switch
                key={`switch-${category.id}`}
                checked={category.enabled}
                onChange={(checked) => onChange(category.id, checked)}
                data-testid={`category-switch-${category.id}`}
                aria-label={`${category.name} 알림 활성화`}
              />,
            ]}
          >
            <List.Item.Meta
              title={
                <Text strong data-testid={`category-name-${category.id}`}>
                  {category.name}
                </Text>
              }
              description={
                <Text type="secondary" className="text-sm">
                  {category.description}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  )
}
