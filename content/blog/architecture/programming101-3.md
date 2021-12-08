---
title: '프로그래밍 초식 요약 - What? How?'
date: 2021-12-08
category: 'architecture'
draft: false
---

이 글은 [최범균님의 프로그래밍 초식 시리즈](https://www.youtube.com/watch?v=kRdML08R2Yo&list=PLwouWTPuIjUg0dmHoxgqNXyx3Acy7BNCz)을 요약한 글입니다.

<hr class="custom-hr">

## 개발자들의 구현 본능

아무래도 개발자들은 구현을 하는 입장이다 보니, 구현 사항을 들으면 어떻게 구현을 하면 좋을지 자연스럽게 떠올리는 경향이 있는 것 같다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/web/programming101/developer_instinct.png" alt="구현 본능" />
    <figcaption>구현 본능</figcaption>
</figure>

이를 코드로 "직역"에 가깝게 구현하면 아마 다음과 비슷하게 구현할 수 있을 것같다:

```js
const count = userDao.countUsersByReg(userId);
if (count > 0) {
  pointRate += 1;
}

// ...

if (count > 0) {
  logDao.insert(new Log(..., 'AR', 1, ...));
}
```

하지만, 시간이 흐르다 보면 처음 코드를 구현할 때의 요구 사항들이 점점 희미해져 간다. 이렇게 희미해진 내용은 구전으로 전해지거나, 혹은 운이 (정말) 좋으면 문서로 남아있거나 할텐데 어쨌거나 "코드가 왜 이렇게 구현되었는가?"에 대한 내용이 머릿속에서 사라져간다.

그렇게 시간이 더 흘러 담당자, 개발자 등이 바뀌게 되고 (실제로 이런 일이 비일비재 하다고 한다!) 어느 순간 누군가 코드를 봤을 때 그 코드가 "왜 그렇게 짜여졌는지" 이해하기 어려운 시점이 찾아오게 된다.

> "여기 log 남길 때 왜 count가 0보다 클 때만 남기는지 아시나요? if문은 빼도 될 것 같은데..."

> "제가 회사에 왔을 때부터 이랬어가지고 저도 잘... 무슨 이유가 있을테니 건들지 맙시다.."

### 요구사항이 바뀐다면?

요구사항은 항상 변하기 마련이고, 소프트웨어 개발은 한 번 완료되었다고 해서 그것으로 끝나는 것이 아니다. 따라서 위에서 봤던 코드도 다음과 같이 변경될 수 있다:

```js
// ...

if (count > 0 && 다른 조건 추가) {
  pointRate += 1;
}

// ...
```

## WHAT과 HOW를 나눠서 생각해보자

- **WHAT**: 구현한 코드가 하려는 것, 의미, 의도
- **HOW**: WHAT을 실제로 구현한 것

| WHAT                | HOW                                        |
| ------------------- | ------------------------------------------ |
| 가입한지 1년 미만   | User 테이블에서 reg 컬럼 값 기준으로 count |
| 추가 지급 내역 남김 | log 테이블에 insert                        |

### 코드를 우선 WHAT으로 표현해보자! HOW는 그 다음에...

우선 코드를 WHAT으로, 즉 실제 의미가 드러나도록 코딩을 해보자. 그리고 나서 실제로 구현(HOW)해보자.

```js
let addPointRate = 0
if (isUserRegisteredLessThanNYear(1, userId)) {
  addPointRate = 1
}

// ...

if (addPointRate > 0) {
  recordAddPointHistory(userId, addPointRate)
}
```

## WHAT과 HOW의 분리 결과

WHAT(코드의 의미, 의도)과 HOW(실제 구현)를 분리하게 되면, 구현을 잠시 잊고 실제로 코드가 하려고 하는 것이 무엇인지 생각해보게 된다. 그로 인해

- 실제로 수행하려고 하는 동작이 코드에 드러날 가능성이 높아지고,
- 그로인해 코드의 가독성이 향상되고,
- 유지보수성이 좋아진다.

물론, 실제로 구현하다 보면 여러 이슈들로 인해 표현력이 떨어질 수도 있다. 하지만 이런식으로 WHAT과 HOW를 분리하려는 노력을 계속해서 한다면, 전반적으로 내가 작성하는 코드의 표현력이 좋아질 것이다.

따라서 결론은, 의식의 흐름대로 (생각나는 대로) "막" 구현하면 안된다. **항상 의미/의도가 드러나는 코드를 작성하려고 노력해야 한다**.

근데 이거 함수형 프로그래밍이랑 비슷한거 같다..? 🤔
