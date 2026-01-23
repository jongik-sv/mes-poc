/**
 * @file index.tsx
 * @description 작업 지시 등록 폼 컴포넌트
 * @task TSK-06-16
 *
 * @requirements
 * - FR-001: 작업 지시 입력 폼 (제품, 수량, 라인, 일정)
 * - FR-002: 제품 선택 팝업 (SelectPopupTemplate)
 * - FR-003: 저장 전 확인 다이얼로그
 * - FR-004: 저장 성공/실패 Toast 알림
 * - FR-005: 폼 유효성 검사 (필수값, 숫자 범위)
 *
 * @businessRules
 * - BR-01: 저장 전 확인 다이얼로그 필수
 * - BR-02: 필수 필드 입력 완료 후 저장 가능
 * - BR-03: 종료일은 시작일 이후여야 함
 * - BR-04: 수량은 1 이상 99999 이하
 * - BR-05: 변경사항 있을 때 취소 시 확인
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Modal,
  Row,
  Col,
} from 'antd'
import { SearchOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { FormTemplate } from '@/components/templates/FormTemplate'
import { SelectPopupTemplate } from '@/components/templates/SelectPopupTemplate'
import { showSuccess, showError } from '@/lib/utils/toast'
import mockData from '@/mock-data/products.json'
import type {
  Product,
  ProductionLine,
  WorkOrderFormValues,
  WorkOrderFormData,
  WorkOrderFormProps,
} from './types'

const { TextArea } = Input

/**
 * 제품 선택 팝업 컬럼 정의
 */
const productColumns: ColumnsType<Product> = [
  {
    title: '제품 코드',
    dataIndex: 'code',
    key: 'code',
    width: 120,
  },
  {
    title: '제품명',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '규격',
    dataIndex: 'spec',
    key: 'spec',
    width: 120,
  },
  {
    title: '단위',
    dataIndex: 'unit',
    key: 'unit',
    width: 80,
    align: 'center',
  },
]

/**
 * 작업 지시 등록 폼 컴포넌트
 *
 * FormTemplate, SelectPopupTemplate, confirm 다이얼로그, Toast 알림의 통합 활용 검증
 *
 * @example
 * ```tsx
 * <WorkOrderForm
 *   onSaveSuccess={(data) => console.log('저장됨:', data)}
 *   onCancel={() => router.back()}
 * />
 * ```
 */
export function WorkOrderForm({
  products = mockData.products as Product[],
  productionLines = mockData.productionLines as ProductionLine[],
  onSaveSuccess,
  onCancel,
}: WorkOrderFormProps) {
  const [form] = Form.useForm<WorkOrderFormValues>()

  // 상태 관리
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productPopupOpen, setProductPopupOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // 라인 옵션 생성
  const lineOptions = useMemo(
    () =>
      productionLines.map((line) => ({
        value: line.id,
        label: line.name,
      })),
    [productionLines]
  )

  /**
   * 제품 선택 팝업 열기
   */
  const handleOpenProductPopup = useCallback(() => {
    setProductPopupOpen(true)
  }, [])

  /**
   * 제품 선택 완료 핸들러
   */
  const handleProductSelect = useCallback(
    (selectedProducts: Product[]) => {
      if (selectedProducts.length > 0) {
        const product = selectedProducts[0]
        setSelectedProduct(product)
        form.setFieldsValue({
          productCode: product.code,
          productName: product.name,
        })
      }
      setProductPopupOpen(false)
    },
    [form]
  )

  /**
   * 저장 확인 다이얼로그 표시 및 저장 처리 (BR-01)
   */
  const handleSubmit = useCallback(
    async (values: WorkOrderFormValues) => {
      // 폼 유효성 검사 통과 후 확인 다이얼로그 표시 (BR-01)
      Modal.confirm({
        title: '등록 확인',
        icon: <ExclamationCircleFilled />,
        content: '작업 지시를 등록하시겠습니까?',
        okText: '확인',
        cancelText: '취소',
        onOk: async () => {
          setLoading(true)
          try {
            // 폼 데이터 변환
            const formData: WorkOrderFormData = {
              productCode: values.productCode,
              productName: values.productName,
              quantity: values.quantity!,
              lineId: values.lineId,
              startDate: values.startDate!.format('YYYY-MM-DD'),
              endDate: values.endDate!.format('YYYY-MM-DD'),
              remarks: values.remarks,
            }

            // 저장 시뮬레이션 (Mock)
            await new Promise((resolve) => setTimeout(resolve, 500))

            // 성공 Toast (FR-004)
            showSuccess('저장되었습니다.')
            onSaveSuccess?.(formData)

            // 폼 초기화
            form.resetFields()
            setSelectedProduct(null)
          } catch (error) {
            // 에러 Toast (FR-004)
            showError('저장에 실패했습니다. 다시 시도해주세요.')
          } finally {
            setLoading(false)
          }
        },
      })
    },
    [form, onSaveSuccess]
  )

  /**
   * 취소 핸들러 - FormTemplate의 enableDirtyCheck가 처리
   */
  const handleCancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])

  /**
   * 날짜 유효성 검사 - 종료일은 시작일 이후 (BR-03)
   */
  const validateEndDate = useCallback(
    async (_: unknown, value: Dayjs | null) => {
      if (!value) return Promise.resolve()

      const startDate = form.getFieldValue('startDate') as Dayjs | null
      if (startDate && value.isBefore(startDate, 'day')) {
        return Promise.reject(new Error('종료일은 시작일 이후여야 합니다'))
      }
      return Promise.resolve()
    },
    [form]
  )

  return (
    <div data-testid="work-order-form-page">
      <FormTemplate<WorkOrderFormValues>
        form={form}
        title="작업 지시"
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        enableDirtyCheck
        submitText="저장"
        cancelText="취소"
      >
        {/* 제품 선택 필드 */}
        <Form.Item
          label="제품"
          required
          style={{ marginBottom: 0 }}
        >
          <Row gutter={8}>
            <Col flex="1">
              <Form.Item
                name="productCode"
                rules={[{ required: true, message: '제품을 선택해주세요' }]}
                noStyle
              >
                <Input
                  data-testid="product-code-input"
                  placeholder="제품 코드"
                  disabled
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col flex="2">
              <Form.Item name="productName" noStyle>
                <Input
                  data-testid="selected-product"
                  placeholder="제품 선택 시 자동 표시"
                  disabled
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col>
              <Button
                data-testid="product-select-btn"
                icon={<SearchOutlined />}
                onClick={handleOpenProductPopup}
              >
                제품 선택
              </Button>
            </Col>
          </Row>
        </Form.Item>

        {/* 수량 입력 */}
        <Form.Item
          label="수량"
          name="quantity"
          rules={[
            { required: true, message: '수량을 입력해주세요' },
            {
              type: 'number',
              min: 1,
              max: 99999,
              message: '수량은 1 이상 99,999 이하로 입력해주세요',
            },
          ]}
        >
          <InputNumber
            data-testid="quantity-input"
            min={1}
            max={99999}
            placeholder="1 ~ 99,999"
            style={{ width: '200px' }}
            suffix="개"
          />
        </Form.Item>

        {/* 생산 라인 선택 */}
        <Form.Item
          label="생산 라인"
          name="lineId"
          rules={[{ required: true, message: '생산 라인을 선택해주세요' }]}
        >
          <Select
            data-testid="line-select"
            placeholder="라인 선택"
            options={lineOptions}
            style={{ width: '250px' }}
          />
        </Form.Item>

        {/* 시작일/종료일 */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="시작일"
              name="startDate"
              rules={[{ required: true, message: '시작일을 선택해주세요' }]}
            >
              <DatePicker
                data-testid="start-date"
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
                placeholder="YYYY-MM-DD"
                onChange={() => {
                  // 시작일 변경 시 종료일 재검증
                  form.validateFields(['endDate'])
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="종료일"
              name="endDate"
              dependencies={['startDate']}
              rules={[
                { required: true, message: '종료일을 선택해주세요' },
                { validator: validateEndDate },
              ]}
            >
              <DatePicker
                data-testid="end-date"
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
                placeholder="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* 비고 */}
        <Form.Item
          label="비고"
          name="remarks"
          rules={[
            { max: 500, message: '비고는 500자 이내로 입력해주세요' },
          ]}
        >
          <TextArea
            data-testid="remarks-input"
            rows={3}
            placeholder="비고 사항을 입력하세요 (선택)"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </FormTemplate>

      {/* 제품 선택 팝업 */}
      <SelectPopupTemplate<Product>
        open={productPopupOpen}
        onClose={() => setProductPopupOpen(false)}
        title="제품 선택"
        columns={productColumns}
        dataSource={products}
        rowKey="code"
        multiple={false}
        onSelect={handleProductSelect}
        searchFields={['code', 'name']}
        searchPlaceholder="제품명 또는 코드로 검색"
      />
    </div>
  )
}

export default WorkOrderForm
