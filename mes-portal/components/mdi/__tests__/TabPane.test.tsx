/**
 * TabPane 컴포넌트 단위 테스트
 * @description TSK-02-05 MDI 컨텐츠 영역 - TabPane 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TabPane } from '../TabPane';

describe('TabPane', () => {
  const defaultProps = {
    tabId: 'test-tab',
    isActive: false,
    children: <div data-testid="test-content">Test Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TC-02-01: 비활성 탭 display:none', () => {
    it('비활성 탭은 display:none으로 숨겨진다', () => {
      render(<TabPane {...defaultProps} isActive={false} />);

      const pane = screen.getByTestId('mdi-tab-pane-test-tab');
      expect(pane).toHaveStyle({ display: 'none' });
    });
  });

  describe('TC-02-02: 활성 탭 display:block', () => {
    it('활성 탭은 display:block으로 표시된다', () => {
      render(<TabPane {...defaultProps} isActive={true} />);

      const pane = screen.getByTestId('mdi-tab-pane-test-tab');
      expect(pane).not.toHaveStyle({ display: 'none' });
    });
  });

  describe('TC-BR-01: DOM 유지', () => {
    it('비활성 시에도 자식 컴포넌트가 DOM에 존재한다', () => {
      render(<TabPane {...defaultProps} isActive={false} />);

      // 자식 컴포넌트가 DOM에 존재해야 함
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('ARIA 접근성', () => {
    it('role="tabpanel" 속성이 설정된다', () => {
      render(<TabPane {...defaultProps} />);

      expect(screen.getByTestId('mdi-tab-pane-test-tab')).toHaveAttribute(
        'role',
        'tabpanel'
      );
    });

    it('aria-labelledby가 탭 ID와 연결된다', () => {
      render(<TabPane {...defaultProps} />);

      expect(screen.getByTestId('mdi-tab-pane-test-tab')).toHaveAttribute(
        'aria-labelledby',
        'tab-test-tab'
      );
    });

    it('활성 탭은 aria-hidden="false"로 설정된다', () => {
      render(<TabPane {...defaultProps} isActive={true} />);

      expect(screen.getByTestId('mdi-tab-pane-test-tab')).toHaveAttribute(
        'aria-hidden',
        'false'
      );
    });

    it('비활성 탭은 aria-hidden="true"로 설정된다', () => {
      render(<TabPane {...defaultProps} isActive={false} />);

      expect(screen.getByTestId('mdi-tab-pane-test-tab')).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    });
  });

  describe('스타일', () => {
    it('height: 100% 스타일이 적용된다', () => {
      render(<TabPane {...defaultProps} isActive={true} />);

      const pane = screen.getByTestId('mdi-tab-pane-test-tab');
      expect(pane).toHaveClass('h-full');
    });

    it('overflow: auto 스타일이 적용된다', () => {
      render(<TabPane {...defaultProps} isActive={true} />);

      const pane = screen.getByTestId('mdi-tab-pane-test-tab');
      expect(pane).toHaveClass('overflow-auto');
    });
  });

  describe('data-testid', () => {
    it('mdi-tab-pane-{tabId} 형식의 data-testid가 설정된다', () => {
      render(<TabPane {...defaultProps} tabId="custom-id" />);

      expect(screen.getByTestId('mdi-tab-pane-custom-id')).toBeInTheDocument();
    });
  });
});
