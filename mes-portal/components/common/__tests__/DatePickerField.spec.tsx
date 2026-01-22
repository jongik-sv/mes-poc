import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'
import DatePickerField from '../DatePickerField'
import dayjs from '@/lib/dayjs'

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ConfigProvider locale={koKR}>{ui}</ConfigProvider>)
}

describe('DatePickerField', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render with default placeholder', () => {
      renderWithProvider(<DatePickerField />)
      expect(screen.getByPlaceholderText('날짜 선택')).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      renderWithProvider(<DatePickerField placeholder="날짜를 선택하세요" />)
      expect(screen.getByPlaceholderText('날짜를 선택하세요')).toBeInTheDocument()
    })

    it('should render with data-testid', () => {
      renderWithProvider(<DatePickerField data-testid="date-picker" />)
      expect(screen.getByTestId('date-picker')).toBeInTheDocument()
    })
  })

  describe('date selection', () => {
    it('should call onChange with dayjs object on date select', async () => {
      const onChange = vi.fn()
      renderWithProvider(<DatePickerField onChange={onChange} />)

      const input = screen.getByPlaceholderText('날짜 선택')
      await userEvent.click(input)

      await waitFor(() => {
        expect(document.querySelector('.ant-picker-dropdown')).toBeInTheDocument()
      })

      const todayCell = document.querySelector('.ant-picker-cell-today')
      if (todayCell) {
        await userEvent.click(todayCell)
      }

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled()
      })

      const [dateArg] = onChange.mock.calls[0]
      expect(dayjs.isDayjs(dateArg)).toBe(true)
    })

    it('should display selected date value', () => {
      const testDate = dayjs('2026-01-20')
      renderWithProvider(<DatePickerField value={testDate} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('2026-01-20')
    })
  })

  describe('format', () => {
    it('should display date in YYYY-MM-DD format by default', () => {
      const testDate = dayjs('2026-01-20')
      renderWithProvider(<DatePickerField value={testDate} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('2026-01-20')
    })

    it('should display date in custom format', () => {
      const testDate = dayjs('2026-01-20')
      renderWithProvider(<DatePickerField value={testDate} format="YYYY년 MM월 DD일" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('2026년 01월 20일')
    })
  })

  describe('placeholder', () => {
    it('should show placeholder when empty', () => {
      renderWithProvider(<DatePickerField placeholder="날짜를 선택하세요" />)
      expect(screen.getByPlaceholderText('날짜를 선택하세요')).toBeInTheDocument()
    })
  })

  describe('disabled', () => {
    it('should be non-interactive when disabled', async () => {
      renderWithProvider(<DatePickerField disabled />)

      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()

      await userEvent.click(input)

      await waitFor(
        () => {
          expect(document.querySelector('.ant-picker-dropdown')).not.toBeInTheDocument()
        },
        { timeout: 500 }
      )
    })
  })

  describe('allowClear', () => {
    it('should clear value when X button clicked', async () => {
      const onChange = vi.fn()
      const testDate = dayjs('2026-01-20')
      renderWithProvider(
        <DatePickerField value={testDate} onChange={onChange} allowClear />
      )

      const clearButton = document.querySelector('.ant-picker-clear')
      expect(clearButton).toBeInTheDocument()

      if (clearButton) {
        await userEvent.click(clearButton)
      }

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled()
        const [dateArg] = onChange.mock.calls[0]
        expect(dateArg).toBeNull()
      })
    })

    it('should not show clear button when allowClear is false', () => {
      const testDate = dayjs('2026-01-20')
      renderWithProvider(<DatePickerField value={testDate} allowClear={false} />)

      const clearButton = document.querySelector('.ant-picker-clear')
      expect(clearButton).not.toBeInTheDocument()
    })
  })

  describe('disabledDate', () => {
    it('should not allow selecting disabled dates', async () => {
      const onChange = vi.fn()
      const disabledDate = (current: dayjs.Dayjs) => {
        return current && current.isBefore(dayjs(), 'day')
      }

      renderWithProvider(
        <DatePickerField onChange={onChange} disabledDate={disabledDate} />
      )

      const input = screen.getByPlaceholderText('날짜 선택')
      await userEvent.click(input)

      await waitFor(() => {
        expect(document.querySelector('.ant-picker-dropdown')).toBeInTheDocument()
      })

      const disabledCells = document.querySelectorAll('.ant-picker-cell-disabled')
      expect(disabledCells.length).toBeGreaterThan(0)
    })
  })

  describe('size', () => {
    it('should render with small size', () => {
      renderWithProvider(<DatePickerField size="small" data-testid="date-picker" />)
      const picker = screen.getByTestId('date-picker')
      expect(picker.querySelector('.ant-picker-small')).toBeInTheDocument()
    })

    it('should render with large size', () => {
      renderWithProvider(<DatePickerField size="large" data-testid="date-picker" />)
      const picker = screen.getByTestId('date-picker')
      expect(picker.querySelector('.ant-picker-large')).toBeInTheDocument()
    })
  })

  describe('status', () => {
    it('should render with error status', () => {
      renderWithProvider(<DatePickerField status="error" data-testid="date-picker" />)
      const picker = screen.getByTestId('date-picker')
      expect(picker.querySelector('.ant-picker-status-error')).toBeInTheDocument()
    })

    it('should render with warning status', () => {
      renderWithProvider(<DatePickerField status="warning" data-testid="date-picker" />)
      const picker = screen.getByTestId('date-picker')
      expect(picker.querySelector('.ant-picker-status-warning')).toBeInTheDocument()
    })
  })

  describe('Korean locale', () => {
    it('should display weekdays in Korean when calendar opens', async () => {
      renderWithProvider(<DatePickerField />)

      const input = screen.getByPlaceholderText('날짜 선택')
      await userEvent.click(input)

      await waitFor(() => {
        expect(document.querySelector('.ant-picker-dropdown')).toBeInTheDocument()
      })

      const weekdayHeaders = document.querySelectorAll('.ant-picker-content th')
      const weekdayTexts = Array.from(weekdayHeaders).map((th) => th.textContent)

      expect(weekdayTexts).toContain('일')
      expect(weekdayTexts).toContain('월')
      expect(weekdayTexts).toContain('화')
      expect(weekdayTexts).toContain('수')
      expect(weekdayTexts).toContain('목')
      expect(weekdayTexts).toContain('금')
      expect(weekdayTexts).toContain('토')
    })
  })

  describe('presets', () => {
    it('should render presets when provided', async () => {
      const presets = [
        { label: '오늘 선택', value: dayjs() },
        { label: '어제 선택', value: dayjs().subtract(1, 'day') },
      ]

      renderWithProvider(<DatePickerField presets={presets} />)

      const input = screen.getByPlaceholderText('날짜 선택')
      await userEvent.click(input)

      await waitFor(() => {
        expect(document.querySelector('.ant-picker-dropdown')).toBeInTheDocument()
      })

      expect(screen.getByText('오늘 선택')).toBeInTheDocument()
      expect(screen.getByText('어제 선택')).toBeInTheDocument()
    })

    it('should select preset value on click', async () => {
      const onChange = vi.fn()
      const today = dayjs().startOf('day')
      const presets = [{ label: '오늘 선택', value: today }]

      renderWithProvider(<DatePickerField presets={presets} onChange={onChange} />)

      const input = screen.getByPlaceholderText('날짜 선택')
      await userEvent.click(input)

      await waitFor(() => {
        expect(screen.getByText('오늘 선택')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText('오늘 선택'))

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled()
      })
    })
  })

  describe('minDate and maxDate', () => {
    it('should disable dates before minDate', async () => {
      const minDate = dayjs('2026-01-15')
      renderWithProvider(<DatePickerField minDate={minDate} />)

      const input = screen.getByPlaceholderText('날짜 선택')
      await userEvent.click(input)

      await waitFor(() => {
        expect(document.querySelector('.ant-picker-dropdown')).toBeInTheDocument()
      })

      const disabledCells = document.querySelectorAll('.ant-picker-cell-disabled')
      expect(disabledCells.length).toBeGreaterThan(0)
    })

    it('should disable dates after maxDate', async () => {
      const maxDate = dayjs('2026-01-25')
      renderWithProvider(<DatePickerField maxDate={maxDate} />)

      const input = screen.getByPlaceholderText('날짜 선택')
      await userEvent.click(input)

      await waitFor(() => {
        expect(document.querySelector('.ant-picker-dropdown')).toBeInTheDocument()
      })

      const disabledCells = document.querySelectorAll('.ant-picker-cell-disabled')
      expect(disabledCells.length).toBeGreaterThan(0)
    })
  })
})
