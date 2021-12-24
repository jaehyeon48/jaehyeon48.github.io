---
title: 'useEffect 완벽 가이드'
date: 2021-12-24
category: 'react'
draft: false
---

이 포스트는 [A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)를 번역/요약한 글입니다.

<hr class="custom-hr">

## 모든 렌더링은 각자의 Props와 State를 가진다 (Each Render Has Its Own Props and State)

우선 effect에 대해 살펴보기 전에 렌더링부터 살펴봅시다. 여기 카운터 컴포넌트가 있습니다. 하이라이트 된 줄을 자세히 봐주세요:

```jsx{6}
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

([예제](https://codesandbox.io/s/simple-counter-app-52qyt?file=/src/App.js))

저게 도대체 무엇을 의미하는 걸까요? `count`가 상태의 변화를 어찌어찌 "관찰"해서 자동으로 업데이트하는 걸까요? 글쎄요, React를 처음 배우면서 직관적으로 그렇게 생각할 수는 있으나 사실 이는 [정확한 멘탈 모델](../react-as-a-ui-runtime)이 아닙니다.

여기서 `count`는 "데이터 바인딩", "watcher", "프록시" 와 같은 그 어느 것도 아닙니다. **이 예제에서 `count`는 단순히 숫자에 불과합니다.** 아래와 같이 말이죠:

```jsx
const count = 42;
// ...
<p>You clicked {count} times </p>
// ...
```

`Counter` 컴포넌트를 최초로 렌더링 했을 때 `useState()`로 부터 얻은 `count` 변수의 값은 `0` 입니다. 여기서 `setCount(1)`을 호출하면 React는 컴포넌트를 다시 호출하고, `count`는 `1`이 되는 식입니다:

```jsx{3,11,19}
// 첫 렌더링 시
function Counter() {
  const count = 0; // useState()에 의해 반환됨
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// 버튼을 클릭하면 (setCount가 호출됨에 따라) 함수 컴포넌트가 다시 호출됨 
function Counter() {
  const count = 1; // useState()에 의해 반환됨
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// 버튼을 클릭하면 (setCount가 호출됨에 따라) 함수 컴포넌트가 다시 호출됨 
function Counter() {
  const count = 2; // useState()에 의해 반환됨
  // ...
  <p>You clicked {count} times</p>
  // ...
}
```

**상태를 업데이트할 때마다 React는 컴포넌트를 호출합니다. 그리고 각 렌더링 결과는 함수 (컴포넌트) 안에서 constant로 존재하는 각자의 고유한 `counter` 상태 값을 참조합니다.**

즉, 위에서 하이라이트 한 줄은 그 어떠한 데이터 바인딩도 수행하지 않습니다:

```jsx
<p>You clicked {count} times</p>
```

**이건 단순히 숫자 값을 렌더링 결과에 끼워 넣는(embed) 것에 불과합니다.** 이 숫자는 React에 의해 제공되는데, `setCount`를 호출할 때 React는 달라진 `count` 값과 함께 컴포넌트를 호출합니다. 그러고 나서 React는 최신 렌더링 결과를 DOM에 반영합니다.

여기서 중요한 핵심은, 어느 특정 렌더링에 존재하는 `count` "constant"가 시간이 지남에 따라 변하는 게 아니라는 점입니다. `count` 값이 변하는 것이 아니라 그냥 단순히 컴포넌트가 다시 호출되고, 다시 호출됨에 따라 발생한 각각의 렌더링마다 그때 그 순간의 고유한 `count` 값을 참조하는 것입니다. (즉, 하나의 `count` 변수가 시간이 지남에 따라 변하는 것이 아니라, 각 렌더링 때마다 그 순간에서의 적절한 값을 가지는 서로 다른 고유한 `count` 변수가 존재한다고 보면 될 듯합니다.)

(이 과정을 더 자세히 알고 싶으면 [UI 런타임으로서의 React](../react-as-a-ui-runtime)를 읽어보세요!)

## 모든 렌더링은 각자의 이벤트 핸들러를 가진다 (Each Render Has Its Own Event Handlers)

- 자, 그럼 이벤트 핸들러는 어떨까요? 다음의 예제를 봅시다. 아래의 컴포넌트는 3초 뒤에 alert로 `count` 값을 띄워줍니다:

```jsx{4-8,16-18}
function Counter() {
  const [count, setCount] = useState(0);

  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
      <button onClick={handleAlertClick}>
        Show alert
      </button>
    </div>
  );
}
```

이때, 다음의 과정을 수행한다고 해봅시다:

  - 카운트 값을 3으로 증가시킨다.
  - "Show alert" 버튼을 누른다.
  - 타임아웃이 실행되기 전에 카운트 값을 5로 증가시킨다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/a-complete-guide-to-useeffect/counter.gif" alt="Counter demo" />
</figure>

과연 alert에는 어떤 값이 뜰까요? alert가 표시되는 순간의 값인 `5`? 아니면 버튼을 클릭한 순간의 값인 `3`?

[직접 해보세요!](https://codesandbox.io/s/w2wxl3yo0l)

만약 실행 결과가 잘 이해되지 않는다면, 좀 더 실질적인 예시를 한번 생각해 봅시다. 채팅 앱에서, 현재 상태로 수신자 ID를 가지고 있고 전송 버튼을 누른 경우를 상상해 봅시다. 왜 alert에 3이 출력되었는지에 대해선 [이 글](https://overreacted.io/how-are-function-components-different-from-classes/)이 자세히 설명해 줄 것입니다.

Alert는 제가 버튼을 눌렀을 때의 상태를 "캡처" 한 것입니다.

하지만 왜 이렇게 동작하는 걸까요?

앞서 우리는 `count` 값이 매번 호출되는 함수 (컴포넌트)에 대한 "상수"임을 살펴봤습니다. 저는 이걸 특히 강조하고 싶은데, **우리의 함수 (컴포넌트)는 매번 렌더링 될 때마다 호출되지만, 각 순간마다 해당 함수에 존재하는 `count` 값은 해당 렌더링 때의 상태 값을 가지는 "상수"입니다.**

이건 React에 국한되는 것이 아닙니다. 일반적인 자바스크립트 함수들도 이와 비슷한 방식으로 동작합니다:

```jsx{2}
function sayHi(person) {
  const name = person.name;
  setTimeout(() => {
    alert('Hello, ' + name);
  }, 3000);
}

let someone = { name: 'Dan' };
sayHi(someone);

someone = { name: 'Yuzhi' };
sayHi(someone);

someone = { name: 'Dominic' };
sayHi(someone);
```

[이 예제](https://codesandbox.io/s/mm6ww11lk8)에서 (함수) 외부의 `someone` 변수는 React 어딘가에서 컴포넌트의 현재 상태가 바뀌는 것처럼 여러 번 재할당 되고 있습니다. 하지만 `sayHi` 함수 내에는 특정 호출 시의 `person`과 연관된 `name` 이라는 지역 상수가 존재합니다. 이 상수는 지역 상수이므로 각각의 함수 호출과는 분리되어 있습니다. 이로 인해 타임아웃이 발생했을 때 각 alert가 해당 alert를 발생시킨 함수 호출 시의 `name`을 "기억"하는 것입니다. 만약 `name`이 각 함수 호출과 분리되어 있지 않다면 결과적으로 `Dominic`만 세 번 출력되겠죠?

이를 통해 어떻게 이벤트 핸들러가 버튼을 클릭한 순간의 `count` 값을 "캡처"할 수 있는지에 대해 알 수 있습니다:

```jsx{3, 15, 27}
// 첫 렌더링 시
function Counter() {
  const count = 0; // useState()에 의해 반환됨
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}

// 버튼을 클릭하면 Counter가 다시 호출됨
function Counter() {
  const count = 1; // useState()에 의해 반환됨
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}

// 버튼을 클릭하면 Counter가 다시 호출됨
function Counter() {
  const count = 2; // useState()에 의해 반환됨
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}
```

따라서 실질적으로, 각 렌더링은 각자의 고유한 `handleAlertClick` 을 반환하는 것이나 다름없습니다. 그리고 이렇게 반환된 각각의 `handleAlertClick`은 각자의 `count`를 "기억"합니다:

```jsx{6,10,19,23,32,36}
// 첫 렌더링 시
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 0);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // "0"이 안에 들어있음
  // ...
}

// 버튼을 클릭하면 Counter가 다시 호출됨
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 1);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // "1"이 안에 들어있음
  // ...
}

// 버튼을 또 다시 클릭하면 Counter가 다시 호출됨
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 2);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // "2"가 안에 들어있음
  // ...
}
```

이것이 [이 데모에서]() 이벤트 핸들러가 특정 렌더링에 "종속"되어 있는 이유이며, 버튼을 클릭했을 때 이벤트 핸들러가 해당 렌더링 순간의 `counter` 상태를 사용하는 이유입니다.

**특정 렌더링 때 존재하는 props와 상태는 영원히 같은 상태로 유지됩니다.**

참고: 위 예제에서 저는 `handleAlertClick` 함수 안에 구체적인 `count` 값을 (변수 이름 대신) 치환하여 표시했습니다. 이는 `count`가 상수이고, 또 숫자이기 때문에 별 상관없습니다. 숫자 말고 다른 값에 대해서도 이러한 방식으로 생각하는 것은 괜찮은데, 객체의 경우엔 오로지 불변 객체를 사용한다는 전제가 있어야만 합니다. 예를 들어, `setSomething(newObj)`와 같이 기존의 객체를 변경시키는 것이 아니라 새로운 객체를 생성하여 전달하는 것은 이전 렌더링에 속해있는 상태를 변경시키는 것이 아니기 때문에 괜찮습니다.