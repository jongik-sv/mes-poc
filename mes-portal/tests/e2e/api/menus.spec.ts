/**
 * 메뉴 API E2E 테스트 (TSK-03-01)
 *
 * 테스트 명세서(026-test-specification.md) 기반
 */

import { test, expect } from '@playwright/test'

const API_BASE = '/api/menus'

test.describe('Menu API E2E Tests', () => {
  // E2E-001: 메뉴 목록 조회
  test('GET /api/menus returns menu list (E2E-001)', async ({ request }) => {
    const response = await request.get(API_BASE)

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })

  // E2E-002: 3단계 메뉴 표시
  test('GET /api/menus returns nested 3-level menu tree (E2E-002)', async ({
    request,
  }) => {
    const response = await request.get(API_BASE)

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

    // 2단계: 실적 관리
    const resultMenu = productionMenu.children.find(
      (menu: { code: string }) => menu.code === 'PRODUCTION_RESULT'
    )
    expect(resultMenu).toBeDefined()
    expect(resultMenu.children).toBeDefined()
    expect(resultMenu.children.length).toBeGreaterThan(0)

    // 3단계: 생산 실적 입력
    const entryMenu = resultMenu.children.find(
      (menu: { code: string }) => menu.code === 'PRODUCTION_ENTRY'
    )
    expect(entryMenu).toBeDefined()
  })

  // E2E-003: 메뉴 순서 표시
  test('GET /api/menus returns menus sorted by sortOrder (E2E-003)', async ({
    request,
  }) => {
    const response = await request.get(API_BASE)

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

  // E2E-004: 활성 메뉴만 표시
  test('GET /api/menus returns only active menus (E2E-004)', async ({
    request,
  }) => {
    const response = await request.get(API_BASE)

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)

    // 비활성 메뉴(INACTIVE_MENU)가 응답에 포함되지 않아야 함
    const flattenMenus = (menus: { code: string; children: unknown[] }[]): { code: string }[] => {
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

  // E2E-005: 중복 코드 생성 에러
  test('POST /api/menus returns 409 for duplicate code (E2E-005)', async ({
    request,
  }) => {
    const response = await request.post(API_BASE, {
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

  // E2E-006: 4단계 메뉴 생성 에러
  test('POST /api/menus returns 400 for depth > 3 (E2E-006)', async ({
    request,
  }) => {
    // 먼저 3단계 메뉴 ID 확인 (PRODUCTION_ENTRY = 13)
    const response = await request.post(API_BASE, {
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

  // E2E-007: 자식 있는 메뉴 삭제 에러
  test('DELETE /api/menus/:id returns 400 when menu has children (E2E-007)', async ({
    request,
  }) => {
    // 대시보드(id=1)는 자식 메뉴(메인 대시보드)가 있음
    const response = await request.delete(`${API_BASE}/1`)

    expect(response.status()).toBe(400)

    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('HAS_CHILDREN')
  })

  // E2E-008: 순환 참조 에러
  test('PUT /api/menus/:id returns 400 for circular reference (E2E-008)', async ({
    request,
  }) => {
    // 대시보드(id=1)의 부모를 메인 대시보드(id=2, 자식)로 설정 시도
    const response = await request.put(`${API_BASE}/1`, {
      data: {
        parentId: 2, // 자식 메뉴를 부모로 지정
      },
    })

    expect(response.status()).toBe(400)

    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('CIRCULAR_REFERENCE')
  })

  // 추가: API 응답 형식 검증
  test('GET /api/menus returns correct menu item structure', async ({
    request,
  }) => {
    const response = await request.get(API_BASE)

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)

    const firstMenu = body.data[0]
    expect(firstMenu).toHaveProperty('id')
    expect(firstMenu).toHaveProperty('code')
    expect(firstMenu).toHaveProperty('name')
    expect(firstMenu).toHaveProperty('path')
    expect(firstMenu).toHaveProperty('icon')
    expect(firstMenu).toHaveProperty('sortOrder')
    expect(firstMenu).toHaveProperty('children')
  })

  // 입력 검증 테스트
  test('POST /api/menus returns 400 for invalid code format', async ({
    request,
  }) => {
    const response = await request.post(API_BASE, {
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
