---
title: '초간단 React Toast 만들기'
date: 2022-02-05
category: 'React'
draft: false
---

## 개요

이전 프로젝트에서 [react-toastify](https://www.npmjs.com/package/react-toastify)라는 토스트 메시지 라이브러리를 사용한 적이 있는데, 이번 프로젝트에선 외부 라이브러리 대신 토스트 기능을 직접 구현해 보고 싶어서 조사를 하게 되었습니다.

우선 [ReactDOM.render](https://reactjs.org/docs/react-dom.html#render)를 이용하여 `<div id="root" />`가 아닌 `<div id="toast-root" />`에 메시지를 띄우기로 하였는데, 그 이유는

1. 부모 요소의 불필요한 css 속성을 물려받지 않을 수 있고
2. render를 사용하지 않고 일반적인 방식으로 메시지를 렌더링 한다면 Context API 등을 이용하여 토스트 메시지 정보를 관리하고 메시지를 렌더링 하는 부분 등 여러 가지를 만들어야 하는데, 이렇게 되면 앱 트리의 루트 부근에 컨텍스트 Wrapper 등이 추가되어 코드가 지저분해지고 상태 관리, 이펙트 관리 등에 어려움이 발생한다고 생각했습니다.

하지만 render를 이용하여 다른 root에 메시지를 렌더링한다면 `z-index`와 같은 스타일 관리의 용이성 및 메시지를 기존 트리의 상태와는 관계없이 독립적으로 생성할 수 있다는 점으로 인해 render를 사용하여 메시지를 렌더링하기로 하였습니다.

이때, 현재의 DOM root 바깥에 있는 root에 렌더링하는 방법은 ReactDOM.render 말고도 [React Portals](https://reactjs.org/docs/portals.html)를 이용할 수도 있습니다. 하지만 제가 원하는 방식은 `toast.success('success message')`와 같이 함수 호출을 통해 메시지를 렌더링하는 방식이기 때문에 portal 대신 render를 사용하기로 했습니다. 물론 render를 사용하면 render를 호출한 부모의 lifecycle과는 별개로 동작하므로 기존 트리의 Context 와 같은 부분에는 접근할 수 없다는 단점이 있습니다만 토스트 메시지를 렌더링하는 상황에선 별 상관없을 것이라 생각했습니다.

React portal과 render에 관해선 [이 블로그](https://jaeseokim.dev/React/React-Portal_Render%EC%9D%98_%EC%B0%A8%EC%9D%B4%EC%A0%90_%ED%99%9C%EC%9A%A9%EB%B0%A9%EC%95%88_%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0/#portal%EC%9D%98-%ED%99%9C%EC%9A%A9-%EB%B0%A9%EC%95%88)를 참고했습니다.

## 세팅

우선 타입스크립트 CRA를 이용하여 프로젝트를 생성한 다음, 현재 프로젝트에서 styled-components를 사용하고 있기 때문에 마찬가지로 라이브러리를 설치해주고 `index.html`과 `App.tsx`를 다음과 같이 작성해주었습니다:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
		<title>Super Simple React Toast</title>
	</head>
	<body>
		<div id="root"></div>
		<div id="toast-root"></div>
	</body>
</html>
```

```tsx
import { SyntheticEvent, useState } from 'react';
import { ThemeProvider, DefaultTheme } from 'styled-components';
import GlobalStyle from './GlobalStyle';

const lightTheme: DefaultTheme= {
  bgColor: '#F8F9FA'
}

const darkTheme: DefaultTheme = {
  bgColor: '#1A1C34'
}

function App() {
  const [messageText, setMessageText] = useState('');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  
  function handleChange(e: SyntheticEvent) {
    const target = e.target as HTMLInputElement;
    setMessageText(target.value);
  }

  function toggleTheme() {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  }

  return (
    <ThemeProvider theme={currentTheme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />
      <button type="button">success message</button>
      <button type="button">warning message</button>
      <button type="button">info message</button>
      <button type="button">error message</button>
      <br />
      <br />
      <input type="text" value={messageText} onChange={handleChange} placeholder="메시지 내용" />
      <br />
      <br />
      <button type="button" onClick={toggleTheme}>toggle theme</button>
    </ThemeProvider>
  );
}

export default App;
```

현재 앱의 theme을 토글하는 버튼과, 성공/경고/안내/에러 메시지를 띄우는 버튼 및 메시지 내용을 적는 input을 작성했습니다. theme 토글은 정상적으로 동작하지만 토스트 메시지와 관련된 기능은 아직 구현하지 않아 작동하지 않는 상태입니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/app_setting.gif" alt="앱 초기 설정 화면" />
</figure>

이제 기능을 구현해보도록 하겠습니다!

## Toast 객체 생성

우선 `Toast.tsx` 파일을 생성하고 아래와 같은 스켈레톤 코드를 작성하였습니다:

```tsx
// Toast.tsx

class Toast {
  success(message: string) {
    console.log(message);
  }
  warning(message: string) {
    console.log(message);
  }
  error(message: string) {
    console.log(message);
  }
  info(message: string) {
    console.log(message);
  }
}

export default new Toast();
```

그리고 `App.tsx`에서 위 파일을 import하고 각 버튼에 연결시켜 주었습니다:

```tsx
// App.tsx

// ...
import toast from './Toast';

// ...
<button type="button" onClick={() => toast.success(messageText)}>success message</button>
<button type="button" onClick={() => toast.warning(messageText)}>warning message</button>
<button type="button" onClick={() => toast.info(messageText)}>info message</button>
<button type="button" onClick={() => toast.error(messageText)}>error message</button>
```

현재 동작하는 모습은 아래와 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/toast_skeleton.gif" alt="Toast 스켈레톤 코드 동작" />
</figure>

이제 ReactDOM.render 메소드를 이용하여 `<div id="toast-root>`에 렌더링하도록 기능을 추가해보겠습니다.

우선 `Toast` 클래스의 `constructor`에 root 요소인 `<div id="toast-root>`를 잡는 코드를 추가하겠습니다. 이때 `toast-root` 요소가 존재함을 확신할 수 있으므로 타입스크립트의 assertion을 이용하여 타입을 고정시켜 주겠습니다:

```tsx
class Toast {
  #rootElem;
  constructor() {
    this.#rootElem = document.getElementById('toast-root') as HTMLElement;
  }
  // ...
```

그 다음 각 메소드에 아래와 같은 코드를 작성하겠습니다:

```tsx
  // ...
  success(message: string) {
    render(<p>{message}</p>, this.#rootElem);
  }
  warning(message: string) {
    render(<p>{message}</p>, this.#rootElem);
  }
  error(message: string) {
    render(<p>{message}</p>, this.#rootElem);
  }
  info(message: string) {
    render(<p>{message}</p>, this.#rootElem);
  }
```

현재 동작하는 모습은 다음과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/render_test.gif" alt="Toast 렌더링 테스트" />
</figure>

## Toast 컴포넌트 생성

이제 Toast 컴포넌트를 생성해보겠습니다:

```tsx
// components/ToastMessage.tsx
import * as Style from './styles';
import * as Icon from '../icons';

type MessageType = 'success' | 'warning' | 'error' | 'info';

interface Props {
  message: string;
  type: MessageType;
}

export default function ToastMessage({ message, type }: Props) {
  function getIcon() {
    if (type === 'success') return <Icon.Success />;
    if (type === 'warning') return <Icon.Warning />;
    if (type === 'error') return <Icon.Error />;
    if (type === 'info') return <Icon.Info />;
  }

  return (
    <Style.Container>
      <Style.IconContainer>{getIcon()}</Style.IconContainer>
      <Style.Message>{message}</Style.Message>
      <Style.CloseButton type="button">
        <Icon.Close />
      </Style.CloseButton>
    </Style.Container>
  );
}
```

```tsx
// components/styles.ts
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  padding: 1em;
`;

export const IconContainer = styled.div`
  & > svg {

  }
`;

export const Message = styled.p`
`;

export const CloseButton = styled.button``;
```

```tsx
// Toast.tsx
  // ...
  success(message: string) {
    render(<ToastMessage message={message} type="success" />, this.#rootElem);
  }

  warning(message: string) {
    render(<ToastMessage message={message} type="warning" />, this.#rootElem);
  }

  error(message: string) {
    render(<ToastMessage message={message} type="error" />, this.#rootElem);
  }
  
  info(message: string) {
    render(<ToastMessage message={message} type="info" />, this.#rootElem);
  }
```

현재 동작 화면은 다음과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/skeleton_message_component.gif" alt="Toast 메시지 컴포넌트 렌더링 테스트" />
</figure>

일단 현재까지 전반적인 기능은 잘 동작하므로, 각 메시지 타입별 스타일을 추가해봅시다. 전체 코드는 너무 길어서 일부만 적겠습니다:

```tsx
// components/styles.ts
export const Container = styled.div<Type>`
  display: flex;
  align-items: center;
  width: fit-content;
  min-height: 30px;
  border-radius: 5px 5px 0px 0px;
  padding: 0.7em;
  background-color: ${({ currentTheme, messageType }) => ToastTheme[currentTheme][messageType].backgroundColor};

  & > svg {
    fill: ${({ currentTheme, messageType }) => ToastTheme[currentTheme][messageType].color};
    margin-right: 0.5em;
  }
`;

 // ...
```

토스트 메시지는 styled-components의 [ThemeProvider](https://styled-components.com/docs/advanced#theming) 컨텍스트와는 다른 트리에 렌더링되므로 기본적으로 제공되는 `theme` prop을 사용할 수 없습니다. 따라서 토스트 메시지의 theme을 지원하기 위해 메시지를 호출하는 메서드의 API를 다음과 같이 수정하였습니다:

```tsx{3-4}
// Toast.tsx
  // ...
  success(message: string, theme: Theme = 'light') {
    render(<ToastMessage theme={theme} message={message} type="success" />, this.#rootElem);
  }
```

현재 동작 화면은 다음과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/style_test.gif" alt="Toast 메시지 스타일 테스트" />
</figure>

## Toast 메시지 여러개 띄우기 & 지우기

하지만 아직 토스트 메시지를 단 하나밖에 띄우지 못한다는 단점이 있습니다. 이를 해결하기 위해 우선 `Toast` 클래스에 메시지를 담을 `messages` 배열을 생성하고, `ToastMessage` 컴포넌트에 이 `messages` 배열을 넘기도록 수정하겠습니다 (`messages` 배열은 큐의 역할을 합니다). 그리고 이 `messages` 배열에는 각각의 메시지 데이터를 저장하는 객체를 `push` 합니다. 이제 여러 개의 메시지가 존재하므로 각 메시지를 구분할 `id` 속성도 추가하였습니다:

```tsx
// Toast.tsx
class Toast {
  // ...
  #messages: Message[];
  constructor() {
    this.#messages = [];
  }

  success(message: string, theme: Theme = 'light') {
    this.#messages.push({
      id: this.#messages.length,
      message,
      theme,
      type: 'success'
    });

    render(<ToastMessage messages={this.#messages} closeMessage={this.#closeMessage.bind(this)} />, this.#rootElem);
  }

  // ...
```

그리고 `ToastMessage` 컴포넌트를 아래와 같이 수정하였습니다:

```tsx
// ToastMessage.tsx
// ...
export default function ToastMessage({ messages, closeMessage }: Props) {
  // ...

  return (
    <>
      {messages.map(({ id, message, theme, type }) => (
        <Style.Container currentTheme={theme} messageType={type} key={id}>
          {getIcon(type)}
          <Style.Message currentTheme={theme} messageType={type}>{message}</Style.Message>
          <Style.CloseButton type="button" currentTheme={theme} messageType={type} onClick={() => closeMessage(id)}>
            <Icon.Close />
          </Style.CloseButton>
        </Style.Container>
      ))}
    </>
  );
}
```

또한 위에서 볼 수 있듯이 각 메시지를 지우는 함수인 `closeMessage` 메서드도 구현하여 `ToastMessage` 컴포넌트에 prop으로 넘깁니다:

```tsx
// Toast.tsx
class Toast {
  // ...
  #closeMessage(idToDelete: number) {
    const indexToDelete = this.#messages.findIndex(({ id }) => id === idToDelete);
    this.#messages.splice(indexToDelete, 1);
    render(<ToastMessage messages={this.#messages} closeMessage={this.#closeMessage.bind(this)} />, this.#rootElem);
  }

  // ...
```

이렇게 해서 구현된 동작은 다음과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/multiple_messages.gif" alt="메시지 여러 개 띄우기 및 지우기 테스트" />
</figure>

## 일정시간 이후 자동으로 메시지 삭제 구현

이제 `setTimeout` 함수를 이용하여 일정 시간 이후에 자동으로 메시지를 삭제하는 기능을 구현해보겠습니다:

```tsx
// Toast.tsx
class Toast {
  // ...
  #autoCloseMessage(duration: number, id: string) {
    setTimeout(() => {
      this.#closeMessage(id);
    }, duration, this);
  }
```

이때, 이전에 구현한 코드에선 각 메시지 객체의 `id`를 배열의 인덱스로 했었습니다. 하지만 이렇게 하니까 메시지를 마구잡이로 띄웠을때 메시지들이 제대로 사라지지 않는 버그가 있어서 각 메시지 객체의 `id` 값으로 `uuid`를 이용하기로 했습니다:

```tsx{4}
class Toast {
  // ...
  success(message: string, theme: Theme = 'light', duration = this.#defaultDuration) {
    const id = uuid();
    this.#messages.push({
      id,
      message,
      theme,
      type: 'success'
    });

    render(<ToastMessage messages={this.#messages} closeMessage={this.#closeMessage.bind(this)} />, this.#rootElem);
    this.#autoCloseMessage(duration, id);
  }
}
```

또한, 메시지의 `duration`을 시각적으로 알려주는 `progressBar`도 추가하였습니다:

```tsx{9}
// ToastMessage.tsx
// ...
<Style.Container currentTheme={theme} messageType={type} key={id}>
  {getIcon(type)}
  <Style.Message currentTheme={theme} messageType={type}>{message}</Style.Message>
  <Style.CloseButton type="button" currentTheme={theme} messageType={type} onClick={() => closeMessage(id)}>
    <Icon.Close />
  </Style.CloseButton>
  <Style.ProgressBar currentTheme={theme} messageType={type} duration="3s" />
</Style.Container>
```

```tsx
// styles
export const ProgressBar = styled.div<ProgressBarProps>`
  position: absolute;
  left: 0;
  bottom: 0;
  height: 5px;
  background-color: ${({ currentTheme, messageType }) => ToastTheme[currentTheme][messageType].progressBarColor};
  animation: progressBar ${({ duration }) => duration} linear;

  @keyframes progressBar {
    0% {
      width: 100%;
    }
    100% {
      width: 0%;
    }
  }
`;
```

이로써 구현된 동작은 다음과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/auto_delete.gif" alt="메시지 자동 삭제 기능 테스트" />
</figure>

## 메시지 위치 지정 기능 구현하기

이번에는 토스트 메시지가 표시될 위치를 지정할 수 있도록 해보겠습니다. 일단은 화면의 왼쪽상·하단, 오른쪽상·하단에 위치할 수 있도록 하고, 이외의 위치는 추후에 구현하겠습니다:

```tsx
// styles.ts
const positions: ToastPositions = {
  topLeft: {
    top: '12px',
    left: '12px',
  },
  topRight: {
    top: '12px',
    right: '12px'  
  },
  bottomLeft: {
    bottom: '12px',
    left: '12px',
  },
  bottomRight: {
    bottom: '12px',
    right: '12px'  
  },
};

export const Container = styled.div<ToastContainerProps>`
  position: absolute;
  z-index: 999;
  top: ${({ position }) => positions[position].top};
  bottom: ${({ position }) => positions[position].bottom};
  left: ${({ position }) => positions[position].left};
  right: ${({ position }) => positions[position].right};
  
  ...
```

이렇게 외부로부터 렌더링 위치를 prop으로 전달받도록 하였습니다:

```tsx{3,11}
// Toast.tsx
  // ...
  success(message: string, theme: Theme = 'light', position: ToastPosition = "topLeft", duration = this.#defaultDuration) {
    const id = uuid();
    this.#messages.push({
      id,
      message,
      theme,
      type: 'success',
      duration,
      position
    });
  }
```

그리고 root 컨테이너들의 스타일도 다음과 같이 수정하여 stacking context를 알맞게 생성하도록 했습니다:

```html
<!-- index.html -->
<body>
	<div id="toast-root"></div>
	<div id="root"></div>
</body>
```

```css
/* GlobalStyle.tsx */
  /* ... */
  #root {
    position: relative;
  }

  #toast-root {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
```

여기까지 구현된 동작은 다음과 같습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/positions.gif" alt="메시지 위치 테스트" />
</figure>

## ...라고 할뻔 했으나

하지만 위와 같이 각 토스트 메시지별로 위치를 입력받게되면 각 메시지들의 좌표를 계산하는 것이 어려워서 아래와 같이 토스트 메시지들을 표시하는 컨테이너를 만들고 해당 컨테이너의 위치만 수정하도록 하였습니다:

```tsx{3}
// ToastMessage.tsx
  return (
    <Style.ToastContainer position={position}>
      {messages.map(({ id, message, theme, type, duration }) => (
        <Style.Toast currentTheme={theme} messageType={type} key={id}>
    ...
```

```tsx
// styles.tsx
export const ToastContainer = styled.div<ToastContainerProps>`
  position: absolute;
  z-index: 999;
  top: ${({ position }) => positions[position].top};
  bottom: ${({ position }) => positions[position].bottom};
  left: ${({ position }) => positions[position].left};
  right: ${({ position }) => positions[position].right};
`;
```

```tsx{3,12}
class Toast {
  // ...
  #position: ToastPosition;
  constructor(position: ToastPosition = 'topLeft') {
    // ...
    this.#position = position;
  }

  // ...
}

export default new Toast("topRight");
```

동작:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/positions_2.gif" alt="메시지 위치 테스트 2" />
</figure>

그리고 각 토스트 메시지의 간격을 조정하면 다음과 같게 됩니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/positions_3.gif" alt="메시지 위치 테스트 최종" />
</figure>

## 애니메이션 적용

마지막으로, [react-toastify](https://github.com/fkhadra/react-toastify/blob/master/scss/animations/_flip.scss)에 있는것을 이용하여 메시지가 나타날 때 애니메이션을 적용해보았습니다:

<figure>
    <img src="https://cdn.jsdelivr.net/gh/jaehyeon48/jaehyeon48.github.io@master/assets/images/react/super-simple-react-toast/animation.gif" alt="메시지 애니메이션" />
</figure>

하지만 메시지가 사라질때 애니메이션을 어떻게 적용하는지는 아직 모르겠습니다 😂 좀 더 알아봐야겠습니다
