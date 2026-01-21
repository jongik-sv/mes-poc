// components/layout/Header.tsx
// MES Portal 헤더 컴포넌트
'use client'

import { useState, useEffect } from 'react'
import { Button, Dropdown, Avatar, Badge, Breadcrumb } from 'antd'
import type { MenuProps } from 'antd'
import {
  StarOutlined,
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
  unreadNotifications?: number
  onSearchOpen?: () => void
  onNotificationOpen?: () => void
  onLogout?: () => void
}

export function Header({
  user,
  breadcrumbItems = [],
  unreadNotifications = 0,
  onSearchOpen,
  onNotificationOpen,
  onLogout,
}: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [currentTime, setCurrentTime] = useState('')
  const [mounted, setMounted] = useState(false)

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

  // 빠른 메뉴 (즐겨찾기) - 빈 상태
  const quickMenuItems: MenuProps['items'] = []

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

        {/* 빠른 메뉴 */}
        <Dropdown menu={{ items: quickMenuItems }} trigger={['click']}>
          <Button
            type="text"
            icon={<StarOutlined />}
            data-testid="quick-menu-button"
          />
        </Dropdown>

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
        <Badge count={unreadNotifications} size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            onClick={onNotificationOpen}
            aria-label={`알림 ${unreadNotifications}개`}
            data-testid="notification-button"
          />
        </Badge>

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
