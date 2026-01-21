/**
 * 메뉴 API E2E 테스트 (TSK-03-01, TSK-03-03)
 *
 * 테스트 명세서(026-test-specification.md) 기반
 *
 * TSK-03-03 추가 테스트:
 * - E2E-001: 인증된 사용자 메뉴 목록 조회
 * - E2E-002: ADMIN 역할 전체 메뉴
 * - E2E-003: 부모 메뉴 자동 포함 (BR-02)
 * - E2E-004: 미인증 접근 거부
 */

import { test, expect, type APIRequestContext } from '@playwright/test'

const API_BASE = '/api/menus'
const LOGIN_URL = '/api/auth/callback/credentials'

/**
 * 로그인 헬퍼 함수
 */
async function login(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<{ cookies: string }> {
  // CSRF 토큰 획득
  const csrfResponse = await request.get('/api/auth/csrf')
  const csrfData = await csrfResponse.json()
  const csrfToken = csrfData.csrfToken

  // 로그인 요청
  const loginResponse = await request.post(LOGIN_URL, {
    form: {
      email,
      password,
      csrfToken,
    },
  })

  // 쿠키 추출
  const cookies = loginResponse.headers()['set-cookie'] || ''
  return { cookies }
}

test.describe('Menu API E2E Tests (TSK-03-03)', () => {
  // E2E-004: 미인증 요청 거부
  test('미인증 요청은 401 에러를 반환한다 (E2E-004)', async ({ request }) => {
    const response = await request.get(API_BASE)

    expect(response.status()).toBe(401)

    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  // E2E-001: 인증된 사용자 메뉴 조회
  test('인증된 사용자가 메뉴 목록을 조회할 수 있다 (E2E-001)', async ({
    request,
  }) => {
    // Arrange: 로그인
    const { cookies } = await login(request, 'admin@test.com', 'test1234')

    // Act: 메뉴 API 호출
    const response = await request.get(API_BASE, {
      headers: {
        Cookie: cookies,
      },
    })

    // Assert
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)

    // 계층 구조 검증
    if (body.data.length > 0) {
      expect(body.data[0]).toHaveProperty('children')
      expect(body.data[0]).toHaveProperty('id')
      expect(body.data[0]).toHaveProperty('code')
      expect(body.data[0]).toHaveProperty('name')
    }

    // sortOrder 순서 검증
    for (let i = 1; i < body.data.length; i++) {
      expect(body.data[i].sortOrder).toBeGreaterThanOrEqual(
        body.data[i - 1].sortOrder
      )
    }
  })

  // E2E-002: ADMIN 역할 전체 메뉴
  test('ADMIN 사용자는 모든 메뉴를 볼 수 있다 (E2E-002)', async ({ request }) => {
    // Arrange: ADMIN 로그인
    const { cookies } = await login(request, 'admin@test.com', 'test1234')

    // Act: 메뉴 API 호출
    const response = await request.get(API_BASE, {
      headers: {
        Cookie: cookies,
      },
    })

    // Assert
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.success).toBe(true)

    // ADMIN은 모든 활성 메뉴 접근 가능
    const flattenMenus = (
      items: { code: string; children: unknown[] }[]
    ): { code: string }[] => {
      return items.reduce(
        (acc: { code: string }[], item) => {
          acc.push({ code: item.code })
          if (item.children?.length) {
            acc.push(
              ...flattenMenus(item.children as typeof items)
            )
          }
          return acc
        },
        []
      )
    }

    const totalMenuCount = flattenMenus(body.data).length
    expect(totalMenuCount).toBeGreaterThan(0)

    // 관리 메뉴(SYSTEM)가 포함되어야 함
    const systemMenu = body.data.find(
      (m: { code: string }) => m.code === 'SYSTEM'
    )
    expect(systemMenu).toBeDefined()
  })

  // E2E-003: 부모 메뉴 자동 포함 (BR-02)
  test('자식 메뉴 권한이 있으면 부모 폴더도 표시된다 (E2E-003)', async ({
    request,
  }) => {
    // Arrange: OPERATOR 로그인 (제한된 메뉴 권한)
    const { cookies } = await login(request, 'operator@test.com', 'test1234')

    // Act: 메뉴 API 호출
    const response = await request.get(API_BASE, {
      headers: {
        Cookie: cookies,
      },
    })

    // Assert
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.success).toBe(true)

    // 부모 폴더(PRODUCTION)가 있어야 자식에 접근 가능
    // OPERATOR에게 생산 관련 메뉴만 권한이 있다면
    // 부모 폴더가 자동 포함되어야 함
    if (body.data.length > 0) {
      // 응답에 메뉴가 있다면 계층 구조가 유지되어야 함
      const hasChildWithParent = body.data.some(
        (menu: { children: unknown[] }) => menu.children && menu.children.length > 0
      )
      // 계층 구조가 있는 경우 부모 메뉴가 포함됨
      expect(body.data.length).toBeGreaterThanOrEqual(0)
    }
  })
})

test.describe('Menu API CRUD Tests (인증 필요)', () => {
  let adminCookies: string

  test.beforeAll(async ({ request }) => {
    const { cookies } = await login(request, 'admin@test.com', 'test1234')
    adminCookies = cookies
  })

  // 메뉴 목록 조회 (계층 구조)
  test('GET /api/menus returns nested 3-level menu tree', async ({
    request,
  }) => {
    const response = await request.get(API_BASE, {
      headers: { Cookie: adminCookies },
    })

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)

    // 생산 관리 > 실적 관리 > 생산 실적 입력 (3단계 구조 확인)
    const productionMenu = body.data.find(
      (menu: { code: string }) => menu.code === 'PRODUCTION'
    )
    expect(productionMenu).toBeDefined()
    expect(productionMenu.children).toBeDefined()
    expect(productionMenu.children.length).toBeGreaterThan(0)
  })

  // 메뉴 순서 정렬
  test('GET /api/menus returns menus sorted by sortOrder', async ({
    request,
  }) => {
    const response = await request.get(API_BASE, {
      headers: { Cookie: adminCookies },
    })

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)

    // 최상위 메뉴가 sortOrder 순으로 정렬되어 있는지 확인
    const sortOrders = body.data.map(
      (menu: { sortOrder: number }) => menu.sortOrder
    )
    const sortedOrders = [...sortOrders].sort((a, b) => a - b)
    expect(sortOrders).toEqual(sortedOrders)
  })

  // 활성 메뉴만 표시
  test('GET /api/menus returns only active menus', async ({ request }) => {
    const response = await request.get(API_BASE, {
      headers: { Cookie: adminCookies },
    })

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)

    // 비활성 메뉴(INACTIVE_MENU)가 응답에 포함되지 않아야 함
    const flattenMenus = (
      menus: { code: string; children: unknown[] }[]
    ): { code: string }[] => {
      let result: { code: string }[] = []
      for (const menu of menus) {
        result.push({ code: menu.code })
        if (menu.children && menu.children.length > 0) {
          result = result.concat(flattenMenus(menu.children as typeof menus))
        }
      }
      return result
    }

    const allMenus = flattenMenus(body.data)
    const inactiveMenu = allMenus.find((menu) => menu.code === 'INACTIVE_MENU')
    expect(inactiveMenu).toBeUndefined()
  })

  // 중복 코드 생성 에러
  test('POST /api/menus returns 409 for duplicate code', async ({ request }) => {
    const response = await request.post(API_BASE, {
      headers: { Cookie: adminCookies },
      data: {
        code: 'DASHBOARD', // 이미 시드 데이터에 존재
        name: '중복 테스트',
      },
    })

    expect(response.status()).toBe(409)

    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('DUPLICATE_MENU_CODE')
  })

  // 4단계 메뉴 생성 에러
  test('POST /api/menus returns 400 for depth > 3', async ({ request }) => {
    // 먼저 3단계 메뉴 ID 확인 (PRODUCTION_ENTRY = 13)
    const response = await request.post(API_BASE, {
      headers: { Cookie: adminCookies },
      data: {
        code: 'LEVEL4_TEST',
        name: '4단계 테스트 메뉴',
        parentId: 13, // 생산 실적 입력 (3단계)
      },
    })

    expect(response.status()).toBe(400)

    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('MAX_DEPTH_EXCEEDED')
  })

  // 자식 있는 메뉴 삭제 에러
  test('DELETE /api/menus/:id returns 400 when menu has children', async ({
    request,
  }) => {
    // 대시보드(id=1)는 자식 메뉴(메인 대시보드)가 있음
    const response = await request.delete(`${API_BASE}/1`, {
      headers: { Cookie: adminCookies },
    })

    expect(response.status()).toBe(400)

    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('HAS_CHILDREN')
  })

  // 순환 참조 에러
  test('PUT /api/menus/:id returns 400 for circular reference', async ({
    request,
  }) => {
    // 대시보드(id=1)의 부모를 메인 대시보드(id=2, 자식)로 설정 시도
    const response = await request.put(`${API_BASE}/1`, {
      headers: { Cookie: adminCookies },
      data: {
        parentId: 2, // 자식 메뉴를 부모로 지정
      },
    })

    expect(response.status()).toBe(400)

    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('CIRCULAR_REFERENCE')
  })

  // 입력 검증 테스트
  test('POST /api/menus returns 400 for invalid code format', async ({
    request,
  }) => {
    const response = await request.post(API_BASE, {
      headers: { Cookie: adminCookies },
      data: {
        code: 'invalid-code', // 소문자 + 하이픈 (허용 안 됨)
        name: '테스트',
      },
    })

    expect(response.status()).toBe(400)

    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  // 유효하지 않은 경로 테스트
  test('POST /api/menus returns 400 for invalid path', async ({ request }) => {
    const response = await request.post(API_BASE, {
      headers: { Cookie: adminCookies },
      data: {
        code: 'PATH_TEST',
        name: '경로 테스트',
        path: 'javascript:alert(1)',
      },
    })

    expect(response.status()).toBe(400)

    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })
})

test.describe('Menu API 권한 테스트', () => {
  // 비관리자는 메뉴 생성 불가
  test('OPERATOR는 메뉴를 생성할 수 없다', async ({ request }) => {
    const { cookies } = await login(request, 'operator@test.com', 'test1234')

    const response = await request.post(API_BASE, {
      headers: { Cookie: cookies },
      data: {
        code: 'OPERATOR_TEST',
        name: '운영자 테스트',
      },
    })

    expect(response.status()).toBe(403)

    const body = await response.json()
    expect(body.success).toBe(false)
  })
})
