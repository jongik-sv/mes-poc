'use client';

/**
 * ScreenLoader 컴포넌트
 * @description TSK-02-05 MDI 컨텐츠 영역 - 동적 화면 로더
 */

import { lazy, Suspense, ComponentType, useMemo } from 'react';
import { Spin, Result, Button } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { getScreenLoader, validateScreenPath } from '@/lib/mdi/screenRegistry';

interface ScreenLoaderProps {
  /** 화면 경로 */
  path: string;
  /** 새로고침 핸들러 */
  onRefresh?: () => void;
  /** 홈으로 이동 핸들러 */
  onGoHome?: () => void;
}

/**
 * 로딩 폴백 컴포넌트
 */
function LoadingFallback() {
  return (
    <div
      data-testid="mdi-screen-loading"
      className="flex items-center justify-center h-full"
    >
      <Spin size="large" tip="화면을 불러오는 중..." />
    </div>
  );
}

/**
 * 화면 없음/접근 불가 컴포넌트
 * @description 보안상 404와 403을 구분하지 않음 (경로 열거 공격 방지)
 */
function ScreenNotFound({
  path,
  onGoHome,
}: {
  path: string;
  onGoHome?: () => void;
}) {
  return (
    <div
      data-testid="mdi-screen-not-found"
      className="flex items-center justify-center h-full"
    >
      <Result
        status="warning"
        title="요청하신 화면에 접근할 수 없습니다"
        subTitle={`Path: ${path}`}
        extra={
          onGoHome && (
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={onGoHome}
              data-testid="mdi-go-home-btn"
            >
              홈으로 이동
            </Button>
          )
        }
      />
    </div>
  );
}

/**
 * 에러 폴백 컴포넌트
 */
function ScreenError({
  onRefresh,
  onGoHome,
}: {
  onRefresh?: () => void;
  onGoHome?: () => void;
}) {
  return (
    <div
      data-testid="mdi-screen-error"
      className="flex items-center justify-center h-full"
    >
      <Result
        status="error"
        title="화면을 불러올 수 없습니다"
        subTitle="네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        extra={[
          onRefresh && (
            <Button
              key="refresh"
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              data-testid="mdi-refresh-btn"
            >
              새로고침
            </Button>
          ),
          onGoHome && (
            <Button
              key="home"
              type="primary"
              icon={<HomeOutlined />}
              onClick={onGoHome}
              data-testid="mdi-go-home-btn"
            >
              홈으로 이동
            </Button>
          ),
        ].filter(Boolean)}
      />
    </div>
  );
}

/**
 * ScreenLoader 컴포넌트
 * @description 경로 검증 후 동적 import로 화면 컴포넌트 로딩
 */
export function ScreenLoader({ path, onRefresh, onGoHome }: ScreenLoaderProps) {
  // 경로 검증
  if (!validateScreenPath(path)) {
    return <ScreenNotFound path={path} onGoHome={onGoHome} />;
  }

  // 화면 로더 조회
  const loader = getScreenLoader(path);

  if (!loader) {
    return <ScreenNotFound path={path} onGoHome={onGoHome} />;
  }

  // 동적 컴포넌트 생성
  const LazyScreen = useMemo(() => lazy(loader), [loader]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <LazyScreen />
    </Suspense>
  );
}

// Export 서브 컴포넌트
export { LoadingFallback, ScreenNotFound, ScreenError };
