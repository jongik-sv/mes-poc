/**
 * 인증 관련 메시지 상수
 */
export const AUTH_MESSAGES = {
  REQUIRED_EMAIL: '이메일을 입력해주세요',
  REQUIRED_PASSWORD: '비밀번호를 입력해주세요',
  INVALID_EMAIL_FORMAT: '올바른 이메일 형식이 아닙니다',
  MIN_PASSWORD_LENGTH: '비밀번호는 최소 8자 이상이어야 합니다',
  AUTH_FAILED: '이메일 또는 비밀번호가 올바르지 않습니다',
  ACCOUNT_INACTIVE: '비활성화된 계정입니다. 관리자에게 문의하세요',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다. 다시 시도해주세요',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
  RATE_LIMITED: '로그인 시도 횟수를 초과했습니다. {n}분 후에 다시 시도해주세요',
  ACCOUNT_LOCKED:
    '보안을 위해 계정이 일시적으로 잠겼습니다. 30분 후에 다시 시도해주세요',
} as const

export type AuthMessageKey = keyof typeof AUTH_MESSAGES
