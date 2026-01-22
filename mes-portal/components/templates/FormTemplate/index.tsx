/**
 * @file index.tsx
 * @description FormTemplate 컴포넌트 - 입력/수정 폼 템플릿
 * @task TSK-06-03
 *
 * @requirements
 * - FR-001: 폼 레이아웃 (수직/수평/인라인)
 * - FR-002: 유효성 검사
 * - FR-003: 저장/취소 버튼
 * - FR-004: 수정된 필드 표시 (변경 감지)
 * - FR-005: 폼 초기화/리셋
 *
 * @businessRules
 * - BR-01: 저장 전 유효성 검사 필수
 * - BR-02: 변경 시 이탈 확인
 * - BR-03: 필수 필드 표시
 * - BR-04: 저장 중 중복 클릭 방지
 * - BR-05: 첫 에러 필드로 포커스
 * - BR-06: 수정된 필드 시각적 표시 (수정 모드)
 *
 * @example
 * ```tsx
 * <FormTemplate
 *   title="사용자"
 *   mode="create"
 *   onSubmit={handleSubmit}
 *   onCancel={() => router.back()}
 *   enableDirtyCheck
 * >
 *   <Form.Item name="name" label="이름" rules={[{ required: true }]}>
 *     <Input />
 *   </Form.Item>
 * </FormTemplate>
 * ```
 */

'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { Form, Card, Button, Space, Alert } from 'antd'
import type { FormInstance } from 'antd'
import { confirmDiscard } from '@/lib/utils/confirm'
import type { FormTemplateProps, UseFormDirtyReturn } from './types'
import { MODE_SUFFIX } from './types'

// 타입 re-export
export * from './types'

/**
 * useFormDirty 훅 - 폼 변경 감지
 */
function useFormDirty<T extends Record<string, unknown>>(
  form: FormInstance<T>,
  initialValues?: Partial<T>,
  enabled: boolean = false
): UseFormDirtyReturn<T> {
  const [isDirty, setIsDirty] = useState(false)
  const [dirtyFields, setDirtyFields] = useState<Set<keyof T>>(new Set())
  const initialValuesRef = useRef<Partial<T>>(initialValues || {})

  // 초기값 업데이트
  useEffect(() => {
    initialValuesRef.current = initialValues || {}
  }, [initialValues])

  const handleValuesChange = useCallback(
    (changedValues: Partial<T>, allValues: T) => {
      if (!enabled) return

      const newDirtyFields = new Set<keyof T>()
      let hasChanges = false

      // 변경된 필드 추적
      for (const key of Object.keys(allValues) as Array<keyof T>) {
        const initialValue = initialValuesRef.current[key]
        const currentValue = allValues[key]

        // 값 비교 (간단한 비교, 객체는 JSON 비교)
        const isEqual =
          initialValue === currentValue ||
          JSON.stringify(initialValue) === JSON.stringify(currentValue)

        if (!isEqual) {
          newDirtyFields.add(key)
          hasChanges = true
        }
      }

      setDirtyFields(newDirtyFields)
      setIsDirty(hasChanges)
    },
    [enabled]
  )

  const getDirtyValue = useCallback(
    <K extends keyof T>(field: K) => {
      if (!dirtyFields.has(field)) return null

      const allValues = form.getFieldsValue() as T
      return {
        original: initialValuesRef.current[field] as T[K] | undefined,
        current: allValues[field],
      }
    },
    [form, dirtyFields]
  )

  const resetDirty = useCallback(() => {
    setIsDirty(false)
    setDirtyFields(new Set())
  }, [])

  return {
    isDirty,
    dirtyFields,
    getDirtyValue,
    resetDirty,
    handleValuesChange,
  }
}

/**
 * FormTemplate 컴포넌트
 *
 * 입력/수정 폼 화면의 표준 템플릿을 제공합니다.
 * - Ant Design Form 기반
 * - 다양한 레이아웃 지원 (수직/수평/인라인)
 * - 유효성 검사 통합
 * - 변경 감지 및 이탈 경고
 * - 저장/취소/초기화 버튼
 */
export function FormTemplate<T extends Record<string, unknown> = Record<string, unknown>>({
  // 폼 설정
  form: externalForm,
  initialValues,
  layout = 'vertical',
  labelCol,
  wrapperCol,

  // 폼 필드
  children,

  // 액션
  onSubmit,
  onCancel,
  onReset,

  // 상태
  loading = false,
  submitText = '저장',
  cancelText = '취소',
  showSubmit = true,
  showCancel = true,
  showReset = false,

  // 변경 감지
  enableDirtyCheck = false,
  enableLeaveConfirm = true,
  showDirtyIndicator = false,

  // 헤더
  title,
  mode = 'create',
  extra,

  // 기타
  showFormError = false,
  scrollToError = true,
  className,
  style,
  name,
}: FormTemplateProps<T>) {
  // 내부 폼 인스턴스 (외부에서 제공하지 않을 경우)
  const [internalForm] = Form.useForm<T>()
  const form = externalForm || internalForm

  // 변경 감지
  const {
    isDirty,
    dirtyFields,
    resetDirty,
    handleValuesChange,
  } = useFormDirty(form, initialValues, enableDirtyCheck)

  // 폼 에러 상태
  const [formError, setFormError] = useState<string | null>(null)

  // 제목 생성
  const displayTitle = title
    ? mode !== 'create'
      ? `${title} ${MODE_SUFFIX[mode]}`
      : `${title} ${MODE_SUFFIX.create}`
    : undefined

  /**
   * 폼 제출 핸들러 (BR-01, BR-04)
   */
  const handleSubmit = useCallback(
    async (values: T) => {
      setFormError(null)
      try {
        await onSubmit(values)
        resetDirty()
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '저장에 실패했습니다'
        setFormError(message)
        throw error
      }
    },
    [onSubmit, resetDirty]
  )

  /**
   * 폼 제출 실패 핸들러 (BR-05)
   */
  const handleSubmitFailed = useCallback(
    (errorInfo: { errorFields: { name: (string | number)[] }[] }) => {
      if (scrollToError && errorInfo.errorFields.length > 0) {
        const firstErrorField = errorInfo.errorFields[0].name
        form.scrollToField(firstErrorField, {
          behavior: 'smooth',
          block: 'center',
        })
      }
    },
    [form, scrollToError]
  )

  /**
   * 취소 핸들러 (BR-02)
   */
  const handleCancel = useCallback(async () => {
    if (!onCancel) return

    if (enableDirtyCheck && isDirty) {
      const canLeave = await confirmDiscard({ isDirty: true })
      if (canLeave) {
        onCancel()
      }
    } else {
      onCancel()
    }
  }, [onCancel, enableDirtyCheck, isDirty])

  /**
   * 초기화 핸들러
   */
  const handleReset = useCallback(() => {
    form.resetFields()
    resetDirty()
    setFormError(null)
    onReset?.()
  }, [form, resetDirty, onReset])

  /**
   * 페이지 이탈 경고 (BR-02)
   */
  useEffect(() => {
    if (!enableDirtyCheck || !enableLeaveConfirm || !isDirty) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enableDirtyCheck, enableLeaveConfirm, isDirty])

  /**
   * 폼 값 변경 핸들러
   */
  const handleFormValuesChange = useCallback(
    (changedValues: Partial<T>, allValues: T) => {
      handleValuesChange(changedValues, allValues)
    },
    [handleValuesChange]
  )

  return (
    <div
      data-testid="form-template"
      data-dirty={isDirty ? 'true' : 'false'}
      className={className}
      style={style}
    >
      <Card
        title={
          displayTitle ? (
            <span data-testid="form-template-title">{displayTitle}</span>
          ) : undefined
        }
        extra={extra}
      >
        {/* 전체 에러 메시지 */}
        {showFormError && formError && (
          <Alert
            data-testid="form-error-alert"
            message={formError}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setFormError(null)}
          />
        )}

        <Form<T>
          form={form}
          name={name}
          layout={layout}
          labelCol={labelCol}
          wrapperCol={wrapperCol}
          initialValues={initialValues as T}
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFailed}
          onValuesChange={handleFormValuesChange}
          disabled={loading}
          scrollToFirstError={scrollToError}
        >
          {/* 폼 필드 */}
          {children}

          {/* 버튼 영역 */}
          <Form.Item
            wrapperCol={
              layout === 'horizontal'
                ? { offset: labelCol?.span || 0, span: wrapperCol?.span || 24 }
                : undefined
            }
            style={{ marginBottom: 0, marginTop: 24 }}
          >
            <Space>
              {showReset && (
                <Button
                  data-testid="form-reset-btn"
                  onClick={handleReset}
                  disabled={loading}
                >
                  초기화
                </Button>
              )}
              {showCancel && (
                <Button
                  data-testid="form-cancel-btn"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {cancelText}
                </Button>
              )}
              {showSubmit && (
                <Button
                  data-testid="form-submit-btn"
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={loading}
                >
                  {submitText}
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default FormTemplate
