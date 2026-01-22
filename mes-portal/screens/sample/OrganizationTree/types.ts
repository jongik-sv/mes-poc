// screens/sample/OrganizationTree/types.ts
// 조직/부서 트리 샘플 화면 타입 정의 (TSK-06-13)

/**
 * 조직 노드 인터페이스
 */
export interface OrganizationNode {
  id: string
  key: string
  name: string
  title: string
  code: string
  parentId: string | null
  manager?: string
  contact?: string
  headcount?: number
  description?: string
  children?: OrganizationNode[]
  createdAt: string
  updatedAt: string
}

/**
 * 조직 Mock 데이터 구조
 */
export interface OrganizationData {
  organizations: OrganizationNode[]
}

/**
 * OrganizationTree 화면 Props
 */
export interface OrganizationTreeProps {
  /** 마스터/디테일 초기 분할 비율 [마스터%, 디테일%] */
  defaultSplit?: [number, number]
  /** 마스터 패널 최소 너비 (px, 기본: 250) */
  minMasterWidth?: number
  /** 디테일 패널 최소 너비 (px, 기본: 350) */
  minDetailWidth?: number
}

/**
 * 노드 추가/수정 폼 데이터
 */
export interface OrganizationFormData {
  name: string
  code: string
  manager?: string
  contact?: string
  headcount?: number
  description?: string
}

/**
 * 컨텍스트 메뉴 타입
 */
export type ContextMenuAction = 'add' | 'edit' | 'delete'

/**
 * 드래그 앤 드롭 정보
 */
export interface DropInfo {
  node: OrganizationNode
  dragNode: OrganizationNode
  dropPosition: number
  dropToGap: boolean
}

/**
 * 트리 관리 훅 반환 타입
 */
export interface UseOrganizationTreeReturn {
  // 상태
  treeData: OrganizationNode[]
  selectedNode: OrganizationNode | null
  expandedKeys: string[]
  searchKeyword: string
  searchCount: number

  // 액션
  selectNode: (nodeId: string | null) => void
  setExpandedKeys: (keys: string[]) => void
  setSearchKeyword: (keyword: string) => void

  // CRUD
  addNode: (
    parentId: string,
    data: OrganizationFormData
  ) => { success: boolean; error?: string }
  updateNode: (
    nodeId: string,
    data: Partial<OrganizationFormData>
  ) => { success: boolean; error?: string }
  deleteNode: (nodeId: string) => { success: boolean; error?: string }
  moveNode: (
    nodeId: string,
    newParentId: string,
    position: number
  ) => { success: boolean; error?: string }

  // 유틸리티
  filterTree: (keyword: string) => OrganizationNode[]
  findNodeById: (nodeId: string) => OrganizationNode | undefined
  isDescendant: (nodeId: string, potentialAncestorId: string) => boolean
  isRootNode: (nodeId: string) => boolean
}
