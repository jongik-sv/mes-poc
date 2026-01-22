'use client';

/**
 * MDIContent 컴포넌트
 * @description TSK-02-05 MDI 컨텐츠 영역 - 메인 컨테이너
 */

import { Empty } from 'antd';
import { FolderOpenOutlined } from '@ant-design/icons';
import { useMDI } from '@/lib/mdi';
import { TabPane } from './TabPane';
import { ScreenLoader } from './ScreenLoader';
import { ErrorBoundary } from './ErrorBoundary';
import { TabErrorFallback } from './TabErrorFallback';

/**
 * 빈 상태 컴포넌트
 */
function EmptyState() {
  return (
    <div
      data-testid="mdi-empty-state"
      className="flex items-center justify-center h-full"
    >
      <Empty
        image={<FolderOpenOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
        description={
          <div className="text-center">
            <div
              data-testid="mdi-empty-state-message"
              className="text-lg text-gray-500 mb-2"
            >
              열린 화면이 없습니다
            </div>
            <div className="text-sm text-gray-400">
              좌측 메뉴에서 화면을 선택하거나
              <br />
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
                Ctrl + K
              </kbd>
              로 검색하여 화면을 열어주세요.
            </div>
          </div>
        }
      />
    </div>
  );
}

/**
 * MDIContent 컴포넌트
 * @description 활성 탭의 화면을 렌더링하고 비활성 탭의 상태를 유지
 */
export function MDIContent() {
  const { tabs, activeTabId, closeTab } = useMDI();

  // 탭이 없으면 빈 상태 표시 (BR-03)
  if (tabs.length === 0) {
    return (
      <div
        data-testid="mdi-content"
        role="main"
        className="h-full overflow-auto"
        style={{ backgroundColor: 'var(--color-bg-container, var(--background))' }}
      >
        <EmptyState />
      </div>
    );
  }

  return (
    <div
      data-testid="mdi-content"
      role="main"
      className="h-full overflow-auto"
      style={{ backgroundColor: 'var(--color-bg-container, var(--background))' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <TabPane key={tab.id} tabId={tab.id} isActive={isActive}>
            <ErrorBoundary
              fallback={({ error, resetErrorBoundary }) => (
                <TabErrorFallback
                  tab={tab}
                  error={error}
                  resetErrorBoundary={resetErrorBoundary}
                  onCloseTab={() => closeTab(tab.id)}
                />
              )}
            >
              <ScreenLoader
                path={tab.path}
                onGoHome={() => {
                  // 홈 화면으로 이동 (필요시 구현)
                }}
              />
            </ErrorBoundary>
          </TabPane>
        );
      })}
    </div>
  );
}
