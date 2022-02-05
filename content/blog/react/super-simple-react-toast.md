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
