/**
 * TabContextMenu 컴포넌트 단위 테스트
 * @description TSK-02-04 탭 컨텍스트 메뉴 - 테스트 명세 (026-test-specification.md 기반)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabBar } from '../TabBar';
import { MDIProvider } from '@/lib/mdi/context';
import type { Tab } from '@/lib/mdi/types';
import { ReactNode, useEffect } from 'react';
import { useMDI } from '@/lib/mdi';

// 테스트용 Mock 탭 데이터
const MOCK_TAB_HOME: Tab = {
  id: 'home',
  title: '홈',
  path: '/',
  closable: false,
};

const MOCK_TAB_01: Tab = {
  id: 'tab1',
  title: '작업 지시',
  path: '/work-order',
  closable: true,
};

const MOCK_TAB_02: Tab = {
  id: 'tab2',
  title: '실적 입력',
  path: '/production',
  closable: true,
};

const MOCK_TAB_03: Tab = {
  id: 'tab3',
  title: '품질 검사',
  path: '/quality',
  closable: true,
};

const MOCK_TAB_04: Tab = {
  id: 'tab4',
  title: '설비 관리',
  path: '/equipment',
  closable: true,
};

// 탭 로더 컴포넌트
function TabLoader({
  tabs,
  activeTabId,
}: {
  tabs: Tab[];
  activeTabId: string;
}) {
  const { openTab, setActiveTab, tabs: currentTabs } = useMDI();

  useEffect(() => {
    tabs.forEach((tab) => {
      openTab(tab);
    });
  }, []);

  useEffect(() => {
    if (currentTabs.length >= tabs.length && activeTabId) {
      setActiveTab(activeTabId);
    }
  }, [currentTabs.length, tabs.length, activeTabId, setActiveTab]);

  return null;
}

// 테스트 래퍼 컴포넌트
function TestWrapper({
  tabs,
  activeTabId,
  children,
}: {
  tabs: Tab[];
  activeTabId: string;
  children?: ReactNode;
}) {
  return (
    <MDIProvider>
      <TabLoader tabs={tabs} activeTabId={activeTabId} />
      <TabBar />
      {children}
    </MDIProvider>
  );
}

describe('TabContextMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('UT-001: 탭 우클릭 시 컨텍스트 메뉴 표시', () => {
    it('탭 우클릭 시 메뉴가 표시된다', async () => {
      render(
        <TestWrapper tabs={[MOCK_TAB_01, MOCK_TAB_02]} activeTabId="tab1" />
      );

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-tab1')).toBeInTheDocument();
      });

      // 탭 우클릭
      const tab = screen.getByTestId('tab-item-tab1');
      fireEvent.contextMenu(tab);

      // 컨텍스트 메뉴 표시 확인 - 메뉴 항목으로 확인
      await waitFor(() => {
        expect(screen.getByText('닫기')).toBeInTheDocument();
        expect(screen.getByText('다른 탭 모두 닫기')).toBeInTheDocument();
        expect(screen.getByText('오른쪽 탭 모두 닫기')).toBeInTheDocument();
        expect(screen.getByText('새로고침')).toBeInTheDocument();
      });
    });

    it('메뉴 외부 클릭 시 메뉴가 닫힌다', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper tabs={[MOCK_TAB_01, MOCK_TAB_02]} activeTabId="tab1" />
      );

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-tab1')).toBeInTheDocument();
      });

      // 탭 우클릭으로 메뉴 열기
      const tab = screen.getByTestId('tab-item-tab1');
      fireEvent.contextMenu(tab);

      await waitFor(() => {
        expect(screen.getByText('닫기')).toBeInTheDocument();
      });

      // 메뉴 외부 클릭
      await user.click(document.body);

      // 메뉴 닫힘 확인
      await waitFor(() => {
        expect(screen.queryByText('다른 탭 모두 닫기')).not.toBeInTheDocument();
      });
    });

    it('Esc 키 누르면 메뉴가 닫힌다', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper tabs={[MOCK_TAB_01, MOCK_TAB_02]} activeTabId="tab1" />
      );

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-tab1')).toBeInTheDocument();
      });

      // 탭 우클릭으로 메뉴 열기
      const tab = screen.getByTestId('tab-item-tab1');
      fireEvent.contextMenu(tab);

      await waitFor(() => {
        expect(screen.getByText('닫기')).toBeInTheDocument();
      });

      // Esc 키 누르기
      await user.keyboard('{Escape}');

      // 메뉴 닫힘 확인
      await waitFor(() => {
        expect(screen.queryByText('다른 탭 모두 닫기')).not.toBeInTheDocument();
      });
    });
  });

  describe('UT-002: "닫기" 클릭 시 탭 닫힘', () => {
    it('닫기 클릭 시 해당 탭이 닫힌다', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          tabs={[MOCK_TAB_01, MOCK_TAB_02, MOCK_TAB_03]}
          activeTabId="tab2"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-tab2')).toBeInTheDocument();
      });

      // tab2 우클릭
      const tab = screen.getByTestId('tab-item-tab2');
      fireEvent.contextMenu(tab);

      await waitFor(() => {
        expect(screen.getByText('닫기')).toBeInTheDocument();
      });

      // 닫기 클릭
      await user.click(screen.getByText('닫기'));

      // tab2가 닫힘
      await waitFor(() => {
        expect(screen.queryByTestId('tab-item-tab2')).not.toBeInTheDocument();
      });
    });
  });

  describe('UT-003: closeOtherTabs 호출', () => {
    it('다른 탭 모두 닫기 클릭 시 지정 탭 제외 closable 탭이 닫힌다', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          tabs={[MOCK_TAB_HOME, MOCK_TAB_01, MOCK_TAB_02, MOCK_TAB_03]}
          activeTabId="tab2"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-tab2')).toBeInTheDocument();
        expect(screen.getByTestId('tab-item-home')).toBeInTheDocument();
      });

      // tab2 우클릭
      const tab = screen.getByTestId('tab-item-tab2');
      fireEvent.contextMenu(tab);

      await waitFor(() => {
        expect(screen.getByText('다른 탭 모두 닫기')).toBeInTheDocument();
      });

      // 다른 탭 모두 닫기 클릭
      await user.click(screen.getByText('다른 탭 모두 닫기'));

      // tab2와 home(closable=false)만 남음
      await waitFor(() => {
        expect(screen.getByTestId('tab-item-home')).toBeInTheDocument();
        expect(screen.getByTestId('tab-item-tab2')).toBeInTheDocument();
        expect(screen.queryByTestId('tab-item-tab1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('tab-item-tab3')).not.toBeInTheDocument();
      });
    });
  });

  describe('UT-004: closeRightTabs 호출', () => {
    it('오른쪽 탭 모두 닫기 클릭 시 지정 탭 오른쪽 closable 탭이 닫힌다', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          tabs={[MOCK_TAB_01, MOCK_TAB_02, MOCK_TAB_03, MOCK_TAB_04]}
          activeTabId="tab1"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-tab2')).toBeInTheDocument();
      });

      // tab2 우클릭
      const tab = screen.getByTestId('tab-item-tab2');
      fireEvent.contextMenu(tab);

      await waitFor(() => {
        expect(screen.getByText('오른쪽 탭 모두 닫기')).toBeInTheDocument();
      });

      // 오른쪽 탭 모두 닫기 클릭
      await user.click(screen.getByText('오른쪽 탭 모두 닫기'));

      // tab1, tab2만 남고 tab3, tab4는 닫힘
      await waitFor(() => {
        expect(screen.getByTestId('tab-item-tab1')).toBeInTheDocument();
        expect(screen.getByTestId('tab-item-tab2')).toBeInTheDocument();
        expect(screen.queryByTestId('tab-item-tab3')).not.toBeInTheDocument();
        expect(screen.queryByTestId('tab-item-tab4')).not.toBeInTheDocument();
      });
    });
  });

  describe('UT-005: refreshTab 호출', () => {
    it('새로고침 클릭 시 메뉴가 닫히고 탭이 유지된다', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper tabs={[MOCK_TAB_01, MOCK_TAB_02]} activeTabId="tab1" />
      );

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-tab1')).toBeInTheDocument();
      });

      // tab1 우클릭
      const tab = screen.getByTestId('tab-item-tab1');
      fireEvent.contextMenu(tab);

      await waitFor(() => {
        expect(screen.getByText('새로고침')).toBeInTheDocument();
      });

      // 새로고침 클릭
      await user.click(screen.getByText('새로고침'));

      // 메뉴가 닫힘
      await waitFor(() => {
        expect(
          screen.queryByText('다른 탭 모두 닫기')
        ).not.toBeInTheDocument();
      });

      // 탭은 여전히 존재
      expect(screen.getByTestId('tab-item-tab1')).toBeInTheDocument();
    });
  });

  describe('UT-006: closable=false 탭 메뉴 비활성화', () => {
    it('closable=false 탭의 닫기 메뉴가 비활성화된다', async () => {
      render(
        <TestWrapper tabs={[MOCK_TAB_HOME, MOCK_TAB_01]} activeTabId="home" />
      );

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-home')).toBeInTheDocument();
      });

      // home 탭(closable=false) 우클릭
      const homeTab = screen.getByTestId('tab-item-home');
      fireEvent.contextMenu(homeTab);

      await waitFor(() => {
        expect(screen.getByText('닫기')).toBeInTheDocument();
      });

      // 닫기 메뉴 항목이 비활성화 상태인지 확인 (ant design menu item)
      const closeMenuItem = screen.getByText('닫기').closest('li');
      expect(closeMenuItem).toHaveClass('ant-dropdown-menu-item-disabled');
    });
  });

  describe('UT-007: 탭 닫힘 후 활성화', () => {
    it('closeOtherTabs 시 활성 탭이 닫히면 지정 탭이 활성화된다', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          tabs={[MOCK_TAB_01, MOCK_TAB_02, MOCK_TAB_03]}
          activeTabId="tab2"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-tab2')).toBeInTheDocument();
        expect(screen.getByTestId('tab-item-tab2')).toHaveAttribute(
          'aria-selected',
          'true'
        );
      });

      // tab3 우클릭 (비활성 탭)
      const tab = screen.getByTestId('tab-item-tab3');
      fireEvent.contextMenu(tab);

      await waitFor(() => {
        expect(screen.getByText('다른 탭 모두 닫기')).toBeInTheDocument();
      });

      // 다른 탭 모두 닫기 클릭
      await user.click(screen.getByText('다른 탭 모두 닫기'));

      // tab2(기존 활성)도 닫히고, tab3이 활성화됨
      await waitFor(() => {
        expect(screen.queryByTestId('tab-item-tab1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('tab-item-tab2')).not.toBeInTheDocument();
        expect(screen.getByTestId('tab-item-tab3')).toBeInTheDocument();
        expect(screen.getByTestId('tab-item-tab3')).toHaveAttribute(
          'aria-selected',
          'true'
        );
      });
    });
  });

  describe('메뉴 비활성화 조건', () => {
    it('탭이 1개만 있으면 다른 탭 모두 닫기가 비활성화된다', async () => {
      render(<TestWrapper tabs={[MOCK_TAB_01]} activeTabId="tab1" />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-tab1')).toBeInTheDocument();
      });

      const tab = screen.getByTestId('tab-item-tab1');
      fireEvent.contextMenu(tab);

      await waitFor(() => {
        expect(screen.getByText('다른 탭 모두 닫기')).toBeInTheDocument();
      });

      // 다른 탭 모두 닫기 비활성화
      const closeOthersMenuItem = screen
        .getByText('다른 탭 모두 닫기')
        .closest('li');
      expect(closeOthersMenuItem).toHaveClass(
        'ant-dropdown-menu-item-disabled'
      );
    });

    it('가장 오른쪽 탭에서 오른쪽 탭 모두 닫기가 비활성화된다', async () => {
      render(
        <TestWrapper
          tabs={[MOCK_TAB_01, MOCK_TAB_02, MOCK_TAB_03]}
          activeTabId="tab1"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-tab3')).toBeInTheDocument();
      });

      // 가장 오른쪽 탭(tab3) 우클릭
      const lastTab = screen.getByTestId('tab-item-tab3');
      fireEvent.contextMenu(lastTab);

      await waitFor(() => {
        expect(screen.getByText('오른쪽 탭 모두 닫기')).toBeInTheDocument();
      });

      // 오른쪽 탭 모두 닫기 비활성화
      const closeRightMenuItem = screen
        .getByText('오른쪽 탭 모두 닫기')
        .closest('li');
      expect(closeRightMenuItem).toHaveClass(
        'ant-dropdown-menu-item-disabled'
      );
    });
  });
});
