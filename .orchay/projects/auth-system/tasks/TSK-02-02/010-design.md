# 상세설계: TSK-02-02 비밀번호 정책 및 계정 잠금

**Template Version:** 3.0.0 — **Last Updated:** 2026-01-26

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-02 |
| Task명 | 비밀번호 정책 및 계정 잠금 |
| Category | development |
| 상태 | [dd] 상세설계 |
| 작성일 | 2026-01-26 |
| 작성자 | Claude |

### 상위 문서 참조

| 문서 유형 | 경로 | 참조 섹션 |
|----------|------|----------|
| PRD | `.orchay/projects/auth-system/prd.md` | 섹션 4.1.4, 4.1.5 |
| TRD | `.orchay/projects/auth-system/trd.md` | 섹션 3.2 |
| WBS | `.orchay/projects/auth-system/wbs.yaml` | TSK-02-02 |
| 상위 Work Package | WP-02: 인증 시스템 | - |

---

## 1. 목적 및 범위

### 1.1 목적
비밀번호 정책 검증 및 계정 잠금 메커니즘 구현으로 보안 수준 강화

### 1.2 범위

**포함 범위**:
- 비밀번호 복잡도 검증 (zod 스키마)
- 비밀번호 만료 체크 (90일 기본)
- 비밀번호 이력 관리 (최근 5개 재사용 금지)
- 비밀번호 정책 API
- 비밀번호 만료 알림 로직

**제외 범위**:
- 비밀번호 변경/찾기/재설정 → TSK-02-03

---

## 2. 기술 스택

| 구분 | 기술 | 버전 | 용도 |
|------|------|------|------|
| Validation | zod | 3.x | 스키마 검증 |
| Password | bcrypt | 6.x | 해시 비교 |
| ORM | Prisma | 7.x | PasswordHistory 관리 |

---

## 3. 인터페이스 계약 (API Contract)

### 3.1 엔드포인트 목록

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| GET | /api/auth/password-policy | 비밀번호 정책 조회 | No |
| POST | /api/auth/validate-password | 비밀번호 검증 (복잡도만) | No |

### 3.2 GET /api/auth/password-policy

#### 응답 (성공 200)
| 필드 | 타입 | 설명 |
|------|------|------|
| minLength | number | 최소 길이 |
| requireUppercase | boolean | 대문자 필수 |
| requireLowercase | boolean | 소문자 필수 |
| requireNumber | boolean | 숫자 필수 |
| requireSpecial | boolean | 특수문자 필수 |
| expiryDays | number | 만료 기간 (일) |
| historyCount | number | 재사용 금지 개수 |

### 3.3 POST /api/auth/validate-password

#### 요청
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| password | string | Y | 검증할 비밀번호 |

#### 응답 (성공 200)
| 필드 | 타입 | 설명 |
|------|------|------|
| valid | boolean | 유효 여부 |
| errors | string[] | 실패 사유 목록 |

#### 에러 응답

| 코드 | 에러 코드 | 설명 |
|------|----------|------|
| 400 | VALIDATION_ERROR | 필수 필드 누락 |

---

## 4. 비밀번호 정책 규칙

### 4.1 복잡도 규칙

| 규칙 | 기본값 | 설명 |
|------|--------|------|
| 최소 길이 | 8자 | PASSWORD_MIN_LENGTH |
| 대문자 | 필수 | 최소 1개 이상 |
| 소문자 | 필수 | 최소 1개 이상 |
| 숫자 | 필수 | 최소 1개 이상 |
| 특수문자 | 필수 | 최소 1개 이상 (!@#$%^&*(),.?":{}|<>) |

### 4.2 만료 정책

| 규칙 | 기본값 | 설명 |
|------|--------|------|
| 만료 기간 | 90일 | PASSWORD_EXPIRY_DAYS |
| 만료 알림 | 7일 전 | 대시보드 알림 |

### 4.3 이력 관리

| 규칙 | 기본값 | 설명 |
|------|--------|------|
| 재사용 금지 | 5개 | PASSWORD_HISTORY_COUNT |

---

## 5. zod 스키마

### 5.1 PasswordSchema

```typescript
import { z } from 'zod'

export const passwordSchema = z.string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .regex(/[A-Z]/, '대문자를 1개 이상 포함해야 합니다')
  .regex(/[a-z]/, '소문자를 1개 이상 포함해야 합니다')
  .regex(/[0-9]/, '숫자를 1개 이상 포함해야 합니다')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, '특수문자를 1개 이상 포함해야 합니다')
```

---

## 6. 구현 체크리스트

### Backend
- [ ] zod 비밀번호 스키마 구현
- [ ] GET /api/auth/password-policy 구현
- [ ] POST /api/auth/validate-password 구현
- [ ] 비밀번호 만료 체크 로직 (로그인 시)
- [ ] 비밀번호 이력 비교 함수 확장

### 테스트
- [ ] 비밀번호 복잡도 단위 테스트
- [ ] 비밀번호 만료 단위 테스트
- [ ] 비밀번호 이력 단위 테스트

---

## 7. 다음 단계

- `/wf:build TSK-02-02` 명령어로 TDD 기반 구현 진행
