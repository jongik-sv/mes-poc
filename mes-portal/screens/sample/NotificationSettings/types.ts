// types.ts
// TSK-06-19: 알림 설정 관리 타입 정의

/**
 * 알림 카테고리 타입
 */
export interface NotificationCategory {
  /** 카테고리 고유 ID */
  id: string
  /** 카테고리 이름 */
  name: string
  /** 카테고리 설명 */
  description: string
  /** 활성화 여부 */
  enabled: boolean
}

/**
 * 알림 수신자 타입
 */
export interface NotificationRecipient {
  /** 수신자 고유 ID */
  id: string
  /** 수신자 이름 */
  name: string
  /** 수신자 이메일 */
  email: string
  /** 신규 추가 여부 (UI용) */
  isNew?: boolean
}

/**
 * 알림 설정 전체 타입
 */
export interface NotificationSettingsData {
  /** 알림 카테고리 목록 */
  categories: NotificationCategory[]
  /** 알림 수신자 목록 */
  recipients: NotificationRecipient[]
}

/**
 * 기본 알림 설정값
 */
export const DEFAULT_SETTINGS: NotificationSettingsData = {
  categories: [
    {
      id: 'production',
      name: '생산 알림',
      description: '생산 시작/완료, 목표 달성, 지연 경고',
      enabled: true,
    },
    {
      id: 'quality',
      name: '품질 알림',
      description: '품질 이상, 검사 완료, 불량률 초과',
      enabled: true,
    },
    {
      id: 'equipment',
      name: '설비 알림',
      description: '설비 이상, 유지보수 예정, 가동률 저하',
      enabled: true,
    },
    {
      id: 'system',
      name: '시스템 알림',
      description: '시스템 공지, 업데이트, 권한 변경',
      enabled: true,
    },
  ],
  recipients: [],
}
