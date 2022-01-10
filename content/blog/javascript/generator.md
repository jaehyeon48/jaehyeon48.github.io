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

<hr />

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

여기서 눈여겨 보셔야 할 부분이, `return` 문에서 리턴한 값이 iteration result 객체의 `value` 값으로 들어갔다는 점입니다 (`{ value: 100, done: true }`). 사실 앞서 살펴본 모든 제너레이터 함수에도 암묵적으로 `return undefined;` 문장이 존재하기 때문에 (`{ value: undefined, done: true }`)와 같은 결과가 나타나는 것입니다.

하지만 `for...of`와 같이 iterable 프로토콜을 활용하는 대부분의 기능들은 `done` 값이 `true`일 때의 `value` 값은 무시합니다. 바로 위 예제를 살펴보자면:

```js
for (const val of iterable) {
  console.log(val);
} // 1, 2

console.log([...iterable]); // [1, 2]
```

<hr />

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

## 제너레이터 함수에서 제너레이터 함수 호출하기

여태껏 저희가 살펴본 `yield` 는 오직 제너레이터 함수 바로 안에(directly) 존재하는 경우에만 정상적으로 동작합니다. 예를 들어, `foo()` 제너레이터 함수에서 `bar()` 제너레이터 함수를 호출하여 `foo()`에서 `bar()`가 yield하는 두 값을 yield 하고자 한다고 해봅시다:

```js
function* foo() {
  bar();
}

function* bar() {
  yield 1;
  yield 2;
}

const iter = foo();
console.log(iter.next()); // { value: undefined, done: true }
```

위 코드를 실행하면 우리가 원하는 결과를 얻지 못함을 알 수 있습니다. 왜그럴까요?

그 이유는 `foo()` 에서 `bar()`를 호출하면 `bar()`는 `iterable`을 리턴하는데, `foo()`에서 이를 *무시*하기 때문입니다.

앞서 우리가 원하는 것은 `bar()`가 yield하는 모든 값을 `foo()`에서 yield 하고자 하는 것이었죠. 이렇게 하려면 `yield*`를 사용해야 합니다:

```js
function* foo() {
  yield* bar();

  // 위 코드는 아래의 코드와 흡사합니다:
  // for (const val of bar()) {
  //   yield val;
  // }
}

function* bar() {
  yield 1;
  yield 2;
}

const iter = foo();
console.log(iter.next()); // { value: 1, done: false }
console.log(iter.next()); // { value: 2, done: false }
console.log(iter.next()); // { value: undefined, done: true }
```

즉, yield를 다른 함수로 위임(delegate)하기 위해선 `yield`가 아니라 `yield*`를 사용해야 합니다.

## 옵저버로서의 제너레이터

데이터 소비자(consumer)로서 동작하는 제너레이터 객체는 다음의 `Observer`라는 인터페이스를 준수합니다:

```ts
interface Observer {
  next(value?: any): void;
  return(value?: any): void;
  throw(error): void;
}
```

옵저버로서 동작하는 제너레이터는 입력을 받을 때까지 일시 정지 상태가 됩니다. 제너레이터 객체에 전달되는 입력에는 세 가지 종류가 있습니다:

- **next()**: 일반적인 입력.
- **return()**: 제너레이터 종료.
- **throw()**: 에러발생을 알림.

### next()로 값 전달하기

제너레이터를 옵저버로서 사용하는 경우 `next(value)`를 통해 값을 전달하고 `yield`를 통해 값을 전달받을 수 있습니다:

```js
function* dataConsumer() {
  console.log('시작');
  console.log(`1. ${yield}`); // A
  console.log(`2. ${yield}`); // B
  return 'result';
}
```

이제 이를 사용하는 법을 살펴봅시다:

```js
const gen = dataConsumer();

console.log(gen.next());
// 시작
// { value: undefined, done: false }
```

위와 같이 제너레이터 객체 `gen`의 `next()`를 호출하면 "시작"을 출력하고, A에 있는 첫 번째 `yield`의 값을 반환합니다. 이 때 `yield`가 아무것도 명시적으로 반환하고 있지 않으므로 `undefined`가 반환됩니다.

이제 A의 `yield`와 B의 `yield`에 값을 전달해봅시다:

```js
console.log(gen.next('a'));
// 1. a
// { value: undefined, done: false }

console.log(gen.next('b'));
// 2. b
// { value: result, done: true }
```

여기서 볼 수 있듯이, `next()`는 *비대칭적*으로 동작합니다. 즉, 이전에 실행된 `yield`에 값을 전달하지만, 그 다음에 나오는 `yield`의 값을 반환하게 됩니다. 하지만 이는 어쩔 수 없는 제너레이터의 특성입니다

### return()과 throw()로 값 전달하기

`return(value)`와 `throw(value)` 또한 `next(value)`와 유사하게 동작합니다:

- **return(value)**: 적절한 `yield` 위치에서 `return value;`를 수행.
- **throw(value)**: 적절한 `yield` 위치에서 `throw value;`를 수행.

```js
/* return(value)를 수행하는 경우 */

function* genFunc() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
}

const gen = genFunc();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.return(100)); // { value: 100, done: true }
console.log(gen.next()); // { value: undefined, done: true }
```

```js
/* throw(value)를 수행하는 경우 */

function* genFunc() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } catch (error) {
    yield error;
  }
}

const gen = genFunc();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.return('I am an error')); // { value: 'I am an error', done: false }
console.log(gen.next()); // { value: undefined, done: true }
```

## References

[Exploring ES6](https://exploringjs.com/es6/ch_generators.html)

[JavaScript for impatient programmers (ES2021 edition)](https://exploringjs.com/impatient-js/)

[JavaScript: The Definitive Guide, 7th Edition](https://www.oreilly.com/library/view/javascript-the-definitive/9781491952016/)
