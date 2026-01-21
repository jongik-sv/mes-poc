/**
 * MDI 테스트 유틸리티
 * @description TSK-02-02 TabBar 컴포넌트 테스트용 유틸리티
 */

import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactElement, type ReactNode } from 'react';
import { MDIProvider } from '@/lib/mdi/context';
import type { Tab, MDIConfig } from '@/lib/mdi/types';

interface MDITestProviderProps extends MDIConfig {
  initialTabs?: Tab[];
  initialActiveTab?: string | null;
  children: ReactNode;
}

/**
 * MDI 테스트용 Provider Wrapper
 */
export function MDITestProvider({
  initialTabs = [],
  initialActiveTab = null,
  children,
  ...config
}: MDITestProviderProps) {
  // MDIProvider에 초기 상태를 전달하기 위해 Provider 내부에서 초기화
  return (
    <MDIProviderWithInitialState
      initialTabs={initialTabs}
      initialActiveTab={initialActiveTab}
      config={config}
    >
      {children}
    </MDIProviderWithInitialState>
  );
}

/**
 * 초기 상태를 가진 MDI Provider
 */
function MDIProviderWithInitialState({
  initialTabs,
  initialActiveTab,
  config,
  children,
}: {
  initialTabs: Tab[];
  initialActiveTab: string | null;
  config: MDIConfig;
  children: ReactNode;
}) {
  return (
    <MDIProvider {...config}>
      <InitialStateLoader
        initialTabs={initialTabs}
        initialActiveTab={initialActiveTab}
      >
        {children}
      </InitialStateLoader>
    </MDIProvider>
  );
}

/**
 * 초기 상태 로더 컴포넌트
 */
import { useEffect, useRef } from 'react';
import { useMDI } from '@/lib/mdi/context';

function InitialStateLoader({
  initialTabs,
  initialActiveTab,
  children,
}: {
  initialTabs: Tab[];
  initialActiveTab: string | null;
  children: ReactNode;
}) {
  const { openTab, setActiveTab } = useMDI();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // 초기 탭 추가
    initialTabs.forEach((tab) => {
      openTab(tab);
    });

    // 초기 활성 탭 설정
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    }
  }, [initialTabs, initialActiveTab, openTab, setActiveTab]);

  return <>{children}</>;
}

interface RenderWithMDIOptions
  extends Omit<RenderOptions, 'wrapper'>,
    MDIConfig {
  initialTabs?: Tab[];
  initialActiveTab?: string | null;
}

/**
 * MDI Provider와 함께 렌더링하는 유틸리티 함수
 */
export function renderWithMDI(
  ui: ReactElement,
  {
    initialTabs = [],
    initialActiveTab = null,
    maxTabs,
    canAccessPath,
    onMaxTabsReached,
    onAccessDenied,
    ...renderOptions
  }: RenderWithMDIOptions = {}
) {
  const user = userEvent.setup();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MDITestProvider
      initialTabs={initialTabs}
      initialActiveTab={initialActiveTab}
      maxTabs={maxTabs}
      canAccessPath={canAccessPath}
      onMaxTabsReached={onMaxTabsReached}
      onAccessDenied={onAccessDenied}
    >
      {children}
    </MDITestProvider>
  );

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Mock 탭 데이터 생성기
 */
export function createMockTab(overrides: Partial<Tab> = {}): Tab {
  const id = overrides.id ?? `tab-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    title: overrides.title ?? '테스트 탭',
    path: overrides.path ?? `/test-path`,
    icon: overrides.icon,
    closable: overrides.closable ?? true,
    params: overrides.params,
  };
}

/**
 * 여러 Mock 탭 데이터 생성기
 */
export function createMockTabs(count: number, baseProps: Partial<Tab> = {}): Tab[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTab({
      id: `tab-${i}`,
      title: `탭 ${i + 1}`,
      path: `/screen-${i}`,
      ...baseProps,
    })
  );
}

/**
 * 공통 테스트 탭 데이터
 */
export const mockTabs: Tab[] = [
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

export const mockHomeTab: Tab = {
  id: 'home',
  title: '홈',
  path: '/',
  icon: 'HomeOutlined',
  closable: false,
};
