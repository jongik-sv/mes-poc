# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: 사용자 및 역할 모델 테스트 시나리오 정의
>
> **참조**: 이 문서는 `010-design.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-04-02 |
| Task명 | 사용자 및 역할 모델 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 | 비고 |
|------------|------|--------------|------|
| 단위 테스트 | Prisma 모델 CRUD, 비밀번호 해시 유틸리티 | 90% 이상 | 핵심 데이터 레이어 |
| 통합 테스트 | 시드 스크립트 실행 검증 | 100% 시드 항목 | DB 초기화 검증 |
| E2E 테스트 | 해당 없음 | - | UI 없는 백엔드 Task |
| 매뉴얼 테스트 | 해당 없음 | - | UI 없는 백엔드 Task |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 | Vitest |
| 데이터베이스 | SQLite (테스트용 인메모리 또는 별도 파일) |
| 비밀번호 해싱 | bcrypt |
| 테스트 격리 | 각 테스트 전 DB 초기화 |
| 환경변수 | `DATABASE_URL="file:./test.db"` |

### 1.3 테스트 대상 파일

| 파일 경로 | 설명 | 테스트 파일 |
|----------|------|------------|
| `prisma/schema.prisma` | User, Role 모델 정의 | - (스키마 검증은 Prisma가 수행) |
| `prisma/seed.ts` | 초기 데이터 시드 스크립트 | `prisma/__tests__/seed.test.ts` |
| `lib/auth/password.ts` | 비밀번호 해시 유틸리티 | `lib/auth/__tests__/password.test.ts` |
| `lib/prisma.ts` | PrismaClient 싱글톤 | 통합 테스트에서 간접 검증 |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | User 모델 | 정상 생성 | User 객체 반환, id 자동 생성 | FR-001 |
| UT-002 | User 모델 | 이메일 중복 시 에러 | Prisma P2002 에러 발생 | BR-001 |
| UT-003 | Role 모델 | 정상 생성 | Role 객체 반환, id 자동 생성 | FR-002 |
| UT-004 | Role 모델 | 코드 중복 시 에러 | Prisma P2002 에러 발생 | BR-002 |
| UT-005 | User-Role 관계 | 관계 조회 | User.role에 Role 객체 포함 | FR-003 |
| UT-006 | Password Util | 해시 생성 | bcrypt 해시 문자열 반환 | BR-003 |
| UT-007 | Password Util | 해시 검증 성공 | true 반환 | BR-003 |
| UT-008 | Password Util | 해시 검증 실패 | false 반환 | BR-003 |
| UT-009 | User 모델 | 비활성 사용자 조회 | isActive=false 확인 | FR-004 |
| UT-010 | User 모델 | 수정 시 updatedAt 갱신 | updatedAt 타임스탬프 변경 | FR-005 |
| UT-011 | Role 모델 | 역할별 사용자 목록 조회 | Role.users 배열 반환 | FR-006 |

### 2.2 테스트 케이스 상세

#### UT-001: User 정상 생성

| 항목 | 내용 |
|------|------|
| **파일** | `prisma/__tests__/user.model.test.ts` |
| **테스트 블록** | `describe('User Model') -> it('should create user with valid data')` |
| **사전 조건** | Role 시드 데이터 존재 (ADMIN 역할) |
| **입력 데이터** | `{ email: 'test@example.com', password: '<hashed>', name: '테스트', roleId: 1 }` |
| **검증 포인트** | id 자동 생성, createdAt/updatedAt 설정, isActive 기본값 true |
| **관련 요구사항** | FR-001 |

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth/password';

const prisma = new PrismaClient();

describe('User Model', () => {
  beforeAll(async () => {
    // 테스트용 Role 생성
    await prisma.role.create({
      data: { code: 'ADMIN', name: '시스템 관리자' }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should create user with valid data', async () => {
    const hashedPassword = await hashPassword('password123');

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: '테스트 사용자',
        roleId: 1
      }
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('테스트 사용자');
    expect(user.roleId).toBe(1);
    expect(user.isActive).toBe(true);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });
});
```

#### UT-002: User 이메일 중복 시 에러

| 항목 | 내용 |
|------|------|
| **파일** | `prisma/__tests__/user.model.test.ts` |
| **테스트 블록** | `describe('User Model') -> it('should throw error for duplicate email')` |
| **사전 조건** | 동일 이메일의 User 이미 존재 |
| **입력 데이터** | `{ email: 'existing@example.com', ... }` |
| **검증 포인트** | Prisma P2002 에러 발생 (unique constraint violation) |
| **관련 요구사항** | BR-001 |

```typescript
it('should throw error for duplicate email', async () => {
  const hashedPassword = await hashPassword('password123');

  // 첫 번째 사용자 생성
  await prisma.user.create({
    data: {
      email: 'existing@example.com',
      password: hashedPassword,
      name: '기존 사용자',
      roleId: 1
    }
  });

  // 동일 이메일로 두 번째 사용자 생성 시도
  await expect(
    prisma.user.create({
      data: {
        email: 'existing@example.com',
        password: hashedPassword,
        name: '새 사용자',
        roleId: 1
      }
    })
  ).rejects.toThrow();

  // Prisma 에러 코드 확인
  try {
    await prisma.user.create({
      data: {
        email: 'existing@example.com',
        password: hashedPassword,
        name: '새 사용자',
        roleId: 1
      }
    });
  } catch (error: any) {
    expect(error.code).toBe('P2002');
    expect(error.meta?.target).toContain('email');
  }
});
```

#### UT-003: Role 정상 생성

| 항목 | 내용 |
|------|------|
| **파일** | `prisma/__tests__/role.model.test.ts` |
| **테스트 블록** | `describe('Role Model') -> it('should create role with valid data')` |
| **입력 데이터** | `{ code: 'OPERATOR', name: '현장 작업자' }` |
| **검증 포인트** | id 자동 생성, createdAt 설정 |
| **관련 요구사항** | FR-002 |

```typescript
import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Role Model', () => {
  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
  });

  it('should create role with valid data', async () => {
    const role = await prisma.role.create({
      data: {
        code: 'OPERATOR',
        name: '현장 작업자'
      }
    });

    expect(role.id).toBeDefined();
    expect(role.code).toBe('OPERATOR');
    expect(role.name).toBe('현장 작업자');
    expect(role.createdAt).toBeInstanceOf(Date);
  });
});
```

#### UT-004: Role 코드 중복 시 에러

| 항목 | 내용 |
|------|------|
| **파일** | `prisma/__tests__/role.model.test.ts` |
| **테스트 블록** | `describe('Role Model') -> it('should throw error for duplicate code')` |
| **사전 조건** | 동일 code의 Role 이미 존재 |
| **입력 데이터** | `{ code: 'ADMIN', name: '다른 이름' }` |
| **검증 포인트** | Prisma P2002 에러 발생 |
| **관련 요구사항** | BR-002 |

```typescript
it('should throw error for duplicate code', async () => {
  // 첫 번째 역할 생성
  await prisma.role.create({
    data: { code: 'ADMIN', name: '시스템 관리자' }
  });

  // 동일 코드로 두 번째 역할 생성 시도
  try {
    await prisma.role.create({
      data: { code: 'ADMIN', name: '다른 관리자' }
    });
    expect.fail('Should have thrown an error');
  } catch (error: any) {
    expect(error.code).toBe('P2002');
    expect(error.meta?.target).toContain('code');
  }
});
```

#### UT-005: User-Role 관계 조회

| 항목 | 내용 |
|------|------|
| **파일** | `prisma/__tests__/user.model.test.ts` |
| **테스트 블록** | `describe('User Model') -> it('should include role in user query')` |
| **사전 조건** | User와 연결된 Role 존재 |
| **검증 포인트** | include 옵션으로 role 객체 조회 가능 |
| **관련 요구사항** | FR-003 |

```typescript
it('should include role in user query', async () => {
  const hashedPassword = await hashPassword('password123');

  // Role 생성
  const role = await prisma.role.create({
    data: { code: 'MANAGER', name: '생산 관리자' }
  });

  // User 생성
  await prisma.user.create({
    data: {
      email: 'manager@example.com',
      password: hashedPassword,
      name: '관리자',
      roleId: role.id
    }
  });

  // 관계 포함 조회
  const userWithRole = await prisma.user.findUnique({
    where: { email: 'manager@example.com' },
    include: { role: true }
  });

  expect(userWithRole).not.toBeNull();
  expect(userWithRole?.role).toBeDefined();
  expect(userWithRole?.role.code).toBe('MANAGER');
  expect(userWithRole?.role.name).toBe('생산 관리자');
});
```

#### UT-006: 비밀번호 해시 생성

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/password.test.ts` |
| **테스트 블록** | `describe('Password Utility') -> it('should generate bcrypt hash')` |
| **입력 데이터** | `'password123'` |
| **검증 포인트** | bcrypt 해시 형식 (`$2b$` 또는 `$2a$` 접두사), 원본과 다름 |
| **관련 요구사항** | BR-003 |

```typescript
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('Password Utility', () => {
  it('should generate bcrypt hash', async () => {
    const plainPassword = 'password123';
    const hashed = await hashPassword(plainPassword);

    // bcrypt 해시 형식 검증
    expect(hashed).toMatch(/^\$2[aby]\$\d{2}\$/);

    // 원본과 다름
    expect(hashed).not.toBe(plainPassword);

    // 해시 길이 확인 (bcrypt는 60자)
    expect(hashed.length).toBe(60);
  });
});
```

#### UT-007: 비밀번호 해시 검증 성공

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/password.test.ts` |
| **테스트 블록** | `describe('Password Utility') -> it('should verify correct password')` |
| **입력 데이터** | 원본 비밀번호와 해당 해시 |
| **검증 포인트** | `verifyPassword` 함수가 `true` 반환 |
| **관련 요구사항** | BR-003 |

```typescript
it('should verify correct password', async () => {
  const plainPassword = 'password123';
  const hashed = await hashPassword(plainPassword);

  const isValid = await verifyPassword(plainPassword, hashed);

  expect(isValid).toBe(true);
});
```

#### UT-008: 비밀번호 해시 검증 실패

| 항목 | 내용 |
|------|------|
| **파일** | `lib/auth/__tests__/password.test.ts` |
| **테스트 블록** | `describe('Password Utility') -> it('should reject incorrect password')` |
| **입력 데이터** | 잘못된 비밀번호와 해시 |
| **검증 포인트** | `verifyPassword` 함수가 `false` 반환 |
| **관련 요구사항** | BR-003 |

```typescript
it('should reject incorrect password', async () => {
  const plainPassword = 'password123';
  const wrongPassword = 'wrongpassword';
  const hashed = await hashPassword(plainPassword);

  const isValid = await verifyPassword(wrongPassword, hashed);

  expect(isValid).toBe(false);
});
```

#### UT-009: 비활성 사용자 조회

| 항목 | 내용 |
|------|------|
| **파일** | `prisma/__tests__/user.model.test.ts` |
| **테스트 블록** | `describe('User Model') -> it('should handle inactive user')` |
| **입력 데이터** | `{ ..., isActive: false }` |
| **검증 포인트** | isActive 필드가 false로 저장 및 조회됨 |
| **관련 요구사항** | FR-004 |

```typescript
it('should handle inactive user', async () => {
  const hashedPassword = await hashPassword('password123');

  const user = await prisma.user.create({
    data: {
      email: 'inactive@example.com',
      password: hashedPassword,
      name: '비활성 사용자',
      roleId: 1,
      isActive: false
    }
  });

  expect(user.isActive).toBe(false);

  // 비활성 사용자 필터링 조회
  const activeUsers = await prisma.user.findMany({
    where: { isActive: true }
  });

  expect(activeUsers.find(u => u.email === 'inactive@example.com')).toBeUndefined();
});
```

#### UT-010: User 수정 시 updatedAt 갱신

| 항목 | 내용 |
|------|------|
| **파일** | `prisma/__tests__/user.model.test.ts` |
| **테스트 블록** | `describe('User Model') -> it('should update updatedAt on modification')` |
| **검증 포인트** | update 후 updatedAt이 createdAt보다 이후 시간 |
| **관련 요구사항** | FR-005 |

```typescript
it('should update updatedAt on modification', async () => {
  const hashedPassword = await hashPassword('password123');

  const user = await prisma.user.create({
    data: {
      email: 'update@example.com',
      password: hashedPassword,
      name: '수정 테스트',
      roleId: 1
    }
  });

  const originalUpdatedAt = user.updatedAt;

  // 약간의 지연 후 수정
  await new Promise(resolve => setTimeout(resolve, 100));

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { name: '수정된 이름' }
  });

  expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
  expect(updatedUser.name).toBe('수정된 이름');
});
```

#### UT-011: 역할별 사용자 목록 조회

| 항목 | 내용 |
|------|------|
| **파일** | `prisma/__tests__/role.model.test.ts` |
| **테스트 블록** | `describe('Role Model') -> it('should include users in role query')` |
| **사전 조건** | Role에 연결된 User들 존재 |
| **검증 포인트** | include 옵션으로 users 배열 조회 가능 |
| **관련 요구사항** | FR-006 |

```typescript
it('should include users in role query', async () => {
  const hashedPassword = await hashPassword('password123');

  // Role 생성
  const role = await prisma.role.create({
    data: { code: 'OPERATOR', name: '현장 작업자' }
  });

  // 해당 Role의 User 2명 생성
  await prisma.user.createMany({
    data: [
      { email: 'op1@example.com', password: hashedPassword, name: '작업자1', roleId: role.id },
      { email: 'op2@example.com', password: hashedPassword, name: '작업자2', roleId: role.id }
    ]
  });

  // 관계 포함 조회
  const roleWithUsers = await prisma.role.findUnique({
    where: { code: 'OPERATOR' },
    include: { users: true }
  });

  expect(roleWithUsers).not.toBeNull();
  expect(roleWithUsers?.users).toHaveLength(2);
  expect(roleWithUsers?.users.map(u => u.email)).toContain('op1@example.com');
  expect(roleWithUsers?.users.map(u => u.email)).toContain('op2@example.com');
});
```

---

## 3. 통합 테스트 시나리오 (시드 데이터 검증)

### 3.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| IT-001 | seed.ts | 역할 시드 생성 | ADMIN, MANAGER, OPERATOR 역할 생성 | FR-007 |
| IT-002 | seed.ts | 관리자 계정 시드 생성 | admin@example.com 계정 생성 | FR-008 |
| IT-003 | seed.ts | 시드 비밀번호 해시 확인 | 평문이 아닌 해시로 저장 | BR-003 |
| IT-004 | seed.ts | 중복 실행 시 안전성 | upsert로 에러 없이 처리 | BR-004 |
| IT-005 | seed.ts | 테스트 사용자 역할 매핑 | 각 역할에 테스트 사용자 연결 | FR-009 |

### 3.2 테스트 케이스 상세

#### IT-001: 역할 시드 생성 확인

| 항목 | 내용 |
|------|------|
| **파일** | `prisma/__tests__/seed.test.ts` |
| **테스트 블록** | `describe('Seed Script') -> it('should create default roles')` |
| **사전 조건** | 빈 데이터베이스 |
| **실행 방법** | seed 함수 직접 호출 또는 `prisma db seed` 실행 후 검증 |
| **검증 포인트** | ADMIN, MANAGER, OPERATOR 역할 존재 |
| **관련 요구사항** | FR-007 |

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { seed } from '../seed';

const prisma = new PrismaClient();

describe('Seed Script', () => {
  beforeAll(async () => {
    // 기존 데이터 정리
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    // 시드 실행
    await seed();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.$disconnect();
  });

  it('should create default roles', async () => {
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' }
    });

    expect(roles).toHaveLength(3);

    const roleCodes = roles.map(r => r.code);
    expect(roleCodes).toContain('ADMIN');
    expect(roleCodes).toContain('MANAGER');
    expect(roleCodes).toContain('OPERATOR');

    // 역할 이름 확인
    const adminRole = roles.find(r => r.code === 'ADMIN');
    expect(adminRole?.name).toBe('시스템 관리자');

    const managerRole = roles.find(r => r.code === 'MANAGER');
    expect(managerRole?.name).toBe('생산 관리자');

    const operatorRole = roles.find(r => r.code === 'OPERATOR');
    expect(operatorRole?.name).toBe('현장 작업자');
  });
});
```

#### IT-002: 관리자 계정 시드 생성 확인

| 항목 | 내용 |
|------|------|
| **파일** | `prisma/__tests__/seed.test.ts` |
| **테스트 블록** | `describe('Seed Script') -> it('should create admin user')` |
| **검증 포인트** | admin@example.com 계정 존재, ADMIN 역할 연결 |
| **관련 요구사항** | FR-008 |

```typescript
it('should create admin user', async () => {
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
    include: { role: true }
  });

  expect(adminUser).not.toBeNull();
  expect(adminUser?.name).toBe('관리자');
  expect(adminUser?.role.code).toBe('ADMIN');
  expect(adminUser?.isActive).toBe(true);
});
```

#### IT-003: 시드 비밀번호 해시 확인

| 항목 | 내용 |
|------|------|
| **파일** | `prisma/__tests__/seed.test.ts` |
| **테스트 블록** | `describe('Seed Script') -> it('should store hashed passwords')` |
| **검증 포인트** | password 필드가 bcrypt 해시 형식, 평문이 아님 |
| **관련 요구사항** | BR-003 |

```typescript
it('should store hashed passwords', async () => {
  const users = await prisma.user.findMany();

  for (const user of users) {
    // bcrypt 해시 형식 검증 ($2b$ 또는 $2a$ 접두사)
    expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$/);

    // 평문 비밀번호가 아님
    expect(user.password).not.toBe('password123');

    // 해시 길이 60자
    expect(user.password.length).toBe(60);
  }
});
```

#### IT-004: 중복 실행 시 안전성

| 항목 | 내용 |
|------|------|
| **파일** | `prisma/__tests__/seed.test.ts` |
| **테스트 블록** | `describe('Seed Script') -> it('should handle duplicate seed execution')` |
| **실행 방법** | seed 함수 2번 연속 실행 |
| **검증 포인트** | 에러 없이 완료, 데이터 중복 없음 |
| **관련 요구사항** | BR-004 |

```typescript
it('should handle duplicate seed execution', async () => {
  // 이미 beforeAll에서 한 번 실행됨
  // 두 번째 실행도 에러 없어야 함
  await expect(seed()).resolves.not.toThrow();

  // 역할 중복 없음
  const roles = await prisma.role.findMany();
  expect(roles).toHaveLength(3);

  // 사용자 중복 없음
  const users = await prisma.user.findMany();
  expect(users).toHaveLength(3); // admin, manager, operator
});
```

#### IT-005: 테스트 사용자 역할 매핑 확인

| 항목 | 내용 |
|------|------|
| **파일** | `prisma/__tests__/seed.test.ts` |
| **테스트 블록** | `describe('Seed Script') -> it('should map test users to roles')` |
| **검증 포인트** | 각 역할에 해당하는 테스트 사용자 존재 |
| **관련 요구사항** | FR-009 |

```typescript
it('should map test users to roles', async () => {
  // 관리자 - ADMIN 역할
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
    include: { role: true }
  });
  expect(admin?.role.code).toBe('ADMIN');

  // 생산관리자 - MANAGER 역할
  const manager = await prisma.user.findUnique({
    where: { email: 'manager@example.com' },
    include: { role: true }
  });
  expect(manager?.role.code).toBe('MANAGER');

  // 작업자 - OPERATOR 역할
  const operator = await prisma.user.findUnique({
    where: { email: 'operator@example.com' },
    include: { role: true }
  });
  expect(operator?.role.code).toBe('OPERATOR');
});
```

---

## 4. E2E 테스트 시나리오

> **해당 없음**: 이 Task는 백엔드 데이터 모델 구현으로, UI가 없습니다.
>
> E2E 테스트는 TSK-04-04 (로그인 페이지)에서 인증 플로우 전체를 검증합니다.

---

## 5. UI 테스트케이스 (매뉴얼)

> **해당 없음**: 이 Task는 백엔드 데이터 모델 구현으로, 직접적인 UI가 없습니다.
>
> 데이터 모델의 UI 관련 테스트는 다음 Task에서 수행됩니다:
> - TSK-04-04 (로그인 페이지): 로그인 폼 UI 테스트
> - TSK-01-02 (헤더 컴포넌트): 사용자 프로필 표시 테스트

---

## 6. 테스트 데이터 (Fixture)

### 6.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-ROLE-ADMIN | 관리자 역할 | `{ id: 1, code: 'ADMIN', name: '시스템 관리자' }` |
| MOCK-ROLE-MANAGER | 관리자 역할 | `{ id: 2, code: 'MANAGER', name: '생산 관리자' }` |
| MOCK-ROLE-OPERATOR | 작업자 역할 | `{ id: 3, code: 'OPERATOR', name: '현장 작업자' }` |
| MOCK-USER-ADMIN | 관리자 사용자 | `{ id: 1, email: 'admin@example.com', name: '관리자', roleId: 1, isActive: true }` |
| MOCK-USER-INACTIVE | 비활성 사용자 | `{ id: 4, email: 'inactive@example.com', name: '비활성', roleId: 3, isActive: false }` |
| MOCK-PASSWORD-PLAIN | 테스트 비밀번호 | `'password123'` |

### 6.2 시드 데이터 (prisma/seed.ts)

| 시드 ID | 용도 | 데이터 |
|---------|------|--------|
| SEED-ROLE-ADMIN | 관리자 역할 | `{ code: 'ADMIN', name: '시스템 관리자' }` |
| SEED-ROLE-MANAGER | 관리자 역할 | `{ code: 'MANAGER', name: '생산 관리자' }` |
| SEED-ROLE-OPERATOR | 작업자 역할 | `{ code: 'OPERATOR', name: '현장 작업자' }` |
| SEED-USER-ADMIN | 관리자 계정 | `{ email: 'admin@example.com', password: '<hashed>', name: '관리자', roleId: 1 }` |
| SEED-USER-MANAGER | 관리자 계정 | `{ email: 'manager@example.com', password: '<hashed>', name: '생산관리자', roleId: 2 }` |
| SEED-USER-OPERATOR | 작업자 계정 | `{ email: 'operator@example.com', password: '<hashed>', name: '작업자', roleId: 3 }` |

### 6.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 (원문) | 역할 | 용도 |
|---------|--------|----------------|------|------|
| SEED-USER-ADMIN | admin@example.com | password123 | ADMIN | 관리자 기능 테스트 |
| SEED-USER-MANAGER | manager@example.com | password123 | MANAGER | 관리자 기능 테스트 |
| SEED-USER-OPERATOR | operator@example.com | password123 | OPERATOR | 일반 사용자 기능 테스트 |

> **보안 참고**: 위 비밀번호는 개발/테스트 환경 전용입니다. 프로덕션에서는 사용하지 않습니다.

---

## 7. data-testid 목록

> **해당 없음**: 이 Task는 백엔드 데이터 모델 구현으로, UI 컴포넌트가 없습니다.

---

## 8. 테스트 커버리지 목표

### 8.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 90% | 80% |
| Branches | 85% | 75% |
| Functions | 95% | 85% |
| Statements | 90% | 80% |

### 8.2 커버리지 대상 파일

| 파일 | 설명 | 목표 커버리지 |
|------|------|--------------|
| `lib/auth/password.ts` | 비밀번호 해시 유틸리티 | 100% |
| `prisma/seed.ts` | 시드 스크립트 | 90% |

### 8.3 통합 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 시드 데이터 항목 | 100% 커버 (3 역할, 3 사용자) |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

---

## 9. 테스트 실행 가이드

### 9.1 테스트 환경 설정

```bash
# 테스트용 환경변수 설정 (.env.test)
DATABASE_URL="file:./test.db"

# 테스트 DB 초기화
npx prisma db push --accept-data-loss

# 테스트 실행
pnpm test
```

### 9.2 테스트 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm test` | 모든 테스트 실행 |
| `pnpm test:unit` | 단위 테스트만 실행 |
| `pnpm test:integration` | 통합 테스트만 실행 |
| `pnpm test:coverage` | 커버리지 리포트 생성 |
| `pnpm test -- --watch` | 워치 모드로 테스트 실행 |

### 9.3 테스트 파일 구조

```
mes-portal/
├── prisma/
│   ├── __tests__/
│   │   ├── user.model.test.ts      # User 모델 단위 테스트
│   │   ├── role.model.test.ts      # Role 모델 단위 테스트
│   │   └── seed.test.ts            # 시드 스크립트 통합 테스트
│   └── seed.ts                     # 시드 스크립트
├── lib/
│   └── auth/
│       ├── __tests__/
│       │   └── password.test.ts    # 비밀번호 유틸리티 테스트
│       └── password.ts             # 비밀번호 해시 유틸리티
└── vitest.config.ts                # Vitest 설정
```

---

## 10. 요구사항 추적

### 10.1 기능 요구사항 (FR) 매핑

| 요구사항 ID | 설명 | 테스트 ID |
|------------|------|----------|
| FR-001 | User 생성 기능 | UT-001 |
| FR-002 | Role 생성 기능 | UT-003 |
| FR-003 | User-Role 관계 조회 | UT-005 |
| FR-004 | 비활성 사용자 처리 | UT-009 |
| FR-005 | User 수정 시 타임스탬프 갱신 | UT-010 |
| FR-006 | 역할별 사용자 목록 조회 | UT-011 |
| FR-007 | 기본 역할 시드 | IT-001 |
| FR-008 | 관리자 계정 시드 | IT-002 |
| FR-009 | 테스트 사용자 역할 매핑 | IT-005 |

### 10.2 비즈니스 규칙 (BR) 매핑

| 규칙 ID | 설명 | 테스트 ID |
|---------|------|----------|
| BR-001 | 이메일 중복 불가 | UT-002 |
| BR-002 | 역할 코드 중복 불가 | UT-004 |
| BR-003 | 비밀번호 bcrypt 해시 저장 | UT-006, UT-007, UT-008, IT-003 |
| BR-004 | 시드 스크립트 멱등성 | IT-004 |

---

## 관련 문서

- 설계 문서: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- TRD: `.orchay/projects/mes-portal/trd.md`
- PRD: `.orchay/projects/mes-portal/prd.md`
- 선행 Task: TSK-04-01 (Prisma 및 SQLite 설정)
- 후속 Task: TSK-04-03 (Auth.js 인증 설정), TSK-04-04 (로그인 페이지)

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |
