/**
 * MDI (Multiple Document Interface) 타입 정의
 * @description TSK-02-01 MDI 상태 관리
 */

/**
 * 탭 인터페이스
 * @description 개별 탭의 정보를 정의
 */
export interface Tab {
  /** 고유 식별자 (예: "work-order-123") */
  id: string;
  /** 탭에 표시할 제목 */
  title: string;
  /** 화면 경로 (예: "/work-order") */
  path: string;
  /** 아이콘 식별자 (예: "FileText") */
  icon?: string;
  /** 닫기 가능 여부 (기본값: true) */
  closable: boolean;
  /** 화면에 전달할 파라미터 */
  params?: Record<string, unknown>;
  /** 탭 새로고침 키 (리마운트 트리거용) - TSK-02-04 */
  refreshKey?: number;
}

/**
 * MDI 상태 인터페이스
 * @description MDI 전체 상태
 */
export interface MDIState {
  /** 열린 탭 목록 */
  tabs: Tab[];
  /** 현재 활성 탭 ID */
  activeTabId: string | null;
}

/**
 * MDI 설정 인터페이스
 */
export interface MDIConfig {
  /** 최대 탭 개수 (기본값: 10) */
  maxTabs?: number;
  /** 경로 접근 권한 검증 콜백 */
  canAccessPath?: (path: string) => boolean;
  /** 최대 탭 초과 시 콜백 */
  onMaxTabsReached?: () => void;
  /** 권한 없음 시 콜백 */
  onAccessDenied?: (path: string) => void;
}

/**
 * MDI Context 타입
 * @description 상태와 액션 함수를 포함
 */
export interface MDIContextType extends MDIState {
  /** 새 탭 열기 (중복 시 활성화) */
  openTab: (tab: Tab) => void;
  /** 탭 닫기 */
  closeTab: (tabId: string) => void;
  /** 모든 탭 닫기 (closable=true인 탭만) */
  closeAllTabs: () => void;
  /** 해당 탭 제외 모든 탭 닫기 */
  closeOtherTabs: (tabId: string) => void;
  /** 해당 탭 오른쪽 탭 모두 닫기 - TSK-02-04 */
  closeRightTabs: (tabId: string) => void;
  /** 탭 새로고침 (리마운트 트리거) - TSK-02-04 */
  refreshTab: (tabId: string) => void;
  /** 활성 탭 변경 */
  setActiveTab: (tabId: string) => void;
  /** 탭 정보 조회 */
  getTab: (tabId: string) => Tab | undefined;
  /** 전체 탭 목록 조회 */
  getTabs: () => Tab[];
  /** 탭 순서 변경 (드래그 앤 드롭) - TSK-02-03 */
  reorderTabs: (activeId: string, overId: string) => void;
}

/**
 * path 검증 유틸리티
 * @description 보안 요구사항 SEC-02
 */
export function isValidPath(path: string): boolean {
  // 상대 경로만 허용
  if (!path.startsWith('/')) return false;
  // 프로토콜 패턴 차단
  if (/^[a-z]+:/i.test(path)) return false;
  return true;
}
