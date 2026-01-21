/**
 * ScreenLoader 컴포넌트 단위 테스트
 * @description TSK-02-05 MDI 컨텐츠 영역 - ScreenLoader 테스트
 */

import { render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';

// jest.mock은 파일 최상단에서 호출되어야 함
jest.mock('@/lib/mdi/screenRegistry', () => ({
  screenRegistry: {
    '/dashboard': () =>
      Promise.resolve({
        default: () => <div data-testid="screen-dashboard">Dashboard Screen</div>,
      }),
    '/list': () =>
      Promise.resolve({
        default: () => <div data-testid="screen-list">List Screen</div>,
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
          default: () => <div data-testid="screen-dashboard">Dashboard Screen</div>,
        }),
      '/list': () =>
        Promise.resolve({
          default: () => <div data-testid="screen-list">List Screen</div>,
        }),
    };

    if (!path.startsWith('/') || path.includes('..')) {
      return null;
    }
    return registry[path] ?? null;
  },
}));

// ScreenLoader는 mock 이후에 import
import { ScreenLoader } from '../ScreenLoader';

describe('ScreenLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TC-03-01: 동적 로딩', () => {
    it('화면 컴포넌트를 동적으로 로딩한다', async () => {
      render(
        <Suspense fallback={<div data-testid="mdi-screen-loading">Loading...</div>}>
          <ScreenLoader path="/dashboard" />
        </Suspense>
      );

      // 로딩 완료 후 화면 표시
      await waitFor(() => {
        expect(screen.getByTestId('screen-dashboard')).toBeInTheDocument();
        expect(screen.getByText('Dashboard Screen')).toBeInTheDocument();
      });
    });
  });

  describe('TC-03-02: 잘못된 경로 처리', () => {
    it('잘못된 경로는 ScreenNotFound를 표시한다', async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <ScreenLoader path="/invalid-path" />
        </Suspense>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mdi-screen-not-found')).toBeInTheDocument();
      });
    });
  });

  describe('TC-ERR-02: 통일된 에러 메시지', () => {
    it('잘못된 경로 접근 시 통일된 에러 메시지를 표시한다', async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <ScreenLoader path="/unauthorized-path" />
        </Suspense>
      );

      await waitFor(() => {
        // 화면 없음/권한 없음 구분하지 않는 통일된 메시지
        expect(
          screen.getByText('요청하신 화면에 접근할 수 없습니다')
        ).toBeInTheDocument();
      });
    });
  });

  describe('TC-SEC-01: 경로 검증', () => {
    it('path traversal 시도 시 거부한다', async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <ScreenLoader path="/../../../etc/passwd" />
        </Suspense>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mdi-screen-not-found')).toBeInTheDocument();
      });
    });

    it('상대 경로가 아닌 경로는 거부한다', async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <ScreenLoader path="dashboard" />
        </Suspense>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mdi-screen-not-found')).toBeInTheDocument();
      });
    });
  });

  describe('data-testid', () => {
    it('에러 시 mdi-screen-not-found data-testid가 표시된다', async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <ScreenLoader path="/invalid" />
        </Suspense>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mdi-screen-not-found')).toBeInTheDocument();
      });
    });
  });

  describe('화면 렌더링', () => {
    it('유효한 경로의 화면을 렌더링한다', async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <ScreenLoader path="/list" />
        </Suspense>
      );

      await waitFor(() => {
        expect(screen.getByTestId('screen-list')).toBeInTheDocument();
      });
    });
  });
});
