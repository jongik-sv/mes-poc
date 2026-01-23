/**
 * @file ProcessDetail.tsx
 * @description 공정 상세 화면 컴포넌트
 * @task TSK-06-18
 *
 * @requirements
 * - FR-002: 공정 상세 보기 (Descriptions + Tabs)
 * - BR-01: 삭제 시 확인 다이얼로그 필수
 */

'use client'

import React, { useMemo } from 'react'
import { Tag, Result, Button } from 'antd'
import type { DescriptionsProps } from 'antd'
import { DetailTemplate } from '@/components/templates/DetailTemplate'
import dayjs from '@/lib/dayjs'
import type { ProcessData } from './types'
import { STATUS_LABELS, STATUS_COLORS } from './types'
import { EquipmentTab } from './EquipmentTab'
import { HistoryTab } from './HistoryTab'

interface ProcessDetailProps {
  process: ProcessData | null
  loading?: boolean
  error?: string | null
  onEdit: () => void
  onDelete: () => Promise<void>
  onBack: () => void
  onRetry?: () => void
}

/**
 * 공정 상세 화면 컴포넌트
 */
export function ProcessDetail({
  process,
  loading = false,
  error,
  onEdit,
  onDelete,
  onBack,
  onRetry,
}: ProcessDetailProps) {
  /**
   * 기본 정보 Descriptions 아이템
   */
  const descriptionItems: DescriptionsProps['items'] = useMemo(() => {
    if (!process) return []

    return [
      {
        key: 'code',
        label: '공정코드',
        children: process.code,
        span: 1,
      },
      {
        key: 'name',
        label: '공정명',
        children: process.name,
        span: 1,
      },
      {
        key: 'status',
        label: '상태',
        children: (
          <Tag color={STATUS_COLORS[process.status]}>
            {STATUS_LABELS[process.status]}
          </Tag>
        ),
        span: 1,
      },
      {
        key: 'order',
        label: '순서',
        children: process.order,
        span: 1,
      },
      {
        key: 'equipmentCount',
        label: '연결 설비',
        children: `${process.equipmentCount}대`,
        span: 1,
      },
      {
        key: 'createdAt',
        label: '생성일',
        children: dayjs(process.createdAt).format('YYYY-MM-DD HH:mm'),
        span: 1,
      },
      {
        key: 'updatedAt',
        label: '수정일',
        children: dayjs(process.updatedAt).format('YYYY-MM-DD HH:mm'),
        span: 2,
      },
      {
        key: 'description',
        label: '설명',
        children: process.description || '-',
        span: 3,
      },
    ]
  }, [process])

  /**
   * 탭 정의
   */
  const tabs = useMemo(() => {
    if (!process) return []

    return [
      {
        key: 'equipment',
        label: '설비 연결',
        children: (
          <div data-testid="tab-equipment-content">
            <EquipmentTab equipment={process.equipment} />
          </div>
        ),
      },
      {
        key: 'history',
        label: '이력',
        children: (
          <div data-testid="tab-history-content">
            <HistoryTab history={process.history} />
          </div>
        ),
      },
    ]
  }, [process])

  // 에러 상태 표시
  if (error) {
    return (
      <div data-testid="error-state" className="p-4">
        <Result
          status="error"
          title="데이터를 불러올 수 없습니다"
          subTitle={error}
          extra={[
            <Button key="back" onClick={onBack} data-testid="back-btn">
              목록으로
            </Button>,
            onRetry && (
              <Button
                key="retry"
                type="primary"
                onClick={onRetry}
                data-testid="retry-btn"
              >
                재시도
              </Button>
            ),
          ].filter(Boolean)}
        />
      </div>
    )
  }

  // 데이터 없음
  if (!loading && !process) {
    return (
      <div data-testid="empty-state" className="p-4">
        <Result
          status="warning"
          title="공정을 찾을 수 없습니다"
          extra={
            <Button onClick={onBack} data-testid="back-btn">
              목록으로
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div data-testid="process-detail" className="p-4">
      <DetailTemplate
        title="공정 상세"
        subtitle={process?.name}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
        onBack={onBack}
        descriptions={{
          items: descriptionItems,
          bordered: true,
          column: 3,
        }}
        tabs={tabs}
        defaultActiveTab="equipment"
        deleteConfirmTitle="공정 삭제"
        deleteConfirmMessage="이 공정을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다."
      />
    </div>
  )
}

export default ProcessDetail
