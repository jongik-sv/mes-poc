// screens/sample/QualityInspection/DimensionInspection.tsx
// 치수 검사 폼 섹션 (TSK-06-12)

'use client'

import React, { useCallback } from 'react'
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Tag,
  Space,
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { FormInstance } from 'antd'
import type { DimensionItem } from './types'
import { INSPECTION_ITEM_LIMITS } from './types'

interface DimensionInspectionProps {
  form: FormInstance
}

/**
 * 허용오차 파싱 (±0.5 → 0.5)
 */
function parseTolerance(tolerance: string): number {
  if (!tolerance) return 0
  const cleaned = tolerance.replace(/[±+-]/g, '').trim()
  return parseFloat(cleaned) || 0
}

/**
 * 판정 계산
 * 기준값 ± 허용오차 범위 내이면 합격
 */
function calculateResult(
  standardValue: number | undefined,
  tolerance: string | undefined,
  measuredValue: number | undefined
): 'pass' | 'fail' | undefined {
  if (
    standardValue === undefined ||
    tolerance === undefined ||
    measuredValue === undefined
  ) {
    return undefined
  }

  const toleranceValue = parseTolerance(tolerance)
  const lowerBound = standardValue - toleranceValue
  const upperBound = standardValue + toleranceValue

  return measuredValue >= lowerBound && measuredValue <= upperBound
    ? 'pass'
    : 'fail'
}

/**
 * 치수 검사 폼 섹션
 */
export function DimensionInspection({ form }: DimensionInspectionProps) {
  /**
   * 판정 결과 계산 및 업데이트
   */
  const handleValueChange = useCallback(
    (index: number) => {
      const items = form.getFieldValue('dimensionItems') as DimensionItem[]
      if (!items || !items[index]) return

      const item = items[index]
      const result = calculateResult(
        item.standardValue,
        item.tolerance,
        item.measuredValue
      )

      // 판정 결과 업데이트
      form.setFieldValue(['dimensionItems', index, 'result'], result)
    },
    [form]
  )

  return (
    <Form.List name="dimensionItems">
      {(fields, { add, remove }) => (
        <div data-testid="dimension-items-list">
          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-medium">측정 항목</span>
            <Button
              type="dashed"
              onClick={() => add({ position: '', standardValue: undefined, tolerance: '', measuredValue: undefined })}
              icon={<PlusOutlined />}
              data-testid="add-item-btn"
              disabled={fields.length >= INSPECTION_ITEM_LIMITS.MAX}
            >
              항목 추가
            </Button>
          </div>

          <Space direction="vertical" className="w-full" size="middle">
            {fields.map((field, index) => {
              const items = form.getFieldValue('dimensionItems') as DimensionItem[]
              const currentItem = items?.[index]
              const result = currentItem?.result

              return (
                <Card
                  key={field.key}
                  size="small"
                  data-testid={`dimension-item-${index}`}
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
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    {/* 측정위치 */}
                    <Form.Item
                      label="측정위치"
                      name={[field.name, 'position']}
                      rules={[{ required: true, message: '측정위치를 입력해주세요' }]}
                      className="mb-0"
                    >
                      <Input
                        placeholder="예: A"
                        data-testid={`position-input-${index}`}
                        aria-label={`측정위치 ${index + 1}`}
                      />
                    </Form.Item>

                    {/* 기준값 */}
                    <Form.Item
                      label="기준값(mm)"
                      name={[field.name, 'standardValue']}
                      rules={[{ required: true, message: '기준값을 입력해주세요' }]}
                      className="mb-0"
                    >
                      <InputNumber
                        placeholder="100"
                        className="w-full"
                        data-testid={`standard-value-input-${index}`}
                        aria-label={`기준값 ${index + 1}`}
                        onBlur={() => handleValueChange(index)}
                      />
                    </Form.Item>

                    {/* 허용오차 */}
                    <Form.Item
                      label="허용오차"
                      name={[field.name, 'tolerance']}
                      rules={[{ required: true, message: '허용오차를 입력해주세요' }]}
                      className="mb-0"
                    >
                      <Input
                        placeholder="±0.5"
                        data-testid={`tolerance-input-${index}`}
                        aria-label={`허용오차 ${index + 1}`}
                        onBlur={() => handleValueChange(index)}
                      />
                    </Form.Item>

                    {/* 측정값 */}
                    <Form.Item
                      label="측정값(mm)"
                      name={[field.name, 'measuredValue']}
                      rules={[{ required: true, message: '측정값을 입력해주세요' }]}
                      className="mb-0"
                    >
                      <InputNumber
                        placeholder="100.2"
                        className="w-full"
                        data-testid={`measured-value-input-${index}`}
                        aria-label={`측정값 ${index + 1}`}
                        onBlur={() => handleValueChange(index)}
                      />
                    </Form.Item>

                    {/* 판정 */}
                    <Form.Item
                      label="판정"
                      className="mb-0"
                    >
                      <div data-testid={`result-tag-${index}`}>
                        {result === 'pass' && (
                          <Tag color="success">합격</Tag>
                        )}
                        {result === 'fail' && (
                          <Tag color="error">불합격</Tag>
                        )}
                        {result === undefined && (
                          <Tag>-</Tag>
                        )}
                      </div>
                    </Form.Item>

                    {/* hidden result field */}
                    <Form.Item
                      name={[field.name, 'result']}
                      hidden
                    >
                      <Input />
                    </Form.Item>
                  </div>
                </Card>
              )
            })}
          </Space>

          {fields.length >= INSPECTION_ITEM_LIMITS.MAX && (
            <div className="mt-2 text-orange-500 text-sm">
              최대 {INSPECTION_ITEM_LIMITS.MAX}개까지 추가할 수 있습니다
            </div>
          )}
        </div>
      )}
    </Form.List>
  )
}

export default DimensionInspection
