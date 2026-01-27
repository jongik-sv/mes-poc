/**
 * TSK-04-01: 감사 로그 생성 및 관리
 *
 * PRD 4.3.1, 4.3.2 요구사항 구현
 * - 인증 이벤트 로깅
 * - 권한 변경 이벤트 로깅
 */

import { prisma } from '@/lib/prisma'

/**
 * 감사 로그 액션 타입
 */
export type AuditAction =
  | 'LOGIN' // 로그인 성공
  | 'LOGOUT' // 로그아웃
  | 'LOGIN_FAILED' // 로그인 실패
  | 'PASSWORD_CHANGE' // 비밀번호 변경
  | 'PASSWORD_RESET' // 비밀번호 재설정
  | 'PASSWORD_RESET_REQUEST' // 비밀번호 재설정 요청
  | 'ACCOUNT_LOCKED' // 계정 잠금
  | 'ACCOUNT_UNLOCKED' // 계정 잠금 해제
  | 'USER_CREATED' // 사용자 생성
  | 'USER_UPDATED' // 사용자 수정
  | 'USER_DELETED' // 사용자 삭제
  | 'ROLE_CREATED' // 역할 생성
  | 'ROLE_UPDATED' // 역할 수정
  | 'ROLE_DELETED' // 역할 삭제
  | 'PERMISSION_ASSIGNED' // 권한 할당
  | 'PERMISSION_REVOKED' // 권한 회수
  | 'UNAUTHORIZED_ACCESS' // 권한 없는 접근 시도
  | 'TOKEN_REFRESH' // 토큰 갱신

/**
 * 감사 로그 상태
 */
export type AuditStatus = 'SUCCESS' | 'FAILURE'

/**
 * 감사 로그 생성 파라미터
 */
export interface CreateAuditLogParams {
  userId?: string | null
  action: AuditAction
  resource?: string
  resourceId?: string
  details?: Record<string, unknown>
  ip?: string
  userAgent?: string
  status: AuditStatus
  errorMessage?: string
}

/**
 * 감사 로그 생성
 *
 * 주의: 감사 로그 생성 실패로 인해 본 로직이 중단되지 않도록
 * 에러 발생 시 콘솔 로깅만 수행하고 throw하지 않음
 *
 * @param params 감사 로그 파라미터
 */
export async function createAuditLog(
  params: CreateAuditLogParams
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        resource: params.resource ?? null,
        resourceId: params.resourceId ?? null,
        details: params.details ? JSON.stringify(params.details) : null,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null,
        status: params.status,
        errorMessage: params.errorMessage ?? null,
      },
    })
  } catch (error) {
    // 감사 로그 생성 실패로 인해 본 로직이 중단되지 않도록 에러 로깅만 수행
    console.error('[AuditLog] Failed to create audit log:', error)
  }
}

/**
 * 요청에서 클라이언트 정보 추출
 */
export function extractClientInfo(request: Request): {
  ip: string | null
  userAgent: string | null
} {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0]?.trim() || null

  const userAgent = request.headers.get('user-agent') || null

  return { ip, userAgent }
}

/**
 * 인증 성공 로그 생성 헬퍼
 */
export async function logAuthSuccess(
  userId: string,
  request: Request
): Promise<void> {
  const { ip, userAgent } = extractClientInfo(request)
  await createAuditLog({
    userId,
    action: 'LOGIN',
    resource: 'session',
    status: 'SUCCESS',
    ip: ip ?? undefined,
    userAgent: userAgent ?? undefined,
  })
}

/**
 * 인증 실패 로그 생성 헬퍼
 */
export async function logAuthFailure(
  email: string,
  reason: string,
  request: Request,
  userId?: string | null
): Promise<void> {
  const { ip, userAgent } = extractClientInfo(request)
  await createAuditLog({
    userId: userId ?? null,
    action: 'LOGIN_FAILED',
    resource: 'session',
    details: { email, reason },
    status: 'FAILURE',
    errorMessage: reason,
    ip: ip ?? undefined,
    userAgent: userAgent ?? undefined,
  })
}

/**
 * 로그아웃 로그 생성 헬퍼
 */
export async function logLogout(
  userId: string,
  request: Request
): Promise<void> {
  const { ip, userAgent } = extractClientInfo(request)
  await createAuditLog({
    userId,
    action: 'LOGOUT',
    resource: 'session',
    status: 'SUCCESS',
    ip: ip ?? undefined,
    userAgent: userAgent ?? undefined,
  })
}

/**
 * 비밀번호 변경 로그 생성 헬퍼
 */
export async function logPasswordChange(
  userId: string,
  request: Request,
  success: boolean = true
): Promise<void> {
  const { ip, userAgent } = extractClientInfo(request)
  await createAuditLog({
    userId,
    action: 'PASSWORD_CHANGE',
    resource: 'user',
    resourceId: String(userId),
    status: success ? 'SUCCESS' : 'FAILURE',
    ip: ip ?? undefined,
    userAgent: userAgent ?? undefined,
  })
}

/**
 * 계정 잠금 로그 생성 헬퍼
 */
export async function logAccountLocked(
  userId: string,
  reason: string,
  request?: Request
): Promise<void> {
  const clientInfo = request ? extractClientInfo(request) : { ip: null, userAgent: null }
  await createAuditLog({
    userId,
    action: 'ACCOUNT_LOCKED',
    resource: 'user',
    resourceId: String(userId),
    details: { reason },
    status: 'SUCCESS',
    ip: clientInfo.ip ?? undefined,
    userAgent: clientInfo.userAgent ?? undefined,
  })
}
