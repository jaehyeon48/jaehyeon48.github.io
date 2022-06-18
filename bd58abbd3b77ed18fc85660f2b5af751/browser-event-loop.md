---
title: '브라우저 환경에서의 이벤트 루프'
date: 2020-10-03
category: 'JavaScript'
draft: false
---

## 브라우저의 이벤트 루프

- 자바스크립트는 싱글 스레드 기반의 언어이고, 자바스크립트 엔진은 오직 하나의 호출 스택을 사용한다. 즉, 요청이 동기적으로 처리되어 한 번에 한 가지 일만 처리할 수 있음을 의미한다.
- 이 때, 네트워크 요청과 같이 오버헤드가 큰 요청의 경우 동기적으로 처리된다면 다른 일을 처리할 수 없거나, 렌더링을 block하는 등 여러 문제가 발생할 수 있다. 따라서 자바스크립트의 주요 실행 환경(runtime)인 브라우저나 Node.js에서는 비동기 작업을 수행할 수 있도록 다양한 기능을 제공한다.
- 이를 위해, 자바스크립트의 실행 환경인 브라우저나 Node.js 에서는 (자바스크립트가 싱글 스레드인 것과는 달리) 여러 개의 스레드가 사용된다. 이렇게 여러 스레드를 사용하는 실행 환경과 자바스크립트 엔진을 연동하기 위해 사용되는 장치가 **이벤트 루프**이다.
- 이벤트 루프가 "루프"라고 불리는 이유는, 이벤트 루프의 동작 방식이 계속해서 task들을 실행하는 무한루프와 같기 때문이다. 수도 코드로 이벤트 루프를 아주 간단히 나타내면 다음과 같다:

```js
while (eventLoop.waitForTask()) {
  eventLoop.processNextTask()
}
```

- 참고로, Chrome/Chromium은 이벤트 루프의 구현 라이브러리로 `libevent` 를, Node.js는 `libuv` 를 사용한다.

## (매크로) 태스크 큐

- 앞서 말했듯이, 이벤트 루프는 task가 들어오기를 기다렸다가, task가 들어오면 해당 task를 실행하고, 처리할 task가 없는 경우에는 task가 들어오기를 기다리는 무한 루프라고 할 수 있다.
- 이 때 `task`란, 최초에 (`<script>` 태그로 로드한) 스크립트를 실행하거나, 이벤트가 발생했을 때 해당 이벤트를 처리하는 핸들러(콜백)을 실행하거나, `setTimeout` , `setInterval` 등에 의해 설정된 interval, timeout 등이 발생했을 때 콜백을 실행하는 등 (추후에) 실행되도록 스케쥴되는 자바스크립트 코드이다. 잠시 후에 살펴볼 microtask와 구분짓기 위해 macrotask라고도 한다.
- 이러한 task들은 **task queue**라는 곳에 저장된다. [HTML스펙](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)에 따르면, task queue는 "queue" 자료형이 아니라 "set" 자료형이라고 한다. 그 이유는, 이벤트 루프가 단순히 task queue의 첫 번째(가장 오래된) task를 가져오는 것이 아니라, 실행 가능한(runnable) task 중에서 첫 번째 task를 가져오는 것이기 때문에 task가 runnable인지 아닌지를 구분해야 하기 때문이다. 만약 task queue가 queue 자료형으로 되어 있다면 runnable이 아닌 task를 가져오는 경우가 생길 수도 있을 것이다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/Execution_timing_event_loop_with_tasks.png" alt="Execution timing: event loop with tasks" />
    <figcaption>출처: https://blog.risingstack.com/writing-a-javascript-framework-execution-timing-beyond-settimeout/</figcaption>
</figure>

- 사실, task queue는 하나가 아니라 여러 개가 존재할 수 있다. 이 때, 동일한 task source로 부터 생성된 task는 반드시 같은 task queue에 들어가야 하며, 앞서 언급한 것과 같이 먼저온 순서대로 처리해야 한다.
- 예를 들면, `setTimeout` 으로 생성된 task들이 저장되는 task queue와, `click` 이벤트에 의해 생성된 task들이 저장되는 task queue 등이 따로 존재할 수 있다.
- 여러 개의 task queue중 어떤 task queue를 선택할 것인가는 구현하기 나름이다. (macro)task는 이벤트 루프의 각 iteration 마다 (task queue의 종류에 관계없이) 오직 하나만 처리된다.

```js
while (eventLoop.waitForTask()) {
  const taskQueue = eventLoop.selectTaskQueue()
  if (taskQueue.hasNextTask()) {
    taskQueue.processNextTask()
  }
}
```

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/Execution_timing_event_loop_with_task_queues.png" alt="Execution timing: event loop with task queues" />
    <figcaption>출처: https://blog.risingstack.com/writing-a-javascript-framework-execution-timing-beyond-settimeout/</figcaption>
</figure>

## 마이크로 태스크 큐

- `Promise`, `queueMicrotask`, `MutationObserver` 등에 의해 생성된 task들을 `microtask` 라고 부른다. microtask들은 별도의 microtask queue에 저장된다.
- microtask는 이벤트 루프의 각 iteration 마다 하나의 (macro)task를 처리한 이후 microtask queue가 빌 때까지 모든 microtask를 처리한다.

```js
while (eventLoop.waitForTask()) {
  const taskQueue = eventLoop.selectTaskQueue()
  if (taskQueue.hasNextTask()) {
    taskQueue.processNextTask()
  }

  const microtaskQueue = eventLoop.microTaskQueue
  while (microtaskQueue.hasNextMicrotask()) {
    microtaskQueue.processNextMicrotask()
  }
}
```

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/Execution_timing_event_loop_with_microtask_queue.png" alt="Execution timing: event loop with microtask queues" />
    <figcaption>출처: https://blog.risingstack.com/writing-a-javascript-framework-execution-timing-beyond-settimeout/</figcaption>
</figure>

- 또한, (macro)task와는 다르게 microtask는 이벤트 루프의 iteration이 시작된 이후에 추가되었다고 하더라도 다음 iteration이 실행되기 전에 처리될 수 있다. 따라서 조심해야할 것이, 자칫 잘못하면 이벤트 루프가 microtask만 끊임없이 처리하게 될 수도 있다. 특히 브라우저의 경우, 이러한 일이 발생하면 유저와의 인터렉션, DOM 렌더링 등이 동작하지 않으므로 주의가 필요하다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/taskqueue.gif" alt="Behavior of the task queue animation" />
    <figcaption>출처: https://www.youtube.com/watch?v=cCOL7MC4Pl0</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/microtaskqueue.gif" alt="Behavior of the microtask queue animation" />
    <figcaption>출처: https://www.youtube.com/watch?v=cCOL7MC4Pl0</figcaption>
</figure>

## 렌더링

- 마지막으로, UI 렌더링도 이벤트 루프에 의해 처리된다.
- 엔진이 어떤 task를 처리하는 동안에는 렌더링이 발생하지 않는다. 실행중인 task를 완료한 이후에야 DOM에 발생한 변화를 반영하여 화면에 렌더링할 수 있다.
- UI 렌더링은 이벤트 루프의 매 iteration의 마지막 (즉 macrotask를 처리하고, microtask도 처리한 이후)에 "수행될 수도 있다".
- 수행될 수도 있다라고 한 이유는, 브라우저가 렌더링을 하지 않고 task만 처리하는 경우도 있기 때문이다. 즉, 렌더링을 할지 말지는 브라우저가 자유롭게 결정할 수 있기 때문에 이벤트 루프의 매 iteration 마지막에 렌더링 작업이 수행될 수도, 그렇지 않을 수도 있는 것이다.
- 또한, [requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) 이라는 메소드를 통해 렌더링 직전에 특정 작업을 수행하도록 요청할 수도 있다. `requestAnimationFrame()` 에 전달되는 콜백들은 **animationFrames** 라는 큐에 저장되어 브라우저가 렌더링을 하는 경우, 렌더링을 하기 직전에 해당 큐에 있는 콜백들을 수행한다.
- 이 때 이벤트 루프의 iteration이 시작되는 시점에 존재하던 콜백들은 모두 실행되지만, 도중에 추가된 콜백들은 현재 iteration에서는 실행되지 않고, 이후의 iteration에서 렌더링을 할 때 실행된다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/animationframes.gif" alt="Behavior of the animation frames animation" />
    <figcaption>출처: https://www.youtube.com/watch?v=cCOL7MC4Pl0</figcaption>
</figure>

```js
while (eventLoop.waitForTask()) {
  const taskQueue = eventLoop.selectTaskQueue()
  if (taskQueue.hasNextTask()) {
    taskQueue.processNextTask()
  }

  const microtaskQueue = eventLoop.microTaskQueue
  while (microtaskQueue.hasNextMicrotask()) {
    microtaskQueue.processNextMicrotask()
  }

  if (shouldRender()) {
    animationTasks = animationFrames.copy()
    for (animationTask of animationTask) animationTask()
    render()
  }
}
```

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/Execution_timing_event_loop_with_rendering.png" alt="Execution timing: event loop with rendering" />
    <figcaption>출처: https://blog.risingstack.com/writing-a-javascript-framework-execution-timing-beyond-settimeout/</figcaption>
</figure>

- 최종적으로 이벤트 루프의 흐름을 간단한 그림으로 나타내면 다음과 같다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/event_loop_flow.png" alt="Event loop flow" />
    <figcaption>출처: https://javascript.info/event-loop</figcaption>
</figure>

- 또한, 브라우저 런타임을 간단한 그림으로 나타내면 다음과 같다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/browser_event_loop/browser_runtime_in_a_nutshell.png" alt="browser runtime in a nutshell" />
</figure>

## REFERENCES

[https://blog.risingstack.com/writing-a-javascript-framework-execution-timing-beyond-settimeout/](https://blog.risingstack.com/writing-a-javascript-framework-execution-timing-beyond-settimeout/)

[https://javascript.info/event-loop](https://javascript.info/event-loop)

[https://stackoverflow.com/questions/25750884/are-there-significant-differences-between-the-chrome-browser-event-loop-versus-t](https://stackoverflow.com/questions/25750884/are-there-significant-differences-between-the-chrome-browser-event-loop-versus-t)

[https://velog.io/@yejineee/이벤트-루프와-태스크-큐-마이크로-태스크-매크로-태스크-g6f0joxx](https://velog.io/@yejineee/%EC%9D%B4%EB%B2%A4%ED%8A%B8-%EB%A3%A8%ED%94%84%EC%99%80-%ED%83%9C%EC%8A%A4%ED%81%AC-%ED%81%90-%EB%A7%88%EC%9D%B4%ED%81%AC%EB%A1%9C-%ED%83%9C%EC%8A%A4%ED%81%AC-%EB%A7%A4%ED%81%AC%EB%A1%9C-%ED%83%9C%EC%8A%A4%ED%81%AC-g6f0joxx)
