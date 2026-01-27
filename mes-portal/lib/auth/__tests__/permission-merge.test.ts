/**
 * 권한 병합 로직 단위 테스트 (TSK-03-01)
 */

import { describe, it, expect } from 'vitest'
import {
  mergePermissions,
  mergeFieldConstraints,
  collectRolePermissions,
  type RawPermission,
  type MergedPermission,
  type RoleWithPermissions,
} from '../permission-merge'

describe('mergeFieldConstraints', () => {
  it('FC-001: 둘 다 fieldConstraints 없으면 null 반환', () => {
    const result = mergeFieldConstraints(null, null)
    expect(result).toBeNull()
  })

  it('FC-002: 한쪽이 fieldConstraints 없으면 null 반환 (제약 해제)', () => {
    const a = { line: ['2CGL'] }
    const result = mergeFieldConstraints(a, null)
    expect(result).toBeNull()
  })

  it('FC-003: 반대쪽이 fieldConstraints 없으면 null 반환', () => {
    const b = { line: ['3CGL'] }
    const result = mergeFieldConstraints(null, b)
    expect(result).toBeNull()
  })

  it('FC-004: 같은 필드 값 합집합', () => {
    const a = { line: ['2CGL'] }
    const b = { line: ['3CGL'] }
    const result = mergeFieldConstraints(a, b)
    expect(result).toEqual({ line: ['2CGL', '3CGL'] })
  })

  it('FC-005: 같은 필드 중복 값 제거', () => {
    const a = { line: ['2CGL', '3CGL'] }
    const b = { line: ['3CGL', '4CGL'] }
    const result = mergeFieldConstraints(a, b)
    expect(result).toEqual({ line: ['2CGL', '3CGL', '4CGL'] })
  })

  it('FC-006: 한쪽에만 있는 필드는 null (제약 해제)', () => {
    const a = { line: ['2CGL'] }
    const b = { dept: ['A팀'] }
    const result = mergeFieldConstraints(a, b)
    expect(result).toEqual({ line: null, dept: null })
  })

  it('FC-007: 공통 필드 + 고유 필드 혼합', () => {
    const a = { line: ['2CGL'], shift: ['주간'] }
    const b = { line: ['3CGL'] }
    const result = mergeFieldConstraints(a, b)
    expect(result).toEqual({
      line: ['2CGL', '3CGL'],
      shift: null, // b에 없으므로 제약 해제
    })
  })

  it('FC-008: 문자열 값도 배열로 정규화', () => {
    const a = { line: '2CGL' }
    const b = { line: '3CGL' }
    const result = mergeFieldConstraints(
      a as Record<string, string | string[]>,
      b as Record<string, string | string[]>
    )
    expect(result).toEqual({ line: ['2CGL', '3CGL'] })
  })
})

describe('mergePermissions', () => {
  it('MP-001: 단일 권한 병합 없이 반환', () => {
    const raw: RawPermission[] = [
      {
        menuId: 1,
        menuName: '생산실적',
        permissionCd: 'PERM_PROD',
        actions: ['CREATE', 'READ'],
        fieldConstraints: { line: ['2CGL'] },
      },
    ]
    const result = mergePermissions(raw)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      menuId: 1,
      menuName: '생산실적',
      permissionCd: ['PERM_PROD'],
      actions: ['create', 'read'],
      fieldConstraints: { line: ['2CGL'] },
    })
  })

  it('MP-002: 같은 menuId 두 권한 actions 합집합', () => {
    const raw: RawPermission[] = [
      {
        menuId: 1,
        menuName: '생산실적',
        permissionCd: 'PERM_PROD_VIEW',
        actions: ['READ'],
        fieldConstraints: null,
      },
      {
        menuId: 1,
        menuName: '생산실적',
        permissionCd: 'PERM_PROD_EDIT',
        actions: ['CREATE', 'UPDATE'],
        fieldConstraints: null,
      },
    ]
    const result = mergePermissions(raw)
    expect(result).toHaveLength(1)
    expect(result[0].actions).toEqual(
      expect.arrayContaining(['create', 'read', 'update'])
    )
    expect(result[0].actions).toHaveLength(3)
    expect(result[0].permissionCd).toEqual(
      expect.arrayContaining(['PERM_PROD_VIEW', 'PERM_PROD_EDIT'])
    )
  })

  it('MP-003: 중복 actions 제거', () => {
    const raw: RawPermission[] = [
      {
        menuId: 1,
        menuName: '생산실적',
        permissionCd: 'P1',
        actions: ['READ', 'CREATE'],
        fieldConstraints: null,
      },
      {
        menuId: 1,
        menuName: '생산실적',
        permissionCd: 'P2',
        actions: ['READ', 'UPDATE'],
        fieldConstraints: null,
      },
    ]
    const result = mergePermissions(raw)
    expect(result[0].actions).toHaveLength(3) // read, create, update
  })

  it('MP-004: fieldConstraints 한쪽만 있으면 null', () => {
    const raw: RawPermission[] = [
      {
        menuId: 1,
        menuName: '생산실적',
        permissionCd: 'P1',
        actions: ['READ'],
        fieldConstraints: { line: ['2CGL'] },
      },
      {
        menuId: 1,
        menuName: '생산실적',
        permissionCd: 'P2',
        actions: ['READ'],
        fieldConstraints: null,
      },
    ]
    const result = mergePermissions(raw)
    expect(result[0].fieldConstraints).toBeNull()
  })

  it('MP-005: 다른 menuId는 별도 유지', () => {
    const raw: RawPermission[] = [
      {
        menuId: 1,
        menuName: '생산실적',
        permissionCd: 'P1',
        actions: ['READ'],
        fieldConstraints: null,
      },
      {
        menuId: 2,
        menuName: '품질관리',
        permissionCd: 'P2',
        actions: ['CREATE'],
        fieldConstraints: null,
      },
    ]
    const result = mergePermissions(raw)
    expect(result).toHaveLength(2)
  })

  it('MP-006: fieldConstraints 같은 필드 값 합집합', () => {
    const raw: RawPermission[] = [
      {
        menuId: 1,
        menuName: '생산실적',
        permissionCd: 'P1',
        actions: ['READ'],
        fieldConstraints: { line: ['2CGL'] },
      },
      {
        menuId: 1,
        menuName: '생산실적',
        permissionCd: 'P2',
        actions: ['READ'],
        fieldConstraints: { line: ['3CGL'] },
      },
    ]
    const result = mergePermissions(raw)
    expect(result[0].fieldConstraints).toEqual({ line: ['2CGL', '3CGL'] })
  })

  it('MP-007: menuId 없는 권한은 permissionCd 기반 그룹화', () => {
    const raw: RawPermission[] = [
      {
        menuId: null,
        menuName: null,
        permissionCd: 'PERM_GLOBAL',
        actions: ['READ'],
        fieldConstraints: null,
      },
    ]
    const result = mergePermissions(raw)
    expect(result).toHaveLength(1)
    expect(result[0].menuId).toBeNull()
  })
})

describe('collectRolePermissions', () => {
  it('RH-001: 부모 없는 역할 - 자신의 권한만', () => {
    const role: RoleWithPermissions = {
      roleId: 1,
      roleCd: 'OPERATOR',
      parentRole: null,
      permissions: [
        {
          permissionId: 1,
          permissionCd: 'PERM_PROD',
          menuId: 1,
          menuName: '생산실적',
          config: JSON.stringify({
            actions: ['READ'],
            fieldConstraints: { line: ['2CGL'] },
          }),
        },
      ],
    }
    const result = collectRolePermissions(role)
    expect(result).toHaveLength(1)
    expect(result[0].permissionCd).toBe('PERM_PROD')
  })

  it('RH-002: 부모 역할 있으면 부모 권한도 수집', () => {
    const role: RoleWithPermissions = {
      roleId: 2,
      roleCd: 'SENIOR_OPERATOR',
      parentRole: {
        roleId: 1,
        roleCd: 'OPERATOR',
        parentRole: null,
        permissions: [
          {
            permissionId: 1,
            permissionCd: 'PERM_PROD',
            menuId: 1,
            menuName: '생산실적',
            config: JSON.stringify({ actions: ['READ'] }),
          },
        ],
      },
      permissions: [
        {
          permissionId: 2,
          permissionCd: 'PERM_PROD_EDIT',
          menuId: 1,
          menuName: '생산실적',
          config: JSON.stringify({ actions: ['CREATE', 'UPDATE'] }),
        },
      ],
    }
    const result = collectRolePermissions(role)
    expect(result).toHaveLength(2)
  })

  it('RH-003: 3단계 계층 - 모든 조상 권한 수집', () => {
    const role: RoleWithPermissions = {
      roleId: 3,
      roleCd: 'MANAGER',
      parentRole: {
        roleId: 2,
        roleCd: 'SENIOR',
        parentRole: {
          roleId: 1,
          roleCd: 'OPERATOR',
          parentRole: null,
          permissions: [
            {
              permissionId: 1,
              permissionCd: 'P1',
              menuId: 1,
              menuName: 'M1',
              config: JSON.stringify({ actions: ['READ'] }),
            },
          ],
        },
        permissions: [
          {
            permissionId: 2,
            permissionCd: 'P2',
            menuId: 1,
            menuName: 'M1',
            config: JSON.stringify({ actions: ['UPDATE'] }),
          },
        ],
      },
      permissions: [
        {
          permissionId: 3,
          permissionCd: 'P3',
          menuId: 1,
          menuName: 'M1',
          config: JSON.stringify({ actions: ['DELETE'] }),
        },
      ],
    }
    const result = collectRolePermissions(role)
    expect(result).toHaveLength(3)
  })

  it('RH-004: config 파싱 실패 시 해당 권한 건너뜀', () => {
    const role: RoleWithPermissions = {
      roleId: 1,
      roleCd: 'TEST',
      parentRole: null,
      permissions: [
        {
          permissionId: 1,
          permissionCd: 'P1',
          menuId: 1,
          menuName: 'M1',
          config: 'invalid json',
        },
        {
          permissionId: 2,
          permissionCd: 'P2',
          menuId: 2,
          menuName: 'M2',
          config: JSON.stringify({ actions: ['READ'] }),
        },
      ],
    }
    const result = collectRolePermissions(role)
    expect(result).toHaveLength(1)
    expect(result[0].permissionCd).toBe('P2')
  })
})
