/**
 * 최근 사용 메뉴 관리 훅
 * @description 사용자가 최근에 방문한 메뉴를 localStorage에 저장하고 관리
 */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'mes-portal-recent-menus'
const MAX_RECENT_MENUS = 10

export interface RecentMenuItem {
  id: string
  code: string
  name: string
  path: string
  icon?: string
  visitedAt: string
}

interface UseRecentMenusReturn {
  recentMenus: RecentMenuItem[]
  addRecentMenu: (menu: Omit<RecentMenuItem, 'visitedAt'>) => void
  clearRecentMenus: () => void
  isLoading: boolean
}

/**
 * 최근 사용 메뉴 관리 훅
 * @returns 최근 메뉴 목록 및 관리 함수
 */
export function useRecentMenus(): UseRecentMenusReturn {
  const [recentMenus, setRecentMenus] = useState<RecentMenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // localStorage에서 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as RecentMenuItem[]
        setRecentMenus(parsed)
      }
    } catch (err) {
      console.error('Failed to load recent menus:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // localStorage에 저장
  const saveToStorage = useCallback((menus: RecentMenuItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(menus))
    } catch (err) {
      console.error('Failed to save recent menus:', err)
    }
  }, [])

  // 메뉴 추가
  const addRecentMenu = useCallback(
    (menu: Omit<RecentMenuItem, 'visitedAt'>) => {
      setRecentMenus((prev) => {
        // 이미 존재하면 제거 (맨 앞으로 이동시키기 위해)
        const filtered = prev.filter((item) => item.id !== menu.id)

        // 새 메뉴 아이템 생성
        const newItem: RecentMenuItem = {
          ...menu,
          visitedAt: new Date().toISOString(),
        }

        // 맨 앞에 추가하고 최대 개수 제한
        const updated = [newItem, ...filtered].slice(0, MAX_RECENT_MENUS)

        // localStorage에 저장
        saveToStorage(updated)

        return updated
      })
    },
    [saveToStorage]
  )

  // 전체 삭제
  const clearRecentMenus = useCallback(() => {
    setRecentMenus([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // 다중 탭/창 동기화
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue) as RecentMenuItem[]
            setRecentMenus(parsed)
          } catch {
            // ignore
          }
        } else {
          setRecentMenus([])
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return {
    recentMenus,
    addRecentMenu,
    clearRecentMenus,
    isLoading,
  }
}
