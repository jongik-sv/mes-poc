'use client'

import { DatePicker } from 'antd'
import type { GetProps } from 'antd'
import dayjs, { Dayjs } from '@/lib/dayjs'

const { RangePicker } = DatePicker

type RangePickerProps = GetProps<typeof RangePicker>

const DEFAULT_FORMAT = 'YYYY-MM-DD'
const DEFAULT_PLACEHOLDER: [string, string] = ['시작일', '종료일']

export interface RangePickerFieldProps
  extends Omit<RangePickerProps, 'locale' | 'minDate' | 'maxDate'> {
  minDate?: Dayjs
  maxDate?: Dayjs
  'data-testid'?: string
}

export default function RangePickerField({
  format = DEFAULT_FORMAT,
  placeholder = DEFAULT_PLACEHOLDER,
  allowClear = true,
  minDate,
  maxDate,
  disabledDate,
  'data-testid': dataTestId,
  ...props
}: RangePickerFieldProps) {
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
      <RangePicker
        format={format}
        placeholder={placeholder}
        allowClear={allowClear}
        disabledDate={handleDisabledDate}
        {...props}
      />
    </div>
  )
}
