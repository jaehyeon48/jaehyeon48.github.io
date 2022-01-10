---
title: '자바스크립트 제너레이터'
date: 2022-01-10
category: 'JavaScript'
draft: false
---

[Iteration 프로토콜](https://jaehyeon48.github.io/javascript/iteration-protocol/)을 모르신다면 이것부터 살펴보시는 것을 추천합니다!

## 제너레이터(Generator)란?

자바스크립트에서 제너레이터란 **제너레이터 함수(generator function)**을 통해 생성한 객체로, `iterable` 이자 `iterator`인 객체입니다. Iteration 작업을 할 때 `iterable`, `iterator` 객체들을 직접 다루기 까다로울 수 있기 때문에, 제너레이터를 이용하여 좀 더 쉽게 `iterator`를 구현할 수 있습니다.

제너레이터 함수는 `function*`과 같이 `function` 키워드 뒤에 `*`를 붙여 정의할 수도 있고, 메서드로 사용되는 경우 메서드 이름 앞에 `*`를 붙여 정의할 수 있습니다:

```js
// 제너레이터 함수 선언식
function* genFunc1() { /* ... */}

// 제너레이터 함수 표현식
const genFunc2 = function*() { /* ... */}

// 객체 리터널 내의 제너레이터 메서드
const obj = {
  *genMethod() { /* ... */}
};

// 클래스 내의 제너레이터 메서드
class SomeClass {
  *genMethod() { /* ... */}
}
```

(참고로, 화살표 함수로는 제너레이터 함수를 정의할 수 없습니다.)

이렇게 리턴된 제너레이터 객체의 `next()` 메서드를 호출하면, 해당 제너레이터 객체를 리턴한 제너레이터 함수 내에서의 "현재 위치"로 부터 `yield` 문이 나올 때까지 제너레이터 함수를 실행합니다. 그러다 `yield` 문을 만나면 해당 `yield` 값을 반환하고 제너레이터 함수 실행을 "일시정지" 합니다. 이때 `yield`가 반환하는 값이 제너레이터 객체의 `next()` 메서드가 반환하는 값이 됩니다:

```js
function* genFunc() {
  yield 'a';
  yield 'b';
}

const iterable = genFunc();
console.log([...iterable]) // ['a', 'b']

// 혹은 다음과 같이 for...of 문을 사용할 수도 있습니다.
for (const val of iterable) {
  console.log(val);
} // 'a', 'b'
```

위 코드에서 볼 수 있듯이, 제너레이터 함수를 호출하면 `iterable` 이자 `iterator` 객체인 제너레이터 객체를 반환합니다. 그리고 나서 반환된 제너레이터 객체에 대해 iteration을 수행하면 제너레이터 객체의 `next()` 메서드를 호출하는데, 이렇게 할 때마다 제너레이터 함수의 이전 위치에서 실행을 재개하여 다음 `yield` 문 까지 실행한 후 그 값을 반환하고 다시 제너레이터 함수 실행을 일시 정지 합니다.

(당연하게도?) 제너레이터 함수 내의 모든 `yield`가 실행되면 해당 제너레이터는 종료됩니다:

```js
function* genFunc() {
  yield 1;
  yield 2;
  yield 3;
}

const iterable = genFunc();
console.log(iterable.next()); // { value: 1, done: false }
console.log(iterable.next()); // { value: 2, done: false }
console.log(iterable.next()); // { value: 3, done: false }
console.log(iterable.next()); // { value: undefined, done: true }
console.log(iterable.next()); // { value: undefined, done: true }
```

혹은 `return` 문이 존재하는 경우 뒤에 `yield`가 남아있더라도 즉시 종료됩니다:

```js
function* genFunc() {
  yield 1;
  yield 2;
  return 100;
  yield 3;
}

const iterable = genFunc();
console.log(iterable.next()); // { value: 1, done: false }
console.log(iterable.next()); // { value: 2, done: false }
console.log(iterable.next()); // { value: 100, done: true }
console.log(iterable.next()); // { value: undefined, done: true }
```

제너레이터 함수 내부에서 예외가 발생한 경우에도 즉시 종료됩니다:

```js
function* genFunc() {
  yield 1;
  yield 2;
  throw new Error('hi, this is an error');
  yield 3;
}

const iterable = genFunc();
console.log(iterable.next()); // { value: 1, done: false }
console.log(iterable.next()); // { value: 2, done: false }
console.log(iterable.next()); // Error: hi, this is an error
console.log(iterable.next()); // { value: undefined, done: true }
```

하지만 제너레이터 내부에서 예외를 캐치한 경우 계속해서 함수를 실행할 수 있습니다:

```js
function* genFunc() {
  try {
    yield 1;
    throw Error('hi, this is an error');
    yield 2;
  } catch (error) {
    yield 100;
    yield 101;
  } finally {
    yield 1000;
  }
}

const iterable = genFunc();
console.log(iterable.next()); // { value: 1, done: false }
console.log(iterable.next()); // { value: 100, done: false }
console.log(iterable.next()); // { value: 101, done: false }
console.log(iterable.next()); // { value: 1000, done: false }
console.log(iterable.next()); // { value: undefined, done: true }
```
