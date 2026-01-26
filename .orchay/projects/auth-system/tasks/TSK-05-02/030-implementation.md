# TSK-05-02 - 역할/권한 관리 및 감사로그 조회 화면 구현 보고서

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-05-02 |
| 문서 버전 | 1.0 |
| 작성일 | 2026-01-26 |
| 상태 | 완료 |

---

## 1. 구현 개요

### 1.1 구현 범위

| 구현 항목 | 상태 | 파일 경로 |
|----------|------|----------|
| 역할 관리 화면 | 완료 | `app/(portal)/admin/roles/page.tsx` |
| 역할 등록/수정 모달 | 완료 | `app/(portal)/admin/roles/page.tsx` |
| 권한 설정 모달 | 완료 | `app/(portal)/admin/roles/page.tsx` |
| 감사 로그 조회 화면 | 완료 | `app/(portal)/admin/audit-logs/page.tsx` |
| 감사 로그 상세 모달 | 완료 | `app/(portal)/admin/audit-logs/page.tsx` |
| CSV 내보내기 | 완료 | `app/(portal)/admin/audit-logs/page.tsx` |

---

## 2. 구현 상세

### 2.1 역할 관리 화면

**파일:** `app/(portal)/admin/roles/page.tsx`

**기능:**
- 역할 목록 조회 (Table)
- 역할 등록 (Modal + Form)
- 역할 수정 (Modal + Form)
- 역할 삭제 (Popconfirm)
- 권한 설정 (Modal + Tree)

**주요 구현:**
```typescript
// 역할 목록 조회
const fetchRoles = async () => {
  const response = await fetch('/api/roles')
  const data = await response.json()
  if (data.success) setRoles(data.data)
}

// 권한 트리 데이터 생성
const getPermissionTreeData = () => {
  // 권한을 type별로 그룹화하여 트리 구조 생성
}
```

### 2.2 감사 로그 조회 화면

**파일:** `app/(portal)/admin/audit-logs/page.tsx`

**기능:**
- 로그 목록 조회 (Table, 페이징)
- 필터 (기간, 액션, 상태)
- 상세 보기 (Modal + Descriptions)
- CSV 내보내기

**주요 구현:**
```typescript
// 감사 로그 조회
const fetchLogs = async () => {
  const params = new URLSearchParams()
  params.set('page', String(pagination.page))
  params.set('pageSize', String(pagination.pageSize))
  // 필터 조건 추가
  const response = await fetch(`/api/audit-logs?${params}`)
}

// CSV 내보내기
const handleExport = async () => {
  const response = await fetch(`/api/audit-logs/export?${params}`)
  const blob = await response.blob()
  // Blob URL로 다운로드
}
```

---

## 3. 사용 기술

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.x | UI 프레임워크 |
| Ant Design | 6.x | UI 컴포넌트 |
| TailwindCSS | 4.x | 스타일링 |
| dayjs | - | 날짜 처리 |

---

## 4. Ant Design 컴포넌트 사용

| 컴포넌트 | 용도 |
|---------|------|
| Table | 역할/로그 목록 |
| Modal | 등록/수정/상세 모달 |
| Form | 역할 폼 |
| Input | 텍스트 입력 |
| Select | 드롭다운 |
| Tree | 권한 트리 |
| Button | 액션 버튼 |
| Tag | 역할 코드, 액션 표시 |
| Badge | 상태 표시 |
| DatePicker | 기간 선택 |
| Descriptions | 상세 정보 표시 |
| Popconfirm | 삭제 확인 |
| Space | 버튼 그룹 |
| Card | 컨테이너 |

---

## 5. 파일 목록

```
app/(portal)/admin/
├── roles/
│   └── page.tsx         # 역할 관리 화면
└── audit-logs/
    └── page.tsx         # 감사 로그 조회 화면
```

---

## 6. API 연동

### 6.1 역할 관리

| API | 메서드 | 용도 |
|-----|-------|------|
| /api/roles | GET | 역할 목록 |
| /api/roles | POST | 역할 등록 |
| /api/roles/:id | PUT | 역할 수정 |
| /api/roles/:id | DELETE | 역할 삭제 |
| /api/roles/:id/permissions | GET | 역할 권한 조회 |
| /api/roles/:id/permissions | PUT | 역할 권한 설정 |
| /api/permissions | GET | 권한 목록 |

### 6.2 감사 로그

| API | 메서드 | 용도 |
|-----|-------|------|
| /api/audit-logs | GET | 로그 목록 |
| /api/audit-logs/export | GET | CSV 내보내기 |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-26 | Claude | 최초 작성 |
