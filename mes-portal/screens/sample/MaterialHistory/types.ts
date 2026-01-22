// screens/sample/MaterialHistory/types.ts
// 자재 입출고 내역 샘플 화면 타입 정의 (TSK-06-17)

/**
 * 입출고 유형
 */
export type TransactionType = 'in' | 'out'

/**
 * 자재 입출고 내역 인터페이스
 */
export interface MaterialHistory {
  [key: string]: unknown
  id: string
  materialName: string
  materialCode: string
  transactionType: TransactionType
  quantity: number
  unit: string
  transactionDate: string
  warehouse: string
  handler: string
  remark?: string
  createdAt: string
}

/**
 * 검색 파라미터 인터페이스
 */
export interface MaterialHistorySearchParams {
  materialName?: string
  transactionType?: TransactionType | ''
  dateRange?: [string, string] | null
}

/**
 * 입출고유형별 색상 매핑
 */
export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  in: 'success',
  out: 'error',
}

/**
 * 입출고유형별 라벨 매핑
 */
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  in: '입고',
  out: '출고',
}
