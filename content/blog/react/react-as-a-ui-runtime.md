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
);
```

- `ReactDOM.render(reactElement, domContainer)`라고 하는 것은 "React님, `domContainer` 호스트 트리를 `reactElement`와 같게 해주세요"라고 하는 것과 같다.
- React는 요소의 타입 (`reactElement.type`, 위 예시에서는 `'button'`)을 보고, ReactDOM 렌더러에게 해당 타입에 맞는 호스트 객체를 생성하고 프로퍼티를 설정하도록 요청한다:

```js{3-4,9-10}
// ReactDOM 렌더러 어딘가 (간략한 버전)
function createHostInstance(reactElement) {
  let domNode = document.createElement(reactElement.type);
  domNode.className = reactElement.props.className;
  return domNode;
}

// 현재 예시에 대해 React가 실질적으로 하는 동작은 다음과 같다:
let domNode = document.createElement('button');
domNode.className = 'blue';

domContainer.appendChild(domNode);
```
