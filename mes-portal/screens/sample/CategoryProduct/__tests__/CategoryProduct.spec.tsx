// screens/sample/CategoryProduct/__tests__/CategoryProduct.spec.tsx
// 카테고리-제품 마스터-디테일 샘플 화면 단위 테스트 (TSK-06-08)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CategoryProduct from '../index'
import {
  collectChildCategoryIds,
  findCategoryById,
  getProductsByCategoryWithChildren,
  filterProducts,
  categoriesToTreeData,
} from '../utils'
import type { Category, Product } from '../types'

// Mock 카테고리 데이터
const mockCategories: Category[] = [
  {
    id: '1',
    name: '전자부품',
    icon: 'cpu',
    parentId: null,
    children: [
      { id: '11', name: '반도체', icon: 'chip', parentId: '1' },
      { id: '12', name: '커넥터', icon: 'plug', parentId: '1' },
    ],
  },
  {
    id: '2',
    name: '기계부품',
    icon: 'settings',
    parentId: null,
    children: [
      { id: '21', name: '베어링', icon: 'circle', parentId: '2' },
    ],
  },
  {
    id: '99',
    name: '빈 카테고리',
    icon: 'folder',
    parentId: null,
  },
]

// Mock 제품 데이터
const mockProducts: Product[] = [
  {
    id: '101',
    categoryId: '11',
    code: 'SC-001',
    name: '메모리 칩 8GB',
    spec: 'DDR4-3200',
    unit: 'EA',
    price: 15000,
    stock: 500,
    status: 'active',
  },
  {
    id: '102',
    categoryId: '11',
    code: 'SC-002',
    name: '메모리 칩 16GB',
    spec: 'DDR4-3200',
    unit: 'EA',
    price: 28000,
    stock: 320,
    status: 'active',
  },
  {
    id: '103',
    categoryId: '12',
    code: 'CN-001',
    name: 'USB 커넥터 Type-A',
    spec: 'USB 3.0',
    unit: 'EA',
    price: 500,
    stock: 2000,
    status: 'active',
  },
  {
    id: '201',
    categoryId: '21',
    code: 'BR-001',
    name: '볼 베어링 6205',
    spec: '25x52x15mm',
    unit: 'EA',
    price: 3500,
    stock: 1200,
    status: 'active',
  },
]

// Mock JSON import
vi.mock('@/mock-data/categories-products.json', () => ({
  default: {
    categories: [
      {
        id: '1',
        name: '전자부품',
        icon: 'cpu',
        parentId: null,
        children: [
          { id: '11', name: '반도체', icon: 'chip', parentId: '1' },
          { id: '12', name: '커넥터', icon: 'plug', parentId: '1' },
        ],
      },
      {
        id: '2',
        name: '기계부품',
        icon: 'settings',
        parentId: null,
        children: [
          { id: '21', name: '베어링', icon: 'circle', parentId: '2' },
        ],
      },
      {
        id: '99',
        name: '빈 카테고리',
        icon: 'folder',
        parentId: null,
      },
    ],
    products: [
      {
        id: '101',
        categoryId: '11',
        code: 'SC-001',
        name: '메모리 칩 8GB',
        spec: 'DDR4-3200',
        unit: 'EA',
        price: 15000,
        stock: 500,
        status: 'active',
      },
      {
        id: '102',
        categoryId: '11',
        code: 'SC-002',
        name: '메모리 칩 16GB',
        spec: 'DDR4-3200',
        unit: 'EA',
        price: 28000,
        stock: 320,
        status: 'active',
      },
      {
        id: '103',
        categoryId: '12',
        code: 'CN-001',
        name: 'USB 커넥터 Type-A',
        spec: 'USB 3.0',
        unit: 'EA',
        price: 500,
        stock: 2000,
        status: 'active',
      },
      {
        id: '201',
        categoryId: '21',
        code: 'BR-001',
        name: '볼 베어링 6205',
        spec: '25x52x15mm',
        unit: 'EA',
        price: 3500,
        stock: 1200,
        status: 'active',
      },
    ],
  },
}))

describe('유틸리티 함수 테스트', () => {
  describe('findCategoryById', () => {
    it('최상위 카테고리를 찾을 수 있다', () => {
      const category = findCategoryById('1', mockCategories)
      expect(category).toBeDefined()
      expect(category?.name).toBe('전자부품')
    })

    it('하위 카테고리를 찾을 수 있다', () => {
      const category = findCategoryById('11', mockCategories)
      expect(category).toBeDefined()
      expect(category?.name).toBe('반도체')
    })

    it('존재하지 않는 카테고리는 undefined를 반환한다', () => {
      const category = findCategoryById('999', mockCategories)
      expect(category).toBeUndefined()
    })
  })

  describe('collectChildCategoryIds', () => {
    it('자식이 없는 카테고리는 자신의 ID만 반환한다', () => {
      const ids = collectChildCategoryIds('11', mockCategories)
      expect(ids).toEqual(['11'])
    })

    it('자식이 있는 카테고리는 모든 하위 ID를 반환한다', () => {
      const ids = collectChildCategoryIds('1', mockCategories)
      expect(ids).toContain('1')
      expect(ids).toContain('11')
      expect(ids).toContain('12')
      expect(ids).toHaveLength(3)
    })
  })

  describe('getProductsByCategoryWithChildren', () => {
    it('UT-011: 상위 카테고리 선택 시 하위 카테고리의 모든 제품이 반환된다', () => {
      const products = getProductsByCategoryWithChildren(
        '1',
        mockCategories,
        mockProducts
      )
      // 전자부품(1)의 하위: 반도체(11) 2개 + 커넥터(12) 1개 = 3개
      expect(products).toHaveLength(3)
      expect(products.map((p) => p.id)).toContain('101')
      expect(products.map((p) => p.id)).toContain('102')
      expect(products.map((p) => p.id)).toContain('103')
    })

    it('리프 카테고리 선택 시 해당 제품만 반환된다', () => {
      const products = getProductsByCategoryWithChildren(
        '11',
        mockCategories,
        mockProducts
      )
      expect(products).toHaveLength(2)
      expect(products.every((p) => p.categoryId === '11')).toBe(true)
    })
  })

  describe('filterProducts', () => {
    it('UT-004: 검색어로 제품을 필터링할 수 있다', () => {
      const filtered = filterProducts(mockProducts, '메모리')
      expect(filtered).toHaveLength(2)
      expect(filtered.every((p) => p.name.includes('메모리'))).toBe(true)
    })

    it('코드로도 검색할 수 있다', () => {
      const filtered = filterProducts(mockProducts, 'CN-001')
      expect(filtered).toHaveLength(1)
      expect(filtered[0].code).toBe('CN-001')
    })

    it('BR-005: 대소문자를 무시하고 검색한다', () => {
      const filtered = filterProducts(mockProducts, 'usb')
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('USB 커넥터 Type-A')
    })

    it('빈 검색어는 전체 목록을 반환한다', () => {
      const filtered = filterProducts(mockProducts, '')
      expect(filtered).toHaveLength(mockProducts.length)
    })
  })

  describe('categoriesToTreeData', () => {
    it('카테고리를 트리 데이터 형식으로 변환한다', () => {
      const treeData = categoriesToTreeData(mockCategories)
      expect(treeData).toHaveLength(3)
      expect(treeData[0].key).toBe('1')
      expect(treeData[0].title).toBe('전자부품')
      expect(treeData[0].children).toHaveLength(2)
    })
  })
})

describe('CategoryProduct 컴포넌트', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('렌더링', () => {
    it('UT-001: 마스터와 디테일 영역이 렌더링되어야 한다', async () => {
      render(<CategoryProduct />)

      // 페이지 컨테이너 확인
      expect(screen.getByTestId('category-product-page')).toBeInTheDocument()

      // 카테고리 트리 영역 확인
      expect(screen.getByTestId('category-tree')).toBeInTheDocument()

      // 마스터/디테일 패널 확인
      expect(screen.getByTestId('master-panel')).toBeInTheDocument()
      expect(screen.getByTestId('detail-panel')).toBeInTheDocument()

      // 분할 바 확인
      expect(screen.getByTestId('split-handle')).toBeInTheDocument()
    })

    it('UT-007: 트리 노드가 표시되어야 한다', async () => {
      render(<CategoryProduct />)

      // 카테고리 트리에서 항목 확인
      await waitFor(() => {
        expect(screen.getByText('전자부품')).toBeInTheDocument()
        expect(screen.getByText('기계부품')).toBeInTheDocument()
      })
    })
  })

  describe('카테고리 선택', () => {
    it('UT-002: 카테고리 선택 시 해당 카테고리의 제품 목록이 표시되어야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CategoryProduct />)

      // 반도체 카테고리 선택
      await waitFor(() => {
        expect(screen.getByText('반도체')).toBeInTheDocument()
      })

      await act(async () => {
        await user.click(screen.getByText('반도체'))
        vi.advanceTimersByTime(100)
      })

      // 해당 카테고리의 제품 목록 표시 확인
      await waitFor(() => {
        expect(screen.getByTestId('product-table')).toBeInTheDocument()
        expect(screen.getByText('메모리 칩 8GB')).toBeInTheDocument()
        expect(screen.getByText('메모리 칩 16GB')).toBeInTheDocument()
      })
    })
  })

  describe('제품 목록', () => {
    it('UT-003: 제품 데이터가 테이블에 렌더링되어야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CategoryProduct />)

      // 반도체 카테고리 선택
      await waitFor(() => {
        expect(screen.getByText('반도체')).toBeInTheDocument()
      })

      await act(async () => {
        await user.click(screen.getByText('반도체'))
        vi.advanceTimersByTime(100)
      })

      // 테이블 헤더 확인
      await waitFor(() => {
        expect(screen.getByText('코드')).toBeInTheDocument()
        expect(screen.getByText('제품명')).toBeInTheDocument()
        expect(screen.getByText('규격')).toBeInTheDocument()
        expect(screen.getByText('단위')).toBeInTheDocument()
        expect(screen.getByText('가격')).toBeInTheDocument()
        expect(screen.getByText('재고')).toBeInTheDocument()
        expect(screen.getByText('상태')).toBeInTheDocument()
      })

      // 제품 데이터 확인
      expect(screen.getByText('SC-001')).toBeInTheDocument()
      expect(screen.getByText('메모리 칩 8GB')).toBeInTheDocument()
    })
  })

  describe('빈 상태', () => {
    it('UT-005: 제품이 없는 카테고리 선택 시 Empty 상태가 표시되어야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CategoryProduct />)

      // 빈 카테고리 선택
      await waitFor(() => {
        expect(screen.getByText('빈 카테고리')).toBeInTheDocument()
      })
      await user.click(screen.getByText('빈 카테고리'))

      // Empty 상태 표시 확인
      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument()
        expect(screen.getByText(/제품이 없습니다|등록된 제품이 없습니다/)).toBeInTheDocument()
      })
    })

    it('UT-006: 카테고리 미선택 시 안내 메시지가 표시되어야 한다', () => {
      render(<CategoryProduct />)

      // 안내 메시지 확인
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(
        screen.getByText(/카테고리를 선택하세요|좌측에서 카테고리를 선택/)
      ).toBeInTheDocument()
    })
  })

  describe('검색 필터링', () => {
    it('UT-004: 검색어 입력 시 제품 목록이 필터링되어야 한다', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CategoryProduct />)

      // 전자부품 카테고리 선택 (상위 카테고리)
      await waitFor(() => {
        expect(screen.getByText('전자부품')).toBeInTheDocument()
      })
      await user.click(screen.getByText('전자부품'))

      // 제품 목록 로딩 확인
      await waitFor(() => {
        expect(screen.getByTestId('product-table')).toBeInTheDocument()
        // 전자부품 하위의 모든 제품 (3개)
        expect(screen.getByText('메모리 칩 8GB')).toBeInTheDocument()
        expect(screen.getByText('USB 커넥터 Type-A')).toBeInTheDocument()
      })

      // 검색 입력
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, '메모리')

      // 디바운스 대기
      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      // 필터링된 결과 확인
      await waitFor(() => {
        expect(screen.getByText('메모리 칩 8GB')).toBeInTheDocument()
        expect(screen.getByText('메모리 칩 16GB')).toBeInTheDocument()
        expect(screen.queryByText('USB 커넥터 Type-A')).not.toBeInTheDocument()
      })
    })
  })

  describe('레이아웃', () => {
    it('UT-012: 패널 최소 너비가 유지되어야 한다', () => {
      const MIN_MASTER_WIDTH = 250
      const MIN_DETAIL_WIDTH = 350

      render(
        <CategoryProduct
          minMasterWidth={MIN_MASTER_WIDTH}
          minDetailWidth={MIN_DETAIL_WIDTH}
        />
      )

      // 마스터 패널 최소 너비 확인
      const masterPanel = screen.getByTestId('master-panel')
      expect(masterPanel).toHaveStyle({ minWidth: `${MIN_MASTER_WIDTH}px` })

      // 디테일 패널 최소 너비 확인
      const detailPanel = screen.getByTestId('detail-panel')
      expect(detailPanel).toHaveStyle({ minWidth: `${MIN_DETAIL_WIDTH}px` })
    })
  })
})
