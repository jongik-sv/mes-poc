'use client';

/**
 * TabItem 컴포넌트
 * @description TSK-02-02 탭 바 컴포넌트 - 개별 탭 아이템
 */

import { type MouseEvent, type KeyboardEvent, useCallback } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import type { Tab } from '@/lib/mdi/types';
import { TabIcon } from './TabIcon';

export interface TabItemProps {
  /** 탭 데이터 */
  tab: Tab;
  /** 활성 상태 */
  isActive: boolean;
  /** 탭 클릭 핸들러 */
  onClick: () => void;
  /** 탭 닫기 핸들러 */
  onClose: () => void;
}

/**
 * 개별 탭 아이템 컴포넌트
 */
export function TabItem({ tab, isActive, onClick, onClose }: TabItemProps) {
  const handleClose = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onClose();
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <div
      data-testid={`tab-item-${tab.id}`}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`
        flex items-center gap-2 px-3 h-8 mx-0.5 rounded cursor-pointer select-none
        transition-colors duration-200
        ${
          isActive
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium border-b-2 border-primary'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
        }
      `}
    >
      {tab.icon && (
        <span data-testid={`tab-icon-${tab.id}`} className="flex-shrink-0">
          <TabIcon name={tab.icon} />
        </span>
      )}

      <span
        data-testid={`tab-title-${tab.id}`}
        className="truncate max-w-[120px] text-sm"
      >
        {tab.title}
      </span>

      {tab.closable && (
        <button
          data-testid={`tab-close-btn-${tab.id}`}
          role="button"
          aria-label={`${tab.title} 탭 닫기`}
          onClick={handleClose}
          className={`
            flex items-center justify-center w-4 h-4 rounded
            text-gray-400 hover:text-red-600 hover:bg-red-50
            transition-colors duration-150 flex-shrink-0
          `}
        >
          <CloseOutlined className="text-xs" />
        </button>
      )}
    </div>
  );
}
