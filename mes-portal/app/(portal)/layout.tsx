// app/(portal)/layout.tsx
// 포털 라우트 그룹 레이아웃 - PortalLayout 적용
'use client'

import { useState } from 'react'
import { PortalLayout, Header } from '@/components/layout'

export default function PortalGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // 임시 사용자 데이터 (MVP)
  const mockUser = {
    name: '홍길동',
    email: 'admin@mes.com',
  }

  // 임시 브레드크럼 데이터
  const breadcrumbItems = [
    { title: 'Home', path: '/' },
    { title: 'Dashboard' },
  ]

  return (
    <PortalLayout
      header={
        <Header
          user={mockUser}
          breadcrumbItems={breadcrumbItems}
          unreadNotifications={3}
          onSearchOpen={() => setIsSearchOpen(true)}
          onNotificationOpen={() => console.log('Notification opened')}
          onLogout={() => console.log('Logout')}
        />
      }
      sidebar={
        <nav className="p-2">
          <p className="text-gray-400 text-xs p-2">메뉴 영역</p>
        </nav>
      }
      footer="MES Portal © 2026 - All Rights Reserved"
    >
      {children}
      {/* 검색 모달 (TSK-01-05에서 구현 예정) */}
      {isSearchOpen && (
        <div
          data-testid="search-modal"
          className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="검색어를 입력하세요..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoFocus
            />
            <p className="text-sm text-gray-500 mt-2">ESC 키로 닫기</p>
          </div>
        </div>
      )}
    </PortalLayout>
  )
}
