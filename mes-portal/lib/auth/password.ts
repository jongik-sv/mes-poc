import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

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
