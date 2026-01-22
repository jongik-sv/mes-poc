// screens/sample/CategoryProduct/index.tsx
// 카테고리-제품 마스터-디테일 샘플 화면 (TSK-06-08)

'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Tree, Table, Input, Tag, Empty, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { Key } from 'react'
import type { ColumnsType } from 'antd/es/table'
import { MasterDetailTemplate } from '@/components/templates/MasterDetailTemplate'
import mockData from '@/mock-data/categories-products.json'
import type { Category, Product, CategoryProductProps } from './types'
import { STATUS_COLORS, STATUS_LABELS } from './types'
import {
  categoriesToTreeData,
  getProductsByCategoryWithChildren,
  filterProducts,
  findCategoryById,
} from './utils'

const { Text } = Typography

/**
 * 카테고리-제품 마스터-디테일 샘플 화면
 *
 * MasterDetailTemplate을 활용한 샘플 화면입니다.
 * - 좌측: 카테고리 트리
 * - 우측: 선택된 카테고리의 제품 목록
 *
 * @example
 * ```tsx
 * <CategoryProduct />
 * ```
 */
export function CategoryProduct({
  defaultSplit,
  minMasterWidth = 200,
  minDetailWidth = 300,
}: CategoryProductProps) {
  // 데이터
  const categories = mockData.categories as Category[]
  const products = mockData.products as Product[]

  // 상태
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [expandedKeys, setExpandedKeys] = useState<Key[]>(() => {
    // 초기 렌더링 시 모든 카테고리 펼침
    const collectKeys = (cats: Category[]): string[] => {
      return cats.flatMap((cat) => [
        cat.id,
        ...(cat.children ? collectKeys(cat.children) : []),
      ])
    }
    return collectKeys(categories)
  })

  // 선택된 카테고리
  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null
    return findCategoryById(selectedCategoryId, categories)
  }, [selectedCategoryId, categories])

  // 선택된 카테고리의 제품 목록 (하위 카테고리 포함)
  const categoryProducts = useMemo(() => {
    if (!selectedCategoryId) return []
    return getProductsByCategoryWithChildren(
      selectedCategoryId,
      categories,
      products
    )
  }, [selectedCategoryId, categories, products])

  // 검색 필터링된 제품 목록
  const filteredProducts = useMemo(() => {
    return filterProducts(categoryProducts, searchKeyword)
  }, [categoryProducts, searchKeyword])

  // 트리 데이터
  const treeData = useMemo(() => categoriesToTreeData(categories), [categories])

  // 카테고리 선택 핸들러
  const handleCategorySelect = useCallback((selectedKeys: Key[]) => {
    const categoryId = selectedKeys[0]?.toString() || null
    setSelectedCategoryId(categoryId)
    setSearchKeyword('') // 카테고리 변경 시 검색어 초기화
  }, [])

  // 검색 핸들러
  const handleSearch = useCallback((value: string) => {
    setSearchKeyword(value)
  }, [])

  // 트리 펼침/접힘 핸들러
  const handleExpand = useCallback((keys: Key[]) => {
    setExpandedKeys(keys)
  }, [])

  // 제품 테이블 컬럼 정의
  const columns: ColumnsType<Product> = useMemo(
    () => [
      {
        title: '코드',
        dataIndex: 'code',
        key: 'code',
        width: 100,
        sorter: (a, b) => a.code.localeCompare(b.code),
      },
      {
        title: '제품명',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        title: '규격',
        dataIndex: 'spec',
        key: 'spec',
        width: 120,
      },
      {
        title: '단위',
        dataIndex: 'unit',
        key: 'unit',
        width: 60,
        align: 'center',
      },
      {
        title: '가격',
        dataIndex: 'price',
        key: 'price',
        width: 100,
        align: 'right',
        sorter: (a, b) => a.price - b.price,
        render: (value: number) => value.toLocaleString(),
      },
      {
        title: '재고',
        dataIndex: 'stock',
        key: 'stock',
        width: 80,
        align: 'right',
        sorter: (a, b) => a.stock - b.stock,
        render: (value: number) => value.toLocaleString(),
      },
      {
        title: '상태',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        align: 'center',
        render: (status: keyof typeof STATUS_COLORS) => (
          <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
        ),
      },
    ],
    []
  )

  // 마스터 영역 컨텐츠 (카테고리 트리)
  const masterContent = (
    <div data-testid="category-tree" className="h-full">
      <Tree
        treeData={treeData}
        selectedKeys={selectedCategoryId ? [selectedCategoryId] : []}
        expandedKeys={expandedKeys}
        onSelect={handleCategorySelect}
        onExpand={handleExpand}
        defaultExpandAll
        showLine
        blockNode
      />
    </div>
  )

  // 디테일 영역 컨텐츠 (제품 테이블)
  const detailContent = (
    <div data-testid="product-list" className="flex h-full flex-col">
      {/* 검색 영역 */}
      <div className="mb-3 p-3">
        <Input
          data-testid="search-input"
          placeholder="제품 검색 (코드, 제품명)"
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchKeyword}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
        />
      </div>

      {/* 제품 테이블 */}
      {filteredProducts.length > 0 ? (
        <div className="flex-1 overflow-auto px-3">
          <Table
            data-testid="product-table"
            dataSource={filteredProducts}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `총 ${total}건`,
            }}
            onRow={(record) => ({
              'data-testid': `product-row-${record.id}`,
            })}
          />
        </div>
      ) : (
        <div
          data-testid="empty-state"
          className="flex flex-1 items-center justify-center"
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary">
                {searchKeyword
                  ? '검색 결과가 없습니다'
                  : '등록된 제품이 없습니다'}
              </Text>
            }
          />
        </div>
      )}
    </div>
  )

  // 카테고리 미선택 시 안내 메시지
  const emptyPlaceholder = (
    <div data-testid="empty-state" className="flex flex-1 items-center justify-center">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Text type="secondary">
            좌측에서 카테고리를 선택하면 제품 목록이 표시됩니다.
          </Text>
        }
      />
    </div>
  )

  return (
    <div
      data-testid="category-product-page"
      className="h-full"
      style={{ minHeight: '500px' }}
    >
      <MasterDetailTemplate
        masterTitle="카테고리"
        masterContent={masterContent}
        detailTitle={
          selectedCategory
            ? `${selectedCategory.name} 제품 목록`
            : '제품 목록'
        }
        detailContent={selectedCategory ? detailContent : null}
        detailEmpty={emptyPlaceholder}
        selectedMaster={selectedCategory}
        defaultSplit={defaultSplit?.[0] ?? 30}
        minMasterWidth={minMasterWidth}
        minDetailWidth={minDetailWidth}
      />
    </div>
  )
}

export default CategoryProduct
