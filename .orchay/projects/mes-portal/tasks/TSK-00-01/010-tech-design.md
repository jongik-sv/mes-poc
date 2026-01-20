# TSK-00-01 - Next.js 프로젝트 생성 기술 설계서

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-00-01 |
| 문서 버전 | 1.0 |
| 작성일 | 2026-01-20 |
| 상태 | 작성중 |
| 카테고리 | infrastructure |

---

## 1. 개요

### 1.1 목적

MES Portal 프로젝트의 기반이 되는 Next.js 풀스택 애플리케이션을 생성하고 초기 설정을 완료한다.

### 1.2 현재 상태

- 프로젝트 저장소는 생성되었으나 Next.js 애플리케이션은 아직 없음
- TRD에 정의된 기술 스택을 기반으로 새 프로젝트 생성 필요

### 1.3 목표 상태

- Next.js 16.x App Router 기반 프로젝트 구조 완성
- TypeScript 5.x 설정 완료
- pnpm 패키지 매니저를 통한 의존성 관리
- 개발 서버 실행 가능 상태

### 1.4 참조 문서

| 문서 | 경로 | 관련 섹션 |
|------|------|----------|
| TRD | `.orchay/projects/mes-portal/trd.md` | 1.1 프론트엔드/백엔드 통합, 1.6 런타임 및 인프라 |

---

## 2. 기술 요구사항

### 2.1 기술 스택 버전

| 기술 | 버전 | 선정 근거 |
|------|------|----------|
| Next.js (App Router) | 16.x | RSC 지원, Turbopack 성능, 풀스택 통합 |
| React | 19.x | AI 코딩 최적 호환, 가장 큰 생태계 |
| TypeScript | 5.x | 타입 안정성, AI 코드 생성 품질 향상 |
| Node.js | 22.x LTS | 2027년 4월까지 지원, ES 모듈 완전 지원 |
| pnpm | latest | 빠른 설치, 디스크 효율, 모노레포 지원 |

### 2.2 프로젝트 구조 (예정)

```
mes-portal/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 라우트 그룹
│   ├── (portal)/          # 포털 메인 라우트 그룹
│   ├── api/               # API Routes
│   ├── globals.css        # 전역 CSS
│   └── layout.tsx         # 루트 레이아웃
├── components/            # 공유 컴포넌트
├── lib/                   # 유틸리티 및 설정
├── public/               # 정적 파일
├── .env.local            # 환경변수 (로컬)
├── next.config.ts        # Next.js 설정
├── tsconfig.json         # TypeScript 설정
├── package.json          # 의존성 관리
└── pnpm-lock.yaml        # pnpm 락 파일
```

---

## 3. 구현 계획

### 3.1 Next.js 프로젝트 생성

```bash
# pnpm을 사용한 Next.js 프로젝트 생성
pnpm create next-app@latest mes-portal --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

**생성 옵션:**
| 옵션 | 값 | 이유 |
|------|-----|------|
| TypeScript | Yes | TRD 요구사항 |
| ESLint | Yes | 코드 품질 보장 |
| Tailwind CSS | Yes | TRD 요구사항 (레이아웃 보조) |
| `src/` directory | No | TRD 프로젝트 구조 참조 |
| App Router | Yes | TRD 요구사항 |
| Import alias | @/* | TRD 가이드라인 준수 |

### 3.2 TypeScript 설정

`tsconfig.json` 주요 설정:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3.3 next.config.ts 설정

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 실험적 기능
  experimental: {
    // Turbopack 사용 (Next.js 16 기본)
  },
  // 이미지 최적화 설정
  images: {
    domains: [],
  },
}

export default nextConfig
```

---

## 4. 수용 기준

### 4.1 필수 확인 항목

| 항목 | 검증 방법 | 예상 결과 |
|------|----------|----------|
| 개발 서버 실행 | `pnpm dev` | localhost:3000 접속 가능 |
| TypeScript 컴파일 | `pnpm build` | 에러 없이 빌드 완료 |
| App Router 페이지 | 브라우저 접속 | 기본 페이지 렌더링 |

### 4.2 통합 점검

| 점검 항목 | 확인 내용 |
|----------|----------|
| package.json | 올바른 의존성 버전 (Next.js 16.x, React 19.x, TypeScript 5.x) |
| tsconfig.json | 경로 별칭 설정 (@/) |
| next.config.ts | 기본 설정 확인 |

---

## 5. 의존성

### 5.1 선행 의존성

없음 (첫 번째 Task)

### 5.2 후행 의존성

| Task ID | 제목 | 관계 |
|---------|------|------|
| TSK-00-02 | UI 라이브러리 및 테마 설정 | TSK-00-01 완료 후 진행 |
| TSK-04-01 | Prisma 및 SQLite 설정 | TSK-00-01 완료 후 진행 |

---

## 6. 제약 사항

| 제약 | 설명 | 대응 방안 |
|------|------|----------|
| Node.js 버전 | 22.x LTS 필요 | nvm 또는 asdf로 버전 관리 |
| pnpm 사용 | npm/yarn 대신 pnpm 사용 | corepack enable로 pnpm 활성화 |

---

## 7. 체크리스트

### 7.1 구현 전 확인

- [ ] Node.js 22.x LTS 설치 확인
- [ ] pnpm 설치 확인 (corepack enable)
- [ ] 프로젝트 루트 디렉토리 확인

### 7.2 구현 완료 확인

- [ ] `pnpm create next-app` 실행 완료
- [ ] `pnpm dev` 로 개발 서버 실행 가능
- [ ] `pnpm build` 로 빌드 성공
- [ ] localhost:3000 접속 시 기본 페이지 표시
- [ ] tsconfig.json 경로 별칭 (@/) 설정 확인
- [ ] next.config.ts 기본 설정 확인

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |
