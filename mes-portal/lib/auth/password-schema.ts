import { z } from 'zod'
import { DEFAULT_PASSWORD_POLICY } from './password'

/**
 * 비밀번호 복잡도 zod 스키마
 * SecuritySetting에서 동적으로 정책을 가져와 검증할 수 있도록
 * 기본 정책 기반으로 구현
 */
export const passwordSchema = z
  .string()
  .min(
    DEFAULT_PASSWORD_POLICY.minLength,
    `비밀번호는 최소 ${DEFAULT_PASSWORD_POLICY.minLength}자 이상이어야 합니다`
  )
  .refine(
    (password) => !DEFAULT_PASSWORD_POLICY.requireUppercase || /[A-Z]/.test(password),
    '대문자를 1개 이상 포함해야 합니다'
  )
  .refine(
    (password) => !DEFAULT_PASSWORD_POLICY.requireLowercase || /[a-z]/.test(password),
    '소문자를 1개 이상 포함해야 합니다'
  )
  .refine(
    (password) => !DEFAULT_PASSWORD_POLICY.requireNumber || /[0-9]/.test(password),
    '숫자를 1개 이상 포함해야 합니다'
  )
  .refine(
    (password) => !DEFAULT_PASSWORD_POLICY.requireSpecial || /[!@#$%^&*(),.?":{}|<>]/.test(password),
    '특수문자를 1개 이상 포함해야 합니다'
  )

/**
 * 동적 정책 기반 비밀번호 스키마 생성
 */
export function createPasswordSchema(policy: {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumber: boolean
  requireSpecial: boolean
}) {
  let schema = z.string().min(policy.minLength, `비밀번호는 최소 ${policy.minLength}자 이상이어야 합니다`)

  if (policy.requireUppercase) {
    schema = schema.refine((password) => /[A-Z]/.test(password), '대문자를 1개 이상 포함해야 합니다')
  }

  if (policy.requireLowercase) {
    schema = schema.refine((password) => /[a-z]/.test(password), '소문자를 1개 이상 포함해야 합니다')
  }

  if (policy.requireNumber) {
    schema = schema.refine((password) => /[0-9]/.test(password), '숫자를 1개 이상 포함해야 합니다')
  }

  if (policy.requireSpecial) {
    schema = schema.refine(
      (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
      '특수문자를 1개 이상 포함해야 합니다'
    )
  }

  return schema
}

/**
 * 비밀번호 검증 요청 스키마
 */
export const validatePasswordRequestSchema = z.object({
  password: z.string().min(1, '비밀번호는 필수입니다'),
})

export type ValidatePasswordRequest = z.infer<typeof validatePasswordRequestSchema>
