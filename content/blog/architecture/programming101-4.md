---
title: '프로그래밍 초식 요약 - Early return'
date: 2021-12-08
category: 'architecture'
draft: false
---

이 글은 [최범균님의 프로그래밍 초식 시리즈](https://www.youtube.com/watch?v=kRdML08R2Yo&list=PLwouWTPuIjUg0dmHoxgqNXyx3Acy7BNCz)을 요약한 글입니다.

<hr class="custom-hr">

## If 조건 역으로 바꾸기

`if` 조건이 많거나, 중첩된 `if` 조건이 많아지면 코드가 복잡해지고 분석하기 어려워진다. `if` 조건을 덜 복잡하게 하는 여러 방법들 중 가장 쉬운(?) 방법을 살펴보자.

### 흔한 요구사항

- `A`인 경우에만 `E`를 실행한다:

```js
if (A) {
  // E 실행
}
```

- `A`인 경우에, 그리고 `B`인 경우에는 `E`를 실행한다:

```js
if (A) {
  // B 조건을 구함

  if (B) {
    // E 실행
  }
}
```

하지만, 다음 그림과 같이 `if` 블록이 길어지게 되면 모니터 한 화면에 안 들어오게 되고 스크롤을 해야 `if` 블록의 끝을 알 수 있다. 또한, 코드를 분석할 때 `if` 블록의 실행 조건을 머릿속에 기억하면서 코드를 분석해 나가야 한다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/architecture/programming101/too_long_if_block.png" alt="너무 긴 if 블록" />
    <figcaption>출처: https://www.youtube.com/watch?v=z4qE_IfSrD4&list=PLwouWTPuIjUg0dmHoxgqNXyx3Acy7BNCz&index=7</figcaption>
</figure>

### 코드 구조가 이렇다면?

아래 코드들과 같이 `else` 가 없거나, `else` 로직이 단순한 경우가 종종 있다:

```js
function someFunc() {
  if (someCondition) {
    // 많은 코드
  }
} 
```

```js
function someFunc() {
  if (someCondition) {
    // 많은 코드
  } else {
    logger.info('some message');
  }
}
```

```js
if (A) {
  // B 조건 구함
  if (B) {
    // E 실행
  }
}
```

이러한 코드들은 `if` 조건을 역으로 바꿈으로써 코드를 좀 더 단순화할 수 있다:

```js
/* NOT GOOD */
function someFunc() {
  if (someCondition) {
    // 많은 코드
  }
}


/* GOOD */
function someFunc() {
  if (!someCondition) return;
  // 많은 코드
}
```

```js
/* NOT GOOD */
function someFunc() {
  if (someCondition) {
    // 많은 코드
  } else {
    logger.info('some message');
  }
}


/* GOOD */
function someFunc() {
  if (!someCondition) {
    logger.info('some message');
    return;
  }
    // 많은 코드
}
```

```js
/* NOT GOOD */
if (A) {
  // B 조건 구함
  if (B) {
    // E 실행
  }
}

/* GOOD */
if (!A) return;
// B조건 구함
if (!B) return;
// E 실행
```

## If 조건을 역으로 바꾸게 되면...

위 사례들과 같이, `if` 조건을 역으로 바꾸게 되면 `else` 가 없다는 사실을 빨리 파악할 수 있다. 또한, `if` 조건을 기억해야 할 범위가 좁아져서 상대적으로 인지 부하가 감소되고, 인덴트의 깊이가 줄어들어 코드가 간결해진다. 따라서 그만큼 코드 분석에 좀 더 유리해진다고 할 수 있다.

물론 `if-else` 문을 써야하는 경우도 있겠지만..(어디에나 예외는 있으니 말이다) 되도록이면 **early return** 패턴을 적용해서 인덴트의 깊이를 줄이고, `if` 블록의 길이를 줄여 코드를 더 깔끔하게 작성하는 편이 좋을 것 같다.