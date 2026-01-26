# TSK-05-02 - 추적성 매트릭스

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-05-02 |
| 문서 버전 | 1.0 |
| 작성일 | 2026-01-26 |

---

## 1. 요구사항-설계 추적성

| PRD 요구사항 | 설계 항목 | 상태 |
|-------------|----------|------|
| PRD 4.4.2 역할 관리 | 역할 목록/등록/수정/삭제 화면 | 완료 |
| PRD 4.4.3 역할-권한 매핑 | 권한 설정 모달 | 완료 |
| PRD 4.4.4 감사 로그 조회 | 감사 로그 조회 화면 | 완료 |

---

## 2. 설계-구현 추적성

| 설계 항목 | 구현 파일 | 상태 |
|----------|----------|------|
| 역할 관리 화면 | `app/(portal)/admin/roles/page.tsx` | 완료 |
| 역할 등록/수정 모달 | `app/(portal)/admin/roles/page.tsx` (Modal) | 완료 |
| 권한 설정 모달 | `app/(portal)/admin/roles/page.tsx` (Tree) | 완료 |
| 감사 로그 조회 화면 | `app/(portal)/admin/audit-logs/page.tsx` | 완료 |
| 감사 로그 상세 모달 | `app/(portal)/admin/audit-logs/page.tsx` (Modal) | 완료 |

---

## 3. API-화면 추적성

| API 엔드포인트 | 화면/기능 | 상태 |
|--------------|----------|------|
| GET /api/roles | 역할 목록 조회 | 완료 |
| POST /api/roles | 역할 등록 | 완료 |
| PUT /api/roles/:id | 역할 수정 | 완료 |
| DELETE /api/roles/:id | 역할 삭제 | 완료 |
| GET /api/roles/:id/permissions | 역할 권한 조회 | 완료 |
| PUT /api/roles/:id/permissions | 역할 권한 설정 | 완료 |
| GET /api/permissions | 권한 목록 조회 | 완료 |
| GET /api/audit-logs | 감사 로그 목록 | 완료 |
| GET /api/audit-logs/export | CSV 내보내기 | 완료 |

---

## 4. 컴포넌트-기능 추적성

| 컴포넌트 | 기능 | Ant Design |
|---------|------|-----------|
| 역할 테이블 | 역할 목록 표시 | Table |
| 역할 등록 버튼 | 등록 모달 열기 | Button |
| 역할 코드 태그 | 코드 표시 | Tag |
| 상태 태그 | 활성/비활성 | Tag |
| 삭제 확인 | 삭제 전 확인 | Popconfirm |
| 권한 트리 | 권한 체크박스 | Tree |
| 감사 로그 테이블 | 로그 목록 | Table |
| 기간 선택 | 날짜 필터 | RangePicker |
| 액션 필터 | 액션 선택 | Select (multiple) |
| 상태 필터 | 상태 선택 | Select |
| 상세 모달 | 로그 상세 | Modal, Descriptions |
| CSV 버튼 | 내보내기 | Button |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-26 | Claude | 최초 작성 |
