# 단위 테스트 결과서 (070-tdd-test-results.md)

**Task ID:** TSK-03-02
**Task명:** 메뉴/API 접근 제어 미들웨어
**Last Updated:** 2026-01-26

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-02 |
| Task명 | 메뉴/API 접근 제어 미들웨어 |
| 테스트 일시 | 2026-01-26 |
| 테스트 환경 | Node.js 20.x, Vitest 4.0.17 |
| 상세설계 문서 | `010-design.md` |

---

## 1. 테스트 요약

### 1.1 전체 결과

| 항목 | 수치 | 상태 |
|------|------|------|
| 총 테스트 파일 | 3개 | ✅ |
| 총 테스트 케이스 | 33개 | ✅ |
| 통과 | 33개 | ✅ |
| 실패 | 0개 | ✅ |
| 빌드 | 성공 | ✅ |

### 1.2 테스트 판정

- [x] **PASS**: 모든 테스트 통과, 빌드 성공

---

## 2. 테스트 파일별 결과

### 2.1 CASL Ability 테스트

**파일**: `lib/auth/__tests__/ability.test.ts`

| 테스트 ID | 테스트명 | 결과 |
|----------|---------|------|
| UT-ABILITY-001 | 빈 권한 배열로 Ability 생성 | ✅ |
| UT-ABILITY-002 | 단일 권한으로 Ability 생성 | ✅ |
| UT-ABILITY-003 | 여러 권한으로 Ability 생성 | ✅ |
| UT-ABILITY-004 | manage 액션은 모든 작업 허용 | ✅ |
| UT-ABILITY-005 | all 리소스는 모든 리소스 허용 | ✅ |
| UT-ABILITY-006 | cannot 메서드로 권한 없음 확인 | ✅ |
| UT-ABILITY-007 | 소문자 리소스도 파싱 | ✅ |
| UT-ABILITY-008 | 잘못된 형식의 권한 코드 무시 | ✅ |
| UT-ABILITY-009 | SYSTEM_ADMIN은 모든 권한 보유 | ✅ |

**소계: 9/9 통과**

### 2.2 메뉴 필터링 테스트

**파일**: `lib/auth/__tests__/menu-filter.test.ts`

| 테스트 ID | 테스트명 | 결과 |
|----------|---------|------|
| UT-MENU-001 | 빈 allowedIds로 빈 배열 반환 | ✅ |
| UT-MENU-002 | 허용된 메뉴만 필터링 | ✅ |
| UT-MENU-003 | 자식 메뉴가 허용되면 부모 메뉴도 포함 | ✅ |
| UT-MENU-004 | 트리 구조 유지하며 필터링 | ✅ |
| UT-MENU-005 | 자식 메뉴 권한 시 부모 자동 포함 (BR-03-05) | ✅ |
| UT-MENU-006 | 여러 자식 메뉴의 부모 자동 포함 | ✅ |
| UT-MENU-007 | 부모 메뉴만 허용 시 자식은 미포함 | ✅ |
| UT-MENU-008 | 사용자 역할 기반 메뉴 필터링 | ✅ |
| UT-MENU-009 | 사용자가 없으면 빈 배열 반환 | ✅ |
| UT-MENU-010 | 역할이 없는 사용자는 빈 배열 반환 | ✅ |

**소계: 10/10 통과**

### 2.3 API Guard 테스트

**파일**: `lib/auth/__tests__/api-guard.test.ts`

| 테스트 ID | 테스트명 | 결과 |
|----------|---------|------|
| UT-GUARD-001 | 인증되지 않은 경우 401 반환 | ✅ |
| UT-GUARD-002 | 인증된 경우 세션 정보 반환 | ✅ |
| UT-GUARD-003 | 관리자가 아닌 경우 403 반환 | ✅ |
| UT-GUARD-004 | 관리자인 경우 통과 | ✅ |
| UT-GUARD-005 | 사용자가 없으면 404 반환 | ✅ |
| UT-GUARD-006 | 권한이 없으면 403 반환 | ✅ |
| UT-GUARD-007 | 권한이 있으면 통과 | ✅ |
| UT-GUARD-008 | SYSTEM_ADMIN은 모든 권한 보유 | ✅ |
| UT-GUARD-009 | requireAuthAndAdmin 인증 실패 401 | ✅ |
| UT-GUARD-010 | requireAuthAndAdmin 비관리자 403 | ✅ |
| UT-GUARD-011 | requireAuthAndAdmin 관리자 통과 | ✅ |
| UT-GUARD-012 | requireAuthAndPermission 인증 실패 401 | ✅ |
| UT-GUARD-013 | requireAuthAndPermission 권한 없음 403 | ✅ |
| UT-GUARD-014 | requireAuthAndPermission 권한 있음 통과 | ✅ |

**소계: 14/14 통과**

---

## 3. 빌드 결과

### 3.1 실행 명령어

```bash
pnpm build
```

### 3.2 실행 결과

```
✓ Compiled successfully
```

---

## 4. 품질 게이트 결과

| 게이트 | 기준 | 실제 | 결과 |
|--------|------|------|------|
| 테스트 통과율 | 100% | 100% (33/33) | ✅ |
| 빌드 성공 | 에러 없음 | 에러 없음 | ✅ |
| 타입 체크 | 에러 없음 | 에러 없음 | ✅ |

**최종 판정**: ✅ PASS

---

## 5. 다음 단계

- TSK-03-02 완료 처리
- TSK-03-03 (usePermission Hook 및 화면 요소 제어) 진행

---

## 관련 문서

- 상세설계: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- 구현 문서: `030-implementation.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
