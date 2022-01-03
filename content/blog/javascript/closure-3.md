---
title: '자바스크립트 클로저 Part3'
date: 2020-08-22
category: 'JavaScript'
draft: false
---

이 글은 아래의 원문을 번역/요약한 글입니다.

[You Don't Know JS Yet/Chapter 7: Using Closures](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch7.md)

[1편 보러가기](../closure_1)

[2편 보러가기](../closure_2)

<hr class="custom-hr">

앞서 살펴본 바로는 클로저가 변수 단위로 적용되는 것 같았다. 하지만 다음과 같은 경우는 어떨까?

```js
function storeStudentInfo(id, name, grade) {
  return function getInfo(whichValue) {
    // warning: using `eval(..)` is a bad idea!
    return eval(whichValue)
  }
}

const info = storeStudentInfo(73, 'Suzy', 87)

console.log(info('name')) // Suzy

console.log(info('grade')) // 87
```

내부 함수 `getInfo()`는 `id`, `name`, `grade` 변수 중 어떠한 것도 명시적으로 클로저로 감싸고 있지는 않다. 그렇지만 `eval()`을 통해 여전히 해당 변수들에 접근이 가능한 것처럼 보인다. 따라서 내부 함수에 의해 명시적으로 참조되지는 않지만 해당 변수들이 클로저를 통해 유지되는것 처럼 보인다. 그렇다면 앞서 살펴본 "클로저는 변수 단위로 적용된다"는 것이 틀린걸까?

때에 따라 다르다. 대부분의 현대 자바스크립트 엔진들은 명시적으로 참조되지 않는 변수들을 클로저에서 제거하는 최적화 과정을 수행한다. 하지만 여기서 `eval()`을 사용한 경우처럼 최적화를 수행할 수 없는 경우가 있으며, 이 경우 클로저는 변수들을 그대로 가지고 있게 된다.

다시말해, 일단 클로저는 반드시 스코프 단위로 적용되어야 하며, 구현에 따라 차이가 있을 수 있고, 추가적인 최적화를 통해 클로저가 저장하는 전체 스코프를 명시적으로 참조하는 부분으로 최소화 할 수 있다 (즉, 원래 스코프 단위로 적용되는 것을 변수 단위로 적용되도록 최적화).

당장 몇 년전 까지만 해도 대부분의 자바스크립트 엔진들은 이러한 최적화를 수행하지 않았다. 즉, 이벤트 핸들러 같은 콜백들이 우리가 생각한 것보다 훨씬 오래 메모리에 유지됐을 수도 있다는 것이다. 또한 최적화가 스펙의 일부가 아니라 추가적인(optional) 작업이라는 점을 고려해보았을 떄, 최적화가 무조건 수행될 것이라고 생각해서는 안된다.

따라서 클로저 내의 어떤 변수가 배열/객체와 같이 아주 큰 값을 가지는 경우, 해당 변수가 더 이상 필요없으면 최적화 혹은 가비지 컬렉션에 의존하지말고 직접(manually) 변수를 제거하는 것이 안전하다고 할 수 있다. 이것을 2부 마지막에 살펴본 예시에 적용해보자:

```js
function manageStudentGrades(studentRecords) {
  let grades = studentRecords.map(getGrade)

  // unset `studentRecords` to prevent unwanted
  // memory retention in the closure
  studentRecords = null

  return addGrade
  // ..
}
```

여기서, `studentRecords` 변수를 클로저에서 아예 제거해버리는 것이 아니다. 클로저에서 제거하는것은 우리가 할 수 없는 작업이다. 대신, 이 변수에 `null` 등을 할당하여 변수가 더 이상 큰 배열을 가리키지 않도록 하여 배열이 메모리에서 제거(GC)되도록 하여 메모리 효율을 더 좋게 했다.

다시한번 말하지만, 사실 대부분의 요즘 엔진들은 자동적으로 최적화 과정을 수행한다. 하지만 위와 같이 더 이상 사용하지 않는 변수들에 직접 조치를 취하여 불필요한 메모리 낭비를 막는 것이 좋은 습관이다.

또, 위 코드에서 `.map(getGrade)`이 수행된 이후 더 이상 `getGrade()`를 필요로 하지 않으므로 이 함수 레퍼런스를 없애서 메모리를 (조금이나마) 더 확보할 수도 있다. 여기서는 프로그램이 매우 간단하기 때문에 이렇게 까지 하지는 않았지만, 만약 실제 애플리케이션을 개발하면서 메모리 최적화를 하는 경우 이러한 부분까지 신경을 써주는게 좋다.

자, 결론은 간단하다. **프로그램 내에서 클로저가 어디에 나타나는지 파악하고, 클로저 내에 어떤 변수가 포함되는지 파악하는 것이 중요하다. 이렇게 해야 정말 필요한 것들만 클로저 내에 유지함으로써 메모리 낭비를 막을 수 있다**.

## 다른 관점에서 바라보기

앞서 내린 클로저에 대한 정의를 다시 살펴보면, 함수가 [일급 객체](https://en.wikipedia.org/wiki/First-class_citizen)로서 동작한다는 사실을 알 수 있다. 클로저는 함수가 어디에서 호출되건 상관없이 해당 함수가 선언된 당시의 외부의 스코프/변수에 **링크**를 연결하는 것이다.

[여기](http://localhost:8000/javascript/closure_1/#%ED%81%B4%EB%A1%9C%EC%A0%80%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%9C-%EB%8D%A7%EC%85%88)서 살펴본 코드를 다시한번 살펴보자.

```js
function adder(num1) {
  return function addTo(num2) {
    return num1 + num2
  }
}

const add10To = adder(10)
const add42To = adder(42)

console.log(add10To(15)) // 25
console.log(add42To(9)) // 51
```

우리가 여태껏 살펴보고 있는 관점에서 보자면, 함수가 어디에서 호출되건 관계없이 클로저는 함수가 선언된 원래의 환경에 대한 "숨겨진 링크"를 유지하여 함수가 클로저 내에 유지되는 변수들에 참조할 수 있도록 한다. 앞서 이러한 그림도 살펴본 적이 있다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/closure/visualizing_closures.png" alt="Visualizing Closures">
    <figcaption>출처: https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch7.md</figcaption>
</figure>

하지만 이러한 관점 이외에 다른 각도에서 클로저를 바라보는 관점도 존재한다. 이 관점에서는 함수가 인자로서 전달되는 특성에 좀 더 초점을 맞춰 우리의 사고 모델(mental model)을 더욱 견고하게 해준다.

이 관점은 "일급 객체로서의 함수"보다, 자바스크립트 내에서 함수는 레퍼런스 통해 할당되고, 인자로 전달된다는 사실에 더 초점을 둔다. 위 코드에 대해 말하자면, 내부 함수 인스턴스 `addTo()`가 `return`문을 통해 외부 스코프로 나와 변수(`add10To`, `add42To`)에 할당된다고 생각하기 보다, 함수 인스턴스들은 자기의 스코프 환경에 그대로 있다고 생각하는 것이다.

그럼 `return`문을 통해 외부 스코프로 보내지는 것은 무엇일까? 바로 함스 인스턴스의 **레퍼런스**이다. 즉, 함수 인스턴스 자체가 밖으로 나오는 것이 아니라, 함수 인스턴스는 제자리에 가만히 있고, 이 함수 인스턴스의 레퍼런스가 밖으로 나오는 것이다. 다음 그림이 이와 같은 상황을 묘사하고 있다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/closure/visualizing_closures_alt.png" alt="Visualizing Closures, an Alternative Perspective">
    <figcaption>출처: https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch7.md</figcaption>
</figure>

위 그림에서, `adder()`를 호출하면 여전히 `num1`변수가 저장된 새로운 스코프(파란색)를 생성한다. `addTo` 인스턴스의 스코프(초록색)도 마찬가지다. 하지만 앞선 그림과의 차이점은, 초록색 스코프는 여전히 파란색 스코프 안에 존재한다는 것이고, `addTo10`과 `addTo42` 레퍼런스만이 글로벌 스코프(분홍색)으로 나와 있다는 점이다.

`addTo10(15)`이 호출되면 여전히 파란색 내부에 존재하는 `addTo()` 함수 인스턴스가 호출된다. 물론 함수 인스턴스가 생성된 이후로 움직인 적이 없으므로 자연스럽게 이 함수 인스턴스의 스코프 체인에 접근할 수 있는 것이다. `addTo42(9)` 호출도 마찬가지다. 여기선 사실 렉시컬 스코프 이외에 어떠한 일도 벌어나지 않았다.

그럼 함수가 다른 스코프로 이동했을 때도 링크를 통해 원래의 스코프에 접근할 수 있는 것이 클로저가 아니라면 도대체 뭐가 클로저란 말인가? 지금 살펴보고 있는 모델에선 함수는 제자리에 가만히 있지 않은가?

이 관점에서의 클로저는, 어떤 함수 인스턴스에 대해 적어도 하나 이상의 (함수 인스턴스의) 함수 레퍼런스가 프로그램에 존재하는 한, 해당 함수 인스턴스가 자신의 스코프 환경을 유지한 채로 유지(alive)되는 것 이라고 할 수 있다.

물론 이러한 정의는 흔히 사용되는 클로저에 대한 정의와는 사뭇 다르다. 하지만 이 정의는 레퍼런스와 제자리(in-place)에 있는 함수 인스턴스로 클로저를 간단하게 설명할 수 있다는 점에서 유용하다고 할 수 있다.

물론 우리가 이전에 살펴본 모델이 틀렸다는것이 절대 아니다. 이전에 살펴본 정의는 좀 더 개념적이고, 학술적인 관점에서 클로저를 설명한 것이다. 반대로 지금 우리가 살펴보고 있는 모델은 좀 더 구현에 기반한, 자바스크립트가 실제로 동작하는 원리에 근거하여 클로저를 바라본 것이다.

## 왜 클로저를 사용하는가?

이제 클로저를 좀 알게 된거 같으니, 클로저를 활용하여 프로그램의 구조를 개선시키는 예시를 살펴보자.

어느 페이지에 있는 버튼을 누르게 되면 데이터를 취합하여 Ajax 통신을 하는 프로그램이 있다고 하자. 클로저를 사용하지 않으면 다음과 같이 코딩할 것이다:

```js
const APIendpoints = {
  studentIDs: 'https://some.api/register-students',
  // ..
}

const data = {
  studentIDs: [14, 73, 112, 6],
  // ..
}

function makeRequest(evt) {
  const btn = evt.target
  const recordKind = btn.dataset.kind
  ajax(APIendpoints[recordKind], data[recordKind])
}

// <button data-kind="studentIDs">
//    Register Students
// </button>
btn.addEventListener('click', makeRequest)
```

`makeRequest` 함수는 클릭 이벤트로 부터 `evt` 변수를 통해 이벤트 객체를 전달받는다. 그 후 타겟 버튼의 `data-kind` 속성에서 데이터를 얻어 이 데이터로 적절한 URL을 찾은 다음 Ajax 통신을 한다.

물론 이 프로그램은 잘 작동하지만, 이벤트 핸들러가 실행될 때마다 DOM 속성을 읽어야 한다는 단점이 있다. 이벤트 핸들러가 이 속성을 "기억"하는 방법이 없을까? 클로저를 이용하여 코드를 개선해보자:

```js
const APIendpoints = {
  studentIDs: 'https://some.api/register-students',
  // ..
}

const data = {
  studentIDs: [14, 73, 112, 6],
  // ..
}

function setupButtonHandler(btn) {
  const recordKind = btn.dataset.kind

  btn.addEventListener('click', function makeRequest(evt) {
    ajax(APIendpoints[recordKind], data[recordKind])
  })
}

// <button data-kind="studentIDs">
//    Register Students
// </button>

setupButtonHandler(btn)
```

여기선 `setupButtonHandler()`라는 외부 함수를 만들어서 `data-kind`의 값을 `recordKind` 변수에 저장시켰다. 이렇게 하면 추후에 `makeRequest()` 함수가 `recordKind` 변수를 클로저 내에 저장하여 이벤트가 발생할 때마다 DOM을 읽을 필요 없이 클로저에 있는 `recordKind`를 참조하게 되어 프로그램이 더욱 효율적으로 동작하게 된다. 또한, `recordKind` 변수를 `setupButtonHandler()` 함수 내에 둠으로써 이 변수의 노출을 최소화 하였다.

| 참고                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------ |
| 사실, 개선된 코드에서 `makeRequest` 함수로 전달된 `evt` 변수는 사용되지 않지만, 이전 코드와의 일관성을 위해 그대로 남겨놓았다. |

<br/>

이와 같은 패턴에 기반하여, `data-kind` 뿐만 아니라 알맞은 URL과 데이터 또한 저장하여 더욱 효율을 높일 수 있다:

```js
// const APIendpoints = { ... };
// const data = { ... };

function setupButtonHandler(btn) {
  const recordKind = btn.dataset.kind
  const requestURL = APIendpoints[recordKind]
  const requestData = data[recordKind]

  btn.addEventListener('click', function makeRequest(evt) {
    ajax(requestURL, requestData)
  })
}
```

더 개선된 코드에선 `recordKind`가 아니라 `requestURL`, `requestData`가 `makeRequest()` 함수의 클로저 내에 저장된다.

<br/>

클로저를 사용함으로써 얻을 수 있는 이점을 정리해보자면 다음과 같다.

- 함수 인스턴스가 이전에 사용한 데이터 등을 재활용할 수 있게 함으로써 프로그램의 효율성을 증대시킨다.
- 변수의 불필요한 노출을 최소화 함으로써 코드의 가독성을 증대시킨다.
