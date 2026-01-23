/**
 * Screen Registry
 * @description TSK-02-05 MDI 컨텐츠 영역 - 화면-컴포넌트 매핑
 * @security OWASP A03:2021 Injection 대응, A08:2021 Software and Data Integrity 대응
 */

import type { ComponentType } from 'react';

/**
 * 화면 컴포넌트 로더 타입
 */
type ScreenLoader = () => Promise<{ default: ComponentType }>;

/**
 * 화면 경로 → 컴포넌트 매핑 레지스트리
 * @description Object.freeze로 런타임 조작 방지 (BR-07)
 */
export const screenRegistry: Readonly<Record<string, ScreenLoader>> = Object.freeze({
  // 홈
  '/': () => import('@/screens/home/page'),

  // 대시보드
  '/dashboard': () => import('@/screens/dashboard/Dashboard'),

  // 생산
  '/production/work-order': () =>
    import('@/screens/common/PlaceholderScreen').then((m) => ({ default: m.WorkOrderScreen })),
  '/production/status': () =>
    import('@/screens/common/PlaceholderScreen').then((m) => ({ default: m.ProductionStatusScreen })),
  '/production/result': () =>
    import('@/screens/common/PlaceholderScreen').then((m) => ({ default: m.ProductionResultScreen })),

  // 품질
  '/quality/inspection': () =>
    import('@/screens/common/PlaceholderScreen').then((m) => ({ default: m.InspectionScreen })),
  '/quality/defect': () =>
    import('@/screens/common/PlaceholderScreen').then((m) => ({ default: m.DefectScreen })),

  // 설비
  '/equipment/status': () =>
    import('@/screens/common/PlaceholderScreen').then((m) => ({ default: m.EquipmentStatusScreen })),
  '/equipment/maintenance': () =>
    import('@/screens/common/PlaceholderScreen').then((m) => ({ default: m.MaintenanceScreen })),

  // 설정 > 사용자
  '/settings/user/list': () =>
    import('@/screens/common/PlaceholderScreen').then((m) => ({ default: m.UserListScreen })),
  '/settings/user/role': () =>
    import('@/screens/common/PlaceholderScreen').then((m) => ({ default: m.RoleScreen })),

  // 설정 > 시스템
  '/settings/system/menu': () =>
    import('@/screens/common/PlaceholderScreen').then((m) => ({ default: m.MenuManageScreen })),
  '/settings/system/code': () =>
    import('@/screens/common/PlaceholderScreen').then((m) => ({ default: m.CodeManageScreen })),

  // 샘플 화면들 (개발용)
  '/sample/table': () => import('@/screens/sample/SampleTable'),
  '/sample/form': () => import('@/screens/sample/SampleForm'),
  '/sample/user-list': () => import('@/screens/sample/UserList'),
  '/sample/master-detail': () => import('@/screens/sample/CategoryProduct'),
  '/sample/wizard': () =>
    import('@/screens/common/PlaceholderScreen').then((m) => ({ default: m.SettingWizardScreen })),
  '/sample/work-calendar': () => import('@/screens/sample/WorkCalendar'),
  '/sample/organization-tree': () => import('@/screens/sample/OrganizationTree'),
  '/sample/production-gantt': () => import('@/screens/sample/ProductionGantt'),
  '/sample/inventory-detail': () => import('@/screens/sample/InventoryDetail'),
  '/sample/equipment-monitor': () => import('@/screens/sample/EquipmentMonitor'),
  '/sample/quality-inspection': () => import('@/screens/sample/QualityInspection'),
  '/sample/material-history': () => import('@/screens/sample/MaterialHistory'),
  '/sample/work-order-form': () => import('@/screens/sample/WorkOrderForm'),
  '/sample/process-management': () => import('@/screens/sample/ProcessManagement'),
});

/**
 * 경로 유효성 검증
 * @description 보안 요구사항 SEC-02, SEC-03 구현
 * @param path 검증할 경로
 * @returns 유효한 경로 여부
 */
export function validateScreenPath(path: string): boolean {
  // 상대 경로만 허용 (슬래시로 시작)
  if (!path.startsWith('/')) {
    return false;
  }

  // path traversal 패턴 차단
  if (path.includes('..')) {
    return false;
  }

  // 프로토콜 패턴 차단 (javascript:, data:, etc.)
  if (/^[a-z]+:/i.test(path)) {
    return false;
  }

  // 쿼리 문자열, 해시 차단
  if (path.includes('?') || path.includes('#')) {
    return false;
  }

  // 허용된 문자만 포함 (영문, 숫자, 슬래시, 하이픈, 언더스코어)
  if (!/^\/[a-zA-Z0-9\-_\/]*$/.test(path)) {
    return false;
  }

  return true;
}

/**
 * 화면 로더 함수 조회
 * @description 경로 검증 후 로더 반환
 * @param path 화면 경로
 * @returns 화면 로더 함수 또는 null
 */
export function getScreenLoader(path: string): ScreenLoader | null {
  // 경로 형식 검증
  if (!validateScreenPath(path)) {
    return null;
  }

  // 레지스트리에서 로더 조회
  const loader = screenRegistry[path];
  return loader ?? null;
}

/**
 * 등록된 화면 경로 목록 조회
 * @returns 등록된 경로 배열
 */
export function getRegisteredPaths(): string[] {
  return Object.keys(screenRegistry);
}

/**
 * 경로가 레지스트리에 등록되어 있는지 확인
 * @param path 확인할 경로
 * @returns 등록 여부
 */
export function isRegisteredPath(path: string): boolean {
  return validateScreenPath(path) && path in screenRegistry;
}
