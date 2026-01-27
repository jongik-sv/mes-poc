/**
 * MergedPermission 기반 CASL Ability 테스트 (TSK-03-01)
 */

import { describe, it, expect } from 'vitest'
import { defineAbilityFromMergedPermissions, type AppAbility } from '../ability'
import type { MergedPermission } from '../permission-merge'

describe('defineAbilityFromMergedPermissions', () => {
  it('MA-001: 빈 권한 배열 - 모든 접근 거부', () => {
    const ability = defineAbilityFromMergedPermissions([])
    expect(ability.can('read', '1')).toBe(false)
  })

  it('MA-002: 단일 메뉴 단일 액션', () => {
    const perms: MergedPermission[] = [
      {
        menuId: 1,
        menuName: '생산실적',
        permissionCd: ['PERM_PROD'],
        actions: ['read'],
        fieldConstraints: null,
      },
    ]
    const ability = defineAbilityFromMergedPermissions(perms)
    expect(ability.can('read', '1')).toBe(true)
    expect(ability.can('create', '1')).toBe(false)
    expect(ability.can('read', '2')).toBe(false)
  })

  it('MA-003: 복수 액션', () => {
    const perms: MergedPermission[] = [
      {
        menuId: 1,
        menuName: '생산실적',
        permissionCd: ['P1'],
        actions: ['read', 'create', 'update'],
        fieldConstraints: null,
      },
    ]
    const ability = defineAbilityFromMergedPermissions(perms)
    expect(ability.can('read', '1')).toBe(true)
    expect(ability.can('create', '1')).toBe(true)
    expect(ability.can('update', '1')).toBe(true)
    expect(ability.can('delete', '1')).toBe(false)
  })

  it('MA-004: 여러 메뉴 권한', () => {
    const perms: MergedPermission[] = [
      {
        menuId: 1,
        menuName: '생산실적',
        permissionCd: ['P1'],
        actions: ['read'],
        fieldConstraints: null,
      },
      {
        menuId: 2,
        menuName: '품질관리',
        permissionCd: ['P2'],
        actions: ['read', 'create'],
        fieldConstraints: null,
      },
    ]
    const ability = defineAbilityFromMergedPermissions(perms)
    expect(ability.can('read', '1')).toBe(true)
    expect(ability.can('create', '1')).toBe(false)
    expect(ability.can('read', '2')).toBe(true)
    expect(ability.can('create', '2')).toBe(true)
  })

  it('MA-005: SYSTEM_ADMIN 와일드카드', () => {
    const perms: MergedPermission[] = [
      {
        menuId: 0,
        menuName: 'all',
        permissionCd: ['SYSTEM_ADMIN'],
        actions: ['manage'],
        fieldConstraints: null,
      },
    ]
    const ability = defineAbilityFromMergedPermissions(perms)
    expect(ability.can('read', '1')).toBe(true)
    expect(ability.can('delete', '999')).toBe(true)
    expect(ability.can('manage', 'all')).toBe(true)
  })

  it('MA-006: menuId null인 권한은 permissionCd로 subject 생성', () => {
    const perms: MergedPermission[] = [
      {
        menuId: null as unknown as number,
        menuName: null as unknown as string,
        permissionCd: ['PERM_GLOBAL'],
        actions: ['read'],
        fieldConstraints: null,
      },
    ]
    const ability = defineAbilityFromMergedPermissions(perms)
    expect(ability.can('read', 'PERM_GLOBAL')).toBe(true)
  })
})
