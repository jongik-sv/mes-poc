# TSK-04-01 구현 보고서

**Task ID:** TSK-04-01
**Task명:** Prisma 및 SQLite 설정
**카테고리:** infrastructure
**구현 일시:** 2026-01-21
**상태:** 완료

---

## 1. 구현 개요

MES Portal MVP 프로젝트에 Prisma ORM 및 SQLite 데이터베이스 설정을 완료했습니다. Prisma 7.x의 새로운 아키텍처에 따라 `@prisma/adapter-better-sqlite3` 어댑터를 사용하여 SQLite 연동을 구현했습니다.

---

## 2. 구현 내용

### 2.1 설치된 패키지

| 패키지 | 유형 | 버전 | 용도 |
|--------|------|------|------|
| prisma | devDependencies | ^7.2.0 | Prisma CLI |
| @prisma/client | dependencies | ^7.2.0 | Prisma Client 런타임 |
| @prisma/adapter-better-sqlite3 | dependencies | ^7.2.0 | SQLite 어댑터 |
| dotenv | dependencies | ^17.2.3 | 환경변수 로드 |

### 2.2 생성/수정된 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `prisma/schema.prisma` | 신규 | Prisma 스키마 정의 |
| `prisma.config.ts` | 신규 | Prisma 설정 파일 |
| `lib/prisma.ts` | 신규 | PrismaClient 싱글톤 |
| `.env` | 신규 | 환경변수 (DATABASE_URL) |
| `.env.example` | 신규 | 환경변수 템플릿 |
| `package.json` | 수정 | 스크립트 및 pnpm 설정 추가 |
| `.gitignore` | 수정 | Prisma 관련 파일 제외 |

### 2.3 디렉토리 구조

```
mes-portal/
├── prisma/
│   ├── schema.prisma          # Prisma 스키마 정의
│   ├── dev.db                 # SQLite DB 파일 (gitignore)
│   └── dev.db-journal         # SQLite 저널 파일 (gitignore)
├── prisma.config.ts           # Prisma 7.x 설정 파일
├── lib/
│   ├── prisma.ts              # PrismaClient 싱글톤
│   └── generated/
│       └── prisma/            # 생성된 Prisma Client (gitignore)
├── .env                       # 환경변수
└── .env.example               # 환경변수 템플릿
```

---

## 3. 구현 상세

### 3.1 Prisma 스키마 (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "sqlite"
}
```

- Prisma 7.x에서는 `prisma-client` generator 사용
- Client 출력 경로: `lib/generated/prisma`
- 실제 모델은 TSK-04-02에서 정의 예정

### 3.2 PrismaClient 싱글톤 (`lib/prisma.ts`)

```typescript
import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from './generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
```

**싱글톤 패턴 적용 이유:**
- Next.js Hot Reload 시 PrismaClient 인스턴스 중복 생성 방지
- 개발 환경에서 연결 풀 고갈 방지
- 프로덕션에서는 새 인스턴스 생성

### 3.3 package.json 스크립트

```json
{
  "scripts": {
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "prisma",
      "@prisma/engines",
      "esbuild",
      "better-sqlite3"
    ]
  }
}
```

### 3.4 환경변수 설정

**.env:**
```bash
DATABASE_URL="file:./dev.db"
```

**.env.example:**
```bash
# Database
DATABASE_URL="file:./dev.db"
```

### 3.5 .gitignore 추가

```gitignore
# Prisma
prisma/dev.db
prisma/dev.db-journal
```

---

## 4. 기술적 결정 사항

### 4.1 Prisma 7.x 아키텍처

Prisma 7.x에서는 기존과 다른 아키텍처를 사용합니다:

1. **Driver Adapter 필수**: 모든 데이터베이스에 대해 driver adapter가 필요
2. **새로운 Client 출력 구조**: `lib/generated/prisma/client.ts`에서 export
3. **prisma.config.ts**: 새로운 설정 파일 방식

### 4.2 SQLite 선택 이유

- MVP 단계에서 설치 복잡도 최소화
- 별도 DB 서버 불필요
- Phase 2에서 PostgreSQL 전환 예정 (datasource provider 변경만으로 가능)

### 4.3 better-sqlite3 어댑터

Prisma 7.x에서 SQLite 사용 시 `@prisma/adapter-better-sqlite3`가 필요합니다. 이 어댑터는 네이티브 모듈로 빌드가 필요하여 pnpm 빌드 허용 설정을 추가했습니다.

---

## 5. 제한 사항 및 알려진 이슈

### 5.1 제한 사항

| 제한 | 설명 | 대응 방안 |
|------|------|----------|
| SQLite 동시성 | 동시 쓰기 시 락 발생 가능 | MVP 단계 영향 없음, Phase 2에서 PostgreSQL 전환 |
| 네이티브 빌드 | better-sqlite3 빌드 필요 | pnpm onlyBuiltDependencies 설정 |

### 5.2 Next.js Workspace Warning

Next.js가 workspace root를 잘못 인식하는 경고가 발생하나, 빌드 및 실행에는 영향 없습니다.

---

## 6. 후속 작업

| Task ID | 작업 | 의존 관계 |
|---------|------|----------|
| TSK-04-02 | 사용자 및 역할 모델 | Prisma 스키마에 모델 정의 |
| TSK-04-03 | Auth.js 인증 설정 | PrismaClient 사용 |
| TSK-03-01 | 메뉴 데이터 모델 | PrismaClient 사용 |

---

## 7. 검증 결과

모든 수용 기준을 통과했습니다. 상세 내용은 `070-infra-test-results.md` 참조.

| 수용 기준 | 결과 |
|----------|------|
| prisma db push 성공 | ✅ PASS |
| prisma studio 실행 가능 | ✅ PASS |
| PrismaClient import 가능 | ✅ PASS |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | Claude | 최초 작성 |
