# TSK-04-01 - Prisma 및 SQLite 설정 설계 문서

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-04-01 |
| 문서 버전 | 1.0 |
| 작성일 | 2026-01-20 |
| 상태 | 작성중 |
| 카테고리 | infrastructure |

---

## 1. 개요

### 1.1 배경 및 문제 정의

**현재 상황:**
- MES Portal MVP 프로젝트가 Next.js 기반으로 초기화됨 (TSK-00-01 완료)
- UI 라이브러리 및 테마 설정 진행 중 (TSK-00-02)
- 인증 및 메뉴 권한 기능 구현을 위해 데이터베이스 연동이 필요함

**해결하려는 문제:**
- 사용자 정보, 역할, 메뉴 데이터를 영구 저장할 수 있는 데이터베이스 레이어 부재
- 타입 안전한 데이터베이스 접근 방식 필요
- MVP 단계에서 설치 및 운영 복잡도를 최소화하면서 추후 PostgreSQL로 전환 가능한 구조 필요

### 1.2 목적 및 기대 효과

**목적:**
- Prisma ORM을 통한 타입 안전한 데이터베이스 접근 레이어 구축
- SQLite를 MVP 데이터베이스로 설정하여 빠른 개발 환경 구성
- 추후 PostgreSQL 전환을 위한 기반 마련

**기대 효과:**
- TypeScript 네이티브 타입 생성으로 개발 생산성 향상
- 별도 DB 서버 설치 없이 파일 기반 DB로 즉시 개발 시작 가능
- Prisma 마이그레이션을 통한 스키마 버전 관리
- 인증, 메뉴 권한 등 후속 Task의 데이터 레이어 기반 제공

### 1.3 범위

**포함:**
- Prisma 7.x 설치 및 초기화
- SQLite datasource 설정
- PrismaClient 싱글톤 인스턴스 생성 (`lib/prisma.ts`)
- 환경변수 설정 (`.env`)
- Prisma 기본 명령어 동작 확인 (`db push`, `studio`)

**제외:**
- User, Role, Menu 등 실제 데이터 모델 정의 (→ TSK-04-02에서 구현)
- Auth.js 연동 (→ TSK-04-03에서 구현)
- 시드 데이터 작성 (→ TSK-04-02에서 구현)

### 1.4 참조 문서

| 문서 | 경로 | 관련 섹션 |
|------|------|----------|
| PRD | `.orchay/projects/mes-portal/prd.md` | 4.1.4 사용자 관리 |
| TRD | `.orchay/projects/mes-portal/trd.md` | 1.1 기술 스택, 2.3 MVP 백엔드 범위 |

---

## 2. 기술 설계

### 2.1 기술 스택

| 구성요소 | 기술 | 버전 | 선정 근거 |
|---------|------|------|----------|
| ORM | Prisma | 7.x | TypeScript 네이티브, 자동 타입 생성, SQLite↔PostgreSQL 전환 용이 |
| 데이터베이스 | SQLite | - | 설치 불필요, 파일 기반, 빠른 프로토타이핑 |
| 런타임 | Node.js | 22.x LTS | 프로젝트 기준 런타임 |

### 2.2 디렉토리 구조

```
mes-portal/
├── prisma/
│   └── schema.prisma          # Prisma 스키마 정의 파일
├── lib/
│   └── prisma.ts              # PrismaClient 싱글톤 인스턴스
├── .env                       # 환경변수 (DATABASE_URL)
└── .env.example               # 환경변수 템플릿
```

### 2.3 Prisma 스키마 기본 구조

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// 모델은 TSK-04-02에서 정의
```

### 2.4 PrismaClient 싱글톤 패턴

```typescript
// lib/prisma.ts

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
```

**싱글톤 패턴 적용 이유:**
- Next.js의 Hot Reload 시 PrismaClient 인스턴스 중복 생성 방지
- 개발 환경에서 연결 풀 고갈 방지
- 프로덕션에서는 새 인스턴스 생성으로 정상 동작

### 2.5 환경변수 설정

```bash
# .env
DATABASE_URL="file:./dev.db"

# .env.example
DATABASE_URL="file:./dev.db"
```

**환경변수 설명:**
- `DATABASE_URL`: SQLite 데이터베이스 파일 경로
- `file:./dev.db`: prisma 폴더 기준 상대 경로로 dev.db 파일 생성

---

## 3. 구현 계획

### 3.1 구현 단계

| 단계 | 작업 | 설명 |
|------|------|------|
| 1 | Prisma 설치 | `pnpm add -D prisma`, `pnpm add @prisma/client` |
| 2 | Prisma 초기화 | `npx prisma init --datasource-provider sqlite` |
| 3 | 스키마 설정 | generator, datasource 설정 확인 |
| 4 | 환경변수 설정 | `.env` 파일에 DATABASE_URL 설정 |
| 5 | PrismaClient 싱글톤 | `lib/prisma.ts` 파일 생성 |
| 6 | Prisma 명령어 테스트 | `db push`, `studio` 동작 확인 |
| 7 | .gitignore 업데이트 | dev.db 파일 제외 설정 |

### 3.2 package.json 스크립트 추가

```json
{
  "scripts": {
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  }
}
```

### 3.3 .gitignore 추가 항목

```gitignore
# Prisma
prisma/dev.db
prisma/dev.db-journal
```

---

## 4. 검증 기준

### 4.1 수용 기준 (Acceptance Criteria)

| 항목 | 검증 방법 | 기대 결과 |
|------|----------|----------|
| Prisma 설치 확인 | `npx prisma --version` | 버전 7.x 출력 |
| DB Push 성공 | `pnpm db:push` | SQLite 파일 생성, 에러 없음 |
| Prisma Studio 실행 | `pnpm db:studio` | localhost:5555에서 Studio UI 표시 |
| PrismaClient import | TypeScript 컴파일 | `@prisma/client` import 에러 없음 |

### 4.2 통합 검증

| 검증 항목 | 파일/위치 | 확인 사항 |
|----------|----------|----------|
| 스키마 파일 | `prisma/schema.prisma` | generator, datasource 설정 |
| 싱글톤 클라이언트 | `lib/prisma.ts` | export default prisma |
| 환경변수 | `.env` | DATABASE_URL 설정 |
| 데이터베이스 파일 | `prisma/dev.db` | 파일 생성 확인 |

---

## 5. 의존성 및 제약사항

### 5.1 의존성

| 의존 항목 | 이유 | 상태 |
|----------|------|------|
| TSK-00-01 (Next.js 프로젝트 생성) | 프로젝트 기반 필요 | 완료 |

### 5.2 후속 Task에 미치는 영향

| Task | 영향 | 필요 사항 |
|------|------|----------|
| TSK-04-02 (사용자 및 역할 모델) | 데이터 모델 정의 기반 | Prisma 스키마 파일, PrismaClient |
| TSK-04-03 (Auth.js 인증 설정) | 사용자 조회 기반 | PrismaClient 사용 가능 |
| TSK-03-01 (메뉴 데이터 모델) | 메뉴 데이터 저장 기반 | PrismaClient 사용 가능 |

### 5.3 제약 사항

| 제약 | 설명 | 대응 방안 |
|------|------|----------|
| SQLite 동시성 제한 | 동시 쓰기 시 락 발생 가능 | MVP 단계에서는 문제없음, Phase 2에서 PostgreSQL 전환 |
| WAL 모드 미지원 (Prisma) | 일부 고급 기능 제한 | 기본 저널 모드로 사용 |

---

## 6. 에러 처리

### 6.1 예상 에러 상황

| 상황 | 원인 | 해결 방법 |
|------|------|----------|
| DATABASE_URL 미설정 | .env 파일 누락 | .env 파일 생성 및 DATABASE_URL 설정 |
| Prisma Client 미생성 | generate 실행 안 됨 | `npx prisma generate` 실행 |
| 스키마 문법 오류 | schema.prisma 오류 | Prisma 문법 검증 후 수정 |
| 파일 권한 오류 | dev.db 쓰기 권한 없음 | 디렉토리 권한 확인 |

---

## 7. 체크리스트

### 7.1 구현 완료 확인

- [ ] Prisma 7.x 설치 완료
- [ ] prisma/schema.prisma 파일 생성
- [ ] .env 파일에 DATABASE_URL 설정
- [ ] lib/prisma.ts 싱글톤 클라이언트 생성
- [ ] pnpm db:push 정상 실행
- [ ] pnpm db:studio 정상 실행
- [ ] PrismaClient import 가능 확인
- [ ] .gitignore에 dev.db 추가

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |
