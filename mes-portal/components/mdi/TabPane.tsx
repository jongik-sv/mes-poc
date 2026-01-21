'use client';

/**
 * TabPane 컴포넌트
 * @description TSK-02-05 MDI 컨텐츠 영역 - 개별 탭 패널 래퍼
 */

import type { ReactNode } from 'react';

interface TabPaneProps {
  /** 탭 고유 ID */
  tabId: string;
  /** 활성 상태 여부 */
  isActive: boolean;
  /** 자식 컴포넌트 */
  children: ReactNode;
}

/**
 * TabPane 컴포넌트
 * @description 개별 탭의 컨텐츠를 감싸는 래퍼. 비활성 시 display:none으로 숨김 (BR-01)
 */
export function TabPane({ tabId, isActive, children }: TabPaneProps) {
  return (
    <div
      data-testid={`mdi-tab-pane-${tabId}`}
      role="tabpanel"
      aria-labelledby={`tab-${tabId}`}
      aria-hidden={!isActive}
      className={`h-full overflow-auto ${isActive ? 'block' : 'hidden'}`}
      style={{ display: isActive ? 'block' : 'none' }}
    >
      {children}
    </div>
  );
}
