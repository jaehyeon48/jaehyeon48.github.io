---
title: '자바스크립트 호이스팅'
date: 2020-08-19 16:21:13
category: 'javascript'
draft: false
---

이 글은 아래의 원문을 번역/요약한 글입니다.

[You Don't Know JS Yet/Chapter 5: The (Not So) Secret Lifecycle of Variables](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch5.md)

<hr class="custom-hr">

## 언제 변수를 사용할 수 있을까?

스코프 내에 있는 변수는 어느순간 부터 사용 가능한 걸까? 변수가 선언(생성)된 시점부터 사용할 수 있지 않을까?? 꼭 그렇지만은 않다. 다음 코드를 생각해보자:

```js
greeting(); // Hello!

function greeting() {
  console.log('Hello!');
}
```

아마 이런식의 코드를 작성해본 경험이 있을 것이다. 이 코드는 아주 잘 작동한다 하지만 이런방식의 코드가 어떻게, 혹은 왜 동작하는지 생각해본적이 있는가? 위 코드에서, 함수 `greeting()` 은 분명 3번째 줄에 선언되었는데 어째서 1번째 줄에서 해당 함수를 호출할 수 있는걸까?

자바스크립트 코드가 컴파일되는 과정에서 모든 identifier들은 각자가 속한 스코프에 "등록"된다 (사실 자바스크립트는 인터프리터 언어라기 보다 컴파일 언어에 더 가깝다!). 특히, 어떤 스코프에 진입(enter)했을 때 해당 스코프의 모든 identifier들이 스코프의 시작 부분에 "생성"된다. 

이렇게 변수들이 스코프 (한참) 아래에 선언되어 있음에도 불구하고 해당 스코프에 진입하자 마자 스코프의 모든 변수들에 접근할 수 있게 되는 현상을 **호이스팅(hoisting)** 이라고 한다.

<br/>

하지만 호이스팅만으로는 위 질문에 대한 답을 할 수 없다. 스코프 시작 부분에서 `greeting` 이라는 identifier를 "볼 수 있지만", 어떻게 함수를 "호출"까지 할 수 있게 되는걸까? 다시말해, 어떻게 스코프가 시작할 때 `greeting` 이라는 identifier가 값(여기서는 함수 레퍼런스)을 가질 수 있게 되는 것일까?

이 질문에 대답은 **함수 호이스팅(function hoisting)**으로 설명할 수 있다. 즉, `function` 키워드로 선언된 ("함수를 formal하게 선언한다" 라고함) 함수의 identifier가 자동적으로 스코프의 상단에 등록될 때, 이 identifier는 자동적으로 자신의 함수 레퍼런스로 초기화된다. 이렇게 자동적으로 자신의 함수 레퍼런스로 초기화 됨으로 인해 (`function` 키워드로 선언된) 함수를 스코프 내의 어디에서나 호출할 수 있는 것이다.

참고로, 함수 호이스팅과 `var` 변수의 호이스팅은 함수 스코프 단위로 일어나고, `let` 과 `const` 변수의 호이스팅은 블록 스코프 단위로 일어난다.

## 함수 호이스팅: 함수 선언문 vs. 함수 표현식

위에서 살펴봤듯이, 함수 호이스팅은 오직 "함수 선언"(`function` 키워드를 이용한 함수 선언)에만 적용된다. 함수 표현식(function expression)에는 적용되지 않는다. 다음 코드를 보자:

```js
greeting(); // TypeError: greeting is not a function

var greeting = function () {
    console.log('hi');
}
```

여기서 `TypeError` 가 발생했다는 점에 주목해보자. `TypeError` 는 어떤 값에 대해 허용되지 않는 동작을 수행했다는 의미이다. 자바스크립트 실행 환경에 따라 `'undefined' is not a function` 과 같은 메시지가 나올 수도 있다.

중요한 것은 에러의 종류가 `ReferenceError` 가 아니라 `TypeError` 라는 점이다. 즉, 스코프 내에서 `greeting` 이라는 identifier를 못찾았다는 것이 아니라, `greeting` 이라는 identifier는 찾았지만 해당 순간에 함수를 가리키고(reference) 있지 않았다는 뜻이다. 함수가 아닌 것에다 함수 호출을 했으니 `TypeError` 가 발생한 것이다.

그렇다면 그 순간에 `greeting` 은 어떤 값을 저장하고 있었을까? `var` 변수의 경우, 호이스팅 될 때 자동적으로 `undefined` 로 초기화된다. 그러다 자신이 원래 선언된 위치로 오게 되면 비로소 원래의 값으로 할당되는 것이다. 위 코드의 경우, 3번째 줄이 되어서야 `greeting` 변수가 함수를 가리키게 된다.

<br>

종합해보면 이렇다. 함수 선언(function declaration)은 스코프 맨 위로 hoist 될 때 자동적으로 원래 가리키고 있던 함수로 초기화된다. `var` 변수는 hosit될 때 자동적으로 `undefined` 로 초기화 된다. 함수 표현(function expression)의 경우, 프로그램 실행 때 원래 선언된 위치에서 변수가 함수 표현을 reference 하게 된다.

## 변수 호이스팅

이번에는 변수 호이스팅에 대해 좀 더 알아보자.

```js
greeting = 'Hello';
console.log(greeting); // Hello

var greeting = 'Howdy!';
```

`greeting` 변수가 4번째 줄에 선언되었음에도 불구하고 1번째 줄에서 정상적으로 값을 할당하고 있는데, 그 이유는
- `greeting` 이라는 identifier가 hoist 되었기 때문이고,
- 해당 스코프의 최상단에서 자동적으로 `undefined` 로 할당되었기 때문이다.

### 비유

호이스팅을 설명하는 글에서 주로 사용하는 비유는 "들어올린다"(lift)는 것이다. 즉, 무거운 물건을 들어올리듯이 identifier들을 스코프의 최상단으로 들어올린다는 것이다. 어떤 경우, 자바스크립트 엔진이 다음 코드와 같이 실제로 소스 코드를 변경하여 identifier를 재배치 한다고 하는 글도 있다.

```js
var greeting;
greeting = 'Hello';
console.log(greeting) // Hello
greeting = 'Howdy';
```

또한, 함수 호이스팅의 경우 프로그램 실행 전에 엔진이 함수 선언부 전체를 hoist 한다고 주장하는 경우도 있다. 거기다 함수 선언문이 먼저 호이스팅 되고 그 다음에 변수가 호이스팅 된다고 주장한다:

```js
// 호이스팅 전
studentName = 'Suzy';
greeting() // Hi, Suzy!

function greeting() {
	console.log(`Hi, ${studentName}!`);
}
var studentName;

// 호이스팅 후
function greeting() {
    console.log(`Hi, ${studentName}!`);
}
var studentName;

studentName = 'Suzy';
greeting() // Hi, Suzy!
```

이러한 비유는 호이스팅을 비교적 쉽게 설명할 수 있다는 장점이 있지만, 사실 이는 정확한 표현이 아니다. **자바스크립트는 코드를 재배열하지 않는다!** 단지 코드를 실행하기 전에 코드를 분석(parse) 해서 스코프 내의 identifier를 찾아놓을 뿐이다.

즉, 호이스팅 이라는 것은 runtime과 관련된 것이 아니라 compile-time과 관련된 작업이다. 프로그램 실행(runtime)때 엔진이 코드를 바꿔서 실행하는 것이 아니라, 컴파일(compile-time)때 코드를 분석하여 스코프 내에 있는 identifier들을 찾아 정리해놓는 것이다.

## 재할당?

만약 다음과 같이 어떤 스코프 내에서 동일한 변수가 두 번 이상 선언되면 어떻게 될까?

```js
var studentName = 'Frank';
console.log(studentName); // Frank

var studentName;
console.log(studentName); // ?
```

두 번째 `var studentName` 이 해당 변수를 "재선언(re-declared)" 했으므로 `undefined` 를 출력하는 것이 맞을까? 아니다. 사실 "재선언" 이라는 것은 존재하지 않는다. 앞서 살펴본 호이스팅에 빗대어 살펴보자면 위 코드는 다음과 같다고 할 수 있다:

```js
var studentName;
var studentName; // no-op
studentName = 'Frank'
console.log(studentName); // Frank
console.log(studentName); // Frank
```

호이스팅 이라는 것이 실제로는 스코프의 시작 부분에 변수들을 등록하는 것이므로, 위와 같이 두 번째 선언문은 사실상 의미없는 no-op(no-operation) 문장이다.

또한 한 가지 알아둬야할 것이,  `var studentName;` 문장은 `var studentName = undefined;` 와 동일한 문장이 아니다! 다음 코드를 통해 이와 같은 사실을 알 수 있다:

```js
var studentName = 'Frank';
console.log(studentName); // Frank

var studentName;
console.log(studentName); // 여전히 Frank

var studentName = undefined; // 명시적으로 undefined로 초기화
console.log(studentName); // undefined
```

`let` 혹은 `const` 의 경우는 어떨까?

```js
let studentName = 'Frank';
console.log(studentName);
let studentName = 'Frank';
```

위 코드를 실행하면 즉시 `SyntaxError` 가 발생하는 것을 볼 수 있다. 그 이유는 `let` (그리고 `const`) 의 경우 재선언이 불가능하기 때문이다.

물론, 다음과 같은 경우도 불가능하다.

```js
var studentName = 'Frank';
let studentName = 'Suzy';

// OR
let studentName = 'Frank';
var studentName = 'Suzy';
```

`const` 의 경우 규칙이 더 엄격하다. `let` 과 같이 재선언이 불가능함은 물론, `const` 변수는 선언할 때 **무조건** 초기화 해야한다. 그리고 초기화한 후 값을 재할당 하는 것이 불가능하다.

즉, 다음과 같은 코드는 불가능하다.

```js
const myVariable; // SyntaxError -> 무조건 선언과 동시에 초기화 해야함
```

```js
const studentName = 'Frank';
console.log(studentName); // Frank
studentName = 'Suzy' // TypeError -> 재할당 불가
```

`const` 변수에 재할당을 할 때 발생한 에러가 `SyntexError` 가 아니라 `TypeError` 라는 점에 주목해보자. 이 두 개의 에러간에는 미묘한 차이가 있는데, `SyntaxError` 는 프로그램을 미처 실행하기도 전에 발생한 에러이고, `TypeError` 는 프로그램 실행 도중에 발생한 에러이다. 위 코드에서 보면 재할당 하기전의 `console.log(studentName);` 문장에서 정상적으로 `Frank` 가 출력됨을 알 수 있다. 만약 `SyntaxError` 였다면 프로그램이 실행조차 되지 않아 `Frank` 가 출력되지 못했을 것이다.

## 루프문

이제까지 살펴본 바로는, 변수를 "재선언" 하는 것은 바람직하지 않은 것 같다. 그렇다면 루프문에선 어떨까? 다음 코드를 살펴보자:

```js
let keepGoing = true;
while (keepGoing) {
    let value = Math.random();
    if (value > 0.5) keepGoing = false;
}
```

여기서 while문 안에 있는 `value` 변수는 계속해서 "재선언" 되는 것일까? 그렇다면 에러가 발생하는 걸까?

정답은 "재선언 되지 않는다" 이다. 스코프에 관련된 규칙들은 **스코프 인스턴스에 개별적**으로 적용된다. 다시말해, 실행중에 매 순간 스코프에 진입(enter)할 때마다 모든것이 리셋된다.

루프문의 경우, **각 iteration은 각자의 스코프 인스턴스를 갖는다**. 위 코드의 경우, while문 각각의 iteration은 서로 별개의 "스코프 인스턴스"이고, 각 스코프 인스턴스에서 `value` 변수는 오직 한 번만 선언된다. 따라서 각 스코프 인스턴스 별로 한 번만 선언되므로 재선언이 발생하지 않는 것이고, 그에 따라 어떠한 에러도 발생하지 않는 것이다.

<br/>

그렇다면 `var` 의 경우는 어떨까? 위 코드에서 다음과 같이 `value` 가 `var` 로 선언되면 어떤 일이 발생하는 걸까?

```js
let keepGoing = true;
while (keepGoing) {
    var value = Math.random();
    if (value > 0.5) keepGoing = false;
}
```

`var` 변수는 재선언을 허용하므로 여기서는 `value` 변수가 계속해서 재선언 되는 것일까?

아니다.  `var` 변수는 "함수 스코프"로 취급되므로 위 코드에서 변수 `value` 는 글로벌 스코프에 오직 한 번만 선언되고, 값만 계속해서 재할당 되는 것이다. 위 코드에서 while문 바로 아래에 `console.log()` 를 이용하여 `value` 가 글로벌 스코프로 선언되었음을 확인할 수 있다:

```js
while (keepGoing) {
	// ...
}
console.log(value); // 0.5보다 큰값
```

만약 여기서 `value` 가 `let` 으로 선언되었다면 `ReferenceError` 가 발생할 것이다.

<br/>

그렇다면 `for` 루프에서는 어떨까?

```js
for (let i = 0; i < 3; i++) {
	let value = i * 10;
	console.log(`${i}: ${value}`);
}
// 0: 0
// 1: 10
// 2: 20
```

여기서도 마찬가지로, `for` 루프의 각 iteration 마다 별개의 스코프 인스턴스가 존재하고, `value` 변수는 각 스코프 인스턴스 내에서 오직 한 번만 선언된다.

그렇다면 `i` 는 어떤가? (`i` 도 변수이다!) `i` 는 "재선언" 되는 것일까? 이 물음에 대한 해답을 찾기 위해 우선 `i` 가 어떤 스코프에 속해있는지를 살펴보자. 언뜻 보기엔 `for` 루프의 바깥 스코프(위 코드의 경우, 글로벌 스코프)에 속해있는것 같지만 아니다. `i` 는 `value` 와 같이 `for` 루프의 스코프에 속해있다.

좀 더 쉽게 이해하기 위해, 위 코드가 내부적으로 다음과 같이 변환된다고 생각할 수 있다:

```js
// 물론 실제로 이렇게 변환되는 것은 아니다.
let $$i = 0;

for (; $$i < 3; $$i++) {
    let i = $$i;

    let value = i * 10;
    console.log(`${i}: ${value}`);
}
```

이 코드를 보면 `i` 가 어느 스코프에 속하는지 좀 더 명확해보인다. 즉, `i` 도 `value` 와 마찬가지로 각 iteration의 스코프 인스턴스에 속하여 오직 한 번만 선언된다.

다음과 같은 `for` 루프의 형태도 논리는 동일하다:

```js
for (let key in someObj) { /* ... */ }

for (let student of students) { /* ... */ }
```

여기서도 변수(`key` , `student`) 는 `for` 루프의 각 iteration 스코프 인스턴스에 속한다. 따라서 이 경우에도 재선언은 일어나지 않는다.

<br/>

그럼 이제 `const` 의 경우도 한번 살펴보자. 사실 `const` 도 앞서 살펴본 경우와 동일하게 동작한다:

```js
let keepGoing = true;
while (keepGoing) {
    const value = Math.random();
    if (value > 0.5) keepGoing = false;
}
```

`for` 루프의 경우도 마찬가지다:
```js
for (const key in someObj) {}
for (const student of students) {}
```

하지만 문제가 하나 있다. 다음을 살펴보자:

```js
for (const i = 0; i < 3; i++) {
  // 첫 번째 iteration 이후 에러 발생!!
	// TypeError: Assignment to constant variable.
}
```

왜 에러가 발생하는 것일까? 앞에서 `let` 을 통해 살펴보았을 때는 `i` 가 각 iteration 스코프마다 선언되므로 전혀 문제가 없었다!

하지만 위 코드를 다음과 같이 확장해보면 문제를 금방 파악할 수 있다:

```js
const $$i = 0;

for (; $$i < 3; $$i++) {
    const i = $$i;

    let value = i * 10;
    console.log(`${i}: ${value}`);
}
```

위 코드를 보면 알 수 있겠지만, 여기서도 `i` 가 각 iteration 스코프 마다 선언되는 것은 맞다. 이는 재선언이 아니므로 전혀 문제되지 않는다.

진짜 문제는, 가상의 `$$i` 의 값이 변한다는 점이다. 즉, `$$i++` 표현식에서 `const` 타입의 `$$i` 값을 바꾸고 있기 때문에 에러가 발생하는 것이다.

물론 위 코드는 어디까지나 이해를 돕기 위해 만들어낸 **가상의** 코드이다. 실제로 자바스크립트 엔진이 `$$i` 를 `let` 변수로 선언할 수도 있다. 하지만 이렇게 하면 `const` 를 `for` 루프에서 사용할 때 예외적인 상황이 발생하는 것이므로 그리 바람직할 것 같지는 않다.

## TDZ, Temporal Dead Zone

앞서 우리는 `var` 변수가 스코프의 최상단 부분으로 호이스팅 될 때 자동적으로 `undefined` 로 초기화 된다는 사실을 살펴보았다.

하지만 `let` 과 `const` 의 경우는 조금 다르다. 다음을 살펴보자:

```js
console.log(studentName);

let studentName = 'Suzy';
```

위 코드를 실행하면 `ReferenceError: Cannot access 'studentName' before initialization` 와 같은 에러가 발생한다. 에러 메시지를 살펴보면, `studentName` 이라는 변수가 (첫째 줄에) 존재하기는 하나, 아직 초기화 되지 않아 사용할 수 없다는 의미이다.

그럼 다음과 같이 초기화 해주면 될까?

```js
studentName = 'Suzy'; // ReferenceError
console.log(studentName);

let studentName;
```

여전히 동일한 에러가 발생한다. 뭐가 문제일까? 초기화 되지 않은(uninitialized) 변수를 어떻게 초기화(initialize)할 수 있을까?

`let` 과 `const` 의 경우, 해당 변수를 "초기화"하는 **유일한 방법**은 **변수를 선언할 때 초기화** 하는 방법밖에 없다. 즉,

```js
let studentName = 'Suzy';
console.log(studentName); // Suzy

// 혹은
let studentName;
studentName = 'Suzy';
console.log(studentName); // Suzy
```

스코프에 진입하여 변수가 자동적으로 초기화 될 때까지 해당 변수를 사용할 수 없는 **기간**을 TDZ라고 한다. 즉, TDZ란 변수가 존재는 하지만 아직 초기화 되지 않아서 사용할 수 없는 구간이라 할 수 있다. 변수가 원래 선언된 위치에 도달해서야 비로소 해당 변수를 사용할 수 있게 되는 것이다. 다음 코드에 대해 TDZ를 그림으로 나타내면 아래와 같다:

```js
console.log(pi);
const pi = 3.14;
console.log(pi);
```

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/hoisting/tdz.png" alt="TDZ example"/>
    <figcaption>TDZ 예시</figcaption>
</figure>

사실 `var` 도 TDZ가 존재하지만, TDZ의 크기가 0이라서 눈에 보이지는 않는다.

<br/>

한편, TDZ는 "위치"가 아니라 "시간"과 관련된 개념이다. 다음 코드를 보자:

```js
askQuestion(); // ReferenceError

let studentName = 'Suzy';

function askQuestion() {
	console.log(`${studentName}, do you know?`);
}
```

위치적으로 `studentName` 을 참조하는 `console.log` 가 `let studentName = 'Suzy';` 선언문보다 뒤에 존재하지만, 시간적으로 봤을 때 `askQuestion()` 함수 호출이 `studentName` 의 초기화 보다 먼저 일어나기 때문에 TDZ 에러가 발생한 것이다.

혹자는 다음과 같이 호이스팅이 일어나기 때문에 에러가 발생하지 않는 것 아니냐고 물을 수도 있다:

```js
function askQuestion() {
    console.log(`${studentName}, do you know?`);
}
let studentName;
askQuestion(); // undefined, do you know?

studentName = 'Suzy';
```

앞서도 언급했지만 "호이스팅" 이라는 것은 개념적인 것이다. 즉, **실제로는 자바스크립트를 컴파일 하는 과정에서 identifier들을 스코프의 맨 윗부분에 등록하는 과정을 호이스팅** 이라고 부르는 것이다. 실제로 위 코드와 같은 일이 일어나는 것이 아니다.

그럼 어떻게 TDZ 에러를 피할 수 있을 까? 한 가지 방법은, 항상 `let` 과 `const` 변수 선언문을 스코프 맨 윗부분에 작성하는 것이다. 이렇게 하면 TDZ의 크기(length)를 0으로 만들어 TDZ 에러를 예방할 수 있다.

## TDZ 좀 더 살펴보기

[원문](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/apA.md#whats-the-deal-with-tdz)

우선 TDZ가 생겨난 배경부터 살펴보자. 사실 TDZ는 `const`로 인해 생겨난 개념이다.

초기에 ES6를 개발할 때, TC39 멤버들은 `const`(와 `let`)가 블록의 최상단으로 호이스팅 되어야 하는지 결정했어야 했고, 결국 `var`와 같이 호이스팅 되도록 설계했다. 

근데 왜 `let`과 `const`는 `var`와는 달리 자동적으로 (`undefined`로) 초기화되지 않는걸까? 다음 코드를 통해 그 이유를 알 수 있다:

```js
{
    // 어떤 값이 출력될까?
    console.log(studentName);

    // ...

    const studentName = 'Frank';

    // ...
}
```

만약 위 코드에서 `studentName` 변수가 블록 최상단으로 호이스팅될 뿐만 아니라, 자동적으로 `undefined`로 초기화된다고 가정해보자. 그렇게 되면 `const studentName = 'Frank';`문장을 기준으로, `studentName`이 윗 부분에선 `undefined`의 값을 가질 것이고, 변수 선언문 부터는 `'Frank'`라는 값을 가질 것이다.

하지만 생각해보면 이상하지 않은가? **상수(constant)**가 서로 다른 두 개의 값을 가지는 것은 말이 안되는 것 같다! 바로 여기서 문제가 발생한 것이다. 즉, `const` 변수는 오직 최초에 초기화된 값 하나만 가질 수 있으므로 호이스팅 되면서 자동적으로 `undefined`로 초기화 되는것은 말이 안된다. 하지만 호이스팅은 일어나므로 `const` 선언문이 어디에 있건 관계없이 변수 전역에서 해당 `const` 변수를 "볼 수 있어야 한다(visible)". 그럼 해당 변수가 존재하기 시작하는 시점인 스코프의 최상단으로부터 변수가 초기화되는 시점(변수의 선언문이 존재하는 위치) 까지의 "기간(period of time)"은 어떻게 처리해야할까?

우리는 이러한 "기간"을 "**dead zone**"이라고 부르기로 했다. 따라서 호이스팅은 일어나지만 값이 자동적으로 초기화 되지 않음으로 인해 발생하는 혼란일 방지하고자 TDZ에 있는 변수를 참조하게 되면 TDZ에러를 발생시킨다.

### 그렇다면 let은?

TDZ가 `const`때문에 생겨난 것은 알겠다. 그럼 `let`은 왜 `const`와 같이 동작하는 걸까? `let`은 여러 값을 가져도 괜찮잖아?

그러게 말이다. 하지만 TC39에서 "일관성"을 위해 `let`도 `const`와 동일하게 TDZ를 적용시켰다. 하지만 내 생각(원문 저자)엔 "일관성"을 유지하고자 그러한 결정을 내린것이라면 차라리 `let`으로 하여금 `var`와 같이 동작하도록 했으면 어땠을까 싶다. 분명 `let`은 `const`보다는 `var`에 더 가까운 편이니까.

TDZ에 관한 추가적인 학습은 다음 링크를 참고하길 바란다:

[Don't Use JavaScript Variables Without Knowing Temporal Dead Zone](https://dmitripavlutin.com/javascript-variables-and-temporal-dead-zone/)