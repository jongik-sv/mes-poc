// screens/sample/OrganizationTree/utils.ts
// 조직/부서 트리 유틸리티 함수 (TSK-06-13)

import type { OrganizationNode } from './types'

/**
 * ID로 노드 찾기 (재귀 검색)
 * @param nodeId 찾을 노드 ID
 * @param nodes 검색할 노드 배열
 * @returns 찾은 노드 또는 undefined
 */
export function findNodeById(
  nodeId: string,
  nodes: OrganizationNode[]
): OrganizationNode | undefined {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node
    }
    if (node.children) {
      const found = findNodeById(nodeId, node.children)
      if (found) return found
    }
  }
  return undefined
}

/**
 * 부모 노드 찾기
 * @param nodeId 대상 노드 ID
 * @param nodes 검색할 노드 배열
 * @param parent 현재 부모 (재귀용)
 * @returns 부모 노드 또는 undefined
 */
export function findParentNode(
  nodeId: string,
  nodes: OrganizationNode[],
  parent: OrganizationNode | null = null
): OrganizationNode | undefined {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return parent ?? undefined
    }
    if (node.children) {
      const found = findParentNode(nodeId, node.children, node)
      if (found) return found
    }
  }
  return undefined
}

/**
 * 노드가 다른 노드의 자손인지 확인
 * BR-02: 순환 참조 방지를 위한 유틸
 * @param nodeId 확인할 노드 ID
 * @param potentialAncestorId 잠재적 조상 노드 ID
 * @param nodes 전체 노드 배열
 * @returns 자손 여부
 */
export function isDescendant(
  nodeId: string,
  potentialAncestorId: string,
  nodes: OrganizationNode[]
): boolean {
  const ancestor = findNodeById(potentialAncestorId, nodes)
  if (!ancestor?.children) return false

  const checkChildren = (children: OrganizationNode[]): boolean => {
    for (const child of children) {
      if (child.id === nodeId) return true
      if (child.children && checkChildren(child.children)) return true
    }
    return false
  }

  return checkChildren(ancestor.children)
}

/**
 * 루트 노드인지 확인
 * BR-01: 루트 노드 삭제 불가 검증용
 * @param nodeId 확인할 노드 ID
 * @param nodes 전체 노드 배열
 * @returns 루트 노드 여부
 */
export function isRootNode(
  nodeId: string,
  nodes: OrganizationNode[]
): boolean {
  const node = findNodeById(nodeId, nodes)
  return node?.parentId === null
}

/**
 * 전체 트리에서 코드 중복 확인
 * BR-03: 부서 코드 유일성 검증용
 * @param code 확인할 코드
 * @param nodes 전체 노드 배열
 * @param excludeId 제외할 노드 ID (수정 시 자기 자신 제외)
 * @returns 중복 여부
 */
export function isDuplicateCode(
  code: string,
  nodes: OrganizationNode[],
  excludeId?: string
): boolean {
  const checkNodes = (nodeList: OrganizationNode[]): boolean => {
    for (const node of nodeList) {
      if (node.code === code && node.id !== excludeId) return true
      if (node.children && checkNodes(node.children)) return true
    }
    return false
  }
  return checkNodes(nodes)
}

/**
 * 모든 노드의 키 수집 (펼침/접힘용)
 * @param nodes 노드 배열
 * @returns 모든 노드 ID 배열
 */
export function collectAllKeys(nodes: OrganizationNode[]): string[] {
  const keys: string[] = []

  const collect = (nodeList: OrganizationNode[]) => {
    for (const node of nodeList) {
      keys.push(node.id)
      if (node.children) {
        collect(node.children)
      }
    }
  }

  collect(nodes)
  return keys
}

/**
 * 검색어로 노드 필터링
 * FR-006: 검색 및 필터링
 * @param nodes 노드 배열
 * @param keyword 검색어
 * @returns 매칭 노드 ID 배열과 펼쳐야 할 부모 노드 ID 배열
 */
export function searchNodes(
  nodes: OrganizationNode[],
  keyword: string
): { matchedIds: string[]; expandIds: string[] } {
  const matchedIds: string[] = []
  const expandIds: string[] = []
  const lowerKeyword = keyword.toLowerCase().trim()

  if (!lowerKeyword) {
    return { matchedIds: [], expandIds: [] }
  }

  const search = (
    nodeList: OrganizationNode[],
    parentPath: string[]
  ): boolean => {
    let hasMatch = false

    for (const node of nodeList) {
      const nameMatch = node.name.toLowerCase().includes(lowerKeyword)
      const codeMatch = node.code.toLowerCase().includes(lowerKeyword)

      let childHasMatch = false
      if (node.children) {
        childHasMatch = search(node.children, [...parentPath, node.id])
      }

      if (nameMatch || codeMatch) {
        matchedIds.push(node.id)
        expandIds.push(...parentPath)
        hasMatch = true
      }

      if (childHasMatch) {
        expandIds.push(node.id)
        hasMatch = true
      }
    }

    return hasMatch
  }

  search(nodes, [])

  // 중복 제거
  return {
    matchedIds: [...new Set(matchedIds)],
    expandIds: [...new Set(expandIds)],
  }
}

/**
 * 트리 데이터 딥 복사
 * @param nodes 노드 배열
 * @returns 복사된 노드 배열
 */
export function deepCopyTree(nodes: OrganizationNode[]): OrganizationNode[] {
  return nodes.map((node) => ({
    ...node,
    children: node.children ? deepCopyTree(node.children) : undefined,
  }))
}

/**
 * 새 노드 ID 생성
 * @returns 유니크 ID
 */
export function generateNodeId(): string {
  return `dept-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 노드를 트리에서 제거
 * @param nodeId 제거할 노드 ID
 * @param nodes 노드 배열
 * @returns 새 노드 배열
 */
export function removeNodeFromTree(
  nodeId: string,
  nodes: OrganizationNode[]
): OrganizationNode[] {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => ({
      ...node,
      children: node.children
        ? removeNodeFromTree(nodeId, node.children)
        : undefined,
    }))
}

/**
 * 노드를 트리에 추가
 * @param parentId 부모 노드 ID
 * @param newNode 추가할 노드
 * @param nodes 노드 배열
 * @returns 새 노드 배열
 */
export function addNodeToTree(
  parentId: string,
  newNode: OrganizationNode,
  nodes: OrganizationNode[]
): OrganizationNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newNode],
      }
    }
    if (node.children) {
      return {
        ...node,
        children: addNodeToTree(parentId, newNode, node.children),
      }
    }
    return node
  })
}

/**
 * 노드 정보 업데이트
 * @param nodeId 업데이트할 노드 ID
 * @param updates 업데이트 데이터
 * @param nodes 노드 배열
 * @returns 새 노드 배열
 */
export function updateNodeInTree(
  nodeId: string,
  updates: Partial<OrganizationNode>,
  nodes: OrganizationNode[]
): OrganizationNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return {
        ...node,
        ...updates,
        title: updates.name || node.title,
        updatedAt: new Date().toISOString(),
      }
    }
    if (node.children) {
      return {
        ...node,
        children: updateNodeInTree(nodeId, updates, node.children),
      }
    }
    return node
  })
}

/**
 * 노드를 새 부모 아래로 이동
 * @param nodeId 이동할 노드 ID
 * @param newParentId 새 부모 노드 ID
 * @param nodes 노드 배열
 * @returns 새 노드 배열
 */
export function moveNodeInTree(
  nodeId: string,
  newParentId: string,
  nodes: OrganizationNode[]
): OrganizationNode[] {
  // 이동할 노드 찾기
  const nodeToMove = findNodeById(nodeId, nodes)
  if (!nodeToMove) return nodes

  // 노드 제거
  let newTree = removeNodeFromTree(nodeId, nodes)

  // 새 부모 아래에 추가
  const movedNode: OrganizationNode = {
    ...nodeToMove,
    parentId: newParentId,
    updatedAt: new Date().toISOString(),
  }

  newTree = addNodeToTree(newParentId, movedNode, newTree)

  return newTree
}
