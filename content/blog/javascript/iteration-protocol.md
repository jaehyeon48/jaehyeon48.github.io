---
title: '자바스크립트 Iteration 프로토콜'
date: 2022-01-10
category: 'JavaScript'
draft: false
---

## Iteration 프로토콜

자바스크립트의 iteration 프로토콜은 데이터 소스(sources)와 데이터 소비자(consumer) 개체(entity)를 연결하는 역할을 합니다. Iteration은 데이터 소스가 구현한 `Iterable` 이라는 인터페이스를 데이터 소비자가 사용하는 방식으로 동작합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/iterator_protocol/data_sources_and_consumers.png" alt="JavaScript data sources and consumers">
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

## Iterable 객체를 iterate 하는 방법

`Iterable` 객체를 iterate 하는 방법은 다음과 같습니다:

1. `Iterable` 객체의 `@@iterator` 메서드를 호출하여 해당 객체의 `iterator` 객체를 획득합니다.
2. `iterator` 객체가 반환하는 `iteration result` 객체의 `done` 속성값이 `true`가 될 때까지 `next()` 메서드를 호출합니다.

이를 그림으로 나타내면 다음과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/iterator-protocol/how_iteration_works_under_the_hood.png" alt="How iteration works under the hood">
    <figcaption>Iterable 객체를 iterate 하는 방법</figcaption>
</figure>

이를 이용하여 어떤 `iterable` 객체에 대한 일반적인 `for...of` 문을 다음 코드와 같이 작성할 수 있습니다:

```js
const iterable = [1, 2, 3];
const iterator = iterable[Symbol.iterator]();

for (let it = iterator.next(); !it.done; it = iterator.next()) {
  console.log(it.value);
} // 1, 2, 3


// for...of 내부에서 자동으로 iterator 메소드를 호출하여 iterator 객체를 사용합니다
for (const elem of iterable) {
    console.log(elem);
} // 1, 2, 3
```

<br />

`iterable`, `iterator` 객체의 주요한 특징 중 하나는, 이 객체들이 본질적으로 lazy 한 특성을 보인다는 것입니다. 즉, 다음 값을 얻기 위해 계산을 해야 할 때, 해당 값이 실제로 필요한 시점까지 그 계산을 미루는 것입니다.

예를 들어 아주 긴 문자열을 공백으로 분리하여 여러 단어들로 토큰화하는 경우를 생각해봅시다. `.split()` 메소드를 사용하면 손쉽게 할 수 있지만, 이렇게 하면 분리하여 얻은 첫 번째 단어를 사용하기도 전에 미리 모든 문자열을 처리해놓게 됩니다. 만약 이렇게 했다가 나중에 알고 보니 처음 몇 개의 단어만 사용하고 나머지는 사용하지 않게 된다면 불필요한 메모리 낭비를 초래하게 됩니다.

또한 `iterable`, `iterator` 프로토콜을 통해 배열과 같이 주로 iteration의 대상이 되는 자료 구조 이외의 어느 자료구조라도 손쉽게 iteration을 할 수 있게 됩니다.

## 비동기 iteration

우선 앞서 살펴본 iterator와 iterator result의 인터페이스를 다시 한번 살펴봅시다:

```ts
interface Iterator<T> {
  next(): IteratorResult<T>;
}

interface IteratorResult<T> {
  value: T;
  done: boolean;
}
```

비동기 iteration 프로토콜을 구현하기 위해선 `next()` 메서드의 반환 값을 비동기로 전달하기만 하면 됩니다. 이를 위해 다음의 두 가지 방법을 고려해볼 수 있습니다:

- `value`만 프로미스로 감쌀 것인가? (`value`의 타입이 `Promise<T>`)
- `next()` 메서드가 프로미스를 반환할 것인가? (`next()`의 리턴 타입이 `Promise<IteratorResult<T>>`)

하지만 생각해보면 두 번째 방법이어야만 합니다. 그 이유는 `next()` 메서드가 결과를 반환할 때 비동기 작업을 수행하기 때문인데, 작업의 결과값을 반환할지 아니면 iteration의 종료를 알릴지는 비동기 작업이 끝난 이후에야 할 수 있습니다. 다시 말해, `value`와 `done` 속성 모두 프로미스로 감싸야 한다는 의미입니다.

비동기 iteration에 대한 인터페이스는 다음과 같습니다:

```ts
interface AsyncIterable<T> {
  [Symbol.asyncIterator](): AsyncIterator<T>;
}

interface AsyncIterator<T> {
  next(): Promise<IteratorResult<T>>; // 동기 iteration 인터페이스와 차이나는 부분입니다.
}

interface IteratorResult<T> {
  value: T;
  done: boolean;
}
```

이러한 비동기 iteration 프로토콜을 이용하여 `for await...of` 문을 사용할 수 있습니다.

## Reference

[Iteration protocols - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)

[JavaScript for impatient programmers (ES2021 edition)](https://exploringjs.com/impatient-js/)

[JavaScript: The Definitive Guide, 7th Edition](https://www.oreilly.com/library/view/javascript-the-definitive/9781491952016/)