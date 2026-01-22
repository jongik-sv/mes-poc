// screens/sample/CategoryProduct/utils.ts
// 카테고리-제품 유틸리티 함수 (TSK-06-08)

import type { Category, Product } from './types'

/**
 * 특정 카테고리와 모든 하위 카테고리 ID를 재귀적으로 수집
 * @param categoryId 대상 카테고리 ID
 * @param categories 전체 카테고리 목록
 * @returns 해당 카테고리 및 모든 하위 카테고리 ID 배열
 */
export function collectChildCategoryIds(
  categoryId: string,
  categories: Category[]
): string[] {
  const result: string[] = [categoryId]

  // 해당 카테고리 찾기 (재귀적 검색)
  const category = findCategoryById(categoryId, categories)

  if (category?.children) {
    category.children.forEach((child) => {
      result.push(...collectChildCategoryIds(child.id, categories))
    })
  }

  return result
}

/**
 * 카테고리 ID로 카테고리 찾기 (재귀 검색)
 * @param categoryId 찾을 카테고리 ID
 * @param categories 전체 카테고리 목록
 * @returns 찾은 카테고리 또는 undefined
 */
export function findCategoryById(
  categoryId: string,
  categories: Category[]
): Category | undefined {
  for (const category of categories) {
    if (category.id === categoryId) {
      return category
    }
    if (category.children) {
      const found = findCategoryById(categoryId, category.children)
      if (found) return found
    }
  }
  return undefined
}

/**
 * 상위 카테고리와 모든 하위 카테고리의 제품을 조회
 * BR-02: 상위 카테고리 선택 시 하위 제품 모두 표시
 * @param categoryId 선택된 카테고리 ID
 * @param categories 전체 카테고리 목록
 * @param products 전체 제품 목록
 * @returns 해당 카테고리와 하위 카테고리에 속하는 제품 배열
 */
export function getProductsByCategoryWithChildren(
  categoryId: string,
  categories: Category[],
  products: Product[]
): Product[] {
  const categoryIds = collectChildCategoryIds(categoryId, categories)
  return products.filter((product) => categoryIds.includes(product.categoryId))
}

/**
 * 제품 검색 필터링
 * BR-05: 검색은 코드, 제품명에서 수행 (대소문자 무시)
 * @param products 제품 목록
 * @param searchKeyword 검색어
 * @returns 필터링된 제품 목록
 */
export function filterProducts(
  products: Product[],
  searchKeyword: string
): Product[] {
  if (!searchKeyword.trim()) {
    return products
  }

  const keyword = searchKeyword.toLowerCase().trim()
  return products.filter(
    (product) =>
      product.code.toLowerCase().includes(keyword) ||
      product.name.toLowerCase().includes(keyword)
  )
}

/**
 * 카테고리 트리를 Ant Design Tree에 맞는 형식으로 변환
 * @param categories 카테고리 목록
 * @returns Ant Design TreeDataNode 형식 배열
 */
export function categoriesToTreeData(
  categories: Category[]
): { key: string; title: string; children?: { key: string; title: string }[] }[] {
  return categories.map((category) => ({
    key: category.id,
    title: category.name,
    children: category.children
      ? categoriesToTreeData(category.children)
      : undefined,
  }))
}
