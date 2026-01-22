/**
 * @file SettingWizard.test.tsx
 * @description 설정 마법사 샘플 단위 테스트
 * @task TSK-06-09
 *
 * @testSpecRef 026-test-specification.md
 * - UT-001 ~ UT-012
 *
 * @traceable
 * - FR-001 ~ FR-008
 * - BR-001 ~ BR-005
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SettingWizard } from '../index'
import type { WizardConfigData } from '../types'

// Mock useRouter
const mockPush = vi.fn()
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
  refresh: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/sample/setting-wizard',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock useMDI
const mockCloseTab = vi.fn()
vi.mock('@/lib/mdi/context', () => ({
  useMDI: () => ({
    closeTab: mockCloseTab,
    openTab: vi.fn(),
    tabs: [],
    activeTab: null,
    setActiveTab: vi.fn(),
  }),
}))

// Mock message
vi.mock('antd', async () => {
  const antd = await vi.importActual('antd')
  return {
    ...antd,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  }
})

// 테스트용 Mock 설정 데이터
const mockConfig: WizardConfigData = {
  defaults: {
    basicInfo: {
      companyName: '',
      factoryName: '',
      adminEmail: '',
    },
    detailSettings: {
      serverAddress: '192.168.1.100',
      port: 8080,
      timeout: 30,
      autoReconnect: true,
      debugMode: false,
      useSSL: false,
    },
  },
  validation: {
    companyName: { minLength: 2, maxLength: 50 },
    factoryName: { minLength: 2, maxLength: 50 },
    adminEmail: { maxLength: 254 },
    serverAddress: { maxLength: 253 },
    port: { min: 1, max: 65535 },
    timeout: { min: 1, max: 300 },
  },
  messages: {
    success: '설정이 완료되었습니다!',
    successDescription:
      '시스템 설정이 성공적으로 저장되었습니다. 이제 대시보드로 이동하여 사용할 수 있습니다.',
  },
}

describe('SettingWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('렌더링', () => {
    it('페이지가 정상적으로 렌더링되어야 한다', () => {
      render(<SettingWizard config={mockConfig} />)

      expect(screen.getByTestId('setting-wizard-page')).toBeInTheDocument()
      expect(screen.getByText('설정 마법사')).toBeInTheDocument()
    })

    it('Steps에 4단계가 표시되어야 한다', () => {
      render(<SettingWizard config={mockConfig} />)

      expect(screen.getByText('기본 정보')).toBeInTheDocument()
      expect(screen.getByText('상세 설정')).toBeInTheDocument()
      expect(screen.getByText('확인')).toBeInTheDocument()
      expect(screen.getByText('완료')).toBeInTheDocument()
    })
  })

  describe('BasicInfoStep (UT-001, UT-002)', () => {
    it('UT-001: 회사명이 정상적으로 입력되어야 한다', async () => {
      const user = userEvent.setup()
      render(<SettingWizard config={mockConfig} />)

      const companyNameInput = screen.getByTestId('company-name-input')
      await user.type(companyNameInput, 'ABC 제조')

      expect(companyNameInput).toHaveValue('ABC 제조')
    })

    it('UT-002: 회사명이 비어있으면 에러 메시지가 표시되어야 한다', async () => {
      const user = userEvent.setup()
      render(<SettingWizard config={mockConfig} />)

      // 다음 버튼 클릭
      const nextButton = screen.getByRole('button', { name: /다음/i })
      await user.click(nextButton)

      // 에러 메시지 확인
      await waitFor(() => {
        expect(screen.getByText('회사명을 입력해주세요')).toBeInTheDocument()
      })
    })

    it('UT-008: 이메일 형식이 잘못되면 에러 메시지가 표시되어야 한다', async () => {
      const user = userEvent.setup()
      render(<SettingWizard config={mockConfig} />)

      const companyNameInput = screen.getByTestId('company-name-input')
      const factoryNameInput = screen.getByTestId('factory-name-input')
      const emailInput = screen.getByTestId('admin-email-input')

      await user.type(companyNameInput, 'ABC 제조')
      await user.type(factoryNameInput, '1공장')
      await user.type(emailInput, 'invalid-email')

      // 다음 버튼 클릭
      const nextButton = screen.getByRole('button', { name: /다음/i })
      await user.click(nextButton)

      // 에러 메시지 확인
      await waitFor(() => {
        expect(
          screen.getByText('올바른 이메일 형식이 아닙니다')
        ).toBeInTheDocument()
      })
    })
  })

  describe('단계 진행 (UT-007)', () => {
    it('유효한 데이터 입력 후 다음 단계로 진행되어야 한다', async () => {
      const user = userEvent.setup()
      render(<SettingWizard config={mockConfig} />)

      // 1단계 데이터 입력
      await user.type(screen.getByTestId('company-name-input'), 'ABC 제조')
      await user.type(screen.getByTestId('factory-name-input'), '1공장')
      await user.type(
        screen.getByTestId('admin-email-input'),
        'admin@abc.com'
      )

      // 다음 버튼 클릭
      const nextButton = screen.getByRole('button', { name: /다음/i })
      await user.click(nextButton)

      // 2단계 확인
      await waitFor(() => {
        expect(
          screen.getByTestId('wizard-step-detail-settings-content')
        ).toBeInTheDocument()
      })
    })
  })

  describe('DetailSettingsStep (UT-003, UT-004)', () => {
    async function goToStep2(user: ReturnType<typeof userEvent.setup>) {
      await user.type(screen.getByTestId('company-name-input'), 'ABC 제조')
      await user.type(screen.getByTestId('factory-name-input'), '1공장')
      await user.type(
        screen.getByTestId('admin-email-input'),
        'admin@abc.com'
      )
      const nextButton = screen.getByRole('button', { name: /다음/i })
      await user.click(nextButton)
      await waitFor(() => {
        expect(
          screen.getByTestId('wizard-step-detail-settings-content')
        ).toBeInTheDocument()
      })
    }

    it('UT-003: 서버 주소가 정상적으로 입력되어야 한다', async () => {
      const user = userEvent.setup()
      render(<SettingWizard config={mockConfig} />)

      await goToStep2(user)

      const serverInput = screen.getByTestId('server-address-input')
      await user.clear(serverInput)
      await user.type(serverInput, '192.168.1.200')

      expect(serverInput).toHaveValue('192.168.1.200')
    })

    it('UT-004: 포트 번호가 범위를 벗어나면 에러가 표시되어야 한다', async () => {
      const user = userEvent.setup()
      render(<SettingWizard config={mockConfig} />)

      await goToStep2(user)

      const portInput = screen.getByTestId('port-input')
      await user.clear(portInput)
      await user.type(portInput, '70000')

      // 다음 버튼 클릭
      const nextButton = screen.getByRole('button', { name: /다음/i })
      await user.click(nextButton)

      // 에러 메시지 확인
      await waitFor(() => {
        expect(
          screen.getByText('1-65535 사이의 숫자를 입력해주세요')
        ).toBeInTheDocument()
      })
    })
  })

  describe('네비게이션 (UT-010)', () => {
    it('이전 버튼 클릭 시 이전 단계로 이동하고 데이터가 유지되어야 한다', async () => {
      const user = userEvent.setup()
      render(<SettingWizard config={mockConfig} />)

      // 1단계 데이터 입력
      await user.type(screen.getByTestId('company-name-input'), 'ABC 제조')
      await user.type(screen.getByTestId('factory-name-input'), '1공장')
      await user.type(
        screen.getByTestId('admin-email-input'),
        'admin@abc.com'
      )

      // 다음으로 이동
      await user.click(screen.getByRole('button', { name: /다음/i }))

      await waitFor(() => {
        expect(
          screen.getByTestId('wizard-step-detail-settings-content')
        ).toBeInTheDocument()
      })

      // 이전으로 돌아가기
      await user.click(screen.getByRole('button', { name: /이전/i }))

      await waitFor(() => {
        expect(
          screen.getByTestId('wizard-step-basic-info-content')
        ).toBeInTheDocument()
      })

      // 데이터 유지 확인
      expect(screen.getByTestId('company-name-input')).toHaveValue('ABC 제조')
      expect(screen.getByTestId('factory-name-input')).toHaveValue('1공장')
      expect(screen.getByTestId('admin-email-input')).toHaveValue(
        'admin@abc.com'
      )
    })
  })

  describe('확인 단계 (UT-005)', () => {
    async function goToStep3(user: ReturnType<typeof userEvent.setup>) {
      // 1단계
      await user.type(screen.getByTestId('company-name-input'), 'ABC 제조')
      await user.type(screen.getByTestId('factory-name-input'), '1공장')
      await user.type(
        screen.getByTestId('admin-email-input'),
        'admin@abc.com'
      )
      await user.click(screen.getByRole('button', { name: /다음/i }))

      await waitFor(() => {
        expect(
          screen.getByTestId('wizard-step-detail-settings-content')
        ).toBeInTheDocument()
      })

      // 2단계
      await user.click(screen.getByRole('button', { name: /다음/i }))

      await waitFor(() => {
        expect(screen.getByTestId('wizard-confirmation')).toBeInTheDocument()
      })
    }

    it('확인 단계에서 모든 입력 데이터가 표시되어야 한다', async () => {
      const user = userEvent.setup()
      render(<SettingWizard config={mockConfig} />)

      await goToStep3(user)

      // 기본정보 확인
      expect(screen.getByText('ABC 제조')).toBeInTheDocument()
      expect(screen.getByText('1공장')).toBeInTheDocument()
      expect(screen.getByText('admin@abc.com')).toBeInTheDocument()

      // 상세설정 확인
      expect(screen.getByText('192.168.1.100')).toBeInTheDocument()
      expect(screen.getByText('8080')).toBeInTheDocument()
    })
  })

  describe('완료 단계 (UT-006)', () => {
    async function goToComplete(user: ReturnType<typeof userEvent.setup>) {
      // 1단계
      await user.type(screen.getByTestId('company-name-input'), 'ABC 제조')
      await user.type(screen.getByTestId('factory-name-input'), '1공장')
      await user.type(
        screen.getByTestId('admin-email-input'),
        'admin@abc.com'
      )
      await user.click(screen.getByRole('button', { name: /다음/i }))

      await waitFor(() => {
        expect(
          screen.getByTestId('wizard-step-detail-settings-content')
        ).toBeInTheDocument()
      })

      // 2단계
      await user.click(screen.getByRole('button', { name: /다음/i }))

      await waitFor(() => {
        expect(screen.getByTestId('wizard-confirmation')).toBeInTheDocument()
      })

      // 3단계 -> 완료 (data-testid 사용하여 명확하게 선택)
      await user.click(screen.getByTestId('wizard-finish-btn'))
    }

    it('완료 후 성공 메시지가 표시되어야 한다', async () => {
      const user = userEvent.setup()
      render(<SettingWizard config={mockConfig} />)

      await goToComplete(user)

      await waitFor(
        () => {
          expect(screen.getByTestId('wizard-result')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )

      expect(screen.getByText('설정이 완료되었습니다!')).toBeInTheDocument()
    })

    it('대시보드 이동 버튼 클릭 시 대시보드로 이동해야 한다', async () => {
      const user = userEvent.setup()
      render(<SettingWizard config={mockConfig} />)

      await goToComplete(user)

      await waitFor(
        () => {
          expect(screen.getByTestId('wizard-result')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )

      await user.click(screen.getByTestId('go-dashboard-btn'))

      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('취소 (UT-012)', () => {
    it('데이터가 있을 때 취소 버튼 클릭 시 확인 다이얼로그가 표시되어야 한다', async () => {
      const user = userEvent.setup()
      render(<SettingWizard config={mockConfig} />)

      // 데이터 입력
      await user.type(screen.getByTestId('company-name-input'), 'ABC 제조')

      // 취소 버튼 클릭
      const cancelButton = screen.getByRole('button', { name: /취소/i })
      await user.click(cancelButton)

      // 확인 다이얼로그 확인
      await waitFor(() => {
        expect(
          screen.getByText(
            '진행 중인 내용이 저장되지 않습니다. 취소하시겠습니까?'
          )
        ).toBeInTheDocument()
      })
    })
  })
})
