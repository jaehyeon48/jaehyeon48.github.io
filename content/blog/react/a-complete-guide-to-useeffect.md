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
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
```

([예제](https://codesandbox.io/s/simple-counter-app-52qyt?file=/src/App.js))

저게 도대체 무엇을 의미하는 걸까요? `count`가 state의 변화를 어찌어찌 "관찰"해서 자동으로 업데이트하는 걸까요? 글쎄요, React를 처음 배우면서 직관적으로 그렇게 생각할 수는 있으나 사실 이는 [정확한 멘탈 모델](../react-as-a-ui-runtime)이 아닙니다.

여기서 `count`는 "데이터 바인딩", "watcher", "프록시" 와 같은 그 어느 것도 아닙니다. **이 예제에서 `count`는 단순히 숫자에 불과합니다.** 아래와 같이 말이죠:

```jsx
const count = 42
// ...
;<p>You clicked {count} times </p>
// ...
```

`Counter` 컴포넌트를 최초로 렌더링 했을 때 `useState()`로 부터 얻은 `count` 변수의 값은 `0` 입니다. 여기서 `setCount(1)`을 호출하면 React는 컴포넌트를 다시 호출하고, `count`는 `1`이 되는 식입니다:

```jsx{3,11,19}
// 첫 렌더링 시
function Counter() {
  const count = 0 // useState()에 의해 반환됨
  // ...
  ;<p>You clicked {count} times</p>
  // ...
}

// 버튼을 클릭하면 (setCount가 호출됨에 따라) 함수 컴포넌트가 다시 호출됨
function Counter() {
  const count = 1 // useState()에 의해 반환됨
  // ...
  ;<p>You clicked {count} times</p>
  // ...
}

// 버튼을 클릭하면 (setCount가 호출됨에 따라) 함수 컴포넌트가 다시 호출됨
function Counter() {
  const count = 2 // useState()에 의해 반환됨
  // ...
  ;<p>You clicked {count} times</p>
  // ...
}
```

**state를 업데이트할 때마다 React는 컴포넌트를 호출합니다. 그리고 각 렌더링 결과는 함수 (컴포넌트) 안에서 constant로 존재하는 각자의 고유한 `counter` state 값을 참조합니다.**

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
  const [count, setCount] = useState(0)

  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count)
    }, 3000)
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
      <button onClick={handleAlertClick}>Show alert</button>
    </div>
  )
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

만약 실행 결과가 잘 이해되지 않는다면, 좀 더 실질적인 예시를 한번 생각해 봅시다. 채팅 앱에서, 현재 state로 수신자 ID를 가지고 있고 전송 버튼을 누른 경우를 상상해 봅시다. 왜 alert에 3이 출력되었는지에 대해선 [이 글](https://overreacted.io/how-are-function-components-different-from-classes/)이 자세히 설명해 줄 것입니다.

Alert는 제가 버튼을 눌렀을 때의 state를 "캡처" 한 것입니다.

하지만 왜 이렇게 동작하는 걸까요?

앞서 우리는 `count` 값이 매번 호출되는 함수 (컴포넌트)에 대한 "상수"임을 살펴봤습니다. 저는 이걸 특히 강조하고 싶은데, **우리의 함수 (컴포넌트)는 매번 렌더링 될 때마다 호출되지만, 각 순간마다 해당 함수에 존재하는 `count` 값은 해당 렌더링 때의 state 값을 가지는 "상수"입니다.**

이건 React에 국한되는 것이 아닙니다. 일반적인 자바스크립트 함수들도 이와 비슷한 방식으로 동작합니다:

```jsx{2}
function sayHi(person) {
  const name = person.name
  setTimeout(() => {
    alert('Hello, ' + name)
  }, 3000)
}

let someone = { name: 'Dan' }
sayHi(someone)

someone = { name: 'Yuzhi' }
sayHi(someone)

someone = { name: 'Dominic' }
sayHi(someone)
```

[이 예제](https://codesandbox.io/s/mm6ww11lk8)에서 (함수) 외부의 `someone` 변수는 React 어딘가에서 컴포넌트의 현재 state가 바뀌는 것처럼 여러 번 재할당 되고 있습니다. 하지만 `sayHi` 함수 내에는 특정 호출 시의 `person`과 연관된 `name` 이라는 지역 상수가 존재합니다. 이 상수는 지역 상수이므로 각각의 함수 호출과는 분리되어 있습니다. 이로 인해 타임아웃이 발생했을 때 각 alert가 해당 alert를 발생시킨 함수 호출 시의 `name`을 "기억"하는 것입니다. 만약 `name`이 각 함수 호출과 분리되어 있지 않다면 결과적으로 `Dominic`만 세 번 출력되겠죠?

이를 통해 어떻게 이벤트 핸들러가 버튼을 클릭한 순간의 `count` 값을 "캡처"할 수 있는지에 대해 알 수 있습니다:

```jsx{3,15,27}
// 첫 렌더링 시
function Counter() {
  const count = 0 // useState()에 의해 반환됨
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count)
    }, 3000)
  }
  // ...
}

// 버튼을 클릭하면 Counter가 다시 호출됨
function Counter() {
  const count = 1 // useState()에 의해 반환됨
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count)
    }, 3000)
  }
  // ...
}

// 버튼을 클릭하면 Counter가 다시 호출됨
function Counter() {
  const count = 2 // useState()에 의해 반환됨
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count)
    }, 3000)
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
      alert('You clicked on: ' + 0)
    }, 3000)
  }
  // ...
  ;<button onClick={handleAlertClick} /> // "0"이 안에 들어있음
  // ...
}

// 버튼을 클릭하면 Counter가 다시 호출됨
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 1)
    }, 3000)
  }
  // ...
  ;<button onClick={handleAlertClick} /> // "1"이 안에 들어있음
  // ...
}

// 버튼을 또 다시 클릭하면 Counter가 다시 호출됨
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 2)
    }, 3000)
  }
  // ...
  ;<button onClick={handleAlertClick} /> // "2"가 안에 들어있음
  // ...
}
```

이것이 [이 데모에서]() 이벤트 핸들러가 특정 렌더링에 "종속"되어 있는 이유이며, 버튼을 클릭했을 때 이벤트 핸들러가 해당 렌더링 순간의 `counter` state를 사용하는 이유입니다.

**특정 렌더링 때 존재하는 props와 state는 영원히 같은 state로 유지됩니다.**

참고: 위 예제에서 저는 `handleAlertClick` 함수 안에 구체적인 `count` 값을 (변수 이름 대신) 치환하여 표시했습니다. 이는 `count`가 상수이고, 또 숫자이기 때문에 별 상관없습니다. 숫자 말고 다른 값에 대해서도 이러한 방식으로 생각하는 것은 괜찮지만, 객체의 경우엔 오로지 불변 객체를 사용한다는 전제가 있어야만 합니다. 예를 들어, `setSomething(newObj)`와 같이 기존의 객체를 변경시키는 것이 아니라 새로운 객체를 생성하여 전달하는 것은 이전 렌더링에 속해있는 state를 변경시키는 것이 아니기 때문에 괜찮습니다.

## 모든 렌더링은 각자의 effect를 가진다 (Each Render Has Its Own Effects)

이제 진짜로 effect에 대해서 살펴봅시다! 사실, effect라고 해서 크게 다른 건 없습니다. [공식 문서](https://reactjs.org/docs/hooks-effect.html)에 있는 예제를 살펴봅시다:

```jsx{4-6}
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = `You clicked ${count} times`
  })

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
```

여기서 질문! effect는 어떻게 해서 최신의 `count` state를 읽는 걸까요? 혹시 "데이터 바인딩"과 같은 무언가 특별한 일이 이펙트 함수 내에서 일어나는 걸까요? 아니면 `count`가 가변 변수라서 effect가 항상 최신 값을 읽을 수 있게끔 React가 값을 세팅해 주는 걸까요?

전부 아닙니다! 🙅

이미 우리는 `count`가 특정 렌더링에 속한 상수라는 것을 잘 알고 있습니다. `count`는 특정 렌더링 때의 스코프에 속하는 상수이기 때문에 이벤트 핸들러는 그 렌더링에 속한 `count`를 볼 수 있습니다. Effect도 이와 마찬가지입니다!

**변하지 않는 이펙트 내에서 `count` 값이 어찌어찌 변하는 것이 아닙니다. 변하는 것은 이펙트 입니다. Effect는 매 렌더링마다 변하게 됩니다.**

(렌더링마다 변하는) 각각의 이펙트는 해당 이펙트가 속하는 렌더링 내의 `count`를 "보는" 것입니다. 마치 앞서 살펴본 이벤트 핸들러의 경우처럼요:

```jsx{5-8,17-20,29-32}
// 첫 렌더링 시
function Counter() {
  // ...
  useEffect(
    // 첫 렌더링 때의 이펙트 함수
    () => {
      document.title = `You clicked ${0} times`
    }
  )
  // ...
}

// 버튼을 다시 클릭하면 Counter가 다시 호출됨
function Counter() {
  // ...
  useEffect(
    // 두 번째 렌더링 때의 이펙트 함수
    () => {
      document.title = `You clicked ${1} times`
    }
  )
  // ...
}

// 버튼을 또 다시 클릭하면 Counter가 다시 호출됨
function Counter() {
  // ...
  useEffect(
    // 세 번째 렌더링 때의 이펙트 함수
    () => {
      document.title = `You clicked ${2} times`
    }
  )
  // ..
}
```

React는 여러분이 제공한 이펙트 함수를 기억해 두었다가, DOM에 변화를 반영(flush)하고 스크린에 페인팅을 하고 난 후에 실행합니다. 지금 우리는 하나의 개념으로 "이펙트"를 이야기하고 있지만, 실질적으로 이펙트는 매 렌더링마다 서로 다른 함수입니다. 그리고 이렇게 서로 다른 각각의 이펙트 함수들은 자신들이 속한 렌더링에 존재하는 props와 state를 참조하는 것입니다.

(엄밀히 따지자면 아니지만) 개념적으로 이펙트를 렌더링 결과의 일부로 생각할 수 있습니다. 현재 멘탈 모델을 형성하고 있는 과정에서, 이펙트 함수들은 (이벤트 핸들러의 경우처럼) 특정 렌더링에 종속된다고 생각하셔도 좋습니다.

여기까지 잘 이해했는지를 점검하기 위해, 첫 번째 렌더링을 되짚어 봅시다:

- **React**: state가 `0`일때의 UI를 보여줘.
- **컴포넌트**:
  - 여기있어: `<p>You clicked 0 times</p>`.
  - 아, 그리고 이 이펙트를 실행하는 것을 잊지마: `() => { document.title = 'You clicked 0 times' }`
- **React**: 물론이지. UI를 업데이트 해야겠어. 브라우저야, DOM에 뭘 좀 추가하려고 해.
- **브라우저**: 좋아. 화면에 페인팅할게.
- **React**: 좋아. 이제 컴포넌트가 준 이펙트를 실행해야겠어.
  - `() => { document.title = 'You clicked 0 times' }` 실행

<br/>

이번엔 클릭 이후에 어떤 일이 일어나는지를 되짚어 봅시다:

- **컴포넌트**: React야, 내 state를 `1`로 바꿔줘.
- **React**: 좋아. state가 `1`일때의 UI를 보여줘.
- **컴포넌트**:
  - 여기있어: `<p>You clicked 1 times</p>`.
  - 아, 그리고 이 이펙트를 실행하는 것을 잊지마: `() => { document.title = 'You clicked 1 times' }`
- **React**: 물론이지. UI를 업데이트 해야겠어. 브라우저야, DOM을 변경할게!
- **브라우저**: 좋아. 화면에 변경사항을 페인팅할게.
- **React**: 좋아. 이제 방금 렌더링에 속한 이펙트를 실행해야겠어.
  - `() => { document.title = 'You clicked 1 times' }` 실행

## 모든 렌더링은 각자의 고유한 모든것을 가진다 (Each Render Has Its Own… Everything)

이제 우리는 이펙트가 매 렌더링 때마다 실행되고, 개념적으론 렌더링 결과의 일부이며 특정 렌더링에 속한 props와 state를 "볼 수 있다"는 사실을 알고 있습니다.

한번 사고실험을 해봅시다. 다음의 코드를 봐주세요:

```jsx{4-8}
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setTimeout(() => {
      console.log(`You clicked ${count} times`)
    }, 3000)
  })

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
```

만약 제가 조금씩 끊어서 버튼을 여러 번 누른다면 어떤 결과가 일어날까요?

만약 이 문제가 일종의 함정이라고 생각해서 결과가 예상과는 다를 거라고 생각하셨을 수도 있지만, 아닙니다! 각 `setTimeout`은 각각의 렌더링에 속하기 때문에 해당 렌더 시의 `count`를 참조합니다. [직접 실험해 보세요!](https://codesandbox.io/s/lyx20m1ol)

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/a-complete-guide-to-useeffect/timeout_counter.gif" alt="Timeout counter demo" />
</figure>

혹은, "아니 당연히 저렇게 동작하겠지!" 라고 생각하셨을 수도 있겠습니다만... [클래스 컴포넌트](https://codesandbox.io/s/kkymzwjqz3)에서는 아닙니다 😂

```jsx
componentDidUpdate() {
  setTimeout(() => {
    console.log(`You clicked ${this.state.count} times`);
  }, 3000);
}
```

여기서 `this.state.count`는 각 렌더링에 속하는 state 대신 항상 최신의 state를 참조합니다. 따라서 `5`가 다섯 번 출력되는 것을 보실 겁니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/a-complete-guide-to-useeffect/timeout_counter_class.gif" alt="Timeout counter class demo" />
</figure>

정작 자바스크립트 클로저와 훨씬 연관된 건 hook인데 [전통적으로 클로저와 관련된](http://wsvincent.com/javascript-scope-closures/#closures-in-the-wild) 문제는 클래스 컴포넌트에서 더 많이 발생한다는 것이 참 아이러니합니다. 사실 이 예제에서 발생하는 문제의 원인은 클로저 그 자체가 아니라, 변이, 즉 React가 `this.state`가 최신 state의 값을 가리키도록 변경하기 때문입니다.

**클로저는 클로저로 감싸려고(close over, 즉 접근하려고)하는 값이 절.대.로. 바뀌지 않는 경우에 유용합니다. 이렇게 하면 근본적으로 상수를 참조하는 것이기 때문에 생각하기 쉽도록 만들어줍니다.** 그리고 우리가 앞서 살펴봤듯이 props와 state는 특정 렌더링 내에선 절.대. 바뀌지 않습니다.

(그나저나 위 클래스 컴포넌트 버전의 문제는 [클로저를 이용해서](https://codesandbox.io/s/w7vjo07055) 고칠 수 있습니다..😂)

## 흐름을 거슬러 올라가기 (Swimming Against the Tide)

이쯤에서, 다시 한번 이 구절을 되짚어봅시다: "컴포넌트 렌더링 내에 존재하는 모든 함수 (이벤트 핸들러, 이펙트, 타임아웃 혹은 API 호출 등)는 해당 함수를 정의한 렌더링 당시의 props와 state를 캡처합니다".

따라서 아래의 두 예제는 사실상 동일합니다:

```jsx{4}
function Example(props) {
  useEffect(() => {
    setTimeout(() => {
      console.log(props.counter)
    }, 1000)
  })
  // ...
}
```

```jsx{2,5}
function Example(props) {
  const counter = props.counter
  useEffect(() => {
    setTimeout(() => {
      console.log(counter)
    }, 1000)
  })
  // ...
}
```

**컴포넌트 내에서 props나 state를 얼마나 일찍 읽어들였는지는 사실 상관이 없습니다.** 왜냐면 이들은 변하지 않을 테니까요! 한 렌더링의 스코프 내에서 props와 state는 항상 변하지 않은 채 남아있게 됩니다.

물론, 때로는 이벤트 내에 정의한 콜백에서 사전에 캡처한 값 말고 최신의 값을 읽고 싶을 때가 있습니다. 가장 쉬운 방법은 `ref`를 이용하는 방법인데, [이 포스트](https://overreacted.io/how-are-function-components-different-from-classes/)의 마지막 섹션에 설명되어 있습니다.

과거의 렌더링 시점에서 미래의 props 혹은 state를 읽는 것은 흐름을 거슬러 올라가는 것임을 유의하세요. 물론 이는 잘못된 것이 아니지만 (사실 때로는 필요하기도 합니다), 일반적인 패러다임에서 벗어나는 것이 덜 깨끗해 보일 수 있으니까요. 사실 이는 의도된 결과인데 이렇게 하면 코드의 연약한 부분과 타이밍에 민감한 부분을 잘 나타낼 수 있습니다. 클래스 컴포넌트에서는 언제 이러한 일이 일어나는지 잘 보이지 않을 수가 있습니다.

아래의 코드는 앞서 살펴본 클래스 컴포넌트 카운터 예제를 `ref`를 이용하여 따라한 버전입니다:

```jsx{3,6-7,9-10}
function Example() {
  const [count, setCount] = useState(0);
  const latestCount = useRef(count);

  useEffect(() => {
    // 변경 가능한 최신의 값으로 설정
    latestCount.current = count;
    setTimeout(() => {
      // 변경 가능한 최신의 값을 참조
      console.log(`You clicked ${latestCount.current} times`);
    }, 3000);
  });
  // ...
```

[예제](https://codesandbox.io/s/rm7z22qnlp)

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/a-complete-guide-to-useeffect/timeout_counter_refs.gif" alt="Timeout counter with ref demo" />
</figure>

React에서 무언가를 변이 시킨다는 것이 이상해 보일 수 있습니다. 하지만 이는 React가 클래스에서 `this.state`를 변경하는 방식과 동일합니다. 캡처된 props, state와는 달리 특정 콜백에서 `latestCount.current`를 읽을 때 언제나 같은 값을 읽을 거라는 보장은 없습니다. 정의된 바에 따라 언제든 그 값을 변경할 수 있습니다. 그렇기 때문에 이는 React에서 기본적인 동작이 아니며 여러분이 직접 가져다 사용해야 합니다.

## 클린업이란 무엇인가? (So What About Cleanup?)

[공식 문서](https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup)에서 설명한 대로, 몇몇 effect들은 클린업 단계를 거칠 수도 있습니다. 본질적으로 클린업은 구독과 같은 effect를 "되돌리는(undo)" 것입니다. 다음의 코드를 살펴봅시다:

```jsx
useEffect(() => {
  ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange)
  return () => {
    ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange)
  }
})
```

첫 번째 렌더링에서 `props`는 `{id: 10}`이고, 두 번째 렌더링에선 `{id: 20}`이라고 해봅시다. 아마 여러분은 다음과 같은 일이 일어날 것이라고 생각하실 겁니다:

- React가 `{id: 10}`인 effect를 클린업 한다.
- `{id: 20}`일 때의 UI를 렌더링 한다.
- `{id: 20}`일 때의 effect를 실행한다.

하지만 실제론 이와 조금 다릅니다.

이러한 멘탈 모델 대로라면, 클린업이 리렌더링 되기 전에 실행되기 때문에 이전의 props를 볼 수 있고, 새로운 이펙트는 리렌더링 이후에 실행되기 때문에 새로운 props를 본다고 생각할 수 있습니다. 사실 이는 클래스 컴포넌트의 라이프 사이클을 그대로 반영한 것이라, **여기서는 잘못된 내용입니다**. 왜 그런지 살펴봅시다.

React는 [브라우저가 페인팅을 하고 나서야](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f) effect를 실행합니다. 이렇게 하면 화면 업데이트를 blocking하지 않기 때문에 앱을 더 빠르게 할 수 있습니다. 물론 이펙트 클린업 또한 미뤄지고요. **이전 effect의 클린업은 새로운 props와 함께 리렌더링 되고 난 뒤에 수행됩니다:**

- React가 `{id: 20}`일 때의 UI를 렌더링 한다.
- 브라우저가 페인팅 한다. 이제 사용자는 `{id: 20}`일 때의 UI를 화면에서 볼 수 있다.
- React가 `{id: 10}`인 effect를 클린업 한다.
- `{id: 20}`일 때의 effect를 실행한다.

하지만 여기서, "그럼 어떻게 이전 effect의 클린업이 현재 props가 `{id: 20}`임에도 불구하고 여전히 `{id: 10}`인 이전 props를 볼 수 있는 거지? " 하고 궁금하실 수도 있을 겁니다.

어.. 근데 이거 어디서 겪어본 상황 같지 않나요? 🤔

전에 살펴본 단락을 인용해 보자면:

> 컴포넌트 렌더링 내에 존재하는 모든 함수 (이벤트 핸들러, 이펙트, 타임아웃 혹은 API 호출 등)는 해당 함수를 정의한 렌더링 당시의 props와 state를 캡처합니다

이제 답이 명확해진 것 같네요! 이펙트 클린업은 "최신" 버전의 props를 읽는 것이 아니라, 해당 이펙트 클린업 (함수)가 정의된 렌더링 당시의 props를 읽습니다.

```jsx{8-11}
// 첫 번째 렌더링. props는 {id: 10} 이다.
function Example() {
  // ...
  useEffect(
    // 첫 렌더링의 이펙트
    () => {
      ChatAPI.subscribeToFriendStatus(10, handleStatusChange)
      // 첫 렌더링의 (이펙트의) 클린업
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(10, handleStatusChange)
      }
    }
  )
  // ...
}

// 그 다음 렌더링. props는 {id: 20} 이다.
function Example() {
  // ...
  useEffect(
    // 두 번째 렌더링의 이펙트
    () => {
      ChatAPI.subscribeToFriendStatus(20, handleStatusChange)
      // 두 번째 렌더링의 (이펙트의) 클린업
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(20, handleStatusChange)
      }
    }
  )
  // ...
}
```

이것이 React로 하여금 페인팅 이후에 이펙트를 다룰 수 있게 하는 방식입니다. 이전의 props (그리고 state) 들은 원한다면 계속해서 남아있습니다.

## 라이프 사이클이 아니라 동기화 (Synchronization, Not Lifecycle)

제가 React에서 좋아하는 것 중 하나는 React가 첫 렌더링 결과물과 업데이트를 통합해서 표현하고 있다는 점입니다. 이는 [프로그램의 엔트로피를 줄일 수 있습니다](https://overreacted.io/the-bug-o-notation/).

다음의 컴포넌트 예시를 살펴봅시다:

```jsx
function Greeting({ name }) {
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

제가 처음엔 `<Greeting name="Dan" />`을 렌더링 한 다음 `<Greeting name="Yuzhi" />`을 렌더링 하든지, 아예 처음부터 `<Greeting name="Yuzhi" />`을 렌더링 하는지는 별 상관없습니다. 결국에는 두 경우 모두에서 "Hello, Yuzhi"를 보게 될 테니까요.

"결과가 중요한 게 아니라 과정이 중요하다" 라는 말이 있습니다. 하지만 React에서는 정반대입니다. React에서는 과정보다 결과가 더 중요합니다.

React는 현재의 props와 state에 맞춰 DOM을 동기화합니다. 렌더링 시 "마운트"와 "업데이트" 간에 차이는 없습니다.

이펙트도 이와 비슷한 방식으로 생각하셔야 합니다. **`useEffect`는 React 트리 바깥에 있는 것들을 props와 state에 따라 동기화합니다.** (React 트리 바깥이라는 말은 API 호출과 같이 React가 관리하지 않는 것이라고 볼 수 있을 것 같습니다?)

```jsx{2-4}
function Greeting({ name }) {
  useEffect(() => {
    document.title = `Hello, ${name}`;
  });

  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

이는 우리가 친숙한 마운트/업데이트/언마운트 멘탈 모델과는 사뭇 다릅니다. 이러한 차이를 이해해서 내 것으로 만드는 것이 중요합니다. **만약 컴포넌트가 최초로 렌더링했을 때와 다르게 동작하는 이펙트를 작성하려고 하신다면 여러분은 흐름을 거스르고 있는 것입니다!** 이렇게 한다면 우리의 결과가 "목적지"가 아니라 "과정(journey)"에 좌우된다면 동기화에 실패하게 될 것입니다.

우리가 props A, B, C 순서로 렌더링하든지 바로 C로 렌더링하든지 간에 그 차이가 없어야만 합니다. 물론 잠깐의 차이가 있을 수 있지만 (예를 들면 데이터를 불러온다든지), 결국 최종 결과물은 동일해야만 합니다.

당연하겠지만 매 렌더링마다 이펙트를 실행하는 것은 비효율적일 수 있습니다. 그리고 어느 경우엔 무한 루프가 발생할 수도 있고요.

그럼 이걸 어떻게 고칠 수 있을까요?