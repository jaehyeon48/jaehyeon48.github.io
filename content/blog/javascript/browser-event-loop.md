---
title: '브라우저 환경에서의 이벤트 루프'
date: 2020-10-03
category: 'JavaScript'
draft: false
---

자바스크립트는 싱글 스레드 기반의 언어이고, 자바스크립트 엔진은 오직 하나의 콜 스택을 사용합니다. 즉, 한 번에 최대 하나의 작업만을 처리할 수 있다는 것입니다. 이때, 네트워크 요청과 같이 오버헤드가 큰 작업이 동기적으로 처리된다면 유저가 발생시킨 이벤트 혹은 렌더링과 같은 다른 작업을 처리할 수 없게 되는 문제가 발생할 수 있습니다. 따라서 자바스크립트의 실행 환경(런타임)인 브라우저나 Node.js에서는 비동기 작업을 수행할 수 있도록 다양한 기능을 제공합니다.

이를 위해 자바스크립트의 실행 환경인 브라우저나 Node.js 에서는 (자바스크립트가 싱글 스레드인 것과는 달리) 여러 개의 스레드가 사용되는데, 이렇게 여러 스레드를 사용하는 실행 환경과 자바스크립트 엔진을 연동하기 위해 사용되는 장치가 바로 **이벤트 루프**입니다. 즉, 싱글 스레드로 동작하는 자바스크립트에 동시성을 제공하기 위해 사용되는 장치가 이벤트 루프인 것이죠!

이벤트 루프가 "루프"라고 불리는 이유는, 이벤트 루프의 동작 방식이 계속해서 작업들을 실행하는 무한루프와 같기 때문입니다. 또한, 이벤트 루프의 한 iteration을 `tick` 이라고 합니다. 

수도 코드로 이벤트 루프를 아주 간단히 나타내면 다음과 같습니다:

```js
while (eventLoop.waitForTask()) { // 작업이 있는지 살펴본다음
  eventLoop.processNextTask(); // 작업을 처리합니다
}
```

브라우저 환경의 이벤트 루프와 Node.js 환경의 이벤트 루프는 내부적으로 다소 다르게 구현되어 있는데, 이 포스트에선 브라우저 환경의 이벤트 루프를 살펴보겠습니다. (참고로, Chrome/Chromium은 이벤트 루프의 구현 라이브러리로 `libevent` 를, Node.js는 `libuv` 를 사용합니다).

우선 내용을 자세히 살펴보기 전에, 브라우저에서의 자바스크립트 실행 환경을 그림으로 나타내면 다음과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/browser_runtime_in_a_nutshell.png" alt="browser runtime in a nutshell" />
    <figcaption>브라우저의 자바스크립트 실행 환경.</figcaption>
</figure>

## (매크로) 태스크 큐

위에서 살펴본 것처럼 이벤트 루프는 작업, 즉 "task"가 들어오기를 기다렸다가, task가 들어오면 해당 task를 실행하는 것을 반복하는 일종의 무한 루프라고 할 수 있습니다. 이때 `task`라는 것은 `<script>` 태그로 불러온 자바스크립트를 실행하는 작업, (클릭 이벤트와 같이) 이벤트가 발생했을 때 해당 이벤트를 처리하는 핸들러(콜백)을 실행하는 작업, `setTimeout` , `setInterval`을 이용하여 설정한 콜백을 실행하는 작업, 렌더링 작업등이 모두 포함됩니다. 또한 task는 잠시 후에 살펴볼 microtask와 구분짓기 위해 macrotask라고도 합니다.

이러한 태스크들은 **태스크 큐(task queue)**라는 곳에 저장되는데, [HTML 스펙](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)에 따르면, "큐"라는 이름과는 달리 태스크 "큐"는 "queue" 자료형이 아니라 "set" 자료형이라고 합니다. 그 이유는, 이벤트 루프가 단순히 태스크 큐의 첫 번째(가장 오래된) 태스크를 가져오는 것이 아니라, 실행 가능한(runnable) 태스크 중에서 첫 번째 태스크를 가져오는 것이기 때문에 태스크가 runnable인지 아닌지를 구분해야 하기 때문입니다. 만약 태스크 큐가 queue 자료형으로 되어 있다면 runnable이 아닌 태스크를 가져오는 경우가 생길 수도 있을 것입니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/Execution_timing_event_loop_with_tasks.png" alt="Execution timing: event loop with tasks" />
    <figcaption>출처: https://blog.risingstack.com/writing-a-javascript-framework-execution-timing-beyond-settimeout/</figcaption>
</figure>

사실, 태스크 큐는 여러 개 존재할 수 있습니다. 다만, 동일한 태스크 source로 부터 생성된 태스크는 반드시 같은 태스크 큐에 들어가야 하며, 먼저 온 순서대로 처리되어야 합니다. 예를 들면, `setTimeout`으로 생성된 태스크들이 저장되는 태스크 큐와 `click` 이벤트에 의해 생성된 태스크들이 저장되는 태스크 큐가 따로 존재할 수 있습니다. 하지만 각각의 태스크 큐에 저장된 태스크들은 반드시 큐에 삽입된 순서(FIFO)로 처리되어야 합니다.

이번 tick에 어떤 태스크 큐를 선택하여 태스크를 처리할 것인가는 구현하기 나름입니다. 이때 태스크는 이벤트 루프 하나의 tick마다 (태스크 큐의 종류에 상관없이) 오직 하나만 처리됩니다. 현재 처리하고 있는 태스크에서 또 다른 태스크를 추가할 수는 있지만, 이미 이번 tick에서 태스크를 선택하여 처리하고 있으므로 새로 추가된 태스크는 이후의 tick에서 처리됩니다.

이를 수도 코드로 나타내면 다음과 같습니다:

```js
while (eventLoop.waitForTask()) {
  // 여러 태스크 큐 중에서 하나를 고릅니다.
  const taskQueue = eventLoop.selectTaskQueue();
  // 만약 선택한 태스크 큐에 태스크가 있다면,
  if (taskQueue.hasNextTask()) {
    // 태스크를 하나 꺼내서 실행합니다.
    taskQueue.processNextTask();
  }
}
```

<figure>
  <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/Execution_timing_event_loop_with_task_queues.png" alt="Execution timing: event loop with task queues" />
  <figcaption>태스크 큐. 출처: https://blog.risingstack.com/writing-a-javascript-framework-execution-timing-beyond-settimeout/</figcaption>
</figure>

## 마이크로 태스크 큐

`Promise`, `queueMicrotask`, `MutationObserver` 등에 의해 생성된 태스크들을 **마이크로 태스크(microtask)** 라고 합니다. 이때 마이크로 태스크는 태스크 큐가 아니라 별도의 **마이크로 태스크 큐(microtask queue)**에 저장되어 처리됩니다.

이벤트 루프가 마이크로 태스크를 처리하는 방법은 다음과 같습니다. 우선, 태스크 하나를 처리한 뒤 콜 스택이 비어있는지 확인한 후 콜 스택이 비어있으면 마이크로 태스크 큐에서 마이크로 태스크를 꺼내 처리합니다 (콜 스택이 비어있지 않으면 빌 때까지 기다립니다).

이때 앞서 살펴본 태스크와는 다르게, 마이크로 태스크는 한 tick 당 하나만 처리되는 것이 아니라 마이크로 태스크 큐가 비워질 때까지 모두 처리됩니다. 즉, 마이크로 태스크를 처리하는 와중에 또 다른 마이크로 태스크가 마이크로 태스크 큐에 추가되는 경우 새로 추가된 마이크로 태스크도 이번 tick에서 처리됩니다.

```js
while (eventLoop.waitForTask()) {
  const taskQueue = eventLoop.selectTaskQueue();
  if (taskQueue.hasNextTask()) {
    taskQueue.processNextTask();
  }

  // 콜 스택이 빌 때까지 기다린 후,
  waitForTheCallStackToBeEmpty();
  // 마이크로 태스크 큐가 빌 때까지 모든 마이크로 태스크를 처리합니다.
  while (microtaskQueue.hasNextMicrotask()) {
    microtaskQueue.processNextMicrotask();
  }
}
```

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/Execution_timing_event_loop_with_microtask_queue.png" alt="Execution timing: event loop with microtask queues" />
    <figcaption>마이크로 태스크 큐. 출처: https://blog.risingstack.com/writing-a-javascript-framework-execution-timing-beyond-settimeout/</figcaption>
</figure>

<hr />

위에서 말씀드린 것처럼, 이벤트 루프는 마이크로 태스크 큐가 빌 때까지 모든 마이크로 태스크를 처리하므로 자칫 잘못하면 이벤트 루프가 마이크로 태스크만 끊임없이 처리하게 될 수도 있습니다. 특히 브라우저의 경우, 이러한 일이 발생하면 유저와의 인터렉션, DOM 렌더링 등이 동작하지 않으므로 조심해야 합니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/taskqueue.gif" alt="Behavior of the task queue animation" />
    <figcaption>한 tick당 하나의 태스크만 처리. 출처: https://www.youtube.com/watch?v=cCOL7MC4Pl0</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/microtaskqueue.gif" alt="Behavior of the microtask queue animation" />
    <figcaption>한 tick당 모든 마이크로 태스크를 처리. 출처: https://www.youtube.com/watch?v=cCOL7MC4Pl0</figcaption>
</figure>

예를 들어, 아래와 같이 재귀적으로 계속해서 마이크로 태스크를 추가하는 코드를 브라우저에서 실행해보면 해당 탭이 먹통이 되는 것을 확인할 수 있습니다: 

```js
// 무한 루프에 걸립니다. 조심하세요!
function dangerous() {
  console.log(1);
  queueMicrotask(dangerous);
}
dangerous();
```

## 렌더링

화면을 렌더링하는 작업도 이벤트 루프에 의해 처리되는데, 자바스크립트 엔진이 어떤 태스크를 처리하는 동안에는 렌더링이 수행되지 않습니다 (싱글 스레드로 동작하는 자바스크립트의 특성을 생각해보면 당연한 말이지요!). 실행 중인 태스크를 완료한 이후에야 DOM에 발생한 변화를 반영하여 화면에 렌더링할 수 있습니다.

UI 렌더링은 이벤트 루프 tick의 마지막 즉 태스크를 처리하고, 마이크로 태스크도 처리한 이후에 "처리될 수도 있습니다". *처리될 수도 있다*고 한 이유는, 브라우저가 렌더링 작업을 수행하지 않는 경우도 있기 때문입니다. 즉, 렌더링을 할지 말지는 브라우저가 자유롭게 결정할 수 있기 때문에 이벤트 루프 tick의 마지막에 렌더링 작업이 수행될 수도, 그렇지 않을 수도 있는 것입니다.

또한, [requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) 이라는 함수를 통해 렌더링 *직전에* 특정 작업을 수행하도록 요청할 수도 있습니다. `requestAnimationFrame()` 에 전달되는 콜백들은 **animationFrames** 라는 큐에 저장되어 브라우저가 렌더링 하기 직전에 해당 큐에 있는 콜백들을 처리합니다. 이때 이벤트 루프의 한 tick이 시작되는 시점에 존재하던 애니메이션 콜백들은 모두 실행되지만, 도중에 추가된 콜백들은 현재 tick에선 실행되지 않고 이후의 tick에서 렌더링할 때 실행됩니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/animationframes.gif" alt="Behavior of the animation frames animation" />
    <figcaption>애니메이션 콜백 처리 과정. 출처: https://www.youtube.com/watch?v=cCOL7MC4Pl0</figcaption>
</figure>

```js
while (eventLoop.waitForTask()) {
  const taskQueue = eventLoop.selectTaskQueue();
  if (taskQueue.hasNextTask()) {
    taskQueue.processNextTask();
  }

  waitForTheCallStackToBeEmpty();
  while (microtaskQueue.hasNextMicrotask()) {
    microtaskQueue.processNextMicrotask();
  }

  // 이번 tick에서 렌더링 처리를 해야할 지 결정한 뒤,
  if (shouldRender()) {
    // 렌더링을 처리하는 경우, 우선 이번 tick이 시작하는 시점까지
    // 추가된 애니메이션 콜백들을 모두 실행한 다음
    const animationTasks = animationFrames.getTasks();
    animationTasks.forEach(animationTask => animationTask());
    // 화면 렌더링 작업을 수행합니다.
    renderUI();
  }
}
```

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/Execution_timing_event_loop_with_rendering.png" alt="Execution timing: event loop with rendering" />
    <figcaption>애니메이션 프레임. 출처: https://blog.risingstack.com/writing-a-javascript-framework-execution-timing-beyond-settimeout/</figcaption>
</figure>

최종적으로 브라우저 환경에서의 이벤트 루프 흐름을 그림으로 나타내면 다음과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/event_loop_flow.png" alt="Event loop flow" />
    <figcaption>브라우저 환경의 이벤트 루프 흐름.</figcaption>
</figure>

## REFERENCES

- [Writing a JavaScript framework - Execution timing, beyond setTimeout | RisingStack Engineering](https://blog.risingstack.com/writing-a-javascript-framework-execution-timing-beyond-settimeout/)
- [Event loop: microtasks and macrotasks | javascript.info](https://javascript.info/event-loop)
- [javascript - Are there significant differences between the Chrome browser event loop versus the node event loop? | Stack Overflow](https://stackoverflow.com/questions/25750884/are-there-significant-differences-between-the-chrome-browser-event-loop-versus-t)
- [자바스크립트와 이벤트 루프 | NHN Cloud Meetup](https://meetup.toast.com/posts/89)
