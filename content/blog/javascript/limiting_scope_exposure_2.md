---
title: '자바스크립트 변수 노출 최소화 하기 Part2'
date: 2020-08-20
category: 'javascript'
draft: false
---

[1부 보러가기](../limiting_scope_exposure_1)

<hr class="custom-hr">

## var, 그리고 let

앞서 1부 마지막에 살펴본 코드에서 `var bucket` 부분을 유심히 살펴보자. 왜 `let`으로 선언하지 않고 `var`로 선언했을까? 여기엔 의미론적인(semantic) 이유와 기술적인(technical)이유가 존재한다.

일단 `var` 변수는 자바스크립트 초창기 시절부터 항상 함수 스코프를 가지는, 즉 "함수 전체에 속하는" 변수였다. 어디에서 선언되건 관계없이 `var`는 가장 가까운 함수 스코프(없으면 글로벌 스코프) 에 속하게 된다. 만약 다음과 같이 블록 안에 `var`가 선언되더라도 `var`는 블록 스코프가 아니라 함수 스코프이다:

```js
function func() {
    if (true) {
        let a = 10;
        var b = 100; // 블록 스코프에 속하는 것이 아니라 함수 스코프에 속함
    }

    return b;
}

console.log(func()); // 100
```

그럼 왜 `let` 대신 `var`를 사용한걸까? 일단 한눈에 보기에도 `var`는 `let`과 구별되기도 하고, `var` 자체가 주는 의미가 "이 변수는 함수 스코프임" 이기 때문이다. 물론 `let`을 함수 스코프 내에 선언하여 사용할 수도 있지만, 블록 내에 있는 다른 `let` 변수들과 잘 구별되지 않으므로 함수 전체에서 사용하는 `let`인지 혹은 특정 블록 내에서 사용하는 `let`인지 구별이 잘 되지 않을 수 있다.

다시말해, 내 생각(원문 저자)엔 `let`보다 `var`가 "함수 전체에서 사용되는 변수"라는 의미를 더 잘 나타내므로 각자의 목적에 맞게 두 변수를 적절히 사용하는 것이 좋아보인다. 즉, "함수 스코프"라는 것을 나타내고 싶을땐 `var`를, "블록 스코프"라는 것을 나타내고 싶을땐 `let`을 사용하는게 적절할 것 같다.

|⚠️ 경고|
|-|
|`var`와 `let`을 같이 사용하라는 내 생각은 분명 논쟁의 소지가 다분하다. 보통 "var는 오류가 많아. let을 사용해!" 라던가, 혹은 "var는 절대로 사용하면 안된다. 반드시 let을 써라"와 같은 말을 들어봤을 수도 있다. 물론 이러한 주장도 일리는 있다. 하지만 이 주장들도 내 주장과 마찬가지로 어디까지나 "주장"일 뿐이다. `var`는 고장나거나(broken), 혹은 deprecated 된 녀석이 아니다. 자바스크립트 초창기부터 아주 잘 작동해왔으며, 아마 앞으로도 (자바스크립트가 없어질때까지) 그럴것이다!|

## 그럼 let은?

`var`를 사용할지, 혹은 `let`을 사용할지를 결정하는 것은 다음 물음을 통해 그 해답을 얻을 수 있다. "이 변수를 가장 최소한으로 노출시키는 스코프가 어디일까?"

이 질문에 대한 답을 찾으면 해당 변수가 블록 스코프인지 혹은 함수 스코프인지 결정이 날 것이다. 만약 처음에는 블록 스코프라고 생각해서 `let`을 사용했다가, 나중에 살펴보니까 실은 함수 스코프인 경우 `var`로 변경하는 경우가 생길 수도 있다.

## try...catch!

앞서 `var`와 함수의 매개변수들은 함수 스코프임을, `let` (그리고 `const`)는 블록 스코프임을 암시한다는 것을 살펴보았다. 하지만 여기에 한가지 예외 상황이 있는데, 바로 `catch` 구문이다.

`try...catch`문이 처음으로 등장했던 ES3 (1999년) 부터, `catch`는 블록 스코프 기능을 가지고 있었다:

```js
try {
    doesntExist();
} catch (error) {
    console.log(error); // ReferenceError: doesntExist is not defined

    let onlyHere = true;
    var outerVariable = true;
}

console.log(outerVariable); // true

console.log(error); // ReferenceError: error is not defined
```

위 코드에서 `catch`문에 의해 선언된 `error`변수는 `catch`블록에 속하는 블록 스코프 변수이다. 또한 또 다른 블록 스코프 변수 (`let`, `const`)를 `catch` 블록 내에 포함할 수도 있다. 하지만 함수 스코프인 `var`는 `catch`블록에 귀속되지 않고 함수 스코프 방식(여기서는 글로벌 스코프)으로 동작한다.

ES2019 부터는 `catch`문에 변수를 선언하지 않을 수도 있다 (즉, `error` 변수 없이 `catch`를 사용). 만약 이렇게 하면 `catch` 블록은 "블록" 이지만 "스코프"가 아니게 된다. 따라서 `error` 변수를 굳이 사용할 필요가 없다면 변수를 생략해도 된다:

```js
try {
    doSomething();
}
catch {
    doAnotherOne();
}
```

## 블록 내에서 함수 선언하기 (FiB)

이제껏 우리는 `var`가 함수 스코프, `let`(그리고 `const`)는 블록 스코프라는 것을 살펴보았다. 그렇다면 블록 내에 존재하는 함수 선언은 어떻게 처리될까? 이 문제를 Function Declarations in Blocks (Fib)라고 한다. 우리는 흔히 함수 선언이 `var`와 유사하다고 생각한다. 그럼 함수 선언도 `var`와 같이 함수 스코프일까?

그럴 수도 있고, 아닐 수도 있다. 하이고... 골이 땡긴다 🤦

한번 천천히 살펴보자:

```js
if (false) {
    function ask() {
        console.log('정말 실행되나?');
    }
}

ask();
```

위 코드를 실행하면 어떤 결과가 나올까?
1. `ask` identifier가 `if` 블록 내부에 존재하므로 블록 밖인 글로벌 스코프에서 `ask()`를 호출하면 `ReferenceError`가 발생할 것 이다.
2. `ask`라는 identifer가 존재는 하지만 `undefined`이므로 (왜냐면 `if`문이 실행되지 않았기 때문에!) `ask()`를 호출하면 `TypeError`가 발생할 것이다.
3. `ask()`가 정상적으로 동작하여 결과가 출력될 것이다.

이 때 정말 정말 혼란스러운 일이 발생한다. 위 코드의 결과는 자바스크립트 런타임(실행환경)에 따라 다를 수 있다! 이와 같은 상황은 자바스크립트에서 legacy로 인해 예측 불가능한 결과가 나오는 몇 안되는 상황 중 하나이다.

자바스크립트 스펙을 살펴보면 블록 내부에 존재하는 함수 선언은 블록 스코프이어야 한다고 되어있다. 따라서, 따지고 보면 1번이 정답이다. 하지만 브라우저(엔진)들은 거의 대부분 2번 방식으로 동작할 것이다. 즉, 함수의 identifier가 블록 외부로 노출이 되지만 자동적으로 초기화 되지는 않기 때문에 `undefined`로 남아있게 된다.

그렇다면 도대체 왜 브라우저(엔진)들은 스펙대로 동작하지 않고 자기 멋대로(?) 동작하는 걸까?? 그 이유는, 브라우저들은 ES6에서 블록 스코프에 대한 개념이 생기기 전부터 이미 FiB에 관해 특정한 방식으로 동작해왔기 때문이다. 만약 스펙대로 동작하고자 기존에 동작하던 방식을 바꿔버리면 웹사이트들이 정상적으로 동작하지 못하게 될 수 있기 때문에 스펙과 다르게 동작하는 것이다.

<br/>

함수 선언을 블록 내부에 하는 경우 중 한 예시는 다음 코드와 같이 특정 조건에 따라 함수를 다르게 정의하는 경우이다:
```js
if (typeof Array.isArray !== "undefined") {
    function isArray(a) {
        return Array.isArray(a);
    }
}
else {
    function isArray(a) {
        return Object.prototype.toString.call(a) === "[object Array]";
    }
}
```

이와 같은 방법으로 코딩하는 이유는, 만약 함수 내부에서 `if`문을 사용하여 동작을 다르게 정의하면 매번 함수를 호출할 때마다 불필요하게 체킹을 해야 하므로 성능상의 패널티가 존재하기 때문이다.

|⚠️ 경고|
|-|
|FiB의 예측 불허한 특성 이외에, 위 코드와 같이 분기문을 통해 여러 버전의 함수를 만들게 되면 디버깅이 (매우) 힘들어지는 단점이 있다. 예를 들어, `isArray()` 함수에 버그가 발생하여 해당 버그를 고쳐야할 때 우선 어느 버전의 `isArray()`에 문제가 생겼는지 살펴봐야한다. 가끔 분기 조건을 잘못 체크하여 엉뚱한 버전을 고치는 경우가 발생할 수도 있다. 따라서 하나의 함수에 대해 분기문을 통해 여러 버전을 만드는 경우, 디버깅이 매우 힘들어 질 수 있다는 점을 분명히 염두해야 한다.|

<br/>

앞서 살펴본 예시 외에도 FiB에 대한 여러가지 이례적인 케이스들이 도사리고 있다. 이러한 케이스들도 물론 자바스크립트 실행환경에 따라 다르게 동작한다. 예를 들면:
```js
if (true) {
    function ask() {
        console.log('이거 호출?');
    }
}

if (true) {
    function ask() {
        console.log('아니면 이거 호출?');
    }
}

for (let i = 0; i < 5; i++) {
    function ask() {
        console.log('그것도 아니면 이것들 중 하나?');
    }
}

ask();

function ask() {
    console.log('아 혹시 이건가?');
}
```

함수 호이스팅을 고려해 본다면 `아 혹시 이건가?`를 출력하는 제일 마지막 `ask()` 함수가 `ask();` 출력 바로 위에 호이스팅 되어 이 함수가 실행될 것이라 예측할 수도 있다. 진짜 그럴까? 

아니다 (하... 🤦‍♂️)

이러한 이상한(?) 케이스들을 전부 소개할 생각도 없고, 왜 이런식으로 동작하는지 설명할 생각은 더더욱 없다. 내 생각(원문 저자)엔 이러한 경우들은 그냥 미스테리한 legacy 동작들이다.

적어도 내가 생각하기로는, 이렇게 이상하게 동작하는 FiB를 피하는 가장 실용적인 해결책은 **그냥 FiB를 사용하지 않는것**이다. 즉, 블록안에서 함수 선언을 하지말고 항상 가장 바깥 함수 스코프(만약 여러 스코프가 중첩된 경우 그 중 가장 바깥) 혹은 글로벌 스코프에다 함수를 선언하는 것이 예측 불가능한 상황들을 피할 수 있는 방법인 것 같다.

따라서 앞에서 살펴본 두 버전의 `isArray`를 선언하는 방법은 다음과 같이 할 수 있을 것 같다:
```js
function isArray(a) {
    if (typeof Array.isArray !== "undefined") {
        return Array.isArray(a);
    }
    else {
        return Object.prototype.toString.call(a) == "[object Array]";
    }
}
```

아 물론이다. 이렇게 하면 다소 성능이 저하될 수는 있다. 하지만 보다 전체적인 관점에서 봤을 때 이렇게 하는 것이 더 좋을 것이다.

만약 위와 같이 코딩함으로 인해 발생하는 성능 저하가 애플리케이션에 치명적이라면, 다음과 같이 코딩할 수도 있을 것이다:
```js
var isArray = function isArray(a) {
    return Array.isArray(a);
};

// override the definition, if you must
if (typeof Array.isArray === "undefined") {
    isArray = function isArray(a) {
        return Object.prototype.toString.call(a) === "[object Array]";
    };
}
```

여기서 유심히 살펴봐야 할 것은, `if`문 내부에서 함수 선언문 말고 함수 표현식을 사용했다는 점이다. 이렇게 "함수 표현식"을 블록 안에 사용하는 것은 괜찮다. 우리가 앞에서 피하고자 했던 FiB는 블록 내부에 함수 표현식이 아니라 함수 선언문을 사용하는 것이었다.

만약 FiB 스타일로 코딩을 해서 테스팅 했을 때 정상적으로 돌아간다고 쳐도, FiB 스타일로부터 얻는 이점보다 추후에 FiB의 예측불가능한 특성으로 인한 단점이 더 커질 것이다. 따라서 되도록이면 FiB 스타일을 사용하지 말자.