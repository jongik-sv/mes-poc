/**
 * TabBar 컴포넌트 단위 테스트
 * @description TSK-02-02 탭 바 컴포넌트 - TabBar 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabBar } from '../TabBar';
import { MDIProvider } from '@/lib/mdi/context';
import type { Tab } from '@/lib/mdi/types';
import { ReactNode, useEffect } from 'react';
import { useMDI } from '@/lib/mdi';

// 테스트용 탭 데이터
const mockTabs: Tab[] = [
  {
    id: 'dashboard',
    title: '대시보드',
    path: '/dashboard',
    icon: 'DashboardOutlined',
    closable: true,
  },
  {
    id: 'work-order',
    title: '작업지시',
    path: '/work-order',
    icon: 'FileTextOutlined',
    closable: true,
  },
  {
    id: 'production',
    title: '생산현황',
    path: '/production',
    icon: 'BarChartOutlined',
    closable: true,
  },
];

// 초기 탭을 주입하는 래퍼 컴포넌트
function TabBarWithTabs({
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

function TabLoader({ tabs, activeTabId }: { tabs: Tab[]; activeTabId: string }) {
  const { openTab, setActiveTab, tabs: currentTabs } = useMDI();

  useEffect(() => {
    // 탭 추가
    tabs.forEach((tab) => {
      openTab(tab);
    });
  }, []);

  useEffect(() => {
    // 탭이 모두 로드되면 활성 탭 설정
    if (currentTabs.length >= tabs.length && activeTabId) {
      setActiveTab(activeTabId);
    }
  }, [currentTabs.length, tabs.length, activeTabId, setActiveTab]);

  return null;
}

describe('TabBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('TabBar 컨테이너가 렌더링된다', async () => {
      render(<TabBarWithTabs tabs={mockTabs} activeTabId="dashboard" />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-bar')).toBeInTheDocument();
      });
    });

    it('모든 탭 아이템을 렌더링한다', async () => {
      render(<TabBarWithTabs tabs={mockTabs} activeTabId="dashboard" />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('tab-item-work-order')).toBeInTheDocument();
        expect(screen.getByTestId('tab-item-production')).toBeInTheDocument();
      });
    });

    it('탭 제목이 모두 표시된다', async () => {
      render(<TabBarWithTabs tabs={mockTabs} activeTabId="dashboard" />);

      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument();
        expect(screen.getByText('작업지시')).toBeInTheDocument();
        expect(screen.getByText('생산현황')).toBeInTheDocument();
      });
    });

    it('탭이 없으면 빈 탭 바를 표시한다', async () => {
      render(
        <MDIProvider>
          <TabBar />
        </MDIProvider>
      );

      expect(screen.getByTestId('tab-bar')).toBeInTheDocument();
      expect(screen.queryByTestId(/^tab-item-/)).not.toBeInTheDocument();
    });
  });

  describe('활성 탭 표시', () => {
    it('활성 탭에 aria-selected=true가 설정된다', async () => {
      render(<TabBarWithTabs tabs={mockTabs} activeTabId="dashboard" />);

      await waitFor(() => {
        const activeTab = screen.getByTestId('tab-item-dashboard');
        expect(activeTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('비활성 탭에 aria-selected=false가 설정된다', async () => {
      render(<TabBarWithTabs tabs={mockTabs} activeTabId="dashboard" />);

      await waitFor(() => {
        const inactiveTab = screen.getByTestId('tab-item-work-order');
        expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
      });
    });
  });

  describe('탭 전환', () => {
    it('탭 클릭 시 해당 탭이 활성화된다', async () => {
      const user = userEvent.setup();
      render(<TabBarWithTabs tabs={mockTabs} activeTabId="dashboard" />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-dashboard')).toBeInTheDocument();
      });

      // 작업지시 탭 클릭
      await user.click(screen.getByTestId('tab-item-work-order'));

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-work-order')).toHaveAttribute(
          'aria-selected',
          'true'
        );
        expect(screen.getByTestId('tab-item-dashboard')).toHaveAttribute(
          'aria-selected',
          'false'
        );
      });
    });
  });

  describe('탭 닫기', () => {
    it('닫기 버튼 클릭 시 탭이 제거된다', async () => {
      const user = userEvent.setup();
      render(<TabBarWithTabs tabs={mockTabs} activeTabId="dashboard" />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-work-order')).toBeInTheDocument();
      });

      // 작업지시 탭 닫기
      await user.click(screen.getByTestId('tab-close-btn-work-order'));

      await waitFor(() => {
        expect(screen.queryByTestId('tab-item-work-order')).not.toBeInTheDocument();
      });
    });

    it('닫기 버튼 클릭 시 탭 전환이 발생하지 않는다', async () => {
      const user = userEvent.setup();
      render(<TabBarWithTabs tabs={mockTabs} activeTabId="dashboard" />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-dashboard')).toBeInTheDocument();
      });

      // 작업지시 탭 닫기 (활성 탭이 아닌 탭)
      await user.click(screen.getByTestId('tab-close-btn-work-order'));

      // 대시보드가 여전히 활성 상태
      await waitFor(() => {
        expect(screen.getByTestId('tab-item-dashboard')).toHaveAttribute(
          'aria-selected',
          'true'
        );
      });
    });
  });

  describe('접근성', () => {
    it('role="tablist"가 설정된다', async () => {
      render(<TabBarWithTabs tabs={mockTabs} activeTabId="dashboard" />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-bar-container')).toHaveAttribute(
          'role',
          'tablist'
        );
      });
    });

    it('aria-label이 설정된다', async () => {
      render(<TabBarWithTabs tabs={mockTabs} activeTabId="dashboard" />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-bar-container')).toHaveAttribute(
          'aria-label',
          '열린 탭 목록'
        );
      });
    });
  });

  describe('마지막 탭 보호', () => {
    it('탭이 하나만 남으면 닫기 버튼이 숨겨진다', async () => {
      const singleTab: Tab[] = [
        {
          id: 'only-tab',
          title: '유일한 탭',
          path: '/only',
          closable: true,
        },
      ];

      render(<TabBarWithTabs tabs={singleTab} activeTabId="only-tab" />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-only-tab')).toBeInTheDocument();
      });

      // 마지막 탭이므로 닫기 버튼이 없어야 함
      expect(screen.queryByTestId('tab-close-btn-only-tab')).not.toBeInTheDocument();
    });
  });

  describe('드롭다운 메뉴', () => {
    it('탭이 5개 초과하면 드롭다운 버튼이 표시된다', async () => {
      const manyTabs: Tab[] = Array.from({ length: 6 }, (_, i) => ({
        id: `tab-${i}`,
        title: `탭 ${i + 1}`,
        path: `/screen-${i}`,
        closable: true,
      }));

      render(<TabBarWithTabs tabs={manyTabs} activeTabId="tab-0" />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-dropdown-btn')).toBeInTheDocument();
      });
    });

    it('탭이 5개 이하면 드롭다운 버튼이 숨겨진다', async () => {
      const fewTabs: Tab[] = Array.from({ length: 5 }, (_, i) => ({
        id: `tab-${i}`,
        title: `탭 ${i + 1}`,
        path: `/screen-${i}`,
        closable: true,
      }));

      render(<TabBarWithTabs tabs={fewTabs} activeTabId="tab-0" />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-item-tab-0')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('tab-dropdown-btn')).not.toBeInTheDocument();
    });
  });
});
