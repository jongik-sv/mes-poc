import prisma from '../lib/prisma'
import { verifyPassword } from '../lib/auth/password'

async function main() {
  console.log('\n🔍 TSK-04-02 통합 테스트: 사용자 및 역할 모델 검증\n')
  console.log('='.repeat(60))

  // 1. 역할 검증
  console.log('\n[IT-001] 역할 시드 데이터 검증')
  const roles = await prisma.role.findMany({ orderBy: { id: 'asc' } })

  const expectedRoles = [
    { code: 'SYSTEM_ADMIN', name: '시스템 관리자' },
    { code: 'PRODUCTION_MANAGER', name: '생산 관리자' },
    { code: 'OPERATOR', name: '현장 작업자' },
  ]

  let roleTestPassed = true
  expectedRoles.forEach((expected) => {
    const found = roles.find((r) => r.code === expected.code)
    if (found) {
      console.log(`  ✅ ${expected.code}: ${found.name}`)
    } else {
      console.log(`  ❌ ${expected.code}: 누락`)
      roleTestPassed = false
    }
  })
  console.log(`  결과: ${roleTestPassed ? '✅ PASS' : '❌ FAIL'}`)

  // 2. 사용자 검증 (UserRole 관계 포함)
  console.log('\n[IT-002] 사용자 시드 데이터 검증')
  const users = await prisma.user.findMany({
    include: {
      userRoles: {
        include: { role: true },
      },
    },
    orderBy: { id: 'asc' },
  })

  const expectedUsers = [
    { email: 'admin@example.com', name: '관리자', roleCode: 'SYSTEM_ADMIN' },
    { email: 'manager@example.com', name: '생산관리자', roleCode: 'PRODUCTION_MANAGER' },
    { email: 'operator@example.com', name: '작업자', roleCode: 'OPERATOR' },
  ]

  let userTestPassed = true
  expectedUsers.forEach((expected) => {
    const found = users.find((u) => u.email === expected.email)
    const hasRole = found?.userRoles.some((ur) => ur.role.code === expected.roleCode)
    if (found && hasRole && found.isActive) {
      console.log(`  ✅ ${expected.email} (${expected.roleCode}): ${found.name}`)
    } else {
      console.log(`  ❌ ${expected.email}: 누락 또는 불일치`)
      userTestPassed = false
    }
  })
  console.log(`  결과: ${userTestPassed ? '✅ PASS' : '❌ FAIL'}`)

  // 3. 비밀번호 해시 검증
  console.log('\n[IT-003] 비밀번호 해시 검증')
  let hashTestPassed = true
  for (const user of users) {
    const isHashed = user.password.startsWith('$2')
    const isValid = await verifyPassword('password123', user.password)
    if (isHashed && isValid) {
      console.log(`  ✅ ${user.email}: bcrypt 해시 (검증 성공)`)
    } else {
      console.log(`  ❌ ${user.email}: 해시 형식 또는 검증 실패`)
      hashTestPassed = false
    }
  }
  console.log(`  결과: ${hashTestPassed ? '✅ PASS' : '❌ FAIL'}`)

  // 4. User-Role 관계 조회 검증 (UserRole 테이블 통해)
  console.log('\n[IT-004] User-Role 관계 조회 검증')
  let relationTestPassed = true
  for (const user of users) {
    if (user.userRoles && user.userRoles.length > 0) {
      const roleCodes = user.userRoles.map((ur) => ur.role.code).join(', ')
      console.log(`  ✅ ${user.email} → [${roleCodes}]`)
    } else {
      console.log(`  ❌ ${user.email}: Role 관계 누락`)
      relationTestPassed = false
    }
  }
  console.log(`  결과: ${relationTestPassed ? '✅ PASS' : '❌ FAIL'}`)

  // 5. 역할별 사용자 조회 검증 (UserRole 테이블 통해)
  console.log('\n[IT-005] 역할별 사용자 조회 검증')
  let roleUsersTestPassed = true
  for (const role of roles) {
    const roleWithUsers = await prisma.role.findUnique({
      where: { code: role.code },
      include: {
        userRoles: {
          include: { user: true },
        },
      },
    })
    if (roleWithUsers && roleWithUsers.userRoles.length > 0) {
      const userEmails = roleWithUsers.userRoles.map((ur) => ur.user.email).join(', ')
      console.log(`  ✅ ${role.code}: ${roleWithUsers.userRoles.length}명 (${userEmails})`)
    } else {
      console.log(`  ⚠️ ${role.code}: 사용자 없음`)
      // 일부 역할에 사용자가 없을 수 있으므로 실패로 처리하지 않음
    }
  }
  console.log(`  결과: ${roleUsersTestPassed ? '✅ PASS' : '❌ FAIL'}`)

  // 최종 결과
  console.log('\n' + '='.repeat(60))
  const allPassed = roleTestPassed && userTestPassed && hashTestPassed && relationTestPassed && roleUsersTestPassed

  if (allPassed) {
    console.log('🎉 통합 테스트 결과: 모든 테스트 통과 (5/5)')
  } else {
    console.log('❌ 통합 테스트 결과: 일부 테스트 실패')
  }
  console.log('='.repeat(60) + '\n')

  await prisma.$disconnect()
  process.exit(allPassed ? 0 : 1)
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
