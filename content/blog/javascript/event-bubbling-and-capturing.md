---
title: '이벤트 버블링과 캡처링'
date: 2021-12-11
category: 'javascript'
draft: false
---

## 버블링과 캡처링

- 이벤트 버블링과 캡처링은 중첩된 HTML 요소에서 이벤트가 발생했을 때 처리되는 단계들을 설명하는 용어이다.
- 모든 자바스크립트 이벤트엔 버블링과 캡처링 단계가 존재한다.

## 이벤트 버블링

- 이벤트 버블링이란, 어떤 요소에 대해 특정 이벤트가 발생했을 때 해당 이벤트가 상위 부모 요소들로 전달되는 특성을 의미한다. 즉, 우선 해당 요소의 (해당 이벤트에 대한) 이벤트 핸들러를 호출하고, 그다음으로 상위 요소(부모)의 이벤트 핸들러를 호출하고, 그다음 상위 요소의 이벤트를 호출하고, ... 이런 식으로 동작하게 된다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/event-bubbling-and-capturing/event_bubbling.png" alt="Event Bubbling">
    <figcaption>출처: https://joshua1988.github.io/web-development/javascript/event-propagation-delegation/</figcaption>
</figure>

- [이벤트 버블링 예시](https://codepen.io/jaehyeon48/pen/WNOMQzj)

### 버블링 멈추기

- 일반적으로 이벤트 버블링은 타겟 요소로 부터 `<html>` 요소를 거쳐 `document` 객체까지, 심지어 몇몇 이벤트들은 `window` 객체까지 전달된다.
- 이 떄, 이벤트 핸들러는 `event.stopPropagation()`함수를 이용하여 버블링을 중단할 수 있다. [예제](https://jsfiddle.net/jaehyeon48/xg5u1h9b/5/)
- 다만, `event.stopPropagation()`을 사용하더라도 특정 요소에 여러 개의 핸들러가 존재하는 경우, 해당 핸들러 들은 여전히 실행된다. 이것을 막기 위해선 `event.stopImmediatePropagation()`을 사용할 수 있다. [예제](https://jsfiddle.net/jaehyeon48/8073fk5g/13/)

## 이벤트 캡처링

- 이벤트 캡처링은 버블링과 반대 방향으로 일어나는 전파 방식으로, 실제 코드에서 잘 쓰이지는 않지만 때때로 유용하게 사용될 수 있다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/event-bubbling-and-capturing/event_capturing.png" alt="Event Capturing">
    <figcaption>출처: https://joshua1988.github.io/web-development/javascript/event-propagation-delegation/</figcaption>
</figure>

## 표준 DOM 이벤트

- [표준 DOM 이벤트 스펙](https://www.w3.org/TR/DOM-Level-3-Events/)에선 이벤트 흐름을 다음 3 단계로 정의하고 있다:

  1. **캡처링 단계**: 이벤트가 하위 요소로 전파되는 단계.
  2. **타겟 단계**: 이벤트가 타겟 요소에 도달한 단계.
  3. **버블링 단계**: 이벤트가 상위 요소로 버블링 되는 단계.

- 아래 그림을 통해 `<table>` 안에 있는 `<td>` 를 클릭하게 되면 어떤 일이 일어나는지 살펴보자:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/event-bubbling-and-capturing/event_dispatch.png" alt="Event Dispatch">
    <figcaption>출처: https://www.w3.org/TR/DOM-Level-3-Events/</figcaption>
</figure>

- 우선, `<td>` 를 클릭하게 되면 이벤트가 최상위 조상 요소부터 시작하여 아래로 전파되고(⟶ 캡처링 단계), 타겟 요소에 도달하여 발생시킨 후(⟶ 타겟 단계), 다시 위로 올라가면서(⟶ 버블링 단계) 각 요소들의 핸들러를 호출한다.
- 이벤트 캡처링 단계를 포착하기 위해선 다음과 같이 리스너를 등록할 때 `capture` 인자를 추가적으로 전달해야 한다:

```js
element.addEventListener(type, listener, { capture: true });
// 혹은
element.addEventListener(type, listener, true);
```

- `capture` 옵션이 `false`인 경우, 핸들러는 버블링 단계에서 동작한다. 이 값이 default 이다 (즉, 기본적으로 핸들러는 버블링 단계에서 동작한다).
- `capture` 옵션이 `true`인 경우, 핸들러는 캡처링 단계에서도 동작한다.
- 공식적으로는 이벤트 흐름에 총 3단계가 있지만 2번째 단계인 타겟 단계는 따로 처리되지 않는다. 캡처링과 버블링 단계의 이벤트 핸들러가 trigger 되는 시점은 타겟 단계이다.
- [예시](https://jsfiddle.net/oz16g4mb/6/)

## target과 currentTarget

- 이벤트 핸들러의 첫 번째 매개 변수인 [Event](https://developer.mozilla.org/en-US/docs/Web/API/Event) 객체의 `target`과 `currentTarget` 속성을 통해, 부모 요소는 이벤트가 실제로 발생한 요소가 어디인지에 대한 정보를 얻을 수 있다.
- `Event.target`은 이벤트가 **실제로 발생한** 요소를 가리킨다. 이벤트 버블링이 일어나더라도 `Event.target`이 가리키는 요소는 바뀌지 않는다.
- `Event.currentTarget`은 **현재 실행중인 이벤트 핸들러가 처리하고 있는** 요소를 가리킨다.
- [예제](https://codepen.io/jaehyeon48/pen/rNwJLNG)

## 이벤트 위임

- 추가 예정...

## Reference

[https://javascript.info/bubbling-and-capturing](https://javascript.info/bubbling-and-capturing)

[https://joshua1988.github.io/web-development/javascript/event-propagation-delegation/](https://joshua1988.github.io/web-development/javascript/event-propagation-delegation/)

[https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture)