// screens/sample/OrganizationTree/OrganizationFormModal.tsx
// 조직/부서 추가/수정 모달 (TSK-06-13)

'use client'

import React, { useEffect } from 'react'
import { Modal, Form, Input, InputNumber } from 'antd'
import type { OrganizationNode, OrganizationFormData } from './types'

interface OrganizationFormModalProps {
  /** 모달 열림 상태 */
  open: boolean
  /** 모달 닫기 핸들러 */
  onClose: () => void
  /** 저장 핸들러 */
  onSave: (data: OrganizationFormData) => { success: boolean; error?: string }
  /** 수정 모드일 경우 기존 노드 데이터 */
  editNode?: OrganizationNode | null
  /** 부모 노드 (추가 모드일 경우) */
  parentNode?: OrganizationNode | null
}

/**
 * 조직/부서 추가/수정 모달
 *
 * UC-02: 노드 추가
 * UC-03: 노드 수정
 *
 * @example
 * ```tsx
 * <OrganizationFormModal
 *   open={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onSave={(data) => addNode(parentId, data)}
 *   parentNode={selectedNode}
 * />
 * ```
 */
export function OrganizationFormModal({
  open,
  onClose,
  onSave,
  editNode,
  parentNode,
}: OrganizationFormModalProps) {
  const [form] = Form.useForm<OrganizationFormData>()
  const isEditMode = !!editNode

  // 모달 열릴 때 폼 초기화
  useEffect(() => {
    if (open) {
      if (editNode) {
        // 수정 모드: 기존 데이터로 초기화
        form.setFieldsValue({
          name: editNode.name,
          code: editNode.code,
          manager: editNode.manager || '',
          contact: editNode.contact || '',
          headcount: editNode.headcount || 0,
          description: editNode.description || '',
        })
      } else {
        // 추가 모드: 빈 폼
        form.resetFields()
      }
    }
  }, [open, editNode, form])

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const result = onSave(values)

      if (result.success) {
        onClose()
      } else {
        // 에러 메시지를 code 필드에 표시 (중복 코드 에러 등)
        if (result.error?.includes('코드')) {
          form.setFields([
            {
              name: 'code',
              errors: [result.error],
            },
          ])
        }
      }
    } catch {
      // 유효성 검사 실패
    }
  }

  return (
    <Modal
      data-testid="organization-modal"
      title={isEditMode ? '부서 수정' : '부서 추가'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="저장"
      cancelText="취소"
      okButtonProps={{ 'data-testid': 'btn-save' }}
      cancelButtonProps={{ 'data-testid': 'btn-cancel' }}
      destroyOnHidden
    >
      {parentNode && !isEditMode && (
        <div className="mb-4 rounded bg-gray-50 p-2 text-sm dark:bg-gray-800">
          상위 부서: <strong>{parentNode.name}</strong>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={{
          headcount: 0,
        }}
      >
        <Form.Item
          name="name"
          label="부서명"
          rules={[
            { required: true, message: '부서명을 입력해주세요' },
            { min: 2, message: '부서명은 2자 이상이어야 합니다' },
            { max: 50, message: '부서명은 50자 이하여야 합니다' },
          ]}
        >
          <Input
            data-testid="input-name"
            placeholder="부서명을 입력하세요"
            maxLength={50}
          />
        </Form.Item>

        <Form.Item
          name="code"
          label="부서 코드"
          rules={[
            { required: true, message: '부서 코드를 입력해주세요' },
            {
              pattern: /^[A-Za-z0-9]+$/,
              message: '영문/숫자만 입력 가능합니다',
            },
            { min: 2, message: '부서 코드는 2자 이상이어야 합니다' },
            { max: 10, message: '부서 코드는 10자 이하여야 합니다' },
          ]}
        >
          <Input
            data-testid="input-code"
            placeholder="영문/숫자 2-10자"
            maxLength={10}
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => {
              form.setFieldValue('code', e.target.value.toUpperCase())
            }}
          />
        </Form.Item>

        <Form.Item
          name="manager"
          label="담당자"
          rules={[{ max: 20, message: '담당자명은 20자 이하여야 합니다' }]}
        >
          <Input
            data-testid="input-manager"
            placeholder="담당자명"
            maxLength={20}
          />
        </Form.Item>

        <Form.Item
          name="contact"
          label="연락처"
          rules={[
            {
              pattern: /^[0-9-]+$/,
              message: '숫자와 하이픈(-)만 입력 가능합니다',
            },
          ]}
        >
          <Input data-testid="input-contact" placeholder="02-1234-5678" />
        </Form.Item>

        <Form.Item
          name="headcount"
          label="인원"
          rules={[{ type: 'number', min: 0, message: '0 이상 입력해주세요' }]}
        >
          <InputNumber
            data-testid="input-headcount"
            min={0}
            max={9999}
            style={{ width: '100%' }}
            placeholder="0"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="설명"
          rules={[{ max: 200, message: '설명은 200자 이하여야 합니다' }]}
        >
          <Input.TextArea
            data-testid="input-description"
            placeholder="부서 설명"
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default OrganizationFormModal
