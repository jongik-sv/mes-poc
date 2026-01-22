// screens/sample/EquipmentMonitor/__tests__/EquipmentFilter.test.tsx
// EquipmentFilter 컴포넌트 단위 테스트 (TSK-06-10)

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EquipmentFilter } from '../EquipmentFilter'
import type { EquipmentFilterState, Line } from '../types'

const mockLines: Line[] = [
  { id: 'LINE-A', name: 'A 라인' },
  { id: 'LINE-B', name: 'B 라인' },
  { id: 'LINE-C', name: 'C 라인' },
]

const defaultFilter: EquipmentFilterState = {
  status: 'all',
  lineId: 'all',
}

describe('EquipmentFilter', () => {
  it('상태 필터 셀렉트가 렌더링되어야 함', () => {
    render(
      <EquipmentFilter
        filter={defaultFilter}
        lines={mockLines}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />
    )

    expect(screen.getByTestId('status-filter')).toBeInTheDocument()
  })

  it('라인 필터 셀렉트가 렌더링되어야 함', () => {
    render(
      <EquipmentFilter
        filter={defaultFilter}
        lines={mockLines}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />
    )

    expect(screen.getByTestId('line-filter')).toBeInTheDocument()
  })

  it('필터가 적용되지 않은 경우 초기화 버튼이 표시되지 않아야 함', () => {
    render(
      <EquipmentFilter
        filter={defaultFilter}
        lines={mockLines}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />
    )

    expect(screen.queryByTestId('filter-reset')).not.toBeInTheDocument()
  })

  it('필터가 적용된 경우 초기화 버튼이 표시되어야 함', () => {
    const appliedFilter: EquipmentFilterState = {
      status: 'RUNNING',
      lineId: 'all',
    }

    render(
      <EquipmentFilter
        filter={appliedFilter}
        lines={mockLines}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />
    )

    expect(screen.getByTestId('filter-reset')).toBeInTheDocument()
  })

  it('초기화 버튼 클릭 시 onReset 콜백이 호출되어야 함', () => {
    const onReset = vi.fn()
    const appliedFilter: EquipmentFilterState = {
      status: 'RUNNING',
      lineId: 'all',
    }

    render(
      <EquipmentFilter
        filter={appliedFilter}
        lines={mockLines}
        onFilterChange={vi.fn()}
        onReset={onReset}
      />
    )

    fireEvent.click(screen.getByTestId('filter-reset'))
    expect(onReset).toHaveBeenCalled()
  })

  it('라인 필터가 적용된 경우 초기화 버튼이 표시되어야 함', () => {
    const appliedFilter: EquipmentFilterState = {
      status: 'all',
      lineId: 'LINE-A',
    }

    render(
      <EquipmentFilter
        filter={appliedFilter}
        lines={mockLines}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />
    )

    expect(screen.getByTestId('filter-reset')).toBeInTheDocument()
  })
})
