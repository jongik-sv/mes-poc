/**
 * @file BasicInfoStep.tsx
 * @description 설정 마법사 1단계: 기본정보 입력
 * @task TSK-06-09
 *
 * @requirements
 * - FR-001: 기본정보 입력 (회사명, 공장명, 관리자 이메일)
 * - BR-002: 다음 이동 전 유효성 검사 필수
 *
 * @testIds
 * - company-name-input: 회사명 입력 필드
 * - factory-name-input: 공장명 입력 필드
 * - admin-email-input: 관리자 이메일 입력 필드
 */

'use client'

import { Form, Input } from 'antd'
import type { FormInstance } from 'antd'
import type { BasicInfoData } from './types'

interface BasicInfoStepProps {
  form: FormInstance<BasicInfoData>
  initialValues?: Partial<BasicInfoData>
  onValuesChange?: () => void
}

export function BasicInfoStep({
  form,
  initialValues,
  onValuesChange,
}: BasicInfoStepProps) {
  return (
    <div data-testid="wizard-step-basic-info-content">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        requiredMark
        onValuesChange={onValuesChange}
      >
        <Form.Item
          name="companyName"
          label="회사명"
          rules={[
            { required: true, message: '회사명을 입력해주세요' },
            { min: 2, message: '회사명은 2자 이상 입력해주세요' },
            { max: 50, message: '회사명은 50자 이하로 입력해주세요' },
          ]}
        >
          <Input
            data-testid="company-name-input"
            placeholder="회사명을 입력하세요"
            maxLength={50}
          />
        </Form.Item>

        <Form.Item
          name="factoryName"
          label="공장명"
          rules={[
            { required: true, message: '공장명을 입력해주세요' },
            { min: 2, message: '공장명은 2자 이상 입력해주세요' },
            { max: 50, message: '공장명은 50자 이하로 입력해주세요' },
          ]}
        >
          <Input
            data-testid="factory-name-input"
            placeholder="공장명을 입력하세요"
            maxLength={50}
          />
        </Form.Item>

        <Form.Item
          name="adminEmail"
          label="관리자 이메일"
          rules={[
            { required: true, message: '관리자 이메일을 입력해주세요' },
            { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
            { max: 254, message: '이메일은 254자 이하로 입력해주세요' },
          ]}
        >
          <Input
            data-testid="admin-email-input"
            placeholder="admin@example.com"
            maxLength={254}
          />
        </Form.Item>
      </Form>
    </div>
  )
}

export default BasicInfoStep
