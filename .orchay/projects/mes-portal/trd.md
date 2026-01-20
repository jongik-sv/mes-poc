# MES Portal - 기술 요구사항 정의서 (TRD)

## 프로젝트 개요

| 항목 | 내용 |
|-----|------|
| 프로젝트명 | MES Portal (Manufacturing Execution System Portal) |
| 복잡도 등급 | **Standard (Tier 2)** |
| 타겟 사용자 | 공장장, 생산/품질/설비 담당자 (내부 B2B) |
| 동시 접속자 | 100명 이상 |
| 배포 환경 | On-premise |
| 유지보수 주체 | AI 전담 개발 |

---

## 1. 핵심 기술 스택

### 1.1 프론트엔드/백엔드 통합

| 계층 | 기술 | 버전 | 선정 근거 | 대안 검토 |
|-----|------|------|----------|----------|
| 메타프레임워크 | **Next.js (App Router)** | 16.x | RSC 지원, Turbopack 성능, 풀스택 통합 | Remix (라우팅 복잡), Nuxt (Vue 생태계) |
| UI 라이브러리 | **React** | 19.x | AI 코딩 최적 호환, 가장 큰 생태계 | Vue (생태계 규모) |
| 언어 | **TypeScript** | 5.x | 타입 안정성, AI 코드 생성 품질 향상 | JavaScript (타입 안전성 부족) |
| ORM | **Prisma** | 7.x | TypeScript 네이티브, 자동 타입 생성, SQLite↔PostgreSQL 전환 용이 | Drizzle (경량), TypeORM (복잡) |
| 데이터베이스 (MVP) | **SQLite** | - | 설치 불필요, 빠른 프로토타이핑, 파일 기반 | PostgreSQL (프로덕션 권장) |
| Mock 데이터 (MVP) | **JSON 파일** | - | UI 검증용 정적 데이터, 백엔드 없이 화면 개발 가능 | API 연동 시 제거 |
| 데이터베이스 (프로덕션) | **PostgreSQL** | 17.x | 동시성 처리, 엔터프라이즈 안정성 | MVP 후 마이그레이션 필요 |
| 인증 | **Auth.js (NextAuth v5)** | 5.x | Next.js 통합, JWT/세션 지원, RBAC 구현 용이 | Lucia Auth (설정 복잡), Clerk (클라우드 의존) |

### 1.2 UI/스타일링 스택

| 구분 | 기술 | 버전 | 선정 근거 |
|-----|------|------|----------|
| CSS 프레임워크 | **TailwindCSS** | 4.x | 유틸리티 퍼스트, 빠른 프로토타이핑, 레이아웃 보조 |
| UI 컴포넌트 | **Ant Design** | 6.x | 엔터프라이즈급 컴포넌트, 테이블/폼/트리 내장, React 19 지원 |
| 아이콘 | **@ant-design/icons** | 6.x | Ant Design 통합, 일관된 디자인 |
| 차트 | **@ant-design/charts** | 2.x | Ant Design 통합, 실시간 차트 지원 |

### 1.3 디자인 시스템

| 항목 | 설정 | 설명 |
|-----|------|------|
| 기본 테마 | **Ant Design 기본 테마** | 라이트/다크 모드 전환 지원 |
| 컬러 팔레트 | **Ant Design Token + CSS Variables** | 파란색 계열 Primary |
| 컴포넌트 우선순위 | **Ant Design > TailwindCSS > Custom** | 라이브러리 컴포넌트 최우선 사용 |
| 테마 전환 지원 | Yes | ConfigProvider를 통한 동적 테마 전환 |

#### 디자인 시스템 가이드라인 (AI 코딩 시 필수 준수)
- **컴포넌트 사용 원칙**: Ant Design 컴포넌트를 최우선 사용
- **스타일링 원칙**: Ant Design Token 시스템 사용, TailwindCSS는 레이아웃 보조용
- **테마 일관성**: ConfigProvider로 전체 테마 통일
- **접근성 준수**: Ant Design의 내장 접근성 기능 활용 (키보드 네비게이션, ARIA)

### 1.5 CSS 중앙 집중 관리 전략

#### 스타일 관리 계층 구조

```
lib/
├── theme/
│   ├── index.ts           # 테마 설정 진입점 (export all)
│   ├── tokens.ts          # Ant Design Token 정의 (색상, 간격, 폰트 등)
│   ├── components.ts      # 컴포넌트별 커스텀 토큰
│   └── algorithms.ts      # 라이트/다크 알고리즘 설정
app/
├── globals.css            # CSS Variables + TailwindCSS 기본 설정
```

#### 테마 토큰 중앙 관리 (lib/theme/tokens.ts)

```typescript
// 모든 디자인 토큰을 한 곳에서 정의
export const themeTokens = {
  // 색상 팔레트
  colorPrimary: '#1677ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#ff4d4f',
  colorInfo: '#1677ff',

  // 레이아웃
  borderRadius: 6,
  controlHeight: 32,

  // 간격 (Ant Design 기본값 기준)
  marginXS: 8,
  marginSM: 12,
  margin: 16,
  marginMD: 20,
  marginLG: 24,
  marginXL: 32,

  // 폰트
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
  fontSize: 14,
  fontSizeLG: 16,
  fontSizeSM: 12,
}
```

#### CSS Variables 연동 (globals.css)

```css
:root {
  /* Ant Design Token과 동기화된 CSS Variables */
  --color-primary: #1677ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;

  /* 레이아웃 고정값 */
  --header-height: 60px;
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 60px;
  --footer-height: 30px;
  --tab-bar-height: 40px;
}
```

#### 스타일 적용 우선순위

| 순위 | 방법 | 사용 범위 | 예시 |
|-----|------|----------|------|
| 1 | Ant Design Token | 컴포넌트 테마 | `ConfigProvider theme={{ token: themeTokens }}` |
| 2 | CSS Variables | 레이아웃 고정값 | `height: var(--header-height)` |
| 3 | TailwindCSS | 간격/정렬/플렉스 | `flex items-center gap-4` |
| 4 | 컴포넌트 props | Ant Design 스타일 props | `<Button type="primary" size="large">` |

#### 금지 사항 (CSS 관련)

1. **개별 컴포넌트에 CSS 파일 생성 금지**
   - `ComponentName.module.css` 생성 금지
   - `styled-components`, `emotion` 사용 금지

2. **인라인 style 속성 사용 금지**
   - `style={{ color: 'red' }}` 금지
   - 동적 스타일은 Ant Design Token 또는 className 조건부 적용

3. **하드코딩된 색상/크기 금지**
   - `#1677ff` 직접 사용 금지 → `var(--color-primary)` 또는 Token 사용
   - `16px` 직접 사용 금지 → TailwindCSS 클래스 또는 Token 사용

4. **!important 사용 금지**
   - Ant Design 스타일 오버라이드 시 Token 시스템 활용

### 1.6 런타임 및 인프라

| 구성요소 | 기술 | 선정 근거 |
|---------|------|----------|
| Node.js | **22.x LTS** | 2027년 4월까지 지원, ES 모듈 완전 지원 |
| 패키지 매니저 | **pnpm** | 빠른 설치, 디스크 효율, 모노레포 지원 |
| 배포 | **Docker + Docker Compose** | On-premise 환경 표준, 재현 가능한 배포 |
| 웹서버 (프로덕션) | **Nginx (리버스 프록시)** | SSL 종료, 정적 파일 서빙, 로드 밸런싱 |

---

## 2. 기술 선택 근거

### 2.1 주요 기술 결정 사항

| 결정 항목 | 선택 | 이유 | 트레이드오프 |
|----------|------|------|-------------|
| 풀스택 vs 분리형 | **풀스택 (Next.js)** | AI 전담 개발에 적합, 단일 코드베이스 관리 | 대규모 팀 분업 어려움 |
| UI 라이브러리 | **Ant Design** | MDI/테이블/폼/트리 등 MES에 필요한 컴포넌트 완비 | 번들 크기 큼 (트리쉐이킹으로 완화) |
| ORM | **Prisma** | 타입 안전성, 마이그레이션 자동화, AI 친화적 | 복잡한 쿼리 시 Raw SQL 필요 |
| 인증 | **Auth.js** | Next.js 네이티브 통합, 세션/JWT 유연성 | 커스텀 기능 확장 시 복잡도 증가 |
| 실시간 갱신 | **Polling** | 구현 간단, On-premise 환경 적합, HTTP 기반 | 5초 주기로 서버 부하 발생 (100명 기준 감당 가능) |
| DB 전략 | **SQLite (MVP) → PostgreSQL (Prod)** | 빠른 프로토타이핑, Prisma로 전환 용이 | 프로덕션 전환 시 마이그레이션 작업 필요 |

### 2.2 기술 호환성 검증

| 조합 | 호환성 | 검증 방법 |
|-----|--------|----------|
| Next.js 16 + React 19 | **안정** | Next.js 16 공식 문서 확인 |
| React 19 + Ant Design 6 | **안정** | Ant Design 6.0 릴리즈 노트 - React 19 기본 지원 |
| Prisma 7 + SQLite | **안정** | Prisma 기본 지원 DB |
| Prisma 7 + PostgreSQL 17 | **안정** | Prisma 공식 지원 DB 목록 확인 |
| Next.js 16 + Auth.js 5 | **안정** | Auth.js 공식 문서 - Next.js 14+ 지원 |
| TailwindCSS 4 + Next.js 16 | **안정** | Vite 플러그인 또는 PostCSS 통합 |

---

## 2.3 MVP 백엔드 범위 정의

> MVP 목표: **UI/UX 프레임워크 + 로그인/권한 기능 검증**

### 백엔드 구현 범위

| 영역 | MVP 포함 | 구현 방식 | 비고 |
|-----|---------|----------|------|
| **인증** | ✅ | Auth.js + Credentials Provider | 로그인/로그아웃, 세션 관리 |
| **사용자 관리** | ✅ | Prisma + SQLite | users 테이블 (id, email, password, role) |
| **메뉴 권한** | ✅ | DB 기반 메뉴 + 역할 필터링 | menus, roles, role_menus 테이블 |
| **대시보드 데이터** | ❌ | JSON mock 파일 | `/mock-data/dashboard.json` |
| **생산 관리 CRUD** | ❌ | JSON mock 파일 | Phase 2에서 구현 |
| **실시간 데이터** | ❌ | - | Phase 2에서 Polling 구현 |

### MVP Prisma 스키마 (최소)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// 사용자
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String   // bcrypt 해시
  name      String
  roleId    Int
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  role      Role     @relation(fields: [roleId], references: [id])

  @@map("users")
}

// 역할
model Role {
  id        Int      @id @default(autoincrement())
  code      String   @unique // ADMIN, MANAGER, OPERATOR
  name      String
  createdAt DateTime @default(now())

  users     User[]
  roleMenus RoleMenu[]

  @@map("roles")
}

// 메뉴
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

// 역할-메뉴 매핑
model RoleMenu {
  id     Int @id @default(autoincrement())
  roleId Int
  menuId Int

  role Role @relation(fields: [roleId], references: [id])
  menu Menu @relation(fields: [menuId], references: [id])

  @@unique([roleId, menuId])
  @@map("role_menus")
}
```

### MVP API Routes 범위

```
app/api/
├── auth/
│   ├── [...nextauth]/route.ts  # Auth.js 핸들러
│   └── me/route.ts             # 현재 사용자 정보
├── menus/
│   └── route.ts                # GET: 권한별 메뉴 목록
└── mock/                       # JSON mock 데이터 서빙 (선택)
    ├── dashboard/route.ts
    └── [resource]/route.ts
```

### 데이터 로딩 전략

```typescript
// 화면별 데이터 로딩 방식

// 1. 인증/메뉴: API Route (DB)
const user = await fetch('/api/auth/me')
const menus = await fetch('/api/menus')

// 2. 화면 데이터: JSON import (Phase 1)
import dashboardData from '@/mock-data/dashboard.json'
import usersData from '@/mock-data/users.json'

// 3. 향후 API 전환 시: 환경변수로 분기
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
const data = USE_MOCK
  ? await import('@/mock-data/dashboard.json')
  : await fetch('/api/dashboard')
```

---

## 3. 품질 요구사항

### 3.1 성능 목표

| 지표 | 목표값 | 측정 기준 |
|-----|--------|----------|
| 페이지 로드 시간 | **3초 이내** | LCP (Largest Contentful Paint) |
| API 응답 시간 | **500ms 이내** | P95 응답 시간 |
| 실시간 데이터 갱신 | **5초 이내** | WebSocket 또는 Polling 주기 |
| 동시 접속자 | **100명 이상** | 부하 테스트 기준 |

### 3.2 보안 요구사항

- [x] HTTPS 통신 필수 (Nginx SSL 종료)
- [x] JWT 기반 인증 (Auth.js)
- [x] 역할 기반 접근 제어 (RBAC)
- [x] SQL Injection 방지 (Prisma ORM)
- [x] XSS 방지 (React 자동 이스케이프)
- [x] CSRF 방지 (Auth.js 내장)

### 3.3 테스트 전략 방향

| 유형 | 커버리지 목표 | 도구 |
|-----|-------------|------|
| 단위 테스트 | 핵심 로직 70% | Vitest |
| 통합 테스트 | API 엔드포인트 | Vitest + Supertest |
| E2E 테스트 | 핵심 사용자 플로우 | Playwright |
| 컴포넌트 테스트 | 주요 UI 컴포넌트 | Vitest + Testing Library |

---

## 4. AI 코딩 가이드라인

### 4.1 권장 사항

1. **Ant Design 컴포넌트 우선 사용**
   - Table, Form, Modal, Menu, Tabs, Tree 등 Ant Design 제공 컴포넌트 활용
   - 커스텀 스타일은 ConfigProvider token 시스템 사용

2. **Server Components 활용**
   - 데이터 페칭은 Server Components에서 수행
   - 클라이언트 상호작용 필요 시에만 'use client' 사용
   - Ant Design 컴포넌트는 'use client' 필요

3. **Prisma 타입 활용**
   - `@prisma/client`에서 생성된 타입 직접 사용
   - 별도 인터페이스 중복 정의 지양

4. **경로 별칭 사용**
   - `@/components`, `@/lib`, `@/app` 등 경로 별칭 일관 사용

### 4.2 금지 사항

1. **CSS 직접 작성 금지** (Ant Design 컴포넌트로 해결 가능한 경우)
2. **인라인 스타일 남용 금지** (Ant Design Token 또는 TailwindCSS 사용)
3. **any 타입 사용 금지** (명시적 타입 정의 필수)
4. **console.log 프로덕션 코드 포함 금지** (개발 시에만 사용)
5. **하드코딩된 문자열/숫자 금지** (상수 또는 환경변수 사용)

---

## 5. 프로젝트 구조 (참고)

```
mes-portal/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 라우트 그룹
│   ├── (portal)/          # 포털 메인 라우트 그룹
│   ├── api/               # API Routes
│   ├── globals.css        # 전역 CSS Variables + TailwindCSS 설정
│   └── layout.tsx         # 루트 레이아웃
├── components/            # 공유 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트 (Header, Sidebar, Footer)
│   ├── mdi/              # MDI 관련 컴포넌트
│   └── ui/               # 공통 UI 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── theme/            # ★ 테마 중앙 관리
│   │   ├── index.ts      # 테마 설정 진입점
│   │   ├── tokens.ts     # Ant Design Token 정의
│   │   ├── components.ts # 컴포넌트별 커스텀 토큰
│   │   └── algorithms.ts # 라이트/다크 알고리즘
│   ├── auth.ts           # Auth.js 설정
│   ├── prisma.ts         # Prisma 클라이언트
│   ├── antd-registry.tsx # Ant Design SSR 레지스트리
│   └── utils.ts          # 유틸리티 함수
├── prisma/               # Prisma 스키마 및 마이그레이션
├── public/               # 정적 파일
├── docker-compose.yml    # Docker 구성
└── package.json
```

---

## 6. 버전 요약

### 핵심 기술 스택

| 기술 | 버전 | 용도 | 지원 종료 |
|-----|------|------|----------|
| Node.js | 22.x LTS | 런타임 | 2027-04-30 |
| Next.js | 16.x | 프레임워크 | - |
| React | 19.x | UI 라이브러리 | - |
| TypeScript | 5.x | 언어 | - |
| SQLite | - | MVP 데이터베이스 | - |
| PostgreSQL | 17.x | 프로덕션 데이터베이스 | 2029-11 (예상) |
| Prisma | 7.x | ORM | - |
| Auth.js | 5.x | 인증 | - |

### UI 라이브러리

| 기술 | 버전 | 용도 |
|-----|------|------|
| Ant Design | 6.x | UI 컴포넌트 |
| @ant-design/icons | 6.x | 아이콘 |
| @ant-design/charts | 2.x | 차트 |
| TailwindCSS | 4.x | CSS 프레임워크 (레이아웃 보조) |

### 추가 라이브러리 (PRD 요구사항 충족)

| 기술 | 용도 | PRD 요구사항 |
|-----|------|-------------|
| react-dnd | 드래그 앤 드롭 | MDI 탭 순서 변경 |
| react-resizable | 컬럼 리사이즈 | 테이블 컬럼 리사이즈 |
| react-hotkeys-hook | 키보드 단축키 | 전역 검색(Ctrl+K), 저장(Ctrl+S) 등 |
| xlsx | 엑셀 내보내기 | 데이터 내보내기 (XLSX) |
| react-split-pane | 분할 화면 | Split 화면 템플릿 |
| next-themes | 테마 전환 | 라이트/다크 모드 (Ant Design과 연동) |

---

## 7. PRD 요구사항 ↔ 기술 스택 매핑

### UI/UX 프레임워크

| PRD 요구사항 | 적용 기술 | Ant Design 컴포넌트 |
|-------------|----------|-------------------|
| MDI 탭 기반 다중 화면 | Ant Design Tabs | `Tabs`, `Tabs.TabPane` (드래그: react-dnd 연동) |
| 탭 드래그 앤 드롭 | react-dnd + Ant Design | DnD 라이브러리 + Tabs 커스텀 |
| 계층형 트리 메뉴 (3단계) | Ant Design Tree/Menu | `Menu` (mode="inline"), `Tree` |
| 사이드바 접이식 | Ant Design Layout | `Layout.Sider` (collapsible) |
| 브레드크럼 | Ant Design Breadcrumb | `Breadcrumb` |
| 전역 검색 | Ant Design AutoComplete | `AutoComplete`, `Input.Search` |
| 알림 시스템 | Ant Design Notification | `notification`, `Badge` |
| 라이트/다크 모드 | Ant Design ConfigProvider | `ConfigProvider` (algorithm: darkAlgorithm) |

### 테이블/그리드 기능

| PRD 요구사항 | 적용 기술 | Ant Design 컴포넌트 |
|-------------|----------|-------------------|
| 컬럼 정렬 | Ant Design Table | `Table` (sorter 속성) |
| 페이징 | Ant Design Table | `Table` (pagination 속성) |
| 컬럼 리사이즈 | react-resizable + Table | `Table` + react-resizable |
| 컬럼별 필터링 | Ant Design Table | `Table` (filters, onFilter) |
| 컬럼 고정 (좌/우) | Ant Design Table | `Table` (fixed: 'left'/'right') |
| 행 선택 (단일/다중) | Ant Design Table | `Table` (rowSelection) |
| 셀 인라인 편집 | Ant Design Table | `Table.EditableCell` 패턴 |
| 가상 스크롤 | Ant Design Table | `Table` (virtual 속성) |
| 엑셀 내보내기 | xlsx 라이브러리 | 별도 라이브러리 + Table 데이터 |

### 폼/입력

| PRD 요구사항 | 적용 기술 | Ant Design 컴포넌트 |
|-------------|----------|-------------------|
| 유효성 검사 | Ant Design Form | `Form` (rules 속성) |
| 실시간 검증 | Ant Design Form | `Form.Item` (validateTrigger) |
| 다양한 입력 필드 | Ant Design 입력 컴포넌트 | `Input`, `Select`, `DatePicker`, `Checkbox`, `Radio` 등 |
| 파일 업로드 (드래그앤드롭) | Ant Design Upload | `Upload.Dragger` |

### 피드백/상태

| PRD 요구사항 | 적용 기술 | Ant Design 컴포넌트 |
|-------------|----------|-------------------|
| 확인 다이얼로그 | Ant Design Modal | `Modal.confirm()` |
| 알림 (Toast) | Ant Design message/notification | `message`, `notification` |
| 로딩 스피너 | Ant Design Spin | `Spin`, `Skeleton` |
| 빈 상태 | Ant Design Empty | `Empty` |
| 에러 페이지 | Ant Design Result | `Result` (status: 404, 500 등) |

### 대시보드/차트

| PRD 요구사항 | 적용 기술 | Ant Design 컴포넌트 |
|-------------|----------|-------------------|
| KPI 카드 | Ant Design Statistic | `Statistic`, `Card` |
| 라인/바/파이 차트 | @ant-design/charts | `Line`, `Column`, `Pie` |
| 실시간 차트 갱신 | @ant-design/charts + Polling | 차트 데이터 자동 갱신 |
| 게이지 차트 | @ant-design/charts | `Gauge` |

### 접근성/키보드

| PRD 요구사항 | 적용 기술 | 구현 방법 |
|-------------|----------|----------|
| 키보드 단축키 | react-hotkeys-hook | 전역 키보드 이벤트 핸들링 |
| Tab 키 포커스 이동 | Ant Design 내장 | 자동 지원 |
| ARIA 레이블 | Ant Design 내장 | 자동 지원 |
| 포커스 표시 | Ant Design 내장 | 자동 지원 |

### 기타 기능

| PRD 요구사항 | 적용 기술 | 구현 방법 |
|-------------|----------|----------|
| 컨텍스트 메뉴 (우클릭) | Ant Design Dropdown | `Dropdown` (trigger: ['contextMenu']) |
| 온보딩 가이드 투어 | Ant Design Tour | `Tour` 컴포넌트 |
| 툴팁 도움말 | Ant Design Tooltip | `Tooltip` |
| 마법사 (Wizard) | Ant Design Steps | `Steps` + 단계별 폼 |
| 분할 화면 | react-split-pane | 별도 라이브러리 |

---

## 8. 향후 아키텍처 전환 로드맵

> **목표**: 현재 MVP 아키텍처(Next.js 풀스택 + SQLite)에서 엔터프라이즈 아키텍처(Next.js + Spring Boot + Oracle)로 점진적 전환

### 8.1 아키텍처 진화 단계

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        아키텍처 진화 로드맵                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Phase 1 (현재)          Phase 2              Phase 3             Phase 4   │
│  ┌──────────────┐      ┌──────────────┐    ┌──────────────┐   ┌──────────────┐
│  │   Next.js    │      │   Next.js    │    │   Next.js    │   │   Next.js    │
│  │  (풀스택)    │  →   │ (프론트엔드) │ →  │ (프론트엔드) │ → │ (프론트엔드) │
│  │             │      │              │    │              │   │              │
│  │ API Routes  │      │  API Routes  │    │    ─────     │   │    ─────     │
│  │   + Prisma  │      │  (Proxy/BFF) │    │              │   │              │
│  └──────┬──────┘      └──────┬───────┘    └──────┬───────┘   └──────┬───────┘
│         │                    │                   │                  │        │
│         ▼                    ▼                   ▼                  ▼        │
│  ┌──────────────┐      ┌──────────────┐    ┌──────────────┐   ┌──────────────┐
│  │   SQLite     │      │  PostgreSQL  │    │ Spring Boot  │   │ Spring Boot  │
│  │   (파일)     │      │  (컨테이너)  │    │  REST API    │   │  REST API    │
│  └──────────────┘      └──────────────┘    └──────┬───────┘   └──────┬───────┘
│                                                   │                  │        │
│                                                   ▼                  ▼        │
│                                            ┌──────────────┐   ┌──────────────┐
│                                            │  PostgreSQL  │   │   Oracle DB  │
│                                            │              │   │              │
│                                            └──────────────┘   └──────────────┘
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Phase별 상세 전환 계획

| Phase | 목표 | 프론트엔드 | 백엔드 | 데이터베이스 | 핵심 작업 |
|-------|------|-----------|--------|-------------|----------|
| **Phase 1** (현재) | MVP 개발/검증 | Next.js (풀스택) | Next.js API Routes + Prisma | SQLite | UI/UX 프레임워크 검증, 화면 템플릿 구현 |
| **Phase 2** | DB 엔터프라이즈화 | Next.js (풀스택) | Next.js API Routes + Prisma | PostgreSQL | SQLite → PostgreSQL 마이그레이션 |
| **Phase 3** | 백엔드 분리 | Next.js (프론트엔드) | Spring Boot REST API | PostgreSQL | API 레이어 분리, Spring Boot 백엔드 구축 |
| **Phase 4** | DB 전환 | Next.js (프론트엔드) | Spring Boot REST API | Oracle | PostgreSQL → Oracle 마이그레이션 |

### 8.3 API 레이어 추상화 전략

#### 8.3.1 현재(Phase 1) API 구조
```typescript
// app/api/[resource]/route.ts - Next.js API Routes
import { prisma } from '@/lib/prisma'

export async function GET() {
  const data = await prisma.resource.findMany()
  return Response.json(data)
}
```

#### 8.3.2 전환 대비 API 추상화 패턴

**API 클라이언트 추상화 (lib/api/client.ts)**
```typescript
// Phase 1~2: Next.js API Routes 직접 호출
// Phase 3~4: Spring Boot API 호출로 전환

interface ApiConfig {
  baseUrl: string
  headers?: Record<string, string>
}

// 환경변수로 백엔드 엔드포인트 전환
const config: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
      ...options?.headers,
    },
  })
  return response.json()
}
```

**서비스 레이어 패턴 (lib/services/)**
```typescript
// lib/services/production.ts
// 비즈니스 로직을 서비스 레이어로 분리하여 백엔드 전환 시 재사용

export const productionService = {
  async getWorkOrders(params: WorkOrderParams) {
    return apiClient<WorkOrder[]>('/production/work-orders', {
      method: 'GET',
      body: JSON.stringify(params),
    })
  },

  async createWorkOrder(data: CreateWorkOrderDto) {
    return apiClient<WorkOrder>('/production/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
```

### 8.4 데이터 모델 설계 지침 (Oracle 호환성)

#### 8.4.1 Prisma 스키마 작성 시 고려사항

| 항목 | SQLite/PostgreSQL | Oracle 호환 지침 |
|-----|------------------|-----------------|
| 테이블명 | 소문자 snake_case | 30자 이내 (Oracle 제약) |
| 컬럼명 | 소문자 snake_case | 30자 이내, 예약어 회피 |
| 기본키 | autoincrement | Oracle SEQUENCE 매핑 고려 |
| 날짜/시간 | DateTime | Oracle DATE/TIMESTAMP 호환 |
| 텍스트 | String | VARCHAR2(4000) 제한 고려, CLOB 필요 시 명시 |
| Boolean | Boolean | Oracle NUMBER(1) 매핑 (0/1) |
| Decimal | Decimal | Oracle NUMBER(p,s) 정밀도 명시 |

#### 8.4.2 스키마 예시 (Oracle 호환 고려)

```prisma
// prisma/schema.prisma

model WorkOrder {
  id            Int       @id @default(autoincrement())
  orderNo       String    @unique @db.VarChar(30)  // Oracle VARCHAR2 호환
  productCode   String    @db.VarChar(50)
  quantity      Int
  status        String    @db.VarChar(20)          // ENUM 대신 VARCHAR
  plannedStart  DateTime  @db.Timestamp()          // Oracle TIMESTAMP 호환
  plannedEnd    DateTime  @db.Timestamp()
  createdAt     DateTime  @default(now()) @db.Timestamp()
  updatedAt     DateTime  @updatedAt @db.Timestamp()

  // 관계 정의
  productions   Production[]

  @@map("work_order")  // 테이블명 30자 이내
  @@index([productCode, status])
}
```

### 8.5 Spring Boot 백엔드 인터페이스 사전 정의

#### 8.5.1 API 엔드포인트 규약 (RESTful)

```yaml
# Phase 3 이후 Spring Boot API 엔드포인트 규약

기본 URL: /api/v1

# 생산 관리
GET    /api/v1/production/work-orders          # 작업 지시 목록
GET    /api/v1/production/work-orders/{id}     # 작업 지시 상세
POST   /api/v1/production/work-orders          # 작업 지시 등록
PUT    /api/v1/production/work-orders/{id}     # 작업 지시 수정
DELETE /api/v1/production/work-orders/{id}     # 작업 지시 삭제

# 대시보드
GET    /api/v1/dashboard/summary               # 대시보드 요약
GET    /api/v1/dashboard/kpi                   # KPI 지표
GET    /api/v1/dashboard/line-status           # 라인별 상태

# 인증
POST   /api/v1/auth/login                      # 로그인
POST   /api/v1/auth/logout                     # 로그아웃
POST   /api/v1/auth/refresh                    # 토큰 갱신
GET    /api/v1/auth/me                         # 현재 사용자 정보
```

#### 8.5.2 응답 형식 표준

```typescript
// 성공 응답
interface ApiResponse<T> {
  success: true
  data: T
  meta?: {
    page?: number
    pageSize?: number
    total?: number
  }
}

// 에러 응답
interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}
```

### 8.6 마이그레이션 체크리스트

#### Phase 1 → Phase 2 (SQLite → PostgreSQL)

- [ ] Docker Compose에 PostgreSQL 서비스 추가
- [ ] Prisma datasource를 PostgreSQL로 변경
- [ ] `prisma migrate deploy` 실행
- [ ] 기존 데이터 마이그레이션 스크립트 작성
- [ ] 연결 풀링 설정 (PgBouncer 또는 Prisma Connection Pool)
- [ ] 성능 테스트 및 인덱스 최적화

#### Phase 2 → Phase 3 (백엔드 분리)

- [ ] Spring Boot 프로젝트 초기 설정
- [ ] JPA Entity 정의 (Prisma 스키마 기반)
- [ ] REST Controller 구현 (API 규약 준수)
- [ ] Next.js API Routes를 프록시/BFF 모드로 전환
- [ ] API 클라이언트 baseUrl 환경변수 전환
- [ ] CORS 설정
- [ ] 인증 연동 (JWT 토큰 공유 또는 OAuth2)
- [ ] 통합 테스트

#### Phase 3 → Phase 4 (PostgreSQL → Oracle)

- [ ] Oracle JDBC 드라이버 설정
- [ ] JPA Dialect을 Oracle로 변경
- [ ] 데이터 타입 매핑 검증 (특히 CLOB, TIMESTAMP)
- [ ] 시퀀스 전략 조정 (Oracle SEQUENCE)
- [ ] 기존 데이터 마이그레이션 (ETL 도구 또는 스크립트)
- [ ] 성능 테스트 및 실행 계획 분석

### 8.7 엔터프라이즈 확장 고려사항 (Phase 4 이후)

| 영역 | 현재 (MVP) | 엔터프라이즈 확장 |
|-----|-----------|-----------------|
| 동시 접속자 | 100명 | 1,000~10,000명 |
| 다중 공장 | 단일 공장 | 다중 공장 (멀티테넌시) |
| 데이터 보존 | 1년 | 10년+ (아카이빙 전략 필요) |
| 가용성 | 99.5% | 99.9%+ (HA 구성) |
| 백업/복구 | 일 1회 백업 | 실시간 복제, PITR |
| 모니터링 | 기본 로깅 | APM, 분산 트레이싱 |
| 외부 연동 | - | ERP, SCM, PLM 연동 |

---

## 참고 자료

- [Next.js 16 릴리즈 노트](https://nextjs.org/blog/next-16)
- [Ant Design 6.0 마이그레이션 가이드](https://ant.design/docs/react/migration-v6/)
- [Ant Design 컴포넌트 문서](https://ant.design/components/overview/)
- [Ant Design Charts](https://charts.ant.design/)
- [Prisma 7.0 릴리즈 노트](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0)
- [React 19 릴리즈 노트](https://react.dev/blog/2024/12/05/react-19)
- [TailwindCSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4)
- [Auth.js v5 마이그레이션 가이드](https://authjs.dev/getting-started/migrating-to-v5)
- [Node.js 릴리즈 스케줄](https://nodejs.org/en/about/previous-releases)
- [PostgreSQL 버전 정책](https://www.postgresql.org/support/versioning/)

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | AI | 초안 작성 |
| 1.1 | 2026-01-20 | AI | MVP 백엔드 범위 정의 추가 (섹션 2.3) |
| 1.2 | 2026-01-20 | AI | 향후 아키텍처 전환 로드맵 추가 (섹션 8) - Next.js → Spring Boot + Oracle 전환 계획 |
