# TSK-05-01 - 요구사항 추적 매트릭스

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-05-01 |
| 문서 버전 | 1.0 |
| 작성일 | 2026-01-26 |

---

## 1. PRD → 설계 추적

| PRD 요구사항 | 설계 항목 | 구현 파일 |
|-------------|----------|----------|
| PRD 4.4.1 사용자 목록 조회 | 2.2 사용자 목록 화면 | `app/(portal)/admin/users/page.tsx` |
| PRD 4.4.1 사용자 등록 | 2.3 사용자 등록 모달 | `app/(portal)/admin/users/page.tsx` |
| PRD 4.4.1 사용자 수정 | 2.3 사용자 수정 모달 | `app/(portal)/admin/users/page.tsx` |
| PRD 4.4.1 사용자 삭제 | 액션 메뉴 | `app/(portal)/admin/users/page.tsx` |
| PRD 4.4.1 역할 할당 | 2.4 역할 할당 모달 | `app/(portal)/admin/users/page.tsx` |
| PRD 4.4.1 계정 잠금/해제 | 액션 메뉴 | `app/(portal)/admin/users/page.tsx` |
| PRD 4.4.1 비밀번호 초기화 | 액션 메뉴 | `app/(portal)/admin/users/page.tsx` |

---

## 2. 설계 → API 추적

| 설계 항목 | API 엔드포인트 | 구현 파일 |
|----------|---------------|----------|
| 사용자 목록 | GET /api/users | `app/api/users/route.ts` |
| 사용자 등록 | POST /api/users | `app/api/users/route.ts` |
| 사용자 상세 | GET /api/users/:id | `app/api/users/[id]/route.ts` |
| 사용자 수정 | PUT /api/users/:id | `app/api/users/[id]/route.ts` |
| 사용자 삭제 | DELETE /api/users/:id | `app/api/users/[id]/route.ts` |
| 계정 잠금 | POST /api/users/:id/lock | `app/api/users/[id]/lock/route.ts` |
| 계정 해제 | POST /api/users/:id/unlock | `app/api/users/[id]/unlock/route.ts` |
| 비밀번호 초기화 | POST /api/users/:id/password/reset | `app/api/users/[id]/password/reset/route.ts` |
| 역할 할당 | PUT /api/users/:id/roles | `app/api/users/[id]/roles/route.ts` (기존) |

---

## 3. UI 컴포넌트 추적

| UI 요소 | Ant Design 컴포넌트 | 용도 |
|--------|-------------------|------|
| 테이블 | Table | 사용자 목록 |
| 모달 | Modal | 등록/수정/역할 할당 |
| 폼 | Form | 입력 폼 |
| 버튼 | Button | 액션 |
| 드롭다운 | Dropdown | 액션 메뉴 |
| 태그 | Tag | 역할 표시 |
| 배지 | Badge | 상태 표시 |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-26 | Claude | 최초 작성 |
