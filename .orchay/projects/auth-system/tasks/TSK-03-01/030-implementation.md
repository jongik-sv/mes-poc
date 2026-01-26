# 구현 문서 (030-implementation.md)

**Task ID:** TSK-03-01
**Task명:** 역할/권한 CRUD API
**Last Updated:** 2026-01-26

---

## 1. 구현 개요

TSK-03-01에서는 RBAC 기반 역할/권한 관리를 위한 REST API를 구현했습니다.

### 1.1 구현된 API 목록

| Method | Endpoint | 설명 | 구현 파일 |
|--------|----------|------|----------|
| GET | /api/roles | 역할 목록 조회 | app/api/roles/route.ts |
| POST | /api/roles | 역할 생성 | app/api/roles/route.ts |
| GET | /api/roles/:id | 역할 상세 조회 | app/api/roles/[id]/route.ts |
| PUT | /api/roles/:id | 역할 수정 | app/api/roles/[id]/route.ts |
| DELETE | /api/roles/:id | 역할 삭제 | app/api/roles/[id]/route.ts |
| PUT | /api/roles/:id/permissions | 역할-권한 매핑 | app/api/roles/[id]/permissions/route.ts |
| GET | /api/permissions | 권한 목록 조회 | app/api/permissions/route.ts |
| POST | /api/permissions | 권한 생성 | app/api/permissions/route.ts |
| GET | /api/permissions/:id | 권한 상세 조회 | app/api/permissions/[id]/route.ts |
| PUT | /api/permissions/:id | 권한 수정 | app/api/permissions/[id]/route.ts |
| DELETE | /api/permissions/:id | 권한 삭제 | app/api/permissions/[id]/route.ts |
| PUT | /api/users/:id/roles | 사용자-역할 할당 | app/api/users/[id]/roles/route.ts |

---

## 2. 핵심 구현 사항

### 2.1 인증/인가

모든 API는 다음과 같은 인증/인가 처리를 수행합니다:

```typescript
// 세션 검증
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ ... }, { status: 401 })
}

// 관리자 권한 확인 (쓰기 작업)
const user = await prisma.user.findUnique({
  where: { id: parseInt(session.user.id) },
  include: { userRoles: { include: { role: true } } },
})
const isAdmin = user?.userRoles.some((ur) => ur.role.code === 'SYSTEM_ADMIN')
if (!isAdmin) {
  return NextResponse.json({ ... }, { status: 403 })
}
```

### 2.2 역할 계층 레벨 자동 계산

역할 생성/수정 시 parentId가 지정되면 부모 역할의 level + 1로 자동 계산:

```typescript
let level = 0
if (body.parentId) {
  const parent = await prisma.role.findUnique({
    where: { id: body.parentId },
  })
  if (parent) {
    level = parent.level + 1
  }
}
```

### 2.3 시스템 역할 보호 (BR-03-01)

시스템 역할(isSystem=true)은 삭제할 수 없습니다:

```typescript
if (existing.isSystem) {
  return NextResponse.json({
    success: false,
    error: {
      code: 'SYSTEM_ROLE_DELETE',
      message: '시스템 역할은 삭제할 수 없습니다',
    },
  }, { status: 400 })
}
```

### 2.4 감사 로그

모든 CUD 작업에 대해 감사 로그를 생성합니다:

```typescript
await prisma.auditLog.create({
  data: {
    userId: parseInt(session.user.id),
    action: 'ROLE_CREATE', // ROLE_UPDATE, ROLE_DELETE 등
    resource: 'Role',
    resourceId: String(role.id),
    details: JSON.stringify({ code: role.code, name: role.name }),
    status: 'SUCCESS',
  },
})
```

---

## 3. 파일 구조

```
app/api/
├── roles/
│   ├── route.ts              # GET 목록, POST 생성
│   ├── [id]/
│   │   ├── route.ts          # GET 상세, PUT 수정, DELETE 삭제
│   │   └── permissions/
│   │       └── route.ts      # PUT 역할-권한 매핑
│   └── __tests__/
│       └── route.test.ts     # 역할 API 테스트 (22개)
├── permissions/
│   ├── route.ts              # GET 목록, POST 생성
│   ├── [id]/
│   │   └── route.ts          # GET 상세, PUT 수정, DELETE 삭제
│   └── __tests__/
│       └── route.test.ts     # 권한 API 테스트 (18개)
└── users/
    └── [id]/
        └── roles/
            ├── route.ts      # PUT 사용자-역할 할당
            └── __tests__/
                └── route.test.ts  # 사용자-역할 테스트 (6개)
```

---

## 4. 테스트 결과

```
 ✓ app/api/roles/__tests__/route.test.ts (22 tests) 35ms
 ✓ app/api/permissions/__tests__/route.test.ts (18 tests) 30ms
 ✓ app/api/roles/[id]/permissions/__tests__/route.test.ts (6 tests)
 ✓ app/api/users/[id]/roles/__tests__/route.test.ts (6 tests)

Test Files: 4 passed
Tests: 52 passed
```

---

## 5. 빌드 결과

```
✓ Compiled successfully

Route (app)
├ ƒ /api/permissions
├ ƒ /api/permissions/[id]
├ ƒ /api/roles
├ ƒ /api/roles/[id]
├ ƒ /api/roles/[id]/permissions
├ ƒ /api/users/[id]/roles
```

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|-----|------|--------|----------|
| 1.0 | 2026-01-26 | Claude | 최초 작성 |
