/**
 * MDIContent 컴포넌트 단위 테스트
 * @description TSK-02-05 MDI 컨텐츠 영역 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ReactNode, useEffect } from 'react';
import { MDIProvider, useMDI } from '@/lib/mdi';
import type { Tab } from '@/lib/mdi/types';
import { MDIContent } from '../MDIContent';

// Mock screenRegistry
vi.mock('@/lib/mdi/screenRegistry', () => ({
  screenRegistry: {
    '/dashboard': () =>
      Promise.resolve({
        default: () => <div data-testid="screen-dashboard">Dashboard</div>,
      }),
    '/list': () =>
      Promise.resolve({
        default: () => <div data-testid="screen-list">List</div>,
      }),
    '/form': () =>
      Promise.resolve({
        default: () => <div data-testid="screen-form">Form</div>,
      }),
  },
  validateScreenPath: (path: string) => {
    if (!path.startsWith('/')) return false;
    if (path.includes('..')) return false;
    return true;
  },
  getScreenLoader: (path: string) => {
    const registry: Record<string, () => Promise<{ default: React.ComponentType }>> = {
      '/dashboard': () =>
        Promise.resolve({
          default: () => <div data-testid="screen-dashboard">Dashboard</div>,
        }),
      '/list': () =>
        Promise.resolve({
          default: () => <div data-testid="screen-list">List</div>,
        }),
      '/form': () =>
        Promise.resolve({
          default: () => <div data-testid="screen-form">Form</div>,
        }),
    };

    if (!path.startsWith('/') || path.includes('..')) {
      return null;
    }
    return registry[path] ?? null;
  },
}));

// 테스트용 헬퍼 컴포넌트: 탭을 자동으로 열어주는 래퍼
function TabOpener({
  tabs,
  activeTabId,
  children,
}: {
  tabs: Tab[];
  activeTabId: string;
  children: ReactNode;
}) {
  const { openTab } = useMDI();

  useEffect(() => {
    // activeTabId인 탭을 마지막에 열어서 활성화되도록 함
    const sortedTabs = [...tabs].sort((a, b) => {
      if (a.id === activeTabId) return 1;
      if (b.id === activeTabId) return -1;
      return 0;
    });

    sortedTabs.forEach((tab) => {
      openTab(tab);
    });
  }, []);

  return <>{children}</>;
}

describe('MDIContent', () => {
  const mockTabs: Tab[] = [
    { id: 'tab1', title: '대시보드', path: '/dashboard', closable: true },
    { id: 'tab2', title: '목록', path: '/list', closable: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TC-01-02: 빈 상태 표시', () => {
    it('탭이 없으면 빈 상태를 표시한다', () => {
      render(
        <MDIProvider>
          <MDIContent />
        </MDIProvider>
      );

      expect(screen.getByTestId('mdi-empty-state')).toBeInTheDocument();
      expect(screen.getByText('열린 화면이 없습니다')).toBeInTheDocument();
    });
  });

  describe('TC-01-01: 활성 탭 화면 표시', () => {
    it('활성 탭 컨텐츠만 표시된다', async () => {
      render(
        <MDIProvider>
          <TabOpener tabs={mockTabs} activeTabId="tab1">
            <MDIContent />
          </TabOpener>
        </MDIProvider>
      );

      await waitFor(() => {
        const activePane = screen.getByTestId('mdi-tab-pane-tab1');
        const inactivePane = screen.getByTestId('mdi-tab-pane-tab2');

        // 활성 탭은 display: block
        expect(activePane).not.toHaveStyle({ display: 'none' });
        // 비활성 탭은 display: none
        expect(inactivePane).toHaveStyle({ display: 'none' });
      });
    });
  });

  describe('TC-02-01: 비활성 탭 display:none', () => {
    it('비활성 탭은 display:none으로 숨겨진다', async () => {
      render(
        <MDIProvider>
          <TabOpener tabs={mockTabs} activeTabId="tab1">
            <MDIContent />
          </TabOpener>
        </MDIProvider>
      );

      await waitFor(() => {
        const inactivePane = screen.getByTestId('mdi-tab-pane-tab2');
        expect(inactivePane).toHaveStyle({ display: 'none' });
      });
    });
  });

  describe('TC-BR-01: unmount 방지 (상태 유지)', () => {
    it('비활성 탭은 unmount되지 않아 DOM에 유지된다', async () => {
      render(
        <MDIProvider>
          <TabOpener tabs={mockTabs} activeTabId="tab1">
            <MDIContent />
          </TabOpener>
        </MDIProvider>
      );

      await waitFor(() => {
        // 비활성 탭의 컨텐츠도 DOM에 존재해야 함
        expect(screen.getByTestId('mdi-tab-pane-tab2')).toBeInTheDocument();
      });
    });
  });

  describe('TC-SCROLL-01: 스크롤 영역 제한', () => {
    it('컨텐츠 영역에 overflow 스타일이 적용된다', async () => {
      render(
        <MDIProvider>
          <TabOpener tabs={mockTabs} activeTabId="tab1">
            <MDIContent />
          </TabOpener>
        </MDIProvider>
      );

      await waitFor(() => {
        const contentArea = screen.getByTestId('mdi-content');
        expect(contentArea).toHaveClass('overflow-auto');
      });
    });
  });

  describe('data-testid 검증', () => {
    it('mdi-content data-testid가 존재한다', async () => {
      render(
        <MDIProvider>
          <TabOpener tabs={mockTabs} activeTabId="tab1">
            <MDIContent />
          </TabOpener>
        </MDIProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mdi-content')).toBeInTheDocument();
      });
    });

    it('mdi-tab-pane-{id} data-testid가 존재한다', async () => {
      render(
        <MDIProvider>
          <TabOpener tabs={mockTabs} activeTabId="tab1">
            <MDIContent />
          </TabOpener>
        </MDIProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mdi-tab-pane-tab1')).toBeInTheDocument();
        expect(screen.getByTestId('mdi-tab-pane-tab2')).toBeInTheDocument();
      });
    });
  });

  describe('ARIA 접근성', () => {
    it('MDIContent에 role="main" 속성이 설정된다', async () => {
      render(
        <MDIProvider>
          <TabOpener tabs={mockTabs} activeTabId="tab1">
            <MDIContent />
          </TabOpener>
        </MDIProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mdi-content')).toHaveAttribute('role', 'main');
      });
    });

    it('TabPane에 role="tabpanel" 속성이 설정된다', async () => {
      render(
        <MDIProvider>
          <TabOpener tabs={mockTabs} activeTabId="tab1">
            <MDIContent />
          </TabOpener>
        </MDIProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mdi-tab-pane-tab1')).toHaveAttribute(
          'role',
          'tabpanel'
        );
      });
    });

    it('비활성 TabPane에 aria-hidden="true" 속성이 설정된다', async () => {
      render(
        <MDIProvider>
          <TabOpener tabs={mockTabs} activeTabId="tab1">
            <MDIContent />
          </TabOpener>
        </MDIProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mdi-tab-pane-tab2')).toHaveAttribute(
          'aria-hidden',
          'true'
        );
      });
    });
  });
});
