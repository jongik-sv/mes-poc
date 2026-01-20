# Ralph Loop + wf 워크플로우 조합 가이드

> 이 문서는 Ralph Loop 플러그인과 wf(워크플로우) 명령어를 조합하여 개발 작업을 자동화하는 방법을 설명합니다.

---

## 개요

### 각 도구의 역할

| 도구 | 역할 | 특징 |
|------|------|------|
| **Ralph Loop** | 반복 실행 프레임워크 | 완료 조건(completion promise)이 충족될 때까지 동일 프롬프트 반복 실행 |
| **wf 명령어** | 개발 워크플로우 단계별 자동화 | 상태 기반 전환, 문서 자동 생성, 품질 검증 |

### wf 워크플로우 상태 흐름

```
/wf:start → /wf:design → /wf:review → /wf:apply → /wf:build → /wf:test → /wf:verify → /wf:done
   [ ]         [dd]         (리뷰)       [ap]        [im]        (테스트)    [vf]        [xx]
  Todo       상세설계                    승인        구현                    검증        완료
```

### wf 명령어 목록

| 명령어 | 설명 | 상태 전환 |
|--------|------|----------|
| `/wf:start` | 워크플로우 시작 | `[ ]` → `[dd]` |
| `/wf:design` | 통합 설계 문서 생성 | `[ ]` → `[dd]` |
| `/wf:ui` | UI 화면 설계 | - |
| `/wf:review` | 설계 리뷰 | - |
| `/wf:apply` | 설계 리뷰 반영 | `[dd]` → `[ap]` |
| `/wf:build` | TDD 기반 구현 | `[ap]` → `[im]` |
| `/wf:test` | 테스트 실행 | - |
| `/wf:audit` | 코드 리뷰 | - |
| `/wf:patch` | 코드 리뷰 반영 | - |
| `/wf:fix` | 결함 수정 | - |
| `/wf:verify` | 통합 테스트 | `[im]` → `[vf]` |
| `/wf:done` | 작업 완료 | `[vf]` → `[xx]` |

---

## 조합 패턴

### 1. 단일 Task 전체 자동화

Task를 시작부터 완료까지 자동으로 처리합니다.

```bash
/ralph-loop:ralph-loop "TSK-01-01 Task를 완료해줘.
/wf:start로 시작해서 /wf:design, /wf:build, /wf:test, /wf:done까지 순차 실행해줘."
--completion-promise "ORCHAY_DONE:*/TSK-01-01:done:success"
```

**동작 방식:**
1. Ralph Loop가 프롬프트 실행
2. wf 명령어들이 순차적으로 실행
3. 각 단계 완료 시 `ORCHAY_DONE` 신호 출력
4. 최종 `done:success` 신호가 나오면 루프 종료

---

### 2. WP/ACT 단위 병렬 처리 자동화

Work Package나 Activity 단위로 여러 Task를 병렬 처리합니다.

```bash
/ralph-loop:ralph-loop "/wf:build WP-01 실행하고 모든 테스트가 통과할 때까지 반복"
--max-iterations 10
--completion-promise "모든 Task가 [im] 상태"
```

**사용 예시:**

| 입력 | 처리 방식 |
|------|----------|
| `WP-01` | WP 내 모든 Task 병렬 처리 |
| `ACT-01-01` | ACT 내 모든 Task 병렬 처리 |
| `TSK-01-01` | 단일 Task 처리 |

---

### 3. 설계-리뷰-반영 루프

설계 문서를 생성하고, 리뷰하고, 피드백을 반영하는 과정을 자동화합니다.

```bash
/ralph-loop:ralph-loop "/wf:design TSK-02-01 실행 후 /wf:review로 리뷰하고,
리뷰 결과가 있으면 /wf:apply로 반영. 모든 리뷰 항목이 해결될 때까지 반복"
--completion-promise "리뷰 항목 0개"
```

---

### 4. 테스트-수정 루프

테스트를 실행하고 실패 시 수정하는 과정을 반복합니다.

```bash
/ralph-loop:ralph-loop "/wf:test TSK-01-01 실행하고 실패한 테스트가 있으면
/wf:fix로 수정 후 다시 테스트 실행"
--max-iterations 5
--completion-promise "test-result: pass"
```

---

### 5. 코드 리뷰-반영 루프

코드 리뷰를 수행하고 피드백을 반영하는 과정을 자동화합니다.

```bash
/ralph-loop:ralph-loop "/wf:audit TSK-01-01 실행 후 리뷰 항목이 있으면
/wf:patch로 수정. 모든 항목이 해결될 때까지 반복"
--completion-promise "리뷰 항목 0개"
```

---

## 실용적인 조합 패턴 요약

| 패턴 | 프롬프트 핵심 | 완료 조건 | 용도 |
|------|-------------|----------|------|
| **전체 구현** | `/wf:start → done 순차 실행` | `ORCHAY_DONE:*:done:success` | Task 전체 자동화 |
| **설계 완성** | `/wf:design → review → apply 반복` | `[ap]` 상태 도달 | 설계 품질 확보 |
| **TDD 구현** | `/wf:build 실행` | `ORCHAY_DONE:*:build:success` | 구현 자동화 |
| **테스트 수정** | `/wf:test → fix 반복` | `test-result: pass` | 테스트 통과 확보 |
| **코드 리뷰** | `/wf:audit → patch 반복` | `리뷰 항목 0개` | 코드 품질 확보 |
| **최종 완료** | `/wf:verify → done` | `[xx]` 상태 도달 | 검증 및 완료 |

---

## 완료 신호 (ORCHAY_DONE)

모든 wf 명령어는 작업 완료 시 다음 형식의 신호를 출력합니다:

**성공:**
```
ORCHAY_DONE:{project}/{task-id}:{command}:success
```

**실패:**
```
ORCHAY_DONE:{project}/{task-id}:{command}:error:{에러 요약}
```

**예시:**
```
ORCHAY_DONE:orchay/TSK-01-01:design:success
ORCHAY_DONE:orchay/TSK-01-01:build:success
ORCHAY_DONE:orchay/TSK-01-01:done:success
```

Ralph Loop의 `--completion-promise`에 이 신호를 패턴으로 지정하면 자동 종료됩니다.

---

## 주의사항

### 1. 상태 순서 준수

각 wf 명령어는 특정 상태에서만 실행 가능합니다:

| 명령어 | 필요한 현재 상태 |
|--------|-----------------|
| `/wf:start`, `/wf:design` | `[ ]` Todo |
| `/wf:apply` | `[dd]` 상세설계 |
| `/wf:build` | `[ap]` 승인 |
| `/wf:verify` | `[im]` 구현 |
| `/wf:done` | `[vf]` 검증 |

### 2. 반복 횟수 제한

무한 루프를 방지하기 위해 `--max-iterations`를 설정하세요:

```bash
--max-iterations 10  # 최대 10회 반복
```

### 3. 완료 조건 명확화

`--completion-promise`는 명확하고 검증 가능해야 합니다:
- `ORCHAY_DONE:*:done:success` (명확)
- `test-result: pass` (WBS에서 검증 가능)
- `작업 완료` (불명확 - 피하세요)

### 4. 병렬 처리 시 주의

WP/ACT 단위 병렬 처리 시:
- 하위 Task들이 동시에 처리됨
- 상태가 `[ ]` Todo인 Task만 필터링됨
- 의존성이 있는 Task는 순차 처리 권장

---

## 고급 사용법

### 프로젝트 명시

여러 프로젝트가 있는 경우 프로젝트를 명시합니다:

```bash
/ralph-loop:ralph-loop "/wf:build orchay/TSK-01-01"
--completion-promise "ORCHAY_DONE:orchay/TSK-01-01:build:success"
```

### 특정 테스트 유형만 실행

```bash
/ralph-loop:ralph-loop "/wf:test TSK-01-01 --type tdd"  # TDD만
/ralph-loop:ralph-loop "/wf:test TSK-01-01 --type e2e"  # E2E만
```

### 연속 명령어 체이닝

```bash
/ralph-loop:ralph-loop "
1. /wf:design TSK-01-01 실행
2. 완료되면 /wf:review 실행
3. 리뷰 항목 있으면 수정 후 /wf:apply
4. 승인되면 /wf:build 실행
5. 테스트 통과하면 /wf:done
"
--completion-promise "ORCHAY_DONE:*/TSK-01-01:done:success"
```

---

## 관련 문서

- [wf-common-lite.md](./wf-common-lite.md) - wf 공통 모듈
- [wf-auto-commit-lite.md](./wf-auto-commit-lite.md) - 자동 커밋 규칙
- [wf-conflict-resolution-lite.md](./wf-conflict-resolution-lite.md) - 충돌 해결 규칙

---

<!--
ralph-loop-wf-guide
Version: 1.0
Created: 2026-01-20
-->
