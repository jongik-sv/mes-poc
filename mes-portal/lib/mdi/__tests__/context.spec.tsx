/**
 * MDI Context 단위 테스트
 * @description TSK-02-01 MDI 상태 관리 테스트 명세 (026-test-specification.md 기반)
 */

import { renderHook, act } from '@testing-library/react';
import { MDIProvider, useMDI } from '../context';
import type { Tab } from '../types';

// Mock 탭 데이터
const MOCK_TAB_01: Tab = {
  id: 'tab-1',
  title: '작업 지시',
  path: '/work-order',
  closable: true,
};

const MOCK_TAB_02: Tab = {
  id: 'tab-2',
  title: '실적 입력',
  path: '/production',
  closable: true,
};

const MOCK_TAB_03: Tab = {
  id: 'tab-3',
  title: '품질 검사',
  path: '/quality',
  closable: true,
};

const MOCK_TAB_HOME: Tab = {
  id: 'home',
  title: '홈',
  path: '/',
  closable: false,
};

describe('MDIContext', () => {
  // UT-001: 초기 상태 확인
  it('초기 상태는 빈 탭 목록과 null activeTabId', () => {
    const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

    expect(result.current.tabs).toEqual([]);
    expect(result.current.activeTabId).toBeNull();
  });

  describe('getTabs', () => {
    // UT-002: getTabs 호출
    it('현재 탭 목록 반환', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
        result.current.openTab(MOCK_TAB_02);
      });

      const tabs = result.current.getTabs();
      expect(tabs).toHaveLength(2);
      expect(tabs[0].id).toBe('tab-1');
      expect(tabs[1].id).toBe('tab-2');
    });
  });

  describe('openTab', () => {
    // UT-003: 새 탭 열기
    it('새 탭이 목록에 추가되고 활성화됨', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });

      expect(result.current.tabs).toHaveLength(1);
      expect(result.current.tabs[0].id).toBe('tab-1');
      expect(result.current.activeTabId).toBe('tab-1');
    });

    // UT-004: 중복 탭 열기
    it('이미 열린 탭은 새로 추가하지 않고 활성화만', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
        result.current.openTab(MOCK_TAB_02);
        result.current.openTab(MOCK_TAB_01); // 중복 시도
      });

      expect(result.current.tabs).toHaveLength(2);
      expect(result.current.activeTabId).toBe('tab-1'); // 기존 탭 활성화
    });

    // UT-009: 최대 탭 초과
    it('최대 탭 개수 초과 시 추가 안됨', () => {
      const onMaxTabsReached = vi.fn();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MDIProvider maxTabs={3} onMaxTabsReached={onMaxTabsReached}>
          {children}
        </MDIProvider>
      );

      const { result } = renderHook(() => useMDI(), { wrapper });

      // 탭을 하나씩 열어서 상태 업데이트가 반영되도록 함
      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_02);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_03);
      });
      act(() => {
        result.current.openTab({ ...MOCK_TAB_HOME, id: 'tab-4', closable: true }); // 4번째 시도
      });

      expect(result.current.tabs).toHaveLength(3);
      expect(onMaxTabsReached).toHaveBeenCalled();
    });

    // 잘못된 경로 형식 검증
    it('잘못된 경로 형식은 탭 열기 거부', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab({
          id: 'invalid',
          title: 'Invalid',
          path: 'http://malicious.com',
          closable: true,
        });
      });

      expect(result.current.tabs).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('closeTab', () => {
    // UT-005: 비활성 탭 닫기
    it('비활성 탭을 닫으면 목록에서 제거', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
        result.current.openTab(MOCK_TAB_02); // tab-2가 활성화
      });

      expect(result.current.activeTabId).toBe('tab-2');

      act(() => {
        result.current.closeTab('tab-1'); // 비활성 탭 닫기
      });

      expect(result.current.tabs).toHaveLength(1);
      expect(result.current.activeTabId).toBe('tab-2'); // 활성 탭 변경 없음
    });

    // UT-006: 활성 탭 닫기 (오른쪽 탭 존재)
    it('활성 탭 닫기 시 오른쪽 탭 활성화', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      // 탭을 순차적으로 열어서 상태가 올바르게 반영되도록 함
      act(() => {
        result.current.openTab(MOCK_TAB_01); // index 0
      });
      act(() => {
        result.current.openTab(MOCK_TAB_02); // index 1
      });
      act(() => {
        result.current.openTab(MOCK_TAB_03); // index 2
      });
      act(() => {
        result.current.setActiveTab('tab-2'); // 중간 탭 활성화
      });

      expect(result.current.activeTabId).toBe('tab-2');

      act(() => {
        result.current.closeTab('tab-2'); // 활성 탭 닫기
      });

      // 오른쪽 탭(tab-3)이 활성화됨
      expect(result.current.activeTabId).toBe('tab-3');
    });

    // UT-007: 활성 탭 닫기 (왼쪽만 존재)
    it('활성 탭 닫기 시 왼쪽 탭 활성화 (오른쪽 없을 때)', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
        result.current.openTab(MOCK_TAB_02);
      });

      expect(result.current.activeTabId).toBe('tab-2'); // 마지막 탭 활성

      act(() => {
        result.current.closeTab('tab-2'); // 활성 탭(마지막) 닫기
      });

      // 왼쪽 탭(tab-1)이 활성화됨
      expect(result.current.activeTabId).toBe('tab-1');
    });

    // UT-010: closable=false 탭 닫기
    it('closable=false 탭은 닫히지 않음', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_HOME);
        result.current.openTab(MOCK_TAB_01);
      });

      act(() => {
        result.current.closeTab('home'); // closable=false
      });

      expect(result.current.tabs).toHaveLength(2);
      expect(result.current.tabs.find((t) => t.id === 'home')).toBeDefined();
    });

    // UT-011: 마지막 탭 닫기
    it('마지막 탭 닫기 시 activeTabId가 null이 됨', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });

      expect(result.current.tabs).toHaveLength(1);
      expect(result.current.activeTabId).toBe('tab-1');

      act(() => {
        result.current.closeTab('tab-1');
      });

      expect(result.current.tabs).toHaveLength(0);
      expect(result.current.activeTabId).toBeNull();
    });
  });

  describe('closeAllTabs', () => {
    // UT-012: 모든 탭 닫기
    it('closable=true인 모든 탭이 닫힘', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_HOME); // closable: false
        result.current.openTab(MOCK_TAB_01); // closable: true
        result.current.openTab(MOCK_TAB_02); // closable: true
      });

      expect(result.current.tabs).toHaveLength(3);

      act(() => {
        result.current.closeAllTabs();
      });

      expect(result.current.tabs).toHaveLength(1);
      expect(result.current.tabs[0].id).toBe('home');
      expect(result.current.activeTabId).toBe('home');
    });

    it('모든 탭이 closable=true면 전부 닫힘', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
        result.current.openTab(MOCK_TAB_02);
      });

      act(() => {
        result.current.closeAllTabs();
      });

      expect(result.current.tabs).toHaveLength(0);
      expect(result.current.activeTabId).toBeNull();
    });
  });

  describe('closeOtherTabs', () => {
    // UT-013: 다른 탭 닫기
    it('지정 탭 제외 다른 탭이 닫힘', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_HOME); // closable: false
        result.current.openTab(MOCK_TAB_01); // closable: true
        result.current.openTab(MOCK_TAB_02); // closable: true
      });

      act(() => {
        result.current.closeOtherTabs('tab-2');
      });

      // home (closable=false) + tab-2 남음
      expect(result.current.tabs).toHaveLength(2);
      expect(result.current.tabs.map((t) => t.id)).toContain('home');
      expect(result.current.tabs.map((t) => t.id)).toContain('tab-2');
      expect(result.current.activeTabId).toBe('tab-2');
    });
  });

  describe('setActiveTab', () => {
    // UT-008: 탭 전환
    it('탭 전환 시 activeTabId 변경', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
        result.current.openTab(MOCK_TAB_02);
      });

      expect(result.current.activeTabId).toBe('tab-2');

      act(() => {
        result.current.setActiveTab('tab-1');
      });

      expect(result.current.activeTabId).toBe('tab-1');
    });

    it('존재하지 않는 탭 ID는 무시', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });

      act(() => {
        result.current.setActiveTab('non-existent');
      });

      expect(result.current.activeTabId).toBe('tab-1'); // 변경 없음
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getTab', () => {
    it('탭 ID로 탭 정보 조회', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
        result.current.openTab(MOCK_TAB_02);
      });

      const tab = result.current.getTab('tab-1');
      expect(tab).toBeDefined();
      expect(tab?.title).toBe('작업 지시');
    });

    it('존재하지 않는 탭 ID는 undefined 반환', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      const tab = result.current.getTab('non-existent');
      expect(tab).toBeUndefined();
    });
  });

  // TSK-02-04: 탭 컨텍스트 메뉴 - 신규 테스트 추가
  describe('closeRightTabs', () => {
    // UT-004: 오른쪽 탭 모두 닫기
    it('지정 탭 오른쪽 closable 탭이 닫힌다', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01); // tab-1
      });
      act(() => {
        result.current.openTab(MOCK_TAB_02); // tab-2
      });
      act(() => {
        result.current.openTab(MOCK_TAB_03); // tab-3
      });
      act(() => {
        result.current.openTab({
          id: 'tab-4',
          title: '설비 관리',
          path: '/equipment',
          closable: true,
        });
      });

      act(() => {
        result.current.closeRightTabs('tab-2');
      });

      expect(result.current.tabs.map((t) => t.id)).toEqual(['tab-1', 'tab-2']);
    });

    it('closable=false인 오른쪽 탭은 유지된다', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_02);
      });
      act(() => {
        result.current.openTab({
          id: 'pinned',
          title: '고정 탭',
          path: '/pinned',
          closable: false,
        });
      });
      act(() => {
        result.current.openTab(MOCK_TAB_03);
      });

      act(() => {
        result.current.closeRightTabs('tab-1');
      });

      // tab-2는 닫히고, pinned(closable=false)와 tab-3은 유지
      // 실제로는 closable=false만 유지됨
      expect(result.current.tabs.map((t) => t.id)).toContain('tab-1');
      expect(result.current.tabs.map((t) => t.id)).toContain('pinned');
    });

    it('가장 오른쪽 탭에서 호출 시 아무 변화 없음', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_02);
      });

      act(() => {
        result.current.closeRightTabs('tab-2');
      });

      expect(result.current.tabs.map((t) => t.id)).toEqual(['tab-1', 'tab-2']);
    });

    it('활성 탭이 닫히면 지정 탭 또는 인접 탭 활성화', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_02);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_03);
      });

      // tab-3 활성화
      act(() => {
        result.current.setActiveTab('tab-3');
      });

      expect(result.current.activeTabId).toBe('tab-3');

      // tab-1에서 오른쪽 탭 닫기 → tab-2, tab-3 닫힘
      act(() => {
        result.current.closeRightTabs('tab-1');
      });

      // 활성 탭이 닫혔으므로 tab-1 활성화
      expect(result.current.activeTabId).toBe('tab-1');
    });
  });

  describe('refreshTab', () => {
    // UT-005: 새로고침
    it('탭 refreshKey가 변경된다', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });

      const initialKey = result.current.getTab('tab-1')?.refreshKey;

      act(() => {
        result.current.refreshTab('tab-1');
      });

      const newKey = result.current.getTab('tab-1')?.refreshKey;
      expect(newKey).toBeDefined();
      expect(newKey).not.toBe(initialKey);
    });

    it('존재하지 않는 탭 refreshTab 호출 시 아무 변화 없음', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });

      act(() => {
        result.current.refreshTab('non-existent');
      });

      expect(result.current.tabs).toHaveLength(1);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('다른 탭은 영향받지 않는다', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_02);
      });

      const tab2KeyBefore = result.current.getTab('tab-2')?.refreshKey;

      act(() => {
        result.current.refreshTab('tab-1');
      });

      const tab2KeyAfter = result.current.getTab('tab-2')?.refreshKey;
      expect(tab2KeyAfter).toBe(tab2KeyBefore);
    });
  });

  // TSK-02-03: 탭 드래그 앤 드롭 - reorderTabs 테스트
  describe('reorderTabs', () => {
    // UT-003: 탭 순서 변경
    it('탭 순서를 올바르게 변경한다', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_02);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_03);
      });

      // 초기 순서: [tab-1, tab-2, tab-3]
      expect(result.current.tabs.map((t) => t.id)).toEqual(['tab-1', 'tab-2', 'tab-3']);

      // tab-3을 tab-1 위치로 이동
      act(() => {
        result.current.reorderTabs('tab-3', 'tab-1');
      });

      // 결과: [tab-3, tab-1, tab-2]
      expect(result.current.tabs.map((t) => t.id)).toEqual(['tab-3', 'tab-1', 'tab-2']);
    });

    // UT-005: 순서 변경 후 유지
    it('탭 전환 후에도 순서가 유지된다 (BR-001)', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_02);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_03);
      });

      // 순서 변경
      act(() => {
        result.current.reorderTabs('tab-3', 'tab-1');
      });

      const orderAfterReorder = result.current.tabs.map((t) => t.id);

      // 탭 전환
      act(() => {
        result.current.setActiveTab('tab-2');
      });

      // 순서 유지 확인
      expect(result.current.tabs.map((t) => t.id)).toEqual(orderAfterReorder);
    });

    // UT-006: 동일 위치 드롭
    it('동일 위치에 드롭하면 순서가 변경되지 않는다 (BR-002)', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_02);
      });

      const tabsBefore = result.current.tabs;

      // 같은 위치에 드롭
      act(() => {
        result.current.reorderTabs('tab-1', 'tab-1');
      });

      // 같은 참조 유지 (변경 없음)
      expect(result.current.tabs).toBe(tabsBefore);
    });

    // UT-007: 존재하지 않는 탭 ID
    it('존재하지 않는 탭 ID로 호출하면 아무 변화 없음', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_02);
      });

      const orderBefore = result.current.tabs.map((t) => t.id);

      // 존재하지 않는 탭 ID
      act(() => {
        result.current.reorderTabs('non-existent', 'tab-1');
      });

      expect(result.current.tabs.map((t) => t.id)).toEqual(orderBefore);

      // 드롭 대상도 존재하지 않는 경우
      act(() => {
        result.current.reorderTabs('tab-1', 'non-existent');
      });

      expect(result.current.tabs.map((t) => t.id)).toEqual(orderBefore);
    });

    // UT-001: 드래그 시작 - 탭 순서 변경 후 활성 탭 유지
    it('탭 순서 변경 후 활성 탭이 유지된다', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_02);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_03);
      });

      // tab-2 활성화
      act(() => {
        result.current.setActiveTab('tab-2');
      });

      expect(result.current.activeTabId).toBe('tab-2');

      // 순서 변경
      act(() => {
        result.current.reorderTabs('tab-3', 'tab-1');
      });

      // 활성 탭 유지
      expect(result.current.activeTabId).toBe('tab-2');
    });

    // 앞에서 뒤로 이동
    it('탭을 앞에서 뒤로 이동한다', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_02);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_03);
      });

      // 초기: [tab-1, tab-2, tab-3]
      // tab-1을 tab-3 위치로 이동
      act(() => {
        result.current.reorderTabs('tab-1', 'tab-3');
      });

      // 결과: [tab-2, tab-3, tab-1]
      expect(result.current.tabs.map((t) => t.id)).toEqual(['tab-2', 'tab-3', 'tab-1']);
    });

    // 중간 탭 이동
    it('중간 탭을 맨 앞으로 이동한다', () => {
      const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

      act(() => {
        result.current.openTab(MOCK_TAB_01);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_02);
      });
      act(() => {
        result.current.openTab(MOCK_TAB_03);
      });

      // 초기: [tab-1, tab-2, tab-3]
      // tab-2을 tab-1 위치로 이동
      act(() => {
        result.current.reorderTabs('tab-2', 'tab-1');
      });

      // 결과: [tab-2, tab-1, tab-3]
      expect(result.current.tabs.map((t) => t.id)).toEqual(['tab-2', 'tab-1', 'tab-3']);
    });
  });
});
