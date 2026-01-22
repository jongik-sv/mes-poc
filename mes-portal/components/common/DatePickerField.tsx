'use client'

import { DatePicker } from 'antd'
import type { DatePickerProps } from 'antd'
import dayjs, { Dayjs } from '@/lib/dayjs'

const DEFAULT_FORMAT = 'YYYY-MM-DD'
const DEFAULT_PLACEHOLDER = '날짜 선택'

export interface DatePickerFieldProps
  extends Omit<DatePickerProps, 'locale' | 'minDate' | 'maxDate'> {
  minDate?: Dayjs
  maxDate?: Dayjs
  'data-testid'?: string
}

export default function DatePickerField({
  format = DEFAULT_FORMAT,
  placeholder = DEFAULT_PLACEHOLDER,
  allowClear = true,
  minDate,
  maxDate,
  disabledDate,
  'data-testid': dataTestId,
  ...props
}: DatePickerFieldProps) {
  const handleDisabledDate = (current: Dayjs): boolean => {
    if (disabledDate?.(current)) {
      return true
    }

    if (minDate && current.isBefore(minDate, 'day')) {
      return true
    }

    if (maxDate && current.isAfter(maxDate, 'day')) {
      return true
    }

    return false
  }

  return (
    <div data-testid={dataTestId}>
      <DatePicker
        format={format}
        placeholder={placeholder}
        allowClear={allowClear}
        disabledDate={handleDisabledDate}
        {...props}
      />
    </div>
  )
}
