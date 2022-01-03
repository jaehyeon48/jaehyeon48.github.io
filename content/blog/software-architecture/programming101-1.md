---
title: '프로그래밍 초식 요약 - 변수 아끼기'
date: 2021-12-07
category: 'Software Architecture'
draft: false
---

이 글은 [최범균님의 프로그래밍 초식 시리즈](https://www.youtube.com/watch?v=kRdML08R2Yo&list=PLwouWTPuIjUg0dmHoxgqNXyx3Acy7BNCz)을 요약한 글입니다.

<hr class="custom-hr">

## 인지 부하

종종 다음과 같은 형태의 코드를 만날 수 있다:

```js
/* 변수를 미리 선언 */
let name = User1.getName()
let age = 0

// ...

/* 변수를 중간에 변경 */
age = Date.getFullYear() - User1.getBirthYear()

// ...

/* 변수 사용 */
console.log(`이름: ${name}`)
console.log(`나이: ${age}`)
```

```js
/* 변수의 용도와 의미를 바꿔 가면서 사용 */
let value = someOp()

if (value === 0) {
  value = someOp2()
}

value = someOp3()

// ...
```

위 예시들과 같이 변수를 (코드 기준으로) 긴 범위에서 사용한다든가, (어떤 메소드 내에) 변수의 개수가 많거나 계속 증가한다든가, 변수의 용도가 계속해서 변화하게 되면 개발자들이 코드를 보면서 변수들이 어떻게 변화해 나가는지 추적하기가 힘들어지고, 그로 인해 코드의 동작을 유추하기 힘들어진다.

이로 인해 코드를 이해하는데 드는 노력, 비용등이 증가하게 되고 그 말인 즉 코드를 변경하기 어려워지게 된다.

## 변수를 아껴쓰자!

따라서, 변수를 아껴 쓰는것이 중요한데, 다음과 같이 선언한 이후 1~2번 정도밖에 참조하지 않는 변수는 필요 여부를 검토할 필요가 있다:

```js
/* NOT GOOD */
const name = User1.getName()
const id = User1.getId()

const result = Summary.builder()
  .name(name)
  .id(id)
  .build()

/* GOOD */
const result = Summary.builder()
  .name(User1.getName())
  .id(User1.getId())
  .build()
```

물론, 변수를 아끼자는 말이 변수를 무조건 적게 사용하자는 말이 아니다. 다음과 같은 상황에서는 변수를 사용하는 것이 적합할 수 있다:

- 의미를 더해주는 변수 위주로 사용한다. 예를 들면, 식이 복잡하거나 길어지는 경우 변수 이름으로 설명한다:

  ```js
  const age = Date.getFullYear() - User.getBirthYear()
  ```

- 같은 계산을 반복하는 경우, 변수로 재사용한다.
- 가능한 한 선언과 할당을 한 번에 하는 것이 좋다:

  ```js
  /* NOT GOOD */
  let age

  // ... (age 변수 사용 안함)

  age = Date.getFullYear() - User.getBirthYear()
  ```


    /* GOOD */
    const age = Date.getFullYear() - User.getBirthYear();

````

## 최대한(절대로...) 변수의 용도나 의미를 변경하지 말자

프로그래밍을 할 때, 변수의 용도나 의미를 변경해가면서 쓰면 안된다. 단순히 타입이 같다고 해서 같은 변수를 여기 저기서 이런 저런 용도로 쓰면 안된다는 것이다. 이렇게 하면 코드 분석뿐만 아니라 추후 코드 정리또한 힘들어지게 된다.

따라서, 의미나 용도가 다르다면 다른 변수를 사용하는 것이 바람직하다.

```ts
/* BAD */
let res: string = callApi1();

// ...

res = callApi2();


/* GOOD */
const api1Res: string = callApi1();

// ...

const api2Res: string = callApi2();
````

## 변수가 사용되는 범위를 (최대한) 좁히자

코드를 볼 때 변수가 어떤식으로 바뀌는지 그 상태를 추적해야 하는데, 변수가 사용되는 범위가 짧으면 짧을수록 추적에 따른 인지 부하가 줄어든다.

따라서 변수는 최대한 짧은 범위에서 사용되는 것이 정신건강에 이롭다.

- 짧은 루프 블록 안으로 한정

```js
/* NOT GOOD */
let msg
for (const Person of people) {
  msg = Person.getName()
  // ...
}
/* GOOD */
for (const Person of people) {
  const msg = Person.getName()
  // ...
}
```

- 짧은 `if-else` 블록 안으로 한정
- 짧은 메서드로 한정
- 사용되기 직전에 정의

```js
/* NOT GOOD */
const msg = 'blah blah'
//... (코드 10줄, msg 변경 없음)
return formatMsg(msg)

/* GOOD */
// ... (코드 10줄)
const msg = 'blah blah'
return formatMsg(msg)
```

## 초짜라면..

멋진 설계, 화려한 기술 모두 좋고 잘해야 하는건 맞지만, 결국 기본인 **코드**가 가장 중요하다. 코드가 없다면 모두 소용없지 않은가?

따라서 이렇게 중요한 코드의 복잡도를 낮추고 가독성을 높이는 (쉬운?) 방법은 변수를 아끼는 것이다.
