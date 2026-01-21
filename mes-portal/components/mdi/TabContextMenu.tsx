'use client';

/**
 * TabContextMenu 컴포넌트
 * @description TSK-02-04 탭 컨텍스트 메뉴 - 탭 우클릭 메뉴
 */

import { type ReactNode, useMemo } from 'react';
import { Dropdown, type MenuProps } from 'antd';
import { CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMDI } from '@/lib/mdi';
import type { Tab } from '@/lib/mdi/types';

export interface TabContextMenuProps {
  /** 대상 탭 */
  tab: Tab;
  /** 탭의 인덱스 (오른쪽 탭 판단용) */
  tabIndex: number;
  /** 전체 탭 수 */
  totalTabs: number;
  /** 감싸질 자식 요소 */
  children: ReactNode;
}

/**
 * 탭 컨텍스트 메뉴 컴포넌트
 * @description 탭을 우클릭했을 때 표시되는 드롭다운 메뉴
 */
export function TabContextMenu({
  tab,
  tabIndex,
  totalTabs,
  children,
}: TabContextMenuProps) {
  const { tabs, closeTab, closeOtherTabs, closeRightTabs, refreshTab } =
    useMDI();

  // 메뉴 비활성화 조건 계산
  const menuDisabledState = useMemo(() => {
    // 닫기: closable=false인 경우 비활성화
    const isCloseDisabled = !tab.closable;

    // 다른 탭 모두 닫기: 다른 closable 탭이 없으면 비활성화
    const otherClosableTabs = tabs.filter(
      (t) => t.id !== tab.id && t.closable
    );
    const isCloseOthersDisabled = otherClosableTabs.length === 0;

    // 오른쪽 탭 모두 닫기: 오른쪽에 closable 탭이 없으면 비활성화
    const rightClosableTabs = tabs.filter(
      (t, index) => index > tabIndex && t.closable
    );
    const isCloseRightDisabled = rightClosableTabs.length === 0;

    return {
      close: isCloseDisabled,
      closeOthers: isCloseOthersDisabled,
      closeRight: isCloseRightDisabled,
    };
  }, [tab, tabs, tabIndex]);

  // 메뉴 항목 클릭 핸들러
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'close':
        if (!menuDisabledState.close) {
          closeTab(tab.id);
        }
        break;
      case 'closeOthers':
        if (!menuDisabledState.closeOthers) {
          closeOtherTabs(tab.id);
        }
        break;
      case 'closeRight':
        if (!menuDisabledState.closeRight) {
          closeRightTabs(tab.id);
        }
        break;
      case 'refresh':
        refreshTab(tab.id);
        break;
    }
  };

  // 메뉴 아이템 정의
  // Note: Ant Design Menu는 disabled 속성으로 자동 접근성 처리
  const menuItems: MenuProps['items'] = [
    {
      key: 'close',
      label: '닫기',
      icon: <CloseOutlined />,
      disabled: menuDisabledState.close,
    },
    {
      type: 'divider',
    },
    {
      key: 'closeOthers',
      label: '다른 탭 모두 닫기',
      disabled: menuDisabledState.closeOthers,
    },
    {
      key: 'closeRight',
      label: '오른쪽 탭 모두 닫기',
      disabled: menuDisabledState.closeRight,
    },
    {
      type: 'divider',
    },
    {
      key: 'refresh',
      label: '새로고침',
      icon: <ReloadOutlined />,
    },
  ];

  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: handleMenuClick,
      }}
      trigger={['contextMenu']}
      destroyOnHidden
    >
      <div data-testid={`tab-context-wrapper-${tab.id}`}>{children}</div>
    </Dropdown>
  );
}
