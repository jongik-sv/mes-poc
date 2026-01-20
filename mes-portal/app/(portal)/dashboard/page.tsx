// app/(portal)/dashboard/page.tsx
// 포털 대시보드 페이지
'use client'

import { Card, Typography } from 'antd'

const { Title, Text } = Typography

export default function PortalHomePage() {
  return (
    <div className="space-y-6">
      <Card>
        <Title level={3}>MES Portal 대시보드</Title>
        <Text type="secondary">
          포털 레이아웃이 정상적으로 적용되었습니다.
        </Text>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="생산 현황" className="hover:shadow-lg transition-shadow">
          <Text>오늘 생산량: 0</Text>
        </Card>
        <Card title="품질 현황" className="hover:shadow-lg transition-shadow">
          <Text>불량률: 0%</Text>
        </Card>
        <Card title="설비 현황" className="hover:shadow-lg transition-shadow">
          <Text>가동률: 0%</Text>
        </Card>
      </div>
    </div>
  )
}
