# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-02 |
| Task명 | 역할-메뉴 매핑 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | RoleMenu 서비스, 메뉴 필터링 로직 | 80% 이상 |
| E2E 테스트 | 역할별 메뉴 표시, 권한 없는 접근 차단 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | 사이드바 메뉴 표시, 권한 동작 | 전체 역할 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터베이스 | SQLite (테스트용) |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항/규칙 |
|-----------|------|----------|----------|--------------|
| UT-001 | MenuService.getMenusByRole | OPERATOR 역할 메뉴 조회 | 매핑된 메뉴만 반환 | FR-001, BR-01 |
| UT-002 | MenuService.getMenusByRole | MANAGER 역할 메뉴 조회 | 매핑된 메뉴만 반환 | FR-001, BR-01 |
| UT-003 | buildMenuTreeWithInheritance | 자식만 권한 시 부모 포함 | 부모 메뉴 자동 포함 | FR-002, BR-02 |
| UT-004 | MenuService.getMenusByRole | 메뉴 정렬 순서 | sortOrder 순 정렬 | FR-003 |
| UT-005 | MenuService.getMenusByRole | ADMIN 역할 전체 메뉴 | 모든 활성 메뉴 반환 | BR-03 |
| UT-006 | RoleMenuService.create | 중복 매핑 생성 | ConflictException 발생 | BR-04 |
| UT-007 | Role 삭제 | Cascade 삭제 | RoleMenu도 함께 삭제 | BR-05 |

### 2.2 테스트 케이스 상세

#### UT-001: OPERATOR 역할 메뉴 조회

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/services/menu.service.spec.ts` |
| **테스트 블록** | `describe('MenuService') → describe('getMenusByRole') → it('should return mapped menus for OPERATOR role')` |
| **Mock 의존성** | Prisma Mock: RoleMenu, Menu 데이터 |
| **입력 데이터** | `{ roleId: 3 }` (OPERATOR) |
| **검증 포인트** | 반환 메뉴에 'DASHBOARD', 'WORK_ORDER', 'PRODUCTION_RESULT'만 포함 |
| **커버리지 대상** | `getMenusByRole()` 메서드 일반 역할 분기 |
| **관련 요구사항** | FR-001, BR-01 |

**테스트 코드 스켈레톤:**
```typescript
describe('MenuService', () => {
  describe('getMenusByRole', () => {
    it('should return mapped menus for OPERATOR role', async () => {
      // Arrange
      const operatorRoleId = 3
      mockPrisma.roleMenu.findMany.mockResolvedValue([
        { menuId: 1 }, // DASHBOARD
        { menuId: 3 }, // WORK_ORDER
        { menuId: 4 }, // PRODUCTION_RESULT
      ])
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 1, code: 'DASHBOARD', name: '대시보드', isActive: true },
        { id: 3, code: 'WORK_ORDER', name: '작업 지시', isActive: true },
        { id: 4, code: 'PRODUCTION_RESULT', name: '생산 실적', isActive: true },
      ])

      // Act
      const result = await menuService.getMenusByRole(operatorRoleId)

      // Assert
      expect(result).toHaveLength(3)
      expect(result.map(m => m.code)).toEqual(
        expect.arrayContaining(['DASHBOARD', 'WORK_ORDER', 'PRODUCTION_RESULT'])
      )
      expect(result.map(m => m.code)).not.toContain('SYSTEM')
    })
  })
})
```

#### UT-002: MANAGER 역할 메뉴 조회

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/services/menu.service.spec.ts` |
| **테스트 블록** | `describe('MenuService') → describe('getMenusByRole') → it('should return mapped menus for MANAGER role')` |
| **Mock 의존성** | Prisma Mock: RoleMenu, Menu 데이터 |
| **입력 데이터** | `{ roleId: 2 }` (MANAGER) |
| **검증 포인트** | 반환 메뉴에 생산/품질/설비 관리 메뉴 포함, 시스템 관리 미포함 |
| **커버리지 대상** | `getMenusByRole()` 메서드 일반 역할 분기 |
| **관련 요구사항** | FR-001, BR-01 |

**테스트 코드 스켈레톤:**
```typescript
describe('MenuService', () => {
  describe('getMenusByRole', () => {
    it('should return mapped menus for MANAGER role', async () => {
      // Arrange
      const managerRoleId = 2
      mockPrisma.roleMenu.findMany.mockResolvedValue([
        { menuId: 1 }, // DASHBOARD
        { menuId: 2 }, // PRODUCTION
        { menuId: 3 }, // WORK_ORDER
        { menuId: 4 }, // PRODUCTION_RESULT
        { menuId: 5 }, // PRODUCTION_HISTORY
        { menuId: 10 }, // QUALITY
        { menuId: 11 }, // EQUIPMENT
      ])
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 1, code: 'DASHBOARD', name: '대시보드', isActive: true },
        { id: 2, code: 'PRODUCTION', name: '생산 관리', isActive: true },
        { id: 3, code: 'WORK_ORDER', name: '작업 지시', isActive: true },
        { id: 4, code: 'PRODUCTION_RESULT', name: '생산 실적', isActive: true },
        { id: 5, code: 'PRODUCTION_HISTORY', name: '생산 이력', isActive: true },
        { id: 10, code: 'QUALITY', name: '품질 관리', isActive: true },
        { id: 11, code: 'EQUIPMENT', name: '설비 관리', isActive: true },
      ])

      // Act
      const result = await menuService.getMenusByRole(managerRoleId)

      // Assert
      expect(result).toHaveLength(7)
      expect(result.map(m => m.code)).toEqual(
        expect.arrayContaining(['DASHBOARD', 'PRODUCTION', 'QUALITY', 'EQUIPMENT'])
      )
      expect(result.map(m => m.code)).not.toContain('SYSTEM')
      expect(result.map(m => m.code)).not.toContain('USER_MGMT')
    })
  })
})
```

#### UT-003: 자식 권한 시 부모 메뉴 자동 포함

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/utils/menu-tree.util.spec.ts` |
| **테스트 블록** | `describe('buildMenuTreeWithInheritance') → it('should include parent menu when child has permission')` |
| **Mock 의존성** | 없음 (순수 함수) |
| **입력 데이터** | 전체 메뉴 목록, 허용 메뉴 ID: [WORK_ORDER, PRODUCTION_RESULT] |
| **검증 포인트** | 부모 메뉴 'PRODUCTION'이 결과에 포함됨 |
| **커버리지 대상** | `buildMenuTreeWithInheritance()` 부모 추론 로직 |
| **관련 요구사항** | FR-002, BR-02 |

**테스트 코드 스켈레톤:**
```typescript
describe('buildMenuTreeWithInheritance', () => {
  it('should include parent menu when child has permission', () => {
    // Arrange
    const allMenus = [
      { id: 2, code: 'PRODUCTION', name: '생산 관리', parentId: null },
      { id: 3, code: 'WORK_ORDER', name: '작업 지시', parentId: 2 },
      { id: 4, code: 'PRODUCTION_RESULT', name: '생산 실적', parentId: 2 },
    ]
    const allowedMenuIds = [3, 4] // 자식만 권한

    // Act
    const result = buildMenuTreeWithInheritance(allMenus, allowedMenuIds)

    // Assert
    expect(result).toHaveLength(1) // 최상위 메뉴 1개 (PRODUCTION)
    expect(result[0].code).toBe('PRODUCTION')
    expect(result[0].children).toHaveLength(2) // 자식 2개
  })
})
```

#### UT-004: 메뉴 정렬 순서

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/services/menu.service.spec.ts` |
| **테스트 블록** | `describe('MenuService') → describe('getMenusByRole') → it('should return menus sorted by sortOrder')` |
| **Mock 의존성** | Prisma Mock: 정렬되지 않은 메뉴 데이터 |
| **입력 데이터** | 역할 ID |
| **검증 포인트** | 반환 메뉴가 sortOrder 오름차순 정렬 |
| **커버리지 대상** | `getMenusByRole()` 정렬 로직 |
| **관련 요구사항** | FR-003 |

#### UT-005: ADMIN 역할 전체 메뉴 조회

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/services/menu.service.spec.ts` |
| **테스트 블록** | `describe('MenuService') → describe('getMenusByRole') → it('should return all active menus for ADMIN role')` |
| **Mock 의존성** | Prisma Mock: 모든 메뉴 데이터 |
| **입력 데이터** | `{ roleId: 1 }` (ADMIN) |
| **검증 포인트** | RoleMenu 조회 없이 모든 활성 메뉴 반환 |
| **커버리지 대상** | `getMenusByRole()` ADMIN 분기 |
| **관련 요구사항** | BR-03 |

**테스트 코드 스켈레톤:**
```typescript
describe('MenuService', () => {
  describe('getMenusByRole', () => {
    it('should return all active menus for ADMIN role', async () => {
      // Arrange
      const adminRoleId = 1 // SYSTEM_ADMIN_ROLE_ID
      const allActiveMenus = [
        { id: 1, code: 'DASHBOARD', isActive: true },
        { id: 2, code: 'PRODUCTION', isActive: true },
        { id: 6, code: 'SYSTEM', isActive: true },
        { id: 7, code: 'USER_MGMT', isActive: true },
      ]
      mockPrisma.menu.findMany.mockResolvedValue(allActiveMenus)

      // Act
      const result = await menuService.getMenusByRole(adminRoleId)

      // Assert
      expect(result).toHaveLength(4)
      expect(mockPrisma.roleMenu.findMany).not.toHaveBeenCalled() // RoleMenu 조회 안 함
    })
  })
})
```

#### UT-006: 중복 매핑 생성 방지

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/services/role-menu.service.spec.ts` |
| **테스트 블록** | `describe('RoleMenuService') → describe('create') → it('should throw ConflictException for duplicate mapping')` |
| **Mock 의존성** | Prisma Mock: 기존 매핑 존재 |
| **입력 데이터** | `{ roleId: 2, menuId: 1 }` (이미 존재) |
| **검증 포인트** | Unique constraint 위반 에러 또는 ConflictException |
| **커버리지 대상** | `create()` 중복 검증 분기 |
| **관련 요구사항** | BR-04 |

#### UT-007: Role 삭제 시 Cascade 삭제

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/services/role.service.spec.ts` |
| **테스트 블록** | `describe('RoleService') → describe('delete') → it('should cascade delete RoleMenu mappings')` |
| **Mock 의존성** | Prisma Mock: Role과 관련 RoleMenu |
| **입력 데이터** | `{ roleId: 2 }` (MANAGER) |
| **검증 포인트** | Role 삭제 후 관련 RoleMenu도 삭제됨 |
| **커버리지 대상** | Cascade 삭제 동작 |
| **관련 요구사항** | BR-05 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항/규칙 |
|-----------|----------|----------|----------|----------|--------------|
| E2E-001 | OPERATOR 로그인 후 메뉴 확인 | OPERATOR 계정 | 1. 로그인 2. 사이드바 확인 | 허용 메뉴만 표시 | FR-001, FR-003, BR-01 |
| E2E-002 | 부모 메뉴 자동 표시 | OPERATOR 계정 | 1. 로그인 2. 생산 관리 메뉴 확인 | 부모 폴더 표시 | FR-002, BR-02 |
| E2E-003 | MANAGER 로그인 후 메뉴 확인 | MANAGER 계정 | 1. 로그인 2. 사이드바 확인 | MANAGER 메뉴 표시 | FR-001, BR-01 |
| E2E-004 | ADMIN 전체 메뉴 확인 | ADMIN 계정 | 1. 로그인 2. 사이드바 확인 | 모든 메뉴 표시 | BR-03 |

### 3.2 테스트 케이스 상세

#### E2E-001: OPERATOR 로그인 후 메뉴 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/menu-permission.spec.ts` |
| **테스트명** | `test('OPERATOR user should see only permitted menus')` |
| **사전조건** | OPERATOR 계정 시드 데이터 |
| **data-testid 셀렉터** | |
| - 사이드바 | `[data-testid="sidebar"]` |
| - 메뉴 아이템 | `[data-testid="menu-item-{code}"]` |
| **실행 단계** | |
| 1 | 로그인 페이지 접속: `await page.goto('/login')` |
| 2 | OPERATOR 계정으로 로그인 |
| 3 | 사이드바 메뉴 목록 확인 |
| **API 확인** | `GET /api/menus` → 200, 필터링된 메뉴 반환 |
| **검증 포인트** | |
| - | `expect(page.locator('[data-testid="menu-item-DASHBOARD"]')).toBeVisible()` |
| - | `expect(page.locator('[data-testid="menu-item-WORK_ORDER"]')).toBeVisible()` |
| - | `expect(page.locator('[data-testid="menu-item-SYSTEM"]')).not.toBeVisible()` |
| **스크린샷** | `e2e-001-operator-menu.png` |
| **관련 요구사항** | FR-001, FR-003, BR-01 |

**테스트 코드 스켈레톤:**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Menu Permission', () => {
  test('OPERATOR user should see only permitted menus', async ({ page }) => {
    // Arrange - 로그인
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'operator@test.com')
    await page.fill('[data-testid="password-input"]', 'test1234')
    await page.click('[data-testid="login-button"]')

    // Act - 포털 페이지 로드 대기
    await page.waitForURL('/portal')

    // Assert - 허용 메뉴 확인
    await expect(page.locator('[data-testid="menu-item-DASHBOARD"]')).toBeVisible()
    await expect(page.locator('[data-testid="menu-item-WORK_ORDER"]')).toBeVisible()
    await expect(page.locator('[data-testid="menu-item-PRODUCTION_RESULT"]')).toBeVisible()

    // Assert - 미허용 메뉴 확인
    await expect(page.locator('[data-testid="menu-item-SYSTEM"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="menu-item-USER_MGMT"]')).not.toBeVisible()

    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/e2e-001-operator-menu.png' })
  })
})
```

#### E2E-002: 부모 메뉴 자동 표시 (BR-02)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/menu-permission.spec.ts` |
| **테스트명** | `test('Parent menu should be visible when child has permission')` |
| **사전조건** | OPERATOR 계정 (자식 메뉴만 권한) |
| **data-testid 셀렉터** | |
| - 생산 관리 (부모) | `[data-testid="menu-item-PRODUCTION"]` |
| - 작업 지시 (자식) | `[data-testid="menu-item-WORK_ORDER"]` |
| **실행 단계** | |
| 1 | OPERATOR 로그인 |
| 2 | 생산 관리 메뉴 확인 |
| 3 | 생산 관리 클릭하여 서브메뉴 펼침 |
| 4 | 작업 지시, 생산 실적만 표시 확인 |
| **검증 포인트** | |
| - | `expect(page.locator('[data-testid="menu-item-PRODUCTION"]')).toBeVisible()` |
| - | 생산 관리 클릭 시 서브메뉴 펼쳐짐 |
| - | 작업 지시, 생산 실적은 보이고, 생산 이력은 안 보임 |
| **스크린샷** | `e2e-002-parent-menu-inheritance.png` |
| **관련 요구사항** | FR-002, BR-02 |

#### E2E-003: MANAGER 로그인 후 메뉴 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/menu-permission.spec.ts` |
| **테스트명** | `test('MANAGER user should see production and quality menus')` |
| **사전조건** | MANAGER 계정 시드 데이터 |
| **실행 단계** | |
| 1 | MANAGER 계정으로 로그인 |
| 2 | 사이드바 메뉴 확인 |
| **검증 포인트** | |
| - | 대시보드, 생산 관리, 품질 관리(QUALITY), 설비 관리(EQUIPMENT) 메뉴 표시 |
| - | 시스템 관리 메뉴 미표시 |
| **스크린샷** | `e2e-003-manager-menu.png` |
| **관련 요구사항** | FR-001, BR-01 |

#### E2E-004: ADMIN 전체 메뉴 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/menu-permission.spec.ts` |
| **테스트명** | `test('ADMIN user should see all menus')` |
| **사전조건** | ADMIN 계정 시드 데이터 |
| **실행 단계** | |
| 1 | ADMIN 계정으로 로그인 |
| 2 | 사이드바 메뉴 확인 |
| **검증 포인트** | |
| - | 모든 메뉴 (대시보드, 생산 관리, 시스템 관리 등) 표시 |
| - | 시스템 관리 하위 메뉴 (사용자 관리, 메뉴 관리, 권한 관리) 모두 표시 |
| **스크린샷** | `e2e-004-admin-menu.png` |
| **관련 요구사항** | BR-03 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | OPERATOR 메뉴 표시 | OPERATOR 로그인 | 1. 사이드바 확인 | 허용 메뉴만 표시 | High | FR-001, BR-01 |
| TC-002 | 부모 메뉴 자동 표시 | OPERATOR 로그인 | 1. 생산 관리 확인 | 부모 폴더 보임 | High | FR-002, BR-02 |
| TC-003 | ADMIN 전체 메뉴 | ADMIN 로그인 | 1. 사이드바 확인 | 모든 메뉴 표시 | High | BR-03 |
| TC-004 | 권한 없는 URL 접근 | OPERATOR 로그인 | 1. /system/users 직접 입력 | 403 페이지 표시 | Medium | UC-02 |
| TC-005 | 메뉴 정렬 순서 | 로그인 | 1. 사이드바 메뉴 순서 확인 2. 부모 메뉴 내 자식 정렬 확인 | sortOrder 순 표시 | Low | FR-003 |

### 4.2 매뉴얼 테스트 상세

#### TC-001: OPERATOR 메뉴 표시

**테스트 목적**: OPERATOR 역할 사용자 로그인 시 허용된 메뉴만 사이드바에 표시되는지 확인

**테스트 단계**:
1. OPERATOR 계정 (operator@test.com / test1234)으로 로그인
2. 포털 메인 화면에서 사이드바 확인
3. 표시된 메뉴 목록 확인

**예상 결과**:
- 대시보드 메뉴 표시됨
- 생산 관리 > 작업 지시 메뉴 표시됨
- 생산 관리 > 생산 실적 메뉴 표시됨
- 시스템 관리 메뉴 표시되지 않음

**검증 기준**:
- [ ] 허용된 메뉴만 사이드바에 표시됨
- [ ] 미허용 메뉴는 보이지 않음
- [ ] 메뉴 클릭 시 정상 화면 이동

#### TC-002: 부모 메뉴 자동 표시 (BR-02)

**테스트 목적**: 자식 메뉴 권한만 있을 때 부모 메뉴(폴더)가 자동으로 표시되는지 확인

**테스트 단계**:
1. OPERATOR 계정으로 로그인
2. 사이드바에서 "생산 관리" 메뉴 확인
3. "생산 관리" 클릭하여 서브메뉴 펼침
4. 서브메뉴 목록 확인

**예상 결과**:
- "생산 관리" 부모 메뉴가 사이드바에 표시됨
- 클릭 시 서브메뉴가 펼쳐짐
- "작업 지시", "생산 실적"만 서브메뉴에 표시됨
- "생산 이력"은 서브메뉴에 표시되지 않음

**검증 기준**:
- [ ] 부모 메뉴가 자동으로 표시됨
- [ ] 허용된 자식 메뉴만 서브메뉴에 표시됨
- [ ] 부모 메뉴 자체는 화면 이동 없음 (폴더 역할)

#### TC-003: ADMIN 전체 메뉴 표시

**테스트 목적**: ADMIN 역할 사용자가 모든 메뉴에 접근 가능한지 확인

**테스트 단계**:
1. ADMIN 계정 (admin@test.com / test1234)으로 로그인
2. 사이드바에서 전체 메뉴 확인
3. 시스템 관리 메뉴 클릭하여 서브메뉴 확인

**예상 결과**:
- 모든 메뉴가 사이드바에 표시됨
- 시스템 관리 > 사용자 관리, 메뉴 관리, 권한 관리 표시됨
- 모든 메뉴 클릭 시 정상 화면 이동

**검증 기준**:
- [ ] ADMIN은 모든 메뉴 접근 가능
- [ ] RoleMenu 매핑과 관계없이 전체 메뉴 표시

#### TC-004: 권한 없는 URL 직접 접근

**테스트 목적**: URL 직접 입력으로 권한 없는 화면 접근 시 차단되는지 확인

**테스트 단계**:
1. OPERATOR 계정으로 로그인
2. 브라우저 주소창에 `/system/users` 직접 입력
3. 표시되는 화면 확인

**예상 결과**:
- 403 권한 없음 페이지 표시
- "접근 권한이 없습니다" 메시지 표시
- 홈으로 돌아가기 버튼 제공

**검증 기준**:
- [ ] 미허용 경로 접근 시 403 에러
- [ ] 적절한 에러 메시지 표시
- [ ] 사용자가 이전 화면으로 돌아갈 수 있음

#### TC-005: 메뉴 정렬 순서

**테스트 목적**: 메뉴가 sortOrder 순서대로 정렬되어 표시되는지 확인

**테스트 단계**:
1. 임의 역할 계정으로 로그인
2. 사이드바에서 최상위 메뉴 순서 확인
3. 생산 관리 메뉴 펼쳐서 서브메뉴 순서 확인

**예상 결과**:
- 최상위 메뉴: 대시보드(1) → 생산 관리(2) → 시스템 관리(10) 순서
- 생산 관리 하위: 작업 지시(1) → 생산 실적(2) → 생산 이력(3) 순서
- 시스템 관리 하위: 사용자 관리(1) → 메뉴 관리(2) → 권한 관리(3) 순서

**검증 기준**:
- [ ] 메뉴가 sortOrder 오름차순으로 정렬됨
- [ ] 부모 메뉴 내 자식 메뉴도 sortOrder 순서 준수
- [ ] 동일 sortOrder인 경우 일관된 순서 유지

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-ROLE-ADMIN | 관리자 역할 | `{ id: 1, code: 'ADMIN', name: '관리자' }` |
| MOCK-ROLE-MANAGER | 매니저 역할 | `{ id: 2, code: 'MANAGER', name: '매니저' }` |
| MOCK-ROLE-OPERATOR | 운영자 역할 | `{ id: 3, code: 'OPERATOR', name: '운영자' }` |
| MOCK-MENU-DASHBOARD | 대시보드 메뉴 | `{ id: 1, code: 'DASHBOARD', name: '대시보드', path: '/dashboard', sortOrder: 1, isActive: true }` |
| MOCK-MENU-PRODUCTION | 생산 관리 (부모) | `{ id: 2, code: 'PRODUCTION', name: '생산 관리', path: null, parentId: null, sortOrder: 2, isActive: true }` |
| MOCK-MENU-WORK_ORDER | 작업 지시 (자식) | `{ id: 3, code: 'WORK_ORDER', name: '작업 지시', path: '/production/work-orders', parentId: 2, sortOrder: 1, isActive: true }` |
| MOCK-MENU-SYSTEM | 시스템 관리 | `{ id: 6, code: 'SYSTEM', name: '시스템 관리', path: null, sortOrder: 10, isActive: true }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-ROLES | 역할 데이터 | 자동 시드 | ADMIN, MANAGER, OPERATOR 역할 |
| SEED-E2E-MENUS | 메뉴 데이터 | 자동 시드 | 대시보드, 생산 관리, 시스템 관리 등 |
| SEED-E2E-ROLE-MENUS | 역할-메뉴 매핑 | 자동 시드 | 역할별 메뉴 접근 권한 |
| SEED-E2E-USERS | 테스트 사용자 | 자동 시드 | 역할별 테스트 계정 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 기능 테스트 |
| TEST-MANAGER | manager@test.com | test1234 | MANAGER | 매니저 기능 테스트 |
| TEST-OPERATOR | operator@test.com | test1234 | OPERATOR | 운영자 기능 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 사이드바 메뉴 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `sidebar` | 사이드바 컨테이너 | 사이드바 존재 확인 |
| `menu-item-{code}` | 메뉴 아이템 | 특정 메뉴 표시 확인 |
| `menu-item-DASHBOARD` | 대시보드 메뉴 | 대시보드 메뉴 확인 |
| `menu-item-PRODUCTION` | 생산 관리 메뉴 | 생산 관리 메뉴 확인 |
| `menu-item-WORK_ORDER` | 작업 지시 메뉴 | 작업 지시 메뉴 확인 |
| `menu-item-PRODUCTION_RESULT` | 생산 실적 메뉴 | 생산 실적 메뉴 확인 |
| `menu-item-SYSTEM` | 시스템 관리 메뉴 | 시스템 관리 메뉴 확인 |
| `menu-item-USER_MGMT` | 사용자 관리 메뉴 | 사용자 관리 메뉴 확인 |

### 6.2 로그인 페이지 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `login-page` | 로그인 페이지 컨테이너 | 페이지 로드 확인 |
| `email-input` | 이메일 입력 | 이메일 입력 |
| `password-input` | 비밀번호 입력 | 비밀번호 입력 |
| `login-button` | 로그인 버튼 | 로그인 액션 |

### 6.3 에러 페이지 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `error-403-page` | 403 에러 페이지 | 권한 없음 페이지 확인 |
| `error-message` | 에러 메시지 | 에러 메시지 확인 |
| `back-home-button` | 홈으로 돌아가기 버튼 | 복구 액션 |

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |
| Statements | 80% | 70% |

### 7.2 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 기능 요구사항 (FR) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

---

## 관련 문서

- 설계 문서: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |
| 1.1 | 2026-01-20 | Claude | 설계 리뷰 반영 - E2E-003 검증 포인트(QUALITY/EQUIPMENT 추가), TC-005 상세 절차 추가, UT-002 테스트 코드 스켈레톤 추가 |
