---
title: '리팩토링 2판 요약 정리 Ch.1'
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

## Chapter 1

- 잘못 설계된 시스템은 무엇을 변경해야 할지 알기 어렵다. 또한, 변경했을 때 내가 원하는 대로 동작하기 위해 기존의 코드와 어떻게 상호작용하는지 파악하기 힘들다. 결국 무엇을 변경해야 할지 알아내기 힘들다면 실수할 가능성이 높아지고, 버그가 발생할 확률이 올라간다.
- 제대로 구조화되지 않은 프로그램에 기능을 추가해야 하는 상황이라면, 우선 리팩토링을 먼저 해서 해당 프로그램에 새로운 기능을 추가하기 쉽게끔 만든 다음 기능을 추가하는 편이 좋다.
- 만약 코드가 잘 작동하고 앞으로도 코드를 _절대_ 바꿀 일이 없다면 굳이 리팩토링을 안 해도 된다. 물론 더 개선하면 좋겠지만 다른 사람이 이해할 필요가 없는 코드라면 그대로 두어도 딱히 문제 될 건 없다. 하지만 만약 누군가 그 코드가 어떻게 동작하는지 알아야만 하고, 또 그 코드의 동작을 파악하는 데 어려움을 겪는다면 무언가 조치를 취해야만 한다.
- 리팩토링을 하기 전에, 반드시 해당 코드에 대한 확실한 테스트 셋을 마련해야 한다. 아무리 체계적으로 리팩토링을 한다고 해도 인간이기에 실수를 할 수 있기 때문이다.
- 테스트는 자가 테스트(self-checking)인 것이 중요하다 (즉, 자동으로 테스트할 수 있어야 한다). 만약 그렇지 않다면 테스트 케이스와 일일이 손으로 체크해가면서 테스팅을 해야 하는데, 이렇게 하면 생산성이 저하된다. 대부분의 요즘 테스팅 프레임워크들은 자가 테스트를 작성하고 실행하는 기능을 제공한다.
- 테스트를 빌드하고 수행하는 데 시간이 들지라도, 결국에는 디버깅하는 시간을 줄임으로써 전체적으로 시간을 절약할 수 있게 된다.
- 리팩토링을 통해 코드에 변화를 주고 나면, 즉시 컴파일하여 내가 잘못 건드린 부분이 있는지 테스트한다. 변경한 부분이 크든 작든 상관없이 리팩토링을 한 이후에는 반드시 테스트하는 습관을 들여야한다. **"조금 변경하고 바로 테스팅 해보는 것"**,이것이 바로 리팩토링 과정의 정수이다.
- 왜 코드를 변경할 때마다 테스트 하는 게 좋냐면, 작은 변화를 주고 나서 바로 테스트하는 것이 디버깅하는데 더 수월하기 때문이다. 나중에 한꺼번에 몰아서 테스트하려고 하면 디버깅 하는게 어려워지고 시간도 오래 걸리게 된다.
- 테스트를 통과하고 나면 Git과 같은 VCS 시스템에 변경 사항을 기록한다. 나는 각각 리팩토링에 성공할 때마다 commit을 하는 편인데, 이렇게 하면 추후에 뭔가를 잘못했을 때 다시 되돌아가기 쉽다.
- 좋은 코드는 그 코드가 무엇을 하는지 명확하게 전달할 수 있어야 하고, 변수(함수) 이름은 이러한 좋은 코드의 핵심이다. 이름을 바꿈으로써 코드의 명확성을 더욱 높일 수 있다면 이름을 바꾸는 것을 _절대_ 주저하지 마라.
- **컴퓨터가 이해하는 코드는 바보도 짤 수 있다. 그러나 사람이 이해하는 코드는 오직 좋은 프로그래머만이 짤 수 있다.**
- 이름 짓는 것은 중요하면서도 까다롭다. 큰 함수를 작은 함수로 분리하는 작업도 결국 함수들의 이름을 제대로 지었을 때만 그 가치가 있다.
- 이름을 잘 지어놓으면 함수의 body 부분을 보지 않고서도 그 함수가 무엇을 하는지 알아낼 수 있다. 하지만 처음부터 이름을 제대로 짓는 것은 어렵다. 나는 우선 그 당시 생각해낼 수 있는 이름 중 제일 좋은 이름을 지어놓고, 나중에 더 좋은 이름이 생각나면 가차 없이 바꾼다. 때로는 코드를 두 번 이상 훑어보아야 진정으로 좋은 이름이 무엇인지 알게 되는 경우도 있다.
- 대부분의 프로그래머들, 심지어는 경력이 쌓인 시니어들까지도 코드의 실제 퍼포먼스를 잘 예측하지 못한다. 코드 성능에 관한 우리의 직관은 우수한 컴파일러, 현대의 캐싱 기법과 같은 기술들에 의해 보기 좋게 빗나간다. 프로그램의 성능은 대게 코드의 일부분에만 영향을 받으며, 그 외 나머지 부분이 변경된다고 해서 큰 차이를 만들지는 않는다.
- 때때로 리팩토링으로 인해 눈에 띌만한 성능 저하가 발생하기도 한다. 하지만 잘 짜인 코드의 성능을 개선하는 것이 (그렇지 않은 코드보다) 훨씬 쉽기 때문에, 리팩토링으로 인해 성능 저하가 발생한다고 하더라도 나는 리팩토링을 진행하는 편이다.
- 만약 리팩토링으로 인해 성능 이슈가 발생하면 리팩토링 이후에 성능 개선 작업을 수행한다. 이에 따라 이전에 리팩토링한 코드를 되돌리는 경우가 발생할 수도 있다. 하지만 대부분의 경우, 리팩토링함으로써 더 효과적인 성능 개선 작업을 수행할 수 있다. 궁극적으로 깨끗하고(clearer) 더 빠른 코드가 탄생하게 되는 것이다.
- 나는 최대한 데이터들을 불변(immutable)으로 다루는 것을 선호한다. 가변(mutable) 상태들은 쉽게 상하기(rotten) 때문이다.
- 간결함은 지혜의 본질이지만, 명확성은 발전하는 소프트웨어의 본질이다.
- 코드는 명확해야 한다. 코드를 수정하려고 할 때, 어느 부분을 수정해야 하는지 쉽게 찾을 수 있어야 하며, 에러를 발생시키지 않으면서 빠르게 수정할 수 있어야 한다.
- 작은 단계들을 밟아 나갈 때 더욱 빨리 진행할 수 있으면서 코드가 절대 망가지지 않고, 이러한 작은 단계들을 합쳐 거대한 변화로 만들 수 있다는 점을 인지하는 것이 효과적인 리팩토링의 핵심이다.

### 나만의 세 줄 요약

- 컴퓨터가 아니라 **사람**이 이해하기 쉬운 코드를 짜려고 노력하자.
- 리팩토링을 할 땐 **반드시** 테스트를 하자.
- 리팩토링을 할 땐 (아주) 작은 단계들로 나눠서 진행하자.