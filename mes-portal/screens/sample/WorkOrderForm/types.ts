/**
 * @file types.ts
 * @description 작업 지시 등록 폼 타입 정의
 * @task TSK-06-16
 */

import type { Dayjs } from 'dayjs'

/**
 * 제품 데이터 인터페이스
 */
export interface Product {
  code: string
  name: string
  spec: string
  unit: string
  [key: string]: string
}

/**
 * 생산 라인 인터페이스
 */
export interface ProductionLine {
  id: string
  name: string
}

/**
 * 작업 지시 폼 데이터 인터페이스 (저장용)
 */
export interface WorkOrderFormData {
  productCode: string
  productName: string
  quantity: number
  lineId: string
  startDate: string
  endDate: string
  remarks?: string
}

/**
 * 작업 지시 폼 값 인터페이스 (폼 내부용 - Dayjs 사용)
 */
export interface WorkOrderFormValues {
  productCode: string
  productName: string
  quantity: number | null
  lineId: string
  startDate: Dayjs | null
  endDate: Dayjs | null
  remarks?: string
  [key: string]: string | number | Dayjs | null | undefined
}

/**
 * 작업 지시 폼 컴포넌트 Props
 */
export interface WorkOrderFormProps {
  /** 제품 목록 (외부 주입, 없으면 mock-data 사용) */
  products?: Product[]
  /** 생산 라인 목록 (외부 주입, 없으면 mock-data 사용) */
  productionLines?: ProductionLine[]
  /** 저장 성공 콜백 */
  onSaveSuccess?: (data: WorkOrderFormData) => void
  /** 취소 콜백 */
  onCancel?: () => void
}
