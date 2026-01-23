/**
 * 즐겨찾기 관리 훅 (TSK-03-04)
 * @description 사용자의 즐겨찾기 메뉴를 관리하는 커스텀 훅
 */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { App } from 'antd'
import type { FavoriteData, FavoriteMenuItem } from '@/lib/types/favorites'
import { FAVORITES_CONFIG } from '@/lib/types/favorites'

/**
 * 메뉴 아이템 인터페이스 (API 응답 호환)
 */
interface MenuItem {
  id: string
  code: string
  name: string
  path: string | null
  icon: string | null
  sortOrder: number
  children?: MenuItem[]
}

interface UseFavoritesOptions {
  userId: number
  allMenus: MenuItem[]
}

interface UseFavoritesReturn {
  favoriteIds: string[]
  favoriteMenus: FavoriteMenuItem[]
  isFavorite: (menuId: string) => boolean
  canAddFavorite: () => boolean
  addFavorite: (menuId: string) => void
  removeFavorite: (menuId: string) => void
  toggleFavorite: (menuId: string) => void
  isLoading: boolean
  error: Error | null
}

/**
 * 즐겨찾기 관리 훅
 * @param options - userId와 전체 메뉴 목록
 * @returns 즐겨찾기 상태 및 조작 함수
 */
export function useFavorites({
  userId,
  allMenus,
}: UseFavoritesOptions): UseFavoritesReturn {
  const { message } = App.useApp()
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const storageKey = `${FAVORITES_CONFIG.STORAGE_KEY_PREFIX}${userId}`

  // 리프 메뉴만 추출 (path가 있는 메뉴)
  const leafMenus = useMemo(() => {
    const flatten = (menus: MenuItem[]): MenuItem[] => {
      return menus.flatMap((menu) =>
        menu.children?.length
          ? flatten(menu.children)
          : menu.path
            ? [menu]
            : []
      )
    }
    return flatten(allMenus)
  }, [allMenus])

  // 유효한 즐겨찾기 메뉴 목록
  const favoriteMenus = useMemo<FavoriteMenuItem[]>(() => {
    return favoriteIds
      .map((id) => leafMenus.find((menu) => menu.id === id))
      .filter((menu): menu is MenuItem => menu !== undefined)
      .map((menu) => ({
        id: menu.id,
        code: menu.code,
        name: menu.name,
        path: menu.path as string,
        icon: menu.icon,
      }))
  }, [favoriteIds, leafMenus])

  // localStorage에서 로드
  const loadFavorites = useCallback(() => {
    try {
      setIsLoading(true)
      const stored = localStorage.getItem(storageKey)

      if (stored) {
        const data: FavoriteData = JSON.parse(stored)
        // 유효한 메뉴 ID만 필터링
        const validIds = data.menuIds.filter((id) =>
          leafMenus.some((menu) => menu.id === id)
        )
        setFavoriteIds(validIds)
      } else {
        setFavoriteIds([])
      }
      setError(null)
    } catch (err) {
      console.error('Failed to load favorites:', err)
      setFavoriteIds([])
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [storageKey, leafMenus])

  // localStorage에 저장
  const saveFavorites = useCallback(
    (ids: string[]) => {
      try {
        const data: FavoriteData = {
          userId,
          menuIds: ids,
          updatedAt: new Date().toISOString(),
        }
        localStorage.setItem(storageKey, JSON.stringify(data))
      } catch (err) {
        console.error('Failed to save favorites:', err)
        if (err instanceof Error && err.name === 'QuotaExceededError') {
          message.error('저장 공간이 부족합니다. 일부 즐겨찾기를 삭제해주세요.')
        } else {
          message.error('즐겨찾기 저장에 실패했습니다.')
        }
        throw err
      }
    },
    [userId, storageKey, message]
  )

  // 초기 로드
  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  // 다중 탭/창 동기화
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        loadFavorites()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [storageKey, loadFavorites])

  // 즐겨찾기 여부 확인
  const isFavorite = useCallback(
    (menuId: string) => {
      return favoriteIds.includes(menuId)
    },
    [favoriteIds]
  )

  // 즐겨찾기 추가 가능 여부
  const canAddFavorite = useCallback(() => {
    return favoriteIds.length < FAVORITES_CONFIG.MAX_FAVORITES
  }, [favoriteIds])

  // 즐겨찾기 추가
  const addFavorite = useCallback(
    (menuId: string) => {
      // 이미 즐겨찾기된 경우
      if (favoriteIds.includes(menuId)) {
        return
      }

      // 최대 개수 초과
      if (favoriteIds.length >= FAVORITES_CONFIG.MAX_FAVORITES) {
        message.warning(
          `즐겨찾기는 최대 ${FAVORITES_CONFIG.MAX_FAVORITES}개까지 등록 가능합니다.`
        )
        return
      }

      // 유효한 메뉴인지 확인
      const menu = leafMenus.find((m) => m.id === menuId)
      if (!menu) {
        message.error('유효하지 않은 메뉴입니다.')
        return
      }

      try {
        const newIds = [...favoriteIds, menuId]
        saveFavorites(newIds)
        setFavoriteIds(newIds)
        message.success('즐겨찾기에 추가되었습니다.')
      } catch {
        // saveFavorites에서 에러 처리됨
      }
    },
    [favoriteIds, leafMenus, saveFavorites, message]
  )

  // 즐겨찾기 제거
  const removeFavorite = useCallback(
    (menuId: string) => {
      if (!favoriteIds.includes(menuId)) {
        return
      }

      try {
        const newIds = favoriteIds.filter((id) => id !== menuId)
        saveFavorites(newIds)
        setFavoriteIds(newIds)
        message.success('즐겨찾기에서 제거되었습니다.')
      } catch {
        // saveFavorites에서 에러 처리됨
      }
    },
    [favoriteIds, saveFavorites, message]
  )

  // 즐겨찾기 토글
  const toggleFavorite = useCallback(
    (menuId: string) => {
      if (favoriteIds.includes(menuId)) {
        removeFavorite(menuId)
      } else {
        addFavorite(menuId)
      }
    },
    [favoriteIds, addFavorite, removeFavorite]
  )

  return {
    favoriteIds,
    favoriteMenus,
    isFavorite,
    canAddFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isLoading,
    error,
  }
}
