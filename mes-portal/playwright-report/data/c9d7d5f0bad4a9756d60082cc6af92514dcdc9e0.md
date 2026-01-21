# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - form "로그인 폼" [ref=e5]:
      - generic [ref=e6]:
        - heading "MES Portal" [level=2] [ref=e7]
        - text: Manufacturing Execution System
      - generic [ref=e8]:
        - generic [ref=e10]:
          - generic "이메일" [ref=e12]: "* 이메일"
          - generic [ref=e16]:
            - img "mail" [ref=e18]:
              - img [ref=e19]
            - textbox "이메일" [ref=e21]:
              - /placeholder: 이메일을 입력하세요
              - text: wrong@example.com
        - generic [ref=e23]:
          - generic "비밀번호" [ref=e25]: "* 비밀번호"
          - generic [ref=e29]:
            - img "lock" [ref=e31]:
              - img [ref=e32]
            - textbox "비밀번호" [ref=e34]:
              - /placeholder: 비밀번호를 입력하세요
              - text: wrongpassword
            - img "eye-invisible" [ref=e36] [cursor=pointer]:
              - img [ref=e37]
        - button "로그인" [ref=e45] [cursor=pointer]:
          - generic [ref=e46]: 로그인
    - contentinfo [ref=e47]: © 2026 MES Portal v1.0.0
  - button "Open Next.js Dev Tools" [ref=e53] [cursor=pointer]:
    - img [ref=e54]
  - alert [ref=e57]
```