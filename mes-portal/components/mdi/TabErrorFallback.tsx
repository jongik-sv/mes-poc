'use client';

/**
 * TabErrorFallback 컴포넌트
 * @description TSK-02-05 MDI 컨텐츠 영역 - 탭별 에러 폴백
 */

import { Button, Result } from 'antd';
import { ReloadOutlined, CloseOutlined } from '@ant-design/icons';
import type { Tab } from '@/lib/mdi/types';

interface TabErrorFallbackProps {
  /** 에러 발생 탭 정보 */
  tab: Tab;
  /** 에러 객체 */
  error: Error;
  /** ErrorBoundary 리셋 함수 */
  resetErrorBoundary: () => void;
  /** 탭 닫기 핸들러 */
  onCloseTab?: () => void;
}

/**
 * TabErrorFallback 컴포넌트
 * @description 개별 탭에서 에러 발생 시 표시되는 폴백 UI
 */
export function TabErrorFallback({
  tab,
  error,
  resetErrorBoundary,
  onCloseTab,
}: TabErrorFallbackProps) {
  return (
    <div
      data-testid={`mdi-tab-error-${tab.id}`}
      className="flex items-center justify-center h-full"
    >
      <Result
        status="error"
        title="화면 표시 중 오류가 발생했습니다"
        subTitle={`화면: ${tab.title}`}
        extra={[
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={resetErrorBoundary}
            data-testid="mdi-tab-refresh-btn"
          >
            새로고침
          </Button>,
          tab.closable && onCloseTab && (
            <Button
              key="close"
              icon={<CloseOutlined />}
              onClick={onCloseTab}
              data-testid="mdi-tab-close-btn"
            >
              탭 닫기
            </Button>
          ),
        ].filter(Boolean)}
      />
    </div>
  );
}
