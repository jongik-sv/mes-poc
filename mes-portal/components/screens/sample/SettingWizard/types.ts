/**
 * @file types.ts
 * @description 설정 마법사 샘플 타입 정의
 * @task TSK-06-09
 *
 * @requirements
 * - FR-001: 기본정보 입력 (Step 1)
 * - FR-002: 상세설정 입력 (Step 2)
 * - FR-003: 확인 화면 (Step 3)
 * - FR-004: 완료 화면 (Step 4)
 */

/**
 * 1단계: 기본정보 데이터
 */
export interface BasicInfoData {
  /** 회사명 (필수, 2-50자) */
  companyName: string
  /** 공장명 (필수, 2-50자) */
  factoryName: string
  /** 관리자 이메일 (필수, 이메일 형식, 최대 254자) */
  adminEmail: string
}

/**
 * 2단계: 상세설정 데이터
 */
export interface DetailSettingsData {
  /** 서버 주소 (필수, IP 또는 도메인, 최대 253자) */
  serverAddress: string
  /** 포트 번호 (필수, 1-65535) */
  port: number
  /** 타임아웃 (초) (선택, 1-300, 기본값: 30) */
  timeout: number
  /** 자동 재연결 활성화 */
  autoReconnect: boolean
  /** 디버그 모드 활성화 */
  debugMode: boolean
  /** SSL 사용 */
  useSSL: boolean
}

/**
 * 전체 설정 마법사 데이터
 */
export interface SettingWizardData extends Record<string, unknown> {
  basicInfo: BasicInfoData
  detailSettings: DetailSettingsData
}

/**
 * Mock 설정 데이터 구조
 */
export interface WizardConfigData {
  defaults: {
    basicInfo: BasicInfoData
    detailSettings: DetailSettingsData
  }
  validation: {
    companyName: { minLength: number; maxLength: number }
    factoryName: { minLength: number; maxLength: number }
    adminEmail: { maxLength: number }
    serverAddress: { maxLength: number }
    port: { min: number; max: number }
    timeout: { min: number; max: number }
  }
  messages: {
    success: string
    successDescription: string
  }
}

/**
 * 기본정보 단계 Props
 */
export interface BasicInfoStepProps {
  /** 초기 데이터 */
  initialData?: Partial<BasicInfoData>
  /** 데이터 변경 콜백 */
  onDataChange?: (data: BasicInfoData) => void
}

/**
 * 상세설정 단계 Props
 */
export interface DetailSettingsStepProps {
  /** 초기 데이터 */
  initialData?: Partial<DetailSettingsData>
  /** 데이터 변경 콜백 */
  onDataChange?: (data: DetailSettingsData) => void
}

/**
 * 확인 단계 Props
 */
export interface ConfirmationStepProps {
  /** 전체 데이터 */
  data: SettingWizardData
  /** 단계 수정 클릭 핸들러 */
  onEditStep?: (stepKey: string) => void
}

/**
 * 완료 단계 Props
 */
export interface CompleteStepProps {
  /** 성공 메시지 */
  message?: string
  /** 부가 설명 */
  description?: string
  /** 대시보드 이동 핸들러 */
  onGoDashboard?: () => void
  /** 마법사 재시작 핸들러 */
  onRestart?: () => void
}
