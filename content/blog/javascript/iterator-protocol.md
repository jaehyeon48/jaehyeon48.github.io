---
title: '자바스크립트 Iteration 프로토콜'
date: 2022-01-10
category: 'JavaScript'
draft: false
---

## Iteration 프로토콜

자바스크립트의 iteration 프로토콜은 데이터 소스(sources)와 데이터 소비자(consumer) 개체(entity)를 연결하는 역할을 합니다. Iteration은 데이터 소스가 구현한 `Iterable` 이라는 인터페이스를 데이터 소비자가 사용하는 방식으로 동작합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/iterator-protocol/data-sources-and-consumers.png" alt="JavaScript data sources and consumers">
    <figcaption>자바스크립트 데이터 소스와 데이터 소비자 및 이들을 연결하는 인터페이스</figcaption>
</figure>

자바스크립트 iteration 프로토콜에는 **iterable 프로토콜**과 **iterator 프로토콜**이 존재하는데, 하나씩 살펴봅시다.

## Iterable 프로토콜

Iterable 프로토콜은 자바스크립트 객체가 `for...op`문, `...`연산과 같은 "iteration" 동작을 할 때 어떤 식으로 행동할지를 정의하는 프로토콜 입니다. 객체가 `iterable`이 되기 위해선 해당 객체의 내부 혹은 프로토타입 체인내에 `@@iterator` 메서드가 존재해야 합니다. `@@iterator`는 [well-known-symbol](https://tc39.es/ecma262/#sec-well-known-symbols)이라고 하는데, [Symbol.iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator)라는 상수를 통해 접근할 수 있습니다. ES2021을 기준으로 자바스크립트에는 `String`, `Array`, `TypedArray`, `Map`, `Set` 5가지 내장 iterable이 존재합니다.

Iterable을 타입스크립트 인터페이스로 나타내면 다음과 같습니다:

```ts
interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}
```

## Iterator 프로토콜

Iterator 프로토콜은 iterable 객체를 iteration할 때 어떤 값을 생성할 것인가를 정의하는 프로토콜입니다. 객체가 `iterator`가 되기 위해선 `iteration result` 객체를 반환하는 `next()` 메서드를 가지고 있어야 합니다.

Iterator와 iteration result 객체를 타입스크립트 인터페이스로 나타내면 다음과 같습니다:

```ts
interface Iterator<T> {
  next(): IterationResult<T>;
}

interface IteratorResult<T> {
  value: T;
  done: boolean;
}
```

IterationResult 객체의 `value`와 `done` 속성이 나타내는 것은 다음과 같습니다:

- **value**: `iterator`에 의해 반환된 값입니다. 아무 타입이나 가능하며, `done` 속성이 `true`이면 생략될 수도 있습니다.
- **done**: iteration의 종료 여부를 나타내는 boolean 값입니다. 이 속성을 생략하면 `done: false`로 간주합니다.

<br />

`next()` 메서드는 반드시 `value`와 `done` 속성이 존재하는 객체를 반환해야만 합니다. `false`와 같은 원시 타입이 반환되면 `TypeError`가 발생합니다.

`for...of` 문의 `break`을 사용하는 경우 혹은 예외 상황과 같이, `iteration result` 객체의 `done` 속성이 `true`가 되기 전에 iteration이 종료되는 경우도 있습니다. 이 경우 자바스크립트 엔진은 `iterator` 객체에 `return()` 메서드가 존재하는지 살펴보고 만약 존재한다면 이 메서드를 아무런 인자 없이 호출합니다. 이때 `return()` 메서드 또한 반드시 `iteration result` 객체를 반환해야만 하는데, 비록 반환된 객체의 속성이 무시되기는 하지만 그렇다고 원시 타입을 반환하면 에러가 발생합니다. `return()` 메서드는 주로 iteration 동작을 종료한 뒤 클린업 작업을 수행해야 할 때, 예기치 못한 에러 등으로 인해 동작이 중간에 종료되는 경우에도 정상적으로 클린업 작업을 수행하기 위해 사용합니다.

## Reference

[Iteration protocols - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)

[JavaScript for impatient programmers (ES2021 edition)](https://exploringjs.com/impatient-js/)

[JavaScript: The Definitive Guide, 7th Edition](https://www.oreilly.com/library/view/javascript-the-definitive/9781491952016/)