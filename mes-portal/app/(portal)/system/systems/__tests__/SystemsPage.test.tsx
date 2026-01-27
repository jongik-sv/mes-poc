import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import SystemsPage from '../page'

const mockSystems = {
  success: true,
  data: {
    items: [
      {
        id: 1,
        systemId: 'SYS001',
        name: '테스트 시스템',
        domain: 'test.example.com',
        description: '테스트용 시스템',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        systemId: 'SYS002',
        name: '비활성 시스템',
        domain: 'inactive.example.com',
        description: null,
        isActive: false,
        createdAt: '2024-01-02T00:00:00Z',
      },
    ],
    total: 2,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
}

const emptyResponse = {
  success: true,
  data: { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 },
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockSystems),
    })
  )
})

describe('SystemsPage', () => {
  it('페이지 타이틀 "시스템 관리"를 렌더링한다', async () => {
    render(<SystemsPage />)
    expect(screen.getByText('시스템 관리')).toBeInTheDocument()
  })

  it('로딩 상태를 표시한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(new Promise(() => {})) // never resolves
    )
    render(<SystemsPage />)
    await waitFor(() => {
      expect(document.querySelector('[class*="ant-spin"]')).toBeTruthy()
    })
  })

  it('테이블에 시스템 목록을 렌더링한다', async () => {
    render(<SystemsPage />)
    await waitFor(() => {
      expect(screen.getByText('테스트 시스템')).toBeInTheDocument()
      expect(screen.getByText('SYS001')).toBeInTheDocument()
      expect(screen.getByText('test.example.com')).toBeInTheDocument()
      expect(screen.getByText('비활성 시스템')).toBeInTheDocument()
    })
  })

  it('등록 버튼 클릭 시 생성 모달을 연다', async () => {
    render(<SystemsPage />)
    await waitFor(() => {
      expect(screen.getByText('테스트 시스템')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('시스템 등록'))

    await waitFor(() => {
      expect(screen.getByText('시스템 등록', { selector: '.ant-modal-title' })).toBeInTheDocument()
    })
  })

  it('수정 버튼 클릭 시 수정 모달을 연다', async () => {
    render(<SystemsPage />)
    await waitFor(() => {
      expect(screen.getByText('테스트 시스템')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByText('수정')
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText('시스템 수정')).toBeInTheDocument()
    })
  })

  it('삭제 확인 팝업을 처리한다', async () => {
    render(<SystemsPage />)
    await waitFor(() => {
      expect(screen.getByText('테스트 시스템')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('삭제')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByText('이 시스템을 삭제하시겠습니까?')).toBeInTheDocument()
    })
  })
})
