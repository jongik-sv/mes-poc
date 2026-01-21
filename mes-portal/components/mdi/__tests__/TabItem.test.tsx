/**
 * TabItem 컴포넌트 단위 테스트
 * @description TSK-02-02 탭 바 컴포넌트 - TabItem 테스트
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabItem } from '../TabItem';
import type { Tab } from '@/lib/mdi/types';

describe('TabItem', () => {
  const defaultTab: Tab = {
    id: 'tab1',
    title: '대시보드',
    path: '/dashboard',
    icon: 'DashboardOutlined',
    closable: true,
  };

  const defaultProps = {
    tab: defaultTab,
    isActive: false,
    onClick: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('탭 제목을 렌더링한다', () => {
      render(<TabItem {...defaultProps} />);
      expect(screen.getByText('대시보드')).toBeInTheDocument();
    });

    it('data-testid 속성이 올바르게 설정된다', () => {
      render(<TabItem {...defaultProps} />);
      expect(screen.getByTestId('tab-item-tab1')).toBeInTheDocument();
    });

    it('아이콘이 있으면 렌더링한다', () => {
      render(<TabItem {...defaultProps} />);
      // 아이콘 컨테이너 확인
      expect(screen.getByTestId('tab-icon-tab1')).toBeInTheDocument();
    });

    it('아이콘이 없으면 아이콘 영역을 렌더링하지 않는다', () => {
      const tabWithoutIcon = { ...defaultTab, icon: undefined };
      render(<TabItem {...defaultProps} tab={tabWithoutIcon} />);
      expect(screen.queryByTestId('tab-icon-tab1')).not.toBeInTheDocument();
    });

    it('closable이 true면 닫기 버튼을 표시한다', () => {
      render(<TabItem {...defaultProps} />);
      expect(screen.getByTestId('tab-close-btn-tab1')).toBeInTheDocument();
    });

    it('closable이 false면 닫기 버튼을 숨긴다', () => {
      const unclosableTab = { ...defaultTab, closable: false };
      render(<TabItem {...defaultProps} tab={unclosableTab} />);
      expect(screen.queryByTestId('tab-close-btn-tab1')).not.toBeInTheDocument();
    });

    it('닫기 버튼에 aria-label이 설정된다', () => {
      render(<TabItem {...defaultProps} />);
      expect(screen.getByLabelText('대시보드 탭 닫기')).toBeInTheDocument();
    });
  });

  describe('활성 상태', () => {
    it('isActive가 true면 aria-selected가 true로 설정된다', () => {
      render(<TabItem {...defaultProps} isActive={true} />);
      expect(screen.getByTestId('tab-item-tab1')).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('isActive가 false면 aria-selected가 false로 설정된다', () => {
      render(<TabItem {...defaultProps} isActive={false} />);
      expect(screen.getByTestId('tab-item-tab1')).toHaveAttribute(
        'aria-selected',
        'false'
      );
    });

    it('활성 탭은 tabIndex가 0이다', () => {
      render(<TabItem {...defaultProps} isActive={true} />);
      expect(screen.getByTestId('tab-item-tab1')).toHaveAttribute('tabIndex', '0');
    });

    it('비활성 탭은 tabIndex가 -1이다', () => {
      render(<TabItem {...defaultProps} isActive={false} />);
      expect(screen.getByTestId('tab-item-tab1')).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('이벤트 핸들링', () => {
    it('탭 클릭 시 onClick이 호출된다', async () => {
      const user = userEvent.setup();
      render(<TabItem {...defaultProps} />);

      await user.click(screen.getByTestId('tab-item-tab1'));

      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });

    it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      render(<TabItem {...defaultProps} />);

      await user.click(screen.getByTestId('tab-close-btn-tab1'));

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('닫기 버튼 클릭 시 이벤트 전파가 중지된다 (탭 클릭 발생 안 함)', async () => {
      const user = userEvent.setup();
      render(<TabItem {...defaultProps} />);

      await user.click(screen.getByTestId('tab-close-btn-tab1'));

      // onClose만 호출되고 onClick은 호출되지 않아야 함
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClick).not.toHaveBeenCalled();
    });

    it('Enter 키로 탭을 활성화할 수 있다', async () => {
      const user = userEvent.setup();
      render(<TabItem {...defaultProps} isActive={true} />);

      const tabItem = screen.getByTestId('tab-item-tab1');
      tabItem.focus();
      await user.keyboard('{Enter}');

      expect(defaultProps.onClick).toHaveBeenCalled();
    });

    it('Space 키로 탭을 활성화할 수 있다', async () => {
      const user = userEvent.setup();
      render(<TabItem {...defaultProps} isActive={true} />);

      const tabItem = screen.getByTestId('tab-item-tab1');
      tabItem.focus();
      await user.keyboard(' ');

      expect(defaultProps.onClick).toHaveBeenCalled();
    });
  });

  describe('접근성', () => {
    it('role="tab" 속성이 설정된다', () => {
      render(<TabItem {...defaultProps} />);
      expect(screen.getByTestId('tab-item-tab1')).toHaveAttribute('role', 'tab');
    });

    it('닫기 버튼에 적절한 role이 설정된다', () => {
      render(<TabItem {...defaultProps} />);
      expect(screen.getByTestId('tab-close-btn-tab1')).toHaveAttribute(
        'role',
        'button'
      );
    });
  });

  describe('긴 제목 처리', () => {
    it('긴 제목은 truncate 처리된다', () => {
      const longTitleTab = {
        ...defaultTab,
        title: '매우 긴 화면 제목으로 테스트하기 위한 탭',
      };
      render(<TabItem {...defaultProps} tab={longTitleTab} />);

      const titleElement = screen.getByTestId('tab-title-tab1');
      // truncate 스타일 적용 확인
      expect(titleElement).toHaveClass('truncate');
    });
  });
});
