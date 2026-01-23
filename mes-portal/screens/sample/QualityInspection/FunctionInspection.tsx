// screens/sample/QualityInspection/FunctionInspection.tsx
// 기능 검사 폼 섹션 (TSK-06-12)

'use client'

import React from 'react'
import {
  Form,
  Input,
  Select,
  Radio,
  Button,
  Card,
  Space,
  Alert,
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { FormInstance } from 'antd'
import type { FunctionItem, QualityInspectionMockData } from './types'
import { INSPECTION_ITEM_LIMITS } from './types'
import mockData from '@/mock-data/quality-inspection.json'

interface FunctionInspectionProps {
  form: FormInstance
}

/**
 * 기능 검사 폼 섹션
 */
export function FunctionInspection({ form }: FunctionInspectionProps) {
  const data = mockData as QualityInspectionMockData

  return (
    <Form.List name="functionItems">
      {(fields, { add, remove }) => (
        <div data-testid="function-items-list">
          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-medium">기능 검사 항목</span>
            <Button
              type="dashed"
              onClick={() =>
                add({
                  testItem: '',
                  testCondition: '',
                  testResult: undefined,
                  measuredValue: '',
                })
              }
              icon={<PlusOutlined />}
              data-testid="add-item-btn"
              disabled={fields.length >= INSPECTION_ITEM_LIMITS.MAX}
            >
              항목 추가
            </Button>
          </div>

          <Space orientation="vertical" className="w-full" size="middle">
            {fields.map((field, index) => {
              const items = form.getFieldValue('functionItems') as FunctionItem[]
              const currentItem = items?.[index]
              const isFailed = currentItem?.testResult === 'fail'

              return (
                <Card
                  key={field.key}
                  size="small"
                  data-testid={`function-item-${index}`}
                  title={<span className="font-medium">#{index + 1}</span>}
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(field.name)}
                      data-testid={`remove-item-btn-${index}`}
                      disabled={fields.length <= INSPECTION_ITEM_LIMITS.MIN}
                    />
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* 테스트항목 */}
                    <Form.Item
                      label="테스트항목"
                      name={[field.name, 'testItem']}
                      rules={[{ required: true, message: '테스트항목을 입력해주세요' }]}
                    >
                      <Input
                        placeholder="예: 전원 ON/OFF"
                        data-testid={`test-item-input-${index}`}
                        aria-label={`테스트항목 ${index + 1}`}
                      />
                    </Form.Item>

                    {/* 테스트조건 */}
                    <Form.Item
                      label="테스트조건"
                      name={[field.name, 'testCondition']}
                      rules={[{ required: true, message: '테스트조건을 입력해주세요' }]}
                    >
                      <Input
                        placeholder="예: 상온 25°C"
                        data-testid={`test-condition-input-${index}`}
                        aria-label={`테스트조건 ${index + 1}`}
                      />
                    </Form.Item>

                    {/* 측정값 */}
                    <Form.Item
                      label="측정값"
                      name={[field.name, 'measuredValue']}
                    >
                      <Input
                        placeholder="예: 정상 동작"
                        data-testid={`measured-value-input-${index}`}
                        aria-label={`측정값 ${index + 1}`}
                      />
                    </Form.Item>

                    {/* 테스트결과 */}
                    <Form.Item
                      label="테스트결과"
                      name={[field.name, 'testResult']}
                      rules={[{ required: true, message: '테스트결과를 선택해주세요' }]}
                    >
                      <Radio.Group>
                        <Radio
                          value="pass"
                          data-testid={`result-pass-radio-${index}`}
                        >
                          합격
                        </Radio>
                        <Radio
                          value="fail"
                          data-testid={`result-fail-radio-${index}`}
                        >
                          불합격
                        </Radio>
                      </Radio.Group>
                    </Form.Item>
                  </div>

                  {/* 조건부 필드: 불합격 시 표시 */}
                  {isFailed && (
                    <div
                      data-testid={`defect-fields-${index}`}
                      className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded"
                    >
                      <Alert
                        type="error"
                        message="불합격 상세"
                        className="mb-4"
                        showIcon
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 불량유형 */}
                        <Form.Item
                          label="불량유형"
                          name={[field.name, 'defectType']}
                          rules={[
                            { required: true, message: '불량유형을 선택해주세요' },
                          ]}
                        >
                          <Select
                            placeholder="선택하세요"
                            options={data.defectTypes}
                            data-testid={`defect-type-select-${index}`}
                            aria-label={`불량유형 ${index + 1}`}
                          />
                        </Form.Item>

                        {/* 불량사유 */}
                        <Form.Item
                          label="불량사유"
                          name={[field.name, 'defectReason']}
                          rules={[
                            { required: true, message: '불량사유를 입력해주세요' },
                          ]}
                        >
                          <Input
                            placeholder="불량 사유를 입력하세요"
                            data-testid={`defect-reason-input-${index}`}
                            aria-label={`불량사유 ${index + 1}`}
                          />
                        </Form.Item>

                        {/* 조치사항 */}
                        <Form.Item
                          label="조치사항"
                          name={[field.name, 'action']}
                          className="md:col-span-2"
                        >
                          <Input
                            placeholder="조치 사항을 입력하세요 (선택)"
                            data-testid={`action-input-${index}`}
                            aria-label={`조치사항 ${index + 1}`}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </Space>

          {fields.length >= INSPECTION_ITEM_LIMITS.MAX && (
            <div className="mt-2 text-orange-500 text-sm">
              최대 {INSPECTION_ITEM_LIMITS.MAX}개까지 추가할 수 있습니다
            </div>
          )}

          <Alert
            type="warning"
            message="테스트결과가 '불합격'인 경우 불량유형과 불량사유는 필수 입력입니다."
            className="mt-4"
            showIcon
          />
        </div>
      )}
    </Form.List>
  )
}

export default FunctionInspection
