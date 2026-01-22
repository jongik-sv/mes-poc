// screens/sample/QualityInspection/QualityInspection.tsx
// 품질 검사 입력 폼 메인 컴포넌트 (TSK-06-12)

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  Form,
  Input,
  Button,
  Card,
  Segmented,
  DatePicker,
  Upload,
  Space,
  Modal,
  message,
  Typography,
} from 'antd'
import {
  SaveOutlined,
  EyeOutlined,
  UndoOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import type { UploadProps, UploadFile } from 'antd'
import dayjs from 'dayjs'

import { DimensionInspection } from './DimensionInspection'
import { AppearanceInspection } from './AppearanceInspection'
import { FunctionInspection } from './FunctionInspection'
import { InspectionPreview } from './InspectionPreview'
import type {
  QualityInspectionFormData,
  InspectionType,
} from './types'
import {
  INSPECTION_TYPE_OPTIONS,
  IMAGE_UPLOAD_LIMITS,
} from './types'

const { TextArea } = Input
const { Dragger } = Upload
const { Title } = Typography

/**
 * 품질 검사 입력 폼 메인 컴포넌트
 *
 * FR-001: 검사 유형 선택에 따른 동적 필드 렌더링
 * FR-002: 검사 항목 입력 (Form.List)
 * FR-003: 반복 항목 추가
 * FR-004: 반복 항목 삭제
 * FR-005: 조건부 필드 표시
 * FR-006: 이미지 첨부
 * FR-007: 비고 입력
 * FR-008: 미리보기 및 저장
 */
export function QualityInspection() {
  const [form] = Form.useForm<QualityInspectionFormData>()
  const [inspectionType, setInspectionType] = useState<InspectionType>('dimension')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<QualityInspectionFormData | null>(null)
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  /**
   * 검사 유형 변경 핸들러
   */
  const handleTypeChange = useCallback(
    (value: string | number) => {
      const newType = value as InspectionType
      const currentValues = form.getFieldsValue()

      // 데이터가 있으면 확인
      const hasData =
        (currentValues.dimensionItems && currentValues.dimensionItems.length > 0) ||
        (currentValues.appearanceItems && currentValues.appearanceItems.length > 0) ||
        (currentValues.functionItems && currentValues.functionItems.length > 0)

      if (hasData && newType !== inspectionType) {
        Modal.confirm({
          title: '검사 유형 변경',
          content: '검사 유형을 변경하면 입력한 검사 항목이 초기화됩니다. 계속하시겠습니까?',
          onOk: () => {
            setInspectionType(newType)
            // 검사 항목 초기화
            form.setFieldsValue({
              dimensionItems:
                newType === 'dimension'
                  ? [{ position: '', standardValue: undefined, tolerance: '', measuredValue: undefined }]
                  : undefined,
              appearanceItems:
                newType === 'appearance'
                  ? [{ area: undefined, checkItem: undefined, result: undefined }]
                  : undefined,
              functionItems:
                newType === 'function'
                  ? [{ testItem: '', testCondition: '', testResult: undefined, measuredValue: '' }]
                  : undefined,
            })
          },
        })
      } else {
        setInspectionType(newType)
        // 새 유형 기본 항목 설정
        if (newType === 'dimension' && !currentValues.dimensionItems?.length) {
          form.setFieldsValue({
            dimensionItems: [{ position: '', standardValue: undefined, tolerance: '', measuredValue: undefined }],
          })
        } else if (newType === 'appearance' && !currentValues.appearanceItems?.length) {
          form.setFieldsValue({
            appearanceItems: [{ area: undefined, checkItem: undefined, result: undefined }],
          })
        } else if (newType === 'function' && !currentValues.functionItems?.length) {
          form.setFieldsValue({
            functionItems: [{ testItem: '', testCondition: '', testResult: undefined, measuredValue: '' }],
          })
        }
      }
    },
    [form, inspectionType]
  )

  /**
   * 미리보기 핸들러
   */
  const handlePreview = useCallback(async () => {
    try {
      const values = await form.validateFields()
      setPreviewData({
        ...values,
        inspectionType,
        images: fileList,
      })
      setPreviewOpen(true)
    } catch {
      message.error('필수 항목을 입력해주세요')
    }
  }, [form, inspectionType, fileList])

  /**
   * 저장 핸들러
   */
  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()

      // Mock 저장 (실제로는 API 호출)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // eslint-disable-next-line no-console
      console.log('저장된 데이터:', {
        ...values,
        inspectionType,
        images: fileList,
      })

      message.success('검사 결과가 저장되었습니다')
      setPreviewOpen(false)

      // 폼 초기화
      form.resetFields()
      setFileList([])
      setInspectionType('dimension')
      form.setFieldsValue({
        dimensionItems: [{ position: '', standardValue: undefined, tolerance: '', measuredValue: undefined }],
        inspectionDate: dayjs(),
      })
    } catch {
      message.error('저장에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }, [form, inspectionType, fileList])

  /**
   * 초기화 핸들러
   */
  const handleReset = useCallback(() => {
    Modal.confirm({
      title: '초기화',
      content: '입력한 내용이 모두 초기화됩니다. 계속하시겠습니까?',
      okText: '확인',
      cancelText: '취소',
      onOk: () => {
        form.resetFields()
        setFileList([])
        setInspectionType('dimension')
        form.setFieldsValue({
          dimensionItems: [{ position: '', standardValue: undefined, tolerance: '', measuredValue: undefined }],
          inspectionDate: dayjs(),
        })
      },
    })
  }, [form])

  /**
   * 취소 핸들러
   */
  const handleCancel = useCallback(() => {
    Modal.confirm({
      title: '취소',
      content: '입력한 내용이 저장되지 않습니다. 취소하시겠습니까?',
      okText: '확인',
      cancelText: '취소',
      onOk: () => {
        // 이전 화면으로 이동 또는 탭 닫기
        message.info('취소되었습니다')
      },
    })
  }, [])

  /**
   * 이미지 업로드 props
   */
  const uploadProps: UploadProps = useMemo(
    () => ({
      name: 'file',
      multiple: true,
      fileList,
      listType: 'picture-card',
      beforeUpload: (file) => {
        // 형식 검사
        if (!IMAGE_UPLOAD_LIMITS.ACCEPT_TYPES.includes(file.type)) {
          message.error('JPG, PNG 형식만 지원합니다')
          return Upload.LIST_IGNORE
        }
        // 크기 검사
        if (file.size / 1024 / 1024 > IMAGE_UPLOAD_LIMITS.MAX_SIZE_MB) {
          message.error(`${IMAGE_UPLOAD_LIMITS.MAX_SIZE_MB}MB 이하 파일만 업로드 가능합니다`)
          return Upload.LIST_IGNORE
        }
        // 개수 검사
        if (fileList.length >= IMAGE_UPLOAD_LIMITS.MAX_COUNT) {
          message.error(`최대 ${IMAGE_UPLOAD_LIMITS.MAX_COUNT}개까지 업로드 가능합니다`)
          return Upload.LIST_IGNORE
        }
        return false // 실제 업로드 방지 (Mock)
      },
      onChange: ({ fileList: newFileList }) => {
        setFileList(newFileList)
      },
      onRemove: (file) => {
        setFileList((prev) => prev.filter((f) => f.uid !== file.uid))
      },
    }),
    [fileList]
  )

  /**
   * 초기값 설정
   */
  const initialValues = useMemo(
    () => ({
      inspectionType: 'dimension' as InspectionType,
      productCode: '',
      lotNumber: '',
      inspectionDate: dayjs(),
      dimensionItems: [{ position: '', standardValue: undefined, tolerance: '', measuredValue: undefined }],
      remarks: '',
    }),
    []
  )

  return (
    <div data-testid="quality-inspection-page" className="p-4">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={(changedValues) => {
          // 검사 결과 변경 시 조건부 필드 리렌더링 트리거
          if (changedValues.appearanceItems || changedValues.functionItems) {
            form.validateFields()
          }
        }}
      >
        {/* 헤더 */}
        <Card className="mb-4">
          <div className="flex justify-between items-center">
            <Title level={4} className="!mb-0">
              품질 검사 입력
            </Title>
            <Button
              icon={<UndoOutlined />}
              onClick={handleReset}
              data-testid="reset-btn"
            >
              초기화
            </Button>
          </div>
        </Card>

        {/* 검사 유형 선택 */}
        <Card className="mb-4">
          <Form.Item label="검사 유형" className="mb-0">
            <Segmented
              options={INSPECTION_TYPE_OPTIONS}
              value={inspectionType}
              onChange={handleTypeChange}
              data-testid="inspection-type-selector"
            />
          </Form.Item>
        </Card>

        {/* 기본 정보 */}
        <Card title="기본 정보" className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="제품코드"
              name="productCode"
              rules={[{ required: true, message: '제품코드를 입력해주세요' }]}
            >
              <Input
                placeholder="PROD-001"
                data-testid="product-code-input"
                aria-label="제품코드"
              />
            </Form.Item>

            <Form.Item
              label="로트번호"
              name="lotNumber"
              rules={[{ required: true, message: '로트번호를 입력해주세요' }]}
            >
              <Input
                placeholder="LOT-20260122-001"
                data-testid="lot-number-input"
                aria-label="로트번호"
              />
            </Form.Item>

            <Form.Item
              label="검사일시"
              name="inspectionDate"
              rules={[{ required: true, message: '검사일시를 선택해주세요' }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                className="w-full"
                data-testid="inspection-date-picker"
                aria-label="검사일시"
              />
            </Form.Item>
          </div>
        </Card>

        {/* 검사 항목 - 검사 유형에 따라 동적 렌더링 */}
        <Card className="mb-4">
          {inspectionType === 'dimension' && <DimensionInspection form={form} />}
          {inspectionType === 'appearance' && <AppearanceInspection form={form} />}
          {inspectionType === 'function' && <FunctionInspection form={form} />}
        </Card>

        {/* 첨부 이미지 */}
        <Card title="첨부 이미지" className="mb-4">
          <Dragger {...uploadProps} data-testid="image-upload">
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              이미지를 드래그하거나 클릭하여 업로드
            </p>
            <p className="ant-upload-hint">
              (JPG, PNG / 최대 {IMAGE_UPLOAD_LIMITS.MAX_SIZE_MB}MB / 최대{' '}
              {IMAGE_UPLOAD_LIMITS.MAX_COUNT}개)
            </p>
          </Dragger>
        </Card>

        {/* 비고 */}
        <Card title="비고" className="mb-4">
          <Form.Item name="remarks" className="mb-0">
            <TextArea
              rows={3}
              placeholder="검사 관련 메모..."
              maxLength={500}
              showCount
              data-testid="remarks-textarea"
              aria-label="비고"
            />
          </Form.Item>
        </Card>

        {/* 버튼 영역 */}
        <Card>
          <div className="flex justify-end">
            <Space>
              <Button
                icon={<EyeOutlined />}
                onClick={handlePreview}
                data-testid="preview-btn"
              >
                미리보기
              </Button>
              <Button onClick={handleCancel} data-testid="cancel-btn">
                취소
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={loading}
                data-testid="submit-btn"
              >
                저장
              </Button>
            </Space>
          </div>
        </Card>
      </Form>

      {/* 미리보기 모달 */}
      <InspectionPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onSubmit={handleSubmit}
        formData={previewData}
        loading={loading}
      />
    </div>
  )
}

export default QualityInspection
