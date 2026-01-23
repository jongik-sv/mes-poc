/**
 * @file ProcessForm.tsx
 * @description 공정 등록/수정 폼 컴포넌트
 * @task TSK-06-18
 *
 * @requirements
 * - FR-003: 공정 등록
 * - FR-004: 공정 수정
 * - BR-02: 저장 전 유효성 검사 필수
 * - BR-03: 변경 감지 및 이탈 경고
 * - BR-04: 공정코드 중복 불가
 */

'use client'

import React, { useMemo, useCallback } from 'react'
import { Form, Input, Radio, InputNumber, App } from 'antd'
import { FormTemplate } from '@/components/templates/FormTemplate'
import type { ProcessFormValues, FormMode, ProcessData } from './types'

interface ProcessFormProps {
  mode: FormMode
  initialValues?: ProcessData | null
  existingCodes: string[]
  loading?: boolean
  onSubmit: (values: ProcessFormValues) => Promise<void>
  onCancel: () => void
}

const { TextArea } = Input

/**
 * 공정 등록/수정 폼 컴포넌트
 */
export function ProcessForm({
  mode,
  initialValues,
  existingCodes,
  loading = false,
  onSubmit,
  onCancel,
}: ProcessFormProps) {
  const { message } = App.useApp()

  /**
   * 초기값 변환
   */
  const formInitialValues: Partial<ProcessFormValues> = useMemo(() => {
    if (!initialValues) {
      return {
        status: 'active' as const,
      }
    }

    return {
      code: initialValues.code,
      name: initialValues.name,
      status: initialValues.status,
      order: initialValues.order,
      description: initialValues.description,
    }
  }, [initialValues])

  /**
   * 중복 코드 검사 (BR-04)
   */
  const validateCode = useCallback(
    (_: unknown, value: string) => {
      if (!value) return Promise.resolve()

      const lowerValue = value.toLowerCase()
      const excludeCode = mode === 'edit' ? initialValues?.code?.toLowerCase() : undefined

      const isDuplicate = existingCodes.some(
        (code) => code.toLowerCase() === lowerValue && code.toLowerCase() !== excludeCode
      )

      if (isDuplicate) {
        return Promise.reject(new Error('이미 사용 중인 공정코드입니다'))
      }

      return Promise.resolve()
    },
    [existingCodes, mode, initialValues?.code]
  )

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = useCallback(
    async (values: ProcessFormValues) => {
      try {
        await onSubmit(values)
        message.success(mode === 'create' ? '등록되었습니다' : '수정되었습니다')
      } catch (error) {
        // 에러는 useProcessData에서 처리
        throw error
      }
    },
    [onSubmit, mode, message]
  )

  return (
    <div data-testid="process-form" className="p-4">
      <FormTemplate<ProcessFormValues>
        title="공정"
        mode={mode}
        initialValues={formInitialValues}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        loading={loading}
        enableDirtyCheck={true}
        showFormError={true}
        layout="vertical"
      >
        {/* 공정코드 */}
        <Form.Item
          name="code"
          label="공정코드"
          rules={[
            { required: true, message: '공정코드를 입력해주세요' },
            {
              pattern: /^[A-Za-z0-9]+$/,
              message: '영문/숫자만 입력 가능합니다',
            },
            { max: 20, message: '최대 20자까지 입력 가능합니다' },
            { validator: validateCode },
          ]}
          extra="영문/숫자 조합, 최대 20자"
        >
          <Input
            data-testid="process-code-input"
            placeholder="예: PRC001"
            maxLength={20}
            disabled={mode === 'edit'} // 수정 시 코드 변경 불가
          />
        </Form.Item>

        {/* 공정명 */}
        <Form.Item
          name="name"
          label="공정명"
          rules={[
            { required: true, message: '공정명을 입력해주세요' },
            { max: 50, message: '최대 50자까지 입력 가능합니다' },
          ]}
        >
          <Input
            data-testid="process-name-input"
            placeholder="공정명을 입력하세요"
            maxLength={50}
          />
        </Form.Item>

        {/* 상태 */}
        <Form.Item
          name="status"
          label="상태"
          rules={[{ required: true, message: '상태를 선택해주세요' }]}
        >
          <Radio.Group data-testid="process-status-radio">
            <Radio value="active" data-testid="process-status-radio-active">
              활성
            </Radio>
            <Radio value="inactive" data-testid="process-status-radio-inactive">
              비활성
            </Radio>
          </Radio.Group>
        </Form.Item>

        {/* 순서 */}
        <Form.Item
          name="order"
          label="순서"
          rules={[
            {
              type: 'number',
              min: 1,
              max: 999,
              message: '1~999 사이의 숫자를 입력해주세요',
            },
          ]}
        >
          <InputNumber
            data-testid="process-order-input"
            min={1}
            max={999}
            placeholder="순서"
            style={{ width: 120 }}
          />
        </Form.Item>

        {/* 설명 */}
        <Form.Item
          name="description"
          label="설명"
          rules={[{ max: 500, message: '최대 500자까지 입력 가능합니다' }]}
        >
          <TextArea
            data-testid="process-description-input"
            placeholder="공정에 대한 설명을 입력하세요"
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </FormTemplate>
    </div>
  )
}

export default ProcessForm
