---
title: '자바스크립트 실행 컨텍스트'
date: 2022-02-23
category: 'JavaScript'
draft: false
---

⚠️ 이 포스트에서 "자바스크립트"라는 말은 사실 엄밀히 말해 "ECMAScript"를 말하는 것입니다. 하지만 편의를 위해 ECMAScript를 자바스크립트라고 하겠습니다.

## Environment Record

우선 자바스크립트의 실행 컨텍스트에 대해 살펴보기 전에, `Environment Record`에 대해 살펴봅시다.

`Environment Record`(이하 ER)는 자바스크립트 코드의 렉시컬 중첩 구조(lexical nesting structure)에 기반하여 식별자들을 특정 변수·함수의 값으로 바인딩하는 데 사용됩니다. ER은 자바스크립트 스펙 상으로만 존재하는 것이라 자바스크립트 프로그램에서 앞으로 살펴볼 값들에 접근하거나 이 값들을 조작하는 것은 불가능합니다.

일반적으로 ER은 함수 선언·블록 문·Try 문·Catch 절과 같이, 자바스크립트 코드의 특정 문법 구조와 연관되어 있습니다. 이러한 코드가 평가(혹은 실행, evaluate)될 때마다 해당 코드에 의해 생성된 식별자들을 바인딩하기 위해 새로운 ER이 생성됩니다. 이때 식별자를 바인딩한다는 말은 쉽게 말해 해당 식별자의 정보를 기록, 즉 식별자의 값을 기록한다고 할 수 있습니다.

모든 ER은 해당 ER을 논리적으로 감싸는(surround) 바깥 ER, 즉 부모 ER을 가리키는(참조하는) `[[OuterEnv]]`라는 필드를 가집니다. 만약 글로벌 영역과 같이 외부 ER이 없다면 `[[OuterEnv]]`의 값은 `null`입니다. 또한, 어떤 함수 내부에 여러 개의 중첩 함수들이 정의될 수 있는것처럼, 어떤 ER이 여러 개의 내부 ER에 대한 외부 ER의 역할을 할 수도 있습니다. 이와 같은 경우 각 내부 함수 선언의 ER은 해당 내부 함수들을 감싸고 있는 외부 ER을 `[[OuterEnv]]`의 값으로 가집니다.

### Environment Record 타입 구조

객체 지향 모델로 비유하자면 ER는 3개의 구상 클래스(concrete class)를 가지는 추상 클래스(abstract class)로 볼 수 있습니다. 이러한 구조를 그림으로 나타내면 아래와 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/iterator-protocol/environment_record_hierarchy.png" alt="Environment Record 계층">
    <figcaption>Environment Record 계층.</figcaption>
</figure>

- **declarative ER**: 변수·함수 선언 등을 바인딩하는 역할을 합니다. declarative ER은 또다시 두 개의 자식 클래스로 나뉩니다:
  - **function ER**: 어떤 함수 내의 최상위 스코프(top-level)에 존재하는 식별자들을 바인딩합니다. 만약 이 함수가 화살표 함수가 아니라면 `this` 바인딩도 같이 수행합니다. 또, 화살표 함수가 아니면서 `super` 메서드를 참조하고 있다면 `super` 메서드 호출에 필요한 상태 또한 가집니다.
  - **module ER**: 어떤 모듈의 최상위 스코프에 존재하는 식별자들을 바인딩 합니다. 또한, 이 모듈이 명시적으로 `import` 한 바인딩에 대한 정보도 가집니다. module ER의 `[[OuterEnv]]` 는 global ER을 가리킵니다.
- **object ER**: 각 object ER은 *바인딩 객체(binding object)*라고 하는 객체와 연결됩니다. object ER은 바인딩 객체의 "문자열" 식별자들을 바인딩하는데, 문자열이 아닌 속성 key들은 바인딩 되지 않습니다. 또한, 객체의 속성은 동적으로 추가되거나 제거될 수 있기 때문에 object ER에 의해 바인딩된 식별자는 속성을 추가하거나 제거하는 연산에 의해 변경될 수도 있습니다.
- **global ER**: 글로벌 스코프에 존재하는 식별자들을 바인딩 합니다. 즉, built-in 객체, 전역 객체(global object)의 속성 및 글로벌 스코프 내의 모든 식별자를 바인딩하는 역할을 합니다. global ER은 이론상으론 하나의 레코드이나 실질적으론 declarative 및 object ER 두 개로 구성됩니다. global ER의 `[[OuterEnv]]`는 `null`입니다.

또한, 방금 살펴본 ER 외에도 `PrivateEnvironment Record`라는 것이 존재합니다. 이 레코드에는 클래스의 private 속성·메서드·접근자(accessor)에 관한 정보가 저장됩니다.

## 실행 컨텍스트 (Execution Context)

💡 여기서부턴 실행 컨텍스트를 "EC"라고 줄여서 표시하겠습니다.

자바스크립트의 코드에는 크게 4가지 종류가 있습니다:

- 글로벌 코드
- Eval 코드
- 함수 코드
- 모듈 코드

이러한 코드들은 각자의 EC에서 실행되는데, 이때 EC에는 컨텍스트 내부 코드들의 진행 상황(progress)을 기록하기 위한 상태들이 저장됩니다. 쉽게 말해, EC는 자바스크립트 코드를 실행하는데에 필요한 정보들이 저장되는 객체라고도 볼 수 있습니다.

각 EC들은 최소한 아래의 상태를 가집니다:

|**구성 요소**|**목적**|
|-|-|
|code evaluation state|이 EC와 연관된 코드를 실행·중단(suspend)·실행 재개(resume)하는데 필요한 상태들입니다.|
|Function|만약 이 EC가 함수 객체의 코드를 실행(evaluate) 중이라면 이 구성 요소의 값은 해당 함수 객체가 됩니다. 스크립트 혹은 모듈과 같이 함수 객체가 아닌 이외의 코드를 실행 중이라면 이 구성 요소의 값은 `null`이 됩니다. 이때, 현재 실행 중인 EC(running EC)의 Function 구성 요소 값을 *active function object* 라고도 합니다.|
|Realm|이 EC와 연관된 코드가 자바스크립트 리소스에 접근하는 Realm Record입니다. 이때, 현재 실행 중인 EC의 Realm 구성 요소 값을 *current Realm Record* 라고도 합니다. Realm에 대한 내용은 [여기](https://stackoverflow.com/questions/49832187/how-to-understand-js-realms)를 참고해 주세요.|
|ScriptOrModule|이 EC와 연관된 코드가 유래(originate)된 Module Record 혹은 Script Record를 가리킵니다. 만약 유래된 스크립트나 모듈이 없다면 이 구성 요소의 값은 `null`이 됩니다.

### 실행 컨텍스트 스택 (Execution Context Stack)

EC들은 EC 스택에 의해 관리되는데, EC 스택은 EC들의 제어(control) 흐름과 실행 순서 등을 관리하기 위해 사용되는 LIFO 구조입니다. 현재 실행 중인(running) EC는 스택의 맨 꼭대기(top)에 위치합니다.

함수를 호출하는 경우와 같이, "제어권"이 현재 실행 중인 EC의 코드에서 현재 실행 중인 EC와 관련 없는 EC의 코드로 넘어갈 때 새로운 EC가 생성됩니다. 이렇게 새로 생성된 EC는 EC 스택의 맨 꼭대기에 push 됨과 동시에 현재 실행 중인 EC가 됩니다. 이때 다른 EC를 호출하는 EC를 `caller`, 다른 EC에 의해 호출되는 EC를 `callee`라고 합니다.

EC 스택의 예시를 한번 살펴봅시다:

```js
let a = 1;

function foo() {
	let b = 2;
	
	function bar() {
		let c = 3;
		console.log(a + b + c) // 6;
	}
	bar();
}
foo();
```

위 예제 코드 실행 시 EC들이 생성되고 사라지는 과정을 그림으로 나타내면 다음과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/iterator-protocol/ec_example.png" alt="EC 예시">
    <figcaption>EC 예시.</figcaption>
</figure>

1. 최초에 프로그램이 실행되어 제어권이 전역 코드에 진입하면 전역 EC가 생성되어 EC 스택에 쌓입니다. 이때, 전역 EC는 프로그램이 종료될 때까지 유지됩니다.
2. 함수를 호출하면 해당 함수의 함수 EC가 생성되어 EC 스택에 쌓입니다.
3. 이렇게 호출되어 실행 중인 함수(즉, 현재 실행 중인 EC)가 종료되면 해당 함수의 함수 EC가 스택으로부터 제거되고 직전 EC로 제어권이 넘어갑니다. 이때 함수는 정상적으로 `return` 문을 통해 EC를 종료할 수도 있고, 혹은 에러와 함께 비정상적으로 종료될 수도 있습니다. 만약 에러와 함께 비정상적으로 종료되는 경우 다른 여러 개의 EC도 같이 종료될 수 있습니다.

일반적으로 EC에서 실행되는 코드는 **run to completion**의 특성을 가집니다. 즉, 해당 코드가 완전히 실행되어 종료될 때까진 중간에 다른 코드(다른 EC)가 끼어들지 못합니다.

하지만 제너레이터의 `yield`나 `async` 함수의 `await`과 같이, 특정 순간에 현재 실행 중인 EC가 잠시 중단(suspend)되는 경우도 있습니다. 이 경우 해당 EC에서 실행되는 코드 실행이 잠시 중단되어 이 코드의 모든 부분이 다 실행되기 전에 EC 스택에서 제거될 수 있습니다. 일반적으로 EC가 스택에서 제거되면 사라지지만 이 경우 아직 모든 실행을 끝마친 것이 아니므로 따로 저장되어 추후 실행을 재개(resume)할 때 다시 스택에 쌓이게 됩니다.

### Environment

EC는 앞서 살펴봤던 기본 4가지 구성 요소 이외에 아래의 구성 요소를 추가로 갖습니다:

|**구성 요소**|**목적**|
|-|-|
|LexicalEnvironment|EC 내의 코드에 존재하는 식별자들의 값을 매핑하는데 사용된 Environment Record를 가리킵니다.|
|VariableEnvironment|VariableStatements에 의해 생성된, EC 내의 코드에 존재하는 식별자들의 값을 매핑하는데 사용된 Environment Record를 가리킵니다. ES6를 기준으로 LexicalEnvironment와 다른 점은 LexicalEnvironment에는 함수 선언·let·const 변수들의 바인딩에 관한 정보들이 저장되는 반면, VariableEnvironment에는 오직 var 변수들의 바인딩에 관한 정보들이 저장됩니다.|
|PrivateEnvironment|EC 내의 클래스의 private 필드·메서드·접근자에 대한 정보를 저장합니다. 만약 EC 내에 클래스가 없다면 `null`입니다.|

## 레퍼런스

- https://tc39.es/ecma262/
- https://blog.bitsrc.io/understanding-execution-context-and-execution-stack-in-javascript-1c9ea8642dd0
- https://meetup.toast.com/posts/129
- https://homoefficio.github.io/2016/01/16/JavaScript-%EC%8B%9D%EB%B3%84%EC%9E%90-%EC%B0%BE%EA%B8%B0-%EB%8C%80%EB%AA%A8%ED%97%98/
