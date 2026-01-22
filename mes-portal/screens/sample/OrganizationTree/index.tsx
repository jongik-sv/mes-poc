// screens/sample/OrganizationTree/index.tsx
// 조직/부서 트리 샘플 화면 (TSK-06-13)

'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Tree,
  Input,
  Button,
  Dropdown,
  Modal,
  Empty,
  Typography,
  message,
} from 'antd'
import type { TreeProps, TreeDataNode } from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { Key } from 'react'
import { MasterDetailTemplate } from '@/components/templates/MasterDetailTemplate'
import { useOrganizationTree } from './useOrganizationTree'
import { OrganizationFormModal } from './OrganizationFormModal'
import { OrganizationDetail } from './OrganizationDetail'
import { searchNodes } from './utils'
import type {
  OrganizationTreeProps,
  OrganizationNode,
  OrganizationFormData,
  ContextMenuAction,
} from './types'

const { Text } = Typography

/**
 * 조직/부서 트리 샘플 화면
 *
 * MasterDetailTemplate을 활용한 계층형 트리 관리 샘플입니다.
 * - 좌측: 조직 트리 (드래그 앤 드롭, 컨텍스트 메뉴)
 * - 우측: 선택된 노드의 상세 정보
 *
 * @example
 * ```tsx
 * <OrganizationTree />
 * ```
 */
export function OrganizationTree({
  defaultSplit,
  minMasterWidth = 250,
  minDetailWidth = 350,
}: OrganizationTreeProps) {
  const {
    treeData,
    selectedNode,
    expandedKeys,
    searchKeyword,
    searchCount,
    selectNode,
    setExpandedKeys,
    setSearchKeyword,
    addNode,
    updateNode,
    deleteNode,
    moveNode,
    findNodeById,
    isDescendant,
    isRootNode,
  } = useOrganizationTree()

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [targetParentNode, setTargetParentNode] =
    useState<OrganizationNode | null>(null)

  // 컨텍스트 메뉴 상태
  const [contextMenuNode, setContextMenuNode] =
    useState<OrganizationNode | null>(null)

  // 검색 결과 강조용
  const { matchedIds, expandIds } = useMemo(() => {
    return searchNodes(treeData, searchKeyword)
  }, [treeData, searchKeyword])

  // 검색 시 관련 노드 펼치기
  useEffect(() => {
    if (searchKeyword && expandIds.length > 0) {
      setExpandedKeys([...new Set([...expandedKeys, ...expandIds])])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, expandIds])

  /**
   * 트리 데이터를 Ant Design Tree 형식으로 변환
   */
  const convertToTreeData = useCallback(
    (nodes: OrganizationNode[]): TreeDataNode[] => {
      return nodes.map((node) => {
        const hasChildren = node.children && node.children.length > 0
        const isExpanded = expandedKeys.includes(node.id)
        const isHighlighted = matchedIds.includes(node.id)

        return {
          key: node.id,
          title: (
            <span
              data-testid={`tree-node-${node.id}`}
              className={isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900' : ''}
            >
              {node.name}
            </span>
          ),
          icon: hasChildren ? (
            isExpanded ? (
              <FolderOpenOutlined />
            ) : (
              <FolderOutlined />
            )
          ) : (
            <TeamOutlined />
          ),
          children: node.children
            ? convertToTreeData(node.children)
            : undefined,
        }
      })
    },
    [expandedKeys, matchedIds]
  )

  const antTreeData = useMemo(
    () => convertToTreeData(treeData),
    [treeData, convertToTreeData]
  )

  /**
   * 노드 선택 핸들러
   */
  const handleSelect: TreeProps['onSelect'] = useCallback(
    (selectedKeys: Key[]) => {
      const nodeId = selectedKeys[0]?.toString() || null
      selectNode(nodeId)
    },
    [selectNode]
  )

  /**
   * 노드 펼침/접힘 핸들러
   */
  const handleExpand: TreeProps['onExpand'] = useCallback(
    (keys: Key[]) => {
      setExpandedKeys(keys as string[])
    },
    [setExpandedKeys]
  )

  /**
   * 검색어 변경 핸들러
   */
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchKeyword(e.target.value)
    },
    [setSearchKeyword]
  )

  /**
   * 컨텍스트 메뉴 항목
   */
  const getContextMenuItems = useCallback(
    (node: OrganizationNode): MenuProps['items'] => {
      const isRoot = isRootNode(node.id)

      return [
        {
          key: 'add',
          label: '하위 노드 추가',
          'data-testid': 'menu-add-child',
        },
        {
          key: 'edit',
          label: '수정',
          'data-testid': 'menu-edit',
        },
        {
          type: 'divider',
        },
        {
          key: 'delete',
          label: '삭제',
          danger: true,
          disabled: isRoot,
          'data-testid': 'menu-delete',
        },
      ]
    },
    [isRootNode]
  )

  /**
   * 컨텍스트 메뉴 클릭 핸들러
   */
  const handleContextMenuClick = useCallback(
    (action: ContextMenuAction, node: OrganizationNode) => {
      switch (action) {
        case 'add':
          setModalMode('add')
          setTargetParentNode(node)
          setIsModalOpen(true)
          break
        case 'edit':
          setModalMode('edit')
          selectNode(node.id)
          setIsModalOpen(true)
          break
        case 'delete':
          confirmDelete(node)
          break
      }
    },
    [selectNode]
  )

  /**
   * 삭제 확인 다이얼로그
   */
  const confirmDelete = useCallback(
    (node: OrganizationNode) => {
      const hasChildren = node.children && node.children.length > 0

      Modal.confirm({
        title: '삭제 확인',
        content: hasChildren
          ? `"${node.name}"과(와) 하위 ${node.children?.length}개의 부서도 함께 삭제됩니다. 계속하시겠습니까?`
          : `"${node.name}"을(를) 삭제하시겠습니까?`,
        okText: '삭제',
        cancelText: '취소',
        okButtonProps: { danger: true },
        onOk: () => {
          const result = deleteNode(node.id)
          if (result.success) {
            message.success('삭제되었습니다')
          } else {
            message.error(result.error || '삭제에 실패했습니다')
          }
        },
      })
    },
    [deleteNode]
  )

  /**
   * 노드 우클릭 핸들러
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRightClick = useCallback(
    (info: any) => {
      info.event.preventDefault()
      const orgNode = findNodeById(info.node.key as string)
      if (orgNode) {
        setContextMenuNode(orgNode)
      }
    },
    [findNodeById]
  )

  /**
   * 드래그 앤 드롭 핸들러
   * UC-05: 노드 이동 (드래그 앤 드롭)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDrop = useCallback(
    (info: any) => {
      const dragNodeId = info.dragNode.key as string
      const dropNodeId = info.node.key as string
      const dropPosition = info.dropPosition

      // 자기 하위로 이동 방지 (BR-002)
      if (dragNodeId === dropNodeId || isDescendant(dropNodeId, dragNodeId)) {
        message.warning('해당 위치로 이동할 수 없습니다')
        return
      }

      const result = moveNode(dragNodeId, dropNodeId, dropPosition)
      if (result.success) {
        message.success('이동되었습니다')
      } else {
        message.error(result.error || '이동에 실패했습니다')
      }
    },
    [moveNode, isDescendant]
  )

  /**
   * 노드 저장 핸들러
   */
  const handleSaveNode = useCallback(
    (data: OrganizationFormData): { success: boolean; error?: string } => {
      if (modalMode === 'add' && targetParentNode) {
        const result = addNode(targetParentNode.id, data)
        if (result.success) {
          message.success('추가되었습니다')
        }
        return result
      } else if (modalMode === 'edit' && selectedNode) {
        const result = updateNode(selectedNode.id, data)
        if (result.success) {
          message.success('저장되었습니다')
        }
        return result
      }
      return { success: false, error: '알 수 없는 오류' }
    },
    [modalMode, targetParentNode, selectedNode, addNode, updateNode]
  )

  /**
   * 루트 노드 추가 핸들러
   */
  const handleAddRootNode = useCallback(() => {
    if (treeData.length > 0) {
      // 기존 루트가 있으면 그 아래에 추가
      setTargetParentNode(treeData[0])
    }
    setModalMode('add')
    setIsModalOpen(true)
  }, [treeData])

  /**
   * 마스터 영역 컨텐츠 (조직 트리)
   */
  const masterContent = (
    <div data-testid="organization-tree" className="h-full p-2">
      <Dropdown
        menu={{
          items: contextMenuNode
            ? getContextMenuItems(contextMenuNode)
            : [],
          onClick: ({ key }) => {
            if (contextMenuNode) {
              handleContextMenuClick(key as ContextMenuAction, contextMenuNode)
            }
          },
        }}
        trigger={['contextMenu']}
        onOpenChange={(open) => {
          if (!open) setContextMenuNode(null)
        }}
      >
        <div>
          <Tree
            data-testid="tree-node"
            treeData={antTreeData}
            selectedKeys={selectedNode ? [selectedNode.id] : []}
            expandedKeys={expandedKeys}
            onSelect={handleSelect}
            onExpand={handleExpand}
            onRightClick={handleRightClick}
            onDrop={handleDrop}
            draggable
            showIcon
            blockNode
          />
        </div>
      </Dropdown>
    </div>
  )

  /**
   * 디테일 영역 컨텐츠 (상세 정보)
   */
  const detailContent = selectedNode ? (
    <OrganizationDetail
      node={selectedNode}
      onEdit={() => {
        setModalMode('edit')
        setIsModalOpen(true)
      }}
      onDelete={() => confirmDelete(selectedNode)}
      isRoot={isRootNode(selectedNode.id)}
    />
  ) : null

  /**
   * 빈 상태 플레이스홀더
   */
  const emptyPlaceholder = (
    <div
      data-testid="empty-state"
      className="flex h-full items-center justify-center"
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Text type="secondary">
            좌측 트리에서 조직을 선택하세요
          </Text>
        }
      />
    </div>
  )

  return (
    <div
      data-testid="organization-tree-page"
      className="h-full"
      style={{ minHeight: '500px' }}
    >
      {/* 헤더 영역 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            data-testid="search-input"
            placeholder="검색..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchKeyword}
            onChange={handleSearchChange}
            allowClear
            style={{ width: 240 }}
          />
          {searchKeyword && (
            <Text
              data-testid="search-count"
              type="secondary"
              className="text-sm"
            >
              {searchCount}건 검색됨
            </Text>
          )}
        </div>
        <Button
          data-testid="btn-add-root"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddRootNode}
        >
          부서 추가
        </Button>
      </div>

      {/* 마스터-디테일 레이아웃 */}
      <MasterDetailTemplate
        masterTitle="조직 트리"
        masterContent={masterContent}
        detailTitle={
          selectedNode ? `${selectedNode.name} 상세 정보` : '상세 정보'
        }
        detailContent={detailContent}
        detailEmpty={emptyPlaceholder}
        selectedMaster={selectedNode}
        defaultSplit={defaultSplit?.[0] ?? 35}
        minMasterWidth={minMasterWidth}
        minDetailWidth={minDetailWidth}
      />

      {/* 추가/수정 모달 */}
      <OrganizationFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setTargetParentNode(null)
        }}
        onSave={handleSaveNode}
        editNode={modalMode === 'edit' ? selectedNode : null}
        parentNode={modalMode === 'add' ? targetParentNode : null}
      />

      {/* 도움말 */}
      <div className="mt-2 text-center text-xs text-gray-400">
        드래그하여 노드 위치를 변경할 수 있습니다. 우클릭으로 추가/수정/삭제가
        가능합니다.
      </div>
    </div>
  )
}

export default OrganizationTree
