import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

// 비밀번호 정책 기본값
export const DEFAULT_PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  expiryDays: 90,
  historyCount: 5,
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumber: boolean
  requireSpecial: boolean
}

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * 평문 비밀번호를 bcrypt로 해시
 * @param plainPassword 평문 비밀번호
 * @returns 해시된 비밀번호
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS)
}

/**
 * 비밀번호 검증
 * @param plainPassword 평문 비밀번호
 * @param hashedPassword 해시된 비밀번호
 * @returns 일치 여부
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * 비밀번호 정책 검증
 * @param password 비밀번호
 * @param policy 비밀번호 정책 (기본값 사용 시 생략)
 * @returns 검증 결과
 */
export function validatePasswordPolicy(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < policy.minLength) {
    errors.push(`비밀번호는 최소 ${policy.minLength}자 이상이어야 합니다.`)
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('대문자를 포함해야 합니다.')
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('소문자를 포함해야 합니다.')
  }

  if (policy.requireNumber && !/[0-9]/.test(password)) {
    errors.push('숫자를 포함해야 합니다.')
  }

  if (policy.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('특수문자를 포함해야 합니다.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 비밀번호 이력과 비교하여 재사용 여부 확인
 * @param newPassword 새 비밀번호
 * @param passwordHistory 비밀번호 해시 이력 배열
 * @returns 재사용 여부 (true: 재사용됨, false: 사용 가능)
 */
export async function isPasswordReused(
  newPassword: string,
  passwordHistory: string[]
): Promise<boolean> {
  for (const hash of passwordHistory) {
    if (await bcrypt.compare(newPassword, hash)) {
      return true
    }
  }
  return false
}

/**
 * 비밀번호 만료 여부 확인
 * @param passwordChangedAt 비밀번호 변경 일시
 * @param expiryDays 만료 기간 (일)
 * @returns 만료 여부
 */
export function isPasswordExpired(
  passwordChangedAt: Date,
  expiryDays: number = DEFAULT_PASSWORD_POLICY.expiryDays
): boolean {
  const expiryDate = new Date(passwordChangedAt)
  expiryDate.setDate(expiryDate.getDate() + expiryDays)
  return new Date() > expiryDate
}

/**
 * 비밀번호 만료까지 남은 일수 계산
 * @param passwordChangedAt 비밀번호 변경 일시
 * @param expiryDays 만료 기간 (일)
 * @returns 남은 일수 (음수면 이미 만료)
 */
export function getDaysUntilPasswordExpiry(
  passwordChangedAt: Date,
  expiryDays: number = DEFAULT_PASSWORD_POLICY.expiryDays
): number {
  const expiryDate = new Date(passwordChangedAt)
  expiryDate.setDate(expiryDate.getDate() + expiryDays)
  const now = new Date()
  const diffTime = expiryDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
