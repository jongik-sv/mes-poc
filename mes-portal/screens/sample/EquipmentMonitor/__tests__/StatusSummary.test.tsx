// screens/sample/EquipmentMonitor/__tests__/StatusSummary.test.tsx
// StatusSummary 컴포넌트 단위 테스트 (TSK-06-10)

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusSummary } from '../StatusSummary'
import type { EquipmentStatus } from '../types'

describe('StatusSummary', () => {
  const mockCounts: Record<EquipmentStatus, number> = {
    RUNNING: 5,
    STOPPED: 2,
    FAULT: 1,
    MAINTENANCE: 2,
  }

  it('전체 설비 수를 표시해야 함', () => {
    render(<StatusSummary counts={mockCounts} />)

    // 전체 10대 (5 + 2 + 1 + 2)
    expect(screen.getByTestId('summary-total')).toHaveTextContent('10')
  })

  it('가동 설비 수를 표시해야 함', () => {
    render(<StatusSummary counts={mockCounts} />)

    expect(screen.getByTestId('summary-running')).toHaveTextContent('5')
  })

  it('정지 설비 수를 표시해야 함', () => {
    render(<StatusSummary counts={mockCounts} />)

    expect(screen.getByTestId('summary-stopped')).toHaveTextContent('2')
  })

  it('고장 설비 수를 표시해야 함', () => {
    render(<StatusSummary counts={mockCounts} />)

    expect(screen.getByTestId('summary-fault')).toHaveTextContent('1')
  })

  it('점검 설비 수를 표시해야 함', () => {
    render(<StatusSummary counts={mockCounts} />)

    expect(screen.getByTestId('summary-maintenance')).toHaveTextContent('2')
  })

  it('모든 카운트가 0인 경우도 정상 렌더링되어야 함', () => {
    const zeroCounts: Record<EquipmentStatus, number> = {
      RUNNING: 0,
      STOPPED: 0,
      FAULT: 0,
      MAINTENANCE: 0,
    }

    render(<StatusSummary counts={zeroCounts} />)

    expect(screen.getByTestId('summary-total')).toHaveTextContent('0')
    expect(screen.getByTestId('summary-running')).toHaveTextContent('0')
    expect(screen.getByTestId('summary-stopped')).toHaveTextContent('0')
    expect(screen.getByTestId('summary-fault')).toHaveTextContent('0')
    expect(screen.getByTestId('summary-maintenance')).toHaveTextContent('0')
  })
})
