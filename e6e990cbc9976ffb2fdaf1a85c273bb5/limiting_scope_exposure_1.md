---
title: '자바스크립트 변수 노출 최소화 하기 Part1'
date: 2020-08-19
category: 'JavaScript'
draft: false
---

[2부 보러가기](https://jaehyeon48.github.io/javascript/limiting_scope_exposure_2)

<br/>
<br/>

이 글은 아래의 원문을 번역/요약한 글입니다.

[You Don't Know JS Yet/Chapter 6: Limiting Scope Exposure](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch6.md)

이 글에서는 서로 다른 레벨의 (함수 및 블록) 스코프를 사용하여 프로그램을 구조화 하는 방법을 알아보고, 특히 변수의 과노출(over exposure)를 어떻게, 그리고 왜 해야 하는지에 대해서 살펴볼 것이다.

## 최소한으로 노출하기(Least Exposure)

함수가 자신만의 스코프를 가지는 것은 타당해 보인다. 하지만 왜 블록들도 자기만의 스코프를 가지는 걸까?

소프트웨어 보안 분야에서 흔히 적용되는 원칙중에 **최소 권한의 원칙(The Principle of Least Privilege, POLP)** 라는 것이 있다. ([POLP 원칙에 대한 추가 자료](https://digitalguardian.com/blog/what-principle-least-privilege-polp-best-practice-information-security-and-compliance)) 그리고 우리가 현재 살펴볼 내용에 적용되는, POLP 원칙의 변형으로 **최소 노출의 원칙(The Principle of Least Exposure, POLE)**이 있다.

POLP 원칙은 소프트웨어 아키텍쳐에 대해 방어적인 자세를 취한다. 즉, 시스템의 구성요소들은 최소한의 권한(lease privilege), 최소한의 접근(least access), 그리고 최소한의 노출(least exposure)을 갖도록 설계되어야 한다는 것이다. 이렇게 정말 필요한 최소한의 기능들로 구성된 요소들로 시스템을 설계하게 되면, 어떠한 요소에 해킹이나 에러가 발생했을 때 다른 요소에 미치는 영향이 적어지게 되므로 시스템 전체적으로는 더욱 견고해진다.

POLP 원칙이 시스템 레벨의 요소 설계에 적용되는 원칙이라면, 이것의 변형인 POLE은 좀 더 낮은 레벨에 적용되는 원칙이다. 우리는 이 POLE원칙을 어떻게 스코프가 서로 상호작용 하는지에 대해 살펴볼 때 적용할 것이다.

<br/>

그렇다면 POLE 원칙이 "Least Exposure", 즉 최소한으로 노출한다는 것인데, 도대체 무엇을 최소한으로 노출한다는 걸까? 바로 스코프 내에 존재하는 **변수**들이다.

이렇게 생각해보자. 프로그램을 작성할 때 변수들을 그냥 글로벌 스코프에 때려박으면(?) 어떨까? 일단 좋은 생각은 아닌것 같다. 하지만 왜 그런지 이유를 살펴보자. 프로그램의 한 부분(모듈)에서 사용되는 변수가 스코프를 통해 다른 부분(모듈)에 "노출" 되면 일반적으로 다음의 세 가지 위험이 발생한다:

- **변수 이름 충돌**: 일반적인, 혹은 흔히 사용되는 변수/함수 이름을 서로 다른 두 모듈에서 사용했다가 두 모듈을 (글로벌 스코프 에서) 합치게 되면 변수 이름이 충돌하게 된다.
- **예기치 못한 상황**: 만약 원래라면 어떤 모듈 내에서만 사용되어야 하는 변수/함수를 노출하게 되면 다른 개발자가 해당 변수/함수를 의도하지 않는 방식으로 사용할 수 있다. 이렇게 되면 버그의 발생 확률이 커지게 된다.

  예를 들어, 어떤 모듈내에서 배열을 사용하는데, 해당 배열에는 오직 숫자만 저장되도록 의도했다고 하자. 이 때 만약 이 배열을 외부로 노출하게 되면 다른 누군가가 해당 배열에 문자열과 같이 숫자가 아닌 값을 저장할 수도 있다. 이렇게 되면 프로그램이 내가 의도한대로 동작하지 않게 될 것이다.

  더 안좋은 점은, 악의를 품은 누군가가 프로그램을 악이용 하게 될 수도 있다는 점이다.

- **의도하지 않은 의존관계**: 불필요하게 변수/함수를 노출시키면 당장은 프로그램이 돌아가는데 문제가 없을지 몰라도 추후에 리팩토링등을 하는 과정에서 심각한 문제가 발생할 수도 있다.

<br/>

스코프에 적용되는 POLE 원칙이 의마하는 바는 **최대한 숨길 수 있으면 숨기고 정말 필요한 부분만 외부로 노출하라**는 것이다. 여러 개의 중첩 스코프를 사용하는 경우, 최대한 변수들을 내부 스코프로 숨기는 것이 바람직하다 (즉, 가능한 제일 안쪽 스코프에 변수를 선언).

POLE 원칙에 따라 프로그램을 작성하게 되면 위에서 살펴본 3가지 위험들을 피하거나, 혹은 최소화 할 수 있다. 다음 코드를 보자:

```js
function diff(x, y) {
  if (x > y) {
    let tmp = x
    x = y
    y = tmp
  }

  return y - x
}

diff(3, 7) // 4
diff(7, 5) // 2
```

`diff()` 함수 내에서 `x`가 `y` 보다 크면 `x`와 `y`를 스왑하여 빼기 결과 `y - x`가 항상 0보다 같거나 크도록 하고 있다. 이 때 스왑하는 과정에서 `tmp`변수가 사용되었는데, 위 예제는 간단한 예시이므로 `tmp`변수가 `if`문 내에 존재하던, 혹은 `if`문을 빠져나와 함수 스코프 내에 존재하던 딱히 상관없다 (물론 글로벌 스코프에 존재하는 것은 바람직하지 않다!). 하지만 POLE원칙에 의하면 `tmp`변수를 최대한 안쪽 스코프에 숨기는 것이 좋으므로, `tmp`가 `if`문 스코프 내에 존재하는 것이다.

## 함수 스코프를 이용하여 숨기기

앞에서 왜 변수와 함수(선언)를 최대한 숨겨야 하는지 알아보았다. 알아보는건 좋은데, **어떻게 숨겨야할까?** 일단 블록 스코프 단위인 `let`과 `const`는 나중에 살펴보는 것으로 하고, 일단 `var`와 함수 선언을 어떻게 숨기는지에 대해 알아보자.

이들을 숨기는 방법은 간단하다. 함수를 선언해서 스코프를 만들어내면 된다. 한번 예제를 통해 살펴보자:

```js
let cache = {}

function factorial(x) {
  if (x < 2) return 1
  if (!(x in cache)) cache[x] = x * factorial(x - 1)
  return cache[x]
}
```

위 코드는 팩토리얼을 계산하는 재귀함수와 계산 결과를 저장하는 `cache` 객체로 구성되어 있다. 이전에 계산한 결과들을 저장하여 추후에 함수를 여러번 호출했을 때 중복되는 연산을 줄이기 위해 `cache` 객체를 사용했는데, 잘 생각해보면 `cache`는 `factorial()`의 내부적인 요소이므로 함수 외부로 "노출"되면 안될 것 같다 (특히 글로벌 스코프에는 더욱 안될 것 같다!).

여기서 이러한 과노출(over exposure) 문제를 해결하기 위해 단순히 `cache`를 `factorial()` 내부에 집어넣으면 될 것 같지만, 사실 그렇게 간단하지는 않다. `factorial()`을 여러번 호출해도 동일한 (하나의) `cache`가 계속해서 존재해야 하므로 `factorial()` 함수 외부에 존재해야만 한다. 만약 `factorial()` 내부에 `cache`를 넣게 되면 함수를 호출하고 종료할 때 `cache`도 같이 사라지므로 우리가 원하는 대로 동작하지 않을 것이다. 그렇다면 어떻게 해야 할까?

바로 함수형 프로그래밍에서 사용되는 기법인 "메모이제이션(memoization)"을 사용하는 것이다. 함수형 프로그래밍 패러다임에서는 성능 최적화를 위해 함수가 계산한 결과를 저장(캐싱)하여 동일한 입력으로 여러 번 호출해도 최초 한번만 계산하고 이후에는 캐시에 저장된 값을 이용하는 방법을 메모이제이션 이라고 부른다 (계산 성능은 좋아지지만 그 대신 메모리를 더 사용하게 된다). 일반적으로 메모이제이션 기법을 사용하기 위해 "클로저"라는 것을 이용하게 되는데, 이는 추후에 따로 살펴보자.

따라서, 메모이제이션을 적용하여 위 코드를 다시 작성하면 다음과 같다:

```js
// 바깥(outer/global) 스코프

function hideTheCache() {
  // 중간(middle) 스코프
  let cache = {}
  return factorial

  // ****************

  function factorial(x) {
    // 안쪽(inner) 스코프
    if (x < 2) return 1
    if (!(x in cache)) cache[x] = x * factorial(x - 1)
    return cache[x]
  }
}

const factorial = hideTheCache()
console.log(factorial(6)) // 720
console.log(factorial(8)) // 40320
```

여기서 `hideTheCache()` 함수는 단지 여러 번의 함수 호출에도 `cache`가 계속해서 유지되도록 스코프를 형성하는 역할만을 수행한다. 또한, `factorial()` 함수가 `cache`에 접근할 수 있도록 하기 위해 `cache`와 동일한 스코프 (`hideTheCache()` 함수 스코프)에 `factorial()`을 선언하였고, `hideTheCache()` 에서 `factorial()`을 반환함으로써 추후 외부 변수가 `factorial()`을 가리키게 할 수 있도록 하였다. 이렇게 함으로써 `factorial()`을 여러 번 호출하더라도 바깥으로부터 `cache`를 감추면서 동시에 계속해서 유지할 수 있다.

근데 이렇게 하면 변수(여기서는 `cache`)를 확실히 감출 수 있을 것 같긴 한데... 이런식으로 변수/함수를 감출 때마다 `hideTheCache()`와 같이 바깥 함수를 선언하면 이름 충돌등의 문제가 발생할 것 같다. 더 나은 방법은 없을까?

물론 있다. 위와 같이 변수/함수를 감춰야 하는 상황마다 굳이 이름을 정해서 함수를 선언하는 방법보다, 다음과 같이 함수 표현식을 사용하는 방법이다:

```js
const factorial = (function hideTheCache() {
  let cache = {}
  return factorial

  function factorial(x) {
    if (x < 2) return 1
    if (!(x in cache)) cache[x] = x * factorial(x - 1)
    return cache[x]
  }
})()
console.log(factorial(6)) // 720
console.log(factorial(8)) // 40320
```

잠깐... 근데 위 방법도 여전히 함수를 선언해서 `cache`를 감추는 것 같은데 뭐가 달라진거지?

확실히 달라진게 맞다. 함수 선언식에 사용된 identifier는 외부 스코프에 속하는 것이 맞다. 반면, 함수 표현식에 사용된 identifier는 해당 함수 내부 스코프에 속한다:

```js
function funcDeclaration() {}

const funcExpression = function func() {
  console.log(func) // [Function: func]
}

console.log(funcDeclaration) // [Function: funcDeclaration]
funcExpression()
console.log(func) // ReferenceError: func is not defined
```

따라서, 함수 표현식을 사용하게 되면 `hideTheCache` identifier는 `cache`와 동일한 스코프에 존재하므로 외부 스코프에서 함수 이름이 충돌하지 않게 된다. 이렇게 하면 (`hideTheCache`와 같이) 변수를 감추기 위해 스코프를 형성하는 용도로 생성하는 함수의 이름을 충돌 걱정 없이 의미에 맞게(semantically) 자유롭게 쓸 수 있게 된다.

혹은, 아예 이름을 적지 않을 수도 있다. 즉 익명(anonymous) 함수 표현식을 사용하는 것이다.

### IIFE

함수 표현식을 사용한 코드의 마지막에 `})();`로 끝나는 부분을 살펴보자. 단순히 함수 표현식을 "사용"만 한 것이 아니라, 함수 표현식 전체를 괄호`(...)`로 감싸고 이 괄호 옆에 괄호`()`를 하나 더 붙였다. 이는 우리가 정의한 함수 표현식을 호출하는 역할을 한다.

이렇게 함수 표현식을 이용하여 함수를 정의하고, 정의한 함수를 **즉시** 호출하는 패턴을 **IIFE(Immediately Invoked Function Expression)**라고 한다 (보통 "이피"라고 발음한다).

앞서 살펴봤듯이, IIFE는 변수/함수를 숨기기 위해 (함수) 스코프를 생성할 때 매우 유용하다. 일단 기본적으로 표현식(expression) 이므로 자바스크립트 내에서 표현식이 위치할 수 있는 자리 어디서든지 IIFE를 사용할 수 있으며 이름을 붙일수도, 붙이지 않을 수도(익명) 있다. 익명으로 사용하는 것이 좀 더 흔한 방법이다.

앞에서 사용한 방법과 비교하기 위해, IIFE 패턴 자체만 한번 살펴보자:

```js
// outer scope

;(function() {
  // inner scope
})()

// more outer scope
```

한 가지 흥미로운 사실은, 우리가 앞에서 사용했던 방법에서는 사실 함수를 감싸는 괄호를 제거하여도 정상적으로 동작한다. 하지만 이 코드와 같이 IIFE를 홀로 쓴다면 함수를 무조건 괄호로 감싸야 한다. 그래야 자바스크립트 엔진이 함수를 함수 선언으로 받아들이지 않고 표현식으로 받아들이게 된다. 사실 애초에 IIFE를 따로 쓸때 괄호로 감싸지 않으면 에러가 난다:

```js
function func1() {}(); // SyntaxError
(function func2() {})();
```

## 블록 스코프를 이용하여 숨기기

앞에서 IIFE를 이용해서 함수 스코프를 생성하여 변수/함수를 숨기는 방법을 알아봤으니, 이제 중괄호쌍 `{...}`를 이용하여 `let`과 `const`를 숨기는 방법을 알아보자. 이때 알아두어야할 것이, 중괄호 `{}`는 대부분의 경우 **블록**을 생성하지만, 해당 블록이 반드시 **스코프**가 되는 것은 아니다.

즉 중괄호쌍 `{...}`을 사용하면 블록이 생성되고, 해당 블록 내부에 블록 스코프를 가지는 선언(`let`과 `const`등)이 존재하는 경우에만 스코프가 된다. 다음을 보자:

```js
{
  // let 변수가 있으므로 중괄호가 블록 스코프의 역할을 한다.
  let thisIsNowScope = true

  for (let i = 0; i < 5; i++) {
    // for 문의 중괄호 또한 블록 스코프이다
    if (i % 2 === 0) {
      // 이 중괄호는 그냥 "블록"이다. 스코프가 아니다.
      console.log(i)
    }
  }
}
```

또한, 모든 중괄호쌍 `{...}`이 블록을 생성하는 것은 아니다. 😕

- 객체 리터럴로 사용되는 `{...}`는 블록도, 스코프도 아니다.
- 클래스를 선언할 때 사용되는 `{...}`은 블록도, 스코프도 아니다.
- 함수 `function`도 중괄호를 사용하지만 사실 따지고 보면 블록이 아니라 함수 body를 정의하기 위한 하나의 문장이다. 그렇지만 (함수) 스코프의 역할을 한다.
- `switch`문에 사용되는 중괄호는 블록도, 스코프도 아니다.

정리해보자면, 중괄호쌍 `{...}`는 블록을 생성할 수도, 생성하지 않을 수도 있으며 스코프가 될 수도, 되지 않을 수도 있다. 이래서 자바스크립트가 어렵다.. 😱

<br/>

이렇게 중괄호쌍이 블록을 생성하지 않는 예외의 경우를 제외하고, 중괄호쌍은 `if`문 혹은 `for`문과 같이 다른 문장에 "붙어서(attached)" 블록을 정의할 수 있다. 또한 위 코드의 제일 바깥쪽에 사용된 중괄호와 같이 다른 문장에 붙지 않고 혼자서 사용되는 경우에도 블록을 정의할 수 있다.

자바스크립트와 같이 블록 스코프를 지원하는 대부분의 프로그래밍 언어의 경우 하나 혹은 몇 개의 변수만을 위해 작은 크기의 스코프(a narrow slice of scope)를 명시적으로 생성하는 것은 **매우 매우 흔한 패턴**이다. 따라서 POLE 원칙을 잘 준수하기 위해선 이러한 패턴을 적절하게 잘 사용하여 identifier의 노출을 최소화 하는것이 바람직하다.

<br/>

명시적으로 블록 스코프를 생성하는 패턴은 다른 블록의 내부에서도 매우 유용하게 사용될 수 있다:

```js
if (somethingHappened) {
  // 블록이지만, 스코프는 아님

  {
    // 블록이자 스코프
    let msg = somethingHappened.message()
    notifyOthers(msg)
  }

  // ...

  recoverFromSomething()
}
```

여기선 `msg` 변수를 숨기기 위해 `if`문 내부에 더 작은 블록 스코프를 명시적으로 생성하였다. 아마 대부분의 개발자들은 위 방법과는 다르게 그냥 `msg` 변수를 `if`문의 스코프 내에 놔둘지도 모르겠다. 사실 위 예시와 같이 몇줄 안되는 코드에서는 명시적으로 추가의 블록 스코프를 생성해도 되고, 안해도 별 상관은 없겠지만 코드의 규모가 커짐에 따라 이러한 과노출 문제가 더욱 불거질 수 있다.

따라서 나(원문 작성자)는 POLE 원칙을 충실히 이행하기 위해 몇줄 안되는 코드라고 하더라고 위 예시와 같이 명시적으로 스코프를 생성하여 변수의 노출 범위를 최소화 하는 것을 추천한다.

<br/>

명시적인 블록 스코프를 사용한 또 다른 예시를 살펴보자:

```js
function getNextMonthStart(dateStr) {
  var nextMonth, year

  {
    let curMonth
    ;[, year, curMonth] = dateStr.match(/(\d{4})-(\d{2})-\d{2}/) ?? []
    nextMonth = (Number(curMonth) % 12) + 1
  }

  if (nextMonth === 1) {
    year++
  }

  return `${year}-${String(nextMonth).padStart(2, '0')}-01`
}

getNextMonthStart('2019-12-25') // 2020-01-01
```

위 코드에 있는 스코프와 스코프 내부의 identifier들을 정리하면 다음과 같다:

1. 글로벌 스코프에는 함수 `getNextMonthStart()` 가 존재한다.
2. 함수 `getNextMonthStart()` 스코프 내부에는 `dateStr`(매개변수), `nextMonth`, `year` 세 개의 identifier가 존재한다.
3. 함수 안의 블록 스코프 내부에는 `curMonth` identifier가 존재한다.

이 때 `curMonth`를 함수 스코프 내부에 두지 않고 굳이 명시적으로 블록 스코프를 생성한 이유는, `curMonth`를 사용하는 문장이 `curMoth` 변수 선언 밑의 두 문장 밖에 없기 때문이다. 따라서 `curMonth`의 과노출을 방지하기 위해 블록 스코프를 명시적으로 생성하였다.

이 예시는 매우 간단한 예시이므로 과노출로 인한 위험이 적다. 하지만 이와 같이 **습관적으로** 과노출을 방지하는 마음가짐(mindset)을 가져야 POLE 원칙을 따름으로써 얻을 수 있는 이점을 누릴 수 있다. 따라서 작고 사소한 부분이더라도 이런식으로 일관되게 POLE 원칙을 준수하는 것이 바람직하다.

마지막으로 좀 더 복잡한 예시를 살펴보자:

```js
function sortNamesByLength(names) {
  var buckets = []

  for (let firstName of names) {
    if (buckets[firstName.length] === null) {
      buckets[firstName.length] = []
    }
    buckets[firstName.length].push(firstName)
  }

  {
    let sortedNames = []

    for (let bucket of buckets) {
      if (bucket) {
        bucket.sort()

        // 리스트에 정렬된 bucket을 append
        sortedNames = [...sortedNames, ...bucket]
      }
    }

    return sortedNames
  }
}

sortNamesByLength(['Sally', 'Suzy', 'Frank', 'John', 'Jennifer', 'Scott']) // [ 'John', 'Suzy', 'Frank', 'Sally', 'Scott', 'Jennifer' ]
```

위 코드에는 5개의 스코프에 걸쳐 총 6개의 identifier가 존재한다. 각 identifier들은 서로 이름이 충돌하지 않기 때문에 모든 identifier들을 글로벌 스코프에 몰아 넣을수도 있지만, POLE 원칙에 위배되기 때문에 그렇게 하지 않았다.

\> 2부에 계속...
