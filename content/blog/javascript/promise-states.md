---
title: '자바스크립트 프로미스와 프로미스 상태'
date: 2021-12-31
category: 'JavaScript'
draft: false
---

## 프로미스란?

[ECMAScript 2022 명세서](https://tc39.es/ecma262/#sec-promise-objects)에 따르면,

> 프로미스는 (아마도 비동기로 동작하는) 지연된 계산의 최종 결과물에 대해 일종의 프록시로서 사용되는 객체입니다.

처음에 이 문장을 보고 도대체 무슨 소리인지 이해가 안됐습니다 😂. 그래서 고민 끝에 제 나름대로 다음과 같이 정의를 내려봤습니다:

> 자바스크립트의 프로미스란, 미래의 어느 시점에 어떤 값 혹은 에러로 대체될 "구멍(hole)" 혹은 placeholder 이다. 

다시 말해, 프로미스는 정확히 언젠지는 알 수 없지만 미래의 어느 시점에 어떤 값 혹은 에러로 귀결(resolve)되는 객체라고 생각합니다. 저는 "프로미스"라는 이름을 정말 잘 지었다고 생각하는데요, "프로미스"라는 말 그대로 자바스크립트가 개발자에게 "정확히 언제라곤 못하지만 언젠가 어떤 연산을 수행한 결과값(혹은 에러)을 너에게 알려준다고 **약속**할게" 라고 말하는 것이라 생각합니다.

또한, 조금 다른 시각에서 생각해보자면 프로미스는 자바스크립트에서 비동기를 일관된 방식으로 처리하도록 하는 인터페이스라고 할 수도 있을것 같습니다.

## 탄생 배경

프로미스가 등장하게 된 배경을 알아보기 위해, 우선 기존에 비동기 동작을 처리할 때 사용된 콜백 스타일에 대해 간략히 살펴보겠습니다. 예를 들어, 다음 코드와 같이 어떤 연산을 수행하기 위해선 이전 연산의 결과값이 필요한 경우가 있을 수 있습니다:

<iframe src="https://codesandbox.io/embed/callback-hell-example-qwfssq?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="Callback Hell Example"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

물론, 예시를 위해 꾸며낸 코드이지만, 실제론 DB에 접근하여 데이터를 가져온 후 파일을 읽고서 다시 API를 호출하고, ... 와 같은 상황이 있을 수 있습니다.

위와 같이 콜백 함수들이 계속해서 중첩되는 것을 [콜백 지옥](https://www.freecodecamp.org/news/how-to-deal-with-nested-callbacks-and-avoid-callback-hell-1bc8dc4a2012/)이라고 합니다. 지옥이라는 표현을 쓸 정도로 끔찍하죠 👿 위 코드는 정말 간단한 예시이기 때문에 못느끼실수도 있겠습니다만 콜백 지옥으로 인해 인덴트가 계속해서 중첩되고, 그에 따라 코드의 가독성이 하락하는 문제가 발생할 수 있습니다.

프로미스는 이와 같은 콜백 지옥을 해결하기 위해 등장했습니다. 프로미스를 이용하여 위 코드를 다음과 같이 바꿀 수 있습니다:

<iframe src="https://codesandbox.io/embed/resolve-callback-hell-with-promise-39sw2?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="Resolve Callback Hell with Promise"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

훨씬 나은것 같지 않나요? 여기서 각각의 `.then` 메서드는 이전 동작이 완료되고 나서야 수행됩니다. 이때, `.then` 메서드는 프로미스를 반환하기 때문에 위와 같이 여러 개를 연결하여 사용할 수도 있습니다. 또한, 에러를 처리하기 위해선 단 한개의 `.catch`만 사용하면 됩니다.

이때 위 코드의 경우, `fn((arg) => func(arg))`는 `fn(func)`과 동일한 코드이므로 아래와 같이 단순화할 수 있습니다:

```js
opA().then(opB).then(opC).then(opB).catch(failureCallback);
```

<iframe src="https://codesandbox.io/embed/resolve-callback-hell-with-promise-simpler-version-nl00u?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="Resolve Callback Hell with Promise simpler version"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

<br />
 
📢 사실 async/await 문법을 이용하여 위 코드를 더욱 개선할 수 있습니다만, async/await는 다른 포스트에서 다룰게요!

## 프로미스의 상태

프로미스는 다음의 세 가지 상태 중 하나에 속합니다. 이때 프로미스가 속한 상태는 상호 배타적이라서, 동시에 두 상태가 아닌 오직 하나의 상태에만 속하게 됩니다:

- **fulfilled**: 작업을 성공적으로 수행되었음을 의미하는 상태입니다.
- **rejected**: 작업이 실패했음을 수행되었음을 의미하는 상태입니다.
- **pending**: 초기 상태로서, `fulfilled`도 아니고 `rejected`도 아닌 경우입니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/promise/promise_lifecycle.png" alt="프로미스 라이프 사이클">
    <figcaption>프로미스 라이프 사이클</figcaption>
</figure>

이때 프로미스가 pending 상태가 아니라면, 즉 fulfilled 상태이거나 rejected 상태이면 해당 프로미스가 **settled** 되었다고 합니다 (편의상 settled라고 하는 것이지 실제로 "settled"라는 상태가 있는 건 아닙니다).

## 프로미스의 운명(Fate)

프로미스를 사용할 때 흔히 "resolve"라는 말을 사용하는데, 이는 프로미스의 *운명*과 연관된 말입니다. 프로미스의 운명은 크게 두 가지가 있습니다:

- **resolved(귀결됨)**: settled 되었거나, 다른 프로미스의 상태에 맞추기 위해 "잠긴(locked in)" 상황을 의미합니다. 이미 귀결된 프로미스를 resolve 하거나 reject 하려고 해도 아무런 일이 발생하지 않습니다.
- **unresolved**: resolved가 아닌 프로미스들은 모두 unresolved 입니다. unresolved인 프로미스를 resolve 하거나 reject 하려고 하면 해당 프로미스에 영향을 미칩니다.

여기서 프로미스가 귀결될 때 "다른 프로미스의 상태에 맞추기 위해 잠긴 상황"이라는 것은, 예를 들면 A 프로미스가 B 프로미스로 귀결되어 B 프로미스가 귀결되는 상태에 따라 A 프로미스의 상태또한 결정된다는 것입니다. 만약 B 프로미스가 어떤 값으로 fulfill 되면 A 프로미스또한 해당 값으로 fulfill 되고, B 프로미스가 어떤 에러로 reject 되면 A 프로미스또한 해당 에러로 reject 된다는 것이죠! 그리고 "잠겼다"는 말은 A 프로미스가 B 프로미스로 귀결되어 B 프로미스의 상태를 따라가므로, 이미 다른 프로미스로 귀결된 A 프로미스를 귀결하거나 reject 하려고 해도 아무런 일이 발생하지 않는다는 뜻입니다.

<iframe src="https://codesandbox.io/embed/resolved-to-another-promise-vv9ir0?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="Resolved to another promise"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>


## 프로미스의 상태와 운명의 관계

resolved인 프로미스는 다음의 세 가지 상태 중 하나에 속합니다:

- **fulfilled**: 어떤 값으로 귀결되었거나, fulfilled 상태인 또 다른 프로미스로 귀결된 경우, 해당 프로미스는 fulfilled 상태입니다.
- **rejected**: 어떤 에러로 reject 되었거나, rejected 상태인 또 다른 프로미스로 귀결된 경우, 해당 프로미스는 rejected 상태입니다.
- **pending**: pending 상태인 또 다른 프로미스로 귀결된 경우 해당 프로미스는 pending 상태입니다.

<br />

앞서 `resolved`가 아닌 프로미스는 모두 `unresolved`라고 했는데, 잘 생각해보면 `unresolved`인 프로미스는 무조건 `pending` 상태임을 알 수 있습니다. 상태는 크게 `pending` 아니면 `settled`로 나뉘는데 만약 `settled` 상태라고 한다면 해당 프로미스는 `resolved`라는 뜻이니까요:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/promise/promise_states_and_fates.png" alt="프로미스의 상태와 운명간의 관계">
    <figcaption>프로미스의 상태와 운명간의 관계</figcaption>
</figure>

이를 표로 정리해보면 아래와 같습니다:

| **동작**                                | **의존성** | **상태**  | **resolved?** | **settled?** |
| --------------------------------------- | ---------- | --------- | ------------- | ------------ |
| `new Promise((resolve, reject) => ...)` | ❌         | pending   | ❌            | ❌           |
| `...resolve(thenable)`                  | locked in  | pending\* | 🟢            | ❌           |
| `...resolve(other)`                     | ❌         | fulfilled | 🟢            | 🟢           |
| `...reject(any)`                        | ❌         | rejected  | 🟢            | 🟢           |

<small>\*해당 프로미스가 어떤 상태가 될지는 thenable에 달려있습니다.</small>


## References

- [https://stackoverflow.com/questions/35398365/js-promises-fulfill-vs-resolve#answer-56850392](https://stackoverflow.com/questions/35398365/js-promises-fulfill-vs-resolve#answer-56850392)
- [https://github.com/domenic/promises-unwrapping/blob/master/docs/states-and-fates.md](https://github.com/domenic/promises-unwrapping/blob/master/docs/states-and-fates.md)
- [https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise-objects](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise-objects)
- [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
