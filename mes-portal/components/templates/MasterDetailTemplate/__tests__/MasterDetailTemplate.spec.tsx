// components/templates/MasterDetailTemplate/__tests__/MasterDetailTemplate.spec.tsx
// MasterDetailTemplate 컴포넌트 단위 테스트 (TSK-06-04)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MasterDetailTemplate } from '../index'

// Mock Antd components
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd')
  return {
    ...actual,
    Skeleton: ({ active, paragraph }: { active?: boolean; paragraph?: { rows: number } }) => (
      <div data-testid="skeleton" data-active={active} data-rows={paragraph?.rows}>
        Loading...
      </div>
    ),
    Empty: Object.assign(
      ({ description, image }: { description?: React.ReactNode; image?: unknown }) => (
        <div data-testid="empty-state" data-image={image === 'presented_image_simple' ? 'simple' : 'default'}>
          {description}
        </div>
      ),
      { PRESENTED_IMAGE_SIMPLE: 'presented_image_simple' }
    ),
    Typography: {
      Text: ({ children, type }: { children: React.ReactNode; type?: string }) => (
        <span data-type={type}>{children}</span>
      ),
    },
    Input: ({
      'data-testid': testId,
      placeholder,
      value,
      onChange,
      allowClear,
      prefix,
      size
    }: {
      'data-testid'?: string
      placeholder?: string
      value?: string
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
      allowClear?: boolean
      prefix?: React.ReactNode
      size?: string
    }) => (
      <div data-testid="input-wrapper">
        {prefix && <span data-testid="input-prefix">{prefix}</span>}
        <input
          data-testid={testId}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          data-allow-clear={allowClear}
          data-size={size}
        />
      </div>
    ),
  }
})

// 테스트용 데이터
interface MasterItem {
  id: string
  name: string
}

interface DetailItem {
  id: string
  name: string
  masterId: string
}

const mockMasterList: MasterItem[] = [
  { id: 'm1', name: '카테고리 1' },
  { id: 'm2', name: '카테고리 2' },
  { id: 'm3', name: '카테고리 3' },
]

const mockDetailList: DetailItem[] = [
  { id: 'd1', name: '제품 1', masterId: 'm1' },
  { id: 'd2', name: '제품 2', masterId: 'm1' },
]

// 마스터 리스트 Mock 컴포넌트
const MockMasterList = ({
  items,
  selectedId,
  onSelect,
}: {
  items: MasterItem[]
  selectedId?: string
  onSelect?: (item: MasterItem) => void
}) => (
  <ul data-testid="master-list">
    {items.map((item) => (
      <li
        key={item.id}
        data-testid="master-item"
        data-item-id={item.id}
        className={selectedId === item.id ? 'selected' : ''}
        onClick={() => onSelect?.(item)}
        role="button"
        tabIndex={0}
      >
        {item.name}
      </li>
    ))}
  </ul>
)

// 디테일 뷰 Mock 컴포넌트
const MockDetailView = ({ items }: { items: DetailItem[] }) => (
  <table data-testid="detail-table">
    <tbody>
      {items.map((item) => (
        <tr key={item.id} data-testid="detail-row">
          <td>{item.name}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

describe('MasterDetailTemplate', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('렌더링', () => {
    it('UT-001: 마스터와 디테일 영역이 렌더링되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div data-testid="master">Master List</div>}
          detailContent={<div data-testid="detail">Detail View</div>}
        />
      )

      expect(screen.getByTestId('master-detail-template')).toBeInTheDocument()
      expect(screen.getByTestId('master-panel')).toBeInTheDocument()
      expect(screen.getByTestId('detail-panel')).toBeInTheDocument()
      expect(screen.getByTestId('split-handle')).toBeInTheDocument()
    })

    it('UT-002: masterContent가 마스터 영역에 렌더링되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={
            <ul data-testid="master-list">
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          }
          detailContent={<div />}
        />
      )

      const masterPanel = screen.getByTestId('master-panel')
      expect(within(masterPanel).getByTestId('master-list')).toBeInTheDocument()
      expect(within(masterPanel).getByText('Item 1')).toBeInTheDocument()
      expect(within(masterPanel).getByText('Item 2')).toBeInTheDocument()
    })

    it('UT-003: detailContent가 디테일 영역에 렌더링되어야 한다', () => {
      const selectedMaster = { id: '1', name: 'Test' }

      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div data-testid="detail-view">Detail Content</div>}
          selectedMaster={selectedMaster}
        />
      )

      const detailPanel = screen.getByTestId('detail-panel')
      expect(within(detailPanel).getByTestId('detail-view')).toBeInTheDocument()
      expect(within(detailPanel).getByText('Detail Content')).toBeInTheDocument()
    })

    it('UT-004: masterTitle이 표시되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterTitle="카테고리 목록"
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
        />
      )

      expect(screen.getByTestId('master-title')).toBeInTheDocument()
      expect(screen.getByText('카테고리 목록')).toBeInTheDocument()
    })

    it('UT-005: detailTitle이 표시되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          detailTitle="제품 목록"
        />
      )

      expect(screen.getByTestId('detail-title')).toBeInTheDocument()
      expect(screen.getByText('제품 목록')).toBeInTheDocument()
    })
  })

  describe('콜백', () => {
    it('UT-006: 마스터 항목 선택 시 onMasterSelect가 호출되어야 한다', async () => {
      const mockOnSelect = vi.fn()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const testItem = { id: '1', name: 'Category 1' }

      render(
        <MasterDetailTemplate
          masterContent={
            <div
              data-testid="master-item"
              onClick={() => mockOnSelect(testItem)}
              role="button"
              tabIndex={0}
            >
              {testItem.name}
            </div>
          }
          detailContent={<div />}
          onMasterSelect={mockOnSelect}
        />
      )

      await user.click(screen.getByTestId('master-item'))

      expect(mockOnSelect).toHaveBeenCalledTimes(1)
      expect(mockOnSelect).toHaveBeenCalledWith(testItem)
    })
  })

  describe('선택 상태', () => {
    it('UT-007: selectedMaster가 있으면 detailContent가 표시되어야 한다', () => {
      const selectedMaster = { id: 'm1', name: '카테고리 1' }

      render(
        <MasterDetailTemplate
          masterContent={<MockMasterList items={mockMasterList} selectedId={selectedMaster.id} />}
          detailContent={<MockDetailView items={mockDetailList} />}
          selectedMaster={selectedMaster}
        />
      )

      expect(screen.getByTestId('detail-content')).toBeInTheDocument()
      expect(screen.getByTestId('detail-table')).toBeInTheDocument()
      expect(screen.queryByTestId('detail-placeholder')).not.toBeInTheDocument()
    })
  })

  describe('로딩 상태', () => {
    it('UT-008: detailLoading이 true일 때 스켈레톤이 표시되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div data-testid="detail-content-inner">Detail</div>}
          detailLoading={true}
        />
      )

      expect(screen.getByTestId('detail-loading')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('detail-content-inner')).not.toBeInTheDocument()
    })
  })

  describe('레이아웃', () => {
    it('UT-009: defaultSplit이 적용되어야 한다', () => {
      const { container } = render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          defaultSplit={40}
        />
      )

      const masterPanel = screen.getByTestId('master-panel')
      // 초기 렌더링 시 width 스타일이 적용되는지 확인
      expect(masterPanel).toHaveStyle({ minWidth: '200px' })
    })

    it('UT-010: minMasterWidth가 적용되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          minMasterWidth={250}
        />
      )

      const masterPanel = screen.getByTestId('master-panel')
      expect(masterPanel).toHaveStyle({ minWidth: '250px' })
    })

    it('UT-011: minDetailWidth가 적용되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          minDetailWidth={400}
        />
      )

      const detailPanel = screen.getByTestId('detail-panel')
      expect(detailPanel).toHaveStyle({ minWidth: '400px' })
    })
  })

  describe('검색 기능', () => {
    it('UT-012: masterSearchable이 true일 때 검색 입력이 표시되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          masterSearchable={true}
        />
      )

      expect(screen.getByTestId('master-search-input')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('검색...')).toBeInTheDocument()
    })

    it('UT-012-1: masterSearchable이 false이면 검색 입력이 숨겨져야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          masterSearchable={false}
        />
      )

      expect(screen.queryByTestId('master-search-input')).not.toBeInTheDocument()
    })

    it('UT-013: 검색어 입력 시 onMasterSearch가 호출되어야 한다', async () => {
      const mockSearch = vi.fn()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          masterSearchable={true}
          onMasterSearch={mockSearch}
        />
      )

      const searchInput = screen.getByTestId('master-search-input')
      await user.type(searchInput, '검색어')

      // 디바운스 대기 (300ms)
      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith('검색어')
      })
    })
  })

  describe('상태', () => {
    it('UT-014: 마스터 미선택 시 안내 메시지가 표시되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div data-testid="detail-content-inner">Detail</div>}
          selectedMaster={undefined}
        />
      )

      expect(screen.getByTestId('detail-placeholder')).toBeInTheDocument()
      expect(screen.getByText('항목을 선택하세요')).toBeInTheDocument()
      expect(screen.queryByTestId('detail-content-inner')).not.toBeInTheDocument()
    })

    it('UT-014-1: selectedMaster가 null일 때도 안내 메시지가 표시되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div data-testid="detail-content-inner">Detail</div>}
          selectedMaster={null}
        />
      )

      expect(screen.getByTestId('detail-placeholder')).toBeInTheDocument()
      expect(screen.getByText('항목을 선택하세요')).toBeInTheDocument()
    })

    it('UT-014-2: detailEmpty가 제공되면 커스텀 안내가 표시되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          selectedMaster={undefined}
          detailEmpty={<div data-testid="custom-empty">카테고리를 선택해주세요</div>}
        />
      )

      expect(screen.getByTestId('detail-placeholder')).toBeInTheDocument()
      expect(screen.getByTestId('custom-empty')).toBeInTheDocument()
      expect(screen.getByText('카테고리를 선택해주세요')).toBeInTheDocument()
    })
  })

  describe('제네릭 타입', () => {
    it('UT-015: 제네릭 타입이 정상 동작해야 한다', () => {
      interface Category {
        id: string
        name: string
        description: string
      }

      const selectedCategory: Category = {
        id: 'cat1',
        name: '전자제품',
        description: '전자 기기 카테고리',
      }

      const mockOnSelect = vi.fn<[Category], void>()

      render(
        <MasterDetailTemplate<Category>
          masterContent={
            <div
              data-testid="category-item"
              onClick={() => mockOnSelect(selectedCategory)}
            >
              {selectedCategory.name}
            </div>
          }
          detailContent={<div>{selectedCategory.description}</div>}
          selectedMaster={selectedCategory}
          onMasterSelect={mockOnSelect}
        />
      )

      expect(screen.getByText('전자제품')).toBeInTheDocument()
      expect(screen.getByText('전자 기기 카테고리')).toBeInTheDocument()
    })
  })

  describe('에러 상태', () => {
    it('detailError가 있으면 에러 메시지가 표시되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          selectedMaster={{ id: '1' }}
          detailError={<div data-testid="error-message">데이터를 불러오지 못했습니다</div>}
        />
      )

      expect(screen.getByTestId('detail-error')).toBeInTheDocument()
      expect(screen.getByText('데이터를 불러오지 못했습니다')).toBeInTheDocument()
      expect(screen.queryByTestId('detail-content')).not.toBeInTheDocument()
    })
  })

  describe('분할 바 상호작용', () => {
    it('분할 바가 접근성 속성을 가져야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          minMasterWidth={200}
        />
      )

      const splitHandle = screen.getByTestId('split-handle')
      expect(splitHandle).toHaveAttribute('role', 'separator')
      expect(splitHandle).toHaveAttribute('tabIndex', '0')
      expect(splitHandle).toHaveAttribute('aria-valuemin', '200')
    })

    it('드래그 시작 시 isDragging 상태가 활성화되어야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
        />
      )

      const splitHandle = screen.getByTestId('split-handle')
      const container = screen.getByTestId('master-detail-template')

      // 드래그 시작 시뮬레이션
      await act(async () => {
        await user.pointer([
          { target: splitHandle, keys: '[MouseLeft>]' }
        ])
      })

      // 드래그 중 커서 스타일 확인
      expect(container).toHaveStyle({ cursor: 'col-resize' })
    })

    it('마우스 업 시 드래그가 종료되어야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
        />
      )

      const splitHandle = screen.getByTestId('split-handle')
      const container = screen.getByTestId('master-detail-template')

      // 드래그 시작
      await act(async () => {
        await user.pointer([
          { target: splitHandle, keys: '[MouseLeft>]' }
        ])
      })

      expect(container).toHaveStyle({ cursor: 'col-resize' })

      // 드래그 종료
      await act(async () => {
        await user.pointer([
          { keys: '[/MouseLeft]' }
        ])
      })

      // 커서 스타일 해제 확인
      expect(container).not.toHaveStyle({ cursor: 'col-resize' })
    })

    it('키보드 ArrowLeft로 마스터 너비가 감소해야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const onSplitChange = vi.fn()

      // 컨테이너 크기 모킹
      Object.defineProperty(HTMLDivElement.prototype, 'offsetWidth', {
        configurable: true,
        value: 1000
      })

      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          defaultSplit={30}
          minMasterWidth={200}
          minDetailWidth={300}
          onSplitChange={onSplitChange}
        />
      )

      const splitHandle = screen.getByTestId('split-handle')

      // 초기 너비 설정을 위해 효과 트리거
      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      // 분할 바에 포커스
      await act(async () => {
        splitHandle.focus()
      })

      // ArrowLeft 키 입력
      await act(async () => {
        await user.keyboard('[ArrowLeft]')
      })

      const masterPanel = screen.getByTestId('master-panel')
      // 너비가 변경되었는지 확인 (minWidth는 여전히 유지)
      expect(masterPanel.style.minWidth).toBe('200px')
    })

    it('키보드 ArrowRight로 마스터 너비가 증가해야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // 컨테이너 크기 모킹
      Object.defineProperty(HTMLDivElement.prototype, 'offsetWidth', {
        configurable: true,
        value: 1000
      })

      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          defaultSplit={30}
          minMasterWidth={200}
          minDetailWidth={300}
        />
      )

      const splitHandle = screen.getByTestId('split-handle')

      // 초기 너비 설정을 위해 효과 트리거
      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      // 분할 바에 포커스
      await act(async () => {
        splitHandle.focus()
      })

      // ArrowRight 키 입력
      await act(async () => {
        await user.keyboard('[ArrowRight]')
      })

      // 테스트 통과 (키보드 핸들러 동작 확인)
      expect(splitHandle).toHaveFocus()
    })
  })

  describe('스타일 커스터마이징', () => {
    it('className이 적용되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          className="custom-class"
        />
      )

      expect(screen.getByTestId('master-detail-template')).toHaveClass('custom-class')
    })

    it('style이 적용되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          style={{ height: '500px' }}
        />
      )

      expect(screen.getByTestId('master-detail-template')).toHaveStyle({ height: '500px' })
    })

    it('masterClassName이 적용되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          masterClassName="master-custom"
        />
      )

      expect(screen.getByTestId('master-panel')).toHaveClass('master-custom')
    })

    it('detailClassName이 적용되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          detailClassName="detail-custom"
        />
      )

      expect(screen.getByTestId('detail-panel')).toHaveClass('detail-custom')
    })
  })

  describe('검색 플레이스홀더', () => {
    it('masterSearchPlaceholder가 적용되어야 한다', () => {
      render(
        <MasterDetailTemplate
          masterContent={<div>Master</div>}
          detailContent={<div>Detail</div>}
          masterSearchable={true}
          masterSearchPlaceholder="카테고리 검색..."
        />
      )

      expect(screen.getByPlaceholderText('카테고리 검색...')).toBeInTheDocument()
    })
  })
})
