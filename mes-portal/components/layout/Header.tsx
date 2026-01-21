// components/layout/Header.tsx
// MES Portal 헤더 컴포넌트
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Dropdown, Avatar, Badge, Breadcrumb } from 'antd'
import type { MenuProps } from 'antd'
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons'
import { useTheme } from 'next-themes'
import { useHotkeys } from 'react-hotkeys-hook'
import Link from 'next/link'
import { NotificationPanel, Notification, QuickMenu } from '@/components/common'
import type { FavoriteMenuItem } from '@/lib/types/favorites'

interface BreadcrumbItem {
  title: string
  path?: string
}

interface HeaderUser {
  name: string
  email: string
  avatar?: string
}

interface HeaderProps {
  user?: HeaderUser
  breadcrumbItems?: BreadcrumbItem[]
  notifications?: Notification[]
  onSearchOpen?: () => void
  onNotificationNavigate?: (link: string, title: string) => void
  onLogout?: () => void
  /** 즐겨찾기 메뉴 목록 (TSK-03-04) */
  favoriteMenus?: FavoriteMenuItem[]
  /** 즐겨찾기 메뉴 클릭 콜백 (TSK-03-04) */
  onFavoriteMenuClick?: (menu: FavoriteMenuItem) => void
  /** 즐겨찾기 로딩 상태 (TSK-03-04) */
  isFavoriteLoading?: boolean
}

export function Header({
  user,
  breadcrumbItems = [],
  notifications = [],
  onSearchOpen,
  onNotificationNavigate,
  onLogout,
  favoriteMenus = [],
  onFavoriteMenuClick,
  isFavoriteLoading = false,
}: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [currentTime, setCurrentTime] = useState('')
  const [mounted, setMounted] = useState(false)
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)
  const [localNotifications, setLocalNotifications] =
    useState<Notification[]>(notifications)
  const notificationRef = useRef<HTMLDivElement>(null)

  // notifications prop이 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setLocalNotifications(notifications)
  }, [notifications])

  // 읽지 않은 알림 개수 계산
  const unreadNotifications = localNotifications.filter((n) => !n.isRead).length

  // 마운트 상태 확인 (SSR 호환)
  useEffect(() => {
    setMounted(true)
  }, [])

  // 시계 갱신 (1초마다)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // 알림 패널 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationPanelOpen(false)
      }
    }

    if (notificationPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notificationPanelOpen])

  // ESC 키로 알림 패널 닫기
  useHotkeys(
    'escape',
    () => {
      if (notificationPanelOpen) {
        setNotificationPanelOpen(false)
      }
    },
    { enableOnFormTags: true }
  )

  // Ctrl+K 단축키
  useHotkeys(
    'ctrl+k, meta+k',
    (e) => {
      e.preventDefault()
      onSearchOpen?.()
    },
    { enableOnFormTags: false }
  )

  // 테마 토글
  const toggleTheme = () => {
    const currentTheme = resolvedTheme || theme
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  // 현재 테마 (SSR 호환)
  const isDark = mounted && (resolvedTheme || theme) === 'dark'

  // 알림 패널 토글
  const handleNotificationToggle = useCallback(() => {
    setNotificationPanelOpen((prev) => !prev)
  }, [])

  // 알림 읽음 처리
  const handleMarkAsRead = useCallback((id: string) => {
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }, [])

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = useCallback(() => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [])

  // 알림 클릭 시 화면 이동
  const handleNotificationNavigate = useCallback(
    (link: string, title: string) => {
      onNotificationNavigate?.(link, title)
      setNotificationPanelOpen(false)
    },
    [onNotificationNavigate]
  )

  // 즐겨찾기 메뉴 클릭 핸들러
  const handleFavoriteMenuClick = useCallback(
    (menu: FavoriteMenuItem) => {
      onFavoriteMenuClick?.(menu)
    },
    [onFavoriteMenuClick]
  )

  // 프로필 드롭다운 메뉴
  const profileMenuItems: MenuProps['items'] = [
    {
      key: 'info',
      icon: <UserOutlined />,
      label: '내 정보',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '설정',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      danger: true,
      onClick: onLogout,
    },
  ]

  // 브레드크럼 아이템 변환
  const breadcrumbAntdItems = breadcrumbItems.map((item) => ({
    title: item.path ? <Link href={item.path}>{item.title}</Link> : item.title,
  }))

  return (
    <div className="flex items-center justify-between w-full h-full">
      {/* 좌측 영역 */}
      <div className="flex items-center gap-4">
        {/* 로고 */}
        <Link
          href="/"
          data-testid="header-logo"
          className="flex items-center text-xl font-bold text-blue-500 hover:text-blue-600 transition-colors"
        >
          MES Portal
        </Link>

        {/* 빠른 메뉴 (즐겨찾기) - TSK-03-04 */}
        <QuickMenu
          favoriteMenus={favoriteMenus}
          onMenuClick={handleFavoriteMenuClick}
          isLoading={isFavoriteLoading}
        />

        {/* 구분선 */}
        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />

        {/* 브레드크럼 */}
        <div data-testid="header-breadcrumb" className="hidden md:flex">
          <Breadcrumb items={breadcrumbAntdItems} />
        </div>
      </div>

      {/* 우측 영역 */}
      <div className="flex items-center gap-3">
        {/* 시계 */}
        <span
          className="hidden sm:block text-sm tabular-nums text-gray-600 dark:text-gray-400"
          data-testid="header-clock"
        >
          {currentTime}
        </span>

        {/* 구분선 */}
        <div className="hidden sm:block h-5 w-px bg-gray-200 dark:bg-gray-700" />

        {/* 검색 */}
        <Button
          type="text"
          icon={<SearchOutlined />}
          onClick={onSearchOpen}
          title="검색 (Ctrl+K)"
          aria-label="전역 검색 (Ctrl+K)"
          data-testid="search-button"
        />

        {/* 알림 */}
        <div ref={notificationRef} className="relative">
          <Badge count={unreadNotifications} size="small" overflowCount={99}>
            <Button
              type="text"
              icon={<BellOutlined />}
              onClick={handleNotificationToggle}
              aria-label={`알림 ${unreadNotifications}개`}
              data-testid="notification-button"
            />
          </Badge>
          <NotificationPanel
            open={notificationPanelOpen}
            notifications={localNotifications}
            onClose={() => setNotificationPanelOpen(false)}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onNavigate={handleNotificationNavigate}
          />
        </div>

        {/* 테마 전환 */}
        <Button
          type="text"
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          title={isDark ? '라이트 모드' : '다크 모드'}
          aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          data-testid="theme-toggle"
        />

        {/* 프로필 */}
        <Dropdown
          menu={{ items: profileMenuItems }}
          trigger={['click']}
          data-testid="profile-dropdown"
        >
          <div
            className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            data-testid="profile-dropdown"
          >
            <Avatar
              src={user?.avatar}
              icon={!user?.avatar && <UserOutlined />}
              size="small"
            />
            <span className="hidden md:inline text-sm text-gray-700 dark:text-gray-300">
              {user?.name}
            </span>
          </div>
        </Dropdown>
      </div>
    </div>
  )
}
