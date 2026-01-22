// screens/sample/EquipmentMonitor/__tests__/EquipmentDetailDrawer.test.tsx
// EquipmentDetailDrawer 컴포넌트 단위 테스트 (TSK-06-10)

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EquipmentDetailDrawer } from '../EquipmentDetailDrawer'
import type { Equipment } from '../types'

// 테스트용 설비 데이터 생성 헬퍼
function createMockEquipment(overrides: Partial<Equipment> = {}): Equipment {
  return {
    id: 'eq-001',
    code: 'CNC-001',
    name: 'CNC 선반 1호기',
    type: 'CNC',
    typeLabel: 'CNC 가공기',
    lineId: 'LINE-A',
    lineName: 'A 라인',
    location: 'A동 1층',
    status: 'RUNNING',
    statusLabel: '가동',
    statusChangedAt: '2026-01-22T08:30:00Z',
    manufacturer: 'DMG MORI',
    installedAt: '2024-06-15',
    metrics: {
      efficiency: 85,
      todayProduction: 1250,
      targetProduction: 1500,
      defectCount: 3,
    },
    maintenance: {
      lastMaintenanceAt: '2026-01-15',
      nextMaintenanceAt: '2026-02-15',
      maintenanceManager: '김정비',
    },
    operator: '홍길동',
    history: [
      {
        timestamp: '2026-01-22T08:30:00Z',
        previousStatus: 'STOPPED',
        newStatus: 'RUNNING',
        reason: '작업 시작',
      },
      {
        timestamp: '2026-01-22T07:00:00Z',
        previousStatus: 'RUNNING',
        newStatus: 'STOPPED',
        reason: '휴식 시간',
      },
    ],
    ...overrides,
  }
}

describe('EquipmentDetailDrawer', () => {
  it('equipment가 null이면 렌더링하지 않아야 함', () => {
    render(<EquipmentDetailDrawer equipment={null} open={true} onClose={vi.fn()} />)

    expect(screen.queryByTestId('equipment-drawer')).not.toBeInTheDocument()
  })

  it('open이 true일 때 Drawer가 렌더링되어야 함', () => {
    const equipment = createMockEquipment()
    render(<EquipmentDetailDrawer equipment={equipment} open={true} onClose={vi.fn()} />)

    expect(screen.getByTestId('equipment-drawer')).toBeInTheDocument()
  })

  it('설비 코드를 표시해야 함', () => {
    const equipment = createMockEquipment({ code: 'CNC-001' })
    render(<EquipmentDetailDrawer equipment={equipment} open={true} onClose={vi.fn()} />)

    expect(screen.getByTestId('equipment-drawer-code')).toHaveTextContent('CNC-001')
  })

  it('설비명을 표시해야 함', () => {
    const equipment = createMockEquipment({ name: 'CNC 선반 1호기' })
    render(<EquipmentDetailDrawer equipment={equipment} open={true} onClose={vi.fn()} />)

    expect(screen.getByTestId('equipment-drawer-name')).toHaveTextContent('CNC 선반 1호기')
  })

  it('생산 라인을 표시해야 함', () => {
    const equipment = createMockEquipment({ lineName: 'A 라인' })
    render(<EquipmentDetailDrawer equipment={equipment} open={true} onClose={vi.fn()} />)

    expect(screen.getByTestId('equipment-drawer-line')).toHaveTextContent('A 라인')
  })

  it('현재 상태를 표시해야 함', () => {
    const equipment = createMockEquipment({ status: 'RUNNING' })
    render(<EquipmentDetailDrawer equipment={equipment} open={true} onClose={vi.fn()} />)

    expect(screen.getByTestId('equipment-drawer-status')).toHaveTextContent('가동')
  })

  it('담당자를 표시해야 함', () => {
    const equipment = createMockEquipment({ operator: '홍길동' })
    render(<EquipmentDetailDrawer equipment={equipment} open={true} onClose={vi.fn()} />)

    expect(screen.getByTestId('equipment-drawer-operator')).toHaveTextContent('홍길동')
  })

  it('닫기 버튼 클릭 시 onClose 콜백이 호출되어야 함', () => {
    const onClose = vi.fn()
    const equipment = createMockEquipment()
    render(<EquipmentDetailDrawer equipment={equipment} open={true} onClose={onClose} />)

    fireEvent.click(screen.getByTestId('equipment-drawer-close-btn'))
    expect(onClose).toHaveBeenCalled()
  })

  it('상태 이력 타임라인을 표시해야 함', () => {
    const equipment = createMockEquipment({
      history: [
        {
          timestamp: '2026-01-22T08:30:00Z',
          previousStatus: 'STOPPED',
          newStatus: 'RUNNING',
          reason: '작업 시작',
        },
      ],
    })
    render(<EquipmentDetailDrawer equipment={equipment} open={true} onClose={vi.fn()} />)

    expect(screen.getByText('작업 시작')).toBeInTheDocument()
  })

  it('이력이 없는 경우 안내 메시지를 표시해야 함', () => {
    const equipment = createMockEquipment({ history: [] })
    render(<EquipmentDetailDrawer equipment={equipment} open={true} onClose={vi.fn()} />)

    expect(screen.getByText('이력이 없습니다.')).toBeInTheDocument()
  })

  it('점검 일정 정보를 표시해야 함', () => {
    const equipment = createMockEquipment({
      maintenance: {
        lastMaintenanceAt: '2026-01-15',
        nextMaintenanceAt: '2026-02-15',
        maintenanceManager: '김정비',
      },
    })
    render(<EquipmentDetailDrawer equipment={equipment} open={true} onClose={vi.fn()} />)

    expect(screen.getByText('2026-01-15')).toBeInTheDocument()
    expect(screen.getByText('2026-02-15')).toBeInTheDocument()
    expect(screen.getByText('김정비')).toBeInTheDocument()
  })
})
