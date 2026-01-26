/**
 * CASL Ability 단위 테스트 (TSK-03-02)
 *
 * 테스트 대상:
 * - defineAbilityFor: 권한 코드로 Ability 생성
 * - can/cannot: 권한 체크 메서드
 */

import { describe, it, expect } from 'vitest'
import { defineAbilityFor, type AppAbility } from '../ability'

describe('CASL Ability', () => {
  describe('defineAbilityFor', () => {
    it('UT-ABILITY-001: 빈 권한 배열로 Ability 생성', () => {
      const ability = defineAbilityFor([])

      expect(ability).toBeDefined()
      expect(ability.can('read', 'User')).toBe(false)
      expect(ability.can('create', 'Role')).toBe(false)
    })

    it('UT-ABILITY-002: 단일 권한으로 Ability 생성', () => {
      const ability = defineAbilityFor(['user:read'])

      expect(ability.can('read', 'User')).toBe(true)
      expect(ability.can('create', 'User')).toBe(false)
      expect(ability.can('read', 'Role')).toBe(false)
    })

    it('UT-ABILITY-003: 여러 권한으로 Ability 생성', () => {
      const ability = defineAbilityFor([
        'user:read',
        'user:create',
        'role:read',
      ])

      expect(ability.can('read', 'User')).toBe(true)
      expect(ability.can('create', 'User')).toBe(true)
      expect(ability.can('update', 'User')).toBe(false)
      expect(ability.can('read', 'Role')).toBe(true)
      expect(ability.can('create', 'Role')).toBe(false)
    })

    it('UT-ABILITY-004: manage 액션은 모든 작업 허용', () => {
      const ability = defineAbilityFor(['user:manage'])

      expect(ability.can('read', 'User')).toBe(true)
      expect(ability.can('create', 'User')).toBe(true)
      expect(ability.can('update', 'User')).toBe(true)
      expect(ability.can('delete', 'User')).toBe(true)
    })

    it('UT-ABILITY-005: all 리소스는 모든 리소스 허용', () => {
      const ability = defineAbilityFor(['all:read'])

      expect(ability.can('read', 'User')).toBe(true)
      expect(ability.can('read', 'Role')).toBe(true)
      expect(ability.can('read', 'Permission')).toBe(true)
      expect(ability.can('create', 'User')).toBe(false)
    })

    it('UT-ABILITY-006: cannot 메서드로 권한 없음 확인', () => {
      const ability = defineAbilityFor(['user:read'])

      expect(ability.cannot('create', 'User')).toBe(true)
      expect(ability.cannot('read', 'User')).toBe(false)
    })
  })

  describe('권한 코드 파싱', () => {
    it('UT-ABILITY-007: 소문자 리소스도 파싱', () => {
      const ability = defineAbilityFor(['user:read'])

      // 파싱된 리소스는 대문자로 변환되어 적용
      expect(ability.can('read', 'User')).toBe(true)
    })

    it('UT-ABILITY-008: 잘못된 형식의 권한 코드 무시', () => {
      const ability = defineAbilityFor([
        'user:read',
        'invalid',
        'user-create',
      ])

      expect(ability.can('read', 'User')).toBe(true)
      // 잘못된 형식은 무시됨
      expect(ability.can('create', 'User')).toBe(false)
    })
  })

  describe('SYSTEM_ADMIN 권한', () => {
    it('UT-ABILITY-009: SYSTEM_ADMIN은 모든 권한 보유', () => {
      const ability = defineAbilityFor(['all:manage'])

      expect(ability.can('read', 'User')).toBe(true)
      expect(ability.can('create', 'User')).toBe(true)
      expect(ability.can('update', 'User')).toBe(true)
      expect(ability.can('delete', 'User')).toBe(true)
      expect(ability.can('read', 'Role')).toBe(true)
      expect(ability.can('create', 'Role')).toBe(true)
      expect(ability.can('update', 'Role')).toBe(true)
      expect(ability.can('delete', 'Role')).toBe(true)
    })
  })
})
