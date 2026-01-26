# TSK-04-01 - 테스트 명세서

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-04-01 |
| 문서 버전 | 1.0 |
| 작성일 | 2026-01-26 |

---

## 1. 단위 테스트

### UT-01: createAuditLog 정상 생성

**테스트 목적:** 모든 필드가 정상적으로 저장되는지 확인

**사전 조건:**
- 데이터베이스 연결 정상
- User 레코드 존재

**테스트 데이터:**
```typescript
{
  userId: 1,
  action: 'LOGIN',
  resource: 'session',
  resourceId: 'session-123',
  details: { browser: 'Chrome', os: 'Windows' },
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  status: 'SUCCESS'
}
```

**기대 결과:**
- AuditLog 레코드 생성됨
- 모든 필드 값이 입력값과 일치
- createdAt 자동 설정

---

### UT-02: createAuditLog userId null 처리

**테스트 목적:** 인증 실패 등 userId가 없는 경우 처리 확인

**테스트 데이터:**
```typescript
{
  userId: null,
  action: 'LOGIN_FAILED',
  details: { email: 'unknown@test.com', reason: 'USER_NOT_FOUND' },
  ip: '192.168.1.1',
  status: 'FAILURE',
  errorMessage: '사용자를 찾을 수 없습니다'
}
```

**기대 결과:**
- AuditLog 레코드 생성됨
- userId가 null로 저장됨

---

### UT-03: createAuditLog details JSON 직렬화

**테스트 목적:** details 객체가 JSON 문자열로 저장되는지 확인

**테스트 데이터:**
```typescript
{
  userId: 1,
  action: 'USER_UPDATED',
  resource: 'user',
  resourceId: '2',
  details: {
    changes: {
      name: { from: 'Old Name', to: 'New Name' },
      department: { from: 'A팀', to: 'B팀' }
    }
  },
  status: 'SUCCESS'
}
```

**기대 결과:**
- details 필드가 JSON 문자열로 저장
- 조회 시 객체로 파싱 가능

---

## 2. 통합 테스트

### IT-01: 감사 로그 목록 조회 (페이징/정렬)

**테스트 목적:** 목록 조회 API 페이징 및 정렬 동작 확인

**사전 조건:**
- 감사 로그 50건 존재
- 인증된 사용자 (audit-log:read 권한)

**요청:**
```
GET /api/audit-logs?page=2&pageSize=10
```

**기대 결과:**
- 200 OK
- data 배열 길이 10
- pagination.page = 2
- pagination.total = 50
- pagination.totalPages = 5
- createdAt 기준 내림차순 정렬

---

### IT-02: 날짜 필터 조회

**테스트 목적:** startDate, endDate 필터 동작 확인

**사전 조건:**
- 다양한 날짜의 감사 로그 존재

**요청:**
```
GET /api/audit-logs?startDate=2026-01-01T00:00:00Z&endDate=2026-01-31T23:59:59Z
```

**기대 결과:**
- 200 OK
- 모든 결과의 createdAt이 범위 내

---

### IT-03: 액션 필터 조회 (복수)

**테스트 목적:** 복수 액션 필터 동작 확인

**요청:**
```
GET /api/audit-logs?action=LOGIN,LOGOUT,LOGIN_FAILED
```

**기대 결과:**
- 200 OK
- 모든 결과의 action이 LOGIN, LOGOUT, LOGIN_FAILED 중 하나

---

### IT-04: 상세 조회

**테스트 목적:** 단일 감사 로그 상세 정보 조회

**요청:**
```
GET /api/audit-logs/1
```

**기대 결과:**
- 200 OK
- user 정보 포함 (id, name, email)
- details 객체로 파싱됨

**예외 케이스:**
- 존재하지 않는 ID: 404 NOT_FOUND

---

### IT-05: CSV 내보내기

**테스트 목적:** CSV 파일 다운로드 동작 확인

**사전 조건:**
- 감사 로그 존재
- 인증된 사용자 (audit-log:export 권한)

**요청:**
```
GET /api/audit-logs/export?action=LOGIN
```

**기대 결과:**
- 200 OK
- Content-Type: text/csv
- Content-Disposition 헤더에 filename 포함
- CSV 컬럼: ID,사용자ID,사용자명,이메일,액션,리소스,리소스ID,상태,IP,생성일시

---

### IT-06: 권한 없이 접근

**테스트 목적:** 권한 체크 동작 확인

**케이스 1: 인증 안됨**
- 요청: Authorization 헤더 없이 GET /api/audit-logs
- 기대 결과: 401 Unauthorized

**케이스 2: 권한 없음**
- 요청: audit-log:read 권한 없는 사용자로 GET /api/audit-logs
- 기대 결과: 403 Forbidden

---

### IT-07: 로그인 성공 시 감사 로그 생성

**테스트 목적:** 로그인 API 호출 시 감사 로그가 생성되는지 확인

**요청:**
```
POST /api/auth/login
{ "email": "test@test.com", "password": "password123!" }
```

**기대 결과:**
- 로그인 성공
- AuditLog 레코드 생성
  - action: LOGIN
  - status: SUCCESS
  - userId: 로그인한 사용자 ID

---

### IT-08: 로그인 실패 시 감사 로그 생성

**테스트 목적:** 로그인 실패 시 감사 로그가 생성되는지 확인

**요청:**
```
POST /api/auth/login
{ "email": "test@test.com", "password": "wrongpassword" }
```

**기대 결과:**
- 로그인 실패
- AuditLog 레코드 생성
  - action: LOGIN_FAILED
  - status: FAILURE
  - errorMessage: 비밀번호 불일치 메시지

---

### IT-09: 잘못된 파라미터

**테스트 목적:** 유효성 검증 동작 확인

**케이스 1: 페이지 크기 초과**
- 요청: GET /api/audit-logs?pageSize=200
- 기대 결과: 400 Bad Request

**케이스 2: 잘못된 날짜 형식**
- 요청: GET /api/audit-logs?startDate=invalid
- 기대 결과: 400 Bad Request

---

## 3. 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 | Vitest |
| 데이터베이스 | SQLite (In-Memory) |
| 모킹 | vi.mock (Prisma Client) |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-26 | Claude | 최초 작성 |
