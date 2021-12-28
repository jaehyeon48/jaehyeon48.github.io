---
title: 'React 컨텍스트 효율적으로 사용하기'
date: 2021-12-28
category: 'react'
draft: false
---

이 포스트는 [How to use React Context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively)를 번역한 글입니다.

<hr class="custom-hr">

[React로 애플리케이션 상태관리 하기](https://jaehyeon48.github.io/react/application-state-management-with-react/)에서 지역 상태와 React 컨텍스트를 같이 사용하여 React 애플리케이션의 상태를 잘 관리할 수 있는 방법을 소개해 드렸습니다. 여기서는 해당 포스트에서 보여드렸던 몇 가지 예제를 바탕으로, 어떻게 하면 컨텍스트 comsumer를 효과적으로 작성하여 개발자 경험과 컨텍스트 객체의 유지 보수성을 높일 수 있는지에 대해 말씀드리려고 합니다.

> ⚠️ 우선 [React로 애플리케이션 상태관리 하기](https://jaehyeon48.github.io/react/application-state-management-with-react/)를 읽으시고, 모든 문제에 대해 컨텍스트를 사용하면 안된다는 조언을 따르세요. 하지만 정말로 컨텍스트가 필요한 상황이라면, 이 포스트를 통해 컨텍스트를 더 효과적으로 사용하는 방법을 아시게 될 겁니다. 또한, 컨텍스트가 무조건 글로벌하게 존재할 필요는 전혀 없으며 논리적으로 분할하여 여러 개의 컨텍스트를 가지는 것이 더 바람직할 수 있습니다.

우선, `src/count-context.js` 파일을 생성하여 컨텍스트를 만들어 봅시다:

```jsx
import * as React from 'react';

const CountContext = React.createContext();
```

현재 `CountContext`에는 초기값이 없습니다. 만약 초기값을 추가하고 싶다면 `React.createContext({ count: 0 });`와 같이하면 됩니다. 하지만 이 예제에선 의도적으로 초기값을 넣지 않았습니다. 기본값은 다음과 같은 상황에서나 유용합니다:

```jsx{2}
function CountDisplay() {
  const { count } = React.useContext(CountContext);
  return <div>{count}</div>;
}

ReactDOM.render(<CountDisplay />, document.getElementById('⚛️'));
```

`CountContext`에 초기값이 없기 때문에, 위 코드에서 하이라이트 된 부분에서 에러가 발생할 것입니다. 이 컨텍스트의 기본값은 `undefined`인데 `undefined`를 [구조 분해](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#object_destructuring)할 수는 없기 때문이죠!

런타임 에러를 좋아하는 사람은 없기 때문에, 아마 여러분은 런타임 에러를 해결하기 위해 무의식적으로 기본값을 추가하실 겁니다. 하지만 한번  생각해봅시다. 컨텍스트에 실제 값이 없는데 컨텍스트를 왜 쓰는걸까요? 만약 단순히 기본값만을 쓰는 거라면 컨텍스트를 굳이 사용하는 이유가 없을 겁니다. 애플리케이션에서 컨텍스트를 생성하고 사용하는 대부분의 경우, 유용한 값을 제공해주는 provider 내에서 (`useContext`를 사용하는) consumer가 렌더링 되기를 원할 겁니다.

> 물론 기본값이 유용한 경우도 있지만, 기본값이 필요 없을 뿐 더러 그다지 유용하지 않은 경우가 대부분입니다.

[React 공식 문서](https://reactjs.org/docs/context.html#reactcreatecontext)에선 컨텍스트의 기본값을 제공하면 "컴포넌트를 wrapping하지 않고 테스트하기에 유용하다"라고 하고 있습니다. 물론 맞는 말이긴 합니다만 컴포넌트를 컨텍스트로 wrapping 하지 않는 것이 좋은 것인지는 잘 모르겠습니다. 애플리케이션에서 실제로는 하지 않는 동작을 테스트하는 것은 테스트를 통해 얻을 수 있는 (코드에 대한) 자신감을 저하하는 행위임을 기억하세요. [이렇게 하는 경우](https://kentcdodds.com/blog/the-merits-of-mocking)가 있기는 하지만 지금의 상황은 맞지 않습니다.

> ⚠️ 만일 타입스크립트를 사용하고 계신다면, 기본값을 제공하지 않을 경우 `useContext`를 사용하는 것이 매우 귀찮아질 수 있습니다. 이에 대한 해결책은 뒤에서 알려드릴게요!

## 커스텀 Provider 컴포넌트 (The Custom Provider Component)

좋아요, 계속해봅시다. 앞서 만든 컨텍스트 모듈을 유용하게 사용하기 위해선 provider를 사용하고 값을 제공하는 컴포넌트를 노출할 필요가 있습니다. 해당 컴포넌트들은 아래와 같습니다:

```jsx{3,6}
function App() {
  return (
    <CountProvider>
      <CountDisplay />
      <Counter />
    </CountProvider>
  );
}

ReactDOM.render(<App />, document.getElementById('⚛️'));
```

그렇다면 위와 같이 사용할 수 있는 컴포넌트를 만들어 봅시다:

```jsx
import * as React from 'react';

const CountContext = React.createContext();

function countReducer(state, action) {
  switch (action.type) {
    case 'increment': {
      return { count: state.count + 1 };
    }
    case 'decrement': {
      return { count: state.count - 1 };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function CountProvider({ children }) {
  const [state, dispatch] = React.useReducer(countReducer, { count: 0 });
  // 이 값을 memoize 해야할 지도 모릅니다
  // https://kentcdodds.com/blog/how-to-optimize-your-context-value를 참고해주세요!
  const value = { state, dispatch };
  return <CountContext.Provider value={value}>{children}</CountContext.Provider>;
}

export { CountProvider };
```

> 위 예시는 실제 세계에서 어떻게 사용되는지 보여주기 위해 인위로 만들어낸 것입니다. **항상 이렇게 복잡한 것은 아닙니다!** `useState`가 적합한 경우라면 마음껏 사용하세요. 어떤 provider들은 위와 같이 간단할 수도 있지만, 더욱더 많은 훅을 사용하여 훨씬 복잡한 provider들도 존재할 수 있습니다.

## 커스텀 Consumer 훅 (The Custom Consumer Hook)

실제 현업에서 제가 본 컨텍스트 사용 방법은 다음과 같은 형태들이 많았습니다:

```jsx
import * as React from 'react';
import { SomethingContext } from 'some-context-package';

function YourComponent() {
  const something = React.useContext(SomethingContext);
}
```

하지만 제 생각엔 아래처럼 하면 더욱 나은 사용자 경험을 만들어낼 수 있을 것 같습니다:

```jsx
import * as React from 'react';
import { useSomething } from 'some-context-package';

function YourComponent() {
  const something = useSomething();
}
```

방금 보여드린 예시는 아래에 제가 보여드릴 예시처럼 몇 가지의 작업을 수행할 수 있다는 장점이 있습니다:

```jsx{28-32}
import * as React from 'react';

const CountContext = React.createContext();

function countReducer(state, action) {
  switch (action.type) {
    case 'increment': {
      return { count: state.count + 1 };
    }
    case 'decrement': {
      return { count: state.count - 1 };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function CountProvider({ children }) {
  const [state, dispatch] = React.useReducer(countReducer, { count: 0 });
  // 이 값을 memoize 해야할 지도 모릅니다
  // https://kentcdodds.com/blog/how-to-optimize-your-context-value를 참고해주세요!
  const value = { state, dispatch };
  return <CountContext.Provider value={value}>{children}</CountContext.Provider>;
}

function useCount() {
  const context = React.useContext(CountContext);
  if (context === undefined) {
    throw new Error('useCount must be used within a CountProvider');
  }
  return context;
}

export { CountProvider, useCount };
```

우선, `useCount` 커스텀 훅은 (React 트리에서) 가장 가까운 `CountProvider`가 제공하는 컨텍스트 값을 얻기 위해 `React.useContext`를 사용하고 있습니다. 하지만 어떠한 값도 없는 경우, `CountProvider` 내에서 렌더링된 함수 컴포넌트에서 사용되고 있지 않다는 에러를 띄웁니다. 아마도 실수인 게 분명하므로 이렇게 에러 메시지를 띄우는 것은 중요합니다. [#FailFast](https://www.martinfowler.com/ieeeSoftware/failFast.pdf)

## 커스텀 Consumer 컴포넌트 (The Custom Consumer Component)

만약 훅을 사용할 수 있는 환경이라면 이 섹션을 건너뛰셔도 좋습니다. 하지만 React 16.8.0 이전 버전을 지원하셔야 한다거나, 혹은 클래스 컴포넌트에서 컨텍스트를 사용해야 하는 경우 render-prop을 기반으로 한 API로 비슷하게 흉내 내는 방법을 알려드리겠습니다:

```jsx
function CountConsumer({ children }) {
  return (
    <CountContext.Consumer>
      {context => {
        if (context === undefined) {
          throw new Error('CountConsumer must be used within a CountProvider');
        }
        return children(context);
      }}
    </CountContext.Consumer>
  )
}
```

클래스 컴포넌트에서 사용하는 방법은 다음과 같습니다:

```jsx
class CounterThing extends React.Component {
  render() {
    return (
      <CountConsumer>
        {({ state, dispatch }) => (
          <div>
            <div>{state.count}</div>
            <button onClick={() => dispatch({ type: 'decrement' })}>
              Decrement
            </button>
            <button onClick={() => dispatch({ type: 'increment' })}>
              Increment
            </button>
          </div>
        )}
      </CountConsumer>
    );
  }
}
```

이는 제가 훅 이전에 사용했던 방식입니다. 물론 잘 동작하구요. 하지만 훅을 사용할 수 있는 상황이라면 훅을 사용하세요. 훨씬 낫습니다 😂

## 타입스크립트

앞서 약속한대로 `defaultValue`를 제공하지 않을 때 타입스크립트에서 발생하는 이슈들을 해결하는 방법을 보여드리겠습니다. 제가 권하는 방식을 사용하면 이러한 문제를 기본적으로 피하실 수 있게 되실겁니다. 사실 문제라고 하기에도 애매한데요, 봅시다:

```tsx{36-40}
import * as React from 'react';

type Action = { type: 'increment' } | { type: 'decrement' };
type Dispatch = (action: Action) => void;
type State = { count: number };
type CountProviderProps = { children: React.ReactNode };

const CountStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined)

function countReducer(state: State, action: Action) {
  switch (action.type) {
    case 'increment': {
      return { count: state.count + 1 };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function CountProvider({ children }: CountProviderProps) {
  const [state, dispatch] = React.useReducer(countReducer, { count: 0 });
  // 이 값을 memoize 해야할 지도 모릅니다
  // https://kentcdodds.com/blog/how-to-optimize-your-context-value를 참고해주세요!
  const value = { state, dispatch };
  return (
    <CountStateContext.Provider value={value}>
      {children}
    </CountStateContext.Provider>
  )
}

function useCount() {
  const context = React.useContext(CountStateContext);
  if (context === undefined) {
    throw new Error('useCount must be used within a CountProvider');
  }
  return context;
}

export { CountProvider, useCount };
```

([데모](https://codesandbox.io/s/bitter-night-i5mhj))

이렇게 하면 누구든 `useCount`를 쓸 때 `undefined` 체킹을 하지 않아도 됩니다. 왜냐면 우리가 미리 했기 때문이죠!

## Dispatch "type" 오타는 어떡하죠? (What about dispatch "type" typos?)

이 시점에서 여러분의 리덕스는 "이봐, 액션 creator는 어디 갔어?" 하고 소리치고 있을 겁니다. 만약 액션 creator를 구현하고 싶으시면 하셔도 괜찮지만, 사실 개인적으로 액션 creator를 좋아해 본 적은 없습니다. 왜냐면 불필요한 추상화라고 생각했거든요. 또한, 타입스크립트를 통해 액션들의 타입을 잘 만들게 되면 액션 creator가 필요 없을 겁니다. 자동 완성도 있고, 인라인 타입 에러를 띄워주기 때문이죠!

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/how-to-use-react-context-effectively/auto-complete.png" alt="Dispatch type getting autocompleted" />
</figure>

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/how-to-use-react-context-effectively/type-error.png" alt="Type error on a misspelled dispatch type" />
</figure>

저는 `dispatch`를 이러한 방식으로 사용하는 걸 정말 좋아합니다. 추가로, `dispatch`는 해당 `dispatch`를 사용하는 컴포넌트의 일생동안 안정적인 상태를 유지하기 때문에 (즉, 바뀌지 않기 때문에) `useEffect`의 의존성 배열에 `dispatch`를 추가할 필요가 없습니다 (추가할 건 말건 차이가 없습니다).

만약 타입스크립트를 사용하지 않으신다면 (사용하는 것을 추천합니다), 잘못된 액션 타입에 대한 에러는 일종의 안전장치의 역할을 합니다. 또한, 다음 섹션도 읽어보세요. 도움이 될 겁니다.