# 구현 보고서

**Template Version:** 2.0.0 -- **Last Updated:** 2026-01-27

---

## 0. 문서 메타데이터

* **문서명**: `030-implementation.md`
* **Task ID**: TSK-03-01
* **Task 명**: 권한 병합 및 체크 로직 구현
* **작성일**: 2026-01-27
* **작성자**: AI Agent
* **참조 상세설계서**: `./020-detail-design.md`
* **구현 상태**: 완료

---

## 1. 구현 개요

### 1.1 구현 목적
- 사용자에게 할당된 다중 역할(Role)의 권한을 병합하고, 메뉴/액션 단위로 권한을 체크하는 핵심 로직을 구현한다.
- PRD 4.5(권한 병합 규칙), 4.6(권한 체크 흐름), TRD 2.2(Permission 병합 로직) 기반.

### 1.2 구현 범위
- **포함된 기능**:
  - fieldConstraints 병합 로직 (3가지 규칙)
  - menuId 기준 권한 그룹화 및 actions/fieldConstraints 병합
  - 역할 계층 재귀 탐색 (parentRoleId)
  - DB 연동 사용자 전체 권한 병합
  - CASL Ability 정의 함수
  - API 가드 (requireMenuPermission)
  - 클라이언트 권한 체크 Hook (usePermission)

- **제외된 기능** (향후 구현 예정):
  - 권한 캐싱 레이어 (Redis 등)
  - 실시간 권한 변경 반영 (WebSocket)

### 1.3 구현 유형
- [x] Full-stack

### 1.4 기술 스택
- **Backend**:
  - Framework: Next.js 16.x (App Router)
  - ORM: Prisma
  - Auth: CASL
  - Testing: Vitest 4.0.17

- **Frontend**:
  - Framework: React 19.x
  - Hook: usePermission (커스텀)
  - Testing: Vitest 4.0.17 + @testing-library/react

---

## 2. Backend 구현 결과

### 2.1 구현된 컴포넌트

#### 2.1.1 권한 병합 모듈
- **파일**: `mes-portal/lib/auth/permission-merge.ts`
- **주요 함수**:
  | 함수 | 설명 |
  |------|------|
  | `mergeFieldConstraints(a, b)` | fieldConstraints 병합 (3가지 규칙 적용) |
  | `mergePermissions(raw[])` | menuId 기준 그룹화 후 actions/fieldConstraints 병합 |
  | `collectRolePermissions(role)` | 역할 계층 재귀 탐색하여 모든 권한 수집 |
  | `getUserMergedPermissions(userId, systemId?)` | DB 연동 전체 병합 결과 반환 |

- **타입 정의**:
  | 타입 | 설명 |
  |------|------|
  | `RawPermission` | DB에서 조회된 원시 권한 데이터 |
  | `MergedPermission` | 병합 완료된 최종 권한 |
  | `RoleWithPermissions` | 역할 + 권한 + 자식역할 트리 |

#### 2.1.2 CASL Ability 정의
- **파일**: `mes-portal/lib/auth/ability.ts`
- **추가 함수**: `defineAbilityFromMergedPermissions()`
  - MergedPermission 배열을 CASL Ability로 변환

#### 2.1.3 API 가드
- **파일**: `mes-portal/lib/auth/api-guard.ts`
- **추가 함수**: `requireMenuPermission()`
  - API Route에서 메뉴 + 액션 기반 권한 검증

### 2.2 TDD 테스트 결과

#### 2.2.1 테스트 요약
- 총 31개 테스트 전체 통과
- 테스트 실행 시간: 약 1.2초

#### 2.2.2 상세설계 테스트 시나리오 매핑
| 테스트 ID | 상세설계 시나리오 | 결과 | 비고 |
|-----------|------------------|------|------|
| UT-001~008 | mergeFieldConstraints 병합 규칙 | PASS | BR-002, BR-003 검증 |
| UT-009~015 | mergePermissions 그룹화/병합 | PASS | BR-001 검증 |
| UT-016~019 | collectRolePermissions 계층 탐색 | PASS | BR-004 검증 |
| UT-020~025 | defineAbilityFromMergedPermissions | PASS | CASL 연동 |
| UT-026~031 | usePermission Hook | PASS | 클라이언트 권한 체크 |

#### 2.2.3 테스트 실행 결과
```
 permission-merge.test.ts (19 tests) ~800ms
   mergeFieldConstraints (8 tests)
   mergePermissions (7 tests)
   collectRolePermissions (4 tests)

 ability-merged.test.ts (6 tests) ~200ms

 usePermission.test.ts (6 tests) ~200ms

Test Files  3 passed (3)
Tests       31 passed (31)
Duration    ~1.2s
```

---

## 3. Frontend 구현 결과

### 3.1 구현된 컴포넌트

#### 3.1.1 권한 체크 Hook
| 컴포넌트 | 파일 | 설명 | 상태 |
|----------|------|------|------|
| usePermission | `mes-portal/hooks/usePermission.ts` | 클라이언트 권한 체크 Hook | 완료 |

#### 3.1.2 Hook API
- `can(menuId, action)` - 특정 메뉴의 액션 권한 확인
- `getFieldConstraints(menuId, field)` - 필드 제약 조건 조회
- `permissions` - 현재 사용자의 병합된 권한 목록

---

## 4. 요구사항 커버리지

### 4.1 비즈니스 규칙 커버리지
| 규칙 ID | 규칙 설명 | 테스트 ID | 결과 |
|---------|----------|-----------|------|
| BR-001 | actions 합집합 | UT-009~015 | PASS |
| BR-002 | fieldConstraints 같은 필드 값 합집합 | UT-001~008 | PASS |
| BR-003 | fieldConstraints 한쪽 없음 = 제약 해제 (null) | UT-001~008 | PASS |
| BR-004 | Role 계층 자동 상속 (parentRoleId 재귀 탐색) | UT-016~019 | PASS |

### 4.2 PRD/TRD 참조
| 참조 | 내용 |
|------|------|
| PRD 4.5 | 권한 병합 규칙 |
| PRD 4.6 | 권한 체크 흐름 |
| TRD 2.2 | Permission 병합 로직 |

---

## 5. 주요 기술적 결정사항

### 5.1 아키텍처 결정
1. **재귀 탐색 방식으로 역할 계층 처리**
   - 배경: 역할이 N단계 중첩 가능
   - 선택: collectRolePermissions 재귀 함수
   - 대안: 반복문 + 스택 기반 탐색
   - 근거: 역할 계층 깊이가 실무상 3~5단계로 제한적이므로 재귀가 가독성 우수

2. **fieldConstraints null 처리 = 제약 해제**
   - 배경: 두 역할 중 하나만 fieldConstraints를 가질 때의 해석
   - 선택: null = 무제한 (제약 없음)
   - 근거: 최대 허용 원칙(permissive merge) 적용

### 5.2 구현 패턴
- **디자인 패턴**: 함수형 병합 파이프라인 (순수 함수 체이닝)
- **에러 핸들링**: 잘못된 입력에 대해 빈 배열/null 반환 (fail-safe)

---

## 6. 알려진 이슈 및 제약사항

### 6.1 알려진 이슈
| 이슈 ID | 이슈 내용 | 심각도 | 해결 계획 |
|---------|----------|--------|----------|
| ISS-001 | 권한 변경 시 캐시 무효화 미구현 | Medium | TSK-03-xx에서 캐싱 레이어 추가 시 처리 |

### 6.2 기술적 제약사항
- 매 요청마다 DB 조회 발생 (캐싱 미적용)
- 역할 순환 참조 시 무한 재귀 가능 (DB 제약으로 방지 전제)

### 6.3 향후 개선 필요 사항
- Redis 기반 권한 캐싱
- 역할 순환 참조 방지 로직 (visited set)

---

## 7. 구현 완료 체크리스트

### 7.1 Backend 체크리스트
- [x] 권한 병합 로직 구현 완료
- [x] CASL Ability 정의 함수 구현 완료
- [x] API 가드 함수 구현 완료
- [x] TDD 테스트 작성 및 통과 (31/31)
- [x] 정적 분석 통과

### 7.2 Frontend 체크리스트
- [x] usePermission Hook 구현 완료
- [x] Hook 단위 테스트 통과 (6/6)

### 7.3 통합 체크리스트
- [x] 상세설계서 요구사항 충족 확인
- [x] 비즈니스 규칙 커버리지 100% (BR-001~004)
- [x] 문서화 완료

---

## 8. 소스 코드 위치

| 구분 | 파일 경로 |
|------|----------|
| 핵심 병합 로직 | `mes-portal/lib/auth/permission-merge.ts` |
| CASL Ability | `mes-portal/lib/auth/ability.ts` |
| API 가드 | `mes-portal/lib/auth/api-guard.ts` |
| 권한 체크 Hook | `mes-portal/hooks/usePermission.ts` |
| 테스트: 병합 | `mes-portal/lib/auth/__tests__/permission-merge.test.ts` |
| 테스트: Ability | `mes-portal/lib/auth/__tests__/ability-merged.test.ts` |
| 테스트: Hook | `mes-portal/hooks/__tests__/usePermission.test.ts` |

---

## 부록: 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-01-27 | AI Agent | 최초 작성 |
