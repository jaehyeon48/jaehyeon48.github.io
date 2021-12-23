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