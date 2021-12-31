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

즉, 프로미스 객체는 (주로) 비동기 동작의 결과(🠖성공 or 실패)와 동작의 결과값을 나타내는 데에 흔히 사용됩니다. 어떤 동작의 중간 상태를 나타내는 객체라고 볼 수도 있는데, 프로미스의 이름이 "프로미스"인 이유는 미래의 어느 시점에 동작의 결과를 반환할 것이라고 "약속"하는 것이기 때문입니다. 정확히 어느 시점에 동작이 끝나서 결과를 반환할지는 확신할 수 없지만, (성공이든 실패든) 동작이 끝났을 때 여러분이 작성한 후속 처리 코드가 실행될 것임은 보장할 수 있습니다. 또한, (비동기) 연산이 수행되는 동안 다른 코드의 실행을 "block"하지 않는다는 점이 장점입니다.

## 탄생 배경

프로미스가 등장하게 된 배경을 알아보기 위해, 우선 기존에 비동기 동작을 처리할 때 사용된 콜백 스타일에 대해 간략히 살펴보겠습니다.

예를 들어, 다음과 같이 현재 동작을 수행하기 위해선 이전의 (비동기) 동작의 결과값이 필요한 경우가 있을 수 있습니다:

```js
opA(resultA => {
	opB(resultA, resultB => {
		opC(resultB, resultC => {
			opD(resultC, resultD => {
				// ...
			}, failureCallback);
		}, failureCallback);
	}, failureCallback);
}, failureCallback);
```

([데모](https://codesandbox.io/s/callback-hell-example-gypy0?file=/src/index.js))

물론, 예시를 위해 꾸며낸 코드이지만, 실제론 DB에 접근하여 데이터를 가져온 후 파일을 읽고서 다시 API를 호출하고, ... 와 같은 상황이 있을 수 있습니다.

위와 같이 콜백 함수들이 계속해서 중첩되는 것을 [콜백 지옥](https://www.freecodecamp.org/news/how-to-deal-with-nested-callbacks-and-avoid-callback-hell-1bc8dc4a2012/)이라고 합니다. 지옥이라는 표현을 쓸 정도로 끔찍하죠 👿

위 코드는 정말 간단한 예시이기 때문에 못느끼실수도 있겠습니다만 콜백 지옥으로 인해 인덴트가 계속해서 중첩되고, 그에 따라 코드의 가독성이 하락하는 문제가 발생할 수 있습니다.

프로미스는 이와 같은 콜백 지옥을 해결하기 위해 등장했습니다. 프로미스를 이용하여 위 코드를 다음과 같이 바꿀 수 있습니다:

```js
opA()
	.then(resultA => {
		return opB(resultA);	
	})
	.then(resultB => {
		return opC(resultB);
	})
	.then(resultC => {
		return opD(resultC);
	})
	.catch(failureCallback);

// 혹은

opA()
	.then(resultA => opB(resultA))
	.then(resultB => opC(resultB))
	.then(resultC => opD(resultC))
	.catch(failureCallback);
```

([데모](https://codesandbox.io/s/resolve-callback-hell-with-promise-39sw2?file=/src/index.js))

훨씬 나은것 같지 않나요? 여기서 각각의 `.then` 메서드는 이전 동작이 완료되고 나서야 수행됩니다. 이때, `.then` 메서드는 프로미스를 반환하기 때문에 위와 같이 여러 개를 연결하여 사용할 수도 있습니다. 또한, 에러를 처리하기 위해선 단 한개의 `.catch`만 사용하면 됩니다.

물론 위 코드를 아래와 같이 단순화할 수 있습니다:

```js
opA().then(opB).then(opC).then(opB).catch(failureCallback);
```

([데모](https://codesandbox.io/s/resolve-callback-hell-with-promise-simpler-version-nl00u?file=/src/index.js))

왜냐하면 `fn((arg) => func(arg))`는 `fn(func)`와 동일한 코드니까요!

<br />
 
📢 사실 async/await 문법을 이용하여 위 코드를 더욱 개선할 수 있습니다만, async/await는 다른 포스트에서 다룰게요!

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