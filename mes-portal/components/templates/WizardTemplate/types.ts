/**
 * @file types.ts
 * @description WizardTemplate 컴포넌트 타입 정의
 * @task TSK-06-06
 *
 * @requirements
 * - FR-001: 단계 표시 (Steps 컴포넌트)
 * - FR-002: 이전/다음 네비게이션
 * - FR-003: 단계별 유효성 검사
 * - FR-004: 최종 확인 화면
 * - FR-005: 완료 처리
 * - FR-006: 진행 상황 시각화
 *
 * @businessRules
 * - BR-001: 단계별 순차 진행 필수
 * - BR-002: 다음 이동 전 유효성 검사 필수
 * - BR-003: 이전 단계 이동은 항상 허용
 * - BR-004: 완료된 단계만 Steps 클릭 가능
 * - BR-005: 데이터 있을 때 이탈 확인 필수
 * - BR-006: 완료 버튼은 마지막 단계에서만 표시
 * - BR-007: 완료 처리 중 중복 클릭 방지
 * - BR-008: 단계 간 데이터는 유지
 */

import type { FormInstance } from 'antd'
import type { ReactNode, CSSProperties } from 'react'

/**
 * 마법사 단계 정의
 */
export interface WizardStep {
  /** 단계 키 (고유 식별자) */
  key: string
  /** 단계 제목 */
  title: string
  /** 단계 부제목 (선택) */
  subTitle?: string
  /** 단계 설명 */
  description?: string
  /** 단계 아이콘 */
  icon?: ReactNode
  /** 단계 콘텐츠 렌더링 */
  content: ReactNode | ((context: WizardContextValue) => ReactNode)
  /** 단계별 유효성 검사 함수 (다음 이동 전 실행) */
  validate?: () => Promise<boolean> | boolean
  /** 이 단계 건너뛰기 가능 여부 (기본: false) */
  skippable?: boolean
  /** 단계 비활성화 여부 */
  disabled?: boolean
}

/**
 * 마법사 Context 값 (단계 간 데이터 공유용)
 */
export interface WizardContextValue<T extends Record<string, unknown> = Record<string, unknown>> {
  /** 전체 단계 데이터 */
  data: T
  /** 데이터 업데이트 */
  setData: (data: Partial<T>) => void
  /** 특정 단계 데이터 가져오기 */
  getStepData: (stepKey: string) => unknown
  /** 특정 단계 데이터 설정 */
  setStepData: (stepKey: string, data: unknown) => void
  /** 현재 단계 인덱스 */
  currentStep: number
  /** 전체 단계 수 */
  totalSteps: number
  /** 완료된 단계 Set */
  completedSteps: Set<number>
  /** 다음 단계 이동 */
  goNext: () => Promise<void>
  /** 이전 단계 이동 */
  goPrev: () => void
  /** 특정 단계로 이동 (완료된 단계만 가능) */
  goTo: (step: number) => void
  /** 마법사 취소 */
  cancel: () => void
  /** Form 인스턴스 등록 (ARCH-001 - 결합도 감소) */
  registerStepForm: (stepKey: string, form: FormInstance) => void
  /** Form 인스턴스 해제 */
  unregisterStepForm: (stepKey: string) => void
  /** 마법사 완료 중 여부 */
  isFinishing: boolean
}

/**
 * 마법사 템플릿 Props
 */
export interface WizardTemplateProps<T extends Record<string, unknown> = Record<string, unknown>> {
  // ===== 단계 정의 =====
  /** 마법사 단계 배열 */
  steps: WizardStep[]
  /** 초기 단계 (기본: 0) */
  initialStep?: number
  /** 초기 데이터 */
  initialData?: Partial<T>

  // ===== Steps 컴포넌트 설정 =====
  /** Steps 방향 (기본: 'horizontal') */
  direction?: 'horizontal' | 'vertical'
  /** Steps 크기 */
  size?: 'default' | 'small'
  /** Steps 타입 */
  type?: 'default' | 'navigation' | 'inline'
  /** 진행률 표시 (dot 스타일) */
  progressDot?: boolean
  /** 완료된 단계 클릭 허용 여부 (기본: true) */
  allowStepClick?: boolean

  // ===== 액션 =====
  /** 마법사 완료 핸들러 */
  onFinish: (data: T) => Promise<void>
  /** 마법사 취소 핸들러 */
  onCancel?: () => void
  /** 단계 변경 핸들러 */
  onStepChange?: (current: number, prev: number) => void
  /** 데이터 변경 핸들러 */
  onDataChange?: (data: T) => void

  // ===== 상태 =====
  /** 저장 로딩 상태 */
  loading?: boolean

  // ===== 네비게이션 버튼 =====
  /** 이전 버튼 텍스트 (기본: '이전') */
  prevButtonText?: string
  /** 다음 버튼 텍스트 (기본: '다음') */
  nextButtonText?: string
  /** 완료 버튼 텍스트 (기본: '완료') */
  finishButtonText?: string
  /** 취소 버튼 텍스트 (기본: '취소') */
  cancelButtonText?: string
  /** 취소 버튼 표시 여부 (기본: true) */
  showCancel?: boolean
  /** 이전 버튼 표시 여부 (기본: true) */
  showPrev?: boolean
  /** 추가 버튼 (다음/완료 버튼 앞에 표시) */
  extraButtons?: ReactNode

  // ===== 이탈 경고 =====
  /** 이탈 경고 활성화 (기본: true) */
  enableLeaveConfirm?: boolean
  /** 이탈 경고 메시지 */
  leaveConfirmMessage?: string

  // ===== 헤더 =====
  /** 마법사 제목 */
  title?: string
  /** 추가 헤더 요소 */
  extra?: ReactNode

  // ===== 확인 단계 (마지막 전 단계) =====
  /** 확인 단계 자동 생성 여부 (기본: false) */
  autoConfirmStep?: boolean
  /** 확인 단계 제목 (기본: '확인') */
  confirmStepTitle?: string
  /** 확인 단계 데이터 렌더링 */
  renderConfirmation?: (data: T) => ReactNode

  // ===== 완료 단계 =====
  /** 완료 단계 자동 생성 여부 (기본: false) */
  autoFinishStep?: boolean
  /** 완료 단계 제목 (기본: '완료') */
  finishStepTitle?: string
  /** 완료 메시지 */
  finishMessage?: string
  /** 완료 후 버튼 */
  finishActions?: ReactNode

  // ===== 스타일 =====
  /** 컨테이너 클래스명 */
  className?: string
  /** 컨테이너 스타일 */
  style?: CSSProperties
  /** Steps 영역 클래스명 */
  stepsClassName?: string
  /** 콘텐츠 영역 클래스명 */
  contentClassName?: string
}

/**
 * WizardProvider Props
 */
export interface WizardProviderProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<WizardTemplateProps<T>, 'className' | 'style' | 'stepsClassName' | 'contentClassName'> {
  children: ReactNode
}

/**
 * useWizardStep 훅 반환값
 */
export interface UseWizardStepReturn {
  /** 폼 값 변경 핸들러 */
  handleValuesChange: (changedValues: unknown, allValues: unknown) => void
}
