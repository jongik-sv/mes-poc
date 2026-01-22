// screens/sample/EquipmentMonitor/__tests__/EquipmentCard.test.tsx
// EquipmentCard 컴포넌트 단위 테스트 (TSK-06-10)

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EquipmentCard } from '../EquipmentCard'
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
    history: [],
    ...overrides,
  }
}

describe('EquipmentCard', () => {
  it('설비 코드와 이름을 렌더링해야 함', () => {
    const equipment = createMockEquipment()
    render(<EquipmentCard equipment={equipment} />)

    expect(screen.getByTestId('equipment-code-eq-001')).toHaveTextContent('CNC-001')
    expect(screen.getByTestId('equipment-name-eq-001')).toHaveTextContent('CNC 선반 1호기')
  })

  it('라인 이름을 렌더링해야 함', () => {
    const equipment = createMockEquipment()
    render(<EquipmentCard equipment={equipment} />)

    expect(screen.getByTestId('equipment-line-eq-001')).toHaveTextContent('A 라인')
  })

  it('상태 배지를 렌더링해야 함', () => {
    const equipment = createMockEquipment({ status: 'RUNNING' })
    render(<EquipmentCard equipment={equipment} />)

    expect(screen.getByTestId('equipment-status-badge-eq-001')).toHaveTextContent('가동')
  })

  it.each([
    ['RUNNING', '가동'],
    ['STOPPED', '정지'],
    ['FAULT', '고장'],
    ['MAINTENANCE', '점검'],
  ] as const)('상태 %s에서 배지 텍스트가 "%s"이어야 함', (status, label) => {
    const equipment = createMockEquipment({ status })
    render(<EquipmentCard equipment={equipment} />)

    expect(screen.getByTestId('equipment-status-badge-eq-001')).toHaveTextContent(label)
  })

  it('가동 상태에서 가동률을 표시해야 함', () => {
    const equipment = createMockEquipment({
      status: 'RUNNING',
      metrics: { efficiency: 85, todayProduction: 1250, targetProduction: 1500, defectCount: 3 },
    })
    render(<EquipmentCard equipment={equipment} />)

    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('고장 상태에서 에러 코드를 표시해야 함', () => {
    const equipment = createMockEquipment({
      status: 'FAULT',
      errorCode: 'E-0045',
    })
    render(<EquipmentCard equipment={equipment} />)

    expect(screen.getByTestId('equipment-error-code-eq-001')).toHaveTextContent('E-0045')
  })

  it('점검 상태에서 점검 메모를 표시해야 함', () => {
    const equipment = createMockEquipment({
      status: 'MAINTENANCE',
      maintenanceNote: '정기 점검 진행 중',
    })
    render(<EquipmentCard equipment={equipment} />)

    expect(screen.getByText('정기 점검 진행 중')).toBeInTheDocument()
  })

  it('클릭 시 onClick 콜백이 호출되어야 함', () => {
    const onClick = vi.fn()
    const equipment = createMockEquipment()
    render(<EquipmentCard equipment={equipment} onClick={onClick} />)

    fireEvent.click(screen.getByTestId('equipment-card-eq-001'))
    expect(onClick).toHaveBeenCalledWith(equipment)
  })

  it('Enter 키 입력 시 onClick 콜백이 호출되어야 함', () => {
    const onClick = vi.fn()
    const equipment = createMockEquipment()
    render(<EquipmentCard equipment={equipment} onClick={onClick} />)

    fireEvent.keyDown(screen.getByTestId('equipment-card-eq-001'), { key: 'Enter' })
    expect(onClick).toHaveBeenCalledWith(equipment)
  })

  it('Space 키 입력 시 onClick 콜백이 호출되어야 함', () => {
    const onClick = vi.fn()
    const equipment = createMockEquipment()
    render(<EquipmentCard equipment={equipment} onClick={onClick} />)

    fireEvent.keyDown(screen.getByTestId('equipment-card-eq-001'), { key: ' ' })
    expect(onClick).toHaveBeenCalledWith(equipment)
  })

  it('loading 상태에서 스켈레톤을 표시해야 함', () => {
    const equipment = createMockEquipment()
    render(<EquipmentCard equipment={equipment} loading />)

    // 스켈레톤이 렌더링되면 설비 이름이 표시되지 않음
    expect(screen.queryByTestId('equipment-name-eq-001')).not.toBeInTheDocument()
  })

  it('접근성을 위한 aria-label이 설정되어야 함', () => {
    const equipment = createMockEquipment({ name: 'CNC 선반 1호기', status: 'RUNNING' })
    render(<EquipmentCard equipment={equipment} />)

    const card = screen.getByTestId('equipment-card-eq-001')
    expect(card).toHaveAttribute('aria-label', 'CNC 선반 1호기, 현재 상태: 가동')
  })
})
