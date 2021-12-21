---
title: '리팩토링 방법들 Part.1'
date: 2021-12-21
category: 'architecture'
draft: false
---

## Inline Variable

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/architecture/refactoring/inline_variable.png" alt="Inline Variable" />
    <figcaption>Inline Variable</figcaption>
</figure>

```js
/* Before */
const basePrice = anOrder.basePrice;
return basePrice > 1000;

/* After */
return anOrder.basePrice > 1000;
```

### Motivation

- 변수의 이름을 통해 코드의 흐름을 파악할 수 있기 때문에, 일반적으로 변수는 좋은 것으로 취급된다.
- 하지만 변수의 이름이 원래의 표현식과 다를 바 없는 경우, 혹은 리팩토링 하는데 변수가 방해되는 경우 해당 변수를 인라인하는 것이 좋다.

### Mechanics

1. 변수의 오른쪽에 있는 표현식(Right-Hand Side)이 side effect로부터 자유로운지 살펴본다.
2. 만약 변수가 immutable이 아니라면 immutable로 만들고 테스트한다.
3. 해당 변수를 최초로 사용하는 지점을 찾아 변수의 RHS로 인라인 하고 테스트한다.
4. 변수를 사용하는 나머지 부분에 대해 3번 과정을 반복한다.
5. 변수 선언부를 제거한다.
6. 테스트한다.

## Reference

[리팩토링 2판](https://www.amazon.com/Refactoring-Improving-Existing-Addison-Wesley-Signature/dp/0134757599)
