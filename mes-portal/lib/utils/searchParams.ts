// lib/utils/searchParams.ts
// 검색 조건 -> API 파라미터 변환 유틸리티 (TSK-06-01)

import type { Dayjs } from 'dayjs'
import type { SearchFieldDefinition, SearchFieldType } from '@/components/templates/ListTemplate/types'

/**
 * 입력값 최대 길이 (SEC-002)
 */
const MAX_SEARCH_LENGTH = 100

/**
 * 입력값 Sanitization (SEC-002)
 * - 문자열: trim, 최대 길이 제한, 제어 문자 제거
 * - 숫자: 유한 숫자 확인
 */
export function sanitizeSearchValue(
  value: unknown,
  fieldType: SearchFieldType
): unknown {
  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value === 'string') {
    let sanitized = value.trim()
    // 최대 길이 제한
    sanitized = sanitized.substring(0, MAX_SEARCH_LENGTH)
    // 특수 제어 문자 제거 (ASCII 0-31, 127)
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')
    return sanitized || undefined
  }

  // 숫자 타입 검증
  if (fieldType === 'number' && typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return undefined
    }
  }

  return value
}

/**
 * Dayjs 객체인지 확인
 */
function isDayjs(value: unknown): value is Dayjs {
  return (
    value !== null &&
    typeof value === 'object' &&
    'format' in (value as object) &&
    typeof (value as Dayjs).format === 'function'
  )
}

/**
 * 검색 조건 -> API 파라미터 변환
 *
 * @param values - 폼 값
 * @param fields - 검색 필드 정의
 * @returns API 요청 파라미터
 *
 * @example
 * ```ts
 * const params = transformSearchParams(
 *   { name: '홍길동', status: 'ACTIVE', dateRange: [dayjs(), dayjs()] },
 *   [
 *     { name: 'name', label: '이름', type: 'text' },
 *     { name: 'status', label: '상태', type: 'select' },
 *     { name: 'dateRange', label: '기간', type: 'dateRange', startParamName: 'startDate', endParamName: 'endDate' }
 *   ]
 * )
 * // { name: '홍길동', status: 'ACTIVE', startDate: '2026-01-01', endDate: '2026-01-21' }
 * ```
 */
export function transformSearchParams(
  values: Record<string, unknown>,
  fields: SearchFieldDefinition[]
): Record<string, unknown> {
  const params: Record<string, unknown> = {}

  for (const field of fields) {
    let value = values[field.name]

    // 빈 값은 건너뜀
    if (value === undefined || value === null || value === '') {
      continue
    }

    // 빈 배열 건너뜀
    if (Array.isArray(value) && value.length === 0) {
      continue
    }

    // 입력값 Sanitization 적용 (SEC-002)
    value = sanitizeSearchValue(value, field.type)
    if (value === undefined) {
      continue
    }

    // 커스텀 변환 함수가 있으면 사용
    if (field.transformValue) {
      const transformed = field.transformValue(value)
      if (transformed !== undefined) {
        params[field.paramName || field.name] = transformed
      }
      continue
    }

    // 타입별 기본 변환
    switch (field.type) {
      case 'dateRange':
        // 날짜 범위 -> 시작일/종료일 분리
        if (Array.isArray(value) && value.length === 2) {
          const [startDate, endDate] = value
          if (isDayjs(startDate)) {
            params[field.startParamName || 'startDate'] = startDate.format('YYYY-MM-DD')
          }
          if (isDayjs(endDate)) {
            params[field.endParamName || 'endDate'] = endDate.format('YYYY-MM-DD')
          }
        }
        break

      case 'date':
        // 단일 날짜 -> 문자열 변환
        if (isDayjs(value)) {
          params[field.paramName || field.name] = value.format('YYYY-MM-DD')
        }
        break

      case 'multiSelect':
        // 다중 선택 -> 콤마 구분 문자열
        if (Array.isArray(value) && value.length > 0) {
          params[field.paramName || field.name] = value.join(',')
        }
        break

      case 'checkbox':
        // 체크박스 -> boolean
        if (typeof value === 'boolean') {
          params[field.paramName || field.name] = value
        }
        break

      default:
        // 기본: 그대로 전달
        params[field.paramName || field.name] = value
    }
  }

  return params
}

/**
 * 검색 필드 기본값 생성
 *
 * @param fields - 검색 필드 정의
 * @returns 기본값 객체
 */
export function getDefaultValues(
  fields: SearchFieldDefinition[]
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {}

  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      defaults[field.name] = field.defaultValue
    } else {
      // 타입별 기본값
      switch (field.type) {
        case 'checkbox':
          defaults[field.name] = false
          break
        case 'multiSelect':
          defaults[field.name] = []
          break
        default:
          defaults[field.name] = undefined
      }
    }
  }

  return defaults
}
