---
title: '자바스크립트에서 재귀호출로 인한 스택 오버플로우를 막는 방법'
date: 2022-04-15
category: 'JavaScript'
draft: false
---

자바스크립트로 프로그래밍을 하다가 한 번쯤은 아래와 같은 에러를 만나보셨을 겁니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/prevent-stack-overflow-in-js/fig1.png" alt="자바스크립트의 스택 오버플로우 에러" />
  <figcaption>자바스크립트의 스택 오버플로우 에러</figcaption>
</figure>

이는 에러에서 설명하고 있듯이, 자바스크립트의 콜 스택의 크기가 꽉 차서 더 이상의 스택 프레임을 생성할 수 없다는 뜻입니다. 즉, 너무 많은 재귀 호출로 인해 더 이상 함수를 호출할 수 없다는 것이라고 할 수 있겠습니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/prevent-stack-overflow-in-js/fig2.png" alt="자바스크립트의 스택 오버플로우" />
</figure>

예를 들어, 다음과 같은 재귀 함수를 실행해보면 에러가 나는 것을 확인할 수 있습니다:

```js
let count = 0;
let maxCount = 50000;

function fn() {
  if (++count >= maxCount) {
    console.log(count);
    return;
  };
  fn();
}

fn(); // RangeError: Maximum call stack size exceeded
```

그럼 재귀 호출로 인한 스택 오버플로우 에러를 해결하는 방법엔 무엇이 있을까요?

재귀 구조를 반복문으로 바꾸는 방법 이외에, 재귀 구조를 그대로 유지하면서 스택 오버플로우 에러를 해결할 수 있는 방법의 하나는 `setTimeout`을 이용하는 것입니다:

```js
let count = 0;
let maxCount = 50000;

function fn() {
  if (++count >= maxCount) {
    console.log(count);
    return;
  };
  setTimeout(fn, 0);
}

fn(); // 50000
```

이는 [자바스크립트의 이벤트 루프](./browser-event-loop.md) 특성을 생각해보면 당연합니다. 콜 스택에 함수를 계속해서 쌓아가는 대신, `setTimeout`을 통해 태스크 큐에 함수를 등록하고, **콜 스택이 비면** 큐에서 함수를 꺼내 실행하는 방식으로 동작하므로 스택 오버플로우가 발생하지 않는 것입니다. 이를 간략하게 나타내면 아래 상황과 같습니다:

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/prevent-stack-overflow-in-js/fig3.png" alt="setTimeout()을 사용한 경우" />
  <figcaption>setTimeout()을 사용한 경우</figcaption>
</figure>

브라우저 환경이 아닌, Node.js의 경우 `setImmediate`를 사용해도 동일한 결과를 얻을 수 있습니다. 이 또한 Node.js의 이벤트 루프 특성을 생각해보면 가능한 일입니다 ([Node.js의 이벤트 루프](./nodejs-event-loop-1.md)는 브라우저 환경의 이벤트 루프와는 차이가 있습니다)

```js
let count = 0;
let maxCount = 50000;

function fn() {
  if (++count >= maxCount) {
    console.log(count);
    return;
  };
  setImmediate(fn);
}

fn(); // 50000
```
