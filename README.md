# MES Portal

Manufacturing Execution System (MES) 포털 애플리케이션

## 기술 스택

- **프레임워크**: Next.js 16.x (App Router), React 19.x, TypeScript 5.x
- **UI**: Ant Design 6.x, TailwindCSS 4.x
- **인증**: NextAuth.js v5
- **데이터베이스**: SQLite (Better-SQLite3) + Prisma ORM
- **테스트**: Vitest, Testing Library, Playwright
- **패키지 매니저**: pnpm

## 프로젝트 구조

```
mes-poc/
├── mes-portal/              # Next.js MES 포털 애플리케이션
│   ├── app/                 # App Router
│   ├── components/          # 공유 컴포넌트
│   ├── lib/                 # 유틸리티 및 설정
│   │   └── theme/          # Ant Design 테마 중앙 관리
│   ├── prisma/             # Prisma 스키마 및 시드
│   └── screens/            # 화면별 컴포넌트
└── .orchay/                 # 프로젝트 관리 (PRD, TRD, WBS)
```

## 시작하기

### 1. 의존성 설치

```bash
cd mes-portal
pnpm install
```

### 2. 데이터베이스 초기화

```bash
pnpm prisma generate
pnpm prisma db push
pnpm prisma db seed
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 http://localhost:3000 접속

## 테스트 계정

| 역할 | 이메일 | 비밀번호 | 권한 |
|------|--------|----------|------|
| 시스템 관리자 | `admin@example.com` | `password123` | 모든 메뉴 접근 |
| 생산 관리자 | `manager@example.com` | `password123` | 시스템 관리 제외 |
| 현장 작업자 | `operator@example.com` | `password123` | 작업 관련 메뉴만 |

## 명령어

```bash
# 개발 서버
pnpm dev

# 빌드
pnpm build

# 린트
pnpm lint

# 테스트
pnpm test              # watch 모드
pnpm test:run          # 단일 실행
pnpm test:coverage     # 커버리지 포함
```

## 테마

- 기본 테마: 라이트 모드
- 다크 모드: 헤더의 테마 스위치로 전환
- 테마 설정: `lib/theme/` 폴더에서 중앙 관리

## 문서

- PRD: `.orchay/projects/mes-portal/prd.md`
- TRD: `.orchay/projects/mes-portal/trd.md`
- WBS: `.orchay/projects/mes-portal/wbs.yaml`
