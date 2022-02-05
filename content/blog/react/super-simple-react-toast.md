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
