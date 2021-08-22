---
title: '자바스크립트 클로저 Part1'
date: 2020-08-21
category: 'javascript'
draft: false
---

이 글은 아래의 원문을 번역/요약한 글입니다.

[You Don't Know JS Yet/Chapter 7: Using Closures](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch7.md)

[2편 보러가기](../closure_2)
[3편 보러가기](../closure_3)

<br/>

[이 글](../limiting_scope_exposure_1)에서 살펴본 POLE 원칙에 의하면, identifier의 불필요한 노출을 최소화 하기 위해 함수/블록 스코프를 적절히 활용하는 것이 좋다. 이렇게 하면 코드의 가독성이 더 좋아지고 유지보수 또한 더 쉬워질뿐만 아니라 이름 충돌과 같은 여러 문제들도 피할 수 있게 된다.

**클로저**는 이와 같은 방식에 기반을 두고 있다. 즉, 계속해서 사용할 변수들을 바깥의 더 큰 스코프에 놔두기 보다는 더 작은 내부 스코프에 "캡슐화(encapsulate)" 하여 해당 변수를 숨김과 동시에, 내부 함수에서는 계속해서 해당 변수들에 참조할 수 있게 하는 것이다. **함수들은 클로저를 통해 참조하고 있는 바깥 변수들을 "기억"한다.**

위 링크에 있는 글에서도 이미 클로저를 사용한 적이 있다:

```js
function hideTheCache() {
    let cache = {};
    return factorial;

    // ****************

    function factorial(x) {
        if (x < 2) return 1;
        // 외부 스코프에 존재하는 "cache"를 참조하고 있음 -> 클로저!!
        if (!(x in cache)) cache[x] = x * factorial(x - 1);
        return cache[x];
    }
}
```

아마 여태껏 자바스크립트를 사용해오면서 위와 같은 코드를 본 적이 있거나, 혹은 작성해본 경험이 있을 것이다. 혹시 비동기를 사용하면서 콜백을 사용할 때 콜백 함수에서 외부 스코프에 있는 변수를 참조한 적이 있는가? 그게 바로 클로저이다!

클로저는 여태껏 프로그래밍 세계에서 발명된 가장 중요한 특성 중 하나이다. 클로저는 함수형 프로그래밍, 모듈 패턴, 심지어는 객체 지향과 같은 주요 패러다임의 발판이다. 따라서 자바스크립트를 완전히 마스터하고, 주요 디자인 패턴들을 사용하기 위해선 반드시 클로저를 이해해야 한다.

다음 내용으로 넘어가기 전에 반드시 각 개념들을 충분한 시간을 들여 숙지한 다음 넘어가길 바란다.

## 클로저 살펴보기

클로저는 사실 [Lambda calculus](https://en.wikipedia.org/wiki/Lambda_calculus)에서 사용된 개념이다. 하지만 여기선 클로저를 설명하기 위해 수학적 공식이나 기호등을 사용하지는 않을 것이다. 대신 좀 더 실용적인 부분에 초점을 맞출 것이다. 우선, 만약 자바스크립트에 클로저가 없었다면 프로그램이 어떤 방식으로 동작했을지에 대해 살펴보고 추후에 다른 시각으로 클로저를 이리 저리 살펴볼 예정이다.

<br/>

클로저는 오로지 함수에 관한 것이다. 함수 이외의 것에는 클로저라는 것이 적용되지 않는다. 일반적인 객체에는 클로저가 없으며, 클래스에도 클로저가 없다 (클래스의 메소드에는 존재할 수 있다!). 다시 말하지만, **오직 함수만이 클로저를 갖는다**.

클로저를 관찰(observe)하기 위해선 함수를 반드시 원래 함수가 선언된 스코프와 다른 스코프 (a different branch of the scope chain)에서 호출되어야 한다. 함수가 선언된 스코프와 동일한 스코프 내에서 해당 함수를 호출한다면 클로저를 관찰할 수 없게 된다. 관찰적 관점/정의에 의하면 이는 클로저가 아니다.

다음 예시의 코드를 살펴보자:

```js
function lookupStudent(studentID) {

    var students = [
        { id: 14, name: 'Kyle' },
        { id: 73, name: 'Suzy' },
        { id: 112, name: 'Frank' },
        { id: 6, name: 'Sarah' }
    ];

    return function greetStudent(greeting){
        var student = students.find(student => student.id === studentID);

        return `${greeting}, ${student.name}!`;
    };
}

var chosenStudents = [
    lookupStudent(6),
    lookupStudent(112)
];

// accessing the function's name:
chosenStudents[0].name;
// greetStudent

chosenStudents[0]('Hello');
// Hello, Sarah!

chosenStudents[1]('Howdy');
// Howdy, Frank!
```

<br/>

우선 위 코드에서 주목해야할 점은, `lookupStudent()` 함수 내부에서 `greetStudent()` 함수를 선언하여 리턴하고 있다는 점이다. 그 후 `lookupStudent()` 함수는 두 번 호출되어 각각의 독립적인 `greetStudent()` 함수 인스턴스가 `chosenStudents` 배열에 저장된다. 각 `greetStudent()` 함수의 인스턴스가 배열에 저장된 것인지를 확인하기 위해 `.name` 함수 속성을 이용하여 체킹하고 있음을 알 수 있다.

이 때 얼핏 보기엔 각 `lookupStudent()` 함수 호출이 끝나면 이 함수의 모든 내부 변수들은 가비지 컬렉터에 의해 사라지고, 리턴되는 `greetStudent()` 함수만 계속해서 보존되는 것 같다. 하지만 이 부분을 유심히 살펴볼 필요가 있다.

`greetStudent()` 함수를 잘 살펴보면, 매개 변수로 `greeting` 이라는 변수를 받을 뿐만 아니라, `lookupStudent()` 함수의 스코프 내에 존재하는 `students` 배열과 `studentID` 변수를 참조하고 있음을 알 수 있다. 이처럼 내부 함수가 **자신이 선언되었을 때의 환경(정확히는 Lexical environment)인 스코프를 "기억"하여 자신이 선언된 스코프 이외의 스코프에서 호출되어도 여전히 자기가 기억하고 있는 스코프를 참조할 수 있도록 하는 것을 클로저**라고 한다.

이 때 클로저에 의해 참조되는 외부 변수를 **자유 변수(Free variable)**라고 한다. 여기서는 `students`와 `studentID`가 자유 변수이다. 또, 학술적으로 말하자면 각 `greetStudent()` 함수가 자유 변수 `students`, `studentID`를 "에워 싼다(close over)"라고 한다.

그렇다면 위 코드에서 클로저는 무슨 역할을 하고 있는 걸까?

클로저는 `greetStudent()` 함수의 외부 스코프가 종료(즉, 외부 함수인 `lookupStudent()`가 리턴되면서 종료되는 것)된 이후에도 `greetStudent()`로 하여금 계속해서 외부 변수(`students`, `studentID`)에 참조할 수 있게 해준다. `students`, `studentID`는 가비지 컬렉트 되지 않고 계속해서 메모리에 존재하며, 추후 `greetStudent()` 함수의 인스턴스가 실행될 때에도 이 두 변수들은 계속해서 값을 지닌채 남아있게 된다.

만약 자바스크립트에 클로저가 없었다면 `lookupStudent()` 함수가 종료(리턴)되자 마자 이 함수의 스코프가 사라지고 `students`와 `studentID`는 가비지 컬렉트 되어 메모리에서 사라지게 될 것이다. 이 상태에서 나중에 `greetStudent()` 함수 인스턴스 중 하나를 호출하면 어떤 일이 벌어질까?

클로저라는 것이 없다면, `greetStudent()` 함수 인스턴스에서 `lookupStudent()` 함수의 스코프 영역에 접근하려고 시도하지만 해당 스코프는 더 이상 존재하지 않으므로, 아마 `students`와 `studentID`에 접근하려고 하는 순간 `ReferenceError`가 발생할 것이다.

하지만 실제로는 어떠한 에러도 발생하지 않는다. `chosenStudents[0]("Hello");` 코드가 정상적으로 동작하여 `'Hello, Sarah!'` 라는 결과를 출력한다는 것은 `lookupStudent()` 함수가 종료된 이후에도 `greetStudent()` 함수가 정상적으로 `students`와 `studentID` 변수에 참조할 수 있다는 증거이다. 이 모든것은 결국 클로저가 있기에 가능한 일이다.

<br/>

사실, 위에서 우리가 간과한 부분이 하나 있다. 바로 화살표 `=>` 함수도 "함수"이기 때문에 자신만의 스코프를 생성한다는 것이다. 즉, 엄밀히 따지고 보면 `greetStudent()` 함수 내부에서 `students` 배열의 `.find()` 메소드의 콜백 함수로 화살표 함수를 넘기고 있고, 이 화살표 함수에서 `studentID`를 참조하므로 실은 `greetStudent()` 함수에서 `studentID`를 "에워싸는" 것이 아니라, 화살표 함수에서 `studentID`를 "에워싼다".

사실 여전히 모든 코드가 정상적으로 동작하기 때문에 이와 같은 부분이 그렇게 중요한 것은 아니다. 그래도 화살표 함수 역시 "함수"이기 때문에 클로저를 생성한다는 사실을 간과하지는 말자.

## 클로저를 이용한 덧셈

이제 가장 보편적인 클로저 예시 중 하나를 살펴보자:

```js
function adder(num1) {
    return function addTo(num2) {
        return num1 + num2;
    }
}

const add10To = adder(10);
const add42To = adder(42);

console.log(add10To(15)); // 25
console.log(add42To(9)); // 51
```

`adder()` 함수 내부에 있는 `addTo()` 함수의 각각의 인스턴스는 각자의 `num1` 변수(값은 각각 `10`과 `42`)를 "에워싸고" 있기 때문에 `adder()` 함수가 종료된다고 해서 `num1` 변수가 사라지지는 않는다.

이후에 `add10To(15);` 과 같이 `addTo()` 함수의 인스턴스를 호출하여도 `addTo()` 함수 인스턴스가 에워싸고 있는 `num1` 변수는 그대로 자신의 값(이 경우 `10`)을 유지한다. 따라서 연산 결과는 `10 + 15 = 25`가 되어 정상적으로 `25`를 출력하게 된다.

위 예시에서 간과하고 넘어가기 쉬운 부분을 다시 한번 짚고 넘어가자. **클로저는 하나의 함수 선언(lexical definition)이 아니라, 함수의 각 인스턴스와 연관된 개념**이다. 위 코드에서 외부 함수 `adder()` 내부에 있는 `addTo` 함수의 선언이 하나만 존재하기 때문에 클로저도 하나만 존재하는 것으로 착각하기 쉽다.

하지만 실제로 매번 `adder()` 함수가 호출될 때마다 새로운, 독립적인 `addTo()` 함수 인스턴스가 생성되고, 각 함수 인스턴스마다 새로운 클로저가 생성된다. 따라서 내부 함수의 각 인스턴스(예시에서는 `add10To`와 `add42To`로 이름이 붙여짐)는 각자의 독립적인 클로저를 갖는다.

## 클로저는 스냅샷이 아니다

앞서 살펴본 두 예제에서 우리는 클로저 안에 들어있는 변수의 "값을 읽어 오기만" 했다. 이를 통해 클로저라는 것이 어떤 특정 순간의 변수의 값을 "캡쳐"하는 것이라고 오해할 수도 있다. 이는 전혀 사실이 아니다.

클로저는 "값"에 대한 참조를 유지하는 일종의 스냅샷이 아니라, **"변수" 그 자체에 대한 살아있는 링크(live link)를 유지하는 것**이다. 단순히 클로저 내에 있는 변수의 값을 읽는 것 뿐만 아니라, 해당 변수의 값을 변경할 수도 있다! 어떤 함수가 클로저를 통해 변수를 에워 싼다는 것은 해당 함수가 변수를 어디서든 계속해서 "사용"할 수 있다는 소리이다. 이것이 클로저가 여러 프로그래밍 분야에서 널리 사용되는 이유이다. 클로저는 그 만큼 강력한 기능을 제공하기 때문이다.

다음은 위 예시에 대해 각 함수의 인스턴스와 스코프에 대한 링크를 그림으로 묘사한 것이다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/closure/visualizing_closures.png" alt="Visualizing Closures" />
    <figcaption>출처: https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch7.md</figcaption>
</figure>

위 그림에서 볼 수 있듯, `adder()` 함수를 호출할 때마다 `num1` 변수를 가지는 새로운 파란색 스코프가 생성되고, `addTo()` 함수의 인스턴스(초록색 스코프) 또한 생성된다. 각 함수의 인스턴스(`addTo10()`과 `addTo42()`)가 빨간색 글로벌 스코프 내에 존재하고, 빨간색 스코프 내에서 호출된다는 점도 알아두자.

<br/>

이제 클로저에 의해 에워 싸인 변수가 업데이트 되는 예시를 살펴보자:

```js
function makeCounter() {
    let count = 0;

    return function getCurrent() {
        count = count + 1;
        return count;
    }
}

const hits = makeCounter();

// ...

console.log(hits()); // 1

// ...

console.log(hits()); // 2
console.log(hits()); // 3
```

`count` 변수는 내부 함수 `getCurrent()`에 의해 에워 싸이기 때문에 가비지 컬렉트의 대상이 아니다. 그리고 `hits()` 함수를 호출할 때마다 이 함수에서 `count` 변수에 접근하여 값을 1만큼 증가시킨 후 증가된 값을 반환한다.

클로저를 생성하기 위해 일반적으로 함수(스코프)를 이용하여 내부 함수를 감싸는 경우가 많은데, 굳이 함수(스코프)를 사용할 필요는 없다. 단지 외부의 "스코프"가 내부 함수를 감싸기만 하면 된다:

```js
let hits;

{ // 블록 스코프 이용
    let count = 0;
    hits = function getCurrent() {
        count = count + 1;
        return count;
    }
}

// ...

console.log(hits()); // 1
console.log(hits()); // 2
console.log(hits()); // 3
```

<br/>

대부분의 (초보) 개발자들이 클로저를 **변수 중심**이 아니라 값 중심으로 생각하는 경향이 있기 때문에 다음과 같이 클로저를 이용하여 변수의 값을 "캡쳐"하려고 하는 실수를 종종 저지르곤 한다:
```js
let studentName = 'Frank';

const greeting = function hello() {
    // 클로저라는 것은 'Frank'라는 값(문자열)이 아니라 
    // studentName 변수 그 자체를 에워 싸는것임.
    console.log(`Hello, ${studentName}!`);
}

// ...

studentName = 'Suzy';

// ...

greeting(); // 'Hello, Suzy!'
```

`greeting()`(a.k.a `hello()`) 이라는 함수를 정의할 때 클로저가 `studentName`이 당시에 가지고 있던 값(`'Frank'`)를 저장할 것이라고 잘못 생각하는 경우가 있다. 하지만 실제로 `greeting()`은 `'Frank'` 라는 "값"이 아니라 `studentName`이라는 "변수"를 저장한다. 따라서 나중에 `greeting()`을 호출할 때, 호출할 당시의 `studentName` 변수의 값이 출력된다.

## 루프문에서의 클로저

위와 같은 실수는 루프문 내부에서 함수를 정의할 때도 발생한다:

```js
let keeps = [];

for (var i = 0; i < 3; i++) {
    keeps[i] = function keepI() {
        // i를 에워쌈 (close over)
        return i;
    }
}

console.log(keeps[0]()); // 3 -> ???
console.log(keeps[1]()); // 3 -> ????
console.log(keeps[2]()); // 3 -> ❓
```

|참고|
|-|
|보통 위와 같은 클로저 예시는 주로 루프문 내부에서 `setTimeout()` 혹은 이벤트 핸들러를 이용하는 경우가 많다. 하지만 나(원문 저자)는 예시를 좀 더 단순화 하기 위해 배열에 함수를 저장하는 방식을 사용했다. 하지만 이렇게 하든 `setTimeout()`등을 사용하든 근본적인 클로저의 원리는 동일하다.|

아마 `keeps[0]`에 저장된 함수(인스턴스)가 생성될 때 `i`의 값이 `0`이었으므로 `keeps[0]();`의 결과가 `0`이 나올거라고 예상했을지도 모르겠다. 하지만 이는 앞서 말했듯이 클로저를 변수 중심이 아니라 값 중심으로 생각했기 때문에 발생한 잘못된 예측이다. `for`문의 구조 때문에 각 iteration 마다 독립적인 (새로운) `i`가 존재한다고 생각했을 수도 있다. 하지만 여기선 `i`가 `var`로 선언되었기 때문에 `i`는 오직 (`for` 블록 스코프가 아니라 글로벌 스코프에) 하나만 존재한다.

따라서 `for`문을 다 돌고 나서 함수를 실행할 때 `3`이 나오는 이유는 프로그램 내에 오직 하나만 존재하는 `i`의 값이 3이기 때문이다. 물론 `keeps` 배열에 저장된 각각의 `keepI` 함수 인스턴스는 서로 독립적인 클로저를 갖고 있지만, 이 독립적인 클로저들이 모두 같은 `i`를 저장하고(에워싸고) 있다. 그림으로 묘사하면 다음과 같다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/closure/closure_in_loop_1.png" alt="Using Closure in loop example 1" />
</figure>

그럼 위 코드를 우리가 원하는 결과가 나오게끔 하려면 어떻게 해야할 까? 다음과 같이 각 iteration 마다 새로운 변수를 생성하는 방법이 있을 것이다:

```js
let keeps = [];

for (var i = 0; i < 3; i++) {
    // i의 값을 복사하는 변수를 매 iteration 마다 생성
    let j = i;

    // `keeps[i]` 에서는 i 변수를 에워싸는 것이 아니므로 이런식으로
    // 작성해도 괜찮음
    keeps[i] = function keepEachJ(){
        // i가 아니라 j를 에워쌈
        return j;
    };
}

console.log(keeps[0]());   // 0
console.log(keeps[1]());   // 1
console.log(keeps[2]());   // 2
```

여기선 각각의 내부 함수 인스턴스가 `i`와는 완전 별개인 새로운 변수 `j`를 에워싸고 있기 때문에 우리가 원하는 결과가 정상적으로 출력됨을 알 수 있다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/closure/closure_in_loop_2.png" alt="Using Closure in loop example 2" />
</figure>

물론 더 깔끔한 방법이 있다. [여기](/javascript/hoisting/#%EB%A3%A8%ED%94%84%EB%AC%B8)서 살펴본 것과 같이 `let`을 사용하면 각 iteration 마다 개별적인 `i`가 생성되므로 위 문제를 더욱 간단하게 해결할 수 있다.

```js
let keeps = [];

for (let i = 0; i < 3; i++) {
    // 각 iteration 마다 자동적으로 새로운
    // i가 생성됨
    keeps[i] = function keepEachI(){
        return i;
    };
}

console.log(keeps[0]());   // 0
console.log(keeps[1]());   // 1
console.log(keeps[2]());   // 2
```

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/closure/closure_in_loop_3.png" alt="Using Closure in loop example 3" />
</figure>

\> 2편에 계속...