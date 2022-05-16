---
title: '프론트엔드 생태계의 상태 관리 패러다임 변화'
date: 2022-05-16
category: 'Web'
draft: false
---

이 글은 [Naver D2의 TECH CONCERT: FRONT END 2019 - 데이터 상태 관리. 그것을 알려주마](https://www.youtube.com/watch?v=o4meZ7MRd5o)를 요약 정리한 포스트입니다.

## FE에서 상태관리란?

프로트엔드는 더 이상 *웹 페이지*만 개발하는 것이 아니라, 구글 독스, gmail과 같이 *웹 앱*이라고 불리는 "애플리케이션"을 더 많이 개발하게 되었습니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/frontend-state-management-paradigm/google_docs.png" alt="구글 독스." />
    <figcaption>웹 앱의 예시: 구글 독스.</figcaption>
</figure>

이에 따라 사용자들이 모바일앱에 대해 요구하는 사항들을 웹에서도 지원해야 하는 시대에 이르렀습니다. 하지만 모바일 앱과 같은 서비스를 웹에서 만들기 위해선 기존의 전통적인 SSR 방식과 같이 페이지를 오가는 UX는 잘 맞지 않는 부분이 있습니다. 따라서, 하나의 페이지(HTML)를 띄워놓고 데이터를 주고받으면서 화면의 일부분을 변경해나가는 SPA 방식이 널리 퍼지게 되었습니다.

이때 화면(view)에 보이는 데이터뿐만 아니라 (눈에 보이지 않는) 서버와 주고받는 데이터를 모두 포함해서 **상태**라고 하고, 이를 관리하는 것을 **상태 관리**라고 합니다. 예를 들어, 일반적으로 웹에서 API 통신을 할 때 로딩 중에는 화면에 로딩 스피너를 보여줌으로써 사용자에게 향상된 UX를 제공하는 경우가 많은데, 이러한 스피너를 어느 타이밍에 표시하고 어느 타이밍에 제거할지에 대한 것도 상태 관리라고 할 수 있습니다.

### 무엇이 문제인가?

이러한 *상태*라는 것은 각각의 view에서, 때로는 view와 관계없이 필요에 의해 실시간·비동기적으로 계속해서 변화합니다. 웹 개발에서 가장 어려운 점은 웹앱이 서버와 계속해서 비동기통신을 함으로써 데이터(상태)가 비동기적으로 변화한다는 점인데, 이로 인해 **상태가 언제, 어떻게, 왜 변화하였는지 알기 힘들어집니다**.

## 상태관리 패러다임의 변화

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/frontend-state-management-paradigm/frontend_paradigm_timeline.png" alt="상태 관리 패러다임 타임라인." />
    <figcaption>상태 관리 패러다임 타임라인.</figcaption>
</figure>

### jQuery와 상태 관리

> (퍼블리셔가 만든) 이 마크업에 jQuery 바르는데 며칠이나 걸리나요?

웹의 기본 사상이, HTML은 레이아웃, CSS는 스타일, 자바스크립트는 동작을 담당하는 것입니다. 원래 자바스크립트는 웹에서 동적인 동작을 수행하기 위해 나온 언어(웹애 동작을 입히는 언어)인데, 자바스크립트를 다양한 브라우저에 대해 쉽게 개발하기 위해 나온 것이 jQuery입니다. 따라서 기본적으로 jQuery를 이용한 개발은 HTML에 jQuery를 "바르는" 형태로 진행되었습니다. 예를 들면:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/frontend-state-management-paradigm/jquery_development.png" alt="jQuery를 이용한 개발." />
    <figcaption>jQuery를 이용한 개발. 출처: https://www.youtube.com/watch?v=o4meZ7MRd5o</figcaption>
</figure>

위 그림에서와 같이, HTML이 있고 각각의 HTML 요소에 jQuery로 동작을 붙이는 방식으로 개발이 진행되었습니다. 그런데 잘 생각해보면, 빵에 잼을 바를 때 베이스는 잼이 아니라 빵입니다. 이와 비슷하게 웹 개발에서도 jQuery(잼)를 HTML(빵)에 바르는(?) 형태로 진행되므로 베이스는 jQuery가 아니라 HTML이 됩니다.

이때, 베이스가 되는 곳에 상태를 저장하고 싶어 하는 인간의 본성이 존재하기 때문에 각각의 동작이 요소의 상태를 가지는 것이 아니라 다음과 같이 HTML의 [data attribute](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes)를 이용하여 HTML(베이스)에 상태를 저장하는 방식을 흔히 사용했습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/frontend-state-management-paradigm/save_state_using_data_attribute.png" alt="data attribute를 이용하여 상태 저장" />
    <figcaption>data attribute를 이용하여 상태 저장.</figcaption>
</figure>

### jQuery를 이용한 상태 관리, 무엇이 문제인가?

jQuery를 이용하여 개발할 때 가장 흔하게 발생하는 로직을 예로 들면 아래와 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/frontend-state-management-paradigm/problem_usign_jquery.png" alt="jQuery 상태 관리 문제" />
    <figcaption>jQuery 상태 관리 문제. 출처: https://www.youtube.com/watch?v=o4meZ7MRd5o</figcaption>
</figure>

이때, 위 로직을 실행하는 중간에 `Element A`의 상태가 바뀐다면, Element B를 클릭함으로 인해 변경된 상태는 정상적인 상태가 아니게 됩니다 (변경된 `Element A`의 상태가 아니라 `Element B`를 클릭한 순간의 `Element A` 상태를 기반으로 계산했기 때문). jQuery를 이용하여 개발하다 보면 이런 일이 비일비재하게 발생하게 됩니다. 즉, 상태를 분명 변경했지만 그 결과가 전혀 엉뚱한 값으로 갱신되는 것이죠!

이는 근본적으로 베이스가 DOM이기 때문에 각 동작에서 DOM이 어떻게 바뀔지에 대한 정보를 알 수 없기 때문에 발생하는 문제입니다. jQuery로 개발하는 경우엔 상태가 언제, 어떻게, 왜 바뀌는지를 예측하기 어렵습니다.

물론 jQuery가 무조건 나쁘다는 것은 아닙니다. 오히려 단순한 페이지를 만드는 경우에는 jQuery가 더 좋은 선택일 수 있습니다. 다만 복잡한 상태관리가 필요한 웹앱에서는 jQuery의 한계점이 분명합니다.

**jQuery 상태 관리 요약**

- jQuery를 이용한 개발은 주로 DOM에 jQuery로 동작을 입히는 방식으로 진행됨. 이때 베이스가 되는 것은 DOM.
- 동작이 요소의 상태를 가지는 것이 아니라 각 요소에 상태를 저장 (data attribute 사용).
- 이에 따라 각 동작에선 요소의 상태 변화를 실시간으로 추적하기 힘듦.
- 따라서 jQuery를 이용한 상태 관리에는 위와 같은 한계점이 있기 때문에 복잡한 상태 관리를 필요로 하는 웹앱에서는 유지보수 비용이 커지고 레거시를 관리하기가 힘들어짐.

## AngularJS의 상태 관리

jQuery 등을 이용한 기존의 DOM 제어 방식은 변경이 필요한 대상 DOM 요소를 먼저 선택한 뒤 이후 필요한 작업을 수행하는 형태로 진행합니다. 반면 AngularJS는 **출력할 데이터에 초점**을 맞춰 진행되며 데이터의 값이 변경되면 이에 따른 출력도 자동으로 처리가 됩니다.

AngularJS의 기본 개념을 살펴보면:

- **모듈**이라는 개념을 기반으로 구현 (컴포넌트와 비슷)
- **Controller**라는 지시자를 이용하여 마크업 상에 영역을 생성

```js
<div ng-controller="MyController">
  Your name: <input type="text" ng-model="username" />
  <button ng-click="sayHello()">greet</button>
  {{ greeting }}
</div>

angular.module('scopeExample', [])
  .controller('MyController', ['$scope', $scope => {
    $scope.username = 'World';

    $scope.sayHello = () => {
      $scope.greeting = `Hello ${$scope.username}!`;
    }
  }]);
```

[데모 링크](https://codesandbox.io/s/angularjs-example-u6srqw?file=/index.html)

위 예시에서 input의 값을 변경하고 `greet` 버튼을 누르면 자동으로 출력값이 변합니다. 이때, 여기선 DOM의 접근하여 상태를 변경하지 않고 오직 `$scope.greeting` 값만 바꿔 화면을 변경하고 있습니다. 즉, 더 이상 DOM에 접근하지 않고 데이터만 바꿈으로써 DOM을 자동으로 변경하는 패러다임으로 전환된 것이죠!

AngularJS는 크게 아래 그림과 같은 구조로 되어 있습니다 (이러한 구조는 다른 곳에서도 널리 사용됩니다):

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/frontend-state-management-paradigm/angularjs_state_management.png" alt="AngularJS 상태 관리" />
    <figcaption>AngularJS 상태 관리. 출처: https://www.youtube.com/watch?v=o4meZ7MRd5o</figcaption>
</figure>

- 각각의 View는 Controller와 연결되어 있고, Controller는 Logic과 State를 가집니다. 그리고 모든 View는 이 State를 기반으로 생성됩니다.
- 또한, 각 View에서 공통으로 사용되는 Logic 혹은 State는 Service라는 곳에서 관리합니다.

### AngularJS를 이용한 상태 관리, 무엇이 문제인가?

앞서 jQuery에서 살펴본 상태 관리 문제를 AngularJS에 대입해봅시다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/frontend-state-management-paradigm/problem_usign_angularjs.png" alt="AngularJS 상태 관리 문제" />
    <figcaption>AngularJS 상태 관리 문제. 출처: https://www.youtube.com/watch?v=o4meZ7MRd5o</figcaption>
</figure>

이 경우에서도 마찬가지로 업데이트 프로세스 중간에 Service의 데이터가 변경된다면, jQuery에서와 같이 버그가 발생합니다. 분명 jQuery보다 좋다고 한 것 같은데요...? 🤔

버그가 발생하는 것을 아예 막을 순 없습니다. 하지만 여기선 살펴봐야 할 부분이 jQuery에 비해 줄어들었습니다. jQuery의 경우 각 상태 값을 가져다 바꾸는 동작이 구현된 곳 모두를 살펴봐야 했지만, AngularJS의 경우 공통된 데이터/로직을 저장하는 Service가 구현된 곳만 살펴보면 됩니다. jQuery의 경우에선 언제·어디서·어떻게 데이터가 바뀌었는지를 살펴보는 것이 힘들었다면, 적어도 AngularJS에선 "어디서"는 알 수 있게 된 것이죠.

## Redux와 상태 관리

이와 같은 문제로 인해 `Redux` 라는 것이 탄생하였습니다. 즉, **언제·어디서·어떻게 상태가 변화했는지를 알기 어려운 이유로 인해** 탄생한 것이죠.

Redux는 다음의 3가지 패턴의 조합으로 볼 수 있습니다:

> Redux = FLUX + CQRS + Event Sourcing

### Flux

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/frontend-state-management-paradigm/flux_architecture.png" alt="Flux 아키텍처" />
    <figcaption>Flux 아키텍처. 출처: https://facebook.github.io/flux/docs/in-depth-overview/</figcaption>
</figure>

- 데이터의 흐름이 단방향. 만약 Store의 상태를 변경하고 싶다면 View 에서 Actions을 Dispatcher에게 보내 업데이트해야 함.
- View는 Store에서 데이터를 읽는 것만 하고, Store를 업데이트하는 로직은 View와 분리되어 있음.

### CQRS (Command Query Responsibility Segregation)

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/frontend-state-management-paradigm/cqrs.png" alt="CQRS" />
    <figcaption>CQRS. 출처: https://martinfowler.com/bliki/CQRS.html</figcaption>
</figure>

- 간략히 말해, 상태를 읽어오는 로직과 상태를 업데이트하는 로직을 개념적으로 분리한 모델.

### Event Sourcing

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/frontend-state-management-paradigm/event_sourcing.png" alt="Event sourcing" />
    <figcaption>Event sourcing. 출처: https://docs.microsoft.com/en-us/azure/architecture/patterns/event-sourcing</figcaption>
</figure>

- 간략히 말해, 상태를 변경하고 싶으면 이걸 event sequence로 저장한다는 뜻. 즉, 상태를 바꾸고 싶으면 event를 날려서 기록 하라는 것 (FLUX에서의 Action). 이렇게 하면 로그가 남게 되고, 이 로그를 통해 이후에 체크할 수 있음.

### Redux

위 세 개를 결합한 것이 바로 Redux 입니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/frontend-state-management-paradigm/redux.png" alt="Redux" />
    <figcaption>Redux 구조.</figcaption>
</figure>

- 전체 구조는 Flux 패턴과 흡사. Flux의 Dispatcher가 Reducer로 바뀌었고, Middleware 라는 것이 중간에 추가되었을 뿐임. 이때 Middleware는 View에서 Action을 날려 Reducer를 통해 Store를 업데이트하기 전에, API 호출과 같이 중간에 데이터를 변경해야 하는 로직 등이 들어가는 부분임.
- Redux에서 Store는 하나의 자바스크립트 객체로 관리하는데, View에서는 오직 상태를 "읽기"만 하므로, Store는 **읽기 전용 객체**라고 할 수 있음.
- 그럼 Reducer에서 어떻게 Store를 변경하느냐? Store의 어떤 상태에 접근해서 `=` 등을 이용하여 값을 바꿔치기하는 게 아니라, Reducer를 통해 새로운 상태를 만들어서 **객체를 통째로 바꿔치기** 하는 것임. 즉, 새로운 상태가 생길 때마다 새로운 자바스크립트 객체가 생기는 것.
- 이렇게 되면 View는 단순히 상태를 보여주는 (순수한) 컴포넌트가 되므로, View에 대한 테스트 케이스를 짤 수 있게 됨. 순수한 컴포넌트란, 함수형 프로그래밍에서의 순수 함수와 비슷한 맥락. 즉, 동일한 상태에 대해선 항상 동일한 View가 구성됨.
- 이로 인해 테스트하기 수월해지고, 모든 상태 변화는 Action을 통해 일어나므로 로그가 남게 되어 로그 분석을 통해 상태들이 어떻게 변경되었는지를 파악하기 쉬워짐.
- 이것은 프론트엔드 개발에 있어 시간의 제약을 정복한 것과 같다고 할 수 있음. 내가 원하는 상태로 언제든 되돌릴 수 있고, 그 시점의 화면이 어떻게 나왔는지 알 수 있게 되는 것임.

### Redux를 이용한 상태 관리, 무엇이 문제인가?

- 보일러 플레이트가 많다 ([Redux Toolkit](https://redux-toolkit.js.org/)을 이용하여 더 간편하게 사용할 수도 있다!)
- 그리고 또..?

## 정리

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/frontend-state-management-paradigm/summary.png" alt="전체 내용 요약" />
    <figcaption>전체 내용 요약. 출처: https://www.youtube.com/watch?v=o4meZ7MRd5o</figcaption>
</figure>

**한 줄 정리: 상태 관리 방법은 애플리케이션의 아키텍처를 결정하는 결정적인 요소이기 때문에 개발을 시작하기 전에 아주 치열하게 고민해야 한다.**

## + 추가로 보면 유익한 영상

[Naver D2의 TECH CONCERT: FRONT END 2019 - 빠르게 훑어보는 웹 개발 트렌드](https://www.youtube.com/watch?v=BXOH9b177ho)

**한줄 정리: 트렌드는 계속 변한다. 따라서 계속 공부하는 수밖에 없다. 풀스택에는 물리적인 한계(시간)가 존재할 수밖에 없다. 전문분야(프론트/백)을 선택하는게 효율적이지 않을까?**
