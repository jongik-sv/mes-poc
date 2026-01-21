/**
 * MDI (Multiple Document Interface) 모듈 내보내기
 * @description TSK-02-01 MDI 상태 관리
 */

export { MDIProvider, useMDI } from './context';
export type { Tab, MDIState, MDIContextType, MDIConfig } from './types';
export { isValidPath } from './types';
