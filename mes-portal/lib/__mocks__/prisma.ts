/**
 * Prisma Mock for Unit Tests
 *
 * Jest가 자동으로 이 파일을 찾아서 '@/lib/prisma'를 mock합니다.
 * jest-mock-extended를 사용하여 PrismaClient의 모든 메서드를 자동으로 mock합니다.
 *
 * @usage
 * 테스트 파일에서 자동으로 mock됨. 별도 import 불필요.
 *
 * // mock 동작 설정이 필요한 경우:
 * import prisma from '@/lib/prisma'
 * (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ... })
 */

import { PrismaClient } from '@/lib/generated/prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

export type MockPrismaClient = DeepMockProxy<PrismaClient>

const prismaMock = mockDeep<PrismaClient>() as unknown as MockPrismaClient

// 각 테스트 전에 mock 상태 초기화
beforeEach(() => {
  mockReset(prismaMock)
})

// named export
export const prisma = prismaMock

// default export
export default prismaMock
