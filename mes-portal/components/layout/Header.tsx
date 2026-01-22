// components/layout/Header.tsx
// MES Portal 헤더 컴포넌트 - Enterprise Design
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Dropdown, Avatar, Badge, Breadcrumb, Tooltip } from 'antd'
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
  favoriteMenus?: FavoriteMenuItem[]
  onFavoriteMenuClick?: (menu: FavoriteMenuItem) => void
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

  useEffect(() => {
    setLocalNotifications(notifications)
  }, [notifications])

  const unreadNotifications = localNotifications.filter((n) => !n.isRead).length

  useEffect(() => {
    setMounted(true)
  }, [])

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

  useHotkeys(
    'escape',
    () => {
      if (notificationPanelOpen) {
        setNotificationPanelOpen(false)
      }
    },
    { enableOnFormTags: true }
  )

  useHotkeys(
    'ctrl+k, meta+k',
    (e) => {
      e.preventDefault()
      onSearchOpen?.()
    },
    { enableOnFormTags: false }
  )

  const toggleTheme = () => {
    const currentTheme = resolvedTheme || theme
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  const isDark = mounted && (resolvedTheme || theme) === 'dark'

  const handleNotificationToggle = useCallback(() => {
    setNotificationPanelOpen((prev) => !prev)
  }, [])

  const handleMarkAsRead = useCallback((id: string) => {
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }, [])

  const handleMarkAllAsRead = useCallback(() => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [])

  const handleNotificationNavigate = useCallback(
    (link: string, title: string) => {
      onNotificationNavigate?.(link, title)
      setNotificationPanelOpen(false)
    },
    [onNotificationNavigate]
  )

  const handleFavoriteMenuClick = useCallback(
    (menu: FavoriteMenuItem) => {
      onFavoriteMenuClick?.(menu)
    },
    [onFavoriteMenuClick]
  )

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

  const breadcrumbAntdItems = breadcrumbItems.map((item) => ({
    title: item.path ? <Link href={item.path}>{item.title}</Link> : item.title,
  }))

  return (
    <div className="flex items-center justify-between w-full h-full">
      {/* 좌측 영역 */}
      <div className="flex items-center gap-3">
        {/* 로고 */}
        <Link
          href="/"
          data-testid="header-logo"
          className="flex items-center gap-2 text-lg font-semibold transition-colors duration-200"
          style={{ color: 'var(--color-primary)' }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="6" fill="currentColor" />
            <path
              d="M8 10h4v12H8V10zm6 4h4v8h-4v-8zm6-2h4v10h-4V12z"
              fill="white"
            />
          </svg>
          <span className="hidden sm:inline">MES Portal</span>
        </Link>

        {/* 빠른 메뉴 (즐겨찾기) */}
        <QuickMenu
          favoriteMenus={favoriteMenus}
          onMenuClick={handleFavoriteMenuClick}
          isLoading={isFavoriteLoading}
        />

        {/* 구분선 */}
        <div
          className="hidden md:block h-5 w-px"
          style={{ backgroundColor: 'var(--color-gray-200)' }}
        />

        {/* 브레드크럼 */}
        <div data-testid="header-breadcrumb" className="hidden md:flex">
          <Breadcrumb items={breadcrumbAntdItems} />
        </div>
      </div>

      {/* 우측 영역 */}
      <div className="flex items-center gap-1">
        {/* 시계 */}
        <div
          className="hidden sm:flex items-center px-3 py-1.5 rounded-md mr-2"
          style={{ backgroundColor: 'var(--color-gray-100)' }}
        >
          <span
            className="text-sm tabular-nums font-medium"
            style={{ color: 'var(--color-gray-600)' }}
            data-testid="header-clock"
          >
            {currentTime}
          </span>
        </div>

        {/* 검색 */}
        <Tooltip title="검색 (Ctrl+K)">
          <Button
            type="text"
            icon={<SearchOutlined style={{ fontSize: 16 }} />}
            onClick={onSearchOpen}
            aria-label="전역 검색 (Ctrl+K)"
            data-testid="search-button"
            className="cursor-pointer"
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Tooltip>

        {/* 알림 */}
        <div ref={notificationRef} className="relative">
          <Tooltip title={`알림 ${unreadNotifications}개`}>
            <Badge count={unreadNotifications} size="small" overflowCount={99}>
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 16 }} />}
                onClick={handleNotificationToggle}
                aria-label={`알림 ${unreadNotifications}개`}
                data-testid="notification-button"
                className="cursor-pointer"
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            </Badge>
          </Tooltip>
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
        <Tooltip title={isDark ? '라이트 모드' : '다크 모드'}>
          <Button
            type="text"
            icon={isDark ? <SunOutlined style={{ fontSize: 16 }} /> : <MoonOutlined style={{ fontSize: 16 }} />}
            onClick={toggleTheme}
            aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
            data-testid="theme-toggle"
            className="cursor-pointer"
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Tooltip>

        {/* 구분선 */}
        <div
          className="h-5 w-px mx-2"
          style={{ backgroundColor: 'var(--color-gray-200)' }}
        />

        {/* 프로필 */}
        <Dropdown
          menu={{ items: profileMenuItems }}
          trigger={['click']}
          data-testid="profile-dropdown"
        >
          <div
            className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md transition-colors duration-200"
            data-testid="profile-dropdown"
            style={{
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Avatar
              src={user?.avatar}
              icon={!user?.avatar && <UserOutlined />}
              size={32}
              style={{
                backgroundColor: 'var(--color-primary)',
                flexShrink: 0,
              }}
            />
            <div className="hidden md:flex flex-col items-start">
              <span
                className="text-sm font-medium leading-tight"
                style={{ color: 'var(--color-gray-900)' }}
              >
                {user?.name}
              </span>
              <span
                className="text-xs leading-tight"
                style={{ color: 'var(--color-gray-500)' }}
              >
                관리자
              </span>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  )
}
