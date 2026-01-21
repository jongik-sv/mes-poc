# TSK-01-05 구현 보고서

## 문서 정보
- **Task ID**: TSK-01-05
- **Task 명**: 전역 검색 모달
- **구현 일시**: 2026-01-21
- **구현 유형**: Frontend Only

---

## 1. 구현 개요

Ctrl+K 단축키로 열 수 있는 전역 검색 모달 컴포넌트를 구현했습니다. 실시간 메뉴/화면 검색, 키보드 네비게이션, MDI 탭 연동 기능을 제공합니다.

---

## 2. 구현 파일 목록

### 2.1 신규 생성 파일

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `components/common/GlobalSearch.tsx` | 전역 검색 모달 컴포넌트 | 385 |
| `components/layout/MenuIcon.tsx` | 메뉴 아이콘 렌더링 헬퍼 | 55 |
| `components/common/__tests__/GlobalSearch.test.tsx` | 단위 테스트 | 280 |
| `tests/e2e/global-search.spec.ts` | E2E 테스트 | 232 |

### 2.2 수정 파일

| 파일 경로 | 변경 내용 |
|-----------|-----------|
| `components/common/index.ts` | GlobalSearch export 추가 |
| `components/layout/index.ts` | MenuIcon export 추가 |
| `app/(portal)/layout.tsx` | GlobalSearch 컴포넌트 통합 |

---

## 3. 주요 구현 내용

### 3.1 GlobalSearch 컴포넌트

```typescript
// components/common/GlobalSearch.tsx

export interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  menus: SearchableMenuItem[]
  onSelect: (menu: SearchableMenuItem) => void
}

export function GlobalSearch({ isOpen, onClose, menus, onSelect }: GlobalSearchProps) {
  // 검색 상태 관리
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // 검색 결과 필터링 (메모이제이션)
  const searchResults = useMemo(() => {
    return filterMenus(menus, searchTerm)
  }, [menus, searchTerm])

  // 키보드 네비게이션 핸들링
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': // 다음 항목
      case 'ArrowUp':   // 이전 항목
      case 'Enter':     // 선택
      case 'Escape':    // 닫기
    }
  }, [searchResults, selectedIndex, onSelect, onClose])

  return (
    <Modal open={isOpen} onCancel={onClose}>
      {/* 검색 입력창 */}
      <Input placeholder="메뉴 또는 화면 검색..." />

      {/* 검색 결과 목록 */}
      <div role="listbox">
        {searchResults.map((result, index) => (
          <div role="option" key={result.menu.id}>
            <MenuIcon iconName={result.menu.icon} />
            <HighlightedText text={result.menu.name} searchTerm={searchTerm} />
            <span>{result.breadcrumb}</span>
          </div>
        ))}
      </div>

      {/* 키보드 힌트 */}
      <div>↑↓ 이동 | ↵ 열기 | esc 닫기</div>
    </Modal>
  )
}
```

### 3.2 메뉴 검색 함수

```typescript
// 메뉴 평탄화 및 검색
export function filterMenus(
  menus: SearchableMenuItem[],
  searchTerm: string
): SearchResult[] {
  if (!searchTerm.trim()) return []

  const allMenus = flattenMenus(menus) // 중첩 메뉴 평탄화
  const normalizedSearch = searchTerm.toLowerCase()

  return allMenus.filter((result) => {
    const normalizedName = result.menu.name.toLowerCase()
    return normalizedName.includes(normalizedSearch) // 부분 일치, 대소문자 무시
  })
}
```

### 3.3 포털 레이아웃 통합

```typescript
// app/(portal)/layout.tsx

function PortalLayoutContent({ children }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { openTab } = useMDI()

  // 검색 결과 선택 시 MDI 탭 열기
  const handleSearchSelect = useCallback((menu: SearchableMenuItem) => {
    if (menu.path) {
      const tab: Tab = {
        id: menu.id,
        title: menu.name,
        path: menu.path,
        icon: menu.icon,
        closable: menu.id !== '1', // 대시보드 제외
      }
      openTab(tab)
      setIsSearchOpen(false)
    }
  }, [openTab])

  return (
    <PortalLayout header={<Header onSearchOpen={() => setIsSearchOpen(true)} />}>
      {/* ... */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        menus={searchableMenus}
        onSelect={handleSearchSelect}
      />
    </PortalLayout>
  )
}
```

---

## 4. 요구사항 구현 매핑

### 4.1 기능 요구사항 (FR)

| FR ID | 요구사항 | 구현 위치 | 상태 |
|-------|----------|-----------|------|
| FR-001 | Ctrl+K 단축키로 모달 열기 | Header.tsx (기존), layout.tsx | 완료 |
| FR-002 | 실시간 메뉴 검색 | GlobalSearch.tsx:filterMenus | 완료 |
| FR-003 | 화살표 키 네비게이션 | GlobalSearch.tsx:handleKeyDown | 완료 |
| FR-004 | Enter/클릭으로 메뉴 선택 | GlobalSearch.tsx:handleKeyDown, handleResultClick | 완료 |
| FR-005 | Escape로 모달 닫기 | GlobalSearch.tsx:handleKeyDown | 완료 |
| FR-006 | 검색 결과 표시 (아이콘, 이름, 경로) | GlobalSearch.tsx:searchResults.map | 완료 |
| FR-007 | 검색어 하이라이트 | GlobalSearch.tsx:HighlightedText | 완료 |

### 4.2 비즈니스 룰 (BR)

| BR ID | 비즈니스 룰 | 구현 위치 | 상태 |
|-------|-------------|-----------|------|
| BR-001 | 메뉴명 검색 | filterMenus | 완료 |
| BR-002 | 대소문자 구분 없음 | filterMenus:toLowerCase() | 완료 |
| BR-003 | 부분 일치 검색 | filterMenus:includes() | 완료 |
| BR-004 | 빈 결과 상태 표시 | GlobalSearch.tsx:search-no-results | 완료 |
| BR-005 | 폴더 메뉴 선택 불가 | handleKeyDown, handleResultClick:if (menu.path) | 완료 |

---

## 5. 테스트 결과 요약

### 5.1 단위 테스트
- **총 테스트**: 18
- **통과**: 18
- **실패**: 0
- **통과율**: 100%

### 5.2 E2E 테스트
- **총 테스트**: 13
- **통과**: 13
- **실패**: 0
- **통과율**: 100%

---

## 6. 접근성 (A11y) 구현

| 속성 | 적용 위치 | 설명 |
|------|-----------|------|
| `role="combobox"` | 검색 입력창 | 콤보박스 역할 |
| `role="listbox"` | 검색 결과 영역 | 리스트박스 역할 |
| `role="option"` | 검색 결과 아이템 | 옵션 역할 |
| `aria-selected` | 검색 결과 아이템 | 선택 상태 |
| `aria-disabled` | 폴더 메뉴 | 비활성화 상태 |
| `aria-expanded` | 검색 입력창 | 결과 표시 상태 |
| `aria-activedescendant` | 검색 입력창 | 현재 선택된 항목 |
| `aria-modal` | 모달 | 모달 다이얼로그 |
| `aria-label` | 모달, 입력창 | 레이블 |

---

## 7. 스타일링

- **Ant Design**: Modal, Input 컴포넌트 사용
- **TailwindCSS**: 레이아웃 및 간격 보조
- **Ant Design Token**: 색상 테마 적용 (`token.colorPrimary`, `token.colorTextSecondary`)
- **다크 모드**: `dark:` 접두사로 다크 테마 지원

---

## 8. 성능 최적화

| 최적화 항목 | 구현 방식 |
|-------------|-----------|
| 검색 결과 메모이제이션 | `useMemo(() => filterMenus(...), [menus, searchTerm])` |
| 이벤트 핸들러 메모이제이션 | `useCallback()` 사용 |
| 스크롤 성능 | `scrollIntoView({ block: 'nearest' })` |
| 조건부 렌더링 | `isOpen` 상태에 따른 렌더링 |

---

## 9. 알려진 제한사항

1. **검색 범위**: 현재 메뉴명만 검색 가능 (코드, 설명 검색은 미지원)
2. **검색 알고리즘**: 단순 부분 일치 (퍼지 검색, 초성 검색 미지원)
3. **최근 검색어**: 검색 히스토리 저장 미구현

---

## 10. 결론

TSK-01-05 전역 검색 모달 기능이 성공적으로 구현되었습니다.

- 모든 기능 요구사항(FR) 및 비즈니스 룰(BR) 충족
- 단위 테스트 18개, E2E 테스트 13개 모두 통과 (100%)
- 접근성(A11y) 기준 준수
- MDI 탭 시스템과 정상 연동
