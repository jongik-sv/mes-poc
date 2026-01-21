// components/common/GlobalSearch.tsx
// TSK-01-05: 전역 검색 모달 컴포넌트
'use client'

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  type KeyboardEvent,
} from 'react'
import { Modal, Input, theme } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { MenuIcon } from '../layout/MenuIcon'

/**
 * 검색 가능한 메뉴 아이템 인터페이스
 */
export interface SearchableMenuItem {
  id: string
  code: string
  name: string
  path?: string
  icon?: string
  sortOrder: number
  children?: SearchableMenuItem[]
}

/**
 * 검색 결과 인터페이스
 */
export interface SearchResult {
  menu: SearchableMenuItem
  breadcrumb: string
  matchIndices: number[]
}

/**
 * GlobalSearch Props
 */
export interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  menus: SearchableMenuItem[]
  onSelect: (menu: SearchableMenuItem) => void
}

/**
 * 메뉴 평탄화 및 breadcrumb 생성
 */
function flattenMenus(
  menus: SearchableMenuItem[],
  parentPath: string[] = []
): SearchResult[] {
  const results: SearchResult[] = []

  for (const menu of menus) {
    const currentPath = [...parentPath, menu.name]

    results.push({
      menu,
      breadcrumb: currentPath.join(' > '),
      matchIndices: [],
    })

    if (menu.children && menu.children.length > 0) {
      results.push(...flattenMenus(menu.children, currentPath))
    }
  }

  return results
}

/**
 * 메뉴 검색 함수
 * BR-001: 메뉴명 검색
 * BR-002: 대소문자 구분 없이 검색
 * BR-003: 부분 일치 검색
 */
export function filterMenus(
  menus: SearchableMenuItem[],
  searchTerm: string
): SearchResult[] {
  if (!searchTerm.trim()) {
    return []
  }

  const allMenus = flattenMenus(menus)
  const normalizedSearch = searchTerm.toLowerCase()

  return allMenus.filter((result) => {
    const normalizedName = result.menu.name.toLowerCase()
    return normalizedName.includes(normalizedSearch)
  })
}

/**
 * 검색어 하이라이트 컴포넌트
 */
function HighlightedText({
  text,
  searchTerm,
}: {
  text: string
  searchTerm: string
}) {
  if (!searchTerm.trim()) {
    return <span>{text}</span>
  }

  const normalizedSearch = searchTerm.toLowerCase()
  const normalizedText = text.toLowerCase()
  const index = normalizedText.indexOf(normalizedSearch)

  if (index === -1) {
    return <span>{text}</span>
  }

  const before = text.slice(0, index)
  const match = text.slice(index, index + searchTerm.length)
  const after = text.slice(index + searchTerm.length)

  return (
    <span>
      {before}
      <mark className="bg-yellow-200 dark:bg-yellow-600 px-0.5 rounded">
        {match}
      </mark>
      {after}
    </span>
  )
}

/**
 * GlobalSearch 컴포넌트
 */
export function GlobalSearch({
  isOpen,
  onClose,
  menus,
  onSelect,
}: GlobalSearchProps) {
  const { token } = theme.useToken()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // 검색 결과
  const searchResults = useMemo(() => {
    return filterMenus(menus, searchTerm)
  }, [menus, searchTerm])

  // 모달이 열릴 때 입력창 포커스 및 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setSelectedIndex(0)
      // 약간의 딜레이 후 포커스 (모달 애니메이션 완료 후)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // 선택된 항목이 보이도록 스크롤
  useEffect(() => {
    if (listRef.current && searchResults.length > 0) {
      const selectedElement = listRef.current.querySelector('.selected')
      if (selectedElement && typeof selectedElement.scrollIntoView === 'function') {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex, searchResults.length])

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : prev
          )
          break

        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
          break

        case 'Enter':
          e.preventDefault()
          if (searchResults.length > 0 && searchResults[selectedIndex]) {
            const selectedMenu = searchResults[selectedIndex].menu
            // BR-005: path가 있는 화면 메뉴만 선택 가능
            if (selectedMenu.path) {
              onSelect(selectedMenu)
              onClose()
            }
          }
          break

        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    },
    [searchResults, selectedIndex, onSelect, onClose]
  )

  // 검색 결과 아이템 클릭 핸들러
  const handleResultClick = useCallback(
    (result: SearchResult) => {
      // BR-005: path가 있는 화면 메뉴만 선택 가능
      if (result.menu.path) {
        onSelect(result.menu)
        onClose()
      }
    },
    [onSelect, onClose]
  )

  // 검색어 변경 시 선택 인덱스 초기화
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value)
      setSelectedIndex(0)
    },
    []
  )

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered={false}
      width={480}
      maskClosable={true}
      keyboard={false} // 자체 키보드 핸들링 사용
      styles={{
        body: { padding: 0 },
        content: { marginTop: '10vh' },
      }}
      rootClassName="global-search-modal"
      aria-modal="true"
      aria-label="전역 검색"
    >
      {/* 검색 입력창 - data-testid를 Modal 내부 컨텐츠에 배치 */}
      <div data-testid="global-search-modal">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <Input
          ref={inputRef as unknown as React.Ref<HTMLInputElement>}
          placeholder="메뉴 또는 화면 검색..."
          prefix={<SearchOutlined className="text-gray-400" />}
          suffix={
            <span
              className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              data-testid="global-search-hint"
            >
              Ctrl+K
            </span>
          }
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          size="large"
          data-testid="global-search-input"
          aria-label="검색어 입력"
          role="combobox"
          aria-expanded={searchResults.length > 0}
          aria-controls="search-results"
          aria-activedescendant={
            searchResults.length > 0
              ? `search-result-item-${searchResults[selectedIndex]?.menu.id}`
              : undefined
          }
        />
        </div>

        {/* 검색 결과 영역 */}
        <div
          ref={listRef}
          className="max-h-80 overflow-y-auto"
          data-testid="search-results"
          role="listbox"
          id="search-results"
        >
          {searchTerm && searchResults.length === 0 ? (
            // 결과 없음
            <div
              className="py-12 flex flex-col items-center justify-center"
              data-testid="search-no-results"
            >
              <SearchOutlined className="text-4xl text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                검색 결과가 없습니다.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                다른 검색어를 입력해 주세요.
              </p>
            </div>
          ) : (
            // 검색 결과 목록
            searchResults.map((result, index) => {
              const isSelected = index === selectedIndex
              const isFolder = !result.menu.path

              return (
                <div
                  key={result.menu.id}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors
                    ${isSelected ? 'selected bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
                    ${isFolder ? 'opacity-50' : ''}
                  `}
                  style={
                    isSelected
                      ? {
                          borderLeft: `3px solid ${token.colorPrimary}`,
                        }
                      : { borderLeft: '3px solid transparent' }
                  }
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  data-testid={`search-result-item-${result.menu.id}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={isFolder}
                >
                  <div className="flex items-center gap-3">
                    {/* 아이콘 */}
                    <span
                      className="text-lg"
                      style={{ color: isSelected ? token.colorPrimary : token.colorTextSecondary }}
                    >
                      <MenuIcon iconName={result.menu.icon} />
                    </span>

                    {/* 메뉴 정보 */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium truncate ${
                          isSelected
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <HighlightedText
                          text={result.menu.name}
                          searchTerm={searchTerm}
                        />
                        {isFolder && (
                          <span className="ml-2 text-xs text-gray-400">(폴더)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {result.breadcrumb}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* 키보드 힌트 */}
        <div
          className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex gap-4 text-xs text-gray-400 dark:text-gray-500"
          data-testid="search-keyboard-hints"
        >
          <span>↑↓ 이동</span>
          <span>↵ 열기</span>
          <span>esc 닫기</span>
        </div>
      </div>
    </Modal>
  )
}
