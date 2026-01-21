# 설계 리뷰 결과 (021-design-review-claude-1.md)

**Task ID:** TSK-06-09
**Task명:** [샘플] 설정 마법사
**리뷰어:** claude-1
**리뷰일:** 2026-01-21

---

## 1. 리뷰 개요

### 1.1 검증 대상 문서

| 문서 | 상태 | 비고 |
|------|------|------|
| 010-design.md | ✅ 검토완료 | 통합 설계 문서 |
| 025-traceability-matrix.md | ✅ 검토완료 | 추적성 매트릭스 |
| 026-test-specification.md | ✅ 검토완료 | 테스트 명세 |

### 1.2 리뷰 관점

| 검증 영역 | 평가 | 비고 |
|----------|------|------|
| 문서 완전성 | WARN | 보안 섹션 누락, 체크리스트 미갱신 |
| 요구사항 추적성 | WARN | UC-06 추적 누락 |
| 아키텍처 | WARN | 데이터 흐름 명세 보완 필요 |
| 보안 | PASS | Mock 전용 샘플로 Critical 이슈 없음 |
| 테스트 가능성 | WARN | 매뉴얼 테스트 상세 보완 필요 |
| 문서 일관성 | WARN | data-testid, BR ID 불일치 |

### 1.3 이슈 분포

| 심각도 | 건수 | 우선순위별 |
|--------|------|-----------|
| Critical | 0 | P1: 5건 |
| High | 4 | P2: 7건 |
| Medium | 9 | P3: 6건 |
| Low | 6 | P4: 4건 |
| Info | 2 | P5: 2건 |
| **총계** | **21** | |

---

## 2. 발견 사항 상세

### 2.1 P1 - 즉시 조치 필요 (구현 전 필수)

#### ARCH-001: WizardContext 활용 방식 미명시

| 항목 | 내용 |
|------|------|
| 카테고리 | architecture / data-flow |
| 심각도 | High |
| 관련 섹션 | 010-design.md 7.2, 11.3 |

**문제점:**
TSK-06-06에서 정의한 `WizardContext`와 `useWizardStep` 훅을 TSK-06-09에서 어떻게 활용할지 구체적인 방법이 설계 문서에 명시되어 있지 않습니다.

**개선 방안:**
설계 문서에 다음 내용 추가 권장:

```typescript
// 데이터 흐름 명시
interface SettingWizardData {
  basicInfo: {
    companyName: string;
    factoryName: string;
    adminEmail: string;
  };
  detailSettings: {
    serverAddress: string;
    port: number;
    timeout: number;
    autoReconnect: boolean;
    debugMode: boolean;
    useSSL: boolean;
  };
}

// 각 단계 컴포넌트에서 useWizardStep 훅 사용
function BasicInfoStep() {
  const [form] = Form.useForm();
  const { handleValuesChange } = useWizardStep<BasicInfo>('basicInfo', form);
  // ...
}
```

---

#### ARCH-002: Form-Context 연동 전략 미명시

| 항목 | 내용 |
|------|------|
| 카테고리 | architecture |
| 심각도 | High |
| 관련 섹션 | 010-design.md 8.1 (BR-02), 11.3 |

**문제점:**
TSK-06-06에서는 `WizardStep.validate` 함수에서 Form 인스턴스의 `validateFields()`를 호출해야 하지만, Form 인스턴스에 접근하는 방법이 불명확합니다.

**개선 방안:**
Form-Context 연동 전략을 명시적으로 추가:

```typescript
// SettingWizard/index.tsx에서
const steps: WizardStep[] = [
  {
    key: 'basicInfo',
    title: '기본 정보',
    content: <BasicInfoStep />,
    // validate는 WizardTemplate 내부에서 registerStepForm으로 등록된
    // Form 인스턴스를 사용하여 자동 검증 (TSK-06-06 적용)
  },
  // ...
];
```

---

#### QA-001: UC-06 (마법사 취소) 요구사항 추적 누락

| 항목 | 내용 |
|------|------|
| 카테고리 | traceability |
| 심각도 | High |
| 관련 문서 | 010-design.md 3.2, 025-traceability-matrix.md 1 |

**문제점:**
- `010-design.md`에 UC-06 (마법사 취소) 유즈케이스가 정의되어 있음
- 그러나 `025-traceability-matrix.md`의 기능 요구사항(FR) 목록에 "마법사 취소" 관련 FR이 없음
- E2E-009는 있으나 FR 매핑이 없어 추적성 불완전

**개선 방안:**
1. `025-traceability-matrix.md`에 FR-008 "마법사 취소 기능" 추가
2. UC-06 → FR-008 → E2E-009, TC-011 매핑 추가

---

#### QA-002: data-testid 정의 불일치

| 항목 | 내용 |
|------|------|
| 카테고리 | consistency |
| 심각도 | High |
| 관련 문서 | 010-design.md 11.6, 026-test-specification.md 6 |

**문제점:**
- `010-design.md`: 24개 정의
- `026-test-specification.md`: 30개 이상 정의
- 누락: `wizard-content`, `wizard-confirmation`
- 확인 단계 개별 섹션 data-testid 부재

**개선 방안:**
1. 두 문서의 data-testid 목록을 동기화
2. 추가 권장 data-testid:

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `wizard-content` | 콘텐츠 영역 | 콘텐츠 표시 확인 |
| `wizard-confirmation` | 확인 영역 | 요약 데이터 확인 |
| `confirmation-basic-info-section` | 기본정보 요약 | 값 검증 |
| `confirmation-detail-settings-section` | 상세설정 요약 | 값 검증 |

---

#### QA-003: 보안 원칙 섹션 누락

| 항목 | 내용 |
|------|------|
| 카테고리 | completeness |
| 심각도 | High |
| 관련 문서 | 010-design.md |

**문제점:**
- TSK-06-06 (WizardTemplate) 설계 문서에는 "10.1 보안 원칙" 섹션이 포함
- TSK-06-09 설계 문서에는 보안 관련 섹션이 없음
- 설정 마법사는 서버 주소, 포트 번호 등 인프라 정보를 다루므로 보안 고려 필요

**개선 방안:**
`010-design.md`에 보안 고려사항 섹션 추가 (또는 TSK-06-06 참조 명시):

```markdown
### 11.7 보안 고려사항 (향후 실제 구현 시)

| 항목 | 현재 (Mock) | 실제 구현 시 |
|------|------------|--------------|
| 유효성 검사 | 클라이언트 측만 | 서버 측 검증 필수 |
| 접근 권한 | 없음 (샘플) | ADMIN 역할 필수 |
| 민감 정보 | 로깅 없음 | 이메일/IP 마스킹 |
```

---

### 2.2 P2 - 설계 보완 권장 (구현 초기 수정)

#### ARCH-003: 컴포넌트 분리 불완전

| 항목 | 내용 |
|------|------|
| 카테고리 | architecture / component |
| 심각도 | Medium |
| 관련 섹션 | 010-design.md 11.1 |

**문제점:**
4단계 중 3단계(확인)와 4단계(완료)에 대한 별도 컴포넌트가 정의되어 있지 않습니다.

**개선 방안:**
권장 파일 구조:
```
├── SettingWizard/
│   ├── index.tsx              # 메인 컴포넌트 (상태 관리만)
│   ├── BasicInfoStep.tsx      # 1단계: 기본정보
│   ├── DetailSettingsStep.tsx # 2단계: 상세설정
│   ├── ConfirmationStep.tsx   # 3단계: 확인 (신규)
│   ├── CompleteStep.tsx       # 4단계: 완료 (신규)
│   ├── types.ts
│   └── __tests__/             # 테스트 디렉토리 (추가)
```

---

#### ARCH-004: Mock 데이터 추상화 레이어 부재

| 항목 | 내용 |
|------|------|
| 카테고리 | architecture |
| 심각도 | Medium |
| 관련 섹션 | 010-design.md 7.1, 7.2 |

**문제점:**
Mock 데이터를 직접 import하는 방식은 향후 실제 API 전환 시 변경 범위가 커질 수 있습니다.

**개선 방안:**
TRD 섹션 2.3의 데이터 로딩 전략에 맞춰 추상화 레이어 도입:

```typescript
// lib/services/wizard.ts
export const wizardService = {
  async getConfig() {
    const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
    if (USE_MOCK) {
      return import('@/mock-data/wizard-config.json');
    }
    return apiClient<WizardConfig>('/api/wizard/config');
  },
};
```

---

#### ARCH-005: WizardTemplate Props 활용 범위 미명시

| 항목 | 내용 |
|------|------|
| 카테고리 | component |
| 심각도 | Medium |
| 관련 섹션 | 010-design.md 11.3 |

**문제점:**
TSK-06-06에서 정의한 `WizardTemplateProps`의 다양한 옵션 중 어떤 것을 사용할지 명시 없음.

**개선 방안:**
설계 문서에 사용할 Props 명시:

```typescript
<WizardTemplate
  title="설정 마법사"
  steps={steps}
  onFinish={handleFinish}
  onCancel={handleCancel}
  autoConfirmStep={false}     // 커스텀 확인 단계 사용
  autoFinishStep={false}      // 커스텀 완료 단계 사용
  enableLeaveConfirm={true}   // 이탈 경고 활성화
  direction="horizontal"       // 수평 Steps
/>
```

---

#### SEC-001: serverAddress 입력값 검증 규칙 미흡

| 항목 | 내용 |
|------|------|
| 카테고리 | validation |
| 심각도 | Medium |
| 관련 섹션 | 010-design.md 7.3 |

**문제점:**
`serverAddress` 필드의 유효성 규칙이 "필수, IP 또는 도메인"으로만 명시되어 구체적인 검증 패턴이 없습니다.

**개선 방안:**
명확한 정규식 패턴 정의:
- IPv4: `^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$`
- 도메인: `^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$`
- 최대 길이: 253자

---

#### QA-004: 비즈니스 규칙 ID 형식 불일치

| 항목 | 내용 |
|------|------|
| 카테고리 | consistency |
| 심각도 | Medium |
| 관련 문서 | 010-design.md 8.1, 025-traceability-matrix.md 2 |

**문제점:**
- `010-design.md`: BR-01 ~ BR-05
- `025-traceability-matrix.md`: BR-001 ~ BR-005

**개선 방안:**
두 문서의 비즈니스 규칙 ID 형식 통일 → `BR-001` (3자리 숫자) 권장

---

#### QA-005: 체크리스트 완료 상태 미갱신

| 항목 | 내용 |
|------|------|
| 카테고리 | completeness |
| 심각도 | Medium |
| 관련 섹션 | 010-design.md 12.2 |

**문제점:**
요구사항 추적 매트릭스와 테스트 명세서가 작성 완료되었으나 체크리스트가 미완료 상태로 표시됨.

**개선 방안:**
```markdown
### 12.2 연관 문서 작성
- [x] 요구사항 추적 매트릭스 작성 (→ `025-traceability-matrix.md`)
- [x] 테스트 명세서 작성 (→ `026-test-specification.md`)
```

---

### 2.3 P3 - 구현 중 수정 (테스트 단계 전)

#### QA-006: 매뉴얼 테스트 상세 누락

| 항목 | 내용 |
|------|------|
| 카테고리 | testability |
| 심각도 | Medium |
| 관련 문서 | 026-test-specification.md 4.2 |

**문제점:**
TC-001, TC-002, TC-006만 상세 작성됨. TC-003~TC-005, TC-007~TC-010 상세 누락.

**개선 방안:**
누락된 매뉴얼 테스트 케이스 상세 추가

---

#### QA-007: 접근성 테스트 케이스 부족

| 항목 | 내용 |
|------|------|
| 카테고리 | testability |
| 심각도 | Medium |
| 관련 문서 | 026-test-specification.md 4.1 |

**문제점:**
TC-009 "키보드 접근성" 상세 없음, 스크린 리더 테스트 케이스 없음.

**개선 방안:**
1. TC-009 상세 작성 (Tab/Enter/Escape 동작 검증)
2. 스크린 리더 테스트 케이스 추가

---

#### ARCH-006: 단계 추가 가이드라인 부재

| 항목 | 내용 |
|------|------|
| 카테고리 | extensibility |
| 심각도 | Low |
| 관련 섹션 | 010-design.md 1.3 |

**문제점:**
향후 단계 추가/수정 시 어떤 파일을 변경해야 하는지 명시 없음.

**개선 방안:**
구현 가이드라인 섹션 추가:

```markdown
### 단계 추가 시 변경 사항
1. `SettingWizard/NewStep.tsx` 컴포넌트 생성
2. `types.ts`에 해당 단계 데이터 타입 추가
3. `index.tsx`의 steps 배열에 단계 정의 추가
4. `mock-data/wizard-config.json`에 기본값 추가 (필요 시)
5. 테스트 명세서 업데이트
```

---

#### QA-008: E2E aria-current 셀렉터 검증 필요

| 항목 | 내용 |
|------|------|
| 카테고리 | testability |
| 심각도 | Medium |
| 관련 문서 | 026-test-specification.md 3.2 |

**문제점:**
Ant Design Steps의 현재 단계 표시 방식이 `aria-current="step"`인지 검증 필요.

**개선 방안:**
대안 셀렉터 고려: `.ant-steps-item-active` 클래스 사용

---

#### QA-009: 확인 단계 구현 방식 불명확

| 항목 | 내용 |
|------|------|
| 카테고리 | consistency |
| 심각도 | Medium |
| 관련 문서 | 010-design.md 11.1, 025-traceability-matrix.md 6 |

**문제점:**
- 010-design.md: 확인 단계 전용 컴포넌트 없음
- 025-traceability-matrix.md: "WizardTemplate renderConfirmation" 언급
- 두 가지 구현 방식 혼재

**개선 방안:**
확인 단계 구현 방식 명확히 결정하고 문서화

---

#### SEC-002: 클라이언트 측 유효성 검사만 명시

| 항목 | 내용 |
|------|------|
| 카테고리 | validation |
| 심각도 | Medium |
| 관련 섹션 | 010-design.md 7.3, 8.1 |

**문제점:**
유효성 검사가 `Form.validateFields()` 클라이언트 측 검증만 명시됨.

**개선 방안:**
설계 문서에 "향후 API 연동 시 서버 측 유효성 검사 필수" 주석 추가

---

### 2.4 P4 - 개선 권장 (구현 후 검토)

#### QA-010: 문서 상태 "작성중" 미갱신

| 항목 | 내용 |
|------|------|
| 카테고리 | completeness |
| 심각도 | Low |
| 관련 섹션 | 010-design.md 문서 정보 |

**개선 방안:**
문서 상태를 "설계완료"로 변경

---

#### QA-011: 버튼 텍스트 표현 불일치

| 항목 | 내용 |
|------|------|
| 카테고리 | consistency |
| 심각도 | Low |
| 관련 문서 | 010-design.md 5.2, 026-test-specification.md 6.1 |

**개선 방안:**
버튼 텍스트 상수 정의 또는 Mock 데이터에서 관리

---

#### SEC-003: 이메일 필드 형식 검증 세부 사항 미정의

| 항목 | 내용 |
|------|------|
| 카테고리 | validation |
| 심각도 | Low |
| 관련 섹션 | 010-design.md 7.3 |

**개선 방안:**
- Ant Design Form의 `type: 'email'` 규칙 사용 명시
- 최대 길이 제한 추가 (254자)

---

#### SEC-004: 페이지 접근 권한 명시 없음

| 항목 | 내용 |
|------|------|
| 카테고리 | auth |
| 심각도 | Low |
| 관련 섹션 | 010-design.md 3.1 |

**개선 방안:**
"실제 구현 시 ADMIN 역할 필수" 주석 추가 권장

---

### 2.5 P5 - 참고 사항 (다음 iteration)

#### ARCH-007: Server Component 데이터 페칭 패턴 미상세

| 항목 | 내용 |
|------|------|
| 카테고리 | architecture |
| 심각도 | Info |
| 관련 섹션 | 010-design.md 11.5 |

**개선 방안:**
page.tsx(Server)에서 Mock 데이터 로드 방식의 구체적인 구현 예시 추가

---

#### QA-012: 테스트 계정 정보 실제 사용 여부 불명확

| 항목 | 내용 |
|------|------|
| 카테고리 | testability |
| 심각도 | Info |
| 관련 문서 | 026-test-specification.md 5.3 |

**개선 방안:**
Mock 데이터 전용 샘플이므로 테스트 계정 섹션 제거 또는 "해당 없음" 명시

---

## 3. 권장 조치 요약

### 3.1 즉시 조치 필요 (P1) - 5건

| # | 제목 | 조치 내용 |
|---|------|----------|
| 1 | WizardContext 활용 방식 명시 | 데이터 흐름 및 useWizardStep 훅 사용법 문서화 |
| 2 | Form-Context 연동 전략 명시 | registerStepForm 활용 방법 정의 |
| 3 | UC-06 요구사항 추적 추가 | FR-008 추가, E2E-009/TC-011 매핑 |
| 4 | data-testid 목록 동기화 | 두 문서 간 일치시키고 누락 항목 추가 |
| 5 | 보안 고려사항 섹션 추가 | TSK-06-06 참조 또는 별도 섹션 작성 |

### 3.2 설계 보완 권장 (P2) - 7건

| # | 제목 | 조치 내용 |
|---|------|----------|
| 1 | 컴포넌트 분리 | ConfirmationStep.tsx, CompleteStep.tsx 추가 |
| 2 | Mock 데이터 추상화 | wizardService 서비스 레이어 정의 |
| 3 | WizardTemplate Props 명시 | 사용할 옵션 목록 문서화 |
| 4 | serverAddress 검증 규칙 강화 | 정규식 패턴 및 최대 길이 정의 |
| 5 | BR ID 형식 통일 | BR-001 형식으로 통일 |
| 6 | 체크리스트 갱신 | 완료 상태로 체크박스 업데이트 |
| 7 | 테스트 파일 경로 명시 | __tests__/ 디렉토리 구조 추가 |

### 3.3 테스트 단계 전 조치 (P3) - 6건

| # | 제목 | 조치 내용 |
|---|------|----------|
| 1 | 매뉴얼 테스트 상세 보완 | TC-003~TC-010 상세 작성 |
| 2 | 접근성 테스트 추가 | 키보드/스크린 리더 테스트 케이스 |
| 3 | 단계 추가 가이드라인 | 확장성 가이드 문서화 |
| 4 | aria-current 셀렉터 검증 | Ant Design Steps 실제 속성 확인 |
| 5 | 확인 단계 구현 방식 결정 | autoConfirmStep 사용 여부 명확화 |
| 6 | 서버 측 검증 주석 | 향후 API 연동 시 필수 사항 명시 |

---

## 4. 결론

TSK-06-09 "[샘플] 설정 마법사" 설계 문서는 전반적으로 **잘 작성**되어 있으며, WizardTemplate(TSK-06-06)을 활용한 4단계 마법사 구현 방향이 명확합니다.

**강점:**
- 유즈케이스, 화면 설계, 비즈니스 규칙이 상세하게 정의됨
- 추적성 매트릭스와 테스트 명세서가 함께 작성됨
- Mock 데이터 구조가 명확하게 정의됨
- data-testid가 충분히 정의됨

**주요 개선 필요 사항:**
1. **데이터 흐름 명세**: WizardContext 및 Form-Context 연동 방법 구체화
2. **문서 간 일관성**: data-testid, BR ID 형식 통일
3. **추적성 보완**: UC-06 (마법사 취소) 요구사항 추적 추가
4. **보안 고려**: 향후 실제 구현 시 고려사항 명시

**Critical 수준의 발견 사항은 없으며**, P1(5건) 및 P2(7건) 항목은 구현 전 해결을 권장합니다.

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | claude-1 | 최초 작성 |

---

## 5. 적용 결과

### 5.1 적용 판단 요약

| 구분 | 건수 | 비율 |
|------|------|------|
| ✅ 적용 | 10건 | 48% |
| 📝 조정 적용 | 1건 | 5% |
| ⏸️ 보류 | 1건 | 5% |
| 🔵 P3 이하 선별 적용 | - | - |
| **총계** | 21건 (P1-P2 12건 처리) | - |

### 5.2 P1 이슈 처리 결과 (5건 → 100% 처리)

| 이슈 ID | 제목 | 판단 | 처리 내용 |
|---------|------|------|----------|
| ARCH-001 | WizardContext 활용 방식 미명시 | ✅ 적용 | 010-design.md 11.3.1 섹션에 데이터 흐름 및 useWizardStep 훅 사용법 추가 |
| ARCH-002 | Form-Context 연동 전략 미명시 | ✅ 적용 | 010-design.md 11.3.2 섹션에 steps 배열 정의 및 registerStepForm 활용 방법 추가 |
| QA-001 | UC-06 요구사항 추적 누락 | ✅ 적용 | 025-traceability-matrix.md에 FR-008 추가, UC-06 → FR-008 → E2E-009, TC-011 매핑 |
| QA-002 | data-testid 정의 불일치 | ✅ 적용 | 010-design.md 11.6에 wizard-content, wizard-confirmation, confirmation-*-section 추가 |
| QA-003 | 보안 원칙 섹션 누락 | 📝 조정 적용 | 010-design.md 11.7에 보안 고려사항 섹션 추가 (Mock 샘플이므로 간소화하여 TSK-06-06 참조 형태) |

### 5.3 P2 이슈 처리 결과 (7건 → 86% 처리)

| 이슈 ID | 제목 | 판단 | 처리 내용 |
|---------|------|------|----------|
| ARCH-003 | 컴포넌트 분리 불완전 | ✅ 적용 | 010-design.md 11.1 파일 구조에 ConfirmationStep.tsx, CompleteStep.tsx, __tests__/ 추가 |
| ARCH-004 | Mock 데이터 추상화 레이어 부재 | ⏸️ 보류 | Mock 샘플이므로 직접 import로 충분, 추상화 레이어는 과도한 구현 (범위 초과) |
| ARCH-005 | WizardTemplate Props 활용 범위 미명시 | ✅ 적용 | 010-design.md 11.3.3에 사용할 Props 명시 (autoConfirmStep, autoFinishStep, enableLeaveConfirm 등) |
| SEC-001 | serverAddress 입력값 검증 규칙 미흡 | ✅ 적용 | 010-design.md 7.3.1에 IPv4/도메인 정규식 패턴 및 최대 길이 정의 추가 |
| QA-004 | 비즈니스 규칙 ID 형식 불일치 | ✅ 적용 | 010-design.md 8.1에서 BR-01~05 → BR-001~005 형식으로 통일 |
| QA-005 | 체크리스트 완료 상태 미갱신 | ✅ 적용 | 010-design.md 12.2 연관 문서 작성 체크박스 완료 상태로 갱신 |
| - | 테스트 파일 경로 명시 | ✅ 적용 | 010-design.md 11.1에 __tests__/ 디렉토리 및 테스트 파일 구조 추가 |

### 5.4 기타 처리

| 이슈 ID | 제목 | 판단 | 사유 |
|---------|------|------|------|
| QA-010 | 문서 상태 "작성중" 미갱신 | ✅ 적용 | 010-design.md 문서 상태 "설계완료"로 변경 |
| - | 추적성 매트릭스 화면 추적 | ✅ 적용 | 025-traceability-matrix.md 6. 화면 추적 섹션에서 ConfirmationStep, CompleteStep 컴포넌트로 명확화 |
| - | 테스트 명세서 TC-011 | ✅ 적용 | 026-test-specification.md에 TC-011 마법사 취소 테스트 케이스 상세 추가 |
| - | 테스트 계정 섹션 | ✅ 적용 | 026-test-specification.md 5.3 테스트 계정 섹션을 "해당 없음" 형태로 수정 |

### 5.5 보류 사유

| 이슈 ID | 제목 | 보류 사유 |
|---------|------|----------|
| ARCH-004 | Mock 데이터 추상화 레이어 부재 | Mock 전용 샘플에서 추상화 레이어 도입은 과도한 구현. TRD 섹션 2.3의 데이터 로딩 전략은 실제 API 연동 시 적용 가능하며, 현재 범위(Mock 데이터 직접 사용)에서는 직접 import로 충분함 |

### 5.6 수정된 문서

| 문서 | 주요 변경 사항 |
|------|---------------|
| 010-design.md | WizardContext 활용 방식, Form-Context 연동 전략, WizardTemplate Props, serverAddress 검증 패턴, 보안 고려사항, data-testid 추가, BR ID 통일, 파일 구조 업데이트, 체크리스트 갱신, 문서 상태 변경 |
| 025-traceability-matrix.md | FR-008 추가, UC-06 매핑, TC-011 추가, 화면 추적 컴포넌트 명확화, 커버리지 통계 갱신 |
| 026-test-specification.md | TC-011 마법사 취소 테스트 케이스 추가, 테스트 계정 섹션 수정 |

---

**적용 완료일**: 2026-01-21
**적용자**: Claude

---

<!--
021-design-review-claude-1.md
Version: 1.0
Reviewer: claude
Review Type: architecture + security + quality (multi-perspective)
-->
