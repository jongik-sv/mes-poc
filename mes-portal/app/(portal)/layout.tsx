// app/(portal)/layout.tsx
// 포털 라우트 그룹 레이아웃 - PortalLayout 적용

import { PortalLayout } from '@/components/layout'

export default function PortalGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PortalLayout
      header={
        <div className="flex items-center justify-between w-full">
          <span className="text-lg font-semibold">MES Portal</span>
          <span className="text-sm text-gray-500">v0.1.0</span>
        </div>
      }
      sidebar={
        <nav className="p-2">
          <p className="text-gray-400 text-xs p-2">메뉴 영역</p>
        </nav>
      }
      footer="MES Portal © 2026 - All Rights Reserved"
    >
      {children}
    </PortalLayout>
  )
}
