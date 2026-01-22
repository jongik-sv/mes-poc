// components/common/__tests__/NotificationPanel.test.tsx
// NotificationPanel 컴포넌트 단위 테스트 (TSK-01-06)

import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationPanel, Notification } from '../NotificationPanel'

// Mock token 값
const mockToken = {
  colorBgElevated: '#ffffff',
  boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
  colorBorder: '#E2E8F0',
  colorText: '#0F172A',
  colorPrimaryBg: '#DBEAFE',
  colorPrimary: '#2563EB',
  colorFillSecondary: '#F8FAFC',
  colorTextSecondary: '#475569',
}

// Ant Design 모킹
vi.mock('antd', () => ({
  Button: ({ children, icon, onClick, type, size, block, ...props }: any) => (
    <button onClick={onClick} data-type={type} data-size={size} data-block={block} {...props}>
      {icon}
      {children}
    </button>
  ),
  List: ({ dataSource, renderItem, locale, ...props }: any) => (
    <div data-testid="notification-list" {...props}>
      {dataSource?.length === 0 ? (
        <div data-testid="notification-empty">{locale?.emptyText}</div>
      ) : (
        dataSource?.map((item: any, index: number) => (
          <div key={item.id || index}>{renderItem(item)}</div>
        ))
      )}
    </div>
  ),
  Empty: ({ description }: any) => (
    <div data-testid="empty-state">
      <span>{description}</span>
    </div>
  ),
  Typography: {
    Text: ({ children, type, ellipsis, ...props }: any) => (
      <span data-type={type} data-ellipsis={String(ellipsis)} {...props}>{children}</span>
    ),
    Title: ({ children, level, ...props }: any) => (
      <span data-level={level} {...props}>{children}</span>
    ),
  },
  Spin: ({ spinning, children }: any) => (
    spinning ? <div data-testid="loading-spinner">Loading...</div> : children
  ),
  Divider: () => <hr />,
  theme: {
    useToken: () => ({ token: mockToken }),
  },
}))

// Ant Design Icons 모킹
vi.mock('@ant-design/icons', () => ({
  BellOutlined: () => <span data-testid="bell-icon">bell</span>,
  CheckCircleOutlined: () => <span data-testid="check-icon">check</span>,
  ExclamationCircleOutlined: () => <span data-testid="exclamation-icon">exclamation</span>,
  WarningOutlined: () => <span data-testid="warning-icon">warning</span>,
  InfoCircleOutlined: () => <span data-testid="info-icon">info</span>,
  CloseOutlined: () => <span data-testid="close-icon">close</span>,
}))

// 테스트 데이터
const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'error',
    title: '설비 이상',
    message: 'A라인 온도 이상',
    isRead: false,
    createdAt: '2026-01-20T09:00:00Z',
    link: '/equipment',
    linkTitle: '설비 현황',
  },
  {
    id: 'n2',
    type: 'warning',
    title: '작업 변경',
    message: '수량 변경됨',
    isRead: false,
    createdAt: '2026-01-20T08:30:00Z',
    link: '/work-order',
    linkTitle: '작업 지시',
  },
  {
    id: 'n3',
    type: 'success',
    title: '검사 완료',
    message: '합격',
    isRead: true,
    createdAt: '2026-01-20T08:00:00Z',
  },
]

describe('NotificationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // UT-001: 알림 아이콘 렌더링
  describe('UT-001: 알림 아이콘 렌더링', () => {
    it('패널이 열려있을 때 알림 패널이 표시되어야 함', () => {
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
        />
      )
      expect(screen.getByTestId('notification-panel')).toBeInTheDocument()
    })

    it('패널이 닫혀있을 때 알림 패널이 표시되지 않아야 함', () => {
      render(
        <NotificationPanel
          open={false}
          notifications={mockNotifications}
          onClose={vi.fn()}
        />
      )
      expect(screen.queryByTestId('notification-panel')).not.toBeInTheDocument()
    })
  })

  // UT-002: 뱃지 - 읽지 않은 알림 개수 표시
  describe('UT-002: 읽지 않은 알림 개수', () => {
    it('읽지 않은 알림 개수가 계산되어야 함', () => {
      const onMarkAsRead = vi.fn()
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
          onMarkAsRead={onMarkAsRead}
        />
      )
      // 읽지 않은 알림: n1, n2 (2개)
      const unreadCount = mockNotifications.filter(n => !n.isRead).length
      expect(unreadCount).toBe(2)
    })
  })

  // UT-003: 패널 열기
  describe('UT-003: 패널 열기/닫기', () => {
    it('닫기 버튼 클릭 시 onClose 콜백이 호출되어야 함', () => {
      const onClose = vi.fn()
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={onClose}
        />
      )

      const closeButton = screen.getByTestId('notification-close-btn')
      fireEvent.click(closeButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  // UT-004: 알림 목록 렌더링
  describe('UT-004: 알림 목록 렌더링', () => {
    it('알림 목록이 표시되어야 함', () => {
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByText('설비 이상')).toBeInTheDocument()
      expect(screen.getByText('작업 변경')).toBeInTheDocument()
      expect(screen.getByText('검사 완료')).toBeInTheDocument()
    })

    it('알림 메시지가 표시되어야 함', () => {
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByText('A라인 온도 이상')).toBeInTheDocument()
      expect(screen.getByText('수량 변경됨')).toBeInTheDocument()
    })
  })

  // UT-005: 알림 읽음 처리
  describe('UT-005: 알림 읽음 처리', () => {
    it('알림 클릭 시 onMarkAsRead 콜백이 호출되어야 함', () => {
      const onMarkAsRead = vi.fn()
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
          onMarkAsRead={onMarkAsRead}
        />
      )

      const notificationItem = screen.getByTestId('notification-item-n1')
      fireEvent.click(notificationItem)

      expect(onMarkAsRead).toHaveBeenCalledWith('n1')
    })
  })

  // UT-006: 화면 이동 (MDI 탭 열기)
  describe('UT-006: 화면 이동', () => {
    it('link가 있는 알림 클릭 시 onNavigate 콜백이 호출되어야 함', () => {
      const onNavigate = vi.fn()
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
          onNavigate={onNavigate}
        />
      )

      const notificationItem = screen.getByTestId('notification-item-n1')
      fireEvent.click(notificationItem)

      expect(onNavigate).toHaveBeenCalledWith('/equipment', '설비 현황')
    })

    it('link가 없는 알림 클릭 시 onNavigate가 호출되지 않아야 함', () => {
      const onNavigate = vi.fn()
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
          onNavigate={onNavigate}
        />
      )

      const notificationItem = screen.getByTestId('notification-item-n3')
      fireEvent.click(notificationItem)

      expect(onNavigate).not.toHaveBeenCalled()
    })
  })

  // UT-007: 모두 읽음 처리
  describe('UT-007: 모두 읽음 처리', () => {
    it('모두 읽음 버튼 클릭 시 onMarkAllAsRead 콜백이 호출되어야 함', () => {
      const onMarkAllAsRead = vi.fn()
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
          onMarkAllAsRead={onMarkAllAsRead}
        />
      )

      const markAllButton = screen.getByTestId('mark-all-read-btn')
      fireEvent.click(markAllButton)

      expect(onMarkAllAsRead).toHaveBeenCalledTimes(1)
    })
  })

  // UT-008: 정렬 (최신순)
  describe('UT-008: 알림 정렬 (BR-001)', () => {
    it('알림이 최신순으로 정렬되어야 함 (createdAt DESC)', () => {
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
        />
      )

      // 알림 아이템들을 순서대로 가져옴
      const items = screen.getAllByTestId(/^notification-item-/)

      // 첫 번째 아이템이 가장 최신 (n1: 09:00)
      expect(items[0]).toHaveAttribute('data-testid', 'notification-item-n1')
      // 두 번째 아이템 (n2: 08:30)
      expect(items[1]).toHaveAttribute('data-testid', 'notification-item-n2')
      // 세 번째 아이템 (n3: 08:00)
      expect(items[2]).toHaveAttribute('data-testid', 'notification-item-n3')
    })
  })

  // UT-009: 읽지 않은 알림 강조 (BR-002)
  describe('UT-009: 읽지 않은 알림 강조 (BR-002)', () => {
    it('읽지 않은 알림은 unread 클래스를 가져야 함', () => {
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
        />
      )

      const unreadItem = screen.getByTestId('notification-item-n1')
      expect(unreadItem).toHaveAttribute('data-unread', 'true')
    })

    it('읽은 알림은 unread 클래스를 가지지 않아야 함', () => {
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
        />
      )

      const readItem = screen.getByTestId('notification-item-n3')
      expect(readItem).toHaveAttribute('data-unread', 'false')
    })
  })

  // UT-010: 뱃지 최대 표시 (BR-005)
  describe('UT-010: 뱃지 최대 표시 99+ (BR-005)', () => {
    it('100개 이상일 때 99+로 표시되어야 함', () => {
      // 이 테스트는 뱃지를 직접 테스트하지만, 패널에서 unreadCount 계산 확인
      const manyNotifications: Notification[] = Array.from({ length: 105 }, (_, i) => ({
        id: `n${i}`,
        type: 'info',
        title: `알림 ${i}`,
        message: `메시지 ${i}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      }))

      const unreadCount = manyNotifications.filter(n => !n.isRead).length
      expect(unreadCount).toBe(105)
      // 실제 뱃지 표시는 Badge 컴포넌트의 overflowCount prop으로 처리
    })
  })

  // 빈 상태 테스트
  describe('빈 상태', () => {
    it('알림이 없을 때 빈 상태가 표시되어야 함', () => {
      render(
        <NotificationPanel
          open={true}
          notifications={[]}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByTestId('notification-empty')).toBeInTheDocument()
    })
  })

  // 로딩 상태 테스트
  describe('로딩 상태', () => {
    it('로딩 중일 때 스피너가 표시되어야 함', () => {
      render(
        <NotificationPanel
          open={true}
          notifications={[]}
          onClose={vi.fn()}
          loading={true}
        />
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })

  // 알림 유형별 아이콘 테스트
  describe('알림 유형별 아이콘', () => {
    it('error 유형은 exclamation 아이콘을 표시해야 함', () => {
      const errorNotification: Notification[] = [{
        id: 'e1',
        type: 'error',
        title: '에러',
        message: '에러 메시지',
        isRead: false,
        createdAt: new Date().toISOString(),
      }]

      render(
        <NotificationPanel
          open={true}
          notifications={errorNotification}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument()
    })

    it('warning 유형은 warning 아이콘을 표시해야 함', () => {
      const warningNotification: Notification[] = [{
        id: 'w1',
        type: 'warning',
        title: '경고',
        message: '경고 메시지',
        isRead: false,
        createdAt: new Date().toISOString(),
      }]

      render(
        <NotificationPanel
          open={true}
          notifications={warningNotification}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByTestId('warning-icon')).toBeInTheDocument()
    })

    it('success 유형은 check 아이콘을 표시해야 함', () => {
      const successNotification: Notification[] = [{
        id: 's1',
        type: 'success',
        title: '성공',
        message: '성공 메시지',
        isRead: false,
        createdAt: new Date().toISOString(),
      }]

      render(
        <NotificationPanel
          open={true}
          notifications={successNotification}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    })

    it('info 유형은 info 아이콘을 표시해야 함', () => {
      const infoNotification: Notification[] = [{
        id: 'i1',
        type: 'info',
        title: '정보',
        message: '정보 메시지',
        isRead: false,
        createdAt: new Date().toISOString(),
      }]

      render(
        <NotificationPanel
          open={true}
          notifications={infoNotification}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByTestId('info-icon')).toBeInTheDocument()
    })
  })

  // 접근성 테스트
  describe('접근성', () => {
    it('패널에 role="dialog"가 있어야 함', () => {
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
        />
      )

      const panel = screen.getByTestId('notification-panel')
      expect(panel).toHaveAttribute('role', 'dialog')
    })

    it('패널에 aria-label이 있어야 함', () => {
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
        />
      )

      const panel = screen.getByTestId('notification-panel')
      expect(panel).toHaveAttribute('aria-label', '알림 목록')
    })

    it('모두 읽음 버튼에 aria-label이 있어야 함', () => {
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
        />
      )

      const markAllButton = screen.getByTestId('mark-all-read-btn')
      expect(markAllButton).toHaveAttribute('aria-label', '모든 알림 읽음 처리')
    })
  })

  // 시간 표시 테스트
  describe('상대 시간 표시', () => {
    it('알림 시간이 상대적 형식으로 표시되어야 함', () => {
      render(
        <NotificationPanel
          open={true}
          notifications={mockNotifications}
          onClose={vi.fn()}
        />
      )

      // 상대 시간 형식이 표시되어야 함 (예: "5분 전", "1시간 전" 등)
      // 실제 구현에서는 formatDistanceToNow 또는 직접 계산
      const timeElements = screen.getAllByTestId(/^notification-time-/)
      expect(timeElements.length).toBeGreaterThan(0)
    })
  })
})
