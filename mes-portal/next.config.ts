import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma 7.x: 서버 전용 패키지 외부화 (node:buffer 오류 방지)
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-better-sqlite3',
    'better-sqlite3',
  ],
  // Turbopack 설정 (Next.js 16)
  turbopack: {
    resolveAlias: {
      // Node.js 내장 모듈 별칭 (브라우저 호환)
      'node:buffer': 'buffer',
      'node:process': 'process',
      'node:path': 'path-browserify',
      'node:url': 'url',
    },
  },
};

export default nextConfig;
