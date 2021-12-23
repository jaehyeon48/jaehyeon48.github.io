---
title: 'UI 런타임으로서의 React'
date: 2021-12-22
category: 'react'
draft: false
---

이 포스트는 [React as a UI Runtime](https://overreacted.io/react-as-a-ui-runtime/)를 번역/요약한 글입니다.

<hr class="custom-hr">

## 호스트 트리 (Host Tree)

- 각기 다른 프로그래밍 언어들과 이들의 런타임 환경은 특정 용도에 최적화되어있고, 이는 React도 예외가 아니다.
- React 프로그램은 시간에 따라 변할 수도 있는 **트리**를 출력한다. 이 트리를 **"호스트 트리"** 라고 하는데, 이는 이 트리가 React의 일부가 아니라 DOM과 같이 *외부 호스트 환경*의 일부이기 때문이다. 호스트 트리는 자체적인 명령형(imperative) API가 있고, React는 그 위에 존재하는 레이어이다.
- 매우 추상적으로 말하자면, React는 외부 상호작용·네트워크 응답·타이머와 같은 외부 이벤트에 대해 반응하는 복잡한 호스트 트리를 예측 가능한 방식으로 조작할 수 있는 프로그램을 만드는 데 도움을 준다.
- React는 다음의 두 원칙에 근거하고 있다:

  - **안정성**: 호스트 트리는 비교적 안정적이며, 대부분의 업데이트는 트리 전체의 구조를 뜯어고치진 않는다. 만약 모든 상호작용하는 요소들이 매 순간 완전히 바뀌게 된다면 "아니, 버튼이 어디로 간 거야?" 혹은, "화면이 왜 이래?"와 같이 앱을 사용하기 어려울 것이다.
  - **규칙성**: 호스트 트리는 무작위 형태가 아닌, 일관된 모습과 동작을 지닌 (버튼, 리스트, 아바타와 같은) UI 패턴 으로 나눌 수 있다.

- 이러한 원칙들은 대부분의 UI에 해당하지만, [3D 파이프 스크린 세이버](https://www.youtube.com/watch?v=Uzx9ArZ7MUU)와 같이 일정한 "패턴"이 없는 경우엔 별 도움이 안 된다.

## 호스트 객체 (Host Instances)

- 호스트 트리는 **호스트 객체**라고 불리는 노드들로 구성된다. DOM 환경에서 `document.createElement('div')`를 했을 때 생성되는 객체(DOM 노드)와 흡사하다고 할 수 있다.
- 호스트 객체는 `domNode.className` 혹은 `view.tintColor`와 같은 고유한 프로퍼티를 가지고 있으며, 다른 호스트 객체를 자식으로 가질 수도 있다.
- 또한 DOM의 `appendChild`, `removeChild`와 같이, 호스트 객체를 조작할 수 있는 API도 존재한다. 일반적인 React 앱에선 (React가 대신 처리해 주기 때문에) 이러한 API를 호출할 일이 없을 것이다.

## 렌더러 (Renderers)

- **렌더러**는 React로 하여금 특정 호스트 환경과 소통하고, (해당 환경에 있는) 호스트 객체들을 관리하도록 한다. React DOM, React Native와 같은 것들이 렌더러이다. 또한 [나만의 렌더러를 직접 만들 수도 있다.](https://github.com/facebook/react/tree/main/packages/react-reconciler)
- React 렌더러에는 두 가지 동작 모드가 존재한다:

  - **변경(mutating) 모드**: 대부분의 렌더러들은 변경 모드를 사용하도록 만들어졌다. 이 모드는 DOM이 동작하는 방식인데, 노드를 만들 수 있고, 프로퍼티를 설정할 수 있고, 추후에 자식을 추가하거나 제거할 수도 있다. 호스트 객체들은 가변(mutable)이다.
  - **지속(persistent) 모드:**: 지속 모드는 `appendChild()`와 같은 메소드를 제공하지 않는 호스트 환경에서 동작하는 모드이다. 이 모드에선 부모의 트리를 복제하여 최상위 자식을 대체하는 방식으로 동작한다. 호스트 트리의 불변성 덕분에 멀티 스레딩을 쉽게할 수 있다. [React Fabric](https://reactnative.dev/blog/2018/06/14/state-of-react-native-2018)은 이를 활용한다.

## React 요소 (React Element)

- (DOM 노드와 같은) 호스트 객체는 호스트 환경에서 가장 작은 구성 요소이다. React에선 React 요소가 가장 작은 구성 요소이다.
- React 요소는 호스트 객체를 묘사할 수 있는 일반적인 자바스크립트 객체이다:

```js
// JSX는 아래의 객체를 만들기 위한 syntax sugar이다.
// <button className="blue" />
{
  type: 'button',
  props: { className: 'blue' }
}
```

- React 요소는 어떠한 호스트 객체와도 연관되지 않는다. 다시 말하지만, React 요소는 단순히 어떤 것이 화면에 그려졌으면 하는지에 대한 정보에 불과하다.
- 또한 호스트 객체와 같이 React 요소도 트리 구조를 형성할 수 있다 (여기선 [몇몇 프로퍼티](https://overreacted.io/why-do-react-elements-have-typeof-property/)들이 생략되어 있다):

```js

// JSX는 아래의 객체를 만들기 위한 syntax sugar이다.
// <dialog>
//   <button className="blue" />
//   <button className="red" />
// </dialog>
{
  type: 'dialog',
  props: {
    children: [{
      type: 'button',
      props: { className: 'blue' }
    }, {
      type: 'button',
      props: { className: 'red' }
    }]
  }
}
```

- 하지만, React 요소에는 영구적인 고유 ID가 존재하지 않는다. 이들은 매번 새로 만들어지고 버려진다.
- 또, React 요소들은 불변(immutable)이기 때문에, 요소의 자식이나 프로퍼티 등을 변경할 수 없다. 만약 무언가 다른 것을 (화면에) 렌더링 하고 싶다면 새로운 React 요소를 생성해야 한다.
- React 요소를 영화의 프레임으로 생각하면 쉽다. 각 요소들은 특정 순간에 UI가 어떠한 모습이어야 하는지를 나타내고 있고, 변하지 않는다.

## 진입점 (Entry Point)

- 각 React 렌더러에는 "진입점"이 존재한다. 진입점은 우리가 React로 하여금 어떤 React 요소 트리를 컨테이너 호스트 객체 내부에 렌더링 할 수 있게 해주는 API라고 할 수 있다.
- 예를 들면, React DOM의 진입점은 `ReactDOM.render` 이다:

```jsx
ReactDOM.render(
  // 아래의 JSX는 {type: 'button', props: {className: 'blue'}}를 나타낸 것이라 할 수 있다.
  <button className="blue" />,
  document.getElementById('container')
)
```

- `ReactDOM.render(reactElement, domContainer)`라고 하는 것은 "React님, `domContainer` 호스트 트리를 `reactElement`와 같게 해주세요"라고 하는 것과 같다.
- React는 요소의 타입 (`reactElement.type`, 위 예시에서는 `'button'`)을 보고, ReactDOM 렌더러에게 해당 타입에 맞는 호스트 객체를 생성하고 프로퍼티를 설정하도록 요청한다:

```js{3-4,9-10}
// ReactDOM 렌더러 어딘가 (간략한 버전)
function createHostInstance(reactElement) {
  let domNode = document.createElement(reactElement.type)
  domNode.className = reactElement.props.className
  return domNode
}

// 현재 예시에 대해 React가 실질적으로 하는 동작은 다음과 같다:
let domNode = document.createElement('button')
domNode.className = 'blue'

domContainer.appendChild(domNode)
```

- 만약 React 요소에 자식 요소가 존재한다면 (`reactElement.props.children`), React는 첫 번째 렌더링 때 재귀적으로 해당 자식 요소들을 생성한다.

## 재조정 (Reconciliation)

- 동일한 컨테이너에 대해 `ReactDOM.render()`를 두 번 호출하면 어떻게 될까?

```jsx{2, 11}
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
)

// ... 이후

// 현재의 "버튼" 호스트 객체를 대체해야할 까, 아니면
// 단순히 기존 호스트 객체의 프로퍼티를 업데이트 해야할까?
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
)
```

- 다시 말하자면, React의 역할은 호스트 트리와 현재 주어진 React 요소 트리를 같게 만드는 것이다. 새로운 정보를 바탕으로 호스트 객체에 어떤 작업을 해야 하는지를 알아내는 과정을 [reconciliation](https://reactjs.org/docs/reconciliation.html) 이라고 한다.
- 재조정에는 두 가지 방법이 존재한다. 단순히 기존의 트리를 날려버리고 새로운 트리를 처음부터 다시 만드는 방법이 있을 수 있다:

```js
let domContainer = document.getElementById('container')
// 트리 초기화
domContainer.innerHTML = ''
// 새로운 호스트 트리를 생성
let domNode = document.createElement('button')
domNode.className = 'red'
domContainer.appendChild(domNode)
```

- 하지만 DOM의 경우 위 방법은 느리다. 또한, 포커스, 선택, 스크롤 상태와 같은 정보들도 다 날아간다. 따라서 위 방법 대신 다음과 같은 방법을 사용할 수 있다:

```js
let domNode = domContainer.firstChild
// 기존에 존재하는 호스트 객체를 업데이트
domNode.className = 'red'
```

- 즉, React는 _언제_ 기존의 호스트 객체를 업데이트 할지, 그리고 언제 새로운 객체를 생성할지 결정해야 한다. 하지만 이때, React 요소들은 매번 다른데 어떻게 같은 호스트 객체를 나타낸다는 것을 어떻게 알 수 있을까?
- 위 예제에서는 간단하다. `<button>`을 첫 번째 자식으로 렌더링 했고, 똑같은 위치에 `<button>`을 다시 렌더링 하고 싶어 하므로, 기존에 존재하는 `<button>` 호스트 객체를 재사용하면 된다. 이는 React가 생각하는 방식과 흡사하다.
- **직전 렌더링과 다음 렌더링 사이에, 트리상에서 같은 위치에 있는 요소들의 타입이 같으면 React는 기존에 존재하는 호스트 객체를 재사용한다**. 다음 예제를 살펴보자:

```jsx{9-10,16,26-27}
// let domNode = document.createElement('button');
// domNode.className = 'blue';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
)

// 호스트 객체를 재사용할 수 있다! (button → button)
// domNode.className = 'red';
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
)

// 호스트 객체를 재사용할 수 없다.. (button → p)
// domContainer.removeChild(domNode);
// domNode = document.createElement('p');
// domNode.textContent = 'Hello';
// domContainer.appendChild(domNode);
ReactDOM.render(<p>Hello</p>, document.getElementById('container'))

// 호스트 객체를 재사용할 수 있다! (p → p)
// domNode.textContent = 'Goodbye';
ReactDOM.render(<p>Goodbye</p>, document.getElementById('container'))
```

- 자식 트리에도 동일한 휴리스틱 알고리즘이 적용된다. 예를 들어, 두 개의 `<button>` 요소를 자식으로 가지는 `<dialog>` 요소를 업데이트할 때, React는 우선 부모 요소인 `<dialog>`를 재사용할 수 있는지 따져보고 그다음 이러한 과정을 자식 요소인 `<button>`에 대해서도 동일하게 진행한다.

## 조건 (Conditions)

- 업데이트할 때, React가 같은 타입의 호스트 객체들만 재사용한다면 조건부 컨텐츠(특정 조건을 만족하는 경우 나타나는 컨텐츠?)에 대해선 어떻게 해야할까? 다음 예제와 같이, 처음에는 input만 보여줬다가 이후 메세지도 함께 보여준다고 하자:

```js{12}
// First render
ReactDOM.render(
  <dialog>
    <input />
  </dialog>,
  domContainer
)

// Next render
ReactDOM.render(
  <dialog>
    <p>I was just added here!</p>
    <input />
  </dialog>,
  domContainer
)
```

- 위 예제에서 `<input>` 호스트 객체는 다시 생성될 것이다. React가 이전 버전의 트리와 비교하는 과정을 다음처럼 나타낼 수 있다:

  - `dialog → dialog`: 요소의 타입이 일치하므로 호스트 객체 재사용 가능.
    - `input → p`: 요소의 타입이 변경되었으므로 재사용 불가능. 기존의 `input` 객체를 제거하고 새로운 `p` 호스트 객체를 생성해야함.
    - `(noting) → input`: 새로운 `input` 객체를 생성해야함.

- 따라서, 실질적으로 React가 수행한 업데이트 코드는 다음과 같을 것이다:

```js{1-2,8-9}
let oldInputNode = dialogNode.firstChild
dialogNode.removeChild(oldInputNode)

let pNode = document.createElement('p')
pNode.textContent = 'I was just added here!'
dialogNode.appendChild(pNode)

let newInputNode = document.createElement('input')
dialogNode.appendChild(newInputNode)
```

- 하지만 생각해 보면, `<input>`이 `<p>`로 바뀐 것이 아니라 단순히 이동된 것이므로 위와 같은 동작은 뭔가 아쉽다. 또, 이렇게 하면 포커스, 선택, 입력한 내용들도 다 날아가버린다.
- 사실 이 문제엔 (곧 살펴볼) 간단한 해결책이 존재한다. 하지만 위와 같은 상황이 그리 자주 발생하지는 않는다. 왜냐면, 실제로는 `ReactDOM.render`를 직접 호출할 일이 거의 없기 때문이다. 대신, React 앱들은 주로 다음과 같이 함수들로 나뉘게 된다:

```jsx
function Form({ showMessage }) {
  let message = null
  if (showMessage) {
    message = <p>I was just added here!</p>
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  )
}
```

- 이 예제에선 방금 살펴본 문제가 발생하지 않는다. 왜 그런지는 다음과 같이 JSX를 객체 형태로 표시하면 더 쉽게 확인할 수 있다. `dialog`의 자식 트리를 살펴보자:

```js{12-15}
function Form({ showMessage }) {
  let message = null
  if (showMessage) {
    message = {
      type: 'p',
      props: { children: 'I was just added here!' },
    }
  }
  return {
    type: 'dialog',
    props: {
      children: [message, { type: 'input', props: {} }],
    },
  }
}
```

- 여기서, `showMessage`가 `true`이건 `false`이건 상관없이 `<input>`은 항상 `<dialog>`의 두 번째 자식이므로 그 위치가 변하지 않는다. `showMessage`가 `false`에서 `true`로 바뀌면 React는 다음과 같이 이전 버전과 비교할 것이다:

  - `dialog → dialog`: 요소의 타입이 일치하므로 호스트 객체 재사용 가능.
    - `(null) → p`: 새로운 `p` 호스트 객체를 추가해야함.
    - `input → input`: 요소의 타입이 일치하므로 호스트 객체 재사용 가능.

- 따라서, 실질적으로 React가 수행한 업데이트 코드는 다음과 같을 것이다:

```js
// "input"의 상태가 그대로 유지된다!
let inputNode = dialogNode.firstChild
let pNode = document.createElement('p')
pNode.textContent = 'I was just added here!'
dialogNode.insertBefore(pNode, inputNode)
```

## 리스트 (Lists)

- 일반적으로, 트리에서 동일한 위치에 존재하는 호스팅 객체를 재사용할지 새로 생성할지 결정하는 데엔 요소의 타입을 비교하는 것으로 충분하다. 하지만 이는 자식들의 위치가 변하지않고(static), 자식들 간의 순서가 바뀌지 않는 경우에만 유효하다. 앞선 예제에선 `message`가 "구멍(null)"이 된다고 해도 우리는 여전히 `input`이 `message` 바로 다음에 위치하고 있음을 알 수 있다.
- 하지만 동적 리스트의 경우 그 순서가 항상 같을 거라고 예측할 수 없다:

```jsx
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p>
          You bought {item.name}
          <br />
          Enter how many do you want: <input />
        </p>
      ))}
    </form>
  )
}
```

- 위 예제의 `list`가 재정렬 되어도 같은 위치에 있는 `p`와 `input` 요소들이 같은 타입이므로 이 요소들을 이동시키지 않을 것이다. 즉, React의 관점에서 보자면 "요소들 자체"(요소의 내용)가 변경된 것이지 이들의 "위치"가 변경된 것이 아니다. 10개의 항목을 재정렬 하기 위해 React가 실행한 코드는 다음과 유사할 것이다:

```jsx
for (let i = 0; i < 10; i++) {
  let pNode = formNode.childNodes[i]
  let textNode = pNode.firstChild
  textNode.textContent = 'You bought ' + items[i].name
}
```

- 즉, React는 항목들의 순서를 변경한 것이 아니라 각 항목들을 업데이트하였다. 이러한 문제는 성능 이슈와 버그를 야기할 수 있는데, 예를 들어 첫 번째 항목의 `input`은 재정렬 이후에도 계속해서 첫 번째 항목의 `input`으로 남아있게 된다. 실제로는 다른 항목을 나타내는 것임에도 말이다! [예제](https://codesandbox.io/s/react-no-key-in-list-example-hf9yw?file=/src/index.js)
- 이것이 바로 배열 요소에 대해 React가 `key` 프로퍼티를 요구하는 이유이다:

```jsx{5}
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p key={item.productId}>
          You bought {item.name}
          <br />
          Enter how many do you want: <input />
        </p>
      ))}
    </form>
  )
}
```

- `key`는 React로 하여금 렌더링 시에 부모 요소 내에서 해당 항목의 위치가 변경되어도 같은 요소로 간주하도록 한다. React가 `<form>` 내부에 있는 `<p key="42">` 요소를 보게 되면 직전 렌더링에서도 `<form>` 내부에 `<p key="42">`가 있었는지 살펴볼 것이다. `<form>`의 자식 요소들 간의 순서가 바뀌었다고 해도 정상적으로 동작하는데, React는 같은 `key`를 가지는 직전의 호스트 객체를 재사용하고 요소들의 순서를 알맞게 정렬할 것이다.
- 이때 React는 서로 다른 부모 요소 사이에서 `key`를 비교하지 않는다. `key`는 위 예제에서의 `<form>`과 같이 오직 동일한 부모 요소에만 관련이 있다.
- 그리고 `key` 프로퍼티의 값으로는 **순서가 바뀌어도 동일한 항목임을 나타낼 수 있는**, 즉 항목을 식별할 수 있는 고유한 값이 적절하다. [예제](https://codesandbox.io/s/react-list-with-proper-key-prop-example-evztx?file=/src/index.js)

## 컴포넌트 (Components)

- 이미 우리는 React 요소를 반환하는 함수를 본 적이 있다:

```jsx
function Form({ showMessage }) {
  let message = null
  if (showMessage) {
    message = <p>I was just added here!</p>
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  )
}
```

- 이러한 함수를 **컴포넌트**라고 부르는데, 컴포넌트는 우리만의 버튼, 아바타, 댓글 등을 관리하는 도구 상자(toolbox)를 만들 수 있게 해준다.
- 컴포넌트는 "해쉬 객체" 하나만을 인자로 갖는다. 이 해쉬 객체에는 `prop`이 존재한다. 위 예제에서 `showMessage`가 prop인데, 여기선 [Object destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#object_destructuring)이 사용되었다.

## 순수성(Purity)

- React 컴포넌트는 전달받은 `prop`에 대해 *순수*하다고 여겨진다:

```js
function Button(props) {
  // 🔴 동작하지 않음!
  props.isActive = true
}
```

- 일반적으로 React에선 mutation이 자연스럽지 않다 (이벤트에 반응하여 UI를 자연스럽게 바꾸는 방법은 추후에 살펴보자).
- 하지만 local mutation은 괜찮다:

```jsx{2,5}
function FriendList({ friends }) {
  let items = []
  for (let i = 0; i < friends.length; i++) {
    let friend = friends[i]
    items.push(<Friend key={friend.id} friend={friend} />)
  }
  return <section>{items}</section>
}
```

- 여기선 렌더링 중에 `items`를 만들었지만 다른 어떠한 컴포넌트도 이 변수를 참조하지 않고 있기 때문에 렌더링 결과를 만들기 전까지 처리하는 과정에서 얼마든지 변형시킬 수 있다. Local mutation을 굳이 피할 이유는 없다.
- 비슷한 맥락으로, lazy initialization 또한 (완전히 "순수" 하지는 않지만) 괜찮다:

```js
function ExpenseForm() {
  // 다른 컴포넌트에 영향을 주지 않는다면 괜찮다:
  SuperCalculator.initializeIfNotReady()

  // 계속해서 렌더링...
}
```

- 한 컴포넌트를 여러 번 호출하는 것이 안전하고 다른 컴포넌트의 렌더링에 영향을 미치지 않는 한, 해당 컴포넌트가 엄격한 FP의 관점에서 100% "순수" 하지는 않더라도 React는 별다른 신경을 쓰지 않는다. React에선 [멱등성(Idempotent)](https://stackoverflow.com/questions/1077412/what-is-an-idempotent-operation)이 순수성 보다 더 중요하다.
- 다시 말해, 사용자에게 직접적으로 보여지는 side effect는 React 컴포넌트에서 허용되지 않는다. 즉, 함수 컴포넌트를 단순히 호출만 했을 때 화면에 어떤 변화가 발생하면 안 된다는 뜻이다.

## 재귀 (Recursion)

- 컴포넌트는 그냥 "함수"이므로, 해당 함수 컴포넌트를 호출함으로써 한 컴포넌트들 다른 컴포넌트에서 사용할 수 있다:

```js
let reactElement = Form({ showMessage: true })
ReactDOM.render(reactElement, domContainer)
```

- 하지만 이는 React 런타임에서 자연스러운 방법이 아니다. 대신 우리가 여태껏 본 것과 같이, 컴포넌트를 React 요소를 사용하는 방법처럼 사용하는 것이 더 자연스러운 방법이다. 다시 말해 **함수 (컴포넌트)를 직접 호출하지 않고, React가 알아서 대신 호출하도록 하는 것이다**:

```jsx
// { type: Form, props: { showMessage: true } }
let reactElement = <Form showMessage={true} />
ReactDOM.render(reactElement, domContainer)

// React 어딘가에서 해당 컴포넌트가 호출될 것이다
let type = reactElement.type // Form
let props = reactElement.props // { showMessage: true }
let result = type(props) // Whatever Form returns
```

- 함수 컴포넌트의 이름은 항상 대문자로 시작한다. JSX를 번역할 때, `<form>` 대신 `<Form>`을 보게 되면 해당 객체의 타입을 문자열이 아니라 식별자로 본다:

```jsx
console.log((<form />).type) // 'form' string
console.log((<Form />).type) // Form function
```

- (컴포넌트가) 전역으로 등록되는 메커니즘 같은 건 없다. 단순히 컴포넌트의 이름을 통해 참조하는 것이다. 만약 컴포넌트가 로컬 스코프에 없다면 일반적인 자바스크립트에서 변수를 잘못 참조한 경우와 같이 에러를 보게 될 것이다.
- 그렇다면 요소의 타입이 함수일 때 React는 어떤 일을 할까? **React 요소의 타입이 함수인 경우, React는 해당 컴포넌트를 호출하여 컴포넌트가 렌더링하고자 하는 요소들이 무엇인지 알아낸다.**
- 이러한 과정은 재귀적으로 이어지며, [여기](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html)에 더 자세히 나와있다. 요약하자면 다음과 비슷하다:

  - **나**: `ReactDOM.render(<App />, domContainer)`
  - **React**: 안녕 `App`! 무엇을 렌더링하고 싶니?
    - `App`: 나는 `<Layout>`안에 `<Content>`를 그려.
  - **React**: 안녕 `Layout`! 무엇을 렌더링하고 싶니?
    - `Layout`: 나는 내 자식들을 `<div>` 안에다 그릴거야. 내 자식이 `<Content>`니까 이게 `<div>` 안에 들어갈 것 같아.
  - **React**: 안녕 `Content`! 무엇을 렌더링하고 싶니?
    - `Content`: 나는 텍스트와 `<Footer>`를 `<article>` 안에 그려.
  - **React**: 안녕 `Footer`! 무엇을 렌더링하고 싶니?
    - `Footer`: 나는 `<footer>` 안에 텍스트를 적고 싶어.
  - **React**: 좋아. 여기있어:

```html
// 결과:
<div>
  <article>
    Some text
    <footer>some more text</footer>
  </article>
</div>
```

- 이것이 우리가 앞에서 재조정(reconciliation) 과정이 재귀적이라고 했던 이유이다. React가 요소 트리를 순회하는 과정에서 타입이 컴포넌트인 요소를 만나게 되면 해당 컴포넌트를 호출하고, 컴포넌트에서 반환된 요소들을 타고 내려가 계속해서 순회를 이어나간다. 결국 더 이상 순회할 요소가 없게 되면 React는 호스트 트리를 어떻게 변경해야 할지 알게 된다.

## 제어의 역전 (Inversion of Control)

- `Form()` 대신 `<Form/>`이라고 쓰는 것처럼, 왜 컴포넌트를 직접 호출하지 않는지에 대해 궁금할 수도 있을 것이다. 그 이유는, **재귀적으로 (직접) 호출한 React 요소를 보는 것보다 React 스스로가 컴포넌트들에 대해 알고 있으면 React가 해야 할 작업을 더 잘 수행할 수 있기 때문이다.**

```jsx
// 🔴 (사용자가) 컴포넌트를 직접 호출하게되면 React로선
// "Layout"과 "Article"이 존재하는지 알 수 없다.
ReactDOM.render(
  Layout({ children: Article() }),
  domContainer
)

// ✅ 반면, React가 컴포넌트를 호출하면 
// "Layout"과 "Article"이 존재하는지 알 수 있다!
ReactDOM.render(
  <Layout>
    <Article />
  </Layout>,
  domContainer
)
```

- 이는 [제어의 역전](https://en.wikipedia.org/wiki/Inversion_of_control)의 대표적인 예시이다. 또한, React가 컴포넌트 호출 제어권을 가지게 함으로써 생기는 몇 가지 흥미로운 이점들이 있다:

  - **컴포넌트는 함수 이상의 역할을 하게 된다**: React는 지역 상태와 같은 기능들을 컴포넌트와 묶을 수 있게 된다. 앞서 살펴본 것처럼 React는 이벤트에 응답하는 UI 트리를 생성하는데, 컴포넌트를 (React 대신) 직접 호출하면 부가적인 기능들을 직접 구현해야 한다.
  - **컴포넌트 타입으로 재조정을 한다**: React가 컴포넌트를 호출하게 되면 React는 트리의 구조를 더욱 많이 알게 된다. 예를 들어 `<Feed>` 페이지에서 `<Profile>` 페이지로 이동하면 React는 (`<button>`을 `<p>`로 바꾸는 것처럼) 해당 요소의 호스트 객체를 재사용하지 않는다. 이렇듯 다른 view를 렌더링 하는 경우엔 이와 같이 (기존의) 모든 상태를 날려버리는 것이 바람직하다. `<input>` 요소가 우연히 트리상에서 같은 위치에 존재한다고 하더라도 `<PasswordFrom>`과 `<MessengerChat>`간에 입력 상태를 유지하고 싶지는 않을 것이다.
  - **React가 재조정을 지연할 수 있다**: React가 컴포넌트 호출 제어권을 가지면 여러 가지 흥미로운 것들을 할 수 있다. 예를 들면, 거대한 컴포넌트를 리렌더링 하는 것이 [메인 스레드를 blocking 하지 않도록](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) 컴포넌트 호출 사이에 브라우저로 하여금 일부 작업을 더 하도록 할 수 있다. React를 뜯어고치지 않고선 이 작업을 수동으로 하는 것은 쉽지 않을 것이다.
  - **더 나은 디버깅**: 컴포넌트가 React가 인지하고 있는 일급 객체라면 [풍부한 디버깅 도구](https://github.com/facebook/react-devtools)들을 만들 수 있게 된다.

- 마지막 이점은 **지연 평가(lazy evaluation)**에 관한 것이다. 다음 섹션에서 살펴보자.

## 지연 평가 (Lazy Evaluation)

- 자바스크립트에서 함수를 호출할 때, 함수에 전달되는 인자들은 호출 전에 평가된다:

```js
// (2) 나중에 계산됨
eat(
  // (1) 먼저 계산됨
  prepareMeal();
);
```

- 자바스크립트 함수가 암묵적으로 side effect를 가질 수 있기 때문에 이는 대개 자바스크립트 개발자들이 생각하는 방식이다. 함수를 직접 호출했다면 (예상치 못한 문제로) 놀랄 수도 있겠지만, 자바스크립트 어딘가에서 결과가 사용될 때까지 실행되지 않는다.
- 하지만 React 컴포넌트는 상대적으로 순수하다. 컴포넌트의 (반환) 결과가 화면에 렌더링 되지 않는다는 것을 알고 있다면, 이를 실행할 필요가 없다.
- 다음의 예제를 살펴보자:

```jsx{11}
function Story({ currentUser }) {
  // return {
  //   type: Page,
  //   props: {
  //     user: currentUser,
  //     children: { type: Comments, props: {} }
  //   }
  // }
  return (
    <Page user={currentUser}>
      <Comments />
    </Page>
  );
}
```

- 여기서 `<Page>` 컴포넌트는 넘겨받은 `children`을 `Layout` 내부에 사용할 수 있다:

```jsx{4}
function Page({ user, children }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

(JSX에서 `<A><B /></A>`와 `<A children={<B /} />`는 
똑같다.)

- 하지만 특정 조건에 의해 일찍 반환된다면 어떨까?

```jsx{2-4}
function Page({ user, children }) {
  if (!user.isLoggedIn) {
    return <h1>Please log in</h1>;
  }

  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

- 만약 `Comments()`와 같이 우리가 직접 `Comments`를 호출했다면 `Page`의 렌더링 여부에 관계없이 무조건 `Comments` 컴포넌트를 실행할 것이다:

```jsx{4, 8}
// {
//   type: Page,
//   props: {
//     children: Comments() // 무조건 실행된다!
//   }
// }
<Page>
  {Comments()}
</Page>
```

- 하지만 `<Comments />`와 같이 React 요소를 넘기게 되면 `Comments`를 실행하지 않는다:

```jsx{4, 8}
// {
//   type: Page,
//   props: {
//     children: { type: Comments }
//   }
// }
<Page>
  <Comments />
</Page>
```

- (React가 컴포넌트를 호출함으로써) React는 컴포넌트를 호출할지 말 지 결정할 수 있다. `Page` 컴포넌트가 `children` prop 대신 `<h1>Please log in</h1>`을 렌더링한다면 React는 (`children` prop으로 넘어온) `<Comments>` 함수를 실행하지 않는다.
- 요점은, 이렇게 함으로써 불필요한 렌더링을 줄일 수 있게 되고 또한 코드의 취약성을 줄일 수 있게 된다는 것이다.