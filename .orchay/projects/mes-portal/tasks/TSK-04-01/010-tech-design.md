# TSK-04-01 - Prisma 및 SQLite 설정 기술 설계 문서

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **설계 규칙**
> * Infrastructure 카테고리 전용 (인프라, 설정, 환경 구성)
> * As-Is → To-Be 전환 관점 설계
> * 롤백 계획 필수 포함
> * 검증 및 모니터링 방안 명시

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-04-01 |
| Task명 | Prisma 및 SQLite 설정 |
| Category | infrastructure |
| 상태 | [dd] 상세설계 |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

### 상위 문서 참조

| 문서 유형 | 경로 | 참조 섹션 |
|----------|------|----------|
| PRD | `.orchay/projects/mes-portal/prd.md` | 4.1.4 사용자 관리 |
| TRD | `.orchay/projects/mes-portal/trd.md` | 1.1 기술 스택, 2.3 MVP 백엔드 범위 |

---

## 1. 개요

### 1.1 배경

MES Portal MVP 프로젝트가 Next.js 기반으로 초기화되었으며(TSK-00-01 완료), 인증 및 메뉴 권한 기능 구현을 위해 데이터베이스 연동이 필요한 상황입니다.

- Next.js 프로젝트 기본 구조만 존재
- 사용자, 역할, 메뉴 데이터를 저장할 영구 저장소 부재
- MVP 단계에서 설치 복잡도를 최소화하면서 확장 가능한 구조 필요

### 1.2 목적

- Prisma ORM을 통한 타입 안전한 데이터베이스 접근 레이어 구축
- SQLite를 MVP 데이터베이스로 설정하여 빠른 개발 환경 구성
- 추후 PostgreSQL 전환을 위한 기반 마련

### 1.3 범위

**포함 범위:**
- Prisma 7.x 설치 및 초기화
- SQLite datasource 설정
- PrismaClient 싱글톤 인스턴스 생성 (`lib/prisma.ts`)
- 환경변수 설정 (`.env`)
- Prisma 기본 명령어 동작 확인 (`db push`, `studio`)

**제외 범위:**
- User, Role, Menu 등 실제 데이터 모델 정의 → TSK-04-02
- Auth.js 연동 → TSK-04-03
- 시드 데이터 작성 → TSK-04-02

### 1.4 참조 문서

| 문서 | 경로 | 관련 섹션 |
|------|------|----------|
| PRD | `.orchay/projects/mes-portal/prd.md` | 4.1.4 사용자 관리 |
| TRD | `.orchay/projects/mes-portal/trd.md` | 1.1 기술 스택, 2.3 MVP 백엔드 범위 |
| Prisma 공식 문서 | https://www.prisma.io/docs | Getting Started |

---

## 2. 현재 상태 (As-Is)

### 2.1 현재 아키텍처

```
mes-portal/
├── src/
│   └── app/              # Next.js App Router
├── package.json          # 의존성 (prisma 없음)
└── .env.local            # 환경변수 (DB 설정 없음)
```

현재 Next.js 프로젝트에는 데이터베이스 연동이 전혀 없는 상태입니다.

### 2.2 현재 구성 요소

| 구성 요소 | 버전/상태 | 역할 | 비고 |
|----------|----------|------|------|
| Next.js | 15.x | 프론트엔드 프레임워크 | 설치됨 |
| TypeScript | 5.x | 타입 시스템 | 설치됨 |
| ORM | - | 데이터베이스 접근 | **없음** |
| Database | - | 데이터 저장소 | **없음** |

### 2.3 문제점 분석

| 문제점 | 영향 | 심각도 |
|--------|------|--------|
| 데이터베이스 레이어 부재 | 사용자 인증, 메뉴 관리 기능 구현 불가 | High |
| 타입 안전한 DB 접근 방식 없음 | 런타임 오류 가능성, 개발 생산성 저하 | Medium |
| 영구 데이터 저장 불가 | 서버 재시작 시 모든 데이터 손실 | High |

### 2.4 현재 설정/환경

```bash
# .env.local (현재)
# 데이터베이스 관련 설정 없음
```

---

## 3. 목표 상태 (To-Be)

### 3.1 목표 아키텍처

```
mes-portal/
├── prisma/
│   ├── schema.prisma     # Prisma 스키마 정의 파일
│   └── dev.db            # SQLite 데이터베이스 파일 (gitignore)
├── lib/
│   └── prisma.ts         # PrismaClient 싱글톤 인스턴스
├── .env                  # 환경변수 (DATABASE_URL)
├── .env.example          # 환경변수 템플릿
└── package.json          # prisma, @prisma/client 의존성 추가
```

### 3.2 목표 구성 요소

| 구성 요소 | 버전/상태 | 역할 | 변경 사항 |
|----------|----------|------|----------|
| Next.js | 15.x | 프론트엔드 프레임워크 | 유지 |
| TypeScript | 5.x | 타입 시스템 | 유지 |
| Prisma | 7.x | ORM | **신규** |
| SQLite | - | MVP 데이터베이스 | **신규** |

### 3.3 기대 효과

| 개선 항목 | 현재 | 목표 | 개선 내용 |
|----------|------|------|----------|
| 데이터 영속성 | 없음 | SQLite 파일 기반 | 서버 재시작 후에도 데이터 유지 |
| 타입 안전성 | 없음 | Prisma Client 자동 생성 | TypeScript 네이티브 타입 지원 |
| 개발 환경 | - | 별도 DB 서버 불필요 | 설치 복잡도 최소화 |
| 확장성 | - | PostgreSQL 전환 용이 | datasource provider 변경만으로 전환 |

### 3.4 목표 설정/환경

**prisma/schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// 모델은 TSK-04-02에서 정의
```

**lib/prisma.ts:**
```typescript
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

**.env:**
```bash
DATABASE_URL="file:./dev.db"
```

---

## 4. 구현 계획

### 4.1 구현 단계

| 단계 | 작업 | 설명 | 명령어/파일 |
|------|------|------|------------|
| 1 | Prisma 설치 | devDependencies에 prisma, dependencies에 @prisma/client | `pnpm add -D prisma && pnpm add @prisma/client` |
| 2 | Prisma 초기화 | SQLite datasource로 초기화 | `npx prisma init --datasource-provider sqlite` |
| 3 | 스키마 설정 | generator, datasource 설정 확인 | `prisma/schema.prisma` |
| 4 | 환경변수 설정 | DATABASE_URL 설정 | `.env`, `.env.example` |
| 5 | PrismaClient 싱글톤 | 싱글톤 패턴 클라이언트 생성 | `lib/prisma.ts` |
| 6 | package.json 스크립트 | db:push, db:studio, db:generate | `package.json` |
| 7 | .gitignore 업데이트 | dev.db 파일 제외 | `.gitignore` |
| 8 | 동작 확인 | db push, studio 실행 테스트 | `pnpm db:push && pnpm db:studio` |

### 4.2 기술 스택

| 구성 요소 | 기술 | 버전 | 선정 근거 |
|----------|------|------|----------|
| ORM | Prisma | 7.x | TypeScript 네이티브, 자동 타입 생성, SQLite↔PostgreSQL 전환 용이 |
| 데이터베이스 | SQLite | - | 설치 불필요, 파일 기반, 빠른 프로토타이핑 |
| 런타임 | Node.js | 22.x LTS | 프로젝트 기준 런타임 |

### 4.3 디렉토리/파일 구조

```
mes-portal/
├── prisma/
│   ├── schema.prisma          # Prisma 스키마 정의
│   └── dev.db                 # SQLite DB 파일 (gitignore)
├── lib/
│   └── prisma.ts              # PrismaClient 싱글톤
├── .env                       # 환경변수 (DATABASE_URL)
├── .env.example               # 환경변수 템플릿
└── .gitignore                 # dev.db 제외 추가
```

### 4.4 설정 변경 사항

**변경 파일 목록:**

| 파일 | 변경 유형 | 변경 내용 |
|------|----------|----------|
| `prisma/schema.prisma` | 신규 | Prisma 스키마 (generator, datasource) |
| `lib/prisma.ts` | 신규 | PrismaClient 싱글톤 |
| `.env` | 수정 | DATABASE_URL 추가 |
| `.env.example` | 신규 | 환경변수 템플릿 |
| `package.json` | 수정 | scripts 추가 (db:push, db:studio, db:generate) |
| `.gitignore` | 수정 | prisma/dev.db, prisma/dev.db-journal 추가 |

**package.json scripts 추가:**
```json
{
  "scripts": {
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  }
}
```

**.gitignore 추가 항목:**
```gitignore
# Prisma
prisma/dev.db
prisma/dev.db-journal
```

### 4.5 롤백 계획

> ⚠️ **필수**: 문제 발생 시 이전 상태로 복구하는 절차

**롤백 트리거 조건:**
- Prisma 설치 후 빌드 실패
- PrismaClient 생성 오류
- 기존 기능 영향 발생

**롤백 절차:**

| 단계 | 작업 | 명령어/절차 | 확인 사항 |
|------|------|------------|----------|
| 1 | 의존성 제거 | `pnpm remove prisma @prisma/client` | package.json에서 제거 확인 |
| 2 | 생성 파일 삭제 | `rm -rf prisma/ lib/prisma.ts` | 디렉토리/파일 삭제 확인 |
| 3 | 환경변수 제거 | `.env`에서 DATABASE_URL 삭제 | 환경변수 제거 확인 |
| 4 | .gitignore 원복 | Prisma 관련 라인 제거 | .gitignore 원복 확인 |
| 5 | package.json 스크립트 제거 | db:* 스크립트 삭제 | scripts 원복 확인 |
| 6 | 빌드 테스트 | `pnpm build` | 빌드 성공 확인 |

**롤백 후 검증:**
- [ ] `pnpm build` 성공
- [ ] `pnpm dev` 정상 실행
- [ ] 기존 페이지 접근 정상

---

## 5. 리스크 분석

### 5.1 위험 요소

| 리스크 ID | 위험 요소 | 발생 가능성 | 영향도 | 심각도 |
|-----------|----------|------------|--------|--------|
| RSK-01 | SQLite 동시성 제한 | Low | Medium | 낮음 |
| RSK-02 | DATABASE_URL 미설정 | Medium | High | 중간 |
| RSK-03 | Prisma Client 미생성 | Medium | High | 중간 |
| RSK-04 | 스키마 문법 오류 | Low | Medium | 낮음 |
| RSK-05 | 파일 권한 오류 | Low | Medium | 낮음 |

### 5.2 대응 방안

| 리스크 ID | 대응 전략 | 구체적 방안 |
|-----------|----------|------------|
| RSK-01 | 수용 | MVP 단계에서는 문제없음, Phase 2에서 PostgreSQL 전환 예정 |
| RSK-02 | 완화 | .env.example 템플릿 제공, 설치 가이드에 명시 |
| RSK-03 | 완화 | postinstall hook에 prisma generate 추가 고려 |
| RSK-04 | 회피 | Prisma VS Code 확장 사용, 문법 검증 후 커밋 |
| RSK-05 | 완화 | 디렉토리 권한 확인 절차 추가 |

### 5.3 의존성

| 의존 대상 | 유형 | 설명 | 상태 |
|----------|------|------|------|
| TSK-00-01 (Next.js 프로젝트 생성) | 선행 | 프로젝트 기반 필요 | 완료 |

### 5.4 제약 사항

| 제약 | 설명 | 영향 | 대응 방안 |
|------|------|------|----------|
| SQLite 동시성 | 동시 쓰기 시 락 발생 가능 | MVP 단계 영향 없음 | Phase 2에서 PostgreSQL 전환 |
| WAL 모드 미지원 | Prisma에서 일부 고급 기능 제한 | 기본 기능 사용에 문제 없음 | 기본 저널 모드로 사용 |

### 5.5 예상 에러 및 해결

| 상황 | 원인 | 해결 방법 |
|------|------|----------|
| DATABASE_URL 미설정 | .env 파일 누락 | .env 파일 생성 및 DATABASE_URL 설정 |
| Prisma Client 미생성 | generate 실행 안 됨 | `npx prisma generate` 실행 |
| 스키마 문법 오류 | schema.prisma 오류 | Prisma 문법 검증 후 수정 |
| 파일 권한 오류 | dev.db 쓰기 권한 없음 | 디렉토리 권한 확인 |

---

## 6. 검증 계획

### 6.1 테스트 방법

| 테스트 유형 | 테스트 항목 | 방법 | 기대 결과 |
|------------|-----------|------|----------|
| 설치 검증 | Prisma 버전 확인 | `npx prisma --version` | 버전 7.x 출력 |
| 기능 검증 | DB Push | `pnpm db:push` | SQLite 파일 생성, 에러 없음 |
| 기능 검증 | Prisma Studio | `pnpm db:studio` | localhost:5555에서 Studio UI 표시 |
| 통합 검증 | PrismaClient import | TypeScript 컴파일 | `@prisma/client` import 에러 없음 |

### 6.2 수용 기준 (Acceptance Criteria)

| 항목 | 검증 방법 | 기대 결과 | 필수 여부 |
|------|----------|----------|----------|
| Prisma 설치 | `npx prisma --version` | 버전 7.x 출력 | 필수 |
| DB Push 성공 | `pnpm db:push` | SQLite 파일 생성, 에러 없음 | 필수 |
| Prisma Studio 실행 | `pnpm db:studio` | localhost:5555에서 UI 표시 | 필수 |
| PrismaClient import | TypeScript 컴파일 | import 에러 없음 | 필수 |

### 6.3 통합 검증

| 검증 항목 | 파일/위치 | 확인 사항 |
|----------|----------|----------|
| 스키마 파일 | `prisma/schema.prisma` | generator, datasource 설정 |
| 싱글톤 클라이언트 | `lib/prisma.ts` | export default prisma |
| 환경변수 | `.env` | DATABASE_URL 설정 |
| 데이터베이스 파일 | `prisma/dev.db` | 파일 생성 확인 |

### 6.4 체크리스트

**구현 완료 확인:**
- [ ] Prisma 7.x 설치 완료
- [ ] prisma/schema.prisma 파일 생성
- [ ] .env 파일에 DATABASE_URL 설정
- [ ] lib/prisma.ts 싱글톤 클라이언트 생성
- [ ] pnpm db:push 정상 실행
- [ ] pnpm db:studio 정상 실행
- [ ] PrismaClient import 가능 확인
- [ ] .gitignore에 dev.db 추가

**검증 완료 확인:**
- [ ] 설치/설정 검증 완료
- [ ] 기능 검증 완료
- [ ] 통합 검증 완료

---

## 7. 후속 작업

### 7.1 이 Task 완료 후 영향받는 Task

| Task ID | 영향 | 필요 사항 |
|---------|------|----------|
| TSK-04-02 (사용자 및 역할 모델) | 데이터 모델 정의 기반 | Prisma 스키마 파일, PrismaClient |
| TSK-04-03 (Auth.js 인증 설정) | 사용자 조회 기반 | PrismaClient 사용 가능 |
| TSK-03-01 (메뉴 데이터 모델) | 메뉴 데이터 저장 기반 | PrismaClient 사용 가능 |

### 7.2 다음 단계

- `/wf:build` 명령어로 구현 진행

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |
| 1.1 | 2026-01-20 | Claude | 010-tech-design.md 템플릿 구조로 재편 (As-Is/To-Be, 롤백 계획, 리스크 분석 추가) |
