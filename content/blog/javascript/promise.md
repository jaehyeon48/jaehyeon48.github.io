---
title: '자바스크립트 프로미스'
date: 2021-12-31
category: 'javascript'
draft: false
---

*현재 작성중인 포스트입니다.

## 프로미스란?

[ECMAScript 2022 명세서](https://tc39.es/ecma262/#sec-promise-objects)에 따르면, 

> 프로미스는 (아마도 비동기식으로 동작할 가능성이 높은) 지연된 계산의 최종 결과물에 대해 일종의 프록시로서 사용되는 객체입니다.

즉, 프로미스 객체는 (주로) 비동기 동작의 결과(🠖성공 or 실패)와 동작의 결과값을 나타내는 데에 흔히 사용됩니다.

## 프로미스의 상태

프로미스는 다음의 상호 배타적인 세 가지 상태 중 하나에 속합니다:

- **fulfilled**: 프로미스 객체 `p`에 대해, `p.then(onFulfilled, onRejected)`에서 함수 `onFulfilled`를 호출하기 위해 즉시 [작업](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#job)을 큐에 등록하는 경우, `p`는 **fulfilled** 상태입니다. 즉, 동작이 성공적으로 수행되었음을 의미합니다.
- **rejected**: 프로미스 객체 `p`에 대해, `p.then(onFulfilled, onRejected)`에서 함수 `onRejected`를 호출하기 위해 즉시 [작업](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#job)을 큐에 등록하는 경우, `p`는 **rejected** 상태입니다. 즉, 동작이 실패했음을 의미합니다.
- **pending**: 프로미스 객체가 fulfilled 상태도 아니고 rejected 상태도 아닌 경우, 해당 프로미스는 **pending** 상태에 있습니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/promise/promise_lifecycle.png" alt="Promise Lifecycle">
    <figcaption>프로미스 라이프 사이클</figcaption>
</figure>

이때 프로미스가 pending 상태가 아니라면, 즉 fulfilled 상태이거나 rejected 상태이면 해당 프로미스가 **settled** 되었다고 합니다 (편의상 settled라고 하는 것이지 실제로 "settled"라는 상태가 있는 건 아닙니다).

## 프로미스의 운명

프로미스는 다음의 상호 배타적인 두 가지 운명 중 하나에 속합니다:

- **resolved**: settled 되었거나, 다른 프로미스의 상태에 맞추기 위해 "잠긴(locked in)" 상황을 의미합니다. 이미 resolved된 프로미스를 resolve 하거나 reject 하려고 해도 아무런 일이 발생하지 않습니다.
- **unresolved**: resolved가 아닌 프로미스들은 모두 unresolved 입니다. unresolved인 프로미스를 resolve 하거나 reject 하려고 하면 해당 프로미스에 영향을 미칩니다.

프로미스는 또 다른 프로미스 혹은 thenable*로 "resolve" 될 수 있습니다. 이 경우, 프로미스는 이후에 사용할 프로미스 혹은 thenable을 저장합니다. 또는, 프로미스가 아닌 값으로 "resolve"될 수도 있습니다. 이 경우, 프로미스는 해당 값으로 fulfilled 됩니다.

<small>* then() 메서드를 가지고 있는 객체를 thenable 이라고 합니다. 모든 프로미스는 thenable 이지만, 모든 thenable이 프로미스인 것은 아닙니다.</small>

## 프로미스의 상태와 운명의 관계

resolved인 프로미스는 다음의 세 가지 상태 중 하나에 속합니다:

- **fulfilled**: 프로미스가 아닌 값으로 resolve 되었거나, fulfilled 상태인 또 다른 프로미스로 resolve 되었거나, fulfillment 핸들러를 전달받는 즉시 해당 핸들러를 호출하여 fulfilled가 될 thenable 로 resolve된 경우, 해당 프로미스는 fulfilled 상태입니다.
- **rejected**: 자신(프로미스)이 reject 되었거나, rejected 상태인 또 다른 프로미스로 resolve 되었거나, rejection 핸들러를 전달받는 즉시 해당 핸들러를 호출하여 rejected가 될 thenable로 resolve된 경우, 해당 프로미스는 rejected 상태입니다.
- **pending**: pending 상태인 또 다른 프로미스로 resolve 되었거나, 어떠한 (fulfillment 혹은 rejection) 핸들러도 실행할 계획이 없는 thenable로 resolve 된 경우, 해당 프로미스는 pending 상태입니다.

<br />

앞서 resolved가 아닌 프로미스는 모두 unresolved라고 했는데, 잘 생각해보면 unresolved인 프로미스는 무조건 pending 상태임을 알 수 있습니다. 상태는 크게 pending 아니면 settled로 나뉘는데 만약 settled 상태라고 한다면 해당 프로미스는 resolved라는 뜻이니까요!

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/promise/promise_states_and_fates.png" alt="Relating promise's states and fates">
    <figcaption>프로미스의 상태와 운명간의 관계</figcaption>
</figure>

이를 표로 정리해보면 아래와 같습니다:

|**동작**|**의존성**|**상태**|**resolved?**|**settled?**|
|-|-|-|-|-|
|`new Promise((resolve, reject) => ...)`|❌|pending|❌|❌|
|`...resolve(thenable)`|locked in|pending*|🟢|❌|
|`...resolve(other)`|❌|fulfilled|🟢|🟢|
|`...reject(any)`|❌|rejected|🟢|🟢|

<small>*해당 프로미스가 어떤 상태가 될지는 thenable에 달려있습니다.</small>

프로미스가 어떤 상태가 될지는 thenable에 달린 경우, 즉 프로미스가 thenable에 "locked in"된 경우는 [이 데모](https://codesandbox.io/s/hidden-cache-mj5pk?file=/src/index.js:0-611)에서 보실 수 있습니다.

## References

[https://stackoverflow.com/questions/35398365/js-promises-fulfill-vs-resolve#answer-56850392](https://stackoverflow.com/questions/35398365/js-promises-fulfill-vs-resolve#answer-56850392)

[https://github.com/domenic/promises-unwrapping/blob/master/docs/states-and-fates.md](https://github.com/domenic/promises-unwrapping/blob/master/docs/states-and-fates.md)

[https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise-objects](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise-objects)

[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)