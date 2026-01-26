# 테스트 명세서 (026-test-specification.md)

**Task ID:** TSK-03-01
**Task명:** 역할/권한 CRUD API
**Last Updated:** 2026-01-26

---

## 1. 테스트 범위

### 1.1 In-Scope

- 역할(Role) CRUD API
- 권한(Permission) CRUD API
- 역할-권한 매핑 API
- 사용자-역할 할당 API

### 1.2 Out-of-Scope

- CASL 기반 미들웨어 (TSK-03-02)
- usePermission Hook (TSK-03-03)
- E2E 테스트

---

## 2. 단위 테스트 명세

### 2.1 역할 API 테스트

| 테스트 ID | 테스트명 | 입력 | 예상 결과 |
|----------|---------|------|----------|
| UT-ROLE-001 | 인증되지 않은 GET 요청 | session: null | 401 UNAUTHORIZED |
| UT-ROLE-002 | 역할 목록 조회 성공 | session: valid | 200, items 배열 |
| UT-ROLE-003 | 페이지네이션 파라미터 적용 | page=2, pageSize=5 | skip=5, take=5 |
| UT-ROLE-004 | 검색어 필터링 | search=ADMIN | OR 조건 검색 |
| UT-ROLE-005 | 활성화 상태 필터링 | isActive=true | isActive: true |
| UT-ROLE-006 | 인증되지 않은 POST 요청 | session: null | 401 UNAUTHORIZED |
| UT-ROLE-007 | 비관리자 POST 요청 | role: OPERATOR | 403 FORBIDDEN |
| UT-ROLE-008 | 필수 필드 누락 | { name: '...' } | 400 VALIDATION_ERROR |
| UT-ROLE-009 | 중복 코드 생성 | code: 'SYSTEM_ADMIN' | 409 DUPLICATE_CODE |
| UT-ROLE-010 | 역할 생성 성공 | { code, name } | 201, role 객체 |
| UT-ROLE-011 | 부모 역할 있을 때 레벨 계산 | parentId: 1 | level: parent.level + 1 |
| UT-ROLE-012 | 인증되지 않은 상세 조회 | session: null | 401 UNAUTHORIZED |
| UT-ROLE-013 | 존재하지 않는 역할 조회 | id: 999 | 404 ROLE_NOT_FOUND |
| UT-ROLE-014 | 역할 상세 조회 성공 | id: 1 | 200, permissions/users 포함 |
| UT-ROLE-015 | 비관리자 PUT 요청 | role: OPERATOR | 403 FORBIDDEN |
| UT-ROLE-016 | 존재하지 않는 역할 수정 | id: 999 | 404 ROLE_NOT_FOUND |
| UT-ROLE-017 | 역할 수정 성공 | { name: '...' } | 200, 감사 로그 생성 |
| UT-ROLE-018 | parentId 변경 시 레벨 재계산 | parentId: 1 | level 재계산 |
| UT-ROLE-019 | 비관리자 DELETE 요청 | role: OPERATOR | 403 FORBIDDEN |
| UT-ROLE-020 | 존재하지 않는 역할 삭제 | id: 999 | 404 ROLE_NOT_FOUND |
| UT-ROLE-021 | 시스템 역할 삭제 (BR-03-01) | isSystem: true | 400 SYSTEM_ROLE_DELETE |
| UT-ROLE-022 | 일반 역할 삭제 성공 | isSystem: false | 200, 감사 로그 생성 |

### 2.2 권한 API 테스트

| 테스트 ID | 테스트명 | 입력 | 예상 결과 |
|----------|---------|------|----------|
| UT-PERM-001 | 인증되지 않은 GET 요청 | session: null | 401 UNAUTHORIZED |
| UT-PERM-002 | 권한 목록 조회 성공 | session: valid | 200, items 배열 |
| UT-PERM-003 | 타입별 필터링 | type=API | type: 'API' |
| UT-PERM-004 | 검색어 필터링 | search=user | OR 조건 검색 |
| UT-PERM-005 | 인증되지 않은 POST 요청 | session: null | 401 UNAUTHORIZED |
| UT-PERM-006 | 비관리자 POST 요청 | role: OPERATOR | 403 FORBIDDEN |
| UT-PERM-007 | 필수 필드 누락 | { name: '...' } | 400 VALIDATION_ERROR |
| UT-PERM-008 | 중복 코드 생성 | code: 'user:read' | 409 DUPLICATE_CODE |
| UT-PERM-009 | 권한 생성 성공 | { code, name, type, ... } | 201, permission 객체 |
| UT-PERM-010 | 인증되지 않은 상세 조회 | session: null | 401 UNAUTHORIZED |
| UT-PERM-011 | 존재하지 않는 권한 조회 | id: 999 | 404 PERMISSION_NOT_FOUND |
| UT-PERM-012 | 권한 상세 조회 성공 | id: 1 | 200, roles 포함 |
| UT-PERM-013 | 비관리자 PUT 요청 | role: OPERATOR | 403 FORBIDDEN |
| UT-PERM-014 | 존재하지 않는 권한 수정 | id: 999 | 404 PERMISSION_NOT_FOUND |
| UT-PERM-015 | 권한 수정 성공 | { name: '...' } | 200, 감사 로그 생성 |
| UT-PERM-016 | 비관리자 DELETE 요청 | role: OPERATOR | 403 FORBIDDEN |
| UT-PERM-017 | 존재하지 않는 권한 삭제 | id: 999 | 404 PERMISSION_NOT_FOUND |
| UT-PERM-018 | 권한 삭제 성공 | id: 1 | 200, 감사 로그 생성 |

### 2.3 역할-권한 매핑 API 테스트

| 테스트 ID | 테스트명 | 입력 | 예상 결과 |
|----------|---------|------|----------|
| UT-RP-001 | 인증되지 않은 PUT 요청 | session: null | 401 UNAUTHORIZED |
| UT-RP-002 | 비관리자 PUT 요청 | role: OPERATOR | 403 FORBIDDEN |
| UT-RP-003 | 존재하지 않는 역할 | id: 999 | 404 ROLE_NOT_FOUND |
| UT-RP-004 | permissionIds 누락 | {} | 400 VALIDATION_ERROR |
| UT-RP-005 | 역할-권한 매핑 성공 | { permissionIds: [1,2] } | 200, permissions 배열 |
| UT-RP-006 | 빈 배열로 모든 권한 해제 | { permissionIds: [] } | 200, permissions: [] |

### 2.4 사용자-역할 할당 API 테스트

| 테스트 ID | 테스트명 | 입력 | 예상 결과 |
|----------|---------|------|----------|
| UT-UR-001 | 인증되지 않은 PUT 요청 | session: null | 401 UNAUTHORIZED |
| UT-UR-002 | 비관리자 PUT 요청 | role: OPERATOR | 403 FORBIDDEN |
| UT-UR-003 | 존재하지 않는 사용자 | id: 999 | 404 USER_NOT_FOUND |
| UT-UR-004 | roleIds 누락 | {} | 400 VALIDATION_ERROR |
| UT-UR-005 | 사용자-역할 할당 성공 | { roleIds: [2,5] } | 200, roles 배열 |
| UT-UR-006 | 빈 배열로 모든 역할 해제 | { roleIds: [] } | 200, roles: [] |

---

## 3. 테스트 환경

- **테스트 프레임워크**: Vitest 4.0.17
- **테스트 환경**: jsdom
- **목킹**: vi.mock for @/auth, @/lib/prisma

---

## 4. 테스트 실행

```bash
# 전체 테스트 실행
pnpm test:run

# 역할/권한 API 테스트만 실행
pnpm test:run --testNamePattern="역할|권한|사용자-역할"
```

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|-----|------|--------|----------|
| 1.0 | 2026-01-26 | Claude | 최초 작성 |
