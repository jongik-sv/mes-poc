// screens/sample/InventoryDetail/types.ts
// 재고 현황 조회 화면 타입 정의 (TSK-06-15)

/**
 * 재고 상태
 */
export type StockStatus = 'normal' | 'warning' | 'danger'

/**
 * 입출고 유형
 */
export type TransactionType = 'in' | 'out'

/**
 * 품목 정보
 */
export interface InventoryItem {
  id: string
  code: string
  name: string
  category: string
  specification: string
  unit: string
  currentStock: number
  safetyStock: number
  status: StockStatus
  lastInDate: string | null
  lastOutDate: string | null
  warehouse: string
  remarks?: string
}

/**
 * 입출고 거래
 */
export interface InventoryTransaction {
  id: string
  itemId: string
  type: TransactionType
  quantity: number
  date: string
  handler: string
  reference?: string
  remarks?: string
}

/**
 * 재고 추이
 */
export interface InventoryTrend {
  itemId: string
  date: string
  stock: number
}

/**
 * mock-data 전체 구조
 */
export interface InventoryData {
  items: InventoryItem[]
  transactions: InventoryTransaction[]
  trends: InventoryTrend[]
}

/**
 * 재고 상태 Tag 색상 매핑
 */
export const STOCK_STATUS_COLORS: Record<StockStatus, string> = {
  normal: 'success',
  warning: 'warning',
  danger: 'error',
}

/**
 * 재고 상태 Tag 라벨 매핑
 */
export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  normal: '충분',
  warning: '주의',
  danger: '부족',
}

/**
 * 입출고 유형 Tag 색상 매핑
 */
export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  in: 'blue',
  out: 'orange',
}

/**
 * 입출고 유형 Tag 라벨 매핑
 */
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  in: '입고',
  out: '출고',
}

/**
 * ItemSelect Props
 */
export interface ItemSelectProps {
  items: InventoryItem[]
  selectedItemId: string | null
  onSelect: (itemId: string | null) => void
}

/**
 * InventoryDescriptions Props
 */
export interface InventoryDescriptionsProps {
  item: InventoryItem
}

/**
 * TransactionTable Props
 */
export interface TransactionTableProps {
  transactions: InventoryTransaction[]
  itemId: string
}

/**
 * StockTrendChart Props
 */
export interface StockTrendChartProps {
  trends: InventoryTrend[]
  itemId: string
  safetyStock: number
}
