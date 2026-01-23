// lib/hooks/index.ts
// 공통 훅 내보내기

// TSK-03-04: 즐겨찾기 훅
export { useFavorites } from './useFavorites'

// TSK-05-04: 테이블 컬럼 훅
export { useTableColumns } from './useTableColumns'
export type { ColumnConfig, UseTableColumnsOptions, UseTableColumnsReturn } from './useTableColumns'

// TSK-05-06: 전역 단축키 훅
export { useGlobalHotkeys, getModifierKey, isMacPlatform, HOTKEY_CATEGORIES } from './useGlobalHotkeys'
export type { HotkeyItem, HotkeyCategory, UseGlobalHotkeysOptions, HotkeyConfig } from './useGlobalHotkeys'

// 홈 화면: 최근 사용 메뉴 훅
export { useRecentMenus } from './useRecentMenus'
export type { RecentMenuItem } from './useRecentMenus'
