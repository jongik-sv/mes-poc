# Auth System - 기술 요구사항 정의서 (TRD)

## 프로젝트 개요

| 항목 | 내용 |
|-----|------|
| 프로젝트명 | Auth System - RBAC 기반 AAA 권한 관리 시스템 |
| 상위 프로젝트 | MES Portal (통합 모듈) |
| 복잡도 등급 | **Standard (Tier 2)** |
| 타겟 사용자 | 시스템 관리자, 보안 관리자, 일반 사용자 |
| 동시 접속자 | 1,000명 이상 |
| 보안 수준 | **High** (엔터프라이즈 보안 요구) |

---

## 1. 핵심 기술 스택

### 1.1 인증 (Authentication) 기술 스택

| 구분 | 기술 | 버전 | 선정 근거 | 대안 검토 |
|-----|------|------|----------|----------|
| 인증 프레임워크 | **Auth.js (NextAuth v5)** | 5.x | Next.js 네이티브 통합, JWT/세션 유연성 | Lucia Auth (설정 복잡), Clerk (클라우드 의존) |
| 토큰 형식 | **JWT (JSON Web Token)** | - | Stateless 인증, 확장성 우수 | 세션 기반 (서버 부하) |
| 비밀번호 해싱 | **bcrypt** | 5.x | 업계 표준, salt 자동 생성 | argon2 (설정 복잡), scrypt |
| 토큰 서명 | **RS256 (RSA-SHA256)** | - | 비대칭 키, 토큰 검증 분리 가능 | HS256 (대칭 키, 단순) |

### 1.2 인가 (Authorization) 기술 스택

| 구분 | 기술 | 버전 | 선정 근거 |
|-----|------|------|----------|
| 권한 모델 | **RBAC (Role-Based Access Control)** | - | 역할 기반 관리, 확장성 |
| 데이터 모델링 | **Prisma ORM** | 7.x | TypeScript 네이티브, 자동 타입 생성 |
| 미들웨어 | **Next.js Middleware** | - | Edge 런타임, 빠른 권한 검사 |
| 권한 체크 라이브러리 | **CASL** | 6.x | 세밀한 권한 제어, TypeScript 지원 |

### 1.3 감사 로그 (Accounting) 기술 스택

| 구분 | 기술 | 버전 | 선정 근거 |
|-----|------|------|----------|
| 로깅 라이브러리 | **Pino** | 9.x | 고성능, JSON 출력, 낮은 오버헤드 |
| 로그 저장 | **Prisma + SQLite/PostgreSQL** | - | 구조화된 로그 쿼리 |
| 로그 분석 | **자체 구현** | - | 대시보드 내 조회 화면 |

### 1.4 보안 라이브러리

| 구분 | 기술 | 버전 | 용도 |
|-----|------|------|------|
| 입력 검증 | **zod** | 3.x | 스키마 기반 유효성 검사 |
| XSS 방지 | **DOMPurify** | 3.x | HTML 살균 (필요 시) |
| Rate Limiting | **@upstash/ratelimit** | 2.x | 브루트포스 공격 방지 |
| CSRF 방지 | **Auth.js 내장** | - | 자동 CSRF 토큰 관리 |

---

## 2. 데이터베이스 스키마 설계

### 2.1 ERD 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AUTH SYSTEM ERD                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐                 │
│  │    users     │       │  user_roles  │       │    roles     │                 │
│  ├──────────────┤       ├──────────────┤       ├──────────────┤                 │
│  │ id (PK)      │──────<│ userId (FK)  │>──────│ id (PK)      │                 │
│  │ email        │       │ roleId (FK)  │       │ code         │                 │
│  │ password     │       └──────────────┘       │ name         │                 │
│  │ name         │                              │ parentId(FK) │──┐              │
│  │ phone        │       ┌──────────────┐       │ level        │<─┘              │
│  │ department   │       │role_permissions     │ isActive     │                 │
│  │ isActive     │       ├──────────────┤       └──────┬───────┘                 │
│  │ isLocked     │       │ roleId (FK)  │>─────────────┘                         │
│  │ lockUntil    │       │ permId (FK)  │>──────┐                                │
│  │ failedAttempts       └──────────────┘       │                                │
│  │ passwordChangedAt                           ▼                                │
│  │ lastLoginAt  │                        ┌──────────────┐                       │
│  │ createdAt    │                        │ permissions  │                       │
│  │ updatedAt    │                        ├──────────────┤                       │
│  └──────┬───────┘                        │ id (PK)      │                       │
│         │                                │ code         │                       │
│         │                                │ name         │                       │
│         │                                │ type         │                       │
│         │                                │ resource     │                       │
│         │                                │ action       │                       │
│         │                                │ description  │                       │
│         │                                └──────────────┘                       │
│         │                                                                        │
│         │         ┌──────────────┐       ┌──────────────┐                       │
│         │         │   sessions   │       │refresh_tokens│                       │
│         │         ├──────────────┤       ├──────────────┤                       │
│         └────────<│ userId (FK)  │       │ id (PK)      │                       │
│                   │ token        │       │ userId (FK)  │>──────────────────────┘
│                   │ userAgent    │       │ token        │                       │
│                   │ ip           │       │ expiresAt    │                       │
│                   │ expiresAt    │       │ revokedAt    │                       │
│                   │ createdAt    │       │ createdAt    │                       │
│                   └──────────────┘       └──────────────┘                       │
│                                                                                  │
│         ┌──────────────────────────────────────────────────────────────────┐    │
│         │                         audit_logs                                │    │
│         ├──────────────────────────────────────────────────────────────────┤    │
│         │ id (PK) | userId (FK) | action | resource | resourceId | details │    │
│         │ ip | userAgent | status | errorMessage | createdAt                │    │
│         └──────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│         ┌──────────────────────────────────────────────────────────────────┐    │
│         │                      password_history                             │    │
│         ├──────────────────────────────────────────────────────────────────┤    │
│         │ id (PK) | userId (FK) | passwordHash | createdAt                  │    │
│         └──────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Prisma 스키마

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // MVP: SQLite, Production: PostgreSQL
  url      = env("DATABASE_URL")
}

// ============================================
// 사용자 (Users)
// ============================================
model User {
  id                  Int       @id @default(autoincrement())
  email               String    @unique
  password            String    // bcrypt 해시
  name                String
  phone               String?
  department          String?
  isActive            Boolean   @default(true)
  isLocked            Boolean   @default(false)
  lockUntil           DateTime?
  failedLoginAttempts Int       @default(0)
  passwordChangedAt   DateTime  @default(now())
  mustChangePassword  Boolean   @default(true)  // 초기 비밀번호 변경 강제
  lastLoginAt         DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // 관계
  userRoles        UserRole[]
  sessions         Session[]
  refreshTokens    RefreshToken[]
  auditLogs        AuditLog[]
  passwordHistory  PasswordHistory[]

  @@map("users")
}

// ============================================
// 역할 (Roles)
// ============================================
model Role {
  id          Int      @id @default(autoincrement())
  code        String   @unique  // SYSTEM_ADMIN, SECURITY_ADMIN, USER 등
  name        String             // 시스템 관리자, 보안 관리자, 사용자 등
  description String?
  parentId    Int?               // 상위 역할 (계층 구조)
  level       Int      @default(0)  // 역할 레벨 (0이 최상위)
  isSystem    Boolean  @default(false)  // 시스템 역할 (삭제 불가)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 자기 참조 (계층 구조)
  parent   Role?  @relation("RoleHierarchy", fields: [parentId], references: [id])
  children Role[] @relation("RoleHierarchy")

  // 관계
  userRoles       UserRole[]
  rolePermissions RolePermission[]
  roleMenus       RoleMenu[]

  @@map("roles")
}

// ============================================
// 사용자-역할 매핑 (User-Role Mapping)
// ============================================
model UserRole {
  id        Int      @id @default(autoincrement())
  userId    Int
  roleId    Int
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId])
  @@map("user_roles")
}

// ============================================
// 권한 (Permissions)
// ============================================
model Permission {
  id          Int      @id @default(autoincrement())
  code        String   @unique  // 예: "menu:read", "user:write", "report:export"
  name        String             // 메뉴 조회, 사용자 수정, 리포트 내보내기
  type        String             // MENU, SCREEN, API, DATA
  resource    String             // 리소스 경로 (예: "/users", "/api/reports")
  action      String             // CREATE, READ, UPDATE, DELETE, EXPORT
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 관계
  rolePermissions RolePermission[]

  @@index([type])
  @@index([resource])
  @@map("permissions")
}

// ============================================
// 역할-권한 매핑 (Role-Permission Mapping)
// ============================================
model RolePermission {
  id           Int      @id @default(autoincrement())
  roleId       Int
  permissionId Int
  createdAt    DateTime @default(now())

  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
  @@map("role_permissions")
}

// ============================================
// 역할-메뉴 매핑 (Role-Menu Mapping)
// ============================================
model RoleMenu {
  id        Int      @id @default(autoincrement())
  roleId    Int
  menuId    Int
  createdAt DateTime @default(now())

  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)
  menu Menu @relation(fields: [menuId], references: [id], onDelete: Cascade)

  @@unique([roleId, menuId])
  @@map("role_menus")
}

// ============================================
// 메뉴 (Menus) - mes-portal에서 정의, 참조
// ============================================
model Menu {
  id        Int      @id @default(autoincrement())
  code      String   @unique
  name      String
  path      String?
  icon      String?
  parentId  Int?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)

  parent    Menu?      @relation("MenuHierarchy", fields: [parentId], references: [id])
  children  Menu[]     @relation("MenuHierarchy")
  roleMenus RoleMenu[]

  @@map("menus")
}

// ============================================
// 세션 (Sessions)
// ============================================
model Session {
  id         Int      @id @default(autoincrement())
  userId     Int
  token      String   @unique
  userAgent  String?
  ip         String?
  deviceType String?  // DESKTOP, MOBILE, TABLET
  expiresAt  DateTime
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("sessions")
}

// ============================================
// 리프레시 토큰 (Refresh Tokens)
// ============================================
model RefreshToken {
  id        Int       @id @default(autoincrement())
  userId    Int
  token     String    @unique
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

// ============================================
// 비밀번호 이력 (Password History)
// ============================================
model PasswordHistory {
  id           Int      @id @default(autoincrement())
  userId       Int
  passwordHash String
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("password_history")
}

// ============================================
// 감사 로그 (Audit Logs)
// ============================================
model AuditLog {
  id           Int      @id @default(autoincrement())
  userId       Int?     // 인증 실패 시 null 가능
  action       String   // LOGIN, LOGOUT, LOGIN_FAILED, PASSWORD_CHANGE, PERMISSION_CHANGE 등
  resource     String?  // 대상 리소스 (예: "user", "role", "menu")
  resourceId   String?  // 대상 리소스 ID
  details      String?  // JSON 형태의 상세 정보
  ip           String?
  userAgent    String?
  status       String   // SUCCESS, FAILURE
  errorMessage String?
  createdAt    DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@index([resource, resourceId])
  @@map("audit_logs")
}

// ============================================
// 보안 설정 (Security Settings)
// ============================================
model SecuritySetting {
  id    Int    @id @default(autoincrement())
  key   String @unique
  value String
  type  String // STRING, NUMBER, BOOLEAN, JSON
  description String?
  updatedAt DateTime @updatedAt

  @@map("security_settings")
}
```

### 2.3 기본 보안 설정 (Seed Data)

```typescript
// prisma/seed-security-settings.ts

const defaultSecuritySettings = [
  // 비밀번호 정책
  { key: 'PASSWORD_MIN_LENGTH', value: '8', type: 'NUMBER', description: '비밀번호 최소 길이' },
  { key: 'PASSWORD_REQUIRE_UPPERCASE', value: 'true', type: 'BOOLEAN', description: '대문자 필수' },
  { key: 'PASSWORD_REQUIRE_LOWERCASE', value: 'true', type: 'BOOLEAN', description: '소문자 필수' },
  { key: 'PASSWORD_REQUIRE_NUMBER', value: 'true', type: 'BOOLEAN', description: '숫자 필수' },
  { key: 'PASSWORD_REQUIRE_SPECIAL', value: 'true', type: 'BOOLEAN', description: '특수문자 필수' },
  { key: 'PASSWORD_EXPIRY_DAYS', value: '90', type: 'NUMBER', description: '비밀번호 만료 기간(일)' },
  { key: 'PASSWORD_HISTORY_COUNT', value: '5', type: 'NUMBER', description: '비밀번호 재사용 금지 횟수' },

  // 계정 잠금 정책
  { key: 'MAX_LOGIN_ATTEMPTS', value: '5', type: 'NUMBER', description: '최대 로그인 실패 횟수' },
  { key: 'LOCKOUT_DURATION_MINUTES', value: '30', type: 'NUMBER', description: '계정 잠금 시간(분)' },

  // 세션 정책
  { key: 'SESSION_TIMEOUT_MINUTES', value: '30', type: 'NUMBER', description: '세션 타임아웃(분)' },
  { key: 'MAX_CONCURRENT_SESSIONS', value: '3', type: 'NUMBER', description: '최대 동시 세션 수' },
  { key: 'SESSION_WARNING_MINUTES', value: '5', type: 'NUMBER', description: '세션 만료 경고 시간(분)' },

  // 토큰 정책
  { key: 'ACCESS_TOKEN_EXPIRY_MINUTES', value: '15', type: 'NUMBER', description: 'Access Token 만료 시간(분)' },
  { key: 'REFRESH_TOKEN_EXPIRY_DAYS', value: '7', type: 'NUMBER', description: 'Refresh Token 만료 시간(일)' },

  // 감사 로그 정책
  { key: 'AUDIT_LOG_RETENTION_DAYS', value: '365', type: 'NUMBER', description: '감사 로그 보존 기간(일)' },
]
```

---

## 3. API 설계

### 3.1 인증 API (/api/auth/*)

| 메서드 | 엔드포인트 | 설명 | 요청 본문 | 응답 |
|-------|-----------|------|----------|------|
| POST | `/api/auth/login` | 로그인 | `{ email, password, rememberMe? }` | `{ accessToken, refreshToken, user }` |
| POST | `/api/auth/logout` | 로그아웃 | - | `{ success: true }` |
| POST | `/api/auth/refresh` | 토큰 갱신 | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| GET | `/api/auth/me` | 현재 사용자 정보 | - | `{ user, roles, permissions }` |
| POST | `/api/auth/password/change` | 비밀번호 변경 | `{ currentPassword, newPassword }` | `{ success: true }` |
| POST | `/api/auth/password/forgot` | 비밀번호 찾기 | `{ email }` | `{ success: true }` |
| POST | `/api/auth/password/reset` | 비밀번호 재설정 | `{ token, newPassword }` | `{ success: true }` |
| GET | `/api/auth/sessions` | 활성 세션 목록 | - | `{ sessions[] }` |
| DELETE | `/api/auth/sessions/:id` | 특정 세션 종료 | - | `{ success: true }` |

### 3.2 사용자 관리 API (/api/users/*)

| 메서드 | 엔드포인트 | 설명 | 권한 |
|-------|-----------|------|------|
| GET | `/api/users` | 사용자 목록 | `user:read` |
| GET | `/api/users/:id` | 사용자 상세 | `user:read` |
| POST | `/api/users` | 사용자 등록 | `user:create` |
| PUT | `/api/users/:id` | 사용자 수정 | `user:update` |
| DELETE | `/api/users/:id` | 사용자 삭제 (비활성화) | `user:delete` |
| POST | `/api/users/:id/lock` | 계정 잠금 | `user:lock` |
| POST | `/api/users/:id/unlock` | 계정 잠금 해제 | `user:unlock` |
| POST | `/api/users/:id/password/reset` | 비밀번호 초기화 | `user:password-reset` |
| GET | `/api/users/:id/roles` | 사용자 역할 조회 | `user:read` |
| PUT | `/api/users/:id/roles` | 사용자 역할 할당 | `user:assign-role` |

### 3.3 역할 관리 API (/api/roles/*)

| 메서드 | 엔드포인트 | 설명 | 권한 |
|-------|-----------|------|------|
| GET | `/api/roles` | 역할 목록 | `role:read` |
| GET | `/api/roles/:id` | 역할 상세 | `role:read` |
| POST | `/api/roles` | 역할 등록 | `role:create` |
| PUT | `/api/roles/:id` | 역할 수정 | `role:update` |
| DELETE | `/api/roles/:id` | 역할 삭제 | `role:delete` |
| GET | `/api/roles/:id/permissions` | 역할 권한 조회 | `role:read` |
| PUT | `/api/roles/:id/permissions` | 역할 권한 매핑 | `role:assign-permission` |
| GET | `/api/roles/:id/users` | 역할별 사용자 목록 | `role:read` |
| GET | `/api/roles/:id/menus` | 역할별 메뉴 목록 | `role:read` |
| PUT | `/api/roles/:id/menus` | 역할 메뉴 매핑 | `role:assign-menu` |

### 3.4 권한 관리 API (/api/permissions/*)

| 메서드 | 엔드포인트 | 설명 | 권한 |
|-------|-----------|------|------|
| GET | `/api/permissions` | 권한 목록 | `permission:read` |
| GET | `/api/permissions/:id` | 권한 상세 | `permission:read` |
| POST | `/api/permissions` | 권한 등록 | `permission:create` |
| PUT | `/api/permissions/:id` | 권한 수정 | `permission:update` |
| DELETE | `/api/permissions/:id` | 권한 삭제 | `permission:delete` |
| GET | `/api/permissions/types` | 권한 유형 목록 | `permission:read` |

### 3.5 감사 로그 API (/api/audit-logs/*)

| 메서드 | 엔드포인트 | 설명 | 권한 |
|-------|-----------|------|------|
| GET | `/api/audit-logs` | 감사 로그 목록 | `audit-log:read` |
| GET | `/api/audit-logs/:id` | 감사 로그 상세 | `audit-log:read` |
| GET | `/api/audit-logs/export` | 감사 로그 내보내기 | `audit-log:export` |
| GET | `/api/audit-logs/statistics` | 감사 로그 통계 | `audit-log:read` |

### 3.6 보안 설정 API (/api/security-settings/*)

| 메서드 | 엔드포인트 | 설명 | 권한 |
|-------|-----------|------|------|
| GET | `/api/security-settings` | 보안 설정 목록 | `security:read` |
| PUT | `/api/security-settings` | 보안 설정 수정 | `security:update` |

---

## 4. 보안 아키텍처

### 4.1 인증 흐름 (시퀀스 다이어그램)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                            로그인 인증 흐름                                      │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Client              Middleware           API Route           Database         │
│    │                     │                    │                   │            │
│    │  POST /api/auth/login                    │                   │            │
│    │─────────────────────────────────────────>│                   │            │
│    │                     │                    │                   │            │
│    │                     │                    │  Find User        │            │
│    │                     │                    │──────────────────>│            │
│    │                     │                    │<──────────────────│            │
│    │                     │                    │                   │            │
│    │                     │                    │  Check Password   │            │
│    │                     │                    │  (bcrypt.compare) │            │
│    │                     │                    │                   │            │
│    │                     │                    │  Check Lock Status│            │
│    │                     │                    │  Check Password   │            │
│    │                     │                    │  Expiry           │            │
│    │                     │                    │                   │            │
│    │                     │                    │  Generate JWT     │            │
│    │                     │                    │  (Access + Refresh)            │
│    │                     │                    │                   │            │
│    │                     │                    │  Create Session   │            │
│    │                     │                    │──────────────────>│            │
│    │                     │                    │                   │            │
│    │                     │                    │  Create Audit Log │            │
│    │                     │                    │──────────────────>│            │
│    │                     │                    │                   │            │
│    │<─────────────────────────────────────────│                   │            │
│    │  { accessToken, refreshToken, user }     │                   │            │
│    │                     │                    │                   │            │
│                                                                                │
│  ─────────────────────── 이후 API 요청 ────────────────────────                 │
│                                                                                │
│    │  GET /api/protected │                    │                   │            │
│    │  (Authorization: Bearer <token>)         │                   │            │
│    │────────────────────>│                    │                   │            │
│    │                     │                    │                   │            │
│    │                     │  Verify JWT        │                   │            │
│    │                     │  Check Permissions │                   │            │
│    │                     │                    │                   │            │
│    │                     │  (Pass)            │                   │            │
│    │                     │───────────────────>│                   │            │
│    │                     │                    │                   │            │
│    │<─────────────────────────────────────────│                   │            │
│    │  Response           │                    │                   │            │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 JWT 토큰 구조

#### Access Token Payload
```typescript
interface AccessTokenPayload {
  sub: string         // 사용자 ID
  email: string       // 이메일
  name: string        // 이름
  roles: string[]     // 역할 코드 배열 ["SYSTEM_ADMIN", "PRODUCTION_MANAGER"]
  permissions: string[] // 권한 코드 배열 ["user:read", "user:write"]
  iat: number         // 발급 시간
  exp: number         // 만료 시간 (기본 15분)
  jti: string         // 토큰 고유 ID
}
```

#### Refresh Token Payload
```typescript
interface RefreshTokenPayload {
  sub: string         // 사용자 ID
  iat: number         // 발급 시간
  exp: number         // 만료 시간 (기본 7일)
  jti: string         // 토큰 고유 ID
  family: string      // 토큰 패밀리 (Rotation 감지용)
}
```

### 4.3 세션 관리 전략

```typescript
// 세션 관리 정책
const sessionPolicy = {
  // 세션 타임아웃 (비활성 시)
  inactivityTimeout: 30 * 60 * 1000, // 30분

  // 최대 동시 세션 수
  maxConcurrentSessions: 3,

  // 세션 만료 경고
  warningBeforeExpiry: 5 * 60 * 1000, // 5분 전

  // 새 세션 생성 시 기존 세션 처리
  onNewSession: 'KEEP_ALL' | 'REVOKE_OLDEST' | 'REVOKE_ALL',

  // 세션 정보 저장
  storeDeviceInfo: true,
  storeIpAddress: true,
}
```

### 4.4 비밀번호 정책 구현

```typescript
// lib/auth/password-policy.ts

import { z } from 'zod'

export const passwordSchema = z.string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .regex(/[A-Z]/, '대문자를 포함해야 합니다.')
  .regex(/[a-z]/, '소문자를 포함해야 합니다.')
  .regex(/[0-9]/, '숫자를 포함해야 합니다.')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, '특수문자를 포함해야 합니다.')

export async function validatePasswordHistory(
  userId: number,
  newPassword: string,
  historyCount: number = 5
): Promise<boolean> {
  // 최근 N개 비밀번호와 비교
  const history = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: historyCount,
  })

  for (const record of history) {
    if (await bcrypt.compare(newPassword, record.passwordHash)) {
      return false // 이전에 사용한 비밀번호
    }
  }
  return true
}

export function isPasswordExpired(passwordChangedAt: Date, expiryDays: number = 90): boolean {
  const expiryDate = new Date(passwordChangedAt)
  expiryDate.setDate(expiryDate.getDate() + expiryDays)
  return new Date() > expiryDate
}
```

### 4.5 계정 잠금 메커니즘

```typescript
// lib/auth/account-lock.ts

export async function handleLoginAttempt(
  userId: number,
  success: boolean
): Promise<void> {
  if (success) {
    // 로그인 성공: 실패 횟수 초기화
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lastLoginAt: new Date(),
      },
    })
  } else {
    // 로그인 실패: 실패 횟수 증가
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
      },
    })

    // 최대 실패 횟수 초과 시 계정 잠금
    const maxAttempts = await getSecuritySetting('MAX_LOGIN_ATTEMPTS')
    const lockoutMinutes = await getSecuritySetting('LOCKOUT_DURATION_MINUTES')

    if (user.failedLoginAttempts >= maxAttempts) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isLocked: true,
          lockUntil: new Date(Date.now() + lockoutMinutes * 60 * 1000),
        },
      })

      // 감사 로그 기록
      await createAuditLog({
        userId,
        action: 'ACCOUNT_LOCKED',
        status: 'SUCCESS',
        details: JSON.stringify({ reason: 'MAX_LOGIN_ATTEMPTS_EXCEEDED' }),
      })
    }
  }
}

export async function checkAndUnlockAccount(userId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user?.isLocked) return true

  // 잠금 시간이 지났으면 자동 해제
  if (user.lockUntil && new Date() > user.lockUntil) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isLocked: false,
        lockUntil: null,
        failedLoginAttempts: 0,
      },
    })
    return true
  }

  return false // 여전히 잠금 상태
}
```

---

## 5. 권한 제어 아키텍처

### 5.1 RBAC 모델 설계

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          RBAC 모델 구조                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│    ┌─────────┐         ┌─────────┐         ┌─────────────┐             │
│    │  User   │ ──N:M── │  Role   │ ──N:M── │ Permission  │             │
│    └─────────┘         └─────────┘         └─────────────┘             │
│                              │                    │                     │
│                              │ 계층 구조          │ 유형별 분류          │
│                              ▼                    ▼                     │
│                        ┌─────────┐          ┌─────────────┐            │
│                        │ Parent  │          │   MENU      │            │
│                        │  Role   │          │   SCREEN    │            │
│                        └─────────┘          │   API       │            │
│                                             │   DATA      │            │
│                                             └─────────────┘            │
│                                                                         │
│  ─────────────────────── 권한 상속 ─────────────────────────            │
│                                                                         │
│    SYSTEM_ADMIN (Level 0)                                              │
│         │                                                               │
│         ├── SECURITY_ADMIN (Level 1)                                   │
│         │        └── 감사 로그, 보안 설정 권한 상속                       │
│         │                                                               │
│         └── OPERATION_ADMIN (Level 1)                                  │
│                  │                                                      │
│                  ├── PRODUCTION_MANAGER (Level 2)                      │
│                  ├── QUALITY_MANAGER (Level 2)                         │
│                  └── EQUIPMENT_MANAGER (Level 2)                       │
│                           │                                             │
│                           └── USER (Level 3)                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 CASL 기반 권한 체크 구현

```typescript
// lib/auth/ability.ts

import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability'

type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'
type Subjects = 'User' | 'Role' | 'Permission' | 'AuditLog' | 'Menu' | 'all'

export type AppAbility = MongoAbility<[Actions, Subjects]>

export function defineAbilityFor(permissions: string[]): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  // 권한 코드를 CASL 규칙으로 변환
  permissions.forEach(permission => {
    const [resource, action] = permission.split(':')
    const subject = capitalizeFirst(resource) as Subjects
    const ability = action === 'write' ? 'update' : action as Actions

    can(ability, subject)
  })

  return build()
}

// 미들웨어에서 사용
export function checkPermission(ability: AppAbility, action: Actions, subject: Subjects): boolean {
  return ability.can(action, subject)
}
```

### 5.3 메뉴 접근 제어 구현

```typescript
// lib/auth/menu-filter.ts

export async function getAuthorizedMenus(userId: number): Promise<Menu[]> {
  // 사용자의 역할 조회
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          roleMenus: {
            include: { menu: true }
          }
        }
      }
    }
  })

  // 역할에 매핑된 메뉴 수집 (중복 제거)
  const menuMap = new Map<number, Menu>()

  for (const userRole of userRoles) {
    for (const roleMenu of userRole.role.roleMenus) {
      if (roleMenu.menu.isActive) {
        menuMap.set(roleMenu.menu.id, roleMenu.menu)
      }
    }
  }

  // 트리 구조로 변환
  return buildMenuTree(Array.from(menuMap.values()))
}

function buildMenuTree(menus: Menu[]): Menu[] {
  const menuMap = new Map(menus.map(m => [m.id, { ...m, children: [] }]))
  const tree: Menu[] = []

  for (const menu of menuMap.values()) {
    if (menu.parentId && menuMap.has(menu.parentId)) {
      menuMap.get(menu.parentId)!.children.push(menu)
    } else {
      tree.push(menu)
    }
  }

  return tree.sort((a, b) => a.sortOrder - b.sortOrder)
}
```

### 5.4 화면 요소 제어 (React Hook)

```typescript
// hooks/usePermission.ts

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { defineAbilityFor } from '@/lib/auth/ability'

export function usePermission() {
  const { data: session } = useSession()

  const ability = useMemo(() => {
    if (!session?.user?.permissions) {
      return defineAbilityFor([])
    }
    return defineAbilityFor(session.user.permissions)
  }, [session?.user?.permissions])

  const can = (action: string, subject: string): boolean => {
    return ability.can(action as any, subject as any)
  }

  const cannot = (action: string, subject: string): boolean => {
    return ability.cannot(action as any, subject as any)
  }

  return { can, cannot, ability }
}

// 사용 예시
function UserManagement() {
  const { can } = usePermission()

  return (
    <div>
      {can('create', 'User') && (
        <Button type="primary">사용자 등록</Button>
      )}

      {can('delete', 'User') && (
        <Button danger>삭제</Button>
      )}
    </div>
  )
}
```

### 5.5 API 접근 제어 (Middleware)

```typescript
// middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// API 엔드포인트별 필요 권한 정의
const apiPermissions: Record<string, string[]> = {
  'GET /api/users': ['user:read'],
  'POST /api/users': ['user:create'],
  'PUT /api/users/*': ['user:update'],
  'DELETE /api/users/*': ['user:delete'],
  'GET /api/roles': ['role:read'],
  'POST /api/roles': ['role:create'],
  // ...
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  // 인증되지 않은 요청
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // API 경로인 경우 권한 체크
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const method = request.method
    const path = request.nextUrl.pathname

    // 매칭되는 권한 규칙 찾기
    const requiredPermissions = findRequiredPermissions(method, path)

    if (requiredPermissions.length > 0) {
      const userPermissions = token.permissions as string[] || []
      const hasPermission = requiredPermissions.some(p =>
        userPermissions.includes(p)
      )

      if (!hasPermission) {
        // 감사 로그 기록
        await logUnauthorizedAccess(token.sub, method, path)

        return NextResponse.json(
          { error: 'Forbidden', message: '권한이 없습니다.' },
          { status: 403 }
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/(portal)/:path*']
}
```

---

## 6. 감사 로그 아키텍처

### 6.1 로그 수집 전략

```typescript
// lib/audit/audit-logger.ts

import pino from 'pino'

// 감사 로그 타입 정의
export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'ROLE_CREATED'
  | 'ROLE_UPDATED'
  | 'ROLE_DELETED'
  | 'PERMISSION_ASSIGNED'
  | 'PERMISSION_REVOKED'
  | 'MENU_ACCESS'
  | 'DATA_EXPORT'
  | 'UNAUTHORIZED_ACCESS'

export interface AuditLogEntry {
  userId?: number
  action: AuditAction
  resource?: string
  resourceId?: string
  details?: Record<string, unknown>
  ip?: string
  userAgent?: string
  status: 'SUCCESS' | 'FAILURE'
  errorMessage?: string
}

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  // 데이터베이스에 저장
  await prisma.auditLog.create({
    data: {
      ...entry,
      details: entry.details ? JSON.stringify(entry.details) : null,
      createdAt: new Date(),
    },
  })

  // Pino 로거로 파일/콘솔 출력 (선택적)
  logger.info({
    ...entry,
    timestamp: new Date().toISOString(),
  })
}

// 감사 로그 데코레이터 (API Route용)
export function withAuditLog(
  action: AuditAction,
  options: { resource: string }
) {
  return function (handler: Function) {
    return async function (request: NextRequest, context: any) {
      const startTime = Date.now()
      let status: 'SUCCESS' | 'FAILURE' = 'SUCCESS'
      let errorMessage: string | undefined

      try {
        const result = await handler(request, context)
        return result
      } catch (error) {
        status = 'FAILURE'
        errorMessage = error instanceof Error ? error.message : 'Unknown error'
        throw error
      } finally {
        const token = await getToken({ req: request })
        await createAuditLog({
          userId: token?.sub ? parseInt(token.sub) : undefined,
          action,
          resource: options.resource,
          resourceId: context?.params?.id,
          ip: request.ip,
          userAgent: request.headers.get('user-agent') || undefined,
          status,
          errorMessage,
          details: {
            method: request.method,
            path: request.nextUrl.pathname,
            duration: Date.now() - startTime,
          },
        })
      }
    }
  }
}
```

### 6.2 로그 보존 및 정리

```typescript
// lib/audit/log-cleanup.ts

export async function cleanupOldAuditLogs(): Promise<number> {
  const retentionDays = await getSecuritySetting('AUDIT_LOG_RETENTION_DAYS')
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: cutoffDate }
    }
  })

  // 정리 작업도 감사 로그로 기록
  await createAuditLog({
    action: 'AUDIT_LOG_CLEANUP' as AuditAction,
    status: 'SUCCESS',
    details: {
      deletedCount: result.count,
      cutoffDate: cutoffDate.toISOString(),
    },
  })

  return result.count
}

// Cron Job 또는 스케줄러에서 호출
// 예: 매일 자정에 실행
```

### 6.3 로그 조회 및 통계

```typescript
// lib/audit/audit-query.ts

export interface AuditLogFilter {
  userId?: number
  action?: AuditAction | AuditAction[]
  resource?: string
  status?: 'SUCCESS' | 'FAILURE'
  startDate?: Date
  endDate?: Date
  ip?: string
}

export async function queryAuditLogs(
  filter: AuditLogFilter,
  pagination: { page: number; pageSize: number }
) {
  const where: Prisma.AuditLogWhereInput = {}

  if (filter.userId) where.userId = filter.userId
  if (filter.action) {
    where.action = Array.isArray(filter.action)
      ? { in: filter.action }
      : filter.action
  }
  if (filter.resource) where.resource = filter.resource
  if (filter.status) where.status = filter.status
  if (filter.ip) where.ip = filter.ip
  if (filter.startDate || filter.endDate) {
    where.createdAt = {
      gte: filter.startDate,
      lte: filter.endDate,
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.auditLog.count({ where }),
  ])

  return { logs, total, page: pagination.page, pageSize: pagination.pageSize }
}

export async function getAuditStatistics(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const stats = await prisma.auditLog.groupBy({
    by: ['action', 'status'],
    where: { createdAt: { gte: startDate } },
    _count: true,
  })

  const loginAttempts = await prisma.auditLog.count({
    where: {
      action: { in: ['LOGIN', 'LOGIN_FAILED'] },
      createdAt: { gte: startDate },
    },
  })

  const failedLogins = await prisma.auditLog.count({
    where: {
      action: 'LOGIN_FAILED',
      createdAt: { gte: startDate },
    },
  })

  return {
    byAction: stats,
    loginAttempts,
    failedLogins,
    failureRate: loginAttempts > 0 ? (failedLogins / loginAttempts) * 100 : 0,
  }
}
```

---

## 7. 품질 요구사항

### 7.1 성능 목표

| 지표 | 목표값 | 측정 기준 |
|-----|--------|----------|
| 로그인 응답 시간 | **1초 이내** | API 응답 P95 |
| 토큰 검증 시간 | **10ms 이내** | Middleware 처리 시간 |
| 권한 체크 시간 | **50ms 이내** | API 미들웨어 |
| 감사 로그 쓰기 | **100ms 이내** | 비동기 처리 |
| 감사 로그 조회 | **3초 이내** | 100만 건 기준 |

### 7.2 보안 요구사항 (OWASP Top 10 대응)

| OWASP 위협 | 대응 방안 | 구현 |
|-----------|----------|------|
| A01: Broken Access Control | RBAC + 미들웨어 권한 체크 | CASL + Middleware |
| A02: Cryptographic Failures | 비밀번호 bcrypt 해싱, JWT RS256 서명 | bcrypt, jose |
| A03: Injection | Prisma ORM (Prepared Statements) | Prisma |
| A05: Security Misconfiguration | 보안 설정 중앙 관리 | SecuritySettings |
| A07: Identification Failures | 계정 잠금, 세션 관리 | Account Lock, Session |
| A09: Security Logging Failures | 감사 로그 수집 및 보존 | AuditLog |

### 7.3 테스트 전략

| 유형 | 커버리지 목표 | 도구 | 대상 |
|-----|-------------|------|------|
| 단위 테스트 | 80% | Vitest | 비밀번호 정책, 권한 체크 로직 |
| 통합 테스트 | 100% | Vitest + Supertest | 인증 API, 권한 API |
| E2E 테스트 | 주요 플로우 | Playwright | 로그인, 역할 관리, 감사 로그 |
| 보안 테스트 | - | OWASP ZAP | 취약점 스캔 |

---

## 8. AI 코딩 가이드라인

### 8.1 권장 사항

1. **인증 관련**
   - Auth.js의 Credentials Provider 사용
   - bcrypt 해싱 시 rounds 10 이상 사용
   - JWT 토큰은 jose 라이브러리로 생성/검증

2. **권한 관련**
   - CASL 라이브러리로 세밀한 권한 제어
   - 미들웨어에서 API 권한 체크 일괄 처리
   - React Hook으로 UI 요소 권한 체크

3. **감사 로그 관련**
   - 모든 인증/권한 변경 이벤트 로깅
   - 비동기로 로그 저장 (성능 영향 최소화)
   - 로그에 민감 정보 (비밀번호) 포함 금지

### 8.2 금지 사항

1. **비밀번호 평문 저장/로깅 금지**
2. **JWT Secret 하드코딩 금지** (환경변수 사용)
3. **권한 체크 생략 금지** (모든 보호된 API에 적용)
4. **SQL Raw Query 사용 금지** (Prisma ORM 사용)
5. **console.log로 민감 정보 출력 금지**

---

## 9. 프로젝트 구조

```
mes-portal/
├── app/
│   ├── (auth)/                    # 인증 관련 라우트 그룹
│   │   ├── login/page.tsx        # 로그인 페이지
│   │   ├── logout/page.tsx       # 로그아웃 처리
│   │   └── password/             # 비밀번호 변경/찾기
│   │       ├── change/page.tsx
│   │       ├── forgot/page.tsx
│   │       └── reset/page.tsx
│   │
│   ├── api/
│   │   ├── auth/                 # 인증 API
│   │   │   ├── [...nextauth]/route.ts
│   │   │   ├── me/route.ts
│   │   │   ├── sessions/route.ts
│   │   │   └── password/
│   │   │       ├── change/route.ts
│   │   │       ├── forgot/route.ts
│   │   │       └── reset/route.ts
│   │   │
│   │   ├── users/                # 사용자 관리 API
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/roles/route.ts
│   │   │
│   │   ├── roles/                # 역할 관리 API
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/permissions/route.ts
│   │   │
│   │   ├── permissions/          # 권한 관리 API
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   │
│   │   ├── audit-logs/           # 감사 로그 API
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   ├── export/route.ts
│   │   │   └── statistics/route.ts
│   │   │
│   │   └── security-settings/    # 보안 설정 API
│   │       └── route.ts
│   │
│   └── (portal)/
│       └── admin/                # 관리 화면
│           ├── users/page.tsx
│           ├── roles/page.tsx
│           ├── permissions/page.tsx
│           ├── audit-logs/page.tsx
│           └── security/page.tsx
│
├── components/
│   └── auth/                     # 인증 관련 컴포넌트
│       ├── LoginForm.tsx
│       ├── PasswordChangeForm.tsx
│       ├── PermissionGuard.tsx   # 권한 체크 Wrapper
│       └── SessionManager.tsx    # 세션 관리 컴포넌트
│
├── lib/
│   ├── auth/                     # 인증/인가 핵심 로직
│   │   ├── index.ts              # Auth.js 설정
│   │   ├── credentials.ts        # Credentials Provider
│   │   ├── jwt.ts                # JWT 유틸리티
│   │   ├── password-policy.ts    # 비밀번호 정책
│   │   ├── account-lock.ts       # 계정 잠금
│   │   ├── ability.ts            # CASL 권한 정의
│   │   └── session.ts            # 세션 관리
│   │
│   ├── audit/                    # 감사 로그
│   │   ├── audit-logger.ts       # 로그 생성
│   │   ├── audit-query.ts        # 로그 조회
│   │   └── log-cleanup.ts        # 로그 정리
│   │
│   └── security/                 # 보안 유틸리티
│       ├── rate-limit.ts         # Rate Limiting
│       ├── input-validation.ts   # 입력 검증 (zod)
│       └── security-settings.ts  # 보안 설정 조회
│
├── hooks/
│   ├── usePermission.ts          # 권한 체크 Hook
│   └── useSession.ts             # 세션 관리 Hook
│
├── middleware.ts                 # 인증/권한 미들웨어
│
└── prisma/
    ├── schema.prisma             # 스키마 정의
    ├── seed.ts                   # 기본 데이터 시드
    └── migrations/               # 마이그레이션 파일
```

---

## 10. PRD ↔ 기술 스택 매핑

### 10.1 인증 (PRD 4.1) ↔ 기술 스택

| PRD 요구사항 | 적용 기술 | 구현 위치 |
|-------------|----------|----------|
| 로그인/로그아웃 | Auth.js Credentials | `lib/auth/credentials.ts` |
| JWT Access Token | jose + Auth.js | `lib/auth/jwt.ts` |
| JWT Refresh Token | Prisma + 자체 구현 | `RefreshToken` 모델 |
| 세션 관리 | Prisma Sessions | `Session` 모델 |
| 비밀번호 복잡도 | zod + bcrypt | `lib/auth/password-policy.ts` |
| 계정 잠금 | Prisma + 자체 구현 | `lib/auth/account-lock.ts` |
| 비밀번호 찾기/재설정 | Auth.js + Email | `api/auth/password/*` |

### 10.2 인가 (PRD 4.2) ↔ 기술 스택

| PRD 요구사항 | 적용 기술 | 구현 위치 |
|-------------|----------|----------|
| 역할 CRUD | Prisma + API Routes | `api/roles/*` |
| 권한 CRUD | Prisma + API Routes | `api/permissions/*` |
| 역할-권한 매핑 | Prisma 관계 | `RolePermission` 모델 |
| 사용자-역할 할당 | Prisma 관계 | `UserRole` 모델 |
| 메뉴 접근 제어 | Prisma + 자체 구현 | `lib/auth/menu-filter.ts` |
| 화면 요소 제어 | CASL + React Hook | `hooks/usePermission.ts` |
| API 접근 제어 | Next.js Middleware | `middleware.ts` |

### 10.3 회계 (PRD 4.3) ↔ 기술 스택

| PRD 요구사항 | 적용 기술 | 구현 위치 |
|-------------|----------|----------|
| 로그인/로그아웃 이력 | Prisma + Pino | `lib/audit/audit-logger.ts` |
| 인증 실패 이력 | Prisma + Pino | `lib/audit/audit-logger.ts` |
| 권한 변경 감사 로그 | Prisma + Decorator | `lib/audit/audit-logger.ts` |
| 감사 로그 조회 | Prisma Query | `lib/audit/audit-query.ts` |
| 보안 이벤트 알림 | Ant Design Notification | 자체 구현 |

### 10.4 관리 화면 (PRD 4.4) ↔ 기술 스택

| PRD 요구사항 | 적용 기술 | 구현 위치 |
|-------------|----------|----------|
| 사용자 관리 화면 | Ant Design Table/Form | `(portal)/admin/users/` |
| 역할 관리 화면 | Ant Design Tree/Form | `(portal)/admin/roles/` |
| 권한 관리 화면 | Ant Design Table | `(portal)/admin/permissions/` |
| 감사 로그 조회 화면 | Ant Design Table | `(portal)/admin/audit-logs/` |
| 보안 설정 화면 | Ant Design Form | `(portal)/admin/security/` |

---

## 11. 버전 요약

### 핵심 기술 스택

| 기술 | 버전 | 용도 |
|-----|------|------|
| Auth.js (NextAuth) | 5.x | 인증 프레임워크 |
| bcrypt | 5.x | 비밀번호 해싱 |
| jose | 5.x | JWT 생성/검증 |
| CASL | 6.x | 권한 제어 |
| zod | 3.x | 입력 검증 |
| Pino | 9.x | 로깅 |

---

## 12. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-26 | Claude | 초안 작성 - RBAC 기반 AAA 시스템 TRD |
