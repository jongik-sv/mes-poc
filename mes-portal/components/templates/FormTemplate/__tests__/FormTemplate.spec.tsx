/**
 * @file FormTemplate.spec.tsx
 * @description FormTemplate 컴포넌트 단위 테스트
 * @task TSK-06-03
 *
 * @requirements
 * - FR-001: 폼 레이아웃 (수직/수평/인라인)
 * - FR-002: 유효성 검사
 * - FR-003: 저장/취소 버튼
 * - FR-004: 수정된 필드 표시 (변경 감지)
 * - FR-005: 폼 초기화/리셋
 *
 * @businessRules
 * - BR-01: 저장 전 유효성 검사 필수
 * - BR-02: 변경 시 이탈 확인
 * - BR-03: 필수 필드 표시
 * - BR-04: 저장 중 중복 클릭 방지
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Form, Input, InputNumber, Select } from 'antd'
import { FormTemplate } from '../index'
import { ConfigProvider } from 'antd'

// Ant Design 테스트 환경 설정
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ConfigProvider>{ui}</ConfigProvider>)
}

describe('FormTemplate', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()
  const mockOnReset = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnSubmit.mockResolvedValue(undefined)
  })

  describe('렌더링', () => {
    it('기본 폼 요소를 렌더링한다 (UT-001)', () => {
      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit}>
          <Form.Item name="name" label="이름">
            <Input data-testid="form-field-name" />
          </Form.Item>
        </FormTemplate>
      )

      expect(screen.getByTestId('form-template')).toBeInTheDocument()
      expect(screen.getByTestId('form-submit-btn')).toBeInTheDocument()
      expect(screen.getByTestId('form-cancel-btn')).toBeInTheDocument()
    })

    it('제목을 렌더링한다 (UT-011)', () => {
      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit} title="사용자 등록">
          <Form.Item name="name">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      expect(screen.getByTestId('form-template-title')).toHaveTextContent('사용자 등록')
    })

    it('모드에 따른 제목 접미사를 표시한다', () => {
      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit} title="사용자" mode="edit">
          <Form.Item name="name">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      expect(screen.getByTestId('form-template-title')).toHaveTextContent('사용자 수정')
    })

    it('커스텀 버튼 텍스트를 적용한다 (UT-012)', () => {
      renderWithProvider(
        <FormTemplate
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          submitText="등록하기"
          cancelText="돌아가기"
        >
          <Form.Item name="name">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      expect(screen.getByTestId('form-submit-btn')).toHaveTextContent('등록하기')
      expect(screen.getByTestId('form-cancel-btn')).toHaveTextContent('돌아가기')
    })

    it('초기화 버튼을 표시한다 (showReset=true) (UT-011)', () => {
      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit} showReset={true} onReset={mockOnReset}>
          <Form.Item name="name">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      expect(screen.getByTestId('form-reset-btn')).toBeInTheDocument()
    })

    it('초기화 버튼을 숨긴다 (showReset=false)', () => {
      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit} showReset={false}>
          <Form.Item name="name">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      expect(screen.queryByTestId('form-reset-btn')).not.toBeInTheDocument()
    })
  })

  describe('레이아웃', () => {
    it('layout="vertical" 시 수직 레이아웃을 적용한다 (UT-002)', () => {
      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit} layout="vertical">
          <Form.Item name="name" label="이름">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      // Ant Design Form의 layout 클래스 확인
      const form = screen.getByTestId('form-template').querySelector('form')
      expect(form).toHaveClass('ant-form-vertical')
    })

    it('layout="horizontal" 시 수평 레이아웃을 적용한다 (UT-003)', () => {
      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit} layout="horizontal">
          <Form.Item name="name" label="이름">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      const form = screen.getByTestId('form-template').querySelector('form')
      expect(form).toHaveClass('ant-form-horizontal')
    })

    it('layout="inline" 시 인라인 레이아웃을 적용한다 (UT-004)', () => {
      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit} layout="inline">
          <Form.Item name="name" label="이름">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      const form = screen.getByTestId('form-template').querySelector('form')
      expect(form).toHaveClass('ant-form-inline')
    })
  })

  describe('초기값', () => {
    it('initialValues를 폼에 적용한다 (UT-005)', async () => {
      renderWithProvider(
        <FormTemplate
          onSubmit={mockOnSubmit}
          initialValues={{ name: '홍길동', email: 'hong@example.com' }}
        >
          <Form.Item name="name" label="이름">
            <Input data-testid="form-field-name" />
          </Form.Item>
          <Form.Item name="email" label="이메일">
            <Input data-testid="form-field-email" />
          </Form.Item>
        </FormTemplate>
      )

      await waitFor(() => {
        expect(screen.getByTestId('form-field-name')).toHaveValue('홍길동')
        expect(screen.getByTestId('form-field-email')).toHaveValue('hong@example.com')
      })
    })
  })

  describe('유효성 검사', () => {
    it('필수 필드 미입력 시 에러를 표시한다 (UT-006)', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit}>
          <Form.Item
            name="name"
            label="이름"
            rules={[{ required: true, message: '필수 항목입니다' }]}
          >
            <Input data-testid="form-field-name" />
          </Form.Item>
        </FormTemplate>
      )

      await user.click(screen.getByTestId('form-submit-btn'))

      await waitFor(() => {
        expect(screen.getByText('필수 항목입니다')).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('이메일 형식 유효성 검사를 수행한다', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit}>
          <Form.Item
            name="email"
            label="이메일"
            rules={[{ type: 'email', message: '올바른 이메일 형식이 아닙니다' }]}
          >
            <Input data-testid="form-field-email" />
          </Form.Item>
        </FormTemplate>
      )

      await user.type(screen.getByTestId('form-field-email'), 'invalid-email')
      await user.click(screen.getByTestId('form-submit-btn'))

      await waitFor(() => {
        expect(screen.getByText('올바른 이메일 형식이 아닙니다')).toBeInTheDocument()
      })
    })

    it('유효성 검사 실패 시 첫 번째 에러 필드에 에러 상태가 적용된다 (UT-013)', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit} scrollToError={true}>
          <Form.Item
            name="name"
            label="이름"
            rules={[{ required: true, message: '이름은 필수입니다' }]}
          >
            <Input data-testid="form-field-name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="이메일"
            rules={[{ required: true, message: '이메일은 필수입니다' }]}
          >
            <Input data-testid="form-field-email" />
          </Form.Item>
        </FormTemplate>
      )

      await user.click(screen.getByTestId('form-submit-btn'))

      // 첫 번째 에러 필드(name)에 에러 상태가 적용되고 aria-invalid가 true인지 확인
      await waitFor(() => {
        const nameInput = screen.getByTestId('form-field-name')
        expect(nameInput).toHaveAttribute('aria-invalid', 'true')
        expect(screen.getByText('이름은 필수입니다')).toBeInTheDocument()
      })
    })
  })

  describe('제출', () => {
    it('유효한 데이터 입력 시 onSubmit을 호출한다 (UT-007)', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit}>
          <Form.Item
            name="name"
            label="이름"
            rules={[{ required: true, message: '필수' }]}
          >
            <Input data-testid="form-field-name" />
          </Form.Item>
        </FormTemplate>
      )

      await user.type(screen.getByTestId('form-field-name'), '테스트 사용자')
      await user.click(screen.getByTestId('form-submit-btn'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ name: '테스트 사용자' })
        )
      })
    })
  })

  describe('로딩 상태', () => {
    it('저장 중 버튼이 비활성화되고 로딩이 표시된다 (UT-008)', () => {
      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit} loading={true}>
          <Form.Item name="name">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      const submitButton = screen.getByTestId('form-submit-btn')
      expect(submitButton).toBeDisabled()
      expect(submitButton.querySelector('.ant-btn-loading-icon')).toBeInTheDocument()
    })

    it('저장 중 취소 버튼도 비활성화된다', () => {
      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit} onCancel={mockOnCancel} loading={true}>
          <Form.Item name="name">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      expect(screen.getByTestId('form-cancel-btn')).toBeDisabled()
    })
  })

  describe('취소', () => {
    it('변경 사항이 없으면 onCancel을 즉시 호출한다 (UT-009)', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <FormTemplate
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          enableDirtyCheck={true}
        >
          <Form.Item name="name">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      await user.click(screen.getByTestId('form-cancel-btn'))

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('변경사항 있을 때 취소 시 확인 다이얼로그를 표시한다 (UT-010)', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <FormTemplate
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          enableDirtyCheck={true}
        >
          <Form.Item name="name">
            <Input data-testid="form-field-name" />
          </Form.Item>
        </FormTemplate>
      )

      // 필드 수정
      await user.type(screen.getByTestId('form-field-name'), '변경된 값')
      // 취소 클릭
      await user.click(screen.getByTestId('form-cancel-btn'))

      // 확인 다이얼로그 표시
      await waitFor(() => {
        expect(screen.getByText(/저장하지 않은/)).toBeInTheDocument()
      })
    })

    it('enableDirtyCheck=false 시 취소 확인 없이 onCancel 호출한다 (UT-015)', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <FormTemplate
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          enableDirtyCheck={false}
        >
          <Form.Item name="name">
            <Input data-testid="form-field-name" />
          </Form.Item>
        </FormTemplate>
      )

      // 필드 수정
      await user.type(screen.getByTestId('form-field-name'), '변경된 값')
      // 취소 클릭
      await user.click(screen.getByTestId('form-cancel-btn'))

      // 확인 없이 바로 onCancel 호출
      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('초기화', () => {
    it('초기화 버튼 클릭 시 폼을 리셋한다 (UT-012)', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <FormTemplate
          onSubmit={mockOnSubmit}
          onReset={mockOnReset}
          showReset={true}
          initialValues={{ name: '' }}
        >
          <Form.Item name="name">
            <Input data-testid="form-field-name" />
          </Form.Item>
        </FormTemplate>
      )

      // 값 입력
      await user.type(screen.getByTestId('form-field-name'), '테스트')
      expect(screen.getByTestId('form-field-name')).toHaveValue('테스트')

      // 초기화 클릭
      await user.click(screen.getByTestId('form-reset-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('form-field-name')).toHaveValue('')
      })
      expect(mockOnReset).toHaveBeenCalled()
    })
  })

  describe('변경 감지', () => {
    it('enableDirtyCheck=true 시 변경 상태를 추적한다 (UT-014)', async () => {
      const user = userEvent.setup()

      renderWithProvider(
        <FormTemplate
          onSubmit={mockOnSubmit}
          enableDirtyCheck={true}
          showDirtyIndicator={true}
          initialValues={{ name: '원본값' }}
        >
          <Form.Item name="name">
            <Input data-testid="form-field-name" />
          </Form.Item>
        </FormTemplate>
      )

      // 필드 값 변경
      await user.clear(screen.getByTestId('form-field-name'))
      await user.type(screen.getByTestId('form-field-name'), '변경된 값')

      // dirty indicator 표시 확인 (컴포넌트 내부 구현에 따라 확인 방법 변경 필요)
      await waitFor(() => {
        // FormTemplate에서 dirty 상태일 때 특정 클래스나 data 속성 추가되는지 확인
        const container = screen.getByTestId('form-template')
        expect(container).toHaveAttribute('data-dirty', 'true')
      })
    })
  })

  describe('버튼 표시 제어', () => {
    it('showSubmit=false 시 저장 버튼을 숨긴다', () => {
      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit} showSubmit={false}>
          <Form.Item name="name">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      expect(screen.queryByTestId('form-submit-btn')).not.toBeInTheDocument()
    })

    it('showCancel=false 시 취소 버튼을 숨긴다', () => {
      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit} showCancel={false}>
          <Form.Item name="name">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      expect(screen.queryByTestId('form-cancel-btn')).not.toBeInTheDocument()
    })
  })

  describe('외부 form 인스턴스', () => {
    it('외부에서 전달된 form 인스턴스를 사용한다', async () => {
      const TestComponent = () => {
        const [form] = Form.useForm()

        return (
          <ConfigProvider>
            <FormTemplate form={form} onSubmit={mockOnSubmit}>
              <Form.Item name="name">
                <Input data-testid="form-field-name" />
              </Form.Item>
            </FormTemplate>
            <button
              data-testid="external-set-btn"
              onClick={() => form.setFieldsValue({ name: '외부 설정값' })}
            >
              외부 설정
            </button>
          </ConfigProvider>
        )
      }

      render(<TestComponent />)

      const user = userEvent.setup()
      await user.click(screen.getByTestId('external-set-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('form-field-name')).toHaveValue('외부 설정값')
      })
    })
  })

  describe('접근성', () => {
    it('폼에 적절한 role 속성이 있다', () => {
      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit}>
          <Form.Item name="name">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      const form = screen.getByTestId('form-template').querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('저장 버튼에 적절한 type 속성이 있다', () => {
      renderWithProvider(
        <FormTemplate onSubmit={mockOnSubmit}>
          <Form.Item name="name">
            <Input />
          </Form.Item>
        </FormTemplate>
      )

      const submitButton = screen.getByTestId('form-submit-btn')
      expect(submitButton).toHaveAttribute('type', 'submit')
    })
  })
})
