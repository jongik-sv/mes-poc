# TSK-02-01: System / MenuSet / Menu CRUD APIs 설계 문서

**작성일**: 2026-01-27
**프로젝트**: RBAC 리디자인
**마일스톤**: Phase 2 - API 구현
**상태**: 설계 완료

---

## 1. 개요

TSK-02-01은 RBAC 리디자인의 핵심 API 구현 작업입니다. System, MenuSet, Menu의 CRUD 엔드포인트를 구현하여 관리 시스템의 기본 기능을 제공합니다.

### 1.1 목표
- System, MenuSet, Menu의 완전한 CRUD API 구현
- 기존 auth() 및 권한 검증 패턴 준수
- 일관된 응답 포맷 및 에러 처리
- 감사 로그(Audit Log) 기록

### 1.2 범위
```
✅ System API (/api/systems)
   - GET /api/systems (목록)
   - POST /api/systems (생성)
   - GET /api/systems/:id (상세)
   - PUT /api/systems/:id (수정)
   - DELETE /api/systems/:id (삭제)

✅ MenuSet API (/api/menu-sets)
   - GET /api/menu-sets (목록)
   - POST /api/menu-sets (생성)
   - GET /api/menu-sets/:id (상세)
   - PUT /api/menu-sets/:id (수정)
   - DELETE /api/menu-sets/:id (삭제)
   - POST /api/menu-sets/:id/menus (메뉴 할당)
   - GET /api/menu-sets/:id/menus (할당된 메뉴 목록)

✅ Menu API (/api/menus)
   - 기존 API 유지 + 스키마 업데이트
   - systemId 필수 처리
   - menuCd 중복 검증
```

---

## 2. API 상세 명세

### 2.1 System API (`/api/systems`)

#### 2.1.1 GET /api/systems - 시스템 목록 조회

**요청**
```
GET /api/systems?page=1&pageSize=10&search=mes&isActive=true

Query Parameters:
- page: number (기본값: 1)
- pageSize: number (기본값: 10)
- search: string (systemId, name, domain 포함 검색)
- isActive: boolean (활성 상태 필터)
```

**응답 성공 (200)**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "systemId": "mes-factory1",
        "name": "MES Factory 1",
        "domain": "mes1.example.com",
        "description": "첫 번째 공장 MES",
        "isActive": true,
        "menuSetCount": 3,
        "userCount": 45,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

**응답 실패 (401)**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "인증이 필요합니다"
  }
}
```

**검증 규칙**
- 인증 필수 (Auth.js session)
- 사용자 활성 상태 확인
- 관리자(SYSTEM_ADMIN) 권한 필수

---

#### 2.1.2 POST /api/systems - 시스템 생성

**요청**
```json
{
  "systemId": "mes-factory1",
  "name": "MES Factory 1",
  "domain": "mes1.example.com",
  "description": "첫 번째 공장 MES",
  "isActive": true
}
```

**요청 필드 검증**
| 필드 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| systemId | String | O | 1-50자, 영문/숫자/하이픈 | 시스템 ID (PK) |
| name | String | O | 1-100자 | 시스템명 |
| domain | String | O | 유효한 도메인, UNIQUE | 도메인 (UNIQUE) |
| description | String | X | 0-500자 | 설명 |
| isActive | Boolean | X | - | 활성 상태 (기본: true) |

**응답 성공 (201)**
```json
{
  "success": true,
  "data": {
    "systemId": "mes-factory1",
    "name": "MES Factory 1",
    "domain": "mes1.example.com",
    "description": "첫 번째 공장 MES",
    "isActive": true,
    "menuSetCount": 0,
    "userCount": 0,
    "createdAt": "2024-01-27T00:00:00Z",
    "updatedAt": "2024-01-27T00:00:00Z"
  }
}
```

**응답 실패 - 중복 systemId (409)**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_SYSTEM_ID",
    "message": "이미 존재하는 시스템 ID입니다"
  }
}
```

**응답 실패 - 중복 domain (409)**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_DOMAIN",
    "message": "이미 존재하는 도메인입니다"
  }
}
```

**응답 실패 - 검증 실패 (400)**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "systemId는 필수입니다"
  }
}
```

**검증 규칙**
- systemId 형식: /^[a-zA-Z0-9-]{1,50}$/
- domain 형식: 유효한 도메인 (RFC 1123)
- 모든 필드 값 트림 처리
- domain UNIQUE 제약 확인

---

#### 2.1.3 GET /api/systems/:id - 시스템 상세 조회

**요청**
```
GET /api/systems/mes-factory1
```

**응답 성공 (200)**
```json
{
  "success": true,
  "data": {
    "systemId": "mes-factory1",
    "name": "MES Factory 1",
    "domain": "mes1.example.com",
    "description": "첫 번째 공장 MES",
    "isActive": true,
    "menuSetCount": 3,
    "userCount": 45,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z",
    "relatedData": {
      "menuSets": [
        {
          "menuSetId": 1,
          "menuSetCd": "DEFAULT",
          "name": "기본 메뉴셋",
          "menuCount": 15
        }
      ],
      "roleGroups": [
        {
          "roleGroupId": 1,
          "roleGroupCd": "FACTORY_ADMIN",
          "name": "공장 관리자"
        }
      ]
    }
  }
}
```

**응답 실패 - 시스템 없음 (404)**
```json
{
  "success": false,
  "error": {
    "code": "SYSTEM_NOT_FOUND",
    "message": "시스템을 찾을 수 없습니다"
  }
}
```

---

#### 2.1.4 PUT /api/systems/:id - 시스템 수정

**요청**
```json
{
  "name": "MES Factory 1 Updated",
  "description": "업데이트된 설명",
  "isActive": false
}
```

**요청 필드 검증**
| 필드 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| name | String | X | 1-100자 | 시스템명 |
| description | String | X | 0-500자 | 설명 |
| isActive | Boolean | X | - | 활성 상태 |

**응답 성공 (200)**
```json
{
  "success": true,
  "data": {
    "systemId": "mes-factory1",
    "name": "MES Factory 1 Updated",
    "domain": "mes1.example.com",
    "description": "업데이트된 설명",
    "isActive": false,
    "menuSetCount": 3,
    "userCount": 45,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-27T12:00:00Z"
  }
}
```

**비즈니스 규칙**
- systemId, domain 수정 불가
- isActive를 false로 변경하는 경우:
  - 활성 사용자가 있는 경우 경고 반환
  - RoleGroup, Menu는 함께 비활성화
- domain 중복 검증 제외 (자신의 domain)

---

#### 2.1.5 DELETE /api/systems/:id - 시스템 삭제

**요청**
```
DELETE /api/systems/mes-factory1
```

**응답 성공 (200)**
```json
{
  "success": true,
  "data": {
    "message": "시스템이 삭제되었습니다"
  }
}
```

**응답 실패 - 활성 사용자 존재 (409)**
```json
{
  "success": false,
  "error": {
    "code": "SYSTEM_IN_USE",
    "message": "활성 사용자가 이 시스템을 사용 중입니다. 먼저 사용자를 비활성화하세요."
  }
}
```

**비즈니스 규칙**
- 활성 상태인 시스템 삭제 불가 (먼저 isActive=false로 변경)
- 활성 사용자가 있는 시스템 삭제 불가
- 하위 MenuSet, Menu, RoleGroup는 Cascade 삭제
- 감사 로그 기록

---

### 2.2 MenuSet API (`/api/menu-sets`)

#### 2.2.1 GET /api/menu-sets - 메뉴셋 목록 조회

**요청**
```
GET /api/menu-sets?page=1&pageSize=10&systemId=mes-factory1&search=menu&isActive=true

Query Parameters:
- page: number (기본값: 1)
- pageSize: number (기본값: 10)
- systemId: string (필수) - 시스템 필터
- search: string (menuSetCd, name 포함 검색)
- isActive: boolean (활성 상태 필터)
- isDefault: boolean (기본 메뉴셋 필터)
```

**응답 성공 (200)**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "menuSetId": 1,
        "menuSetCd": "DEFAULT",
        "name": "기본 메뉴셋",
        "description": "모든 사용자용 기본 메뉴",
        "systemId": "mes-factory1",
        "isDefault": true,
        "isActive": true,
        "menuCount": 15,
        "userCount": 42,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

**검증 규칙**
- systemId 필수
- 시스템 존재 확인
- 인증 필수, 관리자 권한 필수

---

#### 2.2.2 POST /api/menu-sets - 메뉴셋 생성

**요청**
```json
{
  "systemId": "mes-factory1",
  "menuSetCd": "ADMIN_MENU",
  "name": "관리자 메뉴셋",
  "description": "관리자용 메뉴",
  "isDefault": false,
  "isActive": true
}
```

**요청 필드 검증**
| 필드 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| systemId | String | O | 존재하는 시스템 | 시스템 ID |
| menuSetCd | String | O | UNIQUE, 1-50자 | 메뉴셋 코드 |
| name | String | O | 1-100자 | 메뉴셋명 |
| description | String | X | 0-500자 | 설명 |
| isDefault | Boolean | X | - | 기본 메뉴셋 여부 (기본: false) |
| isActive | Boolean | X | - | 활성 상태 (기본: true) |

**응답 성공 (201)**
```json
{
  "success": true,
  "data": {
    "menuSetId": 2,
    "menuSetCd": "ADMIN_MENU",
    "name": "관리자 메뉴셋",
    "description": "관리자용 메뉴",
    "systemId": "mes-factory1",
    "isDefault": false,
    "isActive": true,
    "menuCount": 0,
    "userCount": 0,
    "createdAt": "2024-01-27T00:00:00Z",
    "updatedAt": "2024-01-27T00:00:00Z"
  }
}
```

**비즈니스 규칙**
- menuSetCd UNIQUE 제약 (시스템 내)
- isDefault=true인 경우, 기존 기본값은 자동으로 false로 변경
- systemId 존재 확인 (FK 검증)

---

#### 2.2.3 GET /api/menu-sets/:id - 메뉴셋 상세 조회

**요청**
```
GET /api/menu-sets/1
```

**응답 성공 (200)**
```json
{
  "success": true,
  "data": {
    "menuSetId": 1,
    "menuSetCd": "DEFAULT",
    "name": "기본 메뉴셋",
    "description": "모든 사용자용 기본 메뉴",
    "systemId": "mes-factory1",
    "isDefault": true,
    "isActive": true,
    "menuCount": 15,
    "userCount": 42,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  }
}
```

---

#### 2.2.4 PUT /api/menu-sets/:id - 메뉴셋 수정

**요청**
```json
{
  "name": "기본 메뉴셋 (Updated)",
  "description": "업데이트된 설명",
  "isDefault": false,
  "isActive": true
}
```

**응답 성공 (200)**
```json
{
  "success": true,
  "data": {
    "menuSetId": 1,
    "menuSetCd": "DEFAULT",
    "name": "기본 메뉴셋 (Updated)",
    "description": "업데이트된 설명",
    "systemId": "mes-factory1",
    "isDefault": false,
    "isActive": true,
    "menuCount": 15,
    "userCount": 42,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-27T12:00:00Z"
  }
}
```

**비즈니스 규칙**
- menuSetCd 수정 불가
- isDefault=true로 변경 시, 기존 기본값 자동 변경
- 활성 사용자가 있는 경우 isActive=false 변경 불가 (경고)

---

#### 2.2.5 DELETE /api/menu-sets/:id - 메뉴셋 삭제

**요청**
```
DELETE /api/menu-sets/1
```

**응답 성공 (200)**
```json
{
  "success": true,
  "data": {
    "message": "메뉴셋이 삭제되었습니다"
  }
}
```

**응답 실패 - 활성 사용자 존재 (409)**
```json
{
  "success": false,
  "error": {
    "code": "MENU_SET_IN_USE",
    "message": "활성 사용자가 이 메뉴셋을 사용 중입니다"
  }
}
```

**비즈니스 규칙**
- 활성 사용자가 할당받은 메뉴셋 삭제 불가
- MenuSetMenu Cascade 삭제
- UserSystemMenuSet Cascade 삭제
- 감사 로그 기록

---

#### 2.2.6 POST /api/menu-sets/:id/menus - 메뉴 할당

**요청**
```json
{
  "menuIds": [1, 2, 3, 5]
}
```

**요청 필드 검증**
| 필드 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| menuIds | number[] | O | 최소 1개 | 할당할 메뉴 ID 배열 |

**응답 성공 (200)**
```json
{
  "success": true,
  "data": {
    "menuSetId": 1,
    "assignedCount": 4,
    "assignedMenus": [
      {
        "menuId": 1,
        "menuCd": "DASHBOARD",
        "name": "대시보드",
        "category": "기본",
        "sortOrder": "10"
      },
      {
        "menuId": 2,
        "menuCd": "PRODUCTION",
        "name": "생산관리",
        "category": "생산",
        "sortOrder": "20"
      }
    ]
  }
}
```

**비즈니스 규칙**
- 메뉴셋 존재 확인
- 모든 menuId 존재 확인 (systemId 일치 확인)
- 이미 할당된 메뉴는 스킵
- 중복된 menuId 제거
- 새로운 할당만 MenuSetMenuHistory 기록

---

#### 2.2.7 GET /api/menu-sets/:id/menus - 할당된 메뉴 목록

**요청**
```
GET /api/menu-sets/1/menus?page=1&pageSize=20&search=생산

Query Parameters:
- page: number (기본값: 1)
- pageSize: number (기본값: 20)
- search: string (menuCd, name, category 포함 검색)
```

**응답 성공 (200)**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "menuId": 1,
        "menuCd": "PRODUCTION",
        "name": "생산관리",
        "category": "생산/실적",
        "path": "/production/actual",
        "icon": "BarChart",
        "sortOrder": "20",
        "isActive": true,
        "assignedAt": "2024-01-15T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

---

### 2.3 Menu API (`/api/menus`)

#### 2.3.1 GET /api/menus - 메뉴 목록 조회 (업데이트)

**기존 동작 유지**
- 사용자별 계층형 메뉴 조회 (systemId 필터)
- 비활성 메뉴 제외

**변경 사항**
```
Query Parameters 추가:
- systemId: string (필수)
- categoryPath: string (카테고리 경로로 필터, 예: "생산/실적")
- isActive: boolean (활성 상태 필터)
```

---

#### 2.3.2 POST /api/menus - 메뉴 생성 (업데이트)

**요청**
```json
{
  "systemId": "mes-factory1",
  "menuCd": "DASHBOARD",
  "name": "대시보드",
  "category": "기본",
  "path": "/dashboard",
  "icon": "Home",
  "sortOrder": "10",
  "isActive": true
}
```

**요청 필드 검증**
| 필드 | 타입 | 필수 | 제약 | 설명 |
|------|------|------|------|------|
| systemId | String | O | 존재하는 시스템 | 시스템 ID |
| menuCd | String | O | UNIQUE, 1-50자 | 메뉴 코드 |
| name | String | O | 1-100자 | 메뉴명 |
| category | String | O | 1-100자 (슬래시로 구분) | 카테고리 (경로) |
| path | String | X | 유효한 URL 패턴 | 라우트 경로 |
| icon | String | X | 0-50자 | 아이콘 (Ant Design icon name) |
| sortOrder | String | X | 기본값 "100" | 정렬 순서 (문자열) |
| isActive | Boolean | X | 기본값 true | 활성 상태 |

**새로운 검증 규칙**
- systemId 필수 (기존에는 선택사항)
- menuCd UNIQUE 제약 (시스템 내)
- category 슬래시 기반 경로 (예: "생산/실적" → 계층 구조)
- sortOrder 문자열 기반 (50은 10과 100 사이에 위치)

**응답 성공 (201)**
```json
{
  "success": true,
  "data": {
    "menuId": 1,
    "systemId": "mes-factory1",
    "menuCd": "DASHBOARD",
    "name": "대시보드",
    "category": "기본",
    "path": "/dashboard",
    "icon": "Home",
    "sortOrder": "10",
    "isActive": true,
    "createdAt": "2024-01-27T00:00:00Z",
    "updatedAt": "2024-01-27T00:00:00Z"
  }
}
```

---

#### 2.3.3 GET /api/menus/:id - 메뉴 상세 조회 (유지)

기존 동작 유지

---

#### 2.3.4 PUT /api/menus/:id - 메뉴 수정 (업데이트)

**요청**
```json
{
  "name": "대시보드 (Updated)",
  "category": "기본/메인",
  "path": "/dashboard/main",
  "icon": "Home",
  "sortOrder": "5",
  "isActive": true
}
```

**수정 불가 필드**
- systemId
- menuCd

**응답 성공 (200)**
```json
{
  "success": true,
  "data": {
    "menuId": 1,
    "systemId": "mes-factory1",
    "menuCd": "DASHBOARD",
    "name": "대시보드 (Updated)",
    "category": "기본/메인",
    "path": "/dashboard/main",
    "icon": "Home",
    "sortOrder": "5",
    "isActive": true,
    "createdAt": "2024-01-27T00:00:00Z",
    "updatedAt": "2024-01-27T12:00:00Z"
  }
}
```

---

#### 2.3.5 DELETE /api/menus/:id - 메뉴 삭제 (유지)

**비즈니스 규칙**
- Permission이 참조하는 메뉴 삭제 불가
- MenuSetMenu Cascade 삭제
- 감사 로그 기록

---

## 3. 에러 코드 정의

| 에러 코드 | HTTP 상태 | 설명 |
|----------|-----------|------|
| UNAUTHORIZED | 401 | 인증되지 않음 |
| FORBIDDEN | 403 | 권한 부족 (관리자 아님) |
| USER_INACTIVE | 403 | 비활성 사용자 |
| VALIDATION_ERROR | 400 | 입력값 검증 실패 |
| DUPLICATE_SYSTEM_ID | 409 | 중복 systemId |
| DUPLICATE_DOMAIN | 409 | 중복 domain |
| DUPLICATE_MENU_SET_CD | 409 | 중복 menuSetCd |
| DUPLICATE_MENU_CD | 409 | 중복 menuCd |
| SYSTEM_NOT_FOUND | 404 | 시스템 없음 |
| MENU_SET_NOT_FOUND | 404 | 메뉴셋 없음 |
| MENU_NOT_FOUND | 404 | 메뉴 없음 |
| SYSTEM_IN_USE | 409 | 활성 사용자 있음 |
| MENU_SET_IN_USE | 409 | 활성 사용자 있음 |
| PERMISSION_REFERENCED | 409 | 권한에서 참조 중 |
| DB_ERROR | 500 | 데이터베이스 오류 |

---

## 4. 파일 구조

```
mes-portal/
├── app/
│   └── api/
│       ├── systems/
│       │   ├── route.ts              # GET, POST
│       │   └── [id]/
│       │       └── route.ts          # GET, PUT, DELETE
│       ├── menu-sets/
│       │   ├── route.ts              # GET, POST
│       │   └── [id]/
│       │       ├── route.ts          # GET, PUT, DELETE
│       │       └── menus/
│       │           ├── route.ts      # GET (목록), POST (할당)
│       │           └── [menuId]/
│       │               └── route.ts  # DELETE (할당 제거, 선택사항)
│       └── menus/
│           ├── route.ts              # GET (업데이트), POST (업데이트)
│           └── [id]/
│               └── route.ts          # GET, PUT, DELETE (유지)
└── lib/
    ├── services/
    │   ├── system.service.ts         # System 비즈니스 로직
    │   ├── menu-set.service.ts       # MenuSet 비즈니스 로직
    │   └── menu.service.ts           # Menu 비즈니스 로직 (확장)
    └── types/
        ├── system.ts                 # System DTO & Response 타입
        ├── menu-set.ts               # MenuSet DTO & Response 타입
        └── menu.ts                   # Menu 타입 (확장)
```

---

## 5. 공통 구현 패턴

### 5.1 인증 및 권한 검증

```typescript
// 1. 세션 검증
const session = await auth()
if (!session?.user?.id) {
  return unauthorized()
}

// 2. 사용자 활성 상태 확인
const user = await prisma.user.findUnique({
  where: { userId: session.user.id },
  select: { userId: true, isActive: true }
})
if (!user?.isActive) {
  return userInactive()
}

// 3. 관리자 권한 확인
const isAdmin = user.userRoleGroups.some((urg) =>
  urg.roleGroup.roleGroupRoles.some((rgr) => rgr.role.roleCd === 'SYSTEM_ADMIN')
)
if (!isAdmin) {
  return forbidden()
}
```

### 5.2 응답 포맷

```typescript
// 성공
return NextResponse.json({
  success: true,
  data: { /* 데이터 */ }
}, { status: 200 })

// 실패
return NextResponse.json({
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: '에러 메시지'
  }
}, { status: 400 })
```

### 5.3 감사 로그

```typescript
// 모든 변경 작업(POST, PUT, DELETE) 후
await prisma.auditLog.create({
  data: {
    userId: session.user.id,
    action: 'SYSTEM_CREATE', // 또는 UPDATE, DELETE
    resource: 'System',
    resourceId: systemId,
    details: JSON.stringify({ /* 변경 정보 */ }),
    status: 'SUCCESS'
  }
})
```

### 5.4 선분 이력 (SCD Type 2) 기록

```typescript
// Master 테이블 변경 시
await prisma.systemHistory.create({
  data: {
    systemId: system.systemId,
    name: system.name,
    domain: system.domain,
    description: system.description,
    isActive: system.isActive,
    changeType: 'UPDATE', // CREATE, UPDATE, DELETE
    changedBy: session.user.id
  }
})
```

---

## 6. 입력 검증 규칙

### 6.1 필드 검증

**필수 필드 검증**
- 필드 존재 확인
- null/undefined 체크
- 빈 문자열 트림 후 재확인

**형식 검증**
- 길이 제약 (min, max)
- 정규식 패턴
- 이메일, 도메인 등 특수 형식

**중복 검증**
- 데이터베이스 조회
- UNIQUE 제약 위반 감지

**FK 검증**
- 참조 테이블 존재 확인
- systemId 일치 확인

### 6.2 검증 실패 응답

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "[필드명] 필드에 오류가 있습니다: [상세 오류]"
  }
}
```

---

## 7. 비즈니스 규칙

### 7.1 System
- **생성**: systemId, domain UNIQUE
- **수정**: systemId, domain 수정 불가, isActive=false 시 관련 menuSet/menu도 비활성화
- **삭제**: 활성 상태 불가, 활성 사용자 존재 불가

### 7.2 MenuSet
- **생성**: menuSetCd UNIQUE (systemId 내), isDefault=true 시 기존 기본값 변경
- **수정**: menuSetCd 수정 불가, isDefault 변경 시 기존값 갱신
- **삭제**: 활성 사용자 사용 중이면 불가

### 7.3 Menu
- **생성**: menuCd UNIQUE (systemId 내), systemId 필수
- **수정**: systemId, menuCd 수정 불가
- **삭제**: Permission에서 참조 중이면 불가

### 7.4 MenuSet-Menu 관계
- **할당**: 이미 할당된 메뉴는 스킵
- **해제**: 필요시 개별 DELETE 엔드포인트 제공
- **계층 유지**: sortOrder 기반 정렬

---

## 8. 성능 최적화

### 8.1 쿼리 최적화
- `_count`를 사용한 관계 개수 조회
- 필요한 필드만 `select`로 조회
- 대량 조회 시 pagination 강제

### 8.2 인덱스 활용
- systemId, menuSetCd, menuCd에 이미 정의된 인덱스 사용
- 검색 쿼리 최적화

### 8.3 캐시 전략
- 사용자별 메뉴셋 조회 후 세션 캐시 고려
- 시스템 목록은 변경 빈도 낮음 → 캐시 후보

---

## 9. 테스트 전략

### 9.1 단위 테스트 (Unit Tests)
- 각 Service 클래스 메서드별 단위 테스트
- Mock을 사용한 DB 의존성 제거
- 검증 규칙 테스트

### 9.2 통합 테스트 (Integration Tests)
- 엔드포인트별 정상/실패 케이스
- 권한 검증 테스트
- 감사 로그 기록 검증

### 9.3 테스트 파일 위치
```
mes-portal/
├── app/api/systems/__tests__/
│   └── route.spec.ts
├── app/api/menu-sets/__tests__/
│   └── route.spec.ts
└── lib/services/__tests__/
    ├── system.service.spec.ts
    ├── menu-set.service.spec.ts
    └── menu.service.spec.ts
```

---

## 10. 보안 고려사항

### 10.1 인증
- 모든 엔드포인트에서 Auth.js 세션 검증 필수
- 유효한 토큰 확인

### 10.2 권한
- SYSTEM_ADMIN 역할 필수 확인
- 사용자 활성 상태 확인

### 10.3 데이터 보호
- 감사 로그로 모든 변경 추적
- 선분 이력으로 데이터 변경 이력 관리
- SQL Injection 방지 (Prisma 사용)

### 10.4 속도 제한 (Rate Limiting)
- 향후 구현 고려사항
- 관리자 API이므로 초기 생략 가능

---

## 11. 배포 및 운영

### 11.1 마이그레이션
- Prisma schema 변경 완료 (이미 적용됨)
- `prisma db push` 또는 migration 파일 생성

### 11.2 모니터링
- 에러 로그 수집 (Sentry 등)
- 감사 로그 분석
- API 성능 모니터링

### 11.3 롤백 계획
- History 테이블 활용한 데이터 복구
- API 버전 관리 준비

---

## 12. 참고 자료

- **Prisma 스키마**: `/home/jji/project/mes-poc/mes-portal/prisma/schema.prisma`
- **기존 Menu API**: `/home/jji/project/mes-poc/mes-portal/app/api/menus/route.ts`
- **기존 Role API**: `/home/jji/project/mes-poc/mes-portal/app/api/roles/route.ts`
- **Auth 패턴**: `/home/jji/project/mes-poc/mes-portal/lib/auth/__tests__/auth.spec.ts`

---

## 변경 이력

| 날짜 | 버전 | 변경사항 |
|------|------|---------|
| 2026-01-27 | 1.0 | 초안 작성 |
