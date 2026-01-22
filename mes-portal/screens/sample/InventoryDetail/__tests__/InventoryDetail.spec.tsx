// screens/sample/InventoryDetail/__tests__/InventoryDetail.spec.tsx
// 재고 현황 조회 메인 화면 단위 테스트 (TSK-06-15)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InventoryDetail from '../index'
import type { InventoryData } from '../types'

// Mock 데이터
const mockData: InventoryData = {
  items: [
    {
      id: 'item-001',
      code: 'RAW-A-001',
      name: '알루미늄 판재 6mm',
      category: '원자재',
      specification: '1000x2000x6mm',
      unit: 'EA',
      currentStock: 1500,
      safetyStock: 500,
      status: 'normal',
      lastInDate: '2026-01-20',
      lastOutDate: '2026-01-21',
      warehouse: 'A창고-1구역',
      remarks: 'ISO 인증 자재',
    },
    {
      id: 'item-002',
      code: 'RAW-B-002',
      name: '스테인리스 파이프 50mm',
      category: '원자재',
      specification: '외경50mm x 내경45mm x 길이6000mm',
      unit: 'EA',
      currentStock: 150,
      safetyStock: 200,
      status: 'warning',
      lastInDate: '2026-01-15',
      lastOutDate: '2026-01-21',
      warehouse: 'B창고-2구역',
      remarks: '',
    },
    {
      id: 'item-003',
      code: 'RAW-C-003',
      name: '구리 판재 3mm',
      category: '원자재',
      specification: '500x1000x3mm',
      unit: 'EA',
      currentStock: 50,
      safetyStock: 300,
      status: 'danger',
      lastInDate: '2026-01-10',
      lastOutDate: '2026-01-22',
      warehouse: 'A창고-2구역',
      remarks: '긴급 발주 필요',
    },
  ],
  transactions: [
    {
      id: 'tx-001',
      itemId: 'item-001',
      type: 'out',
      quantity: 200,
      date: '2026-01-21T14:30:00',
      handler: '김생산',
      reference: 'WO-2026-0015',
      remarks: '생산 출고',
    },
    {
      id: 'tx-002',
      itemId: 'item-001',
      type: 'in',
      quantity: 500,
      date: '2026-01-20T10:00:00',
      handler: '이자재',
      reference: 'PO-2026-0042',
      remarks: '정기 입고',
    },
  ],
  trends: [
    { itemId: 'item-001', date: '2026-01-20', stock: 1550 },
    { itemId: 'item-001', date: '2026-01-21', stock: 1350 },
    { itemId: 'item-001', date: '2026-01-22', stock: 1500 },
  ],
}

// Mock JSON import
vi.mock('@/mock-data/inventory.json', () => ({
  default: {
    items: [
      {
        id: 'item-001',
        code: 'RAW-A-001',
        name: '알루미늄 판재 6mm',
        category: '원자재',
        specification: '1000x2000x6mm',
        unit: 'EA',
        currentStock: 1500,
        safetyStock: 500,
        status: 'normal',
        lastInDate: '2026-01-20',
        lastOutDate: '2026-01-21',
        warehouse: 'A창고-1구역',
        remarks: 'ISO 인증 자재',
      },
      {
        id: 'item-002',
        code: 'RAW-B-002',
        name: '스테인리스 파이프 50mm',
        category: '원자재',
        specification: '외경50mm x 내경45mm x 길이6000mm',
        unit: 'EA',
        currentStock: 150,
        safetyStock: 200,
        status: 'warning',
        lastInDate: '2026-01-15',
        lastOutDate: '2026-01-21',
        warehouse: 'B창고-2구역',
        remarks: '',
      },
      {
        id: 'item-003',
        code: 'RAW-C-003',
        name: '구리 판재 3mm',
        category: '원자재',
        specification: '500x1000x3mm',
        unit: 'EA',
        currentStock: 50,
        safetyStock: 300,
        status: 'danger',
        lastInDate: '2026-01-10',
        lastOutDate: '2026-01-22',
        warehouse: 'A창고-2구역',
        remarks: '긴급 발주 필요',
      },
    ],
    transactions: [
      {
        id: 'tx-001',
        itemId: 'item-001',
        type: 'out',
        quantity: 200,
        date: '2026-01-21T14:30:00',
        handler: '김생산',
        reference: 'WO-2026-0015',
        remarks: '생산 출고',
      },
      {
        id: 'tx-002',
        itemId: 'item-001',
        type: 'in',
        quantity: 500,
        date: '2026-01-20T10:00:00',
        handler: '이자재',
        reference: 'PO-2026-0042',
        remarks: '정기 입고',
      },
    ],
    trends: [
      { itemId: 'item-001', date: '2026-01-20', stock: 1550 },
      { itemId: 'item-001', date: '2026-01-21', stock: 1350 },
      { itemId: 'item-001', date: '2026-01-22', stock: 1500 },
    ],
  },
}))

// Mock @ant-design/charts
vi.mock('@ant-design/charts', () => ({
  Line: vi.fn(({ data }) => (
    <div data-testid="mocked-line-chart">
      Line Chart - {data?.length || 0} data points
    </div>
  )),
}))

describe('InventoryDetail 컴포넌트', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('렌더링', () => {
    it('페이지가 정상적으로 렌더링되어야 한다', () => {
      render(<InventoryDetail />)
      expect(screen.getByTestId('inventory-detail-page')).toBeInTheDocument()
      expect(screen.getByText('재고 현황 조회')).toBeInTheDocument()
    })

    it('품목 선택 AutoComplete가 렌더링되어야 한다', () => {
      render(<InventoryDetail />)
      expect(screen.getByTestId('item-select-card')).toBeInTheDocument()
      expect(screen.getByTestId('item-select')).toBeInTheDocument()
    })
  })

  describe('FR-005: 빈 상태 표시', () => {
    // UT-005: 로딩/빈 상태 표시
    it('품목 미선택 시 Empty 상태가 표시되어야 한다', () => {
      render(<InventoryDetail />)
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByText('품목을 선택해주세요')).toBeInTheDocument()
    })
  })

  describe('FR-001: 품목 선택', () => {
    // UT-001: ItemSelect 품목 검색 필터링
    it('품목 선택 시 상세 정보가 표시되어야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<InventoryDetail />)

      // AutoComplete 찾기
      const autocomplete = screen.getByTestId('item-select')
      const input = autocomplete.querySelector('input')
      expect(input).toBeInTheDocument()

      // 검색어 입력
      await act(async () => {
        await user.type(input!, '알루미늄')
      })

      // 드롭다운 옵션 클릭
      await waitFor(() => {
        const option = screen.getByText('RAW-A-001 - 알루미늄 판재 6mm')
        expect(option).toBeInTheDocument()
      })

      await act(async () => {
        await user.click(screen.getByText('RAW-A-001 - 알루미늄 판재 6mm'))
        vi.advanceTimersByTime(600) // 로딩 시뮬레이션 대기
      })

      // 상세 정보 표시 확인
      await waitFor(() => {
        expect(screen.getByTestId('detail-content')).toBeInTheDocument()
        expect(screen.getByTestId('inventory-descriptions')).toBeInTheDocument()
      })
    })
  })

  describe('FR-002: 상세 정보 표시', () => {
    // UT-002: InventoryDescriptions 상세 정보 렌더링
    it('선택된 품목의 모든 상세 정보가 표시되어야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<InventoryDetail />)

      // 품목 선택
      const autocomplete = screen.getByTestId('item-select')
      const input = autocomplete.querySelector('input')
      await act(async () => {
        await user.type(input!, '알루미늄')
      })

      await waitFor(() => {
        expect(
          screen.getByText('RAW-A-001 - 알루미늄 판재 6mm')
        ).toBeInTheDocument()
      })

      await act(async () => {
        await user.click(screen.getByText('RAW-A-001 - 알루미늄 판재 6mm'))
        vi.advanceTimersByTime(600)
      })

      // 상세 정보 항목 확인
      await waitFor(() => {
        expect(screen.getByTestId('item-code')).toHaveTextContent('RAW-A-001')
        expect(screen.getByTestId('item-name')).toHaveTextContent(
          '알루미늄 판재 6mm'
        )
        expect(screen.getByTestId('current-stock')).toHaveTextContent('1,500')
        expect(screen.getByTestId('safety-stock')).toHaveTextContent('500')
        expect(screen.getByTestId('stock-status')).toHaveTextContent('충분')
      })
    })
  })

  describe('FR-003: 입출고 이력 탭', () => {
    // UT-003: TransactionTable 이력 목록 정렬
    it('입출고 이력 탭이 기본 활성화되어야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<InventoryDetail />)

      // 품목 선택
      const input = screen.getByTestId('item-select').querySelector('input')
      await act(async () => {
        await user.type(input!, '알루미늄')
      })

      await waitFor(() => {
        expect(
          screen.getByText('RAW-A-001 - 알루미늄 판재 6mm')
        ).toBeInTheDocument()
      })

      await act(async () => {
        await user.click(screen.getByText('RAW-A-001 - 알루미늄 판재 6mm'))
        vi.advanceTimersByTime(600)
      })

      // 입출고 이력 탭 및 테이블 확인
      await waitFor(() => {
        expect(screen.getByText('입출고 이력')).toBeInTheDocument()
        expect(
          screen.getByTestId('transaction-table-container')
        ).toBeInTheDocument()
      })
    })
  })

  describe('FR-004: 재고 추이 차트', () => {
    // UT-004: StockTrendChart 차트 데이터 변환
    it('재고 추이 탭 클릭 시 차트가 표시되어야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<InventoryDetail />)

      // 품목 선택
      const input = screen.getByTestId('item-select').querySelector('input')
      await act(async () => {
        await user.type(input!, '알루미늄')
      })

      await waitFor(() => {
        expect(
          screen.getByText('RAW-A-001 - 알루미늄 판재 6mm')
        ).toBeInTheDocument()
      })

      await act(async () => {
        await user.click(screen.getByText('RAW-A-001 - 알루미늄 판재 6mm'))
        vi.advanceTimersByTime(600)
      })

      // 재고 추이 탭 클릭
      await waitFor(() => {
        expect(screen.getByText('재고 추이')).toBeInTheDocument()
      })

      await act(async () => {
        await user.click(screen.getByText('재고 추이'))
      })

      // 차트 표시 확인 (Mocked)
      await waitFor(() => {
        expect(screen.getByTestId('mocked-line-chart')).toBeInTheDocument()
      })
    })
  })

  describe('로딩 상태', () => {
    it('품목 선택 시 로딩 스켈레톤이 표시되어야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<InventoryDetail />)

      // 품목 선택
      const input = screen.getByTestId('item-select').querySelector('input')
      await act(async () => {
        await user.type(input!, '알루미늄')
      })

      await waitFor(() => {
        expect(
          screen.getByText('RAW-A-001 - 알루미늄 판재 6mm')
        ).toBeInTheDocument()
      })

      await act(async () => {
        await user.click(screen.getByText('RAW-A-001 - 알루미늄 판재 6mm'))
      })

      // 로딩 스켈레톤 확인 (500ms 이내)
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()

      // 로딩 완료 후 상세 정보 표시
      await act(async () => {
        vi.advanceTimersByTime(600)
      })

      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
        expect(screen.getByTestId('detail-content')).toBeInTheDocument()
      })
    })
  })
})
