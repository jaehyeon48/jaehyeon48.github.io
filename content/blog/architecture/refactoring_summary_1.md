---
title: '리팩토링 2판 요약 정리 Part.1'
date: 2021-12-06
category: 'architecture'
draft: false
---

[리팩토링 2판](https://www.amazon.com/Refactoring-Improving-Existing-Addison-Wesley-Signature/dp/0134757599)을 번역/요약한 글입니다.

<hr class="custom-hr">

## 서문

- 읽기 쉬우면서도 변경에 용이한 코드를 유지하는 비결은 리팩토링이다.
- 리팩토링은 risky한 작업이다. 현재 (잘) 작동하고 있는 코드를 변경함으로 인해 사소한 버그들이 발생할 수 있다. 리팩토링을 적절히, 체계적으로 하지 않으면 몇 일, 심지어는 몇 주전으로 퇴보할 수도 있다.
- **리팩토링이란 소프트웨어가 수행하는 동작(external behavior)은 변경하지 않으면서 내부 구조를 개선하는 작업이다.** 즉, 코드를 더 깔끔하게 만들어서 버그가 발생할 확률을 줄이는 행위이다.
- 본질적으로 리팩토링을 한다는 것은 기존에 짜여진 코드의 설계를 개선해 나가는 작업이다.