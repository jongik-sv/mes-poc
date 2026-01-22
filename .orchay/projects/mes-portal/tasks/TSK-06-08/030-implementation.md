# TSK-06-08: 구현 보고서

## 1. 구현 개요

| 항목 | 내용 |
|------|------|
| **Task ID** | TSK-06-08 |
| **Task 명** | [샘플] 카테고리-제품 마스터-디테일 |
| **구현 일시** | 2026-01-22 |
| **구현 방식** | TDD (Test-Driven Development) |
| **상태** | 구현 완료 |

## 2. 구현 파일 목록

### 2.1 소스 코드

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `screens/sample/CategoryProduct/index.tsx` | 메인 컴포넌트 | 270 |
| `screens/sample/CategoryProduct/types.ts` | 타입 정의 | 70 |
| `screens/sample/CategoryProduct/utils.ts` | 유틸리티 함수 | 108 |
| `app/(portal)/sample/category-product/page.tsx` | 라우트 페이지 | 9 |
| `mock-data/categories-products.json` | Mock 데이터 | 350+ |

### 2.2 테스트 코드

| 파일 경로 | 테스트 수 |
|-----------|-----------|
| `screens/sample/CategoryProduct/__tests__/CategoryProduct.spec.tsx` | 20 |

## 3. 아키텍처

### 3.1 컴포넌트 구조

```
CategoryProduct (screens/sample/CategoryProduct/)
├── index.tsx          # 메인 컴포넌트
│   └── MasterDetailTemplate  # 템플릿 활용
│       ├── masterContent     # 카테고리 트리 (Ant Design Tree)
│       └── detailContent     # 제품 테이블 (Ant Design Table)
├── types.ts           # Category, Product 타입 정의
├── utils.ts           # 유틸리티 함수
│   ├── findCategoryById()
│   ├── collectChildCategoryIds()
│   ├── getProductsByCategoryWithChildren()
│   ├── filterProducts()
│   └── categoriesToTreeData()
└── __tests__/
    └── CategoryProduct.spec.tsx
```

### 3.2 데이터 흐름

```
Mock JSON → CategoryProduct → State Management → UI Rendering
                    │
                    ├─ selectedCategoryId (현재 선택된 카테고리)
                    ├─ searchKeyword (검색어)
                    └─ expandedKeys (펼쳐진 트리 노드)
```

## 4. 주요 구현 사항

### 4.1 MasterDetailTemplate 활용

```tsx
<MasterDetailTemplate
  masterTitle="카테고리"
  masterContent={<Tree {...} />}
  detailTitle={`${selectedCategory.name} 제품 목록`}
  detailContent={selectedCategory ? <Table {...} /> : null}
  detailEmpty={<Empty />}
  selectedMaster={selectedCategory}
  defaultSplit={30}
  minMasterWidth={200}
  minDetailWidth={300}
/>
```

### 4.2 상위 카테고리 선택 시 하위 제품 표시 (BR-002)

```typescript
// utils.ts
export function getProductsByCategoryWithChildren(
  categoryId: string,
  categories: Category[],
  products: Product[]
): Product[] {
  const categoryIds = collectChildCategoryIds(categoryId, categories)
  return products.filter((product) => categoryIds.includes(product.categoryId))
}
```

### 4.3 대소문자 무시 검색 (BR-005)

```typescript
// utils.ts
export function filterProducts(
  products: Product[],
  searchKeyword: string
): Product[] {
  const keyword = searchKeyword.toLowerCase().trim()
  return products.filter(
    (product) =>
      product.code.toLowerCase().includes(keyword) ||
      product.name.toLowerCase().includes(keyword)
  )
}
```

### 4.4 트리 자동 펼침

```typescript
// index.tsx
const [expandedKeys, setExpandedKeys] = useState<Key[]>(() => {
  const collectKeys = (cats: Category[]): string[] => {
    return cats.flatMap((cat) => [
      cat.id,
      ...(cat.children ? collectKeys(cat.children) : []),
    ])
  }
  return collectKeys(categories)
})
```

## 5. 비즈니스 규칙 구현

| BR ID | 요구사항 | 구현 위치 | 구현 방식 |
|-------|----------|-----------|-----------|
| BR-001 | 카테고리 미선택 시 안내 메시지 | index.tsx:232-243 | `detailEmpty` prop으로 Empty 컴포넌트 전달 |
| BR-002 | 상위 카테고리 선택 시 하위 제품 모두 표시 | utils.ts:60-67 | `collectChildCategoryIds`로 재귀적 ID 수집 |
| BR-003 | 패널 최소 너비 유지 | index.tsx:262-264 | `minMasterWidth`, `minDetailWidth` props |
| BR-004 | 제품 없는 카테고리 선택 시 Empty 상태 | index.tsx:211-227 | `filteredProducts.length > 0` 조건 분기 |
| BR-005 | 검색 대소문자 무시 | utils.ts:76-90 | `toLowerCase()` 적용 |

## 6. 사용된 기술 스택

### 6.1 UI 컴포넌트

| 컴포넌트 | 용도 |
|----------|------|
| `Tree` | 카테고리 트리 표시 |
| `Table` | 제품 목록 표시 |
| `Input` | 검색 입력 |
| `Tag` | 제품 상태 표시 |
| `Empty` | 빈 상태 표시 |
| `Typography.Text` | 안내 메시지 |

### 6.2 Ant Design Icons

| 아이콘 | 용도 |
|--------|------|
| `SearchOutlined` | 검색 입력 접두사 |

### 6.3 React Hooks

| Hook | 용도 |
|------|------|
| `useState` | 카테고리 선택, 검색어, 펼침 상태 관리 |
| `useMemo` | 파생 데이터 계산 (필터링된 제품, 트리 데이터) |
| `useCallback` | 이벤트 핸들러 메모이제이션 |

## 7. 테스트 결과 요약

| 항목 | 결과 |
|------|------|
| 총 테스트 수 | 20 |
| 통과 | 20 (100%) |
| 커버리지 (Statements) | 93.05% |
| 커버리지 (Branch) | 94.44% |
| 커버리지 (Functions) | 83.87% |
| 커버리지 (Lines) | 92.30% |

## 8. 라우트 설정

```
/sample/category-product → app/(portal)/sample/category-product/page.tsx
                         → screens/sample/CategoryProduct/index.tsx
```

## 9. Props 인터페이스

```typescript
interface CategoryProductProps {
  /** 마스터/디테일 초기 분할 비율 [마스터%, 디테일%] */
  defaultSplit?: [number, number]
  /** 마스터 패널 최소 너비 (px, 기본: 200) */
  minMasterWidth?: number
  /** 디테일 패널 최소 너비 (px, 기본: 300) */
  minDetailWidth?: number
}
```

## 10. 결론

### 10.1 완료 항목

- [x] MasterDetailTemplate 기반 레이아웃 구현
- [x] 카테고리 트리 (Tree 컴포넌트) 구현
- [x] 제품 목록 테이블 (Table 컴포넌트) 구현
- [x] 검색 필터링 기능 구현
- [x] 빈 상태 처리 (Empty 컴포넌트)
- [x] Mock 데이터 연동
- [x] 단위 테스트 20개 작성 및 통과
- [x] 커버리지 목표 달성 (80% 이상)

### 10.2 다음 단계

- [ ] E2E 테스트 실행 (`/wf:verify`)
- [ ] 실제 API 연동 (추후)
