---
title: '자바스크립트 Iteration 프로토콜'
date: 2022-01-10
category: 'JavaScript'
draft: false
---

## Iteration 프로토콜

자바스크립트의 **Iteration 프로토콜**은 데이터 소비자(data consumer)가 다양한 종류의 데이터 소스(data source)를 순회할 때 일관된 방식으로 순회할 수 있도록 데이터 제공자와 데이터 소비자를 연결하는 *인터페이스* 역할을 합니다. 예를 들어, `for...of`(데이터 소비자) 문이 배열과 같은 대표적인 데이터 소스 뿐만 아니라 `Map`, `Set` 자료형과 같은 데이터 소스를 순회할 때도 일관된 방식으로 순회할 수 있도록 규칙을 정한 것이죠.

자바스립트에서 순회는 데이터 소스가 구현한 `Iterable` 이라는 인터페이스를 데이터 소비자가 사용하는 방식으로 동작합니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/iterator-protocol/data_sources_and_consumers.png" alt="JavaScript data sources and consumers">
    <figcaption>자바스크립트 데이터 제공자와 데이터 소비자 및 이들을 연결하는 인터페이스</figcaption>
</figure>

자바스크립트 iteration 프로토콜에는 **iterable 프로토콜**과 **iterator 프로토콜**이 존재하는데, 하나씩 살펴봅시다.

## Iterable 프로토콜

`for...of`, `...`연산과 같은 순회 동작을 할 때 데이터 공급자가 어떤 식으로 동작할지를 정의하는 프로토콜을 **Iterable 프로토콜**이라고 합니다. 이때 iterable 프로토콜을 만족하는 객체를 `Iterable` 이라고 합니다.

자바스크립트 객체가 `Iterable`이 되기 위해선 해당 객체의 내부 혹은 프로토타입 체인 내에 [Symbol.iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator) 메서드가 정의되어 있어야 하고, 이 메서드는 "iterator"를 반환해야 합니다. ES2021을 기준으로 자바스크립트에는 `String`, `Array`, `TypedArray`, `Map`, `Set` 5가지 built-in iterable이 존재합니다.

Iterable을 타입스크립트 인터페이스로 나타내면 다음과 같습니다:

```ts
interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}
```

## Iterator 프로토콜

**Iterator 프로토콜**은 데이터 소스를 순회할 때 어떤 값을 생성할 것인가를 정의하는 프로토콜로서, iterator 프로토콜을 만족하는 객체를 `iterator`라고 합니다. 이때, 어떤 객체가 iterator 프로토콜을 만족하기 위해선 `iteration result` 객체를 반환하는 `next()` 메서드를 가지고 있어야 합니다.

`Iterator`와 `iteration result` 객체를 타입스크립트 인터페이스로 나타내면 다음과 같습니다:

```ts
interface Iterator<T> {
  next(): IterationResult<T>;
}

interface IteratorResult<T> {
  value: T;
  done: boolean;
}
```

`IterationResult` 객체의 `value`와 `done` 속성이 나타내는 것은 다음과 같습니다:

- **value**: `iterator`에 의해 반환된 값으로, 특정 순회에서 사용되며 아무 타입이나 가능합니다. 만약 `done` 속성이 `true`이면 생략될 수도 있습니다.
- **done**: 순회 종료 여부를 나타내는 boolean 값으로, 이 속성을 생략하면 `done: false`로 간주합니다.

이때, `next()` 메서드는 반드시 `value`와 `done` 속성이 존재하는 객체를 반환해야 합니다. `false`와 같은 원시 타입이 반환되면 `TypeError`가 발생합니다.

`for...of` 문의 `break`을 사용하는 경우 혹은 예외 상황과 같이, `iteration result` 객체의 `done` 속성이 `true`가 되기 전에 iteration이 종료되는 경우도 있습니다. 이 경우 자바스크립트 엔진은 `iterator` 객체에 `return()` 메서드가 존재하는지 살펴보고 만약 존재한다면 이 메서드를 아무런 인자 없이 호출합니다. 이때 `return()` 메서드 또한 반드시 `iteration result` 객체를 반환해야만 하는데, 비록 반환된 객체의 속성이 무시되기는 하지만 그렇다고 원시 타입을 반환하면 에러가 발생합니다. `return()` 메서드는 주로 iteration 동작을 종료한 뒤 클린업 작업을 수행해야 할 때, 예기치 못한 에러 등으로 인해 동작이 중간에 종료되는 경우에도 정상적으로 클린업 작업을 수행하기 위해 사용합니다.

## Iterable 객체를 순회하는 방법

`Iterable` 객체를 순회하는 방법은 다음과 같습니다:

1. `Iterable` 객체의 `Symbol.iterator` 메서드를 호출하여 해당 객체의 `iterator` 객체를 획득합니다.
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

여태껏 살펴본 내용을 정리해보면 다음과 같습니다:

- **iteration protocol**: 다양한 종류의 데이터 소스를 일관된 방식으로 순회할 수 있도록 정의한 인터페이스.
- **iterable**: iterable protocol을 만족하는 객체로서, `iterator`를 반환하는 `Symbol.iterator()` 메서드를 가지고 있거나 프로토타입 체인을 통해 찾을 수 있는 객체.
- **iterator**: `iteration result` 객체를 반환하는 `next()` 메서드를 구현한 객체.
- **iteration result**: 특정 순회에서 사용되는 값인 `value`와 순회 종료 여부를 나타내는 `done` 프로퍼티를 가지고 있는 객체.

## 예시

우선, `iterable`이 아닌 일반 객체를 살펴봅시다:

```js
// iterable이 아닌 일반 객체는 for...of문을 사용할 수 없습니다.
const normalObj = { a: 1, b: 2 };

// TypeError: normalObj is not iterable
for (const value of normalObj) {
  console.log(value);
}
```

하지만 위 객체가 iterable 프로토콜을 준수하도록 `Symbol.iterator()` 메서드를 구현하고, 이 메서드에서 iterator를 리턴하도록 하면 아래와 같이 `for...of` 문을 순회할 수 있게 됩니다:

```js
function range(from, to) {
  let curVal = from - 1;

  // Symbol.iterator() 메서드를 구현함으로써 이 객체는
  // iterable이 됩니다.
  return {
    [Symbol.iterator]() {
      // Symbol.iterator() 메서드는 iterator를 반환해야 합니다.
      return {
        // next() 메서드는 iteration result 객체를 반환해야 합니다.
        next() {
          // iteration result 객체
          curVal++;
          
          return {
            value: curVal,
            done: curVal === to
          };
        }
      };
    }
  };
}

for (const value of range(1, 5)) {
  console.log(value); // 1 2 3 4
}
```

이때, 어떤 객체가 `iterable` 이면서 `iterator` 이도록 구현할 수 있는데, 이렇게 하면 좀 더 간단하게 `iterable`을 만들 수 있습니다:

```js
function range(from, to) {
  let curVal = from - 1;

  return {
    [Symbol.iterator]() { return this; },
    next() {
      curVal++;

      return {
        value: curVal,
        done: curVal === to
      };
    }
  };
}

for (const value of range(1, 5)) {
  console.log(value); // 1 2 3 4
}
```

## 비동기 iteration

비동기 `iterable`과 `iterator`는 앞서 살펴본 동기식 `iterable`, `iterator`와 거의 흡사합니다. 다만 차이점이라면,

1. 비동기 `iterable`에는 `Symbol.iterator()` 대신 `Symbol.asyncIterator()`가 구현되어 있습니다.
2. 비동기 `iterator`의 `next()` 메서드는 `iteration result` 객체를 반환하는 *프로미스*를 반환합니다. 즉, 비동기 `iterator`의 `next()` 메서드를 호출하면 즉시 `iteration result`가 반환되는 것이 아니라 `iteration result`로 resolve되는 프로미스가 반환됩니다 (물론 언제 `iteration result` 객체로 resolve될 지는 알 수 없습니다. 그것이 비동기니까요!). 또한, `iteration result` 객체로 resolve되는 프로미스가 반환됨으로 인한 또 다른 차이점은, `done` 값이 비동기로 반환되다 보니 언제 순회가 종료되는지도 비동기적으로 결정된다는 점입니다.

비동기 iteration에 대한 인터페이스를 나타내면 다음과 같습니다:

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

이러한 비동기 iteration 프로토콜을 사용하는 경우, `for await...of` 문을 사용할 수 있습니다:

```js
function waitFor(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function asyncRange(from, to) {
  let curVal = from - 1;

  return {
    [Symbol.asyncIterator]() { return this; },
    async next() {
      curVal++;
      await waitFor(1000);

      return {
        value: curVal,
        done: curVal === to
      };
    }
  };
}

for await (const value of asyncRange(1, 5)) {
  console.log(value); // 1 2 3 4
}
```

## 레퍼런스

[Iteration protocols - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)

[JavaScript for impatient programmers (ES2021 edition)](https://exploringjs.com/impatient-js/)

[JavaScript: The Definitive Guide, 7th Edition](https://www.oreilly.com/library/view/javascript-the-definitive/9781491952016/)
