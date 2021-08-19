---
title: 'Node.js의 이벤트 루프 Part1'
date: 2020-08-19 14:20:15
category: 'javascript'
draft: false
---

[2부 보러가기](https://jaehyeon48.github.io/javascript/nodejs_event_loop_2/)

## 이벤트 루프란?

이벤트 루프란 Node.js가 싱글 스레드(≈ 콜스택이 하나)로 동작함에도 불구하고 I/O 동작들을 non-blocking 방식으로 처리할 수 있게 해주는 녀석이다. 주로 operation들을 커널에 맡기는 방식으로 진행하는데, 대부분의 현대 운영체제들은 멀티 스레드이므로 백그라운드에서 여러 operation들을 동시에 실행시키는 것이 가능하다.

이렇게 백그라운드에서 operation을 처리하다가 해당 작업을 완료하면 커널이 Node.js에게 작업이 완료되었다고 알리고, 알림을 받은 Node.js는 적절한 핸들러(콜백)를 `poll queue` 에 등록하여 이 콜백을 (추후에) 실행한다. 더 자세한 사항들은 잠시 후에 살펴보자.

## 이벤트 루프 살펴보기

Node.js를 실행하게 되면 이벤트 루프를 초기화하고 (개발자가 작성한) 자바스크립트 파일을 실행한다. 이벤트 루프의 전체적인 흐름을 그림으로 나타내면 다음과 같다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/nodejs_event_loop/nodejs_event_loop1" alt="event loop example 1"/>
    <figcaption>출처: https://www.voidcanvas.com/nodejs-event-loop/</figcaption>
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/nodejs_event_loop/nodejs_event_loop2" alt="event loop example 2"/>
    <figcaption>출처: https://blog.insiderattack.net/event-loop-and-the-big-picture-nodejs-event-loop-part-1-1cb67a182810</figcaption>
</figure>

<br/>

이벤트 루프의 각 단계를 `phase` 라고 하며, 각각의 phase마다 콜백을 실행할 FIFO 구조의 큐를 가지고 있어서 이벤트 루프가 각 phase에 진입하면 해당 phase에서 수행해야 할 operation들을 수행한 후 해당 phase 큐에 있는 모든 콜백 (혹은 일정한 수의 콜백)을 실행한다.

모든 콜백 (혹은 limit을 넘지않는 수의 콜백)을 처리하고 나면 이벤트 루프는 다음 phase로 이동하여 위 동작들을 반복한다. 이 때, 어떤 phase에서 다음 phase로 넘어가는 과정을 `tick` 이라고 한다.

위 그림 중 첫 번째 그림은 이벤트 루프를 libuv의 관점에서 본 것이고, 두 번째 그림은 자바스크립트의 관점에서 본 것이라 할 수 있다. 위 두 관점을 하나로 합쳐 다음 그림으로 표현할 수 있다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/nodejs_event_loop/nodejs_event_loop3" alt="event loop example 3"/>
    <figcaption>출처: https://blog.insiderattack.net/handling-io-nodejs-event-loop-part-4-418062f917d1</figcaption>
</figure>

## Phase Overview

각 phase들이 무엇인지 간략하게 살펴보면 다음과 같다:

- `**Timer**` : `setTimeout()` 과 `setInterval()` 에 의해 등록된 콜백들을 실행한다.
- `**Pending I/O callbacks**` : 이벤트 루프의 이전 iteration에서 실행되지 못한 콜백들을 실행한다.
- `**Idle, prepare**` : 이벤트 루프와 직접적인 관련은 없고, Node.js의 내부 관리를 위해 존재한다.
- `**Poll**` : 새로운 I/O 이벤트를 받아오고, I/O와 연관된 콜백들을 실행한다. `close` 이벤트에 대한 콜백, 타이머, `setImmediate()` 와 관련된 콜백을 제외한 사실상 대부분의 콜백이 이 phase에서 실행된다. 필요하다면 Node가 이 phase에서 block될 수 있다.
- `**Check**` : `setImmediate()` 에 의해 등록된 콜백들을 실행한다.
- `**Close callbacks**` : `close` 이벤트에 대한 콜백들이 실행된다. (e.g. `socket.on('close', cb);`)

## Phase 자세히 살펴보기

- 우선, 이벤트 루프가 구현된 코드는 다음과 같다.

```c
// UNIX 버전 기준. Windows 버전도 전체적인 구조는 동일하다.
// https://github.com/nodejs/node/blob/c61870c376e2f5b0dbaa939972c46745e21cdbdd/deps/uv/src/unix/core.c#L369
// https://github.com/nodejs/node/blob/master/deps/uv/src/win/core.c#L596
int uv_run(uv_loop_t* loop, uv_run_mode mode) {
  int timeout;
  int r;
  int ran_pending;

  r = uv__loop_alive(loop);
  if (!r)
    uv__update_time(loop);

  while (r != 0 && loop->stop_flag == 0) {
    uv__update_time(loop);
    uv__run_timers(loop);
    ran_pending = uv__run_pending(loop);
    uv__run_idle(loop);
    uv__run_prepare(loop);

    timeout = 0;
    if ((mode == UV_RUN_ONCE && !ran_pending) || mode == UV_RUN_DEFAULT)
      timeout = uv_backend_timeout(loop);

    uv__io_poll(loop, timeout);

    /* Run one final update on the provider_idle_time in case uv__io_poll
     * returned because the timeout expired, but no events were received. This
     * call will be ignored if the provider_entry_time was either never set (if
     * the timeout == 0) or was already updated b/c an event was received.
     */
    uv__metrics_update_idle_time(loop);

    uv__run_check(loop);
    uv__run_closing_handles(loop);

    if (mode == UV_RUN_ONCE) {
      /* UV_RUN_ONCE implies forward progress: at least one callback must have
       * been invoked when it returns. uv__io_poll() can return without doing
       * I/O (meaning: no callbacks) when its timeout expires - which means we
       * have pending timers that satisfy the forward progress constraint.
       *
       * UV_RUN_NOWAIT makes no guarantees about progress so it's omitted from
       * the check.
       */
      uv__update_time(loop);
      uv__run_timers(loop);
    }

    r = uv__loop_alive(loop);
    if (mode == UV_RUN_ONCE || mode == UV_RUN_NOWAIT)
      break;
  }

  /* The if statement lets gcc compile it to a conditional store. Avoids
   * dirtying a cache line.
   */
  if (loop->stop_flag != 0)
    loop->stop_flag = 0;

  return r;
}
```

<br/>

- 각 메소드 들을 하나씩 순서대로 살펴보면 다음과 같다. phase와 관련된 메소드의 코드는 각각의 phase에 대해 알아볼 때 살펴보자.

  1. `**uv__loop_alive()**`

     ```c
     // UNIX 버전
     // https://github.com/nodejs/node/blob/c61870c376e2f5b0dbaa939972c46745e21cdbdd/deps/uv/src/unix/core.c#L357
     static int uv__loop_alive(const uv_loop_t* loop) {
       return uv__has_active_handles(loop) ||
              uv__has_active_reqs(loop) ||
              loop->closing_handles != NULL;
     }

     // Windows 버전
     // https://github.com/nodejs/node/blob/e46c680bf2b211bbd52cf959ca17ee98c7f657f5/deps/uv/src/win/core.c#L584
     static int uv__loop_alive(const uv_loop_t* loop) {
       return uv__has_active_handles(loop) ||
              uv__has_active_reqs(loop) ||
              loop->endgame_handles != NULL;
     }
     ```

     다음 세 조건 중 하나라도 만족하면 `true` 를, 모두 만족하지 못하면 `false` 를 반환한다.

     - 현재 active한 핸들러(콜백)가 있는가?
     - 현재 active한 요청(operation)이 있는가?
     - closing 핸들러 (close 이벤트 핸들러)가 있는가?
     - 이벤트 루프의 iteration마다 `uv__loop_alive()` 를 호출하여 리턴값이 `true` 일 경우에만 계속해서 이벤트 루프를 돌린다.

    <br/>

  2. `**uv_update_time()**`

     ```c
     void uv_update_time(uv_loop_t* loop) {
       uint64_t new_time = uv__hrtime(1000);
       assert(new_time >= loop->time);
       loop->time = new_time;
     }

     uint64_t uv__hrtime(uv_clocktype_t type) {
       struct timespec ts;
       clock_gettime(CLOCK_MONOTONIC, &ts);
       return (((uint64_t) ts.tv_sec) * NANOSEC + ts.tv_nsec);
     }
     ```

     - 내부적으로 시스템 콜을 호출하여 현재 루프의 시간을 (ms의 정확도로) 업데이트 한다.

    <br/>

  3. `**uv__run_timers()**` : Timer phase
  4. `**uv__run_pending()**` : Pending I/O phase
  5. `**uv__run_idle() & uv__run_prepare()**` : idle & prepare phase
  6. `**uv__io_poll()**` : poll phase
  7. `**uv__run_check**` : check phase
  8. `**uv__run_closing_handles()`\*\* : close phase

### Timer phase

이벤트 루프가 `Timer phase` 에 진입하면 타이머 큐에 콜백들이 있는지를 살펴보고, 있으면 해당 콜백들을 실행한다. 사실, 편의상 타이머 "큐"라고 했지만 타이머 phase의 큐는 "queue" 자료구조가 아니라 "min-heap" 자료구조이다. 힙에는 타이머들이 각각의 타이머가 만료되는 시간을 기준으로 저장되며, 이벤트 루프가 이 힙에 있는 타이머를 하나씩 살펴보면서 실행한다.

코드를 통해 조금 더 자세히 말하자면 다음과 같다. 일단 Timer phase는 내부적으로 `uv__run_timers()` 로 구현되어있다. 앞서 min-heap에 저장한 작업들 중 `uv__update_time()` 을 통해 계산한 현재 (iteration의) 시간과 각각의 타이머가 만료되는 시간을 비교하여 만료된 타이머의 콜백들을 실행한다. 다시말해, 만료되지 않은 타이머(즉, 아직 실행하면 안되고 더 나중에 실행해야하는 콜백의 타이머)를 발견할 때까지 계속해서 타이머를 체크해 나간다. 그러다 만료되지 않은 타이머를 발견하면 즉시 타이머 체크를 종료하고 다음 phase로 넘어간다.

이 때, Timer phase에는 system-dependent한 limit이 존재하는데, 이로 인해 만약 만료된 타이머들이 남아있다고 하더라도 Timer phase를 수행한 시간이 limit을 넘게 되면 남아있는 만료된 타이머들(의 콜백)을 실행하지 않고 다음 phase로 넘어간다.

```c
// https://github.com/nodejs/node/blob/e46c680bf2b211bbd52cf959ca17ee98c7f657f5/deps/uv/src/timer.c#L163

void uv__run_timers(uv_loop_t* loop) {
  struct heap_node* heap_node;
  uv_timer_t* handle;

  for (;;) {
    heap_node = heap_min(timer_heap(loop));
    if (heap_node == NULL)
      break;

    handle = container_of(heap_node, uv_timer_t, heap_node);
    if (handle->timeout > loop->time)
      break;

    uv_timer_stop(handle);
    uv_timer_again(handle);
    handle->timer_cb(handle);
  }
}
```

<br/>

> Node.js의 타이머는 "정확히" 명시된 시간 이후에 실행되지 않는다.

다시말해, `setTimeout()` 혹은 `setInterval()` 에 지정해주는 delay(timer)는 콜백이 **정확히** 얼마 뒤에 실행되는지를 나타내는 것이 아니라, 콜백이 **적어도** 해당 delay 이후에 실행된다는 것을 나타낸다. 이는 현재 시간을 계산하고, 현재 시간과 타이머의 시간을 비교하는 작업이 CPU-intensive한 작업이라 다소 시간이 걸리기 때문이며 또한 현재 Node.js의 콜스택 상태 등에 영향을 받기 때문이다.

예를 들어 `setTimeout(cb, 100)` 에서 delay `100` 이 나타내는 의미는 콜백 `cb` 가 "정확히 100ms 이후에 실행된다"는 것이 아니라, "적어도 100ms 이후에" 혹은 "최소한 100ms 있다가" 실행된다는 의미이다. 따라서 해당 `setTimeout()` 을 실행시킨 후 정확히 100ms 이후에 `cb` 가 실행되는지는 알 수 없다 (정확히 100ms 이후에 실행될 수도 있고, 100ms보다 더 뒤에 실행될 수도 있다).

<br/>

> 타이머의 최소값은 1ms이다.

한 가지 흥미로운 사실은, 만약 `setTimeout(cb, 0);` 과 같이 사용한다면 내부적으로 타이머 `0ms` 가 `1ms` 로 변환된다는 것이다.

그 이유는 크롬에서 위와 같이 동작하기 때문인데, Node.js 에서도 크롬과 동일한 방식으로 동작하게 하기 위해 위와 같이 작동한다. 크롬의 V8 코드를 보면 다음과 같이 짜여있음을 알 수 있다:

```cpp
// https://chromium.googlesource.com/chromium/blink/+/refs/heads/main/Source/core/frame/DOMTimer.cpp#93

double intervalMilliseconds = std::max(oneMillisecond, interval * oneMillisecond);
```

즉, 주어진 딜레이 값과 `1ms` 중에 더 큰 값을 타이머로 세팅하는 것을 볼 수 있다. 따라서 사실상 default 타이머는 `1ms` 라고 할 수 있다.

### Pending I/O phase

타이머 phase 이후, 이벤트 루프는 Pending I/O phase에 진입하여 이전에 처리되지 못하고 연기(pending)된 콜백들을 실행한다. 이러한 콜백들은 `pending_queue` 에 저장되어 있다.

이렇게 "연기"된 콜백들이 존재하는 이유는, 이벤트 루프가 각 phase를 실행할 때 해당 phase의 큐에 있는 모든 작업을 처리하는 것이 아니라 (limit 등에 의해) 일정량의 작업만 처리하고 다음으로 넘어가기 때문이다. 만약 모든 작업을 처리하게 된다면 이벤트 루프가 특정 phase에서 block될 수 있을 것이다.

```c
// https://github.com/nodejs/node/blob/c61870c376e2f5b0dbaa939972c46745e21cdbdd/deps/uv/src/unix/core.c#L806
// https://github.com/nodejs/node/blob/e46c680bf2b211bbd52cf959ca17ee98c7f657f5/deps/uv/src/win/req-inl.h#L141
// UNIX 버전
static int uv__run_pending(uv_loop_t* loop) {
  QUEUE* q;
  QUEUE pq;
  uv__io_t* w;

  if (QUEUE_EMPTY(&loop->pending_queue))
    return 0;

  QUEUE_MOVE(&loop->pending_queue, &pq);

  while (!QUEUE_EMPTY(&pq)) {
    q = QUEUE_HEAD(&pq);
    QUEUE_REMOVE(q);
    QUEUE_INIT(q);
    w = QUEUE_DATA(q, uv__io_t, pending_queue);
    w->cb(loop, w, POLLOUT);
  }

  return 1;
}
```

Pending I/O phase의 메소드는 `pending_queue` 가 비어있으면 0을 리턴하고 종료한다. 만약 `pending_queue` 에 콜백들이 있으면 해당 콜백들을 실행하고 1을 리턴한다.

### Idle, Prepare phase

사실 이름을 잘못 지었다(?). 이름은 `Idle phase`이지만 매 tick마다 실행된다. `Prepare phase` 도 마찬가지로 polling을 시작하기 전마다 실행된다.

어쨌든 종합해보자면, 이 두 phase는 Node.js의 내부 동작을 위해 존재하는 phase이다. 따라서 이 글에서는 다루지 않겠다.

<br/>

\> 2부에 계속...
