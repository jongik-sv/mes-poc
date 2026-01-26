# 구현 보고서: TSK-02-02 비밀번호 정책 및 계정 잠금

**Template Version:** 2.0.0 — **Last Updated:** 2026-01-26

---

## 0. 문서 메타데이터

* **문서명**: `030-implementation.md`
* **Task ID**: TSK-02-02
* **Task 명**: 비밀번호 정책 및 계정 잠금
* **작성일**: 2026-01-26
* **작성자**: Claude
* **참조 상세설계서**: `./020-detail-design.md`
* **구현 기간**: 2026-01-26
* **구현 상태**: ✅ 완료

---

## 1. 구현 개요

### 1.1 구현 목적
비밀번호 정책 검증 및 계정 잠금 메커니즘 구현으로 보안 수준 강화

### 1.2 구현 범위
- **포함된 기능**:
  - zod 기반 비밀번호 스키마 검증
  - GET /api/auth/password-policy (비밀번호 정책 조회)
  - POST /api/auth/validate-password (비밀번호 복잡도 검증)
  - 비밀번호 만료 체크 (로그인 시)
  - 비밀번호 만료 알림 (7일 이하 남았을 때)
  - 단위 테스트 (17개 추가)

- **제외된 기능**:
  - 비밀번호 변경/찾기/재설정 → TSK-02-03

### 1.3 구현 유형
- [x] Backend Only

### 1.4 기술 스택
- **Backend**:
  - Framework: Next.js 16.x (App Router)
  - Validation: zod 4.x
  - ORM: Prisma 7.x
  - Password: bcrypt 6.x

---

## 2. Backend 구현 결과

### 2.1 구현된 API 엔드포인트

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| GET | /api/auth/password-policy | 비밀번호 정책 조회 | No |
| POST | /api/auth/validate-password | 비밀번호 복잡도 검증 | No |

### 2.2 구현 파일

| 파일 | 설명 |
|------|------|
| `lib/auth/password-schema.ts` | zod 스키마 및 동적 정책 스키마 생성 |
| `app/api/auth/password-policy/route.ts` | 비밀번호 정책 조회 API |
| `app/api/auth/validate-password/route.ts` | 비밀번호 검증 API |
| `app/api/auth/login/route.ts` | 로그인 API 확장 (만료 체크 추가) |

### 2.3 기존 파일 활용

| 파일 | 기존 함수 | 활용 |
|------|----------|------|
| `lib/auth/password.ts` | `validatePasswordPolicy` | 복잡도 검증 |
| `lib/auth/password.ts` | `isPasswordExpired` | 만료 체크 |
| `lib/auth/password.ts` | `getDaysUntilPasswordExpiry` | 만료 알림 |
| `lib/auth/password.ts` | `isPasswordReused` | 이력 비교 |

### 2.4 비밀번호 정책 (SecuritySetting 기반)

| 설정 키 | 기본값 | 설명 |
|---------|--------|------|
| PASSWORD_MIN_LENGTH | 8 | 최소 길이 |
| PASSWORD_REQUIRE_UPPERCASE | true | 대문자 필수 |
| PASSWORD_REQUIRE_LOWERCASE | true | 소문자 필수 |
| PASSWORD_REQUIRE_NUMBER | true | 숫자 필수 |
| PASSWORD_REQUIRE_SPECIAL | true | 특수문자 필수 |
| PASSWORD_EXPIRY_DAYS | 90 | 만료 기간 (일) |
| PASSWORD_HISTORY_COUNT | 5 | 재사용 금지 개수 |

### 2.5 로그인 응답 확장

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "mustChangePassword": true,
    "passwordExpired": false,
    "passwordExpiryWarning": "비밀번호가 7일 후 만료됩니다."
  }
}
```

---

## 3. 테스트 결과

### 3.1 단위 테스트

```
✓ lib/auth/__tests__/password.test.ts (22 tests)
  ✓ hashPassword
    ✓ UT-006: should generate bcrypt hash
    ✓ should generate different hashes for same password
  ✓ verifyPassword
    ✓ UT-007: should verify correct password
    ✓ UT-008: should reject incorrect password
    ✓ should handle empty password
  ✓ validatePasswordPolicy
    ✓ UT-009: 모든 규칙을 만족하는 비밀번호는 유효함
    ✓ UT-010: 최소 길이 미충족 시 에러 반환
    ✓ UT-011: 대문자 누락 시 에러 반환
    ✓ UT-012: 소문자 누락 시 에러 반환
    ✓ UT-013: 숫자 누락 시 에러 반환
    ✓ UT-014: 특수문자 누락 시 에러 반환
    ✓ UT-015: 여러 규칙 미충족 시 모든 에러 반환
    ✓ UT-016: 정책 비활성화 시 해당 규칙 무시
  ✓ isPasswordReused
    ✓ UT-017: 이전에 사용한 비밀번호는 재사용 불가
    ✓ UT-018: 새로운 비밀번호는 사용 가능
    ✓ UT-019: 빈 이력에서는 항상 사용 가능
    ✓ UT-020: 여러 이력 중 하나라도 일치하면 재사용 불가
  ✓ isPasswordExpired
    ✓ UT-021: 만료 기간이 지나면 true 반환
    ✓ UT-022: 만료 기간 내이면 false 반환
  ✓ getDaysUntilPasswordExpiry
    ✓ UT-023: 남은 일수 정확히 계산
    ✓ UT-024: 이미 만료된 경우 음수 반환
    ✓ UT-025: 오늘 변경한 경우 전체 기간 반환

Test Files  1 passed (1)
Tests       22 passed (22)
```

---

## 4. 구현 완료 체크리스트

### Backend
- [x] zod 비밀번호 스키마 구현
- [x] GET /api/auth/password-policy 구현
- [x] POST /api/auth/validate-password 구현
- [x] 비밀번호 만료 체크 로직 (로그인 시)
- [x] 비밀번호 만료 알림 로직

### 테스트
- [x] 비밀번호 복잡도 단위 테스트 (8개)
- [x] 비밀번호 재사용 단위 테스트 (4개)
- [x] 비밀번호 만료 단위 테스트 (5개)

---

## 5. 알려진 이슈

없음

---

## 6. 다음 단계

- TSK-02-03: 비밀번호 변경/찾기/재설정

---

## 7. 참고 자료

### 7.1 관련 문서
- 상세설계서: `./020-detail-design.md`
- PRD: `.orchay/projects/auth-system/prd.md` (섹션 4.1.4, 4.1.5)
- TRD: `.orchay/projects/auth-system/trd.md` (섹션 3.2)

### 7.2 소스 코드 위치
- zod 스키마: `mes-portal/lib/auth/password-schema.ts`
- 비밀번호 유틸리티: `mes-portal/lib/auth/password.ts`
- API: `mes-portal/app/api/auth/password-policy/`, `mes-portal/app/api/auth/validate-password/`
- 테스트: `mes-portal/lib/auth/__tests__/password.test.ts`
