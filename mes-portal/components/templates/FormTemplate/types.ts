/**
 * @file types.ts
 * @description FormTemplate 컴포넌트 타입 정의
 * @task TSK-06-03
 *
 * @requirements
 * - FR-001: 폼 레이아웃 (수직/수평/인라인)
 * - FR-002: 유효성 검사
 * - FR-003: 저장/취소 버튼
 * - FR-004: 수정된 필드 표시 (변경 감지)
 * - FR-005: 폼 초기화/리셋
 */

import type { FormInstance, FormProps } from 'antd'
import type { ReactNode, CSSProperties } from 'react'

/**
 * 폼 모드
 * - create: 신규 등록
 * - edit: 수정
 */
export type FormMode = 'create' | 'edit'

/**
 * FormTemplate Props
 *
 * @template T - 폼 데이터 타입
 */
export interface FormTemplateProps<T extends Record<string, unknown> = Record<string, unknown>> {
  // ===== 폼 설정 =====
  /**
   * Ant Design Form 인스턴스
   * - 외부에서 제어 시 전달
   * - 미제공 시 내부에서 생성
   */
  form?: FormInstance<T>

  /**
   * 폼 초기값
   * - 수정 모드에서 기존 데이터 표시
   */
  initialValues?: Partial<T>

  /**
   * 폼 레이아웃
   * @default 'vertical'
   */
  layout?: 'horizontal' | 'vertical' | 'inline'

  /**
   * 레이블 Col 설정 (horizontal 레이아웃 시)
   */
  labelCol?: FormProps['labelCol']

  /**
   * 래퍼 Col 설정 (horizontal 레이아웃 시)
   */
  wrapperCol?: FormProps['wrapperCol']

  // ===== 폼 필드 =====
  /**
   * 폼 필드 (Form.Item 포함)
   * - children으로 Form.Item들을 전달
   */
  children: ReactNode

  // ===== 액션 =====
  /**
   * 폼 제출 핸들러
   * - 유효성 검사 통과 후 호출
   * - Promise 반환 시 로딩 상태 자동 관리
   */
  onSubmit: (values: T) => Promise<void> | void

  /**
   * 취소 핸들러
   * - 취소 버튼 클릭 시 호출
   * - enableDirtyCheck=true && 변경 있을 시 확인 다이얼로그 후 호출
   */
  onCancel?: () => void

  /**
   * 초기화 핸들러
   * - 초기화 버튼 클릭 시 호출
   * - 폼을 initialValues로 리셋
   */
  onReset?: () => void

  // ===== 상태 =====
  /**
   * 저장 로딩 상태
   * - true 시 저장 버튼 비활성화 및 스피너 표시
   */
  loading?: boolean

  /**
   * 저장 버튼 텍스트
   * @default '저장'
   */
  submitText?: string

  /**
   * 취소 버튼 텍스트
   * @default '취소'
   */
  cancelText?: string

  /**
   * 저장 버튼 표시 여부
   * @default true
   */
  showSubmit?: boolean

  /**
   * 취소 버튼 표시 여부
   * @default true
   */
  showCancel?: boolean

  /**
   * 초기화 버튼 표시 여부
   * @default false
   */
  showReset?: boolean

  // ===== 변경 감지 =====
  /**
   * 변경 감지 활성화
   * - true 시 폼 값 변경 추적
   * - 취소/이탈 시 확인 다이얼로그 표시
   * @default false
   */
  enableDirtyCheck?: boolean

  /**
   * 변경 시 이탈 경고 활성화
   * - enableDirtyCheck=true 시만 동작
   * - beforeunload 이벤트 바인딩
   * @default true
   */
  enableLeaveConfirm?: boolean

  /**
   * 변경된 필드 표시 활성화
   * - enableDirtyCheck=true 시만 동작
   * - 변경된 필드에 시각적 표시
   * @default false
   */
  showDirtyIndicator?: boolean

  // ===== 헤더 =====
  /**
   * 폼 제목
   * - Card 타이틀로 표시
   */
  title?: string

  /**
   * 모드 (등록/수정)
   * - 제목 접미사에 사용
   * @default 'create'
   */
  mode?: FormMode

  /**
   * 추가 헤더 요소
   * - Card 타이틀 오른쪽에 표시
   */
  extra?: ReactNode

  // ===== 기타 =====
  /**
   * 전체 에러 메시지 표시
   * - 폼 상단에 Alert으로 표시
   * @default false
   */
  showFormError?: boolean

  /**
   * 유효성 검사 실패 시 에러 필드로 스크롤
   * @default true
   */
  scrollToError?: boolean

  /**
   * 폼 컨테이너 스타일
   */
  className?: string

  /**
   * 폼 컨테이너 인라인 스타일
   */
  style?: CSSProperties

  /**
   * 폼 name (Form 컴포넌트에 전달)
   */
  name?: string
}

/**
 * useFormDirty 훅 옵션
 */
export interface UseFormDirtyOptions<T extends Record<string, unknown>> {
  /** Form 인스턴스 */
  form: FormInstance<T>
  /** 초기값 */
  initialValues?: Partial<T>
  /** 객체/배열 깊은 비교 여부 */
  deepCompare?: boolean
}

/**
 * useFormDirty 훅 반환값
 */
export interface UseFormDirtyReturn<T extends Record<string, unknown>> {
  /** 폼 변경 여부 */
  isDirty: boolean
  /** 변경된 필드 Set */
  dirtyFields: Set<keyof T>
  /** 변경된 필드의 원본/현재 값 조회 */
  getDirtyValue: <K extends keyof T>(field: K) => { original: T[K] | undefined; current: T[K] | undefined } | null
  /** dirty 상태 리셋 */
  resetDirty: () => void
  /** 값 변경 핸들러 (Form onValuesChange에 연결) */
  handleValuesChange: (changedValues: Partial<T>, allValues: T) => void
}

/**
 * 모드별 제목 접미사
 */
export const MODE_SUFFIX: Record<FormMode, string> = {
  create: '등록',
  edit: '수정',
}
