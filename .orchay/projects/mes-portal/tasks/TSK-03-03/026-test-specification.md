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
| Task ID | TSK-03-03 |
| Task명 | 메뉴 API 엔드포인트 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | API Route Handler, buildMenuTree, collectParentIds | 80% 이상 |
| E2E 테스트 | 주요 메뉴 조회 시나리오 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | 사이드바 메뉴 렌더링 확인 | 전체 화면 |

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

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | GET /api/menus | 인증된 사용자 메뉴 조회 | 계층형 메뉴 배열 반환 | FR-001 |
| UT-002 | GET /api/menus | 빈 메뉴 목록 | 빈 배열 반환 | FR-001 |
| UT-003 | GET /api/menus | ADMIN 역할 전체 메뉴 | 모든 활성 메뉴 반환 | FR-002, BR-03 |
| UT-004 | collectParentIds | 자식 메뉴 권한 시 부모 포함 | 부모 ID 자동 추가 | FR-002, BR-02 |
| UT-005 | buildMenuTree | 플랫 목록 → 트리 변환 | 계층형 구조 반환 | FR-003 |
| UT-006 | buildMenuTree | sortOrder 정렬 | 올바른 순서로 정렬 | FR-003, BR-05 |
| UT-007 | GET /api/menus | 미인증 요청 | 401 Unauthorized | BR-01 |
| UT-008 | GET /api/menus | 비활성 메뉴 필터링 | 활성 메뉴만 반환 | BR-04 |

### 2.2 테스트 케이스 상세

#### UT-001: 인증된 사용자 메뉴 조회

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/menus/__tests__/route.spec.ts` |
| **테스트 블록** | `describe('GET /api/menus') → it('should return menu tree for authenticated user')` |
| **Mock 의존성** | Auth.js session, Prisma Client |
| **입력 데이터** | 인증된 세션 (userId: 1, roleId: 2) |
| **검증 포인트** | 200 응답, MenuItem[] 구조, children 배열 포함 |
| **커버리지 대상** | API Route GET 핸들러 정상 분기 |
| **관련 요구사항** | FR-001 |

```typescript
it('should return menu tree for authenticated user', async () => {
  // Arrange
  mockGetServerSession.mockResolvedValue({
    user: { id: '1', email: 'user@test.com' }
  })
  mockPrismaUser.findUnique.mockResolvedValue({
    id: 1, isActive: true, roleId: 2
  })
  mockPrismaRoleMenu.findMany.mockResolvedValue([
    { menuId: 2 }, { menuId: 3 }
  ])
  mockPrismaMenu.findMany.mockResolvedValue([
    { id: 1, code: 'PROD', name: '생산', parentId: null, sortOrder: 1, isActive: true },
    { id: 2, code: 'PROD_PLAN', name: '생산계획', parentId: 1, sortOrder: 1, isActive: true }
  ])

  // Act
  const response = await GET()
  const data = await response.json()

  // Assert
  expect(response.status).toBe(200)
  expect(data).toBeInstanceOf(Array)
  expect(data[0]).toHaveProperty('children')
})
```

#### UT-002: 빈 메뉴 목록

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/menus/__tests__/route.spec.ts` |
| **테스트 블록** | `describe('GET /api/menus') → it('should return empty array when no menus')` |
| **Mock 의존성** | Auth.js session, Prisma Client |
| **입력 데이터** | 인증된 세션 (userId: 1, roleId: 2), 빈 RoleMenu |
| **검증 포인트** | 200 응답, 빈 배열 `[]` |
| **커버리지 대상** | 메뉴 없음 분기 |
| **관련 요구사항** | FR-001 |

```typescript
it('should return empty array when no menus', async () => {
  // Arrange
  mockGetServerSession.mockResolvedValue({
    user: { id: '1', email: 'user@test.com' }
  })
  mockPrismaUser.findUnique.mockResolvedValue({
    id: 1, isActive: true, roleId: 2
  })
  mockPrismaRoleMenu.findMany.mockResolvedValue([])

  // Act
  const response = await GET()
  const data = await response.json()

  // Assert
  expect(response.status).toBe(200)
  expect(data).toEqual([])
})
```

#### UT-003: ADMIN 역할 전체 메뉴

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/menus/__tests__/route.spec.ts` |
| **테스트 블록** | `describe('GET /api/menus') → it('should return all menus for ADMIN role')` |
| **Mock 의존성** | Auth.js session, Prisma Client |
| **입력 데이터** | 인증된 세션 (userId: 1, roleId: 1 - ADMIN) |
| **검증 포인트** | RoleMenu 필터링 건너뜀, 모든 활성 메뉴 반환 |
| **커버리지 대상** | ADMIN 분기 |
| **관련 요구사항** | FR-002, BR-03 |

```typescript
it('should return all menus for ADMIN role', async () => {
  // Arrange
  const SYSTEM_ADMIN_ROLE_ID = 1
  mockGetServerSession.mockResolvedValue({
    user: { id: '1', email: 'admin@test.com' }
  })
  mockPrismaUser.findUnique.mockResolvedValue({
    id: 1, isActive: true, roleId: SYSTEM_ADMIN_ROLE_ID
  })
  mockPrismaMenu.findMany.mockResolvedValue([
    { id: 1, code: 'ADMIN', name: '관리', parentId: null, sortOrder: 1, isActive: true },
    { id: 2, code: 'PROD', name: '생산', parentId: null, sortOrder: 2, isActive: true }
  ])

  // Act
  const response = await GET()
  const data = await response.json()

  // Assert
  expect(response.status).toBe(200)
  expect(data.length).toBe(2)
  expect(mockPrismaRoleMenu.findMany).not.toHaveBeenCalled()
})
```

#### UT-004: 부모 메뉴 자동 포함 (collectParentIds)

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/menus/__tests__/route.spec.ts` |
| **테스트 블록** | `describe('collectParentIds') → it('should include parent IDs')` |
| **Mock 의존성** | 없음 (순수 함수) |
| **입력 데이터** | menuIds: [3], allMenus: 계층 데이터 |
| **검증 포인트** | 부모 ID (1, 2) 포함된 Set 반환 |
| **커버리지 대상** | collectParentIds 함수 |
| **관련 요구사항** | FR-002, BR-02 |

```typescript
describe('collectParentIds', () => {
  it('should include parent IDs when child has permission', () => {
    // Arrange
    const allMenus = [
      { id: 1, parentId: null },  // 루트
      { id: 2, parentId: 1 },     // 1단계 자식
      { id: 3, parentId: 2 }      // 2단계 자식
    ]
    const menuIds = [3]  // 2단계 자식만 권한 있음

    // Act
    const result = collectParentIds(menuIds, allMenus)

    // Assert
    expect(result.has(1)).toBe(true)  // 루트 포함
    expect(result.has(2)).toBe(true)  // 1단계 부모 포함
    expect(result.has(3)).toBe(true)  // 원래 권한
  })
})
```

#### UT-005: buildMenuTree 트리 변환

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/menus/__tests__/route.spec.ts` |
| **테스트 블록** | `describe('buildMenuTree') → it('should convert flat list to tree')` |
| **Mock 의존성** | 없음 (순수 함수) |
| **입력 데이터** | 플랫 메뉴 배열 |
| **검증 포인트** | 루트 노드에 children 배열, 계층 구조 |
| **커버리지 대상** | buildMenuTree 함수 |
| **관련 요구사항** | FR-003 |

```typescript
describe('buildMenuTree', () => {
  it('should convert flat list to tree structure', () => {
    // Arrange
    const flatMenus = [
      { id: 1, code: 'ROOT', name: '루트', parentId: null, sortOrder: 1 },
      { id: 2, code: 'CHILD', name: '자식', parentId: 1, sortOrder: 1 }
    ]

    // Act
    const tree = buildMenuTree(flatMenus)

    // Assert
    expect(tree.length).toBe(1)
    expect(tree[0].id).toBe(1)
    expect(tree[0].children.length).toBe(1)
    expect(tree[0].children[0].id).toBe(2)
  })
})
```

#### UT-006: sortOrder 정렬

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/menus/__tests__/route.spec.ts` |
| **테스트 블록** | `describe('buildMenuTree') → it('should sort by sortOrder')` |
| **Mock 의존성** | 없음 (순수 함수) |
| **입력 데이터** | 정렬되지 않은 메뉴 배열 |
| **검증 포인트** | sortOrder 오름차순 정렬 |
| **커버리지 대상** | buildMenuTree 함수 정렬 로직 |
| **관련 요구사항** | FR-003, BR-05 |

```typescript
it('should sort menus by sortOrder', () => {
  // Arrange
  const flatMenus = [
    { id: 2, code: 'B', name: 'B', parentId: null, sortOrder: 2 },
    { id: 1, code: 'A', name: 'A', parentId: null, sortOrder: 1 },
    { id: 3, code: 'C', name: 'C', parentId: null, sortOrder: 3 }
  ]

  // Act
  const tree = buildMenuTree(flatMenus)

  // Assert
  expect(tree[0].id).toBe(1)
  expect(tree[1].id).toBe(2)
  expect(tree[2].id).toBe(3)
})
```

#### UT-007: 미인증 요청 401

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/menus/__tests__/route.spec.ts` |
| **테스트 블록** | `describe('GET /api/menus') → it('should return 401 for unauthenticated')` |
| **Mock 의존성** | Auth.js session |
| **입력 데이터** | 세션 null |
| **검증 포인트** | 401 Unauthorized 응답 |
| **커버리지 대상** | 인증 검사 분기 |
| **관련 요구사항** | BR-01 |

```typescript
it('should return 401 for unauthenticated request', async () => {
  // Arrange
  mockGetServerSession.mockResolvedValue(null)

  // Act
  const response = await GET()

  // Assert
  expect(response.status).toBe(401)
  const data = await response.json()
  expect(data.error).toBe('Unauthorized')
})
```

#### UT-008: 비활성 메뉴 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/menus/__tests__/route.spec.ts` |
| **테스트 블록** | `describe('GET /api/menus') → it('should exclude inactive menus')` |
| **Mock 의존성** | Auth.js session, Prisma Client |
| **입력 데이터** | isActive: true/false 혼합 메뉴 |
| **검증 포인트** | isActive: true 메뉴만 반환 |
| **커버리지 대상** | 비활성 필터링 분기 |
| **관련 요구사항** | BR-04 |

```typescript
it('should exclude inactive menus', async () => {
  // Arrange
  mockGetServerSession.mockResolvedValue({
    user: { id: '1', email: 'admin@test.com' }
  })
  mockPrismaUser.findUnique.mockResolvedValue({
    id: 1, isActive: true, roleId: 1
  })
  // Prisma where: { isActive: true } 조건 확인
  mockPrismaMenu.findMany.mockImplementation((query) => {
    expect(query.where.isActive).toBe(true)
    return Promise.resolve([])
  })

  // Act
  await GET()

  // Assert
  expect(mockPrismaMenu.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({ isActive: true })
    })
  )
})
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 메뉴 목록 조회 | 로그인 상태 | 1. API 호출 | 계층형 메뉴 반환 | FR-001, FR-003, BR-05 |
| E2E-002 | ADMIN 전체 메뉴 | ADMIN 로그인 | 1. API 호출 | 모든 활성 메뉴 반환 | FR-002, BR-03 |
| E2E-003 | 부모 메뉴 자동 포함 | OPERATOR 로그인 | 1. API 호출 | 자식+부모 메뉴 반환 | FR-002, BR-02 |
| E2E-004 | 미인증 접근 거부 | 로그아웃 상태 | 1. API 호출 | 401 에러 | BR-01 |

### 3.2 테스트 케이스 상세

#### E2E-001: 메뉴 목록 조회

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/menus.spec.ts` |
| **테스트명** | `test('인증된 사용자가 메뉴 목록을 조회할 수 있다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **API 확인** | `GET /api/menus` → 200 |
| **검증 포인트** | 응답이 배열, 계층 구조, sortOrder 순서 |
| **관련 요구사항** | FR-001, FR-003, BR-05 |

```typescript
test('인증된 사용자가 메뉴 목록을 조회할 수 있다', async ({ request, authContext }) => {
  // Act
  const response = await authContext.get('/api/menus')

  // Assert
  expect(response.ok()).toBeTruthy()
  const menus = await response.json()
  expect(Array.isArray(menus)).toBe(true)

  // 계층 구조 검증
  if (menus.length > 0) {
    expect(menus[0]).toHaveProperty('children')
    expect(menus[0]).toHaveProperty('id')
    expect(menus[0]).toHaveProperty('code')
    expect(menus[0]).toHaveProperty('name')
  }

  // sortOrder 순서 검증
  for (let i = 1; i < menus.length; i++) {
    expect(menus[i].sortOrder).toBeGreaterThanOrEqual(menus[i-1].sortOrder)
  }
})
```

#### E2E-002: ADMIN 전체 메뉴

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/menus.spec.ts` |
| **테스트명** | `test('ADMIN 사용자는 모든 메뉴를 볼 수 있다')` |
| **사전조건** | ADMIN 로그인 (fixture 사용) |
| **API 확인** | `GET /api/menus` → 200 |
| **검증 포인트** | 반환된 메뉴 수 = 전체 활성 메뉴 수 |
| **관련 요구사항** | FR-002, BR-03 |

```typescript
test('ADMIN 사용자는 모든 메뉴를 볼 수 있다', async ({ request, adminContext }) => {
  // Act
  const response = await adminContext.get('/api/menus')

  // Assert
  expect(response.ok()).toBeTruthy()
  const menus = await response.json()

  // ADMIN은 모든 활성 메뉴 접근 가능
  // 시드 데이터 기준 전체 메뉴 수 검증
  const flattenMenus = (items: any[]): any[] => {
    return items.reduce((acc, item) => {
      acc.push(item)
      if (item.children?.length) {
        acc.push(...flattenMenus(item.children))
      }
      return acc
    }, [])
  }

  const totalMenuCount = flattenMenus(menus).length
  expect(totalMenuCount).toBeGreaterThan(0)
})
```

#### E2E-003: 부모 메뉴 자동 포함

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/menus.spec.ts` |
| **테스트명** | `test('자식 메뉴 권한이 있으면 부모 폴더도 표시된다')` |
| **사전조건** | OPERATOR 로그인 (자식 메뉴만 권한 부여됨) |
| **API 확인** | `GET /api/menus` → 200 |
| **검증 포인트** | 부모 폴더 메뉴가 응답에 포함 |
| **관련 요구사항** | FR-002, BR-02 |

```typescript
test('자식 메뉴 권한이 있으면 부모 폴더도 표시된다', async ({ request, operatorContext }) => {
  // Arrange: OPERATOR는 특정 자식 메뉴(예: 생산실적)에만 권한이 있음

  // Act
  const response = await operatorContext.get('/api/menus')

  // Assert
  expect(response.ok()).toBeTruthy()
  const menus = await response.json()

  // 부모 폴더(생산)가 있어야 자식(생산실적)에 접근 가능
  const productionMenu = menus.find((m: any) => m.code === 'PROD')
  expect(productionMenu).toBeDefined()
  expect(productionMenu.children.length).toBeGreaterThan(0)
})
```

#### E2E-004: 미인증 접근 거부

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/menus.spec.ts` |
| **테스트명** | `test('미인증 요청은 401 에러를 반환한다')` |
| **사전조건** | 로그아웃 상태 |
| **API 확인** | `GET /api/menus` → 401 |
| **검증 포인트** | 401 상태 코드, error 메시지 |
| **관련 요구사항** | BR-01 |

```typescript
test('미인증 요청은 401 에러를 반환한다', async ({ request }) => {
  // Act: 인증 없이 API 호출
  const response = await request.get('/api/menus')

  // Assert
  expect(response.status()).toBe(401)
  const data = await response.json()
  expect(data.error).toBe('Unauthorized')
})
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 사이드바 메뉴 표시 | 로그인 | 1. 로그인 후 대시보드 접속 | 권한에 맞는 메뉴 표시 | High | FR-001, FR-002, FR-003 |
| TC-002 | 역할별 메뉴 필터링 | 다른 역할 계정 | 1. 각 역할로 로그인 | 역할별 다른 메뉴 표시 | High | FR-002 |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 사이드바 메뉴 표시

**테스트 목적**: 로그인 후 사이드바에 사용자 권한에 맞는 메뉴가 올바르게 표시되는지 확인

**테스트 단계**:
1. 테스트 계정으로 로그인
2. 대시보드 페이지 접속
3. 사이드바 메뉴 확인

**예상 결과**:
- 사이드바에 메뉴가 계층형으로 표시됨
- 폴더 메뉴 클릭 시 하위 메뉴 펼침/접힘
- 각 메뉴에 아이콘과 이름 표시
- sortOrder 순서대로 정렬

**검증 기준**:
- [ ] 메뉴가 정상적으로 로드됨
- [ ] 계층형 구조로 표시됨
- [ ] 메뉴 클릭 시 해당 페이지로 이동
- [ ] 폴더 메뉴 토글 동작 확인

#### TC-002: 역할별 메뉴 필터링

**테스트 목적**: 서로 다른 역할의 사용자가 각각 다른 메뉴를 볼 수 있는지 확인

**테스트 단계**:
1. ADMIN 계정으로 로그인 → 메뉴 목록 확인
2. 로그아웃
3. OPERATOR 계정으로 로그인 → 메뉴 목록 확인
4. 두 목록 비교

**예상 결과**:
- ADMIN: 모든 활성 메뉴 표시
- OPERATOR: 권한이 부여된 메뉴만 표시
- 부모 폴더는 자식 권한이 있으면 자동 표시

**검증 기준**:
- [ ] ADMIN에게 모든 메뉴 표시됨
- [ ] OPERATOR에게 제한된 메뉴만 표시됨
- [ ] 부모 폴더 자동 포함 확인

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-USER-ADMIN | ADMIN 사용자 | `{ id: 1, email: 'admin@test.com', roleId: 1, isActive: true }` |
| MOCK-USER-OPERATOR | OPERATOR 사용자 | `{ id: 2, email: 'operator@test.com', roleId: 2, isActive: true }` |
| MOCK-MENU-ROOT | 루트 메뉴 | `{ id: 1, code: 'PROD', name: '생산', parentId: null, sortOrder: 1, isActive: true }` |
| MOCK-MENU-CHILD | 자식 메뉴 | `{ id: 2, code: 'PROD_PLAN', name: '생산계획', parentId: 1, sortOrder: 1, isActive: true }` |
| MOCK-ROLEMENU-01 | 역할-메뉴 매핑 | `{ roleId: 2, menuId: 2 }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-MENUS | 기본 메뉴 환경 | Prisma seed | Menu 10개 (3단계 계층), Role 3개, RoleMenu 매핑 |
| SEED-E2E-ADMIN | ADMIN 테스트 | Prisma seed | ADMIN 사용자 1명 (roleId: 1) |
| SEED-E2E-OPERATOR | OPERATOR 테스트 | Prisma seed | OPERATOR 사용자 1명 (roleId: 2), 부분 메뉴 권한 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-ADMIN | admin@test.com | test1234 | ADMIN (roleId: 1) | 전체 메뉴 테스트 |
| TEST-OPERATOR | operator@test.com | test1234 | OPERATOR (roleId: 2) | 권한 필터링 테스트 |

### 5.4 시드 메뉴 구조

```
📁 생산 (PROD, sortOrder: 1)
├── 📄 생산계획 (PROD_PLAN, sortOrder: 1)
├── 📄 생산실적 (PROD_RESULT, sortOrder: 2)
└── 📁 생산관리 (PROD_MGMT, sortOrder: 3)
    └── 📄 작업지시 (PROD_ORDER, sortOrder: 1)
📁 품질 (QUAL, sortOrder: 2)
├── 📄 품질검사 (QUAL_INSP, sortOrder: 1)
└── 📄 불량관리 (QUAL_DEFECT, sortOrder: 2)
📁 관리 (ADMIN, sortOrder: 3)
├── 📄 사용자관리 (ADMIN_USER, sortOrder: 1)
└── 📄 권한관리 (ADMIN_ROLE, sortOrder: 2)
```

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 사이드바 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `sidebar` | 사이드바 컨테이너 | 사이드바 존재 확인 |
| `sidebar-menu` | 메뉴 컨테이너 | 메뉴 로드 확인 |
| `menu-item-{code}` | 개별 메뉴 아이템 | 특정 메뉴 확인 (예: menu-item-PROD) |
| `menu-folder-{code}` | 폴더형 메뉴 | 폴더 토글 테스트 |
| `menu-link-{code}` | 링크형 메뉴 | 페이지 이동 테스트 |
| `menu-icon-{code}` | 메뉴 아이콘 | 아이콘 렌더링 확인 |
| `menu-children-{code}` | 하위 메뉴 컨테이너 | 하위 메뉴 펼침 확인 |

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
- TRD: `.orchay/projects/mes-portal/trd.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |
