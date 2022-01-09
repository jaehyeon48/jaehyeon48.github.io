---
title: '나머지 연산과 모듈로 연산'
date: 2022-01-09
category: 'JavaScript'
draft: false
---

## 나머지 연산 vs. 모듈로 연산

나머지 연산을 `rem`, 모듈로 연산을 `mod`라고 한다면, 이들의 연산 결과는 다음과 같습니다:

1. 두 피연산자의 부호가 같은경우 다음과 같습니다:

```js
10 rem 3 === 1
10 mod 3 === 1

-8 rem -5 === -3
-8 mod -5 === -3
```

2. 하지만 두 피연산자의 부호가 다른 경우 그 결과는 달라집니다:

```js
-8 rem 5 === -3
-8 mod 5 === 2

8 rem -5 === 3
8 mod -5 === -2
```

위 예제에서 볼 수 있듯이 나머지(remainder)연산 결과의 부호는 피제수(dividend) 즉 첫 번째 피연산자와 동일하고, 모듈로(modulo)연산 결과의 부호는 제수(divisor) 즉 두 번째 피연산자와 동일합니다. 과연 왜 이러한 결과가 나오는지 살펴봅시다.

## 원리

나머지 연산과 모듈로 연산 모두 다음의 두 식을 기반으로 합니다:

```
피제수(나눠지는 수, dividend) = 제수(나누는 수, divisor) * 몫(quotient) + 나머지(remainder)
|나머지| < |제수|
```

(⚠️ 편의상 제수, 피제수, 몫, 나머지 모두 정수라고 가정하겠습니다.)

여기서 나머지만 좌변에 남기고 나머지를 우변으로 넘기면 다음과 같습니다:

```
나머지 = 피제수 - 제수 * 몫
```

이때 몫이 정수가 되도록 하기 위해 나머지 연산과 모듈로 연산은 각각 다음과 같이 계산합니다:

- **나머지 연산**: 몫 = Math.trunc(피제수 / 제수)
- **모듈로 연산**: 몫 = Math.floor(피제수 / 제수)

즉, 몫을 구할 때 나머지 연산은 소수점을 절사하고, 모듈로 연산은 내림 연산을 수행합니다. 이때문에 앞서 살펴본 것과 같은 결과가 나오는 것입니다:

### 나머지 연산 예제

```js
/* 나머지 연산 */
-8 rem 5 === -3

const 피제수 = -8; // 피제수
const 제수 = 5; // 제수
const 몫 = Math.trunc(피제수 / 제수); // === -1

// 따라서, 나머지 = 피제수 - 제수 * 몫 공식에 대입하면,
나머지 = -8 - (5 * -1) // -> -8 + 5 === -3
```

```js
/* 나머지 연산 */
8 rem -5 === 3

const 피제수 = 8; // 피제수
const 제수 = -5; // 제수
const 몫 = Math.trunc(피제수 / 제수); // === -1

// 따라서, 나머지 = 피제수 - 제수 * 몫 공식에 대입하면,
나머지 = 8 - (-5 * -1) // -> 8 - 5 === 3
```

### 모듈로 연산 예제

```js
/* 모듈로 연산 */
-8 mod 5 === 2

const 피제수 = -8; // 피제수
const 제수 = 5; // 제수
const 몫 = Math.floor(피제수 / 제수); // === -2

// 따라서, 나머지 = 피제수 - 제수 * 몫 공식에 대입하면,
나머지 = -8 - (5 * -2) // -> -8 + 10 === 2
```

```js
/* 모듈로 연산 */
8 mod -5 === -2

const 피제수 = 8; // 피제수
const 제수 = -5; // 제수
const 몫 = Math.floor(피제수 / 제수); // === -2

// 따라서, 나머지 = 피제수 - 제수 * 몫 공식에 대입하면,
나머지 = 8 - (-5 * -2) // -> 8 - 10 === -2
```

## Reference

[Remainder operator vs. modulo operator (with JavaScript code)](https://2ality.com/2019/08/remainder-vs-modulo.html)

[https://stackoverflow.com/questions/41239190/result-of-17-is-different-in-javascript-1-and-python6#answer-41252701](https://stackoverflow.com/questions/41239190/result-of-17-is-different-in-javascript-1-and-python6#answer-41252701)