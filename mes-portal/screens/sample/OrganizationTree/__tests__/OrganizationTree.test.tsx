// screens/sample/OrganizationTree/__tests__/OrganizationTree.test.tsx
// 조직/부서 트리 단위 테스트 (TSK-06-13)

import { describe, it, expect, beforeEach } from 'vitest'
import type { OrganizationNode, OrganizationFormData } from '../types'
import {
  findNodeById,
  findParentNode,
  isDescendant,
  isRootNode,
  isDuplicateCode,
  collectAllKeys,
  searchNodes,
  deepCopyTree,
  generateNodeId,
  removeNodeFromTree,
  addNodeToTree,
  updateNodeInTree,
  moveNodeInTree,
} from '../utils'

// 테스트용 Mock 데이터
const createMockTree = (): OrganizationNode[] => [
  {
    id: 'root',
    key: 'root',
    name: '주식회사 A',
    title: '주식회사 A',
    code: 'ROOT',
    parentId: null,
    manager: '홍길동',
    contact: '02-1234-5678',
    headcount: 150,
    description: '종합 제조 기업',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
    children: [
      {
        id: 'dept-1',
        key: 'dept-1',
        name: '경영지원본부',
        title: '경영지원본부',
        code: 'MGMT',
        parentId: 'root',
        manager: '김영수',
        contact: '02-1234-5679',
        headcount: 30,
        description: '경영 지원 업무',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2026-01-08T00:00:00Z',
        children: [
          {
            id: 'dept-hr',
            key: 'dept-hr',
            name: '인사팀',
            title: '인사팀',
            code: 'HR',
            parentId: 'dept-1',
            manager: '박지영',
            contact: '02-1234-5681',
            headcount: 8,
            description: '인사 관리',
            createdAt: '2024-02-01T00:00:00Z',
            updatedAt: '2026-01-05T00:00:00Z',
          },
          {
            id: 'dept-finance',
            key: 'dept-finance',
            name: '재무팀',
            title: '재무팀',
            code: 'FIN',
            parentId: 'dept-1',
            manager: '이철호',
            contact: '02-1234-5682',
            headcount: 10,
            description: '재무 관리',
            createdAt: '2024-02-01T00:00:00Z',
            updatedAt: '2026-01-04T00:00:00Z',
          },
        ],
      },
      {
        id: 'dept-2',
        key: 'dept-2',
        name: '생산본부',
        title: '생산본부',
        code: 'PROD',
        parentId: 'root',
        manager: '정대현',
        contact: '02-1234-5690',
        headcount: 80,
        description: '제품 생산',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2026-01-07T00:00:00Z',
        children: [
          {
            id: 'dept-leaf',
            key: 'dept-leaf',
            name: '생산1팀',
            title: '생산1팀',
            code: 'P1',
            parentId: 'dept-2',
            manager: '이철수',
            contact: '02-1234-5691',
            headcount: 25,
            description: '제품 A 생산',
            createdAt: '2024-03-01T00:00:00Z',
            updatedAt: '2026-01-10T00:00:00Z',
          },
        ],
      },
    ],
  },
]

describe('OrganizationTree Utils', () => {
  let mockTree: OrganizationNode[]

  beforeEach(() => {
    mockTree = createMockTree()
  })

  describe('findNodeById', () => {
    it('should find root node by id', () => {
      const result = findNodeById('root', mockTree)
      expect(result).toBeDefined()
      expect(result?.name).toBe('주식회사 A')
    })

    it('should find nested node by id', () => {
      const result = findNodeById('dept-hr', mockTree)
      expect(result).toBeDefined()
      expect(result?.name).toBe('인사팀')
    })

    it('should return undefined for non-existent id', () => {
      const result = findNodeById('non-existent', mockTree)
      expect(result).toBeUndefined()
    })
  })

  describe('findParentNode', () => {
    it('should return undefined for root node', () => {
      const result = findParentNode('root', mockTree)
      expect(result).toBeUndefined()
    })

    it('should find parent of first level node', () => {
      const result = findParentNode('dept-1', mockTree)
      expect(result?.id).toBe('root')
    })

    it('should find parent of nested node', () => {
      const result = findParentNode('dept-hr', mockTree)
      expect(result?.id).toBe('dept-1')
    })
  })

  describe('isDescendant', () => {
    it('should return true if node is descendant', () => {
      // dept-hr is descendant of root
      const result = isDescendant('dept-hr', 'root', mockTree)
      expect(result).toBe(true)
    })

    it('should return false if node is not descendant', () => {
      // dept-2 is not descendant of dept-1
      const result = isDescendant('dept-2', 'dept-1', mockTree)
      expect(result).toBe(false)
    })

    it('should return false for same node', () => {
      const result = isDescendant('dept-1', 'dept-1', mockTree)
      expect(result).toBe(false)
    })
  })

  describe('isRootNode', () => {
    it('should return true for root node', () => {
      const result = isRootNode('root', mockTree)
      expect(result).toBe(true)
    })

    it('should return false for non-root node', () => {
      const result = isRootNode('dept-1', mockTree)
      expect(result).toBe(false)
    })
  })

  describe('isDuplicateCode', () => {
    it('should return true for duplicate code', () => {
      const result = isDuplicateCode('HR', mockTree)
      expect(result).toBe(true)
    })

    it('should return false for unique code', () => {
      const result = isDuplicateCode('NEW', mockTree)
      expect(result).toBe(false)
    })

    it('should exclude specified node id when checking', () => {
      // 수정 시 자기 자신의 코드는 중복이 아님
      const result = isDuplicateCode('HR', mockTree, 'dept-hr')
      expect(result).toBe(false)
    })
  })

  describe('collectAllKeys', () => {
    it('should collect all node ids', () => {
      const keys = collectAllKeys(mockTree)
      expect(keys).toContain('root')
      expect(keys).toContain('dept-1')
      expect(keys).toContain('dept-hr')
      expect(keys).toContain('dept-finance')
      expect(keys).toContain('dept-2')
      expect(keys).toContain('dept-leaf')
      expect(keys.length).toBe(6)
    })
  })

  describe('searchNodes', () => {
    it('should find nodes matching keyword', () => {
      const result = searchNodes(mockTree, '인사')
      expect(result.matchedIds).toContain('dept-hr')
    })

    it('should find nodes by code', () => {
      const result = searchNodes(mockTree, 'HR')
      expect(result.matchedIds).toContain('dept-hr')
    })

    it('should return empty for no matches', () => {
      const result = searchNodes(mockTree, 'ZZZZZ')
      expect(result.matchedIds).toHaveLength(0)
    })

    it('should return expandIds for parent nodes', () => {
      const result = searchNodes(mockTree, '인사')
      expect(result.expandIds).toContain('root')
      expect(result.expandIds).toContain('dept-1')
    })
  })

  describe('deepCopyTree', () => {
    it('should create a deep copy', () => {
      const copy = deepCopyTree(mockTree)
      expect(copy).not.toBe(mockTree)
      expect(copy[0]).not.toBe(mockTree[0])
      expect(copy[0].name).toBe(mockTree[0].name)
    })

    it('should not affect original when modifying copy', () => {
      const copy = deepCopyTree(mockTree)
      copy[0].name = 'Modified'
      expect(mockTree[0].name).toBe('주식회사 A')
    })
  })

  describe('generateNodeId', () => {
    it('should generate unique ids', () => {
      const id1 = generateNodeId()
      const id2 = generateNodeId()
      expect(id1).not.toBe(id2)
    })

    it('should start with dept-', () => {
      const id = generateNodeId()
      expect(id).toMatch(/^dept-/)
    })
  })
})

describe('Tree CRUD Operations', () => {
  let mockTree: OrganizationNode[]

  beforeEach(() => {
    mockTree = createMockTree()
  })

  describe('addNodeToTree', () => {
    it('should add node to parent (UT-001)', () => {
      const newNode: OrganizationNode = {
        id: 'new-dept',
        key: 'new-dept',
        name: '새부서',
        title: '새부서',
        code: 'NEW',
        parentId: 'dept-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const result = addNodeToTree('dept-1', newNode, mockTree)
      const parent = findNodeById('dept-1', result)

      expect(parent?.children?.some((c) => c.id === 'new-dept')).toBe(true)
    })
  })

  describe('updateNodeInTree', () => {
    it('should update node data (UT-003)', () => {
      const updates = { name: '수정된부서명', manager: '김철수' }
      const result = updateNodeInTree('dept-1', updates, mockTree)
      const updated = findNodeById('dept-1', result)

      expect(updated?.name).toBe('수정된부서명')
      expect(updated?.manager).toBe('김철수')
      expect(updated?.title).toBe('수정된부서명')
    })
  })

  describe('removeNodeFromTree', () => {
    it('should delete leaf node (UT-004)', () => {
      const result = removeNodeFromTree('dept-leaf', mockTree)
      const deleted = findNodeById('dept-leaf', result)

      expect(deleted).toBeUndefined()
    })

    it('should delete node with all children (UT-009)', () => {
      const result = removeNodeFromTree('dept-1', mockTree)

      expect(findNodeById('dept-1', result)).toBeUndefined()
      expect(findNodeById('dept-hr', result)).toBeUndefined()
      expect(findNodeById('dept-finance', result)).toBeUndefined()
    })
  })

  describe('moveNodeInTree', () => {
    it('should move node to new parent (UT-005)', () => {
      // dept-leaf (under dept-2) -> dept-1
      const result = moveNodeInTree('dept-leaf', 'dept-1', mockTree)

      const movedNode = findNodeById('dept-leaf', result)
      expect(movedNode?.parentId).toBe('dept-1')

      const oldParent = findNodeById('dept-2', result)
      expect(oldParent?.children?.some((c) => c.id === 'dept-leaf')).toBe(false)

      const newParent = findNodeById('dept-1', result)
      expect(newParent?.children?.some((c) => c.id === 'dept-leaf')).toBe(true)
    })
  })
})

describe('Business Rules', () => {
  let mockTree: OrganizationNode[]

  beforeEach(() => {
    mockTree = createMockTree()
  })

  describe('BR-001: Root node deletion prevention', () => {
    it('should identify root node (UT-007)', () => {
      expect(isRootNode('root', mockTree)).toBe(true)
      expect(isRootNode('dept-1', mockTree)).toBe(false)
    })
  })

  describe('BR-002: Circular move prevention', () => {
    it('should detect circular move (UT-008)', () => {
      // dept-1 is ancestor of dept-hr
      // Moving dept-1 under dept-hr would create a cycle
      const isCircular = isDescendant('dept-hr', 'dept-1', mockTree)
      expect(isCircular).toBe(true)
    })

    it('should allow valid move', () => {
      // dept-2 is not descendant of dept-1
      const isCircular = isDescendant('dept-2', 'dept-1', mockTree)
      expect(isCircular).toBe(false)
    })
  })

  describe('BR-003: Unique code validation', () => {
    it('should detect duplicate code (UT-002)', () => {
      expect(isDuplicateCode('HR', mockTree)).toBe(true)
      expect(isDuplicateCode('UNIQUE', mockTree)).toBe(false)
    })
  })

  describe('BR-004: Cascade delete', () => {
    it('should delete all descendants (UT-009)', () => {
      const result = removeNodeFromTree('dept-1', mockTree)

      // 부모와 모든 하위 노드 삭제됨
      expect(findNodeById('dept-1', result)).toBeUndefined()
      expect(findNodeById('dept-hr', result)).toBeUndefined()
      expect(findNodeById('dept-finance', result)).toBeUndefined()

      // 다른 브랜치는 영향 없음
      expect(findNodeById('dept-2', result)).toBeDefined()
      expect(findNodeById('dept-leaf', result)).toBeDefined()
    })
  })
})

describe('Search and Filter (FR-006)', () => {
  let mockTree: OrganizationNode[]

  beforeEach(() => {
    mockTree = createMockTree()
  })

  it('should filter by search term (UT-006)', () => {
    const result = searchNodes(mockTree, '인사')
    expect(result.matchedIds).toContain('dept-hr')
    expect(result.matchedIds.length).toBe(1)
  })

  it('should return empty array for no matches', () => {
    const result = searchNodes(mockTree, 'ZZZZZ')
    expect(result.matchedIds).toHaveLength(0)
  })

  it('should be case insensitive', () => {
    const result = searchNodes(mockTree, 'hr')
    expect(result.matchedIds).toContain('dept-hr')
  })

  it('should search in code field', () => {
    const result = searchNodes(mockTree, 'MGMT')
    expect(result.matchedIds).toContain('dept-1')
  })
})
