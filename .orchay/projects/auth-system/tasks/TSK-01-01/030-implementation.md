# 구현 보고서: TSK-01-01 Prisma 스키마 및 Auth.js 설정

**Template Version:** 2.0.0 — **Last Updated:** 2026-01-26

---

## 0. 문서 메타데이터

* **문서명**: `030-implementation.md`
* **Task ID**: TSK-01-01
* **Task 명**: Prisma 스키마 및 Auth.js 설정
* **작성일**: 2026-01-26
* **작성자**: Claude
* **참조 상세설계서**: `./020-detail-design.md`
* **구현 기간**: 2026-01-26
* **구현 상태**: ✅ 완료

---

## 1. 구현 개요

### 1.1 구현 목적
Auth System의 데이터베이스 스키마와 인증 프레임워크 기반 구축

### 1.2 구현 범위
- **포함된 기능**:
  - Prisma 스키마 확장 (10개 모델 추가)
  - 비밀번호 정책 유틸리티 확장
  - 시드 데이터 (역할, 권한, 사용자, 보안설정)

- **제외된 기능**:
  - 로그인/로그아웃 API (TSK-02-01)
  - RBAC API (TSK-03-01)

### 1.3 구현 유형
- [x] Backend Only

### 1.4 기술 스택
- **Backend**:
  - Framework: Next.js 16.x
  - ORM: Prisma 7.x
  - Database: SQLite (dev.db)
  - Auth: Auth.js 5.x (기존 설정 유지)
  - Password: bcrypt 6.x

---

## 2. Backend 구현 결과

### 2.1 구현된 컴포넌트

#### 2.1.1 Prisma 스키마 (10개 모델 추가)
- **파일**: `prisma/schema.prisma`
- **추가된 모델**:

| 모델 | 설명 | 주요 필드 |
|------|------|----------|
| User | 사용자 (확장) | isLocked, failedLoginAttempts, mustChangePassword |
| Role | RBAC 역할 | code, parentId, level, isSystem |
| Permission | 권한 정의 | code, type, resource, action |
| UserRole | 사용자-역할 매핑 | userId, roleId |
| RolePermission | 역할-권한 매핑 | roleId, permissionId |
| Session | 세션 관리 | token, userAgent, ip, expiresAt |
| RefreshToken | 리프레시 토큰 | token, family, expiresAt, revokedAt |
| PasswordHistory | 비밀번호 이력 | passwordHash |
| AuditLog | 감사 로그 | action, resource, status, details |
| SecuritySetting | 보안 설정 | key, value, type |

#### 2.1.2 비밀번호 유틸리티 확장
- **파일**: `lib/auth/password.ts`
- **추가된 함수**:

| 함수 | 설명 |
|------|------|
| validatePasswordPolicy | 비밀번호 정책 검증 |
| isPasswordReused | 비밀번호 재사용 확인 |
| isPasswordExpired | 비밀번호 만료 확인 |
| getDaysUntilPasswordExpiry | 만료까지 남은 일수 |

#### 2.1.3 시드 데이터
- **파일**: `prisma/seed.ts`
- **생성된 데이터**:

| 데이터 | 개수 |
|--------|------|
| 권한 (Permission) | 26개 |
| 역할 (Role) | 7개 |
| 역할-권한 매핑 | 다수 |
| 테스트 사용자 | 5명 |
| 보안 설정 | 15개 |
| 메뉴 | 16개 |
| 역할-메뉴 매핑 | 53개 |

### 2.2 테스트 계정

| 이메일 | 이름 | 역할 | 비밀번호 |
|--------|------|------|----------|
| admin@mes.local | 시스템 관리자 | SYSTEM_ADMIN | Admin123! |
| security@mes.local | 보안 관리자 | SECURITY_ADMIN | Security123! |
| operation@mes.local | 운영 관리자 | OPERATION_ADMIN | Operation123! |
| production@mes.local | 생산 관리자 | PRODUCTION_MANAGER | Production123! |
| user@mes.local | 일반 사용자 | USER | User123! |

### 2.3 역할 계층 구조

```
SYSTEM_ADMIN (Level 0)
├── SECURITY_ADMIN (Level 1)
├── OPERATION_ADMIN (Level 1)
│   ├── PRODUCTION_MANAGER (Level 2)
│   ├── QUALITY_MANAGER (Level 2)
│   └── EQUIPMENT_MANAGER (Level 2)
└── USER (Level 3, 독립)
```

### 2.4 보안 설정 (SecuritySetting)

| 키 | 값 | 설명 |
|-----|-----|------|
| PASSWORD_MIN_LENGTH | 8 | 비밀번호 최소 길이 |
| PASSWORD_REQUIRE_UPPERCASE | true | 대문자 필수 |
| PASSWORD_REQUIRE_LOWERCASE | true | 소문자 필수 |
| PASSWORD_REQUIRE_NUMBER | true | 숫자 필수 |
| PASSWORD_REQUIRE_SPECIAL | true | 특수문자 필수 |
| PASSWORD_EXPIRY_DAYS | 90 | 비밀번호 만료 기간 |
| PASSWORD_HISTORY_COUNT | 5 | 재사용 금지 횟수 |
| MAX_LOGIN_ATTEMPTS | 5 | 최대 로그인 실패 횟수 |
| LOCKOUT_DURATION_MINUTES | 30 | 계정 잠금 시간 |
| SESSION_TIMEOUT_MINUTES | 30 | 세션 타임아웃 |
| MAX_CONCURRENT_SESSIONS | 3 | 최대 동시 세션 |
| ACCESS_TOKEN_EXPIRY_MINUTES | 15 | Access Token 만료 |
| REFRESH_TOKEN_EXPIRY_DAYS | 7 | Refresh Token 만료 |
| AUDIT_LOG_RETENTION_DAYS | 365 | 감사 로그 보존 기간 |

---

## 3. 실행 결과

### 3.1 Prisma DB Push
```
✅ Your database is now in sync with your Prisma schema.
```

### 3.2 Prisma Generate
```
✔ Generated Prisma Client (7.2.0) to ./lib/generated/prisma
```

### 3.3 Seed 실행
```
🌱 Seeding database...
🔐 Seeding roles, permissions, and users...
  ✅ Created 26 permissions
  ✅ Created 7 roles
  ✅ Created role-permission mappings
  ✅ Created 5 test users
  ✅ Created 15 security settings
📋 Seeding menus...
✅ Created 16 menus
🔗 Seeding role-menu mappings...
  ✅ SYSTEM_ADMIN: 15개 메뉴 매핑
  ✅ SECURITY_ADMIN: 6개 메뉴 매핑
  ✅ OPERATION_ADMIN: 15개 메뉴 매핑
  ✅ PRODUCTION_MANAGER: 11개 메뉴 매핑
  ✅ USER: 6개 메뉴 매핑
✅ Total role-menu mappings created: 53
🎉 Seeding completed!
```

---

## 4. 구현 완료 체크리스트

### Backend
- [x] Prisma 스키마 확장 (10개 모델)
- [x] 마이그레이션 적용 (db push)
- [x] Prisma Client 생성
- [x] 비밀번호 정책 유틸리티 확장
- [x] 시드 스크립트 업데이트
- [x] 시드 데이터 적용

### 품질
- [x] 요구사항 커버리지: PRD 4.1, TRD 2.2 충족
- [x] 스키마 일관성: TRD ERD와 일치

---

## 5. 알려진 이슈

없음

---

## 6. 다음 단계

- TSK-02-01: 로그인/로그아웃 API 및 화면 구현
- TSK-03-01: 역할/권한 CRUD API 구현

---

## 7. 참고 자료

### 7.1 관련 문서
- 상세설계서: `./020-detail-design.md`
- PRD: `.orchay/projects/auth-system/prd.md`
- TRD: `.orchay/projects/auth-system/trd.md`

### 7.2 소스 코드 위치
- Prisma 스키마: `mes-portal/prisma/schema.prisma`
- 비밀번호 유틸리티: `mes-portal/lib/auth/password.ts`
- 시드 스크립트: `mes-portal/prisma/seed.ts`
