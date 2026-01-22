/**
 * useFavorites 훅 단위 테스트
 * @see TSK-03-04 설계문서 026-test-specification.md
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { useFavorites } from '../useFavorites'
import { FAVORITES_CONFIG } from '@/lib/types/favorites'

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// 테스트용 메뉴 데이터
const mockMenuTree = [
  {
    id: 101,
    code: 'DASHBOARD',
    name: '대시보드',
    path: '/portal/dashboard',
    icon: 'DashboardOutlined',
    sortOrder: 1,
    children: [],
  },
  {
    id: 200,
    code: 'PRODUCTION',
    name: '생산관리',
    path: null,
    icon: 'SettingOutlined',
    sortOrder: 2,
    children: [
      {
        id: 201,
        code: 'WORK_ORDER',
        name: '작업지시조회',
        path: '/portal/production/work-order',
        icon: 'FileTextOutlined',
        sortOrder: 1,
        children: [],
      },
      {
        id: 202,
        code: 'PRODUCTION_RESULT',
        name: '생산실적입력',
        path: '/portal/production/result',
        icon: 'EditOutlined',
        sortOrder: 2,
        children: [],
      },
    ],
  },
  {
    id: 300,
    code: 'QUALITY',
    name: '품질관리',
    path: null,
    icon: 'SafetyCertificateOutlined',
    sortOrder: 3,
    children: [
      {
        id: 301,
        code: 'QUALITY_CHECK',
        name: '품질검사',
        path: '/portal/quality/check',
        icon: 'CheckCircleOutlined',
        sortOrder: 1,
        children: [],
      },
    ],
  },
]

describe('useFavorites', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    // UT-006: localStorage에서 데이터 로드
    it('localStorage에서 기존 즐겨찾기 데이터를 로드한다', () => {
      // Given: localStorage에 기존 데이터가 있는 경우
      localStorageMock.setItem(
        `${FAVORITES_CONFIG.STORAGE_KEY_PREFIX}1`,
        JSON.stringify({
          userId: 1,
          menuIds: [101, 201, 202],
          updatedAt: new Date().toISOString(),
        })
      )

      // When: 훅을 마운트
      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      // Then: 저장된 즐겨찾기 로드됨
      expect(result.current.favoriteIds).toEqual([101, 201, 202])
    })

    it('localStorage 데이터가 손상된 경우 빈 배열로 초기화한다', () => {
      // Given: 손상된 데이터
      localStorageMock.setItem(
        `${FAVORITES_CONFIG.STORAGE_KEY_PREFIX}1`,
        'invalid-json'
      )

      // When: 훅을 마운트
      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      // Then: 빈 배열로 초기화
      expect(result.current.favoriteIds).toEqual([])
    })

    it('localStorage에 데이터가 없으면 빈 배열로 초기화한다', () => {
      // When: 훅을 마운트
      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      // Then: 빈 배열
      expect(result.current.favoriteIds).toEqual([])
    })
  })

  describe('addFavorite', () => {
    // UT-001: 즐겨찾기 추가 (정상)
    it('메뉴를 즐겨찾기에 추가한다', async () => {
      // Given: 빈 즐겨찾기 상태
      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      // When: 즐겨찾기 추가
      act(() => {
        result.current.addFavorite(101)
      })

      // Then: 추가 확인
      await waitFor(() => {
        expect(result.current.favoriteIds).toContain(101)
      })
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    // BR-002: 중복 방지
    it('이미 추가된 메뉴는 중복 추가되지 않는다', async () => {
      // Given: 이미 101이 추가된 상태
      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      act(() => {
        result.current.addFavorite(101)
      })

      await waitFor(() => {
        expect(result.current.favoriteIds).toContain(101)
      })

      // When: 중복 추가 시도
      act(() => {
        result.current.addFavorite(101)
      })

      // Then: 중복 없이 1개만 존재
      await waitFor(() => {
        expect(result.current.favoriteIds.filter((id) => id === 101)).toHaveLength(1)
      })
    })

    // UT-002: 최대 개수 제한 초과
    it('최대 20개 초과 시 추가를 거부한다', async () => {
      // Given: 20개 즐겨찾기 존재 (유효한 메뉴 ID 사용)
      // mockMenuTree에 있는 유효한 leaf 메뉴: 101, 201, 202, 301
      // 20개를 채우기 위해 메뉴 데이터를 확장하여 테스트
      const extendedMenuTree = [
        ...mockMenuTree,
        ...Array.from({ length: 20 }, (_, i) => ({
          id: 1000 + i,
          code: `TEST_MENU_${i}`,
          name: `테스트 메뉴 ${i}`,
          path: `/portal/test/${i}`,
          icon: 'FileTextOutlined',
          sortOrder: 100 + i,
          children: [],
        })),
      ]
      const maxMenuIds = Array.from({ length: 20 }, (_, i) => 1000 + i)
      localStorageMock.setItem(
        `${FAVORITES_CONFIG.STORAGE_KEY_PREFIX}1`,
        JSON.stringify({
          userId: 1,
          menuIds: maxMenuIds,
          updatedAt: new Date().toISOString(),
        })
      )

      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: extendedMenuTree })
      )

      // When: 21번째 추가 시도
      act(() => {
        result.current.addFavorite(101) // 기존 mockMenuTree의 유효한 ID
      })

      // Then: 추가 거부
      await waitFor(() => {
        expect(result.current.favoriteIds).toHaveLength(20)
        expect(result.current.favoriteIds).not.toContain(101)
      })
    })

    it('유효하지 않은 메뉴 ID는 추가되지 않는다', async () => {
      // Given: 빈 즐겨찾기 상태
      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      // When: 존재하지 않는 메뉴 ID 추가 시도
      act(() => {
        result.current.addFavorite(9999)
      })

      // Then: 추가 안됨
      await waitFor(() => {
        expect(result.current.favoriteIds).not.toContain(9999)
      })
    })
  })

  describe('removeFavorite', () => {
    // UT-003: 즐겨찾기 제거
    it('즐겨찾기에서 메뉴를 제거한다', async () => {
      // Given: 즐겨찾기가 있는 상태
      localStorageMock.setItem(
        `${FAVORITES_CONFIG.STORAGE_KEY_PREFIX}1`,
        JSON.stringify({
          userId: 1,
          menuIds: [101, 201, 202],
          updatedAt: new Date().toISOString(),
        })
      )

      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      // When: 101 제거
      act(() => {
        result.current.removeFavorite(101)
      })

      // Then: 제거 확인
      await waitFor(() => {
        expect(result.current.favoriteIds).not.toContain(101)
        expect(result.current.favoriteIds).toContain(201)
        expect(result.current.favoriteIds).toContain(202)
      })
    })

    it('존재하지 않는 메뉴 제거 시 상태 변경 없음', async () => {
      // Given: 즐겨찾기가 있는 상태
      localStorageMock.setItem(
        `${FAVORITES_CONFIG.STORAGE_KEY_PREFIX}1`,
        JSON.stringify({
          userId: 1,
          menuIds: [101, 201],
          updatedAt: new Date().toISOString(),
        })
      )

      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      const initialLength = result.current.favoriteIds.length

      // When: 존재하지 않는 ID 제거 시도
      act(() => {
        result.current.removeFavorite(9999)
      })

      // Then: 상태 변경 없음
      await waitFor(() => {
        expect(result.current.favoriteIds).toHaveLength(initialLength)
      })
    })
  })

  describe('toggleFavorite', () => {
    it('즐겨찾기 상태를 토글한다 (추가)', async () => {
      // Given: 빈 즐겨찾기 상태
      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      // When: 토글 (추가)
      act(() => {
        result.current.toggleFavorite(101)
      })

      // Then: 추가됨
      await waitFor(() => {
        expect(result.current.favoriteIds).toContain(101)
      })
    })

    it('즐겨찾기 상태를 토글한다 (제거)', async () => {
      // Given: 즐겨찾기가 있는 상태
      localStorageMock.setItem(
        `${FAVORITES_CONFIG.STORAGE_KEY_PREFIX}1`,
        JSON.stringify({
          userId: 1,
          menuIds: [101],
          updatedAt: new Date().toISOString(),
        })
      )

      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      // When: 토글 (제거)
      act(() => {
        result.current.toggleFavorite(101)
      })

      // Then: 제거됨
      await waitFor(() => {
        expect(result.current.favoriteIds).not.toContain(101)
      })
    })
  })

  describe('isFavorite', () => {
    // UT-005: 즐겨찾기 여부 확인
    it('즐겨찾기된 메뉴는 true를 반환한다', async () => {
      // Given: 즐겨찾기가 있는 상태
      localStorageMock.setItem(
        `${FAVORITES_CONFIG.STORAGE_KEY_PREFIX}1`,
        JSON.stringify({
          userId: 1,
          menuIds: [101],
          updatedAt: new Date().toISOString(),
        })
      )

      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      // Then: true 반환
      expect(result.current.isFavorite(101)).toBe(true)
    })

    it('즐겨찾기 안된 메뉴는 false를 반환한다', () => {
      // Given: 빈 즐겨찾기 상태
      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      // Then: false 반환
      expect(result.current.isFavorite(999)).toBe(false)
    })
  })

  describe('canAddFavorite', () => {
    it('20개 미만이면 true를 반환한다', () => {
      // Given: 즐겨찾기가 19개인 상태
      const menuIds = Array.from({ length: 19 }, (_, i) => i + 1)
      localStorageMock.setItem(
        `${FAVORITES_CONFIG.STORAGE_KEY_PREFIX}1`,
        JSON.stringify({
          userId: 1,
          menuIds,
          updatedAt: new Date().toISOString(),
        })
      )

      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      // Then: true 반환
      expect(result.current.canAddFavorite()).toBe(true)
    })

    it('20개면 false를 반환한다', () => {
      // Given: 즐겨찾기가 20개인 상태 (유효한 메뉴 ID 사용)
      const extendedMenuTree = [
        ...mockMenuTree,
        ...Array.from({ length: 20 }, (_, i) => ({
          id: 1000 + i,
          code: `TEST_MENU_${i}`,
          name: `테스트 메뉴 ${i}`,
          path: `/portal/test/${i}`,
          icon: 'FileTextOutlined',
          sortOrder: 100 + i,
          children: [],
        })),
      ]
      const menuIds = Array.from({ length: 20 }, (_, i) => 1000 + i)
      localStorageMock.setItem(
        `${FAVORITES_CONFIG.STORAGE_KEY_PREFIX}1`,
        JSON.stringify({
          userId: 1,
          menuIds,
          updatedAt: new Date().toISOString(),
        })
      )

      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: extendedMenuTree })
      )

      // Then: false 반환
      expect(result.current.canAddFavorite()).toBe(false)
    })
  })

  describe('favoriteMenus', () => {
    // UT-004: 추가 순서대로 목록 반환
    it('즐겨찾기 메뉴 목록을 추가 순서대로 반환한다', async () => {
      // Given: 즐겨찾기가 있는 상태
      localStorageMock.setItem(
        `${FAVORITES_CONFIG.STORAGE_KEY_PREFIX}1`,
        JSON.stringify({
          userId: 1,
          menuIds: [201, 101, 301], // 추가 순서
          updatedAt: new Date().toISOString(),
        })
      )

      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      // Then: 추가 순서대로 반환
      await waitFor(() => {
        const menuIds = result.current.favoriteMenus.map((m) => m.id)
        expect(menuIds).toEqual([201, 101, 301])
      })
    })

    it('유효하지 않은 메뉴 ID는 목록에서 제외된다', async () => {
      // Given: 일부 무효한 ID가 포함된 상태
      localStorageMock.setItem(
        `${FAVORITES_CONFIG.STORAGE_KEY_PREFIX}1`,
        JSON.stringify({
          userId: 1,
          menuIds: [101, 9999, 201], // 9999는 무효
          updatedAt: new Date().toISOString(),
        })
      )

      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      // Then: 유효한 메뉴만 반환
      await waitFor(() => {
        const menuIds = result.current.favoriteMenus.map((m) => m.id)
        expect(menuIds).not.toContain(9999)
        expect(menuIds).toContain(101)
        expect(menuIds).toContain(201)
      })
    })

    it('폴더 메뉴(path가 null)는 목록에 포함되지 않는다', async () => {
      // Given: 폴더 메뉴 ID가 포함된 상태
      localStorageMock.setItem(
        `${FAVORITES_CONFIG.STORAGE_KEY_PREFIX}1`,
        JSON.stringify({
          userId: 1,
          menuIds: [200, 101], // 200은 폴더 메뉴
          updatedAt: new Date().toISOString(),
        })
      )

      const { result } = renderHook(() =>
        useFavorites({ userId: 1, allMenus: mockMenuTree })
      )

      // Then: 폴더 메뉴 제외, 화면 메뉴만 포함
      await waitFor(() => {
        const menuIds = result.current.favoriteMenus.map((m) => m.id)
        expect(menuIds).not.toContain(200)
        expect(menuIds).toContain(101)
      })
    })
  })
})
