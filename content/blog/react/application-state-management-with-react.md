---
title: 'React로 애플리케이션 상태관리 하기'
date: 2021-12-27
category: 'react'
draft: false
---

이 포스트는 [Application State Management with React](https://kentcdodds.com/blog/application-state-management-with-react)를 번역/요약한 글입니다.

<hr class="custom-hr">

어느 애플리케이션에서나 상태를 관리하는 것은 아마도 가장 힘든 부분일 것입니다. 이것이 상태관리 라이브러리들이 그토록 많이 존재할 뿐만 아니라, 계속해서 새로 생겨나는 이유입니다. (심지어 몇몇 라이브러리는 상태관리 라이브러리의 라이브러리 이기도 합니다. 예를 들자면 npm에는  Redux 추상화 버전의 라이브러리가 수백 개 존재합니다). 제가 생각하기에 상태관리를 어렵게 만드는 요인 중 하나는 문제를 해결하기 위해 해결책을 너무 과용(over-engineer)한다는 것입니다.

제가 React를 사용하는 동안 개인적으로 구현하려고 시도했던 상태관리 방법이 하나 있는데, React 훅의 등장과 React 컨텍스트의 발전으로 인해 이러한 방법이 크게 단순화되었습니다.

우리는 종종 React 컴포넌트를 레고 블록에 비유하곤 합니다. 하지만 제 생각엔 사람들이 이 말을 들을 때, 상태에 대해선 그렇게 생각하지 않는 듯 합니다. 상태관리 문제에 대한 저의 "비법"은 여러분의 애플리케이션 상태를 애플리케이션 트리 구조에 매핑되는 방식을 고려하는 것입니다.

Redux가 크게 성공한 요인 중 하나는 [react-redux](https://www.npmjs.com/package/react-redux)가 [prop drilling](https://kentcdodds.com/blog/prop-drilling) 문제를 해결했다는 점입니다. 단순히 여러분의 함수를 마법 같은 `connect` 함수에 넘김으로써 트리의 서로 다른 부분에 있는 컴포넌트끼리 데이터를 공유할 수 있다는 점은 정말 놀랍습니다. 물론, 리듀서, 액션 creator와 같은 것들도 훌륭하지만 제 생각에 Redux가 널리 사용된 이유는 개발자들이 겪는 prop drilling의 고통을 치료해주었기 때문이라고 봅니다.

저는 개발자들이 **모든** 상태를 Redux에 넣어 관리하는 것을 계속해서 봐왔습니다. 글로벌 상태뿐만 아니라 로컬 상태도 같이요. 이것이 제가 Redux를 오직 한 프로젝트에서만 사용한 이유입니다. 이렇게 하면 많은 문제가 발생할 수 있는데, 특히 상태 상호작용을 관리할 때 이러한 상호작용은 리듀서, 액션 creator, dispatch 호출과 연계되기 때문에 궁극적으로 여러분의 머릿속에서 코드의 흐름을 추적해나가기 어려워지게 됩니다. 따라서 코드의 이해도가 낮아지고 무슨 일이 일어나고 있는지 알아내기가 힘들어지죠.

솔직히 이건 "진짜 글로벌"한 상태에 대해선 괜찮습니다만, 모달창의 open/close 상태와 같이 간단한 상태에 대해선 큰 문제가 될 수 있습니다. 설상가상으로 코드를 확장하는 것이 힘들 수 있습니다. 여러분의 프로그램이 커질수록 이러한 문제들은 더욱 심각해집니다. 물론 여러 리듀서들을 묶어 애플리케이션의 서로 다른 부분들을 관리하도록 할 수는 있겠지만 모든 액션 creator와 리듀서들을 거치는 이러한 간접적인 방법은 최적의 방법이 아닙니다.

또, 굳이 Redux를 사용하는 경우가 아니더라도 이렇게 애플리케이션의 모든 상태를 하나의 객체에 저장하여 관리하는 것은 또 다른 문제를 야기할 수 있습니다. React의 `<Context.Provider>`에서 관리하는 상태가 업데이트되면 해당 상태 전체뿐만 아니라 일부분만을 사용하는 컴포넌트조차 리렌더링이 됩니다. 이로 인해 성능 이슈가 생길 수 있습니다.

제 이야기의 요점은, 만약 여러분이 상태를 더욱 논리적으로 쪼개어 해당 상태를 사용하는 트리에 최대한 가깝게 위치 시켜 관리하게 되면 이러한 문제를 겪지 않으실 거란 뜻입니다.

<hr class="custom-hr">

자, 이제 진짜로 시작해봅시다. 만약 React를 사용하여 애플리케이션을 만드는 경우 여러분은 이미 상태관리 라이브러리를 설치하신 거나 다름없습니다. **왜냐면 이미 React 그 자체가 상태관리 라이브러리이기 때문이죠!**

여러분이 React 애플리케이션을 만든다는 것은 다양한 컴포넌트들을 조합해서 `<App />`에서 시작하여 `<input />`, `<div />`, `<button />` 으로 끝나는 트리를 만든다는 것과 동일합니다. 애플리케이션이 렌더링하는 로우 레벨의 복합 컴포넌트들을 직접 다룰 일은 없을 겁니다. 대신 이러한 일을 각각의 컴포넌트가 하도록 시키지요. 이렇게 하면 굉장히 효과적으로 UI를 만들 수 있게 됩니다. 상태에 대해서도 이와 동일하게 할 수 있습니다. 아마 여러분은 오늘도 아래와 비슷한 코드를 짜셨을 겁니다:

```jsx{2}
function Counter() {
  const [count, setCount] = React.useState(0);
  const increment = () => setCount(c => c + 1);
  return <button onClick={increment}>{count}</button>
}

function App() {
  return <Counter />;
}
```

([데모](https://codesandbox.io/s/4qzj73lozx?fontsize=14&hidenavigation=1&module=%2Fsrc%2F01-simple-count.js&moduleview=1))

지금 제가 말하고 있는것들은 클래스 컴포넌트에서도 동작한다는 점을 잊지마세요. 훅은 단순히 이러한 것들을 쉽게 만들어주는 역할에 불과합니다.

```jsx{2}
class Counter extends React.Component {
  state = { count: 0 };
  increment = () => this.setState(({ count }) => ({ count: count + 1 }));
  render() {
    return <button onClick={this.increment}>{this.state.count}</button>;
  }
}
```

"좋아요, Kent. 하나의 컴포넌트에서 하나의 요소만 있는 상태를 관리하는 건 쉽겠죠. 하지만 상태를 여러 컴포넌트에 공유해야 될 땐 어떻게 하나요? 예를 들면 다음처럼요:"

```jsx{3}
function CountDisplay() {
  // `count`는 어디서 오는걸까요?
  return <div>The current counter count is {count}</div>;
}

function App() {
  return (
    <div>
      <CountDisplay />
      <Counter />
    </div>
  );
}
```

"`count`는 `<Counter />`에서 관리되고 있는데, 상태관리 라이브러리를 통해 `<CountDisplay />`에서도 `count`를 사용하고 `<Count />`에서 `count`를 업데이트 할 수 있었으면 좋겠어요!"

이에 대한 해답은 React 만큼이나 (혹은 그보다 더?) 오래되었습니다. [Lifting State Up](https://reactjs.org/docs/lifting-state-up.html)이라는 문서에서 확인해보실 수 있어요.

"상태 올리기"는 위 문제를 React에서 해결하기에 아주 적합한 해답입니다. 다음과 같이 적용할 수 있어요:

```jsx
function Counter({ count, onIncrementClick }) {
  return <button onClick={onIncrementClick}>{count}</button>;
}

function CountDisplay({ count }) {
  return <div>The current counter count is {count}</div>;
}

function App() {
  const [count, setCount] = React.useState(0);
  const increment = () => setCount(c => c + 1);
  return (
    <div>
      <CountDisplay count={count} />
      <Counter count={count} onIncrementClick={increment} />
    </div>
  );
}
```

([데모](https://codesandbox.io/s/4qzj73lozx?fontsize=14&hidenavigation=1&module=%2Fsrc%2F02-lift-state.js&moduleview=1))

우리는 방금 상태를 책임지는 컴포넌트를 변경하였는데, 정말 간단하죠? 이런식으로 애플리케이션의 최상단까지 상태를 끌어올릴 수 있습니다.

"하지만 Kent, [prop drilling](https://kentcdodds.com/blog/prop-drilling) 문제는요?"

좋은 질문이에요. 이는 컴포넌트들의 구조를 바꿔서 해결할 수 있습니다. [Component composition](https://reactjs.org/docs/context.html#before-you-use-context)을 이용해 봅시다:

```jsx
// 이것 대신
function App() {
  const [someState, setSomeState] = React.useState('some state');
  return (
    <>
      <Header someState={someState} onStateChange={setSomeState} />
      <LeftNav someState={someState} onStateChange={setSomeState} />
      <MainContent someState={someState} onStateChange={setSomeState} />
    </>
  );
}

// 이렇게
function App() {
  const [someState, setSomeState] = React.useState('some state');
  return (
    <>
      <Header
        logo={<Logo someState={someState} />}
        settings={<Settings onStateChange={setSomeState} />}
      />
      <LeftNav>
        <SomeLink someState={someState} />
        <SomeOtherLink someState={someState} />
        <Etc someState={someState} />
      </LeftNav>
      <MainContent>
        <SomeSensibleComponent someState={someState} />
        <AndSoOn someState={someState} />
      </MainContent>
    </>
  );
}
```

위 예제는 제가 억지로 만들어낸것이기 때문에 이해가 잘 안되실 수도 있습니다. 그렇다면 [Michael Jackson](https://twitter.com/mjackson)씨의 [동영상](https://www.youtube.com/watch?v=3XaXKiXtNjw)을 통해 제가 말하고자 한것이 무엇인지 알 수 있을거에요!

하지만 결국 컴포넌트 합성으로도 문제가 해결되지 않을 수 있습니다. 이 경우엔 React의 컨텍스트 API를 사용할 수 있습니다. 사실 컨텍스트 API는 오랫동안 "비공식적인 해답"이었습니다. 제가 앞서 말한 것처럼 많은 사람들이 `react-redux`를 사용함으로써 React 공식 문서에 존재했던 경고에 구애받지 않고 위의 메커니즘을 이용하여 문제를 해결할 수 있었거든요. 하지만 이제 React가 `context`를 공식적으로 지원하기 때문에 아무 걱정 없이 이를 직접 사용할 수 있게 되었습니다:

```jsx
import * as React from 'react';

const CountContext = React.createContext();

function useCount() {
  const context = React.useContext(CountContext);
  if (!context) {
    throw new Error(`useCount must be used within a CountProvider`);
  }
  return context;
}

function CountProvider(props) {
  const [count, setCount] = React.useState(0);
  const value = React.useMemo(() => [count, setCount], [count]);
  return <CountContext.Provider value={value} {...props} />;
}

export { CountProvider, useCount };
```

```jsx
import * as React from 'react';
import { CountProvider, useCount } from './count-context';

function Counter() {
  const [count, setCount] = useCount();
  const increment = () => setCount(c => c + 1);
  return <button onClick={increment}>{count}</button>;
}

function CountDisplay() {
  const [count] = useCount();
  return <div>The current counter count is {count}</div>;
}

function CountPage() {
  return (
    <div>
      <CountProvider>
        <CountDisplay />
        <Counter />
      </CountProvider>
    </div>
  );
}
```

([데모](https://codesandbox.io/s/4qzj73lozx?fontsize=14&hidenavigation=1&module=%2Fsrc%2F03-context.js&moduleview=1))

> ⚠️ 경고: 위 예제는 매우 인위적인 코드입니다. 따라서 위와 같은 상황에 컨텍스트 API를 사용하지 않는 것을 추천합니다. 우선 [Prop Drilling](https://kentcdodds.com/blog/prop-drilling)을 읽어보시고 어느 경우에 prop drilling이 적합한지를 살펴보세요. Prop drilling은 무조건 나쁘기 때문에 컨텍스트를 써야한다는 말은 틀린 말입니다!

이러한 접근법이 멋진 이유는 우리의 `useCount` 훅에 상태를 업데이트하기 위한 공통 로직들을 집어넣을 수 있다는 점입니다:

```jsx
function useCount() {
  const context = React.useContext(CountContext);
  if (!context) {
    throw new Error(`useCount must be used within a CountProvider`);
  }
  const [count, setCount] = context;

  const increment = () => setCount(c => c + 1);
  return {
    count,
    setCount,
    increment,
  };
}
```

([데모](https://codesandbox.io/s/4qzj73lozx?fontsize=14&hidenavigation=1&module=%2Fsrc%2F04-context-with-logic.js&moduleview=1))

또, `useState` 대신 `useReducer`를 사용할 수도 있습니다:

```jsx
function countReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT': {
      return { count: state.count + 1 };
    }
    default: {
      throw new Error(`Unsupported action type: ${action.type}`);
    }
  }
}

function CountProvider(props) {
  const [state, dispatch] = React.useReducer(countReducer, { count: 0 });
  const value = React.useMemo(() => [state, dispatch], [state]);
  return <CountContext.Provider value={value} {...props} />;
}

function useCount() {
  const context = React.useContext(CountContext);
  if (!context) {
    throw new Error(`useCount must be used within a CountProvider`);
  }
  const [state, dispatch] = context;

  const increment = () => dispatch({ type: 'INCREMENT' });
  return {
    state,
    dispatch,
    increment,
  };
}
```

([데모](https://codesandbox.io/s/4qzj73lozx?fontsize=14&hidenavigation=1&module=%2Fsrc%2F05-context-with-reducer.js&moduleview=1))

이는 우리에게 엄청난 자율성 줄 뿐만 아니라, 복잡도를 크게 줄여줍니다. 하지만 이와 같은 방식을 사용할 때 몇 가지 주의하실 점이 있습니다:

1. 애플리케이션의 모든 상태를 하나의 객체에 저장할 필요는 없습니다. 상태들을 논리적으로 잘 분할하세요 ("유저 설정" 상태는 "알림" 상태와 같은 컨텍스트에 있을 필요가 전혀 없습니다). 이렇게 하면 여러 개의 `Provider`가 필요하게 될 겁니다.
2. 모든 컨텍스트를 전역에서 접근하도록 할 필요는 없습니다! **상태를 (해당 상태가) 사용되는 곳과 최대한 가깝게 위치시키세요.**

2번째 주의점에 좀 더 집중해봅시다. 애플리케이션의 트리가 다음과 같다고 해보자구요:

```jsx
function App() {
  return (
    <ThemeProvider>
      <AuthenticationProvider>
        <Router>
          <Home path="/" />
          <About path="/about" />
          <UserPage path="/:userId" />
          <UserSettings path="/settings" />
          <Notifications path="/notifications" />
        </Router>
      </AuthenticationProvider>
    </ThemeProvider>
  );
}

function Notifications() {
  return (
    <NotificationsProvider>
      <NotificationsTab />
      <NotificationsTypeList />
      <NotificationsList />
    </NotificationsProvider>
  );
}

function UserPage({ username }) {
  return (
    <UserProvider username={username}>
      <UserInfo />
      <UserNav />
      <UserActivity />
    </UserProvider>
  );
}

function UserSettings() {
  // 아마 `AuthenticationProvider`와 연관된 훅일겁니다
  const { user } = useAuthenticatedUser();
}
```

각 페이지별로 해당 페이지에서 사용되는 데이터를 가지고 있는 `Provider`가 따로 존재한다는 점을 주목해주세요. 코드 분할은 이러한 상황에 알맞습니다. 각 `Provider`가 어떻게 데이터를 얻는지는 어떤 훅을 사용하느냐에 따라 달렸고, 또한 여러분이 (애플리케이션 내에서) 데이터를 어떻게 사용하는지에 달렸지만, 이들이 `Provider` 내에서 어떻게 동작하는지를 살펴보기 위해 어디서부터 시작해야 하는지 쉽게 알아낼 수 있을 겁니다.

**문맥에 맞게 위치시키는(colocation)것이 왜 좋은지에 대해 더 알고 싶으시다면 제가 쓴 ["State Colocation will make your React app faster"](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)와 ["Colocation"](https://kentcdodds.com/blog/colocation) 포스트를 참고하세요. 그리고 컨텍스트 API에 대해선 [How to use React Context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively)를 살펴보세요).**

## 서버 캐시 vs. UI 상태

한 가지 더 말씀드리고 싶은 것이 있습니다. 상태를 여러 카테고리로 분류할 수 있지만, 결국 크게 보면 모든 상태는 아래의 두 종류로 나눌 수 있습니다:

- **서버 캐시**: 유저 데이터와 같이, 실제로는 서버에 저장되며 좀 더 빠른 접근을 위해 클라이언트에다 저장.
- **UI 상태**: 모달창의 `isOpen` 상태와 같이, 애플리케이션의 상호작용 UI를 제어하는 데에만 유용한 상태.

이 둘을 혼용해서 쓰는 경우 실수가 발생할 수 있습니다. 서버 캐시는 근본적으로 UI 상태와는 다른 문제를 가지고 있기 때문에 이 둘은 서로 다르게 관리되어야만 합니다. 여러분이 다루고 있는 것이 실제로는 "상태"가 아니라 "상태의 캐시"라는 것을 깨닫게 되신다면 이들을 적합하게 다루는 방법을 고민하게 되고 그로 인해 이들을 더욱 잘 관리할 수 있게 됩니다.

물론 여러분들만의 `useState`, `useReducer`를 이용하여 적재적소에 `useContext`를 사용함으로써 여러분 스스로 이것들을 관리할 수도 있습니다만, 캐싱은 정말 정말 어려운 문제이기 때문에 ([누군가](https://martinfowler.com/bliki/TwoHardThings.html)는 컴퓨터 공학에서 제일 어려운 것 중 하나가 캐싱이라고 할 정도니까요!) 거인의 어깨 위에 올라타는 것이 현명한 선택이라고 생각합니다.

이 때문에 저는 캐싱과 관련된 상태에 대해선 [react-query](https://github.com/tannerlinsley/react-query)를 사용합니다. 아 그럼요, 물론 앞에서 상태관리 라이브러리가 필요 없을 것이라 얘기했지만 개인적으로 react-query가 상태관리 라이브러리라고 생각하지는 않습니다. 오히려 캐시를 다루는 라이브러리라고 생각하는 편이지요. 그리고 이건 정말 끝내주는 라이브러리입니다. [Tanner Linsley](https://twitter.com/tannerlinsley) (react-query 개발자)는 정말 똑똑한 사람입니다.