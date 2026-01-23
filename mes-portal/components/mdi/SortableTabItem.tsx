'use client';

/**
 * SortableTabItem 컴포넌트
 * @description TSK-02-03 탭 드래그 앤 드롭 - 드래그 가능한 탭 아이템
 * @description TSK-02-04 탭 컨텍스트 메뉴 연동
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Tab } from '@/lib/mdi/types';
import { TabItem } from './TabItem';
import { TabContextMenu } from './TabContextMenu';

export interface SortableTabItemProps {
  /** 탭 데이터 */
  tab: Tab;
  /** 탭의 인덱스 */
  tabIndex: number;
  /** 전체 탭 수 */
  totalTabs: number;
  /** 활성 상태 */
  isActive: boolean;
  /** 탭 클릭 핸들러 */
  onClick: () => void;
  /** 탭 닫기 핸들러 */
  onClose: () => void;
}

/**
 * 드래그 가능한 탭 아이템 컴포넌트
 */
export function SortableTabItem({
  tab,
  tabIndex,
  totalTabs,
  isActive,
  onClick,
  onClose,
}: SortableTabItemProps) {
  // 홈 탭은 드래그 비활성화
  const isHomeTab = tab.id === 'home';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tab.id,
    disabled: isHomeTab, // 홈 탭은 드래그 비활성화
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isHomeTab ? 'default' : isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid={`sortable-tab-${tab.id}`}
      aria-grabbed={isDragging}
      className={isDragging ? 'z-50' : ''}
    >
      <TabContextMenu tab={tab} tabIndex={tabIndex} totalTabs={totalTabs}>
        <TabItem
          tab={tab}
          isActive={isActive}
          onClick={onClick}
          onClose={onClose}
        />
      </TabContextMenu>
    </div>
  );
}
