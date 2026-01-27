import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PermissionsPage from '../page'

const mockMenus = {
  success: true,
  data: [
    { id: 1, name: '생산실적', category: '조업관리/생산실적', sortOrder: 1 },
    { id: 2, name: '품질검사', category: '조업관리/품질검사', sortOrder: 2 },
    { id: 3, name: '사용자관리', category: '시스템관리/사용자관리', sortOrder: 3 },
  ],
}

const mockPermissions = {
  success: true,
  data: [
    {
      id: 10,
      permissionCd: 'PROD_RESULT_VIEW',
      name: '생산실적 조회',
      description: '생산실적 조회 권한',
      isActive: true,
      config: JSON.stringify({ actions: ['READ'], fieldConstraints: {} }),
      menuId: 1,
    },
    {
      id: 11,
      permissionCd: 'PROD_RESULT_EDIT',
      name: '생산실적 수정',
      description: '생산실적 수정 권한',
      isActive: true,
      config: JSON.stringify({ actions: ['CREATE', 'UPDATE', 'DELETE'], fieldConstraints: { PROC_CD: ['2CGL', '3CGL'] } }),
      menuId: 1,
    },
  ],
  pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
}

const mockPermissionDetail = {
  success: true,
  data: {
    id: 10,
    permissionCd: 'PROD_RESULT_VIEW',
    name: '생산실적 조회',
    description: '생산실적 조회 권한',
    isActive: true,
    config: JSON.stringify({ actions: ['READ'], fieldConstraints: {} }),
    menuId: 1,
    roles: [
      { id: 1, name: '관리자', code: 'ADMIN' },
    ],
  },
}

function setupFetchMock() {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url === '/api/menus') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMenus) })
    }
    if (url.match(/\/api\/menus\/\d+\/permissions/)) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPermissions) })
    }
    if (url.match(/\/api\/permissions\/\d+$/) && !url.includes('DELETE')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPermissionDetail) })
    }
    if (url === '/api/permissions') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: { id: 99 } }) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
  })
}

describe('PermissionsPage', () => {
  beforeEach(() => {
    setupFetchMock()
  })

  it('페이지 타이틀 "권한 정의 관리"를 렌더링한다', async () => {
    render(<PermissionsPage />)
    await waitFor(() => {
      expect(screen.getByText('권한 정의 관리')).toBeInTheDocument()
    })
  })

  it('좌측에 메뉴 트리를 표시한다', async () => {
    render(<PermissionsPage />)
    await waitFor(() => {
      expect(screen.getByText('메뉴 트리')).toBeInTheDocument()
    })
    // 카테고리 폴더 노드
    await waitFor(() => {
      expect(screen.getByText('조업관리')).toBeInTheDocument()
    })
  })

  it('메뉴 선택 시 우측에 권한 테이블을 표시한다', async () => {
    const user = userEvent.setup()
    render(<PermissionsPage />)

    // 트리가 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('조업관리')).toBeInTheDocument()
    })

    // 트리 노드 클릭 (생산실적)
    const menuNode = screen.getByText('생산실적')
    await user.click(menuNode)

    await waitFor(() => {
      expect(screen.getByText('PROD_RESULT_VIEW')).toBeInTheDocument()
      expect(screen.getByText('생산실적 조회')).toBeInTheDocument()
    })
  })

  it('권한 등록 모달을 열면 Actions 체크박스가 표시된다', async () => {
    const user = userEvent.setup()
    render(<PermissionsPage />)

    await waitFor(() => {
      expect(screen.getByText('조업관리')).toBeInTheDocument()
    })

    // 메뉴 선택
    await user.click(screen.getByText('생산실적'))

    await waitFor(() => {
      expect(screen.getByText('PROD_RESULT_VIEW')).toBeInTheDocument()
    })

    // 권한 등록 버튼 클릭
    const addBtn = screen.getByRole('button', { name: /권한 등록/ })
    await user.click(addBtn)

    await waitFor(() => {
      // Actions 체크박스가 모달 내에 표시되는지 확인 (테이블 태그와 중복 가능)
      expect(screen.getAllByText('CREATE').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('READ').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('UPDATE').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('DELETE').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('EXPORT')).toBeInTheDocument()
      expect(screen.getByText('IMPORT')).toBeInTheDocument()
    })
  })

  it('필드 제약조건 동적 편집기가 동작한다 (추가/삭제)', async () => {
    const user = userEvent.setup()
    render(<PermissionsPage />)

    await waitFor(() => {
      expect(screen.getByText('조업관리')).toBeInTheDocument()
    })

    await user.click(screen.getByText('생산실적'))

    await waitFor(() => {
      expect(screen.getByText('PROD_RESULT_VIEW')).toBeInTheDocument()
    })

    // 권한 등록 모달 열기
    await user.click(screen.getByRole('button', { name: /권한 등록/ }))

    await waitFor(() => {
      expect(screen.getByText('필드 제약조건')).toBeInTheDocument()
    })

    // 필드 추가 버튼 클릭
    const addFieldBtn = screen.getByRole('button', { name: /필드 추가/ })
    await user.click(addFieldBtn)

    // 필드명 입력란이 생겼는지 확인
    await waitFor(() => {
      const fieldInputs = screen.getAllByPlaceholderText('필드명')
      expect(fieldInputs.length).toBeGreaterThanOrEqual(1)
    })

    // 삭제 버튼 클릭
    const removeButtons = screen.getAllByLabelText('delete-constraint')
    await user.click(removeButtons[0])

    // 필드가 제거됨
    await waitFor(() => {
      const fieldInputs = screen.queryAllByPlaceholderText('필드명')
      expect(fieldInputs).toHaveLength(0)
    })
  })
})
