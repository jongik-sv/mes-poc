'use client';

/**
 * MDI (Multiple Document Interface) Context
 * @description TSK-02-01 MDI 상태 관리
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Tab, MDIState, MDIContextType, MDIConfig } from './types';
import { isValidPath } from './types';

// 기본 설정값
const DEFAULT_MAX_TABS = 10;

// 액션 타입
type MDIAction =
  | { type: 'OPEN_TAB'; payload: Tab }
  | { type: 'CLOSE_TAB'; payload: string }
  | { type: 'CLOSE_ALL_TABS' }
  | { type: 'CLOSE_OTHER_TABS'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string };

// 초기 상태
const initialState: MDIState = {
  tabs: [],
  activeTabId: null,
};

/**
 * MDI Reducer
 */
function mdiReducer(state: MDIState, action: MDIAction): MDIState {
  switch (action.type) {
    case 'OPEN_TAB': {
      const existingTab = state.tabs.find((tab) => tab.id === action.payload.id);
      if (existingTab) {
        // 이미 열린 탭이면 활성화만
        return {
          ...state,
          activeTabId: action.payload.id,
        };
      }
      // 새 탭 추가
      return {
        tabs: [...state.tabs, action.payload],
        activeTabId: action.payload.id,
      };
    }

    case 'CLOSE_TAB': {
      const tabToClose = state.tabs.find((tab) => tab.id === action.payload);
      if (!tabToClose || !tabToClose.closable) {
        return state;
      }

      const tabIndex = state.tabs.findIndex((tab) => tab.id === action.payload);
      const newTabs = state.tabs.filter((tab) => tab.id !== action.payload);

      // 활성 탭 결정
      let newActiveTabId: string | null = state.activeTabId;
      if (state.activeTabId === action.payload) {
        // 닫는 탭이 활성 탭인 경우
        if (newTabs.length === 0) {
          newActiveTabId = null;
        } else if (tabIndex < newTabs.length) {
          // 오른쪽 탭이 존재하면 오른쪽 탭 활성화
          newActiveTabId = newTabs[tabIndex].id;
        } else {
          // 오른쪽 탭이 없으면 왼쪽 탭 활성화
          newActiveTabId = newTabs[newTabs.length - 1].id;
        }
      }

      return {
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    }

    case 'CLOSE_ALL_TABS': {
      const remainingTabs = state.tabs.filter((tab) => !tab.closable);
      return {
        tabs: remainingTabs,
        activeTabId: remainingTabs.length > 0 ? remainingTabs[0].id : null,
      };
    }

    case 'CLOSE_OTHER_TABS': {
      const targetTab = state.tabs.find((tab) => tab.id === action.payload);
      if (!targetTab) return state;

      // closable=false 탭과 지정된 탭만 유지
      const remainingTabs = state.tabs.filter(
        (tab) => !tab.closable || tab.id === action.payload
      );

      return {
        tabs: remainingTabs,
        activeTabId: action.payload,
      };
    }

    case 'SET_ACTIVE_TAB': {
      const tabExists = state.tabs.some((tab) => tab.id === action.payload);
      if (!tabExists) {
        return state;
      }
      return {
        ...state,
        activeTabId: action.payload,
      };
    }

    default:
      return state;
  }
}

// Context 생성
const MDIContext = createContext<MDIContextType | null>(null);

// Provider Props
interface MDIProviderProps extends MDIConfig {
  children: ReactNode;
}

/**
 * MDI Provider
 */
export function MDIProvider({
  children,
  maxTabs = DEFAULT_MAX_TABS,
  canAccessPath = () => true,
  onMaxTabsReached,
  onAccessDenied,
}: MDIProviderProps) {
  const [state, dispatch] = useReducer(mdiReducer, initialState);

  const openTab = useCallback(
    (tab: Tab) => {
      // SEC-02: path 검증
      if (!isValidPath(tab.path)) {
        console.warn(`[MDI] 잘못된 경로 형식: ${tab.path}`);
        return;
      }

      // SEC-03: 권한 검증
      if (!canAccessPath(tab.path)) {
        console.warn(`[MDI] 접근 권한 없음: ${tab.path}`);
        onAccessDenied?.(tab.path);
        return;
      }

      // 이미 열린 탭인지 확인
      const existingTab = state.tabs.find((t) => t.id === tab.id);
      if (existingTab) {
        dispatch({ type: 'OPEN_TAB', payload: tab });
        return;
      }

      // BR-02: 최대 탭 개수 제한
      if (state.tabs.length >= maxTabs) {
        console.warn(`[MDI] 최대 탭 개수(${maxTabs}) 도달`);
        onMaxTabsReached?.();
        return;
      }

      dispatch({ type: 'OPEN_TAB', payload: tab });
    },
    [state.tabs, maxTabs, canAccessPath, onAccessDenied, onMaxTabsReached]
  );

  const closeTab = useCallback((tabId: string) => {
    dispatch({ type: 'CLOSE_TAB', payload: tabId });
  }, []);

  const closeAllTabs = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL_TABS' });
  }, []);

  const closeOtherTabs = useCallback((tabId: string) => {
    dispatch({ type: 'CLOSE_OTHER_TABS', payload: tabId });
  }, []);

  const setActiveTab = useCallback(
    (tabId: string) => {
      const tabExists = state.tabs.some((tab) => tab.id === tabId);
      if (!tabExists) {
        console.warn(`[MDI] 존재하지 않는 탭: ${tabId}`);
        return;
      }
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
    },
    [state.tabs]
  );

  const getTab = useCallback(
    (tabId: string) => {
      return state.tabs.find((tab) => tab.id === tabId);
    },
    [state.tabs]
  );

  const getTabs = useCallback(() => {
    return state.tabs;
  }, [state.tabs]);

  const value = useMemo<MDIContextType>(
    () => ({
      tabs: state.tabs,
      activeTabId: state.activeTabId,
      openTab,
      closeTab,
      closeAllTabs,
      closeOtherTabs,
      setActiveTab,
      getTab,
      getTabs,
    }),
    [
      state.tabs,
      state.activeTabId,
      openTab,
      closeTab,
      closeAllTabs,
      closeOtherTabs,
      setActiveTab,
      getTab,
      getTabs,
    ]
  );

  return <MDIContext.Provider value={value}>{children}</MDIContext.Provider>;
}

/**
 * useMDI 훅
 * @description MDI Context 사용을 위한 커스텀 훅
 * @throws MDIProvider 외부에서 사용 시 에러
 */
export function useMDI(): MDIContextType {
  const context = useContext(MDIContext);
  if (!context) {
    throw new Error('useMDI must be used within an MDIProvider');
  }
  return context;
}
