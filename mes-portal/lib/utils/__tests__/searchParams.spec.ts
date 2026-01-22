// lib/utils/__tests__/searchParams.spec.ts
// searchParams 유틸리티 단위 테스트 (TSK-06-01)

import { describe, it, expect } from 'vitest'
import dayjs from 'dayjs'
import {
  sanitizeSearchValue,
  transformSearchParams,
  getDefaultValues,
} from '../searchParams'
import type { SearchFieldDefinition } from '@/components/templates/ListTemplate/types'

describe('searchParams 유틸리티', () => {
  describe('sanitizeSearchValue', () => {
    it('문자열 앞뒤 공백을 제거한다', () => {
      const result = sanitizeSearchValue('  테스트  ', 'text')
      expect(result).toBe('테스트')
    })

    it('빈 문자열은 undefined를 반환한다', () => {
      const result = sanitizeSearchValue('   ', 'text')
      expect(result).toBeUndefined()
    })

    it('문자열을 최대 100자로 제한한다', () => {
      const longString = 'a'.repeat(150)
      const result = sanitizeSearchValue(longString, 'text')
      expect(result).toHaveLength(100)
    })

    it('제어 문자를 제거한다', () => {
      const withControlChars = 'test\x00\x1F\x7Fvalue'
      const result = sanitizeSearchValue(withControlChars, 'text')
      expect(result).toBe('testvalue')
    })

    it('null은 undefined를 반환한다', () => {
      const result = sanitizeSearchValue(null, 'text')
      expect(result).toBeUndefined()
    })

    it('undefined는 undefined를 반환한다', () => {
      const result = sanitizeSearchValue(undefined, 'text')
      expect(result).toBeUndefined()
    })

    it('유효한 숫자는 그대로 반환한다', () => {
      const result = sanitizeSearchValue(42, 'number')
      expect(result).toBe(42)
    })

    it('Infinity는 undefined를 반환한다', () => {
      const result = sanitizeSearchValue(Infinity, 'number')
      expect(result).toBeUndefined()
    })

    it('NaN은 undefined를 반환한다', () => {
      const result = sanitizeSearchValue(NaN, 'number')
      expect(result).toBeUndefined()
    })
  })

  describe('transformSearchParams', () => {
    it('빈 값은 API 파라미터에서 제외된다 (UT-009)', () => {
      const fields: SearchFieldDefinition[] = [
        { name: 'name', label: '이름', type: 'text' },
        { name: 'status', label: '상태', type: 'select' },
        { name: 'type', label: '유형', type: 'text' },
      ]
      const values = {
        name: '테스트',
        status: '',
        type: null,
      }

      const result = transformSearchParams(values, fields)

      expect(result).toEqual({ name: '테스트' })
      expect(result).not.toHaveProperty('status')
      expect(result).not.toHaveProperty('type')
    })

    it('문자열 값이 trim 된다', () => {
      const fields: SearchFieldDefinition[] = [
        { name: 'name', label: '이름', type: 'text' },
      ]
      const values = { name: '  테스트  ' }

      const result = transformSearchParams(values, fields)

      expect(result.name).toBe('테스트')
    })

    it('select 타입은 값을 그대로 전달한다', () => {
      const fields: SearchFieldDefinition[] = [
        { name: 'status', label: '상태', type: 'select' },
      ]
      const values = { status: 'ACTIVE' }

      const result = transformSearchParams(values, fields)

      expect(result).toEqual({ status: 'ACTIVE' })
    })

    it('multiSelect 타입은 콤마 구분 문자열로 변환한다', () => {
      const fields: SearchFieldDefinition[] = [
        { name: 'types', label: '유형', type: 'multiSelect' },
      ]
      const values = { types: ['TYPE_A', 'TYPE_B', 'TYPE_C'] }

      const result = transformSearchParams(values, fields)

      expect(result).toEqual({ types: 'TYPE_A,TYPE_B,TYPE_C' })
    })

    it('빈 배열은 제외된다', () => {
      const fields: SearchFieldDefinition[] = [
        { name: 'types', label: '유형', type: 'multiSelect' },
      ]
      const values = { types: [] }

      const result = transformSearchParams(values, fields)

      expect(result).not.toHaveProperty('types')
    })

    it('date 타입은 YYYY-MM-DD 형식으로 변환한다', () => {
      const fields: SearchFieldDefinition[] = [
        { name: 'date', label: '날짜', type: 'date' },
      ]
      const values = { date: dayjs('2026-01-15') }

      const result = transformSearchParams(values, fields)

      expect(result).toEqual({ date: '2026-01-15' })
    })

    it('dateRange 타입은 시작일/종료일로 분리한다', () => {
      const fields: SearchFieldDefinition[] = [
        {
          name: 'dateRange',
          label: '기간',
          type: 'dateRange',
          startParamName: 'startDate',
          endParamName: 'endDate',
        },
      ]
      const values = {
        dateRange: [dayjs('2026-01-01'), dayjs('2026-01-31')],
      }

      const result = transformSearchParams(values, fields)

      expect(result).toEqual({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      })
    })

    it('dateRange의 기본 파라미터명은 startDate/endDate이다', () => {
      const fields: SearchFieldDefinition[] = [
        { name: 'period', label: '기간', type: 'dateRange' },
      ]
      const values = {
        period: [dayjs('2026-01-01'), dayjs('2026-01-31')],
      }

      const result = transformSearchParams(values, fields)

      expect(result).toEqual({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      })
    })

    it('number 타입은 숫자 그대로 전달한다', () => {
      const fields: SearchFieldDefinition[] = [
        { name: 'quantity', label: '수량', type: 'number' },
      ]
      const values = { quantity: 100 }

      const result = transformSearchParams(values, fields)

      expect(result).toEqual({ quantity: 100 })
    })

    it('checkbox 타입은 boolean 값을 전달한다', () => {
      const fields: SearchFieldDefinition[] = [
        { name: 'isActive', label: '활성', type: 'checkbox' },
      ]
      const values = { isActive: true }

      const result = transformSearchParams(values, fields)

      expect(result).toEqual({ isActive: true })
    })

    it('paramName이 지정되면 해당 이름으로 전달한다', () => {
      const fields: SearchFieldDefinition[] = [
        { name: 'userName', label: '사용자', type: 'text', paramName: 'user_name' },
      ]
      const values = { userName: '홍길동' }

      const result = transformSearchParams(values, fields)

      expect(result).toEqual({ user_name: '홍길동' })
    })

    it('transformValue 함수가 있으면 사용한다', () => {
      const fields: SearchFieldDefinition[] = [
        {
          name: 'price',
          label: '가격',
          type: 'number',
          transformValue: (value) => (value as number) * 100,
        },
      ]
      const values = { price: 50 }

      const result = transformSearchParams(values, fields)

      expect(result).toEqual({ price: 5000 })
    })

    it('transformValue가 undefined를 반환하면 제외된다', () => {
      const fields: SearchFieldDefinition[] = [
        {
          name: 'value',
          label: '값',
          type: 'text',
          transformValue: () => undefined,
        },
      ]
      const values = { value: 'test' }

      const result = transformSearchParams(values, fields)

      expect(result).not.toHaveProperty('value')
    })
  })

  describe('getDefaultValues', () => {
    it('defaultValue가 지정되면 해당 값을 사용한다', () => {
      const fields: SearchFieldDefinition[] = [
        { name: 'name', label: '이름', type: 'text', defaultValue: '기본값' },
        { name: 'status', label: '상태', type: 'select', defaultValue: 'ACTIVE' },
      ]

      const result = getDefaultValues(fields)

      expect(result).toEqual({
        name: '기본값',
        status: 'ACTIVE',
      })
    })

    it('checkbox 타입의 기본값은 false이다', () => {
      const fields: SearchFieldDefinition[] = [
        { name: 'isActive', label: '활성', type: 'checkbox' },
      ]

      const result = getDefaultValues(fields)

      expect(result).toEqual({ isActive: false })
    })

    it('multiSelect 타입의 기본값은 빈 배열이다', () => {
      const fields: SearchFieldDefinition[] = [
        { name: 'types', label: '유형', type: 'multiSelect' },
      ]

      const result = getDefaultValues(fields)

      expect(result).toEqual({ types: [] })
    })

    it('기타 타입의 기본값은 undefined이다', () => {
      const fields: SearchFieldDefinition[] = [
        { name: 'name', label: '이름', type: 'text' },
        { name: 'count', label: '개수', type: 'number' },
      ]

      const result = getDefaultValues(fields)

      expect(result).toEqual({
        name: undefined,
        count: undefined,
      })
    })
  })
})
