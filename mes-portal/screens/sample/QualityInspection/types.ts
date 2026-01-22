// screens/sample/QualityInspection/types.ts
// 품질 검사 입력 폼 타입 정의 (TSK-06-12)

import type { Dayjs } from 'dayjs'
import type { UploadFile } from 'antd'

/**
 * 검사 유형
 */
export type InspectionType = 'dimension' | 'appearance' | 'function'

/**
 * 판정 결과
 */
export type InspectionResult = 'pass' | 'fail'

/**
 * 치수 검사 항목
 */
export interface DimensionItem {
  position: string        // 측정위치
  standardValue: number   // 기준값(mm)
  tolerance: string       // 허용오차 (예: ±0.5)
  measuredValue: number   // 측정값(mm)
  result?: InspectionResult // 자동 계산 판정
}

/**
 * 외관 검사 항목
 */
export interface AppearanceItem {
  area: string                // 검사부위
  checkItem: string           // 검사항목
  result: InspectionResult    // 검사결과
  // 조건부 (불합격 시)
  defectType?: string         // 불량유형
  defectReason?: string       // 불량사유
  action?: string             // 조치사항
}

/**
 * 기능 검사 항목
 */
export interface FunctionItem {
  testItem: string            // 테스트항목
  testCondition: string       // 테스트조건
  testResult: InspectionResult // 테스트결과
  measuredValue?: string      // 측정값
  // 조건부 (불합격 시)
  defectType?: string
  defectReason?: string
  action?: string
}

/**
 * 품질 검사 폼 데이터
 */
export interface QualityInspectionFormData {
  // 기본 정보
  inspectionType: InspectionType
  productCode: string
  lotNumber: string
  inspectionDate: Dayjs | null

  // 검사 항목 (Form.List)
  dimensionItems?: DimensionItem[]
  appearanceItems?: AppearanceItem[]
  functionItems?: FunctionItem[]

  // 첨부 이미지
  images?: UploadFile[]

  // 비고
  remarks?: string
}

/**
 * 불량 유형 옵션
 */
export interface DefectTypeOption {
  value: string
  label: string
}

/**
 * 검사 부위 옵션
 */
export interface InspectionAreaOption {
  value: string
  label: string
}

/**
 * 검사 항목 옵션
 */
export interface CheckItemOption {
  value: string
  label: string
}

/**
 * Mock 데이터 타입
 */
export interface QualityInspectionMockData {
  defectTypes: DefectTypeOption[]
  inspectionAreas: InspectionAreaOption[]
  checkItems: CheckItemOption[]
}

/**
 * 검사 유형 옵션
 */
export const INSPECTION_TYPE_OPTIONS = [
  { label: '치수 검사', value: 'dimension' as InspectionType },
  { label: '외관 검사', value: 'appearance' as InspectionType },
  { label: '기능 검사', value: 'function' as InspectionType },
]

/**
 * 검사 항목 최소/최대 개수
 */
export const INSPECTION_ITEM_LIMITS = {
  MIN: 1,
  MAX: 10,
}

/**
 * 이미지 업로드 제한
 */
export const IMAGE_UPLOAD_LIMITS = {
  MAX_COUNT: 5,
  MAX_SIZE_MB: 5,
  ACCEPT_TYPES: ['image/jpeg', 'image/png'],
}
