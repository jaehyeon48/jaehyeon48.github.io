---
title: '이벤트 버블링과 캡처링'
date: 2021-12-11
category: 'JavaScript'
draft: false
---

## DOM 이벤트 흐름

우선 이벤트 버블링과 캡처링을 살펴보기 전에, DOM 이벤트 흐름에 대해 간단히 살펴봅시다.

[DOM 이벤트 스펙](https://www.w3.org/TR/DOM-Level-3-Events/)에 따르면, 어떤 DOM 요소에 이벤트가 발생했을 때, 아래 3단계를 통해 이벤트가 전파됩니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/event-bubbling-and-capturing/event_dispatch.png" alt="DOM 이벤트 전파 과정">
    <figcaption>DOM 이벤트 전파 과정. 출처:https://www.w3.org/TR/DOM-Level-3-Events/</figcaption>
</figure>

1. **캡처 단계(capture phase)**: 이벤트가 `window`객체로 부터 이벤트 타겟(이벤트가 발생한 요소)으로 전파되는 단계입니다.
2. **타겟 단계(target phase)**: 이벤트가 타겟 요소에 도달한 단계입니다.
3. **버블 단계(bubble phase)**: 캡처 단계와는 거꾸로, 이벤트가 타겟 요소로 부터 상위 요소로 전파되는 단계입니다.

📌 공식적으로는 이벤트 흐름에 총 3단계가 있지만, 2번째 단계인 타겟 단계는 따로 처리되진 않습니다. 캡처링과 버블링 단계의 이벤트 핸들러가 호출되는 시점은 타겟 단계입니다.

## 이벤트 버블링

**이벤트 버블링(event bubbling)**이란, 어떤 요소에 특정 이벤트가 발생했을 때 해당 이벤트가 상위 부모 요소들로 전달되는 것을 말합니다. 이벤트 버블링은 해당 요소의 (해당 이벤트에 대한) 이벤트 핸들러를 호출하고, 그다음으로 상위 요소(부모)의 이벤트 핸들러를 호출하고, 그다음 상위 요소의 이벤트를 호출하고, ... 이런 식으로 동작합니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/event-bubbling-and-capturing/event_bubbling.png" alt="Event Bubbling">
    <figcaption>이벤트 버블링.</figcaption>
</figure>

이벤트 버블링 예제:

<iframe
  src="https://codesandbox.io/embed/summer-meadow-bu4odo?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="event-bubbling-example"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts">
</iframe>

위 예제에서, 자식 요소를 클릭했을 때 클릭 이벤트가 부모 요소로 전파되는 모습을 볼 수 있습니다.

### 버블링 멈추기

일반적으로 이벤트 버블링은 타겟 요소로 부터 `<html>` 요소를 거쳐 `document` 객체까지, 심지어 몇몇 이벤트들은 `window` 객체까지 전달되는데, 이벤트 핸들러는 `event.stopPropagation()` 함수를 사용하여 버블링을 중단할 수도 있습니다. 아래 예시에는 `ul` 요소의 핸들러에 `event.stopPropagation()` 함수가 사용되어있는데, `ul` 요소의 자식 요소인 `li`나 `p`에서 이벤트를 발생시켰을 때 버블링이 `ul`에서 멈추는 것을 확인할 수 있습니다:

<iframe src="https://codesandbox.io/embed/event-bubbling-with-stop-immediate-propagation-forked-lce4kx?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="event-bubbling-with-stop-propagation"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

단, 특정 요소에 여러 개의 이벤트 핸들러가 부착된 경우, `event.stopPropagation()`을 사용하면 버블링을 막을 순 있지만 나머지 핸들러들은 여전히 실행됩니다:

<iframe src="https://codesandbox.io/embed/event-bubbling-with-stop-immediate-propagation-g1p81x?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="event-bubbling-with-stop-immediate-multiple-handlers"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

버블링도 막고 나머지 핸들러들의 실행도 막기 위해선 `event.stopImmediatePropagation()`을 사용해야 합니다:

<iframe src="https://codesandbox.io/embed/event-bubbling-with-stop-immediate-propagation-llfq8t?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="event-bubbling-with-stop-immediate-propagation"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

## 이벤트 캡처링

**이벤트 캡처링(event capturing)**은 이벤트 버블링과는 반대로, 이벤트가 부모 요소로부터 자식 요소로 전파되는 것을 의미합니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/event-bubbling-and-capturing/event_capturing.png" alt="Event Capturing">
    <figcaption>이벤트 캡처링.</figcaption>
</figure>

이벤트 캡처링 단계를 처리하기 위해선 이벤트 리스너를 등록할 때 아래와 같이 3번째 `capture` 인자를 추가로 전달해야 합니다:

```js
element.addEventListener(type, listener, { capture: true });
// 혹은
element.addEventListener(type, listener, true);
```

`capture`의 옵션 기본값은 `false`이며, 이 경우 이벤트 핸들러는 버블링 단계에서만 동작합니다 (즉, 기본적으로 이벤트 핸들러는 버블링 단계에서만 동작합니다). 하지만 `capture` 옵션이 `true`인 경우, 핸들러는 캡처링단계만 동작하게 됩니다.

이벤트 캡처링 예시:

<iframe src="https://codesandbox.io/embed/event-capturing-example-kde1on?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="event-capturing-example"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

위 예시에선 `div`와 `ul` 요소의 이벤트 핸들러에만 `{ capture: true }`값이 전달되었습니다. 따라서 `div`, `ul`에 부착된 이벤트 핸들러는 캡처링 단계만 처리하며, `{ capture: false }`(기본값) 으로 설정된 `li`의 이벤트 핸들러는 캡처링 단계를 건너뛰게 됩니다.

또한, 이벤트 버블링에서와 마찬가지로 이벤트 캡처링 단계를 처리하는 이벤트 핸들러에 `stopPropagation()` 함수가 호출되면 이벤트가 더 이상 아래로 전파되지 않습니다:

<iframe src="https://codesandbox.io/embed/event-capturing-example-forked-b4uhsq?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="event-capturing-with-stop-propagation"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

위 예제에서 `p`를 클릭하여 이벤트를 발생시켰을 때, 이벤트 캡처링 단계를 처리하는 `ul`의 이벤트 핸들러가 `stopPropagation()`을 호출하고 있기 때문에 이벤트가 더 이상 아래로 전파되지 않는 것을 확인할 수 있습니다. 이에 따라 실제로 이벤트가 발생한 `p`의 이벤트 핸들러가 호출되지 않게 됩니다.

## target과 currentTarget

이벤트 핸들러의 첫 번째 매개 변수인 [Event](https://developer.mozilla.org/en-US/docs/Web/API/Event) 객체의 `target`과 `currentTarget` 속성을 통해, 부모 요소는 이벤트가 실제로 발생한 요소가 어디인지에 대한 정보를 얻을 수 있습니다.

`Event.target`은 이벤트가 **실제로 발생한 요소**를 가리킵니다. 이벤트 버블링(혹은 캡처링)이 일어나더라도 `Event.target`이 가리키는 요소는 바뀌지 않습니다. `Event.currentTarget`은 **현재 호출된 이벤트 핸들러가 처리하고 있는 요소**를 가리킵니다.

<iframe src="https://codesandbox.io/embed/event-target-vs-event-current-target-0hfyc1?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="event-target-vs-event-current-target"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

## 이벤트 위임

**이벤트 위임(event delegation)**은 앞서 살펴본 이벤트 버블링(및 캡처링)을 이용하는 사례로서, 일반적으로 이벤트 버블링을 이용하여 자식 요소 각각에 이벤트를 붙이지 않고 부모 요소에서 자식 요소들의 이벤트를 제어하는 방식으로 사용됩니다.

<iframe src="https://codesandbox.io/embed/event-target-vs-event-current-target-forked-dputc5?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="event-delegation-example"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

위 예제에선 특정 타일 요소를 클릭하면 해당 요소의 바탕색을 변경하는 예시입니다. 이때, 반복문을 활용하여 각각의 타일 요소마다 이벤트 핸들러를 등록하는 대신, 이벤트 위임 기법을 활용하여 부모 요소인 컨테이너 요소에 이벤트 핸들러를 등록하고 이벤트 핸들러 내에서 `event.target` 속성을 활용하여 바탕색을 변경하는 방식을 사용하고 있습니다.

이렇듯 이벤트 위임 기법을 사용하면,
  - 동적인 엘리먼트에 대한 이벤트 처리가 수월하고,
  - 상위 엘리먼트에서만 이벤트 핸들러 관리하기 때문에 하위 엘리먼트는 자유롭게 추가 삭제할 수 있고,
  - 동일한 이벤트에 대해 이벤트 핸들러를 한 곳에서 관리하기 때문에 각각의 엘리먼트를 여러 곳에 등록하여 관리하는 것보다 관리가 수월하고,
  - 많은 핸들러를 할당하지 않아도 되기 때문에 메모리 사용량이 줄어들고,
  - 등록 핸들러 자체가 줄어들기 때문에 메모리 누수 가능성도 줄어들게 됩니다.

## Reference

- [Bubbling and capturing | javascript.info](https://javascript.info/bubbling-and-capturing)
- [이벤트 버블링, 이벤트 캡처 그리고 이벤트 위임까지 | 캡틴판교](https://joshua1988.github.io/web-development/javascript/event-propagation-delegation/)
- [Introduction to events - Learn web development | MDN](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture)
- [왜 이벤트 위임(delegation)을 해야 하는가? | TOAST UI :: Make Your Web Delicious!](https://ui.toast.com/weekly-pick/ko_20160826)
