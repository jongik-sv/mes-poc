// screens/sample/CategoryProduct/types.ts
// 카테고리-제품 마스터-디테일 샘플 화면 타입 정의 (TSK-06-08)

/**
 * 제품 상태
 */
export type ProductStatus = 'active' | 'inactive'

/**
 * 카테고리 인터페이스
 */
export interface Category {
  id: string
  name: string
  icon?: string
  parentId: string | null
  children?: Category[]
}

/**
 * 제품 인터페이스
 */
export interface Product {
  id: string
  categoryId: string
  code: string
  name: string
  spec: string
  unit: string
  price: number
  stock: number
  status: ProductStatus
}

/**
 * 카테고리-제품 Mock 데이터 구조
 */
export interface CategoryProductData {
  categories: Category[]
  products: Product[]
}

/**
 * CategoryProduct 화면 Props
 */
export interface CategoryProductProps {
  /** 마스터/디테일 초기 분할 비율 [마스터%, 디테일%] */
  defaultSplit?: [number, number]
  /** 마스터 패널 최소 너비 (px, 기본: 200) */
  minMasterWidth?: number
  /** 디테일 패널 최소 너비 (px, 기본: 300) */
  minDetailWidth?: number
}

/**
 * 상태별 색상 매핑
 */
export const STATUS_COLORS: Record<ProductStatus, string> = {
  active: 'success',
  inactive: 'error',
}

/**
 * 상태별 라벨 매핑
 */
export const STATUS_LABELS: Record<ProductStatus, string> = {
  active: '활성',
  inactive: '비활성',
}
