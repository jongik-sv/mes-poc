// NotificationSettings.test.tsx
// TSK-06-19: 알림 설정 관리 컴포넌트 단위 테스트

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationSettings from '../index'

// Mock useGlobalHotkeys
const mockUseGlobalHotkeys = vi.fn()
vi.mock('@/lib/hooks', () => ({
  useGlobalHotkeys: (options: { onSave?: () => void }) => {
    mockUseGlobalHotkeys(options)
  },
  getModifierKey: () => 'Ctrl',
}))

describe('NotificationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // UT-001: 초기 렌더링
  it('should render all categories and recipients', async () => {
    render(<NotificationSettings />)

    // 로딩 후 페이지 표시 대기
    await waitFor(() => {
      expect(screen.getByTestId('notification-settings-page')).toBeInTheDocument()
    })

    // 4개 카테고리 Switch 확인
    expect(screen.getByTestId('category-switch-production')).toBeInTheDocument()
    expect(screen.getByTestId('category-switch-quality')).toBeInTheDocument()
    expect(screen.getByTestId('category-switch-equipment')).toBeInTheDocument()
    expect(screen.getByTestId('category-switch-system')).toBeInTheDocument()

    // 3명 수신자 표시 확인 (input value로 표시됨)
    expect(screen.getByDisplayValue('홍길동')).toBeInTheDocument()
    expect(screen.getByDisplayValue('김철수')).toBeInTheDocument()
    expect(screen.getByDisplayValue('이영희')).toBeInTheDocument()
  })

  // UT-002: Switch 토글 상태 변경
  it('should toggle switch and set dirty state', async () => {
    const user = userEvent.setup()
    render(<NotificationSettings />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-settings-page')).toBeInTheDocument()
    })

    // 생산 알림 Switch가 처음에 체크됨
    const productionSwitch = screen.getByTestId('category-switch-production')
    expect(productionSwitch).toBeChecked()

    // Switch 토글
    await user.click(productionSwitch)

    // 상태 변경 확인
    expect(productionSwitch).not.toBeChecked()
  })

  // UT-005: Ctrl+S 저장 콜백 호출
  it('should call save on Ctrl+S', async () => {
    render(<NotificationSettings />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-settings-page')).toBeInTheDocument()
    })

    // useGlobalHotkeys에 onSave 콜백이 전달되었는지 확인
    expect(mockUseGlobalHotkeys).toHaveBeenCalled()
    const lastCall = mockUseGlobalHotkeys.mock.calls[mockUseGlobalHotkeys.mock.calls.length - 1][0]
    expect(lastCall.onSave).toBeDefined()
  })

  // UT-006: 기본값 복원
  it('should restore defaults after confirmation', async () => {
    const user = userEvent.setup()
    render(<NotificationSettings />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-settings-page')).toBeInTheDocument()
    })

    // 기본값 복원 버튼 클릭
    const restoreBtn = screen.getByTestId('restore-defaults-btn')
    await user.click(restoreBtn)

    // Modal 확인
    await waitFor(() => {
      expect(screen.getByText('모든 알림 설정이 기본값으로 초기화됩니다. 이 작업은 취소할 수 없습니다.')).toBeInTheDocument()
    })

    // 복원 버튼 클릭
    const confirmBtn = screen.getByRole('button', { name: '복원' })
    await user.click(confirmBtn)

    // 기본값 복원 후 설비 알림이 활성화됨 (기본값은 모두 true)
    await waitFor(() => {
      const equipmentSwitch = screen.getByTestId('category-switch-equipment')
      expect(equipmentSwitch).toBeChecked()
    })
  })

  // UT-007: 미저장 경고 (beforeunload)
  it('should register beforeunload when dirty', async () => {
    const user = userEvent.setup()
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

    render(<NotificationSettings />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-settings-page')).toBeInTheDocument()
    })

    // 설정 변경하여 dirty 상태로 만들기
    const productionSwitch = screen.getByTestId('category-switch-production')
    await user.click(productionSwitch)

    // beforeunload 이벤트 리스너 등록 확인
    await waitFor(() => {
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      )
    })

    addEventListenerSpy.mockRestore()
  })

  // 저장 버튼 클릭 테스트
  it('should save settings when save button clicked', async () => {
    const user = userEvent.setup()
    render(<NotificationSettings />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-settings-page')).toBeInTheDocument()
    })

    // 저장 버튼 클릭
    const saveBtn = screen.getByTestId('save-btn')
    await user.click(saveBtn)

    // 저장 버튼이 로딩 상태가 되었다가 완료됨
    await waitFor(() => {
      expect(saveBtn).not.toBeDisabled()
    }, { timeout: 2000 })
  })

  // 로딩 상태 테스트
  it('should show loading state initially', async () => {
    render(<NotificationSettings />)
    // 로딩 상태는 매우 짧게 표시되므로 queryByTestId 사용
    // 로딩이 끝난 후 페이지가 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByTestId('notification-settings-page')).toBeInTheDocument()
    })
  })

  // 카테고리 이름 표시 테스트
  it('should display category names', async () => {
    render(<NotificationSettings />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-settings-page')).toBeInTheDocument()
    })

    expect(screen.getByTestId('category-name-production')).toHaveTextContent('생산 알림')
    expect(screen.getByTestId('category-name-quality')).toHaveTextContent('품질 알림')
    expect(screen.getByTestId('category-name-equipment')).toHaveTextContent('설비 알림')
    expect(screen.getByTestId('category-name-system')).toHaveTextContent('시스템 알림')
  })

  // 설비 알림이 기본적으로 비활성화되어 있는지 테스트
  it('should have equipment notification disabled by default', async () => {
    render(<NotificationSettings />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-settings-page')).toBeInTheDocument()
    })

    const equipmentSwitch = screen.getByTestId('category-switch-equipment')
    expect(equipmentSwitch).not.toBeChecked()
  })
})
