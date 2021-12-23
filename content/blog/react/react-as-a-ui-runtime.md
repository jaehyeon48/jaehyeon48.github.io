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

## 상태 (State)

- 호스트 객체는 포커스, 선택, 입력과 같은 모든 종류의 지역 상태를 가질 수 있다. 우리는 동일한 UI를 업데이트할 때 이러한 지역 상태들을 유지하고자 하고, (`<SignupForm>`에서 `<MessengerChat>`으로 이동하는 것과 같이) 다른 UI로 변경할 때 상태들을 (예측대로) 날려버리길 원한다.
- React 컴포넌트는 자체적으로 이렇게나 유용한 지역 상태를 가질 수 있다. 컴포넌트는 본질적으로 일반적인 함수이지만, React를 통해 UI에 유용한 상태들을 컴포넌트와 결합할 수 있다.
- 우리는 이것을 **훅(Hooks)** 이라고 부른다. 예를 들면, `useState`는 hook이다.

```jsx{2,6-7}
function Example() {
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

- `useState`는 현재 상태와 상태를 업데이트 하는 함수로 구성된 쌍(pair)를 반환한다. [Array destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#array_destructuring)을 통해 `useState`가 반환하는 상태와 업데이트 함수의 이름을 지정할 수 있다.
- `useState`를 비롯한 다른 여러가지 hook들은 [React 공식 문서](https://reactjs.org/docs/hooks-intro.html)에서 더 자세히 살펴볼 수 있다.

## 일관성 (Consistency)

- 재조정 과정을 [non-blocking](https://www.youtube.com/watch?v=mDdgfyRB5kg)한 작업들로 분할하여 수행한다고 하더라도, 여전히 단일 동기 흐름(single synchronous swoop)에 호스트 트리 연산을 수행해야만 한다. 이렇게 하면 사용자가 만들어지다 만 UI를 안 볼 수 있게끔 할 수 있고, 사용자가 볼 필요 없는 (어떤 UI를 완성하는 과정의) 중간 상태에 대한 불필요한 레이아웃 작업과 스타일 계산을 수행하지 않아도 된다.
- 이러한 이유로, React는 모든 작업을 "렌더링 단계"와 "커밋 단계"로 나눈다. **렌더링 단계**에선 React가 컴포넌트를 호출하여 재조정을 수행하는데, 단계 중간에 방해를 받아도 안전하고 [추후엔](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) 비동기적으로 수행될 예정이다. **커밋 단계**는 React가 호스트 트리를 조작하는 단계로, 항상 동기적으로 수행된다.

## 메모이제이션 (Memoization)

- 부모 요소가 `setState`를 호출하여 업데이트를 예약하면 기본적으로 React는 해당 요소의 자식 트리 전체를 재조정한다. 이는 React로선 부모 요소의 업데이트가 자식 요소들에게 영향을 미칠지 안 미칠지 알 수 없기 때문에, 일관성을 위해 하위의 자식 트리 전체를 업데이트하는 것이다. 얼핏 보기엔 굉장히 비용이 클 것 같지만 중소형 하위 트리에 대해선 별문제가 되지 않는다.
- 트리가 너무 깊어지거나 너무 넓어지면 React로 하여금 하위 트리를 [memoize](https://en.wikipedia.org/wiki/Memoization)하여 얕은 prop 비교를 할 때 직전에 렌더링한 트리를 재사용하도록 할 수 있다:

```jsx{5}
function Row({ item }) {
  // ...
}

export default React.memo(Row);
```

- 이렇게 하면 부모 컴포넌트인 `<Table>`에 있는 `setState`는 직전에 렌더링한 `item`과 현재의 `item`이 (참조 비교를 통해) 같은 `Row` 컴포넌트에 대한 재조정은 건너뛰게 된다.
- [useMemo() Hook](https://reactjs.org/docs/hooks-reference.html#usememo)을 사용하면 개별 표현식 수준에서 메모이제이션을 사용할 수 있다. `useMemo()`를 통해 저장된 캐시는 해당 컴포넌트 트리에 국한되며 로컬 상태가 파괴될 때 같이 사라지고, 오직 마지막 항목만을 저장한다.
- React는 기본적으로 컴포넌트를 메모이제이션 하지 않는다. 대부분의 컴포넌트는 매번 서로 다른 prop을 전달받기 때문에 메모이제이션을 (기본적으로) 사용하게 되면 이전의 값과 비교하는 연산의 양이 많아져서 비용이 커질 수 있다.

## 가공되지 않은 모델 (Raw Models)

- 아이러니하게도 "React"는 세밀한 업데이트를 위해 "reactive"한 시스템을 사용하지 않는다. 다시 말해, 상위 요소가 업데이트되면 변경에 영향을 받은 컴포넌트들만 업데이트하는 것이 아니라 재조정을 발생시킨다는 것이다 (즉, 하위의 컴포넌트까지 다시 업데이트된다는 뜻?).
- 이는 의도적으로 React를 이렇게 설계한 것이다. 웹 애플리케이션에서 [TTI](https://calibreapp.com/blog/time-to-interactive)는 중요한 측정 지표 중 하나이고, 모델을 순회하면서 세세하게 listener를 설정하게 되면 TTI가 커지게 된다. 게다가 많은 앱에서 상호작용은 작은 변화(버튼 hover)부터 큰 변화(페이지 이동)까지 많은 변화를 발생시키는 경향이 있는데, 이 경우 세세한 단위의 구독은 메모리를 낭비하게 된다 (즉, 세밀한 변화를 감지하는 listener들이 많아지면 메모리가 더 많이 사용된다?).
- React의 핵심 설계 원칙 중 하나는 바로 React가 가공되지 않은 데이터(raw data)를 사용한다는 점이다. 네트워크를 통해 자바스크립트 객체를 받았을 때, 어떠한 전처리를 하지 않고 바로 컴포넌트에 객체를 전달할 수 있다. 접근할 수 있는 속성이 무엇인지 딱히 걱정할 필요가 없으며, (데이터의) 구조가 살짝 변경되어도 성능에 영향을 미치지 않는다.
- React 렌더링은 O(모델(데이터)의 크기)가 아니라 O(view의 크기)의 복잡도를 가지며, [windowing](https://react-window.vercel.app/#/examples/list/fixed-size)을 통해 view의 크기를 크게 줄일 수 있다.
- 물론 주식 애플리케이션과 같이 세밀한 구독이 더 도움되는 경우도 존재한다. 이는 드물게 볼 수 있는 "모든것이 동시에, 끊임없이 업데이트 된다"의 한 예시이다. [Imperative escape hatch](https://stackoverflow.com/questions/56051973/what-is-an-imperative-escape-hatch/56052388)를 통해 이러한 애플리케이션을 최적화할 수 있지만, React가 이러한 유스 케이스에 적합하지 않을 수 있다. 하지만 여전히 자신만의 세밀한 구독 시스템을 React 위에 구현할 수 있다.
- **세밀한 구독 시스템과 반응형 시스템으로도 해결할 수 없는 성능 이슈**가 존재한다. 예를 들면 브라우저를 blocking 하지 않고 (매 페이지 이동마다 발생하는) 새로운 깊은 트리를 렌더링 하는 경우가 있을 수 있다. 변경 사항을 추적하는 것은 오히려 구독을 설정하기 위해 더 많은 작업을 수행해야 해서 더 느려질 수 있다.
- 또 다른 문제는 view 렌더링을 시작하기 전에 데이터를 기다려야 하는 상황이다. React에서는 이러한 두 가지 문제를 [Concurrent Rendering](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)를 통해 해결하려고 한다.

## 배치 작업 (Batching)

- 여러 컴포넌트가 같은 이벤트에 대한 응답으로 상태를 변경하고자 하는 경우가 있을 수 있다. 아래의 일반적인 예시를 살펴보자:

```jsx{4, 14}
function Parent() {
  let [count, setCount] = useState(0);
  return (
    <div onClick={() => setCount(count + 1)}>
      Parent clicked {count} times
      <Child />
    </div>
  );
}

function Child() {
  let [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Child clicked {count} times
    </button>
  );
}
```

- 이벤트가 전파(dispatch)되면 `Child`의 `onClick`이 먼저 실행되고, 그 다음 `Parent`의 `onClick`이 실행된다. 만약 `setState`가 호출되는 즉시 컴포넌트를 리렌더링 하게 되면 다음과 같이 `Child`가 (불필요하게) 두 번 렌더링되는 상황이 발생할 수 있다:

```js{4, 8}
/* React의 브라우저 클릭 이벤트 핸들러 내부 진입 */
Child(onClick)
  // setState
  // "Child 리렌더링" // 😞 불필요하다!
Parent(onClick)
  // setState
  // "Parent 리렌더링"
  // "Child 리렌더링"
/* React의 브라우저 클릭 이벤트 핸들러를 빠져나감 */
```

- 여기서 `Child` 첫 번째 렌더링은 불필요한 낭비이다. 그리고  `Parent`의 상태 변경으로 인해 `Child`가 다시 렌더링 되는 것이므로 React 보고 `Child`의 두 번째 렌더링을 건너뛰라고 할 수도 없다.
- 이러한 이유로 React가 이벤트 핸들러 내에서 업데이트를 일괄적으로 처리하는 이유이다:

```js
/* React의 브라우저 클릭 이벤트 핸들러 내부 진입 */
Child(onClick)
  // setState
Parent(onClick)
  // setState
  // 상태 업데이트 처리
  // "Parent 리렌더링"
  // "Child 리렌더링"
/* React의 브라우저 클릭 이벤트 핸들러를 빠져나감 */
```

- 컴포넌트 내의 `setState`를 호출한다고 해서 즉각적으로 리렌더링이 발생하지 않는다. 대신, React는 우선 모든 이벤트 핸들러를 실행한 다음 모든 변경사항을 한꺼번에 반영하여 한 번만 리렌더링 한다.
- 일괄 처리는 성능 측면에선 좋지만, 다음과 같이 코드를 작성한다면 문제가 될 수도 있다 [예제](https://codesandbox.io/s/react-batch-wrong-example-rzvkz?file=/src/App.js):

```js
const [count, setCount] = useState(0);

function increment() {
  setCount(count + 1);
}

function handleClick() {
  increment();
  increment();
  increment();
}
```

- `count`가 `0`일 때 `handleClick` 함수를 호출하면 결과적으로 세 개의 `setCount(1)`을 호출하는 것이나 다름없다. 따라서 `count`의 값이 `0`에서 `3`이 되는 것이 아니라 `1`이 된다.
- 이 문제를 해결하려면 다음과 같이 `setState`에서 제공하는 "updater" 함수를 사용하면 된다 [예제](https://codesandbox.io/s/react-batch-proper-example-gy9de?file=/src/App.js):

```js
const [count, setCount] = useState(0);

function increment() {
  setCount(c => c + 1);
}

function handleClick() {
  increment();
  increment();
  increment();
}
```

- 위와 같이 `setState`의 updater 함수를 사용하면 React는 updater 함수를 큐에 저장해놓고 이후에 차례로 하나씩 실행한다. 위 예제에선 정상적으로 `count`의 값이 `3`씩 증가함을 알 수 있다.
- 복잡한 상태 로직의 경우, `useState` 대신 [useReducer hook](https://reactjs.org/docs/hooks-reference.html#usereducer)을 사용하는 것을 추천한다:

```jsx
// "action" 인자는 무엇이든 될 수 있지만 일반적으로 객체가 많이 사용된다.
const [counter, dispatch] = useReducer((state, action) => {
  if (action === 'increment') {
    return state + 1;
  } else {
    return state;
  }
}, 0);

function handleClick() {
  dispatch('increment');
  dispatch('increment');
  dispatch('increment');
}
```

## 호출 트리 (Call Tree)

- 프로그래밍 언어 런타임 환경은 일반적으로 호출 스택(call stack)을 가지고 있다. 여러 함수들을 호출하면 호출 스택에 함수들의 호출 순서를 기록하여 현재의 위치와 다음에 실행될 코드를 추적한다.
- 물론 React는 자바스크립트로 동작하므로 (애초에 React는 "자바스크립트 라이브러리"다!) 자바스크립트의 규칙을 따른다. 하지만 React는 예를 들어 `[App, Page, Layout, Article(→ 현재 렌더링 하는 부분!)]`와 같이 현재 어떤 컴포넌트를 렌더링 하고 있는지 추적하기 위해 내부적으로 자체적인 호출 스택을 가지고 있다.
- React는 UI 트리를 렌더링 하는 것이 주 목적임을 다시 한번 상기하자. 이 트리들은 상호 작용을 위해 계속해서 "살아 있어야 한다". 우리가 처음으로 `ReactDOM.render()`를 호출한 이후에도 DOM은 사라지지 않는다.
- 다소 은유적인 표현이지만, 나는 React 컴포넌트들이 "호출 스택"이 아니라 "호출 트리" 내부에 있다고 생각한다. `Article` 컴포넌트의 렌더링이 끝나도 `Article`의 React "호출 트리" 프레임은 파괴되지 않고 남아있다. 우리는 해당 호스트 객체의 지역 상태와 참조를 [어딘가](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7)에 저장해 두어야 한다.
- 재조정 규칙에 의에 필요한 경우에만 지역 상태, 호스트 객체와 함께 "호출 트리" 프레임이 제거된다. 이때, 이러한 호출 트리 프레임을 흔히 [Fiber](https://en.wikipedia.org/wiki/Fiber_(computer_science))라고 부른다.
- Fiber는 지역 상태들이 실제로 "살아 있는" 곳이다. 상태가 업데이트되면 React는 해당 Fiber와 그 자식들을 "재조정 대상"으로 표시해놓고, 해당 Fiber와 연관된 컴포넌트들을 호출한다.

## 컨텍스트 (Context)

- React에선 데이터를 하위 컴포넌트로 전달할 때 props의 형태로 전달한다. 색상 테마와 같이, 때로는 대부분의 컴포넌트가 동일한 상태를 필요로 하는 경우가 있다. 이때 이러한 상태를 일일이 전달하는 것은 매우 번거로울 수 있다.
- 하지만 이러한 문제를 [Context](https://reactjs.org/docs/context.html)로 해결할 수 있다. 이는 본질적으로 컴포넌트를 위한 [동적 스코핑](http://wiki.c2.com/?DynamicScoping)이라고 할 수 있다. 이는 마치 웜홀처럼 위에 데이터를 놓으면 그 아래에 있는 모든 자식들이 그 데이터를 참조할 수 있게 되고, 데이터가 변경되면 그에 따라 다시 리렌더링 된다.

```jsx
const ThemeContext = React.createContext(
  'light' // Default value
);

function DarkApp() {
  return (
    <ThemeContext.Provider value="dark">
      <MyComponents />
    </ThemeContext.Provider>
  );
}

function SomeDeeplyNestedChild() {
  const theme = useContext(ThemeContext);
}
```

- 위 코드에서, `SomeDeeplyNestedChild`가 렌더링 될 때 `useContext(ThemeContext)`는 **트리 상에서 가장 가까운** `<ThemeContext.Provider>`를 찾아 해당 컨텍스트의 데이터를 사용하게 된다. (실제로는 React가 렌더링 하는 과정에서 context 스택을 관리한다.)
- 만약 `ThemeContext.Provider`가 존재하지 않는다면 `useContext(ThemeContext)`의 값은 `createContext()`를 호출할 때 명시했던 기본 값이 된다 (여기서는 `light`가 될 것이다!)

## 이펙트 (Effects)

- 앞서 React 컴포넌트는 관찰할 수 있는 side effect를 가지면 안된다고 하였다. 하지만 포커스를 관리하거나, 캔버스에 그리거나, 데이터를 구독하는 등 때로는 side effect가 필요한 경우가 있다.
- React에서 이러한 일들은 effect를 이용하여 해결할 수 있다:

```jsx{4-6}
function Example() {
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

- React는 가능한 한 브라우저가 화면을 리페인트 할 때까지 effect 실행을 연기한다. 이러한 방식은 데이터 구독과 같은 일들이 TTI와 [FMP](https://web.dev/first-meaningful-paint/)에 영향을 주지 않기 때문에 좋다.
- Effect는 단 한 번만 실행되는 것이 아니라, 컴포넌트가 제일 처음에 유저에게 보여졌을 때(즉 제일 처음으로 렌더링 되었을 때), 그리고 업데이트 때마다 실행된다. 또, effect는 클로저를 사용하여 (위 예제에서의 `count`와 같이) 현재의 props와 상태를 참조할 수 있다.
- Effect에서 구독과 같은 작업을 수행하는 경우, cleanup 작업을 필요로 할 수도 있다. Cleanup 작업을 하기 위해 effect는 다음과 같이 함수를 반환할 수 있다:

```js
useEffect(() => {
  DataSource.addSubscription(handleChange);
  return () => DataSource.removeSubscription(handleChange);
});
```

- 이렇게 cleanup을 위해 effect가 함수를 반환하게 되면 React는 반환된 함수를 다음번 effect를 실행하기 직전, 그리고 컴포넌트가 제거될 때 실행한다.
- 때로는 매 렌더링마다 effect를 실행하는것이 좋지 않을때가 있다. 이 경우 다음과 같이 [특정 상태가 변한 경우에만](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects) effect를 실행하도록 할 수 있다:

```js
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]);
```

- 하지만 만약 자바스크립트 클로저에 익숙하지 않다면 성급한 최적화 문제가 발생할 수 있다. 예를 들면 다음의 코드는 버그가 발생할 가능성이 높다:

```js
useEffect(() => {
  DataSource.addSubscription(handleChange);
  return () => DataSource.removeSubscription(handleChange);
}, []);
```

- 위 코드에서 `[]`는 "이 effect를 다시 실행하지 마"라고 하는 것과 같다. 하지만 effect에선 effect 외부에 선언된 `handleChange`를 (클로저를 이용하여) 사용(close over)하고 있고, `handleChange`에선 다음과 같이 특정 prop 혹은 상태를 참조하고 있을 수 있다:

```js
function handleChange() {
  console.log(count);
}
```

- 이 경우 effect가 다시 실행되지 않도록 한다면 effect 내의 `handleChange`는 컴포넌트가 처음 렌더링될 때의 `count` 변수를 참조하고 있는 `handleChange` 함수를 가리키게 되고, 결과적으로 `count`의 값이 항상 초기값(이를 테면 `0`)으로 출력되게 될 것이다.
- 이 문제를 해결하기 위해선 함수를 포함하여 변할 수 있는 **모든** 것을 의존성 배열에 전부 포함해야 한다:

```js{4}
useEffect(() => {
  DataSource.addSubscription(handleChange);
  return () => DataSource.removeSubscription(handleChange);
}, [handleChange]);
```

- 코드에 따라서 `handleChange`가 매번 렌더링 될 때마다 달라지므로 불필요한 재구독(resubscription)이 발생할 수도 있다. 이 경우 [useCallback hook](https://reactjs.org/docs/hooks-reference.html#usecallback)을 사용할 수도 있고, 혹은 그냥 재구독되게끔 내버려 둘 수도 있다. 예를 들어 브라우저가 제공하는 `addEventListener` API는 엄청 빠르기 때문에, (불필요한 호출을 줄이려고) 성급하게 최적화했다가 오히려 성능이 더욱 나빠질 수 있다.

## 커스텀 훅 (Custom Hooks)

- `useState`, `useEffect`와 같은 hook들은 함수이기 때문에, 이들을 조합해서 직접 우리만의 hook을 만들 수 있다:

```jsx{2, 8}
function MyResponsiveComponent() {
  const width = useWindowWidth(); // 우리가 만든 커스텀 hook
  return (
    <p>Window width is {width}</p>
  );
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  return width;
}
```

- 이와 같이 커스텀 hook은 재사용 가능한 stateful 로직을 서로 다른 컴포넌트끼리 공유할 수 있게 해준다. 이때, 상태 자체는 공유되지 않으며, hook을 호출할 때마다 각자의 독립된 상태를 선언하게 된다. 커스텀 hook에 대해 더 자세히 알고 싶으면 [여기](https://reactjs.org/docs/hooks-custom.html)를 참조하라.

## Hook의 규칙 (Static Use Order)

- `useState`를 "React 상태 변수"를 선언하기 위한 문법으로 생각할 수도 있지만, (당연하게도) 문법이 아니다. 우리는 여전히 일반적인 자바스크립트를 프로그래밍 하고 있는 것이다. 하지만 우리는 현재 런타임으로서의 React를 살펴보고 있기 때문에, 그리고 React가 UI 트리를 구축하기 위해 자바스크립트를 사용하기 때문에 React의 기능들은 때로 (라이브러리가 아니라) 프로그래밍 언어의 영역에 더 가깝게 느껴질 때도 있다.
- 만약 `use`가 문법이라면 다음의 코드는 말이 될 것이다:

```jsx{3}
// 😉 실제 문법이 아니다!
component Example(props) {
  const [count, setCount] = use State(0);

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

- 만약 컴포넌트 바깥에 이를 선언하면 어떻게 될까?

```jsx
// 😉 실제 문법이 아니다!

// 무엇의 지역 상태일까..?
const [count, setCount] = use State(0);

component Example() {
  if (condition) {
    // 조건이 false라면 무슨 일이 일어날까?
    const [count, setCount] = use State(0);
  }

  function handleClick() {
    // 함수가 종료되면 무슨 일이 일어날까?
    // 일반적인 변수랑 뭐가 다를까?
    const [count, setCount] = use State(0);
  }
```

- React 상태는 컴포넌트와 컴포넌트 트리에 국한되는 지역 상태이다. 만약 `use`가 실제 문법이었다면 컴포넌트의 최상위 스코프로만 한정하는 것이 옳을 것이다:

```jsx
// 😉 실제 문법이 아니다!
component Example(props) {
  // 오직 여기서만(최상위 스코프) 유효하다!
  const [count, setCount] = use State(0);

  if (condition) {
    // syntax error 이어야 한다.
    const [count, setCount] = use State(0);
  }
```

- 이는 `import`가 모듈의 최상위 스코프에서만 동작하는 것과 비슷한 맥락이다.
- 물론 `use`는 실제 문법이 아니다. 만약 실제 문법이 된다고 해도 그에 따른 이득보단 문제가 더 많을 것이다.
- 하지만 React는 오직 컴포넌트의 최상위 스코프에서만, 그리고 조건이 없는 구문(unconditional) 에서만 hook을 호출한다고 생각한다. 이와 같은 [hook의 규칙](https://reactjs.org/docs/hooks-rules.html)들은 [linter 플러그인](https://www.npmjs.com/package/eslint-plugin-react-hooks)을 통해 강제할 수 있다.
- 실제로 이러한 설계에 대해선 논쟁이 있지만, 나는 실제로 이 규칙들이 사람들을 혼란스럽게 하는 경우를 보지 못했다. 또한 [일반적인 대안들이 왜 작동하지 않는지](https://overreacted.io/why-do-hooks-rely-on-call-order/)에 대한 포스트도 썼다.
- 내부적으로 hook들은 연결 리스트로 구현되어 있다. `useState`를 호출하면 우리는 연결 리스트 내의 포인터를 그다음 항목으로 옮긴다. 컴포넌트의 호출 트리 프레임을 나가는 경우엔 리스트를 다음 렌더링까지 저장한다.
- [이 글](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e)에선 hook이 내부적으로 어떻게 동작하는지에 대해 간단히 설명하고 있다. 연결 리스트 보단 배열이 더 이해하기 쉬울 것이다:

```js
// 수도코드
let hooks, i;
function useState() {
  i++;
  if (hooks[i]) {
    // 다음 렌더링
    return hooks[i];
  }
  // 최초 렌더링
  hooks.push(...);
}

// 렌더링 준비
i = -1;
hooks = fiber.hooks || [];
// 컴포넌트 호출
YourComponent();
// hook의 상태를 저장
fiber.hooks = hooks;
```

- (만약 실제 코드를 보고싶다면 [여기](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHooks.new.js)를 참조하라.)

## 더 알아볼 것들 (What's Left Out)

- 우리는 이 포스트에서 React 런타임 환경의 중요한 측면들을 거의 다 살펴보았다. 하지만 몇 가지 빠트린 것이 있는데, 이것들은 우리(React 개발 팀)에게 조차도 불명확한 것들이다.
- 현재 React는 부모가 렌더링 할 때 자식 정보가 필요한 멀티 패스 렌더링을 지원하지 않는다. 또한 현재로썬 아직 [에러 핸들링 API](https://reactjs.org/docs/error-boundaries.html)의 hook 버전이 없다. 이 두 가지 문제를 함께 해결할 수는 있을 것 같다.
- 현재 [동시성 모드](https://reactjs.org/docs/concurrent-mode-intro.html)는 실험 버전이고 [서스펜스](https://reactjs.org/docs/concurrent-mode-suspense.html)가 어떻게 이러한 큰 그림에 맞아 들어갈지에 대한 흥미로운 질문들도 많다. 아마 이러한 기능들이 더욱 견고해지고 서스펜스가 [지연 로딩](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactlazy-code-splitting-with-suspense) 이상의 기능을 하게 되면 이 포스트의 후속편을 작성할 것 같다.
- **나는 React가 성공할 수 있었던 이유는 우리가 앞에서 살펴봤던 주제들을 몰라도 많은 것을 할 수 있기 때문이라고 본다.** 재조정에서 사용하는 휴리스틱은 대부분의 상황에서 올바르게 동작한다. `key` 경고와 같이 잠재된 위험을 알려주는 경고 또한 마찬가지다.
- 만약 당신이 UI 라이브러리에 관심 있다면, 이 게시물을 통해 React가 어떻게 작동하는지 더 상세히 알게 되었길 바란다.