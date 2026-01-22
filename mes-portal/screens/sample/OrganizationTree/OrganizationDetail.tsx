// screens/sample/OrganizationTree/OrganizationDetail.tsx
// 조직/부서 상세 정보 패널 (TSK-06-13)

'use client'

import React from 'react'
import { Descriptions, Button, Space, Typography, Divider } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { OrganizationNode } from './types'

const { Text } = Typography

interface OrganizationDetailProps {
  /** 표시할 노드 */
  node: OrganizationNode
  /** 수정 버튼 클릭 핸들러 */
  onEdit: () => void
  /** 삭제 버튼 클릭 핸들러 */
  onDelete: () => void
  /** 루트 노드 여부 (삭제 버튼 비활성화용) */
  isRoot: boolean
}

/**
 * 조직/부서 상세 정보 패널
 *
 * UC-01: 조직 트리 조회 - 선택된 노드의 상세 정보 표시
 *
 * @example
 * ```tsx
 * <OrganizationDetail
 *   node={selectedNode}
 *   onEdit={() => setIsEditModalOpen(true)}
 *   onDelete={() => confirmDelete()}
 *   isRoot={isRootNode(selectedNode.id)}
 * />
 * ```
 */
export function OrganizationDetail({
  node,
  onEdit,
  onDelete,
  isRoot,
}: OrganizationDetailProps) {
  /**
   * 날짜 포맷팅
   */
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div data-testid="organization-detail" className="h-full p-4">
      <div className="mb-4 flex items-center justify-between">
        <Text strong className="text-lg">
          부서 상세 정보
        </Text>
        <Space>
          <Button
            data-testid="btn-detail-edit"
            icon={<EditOutlined />}
            onClick={onEdit}
          >
            수정
          </Button>
          <Button
            data-testid="btn-detail-delete"
            icon={<DeleteOutlined />}
            danger
            onClick={onDelete}
            disabled={isRoot}
            title={isRoot ? '루트 노드는 삭제할 수 없습니다' : undefined}
          >
            삭제
          </Button>
        </Space>
      </div>

      <Divider className="my-3" />

      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="부서명">
          <span data-testid="detail-name">{node.name}</span>
        </Descriptions.Item>
        <Descriptions.Item label="부서 코드">
          <span data-testid="detail-code">{node.code}</span>
        </Descriptions.Item>
        <Descriptions.Item label="담당자">
          <span data-testid="detail-manager">{node.manager || '-'}</span>
        </Descriptions.Item>
        <Descriptions.Item label="연락처">
          <span data-testid="detail-contact">{node.contact || '-'}</span>
        </Descriptions.Item>
        <Descriptions.Item label="인원">
          <span data-testid="detail-headcount">
            {node.headcount !== undefined ? `${node.headcount}명` : '-'}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="설명">
          <span data-testid="detail-description">
            {node.description || '-'}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="생성일">
          {formatDate(node.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="수정일">
          {formatDate(node.updatedAt)}
        </Descriptions.Item>
      </Descriptions>
    </div>
  )
}

export default OrganizationDetail
