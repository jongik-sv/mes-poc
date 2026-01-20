# TSK-03-01 - 메뉴 데이터 모델 설계 문서

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-01 |
| 문서 버전 | 1.0 |
| 작성일 | 2026-01-20 |
| 상태 | 작성중 |
| 카테고리 | development |

---

## 1. 개요

### 1.1 배경 및 문제 정의

**현재 상황:**
- MES Portal은 DB 기반 동적 메뉴 시스템이 필요함
- 현재 메뉴 구조가 정의되지 않아 사이드바 메뉴를 구현할 수 없음
- 역할별 메뉴 접근 제어를 위한 데이터 구조가 필요함

**해결하려는 문제:**
- 계층형 메뉴 구조를 DB에서 관리할 수 있어야 함
- 메뉴 순서, 아이콘, 활성 상태 등을 유연하게 관리해야 함
- 향후 역할-메뉴 매핑(TSK-03-02)의 기반이 되는 데이터 모델 필요

### 1.2 목적 및 기대 효과

**목적:**
- Prisma를 사용하여 Menu 테이블 생성
- 계층형 메뉴 구조 지원 (자기참조 parentId)
- 메뉴 CRUD API 제공

**기대 효과:**
- 코드 수정 없이 DB에서 메뉴 구조 변경 가능
- 계층형 트리 메뉴 (최대 3단계) 지원
- 메뉴 순서 및 활성화 상태 관리 용이

### 1.3 범위

**포함:**
- Menu 테이블 Prisma 스키마 정의
- 초기 메뉴 시드 데이터 작성
- GET /api/menus API 엔드포인트 (전체 메뉴 목록, 계층형 응답)

**제외:**
- 역할별 메뉴 필터링 (TSK-03-02에서 구현)
- 메뉴 관리 화면 (관리자 기능, Phase 2)
- 즐겨찾기 메뉴 (TSK-03-04에서 구현)

### 1.4 참조 문서

| 문서 | 경로 | 관련 섹션 |
|------|------|----------|
| PRD | `.orchay/projects/mes-portal/prd.md` | 4.1.1 동적 메뉴 시스템 |
| TRD | `.orchay/projects/mes-portal/trd.md` | 2.3 MVP Prisma 스키마 |

---

## 2. 사용자 분석

### 2.1 대상 사용자

| 사용자 유형 | 특성 | 주요 니즈 |
|------------|------|----------|
| 시스템 관리자 | 메뉴 구조 관리 권한 | DB 수준에서 메뉴 추가/수정/삭제 |
| 일반 사용자 | 포털 사용자 | 권한에 맞는 메뉴만 표시 |
| 프론트엔드 개발자 | 사이드바 구현 | 계층형 메뉴 API 응답 필요 |

### 2.2 사용자 페르소나

**페르소나 1: 시스템 관리자**
- 역할: IT 인프라 담당
- 목표: 메뉴 구조를 유연하게 관리
- 불만: 메뉴 변경을 위해 코드 수정 및 배포 필요
- 시나리오: prisma studio 또는 seed 스크립트로 메뉴 관리

---

## 3. 유즈케이스

### 3.1 유즈케이스 다이어그램

```mermaid
flowchart LR
    subgraph 시스템
        UC01[UC-01: 메뉴 목록 조회]
        UC02[UC-02: 계층형 메뉴 트리 조회]
    end

    사용자((프론트엔드)) --> UC01
    사용자 --> UC02
    관리자((관리자)) --> UC01
```

### 3.2 유즈케이스 상세

#### UC-01: 메뉴 목록 조회

| 항목 | 내용 |
|------|------|
| 액터 | 프론트엔드 애플리케이션 |
| 목적 | 전체 메뉴 목록을 계층형 구조로 조회 |
| 사전 조건 | 데이터베이스에 메뉴 데이터가 존재 |
| 사후 조건 | 계층형 메뉴 트리 JSON 응답 |
| 트리거 | 사이드바 컴포넌트 마운트 시 |

**기본 흐름:**
1. 프론트엔드가 GET /api/menus 요청
2. 서버가 DB에서 활성화된 메뉴 조회 (isActive = true)
3. 서버가 flat 데이터를 계층형 트리로 변환
4. 서버가 sortOrder 기준으로 정렬된 트리 응답
5. 프론트엔드가 사이드바 메뉴 렌더링

**예외 흐름:**
- 2a. 메뉴 데이터가 없는 경우:
  - 빈 배열 [] 응답
  - 프론트엔드에서 빈 상태 처리

---

## 4. 사용자 시나리오

### 4.1 시나리오 1: 사이드바 메뉴 로딩

**상황 설명:**
사용자가 포털에 로그인 후 메인 화면에 진입하면 사이드바에 메뉴가 표시되어야 한다.

**단계별 진행:**

| 단계 | 사용자 행동 | 시스템 반응 | 사용자 기대 |
|------|-----------|------------|------------|
| 1 | 포털 메인 진입 | 사이드바 컴포넌트 마운트 | 메뉴 로딩 중 표시 |
| 2 | - | GET /api/menus 호출 | - |
| 3 | - | 계층형 메뉴 트리 응답 | - |
| 4 | 사이드바 확인 | 3단계 계층형 메뉴 표시 | 메뉴가 올바른 순서로 표시 |

**성공 조건:**
- 메뉴가 계층형으로 표시됨 (1단계 > 2단계 > 3단계)
- 메뉴가 sortOrder 순서로 정렬됨
- 각 메뉴에 아이콘과 이름이 표시됨

### 4.2 시나리오 2: 메뉴 클릭하여 화면 열기

**상황 설명:**
사용자가 사이드바 메뉴 아이템을 클릭하면 해당 화면이 MDI 탭으로 열린다.

**단계별 진행:**

| 단계 | 사용자 행동 | 시스템 반응 | 사용자 기대 |
|------|-----------|------------|------------|
| 1 | 메뉴 아이템 클릭 | path 값으로 MDI 탭 오픈 | 해당 화면 표시 |

---

## 5. 화면 설계

### 5.1 화면 흐름도

```mermaid
flowchart LR
    A[사이드바 메뉴<br/>API 호출] --> B[메뉴 트리<br/>렌더링]
    B --> C[메뉴 클릭<br/>MDI 탭 오픈]
```

### 5.2 사이드바 메뉴 구조

**와이어프레임:**
```
┌─────────────────────────────────────┐
│ 📁 대시보드                          │  <- 1단계 (폴더)
│   └─ 📊 메인 대시보드               │  <- 2단계 (화면)
│                                     │
│ 📁 생산 관리                         │  <- 1단계 (폴더)
│   ├─ 📄 작업 지시                   │  <- 2단계 (화면)
│   └─ 📁 실적 관리                   │  <- 2단계 (폴더)
│       ├─ 📄 생산 실적              │  <- 3단계 (화면)
│       └─ 📄 실적 조회              │  <- 3단계 (화면)
│                                     │
│ 📁 시스템 관리                       │  <- 1단계 (폴더)
│   ├─ 📄 사용자 관리                 │  <- 2단계 (화면)
│   └─ 📄 역할 관리                   │  <- 2단계 (화면)
└─────────────────────────────────────┘
```

**메뉴 아이템 구성:**
- 아이콘: @ant-design/icons 사용
- 메뉴명: 펼침 상태에서 표시
- 화살표: 하위 메뉴 있는 경우 표시

---

## 6. 인터랙션 설계

### 6.1 사용자 액션과 피드백

| 사용자 액션 | 즉각 피드백 | 결과 피드백 | 에러 피드백 |
|------------|-----------|------------|------------|
| 메뉴 그룹 클릭 | 펼침/접힘 애니메이션 | 하위 메뉴 표시/숨김 | - |
| 화면 메뉴 클릭 | 메뉴 하이라이트 | MDI 탭 오픈 | - |
| API 호출 실패 | - | - | 에러 토스트 |

### 6.2 상태별 화면 변화

| 상태 | 화면 표시 | 사용자 안내 |
|------|----------|------------|
| 초기 로딩 | 스켈레톤 메뉴 | - |
| 데이터 없음 | 빈 메뉴 영역 | "메뉴가 없습니다" |
| 에러 발생 | 에러 메시지 | "메뉴를 불러올 수 없습니다" |
| 정상 | 계층형 메뉴 | - |

---

## 7. 데이터 요구사항

### 7.1 Menu 테이블 스키마

| 컬럼 | 타입 | 설명 | 제약조건 |
|------|------|------|----------|
| id | Int | 메뉴 고유 ID | PK, Auto Increment |
| code | String | 메뉴 코드 | Unique, Not Null |
| name | String | 메뉴 표시명 | Not Null |
| path | String? | 화면 경로 | Nullable (폴더는 null) |
| icon | String? | 아이콘 이름 | Nullable |
| parentId | Int? | 상위 메뉴 ID | FK (self), Nullable |
| sortOrder | Int | 정렬 순서 | Default 0 |
| isActive | Boolean | 활성화 여부 | Default true |

### 7.2 데이터 관계

```mermaid
erDiagram
    Menu ||--o{ Menu : "parent-child"
    Menu {
        int id PK
        string code UK
        string name
        string path
        string icon
        int parentId FK
        int sortOrder
        boolean isActive
    }
```

**관계 설명:**
- Menu는 자기 자신을 참조 (parentId → id)
- parentId가 null이면 1단계 메뉴
- parentId가 있으면 해당 메뉴의 하위 메뉴

### 7.3 Prisma 스키마 정의

```prisma
model Menu {
  id        Int      @id @default(autoincrement())
  code      String   @unique
  name      String
  path      String?  // 화면 경로 (null이면 폴더)
  icon      String?
  parentId  Int?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)

  parent    Menu?    @relation("MenuHierarchy", fields: [parentId], references: [id])
  children  Menu[]   @relation("MenuHierarchy")
  roleMenus RoleMenu[]

  @@map("menus")
}
```

### 7.4 초기 시드 데이터

```typescript
// prisma/seed.ts - 메뉴 시드 데이터

const menus = [
  // 1단계: 대시보드
  { id: 1, code: 'DASHBOARD', name: '대시보드', icon: 'DashboardOutlined', parentId: null, sortOrder: 1 },
  { id: 2, code: 'DASHBOARD_MAIN', name: '메인 대시보드', path: '/portal/dashboard', icon: 'BarChartOutlined', parentId: 1, sortOrder: 1 },

  // 1단계: 생산 관리
  { id: 10, code: 'PRODUCTION', name: '생산 관리', icon: 'ToolOutlined', parentId: null, sortOrder: 2 },
  { id: 11, code: 'WORK_ORDER', name: '작업 지시', path: '/portal/production/work-order', icon: 'FileTextOutlined', parentId: 10, sortOrder: 1 },
  { id: 12, code: 'PRODUCTION_RESULT', name: '실적 관리', icon: 'FolderOutlined', parentId: 10, sortOrder: 2 },
  { id: 13, code: 'PRODUCTION_ENTRY', name: '생산 실적 입력', path: '/portal/production/result/entry', icon: 'EditOutlined', parentId: 12, sortOrder: 1 },
  { id: 14, code: 'PRODUCTION_HISTORY', name: '생산 이력 조회', path: '/portal/production/result/history', icon: 'HistoryOutlined', parentId: 12, sortOrder: 2 },

  // 1단계: 샘플 화면
  { id: 20, code: 'SAMPLE', name: '샘플 화면', icon: 'AppstoreOutlined', parentId: null, sortOrder: 3 },
  { id: 21, code: 'SAMPLE_USER_LIST', name: '사용자 목록', path: '/portal/sample/user-list', icon: 'UnorderedListOutlined', parentId: 20, sortOrder: 1 },
  { id: 22, code: 'SAMPLE_MASTER_DETAIL', name: '마스터-디테일', path: '/portal/sample/master-detail', icon: 'SplitCellsOutlined', parentId: 20, sortOrder: 2 },
  { id: 23, code: 'SAMPLE_WIZARD', name: '설정 마법사', path: '/portal/sample/wizard', icon: 'FundProjectionScreenOutlined', parentId: 20, sortOrder: 3 },

  // 1단계: 시스템 관리
  { id: 90, code: 'SYSTEM', name: '시스템 관리', icon: 'SettingOutlined', parentId: null, sortOrder: 9 },
  { id: 91, code: 'USER_MGMT', name: '사용자 관리', path: '/portal/system/users', icon: 'UserOutlined', parentId: 90, sortOrder: 1 },
  { id: 92, code: 'ROLE_MGMT', name: '역할 관리', path: '/portal/system/roles', icon: 'TeamOutlined', parentId: 90, sortOrder: 2 },
  { id: 93, code: 'MENU_MGMT', name: '메뉴 관리', path: '/portal/system/menus', icon: 'MenuOutlined', parentId: 90, sortOrder: 3 },
]
```

### 7.5 API 응답 형식

**요청:** `GET /api/menus`

**응답 (계층형 트리):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "DASHBOARD",
      "name": "대시보드",
      "path": null,
      "icon": "DashboardOutlined",
      "sortOrder": 1,
      "children": [
        {
          "id": 2,
          "code": "DASHBOARD_MAIN",
          "name": "메인 대시보드",
          "path": "/portal/dashboard",
          "icon": "BarChartOutlined",
          "sortOrder": 1,
          "children": []
        }
      ]
    },
    {
      "id": 10,
      "code": "PRODUCTION",
      "name": "생산 관리",
      "path": null,
      "icon": "ToolOutlined",
      "sortOrder": 2,
      "children": [...]
    }
  ]
}
```

---

## 8. 비즈니스 규칙

### 8.1 핵심 규칙

| 규칙 ID | 규칙 설명 | 적용 상황 | 예외 |
|---------|----------|----------|------|
| BR-01 | 메뉴 코드는 고유해야 함 | 메뉴 생성/수정 시 | 없음 |
| BR-02 | 계층 구조는 최대 3단계 | 메뉴 생성 시 | 없음 |
| BR-03 | isActive=false인 메뉴는 조회 제외 | API 조회 시 | 관리자 API |
| BR-04 | sortOrder 오름차순 정렬 | 메뉴 조회 시 | 없음 |

### 8.2 규칙 상세 설명

**BR-01: 메뉴 코드 고유성**

설명: 메뉴 코드(code)는 시스템 내에서 유일해야 하며, 프론트엔드에서 특정 메뉴를 식별하는 데 사용됩니다.

예시:
- DASHBOARD, PRODUCTION, SYSTEM 등 대문자 스네이크 케이스 사용
- 중복 코드 입력 시 DB 에러 발생

**BR-02: 최대 3단계 계층 구조**

설명: PRD 요구사항에 따라 메뉴 트리는 최대 3단계까지만 지원합니다.

예시:
- 1단계: 대시보드 (parentId: null)
- 2단계: 메인 대시보드 (parentId: 1)
- 3단계: 상세 화면 (parentId: 2)
- 4단계 이상은 UI에서 지원하지 않음

---

## 9. 에러 처리

### 9.1 예상 에러 상황

| 상황 | 원인 | HTTP 상태 | 응답 메시지 |
|------|------|----------|------------|
| DB 연결 실패 | 네트워크/DB 오류 | 500 | "데이터베이스 연결에 실패했습니다" |
| 메뉴 데이터 없음 | 시드 미실행 | 200 | { success: true, data: [] } |

### 9.2 에러 응답 형식

```json
{
  "success": false,
  "error": {
    "code": "DB_CONNECTION_ERROR",
    "message": "데이터베이스 연결에 실패했습니다"
  }
}
```

---

## 10. 연관 문서

| 문서 | 경로 | 용도 |
|------|------|------|
| 요구사항 추적 매트릭스 | `025-traceability-matrix.md` | PRD → 설계 → 테스트 양방향 추적 |
| 테스트 명세서 | `026-test-specification.md` | 단위/E2E/매뉴얼 테스트 상세 정의 |

---

## 11. 구현 범위

### 11.1 영향받는 영역

| 영역 | 변경 내용 | 영향도 |
|------|----------|--------|
| prisma/schema.prisma | Menu 모델 추가 | 높음 |
| prisma/seed.ts | 초기 메뉴 데이터 추가 | 높음 |
| app/api/menus/route.ts | GET API 엔드포인트 생성 | 높음 |
| lib/types/menu.ts | MenuItem 타입 정의 | 중간 |

### 11.2 의존성

| 의존 항목 | 이유 | 상태 |
|----------|------|------|
| TSK-04-01 Prisma 설정 | Prisma 클라이언트가 필요 | 필요 |

### 11.3 제약 사항

| 제약 | 설명 | 대응 방안 |
|------|------|----------|
| Prisma 설정 필요 | TSK-04-01 완료 후 진행 가능 | 스키마 정의만 선행, 마이그레이션은 TSK-04-01 후 |

---

## 12. 체크리스트

### 12.1 설계 완료 확인

- [x] 문제 정의 및 목적 명확화
- [x] 사용자 분석 완료
- [x] 유즈케이스 정의 완료
- [x] 사용자 시나리오 작성 완료
- [x] 화면 설계 완료 (와이어프레임)
- [x] 인터랙션 설계 완료
- [x] 데이터 요구사항 정의 완료
- [x] 비즈니스 규칙 정의 완료
- [x] 에러 처리 정의 완료

### 12.2 연관 문서 작성

- [ ] 요구사항 추적 매트릭스 작성 (→ `025-traceability-matrix.md`)
- [ ] 테스트 명세서 작성 (→ `026-test-specification.md`)

### 12.3 구현 준비

- [x] 구현 우선순위 결정
- [x] 의존성 확인 완료
- [x] 제약 사항 검토 완료

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |
