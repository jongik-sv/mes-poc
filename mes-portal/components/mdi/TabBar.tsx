'use client';

/**
 * TabBar 컴포넌트
 * @description TSK-02-02 탭 바 컴포넌트 - 탭 목록 컨테이너
 * @description TSK-02-03 탭 드래그 앤 드롭 기능 추가
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { LeftOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';
import { Dropdown, type MenuProps, theme } from 'antd';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMDI } from '@/lib/mdi';
import { TabItem } from './TabItem';
import { SortableTabItem } from './SortableTabItem';

/** 드롭다운 표시 기준 탭 개수 */
const DROPDOWN_THRESHOLD = 5;

/** 스크롤 이동량 (px) */
const SCROLL_AMOUNT = 200;

/**
 * 탭 바 컴포넌트
 */
export function TabBar() {
  const { token } = theme.useToken();
  const { tabs, activeTabId, setActiveTab, closeTab, reorderTabs, getTab } = useMDI();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // DnD 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px 이상 이동 시 드래그 시작
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // ESC 키로 드래그 취소
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeId) {
        setActiveId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeId]);

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

  // 드래그 시작 핸들러
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // 드래그 종료 핸들러
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      // BR-03: 탭 바 영역 밖 드롭 시 취소
      if (over && active.id !== over.id) {
        // 홈 탭은 드래그 불가 (SortableTabItem에서 disabled)
        // 홈 탭 위에 드롭 시 -> context에서 홈 바로 다음(index 1)으로 이동 처리
        reorderTabs(active.id as string, over.id as string);
      }

      setActiveId(null);
    },
    [reorderTabs]
  );

  // 드롭다운 메뉴 아이템
  const dropdownItems: MenuProps['items'] = tabs.map((tab) => ({
    key: tab.id,
    label: tab.title,
    onClick: () => handleTabClick(tab.id),
  }));

  // 단일 탭인지 확인 (마지막 탭 보호)
  const isSingleTab = tabs.length === 1;

  // 드래그 중인 탭 정보
  const activeDragTab = activeId ? getTab(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        data-testid="tab-bar"
        data-testid-mdi="mdi-tab-bar"
        className="flex items-center h-10 px-1"
        style={{
          backgroundColor: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {/* 좌측 스크롤 버튼 */}
        {showLeftScroll && (
          <button
            data-testid="tab-scroll-left"
            aria-label="이전 탭"
            onClick={() => handleScroll('left')}
            className="flex items-center justify-center w-6 h-8 flex-shrink-0 rounded"
            style={{
              backgroundColor: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
              color: token.colorTextSecondary,
            }}
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
          <SortableContext
            items={tabs.map((tab) => tab.id)}
            strategy={horizontalListSortingStrategy}
          >
            {tabs.map((tab, index) => (
              <SortableTabItem
                key={tab.id}
                tab={
                  isSingleTab && tab.closable
                    ? { ...tab, closable: false }
                    : tab
                }
                tabIndex={index}
                totalTabs={tabs.length}
                isActive={tab.id === activeTabId}
                onClick={() => handleTabClick(tab.id)}
                onClose={() => handleTabClose(tab.id)}
              />
            ))}
          </SortableContext>
        </div>

        {/* 우측 스크롤 버튼 */}
        {showRightScroll && (
          <button
            data-testid="tab-scroll-right"
            aria-label="다음 탭"
            onClick={() => handleScroll('right')}
            className="flex items-center justify-center w-6 h-8 flex-shrink-0 rounded"
            style={{
              backgroundColor: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
              color: token.colorTextSecondary,
            }}
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
              className="flex items-center justify-center w-6 h-8 ml-1 flex-shrink-0 rounded"
              style={{
                backgroundColor: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                color: token.colorTextSecondary,
              }}
            >
              <DownOutlined className="text-xs" />
            </button>
          </Dropdown>
        )}
      </div>

      {/* 드래그 오버레이 (마우스를 따라다니는 탭) */}
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeDragTab ? (
          <div
            className="shadow-lg opacity-90 rounded"
            style={{ backgroundColor: token.colorBgContainer }}
          >
            <TabItem
              tab={activeDragTab}
              isActive={activeDragTab.id === activeTabId}
              onClick={() => {}}
              onClose={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
