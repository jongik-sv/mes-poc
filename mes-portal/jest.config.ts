import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
  // Jest 30+ 에서는 testMatch 명시 권장
  testMatch: [
    '**/__tests__/**/*.(test|spec).[tj]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
  // Prisma WASM 모듈 변환 허용
  transformIgnorePatterns: [
    '/node_modules/(?!(@prisma/client)/)',
  ],
}

export default createJestConfig(config)
