// screens/sample/OrganizationTree/useOrganizationTree.ts
// 조직/부서 트리 상태 관리 훅 (TSK-06-13)

'use client'

import { useState, useCallback, useMemo } from 'react'
import type {
  OrganizationNode,
  OrganizationFormData,
  UseOrganizationTreeReturn,
} from './types'
import {
  findNodeById as utilFindNodeById,
  isDescendant as utilIsDescendant,
  isRootNode as utilIsRootNode,
  isDuplicateCode,
  collectAllKeys,
  searchNodes,
  deepCopyTree,
  generateNodeId,
  addNodeToTree,
  updateNodeInTree,
  removeNodeFromTree,
  moveNodeInTree,
} from './utils'
import mockData from '@/mock-data/organization.json'

/**
 * 조직/부서 트리 상태 관리 훅
 *
 * CRUD, 검색, 드래그 앤 드롭 기능을 제공합니다.
 *
 * @example
 * ```tsx
 * const {
 *   treeData,
 *   selectedNode,
 *   addNode,
 *   deleteNode,
 *   moveNode,
 * } = useOrganizationTree()
 * ```
 */
export function useOrganizationTree(): UseOrganizationTreeReturn {
  // 트리 데이터 상태
  const [treeData, setTreeData] = useState<OrganizationNode[]>(() =>
    deepCopyTree(mockData.organizations as OrganizationNode[])
  )

  // 선택된 노드 ID
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // 펼쳐진 노드 키
  const [expandedKeys, setExpandedKeys] = useState<string[]>(() =>
    collectAllKeys(mockData.organizations as OrganizationNode[])
  )

  // 검색어
  const [searchKeyword, setSearchKeyword] = useState('')

  // 선택된 노드 객체
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null
    return utilFindNodeById(selectedNodeId, treeData) ?? null
  }, [selectedNodeId, treeData])

  // 검색 결과
  const searchResult = useMemo(() => {
    return searchNodes(treeData, searchKeyword)
  }, [treeData, searchKeyword])

  // 검색 결과 개수
  const searchCount = searchResult.matchedIds.length

  /**
   * 노드 선택
   */
  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId)
  }, [])

  /**
   * 노드 찾기
   */
  const findNodeById = useCallback(
    (nodeId: string): OrganizationNode | undefined => {
      return utilFindNodeById(nodeId, treeData)
    },
    [treeData]
  )

  /**
   * 자손 여부 확인
   */
  const isDescendant = useCallback(
    (nodeId: string, potentialAncestorId: string): boolean => {
      return utilIsDescendant(nodeId, potentialAncestorId, treeData)
    },
    [treeData]
  )

  /**
   * 루트 노드 여부 확인
   */
  const isRootNode = useCallback(
    (nodeId: string): boolean => {
      return utilIsRootNode(nodeId, treeData)
    },
    [treeData]
  )

  /**
   * 노드 추가
   * FR-002: 노드 추가 기능
   * BR-003: 부서 코드 유일성 검증
   */
  const addNode = useCallback(
    (
      parentId: string,
      data: OrganizationFormData
    ): { success: boolean; error?: string } => {
      // 부모 노드 존재 확인
      const parentNode = utilFindNodeById(parentId, treeData)
      if (!parentNode) {
        return { success: false, error: '부모 노드를 찾을 수 없습니다' }
      }

      // 코드 중복 검사
      if (isDuplicateCode(data.code, treeData)) {
        return { success: false, error: '이미 사용 중인 부서 코드입니다' }
      }

      // 새 노드 생성
      const newNode: OrganizationNode = {
        id: generateNodeId(),
        key: generateNodeId(),
        name: data.name,
        title: data.name,
        code: data.code,
        parentId: parentId,
        manager: data.manager,
        contact: data.contact,
        headcount: data.headcount,
        description: data.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // 트리에 추가
      setTreeData((prev) => addNodeToTree(parentId, newNode, prev))

      // 부모 노드 펼침
      setExpandedKeys((prev) =>
        prev.includes(parentId) ? prev : [...prev, parentId]
      )

      // 새 노드 선택
      setSelectedNodeId(newNode.id)

      return { success: true }
    },
    [treeData]
  )

  /**
   * 노드 수정
   * FR-003: 노드 수정 기능
   * BR-003: 부서 코드 유일성 검증
   */
  const updateNode = useCallback(
    (
      nodeId: string,
      data: Partial<OrganizationFormData>
    ): { success: boolean; error?: string } => {
      // 노드 존재 확인
      const node = utilFindNodeById(nodeId, treeData)
      if (!node) {
        return { success: false, error: '노드를 찾을 수 없습니다' }
      }

      // 코드 변경 시 중복 검사
      if (data.code && data.code !== node.code) {
        if (isDuplicateCode(data.code, treeData, nodeId)) {
          return { success: false, error: '이미 사용 중인 부서 코드입니다' }
        }
      }

      // 트리 업데이트
      setTreeData((prev) => updateNodeInTree(nodeId, data, prev))

      return { success: true }
    },
    [treeData]
  )

  /**
   * 노드 삭제
   * FR-004: 노드 삭제 기능
   * BR-001: 루트 노드 삭제 불가
   * BR-004: 하위 노드 연쇄 삭제
   */
  const deleteNode = useCallback(
    (nodeId: string): { success: boolean; error?: string } => {
      // 루트 노드 삭제 불가
      if (utilIsRootNode(nodeId, treeData)) {
        return { success: false, error: '루트 노드는 삭제할 수 없습니다' }
      }

      // 노드 존재 확인
      const node = utilFindNodeById(nodeId, treeData)
      if (!node) {
        return { success: false, error: '노드를 찾을 수 없습니다' }
      }

      // 트리에서 제거 (하위 노드도 함께 제거됨)
      setTreeData((prev) => removeNodeFromTree(nodeId, prev))

      // 선택 해제
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null)
      }

      return { success: true }
    },
    [treeData, selectedNodeId]
  )

  /**
   * 노드 이동
   * FR-005: 드래그 앤 드롭 이동
   * BR-002: 순환 참조 방지
   */
  const moveNode = useCallback(
    (
      nodeId: string,
      newParentId: string,
      _position: number
    ): { success: boolean; error?: string } => {
      // 자기 자신으로 이동 불가
      if (nodeId === newParentId) {
        return { success: false, error: '자기 자신으로 이동할 수 없습니다' }
      }

      // 순환 참조 방지: 자손 노드로 이동 불가
      if (utilIsDescendant(newParentId, nodeId, treeData)) {
        return {
          success: false,
          error: '하위 노드로 이동할 수 없습니다',
        }
      }

      // 노드 존재 확인
      const node = utilFindNodeById(nodeId, treeData)
      if (!node) {
        return { success: false, error: '노드를 찾을 수 없습니다' }
      }

      // 새 부모 존재 확인
      const newParent = utilFindNodeById(newParentId, treeData)
      if (!newParent) {
        return { success: false, error: '대상 노드를 찾을 수 없습니다' }
      }

      // 같은 부모로 이동하는 경우 (위치 변경만)
      if (node.parentId === newParentId) {
        return { success: true } // 현재는 순서 변경 미지원
      }

      // 트리에서 이동
      setTreeData((prev) => moveNodeInTree(nodeId, newParentId, prev))

      // 새 부모 펼침
      setExpandedKeys((prev) =>
        prev.includes(newParentId) ? prev : [...prev, newParentId]
      )

      return { success: true }
    },
    [treeData]
  )

  /**
   * 트리 필터링
   * FR-006: 검색 및 필터링
   */
  const filterTree = useCallback(
    (keyword: string): OrganizationNode[] => {
      if (!keyword.trim()) {
        return treeData
      }
      // 검색 결과에 해당하는 노드만 반환
      const { matchedIds } = searchNodes(treeData, keyword)
      return treeData.filter(
        (node) =>
          matchedIds.includes(node.id) ||
          node.children?.some((child) => matchedIds.includes(child.id))
      )
    },
    [treeData]
  )

  return {
    // 상태
    treeData,
    selectedNode,
    expandedKeys,
    searchKeyword,
    searchCount,

    // 액션
    selectNode,
    setExpandedKeys,
    setSearchKeyword,

    // CRUD
    addNode,
    updateNode,
    deleteNode,
    moveNode,

    // 유틸리티
    filterTree,
    findNodeById,
    isDescendant,
    isRootNode,
  }
}
