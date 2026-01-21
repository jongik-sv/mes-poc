'use client';

/**
 * TabBar 컴포넌트
 * @description TSK-02-02 탭 바 컴포넌트 - 탭 목록 컨테이너
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { LeftOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';
import { Dropdown, type MenuProps } from 'antd';
import { useMDI } from '@/lib/mdi';
import { TabItem } from './TabItem';

/** 드롭다운 표시 기준 탭 개수 */
const DROPDOWN_THRESHOLD = 5;

/** 스크롤 이동량 (px) */
const SCROLL_AMOUNT = 200;

/**
 * 탭 바 컴포넌트
 */
export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useMDI();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  // 스크롤 상태 업데이트
  const updateScrollState = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  // 스크롤 상태 감지
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateScrollState();

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);

    container.addEventListener('scroll', updateScrollState);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('scroll', updateScrollState);
    };
  }, [updateScrollState, tabs.length]);

  // 스크롤 핸들러
  const handleScroll = useCallback((direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;

    const amount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    container.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

  // 탭 클릭 핸들러
  const handleTabClick = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
    },
    [setActiveTab]
  );

  // 탭 닫기 핸들러
  const handleTabClose = useCallback(
    (tabId: string) => {
      closeTab(tabId);
    },
    [closeTab]
  );

  // 드롭다운 메뉴 아이템
  const dropdownItems: MenuProps['items'] = tabs.map((tab) => ({
    key: tab.id,
    label: tab.title,
    onClick: () => handleTabClick(tab.id),
  }));

  // 단일 탭인지 확인 (마지막 탭 보호)
  const isSingleTab = tabs.length === 1;

  return (
    <div
      data-testid="tab-bar"
      className="flex items-center h-10 bg-gray-50 border-b border-gray-200 px-1"
    >
      {/* 좌측 스크롤 버튼 */}
      {showLeftScroll && (
        <button
          data-testid="tab-scroll-left"
          aria-label="이전 탭"
          onClick={() => handleScroll('left')}
          className="flex items-center justify-center w-6 h-8 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 flex-shrink-0"
        >
          <LeftOutlined className="text-xs" />
        </button>
      )}

      {/* 탭 목록 컨테이너 */}
      <div
        ref={containerRef}
        data-testid="tab-bar-container"
        role="tablist"
        aria-label="열린 탭 목록"
        className="flex flex-1 overflow-x-hidden scroll-smooth py-1"
      >
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={
              isSingleTab && tab.closable
                ? { ...tab, closable: false }
                : tab
            }
            isActive={tab.id === activeTabId}
            onClick={() => handleTabClick(tab.id)}
            onClose={() => handleTabClose(tab.id)}
          />
        ))}
      </div>

      {/* 우측 스크롤 버튼 */}
      {showRightScroll && (
        <button
          data-testid="tab-scroll-right"
          aria-label="다음 탭"
          onClick={() => handleScroll('right')}
          className="flex items-center justify-center w-6 h-8 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 flex-shrink-0"
        >
          <RightOutlined className="text-xs" />
        </button>
      )}

      {/* 드롭다운 메뉴 (탭 5개 초과 시) */}
      {tabs.length > DROPDOWN_THRESHOLD && (
        <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
          <button
            data-testid="tab-dropdown-btn"
            aria-label="모든 탭 보기"
            className="flex items-center justify-center w-6 h-8 ml-1 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 flex-shrink-0"
          >
            <DownOutlined className="text-xs" />
          </button>
        </Dropdown>
      )}
    </div>
  );
}
