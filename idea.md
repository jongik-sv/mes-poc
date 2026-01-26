https://claude.ai/share/f8ddc849-be98-4d2b-b0f3-ab3d641a5461

## 개선 사항

1. CRUD 버튼이 필요한 화면에 대해서는 공통 컴포넌트로 만들어서 사용, 향후 권한 관리와 연계
2. 권한관리 시스템 추가
3. MARU 시스템 추가
4. DB 연계

## ralph-loop 명령어 사용법
```sh
/ralph-loop:ralph-loop "auth-system 프로젝트를 개발해줘.
## 참고문서
- 참고 폴더 : .orchay/projects/auth-system
- 참고 문서 : PRD, TRD, WBS를 참고

## 문서 생성
1. Task별 폴더를 생성
2. .orchay/templates 폴더의 문서를 참고하여 단계별 문서를 작성해
  - 설계 단계
    - 010 설계문서
    - 025 추적성 매트릭스 문서
    - 026 테스트 명세 문서
  - 구현/테스트 단계
    - 070 TDD 테스트 결과서
    - 070 E2E 테스트 결과서
  - 완료 단계
    - 030 개발 보고서
  
## 개발 요구사항
 - TDD 방식으로 개발
 - 개발 후 메뉴 등록까지 완료
  
## 완료 조건
 - 모든 작업이 완료되면 <promise>AUTH COMPLETE</promise>를 출력하세요." --completion-promise "AUTH COMPLETE" --max-iterations 30 
```
      
취소: /ralph-loop:cancel-ralph