# TSK-04-01 - 감사 로그 수집 및 조회 API 설계 문서

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-04-01 |
| 문서 버전 | 1.0 |
| 작성일 | 2026-01-26 |
| 상태 | 승인됨 |
| 카테고리 | development |

---

## 1. 개요

### 1.1 배경 및 문제 정의

**현재 상황:**
- Auth System의 인증/인가 기능(WP-01~03)이 구현됨
- 감사 로그 모델(AuditLog)이 Prisma 스키마에 정의되어 있으나 활용 코드 없음
- 보안 컴플라이언스를 위한 로그 수집/조회 기능 부재

**해결하려는 문제:**
- 인증 이벤트(로그인, 로그아웃, 로그인 실패 등) 추적 불가
- 권한 변경 이력 관리 불가
- 보안 감사를 위한 로그 조회/내보내기 기능 없음

### 1.2 목적 및 기대 효과

**목적:**
- 인증/인가 이벤트를 감사 로그로 기록
- 감사 로그 조회 및 내보내기 API 제공

**기대 효과:**
- 보안 컴플라이언스 충족 (감사 추적성)
- 보안 사고 발생 시 원인 분석 가능
- 사용자 활동 모니터링

### 1.3 범위

**포함:**
- 감사 로그 생성 함수 (createAuditLog)
- 인증 이벤트 로깅 통합
- GET /api/audit-logs (필터/페이징)
- GET /api/audit-logs/export (CSV)
- GET /api/audit-logs/:id (상세 조회)

**제외:**
- 감사 로그 UI (TSK-05-02에서 구현)
- 실시간 알림 (Phase 2)

### 1.4 참조 문서

| 문서 | 경로 | 관련 섹션 |
|------|------|----------|
| PRD | `.orchay/projects/auth-system/prd.md` | PRD 4.3 |
| TRD | `.orchay/projects/auth-system/trd.md` | TRD 6 |

---

## 2. API 설계

### 2.1 감사 로그 타입 정의

```typescript
type AuditAction =
  | 'LOGIN'              // 로그인 성공
  | 'LOGOUT'             // 로그아웃
  | 'LOGIN_FAILED'       // 로그인 실패
  | 'PASSWORD_CHANGE'    // 비밀번호 변경
  | 'PASSWORD_RESET'     // 비밀번호 재설정
  | 'ACCOUNT_LOCKED'     // 계정 잠금
  | 'ACCOUNT_UNLOCKED'   // 계정 잠금 해제
  | 'USER_CREATED'       // 사용자 생성
  | 'USER_UPDATED'       // 사용자 수정
  | 'USER_DELETED'       // 사용자 삭제
  | 'ROLE_CREATED'       // 역할 생성
  | 'ROLE_UPDATED'       // 역할 수정
  | 'ROLE_DELETED'       // 역할 삭제
  | 'PERMISSION_ASSIGNED'  // 권한 할당
  | 'PERMISSION_REVOKED'   // 권한 회수
  | 'UNAUTHORIZED_ACCESS'  // 권한 없는 접근 시도
```

### 2.2 API 엔드포인트

| 메서드 | 엔드포인트 | 설명 | 권한 |
|-------|-----------|------|------|
| GET | `/api/audit-logs` | 감사 로그 목록 조회 | `audit-log:read` |
| GET | `/api/audit-logs/:id` | 감사 로그 상세 조회 | `audit-log:read` |
| GET | `/api/audit-logs/export` | 감사 로그 CSV 내보내기 | `audit-log:export` |

### 2.3 GET /api/audit-logs

**요청 파라미터:**
```typescript
interface AuditLogQuery {
  page?: number       // 페이지 번호 (기본: 1)
  pageSize?: number   // 페이지 크기 (기본: 20, 최대: 100)
  userId?: number     // 사용자 ID 필터
  action?: string     // 액션 필터 (복수 가능, 쉼표 구분)
  resource?: string   // 리소스 필터
  status?: 'SUCCESS' | 'FAILURE'  // 상태 필터
  startDate?: string  // 시작일 (ISO 8601)
  endDate?: string    // 종료일 (ISO 8601)
  ip?: string         // IP 주소 필터
}
```

**응답:**
```typescript
interface AuditLogListResponse {
  success: boolean
  data: {
    id: number
    userId: number | null
    userName: string | null
    userEmail: string | null
    action: string
    resource: string | null
    resourceId: string | null
    details: object | null
    ip: string | null
    userAgent: string | null
    status: string
    errorMessage: string | null
    createdAt: string
  }[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
```

### 2.4 GET /api/audit-logs/:id

**응답:**
```typescript
interface AuditLogDetailResponse {
  success: boolean
  data: {
    id: number
    userId: number | null
    user: {
      id: number
      name: string
      email: string
    } | null
    action: string
    resource: string | null
    resourceId: string | null
    details: object | null
    ip: string | null
    userAgent: string | null
    status: string
    errorMessage: string | null
    createdAt: string
  }
}
```

### 2.5 GET /api/audit-logs/export

**요청 파라미터:** (GET /api/audit-logs와 동일한 필터 파라미터)

**응답:**
- Content-Type: text/csv
- Content-Disposition: attachment; filename="audit-logs-YYYY-MM-DD.csv"

**CSV 컬럼:**
```
ID,사용자ID,사용자명,이메일,액션,리소스,리소스ID,상태,IP,생성일시
```

---

## 3. 감사 로그 생성 함수

### 3.1 createAuditLog

```typescript
// lib/audit/audit-logger.ts

interface CreateAuditLogParams {
  userId?: number | null
  action: AuditAction
  resource?: string
  resourceId?: string
  details?: Record<string, unknown>
  ip?: string
  userAgent?: string
  status: 'SUCCESS' | 'FAILURE'
  errorMessage?: string
}

async function createAuditLog(params: CreateAuditLogParams): Promise<void>
```

### 3.2 인증 이벤트 통합

기존 인증 API에 감사 로그 생성 코드 통합:
- POST /api/auth/login - LOGIN, LOGIN_FAILED, ACCOUNT_LOCKED
- POST /api/auth/logout - LOGOUT
- POST /api/auth/password/change - PASSWORD_CHANGE
- POST /api/auth/password/reset - PASSWORD_RESET

---

## 4. 비즈니스 규칙

| 규칙 ID | 규칙 설명 | 적용 상황 |
|---------|----------|----------|
| BR-01 | 감사 로그는 삭제 불가 | 모든 상황 |
| BR-02 | 감사 로그 조회는 audit-log:read 권한 필요 | API 접근 시 |
| BR-03 | CSV 내보내기는 audit-log:export 권한 필요 | 내보내기 시 |
| BR-04 | 페이지 크기 최대 100개 제한 | 목록 조회 시 |
| BR-05 | 날짜 필터 최대 1년 범위 | 조회 시 |

---

## 5. 에러 처리

| 상황 | HTTP 상태 | 에러 코드 | 메시지 |
|------|----------|----------|--------|
| 인증 안됨 | 401 | UNAUTHORIZED | 로그인이 필요합니다 |
| 권한 없음 | 403 | FORBIDDEN | 권한이 없습니다 |
| 로그 없음 | 404 | NOT_FOUND | 감사 로그를 찾을 수 없습니다 |
| 잘못된 파라미터 | 400 | BAD_REQUEST | {상세 메시지} |

---

## 6. 테스트 케이스 요약

### 6.1 단위 테스트

| ID | 테스트 케이스 | 검증 항목 |
|----|-------------|----------|
| UT-01 | createAuditLog 정상 생성 | 모든 필드 저장 확인 |
| UT-02 | createAuditLog userId null | 인증 실패 케이스 |
| UT-03 | createAuditLog details JSON | JSON 직렬화 확인 |

### 6.2 통합 테스트

| ID | 테스트 케이스 | 검증 항목 |
|----|-------------|----------|
| IT-01 | 감사 로그 목록 조회 | 페이징, 정렬 |
| IT-02 | 날짜 필터 조회 | startDate, endDate |
| IT-03 | 액션 필터 조회 | 복수 액션 필터 |
| IT-04 | 상세 조회 | 사용자 정보 포함 |
| IT-05 | CSV 내보내기 | 파일 다운로드, 컬럼 |
| IT-06 | 권한 없이 접근 | 403 응답 |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-26 | Claude | 최초 작성 |
