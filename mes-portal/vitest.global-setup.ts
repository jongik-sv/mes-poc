/**
 * Vitest 전역 설정 파일
 * 테스트 완료 후 프로세스 강제 종료를 보장합니다.
 */

export async function teardown() {
  // 모든 열린 핸들을 정리하고 프로세스 종료
  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.$disconnect()
  } catch {
    // prisma가 로드되지 않은 경우 무시
  }

  // 타이머 정리
  setTimeout(() => {
    process.exit(0)
  }, 1000)
}
