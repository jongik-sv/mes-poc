#!/usr/bin/env node
/**
 * Vitest 테스트 러너 - 프로그래밍 방식으로 실행하여 확실한 종료 보장
 */

import { startVitest } from 'vitest/node'

const args = process.argv.slice(2)

try {
  const vitest = await startVitest('test', args, {
    run: true,
    watch: false,
  })

  const exitCode = vitest?.state?.getCountOfFailedTests() > 0 ? 1 : 0

  await vitest?.close()
  process.exit(exitCode)
} catch (error) {
  console.error('테스트 실행 오류:', error.message)
  process.exit(1)
}
