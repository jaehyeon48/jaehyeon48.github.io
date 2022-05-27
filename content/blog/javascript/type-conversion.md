---
title: '자바스크립트의 타입 변환'
date: 2022-04-08
category: 'JavaScript'
draft: false
---

자바스크립트의 연산들은 특정 타입에 대해서 수행됩니다. 만약 어떤 연산에 대해 연산자가 기대하는 것과는 다른 타입의 입력을 주게 되면 (예를 들어 덧셈 `+` 연산의 피연산자로 객체를 사용하는 경우) 자바스크립트는 해당 입력의 타입을 자동으로 변환합니다. 이를 암묵적인(implicit) 타입 변환, 혹은 강제 타입 변환(type coercion)이라고도 하는데, 자바스크립트가 과연 어떻게 타입을 자동으로 변환하는지에 대해 살펴봅시다.

일단 그 전에, 먼저 다음의 두 함수를 살펴봅시다. 아래 두 함수는 스펙 상에서만 존재하는 함수입니다:

```ts
// typeof 연산자와 전체적으로 비슷한 동작을 하지만, 아래 TypeOf 함수의 경우
// typeof 와는 달리 함수의 타입을 'object'로, null의 타입을 'null'로 판정합니다.

function TypeOf(value) {
  const result = typeof value;
  if (result === 'function') return 'object';
  if (result === 'object' && value === null) return 'null';
  return result;
}
```

```ts
// 함수의 이름에서 알 수 있듯, '호출 가능한'값 즉 함수인지를 판별합니다.
function IsCallable(value) {
  return typeof value === 'function';
}
```

## ToPrimitive()

`ToPrimitive()`는 스펙상으로만 존재하는 추상 연산(abstract operation)으로서, 추후에 살펴볼 많은 타입 변환 알고리즘에서 사용됩니다. 이름에서 알 수 있듯이, 이 연산은 아무 타입의 입력을 받아 해당 입력을 원시 타입으로 변환하는 작업을 수행합니다. 이때 두 개 이상의 서로 다른 원시 타입으로 변환될 수 있는 객체 타입의 경우, 두 번째 인자 `preferredType`을 통해 어떤 타입으로 변환하는 것을 선호하는지 일종의 힌트를 제공할 수 있습니다. `preferredType`으로 제공될 수 있는 값은 `string`, `number` 두 가지 입니다.

 스펙에 명시된 알고리즘을 자바스크립트 코드로 변환해보면 아래와 같습니다:

```js
function ToPrimitive(input, preferredType = 'default') {
  if (TypeOf(input) === 'object') {
    let exoticToPrim = input[Symbol.toPrimitive];

    if (exoticToPrim === undefined) {
      if (preferredType === 'default') preferredType = 'number';
      return OrdinaryToPrimitive(input, preferredType);
    }

    let result = exoticToPrim(input, preferredType);
    if (TypeOf(result) === 'object') throw new TypeError();
    return result;
  } else return input; // 주어진 입력이 원시 타입인 경우
}
```

위 코드와 같이, 힌트(`preferredType`)가 주어지지 않은 경우, 일반적으로 `ToPrimitive`는 힌트를 `number`로 가정하고 동작을 수행합니다. 하지만 이는 객체의 [Symbol.toPrimitive](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive) 속성을 통해 변경할 수 있는데, 자바스크립트의 내장 객체 중에선 `Symbol` 객체와 `Date` 객체만이 이 속성을 정의하고 있습니다. `Date` 객체의 경우, 힌트가 주어지지 않으면 힌트를 `string` 으로 가정하고 동작을 수행합니다.

만약 `ToPrimitive`에 전달된 `input`이 객체이고, 이 객체에 `[Symbol.toPrimitive]`가 정의되지 않았다면 `OrdinaryToPrimitive` 추상 연산을 통해 타입 변환 동작을 마무리합니다:

```js
function OrdinaryToPrimitive(obj, hint) {
  let methodNames = hint === 'string'
    ? ['toString', 'valueOf']
    : ['valueOf', 'toString'];

  for (let methodName of methodNames) {
    let method = obj[methodName];
    if (IsCallable(method)) {
      let result = method(obj);
      if (TypeOf(result) !== 'object') return result;
    }
  }

  throw new TypeError();
}
```

이처럼 객체에 `[Symbol.toPrimitive]`가 정의되지 않은 경우 `ToPrimitive` 연산을 거쳐 최종적으로 `OrdinaryToPrimitive` 연산을 통해 객체가 원시 타입으로 변환 (혹은 타입 에러 발생) 됩니다. 이때,

- "힌트"가 `string`인 경우, 객체의 `toString` 메서드가 먼저 호출됩니다.
- "힌트"가 `number`인 경우, 객체의 `valueOf` 메서드가 먼저 호출됩니다.

예시:

```js
const myObj = {
  toString() { return 'hello, world!'; },
  valueOf() { return 123; }
};

// String()의 경우, 내부적으로 'string' 힌트를 사용합니다.
console.log(String(myObj)); // "hello, world"

// Number()의 경우, 내부적으로 'number' 힌트를 사용합니다.
console.log(Number(myObj)); // 123
```

만약 처음으로 호출한 메서드가 객체를 반환한다면 그다음 메서드 (힌트가 `string`인 경우 `valueOf`, 힌트가 `number`인 경우 `toString`)를 호출하여, 해당 메서드가 반환한 값을 이용해 타입 변환을 수행합니다:

```js
const myObj1 = {
  toString() { return {}; },
  valueOf() { return 123; }
};
// 처음엔 myObj1의 toString()을 호출하는데, 이 메서드가 객체를 반환하므로 
// 그다음으로 valueOf()를 호출하여 그 결과값 123(숫자 타입)을
// "123"(문자열)으로 변환합니다. 즉, String(123)을 하는 것과 같습니다.
console.log(String(myObj1)); // "123"


const myObj2 = {
  toString() { return 'hello, world'; },
  valueOf() { return []; }
};
// 처음엔 myObj2의 valueOf()를 호출하는데, 이 메서드가 객체를 반환하므로
// 그다음으로 toString()을 호출하여 그 결과값 'hello, world'를
// 숫자 타입으로 변환합니다. 이때 'hello, world'를 숫자 타입으로 변환하면 NaN 이므로
// 최종 결과로 NaN이 반환됩니다. 즉, Number('hello, world')와 같습니다.
console.log(Number(myObj2)); // NaN


const myObj3 = {
  toString() { return '456.123'; },
  valueOf() { return []; }
}
// 처음엔 myObj3의 valueOf()를 호출하는데, 이 메서드가 객체를 반환하므로
// 그다음으로 toString()을 호출하여 그 결과값 '456.123'을
// 숫자 타입으로 변환합니다. 이때 문자열 '456.123'을 숫자 타입으로 변환하면 456.123 이므로
// 최종 결과로 456.123이 반환됩니다. 즉, Number('456.123')과 같습니다.
console.log(Number(myObj3)); // 456.123
```

### [object Object]

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/type-conversion/object_object_error.png" alt="JavaScript [object Object]" />
    <figcaption>출처: https://forum.osticket.com/d/87852-equipment-error-object-object-instead-of-usernames-in-dropdown-menu</figcaption>
</figure>

아마 자바스크립트를 사용하시면서 `[object Object]`를 보신 적이 있으실 겁니다. 이는 객체의 `toString()` 기본 동작이 `[object Type]`을 반환하는것이기 때문에 발생하는 현상입니다. 이때 `[object Type]` 에서 `Type`은 인자로 전달된 객체의 타입을 의미합니다. 예를 들어, 다음과 같이 `Object.prototype`에 정의된 `toString()`을 이용하여 다음과 같이 타입을 살펴볼 수 있습니다:

```js
console.log(Object.prototype.toString.call(null)); // [object Null]
console.log(Object.prototype.toString.call(undefined)); // [object Undefined]
console.log(Object.prototype.toString.call(new Date)); // [object Date]
console.log(Object.prototype.toString.call(new Set)); // [object Set]
console.log(Object.prototype.toString.call(new Map)); // [object Map]
console.log(Object.prototype.toString.call(new Number)); // [object Number]
console.log(Object.prototype.toString.call(new String)); // [object String]
console.log(Object.prototype.toString.call([])); // [object Array]
console.log(Object.prototype.toString.call({})); // [object Object]
console.log(Object.prototype.toString.call(function() {})); // [object Function]
console.log(Object.prototype.toString.call(Symbol('1'))); // [object Symbol]
console.log(Object.prototype.toString.call(123n)); // // [object BigInt]
console.log(Object.prototype.toString.call(Math)); // [object Math]
console.log(Object.prototype.toString.call(new ArrayBuffer)); // [object ArrayBuffer]
// ...
```

위와 같이 객체의 `toString()` 메서드 기본 동작이 `[object Type]` 문자열을 반환하는 것이기 때문에, 실수로 다음과 같은 동작을 수행하게 되는 경우 `[object Object]`와 같은 결과를 보게 됩니다:

```js
const myObj = {
  // ...
};

console.log(`${myObj} is awesome!`); // [object Object] is awesome!
```

덧셈과 관련한 자바스크립트의 대표적인 이상행동(?) 또한 이와 관련되어 있습니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/type-conversion/why_javascript_behaves_like_that.jpg" alt="자바스크립트는 왜 그모양일까" style="width:471px; height: 600px" />
    <figcaption>자바스크립트는 왜 그모양일까... 출처: http://www.yes24.com/Product/Goods/90283410</figcaption>
</figure>

자바스크립트에서 덧셈(+)연산은, 크게 두 가지 동작을 수행합니다. 만약 두 피연산자의 타입이 모두 숫자인 경우 수학에서의 덧셈 연산을, 두 피연산자 중 하나라도 문자열인 경우 문자열 이어붙이기(concatenation) 동작을 수행합니다. 또, 객체 타입이 피연산자로 주어지는 경우 힌트를 'default'로 설정하여 해당 객체를 원시 타입으로 변환한 뒤 연산을 수행합니다. 다음을 살펴봅시다:

```js
const myObj = {
  // ...
};
console.log(myObj + '1'); // [object Object]
```

우선 덧셈 연산을 수행하기 전에, `myObj`의 타입이 객체이므로 이를 원시 타입으로 (암묵적으로) 변환합니다. 이때 힌트를 `default`로 설정하여 `ToPrimitive` 알고리즘을 실행하는데, 그 말인 즉 힌트를 `number`로 가정하고 `OrdinaryToPrimitive` 알고리즘을 실행하게 됩니다. 따라서 `myObj`의 `valueOf()` 메서드가 먼저 실행되는데, 이때 객체의 `valueOf()` 메서드의 기본 동작이 자기 자신을 반환하는 것이므로 `valueOf()`의 실행 결과로 객체인 `myObj`가 반환됩니다. 따라서 그다음으로 `myObj`의 `toString()` 메서드가 실행되는데, 앞서 살펴봤듯이 객체의 `toString()`의 기본 동작은 `"[object Type]"` 문자열을 반환하는 것이므로 여기선 `"[object Object]"` 문자열이 반환됩니다.

최종적으로 정리하자면 `myObj` 객체가 `"[object Object]"` 원시 타입(문자열)으로 자동 변환되어 문자열 `'1'`과 이어 붙이는 연산을 수행해서 `myObj + '1'`의 결과로 `"[object Object]1"`이 반환됩니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/type-conversion/object_conversion1.png" alt="암묵적 객체 변환1" />
</figure>

만약 위 예제에서, `myObj` 객체에 `valueOf()`, `[Symbol.toPrimitive]` 등의 메서드를 따로 구현하면 아래와 같은 결과가 나옵니다:

```js
// valueOf()를 따로 구현한 경우
const myObj1 = {
  valueOf() { return 2; }
};

// valueOf() 호출 시 원시 타입인 숫자 2를 반환하므로 암묵적 변환의 결과로 myObj1이 2로 변한됩니다.
// 여기선 덧셈 연산의 두 번째 피연산자가 문자열이므로 2를 다시 문자열 "2"로 변환하여 문자열 이어붙이기를
// 수행하게 됩니다. 따라서 최종 결과는 "21"이 됩니다.
console.log(myObj1 + '1'); // "21"

// [Symbol.toPrimitive]를 따로 구현한 경우
const myObj2 = {
  valueOf() { return 2; },
  [Symbol.toPrimitive]() { return 100; }
};

// 이 경우 myObj2가 [Symbol.toPrimitive] 메서드를 가지고 있기 때문에, ToPrimitive 추상 연산에서
// OrdinaryToPrimitive 추상 연산으로 넘어가지 않고, [Symbol.toPrimitive] 메서드를 실행하여
// 변환을 수행합니다. 따라서 myObj2가 원시 타입인 숫자 100으로 변환되고 여기선 덧셈 연산의 두 피연산자
// 모두 숫자이므로 수학에서의 덧셈 연산을 수행하여 최종 결과가 100 + 1 = 101이 됩니다.
console.log(myObj2 + 1); // 101
```

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/javascript/type-conversion/object_conversion2.png" alt="암묵적 객체 변환2" />
</figure>

## [Symbol.toPrimitive] 메서드가 구현된 내장 객체

앞서 `ToPrimitive` 섹션에서 살펴봤듯이 `ToPrimitive` 추상 연산을 수행할 때 힌트가 주어지지 않으면 (즉, 힌트가 `default` 이면), 그리고 객체에 `[Symbol.toPrimitive]` 메서드가 정의되지 않으면 힌트를 `number`로 가정하고 타입 변환을 수행한다는 것을 살펴봤었습니다.

하지만 자바스크립트에서 기본적으로 제공되는 내장 객체중에 `Date` 객체와 `Symbol` 객체는 자체적으로 `[Symbol.toPrimitive]` 메서드를 가지고 있어 타입 변환을 할 때 이 메서드가 사용됩니다. 이들을 하나씩 살펴봅시다.

### Date.prototype\[Symbol.toPrimitive\]\(hint\)

`Date` 객체에 정의된 `[Symbol.toPrimitive]` 메서드는 인자로 `hint`를 넘겨받아 변환을 수행합니다. 스펙에 정의된 메서드의 내용을 자바스크립트로 구현해보면 아래와 같습니다:

```js
Date.prototype[Symbol.toPrimitive] = function(hint) {
  let o = this;
  if (TypeOf(o) === 'object') throw new TypeError();
  if (hint !== 'string' && hint !== 'number' && hint !== 'default') {
    throw new TypeError();
  }

  let tryFirst = hint === 'number'
    ? 'number'
    : 'string';
  return OrdinaryToPrimitive(o, tryFirst);
}
```

이 알고리즘을 살펴봤을 때, 기존의 `ToPrimitive`와 다른 점은 `Date` 객체를 원시 타입으로 변환할 때 힌트가 `default` 이면 `number`가 아니라 `string`으로 간주한다는 점입니다. 이후 `OrdinaryToPrimitive`를 호출하여 변환을 이어 나간다는 점에선 기존과 같습니다. 즉, 일반 객체와 같이 `Date` 객체의 `toString()`, `valueOf()` 메서드를 호출하여 `Date` 객체를 원시 타입으로 변환합니다.

[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toString#description)에서 살펴볼 수 있듯이, `Date` 객체의 `toString()` 메서드는 해당 `Date` 객체의 날짜를 나타내는 문자열로 변환하고, `valueOf()` 메서드는 1970년 1월 1일 00:00:00 UTC를 기준으로 몇 *밀리초*가 지났는지를 나타내는 숫자를 반환합니다:

```js
const myDate = new Date('2020-01-01');
// 힌트를 'default', 즉 'string'으로 하여 Date 객체를 변환합니다.
console.log(myDate + 'hello, world!'); // Wed Jan 01 2020 09:00:00 GMT+0900 (Korean Standard Time)hello, world!

// Date 객체의 변환 결과가 문자열이므로 숫자 123을 문자열 "123"으로 변환한 뒤 문자열 이어붙이기 연산을 수행합니다.
console.log(myDate + 123); // Wed Jan 01 2020 09:00:00 GMT+0900 (Korean Standard Time)123


/* [Symbol.toPrimitive] 메서드를 명시적으로 사용하여 힌트를 직접 지정할 수도 있습니다. */
// 힌트가 'number'인 경우 Date 객체의 valueOf()을 이용하여 변환을 마무리합니다.
console.log(myDate[Symbol.toPrimitive]('number')); // 1577836800000

// 힌트가 'string'인 경우 Date 객체의 toString()을 이용하여 변환을 마무리합니다.
console.log(myDate[Symbol.toPrimitive]('string')); // Wed Jan 01 2020 09:00:00 GMT+0900 (Korean Standard Time)

// 힌트가 'default'인 경우 힌트를 'string'으로 간주합니다.
console.log(myDate[Symbol.toPrimitive]('default')); // Wed Jan 01 2020 09:00:00 GMT+0900 (Korean Standard Time)
```

### Symbol.prototype\[Symbol.toPrimitive\]\(\)

`Symbol`의 경우 간단합니다. 특정 심볼에 대해 `[Symbol.toPrimitive]()` 메서드를 호출하면 해당 심볼을 그대로 반환하는 것이 전부입니다. 왜냐면 **심볼 자체가 원시 타입**이기 때문이죠! 심볼의 경우 힌트는 사용되지 않습니다.

```js
const mySymbol = Symbol('hello, world!');
// 심볼은 그 자체로 원시 타입이므로 자기 자신을 반환합니다.
console.log(mySymbol[Symbol.toPrimitive]()); // Symbol(hello, world!)
console.log(mySymbol[Symbol.toPrimitive]() === mySymbol); // true

// 힌트는 사용되지 않습니다.
console.log(mySymbol[Symbol.toPrimitive]('number')); // Symbol(hello, world!)
console.log(mySymbol[Symbol.toPrimitive]('string')); // Symbol(hello, world!)
console.log(mySymbol[Symbol.toPrimitive]('default')); // Symbol(hello, world!)
console.log(mySymbol[Symbol.toPrimitive]('hey')); // Symbol(hello, world!)

// 심볼의 valueOf() 메서드는 자기 자신을 반환합니다
console.log(mySymbol.valueOf() === mySymbol) // true;

// 심볼의 toString() 메서드는 해당 심볼을 나타내는 문자열을 반환합니다.
console.log(mySymbol.toString()) // "Symbol(hello, world)"
```

## 레퍼런스

- [ECMAScript® 2023 Language Specification](https://tc39.es/ecma262/#sec-type-conversion)
- [Type coercion in JavaScript](https://2ality.com/2019/10/type-coercion.html)
- [MDN Web Docs](https://developer.mozilla.org/en-US/)
