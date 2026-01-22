// components/templates/DetailTemplate/__tests__/DetailTemplate.spec.tsx
// 상세 화면 템플릿 단위 테스트 (TSK-06-02)

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { App, ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'
import {
  DetailTemplate,
  DetailHeader,
  DetailDescriptions,
  DetailTabs,
  DetailFooter,
  DetailError,
  DetailSkeleton,
} from '../index'
import type { DetailTemplateProps, DetailTabItem, DetailErrorState } from '../types'

// App 컨텍스트를 제공하는 래퍼
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider locale={koKR}>
    <App>{children}</App>
  </ConfigProvider>
)

// 기본 테스트 Props
const defaultProps: DetailTemplateProps = {
  title: '사용자 상세',
  descriptions: {
    items: [
      { key: 'name', label: '이름', children: '홍길동' },
      { key: 'email', label: '이메일', children: 'hong@test.com' },
      { key: 'department', label: '부서', children: '개발팀' },
      { key: 'status', label: '상태', children: '활성' },
    ],
  },
}

// 탭 데이터
const mockTabs: DetailTabItem[] = [
  { key: 'info', label: '기본 정보', children: <div>기본 정보 내용</div> },
  { key: 'history', label: '활동 이력', children: <div>활동 이력 내용</div> },
  { key: 'permissions', label: '권한', children: <div>권한 내용</div> },
]

describe('DetailTemplate', () => {
  describe('rendering', () => {
    it('should render title and descriptions correctly (UT-001)', () => {
      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('사용자 상세')).toBeInTheDocument()
      expect(screen.getByText('이름')).toBeInTheDocument()
      expect(screen.getByText('홍길동')).toBeInTheDocument()
      expect(screen.getByText('이메일')).toBeInTheDocument()
      expect(screen.getByText('hong@test.com')).toBeInTheDocument()
      expect(screen.getByTestId('detail-template-container')).toBeInTheDocument()
      expect(screen.getByTestId('detail-descriptions')).toBeInTheDocument()
    })

    it('should render subtitle when provided', () => {
      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} subtitle="USR-001" />
        </TestWrapper>
      )

      expect(screen.getByText('USR-001')).toBeInTheDocument()
    })

    it('should render custom descriptions title', () => {
      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} descriptionsTitle="상세 정보" />
        </TestWrapper>
      )

      expect(screen.getByText('상세 정보')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should display skeleton when loading (UT-002)', () => {
      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} loading={true} />
        </TestWrapper>
      )

      expect(screen.getByTestId('detail-loading')).toBeInTheDocument()
      expect(screen.queryByTestId('detail-descriptions')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('should display 404 error message (UT-003)', () => {
      const error: DetailErrorState = {
        status: 404,
        message: '항목을 찾을 수 없습니다',
      }

      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} error={error} />
        </TestWrapper>
      )

      expect(screen.getByTestId('detail-error')).toBeInTheDocument()
      expect(screen.getByText(/찾을 수 없습니다/)).toBeInTheDocument()
    })

    it('should display 403 error message', () => {
      const error: DetailErrorState = {
        status: 403,
      }

      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} error={error} />
        </TestWrapper>
      )

      expect(screen.getByText(/접근 권한이 없습니다/)).toBeInTheDocument()
    })

    it('should display 500 error message with retry button', () => {
      const error: DetailErrorState = {
        status: 500,
      }

      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} error={error} />
        </TestWrapper>
      )

      expect(screen.getByText(/데이터를 불러올 수 없습니다/)).toBeInTheDocument()
    })

    it('should display back button in error state', () => {
      const onBack = vi.fn()
      const error: DetailErrorState = { status: 404 }

      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} error={error} onBack={onBack} />
        </TestWrapper>
      )

      const backButton = screen.getByRole('button', { name: /목록으로 이동/i })
      fireEvent.click(backButton)
      expect(onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('tabs', () => {
    it('should render tabs and switch content on tab click (UT-004)', async () => {
      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} tabs={mockTabs} />
        </TestWrapper>
      )

      // 탭 영역 확인
      expect(screen.getByTestId('detail-tabs')).toBeInTheDocument()
      expect(screen.getByText('기본 정보 내용')).toBeInTheDocument()

      // 두 번째 탭 클릭
      fireEvent.click(screen.getByTestId('detail-tab-history'))

      await waitFor(() => {
        expect(screen.getByText('활동 이력 내용')).toBeVisible()
      })

      // 세 번째 탭 클릭
      fireEvent.click(screen.getByTestId('detail-tab-permissions'))

      await waitFor(() => {
        expect(screen.getByText('권한 내용')).toBeVisible()
      })
    })

    it('should call onTabChange when tab is switched', async () => {
      const onTabChange = vi.fn()

      render(
        <TestWrapper>
          <DetailTemplate
            {...defaultProps}
            tabs={mockTabs}
            onTabChange={onTabChange}
          />
        </TestWrapper>
      )

      fireEvent.click(screen.getByTestId('detail-tab-history'))

      await waitFor(() => {
        expect(onTabChange).toHaveBeenCalledWith('history')
      })
    })

    it('should render default active tab', () => {
      render(
        <TestWrapper>
          <DetailTemplate
            {...defaultProps}
            tabs={mockTabs}
            defaultActiveTab="permissions"
          />
        </TestWrapper>
      )

      expect(screen.getByText('권한 내용')).toBeVisible()
    })

    it('should not render tabs when not provided', () => {
      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.queryByTestId('detail-tabs')).not.toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('should call onEdit when edit button clicked (UT-005)', () => {
      const onEdit = vi.fn()

      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} onEdit={onEdit} />
        </TestWrapper>
      )

      const editButton = screen.getByTestId('detail-edit-btn')
      expect(editButton).toBeInTheDocument()

      fireEvent.click(editButton)
      expect(onEdit).toHaveBeenCalledTimes(1)
    })

    it('should show confirm dialog and call onDelete when confirmed (UT-006)', async () => {
      const onDelete = vi.fn().mockResolvedValue(undefined)

      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} onDelete={onDelete} />
        </TestWrapper>
      )

      const deleteButton = screen.getByTestId('detail-delete-btn')
      fireEvent.click(deleteButton)

      // 확인 다이얼로그 표시 확인
      await waitFor(() => {
        expect(screen.getByText(/정말 삭제하시겠습니까/)).toBeInTheDocument()
      })

      // 모달 내부의 확인 버튼 클릭 (모달 내부에서 찾기)
      const modal = document.querySelector('.ant-modal-confirm')
      const confirmButton = modal?.querySelector('.ant-btn-dangerous') as HTMLElement
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledTimes(1)
      })
    })

    it('should not call onDelete when cancelled', async () => {
      const onDelete = vi.fn()

      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} onDelete={onDelete} />
        </TestWrapper>
      )

      fireEvent.click(screen.getByTestId('detail-delete-btn'))

      await waitFor(() => {
        expect(screen.getByText(/정말 삭제하시겠습니까/)).toBeInTheDocument()
      })

      // 모달 내부의 취소 버튼 클릭
      const modal = document.querySelector('.ant-modal-confirm')
      const cancelButton = modal?.querySelector('.ant-btn:not(.ant-btn-dangerous)') as HTMLElement
      fireEvent.click(cancelButton)

      expect(onDelete).not.toHaveBeenCalled()
    })

    it('should use custom delete confirm message', async () => {
      const onDelete = vi.fn()

      render(
        <TestWrapper>
          <DetailTemplate
            {...defaultProps}
            onDelete={onDelete}
            deleteConfirmMessage="홍길동 사용자를 삭제하시겠습니까?"
            deleteConfirmTitle="사용자 삭제"
          />
        </TestWrapper>
      )

      fireEvent.click(screen.getByTestId('detail-delete-btn'))

      await waitFor(() => {
        expect(screen.getByText('홍길동 사용자를 삭제하시겠습니까?')).toBeInTheDocument()
      })

      // Modal.confirm의 title은 ant-modal-confirm-title 클래스 내부에 렌더링됨
      const titleElement = document.querySelector('.ant-modal-confirm-title')
      expect(titleElement?.textContent).toBe('사용자 삭제')
    })

    it('should call onBack when back button clicked (UT-007)', () => {
      const onBack = vi.fn()

      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} onBack={onBack} />
        </TestWrapper>
      )

      const backButton = screen.getByRole('button', { name: /목록으로/i })
      fireEvent.click(backButton)

      expect(onBack).toHaveBeenCalledTimes(1)
    })

    it('should not show buttons when handlers not provided', () => {
      render(
        <TestWrapper>
          <DetailTemplate {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.queryByTestId('detail-edit-btn')).not.toBeInTheDocument()
      expect(screen.queryByTestId('detail-delete-btn')).not.toBeInTheDocument()
    })
  })

  describe('permissions (UT-008)', () => {
    it('should hide edit button when canEdit is false', () => {
      render(
        <TestWrapper>
          <DetailTemplate
            {...defaultProps}
            onEdit={vi.fn()}
            permissions={{ canEdit: false }}
          />
        </TestWrapper>
      )

      expect(screen.queryByTestId('detail-edit-btn')).not.toBeInTheDocument()
    })

    it('should hide delete button when canDelete is false', () => {
      render(
        <TestWrapper>
          <DetailTemplate
            {...defaultProps}
            onDelete={vi.fn()}
            permissions={{ canDelete: false }}
          />
        </TestWrapper>
      )

      expect(screen.queryByTestId('detail-delete-btn')).not.toBeInTheDocument()
    })

    it('should show buttons by default when permissions not specified', () => {
      render(
        <TestWrapper>
          <DetailTemplate
            {...defaultProps}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByTestId('detail-edit-btn')).toBeInTheDocument()
      expect(screen.getByTestId('detail-delete-btn')).toBeInTheDocument()
    })

    it('should show buttons when permissions are true', () => {
      render(
        <TestWrapper>
          <DetailTemplate
            {...defaultProps}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
            permissions={{ canEdit: true, canDelete: true }}
          />
        </TestWrapper>
      )

      expect(screen.getByTestId('detail-edit-btn')).toBeInTheDocument()
      expect(screen.getByTestId('detail-delete-btn')).toBeInTheDocument()
    })
  })

  describe('extra content', () => {
    it('should render extra content in header', () => {
      render(
        <TestWrapper>
          <DetailTemplate
            {...defaultProps}
            extra={<button data-testid="custom-btn">커스텀 버튼</button>}
          />
        </TestWrapper>
      )

      expect(screen.getByTestId('custom-btn')).toBeInTheDocument()
    })
  })
})

describe('DetailHeader', () => {
  it('should render title', () => {
    render(<DetailHeader title="테스트 제목" />)
    expect(screen.getByText('테스트 제목')).toBeInTheDocument()
  })

  it('should render loading skeleton', () => {
    render(<DetailHeader title="테스트" loading={true} />)
    expect(screen.getByTestId('detail-header')).toBeInTheDocument()
  })
})

describe('DetailDescriptions', () => {
  it('should render descriptions', () => {
    render(
      <DetailDescriptions
        descriptionsProps={{
          items: [
            { key: 'test', label: '테스트', children: '값' },
          ],
        }}
      />
    )
    expect(screen.getByText('테스트')).toBeInTheDocument()
    expect(screen.getByText('값')).toBeInTheDocument()
  })

  it('should render loading skeleton', () => {
    render(
      <DetailDescriptions
        descriptionsProps={{ items: [] }}
        loading={true}
      />
    )
    expect(screen.getByTestId('detail-descriptions-card')).toBeInTheDocument()
  })
})

describe('DetailTabs', () => {
  it('should render tabs', () => {
    render(
      <DetailTabs
        tabs={[
          { key: 'tab1', label: '탭1', children: <div>내용1</div> },
          { key: 'tab2', label: '탭2', children: <div>내용2</div> },
        ]}
      />
    )
    expect(screen.getByTestId('detail-tabs')).toBeInTheDocument()
    expect(screen.getByText('탭1')).toBeInTheDocument()
    expect(screen.getByText('탭2')).toBeInTheDocument()
  })

  it('should render badge when provided', () => {
    render(
      <DetailTabs
        tabs={[
          { key: 'tab1', label: '알림', badge: 5, children: <div>내용</div> },
        ]}
      />
    )
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should return null when tabs is empty', () => {
    const { container } = render(<DetailTabs tabs={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render loading skeleton', () => {
    render(<DetailTabs tabs={mockTabs} loading={true} />)
    expect(screen.getByTestId('detail-tabs-card')).toBeInTheDocument()
  })
})

describe('DetailFooter', () => {
  it('should render back button', () => {
    const onBack = vi.fn()
    render(<DetailFooter onBack={onBack} />)

    const backButton = screen.getByTestId('detail-back-btn')
    fireEvent.click(backButton)
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('should render extra content', () => {
    render(<DetailFooter extra={<span>추가 버튼</span>} />)
    expect(screen.getByText('추가 버튼')).toBeInTheDocument()
  })

  it('should return null when no props provided', () => {
    const { container } = render(<DetailFooter />)
    expect(container.firstChild).toBeNull()
  })
})

describe('DetailError', () => {
  it('should render 404 error', () => {
    render(<DetailError error={{ status: 404 }} />)
    expect(screen.getByText(/찾을 수 없습니다/)).toBeInTheDocument()
  })

  it('should render 403 error', () => {
    render(<DetailError error={{ status: 403 }} />)
    expect(screen.getByText(/접근 권한이 없습니다/)).toBeInTheDocument()
  })

  it('should render 500 error', () => {
    render(<DetailError error={{ status: 500 }} />)
    expect(screen.getByText(/데이터를 불러올 수 없습니다/)).toBeInTheDocument()
  })

  it('should render network error', () => {
    render(<DetailError error={{ status: 'error' }} />)
    expect(screen.getByText(/연결 상태를 확인해주세요/)).toBeInTheDocument()
  })

  it('should show retry button for 500 error', () => {
    const onRetry = vi.fn()
    render(<DetailError error={{ status: 500 }} onRetry={onRetry} />)

    const retryButton = screen.getByRole('button', { name: /다시 시도/i })
    fireEvent.click(retryButton)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('should use custom error message', () => {
    render(
      <DetailError
        error={{ status: 404, title: '커스텀 제목', message: '커스텀 메시지' }}
      />
    )
    expect(screen.getByText('커스텀 제목')).toBeInTheDocument()
    expect(screen.getByText('커스텀 메시지')).toBeInTheDocument()
  })
})

describe('DetailSkeleton', () => {
  it('should render skeleton', () => {
    render(<DetailSkeleton />)
    expect(screen.getByTestId('detail-loading')).toBeInTheDocument()
  })

  it('should render tabs skeleton when showTabs is true', () => {
    render(<DetailSkeleton showTabs={true} tabCount={3} />)
    expect(screen.getByTestId('detail-loading')).toBeInTheDocument()
  })

  it('should not render tabs skeleton when showTabs is false', () => {
    const { container } = render(<DetailSkeleton showTabs={false} />)
    // 탭 스켈레톤이 3개 미만이어야 함
    const cards = container.querySelectorAll('.ant-card')
    expect(cards.length).toBeLessThan(3)
  })
})
