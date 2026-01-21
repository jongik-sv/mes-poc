# 구현 보고서 (030-implementation.md)

**Template Version:** 2.0.0 — **Last Updated:** 2026-01-21

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| 문서명 | `030-implementation.md` |
| Task ID | TSK-03-02 |
| Task 명 | 역할-메뉴 매핑 |
| 작성일 | 2026-01-21 |
| 작성자 | Claude |
| 참조 설계서 | `./010-design.md` |
| 구현 기간 | 2026-01-21 |
| 구현 상태 | ✅ 완료 |

---

## 1. 구현 개요

### 1.1 구현 목적
- 역할(Role)별로 접근 가능한 메뉴를 제한하여 RBAC(Role-Based Access Control) 구현
- RoleMenu 테이블을 통한 역할-메뉴 매핑 관리
- 메뉴 조회 시 현재 사용자의 역할에 따라 자동 필터링

### 1.2 구현 범위

**포함된 기능:**
- RoleMenu Prisma 모델 정의 및 관계 설정
- 역할-메뉴 매핑 시드 데이터 (ADMIN, MANAGER, OPERATOR)
- MenuService에 역할 기반 메뉴 조회 메서드 추가
- BR-02 규칙: 자식 메뉴 권한 시 부모 메뉴 자동 포함

**제외된 기능 (향후 구현 예정):**
- 메뉴 관리 UI (관리자 화면) - MVP 이후
- 동적 권한 변경 API - MVP 이후
- 메뉴 API 엔드포인트 구현 (TSK-03-03에서 처리)

### 1.3 구현 유형
- [x] Backend Only
- [ ] Frontend Only
- [ ] Full-stack

### 1.4 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16.x, React 19.x |
| ORM | Prisma 7.x |
| Database | SQLite (PoC) |
| Testing | Vitest 4.x |
| Language | TypeScript 5.x |

---

## 2. Backend 구현 결과

### 2.1 구현된 컴포넌트

#### 2.1.1 Prisma Model (RoleMenu)

**파일**: `prisma/schema.prisma`

```prisma
model RoleMenu {
  id     Int @id @default(autoincrement())
  roleId Int
  menuId Int

  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)
  menu Menu @relation(fields: [menuId], references: [id], onDelete: Cascade)

  @@unique([roleId, menuId])
  @@index([roleId])
  @@index([menuId])
  @@map("role_menus")
}
```

**관계 설정:**
- Role 모델에 `roleMenus RoleMenu[]` 관계 추가
- Menu 모델에 `roleMenus RoleMenu[]` 관계 추가

#### 2.1.2 Service (MenuService 확장)

**파일**: `lib/services/menu.service.ts`

**추가된 메서드:**

| 메서드 | 설명 | 비즈니스 규칙 |
|--------|------|--------------|
| `findByRole(roleId)` | 역할별 메뉴 조회 | BR-01, BR-02, BR-03 |
| `expandParentMenuIds()` | 자식 → 부모 메뉴 ID 확장 | BR-02 |

**주요 비즈니스 로직:**
- **BR-01**: 역할에 매핑된 메뉴만 반환
- **BR-02**: 자식 메뉴 권한이 있으면 부모 메뉴 자동 포함
- **BR-03**: ADMIN 역할(ID=1)은 모든 메뉴 반환

#### 2.1.3 Seed Data (역할-메뉴 매핑)

**파일**: `prisma/seed.ts`

**매핑 현황:**

| 역할 | 매핑된 메뉴 수 | 주요 메뉴 |
|------|--------------|----------|
| ADMIN | 15개 | 모든 활성 메뉴 |
| MANAGER | 11개 | 대시보드, 생산 관리, 샘플 화면 |
| OPERATOR | 6개 | 대시보드, 작업 지시, 생산 실적 입력 |

### 2.2 TDD 테스트 결과

#### 2.2.1 테스트 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| `menu.service.ts` | 83.08% | 71.68% | 100% | 83.2% |
| **전체** | **83.08%** | **71.68%** | **100%** | **83.2%** |

**품질 기준 달성 여부:**
- ✅ 테스트 커버리지 80% 이상: 83.08%
- ✅ 모든 테스트 통과: 41/41 통과
- ✅ 기능 요구사항 100% 커버: 3/3
- ✅ 비즈니스 규칙 100% 커버: 5/5

#### 2.2.2 테스트 시나리오 매핑

| 테스트 ID | 설계 시나리오 | 결과 | 비고 |
|-----------|-------------|------|------|
| UT-001 | OPERATOR 역할 메뉴 조회 | ✅ Pass | FR-001, BR-01 |
| UT-002 | MANAGER 역할 메뉴 조회 | ✅ Pass | FR-001, BR-01 |
| UT-003 | 자식 권한 시 부모 포함 | ✅ Pass | FR-002, BR-02 |
| UT-004 | 메뉴 정렬 순서 | ✅ Pass | FR-003 |
| UT-005 | ADMIN 전체 메뉴 | ✅ Pass | BR-03 |
| UT-006 | 중복 매핑 방지 | ✅ Pass | BR-04 |
| Model Tests | Cascade 삭제, 관계 조회 | ✅ Pass | BR-05 |

#### 2.2.3 테스트 실행 결과

```
✓ lib/services/__tests__/menu.service.spec.ts (33 tests) 28ms
✓ prisma/__tests__/role-menu.model.test.ts (8 tests) 121ms

 Test Files  2 passed (2)
      Tests  41 passed (41)
   Duration  2.22s
```

---

## 3. 요구사항 커버리지

### 3.1 기능 요구사항 커버리지

| 요구사항 ID | 요구사항 설명 | 테스트 ID | 결과 |
|-------------|-------------|-----------|------|
| FR-001 | 사용자 권한별 메뉴 필터링 | UT-001, UT-002 | ✅ |
| FR-002 | 계층형 메뉴 구조 지원 | UT-003 | ✅ |
| FR-003 | 메뉴 순서 관리 | UT-004 | ✅ |

### 3.2 비즈니스 규칙 커버리지

| 규칙 ID | 규칙 설명 | 테스트 ID | 결과 |
|---------|----------|-----------|------|
| BR-01 | 역할 기반 메뉴 필터링 | UT-001, UT-002 | ✅ |
| BR-02 | 자식 → 부모 자동 표시 | UT-003 | ✅ |
| BR-03 | ADMIN 전체 메뉴 접근 | UT-005 | ✅ |
| BR-04 | 중복 매핑 방지 | UT-006 | ✅ |
| BR-05 | Cascade 삭제 | Model Tests | ✅ |

---

## 4. 주요 기술적 결정사항

### 4.1 아키텍처 결정

1. **SYSTEM_ADMIN_ROLE_ID 상수 사용**
   - 배경: ADMIN 역할 식별 시 문자열 비교 대신 ID 기반 검증 필요
   - 선택: 상수 `SYSTEM_ADMIN_ROLE_ID = 1` 정의
   - 근거: 문자열 비교는 대소문자 변형 공격 가능성이 있어 보안상 ID 기반 검증 권장

2. **BR-02 규칙 구현 (자식 → 부모 자동 포함)**
   - 배경: RoleMenu에 자식 메뉴만 매핑해도 부모 메뉴가 네비게이션에 표시되어야 함
   - 선택: `expandParentMenuIds()` 메서드로 부모 체인 추론
   - 근거: 매핑 데이터 중복 방지, 유지보수 용이성

3. **Cascade 삭제 설정**
   - 배경: Role/Menu 삭제 시 관련 RoleMenu 매핑 처리 필요
   - 선택: `onDelete: Cascade` 옵션 적용
   - 근거: 데이터 무결성 유지, 고아 레코드 방지

### 4.2 구현 패턴

- **디자인 패턴**: Service Layer Pattern (비즈니스 로직 캡슐화)
- **코드 컨벤션**: CLAUDE.md 스타일 가이드 준수
- **에러 핸들링**: MenuServiceError 커스텀 에러 클래스 활용

---

## 5. 알려진 이슈 및 제약사항

### 5.1 알려진 이슈

| 이슈 ID | 이슈 내용 | 심각도 | 해결 계획 |
|---------|----------|--------|----------|
| - | 없음 | - | - |

### 5.2 기술적 제약사항
- TSK-03-01 (Menu 테이블)과 TSK-04-02 (Role 테이블)에 의존
- 메뉴 API 엔드포인트는 TSK-03-03에서 구현 예정

### 5.3 향후 개선 필요 사항
- 관리자 화면에서 역할-메뉴 매핑 동적 관리 기능
- 캐싱 적용을 통한 메뉴 조회 성능 최적화

---

## 6. 구현 완료 체크리스트

### 6.1 Backend 체크리스트
- [x] Prisma 스키마 정의 완료 (RoleMenu 모델)
- [x] 관계 설정 완료 (Role ↔ RoleMenu ↔ Menu)
- [x] 시드 데이터 구현 완료
- [x] MenuService 확장 완료 (findByRole)
- [x] TDD 테스트 작성 및 통과 (커버리지 83%)
- [x] 요구사항 커버리지 100% 달성

### 6.2 통합 체크리스트
- [x] 설계서 요구사항 충족 확인
- [x] 테스트 결과서 작성 (070-tdd-test-results.md)
- [x] 구현 보고서 작성 (030-implementation.md)
- [ ] WBS 상태 업데이트 (`[ap]` → `[im]`)
- [ ] Git 커밋

---

## 7. 참고 자료

### 7.1 관련 문서
- 설계 문서: `./010-design.md`
- 추적성 매트릭스: `./025-traceability-matrix.md`
- 테스트 명세서: `./026-test-specification.md`
- PRD: `.orchay/projects/mes-portal/prd.md`
- TRD: `.orchay/projects/mes-portal/trd.md`

### 7.2 테스트 결과 파일
- TDD 테스트 결과: `./070-tdd-test-results.md`
- 커버리지 리포트: `test-results/20260121-213324/tdd/`

### 7.3 소스 코드 위치
- Prisma Schema: `prisma/schema.prisma`
- Seed Data: `prisma/seed.ts`
- MenuService: `lib/services/menu.service.ts`
- Tests: `lib/services/__tests__/menu.service.spec.ts`, `prisma/__tests__/role-menu.model.test.ts`

---

## 8. 다음 단계

### 8.1 현재 Task 완료
- [x] 구현 완료
- [x] 테스트 통과
- [ ] 상태 전환 및 Git 커밋

### 8.2 다음 워크플로우
- TSK-03-03: 메뉴 API 엔드포인트 구현 (역할 기반 필터링 적용)

---

## 부록: 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-01-21 | Claude | 최초 작성 |
