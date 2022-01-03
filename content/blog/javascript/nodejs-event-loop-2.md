---
title: 'Node.js의 이벤트 루프 Part2'
date: 2020-08-19
category: 'JavaScript'
draft: false
---

[1부 보러가기](../nodejs_event_loop_1/)

<hr class="custom-hr">

### Poll phase

Poll phase 에서는 일정시간동안 대기(blocking)하면서 새로운 I/O operation이 들어오는지 "polling(watching)"한다. 이벤트 루프가 Poll phase에 진입하면 우선 `watcher_queue` 를 살펴보고, 해당 큐에 파일 읽기 콜백, TCP 통신 콜백등과 같은 작업들이 존재한다면 해당 작업들을 수행한다.

이 때 더이상 실행할 콜백이 없는 상태에 이르게 되면 `pending_queue`, `check_queue` (`setImmediate` 의 콜백들이 저장됨), `closing_callbacks_queue` (`close` 이벤트 콜백들이 저장됨)에 저장된 작업들이 있는지 살펴본다. 만약 해야 할 작업이 있다면 즉시 Poll phase를 종료하고 다음 phase로 넘어간다. 만약 해야 할 작업이 없다면 Poll phase에서 일정 시간동안 대기한다.

그럼 과연 얼마나 대기하는지를 코드를 통해 살펴보자. 우선 Poll phase의 메소드인 `uv__poll` (UNIX는 `uv__io_poll`) 의 인자 목록을 살펴보면 다음과 같다 (메소드 전체는 너무 길기때문에 생략한다).

```c
void uv__io_poll(uv_loop_t* loop, int timeout)
```

첫 번째 인자로 이벤트 루프를, 두 번째 인자로 "대기 시간"을 받는 것을 알 수 있다. 이렇게 Poll phase는 인자로 얼마만큼의 시간동안 대기할 것인가를 받아서 해당 시간만큼 대기한다.

만약 `timeout` 값이 0이면 polling을 건너뛰고 바로 다음 phase인 Check phase로 넘어간다. `timeout` 값은 다음 과정을 통해 계산된다:

- 만약 이벤트 루프가 현재 `UV_RUN_DEFAULT` 모드로 동작한다면 `timeout` 은 `uv_backend_timeout` 메소드를 통해 계산된다.
- 만약 이벤트 루프가 현재 `UV_RUN_ONCE` 모드로 동작하고 `uv_run_pending` 의 리턴값이 0 (즉, `pending_queue` 가 비어있는 경우) 이면 `timeout` 은 `uv_backend_timeout` 메소드를 통해 계산된다.
- 이외의 경우, `timeout` 은 0이다.

이벤트 루프의 모드에 관한 자세한 내용은 [http://docs.libuv.org/en/v1.x/loop.html#c.uv_run](http://docs.libuv.org/en/v1.x/loop.html#c.uv_run) 를 참고하길 바란다.

<br/>

`uv_backend_timeout` 메소드의 코드를 살펴보면 다음과 같다:

```c
// https://github.com/nodejs/node/blob/c61870c376e2f5b0dbaa939972c46745e21cdbdd/deps/uv/src/unix/core.c#L337
// https://github.com/nodejs/node/blob/e46c680bf2b211bbd52cf959ca17ee98c7f657f5/deps/uv/src/win/core.c#L398
// UNIX 버전
int uv_backend_timeout(const uv_loop_t* loop) {
  if (loop->stop_flag != 0)
    return 0;

  if (!uv__has_active_handles(loop) && !uv__has_active_reqs(loop))
    return 0;

  if (!QUEUE_EMPTY(&loop->idle_handles))
    return 0;

  if (!QUEUE_EMPTY(&loop->pending_queue))
    return 0;

  if (loop->closing_handles)
    return 0;

  return uv__next_timeout(loop);
}
```

위 코드에서 볼 수 있듯, 다음 중 하나에 해당되는 경우 `timeout` 은 0이다.

- 루프의 `stop_flag` 가 0이 아닌경우 (즉, 루프를 종료해야 하는 경우).
- 현재 active한 핸들러(콜백)가 없고, 현재 active한 요청(operation)이 없는 경우.
- 실행되기를 기다리는 idle한 핸들러가 있는 경우.
- `pending_queue` 에서 대기 중인(pending) I/O 콜백이 있는 경우 (즉, 이미 대기 중인 I/O 동작이 있으므로 새로운 I/O 동작을 기다릴 필요가 없음).
- `close` 이벤트 핸들러가 있는 경우.

위 다섯개의 상황을 제외한 나머지 경우, `uv__next_timeout` 을 호출하여 `timeout` 을 계산한다. 코드는 다음과 같다:

```c
// https://github.com/nodejs/node/blob/e46c680bf2b211bbd52cf959ca17ee98c7f657f5/deps/uv/src/timer.c#L142

int uv__next_timeout(const uv_loop_t* loop) {
  const struct heap_node* heap_node;
  const uv_timer_t* handle;
  uint64_t diff;

  heap_node = heap_min(timer_heap(loop));
  if (heap_node == NULL)
    return -1; /* block indefinitely */

  handle = container_of(heap_node, uv_timer_t, heap_node);
  if (handle->timeout <= loop->time)
    return 0;

  diff = handle->timeout - loop->time;
  if (diff > INT_MAX)
    diff = INT_MAX;

  return (int) diff;
}
```

`uv__next_timeout` 은 현재 시간(iteration을 시작할 때 계산한 시간)을 기준으로 가장 가까운 타이머와의 차이를 반환한다. 즉, 이 경우 이벤트 루프가 Poll phase에서 가장 빨리 만료되는 타이머를 실행할 수 있는 시간이 될때까지만 기다리다가 다음 phase로 넘어간다.

이 때 만약 타이머가 없다면 `-1` 을 리턴하는데, 이로인해 이벤트 루프가 Poll phase에서 무한히 기다리게 된다.

<br/>

- 종합해보자면, 이벤트 루프는 Poll phase에서
  1. Check phase 혹은 Close phase에 실행할 콜백이 있으면 Poll phase에서 기다리지 않는다.
  2. 만약 Check phase 와 Close phase에 실행할 콜백이 없으면 타이머를 살펴보고, 타이머가 있으면 해당 타이머를 실행할 수 있을 때까지 Poll phase에서 기다렸다가 다음 phase로 넘어간다.
  3. 만약 타이머도 없으면 일이 생길때 까지 Poll phase에서 대기한다.

I/O 폴링이 수행되는 방식은 OS별로 차이가 있다. Windows의 경우, IOCP(Input Output Completion Port)의 `GetQueuedCompletionStatus` 를 이용하고, Linux의 경우 `epoll_wait` 을, macOS의 경우 `kqueue` 를 이용한다.

### Check phase

Check phase의 동작 방식은 Timer phase와 비슷하다고 할 수 있다. 하지만 타이머 콜백(`setTimeout()`, `setInterval()`) 들이 언제 실행되는지 보장되지 않는 반면, `setImmediate` 의 콜백들은 I/O phase 바로 다음에 처리되는 것이 보장된다.

<br/>

> setTimeout vs. setImmediate

이 글의 첫 부분에서 봤던 이벤트 루프의 흐름에서 볼 수 있듯이, 루프의 iteration이 시작되고 우선 Timer phase에 진입하여 타이머 관련 콜백들을 처리하고, 그 다음에 I/O phase 를 거쳐 Check phase에 진입하므로 다음 코드의 결과를 쉽게 예측할 수 있을 것이다:

```js
setTimeout(() => {
  console.log('setTimeout')
}, 0)

setImmediate(() => {
  console.log('setImmediate')
})
```

언뜻 보기엔 `setTimeout` 이 먼저 실행되고 그 다음 `setImmediate` 가 실행되는 것처럼 보인다. 하지만 위 코드의 결과는 **예측할 수 없다!** 😱 위 코드를 여러번 실행해보면 서로 다른 결과가 나오는것을 확인할 수 있다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/nodejs_event_loop/setImmediate_1.png" alt="setTimeout vs. setImmediate"/>
    <figcaption>setTimeout vs. setImmediate</figcaption>
</figure>

이러한 결과가 나오는 이유는, Timer phase에서 살펴본 것과 같이 `setTimeout` 의 default 딜레이 값은 0이 아니라 1이기 때문이다. 즉, 만약 0보다 작은 값을 딜레이로 주게 되면 Node.js가 자동적으로 딜레이를 1로 변경해버린다.

따라서, 이벤트 루프가 현재 시간을 계산할 때, CPU가 얼마나 바쁜지에 따라 시간을 계산하는데 걸리는 시간이 `1ms` 를 초과할 수도, 그렇지 않을 수도 있다. 만약 `1ms` 보다 빠르게 시간을 계산했다면 `setImmediate` 가 먼저 실행될 것이고, 시간을 계산하는데 `1ms` 보다 더 걸렸다면 `setTimeout` 이 실행될 것이다.

하지만 다음과 같은 상황에서는 **무조건** `setImmediate` 의 콜백이 `setTimeout` 콜백보다 먼저 실행된다고 할 수 있다:

```js
const fs = require('fs')

fs.readFile(__dirname, () => {
  setTimeout(() => {
    console.log('setTimeout')
  }, 0)
  setImmediate(() => {
    console.log('setImmediate')
  })
})
```

그 이유는 우선, 프로그램이 시작되면 `fs.readFile()` 을 이용하여 파일을 비동기적으로 읽는다. 파일 읽기가 완료되면 `pending_queue` 에 콜백이 저장되어 추후에 실행되는데, 이 때 `setTimeout` 과 `setImmediate` 이 순차적으로 실행되고, 각각의 콜백이 Timer phase의 큐와 Check phase의 큐에 저장된다.

- I/O phase 를 지나 Poll phase에 진입했을 때, immediate 콜백과 타이머 콜백이 있으므로 곧장 Check phase로 가서 `setImmediate` 의 콜백을 실행한다. → "setImmediate" 출력.
- 그 다음 루프 iteration에서 Timer phase에 진입하여 만료된 타이머의 콜백을 실행한다 → "setTimeout" 출력.

### Close phase

`'close'` 이벤트, 혹은 `socket.destroy()` 와 같은 `destroy` 타입에 대한 콜백들을 실행한다. 이벤트 루프가 Close phase를 마치고 나면 `uv__loop_alive` 를 이용하여 iteration을 더 돌아야 하는지 판단한다.

## nextTickQueue & microTaskQueue

`process.nextTick()` 의 콜백들이 저장되는 `nextTickQueue` 와, `Promise` 등의 콜백이 저장되는 `microTaskQueue` 는 사실 이벤트 루프의 일부가 아니다.

Node.js v11.0.0 이전에는 각 tick마다, 즉 어떤 phase에서 다음 phase로 넘어갈 때 (→ "C++/JavaScript 경계를 넘을 때" 라고 하기도 한다) 해당 큐에 저장된 모든 콜백들을 처리하는 방식으로 동작했다. 이 때 `nextTickQueue` 가 `microTaskQueue` 보다 높은 우선순위를 갖는다.

하지만 Node.js v11.0.0 부터는 동작 방식이 약간 바뀌었는데, 기존 방식처럼 각 tick마다 두 개의 큐를 실행하는 것을 바탕으로 각 타이머 콜백(`setImmediate` & `setInterval`) 과 immediate 콜백 사이에 `nextTick` 콜백와 `microTask` 콜백이 실행된다. 다음 코드를 살펴보자:

```js
setTimeout(() => console.log('timeout1'))
setTimeout(() => {
  console.log('timeout2')
  Promise.resolve().then(() => console.log('promise resolve'))
})
setTimeout(() => console.log('timeout3'))
setTimeout(() => console.log('timeout4'))
```

- Node.js v11.0.0 이후 버전에서 실행한 결과는 다음과 같다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/nodejs_event_loop/nextTickQueue_1.png" alt="code result after v11.0.0"/>
</figure>

- Node.js v11.0.0 이전 버전에서 실행한 결과는 다음과 같다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/nodejs_event_loop/nextTickQueue_2.png" alt="code result before v11.0.0 "/>
</figure>

위 결과에서 볼 수 있듯, v11.0.0 이전에는 매 tick마다 `nextTick` 콜백과 `microTask` 콜백들이 실행됐으나, v11.0.0 이후에는 타이머 콜백, (위 코드에는 없지만) immediate 콜백 마다 `nextTick` 콜백과 `microTask` 콜백을 실행함을 알 수 있다.

이렇게 동작이 변경된 이유는, 크롬 브라우저와의 호환성 때문인데, 브라우저에서는 v11.0.0 이후 버전에서와 같이 동작하기 때문이다.

물론 `setImmediate` 에 대해 실험해 봐도 위와 동일한 로직으로 동작함을 알 수 있다:

```js
setImmediate(() => console.log('immediate1'))
setImmediate(() => {
  console.log('immediate2')
  Promise.resolve().then(() => console.log('promise resolve'))
})
setImmediate(() => console.log('immediate3'))
setImmediate(() => console.log('immediate4'))
```

Node.js v11.0.0 이후 버전:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/nodejs_event_loop/setImmediate_2.png" alt="code result after v11.0.0"/>
</figure>

Node.js v11.0.0 이전 버전:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/nodejs_event_loop/setImmediate_3.png" alt="code result before v11.0.0 "/>
</figure>

## REFERENCES

[Basics of libuv - libuv documentation](http://docs.libuv.org/en/v1.x/guide/basics.html#event-loops)

[Design overview - libuv documentation](http://docs.libuv.org/en/v1.x/design.html#the-i-o-loop)

[The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

[Event Loop and the Big Picture Series](https://blog.insiderattack.net/event-loop-and-the-big-picture-nodejs-event-loop-part-1-1cb67a182810)

[Node.js event loop workflow & lifecycle in low level](https://www.voidcanvas.com/nodejs-event-loop/)
