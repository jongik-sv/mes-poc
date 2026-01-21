# 구현 보고서 (030-implementation.md)

**Template Version:** 1.0.0 - **Last Updated:** 2026-01-21

> **목적**: TSK-04-03 Auth.js 인증 설정 구현 결과 문서화
>
> **참조**: 이 문서는 `010-design.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-04-03 |
| Task명 | Auth.js 인증 설정 |
| 구현일 | 2026-01-21 |
| 구현자 | Claude |
| 상태 | ✅ 완료 |

---

## 1. 구현 요약

### 1.1 개요

Auth.js (NextAuth v5 beta) 기반의 인증 시스템을 구현했습니다. Credentials Provider를 사용하여 이메일/비밀번호 인증을 지원하며, JWT 세션 전략으로 30일간 세션을 유지합니다.

### 1.2 주요 구현 사항

| 구분 | 내용 | 상태 |
|------|------|------|
| 인증 Provider | Credentials (이메일/비밀번호) | ✅ |
| 세션 전략 | JWT (30일 만료) | ✅ |
| 역할 관리 | 세션에 역할 정보 포함 | ✅ |
| 라우트 보호 | middleware로 /portal/* 보호 | ✅ |
| API | /api/auth/me 현재 사용자 정보 | ✅ |
| 타입 확장 | next-auth 모듈 타입 확장 | ✅ |

---

## 2. 파일 구조

### 2.1 신규 파일

```
mes-portal/
├── auth.config.ts           # Auth.js 설정 (Edge Runtime 호환)
├── auth.ts                   # Auth.js export
├── middleware.ts             # 인증 미들웨어
├── app/
│   └── api/
│       └── auth/
│           ├── [...nextauth]/
│           │   └── route.ts  # Auth.js API 핸들러
│           └── me/
│               ├── route.ts  # 현재 사용자 정보 API
│               └── __tests__/
│                   └── route.spec.ts
├── lib/
│   └── auth/
│       ├── auth.config.ts    # 테스트용 분리 함수
│       ├── index.ts          # 모듈 export
│       └── __tests__/
│           └── auth.spec.ts
└── types/
    └── next-auth.d.ts        # 타입 확장
```

### 2.2 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `.env` | AUTH_SECRET, AUTH_URL 환경변수 추가 |
| `.env.example` | AUTH_SECRET, AUTH_URL 예시 추가 |
| `package.json` | `next-auth@beta` 의존성 추가 |
| `components/common/GlobalSearch.tsx` | Ant Design 타입 호환성 수정 |

---

## 3. 핵심 구현 상세

### 3.1 Auth.js 설정 (auth.config.ts)

```typescript
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Dynamic import로 Edge Runtime 호환
        const bcrypt = await import('bcrypt')
        const { prisma } = await import('./lib/prisma')

        const email = credentials?.email as string
        const password = credentials?.password as string

        if (!email || !password) return null

        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true },
        })

        if (!user || !user.isActive) return null

        const isValidPassword = await bcrypt.default.compare(password, user.password)
        if (!isValidPassword) return null

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: {
            id: user.role.id,
            code: user.role.code,
            name: user.role.name,
          },
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnPortal = nextUrl.pathname.startsWith('/portal')
      const isOnLogin = nextUrl.pathname === '/login'
      const isOnAuthApi = nextUrl.pathname.startsWith('/api/auth')

      if (isOnAuthApi) return true
      if (isOnPortal) {
        if (isLoggedIn) return true
        return false // Redirect to /login
      }
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL('/portal', nextUrl))
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role
      }
      return session
    },
  },
}
```

### 3.2 미들웨어 (middleware.ts)

```typescript
import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    '/portal/:path*',
    '/login',
    '/api/:path*',
  ],
}
```

### 3.3 API 엔드포인트 (/api/auth/me)

```typescript
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    },
  })
}
```

### 3.4 타입 확장 (types/next-auth.d.ts)

```typescript
import 'next-auth'
import 'next-auth/jwt'

interface UserRole {
  id: number
  code: string
  name: string
}

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: UserRole
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}
```

---

## 4. 기술적 결정 사항

### 4.1 Edge Runtime 호환성

**문제**: Prisma 클라이언트가 Node.js 모듈(`node:path`, `node:url`, `node:buffer`)을 사용하여 Edge Runtime에서 호환 문제 발생

**해결**:
- `authorize` 함수 내에서 `bcrypt`와 `prisma`를 dynamic import
- middleware는 `authorized` 콜백만 사용하여 Edge Runtime에서 실행
- `authorize` 함수는 credentials 제출 시에만 Node.js 런타임에서 실행

### 4.2 Auth.js v5 사용

**이유**:
- Next.js App Router 완벽 지원
- Edge Runtime 최적화
- 더 나은 TypeScript 지원
- 단순화된 API

**주의사항**:
- beta 버전이므로 API 변경 가능성
- 프로덕션 배포 전 stable 버전 확인 필요

### 4.3 세션에 역할 정보 포함

**이유**:
- 클라이언트에서 역할 기반 UI 렌더링
- API 권한 체크 시 DB 조회 없이 확인 가능
- 성능 최적화

**구현**:
- `jwt` 콜백에서 토큰에 역할 정보 추가
- `session` 콜백에서 세션에 역할 정보 복사

---

## 5. 환경 설정

### 5.1 환경 변수

```env
# .env
AUTH_SECRET="mes-portal-development-secret-key-at-least-32-chars"
AUTH_URL="http://localhost:3000"
```

### 5.2 프로덕션 설정 권장

```env
# 프로덕션 환경
AUTH_SECRET="$(openssl rand -base64 32)"  # 랜덤 생성
AUTH_URL="https://your-domain.com"
AUTH_TRUST_HOST="true"  # 리버스 프록시 사용 시
```

---

## 6. 사용 방법

### 6.1 로그인 (클라이언트)

```typescript
import { signIn } from 'next-auth/react'

// 로그인
await signIn('credentials', {
  email: 'admin@test.com',
  password: 'test1234',
  redirectTo: '/portal',
})
```

### 6.2 로그아웃 (클라이언트)

```typescript
import { signOut } from 'next-auth/react'

// 로그아웃
await signOut({ redirectTo: '/login' })
```

### 6.3 세션 확인 (서버)

```typescript
import { auth } from '@/auth'

export default async function ProtectedPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return <div>Welcome, {session.user.name}</div>
}
```

### 6.4 세션 확인 (클라이언트)

```typescript
'use client'
import { useSession } from 'next-auth/react'

export function UserInfo() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <Spinner />
  if (status === 'unauthenticated') return <LoginButton />

  return <div>Hello, {session?.user?.name}</div>
}
```

---

## 7. 테스트 결과

### 7.1 단위 테스트

| 파일 | 테스트 수 | 결과 |
|------|----------|------|
| lib/auth/__tests__/auth.spec.ts | 10 | ✅ 통과 |
| app/api/auth/me/__tests__/route.spec.ts | 3 | ✅ 통과 |
| **합계** | **13** | **100%** |

### 7.2 빌드 검증

```
✓ Compiled successfully in 4.3s
✓ TypeScript 컴파일 성공
✓ Next.js 16.1.4 (Turbopack) 빌드 성공
```

---

## 8. 알려진 이슈

### 8.1 Edge Runtime 경고

**증상**: 빌드 시 Prisma Node.js 모듈 관련 경고 표시

**영향**: 없음 (경고만 표시, 실제 동작에 영향 없음)

**원인**: Turbopack이 정적 분석 시 dynamic import 내부까지 검사

**향후 조치**: Prisma Edge 클라이언트 또는 향후 Next.js 버전에서 해결 예정

### 8.2 middleware 파일 deprecated 경고

**증상**: "middleware" file convention is deprecated 경고

**영향**: 없음 (현재 기능 정상 동작)

**원인**: Next.js 16+에서 proxy 파일 컨벤션 권장

**향후 조치**: Next.js 17+ 마이그레이션 시 검토

---

## 9. 관련 문서

- 상세 설계: [`010-design.md`](./010-design.md)
- 테스트 명세: [`026-test-specification.md`](./026-test-specification.md)
- 테스트 결과: [`070-tdd-test-results.md`](./070-tdd-test-results.md)
- 추적성 매트릭스: [`025-traceability-matrix.md`](./025-traceability-matrix.md)

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | Claude | 최초 작성 |
