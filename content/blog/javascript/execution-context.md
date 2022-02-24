---
title: '자바스크립트 실행 컨텍스트'
date: 2022-02-23
category: 'JavaScript'
draft: false
---

⚠️ 이 포스트에서 "자바스크립트"라는 말은 사실 엄밀히 말해 "ECMAScript"를 말하는 것입니다. 하지만 편의를 위해 ECMAScript를 자바스크립트라고 하겠습니다.

## Environment Record(환경 레코드)

우선 자바스크립트의 실행 컨텍스트에 대해 살펴보기 전에, **Environment Record(환경 레코드)**에 대해 살펴봅시다.

**환경 레코드**는 자바스크립트 코드의 렉시컬 중첩 구조(lexical nesting structure)에 기반하여 식별자들을 특정 변수·함수값으로 바인딩하는 데 사용됩니다. 즉, 환경 레코드는 어떤 렉시컬 환경(쉽게 말해, 렉시컬 스코프라고 생각해도 될 것 같습니다)에서 생성된 식별자들의 바인딩 정보를 "기록(record)"하는 저장소라고 할 수 있습니다. 환경 레코드는 자바스크립트 스펙 상으로만 존재하는 추상 개념이라 자바스크립트 프로그램에서 환경 레코드에 접근하는 것은 불가능합니다.

일반적으로 환경 레코드는 함수 선언·블록 문·Catch 절과 같은 자바스크립트 코드의 특정 문법 구조와 관련됩니다. 이와 같은 코드들이 평가(혹은 실행, evaluate)될 때마다 해당 코드에 의해 생성된 식별자들의 바인딩 정보를 기록하기 위해 새로운 환경 레코드가 생성됩니다. 이때 식별자를 *바인딩*한다는 말은 식별자(이름)를 값에 대응(associate)시키는 것이라고 볼 수 있습니다.

모든 환경 레코드는 해당 환경 레코드를 논리적으로 감싸는(surround) 바깥 환경 레코드, 즉 부모 환경 레코드를 가리키는(참조하는) `[[OuterEnv]]`라는 필드를 가집니다. 만약 글로벌 영역과 같이 외부 환경 레코드가 없다면 `[[OuterEnv]]`의 값은 `null`입니다. 또한, 어떤 함수 내부에 여러 개의 중첩 함수들이 정의될 수 있는 것처럼, 하나의 환경 레코드가 여러 개의 내부 환경 레코드에 대한 외부 환경 레코드의 역할을 할 수도 있습니다. 이 같은 경우 각 내부 함수의 환경 레코드는 해당 내부 함수들을 감싸고 있는 외부 환경 레코드를 `[[OuterEnv]]`의 값으로 가집니다.

### 환경 레코드 타입 구조

객체 지향 모델로 비유하자면 환경 레코드는 3개의 구상 클래스(concrete class)를 가지는 추상 클래스(abstract class)로 볼 수 있습니다. 이러한 구조를 그림으로 나타내면 아래와 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/execution-context/environment_record_hierarchy.png" alt="환경 레코드 계층">
    <figcaption>환경 레코드 계층.</figcaption>
</figure>

#### 선언 환경 레코드

**선언 환경 레코드(declarative Environment Record)**는 변수 선언·함수 선언·함수 인자 등의 바인딩 정보를 기록합니다. 예를 들면,

```ts
// "a", "b", "c" 식별자 바인딩 모두 선언 환경 레코드에 저장됩니다
function foo(a) {
  let b = 10;
  function c() {}
}

// catch 절의 예외 인자 "e"의 바인딩 또한 선언 환경 레코드에 저장됩니다
try {
  // ...
} catch(e) {
  // ...
}
```

일반적으로 선언 환경 레코드의 바인딩들은 가상 머신의 레지스터와 같이 "로우 레벨"에 저장되는 것으로 여겨집니다. 즉, 스펙에선 이를 단순한 객체와 같은 형태로 구현할 것을 요구하고 있지 않습니다(오히려 이러한 형태로 구현하지 말 것을 간접적으로 권장하고 있습니다). 왜냐면 비효율적일 수 있기 때문이죠.

선언 환경 레코드는 [lexical addressing](https://mitpress.mit.edu/sites/default/files/sicp/full-text/sicp/book/node131.html)기법을 사용하여 변수 접근을 최적화할 수도 있습니다. 즉 스코프의 중첩 깊이에 관계없이, 스코프 체인을 찾아보지 않고 원하는 변수에 바로 접근하는 것이죠. 물론 스펙에서 이를 직접 언급하고 있지는 않습니다.

|💡 **Activation Object**|
|-|
|선언 환경 레코드에 대한 개념은 ES5에 나온 개념이고, 그 이전의 ES3 까진 *activation object* 라는 개념이 사용됐었습니다. 실제로 activation object에선 객체를 이용하여 이와 같은 정보들을 저장했는데, 자바스크립트 창시자인 [Brendan Eich에 의하면](https://mail.mozilla.org/pipermail/es-discuss/2010-April/010915.html) 이는 실수라고 합니다. 1995년 자바스크립트 개발 당시, 개발을 서두르기 위해 이렇게 했다고 하네요. 따라서 이러한 역사를 살펴봤을 때, 선언 환경 레코드가(activation object를 대체하기 위해) 등장한 이유는 구현의 효율성을 증대하기 위함이라고 볼 수 있을 것 같습니다.|

선언 환경 레코드는 또다시 두 개의 자식 클래스로 나뉩니다.

- **함수 환경 레코드(function Environment Record)**: 어떤 함수 내의 최상위 스코프(top-level)에 존재하는 식별자들의 바인딩을 저장합니다. 만약 이 함수가 화살표 함수가 아니라면 `this` 바인딩도 같이 저장합니다. 또, 화살표 함수가 아니면서 `super` 메서드를 참조하고 있다면 `super` 메서드 호출에 필요한 상태 또한 저장합니다.
- **모듈 환경 레코드(module Environment Record)**: 어떤 모듈의 최상위 스코프에 존재하는 식별자들의 바인딩을 저장합니다. 또한, 이 모듈이 명시적으로 `import` 한 바인딩에 대한 정보도 저장합니다. 모듈 환경 레코드의 `[[OuterEnv]]` 는 글로벌 환경 레코드를 가리킵니다.

#### 객체 환경 레코드

**객체 환경 레코드(object Environment Record)**는 객체의 "문자열" 식별자들의 바인딩을 저장하는데, 이 바인딩들이 저장되는 객체를 *바인딩 객체(binding object)*라고 합니다. 문자열이 아닌 식별자들은 저장되지 않습니다. 또한 자바스크립트에서 객체의 속성은 동적으로 추가되거나 제거될 수 있으므로, 객체 환경 레코드에 저장된 식별자 바인딩들은 속성을 추가하거나 제거하는 연산에 의해 변경될 수도 있습니다.

#### 글로벌 환경 레코드

**글로벌 환경 레코드(global Environment Record)**는 글로벌 컨텍스트(스코프)에 존재하는 식별자들의 바인딩을 저장합니다. 즉, built-in 객체들, 전역 객체의 속성들과 더불어 글로벌 스코프 내의 모든 식별자들의 바인딩을 저장합니다. 이론상으로 글로벌 환경 레코드는 하나의 레코드이지만, 실질적으로 선언 환경 레코드 및 객체 환경 레코드로 구성되어 있습니다. 글로벌 환경 레코드의 `[[OuterEnv]]`는 `null` 입니다.


또한, 여기에서 살펴본 환경 레코드들 외에도 `PrivateEnvironment Record`라는 것이 존재합니다. 이 레코드에는 클래스의 private 속성·메서드·접근자(accessor)에 관한 정보가 저장됩니다.

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
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/execution-context/ec_example.png" alt="EC 예시">
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
- https://dmitrysoshnikov.com/ecmascript/es5-chapter-3-1-lexical-environments-common-theory
- http://dmitrysoshnikov.com/ecmascript/es5-chapter-3-2-lexical-environments-ecmascript-implementation/
