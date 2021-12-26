---
title: '제어의 역전'
date: 2021-12-26
category: 'javascript'
draft: false
---

이 글은 [Kent C. Dodds](https://kentcdodds.com/)의 [Inversion of Control](https://kentcdodds.com/blog/inversion-of-control) 포스트를 번역한 글입니다.

<hr class="custom-hr">

[egghead.io의 "IoC 구현하기" 영상을 보세요!](https://egghead.io/lessons/javascript-implement-inversion-of-control)

만약 여러분이 한 곳 이상에서 사용되는 코드를 작성해보신 경험이 있다면, 아래의 경험을 해보신 적이 있을 수도 있을 겁니다:

1. 함수, React 컴포넌트, React 훅과 같이 재사용 가능한 코드를 만들어서 동료, 혹은 오픈소스의 형태로 공유합니다.
2. 이때 누군가 여러분에게 "새로운 기능도 지원해주세요!"라고 합니다. 얼핏 보니, 코드를 조금만 바꾸면 될 듯합니다.
3. 그래서 여러분은 기존의 코드에 인자/옵션 등을 추가하여 새로운 기능을 지원하게 됩니다.
4. 2번과 3번을 여러 번 (혹은 많이..😬) 반복하게 됩니다.
5. 이제 원래의 코드는 사용하기도 어렵고, 유지보수 하기도 어려운 코드로 바뀌게 되었습니다 😭

<br/>

그럼 무엇 때문에 코드가 사용하기도 어려워지고 유지보수 하기도 어려워졌을까요? 문제의 소지가 될 만한 것들은 다음과 같습니다:

1. 😵 **번들의 크기 혹은 성능**: 장치가 실행해야 할 코드의 양이 많아짐으로 인해 성능이 나빠질 수도 있습니다. 때로는 이러한 문제 때문에 사람들이 여러분의 코드를 사용하지 않게 될 수 있습니다.
2. 😖 **유지보수 오버헤드**: 원래의 코드는 한 가지 일을 잘 하는 것에만 집중했었지만, 이제는 여러 가지 일을 수행하게 되었고, 또 이러한 여러 가지 기능들을 문서화해야 할 수도 있습니다. 게다가, 새로 추가한 기능들을 어떻게 사용해야 하는지에 대한 문의가 끊이지 않을 수 있습니다. 같은 동작을 약간 다르게 수행하는 두 가지 기능이 존재하게 되어서 어떤 방법이 더 나은지에 대해 답변해야 하는 경우가 생길 수도 있구요.
3. 🐛 **구현의 복잡도**: "에이, 그냥 `if`문 하나 추가하는 건데 뭐 어때?"가 아닙니다! 코드의 각 분기문은 기존에 존재하는 분기문과 결합하여 결과적으로 코드를 더욱 복잡하게 만듭니다. 실제로는 아무도 사용하지 않는 인자/옵션이지만 이를 누가 사용하고 있는지 모르기 때문에 새로운 기능을 추가할 때 이들을 (선뜻 제거하지 못하고) 계속해서 지원해야 하는 경우가 있을 수도 있습니다.
4. 😕 **API 복잡도**: (기존에 재사용 가능한 코드에) 새로운 기능들을 계속해서 추가하게 되면 이들의 사용법을 담은 문서가 커지게 되고, 이에 따라 이러한 기능들을 효과적으로 사용하기 위해 유저들이 공부해야 할 양이 많아지게 되어 결국 프로그램을 사용하기 어려워질 수 있습니다. 또한 API의 복잡도가 개발자의 코드에 흘러 들어가 결국에는 코드 자체가 더욱 복잡해질 수 있습니다.

이렇게 되면 모두가 슬퍼집니다. 😞 애플리케이션을 개발할 때 앱을 출시하는 것이 제일 중요하다는 말이 있습니다. 하지만 앱을 출시하기 전에 추상화에 대해 다시 한번 생각해보는 것이 좋다고 생각합니다. ([AHA 프로그래밍](https://kentcdodds.com/blog/aha-programming)을 읽어보세요!) 재사용 가능한 코드의 문제를 줄이면서도 추상화의 이점을 계속해서 누릴 방법이 있다면 말이죠.

## 도입: 제어의 역전 (Enter: Inversion of Control)

제가 배웠던 원칙 중 간결한 추상화에 굉장히 효과적인 메커니즘은 바로 "제어의 역전" 이었습니다. [위키피디아](https://en.wikipedia.org/wiki/Inversion_of_control)에서는 제어의 역전을 다음과 같이 정의했습니다:

> ...전통적인 프로그래밍 방식에선 일반적인 일들을 처리하기 위해 개발자의 코드가 라이브러리를 호출하였으나, 제어의 역전을 사용하면 라이브러리에서 개발자의 코드를 호출하게 됩니다.

이를 "여러분의 추상화가 해야 할 일을 사용자가 하도록 하세요"라고 생각하실 수도 있을 것 같네요. 물론 이것이 꽤 비직관적이실 수도 있습니다. 흔히 추상화의 장점은 복잡하고 반복적인 일들을 추상화가 처리하도록 함으로써 나머지 코드가 "깨끗"해지는 데에 있으니까요. 하지만 이미 우리가 경험했듯이, 전통적인 추상화는 때로 잘 동작하지 않을 수 있습니다.

## 제어의 역전을 코드로 표현하면 어떻게 되나요? (What is Inversion of Control in Code?)

우선, 다음의 예제를 살펴봅시다:

```js
// Array.prototype.filter가 없다고 가정해 보자구요
function filter(array) {
  let newArray = [];
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if (element !== null && element !== undefined) {
      newArray[newArray.length] = element;
    }
  }
  return newArray;
}

// 유스 케이스:

filter([0, 1, undefined, 2, null, 3, 'four', '']);
// [0, 1, 2, 3, 'four', '']
```

위 코드와 관련된 기능들을 추가해서 새로운 유스 케이스를 지원하기 위해 "생각 없이 개선하는" 전형적인 "추상화 과정"을 살펴봅시다:

```js
// Array.prototype.filter가 없다고 가정해 보자구요
function filter(
  array,
  {
    filterNull = true,
    filterUndefined = true,
    filterZero = false,
    filterEmptyString = false,
  } = {},
) {
  let newArray = [];
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if (
      (filterNull && element === null) ||
      (filterUndefined && element === undefined) ||
      (filterZero && element === 0) ||
      (filterEmptyString && element === '')
    ) {
      continue;
    }

    newArray[newArray.length] = element;
  }
  return newArray;
}

filter([0, 1, undefined, 2, null, 3, 'four', '']);
// [0, 1, 2, 3, 'four', '']

filter([0, 1, undefined, 2, null, 3, 'four', ''], { filterNull: false });
// [0, 1, 2, null, 3, 'four', '']

filter([0, 1, undefined, 2, null, 3, 'four', ''], { filterUndefined: false });
// [0, 1, 2, undefined, 3, 'four', '']

filter([0, 1, undefined, 2, null, 3, 'four', ''], { filterZero: true });
// [1, 2, 3, 'four', '']

filter([0, 1, undefined, 2, null, 3, 'four', ''], { filterEmptyString: true });
// [0, 1, 2, 3, 'four']
```

좋습니다. 이제 우리의 예제는 여섯 개의 유스 케이스를 포함해 총 25가지의 경우를 지원할 수 있게 되었습니다 (제가 계산을 맞게 했다면 말이죠!).

그리고 이는 꽤 간단한 추상화입니다. 물론 더욱 간소화할 수는 있겠습니다만 때로는 시간이 지난 후에 다시 코드로 돌아왔을 때 실제로 지원하는 유스 케이스에 맞게 코드를 획기적으로 간소화할 수 있습니다. 하지만 불행히도 추상화가 무언가 새 기능을 지원한다면 (마치 `{filterZero: true, filterUndefined: false}`와 같이 말이죠) 우리의 추상화를 사용하는 코드를 망가뜨릴까 걱정하는 마음에 선뜻 해당 기능을 제거하지 못하게 됩니다.

또한, 우리의 추상화가 미래엔 필요할지도 모르지만 현재로선 그다지 필요 없는 유스 케이스를 지원하는 경우 이를 위한 테스트를 작성하게 되는 경우가 발생할 수도 있습니다. 그리고 이후에 가서 필요 없어진 유스 케이스에 대해 까먹거나, 미래에 필요하다고 생각되거나, 혹은 단순히 코드를 건드리기 싫어서 이러한 기능을 제거하지 않을 수 있습니다.

좋아요. 이제는 위 예제 함수에 신중한 추상화와 제어의 역전을 적용해봅시다:

```jsx
// Array.prototype.filter가 없다고 가정해 보자구요
function filter(array, filterFn) {
  let newArray = [];
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if (filterFn(element)) {
      newArray[newArray.length] = element;
    }
  }
  return newArray;
}

filter(
  [0, 1, undefined, 2, null, 3, 'four', ''],
  el => el !== null && el !== undefined,
);
// [0, 1, 2, 3, 'four', '']

filter([0, 1, undefined, 2, null, 3, 'four', ''], el => el !== undefined);
// [0, 1, 2, null, 3, 'four', '']

filter([0, 1, undefined, 2, null, 3, 'four', ''], el => el !== null);
// [0, 1, 2, undefined, 3, 'four', '']

filter(
  [0, 1, undefined, 2, null, 3, 'four', ''],
  el => el !== undefined && el !== null && el !== 0,
);
// [1, 2, 3, 'four', '']

filter(
  [0, 1, undefined, 2, null, 3, 'four', ''],
  el => el !== undefined && el !== null && el !== '',
);
// [0, 1, 2, 3, 'four']
```

어때요? 훨씬 간결해진 것 같지 않나요? 우리는 제어를 역전시켰습니다! `filter` 함수를 통해 걸러낼 요소들을 결정하는 책임을 위임한 것이지요. 우리의 `filter` 함수는 여전히 그 자체로 유용한 추상화이지만 훨씬 더 유능해졌습니다.

하지만 이전 버전의 추상화가 그렇게 나쁘지만은 않았습니다. 하지만 이렇게 제어를 역전함으로써 훨씬 더 많은 특이한 유스 케이스를 지원할 수 있게 되었습니다:

```js
filter(
  [
    { name: 'dog', legs: 4, mammal: true },
    { name: 'dolphin', legs: 0, mammal: true },
    { name: 'eagle', legs: 2, mammal: false },
    { name: 'elephant', legs: 4, mammal: true },
    { name: 'robin', legs: 2, mammal: false },
    { name: 'cat', legs: 4, mammal: true },
    { name: 'salmon', legs: 0, mammal: false },
  ],
  animal => animal.legs === 0,
);

// [
//   { name: 'dolphin', legs: 0, mammal: true },
//   { name: 'salmon', legs: 0, mammal: false },
// ]
```

이전 버전의 추상화에서 이러한 유스 케이스를 지원하게끔 한다고 해보세요... 휴 끔찍합니다 😅

## 더 나쁜 API? (A worse API?)

하지만 이렇게 제어가 역전된 API를 만들면 사람들로부터 "그래요.. 하지만 이전보다 더 사용하기 어려워졌어요"라는 불평을 듣곤 합니다. 다음의 예를 살펴봅시다:

```js
// before
filter([0, 1, undefined, 2, null, 3, 'four', '']);

// after
filter(
  [0, 1, undefined, 2, null, 3, 'four', ''],
  el => el !== null && el !== undefined,
);
```

음.. 확실히 둘 중 하나는 나머지보다 더 사용하기 편한 것 같기도 하네요. 하지만 제어가 역전된 API는 원한다면 이전의 API를 다시 구현할 수 있으며, (일반적으론) 재구현하기 굉장히 간단합니다:

```js
function filterWithOptions(
  array,
  {
    filterNull = true,
    filterUndefined = true,
    filterZero = false,
    filterEmptyString = false,
  } = {},
) {
  return filter(
    array,
    element =>
      !(
        (filterNull && element === null) ||
        (filterUndefined && element === undefined) ||
        (filterZero && element === 0) ||
        (filterEmptyString && element === '')
      ),
  );
}
```

멋지지 않나요? 제어가 역전된 API를 기반으로 사람들이 원하는 간단한 API를 구현할 수 있습니다. 더욱이, 만약 이렇게 단순해진 API가 사용자의 유스 케이스에 그다지 적합하지 않다면, 복잡한 처리하도록 설계된 고차원의 API를 만들 때 사용한 것과 동일한 구성 요소를 사용할 수도 있습니다. 이러면 유저들은 여러분께 `filterWithOptions` 함수에 기능을 추가해달라고 요청한 다음 기다릴 필요가 없습니다. 왜냐면 우리가 유저들에게 그들이 원하는 기능을 스스로 구현할 수 있도록 도구를 준 셈이나 다름없기 때문이죠.

아, 그리고 재미로요:

```js
function filterByLegCount(array, legCount) {
  return filter(array, animal => animal.legs === legCount)
}

filterByLegCount(
  [
    { name: 'dog', legs: 4, mammal: true },
    { name: 'dolphin', legs: 0, mammal: true },
    { name: 'eagle', legs: 2, mammal: false },
    { name: 'elephant', legs: 4, mammal: true },
    { name: 'robin', legs: 2, mammal: false },
    { name: 'cat', legs: 4, mammal: true },
    { name: 'salmon', legs: 0, mammal: false },
  ],
  0,
);

// [
//   { name: 'dolphin', legs: 0, mammal: true },
//   { name: 'salmon', legs: 0, mammal: false },
// ]
```

일반적인 유스 케이스를 해결하기 위해 여러분은 이러한 것들을 원하는 대로 조합할 수 있습니다.