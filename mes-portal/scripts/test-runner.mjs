#!/usr/bin/env node
/**
 * Vitest 테스트 러너 - 테스트 완료 후 강제 종료
 *
 * Vitest가 테스트 완료 후에도 프로세스를 종료하지 않는 문제를 해결합니다.
 * better-sqlite3 또는 jsdom의 열린 핸들로 인한 문제일 수 있습니다.
 */

import { spawn } from 'child_process'

const args = process.argv.slice(2)
const vitestArgs = ['run', ...args]

// 테스트 결과 수집
let testOutput = ''
let testCompleted = false
let exitCode = 0

const vitest = spawn('npx', ['vitest', ...vitestArgs], {
  stdio: ['inherit', 'pipe', 'pipe'],
  cwd: process.cwd()
})

// 테스트 파일 완료 카운터
let completedFiles = 0
let lastActivityTime = Date.now()

vitest.stdout.on('data', (data) => {
  const text = data.toString()
  process.stdout.write(data)
  testOutput += text
  lastActivityTime = Date.now()

  // 테스트 파일 완료 감지 (각 파일 완료 시 ✓ 표시됨)
  const fileMatches = text.match(/✓.*\(\d+ tests?\)/g)
  if (fileMatches) {
    completedFiles += fileMatches.length
  }

  // 테스트 요약 출력 감지 (Test Files 또는 Duration 줄)
  if (text.includes('Test Files') || text.includes('Duration')) {
    testCompleted = true
    if (testOutput.includes('FAIL') || testOutput.includes('✗')) {
      exitCode = 1
    }
    setTimeout(() => {
      vitest.kill('SIGTERM')
      process.exit(exitCode)
    }, 500)
  }
})

// 5초간 출력이 없으면 완료로 간주 (테스트가 끝났지만 vitest가 종료되지 않는 경우)
const checkActivity = setInterval(() => {
  const idleTime = Date.now() - lastActivityTime
  if (idleTime > 5000 && completedFiles > 0 && !testCompleted) {
    console.log(`\n✅ ${completedFiles}개 테스트 파일 완료 - 프로세스 종료`)
    testCompleted = true
    clearInterval(checkActivity)
    if (testOutput.includes('FAIL') || testOutput.includes('✗')) {
      exitCode = 1
    }
    setTimeout(() => {
      vitest.kill('SIGTERM')
      process.exit(exitCode)
    }, 500)
  }
}, 1000)

vitest.stderr.on('data', (data) => {
  process.stderr.write(data)
})

vitest.on('close', (code) => {
  if (!testCompleted) {
    process.exit(code || 0)
  }
})

// 120초 후 강제 종료 (타임아웃)
setTimeout(() => {
  if (!testCompleted) {
    console.error('\n⚠️  테스트 타임아웃 - 강제 종료')
    vitest.kill('SIGKILL')
    process.exit(124)
  }
}, 120000)
