# TSK-03-01 구현 보고서 (030-implementation.md)

**Task ID:** TSK-03-01
**Task명:** 메뉴 데이터 모델
**구현일:** 2026-01-21
**상태 전환:** [ap] 승인 → [im] 구현

---

## 1. 구현 개요

### 1.1 목적

DB 기반 동적 메뉴 시스템의 데이터 모델과 API를 구현하여 사이드바 메뉴의 데이터 소스를 제공합니다.

### 1.2 구현 범위

- Prisma Menu 모델 정의
- MenuService 비즈니스 로직 구현
- GET /api/menus API 엔드포인트
- 초기 메뉴 시드 데이터

---

## 2. 구현 상세

### 2.1 파일 구조

```
mes-portal/
├── prisma/
│   ├── schema.prisma          # Menu 모델 정의 추가
│   └── seed.ts                # 초기 메뉴 데이터 (16개)
├── lib/
│   ├── types/
│   │   └── menu.ts            # 메뉴 타입 정의
│   └── services/
│       ├── menu.service.ts    # MenuService 클래스
│       └── __tests__/
│           └── menu.service.spec.ts  # 단위 테스트 (27건)
├── app/api/menus/
│   ├── route.ts               # GET, POST 엔드포인트
│   └── [id]/
│       └── route.ts           # GET, PUT, DELETE 엔드포인트
└── tests/e2e/api/
    └── menus.spec.ts          # E2E 테스트 (11건)
```

### 2.2 Prisma Menu 모델

```prisma
model Menu {
  id        Int      @id @default(autoincrement())
  code      String   @unique
  name      String
  path      String?
  icon      String?
  parentId  Int?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  parent   Menu?  @relation("MenuHierarchy", fields: [parentId], references: [id])
  children Menu[] @relation("MenuHierarchy")

  @@index([parentId])
  @@index([isActive])
  @@index([parentId, sortOrder])
  @@map("menus")
}
```

### 2.3 MenuService 주요 메서드

| 메서드 | 설명 | 비즈니스 규칙 |
|--------|------|--------------|
| `findAll()` | 계층형 메뉴 목록 조회 | BR-003, BR-004 |
| `create(dto)` | 메뉴 생성 | BR-001, BR-002 |
| `update(id, dto)` | 메뉴 수정 | BR-001, BR-005 |
| `delete(id)` | 메뉴 삭제 | BR-006 |
| `findById(id)` | 단일 메뉴 조회 | - |

### 2.4 API 엔드포인트

| Method | Endpoint | 설명 | 상태 |
|--------|----------|------|------|
| GET | /api/menus | 계층형 메뉴 목록 조회 | 구현완료 |
| POST | /api/menus | 메뉴 생성 | 구현완료 |
| GET | /api/menus/:id | 단일 메뉴 조회 | 구현완료 |
| PUT | /api/menus/:id | 메뉴 수정 | 구현완료 |
| DELETE | /api/menus/:id | 메뉴 삭제 | 구현완료 |

---

## 3. 비즈니스 규칙 구현

### 3.1 BR-001: 메뉴 코드 유일성

```typescript
// menu.service.ts - create()
const existingMenu = await prisma.menu.findUnique({
  where: { code: dto.code },
})
if (existingMenu) {
  throw new MenuServiceError(
    MenuErrorCode.DUPLICATE_MENU_CODE,
    '이미 존재하는 메뉴 코드입니다',
    409
  )
}
```

### 3.2 BR-002: 계층 깊이 제한

```typescript
// menu.service.ts - validateMenuDepth()
private async validateMenuDepth(parentId: number): Promise<void> {
  let depth = 1
  let currentId: number | null = parentId

  while (currentId !== null) {
    depth++
    if (depth > 3) {
      throw new MenuServiceError(
        MenuErrorCode.MAX_DEPTH_EXCEEDED,
        '메뉴 계층은 최대 3단계까지 허용됩니다',
        400
      )
    }
    // 부모 메뉴 조회...
  }
}
```

### 3.3 BR-005: 순환 참조 금지

```typescript
// menu.service.ts - validateNoCircularReference()
private async validateNoCircularReference(
  menuId: number,
  newParentId: number | null
): Promise<void> {
  if (menuId === newParentId) {
    throw new MenuServiceError(
      MenuErrorCode.CIRCULAR_REFERENCE,
      '자기 자신을 부모로 지정할 수 없습니다',
      400
    )
  }
  // 순환 참조 검증...
}
```

### 3.4 BR-006: 자식 메뉴 삭제 보호

```typescript
// menu.service.ts - validateNoChildren()
private async validateNoChildren(menuId: number): Promise<void> {
  const childCount = await prisma.menu.count({
    where: { parentId: menuId },
  })
  if (childCount > 0) {
    throw new MenuServiceError(
      MenuErrorCode.HAS_CHILDREN,
      '하위 메뉴가 있어 삭제할 수 없습니다',
      400
    )
  }
}
```

---

## 4. 입력 검증 규칙

| 필드 | 규칙 | 정규식/조건 |
|------|------|-------------|
| code | 대문자 영문, 숫자, 언더스코어 | `^[A-Z][A-Z0-9_]*$` |
| code | 최대 50자 | `length <= 50` |
| name | 최대 50자, HTML 특수문자 금지 | `<`, `>`, `&` 제외 |
| path | /portal/로 시작 | `^\/portal\/[a-z0-9\-\/]+$` |
| path | javascript:, // 금지 | Path traversal 방지 |
| icon | 허용 목록 기반 | ALLOWED_ICONS 배열 |
| sortOrder | 0 이상 | `>= 0` |

---

## 5. 초기 시드 데이터

| ID | 코드 | 이름 | 단계 | 부모 |
|----|------|------|------|------|
| 1 | DASHBOARD | 대시보드 | 1 | - |
| 2 | DASHBOARD_MAIN | 메인 대시보드 | 2 | 1 |
| 10 | PRODUCTION | 생산 관리 | 1 | - |
| 11 | WORK_ORDER | 작업 지시 | 2 | 10 |
| 12 | PRODUCTION_RESULT | 실적 관리 | 2 | 10 |
| 13 | PRODUCTION_ENTRY | 생산 실적 입력 | 3 | 12 |
| 14 | PRODUCTION_HISTORY | 생산 이력 조회 | 3 | 12 |
| 20 | SAMPLE | 샘플 화면 | 1 | - |
| 21 | SAMPLE_USER_LIST | 사용자 목록 | 2 | 20 |
| 22 | SAMPLE_MASTER_DETAIL | 마스터-디테일 | 2 | 20 |
| 23 | SAMPLE_WIZARD | 설정 마법사 | 2 | 20 |
| 90 | SYSTEM | 시스템 관리 | 1 | - |
| 91 | USER_MGMT | 사용자 관리 | 2 | 90 |
| 92 | ROLE_MGMT | 역할 관리 | 2 | 90 |
| 93 | MENU_MGMT | 메뉴 관리 | 2 | 90 |
| 99 | INACTIVE_MENU | 비활성 메뉴 | 1 | - |

---

## 6. 테스트 결과

### 6.1 단위 테스트 (TDD)

| 항목 | 값 |
|------|-----|
| 총 테스트 수 | 27 |
| 성공 | 27 |
| 실패 | 0 |
| 통과율 | 100% |

- 테스트 파일: `lib/services/__tests__/menu.service.spec.ts`
- 결과서: `070-tdd-test-results.md`

### 6.2 E2E 테스트

| 항목 | 값 |
|------|-----|
| 총 테스트 수 | 11 |
| 성공 | 11 |
| 실패 | 0 |
| 통과율 | 100% |

- 테스트 파일: `tests/e2e/api/menus.spec.ts`
- 결과서: `070-e2e-test-results.md`

### 6.3 요구사항 커버리지

| 구분 | 총 항목 | 커버 | 커버리지 |
|------|---------|------|---------|
| 기능 요구사항 (FR) | 5 | 5 | 100% |
| 비즈니스 규칙 (BR) | 6 | 6 | 100% |

---

## 7. 의존성

### 7.1 선행 의존성

| Task ID | 제목 | 상태 |
|---------|------|------|
| TSK-04-01 | Prisma 및 SQLite 설정 | 완료 |

### 7.2 후속 의존성

| Task ID | 제목 | 영향 |
|---------|------|------|
| TSK-03-02 | 역할-메뉴 매핑 | Menu 모델 사용 |
| TSK-03-03 | 메뉴 API 엔드포인트 | API 확장 |
| TSK-01-03 | 사이드바 메뉴 컴포넌트 | API 호출 |

---

## 8. 제한사항 및 TODO

### 8.1 인증 미적용

현재 API는 인증 없이 접근 가능합니다. TSK-04-03 (Auth.js 인증 설정) 완료 후 인증 미들웨어를 적용해야 합니다.

```typescript
// TODO: Auth.js 세션 검증 (TSK-04-03에서 구현)
// const session = await getServerSession(authOptions)
// if (!session) {
//   return NextResponse.json({ ... }, { status: 401 })
// }
```

### 8.2 관리자 기능

메뉴 CRUD API (POST, PUT, DELETE)는 구현되어 있으나, 관리자 화면은 Phase 2에서 구현 예정입니다.

---

## 9. 결론

TSK-03-01 "메뉴 데이터 모델" 구현이 완료되었습니다.

- Prisma Menu 모델 및 시드 데이터 구현
- MenuService 비즈니스 로직 (6개 규칙) 구현
- API 엔드포인트 (CRUD) 구현
- 단위 테스트 27건, E2E 테스트 11건 모두 통과
- 기능 요구사항 및 비즈니스 규칙 100% 커버

---

<!--
TSK-03-01 구현 보고서
Version: 1.0
Created: 2026-01-21
-->
