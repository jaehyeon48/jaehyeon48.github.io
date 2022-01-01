---
title: 'useEffect 완벽 가이드'
date: 2021-12-24
category: 'react'
draft: false
---

이 포스트는 [A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)를 번역/요약한 글입니다. 원글의 작성일이 2019년 3월인 것을 감안해 주세요!

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

저게 도대체 무엇을 의미하는 걸까요? `count`가 state의 변화를 어찌어찌 "관찰"해서 자동으로 업데이트하는 걸까요? 글쎄요, React를 처음 배우면서 직관적으로 그렇게 생각할 수는 있으나 사실 이는 [정확한 멘탈 모델](../react-as-a-ui-runtime)이 아닙니다.

여기서 `count`는 "데이터 바인딩", "watcher", "프록시" 와 같은 그 어느 것도 아닙니다. **이 예제에서 `count`는 단순히 숫자에 불과합니다.** 아래와 같이 말이죠:

```jsx
const count = 42;
// ...
<p>You clicked {count} times</p>
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

만약 실행 결과가 잘 이해되지 않는다면, 좀 더 실질적인 예시를 한번 생각해 봅시다. 채팅 앱에서, 현재 state로 수신자 ID를 가지고 있고 전송 버튼을 누른 경우를 상상해 봅시다. 왜 alert에 3이 출력되었는지에 대해선 [이 글](https://overreacted.io/how-are-function-components-different-from-classes/)이 자세히 설명해 줄 것입니다.

Alert는 제가 버튼을 눌렀을 때의 state를 "캡처" 한 것입니다.

하지만 왜 이렇게 동작하는 걸까요?

앞서 우리는 `count` 값이 매번 호출되는 함수 (컴포넌트)에 대한 "상수"임을 살펴봤습니다. 저는 이걸 특히 강조하고 싶은데, **우리의 함수 (컴포넌트)는 매번 렌더링 될 때마다 호출되지만, 각 순간마다 해당 함수에 존재하는 `count` 값은 해당 렌더링 때의 state 값을 가지는 "상수"입니다.**

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

[이 예제](https://codesandbox.io/s/mm6ww11lk8)에서 (함수) 외부의 `someone` 변수는 React 어딘가에서 컴포넌트의 현재 state가 바뀌는 것처럼 여러 번 재할당 되고 있습니다. 하지만 `sayHi` 함수 내에는 특정 호출 시의 `person`과 연관된 `name` 이라는 지역 상수가 존재합니다. 이 상수는 지역 상수이므로 각각의 함수 호출과는 분리되어 있습니다. 이로 인해 타임아웃이 발생했을 때 각 alert가 해당 alert를 발생시킨 함수 호출 시의 `name`을 "기억"하는 것입니다. 만약 `name`이 각 함수 호출과 분리되어 있지 않다면 결과적으로 `Dominic`만 세 번 출력되겠죠?

이를 통해 어떻게 이벤트 핸들러가 버튼을 클릭한 순간의 `count` 값을 "캡처"할 수 있는지에 대해 알 수 있습니다:

```jsx{3,15,27}
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

// 버튼을 클릭하면 Counter가 다시 호출됨
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

이것이 [이 데모에서]() 이벤트 핸들러가 특정 렌더링에 "종속"되어 있는 이유이며, 버튼을 클릭했을 때 이벤트 핸들러가 해당 렌더링 순간의 `counter` state를 사용하는 이유입니다.

**특정 렌더링 때 존재하는 props와 state는 영원히 같은 state로 유지됩니다.**

참고: 위 예제에서 저는 `handleAlertClick` 함수 안에 구체적인 `count` 값을 (변수 이름 대신) 치환하여 표시했습니다. 이는 `count`가 상수이고, 또 숫자이기 때문에 별 상관없습니다. 숫자 말고 다른 값에 대해서도 이러한 방식으로 생각하는 것은 괜찮지만, 객체의 경우엔 오로지 불변 객체를 사용한다는 전제가 있어야만 합니다. 예를 들어, `setSomething(newObj)`와 같이 기존의 객체를 변경시키는 것이 아니라 새로운 객체를 생성하여 전달하는 것은 이전 렌더링에 속해있는 state를 변경시키는 것이 아니기 때문에 괜찮습니다.

## 모든 렌더링은 각자의 effect를 가진다 (Each Render Has Its Own Effects)

이제 진짜로 effect에 대해서 살펴봅시다! 사실, effect라고 해서 크게 다른 건 없습니다. [공식 문서](https://reactjs.org/docs/hooks-effect.html)에 있는 예제를 살펴봅시다:

```jsx{4-6}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

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
      document.title = `You clicked ${0} times`;
    }
  );
  // ...
}

// 버튼을 다시 클릭하면 Counter가 다시 호출됨
function Counter() {
  // ...
  useEffect(
    // 두 번째 렌더링 때의 이펙트 함수
    () => {
      document.title = `You clicked ${1} times`;
    }
  );
  // ...
}

// 버튼을 다시 클릭하면 Counter가 다시 호출됨
function Counter() {
  // ...
  useEffect(
    // 세 번째 렌더링 때의 이펙트 함수
    () => {
      document.title = `You clicked ${2} times`;
    }
  );
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
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      console.log(`You clicked ${count} times`);
    }, 3000);
  });

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
      console.log(props.counter);
    }, 1000);
  });
  // ...
}
```

```jsx{2,5}
function Example(props) {
  const counter = props.counter;
  useEffect(() => {
    setTimeout(() => {
      console.log(counter);
    }, 1000);
  });
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

## 클린업은 어떻게 하나요? (So What About Cleanup?)

[공식 문서](https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup)에서 설명한 대로, 몇몇 effect들은 클린업 단계를 거칠 수도 있습니다. 본질적으로 클린업은 구독과 같은 effect를 "되돌리는(undo)" 것입니다. 다음의 코드를 살펴봅시다:

```jsx
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
    };
  });
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
      ChatAPI.subscribeToFriendStatus(10, handleStatusChange);
      // 첫 렌더링의 (이펙트의) 클린업
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(10, handleStatusChange);
      };
    }
  );
  // ...
}

// 그 다음 렌더링. props는 {id: 20} 이다.
function Example() {
  // ...
  useEffect(
    // 두 번째 렌더링의 이펙트
    () => {
      ChatAPI.subscribeToFriendStatus(20, handleStatusChange);
      // 두 번째 렌더링의 (이펙트의) 클린업
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(20, handleStatusChange);
      };
    }
  );
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
    document.title = 'Hello, ' + name;
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

## 이펙트를 비교하는 법 가르치기 (Teaching React to Diff Your Effects)

이미 우리가 배웠듯이, React는 실제로 변화가 생긴 부분에 대해서만 DOM을 업데이트 합니다.

아래 컴포넌트를

```jsx
<h1 className="Greeting">
  Hello, Dan
</h1>
```

이렇게 바꾼다면

```jsx
<h1 className="Greeting">
  Hello, Yuzhi
</h1>
```

React는 다음의 두 객체를 비교하게 됩니다:

```jsx
const oldProps = { className: 'Greeting', children: 'Hello, Dan' };
const newProps = { className: 'Greeting', children: 'Hello, Yuzhi' };
```

각각의 props를 살펴보고 `children`이 바뀌었기 때문에 DOM 업데이트가 필요하다는 것을 알았습니다. 하지만 `className`은 그대로이므로 React는 아래와 같이 행동할 것입니다:

```js
domNode.innerText = 'Hello, Yuzhi';
// domNode.className 은 건드릴 필요가 없다
```

이걸 이펙트에도 적용할 수 있을까요? 굳이 이펙트를 적용할 필요가 없는 경우엔 이펙트를 실행하지 않는 것이 더 좋을 테니까요.

예를 들어, state가 변경되어 컴포넌트가 리렌더링 되었다고 해봅시다:

```jsx{11-13}
function Greeting({ name }) {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    document.title = 'Hello, ' + name;
  });

  return (
    <h1 className="Greeting">
      Hello, {name}
      <button onClick={() => setCounter(count + 1)}>
        Increment
      </button>
    </h1>
  );
}
```

하지만 여기서 이펙트는 `counter` state를 사용하고 있지 않습니다. 이펙트는 현재 `document.title`과 `name` prop을 동기화하고 있지만, `name` prop은 바뀌지 않았습니다. 따라서 `counter`가 바뀔 때마다 `document.title`을 다시 할당하는 것은 그다지 바람직하지 않은 것 같습니다.

좋습니다 그럼... React가 이펙트를 비교하도록 하면 안될까요?

```js
let oldEffect = () => { document.title = 'Hello, Dan'; };
let newEffect = () => { document.title = 'Hello, Dan'; };
// React가 위 두 함수를 같은 함수라고 인식할 수 있을까요?
```

흠...  그렇게는 안 될 것 같네요. React는 실제로 함수를 호출하지 않고서는 함수가 무엇을 하는지 알아낼 수 없습니다. (저 코드는 어떤 특정한 값을 담고 있는 것이 아니라, `name` prop에 있는 것을 가져온 것뿐입니다.)

이로 인해 특정 이펙트가 불필요하게 재실행되는 것을 방지하기 위해 `useEffect`의 인자로 의존성 배열 ("dep"이라고도 불리는 녀석입니다) 을 넘기는 이유입니다:

```jsx{3}
useEffect(() => {
  document.title = 'Hello, ' + name;
}, [name]); // 우리의 의존성
```

위 코드는 마치 React에게 "React야, 이펙트에서 `name` 말고 다른 값은 사용하지 않는다고 약속할게!"라고 하는 것과 같습니다.

이전에 이펙트를 실행했을 때와 현재 이펙트를 실행하는 순간에 대해, 의존성 배열에 있는 각각의 값들이 모두 동일하다면 동기화할 것이 없으므로 React는 해당 이펙트의 실행을 건너뛰게 됩니다:

```jsx
const oldEffect = () => { document.title = 'Hello, Dan'; };
const oldDeps = ['Dan'];

const newEffect = () => { document.title = 'Hello, Dan'; };
const newDeps = ['Dan'];

// React는 함수 안을 들여다볼 순 없으나, dep을 비교할 순 있다.
// 모든 dep이 같으므로 새 effect를 실행할 필요가 없다.
```

만약 의존성 배열에 있는 값 중 단 하나라도 이전과 다르다면 이펙트는 실행됩니다. (동기화 해야 하기 때문이죠!)

## React에게 의존성으로 거짓말 하지 마세요 (Don’t Lie to React About Dependencies)

React에게 의존성으로 거짓말을 하게 되면 나쁜 결과가 발생할 수 있습니다. 직관적으로 이는 말이 되지만, 저는 클래스 컴포넌트에 적합한 멘탈 모델을 가진 많은 사람들이 `useEffect`를 쓸 때 그 규칙을 어기려는 모습을 많이 봐왔습니다. (물론 저도 처음엔 그랬구요!)

```jsx
function SearchResults() {
  async function fetchData() {
    // ...
  }

  useEffect(() => {
    fetchData();
  }, []); // 이게 맞을까요? 항상 그렇진 않구요.. 더 좋은 방식으로 코드를 짜는 방법이 있습니다.

  // ...
}
```

([Hooks FAQ](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies) 에서 그 대신 어떻게 해야하는지 설명하고 있습니다.)

"하지만 저는 마운트될 때만 이펙트를 실행하고 싶어요!" 라고 하실 수도 있습니다. 하지만 일단 외워두세요: deps를 지정할 땐 **이펙트가 사용하고 있는 컴포넌트 안의 모든 값들은 deps에 포함되어야 합니다."** props, state, 함수 그 무엇이든 간에요.

이런 식으로 하면 가끔 무한 루프가 발생한다든가, 소켓이 너무 자주 재연결 되는 등의 문제가 생길 순 있습니다. 하지만 이에 대한 해결책은 deps를 제거하는 것이 아닙니다! 이 해결책에 대해선 잠시 후에 살펴봅시다.

근데 일단 해결책을 살펴보기 전에, 문제를 좀 더 자세히 알아봅시다.

## 의존성으로 거짓말 하면 생기는 일 (What Happens When Dependencies Lie)

만약 이펙트가 사용하는 모든 값을 deps에 명시한다면 React는 언제 이펙트를 재실행해야 하는지 알 수 있습니다:

```jsx{3}
useEffect(() => {
  document.title = 'Hello, ' + name;
}, [name]);
```

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/a-complete-guide-to-useeffect/deps-compare-correct.gif" alt="Diagram of effects replacing one another" />
    <figcaption>의존성 값이 다르기 때문에 이펙트를 재실행</figcaption>
</figure>

하지만 여기서 의존성을 `[]`로 명시한다면 이펙트 함수가 새로 실행되지 않을 겁니다:

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, []); // 잘못된 의존성
```

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/a-complete-guide-to-useeffect/deps-compare-wrong.gif" alt="Diagram of effects replacing one another" />
    <figcaption>의존성 값이 같기 때문에 이펙트를 재실행 하지 않음</figcaption>
</figure>

이 경우엔 문제가 꽤 명확해 보입니다. 하지만 다른 경우에선 클래스 컴포넌트 방식의 해결책이 튀어나와 이러한 직관을 방해할 수 있습니다.

예를 들어 매 초마다 값을 증가시키는 카운터를 작성한다고 해봅시다. 클래스 컴포넌트로 작성한다면, [이 예제](https://codesandbox.io/s/n5mjzjy9kl)에서와같이 우리는 "인터벌을 한 번만 설정하고, 한 번만 해제하자"가 될 겁니다. 이걸 `useEffect` 방식으로 옮긴다면 다음과 같이 직관적으로 deps를 `[]`로 작성할 겁니다. "이걸 한 번만 실행하고 싶어" 라고요:

```jsx{9}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```

하지만 이 예제는 값을 [오직 한 번만](https://codesandbox.io/s/91n5z8jo7r) 증가시킵니다. 이럴 수가..

만약 여러분의 멘탈 모델이 "의존성 배열은 내가 언제 이펙트를 재실행하고 싶은지 지정할 때 사용된다" 와 같다면 위 예제를 보았을 때 큰 혼란에 휩싸이게 될 것입니다. 당연히 인터벌이니까 한 번만 실행하고 싶으시겠죠. 뭐가 문제일까요?

반면 의존성 배열은 이펙트가 한 렌더링의 스코프 내에서 사용하는 모든 것에 대해 React에게 알려주는 힌트라고 생각하신다면 위 예제가 왜 저렇게 동작하는지 이해가 되실 겁니다. 위 예제에서는 `count`를 사용하고 있지만 이를 deps에 추가하지 않고 `[]`라고 거짓말을 했습니다. 이 거짓말 때문에 버그가 생기는 것은 시간문제입니다!

첫 번째 렌더링에서 `count`의 값은 `0` 입니다. 따라서 첫 번째 렌더링에서의 `setCount(count + 1)`는 실제로 `setCount(0 + 1)`을 의미합니다. 이때, deps가 `[]` 이므로 이펙트는 첫 렌더링 이후에 다시 실행되지 않고, 결과적으로 매 초마다 `setCount(0 + 1)`을 호출하게 됩니다.

```jsx{8,12,21-22}
// 첫 렌더링. state는 0
function Counter() {
  // ...
  useEffect(
    // 첫 렌더링의 이펙트
    () => {
      const id = setInterval(() => {
        setCount(0 + 1); // 항상 setCount(1)
      }, 1000);
      return () => clearInterval(id);
    },
    [] // 절대 재실행되지 않음
  );
  // ...
}

// 그 다음 렌더링. state는 1
function Counter() {
  // ...
  useEffect(
    // 우리가 React에게 deps가 없다고 거짓말을 했기 때문에
    // 이 이펙트는 항상 스킵됨
    () => {
      const id = setInterval(() => {
        setCount(1 + 1);
      }, 1000);
      return () => clearInterval(id);
    },
    []
  );
  // ...
}
```

우리의 이펙트는 컴포넌트 안에 존재하는 `count`를 참조하고 있습니다:

```jsx{1,5}
  const count = // ...

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
```

따라서 deps를 `[]`라고 하면 버그가 발생할 것입니다. React는 의존성을 비교하여 이펙트 재실행을 스킵하게 됩니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/a-complete-guide-to-useeffect/interval-wrong.gif" alt="Diagram of stale interval closure" />
    <figcaption>의존성 값이 같기 때문에 이펙트를 재실행 하지 않음</figcaption>
</figure>

이러한 이슈는 고려하기 어렵기 때문에, 저는 여러분께 언제나 이펙트의 의존성을 솔직하게 전부 명시하라고 권장하고 싶습니다.

## 의존성에 대해 솔직해지는 두 가지 방법

의존성을 솔직하게 적는 데에는 두 가지 방법이 있습니다. 우선 첫 번째 방법으로 시작하여 필요하면 두 번째 방법을 사용하는 것을 추천합니다.

**첫 번째 방법은 이펙트 내에서 사용되는 컴포넌트 안의 모든 값을 의존성 배열에 넣는 것입니다.** deps에 `count`를 한 번 추가해 봅시다:

```jsx{3,6}
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);
```

이렇게 해서 올바른 의존성 배열을 작성하였습니다. 이상적이지 않을 순 있으나 우리가 고쳐야 할 첫 번째 이슈를 해결했습니다. 이제 `count` 값이 변경되면 이펙트가 재실행되어 매번 다음 인터벌에서 `setCount(count + 1)` 구문은 해당 렌더링 시점의 `count` 값을 참조하게 됩니다.

```jsx{8,12,24,28}
// 첫 번째 렌더링. state는 0
function Counter() {
  // ...
  useEffect(
    // 첫 렌더링의 이펙트
    () => {
      const id = setInterval(() => {
        setCount(0 + 1); // setCount(count + 1)
      }, 1000);
      return () => clearInterval(id);
    },
    [0] // [count]
  );
  // ...
}

// 두 번째 렌더링. state는 1
function Counter() {
  // ...
  useEffect(
    // 두 번째 렌더링의 이펙트
    () => {
      const id = setInterval(() => {
        setCount(1 + 1); // setCount(count + 1)
      }, 1000);
      return () => clearInterval(id);
    },
    [1] // [count]
  );
  // ...
}
```

[이렇게 해서](https://codesandbox.io/s/0x0mnlyq8l) 문제를 고칠 수 있게 되었지만, `count`가 변할 때마다 매번 인터벌을 설정하고 해제하는 것이 썩 맘에 들진 않습니다.

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/a-complete-guide-to-useeffect/interval-rightish.gif" alt="Diagram of interval that re-subscribes" />
    <figcaption>의존성 값이 다르기 때문에 이펙트를 재실행</figcaption>
</figure>

**두 번째 방법은 이펙트를 수정함으로써 우리가 원하는 것보다 더 자주 바뀌는 값을 필요로 하지 않게 하는 것입니다.** 이는 의존성에 대해 거짓말을 하는 것이 아니라, 의존성을 줄이기 위해 이펙트를 수정하는 것입니다.

의존성을 줄이는 몇 가지 공통적인 테크닉을 살펴봅시다.

## 이펙트가 자급자족 하도록 만들기 (Making Effects Self-Sufficient)

현재 우리는 의존성에서 `count`를 제거하도록 만들고 싶습니다.

```jsx{3,6}
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);
```

이렇게 하기 위해 우선 **무엇을 위해 `count`를 사용하고 있는지**에 대해 생각해 봐야 합니다. 여기선 `setCount`에서만 사용하고 있는 것 같군요. 사실 이 경우, 스코프에서 `count`를 사용할 필요가 전혀 없습니다. 이전 state를 기반으로 state를 업데이트하고 싶다면 `setState`의 [함수 형태의 업데이터](https://reactjs.org/docs/hooks-reference.html#functional-updates)를 사용할 수 있습니다:

```jsx{3}
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);
```

저는 이러한 경우를 "가짜 의존관계"라고 부르고 싶습니다. 맞아요. `setCount(count + 1)`에서 `count`를 사용하고 있었기 때문에 `count`는 이펙트에 필요한 의존성이었습니다. 하지만 `count + 1`을 하여 값을 1만큼 증가시킨 다음 다시 React에 돌려주기 위해 필요했던 겁니다. 하지만 React는 이미 현재의 `count` 값을 알고 있습니다. **우리가 해야하는 것은 그 값이 무엇이든 간에 값을 증가시키라고 React에게 말하는 겁니다.**

그리고 이는 `setCount(c => c + 1)`가 하고 있는 역할입니다. 이러한 업데이터 형태는 [여러 개의 업데이트를 배치 처리](../react-as-a-ui-runtime/#배치-작업-batching)하는 경우에서도 유용하게 사용될 수 있습니다.

이때, 여기서 **꼼수를 쓴 것이 아니라 의존성을 제거함으로써 문제를 해결했다는 것을 잘 알아두셔야 합니다. 우리의 이펙트는 더 이상 렌더링의 스코프에서 `counter` 값을 읽지 않습니다.** [예제](https://codesandbox.io/s/q3181xz1pj)

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/a-complete-guide-to-useeffect/interval-right.gif" alt="Diagram of interval that works" />
    <figcaption>의존성 값이 같기 때문에 이펙트를 재실행 하지 않음</figcaption>
</figure>

이렇게 하면 이펙트는 첫 렌더링 때 한 번만 실행되지만, 그때 등록된 인터벌은 `c => c + 1` 업데이터 함수를 통해 계속해서 값을 업데이트할 수 있습니다. 더 이상 인터벌이 현재의 `counter` 값을 알 필요가 없게 되었습니다. React가 이미 알고 있으니까요!

## 함수형 업데이트와 구글 독스 (Functional Updates and Google Docs)

앞서 어떻게 동기화가 이펙트의 멘탈 모델이 되는지에 대해 설명했는지 기억하시나요? 동기화의 흥미로운 부분은 시스템 간의 "메시지"를 state와 분리 시켜서 유지하고 싶을 때가 있다는 것입니다. 예를 들어, 구글 독스를 이용하여 문서를 편집할 때 (앱이) 실제로 모든 페이지를 서버에 전송하지는 않습니다. 이렇게 한다면 무척 비효율적이겠죠. 대신, 유저가 하고자 하는 것을 표현한 데이터를 보내게 됩니다.

우리의 케이스는 사뭇 다르겠지만 이와 비슷한 철학을 이펙트에도 적용할 수 있습니다. **이펙트 안에서 컴포넌트로 최소한의 정보만을 전달하는 것이 (성능에) 도움이 됩니다.** `setCount(count + 1)` 대신 `setCount(c => c + 1)`과 같은 형태는 현재의 `count`에 따라 "오염되지 않으므로" 명백히 더 적은 정보를 전달한다고 할 수 있습니다. 업데이터 형태는 오로지 동작(여기서는 "증가")만을 표현합니다. [React로 생각하기](https://reactjs.org/docs/thinking-in-react.html#step-3-identify-the-minimal-but-complete-representation-of-ui-state) 문서에는 최소한의 상태를 찾으라는 내용이 있는데, 동일한 원칙을 업데이트에도 적용할 수 있습니다.

결과 대신 의도를 나타내는 것은 구글 독스가 [협동 편집 기능](https://srijancse.medium.com/how-real-time-collaborative-editing-work-operational-transformation-ac4902d75682)에 관한 문제를 해결한 방법과 흡사합니다. 다소 과장된 비유일 수 있으나, 이는 함수형 업데이트가 React에서 하는 역할과 비슷합니다. 함수형 업데이트들은 (이벤트 핸들러, 이펙트 구독과 같은) 여러 소스에서 이루어지는 업데이트를 예측 가능한 방식으로 정확하게 모아서 처리할 수 있도록 보장합니다.

**하지만 `setCount(c => c + 1)`과 같은 형태도 그리 좋은 방법은 아닙니다.** 좀 이상해 보이기도 하고 할 수 있는 일이 굉장히 제한적입니다. 예를 들어 서로를 의존하는 두 개의 state가 있다든가, 혹은 prop을 기반으로 다음 state를 계산해야 하는 등의 상황에서 함수형 업데이트는 그다지 많은 도움이 되지 않습니다. 다행히도, `setCount(c => c + 1)`에는 `useReducer`라는 더욱 강력한 자매 패턴이 존재합니다.

## 액션으로 부터 업데이트 떼어내기 (Decoupling Updates from Actions)

이전에 살펴본 예제를 `count`와 `step` 두 가지 state를 가지는 컴포넌트로 바꿔봅시다. 이제 인터벌은 `step` 입력 값에 따라 `count` 값을 더하게 될 것입니다.

```jsx{7,10}
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + step);
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  return (
    <>
      <h1>{count}</h1>
      <input value={step} onChange={e => setStep(Number(e.target.value))} />
    </>
  );
}
```

([예제](https://codesandbox.io/s/zxn70rnkx))

이 예제에서 `step`이 변경되면 인터벌이 재시작됩니다 (이펙트의 의존성 중 하나이니까요!). 그리고 대부분의 경우 이게 우리가 원하는 결과입니다. 이펙트를 분해하여 재설정하는 것에 아무런 문제가 없습니다. 특별히 좋은 이유가 없는 한 이를 피할 필요가 없습니다.

하지만 만약 `step`이 변경되어도 인터벌을 리셋하고 싶지 않으면 어떻게 해야될까요? 이펙트 의존성에서 `step`을 어떻게 제거할 수 있을까요?

**어떤 state가 다른 state의 현재 값에 의존하는 경우, 이 둘을 (`useState` 대신) `useReducer`로 교체해야 할 수도 있습니다.**

`setSomething(sth => ...)`와 같은 함수 업데이트를 사용한다면 reducer 사용을 한번 고려해 보세요. **Reducer는 컴포넌트에서 발생한 "액션"에 대한 표현과, 그에 대한 반응으로 일어나는 state 업데이트를 분리하도록 해줍니다.**

`step` 의존성을 `dispatch` 의존성으로 바꿔봅시다:

```jsx{1,6,9}
const [state, dispatch] = useReducer(reducer, initialState);
const { count, step } = state;

useEffect(() => {
  const id = setInterval(() => {
    dispatch({ type: 'tick' }); //setCount(c => c + step); 대신
  }, 1000);
  return () => clearInterval(id);
}, [dispatch]);
```

([데모](https://codesandbox.io/s/xzr480k0np))

"이게 왜 더 좋은 건가요?"라고 물어보실 수도 있을텐데, 이렇게 하면 **컴포넌트가 유지되는 동안에는 `dispatch` 함수가 항상 같다는 것을 React가 보장합니다. 따라서 위 예제의 경우 인터벌이 재구독 되는 일은 발생하지 않습니다.**

이제 문제가 해결됐네요!

(아마 여러분은 `dispatch`, `setState`, `useRef`의 값이 항상 같다는 것을 React가 보장하기 때문에 이것들을 deps에서 뺄 수도 있습니다. 하지만 적는다고 해서 나쁠 건 없습니다 🙂)

변경된 예제에선 이펙트 안에서 state를 읽는것 대신에, 어떤 일이 일어났는지에 대한 정보를 담고 있는 "액션"을 발생시킵니다. 덕분에 우리의 이펙트를 `step` state로 부터 분리할 수 있습니다. 이제 이펙트는 **어떻게** 상태를 업데이트 하는지에는 관심없고 오로지 **무엇이** 일어났는지만 알려줍니다. 그리고 reducer가 업데이트 로직들을 모아서 관리합니다:

```jsx{8-9}
const initialState = {
  count: 0,
  step: 1,
};

function reducer(state, action) {
  const { count, step } = state;
  if (action.type === 'tick') {
    return { count: count + step, step };
  } else if (action.type === 'step') {
    return { count, step: action.step };
  } else {
    throw new Error();
  }
}
```

## 왜 useReducer가 Hook의 치트키인가 (Why useReducer Is the Cheat Mode of Hooks)

이제 우리는 이펙트가 이전 state 혹은 다른 state를 기반으로 state를 업데이트 하는 경우에 어떻게 의존성을 제거할 수 있는지 알게 되었습니다. **하지만 만약 다음 state를 계산하기 위해 props가 필요한 경우엔 어떻게 해야 할까요?** 예를 들어, API가 `<Count step={1}>`인 경우인 거죠. 이 경우엔 `props.step`을 의존성 배열에 추가해야만 하겠죠?

사실 의존성 추가를 하지 않아도 됩니다! Reducer를 컴포넌트 안에 넣어서 props를 읽게 하면 되거든요!

```jsx{1,6}
function Counter({ step }) {
  const [count, dispatch] = useReducer(reducer, 0);

  function reducer(state, action) {
    if (action.type === 'tick') {
      return state + step;
    } else {
      throw new Error();
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'tick' });
    }, 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  return <h1>{count}</h1>;
}
```

([데모](https://codesandbox.io/s/7ypm405o8q))

이 방법을 이용하면 reducer 에서도 props에 접근할 수 있지만, 그렇다고 무턱대고 여기 저기 사용하면 몇 가지 성능 최적화 작업을 할 수 없기 때문에 막 쓰지는 마세요.

위 예제의 경우에서조차 `dispatch`는 컴포넌트가 리렌더링 되어도 변하지 않습니다. 그래서 원한다면 `dispatch`를 의존성에서 제거할 수 있습니다.

"이게 왜 되는 거지? 어떻게 다른 렌더링에 속한 이펙트 안에서 reducer를 불렀는데 props를 알고 있는 거지?" 하고 궁금해하실 수 있을 겁니다. 이에 대한 해답은, `dispatch`를 호출하면 React는 액션을 기억해 놓습니다. 그리고선 다음번 렌더링 도중에 reducer를 호출합니다. 그럼 reducer가 호출된 그 순간에 새로운 props 값을 참조할 수 있게 되고 이펙트 내부와는 관련이 없게 되는 것이죠.

**이것이 제가 `useReducer`를 hooks의 치트키라고 생각하는 이유입니다. `useReducer`는 어떤 일이 일어났는지 묘사하도록 함으로써 업데이트 로직을 분리시킬 수 있게 해줍니다. 이를 통해 이펙트의 의존성을 줄일 수 있고 더 나아가 이펙트가 추가적으로 불필요하게 실행되는 것을 방지해 줍니다.**

## 함수를 이펙트 안으로 옮기기 (Moving Functions Inside Effects)

함수를 의존성에 포함하면 안된다고 하시는 분들이 있는데, 이는 흔히 하는 실수 중 하나입니다. 예를 들어, 이 코드는 정상적으로 동작하는 것처럼 보입니다:

```jsx{13}
function SearchResults() {
  const [data, setData] = useState({ hits: [] });

  async function fetchData() {
    const result = await axios(
      'https://hn.algolia.com/api/v1/search?query=react',
    );
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []); // 이래도 괜찮을까?

  // ...
```

([이 예제](https://codesandbox.io/s/8j4ykjyv0)는 Robin Wieruch의 멋진 글에서 차용한 것입니다. [확인해보세요!](https://www.robinwieruch.de/react-hooks-fetch-data/))

일단 이 코드는 정상적으로 동작하긴 합니다. **하지만 지역 함수를 의존성에서 제외하는 것은 컴포넌트가 커짐에 따라 우리가 모든 경우의 수를 전부 다루고 있는지 보장하기 힘들다는 점입니다.**

위 코드가 여러 모듈로 분할되어 있고 함수도 한 5배 정도는 더 크다고 생각해봅시다:

```jsx
function SearchResults() {
  // 이 함수가 훨씬 길다고 해봅시다
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=react';
  }

  // 이 함수 또한 훨씬 길다고 해봅시다
  async function fetchData() {
    const result = await axios(getFetchUrl());
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ...
}
```

그리고 추후에 이러한 지역함수에서 state 혹은 prop을 추가로 사용한다고 해봅시다:

```jsx{6}
function SearchResults() {
  const [query, setQuery] = useState('react');

  // 이 함수가 훨씬 길다고 해봅시다
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  // 이 함수 또한 훨씬 길다고 해봅시다
  async function fetchData() {
    const result = await axios(getFetchUrl());
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ...
}
```

만약 이 함수를 사용하는 이펙트의 의존성에 이 함수를 추가하는 것을 깜빡하게 된다면 (혹은 이 함수를 사용하는 다른 함수를 사용하는 경우가 될 수도 있습니다 복잡하죠?), 해당 이펙트는 state와 prop의 변화에 동기화하지 못하게 됩니다.

다행히 이 문제를 손쉽게 해결할 수 있는 방법이 있습니다. **만약 어떤 함수를 특정 이펙트 내에서만 사용한다면, 그 함수를 이펙트 내부로 옮기세요**:

```jsx
function SearchResults() {
  // ...
  useEffect(() => {
    // 이 함수를 이펙트 내부로 옮겼어요!
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=react';
    }
    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, []); // ✅ OK
  // ...
}
```

([데모](https://codesandbox.io/s/04kp3jwwql))

이렇게 하면 더 이상 "전이되는(transitive) 의존성"에 신경 쓸 필요가 없습니다. **실제로 이펙트에서 이펙트 바깥에 존재하는 그 어떠한 것도 사용하고 있지 않기 때문이** 더 이상 의존성에 대해 거짓말을 하지 않게 되는 것이죠.

추후에 `query` state를 사용하기 위해 `getFetchUrl`을 수정한다고 해도 이펙트 안에 있는 함수만 고치면 된다는 것을 쉽게 파악할 수 있습니다. 거기에 `query` state만 의존성에 추가하면 되겠지요.

([데모](https://codesandbox.io/s/pwm32zx7z7))

**`useEffect`의 설계는 여러분들로 하여금 데이터 흐름의 변화를 감지하도록 하고, 우리의 이펙트가 그 데이터에 대해 어떻게 동기화해야 하는지 선택하도록 강제합니다. 사용자가 버그를 겪을 때까지 무시하도록 내버려 두는 대신에요.**

## 하지만 이 함수를 이펙트 안으로 넣을 수 없는걸요 (But I Can’t Put This Function Inside an Effect)

때로는 함수를 이펙트 안으로 넣기 싫을 때가 있습니다. 예를 들면 한 컴포넌트 내의 여러 이펙트에서 해당 함수를 호출하고 있는데 단순히 복붙하기 싫을 수 있죠. 아니면 prop 때문에 그럴 수도 있구요.

이런 함수의 경우, 이펙트의 의존성에 추가하지 말아야 할까요? 저는 아니라고 봅니다. 다시 말하지만, **이펙트는 자신의 의존성에 대해 거짓말을 하면 안됩니다.** 흔한 오해 중 하나는 "함수가 절대로 변경되지 않는다"고 생각하는 것입니다. 하지만 이 포스트를 통해 배우셨듯이, 이는 사실이 아닐 가능성이 훨씬 높습니다. 실제로 컴포넌트 안에 정의된 함수는 매 렌더링마다 바뀝니다.

하지만 그 자체로 문제가 발생할 수 있는데, 아래 상황을 봅시다:

```jsx
function SearchResults() {
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... 데이터를 fetch해서 무언가를 한다 ...
  }, []); // 🔴 getFetchUrl 의존성 실종

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... 데이터를 fetch해서 무언가를 한다 ...
  }, []); // 🔴 getFetchUrl 의존성 실종

  // ...
}
```

이 경우 이펙트 안으로 함수를 집어넣게 되면 로직을 공유할 수 없게 되므로, 함수를 이펙트 안으로 넣기 싫으실겁니다.

반면, 여러분이 의존성에 대해 "정직"하시다고 해도 문제가 발생할 수 있습니다. 두 이펙트 모두 **매 렌더링마다 바뀌는** `getFetchUrl`에 의존하고 있기 때문에, 사실상 의존성 배열이 쓸모가 없게 됩니다:

```jsx
function SearchResults() {
  // 🔴 매 렌더링마다 모든 이펙트를 다시 실행합니다
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... 데이터를 fetch해서 무언가를 한다 ...
  }, [getFetchUrl]); // 🚧 의존성은 정확하나 너무 자주 바뀝니다

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... 데이터를 fetch해서 무언가를 한다 ...
  }, [getFetchUrl]); // 🚧 의존성은 정확하나 너무 자주 바뀝니다

  // ...
}
```

이 경우 그냥 `getFetchUrl`을 의존성에서 빼버리고 싶으실 테지만, 추천하지는 않습니다. 만약 빼버린다면 이펙트에 의해 관리되는 데이터 흐름을 언제 변경해야 할지 알기 힘들어집니다. 이렇게 되면 우리가 앞서 살펴본 "업데이트 되지 않는 인터벌" 버그와 비슷한 상황이 펼처지게 될 수 있습니다.

대신, 더 간단한 두 가지 방법이 존재합니다.

**먼저, 함수가 컴포넌트 스코프 내의 그 무엇도 사용하지 않는다면 이 함수를 컴포넌트 바깥으로 빼내어 이펙트에서 (의존성에 구애받지 않고) 자유롭게 사용할 수 있습니다:**

```jsx
// ✅ 데이터 흐름에 영향을 받지 않습니다
function getFetchUrl(query) {
  return 'https://hn.algolia.com/api/v1/search?query=' + query;
}

function SearchResults() {
  useEffect(() => {
    const url = getFetchUrl('react');
    // ... 데이터를 fetch해서 무언가를 한다 ...
  }, []); // ✅ OK

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... 데이터를 fetch해서 무언가를 한다 ...
  }, []); // ✅ OK

  // ...
}
```

이렇게 하면 `getFetchUrl`은 렌더링의 스코프 내에 존재하지 않으므로 이펙트의 의존성에 명시하지 않아도 됩니다. 우연히라도 props나 state를 사용할 수 없기 때문이죠.

혹은, [useCallback](https://reactjs.org/docs/hooks-reference.html#usecallback) hook을 사용할 수도 있습니다:

```jsx
function SearchResults() {
  // ✅ deps가 동일하면 함수가 그대로 유지된다
  const getFetchUrl = useCallback((query) => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []);  // ✅ OK

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... 데이터를 fetch해서 무언가를 한다 ...
  }, [getFetchUrl]); // ✅ OK

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... 데이터를 fetch해서 무언가를 한다 ...
  }, [getFetchUrl]); // ✅ OK

  // ...
}
```

`useCallback`은 의존성을 체크하는 데에 레이어를 하나 더하는 것과 같습니다. 즉, **함수를 이펙트의 의존성에서 빼기보단 함수 자체를 필요할 때만 변하게 함으로써** 문제를 다른 방식으로 해결하는 것입니다.

이 방식이 왜 유용한지 알아봅시다. 이전의 예제에선 `react`와 `redux` 두 가지 검색 결과를 보여주었습니다. 하지만 input을 추가하여 임의의 `query`를 검색할 수 있도록 한다고 해봅시다. 즉, `query`를 인자로 받는 대신 `getFetchUrl`이 지역 state로 부터 값을 읽어들입니다.

그렇게 수정하게 된다면 즉시 `query` 의존성이 빠져있다는 사실을 파악하게 될겁니다:

```jsx{5}
function SearchResults() {
  const [query, setQuery] = useState('react');
  const getFetchUrl = useCallback(() => { // No query argument
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []); // 🔴 "query" 의존성이 빠짐
  // ...
}
```

하지만 만약 `useCallback`의 의존성에 `query`를 추가하게 되면, `getFetchUrl`가 의존성에 포함된 모든 이펙트들은 `query`가 바뀔 때마다 다시 실행될 것입니다:

```jsx{4-7}
function SearchResults() {
  const [query, setQuery] = useState('react');

  // ✅ query가 변할때만 함수가 바뀝니다
  const getFetchUrl = useCallback(() => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, [query]);  // ✅ OK

  useEffect(() => {
    const url = getFetchUrl();
    // ... 데이터를 fetch해서 무언가를 한다 ...
  }, [getFetchUrl]); // ✅ OK

  // ...
}
```

`useCallback` 덕분에 `query`가 같으면 `getFetchUrl`도 여전히 그대로 있게 되고, 그에 따라 이펙트가 다시 실행되지 않게 됩니다. 하지만 만약 `query`가 변하게 되면 그에 따라 `getFetchUrl`도 변하게 되고, 이펙트가 재실행되어 데이터를 fetch할 것입니다. 이는 마치 엑셀에서 특정 셀을 바꾸면 나머지 셀들이 자동으로 계산되는 것과 비슷합니다.

이는 단순히 데이터 흐름을 이해하고 동기화에 대한 개념을 받아들인 결과입니다. **부모로부터 함수를 prop으로 넘겨받는 경우에도 동일하게 동작합니다**:

```jsx{4-8}
function Parent() {
  const [query, setQuery] = useState('react');

  // ✅ query가 변할때만 함수가 바뀝니다
  const fetchData = useCallback(() => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + query;
    // ... 데이터를 fetch해서 무언가를 한다 ...
  }, [query]);  // ✅ OK

  return <Child fetchData={fetchData} />
}

function Child({ fetchData }) {
  let [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, [fetchData]); // ✅  OK

  // ...
}
```

`fetchData`는 오로지 `Parent` 안에 있는 `query`가 변경될 때에만 바뀌므로, `Child`는 꼭 필요한 경우가 아니라면 데이터를 fetch 하지 않게 됩니다.

## 함수도 데이터 흐름의 일부일까? (Are Functions Part of the Data Flow?)

흥미롭게도, 이 패턴은 클래스 컴포넌트 방식에선 통하지 않는데 이게 이펙트와 클래스 컴포넌트의 라이프 사이클간의 차이를 제대로 보여줍니다. 위의 코드를 아래와 같이 변환했다고 해봅시다:

```jsx{5-8,18-20}
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
  };
  render() {
    return <Child fetchData={this.fetchData} />;
  }
}

class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  render() {
    // ...
  }
}
```

아마 여러분은 "에이, 댄! `useEffect`가 `componentDidMount`와 `componentDidUpdate`를 섞은것이라는건 우리도 안다구요!" 라고 하실 수도 있을겁니다. 하지만 실제로 `componentDidUpdate`에서 동작하지 않습니다 (뭐라구요? 😱):

```jsx{8-14}
class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    // 🔴 이 조건은 절대 true가 되지 않습니다!
    if (this.props.fetchData !== prevProps.fetchData) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

물론, `fetchData`는 클래스 메서드가 맞습니다. 하지만 state가 달라졌다고 해서 메서드가 달라지지는 않습니다. 따라서 `this.props.fetchData`는 항상 `prevProps.fetchData`와 같을 것이고 이로 인해 다시 fetch하는 일은 일어나지 않게 됩니다. 그럼 저 `if` 조건을 없애면 될까요?

```jsx
componentDidUpdate(prevProps) {
  this.props.fetchData();
}
```

잠깐만요, 이렇게 하면 매번 리렌더링이 될 때마다 다시 fetch하게 됩니다. 그럼 특정 `query`를 바인딩 해두는 건 어떨까요?

```jsx
render() {
  return <Child fetchData={this.fetchData.bind(this, this.state.query)} />;
}
```

하지만 이렇게 하면 `query`가 바뀌지 않아도 `this.props.fetchData !== prevProps.fetchData` 조건이 항상 `true`이기 때문에 매번 데이터를 다시 fetch하게 됩니다.

이 수수께끼의 유일한 해결책은 `query` 자체를 `Child` 컴포넌트에 넘겨주는 수밖에 없습니다. `Child`가 실제로 `query`를 사용하지는 않지만 `query`가 바뀌었을 때 데이터를 다시 가져오도록 로직을 짤 수는 있게 됩니다:

```jsx{10,22-24}
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... 데이터를 fetch해서 무언가를 한다 ...
  };
  render() {
    return <Child fetchData={this.fetchData} query={this.state.query} />;
  }
}

class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    if (this.props.query !== prevProps.query) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

**클래스 컴포넌트에선 함수 prop 자체는 실제로 데이터 흐름의 일부가 아닙니다.** 메서드들은 mutable한 `this`에 묶여 있기 때문에 함수의 일관성을 담보할 수 없게 됩니다. 따라서 우리가 원하는 건 오직 함수일지라도 그 "차이"를 비교하기 위해 다른 데이터들도 같이 넘겨줘야 합니다. 부모 컴포넌트로부터 받은 `this.props.fetchData` 함수가 어떤 state에 의존하는지, 그리고 그 state가 바뀌었는지 알 길이 없습니다.

하지만 **`useCallback`을 사용하면 함수는 명백히 데이터 흐름의 일부가 됩니다.** 즉, 함수의 입력값이 변경되면 함수 그 자체도 변경되었다고 확신할 수 있고, 입력값이 변경되지 않으면 함수는 바뀌지 않는다고 확신할 수 있습니다. `useCallback`이 제공하는 세밀함 덕분에 `props.fetchData`와 같은 props의 변경이 자동적으로 하위 컴포넌트에게 전달됩니다.

이와 비슷하게, [useMemo](https://reactjs.org/docs/hooks-reference.html#usememo) 또한 복잡한 객체에 대해 위와 같은 해결책을 제공합니다:

```jsx
function ColorPicker() {
  // "color"가 실제로 바뀌지 않는 한
  // "Child"의 얕은 props 비교를 고장내지 않는다. 
  const [color, setColor] = useState('pink');
  const style = useMemo(() => ({ color }), [color]);
  return <Child style={style} />;
}
```

그렇지만 **`useCallback`을 여기저기서 막 사용하는 것은 좋지 않은 방법임을 강조하고 싶습니다.** 물론 함수가 자식 컴포넌트로 전달되어 (자식 컴포넌트의) 이펙트 내부에서 사용되는 경우에 `useCallback`는 유용합니다. 혹은 자식 컴포넌트의 메모이제이션이 고장 나는 것을 방지하기 위해 사용할 수도 있습니다. 하지만 hooks가 [콜백을 내려보내는 것을 피하는](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down) 더 좋은 방법을 함께 제공하고 있다는 점을 알아두세요.

위 예제라면 저는 `fetchData`를 이펙트 안에 두거나 (혹은 커스텀 hook으로 분리할 수도 있구요) 최상위 레벨 import 방식으로 만들 것 같습니다. 저는 이펙트를 최대한 심플하게 유지하려고 하는데 콜백이 이펙트안에 들어있으면 이펙트를 심플하게 유지하기 쉽지 않거든요. [클래스 방식을 흉내](./#흐름을-거슬러-올라가기-swimming-against-the-tide)낼 순 있겠지만 race condition을 해결할 수는 없습니다.

## 경쟁 상태에 대해 (Speaking of Race Conditions)

클래스 컴포넌트에서 데이터를 가져오는 일반적인 예시는 다음과 같을겁니다:

```jsx
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

이미 잘 알고 계시겠지만 이 코드에는 업데이트되는 상황을 다루지 않는다는 버그가 있습니다. 그래서 구글링을 통해 다른 예제를 찾아보면 다음과 비슷할겁니다:

```jsx{8-12}
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.fetchData(this.props.id);
    }
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

훨씬 낫지만, 여전히 버그가 존재합니다. 버그가 발생하는 이유는 요청의 순서를 보장할 수 없기 때문입니다. 따라서 만약 제가 `{id: 10}`을 먼저 요청하고, `{id: 20}`으로 바꿨을 때 `{id: 20}` 요청의 결과가 먼저 도착하게 된다면 앞서 요청한 `{id: 10}` 결과가 도착했을 때 `{id: 20}`의 결과가 덮어씌워져 버리게 됩니다.

이를 **경쟁 상태(race condition)** 라고 하는데, 위에서 아래로 데이터가 흐르는 상황에서 `async`/`await`가 섞여 있는 코드에 흔히 나타나는 현상입니다. 이때 데이터가 위에서 아래로 흐른다는 것은 props, state가 async 함수 실행 도중에 바뀔 수 있다는 의미입니다.

이펙트가 마법같이 이 문제를 해결해주지는 않습니다. 대신, async 함수를 직접 이펙트에 전달하게 되면 경고를 띄웁니다.

만약 여러분이 사용하는 비동기 접근 방식이 (요청) 취소 기능을 제공한다면 아주 좋습니다. 취소 기능을 클린업 함수에 넣어서 비동기 요청을 취소할 수 있기 때문이죠.

혹은 boolean 값을 사용하는 방법도 있습니다:

```jsx{5,9,16-18}
function Article({ id }) {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    let didCancel = false;

    async function fetchData() {
      const article = await API.fetchArticle(id);
      if (!didCancel) {
        setArticle(article);
      }
    }

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [id]);

  // ...
}
```

[이 글](https://www.robinwieruch.de/react-hooks-fetch-data/)에서 비동기 요청의 에러와 로딩 상태, 그리고 이러한 로직을 커스텀 훅으로 빼는 방법을 더 자세히 알 수 있습니다.

## 기대치 높이기 (Raising the Bar)

클래스 컴포넌트 라이프 사이클의 마인드 셋으로 접근하면 side effect들은 렌더링 결과들과는 다르게 동작하게 됩니다. UI를 렌더링 하는 것은 props와 state에 의해 좌우되며 이들과 일관된다는 보장이 있지만 side effect들은 아닙니다. 이것이 흔히 버그가 일어나는 원인입니다.

`useEffect`의 마인드 셋으로 접근하면 모든 것이 기본적으로 동기화되고, side effect는 React 데이터 흐름의 일부가 됩니다. 모든 `useEffect` 호출에 대해 제대로만 사용한다면 여러분의 컴포넌트는 엣지 케이스들을 훨씬 잘 처리하게 될 것입니다.

하지만 `useEffect`를 제대로 사용하기 위한 초기 비용은 꽤 높습니다. 짜증이 날 수도 있지요. 엣지 케이스들을 잘 처리하는 동기화 코드를 작성하는 것은 렌더링과 별개로 발생하는 일회성 side effect를 실행하는 것보다 훨씬 어렵습니다.

이 때문에 `useEffect`를 사용하는 것이 꽤나 걱정스러울 수 있습니다. 하지만 `useEffect`는 기초적인 구성 요소입니다. 아직 hooks가 등장한지 얼마 안 된 시기라서 모두가 로우 레벨 수준으로 다루고 있습니다만, 차차 더 높은 수준으로 추상화된 hooks로 옮겨갈 것이라 예상됩니다.

아직까지는 `useEffect`가 가장 흔히 사용되는 경우는 데이터 fetching인데, 사실 데이터 fetching은 동기화의 문제와 별 관련이 없습니다. 특히, 주로 deps가 `[]` 이기 때문에 더욱 명백해 보입니다. 그럼 우리는 도대체 무엇을 동기화하고 있는 걸까요?

장기적인 관점에서, [데이터 fetching을 위한 서스펜스]()가 도입되면 서드 파티 라이브러리들이 React로 하여금 (코드, 데이터 이미지 등의) 비동기적인 것들을 가져올 때까지 렌더링을 잠시 미룰 수 있도록 할 것입니다.

서스펜스가 점차 더 많은 데이터 fetching 경우를 커버하게 된다면, `useEffect`는 로우 레벨로 더욱 내려가서 props와 state들을 특정 side 이펙트와 동기화하고자 할 때 사용되는 도구로 변모하게 될 것입니다. 기본적으로 `useEffect`가 이것을 위해 설계되었다 보니 데이터 fetching 과는 다르게 이러한 케이스를 더욱 잘 처리할 수 있을 것입니다. 하지만 그때까진 [여기](https://www.robinwieruch.de/react-hooks-fetch-data/)에 나온 것처럼 커스텀 hook이 데이터를 가져오는 로직을 구성하는데 좋은 도구가 될 것입니다. (2021년 12월 현재 데이터 fetching과 관련된 로직은 [React Query](https://www.npmjs.com/package/react-query)를 점점 많이 사용하는 추세인 듯합니다)