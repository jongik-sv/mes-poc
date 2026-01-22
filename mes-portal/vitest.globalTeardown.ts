/**
 * Vitest Global Setup/Teardown
 *
 * React 19 + jsdom 환경에서 테스트 완료 후 프로세스가 종료되지 않는 문제 해결
 * MessageChannel 리소스가 정리되지 않아 발생
 */
export default function setup() {
  // Setup function (runs before tests)
  return async () => {
    // Teardown function (runs after tests)
    // 강제 프로세스 종료
    setTimeout(() => {
      process.exit(0)
    }, 500)
  }
}
