/**
 * 홈 페이지 컴포넌트
 * @description MES 포털 홈 화면 - 카드 형태의 대시보드
 */
'use client'

import { useState, useEffect } from 'react'
import { Typography, theme } from 'antd'
import { RecentMenusCard } from './RecentMenusCard'
import { FavoritesCard } from './FavoritesCard'
import { AnnouncementsCard, type Announcement } from './AnnouncementsCard'
import { KeyMetricsCard } from './KeyMetricsCard'
import { QuickKPISection } from './QuickKPISection'
import { getGlassHeroStyle, useIsDarkMode } from '@/lib/theme/utils'
import type { FavoriteMenuItem } from '@/lib/types/favorites'
import type { RecentMenuItem } from '@/lib/hooks'
import announcementsData from '@/mock-data/announcements.json'
import keyMetricsData from '@/mock-data/keyMetrics.json'

// JSON에서 타입 안전하게 가져오기
const announcements = announcementsData.announcements as Announcement[]

const { Title, Text } = Typography

interface HomePageProps {
  userName?: string
  favoriteMenus: FavoriteMenuItem[]
  isFavoriteLoading?: boolean
  onMenuClick?: (menu: RecentMenuItem | FavoriteMenuItem) => void
  onNavigateToDashboard?: () => void
}

export function HomePage({
  userName = '사용자',
  favoriteMenus,
  isFavoriteLoading,
  onMenuClick,
  onNavigateToDashboard,
}: HomePageProps) {
  const { token } = theme.useToken()
  const isDark = useIsDarkMode()
  const [greeting, setGreeting] = useState('안녕하세요')

  // 인사말 생성 (클라이언트에서만 실행)
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting('좋은 아침입니다')
    } else if (hour < 18) {
      setGreeting('좋은 오후입니다')
    } else {
      setGreeting('좋은 저녁입니다')
    }
  }, [])

  // Hero 섹션 스타일 - Glassmorphism (라이트/다크 테마 호환)
  const heroStyle = getGlassHeroStyle(token, isDark)

  return (
    <div className="space-y-6">
      {/* 인사말 섹션 - Glassmorphism */}
      <div className="p-6" style={heroStyle}>
        <Title level={4} className="m-0" style={{ color: token.colorPrimary }}>
          {greeting}, {userName}님
        </Title>
        <Text type="secondary">
          MES 포털에 오신 것을 환영합니다. 오늘의 업무를 시작하세요.
        </Text>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 24 }}>
        {/* 왼쪽 컬럼: 최근 사용 메뉴 + 즐겨찾기 */}
        <div className="flex flex-col" style={{ gap: 24 }}>
          <RecentMenusCard
            onMenuClick={(menu) => onMenuClick?.(menu)}
          />
          <FavoritesCard
            favoriteMenus={favoriteMenus}
            isLoading={isFavoriteLoading}
            onMenuClick={(menu) => onMenuClick?.(menu)}
          />
        </div>

        {/* 중간 컬럼: 공지사항/업데이트 */}
        <div className="flex flex-col" style={{ gap: 24 }}>
          <AnnouncementsCard
            announcements={announcements}
          />
        </div>

        {/* 오른쪽 컬럼: 대시보드 KPI + 주요 지표 */}
        <div className="flex flex-col" style={{ gap: 24 }}>
          <QuickKPISection
            onNavigateToDashboard={onNavigateToDashboard}
          />
          <KeyMetricsCard
            categories={keyMetricsData.categories}
            lastUpdated={keyMetricsData.lastUpdated}
          />
        </div>
      </div>
    </div>
  )
}
