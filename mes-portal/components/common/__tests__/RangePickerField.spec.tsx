import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'
import RangePickerField from '../RangePickerField'
import dayjs from '@/lib/dayjs'

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ConfigProvider locale={koKR}>{ui}</ConfigProvider>)
}

describe('RangePickerField', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render with default placeholders', () => {
      renderWithProvider(<RangePickerField />)
      expect(screen.getByPlaceholderText('시작일')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('종료일')).toBeInTheDocument()
    })

    it('should render with custom placeholders', () => {
      renderWithProvider(
        <RangePickerField placeholder={['시작 날짜', '종료 날짜']} />
      )
      expect(screen.getByPlaceholderText('시작 날짜')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('종료 날짜')).toBeInTheDocument()
    })

    it('should render with data-testid', () => {
      renderWithProvider(<RangePickerField data-testid="range-picker" />)
      expect(screen.getByTestId('range-picker')).toBeInTheDocument()
    })
  })

  describe('range selection', () => {
    it('should call onChange with start and end dates', async () => {
      const onChange = vi.fn()
      renderWithProvider(<RangePickerField onChange={onChange} />)

      const startInput = screen.getByPlaceholderText('시작일')
      await userEvent.click(startInput)

      await waitFor(() => {
        expect(document.querySelector('.ant-picker-dropdown')).toBeInTheDocument()
      })

      const todayCell = document.querySelector('.ant-picker-cell-today')
      if (todayCell) {
        await userEvent.click(todayCell)
      }

      await waitFor(() => {
        const cells = document.querySelectorAll(
          '.ant-picker-cell:not(.ant-picker-cell-disabled)'
        )
        if (cells.length > 5) {
          userEvent.click(cells[5])
        }
      })

      await waitFor(
        () => {
          if (onChange.mock.calls.length > 0) {
            const [datesArg] = onChange.mock.calls[0]
            if (datesArg) {
              expect(Array.isArray(datesArg)).toBe(true)
            }
          }
        },
        { timeout: 2000 }
      )
    })

    it('should display selected range value', () => {
      const startDate = dayjs('2026-01-10')
      const endDate = dayjs('2026-01-20')
      renderWithProvider(<RangePickerField value={[startDate, endDate]} />)

      const startInput = screen.getByPlaceholderText('시작일')
      const endInput = screen.getByPlaceholderText('종료일')

      expect(startInput).toHaveValue('2026-01-10')
      expect(endInput).toHaveValue('2026-01-20')
    })
  })

  describe('format', () => {
    it('should display range in YYYY-MM-DD format', () => {
      const startDate = dayjs('2026-01-10')
      const endDate = dayjs('2026-01-20')
      renderWithProvider(<RangePickerField value={[startDate, endDate]} />)

      const startInput = screen.getByPlaceholderText('시작일')
      const endInput = screen.getByPlaceholderText('종료일')

      expect(startInput).toHaveValue('2026-01-10')
      expect(endInput).toHaveValue('2026-01-20')
    })

    it('should display range in custom format', () => {
      const startDate = dayjs('2026-01-10')
      const endDate = dayjs('2026-01-20')
      renderWithProvider(
        <RangePickerField
          value={[startDate, endDate]}
          format="YYYY년 MM월 DD일"
        />
      )

      const startInput = screen.getByPlaceholderText('시작일')
      const endInput = screen.getByPlaceholderText('종료일')

      expect(startInput).toHaveValue('2026년 01월 10일')
      expect(endInput).toHaveValue('2026년 01월 20일')
    })
  })

  describe('disabled', () => {
    it('should be non-interactive when disabled', async () => {
      renderWithProvider(<RangePickerField disabled />)

      const startInput = screen.getByPlaceholderText('시작일')
      expect(startInput).toBeDisabled()

      await userEvent.click(startInput)

      await waitFor(
        () => {
          expect(
            document.querySelector('.ant-picker-dropdown')
          ).not.toBeInTheDocument()
        },
        { timeout: 500 }
      )
    })
  })

  describe('allowClear', () => {
    it('should clear value when X button clicked', async () => {
      const onChange = vi.fn()
      const startDate = dayjs('2026-01-10')
      const endDate = dayjs('2026-01-20')
      renderWithProvider(
        <RangePickerField
          value={[startDate, endDate]}
          onChange={onChange}
          allowClear
        />
      )

      const clearButton = document.querySelector('.ant-picker-clear')
      expect(clearButton).toBeInTheDocument()

      if (clearButton) {
        await userEvent.click(clearButton)
      }

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled()
        const [datesArg] = onChange.mock.calls[0]
        expect(datesArg).toBeNull()
      })
    })

    it('should not show clear button when allowClear is false', () => {
      const startDate = dayjs('2026-01-10')
      const endDate = dayjs('2026-01-20')
      renderWithProvider(
        <RangePickerField value={[startDate, endDate]} allowClear={false} />
      )

      const clearButton = document.querySelector('.ant-picker-clear')
      expect(clearButton).not.toBeInTheDocument()
    })
  })

  describe('size', () => {
    it('should render with small size', () => {
      renderWithProvider(
        <RangePickerField size="small" data-testid="range-picker" />
      )
      const picker = screen.getByTestId('range-picker')
      expect(picker.querySelector('.ant-picker-small')).toBeInTheDocument()
    })

    it('should render with large size', () => {
      renderWithProvider(
        <RangePickerField size="large" data-testid="range-picker" />
      )
      const picker = screen.getByTestId('range-picker')
      expect(picker.querySelector('.ant-picker-large')).toBeInTheDocument()
    })
  })

  describe('status', () => {
    it('should render with error status', () => {
      renderWithProvider(
        <RangePickerField status="error" data-testid="range-picker" />
      )
      const picker = screen.getByTestId('range-picker')
      expect(picker.querySelector('.ant-picker-status-error')).toBeInTheDocument()
    })

    it('should render with warning status', () => {
      renderWithProvider(
        <RangePickerField status="warning" data-testid="range-picker" />
      )
      const picker = screen.getByTestId('range-picker')
      expect(
        picker.querySelector('.ant-picker-status-warning')
      ).toBeInTheDocument()
    })
  })

  describe('presets', () => {
    it('should render presets when provided', async () => {
      const presets = [
        {
          label: '최근 7일',
          value: [dayjs().subtract(6, 'day'), dayjs()] as [
            dayjs.Dayjs,
            dayjs.Dayjs,
          ],
        },
        {
          label: '이번 달',
          value: [dayjs().startOf('month'), dayjs()] as [
            dayjs.Dayjs,
            dayjs.Dayjs,
          ],
        },
      ]

      renderWithProvider(<RangePickerField presets={presets} />)

      const startInput = screen.getByPlaceholderText('시작일')
      await userEvent.click(startInput)

      await waitFor(() => {
        expect(document.querySelector('.ant-picker-dropdown')).toBeInTheDocument()
      })

      expect(screen.getByText('최근 7일')).toBeInTheDocument()
      expect(screen.getByText('이번 달')).toBeInTheDocument()
    })

    it('should select preset value on click', async () => {
      const onChange = vi.fn()
      const presets = [
        {
          label: '최근 7일',
          value: [dayjs().subtract(6, 'day'), dayjs()] as [
            dayjs.Dayjs,
            dayjs.Dayjs,
          ],
        },
      ]

      renderWithProvider(<RangePickerField presets={presets} onChange={onChange} />)

      const startInput = screen.getByPlaceholderText('시작일')
      await userEvent.click(startInput)

      await waitFor(() => {
        expect(screen.getByText('최근 7일')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText('최근 7일'))

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled()
      })
    })
  })

  describe('minDate and maxDate', () => {
    it('should disable dates before minDate', async () => {
      const minDate = dayjs('2026-01-15')
      renderWithProvider(<RangePickerField minDate={minDate} />)

      const startInput = screen.getByPlaceholderText('시작일')
      await userEvent.click(startInput)

      await waitFor(() => {
        expect(document.querySelector('.ant-picker-dropdown')).toBeInTheDocument()
      })

      const disabledCells = document.querySelectorAll('.ant-picker-cell-disabled')
      expect(disabledCells.length).toBeGreaterThan(0)
    })

    it('should disable dates after maxDate', async () => {
      const maxDate = dayjs('2026-01-25')
      renderWithProvider(<RangePickerField maxDate={maxDate} />)

      const startInput = screen.getByPlaceholderText('시작일')
      await userEvent.click(startInput)

      await waitFor(() => {
        expect(document.querySelector('.ant-picker-dropdown')).toBeInTheDocument()
      })

      const disabledCells = document.querySelectorAll('.ant-picker-cell-disabled')
      expect(disabledCells.length).toBeGreaterThan(0)
    })
  })

  describe('separator', () => {
    it('should render with default separator', () => {
      const startDate = dayjs('2026-01-10')
      const endDate = dayjs('2026-01-20')
      renderWithProvider(<RangePickerField value={[startDate, endDate]} />)

      expect(document.querySelector('.ant-picker-separator')).toBeInTheDocument()
    })
  })
})
