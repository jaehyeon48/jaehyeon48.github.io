---
title: '자바스크립트 async & await'
date: 2022-01-11
category: 'JavaScript'
draft: false
---

## Async 함수와 await

자바스크립트의 `async` 함수는 [프로미스](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)를 좀 더 편하게 사용할 수 있도록 해주는 문법입니다. 다음의 예를 살펴봅시다:

```js
async function fetchJsonAsync(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    // error handling logic
  }
}
```

위 코드를 기존의 프로미스 방식으로 바꾸면 다음과 같습니다:

```js
function fetchJsonViaPromise(url) {
  return fetch(url)
    .then(res => res.json())
    .catch(error => /* error handling logic */);
}
```

이 예제에서 볼 수 있듯, `async` 함수 내부에서 프로미스 기반의 코드를 마치 동기식으로 동작하는 것처럼 작성할 수 있습니다.

또한 `await` 키워드를 사용하여 해당 프로미스가 settle 될 때까지 `async` 함수의 실행을 일시 중단했다가, 이후 프로미스가 settle 되면 이전에 중단된 지점부터 다시 실행을 이어나갑니다. 이때:

- 프로미스가 fulfill 되면 `await`는 프로미스의 fulfillment 값을 반환합니다.
- 프로미스가 reject 되면 `await`는 프로미스의 rejection 값을 반환합니다.

<br />

만약 프로미스가 아닌 값과 `await`를 사용한다면 해당 값은 [resolved Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve)로 변환됩니다:

```js
async function func() {
  const a = await 1;
  console.log(a);
}

func(); // 1
```

⚠️ 여기서 알아두셔야할 점은, ES2022를 기준으로 `await`는 반드시 `async` 함수 내부, 혹은 모듈의 top-level 에서만 사용할 수 있습니다. 그렇지 않으면 에러가 발생합니다:

```js
function notAsyncFunc(url) {
  // SyntaxError: await is only valid in async functions
  // and the top level bodies of modules
  const response = await fetch(url);
  // ...
}
```

```js
// valid syntax
const data = fetch('some url')
  .then(res => res.json());

export default await data;
```

<br />

`async` 함수는 항상 프로미스를 리턴합니다. 만약 리턴값이 프로미스가 아닌 경우 암묵적으로 프로미스 객체로 변환된 후 리턴됩니다:

```js
async function func() {
  return 1;
}

func().then(val => console.log(val)); // 1

async function func2() {
  throw new Error('errrrrr!');
}

func2().catch(err => console.log(err)); // Error: errrrrr!
```

## Async 함수의 동작 원리

다음 코드를 살펴봅시다:

```js
const myPromise1 = () => Promise.resolve('myPromise1');
const myPromise2 = () => Promise.resolve('myPromise2');

async function func() {
  console.log('func start');
  const res1 = await myPromise1();
  console.log(res1);
  const res2 = await myPromise2();
  console.log(res2);
  console.log('func end');
}

console.log('before func');
func();
console.log('after func');
```

위 코드의 결과는 다음과 같습니다:

```
before func
func start
after func
myPromise1
myPromise2
func end
```

왜 이러한 결과가 나오는지 한번 알아봅시다.

<hr />

우선, 자바스크립트 엔진이 `console.log('before func');`을 보고 이 함수를 콜스택에 추가하여 실행한 뒤, 다시 콜스택에서 제거합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/async-and-await/async_function_under_the_hood_1.png" alt="How async function works under the hood 1">
</figure>

그 다음, `func()` 함수를 콜스택에 추가한 후 실행합니다. 이후 `func()` 안에 있는 `console.log('func start')`를 콜스택에 추가하여 실행하고, 실행 후 다시 콜스택에서 제거합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/async-and-await/async_function_under_the_hood_2.png" alt="How async function works under the hood 2">
</figure>

이후 자바스크립트 엔진이 `await` 키워드를 보고서는 대기(await)의 대상이 되는 값을 실행합니다. 이 경우 `myPromise1()`이 되겠죠!

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/async-and-await/async_function_under_the_hood_3.png" alt="How async function works under the hood 3">
</figure>

이때, `await` 키워드를 만나게 되면 `async` 함수는 해당 부분에서 일시 정지(suspended) 됩니다. 즉 함수가 콜스택으로 부터 제거되어 마이크로태스크 큐 내에서 실행되게 됩니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/async-and-await/async_function_under_the_hood_4.png" alt="How async function works under the hood 4">
</figure>

이렇게 되면 해당 `async` 함수가 콜스택에서 제거되었으므로 제어권이 이전 프레임으로 넘어갑니다. 이 경우 글로벌 실행 컨텍스트가 되겠네요 (만약 방금 일시 정지된 `async` 함수가 중첩된 함수였다면 이 함수를 호출한 바깥 함수로 제어권이 넘어가게 됩니다). 이렇게 글로벌 실행 컨텍스트로 제어권이 다시 넘어갔기 때문에 이전에 실행되던 부분을 이어서 실행하게 됩니다. 이 경우 `console.log('after func');`를 실행하겠네요!

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/async-and-await/async_function_under_the_hood_5.png" alt="How async function works under the hood 5">
</figure>

이제 더 이상 콜스택에 남아있는게 없으므로 자바스크립트 엔진은 마이크로태스크 큐에서 대기(queue up)하고 있는 태스크가 있는지 살펴봅니다. 지금은 `func()`가 기다리고 있던 `myPromise1`이 resolve된 상태이므로 `func()`가 마이크로태스크 큐에서 대기(queued up)하고 있습니다. 이를 큐에서 꺼내서 콜스택에 추가하여 실행합니다. 이렇게 되면 `func()` 함수는 이전에 중단된 지점부터 다시 실행을 이어나가게 되는데, 여기선 `myPromise1`이 resolve한 값을 받아 `res1`에 저장하고 `console.log(res1);`을 실행합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/async-and-await/async_function_under_the_hood_6.png" alt="How async function works under the hood 6">
</figure>

이제 다시 `await` 키워드를 만나게 되었는데, 앞서 살펴본 것과 동일한 상황이 전개됩니다. `myPromise2`가 resolve될 때까지 `func()` 함수는 마이크로태스크 큐로 가서 실행되다가, `myPromise2`가 resolve되면 대기 상태가 되어 실행되기를 기다리게 됩니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/async-and-await/async_function_under_the_hood_7.png" alt="How async function works under the hood 7">
</figure>

그러다 콜스택이 비면 `func()`는 다시 콜스택에 추가되어 실행됩니다. 이때도 마찬가지로 `myPromise2`가 resolve한 값이 `res2`에 저장되고 `console.log(res2);`와 `console.log('func end')`가 실행된 후 최종적으로 `func()` 함수도 종료됩니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/async-and-await/async_function_under_the_hood_8.png" alt="How async function works under the hood 8">
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/async-and-await/async_function_under_the_hood_9.png" alt="How async function works under the hood 9">
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/async-and-await/async_function_under_the_hood_final.png" alt="How async function works under the hood final">
</figure>

## References

[async function - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)

[JavaScript for impatient programmers (ES2021 edition)](https://exploringjs.com/impatient-js/)

[JavaScript Visualized: Promises & Async/Await - Lydia Hallie](https://dev.to/lydiahallie/javascript-visualized-promises-async-await-5gke#asyncawait)